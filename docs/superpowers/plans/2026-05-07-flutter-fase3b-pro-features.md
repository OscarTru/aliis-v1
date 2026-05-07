# Flutter Fase 3B — Funcionalidades Pro (Insight, Pre-consulta, Correlación, Glosario, ProScreen) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir las funcionalidades Pro visibles al usuario — insight semanal de Aliis en Home, pantalla de pre-consulta accesible desde PackTOC, análisis de correlación en Diario, GlossaryScreen por pack y ProScreen — consumiendo las APIs web existentes en `https://aliis.app/api/aliis/`.

**Architecture:** Todas las pantallas de este plan son read-only consumers de APIs REST del frontend Next.js. Se llaman con el JWT de Supabase en `Authorization: Bearer`. Los endpoints ya existen en producción — solo se añaden las pantallas Flutter y los providers Riverpod que los envuelven. Las funcionalidades Pro muestran un CTA de upgrade en lugar de bloquearse si el usuario es `plan = 'free'`.

**Tech Stack:** Flutter 3, Riverpod 2.6, GoRouter 14, google_fonts 6, http 1.2, Supabase Flutter

---

## Mapa de archivos

| Acción | Archivo |
|---|---|
| Crear | `mobile/lib/features/home/insight_provider.dart` |
| Crear | `mobile/lib/features/home/widgets/insight_card.dart` |
| Modificar | `mobile/lib/features/home/home_screen.dart` — añadir InsightCard |
| Crear | `mobile/lib/features/packs/consult_provider.dart` |
| Crear | `mobile/lib/features/packs/consult_screen.dart` |
| Crear | `mobile/lib/features/diario/correlation_provider.dart` |
| Crear | `mobile/lib/features/diario/widgets/correlation_card.dart` |
| Modificar | `mobile/lib/features/diario/diario_screen.dart` — añadir CorrelationCard |
| Crear | `mobile/lib/features/packs/glossary_screen.dart` |
| Crear | `mobile/lib/features/perfil/pro_screen.dart` |
| Modificar | `mobile/lib/core/router.dart` — rutas `/packs/:id/consult`, `/packs/:id/glosario`, `/pro` |

---

## Colores (referencia rápida)

```dart
AliisColors.foreground   // #272730
AliisColors.deepTeal     // #14606E
AliisColors.mutedFg      // #999999
const Color(0xFF1B6B54)  // verde teal (Pro badge, bullets)
const Color(0xFF5DB896)  // teal claro (acento Pro en fondo oscuro)
```

---

## Task 1: Insight semanal en Home

**Files:**
- Create: `mobile/lib/features/home/insight_provider.dart`
- Create: `mobile/lib/features/home/widgets/insight_card.dart`
- Modify: `mobile/lib/features/home/home_screen.dart`

### Contexto
El endpoint `GET https://aliis.app/api/aliis/insight` devuelve `{ content: string, cached: bool }`. Es gratis para todos los planes — genera uno semanal. El InsightCard aparece en HomeScreen justo debajo del bloque "Cita próxima".

- [ ] **Step 1: Crear el provider**

```dart
// mobile/lib/features/home/insight_provider.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/supabase_client.dart';

class InsightData {
  final String content;
  final bool cached;
  const InsightData({required this.content, required this.cached});
}

final insightProvider = FutureProvider.autoDispose<InsightData?>((ref) async {
  final session = supabase.auth.currentSession;
  if (session == null) return null;

  final resp = await http.get(
    Uri.parse('https://aliis.app/api/aliis/insight'),
    headers: {'Authorization': 'Bearer ${session.accessToken}'},
  ).timeout(const Duration(seconds: 15));

  if (resp.statusCode != 200) return null;

  final body = jsonDecode(resp.body) as Map<String, dynamic>;
  final content = body['content'] as String?;
  if (content == null || content.isEmpty) return null;

  return InsightData(
    content: content,
    cached: body['cached'] as bool? ?? true,
  );
});
```

