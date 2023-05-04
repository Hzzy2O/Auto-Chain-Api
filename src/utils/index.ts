import { HttpsProxyAgent } from 'https-proxy-agent'
import { HttpProxyAgent } from 'http-proxy-agent'
import type { RequestInit } from 'node-fetch'

import { Config } from '@/config'

export const httpAgent = new HttpProxyAgent(Config.HTTP_PROXY)
export const httpsAgent = new HttpsProxyAgent(Config.HTTP_PROXY)

export const fetchAgent: RequestInit['agent'] = (parsedUrl: URL) => {
  if (!Config.HTTP_PROXY)
    return undefined

  return parsedUrl.protocol === 'http:' ? httpAgent : httpAgent
}
