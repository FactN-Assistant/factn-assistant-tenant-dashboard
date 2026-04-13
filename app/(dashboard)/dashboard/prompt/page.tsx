'use client'

import { MonitorCog, Save } from "lucide-react"
import { useForm, SubmitHandler } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface FormInput {
  systemPrompt: string
}

export default function PromptConfig() {
  const {
    register,
    handleSubmit,
  } = useForm<FormInput>()
  
  const onSubmit: SubmitHandler<FormInput> = (data) => {
    console.log("Textarea Value via Submit:", data.systemPrompt)
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
          className="gap-1.5 py-5 px-6 rounded-full bg-green-600 hover:bg-green-700 transition-colors text-neutral-200"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

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
                {...register("systemPrompt")}
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