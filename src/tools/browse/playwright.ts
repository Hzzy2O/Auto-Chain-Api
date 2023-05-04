import { Tool } from 'langchain/tools'
import type { PlaywrightEvaluate } from 'langchain/document_loaders/web/playwright'
import { PlaywrightWebBaseLoader } from 'langchain/document_loaders/web/playwright'
import { JSDOM } from 'jsdom'

const evaluate: PlaywrightEvaluate = async (page, _) => {
  const content = await page.content()

  const dom = new JSDOM(content)
  const document = dom.window.document

  const elementsToRemove = Array.from(
    document.querySelectorAll('script, style'),
  )

  for (const element of elementsToRemove)
    element.remove()

  const text = document.body.textContent || ''
  const lines = text.split('\n').map(line => line.trim())
  const chunks = lines.flatMap(line => line.split(/\s{2,}/).map(phrase => phrase.trim()))
  const cleanedText = chunks.filter(chunk => chunk).join('\n')

  return cleanedText
}

export class playwrightBrowse extends Tool {
  name = 'browse-web'

  constructor() {
    super()
  }

  async _call(url: string) {
    const loader = new PlaywrightWebBaseLoader(url, {
      evaluate,
    })
    const docs = await loader.load()
    return docs.pop().pageContent
  }

  description = 'browse website'
}
