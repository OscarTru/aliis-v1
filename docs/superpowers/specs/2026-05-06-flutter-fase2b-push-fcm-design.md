# Flutter Fase 2B — Push Nativa FCM con Smart Reminders

## Objetivo

Implementar push notifications nativas en la app Flutter de Aliis usando Firebase Cloud Messaging (FCM). Las notificaciones no son recordatorios fijos — son **smart reminders**: un Edge Function de Supabase analiza patrones de adherencia con Claude y decide si enviar, qué decir, y a qué pantalla llevar al usuario.

## Arquitectura general

Tres capas independientes que se conectan:

1. **Flutter** — registra el device token, recibe pushes en cualquier estado (foreground/background/killed), hace deep link a la pantalla correcta
2. **Supabase** — almacena tokens, corre el Edge Function `smart-reminders` en cron cada 2h, guarda log de notificaciones enviadas
3. **FCM HTTP v1 API** — envío real del push, autenticado con Service Account de Google

No se usa Firebase SDK en el backend. El Edge Function llama directamente a la FCM REST API con un JWT de Service Account.

## Flutter: permisos, token y deep links

### Inicialización

`NotificationService.init()` corre una vez al arrancar la app (en `app.dart`, antes de la UI):

1. `Firebase.initializeApp()` con `firebase_options.dart` generado por FlutterFire CLI
2. `FirebaseMessaging.instance.requestPermission()` — solicita permisos al usuario
3. Lee token con `getToken()` y lo upserta en `device_tokens` via Supabase
4. Suscribe a `onTokenRefresh` para actualizar el token si cambia
5. Registra `FirebaseMessaging.onBackgroundMessage(_backgroundHandler)` — top-level function

### Deep links

El payload de cada push incluye un campo `type`. `NotificationRouter` lo mapea:

| `type` | Ruta GoRouter |
|---|---|
| `medication` | `/inicio` |
| `insight` | `/alertas` |
| `red_flag` | `/diario/registro` |

El router se activa en tres momentos:
- App en foreground: `FirebaseMessaging.onMessage` → muestra snackbar + navega
- App en background (tap al push): `getInitialMessage()` + `onMessageOpenedApp`
- App killed (tap al push): `getInitialMessage()` en el arranque

### Archivos nuevos

```
mobile/lib/core/
  notification_service.dart    — init, token upload, onTokenRefresh, background handler
  notification_router.dart     — type → GoRouter.go()
```

### Configuración nativa requerida

**iOS (Xcode):**
- Capability: `Push Notifications`
- Capability: `Background Modes > Remote notifications`
- `GoogleService-Info.plist` en `ios/Runner/`

**Android:**
- `google-services.json` en `android/app/`
- `AndroidManifest.xml`: permiso `POST_NOTIFICATIONS` (Android 13+)

### Dependencias nuevas (pubspec.yaml)

```yaml
firebase_core: ^3.6.0
firebase_messaging: ^15.1.3
```

## Supabase: Edge Function `smart-reminders`

### Cron

Cada 2 horas via `pg_cron`:

```sql
select cron.schedule(
  'smart-reminders',
  '0 */2 * * *',
  $$ select net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/smart-reminders',
    headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
  ) $$
);
```

### Flujo por usuario

El Edge Function itera sobre usuarios con treatments activos:

```
1. Lee treatments activos (active=true)
2. Lee adherence_logs últimos 14 días
3. Si no hay treatments → skip
4. Consulta notification_log: ¿ya se envió 'medication' hoy? ¿ya se envió 'insight' hoy?
5. Si ambos límites están llenos → skip
6. Llama adherence-analyzer (Claude haiku) → {send, message, type, deep_link}
7. Si send=false → skip
8. Si type ya fue enviado hoy → skip
9. Lee device_tokens del usuario
10. Llama FCM HTTP v1 API para cada token
11. Inserta en notification_log
```

### Prompt a Claude

