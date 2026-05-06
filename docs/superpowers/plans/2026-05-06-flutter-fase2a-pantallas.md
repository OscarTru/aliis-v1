# Flutter Fase 2A — Pantallas con Datos Reales

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir los 5 placeholders de la Fase 1 en pantallas funcionales con datos reales desde Supabase: Home, Diario, Packs, Alertas y Perfil.

**Architecture:** Cada feature tiene un provider Riverpod que carga datos desde Supabase, una screen que consume el provider con estados loading/error/data, y widgets pequeños con responsabilidad única. No hay BFF — Flutter habla directo con Supabase. Las escrituras son optimistas.

**Tech Stack:** Flutter 3.41.9, Riverpod 2.6.1, supabase_flutter 2.8.0, GoRouter 14.x, google_fonts, flutter_animate, intl.

---

## Contexto del proyecto

- Repo: `mobile/` dentro del monorepo Aliis
- Rama de trabajo: `dev`
- Tema visual: `mobile/lib/core/theme.dart` — `AliisColors.*`, `aliisLightTheme()`, `aliisDarkTheme()`
- Auth provider: `mobile/lib/features/auth/auth_provider.dart` — `sessionProvider`, `authProvider`
- Supabase client: `mobile/lib/core/supabase_client.dart` — `get supabase => Supabase.instance.client`
- Router: `mobile/lib/core/router.dart` — rutas `/inicio`, `/packs`, `/alertas`, `/perfil`
- Shell: `mobile/lib/shared/widgets/shell_scaffold.dart` — bottom nav con FAB Aliis central
- Aliis sheet: `mobile/lib/features/aliis/aliis_sheet.dart` — `AliisSheet.show(context)`
- Ejecutar: `bash run.sh` desde `mobile/`

## Tablas Supabase relevantes

```
profiles          — id, name, plan, next_appointment
medical_profiles  — user_id, condiciones_previas (text[]), edad, sexo
treatments        — user_id, name, dose, frequency_label, active, updated_at
adherence_logs    — user_id, medication, taken_date, status ('taken'|'missed')
symptom_logs      — user_id, logged_at, glucose, bp_systolic, bp_diastolic, heart_rate, temperature, weight, note, free_text
app_notifications — user_id, title, body, type, read, url, created_at
packs             — user_id (via pack_users join o directo), id, dx, created_at
aliis_insights    — user_id, type, content (json), generated_at
```

---

## Estructura de archivos a crear/modificar

```
mobile/lib/
├── shared/
│   └── models/
│       ├── treatment.dart          ← model Treatment
│       ├── symptom_log.dart        ← model SymptomLog
│       ├── app_notification.dart   ← model AppNotification
│       └── pack.dart               ← model Pack + Chapter
├── features/
│   ├── home/
│   │   ├── home_screen.dart        ← REEMPLAZAR placeholder
│   │   ├── home_provider.dart      ← CREAR
│   │   └── widgets/
│   │       ├── adherencia_card.dart
│   │       ├── celebracion_card.dart
│   │       ├── alerta_banner.dart
│   │       └── metricas_grid.dart
│   ├── diario/                     ← directorio NUEVO
│   │   ├── diario_screen.dart
│   │   ├── registro_wizard.dart
│   │   ├── diario_provider.dart
│   │   ├── diario_steps.dart
│   │   └── widgets/
│   │       ├── step_mood.dart
│   │       ├── step_slider.dart
│   │       ├── step_vitals.dart
│   │       ├── step_boolean.dart
│   │       ├── step_text.dart
│   │       └── registro_card.dart
│   ├── packs/
│   │   ├── packs_screen.dart       ← REEMPLAZAR placeholder
│   │   ├── pack_reader.dart        ← CREAR
│   │   ├── packs_provider.dart     ← CREAR
│   │   └── widgets/
│   │       ├── pack_card.dart
│   │       └── chapter_tab.dart
│   ├── alertas/
│   │   ├── alertas_screen.dart     ← REEMPLAZAR placeholder
│   │   ├── alertas_provider.dart   ← CREAR
│   │   └── widgets/
│   │       └── alerta_tile.dart
│   └── perfil/
│       ├── perfil_screen.dart      ← REEMPLAZAR placeholder
│       ├── perfil_provider.dart    ← CREAR
│       └── widgets/
│           ├── tratamiento_tile.dart
│           └── tratamiento_form.dart
└── core/
    └── router.dart                 ← agregar rutas /diario y /packs/:id
```

---

## Task 1: Modelos de datos compartidos

**Files:**
- Create: `mobile/lib/shared/models/treatment.dart`
- Create: `mobile/lib/shared/models/symptom_log.dart`
- Create: `mobile/lib/shared/models/app_notification.dart`
- Create: `mobile/lib/shared/models/pack.dart`

- [ ] **Step 1: Crear `treatment.dart`**

```dart
// mobile/lib/shared/models/treatment.dart
class Treatment {
  final String id;
  final String userId;
  final String name;
  final String? dose;
  final String? frequencyLabel;
  final bool active;
  final String? updatedAt;

  const Treatment({
    required this.id,
    required this.userId,
    required this.name,
    this.dose,
    this.frequencyLabel,
    required this.active,
    this.updatedAt,
  });

  factory Treatment.fromJson(Map<String, dynamic> json) => Treatment(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    name: json['name'] as String,
    dose: json['dose'] as String?,
    frequencyLabel: json['frequency_label'] as String?,
    active: json['active'] as bool? ?? true,
    updatedAt: json['updated_at'] as String?,
  );

  String get displayName => dose != null ? '$name $dose' : name;
}
```

- [ ] **Step 2: Crear `symptom_log.dart`**

```dart
// mobile/lib/shared/models/symptom_log.dart
class SymptomLog {
  final String id;
  final String userId;
  final DateTime loggedAt;
  final double? glucose;
  final int? bpSystolic;
  final int? bpDiastolic;
  final int? heartRate;
  final double? temperature;
  final double? weight;
  final String? note;
  final Map<String, dynamic>? freeText;

  const SymptomLog({
    required this.id,
    required this.userId,
    required this.loggedAt,
    this.glucose,
    this.bpSystolic,
    this.bpDiastolic,
    this.heartRate,
    this.temperature,
    this.weight,
    this.note,
    this.freeText,
  });

  factory SymptomLog.fromJson(Map<String, dynamic> json) => SymptomLog(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    loggedAt: DateTime.parse(json['logged_at'] as String),
    glucose: (json['glucose'] as num?)?.toDouble(),
    bpSystolic: json['bp_systolic'] as int?,
    bpDiastolic: json['bp_diastolic'] as int?,
    heartRate: json['heart_rate'] as int?,
    temperature: (json['temperature'] as num?)?.toDouble(),
    weight: (json['weight'] as num?)?.toDouble(),
    note: json['note'] as String?,
    freeText: json['free_text'] as Map<String, dynamic>?,
  );
}
```

- [ ] **Step 3: Crear `app_notification.dart`**

```dart
// mobile/lib/shared/models/app_notification.dart
class AppNotification {
  final String id;
  final String userId;
  final String title;
  final String body;
  final String type;
  final bool read;
  final String? url;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    required this.read,
    this.url,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
    id: json['id'] as String,
    userId: json['user_id'] as String,
    title: json['title'] as String,
    body: json['body'] as String,
    type: json['type'] as String,
    read: json['read'] as bool? ?? false,
    url: json['url'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );
}
```

- [ ] **Step 4: Crear `pack.dart`**

```dart
// mobile/lib/shared/models/pack.dart
class Chapter {
  final String id;
  final String n;
  final String kicker;
  final String tldr;
  final List<String> paragraphs;

  const Chapter({
    required this.id,
    required this.n,
    required this.kicker,
    required this.tldr,
    required this.paragraphs,
  });

  factory Chapter.fromJson(Map<String, dynamic> json) => Chapter(
    id: json['id'] as String,
    n: json['n'] as String,
    kicker: json['kicker'] as String,
    tldr: json['tldr'] as String,
    paragraphs: List<String>.from(json['paragraphs'] as List? ?? []),
  );
}

class Pack {
  final String id;
  final String dx;
  final String? summary;
  final DateTime createdAt;
  final List<Chapter> chapters;

  const Pack({
    required this.id,
    required this.dx,
    this.summary,
    required this.createdAt,
    required this.chapters,
  });

  factory Pack.fromJson(Map<String, dynamic> json) => Pack(
    id: json['id'] as String,
    dx: json['dx'] as String,
    summary: json['summary'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
    chapters: (json['chapters'] as List? ?? [])
        .map((c) => Chapter.fromJson(c as Map<String, dynamic>))
        .toList(),
  );
}
```

