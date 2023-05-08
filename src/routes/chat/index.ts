import express from 'express'
import {
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { getChatAI } from '@/api'
import { WebSearchTool } from '@/tools/search'

const router = express.Router()

const chatTools = [
  new RequestsGetTool(),
  new RequestsPostTool(),
  new WebSearchTool(),
]

router.post('/chat', (req, res) => {
  const model = getChatAI({
    temperature: 0.9,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          process.stdout.write(token)
          res.write(`data: ${token}\n\n`)
        },
      },
    ],
  })

  // return res.send({
  //   list: data,
  // })
})

router.get('/plugins', (req, res) => {
  const tools = chatTools.map((tool) => {
    return {
      name: tool.name,
      description: tool.description,
    }
  })

  return res.send({
    tools,

  })
})

export default router
