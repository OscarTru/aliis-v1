'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { TagInput } from '@/components/ui/TagInput'
import { saveMedicalProfile } from '@/app/actions/medical-profile'
import type { MedicalProfile, Profile } from '@/lib/types'

interface MedicalProfileSectionProps {
  initialMedicalProfile: MedicalProfile | null
  condiciones: string[]
  medicamentos: string[]
  userPlan: Profile['plan']
}

interface AddConditionModalProps {
  onClose: () => void
  onSoloAgregar: (condicion: string) => void
}

function AddConditionModal({ onClose, onSoloAgregar }: AddConditionModalProps) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleCrearExplicacion() {
    const condicion = value.trim()
    if (!condicion) return
    router.push('/ingreso?dx=' + encodeURIComponent(condicion))
    onClose()
  }

  function handleSoloAgregar() {
    const condicion = value.trim()
    if (!condicion) return
    onSoloAgregar(condicion)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[360px] bg-background border border-border rounded-2xl shadow-lg p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans text-[14px] font-medium text-foreground">Agregar condición</span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la condición"
          className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 font-sans text-[14px] outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50 mb-4"
        />

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCrearExplicacion}
            disabled={!value.trim()}
            className="w-full px-4 py-2.5 rounded-full bg-foreground text-background font-sans text-[13px] font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity"
          >
            Crear explicación →
          </button>
          <button
            type="button"
            onClick={handleSoloAgregar}
            disabled={!value.trim()}
            className="w-full px-4 py-2.5 rounded-full border border-border text-foreground font-sans text-[13px] font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-opacity hover:bg-muted"
          >
            Solo agregar
          </button>
        </div>
      </motion.div>
    </>
  )
}

interface ProfileRow {
  label: string
  items: string[]
  onAddCondition?: () => void
}

function ReadRow({ label, items, onAddCondition }: ProfileRow) {
  return (
    <div className="px-5 py-4">
      <div className="font-sans text-[12px] text-muted-foreground/60 mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {items.map(item => (
          <span key={item} className="px-2.5 py-1 rounded-full bg-muted font-sans text-[12px] text-foreground">
            {item}
          </span>
        ))}
        {items.length === 0 && onAddCondition && (
          <>
            <span className="font-serif italic text-[13px] text-muted-foreground/60">Aún no tienes diagnósticos</span>
            <button
              type="button"
              onClick={onAddCondition}
              className="ml-1 flex items-center gap-0.5 font-sans text-[12px] text-primary hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
            >
              <Plus size={12} />
              Agregar condición
            </button>
          </>
        )}
        {items.length === 0 && !onAddCondition && (
          <span className="font-serif italic text-[13px] text-muted-foreground/60">Ninguna registrada</span>
        )}
      </div>
    </div>
  )
}

const SEXO_OPTIONS: { value: MedicalProfile['sexo']; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
]

export function MedicalProfileSection({ initialMedicalProfile, condiciones, medicamentos }: MedicalProfileSectionProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddCondition, setShowAddCondition] = useState(false)

  // Only alergias are manually editable — condiciones come from packs, medicamentos from treatments
  const [alergias, setAlergias] = useState<string[]>(initialMedicalProfile?.alergias ?? [])
  const edad = initialMedicalProfile?.edad
  const sexo = initialMedicalProfile?.sexo

  async function handleSave() {
    setSaving(true)
    try {
      await saveMedicalProfile({ alergias })
      setEditing(false)
    } catch (err) {
      console.error('Error al guardar perfil médico:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setAlergias(initialMedicalProfile?.alergias ?? [])
    setEditing(false)
  }

  function handleSoloAgregar(condicion: string) {
    // Condiciones come from packs — no local state to update.
    // Just send a notification prompting the user to create an explanation.
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Condición agregada',
        body: 'Agregué ' + condicion + ' a tu historial. Cuando quieras, puedo explicártela con detalle.',
        type: 'reminder',
        url: '/ingreso?dx=' + encodeURIComponent(condicion),
      }),
    }).catch(() => {})
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/60">
          Historial médico
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 font-sans text-[12px] text-muted-foreground hover:text-foreground transition-colors border-none bg-transparent cursor-pointer"
          >
            <Pencil size={12} /> Modificar
          </button>
        )}
      </div>

      <div className="bg-background border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {/* Condiciones previas — siempre read-only, vienen de los packs */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-sans text-[12px] text-muted-foreground/60">Diagnósticos</div>
            <button
              type="button"
              onClick={() => setShowAddCondition(true)}
              className="flex items-center gap-0.5 font-sans text-[11px] text-primary hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none"
            >
              <Plus size={11} /> Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {condiciones.length > 0
              ? condiciones.map(item => (
                  <span key={item} className="px-2.5 py-1 rounded-full bg-muted font-sans text-[12px] text-foreground">{item}</span>
                ))
              : <span className="font-serif italic text-[13px] text-muted-foreground/60">Sin diagnósticos aún</span>
            }
          </div>
        </div>

        {/* Medicamentos — read-only, vienen de /tratamientos */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-sans text-[12px] text-muted-foreground/60">Medicamentos</div>
            <a href="/tratamientos" className="font-sans text-[11px] text-primary hover:opacity-70 transition-opacity no-underline">
              Gestionar →
            </a>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {medicamentos.length > 0
              ? medicamentos.map(item => (
                  <span key={item} className="px-2.5 py-1 rounded-full bg-muted font-sans text-[12px] text-foreground">{item}</span>
                ))
              : <span className="font-serif italic text-[13px] text-muted-foreground/60">Aún no tienes medicamentos</span>
            }
          </div>
        </div>

        {/* Alergias — editable */}
        {!editing ? (
          <ReadRow label="Alergias" items={alergias} />
        ) : (
          <div className="px-5 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[13px] font-medium text-foreground">Editar alergias</span>
              <button type="button" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground transition-colors border-none bg-transparent cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <TagInput
              label="Alergias conocidas"
              placeholder="Penicilina, ibuprofeno…"
              value={alergias}
              onChange={setAlergias}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2.5 rounded-full bg-foreground text-background font-sans text-[13px] font-medium disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-opacity"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        )}

        {/* Edad y sexo — solo lectura, vienen de onboarding */}
        {(edad || sexo) && (
          <div className="px-5 py-4">
            <div className="font-sans text-[12px] text-muted-foreground/60 mb-2">Datos personales</div>
            <div className="flex flex-wrap gap-1.5">
              {edad && (
                <span className="px-2.5 py-1 rounded-full bg-muted font-sans text-[12px] text-foreground">{edad} años</span>
              )}
              {sexo && (
                <span className="px-2.5 py-1 rounded-full bg-muted font-sans text-[12px] text-foreground">
                  {SEXO_OPTIONS.find(o => o.value === sexo)?.label ?? sexo}
                </span>
              )}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/40 mt-2">Actualiza estos datos en tu cuenta</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddCondition && (
          <AddConditionModal
            onClose={() => setShowAddCondition(false)}
            onSoloAgregar={handleSoloAgregar}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
