# Flutter Fase 2B — Push FCM con Smart Reminders: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar push notifications nativas con smart reminders en la app Flutter de Aliis — FCM recibe el token en el cliente, un Edge Function de Supabase analiza adherencia con Claude y decide si/qué push enviar vía FCM HTTP v1 API.

**Architecture:** Flutter registra el device token en Supabase y maneja pushes en todos los estados de vida de la app. Un Edge Function corre cada 2h, llama a Claude haiku con el historial de adherencia de cada usuario, y usa FCM REST API directamente (sin Firebase Admin SDK) para enviar el push si Claude decide que corresponde. Máximo 2 pushes por usuario por día (1 `medication` + 1 `insight`/`red_flag`).

**Tech Stack:** Flutter + firebase_core + firebase_messaging, Supabase Edge Functions (Deno/TypeScript), FCM HTTP v1 REST API, Claude haiku via Anthropic API, pg_cron para el schedule, Supabase Vault para secrets.

---

## File Map

### Nuevos archivos Flutter
- `mobile/lib/core/notification_service.dart` — init FCM, upload token, onTokenRefresh, background handler
- `mobile/lib/core/notification_router.dart` — mapea `type` a ruta GoRouter, gestiona tap en push

### Archivos Flutter modificados
- `mobile/pubspec.yaml` — agrega `firebase_core` y `firebase_messaging`
- `mobile/lib/core/env.dart` — no cambios (Firebase usa GoogleService-Info.plist)
- `mobile/lib/app.dart` — llama `NotificationService.init()` al arrancar
- `mobile/ios/Runner/Info.plist` — agrega `FirebaseAppDelegateProxyEnabled = NO`
- `mobile/android/app/src/main/AndroidManifest.xml` — permiso `POST_NOTIFICATIONS`

### Archivos nativos que el dev crea manualmente (no automatizables)
- `mobile/ios/Runner/GoogleService-Info.plist` — descargado de Firebase Console
- `mobile/android/app/google-services.json` — descargado de Firebase Console
- Xcode: agregar capabilities Push Notifications + Background Modes > Remote notifications

### Nuevos archivos Supabase
- `supabase/functions/smart-reminders/index.ts` — orquestador
- `supabase/functions/smart-reminders/fcm-client.ts` — wrapper FCM HTTP v1
- `supabase/functions/smart-reminders/adherence-analyzer.ts` — prompt + Claude haiku

### Migración SQL
- `frontend/migrations/20260506_device_tokens_notification_log.sql`

---

## Task 1: Migración SQL — device_tokens + notification_log

**Files:**
- Create: `frontend/migrations/20260506_device_tokens_notification_log.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- frontend/migrations/20260506_device_tokens_notification_log.sql

-- device_tokens: almacena el FCM token de cada dispositivo
create table if not exists device_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  token       text not null,
  platform    text not null check (platform in ('ios', 'android')),
  updated_at  timestamptz default now()
);

create unique index if not exists device_tokens_token_idx on device_tokens(token);
create index if not exists device_tokens_user_idx on device_tokens(user_id);

alter table device_tokens enable row level security;

drop policy if exists "users manage own tokens" on device_tokens;
create policy "users manage own tokens"
  on device_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- notification_log: registro de pushes enviados (para el límite diario)
create table if not exists notification_log (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users not null,
  type     text not null check (type in ('medication', 'insight', 'red_flag')),
  message  text,
  sent_at  timestamptz default now()
);

create index if not exists notification_log_user_type_sent_idx
  on notification_log(user_id, type, sent_at);

alter table notification_log enable row level security;

drop policy if exists "users read own log" on notification_log;
create policy "users read own log"
  on notification_log for select
  using (auth.uid() = user_id);
-- El Edge Function escribe via service_role (bypassa RLS automáticamente)
```

- [ ] **Step 2: Ejecutar en Supabase**

Ir a Supabase Dashboard → SQL Editor → pegar y ejecutar el contenido del archivo.

