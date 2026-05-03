/**
 * Supabase client for public, unauthenticated data fetching.
 * Does NOT touch cookies — safe to use in ISR / statically cached pages.
 * Never use this for user-specific data or writes.
 */
import { createClient } from '@supabase/supabase-js'

export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}
