import * as Sentry from '@sentry/nextjs'
import { scrubMedicalPII } from './lib/sentry-scrub'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? 'https://cb1476dc53c6459d0cb15784fbedfa6e@o4511318848110592.ingest.de.sentry.io/4511318872227920',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubMedicalPII,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
})
