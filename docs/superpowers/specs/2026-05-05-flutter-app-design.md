# Aliis Mobile — Flutter App Design
**Fecha:** 2026-05-05
**Alcance:** App Flutter iOS + Android para pacientes con enfermedades crónicas

---

## Visión

App nativa Flutter que replica las features core de la web de Aliis con experiencia móvil de primera clase: animaciones fluidas, notificaciones nativas, integración con HealthKit/Health Connect, y el mismo backend (Supabase + Next.js APIs) que usa la web. Los datos son consistentes entre web y móvil — misma cuenta, misma DB.

---

## Usuarios

Paciente con enfermedad crónica. Misma cuenta que la web — login con email+password o Google (mismo provider Supabase ya configurado). No hay usuario adicional en el MVP.

---

## Navegación

Bottom navigation bar con 5 posiciones — botón central elevado para Aliis:

```
[ Inicio ]  [ Packs ]  [ ⊕ Aliis ]  [ Alertas ]  [ Perfil ]
```

- **Inicio** — "Lo que te toca hoy": adherencia del día, alertas activas, insight de Aliis, diario de síntomas rápido
- **Packs** — Lista de packs educativos del usuario + lector por capítulos
- **Aliis (FAB central)** — Abre bottom sheet con chat streaming, igual que el drawer web
- **Alertas** — Notificaciones in-app (Realtime), historial de alertas
- **Perfil** — Tratamientos, cuenta, configuración de notificaciones push

**Transiciones:**
- Entre tabs: shared axis horizontal (animations package)
- Abrir pack: Hero animation desde card a pantalla de lectura
- Cargar listas: fade through
- FAB Aliis: spring physics al abrirse el bottom sheet
- Chat streaming: fade-in letra por letra + dots bounce + shimmer "pensando"

---

## Arquitectura

### Stack

| Capa | Tecnología |
|---|---|
| Framework | Flutter (iOS + Android) |
| State management | Riverpod |
| Navegación | GoRouter (deep links desde push) |
| Auth | supabase_flutter + google_sign_in |
| DB remota | Supabase (misma instancia que web) |
| Caché local | Drift (SQLite) |
| Push nativas | Firebase Cloud Messaging (FCM) + APNs |
| Health | health package (HealthKit + Health Connect) |
| IA / streaming | HTTP + dart:io para SSE |
| Animaciones | animations + flutter_animate |
| Tipografía | google_fonts (Inter + Instrument Serif) |

### Flujo de datos

**Flutter → Supabase directo** (lecturas/escrituras de datos del paciente):
- `symptom_logs` — registrar y leer diario
- `adherence_logs` — marcar medicamentos
- `treatments` — leer tratamientos activos
- `packs` — leer packs y capítulos
- `notifications` — leer alertas + Realtime subscription
- `profiles` — plan, nombre, onboarding_done, fcm_token

**Flutter → Next.js `/api/aliis/*`** (features de IA):
- `POST /api/aliis/agent` — chat con Aliis (streaming SSE)
- `POST /api/aliis/insight` — insight del día
- `POST /api/aliis/consult` — resumen pre-consulta
- `POST /api/push/mobile/subscribe` — registrar FCM token ← nuevo

El token de Supabase se pasa en `Authorization: Bearer <token>` en todos los requests a Next.js.

### Offline

Drift (SQLite local) cachea `symptom_logs`, `adherence_logs` y `treatments`. Al recuperar conexión sincroniza con Supabase. La pantalla de Inicio y Diario funcionan offline para lectura; escritura se encola y sincroniza.

---

## Pantallas

### Auth
- **LoginScreen** — email+password + botón "Continuar con Google"
- **OnboardingScreen** — solo si `onboarding_done = false` (mismo flujo que web)

### Inicio (`home/`)
- Header: fecha de hoy + saludo con nombre del paciente
- **Card de adherencia**: medicamentos del día, marcar tomado/omitido con tap
- **Card de alerta prioritaria**: si hay señal de AliisCore (roja, ámbar)
- **Card insight**: último insight generado por Aliis
- **Acceso rápido al diario**: botón "+ Registrar síntomas"

### Diario (`diario/`)
- Formulario de registro: glucosa, presión, FC, peso, temperatura, nota libre
- Pre-llenado desde HealthKit/Health Connect si hay permisos
- Historial de registros en cards ordenadas por fecha

