'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/lib/types'

type PushStatus = 'unknown' | 'granted' | 'denied' | 'unsupported'

export function NotificationBell() {
  const router = useRouter()
  const [pushStatus, setPushStatus] = useState<PushStatus>('unknown')
  const [subscribing, setSubscribing] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPushStatus('unsupported')
      return
    }
    setPushStatus(
      Notification.permission === 'granted' ? 'granted'
      : Notification.permission === 'denied' ? 'denied'
      : 'unknown'
    )
  }, [])

  // Load on mount and poll every 60s to keep badge count fresh
  useEffect(() => {
    function fetchNotifications() {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setNotifications(d) })
        .catch(() => {})
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setNotifications(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function subscribe() {
    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setPushStatus('denied'); return }
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
      setPushStatus('granted')
    } catch {
      // silently fail
    } finally {
      setSubscribing(false)
    }
  }

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await fetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }

  async function handleNotificationClick(n: AppNotification) {
    if (!n.read) await markRead(n.id)
    setOpen(false)
    if (n.url) router.push(n.url)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notificaciones"
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full border transition-colors cursor-pointer',
          open
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        {pushStatus === 'denied' ? <BellOff size={14} /> : <Bell size={14} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 border border-background flex items-center justify-center font-mono text-[9px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-sans text-[13px] font-semibold text-foreground">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="font-sans text-[11px] text-primary hover:text-primary/80 transition-colors border-none bg-transparent cursor-pointer"
                >
                  Marcar todas leídas
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground/50 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer p-0.5"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="font-serif italic text-[13px] text-muted-foreground text-center py-10 px-4">
                Sin notificaciones por ahora.
              </p>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-border/50 last:border-0 transition-colors cursor-pointer flex items-start gap-3',
                    n.read ? 'bg-transparent hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'
                  )}
                >
                  <span className={cn(
                    'mt-1.5 shrink-0 w-2 h-2 rounded-full',
                    n.read ? 'bg-transparent' : 'bg-primary'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-sans text-[12px] leading-snug',
                      n.read ? 'text-muted-foreground' : 'text-foreground font-medium'
                    )}>
                      {n.title}
                    </p>
                    <p className="font-sans text-[12px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between gap-3">
              <p className="font-sans text-[11px] text-muted-foreground leading-snug">
                {pushStatus === 'denied'
                  ? 'Notificaciones push bloqueadas en el navegador.'
                  : 'Activa notificaciones push para avisos en tiempo real.'}
              </p>
              {pushStatus === 'unknown' && (
                <button
                  onClick={subscribe}
                  disabled={subscribing}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white font-sans text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer border-none"
                >
                  {subscribing ? '…' : 'Activar'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