Verificar que aparecen las dos tablas en Table Editor: `device_tokens` y `notification_log`.

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260506_device_tokens_notification_log.sql
git commit -m "feat(db): device_tokens y notification_log para FCM smart reminders"
```

---

## Task 2: Firebase project — setup manual (prerequisito)

**Files:** ninguno en el repo (archivos descargados van en .gitignore)

Este task es 100% manual. No hay código que escribir.

- [ ] **Step 1: Crear proyecto Firebase**

1. Ir a https://console.firebase.google.com
2. Crear proyecto nuevo (o usar uno existente)
3. Habilitar **Cloud Messaging** en el panel de Firebase

- [ ] **Step 2: Registrar app iOS**

1. En Firebase Console → Project settings → Add app → iOS
2. Bundle ID: `com.example.aliisMobile`
3. Descargar `GoogleService-Info.plist`
4. Copiar a `mobile/ios/Runner/GoogleService-Info.plist`
5. Agregar a Xcode: arrastrar el archivo al Runner target (check "Copy items if needed")

- [ ] **Step 3: Registrar app Android**

1. En Firebase Console → Project settings → Add app → Android
2. Package name: verificar en `mobile/android/app/build.gradle.kts` (campo `applicationId`)
3. Descargar `google-services.json`
4. Copiar a `mobile/android/app/google-services.json`

- [ ] **Step 4: Crear Service Account para FCM**

1. Google Cloud Console → IAM → Service Accounts → Create
2. Nombre: `aliis-fcm-sender`
3. Role: `Firebase Cloud Messaging Sender` (o `Firebase Admin SDK Administrator Service Agent`)
4. Create key → JSON → descargar
5. Guardar el JSON — se usará en Task 5 (Supabase Vault)

- [ ] **Step 5: Verificar .gitignore**

Asegurarse que `mobile/ios/Runner/GoogleService-Info.plist` y `mobile/android/app/google-services.json` estén en `.gitignore` (contienen API keys).

```bash
grep -n "GoogleService-Info\|google-services" mobile/.gitignore || echo "AGREGAR A GITIGNORE"
```

Si no están, agregar a `mobile/.gitignore`:
```
ios/Runner/GoogleService-Info.plist
android/app/google-services.json
```

---

## Task 3: Flutter — dependencias Firebase

**Files:**
- Modify: `mobile/pubspec.yaml`

- [ ] **Step 1: Agregar dependencias**

En `mobile/pubspec.yaml`, bajo `# Auth + DB`, agregar:

```yaml
  # Push notifications
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3
```

El archivo completo de dependencias quedará:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Auth + DB
  supabase_flutter: ^2.8.0

  # Push notifications
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3

  # State + Nav
  flutter_riverpod: ^2.6.1
  go_router: ^14.6.2

  # UI
  google_fonts: ^6.2.1
  animations: ^2.0.11
  flutter_animate: ^4.5.0

  # Utils
  intl: ^0.20.2
  shared_preferences: ^2.3.3
  url_launcher: ^6.3.0
```

- [ ] **Step 2: Instalar**

```bash
cd mobile && flutter pub get
```

Salida esperada: `Changed 2 dependencies!` con `firebase_core` y `firebase_messaging`.

- [ ] **Step 3: Configurar Android build.gradle para google-services**

En `mobile/android/app/build.gradle.kts`, agregar al final del archivo:

```kotlin
apply(plugin = "com.google.gms.google-services")
```

En `mobile/android/build.gradle.kts` (raíz Android), agregar en `plugins {}` o `buildscript {}`:

```kotlin
// en el bloque plugins del archivo raíz:
id("com.google.gms.google-services") version "4.4.2" apply false
```

- [ ] **Step 4: iOS — Info.plist: deshabilitar swizzling de Firebase**

En `mobile/ios/Runner/Info.plist`, agregar antes del `</dict>` final:

```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

Esto es necesario porque Flutter maneja su propio AppDelegate y el swizzling automático de Firebase puede causar conflictos.

- [ ] **Step 5: iOS — Xcode capabilities (manual)**

Abrir `mobile/ios/Runner.xcworkspace` en Xcode:
1. Seleccionar target `Runner` → Signing & Capabilities
2. Click `+` → agregar `Push Notifications`
3. Click `+` → agregar `Background Modes` → check `Remote notifications`

- [ ] **Step 6: Android — permiso POST_NOTIFICATIONS**

En `mobile/android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>` antes de `<application>`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

- [ ] **Step 7: Commit**

```bash
git add mobile/pubspec.yaml mobile/pubspec.lock mobile/ios/Runner/Info.plist mobile/android/app/src/main/AndroidManifest.xml mobile/android/app/build.gradle.kts mobile/android/build.gradle.kts mobile/.gitignore
git commit -m "feat(mobile): dependencias firebase_core y firebase_messaging para FCM"
```

