import { appendFile, readFile, unlink, writeFile } from 'node:fs/promises'
import { mkdtempSync } from 'node:fs'
import { join } from 'node:path'

import { BaseFileStore } from 'langchain/schema'
import { safePath } from '@/utils/file'

const safeJoin = (basePath: string, path: string) => join(basePath, safePath(path))

export class NodeIOFileStore extends BaseFileStore {
  constructor(public basePath: string = mkdtempSync('langchain_')) {
    super()
  }

  async readFile(path: string): Promise<string> {
    return await readFile(safeJoin(this.basePath, path), 'utf8')
  }

  safePath(path: string) {
    return safeJoin(this.basePath, path)
  }

  async writeFile(path: string, contents: string): Promise<void> {
    await writeFile(safeJoin(this.basePath, path), contents, 'utf8')
  }

  async appendFile(path: string, contents: string): Promise<void> {
    await appendFile(safeJoin(this.basePath, path), contents, 'utf8')
  }

  async deleteFile(path: string): Promise<void> {
    await unlink(safeJoin(this.basePath, path))
  }
}
