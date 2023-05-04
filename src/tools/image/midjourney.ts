import fetch from 'node-fetch'

import type { Recordable } from '@/types'
import { downloadFile } from '@/utils/file'
import { Config } from '@/config'

export async function generateImgWithMidJourney(prompt: string, file: string) {
  const body = JSON.stringify({
    key: Config.MID_JOURNEY_KEY,
    model_id: 'midjourney',
    prompt,
    negative_prompt: '((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), (((tiling))), ((naked)), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs)), anime',
    width: '512',
    height: '512',
    samples: 1,
    num_inference_steps: '30',
    enhance_prompt: 'yes',
    seed: null,
    guidance_scale: 7.5,
    prompt_strength: 1,
    webhook: null,
    track_id: null,
  })

  const response = await fetch('https://stablediffusionapi.com/api/v3/dreambooth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })

  const { output } = await response.json() as Recordable
  if (!output.length)
    return 'can not get result'

  const img = await downloadFile(output, file)

  return `Save image to file: ${img}}`
}
