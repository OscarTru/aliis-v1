import type { MetadataRoute } from 'next'

/**
 * Sitemap for crawlable, public pages only.
 * Authenticated routes are excluded by /robots.ts and not listed here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aliis.app'
  const lastModified = new Date()

  return [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/precios`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/terminos`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacidad`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/disclaimer`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookies`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
