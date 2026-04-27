import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AnalyticsProvider } from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'Aliis · Entiende tu diagnóstico neurológico',
  description:
    'Aliis es tu asistente de IA para salud cerebral. Traduce el lenguaje médico, cita sus fuentes, y te acompaña entre consulta y consulta.',
  openGraph: {
    title: 'Aliis · Entiende tu diagnóstico neurológico',
    description:
      'Cuéntale a Aliis lo que te dijo el neurólogo. Te devuelve una explicación clara, con referencias verificables.',
    siteName: 'Aliis · Cerebros Esponjosos',
  },
}

function RegisterSW() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `,
      }}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
        <AnalyticsProvider />
        <RegisterSW />
      </body>
    </html>
  )
}
