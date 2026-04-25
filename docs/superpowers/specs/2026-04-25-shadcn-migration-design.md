# shadcn Migration + Collapsible Sidebar + Dark Mode — Design Spec

## Overview

Migrate the `/frontend` app from inline `style={{}}` objects to shadcn/ui primitives + Tailwind CSS classes, add `motion` for animations, build a collapsible animated sidebar, and implement automatic dark mode via `prefers-color-scheme`.

**Goal:** One coherent styling system across the entire app. No more `onMouseEnter`/`onMouseLeave` JS hover hacks. shadcn components as the foundation for all future UI work.

---

## 1. Style System Architecture

### Token mapping strategy

shadcn expects CSS variables in HSL channel format (e.g., `220 14% 11%` — no `hsl()` wrapper, no `#hex`). The current Aliis tokens are hex/rgba. **Step 1 of the migration converts all token values to HSL channels** before wiring up Tailwind.

Hex → HSL conversions for the Aliis palette:
- `#fafaf9` → `60 9% 98%` (background)
- `#18181b` → `240 4% 16%` (foreground)
- `#f4f4f5` → `240 5% 96%` (muted/card)
- `#1F8A9B` → `188 67% 36%` (primary / brand teal)
- `#52525b` → `240 4% 34%` (muted-foreground)
- `#0F1923` → `210 47% 9%` (primary button background)
- `#0F2633` → `200 63% 13%` (brand ink / secondary)
- `#0f1117` → `228 18% 8%` (dark background)
- `#1a1d27` → `228 20% 12%` (dark surface)
- `#25a8bb` → `188 67% 44%` (dark primary, lighter for contrast)

The current design tokens in `globals.css` (`--c-bg`, `--c-brand-teal`, etc.) are the source of truth. They get mapped to shadcn's expected variable names so both systems speak the same language:

| Aliis token | shadcn variable | Value |
|---|---|---|
| `--c-bg` | `--background` | `#fafaf9` |
| `--c-text` | `--foreground` | `#18181b` |
| `--c-surface` | `--card` / `--muted` | `#f4f4f5` |
| `--c-border` | `--border` | `rgba(0,0,0,0.08)` |
| `--c-brand-teal` | `--primary` | `#1F8A9B` |
| `--c-text-muted` | `--muted-foreground` | `#52525b` |
| `--c-btn-primary` | `--primary-foreground` (bg) | `#0F1923` |
| `--c-brand-ink` | `--secondary` | `#0F2633` |

The legacy `--c-*` variable names are kept in `globals.css` as aliases pointing to the shadcn variables. Components migrate to Tailwind classes (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.) — never back to the raw CSS variable names.

### Tailwind config

`tailwind.config.ts` is extended to expose all Aliis tokens as Tailwind utilities using `hsl()` + CSS variable references (shadcn convention):

```ts
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
      muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
      border: 'hsl(var(--border))',
      // ... full set
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      serif: ['var(--font-serif)'],
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  }
}
```

`content` is updated to include `./components/**/*.{tsx,ts}`.

### Dark mode

Implemented via CSS media query in `globals.css`. No JavaScript, no toggle button — the OS setting controls it automatically.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: /* dark value */;
    --foreground: /* light value */;
    --primary: /* teal adjusted for dark */;
    /* ... full dark palette */
  }
}
```

Dark palette values:
- Background: `#0f1117`
- Surface/card: `#1a1d27`
- Border: `rgba(255,255,255,0.08)`
- Text: `#f4f4f5`
- Text muted: `#a1a1aa`
- Primary (teal): `#25a8bb` (slightly lighter for contrast on dark)
- Brand ink: `#e2e8f0`

---

## 2. Collapsible Sidebar

### State

- Boolean `collapsed` state in `Sidebar.tsx`
- Persisted to `localStorage` key `aliis-sidebar-collapsed`
- Initialized from `localStorage` on mount (with SSR-safe `useEffect`)

### Layout

`AppShell.tsx` becomes a thin wrapper:
```tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">{children}</main>
</div>
```

`Sidebar.tsx` handles all sidebar logic.

### Animation

Uses `motion` (Framer Motion successor):

```tsx
<motion.aside
  animate={{ width: collapsed ? 64 : 220 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  className="flex flex-col border-r border-border bg-background overflow-hidden shrink-0"
>
```

Nav item labels and user email animate with `AnimatePresence`:
```tsx
<AnimatePresence>
  {!collapsed && (
    <motion.span
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.15 }}
      className="text-sm truncate"
    >
      {item.label}
    </motion.span>
  )}
</AnimatePresence>
```

### Toggle button

Positioned at the bottom of the sidebar, above the user section:
```tsx
<button onClick={() => setCollapsed(c => !c)} className="...">
  <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
    <ChevronLeft size={16} />
  </motion.div>
</button>
```

### Tooltips in collapsed mode

When `collapsed === true`, each nav item is wrapped in a shadcn `Tooltip` showing the item label. Tooltip appears on hover, positioned to the right of the icon.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Link href={item.href}>
      <span>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  </TooltipTrigger>
  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
