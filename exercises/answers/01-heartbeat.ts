import type { Context } from '@deepseek-ai/cordis'

// s01 小作业参考答案：ctx.effect 的 body 执行挂载逻辑，返回的 disposer 执行清理。
function heartbeat(ctx: Context) {
  console.log('heartbeat plugin loading')
  ctx.effect(() => {
    const timer = setInterval(() => console.log('tick'), 200)
    return () => {
      clearInterval(timer)
      console.log('heartbeat cleaned up')
    }
  })
}

export const name = 'lifecycle-demo'

export function apply(ctx: Context) {
  // 用 ctx.plugin 从代码挂一个函数插件，拿到 fiber
  const fiber = ctx.plugin(heartbeat)
  // 700ms 后 dispose，观察清理顺序
  ctx.effect(() => {
    const timer = setTimeout(async () => {
      await fiber.dispose()
      console.log('disposed')
      process.exit(0)
    }, 700)
    return () => clearTimeout(timer)
  })
}