- [ ] **Step 2: Crear InsightCard widget**

```dart
// mobile/lib/features/home/widgets/insight_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../insight_provider.dart';

class InsightCard extends ConsumerWidget {
  const InsightCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final insightAsync = ref.watch(insightProvider);

    return insightAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (insight) {
        if (insight == null) return const SizedBox.shrink();
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAF9),
            border: Border.all(color: const Color(0xFFD1E8DF)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5EF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(children: [
                    Container(
                      width: 6, height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1B6B54),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text('ALIIS · ESTA SEMANA',
                      style: GoogleFonts.inter(
                        fontSize: 9, letterSpacing: 1.2,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1B6B54))),
                  ]),
                ),
              ]),
              const SizedBox(height: 10),
              Text(insight.content,
                style: GoogleFonts.inter(
                  fontSize: 13, color: const Color(0xFF374151), height: 1.55)),
            ],
          ),
        );
      },
    );
  }
}
```

- [ ] **Step 3: Añadir InsightCard en HomeScreen**

En `mobile/lib/features/home/home_screen.dart`, localizar el bloque de la cita próxima (buscar `// Next appointment` o similar). Añadir `const InsightCard()` inmediatamente después del widget de cita próxima, antes de "Continuar leyendo":

```dart
import 'widgets/insight_card.dart';
// ...dentro del Column/ListView de HomeScreen:
const InsightCard(),
```

- [ ] **Step 4: Verificar**

```bash
flutter analyze lib/features/home/
```

Esperado: `No issues found!`

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/features/home/
git commit -m "feat(mobile): InsightCard semanal de Aliis en HomeScreen"
```

---

## Task 2: Pre-consulta Pro — ConsultScreen

**Files:**
- Create: `mobile/lib/features/packs/consult_provider.dart`
- Create: `mobile/lib/features/packs/consult_screen.dart`

### Contexto
`POST https://aliis.app/api/aliis/consult` con `{ packId }`. Devuelve `{ content: string }` (resumen de preguntas para llevar al médico). Es exclusivo Pro — si el usuario es free, el endpoint devuelve 403 y se muestra un CTA de upgrade. Se accede desde PackTOCScreen con un botón "Preparar consulta".

- [ ] **Step 1: Crear el provider**

```dart
// mobile/lib/features/packs/consult_provider.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/supabase_client.dart';

class ConsultResult {
  final String content;
  final bool isProError; // true si el 403 es por plan
  const ConsultResult({required this.content, required this.isProError});
}

final consultProvider = FutureProvider.autoDispose.family<ConsultResult, String>(
  (ref, packId) async {
    final session = supabase.auth.currentSession;
    if (session == null) {
      return const ConsultResult(content: '', isProError: false);
    }

    final resp = await http.post(
      Uri.parse('https://aliis.app/api/aliis/consult'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${session.accessToken}',
      },
      body: jsonEncode({'packId': packId}),
    ).timeout(const Duration(seconds: 30));

    final body = jsonDecode(resp.body) as Map<String, dynamic>;

    if (resp.statusCode == 403) {
      return const ConsultResult(content: '', isProError: true);
    }
    if (resp.statusCode != 200) {
      throw Exception(body['error'] ?? 'Error al generar pre-consulta');
    }

    return ConsultResult(
      content: body['content'] as String? ?? '',
      isProError: false,
    );
  },
);
```

- [ ] **Step 2: Crear la pantalla**

