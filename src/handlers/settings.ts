import { trackEvent } from '@/helpers/amplitude'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'
import settingsMenu from '@/menus/settings'

export default function handleSettings(ctx: Context) {
  const eventProperties = {
    type: 'command',
    command: 'settings',
    text: ctx.message?.text,
  }
  trackEvent(ctx, 'message_received', eventProperties)
  return ctx.replyWithLocalization('settings', {
    ...sendOptions(ctx),
    reply_markup: settingsMenu,
  })
}
