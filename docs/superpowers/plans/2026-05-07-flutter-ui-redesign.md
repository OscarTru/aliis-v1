# Flutter UI Redesign — Editorial Minimal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la UI de la app Flutter de Aliis al estilo Editorial Minimal — fondo blanco puro, tipografía Playfair Display italic, bottom nav glass flotante, y nueva tab Medicación independiente.

**Architecture:** Cada feature existente se refactoriza en su propio directorio; los componentes reutilizables viven en `mobile/lib/shared/widgets/`; la feature `medicacion/` es completamente nueva con su propio provider, screen y widgets. La feature `alertas/` pasa de tab a pantalla de destino accesible desde el bell badge del header de Inicio.

**Tech Stack:** Flutter 3, Riverpod 2, GoRouter 14, flutter_animate 4.5, google_fonts 6, supabase_flutter 2, intl 0.20

---

## File Map

### Modificaciones
| Archivo | Cambio |
|---|---|
| `mobile/lib/core/theme.dart` | Colores nuevos + Playfair Display como heading |
| `mobile/lib/shared/widgets/shell_scaffold.dart` | Reemplazar nav por GlassBottomNav iOS-26 |
| `mobile/lib/core/router.dart` | Cambiar branches: Packs→Expediente, Alertas→Medicación; añadir /alertas como ruta standalone |
| `mobile/lib/features/home/home_screen.dart` | Editorial header + bell badge + secciones nuevas |
| `mobile/lib/features/home/home_provider.dart` | Añadir insights list a HomeData |
| `mobile/lib/features/diario/diario_screen.dart` | Rename a expediente_screen, estilo Editorial |
| `mobile/lib/features/diario/registro_wizard.dart` | Quitar paso de medicación (si existía) |
| `mobile/lib/features/aliis/aliis_sheet.dart` | Header Playfair + context strip + chat UI |
| `mobile/lib/features/perfil/perfil_screen.dart` | Editorial header + secciones con separadores |
| `mobile/lib/features/alertas/alertas_screen.dart` | Solo visual: estilo Editorial |

### Nuevos archivos
| Archivo | Propósito |
|---|---|
| `mobile/lib/shared/widgets/serif_heading.dart` | SerifHeading — Playfair Display italic + accent line teal |
| `mobile/lib/shared/widgets/aliis_signal_card.dart` | AliisSignalCard — card teal oscuro, texto blanco |
| `mobile/lib/shared/widgets/alert_row.dart` | AlertRow — border-left colored, sin background |
| `mobile/lib/shared/widgets/adherence_bar.dart` | AdherenceBar — label + % + ProgressBar + sublabel |
| `mobile/lib/shared/widgets/list_item.dart` | ListItem — row con separador inferior |
| `mobile/lib/shared/widgets/metric_grid.dart` | MetricGrid — grid 2×2 vitales inline con separadores |
| `mobile/lib/shared/widgets/glass_bottom_nav.dart` | GlassBottomNav — nav flotante iOS-26 glass pill |
| `mobile/lib/shared/widgets/bell_badge.dart` | BellBadge — campanita con badge rojo numérico |
| `mobile/lib/features/medicacion/medicacion_provider.dart` | Provider: treatments + adherence_logs del día |
| `mobile/lib/features/medicacion/medicacion_screen.dart` | Pantalla Medicación: header + adherencia + lista por turno |
| `mobile/lib/features/medicacion/widgets/med_check_row.dart` | MedCheckRow — checkbox tapeable con animación |

---

## Task 1: Actualizar paleta de colores y tipografía (theme.dart)

**Files:**
- Modify: `mobile/lib/core/theme.dart`

La paleta actual tiene `background = #FAFAF7` (off-white), `muted = #F4F4F6`, `border = #E4E4EB`, y usa `instrumentSerif` como serif. El spec pide `background = #FFFFFF`, `border = #F0F0F0`, `deepTeal = #14606E`, y **Playfair Display** italic como heading.

- [ ] **Step 1: Reemplazar theme.dart completo**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AliisColors {
  const AliisColors._();

  static const background   = Color(0xFFFFFFFF);
  static const foreground   = Color(0xFF272730);
  static const primary      = Color(0xFF1F8A9B);
  static const deepTeal     = Color(0xFF14606E);
  static const mutedFg      = Color(0xFF999999);
  static const border       = Color(0xFFF0F0F0);
  static const amber        = Color(0xFFF59E0B);
  static const emerald      = Color(0xFF10B981);
  static const destructive  = Color(0xFFDC2626);

  // dark mode — diferido, mantener para no romper referencias
  static const backgroundDark  = Color(0xFF0F1117);
  static const foregroundDark  = Color(0xFFF4F4F6);
  static const borderDark      = Color(0xFF2E3040);
  static const mutedForeground = mutedFg; // alias compat
}

ThemeData aliisLightTheme() {
  final base = ThemeData.light(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.background,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.background,
      onSurface: AliisColors.foreground,
      outline: AliisColors.border,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.playfairDisplay(
        fontSize: 30, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foreground,
      ),
      displayMedium: GoogleFonts.playfairDisplay(
        fontSize: 22, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foreground,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 20, fontStyle: FontStyle.italic,
        color: AliisColors.foreground,
      ),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.background,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(0),
        side: BorderSide.none,
      ),
    ),
    dividerColor: AliisColors.border,
    appBarTheme: const AppBarTheme(
      backgroundColor: AliisColors.background,
      foregroundColor: AliisColors.foreground,
      elevation: 0,
      centerTitle: false,
    ),
  );
}

