import type { OpenAIChatInput } from 'langchain/chat_models/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'
import { Config } from '@/config'

export function getChatAI(input?: Partial<OpenAIChatInput>) {
  return new ChatOpenAI({
    temperature: Config.TEMPERATURE,
    ...input,
  }, {
    basePath: Config.OPENAI_URL,
  })
}

interface CallAIParams {
  role: string
  description: string
  args: Array<{
    name: string
    value: string
  }>
  reply: string

}
export async function callAIDesign({
  role,
  args,
  description,
  reply,
}: CallAIParams) {
  const chat = getChatAI()

  let argInput = ''
  const argSetting = []
  for (const arg of args) {
    argInput += `the ${arg.name} is ${arg.value},`
    argSetting.push(`a ${arg.name}`)
  }

  const sysMsg = `You are now a ${role} assistant. I will provide you with ${argSetting.join(' and ')}.
${description}.You only need to reply with ${reply}.
Apart from this, you don't need to reply with any content or explanation.`

  const messages = [
    new SystemChatMessage(sysMsg),
    new HumanChatMessage(argInput),
  ]

  const { text } = await chat.call(messages)

  return text
}
