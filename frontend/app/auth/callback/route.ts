import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getPostAuthRedirect } from '@/lib/auth-redirect'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteCode = searchParams.get('invite')
  const next = searchParams.get('next') ?? '/historial'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      // Google OAuth without invite: only allow if user already has a profile (returning user)
      const isOAuth = user.app_metadata?.provider === 'google'
      if (isOAuth && !inviteCode) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const { data: profile } = await admin
          .from('profiles')
          .select('onboarding_done')
          .eq('id', user.id)
          .maybeSingle()

        const isReturningUser = profile?.onboarding_done === true

        if (!isReturningUser) {
          await admin.auth.admin.deleteUser(user.id)
          const blockResponse = NextResponse.redirect(`${origin}/?error=no-invite`)
          request.cookies.getAll().forEach(({ name }) => {
            if (name.startsWith('sb-')) blockResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
          })
          response.cookies.getAll().forEach(({ name }) => {
            if (name.startsWith('sb-')) blockResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
          })
          return blockResponse
        }
      }

      // Consume invite code if present (Google OAuth signup path)
      if (inviteCode) {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        const normalized = inviteCode.trim().toUpperCase()
        const { data: invite } = await admin
          .from('invite_codes')
          .select('id, used')
          .eq('code', normalized)
          .single()
        if (invite && !invite.used) {
          await admin
            .from('invite_codes')
            .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
            .eq('id', invite.id)
        }
      }

      const redirect = await getPostAuthRedirect(supabase, user.id)
      response.headers.set('location', `${origin}${redirect}`)
      return response
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
