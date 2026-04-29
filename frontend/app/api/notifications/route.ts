import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return Response.json({ error: 'Error al obtener notificaciones' }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: Request) {
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const serviceKey = req.headers.get('x-service-key')
  if (serviceKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Body inválido' }, { status: 400 }) }

  const b = body as Record<string, unknown>
  if (!b.user_id || !b.title || !b.body) {
    return Response.json({ error: 'user_id, title y body son requeridos' }, { status: 400 })
  }

  const { data, error } = await serviceSupabase
    .from('notifications')
    .insert({
      user_id: b.user_id as string,
      title: (b.title as string).slice(0, 100),
      body: (b.body as string).slice(0, 500),
      type: typeof b.type === 'string' ? b.type : 'reminder',
      url: typeof b.url === 'string' ? b.url : null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al crear notificación' }, { status: 500 })
  return Response.json(data, { status: 201 })
}
