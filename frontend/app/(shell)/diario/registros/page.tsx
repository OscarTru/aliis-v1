import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { SymptomLog } from '@/lib/types'

function MetricPills({ log }: { log: SymptomLog }) {
  const pills: string[] = []
  if (log.glucose !== null) pills.push(`Glucosa ${log.glucose} mg/dL`)
  if (log.bp_systolic !== null && log.bp_diastolic !== null) pills.push(`TA ${log.bp_systolic}/${log.bp_diastolic}`)
  else if (log.bp_systolic !== null) pills.push(`Sistólica ${log.bp_systolic}`)
  else if (log.bp_diastolic !== null) pills.push(`Diastólica ${log.bp_diastolic}`)
  if (log.heart_rate !== null) pills.push(`FC ${log.heart_rate} lpm`)
  if (log.weight !== null) pills.push(`Peso ${log.weight} kg`)
  if (log.temperature !== null) pills.push(`Temp ${log.temperature}°C`)

  return (
    <div className="flex flex-wrap gap-1.5">
      {pills.map((p, i) => (
        <span key={i} className="px-2.5 py-0.5 rounded-full bg-muted font-sans text-[11px] text-muted-foreground">
          {p}
        </span>
      ))}
    </div>
  )
}

export default async function RegistrosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  const logs = (data ?? []) as SymptomLog[]

  return (
    <div className="px-8 pt-10 pb-20 max-w-[800px] mx-auto">
      <div className="mb-8">
        <Link
          href="/diario"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[.12em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors no-underline mb-4"
        >
          <ArrowLeft size={11} />
          Volver al diario
        </Link>
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mi diario
        </p>
        <h1 className="font-serif text-[28px] leading-[1.2] text-foreground m-0">
          Todos los <em>registros</em>
        </h1>
        <p className="font-sans text-[13px] text-muted-foreground mt-2">
          {logs.length} {logs.length === 1 ? 'registro' : 'registros'} en total
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-[10px] tracking-[.1em] uppercase text-muted-foreground/60">
                {format(new Date(log.logged_at), "d MMM yyyy · HH:mm", { locale: es })}
              </span>
              <MetricPills log={log} />
              {log.note && (
                <p className="font-serif italic text-[13px] text-muted-foreground leading-[1.5] m-0">
                  {log.note}
                </p>
              )}
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <p className="font-serif italic text-[15px] text-muted-foreground text-center py-12">
            Aún no tienes registros.
          </p>
        )}
      </div>
    </div>
  )
}
