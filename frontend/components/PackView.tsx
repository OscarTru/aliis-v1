'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Settings2, CalendarDays, MessageCircle, AlertTriangle, BookMarked, Share2, HelpCircle, LayoutList, Plus } from 'lucide-react'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChapterChat } from '@/components/ChapterChat'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  const isRed = tone === 'red'
  const accent = isRed ? '#c0392b' : '#a16207'
  const bg = isRed ? 'rgba(192,57,43,.05)' : 'rgba(161,98,7,.05)'
  const border = isRed ? 'rgba(192,57,43,.2)' : 'rgba(161,98,7,.2)'
  return (
    <div style={{
      padding: '18px 22px',
      borderRadius: 14,
      background: bg,
      border: `1px solid ${border}`,
      marginBottom: 10,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>
        {isRed ? '— urgente' : '— consulta pronto'}
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, letterSpacing: '-.01em', color: 'var(--c-text)', marginBottom: 6, lineHeight: 1.3 }}>{t}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>{d}</div>
    </div>
  )
}

function ChapterCard({
  chapter,
  packId,
  userId,
  dx,
  onRead,
}: {
  chapter: Chapter
  packId: string
  userId?: string
  dx: string
  onRead?: (chapterId: string) => void
}) {
  const markedRef = useRef(false)

  useEffect(() => {
    if (!userId || markedRef.current) return
    const timer = setTimeout(async () => {
      markedRef.current = true
      onRead?.(chapter.id)
      const supabase = createClient()
      await supabase.from('chapter_reads').upsert({
        pack_id: packId,
        user_id: userId,
        chapter_id: chapter.id,
      })
    }, 10000)
    return () => clearTimeout(timer)
  }, [chapter.id, packId, userId, onRead])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '40px 48px 80px' }}>
      {/* kicker */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 10 }}>
        {chapter.n} · {chapter.readTime}
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', letterSpacing: '-.022em', lineHeight: 1.12, marginBottom: 10 }}>
        {chapter.kicker} <em style={{ color: 'var(--c-text-muted)' }}>{chapter.kickerItalic}</em>
      </h2>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--c-text-muted)', fontSize: 16, marginBottom: 32, lineHeight: 1.55 }}>
        {chapter.tldr}
      </p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.8, color: 'var(--c-text)', marginBottom: 20 }}>{p}</p>
      ))}

      {chapter.callout && (
        <div style={{ margin: '28px 0', padding: '20px 24px', background: 'rgba(31,138,155,.06)', border: '1px solid rgba(31,138,155,.18)', borderRadius: 14 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-brand-teal)', marginBottom: 10 }}>
            {chapter.callout.label}
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.6, color: 'var(--c-text)', margin: 0 }}>
            {chapter.callout.body}
          </p>
        </div>
      )}

      {chapter.timeline && (
        <div style={{ margin: '28px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {chapter.timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: 20, borderLeft: '2px solid var(--c-border)', paddingLeft: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, borderRadius: 999, background: 'var(--c-brand-teal)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-brand-teal)', marginBottom: 4 }}>{item.w}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.55 }}>{item.t}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapter.questions && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {chapter.questions.map((q, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px', background: 'var(--c-surface)', borderRadius: 12 }}>
              <span style={{ color: 'var(--c-brand-teal)', flexShrink: 0, display: 'flex', paddingTop: 2 }}><HelpCircle size={16} /></span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--c-text)', lineHeight: 1.5 }}>{q}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.alarms && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chapter.alarms.map((a, i) => <AlarmBadge key={i} {...a} />)}
        </div>
      )}

      <div style={{ marginTop: 32, padding: '12px 16px', background: 'var(--c-surface)', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--c-text-faint)', fontStyle: 'italic' }}>
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>

      <ChapterChat
        dx={dx}
        chapterTitle={`${chapter.kicker} ${chapter.kickerItalic}`}
        chapterContent={[
          chapter.tldr,
          ...(chapter.paragraphs ?? []),
          chapter.callout?.body ?? '',
          ...(chapter.timeline?.map((t) => `${t.w}: ${t.t}`) ?? []),
          ...(chapter.questions ?? []),
          ...(chapter.alarms?.map((a) => `${a.t}: ${a.d}`) ?? []),
        ].filter(Boolean).join('\n\n')}
      />
    </div>
  )
}

