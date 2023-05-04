import type { StructuredTool } from 'langchain/tools'

export type ObjectTool = StructuredTool

export const FINISH_NAME = 'finish'

export interface AutoGPTAction {
  thoughts?: {
    text: string
    reasoning: string
    plan: string
    criticism: string
    speak: string
  }
  command: {
    name: string
    args: Record<string, any>
  }
}

export interface AutoGPTToolResult {
  name: string
  result: string
}
