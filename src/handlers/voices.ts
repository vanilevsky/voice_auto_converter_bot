import * as console from 'console'
import * as ffmpeg from 'fluent-ffmpeg'
import { DocumentType } from '@typegoose/typegoose'
import { LevelsCodes } from '@/models/UserSettings'
import { Message } from 'grammy/types'
import { User } from '@/models/User'
import { promises as fsPromises } from 'fs'
import { trackEvent } from '@/helpers/amplitude'
import Context from '@/models/Context'
import bot from '@/helpers/bot'
import transcription from '@/helpers/openai'

export default async function handleVoices(ctx: Context) {
  const chatId = ctx.message?.chat.id

  const isVoice = !!ctx.message?.voice
  const isVideoNote = !!ctx.message?.video_note

  const eventProperties = {
    type: isVoice ? 'voice' : isVideoNote ? 'video_note' : 'unknown',
    chatId: chatId,
    chatType: ctx.message?.chat.type,
    reason: '',
    duration:
      ctx.message?.voice?.duration || ctx.message?.video_note?.duration || 0,
  }

  if (chatId === undefined) {
    const reason = 'chatId is undefined'

    console.error(reason)
    eventProperties.reason = reason

    trackEvent(ctx, 'message_failed', eventProperties)
    return
  }

  const file = await ctx.getFile()
  const fileExt = file.file_path?.split('.').pop()
  const fileName = file.file_unique_id + '.' + fileExt
  const filePath = await file.download('/tmp/' + fileName)

  fsPromises.access(filePath).catch(() => {
    const reason = 'File does not exist'

    console.error(reason)
    eventProperties.reason = reason

    trackEvent(ctx, 'message_failed', eventProperties)
    return
  })

  const buffer = await fsPromises.readFile(filePath)
  const lang = ctx.dbuser.language
  const userLevel = ctx.dbuser.settings.level

  let prompt: string

  switch (userLevel) {
    case LevelsCodes.easy:
      prompt = ctx.i18n.t('whisper_prompt_easy')
      break
    case LevelsCodes.hard:
      prompt = ctx.i18n.t('whisper_prompt_hard')
      break
    default:
      prompt = ctx.i18n.t('whisper_prompt')
  }

  const isAudioValid = await validateAudio(filePath, 1.5)
  if (!isAudioValid) {
    const reason = 'Audio is too short to transcribe'

    console.error(reason)
    eventProperties.reason = reason

    trackEvent(ctx, 'message_failed', eventProperties)

    await fsPromises.unlink(filePath)
    return
  }

  const transcriptionText = await transcription(buffer, fileName, lang, prompt)

  const skippedAnswers = [
    'Редактор субтитров А.Семкин Корректор А.Егорова',
    'Продолжение следует...',
  ]

  if (skippedAnswers.includes(transcriptionText)) {
    const reason = 'Bug with transcription'

    console.error(reason)
    eventProperties.reason = reason

    trackEvent(ctx, 'message_failed', eventProperties)

    await fsPromises.unlink(filePath)
    return
  }

  const text = '🔊 ' + transcriptionText
  await bot.api.sendMessage(chatId, text, {
    reply_to_message_id: ctx.message?.message_id,
  })

  if (ctx.message) {
    await updateUserStatistic(ctx.dbuser, ctx.message)
  }

  trackEvent(ctx, 'message_received', eventProperties)
  await fsPromises.unlink(filePath)

  fsPromises
    .access(filePath)
    .then(() => {
      console.error('File exists.')
    })
    .catch(() => {
      console.log('')
    })
}

async function validateAudio(
  filePath: string,
  minAudioDuration: number
): Promise<boolean> {
  try {
    const metadata = await new Promise<ffmpeg.FfprobeData>(
      (resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, data) => {
          if (err) return reject(err)
          resolve(data)
        })
      }
    )

    const duration = metadata.format.duration as number
    return duration > minAudioDuration
  } catch (err) {
    console.error('Error analyzing audio:', err)
    return false
  }
}

async function updateUserStatistic(
  dbuser: DocumentType<User>,
  message: Message
) {
  const isVoice = message.voice !== undefined
  const isVideoNote = message.video_note !== undefined
  const isPersonalChat = message.chat.type === 'private'

  if (isVoice) {
    dbuser.statistic.voice.count_total++
    dbuser.statistic.voice.count_personal += isPersonalChat ? 1 : 0
    dbuser.statistic.voice.count_group += isPersonalChat ? 0 : 1
    dbuser.statistic.voice.duration += message.voice?.duration || 0
  }

  if (isVideoNote) {
    dbuser.statistic.video_note.count_total++
    dbuser.statistic.video_note.count_personal += isPersonalChat ? 1 : 0
    dbuser.statistic.video_note.count_group += isPersonalChat ? 0 : 1
    dbuser.statistic.video_note.duration += message.video_note?.duration || 0
  }

  dbuser.statistic.touch()
  return await dbuser.save()
}
