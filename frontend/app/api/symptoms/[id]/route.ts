import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { error } = await supabase
    .from('symptom_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return Response.json({ error: 'Error al eliminar' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
