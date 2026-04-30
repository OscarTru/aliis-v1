# Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer todo el frontend de Aliis completamente responsivo con enfoque mobile-first, reemplazando la sidebar de escritorio con una bottom nav bar en móvil.

**Architecture:** La sidebar lateral (`Sidebar.tsx`) se oculta en móvil y se reemplaza con una barra de navegación inferior fija (`BottomNav.tsx`). El `AppShell.tsx` adapta su layout según breakpoint. La landing page (`app/page.tsx`) refactoriza sus grids de inline styles a clases Tailwind con breakpoints. Todas las páginas y componentes internos se ajustan para funcionar desde 375px.

**Tech Stack:** Next.js 15, Tailwind CSS 3.x, Framer Motion (motion/react), Lucide React. Sin nuevas dependencias.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `components/BottomNav.tsx` | **Crear** | Barra de navegación inferior para móvil |
| `components/AppShell.tsx` | **Modificar** | Ocultar sidebar en móvil, añadir padding-bottom para BottomNav |
| `components/Sidebar.tsx` | **Modificar** | `hidden md:flex` — invisible en móvil |
| `components/AppNav.tsx` | **Modificar** | Menú hamburguesa en móvil para landing |
| `app/page.tsx` | **Modificar** | Hero y Founders: inline grids → Tailwind breakpoints |
| `app/(shell)/ingreso/page.tsx` | **Modificar** | Padding y layout responsivo |
| `app/(shell)/cuenta/page.tsx` | **Modificar** | Cards y secciones responsivas |
| `app/(shell)/diario/page.tsx` | **Modificar** | Padding responsivo |
| `app/(shell)/pack/[id]/page.tsx` | **Modificar** | PackView responsivo |
| `components/PackView.tsx` | **Modificar** | Layout de capítulos en móvil |
| `components/SymptomsTracker.tsx` | **Modificar** | Tabla/lista responsiva |
| `components/PageWrapper.tsx` | **Modificar** | Padding bottom en móvil para BottomNav |

---

## Task 1: BottomNav — Navegación inferior para móvil

**Files:**
- Create: `frontend/components/BottomNav.tsx`

- [ ] **Step 1: Crear el componente BottomNav**

```tsx
// frontend/components/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, LayoutList, BookHeart, Library } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/ingreso',     label: 'Nuevo',      icon: Plus },
  { href: '/historial',   label: 'Expediente', icon: LayoutList },
  { href: '/diario',      label: 'Diario',     icon: BookHeart },
  { href: '/condiciones', label: 'Diagnósticos', icon: Library },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 no-underline transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: Verificar que el archivo existe y compila**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores relacionados con BottomNav.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/BottomNav.tsx
git commit -m "feat(mobile): BottomNav — navegación inferior para móvil"
```

---

## Task 2: AppShell — integrar BottomNav y ocultar Sidebar en móvil

**Files:**
- Modify: `frontend/components/AppShell.tsx`
- Modify: `frontend/components/Sidebar.tsx` (línea 161: añadir `hidden md:flex` al `motion.aside`)
- Modify: `frontend/components/PageWrapper.tsx`

- [ ] **Step 1: Leer PageWrapper para entender su estructura**

```bash
cat frontend/components/PageWrapper.tsx
```

- [ ] **Step 2: Añadir `pb-20 md:pb-0` a PageWrapper para dejar espacio a BottomNav**

Abrir `frontend/components/PageWrapper.tsx`. Si el componente tiene un `<div>` wrapper, añadir `pb-20 md:pb-0`. Si no existe PageWrapper como wrapper visual, añadirlo en AppShell directamente.

Ejemplo si PageWrapper es simplemente:
```tsx
export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="pb-20 md:pb-0">{children}</div>
}
```

Si tiene más clases, añadir solo `pb-20 md:pb-0` a las existentes.

- [ ] **Step 3: Modificar AppShell para incluir BottomNav**

```tsx
// frontend/components/AppShell.tsx
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'
import { PageWrapper } from '@/components/PageWrapper'
import { NotificationBell } from '@/components/NotificationBell'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PackProvider>
      <ConditionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            <div className="fixed top-4 right-4 z-50">
              <NotificationBell />
            </div>
            <PageWrapper>
              {children}
            </PageWrapper>
          </main>
        </div>
        <BottomNav />
      </ConditionProvider>
    </PackProvider>
  )
}
```

