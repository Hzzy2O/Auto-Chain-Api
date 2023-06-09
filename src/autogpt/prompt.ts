import { writeFileSync } from 'node:fs'
import type { SerializedBasePromptTemplate } from 'langchain/prompts'
import { BaseChatPromptTemplate } from 'langchain/prompts'
import type {
  BaseChatMessage,
  PartialValues,
} from 'langchain/schema'
import {
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema'
import type { VectorStoreRetriever } from 'langchain/vectorstores/base'
import type { BasePromptTemplate } from 'langchain'
import type { ObjectTool } from './schema'
import { getPrompt } from './prompt_generator'

export interface AutoGPTPromptInput {
  aiName: string
  aiRole: string
  tools: ObjectTool[]
  tokenCounter: (text: string) => Promise<number>
  sendTokenLimit?: number
}

export class AutoGPTPrompt
  extends BaseChatPromptTemplate
  implements AutoGPTPromptInput {
  aiName: string

  aiRole: string

  tools: ObjectTool[]

  tokenCounter: (text: string) => Promise<number>

  sendTokenLimit: number

  constructor(fields: AutoGPTPromptInput) {
    super({ inputVariables: ['goals', 'memory', 'messages', 'user_input'] })
    this.aiName = fields.aiName
    this.aiRole = fields.aiRole
    this.tools = fields.tools
    this.tokenCounter = fields.tokenCounter
    this.sendTokenLimit = fields.sendTokenLimit || 4196
  }

  _getPromptType() {
    return 'autogpt' as const
  }

  constructFullPrompt(goals: string[]): string {
    const promptStart = `Your decisions must always be made independently 
            without seeking user assistance. Play to your strengths 
            as an LLM and pursue simple strategies with no legal complications. 
            If you have completed all your tasks, 
            make sure to use the "finish" command.`

    let fullPrompt = `You are ${this.aiName}, ${this.aiRole}\n${promptStart}\n\nGOALS:\n\n`
    goals.forEach((goal, index) => {
      fullPrompt += `${index + 1}. ${goal}\n`
    })

    fullPrompt += `\n\n${getPrompt(this.tools)}`
    return fullPrompt
  }

  async formatMessages({
    goals,
    memory,
    messages: previousMessages,
    user_input,
  }: {
    goals: string[]
    memory: VectorStoreRetriever
    messages: BaseChatMessage[]
    user_input: string
  }) {
    const basePrompt = new SystemChatMessage(this.constructFullPrompt(goals))
    const timePrompt = new SystemChatMessage(
      `The current time and date is ${new Date().toLocaleString()}`,
    )
    const usedTokens
      = (await this.tokenCounter(basePrompt.text))
      + (await this.tokenCounter(timePrompt.text))
    const relevantDocs = await memory.getRelevantDocuments(
      JSON.stringify(previousMessages.slice(-10)),
    )
    const relevantMemory = relevantDocs.map(d => d.pageContent)
    let relevantMemoryTokens = await relevantMemory.reduce(
      async (acc, doc) => (await acc) + (await this.tokenCounter(doc)),
      Promise.resolve(0),
    )

    while (usedTokens + relevantMemoryTokens > 2500) {
      relevantMemory.pop()
      relevantMemoryTokens = await relevantMemory.reduce(
        async (acc, doc) => (await acc) + (await this.tokenCounter(doc)),
        Promise.resolve(0),
      )
    }

    const contentFormat = `This reminds you of these events from your past:\n${relevantMemory.join(
      '\n',
    )}\n\n`
    const memoryMessage = new SystemChatMessage(contentFormat)
    const usedTokensWithMemory
      = usedTokens + (await this.tokenCounter(memoryMessage.text))
    const historicalMessages: BaseChatMessage[] = []

    for (const message of previousMessages.slice(-10).reverse()) {
      const messageTokens = await this.tokenCounter(message.text)
      if (usedTokensWithMemory + messageTokens > this.sendTokenLimit - 1000)
        break

      historicalMessages.unshift(message)
    }

    const inputMessage = new HumanChatMessage(user_input)
    const messages: BaseChatMessage[] = [
      basePrompt,
      timePrompt,
      memoryMessage,
      ...historicalMessages,
      inputMessage,
    ]
    writeFileSync('log.txt', JSON.stringify({
      usedTokens,
      relevantMemoryTokens,
      messages,
    }, null, 2), 'utf8')
    return messages
  }

  async partial(_values: PartialValues): Promise<BasePromptTemplate> {
    throw new Error('Method not implemented.')
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error('Method not implemented.')
  }
}
