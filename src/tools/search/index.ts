import { Tool } from 'langchain/tools'
import { searchGoogle } from './google'
import { searchDuckDuckGo } from './ddg'
import { searchByBingAI } from './bingAI'
import { Config } from '@/config'

export class WebSearchTool extends Tool {
  name = 'search-tool'
  description = 'according to the query, search the web and return the relevant links'

  constructor() {
    super()
  }

  async _call(query: string) {
    try {
      if (Config.SEARCH_ENGINE === 'google')
        return await searchGoogle(query)
      else if (Config.SEARCH_ENGINE === 'bing')
        return await searchByBingAI(query)
      else
        return await searchDuckDuckGo(query)
    }
    catch (err) {
      if (
        err.code === 403
      && err.message
      && err.message.includes('invalid API key')
      )
        return 'Error: The provided Google API key is invalid or missing.'
      else
        return `Error: ${err}`
    }
  }
}