ThemeData aliisDarkTheme() {
  final base = ThemeData.dark(useMaterial3: true);
  return base.copyWith(
    scaffoldBackgroundColor: AliisColors.backgroundDark,
    colorScheme: base.colorScheme.copyWith(
      primary: AliisColors.primary,
      surface: AliisColors.backgroundDark,
      onSurface: AliisColors.foregroundDark,
      outline: AliisColors.borderDark,
    ),
    textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.playfairDisplay(
        fontSize: 30, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foregroundDark,
      ),
      displayMedium: GoogleFonts.playfairDisplay(
        fontSize: 22, fontStyle: FontStyle.italic, fontWeight: FontWeight.w300,
        color: AliisColors.foregroundDark,
      ),
      titleLarge: GoogleFonts.playfairDisplay(
        fontSize: 20, fontStyle: FontStyle.italic,
        color: AliisColors.foregroundDark,
      ),
    ),
    cardTheme: CardThemeData(
      color: AliisColors.backgroundDark,
      elevation: 0,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
    ),
    dividerColor: AliisColors.borderDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: AliisColors.backgroundDark,
      foregroundColor: AliisColors.foregroundDark,
      elevation: 0,
    ),
  );
}
```

- [ ] **Step 2: Verificar que compila (no hay tests de tema)**

```bash
cd mobile && flutter analyze lib/core/theme.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
cd mobile && git add lib/core/theme.dart
git commit -m "feat(ui): paleta Editorial Minimal — blanco puro, deepTeal, Playfair Display"
```

---

## Task 2: Componentes reutilizables — SerifHeading y BellBadge

**Files:**
- Create: `mobile/lib/shared/widgets/serif_heading.dart`
- Create: `mobile/lib/shared/widgets/bell_badge.dart`

Estos dos widgets se usan en múltiples pantallas. Crearlos primero elimina dependencias circulares en tareas posteriores.

- [ ] **Step 1: Crear serif_heading.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class SerifHeading extends StatelessWidget {
  final String eyebrow;
  final String heading;
  final double headingSize;
  final bool showAccentLine;

  const SerifHeading({
    super.key,
    required this.heading,
    this.eyebrow = '',
    this.headingSize = 30,
    this.showAccentLine = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (eyebrow.isNotEmpty) ...[
          Text(
            eyebrow.toUpperCase(),
            style: GoogleFonts.robotoMono(
              fontSize: 10,
              color: AliisColors.mutedFg,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 4),
        ],
        Text(
          heading,
          style: GoogleFonts.playfairDisplay(
            fontSize: headingSize,
            fontStyle: FontStyle.italic,
            fontWeight: FontWeight.w300,
            color: AliisColors.foreground,
          ),
        ),
        if (showAccentLine) ...[
          const SizedBox(height: 6),
          Container(
            width: 24,
            height: 2,
            color: AliisColors.primary,
          ),
        ],
      ],
    );
  }
}
```

- [ ] **Step 2: Crear bell_badge.dart**

```dart
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class BellBadge extends StatelessWidget {
  final int count;
  final VoidCallback onTap;

  const BellBadge({super.key, required this.count, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 36,
        height: 36,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            const Icon(
              Icons.notifications_outlined,
              color: AliisColors.foreground,
              size: 22,
            ),
            if (count > 0)
              Positioned(
                top: -2,
                right: -2,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: AliisColors.destructive,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      count > 9 ? '9+' : '$count',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 8,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
cd mobile && flutter analyze lib/shared/widgets/serif_heading.dart lib/shared/widgets/bell_badge.dart
```

Expected: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/shared/widgets/serif_heading.dart mobile/lib/shared/widgets/bell_badge.dart
git commit -m "feat(ui): widgets SerifHeading y BellBadge"
```

---

## Task 3: Componentes reutilizables — AlertRow, AdherenceBar, ListItem

**Files:**
- Create: `mobile/lib/shared/widgets/alert_row.dart`
- Create: `mobile/lib/shared/widgets/adherence_bar.dart`
- Create: `mobile/lib/shared/widgets/list_item.dart`

- [ ] **Step 1: Crear alert_row.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AlertRow extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Color accentColor;

  const AlertRow({
    super.key,
    required this.title,
    this.subtitle,
    this.accentColor = AliisColors.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 2,
            height: subtitle != null ? 38 : 20,
            color: accentColor,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AliisColors.foreground,
                  )),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(subtitle!,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AliisColors.mutedFg,
                    )),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Crear adherence_bar.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AdherenceBar extends StatelessWidget {
  final String label;
  final int percent;
  final String? sublabel;

  const AdherenceBar({
    super.key,
    required this.label,
    required this.percent,
    this.sublabel,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AliisColors.foreground,
              )),
            const Spacer(),
            Text('$percent%',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AliisColors.primary,
              )),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percent / 100,
            backgroundColor: AliisColors.border,
            valueColor: const AlwaysStoppedAnimation(AliisColors.primary),
            minHeight: 4,
          ),
        ),
        if (sublabel != null) ...[
          const SizedBox(height: 4),
          Text(sublabel!,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: AliisColors.mutedFg,
            )),
        ],
      ],
    );
  }
}
```

- [ ] **Step 3: Crear list_item.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class ListItem extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const ListItem({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: const BoxDecoration(
          border: Border(
            bottom: BorderSide(color: AliisColors.border),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    )),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AliisColors.mutedFg,
                      )),
                  ],
                ],
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Verificar**

```bash
cd mobile && flutter analyze lib/shared/widgets/alert_row.dart lib/shared/widgets/adherence_bar.dart lib/shared/widgets/list_item.dart
```

Expected: `No issues found!`

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/shared/widgets/alert_row.dart mobile/lib/shared/widgets/adherence_bar.dart mobile/lib/shared/widgets/list_item.dart
git commit -m "feat(ui): widgets AlertRow, AdherenceBar, ListItem"
```

---

## Task 4: Componente AliisSignalCard

**Files:**
- Create: `mobile/lib/shared/widgets/aliis_signal_card.dart`

La `AliisSignalCard` es la única superficie con fondo de color fuerte en toda la app. Fondo `#14606E`, texto blanco, eyebrow monospace, pills blancos.

- [ ] **Step 1: Crear aliis_signal_card.dart**

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';

class AliisSignalCard extends StatelessWidget {
  final String eyebrow;
  final String body;
  final List<String> pills;

  const AliisSignalCard({
    super.key,
    required this.body,
    this.eyebrow = 'SEÑAL ALIIS DEL DÍA',
    this.pills = const [],
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AliisColors.deepTeal,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            eyebrow,
            style: GoogleFonts.robotoMono(
              fontSize: 9,
              color: Colors.white.withValues(alpha: 0.7),
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: Colors.white,
              height: 1.5,
            ),
          ),
          if (pills.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: pills.map((p) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                ),
                child: Text(p,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  )),
              )).toList(),
            ),
          ],
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/shared/widgets/aliis_signal_card.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/shared/widgets/aliis_signal_card.dart
git commit -m "feat(ui): widget AliisSignalCard — superficie teal oscuro con pills blancos"
```

---

## Task 5: GlassBottomNav — nav flotante iOS-26

**Files:**
- Create: `mobile/lib/shared/widgets/glass_bottom_nav.dart`
- Modify: `mobile/lib/shared/widgets/shell_scaffold.dart`

El nav actual es un `BottomNavigationBar` estándar pegado al borde. El nuevo es un pill flotante con `ClipRRect`, `BackdropFilter`, shadow, y dot indicator bajo el tab activo. El FAB central (✦) sube −8px sobre el nav.

La estructura de tabs cambia de `[Inicio, Packs, FAB, Alertas, Perfil]` a `[Inicio, Expediente, FAB, Medicación, Perfil]`. Los índices de los shells branches en el router se actualizarán en la Task 9.

- [ ] **Step 1: Crear glass_bottom_nav.dart**

```dart
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme.dart';

class GlassBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onAliisPressed;
  final int alertCount;

  const GlassBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onAliisPressed,
    this.alertCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 14,
      left: 14,
      right: 14,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(36),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.88),
              borderRadius: BorderRadius.circular(36),
              border: Border.all(
                color: Colors.black.withValues(alpha: 0.08),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 32,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavTab(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Inicio',
                  index: 0,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(0),
                ),
                _NavTab(
                  icon: Icons.folder_outlined,
                  activeIcon: Icons.folder_rounded,
                  label: 'Expediente',
                  index: 1,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(1),
                ),
                // FAB central
                _FabButton(onPressed: onAliisPressed),
                _NavTab(
                  icon: Icons.medication_outlined,
                  activeIcon: Icons.medication_rounded,
                  label: 'Medicación',
                  index: 2,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(2),
                ),
                _NavTab(
                  icon: Icons.person_outline,
                  activeIcon: Icons.person_rounded,
                  label: 'Perfil',
                  index: 3,
                  currentIndex: currentIndex,
                  onTap: () => onTabSelected(3),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavTab extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final VoidCallback onTap;

  const _NavTab({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final color = isActive ? AliisColors.primary : const Color(0xFFBBBBBB);

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isActive ? activeIcon : icon, color: color, size: 22)
              .animate(target: isActive ? 1 : 0)
              .scaleXY(begin: 1, end: 1.12, duration: 150.ms),
            const SizedBox(height: 4),
            if (isActive)
              Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AliisColors.primary,
                  shape: BoxShape.circle,
                ),
              )
            else
              const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}

class _FabButton extends StatelessWidget {
  final VoidCallback onPressed;
  const _FabButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Transform.translate(
        offset: const Offset(0, -8),
        child: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: AliisColors.foreground,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: Text('✦',
              style: TextStyle(color: Colors.white, fontSize: 16)),
          ),
        ).animate(onPlay: (c) => c.repeat(reverse: true))
          .scaleXY(begin: 1, end: 1.04, duration: 2000.ms, curve: Curves.easeInOut),
      ),
    );
  }
}
```

- [ ] **Step 2: Reemplazar shell_scaffold.dart**

El shell scaffold ahora usa `Stack` para que el nav flote sobre el contenido. El body necesita padding inferior de `78px` (64 nav + 14 bottom) para que el contenido no quede tapado.

```dart
import 'package:flutter/material.dart';
import '../../features/aliis/aliis_sheet.dart';
import 'glass_bottom_nav.dart';

class ShellScaffold extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final ValueChanged<int> onTabSelected;

  const ShellScaffold({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned.fill(
            bottom: 78,
            child: child,
          ),
          GlassBottomNav(
            currentIndex: currentIndex,
            onTabSelected: onTabSelected,
            onAliisPressed: () => AliisSheet.show(context),
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
cd mobile && flutter analyze lib/shared/widgets/glass_bottom_nav.dart lib/shared/widgets/shell_scaffold.dart
```

Expected: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/shared/widgets/glass_bottom_nav.dart mobile/lib/shared/widgets/shell_scaffold.dart
git commit -m "feat(ui): GlassBottomNav iOS-26 flotante y ShellScaffold con Stack"
```

---

## Task 6: Feature Medicación — provider y modelo

**Files:**
- Create: `mobile/lib/features/medicacion/medicacion_provider.dart`

El tab de Medicación necesita: lista de treatments activos del usuario, logs de adherencia del día (agrupados por turno), y función para marcar/desmarcar una toma.

Los treatments en Supabase tienen `frequency_label` (ej: "Mañana · 8:00 AM, Noche · 9:00 PM") pero para el MVP agruparemos por parsing simple de ese campo en 3 turnos: Mañana (antes de las 12), Tarde (12–18), Noche (18+).

- [ ] **Step 1: Crear medicacion_provider.dart**

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

enum Turno { manana, tarde, noche }

extension TurnoLabel on Turno {
  String get label {
    switch (this) {
      case Turno.manana: return 'Mañana';
      case Turno.tarde:  return 'Tarde';
      case Turno.noche:  return 'Noche';
    }
  }

  String get hora {
    switch (this) {
      case Turno.manana: return '8:00';
      case Turno.tarde:  return '14:00';
      case Turno.noche:  return '21:00';
    }
  }
}

class MedItem {
  final Treatment treatment;
  final Turno turno;
  final bool tomado;
  final String? horaRegistro;

  const MedItem({
    required this.treatment,
    required this.turno,
    required this.tomado,
    this.horaRegistro,
  });
}

class MedicacionData {
  final List<MedItem> items;
  final int totalHoy;
  final int tomadosHoy;

  const MedicacionData({
    required this.items,
    required this.totalHoy,
    required this.tomadosHoy,
  });

  int get percent => totalHoy > 0 ? ((tomadosHoy / totalHoy) * 100).round() : 0;

  List<MedItem> get manana => items.where((i) => i.turno == Turno.manana).toList();
  List<MedItem> get tarde  => items.where((i) => i.turno == Turno.tarde).toList();
  List<MedItem> get noche  => items.where((i) => i.turno == Turno.noche).toList();
}

final medicacionProvider = FutureProvider.autoDispose<MedicacionData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return const MedicacionData(items: [], totalHoy: 0, tomadosHoy: 0);

  final userId = session.user.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);

  final results = await Future.wait<dynamic>([
    supabase.from('treatments')
        .select('id, user_id, name, dose, frequency_label, active, updated_at')
        .eq('user_id', userId)
        .eq('active', true) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('medication, status, taken_date, created_at')
        .eq('user_id', userId)
        .eq('taken_date', today) as Future<dynamic>,
  ]);

  final treatments = (results[0] as List)
      .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
      .toList();
  final logs = results[1] as List<dynamic>;

  final takenMap = <String, String?>{};
  for (final log in logs) {
    final l = log as Map<String, dynamic>;
    if (l['status'] == 'taken') {
      takenMap[l['medication'] as String] = l['created_at'] as String?;
    }
  }

  final items = <MedItem>[];
  for (final t in treatments) {
    final turno = _parseTurno(t.frequencyLabel);
    final tomado = takenMap.containsKey(t.name);
    items.add(MedItem(
      treatment: t,
      turno: turno,
      tomado: tomado,
      horaRegistro: tomado ? takenMap[t.name] : null,
    ));
  }

  return MedicacionData(
    items: items,
    totalHoy: items.length,
    tomadosHoy: items.where((i) => i.tomado).length,
  );
});

