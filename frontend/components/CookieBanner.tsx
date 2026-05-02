'use client'

import { useState, useEffect } from 'react'

type ConsentState = {
  analytics: boolean
}

const COOKIE_NAME = 'aliis_cookie_consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

function writeConsent(consent: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(consent))
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
}

export function CookieBanner({ onConsentChange }: { onConsentChange?: (c: ConsentState) => void }) {
  const [visible, setVisible] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    const saved = readConsent()
    if (saved) {
      onConsentChange?.(saved)
    } else {
      setVisible(true)
    }
  }, [])

  function save(consent: ConsentState) {
    writeConsent(consent)
    onConsentChange?.(consent)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-background border border-border rounded-xl shadow-lg p-5 md:p-6">
        {!customizing ? (
          <>
            <p className="font-sans text-sm text-foreground leading-relaxed mb-1">
              <strong>Antes de entrar, una cosa rápida</strong>
            </p>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">
              Usamos cookies técnicas para que puedas iniciar sesión y navegar sin interrupciones, sin ellas
              la plataforma no funciona. También usamos Google Analytics para entender qué partes de Aliis
              funcionan bien y cuáles podemos mejorar. Esta segunda parte es opcional y puedes rechazarla sin
              que cambie nada para ti.{' '}
              <a href="/cookies" className="text-primary underline underline-offset-4">Saber más</a>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => save({ analytics: true })}
                className="px-4 py-2 rounded-lg border border-secondary bg-secondary text-secondary-foreground font-sans text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                Aceptar todas
              </button>
              <button
                onClick={() => save({ analytics: false })}
                className="px-4 py-2 rounded-lg border border-border font-sans text-sm font-medium text-foreground hover:border-foreground/40 transition-colors"
              >
                Solo necesarias
              </button>
              <button
                onClick={() => setCustomizing(true)}
                className="px-4 py-2 rounded-lg font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Personalizar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-sans text-sm font-semibold text-foreground mb-4">Personalizar preferencias</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">Necesarias</p>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Sesión, autenticación y preferencias de consentimiento. Siempre activas.
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Siempre</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">Analítica</p>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Google Analytics (anonimizado). Nos ayuda a entender cómo se usa Aliis.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(a => !a)}
                  className={`shrink-0 mt-0.5 w-10 h-6 rounded-full transition-colors relative ${
                    analytics ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    analytics ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => save({ analytics })}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-sans text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                Guardar preferencias
              </button>
              <button
                onClick={() => setCustomizing(false)}
                className="px-4 py-2 rounded-lg font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Volver
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
