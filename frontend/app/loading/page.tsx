'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Loader } from 'lucide-react'
import { ScribbleBrain } from '@/components/ui/ScribbleBrain'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <div className="ce-pulse">
        <ScribbleBrain size={80} />
      </div>

      <div className="text-center">
        <Eyebrow>· Destilando ·</Eyebrow>
        <h1 className="font-serif text-[28px] tracking-[-0.02em] mt-3 min-h-[40px] transition-opacity duration-300">
          {STAGES[stageIdx]}
        </h1>
      </div>

      <div className="flex flex-col gap-[10px] w-full max-w-[320px]">
        {STAGES.map((stage, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 font-sans text-[14px]',
              i < stageIdx
                ? 'text-[color:var(--c-brand-teal)]'
                : i === stageIdx
                ? 'text-foreground'
                : 'text-[color:var(--c-text-faint)]'
            )}
          >
            <span className="w-5 text-center shrink-0 inline-flex items-center justify-center">
              {i < stageIdx ? <Check size={14} /> : i === stageIdx ? <Loader size={14} /> : '○'}
            </span>
            {stage}
          </div>
        ))}
      </div>

      {process.env.NODE_ENV === 'development' && packId && (
        <button
          onClick={() => router.push(`/pack/${packId}`)}
          className="bg-transparent border border-border rounded-[8px] px-4 py-2 cursor-pointer font-sans text-[13px] text-muted-foreground hover:text-foreground transition-colors"
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
