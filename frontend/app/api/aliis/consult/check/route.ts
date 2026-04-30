import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ token: null })

  const body = await request.json().catch(() => ({}))
  const packId: string | null = typeof body.packId === 'string' ? body.packId : null
  if (!packId) return Response.json({ token: null })

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('consult_summaries')
    .select('token')
    .eq('user_id', user.id)
    .eq('pack_id', packId)
    .gte('created_at', since7d)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Response.json({ token: data?.token ?? null })
}
