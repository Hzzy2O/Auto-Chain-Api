import { Config } from '@/config'
import type { Recordable } from '@/types'

export async function searchByBingAI(query: string) {
  const body = JSON.stringify({
    question: query,
    style: 'precise',
  })
  const token = JSON.stringify([{
    name: '_U',
    value: Config.BING_AI_KEY,
  }])
  const response = await fetch(`${Config.BING_AI_URL}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body,
  })

  const { data, message } = await response.json() as Recordable
  if (!data)
    return message
  // const links = data.urls?.reduce((acc, cur) => {
  //   acc += `${cur.title}:${cur.url};`
  //   return acc
  // }, '')
  const links = data.urls?.map(e => e.url)

  return `${data.answer}\n ${links?.length ? `Reference: \n${links}` : ''}`
}
