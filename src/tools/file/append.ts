import { z } from 'zod'

import { FileTool } from './types'
import type { FileParams } from './types'

export class AppendFileTool extends FileTool {
  schema = z.object({
    file_path: z.string().describe('The name of the file to append to'),
    text: z.string().describe('The text to append to the file'),
  })

  name = 'append_file'

  description = 'append text to a file'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ file_path, text }: z.infer<typeof this.schema>) {
    await this.store.appendFile(file_path, text)
    return 'Text appended successfully.'
  }
}
