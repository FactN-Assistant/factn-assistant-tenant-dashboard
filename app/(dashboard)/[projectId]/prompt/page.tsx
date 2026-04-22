'use client'

import { MonitorCog } from "lucide-react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useProject } from "@/hooks/useProject"

interface FormInput {
  systemPrompt: string
}

export default function PromptConfig() {
  const { selectedProject, isLoadingDetail, updateSystemPromptMutation } = useProject()
  const isSaving = updateSystemPromptMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FormInput>({
    defaultValues: {
      systemPrompt: ""
    }
  })
  
  // Load the system prompt from the selected project
  useEffect(() => {
    if (selectedProject) {
      reset({
        systemPrompt: selectedProject.system_prompt || ""
      })
    }
  }, [selectedProject, reset])
  
  const onSubmit: SubmitHandler<FormInput> = (data) => {
    if (!selectedProject) return
    updateSystemPromptMutation.mutate(data.systemPrompt)
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
    <div className="m-10">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <MonitorCog className="h-5 w-5 text-muted-foreground" />
            System Prompt
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define the identity, constraints, and personality of your assistant.
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={!isDirty || isSaving}
          className="h-10 px-5 bg-emerald-600 text-neutral-100 hover:bg-emerald-700" 
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="px-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field className="space-y-2">
              <FieldLabel htmlFor="systemPrompt" className="text-sm font-medium">
                Instructions
              </FieldLabel>
              <FieldDescription className="text-xs text-muted-foreground">
                This prompt is sent to the model before every conversation to guide its behavior.
              </FieldDescription>
              
              <Textarea 
                id="systemPrompt" 
                className="min-h-75 mt-3 font-mono text-sm leading-relaxed resize-none border hover:border-green-700 focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-none" 
                placeholder="e.g. You are a helpful assistant that specializes in data analysis..." 
                disabled={isSaving}
                {...register("systemPrompt", { required: "System prompt is required" })}
              />
            </Field>

            <div className="flex items-center justify-end pt-2">
               <p className="text-xs text-muted-foreground">
                 Changes are applied immediately to new sessions.
               </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
