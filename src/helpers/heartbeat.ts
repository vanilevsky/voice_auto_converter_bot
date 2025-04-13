import * as https from 'https'
import { IncomingMessage } from 'http'
import env from '@/helpers/env'

const HEARTBEAT_INTERVAL = 5 * 60 * 1000

/**
 * Sends HTTP request to Betterstack heartbeat URL
 */
function sendHeartbeat() {
  try {
    const req = https.get(env.HEARTBEAT_URL, (res: IncomingMessage) => {
      if (res.statusCode !== 200) {
        console.error(`Heartbeat failed with status: ${res.statusCode}`)
      } else {
        console.log('Heartbeat sent successfully')
      }
    })

    req.on('error', (error: Error) => {
      console.error('Failed to send heartbeat:', error)
    })

    req.end()
  } catch (error) {
    console.error('Failed to send heartbeat:', error)
  }
}

/**
 * Initializes heartbeat sending at specified interval
 */
export function initHeartbeat() {
  console.log('Initializing BetterStack heartbeat...')
  sendHeartbeat()
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
} 