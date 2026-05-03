'use client'

import { useState, useTransition } from 'react'
import { X, Pill, AlertTriangle } from 'lucide-react'
import { createTreatment, updateTreatment } from '@/app/actions/treatments'
import { DatePicker } from '@/components/ui/date-picker'
import type { Treatment, TreatmentFrequency } from '@/lib/types'

const SCHEDULE_OPTIONS: { label: string; value: TreatmentFrequency }[] = [
  { label: 'Por la mañana', value: 'once_daily' },
  { label: 'Por la mañana y por la tarde', value: 'twice_daily' },
  { label: 'Solo por las tardes', value: 'as_needed' },
  { label: '3 veces al día', value: 'three_daily' },
  { label: '4 veces al día', value: 'four_daily' },
  { label: 'Por razón necesaria', value: 'prn' },
  { label: 'Otra frecuencia', value: 'other' },
]

interface DoseCheck {
  nameNormalized: string
  nameConfidence: 'high' | 'low'
  doseNormalized: string
  unit: string
  warning: boolean
  warningLevel: 'none' | 'caution' | 'danger'
  warningMessage: string
}

interface Props {
  treatment?: Treatment
  onClose: () => void
  onCreated: (t?: Treatment) => void
}

export function AddTreatmentModal({ treatment, onClose, onCreated }: Props) {
  const isEdit = !!treatment
  const [name, setName] = useState(treatment?.name ?? '')
  const [dose, setDose] = useState(treatment?.dose ?? '')
  const [frequency, setFrequency] = useState<TreatmentFrequency>(treatment?.frequency ?? 'once_daily')
  const [frequencyLabel, setFrequencyLabel] = useState(treatment?.frequency_label ?? '')
  const [indefinite, setIndefinite] = useState(treatment?.indefinite ?? true)
  const [startedAt, setStartedAt] = useState(treatment?.started_at ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isValidating, setIsValidating] = useState(false)

  // Validation steps
  const [doseCheck, setDoseCheck] = useState<DoseCheck | null>(null)
  const [confirmedDose, setConfirmedDose] = useState(false)
  // 'name' = AI unsure of medication name, 'dose' = unusual dose
  const [checkStep, setCheckStep] = useState<'name' | 'dose' | null>(null)

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido.'); return }
    setError(null)

    // Skip validation only if already confirmed
    if (!confirmedDose) {
      setIsValidating(true)
      try {
        const res = await fetch('/api/aliis/validate-dose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), dose: dose.trim() }),
        })
        const check: DoseCheck = await res.json()

        // Strip medication name from dose if AI accidentally included it
        const rawDose = check.doseNormalized || dose.trim()
        const namePrefix = new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i')
        const finalDose = rawDose.replace(namePrefix, '').trim()
        if (finalDose !== dose.trim()) setDose(finalDose)

        // Use normalized name if AI is confident — always prefer it over what user typed
        const normalized = check.nameNormalized?.trim() || name.trim()
        const nameChanged = normalized.toLowerCase() !== name.trim().toLowerCase()
        if (nameChanged && check.nameConfidence === 'high') {
          setName(normalized)
        }
        const finalName = check.nameConfidence === 'high' ? normalized : name.trim()

        setIsValidating(false)

        // If AI is unsure about the name, ask patient to confirm
        if (check.nameConfidence === 'low') {
          setDoseCheck({ ...check, doseNormalized: finalDose })
          setCheckStep('name')
          return
        }

        if (check.warning) {
          setDoseCheck({ ...check, doseNormalized: finalDose })
          setCheckStep('dose')
          return
        }

        save(finalName, finalDose)
        return
      } catch {
        // Non-fatal — proceed without validation
      }
      setIsValidating(false)
    }

    save(name.trim(), dose)
  }

  function handleConfirmNameAndContinue() {
    // Patient confirmed their original name is correct
    if (doseCheck?.warning) {
      setCheckStep('dose')
    } else {
      setCheckStep(null)
      save(name.trim(), doseCheck?.doseNormalized || dose)
    }
  }

  function handleAcceptSuggestedName() {
    const suggested = doseCheck?.nameNormalized || name
    setName(suggested)
    if (doseCheck?.warning) {
      setCheckStep('dose')
    } else {
      setCheckStep(null)
      save(suggested, doseCheck?.doseNormalized || dose)
    }
  }

  function handleConfirmWarning() {
    setConfirmedDose(true)
    const finalDose = doseCheck?.doseNormalized || dose
    setCheckStep(null)
    setDoseCheck(null)
    save(name.trim(), finalDose)
  }

  function save(finalName: string, finalDose: string) {
    startTransition(async () => {
      const input = {
        name: finalName.trim(),
        dose: finalDose.trim() || undefined,
        frequency,
        frequency_label: frequency === 'other' ? frequencyLabel.trim() : undefined,
        indefinite,
        started_at: startedAt || undefined,
      }
      if (isEdit) {
        const result = await updateTreatment(treatment!.id, input)
        if (result.error) { setError(result.error); return }
        onCreated(result.data)
        onClose()
      } else {
        const result = await createTreatment(input)
        if (result.error) { setError(result.error); return }
        onCreated(result.data)
        onClose()
      }
    })
  }

  const isBusy = isPending || isValidating

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-[480px] bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >

        {/* Header — fixed at top, doesn't scroll */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-serif text-[18px] text-foreground leading-none truncate">
              {isEdit ? 'Editar ' : 'Agregar '}<em>tratamiento</em>
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-11 h-11 -mr-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body — content lives here, footer below stays sticky */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* Name confirmation — AI is unsure about medication name */}
        {checkStep === 'name' ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-[13px] font-medium text-foreground mb-1">
                  ¿Puedes revisar el nombre?
                </p>
                <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                  No reconozco <span className="font-medium text-foreground">"{name}"</span> como un medicamento. Puede ser un nombre comercial poco común o un error tipográfico — dale un vistazo a tu receta.
                </p>
                {doseCheck?.nameNormalized && doseCheck.nameNormalized !== name && (
                  <p className="font-sans text-[12px] text-muted-foreground/70 mt-2">
                    ¿Te refieres a <span className="font-medium text-foreground">{doseCheck.nameNormalized}</span>?
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {doseCheck?.nameNormalized && doseCheck.nameNormalized !== name && (
                <button
                  onClick={handleAcceptSuggestedName}
                  disabled={isBusy}
                  className="w-full h-11 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer disabled:opacity-60 transition-opacity"
                >
                  Sí, es {doseCheck.nameNormalized}
                </button>
              )}
              <button
                onClick={handleConfirmNameAndContinue}
                disabled={isBusy}
                className="w-full h-11 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
              >
                No, el nombre está bien
              </button>
            </div>
          </div>

        ) : checkStep === 'dose' ? (
          /* Dose warning step */
          <div className="flex flex-col gap-4">
            <div className={`flex gap-3 p-4 rounded-xl border ${
              doseCheck?.warningLevel === 'danger'
                ? 'bg-destructive/10 border-destructive/20'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                doseCheck?.warningLevel === 'danger' ? 'text-destructive' : 'text-amber-500'
              }`} />
              <div>
                <p className="font-sans text-[13px] font-medium text-foreground mb-1">
                  {doseCheck?.warningLevel === 'danger' ? 'Quiero asegurarme de que estés bien' : 'Esto no cuadra del todo'}
                </p>
                <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                  {doseCheck?.warningMessage}
                </p>
                <p className="font-sans text-[12px] text-muted-foreground/70 mt-2">
                  {doseCheck?.warningLevel === 'danger'
                    ? 'Antes de guardar, te recomiendo que lo confirmes con tu médico o revises tu receta.'
                    : 'Si tu médico te lo recetó así, sin problema — puedes continuar.'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmWarning}
                disabled={isBusy}
                className={`flex-1 h-11 rounded-xl font-sans text-[14px] font-medium cursor-pointer disabled:opacity-60 transition-opacity ${
                  doseCheck?.warningLevel === 'danger'
                    ? 'bg-destructive text-white'
                    : 'bg-foreground text-background'
                }`}
              >
                {doseCheck?.warningLevel === 'danger' ? 'Guardar igual' : 'Sí, así me lo recetaron'}
              </button>
              <button
                onClick={() => { setCheckStep(null); setDoseCheck(null) }}
                className="h-11 px-4 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer"
              >
                Corregir
              </button>
            </div>
          </div>

        ) : (
          /* Normal form */
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Medicamento *</label>
                <input
                  className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                  placeholder="Ej: Metformina"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus={!isEdit}
                />
              </div>
              <div className="w-28">
                <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Dosis</label>
                <input
                  className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                  placeholder="500 mg"
                  value={dose}
                  onChange={e => { setDose(e.target.value); setConfirmedDose(false) }}
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">¿Cuándo lo toma?</label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                value={frequency}
                onChange={e => setFrequency(e.target.value as TreatmentFrequency)}
              >
                {SCHEDULE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {frequency === 'other' && (
              <input
                className="h-11 w-full rounded-xl border border-border bg-muted px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                placeholder="Describe la frecuencia"
                value={frequencyLabel}
                onChange={e => setFrequencyLabel(e.target.value)}
              />
            )}

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="font-mono text-[11px] tracking-[.12em] uppercase text-muted-foreground/60 mb-1.5 block">Fecha de inicio</label>
                <DatePicker
                  value={startedAt}
                  onChange={setStartedAt}
                  disabled={indefinite}
                  placeholder="Selecciona fecha"
                />
              </div>
              <label className="flex items-center gap-2 font-sans text-[13px] text-muted-foreground cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={indefinite}
                  onChange={e => setIndefinite(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                Indefinido
              </label>
            </div>

            {error && <p className="font-sans text-[13px] text-destructive">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={isBusy || !name.trim()}
                className="flex-1 h-11 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer disabled:opacity-60 transition-opacity"
              >
                {isValidating ? 'Revisando con Aliis…' : isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar tratamiento'}
              </button>
              <button
                onClick={onClose}
                className="h-11 px-4 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
