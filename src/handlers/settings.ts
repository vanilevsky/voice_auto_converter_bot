import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'
import settingsMenu from '@/menus/settings'

export default function handleSettings(ctx: Context) {
  return ctx.replyWithLocalization('settings', {
    ...sendOptions(ctx),
    reply_markup: settingsMenu,
  })
}
