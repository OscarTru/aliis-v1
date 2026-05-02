import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const isDev = process.env.NODE_ENV !== 'production'

// Backend API origin allowed in connect-src.
//   - In dev: localhost:3001 (Express backend)
//   - In prod: https://api.aliis.app (Railway-hosted)
// Override via NEXT_PUBLIC_API_URL in env if either changes.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? (isDev ? 'http://localhost:3001' : 'https://api.aliis.app')

// Build CSP. Dev needs 'unsafe-eval' for Next.js HMR / React Refresh.
// Prod is stricter. Both allow Google Analytics + Tag Manager since gtag is loaded site-wide.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ''}https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${apiUrl} https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://m.stripe.com https://m.stripe.network https://r.stripe.com https://accounts.google.com https://*.ingest.de.sentry.io https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
].join('; ')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'aliis',
  project: 'aliis-frontend',
  // Source maps require SENTRY_AUTH_TOKEN at build time — silently skipped if missing
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  disableLogger: true,
})
