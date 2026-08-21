import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellRunResult, ShellProcess } from '@deepseek-ai/dsh-shell'

// s05 小作业参考答案：第二个 Provider，把命令倒着输出。
// 把它替换 examples/06-seam/cordis.yml 里的 echo-executor.ts，echo-tool.ts 一行都不用改。
export class ReverseExecutor extends ShellExecutor {
  resolve(request: ShellExecRequest): ShellExecSpec {
    return {
      command: request.command,
      workdir: request.workdir ?? process.cwd(),
      timeoutMs: request.timeoutMs ?? 30_000,
      stdoutMaxBytes: request.stdoutMaxBytes ?? 64_000,
      sandboxPolicy: request.sandboxPolicy,
    }
  }

  async run(spec: ShellExecSpec): Promise<ShellRunResult> {
    return {
      exitCode: 0,
      signal: null,
      timedOut: false,
      aborted: false,
      timeoutMs: spec.timeoutMs,
      stdout: { text: 'reversed: ' + spec.command.split('').reverse().join(''), truncated: false },
      stderr: { text: '', truncated: false },
    }
  }

  start(_spec: ShellExecSpec): ShellProcess {
    throw new Error('ReverseExecutor: background not supported (teaching example)')
  }
}

export const name = 'reverse-executor'
export function apply(ctx: import('@deepseek-ai/cordis').Context) {
  ctx.plugin(ReverseExecutor)
}
