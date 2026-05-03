import * as Sentry from '@sentry/nextjs'
import { scrubMedicalPII } from './lib/sentry-scrub'

const isDev = process.env.NODE_ENV === 'development'

Sentry.init({
  // Only report in production — avoids 403s from DSN auth in local dev.
  dsn: isDev ? undefined : (process.env.NEXT_PUBLIC_SENTRY_DSN ?? ''),
  enabled: !isDev,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubMedicalPII,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
})
