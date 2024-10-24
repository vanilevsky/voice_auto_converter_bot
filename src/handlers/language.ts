import { trackEvent } from '@/helpers/amplitude'
import Context from '@/models/Context'
import languageMenu from '@/menus/language'
import sendOptions from '@/helpers/sendOptions'

export default function handleLanguage(ctx: Context) {
  const eventProperties = {
    type: 'command',
    command: 'language',
    text: ctx.message?.text,
  }
  trackEvent(ctx, 'message_received', eventProperties)

  return ctx.replyWithLocalization('language', {
    ...sendOptions(ctx),
    reply_markup: languageMenu,
  })
}
