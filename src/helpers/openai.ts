import OpenAI, { toFile } from 'openai'
import env from '@/helpers/env'

export default async function transcription(
  buffer: Buffer,
  fileName: string,
  lang: string | undefined,
  prompt: string
): Promise<string> {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  })

  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(buffer, fileName),
    model: 'whisper-1',
    language: lang,
    prompt: prompt,
  })

  return transcription.text
}
