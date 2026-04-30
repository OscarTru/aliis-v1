# Aliis v1 — Guía de Sesiones con Subagentes
**Fecha:** 30 Abril 2026  
**Metodología:** Subagent-Driven Development (superpowers:subagent-driven-development)

---

## CÓMO USAR ESTE DOCUMENTO

Cada sesión de Claude Code = 1 conversación nueva. Al inicio de cada sesión:

1. Lee `docs/superpowers/plans/2026-04-30-memory.md` (estado actual del proyecto)
2. Lee los Entry Files listados en la sesión
3. Di: **"Vamos a ejecutar la sesión [ID]. Usa subagent-driven-development."**
4. Al terminar, actualiza `2026-04-30-memory.md` con el nuevo estado

---

## PRE-REQUISITO: SESIÓN SETUP (hacer primero, ~45 min)

**Antes de cualquier fase**, ejecutar esto en una sesión separada.

### Tarea SETUP-1: Feature Flags Table

**Entry files:** `frontend/migrations/` (cualquier migration existente como referencia)

```sql
-- Ejecutar en Supabase SQL editor
CREATE TABLE IF NOT EXISTS feature_flags (
  flag_name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_pct INTEGER DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  user_ids UUID[] DEFAULT '{}',
  plan_restriction TEXT CHECK (plan_restriction IN ('pro', 'free') OR plan_restriction IS NULL),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sin RLS — solo service role puede modificar
-- El helper del cliente lo leerá con anon key (SELECT público)
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read feature flags" ON feature_flags FOR SELECT USING (true);
```

**Crear `frontend/lib/feature-flags.ts`:**
```typescript
import { createClient } from '@/lib/supabase'

export async function isFeatureEnabled(
  flagName: string,
  userId: string,
  userPlan: string
): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('enabled, rollout_pct, user_ids, plan_restriction')
    .eq('flag_name', flagName)
    .single()

  if (!data || !data.enabled) return false
  if (data.plan_restriction && userPlan !== data.plan_restriction) return false
  if (data.user_ids?.includes(userId)) return true
  if (data.rollout_pct >= 100) return true
  const hash = parseInt(userId.replace(/-/g, '').slice(-4), 16) % 100
  return hash < data.rollout_pct
}
```

**Insertar flags iniciales:**
```sql
INSERT INTO feature_flags (flag_name, enabled, rollout_pct, description) VALUES
  ('medical_profiles', false, 0, 'Perfiles médicos en onboarding y cuenta'),
  ('adherence_checklist', false, 0, 'Checklist de adherencia en diario'),
  ('correlation_analysis', false, 0, 'Análisis correlación síntomas/adherencia'),
  ('pre_consult_summary', false, 0, 'Resumen pre-consulta médica'),
  ('capsula_tiempo', false, 0, 'Cápsula del tiempo semanal'),
  ('appointment_motor', false, 0, 'Recordatorio de citas médicas'),
  ('free_text_diary', false, 0, 'Diario libre con extracción IA'),
  ('el_hilo', false, 0, 'Narrativa longitudinal mensual')
ON CONFLICT (flag_name) DO NOTHING;
```

**Acceptance test:** `SELECT * FROM feature_flags` → 8 filas. `isFeatureEnabled('medical_profiles', userId, 'pro')` → false (flag desactivado).

**Commit:** `feat: add feature_flags table and helper`

---

## FASE 0 — AI ENGINE + SECURITY

### SESIÓN S0-A: Security + Middleware Audit (~1h)

**Entry files:**
- `frontend/app/api/stripe/checkout/route.ts`
- `backend/src/index.ts`
- `backend/src/middleware/auth.ts`
- `backend/src/routes/pack.ts`
- `backend/src/routes/stripe.ts`

**Objetivo:** Validar origin en checkout y confirmar que todas las rutas backend tienen auth middleware.

**Tarea S0-A-1: Origin allowlist en checkout**

Modificar `frontend/app/api/stripe/checkout/route.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'https://aliis.app',
  'https://www.aliis.app',
  'http://localhost:3000',
  'http://localhost:3001',
]

export async function POST(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const safeOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) ?? 'https://aliis.app'
  // Usar safeOrigin en success_url y cancel_url
  ...
}
```

**Tarea S0-A-2: Auditar middleware en backend**

