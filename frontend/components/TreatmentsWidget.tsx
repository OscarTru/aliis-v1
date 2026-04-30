import { Pill } from 'lucide-react'
import Link from 'next/link'
import { FREQUENCY_LABELS } from '@/lib/types'
import type { Treatment } from '@/lib/types'

interface Props {
  treatments: Treatment[]
}

export function TreatmentsWidget({ treatments }: Props) {
  if (treatments.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-0.5">
            Tratamientos
          </p>
          <h3 className="font-serif text-[15px] text-foreground leading-none">
            Mis <em>medicamentos</em>
          </h3>
        </div>
        <Link
          href="/cuenta"
          className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors no-underline"
        >
          Editar
        </Link>
      </div>

      <ul className="space-y-2">
        {treatments.map(t => {
          const freq = t.frequency === 'other'
            ? (t.frequency_label ?? '')
            : FREQUENCY_LABELS[t.frequency]
          return (
            <li key={t.id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Pill className="w-3 h-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[13px] font-medium text-foreground leading-tight">
                  {t.name}
                  {t.dose && <span className="font-normal text-muted-foreground ml-1">{t.dose}</span>}
                </p>
                <p className="font-sans text-[11px] text-muted-foreground">{freq}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
