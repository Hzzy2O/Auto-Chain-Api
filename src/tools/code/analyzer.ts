import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { callAIDesign } from '@/api'

export class CodeAnalyzer extends StructuredTool {
  name = 'code-analyzer'
  description = 'analyze the input code and provide insights about its structure, design patterns, performance, and potential issues'
  schema = z.object({
    code: z.string().describe('the code to analyze'),
  })

  constructor() {
    super()
  }

  async _call({ code }: z.infer<typeof this.schema>) {
    const role = 'A engineer for analyzing code'
    const args = [
      {
        name: 'code',
        value: code,
      },
    ]
    const description = 'your task is to analyze the given code and provide insights about its structure, design patterns, performance, and potential issues. '
      + 'you should identify areas that might need improvement or optimization, as well as any possible bugs or security vulnerabilities. '
      + 'the analysis should help users to understand their code better and make informed decisions on how to refactor or enhance it.'
    const reply = 'the analysis results and insights'

    return await callAIDesign({ role, args, description, reply })
  }
}
