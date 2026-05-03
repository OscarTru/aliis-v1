'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ExtractedSymptom {
  name: string
  needs_medical_attention: boolean
  attention_reason: string | null
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

type Step = 'write' | 'confirm' | 'saving'

export function DiaryEntryModal({ open, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>('write')
  const [text, setText] = useState('')
  const [symptoms, setSymptoms] = useState<ExtractedSymptom[]>([])
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set())
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setStep('write')
    setText('')
    setSymptoms([])
    setConfirmed(new Set())
    setError(null)
    onClose()
  }

  async function handleExtract() {
    if (!text.trim()) return
    setExtracting(true)
    setError(null)
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract', text }),
      })
      const data = await res.json()
      const extracted: ExtractedSymptom[] = data.symptoms ?? []
      setSymptoms(extracted)
      // Pre-select all by default
      setConfirmed(new Set(extracted.map((_, i) => i)))
      setStep('confirm')
    } catch {
      setError('Error al analizar el texto. Intenta de nuevo.')
    } finally {
      setExtracting(false)
    }
  }

  async function handleSave() {
    setStep('saving')
    setError(null)
    try {
      const selectedSymptoms = symptoms.filter((_, i) => confirmed.has(i))
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', text, symptoms: selectedSymptoms }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar.')
        setStep('confirm')
        return
      }
      onSaved()
      handleClose()
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
      setStep('confirm')
    }
  }

  function toggleSymptom(i: number) {
    setConfirmed(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogPortal>
        <DialogOverlay />
        {/* Centered on all viewports. Unified modal pattern across the app. */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="relative w-full sm:max-w-[480px] bg-background rounded-2xl border border-border shadow-xl flex flex-col max-h-[85vh] pointer-events-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-border/40">
              <h2 className="font-serif text-[18px] text-foreground leading-none">
                {step === 'write' ? <>Diario <em>libre</em></> : <>Síntomas <em>detectados</em></>}
              </h2>
              <button
                onClick={handleClose}
                aria-label="Cerrar"
                className="w-11 h-11 -mr-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border-none bg-transparent cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* Step 1: write */}
              {step === 'write' && (
                <div className="flex flex-col gap-4">
                  <p className="font-sans text-[13px] text-muted-foreground">
                    Escribe cómo te sientes hoy. Aliis extraerá los síntomas automáticamente.
                  </p>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Hoy me desperté con dolor de cabeza, un poco de mareo al levantarme..."
                    rows={5}
                    maxLength={2000}
                    className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 font-sans text-[16px] text-foreground focus:outline-none focus:border-foreground/30 resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted-foreground/50">{text.length}/2000</span>
                    {error && <p className="font-sans text-[12px] text-destructive">{error}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="px-4 h-11 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleExtract}
                      disabled={!text.trim() || extracting}
                      className={cn(
                        'flex-1 h-11 flex items-center justify-center gap-2 rounded-xl font-sans text-[14px] font-medium transition-colors border-none',
                        text.trim() && !extracting
                          ? 'bg-foreground text-background cursor-pointer'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      {extracting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {extracting ? 'Analizando...' : 'Continuar →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: confirm symptoms */}
              {step === 'confirm' && (
                <div className="flex flex-col gap-4">
                  {symptoms.length === 0 ? (
                    <p className="font-sans text-[14px] text-muted-foreground">
                      No detecté síntomas específicos. Se guardará tu entrada de diario.
                    </p>
                  ) : (
                    <>
                      <p className="font-sans text-[13px] text-muted-foreground">
                        Detecté estos síntomas. Desactiva los que no apliquen.
                      </p>
                      <ul className="flex flex-col gap-2">
                        {symptoms.map((s, i) => (
                          <li key={i}>
                            <button
                              onClick={() => toggleSymptom(i)}
                              className={cn(
                                'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer',
                                confirmed.has(i)
                                  ? 'border-primary/30 bg-primary/5'
                                  : 'border-border bg-transparent opacity-50'
                              )}
                            >
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                confirmed.has(i) ? 'border-primary bg-primary' : 'border-border'
                              )}>
                                {confirmed.has(i) && <Check className="w-3 h-3 text-background" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-sans text-[14px] text-foreground capitalize">{s.name}</span>
                                {s.needs_medical_attention && (
                                  <span className="ml-2 font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase">
                                    atención médica
                                  </span>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {error && <p className="font-sans text-[12px] text-destructive">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep('write')}
                      className="h-11 px-4 rounded-xl border border-border bg-transparent font-sans text-[14px] text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                    >
                      ← Editar
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 h-11 rounded-xl bg-foreground text-background font-sans text-[14px] font-medium cursor-pointer border-none transition-opacity"
                    >
                      Guardar entrada
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: saving */}
              {step === 'saving' && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="font-sans text-[14px] text-muted-foreground">Guardando...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  )
}
