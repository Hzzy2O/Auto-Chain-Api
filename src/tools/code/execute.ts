import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'
import Docker from 'dockerode'
import getStream from 'get-stream'
import type { NodeFileStore } from 'langchain/stores/file/node'

import type { FileParams } from '../file'

export class CodeExecuter extends StructuredTool {
  name = 'code-executer'
  description = 'execute javaScript file or python file in an isolated environment using Docker containers. Captures and returns the printed output from the script execution'
  schema = z.object({
    file_path: z.string(),
    code_type: z.enum(['js', 'py']),
  })

  store: NodeFileStore

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ file_path, code_type }: z.infer<typeof this.schema>) {
    if (!file_path.endsWith(code_type))
      return 'Error: Invalid file type. Only .js files are allowed.'

    if (!existsSync(`${this.store.basePath}/${file_path}`))
      return `Error: File '${file_path}' does not exist.`

    const imageName = code_type === 'js' ? 'node:18-alpine' : 'python:3-alpine'

    const execCmd = code_type === 'js' ? `node ${file_path}` : `python ${file_path}`

    try {
      if (weAreRunningInADockerContainer()) {
        const result = spawnSync(`node ${file_path}`, [], { encoding: 'utf-8', shell: true })
        if (result.status === 0)
          return result.stdout
        else
          return `Error: ${result.stderr}`
      }

      const client = new Docker()

      try {
        await client.getImage(imageName).inspect()
      }
      catch (err) {
        const stream = await client.pull(imageName, {})
        await new Promise((resolve, reject) => {
          client.modem.followProgress(stream, (err: any, output: any) => {
            if (err)
              reject(err)

            resolve(output)
          })
        })
      }

      const basePath = this.store.basePath
      const dir = path.resolve(path.join(process.cwd(), basePath))
      const containerInfo = await client.createContainer({
        Image: imageName,
        Cmd: ['/bin/sh', '-c', execCmd],
        HostConfig: {
          Binds: [`${dir}:/workspace:ro`],
        },
        WorkingDir: '/workspace',
      })

      const container = client.getContainer(containerInfo.id)

      await container.start()

      const stream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
      })
      const logs = await getStream(stream)

      await container.remove({ force: true })

      return logs
    }
    catch (err) {
      console.error('Could not run the script in a container. If you haven\'t already, please install Docker https://docs.docker.com/get-docker/')
      return `Error: ${err.message}`
    }
  }
}

export function weAreRunningInADockerContainer(): boolean {
  return existsSync('/.dockerenv')
}
