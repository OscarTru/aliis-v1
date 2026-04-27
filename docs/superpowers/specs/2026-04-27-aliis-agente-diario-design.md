# Aliis — Agente de salud en el diario

**Fecha:** 27 de abril de 2026
**Área:** Diario de síntomas y signos vitales
**Estado:** Aprobado para implementación

---

## Qué se construye

Aliis es la voz agentic de la plataforma. Cuando el usuario abre el diario, Aliis analiza sus últimos 30 días de registros (signos vitales + notas de síntomas en texto libre) y genera una observación personalizada en la parte superior del diario. Además, manda una notificación push diaria — un check-in o una alerta si detectó un patrón relevante.

No es un chatbot. Es una presencia que ya revisó todo antes de que el usuario llegara.

---

## Comportamiento

### Cuándo genera un insight
- Cuando el usuario abre el diario (`/diario`)
- El insight se cachea en Supabase por 24h — si ya existe uno de hoy, se sirve sin llamar a Claude
- Si no hay registros en los últimos 7 días, Aliis manda un check-in simple

### Qué analiza
- **Signos vitales numéricos:** glucosa, presión sistólica/diastólica, frecuencia cardíaca, peso, temperatura
- **Notas de síntomas:** texto libre de cada registro (`note`), analizado para detectar palabras/frases repetidas
- **Contexto del usuario:** nombre del perfil + diagnóstico principal del pack más reciente
- **Ventana:** últimos 30 días, con énfasis en los últimos 7

### Patrones que detecta
- Signo vital fuera del rango habitual del usuario (comparado con su propio promedio)
- Síntoma mencionado más de 2 veces en 7 días
- Ausencia de registros por más de 5 días
- Tendencia ascendente/descendente sostenida en un signo vital (3+ lecturas)

---

## Personalidad y tono

**Reglas fijas del system prompt:**
- Siempre habla de tú — conjugación en segunda persona del singular siempre ("tienes", "has notado", "te has sentido")
- Habla en primera persona: "he notado", "esta semana vi", "me llama la atención"
- Máximo 3 oraciones. Nunca un párrafo largo.
- Siempre termina con una pregunta suave o recomendación leve — nunca una alarma
- Nunca diagnostica. Si algo merece atención médica: "podría valer la pena mencionárselo a tu médico en tu próxima cita"
- Usa el nombre del usuario cuando lo conoce
- Si no hay patrones claros: check-in simple y cálido

**Ejemplos de output:**

Con patrón en vitales:
> "Oye Oscar, esta semana tu presión ha estado un poco más alta de lo que sueles tener — promedio 138/88 vs tu habitual de 125/80. ¿Has tenido más estrés o has dormido menos? Podría valer la pena mencionárselo a tu médico."

Con patrón en síntomas:
> "He notado que esta semana has mencionado dolor de cabeza tres veces en tus registros — más que cualquier semana del mes pasado. ¿Has podido descansar bien? A veces los patrones de sueño aparecen antes que el dolor."

Sin datos relevantes:
> "¿Cómo vas hoy? Llevas unos días sin registrar nada. No hay presión — si quieres contarme cómo te has sentido, aquí estoy."

---

## Arquitectura

### Nuevas piezas

| Pieza | Tipo | Responsabilidad |
|-------|------|----------------|
| `app/api/aliis/insight/route.ts` | Next.js API route | Genera o sirve el insight del día |
| `app/api/aliis/notify/route.ts` | Next.js API route (cron target) | Genera insights y manda push a usuarios activos |
| `app/api/aliis/push/subscribe/route.ts` | Next.js API route | Guarda la suscripción push del navegador |
| `components/AliisInsight.tsx` | React component | Muestra el insight en el diario |
| `components/PushPermissionPrompt.tsx` | React component | Pide permiso de notificaciones |
| `lib/aliis-prompt.ts` | Utilidad | Construye el system prompt y el user message para Claude |
| `lib/web-push.ts` | Utilidad | Wrapper de `web-push` para mandar notificaciones |

### Tablas nuevas en Supabase