```dart
// mobile/lib/features/packs/consult_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'consult_provider.dart';

class ConsultScreen extends ConsumerWidget {
  final String packId;
  const ConsultScreen({super.key, required this.packId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final consultAsync = ref.watch(consultProvider(packId));

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
                    child: const Icon(Icons.chevron_left_rounded,
                      size: 26, color: Color(0xFF4B5563)),
                  ),
                  const Spacer(),
                  Text('PRE-CONSULTA',
                    style: GoogleFonts.inter(
                      fontSize: 11, letterSpacing: 1.4,
                      color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                  const Spacer(),
                  const SizedBox(width: 26),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFF0F0F0)),

            Expanded(
              child: consultAsync.when(
                loading: () => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(
                        color: Color(0xFF1B6B54), strokeWidth: 2),
                      const SizedBox(height: 16),
                      Text('Preparando tus preguntas...',
                        style: GoogleFonts.inter(
                          fontSize: 13, color: AliisColors.mutedFg)),
                    ],
                  ),
                ),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text('Error: $e',
                    style: GoogleFonts.inter(
                      fontSize: 13, color: const Color(0xFFE55A36))),
                ),
                data: (result) {
                  if (result.isProError) return _buildProGate(context);
                  return _buildContent(result.content);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(String content) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              style: GoogleFonts.playfairDisplay(
                fontSize: 24, fontWeight: FontWeight.w400,
                color: const Color(0xFF0F0F0F), height: 1.2),
              children: const [
                TextSpan(text: 'Lo que llevar a '),
                TextSpan(
                  text: 'tu próxima cita.',
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Color(0xFF1B6B54),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              border: Border.all(color: const Color(0xFFD1E8DF)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(content,
              style: GoogleFonts.inter(
                fontSize: 14, color: const Color(0xFF374151), height: 1.65)),
          ),
        ],
      ),
    );
  }

  Widget _buildProGate(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 56, height: 56,
            decoration: const BoxDecoration(
              color: Color(0xFF1B6B54),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.lock_outline_rounded,
              color: Colors.white, size: 26),
          ),
          const SizedBox(height: 20),
          Text('Exclusivo Pro',
            style: GoogleFonts.playfairDisplay(
              fontSize: 22, color: const Color(0xFF0F0F0F))),
          const SizedBox(height: 10),
          Text(
            'La pre-consulta es una función de Aliis Pro. Prepara las preguntas exactas para llevar a tu médico.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 13, color: AliisColors.mutedFg, height: 1.5)),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => context.push('/pro'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1B6B54),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: Text('Ver Aliis Pro',
                style: GoogleFonts.inter(
                  fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 3: Verificar**

```bash
flutter analyze lib/features/packs/consult_screen.dart lib/features/packs/consult_provider.dart
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/packs/consult_provider.dart mobile/lib/features/packs/consult_screen.dart
git commit -m "feat(mobile): ConsultScreen pre-consulta Pro con gate de upgrade"
```

---

## Task 3: Correlación síntomas-adherencia en DiarioScreen

**Files:**
- Create: `mobile/lib/features/diario/correlation_provider.dart`
- Create: `mobile/lib/features/diario/widgets/correlation_card.dart`
- Modify: `mobile/lib/features/diario/diario_screen.dart`

### Contexto
`GET https://aliis.app/api/aliis/correlation` devuelve `{ correlation: string, score: number }`. Es Pro. La CorrelationCard se añade al final de DiarioScreen como sección "Tendencias".

- [ ] **Step 1: Crear el provider**

```dart
// mobile/lib/features/diario/correlation_provider.dart
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/supabase_client.dart';

class CorrelationData {
  final String correlation;
  final double score;
  final bool isProError;
  const CorrelationData({
    required this.correlation,
    required this.score,
    required this.isProError,
  });
}

final correlationProvider = FutureProvider.autoDispose<CorrelationData?>((ref) async {
  final session = supabase.auth.currentSession;
  if (session == null) return null;

  final resp = await http.get(
    Uri.parse('https://aliis.app/api/aliis/correlation'),
    headers: {'Authorization': 'Bearer ${session.accessToken}'},
  ).timeout(const Duration(seconds: 15));

  if (resp.statusCode == 403) {
    return const CorrelationData(correlation: '', score: 0, isProError: true);
  }
  if (resp.statusCode != 200) return null;

  final body = jsonDecode(resp.body) as Map<String, dynamic>;
  return CorrelationData(
    correlation: body['correlation'] as String? ?? '',
    score: (body['score'] as num?)?.toDouble() ?? 0,
    isProError: false,
  );
});
```

