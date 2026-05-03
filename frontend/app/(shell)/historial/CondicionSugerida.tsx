'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion } from 'motion/react'

interface Props {
  condiciones: string[]
  who: 'yo' | 'familiar' | null
}

export function CondicionSugerida({ condiciones, who }: Props) {
  if (condiciones.length === 0) return null

  const paraParam = who ?? 'yo'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <p className="font-mono text-[10px] tracking-[.16em] uppercase text-muted-foreground/50 mb-2">
        Sin explicación aún
      </p>
      <div className="flex flex-col gap-2">
        {condiciones.map((condicion) => (
          <Link
            key={condicion}
            href={`/ingreso?dx=${encodeURIComponent(condicion)}&para=${paraParam}`}
            className="no-underline group flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-150"
          >
            <div className="min-w-0">
              <p className="font-sans text-[13px] font-medium text-foreground leading-tight truncate">
                {condicion}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
                Tienes esto registrado — ¿quieres que Aliis te lo explique?
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-sans text-[11px] font-medium text-primary group-hover:opacity-80 transition-opacity">
              <Icon icon="solar:stars-bold-duotone" width={12} />
              Generar explicación
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
