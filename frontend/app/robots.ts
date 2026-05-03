import type { MetadataRoute } from 'next'

/**
 * Robots policy.
 *
 * Public marketing pages (landing, /precios, legal) ARE indexable so the
 * product can be discovered. Authenticated routes and API endpoints are
 * disallowed — they require a session and would only return errors to crawlers,
 * polluting search results.
 */
export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aliis.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/api/',
          '/auth/',
          '/onboarding',
          '/historial',
          '/pack/',
          '/cuenta',
          '/diario',
          '/tratamientos',
          '/ingreso',
          '/soporte',
          '/checkout',
          '/checkout/',
          '/compartir/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
