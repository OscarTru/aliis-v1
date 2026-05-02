import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getPostAuthRedirect } from '@/lib/auth-redirect'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteCode = searchParams.get('invite')

  if (!code) return NextResponse.redirect(`${origin}/`)

  // We need a mutable response to carry cookies — redirect URL set at the end
  const cookieResponse = NextResponse.redirect(`${origin}/`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/?error=auth-failed`)
  }

  const user = data.user
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Google OAuth without invite code: block new users, allow returning users
  const isOAuth = user.app_metadata?.provider === 'google'
  if (isOAuth && !inviteCode) {
    const { data: profile } = await admin
      .from('profiles')
      .select('onboarding_done')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      // New user without invite — delete and block
      await admin.auth.admin.deleteUser(user.id)
      const blockResponse = NextResponse.redirect(`${origin}/?error=no-invite`)
      cookieResponse.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) blockResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
      })
      return blockResponse
    }
  }

  // Atomic invite consume: UPDATE only succeeds if used=false right now.
  // Two concurrent signups with same code: only one UPDATE returns a row.
  if (inviteCode) {
    const normalized = inviteCode.trim().toUpperCase()
    const { data: claimed } = await admin
      .from('invite_codes')
      .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq('code', normalized)
      .eq('used', false)
      .select('id')
      .maybeSingle()

    if (!claimed) {
      logger.warn({ code: normalized }, 'invite code already consumed or invalid')
    }
  }

  // Determine redirect: new users → onboarding, returning → historial
  const { data: profile } = await admin
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .maybeSingle()

  const destination = profile?.onboarding_done ? '/historial' : '/onboarding'
  const finalResponse = NextResponse.redirect(`${origin}${destination}`)
  cookieResponse.cookies.getAll().forEach(({ name, value }) => {
    finalResponse.cookies.set(name, value)
  })
  return finalResponse
}
