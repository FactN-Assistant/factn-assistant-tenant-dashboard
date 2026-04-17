import { ToolResponse } from "@/lib/schemas/tool-schemas";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDown, Pencil, Trash2, Webhook, Zap, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Props {
  tool: ToolResponse,
  onEdit: () => void,
  onDelete: () => void,
  isDeleting?: boolean,
}

// Helper to extract parameters from JSON Schema object
function extractParametersFromSchema(schema: Record<string, any>): Array<{ name: string; type: string; description: string; required: boolean }> {
  if (!schema || typeof schema !== "object" || !schema.properties) {
    return [];
  }

  const requiredFields = Array.isArray(schema.required) ? schema.required : [];
  
  return Object.entries(schema.properties).map(([name, propSchema]: [string, any]) => ({
    name,
    type: propSchema.type || "unknown",
    description: propSchema.description || "",
    required: requiredFields.includes(name),
  }));
}

export default function ToolCard(props: Props) {
  const [open, setOpen] = useState(false)
  const parameters = extractParametersFromSchema(props.tool.parameters)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex cursor-pointer items-center justify-between px-4 py-3.5 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  {props.tool.execution_mode === "webhook"
                    ? <Webhook className="h-3.5 w-3.5 text-primary" />
                    : <Zap className="h-3.5 w-3.5 text-amber-500" />
                  }
                </div>
                <span className="font-mono text-sm font-medium truncate">{props.tool.name}</span>
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] px-1.5 py-0"
                >
                  {props.tool.execution_mode}
                </Badge>
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); props.onEdit() }}
                  disabled={props.isDeleting}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); props.onDelete() }}
                  disabled={props.isDeleting}
                >
                  {props.isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t px-4 py-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground">{props.tool.description}</p>

              {/* Parameters */}
              {parameters.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</p>
                  <div className="space-y-1.5">
                    {parameters.map((p) => (
                      <div key={p.name} className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
                        <code className="text-xs font-semibold text-foreground shrink-0">{p.name}</code>
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">{p.type}</Badge>
                        {p.required && <Badge className="text-[10px] px-1 py-0 h-4 shrink-0 bg-primary/15 text-primary border-0">required</Badge>}
                        <span className="text-xs text-muted-foreground">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parameters.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No parameters defined.</p>
              )}

              {/* Webhook / Static info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Execution</p>
                <div className="rounded-md bg-muted/50 px-3 py-2 space-y-1.5">
                  {props.tool.execution_mode === "webhook" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-24 shrink-0">Webhook URL</span>
                        <code className="text-xs truncate">{props.tool.webhook_url}</code>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">Static JSON</span>
                      <code className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {props.tool.static_response ? JSON.stringify(props.tool.static_response, null, 2) : "N/A"}
                      </code>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">Timeout</span>
                    <span className="text-xs">{props.tool.timeout_ms.toLocaleString()} ms</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}