- [ ] **Step 2: Crear CorrelationCard**

```dart
// mobile/lib/features/diario/widgets/correlation_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../correlation_provider.dart';

class CorrelationCard extends ConsumerWidget {
  const CorrelationCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final corrAsync = ref.watch(correlationProvider);

    return corrAsync.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (data) {
        if (data == null) return const SizedBox.shrink();

        if (data.isProError) {
          // Show locked teaser
          return Container(
            margin: const EdgeInsets.only(top: 8, bottom: 8),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAF9),
              border: Border.all(color: const Color(0xFFD1E8DF)),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                const Icon(Icons.lock_outline_rounded,
                  size: 18, color: Color(0xFF1B6B54)),
                const SizedBox(width: 10),
                Expanded(
                  child: Text('Correlación síntomas-adherencia · Pro',
                    style: GoogleFonts.inter(
                      fontSize: 12, color: const Color(0xFF374151))),
                ),
                GestureDetector(
                  onTap: () => context.push('/pro'),
                  child: Text('Ver Pro',
                    style: GoogleFonts.inter(
                      fontSize: 12, fontWeight: FontWeight.w600,
                      color: const Color(0xFF1B6B54))),
                ),
              ],
            ),
          );
        }

        final pct = (data.score * 100).round();
        return Container(
          margin: const EdgeInsets.only(top: 8, bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAF9),
            border: Border.all(color: const Color(0xFFD1E8DF)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TENDENCIAS · PRO',
                style: GoogleFonts.inter(
                  fontSize: 9, letterSpacing: 1.4,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF1B6B54))),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(data.correlation,
                      style: GoogleFonts.inter(
                        fontSize: 13, color: const Color(0xFF374151),
                        height: 1.5)),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    children: [
                      Text('$pct%',
                        style: GoogleFonts.inter(
                          fontSize: 24, fontWeight: FontWeight.w600,
                          color: const Color(0xFF1B6B54))),
                      Text('adherencia',
                        style: GoogleFonts.inter(
                          fontSize: 10, color: AliisColors.mutedFg)),
                    ],
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
```

- [ ] **Step 3: Añadir CorrelationCard en DiarioScreen**

En `mobile/lib/features/diario/diario_screen.dart`, añadir el import y la card al final de la lista de registros (antes del padding inferior):

```dart
import 'widgets/correlation_card.dart';
// En el árbol de widgets, tras el SliverList de registros:
const SliverToBoxAdapter(
  child: Padding(
    padding: EdgeInsets.fromLTRB(20, 8, 20, 8),
    child: CorrelationCard(),
  ),
),
```

- [ ] **Step 4: Verificar**

```bash
flutter analyze lib/features/diario/
```

Esperado: `No issues found!`

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/features/diario/
git commit -m "feat(mobile): CorrelationCard Pro en DiarioScreen"
```

---

## Task 4: GlossaryScreen — glosario por pack

**Files:**
- Create: `mobile/lib/features/packs/glossary_screen.dart`

### Contexto
Los términos y referencias se extraen directamente de los capítulos del pack que ya están cargados — no hay endpoint dedicado. Se parsea el campo `paragraphs` buscando términos entre `**` o entre `[` `]`. Para este plan se usa datos del pack ya cargado con una lista estática de términos extraídos del tldr/kicker. La búsqueda es local con `query.toLowerCase()`.

- [ ] **Step 1: Crear la pantalla**

```dart
// mobile/lib/features/packs/glossary_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'packs_provider.dart';

class GlossaryScreen extends ConsumerStatefulWidget {
  final String packId;
  const GlossaryScreen({super.key, required this.packId});

  @override
  ConsumerState<GlossaryScreen> createState() => _GlossaryScreenState();
}