- [ ] **Step 5: Verificar que no hay errores**

```bash
cd mobile && flutter analyze lib/shared/models/
```

Expected: No issues found.

- [ ] **Step 6: Commit**

```bash
git add mobile/lib/shared/models/
git commit -m "feat(mobile): modelos Treatment, SymptomLog, AppNotification, Pack"
```

---

## Task 2: Pantalla de Inicio — provider y datos

**Files:**
- Create: `mobile/lib/features/home/home_provider.dart`

- [ ] **Step 1: Crear `home_provider.dart`**

```dart
// mobile/lib/features/home/home_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

class HomeData {
  final String? userName;
  final String? nextAppointment;
  final List<Treatment> treatments;
  final Set<String> takenToday;    // nombres de medicamentos tomados hoy
  final bool hasActiveAlert;
  final String? alertBody;
  final int adherencia14d;         // porcentaje
  final int diasRegistrados30d;

  const HomeData({
    this.userName,
    this.nextAppointment,
    required this.treatments,
    required this.takenToday,
    required this.hasActiveAlert,
    this.alertBody,
    required this.adherencia14d,
    required this.diasRegistrados30d,
  });

  bool get allTakenToday =>
      treatments.isNotEmpty &&
      treatments.every((t) => takenToday.contains(t.name));
}

final homeProvider = FutureProvider.autoDispose<HomeData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return HomeData(
    treatments: [], takenToday: {}, hasActiveAlert: false,
    adherencia14d: 0, diasRegistrados30d: 0,
  );

  final userId = session.user.id;
  final today = DateTime.now().toIso8601String().substring(0, 10);
  final since14 = DateTime.now().subtract(const Duration(days: 14))
      .toIso8601String().substring(0, 10);
  final since30 = DateTime.now().subtract(const Duration(days: 30))
      .toIso8601String();

  final results = await Future.wait([
    supabase.from('profiles')
        .select('name, next_appointment')
        .eq('id', userId)
        .single(),
    supabase.from('treatments')
        .select('id, user_id, name, dose, frequency_label, active, updated_at')
        .eq('user_id', userId)
        .eq('active', true),
    supabase.from('adherence_logs')
        .select('medication, status')
        .eq('user_id', userId)
        .eq('taken_date', today),
    supabase.from('adherence_logs')
        .select('status')
        .eq('user_id', userId)
        .gte('taken_date', since14),
    supabase.from('symptom_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', since30),
    supabase.from('aliis_insights')
        .select('content')
        .eq('user_id', userId)
        .eq('type', 'patient_summary')
        .order('generated_at', ascending: false)
        .limit(1)
        .maybeSingle(),
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
      .where((l) => (l as Map)['status'] == 'taken')
      .map((l) => (l as Map)['medication'] as String)
      .toSet();

  final total14 = logs14.length;
  final taken14 = (logs14 as List)
      .where((l) => (l as Map)['status'] == 'taken').length;
  final adherencia14d = total14 > 0
      ? ((taken14 / total14) * 100).round()
      : 0;

  // días distintos con al menos un registro
  final dias = logs30
      .map((l) => (l as Map)['logged_at'].toString().substring(0, 10))
      .toSet()
      .length;

  // alerta activa: busca nivel 'high' en el contenido del insight
  String? alertBody;
  bool hasActiveAlert = false;
  if (insight != null) {
    final content = insight['content'];
    final parsed = content is String
        ? {} as Map
        : content as Map<String, dynamic>;
    final patron = parsed['patron_reciente'] as String?;
    if (patron != null) {
      hasActiveAlert = true;
      alertBody = patron;
    }
  }

  return HomeData(
    userName: profile?['name'] as String?,
    nextAppointment: profile?['next_appointment'] as String?,
    treatments: treatments,
    takenToday: takenToday,
    hasActiveAlert: hasActiveAlert,
    alertBody: alertBody,
    adherencia14d: adherencia14d,
    diasRegistrados30d: dias,
  );
});
```

- [ ] **Step 2: Verificar**

```bash
cd mobile && flutter analyze lib/features/home/home_provider.dart
```

Expected: No issues found.

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/features/home/home_provider.dart
git commit -m "feat(mobile/home): HomeData provider con Supabase"
```

---

## Task 3: Pantalla de Inicio — widgets y screen

**Files:**
- Create: `mobile/lib/features/home/widgets/alerta_banner.dart`
- Create: `mobile/lib/features/home/widgets/adherencia_card.dart`
- Create: `mobile/lib/features/home/widgets/celebracion_card.dart`
- Create: `mobile/lib/features/home/widgets/metricas_grid.dart`
- Modify: `mobile/lib/features/home/home_screen.dart`

- [ ] **Step 1: Crear `alerta_banner.dart`**

```dart
// mobile/lib/features/home/widgets/alerta_banner.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';

class AlertaBanner extends StatelessWidget {
  final String body;
  final VoidCallback? onTap;

