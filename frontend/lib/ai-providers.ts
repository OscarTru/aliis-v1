import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { HAIKU_4_5 } from '@/lib/ai-models'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export const models = {
  packGenerator: anthropic(HAIKU_4_5),
  chatFree: google('gemini-2.0-flash'),
  chatPro: anthropic(HAIKU_4_5),
  insight: anthropic(HAIKU_4_5),
  classifier: groq('llama-3.1-8b-instant'),
  symptoms: google('gemini-2.0-flash'),
}
