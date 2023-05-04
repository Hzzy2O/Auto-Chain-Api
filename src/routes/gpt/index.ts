import { statSync } from 'node:fs'
import { join } from 'node:path'
import express from 'express'
import { validateBody } from '../middleware'
import manager from '@/app'
import { Config } from '@/config'
import { createZipFile, getAllFilesInfo } from '@/utils/file'

const router = express.Router()

router.get('/', (_, res) => {
  const list = manager.listAI()
  const data = list.map((ai) => {
    const { ai_name, ai_role, ai_goals } = ai.config
    return {
      id: ai.id,
      ai_name,
      ai_role,
      ai_goals,
      messages: ai.messages,
      finish: ai.finished,
    }
  })

  return res.send({
    list: data,
  })
})

router.post('/create', validateBody(['ai_name', 'ai_role', 'ai_goals']), async (req, res) => {
  const { ai_name, ai_role, ai_goals } = req.body
  const config = new Config(ai_name, ai_role, ai_goals)
  const gpt_id = await manager.createAI(config)

  res.send({
    id: gpt_id,
  })
})

router.post('/run', validateBody(['gpt_id']), async (req, res) => {
  try {
    const { gpt_id } = req.body
    const { reply_json, tool_result, finish, has_file } = await manager.runAI(gpt_id)

    res.send({
      reply_json,
      tool_result,
      finish,
      has_file,
    })
  }
  catch (err) {
    res.status(400).send({
      message: err.message ? err.message : err,
    })
  }
})

router.post('/delete', validateBody(['gpt_id']), (req, res) => {
  res.send(`Delete user with ID: ${req.body.id}`)
})

router.post('/download', validateBody(['gpt_id']), (req, res) => {
  const { gpt_id, path } = req.body
  const ai = manager.getAI(gpt_id)
  const inputPath = join(ai.filePath, path)
  if (statSync(inputPath).isDirectory()) {
    const archive = createZipFile(inputPath)

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', 'attachment; filename=compressed-files.zip')

    archive.pipe(res)
  }
  else {
    res.download(inputPath)
  }
})

router.post('/file', validateBody(['gpt_id']), (req, res) => {
  const { gpt_id } = req.body
  const ai = manager.getAI(gpt_id)
  const inputPath = ai.filePath
  const info = getAllFilesInfo(inputPath)

  res.send(info)
})

export default router