---

## Task 4: Flutter — NotificationService

**Files:**
- Create: `mobile/lib/core/notification_service.dart`

- [ ] **Step 1: Crear el archivo**

```dart
// mobile/lib/core/notification_service.dart
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../firebase_options.dart';
import 'supabase_client.dart';

// Top-level function requerida por Firebase para background messages
@pragma('vm:entry-point')
Future<void> _backgroundHandler(RemoteMessage message) async {
  // Firebase ya inicializado en este isolate — solo logueamos
  debugPrint('FCM background: ${message.messageId}');
}

class NotificationService {
  NotificationService._();

  static Future<void> init() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    FirebaseMessaging.onBackgroundMessage(_backgroundHandler);

    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      await _uploadToken();
      FirebaseMessaging.instance.onTokenRefresh.listen(_saveToken);
    }
  }

  static Future<void> _uploadToken() async {
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) await _saveToken(token);
  }

  static Future<void> _saveToken(String token) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    final platform = Platform.isIOS ? 'ios' : 'android';

    await supabase.from('device_tokens').upsert(
      {
        'user_id': userId,
        'token': token,
        'platform': platform,
        'updated_at': DateTime.now().toIso8601String(),
      },
      onConflict: 'token',
    );
  }
}
```

- [ ] **Step 2: Verificar que firebase_options.dart existe**

`firebase_options.dart` es generado por FlutterFire CLI. Si no existe aún:

```bash
# Instalar FlutterFire CLI (una sola vez)
dart pub global activate flutterfire_cli

# Desde mobile/, conectar con el proyecto Firebase
cd mobile
flutterfire configure
```

Seleccionar el proyecto Firebase creado en Task 2. Esto genera `mobile/lib/firebase_options.dart`.

- [ ] **Step 3: Analizar**

```bash
cd mobile && flutter analyze lib/core/notification_service.dart
```

Salida esperada: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/core/notification_service.dart mobile/lib/firebase_options.dart
git commit -m "feat(mobile): NotificationService — init FCM, token upload, onTokenRefresh"
```

---

## Task 5: Flutter — NotificationRouter

**Files:**
- Create: `mobile/lib/core/notification_router.dart`

- [ ] **Step 1: Crear el archivo**

```dart
// mobile/lib/core/notification_router.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NotificationRouter {
  NotificationRouter._();

  // Mapea el campo 'type' del payload a una ruta GoRouter
  static String _routeFor(String? type) {
    switch (type) {
      case 'medication':
        return '/inicio';
      case 'insight':
        return '/alertas';
      case 'red_flag':
        return '/diario/registro';
      default:
        return '/inicio';
    }
  }

  // Llama en app.dart tras inicializar la UI.
  // navigatorKey se usa para acceder al contexto cuando el app arranca desde killed.
  static Future<void> setup(GlobalKey<NavigatorState> navigatorKey) async {
    // 1. App killed → usuario toca el push → app abre
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) {
      final route = _routeFor(initial.data['type']);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        navigatorKey.currentContext?.go(route);
      });
    }

    // 2. App en background → usuario toca el push
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      final route = _routeFor(message.data['type']);
      navigatorKey.currentContext?.go(route);
    });

    // 3. App en foreground → mostrar snackbar + navegar
    FirebaseMessaging.onMessage.listen((message) {
      final title = message.notification?.title ?? 'Aliis';
      final body = message.notification?.body ?? '';
      final route = _routeFor(message.data['type']);

      final context = navigatorKey.currentContext;
      if (context == null) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$title\n$body'),
          action: SnackBarAction(
            label: 'Ver',
            onPressed: () => context.go(route),
          ),
          duration: const Duration(seconds: 5),
        ),
      );
    });
  }
}
```

- [ ] **Step 2: Analizar**

```bash
cd mobile && flutter analyze lib/core/notification_router.dart
```

Salida esperada: `No issues found!`

- [ ] **Step 3: Commit**

```bash
git add mobile/lib/core/notification_router.dart
git commit -m "feat(mobile): NotificationRouter — deep links desde FCM payload type"
```

---

## Task 6: Flutter — Wiring en app.dart y main.dart

**Files:**
- Modify: `mobile/lib/app.dart`
- Modify: `mobile/lib/main.dart`

- [ ] **Step 1: Actualizar main.dart para inicializar NotificationService**

```dart
// mobile/lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/env.dart';
import 'core/notification_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Env.assertConfigured();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  await NotificationService.init();

  runApp(const ProviderScope(child: AliisApp()));
}
```

- [ ] **Step 2: Actualizar app.dart para conectar NotificationRouter**

`NotificationRouter.setup()` necesita un `GlobalKey<NavigatorState>` que GoRouter ya expone. Hay que pasárselo tras el primer frame:

```dart
// mobile/lib/app.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/notification_router.dart';
import 'core/router.dart';
import 'core/theme.dart';

