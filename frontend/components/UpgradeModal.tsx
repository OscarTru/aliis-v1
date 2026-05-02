'use client'

import Link from 'next/link'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[380px] rounded-3xl p-10 text-center border border-border bg-background">
        <VisuallyHidden><DialogTitle>Actualiza tu plan</DialogTitle></VisuallyHidden>
        <div className="font-serif text-[28px] tracking-tight leading-tight mb-3">
          Has usado tu pack gratuito
        </div>
        <p className="font-sans text-[15px] text-muted-foreground leading-relaxed mb-8">
          Con Aliis Pro tienes packs ilimitados, referencias verificadas y acceso completo.
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