  const AlertaBanner({super.key, required this.body, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFF7ED),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFFED7AA)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('⚠', style: TextStyle(fontSize: 14)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(body,
                style: GoogleFonts.inter(
                  fontSize: 13, color: const Color(0xFF92400E))),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 2: Crear `adherencia_card.dart`**

```dart
// mobile/lib/features/home/widgets/adherencia_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../../../shared/models/treatment.dart';
import '../home_provider.dart';

class AdherenciaCard extends ConsumerWidget {
  final List<Treatment> treatments;
  final Set<String> takenToday;

  const AdherenciaCard({
    super.key,
    required this.treatments,
    required this.takenToday,
  });

  Future<void> _marcarTomado(WidgetRef ref, Treatment t) async {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    await supabase.from('adherence_logs').upsert({
      'user_id': t.userId,
      'medication': t.name,
      'taken_date': today,
      'taken_at': DateTime.now().toIso8601String(),
      'status': 'taken',
    }, onConflict: 'user_id,medication,taken_date');
    ref.invalidate(homeProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AliisColors.muted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AliisColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Medicamentos hoy',
            style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.w600,
              color: AliisColors.mutedForeground,
              letterSpacing: 0.5)),
          const SizedBox(height: 10),
          ...treatments.map((t) {
            final taken = takenToday.contains(t.name);
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: taken ? null : () => _marcarTomado(ref, t),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 22, height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: taken ? AliisColors.primary : Colors.transparent,
                        border: Border.all(
                          color: taken ? AliisColors.primary : AliisColors.border,
                          width: 2),
                      ),
                      child: taken
                          ? const Icon(Icons.check, size: 12, color: Colors.white)
                          : null,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(t.displayName,
                      style: GoogleFonts.inter(
                        fontSize: 13, color: AliisColors.foreground)),
                  ),
                  Text(
                    taken ? 'Tomado' : 'Pendiente',
                    style: GoogleFonts.inter(
                      fontSize: 11, fontWeight: FontWeight.w600,
                      color: taken ? AliisColors.emerald : AliisColors.amber),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
```

- [ ] **Step 3: Crear `celebracion_card.dart`**

```dart
// mobile/lib/features/home/widgets/celebracion_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';

class CelebracionCard extends StatelessWidget {
  final int adherencia14d;

  const CelebracionCard({super.key, required this.adherencia14d});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        children: [
          Text('¡Todo al día hoy! 🎉',
            style: GoogleFonts.instrumentSerif(
              fontSize: 18, color: const Color(0xFF166534))),
          const SizedBox(height: 4),
          Text('Adherencia esta semana: $adherencia14d%',
            style: GoogleFonts.inter(
              fontSize: 12, color: const Color(0xFF166534))),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).scaleXY(begin: 0.95, end: 1);
  }
}
```

- [ ] **Step 4: Crear `metricas_grid.dart`**

```dart
// mobile/lib/features/home/widgets/metricas_grid.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';

class MetricasGrid extends StatelessWidget {
  final int adherencia14d;
  final int diasRegistrados30d;

  const MetricasGrid({
    super.key,
    required this.adherencia14d,
    required this.diasRegistrados30d,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _MetricaTile(
          valor: '$adherencia14d%',
          label: 'Adherencia',
          color: AliisColors.primary,
        ),
        const SizedBox(width: 10),
        _MetricaTile(
          valor: '$diasRegistrados30d',
          label: 'Días registrados',
          color: AliisColors.foreground,
        ),
      ],
    );
  }
}

class _MetricaTile extends StatelessWidget {
  final String valor;
  final String label;
  final Color color;

  const _MetricaTile({
    required this.valor,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AliisColors.muted,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          children: [
            Text(valor,
              style: GoogleFonts.inter(
                fontSize: 22, fontWeight: FontWeight.w700, color: color)),
            const SizedBox(height: 2),
            Text(label,
              style: GoogleFonts.inter(
                fontSize: 10, color: AliisColors.mutedForeground)),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Reemplazar `home_screen.dart`**

```dart
// mobile/lib/features/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import 'home_provider.dart';
import 'widgets/adherencia_card.dart';
import 'widgets/alerta_banner.dart';
import 'widgets/celebracion_card.dart';
import 'widgets/metricas_grid.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeProvider);
    final now = DateTime.now();
    final fecha = DateFormat("EEEE d 'de' MMMM", 'es').format(now);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(homeProvider),
          child: homeAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando datos',
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (data) => ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text(fecha,
                  style: GoogleFonts.inter(
                    fontSize: 12, color: AliisColors.mutedForeground)),
                const SizedBox(height: 4),
                Text(
                  data.userName != null
                    ? 'Buenos días, ${data.userName}.'
                    : 'Lo que te toca hoy.',
                  style: Theme.of(context).textTheme.displayLarge),
                const SizedBox(height: 20),
                if (data.hasActiveAlert && data.alertBody != null) ...[
                  AlertaBanner(
                    body: data.alertBody!,
                    onTap: () => context.go('/alertas'),
                  ),
                  const SizedBox(height: 12),
                ],
                if (data.allTakenToday)
                  CelebracionCard(adherencia14d: data.adherencia14d)
                else if (data.treatments.isNotEmpty)
                  AdherenciaCard(
                    treatments: data.treatments,
                    takenToday: data.takenToday,
                  ),
                const SizedBox(height: 12),
                MetricasGrid(
                  adherencia14d: data.adherencia14d,
                  diasRegistrados30d: data.diasRegistrados30d,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context.push('/diario/registro'),
                  icon: const Icon(Icons.add, size: 18),
                  label: Text('Registrar síntomas',
                    style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                  style: FilledButton.styleFrom(
                    backgroundColor: AliisColors.primary,
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
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
```

- [ ] **Step 6: Agregar localización a pubspec.yaml**

```yaml
# mobile/pubspec.yaml — agregar en dependencies:
  intl: ^0.19.0   # ya existe, verificar que esté
  flutter_localizations:
    sdk: flutter
```

Y en la sección `flutter:`:
```yaml
flutter:
  generate: true
```

- [ ] **Step 7: Agregar rutas `/diario/registro` al router temporalmente**

En `mobile/lib/core/router.dart`, agregar dentro del branch de `/inicio`:

```dart
StatefulShellBranch(routes: [
  GoRoute(
    path: '/inicio',
    builder: (_, __) => const HomeScreen(),
    routes: [
      GoRoute(
        path: '/diario/registro',  // ruta temporal hasta Task 5
        builder: (_, __) => const Scaffold(
          body: Center(child: Text('Diario — próximamente')),
        ),
      ),
    ],
  ),
]),
```

- [ ] **Step 8: Verificar**

```bash
cd mobile && flutter analyze lib/features/home/
```

Expected: No issues found.

- [ ] **Step 9: Correr y revisar en simulador**

```bash
bash run.sh
```

Verificar: fecha y nombre del usuario, medicamentos con tap para marcar, métricas en grid, botón de diario.

- [ ] **Step 10: Commit**

```bash
git add mobile/lib/features/home/ mobile/lib/core/router.dart mobile/pubspec.yaml
git commit -m "feat(mobile/home): pantalla de inicio con datos reales"
```

---

## Task 4: Alertas — provider, screen y tiles con acciones

**Files:**
- Create: `mobile/lib/features/alertas/alertas_provider.dart`
- Create: `mobile/lib/features/alertas/widgets/alerta_tile.dart`
- Modify: `mobile/lib/features/alertas/alertas_screen.dart`

- [ ] **Step 1: Crear `alertas_provider.dart`**

```dart
// mobile/lib/features/alertas/alertas_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/app_notification.dart';
import '../auth/auth_provider.dart';

final alertasProvider = StreamProvider.autoDispose<List<AppNotification>>((ref) {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return Stream.value([]);

  return supabase
    .from('app_notifications')
    .stream(primaryKey: ['id'])
    .eq('user_id', session.user.id)
    .order('created_at', ascending: false)
    .map((rows) => rows
      .map((r) => AppNotification.fromJson(r))
      .toList());
});

Future<void> marcarLeida(String notificationId) async {
  await supabase
    .from('app_notifications')
    .update({'read': true, 'read_at': DateTime.now().toIso8601String()})
    .eq('id', notificationId);
}
```

- [ ] **Step 2: Crear `alerta_tile.dart`**

```dart
// mobile/lib/features/alertas/widgets/alerta_tile.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../../../shared/models/app_notification.dart';
import '../../aliis/aliis_sheet.dart';
import '../alertas_provider.dart';

class AlertaTile extends ConsumerWidget {
  final AppNotification notification;

  const AlertaTile({super.key, required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fecha = DateFormat('d MMM', 'es').format(notification.createdAt);

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AliisColors.primary,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.check, color: Colors.white),
      ),
      onDismissed: (_) => marcarLeida(notification.id),
      child: GestureDetector(
        onTap: () => marcarLeida(notification.id),
        child: Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: notification.read ? AliisColors.muted : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AliisColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (!notification.read)
                    Container(
                      width: 8, height: 8,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: const BoxDecoration(
                        color: AliisColors.primary,
                        shape: BoxShape.circle),
                    ),
                  Expanded(
                    child: Text(notification.title,
                      style: GoogleFonts.inter(
                        fontSize: 13, fontWeight: FontWeight.w600,
                        color: AliisColors.foreground)),
                  ),
                  Text(fecha,
                    style: GoogleFonts.inter(
                      fontSize: 11, color: AliisColors.mutedForeground)),
                ],
              ),
              const SizedBox(height: 4),
              Text(notification.body,
                style: GoogleFonts.inter(
                  fontSize: 12, color: AliisColors.mutedForeground)),
              const SizedBox(height: 10),
              _AccionButton(notification: notification),
            ],
          ),
        ),
      ),
    );
  }
}

class _AccionButton extends ConsumerWidget {
  final AppNotification notification;
  const _AccionButton({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    switch (notification.type) {
      case 'reminder':
        return OutlinedButton(
          onPressed: () async {
            final today = DateTime.now().toIso8601String().substring(0, 10);
            final userId = supabase.auth.currentUser!.id;
            // Extrae el medicamento del body si se puede, sino usa generic
            await supabase.from('adherence_logs').upsert({
              'user_id': userId,
              'medication': notification.title,
              'taken_date': today,
              'taken_at': DateTime.now().toIso8601String(),
              'status': 'taken',
            }, onConflict: 'user_id,medication,taken_date');
            marcarLeida(notification.id);
          },
          child: Text('Marcar como tomado',
            style: GoogleFonts.inter(fontSize: 12)),
        );
      case 'red_flag':
      case 'insight':
        return OutlinedButton(
          onPressed: () {
            marcarLeida(notification.id);
            context.push('/diario/registro');
          },
          child: Text('Registrar en diario',
            style: GoogleFonts.inter(fontSize: 12)),
        );
      default:
        return OutlinedButton(
          onPressed: () {
            marcarLeida(notification.id);
            AliisSheet.show(context);
          },
          child: Text('Preguntarle a Aliis',
            style: GoogleFonts.inter(fontSize: 12)),
        );
    }
  }
}
```

- [ ] **Step 3: Reemplazar `alertas_screen.dart`**

```dart
// mobile/lib/features/alertas/alertas_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'alertas_provider.dart';
import 'widgets/alerta_tile.dart';

class AlertasScreen extends ConsumerWidget {
  const AlertasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertasAsync = ref.watch(alertasProvider);

    return Scaffold(
      body: SafeArea(
        child: alertasAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(
            child: Text('Error cargando alertas',
              style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
          data: (notifications) => notifications.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.notifications_none_rounded,
                      size: 48, color: AliisColors.border),
                    const SizedBox(height: 12),
                    Text('Sin alertas por ahora',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedForeground)),
                  ],
                ))
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text('Alertas.',
                    style: Theme.of(context).textTheme.displayLarge),
                  const SizedBox(height: 20),
                  ...notifications.map((n) => AlertaTile(notification: n)),
                ],
              ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Verificar**

