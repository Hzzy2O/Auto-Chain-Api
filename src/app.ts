import { mkdirSync, readdirSync, rm, rmdirSync } from 'node:fs'
import { v4 as uuid } from 'uuid'

import type { Config } from './config'

import { getChatAI } from './api'
import { Cache } from './utils/cache'
import { NodeIOFileStore, getVectorStore } from './store'
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
}

class AutoGptManager {
  static currentSymbol: string | null = null
  cache: Cache<CacheValue>

  constructor() {
    this.cache = new Cache(1)
  }

  async createAI(config: Config) {
    const { ai_name, ai_role } = config

    const vectorStore = await getVectorStore()

    const gpt_id = uuid()

    const filePath = `tmp/${gpt_id}`
    mkdirSync(filePath)
    console.log(readdirSync(filePath))
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

    const { ai, config, messages } = value

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
    }
  }

  getAI(gpt_id: string) {
    const value = this.cache.get(gpt_id)
    if (!value)
      return undefined

    return value
  }

  listAI() {
    const list = this.cache.getAll()
    const dirs = readdirSync('tmp')
    dirs.forEach((dir) => {
      if (!list.find(item => item.id === dir)) {
        rm(`tmp/${dir}`, { recursive: true, force: true }, (err) => {
          console.log(err, dir)
        })
      }
    })

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
