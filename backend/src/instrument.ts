import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

const SENSITIVE_PATH_PREFIXES = [
  '/diagnostico',
  '/pack',
  '/chat',
  '/notes',
  '/aliis',
  '/symptoms',
  '/diary',
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

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? 'https://f17b4833a44594d6048e6b089ec02277@o4511318848110592.ingest.de.sentry.io/4511318861676624',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  sendDefaultPii: false,
  environment: process.env.NODE_ENV ?? 'development',
  beforeSend(event) {
    // Always scrub request body, cookies, sensitive headers
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers['cookie']
        delete event.request.headers['authorization']
        delete event.request.headers['x-cron-secret']
      }
      if (isSensitivePath(event.request.url)) {
        delete event.request.query_string
      }
    }

    // Scrub user-identifying fields
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
      delete event.user.username
    }

    // Scrub extras / contexts that might contain prompts or AI output
    const SCRUB_KEY = /^(message|prompt|input|content|body|text|dx|diagnostico|user_input|response|completion)$/i
    if (event.extra) {
      for (const key of Object.keys(event.extra)) {
        if (SCRUB_KEY.test(key)) event.extra[key] = '[scrubbed]'
      }
    }
    if (event.contexts) {
      for (const ctxName of Object.keys(event.contexts)) {
        const ctx = event.contexts[ctxName]
        if (ctx && typeof ctx === 'object') {
          for (const key of Object.keys(ctx)) {
            if (SCRUB_KEY.test(key)) {
              ;(ctx as Record<string, unknown>)[key] = '[scrubbed]'
            }
          }
        }
      }
    }

    return event
  },
})