```bash
cd mobile && flutter analyze lib/features/alertas/
```

Expected: No issues found.

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/features/alertas/
git commit -m "feat(mobile/alertas): pantalla con Realtime y acciones contextuales"
```

---

## Task 5: Diario — steps engine y wizard

**Files:**
- Create: `mobile/lib/features/diario/diario_steps.dart`
- Create: `mobile/lib/features/diario/widgets/step_mood.dart`
- Create: `mobile/lib/features/diario/widgets/step_slider.dart`
- Create: `mobile/lib/features/diario/widgets/step_vitals.dart`
- Create: `mobile/lib/features/diario/widgets/step_boolean.dart`
- Create: `mobile/lib/features/diario/widgets/step_text.dart`
- Create: `mobile/lib/features/diario/registro_wizard.dart`
- Create: `mobile/lib/features/diario/diario_provider.dart`
- Create: `mobile/lib/features/diario/diario_screen.dart`
- Modify: `mobile/lib/core/router.dart`

- [ ] **Step 1: Crear `diario_steps.dart`**

```dart
// mobile/lib/features/diario/diario_steps.dart

enum StepType { mood, slider, vitals, boolean, text }

class DiarioStep {
  final String key;
  final String label;
  final StepType type;
  final String? hint;
  final String? unit;
  final double? min;
  final double? max;

  const DiarioStep({
    required this.key,
    required this.label,
    required this.type,
    this.hint,
    this.unit,
    this.min,
    this.max,
  });
}

const _stepMood = DiarioStep(
  key: 'mood', label: '¿Cómo te sientes hoy?', type: StepType.mood);

const _stepNota = DiarioStep(
  key: 'nota', label: 'Algo más que quieras anotar', type: StepType.text,
  hint: 'Síntomas, observaciones...');

const _stepFC = DiarioStep(
  key: 'heart_rate', label: 'Frecuencia cardíaca', type: StepType.vitals,
  unit: 'lpm', min: 30, max: 200);

const _stepTA = DiarioStep(
  key: 'bp', label: 'Presión arterial', type: StepType.vitals, unit: 'mmHg');

const _stepGlucosa = DiarioStep(
  key: 'glucose', label: 'Glucosa', type: StepType.vitals,
  unit: 'mg/dL', min: 20, max: 600);

const _stepTemp = DiarioStep(
  key: 'temperature', label: 'Temperatura (opcional)', type: StepType.vitals,
  unit: '°C', min: 34, max: 42);

const _stepDolor = DiarioStep(
  key: 'pain_intensity', label: 'Intensidad del dolor', type: StepType.slider,
  min: 0, max: 10);

const _stepEstres = DiarioStep(
  key: 'stress', label: 'Nivel de estrés', type: StepType.slider,
  min: 0, max: 10);

const _stepFatiga = DiarioStep(
  key: 'fatigue', label: 'Nivel de fatiga', type: StepType.slider,
  min: 0, max: 10);

const _stepAnimo = DiarioStep(
  key: 'mood_score', label: 'Estado de ánimo', type: StepType.slider,
  min: 0, max: 10);

const _stepAnsiedad = DiarioStep(
  key: 'anxiety', label: 'Nivel de ansiedad', type: StepType.slider,
  min: 0, max: 10);

const _stepSueno = DiarioStep(
  key: 'sleep_hours', label: 'Horas de sueño', type: StepType.slider,
  min: 0, max: 14);

const _stepNauseas = DiarioStep(
  key: 'nausea', label: '¿Náuseas o vómito?', type: StepType.boolean);

const _stepFotosensiblidad = DiarioStep(
  key: 'photosensitivity', label: '¿Fotosensibilidad?', type: StepType.boolean);

const _stepPalpitaciones = DiarioStep(
  key: 'palpitations', label: '¿Palpitaciones?', type: StepType.boolean);

const _stepEdema = DiarioStep(
  key: 'edema', label: '¿Edema en pies?', type: StepType.boolean);

const _stepDolPecho = DiarioStep(
  key: 'chest_pain', label: '¿Dolor en el pecho?', type: StepType.boolean);

const _stepHipoglucemia = DiarioStep(
  key: 'hypoglycemia', label: '¿Hipoglucemia hoy?', type: StepType.boolean);

const _stepSibilancias = DiarioStep(
  key: 'wheezing', label: '¿Sibilancias?', type: StepType.boolean);

const _stepInhalador = DiarioStep(
  key: 'rescue_inhaler', label: '¿Usó inhalador de rescate?', type: StepType.boolean);

const _stepRigidez = DiarioStep(
  key: 'morning_stiffness', label: '¿Rigidez matutina?', type: StepType.boolean);

const _stepBrote = DiarioStep(
  key: 'flare', label: '¿Brote activo?', type: StepType.boolean);

const _stepPensamientos = DiarioStep(
  key: 'intrusive_thoughts', label: '¿Pensamientos intrusivos?', type: StepType.boolean);

const _stepActividad = DiarioStep(
  key: 'activity', label: 'Nivel de actividad física', type: StepType.slider,
  min: 0, max: 10);

const _stepSaturacion = DiarioStep(
  key: 'oxygen_saturation', label: 'Saturación de O₂', type: StepType.vitals,
  unit: '%', min: 70, max: 100);

// Mapeo condición → keywords para detectar en condiciones_previas
const Map<String, List<String>> _conditionKeywords = {
  'neuro': ['migraña', 'epilepsia', 'esclerosis múltiple', 'parkinson',
             'neuropatía', 'ecv', 'ictus', 'alzheimer', 'neurológi'],
  'cardio': ['hipertensión', 'arritmia', 'insuficiencia cardíaca', 'cardiovascular',
              'cardíaco', 'corazón', 'ecv', 'ictus'],
  'metabolic': ['diabetes', 'glucosa', 'obesidad', 'hipotiroidismo', 'síndrome metabólico',
                 'insulina', 'tiroides'],
  'respiratory': ['asma', 'epoc', 'fibrosis pulmonar', 'pulmonar', 'respiratori'],
  'autoimmune': ['lupus', 'artritis reumatoide', 'fibromialgia', 'crohn', 'colitis',
                  'autoinmune', 'reumatológi'],
  'mental': ['depresión', 'ansiedad', 'bipolar', 'tdah', 'trastorno', 'mental'],
};

List<DiarioStep> buildStepsForConditions(List<String> condiciones) {
  final lower = condiciones.map((c) => c.toLowerCase()).toList();
  final detected = <String>{};

  for (final cat in _conditionKeywords.keys) {
    for (final kw in _conditionKeywords[cat]!) {
      if (lower.any((c) => c.contains(kw))) {
        detected.add(cat);
        break;
      }
    }
  }

  final steps = <DiarioStep>[_stepMood];
  final keys = <String>{};

  void add(DiarioStep s) {
    if (!keys.contains(s.key)) {
      steps.add(s);
      keys.add(s.key);
    }
  }

  if (detected.isEmpty) {
    add(_stepFC);
    add(_stepSueno);
    add(_stepActividad);
  } else {
    if (detected.contains('neuro')) {
      add(_stepDolor);
      add(_stepNauseas);
      add(_stepFotosensiblidad);
      add(_stepSueno);
      add(_stepEstres);
      add(_stepFC);
    }
    if (detected.contains('cardio')) {
      add(_stepTA);
      add(_stepFC);
      add(_stepPalpitaciones);
      add(_stepEdema);
      add(_stepDolPecho);
      add(_stepActividad);
    }
    if (detected.contains('metabolic')) {
      add(_stepGlucosa);
      add(_stepHipoglucemia);
      add(_stepActividad);
      add(_stepTA);
    }
    if (detected.contains('respiratory')) {
      add(_stepSibilancias);
      add(_stepInhalador);
      add(_stepFC);
      add(_stepSaturacion);
      add(_stepActividad);
    }
    if (detected.contains('autoimmune')) {
      add(_stepDolor);
      add(_stepRigidez);
      add(_stepFatiga);
      add(_stepBrote);
      add(_stepTemp);
      add(_stepSueno);
    }
    if (detected.contains('mental')) {
      add(_stepAnimo);
      add(_stepAnsiedad);
      add(_stepSueno);
      add(_stepPensamientos);
      add(_stepActividad);
    }
  }

  add(_stepTemp);  // siempre disponible al final como opcional
  add(_stepNota);  // siempre último
  return steps;
}
```

- [ ] **Step 2: Crear `widgets/step_mood.dart`**

```dart
// mobile/lib/features/diario/widgets/step_mood.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

