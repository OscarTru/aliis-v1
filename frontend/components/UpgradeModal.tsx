'use client'

import Link from 'next/link'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface Props {
  onClose: () => void
  /** Optional feature-specific headline & description */
  feature?: {
    title: string
    description: string
  }
}

const DEFAULT_FEATURE = {
  title: 'Has usado tu pack gratuito',
  description: 'Con Aliis Pro tienes packs ilimitados, referencias verificadas y acceso completo.',
}

export function UpgradeModal({ onClose, feature }: Props) {
  const { title, description } = feature ?? DEFAULT_FEATURE
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[380px] rounded-3xl p-10 text-center border border-border bg-background">
        <VisuallyHidden><DialogTitle>Actualiza tu plan</DialogTitle></VisuallyHidden>

        {/* Pro badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 font-mono text-[10px] tracking-[.12em] uppercase text-secondary font-medium mb-5 mx-auto">
          ✦ Pro
        </div>

        <div className="font-serif text-[26px] tracking-tight leading-tight mb-3">
          {title}
        </div>
        <p className="font-sans text-[14px] text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>
        <Button asChild className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground font-sans text-[15px] font-medium hover:bg-secondary/90 mb-3">
          <Link href="/precios">Ver planes — desde €9.99/mes</Link>
        </Button>
        <button
          onClick={onClose}
          className="font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer transition-colors"
        >
          Ahora no
        </button>
      </DialogContent>
    </Dialog>
  )
}
