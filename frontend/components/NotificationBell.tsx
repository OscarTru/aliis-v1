'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function NotificationBell() {
  const [status, setStatus] = useState<Status>('unknown')
  const [loading, setLoading] = useState(false)
  const [tooltip, setTooltip] = useState(false)
  const [justEnabled, setJustEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'unknown')
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
      await fetch('/api/aliis/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      setStatus('granted')
      setJustEnabled(true)
      setTimeout(() => setJustEnabled(false), 2000)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unsupported') return null

  const isGranted = status === 'granted'

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (isGranted) {
            setTooltip(t => !t)
          } else {
            subscribe()
          }
        }}
        disabled={loading || status === 'denied'}
        aria-label={isGranted ? 'Notificaciones activas' : 'Activar notificaciones'}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
          isGranted
            ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
            : status === 'denied'
            ? 'border-border bg-transparent text-muted-foreground/40 cursor-not-allowed'
            : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer'
        )}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : justEnabled ? (
          <Check size={14} />
        ) : isGranted ? (
          <Bell size={14} />
        ) : status === 'denied' ? (
          <BellOff size={14} />
        ) : (
          <Bell size={14} />
        )}

        {/* green dot when active */}
        {isGranted && !justEnabled && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-500 border border-background" />
        )}
      </button>

      {/* Tooltip when already granted */}
      {tooltip && isGranted && (
        <div
          className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border bg-popover p-3 shadow-lg"
          onMouseLeave={() => setTooltip(false)}
        >
          <p className="font-sans text-[12px] text-muted-foreground leading-snug">
            Recibirás un recordatorio diario para registrar tus signos vitales.
          </p>
        </div>
      )}

      {/* Tooltip when denied */}
      {tooltip && status === 'denied' && (
        <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-border bg-popover p-3 shadow-lg">
          <p className="font-sans text-[12px] text-muted-foreground leading-snug">
            Bloqueaste las notificaciones. Actívalas desde la configuración de tu navegador.
          </p>
        </div>
      )}
    </div>
  )
}
