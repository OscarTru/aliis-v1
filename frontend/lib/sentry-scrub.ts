import type { ErrorEvent, EventHint } from '@sentry/core'

const SENSITIVE_PATH_PREFIXES = [
  '/api/diagnostico',
  '/api/chat',
  '/api/notes',
  '/api/aliis',
  '/api/symptoms',
  '/api/diary',
  '/api/invite',
  '/api/account',
  '/api/auth',
]

function isSensitivePath(url?: string): boolean {
  if (!url) return false
  try {
    const path = new URL(url, 'http://x').pathname
    return SENSITIVE_PATH_PREFIXES.some(prefix => path.startsWith(prefix))
  } catch {
    return false
  }
}

/**
 * Strip request bodies, cookies, and user-content fields from any event whose
 * URL touches a route that handles patient medical data. Also strip from any
 * event regardless of route — bodies should never leave the server unscrubbed.
 */
export function scrubMedicalPII(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  if (event.request) {
    // Always remove request body and cookies — these can contain PII
    delete event.request.data
    delete event.request.cookies
    delete event.request.headers?.cookie
    delete event.request.headers?.authorization
    delete event.request.headers?.['x-cron-secret']

    // For sensitive paths, also remove query string (could contain dx, tokens)
    if (isSensitivePath(event.request.url)) {
      delete event.request.query_string
    }
  }

  // Strip user input from extras and contexts
  if (event.extra) {
    for (const key of Object.keys(event.extra)) {
      if (/^(message|prompt|input|content|body|text|dx|diagnostico|user_input)$/i.test(key)) {
        event.extra[key] = '[scrubbed]'
      }
    }
  }
  if (event.contexts) {
    for (const ctxName of Object.keys(event.contexts)) {
      const ctx = event.contexts[ctxName]
      if (ctx && typeof ctx === 'object') {
        for (const key of Object.keys(ctx)) {
          if (/^(message|prompt|input|content|body|text|dx|diagnostico|user_input)$/i.test(key)) {
            ;(ctx as Record<string, unknown>)[key] = '[scrubbed]'
          }
        }
      }
    }
  }

  // Strip user email if it slipped in
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
    delete event.user.username
  }

  return event
}
