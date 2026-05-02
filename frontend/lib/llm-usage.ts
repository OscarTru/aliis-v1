import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

interface AnthropicUsage {
  input_tokens?: number | null
  output_tokens?: number | null
  cache_read_input_tokens?: number | null
  cache_creation_input_tokens?: number | null
}

/**
 * Fire-and-forget log of an LLM call's token usage. Errors are swallowed
 * because a failed log shouldn't break the user-facing request.
 */
export async function logLlmUsage(args: {
  userId: string | null
  endpoint: string
  model: string
  usage?: AnthropicUsage
}): Promise<void> {
  try {
    await admin.from('llm_usage').insert({
      user_id: args.userId,
      endpoint: args.endpoint,
      model: args.model,
      input_tokens: args.usage?.input_tokens ?? 0,
      output_tokens: args.usage?.output_tokens ?? 0,
      cache_read_tokens: args.usage?.cache_read_input_tokens ?? 0,
      cache_creation_tokens: args.usage?.cache_creation_input_tokens ?? 0,
    })
  } catch (err) {
    console.error('[llm-usage] insert failed:', err)
  }
}
