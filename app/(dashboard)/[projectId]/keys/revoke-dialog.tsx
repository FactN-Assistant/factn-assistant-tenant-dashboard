import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { type ApiKey } from "@/lib/schemas/key-schemas"
import { AlertTriangle } from "lucide-react"

export default function RevokeDialog({
  apiKey,
  onConfirm,
  onCancel,
}: {
  apiKey: ApiKey
  onConfirm: () => void
  onCancel:  () => void
}) {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Revoke API key?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You are about to permanently revoke{" "}
                <span className="font-mono font-semibold text-foreground">{apiKey.key_prefix}...</span>
                {" "}({apiKey.label}).
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Revocation is <strong className="text-foreground">permanent</strong> — keys cannot be un-revoked.</li>
                <li>New WebSocket connections using this key will be rejected immediately.</li>
                <li>Existing active sessions will continue until their TTL expires.</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Revoke key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
