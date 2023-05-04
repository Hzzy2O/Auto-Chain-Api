export function getModelNameForTiktoken(modelName: string) {
  if (modelName.startsWith('gpt-3.5-turbo-'))
    return 'gpt-3.5-turbo'

  if (modelName.startsWith('gpt-4-32k-'))
    return 'gpt-4-32k'

  if (modelName.startsWith('gpt-4-'))
    return 'gpt-4'

  return modelName
}

export function getEmbeddingContextSize(modelName: string) {
  switch (modelName) {
    case 'text-embedding-ada-002':
      return 8191
    default:
      return 2046
  }
}
export function getModelContextSize(modelName: string) {
  switch (getModelNameForTiktoken(modelName)) {
    case 'gpt-3.5-turbo':
      return 4096
    case 'gpt-4-32k':
      return 32768
    case 'gpt-4':
      return 8192
    case 'text-davinci-003':
      return 4097
    case 'text-curie-001':
      return 2048
    case 'text-babbage-001':
      return 2048
    case 'text-ada-001':
      return 2048
    case 'code-davinci-002':
      return 8000
    case 'code-cushman-001':
      return 2048
    default:
      return 4097
  }
}