- [ ] **Step 4: Ocultar Sidebar en móvil**

En `frontend/components/Sidebar.tsx`, línea 161, el `motion.aside` tiene:
```tsx
className="relative flex flex-col shrink-0 border-r border-border bg-background overflow-visible h-screen sticky top-0 select-none"
```

Cambiar a:
```tsx
className="relative hidden md:flex flex-col shrink-0 border-r border-border bg-background overflow-visible h-screen sticky top-0 select-none"
```

- [ ] **Step 5: Verificar build**

```bash
cd frontend && NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_x NEXT_PUBLIC_APP_URL=https://aliis.app NEXT_PUBLIC_API_URL=https://api.aliis.app STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_x STRIPE_PRICE_EUR_MONTHLY=x STRIPE_PRICE_EUR_YEARLY=x STRIPE_PRICE_USD_MONTHLY=x STRIPE_PRICE_USD_YEARLY=x STRIPE_PRICE_MXN_MONTHLY=x STRIPE_PRICE_MXN_YEARLY=x SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x ANTHROPIC_API_KEY=x VAPID_PUBLIC_KEY=x VAPID_PRIVATE_KEY=x CRON_SECRET=x npm run build 2>&1 | grep -E "✓|Error|Failed"
```

Esperado: `✓ Compiled successfully` y `✓ Generating static pages`

- [ ] **Step 6: Commit**

```bash
git add frontend/components/AppShell.tsx frontend/components/Sidebar.tsx frontend/components/PageWrapper.tsx
git commit -m "feat(mobile): integrar BottomNav en AppShell, ocultar Sidebar en móvil"
```

---

## Task 3: Landing page — Hero y Founders responsivos

**Files:**
- Modify: `frontend/app/page.tsx` (líneas ~76 y ~826)

El problema: el Hero y Founders usan `display: 'grid', gridTemplateColumns: '1.1fr .9fr'` como inline styles sin media queries.

- [ ] **Step 1: Refactorizar el Hero grid (línea ~76)**

Buscar el div con `gridTemplateColumns: '1.1fr .9fr'` en el Hero section y reemplazar el inline style por clases Tailwind.

Antes:
```tsx
<div style={{ position: 'relative', maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 56, alignItems: 'center' }}>
```

Después — convertir el div a clases Tailwind (eliminar el inline style completamente):
```tsx
<div className="relative max-w-[72rem] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-8 md:gap-14 items-center">
```

> **Nota:** El contenido dentro (texto e imagen demo) no cambia — solo el wrapper.

- [ ] **Step 2: Refactorizar el Founders grid (línea ~826)**

Antes:
```tsx
<div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: 60, alignItems: 'center' }}>
```

Después:
```tsx
<div className="max-w-[72rem] mx-auto grid grid-cols-1 md:grid-cols-[.8fr_1.2fr] gap-10 md:gap-[60px] items-center">
```

- [ ] **Step 3: Padding de secciones en landing**

Buscar todas las secciones con `padding: '80px 24px'` o `padding: '120px 24px'` y añadir responsive. Ejemplo patrón a aplicar:

Antes:
```tsx
style={{ padding: '80px 24px' }}
```

Después (añadir clase o usar padding responsivo):
```tsx
className="px-6 py-12 md:py-20"
```

Si la sección tiene otros estilos necesarios que no tienen equivalente Tailwind, mantener solo esos en el inline style y mover padding/margin a clases.

- [ ] **Step 4: Verificar que el Hero se ve correctamente en móvil**

```bash
cd frontend && npm run dev &
```

Abrir `http://localhost:3000` en DevTools → Toggle device toolbar → iPhone 14 (390px). Verificar que:
- El Hero stack verticalmente (texto arriba, demo abajo)
- El Founders stack verticalmente
- No hay overflow horizontal

- [ ] **Step 5: Verificar build**

