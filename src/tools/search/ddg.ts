import fetch from 'node-fetch'
import { fetchAgent } from '@/utils'

export async function searchDuckDuckGo(query: string) {
  const resp = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`,
    {
      agent: fetchAgent,
    },

  )

  if (resp.status !== 200)
    throw new Error(`Got error from duckduckgoAPI: ${resp.statusText}`)
  const res: any = await resp.json()

  if (resp.ok) {
    let result = res.AbstractText
    for (const text of res.Results)
      result += ` ${text}.`

    if (result)
      return result
  }

  return 'no result'
}
