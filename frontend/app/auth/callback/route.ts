import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPostAuthRedirect } from '@/lib/auth-redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteCode = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/historial'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Consume invite code if present (Google OAuth signup path)
      if (inviteCode) {
        const normalized = inviteCode.trim().toUpperCase()
        const { data: invite } = await supabase
          .from('invite_codes')
          .select('id, used')
          .eq('code', normalized)
          .single()
        if (invite && !invite.used) {
          await supabase
            .from('invite_codes')
            .update({ used: true, used_by: data.user.id, used_at: new Date().toISOString() })
            .eq('id', invite.id)
        }
      }

      const redirect = await getPostAuthRedirect(supabase, data.user.id)
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
