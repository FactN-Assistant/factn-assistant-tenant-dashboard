'use client'

import { MonitorCog, Save } from "lucide-react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useProject } from "@/hooks/useProject"
import { useFetch } from "@/hooks/useFetch"

interface FormInput {
  systemPrompt: string
}

export default function PromptConfig() {
  const { selectedProject, isLoadingDetail } = useProject()
  const fetchWithAuth = useFetch()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
  
  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    if (!selectedProject) {
      setSaveMessage({ type: 'error', text: 'No project selected' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      await fetchWithAuth(`/projects/${selectedProject.project_id}/system-prompt`, {
        method: 'PUT',
        body: JSON.stringify({
          system_prompt: data.systemPrompt
        })
      })

      setSaveMessage({ type: 'success', text: 'System prompt saved successfully!' })
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save system prompt' 
      })
    } finally {
      setIsSaving(false)
    }
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
          className="gap-1.5 py-5 px-6 rounded-full bg-green-600 hover:bg-green-700 transition-colors text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          saveMessage.type === 'success' 
            ? 'bg-green-900/30 text-green-300 border border-green-800' 
            : 'bg-red-900/30 text-red-300 border border-red-800'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardContent className="p-6">
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
                className="min-h-[300px] mt-3 font-mono text-sm leading-relaxed resize-none border-muted/50 focus-visible:ring-green-600" 
                placeholder="e.g. You are a helpful assistant that specializes in data analysis..." 
                disabled={isSaving}
                {...register("systemPrompt", { required: "System prompt is required" })}
              />
            </Field>

            <div className="flex items-center justify-end pt-2">
               <p className="text-[10px] text-muted-foreground italic mr-4">
                 Changes are applied immediately to new sessions.
               </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}