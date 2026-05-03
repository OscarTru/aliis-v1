'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'

// ─────────────────────────────────────────────────────────────────────────────
// AliisDemo — animated marketing demo of the real product.
//
// Design goals:
//   1. Visually faithful to the live app shell (Sidebar / BottomNav / page
//      tokens). What landing visitors see should match what they get post-signup.
//   2. Adapts between desktop sidebar (≥768px) and mobile bottom-nav (<768px),
//      mirroring the app breakpoints.
//   3. Smooth scene transitions and micro-animations using motion/react instead
//      of a manually-driven RAF crossfade.
//
// Performance:
//   - The RAF time loop is paused when the demo is offscreen (IntersectionObserver),
//     and only resumed if the user hasn't manually paused. Same behaviour as before.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Scenes timeline ────────────────────────────────────────────────────────

type SceneId = 'ingreso' | 'historial' | 'pack' | 'chat' | 'diario'
type SceneDef = { id: SceneId; dur: number; eyebrow: string; caption: string; nav: NavId }

const SCENES: SceneDef[] = [
  { id: 'ingreso',   dur: 5.0, eyebrow: '01 · INGRESO',     caption: 'Cuéntale a Aliis tu diagnóstico',                  nav: 'ingreso' },
  { id: 'historial', dur: 4.5, eyebrow: '02 · EXPEDIENTE',  caption: 'Todo lo que entiendes, en un solo lugar',          nav: 'historial' },
  { id: 'pack',      dur: 5.0, eyebrow: '03 · EXPLICACIÓN', caption: 'En palabras que entiendes — sin jerga',            nav: 'historial' },
  { id: 'chat',      dur: 5.5, eyebrow: '04 · PREGÚNTALE',  caption: 'Aliis te responde, con la ciencia detrás',         nav: 'historial' },
  { id: 'diario',    dur: 5.0, eyebrow: '05 · DIARIO',      caption: 'Tu salud, día a día — Aliis encuentra los patrones', nav: 'diario' },
]

const FULL_DIAG = 'Dislipidemia'

// ─── Nav definitions (mirror real Sidebar + BottomNav) ──────────────────────

type NavId = 'ingreso' | 'historial' | 'diario' | 'tratamientos' | 'cuenta' | 'condiciones'

const SIDEBAR_NAV: { id: NavId; href: string; label: string; icon: string }[] = [
  { id: 'ingreso',      href: '/ingreso',      label: 'Nuevo diagnóstico', icon: 'solar:add-circle-bold-duotone' },
  { id: 'historial',    href: '/historial',    label: 'Mi expediente',     icon: 'solar:folder-with-files-bold-duotone' },
  { id: 'diario',       href: '/diario',       label: 'Mi diario',         icon: 'solar:notebook-bold-duotone' },
  { id: 'tratamientos', href: '/tratamientos', label: 'Mis tratamientos',  icon: 'solar:pills-bold-duotone' },
  { id: 'condiciones',  href: '/condiciones',  label: 'Diagnósticos',      icon: 'solar:stethoscope-bold-duotone' },
]

const BOTTOM_NAV: { id: NavId; label: string; bold: string; linear: string }[] = [
  { id: 'ingreso',      label: 'Nuevo',        bold: 'solar:add-circle-bold-duotone',         linear: 'solar:add-circle-linear' },
  { id: 'historial',    label: 'Expediente',   bold: 'solar:folder-with-files-bold-duotone',  linear: 'solar:folder-with-files-linear' },
  { id: 'diario',       label: 'Diario',       bold: 'solar:notebook-bold-duotone',           linear: 'solar:notebook-linear' },
  { id: 'tratamientos', label: 'Tratamientos', bold: 'solar:pills-bold-duotone',              linear: 'solar:pills-linear' },
  { id: 'cuenta',       label: 'Cuenta',       bold: 'solar:user-circle-bold-duotone',        linear: 'solar:user-circle-linear' },
]

// ─── Cursor path (subtle pointer hint) ──────────────────────────────────────

