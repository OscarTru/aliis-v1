import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) return Response.json({ error: 'Error al actualizar' }, { status: 500 })
  return Response.json({ ok: true })
}
