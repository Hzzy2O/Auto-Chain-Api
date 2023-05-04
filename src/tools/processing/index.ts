import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'

import { scrapeLinks, scrapeText } from '../browse/request'
import { summarizeText } from './text'

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
