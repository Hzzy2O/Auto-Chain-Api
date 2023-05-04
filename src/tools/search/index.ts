import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { searchGoogle } from './google'
import { searchDuckDuckGo } from './ddg'
import { Config } from '@/config'

export class WebSearchTool extends StructuredTool {
  name = 'search-tool'
  description = 'according to the query, search the web and return the relevant links'
  schema = z.object({
    query: z.string().describe('the query to search'),
  })

  constructor() {
    super()
  }

  async _call({ query }: z.infer<typeof this.schema>) {
    try {
      if (Config.SEARCH_ENGINE === 'google')
        return await searchGoogle(query)
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
