import type { Response } from 'express'
import { BaseCallbackHandler } from 'langchain/callbacks'
import type { AgentAction } from 'langchain/schema'

export class ChatCallbackHandler extends BaseCallbackHandler {
  name = 'ChatCallbackHandler'

  response: Response

  constructor(res: Response) {
    super()
    console.log('load callbacks handler')

    this.response = res
  }

  handleAgentAction(action: AgentAction) {
    // console.log('')
  }

  async handleToolStart(action) {
    console.log('my tool start', action)
  }

  async handleToolError(err: any) {
    console.log('my tool error', err)
  }

  async handleToolEnd(output: string) {
    console.log('my tool end', output)
  }

  handleLLMNewToken(token: string) {
    process.stdout.write(token)
    console.log('llm token:', token)
  }
}
