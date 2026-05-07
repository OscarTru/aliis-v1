# Flutter Fase 3A — Onboarding + Ingreso + Destilando + PackTOC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir las 4 pantallas del flujo de incorporación — Onboarding (3 slides post-login), Ingreso/Captura (texto/foto/voz), Destilando (loading animado mientras el backend genera el pack) y PackTOC (tabla de contenidos del pack con capítulos) — con datos reales del backend de Aliis y el estilo visual del Figma Make.

**Architecture:** Onboarding se muestra una sola vez tras el primer login (flag `onboarding_done` en `profiles`). Ingreso llama a `POST https://aliis.app/api/pack/generate` del backend Railway con el JWT de Supabase. Destilando hace polling al pack generado en Supabase (`packs` table) hasta que `status = 'ready'`. PackTOC reemplaza el `PackReader` actual con tabla de contenidos + lector por capítulo en sub-ruta.

**Tech Stack:** Flutter 3, Riverpod 2.6, GoRouter 14, google_fonts 6, http 1.2, Supabase Flutter, dart:async

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `mobile/lib/features/onboarding/onboarding_screen.dart` |
| Crear | `mobile/lib/features/ingreso/ingreso_screen.dart` |
| Crear | `mobile/lib/features/ingreso/ingreso_provider.dart` |
| Crear | `mobile/lib/features/packs/pack_toc_screen.dart` |
| Crear | `mobile/lib/features/packs/distilling_screen.dart` |
| Modificar | `mobile/lib/core/router.dart` — rutas `/onboarding`, `/ingreso`, `/distilling/:packId`, `/packs/:packId/toc` |
| Modificar | `mobile/lib/features/auth/auth_provider.dart` — detectar si `onboarding_done` es false |
| Modificar | `mobile/lib/features/packs/packs_provider.dart` — añadir `packStatusProvider` para polling |

---

## Colores y tipografía (referencia rápida)

```dart
// De mobile/lib/core/theme.dart — ya existen
AliisColors.foreground   // #272730 — botones primarios
AliisColors.deepTeal     // #14606E — texto itálico de acento
AliisColors.border       // #F0F0F0
AliisColors.mutedFg      // #999999

// Playfair Display — encabezados
GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w400, color: Color(0xFF0F0F0F))
// Italic accent dentro del heading:
TextSpan(text: 'el médico.', style: GoogleFonts.playfairDisplay(fontStyle: FontStyle.italic, color: AliisColors.deepTeal))

// Inter — cuerpo
GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, letterSpacing: 1.5, color: AliisColors.mutedFg)
```

---

## Task 1: Onboarding screen — 3 slides post-login

**Files:**
- Create: `mobile/lib/features/onboarding/onboarding_screen.dart`

### Contexto
Se muestra UNA sola vez al usuario nuevo, tras el primer login exitoso, antes de llegar a `/inicio`. El router lo redirige si `profiles.onboarding_done = false`. Al terminar el slide 3, hace `UPDATE profiles SET onboarding_done = true` y navega a `/inicio`.

El Figma tiene 3 slides con heading + bullets + botón "Continuar". El slide 1 tiene botón "Saltar".

- [ ] **Step 1: Crear el archivo**

