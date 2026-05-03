'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { FireDuotone } from './icons/FireDuotone'
import type { Treatment, AdherenceLog } from '@/lib/types'

// Fixed 4-column grid: col1=Mañana, col2=Mediodía, col3=Tarde, col4=Noche
// Each frequency only activates the columns it needs — empty cols stay as spacers
const SLOT_COLS: Record<string, { label: string; col: number }[]> = {
  once_daily:  [{ label: 'M', col: 1 }],
  twice_daily: [{ label: 'M', col: 1 }, { label: 'T', col: 3 }],
  as_needed:   [{ label: 'T', col: 3 }],
  three_daily: [{ label: 'M', col: 1 }, { label: 'T', col: 3 }, { label: 'N', col: 4 }],
  four_daily:  [{ label: 'M', col: 1 }, { label: 'MD', col: 2 }, { label: 'T', col: 3 }, { label: 'N', col: 4 }],
  prn:         [],
  other:       [],
}

const SLOT_TITLES: Record<string, string> = { M: 'Mañana', MD: 'Mediodía', T: 'Tarde', N: 'Noche' }

// Keep for streak calc compatibility
const SCHEDULE_SLOTS: Record<string, string[]> = {
  once_daily:  ['M'],
  twice_daily: ['M', 'T'],
  as_needed:   ['T'],
  three_daily: ['M', 'T', 'N'],
  four_daily:  ['M', 'MD', 'T', 'N'],
  prn:         [],
  other:       [],
}

// Frequencies that have a fixed schedule and count toward the adherence streak.
// PRN, as_needed and "other" are excluded from streak math by design.
const FIXED_FREQS = new Set(['once_daily', 'twice_daily', 'three_daily', 'four_daily'])

function slotKey(t: Treatment, slot: string): string {
  const base = t.dose ? `${t.name} ${t.dose}` : t.name
  return `${base} (${slot})`
}

/**
 * Computes the current adherence streak. Always reflects committed days
 * (yesterday and earlier). Today only adds +1 if every fixed-schedule
 * dose is already marked taken — so the counter is stable through the
 * day and grows the moment the user completes today's last dose.
 */
function calcStreak(logs: AdherenceLog[], treatments: Treatment[], todayDate: string): number {
  const fixed = treatments.filter(t => FIXED_FREQS.has(t.frequency))
  if (fixed.length === 0) return 0

  const takenLogs = logs.filter(l => l.status !== 'missed')

  function dayIsComplete(dateStr: string): boolean {
    const dayLogs = new Set(
      takenLogs.filter(l => l.taken_date === dateStr).map(l => l.medication)
    )
    return fixed.every(t =>
      (SCHEDULE_SLOTS[t.frequency] ?? []).every(slot => dayLogs.has(slotKey(t, slot)))
    )
  }

  // Today: only contributes when fully complete; otherwise the streak still
  // reflects yesterday's run without resetting to 0.
  const todayComplete = dayIsComplete(todayDate)

  let streak = todayComplete ? 1 : 0
  const cursor = new Date(todayDate + 'T12:00:00')
  for (let i = 1; i < 365; i++) {
    const d = new Date(cursor)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (!dayIsComplete(dateStr)) break
    streak++
  }
  return streak
}

interface Props {
  treatments: Treatment[]
  initialTodayLogs: AdherenceLog[]
  todayDate: string
}