class _GlossaryScreenState extends ConsumerState<GlossaryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final packAsync = ref.watch(packDetailProvider(widget.packId));

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: packAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
          data: (pack) {
            // Extract terms from chapter kickers/tldrs
            final terms = pack.chapters
                .asMap()
                .entries
                .map((e) => _Term(
                      word: e.value.kicker.isNotEmpty
                          ? e.value.kicker
                          : e.value.n,
                      chapter: 'Cap ${String(e.key + 1).padLeft(2, '0')}',
                      def: e.value.tldr,
                    ))
                .toList();

            final filtered = _query.isEmpty
                ? terms
                : terms
                    .where((t) =>
                        t.word.toLowerCase().contains(_query.toLowerCase()) ||
                        t.def.toLowerCase().contains(_query.toLowerCase()))
                    .toList();

            return Column(
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.pop(),
                        child: const Icon(Icons.chevron_left_rounded,
                          size: 26, color: Color(0xFF4B5563)),
                      ),
                      const Spacer(),
                      Text('GLOSARIO',
                        style: GoogleFonts.inter(
                          fontSize: 11, letterSpacing: 1.4,
                          color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      const SizedBox(width: 26),
                    ],
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pack.dx.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 10, letterSpacing: 1.4,
                          color: AliisColors.mutedFg, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 6),
                      RichText(
                        text: TextSpan(
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 24, fontWeight: FontWeight.w400,
                            color: const Color(0xFF0F0F0F), height: 1.2),
                          children: const [
                            TextSpan(text: 'Las palabras raras, '),
                            TextSpan(
                              text: 'traducidas.',
                              style: TextStyle(
                                fontStyle: FontStyle.italic,
                                color: Color(0xFF1B6B54),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Tabs
                      Row(
                        children: [
                          _Tab(
                            label: 'Términos · ${terms.length}',
                            selected: _tabCtrl.index == 0,
                            onTap: () => setState(() => _tabCtrl.animateTo(0)),
                          ),
                          const SizedBox(width: 20),
                          _Tab(
                            label: 'Capítulos · ${pack.chapters.length}',
                            selected: _tabCtrl.index == 1,
                            onTap: () => setState(() => _tabCtrl.animateTo(1)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Search
                      Container(
                        height: 40,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8F8F8),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: TextField(
                          onChanged: (v) => setState(() => _query = v),
                          style: GoogleFonts.inter(fontSize: 13),
                          decoration: InputDecoration(
                            hintText: 'Buscar término...',
                            hintStyle: GoogleFonts.inter(
                              fontSize: 13, color: const Color(0xFFD1D5DB)),
                            prefixIcon: const Icon(Icons.search,
                              size: 18, color: Color(0xFF9CA3AF)),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 8),
                const Divider(height: 1, color: Color(0xFFF0F0F0)),

                Expanded(
                  child: TabBarView(
                    controller: _tabCtrl,
                    children: [
                      // Terms tab
                      ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const Divider(
                          height: 1, color: Color(0xFFF9FAFB)),
                        itemBuilder: (_, i) {
                          final t = filtered[i];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(t.word,
                                        style: GoogleFonts.playfairDisplay(
                                          fontSize: 17,
                                          fontWeight: FontWeight.w400,
                                          color: const Color(0xFF0F0F0F))),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE8F5EF),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(t.chapter,
                                        style: GoogleFonts.inter(
                                          fontSize: 10,
                                          color: const Color(0xFF1B6B54))),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(t.def,
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    color: const Color(0xFF6B7280),
                                    height: 1.5)),
                              ],
                            ),
                          );
                        },
                      ),

                      // Chapters tab (chapter list for navigation)
                      ListView.separated(
                        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                        itemCount: pack.chapters.length,
                        separatorBuilder: (_, __) => const Divider(
                          height: 1, color: Color(0xFFF9FAFB)),
                        itemBuilder: (_, i) {
                          final ch = pack.chapters[i];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Row(
                              children: [
                                Text('${i + 1}'.padLeft(2, '0'),
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    color: const Color(0xFFD1D5DB))),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        ch.kicker.isNotEmpty ? ch.kicker : ch.n,
                                        style: GoogleFonts.inter(
                                          fontSize: 14,
                                          color: const Color(0xFF0F0F0F))),
                                      if (ch.tldr.isNotEmpty)
                                        Text(ch.tldr,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: const Color(0xFF9CA3AF),
                                            height: 1.4)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _Term {
  final String word;
  final String chapter;
  final String def;
  const _Term({required this.word, required this.chapter, required this.def});
}

class _Tab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _Tab({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
            style: GoogleFonts.inter(
              fontSize: 13, fontWeight: FontWeight.w500,
              color: selected
                  ? const Color(0xFF0F0F0F)
                  : const Color(0xFF9CA3AF))),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 2,
            width: 60,
            color: selected ? const Color(0xFF0F0F0F) : Colors.transparent,
          ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 2: Verificar**

```bash
flutter analyze lib/features/packs/glossary_screen.dart
```

Esperado: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/packs/glossary_screen.dart
git commit -m "feat(mobile): GlossaryScreen por pack con búsqueda local"
```

---

## Task 5: ProScreen — pantalla de upgrade

**Files:**
- Create: `mobile/lib/features/perfil/pro_screen.dart`

### Contexto
Pantalla oscura (`#0A0A0A`) con logo, badge "Aliis Pro", precio, lista de features y botón CTA que redirige a la web (`https://aliis.app/pro`) — sin pagos en app (Apple 3.1.1). Se abre como modal con `context.push('/pro')`.

- [ ] **Step 1: Crear la pantalla**

```dart
// mobile/lib/features/perfil/pro_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

const _kFeatures = [
  _Feature('Sin límite', 'Genera explicaciones cada vez que salgas de consulta.'),
  _Feature('Diario y alarmas', 'Síntomas, medicación, próxima cita — todo sincronizado al pack.'),
  _Feature('Compartir avanzado', 'Versión médico, versión familia. Tú eliges qué se ve.'),
  _Feature('Historial sin caducar', 'Tu biblioteca completa, exportable como PDF cuando quieras.'),
  _Feature('Pre-consulta', 'Preguntas listas para tu médico, generadas por Aliis.'),
  _Feature('Correlación', 'Aliis analiza cómo tu adherencia afecta tus síntomas.'),
];

class _Feature {
  final String label;
  final String desc;
  const _Feature(this.label, this.desc);
}

class ProScreen extends StatelessWidget {
  const ProScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: Column(
          children: [
            // Close button
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 12, 20, 0),
                child: GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close_rounded,
                      size: 16, color: Colors.white),
                  ),
                ),
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    const SizedBox(height: 8),

                    // Logo
                    Container(
                      width: 64, height: 64,
                      decoration: const BoxDecoration(
                        color: Color(0xFF1B6B54),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.favorite_rounded,
                        size: 28, color: Colors.white),
                    ),
                    const SizedBox(height: 16),

                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B6B54),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('Aliis Pro',
                        style: GoogleFonts.inter(
                          fontSize: 10, letterSpacing: 1.4,
                          fontWeight: FontWeight.w600,
                          color: Colors.white)),
                    ),
                    const SizedBox(height: 16),

                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 28, fontWeight: FontWeight.w400,
                          color: Colors.white, height: 1.2),
                        children: const [
                          TextSpan(text: 'Cuesta menos '),
                          TextSpan(
                            text: 'que una consulta.',
                            style: TextStyle(
                              fontStyle: FontStyle.italic,
                              color: Color(0xFF5DB896),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),

                    Text(
                      'Una explicación a la semana es gratis. Si tu vida con esto necesita más — aquí está.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 13, color: const Color(0xFF9CA3AF),
                        height: 1.5)),
                    const SizedBox(height: 28),

                    // Features list
                    ..._kFeatures.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 20, height: 20,
                            decoration: const BoxDecoration(
                              color: Color(0xFF1B6B54),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.check,
                              size: 11, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(f.label,
                                  style: GoogleFonts.inter(
                                    fontSize: 14, fontWeight: FontWeight.w500,
                                    color: Colors.white)),
                                Text(f.desc,
                                  style: GoogleFonts.inter(
                                    fontSize: 12, color: const Color(0xFF6B7280),
                                    height: 1.4)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),

                    const SizedBox(height: 24),

                    // CTA — links to web (Apple 3.1.1 compliance)
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: () async {
                          final url = Uri.parse('https://aliis.app/pro');
                          if (await canLaunchUrl(url)) {
                            await launchUrl(url,
                              mode: LaunchMode.externalApplication);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1B6B54),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text('Empezar Pro · 9,99 €/mes →',
                          style: GoogleFonts.inter(
                            fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                    ),

                    const SizedBox(height: 10),
                    Text('7 días gratis',
                      style: GoogleFonts.inter(
                        fontSize: 11, color: const Color(0xFF6B7280))),
                    const SizedBox(height: 6),
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Text('Cancelar cuando quieras',
                        style: GoogleFonts.inter(
                          fontSize: 12, color: const Color(0xFF6B7280))),
                    ),
                    const SizedBox(height: 24),
                  ],
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

- [ ] **Step 2: Añadir `url_launcher` al pubspec si no está**

```bash
grep "url_launcher" mobile/pubspec.yaml || \
  cd mobile && flutter pub add url_launcher
```

- [ ] **Step 3: Verificar**

```bash
flutter analyze lib/features/perfil/pro_screen.dart
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/features/perfil/pro_screen.dart mobile/pubspec.yaml mobile/pubspec.lock
git commit -m "feat(mobile): ProScreen con CTA a web (Apple 3.1.1 compliant)"
```

---

## Task 6: Registrar rutas en el router

**Files:**
- Modify: `mobile/lib/core/router.dart`

- [ ] **Step 1: Añadir imports**

```dart
import '../features/packs/consult_screen.dart';
import '../features/packs/glossary_screen.dart';
import '../features/perfil/pro_screen.dart';
```

- [ ] **Step 2: Añadir rutas**

Dentro del array `routes:` (antes del `StatefulShellRoute`):

```dart
GoRoute(
  path: '/packs/:packId/consult',
  builder: (_, state) => ConsultScreen(
    packId: state.pathParameters['packId']!,
  ),
),
GoRoute(
  path: '/packs/:packId/glosario',
  builder: (_, state) => GlossaryScreen(
    packId: state.pathParameters['packId']!,
  ),
),
GoRoute(
  path: '/pro',
  builder: (_, __) => const ProScreen(),
),
```

- [ ] **Step 3: Verificar todo**

```bash
flutter analyze lib/
```

Esperado: `No issues found!`

- [ ] **Step 4: Commit final**

```bash
git add mobile/lib/core/router.dart
git commit -m "feat(mobile): rutas /consult, /glosario, /pro"
```

---

## Self-Review

**Spec coverage:**
- ✅ InsightCard semanal en HomeScreen (GET /api/aliis/insight)
- ✅ ConsultScreen pre-consulta Pro con gate de upgrade (POST /api/aliis/consult)
- ✅ CorrelationCard en DiarioScreen con gate Pro (GET /api/aliis/correlation)
- ✅ GlossaryScreen por pack con búsqueda local y tabs Términos/Capítulos
- ✅ ProScreen con CTA a web (Apple 3.1.1 — sin pagos en app)
- ✅ Router con 3 rutas nuevas

**Placeholder scan:** Ninguno. Toda la UI es código real con manejo de estados loading/error/data.

**Type consistency:** `Pack`, `Chapter` de `packs_provider.dart`. `supabase` singleton consistente. `sessionProvider` no se usa en providers de este plan (se usa `supabase.auth.currentSession` directamente para evitar dependencies en providers autoDispose).
