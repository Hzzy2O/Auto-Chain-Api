import fetch from 'node-fetch'

import { Config } from '@/config'
import type { Recordable } from '@/types'
import { downloadFileByLinks } from '@/utils/file'

export async function generateImgWithBing(prompt: string, basePath: string) {
  const body = JSON.stringify({
    prompt,
  })
  const response = await fetch(`${Config.BING_AI_URL}/create_image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Config.BING_AI_KEY}`,
    },
    body,
  })

  const { data, message } = await response.json() as Recordable
  if (!data)
    return message

  const imgs = await downloadFileByLinks(data.imgs, basePath)

  return `Save images to file: ${JSON.stringify(imgs)}}`
}
