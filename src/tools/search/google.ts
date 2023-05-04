import { Buffer } from 'node:buffer'
import { google } from 'googleapis'

export async function searchGoogle(query: string) {
  const service = google.customsearch('v1')

  const result = await service.cse.list({
    q: query,
    cx: '067682bbe44904a09',
    num: 4,
    key: 'AIzaSyAluRA8ALXc2bFeW0snxJmtYVHdtZueHuQ',
  })

  const searchResults = result.data.items || []
  const searchResultsLinks = searchResults.map(item => item.link)

  return safeGoogleResults(searchResultsLinks)
}

function safeGoogleResults(results: string | string[]) {
  if (Array.isArray(results)) {
    const safeMessage = JSON.stringify(
      results.map(result => Buffer.from(result, 'utf-8').toString('utf-8')),
    )
    return safeMessage
  }
  else {
    const safeMessage = Buffer.from(results, 'utf-8').toString('utf-8')
    return safeMessage
  }
}
