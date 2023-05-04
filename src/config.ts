import dotenv from 'dotenv'

import type { ModelType } from './types'

dotenv.config()

export class Config {
  static readonly HTTP_PROXY: string = process.env.HTTP_PROXY ?? ''
  static readonly SELENIUM_BROWSER: string = process.env.SELENIUM_BROWSER ?? 'chrome'
  static readonly SELENIUM_HEADLESS: boolean = process.env.SELENIUM_HEADLESS === 'true'
  static readonly FAST_MODEL: ModelType = 'gpt-3.5-turbo'
  static readonly BROWER_CHUNK_LENGTH = 3000
  static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
  static readonly OPENAI_URL = process.env.OPENAI_URL ?? 'https://api.openai.com/v1'
  static readonly GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? ''
  static readonly GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN ?? ''
  static readonly IMAGE_PROVIDER = process.env.IMAGE_PROVIDER ?? 'dalle'
  static readonly BING_AI_URL = process.env.BING_AI_URL ?? ''
  static readonly BING_AI_KEY = process.env.BING_AI_KEY ?? ''
  static readonly TEMPERATURE = parseFloat(process.env.TEMPERATURE ?? '0.9')
  static readonly MID_JOURNEY_KEY = process.env.IMAGE_PROVIDER_MIDJOURNEY_KEY ?? ''
  static readonly SEARCH_ENGINE = process.env.SEARCH_ENGINE ?? 'duckduckgo'
  static readonly PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? ''
  static readonly PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT ?? ''
  static readonly PINECONE_INDEX = process.env.PINECONE_INDEX ?? ''

  constructor(
    public ai_name: string,
    public ai_role: string,
    public ai_goals: string[],
  ) {
    this.ai_name = ai_name
    this.ai_role = ai_role
    this.ai_goals = ai_goals
  }

  public setValueByKey<T extends keyof Config>(key: T, value: this[T]): void {
    Reflect.set(this, key, value)
  }
}
