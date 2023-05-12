import type { Response } from 'express'
import { BaseCallbackHandler } from 'langchain/callbacks'
import type { AgentAction } from 'langchain/schema'

interface Reply {
  content: string
  plugin: {
    request?: string
    response?: string
  }
}
export class ResCallbackHandler extends BaseCallbackHandler {
  name = 'ResCallbackHandler'
  response: Response
  toolUsed = false

  constructor(res: Response) {
    super()
    this.response = res
  }

  reply(val: Partial<Reply>) {
    this.response.write(`data: ${JSON.stringify({
      choices: [
        {
          ...val,
        },
      ],
    })}\n\n`)
  }

  async handleToolEnd(output: string) {
    this.reply({
      content: '',
      plugin: {
        response: output,
      },
    })
    this.toolUsed = true
  }

  handleLLMNewToken(token: string) {
    if (this.toolUsed) {
      this.reply({
        content: token,
      })
    }
  }

  handleAgentEnd() {
    this.response.write('data: [DONE]\n\n')
  }

  handleAgentAction(action: AgentAction) {
    this.reply({
      content: '',
      plugin: {
        request: action.toolInput,
      },
    })
  }
}
