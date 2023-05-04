import { existsSync, mkdirSync } from 'node:fs'

import { WebSearchTool } from './search'
import { BrowseWebTool } from './browse'
import { ScrapeLinks, TextSummary } from './processing'
import { CodeAnalyzer, CodeExecuter, CodeImprover, TestCaseWriter } from './code'
import { ImageGenerator } from './image'
import { AppendFileTool, DeleteFileTool, DownloadFileTool, SearchFileTool } from './file'
import { GitCloneTool } from './git'
import { ShellExecutor, ShellPopenExecutor } from './shell'

import { ReadFileTool, WriteFileTool } from '@/autogpt/tools'
import type { NodeIOFileStore } from '@/store'

if (!existsSync('tmp'))
  mkdirSync('tmp')

export function getTools(store: NodeIOFileStore) {
  const tools = [
    new ReadFileTool({ store }),
    new WriteFileTool({ store }),
    new CodeExecuter({ store }),
    new AppendFileTool({ store }),
    new DeleteFileTool({ store }),
    new DownloadFileTool({ store }),
    new SearchFileTool({ store }),
    new GitCloneTool({ store }),
    new ShellExecutor({ store }),
    new ShellPopenExecutor({ store }),
    new ImageGenerator({ store }),
    new BrowseWebTool(),
    new WebSearchTool(),
    new CodeAnalyzer(),
    new CodeImprover(),
    new TestCaseWriter(),
    new TextSummary(),
    new ScrapeLinks(),
  ]

  return tools
}
