'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Circle, Flame } from 'lucide-react'
import { toggleAdherence } from '@/app/actions/adherence'
import { calculateStreak } from '@/lib/adherence'
import type { AdherenceLog } from '@/lib/types'

interface Props {
  medications: string[]
  initialLogs: AdherenceLog[]
  timezone: string
  todayDate: string // YYYY-MM-DD in user's timezone, computed server-side
}

export function AdherenceSection({ medications, initialLogs, timezone, todayDate }: Props) {
  const [logs, setLogs] = useState<AdherenceLog[]>(initialLogs)
  const [pending, startTransition] = useTransition()

  const takenToday = new Set(
    logs.filter(l => l.taken_date === todayDate).map(l => l.medication)
  )

  const streak = calculateStreak(logs, timezone)

  function toggle(medication: string) {
    const wasTaken = takenToday.has(medication)
    const newTaken = !wasTaken

    // Optimistic update
    if (newTaken) {
      setLogs(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: '',
          medication,
          taken_date: todayDate,
          taken_at: new Date().toISOString(),
        },
      ])
    } else {
      setLogs(prev => prev.filter(l => !(l.medication === medication && l.taken_date === todayDate)))
    }

    startTransition(async () => {
      const result = await toggleAdherence(medication, todayDate, newTaken)
      if (result.error) {
        // Revert optimistic update on error
        setLogs(initialLogs)
      }
    })
  }

  if (medications.length === 0) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-0.5">
            Adherencia
          </p>
          <h2 className="font-serif text-[18px] leading-none text-foreground">
            Tus <em>medicamentos</em> de hoy
          </h2>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-[13px] font-semibold text-amber-600 dark:text-amber-400">
              {streak} {streak === 1 ? 'día' : 'días'}
            </span>
          </div>
        )}
      </div>

      {/* Medication list */}
      <ul className="space-y-2">
        {medications.map(med => {
          const taken = takenToday.has(med)
          return (
            <li key={med}>
              <button
                onClick={() => toggle(med)}
                disabled={pending}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  taken
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                {taken
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  : <Circle className="w-5 h-5 shrink-0" />
                }
                <span className="font-sans text-[14px]">{med}</span>
                {taken && (
                  <span className="ml-auto font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    Tomado
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
