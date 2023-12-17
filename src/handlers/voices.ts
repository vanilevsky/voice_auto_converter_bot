import { DocumentType } from '@typegoose/typegoose'
import { Message } from 'grammy/types'
import { User } from '@/models/User'
import { promises as fsPromises } from 'fs'
import Context from '@/models/Context'
import bot from '@/helpers/bot'
import transcription from '@/helpers/openai'

export default async function handleVoices(ctx: Context) {
  const chatId = ctx.message?.chat.id

  if (chatId === undefined) {
    console.error('chatId is undefined')
    return
  }

  const file = await ctx.getFile()
  const fileExt = file.file_path?.split('.').pop()
  const fileName = file.file_unique_id + '.' + fileExt
  const filePath = await file.download('/tmp/' + fileName)

  fsPromises.access(filePath).catch(() => {
    console.error('File does not exist.')
    return
  })

  const buffer = await fsPromises.readFile(filePath)
  const lang = ctx.dbuser.language
  const prompt = ctx.i18n.t('whisper_prompt')
  const transcriptionText = await transcription(buffer, fileName, lang, prompt)

  const text = '🔊 ' + transcriptionText
  await bot.api.sendMessage(chatId, text, {
    reply_to_message_id: ctx.message?.message_id,
  })

  if (ctx.message) {
    await updateUserStatistic(ctx.dbuser, ctx.message)
  }

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
