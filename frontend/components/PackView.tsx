'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'motion/react'
import type { Pack, Chapter } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { ChatDrawer } from '@/components/ChatDrawer'
import { PreConsultButton } from '@/components/PreConsultButton'
import { UpgradeModal } from '@/components/UpgradeModal'
import { usePackContext } from '@/lib/pack-context'
import { cn } from '@/lib/utils'

function AskAliisButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.94 }}
      className="shrink-0 flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-foreground text-background border-none font-sans text-[12px] font-medium cursor-pointer shadow-[var(--c-btn-primary-shadow)] overflow-hidden"
    >
      <Icon icon="solar:chat-round-bold-duotone" width={14} className="shrink-0" />
      {/* Desktop: hover-expand label. Hidden on mobile — touch has no hover */}
      <AnimatePresence initial={false}>
        {hovered && (
          <motion.span
            key="label"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="hidden md:inline overflow-hidden whitespace-nowrap"
          >
            Pregúntale a Aliis
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

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
  chapter, packId, userId, dx, onRead, conditionSlug, packContext, onOpenChat, chatOpen, userPlan,
}: {
  chapter: Chapter; packId: string; userId?: string; dx: string; onRead?: (id: string) => void; conditionSlug?: string | null; packContext: string; onOpenChat: () => void; chatOpen: boolean; userPlan?: string
}) {
  const markedRef = useRef(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

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
    }, 30000)
    return () => clearTimeout(timer)
  }, [chapter.id, packId, userId, onRead])

  return (
    <div className="h-full overflow-y-auto px-4 py-6 pb-28 md:px-12 md:py-10 md:pb-8">
      {/* Meta on the left, action buttons pinned to the right */}
      <div className="flex items-center justify-between gap-3 mb-3 md:gap-4 md:mb-2.5 md:pr-12">
        <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 shrink-0">
          {chapter.n} · {chapter.readTime}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {userPlan === 'pro'
            ? <PreConsultButton packId={packId} iconOnly="mobile" />
            : (
              <motion.button
                onClick={() => setShowUpgrade(true)}
                whileTap={{ scale: 0.96 }}
                className="btn-ai-border flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-background font-sans text-[12px] text-foreground cursor-pointer relative overflow-visible"
              >
                <Icon icon="solar:clipboard-check-bold-duotone" width={14} className="shrink-0" />
                <span className="hidden md:inline">Preparar consulta</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-secondary/20 font-mono text-[9px] text-secondary tracking-wide leading-none">
                  Pro
                </span>
              </motion.button>
            )
          }
          {showUpgrade && (
            <UpgradeModal
              onClose={() => setShowUpgrade(false)}
              feature={{
                title: 'Prepara tu próxima consulta',
                description: 'Con Aliis Pro genera un resumen listo para compartir con tu médico, con tus diagnósticos y preguntas clave.',
              }}
            />
          )}
          {!chatOpen && <AskAliisButton onClick={onOpenChat} />}
        </div>
      </div>

      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-3 text-[clamp(26px,3.5vw,38px)]">
        {chapter.kicker} <em className="text-muted-foreground">{chapter.kickerItalic}</em>
      </h2>

      <div className="flex items-baseline gap-6 mb-8 flex-wrap">
        <p className="font-serif italic text-muted-foreground text-[16px] leading-[1.55] m-0">{chapter.tldr}</p>
        {conditionSlug && chapter.id !== 'herramientas' && (
          <Link
            href={`/condiciones/${conditionSlug}`}
            className="shrink-0 inline-flex items-center gap-1.5 font-sans text-[12px] text-primary/50 no-underline hover:text-primary transition-colors whitespace-nowrap"
          >
            <Icon icon="solar:book-2-bold-duotone" width={13} />
            Leer a profundidad →
          </Link>
        )}
      </div>

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
              <span className="text-primary shrink-0 flex pt-0.5"><Icon icon="solar:question-circle-bold-duotone" width={17} /></span>
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

    </div>
  )
}

