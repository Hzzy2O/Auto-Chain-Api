import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import {
  AIPluginTool,
  RequestsGetTool,
  RequestsPostTool,
} from 'langchain/tools'
import { getChatAI } from './api'
import { fetchAgent } from './utils'
import { WebSearchTool } from './tools/search'

const pl = [
  // 'https://aii.seovendor.co/.well-known/ai-plugin.json',
  // 'https://gpt.censys.io/.well-known/ai-plugin.json',
  // 'https://api.getit.ai/.well_known/ai-plugin.json',
  // 'https://woxo.tech/.well-known/ai-plugin.json',
  // 'https://api.triplewhale.com/.well-known/ai-plugin.json',
  // 'https://www.appypie.com/.well-known/ai-plugin.json',
  // 'https://www.gps-telecom.com/.well-known/ai-plugin.json',
  // 'https://textbelt.com/.well-known/ai-plugin.json',
  // 'https://mrkter.io/.well-known/ai-plugin.json',
  // 'https://babyagichatgpt.skirano.repl.co/.well-known/ai-plugin.json',
  // 'https://portfoliopilot.com/.well-known/ai-plugin.json',
  'https://www.greenyroad.com/.well-known/ai-plugin.json',
  // 'https://gptweather.skirano.repl.co/.well-known/ai-plugin.json',
  // 'https://domainsg.pt/.well-known/ai-plugin.json',
  // 'https://www.transvribe.com/.well-known/ai-plugin.json',
  'https://websearch.plugsugar.com/.well-known/ai-plugin.json',
  // 'https://apis.guru/.well-known/ai-plugin.json',
  // 'https://chat-calculator-plugin.supportmirage.repl.co/.well-known/ai-plugin.json',
  // 'https://datasette.io/.well-known/ai-plugin.json',
  // 'https://www.freetv-app.com/.well-known/ai-plugin.json',
  // 'https://www.klarna.com/.well-known/ai-plugin.json',
  // 'https://www.joinmilo.com/.well-known/ai-plugin.json',
  // 'https://www.pricerunner.com/.well-known/ai-plugin.json',
  // 'https://quickchart.io/.well-known/ai-plugin.json',
  // 'https://api.speak.com/.well-known/ai-plugin.json',
  // 'https://datamuse.com/.well-known/ai-plugin.json',
];
(async () => {
  const run = async () => {
    const tools = [
      new RequestsGetTool({
        agent: fetchAgent,
      }),
      new RequestsPostTool({
        agent: fetchAgent,
      }),
      await AIPluginTool.fromPluginUrl(
        // 'https://bing_services-1-o5366254.deta.app/static/schema.json',
        'https://www.klarna.com/.well-known/ai-plugin.json',
      ),
      new WebSearchTool(),
    ]
    const agent = await initializeAgentExecutorWithOptions(
      tools,
      getChatAI(),
      { agentType: 'chat-zero-shot-react-description', verbose: true },
    )

    const result = await agent.call({
      input: 'what did messi win in 2022 world cup?',
    })

    console.log({ result })
  }

  // const res = await fetch('https://www.klarna.com/.well-known/ai-plugin.json')
  // console.log(await res.json())
  // run()
  // const tool = await AIPluginTool.fromPluginUrl(
  //   // 'https://bing_services-1-o5366254.deta.app/static/schema.json',
  //   'https://www.klarna.com/.well-known/ai-plugin.json',
  // )
  // console.log(await getPluginFromUrl('https://www.klarna.com/.well-known/ai-plugin.json'))
  // const res = await fetch('https://websearch.plugsugar.com/api/plugins/websearch', {
  //   method: 'post',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     query: '2022 world cup winner',
  //   }),
  // })
  // console.log(await res.json())
  Promise.allSettled(pl.map(getPluginFromUrl))
    .then(async (plugins) => {
      console.log({ plugins })
      const res = plugins.filter(item => item.status === 'fulfilled').map(item => item.value).filter(item => item)
      // writeFileSync('plugins.json', JSON.stringify(res, null, 2), 'utf-8')
      console.log(res[0])

      const tools = [
        new RequestsGetTool({
          agent: fetchAgent,
        }),
        new RequestsPostTool({
          agent: fetchAgent,
        }),
        ...res,

        // new WebSearchTool(),
      ]
      const agent = await initializeAgentExecutorWithOptions(
        tools,
        getChatAI(),
        { agentType: 'chat-zero-shot-react-description', verbose: true },
      )

      const result = await agent.call({
        input: 'current time is 2023/5/10, search the web and answer who win the 2022 world cup?',
      })

      console.log(result)

      console.log(await agent.call({
        input: "who is 2022 world cup champion?"
      }))
    })
})()

async function getPluginFromUrl(url: string) {
  const res = await fetch(url)
  const plugin = await res.json()

  if (plugin.auth.type !== 'none')
    return null

  // const { text } = await fetch(plugin.api.url)
  // const apiJson = await text()

  return await AIPluginTool.fromPluginUrl(url)
}
