interface Hyperlink {
  text: string
  url: string
}

export function extractHyperlinks(document: Document, baseUrl: string): Hyperlink[] {
  const hyperlinks: Hyperlink[] = []
  const linkElements = document.querySelectorAll('a[href]')

  linkElements.forEach((link) => {
    const text = link.textContent || ''
    const href = link.getAttribute('href') || ''
    const url = new URL(href, baseUrl).href
    hyperlinks.push({ text, url })
  })

  return hyperlinks
}

export function formatHyperlinks(hyperlinks: Hyperlink[]): string[] {
  return hyperlinks.map(({ text, url }) => `${text} (${url})`)
}
