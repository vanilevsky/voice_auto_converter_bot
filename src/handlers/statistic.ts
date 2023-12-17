import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default function handleStatistic(ctx: Context) {
  // I have transcribed 6 voice messages for you common length of 10 seconds.
  // I have transcribed 30 circle video messages for you common length of 10 seconds.
  const userStatistic = ctx.dbuser.statistic

  const text = ctx.i18n.t('statistic', {
    sinceTime: 'yesterday',
    voiceTotalCount: 5,
    videoNoteTotalCount: 15,
    voiceTotalLength: '10 seconds',
    videoNoteTotalLength: '25 seconds',
  })

  return ctx.reply(text, {
    ...sendOptions(ctx),
  })
}
