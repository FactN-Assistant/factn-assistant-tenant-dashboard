"use client"

import { useEffect } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import {
  Mic,
  MicOff,
  Volume2,
  Activity,
  RotateCcw,
  Info,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GEMINI_VOICES, SUPPORTED_LANGUAGES, TONE_COLORS } from "@/lib/constants"
import { useProject } from "@/hooks/useProject"
import { VoiceFormValues } from "@/lib/schemas/project-schemas"

const DEFAULT_VALUES: VoiceFormValues = {
  voice_enabled: true,
  voice_name:    "Kore",
  language_code: "en-US",
  vad_mode:      "manual",
}

// ── Small helper ──────────────────────────────────────────────

function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-56 text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default function VoiceConfig() {
  const { selectedProject, isLoadingDetail, updateVoiceConfigMutation } = useProject()
  const isSaving = updateVoiceConfigMutation.isPending

  const { 
    control, handleSubmit, 
    watch, reset, formState: { isDirty } 
  } = useForm<VoiceFormValues>({ defaultValues: DEFAULT_VALUES })

  const voiceEnabled = watch("voice_enabled")
  const selectedVoice = watch("voice_name")
  const selectedVoiceTone = GEMINI_VOICES.find(v => v.name === selectedVoice)?.tone ?? ""

  // ── Load voice config from selected project ────────────────
  useEffect(() => {  
    console.log("selected Proj: ", selectedProject)
    if (selectedProject) {
      reset({
        voice_enabled: selectedProject.voice_config.enabled,
        voice_name: selectedProject.voice_config.voice_name,
        language_code: selectedProject.voice_config.language_code,
        vad_mode: selectedProject.vad_config.mode as "manual" | "auto",
      })
    }
  }, [selectedProject, reset])

  const onSubmit: SubmitHandler<VoiceFormValues> = (data: VoiceFormValues) => {
    if (!selectedProject) return

    const languageCode = data.language_code?.trim() || "en-US"

    updateVoiceConfigMutation.mutate({
      voice_name: data.voice_name,
      language_code: languageCode,
      enabled: data.voice_enabled,
      vad_mode: data.vad_mode,
    })
  }

  function handleReset() {
    if (selectedProject) {
      reset({
        voice_enabled: selectedProject.voice_config.enabled,
        voice_name: selectedProject.voice_config.voice_name,
        language_code: selectedProject.voice_config.language_code,
        vad_mode: selectedProject.vad_config.mode as "manual" | "auto",
      })
    }
  }

  if (isLoadingDetail) {
    return (
      <div className="m-10">
        <div className="text-center text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (!selectedProject) {
    return (
      <div className="m-10">
        <div className="text-center text-muted-foreground">No project selected</div>
      </div>
    )
  }

  return (
    <div className="m-10 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            Voice Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure the voice characteristics and input detection mode.
          </p>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 px-2"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button type="submit" form="vad-form" size="sm" className="h-10 px-5 bg-emerald-600 text-neutral-100 hover:bg-emerald-700" disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="vad-form">

        {/* ── Summary banner ────────────────────────────────── */}
        <Card className="bg-muted/30">
          <CardContent className="py-0 px-4">
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">Current configuration</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Voice output</span>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  enabled
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Voice</span>
                <span className="font-mono font-medium">{watch("voice_name")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Language</span>
                <span className="font-mono font-medium">{watch("language_code")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">VAD</span>
                <span className="font-mono font-medium">{watch("vad_mode")}</span>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* ── Voice Config card ─────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-muted-foreground" />
              Voice Output
            </CardTitle>
            <CardDescription className="text-xs">
              Choose the voice personality and language for audio responses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Enable toggle — always enabled (admin-controlled only) */}
            <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium cursor-default flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Voice output
                </Label>
                <p className="text-xs text-muted-foreground">
                  Voice output is always enabled. Users can toggle speaker mode on/off during sessions.
                </p>
              </div>
            </div>

            {/* Dimmed when disabled */}
            <div className={`space-y-5 transition-opacity duration-200 ${voiceEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>

              {/* Voice name */}
              <div className="space-y-2">
                <FieldLabel
                  label="Voice"
                  tooltip="The prebuilt Gemini voice persona used for all audio responses in this project."
                />
                <Controller
                  control={control}
                  name="voice_name"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!voiceEnabled || isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a voice…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">30 prebuilt voices</SelectLabel>
                          {GEMINI_VOICES.map((v) => (
                            <SelectItem key={v.name} value={v.name}>
                              <div className="flex items-center gap-2.5">
                                <span className="font-medium w-32 shrink-0">{v.name}</span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TONE_COLORS[v.tone] ?? ""}`}>
                                  {v.tone}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Language code */}
              <div className="space-y-2">
                <FieldLabel
                  label="Language"
                  tooltip="The primary language for voice output. Gemini also detects input language automatically — this sets the default output language."
                />
                <Controller
                  control={control}
                  name="language_code"
                  render={({ field }) => (
                    <Select value={selectedProject.voice_config.language_code} onValueChange={field.onChange} disabled={!voiceEnabled || isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a language…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectGroup>
                          <SelectLabel className="text-xs text-muted-foreground">{SUPPORTED_LANGUAGES.length} supported languages</SelectLabel>
                          {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2.5">
                                <span className="font-medium">{lang.name}</span>
                                <span className="font-mono text-[10px] text-muted-foreground">{lang.code}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Disabled notice */}
            {!voiceEnabled && (
              <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2.5">
                <MicOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Voice output is disabled. The assistant will only send text responses.
                </p>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ── VAD Config card ───────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Voice Activity Detection (VAD)
            </CardTitle>
            <CardDescription className="text-xs">
              Controls how the backend determines when a user starts and stops speaking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            <Controller
              control={control}
              name="vad_mode"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  {/* Manual */}
                  <button
                    type="button"
                    onClick={() => field.onChange("manual")}
                    disabled={isSaving}
                    className={`relative flex flex-col gap-1.5 rounded-lg border p-4 text-left transition-all hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed ${
                      field.value === "manual"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    {field.value === "manual" && (
                      <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-primary" />
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">Manual</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Recommended</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The backend drives <code className="text-[10px] bg-muted px-1 rounded">activity_start</code> and{" "}
                      <code className="text-[10px] bg-muted px-1 rounded">activity_end</code> signals based on
                      the client&apos;s <code className="text-[10px] bg-muted px-1 rounded">voice_start</code> /
                      <code className="text-[10px] bg-muted px-1 rounded">voice_end</code> frames.
                      Gives you full control over turn boundaries.
                    </p>
                  </button>

                  {/* Auto */}
                  <button
                    type="button"
                    onClick={() => field.onChange("auto")}
                    disabled={isSaving}
                    className={`relative flex flex-col gap-1.5 rounded-lg border p-4 text-left transition-all hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed ${
                      field.value === "auto"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    {field.value === "auto" && (
                      <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-primary" />
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">Auto</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Gemini&apos;s built-in VAD detects speech automatically.
                      Simpler to integrate but gives less control over
                      when turns begin and end.
                    </p>
                  </button>
                </div>
              )}
            />

          </CardContent>
        </Card>
      </form>
    </div>
  )
}
