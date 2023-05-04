import { BaseOutputParser } from 'langchain/schema'
import balanced from 'balanced-match'
import { fixAndParseJson } from './fix'
import type { AutoGPTAction } from '@/autogpt/schema'

export function preprocessJsonInput(inputStr: string): string {
  // Replace single backslashes with double backslashes,
  // while leaving already escaped ones intact
  const correctedStr = inputStr.replace(
    /(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    '\\\\',
  )
  return correctedStr
}

export class AutoGPTOutputParser extends BaseOutputParser<AutoGPTAction> {
  getFormatInstructions(): string {
    throw new Error('Method not implemented.')
  }

  async parse(text: string): Promise<AutoGPTAction> {
    let parsed: AutoGPTAction
    try {
      parsed = JSON.parse(text)
    }
    catch (error) {
      const preprocessedText = preprocessJsonInput(text)
      try {
        const match = balanced('{', '}', preprocessedText)
        if (match && match.body)
          parsed = JSON.parse(`{${match.body}}`)
      }
      catch (error) {
        try {
          const json = await fixAndParseJson(preprocessedText)
          if (typeof json === 'string')
            throw json

          parsed = json.command
        }
        catch (error) {
          return {
            command: {
              name: 'ERROR',
              args: { error: `Could not parse invalid json: ${text}` },
            },
          }
        }
      }
    }
    try {
      return {
        thoughts: {
          ...(parsed.thoughts ?? {} as any),
        },
        command: {
          name: parsed.command.name,
          args: parsed.command.args,
        },
      }
    }
    catch (error) {
      return {
        command: {
          name: 'ERROR',
          args: { error: `Incomplete command args: ${parsed}` },
        },
      }
    }
  }
}
