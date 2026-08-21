import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CallId } from '@deepseek-ai/dsh-llm'

export const name = 'echo-tool'
export const inject = ['tools', 'shell']

export function apply(ctx: Context) {
  // Consumer：inject shell 服务，包装成模型可调的 echo 工具。不 import 具体 provider。
  ctx.tools.register(defineTool({
    name: 'echo',
    description: 'Echo a string through the shell seam.',
    parameters: { text: { type: 'string', required: true, description: 'Text to echo' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) {
      const spec = ctx.shell.resolve({ command: 'echo ' + args.text })
      const result = await ctx.shell.run(spec)
      return result.stdout.text
    },
  }))

  // 代替模型，手动把一次调用送进执行管线
  void (async () => {
    const r = await ctx.tools.execute({
      callId: CallId('demo-1'), name: 'echo',
      arguments: { text: 'hello seam' }, signal: new AbortController().signal,
    })
    console.log('echo tool replied:', JSON.stringify(r.content))
    setTimeout(() => process.exit(0), 50)
  })()
}
