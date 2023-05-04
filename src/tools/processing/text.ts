import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanChatMessage } from 'langchain/schema'
import type { WebDriver } from 'selenium-webdriver'
import nlp from 'compromise'
import sts from 'compromise-sentences'

import { countMessageTokens } from '@/utils/tokenCounter'
import { Config } from '@/config'

export function *splitText(
  text: string,
  max_length: number = Config.BROWER_CHUNK_LENGTH,
  question = '',
) {
  nlp.extend(sts)
  const flattened_paragraphs = text.replace(/\n/g, ' ')

  const doc = nlp(flattened_paragraphs)
  const sentences = doc.sentences().out('array')

  const current_chunk: string[] = []

  for (const sentence of sentences) {
    const message_with_additional_sentence = [
      createMessage(`${current_chunk.join(' ')} ${sentence}`, question),
    ]

    const expected_token_usage
      = countMessageTokens(message_with_additional_sentence) + 1
    if (expected_token_usage <= max_length) {
      current_chunk.push(sentence)
    }
    else {
      yield current_chunk.join(' ')
      current_chunk.length = 0
      current_chunk.push(sentence)
      const message_this_sentence_only = [
        createMessage(current_chunk.join(' '), question),
      ]
      const expected_token_usage
        = countMessageTokens(message_this_sentence_only) + 1
      if (expected_token_usage > max_length) {
        throw new Error(
          `Sentence is too long in webpage: ${expected_token_usage} tokens.`,
        )
      }
    }
  }

  if (current_chunk.length > 0)
    yield current_chunk.join(' ')
}

function createMessage(chunk: string, question: string) {
  return new HumanChatMessage(
    `"${chunk}" Using the above text, please answer the following question: "${question}" -- if the question cannot be answered using the text, please summarize the text.`,
  )
}

export async function summarizeText(
  url: string,
  text: string,
  question: string,
  driver?: WebDriver,
) {
  if (!text)
    return 'Error: No text to summarize'

  const chat = new ChatOpenAI({ openAIApiKey: Config.OPENAI_API_KEY, maxTokens: 300, temperature: 1 }, {
    basePath: 'https://openai.1rmb.tk/v1',
  })

  const summaries: string[] = []
  const chunks = Array.from(
    splitText(text, Config.BROWER_CHUNK_LENGTH, question),
  )
  // const chunks = await splitText(text, Config.BROWER_CHUNK_LENGTH, model, question)
  const scroll_ratio = 1 / chunks.length

  for (const [i, chunk] of chunks.entries()) {
    if (driver)
      scrollToPercentage(driver, scroll_ratio * i)

    // const memory_to_add_raw = `Source: ${url}\nRaw content part#${i + 1}: ${chunk}`
    // MEMORY.add(memory_to_add_raw);

    const messages = [createMessage(chunk, question)]
    // const tokens_for_chunk = token_counter.count_message_tokens(messages, model)
    // console.log(
    //   `Summarizing chunk ${i + 1} / ${chunks.length} of length ${chunk.length} characters, or ${tokens_for_chunk} tokens`,
    // )

    const { text: summary } = await chat.call(messages)
    summaries.push(summary)
    // console.log(
    //   `Added chunk ${i + 1} summary to memory, of length ${summary.length} characters`,
    // )

    // const memory_to_add_summary = `Source: ${url}\nContent summary part#${i + 1}: ${summary}`
    // MEMORY.add(memory_to_add_summary);
  }

  const combined_summary = summaries.join('\n')
  const messages = [createMessage(combined_summary, question)]

  const { text: replay } = await chat.call(messages)
  return replay
}

export function scrollToPercentage(
  driver: WebDriver,
  ratio: number,
): void {
  if (ratio < 0 || ratio > 1)
    throw new Error('Percentage should be between 0 and 1')
  driver.executeScript(`window.scrollTo(0, document.body.scrollHeight * ${ratio});`)
}
