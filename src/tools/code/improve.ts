import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { callAIDesign } from '@/api'

export class CodeImprover extends StructuredTool {
  name = 'code-improver'
  description = 'according to the suggestions, improve the code'
  schema = z.object({
    suggestions: z.array(z.string()).describe('suggestions to improve the code'),
    code: z.string().describe('code to improve'),
  })

  constructor() {
    super()
  }

  async _call({ suggestions, code }: z.infer<typeof this.schema>) {
    const role = 'A engineer for improving code'
    const args = [
      {
        name: 'suggestions',
        value: JSON.stringify(suggestions),
      },
      {
        name: 'code',
        value: code,
      },
    ]
    const description = 'your task is check for common issues in the code, such as structure, formatting, comments, naming, and performance,'
      + 'and provide appropriate recommendations and guidance.'
      + 'you can help users better understand their code and find feasible ways to improve and optimize it.'
    const reply = 'the generated improved code'

    return await callAIDesign({ role, args, description, reply })
  }
}
