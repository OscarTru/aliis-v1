'use client'

import React, { useEffect } from 'react'
import { HelpCircle } from 'lucide-react'
import type { Condition, ConditionSection } from '@/lib/types'
import { useConditionContext } from '@/lib/condition-context'
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

function SectionCard({ section }: { section: ConditionSection }) {
  return (
    <div className="h-full overflow-y-auto px-12 py-10 pb-20">
      <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60 mb-2.5">
        {section.read_time}
      </div>
      <h2 className="font-serif tracking-[-0.022em] leading-[1.12] mb-8 text-[clamp(26px,3.5vw,38px)]">
        {section.title}
      </h2>

      {section.content.paragraphs?.map((p, i) => (
        <p key={i} className="font-sans text-[16px] leading-[1.8] text-foreground mb-5">{p}</p>
      ))}

      {section.content.callout && (
        <div className="my-7 p-[20px_24px] bg-[rgba(31,138,155,.06)] border border-[rgba(31,138,155,.18)] rounded-[14px]">
          <div className="font-mono text-[10px] tracking-[.15em] uppercase text-primary mb-2.5">{section.content.callout.label}</div>
          <p className="font-serif text-[16px] leading-[1.6] text-foreground m-0">{section.content.callout.body}</p>
        </div>
      )}

      {section.content.timeline && (
        <div className="my-7 flex flex-col gap-0">
          {section.content.timeline.map((item, i) => (
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

      {section.content.questions && (
        <ul className="list-none p-0 mt-2 flex flex-col gap-2.5">
          {section.content.questions.map((q, i) => (
            <li key={i} className="flex gap-3.5 items-start px-[18px] py-3.5 bg-muted rounded-xl">
              <span className="text-primary shrink-0 flex pt-0.5"><HelpCircle size={16} /></span>
              <span className="font-sans text-[15px] text-foreground leading-[1.5]">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {section.content.alarms && (
        <div className="mt-2 flex flex-col gap-0.5">
          {section.content.alarms.map((a, i) => <AlarmBadge key={i} {...a} />)}
        </div>
      )}

      <div className="mt-8 px-4 py-3 bg-muted rounded-[10px] font-sans text-[12px] text-muted-foreground/60 italic">
        Esta información es educativa y no reemplaza la consulta con tu médico.
      </div>
    </div>
  )
}

export function ConditionView({ condition }: { condition: Condition }) {
  const { activeIdx, setCondition, setActiveIdx } = useConditionContext()
  const section = condition.sections[activeIdx]
  const isLast = activeIdx === condition.sections.length - 1

  useEffect(() => {
    setCondition(condition)
    return () => setCondition(null)
  }, [condition, setCondition])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {section && <SectionCard key={section.id} section={section} />}
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
          {condition.sections.map((_, i) => (
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
          onClick={() => !isLast && setActiveIdx(Math.min(condition.sections.length - 1, activeIdx + 1))}
          disabled={isLast}
          className={cn(
            'px-5 py-2.5 rounded-full font-sans text-[14px] font-medium flex items-center gap-1.5',
            isLast
              ? 'border border-border bg-transparent text-muted-foreground cursor-not-allowed'
              : 'border-none bg-foreground text-background shadow-[var(--c-btn-primary-shadow)] cursor-pointer'
          )}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
