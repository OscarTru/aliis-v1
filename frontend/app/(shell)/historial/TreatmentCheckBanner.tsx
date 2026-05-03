'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Plus, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { UpgradeModal } from '@/components/UpgradeModal'
import type { Profile } from '@/lib/types'

interface Item {
  mensaje: string
  tipo: 'dx_sin_tto' | 'tto_sin_dx'
  dx?: string
  tratamiento?: string
}

interface Props {
  userPlan: Profile['plan']
}

export function TreatmentCheckBanner({ userPlan }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const isPro = userPlan === 'pro'

  async function load(force = false) {
    if (!isPro) return
    setLoading(true)
    try {
      const url = force ? '/api/aliis/treatment-check?refresh=1' : '/api/aliis/treatment-check'
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.items)) setItems(data.items)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  useEffect(() => { load() }, [userPlan])

  // Free users: show upsell card
  if (!isPro) {
    return (
      <>
        <div className="mb-6">
          <div className="mb-2">
            <p className="font-mono text-[10px] tracking-[.16em] uppercase text-muted-foreground/50">
              Revisión de tratamientos
            </p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[13px] font-medium text-foreground leading-tight">
                  Detectar inconsistencias en mis tratamientos
                </p>
                <p className="font-sans text-[11px] text-muted-foreground/60 mt-0.5">
                  Aliis revisa que tus diagnósticos y medicamentos cuadren
                </p>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-secondary/20 font-mono text-[9px] text-secondary tracking-wide leading-none shrink-0">
                Pro
              </span>
            </div>
          </button>
        </div>

        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            feature={{
              title: 'Revisión inteligente de tratamientos',
              description: 'Con Aliis Pro detecta si algún diagnóstico no tiene tratamiento registrado o viceversa, y recibe sugerencias concretas.',
            }}
          />
        )}
      </>
    )
  }

  // Pro users: normal behavior
  if (!loading && !loaded) return null

  return (
    <div className="mb-6">
      <div className="mb-2">
        <p className="font-mono text-[10px] tracking-[.16em] uppercase text-muted-foreground/50">
          Revisión de tratamientos
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading && items.length === 0 ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3.5 bg-muted/30 border border-border rounded-xl"
          >
            <p className="font-sans text-[13px] text-muted-foreground/60 italic">
              Aliis está revisando que tus tratamientos y diagnósticos cuadren…
            </p>
          </motion.div>
        ) : loaded && items.length === 0 ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3.5 bg-muted/20 border border-border rounded-xl"
          >
            <p className="font-sans text-[13px] text-muted-foreground/60 italic">
              Todo parece estar en orden — no noto nada que revisar por ahora.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="findings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl"
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] text-foreground leading-snug mb-3">
                    {item.mensaje}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[9px] text-muted-foreground/40 leading-relaxed">
                      Aliis te lo menciona,<br />solo tu médico puede confirmarlo.
                    </p>
                    {item.tipo === 'dx_sin_tto' ? (
                      <Link
                        href="/tratamientos"
                        className="shrink-0 flex items-center gap-1 font-sans text-[11px] font-medium text-amber-600 dark:text-amber-400 no-underline hover:opacity-70 transition-opacity"
                      >
                        <Plus size={10} /> Agregar tratamiento
                      </Link>
                    ) : (
                      <Link
                        href={`/ingreso?dx=${encodeURIComponent(item.tratamiento ?? '')}`}
                        className="shrink-0 flex items-center gap-1 font-sans text-[11px] font-medium text-amber-600 dark:text-amber-400 no-underline hover:opacity-70 transition-opacity"
                      >
                        <ArrowRight size={10} /> Agregar al historial
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
