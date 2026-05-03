import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export const models = {
  packGenerator: anthropic('claude-haiku-4-5-20251001'),
  chatFree: google('gemini-2.0-flash'),
  chatPro: anthropic('claude-haiku-4-5-20251001'),
  insight: anthropic('claude-haiku-4-5-20251001'),
  classifier: groq('llama-3.1-8b-instant'),
  symptoms: google('gemini-2.0-flash'),
}
