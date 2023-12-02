import Context from '@/models/Context'
import bot from "@/helpers/bot";

export default async function handleMessage(ctx: Context) {
  const { message } = ctx; // the message object
  const chatId = message?.chat.id;
  const text = <string>message?.text;

  if (chatId && text) {
    await bot.api.sendMessage(chatId, text);
  }
}
