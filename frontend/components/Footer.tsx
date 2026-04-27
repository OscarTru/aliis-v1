import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-border py-[72px] px-6 pb-9">
      <div className="max-w-[72rem] mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-8 mb-12">
          <div className="max-w-[28rem]">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/assets/aliis-black.png" alt="Aliis" width={90} height={36} className="object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <p className="font-serif italic text-sm text-muted-foreground m-0 leading-relaxed">
              Entiende tu diagnóstico. Acompaña tu enfermedad. Un producto de Cerebros Esponjosos.
            </p>
          </div>
          <div className="flex gap-14 font-sans text-sm">
            <div className="flex flex-col gap-2.5">
              <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Aliis
              </div>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="#como-funciona">Cómo funciona</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="#demo">Ver un ejemplo real</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/precios">Precios</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Legal
              </div>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/terminos">Términos y condiciones</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/privacidad">Política de privacidad</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/cookies">Cookies</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/disclaimer">Disclaimer médico</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
                Cerebros Esponjosos
              </div>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="https://www.cerebrosesponjosos.com/#nosotros" target="_blank" rel="noopener noreferrer">Quiénes somos</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="https://www.cerebrosesponjosos.com" target="_blank" rel="noopener noreferrer">Cerebros Esponjosos</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="https://www.instagram.com/cerebros.esponjosos" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-border flex justify-between flex-wrap gap-3 font-mono text-xs tracking-widest uppercase text-muted-foreground">
          <span>© 2026 · Cerebros Esponjosos</span>
          <span>Aliis no diagnostica ni sustituye a tu médico</span>
          <span>Basado en evidencia científica</span>
        </div>
      </div>
    </footer>
  )
}
