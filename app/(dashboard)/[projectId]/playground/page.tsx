'use client'

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CLOSE_CODES } from '@/lib/constants'
import type {
  AudioSettings,
  ChatMessage,
  ConnSettings,
  ConnState,
} from '@/lib/schemas/playground-schemas'
import { cn } from '@/lib/utils'
import {
  Mic,
  MicOff,
  Send,
  Wifi,
  WifiOff,
  Trash2,
  Terminal,
  Radio,
  Zap,
  Loader2,
} from 'lucide-react'
import MessageBubble from '@/components/admin/message-bubble'

// ─────────────────────────────────────────────────────────────────
//  PCM AudioWorklet (runs in a dedicated audio thread)
// ─────────────────────────────────────────────────────────────────
const WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this._targetRate = (options.processorOptions || {}).targetSampleRate || 16000;
    this._chunkSize  = (options.processorOptions || {}).chunkSize || 1600;
    this._ratio      = sampleRate / this._targetRate;
    this._counter    = 0;
    this._buf        = [];
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      this._counter++;
      if (this._counter >= this._ratio) {
        this._counter -= this._ratio;
        const s = Math.max(-1, Math.min(1, ch[i]));
        this._buf.push(s < 0 ? s * 0x8000 : s * 0x7FFF);
        if (this._buf.length >= this._chunkSize) {
          this.port.postMessage({ pcm: new Int16Array(this._buf.splice(0, this._chunkSize)) });
        }
      }
    }
    return true;
  }
}
registerProcessor('factn-pcm-processor', PCMProcessor);
`

// ─────────────────────────────────────────────────────────────────
//  Utilities
// ─────────────────────────────────────────────────────────────────
function nowTs() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function fmtUptime(ms: number) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`
}

