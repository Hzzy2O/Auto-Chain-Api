import type { Request, Response } from 'express'

export type Nullable<T> = T | null
export type NonNullable<T> = T extends null | undefined ? never : T
export type Recordable<T = any> = Record<string, T>

export type ModelType = 'gpt-3.5-turbo' | 'gpt-4'

export interface AiConfig {
  name: string
  role: string
  goals: string[]
}

export interface AutoGptParams {
  session_id: string
  ai_config: AiConfig
}

export type ReqAutoGpt = Request<{}, {}, AutoGptParams>

export type ResAutoGpt = Response<AutoGptParams>
