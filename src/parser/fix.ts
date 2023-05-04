import { correctJson } from './handler'
import { callAIDesign } from '@/api'

const JSON_SCHEMA = `
{
    "command": {
        "name": "command name",
        "args":{
            "arg name": "value"
        }
    },
    "thoughts": {
        "text": "thought",
        "reasoning": "reasoning",
        "plan": "- short bulleted\\n- list that conveys\\n- long-term plan",
        "criticism": "constructive self-criticism",
        "speak": "thoughts summary to say to user"
    }
}
`

export async function fixAndParseJson(
  json_str: string,
  try_to_fix_with_gpt = true,
): Promise<string | Record<string, any>> {
  // Fix and parse JSON string
  try {
    if (json_str.startsWith('Assistant Reply:'))
      json_str = json_str.replace('Assistant Reply:', '')

    json_str = json_str.replaceAll('\t', '')
    return JSON.parse(json_str)
  }
  catch (_) {
    try {
      json_str = correctJson(json_str)
      return JSON.parse(json_str)
    }
    catch (_) {
      try {
        const brace_index = json_str.indexOf('{')
        json_str = json_str.substring(brace_index)
        const last_brace_index = json_str.lastIndexOf('}')
        json_str = json_str.substring(0, last_brace_index + 1)
        return JSON.parse(json_str)
      }
      catch (e) {
        if (try_to_fix_with_gpt) {
          const ai_fixed_json = await fixJson(json_str)

          if (ai_fixed_json !== 'failed')
            return JSON.parse(ai_fixed_json)

          else
            return json_str
        }
        else {
          throw e
        }
      }
    }
  }
}

export async function fixJson(json_str: string) {
  const role = 'JSON fixer assistant'

  const description = `Your task is to make it parseable and fully compliant with the provided schema. 
If an object or field specified in the schema isn't contained within the correct JSON, it should be omitted.`

  const reply = 'a JSON string that can be parsed correctly by JSON.parse()'

  const args = [
    {
      name: 'json_str',
      value: json_str,
    },
    {
      name: 'schema',
      value: JSON_SCHEMA,
    },
  ]

  try {
    const response = await callAIDesign({
      role,
      description,
      reply,
      args,
    })
    return response
  }
  catch {
    // console.log(`Failed to fix JSON: '${json_str}'\n${stack}`);
    return 'failed'
  }
}
