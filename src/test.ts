import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { getChatAI } from './api'
import { fetchAgent } from './utils'
import { WebSearchTool } from './tools/search'

(async () => {
  const run = async () => {
    const tools = [
      new RequestsGetTool({
        agent: fetchAgent,
      }),
      new RequestsPostTool({
        agent: fetchAgent,
      }),
      await AIPluginTool.fromPluginUrl(
        // 'https://bing_services-1-o5366254.deta.app/static/schema.json',
        'https://www.klarna.com/.well-known/ai-plugin.json'
      ),
      new WebSearchTool(),
    ]
    const agent = await initializeAgentExecutorWithOptions(
      tools,
      getChatAI(),
      { agentType: 'chat-zero-shot-react-description', verbose: true },
    )

    const result = await agent.call({
      input: 'what did messi win in 2022 world cup?',
    })

    console.log({ result })
  }

  // const res = await fetch('https://www.klarna.com/.well-known/ai-plugin.json')
  // console.log(await res.json())
  run()
})()
