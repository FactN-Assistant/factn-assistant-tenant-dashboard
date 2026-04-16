import ToolForm from "@/components/admin/tool-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ToolFormValues } from "@/lib/types";
import { Plus } from "lucide-react";

interface Props {
  isOpen: boolean,
  onOpenChange: () => void,
  onSave: (data: ToolFormValues) => void,
  isSubmitting?: boolean,
}

export default function CreateToolModal(props: Props) {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="w-500">
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create new tool
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new tool to your inventory.
          </DialogDescription>
          <Separator />
        </DialogHeader>
        
        <ToolForm
          onSave={props.onSave}
          onOpenChange={props.onOpenChange}
          isSubmitting={props.isSubmitting}
        />

      </DialogContent>
    </Dialog>
  )
}