export function TreatmentsWidget({ treatments, initialTodayLogs, todayDate }: Props) {
  const [logs, setLogs] = useState<AdherenceLog[]>(initialTodayLogs)
  const [, startTransition] = useTransition()

  const missingDose = treatments.filter(t => !t.dose?.trim())
  const [showDoseToast, setShowDoseToast] = useState(false)

  useEffect(() => {
    if (missingDose.length > 0) {
      const t = setTimeout(() => setShowDoseToast(true), 800)
      return () => clearTimeout(t)
    }
  }, [missingDose.length])

  if (treatments.length === 0) return null

  const takenToday = new Set(logs.map(l => l.medication))

  // Determine which columns are needed across all treatments
  const usedCols = new Set<number>()
  treatments.forEach(t => (SLOT_COLS[t.frequency] ?? []).forEach(s => usedCols.add(s.col)))
  const activeCols = [1, 2, 3, 4].filter(c => usedCols.has(c))

  // Streak only triggers when EVERY fixed-schedule medication is fully taken today.
  // PRN/as-needed/other don't gate the streak — they have no fixed obligation.
  const fixedTreatments = treatments.filter(t => FIXED_FREQS.has(t.frequency))
  const allDoneToday = fixedTreatments.length > 0 && fixedTreatments.every(t =>
    (SCHEDULE_SLOTS[t.frequency] ?? []).every(slot => takenToday.has(slotKey(t, slot)))
  )

  // Streak is computed from history regardless of whether today is fully
  // complete — so the counter is visible the whole day and updates the
  // moment the last dose is checked.
  const streak = calcStreak(logs, treatments, todayDate)

  function toggleSlot(t: Treatment, slot: string) {
    const key = slotKey(t, slot)
    const taken = takenToday.has(key)
    if (!taken) {
      setLogs(prev => [...prev, {
        id: crypto.randomUUID(),
        user_id: '',
        medication: key,
        taken_date: todayDate,
        taken_at: new Date().toISOString(),
      }])
    } else {
      setLogs(prev => prev.filter(l => !(l.medication === key && l.taken_date === todayDate)))
    }
    startTransition(async () => {
      const { toggleAdherence } = await import('@/app/actions/adherence')
      await toggleAdherence(key, todayDate, !taken)
    })
  }

  // Narrative date — "Hoy · martes 5 de mayo"
  const todayLabel = (() => {
    const d = new Date(todayDate + 'T12:00:00')
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  })()

  return (
    <div className={`rounded-2xl border bg-card p-4 transition-all duration-300 ${allDoneToday ? 'border-emerald-500/30' : 'border-border'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-0.5">
            Hoy · {todayLabel}
          </p>
          <h3 className="font-serif text-[15px] text-foreground leading-none">
            Mis <em>medicamentos</em>
          </h3>
        </div>
        <Link
          href="/tratamientos"
          className="font-mono text-[10px] text-primary/60 hover:text-primary transition-colors no-underline"
        >
          Editar
        </Link>
      </div>

      {/* Medication rows — single grid, 4 fixed slot cols always present */}
      <div
        className="grid gap-y-2"
        style={{ gridTemplateColumns: '1fr 28px 28px 28px 28px', columnGap: '8px' }}
      >
        {treatments.map(t => {
          const slotDefs = SLOT_COLS[t.frequency] ?? []
          const colMap = Object.fromEntries(slotDefs.map(s => [s.col, s]))

          return (
            <React.Fragment key={t.id}>
              <div className="min-w-0 flex items-center min-h-[38px]">
                <div>
                  <p className="font-sans text-[13px] font-medium text-foreground leading-tight truncate">
                    {t.name}
                  </p>
                  {t.dose
                    ? <p className="font-mono text-[10px] text-muted-foreground/40 leading-tight">{t.dose}</p>
                    : <p className="font-mono text-[10px] text-amber-500/70 leading-tight flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> falta la dosis
                      </p>
                  }
                </div>
              </div>

              {[1, 2, 3, 4].map(col => {
                const slotDef = colMap[col]
                if (!slotDef) return <div key={`${t.id}-${col}`} className="w-7 h-7" />
                const key = slotKey(t, slotDef.label)
                const taken = takenToday.has(key)
                return (
                  <button
                    key={`${t.id}-${slotDef.label}`}
                    onClick={() => toggleSlot(t, slotDef.label)}
                    title={SLOT_TITLES[slotDef.label]}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                      taken
                        ? 'border-emerald-500 bg-emerald-500/15'
                        : 'border-border bg-transparent hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    {taken
                      ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                      : <span className="font-mono text-[9px] text-muted-foreground/40 leading-none select-none">{slotDef.label}</span>
                    }
                  </button>
                )
              })}
            </React.Fragment>
          )
        })}
      </div>

      {/* Streak banner — visible whenever the streak is alive, not just when
          today is fully complete. The subtitle adapts to remind the user
          there's still doses pending today. */}
      {streak > 0 && (
        <div className={`mt-3 pt-3 border-t flex items-center gap-2 ${allDoneToday ? 'border-emerald-500/20' : 'border-border'}`}>
          <motion.div
            key={streak}
            initial={{ scale: 0.7, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0"
          >
            <FireDuotone className="w-5 h-5 text-amber-500" />
          </motion.div>
          <div>
            <motion.p
              key={`streak-${streak}`}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-sans text-[12px] font-medium text-foreground leading-tight"
            >
              {streak} {streak === 1 ? 'día' : 'días'} seguidos
            </motion.p>
            <p className="font-mono text-[10px] text-muted-foreground/50">
              {allDoneToday
                ? 'Todo al día — ¡así se hace!'
                : 'Termina las tomas de hoy para sumar uno más'}
            </p>
          </div>
        </div>
      )}

      {/* Toast — missing dose warning */}
      <AnimatePresence>
        {showDoseToast && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[12px] font-medium text-foreground leading-tight mb-0.5">
                {missingDose.length === 1
                  ? `¿Cuánto de ${missingDose[0].name} tomas?`
                  : `${missingDose.length} medicamentos sin dosis registrada`}
              </p>
              <p className="font-sans text-[11px] text-muted-foreground/70 leading-relaxed">
                Agrégala en{' '}
                <Link href="/tratamientos" className="text-amber-500 underline-offset-2 underline">
                  tus tratamientos
                </Link>{' '}para que pueda ayudarte mejor.
              </p>
            </div>
            <button
              onClick={() => setShowDoseToast(false)}
              className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
