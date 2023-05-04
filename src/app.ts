import { mkdirSync, readdirSync, rmdirSync } from 'node:fs'
import { PineconeClient } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { v4 as uuid } from 'uuid'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

import { Config } from './config'

import { getChatAI } from './api'
import { Cache } from './utils/cache'
import { NodeIOFileStore } from './store'
import { AutoGPT } from '@/autogpt'
import { getTools } from '@/tools'
import { AutoGPTOutputParser } from '@/parser'
import type { AutoGPTAction, AutoGPTToolResult } from '@/autogpt/schema'
import { FINISH_NAME } from '@/autogpt/schema'

interface CacheValue {
  ai: AutoGPT
  config: Config
  id: string
  filePath: string
  messages?: RunResult[]
  finished?: boolean
}

interface RunResult {
  reply_json: AutoGPTAction
  tool_result: AutoGPTToolResult
  finish?: boolean
  has_file?: boolean
}

function isEmptyFolder(path: string) {
  const files = readdirSync(path)
  return files.length === 0
}

const client = new PineconeClient()

class AutoGptManager {
  static currentSymbol: string | null = null
  cache: Cache<CacheValue>

  constructor() {
    this.cache = new Cache(30)
  }

  async createAI(config: Config) {
    const { ai_name, ai_role } = config

    await client.init({
      apiKey: Config.PINECONE_API_KEY,
      environment: Config.PINECONE_ENVIRONMENT,
    })
    const pineconeIndex = client.Index(Config.PINECONE_INDEX)

    // const vectorStore = new HNSWLib(new OpenAIEmbeddings({
    //   openAIApiKey: Config.OPENAI_API_KEY,
    // }, {
    //   basePath: Config.OPENAI_URL,
    // }), {
    //   space: 'cosine',
    //   numDimensions: 1536,
    // })
    const vectorStore = new PineconeStore(new OpenAIEmbeddings({
      openAIApiKey: Config.OPENAI_API_KEY,
    }, {
      basePath: Config.OPENAI_URL,
    }), {
      pineconeIndex,
    })

    const gpt_id = uuid()

    const filePath = `tmp/${gpt_id}`
    mkdirSync(filePath, { recursive: true })
    const fileStore = new NodeIOFileStore(filePath)

    const autogpt = AutoGPT.fromLLMAndTools(
      getChatAI(),
      getTools(fileStore),
      {
        memory: vectorStore.asRetriever(),
        outputParser: new AutoGPTOutputParser(),
        aiName: ai_name,
        aiRole: ai_role,
        maxIterations: 1,
      },
    )

    const value = {
      ai: autogpt,
      config,
      id: gpt_id,
      filePath,
    }
    this.cache.add(gpt_id, value)

    return gpt_id
  }

  async runAI(gpt_id: string): Promise<RunResult> {
    const value = this.cache.get(gpt_id)
    if (!value)
      throw new Error('GPT not found')
    if (value.finished)
      throw new Error('GPT already finished')

    const { ai, config, messages, filePath } = value

    const result = await ai.singleRun(config.ai_goals)
    let finish = false
    if (result.reply_json.command.name === FINISH_NAME) {
      this.cache.set(gpt_id, {
        ...value,
        finished: true,
      })
      finish = true
    }
    else {
      this.cache.set(gpt_id, {
        ...value,
        messages: messages ? messages.concat(result) : [result],
      })
    }

    return {
      ...result,
      finish,
      has_file: isEmptyFolder(filePath),
    }
  }

  getAI(gpt_id: string) {
    const value = this.cache.get(gpt_id)
    if (!value)
      throw new Error('GPT not found')

    return value
  }

  listAI() {
    return this.cache.getAll()
  }

  destoryAI(gpt_id: string) {
    const value = this.cache.get(gpt_id)
    if (!value)
      throw new Error('GPT not found')

    rmdirSync(value.filePath, { recursive: true })
    this.cache.delete(gpt_id)
  }
}

export default new AutoGptManager()
