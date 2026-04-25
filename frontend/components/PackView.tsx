'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Settings2, CalendarDays, MessageCircle, AlertTriangle, BookMarked, Share2, HelpCircle, LayoutList, Plus } from 'lucide-react'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChapterChat } from '@/components/ChapterChat'
import { cn } from '@/lib/utils'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  const isRed = tone === 'red'
  return (
    <div className={cn(
      'p-[18px_22px] rounded-[14px] mb-2.5 border',
      isRed ? 'bg-[rgba(192,57,43,.05)] border-[rgba(192,57,43,.2)]' : 'bg-[rgba(161,98,7,.05)] border-[rgba(161,98,7,.2)]'
    )}>
      <div className={cn('font-mono text-[10px] tracking-[.15em] uppercase mb-2', isRed ? 'text-[#c0392b]' : 'text-[#a16207]')}>
        {isRed ? '— urgente' : '— consulta pronto'}
      </div>
      <div className="font-serif text-[16px] tracking-[-0.01em] text-foreground mb-1.5 leading-[1.3]">{t}</div>
      <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{d}</div>
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
    <div className="h-full overflow-y-auto px-12 py-10 pb-20">
      {/* kicker */}
      <div className="font-mono text-[11px] tracking-[.15em] uppercase text-[var(--c-text-faint)] mb-2.5">
        {chapter.n} · {chapter.readTime}
      </div>
      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-2.5" style={{ fontSize: 'clamp(26px, 3.5vw, 38px)' }}>
        {chapter.kicker} <em className="text-muted-foreground">{chapter.kickerItalic}</em>
      </h2>
      <p className="font-serif italic text-muted-foreground text-[16px] mb-8 leading-[1.55]">
        {chapter.tldr}
      </p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} className="font-sans text-[16px] leading-[1.8] text-foreground mb-5">{p}</p>
      ))}

      {chapter.callout && (
        <div className="my-7 p-[20px_24px] bg-[rgba(31,138,155,.06)] border border-[rgba(31,138,155,.18)] rounded-[14px]">
          <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2.5">
            {chapter.callout.label}
          </div>
          <p className="font-serif text-[16px] leading-[1.6] text-foreground m-0">
            {chapter.callout.body}
          </p>
        </div>
      )}

      {chapter.timeline && (
        <div className="my-7 flex flex-col gap-0">
          {chapter.timeline.map((item, i) => (
            <div key={i} className="flex gap-5 items-start pb-5 border-l-2 border-border pl-5 relative">
              <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
              <div>
                <div className="font-mono text-[11px] text-primary mb-1">{item.w}</div>
                <div className="font-sans text-[15px] text-foreground leading-[1.55]">{item.t}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {chapter.questions && (
        <ul className="list-none p-0 mt-2 flex flex-col gap-2.5">
          {chapter.questions.map((q, i) => (
            <li key={i} className="flex gap-3.5 items-start px-[18px] py-3.5 bg-muted rounded-xl">
              <span className="text-primary shrink-0 flex pt-0.5"><HelpCircle size={16} /></span>
              <span className="font-sans text-[15px] text-foreground leading-[1.5]">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {chapter.alarms && (
        <div className="mt-2 flex flex-col gap-0.5">
          {chapter.alarms.map((a, i) => <AlarmBadge key={i} {...a} />)}
        </div>
      )}

      <div className="mt-8 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-[var(--c-text-faint)] italic">
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
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col overflow-y-auto px-3 pt-5 pb-4 bg-background">
        {/* Logo — idéntico al AppShell */}
        <Link href="/historial" className="flex items-center gap-2.5 no-underline px-1.5 mb-5">
          <Image src="/assets/aliis-original.png" alt="Aliis" width={72} height={28} className="object-contain" />
        </Link>

        {/* App nav */}
        {!isPublic && (
          <div className="flex flex-col gap-0.5 mb-4">
            {[
              { href: '/ingreso', label: 'Nuevo pack', icon: <Plus size={15} /> },
              { href: '/historial', label: 'Mis explicaciones', icon: <LayoutList size={15} /> },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-[9px] px-2.5 py-2 rounded-[9px] no-underline font-sans text-[13px] text-muted-foreground">
                <span className="flex text-[var(--c-text-faint)]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Divider + pack label */}
        <div className="px-2.5 pt-3 pb-2 border-t border-border">
          <div className="font-mono text-[9px] tracking-[.15em] uppercase text-[var(--c-text-faint)] mb-1.5">
            Esta explicación
          </div>
          <div className="font-serif text-[14px] tracking-[-0.01em] leading-[1.35] text-foreground">
            {pack.dx}
          </div>
        </div>

        {/* Chapter nav */}
        <nav className="py-1.5 flex-1">
          {pack.chapters.map((ch, i) => {
            const isActive = i === activeIdx
            const isRead = readChapters.has(ch.id)
            return (
              <button
                key={ch.id}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'w-full text-left px-2.5 py-[9px] rounded-[9px] border-none cursor-pointer mb-px flex items-center gap-[9px] transition-colors duration-100',
                  isActive ? 'bg-primary/10' : 'bg-transparent'
                )}
              >
                <span className={cn('shrink-0 inline-flex', isActive ? 'text-primary' : 'text-[var(--c-text-faint)]')}>{NAV_ICON_MAP[ch.id] ?? '•'}</span>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'font-sans text-[13px] whitespace-nowrap overflow-hidden text-ellipsis leading-[1.2]',
                    isActive ? 'font-medium text-primary' : 'font-normal text-muted-foreground'
                  )}>
                    {ch.kicker}
                  </div>
                  {ch.kickerItalic && (
                    <div className={cn(
                      'font-serif italic text-[12px] whitespace-nowrap overflow-hidden text-ellipsis opacity-80',
                      isActive ? 'text-primary' : 'text-[var(--c-text-faint)]'
                    )}>
                      {ch.kickerItalic}
                    </div>
                  )}
                </div>
                {isRead && !isActive && (
                  <div className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />
                )}
              </button>
            )
          })}
        </nav>

        {/* References + actions */}
        <div className="border-t border-border pt-2.5 flex flex-col gap-0.5">
          {verifiedRefs.length > 0 && (
            <button
              onClick={() => setActiveIdx(pack.chapters.length)}
              className={cn(
                'w-full text-left px-2.5 py-[9px] rounded-[9px] border-none cursor-pointer flex items-center gap-[9px]',
                activeIdx === pack.chapters.length ? 'bg-primary/10' : 'bg-transparent'
              )}
            >
              <span className={cn('inline-flex', activeIdx === pack.chapters.length ? 'text-primary' : 'text-[var(--c-text-faint)]')}><BookMarked size={15} /></span>
              <span className={cn('font-sans text-[13px]', activeIdx === pack.chapters.length ? 'text-primary' : 'text-muted-foreground')}>
                Referencias
              </span>
            </button>
          )}
          {!isPublic && (
            <Link href={`/compartir/${pack.id}`} className="flex items-center gap-[9px] px-2.5 py-[9px] rounded-[9px] no-underline font-sans text-[13px] text-muted-foreground">
              <span className="flex text-[var(--c-text-faint)]"><Share2 size={15} /></span>
              Compartir
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {activeIdx < pack.chapters.length ? (
          <>
            {/* Chapter card */}
            <div className="flex-1 overflow-hidden">
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
            <div className="border-t border-border px-12 py-3.5 flex items-center justify-between bg-background shrink-0">
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className={cn(
                  'px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] flex items-center gap-1.5',
                  activeIdx === 0 ? 'cursor-not-allowed text-[var(--c-text-faint)]' : 'cursor-pointer text-foreground'
                )}
              >
                ← Anterior
              </button>

              {/* dots */}
              <div className="flex gap-1.5 items-center">
                {pack.chapters.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={cn(
                      'h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-200',
                      i === activeIdx ? 'w-5 bg-primary' : 'w-1.5 bg-border'
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveIdx((i) => Math.min(pack.chapters.length, i + 1))}
                className={cn(
                  'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
                  isLast
                    ? 'border border-border bg-transparent text-muted-foreground'
                    : 'border-none bg-[#0F1923] text-white shadow-[0_0_0_1px_rgba(31,138,155,.3),0_4px_16px_rgba(31,138,155,.15)]'
                )}
              >
                {isLast ? 'Ver referencias' : 'Siguiente'} →
              </button>
            </div>
          </>
        ) : (
          /* References panel */
          <div className="flex-1 overflow-y-auto px-12 py-10 pb-20">
            <div className="font-mono text-[11px] tracking-[.15em] uppercase text-[var(--c-text-faint)] mb-5">
              Referencias verificadas
            </div>
            <div className="flex flex-col gap-4">
              {verifiedRefs.map((ref) => (
                <div key={ref.id} className="p-[18px_20px] bg-muted rounded-xl">
                  <div className="font-sans text-[14px] font-medium mb-1">
                    {ref.authors} ({ref.year}). <em>{ref.journal}</em>
                  </div>
                  <div className="font-serif italic text-[14px] text-muted-foreground mb-2.5">
                    "{ref.quote}"
                  </div>
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[12px] text-primary no-underline"
                  >
                    doi:{ref.doi} ↗
                  </a>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveIdx(pack.chapters.length - 1)}
              className="mt-8 px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer"
            >
              ← Volver al último capítulo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
