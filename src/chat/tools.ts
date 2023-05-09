import {
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { WebSearchTool } from '@/tools/search'
import { Config } from '@/config'

const getTool = new RequestsGetTool()
const postTool = new RequestsPostTool()
const searchTool = new WebSearchTool()

export const tools = [
  getTool,
  postTool,
  searchTool,
]

export const chatTools = [
  {
    id: getTool.name,
    name: 'http get',
    description: getTool.description,
    icon: 'tabler:http-get',
  },
  {
    id: postTool.name,
    name: 'http post',
    description: postTool.description,
    icon: 'tabler:http-post',
  },
  {
    id: searchTool.name,
    name: 'web browse',
    description: searchTool.description,
    icon: Config.SEARCH_ENGINE === 'bing' ? 'logos:bing' : Config.SEARCH_ENGINE === 'google' ? 'logos:google' : 'logos:duckduckgo',
  },
]
