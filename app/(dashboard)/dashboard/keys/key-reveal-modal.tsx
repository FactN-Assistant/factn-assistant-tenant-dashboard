import KeyTypeBadge from "@/components/admin/key-type-badge"
import CopyButton from "@/components/copy-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { type CreatedKey } from "@/lib/schemas/key-schemas"
import { AlertTriangle, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useState } from "react"

export default function KeyRevealModal({
  createdKey,
  onClose,
}: {
  createdKey: CreatedKey
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Dialog open onOpenChange={(o) => { if (!o && confirmed) onClose() }}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            Save your API key now
          </DialogTitle>
          <DialogDescription>
            This is the <strong>only time</strong> this key will be shown.
            It is not stored on our servers — copy it somewhere safe before closing.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
            Once you close this dialog, the raw key cannot be recovered.
            If you lose it, you will need to revoke this key and create a new one.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <p className="text-sm font-medium">{createdKey.label}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <KeyTypeBadge type={createdKey.key_type as "publishable" | "secret"} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Rate limit</Label>
            <p className="text-sm">{createdKey.rate_limit_rpm} req / min</p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Your API key</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Input
                  readOnly
                  value={visible ? createdKey.raw_key : "•".repeat(createdKey.raw_key.length)}
                  className="font-mono text-xs pr-10 bg-muted"
                />
                <button
                  type="button"
                  onClick={() => setVisible(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <CopyButton text={createdKey.raw_key} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Prefix: <span className="text-foreground">{createdKey.key_prefix}</span>
              &nbsp;—&nbsp;only the prefix is stored and shown after this dialog closes.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer mr-auto">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="rounded border-border"
            />
            I&apos;ve copied my key and stored it safely
          </label>
          <Button onClick={onClose} disabled={!confirmed}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}