En `backend/src/index.ts`, mover el middleware de auth a nivel global:
```typescript
// Antes: cada ruta aplica middleware individualmente
// Después: aplicar globalmente para todas las rutas /pack
app.use('/pack', verifySupabaseToken)
app.use('/api', verifySupabaseToken) // si hay rutas /api
```

Verificar con: `curl -X POST https://api.aliis.app/pack/generate` sin header → debe retornar 401.

**Tarea S0-A-3: Grep de copy obsoleto**
```bash
grep -r "3 packs\|tres pack\|3 diagnósticos\|tres diagnósticos" frontend/app frontend/components
```
Reemplazar cualquier resultado con "1 pack cada 7 días".

**Acceptance tests:**
- [ ] `curl -X POST /api/stripe/checkout -d '{"successPath":"https://evil.com"}'` → safeOrigin usado, no evil.com
- [ ] Backend sin token → 401
- [ ] Grep de "3 packs" → 0 resultados

**Commit:** `fix(security): origin allowlist in checkout, global auth middleware`

---

### SESIÓN S0-B: Vercel AI SDK Migration (~3-4h)

**Entry files:**
- `frontend/package.json`
- `backend/package.json`
- `backend/src/lib/classifier.ts`
- `frontend/app/api/chat/route.ts`
- `frontend/app/api/aliis/insight/route.ts`
- `frontend/app/api/symptoms/route.ts`

**Objetivo:** Instalar Vercel AI SDK, crear registry de modelos, migrar classifier a Groq, symptoms a Gemini, chat Free a Gemini.

**Tarea S0-B-1: Instalar dependencias**
```bash
# En /frontend:
cd frontend && npm install ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/groq

# En /backend:
cd backend && npm install ai @ai-sdk/anthropic @ai-sdk/groq
```

**Tarea S0-B-2: Crear `frontend/lib/ai-providers.ts`**
```typescript
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY })
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export const models = {
  packGenerator: anthropic('claude-sonnet-4-6'),
  chatFree: google('gemini-2.0-flash'),
  chatPro: anthropic('claude-sonnet-4-6'),
  insight: anthropic('claude-sonnet-4-6'),
  classifier: groq('llama-3.1-8b-instant'),
  symptoms: google('gemini-2.0-flash'),
}
```

**Tarea S0-B-3: Migrar `backend/src/lib/classifier.ts` a Groq**

Reemplazar llamada Anthropic SDK por Vercel AI SDK:
```typescript
import { generateText } from 'ai'
import { models } from '../lib/ai-providers' // backend version

const { text } = await generateText({
  model: models.classifier,
  messages: [{ role: 'user', content: buildClassifierPrompt(input) }],
  maxTokens: 10,
  temperature: 0,
})
return text.trim() as IntentClass
```

Crear `backend/src/lib/ai-providers.ts` (igual que frontend pero solo classifier + packGenerator).

**Tarea S0-B-4: Migrar `frontend/app/api/symptoms/route.ts` a Gemini**

Reemplazar el bloque de extracción de síntomas:
```typescript
import { generateText } from 'ai'
import { models } from '@/lib/ai-providers'

const { text } = await generateText({
  model: models.symptoms,
  system: SYMPTOMS_SYSTEM_PROMPT,
  messages: [{ role: 'user', content: nota }],
  maxTokens: 512,
  providerOptions: {
    google: { responseMimeType: 'application/json' },
  },
})
```

**Tarea S0-B-5: Migrar `frontend/app/api/chat/route.ts` a Gemini para Free**

Verificar plan del usuario y usar modelo correspondiente:
```typescript
const model = profile?.plan === 'pro' ? models.chatPro : models.chatFree
```

**Tarea S0-B-6: Agregar env vars**

En `frontend/.env.local`:
```
GOOGLE_AI_API_KEY=
GROQ_API_KEY=
```

En `frontend/.env.example` agregar las mismas.

**Acceptance tests:**
- [ ] `npm run build` en frontend sin errores TypeScript
- [ ] `npm run build` en backend sin errores TypeScript
- [ ] Clasificar "me duele la cabeza" → respuesta en < 200ms
- [ ] Chat Free → usa Gemini (verificar en logs de Railway)
- [ ] Insight diario funciona con caché (segunda llamada mismo día → no llama IA)

**Variables de entorno a agregar en Railway:** `GOOGLE_AI_API_KEY`, `GROQ_API_KEY`

**Commit:** `feat(ai): migrate to Vercel AI SDK, Groq classifier, Gemini symptoms+chat`

