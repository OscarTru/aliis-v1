import Image from 'next/image'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--c-border)', padding: '72px 24px 36px' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 48,
          }}
        >
          <div style={{ maxWidth: '28rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Image src="/assets/aliis-original.png" alt="Aliis" width={90} height={36} style={{ objectFit: 'contain' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--c-text-faint)', margin: 0, lineHeight: 1.55 }}>
              Entiende tu diagnóstico. Acompaña tu enfermedad. Un producto de Cerebros Esponjosos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 56, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>
                Aliis
              </div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="/precios">Precios</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#demo">Ver un ejemplo real</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Términos y condiciones</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Política de privacidad</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Cookies</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Disclaimer</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--c-text-faint)', marginBottom: 4 }}>
                Cerebros Esponjosos
              </div>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Instagram</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">TikTok</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">YouTube</a>
              <a style={{ color: 'var(--c-text-muted)', textDecoration: 'none' }} href="#">Newsletter</a>
            </div>
          </div>
        </div>
        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '.2em',
            color: 'var(--c-text-faint)',
          }}
        >
          <span>© 2026 · Cerebros Esponjosos</span>
          <span>Aliis no diagnostica ni sustituye a tu médico</span>
          <span>Basado en evidencia científica</span>
        </div>
      </div>
    </footer>
  )
}
