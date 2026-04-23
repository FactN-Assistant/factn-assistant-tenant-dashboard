import { z } from 'zod'

export const connStateSchema = z.enum([
	'disconnected',
	'connecting',
	'connected',
	'error',
])

export const chatMessageSchema = z.object({
	id: z.string(),
	direction: z.enum(['sent', 'received', 'system']),
	type: z.string(),
	ts: z.string(),
	json: z.unknown().optional(),
	systemText: z.string().optional(),
	isAudio: z.boolean().optional(),
	audioDirection: z.enum(['sent', 'received']).optional(),
	audioBytes: z.number().int().nonnegative().optional(),
	audioFrameCount: z.number().int().positive().optional(),
})

export const connSettingsSchema = z.object({
	serverUrl: z.string(),
	authType: z.enum(['api_key', 'token']),
	authValue: z.string(),
	sessionId: z.string(),
})

export const audioSettingsSchema = z.object({
	inputRate: z.number().int().min(8000).max(48000),
	outputRate: z.number().int().min(8000).max(48000),
	chunkSize: z.number().int().min(160).max(16000),
	autoPlay: z.boolean(),
	showInChat: z.boolean(),
})

export type ConnState = z.infer<typeof connStateSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ConnSettings = z.infer<typeof connSettingsSchema>
export type AudioSettings = z.infer<typeof audioSettingsSchema>