```dart
// mobile/lib/features/onboarding/onboarding_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/supabase_client.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';

const _kSlides = [
  _Slide(
    heading: 'Le pides lo que te dieron en consulta.',
    headingItalic: 'Nada más.',
    sub: 'Tu receta, lo que te dijo el médico y lo que recordás. Aliis te lo explica con fuente abierta — PubMed, DOI, guías clínicas.',
    bullets: [
      _Bullet('Cada respuesta firmada', 'Siempre con referencia'),
      _Bullet('Sin diagnósticos, explica', 'Las decisiones son del médico'),
      _Bullet('Recuerda todo', 'Tu historial te acompaña'),
    ],
  ),
  _Slide(
    heading: 'Tu próxima consulta,',
    headingItalic: 'mejor preparada.',
    sub: 'Registrá síntomas, llevá el diario de cefaleas y llegá con preguntas listas. Aliis te recuerda qué preguntar el día antes.',
    bullets: [
      _Bullet('Diario de síntomas', 'Registrá cada episodio'),
      _Bullet('Recordatorios de consulta', 'Preguntas listas el día antes'),
      _Bullet('Adherencia al tratamiento', 'Tus tomas, siempre al día'),
    ],
  ),
  _Slide(
    heading: 'Tu historial médico,',
    headingItalic: 'siempre contigo.',
    sub: 'Compartí tu pack con tu médico, tu familia o quien elijas. Tú decides qué versión ven.',
    bullets: [
      _Bullet('Versión clínica', 'Para tu médico, con referencias'),
      _Bullet('Versión familiar', 'Amable, sin tecnicismos'),
      _Bullet('Privacidad total', 'Tus datos no se venden'),
    ],
  ),
];

class _Bullet {
  final String title;
  final String sub;
  const _Bullet(this.title, this.sub);
}

class _Slide {
  final String heading;
  final String headingItalic;
  final String sub;
  final List<_Bullet> bullets;
  const _Slide({
    required this.heading,
    required this.headingItalic,
    required this.sub,
    required this.bullets,
  });
}

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  bool _finishing = false;

  Future<void> _continue() async {
    if (_step < _kSlides.length - 1) {
      setState(() => _step++);
      return;
    }
    // Last slide → mark done and navigate
    setState(() => _finishing = true);
    final session = ref.read(sessionProvider).valueOrNull;
    if (session != null) {
      await supabase
          .from('profiles')
          .update({'onboarding_done': true})
          .eq('id', session.user.id);
    }
    if (mounted) context.go('/inicio');
  }

  void _skip() => context.go('/inicio');

  @override
  Widget build(BuildContext context) {
    final slide = _kSlides[_step];
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 32, 28, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Logo row
              Row(children: [
                Container(
                  width: 32, height: 32,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1B6B54),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.favorite_rounded, size: 16, color: Colors.white),
                ),
                const SizedBox(width: 8),
                Text('Aliis',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 20, color: const Color(0xFF1B6B54))),
              ]),
              const SizedBox(height: 28),

              // Step indicator
              Row(
                children: List.generate(_kSlides.length, (i) => Expanded(
                  flex: i == _step ? 2 : 1,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    height: 3,
                    margin: EdgeInsets.only(right: i < _kSlides.length - 1 ? 4 : 0),
                    decoration: BoxDecoration(
                      color: i == _step
                          ? const Color(0xFF1B6B54)
                          : const Color(0xFFE5E7EB),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                )),
              ),
              const SizedBox(height: 28),

              // Heading
              RichText(
                text: TextSpan(
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 26, fontWeight: FontWeight.w400,
                    color: const Color(0xFF0F0F0F), height: 1.2),
                  children: [
                    TextSpan(text: '${slide.heading}\n'),
                    TextSpan(
                      text: slide.headingItalic,
                      style: const TextStyle(
                        fontStyle: FontStyle.italic,
                        color: Color(0xFF1B6B54),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              Text(slide.sub,
                style: GoogleFonts.inter(
                  fontSize: 14, color: const Color(0xFF6B7280), height: 1.55)),
              const SizedBox(height: 28),

              // Bullets
              ...slide.bullets.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 20, height: 20,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1B6B54),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check, size: 12, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(b.title,
                          style: GoogleFonts.inter(
                            fontSize: 14, fontWeight: FontWeight.w500,
                            color: const Color(0xFF0F0F0F))),
                        Text(b.sub,
                          style: GoogleFonts.inter(
                            fontSize: 12, color: const Color(0xFF9CA3AF))),
                      ],
                    )),
                  ],
                ),
              )),

              const Spacer(),

              // CTA
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _finishing ? null : _continue,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AliisColors.foreground,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: _finishing
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Continuar',
                            style: GoogleFonts.inter(
                              fontSize: 15, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward_rounded, size: 18),
                        ],
                      ),
                ),
              ),

              if (_step == 0) ...[
                const SizedBox(height: 12),
                Center(
                  child: TextButton(
                    onPressed: _skip,
                    child: Text('Saltar',
                      style: GoogleFonts.inter(
                        fontSize: 13, color: const Color(0xFF9CA3AF))),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd /Users/oscar/Documents/Proyectos/Cerebros\ Esponjosos/Sitio/Aliis/mobile
flutter analyze lib/features/onboarding/onboarding_screen.dart
```

