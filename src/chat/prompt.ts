import type { SerializedBasePromptTemplate } from 'langchain/prompts'
import { BaseChatPromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts'

import type {
  BaseChatMessage,
  PartialValues,
} from 'langchain/schema'

import type { BasePromptTemplate } from 'langchain'
import type { StructuredTool, Tool } from 'langchain/tools'
import { ZeroShotAgent } from 'langchain/agents'
import type { ModelType } from '@/types'

export interface ChatPromptInput {
  tools: StructuredTool []
  tokenCounter: (text: string) => Promise<number>
  sendTokenLimit?: number
}

export class ChatPrompt
  extends BaseChatPromptTemplate
  implements ChatPromptInput {
  tools: StructuredTool []

  tokenCounter: (text: string) => Promise<number>

  sendTokenLimit: number

  constructor(fields: ChatPromptInput) {
    super({ inputVariables: ['model', 'messages'] })
    this.tools = fields.tools
    this.tokenCounter = fields.tokenCounter
    this.sendTokenLimit = fields.sendTokenLimit || 4196
  }

  _getPromptType() {
    return 'chat' as const
  }

  async formatMessages({
    model,
    messages: previousMessages,
    tools,
  }: {
    messages: BaseChatMessage[]
    model: ModelType
    tools: Tool[]
  }) {
    const prompt = ZeroShotAgent.createPrompt(tools, {
      prefix: 'Answer the following questions as best you can, but speaking as a pirate might speak. You have access to the following tools:',
      suffix: 'Begin! Remember to speak as a pirate when giving your final answer. Use lots of "Args"',
    })

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate(`{input}

This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
{agent_scratchpad}`),
    ])

    return []
  }

  async partial(_values: PartialValues): Promise<BasePromptTemplate> {
    throw new Error('Method not implemented.')
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error('Method not implemented.')
  }
}
