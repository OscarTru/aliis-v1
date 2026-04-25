'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '@/components/AppNav'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { MOCK_PACKS, type MockChapter } from '@/lib/mock-data'

export default function PackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const pack = MOCK_PACKS.find((p) => p.id === id)

  const [activeChapterId, setActiveChapterId] = useState<string>(pack?.chapters[0]?.id ?? '')
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())

  if (!pack) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 16 }}>Pack no encontrado</div>
          <button onClick={() => router.push('/dashboard')}
            style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-brand-teal)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Volver al historial
          </button>
        </div>
      </div>
    )
  }

  const activeChapter = pack.chapters.find((c) => c.id === activeChapterId) ?? pack.chapters[0]
  const activeIndex = pack.chapters.findIndex((c) => c.id === activeChapterId)

  function openChapter(chapter: MockChapter) {
    setActiveChapterId(chapter.id)
    setReadChapters((prev) => new Set([...prev, chapter.id]))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalRead = readChapters.size

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      <AppNav />

      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '48px 24px 100px', display: 'flex', gap: 48, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, position: 'sticky', top: 80 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Mis explicaciones
          </button>

          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.2, letterSpacing: '-.015em', marginBottom: 8 }}>
            {pack.dx}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 24 }}>
            {totalRead}/{pack.chapters.length} leídos
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 28 }}>
            {pack.chapters.map((c) => (
              <div key={c.id} style={{ flex: 1, height: 3, borderRadius: 2, background: readChapters.has(c.id) ? 'var(--c-brand-teal)' : 'var(--c-border)' }} />
            ))}
          </div>

          {/* Chapter list */}
          <nav>
            {pack.chapters.map((chapter) => {
              const isActive = chapter.id === activeChapterId
              const isRead = readChapters.has(chapter.id)
              return (
                <button key={chapter.id} onClick={() => openChapter(chapter)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '10px 12px',
                    background: isActive ? 'var(--c-surface)' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? 'var(--c-brand-teal)' : 'transparent'}`,
                    borderRadius: '0 8px 8px 0',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 2,
                    transition: 'background .15s',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.18em', color: isActive ? 'var(--c-brand-teal)' : 'var(--c-text-faint)', flexShrink: 0, width: 20 }}>
                    {chapter.number}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)', lineHeight: 1.35, flex: 1 }}>
                    {chapter.title}
                  </span>
                  {isRead && !isActive && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="2.5" aria-hidden>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow style={{ marginBottom: 20 }}>Capítulo {activeChapter.number}</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 10px' }}>
            {activeChapter.title}
          </h1>
          <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--c-text-muted)', marginBottom: 48 }}>
            {activeChapter.subtitle}
          </div>

          {/* Body */}
          <div>
            {activeChapter.body.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.8, color: 'var(--c-text)', margin: '0 0 20px' }}>
                {para}
              </p>
            ))}
          </div>

          {/* References */}
          {activeChapter.references.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-subtle)', marginBottom: 16 }}>
                Referencias
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeChapter.references.map((ref) => (
                  <a key={ref.id} href={ref.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: 'var(--c-surface)',
                      border: '1px solid var(--c-border)',
                      borderRadius: 10,
                      textDecoration: 'none',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      color: 'var(--c-text-muted)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--c-brand-teal)" strokeWidth="2" aria-hidden style={{ flexShrink: 0 }}>
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                    {ref.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next navigation */}
          <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            {activeIndex > 0 ? (
              <button onClick={() => openChapter(pack.chapters[activeIndex - 1])}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid var(--c-border)', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
                {pack.chapters[activeIndex - 1].title}
              </button>
            ) : <div />}

            {activeIndex < pack.chapters.length - 1 && (
              <button onClick={() => openChapter(pack.chapters[activeIndex + 1])}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--c-invert)', border: '1px solid var(--c-invert)', borderRadius: 999, padding: '10px 18px', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-invert-fg)', marginLeft: 'auto' }}>
                {pack.chapters[activeIndex + 1].title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
