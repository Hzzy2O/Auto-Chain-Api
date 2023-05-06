import { appendFile, readFile, unlink, writeFile } from 'node:fs/promises'
import { mkdtempSync, rm, statSync } from 'node:fs'
import { join } from 'node:path'
import { PineconeClient } from '@pinecone-database/pinecone'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'

import { BaseFileStore } from 'langchain/schema'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { safePath } from '@/utils/file'
import { Config } from '@/config'

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
    const _path = safeJoin(this.basePath, path)
    if (statSync(_path).isDirectory()) {
      rm(_path, {
        force: true,
        recursive: true,
      }, () => {})
    }

    else { await unlink(safeJoin(this.basePath, path)) }
  }
}

export async function getVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: Config.OPENAI_API_KEY,
  }, {
    basePath: Config.OPENAI_URL,
  })

  if (Config.PINECONE_API_KEY && Config.PINECONE_INDEX && Config.PINECONE_ENVIRONMENT) {
    const client = new PineconeClient()

    await client.init({
      apiKey: Config.PINECONE_API_KEY,
      environment: Config.PINECONE_ENVIRONMENT,
    })
    const pineconeIndex = client.Index(Config.PINECONE_INDEX)

    return new PineconeStore(embeddings, {
      pineconeIndex,
    })
  }
  else {
    return new HNSWLib(
      embeddings,
      {
        space: 'cosine',
        numDimensions: 1536,
      },
    )
  }
}