const _moods = [
  ('😄', 'Muy bien', 5),
  ('🙂', 'Bien', 4),
  ('😐', 'Regular', 3),
  ('😕', 'Mal', 2),
  ('😞', 'Muy mal', 1),
];

class StepMood extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepMood({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final current = values[step.key] as int?;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: _moods.map((m) {
            final selected = current == m.$3;
            return GestureDetector(
              onTap: () => onChanged({...values, step.key: m.$3}),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: selected ? AliisColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selected ? AliisColors.primary : Colors.transparent,
                    width: 2),
                ),
                child: Column(
                  children: [
                    Text(m.$1, style: const TextStyle(fontSize: 28)),
                    const SizedBox(height: 4),
                    Text(m.$2,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: selected ? AliisColors.primary : AliisColors.mutedForeground,
                        fontWeight: selected ? FontWeight.w600 : FontWeight.normal)),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
```

- [ ] **Step 3: Crear `widgets/step_slider.dart`**

```dart
// mobile/lib/features/diario/widgets/step_slider.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepSlider extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepSlider({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final val = (values[step.key] as num?)?.toDouble() ?? (step.min ?? 0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        Center(
          child: Text(val.toInt().toString(),
            style: GoogleFonts.inter(
              fontSize: 56, fontWeight: FontWeight.w700,
              color: AliisColors.primary)),
        ),
        Slider(
          value: val,
          min: step.min ?? 0,
          max: step.max ?? 10,
          divisions: ((step.max ?? 10) - (step.min ?? 0)).toInt(),
          activeColor: AliisColors.primary,
          onChanged: (v) => onChanged({...values, step.key: v.toInt()}),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('${(step.min ?? 0).toInt()}',
              style: GoogleFonts.inter(fontSize: 11, color: AliisColors.mutedForeground)),
            Text('${(step.max ?? 10).toInt()}',
              style: GoogleFonts.inter(fontSize: 11, color: AliisColors.mutedForeground)),
          ],
        ),
      ],
    );
  }
}
```

- [ ] **Step 4: Crear `widgets/step_vitals.dart`**

```dart
// mobile/lib/features/diario/widgets/step_vitals.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepVitals extends StatefulWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepVitals({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  State<StepVitals> createState() => _StepVitalsState();
}

class _StepVitalsState extends State<StepVitals> {
  late final TextEditingController _ctrl;
  late final TextEditingController _ctrl2; // para diastólica en BP

  @override
  void initState() {
    super.initState();
    if (widget.step.key == 'bp') {
      final bp = widget.values['bp'] as Map?;
      _ctrl = TextEditingController(text: bp?['systolic']?.toString() ?? '');
      _ctrl2 = TextEditingController(text: bp?['diastolic']?.toString() ?? '');
    } else {
      _ctrl = TextEditingController(
        text: widget.values[widget.step.key]?.toString() ?? '');
      _ctrl2 = TextEditingController();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _ctrl2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isBp = widget.step.key == 'bp';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.step.label,
          style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        if (isBp)
          Row(
            children: [
              Expanded(child: _field(_ctrl, 'Sistólica', (v) {
                final bp = Map<String, dynamic>.from(
                  widget.values['bp'] as Map? ?? {});
                bp['systolic'] = int.tryParse(v);
                widget.onChanged({...widget.values, 'bp': bp});
              })),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text('/',
                  style: GoogleFonts.inter(fontSize: 32,
                    color: AliisColors.mutedForeground)),
              ),
              Expanded(child: _field(_ctrl2, 'Diastólica', (v) {
                final bp = Map<String, dynamic>.from(
                  widget.values['bp'] as Map? ?? {});
                bp['diastolic'] = int.tryParse(v);
                widget.onChanged({...widget.values, 'bp': bp});
              })),
            ],
          )
        else
          _field(_ctrl, widget.step.unit ?? '', (v) {
            final num? parsed = widget.step.key == 'temperature' || widget.step.key == 'glucose'
              ? double.tryParse(v)
              : int.tryParse(v);
            widget.onChanged({...widget.values, widget.step.key: parsed});
          }),
        if (widget.step.unit != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(widget.step.unit!,
              style: GoogleFonts.inter(
                fontSize: 13, color: AliisColors.mutedForeground)),
          ),
      ],
    );
  }

  Widget _field(TextEditingController c, String label, ValueChanged<String> onChange) {
    return TextField(
      controller: c,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[\d.]'))],
      textAlign: TextAlign.center,
      style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w700,
        color: AliisColors.primary),
      decoration: InputDecoration(
        hintText: label,
        hintStyle: GoogleFonts.inter(
          fontSize: 14, color: AliisColors.mutedForeground),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AliisColors.border)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
      ),
      onChanged: onChange,
    );
  }
}
```

- [ ] **Step 5: Crear `widgets/step_boolean.dart`**

```dart
// mobile/lib/features/diario/widgets/step_boolean.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepBoolean extends StatelessWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepBoolean({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final val = values[step.key] as bool?;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(step.label, style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 32),
        Row(
          children: [
            Expanded(child: _OptionBtn(
              label: 'Sí', selected: val == true,
              onTap: () => onChanged({...values, step.key: true}))),
            const SizedBox(width: 12),
            Expanded(child: _OptionBtn(
              label: 'No', selected: val == false,
              onTap: () => onChanged({...values, step.key: false}))),
          ],
        ),
      ],
    );
  }
}

class _OptionBtn extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _OptionBtn({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: selected ? AliisColors.primary : AliisColors.muted,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AliisColors.primary : AliisColors.border,
            width: 2),
        ),
        child: Center(
          child: Text(label,
            style: GoogleFonts.inter(
              fontSize: 18, fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AliisColors.foreground)),
        ),
      ),
    );
  }
}
```

- [ ] **Step 6: Crear `widgets/step_text.dart`**

```dart
// mobile/lib/features/diario/widgets/step_text.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../diario_steps.dart';

class StepText extends StatefulWidget {
  final DiarioStep step;
  final Map<String, dynamic> values;
  final ValueChanged<Map<String, dynamic>> onChanged;

  const StepText({
    super.key,
    required this.step,
    required this.values,
    required this.onChanged,
  });

  @override
  State<StepText> createState() => _StepTextState();
}

class _StepTextState extends State<StepText> {
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(
      text: widget.values[widget.step.key] as String? ?? '');
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.step.label,
          style: GoogleFonts.instrumentSerif(fontSize: 22)),
        const SizedBox(height: 8),
        if (widget.step.hint != null)
          Text(widget.step.hint!,
            style: GoogleFonts.inter(
              fontSize: 13, color: AliisColors.mutedForeground)),
        const SizedBox(height: 24),
        TextField(
          controller: _ctrl,
          maxLines: 5,
          onChanged: (v) => widget.onChanged(
            {...widget.values, widget.step.key: v}),
          decoration: InputDecoration(
            hintText: widget.step.hint ?? '',
            hintStyle: GoogleFonts.inter(color: AliisColors.mutedForeground),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AliisColors.border)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
          ),
        ),
      ],
    );
  }
}
```

- [ ] **Step 7: Crear `diario_provider.dart`**

```dart
// mobile/lib/features/diario/diario_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/symptom_log.dart';
import '../auth/auth_provider.dart';
import 'diario_steps.dart';

final diarioStepsProvider = FutureProvider.autoDispose<List<DiarioStep>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return buildStepsForConditions([]);

  final res = await supabase
    .from('medical_profiles')
    .select('condiciones_previas')
    .eq('user_id', session.user.id)
    .maybeSingle();

  final condiciones = res != null
    ? List<String>.from(res['condiciones_previas'] as List? ?? [])
    : <String>[];

  return buildStepsForConditions(condiciones);
});

final diarioHistorialProvider = FutureProvider.autoDispose<List<SymptomLog>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return [];

  final since30 = DateTime.now()
    .subtract(const Duration(days: 30))
    .toIso8601String();

  final rows = await supabase
    .from('symptom_logs')
    .select()
    .eq('user_id', session.user.id)
    .gte('logged_at', since30)
    .order('logged_at', ascending: false)
    .limit(30);

  return (rows as List)
    .map((r) => SymptomLog.fromJson(r as Map<String, dynamic>))
    .toList();
});

