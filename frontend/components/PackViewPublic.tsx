'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Settings2, CalendarDays, MessageCircle, AlertTriangle, BookMarked, HelpCircle } from 'lucide-react'
import type { Pack, Chapter } from '@/lib/types'
import { ChapterChat } from '@/components/ChapterChat'
import { cn } from '@/lib/utils'

const NAV_ICON_MAP: Record<string, React.ReactNode> = {
  'que-es': <BookOpen size={15} />,
  'como-funciona': <Settings2 size={15} />,
  'que-esperar': <CalendarDays size={15} />,
  'preguntas': <MessageCircle size={15} />,
  'senales': <AlertTriangle size={15} />,
}

function ChapterCard({ chapter, dx }: { chapter: Chapter; dx: string }) {
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

      {chapter.alarms?.map((a, i) => (
        <div key={i} className={cn(
          'p-[18px_22px] rounded-[14px] mb-2.5 border mt-2',
          a.tone === 'red' ? 'bg-[rgba(192,57,43,.05)] border-[rgba(192,57,43,.2)]' : 'bg-[rgba(161,98,7,.05)] border-[rgba(161,98,7,.2)]'
        )}>
          <div className={cn('font-mono text-[10px] tracking-[.15em] uppercase mb-2', a.tone === 'red' ? 'text-destructive' : 'text-amber-700')}>
            {a.tone === 'red' ? '— urgente' : '— consulta pronto'}
          </div>
          <div className="font-serif text-[16px] text-foreground mb-1.5 leading-[1.3]">{a.t}</div>
          <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{a.d}</div>
        </div>
      ))}

      <div className="mt-8 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-muted-foreground/60 italic">
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

export function PackViewPublic({ pack }: { pack: Pack }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [readChapters] = useState<Set<string>>(new Set())
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)
  const chapter = pack.chapters[activeIdx]
  const isLast = activeIdx === pack.chapters.length - 1

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col overflow-y-auto px-3 pt-4 pb-4 bg-background h-full">
        <Link href="/" className="flex items-center no-underline px-1.5 mb-4">
          <Image src="/assets/aliis-original.png" alt="Aliis" width={68} height={26} className="object-contain" />
        </Link>

        <div className="px-2.5 pb-2">
          <div className="font-mono text-[9px] tracking-[.15em] uppercase text-muted-foreground/50 mb-1">Esta explicación</div>
          <div className="font-serif text-[13px] leading-[1.35] text-foreground">{pack.dx}</div>
        </div>

        <nav className="py-1.5 flex-1">
          {pack.chapters.map((ch, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={ch.id}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer mb-px flex items-center gap-2 transition-colors duration-100',
                  isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
                )}
              >
                <span className={cn('shrink-0 inline-flex', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                  {NAV_ICON_MAP[ch.id] ?? '•'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    'font-sans text-[12px] truncate leading-[1.2]',
                    isActive ? 'font-medium text-primary' : 'text-muted-foreground'
                  )}>
                    {ch.kicker}
                  </div>
                  {ch.kickerItalic && (
                    <div className={cn('font-serif italic text-[11px] truncate opacity-80', isActive ? 'text-primary' : 'text-muted-foreground/60')}>
                      {ch.kickerItalic}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
          {verifiedRefs.length > 0 && (
            <button
              onClick={() => setActiveIdx(pack.chapters.length)}
              className={cn(
                'w-full text-left px-2.5 py-[7px] rounded-[9px] border-none cursor-pointer flex items-center gap-2 mt-1',
                activeIdx === pack.chapters.length ? 'bg-primary/10' : 'bg-transparent hover:bg-muted'
              )}
            >
              <span className={cn('inline-flex', activeIdx === pack.chapters.length ? 'text-primary' : 'text-muted-foreground/50')}>
                <BookMarked size={14} />
              </span>
              <span className={cn('font-sans text-[12px]', activeIdx === pack.chapters.length ? 'text-primary font-medium' : 'text-muted-foreground')}>
                Referencias
              </span>
            </button>
          )}
        </nav>

        <div className="pt-3 border-t border-border px-2.5">
          <Link href="/" className="font-sans text-[11px] text-muted-foreground/60 no-underline hover:text-muted-foreground">
            Crea tu cuenta gratis →
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeIdx < pack.chapters.length ? (
          <>
            <div className="flex-1 overflow-hidden">
              <ChapterCard chapter={chapter} dx={pack.dx} />
            </div>
            <div className="border-t border-border px-12 py-3.5 flex items-center justify-between bg-background shrink-0">
              <button
                onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
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
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={cn('h-1.5 rounded-full border-none cursor-pointer p-0 transition-all duration-200', i === activeIdx ? 'w-5 bg-primary' : 'w-1.5 bg-border')}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveIdx((i) => Math.min(pack.chapters.length, i + 1))}
                className={cn(
                  'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
                  isLast ? 'border border-border bg-transparent text-muted-foreground' : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
                )}
              >
                {isLast ? 'Ver referencias' : 'Siguiente'} →
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-12 py-10 pb-20">
            <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-5">Referencias verificadas</div>
            <div className="flex flex-col gap-4">
              {verifiedRefs.map((ref) => (
                <div key={ref.id} className="p-[18px_20px] bg-muted rounded-xl">
                  <div className="font-sans text-[14px] font-medium mb-1">{ref.authors} ({ref.year}). <em>{ref.journal}</em></div>
                  <div className="font-serif italic text-[14px] text-muted-foreground mb-2.5">"{ref.quote}"</div>
                  <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-primary no-underline">doi:{ref.doi} ↗</a>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveIdx(pack.chapters.length - 1)}
              className="mt-8 px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer">
              ← Volver al último capítulo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
