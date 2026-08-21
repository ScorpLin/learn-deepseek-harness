import type { Context } from '@deepseek-ai/cordis'
import type { PreToolDecision, ToolExecution } from '@deepseek-ai/dsh-tools'

// s08/s16 小作业参考答案：一个「全拒」权限门，挂在 tools/pre-execute。
// 注意：这里故意 return 而不调 next()，所以短路整个 waterfall —— 所有工具调用都被拒。
// 把 return 换成 return next() 就放行（s02 的 waterfall 纪律）。
export const name = 'deny-gate'
export const inject = ['tools']

export function apply(ctx: Context) {
  ctx.on('tools/pre-execute', async (exec: ToolExecution, next): Promise<PreToolDecision> => {
    console.log('deny-gate: denying', exec.name)
    return { kind: 'deny', reason: 'Denied by exercise gate.' }
  })
}
