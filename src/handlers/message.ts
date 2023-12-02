import Context from '@/models/Context'
import bot from "@/helpers/bot";

export default async function handleMessage(ctx: Context) {
  const { message } = ctx; // the message object
  const chatId = message?.chat.id;

  const text = <string>message?.text;
  const voiceFileId = message?.voice?.file_id;
  const videoNoteFileId = message?.video_note?.file_id;

  if (chatId && text) {
    await bot.api.sendMessage(chatId, 'text ' + text);
  }

  if (chatId && voiceFileId) {
    await bot.api.sendMessage(chatId, 'voice ' + voiceFileId);
  }

  if (chatId && videoNoteFileId) {
    await bot.api.sendMessage(chatId, 'videoNote ' + videoNoteFileId);
  }

  console.info(message)
}
