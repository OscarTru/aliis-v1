import type { Metadata } from 'next'
import './globals.css'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
        {children}
      </body>
    </html>
  )
}
