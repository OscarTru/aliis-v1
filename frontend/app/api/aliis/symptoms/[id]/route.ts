import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ error: 'Body inválido' }, { status: 400 }) }

  const b = body as Record<string, unknown>
  if (typeof b.resolved !== 'boolean') {
    return Response.json({ error: 'Campo resolved requerido' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    resolved: b.resolved,
    resolved_at: b.resolved ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from('tracked_symptoms')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return Response.json({ error: 'Error al actualizar' }, { status: 500 })
  return Response.json(data)
}
