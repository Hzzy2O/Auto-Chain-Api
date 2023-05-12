import express from 'express'
import type { Response } from 'express'

import type { AgentAction } from 'langchain/schema'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { BaseCallbackHandler } from 'langchain/callbacks'
import { validateBody } from '../middleware'
import { getChatAI } from '@/api'
import { countMessageTokens, count_string_tokens, getModelContextSize } from '@/utils/tokenCounter'
import { toolManage } from '@/chat/tools'

const router = express.Router()

interface Reply {
  content: string
  plugin: {
    request?: string
    response?: string
  }
}
class ResCallbackHandler extends BaseCallbackHandler {
  name = 'ResCallbackHandler'
  response: Response
  toolUsed = false

  constructor(res: Response) {
    super()
    this.response = res
  }

  reply(val: Partial<Reply>) {
    this.response.write(`data: ${JSON.stringify({
      choices: [
        {
          ...val,
        },
      ],
    })}\n\n`)
  }

  async handleToolEnd(output: string) {
    this.reply({
      content: '',
      plugin: {
        response: output,
      },
    })
    this.toolUsed = true
  }

  handleLLMNewToken(token: string) {
    if (this.toolUsed) {
      this.reply({
        content: token,
      })
    }
  }

  handleAgentEnd() {
    this.response.write('data: [DONE]\n\n')
  }

  handleAgentAction(action: AgentAction) {
    this.reply({
      content: '',
      plugin: {
        request: action.toolInput,
      },
    })
  }
}

router.post('/chat/completions', validateBody(['model', 'messages']), async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    })
    res.flushHeaders()
    const { model, messages: _messages, plugin, ...rest } = req.body

    const messages = _messages.filter((m: any) => m.role && m.content.trim().length > 0)

    const limit = getModelContextSize(model)
    const cost = countMessageTokens(messages, model)
    const isTooLong = cost > limit

    const { content: question } = messages.pop()

    const questionCost = count_string_tokens(question, model)
    if (questionCost > 3000) {
      return res.status(400).json({
        error: 'your submit is too long, please reload the conversation and submit something shorter',
      })
    }
    const chatAI = getChatAI({
      temperature: rest.temperature ?? 0.9,
      streaming: true,
      modelName: model,
      frequencyPenalty: rest.frequency_penalty,
      presencePenalty: rest.presence_penalty,
    })

    if (plugin) {
      const tools = toolManage.pickTool(plugin.id)
      const agent = await initializeAgentExecutorWithOptions(
        tools,
        getChatAI({
          streaming: true,
        }),
        { agentType: 'chat-zero-shot-react-description' },
      )

      await agent.call({
        input: 'what did messi win in 2022 world cup?',

      }, [new ResCallbackHandler(res)])
    }

    // if (isTooLong) {
    //   const baseCompressor = LLMChainExtractor.fromLLM(chatAI)

    //   const text = messages.map((m: any) => `${m.role}:${m.content}`).join('\n')

    //   const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
    //   const docs = await textSplitter.createDocuments([text])

    //   // Create a vector store from the documents.
    //   const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({
    //     openAIApiKey: Config.OPENAI_API_KEY,
    //   }, {
    //     basePath: Config.OPENAI_URL,
    //   }))

    //   const retriever = new ContextualCompressionRetriever({
    //     baseCompressor,
    //     baseRetriever: vectorStore.asRetriever(),
    //   })

    //   const chain = RetrievalQAChain.fromLLM(model, retriever)

    //   await chain.call({
    //     query: question,
    //   })
    // }
    // else {
    //   await chatAI.call([
    //     ...messages.map(item => item.role === 'user' ? new HumanChatMessage(item.content) : new SystemChatMessage(item.content)),
    //     new HumanChatMessage(question),
    //   ])
    // }
    process.stdout.write('[DONE]')
    res.write('data: [DONE]\n\n')
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

router.get('/plugins', async (req, res) => {
  if (toolManage.initPromise)
    await toolManage.initPromise

  const tools = toolManage.chatToolsForUser
  return res.send({
    tools,

  })
})

router.post('/plugins/add', validateBody(['url']), async (req, res) => {
  const { url } = req.body
  await toolManage.loadTools(url)

  return res.send({
    success: true,
  })
})

export default router
