import { Buffer } from 'node:buffer'
import { writeFileSync } from 'node:fs'
import fetch from 'node-fetch'

import { Config } from '@/config'
import type { Recordable } from '@/types'

export async function generateImgWithDalle(prompt: string, filename: string, size = 256): Promise<string> {
  if (![256, 512, 1024].includes(size)) {
    const closest = [256, 512, 1024].reduce((a, b) => Math.abs(b - size) < Math.abs(a - size) ? b : a)
    size = closest
  }

  const body = JSON.stringify({
    prompt,
    n: 1,
    size: `${size}x${size}`,
    response_format: 'b64_json',
  })

  const response = await fetch(`${Config.OPENAI_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Config.OPENAI_API_KEY}`,
    },
    body,
  }) as Recordable

  const { data, error } = await response.json()

  if (error)
    return error.message

  const image_data: Buffer = Buffer.from(data[0].b64_json, 'base64')

  writeFileSync(filename, image_data)

  return `Saved image to file:${filename}`
}