type CursorTarget = { t: number; x: number; y: number }
const CURSOR_TARGETS: Record<SceneId, CursorTarget[]> = {
  ingreso:   [{ t: 0, x: 32, y: 30 }, { t: 0.6, x: 50, y: 50 }, { t: 2.6, x: 50, y: 50 }, { t: 3.6, x: 50, y: 78 }, { t: 5.0, x: 50, y: 78 }],
  historial: [{ t: 0, x: 70, y: 28 }, { t: 1.0, x: 50, y: 38 }, { t: 2.5, x: 60, y: 48 }, { t: 4.5, x: 60, y: 48 }],
  pack:      [{ t: 0, x: 55, y: 30 }, { t: 1.5, x: 52, y: 50 }, { t: 3.5, x: 60, y: 65 }, { t: 5.0, x: 80, y: 22 }],
  chat:      [{ t: 0, x: 70, y: 55 }, { t: 0.8, x: 88, y: 88 }, { t: 2.5, x: 95, y: 90 }, { t: 5.5, x: 78, y: 50 }],
  diario:    [{ t: 0, x: 50, y: 30 }, { t: 1.5, x: 60, y: 18 }, { t: 3.0, x: 50, y: 55 }, { t: 5.0, x: 40, y: 70 }],
}

function interpCursor(targets: CursorTarget[], t: number) {
  for (let i = 0; i < targets.length - 1; i++) {
    if (t >= targets[i].t && t < targets[i + 1].t) {
      const a = targets[i]
      const b = targets[i + 1]
      const k = (t - a.t) / (b.t - a.t)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }
    }
  }
  const last = targets[targets.length - 1]
  return { x: last.x, y: last.y }
}

// ─── Browser frame ──────────────────────────────────────────────────────────

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,.25)] flex flex-col">
      {/* Top bar */}
      <div className="h-9 flex items-center px-3.5 gap-3 border-b border-border bg-muted/40 shrink-0">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-background border border-border/60 font-mono text-[10px] text-muted-foreground/70 max-w-[200px] truncate">
            <Icon icon="solar:lock-bold-duotone" width={9} className="text-emerald-500/70" />
            aliis.app
          </div>
        </div>
        <div className="w-10" />
      </div>
      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden bg-background">{children}</div>
    </div>
  )
}

// ─── Sidebar (desktop) — mirror of components/Sidebar.tsx ────────────────────

function Sidebar({ active }: { active: NavId }) {
  return (
    <aside className="hidden md:flex w-[208px] shrink-0 h-full border-r border-border bg-background flex-col">
      {/* Logo */}
      <div className="px-3 pt-5 pb-2">
        <img src="/assets/aliis-original.png" alt="Aliis" width={88} height={32} className="object-contain logo-hide-dark" />
        <img src="/assets/aliis-black.png" alt="Aliis" width={88} height={32} className="object-contain logo-show-dark" />
      </div>
      {/* Main nav */}
      <nav className="flex flex-col gap-1 py-3 px-2">
        {SIDEBAR_NAV.map(item => {
          const isActive = item.id === active
          return (
            <div
              key={item.id}
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground',
              ].join(' ')}
            >
              <Icon icon={item.icon} width={20} className="shrink-0" />
              <span className="font-sans text-[13px] font-medium truncate">{item.label}</span>
            </div>
          )
        })}
      </nav>
      <div className="flex-1" />
      {/* Upgrade row (free plan) */}
      <div className="px-2 pb-2">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-primary">
          <Icon icon="solar:crown-bold-duotone" width={20} className="shrink-0" />
          <span className="font-sans text-[13px] font-medium">Actualizar a Pro</span>
        </div>
      </div>
      {/* User row */}
      <div className="border-t border-border px-3 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-serif text-[12px] font-semibold">O</div>
        <div className="min-w-0">
          <div className="font-sans text-[12px] font-medium text-foreground truncate">Oscar</div>
          <div className="font-mono text-[9px] text-muted-foreground truncate">free</div>
        </div>
      </div>
    </aside>
  )
}