Future<void> guardarRegistro(String userId, Map<String, dynamic> values) async {
  final bp = values['bp'] as Map?;
  await supabase.from('symptom_logs').insert({
    'user_id': userId,
    'logged_at': DateTime.now().toIso8601String(),
    'glucose': values['glucose'],
    'bp_systolic': bp?['systolic'],
    'bp_diastolic': bp?['diastolic'],
    'heart_rate': values['heart_rate'],
    'temperature': values['temperature'],
    'note': values['nota'] as String?,
    'free_text': _buildFreeText(values),
  });
}

Map<String, dynamic> _buildFreeText(Map<String, dynamic> values) {
  final skip = {'glucose', 'bp', 'heart_rate', 'temperature', 'nota'};
  return Map.fromEntries(
    values.entries.where((e) => !skip.contains(e.key) && e.value != null));
}
```

- [ ] **Step 8: Crear `registro_wizard.dart`**

```dart
// mobile/lib/features/diario/registro_wizard.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/supabase_client.dart';
import '../../core/theme.dart';
import 'diario_provider.dart';
import 'diario_steps.dart';
import 'widgets/step_boolean.dart';
import 'widgets/step_mood.dart';
import 'widgets/step_slider.dart';
import 'widgets/step_text.dart';
import 'widgets/step_vitals.dart';

class RegistroWizard extends ConsumerStatefulWidget {
  const RegistroWizard({super.key});

  @override
  ConsumerState<RegistroWizard> createState() => _RegistroWizardState();
}

class _RegistroWizardState extends ConsumerState<RegistroWizard> {
  int _currentStep = 0;
  final Map<String, dynamic> _values = {};
  bool _saving = false;

  Widget _buildStep(DiarioStep step) {
    switch (step.type) {
      case StepType.mood:
        return StepMood(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.slider:
        return StepSlider(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.vitals:
        return StepVitals(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.boolean:
        return StepBoolean(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
      case StepType.text:
        return StepText(step: step, values: _values,
          onChanged: (v) => setState(() => _values.addAll(v)));
    }
  }

  Future<void> _guardar(List<DiarioStep> steps) async {
    setState(() => _saving = true);
    try {
      final userId = supabase.auth.currentUser!.id;
      await guardarRegistro(userId, _values);
      if (mounted) {
        ref.invalidate(diarioHistorialProvider);
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error guardando. Intenta de nuevo.',
            style: GoogleFonts.inter())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepsAsync = ref.watch(diarioStepsProvider);

    return stepsAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator())),
      error: (e, _) => const Scaffold(
        body: Center(child: Text('Error cargando pasos'))),
      data: (steps) {
        final step = steps[_currentStep];
        final isLast = _currentStep == steps.length - 1;
        final progress = (_currentStep + 1) / steps.length;

        return Scaffold(
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => context.pop(),
            ),
            title: Text('Registro de hoy',
              style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AliisColors.border,
                valueColor: const AlwaysStoppedAnimation(AliisColors.primary),
              ),
            ),
          ),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${_currentStep + 1} de ${steps.length}',
                    style: GoogleFonts.inter(
                      fontSize: 12, color: AliisColors.mutedForeground)),
                  const SizedBox(height: 24),
                  Expanded(child: _buildStep(step)),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      if (_currentStep > 0)
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => setState(() => _currentStep--),
                            child: Text('Atrás',
                              style: GoogleFonts.inter()),
                          ),
                        ),
                      if (_currentStep > 0) const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: FilledButton(
                          onPressed: _saving ? null : () {
                            if (isLast) {
                              _guardar(steps);
                            } else {
                              setState(() => _currentStep++);
                            }
                          },
                          style: FilledButton.styleFrom(
                            backgroundColor: AliisColors.primary,
                            minimumSize: const Size(double.infinity, 48),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12))),
                          child: _saving
                            ? const SizedBox(width: 20, height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                            : Text(isLast ? 'Guardar' : 'Siguiente',
                                style: GoogleFonts.inter(
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
```

- [ ] **Step 9: Crear `diario_screen.dart`**

```dart
// mobile/lib/features/diario/diario_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../shared/models/symptom_log.dart';
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
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Tu diario.',
                        style: Theme.of(context).textTheme.displayLarge),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () => context.push('/diario/registro'),
                        icon: const Icon(Icons.add, size: 18),
                        label: Text('Registrar hoy',
                          style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                        style: FilledButton.styleFrom(
                          backgroundColor: AliisColors.primary,
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12))),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
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
                            color: AliisColors.mutedForeground))))
                  : SliverPadding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _RegistroCard(log: logs[i]),
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

class _RegistroCard extends StatelessWidget {
  final SymptomLog log;
  const _RegistroCard({required this.log});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('EEE d MMM · HH:mm', 'es').format(log.loggedAt);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AliisColors.muted,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AliisColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(fecha,
            style: GoogleFonts.inter(
              fontSize: 11, color: AliisColors.mutedForeground)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8, runSpacing: 4,
            children: [
              if (log.glucose != null) _chip('Glucosa: ${log.glucose} mg/dL'),
              if (log.bpSystolic != null)
                _chip('TA: ${log.bpSystolic}/${log.bpDiastolic} mmHg'),
              if (log.heartRate != null) _chip('FC: ${log.heartRate} lpm'),
              if (log.temperature != null) _chip('Temp: ${log.temperature}°C'),
            ],
          ),
          if (log.note != null && log.note!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(log.note!,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.inter(
                fontSize: 12, color: AliisColors.foreground)),
          ],
        ],
      ),
    );
  }

  Widget _chip(String label) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: AliisColors.border,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(label,
      style: GoogleFonts.inter(fontSize: 10, color: AliisColors.foreground)),
  );
}
```

- [ ] **Step 10: Actualizar router con rutas de diario**

En `mobile/lib/core/router.dart`, reemplaza la rama de `/inicio` y agrega la rama de `/diario`:

```dart
// Agregar import al tope:
import '../features/diario/diario_screen.dart';
import '../features/diario/registro_wizard.dart';
```

Reemplazar la rama `/inicio` completa:
```dart
StatefulShellBranch(routes: [
  GoRoute(
    path: '/inicio',
    builder: (_, __) => const HomeScreen(),
  ),
]),
```

Agregar una nueva rama para `/diario` (fuera del StatefulShellRoute, como ruta de nivel superior, o como branch adicional si el diario tiene su tab). Como el diario no tiene tab propio, agregar la ruta como subruta del shell o como ruta fuera del shell. La forma más limpia es fuera del StatefulShellRoute:

```dart
routes: [
  GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
  GoRoute(
    path: '/diario',
    builder: (_, __) => const DiarioScreen(),
    routes: [
      GoRoute(
        path: 'registro',
        builder: (_, __) => const RegistroWizard(),
      ),
    ],
  ),
  StatefulShellRoute.indexedStack(/* ... */),
],
```

- [ ] **Step 11: Verificar**

```bash
cd mobile && flutter analyze lib/features/diario/ lib/core/router.dart
```

Expected: No issues found.

- [ ] **Step 12: Correr y probar wizard**

```bash
bash run.sh
```

Verificar: tap en "Registrar síntomas" abre wizard, pasos correctos según perfil, slider y booleans funcionan, guardar inserta en Supabase.

- [ ] **Step 13: Commit**

```bash
git add mobile/lib/features/diario/ mobile/lib/core/router.dart
git commit -m "feat(mobile/diario): wizard multi-step inteligente por condición"
```

---

## Task 6: Packs — lista y lector de capítulos

**Files:**
- Create: `mobile/lib/features/packs/packs_provider.dart`
- Create: `mobile/lib/features/packs/widgets/pack_card.dart`
- Create: `mobile/lib/features/packs/widgets/chapter_tab.dart`
- Create: `mobile/lib/features/packs/pack_reader.dart`
- Modify: `mobile/lib/features/packs/packs_screen.dart`
- Modify: `mobile/lib/core/router.dart`

- [ ] **Step 1: Crear `packs_provider.dart`**

```dart
// mobile/lib/features/packs/packs_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/pack.dart';
import '../auth/auth_provider.dart';

final packsProvider = FutureProvider.autoDispose<List<Pack>>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return [];

  final rows = await supabase
    .from('packs')
    .select('id, dx, summary, created_at, chapters')
    .eq('user_id', session.user.id)
    .order('created_at', ascending: false)
    .limit(20);

  return (rows as List)
    .map((r) => Pack.fromJson(r as Map<String, dynamic>))
    .toList();
});

