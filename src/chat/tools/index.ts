import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { BingAI } from '@/tools/search'

const getTool = new RequestsGetTool()
const postTool = new RequestsPostTool()
const bingAssitant = new BingAI()
const plugins = JSON.parse(readFileSync(join(__dirname, './plugins.json'), 'utf-8'))

interface ChatToolForUser {
  id: string
  name: string
  description: string
  icon?: string
  logo?: string

}

const baseTool = [
  getTool,
  postTool,
]

export class ToolManage {
  tools = [
    getTool,
    postTool,
    bingAssitant,
  ]

  chatToolsForUser: ChatToolForUser[] = [
    {
      id: bingAssitant.name,
      name: 'bing assistant',
      description: 'can understand and use different languages, answer questions, give suggestions, and create content based on the web',
      icon: 'logos:bing',
    },
  ]

  initPromise: Promise<any> | null

  constructor() {
    this.initPromise = Promise.allSettled(
      plugins.map(p => this.initPlugin(p)),
    ).then(() => {
      this.initPromise = null
    })
  }

  async initPlugin(plugin: any) {
    const tool = await AIPluginTool.fromPluginUrl(plugin.url)
    const chatTool = {
      id: tool.name,
      name: plugin.name_for_human,
      description: plugin.description_for_human,
      logo: plugin.logo_url,
    }
    this.tools.push(tool)
    this.chatToolsForUser.push(chatTool)
  }

  async loadTools(url: string) {
    const config = await getPluginFromUrl(url)
    this.tools.push(await AIPluginTool.fromPluginUrl(url))

    this.chatToolsForUser.push(config)
  }

  pickTool(name: string) {
    const tool = this.tools.find(item => item.name === name)

    return [
      ...baseTool,
      tool,
    ]
  }
}

async function getPluginFromUrl(url: string) {
  const res = await fetch(url)
  const plugin = await res.json()

  const { name_for_human, name_for_model, description_for_human, logo_url } = plugin

  return {
    name: name_for_human,
    description: description_for_human,
    logo: logo_url,
    id: name_for_model,
  }
}

export const toolManage = new ToolManage()
