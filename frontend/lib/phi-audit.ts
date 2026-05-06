import { createClient } from '@supabase/supabase-js'

type PhiAction = 'read' | 'write' | 'delete'

let _admin: ReturnType<typeof createClient> | null = null
function admin() {
  if (_admin) return _admin
  _admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  return _admin
}

/**
 * Fire-and-forget PHI access log. Never throws — audit failure must not block the request.
 */
export function logPhiAccess(
  userId: string,
  endpoint: string,
  action: PhiAction,
  ip?: string
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(admin() as any)
    .from('phi_access_log')
    .insert({ user_id: userId, endpoint, action, ip: ip ?? null })
    .then(({ error }: { error: { message: string } | null }) => {
      if (error) console.error('[phi-audit] insert failed', error.message)
    })
}
