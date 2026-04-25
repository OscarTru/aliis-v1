'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: 10,
      background: tone === 'red' ? 'rgba(220,38,38,.08)' : 'rgba(245,158,11,.08)',
      borderLeft: `3px solid ${tone === 'red' ? '#dc2626' : '#f59e0b'}`,
      marginBottom: 8,
    }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: tone === 'red' ? '#dc2626' : '#b45309', marginBottom: 2 }}>{t}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)' }}>{d}</div>
    </div>
  )
}

function ChapterBlock({
  chapter,
  packId,
  userId,
}: {
  chapter: Chapter
  packId: string
  userId?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markedRef = useRef(false)

  useEffect(() => {
    if (!userId || markedRef.current) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !markedRef.current) {
          timerRef.current = setTimeout(async () => {
            markedRef.current = true
            const supabase = createClient()
            await supabase.from('chapter_reads').upsert({
              pack_id: packId,
              user_id: userId,
              chapter_id: chapter.id,
            })
          }, 10000)
        } else {
          if (timerRef.current) clearTimeout(timerRef.current)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [chapter.id, packId, userId])

  return (
    <div ref={ref} id={chapter.id} style={{ paddingTop: 48, paddingBottom: 48, borderBottom: '1px solid var(--c-border)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 8 }}>
        {chapter.n} · {chapter.readTime}
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-.02em', marginBottom: 6, lineHeight: 1.15 }}>
        {chapter.kicker} <em>{chapter.kickerItalic}</em>
      </h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--c-text-muted)', fontSize: 16, marginBottom: 28 }}>
        {chapter.tldr}
      </p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.75, color: 'var(--c-text)', marginBottom: 20 }}>{p}</p>
      ))}

      {chapter.callout && (
        <div style={{ margin: '24px 0', padding: '20px 24px', background: 'rgba(31,138,155,.06)', border: '1px solid rgba(31,138,155,.18)', borderRadius: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal-deep)', marginBottom: 8 }}>
            {chapter.callout.label}
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.6, color: 'var(--c-text)', margin: 0 }}>
            {chapter.callout.body}
          </p>
        </div>
      )}

      {chapter.timeline && (
        <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chapter.timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-brand-teal)', minWidth: 120, paddingTop: 3 }}>{item.w}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.5 }}>{item.t}</div>
            </div>
          ))}
        </div>
      )}

      {chapter.questions && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chapter.questions.map((q, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: 'var(--c-surface)', borderRadius: 10 }}>
              <span style={{ color: 'var(--c-brand-teal)', fontWeight: 600, flexShrink: 0 }}>?</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)' }}>{q}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.alarms?.map((a, i) => <AlarmBadge key={i} {...a} />)}

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--c-surface-2)', borderRadius: 8, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--c-text-faint)', fontStyle: 'italic' }}>
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>
    </div>
  )
}

export function PackView({
  pack,
  userId,
  isPublic,
}: {
  pack: Pack
  userId?: string
  isPublic?: boolean
}) {
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Header */}
      <div style={{ paddingTop: 48, paddingBottom: 32, borderBottom: '1px solid var(--c-border)' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, letterSpacing: '-.025em', marginBottom: 12, lineHeight: 1.1 }}>
          {pack.dx}
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
          {pack.summary}
        </p>
        {!isPublic && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link
              href={`/compartir/${pack.id}`}
              style={{ padding: '9px 20px', borderRadius: 999, border: '1px solid var(--c-border)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', textDecoration: 'none' }}
            >
              Compartir
            </Link>
            <Link
              href="/historial"
              style={{ padding: '9px 20px', borderRadius: 999, border: '1px solid var(--c-border)', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', textDecoration: 'none' }}
            >
              Mis explicaciones
            </Link>
          </div>
        )}
      </div>

      {/* Chapters */}
      {pack.chapters.map((ch) => (
        <ChapterBlock key={ch.id} chapter={ch} packId={pack.id} userId={userId} />
      ))}

      {/* References */}
      {verifiedRefs.length > 0 && (
        <div style={{ paddingTop: 48 }}>
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 20 }}>
            Referencias verificadas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {verifiedRefs.map((ref) => (
              <div key={ref.id} style={{ padding: '16px', background: 'var(--c-surface)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {ref.authors} ({ref.year}). {ref.journal}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 8 }}>
                  {ref.quote}
                </div>
                <a
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-brand-teal)', textDecoration: 'none' }}
                >
                  doi:{ref.doi}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