```
Eres el sistema de recordatorios inteligentes de Aliis, un acompañante de salud para pacientes crónicos.

Analiza el patrón de adherencia de los últimos 14 días y decide si enviar una notificación hoy.

Tratamientos activos: {{treatments}}
Registros de adherencia (fecha → medicamentos marcados): {{adherence_data}}
Notificaciones ya enviadas hoy: {{sent_today}}

Reglas:
- Solo puedes enviar 1 notificación tipo 'medication' por día
- Solo puedes enviar 1 notificación tipo 'insight' por día
- Si el usuario ha sido consistente los últimos 7 días, NO envíes medication
- Si detectas una tendencia preocupante (ej. 3+ días olvidando el mismo medicamento), envía insight
- El mensaje debe ser empático, breve (máx 80 caracteres), en español
- deep_link debe ser uno de: '/inicio', '/alertas', '/diario/registro'

Responde ÚNICAMENTE con JSON válido:
{"send": bool, "message": string, "type": "medication"|"insight"|"red_flag", "deep_link": string}
```

### Archivos del Edge Function

```
supabase/functions/smart-reminders/
  index.ts               — orquestador: itera usuarios, aplica límites, coordina
  fcm-client.ts          — wrapper FCM HTTP v1 (genera JWT de Service Account, envía)
  adherence-analyzer.ts  — construye prompt, llama Claude haiku, parsea respuesta
```

### Secrets requeridos (Supabase Vault)

```
ANTHROPIC_API_KEY          — para llamar a Claude
FCM_SERVICE_ACCOUNT_JSON   — JSON del Service Account de Google con rol FCM Sender
SUPABASE_SERVICE_ROLE_KEY  — para queries dentro del Edge Function
```

## Base de datos

### Tabla `device_tokens`

```sql
create table device_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  updated_at  timestamptz default now()
);

create unique index device_tokens_token_idx on device_tokens(token);
create index device_tokens_user_idx on device_tokens(user_id);

alter table device_tokens enable row level security;
create policy "users manage own tokens"
  on device_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Tabla `notification_log`

```sql
create table notification_log (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users not null,
  type     text not null check (type in ('medication', 'insight', 'red_flag')),
  message  text,
  sent_at  timestamptz default now()
);

create index notification_log_user_type_sent_idx
  on notification_log(user_id, type, sent_at);

alter table notification_log enable row level security;
create policy "users read own log"
  on notification_log for select
  using (auth.uid() = user_id);
-- El Edge Function escribe via service_role (bypassa RLS)
```

## Límites y comportamiento

| Situación | Comportamiento |
|---|---|
| Usuario sin treatments | Skip — no hay nada que recordar |
| Usuario consistente 7d | No se envía `medication` |
| 3+ días olvidando mismo med | Claude puede enviar `insight` |
| Señal preocupante (síntomas + olvidos) | Claude puede enviar `red_flag` → `/diario/registro` |
| Ya se enviaron 2 pushes hoy | Skip sin llamar a Claude |
| Token inválido (FCM 404) | Eliminar token de `device_tokens` |

## Lo que este diseño NO incluye

- Notificaciones locales programadas (no son pushes — quedan para Fase 2C si aplica)
- Preferencias de silencio/horario por usuario (se puede agregar en iteración futura)
- Analytics de push (open rate, etc.) — FCM ofrece esto nativo en Firebase Console
- Pagos o lógica Pro — todos los usuarios reciben smart reminders

## Dependencias y orden de implementación

1. Crear Firebase project + registrar apps iOS y Android → obtener `GoogleService-Info.plist` y `google-services.json`
2. Crear Service Account en Google Cloud con rol `Firebase Cloud Messaging Sender`
3. Migración SQL: `device_tokens` + `notification_log`
4. Edge Function `smart-reminders` + secrets en Supabase
5. Flutter: dependencias + `NotificationService` + `NotificationRouter`
6. Configuración nativa iOS (Xcode) + Android
7. Prueba end-to-end en simulador/dispositivo físico
