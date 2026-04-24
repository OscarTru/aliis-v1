'use client'

import { useState, useRef } from 'react'
import type { DiagnosticoResponse } from './api/diagnostico/route'

const EJEMPLOS = ['Migraña', 'Vértigo', 'Epilepsia', 'Temblor esencial', 'Insomnio']

function BrainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-400">
      <path
        d="M12 3C9.5 3 7.5 4.5 7 6.5C5.5 6.5 4 7.8 4 9.5C4 10.5 4.5 11.4 5.2 12C4.5 12.6 4 13.5 4 14.5C4 16.2 5.5 17.5 7 17.5C7.5 19.5 9.5 21 12 21C14.5 21 16.5 19.5 17 17.5C18.5 17.5 20 16.2 20 14.5C20 13.5 19.5 12.6 18.8 12C19.5 11.4 20 10.5 20 9.5C20 7.8 18.5 6.5 17 6.5C16.5 4.5 14.5 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 3V21M7 6.5C8 8 9 9.5 12 10M17 6.5C16 8 15 9.5 12 10M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="h-5 w-40 shimmer rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-full shimmer rounded" />
        <div className="h-4 w-5/6 shimmer rounded" />
        <div className="h-4 w-4/6 shimmer rounded" />
      </div>
    </div>
  )
}

interface SectionCardProps {
  icon?: string
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
}

function SectionCard({ icon, title, children, className = '', delay = 0 }: SectionCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up delay-${delay} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function Home() {
  const [diagnostico, setDiagnostico] = useState('')
  const [contexto, setContexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<DiagnosticoResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const resultadoRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!diagnostico.trim() || loading) return

    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnostico, contexto }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error inesperado')
        return
      }

      setResultado(data)
      setTimeout(() => {
        resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResultado(null)
    setError(null)
    setDiagnostico('')
    setContexto('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Navbar */}
      <nav className="bg-[#0f0f1a] border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainIcon />
            <span className="font-bold text-purple-400">Cerebros Esponjosos</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800/60 text-gray-400 border border-white/10">
            Beta
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6">
        {/* Hero */}
        <div className="pt-14 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Información validada · En lenguaje humano
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Entiende tu{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
              diagnóstico
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-base leading-relaxed">
            Tu médico usó términos que no quedaron del todo claros. Escríbelos aquí y te los
            explicamos en lenguaje humano — con evidencia real detrás.
          </p>
        </div>

        {/* Formulario */}
        {!resultado && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                ¿Cuál es tu diagnóstico?
              </label>
              <textarea
                rows={3}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ej: Migraña con aura, Neuropatía periférica diabética, Epilepsia focal..."
                maxLength={500}
                disabled={loading}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS.map((ejemplo) => (
                <button
                  key={ejemplo}
                  type="button"
                  onClick={() => setDiagnostico(ejemplo)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {ejemplo}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Contexto adicional{' '}
                <span className="text-gray-600">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Edad, síntomas que tienes, medicación que te recetaron..."
                maxLength={300}
                disabled={loading}
                className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!diagnostico.trim() || loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analizando...
                </span>
              ) : (
                'Entender mi diagnóstico →'
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </form>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-4 mb-8">
            <p className="text-purple-300 text-sm text-center animate-pulse">
              Analizando tu diagnóstico...
            </p>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Resultados */}
        {resultado && (
          <div ref={resultadoRef} className="space-y-4 mb-12">
            {/* Card 0: Confirmación */}
            <div className="rounded-2xl p-6 bg-purple-900/40 border border-purple-500/20 animate-fade-in-up delay-1">
              <p className="text-xs text-purple-300 mb-1 uppercase tracking-wide font-medium">
                Diagnóstico recibido
              </p>
              <p className="text-white font-semibold text-lg">
                {resultado.diagnostico_recibido}
              </p>
            </div>

            {/* Card 1: Qué es */}
            <SectionCard icon="🔍" title="¿Qué es esto, exactamente?" className="bg-white" delay={2}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.que_es}
              </p>
            </SectionCard>

            {/* Card 2: Cómo funciona */}
            <SectionCard icon="⚙️" title="¿Cómo funciona por dentro?" className="bg-white" delay={3}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.como_funciona}
              </p>
            </SectionCard>

            {/* Card 3: Qué esperar */}
            <SectionCard icon="📅" title="¿Qué puedes esperar?" className="bg-white" delay={4}>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {resultado.que_esperar}
              </p>
            </SectionCard>

            {/* Card 4: Preguntas para el médico */}
            <SectionCard icon="💬" title="Preguntas para tu próxima consulta" className="bg-white" delay={5}>
              <ol className="space-y-2">
                {resultado.preguntas_para_medico.map((pregunta, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {pregunta}
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* Card 5: Señales de alarma */}
            <SectionCard
              icon="🚨"
              title="Cuándo buscar atención urgente"
              className="bg-white border-red-100"
              delay={6}
            >
              <ul className="space-y-2">
                {resultado.senales_de_alarma.map((senal, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-red-500 mt-0.5">·</span>
                    {senal}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Card 6: Mito frecuente */}
            <SectionCard icon="💡" title="Algo que mucha gente malentiende" className="bg-white" delay={7}>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {resultado.mito_frecuente}
                </p>
              </div>
            </SectionCard>

            {/* Card 7: Nota final */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/10 animate-fade-in-up delay-8">
              <p className="text-purple-200 text-sm leading-relaxed italic">
                {resultado.nota_final}
              </p>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-gray-600 text-xs pb-2">
              Esta información es educativa y no reemplaza tu consulta médica.
            </p>

            {/* Botón reset */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-colors"
            >
              ← Consultar otro diagnóstico
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
