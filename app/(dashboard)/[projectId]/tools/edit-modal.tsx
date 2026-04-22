import ToolForm from "@/components/admin/tool-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ToolFormValues, ToolResponse } from "@/lib/schemas/tool-schemas"
import { jsonSchemaToParameters } from "@/hooks/useTools"
import { Pencil } from "lucide-react"

interface Props {
  isOpen: boolean,
  onOpenChange: () => void,
  selectedTool: ToolResponse | null
  onSave: (data: ToolFormValues) => void,
  isSubmitting?: boolean,
}

export default function EditToolModal(props: Props) {
    function toolToFormValues(tool: ToolResponse): Partial<ToolFormValues> {
    return {
      name: tool.name,
      description: tool.description,
      execution_mode: tool.execution_mode,
      parameters: jsonSchemaToParameters(tool.parameters),
      static_response: tool.static_response ? JSON.stringify(tool.static_response, null, 2) : "",
      webhook_url: tool.webhook_url ?? "",
      webhook_secret: "",
      timeout_ms: tool.timeout_ms,
    }
  }

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit tool
            {props.selectedTool && <code className="ml-1 text-sm font-mono text-muted-foreground">{props.selectedTool.name}</code>}
          </DialogTitle>
          <DialogDescription>
            Edit the form below to update your tool inventory.
          </DialogDescription>
          <Separator />
        </DialogHeader>
        {props.selectedTool && (
          <ToolForm
            key={props.selectedTool.name}
            defaultValues={toolToFormValues(props.selectedTool)}
            onSave={props.onSave} 
            onOpenChange={props.onOpenChange}
            isSubmitting={props.isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
