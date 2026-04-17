import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToolFormValues } from "@/lib/types"
import { Plus, Webhook, X, Zap } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { DialogFooter } from "../ui/dialog"

export default function ToolForm({
  defaultValues,
  onSave,
  onOpenChange,
  isSubmitting = false,
}: {
  defaultValues?: Partial<ToolFormValues>
  onSave: (data: ToolFormValues) => void
  onOpenChange: () => void
  isSubmitting?: boolean
}) {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ToolFormValues>({
      defaultValues: {
        name: "",
        description: "",
        execution_mode: "static",
        parameters: [],
        static_response: "",
        webhook_url: "",
        webhook_secret: "",
        timeout_ms: 5000,
        ...defaultValues,
      },
    })

  const { fields, append, remove } = useFieldArray({ control, name: "parameters" })
  const mode = watch("execution_mode")

  return (
    <form 
      id="tool-form"
      onSubmit={handleSubmit(onSave)} 
      className="space-y-5 -mx-4 max-h-[60vh] w-auto overflow-y-auto px-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Tool name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="get_booking_status"
          className="font-mono text-sm"
          {...register("name", {
            required: "Name is required",
            pattern: { value: /^[a-z][a-z0-9_]*$/, message: "snake_case only (e.g. my_tool)" },
          })}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        <p className="text-xs text-muted-foreground">Lowercase letters, digits, and underscores only.</p>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what this tool does so Gemini knows when to use it…"
          rows={2}
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      {/* Execution Mode */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Execution mode</Label>
        <Select
          defaultValue={defaultValues?.execution_mode ?? "static"}
          onValueChange={(v) => setValue("execution_mode", v as "static" | "webhook")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Static — return a fixed JSON response
              </div>
            </SelectItem>
            <SelectItem value="webhook">
              <div className="flex items-center gap-2">
                <Webhook className="h-3.5 w-3.5 text-blue-500" />
                Webhook — POST to your endpoint
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mode-specific fields */}
      {mode === "static" ? (
        <div className="space-y-1.5">
          <Label htmlFor="static_response" className="text-sm font-medium">Static response (JSON)</Label>
          <Textarea
            id="static_response"
            placeholder='{"status": "ok"}'
            rows={4}
            className="font-mono text-xs"
            {...register("static_response")}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="webhook_url" className="text-sm font-medium">
              Webhook URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="webhook_url"
              placeholder="https://api.yourapp.com/tools/handler"
              {...register("webhook_url", { required: mode === "webhook" ? "Webhook URL is required" : false })}
            />
            {errors.webhook_url && <p className="text-xs text-destructive">{errors.webhook_url.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="webhook_secret" className="text-sm font-medium">Signing secret (optional)</Label>
            <Input
              id="webhook_secret"
              type="password"
              placeholder="whsec_••••••••"
              {...register("webhook_secret")}
            />
            <p className="text-xs text-muted-foreground">Used for HMAC-SHA256 request signing.</p>
          </div>
        </div>
      )}

      {/* Timeout */}
      <div className="space-y-1.5">
        <Label htmlFor="timeout_ms" className="text-sm font-medium">Timeout (ms)</Label>
        <Input
          id="timeout_ms"
          type="number"
          min={100}
          max={30000}
          {...register("timeout_ms", { valueAsNumber: true })}
        />
      </div>

      <Separator />

      {/* Parameters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Parameters</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => append({ name: "", type: "string", description: "", required: false })}
          >
            <Plus className="mr-1 h-3 w-3" /> Add parameter
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            No parameters yet. Add one above.
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="relative rounded-lg border bg-muted/30 p-3 space-y-2">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    placeholder="param_name"
                    className="h-7 text-xs font-mono"
                    {...register(`parameters.${index}.name`)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    defaultValue={field.type}
                    onValueChange={(v) => setValue(`parameters.${index}.type`, v)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["string", "number", "integer", "boolean", "array", "object"].map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  placeholder="What this parameter does…"
                  className="h-7 text-xs"
                  {...register(`parameters.${index}.description`)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  {...register(`parameters.${index}.required`)}
                />
                <span className="text-xs text-muted-foreground">Required</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onOpenChange} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save tool"}
        </Button>
        </DialogFooter>
    </form>
  )
}