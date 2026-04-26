import { createServerSupabaseClient } from '@/lib/supabase-server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!UUID_RE.test(id)) {
    return Response.json({ error: 'ID inválido' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.error('auth error:', authError)
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('symptom_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')

  if (error) {
    console.error('supabase error:', error)
    return Response.json({ error: 'Error al eliminar' }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return Response.json({ error: 'Registro no encontrado' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
