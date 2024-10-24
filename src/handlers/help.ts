import { trackEvent } from '@/helpers/amplitude'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default function handleHelp(ctx: Context) {
  const eventProperties = {
    type: 'command',
    command: 'help',
    text: ctx.message?.text,
  }
  trackEvent(ctx, 'message_received', eventProperties)

  return ctx.replyWithLocalization('help', sendOptions(ctx))
}
