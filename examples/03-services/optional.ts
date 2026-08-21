import type { Context } from '@deepseek-ai/cordis'

export const name = 'optional-consumer'

export function apply(ctx: Context) {
  const greeter = ctx.get('greeter')
  console.log(greeter?.greet('maybe') ?? 'no greeter available')
}
