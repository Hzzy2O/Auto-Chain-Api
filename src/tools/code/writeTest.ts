import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'
import { callAIDesign } from '@/api'

export class TestCaseWriter extends StructuredTool {
  name = 'test-case-writer'
  description = 'according to the input code, generate test cases'
  schema = z.object({
    code: z.string().describe('code to generate test cases'),
  })

  constructor() {
    super()
  }

  async _call({ code }: z.infer<typeof this.schema>) {
    const role = 'A engineer for generating test cases'
    const args = [
      {
        name: 'code',
        value: code,
      },
    ]
    const description = 'your task is to analyze the given code and generate appropriate test cases for its functions or methods. '
      + 'you should consider edge cases, normal cases, and possible exceptions. '
      + 'the generated test cases should help users to ensure the correctness and reliability of their code.'
    const reply = 'the generated test cases'

    return await callAIDesign({ role, args, description, reply })
  }
}