Turno _parseTurno(String? frequencyLabel) {
  if (frequencyLabel == null) return Turno.manana;
  final lower = frequencyLabel.toLowerCase();
  if (lower.contains('tarde') || lower.contains('14') || lower.contains('pm')) {
    return Turno.tarde;
  }
  if (lower.contains('noche') || lower.contains('21') || lower.contains('9 pm')) {
    return Turno.noche;
  }
  return Turno.manana;
}

Future<void> toggleMedicacion(String medicationName, bool tomado) async {
  final userId = supabase.auth.currentUser!.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);

  if (tomado) {
    await supabase.from('adherence_logs').upsert({
      'user_id': userId,
      'medication': medicationName,
      'taken_date': today,
      'status': 'taken',
      'created_at': DateTime.now().toIso8601String(),
    }, onConflict: 'user_id,medication,taken_date');
  } else {
    await supabase.from('adherence_logs')
        .delete()
        .eq('user_id', userId)
        .eq('medication', medicationName)
        .eq('taken_date', today);
  }
}
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/features/medicacion/medicacion_provider.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/medicacion/medicacion_provider.dart
git commit -m "feat(medicacion): provider con treatments y adherence_logs del día"
```

---

## Task 7: MedCheckRow y MedicacionScreen

**Files:**
- Create: `mobile/lib/features/medicacion/widgets/med_check_row.dart`
- Create: `mobile/lib/features/medicacion/medicacion_screen.dart`

- [ ] **Step 1: Crear med_check_row.dart**

El checkbox tiene 3 estados visuales según el spec: tomado (relleno teal), pendiente (borde gris), futuro (borde punteado + opacidad 0.4). El "futuro" se determina si la hora del turno es posterior a la hora actual.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme.dart';
import '../medicacion_provider.dart';

class MedCheckRow extends StatefulWidget {
  final MedItem item;
  final VoidCallback onToggle;

  const MedCheckRow({super.key, required this.item, required this.onToggle});

  @override
  State<MedCheckRow> createState() => _MedCheckRowState();
}

class _MedCheckRowState extends State<MedCheckRow> {
  bool _loading = false;

  bool get _isFuturo {
    final now = DateTime.now();
    final turno = widget.item.turno;
    if (turno == Turno.noche) return now.hour < 21;
    if (turno == Turno.tarde) return now.hour < 14;
    return now.hour < 8;
  }

  @override
  Widget build(BuildContext context) {
    final tomado = widget.item.tomado;
    final futuro = !tomado && _isFuturo;

    return Opacity(
      opacity: futuro ? 0.4 : 1.0,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: AliisColors.border)),
        ),
        child: Row(
          children: [
            GestureDetector(
              onTap: futuro || _loading ? null : () async {
                setState(() => _loading = true);
                await Future(() => widget.onToggle());
                if (mounted) setState(() => _loading = false);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: tomado ? AliisColors.deepTeal : Colors.transparent,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(
                    color: tomado
                        ? AliisColors.deepTeal
                        : futuro
                            ? AliisColors.mutedFg
                            : const Color(0xFFE0E0E0),
                    width: futuro ? 1 : 1.5,
                    strokeAlign: BorderSide.strokeAlignCenter,
                  ),
                ),
                child: tomado
                    ? const Icon(Icons.check, color: Colors.white, size: 14)
                        .animate().fadeIn(duration: 200.ms)
                    : null,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.item.treatment.name,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AliisColors.foreground,
                    ),
                  ),
                  Text(
                    widget.item.treatment.dose ?? '',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AliisColors.mutedFg,
                    ),
                  ),
                ],
              ),
            ),
            if (tomado && widget.item.horaRegistro != null)
              Text(
                DateFormat('HH:mm').format(
                  DateTime.parse(widget.item.horaRegistro!).toLocal()),
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AliisColors.primary,
                  fontWeight: FontWeight.w500,
                ),
              )
            else if (!tomado && !futuro)
              Text('Pendiente',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AliisColors.mutedFg,
                )),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Crear medicacion_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/adherence_bar.dart';
import 'medicacion_provider.dart';
import 'widgets/med_check_row.dart';

class MedicacionScreen extends ConsumerWidget {
  const MedicacionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final medAsync = ref.watch(medicacionProvider);
    final fecha = DateFormat("d 'de' MMMM", 'es').format(DateTime.now()).toUpperCase();

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(medicacionProvider),
          child: medAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando medicación',
                style: GoogleFonts.inter(color: AliisColors.mutedFg))),
            data: (data) => ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              children: [
                SerifHeading(
                  eyebrow: fecha,
                  heading: 'Medicación',
                ),
                const SizedBox(height: 20),
                AdherenceBar(
                  label: 'Adherencia de hoy',
                  percent: data.percent,
                  sublabel: '${data.tomadosHoy} de ${data.totalHoy} tomas registradas',
                ),
                const SizedBox(height: 24),
                if (data.manana.isNotEmpty) ...[
                  _TurnoHeader(label: 'Mañana', hora: '8:00'),
                  ...data.manana.map((item) => MedCheckRow(
                    item: item,
                    onToggle: () async {
                      await toggleMedicacion(item.treatment.name, !item.tomado);
                      ref.invalidate(medicacionProvider);
                    },
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.tarde.isNotEmpty) ...[
                  _TurnoHeader(label: 'Tarde', hora: '14:00'),
                  ...data.tarde.map((item) => MedCheckRow(
                    item: item,
                    onToggle: () async {
                      await toggleMedicacion(item.treatment.name, !item.tomado);
                      ref.invalidate(medicacionProvider);
                    },
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.noche.isNotEmpty) ...[
                  _TurnoHeader(label: 'Noche', hora: '21:00'),
                  ...data.noche.map((item) => MedCheckRow(
                    item: item,
                    onToggle: () async {
                      await toggleMedicacion(item.treatment.name, !item.tomado);
                      ref.invalidate(medicacionProvider);
                    },
                  )),
                  const SizedBox(height: 20),
                ],
                if (data.items.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 40),
                      child: Text('Sin tratamientos activos',
                        style: GoogleFonts.inter(color: AliisColors.mutedFg)),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TurnoHeader extends StatelessWidget {
  final String label;
  final String hora;
  const _TurnoHeader({required this.label, required this.hora});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text('${label.toUpperCase()} · $hora',
            style: GoogleFonts.robotoMono(
              fontSize: 9,
              color: AliisColors.mutedFg,
              letterSpacing: 1.5,
            )),
        ],
      ),
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
cd mobile && flutter analyze lib/features/medicacion/
```

