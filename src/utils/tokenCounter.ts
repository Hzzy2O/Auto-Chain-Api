import type { Tiktoken, TiktokenModel } from '@dqbd/tiktoken'
import { encoding_for_model, get_encoding } from '@dqbd/tiktoken'

export function countMessageTokens(messages: any[], model: TiktokenModel = 'gpt-3.5-turbo-0301'): number {
  let encoding: Tiktoken
  try {
    encoding = encoding_for_model(model)
  }
  catch (error) {
    encoding = get_encoding('cl100k_base')
  }

  let tokens_per_message = 0
  let tokens_per_name = 0
  if (model === 'gpt-3.5-turbo') {
    return countMessageTokens(messages, 'gpt-3.5-turbo-0301')
  }
  else if (model === 'gpt-4') {
    return countMessageTokens(messages, 'gpt-4-0314')
  }
  else if (model === 'gpt-3.5-turbo-0301') {
    tokens_per_message = 4
    tokens_per_name = -1
  }
  else if (model === 'gpt-4-0314') {
    tokens_per_message = 3
    tokens_per_name = 1
  }
  else {
    throw new Error(
      `num_tokens_from_messages() is not implemented for model ${model}.\n`
      + ' See https://github.com/openai/openai-python/blob/main/chatml.md for'
      + ' information on how messages are converted to tokens.',
    )
  }
  let num_tokens = 0

  for (const message of messages) {
    num_tokens += tokens_per_message
    for (const key in message) {
      if (typeof message[key] !== 'string')
        continue
      num_tokens += encoding.encode(message[key]).length

      if (key === 'name')
        num_tokens += tokens_per_name
    }
  }

  num_tokens += 3 // every reply is primed with assistant
  encoding.free()
  return num_tokens
}

export function count_string_tokens(string: string, model_name: TiktokenModel): number {
  const encoding = encoding_for_model(model_name)
  const num_tokens = encoding.encode(string).length
  encoding.free()
  return num_tokens
}
