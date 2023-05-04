import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { z } from 'zod'

import { FileTool } from './types'
import type { FileParams } from './types'

export class SearchFileTool extends FileTool {
  schema = z.object({
    directory: z.string().describe('The directory to search in'),
  })

  name = 'search_file'

  description = 'Search for files in a directory'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ directory }: z.infer<typeof this.schema>) {
    try {
      const foundFiles: string[] = []
      const { basePath } = this.store
      const dir = this.store.safePath(directory)

      for (const [root, _, files] of walkSync(dir)) {
        for (const file of files) {
          if (file.startsWith('.'))
            continue

          const relativePath = relative(basePath, join(root, file))
          foundFiles.push(relativePath)
        }
      }

      return JSON.stringify(foundFiles)
    }
    catch (err) {
      console.log('Search File Err:', err)
    }
  }
}

export function* walkSync(directory: string): IterableIterator<[string, string[], string[]]> {
  const dirents = readdirSync(directory, { withFileTypes: true })
  const files = dirents.filter(d => d.isFile()).map(d => d.name)
  const dirs = dirents.filter(d => d.isDirectory()).map(d => d.name)

  yield [directory, dirs, files]

  for (const dir of dirs) {
    const newDirectory = join(directory, dir)
    yield * walkSync(newDirectory)
  }
}
