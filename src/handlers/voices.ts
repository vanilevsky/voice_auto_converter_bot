import Context from '@/models/Context'
import bot from "@/helpers/bot";
import { promises as fsPromises } from "fs";
import OpenAI, { toFile } from "openai";
import env from "@/helpers/env";

export default async function handleVoices(ctx: Context) {
  const file = await ctx.getFile();

  const ext = file.file_path?.split('.').pop();
  const fileName = file.file_unique_id + '.' + ext;
  const tmpFile = '/tmp/' + fileName;
  const path = await file.download(tmpFile);

  console.log("File saved at file.file_path: ", file.file_path);
  console.log("File saved at path: ", path);

  // Check if the file exists
  fsPromises.access(tmpFile).then(() => {
    console.log("File exists.");
  }).catch(() => {
    console.log("File does not exist.");
  });

  async function main() {
    const buffer = await fsPromises.readFile(path);
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(buffer, fileName),
      model: 'whisper-1',
      language: ctx.from?.language_code,
    });

    console.log(transcription.text);

    const { message } = ctx; // the message object
    const chatId = message?.chat.id;

    if (chatId) {
      const text = '🔊 ' + transcription.text;
      await bot.api.sendMessage(chatId, text, {
        reply_to_message_id: message?.message_id,
      });
    }
  }

  await main();

  // Remove tmp file tmpFile
  await fsPromises.unlink(tmpFile);

  // Check if the file exists
  fsPromises.access(tmpFile).then(() => {
    console.log("File exists.");
  }).catch(() => {
    console.log("File does not exist.");
  });
}
