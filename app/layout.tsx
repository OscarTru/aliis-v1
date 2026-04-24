import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Entiende tu diagnóstico · Cerebros Esponjosos',
  description:
    'Tu médico te dio un diagnóstico y no quedó del todo claro. Aquí lo desglosamos en lenguaje humano — con evidencia real, sin jerga innecesaria.',
  openGraph: {
    title: 'Entiende tu diagnóstico · Cerebros Esponjosos',
    description:
      'Escribe tu diagnóstico y recibe un pack educativo personalizado en lenguaje humano.',
    siteName: 'Cerebros Esponjosos',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0f0f1a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
