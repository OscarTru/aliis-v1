# Agent Memory Encryption (AES-256-GCM) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encriptar el campo `content` de `agent_memory` con AES-256-GCM en la capa de aplicación, de modo que los datos médicos almacenados en Supabase sean ilegibles sin la clave de encriptación, sin cambiar la API pública de `writeMemory`/`readMemory`.

**Architecture:** Se agrega un helper `frontend/lib/memory-crypto.ts` con `encrypt(obj)→string` y `decrypt(str)→Record` usando AES-256-GCM de Node.js `crypto`. La columna `content` en `agent_memory` cambia de `jsonb` a `text` (ciphertext base64url). `writeMemory` cifra antes de insertar; `readMemory` descifra al leer. Los callers existentes (`agent/route.ts`, `patient-context.ts`, `insight/route.ts`, etc.) no cambian — solo ven `Record<string, unknown>` como siempre.

**Tech Stack:** Node.js `crypto` (AES-256-GCM, built-in, sin dependencias nuevas), Supabase migrations SQL, TypeScript.

---

## File Map

### Nuevos archivos
- `frontend/lib/memory-crypto.ts` — `encrypt(obj)` y `decrypt(str)`, usa `AGENT_MEMORY_ENCRYPTION_KEY` del env

### Archivos modificados
- `frontend/lib/agent-memory.ts` — cifra en `writeMemory`, descifra en `readMemory`
- `frontend/lib/types.ts` — campo `content` en `AgentMemory` sigue siendo `Record<string, unknown>` (sin cambio visible)
- `frontend/migrations/20260506_agent_memory_encrypt_content.sql` — migra columna `content` de `jsonb` a `text`, re-encripta filas existentes como `{}` (reset seguro)

### Variables de entorno nuevas
- `AGENT_MEMORY_ENCRYPTION_KEY` — 32 bytes en hex (64 chars), en Vercel

---

## Task 1: Helper memory-crypto.ts

**Files:**
- Create: `frontend/lib/memory-crypto.ts`

- [ ] **Step 1: Crear el helper**

```typescript
// frontend/lib/memory-crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALG = 'aes-256-gcm'
const KEY_ENV = 'AGENT_MEMORY_ENCRYPTION_KEY'

function getKey(): Buffer {
  const hex = process.env[KEY_ENV]
  if (!hex || hex.length !== 64) {
    throw new Error(`${KEY_ENV} must be a 64-char hex string (32 bytes)`)
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Cifra un objeto JSON con AES-256-GCM.
 * Retorna: base64url(<iv:12><authTag:16><ciphertext>)
 */
export function encrypt(obj: Record<string, unknown>): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALG, key, iv)
  const plain = JSON.stringify(obj)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Empaqueta iv + authTag + ciphertext en un solo buffer
  const packed = Buffer.concat([iv, authTag, encrypted])
  return packed.toString('base64url')
}

/**
 * Descifra un ciphertext producido por encrypt().
 * Si falla (dato corrupto, clave incorrecta, texto plano legacy), retorna {}.
 */
export function decrypt(ciphertext: string): Record<string, unknown> {
  try {
    const key = getKey()
    const packed = Buffer.from(ciphertext, 'base64url')
    const iv = packed.subarray(0, 12)
    const authTag = packed.subarray(12, 28)
    const encrypted = packed.subarray(28)
    const decipher = createDecipheriv(ALG, key, iv)
    decipher.setAuthTag(authTag)
    const plain = decipher.update(encrypted) + decipher.final('utf8')
    return JSON.parse(plain) as Record<string, unknown>
  } catch {
    // Dato no encriptado (fila legacy) o corrupto — retorna vacío
    return {}
  }
}
```

- [ ] **Step 2: Generar la clave y anotarla**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarda el output (64 chars hex). Esta es `AGENT_MEMORY_ENCRYPTION_KEY`. La necesitarás en Vercel (Step 3) y en el `.env.local` para desarrollo.

- [ ] **Step 3: Agregar la variable a Vercel**

En Vercel Dashboard → Settings → Environment Variables:
- Name: `AGENT_MEMORY_ENCRYPTION_KEY`
- Value: el hex generado arriba
- Environments: Production, Preview, Development

Para desarrollo local, agregar en `frontend/.env.local`:
```
AGENT_MEMORY_ENCRYPTION_KEY=<el-mismo-hex>
```

- [ ] **Step 4: Typecheck**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Salida esperada: sin errores relacionados con `memory-crypto.ts`.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/memory-crypto.ts
git commit -m "feat(security): memory-crypto — AES-256-GCM encrypt/decrypt para agent_memory"
```

---

## Task 2: Migración SQL — content de jsonb a text

**Files:**
- Create: `frontend/migrations/20260506_agent_memory_encrypt_content.sql`

El campo `content` pasa de `jsonb` a `text`. Las filas existentes se resetean a `'{}'` encriptado — no tiene sentido encriptar los valores actuales sin la clave, y el historial de observaciones puede regenerarse.

- [ ] **Step 1: Crear la migración**

```sql
-- frontend/migrations/20260506_agent_memory_encrypt_content.sql
-- Migra agent_memory.content de jsonb a text para almacenar ciphertext AES-256-GCM.
-- Las filas existentes se truncan a '{}' encriptado (se regeneran en el siguiente ciclo).