```bash
cd frontend && NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_x NEXT_PUBLIC_APP_URL=https://aliis.app NEXT_PUBLIC_API_URL=https://api.aliis.app STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_x STRIPE_PRICE_EUR_MONTHLY=x STRIPE_PRICE_EUR_YEARLY=x STRIPE_PRICE_USD_MONTHLY=x STRIPE_PRICE_USD_YEARLY=x STRIPE_PRICE_MXN_MONTHLY=x STRIPE_PRICE_MXN_YEARLY=x SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x ANTHROPIC_API_KEY=x VAPID_PUBLIC_KEY=x VAPID_PRIVATE_KEY=x CRON_SECRET=x npm run build 2>&1 | grep -E "✓|Error|Failed"
```

- [ ] **Step 6: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "fix(mobile): landing hero y founders — grid inline → Tailwind breakpoints"
```

---

## Task 4: AppNav — hamburger menu en móvil (landing)

**Files:**
- Modify: `frontend/components/AppNav.tsx`

El AppNav en la landing muestra 5 links en el centro en desktop. En móvil esos links se saldrán de pantalla.

- [ ] **Step 1: Ocultar nav links en móvil, mostrar solo logo + CTA**

Reemplazar el contenido de `AppNav.tsx` con versión responsiva:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { createClient } from '@/lib/supabase'

export function AppNav() {
  const router = useRouter()
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const [showLogin, setShowLogin] = useState(false)
  const [initial, setInitial] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setInitial(user.email[0].toUpperCase())
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setInitial(session?.user?.email?.[0]?.toUpperCase() ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const NAV_LINKS = [
    { label: 'Qué es', id: 'que-hace' },
    { label: 'Cómo funciona', id: 'como-funciona' },
    { label: 'Demo', id: 'ejemplo' },
  ]

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border bg-background/80">
        <div className="max-w-[72rem] mx-auto flex items-center justify-between px-4 md:px-6 py-3.5">
          {/* Logo */}
          <Link href={initial ? '/historial' : '/'} className="flex items-center no-underline">
            <Image src="/assets/aliis-black.png" alt="Aliis" width={80} height={32} className="object-contain" />
          </Link>

          {/* Desktop nav links — ocultos en móvil */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-0 transition-colors"
                >
                  {label}
                </button>
              ))}
              <Link href="/precios" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Precios</Link>
              <a href="mailto:hola@aliis.app" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">Contacto</a>
            </nav>
          )}

          {/* Derecha */}
          <div className="flex items-center gap-2 md:gap-3">
            {initial ? (
              <>
                {!isLanding && (
                  <Link href="/ingreso" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Nuevo pack
                  </Link>
                )}
                {isLanding && (
                  <Link href="/historial" className="hidden md:block font-sans text-sm text-muted-foreground hover:text-foreground no-underline">
                    Mi expediente
                  </Link>
                )}
                <Link href="/historial" className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif text-sm font-semibold no-underline">
                  {initial}
                </Link>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 md:px-5 py-2 rounded-full bg-foreground text-background font-sans text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity shadow-[0_0_0_1px_rgba(31,138,155,.3),0_4px_16px_rgba(31,138,155,.15)]"
              >
                Iniciar sesión
              </button>
            )}

            {/* Hamburger — solo visible en móvil en landing */}
            {isLanding && (
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-foreground bg-transparent border-none cursor-pointer"
                aria-label="Menú"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {isLanding && menuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full text-left font-sans text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer py-2.5 transition-colors"
              >
                {label}
              </button>
            ))}
            <Link href="/precios" onClick={() => setMenuOpen(false)} className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline py-2.5">
              Precios
            </Link>
            <a href="mailto:hola@aliis.app" className="font-sans text-sm text-muted-foreground hover:text-foreground no-underline py-2.5">
              Contacto
            </a>
          </div>
        )}
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
```

