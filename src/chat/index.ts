import type { Tool } from 'langchain/tools'

import { LLMChain } from 'langchain/chains'
import type { BaseChatModel } from 'langchain/chat_models'
import type { TokenTextSplitter } from 'langchain/text_splitter'

import type { AgentActionOutputParser } from 'langchain/agents'
import { AgentExecutor, LLMSingleActionAgent } from 'langchain/agents'
import { ChatPrompt } from './prompt'
import { ChatCallbackHandler } from './callback'
import { ChatGPTOutputParser } from './parser'

export interface ChatGPTInput {
  outputParser?: AgentActionOutputParser
  callbackHandler?: ChatCallbackHandler
}

export class ChatGPT {
  chain: LLMChain

  outputParser: AgentActionOutputParser

  tools: Tool[]

  callbackHandler: ChatCallbackHandler

  textSplitter: TokenTextSplitter

  constructor({
    chain,
    outputParser,
    tools,
    callbackHandler,
  }: Required<ChatGPTInput> & {
    chain: LLMChain
    tools: Tool[]
  }) {
    this.chain = chain
    this.outputParser = outputParser
    this.tools = tools
    this.callbackHandler = callbackHandler
  }

  static fromLLMAndTools(
    llm: BaseChatModel,
    tools: Tool[],
    {
      outputParser = new ChatGPTOutputParser(),
      callbackHandler,
    }: ChatGPTInput,
  ): ChatGPT {
    const prompt = new ChatPrompt({
      tools,

    })
    const chain = new LLMChain({
      llm,
      prompt,
      // callbacks: [new ChatCallbackHandler({} as any)],
    })
    return new ChatGPT({
      chain,
      outputParser,
      tools,
      callbackHandler: new ChatCallbackHandler({ } as any),
    })
  }

  async run(input: string) {
    const agent = new LLMSingleActionAgent({
      llmChain: this.chain,
      outputParser: this.outputParser,
      stop: ['\nObservation'],
    })
    const executor = new AgentExecutor({
      agent,
      tools: this.tools,
    })

    const result = await executor.call({ input }, [this.callbackHandler])
    console.log(result)

    return result
  }
}
