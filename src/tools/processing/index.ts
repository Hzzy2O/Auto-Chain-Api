import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'

import { HumanChatMessage } from 'langchain/schema'
import { scrapeLinks, scrapeText } from '../browse/request'
import { summarizeText } from './text'
import { getChatAI } from '@/api'

export class TextSummary extends StructuredTool {
  name = 'text-summary'
  description = 'summarize the given url and attempt to answer the posed question'

  schema = z.object({
    url: z.string().describe('the url to scrape'),
    question: z.string().describe('the question to answer'),
  })

  async _call({ url, question }: z.infer<typeof this.schema>) {
    const text = await scrapeText(url)
    const summary = await summarizeText(url, text, question)
    return `"Result": ${summary}`
  }
}

export class ScrapeLinks extends StructuredTool {
  schema = z.object({
    url: z.string().describe('the url to scrape'),
  })

  name = 'scrape-links'

  description = 'scrape links from a webpage'

  async _call({ url }: z.infer<typeof this.schema>) {
    const links = await scrapeLinks(url)
    return `"Result": ${links}`
  }
}

export class TranslateTool extends StructuredTool {
  schema = z.object({
    target_language: z.string().describe('the language to translate to'),
    text: z.string().describe('the text to translate'),
  })

  name = 'translate-tool'

  description = 'translate text to another language'

  async _call({ target_language, text }: z.infer<typeof this.schema>) {
    const chat = getChatAI()

    const { text: result } = await chat.call([
      new HumanChatMessage(
        `please translate the follow text to ${target_language}\n ${text}`,
      ),
    ])

    return `"Result": ${result}`
  }
}