export function PackView({ pack, userId, userPlan }: { pack: Pack; userId?: string; userPlan?: string }) {
  const { activeIdx, readChapters, setPack, setActiveIdx, markRead, setChatOpen, chatOpen } = usePackContext()
  const verifiedRefs = pack.references.filter((r) => r.verified !== false)
  const chapter = pack.chapters[activeIdx]
  const isLast = activeIdx === pack.chapters.length - 1
  const total = pack.chapters.length
  const hasTools = pack.tools.length > 0

  // Track navigation direction for slide animation
  const prevIdxRef = useRef(activeIdx)
  const direction = activeIdx >= prevIdxRef.current ? 1 : -1
  useEffect(() => {
    prevIdxRef.current = activeIdx
  }, [activeIdx])
  // refsIdx: where the references panel lives
  const refsIdx = pack.chapters.length + (hasTools ? 1 : 0)
  // Progress based on chapters the user has actually visited via Next (activeIdx + 1 as high-water mark)
  // readChapters (from timer) drives the DB, but we show nav-based progress for immediate feedback
  const visitedCount = Math.max(readChapters.size, activeIdx + 1)
  const progressPct = Math.min(visitedCount / total, 1)

  const packContext = pack.chapters.map((ch) =>
    [`## ${ch.kicker} ${ch.kickerItalic}`, ch.tldr, ...(ch.paragraphs ?? [])].join('\n')
  ).join('\n\n')

  // Register pack data into context so Sidebar can render chapter nav
  useEffect(() => {
    setPack(pack)
    return () => setPack(null)
  }, [pack, setPack])

  // Determine what the "Siguiente" button says when on the last real chapter
  function nextLabel(): string {
    if (!isLast) return 'Siguiente'
    if (hasTools) return 'Herramientas'
    return 'Ver referencias'
  }

  // Determine what the "Siguiente" button says when on the tools panel
  function toolsNextLabel(): string {
    return verifiedRefs.length > 0 ? 'Ver referencias' : ''
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile chapter tabs — only active is expanded, others are dots */}
      {(() => {
        const verifiedRefsForTabs = pack.references.filter((r) => r.verified !== false)
        type TabItem = { id: string; label: string; targetIdx: number }
        const items: TabItem[] = [
          ...pack.chapters.map((ch, i) => ({ id: ch.id, label: ch.kicker, targetIdx: i })),
        ]
        if (pack.tools.length > 0) items.push({ id: '__tools', label: 'Herramientas', targetIdx: pack.chapters.length })
        if (verifiedRefsForTabs.length > 0) {
          items.push({ id: '__refs', label: 'Referencias', targetIdx: pack.chapters.length + (pack.tools.length > 0 ? 1 : 0) })
        }
        return (
          <div className="flex md:hidden items-center justify-center gap-2 px-4 py-2.5 border-b border-border/70 bg-foreground/[0.06] sticky top-0 z-10 backdrop-blur-sm">
            {items.map((it) => {
              const isActive = activeIdx === it.targetIdx
              return (
                <motion.button
                  layout
                  key={it.id}
                  onClick={() => setActiveIdx(it.targetIdx)}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className={cn(
                    'shrink-0 flex items-center justify-center border-none cursor-pointer overflow-hidden',
                    isActive
                      ? 'h-7 px-3 rounded-full bg-primary text-white font-sans text-xs font-medium'
                      : 'h-2 w-2 rounded-full bg-foreground/30 hover:bg-foreground/55 transition-colors'
                  )}
                  aria-label={isActive ? undefined : it.label}
                >
                  {isActive && (
                    <motion.span
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="whitespace-nowrap"
                    >
                      {it.label}
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )
      })()}

      <ChatDrawer
        dx={pack.dx}
        packId={pack.id}
        userId={userId}
        packContext={packContext}
      />

      <div className={cn(
        'flex-1 flex flex-col min-h-0 transition-all duration-300',
        chatOpen ? 'md:mr-[380px]' : 'md:mr-0'
      )}>

      {activeIdx < pack.chapters.length ? (
        <>
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={chapter.id}
                custom={direction}
                initial={{ x: direction * 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -24, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                className="absolute inset-0"
              >
                <ChapterCard
                  chapter={chapter}
                  packId={pack.id}
                  userId={userId}
                  dx={pack.dx}
                  onRead={markRead}
                  conditionSlug={pack.conditionSlug}
                  packContext={packContext}
                  onOpenChat={() => setChatOpen(true)}
                  chatOpen={chatOpen}
                  userPlan={userPlan}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-border bg-background shrink-0">
            {/* Progress bar — fills as user navigates chapters */}
            <div className="h-[2px] bg-muted w-full">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${Math.round(progressPct * 100)}%` }}
              />
            </div>

            <div className="px-4 py-3 md:px-12 md:py-3.5 flex items-center justify-between">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className={cn(
                  'px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-border bg-transparent font-sans text-[13px] md:text-[14px] flex items-center gap-1.5',
                  activeIdx === 0 ? 'cursor-not-allowed text-muted-foreground/60' : 'cursor-pointer text-foreground'
                )}
              >
                ← Anterior
              </button>

              <span className="font-mono text-[11px] text-muted-foreground/50 tracking-[.08em]">
                {activeIdx + 1} / {total}
              </span>

              <button
                onClick={() => setActiveIdx(Math.min(refsIdx, activeIdx + 1))}
                className={cn(
                  'px-4 py-2 md:px-5 md:py-2.5 rounded-full font-sans text-[13px] md:text-[14px] font-medium cursor-pointer flex items-center gap-1.5',
                  isLast
                    ? 'border border-border bg-transparent text-muted-foreground'
                    : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)]'
                )}
              >
                {nextLabel()} →
              </button>
            </div>
          </div>
        </>
      ) : hasTools && activeIdx === pack.chapters.length ? (
        /* Herramientas panel */
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 md:px-12 md:py-10 md:pb-20">
          <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-5">
            Herramientas para tu cuidado
          </div>
          <div className="flex flex-col gap-3">
            {pack.tools.map((tool, i) => (
              <div key={i} className="p-[18px_20px] bg-muted rounded-xl">
                <div className="font-sans text-[14px] font-medium text-foreground mb-1">{tool.title}</div>
                <div className="font-sans text-[13px] text-muted-foreground leading-[1.55]">{tool.description}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setActiveIdx(pack.chapters.length - 1)}
              className="px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer"
            >
              ← Volver al último capítulo
            </button>
            {verifiedRefs.length > 0 && (
              <button
                onClick={() => setActiveIdx(refsIdx)}
                className="px-5 py-2.5 rounded-full border border-border bg-transparent font-sans text-[14px] text-foreground cursor-pointer"
              >
                {toolsNextLabel()} →
              </button>
            )}
          </div>
        </div>
      ) : (
        /* References panel */
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 md:px-12 md:py-10 md:pb-20">
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
    </div>
  )
}