Esperado: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/onboarding/onboarding_screen.dart
git commit -m "feat(mobile): OnboardingScreen 3 slides Figma"
```

---

## Task 2: Detectar onboarding pendiente en el router

**Files:**
- Modify: `mobile/lib/core/router.dart`

### Contexto
El router necesita: (1) ruta `/onboarding`, (2) en el redirect, si el usuario está autenticado pero `profiles.onboarding_done = false`, mandarlo a `/onboarding` en lugar de `/inicio`.

La query de `onboarding_done` se hace una sola vez por sesión — se puede hacer dentro del redirect usando `supabase` directamente (no hace falta un provider separado para este flag).

- [ ] **Step 1: Añadir import y ruta**

En `mobile/lib/core/router.dart`, añadir el import y la ruta:

```dart
// Añadir al bloque de imports (arriba del todo):
import '../features/onboarding/onboarding_screen.dart';
import '../../core/supabase_client.dart'; // ya debe existir
```

Añadir esta ruta dentro del array `routes:` (antes del `StatefulShellRoute`):

```dart
GoRoute(
  path: '/onboarding',
  builder: (_, __) => const OnboardingScreen(),
),
```

- [ ] **Step 2: Actualizar el redirect para detectar onboarding_done**

Reemplazar el bloque `redirect:` existente con:

```dart
redirect: (context, state) async {
  final sessionAsync = ref.read(sessionProvider);
  if (sessionAsync.isLoading) return null;

  final session = sessionAsync.valueOrNull;
  final isAuth = session != null;
  final loc = state.matchedLocation;

  if (!isAuth) {
    return loc == '/login' ? null : '/login';
  }
  if (loc == '/login') {
    // Authenticated — check onboarding
    final profile = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', session.user.id)
        .maybeSingle();
    final done = profile?['onboarding_done'] as bool? ?? false;
    return done ? '/inicio' : '/onboarding';
  }
  if (loc == '/onboarding') return null; // allow
  return null;
},
```

> **Nota:** `redirect` acepta `FutureOr<String?>` en GoRouter 14, así que `async` funciona.

- [ ] **Step 3: Verificar**

```bash
flutter analyze lib/core/router.dart
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/core/router.dart
git commit -m "feat(mobile): redirect a /onboarding si onboarding_done=false"
```

---

## Task 3: IngresoScreen — captura texto/foto/voz

**Files:**
- Create: `mobile/lib/features/ingreso/ingreso_screen.dart`
- Create: `mobile/lib/features/ingreso/ingreso_provider.dart`

### Contexto
El usuario llega desde el botón "Nueva explicación" de Home o desde el `+` de la bottom nav. Hay 3 tabs: Texto (textarea), Foto (placeholder — cámara no implementada aún), Voz (placeholder). Solo el tab Texto es funcional en este plan. Al pulsar "Pedir explicación a Aliis", navega a `/distilling` pasando el texto como `extra`.

- [ ] **Step 1: Crear el provider**

```dart
// mobile/lib/features/ingreso/ingreso_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Tracks the current ingreso tab selection (0=texto, 1=foto, 2=voz)
final ingresoTabProvider = StateProvider.autoDispose<int>((_) => 0);

// Tracks the text input so it survives widget rebuilds
final ingresoTextProvider = StateProvider.autoDispose<String>((_) => '');
```

- [ ] **Step 2: Crear la pantalla**

```dart
// mobile/lib/features/ingreso/ingreso_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'ingreso_provider.dart';

const _kSamples = [
  'De migraña con aura. Indicaron topiramato 25mg durante 1 mes, luego subir a 50 mg. Sumatriptán 50 mg si sigue dolor. Control en 3 semanas.',
  'Epilepsia focal. Levetiracetam 500mg 2x día. Control EEG en 6 semanas.',
  'Esclerosis múltiple en brote. Metilprednisolona IV 1g/día x3 días.',
];

const _kConditions = [
  'Migraña', 'Epilepsia', 'Esclerosis múltiple',
  'Vértigo', 'Cefalea tensional', 'Parkinson',
];

const _kTabs = ['Texto', 'Foto', 'Voz'];

class IngresoScreen extends ConsumerStatefulWidget {
  const IngresoScreen({super.key});

  @override
  ConsumerState<IngresoScreen> createState() => _IngresoScreenState();
}

