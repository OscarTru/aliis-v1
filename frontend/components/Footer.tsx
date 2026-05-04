import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-border py-[72px] px-6 pb-9">
      <div className="max-w-[72rem] mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-8 mb-12">
          <div className="max-w-[28rem]">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/assets/aliis-original.png" alt="Aliis" width={90} height={36} className="object-contain logo-hide-dark" />
              <Image src="/assets/aliis-black.png" alt="Aliis" width={90} height={36} className="object-contain logo-show-dark" />
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
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="#demo">Demo</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/precios">Precios</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="/faq">Preguntas frecuentes</a>
              <a className="text-muted-foreground no-underline hover:text-foreground transition-colors" href="mailto:hola@cerebrosesponjosos.com?subject=Soporte%20Aliis">Soporte</a>
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
              <div className="flex items-center gap-3 mt-1">
                <a href="https://www.instagram.com/cerebros.esponjosos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
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
