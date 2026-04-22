import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type CreateKeyForm } from "@/lib/schemas/key-schemas"
import { AlertTriangle, Globe, Plus, Server } from "lucide-react"
import { useForm } from "react-hook-form"

export default function CreateKeyModal({
  onCreate,
  onCancel,
  isSubmitting = false,
}: {
  onCreate: (data: CreateKeyForm) => void
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const { register, handleSubmit, setValue, watch } = useForm<CreateKeyForm>({
    defaultValues: { label: "", key_type: "publishable", rate_limit_rpm: 60 },
  })
  const keyType = watch("key_type")

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create new API key
          </DialogTitle>
          <DialogDescription>
            The full key is shown exactly once after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g. Production web client"
              {...register("label", { required: true })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Key type</Label>
            <Select
              defaultValue="publishable"
              onValueChange={(v) => setValue("key_type", v as "publishable" | "secret")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishable">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Publishable</span>
                      <span className="font-mono text-[10px] text-muted-foreground">pk_live_...</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">Safe for browser / client-side WebSocket connections</span>
                  </div>
                </SelectItem>
                <SelectItem value="secret">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-amber-500" />
                      <span>Secret</span>
                      <span className="font-mono text-[10px] text-muted-foreground">sk_live_...</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">Server-side only — required to mint ephemeral tokens</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {keyType === "secret" && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
                  Never expose secret keys in browser code or public repositories.
                  Use them only on your backend server.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rate_limit">Rate limit (requests / minute)</Label>
            <Input
              id="rate_limit"
              type="number"
              min={1}
              max={1000}
              {...register("rate_limit_rpm", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Applied per key. Default is 60 rpm.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