const NAV_ICON_MAP: Record<string, React.ReactNode> = {
  'que-es': <BookOpen size={16} />,
  'como-funciona': <Settings2 size={16} />,
  'que-esperar': <CalendarDays size={16} />,
  'preguntas': <MessageCircle size={16} />,
  'senales': <AlertTriangle size={16} />,
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
  const [activeIdx, setActiveIdx] = useState(0)
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)
  const chapter = pack.chapters[activeIdx]
  const isLast = activeIdx === pack.chapters.length - 1

  function markRead(chapterId: string) {
    setReadChapters((prev) => new Set([...prev, chapterId]))
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid var(--c-border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '20px 12px 16px',
        background: 'var(--c-bg)',
      }}>
        {/* Logo — idéntico al AppShell */}
        <Link href="/historial" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '0 6px', marginBottom: 20 }}>
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} style={{ objectFit: 'contain' }} />
        </Link>

        {/* App nav */}
        {!isPublic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16 }}>
            {[
              { href: '/ingreso', label: 'Nuevo pack', icon: <Plus size={15} /> },
              { href: '/historial', label: 'Mis explicaciones', icon: <LayoutList size={15} /> },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>
                <span style={{ display: 'flex', color: 'var(--c-text-faint)' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Divider + pack label */}
        <div style={{ padding: '12px 10px 8px', borderTop: '1px solid var(--c-border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 6 }}>
            Esta explicación
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, letterSpacing: '-.01em', lineHeight: 1.35, color: 'var(--c-text)' }}>
            {pack.dx}
          </div>
        </div>

        {/* Chapter nav */}
        <nav style={{ padding: '6px 0', flex: 1 }}>
          {pack.chapters.map((ch, i) => {
            const isActive = i === activeIdx
            const isRead = readChapters.has(ch.id)
            return (
              <button
                key={ch.id}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 10px',
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(31,138,155,.1)' : 'transparent',
                  marginBottom: 1, display: 'flex', alignItems: 'center', gap: 9,
                  transition: 'background .12s',
                }}
              >
                <span style={{ flexShrink: 0, display: 'inline-flex', color: isActive ? 'var(--c-brand-teal)' : 'var(--c-text-faint)' }}>{NAV_ICON_MAP[ch.id] ?? '•'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? 'var(--c-brand-teal)' : 'var(--c-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    {ch.kicker}
                  </div>
                  {ch.kickerItalic && (
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: isActive ? 'var(--c-brand-teal)' : 'var(--c-text-faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.8 }}>
                      {ch.kickerItalic}
                    </div>
                  )}
                </div>
                {isRead && !isActive && (
                  <div style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--c-brand-teal)', flexShrink: 0 }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* References + actions */}
        <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {verifiedRefs.length > 0 && (
            <button
              onClick={() => setActiveIdx(pack.chapters.length)}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 10px',
                borderRadius: 9, border: 'none', cursor: 'pointer',
                background: activeIdx === pack.chapters.length ? 'rgba(31,138,155,.1)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 9,
              }}
            >
              <span style={{ display: 'inline-flex', color: activeIdx === pack.chapters.length ? 'var(--c-brand-teal)' : 'var(--c-text-faint)' }}><BookMarked size={15} /></span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: activeIdx === pack.chapters.length ? 'var(--c-brand-teal)' : 'var(--c-text-muted)' }}>
                Referencias
              </span>
            </button>
          )}
          {!isPublic && (
            <Link href={`/compartir/${pack.id}`} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--c-text-muted)' }}>
              <span style={{ display: 'flex', color: 'var(--c-text-faint)' }}><Share2 size={15} /></span>
              Compartir
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {activeIdx < pack.chapters.length ? (
          <>
            {/* Chapter card */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                packId={pack.id}
                userId={userId}
                dx={pack.dx}
                onRead={markRead}
              />
            </div>

            {/* Bottom nav */}
            <div style={{
              borderTop: '1px solid var(--c-border)',
              padding: '14px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--c-bg)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                style={{
                  padding: '10px 20px', borderRadius: 999,
                  border: '1px solid var(--c-border)', background: 'transparent',
                  fontFamily: 'var(--font-sans)', fontSize: 14, cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
                  color: activeIdx === 0 ? 'var(--c-text-faint)' : 'var(--c-text)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                ← Anterior
              </button>

              {/* dots */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {pack.chapters.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      width: i === activeIdx ? 20 : 6,
                      height: 6, borderRadius: 999, border: 'none', cursor: 'pointer',
                      background: i === activeIdx ? 'var(--c-brand-teal)' : 'var(--c-border)',
                      transition: 'width .2s, background .2s', padding: 0,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveIdx((i) => Math.min(pack.chapters.length, i + 1))}
                style={{
                  padding: '10px 20px', borderRadius: 999,
                  border: isLast ? '1px solid var(--c-border)' : 'none',
                  background: isLast ? 'transparent' : '#0F1923',
                  boxShadow: isLast ? 'none' : '0 0 0 1px rgba(31,138,155,.3), 0 4px 16px rgba(31,138,155,.15)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', color: isLast ? 'var(--c-text-muted)' : '#fff',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {isLast ? 'Ver referencias' : 'Siguiente'} →
              </button>
            </div>
          </>
        ) : (
          /* References panel */
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 80px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 20 }}>
              Referencias verificadas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {verifiedRefs.map((ref) => (
                <div key={ref.id} style={{ padding: '18px 20px', background: 'var(--c-surface)', borderRadius: 12 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {ref.authors} ({ref.year}). <em>{ref.journal}</em>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--c-text-muted)', marginBottom: 10 }}>
                    "{ref.quote}"
                  </div>
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-brand-teal)', textDecoration: 'none' }}
                  >
                    doi:{ref.doi} ↗
                  </a>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveIdx(pack.chapters.length - 1)}
              style={{ marginTop: 32, padding: '10px 20px', borderRadius: 999, border: '1px solid var(--c-border)', background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--c-text)', cursor: 'pointer' }}
            >
              ← Volver al último capítulo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
