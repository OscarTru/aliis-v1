'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  function inputStyle(field: string): React.CSSProperties {
    const focused = focusedField === field
    return {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1.5px solid ${focused ? 'var(--c-brand-teal)' : 'var(--c-border)'}`,
      background: focused ? 'rgba(31,138,155,0.04)' : 'var(--c-surface)',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      color: 'var(--c-text)',
      outline: 'none',
      transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
      boxShadow: focused ? '0 0 0 3px rgba(31,138,155,0.12)' : 'none',
      boxSizing: 'border-box',
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }

    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateErr) { setError(updateErr.message); return }
    setDone(true)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--c-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--c-bg)',
        border: '1px solid var(--c-border)',
        borderRadius: 24,
        padding: '48px 40px 40px',
        maxWidth: 400,
        width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.10)',
        animation: 'ce-fade-in 0.2s ease forwards',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image
            src="/assets/aliis-original.png"
            alt="Aliis"
            width={72}
            height={28}
            style={{ objectFit: 'contain', marginBottom: 16 }}
          />
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--c-text-muted)' }}>
            {done ? 'Contraseña actualizada' : 'Elige una nueva contraseña'}
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.6, marginBottom: 28 }}>
              Tu contraseña fue actualizada correctamente. Ya puedes entrar a tu cuenta.
            </p>
            <button
              onClick={() => router.push('/historial')}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none',
                background: '#0F1923', color: '#fff',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, cursor: 'pointer',
                boxShadow: 'var(--c-btn-primary-shadow)',
              }}
            >
              Ir a mis explicaciones
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              minLength={6}
              style={inputStyle('password')}
            />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              required
              style={inputStyle('confirm')}
            />
            {error && (
              <p style={{ color: '#dc2626', fontFamily: 'var(--font-sans)', fontSize: 13, margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 20px', borderRadius: 12, border: 'none',
                background: '#0F1923', color: '#fff',
                fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
                boxShadow: 'var(--c-btn-primary-shadow)',
              }}
            >
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