class AliisApp extends ConsumerStatefulWidget {
  const AliisApp({super.key});

  @override
  ConsumerState<AliisApp> createState() => _AliisAppState();
}

class _AliisAppState extends ConsumerState<AliisApp> {
  @override
  void initState() {
    super.initState();
    final router = ref.read(routerProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationRouter.setup(router.routerDelegate.navigatorKey);
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Aliis',
      theme: aliisLightTheme(),
      darkTheme: aliisDarkTheme(),
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('es')],
    );
  }
}
```

- [ ] **Step 3: Analizar todo**

```bash
cd mobile && flutter analyze lib/
```

Salida esperada: `No issues found!`

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/main.dart mobile/lib/app.dart
git commit -m "feat(mobile): inicializar FCM en main y conectar NotificationRouter en app"
```

---

## Task 7: Edge Function — adherence-analyzer.ts

**Files:**
- Create: `supabase/functions/smart-reminders/adherence-analyzer.ts`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p supabase/functions/smart-reminders
```

- [ ] **Step 2: Crear el archivo**

```typescript
// supabase/functions/smart-reminders/adherence-analyzer.ts

export interface AnalysisResult {
  send: boolean;
  message: string;
  type: 'medication' | 'insight' | 'red_flag';
  deep_link: string;
}

export interface Treatment {
  id: string;
  name: string;
  frequency: string;
}

export interface AdherenceLog {
  date: string;
  medications_taken: string[];
}

