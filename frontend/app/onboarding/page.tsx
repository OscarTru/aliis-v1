'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TagInput } from '@/components/ui/TagInput'
import { saveMedicalProfile } from '@/app/actions/medical-profile'

const PROMISES = [
  'Tu diagnóstico en palabras que puedes entender',
  'Referencias científicas verificadas, no Wikipedia',
  'Preguntas listas para tu próxima consulta',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [who, setWho] = useState<'yo' | 'familiar' | null>(null)
  const [saving, setSaving] = useState(false)
  const [isPro, setIsPro] = useState(false)

  const [medProfile, setMedProfile] = useState({
    medicamentos: [] as string[],
    alergias: [] as string[],
    condiciones_previas: [] as string[],
    edad: '' as string,
    sexo: '' as string,
  })

  const totalSteps = isPro ? 4 : 3

  useEffect(() => {
    async function checkPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (data?.plan === 'pro') setIsPro(true)
    }
    checkPlan()
  }, [])

  async function skip() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id)
    }
    router.push('/ingreso')
  }

  async function finish() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          name: name || null,
          who: who || null,
          onboarding_done: true,
        }).eq('id', user.id)
      }
      router.push('/ingreso')
    } finally {
      setSaving(false)
    }
  }

  async function finishWithMedProfile() {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          name: name || null,
          who: who || null,
          onboarding_done: true,
        }).eq('id', user.id)
      }

      await saveMedicalProfile({
        medicamentos: medProfile.medicamentos,
        alergias: medProfile.alergias,
        condiciones_previas: medProfile.condiciones_previas,
        edad: medProfile.edad ? parseInt(medProfile.edad) : null,
        sexo: (medProfile.sexo as 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir') || null,
      })

      router.push('/ingreso')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} className="object-contain" />
        {/* Progress dots */}
        <div className="flex gap-[6px]">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={cn(
                'w-8 h-[3px] rounded-full',
                s <= step ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
        <button
          onClick={skip}
          className="bg-transparent border-none cursor-pointer font-sans text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Saltar
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-[480px] mx-auto w-full">
        {step === 1 && (
          <div className="ce-fade text-center w-full">
            <h1 className="font-serif text-[36px] tracking-[-0.025em] mb-2">
              Bienvenido a Aliis
            </h1>
            <p className="font-serif italic text-muted-foreground mb-10">
              Tu asistente para entender lo que el médico dijo
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {PROMISES.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-[18px] py-[14px] bg-muted rounded-[12px] text-left">
                  <span className="text-primary shrink-0 flex"><Check size={18} /></span>
                  <span className="font-sans text-[15px] text-foreground">{p}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              className="px-10 py-[14px] h-auto rounded-full bg-primary text-white border-none font-sans text-[15px] font-medium hover:bg-primary/90"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="ce-fade w-full">
            <h2 className="font-serif text-[28px] tracking-[-0.02em] mb-2">
              ¿Cómo te llamas?
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-8">
              Aliis te llamará por tu nombre en las explicaciones.
            </p>
            <Input
              type="text"
              aria-label="Tu nombre"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-[12px] border-border bg-muted font-sans text-[16px] mb-6 focus-visible:ring-primary/20"
            />
            <Button
              onClick={() => setStep(3)}
              className="w-full h-12 rounded-[12px] bg-primary text-white border-none font-sans text-[15px] font-medium hover:bg-primary/90"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="ce-fade w-full">
            <h2 className="font-serif text-[28px] tracking-[-0.02em] mb-2">
              ¿Para quién es Aliis?
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-8">
              Adaptamos el tono según para quién estás buscando explicaciones.
            </p>
            <div className="flex gap-3 mb-8">
              {(['yo', 'familiar'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWho(opt)}
                  className={cn(
                    'flex-1 px-4 py-5 rounded-[14px] border-2 font-sans text-[15px] font-medium text-foreground cursor-pointer transition-[border-color,background] duration-150',
                    who === opt
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted hover:border-primary/40'
                  )}
                >
                  {opt === 'yo' ? 'Para mí' : 'Para un familiar'}
                </button>
              ))}
            </div>
            <Button
              onClick={isPro ? () => setStep(4) : finish}
              disabled={saving}
              className="w-full h-12 rounded-[12px] bg-primary text-white border-none font-sans text-[15px] font-medium hover:bg-primary/90 disabled:opacity-70"
            >
              {saving ? 'Guardando…' : isPro ? 'Continuar' : 'Empezar'}
            </Button>
          </div>
        )}

        {step === 4 && isPro && (
          <div className="ce-fade w-full">
            <h2 className="font-serif text-[28px] tracking-[-0.02em] mb-2">
              Tu perfil médico
            </h2>
            <p className="font-sans text-[15px] text-muted-foreground mb-6">
              Aliis personaliza las explicaciones con tu contexto real.
              Puedes editarlo después en Cuenta.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Tu edad"
                  value={medProfile.edad}
                  min={1}
                  max={149}
                  onChange={e => setMedProfile(p => ({ ...p, edad: e.target.value }))}
                  className="h-11 flex-1 rounded-xl border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                />
                <select
                  value={medProfile.sexo}
                  onChange={e => setMedProfile(p => ({ ...p, sexo: e.target.value }))}
                  className="h-11 flex-1 rounded-xl border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50 text-foreground"
                >
                  <option value="">Sexo biológico</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>

              <TagInput
                label="Condiciones previas"
                placeholder="Ej: diabetes tipo 2, hipertensión..."
                value={medProfile.condiciones_previas}
                onChange={v => setMedProfile(p => ({ ...p, condiciones_previas: v }))}
              />
              <TagInput
                label="Medicamentos actuales"
                placeholder="Ej: metformina 850mg..."
                value={medProfile.medicamentos}
                onChange={v => setMedProfile(p => ({ ...p, medicamentos: v }))}
              />
              <TagInput
                label="Alergias conocidas"
                placeholder="Ej: penicilina..."
                value={medProfile.alergias}
                onChange={v => setMedProfile(p => ({ ...p, alergias: v }))}
              />
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={finishWithMedProfile}
                disabled={saving}
                className="w-full h-12 rounded-[12px] bg-primary text-white border-none font-sans text-[15px] font-medium hover:bg-primary/90 disabled:opacity-70"
              >
                {saving ? 'Guardando…' : 'Empezar'}
              </Button>
              <button
                type="button"
                onClick={finish}
                disabled={saving}
                className="font-sans text-[13px] text-muted-foreground hover:text-foreground transition-colors self-center bg-transparent border-none cursor-pointer"
              >
                Completar después →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
