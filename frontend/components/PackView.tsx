'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChapterChat } from '@/components/ChapterChat'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'

function AlarmBadge({ tone, t, d }: { tone: 'red' | 'amber'; t: string; d: string }) {
  const isRed = tone === 'red'
  return (
    <div className={cn(
      'p-[18px_22px] rounded-[14px] mb-2.5 border',
      isRed ? 'bg-[rgba(192,57,43,.05)] border-[rgba(192,57,43,.2)]' : 'bg-[rgba(161,98,7,.05)] border-[rgba(161,98,7,.2)]'
    )}>
      <div className={cn('font-mono text-[10px] tracking-[.15em] uppercase mb-2', isRed ? 'text-destructive' : 'text-amber-700')}>
        {isRed ? '— urgente' : '— consulta pronto'}
      </div>
      <div className="font-serif text-[16px] tracking-[-0.01em] text-foreground mb-1.5 leading-[1.3]">{t}</div>
      <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{d}</div>
    </div>
  )
}

function ChapterCard({
  chapter, packId, userId, dx, onRead, conditionSlug, packContext,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void; conditionSlug?: string | null; packContext: string
}) {
  const markedRef = useRef(false)

  useEffect(() => {
    markedRef.current = false
  }, [chapter.id])

  useEffect(() => {
    if (!userId || markedRef.current) return
    const timer = setTimeout(async () => {
      markedRef.current = true
      onRead?.(chapter.id)
      const supabase = createClient()
      await supabase.from('chapter_reads').upsert({ pack_id: packId, user_id: userId, chapter_id: chapter.id })
    }, 10000)
    return () => clearTimeout(timer)
  }, [chapter.id, packId, userId, onRead])

  return (
    <div className="h-full overflow-y-auto px-12 py-10 pb-20">
      <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-2.5">
        {chapter.n} · {chapter.readTime}
      </div>
      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-2.5 text-[clamp(26px,3.5vw,38px)]">
        {chapter.kicker} <em className="text-muted-foreground">{chapter.kickerItalic}</em>
      </h2>
      <p className="font-serif italic text-muted-foreground text-[16px] mb-8 leading-[1.55]">{chapter.tldr}</p>

      {chapter.paragraphs?.map((p, i) => (
        <p key={i} className="font-sans text-[16px] leading-[1.8] text-foreground mb-5">{p}</p>
      ))}

      {chapter.callout && (
        <div className="my-7 p-[20px_24px] bg-[rgba(31,138,155,.06)] border border-[rgba(31,138,155,.18)] rounded-[14px]">
          <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2.5">{chapter.callout.label}</div>
          <p className="font-serif text-[16px] leading-[1.6] text-foreground m-0">{chapter.callout.body}</p>
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

      <div className="mt-8 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-muted-foreground/60 italic">
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>

      {conditionSlug && (
        <Link
          href={`/condiciones/${conditionSlug}`}
          className="mt-6 flex items-center gap-3 px-5 py-4 rounded-[14px] border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors no-underline group"
        >
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[9px] tracking-[.18em] uppercase text-primary/70 mb-1">
              Biblioteca · Aliis
            </div>
            <div className="font-sans text-[14px] font-medium text-foreground group-hover:text-primary transition-colors">
              Leer más sobre esta condición →
            </div>
          </div>
        </Link>
      )}

      <ChapterChat
        dx={dx}
        packId={packId}
        userId={userId}
        chapterId={chapter.id}
        chapterTitle={`${chapter.kicker} ${chapter.kickerItalic}`}
        chapterContent={[
          chapter.tldr,
          ...(chapter.paragraphs ?? []),
          chapter.callout?.body ?? '',
          ...(chapter.timeline?.map((t) => `${t.w}: ${t.t}`) ?? []),
          ...(chapter.questions ?? []),
          ...(chapter.alarms?.map((a) => `${a.t}: ${a.d}`) ?? []),
        ].filter(Boolean).join('\n\n')}
        packContext={packContext}
      />
    </div>
  )
}

export function PackView({ pack, userId, conditionSlug }: { pack: Pack; userId?: string; conditionSlug?: string | null }) {
  const { activeIdx, readChapters, setPack, setActiveIdx, markRead } = usePackContext()
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)
  const chapter = pack.chapters[activeIdx]
  const isLast = activeIdx === pack.chapters.length - 1

  // Register pack data into context so Sidebar can render chapter nav
  useEffect(() => {
    setPack(pack)
    return () => setPack(null)
  }, [pack, setPack])

  return (
    <div className="flex flex-col h-full">
      {activeIdx < pack.chapters.length ? (
        <>
          <div className="flex-1 overflow-hidden">
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              packId={pack.id}
              userId={userId}
              dx={pack.dx}
              onRead={markRead}
              conditionSlug={conditionSlug}
              packContext={pack.chapters.map((ch) =>
                [`## ${ch.kicker} ${ch.kickerItalic}`, ch.tldr, ...(ch.paragraphs ?? [])].join('\n')
              ).join('\n\n')}
            />
          </div>

          <div className="border-t border-border px-12 py-3.5 flex items-center justify-between bg-background shrink-0">
            <button
              onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
              disabled={activeIdx === 0}
              className={cn(
                'px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] flex items-center gap-1.5',
                activeIdx === 0 ? 'cursor-not-allowed text-muted-foreground/60' : 'cursor-pointer text-foreground'
              )}
            >
              ← Anterior
            </button>

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
              onClick={() => setActiveIdx(Math.min(pack.chapters.length, activeIdx + 1))}
              className={cn(
                'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
                isLast
                  ? 'border border-border bg-transparent text-muted-foreground'
                  : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
              )}
            >
              {isLast ? 'Ver referencias' : 'Siguiente'} →
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-12 py-10 pb-20">
          <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-5">
            Referencias verificadas
          </div>
          <div className="flex flex-col gap-4">
            {verifiedRefs.map((ref) => (
              <div key={ref.id} className="p-[18px_20px] bg-muted rounded-xl">
                <div className="font-sans text-[14px] font-medium mb-1">
                  {ref.authors} ({ref.year}). <em>{ref.journal}</em>
                </div>
                <div className="font-serif italic text-[14px] text-muted-foreground mb-2.5">"{ref.quote}"</div>
                <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-primary no-underline">
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
  )
}