Expected: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/medicacion/
git commit -m "feat(medicacion): MedCheckRow con animación + MedicacionScreen por turno"
```

---

## Task 8: Rediseño HomeScreen — Editorial + BellBadge + secciones

**Files:**
- Modify: `mobile/lib/features/home/home_provider.dart`
- Modify: `mobile/lib/features/home/home_screen.dart`

El HomeScreen actual tiene un header sencillo y 3 widgets. El nuevo tiene: header con BellBadge, AliisSignalCard, AdherenceBar, AlertRow list, ListItem vitales, ListItem cita, ListItem pack activo.

- [ ] **Step 1: Añadir insights list a HomeData en home_provider.dart**

Añadir campo `insights` (lista de strings) parseado de `aliis_insights`. El campo ya existe en la query — solo hay que extraer más contenido.

Reemplazar la clase `HomeData` y el final del provider:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

class HomeData {
  final String? userName;
  final String? nextAppointment;
  final List<Treatment> treatments;
  final Set<String> takenToday;
  final bool hasActiveAlert;
  final String? alertBody;
  final List<String> insights;
  final int adherencia14d;
  final int diasRegistrados30d;

  const HomeData({
    this.userName,
    this.nextAppointment,
    required this.treatments,
    required this.takenToday,
    required this.hasActiveAlert,
    this.alertBody,
    required this.insights,
    required this.adherencia14d,
    required this.diasRegistrados30d,
  });

  bool get allTakenToday =>
      treatments.isNotEmpty &&
      treatments.every((t) => takenToday.contains(t.name));
}

final homeProvider = FutureProvider.autoDispose<HomeData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return const HomeData(
    treatments: [], takenToday: {}, hasActiveAlert: false,
    insights: [], adherencia14d: 0, diasRegistrados30d: 0,
  );

  final userId = session.user.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);
  final since14 = DateTime.now().subtract(const Duration(days: 14))
      .toIso8601String().substring(0, 10);
  final since30 = DateTime.now().subtract(const Duration(days: 30))
      .toIso8601String();

  final results = await Future.wait<dynamic>([
    supabase.from('profiles')
        .select('name, next_appointment')
        .eq('id', userId)
        .single() as Future<dynamic>,
    supabase.from('treatments')
        .select('id, user_id, name, dose, frequency_label, active, updated_at')
        .eq('user_id', userId)
        .eq('active', true) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('medication, status')
        .eq('user_id', userId)
        .eq('taken_date', today) as Future<dynamic>,
    supabase.from('adherence_logs')
        .select('status')
        .eq('user_id', userId)
        .gte('taken_date', since14) as Future<dynamic>,
    supabase.from('symptom_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', since30) as Future<dynamic>,
    supabase.from('aliis_insights')
        .select('content')
        .eq('user_id', userId)
        .eq('type', 'patient_summary')
        .order('generated_at', ascending: false)
        .limit(1)
        .maybeSingle() as Future<dynamic>,
  ]);

  final profile = results[0] as Map<String, dynamic>?;
  final treatments = (results[1] as List)
      .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
      .toList();
  final todayLogs = results[2] as List;
  final logs14 = results[3] as List;
  final logs30 = results[4] as List;
  final insight = results[5] as Map<String, dynamic>?;

  final takenToday = todayLogs
      .where((l) => (l as Map<String, dynamic>)['status'] == 'taken')
      .map((l) => (l as Map<String, dynamic>)['medication'] as String)
      .toSet();

  final total14 = logs14.length;
  final taken14 = logs14
      .where((l) => (l as Map<String, dynamic>)['status'] == 'taken').length;
  final adherencia14d = total14 > 0
      ? ((taken14 / total14) * 100).round()
      : 0;

  final dias = logs30
      .map((l) => (l as Map<String, dynamic>)['logged_at'].toString().substring(0, 10))
      .toSet()
      .length;

  String? alertBody;
  bool hasActiveAlert = false;
  final insights = <String>[];

  if (insight != null) {
    final content = insight['content'];
    final parsed = content is String
        ? <String, dynamic>{}
        : content as Map<String, dynamic>;
    final patron = parsed['patron_reciente'] as String?;
    if (patron != null) {
      hasActiveAlert = true;
      alertBody = patron;
      insights.add(patron);
    }
    final recomendacion = parsed['recomendacion'] as String?;
    if (recomendacion != null) insights.add(recomendacion);
  }

  return HomeData(
    userName: profile?['name'] as String?,
    nextAppointment: profile?['next_appointment'] as String?,
    treatments: treatments,
    takenToday: takenToday,
    hasActiveAlert: hasActiveAlert,
    alertBody: alertBody,
    insights: insights,
    adherencia14d: adherencia14d,
    diasRegistrados30d: dias,
  );
});
```