---

## FASE 1 — PERSONALIZACIÓN MÉDICA

### SESIÓN S1-A: Medical Profiles DB + Types (~1h)

**Entry files:**
- `frontend/lib/types.ts`
- `frontend/migrations/20260427_aliis_tables.sql` (como referencia de formato)

**Tarea S1-A-1: Migration SQL**

Crear `frontend/migrations/20260501_medical_profiles.sql`:
```sql
CREATE TABLE IF NOT EXISTS medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamentos TEXT[] DEFAULT '{}',
  alergias TEXT[] DEFAULT '{}',
  condiciones_previas TEXT[] DEFAULT '{}',
  edad INTEGER CHECK (edad > 0 AND edad < 150),
  sexo TEXT CHECK (sexo IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own medical profile"
  ON medical_profiles FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_medical_profiles_user ON medical_profiles(user_id);
```

Ejecutar en Supabase SQL editor (producción).

**Tarea S1-A-2: Tipos en `frontend/lib/types.ts`**

Agregar al final del archivo:
```typescript
export interface MedicalProfile {
  id: string
  user_id: string
  medicamentos: string[]
  alergias: string[]
  condiciones_previas: string[]
  edad: number | null
  sexo: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir' | null
  updated_at: string
}
```

**Tarea S1-A-3: Server Action**

Crear `frontend/app/actions/medical-profile.ts`:
```typescript
'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { MedicalProfile } from '@/lib/types'

export async function saveMedicalProfile(data: Partial<Omit<MedicalProfile, 'id' | 'user_id' | 'updated_at'>>) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('medical_profiles')
    .upsert({
      user_id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    })

  if (error) throw new Error(error.message)
}

export async function getMedicalProfile(): Promise<MedicalProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('medical_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data ?? null
}
```

**Acceptance tests:**
- [ ] Migration ejecuta sin error: `SELECT * FROM medical_profiles` → tabla vacía
- [ ] RLS: usuario A no puede SELECT de usuario B (probar con dos cuentas de test)
- [ ] `npm run build` sin errores TypeScript
- [ ] `saveMedicalProfile({ medicamentos: ['metformina 850mg'] })` → fila en DB

**Commit:** `feat(db): medical_profiles table, types, and server action`

---

### SESIÓN S1-B: Medical Profile UI (~3-4h)

**Entry files:**
- `frontend/app/onboarding/page.tsx`
- `frontend/components/ui/` (listar para ver qué hay disponible)
- `frontend/app/actions/medical-profile.ts` (recién creado en S1-A)

**Tarea S1-B-1: Componente TagInput**

Crear `frontend/components/ui/TagInput.tsx`:
```typescript
'use client'
import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  label: string
  placeholder: string
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export function TagInput({ label, placeholder, value, onChange, maxTags = 10, className }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = input.trim()
    if (!tag || value.includes(tag) || value.length >= maxTags || tag.length > 60) return
    onChange([...value, tag])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(value.filter(t => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="font-sans text-[13px] text-muted-foreground">{label}</label>
      <div className="min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 flex flex-wrap gap-1.5 focus-within:border-primary/50 transition-colors">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted font-sans text-[13px] text-foreground">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[140px] bg-transparent font-sans text-[14px] outline-none placeholder:text-muted-foreground/50"
          />
        )}
      </div>
      <p className="font-sans text-[11px] text-muted-foreground/50">Presiona Enter o coma para agregar</p>
    </div>
  )
}
```

**Tarea S1-B-2: Step 4 en onboarding (solo Pro)**

En `frontend/app/onboarding/page.tsx`, agregar step 4 condicionado a `plan === 'pro'`. Seguir el patrón exacto de los otros steps existentes. El estado del formulario:
```typescript
const [medProfile, setMedProfile] = useState({
  medicamentos: [] as string[],
  alergias: [] as string[],
  condiciones_previas: [] as string[],
  edad: '' as string | number,
  sexo: '' as string,
})
```

