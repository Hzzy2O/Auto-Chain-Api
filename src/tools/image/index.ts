import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import type { FileParams } from '../file'
import { FileTool } from '../file'
import { generateImgWithBing } from './bing'
import { generateImgWithDalle } from './dalle'

import { generateImgWithMidJourney } from './midjourney'
import { Config } from '@/config'
import type { Recordable } from '@/types'

export class ImageGenerator extends FileTool {
  name = 'image-generator'
  description = 'Generate an image from a prompt'
  schema = z.object({
    prompt: z.string().describe('The prompt to generate an image from'),
    size: z.number().optional(),
  })

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ prompt, size }: Recordable): Promise<string> {
    const filename = `img_${uuidv4()}.jpg`
    if (Config.IMAGE_PROVIDER === 'dalle')
      return generateImgWithDalle(prompt, this.store.safePath(filename), size)
    else if (Config.IMAGE_PROVIDER === 'bing')
      return generateImgWithBing(prompt, this.store.basePath)
    else if (Config.IMAGE_PROVIDER === 'midjourney')
      return generateImgWithMidJourney(prompt, this.store.safePath(filename))
  }
}
