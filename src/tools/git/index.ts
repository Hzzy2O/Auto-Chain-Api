import fs from 'node:fs'
import git from 'isomorphic-git'
import { z } from 'zod'
import http from 'isomorphic-git/http/node'

import type { FileParams } from '../file'
import { FileTool } from '../file'
import { Config } from '@/config'

export async function cloneRepository(
  repoUrl: string,
  clonePath: string,
): Promise<string> {
  const splitUrl = repoUrl.split('//')
  const authRepoUrl = `//${Config.GITHUB_USERNAME}:${Config.GITHUB_ACCESS_TOKEN}@${splitUrl[1]}`
  try {
    await git.clone({
      fs,
      http,
      url: authRepoUrl,
      dir: clonePath,
    })
    return `Cloned ${repoUrl} to ${clonePath}`
  }
  catch (e) {
    return `Error: ${e}`
  }
}

export class GitCloneTool extends FileTool {
  name = 'git-clone'
  description = 'Clone a git repository'
  schema = z.object({
    url: z.string().describe('The URL of the repository to clone'),
    dir: z.string().describe('The directory to clone the repository to'),
  })

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ url, dir }: z.infer<typeof this.schema>) {
    return await cloneRepository(url, this.store.safePath(dir))
  }
}
