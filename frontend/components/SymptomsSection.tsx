'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { SymptomLog } from '@/lib/types'

const METRICS = [
  { key: 'glucose',      label: 'Glucosa',    unit: 'mg/dL', color: 'hsl(var(--primary))' },
  { key: 'bp_systolic',  label: 'Sistólica',  unit: 'mmHg',  color: '#e74c3c' },
  { key: 'bp_diastolic', label: 'Diastólica', unit: 'mmHg',  color: '#e67e22' },
  { key: 'heart_rate',   label: 'FC',         unit: 'lpm',   color: '#8e44ad' },
  { key: 'weight',       label: 'Peso',       unit: 'kg',    color: '#27ae60' },
  { key: 'temperature',  label: 'Temp',       unit: '°C',    color: '#2980b9' },
] as const

type MetricKey = typeof METRICS[number]['key']

type ModalStep = 'select' | 'vitals' | 'symptom'

const INPUT_CLS = 'w-full rounded-xl border border-border bg-background px-3 py-2 font-sans text-[14px] focus:outline-none focus:border-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
const LABEL_CLS = 'font-mono text-[10px] tracking-[.12em] uppercase text-muted-foreground'

function LogModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved: (log: SymptomLog) => void
}) {
  const [step, setStep] = useState<ModalStep>('select')
  const [fields, setFields] = useState({
    symptom: '',
    glucose: '',
    bp_systolic: '',
    bp_diastolic: '',
    heart_rate: '',
    weight: '',
    temperature: '',
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setStep('select')
    setFields({ symptom: '', glucose: '', bp_systolic: '', bp_diastolic: '', heart_rate: '', weight: '', temperature: '', note: '' })
    setError(null)
    onClose()
  }

  const numericKeys = ['glucose', 'bp_systolic', 'bp_diastolic', 'heart_rate', 'weight', 'temperature'] as const
  const hasNumeric = numericKeys.some(k => fields[k].trim() !== '')
  const canSubmit = step === 'symptom' ? (fields.symptom.trim() !== '' || hasNumeric) : hasNumeric

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const body: Record<string, number | string | null> = {}
    numericKeys.forEach(k => {
      const v = fields[k].trim()
      if (v !== '') body[k] = parseFloat(v)
    })
    const noteParts = []
    if (step === 'symptom' && fields.symptom.trim()) noteParts.push(`Síntoma: ${fields.symptom.trim()}`)
    if (fields.note.trim()) noteParts.push(fields.note.trim())
    if (noteParts.length) body.note = noteParts.join('\n')

    const res = await fetch('/api/symptoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    onSaved(data)
    handleClose()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[20px]">
            {step === 'select' ? 'Nuevo registro' : step === 'vitals' ? 'Signos vitales' : 'Síntoma + signos vitales'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1 — selector */}
        {step === 'select' && (
          <div className="flex flex-col gap-3 pt-2">
            <p className="font-sans text-[13px] text-muted-foreground">¿Qué quieres registrar?</p>
            <button
              onClick={() => setStep('vitals')}
              className="flex flex-col items-start gap-0.5 p-4 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-left cursor-pointer"
            >
              <span className="font-sans text-[14px] font-medium text-foreground">Solo signos vitales</span>
              <span className="font-sans text-[12px] text-muted-foreground">Glucosa, tensión, frecuencia, peso, temperatura</span>
            </button>
            <button
              onClick={() => setStep('symptom')}
              className="flex flex-col items-start gap-0.5 p-4 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-left cursor-pointer"
            >
              <span className="font-sans text-[14px] font-medium text-foreground">Síntoma + signos vitales</span>
              <span className="font-sans text-[12px] text-muted-foreground">Describe lo que sientes y agrega tus mediciones</span>
            </button>
          </div>
        )}

        {/* Steps 2a + 2b — form */}
        {step !== 'select' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            {step === 'symptom' && (
              <div className="flex flex-col gap-1">
                <label className={LABEL_CLS}>¿Qué síntoma?</label>
                <input
                  type="text"
                  value={fields.symptom}
                  onChange={e => setFields(f => ({ ...f, symptom: e.target.value }))}
                  placeholder="Ej. dolor de cabeza, mareo, náusea..."
                  autoFocus
                  className={INPUT_CLS}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLS}>Glucosa</label>
              <input
                type="number"
                value={fields.glucose}
                onChange={e => setFields(f => ({ ...f, glucose: e.target.value }))}
                placeholder="mg/dL"
                className={INPUT_CLS}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLS}>Tensión arterial</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fields.bp_systolic}
                  onChange={e => setFields(f => ({ ...f, bp_systolic: e.target.value }))}
                  placeholder="Sistólica mmHg"
                  className={INPUT_CLS.replace('w-full', 'flex-1 min-w-0')}
                />
                <input
                  type="number"
                  value={fields.bp_diastolic}
                  onChange={e => setFields(f => ({ ...f, bp_diastolic: e.target.value }))}
                  placeholder="Diastólica mmHg"
                  className={INPUT_CLS.replace('w-full', 'flex-1 min-w-0')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLS}>Frecuencia cardíaca</label>
              <input
                type="number"
                value={fields.heart_rate}
                onChange={e => setFields(f => ({ ...f, heart_rate: e.target.value }))}
                placeholder="lpm"
                className={INPUT_CLS}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className={LABEL_CLS}>Peso</label>
                <input
                  type="number"
                  value={fields.weight}
                  onChange={e => setFields(f => ({ ...f, weight: e.target.value }))}
                  placeholder="kg"
                  className={INPUT_CLS.replace('w-full', 'w-full')}
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className={LABEL_CLS}>Temperatura</label>
                <input
                  type="number"
                  value={fields.temperature}
                  onChange={e => setFields(f => ({ ...f, temperature: e.target.value }))}
                  placeholder="°C"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL_CLS}>Nota adicional</label>
              <textarea
                value={fields.note}
                onChange={e => setFields(f => ({ ...f, note: e.target.value }))}
                placeholder="¿Cómo te sentías?"
                rows={2}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 font-sans text-[14px] focus:outline-none focus:border-foreground/30 resize-none"
              />
            </div>

            {error && <p className="font-sans text-[12px] text-destructive">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2.5 rounded-full border border-border bg-transparent font-sans text-[13px] text-foreground cursor-pointer hover:bg-muted transition-colors"
              >
                ← Volver
              </button>
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className={cn(
                  'flex-1 py-2.5 rounded-full font-sans text-[14px] font-medium transition-colors border-none',
                  canSubmit && !saving
                    ? 'bg-foreground text-background cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {saving ? 'Guardando...' : 'Guardar registro'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

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

const PREVIEW_COUNT = 2
const PAGE_THRESHOLD = 7

export function SymptomsSection({ initialLogs }: { initialLogs: SymptomLog[] }) {
  const [logs, setLogs] = useState<SymptomLog[]>(initialLogs)
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(METRICS.map(m => m.key))
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('registrar') === '1') {
      setModalOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('registrar')
      const newUrl = params.size > 0 ? `${pathname}?${params}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, pathname, router])

  useEffect(() => {
    function handleEvent() { setModalOpen(true) }
    window.addEventListener('aliis:open-registro', handleEvent)
    return () => window.removeEventListener('aliis:open-registro', handleEvent)
  }, [])

  function toggleMetric(key: MetricKey) {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function handleSaved(log: SymptomLog) {
    setLogs(prev => [log, ...prev])
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/symptoms/${id}`, { method: 'DELETE' })
    if (res.ok) setLogs(prev => prev.filter(l => l.id !== id))
  }

  const chartData = [...logs]
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map(l => ({
      ts: new Date(l.logged_at).getTime(),
      date: format(new Date(l.logged_at), 'dd/MM HH:mm'),
      glucose: l.glucose,
      bp_systolic: l.bp_systolic,
      bp_diastolic: l.bp_diastolic,
      heart_rate: l.heart_rate,
      weight: l.weight,
      temperature: l.temperature,
    }))

  if (logs.length === 0) {
    return (
      <div className="flex flex-col">
        <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50 mb-5">
          Síntomas y signos vitales
        </p>
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <p className="font-serif italic text-[15px] text-muted-foreground mb-4 leading-relaxed">
            Aún no tienes registros de síntomas.<br />Empieza a llevar tu control hoy.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground text-background font-sans text-[13px] font-medium border-none cursor-pointer"
          >
            <Plus size={13} />
            Registrar primer síntoma
          </button>
        </div>
        <LogModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50">
          Síntomas y signos vitales
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-foreground text-background font-sans text-[13px] font-medium border-none cursor-pointer"
        >
          <Plus size={13} />
          Registrar
        </button>
      </div>

      {/* Split: vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        {/* Left/Top — metric filters + log list */}
        <div className="flex flex-col gap-3 md:w-[44%] md:shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={cn(
                  'px-2.5 py-0.5 rounded-full font-sans text-[11px] border transition-colors cursor-pointer',
                  activeMetrics.has(m.key)
                    ? 'bg-foreground text-background border-transparent'
                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {(expanded ? logs : logs.slice(0, PREVIEW_COUNT)).map(log => (
              <div key={log.id} className="flex items-start gap-2 p-3 bg-muted rounded-xl">
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <span className="font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground/60">
                    {format(new Date(log.logged_at), "d MMM · HH:mm", { locale: es })}
                  </span>
                  <MetricPills log={log} />
                  {log.note && (
                    <p className="font-serif italic text-[12px] text-muted-foreground leading-[1.5] m-0">
                      {log.note}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors border-none bg-transparent cursor-pointer p-1"
                  aria-label="Eliminar registro"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {logs.length > PREVIEW_COUNT && !expanded && logs.length <= PAGE_THRESHOLD && (
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl border border-dashed border-border font-sans text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer bg-transparent"
              >
                <ChevronDown size={12} />
                Ver {logs.length - PREVIEW_COUNT} más
              </button>
            )}

            {logs.length > PAGE_THRESHOLD && !expanded && (
              <Link
                href="/diario/registros"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl border border-dashed border-border font-sans text-[11px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors no-underline"
              >
                <ChevronDown size={12} />
                Ver todos ({logs.length} registros)
              </Link>
            )}
          </div>
        </div>

        {/* Right/Bottom — chart */}
        <div className="flex-1 min-w-0">
          {chartData.length < 2 ? (
            <p className="font-sans text-[12px] text-muted-foreground italic pt-4 text-center">
              Necesitas al menos 2 registros para ver tendencias.
            </p>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    tickLine={false}
                    minTickGap={40}
                  />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      background: 'hsl(var(--background))',
                    }}
                  />
                  {METRICS.filter(m => activeMetrics.has(m.key)).map(m => (
                    <Line
                      key={m.key}
                      type="monotone"
                      dataKey={m.key}
                      stroke={m.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                      name={m.label}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <LogModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </div>
  )
}
