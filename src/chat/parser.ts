import { ChatAgentOutputParser } from 'langchain/agents'

// import { FORMAT_INSTRUCTIONS } from './prompt.js'

export const FINAL_ANSWER_ACTION = 'Final Answer:'
export class ChatGPTOutputParser extends ChatAgentOutputParser {
  async parse(text: string) {
    if (text.includes(FINAL_ANSWER_ACTION)) {
      const parts = text.split(FINAL_ANSWER_ACTION)
      const output = parts[parts.length - 1].trim()
      return { returnValues: { output }, log: text }
    }

    try {
      const match = /Action: (.*)\nAction Input: (.*)/s.exec(text)
      if (!match)
        throw new Error(`Could not parse LLM output: ${text}`)

      return {
        tool: match[1].trim(),
        toolInput: match[2].trim().replace(/^"+|"+$/g, ''),
        log: text,
      }

      // const action = text.includes('```')
      //   ? text.trim().split(/```(?:json)?/)[1]
      //   : text.trim()
      // const response = JSON.parse(action.trim())
      // return {
      //   tool: response.action,
      //   toolInput: response.action_input,
      //   log: text,
      // }
    }
    catch {
      throw new Error(
        `Unable to parse JSON response from chat agent.\n\n${text}`,
      )
    }
  }

  getFormatInstructions(): string {
    throw new Error('Not implemented')
  }
}
