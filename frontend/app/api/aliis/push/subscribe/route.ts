import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json() as {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: 'Suscripción inválida' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
  }, { onConflict: 'user_id,endpoint' })

  if (error) return Response.json({ error: 'Error guardando suscripción' }, { status: 500 })

  return Response.json({ ok: true })
}