-- 1. Cambiar tipo de columna
alter table agent_memory
  alter column content type text using content::text;

-- 2. Eliminar el default jsonb (ya no aplica)
alter table agent_memory
  alter column content drop default;

-- 3. Limpiar filas existentes — el ciphertext se generará desde la app.
--    Dejamos un marcador literal para que decrypt() lo detecte y retorne {}.
update agent_memory set content = 'legacy';

-- 4. NOT NULL sigue aplicando
alter table agent_memory
  alter column content set not null;
```

- [ ] **Step 2: Ejecutar en Supabase**

Ir a Supabase Dashboard → SQL Editor → pegar y ejecutar el contenido del archivo.

Verificar en Table Editor → `agent_memory` que la columna `content` ahora es `text` (no `jsonb`).

- [ ] **Step 3: Commit**

```bash
git add frontend/migrations/20260506_agent_memory_encrypt_content.sql
git commit -m "feat(db): migrar agent_memory.content de jsonb a text para ciphertext AES-GCM"
```

---

## Task 3: Actualizar agent-memory.ts

**Files:**
- Modify: `frontend/lib/agent-memory.ts`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```typescript
// frontend/lib/agent-memory.ts
import { createServerSupabaseClient } from './supabase-server'
import { encrypt, decrypt } from './memory-crypto'
import type { AgentMemory, AgentName, MemoryType } from './types'

export async function writeMemory(
  userId: string,
  agentName: AgentName,
  type: MemoryType,
  content: Record<string, unknown>,
  expiresInDays?: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const expires_at = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null
  const { error } = await supabase.from('agent_memory').insert({
    user_id: userId,
    agent_name: agentName,
    memory_type: type,
    content: encrypt(content),
    expires_at,
  })
  if (error) console.error('[agent-memory] writeMemory error', error.message)
}

export async function readMemory(
  userId: string,
  agentName: AgentName,
  type?: MemoryType,
  limitDays = 30
): Promise<AgentMemory[]> {
  const supabase = await createServerSupabaseClient()
  const since = new Date(Date.now() - limitDays * 86_400_000).toISOString()

  let q = supabase
    .from('agent_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_name', agentName)
    .gte('created_at', since)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false })
    .limit(50)

  if (type) q = q.eq('memory_type', type)

  const { data, error } = await q
  if (error) {
    console.error('[agent-memory] readMemory error', error.message)
    return []
  }

  return (data ?? []).map((row) => ({
    ...row,
    content: decrypt(row.content as string),
  })) as AgentMemory[]
}
```

- [ ] **Step 2: Verificar que AgentMemory.content sigue siendo Record<string, unknown>**

El tipo `AgentMemory` en `frontend/lib/types.ts` tiene `content: Record<string, unknown>`. Esto **no cambia** — los callers reciben el objeto descifrado, nunca el ciphertext. Verificar que el tipo no necesita ajuste:

```bash
grep -A 10 "interface AgentMemory" frontend/lib/types.ts
```

Salida esperada: `content: Record<string, unknown>` — sin cambios necesarios.

- [ ] **Step 3: Typecheck completo**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Salida esperada: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/agent-memory.ts
git commit -m "feat(security): agent-memory cifra/descifra content con AES-256-GCM"
```

---

## Task 4: Verificación end-to-end

- [ ] **Step 1: Levantar dev server**

```bash
cd frontend && npm run dev
```

Asegurarse que `AGENT_MEMORY_ENCRYPTION_KEY` esté en `frontend/.env.local`.

- [ ] **Step 2: Probar el flujo de escritura**

Iniciar sesión con un usuario que tenga historial. Abrir el chat de Aliis (`/inicio` → icono de chat) y escribir un mensaje. Esto llama a `writeMemory` internamente si la respuesta genera una observación.

Verificar en Supabase Dashboard → Table Editor → `agent_memory` que las nuevas filas tienen `content` como string base64url (no JSON legible).

- [ ] **Step 3: Probar el flujo de lectura**

En el mismo chat, hacer una pregunta que requiera memoria (ej. "¿recuerdas qué te dije antes?"). Aliis debe responder coherentemente, lo que indica que `readMemory` + `decrypt` funcionan.

- [ ] **Step 4: Verificar que filas legacy retornan {}**

Las filas con `content = 'legacy'` deben retornar `{}` sin lanzar excepción (el catch en `decrypt` las maneja). Esto es correcto — esas observaciones antiguas simplemente no aportan contexto.

- [ ] **Step 5: Build de producción**

```bash
cd frontend && npm run build 2>&1 | tail -10
```

Salida esperada: `✓ Compiled successfully` o equivalente sin errores de tipo.

- [ ] **Step 6: Commit final + push**

```bash
git add -A
git commit -m "fix(security): verificación E2E encriptación agent_memory"
git push origin dev
```