// ─── Mobile bottom nav — mirror of components/BottomNav.tsx ─────────────────

function BottomNav({ active }: { active: NavId }) {
  // Bottom nav on mobile uses a slightly different mapping than the sidebar
  // (no condiciones, has cuenta).
  return (
    <div className="md:hidden absolute bottom-0 left-0 right-0 flex border-t border-border bg-background/95 backdrop-blur-xl">
      {BOTTOM_NAV.map(item => {
        const isActive = item.id === active
        return (
          <div
            key={item.id}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5',
              isActive ? 'text-primary' : 'text-muted-foreground',
            ].join(' ')}
          >
            <Icon icon={isActive ? item.bold : item.linear} width={22} />
            <span className="font-sans text-[9px] font-medium leading-none">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Notification bell (top-right floating) ─────────────────────────────────

function NotifBell() {
  return (
    <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
      <Icon icon="solar:bell-bold-duotone" width={15} />
      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-white font-mono text-[8px] flex items-center justify-center">1</span>
    </div>
  )
}

// ─── Page header (eyebrow + serif title) ────────────────────────────────────

function PageHeader({ eyebrow, title, italic }: { eyebrow: string; title: string; italic?: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] md:text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-1.5">
        {eyebrow}
      </p>
      <h1 className="font-serif text-[22px] md:text-[28px] tracking-[-0.022em] leading-[1.1]">
        {title} {italic && <em className="text-muted-foreground">{italic}</em>}
      </h1>
    </div>
  )
}

// ─── Scene 1: Ingreso ───────────────────────────────────────────────────────

function SceneIngreso({ typed, isFocus, ctaActive }: { typed: string; isFocus: boolean; ctaActive: boolean }) {
  return (
    <motion.div
      key="scene-ingreso"
      className="absolute inset-0 px-5 md:px-10 pt-7 md:pt-10 pb-16 md:pb-10 overflow-hidden"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <NotifBell />
      <div className="max-w-[420px] mx-auto h-full flex flex-col justify-center">
        <p className="font-mono text-[9px] md:text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-2">
          Paso 1 de 4
        </p>
        <h1 className="font-serif text-[26px] md:text-[36px] leading-[1.12] tracking-[-0.025em] mb-2">
          ¿Qué te dijo <em className="text-muted-foreground">tu médico?</em>
        </h1>
        <p className="font-sans text-[13px] md:text-[14px] text-muted-foreground leading-relaxed mb-6">
          Escribe el diagnóstico, copia lo que dice tu receta, o cuéntalo con tus palabras.
        </p>
        <motion.div
          animate={{ borderColor: isFocus ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2.5 px-4 h-12 rounded-2xl border border-border bg-muted/40 mb-4"
        >
          <Icon icon="solar:magnifer-linear" width={15} className="text-muted-foreground shrink-0" />
          <span className="font-sans text-[14px] text-foreground flex-1 truncate">
            {typed || <span className="text-muted-foreground/50">Escribe tu diagnóstico…</span>}
            {isFocus && <span className="inline-block w-px h-[14px] bg-foreground align-middle ml-0.5 animate-pulse" />}
          </span>
        </motion.div>
        <motion.button
          animate={{
            backgroundColor: ctaActive ? 'hsl(var(--secondary))' : 'hsl(var(--muted))',
            color: ctaActive ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--muted-foreground))',
          }}
          transition={{ duration: 0.25 }}
          className="w-full h-12 rounded-2xl font-sans text-[14px] font-medium border-none flex items-center justify-center gap-2"
        >
          Continuar
          <Icon icon="solar:arrow-right-linear" width={15} />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Scene 2: Historial ─────────────────────────────────────────────────────

const HISTORIAL_PACKS = [
  { dx: 'Dislipidemia', sub: 'Tu colesterol y triglicéridos están alterados — sin síntomas, pero relevante.', meta: '1 de 6 capítulos · 3 may', status: 'partial' as const },
  { dx: 'Diabetes tipo 2', sub: 'Tu cuerpo tiene dificultades para usar el azúcar como energía.', meta: '2 de 6 capítulos · 2 may', status: 'partial' as const },
  { dx: 'Hipertensión arterial', sub: 'Tu corazón empuja la sangre con más fuerza de la necesaria.', meta: '4 de 6 capítulos · 30 abr', status: 'mostly' as const },
]

function SceneHistorial({ hiliteFirst }: { hiliteFirst: boolean }) {
  return (
    <motion.div
      key="scene-historial"
      className="absolute inset-0 px-4 md:px-10 pt-5 md:pt-8 pb-16 md:pb-10 overflow-hidden"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <NotifBell />
      <div className="max-w-[640px] mx-auto h-full">
        <PageHeader eyebrow="3 diagnósticos" title="Mi" italic="expediente" />
        {/* Filter chips */}
        <div className="flex gap-1.5 flex-wrap my-4 md:my-5">
          {['Todos', 'Sin leer', 'A medias', 'Completados'].map((c, i) => (
            <span
              key={c}
              className={[
                'px-3 py-1 rounded-full font-sans text-[11px] md:text-[12px] border',
                i === 0 ? 'bg-foreground text-background border-transparent' : 'border-border text-muted-foreground',
              ].join(' ')}
            >
              {c}
            </span>
          ))}
        </div>
        {/* Pack list */}
        <motion.div
          className="flex flex-col gap-2.5"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
        >
          {HISTORIAL_PACKS.map((p, i) => (
            <motion.div
              key={p.dx}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 0.61, 0.36, 1] } },
              }}
              className={[
                'rounded-2xl border bg-background overflow-hidden transition-colors',
                i === 0 && hiliteFirst ? 'border-primary/40 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]' : 'border-border',
              ].join(' ')}
            >
              {/* Progress bar */}
              <div className="h-[3px] bg-muted">
                <div className={p.status === 'mostly' ? 'h-full bg-primary w-[66%]' : 'h-full bg-primary/50 w-[20%]'} />
              </div>
              <div className="px-4 md:px-5 py-3 md:py-4 flex items-start gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-[15px] md:text-[17px] tracking-[-0.015em] truncate">{p.dx}</h3>
                  <p className="font-sans text-[12px] md:text-[12.5px] text-muted-foreground line-clamp-2 leading-snug mt-0.5">{p.sub}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-[9px] md:text-[10px] tracking-[.08em] uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">A medias</span>
                    <span className="font-mono text-[9px] md:text-[10px] text-muted-foreground/40">{p.meta}</span>
                  </div>
                </div>
                <Icon icon="solar:alt-arrow-right-linear" width={16} className="text-muted-foreground shrink-0 mt-0.5" />
              </div>
              <div className={[
                'border-t border-border/60 px-4 md:px-5 py-2 font-sans text-[11px] md:text-[12px] flex items-center justify-between',
                'bg-muted/40 text-muted-foreground',
              ].join(' ')}>
                <span>Continuar</span>
                <Icon icon="solar:arrow-right-linear" width={11} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Scene 3: Pack (chapter view) ───────────────────────────────────────────

function ScenePack({ readProgress }: { readProgress: number }) {
  return (
    <motion.div
      key="scene-pack"
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {/* Mobile chapter tabs */}
      <div className="md:hidden sticky top-0 z-10 bg-foreground/[0.04] border-b border-border/70 px-4 py-2.5 flex items-center gap-1.5">
        <span className="h-7 px-3 rounded-full bg-primary text-white font-sans text-xs font-medium flex items-center">¿Qué es?</span>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="h-2 w-2 rounded-full bg-foreground/30" />
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-5 md:px-12 pt-5 md:pt-8 pb-20 md:pb-16">
        <div className="max-w-[560px] mx-auto">
          {/* Top meta + actions */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="font-mono text-[9px] md:text-[10px] tracking-[.15em] uppercase text-muted-foreground/60">
              01 · 3 MIN
            </span>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="hidden md:inline-flex h-[28px] px-2.5 rounded-full bg-background border border-border items-center gap-1.5 font-sans text-[11px]">
                <Icon icon="solar:clipboard-check-bold-duotone" width={13} className="text-secondary" />
                Preparar consulta
                <span className="font-mono text-[8px] tracking-[.1em] uppercase bg-secondary/15 text-secondary rounded px-1 py-0.5 ml-0.5">Pro</span>
              </span>
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex h-[26px] md:h-[28px] px-2.5 rounded-full bg-foreground text-background items-center gap-1 font-sans text-[10px] md:text-[11px] font-medium shadow-[var(--c-btn-primary-shadow)]"
              >
                <Icon icon="solar:chat-round-bold-duotone" width={13} />
                <span className="hidden md:inline">Pregúntale a Aliis</span>
                <span className="md:hidden">Aliis</span>
              </motion.span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-[22px] md:text-[32px] leading-[1.12] tracking-[-0.022em] mb-2.5">
            ¿Qué es <em className="text-muted-foreground">exactamente?</em>
          </h1>
          {/* TL;DR */}
          <p className="font-serif italic text-muted-foreground text-[13px] md:text-[15px] leading-[1.55] mb-5 md:mb-6">
            Tienes demasiada grasa circulando en tu sangre, y eso no duele, pero va dañando tus arterias en silencio.
          </p>

          {/* Body */}
          <div className="space-y-3.5 md:space-y-4 font-sans text-[13px] md:text-[15px] leading-[1.7] text-foreground">
            <p>
              Oscar, recibir otro diagnóstico encima de la diabetes y la hipertensión puede sentirse como demasiado. Pero quiero que sepas algo: esto no es una emergencia de hoy.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="my-5 md:my-6 p-4 md:p-5 rounded-[14px] border bg-[rgba(31,138,155,.05)] border-[rgba(31,138,155,.18)]"
            >
              <p className="font-mono text-[9px] md:text-[10px] tracking-[.15em] uppercase text-primary mb-2">
                Para imaginarlo así
              </p>
              <p className="font-serif text-[13px] md:text-[15px] leading-[1.55] m-0">
                Piensa en tus arterias como tuberías. El LDL alto es como cal que se va pegando por dentro, estrechando el paso poco a poco.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer with progress */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background">
        <div className="h-[2px] bg-muted">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${readProgress * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between px-4 md:px-12 py-2.5 md:py-3 md:pb-3 pb-[calc(0.625rem+44px+env(safe-area-inset-bottom))] md:pb-3">
          <span className="px-3 md:px-4 py-1.5 rounded-full border border-border font-sans text-[11px] md:text-[12px] text-muted-foreground">← Anterior</span>
          <span className="font-mono text-[10px] md:text-[11px] text-muted-foreground/50 tracking-[.08em]">1 / 5</span>
          <span className="px-3 md:px-4 py-1.5 rounded-full bg-foreground text-background font-sans text-[11px] md:text-[12px] font-medium shadow-[var(--c-btn-primary-shadow)]">Siguiente →</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Scene 4: Chat drawer ───────────────────────────────────────────────────

function SceneChat({ userQuestion, aiText, isTyping }: { userQuestion: string; aiText: string; isTyping: boolean }) {
  return (
    <motion.div
      key="scene-chat"
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Pack content behind, dimmed */}
      <div className="absolute inset-0 pointer-events-none">
        <ScenePack readProgress={0.5} />
      </div>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-foreground/20"
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 30 }}
        className="absolute top-0 right-0 bottom-0 w-full md:w-[340px] bg-background border-l border-border flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[9px] tracking-[.18em] uppercase text-primary/70 mb-0.5">· Aliis ·</p>
            <p className="font-serif text-[13px] md:text-[15px] truncate">Dislipidemia</p>
          </div>
          <Icon icon="solar:close-circle-bold" width={18} className="text-muted-foreground/60 mt-0.5" />
        </div>
        {/* Tabs */}
        <div className="flex border-b border-border">
          <span className="flex-1 py-2 font-sans text-[12px] font-medium text-primary border-b-2 border-primary text-center">Chat</span>
          <span className="flex-1 py-2 font-sans text-[12px] font-medium text-muted-foreground text-center">Mis apuntes</span>
        </div>
        {/* Body */}
        <div className="flex-1 px-3.5 py-3.5 overflow-hidden flex flex-col gap-3">
          {userQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-end"
            >
              <div className="max-w-[85%] bg-foreground text-background rounded-[12px_12px_3px_12px] px-3 py-2 font-sans text-[12px] leading-[1.6]">
                {userQuestion}
              </div>
            </motion.div>
          )}
          {(aiText || isTyping) && (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-background border border-border shrink-0 flex items-center justify-center mt-0.5">
                <img src="/assets/aliis-logo.png" alt="" width={14} height={14} className="object-contain" />
              </div>
              <div className="max-w-[85%] bg-muted border border-border rounded-[3px_12px_12px_12px] px-3 py-2 font-sans text-[12px] leading-[1.6]">
                {aiText}
                {isTyping && (
                  <span className="inline-flex gap-0.5 ml-1 align-middle">
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                        className="w-1 h-1 rounded-full bg-primary"
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Input */}
        <div className="px-3.5 pt-2 pb-3.5 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-background">
            <span className="flex-1 font-sans text-[12px] text-muted-foreground/50 truncate">Pregunta sobre Dislipidemia…</span>
            <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
              <Icon icon="solar:alt-arrow-up-bold" width={11} />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Scene 5: Diario (with whisker BP chart) ────────────────────────────────

const DIARIO_DAYS = ['26/04', '27/04', '28/04', '29/04', '30/04']
// SBP / DBP per day
const BP_DATA: { sbp: number; dbp: number }[] = [
  { sbp: 122, dbp: 78 },
  { sbp: 138, dbp: 88 },
  { sbp: 132, dbp: 84 },
  { sbp: 128, dbp: 82 },
  { sbp: 134, dbp: 86 },
]

function SceneDiario({ chartProgress }: { chartProgress: number }) {
  // Chart geometry
  const W = 320
  const H = 110
  const PAD_X = 18
  const PAD_Y = 12
  const Y_MIN = 60
  const Y_MAX = 150
  const xs = (i: number) => PAD_X + (i / (BP_DATA.length - 1)) * (W - PAD_X * 2)
  const ys = (v: number) => H - PAD_Y - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD_Y * 2)

  // Number of points to reveal based on chart progress
  const visibleCount = Math.max(1, Math.ceil(chartProgress * BP_DATA.length))

  // MAP polyline path
  const mapPath = BP_DATA.slice(0, visibleCount)
    .map((d, i) => {
      const map = Math.round((d.sbp + 2 * d.dbp) / 3)
      return `${i === 0 ? 'M' : 'L'} ${xs(i).toFixed(1)} ${ys(map).toFixed(1)}`
    })
    .join(' ')

  return (
    <motion.div
      key="scene-diario"
      className="absolute inset-0 px-4 md:px-10 pt-5 md:pt-8 pb-16 md:pb-10 overflow-hidden"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <NotifBell />
      <div className="max-w-[560px] mx-auto h-full overflow-hidden">
        <p className="font-mono text-[9px] md:text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mi diario
        </p>
        <h1 className="font-serif text-[22px] md:text-[28px] leading-[1.2]">
          Tu <em>diario</em> de salud
        </h1>

        {/* Aliis insight */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-4 md:mt-5 p-3.5 md:p-4 rounded-2xl border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
              <img src="/assets/aliis-logo.png" alt="" width={11} height={11} className="object-contain" />
            </div>
            <span className="font-mono text-[9px] md:text-[10px] tracking-[.12em] uppercase text-primary">Aliis</span>
          </div>
          <p className="font-serif italic text-[12px] md:text-[14px] leading-[1.5] text-foreground/85">
            Hola Oscar, tu presión esta semana ha estado en 132/84 — un poco arriba de lo ideal. Vale la pena mencionarlo en tu próxima consulta.
          </p>
        </motion.div>

        {/* Chart card */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 md:mt-4 p-3.5 md:p-4 rounded-2xl border border-border bg-card"
        >
          {/* Chips */}
          <div className="flex flex-wrap gap-1 md:gap-1.5 mb-3">
            {[
              { label: 'Glucosa', active: false },
              { label: 'Presión', active: true },
              { label: 'FC', active: false },
              { label: 'Peso', active: false },
              { label: 'Temp', active: false },
            ].map(c => (
              <span
                key={c.label}
                className={[
                  'px-2 md:px-2.5 py-0.5 rounded-full font-sans text-[10px] md:text-[11px] border',
                  c.active ? 'bg-foreground text-background border-transparent' : 'bg-transparent text-muted-foreground border-border',
                ].join(' ')}
              >
                {c.label}
              </span>
            ))}
          </div>

          {/* SVG chart with whiskers */}
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {/* grid lines */}
            {[80, 100, 120, 140].map(v => (
              <line
                key={v}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={ys(v)}
                y2={ys(v)}
                stroke="hsl(var(--border))"
                strokeDasharray="2 3"
                strokeWidth={1}
              />
            ))}
            {/* MAP line */}
            <motion.path
              d={mapPath}
              stroke="#e74c3c"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
            />
            {/* whiskers */}
            {BP_DATA.slice(0, visibleCount).map((d, i) => {
              const x = xs(i)
              const yTop = ys(d.sbp)
              const yBot = ys(d.dbp)
              const map = Math.round((d.sbp + 2 * d.dbp) / 3)
              const yMap = ys(map)
              return (
                <g key={i} stroke="#e74c3c" strokeWidth={1.4} strokeLinecap="round">
                  <line x1={x} x2={x} y1={yTop} y2={yBot} />
                  <line x1={x - 3.5} x2={x + 3.5} y1={yTop} y2={yTop} />
                  <line x1={x - 3.5} x2={x + 3.5} y1={yBot} y2={yBot} />
                  {/* MAP dot */}
                  <circle cx={x} cy={yMap} r={2.6} fill="#e74c3c" stroke="none" />
                </g>
              )
            })}
            {/* x labels */}
            {DIARIO_DAYS.map((d, i) => (
              <text
                key={d}
                x={xs(i)}
                y={H - 1}
                fontSize={8}
                fontFamily="var(--font-mono)"
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
                opacity={0.6}
              >
                {d}
              </text>
            ))}
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Caption (below browser) ────────────────────────────────────────────────

function Caption({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
      className="text-center mt-5 md:mt-6"
    >
      <p className="font-mono text-[9px] md:text-[10px] tracking-[.18em] uppercase text-muted-foreground/60 mb-1.5">
        {eyebrow}
      </p>
      <h3 className="font-serif text-[18px] md:text-[22px] leading-[1.25] tracking-[-0.015em]">
        {title}
      </h3>
    </motion.div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function AliisDemo() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const userPausedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const lastRef = useRef<number>(typeof performance !== 'undefined' ? performance.now() : 0)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Pause RAF when the demo is offscreen
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPausedRef.current) setPlaying(true)
        } else {
          setPlaying(false)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const totalDur = useMemo(() => SCENES.reduce((a, s) => a + s.dur, 0), [])

  useEffect(() => {
    const tick = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      lastRef.current = now
      if (playing) {
        setT(prev => {
          let next = prev + dt
          if (next >= totalDur) next = 0
          return next
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [playing, totalDur])

  // Resolve current scene + intra-scene progress
  let acc = 0
  let sceneIdx = 0
  let sceneT = 0
  for (let i = 0; i < SCENES.length; i++) {
    if (t < acc + SCENES[i].dur) {
      sceneIdx = i
      sceneT = t - acc
      break
    }
    acc += SCENES[i].dur
    if (i === SCENES.length - 1) {
      sceneIdx = i
      sceneT = SCENES[i].dur
    }
  }
  const scene = SCENES[sceneIdx]
  const sceneProgress = Math.min(1, sceneT / scene.dur)

  // Per-scene derived state
  const typedChars = Math.min(FULL_DIAG.length, Math.floor((sceneT - 0.6) / 0.13))
  const typedText = sceneT > 0.6 ? FULL_DIAG.slice(0, Math.max(0, typedChars)) : ''
  const inputFocus = sceneT > 0.3 && sceneT < scene.dur - 0.3
  const ctaActive = typedText.length > 0
  const hiliteFirst = sceneT > 1.6
  const readProg = Math.min(1, sceneT / scene.dur)
  const userQuestion = sceneT > 1.0 ? '¿por qué pasa?' : ''
  const aiFull =
    'Buena pregunta. Tu hígado tiene receptores que atrapan el LDL. Si no funcionan bien, el colesterol se queda dando vueltas y se pega en las arterias.'
  const aiStart = 1.6
  const aiChars = Math.min(aiFull.length, Math.floor((sceneT - aiStart) / 0.025))
  const aiText = sceneT > aiStart ? aiFull.slice(0, Math.max(0, aiChars)) : ''
  const isTyping = sceneT > aiStart && aiChars < aiFull.length
  const chartProgress = Math.min(1, Math.max(0, (sceneT - 0.6) / (scene.dur - 1.5)))

  const cursor = interpCursor(CURSOR_TARGETS[scene.id] ?? [{ t: 0, x: 50, y: 50 }], sceneT)

  function renderScene(id: SceneId): React.ReactNode {
    switch (id) {
      case 'ingreso':
        return <SceneIngreso typed={typedText} isFocus={inputFocus} ctaActive={ctaActive} />
      case 'historial':
        return <SceneHistorial hiliteFirst={hiliteFirst} />
      case 'pack':
        return <ScenePack readProgress={readProg} />
      case 'chat':
        return <SceneChat userQuestion={userQuestion} aiText={aiText} isTyping={isTyping} />
      case 'diario':
        return <SceneDiario chartProgress={chartProgress} />
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {/* Browser frame holds the whole thing */}
      <div className="relative aspect-[16/11] md:aspect-[16/10] max-w-[960px] mx-auto">
        <BrowserFrame>
          <div className="relative w-full h-full flex bg-background">
            {/* Sidebar (desktop only) */}
            <Sidebar active={scene.nav} />
            {/* Main pane */}
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {renderScene(scene.id)}
              </AnimatePresence>
              {/* Cursor */}
              <motion.div
                className="absolute pointer-events-none z-30"
                style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, translateX: '-2px', translateY: '-2px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow-md">
                  <path d="M5 3l5 18 3-7 7-3z" fill="hsl(var(--foreground))" stroke="white" strokeWidth={1.4} strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
            {/* Bottom nav (mobile only) */}
            <BottomNav active={scene.nav === 'condiciones' ? 'historial' : scene.nav} />
          </div>
        </BrowserFrame>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <Caption key={scene.id} eyebrow={scene.eyebrow} title={scene.caption} />
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-4 md:mt-5">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              let acc2 = 0
              for (let j = 0; j < i; j++) acc2 += SCENES[j].dur
              setT(acc2)
            }}
            aria-label={`Ir a escena ${i + 1}`}
            className="relative h-1 w-10 md:w-14 rounded-full bg-muted overflow-hidden border-none cursor-pointer p-0"
          >
            <div
              className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-100 ease-linear"
              style={{
                width: i < sceneIdx ? '100%' : i === sceneIdx ? `${sceneProgress * 100}%` : '0%',
              }}
            />
          </button>
        ))}
      </div>

      {/* Play / pause */}
      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={() => {
            userPausedRef.current = playing
            setPlaying(p => !p)
          }}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="w-9 h-9 rounded-full bg-muted text-foreground flex items-center justify-center border-none cursor-pointer hover:bg-muted/70 transition-colors"
        >
          {playing ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4l13 8-13 8z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
