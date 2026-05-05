# Flutter Fase 2A — Pantallas con Datos Reales

**Fecha:** 2026-05-06
**Alcance:** Implementar las 5 pantallas principales de la app Flutter con datos reales desde Supabase: Home, Diario, Packs, Alertas y Perfil.

---

## Goal

Convertir los placeholders de la Fase 1 en pantallas funcionales. El paciente puede ver y registrar su adherencia, registrar síntomas en un flujo adaptado a su condición, leer sus packs educativos, ver alertas con acciones contextuales y gestionar su perfil y tratamientos.

---

## Arquitectura

Cada pantalla sigue el mismo patrón:
- **Provider** (Riverpod) — carga datos desde Supabase, expone `AsyncValue<T>`
- **Screen** — consume el provider, maneja loading/error/data states
- **Widgets** — componentes reutilizables dentro de la feature

Todas las escrituras a Supabase van directo desde Flutter (sin BFF). Las lecturas usan `.stream()` de supabase_flutter donde se necesita Realtime (alertas), `.select()` para el resto.

---

## Pantalla de Inicio (`home/`)

### Layout

```
┌─────────────────────────────┐
│ Martes 6 de mayo            │
│ Buenos días, Oscar          │
├─────────────────────────────┤
│ ⚠ ALERTA (si existe)        │  ← solo si hay alerta activa
├─────────────────────────────┤
│ MEDICAMENTOS HOY            │
│ ○ Topiramato 50mg  [Tomar]  │
│ ✓ Amitriptilina    Tomado   │
├─────────────────────────────┤
│  85%          7 días        │
│ Adherencia  Registrados     │
├─────────────────────────────┤
│    + Registrar síntomas     │
└─────────────────────────────┘
```

### Comportamiento

- **Alerta prioritaria:** si `aliis_insights` tiene una señal `level: 'high'` del día, aparece arriba en ámbar/rojo. Tap navega a Alertas.
- **Card de medicamentos:** lista `treatments` activos con `adherence_logs` del día. Tap en círculo vacío → inserta `adherence_log` con `status: 'taken'`. Actualización optimista.
- **Estado completado:** cuando todos los medicamentos del día están marcados, la card se reemplaza por mensaje de celebración: "¡Todo al día hoy! 🎉" en verde, con el porcentaje de la semana.
- **Métricas en grid 2x2:** adherencia 14d (de `patient_context`) + días con registro en los últimos 30d.
- **Botón diario:** navega a `/diario` con `push`.

### Datos

```dart
// home_provider.dart
final homeProvider = FutureProvider<HomeData>((ref) async {
  // treatments activos
  // adherence_logs de hoy
  // última alerta activa
  // métricas (adherencia 14d, días registrados 30d)
});
```

---

## Pantalla de Diario (`diario/`)

### Flujo paso a paso

Formulario multi-step. Los pasos se generan dinámicamente según `condiciones_previas` del perfil médico.

**Paso siempre presente (primero):**
- Mood: Muy bien / Bien / Regular / Mal / Muy mal (iconos + colores)

**Pasos por condición** (se deduplicarán si hay múltiples condiciones):

| Condición | Pasos adicionales |
|---|---|
| Neurología (migraña, epilepsia, EM, Parkinson, neuropatía, ECV) | Intensidad dolor 0-10, localización, duración episodio, náuseas/vómito, fotosensibilidad, horas de sueño, estrés 0-10, FC |
| Cardiovascular (hipertensión, arritmia, IC, ECV) | Presión arterial, FC, ¿palpitaciones?, ¿edema?, ¿dolor en pecho?, actividad física |
| Metabólico (diabetes, obesidad, hipotiroidismo, síndrome metabólico) | Glucosa mg/dL, ¿ayuno o postprandial?, unidades insulina, ¿hipoglucemia?, actividad física, presión arterial |
| Respiratorio (asma, EPOC, fibrosis) | ¿Falta de aire?, ¿sibilancias?, ¿usó inhalador de rescate?, FC, saturación O₂, actividad |
| Autoinmune/Reumatológico (lupus, AR, fibromialgia, Crohn, colitis) | Intensidad dolor 0-10, articulaciones afectadas, ¿rigidez matutina?, fatiga 0-10, ¿brote activo?, temperatura, horas de sueño |
| Salud mental (depresión, ansiedad, bipolar, TDAH) | Estado de ánimo 0-10, ansiedad 0-10, horas de sueño, calidad sueño, energía, ¿pensamientos intrusivos?, actividad social |
| Sin condiciones / genérico | FC, temperatura (opcional), horas de sueño, nivel de energía |

**Paso siempre presente (último):**
- Nota libre — texto libre para síntomas y observaciones del día

**Temperatura:** siempre opcional, aparece en todos los flujos como paso saltable.

**Peso:** NO en el diario. Se captura en onboarding. Recordatorio anual in-app ("Han pasado 12 meses desde tu último registro de peso").

### Historial

Debajo del botón "Registrar", lista de registros pasados en cards ordenadas por fecha. Cada card muestra mood, métricas clave del día y nota truncada.

### Datos

```dart
// diario_provider.dart
final diarioStepsProvider = Provider<List<DiarioStep>>((ref) {
  // Lee condiciones del perfil médico
  // Retorna lista de steps deduplicados
});

final diarioHistorialProvider = FutureProvider<List<SymptomLog>>((ref) async {
  // Últimos 30 registros de symptom_logs
});
```

