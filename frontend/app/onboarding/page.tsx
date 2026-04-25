'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase'

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--c-border)' }}>
        <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} style={{ objectFit: 'contain' }} />
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: 32, height: 3, borderRadius: 999, background: s <= step ? 'var(--c-brand-teal)' : 'var(--c-border)' }} />
          ))}
        </div>
        <button onClick={skip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
          Saltar
        </button>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {step === 1 && (
          <div className="ce-fade" style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, letterSpacing: '-.025em', marginBottom: 8 }}>
              Bienvenido a Aliis
            </h1>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--c-text-muted)', marginBottom: 40 }}>
              Tu asistente para entender lo que el médico dijo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {PROMISES.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'var(--c-surface)', borderRadius: 12, textAlign: 'left' }}>
                  <span style={{ color: 'var(--c-brand-teal)', flexShrink: 0, display: 'flex' }}><Check size={18} /></span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)' }}>{p}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ padding: '14px 40px', borderRadius: 999, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="ce-fade" style={{ width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 8 }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32 }}>
              Aliis te llamará por tu nombre en las explicaciones.
            </p>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--c-border)', background: 'var(--c-surface)', fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--c-text)', outline: 'none', marginBottom: 24, boxSizing: 'border-box' }}
            />
            <button onClick={() => setStep(3)} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="ce-fade" style={{ width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-.02em', marginBottom: 8 }}>
              ¿Para quién es Aliis?
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text-muted)', marginBottom: 32 }}>
              Adaptamos el tono según para quién estás buscando explicaciones.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              {(['yo', 'familiar'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setWho(opt)}
                  style={{
                    flex: 1, padding: '20px 16px', borderRadius: 14,
                    border: `2px solid ${who === opt ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
                    background: who === opt ? 'rgba(31,138,155,.08)' : 'var(--c-surface)',
                    fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                    color: 'var(--c-text)', cursor: 'pointer',
                  }}
                >
                  {opt === 'yo' ? 'Para mí' : 'Para un familiar'}
                </button>
              ))}
            </div>
            <button
              onClick={finish}
              disabled={saving}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--c-brand-teal)', color: '#fff', border: 'none', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando…' : 'Empezar'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
