'use client'

import { useState, useEffect } from 'react'

export function PushPermissionPrompt() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'default') {
      setShow(true)
    }
  }, [])

  async function handleAccept() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setShow(false); return }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const json = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await fetch('/api/aliis/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
    } catch {
      // silently fail — notificaciones no son críticas
    } finally {
      setShow(false)
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 mb-5 flex items-center justify-between gap-4">
      <p className="font-sans text-sm text-muted-foreground leading-snug">
        ¿Quieres que Aliis te avise si detecta algo? Solo manda algo si vale la pena.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1.5 rounded-lg font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ahora no
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-primary text-white font-sans text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? 'Un momento…' : 'Activar'}
        </button>
      </div>
    </div>
  )
}
