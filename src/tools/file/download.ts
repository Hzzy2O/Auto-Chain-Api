import { z } from 'zod'

import { FileTool } from './types'
import type { FileParams } from './types'
import { downloadFile, readableFileSize } from '@/utils/file'

export class DownloadFileTool extends FileTool {
  schema = z.object({
    url: z.string().describe('URL of the file to download'),
    file_path: z.string().describe('Filename to save the file as'),
  })

  name = 'download_file'

  description = 'download a file from a URL'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ url, file_path }: z.infer<typeof this.schema>) {
    try {
      const { totalSize } = await downloadFile(url, this.store.safePath(file_path))

      return `Successfully downloaded and locally stored file: "${file_path}"! (Size: ${readableFileSize(totalSize)})`
    }
    catch (err) {
      console.log('download Err:', err)
    }
  }
}
