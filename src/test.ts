import AI from '@/app'
import { Config } from '@/config'

(async () => {
  await AI.createAI(new Config(
    'draw',
    'draw ',
    ['draw a cat'],
  ))
  AI.listAI()
})()
