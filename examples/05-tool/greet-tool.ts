import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CallId } from '@deepseek-ai/dsh-llm'

export const name = 'greet-tool'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet the named person.',
    parameters: { name: { type: 'string', required: true, description: 'Who to greet' } },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
    async execute(args) { return 'Hello, ' + args.name + '!' },
  }))

  // 代替模型，手动把一次调用送进真实执行管线
  void (async () => {
    const result = await ctx.tools.execute({
      callId: CallId('demo-1'), name: 'greet',
      arguments: { name: 'Cordis' }, signal: new AbortController().signal,
    })
    console.log('tool replied:', JSON.stringify(result.content))
    setTimeout(() => process.exit(0), 50)
  })()
}