JSX del step 4 (renderizar solo si `isPro && step === totalSteps`):
```tsx
<div className="flex flex-col gap-4">
  <p className="font-sans text-sm text-muted-foreground">
    Esto permite a Aliis personalizar explicaciones con tu contexto real.
    Puedes editarlo después en Cuenta.
  </p>

  <div className="flex gap-3">
    <input
      type="number"
      placeholder="Tu edad"
      value={medProfile.edad}
      onChange={e => setMedProfile(p => ({ ...p, edad: e.target.value }))}
      className="h-11 flex-1 rounded-xl border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
    />
    <select
      value={medProfile.sexo}
      onChange={e => setMedProfile(p => ({ ...p, sexo: e.target.value }))}
      className="h-11 flex-1 rounded-xl border border-border bg-background px-3 font-sans text-[14px] focus:outline-none focus:border-primary/50"
    >
      <option value="">Sexo biológico</option>
      <option value="masculino">Masculino</option>
      <option value="femenino">Femenino</option>
      <option value="otro">Otro</option>
      <option value="prefiero_no_decir">Prefiero no decir</option>
    </select>
  </div>

  <TagInput
    label="Condiciones previas"
    placeholder="Ej: diabetes tipo 2, hipertensión..."
    value={medProfile.condiciones_previas}
    onChange={v => setMedProfile(p => ({ ...p, condiciones_previas: v }))}
  />
  <TagInput
    label="Medicamentos actuales"
    placeholder="Ej: metformina 850mg..."
    value={medProfile.medicamentos}
    onChange={v => setMedProfile(p => ({ ...p, medicamentos: v }))}
  />
  <TagInput
    label="Alergias conocidas"
    placeholder="Ej: penicilina..."
    value={medProfile.alergias}
    onChange={v => setMedProfile(p => ({ ...p, alergias: v }))}
  />

  <button type="button" onClick={skipMedicalStep} className="font-sans text-[13px] text-muted-foreground hover:text-foreground transition-colors self-start">
    Completar después →
  </button>
</div>
```

Al completar step 4 (o skip): llamar `saveMedicalProfile(medProfile)` antes de `router.push('/historial')`.

**Tarea S1-B-3: Editar perfil médico en `/cuenta`**

En `frontend/app/(shell)/cuenta/CuentaClient.tsx`, agregar sección "Perfil médico" (solo si Pro) con el mismo formulario de TagInput. Cargar datos existentes con `getMedicalProfile()` en el server component padre.

**Acceptance tests:**
- [ ] Usuario Free: onboarding = 3 pasos, no aparece step 4
- [ ] Usuario Pro: onboarding = 4 pasos, step 4 con TagInput
- [ ] TagInput: Enter agrega tag, × elimina, máximo 10 respetado, máximo 60 chars/tag
- [ ] Skip → onboarding_done = true, sin fila en medical_profiles
- [ ] Completar step 4 → fila en medical_profiles con datos correctos
- [ ] Editar en /cuenta → UPDATE en DB

**Commit:** `feat(onboarding): medical profile step 4 for Pro, TagInput component, cuenta editor`

---

### SESIÓN S1-C: Enricher con Medical Context (~2h)

**Entry files:**
- `backend/src/lib/enricher.ts`
- `backend/src/lib/generator.ts`

**Tarea S1-C-1: Extender `EnrichedContext`**

En `backend/src/lib/enricher.ts`, agregar campos opcionales a la interfaz y a la función:
```typescript
export interface EnrichedContext {
  para: string
  nombre: string
  previousDx: string[]
  emocion: string | null
  dudas: string | null
  // Pro only:
  medicamentos?: string[]
  alergias?: string[]
  condicionesPrevias?: string[]
  edadYSexo?: string
}
```

En `enrichContext()`, agregar query a `medical_profiles` solo si `plan === 'pro'`:
```typescript
if (plan === 'pro') {
  const { data: med } = await supabase
    .from('medical_profiles')
    .select('medicamentos, alergias, condiciones_previas, edad, sexo')
    .eq('user_id', userId)
    .maybeSingle()

  if (med) {
    context.medicamentos = med.medicamentos ?? []
    context.alergias = med.alergias ?? []
    context.condicionesPrevias = med.condiciones_previas ?? []
    const parts = []
    if (med.sexo && med.sexo !== 'prefiero_no_decir') parts.push(med.sexo.charAt(0).toUpperCase() + med.sexo.slice(1))
    if (med.edad) parts.push(`${med.edad} años`)
    if (parts.length) context.edadYSexo = parts.join(', ')
  }
}
```

**Tarea S1-C-2: Actualizar `generator.ts`**

