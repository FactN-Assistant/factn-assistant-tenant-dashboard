import { type ApiKey } from "@/lib/schemas/key-schemas";
import { Clock, Key, Trash2, Loader2 } from "lucide-react";
import KeyTypeBadge from "./key-type-badge";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { formatDate, timeAgo } from "@/lib/utils";
import { Button } from "../ui/button";

export default function KeyRow({ 
  apiKey, 
  onRevoke,
  isRevoking = false,
}: { 
  apiKey: ApiKey
  onRevoke: () => void
  isRevoking?: boolean
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-lg border transition-colors ${
      apiKey.revoked ? "bg-muted/30 opacity-60" : "bg-card hover:bg-muted/30"
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
          apiKey.revoked ? "bg-muted" :
          apiKey.key_type === "secret" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-primary/10"
        }`}>
          <Key className={`h-3.5 w-3.5 ${
            apiKey.revoked ? "text-muted-foreground" :
            apiKey.key_type === "secret" ? "text-amber-600 dark:text-amber-400" : "text-primary"
          }`} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{apiKey.label}</span>
            <KeyTypeBadge type={apiKey.key_type} />
            {apiKey.revoked && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">revoked</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{apiKey.key_prefix}••••••••••••••••••••</span>
            <span className="text-xs text-muted-foreground">·</span>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-default">
                    <Clock className="h-3 w-3" />{timeAgo(apiKey.last_used_at)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Last used: {formatDate(apiKey.last_used_at)}
                  <br />Created: {formatDate(apiKey.created_at)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{apiKey.rate_limit_rpm} rpm</span>
          </div>
        </div>
      </div>

      {!apiKey.revoked && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 ml-2 text-muted-foreground hover:text-destructive"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </Button>
      )}
    </div>
  )
}
