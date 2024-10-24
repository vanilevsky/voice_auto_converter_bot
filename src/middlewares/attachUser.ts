import { Identify, Types, identify } from '@amplitude/analytics-node'
import { NextFunction } from 'grammy'
import { findOrCreateUser } from '@/models/User'
import Context from '@/models/Context'

export default async function attachUser(ctx: Context, next: NextFunction) {
  if (!ctx.from) {
    throw new Error('No from field found')
  }
  const user = await findOrCreateUser(ctx.from.id)
  if (!user) {
    throw new Error('User not found')
  }
  ctx.dbuser = user

  const identifyObj: Types.Identify = new Identify()

  identifyObj.set('username', ctx.from?.username || '')
  identifyObj.set('first_name', ctx.from?.first_name || '')
  identifyObj.set('last_name', ctx.from?.last_name || '')
  identifyObj.set('is_bot', ctx.from?.is_bot || false)
  identifyObj.set('is_premium', ctx.from?.is_premium || false)

  const eventOptions: Types.EventOptions = {
    user_id: ctx.from?.id.toString(),
    language: ctx.from?.language_code,
  }

  identify(identifyObj, eventOptions)

  return next()
}
