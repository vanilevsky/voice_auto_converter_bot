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