- [ ] **Step 2: Reemplazar home_screen.dart completo**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/bell_badge.dart';
import '../../shared/widgets/aliis_signal_card.dart';
import '../../shared/widgets/alert_row.dart';
import '../../shared/widgets/adherence_bar.dart';
import '../../shared/widgets/list_item.dart';
import '../alertas/alertas_provider.dart';
import 'home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);
    final alertasAsync = ref.watch(alertasProvider);
    final now = DateTime.now();
    final fecha = DateFormat("EEEE d 'de' MMMM", 'es').format(now).toUpperCase();
    final greeting = _greeting(now.hour);

    final alertCount = alertasAsync.valueOrNull
        ?.where((n) => !n.read).length ?? 0;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(homeProvider);
            ref.invalidate(alertasProvider);
          },
          child: homeAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando datos',
                style: GoogleFonts.inter(color: AliisColors.mutedFg))),
            data: (data) => ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              children: [
                // Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: SerifHeading(
                        eyebrow: fecha,
                        heading: data.userName != null
                            ? '$greeting, ${data.userName}'
                            : greeting,
                      ),
                    ),
                    const SizedBox(width: 12),
                    BellBadge(
                      count: alertCount,
                      onTap: () => context.push('/alertas'),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 1. Señal Aliis del día
                if (data.alertBody != null) ...[
                  AliisSignalCard(body: data.alertBody!),
                  const SizedBox(height: 20),
                ],

                // 2. Adherencia hoy
                if (data.treatments.isNotEmpty) ...[
                  AdherenceBar(
                    label: 'Adherencia hoy',
                    percent: data.adherencia14d,
                    sublabel: data.treatments
                            .where((t) => !data.takenToday.contains(t.name))
                            .map((t) => t.name)
                            .take(1)
                            .map((n) => 'Pendiente: $n')
                            .firstOrNull,
                  ),
                  const SizedBox(height: 20),
                ],

                // 3. Alertas/insights de Aliis
                if (data.insights.length > 1) ...[
                  Container(
                    decoration: const BoxDecoration(
                      border: Border(top: BorderSide(color: AliisColors.border)),
                    ),
                    child: Column(
                      children: data.insights.skip(1).map((ins) =>
                        AlertRow(title: ins, accentColor: AliisColors.primary)
                      ).toList(),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // 4. Vitales recientes — grid 2x2
                _VitalesSection(data: data),
                const SizedBox(height: 20),

                // 5. Próxima cita
                if (data.nextAppointment != null)
                  ListItem(
                    title: 'Próxima cita',
                    subtitle: data.nextAppointment,
                    trailing: Text('Preparar preguntas →',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AliisColors.primary,
                      )),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _greeting(int hour) {
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}

class _VitalesSection extends StatelessWidget {
  final HomeData data;
  const _VitalesSection({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AliisColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text('VITALES RECIENTES',
              style: GoogleFonts.robotoMono(
                fontSize: 9,
                color: AliisColors.mutedFg,
                letterSpacing: 1.5,
              )),
          ),
          Row(
            children: [
              _VitalCell(
                label: 'Días registrados',
                value: '${data.diasRegistrados30d}',
                unit: '/30d',
              ),
              Container(width: 1, height: 48, color: AliisColors.border),
              _VitalCell(
                label: 'Adherencia 14d',
                value: '${data.adherencia14d}',
                unit: '%',
              ),
            ],
          ),
          const Divider(height: 1, color: AliisColors.border),
        ],
      ),
    );
  }
}

class _VitalCell extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  const _VitalCell({required this.label, required this.value, required this.unit});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 10,
                color: AliisColors.mutedFg,
              )),
            const SizedBox(height: 4),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(value,
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AliisColors.foreground,
                  )),
                const SizedBox(width: 2),
                Text(unit,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AliisColors.mutedFg,
                  )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
cd mobile && flutter analyze lib/features/home/
```

Expected: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/home/
git commit -m "feat(home): header Editorial + BellBadge + AliisSignalCard + secciones"
```

---

## Task 9: Router — nueva estructura de tabs y ruta /alertas standalone

**Files:**
- Modify: `mobile/lib/core/router.dart`

Los branches del shell cambian: índice 0=Inicio, 1=Expediente (path `/expediente`), 2=Medicación (path `/medicacion`), 3=Perfil. Alertas pasa a ser una ruta normal `/alertas` accesible con `context.push('/alertas')`.

- [ ] **Step 1: Reemplazar router.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/diario/diario_screen.dart';
import '../features/diario/registro_wizard.dart';
import '../features/home/home_screen.dart';
import '../features/medicacion/medicacion_screen.dart';
import '../features/alertas/alertas_screen.dart';
import '../features/perfil/perfil_screen.dart';
import '../shared/widgets/shell_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = _SessionListenable(ref);

  return GoRouter(
    initialLocation: '/inicio',
    refreshListenable: listenable,
    redirect: (context, state) {
      final sessionAsync = ref.read(sessionProvider);
      if (sessionAsync.isLoading) return null;

      final isAuth = sessionAsync.valueOrNull != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isAuth && !isLoginRoute) return '/login';
      if (isAuth && isLoginRoute) return '/inicio';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      // Alertas como pantalla standalone (accesible desde BellBadge)
      GoRoute(
        path: '/alertas',
        builder: (_, __) => const AlertasScreen(),
      ),
      // Wizard de registro (accesible desde Expediente)
      GoRoute(
        path: '/expediente/registro',
        builder: (_, __) => const RegistroWizard(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => ShellScaffold(
          currentIndex: shell.currentIndex,
          onTabSelected: shell.goBranch,
          child: shell,
        ),
        branches: [
          // 0: Inicio
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/inicio',
              builder: (_, __) => const HomeScreen(),
            ),
          ]),
          // 1: Expediente (antes Diario/Packs)
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/expediente',
              builder: (_, __) => const DiarioScreen(),
            ),
          ]),
          // 2: Medicación (nuevo tab)
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/medicacion',
              builder: (_, __) => const MedicacionScreen(),
            ),
          ]),
          // 3: Perfil
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/perfil',
              builder: (_, __) => const PerfilScreen(),
            ),
          ]),
        ],
      ),
    ],
  );
});

class _SessionListenable extends ChangeNotifier {
  _SessionListenable(Ref ref) {
    ref.listen(sessionProvider, (_, __) => notifyListeners());
  }
}
```

- [ ] **Step 2: Actualizar DiarioScreen — cambiar push de registro**

En `mobile/lib/features/diario/diario_screen.dart`, el botón "+ Nuevo" usa `context.push('/diario/registro')`. Cambiar a `/expediente/registro`:

```dart
// Línea del push: cambiar de
onPressed: () => context.push('/diario/registro'),
// a
onPressed: () => context.push('/expediente/registro'),
```

- [ ] **Step 3: Actualizar home_screen.dart — push alertas**

Verificar que `context.push('/alertas')` ya está correcto en el `BellBadge.onTap` (lo pusimos en Task 8). No requiere cambio.

- [ ] **Step 4: Verificar**

```bash
cd mobile && flutter analyze lib/core/router.dart lib/features/diario/diario_screen.dart
```

Expected: `No issues found!`

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/core/router.dart mobile/lib/features/diario/diario_screen.dart
git commit -m "feat(router): tabs Inicio/Expediente/Medicación/Perfil — alertas standalone"
```

---

## Task 10: Rediseño DiarioScreen (Expediente) — estilo Editorial

**Files:**
- Modify: `mobile/lib/features/diario/diario_screen.dart`

El DiarioScreen pasa a ser la pantalla "Expediente". Nuevo header con SerifHeading + botón "+ Nuevo" pill oscuro. Los registros se muestran como `ListItem` con separadores en lugar de cards con background gris.

- [ ] **Step 1: Reemplazar diario_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/models/symptom_log.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/list_item.dart';
import 'diario_provider.dart';

