import Image from 'next/image'

interface Props {
  content: string
  generatedAt: string
}

export function CapsulaDeTiempo({ content, generatedAt }: Props) {
  const month = new Date(generatedAt).toLocaleDateString('es-ES', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0">
          <Image src="/assets/aliis-logo.png" alt="Aliis" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <span className="font-mono text-[10px] tracking-[.12em] text-amber-600 dark:text-amber-400 uppercase">
            Cápsula del tiempo
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/50 ml-2 capitalize">
            {month}
          </span>
        </div>
      </div>
      <p className="font-serif text-[15px] leading-relaxed text-foreground italic">
        {content}
      </p>
    </div>
  )
}
