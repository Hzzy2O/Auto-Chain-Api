import { execSync, spawnSync } from 'node:child_process'
import { z } from 'zod'
import type { FileParams } from '../file'
import { FileTool } from '../file'

export class ShellExecutor extends FileTool {
  name = 'shell-executor'
  schema = z.object({
    command_line: z.string().describe('the command line to execute'),
  })

  description = 'Execute a shell command and return the output'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ command_line }: z.infer<typeof this.schema>) {
    const currentDir = process.cwd()
    const workPath = this.store.basePath
    // Change dir into workspace if necessary
    if (workPath)
      process.chdir(workPath)

    const result = execSync(command_line, { encoding: 'utf-8' })
    const output = `STDOUT:\n${result}`
    // Change back to whatever the prior working dir was
    process.chdir(currentDir)

    return output
  }
}

export class ShellPopenExecutor extends FileTool {
  name = 'shell-popen-executor'
  schema = z.object({
    command_line: z.string().describe('the command line to execute'),
  })

  description = 'Execute a shell command with Popen and returns an english description of the event and the process id'

  constructor({ verbose, callbacks, store }: FileParams) {
    super(verbose, callbacks)

    this.store = store
  }

  async _call({ command_line }: z.infer<typeof this.schema>) {
    const currentDir = process.cwd()
    const workPath = this.store.basePath
    // Change dir into workspace if necessary
    process.chdir(workPath)

    const childProcess = spawnSync(command_line, { encoding: 'utf-8' })
    const pid = childProcess.pid

    // Change back to whatever the prior working dir was
    process.chdir(currentDir)

    return `Subprocess started with PID:'${pid}'`
  }
}
