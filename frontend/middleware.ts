import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/onboarding', '/ingreso', '/loading', '/pack', '/historial', '/compartir', '/cuenta']

// API routes that legitimately don't require a Supabase user session.
// They authenticate via Stripe signature, CRON_SECRET, SUPABASE_WEBHOOK_SECRET,
// or are public-by-design (invite read-only validate). Anything NOT in this
// list AND under /api/ requires a session — the per-route handler enforces it
// AND this middleware enforces it as defense-in-depth, so a future handler
// that forgets `getUser()` still returns 401 instead of leaking data.
const PUBLIC_API_PREFIXES = [
  '/api/stripe/webhook',
  '/api/auth/webhook',
  '/api/aliis/notify',           // covers /notify and /notify/[shard], guarded by CRON_SECRET
  '/api/aliis/treatment-check/cron',
  '/api/aliis/adherence-close',  // cron
  '/api/aliis/capsula',          // cron
  '/api/aliis/cleanup',          // cron
  '/api/invite/validate',        // public read-only check, has its own rate limit
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Page-level auth: redirect unauthenticated users to landing.
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // API-level auth: defense-in-depth. Returns 401 JSON instead of redirecting,
  // so clients (and the network tab) see the real failure mode.
  if (pathname.startsWith('/api/')) {
    const isPublicApi = PUBLIC_API_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isPublicApi && !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