export async function analyzeAdherence(
  treatments: Treatment[],
  adherenceLogs: AdherenceLog[],
  sentToday: string[],
  anthropicApiKey: string,
): Promise<AnalysisResult> {
  const prompt = `Eres el sistema de recordatorios inteligentes de Aliis, un acompañante de salud para pacientes crónicos.

Analiza el patrón de adherencia de los últimos 14 días y decide si enviar una notificación hoy.

Tratamientos activos: ${JSON.stringify(treatments)}
Registros de adherencia (fecha → medicamentos marcados): ${JSON.stringify(adherenceLogs)}
Notificaciones ya enviadas hoy: ${JSON.stringify(sentToday)}

Reglas:
- Solo puedes enviar 1 notificación tipo 'medication' por día
- Solo puedes enviar 1 notificación tipo 'insight' por día
- Si el usuario ha sido consistente los últimos 7 días, NO envíes medication
- Si detectas una tendencia preocupante (ej. 3+ días olvidando el mismo medicamento), envía insight
- El mensaje debe ser empático, breve (máx 80 caracteres), en español
- deep_link debe ser uno de: '/inicio', '/alertas', '/diario/registro'

Responde ÚNICAMENTE con JSON válido:
{"send": bool, "message": string, "type": "medication"|"insight"|"red_flag", "deep_link": string}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text.trim();

  // Parsear JSON — si falla, no enviar push
  try {
    const result = JSON.parse(text) as AnalysisResult;
    // Validar campos requeridos
    if (typeof result.send !== 'boolean' || !result.type || !result.message) {
      return { send: false, message: '', type: 'medication', deep_link: '/inicio' };
    }
    return result;
  } catch {
    return { send: false, message: '', type: 'medication', deep_link: '/inicio' };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/smart-reminders/adherence-analyzer.ts
git commit -m "feat(edge): adherence-analyzer — prompt Claude haiku para smart reminders"
```

---

## Task 8: Edge Function — fcm-client.ts

**Files:**
- Create: `supabase/functions/smart-reminders/fcm-client.ts`

- [ ] **Step 1: Crear el archivo**

FCM HTTP v1 requiere un JWT de OAuth2 generado con el Service Account JSON. Deno no tiene `google-auth-library`, así que generamos el JWT manualmente:

```typescript
// supabase/functions/smart-reminders/fcm-client.ts

export interface FcmPayload {
  title: string;
  body: string;
  data: Record<string, string>;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Construir JWT header.payload
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claim));
  const signingInput = `${header}.${payload}`;

  // Importar clave privada RSA
  const pemKey = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const keyBuffer = Uint8Array.from(atob(pemKey), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  // Firmar
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput),
  );
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  const jwt = `${signingInput}.${signature}`;

  // Intercambiar JWT por access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`OAuth token error: ${tokenResponse.status}`);
  }
  const { access_token } = await tokenResponse.json();
  return access_token;
}

export async function sendFcmPush(
  deviceToken: string,
  payload: FcmPayload,
  serviceAccountJson: string,
): Promise<{ success: boolean; invalidToken: boolean }> {
  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
  const accessToken = await getAccessToken(serviceAccount);

  const fcmUrl = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

  const body = {
    message: {
      token: deviceToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    },
  };

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.status === 404) {
    // Token inválido — eliminar de device_tokens
    return { success: false, invalidToken: true };
  }

  if (!response.ok) {
    const error = await response.text();
    console.error(`FCM error ${response.status}: ${error}`);
    return { success: false, invalidToken: false };
  }

  return { success: true, invalidToken: false };
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/smart-reminders/fcm-client.ts
git commit -m "feat(edge): fcm-client — envío FCM HTTP v1 con JWT de Service Account"
```

---

## Task 9: Edge Function — index.ts (orquestador)

**Files:**
- Create: `supabase/functions/smart-reminders/index.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// supabase/functions/smart-reminders/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { analyzeAdherence } from './adherence-analyzer.ts';
import { sendFcmPush } from './fcm-client.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!;
const fcmServiceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (_req) => {
  try {
    await processAllUsers();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('smart-reminders error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});

async function processAllUsers() {
  // Obtener usuarios distintos con treatments activos
  const { data: users, error } = await supabase
    .from('treatments')
    .select('user_id')
    .eq('active', true);

  if (error) throw error;
  if (!users || users.length === 0) return;

  const uniqueUserIds = [...new Set(users.map((u) => u.user_id))];

  for (const userId of uniqueUserIds) {
    try {
      await processUser(userId);
    } catch (err) {
      // Un usuario que falla no detiene al resto
      console.error(`Error procesando usuario ${userId}:`, err);
    }
  }
}

async function processUser(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Verificar límites diarios
  const { data: sentToday } = await supabase
    .from('notification_log')
    .select('type')
    .eq('user_id', userId)
    .gte('sent_at', `${today}T00:00:00Z`);

  const sentTypes = (sentToday ?? []).map((r) => r.type);
  const medicationSent = sentTypes.includes('medication');
  const insightSent = sentTypes.includes('insight');
  const redFlagSent = sentTypes.includes('red_flag');

  // Si ya se enviaron medication e insight/red_flag hoy → skip sin llamar a Claude
  if (medicationSent && (insightSent || redFlagSent)) return;

  // 2. Leer treatments activos
  const { data: treatments } = await supabase
    .from('treatments')
    .select('id, name, frequency')
    .eq('user_id', userId)
    .eq('active', true);

  if (!treatments || treatments.length === 0) return;

  // 3. Leer adherencia últimos 14 días
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const { data: adherenceLogs } = await supabase
    .from('adherence_logs')
    .select('date, medications_taken')
    .eq('user_id', userId)
    .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });

  // 4. Llamar a Claude
  const analysis = await analyzeAdherence(
    treatments,
    adherenceLogs ?? [],
    sentTypes,
    anthropicApiKey,
  );

  if (!analysis.send) return;

  // 5. Verificar que el tipo analizado no fue enviado ya hoy
  if (analysis.type === 'medication' && medicationSent) return;
  if ((analysis.type === 'insight' || analysis.type === 'red_flag') && (insightSent || redFlagSent)) return;

  // 6. Leer device tokens del usuario
  const { data: tokens } = await supabase
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId);

  if (!tokens || tokens.length === 0) return;

  // 7. Enviar push a cada token
  for (const { token } of tokens) {
    const result = await sendFcmPush(
      token,
      {
        title: 'Aliis',
        body: analysis.message,
        data: {
          type: analysis.type,
          deep_link: analysis.deep_link,
        },
      },
      fcmServiceAccountJson,
    );

    // Eliminar token inválido
    if (result.invalidToken) {
      await supabase.from('device_tokens').delete().eq('token', token);
    }
  }

  // 8. Registrar en notification_log
  await supabase.from('notification_log').insert({
    user_id: userId,
    type: analysis.type,
    message: analysis.message,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/smart-reminders/index.ts
git commit -m "feat(edge): smart-reminders index — orquestador FCM con límites diarios"
```

---

## Task 10: Supabase — Deploy Edge Function + Secrets + Cron

**Files:** ninguno nuevo en repo

- [ ] **Step 1: Instalar Supabase CLI si no está**

```bash
brew install supabase/tap/supabase
supabase login
```

- [ ] **Step 2: Linkear proyecto**

```bash
# Desde la raíz del repo
supabase link --project-ref cdnecuufkdykybisqybm
```

- [ ] **Step 3: Configurar secrets en Supabase Vault**

```bash
supabase secrets set ANTHROPIC_API_KEY=<tu-api-key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key-del-dashboard>
supabase secrets set FCM_SERVICE_ACCOUNT_JSON='<contenido-json-del-service-account>'
```

Los valores se obtienen de:
- `ANTHROPIC_API_KEY`: https://console.anthropic.com/api-keys
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Settings → API → service_role
- `FCM_SERVICE_ACCOUNT_JSON`: archivo JSON descargado en Task 2 Step 4 (pegar como string)

- [ ] **Step 4: Deploy**

```bash
supabase functions deploy smart-reminders --no-verify-jwt
```

`--no-verify-jwt` porque el cron llama la función con la service_role key, no con un JWT de usuario.

Salida esperada:
```
Deploying Function smart-reminders (script size: X bytes)
Done: smart-reminders
```

- [ ] **Step 5: Probar manualmente**

```bash
curl -X POST https://cdnecuufkdykybisqybm.supabase.co/functions/v1/smart-reminders \
  -H "Authorization: Bearer <service_role_key>"
```

Salida esperada: `{"ok":true}`

- [ ] **Step 6: Crear cron con pg_cron**

En Supabase Dashboard → SQL Editor:

```sql
select cron.schedule(
  'smart-reminders',
  '0 */2 * * *',
  $$
  select net.http_post(
    url := 'https://cdnecuufkdykybisqybm.supabase.co/functions/v1/smart-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

> Nota: Si `current_setting('app.service_role_key')` no está configurado en tu proyecto, alternativamente hardcodea el service_role key directamente en el SQL (solo en Supabase Dashboard, nunca en código committeado).

- [ ] **Step 7: Verificar cron**

```sql
select * from cron.job where jobname = 'smart-reminders';
```

Debe mostrar la fila con `schedule = '0 */2 * * *'` y `active = true`.

---

## Task 11: Prueba end-to-end

Este task requiere dispositivo físico (pushes no llegan al simulador iOS).

- [ ] **Step 1: Construir en dispositivo físico**

Conectar iPhone físico, confiar en el Mac, y:

```bash
cd mobile && bash run.sh
```

- [ ] **Step 2: Verificar token en base de datos**

Al abrir la app, debe aparecer la alerta de permisos de notificación. Tras aceptar, verificar en Supabase Dashboard → Table Editor → `device_tokens` que se insertó una fila con `platform = 'ios'` y el token del dispositivo.

- [ ] **Step 3: Trigger manual del Edge Function**

```bash
curl -X POST https://cdnecuufkdykybisqybm.supabase.co/functions/v1/smart-reminders \
  -H "Authorization: Bearer <service_role_key>"
```

Si el usuario tiene treatments activos y adherencia con algún patrón, debe llegar un push al dispositivo en segundos.

- [ ] **Step 4: Verificar log**

```sql
select * from notification_log order by sent_at desc limit 5;
```

Debe mostrar el push enviado con el `type` y `message` generado por Claude.

- [ ] **Step 5: Probar deep link**

Con la app en background, tocar la notificación push. Debe navegar a la pantalla correcta:
- `type: medication` → `/inicio` (HomeScreen)
- `type: insight` → `/alertas` (AlertasScreen)
- `type: red_flag` → `/diario/registro` (RegistroWizard)

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "feat(mobile/edge): Fase 2B completa — FCM smart reminders con Claude"
```
