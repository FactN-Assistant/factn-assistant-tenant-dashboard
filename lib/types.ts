
export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
}

export interface Tool {
  id: string
  name: string
  description: string
  execution_mode: "static" | "webhook"
  parameters: ToolParameter[]
  static_response?: string
  webhook_url?: string
  webhook_secret?: string
  timeout_ms: number
}

export interface ToolFormValues {
  name: string
  description: string
  execution_mode: "static" | "webhook"
  parameters: ToolParameter[]
  static_response: string
  webhook_url: string
  webhook_secret: string
  timeout_ms: number
}

export interface VoiceFormValues {
  voice_enabled: boolean
  voice_name: string
  language_code: string
  vad_mode: "manual" | "auto"
}