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

  // Use a single mutable response so session cookies are never lost between
  // two NextResponse objects. We start with a placeholder URL and update it
  // at the end once we know the correct destination.
  const response = NextResponse.redirect(`${origin}/`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Write cookies onto the single response object
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
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
      // Clear session cookies before redirecting
      const blockResponse = NextResponse.redirect(`${origin}/?error=no-invite`)
      response.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) blockResponse.cookies.set(name, '', { maxAge: 0, path: '/' })
      })
      return blockResponse
    }
  }

  // Atomic invite consume: UPDATE only succeeds if used=false right now.
  // Two concurrent signups with same code: only one UPDATE touches a row.
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

  // Replay pending consent records into consents table (idempotent).
  const pending = (user.user_metadata?.consents_pending ?? null) as null | {
    terms?: { granted: boolean; at: string }
    medical_data?: { granted: boolean; at: string }
    policy_version?: string
  }
  if (pending) {
    const { data: existing } = await admin
      .from('consents')
      .select('kind')
      .eq('user_id', user.id)
      .in('kind', ['terms', 'medical_data_processing'])
    const have = new Set((existing ?? []).map((r) => r.kind))
    const rows: Array<{
      user_id: string; kind: string; granted: boolean
      policy_version: string | null; created_at: string
    }> = []
    if (pending.terms && !have.has('terms')) {
      rows.push({ user_id: user.id, kind: 'terms', granted: pending.terms.granted, policy_version: pending.policy_version ?? null, created_at: pending.terms.at })
    }
    if (pending.medical_data && !have.has('medical_data_processing')) {
      rows.push({ user_id: user.id, kind: 'medical_data_processing', granted: pending.medical_data.granted, policy_version: pending.policy_version ?? null, created_at: pending.medical_data.at })
    }
    if (rows.length > 0) await admin.from('consents').insert(rows)
  }

  // Determine destination: new users → /onboarding, returning → /historial
  const { data: profile } = await admin
    .from('profiles')
    .select('onboarding_done')
    .eq('id', user.id)
    .maybeSingle()

  const destination = profile?.onboarding_done ? '/historial' : '/onboarding'

  // Mutate the redirect URL on the same response object that holds the cookies
  response.headers.set('location', `${origin}${destination}`)
  return response
}