- [ ] **Step 2: Verificar type check**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/AppNav.tsx
git commit -m "feat(mobile): AppNav con hamburger menu en móvil"
```

---

## Task 5: Páginas internas — padding y layout responsivo

**Files:**
- Modify: `frontend/app/(shell)/ingreso/page.tsx`
- Modify: `frontend/app/(shell)/cuenta/page.tsx`
- Modify: `frontend/app/(shell)/diario/page.tsx`
- Modify: `frontend/app/(shell)/historial/page.tsx`

El patrón general es reemplazar `px-8` por `px-4 md:px-8` y `pt-10` se puede mantener.

- [ ] **Step 1: Aplicar padding responsivo en ingreso**

En `frontend/app/(shell)/ingreso/page.tsx`, buscar:
```tsx
max-w-[560px] mx-auto px-6 pt-12 pb-20
```
Cambiar a:
```tsx
max-w-[560px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-28 md:pb-20
```
> `pb-28` en móvil deja espacio sobre el BottomNav.

- [ ] **Step 2: Aplicar padding responsivo en cuenta**

En `frontend/app/(shell)/cuenta/page.tsx`, buscar:
```tsx
max-w-[680px] mx-auto px-8 pt-10 pb-20
```
Cambiar a:
```tsx
max-w-[680px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20
```

También buscar `flex items-start justify-between gap-6 px-6 py-5` dentro de cards y cambiar a:
```tsx
flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-4 sm:py-5
```

- [ ] **Step 3: Aplicar padding responsivo en diario**

En `frontend/app/(shell)/diario/page.tsx`, buscar:
```tsx
px-8 pt-10 pb-20 max-w-[1200px] mx-auto
```
Cambiar a:
```tsx
px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[1200px] mx-auto
```

Y el padding de cards `p-6` → `p-4 md:p-6`.

- [ ] **Step 4: Aplicar padding responsivo en historial**

En `frontend/app/(shell)/historial/page.tsx`, buscar:
```tsx
max-w-[680px] mx-auto px-8 pt-10 pb-20
```
Cambiar a:
```tsx
max-w-[680px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20
```

- [ ] **Step 5: Verificar build**

```bash
cd frontend && NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_x NEXT_PUBLIC_APP_URL=https://aliis.app NEXT_PUBLIC_API_URL=https://api.aliis.app STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_x STRIPE_PRICE_EUR_MONTHLY=x STRIPE_PRICE_EUR_YEARLY=x STRIPE_PRICE_USD_MONTHLY=x STRIPE_PRICE_USD_YEARLY=x STRIPE_PRICE_MXN_MONTHLY=x STRIPE_PRICE_MXN_YEARLY=x SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x ANTHROPIC_API_KEY=x VAPID_PUBLIC_KEY=x VAPID_PRIVATE_KEY=x CRON_SECRET=x npm run build 2>&1 | grep -E "✓|Error|Failed"
```

- [ ] **Step 6: Commit**

```bash
git add frontend/app/\(shell\)/ingreso/page.tsx frontend/app/\(shell\)/cuenta/page.tsx frontend/app/\(shell\)/diario/page.tsx frontend/app/\(shell\)/historial/page.tsx
git commit -m "fix(mobile): padding responsivo en páginas internas"
```

---

## Task 6: PackView — layout de capítulos responsivo

**Files:**
- Modify: `frontend/components/PackView.tsx`

PackView es el componente más complejo — muestra el contenido de un diagnóstico con sidebar de capítulos. En móvil, los capítulos deben mostrarse como tabs horizontales en la parte superior, no como sidebar lateral.

- [ ] **Step 1: Leer el layout actual de PackView**

```bash
head -80 frontend/components/PackView.tsx
```

- [ ] **Step 2: Añadir navegación de capítulos horizontal para móvil**

En PackView, identificar el área donde se listan los capítulos (probablemente un `<nav>` o lista de botones). Añadir encima un scroll horizontal visible solo en móvil:

```tsx
{/* Mobile chapter tabs — visible solo en móvil */}
<div className="flex md:hidden overflow-x-auto scrollbar-none gap-1 px-4 py-2 border-b border-border bg-background sticky top-0 z-10">
  {pack.chapters.map((ch, i) => (
    <button
      key={ch.id}
      onClick={() => setActiveIdx(i)}
      className={cn(
        'flex-shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-medium whitespace-nowrap border-none cursor-pointer transition-colors',
        i === activeIdx
          ? 'bg-primary text-white'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {ch.kicker}
    </button>
  ))}
</div>
```

Asegurarse de que `setActiveIdx` y `pack.chapters` están disponibles en ese scope (están en el contexto de PackContext).

- [ ] **Step 3: Verificar padding inferior en el contenido del pack**

El contenido del pack necesita `pb-28 md:pb-8` para no quedar tapado por el BottomNav en móvil. Buscar el wrapper de contenido en PackView y añadir ese padding.

- [ ] **Step 4: Verificar build**

```bash
cd frontend && NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_x NEXT_PUBLIC_APP_URL=https://aliis.app NEXT_PUBLIC_API_URL=https://api.aliis.app STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_x STRIPE_PRICE_EUR_MONTHLY=x STRIPE_PRICE_EUR_YEARLY=x STRIPE_PRICE_USD_MONTHLY=x STRIPE_PRICE_USD_YEARLY=x STRIPE_PRICE_MXN_MONTHLY=x STRIPE_PRICE_MXN_YEARLY=x SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x ANTHROPIC_API_KEY=x VAPID_PUBLIC_KEY=x VAPID_PRIVATE_KEY=x CRON_SECRET=x npm run build 2>&1 | grep -E "✓|Error|Failed"
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components/PackView.tsx
git commit -m "feat(mobile): PackView con tabs horizontales de capítulos en móvil"
```

---

## Task 7: SymptomsTracker — tabla responsiva

**Files:**
- Modify: `frontend/components/SymptomsTracker.tsx`

- [ ] **Step 1: Leer el layout actual**

```bash
cat frontend/components/SymptomsTracker.tsx
```

- [ ] **Step 2: Convertir tabla a card list en móvil**

Si `SymptomsTracker` usa `<table>` o un grid con múltiples columnas, aplicar el patrón de ocultar columnas en móvil o convertir a lista de cards:

Para cada fila de la tabla, añadir una versión card visible solo en móvil:
```tsx
{/* Mobile card — visible solo en móvil */}
<div className="flex md:hidden flex-col gap-3">
  {symptoms.map(s => (
    <div key={s.id} className="border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <span className="font-sans text-sm font-medium text-foreground">{s.name}</span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', s.resolved ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
          {s.resolved ? 'Resuelto' : 'Activo'}
        </span>
      </div>
      <span className="font-sans text-xs text-muted-foreground">
        {new Date(s.logged_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
      </span>
    </div>
  ))}
</div>

{/* Desktop table — oculta en móvil */}
<div className="hidden md:block">
  {/* tabla original aquí */}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/SymptomsTracker.tsx
git commit -m "fix(mobile): SymptomsTracker responsivo con cards en móvil"
```

---

## Task 8: Build final y push

- [ ] **Step 1: Build completo**

```bash
cd frontend && NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_x NEXT_PUBLIC_APP_URL=https://aliis.app NEXT_PUBLIC_API_URL=https://api.aliis.app STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_x STRIPE_PRICE_EUR_MONTHLY=x STRIPE_PRICE_EUR_YEARLY=x STRIPE_PRICE_USD_MONTHLY=x STRIPE_PRICE_USD_YEARLY=x STRIPE_PRICE_MXN_MONTHLY=x STRIPE_PRICE_MXN_YEARLY=x SUPABASE_SERVICE_ROLE_KEY=x RESEND_API_KEY=x ANTHROPIC_API_KEY=x VAPID_PUBLIC_KEY=x VAPID_PRIVATE_KEY=x CRON_SECRET=x npm run build 2>&1 | tail -10
```

Esperado: `✓ Compiled successfully` y `✓ Generating static pages` sin errores.

- [ ] **Step 2: Lint**

```bash
cd frontend && npm run lint
```

Esperado: `✔ No ESLint warnings or errors`

- [ ] **Step 3: Push final**

```bash
git push
```

---

## Resumen de cambios

| Tarea | Impacto en móvil |
|-------|-----------------|
| Task 1: BottomNav | Navegación principal accesible con el pulgar |
| Task 2: AppShell | Sidebar desaparece, BottomNav aparece |
| Task 3: Landing | Hero y Founders se apilan verticalmente |
| Task 4: AppNav | Menú hamburguesa en landing |
| Task 5: Páginas | Padding correcto, contenido no tapado por BottomNav |
| Task 6: PackView | Capítulos como tabs scroll horizontal |
| Task 7: SymptomsTracker | Lista de cards en lugar de tabla |
| Task 8: Build final | Verificación completa |
