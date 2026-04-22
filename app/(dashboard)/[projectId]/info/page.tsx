"use client"

import { useEffect } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Info, RotateCcw, Webhook, Globe, Cpu, Crown, ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useProject } from "@/hooks/useProject"
import { usePlans } from "@/hooks/usePlans"
import { type CreateProjectFormValues } from "@/lib/schemas/project-schemas"

const SUPPORTED_MODELS = [
  { value: "gemini-2.5-flash-native-audio-preview-12-2025", label: "Gemini 2.5 Flash (Native Audio)" },
  { value: "gemini-2.0-flash-live-001", label: "Gemini 2.0 Flash Live" },
]

const DEFAULT_VALUES: CreateProjectFormValues = {
  name: "",
  description: "",
  gemini_model: SUPPORTED_MODELS[0].value,
  webhook_url: "",
  webhook_secret: "",
  allowed_origins: "",
}

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

export default function ProjectInfo() {
  const { selectedProject, isLoadingDetail, updateProjectInfoMutation } = useProject()
  const { currentPlan, isLoadingCurrentPlan } = usePlans()
  const isSaving = updateProjectInfoMutation.isPending

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isDirty, errors },
  } = useForm<CreateProjectFormValues>({ defaultValues: DEFAULT_VALUES })

  // Load project data into form
  useEffect(() => {
    if (selectedProject) {
      reset({
        name: selectedProject.name,
        description: selectedProject.description,
        gemini_model: selectedProject.gemini_model,
        webhook_url: selectedProject.webhook_url ?? "",
        webhook_secret: "",
        allowed_origins: selectedProject.allowed_origins.join(", "),
      })
    }
  }, [selectedProject, reset])

  const onSubmit: SubmitHandler<CreateProjectFormValues> = (data) => {
    if (!selectedProject) return
    updateProjectInfoMutation.mutate(data)
  }

  function handleReset() {
    if (selectedProject) {
      reset({
        name: selectedProject.name,
        description: selectedProject.description,
        gemini_model: selectedProject.gemini_model,
        webhook_url: selectedProject.webhook_url ?? "",
        webhook_secret: "",
        allowed_origins: selectedProject.allowed_origins.join(", "),
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
            <Info className="h-5 w-5 text-muted-foreground" />
            Project Information
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and edit the general settings for this project.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <Button
            type="submit"
            form="project-info-form"
            size="sm"
            className="h-10 px-5 bg-emerald-600 text-neutral-100 hover:bg-emerald-700"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Plan card */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-muted-foreground" />
                Your Plan
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Current subscription tier and resource limits.
              </CardDescription>
            </div>
            {currentPlan && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold capitalize px-2.5 py-0.5">
                  {currentPlan.plan}
                </Badge>
                {currentPlan.plan !== "enterprise" && (
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                    Upgrade
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCurrentPlan ? (
            <p className="text-sm text-muted-foreground">Loading plan details...</p>
          ) : currentPlan ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Max projects</p>
                <p className="text-sm font-medium">{currentPlan.limits.projects ?? "Unlimited"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Tools per project</p>
                <p className="text-sm font-medium">{currentPlan.limits.tools_per_project ?? "Unlimited"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Concurrent sessions</p>
                <p className="text-sm font-medium">{currentPlan.limits.concurrent_sessions ?? "Unlimited"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Session TTL</p>
                <p className="text-sm font-medium">{currentPlan.limits.session_ttl_seconds}s</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Daily token quota</p>
                <p className="text-sm font-medium">{currentPlan.limits.daily_token_quota?.toLocaleString() ?? "Unlimited"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Webhook timeout</p>
                <p className="text-sm font-medium">{currentPlan.limits.webhook_timeout_ms.toLocaleString()}ms</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Rate limit</p>
                <p className="text-sm font-medium">{currentPlan.limits.rate_limit_rpm ?? "Unlimited"} rpm</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load plan details.</p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="project-info-form">

        {/* General card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              General
            </CardTitle>
            <CardDescription className="text-xs">
              Basic project identity and model selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Name */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Project name"
                tooltip="A human-readable name for this project. Shown in the dashboard sidebar and project selector."
              />
              <Input
                placeholder="My Assistant"
                {...register("name", { required: "Project name is required" })}
                disabled={isSaving}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Description"
                tooltip="A short summary of what this project does. Useful for distinguishing between multiple projects."
              />
              <Textarea
                placeholder="A short description of what this project does…"
                rows={2}
                {...register("description")}
                disabled={isSaving}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Gemini Model */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Gemini model"
                tooltip="The Gemini model used for all sessions in this project. Changing the model takes effect on the next session."
              />
              <Controller
                control={control}
                name="gemini_model"
                render={({ field }) => {
                  const selectedModel = SUPPORTED_MODELS.find((m) => m.value === field.value)
                  return (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model…">
                          {selectedModel ? selectedModel.label : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_MODELS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>

          </CardContent>
        </Card>

        {/* Webhook & Security card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              Webhook &amp; Security
            </CardTitle>
            <CardDescription className="text-xs">
              Configure webhook delivery and CORS allowed origins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Webhook URL"
                tooltip="An HTTPS endpoint that receives POST requests on session events (e.g. session started, tool called)."
              />
              <Input
                placeholder="https://api.yourapp.com/webhook"
                {...register("webhook_url")}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Optional endpoint called on session events.
              </p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Webhook secret"
                tooltip="A shared secret used to sign outgoing webhook payloads with HMAC-SHA256. Leave blank to keep the existing secret unchanged."
              />
              <Input
                type="password"
                placeholder="whsec_••••••••"
                {...register("webhook_secret")}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the existing secret. Used for HMAC-SHA256 request signing.
              </p>
            </div>

            {/* Allowed Origins */}
            <div className="space-y-1.5">
              <FieldLabel
                label="Allowed origins"
                tooltip="Comma-separated list of origins allowed to open WebSocket connections. Leave empty to allow all origins."
              />
              <Textarea
                placeholder="https://app.example.com, https://staging.example.com"
                {...register("allowed_origins")}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated. Leave empty to allow all origins.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