class DiarioScreen extends ConsumerWidget {
  const DiarioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historialAsync = ref.watch(diarioHistorialProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(diarioHistorialProvider),
          child: CustomScrollView(
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                sliver: SliverToBoxAdapter(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Expanded(
                        child: SerifHeading(
                          eyebrow: 'MI DIARIO',
                          heading: 'Registros',
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.push('/expediente/registro'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: AliisColors.foreground,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text('+ Nuevo',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            )),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
              historialAsync.when(
                loading: () => const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator())),
                error: (e, _) => const SliverFillRemaining(
                  child: Center(child: Text('Error cargando historial'))),
                data: (logs) => logs.isEmpty
                  ? SliverFillRemaining(
                      child: Center(
                        child: Text('Sin registros aún',
                          style: GoogleFonts.inter(
                            color: AliisColors.mutedFg))))
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _RegistroItem(log: logs[i]),
                          childCount: logs.length,
                        ),
                      ),
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RegistroItem extends StatelessWidget {
  final SymptomLog log;
  const _RegistroItem({required this.log});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('EEE d MMM · HH:mm', 'es').format(log.loggedAt);
    final vitalesStr = [
      if (log.glucose != null) 'Glucosa: ${log.glucose} mg/dL',
      if (log.bpSystolic != null) 'TA: ${log.bpSystolic}/${log.bpDiastolic}',
      if (log.heartRate != null) 'FC: ${log.heartRate} lpm',
    ].join(' · ');

    return ListItem(
      title: fecha,
      subtitle: vitalesStr.isNotEmpty ? vitalesStr : log.note,
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AliisColors.border,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          log.note != null && log.note!.isNotEmpty ? 'Completo' : 'Parcial',
          style: GoogleFonts.inter(
            fontSize: 9,
            color: AliisColors.mutedFg,
            fontWeight: FontWeight.w600,
          )),
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/features/diario/diario_screen.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/diario/diario_screen.dart
git commit -m "feat(expediente): header Editorial + registros como ListItems con separadores"
```

---

## Task 11: Rediseño PerfilScreen — estilo Editorial

**Files:**
- Modify: `mobile/lib/features/perfil/perfil_screen.dart`

Las cards grises con fondo pasan a ser `ListItem` con separadores. El header usa `SerifHeading`.

- [ ] **Step 1: Reemplazar perfil_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/list_item.dart';
import '../auth/auth_provider.dart';
import 'perfil_provider.dart';
import 'widgets/tratamiento_form.dart';
import 'widgets/tratamiento_tile.dart';

class PerfilScreen extends ConsumerWidget {
  const PerfilScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final perfilAsync = ref.watch(perfilProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(perfilProvider),
          child: perfilAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando perfil',
                style: GoogleFonts.inter(color: AliisColors.mutedFg))),
            data: (data) => ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
              children: [
                // Header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: SerifHeading(
                        eyebrow: 'MI CUENTA',
                        heading: data.name ?? 'Tu perfil',
                      ),
                    ),
                    if (data.plan == 'pro')
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AliisColors.deepTeal,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('PRO',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 1,
                          )),
                      ),
                  ],
                ),
                const SizedBox(height: 24),

                // Tratamientos
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TRATAMIENTOS ACTIVOS',
                      style: GoogleFonts.robotoMono(
                        fontSize: 9,
                        color: AliisColors.mutedFg,
                        letterSpacing: 1.5,
                      )),
                    GestureDetector(
                      onTap: () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor:
                            Theme.of(context).scaffoldBackgroundColor,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(20))),
                        builder: (_) => const TratamientoForm(),
                      ),
                      child: Text('+ Añadir',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AliisColors.primary,
                          fontWeight: FontWeight.w500,
                        )),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (data.treatments.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Text('Sin tratamientos activos',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedFg, fontSize: 13)),
                  )
                else
                  ...data.treatments.map((t) => TratamientoTile(treatment: t)),
                const SizedBox(height: 24),

                // Cuenta
                Text('CUENTA',
                  style: GoogleFonts.robotoMono(
                    fontSize: 9,
                    color: AliisColors.mutedFg,
                    letterSpacing: 1.5,
                  )),
                const SizedBox(height: 8),

                if (data.plan == 'pro')
                  ListItem(
                    title: 'Plan Pro',
                    subtitle: 'Gestionar suscripción',
                    trailing: const Icon(Icons.chevron_right,
                      color: AliisColors.mutedFg, size: 18),
                    onTap: () => launchUrl(
                      Uri.parse('https://aliis.app/portal'),
                      mode: LaunchMode.externalApplication),
                  ),

                ListItem(
                  title: 'Exportar datos',
                  subtitle: 'Descargar historial (GDPR)',
                  trailing: const Icon(Icons.download_outlined,
                    color: AliisColors.mutedFg, size: 18),
                  onTap: () {},
                ),

                ListItem(
                  title: 'Cerrar sesión',
                  trailing: const Icon(Icons.logout,
                    color: AliisColors.destructive, size: 18),
                  onTap: () => ref.read(authProvider).signOut(),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/features/perfil/perfil_screen.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/perfil/perfil_screen.dart
git commit -m "feat(perfil): header Editorial + secciones con ListItems y separadores"
```

---

## Task 12: Rediseño AliisSheet — Playfair header + context strip + chat UI

**Files:**
- Modify: `mobile/lib/features/aliis/aliis_sheet.dart`

El sheet actual solo muestra "Chat próximamente". El nuevo tiene: handle bar, heading Playfair, subtitle muted, context strip con vitales inline, área de mensajes placeholder con input flotante estilizado.

- [ ] **Step 1: Reemplazar aliis_sheet.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../home/home_provider.dart';

class AliisSheet extends ConsumerWidget {
  const AliisSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ProviderScope(
        parent: ProviderScope.containerOf(ctx),
        child: const AliisSheet(),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle
            const SizedBox(height: 12),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AliisColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Aliis',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 22,
                      fontStyle: FontStyle.italic,
                      fontWeight: FontWeight.w300,
                      color: AliisColors.foreground,
                    )),
                  Text('Tu acompañante de salud',
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      color: AliisColors.mutedFg,
                    )),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Context strip
            homeAsync.maybeWhen(
              data: (data) => _ContextStrip(data: data),
              orElse: () => const SizedBox.shrink(),
            ),

            const Divider(height: 1, color: AliisColors.border),
            const SizedBox(height: 8),

            // Mensajes
            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                children: [
                  _AliisBubble(
                    text: '¡Hola! Soy Aliis. ¿En qué puedo ayudarte hoy?',
                  ),
                ],
              ),
            ),

