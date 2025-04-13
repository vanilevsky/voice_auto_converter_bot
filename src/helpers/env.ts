import * as dotenv from 'dotenv'
import { cleanEnv, str } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  TOKEN: str(),
  MONGO: str(),
  OPENAI_API_KEY: str(),
  AMPLITUDE_API_KEY: str(),
  HEARTBEAT_URL: str(),
  BETTERSTACK_SOURCE_TOKEN: str(),
  BETTERSTACK_INGESTING_HOST: str({ default: 'in.logs.betterstack.com' }),
  APP_NAME: str({ default: 'voice_auto_converter_bot' }),
  NODE_ENV: str({ default: 'development' }),
})
