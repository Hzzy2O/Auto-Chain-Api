import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { getChatAI } from './api'

export async function run() {
  const tools = [
    new RequestsGetTool(),
    new RequestsPostTool(),
    await AIPluginTool.fromPluginUrl(
      'https://www.klarna.com/.well-known/ai-plugin.json',
    ),
  ]
  const agent = await initializeAgentExecutorWithOptions(
    tools,
    getChatAI(),
    { agentType: 'chat-zero-shot-react-description', verbose: true },
  )

  const result = await agent.call({
    input: 'what t shirts are available in klarna?',
  })

  console.log({ result })
}

run()
