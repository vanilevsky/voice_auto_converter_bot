import { Types, init, track } from '@amplitude/analytics-node'
import Context from '@/models/Context'
import env from '@/helpers/env'

function initAmplitude() {
  init(env.AMPLITUDE_API_KEY, {
    // flushQueueSize: 10, // Flush events immediately
    logLevel: Types.LogLevel.Warn, // Log debug info
  })
}

function trackEvent(
  ctx: Context,
  eventName: string,
  eventProperties: Record<string, string | number>
) {
  const userId = ctx.from?.id.toString()

  const eventOptions: Types.EventOptions = {
    user_id: userId,
  }
  track(eventName, eventProperties, eventOptions)
}

export { initAmplitude, trackEvent }
