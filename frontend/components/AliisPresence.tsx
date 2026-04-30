'use client'

import Image from 'next/image'
import { Sparkles } from 'lucide-react'

interface Props {
  collapsed?: boolean
}

export function AliisPresence({ collapsed }: Props) {
  return (
    <a
      href="/diario"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 transition-colors no-underline group"
    >
      <div className="relative shrink-0 mx-auto">
        <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center bg-primary/5">
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={28} height={28} className="object-contain" />
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background" />
      </div>
      <div className={`min-w-0 overflow-hidden transition-all duration-150 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <p className="font-sans text-xs text-foreground font-medium leading-tight whitespace-nowrap">Aliis AI</p>
        <p className="font-mono text-[10px] text-muted-foreground leading-tight whitespace-nowrap">Tu agente de salud</p>
      </div>
      {!collapsed && (
        <Sparkles className="w-3 h-3 text-primary/40 group-hover:text-primary transition-colors shrink-0 ml-auto" />
      )}
    </a>
  )
}