En `buildUserPrompt()` (o donde se construye el prompt del usuario), agregar el contexto médico antes del diagnóstico principal:
```typescript
const medicalParts: string[] = []
if (context.edadYSexo) medicalParts.push(`Paciente: ${context.edadYSexo}`)
if (context.condicionesPrevias?.length) medicalParts.push(`Condiciones previas: ${context.condicionesPrevias.join(', ')}`)
if (context.medicamentos?.length) medicalParts.push(`Medicamentos actuales: ${context.medicamentos.join(', ')}`)
if (context.alergias?.length) medicalParts.push(`Alergias: ${context.alergias.join(', ')}`)

if (medicalParts.length) {
  prompt += `\n\nCONTEXTO MÉDICO DEL PACIENTE:\n${medicalParts.join('\n')}`
}
```

**Acceptance tests:**
- [ ] Pro con medical_profile: pack generado menciona medicamentos en contexto relevante
- [ ] Free: pack generado sin mencionar medicamentos (aunque exista medical_profile)
- [ ] Pro sin medical_profile: pack generado sin errores
- [ ] `npm run build` en backend sin errores

**Activar feature flag:** `UPDATE feature_flags SET enabled = true, rollout_pct = 0, user_ids = ARRAY['<oscar_id>','<stephanie_id>'] WHERE flag_name = 'medical_profiles'`

**Commit:** `feat(backend): enrich pack generation with medical context for Pro users`

---

## FASE 2 — DIARIO AGÉNTICO

### SESIÓN S2-A: Clinical Thresholds (~2h)

**Entry files:**
- `frontend/lib/aliis-prompt.ts`
- `frontend/app/api/aliis/insight/route.ts`
- `frontend/lib/types.ts`

**Tarea S2-A-1: Crear `frontend/lib/clinical-thresholds.ts`**

Crear el módulo completo con los thresholds de referencia. **NOTA: estos valores deben ser revisados por Stephanie antes de activarse en producción.** Implementar la función `evaluateThresholds(logs: SymptomLog[])`.

Ver código completo en el plan original (S2-A, Paso 1). Implementar sin cambios.

**Tarea S2-A-2: Integrar en `frontend/lib/aliis-prompt.ts`**

Importar `evaluateThresholds` y agregar las alertas al system prompt. Ver plan original S2-A, Paso 2.

**Acceptance tests:**
- [ ] Log con `bp_systolic: 185` → insight menciona alerta de hipertensión
- [ ] Log con `glucose: 45` → insight menciona glucosa crítica
- [ ] Log normal → sin alertas en insight
- [ ] **Revisión clínica:** Stephanie aprueba los valores de threshold antes de rollout 100%

**Feature flag:** `medical_profiles` → esta feature no necesita flag separado, va con el insight diario existente.

**Commit:** `feat(insight): clinical threshold alerts in daily insight`

---

### SESIÓN S2-B: Adherence Logs + Streak UI (~4-5h)

**Entry files:**
- `frontend/migrations/20260427_aliis_tables.sql` (referencia)
- `frontend/app/(shell)/diario/page.tsx`
- `frontend/lib/types.ts`

**Tarea S2-B-1:** Migration SQL (`frontend/migrations/20260521_adherence_logs.sql`) — ver plan original S2-B Paso 1.

**Tarea S2-B-2:** Tipos en `frontend/lib/types.ts` — agregar `AdherenceLog` interface.

**Tarea S2-B-3:** Crear `frontend/lib/adherence.ts` con `calculateStreak()`. **Importante:** calcular por timezone del cliente. Usar `Intl.DateTimeFormat().resolvedOptions().timeZone` en el componente y pasar el timezone al helper.

**Tarea S2-B-4:** Sección de adherencia en `frontend/app/(shell)/diario/page.tsx`. Verificar feature flag `adherence_checklist` antes de renderizar. Cargar medicamentos del `medical_profile` del usuario para mostrar como checkboxes.

**Tarea S2-B-5:** UI del streak con número de días consecutivos.

**Acceptance tests:**
- [ ] Migration ejecuta sin error
- [ ] Marcar medicamento → fila en `adherence_logs`
- [ ] 3 días consecutivos → streak = 3
- [ ] Flag `adherence_checklist` desactivado → sección no visible

**Commit:** `feat(diario): adherence checklist and streak for Pro`

---

### SESIÓN S2-C: Correlación Síntomas-Adherencia (~3h)

**Entry files:**
- `frontend/app/api/aliis/insight/route.ts` (como referencia del patrón)
- `frontend/lib/ai-providers.ts` (ya creado en S0-B)

