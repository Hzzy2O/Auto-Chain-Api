import { LLMChain } from 'langchain/chains'
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents'
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts'
import { getChatAI } from './api'
import { WebSearchTool } from './tools/search'

export async function run() {
  const tools = [
    new WebSearchTool(),
  ]

  const prompt = ZeroShotAgent.createPrompt(tools, {
    prefix: 'Answer the following questions as best you can, but speaking as a pirate might speak. You have access to the following tools:',
    suffix: 'Begin! Remember to speak as a pirate when giving your final answer. Use lots of "Args"',
  })

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new SystemMessagePromptTemplate(prompt),
    HumanMessagePromptTemplate.fromTemplate(`{input}

This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
{agent_scratchpad}`),
  ])

  const chat = getChatAI()

  const llmChain = new LLMChain({
    prompt: chatPrompt,
    llm: chat,
  })

  const agent = new ZeroShotAgent({
    llmChain,
    allowedTools: tools.map(tool => tool.name),
  })

  const executor = AgentExecutor.fromAgentAndTools({ agent, tools })

  const response = await executor.run(
    'How many people live in canada as of 2023?',
  )

  console.log(response)
}
(async () => {
  await run()
})()
