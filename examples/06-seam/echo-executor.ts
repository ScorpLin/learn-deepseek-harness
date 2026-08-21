import { ShellExecutor } from '@deepseek-ai/dsh-shell'
import type { ShellExecRequest, ShellExecSpec, ShellRunResult, ShellProcess } from '@deepseek-ai/dsh-shell'

/**
 * 一个教学用的 Provider：实现真实的 ShellExecutor 接口，但「执行」= 把命令回显出来，
 * 不碰 subprocess。这证明了 seam 的「provider 可替换」属性——换个实现，Consumer 不动。
 */
export class EchoExecutor extends ShellExecutor {
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
      stdout: { text: 'echo: ' + spec.command, truncated: false },
      stderr: { text: '', truncated: false },
    }
  }

  start(_spec: ShellExecSpec): ShellProcess {
    throw new Error('EchoExecutor: background processes are not supported (teaching example)')
  }
}

export const name = 'echo-executor'
export function apply(ctx: import('@deepseek-ai/cordis').Context) {
  ctx.plugin(EchoExecutor)
}
