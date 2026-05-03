import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

export const models = {
  packGenerator: anthropic('claude-sonnet-4-6'),
  classifier: google('gemini-2.0-flash-lite'),
}
