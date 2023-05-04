import { z } from 'zod'

import { FileTool } from './types'
import type { FileParams } from './types'

export class DeleteFileTool extends FileTool {
  schema = z.object({
    file_path: z.string().describe('The name of the file to delete'),
  })

  name = 'delete_file'

  description = 'delete a file'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ file_path }: z.infer<typeof this.schema>) {
    await this.store.deleteFile(file_path)
    return 'File deleted successfully.'
  }
}