**`aliis_insights`**
```sql
id            uuid primary key default gen_random_uuid()
user_id       uuid references profiles(id) on delete cascade
content       text not null
generated_at  timestamptz default now()
data_window   jsonb  -- snapshot de los datos usados (para debug)
```
Índice único: `(user_id, date(generated_at))` — 1 insight por usuario por día.

**`push_subscriptions`**
```sql
id        uuid primary key default gen_random_uuid()
user_id   uuid references profiles(id) on delete cascade
endpoint  text not null
p256dh    text not null
auth      text not null
created_at timestamptz default now()
```
Índice único: `(user_id, endpoint)`.

### Flujo completo — insight en el diario

```
Usuario abre /diario
  │
  ▼
AliisInsight component monta
  │
  ▼
GET /api/aliis/insight
  │
  ├─ ¿Existe aliis_insights con date(generated_at) = hoy para este user?
  │   ├─ SÍ → devuelve content cacheado
  │   └─ NO →
  │       ├─ Fetch últimos 30 días de symptom_logs
  │       ├─ Fetch perfil (nombre, plan)
  │       ├─ Fetch pack más reciente (diagnóstico principal)
  │       ├─ lib/aliis-prompt.ts → construye prompt
  │       ├─ Claude Haiku → genera insight (max 150 tokens)
  │       ├─ INSERT en aliis_insights
  │       └─ devuelve content
  │
  ▼
AliisInsight muestra el texto con animación de typing
```

### Flujo completo — notificación push diaria

```
Vercel Cron (diario, hora configurable, ej. 9:00am UTC)
  │
  ▼
GET /api/aliis/notify (protegido con CRON_SECRET header)
  │
  ├─ Fetch usuarios activos (symptom_logs en últimos 30 días)
  │   (máx 100 por ejecución para no exceder timeout de Vercel)
  │
  ├─ Para cada usuario:
  │   ├─ Generar insight (igual que el flujo del diario, con caché)
  │   └─ Si tiene push_subscriptions → web-push.sendNotification()
  │       Payload: { title: "Aliis", body: <primeras 80 chars del insight> }
  │
  └─ Devuelve { sent: N, skipped: M }
```

### Permiso de notificaciones

- `PushPermissionPrompt` aparece en el diario solo si:
  - El usuario no ha dado permiso antes (`Notification.permission === 'default'`)
  - El usuario tiene al menos 1 registro en el diario
- UI: banner sutil debajo del header del diario, no un modal bloqueante
- Texto: *"¿Quieres que Aliis te avise si detecta algo? Solo mandará algo si vale la pena."*
- Al aceptar: `POST /api/aliis/push/subscribe` guarda el endpoint en Supabase

---

## Modelo de IA

- **Modelo:** Claude Haiku (`claude-haiku-4-5-20251001`) — rápido y económico para insights cortos
- **Max tokens:** 150 — el insight nunca debe ser largo
- **Sin streaming** — el insight llega completo
- **Sin prompt caching** — el user message cambia cada día por usuario

---

## Variables de entorno nuevas

```
VAPID_PUBLIC_KEY=   # generado con web-push
VAPID_PRIVATE_KEY=  # generado con web-push
VAPID_CONTACT=mailto:hola@aliis.app
CRON_SECRET=        # string aleatorio para proteger /api/aliis/notify
```

Añadir a `frontend/.env.example` y configurar en Vercel.

### Vercel Cron config (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/aliis/notify",
    "schedule": "0 9 * * *"
  }]
}
```

---

## Scope explícito — qué NO incluye esta versión

- Chat con Aliis (eso es una v2)
- Historial de insights anteriores visible para el usuario
- Configuración de hora de notificación por usuario
- iOS push (solo desktop + Android)
- Análisis de packs o chats — solo symptom_logs

---

## Criterios de éxito

- El insight aparece en el diario en menos de 2 segundos (con caché) o menos de 5 segundos (primera generación del día)
- El insight usa el nombre del usuario y hace referencia a datos reales de sus registros
- La notificación push llega en la ventana de 9:00–9:15am UTC
- Si el usuario no tiene registros, el mensaje es un check-in, no un error
- Conjugación en tú en el 100% de los mensajes generados
