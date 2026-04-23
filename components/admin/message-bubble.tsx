import { TYPE_BADGE } from "@/lib/constants"
import { ChatMessage } from "@/lib/schemas/playground-schemas"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface Props {
  msg: ChatMessage
  onReplay: (id: string) => void
}

function AudioBars({ color = 'text-emerald-400' }: { color?: string }) {
  return (
    <span className={cn('inline-flex items-end gap-0.5 h-4', color)}>
      {[6, 12, 8, 14, 6].map((h, i) => (
        <span
          key={i}
          className="w-0.75 rounded-sm bg-current"
          style={{
            height: `${h}px`,
            animation: `pg-bar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
    </span>
  )
}

function typeBadgeCls(type: string) {
  return TYPE_BADGE[type] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
}

function syntaxHighlight(obj: unknown): string {
  const raw = JSON.stringify(obj, null, 2)
  // Escape HTML first, then apply colour spans
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m))
        return /:$/.test(m)
          ? `<span class="pg-json-key">${m}</span>`
          : `<span class="pg-json-str">${m}</span>`
      if (/true|false/.test(m)) return `<span class="pg-json-bool">${m}</span>`
      if (/null/.test(m)) return `<span class="pg-json-null">${m}</span>`
      return `<span class="pg-json-num">${m}</span>`
    }
  )
}

function fmtBytes(n: number) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`
}


export default function MessageBubble(props: Props) {
  const badge = typeBadgeCls(props.msg.type)

  const dirLabel =
    props.msg.direction === 'sent' ? '→ SENT' :
    props.msg.direction === 'received' ? '← RECV' : '● SYS'

  const dirColor =
    props.msg.direction === 'sent' ? 'text-blue-400' :
    props.msg.direction === 'received' ? 'text-emerald-400' : 'text-orange-400'

  const alignCls =
    props.msg.direction === 'sent' ? 'self-end items-end' :
    props.msg.direction === 'received' ? 'self-start items-start' :
    'self-center items-center'

  const bodyBg =
    props.msg.type === 'error'
      ? 'bg-red-950/50 border-red-800/50 text-red-200'
    : props.msg.type === 'tool_call'
      ? 'bg-violet-950/50 border-violet-800/50 text-violet-100'
    : props.msg.direction === 'sent'
      ? 'bg-blue-950/40 border-blue-800/40 text-blue-100'
    : props.msg.direction === 'received'
      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-100'
    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300'

  return (
    <div className={cn('flex flex-col gap-1 max-w-[88%]', alignCls)}>
      {/* Meta */}
      <div className="flex items-center gap-1.5 px-0.5">
        <span className={cn('text-[10px] font-bold tracking-wide', dirColor)}>{dirLabel}</span>
        <span className={cn('text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full border', badge)}>
          {props.msg.type}
        </span>
        <span className="text-[10px] text-zinc-500">{props.msg.ts}</span>
      </div>

      {/* Body */}
      <div className={cn('rounded-lg px-3 py-2 font-mono text-xs leading-relaxed border', bodyBg)}>
        {/* System event text */}
        {props.msg.systemText && (
          <span className="text-zinc-300 block text-center">{props.msg.systemText}</span>
        )}

        {/* Audio sent */}
        {props.msg.isAudio && props.msg.audioDirection === 'sent' && (
          <div className="flex items-center gap-2">
            <AudioBars color="text-blue-400" />
            <span className="text-blue-300">🎤 PCM audio chunk — {fmtBytes(props.msg.audioBytes ?? 0)}</span>
          </div>
        )}

        {/* Audio received */}
        {props.msg.isAudio && props.msg.audioDirection === 'received' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AudioBars color="text-emerald-400" />
              <span className="text-emerald-300">
                🔊 PCM audio — {fmtBytes(props.msg.audioBytes ?? 0)}
                {props.msg.audioFrameCount && props.msg.audioFrameCount > 1
                  ? ` (${props.msg.audioFrameCount} frames)`
                  : ''}
              </span>
            </div>
            <button
              onClick={() => props.onReplay(props.msg.id)}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-400 hover:bg-emerald-800/60 transition-colors w-fit"
            >
              <Play className="w-2.5 h-2.5" /> Replay
            </button>
          </div>
        )}

        {/* JSON body */}
        {props.msg.json !== undefined && (
          <pre
            className="whitespace-pre-wrap wrap-break-word"
            dangerouslySetInnerHTML={{ __html: syntaxHighlight(props.msg.json) }}
          />
        )}
      </div>
    </div>
  )
}