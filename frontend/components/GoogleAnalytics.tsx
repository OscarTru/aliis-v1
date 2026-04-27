'use client'

import Script from 'next/script'
import { useState } from 'react'
import { CookieBanner } from './CookieBanner'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function AnalyticsProvider() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  function handleConsent({ analytics }: { analytics: boolean }) {
    setAnalyticsEnabled(analytics)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
      })
    }
  }

  return (
    <>
      {GA_ID && (
        <>
          <Script id="ga-consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', { analytics_storage: 'denied' });
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
          {analyticsEnabled && (
            <Script id="ga-consent-granted" strategy="afterInteractive">
              {`gtag('consent', 'update', { analytics_storage: 'granted' });`}
            </Script>
          )}
        </>
      )}
      <CookieBanner onConsentChange={handleConsent} />
    </>
  )
}