final packDetailProvider = FutureProvider.autoDispose.family<Pack, String>((ref, packId) async {
  final row = await supabase
    .from('packs')
    .select('id, dx, summary, created_at, chapters')
    .eq('id', packId)
    .single();

  return Pack.fromJson(row as Map<String, dynamic>);
});
```

- [ ] **Step 2: Crear `widgets/pack_card.dart`**

```dart
// mobile/lib/features/packs/widgets/pack_card.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme.dart';
import '../../../shared/models/pack.dart';

class PackCard extends StatelessWidget {
  final Pack pack;
  final VoidCallback onTap;

  const PackCard({super.key, required this.pack, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fecha = DateFormat('d MMM yyyy', 'es').format(pack.createdAt);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AliisColors.muted,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AliisColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(pack.dx,
              style: GoogleFonts.instrumentSerif(
                fontSize: 18, color: AliisColors.foreground)),
            const SizedBox(height: 4),
            Text(fecha,
              style: GoogleFonts.inter(
                fontSize: 11, color: AliisColors.mutedForeground)),
            if (pack.summary != null) ...[
              const SizedBox(height: 8),
              Text(pack.summary!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.inter(
                  fontSize: 12, color: AliisColors.mutedForeground)),
            ],
            const SizedBox(height: 10),
            Text('${pack.chapters.length} capítulos',
              style: GoogleFonts.inter(
                fontSize: 11, color: AliisColors.primary,
                fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Crear `widgets/chapter_tab.dart`**

```dart
// mobile/lib/features/packs/widgets/chapter_tab.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../../../shared/models/pack.dart';

class ChapterTab extends StatelessWidget {
  final Chapter chapter;

  const ChapterTab({super.key, required this.chapter});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(chapter.n,
            style: GoogleFonts.inter(
              fontSize: 11, color: AliisColors.primary,
              fontWeight: FontWeight.w600, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Text(chapter.kicker,
            style: GoogleFonts.instrumentSerif(
              fontSize: 26, color: AliisColors.foreground)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AliisColors.muted,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AliisColors.border),
            ),
            child: Text(chapter.tldr,
              style: GoogleFonts.inter(
                fontSize: 13, color: AliisColors.foreground,
                fontStyle: FontStyle.italic)),
          ),
          const SizedBox(height: 24),
          ...chapter.paragraphs.map((p) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(p,
              style: GoogleFonts.inter(
                fontSize: 15, height: 1.7,
                color: AliisColors.foreground)),
          )),
        ],
      ),
    );
  }
}
```

- [ ] **Step 4: Crear `pack_reader.dart`**

```dart
// mobile/lib/features/packs/pack_reader.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'packs_provider.dart';
import 'widgets/chapter_tab.dart';

class PackReader extends ConsumerWidget {
  final String packId;
  const PackReader({super.key, required this.packId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packAsync = ref.watch(packDetailProvider(packId));

    return packAsync.when(
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Error cargando pack'))),
      data: (pack) => DefaultTabController(
        length: pack.chapters.length,
        child: Scaffold(
          appBar: AppBar(
            title: Text(pack.dx,
              style: GoogleFonts.inter(
                fontSize: 15, fontWeight: FontWeight.w600)),
            bottom: pack.chapters.length > 1
              ? TabBar(
                  isScrollable: true,
                  labelColor: AliisColors.primary,
                  unselectedLabelColor: AliisColors.mutedForeground,
                  indicatorColor: AliisColors.primary,
                  tabs: pack.chapters.map((c) =>
                    Tab(text: c.n)).toList(),
                )
              : null,
          ),
          body: pack.chapters.isEmpty
            ? Center(
                child: Text('Sin capítulos',
                  style: GoogleFonts.inter(
                    color: AliisColors.mutedForeground)))
            : TabBarView(
                children: pack.chapters
                  .map((c) => ChapterTab(chapter: c))
                  .toList(),
              ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 5: Reemplazar `packs_screen.dart`**

```dart
// mobile/lib/features/packs/packs_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import 'packs_provider.dart';
import 'widgets/pack_card.dart';

class PacksScreen extends ConsumerWidget {
  const PacksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final packsAsync = ref.watch(packsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => ref.invalidate(packsProvider),
          child: packsAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(
              child: Text('Error cargando packs',
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (packs) => packs.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.menu_book_outlined,
                        size: 48, color: AliisColors.border),
                      const SizedBox(height: 12),
                      Text('Aún no tienes packs',
                        style: GoogleFonts.inter(
                          color: AliisColors.mutedForeground)),
                    ],
                  ))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text('Tus\npacks.',
                      style: Theme.of(context).textTheme.displayLarge),
                    const SizedBox(height: 20),
                    ...packs.map((p) => PackCard(
                      pack: p,
                      onTap: () => context.push('/packs/${p.id}'),
                    )),
                  ],
                ),
          ),
        ),
      ),
    );
  }
}
```

- [ ] **Step 6: Agregar ruta `/packs/:id` al router**

En `mobile/lib/core/router.dart`, agregar import:
```dart
import '../features/packs/pack_reader.dart';
```

Dentro de la rama de `/packs`:
```dart
StatefulShellBranch(routes: [
  GoRoute(
    path: '/packs',
    builder: (_, __) => const PacksScreen(),
    routes: [
      GoRoute(
        path: ':id',
        builder: (_, state) => PackReader(
          packId: state.pathParameters['id']!),
      ),
    ],
  ),
]),
```

- [ ] **Step 7: Verificar**

```bash
cd mobile && flutter analyze lib/features/packs/
```

Expected: No issues found.

- [ ] **Step 8: Commit**

```bash
git add mobile/lib/features/packs/ mobile/lib/core/router.dart
git commit -m "feat(mobile/packs): lista de packs y lector de capítulos"
```

---

## Task 7: Perfil — tratamientos, cuenta y configuración

**Files:**
- Create: `mobile/lib/features/perfil/perfil_provider.dart`
- Create: `mobile/lib/features/perfil/widgets/tratamiento_tile.dart`
- Create: `mobile/lib/features/perfil/widgets/tratamiento_form.dart`
- Modify: `mobile/lib/features/perfil/perfil_screen.dart`

- [ ] **Step 1: Crear `perfil_provider.dart`**

```dart
// mobile/lib/features/perfil/perfil_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/supabase_client.dart';
import '../../shared/models/treatment.dart';
import '../auth/auth_provider.dart';

class PerfilData {
  final String? name;
  final String plan;
  final String? nextAppointment;
  final List<Treatment> treatments;

  const PerfilData({
    this.name,
    required this.plan,
    this.nextAppointment,
    required this.treatments,
  });
}

final perfilProvider = FutureProvider.autoDispose<PerfilData>((ref) async {
  final session = ref.watch(sessionProvider).valueOrNull;
  if (session == null) return PerfilData(plan: 'free', treatments: []);

  final userId = session.user.id;
  final results = await Future.wait([
    supabase.from('profiles')
      .select('name, plan, next_appointment')
      .eq('id', userId)
      .single(),
    supabase.from('treatments')
      .select()
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', ascending: true),
  ]);

  final profile = results[0] as Map<String, dynamic>;
  final treatments = (results[1] as List)
    .map((r) => Treatment.fromJson(r as Map<String, dynamic>))
    .toList();

  return PerfilData(
    name: profile['name'] as String?,
    plan: profile['plan'] as String? ?? 'free',
    nextAppointment: profile['next_appointment'] as String?,
    treatments: treatments,
  );
});

Future<void> archivarTratamiento(String treatmentId, WidgetRef ref) async {
  await supabase.from('treatments')
    .update({'active': false, 'updated_at': DateTime.now().toIso8601String()})
    .eq('id', treatmentId);
  ref.invalidate(perfilProvider);
}
```

- [ ] **Step 2: Crear `widgets/tratamiento_tile.dart`**

```dart
// mobile/lib/features/perfil/widgets/tratamiento_tile.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme.dart';
import '../../../shared/models/treatment.dart';
import '../perfil_provider.dart';

class TratamientoTile extends ConsumerWidget {
  final Treatment treatment;

