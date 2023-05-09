import type { VectorStoreRetriever } from 'langchain/vectorstores/base'
import type { Tool } from 'langchain/tools'

import type { BaseChatMessage } from 'langchain/schema'
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from 'langchain/schema'
import { LLMChain } from 'langchain/chains'
import type { BaseChatModel } from 'langchain/chat_models'
import { TokenTextSplitter } from 'langchain/text_splitter'

import { ChatPrompt } from './prompt'

import {
  getEmbeddingContextSize,
  getModelContextSize,
} from '@/utils/tokenCounter'

import { AutoGPTOutputParser } from '@/parser'

export interface AutoGPTInput {
  memory: VectorStoreRetriever
  humanInTheLoop?: boolean
  outputParser?: AutoGPTOutputParser
  maxIterations?: number
}

export class AutoGPT {
  memory: VectorStoreRetriever

  fullMessageHistory: BaseChatMessage[]

  chain: LLMChain

  outputParser: AutoGPTOutputParser

  tools: Tool[]

  maxIterations: number

  // Currently not generic enough to support any text splitter.
  textSplitter: TokenTextSplitter

  constructor({
    memory,
    chain,
    outputParser,
    tools,
    maxIterations,
  }: Omit<Required<AutoGPTInput>, | 'humanInTheLoop'> & {
    chain: LLMChain
    tools: Tool[]
    feedbackTool?: Tool
  }) {
    this.memory = memory
    this.fullMessageHistory = []
    this.chain = chain
    this.outputParser = outputParser
    this.tools = tools
    this.maxIterations = maxIterations
    const chunkSize = getEmbeddingContextSize(
      'modelName' in memory.vectorStore.embeddings
        ? (memory.vectorStore.embeddings.modelName as string)
        : undefined,
    )
    this.textSplitter = new TokenTextSplitter({
      chunkSize,
      chunkOverlap: Math.round(chunkSize / 10),
    })
  }

  static fromLLMAndTools(
    llm: BaseChatModel,
    tools: Tool[],
    {
      memory,
      maxIterations = 100,
      // humanInTheLoop = false,
      outputParser = new AutoGPTOutputParser(),
    }: AutoGPTInput,
  ): AutoGPT {
    const prompt = new ChatPrompt({
      tools,
      tokenCounter: llm.getNumTokens.bind(llm),
      sendTokenLimit: getModelContextSize(
        'modelName' in llm ? (llm.modelName as string) : 'gpt2',
      ),
    })
    // const feedbackTool = humanInTheLoop ? new HumanInputRun() : null;
    const chain = new LLMChain({ llm, prompt })
    return new AutoGPT({
      memory,
      chain,
      outputParser,
      tools,
      // feedbackTool,
      maxIterations,
    })
  }

  async run(goals: string[]): Promise<string | undefined> {
    let loopCount = 0
    while (loopCount < this.maxIterations) {
      loopCount += 1

      await this.singleRun(goals)
    }

    return undefined
  }

  async singleRun(goals: string[]) {
    const user_input
      = 'Determine which next command to use, and respond using the format specified above:'
    const { text: assistantReply } = await this.chain.call({
      goals,
      user_input,
      memory: this.memory,
      messages: this.fullMessageHistory,
    })

    // Print the assistant reply
    console.log('assistantReply is:', assistantReply)
    this.fullMessageHistory.push(new HumanChatMessage(user_input))
    this.fullMessageHistory.push(new AIChatMessage(assistantReply))

    const reply_json = await this.outputParser.parse(assistantReply)
    const action = reply_json.command
    const tools = this.tools.reduce(
      (acc, tool) => ({ ...acc, [tool.name]: tool }),
      {} as { [key: string]: Tool },
    )

    let result: string
    const tool_result = {} as any
    if (action.name in tools) {
      const tool = tools[action.name]
      let observation: string
      try {
        observation = await tool.call(action.args)
      }
      catch (e) {
        observation = `Error in args: ${e}`
      }
      tool_result.name = tool.name
      tool_result.result = observation
      result = `Command ${tool.name} returned: ${observation}`
    }
    else if (action.name === 'ERROR') {
      result = `Error: ${action.args.error}. `
    }
    else {
      result = `Unknown command '${action.name}'. Please refer to the 'COMMANDS' list for available commands and only respond in the specified JSON format.`
    }

    const memoryToAdd = `Assistant Reply: ${assistantReply}\nResult: ${result} `

    const documents = await this.textSplitter.createDocuments([memoryToAdd])
    await this.memory.addDocuments(documents)
    this.fullMessageHistory.push(new SystemChatMessage(result))

    return {
      reply_json,
      tool_result,
    }
  }
}
