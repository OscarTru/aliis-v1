'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'

const STAGES = [
  'Analizando tu diagnóstico…',
  'Destilando la información…',
  'Verificando referencias científicas…',
  'Preparando tus preguntas para el médico…',
  'Casi listo…',
]

function LoadingContent() {
  const router = useRouter()
  const params = useSearchParams()
  const packId = params.get('packId')
  const [stageIdx, setStageIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!packId) return
    const supabase = createClient()
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('packs')
        .select('id')
        .eq('id', packId)
        .single()
      if (data) {
        clearInterval(poll)
        router.push(`/pack/${packId}`)
      }
    }, 2000)
    return () => clearInterval(poll)
  }, [packId, router])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 32,
    }}>
      <div className="ce-pulse">
        <ScribbleBrain size={80} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <Eyebrow>· Destilando ·</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 28,
          letterSpacing: '-.02em',
          marginTop: 12,
          minHeight: 40,
          transition: 'opacity 0.3s',
        }}>
          {STAGES[stageIdx]}
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 320 }}>
        {STAGES.map((stage, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: i < stageIdx
                ? 'var(--c-brand-teal)'
                : i === stageIdx
                ? 'var(--c-text)'
                : 'var(--c-text-faint)',
            }}
          >
            <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
              {i < stageIdx ? '✓' : i === stageIdx ? '⟳' : '○'}
            </span>
            {stage}
          </div>
        ))}
      </div>

      {process.env.NODE_ENV === 'development' && packId && (
        <button
          onClick={() => router.push(`/pack/${packId}`)}
          style={{
            background: 'none',
            border: '1px solid var(--c-border)',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--c-text-muted)',
          }}
        >
          Saltar (demo)
        </button>
      )}
    </main>
  )
}

export default function LoadingPage() {
  return (
    <Suspense>
      <LoadingContent />
    </Suspense>
  )
}
