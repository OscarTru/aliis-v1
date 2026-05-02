import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Wrap a system prompt with `cache_control: 'ephemeral'` so Anthropic caches
 * the prompt prefix across calls. Use this for every call site whose system
 * prompt is stable across requests (>1024 tokens to actually save money).
 */
export function cachedSystem(text: string): Array<{
  type: 'text'
  text: string
  cache_control: { type: 'ephemeral' }
}> {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
}
