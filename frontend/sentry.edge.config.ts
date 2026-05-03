import * as Sentry from '@sentry/nextjs'
import { scrubMedicalPII } from './lib/sentry-scrub'

const isDev = process.env.NODE_ENV === 'development'

Sentry.init({
  dsn: isDev ? undefined : (process.env.NEXT_PUBLIC_SENTRY_DSN ?? ''),
  enabled: !isDev,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend: scrubMedicalPII,
  environment: process.env.VERCEL_ENV ?? 'development',
})
