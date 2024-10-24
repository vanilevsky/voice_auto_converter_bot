import { trackEvent } from '@/helpers/amplitude'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default function handleStatistic(ctx: Context) {
  const userStatistic = ctx.dbuser.statistic
  const sinceTime = userStatistic.timeStamps?.createdAt || ctx.dbuser.createdAt
  const text = ctx.i18n.t('statistic', {
    sinceTime: sinceTime.toLocaleDateString(ctx.dbuser.language),
    voiceTotalCount: userStatistic.voice.count_total,
    videoNoteTotalCount: userStatistic.video_note.count_total,
    voiceTotalLength: userStatistic.voice.duration,
    videoNoteTotalLength: userStatistic.video_note.duration,
  })

  const eventProperties = {
    type: 'command',
    command: 'statistic',
    text: ctx.message?.text,
  }
  trackEvent(ctx, 'message_received', eventProperties)

  return ctx.reply(text, {
    ...sendOptions(ctx),
  })
}
