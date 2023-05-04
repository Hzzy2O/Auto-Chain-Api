import type { Response } from 'node-fetch'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

import { extractHyperlinks, formatHyperlinks } from '../processing/html'

function sanitizeUrl(url: string): string {
  const parsed = new URL(url)
  return new URL(parsed.pathname, url).toString()
}

function checkLocalFileAccess(url: string): boolean {
  const local_prefixes = [
    'file:///',
    'file://localhost/',
    'file://localhost',
    'http://localhost',
    'http://localhost/',
    'https://localhost',
    'https://localhost/',
    'http://2130706433',
    'http://2130706433/',
    'https://2130706433',
    'https://2130706433/',
    'http://127.0.0.1/',
    'http://127.0.0.1',
    'https://127.0.0.1/',
    'https://127.0.0.1',
    'https://0.0.0.0/',
    'https://0.0.0.0',
    'http://0.0.0.0/',
    'http://0.0.0.0',
    'http://0000',
    'http://0000/',
    'https://0000',
    'https://0000/',
  ]
  return local_prefixes.some(prefix => url.startsWith(prefix))
}

async function getResponse(url: string, headers = undefined, timeout = 10000): Promise<[Response | null, string | null]> {
  try {
    if (checkLocalFileAccess(url))
      throw new Error('Access to local files is restricted')

    if (!url.startsWith('http://') && !url.startsWith('https://'))
      throw new Error('Invalid URL format')

    const sanitized_url = sanitizeUrl(url)
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(sanitized_url, { headers, signal: controller.signal })
    clearTimeout(id)
    if (response.status >= 400)
      return [null, `Error: HTTP ${response.status} error`]

    return [response, null]
  }
  catch (error) {
    return [null, `Error: ${error.message}`]
  }
}

export async function scrapeText(url: string): Promise<string> {
  const [response, error_message] = await getResponse(url)
  if (error_message)
    return error_message

  if (!response)
    return 'Error: Could not get response'

  const html = await response.text()
  const dom = new JSDOM(html)
  const soup = dom.window.document

  for (const script of Array.from(soup.querySelectorAll('script, style')))
    script.remove()

  const text = soup.body.textContent || ''
  const lines = text.split('\n').map(line => line.trim())
  const chunks = lines.flatMap(line => line.split('  ').map(phrase => phrase.trim()))
  const cleanedText = chunks.filter(chunk => chunk).join('\n')

  return cleanedText
}

export async function scrapeLinks(url: string) {
  const [response, error_message] = await getResponse(url)
  if (error_message)
    return error_message

  const html = await response.text()
  const dom = new JSDOM(html)
  const soup = dom.window.document

  for (const script of Array.from(soup.querySelectorAll('script, style')))
    script.remove()

  const hyperlinks = extractHyperlinks(soup, url)

  return formatHyperlinks(hyperlinks)
}
