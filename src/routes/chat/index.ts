import express from 'express'
import {
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { LLMChainExtractor } from 'langchain/retrievers/document_compressors/chain_extract'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ContextualCompressionRetriever } from 'langchain/retrievers/contextual_compression'
import { RetrievalQAChain } from 'langchain/chains'
import { validateBody } from '../middleware'
import { Config } from '@/config'
import { WebSearchTool } from '@/tools/search'
import { getChatAI } from '@/api'
import { toolManage } from '@/chat/tools'

const router = express.Router()

const chatTools = [
  new RequestsGetTool(),
  new RequestsPostTool(),
  new WebSearchTool(),
]

router.post('/v1/chat/completions', validateBody(['model', 'messages']), async (req, res) => {
  try {
    const { model, messages: _messages, ...rest } = req.body

    const messages = _messages.filter((m: any) => m.role && m.content.trim().length > 0)

    const { content: question } = messages.pop()

    const chatAI = getChatAI({
      temperature: 0.9,
      streaming: true,
      modelName: model,
      ...rest,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            process.stdout.write(token)
            res.write(`data: ${token}\n\n`)
          },
        },
      ],
    })

    const baseCompressor = LLMChainExtractor.fromLLM(chatAI)

    const text = messages.map((m: any) => `${m.role}:${m.content}`).join('\n')
    // for (const m of messages) {

    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
    const docs = await textSplitter.createDocuments([text])

    // Create a vector store from the documents.
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({
      openAIApiKey: Config.OPENAI_API_KEY,
    }, {
      basePath: Config.OPENAI_URL,
    }))

    const retriever = new ContextualCompressionRetriever({
      baseCompressor,
      baseRetriever: vectorStore.asRetriever(),
    })

    const chain = RetrievalQAChain.fromLLM(model, retriever)

    await chain.call({
      query: question,
    })
    res.write('data: [DONE]')
    res.end()
  }
  catch (error) {
    return res.status(500).send({
      error: error.message,
    })
  }

  // return res.send({
  //   list: data,
  // })
})

router.get('/plugins', (req, res) => {
  const tools = toolManage.chatToolsForUser
  return res.send({
    tools,

  })
})

router.post('/addPlugin', validateBody(['body']), async (req, res) => {
  const { url } = req.body
  await toolManage.loadTools(url)

  return res.send({
    success: true,
  })
})

export default router