  const TratamientoTile({super.key, required this.treatment});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dismissible(
      key: Key(treatment.id),
      direction: DismissDirection.endToStart,
      background: Container(
        color: AliisColors.destructive,
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        child: const Icon(Icons.archive_outlined, color: Colors.white),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text('Archivar tratamiento',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            content: Text('¿Archivar ${treatment.name}?',
              style: GoogleFonts.inter()),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: Text('Cancelar', style: GoogleFonts.inter())),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: Text('Archivar',
                  style: GoogleFonts.inter(color: AliisColors.destructive))),
            ],
          ),
        ) ?? false;
      },
      onDismissed: (_) => archivarTratamiento(treatment.id, ref),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AliisColors.muted,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AliisColors.border),
        ),
        child: Row(
          children: [
            const Icon(Icons.medication_outlined,
              color: AliisColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(treatment.displayName,
                    style: GoogleFonts.inter(
                      fontSize: 14, fontWeight: FontWeight.w600,
                      color: AliisColors.foreground)),
                  if (treatment.frequencyLabel != null)
                    Text(treatment.frequencyLabel!,
                      style: GoogleFonts.inter(
                        fontSize: 12, color: AliisColors.mutedForeground)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 3: Crear `widgets/tratamiento_form.dart`**

```dart
// mobile/lib/features/perfil/widgets/tratamiento_form.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/supabase_client.dart';
import '../../../core/theme.dart';
import '../perfil_provider.dart';

class TratamientoForm extends ConsumerStatefulWidget {
  const TratamientoForm({super.key});

  @override
  ConsumerState<TratamientoForm> createState() => _TratamientoFormState();
}

class _TratamientoFormState extends ConsumerState<TratamientoForm> {
  final _nameCtrl = TextEditingController();
  final _doseCtrl = TextEditingController();
  final _freqCtrl = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _doseCtrl.dispose();
    _freqCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final userId = supabase.auth.currentUser!.id;
      await supabase.from('treatments').insert({
        'user_id': userId,
        'name': _nameCtrl.text.trim(),
        'dose': _doseCtrl.text.trim().isEmpty ? null : _doseCtrl.text.trim(),
        'frequency_label': _freqCtrl.text.trim().isEmpty ? null : _freqCtrl.text.trim(),
        'frequency': 'other',
        'indefinite': true,
        'active': true,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
      ref.invalidate(perfilProvider);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error guardando', style: GoogleFonts.inter())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20,
        MediaQuery.of(context).viewInsets.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Nuevo tratamiento',
            style: GoogleFonts.instrumentSerif(fontSize: 20)),
          const SizedBox(height: 20),
          TextField(
            controller: _nameCtrl,
            decoration: _inputDeco('Nombre del medicamento *'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _doseCtrl,
            decoration: _inputDeco('Dosis (ej. 50mg)'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _freqCtrl,
            decoration: _inputDeco('Frecuencia (ej. Una vez al día)'),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _saving ? null : _guardar,
            style: FilledButton.styleFrom(
              backgroundColor: AliisColors.primary,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12))),
            child: _saving
              ? const SizedBox(width: 20, height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Text('Guardar', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.inter(color: AliisColors.mutedForeground, fontSize: 13),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AliisColors.border)),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: AliisColors.primary, width: 2)),
  );
}
```

- [ ] **Step 4: Reemplazar `perfil_screen.dart`**

```dart
// mobile/lib/features/perfil/perfil_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
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
                style: GoogleFonts.inter(color: AliisColors.mutedForeground))),
            data: (data) => ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Text('Tu perfil.',
                  style: Theme.of(context).textTheme.displayLarge),
                const SizedBox(height: 24),

                // Cuenta
                _SectionHeader('Mi cuenta'),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AliisColors.muted,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AliisColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(data.name ?? 'Usuario',
                              style: GoogleFonts.inter(
                                fontSize: 16, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(data.plan == 'pro' ? 'Plan Pro' : 'Plan Free',
                              style: GoogleFonts.inter(
                                fontSize: 12, color: AliisColors.mutedForeground)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: data.plan == 'pro'
                            ? AliisColors.primary.withValues(alpha: 0.1)
                            : AliisColors.border,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          data.plan == 'pro' ? 'Pro' : 'Free',
                          style: GoogleFonts.inter(
                            fontSize: 11, fontWeight: FontWeight.w600,
                            color: data.plan == 'pro'
                              ? AliisColors.primary
                              : AliisColors.mutedForeground)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Tratamientos
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const _SectionHeader('Tratamientos'),
                    IconButton(
                      icon: const Icon(Icons.add, color: AliisColors.primary),
                      onPressed: () => showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
                        builder: (_) => const TratamientoForm(),
                      ),
                    ),
                  ],
                ),
                if (data.treatments.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text('Sin tratamientos activos',
                      style: GoogleFonts.inter(
                        color: AliisColors.mutedForeground, fontSize: 13)),
                  )
                else
                  ...data.treatments.map((t) => TratamientoTile(treatment: t)),
                const SizedBox(height: 24),

                // Suscripción
                if (data.plan == 'pro') ...[
                  _SectionHeader('Suscripción'),
                  OutlinedButton(
                    onPressed: () => launchUrl(
                      Uri.parse('https://aliis.app/portal'),
                      mode: LaunchMode.externalApplication),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      side: const BorderSide(color: AliisColors.border),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                    child: Text('Gestionar suscripción',
                      style: GoogleFonts.inter(color: AliisColors.foreground)),
                  ),
                  const SizedBox(height: 24),
                ],

                // Cerrar sesión
                OutlinedButton(
                  onPressed: () => ref.read(authProvider).signOut(),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    side: const BorderSide(color: AliisColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
                  child: Text('Cerrar sesión',
                    style: GoogleFonts.inter(color: AliisColors.foreground)),
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

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(title,
      style: GoogleFonts.inter(
        fontSize: 11, fontWeight: FontWeight.w600,
        color: AliisColors.mutedForeground,
        letterSpacing: 0.5,
        decoration: TextDecoration.none)),
  );
}
```

- [ ] **Step 5: Agregar `url_launcher` a pubspec.yaml**

```yaml
# mobile/pubspec.yaml — en dependencies:
  url_launcher: ^6.3.0
```

```bash
cd mobile && flutter pub get
```

- [ ] **Step 6: Verificar**

```bash
cd mobile && flutter analyze lib/features/perfil/
```

Expected: No issues found.

- [ ] **Step 7: Commit**

```bash
git add mobile/lib/features/perfil/ mobile/pubspec.yaml mobile/pubspec.lock
git commit -m "feat(mobile/perfil): tratamientos, cuenta y configuración"
```

---

## Task 8: Verificación final e integración

**Files:**
- No files nuevos — verificación integral

- [ ] **Step 1: flutter analyze global**

```bash
cd mobile && flutter analyze lib/
```

Expected: No issues found.

- [ ] **Step 2: Correr en simulador y navegar todas las pantallas**

```bash
bash run.sh
```

Checklist manual:
- [ ] Home carga medicamentos del día
- [ ] Tap en círculo marca como tomado (actualización optimista)
- [ ] Todos tomados → celebración card
- [ ] Botón "Registrar síntomas" abre wizard
- [ ] Wizard muestra pasos según condiciones del perfil
- [ ] Guardar registro inserta en Supabase
- [ ] Packs muestra lista → tap abre lector
- [ ] Lector navega capítulos con tabs
- [ ] Alertas muestra lista en tiempo real
- [ ] Swipe en alerta → marca como leída
- [ ] Botón de acción contextual funciona
- [ ] Perfil muestra tratamientos
- [ ] Swipe en tratamiento → confirmar → archiva
- [ ] Botón "+" abre form → guardar agrega tratamiento
- [ ] Cerrar sesión redirige a login

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat(mobile): Fase 2A completa — 5 pantallas con datos reales"
```

---

## Self-Review

**Spec coverage:**
- ✅ Home layout B con alerta arriba, adherencia, métricas, botón diario
- ✅ Card celebración cuando todos los meds tomados
- ✅ Diario paso a paso con mapeo inteligente por condición (6 grupos)
- ✅ Peso fuera del diario — no implementado aquí (recordatorio anual out of scope)
- ✅ Packs sin chat por capítulo
- ✅ Alertas con Realtime y acciones contextuales por tipo
- ✅ Perfil con tratamientos, cuenta, suscripción, cerrar sesión

**Tipos consistentes:**
- `Treatment.fromJson` usada en Task 1, Task 2, Task 7 ✅
- `SymptomLog.fromJson` usada en Task 1, Task 5 ✅
- `AppNotification.fromJson` usada en Task 1, Task 4 ✅
- `Pack.fromJson` / `Chapter.fromJson` usadas en Task 1, Task 6 ✅
- `homeProvider` → `HomeData` con `allTakenToday`, `takenToday`, `treatments` ✅
- `diarioStepsProvider` retorna `List<DiarioStep>` ✅
- `guardarRegistro(userId, values)` en Task 5 y Task 5 wizard ✅
