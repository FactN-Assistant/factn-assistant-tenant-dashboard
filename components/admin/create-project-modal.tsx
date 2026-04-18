"use client"

import { useForm } from "react-hook-form"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { type CreateProjectFormValues } from "@/lib/schemas/project-schemas"

const SUPPORTED_MODELS = [
  { value: "gemini-2.5-flash-native-audio-preview-12-2025", label: "Gemini 2.5 Flash (Native Audio)" },
  { value: "gemini-2.0-flash-live-001", label: "Gemini 2.0 Flash Live" },
]

interface Props {
  isOpen: boolean
  onOpenChange: () => void
  onSave: (data: CreateProjectFormValues) => void
  isSubmitting?: boolean
}

export default function CreateProjectModal({ isOpen, onOpenChange, onSave, isSubmitting = false }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    defaultValues: {
      name: "",
      description: "",
      gemini_model: SUPPORTED_MODELS[0].value,
      webhook_url: "",
      webhook_secret: "",
      allowed_origins: "",
    },
  })

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create new project
          </DialogTitle>
          <DialogDescription>
            Set up a new project. You can configure the system prompt, tools, voice, and API keys after creation.
          </DialogDescription>
          <Separator />
        </DialogHeader>

        <form
          id="create-project-form"
          onSubmit={handleSubmit(onSave)}
          className="space-y-5 -mx-4 max-h-[60vh] w-auto overflow-y-auto px-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="My Assistant"
              {...register("name", { required: "Project name is required" })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="project-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="project-description"
              placeholder="A short description of what this project does…"
              rows={2}
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Gemini Model */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Gemini model <span className="text-destructive">*</span>
            </Label>
            <Select
              defaultValue={SUPPORTED_MODELS[0].value}
              onValueChange={(v) => setValue("gemini_model", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Webhook URL */}
          <div className="space-y-1.5">
            <Label htmlFor="project-webhook-url" className="text-sm font-medium">
              Webhook URL
            </Label>
            <Input
              id="project-webhook-url"
              placeholder="https://api.yourapp.com/webhook"
              {...register("webhook_url")}
            />
            <p className="text-xs text-muted-foreground">
              Optional endpoint called on session events.
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <Label htmlFor="project-webhook-secret" className="text-sm font-medium">
              Webhook secret
            </Label>
            <Input
              id="project-webhook-secret"
              type="password"
              placeholder="whsec_••••••••"
              {...register("webhook_secret")}
            />
            <p className="text-xs text-muted-foreground">
              Used for HMAC-SHA256 request signing.
            </p>
          </div>

          {/* Allowed Origins */}
          <div className="space-y-1.5">
            <Label htmlFor="project-allowed-origins" className="text-sm font-medium">
              Allowed origins
            </Label>
            <Textarea
              id="project-allowed-origins"
              placeholder="https://app.example.com, https://staging.example.com"
              {...register("allowed_origins")}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of origins allowed to connect via WebSocket. Leave empty to allow all.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onOpenChange} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-neutral-100 hover:bg-emerald-700">
              {isSubmitting ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
