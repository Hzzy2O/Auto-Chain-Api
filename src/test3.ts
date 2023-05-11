import {
  AgentActionOutputParser,
} from 'langchain/agents'

import type {
  AgentAction,
  AgentFinish,
} from 'langchain/schema'

import { SerpAPI } from 'langchain/tools'
import { Calculator } from 'langchain/tools/calculator'
import { BaseCallbackHandler } from 'langchain/callbacks'
import { getChatAI } from './api'
import { ChatGPT } from './chat'
import { getPrompt } from './autogpt/prompt_generator'

class MyCallbackHandler extends BaseCallbackHandler {
  name = 'MyCallbackHandler'

  async handleToolStart(action) {
    console.log('my tool start', action)
  }

  async handleToolError(err: any) {
    console.log('my tool error', err)
  }

  async handleToolEnd(output: string) {
    console.log('my tool end', output)
  }

  async handleText(text: string) {
    console.log(text)
  }

  async handleLLMStart(action) {
    console.log('llm start :', action)
  }

  handleLLMNewToken(token: string) {
    process.stdout.write(token)
  }
}

const PREFIX = 'Answer the following questions as best you can. You have access to the following tools:'
function formatInstructions() {
  return `The way you use the tools is by specifying a json blob, denoted below by $JSON_BLOB
Specifically, this $JSON_BLOB should have a "action" key (with the name of the tool to use) and a "action_input" key (with the input to the tool going here). 
The $JSON_BLOB should only contain a SINGLE action, do NOT return a list of multiple actions. Here is an example of a valid $JSON_BLOB:

\`\`\`
{{
  "action": "calculator",
  "action_input": "1 + 2"
}}
\`\`\`

ALWAYS use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: 
\`\`\`
$JSON_BLOB
\`\`\`
Observation: the result of the action
... (this Thought/Action/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question`
}
const SUFFIX = 'Begin! Reminder to always use the exact characters `Final Answer` when responding.'
const DEFAULT_HUMAN_MESSAGE_TEMPLATE = '{input}\n\n{agent_scratchpad}'

class CustomOutputParser extends AgentActionOutputParser {
  async parse(text: string): Promise<AgentAction | AgentFinish> {
    console.log('output:', text)
    if (text.includes('Final Answer:')) {
      const parts = text.split('Final Answer:')
      const input = parts[parts.length - 1].trim()
      const finalAnswers = { output: input }
      return { log: text, returnValues: finalAnswers }
    }

    const match = /Action: (.*)\nAction Input: (.*)/s.exec(text)
    if (!match)
      throw new Error(`Could not parse LLM output: ${text}`)

    return {
      tool: match[1].trim(),
      toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
      log: text,
    }
  }

  getFormatInstructions(): string {
    throw new Error('Not implemented')
  }
}

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: 'Austin,Texas,United States',
    hl: 'en',
    gl: 'us',
  }),
  new Calculator(),
]
export async function run() {
  const model = getChatAI()

  const chat = ChatGPT.fromLLMAndTools(
    model,
    tools,
    {

    },
  )
  // const input = 'Who is Olivia Wilde\'s boyfriend? What is his current age raised to the 0.23 power?'
  const input = 'what is the result of 29^0.23'

  const result = await chat.run(input)

  console.log(`Got output ${result.output}`)
}
run()
