'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FormattedText } from '@/components/FormattedText'
import type { NoteWithPack } from '@/lib/types'

export function DiarioNotesSection({ notes }: { notes: NoteWithPack[] }) {
  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-[10px] tracking-[.15em] uppercase text-muted-foreground/50">
          Apuntes
        </p>
        {notes.length > 0 && (
          <span className="font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground/40">
            {notes.length} {notes.length === 1 ? 'diagnóstico' : 'diagnósticos'}
          </span>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <p className="font-serif italic text-[15px] text-muted-foreground mb-4 leading-relaxed">
            Aún no tienes apuntes.<br />Genera uno desde la conversación con Aliis.
          </p>
          <Link
            href="/historial"
            className="inline-block px-5 py-2 rounded-full border border-border font-sans text-[13px] text-foreground no-underline hover:bg-muted transition-colors"
          >
            Ver mis diagnósticos
          </Link>
        </div>
      ) : (
        <Accordion type="multiple" className="flex flex-col gap-2">
          {notes.map((note) => (
            <AccordionItem
              key={note.id}
              value={note.id}
              className="border border-border rounded-xl px-4 overflow-hidden"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex flex-col items-start gap-0.5 text-left">
                  <span className="font-serif text-[16px] leading-[1.25] text-foreground">
                    {note.dx}
                  </span>
                  <span className="font-mono text-[10px] tracking-[.1em] uppercase text-muted-foreground/50">
                    {formatDistanceToNow(new Date(note.pack_created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <FormattedText text={note.content} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
