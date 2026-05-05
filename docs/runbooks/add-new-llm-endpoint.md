# Runbook: Agregar endpoint que llama a Claude

Usar `aliis-route-builder` para generar la plantilla. Este runbook es el checklist de verificación.

## Checklist antes de hacer PR

- [ ] Auth: `createServerSupabaseClient()` + `getUser()` — nunca confiar en userId del body
- [ ] Rate limit: `rateLimit()` antes de llamar a Claude
- [ ] Validación: tipo, longitud y formato de todos los inputs del body
- [ ] Modelo: `HAIKU_4_5` importado de `@/lib/ai-models` — nunca string hardcodeado
- [ ] Prompt: en `docs/prompts/<nombre>/v1.md` si > 5 líneas — importado con `readPrompt()`
- [ ] Caching: `cachedSystem()` en el system prompt
- [ ] LLM usage: `logLlmUsage()` tras la llamada
- [ ] PHI: si el endpoint maneja datos médicos, añadir ruta a `sentry-scrub.ts`
- [ ] Test manual: probar con usuario real en staging

## Template mínimo

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { anthropic, cachedSystem } from '@/lib/anthropic'
import { rateLimit } from '@/lib/rate-limit'
import { logLlmUsage } from '@/lib/llm-usage'
import { HAIKU_4_5 } from '@/lib/ai-models'
import { readPrompt } from '@/lib/prompts'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  const rl = await rateLimit(`user:${user.id}:mi-endpoint`, 20, 3600)
  if (!rl.ok) return new Response('Rate limit', { status: 429 })

  const { input } = await req.json()
  if (!input || typeof input !== 'string' || input.length > 500) {
    return new Response('Input inválido', { status: 400 })
  }

  const message = await anthropic.messages.create({
    model: HAIKU_4_5,
    max_tokens: 500,
    system: cachedSystem(readPrompt('mi-prompt', 'v1')),
    messages: [{ role: 'user', content: input }],
  })

  await logLlmUsage({ userId: user.id, endpoint: 'mi_endpoint', model: HAIKU_4_5, usage: message.usage })

  return Response.json({ result: (message.content[0] as { text: string }).text })
}
```