// ─────────────────────────────────────────────────────────────────
//  Playground page
// ─────────────────────────────────────────────────────────────────
export default function PlaygroundPage() {
  // WebSocket
  const wsRef = useRef<WebSocket | null>(null)
  const [connState, setConnState] = useState<ConnState>('disconnected')
  const [activeSessionId, setActiveSessionId] = useState('')

  // Uptime
  const connectedAtRef = useRef<number | null>(null)
  const uptimeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [uptime, setUptime] = useState('—')

  // Settings
  const [connSettings, setConnSettings] = useState<ConnSettings>({
    serverUrl: 'ws://localhost:8000',
    authType: 'api_key',
    authValue: '',
    sessionId: '',
  })
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    inputRate: 16000,
    outputRate: 24000,
    chunkSize: 1600,
    autoPlay: true,
    showInChat: true,
  })
  // Ref mirror for use in WS / worklet callbacks (avoid stale closure)
  const audioSettingsRef = useRef(audioSettings)
  useEffect(() => { audioSettingsRef.current = audioSettings }, [audioSettings])

  // Messages + stats
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [stats, setStats] = useState({ msgs: 0, audioSent: 0, audioRecv: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Text input
  const [textDraft, setTextDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Audio recording
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingRef = useRef(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const recordCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workletRef = useRef<AudioWorkletNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const levelAnimRef = useRef<number | null>(null)
  const chunkNumRef = useRef(0)

  // Audio playback
  const playCtxRef = useRef<AudioContext | null>(null)
  const playTimeRef = useRef(0)
  const audioBufsRef = useRef<Map<string, Int16Array>>(new Map())

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close()
      recordCtxRef.current?.close()
      playCtxRef.current?.close()
      if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current)
    }
  }, [])

  // Uptime helper
  const startUptime = useCallback(() => {
    if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current)
    connectedAtRef.current = Date.now()
    uptimeTimerRef.current = setInterval(() => {
      if (connectedAtRef.current)
        setUptime(fmtUptime(Date.now() - connectedAtRef.current))
    }, 1000)
  }, [])

  const stopUptime = useCallback(() => {
    if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current)
    connectedAtRef.current = null
    setUptime('—')
  }, [])

  // Stable message adder (only uses state setters — always stable)
  const addMsg = useCallback((msg: Omit<ChatMessage, 'id' | 'ts'>) => {
    const full: ChatMessage = {
      ...msg,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ts: nowTs(),
    }
    setMessages(prev => [...prev, full])
    setStats(prev => ({ ...prev, msgs: prev.msgs + 1 }))
    return full.id
  }, [])

  const addSystem = useCallback(
    (text: string) => addMsg({ direction: 'system', type: 'ws_event', systemText: text }),
    [addMsg]
  )

  // Audio playback
  const playPCM = useCallback((int16: Int16Array, immediate = false) => {
    try {
      if (!playCtxRef.current || playCtxRef.current.state === 'closed') {
        playCtxRef.current = new AudioContext({ sampleRate: audioSettingsRef.current.outputRate })
        playTimeRef.current = 0
      }
      const ctx = playCtxRef.current
      const f32 = new Float32Array(int16.length)
      for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768.0
      const buf = ctx.createBuffer(1, f32.length, ctx.sampleRate)
      buf.copyToChannel(f32, 0)
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.connect(ctx.destination)
      const now = ctx.currentTime
      if (immediate || playTimeRef.current < now) playTimeRef.current = now
      src.start(playTimeRef.current)
      playTimeRef.current += buf.duration
    } catch (e) {
      console.warn('[playground] playback error:', e)
    }
  }, [])

  const replayAudio = useCallback(
    (id: string) => {
      const data = audioBufsRef.current.get(id)
      if (data) playPCM(data, true)
    },
    [playPCM]
  )

  // Send helpers
  const sendRaw = useCallback(
    (obj: Record<string, unknown>) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
      wsRef.current.send(JSON.stringify(obj))
      addMsg({ direction: 'sent', type: String(obj.type ?? 'message'), json: obj })
    },
    [addMsg]
  )

  // Connect / disconnect
  const connect = useCallback(() => {
    if (connState === 'connected' || connState === 'connecting') {
      wsRef.current?.close(1000, 'Client disconnected')
      return
    }
    const { serverUrl, authType, authValue, sessionId } = connSettings
    const base = serverUrl.trim().replace(/\/$/, '')
    const params = new URLSearchParams()
    params.set(authType, authValue.trim())
    if (sessionId.trim()) params.set('session_id', sessionId.trim())
    const url = `${base}/v1/chat?${params}`

    setConnState('connecting')
    addSystem(`Connecting to ${url}`)

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws
    } catch (e) {
      setConnState('error')
      addSystem(`Failed to create WebSocket: ${(e as Error).message}`)
      return
    }

    ws.onopen = () => {
      setConnState('connected')
      startUptime()
      addSystem('WebSocket connected ✓')
    }

    ws.onmessage = (evt) => {
      if (evt.data instanceof ArrayBuffer) {
        // Binary → PCM audio
        const int16 = new Int16Array(evt.data)
        setStats(prev => ({ ...prev, audioRecv: prev.audioRecv + 1 }))
        if (audioSettingsRef.current.showInChat) {
          const id = addMsg({
            direction: 'received',
            type: 'audio_pcm',
            isAudio: true,
            audioDirection: 'received',
            audioBytes: evt.data.byteLength,
          })
          audioBufsRef.current.set(id, int16)
        }
        if (audioSettingsRef.current.autoPlay) playPCM(int16)
      } else {
        // Text → JSON
        let obj: unknown
        try { obj = JSON.parse(evt.data as string) } catch { obj = { raw: evt.data } }
        const type = (obj as Record<string, string>).type ?? 'unknown'
        if (type === 'session_ready') {
          const sid = (obj as Record<string, string>).session_id
          if (sid) setActiveSessionId(sid)
        }
        addMsg({ direction: 'received', type, json: obj })
      }
    }

    ws.onerror = () => {
      setConnState('error')
      addSystem('WebSocket error — check browser console')
    }

    ws.onclose = (evt) => {
      const reason = CLOSE_CODES[evt.code] ?? evt.reason ?? 'Connection closed'
      addSystem(`Disconnected — code ${evt.code}: ${reason}`)
      setConnState('disconnected')
      setActiveSessionId('')
      stopUptime()
      wsRef.current = null
    }
  }, [
    connState,
    connSettings,
    addMsg,
    addSystem,
    startUptime,
    stopUptime,
    playPCM,
  ])

  // Send text
  const sendText = useCallback(() => {
    const text = textDraft.trim()
    if (!text || connState !== 'connected') return
    setTextDraft('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    sendRaw({ type: 'text_input', text })
  }, [textDraft, connState, sendRaw])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return
    isRecordingRef.current = false
    setIsRecording(false)
    if (levelAnimRef.current) cancelAnimationFrame(levelAnimRef.current)
    setAudioLevel(0)
    workletRef.current?.disconnect()
    workletRef.current = null
    recordCtxRef.current?.close()
    recordCtxRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    chunkNumRef.current = 0
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const obj = { type: 'voice_end' }
      wsRef.current.send(JSON.stringify(obj))
      addMsg({ direction: 'sent', type: 'voice_end', json: obj })
    }
  }, [addMsg])

  // Start recording
  const startRecording = useCallback(async () => {
    if (isRecordingRef.current) return
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch (e) {
      addSystem(`Microphone access denied: ${(e as Error).message}`)
      return
    }

    const ctx = new AudioContext({ sampleRate: 48000 })
    recordCtxRef.current = ctx

    const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' })
    const blobUrl = URL.createObjectURL(blob)
    await ctx.audioWorklet.addModule(blobUrl)
    URL.revokeObjectURL(blobUrl)

    const { inputRate, chunkSize } = audioSettingsRef.current
    const source = ctx.createMediaStreamSource(stream)
    const worklet = new AudioWorkletNode(ctx, 'factn-pcm-processor', {
      processorOptions: { targetSampleRate: inputRate, chunkSize },
    })
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyserRef.current = analyser
    source.connect(analyser)
    source.connect(worklet)
    worklet.connect(ctx.destination)
    workletRef.current = worklet
    streamRef.current = stream

    worklet.port.onmessage = (e: MessageEvent) => {
      if (!isRecordingRef.current || wsRef.current?.readyState !== WebSocket.OPEN) return
      const pcm: Int16Array = e.data.pcm
      wsRef.current.send(pcm.buffer as ArrayBuffer)
      chunkNumRef.current++
      // Show one indicator per ~10 chunks to avoid flooding the chat
      if (chunkNumRef.current % 10 === 1 && audioSettingsRef.current.showInChat) {
        setStats(prev => ({ ...prev, audioSent: prev.audioSent + 1 }))
        addMsg({
          direction: 'sent',
          type: 'audio_chunk',
          isAudio: true,
          audioDirection: 'sent',
          audioBytes: pcm.byteLength * 10,
        })
      }
    }

    // Level meter animation
    const freqData = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      if (!isRecordingRef.current) return
      analyser.getByteFrequencyData(freqData)
      const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length
      setAudioLevel(Math.min(100, avg * 1.5))
      levelAnimRef.current = requestAnimationFrame(tick)
    }
    levelAnimRef.current = requestAnimationFrame(tick)

    isRecordingRef.current = true
    setIsRecording(true)

    // Send voice_start JSON (shown in chat)
    const startMsg = { type: 'voice_start' }
    wsRef.current.send(JSON.stringify(startMsg))
    addMsg({ direction: 'sent', type: 'voice_start', json: startMsg })
  }, [addMsg, addSystem])

  // Stop recording on mouse/touch up anywhere
  useEffect(() => {
    const up = () => { if (isRecordingRef.current) stopRecording() }
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [stopRecording])

  const onVoiceHoldStart = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    e?.preventDefault()
    void startRecording()
  }, [startRecording])

  // UI helpers
  const isConnected = connState === 'connected'

  const clearMessages = useCallback(() => {
    setMessages([])
    setStats({ msgs: 0, audioSent: 0, audioRecv: 0 })
    audioBufsRef.current.clear()
  }, [])

  // Render
  return (
    <>
      {/* Scoped CSS for JSON highlighting + audio bar animation */}
      <style>{`
        .pg-json-key  { color: #7dd3fc; }
        .pg-json-str  { color: #86efac; }
        .pg-json-num  { color: #fbbf24; }
        .pg-json-bool { color: #c084fc; }
        .pg-json-null { color: #71717a; }
        @keyframes pg-bar { to { height: 3px; } }
      `}</style>

      <div
        className="flex overflow-hidden bg-zinc-950 text-zinc-100"
        style={{ height: 'calc(100svh - var(--header-height, 3.5rem))' }}
      >
        {/* ── Chat panel ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-zinc-800/80">

          {/* Chat header */}
          <div className="flex items-center justify-between px-4 h-11 bg-zinc-900/80 border-b border-zinc-800 shrink-0 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-semibold text-sm tracking-tight">WebSocket Playground</span>
              {activeSessionId && (
                <code className="hidden sm:block text-[10px] text-zinc-500 font-mono max-w-50 truncate">
                  sid: {activeSessionId}
                </code>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Connection indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className={cn('w-2 h-2 rounded-full shrink-0 transition-colors', {
                    'bg-zinc-600': connState === 'disconnected',
                    'bg-orange-400 animate-pulse': connState === 'connecting',
                    'bg-emerald-400': connState === 'connected',
                    'bg-red-400': connState === 'error',
                  })}
                />
                <span className="text-xs text-zinc-400 capitalize hidden sm:block">{connState}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="h-7 px-2 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600 select-none pointer-events-none">
                <Radio className="w-12 h-12 opacity-20" />
                <p className="text-sm text-center leading-loose">
                  Connect to the WebSocket to start.<br />
                  Every sent & received message appears here as <span className="font-mono text-zinc-500">raw JSON</span>.
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} onReplay={replayAudio} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-zinc-800 p-3 bg-zinc-900/60 shrink-0 space-y-2">
            {/* Text row */}
            <div className="flex gap-2 items-end">
              <button
                onMouseDown={onVoiceHoldStart}
                onTouchStart={onVoiceHoldStart}
                disabled={!isConnected}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold h-9.5 shrink-0',
                  'border select-none transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                  isRecording
                    ? 'bg-red-950/60 border-red-600 text-red-400 animate-pulse'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                )}
              >
                {isRecording
                  ? <MicOff className="w-3.5 h-3.5" />
                  : <Mic className="w-3.5 h-3.5" />
                }
                {isRecording ? 'Recording…' : 'Hold to Talk'}
              </button>

              <textarea
                ref={textareaRef}
                value={textDraft}
                onChange={e => {
                  setTextDraft(e.target.value)
                  e.currentTarget.style.height = 'auto'
                  e.currentTarget.style.height =
                    Math.min(120, e.currentTarget.scrollHeight) + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendText()
                  }
                }}
                disabled={!isConnected}
                placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-lg px-3 py-2 text-sm font-sans',
                  'bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600',
                  'outline-none focus:border-blue-500 transition-colors',
                  'min-h-9.5 max-h-30 leading-relaxed',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              />
              <Button
                size="sm"
                disabled={!isConnected || !textDraft.trim()}
                onClick={sendText}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9.5 px-3 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Level meter */}
            <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Right panel ────────────────────────────────────────── */}
        <aside className="w-72 shrink-0 bg-zinc-900/80 border-l border-zinc-800/80 overflow-y-auto flex flex-col text-sm">

          {/* Connection */}
          <section className="p-4 border-b border-zinc-800/80">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
              Connection
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Server URL</Label>
                <Input
                  value={connSettings.serverUrl}
                  onChange={e => setConnSettings(p => ({ ...p, serverUrl: e.target.value }))}
                  placeholder="ws://localhost:8000"
                  disabled={isConnected}
                  className="h-8 text-xs font-mono bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-blue-500"
                />
              </div>

              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Auth Type</Label>
                <div className="flex gap-2">
                  {(['api_key', 'token'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setConnSettings(p => ({ ...p, authType: t }))}
                      disabled={isConnected}
                      className={cn(
                        'flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        connSettings.authType === t
                          ? 'border-blue-500 bg-blue-950/60 text-blue-400'
                          : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                      )}
                    >
                      {t === 'api_key' ? 'API Key' : 'Token'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">
                  {connSettings.authType === 'api_key' ? 'API Key' : 'Ephemeral Token'}
                </Label>
                <Input
                  type="password"
                  value={connSettings.authValue}
                  onChange={e => setConnSettings(p => ({ ...p, authValue: e.target.value }))}
                  placeholder={connSettings.authType === 'api_key' ? 'pk_live_…' : 'token_…'}
                  disabled={isConnected}
                  className="h-8 text-xs font-mono bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-blue-500"
                />
              </div>

              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">
                  Session ID <span className="text-zinc-600">(optional)</span>
                </Label>
                <Input
                  value={connSettings.sessionId}
                  onChange={e => setConnSettings(p => ({ ...p, sessionId: e.target.value }))}
                  placeholder="auto-generated UUID"
                  disabled={isConnected}
                  className="h-8 text-xs font-mono bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-blue-500"
                />
              </div>

              <Button
                onClick={connect}
                disabled={connState === 'connecting'}
                className={cn(
                  'w-full h-9 text-sm font-semibold transition-all',
                  isConnected
                    ? 'bg-red-900/50 hover:bg-red-900/80 border border-red-700/60 text-red-300'
                    : connState === 'connecting'
                    ? 'bg-orange-900/50 border border-orange-700/60 text-orange-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                )}
              >
                {connState === 'connecting' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connecting…</>
                ) : isConnected ? (
                  <><WifiOff className="w-4 h-4 mr-2" />Disconnect</>
                ) : (
                  <><Wifi className="w-4 h-4 mr-2" />Connect</>
                )}
              </Button>
            </div>
          </section>

          {/* Session stats */}
          <section className="p-4 border-b border-zinc-800/80">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
              Session Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Messages', value: stats.msgs },
                { label: 'Audio Sent', value: stats.audioSent },
                { label: 'Audio Recv', value: stats.audioRecv },
                { label: 'Uptime', value: uptime },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-800/70 border border-zinc-700/60 rounded-lg p-2.5">
                  <div className="text-[9px] font-bold tracking-wider uppercase text-zinc-500 mb-1">{label}</div>
                  <div className="text-sm font-bold text-zinc-100 font-mono">{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="p-4 border-b border-zinc-800/80">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
              Quick Actions
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'Send voice_start', icon: '▶', payload: { type: 'voice_start' }, color: 'hover:text-emerald-400 hover:border-emerald-700 hover:bg-emerald-950/30' },
                { label: 'Send voice_end',   icon: '■', payload: { type: 'voice_end' },   color: 'hover:text-emerald-400 hover:border-emerald-700 hover:bg-emerald-950/30' },
              ].map(({ label, icon, payload, color }) => (
                <button
                  key={label}
                  disabled={!isConnected}
                  onClick={() => sendRaw(payload)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md',
                    'border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors text-left',
                    'disabled:opacity-40 disabled:cursor-not-allowed', color
                  )}
                >
                  <span className="w-4 text-center shrink-0">{icon}</span>
                  {label}
                </button>
              ))}

              <Separator className="bg-zinc-800 my-1" />

              {[
                { label: 'Speaker mode ON',  icon: '📢', payload: { type: 'set_speaker', enabled: true },  color: 'hover:text-violet-400 hover:border-violet-700 hover:bg-violet-950/30' },
                { label: 'Speaker mode OFF', icon: '🔇', payload: { type: 'set_speaker', enabled: false }, color: 'hover:text-violet-400 hover:border-violet-700 hover:bg-violet-950/30' },
              ].map(({ label, icon, payload, color }) => (
                <button
                  key={label}
                  disabled={!isConnected}
                  onClick={() => sendRaw(payload)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md',
                    'border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors text-left',
                    'disabled:opacity-40 disabled:cursor-not-allowed', color
                  )}
                >
                  <span className="w-4 text-center shrink-0">{icon}</span>
                  {label}
                </button>
              ))}

              <Separator className="bg-zinc-800 my-1" />

              <button
                disabled={!isConnected}
                onClick={() => sendRaw({ type: 'ping' })}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md',
                  'border border-zinc-700 bg-zinc-800/60 text-zinc-400 transition-colors text-left',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'hover:text-yellow-400 hover:border-yellow-700 hover:bg-yellow-950/30'
                )}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" /> Send ping
              </button>

              <button
                disabled={!isConnected}
                onClick={() => wsRef.current?.close(1000, 'Client disconnected')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md',
                  'border border-zinc-700 bg-red-950/20 text-red-500 transition-colors text-left',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'hover:border-red-600 hover:bg-red-950/40'
                )}
              >
                <span className="w-4 text-center shrink-0">✕</span> Disconnect
              </button>
            </div>
          </section>

          {/* Audio settings */}
          <section className="p-4 border-b border-zinc-800/80">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
              Audio Settings
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Auto-play received audio</Label>
                <Switch
                  checked={audioSettings.autoPlay}
                  onCheckedChange={v => setAudioSettings(p => ({ ...p, autoPlay: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-zinc-400">Show audio in chat</Label>
                <Switch
                  checked={audioSettings.showInChat}
                  onCheckedChange={v => setAudioSettings(p => ({ ...p, showInChat: v }))}
                />
              </div>

              <Separator className="bg-zinc-800" />

              {[
                { label: 'Input sample rate (Hz)', key: 'inputRate' as const, step: 1000, min: 8000, max: 48000 },
                { label: 'Output sample rate (Hz)', key: 'outputRate' as const, step: 1000, min: 8000, max: 48000 },
                { label: 'Chunk size (samples)', key: 'chunkSize' as const, step: 160, min: 160, max: 16000 },
              ].map(({ label, key, step, min, max }) => (
                <div key={key}>
                  <Label className="text-xs text-zinc-400 mb-1.5 block">{label}</Label>
                  <Input
                    type="number"
                    value={audioSettings[key]}
                    onChange={e => setAudioSettings(p => ({ ...p, [key]: Number(e.target.value) }))}
                    step={step}
                    min={min}
                    max={max}
                    className="h-7 text-xs font-mono bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Close codes reference */}
          <section className="p-4">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-zinc-500 mb-3">
              Close Codes
            </p>
            <div className="space-y-1.5">
              {Object.entries(CLOSE_CODES).map(([code, desc]) => (
                <div key={code} className="flex items-start gap-2 font-mono text-[11px] leading-snug">
                  <span className="text-red-400 shrink-0">{code}</span>
                  <span className="text-zinc-500">{desc}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  )
}
