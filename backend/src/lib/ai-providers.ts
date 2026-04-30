import { createAnthropic } from '@ai-sdk/anthropic'
import { createGroq } from '@ai-sdk/groq'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export const models = {
  packGenerator: anthropic('claude-sonnet-4-6'),
  classifier: groq('llama-3.1-8b-instant'),
}