            // Input flotante
            _ChatInput(onSend: (_) {}),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _ContextStrip extends StatelessWidget {
  final HomeData data;
  const _ContextStrip({required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: IntrinsicHeight(
        child: Row(
          children: [
            _ContextCell(label: 'Adherencia', value: '${data.adherencia14d}%'),
            Container(width: 1, color: AliisColors.border),
            _ContextCell(
              label: 'Registros',
              value: '${data.diasRegistrados30d}d'),
            Container(width: 1, color: AliisColors.border),
            _ContextCell(
              label: 'Tratamientos',
              value: '${data.treatments.length}'),
          ],
        ),
      ),
    );
  }
}

class _ContextCell extends StatelessWidget {
  final String label;
  final String value;
  const _ContextCell({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Column(
          children: [
            Text(value,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AliisColors.primary,
              )),
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 9,
                color: AliisColors.mutedFg,
              )),
          ],
        ),
      ),
    );
  }
}

class _AliisBubble extends StatelessWidget {
  final String text;
  const _AliisBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF7F7F7),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(14),
            topRight: Radius.circular(14),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(14),
          ),
        ),
        child: Text(text,
          style: GoogleFonts.inter(
            fontSize: 13,
            color: AliisColors.foreground,
            height: 1.5,
          )),
      ),
    );
  }
}

class _ChatInput extends StatefulWidget {
  final ValueChanged<String> onSend;
  const _ChatInput({required this.onSend});

  @override
  State<_ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<_ChatInput> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFE8E8E8)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Escribe un mensaje...',
                  hintStyle: GoogleFonts.inter(
                    fontSize: 13, color: AliisColors.mutedFg),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.inter(fontSize: 13),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () {
              if (_controller.text.trim().isNotEmpty) {
                widget.onSend(_controller.text.trim());
                _controller.clear();
              }
            },
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AliisColors.deepTeal,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AliisColors.primary.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(Icons.arrow_upward,
                color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/features/aliis/aliis_sheet.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/aliis/aliis_sheet.dart
git commit -m "feat(chat): AliisSheet con header Playfair, context strip y chat UI"
```

---

## Task 13: Rediseño AlertasScreen — estilo Editorial

**Files:**
- Modify: `mobile/lib/features/alertas/alertas_screen.dart`

Alertas ahora es una pantalla standalone (push desde bell badge). Usa SerifHeading y AlertRow en lugar de tiles con cards.

- [ ] **Step 1: Reemplazar alertas_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../shared/widgets/serif_heading.dart';
import '../../shared/widgets/alert_row.dart';
import 'alertas_provider.dart';

class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: SerifHeading(
                      eyebrow: 'NOTIFICACIONES',
                      heading: 'Alertas',
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AliisColors.foreground),
                    onPressed: () => context.pop(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: alertasAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(
                  child: Text('Error cargando alertas',
                    style: GoogleFonts.inter(color: AliisColors.mutedFg))),
                data: (notifications) => notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.notifications_none_rounded,
                            size: 40, color: AliisColors.border),
                          const SizedBox(height: 12),
                          Text('Sin alertas por ahora',
                            style: GoogleFonts.inter(
                              color: AliisColors.mutedFg)),
                        ],
                      ))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: notifications.length,
                      itemBuilder: (ctx, i) {
                        final n = notifications[i];
                        return AlertRow(
                          title: n.title,
                          subtitle: n.body,
                          accentColor: n.type == 'alert'
                              ? AliisColors.destructive
                              : AliisColors.primary,
                        );
                      },
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Asegurar que AppNotification tiene campos `title`, `body`, `type`, `read`**

Leer `mobile/lib/shared/models/app_notification.dart` y verificar que los campos existen. Si el modelo usa nombres distintos, ajustar las referencias en el paso anterior al nombre real del modelo.

```bash
cat mobile/lib/shared/models/app_notification.dart
```

- [ ] **Step 3: Verificar**

```bash
cd mobile && flutter analyze lib/features/alertas/alertas_screen.dart
```

Expected: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/alertas/alertas_screen.dart
git commit -m "feat(alertas): pantalla standalone con SerifHeading y AlertRows"
```

---

## Task 14: Animaciones — progress bars con flutter_animate

**Files:**
- Modify: `mobile/lib/shared/widgets/adherence_bar.dart`

El spec pide animación de fill en progress bars al cargar (600ms ease-out). `flutter_animate` ya es dependencia del proyecto.

- [ ] **Step 1: Añadir animación a AdherenceBar**

Reemplazar el `LinearProgressIndicator` estático por uno animado con `TweenAnimationBuilder`:

```dart
// Dentro de AdherenceBar.build, reemplazar el LinearProgressIndicator por:
TweenAnimationBuilder<double>(
  tween: Tween(begin: 0, end: percent / 100),
  duration: const Duration(milliseconds: 600),
  curve: Curves.easeOut,
  builder: (_, value, __) => ClipRRect(
    borderRadius: BorderRadius.circular(4),
    child: LinearProgressIndicator(
      value: value,
      backgroundColor: AliisColors.border,
      valueColor: const AlwaysStoppedAnimation(AliisColors.primary),
      minHeight: 4,
    ),
  ),
),
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/shared/widgets/adherence_bar.dart
```

Expected: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/shared/widgets/adherence_bar.dart
git commit -m "feat(ui): progress bars con animación 600ms ease-out"
```

---

## Task 15: Verificación final — analyze y smoke test visual

**Files:** ninguno (verificación)

- [ ] **Step 1: Analyze completo**

```bash
cd mobile && flutter analyze lib/
```

Expected: `No issues found!` (0 errores, 0 warnings)

- [ ] **Step 2: Build verificación iOS simulator**

```bash
cd mobile && flutter build ios --simulator --debug 2>&1 | tail -20
```

Expected: `Build succeeded.`

- [ ] **Step 3: Smoke test en simulador**

```bash
cd mobile && flutter run -d "iPhone 16"
```

Verificar manualmente:
- [ ] Bottom nav es pill flotante con efecto glass
- [ ] FAB ✦ elevado sobre el nav
- [ ] Heading en Playfair Display italic
- [ ] Fondo blanco puro en todas las pantallas
- [ ] Tab Medicación muestra checklist por turno
- [ ] Checkbox toggle registra en Supabase
- [ ] Bell badge en Inicio abre pantalla Alertas
- [ ] Chat sheet se abre con header Playfair y context strip

- [ ] **Step 4: Commit final**

```bash
cd mobile && git add -A && git commit -m "chore: Flutter UI Redesign Editorial Minimal — Fase 2A → nuevo diseño completo"
```
