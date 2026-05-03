import { Request, Response, NextFunction } from 'express'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — env vars aren't always loaded at module-eval time.
// The previous implementation created a new client per request, which is
// cheap but unnecessary; the anon client is stateless and safe to share.
let _client: SupabaseClient | null = null
function getClient(): SupabaseClient {
  if (_client) return _client
  _client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )
  return _client
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await getClient().auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Token inválido o expirado' })
    return
  }

  res.locals.userId = user.id
  next()
}
