import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { GPTRoute, V1Route } from '@/routes'
import 'isomorphic-fetch'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/autogpt', GPTRoute)
app.use('/v1', V1Route)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`PORT Listen At ${PORT}`)
})
