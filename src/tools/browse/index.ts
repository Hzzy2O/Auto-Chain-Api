import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'

import { browseWebsiteWithSelenium } from './selenium'

export class BrowseWebTool extends StructuredTool {
  name = 'browse-website'
  description = 'browse a website,extracts relevant information to answer a question, and retrieves important links from the webpage'
  schema = z.object({
    url: z.string().describe('the url to browse'),
    question: z.string().describe('what you want find on the website'),
  })

  constructor() {
    super()
  }

  async _call({ url, question }: z.infer<typeof this.schema>) {
    return browseWebsiteWithSelenium(url, question)
  }
}