Escritura: `INSERT INTO symptom_logs` con todos los campos del paso completado.

---

## Pantalla de Packs (`packs/`)

### Lista

- Cards con: nombre del diagnóstico (`dx`), fecha de creación, chip de condición.
- Sin paginación en MVP — máximo 20 packs por usuario.

### Lector

- Navegación por capítulos: tab horizontal o swipe.
- Tipografía: Instrument Serif para títulos, Inter para cuerpo.
- Progreso de lectura: barra superior que avanza por capítulo.
- Sin chat por capítulo — el FAB central de Aliis cubre esa función.
- `screen_context: 'pack'` se pasa al agente cuando se abre Aliis desde esta pantalla.

### Datos

```dart
final packsProvider = FutureProvider<List<Pack>>((ref) async {
  // SELECT packs WHERE user_id = ... ORDER BY created_at DESC LIMIT 20
});

final packDetailProvider = FutureProvider.family<PackDetail, String>((ref, packId) async {
  // SELECT pack + chapters WHERE pack_id = ...
});
```

---

## Pantalla de Alertas (`alertas/`)

### Lista

- Realtime subscription a tabla `app_notifications` filtrada por `user_id`.
- Notificaciones no leídas arriba, separador visual, leídas abajo.
- Swipe para marcar como leída. Tap también marca como leída.

### Acciones contextuales

Cada notificación tiene un botón de acción según su `type`:

| Tipo | Acción | Destino |
|---|---|---|
| `reminder` (adherencia) | "Marcar como tomado" | Inserta `adherence_log` inline |
| `red_flag` / síntoma | "Registrar en diario" | Navega a `/diario` |
| `insight` (consulta próxima) | "Preparar resumen" | POST `/api/aliis/consult` |
| Cualquier otro | "Preguntarle a Aliis" | Abre `AliisSheet` |

### Datos

```dart
final alertasProvider = StreamProvider<List<AppNotification>>((ref) {
  return supabase
    .from('app_notifications')
    .stream(primaryKey: ['id'])
    .eq('user_id', userId)
    .order('created_at', ascending: false);
});
```

---

## Pantalla de Perfil (`perfil/`)

### Secciones

1. **Tratamientos activos** — lista de `treatments` con nombre, dosis y frecuencia. Botón "+" para agregar nuevo. Swipe para archivar (`active = false`). Tap para editar.
2. **Mi cuenta** — nombre, plan (Free/Pro con chip de color).
3. **Notificaciones push** — toggle. Al activar: solicita permisos de notificación del sistema. Al desactivar: actualiza `profiles.fcm_token = null`.
4. **Gestionar suscripción** — botón que abre `profiles.stripe_portal_url` en Safari/WebView. Solo visible si `plan = 'pro'`.
5. **Cerrar sesión** — llama `supabase.auth.signOut()`, GoRouter redirige a `/login`.

### Datos

```dart
final perfilProvider = FutureProvider<PerfilData>((ref) async {
  // profiles + treatments activos + medical_profiles
});
```

---

## Estructura de archivos

```
mobile/lib/features/
├── home/
│   ├── home_screen.dart
│   ├── home_provider.dart
│   ├── widgets/
│   │   ├── adherencia_card.dart
│   │   ├── alerta_banner.dart
│   │   ├── metricas_grid.dart
│   │   └── celebracion_card.dart
├── diario/
│   ├── diario_screen.dart        ← historial + botón registrar
│   ├── registro_wizard.dart      ← flujo multi-step
│   ├── diario_provider.dart
│   ├── diario_steps.dart         ← mapeo condición → steps
│   └── widgets/
│       ├── step_mood.dart
│       ├── step_slider.dart      ← dolor, estrés, fatiga (0-10)
│       ├── step_vitals.dart      ← glucosa, presión, FC, O₂
│       ├── step_boolean.dart     ← ¿palpitaciones?, ¿náuseas?, etc.
│       ├── step_text.dart        ← nota libre
│       └── registro_card.dart    ← card del historial
├── packs/
│   ├── packs_screen.dart
│   ├── pack_reader.dart
│   ├── packs_provider.dart
│   └── widgets/
│       ├── pack_card.dart
│       └── chapter_tab.dart
├── alertas/
│   ├── alertas_screen.dart
│   ├── alertas_provider.dart
│   └── widgets/
│       └── alerta_tile.dart      ← tile con acción contextual
└── perfil/
    ├── perfil_screen.dart
    ├── perfil_provider.dart
    └── widgets/
        ├── tratamiento_tile.dart
        └── tratamiento_form.dart
```

---

## Cambios al backend existente

Ninguno. Esta fase usa solo tablas y endpoints existentes:
- `treatments`, `adherence_logs`, `symptom_logs`, `app_notifications`, `profiles`, `medical_profiles`, `packs`, `aliis_insights`
- `POST /api/aliis/agent` (Aliis FAB)
- `POST /api/aliis/consult` (resumen de consulta desde alerta)

---

## Fuera de scope

- HealthKit / Health Connect → Fase 2B
- Push nativa FCM → Fase 2B
- Offline con Drift → Fase 2B
- OCR de recetas → Fase 2C
- Widgets de pantalla de inicio → Fase 3