### Packs (`packs/`)
- Lista de packs del usuario con dx, fecha y progreso de lectura
- Lector de capítulos con tipografía serif, scroll suave
- Chat por capítulo (llama a `/api/chat`)

### Aliis (bottom sheet)
- Mismo comportamiento que AliisAgentDrawer web
- Streaming SSE: dots bounce + "pensando" shimmer → texto aparece letra por letra
- Historial de la sesión en memoria (10 turnos)
- Memoria persistente Pro (ChatAgent patterns) igual que en web

### Alertas (`alertas/`)
- Lista de notificaciones in-app
- Realtime subscription a tabla `notifications`
- Marcar como leída con swipe o tap

### Perfil (`perfil/`)
- **TratamientosScreen** — lista de tratamientos activos, agregar/editar/archivar
- Datos de cuenta: nombre, plan (Free/Pro)
- Toggle de notificaciones push
- Enlace a portal de Stripe (abre WebView o Safari)
- Cerrar sesión

---

## Cambios al backend existente

Mínimos — solo 3 adiciones:

### 1. Columna `fcm_token` en `profiles`
```sql
alter table profiles add column if not exists fcm_token text;
```

### 2. Endpoint `POST /api/push/mobile/subscribe`
Guarda el FCM token del dispositivo en `profiles.fcm_token`. Auth requerida. Reemplaza el token si ya existe (un usuario puede reinstalar la app).

### 3. Extender cron `notify`
Después de enviar web push, si el usuario tiene `fcm_token`, enviar también notificación FCM via Firebase Admin SDK. Los dos canales son independientes — un usuario con app y web recibe en ambos.

---

## Paquetes (`pubspec.yaml`)

```yaml
dependencies:
  supabase_flutter: ^2.x
  google_sign_in: ^6.x
  flutter_riverpod: ^2.x
  riverpod: ^2.x
  go_router: ^14.x
  google_fonts: ^6.x
  animations: ^2.x
  flutter_animate: ^4.x
  drift: ^2.x
  drift_flutter: ^0.x
  http: ^1.x
  health: ^10.x
  firebase_core: ^3.x
  firebase_messaging: ^15.x
  intl: ^0.19.x
  shared_preferences: ^2.x
```

---

## Estructura de archivos

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── supabase.dart
│   │   ├── router.dart
│   │   ├── theme.dart
│   │   └── constants.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── auth_provider.dart
│   │   ├── home/
│   │   │   ├── home_screen.dart
│   │   │   └── home_provider.dart
│   │   ├── diario/
│   │   │   ├── diario_screen.dart
│   │   │   ├── registro_form.dart
│   │   │   └── diario_provider.dart
│   │   ├── packs/
│   │   │   ├── packs_screen.dart
│   │   │   ├── pack_reader.dart
│   │   │   └── packs_provider.dart
│   │   ├── alertas/
│   │   │   ├── alertas_screen.dart
│   │   │   └── alertas_provider.dart
│   │   ├── perfil/
│   │   │   ├── perfil_screen.dart
│   │   │   ├── tratamientos_screen.dart
│   │   │   └── perfil_provider.dart
│   │   └── aliis/
│   │       ├── aliis_sheet.dart
│   │       └── aliis_provider.dart
│   └── shared/
│       ├── widgets/
│       ├── models/
│       └── services/
│           ├── health_service.dart
│           └── push_service.dart
├── ios/
├── android/
└── pubspec.yaml
```

---

## Fuera de scope (MVP)

- OCR de recetas → Fase 2
- Widgets de pantalla de inicio → Fase 3
- Modo familiar → después del MVP
- Pagos in-app (Apple 3.1.1 — Stripe solo en web)
- Android/iOS app store submission → Fase 3

---

## Decisiones de diseño

- **Sin BFF propio**: Flutter habla directo con Supabase + reutiliza endpoints Next.js existentes. Sin infraestructura extra.
- **Drift para offline**: SQLite local para las tablas de uso diario. Sincronización optimista al recuperar conexión.
- **FCM separado de web push**: dos canales independientes. Un usuario con app y web recibe en ambos. El cron existente se extiende, no se reemplaza.
- **Stripe solo en web**: Apple 3.1.1 prohíbe pagos in-app fuera de IAP. El perfil muestra el plan y enlaza al portal web.
- **Google Sign-In**: mismo provider OAuth ya configurado en Supabase. Sin trabajo backend adicional.