</Tooltip>
```

### Logo behavior

- Expanded: `aliis-original.png` (72×28)
- Collapsed: `aliis-logo.png` (26×26) — the icon-only mark

---

## 3. Component Migration Map

### shadcn components to install

```bash
npx shadcn@latest add button dialog alert-dialog tooltip sheet input label separator avatar badge toast
```

### Migration rules

1. **Remove all `style={{}}` inline objects** — replace with Tailwind classes
2. **Remove `onMouseEnter`/`onMouseLeave` JS hover** — replace with `hover:` Tailwind classes or `motion` whileHover
3. **Keyframe animations** in `globals.css` stay; component-level animations move to `motion`
4. **shadcn primitives replace custom implementations:**
   - `ConfirmDialog` → shadcn `AlertDialog`
   - `LoginModal` → shadcn `Dialog`
   - `UpgradeModal` → shadcn `Dialog`
   - `ButtonPrimary` / `ButtonGhost` → shadcn `Button` with variants
   - Toast notifications in `/cuenta` → shadcn `toast` / `useToast`

### Migration order (low risk → high risk)

| Step | Target | shadcn used |
|---|---|---|
| 1 | `globals.css` + `tailwind.config.ts` + install shadcn + motion | — |
| 2 | `components/ui/` primitives (Button, Capsule, Eyebrow, Glow, ScribbleBrain) | `Button` |
| 3 | `ConfirmDialog` | `AlertDialog` |
| 4 | `AppShell` + new `Sidebar` | `Tooltip` + `motion` |
| 5 | `LoginModal` | `Dialog`, `Input`, `Label` |
| 6 | `UpgradeModal` | `Dialog` |
| 7 | `PackView`, `PackList`, `ChapterChat` | — |
| 8 | `AppNav`, `Footer` | `Avatar` |
| 9 | Pages: `/cuenta`, `/historial`, `/ingreso`, `/precios` | `Input`, `Label`, `Separator`, `Badge` |
| 10 | Pages: `/onboarding`, `/auth/reset`, `/p/[token]`, `/loading` | `Input`, `Button` |

---

## 4. Dependencies

```bash
# In /frontend
npx shadcn@latest init          # sets up shadcn with components.json
npx shadcn@latest add button dialog alert-dialog tooltip sheet input label separator avatar badge toast
npm install motion               # Framer Motion successor
```

shadcn init will ask for:
- Style: **Default**
- Base color: **Zinc** (closest to current `--c-text: #18181b`)
- CSS variables: **Yes**

After init, `components/ui/` gets shadcn-generated files. Custom Aliis primitives that don't have a shadcn equivalent (`Capsule`, `Eyebrow`, `Glow`, `ScribbleBrain`) stay as custom components but rewritten with Tailwind classes.

---

## 5. Files Created / Modified

**New files:**
- `components/Sidebar.tsx` — collapsible sidebar extracted from AppShell
- `components/ui/[shadcn-components].tsx` — generated by shadcn CLI (button, dialog, etc.)
- `lib/utils.ts` — generated by shadcn init, exports `cn()` helper (class merging via `clsx` + `tailwind-merge`)

**Modified files:**
- `globals.css` — add shadcn variable mappings + dark mode block
- `tailwind.config.ts` — extend with full token set + fix content paths
- `components/AppShell.tsx` — simplified to layout wrapper only
- `components/AppNav.tsx` — Tailwind classes
- `components/Footer.tsx` — Tailwind classes
- `components/LoginModal.tsx` — shadcn Dialog + Input
- `components/ConfirmDialog.tsx` — replaced with shadcn AlertDialog wrapper
- `components/UpgradeModal.tsx` — shadcn Dialog
- `components/PackView.tsx` — Tailwind classes
- `components/PackList.tsx` — Tailwind classes
- `components/ChapterChat.tsx` — Tailwind classes
- `components/ui/Button.tsx` — shadcn Button variants
- `app/cuenta/page.tsx` — Tailwind classes + shadcn Input/Toast
- `app/historial/page.tsx` — Tailwind classes
- `app/ingreso/page.tsx` — Tailwind classes
- `app/precios/page.tsx` — Tailwind classes
- `app/onboarding/page.tsx` — Tailwind classes
- `app/auth/reset/page.tsx` — Tailwind classes
- `app/p/[token]/page.tsx` — Tailwind classes
- `app/loading/page.tsx` — Tailwind classes

---

## 6. Success Criteria

- Zero `style={{}}` inline objects remaining in any component or page (except where truly dynamic — e.g., computed widths from data)
- Zero `onMouseEnter`/`onMouseLeave` hover hacks
- All interactive states handled by Tailwind `hover:`, `focus:`, `disabled:` classes or motion
- Dark mode works automatically when OS is in dark mode — no visual regressions
- Sidebar animates smoothly between 64px and 220px, persists state across page reloads
- Collapsed sidebar shows tooltips for all nav items
- All shadcn components styled with Aliis brand colors (teal primary, zinc neutrals)
- Build passes (`npm run build`) with no TypeScript errors
