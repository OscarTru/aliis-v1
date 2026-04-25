'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-background border border-border rounded-3xl p-12 max-w-[400px] w-full shadow-[0_32px_80px_rgba(0,0,0,0.10)] ce-fade">
        <div className="text-center mb-8">
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} className="object-contain mx-auto mb-4" />
          <p className="font-serif italic text-[17px] text-muted-foreground">
            {done ? 'Contraseña actualizada' : 'Elige una nueva contraseña'}
          </p>
        </div>

        {done ? (
          <div className="text-center">
            <p className="font-sans text-[15px] text-foreground leading-relaxed mb-7">
              Tu contraseña fue actualizada correctamente. Ya puedes entrar a tu cuenta.
            </p>
            <Button
              onClick={() => router.push('/historial')}
              className="px-8 py-3 rounded-xl bg-[#0F1923] text-white font-sans font-medium hover:bg-[#0F1923]/90 shadow-[var(--c-btn-primary-shadow)]"
            >
              Ir a mis explicaciones
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-xl border-[1.5px] focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] bg-muted font-sans text-[15px]"
            />
            <Input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="h-12 rounded-xl border-[1.5px] focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px] bg-muted font-sans text-[15px]"
            />
            {error && <p className="text-destructive font-sans text-[13px] m-0">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 mt-1 rounded-xl bg-[#0F1923] text-white font-sans font-medium hover:bg-[#0F1923]/90 shadow-[var(--c-btn-primary-shadow)] disabled:opacity-70"
            >
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
