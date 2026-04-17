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

export interface ApiKey {
  key_id:         string
  key_prefix:     string
  key_type:       "publishable" | "secret"
  label:          string
  rate_limit_rpm: number
  revoked:        boolean
  created_at:     string
  last_used_at:   string | null
}

export interface CreateKeyForm {
  label:          string
  key_type:       "publishable" | "secret"
  rate_limit_rpm: number
}

export interface MintTokenForm {
  ttl_seconds: number
  metadata_raw: string   // free-form "key=value" lines the user types
}

export interface CreatedKey {
  key_id:         string
  raw_key:        string
  key_prefix:     string
  key_type:       string
  label:          string
  rate_limit_rpm: number
  created_at:     string
}

export interface MintedToken {
  ephemeral_token: string
  expires_at:      number
  ttl_seconds:     number
  project_id:      string
}
