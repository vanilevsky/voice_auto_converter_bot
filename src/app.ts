import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { hydrateFiles } from '@grammyjs/files'
import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { initAmplitude } from '@/helpers/amplitude'
import { initHeartbeat } from '@/helpers/heartbeat'
import { initLogger, logger } from '@/helpers/logger'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleLanguage from '@/handlers/language'
import handleSettings from '@/handlers/settings'
import handleStatistic from '@/handlers/statistic'
import handleVoices from '@/handlers/voices'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import sendHelp from '@/handlers/help'
import settingsMenu from '@/menus/settings'
import startMongo from '@/helpers/startMongo'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')

  initAmplitude()
  console.log('Amplitude initialized')

  // Initialize BetterStack heartbeat
  initHeartbeat()

  // Initialize BetterStack logger
  initLogger()
  logger.info('Logger initialized')

  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld())
    .use(attachUser)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)
    .use(settingsMenu)

  // Plugins
  bot.api.config.use(hydrateFiles(bot.token))

  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', handleLanguage)
  bot.command('statistic', handleStatistic)
  bot.command('settings', handleSettings)

  // Events
  bot.on([':voice', ':video_note'], handleVoices)

  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