**Tarea S2-C-1:** Crear `frontend/app/api/aliis/correlation/route.ts`. Parámetro `days` flexible (default 30, mínimo 7). Verificar plan Pro. Retornar error amigable si < 7 días de datos.

**Tarea S2-C-2:** UI en diario — botón "Analizar mi mes". Cache en `localStorage` con key `aliis_correlation_<userId>_<YYYY-MM>`.

**Acceptance tests:**
- [ ] Pro con 30+ días → insight de correlación
- [ ] Free → 403
- [ ] < 7 días → mensaje "Necesitas al menos 7 días de registro"
- [ ] Segunda llamada mismo mes → desde localStorage

**Commit:** `feat(diario): symptom-adherence correlation analysis for Pro`

---

## FASES 3-4 (Resumen — expandir cuando llegues a ellas)

### S3-A: Pre-Consult Summary (4h)
Entry: `frontend/lib/types.ts`, `frontend/app/(shell)/` estructura, `frontend/app/api/aliis/insight/route.ts`
Output: tabla `consult_summaries`, ruta `/c/[token]`, API `/api/aliis/consult`, UI en historial

### S3-B: Cápsula del Tiempo (2h)
Entry: `frontend/vercel.json`, `frontend/app/api/aliis/notify/route.ts`
Output: segundo cron en vercel.json, ruta `/api/aliis/capsula`, card especial en diario

### S3-C: Motor de Consulta (2h)
Entry: `frontend/app/(shell)/cuenta/CuentaClient.tsx`
Output: columnas `next_appointment` en profiles, UI de cita, lógica en cron notify

### S4-A: Diario Libre (3h)
Entry: `frontend/app/api/symptoms/route.ts`, `frontend/app/(shell)/diario/page.tsx`
Output: columna `free_text` en symptom_logs, textarea en UI, confirmación de síntomas extraídos

### S4-B: El Hilo (3h)
Entry: `frontend/app/api/aliis/insight/route.ts` (patrón de caché)
Output: ruta `/api/aliis/hilo`, card en diario, guardado en DB con `type: 'hilo'`

---

## FASE 5 — MOBILE (Detalle completo cuando llegues a Día 66)

### S5-A: Monorepo Setup (2h)
Nota: Empezar con copia manual de types en lugar de shared package. Crear `mobile/` con Expo Router v3.

### S5-B: Mobile Auth (3h)
Supabase + expo-secure-store + Expo Router auth groups

### S5-C: Pack List + Detail (4h)
FlatList, FAB, Pack detail con capítulos

### S5-D: Diario + Push Notifications (4h)
KeyboardAvoidingView, Expo Push, actualizar notify cron para soporte dual (Expo + Web Push)

---

## ROLLOUT DE FEATURE FLAGS POR FASE

| Milestone | Día | Acción en feature_flags |
|-----------|-----|------------------------|
| Tras S1-C | 20 | `medical_profiles`: rollout_pct = 20 → 50 → 100 en 7 días |
| Tras S2-B | 33 | `adherence_checklist`: rollout_pct = 20 → 100 en 7 días |
| Tras S2-C | 38 | `correlation_analysis`: rollout_pct = 20 → 100 en 7 días |
| Tras S3-A | 46 | `pre_consult_summary`: rollout_pct = 20 → 50 (beta Pro) |
| Tras S3-B | 52 | `capsula_tiempo`: rollout_pct = 100 (Free + Pro) |
| Tras S4-A | 60 | `free_text_diary`: rollout_pct = 100 (Free + Pro) |
| Tras S4-B | 65 | `el_hilo`: rollout_pct = 100 |

---

## PLANTILLA DE INICIO DE SESIÓN

Pegar esto al inicio de cada sesión de Claude Code:

```
Lee primero: docs/superpowers/plans/2026-04-30-memory.md

Sesión a ejecutar: [ID DE SESIÓN, ej: S1-B]
Objetivo: [pegar objetivo de esta guía]

Entry files a leer:
- [lista de archivos de esta sesión]

Acceptance tests que deben pasar:
- [lista de tests de esta sesión]

Instrucciones:
- Usa subagent-driven-development para implementar
- No toques archivos fuera de los listados sin preguntarme
- Al terminar, actualiza docs/superpowers/plans/2026-04-30-memory.md con lo completado
- Haz commit al final de cada tarea con el mensaje especificado
```
