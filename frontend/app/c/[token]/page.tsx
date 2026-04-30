import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('consult_summaries')
    .select('content, created_at, expires_at')
    .eq('token', token)
    .single()

  if (!data) notFound()

  const expired = new Date(data.expires_at) < new Date()
  const createdAt = new Date(data.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const expiresAt = new Date(data.expires_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

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

        {expired ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <p className="font-serif italic text-[17px] text-muted-foreground mb-2">
              Este resumen ha expirado.
            </p>
            <p className="font-sans text-[13px] text-muted-foreground">
              Los resúmenes son válidos por 7 días. Genera uno nuevo desde tu cuenta en Aliis.
            </p>
          </div>
        ) : (
          <>
            <div className="font-sans text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">
              {data.content}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
              <p className="font-sans text-[12px] text-muted-foreground">
                Válido hasta el {expiresAt}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/50">
                aliis.app
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
