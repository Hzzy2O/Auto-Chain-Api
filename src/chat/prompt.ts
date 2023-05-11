import type { SerializedBasePromptTemplate } from 'langchain/prompts'
import { BaseChatPromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts'

import type {
  AgentStep,
  PartialValues,
} from 'langchain/schema'

import type { BasePromptTemplate } from 'langchain'
import type { Tool } from 'langchain/tools'
import { ZeroShotAgent } from 'langchain/agents'

export interface ChatPromptInput {
  tools: Tool []
}

const md = `
The way you use the tools is by specifying a json blob, denoted below by $JSON_BLOB
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
Final Answer: the final answer to the original input question
`

export class ChatPrompt
  extends BaseChatPromptTemplate
  implements ChatPromptInput {
  tools: Tool []

  constructor(fields: ChatPromptInput) {
    super({ inputVariables: ['input', 'agent_scratchpad'] })
    this.tools = fields.tools
  }

  _getPromptType() {
    return 'chat' as const
  }

  async formatMessages({
    // messages: previousMessages,
    input,
    ...ext
  }: {
    // messages: BaseChatMessage[]
    input: string
    intermediate_steps: AgentStep[]
  }) {
    const prompt = ZeroShotAgent.createPrompt(this.tools, {
      prefix: 'Answer the following questions as best you can, but speaking as a pirate might speak. You have access to the following tools:',
      suffix: 'Begin! Remember to speak as a pirate when giving your final answer. Use lots of "Args"',
    })

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate(`{input}

      This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
      {agent_scratchpad}`),
    ])

    const intermediateSteps = ext.intermediate_steps
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) =>
        thoughts
        + [action.log, `\nObservation: ${observation}`, 'Thought:'].join('\n'),
      '',
    )
    console.log(prompt)

    return chatPrompt.formatMessages({ tools: this.tools, input, agent_scratchpad: agentScratchpad })
  }

  async partial(_values: PartialValues): Promise<BasePromptTemplate> {
    throw new Error('Method not implemented.')
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error('Method not implemented.')
  }
}
