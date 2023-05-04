import type { ToolParams } from 'langchain/tools'
import { StructuredTool } from 'langchain/tools'

import type { NodeIOFileStore } from '@/store'

export abstract class FileTool extends StructuredTool {
  store: NodeIOFileStore
}
export interface FileParams extends ToolParams {
  store: NodeIOFileStore
}
