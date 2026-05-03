import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

// Block search engines from indexing token-shared medical summaries.
// These pages contain patient data and must never appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
}

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  // Use service-role client to bypass RLS — no anon policy needed
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Step 1: Fetch only metadata — never expose content before expiry check.
  // This prevents medical data from appearing in the RSC payload for expired links.
  const { data: meta } = await supabase
    .from('consult_summaries')
    .select('created_at, expires_at')
    .eq('token', token)
    .single()

  if (!meta) notFound()

  const expired = new Date(meta.expires_at) < new Date()
  const createdAt = new Date(meta.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const expiresAt = new Date(meta.expires_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Render the expired page early — no content fetched.
  if (expired) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[680px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-border">
            <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-2">
              Aliis · Resumen pre-consulta
            </p>
            <h1 className="font-serif text-[28px] leading-[1.2] text-foreground mb-1">
              Resumen para tu <em>médico</em>
            </h1>
            <p className="font-sans text-[13px] text-muted-foreground">
              Generado el {createdAt}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <p className="font-serif italic text-[17px] text-muted-foreground mb-2">
              Este resumen ha expirado.
            </p>
            <p className="font-sans text-[13px] text-muted-foreground">
              Los resúmenes son válidos por 7 días. Genera uno nuevo desde tu cuenta en Aliis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Only fetch content when the link is confirmed valid and not expired.
  const { data: full } = await supabase
    .from('consult_summaries')
    .select('content')
    .eq('token', token)
    .single()

  if (!full) notFound()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[680px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-border">
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-2">
            Aliis · Resumen pre-consulta
          </p>
          <h1 className="font-serif text-[28px] leading-[1.2] text-foreground mb-1">
            Resumen para tu <em>médico</em>
          </h1>
          <p className="font-sans text-[13px] text-muted-foreground">
            Generado el {createdAt}
          </p>
        </div>

        <div className="font-sans text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">
          {full.content as string}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
          <p className="font-sans text-[12px] text-muted-foreground">
            Válido hasta el {expiresAt}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/50">
            aliis.app
          </p>
        </div>
      </div>
    </div>
  )
}