class _IngresoScreenState extends ConsumerState<IngresoScreen> {
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(
      text: ref.read(ingresoTextProvider));
    _ctrl.addListener(() {
      ref.read(ingresoTextProvider.notifier).state = _ctrl.text;
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _submit() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    context.push('/distilling', extra: text);
  }

  @override
  Widget build(BuildContext context) {
    final tab = ref.watch(ingresoTabProvider);
    final text = ref.watch(ingresoTextProvider);
    final canSubmit = tab != 0 || text.trim().isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: const Icon(Icons.close, size: 20, color: Color(0xFF6B7280)),
                  ),
                  const Spacer(),
                  Text('NUEVA EXPLICACIÓN',
                    style: GoogleFonts.inter(
                      fontSize: 11, letterSpacing: 1.2,
                      color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                  const Spacer(),
                  const SizedBox(width: 20),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFF0F0F0)),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Heading
                    RichText(
                      text: TextSpan(
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 24, fontWeight: FontWeight.w400,
                          color: const Color(0xFF0F0F0F), height: 1.2),
                        children: const [
                          TextSpan(text: '¿Qué te dijeron '),
                          TextSpan(
                            text: 'en consulta?',
                            style: TextStyle(
                              fontStyle: FontStyle.italic,
                              color: Color(0xFF1B6B54),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Tab selector
                    Row(
                      children: List.generate(_kTabs.length, (i) => Expanded(
                        child: GestureDetector(
                          onTap: () => ref.read(ingresoTabProvider.notifier).state = i,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                            height: 38,
                            decoration: BoxDecoration(
                              color: tab == i
                                  ? AliisColors.foreground
                                  : const Color(0xFFF3F4F6),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Center(
                              child: Text(_kTabs[i],
                                style: GoogleFonts.inter(
                                  fontSize: 13, fontWeight: FontWeight.w500,
                                  color: tab == i
                                      ? Colors.white
                                      : const Color(0xFF6B7280))),
                            ),
                          ),
                        ),
                      )),
                    ),
                    const SizedBox(height: 16),

                    // Tab content
                    if (tab == 0) ...[
                      Container(
                        constraints: const BoxConstraints(minHeight: 140),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8F8F8),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: TextField(
                          controller: _ctrl,
                          maxLines: null,
                          keyboardType: TextInputType.multiline,
                          style: GoogleFonts.inter(
                            fontSize: 14, color: const Color(0xFF0F0F0F), height: 1.55),
                          decoration: InputDecoration(
                            hintText: 'De migraña con aura. Topiramato 25mg...',
                            hintStyle: GoogleFonts.inter(
                              fontSize: 14, color: const Color(0xFFD1D5DB)),
                            contentPadding: const EdgeInsets.all(16),
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      if (text.isEmpty) ...[
                        const SizedBox(height: 16),
                        Text('PRUEBA CON ESTO',
                          style: GoogleFonts.inter(
                            fontSize: 10, letterSpacing: 1.2,
                            color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        ..._kSamples.map((s) => GestureDetector(
                          onTap: () {
                            _ctrl.text = s;
                            ref.read(ingresoTextProvider.notifier).state = s;
                          },
                          child: Container(
                            width: double.infinity,
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8F8F8),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text('${s.substring(0, 60)}...',
                              style: GoogleFonts.inter(
                                fontSize: 12, color: const Color(0xFF6B7280),
                                height: 1.4)),
                          ),
                        )),
                      ],
                    ],

                    if (tab == 1)
                      Container(
                        height: 180,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xFFE5E7EB), width: 2,
                            style: BorderStyle.solid),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.camera_alt_outlined,
                              size: 36, color: Color(0xFFD1D5DB)),
                            const SizedBox(height: 10),
                            Text('Foto de receta o indicación médica',
                              style: GoogleFonts.inter(
                                fontSize: 13, color: const Color(0xFF9CA3AF))),
                            const SizedBox(height: 12),
                            Text('Próximamente',
                              style: GoogleFonts.inter(
                                fontSize: 11, color: const Color(0xFF1B6B54))),
                          ],
                        ),
                      ),

                    if (tab == 2)
                      SizedBox(
                        height: 220,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            RichText(
                              textAlign: TextAlign.center,
                              text: TextSpan(
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 20, color: const Color(0xFF0F0F0F)),
                                children: const [
                                  TextSpan(text: 'Cuéntame qué te dijo '),
                                  TextSpan(
                                    text: 'el médico.',
                                    style: TextStyle(
                                      fontStyle: FontStyle.italic,
                                      color: Color(0xFF1B6B54),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            Container(
                              width: 72, height: 72,
                              decoration: const BoxDecoration(
                                color: Color(0xFF1B6B54),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.mic_rounded,
                                size: 30, color: Colors.white),
                            ),
                            const SizedBox(height: 10),
                            Text('Próximamente',
                              style: GoogleFonts.inter(
                                fontSize: 11, color: const Color(0xFF1B6B54))),
                          ],
                        ),
                      ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // Conditions strip
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('También conocido para:',
                    style: GoogleFonts.inter(
                      fontSize: 11, color: AliisColors.mutedFg)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6, runSpacing: 6,
                    children: _kConditions.map((c) => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(c,
                        style: GoogleFonts.inter(
                          fontSize: 11, color: const Color(0xFF6B7280))),
                    )).toList(),
                  ),
                ],
              ),
            ),

            // CTA button
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: canSubmit ? _submit : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AliisColors.foreground,
                    disabledBackgroundColor: AliisColors.foreground.withValues(alpha: 0.3),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Pedir explicación a Aliis',
                        style: GoogleFonts.inter(
                          fontSize: 15, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
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
flutter analyze lib/features/ingreso/
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/ingreso/
git commit -m "feat(mobile): IngresoScreen captura texto Figma"
```

---

## Task 4: DistillingScreen — loading animado mientras se genera el pack

**Files:**
- Create: `mobile/lib/features/packs/distilling_screen.dart`

### Contexto
Recibe el texto del diagnóstico como `GoRouterState.extra` (String). Llama a `POST https://aliis.app/api/pack/generate` con el JWT de Supabase. El endpoint pertenece al backend Railway. Mientras espera, muestra los 5 pasos animados. Cuando recibe el `packId` en la respuesta, navega a `/packs/:packId/toc`.

El endpoint requiere:
- `Authorization: Bearer <supabase-jwt>`
- Body: `{ "diagnostico": "...", "userPlan": "free" }`  — el backend verifica el plan en DB, pero hay que enviar el campo.
- Responde con `{ "packId": "uuid" }` cuando el pack está listo (puede tardar 10-30s).

- [ ] **Step 1: Crear la pantalla**

```dart
// mobile/lib/features/packs/distilling_screen.dart
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../../core/supabase_client.dart';
import '../../core/theme.dart';

const _kSteps = [
  'Analizando tu diagnóstico...',
  'Buscando en PubMed y DOI...',
  'Verificando referencias científicas...',
  'Personalizando para ti...',
  'Generando capítulos...',
];

const _kPackApiUrl = 'https://aliis.app/api/pack/generate';

class DistillingScreen extends ConsumerStatefulWidget {
  final String diagnostico;
  const DistillingScreen({super.key, required this.diagnostico});

  @override
  ConsumerState<DistillingScreen> createState() => _DistillingScreenState();
}

class _DistillingScreenState extends ConsumerState<DistillingScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  int _step = 0;
  double _progress = 0;
  bool _done = false;
  bool _error = false;
  String? _errorMsg;

  Timer? _stepTimer;
  Timer? _progressTimer;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _startAnimations();
    _generate();
  }

  void _startAnimations() {
    _stepTimer = Timer.periodic(const Duration(milliseconds: 800), (_) {
      if (!mounted) return;
      setState(() {
        if (_step < _kSteps.length - 1) _step++;
      });
    });
    _progressTimer = Timer.periodic(const Duration(milliseconds: 80), (_) {
      if (!mounted) return;
      setState(() {
        if (_progress < 90) _progress += 1.2; // stops at 90, jumps to 100 on done
      });
    });
  }

  Future<void> _generate() async {
    try {
      final session = supabase.auth.currentSession;
      if (session == null) throw Exception('Sin sesión');

      final resp = await http.post(
        Uri.parse(_kPackApiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${session.accessToken}',
        },
        body: jsonEncode({
          'diagnostico': widget.diagnostico,
          'userPlan': 'free', // backend verifica en DB — este campo es ignorado en seguridad
        }),
      ).timeout(const Duration(seconds: 60));

      if (!mounted) return;

      if (resp.statusCode == 200 || resp.statusCode == 201) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final packId = body['packId'] as String?;
        if (packId != null) {
          setState(() { _progress = 100; _done = true; });
          await Future.delayed(const Duration(milliseconds: 800));
          if (mounted) context.go('/packs/$packId/toc');
          return;
        }
      }

      // Error from server
      final body = jsonDecode(resp.body) as Map<String, dynamic>?;
      throw Exception(body?['error'] ?? 'Error generando el pack (${resp.statusCode})');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = true;
        _errorMsg = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _stepTimer?.cancel();
    _progressTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: _error ? _buildError() : _buildLoading(),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Pulsating logo
        AnimatedBuilder(
          animation: _pulseCtrl,
          builder: (_, __) => Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 80 + _pulseCtrl.value * 16,
                height: 80 + _pulseCtrl.value * 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF1B6B54)
                      .withValues(alpha: 0.08 * (1 - _pulseCtrl.value)),
                ),
              ),
              Container(
                width: 72, height: 72,
                decoration: const BoxDecoration(
                  color: Color(0xFF1B6B54),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.favorite_rounded,
                  size: 30, color: Colors.white),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),

        Text('DESTILANDO',
          style: GoogleFonts.inter(
            fontSize: 10, letterSpacing: 1.5,
            color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
        const SizedBox(height: 10),

        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: GoogleFonts.playfairDisplay(
              fontSize: 22, color: const Color(0xFF0F0F0F), height: 1.2),
            children: const [
              TextSpan(text: 'Preparando tu '),
              TextSpan(
                text: 'explicación',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Color(0xFF1B6B54),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),

        // Progress bar
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: _progress / 100,
            minHeight: 5,
            backgroundColor: const Color(0xFFF3F4F6),
            valueColor: const AlwaysStoppedAnimation(Color(0xFF1B6B54)),
          ),
        ),
        const SizedBox(height: 20),

        // Steps list
        ..._kSteps.asMap().entries.map((e) {
          final i = e.key;
          final s = e.value;
          final isDone = i < _step;
          final isCurrent = i == _step;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AnimatedOpacity(
              opacity: i <= _step ? 1.0 : 0.2,
              duration: const Duration(milliseconds: 300),
              child: Row(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 18, height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDone
                          ? const Color(0xFF1B6B54)
                          : isCurrent
                              ? const Color(0xFFD1E8DF)
                              : const Color(0xFFF3F4F6),
                    ),
                    child: isDone
                      ? const Icon(Icons.check, size: 10, color: Colors.white)
                      : isCurrent
                          ? const Center(
                              child: SizedBox(
                                width: 6, height: 6,
                                child: CircularProgressIndicator(
                                  strokeWidth: 1.5,
                                  valueColor: AlwaysStoppedAnimation(
                                    Color(0xFF1B6B54)),
                                ),
                              ))
                          : null,
                  ),
                  const SizedBox(width: 12),
                  Text(s,
                    style: GoogleFonts.inter(
                      fontSize: 13, color: const Color(0xFF4B5563))),
                ],
              ),
            ),
          );
        }),

        if (_done) ...[
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FAF5),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text('¡Tu pack está listo!',
                  style: GoogleFonts.inter(
                    fontSize: 14, fontWeight: FontWeight.w600,
                    color: const Color(0xFF1B6B54))),
                const SizedBox(height: 4),
                Text('Abriendo...',
                  style: GoogleFonts.inter(
                    fontSize: 12, color: const Color(0xFF6B7280))),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildError() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(
            color: const Color(0xFFFFF0EB),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(Icons.error_outline_rounded,
            size: 32, color: Color(0xFFE55A36)),
        ),
        const SizedBox(height: 20),
        Text('No se pudo generar el pack',
          style: GoogleFonts.playfairDisplay(
            fontSize: 20, color: const Color(0xFF0F0F0F))),
        const SizedBox(height: 10),
        Text(_errorMsg ?? 'Intenta de nuevo',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 13, color: AliisColors.mutedFg, height: 1.4)),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: () => context.pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AliisColors.foreground,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            child: Text('Volver a intentar',
              style: GoogleFonts.inter(
                fontSize: 14, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
flutter analyze lib/features/packs/distilling_screen.dart
```

Esperado: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/packs/distilling_screen.dart
git commit -m "feat(mobile): DistillingScreen con llamada real a pack/generate"
```

---

## Task 5: PackTOCScreen — tabla de contenidos del pack

**Files:**
- Create: `mobile/lib/features/packs/pack_toc_screen.dart`

### Contexto
Reemplaza la experiencia actual de `PackReader` (TabBar de capítulos). El usuario llega desde Destilando (`/packs/:packId/toc`) o tocando un pack en la biblioteca. Muestra: quote del pack, título con italic, stats (capítulos / lectura estimada), botón "Continuar leyendo" y lista de capítulos numerada con estado (leído/actual/pendiente).

El pack ya está cargado vía `packDetailProvider`. Para el estado de capítulos se usa `chapter_reads` en Supabase — si no existe la tabla todavía, se carga vacío y se muestra todo como pendiente.

- [ ] **Step 1: Añadir `chapterReadsProvider` en packs_provider.dart**

Al final de `mobile/lib/features/packs/packs_provider.dart` añadir:

```dart
// Returns set of chapter IDs the user has read for a given pack
final chapterReadsProvider = FutureProvider.autoDispose.family<Set<String>, String>(
  (ref, packId) async {
    final session = ref.watch(sessionProvider).valueOrNull;
    if (session == null) return {};
    try {
      final rows = await supabase
          .from('chapter_reads')
          .select('chapter_id')
          .eq('user_id', session.user.id)
          .eq('pack_id', packId);
      return (rows as List)
          .map((r) => r['chapter_id'] as String)
          .toSet();
    } catch (_) {
      return {}; // tabla puede no existir aún — ok
    }
  },
);
```

- [ ] **Step 2: Crear la pantalla**

```dart
// mobile/lib/features/packs/pack_toc_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/supabase_client.dart';
import '../../core/theme.dart';
import '../auth/auth_provider.dart';
import 'packs_provider.dart';
import 'pack_reader.dart'; // reuses ChapterTab widget via PackReader

class PackTocScreen extends ConsumerWidget {
  final String packId;
  const PackTocScreen({super.key, required this.packId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packAsync = ref.watch(packDetailProvider(packId));
    final readsAsync = ref.watch(chapterReadsProvider(packId));

    return packAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Error: $e'))),
      data: (pack) {
        final reads = readsAsync.valueOrNull ?? {};
        // Estimate reading time: ~200 words/min, ~150 words/chapter
        final totalMins = pack.chapters.length * 3;

        return Scaffold(
          backgroundColor: Colors.white,
          body: SafeArea(
            child: CustomScrollView(
              slivers: [
                // Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => context.pop(),
                          child: const Icon(Icons.chevron_left_rounded,
                            size: 26, color: Color(0xFF4B5563)),
                        ),
                        const Spacer(),
                        const Icon(Icons.share_outlined,
                          size: 20, color: Color(0xFF6B7280)),
                        const SizedBox(width: 16),
                        const Icon(Icons.bookmark_border_rounded,
                          size: 20, color: Color(0xFF6B7280)),
                      ],
                    ),
                  ),
                ),

                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('PACK · ${pack.createdAt.day} ${_month(pack.createdAt.month)} ${pack.createdAt.year}',
                          style: GoogleFonts.inter(
                            fontSize: 10, letterSpacing: 1.4,
                            color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 12),

                        // Quote (summary as blockquote)
                        if (pack.summary != null && pack.summary!.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.only(left: 12),
                            decoration: const BoxDecoration(
                              border: Border(
                                left: BorderSide(
                                  color: Color(0xFFE5E7EB), width: 2),
                              ),
                            ),
                            child: Text(
                              '"${pack.summary}"',
                              style: GoogleFonts.inter(
                                fontSize: 13, fontStyle: FontStyle.italic,
                                color: const Color(0xFF6B7280), height: 1.5),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Title
                        RichText(
                          text: TextSpan(
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 24, fontWeight: FontWeight.w400,
                              color: const Color(0xFF0F0F0F), height: 1.2),
                            children: [
                              TextSpan(text: pack.dx),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Stats row
                        Row(
                          children: [
                            _Stat(label: 'Capítulos', value: '${pack.chapters.length}'),
                            const SizedBox(width: 24),
                            _Stat(label: 'Lectura', value: '${totalMins} min'),
                            const SizedBox(width: 24),
                            _Stat(label: 'Leídos', value: '${reads.length}/${pack.chapters.length}'),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // CTA buttons
                        Row(
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 48,
                                child: ElevatedButton(
                                  onPressed: pack.chapters.isEmpty ? null : () {
                                    // Find first unread chapter, or first chapter
                                    final first = pack.chapters.firstWhere(
                                      (c) => !reads.contains(c.id),
                                      orElse: () => pack.chapters.first,
                                    );
                                    _markRead(ref, packId, first.id);
                                    context.push('/packs/$packId');
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AliisColors.foreground,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(14)),
                                    elevation: 0,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(reads.isEmpty ? 'Empezar a leer' : 'Continuar',
                                        style: GoogleFonts.inter(
                                          fontSize: 14, fontWeight: FontWeight.w600)),
                                      const SizedBox(width: 6),
                                      const Icon(Icons.play_arrow_rounded, size: 16),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        Text('LO QUE ENCONTRARÁS',
                          style: GoogleFonts.inter(
                            fontSize: 10, letterSpacing: 1.4,
                            color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 4),
                      ],
                    ),
                  ),
                ),

                // Chapter list
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (ctx, i) {
                      final ch = pack.chapters[i];
                      final isRead = reads.contains(ch.id);
                      final isLast = i == pack.chapters.length - 1;

                      return GestureDetector(
                        onTap: () {
                          _markRead(ref, packId, ch.id);
                          context.push('/packs/$packId');
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: isLast
                                  ? BorderSide.none
                                  : const BorderSide(
                                      color: Color(0xFFF9FAFB), width: 1),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 24,
                                  child: Text(
                                    (i + 1).toString().padLeft(2, '0'),
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: const Color(0xFFD1D5DB)),
                                  ),
                                ),
                                Expanded(
                                  child: Text(
                                    ch.kicker.isNotEmpty ? ch.kicker : ch.n,
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      color: isRead
                                          ? const Color(0xFF9CA3AF)
                                          : const Color(0xFF0F0F0F),
                                      decoration: isRead
                                          ? TextDecoration.lineThrough
                                          : TextDecoration.none,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text('3 min',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: const Color(0xFF9CA3AF))),
                                const SizedBox(width: 8),
                                if (isRead)
                                  Container(
                                    width: 18, height: 18,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF1B6B54),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.check,
                                      size: 10, color: Colors.white),
                                  )
                                else
                                  const SizedBox(width: 18),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                    childCount: pack.chapters.length,
                  ),
                ),

                // Footer
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 20, height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFF1B6B54),
                            shape: BoxShape.circle,
                          ),
                          child: const Center(
                            child: Text('A',
                              style: TextStyle(
                                fontSize: 9, color: Colors.white,
                                fontWeight: FontWeight.bold))),
                        ),
                        const SizedBox(width: 8),
                        Text('Generado por Aliis. Basado en evidencia, con referencias.',
                          style: GoogleFonts.inter(
                            fontSize: 11, color: const Color(0xFF9CA3AF))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _markRead(WidgetRef ref, String packId, String chapterId) {
    final session = ref.read(sessionProvider).valueOrNull;
    if (session == null) return;
    supabase.from('chapter_reads').upsert({
      'user_id': session.user.id,
      'pack_id': packId,
      'chapter_id': chapterId,
      'read_at': DateTime.now().toIso8601String(),
    }, onConflict: 'user_id,pack_id,chapter_id').then((_) {
      ref.invalidate(chapterReadsProvider(packId));
    });
  }

  String _month(int m) {
    const months = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[m];
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  const _Stat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
          style: GoogleFonts.inter(
            fontSize: 10, letterSpacing: 1.2,
            color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
        Text(value,
          style: GoogleFonts.inter(
            fontSize: 22, fontWeight: FontWeight.w500,
            color: const Color(0xFF0F0F0F))),
      ],
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
flutter analyze lib/features/packs/pack_toc_screen.dart lib/features/packs/packs_provider.dart
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/packs/pack_toc_screen.dart mobile/lib/features/packs/packs_provider.dart
git commit -m "feat(mobile): PackTOCScreen con chapter_reads y estado de lectura"
```

---

## Task 6: Registrar rutas en el router

**Files:**
- Modify: `mobile/lib/core/router.dart`

- [ ] **Step 1: Añadir imports**

```dart
import '../features/ingreso/ingreso_screen.dart';
import '../features/packs/distilling_screen.dart';
import '../features/packs/pack_toc_screen.dart';
```

- [ ] **Step 2: Añadir las 3 rutas nuevas**

Dentro del array `routes:`, junto a las rutas push existentes (antes del `StatefulShellRoute`):

```dart
GoRoute(
  path: '/ingreso',
  builder: (_, __) => const IngresoScreen(),
),
GoRoute(
  path: '/distilling',
  builder: (_, state) {
    final dx = state.extra as String? ?? '';
    return DistillingScreen(diagnostico: dx);
  },
),
GoRoute(
  path: '/packs/:packId/toc',
  builder: (_, state) => PackTocScreen(
    packId: state.pathParameters['packId']!,
  ),
),
```

- [ ] **Step 3: Actualizar el botón `+` de la bottom nav para ir a `/ingreso`**

En `mobile/lib/shared/widgets/shell_scaffold.dart`, el `onCenterPressed` actualmente va a `/expediente/registro`. Cambiarlo a `/ingreso`:

```dart
onCenterPressed: () => context.push('/ingreso'),
```

- [ ] **Step 4: Verificar todo**

```bash
flutter analyze lib/
```

Esperado: `No issues found!`

- [ ] **Step 5: Commit final**

```bash
git add mobile/lib/core/router.dart mobile/lib/shared/widgets/shell_scaffold.dart
git commit -m "feat(mobile): rutas /ingreso, /distilling, /packs/:id/toc + nav central"
```

---

## Self-Review

**Spec coverage:**
- ✅ Onboarding 3 slides con flag `onboarding_done` en profiles
- ✅ IngresoScreen con tabs Texto/Foto/Voz (Foto y Voz como "Próximamente")
- ✅ DistillingScreen con animación de pasos y llamada real a `POST /api/pack/generate`
- ✅ PackTOCScreen con `chapter_reads` tracking y lista de capítulos con estado
- ✅ Router actualizado con las 4 rutas nuevas
- ✅ Botón `+` de bottom nav va a `/ingreso`
- ✅ Redirect post-login comprueba `onboarding_done`

**Placeholder scan:** Ninguno. Toda la UI y lógica es código real.

**Type consistency:** `Pack`, `Chapter` de `packs_provider.dart` usados igual en todos los tasks. `sessionProvider` de `auth_provider.dart` consistente. `supabase` singleton de `supabase_client.dart` consistente.
