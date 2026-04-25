import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <p className="font-mono text-[11px] tracking-[.2em] uppercase text-muted-foreground/60 mb-4">
        · 404 ·
      </p>
      <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] tracking-[-0.02em] leading-tight mb-3">
        Página no encontrada
      </h1>
      <p className="font-sans text-[15px] text-muted-foreground mb-8 max-w-[40ch]">
        Esta página no existe o el enlace ya no es válido.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-foreground text-background font-sans text-sm font-medium no-underline"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
