# Flujo de Generación de Packs Mejorado — Design Spec

**Fecha:** 2026-04-26
**Estado:** Aprobado por el usuario, pendiente implementación
**Autor:** Brainstorming session entre Oscar Trujillo y Claude

---

## Resumen ejecutivo

Rediseño del flujo de generación de packs en `/ingreso` y del pipeline backend para integrar la biblioteca curada como fuente de verdad médica del generador AI, expandir las preguntas contextuales de 3 a 4 ejes, y agregar una sección opcional de "Herramientas" generada por AI con guardrails estrictos.

El cambio convierte la biblioteca de un destino paralelo (que vive en `/condiciones`) a un componente activo del pipeline de generación: cuando el diagnóstico del paciente coincide con una condición publicada, el contenido curado por residentes se inyecta al prompt del AI como fuente de verdad, garantizando precisión médica + personalización.

---

## Decisiones de producto (confirmadas con usuario)

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Modo de integración biblioteca↔generador | **Augmentar** — AI siempre genera, biblioteca curada se inyecta como fuente de verdad cuando hay match |
| 2 | Selección del diagnóstico | **Combobox / autocomplete** — un solo input con sugerencias en vivo de la biblioteca |
| 3 | Número de preguntas | **4 preguntas** (eliminar frecuencia, agregar "para quién" + "estado emocional", expandir "qué entender") |
| 4 | Categorías de "¿Qué entender?" | **8 chips + opción libre** (las 4 originales + 4 nuevas) |
| 5 | Botón "Leer más en biblioteca" | **A — En el header del PackView**, arriba a la derecha del título del capítulo |
| 6 | Sección "Herramientas" | **C — Generada por AI**, solo herramientas/prácticas, NUNCA medicamentos. Si no hay nada genuino, no se muestra. |

---

## Arquitectura general

```
┌─────────────────────────────────────────────────────────────┐
│  /ingreso (Frontend)                                         │
│                                                              │
│  Paso 1: ¿Qué te dijo tu médico?                            │
│    └─ <ComboboxDiagnostico /> ──► fuzzy match biblioteca    │
│                                    devuelve {dxText, slug?} │
│  Paso 2: ¿Para quién es este pack?  (3 chips)               │
│  Paso 3: ¿Cómo te sientes?         (4 chips + libre)        │
│  Paso 4: ¿Qué te gustaría entender? (8 chips + libre)       │
│                                                              │
│  POST /pack/generate { dx, conditionSlug, para, emocion,    │
│                        dudas, userId, userPlan }            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend pipeline (POST /pack/generate)                      │
│                                                              │
│  1. validate                                                 │
│  2. classifyIntent              (sin cambios)                │
│  3. resolveLibraryMatch         (NUEVO)                      │
│       ├─ si conditionSlug → carga directo                    │
│       └─ si no → fuzzy match server-side                    │
│  4. enrichContext               (extendido: para, emocion)   │
│  5. generatePack                (extendido: libraryMatch)    │
│       └─ system prompt incluye contenido curado si existe   │
│       └─ devuelve también tools[] opcional                  │
│  6. verifyReferences            (sin cambios)                │
│  7. persist                     (extendido: condition_slug,  │
│                                  tools)                      │
│  8. response                                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  /pack/[id] (Frontend)                                       │
│                                                              │
│  PackView                                                    │
│   ├─ Botón "✦ Leer más" en header de cada chapter           │
│   │  (solo si pack.condition_slug existe)                    │
│   └─ Capítulo extra "Herramientas" si pack.tools.length > 0 │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend: rediseño de `/ingreso`

### Paso 1 — Combobox de diagnóstico

**Componente nuevo:** `frontend/components/ComboboxDiagnostico.tsx`

**Props:**
- `value: string` — texto actual del input
- `onChange: (text: string, conditionSlug: string | null) => void` — emite cada vez que cambia el texto o la selección
- `conditions: Condition[]` — lista completa de condiciones publicadas (precargada server-side por la página)

**UX:**
```
┌──────────────────────────────────────────────┐
│ 🔍  Migraña con au│                          │
└──────────────────────────────────────────────┘
   ┌──────────────────────────────────────────┐
   │ ✓ Migraña con aura          En biblioteca │
   │ ✓ Migraña crónica           En biblioteca │
   │ ──────────────────────────────────────── │
   │ + Usar "Migraña con au" como diagnóstico │
   └──────────────────────────────────────────┘
```

**Comportamiento:**
- Debounce 150ms en cada keystroke antes de filtrar
- Filtrado usando la función `fuzzyMatch` ya existente en `ConditionList.tsx` (extraerla a `lib/fuzzy-search.ts` para reutilizar)
- Sugerencias muestran nombre + badge "✓ En biblioteca" en `font-mono text-[9px] tracking-[.15em] uppercase text-primary/70`
- Última opción siempre visible: "+ Usar [texto literal] como diagnóstico" — al elegirla, `conditionSlug` se setea a `null` y `dxText` al texto literal
- Click en sugerencia de biblioteca: autorrellena input + setea `conditionSlug`
- Enter sin selección activa equivale a "Usar [texto]"
- Navegación teclado: ↓↑ navegan opciones, Enter elige, Esc cierra
- Mostrar lista cuando: input tiene focus AND (texto length ≥ 2 OR hay sugerencias precargadas para mostrar las primeras 4 condiciones de la biblioteca como hint)
- Animación: lista de sugerencias usa `motion/react` para fade-in/fade-out (200ms)

**Stack técnico:** `cmdk` (parte del ecosistema shadcn). Verificar si ya está instalado, si no agregarlo. `motion/react` ya está instalado.

**Estado mantenido en el padre `IngresoPage`:**
```typescript
const [dxText, setDxText] = useState('')
const [conditionSlug, setConditionSlug] = useState<string | null>(null)
```

---

### Pasos 2, 3, 4 — Patrón de chips ampliado

Mantienen el patrón visual actual: chips border-2 con check al seleccionar, opción libre al final con input que aparece cuando se elige `__custom`.

**Paso 2 — `¿Para quién es este pack?`**
- "Para mí" — `value: 'yo'`
- "Para un familiar" — `value: 'familiar'`
- "Acompañando a alguien" — `value: 'acompanando'`
- Sin opción libre (es exhaustivo)

**Paso 3 — `¿Cómo te sientes con este diagnóstico?`**
- "Tranquilo, con dudas" — `value: 'tranquilo'`
- "Asustado" — `value: 'asustado'`
- "Abrumado" — `value: 'abrumado'`
- "Enojado" — `value: 'enojado'`
- "Otro…" — `value: '__custom'`, placeholder "Cuéntame cómo te sientes…"

**Paso 4 — `¿Qué te gustaría entender mejor?`**
- "Qué esperar" — sub: "Evolución y pronóstico"
- "Mis medicamentos" — sub: "Cómo funcionan y para qué"
- "Estilo de vida" — sub: "Alimentación, ejercicio, rutinas"
- "Compartírselo a mi familia" — sub: "Cómo contárselo"
- "Por qué me pasó esto" — sub: "Causas, factores"
- "Cómo afecta mi día a día" — sub: "Trabajo, sueño, energía"
- "Cuándo preocuparme" — sub: "Señales de alarma, qué es normal"
- "Cómo hablar con mi médico" — sub: "Preguntas que llevar"
- "Otra pregunta…" — `value: '__custom'`, placeholder "¿Qué quieres entender?"

Indicador "Paso N de 3" → "Paso N de 4". Animación `ce-fade` se mantiene.

---

### Animación de carga (paso "generating")

Sin cambios. El círculo SVG + 3 squares + STAGES se mantienen igual.

---

## Frontend: cambios en `/pack/[id]` (PackView)

### Botón "Leer más en biblioteca"

En `ChapterCard` (dentro de `PackView.tsx`), en el header del capítulo (donde está `01 · 3 min` y el `<h2>`), agregar un botón pill arriba a la derecha cuando `conditionSlug` existe:

```tsx
<div className="flex items-start justify-between gap-4 mb-2.5">
  <div>
    <div className="font-mono text-[11px] tracking-[.15em] uppercase text-muted-foreground/60">
      {chapter.n} · {chapter.readTime}
    </div>
  </div>
  {conditionSlug && (
    <Link
      href={`/condiciones/${conditionSlug}`}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors no-underline font-mono text-[10px] tracking-[.12em] uppercase text-primary/80"
    >
      ✦ Leer más →
    </Link>
  )}
</div>
```

**Eliminar el bloque actual** "Leer más sobre este diagnóstico →" del final del `ChapterCard` — se vuelve redundante con el botón persistente del header.

### Capítulo "Herramientas" generado por AI

Cuando `pack.tools.length > 0`, se renderiza un capítulo extra en posición 6 (último) con:
- `id: 'herramientas'`
- `n: '06'`
- `kicker: '¿Qué`
- `kickerItalic: 'puedes hacer en tu día a día?'`
- `readTime: '2 min'` (calculado por el frontend)
- `tldr: 'Herramientas y prácticas que pueden ayudarte.'`

El cuerpo del capítulo lista cada `tool` en card:
```tsx
<div className="flex flex-col gap-3 mt-4">
  {pack.tools.map((tool, i) => (
    <div key={i} className="p-[18px_22px] rounded-[14px] border border-border bg-muted/40">
      <div className="font-serif text-[17px] tracking-[-0.01em] text-foreground mb-1.5">{tool.title}</div>
      <div className="font-sans text-[14px] text-muted-foreground leading-[1.6]">{tool.description}</div>
    </div>
  ))}
</div>
```

Si `tools` está vacío o no existe, este capítulo no se agrega ni a la lista navegable, ni a la sidebar, ni al footer de navegación.

**Implementación:** En `PackView.tsx`, calcular `chaptersWithTools` derivado de `pack.chapters + (pack.tools.length > 0 ? [herramientasChapter] : [])` y usar esa lista en todos lados donde hoy se usa `pack.chapters`.

---

## Backend: pipeline de generación

### Nuevo módulo `backend/src/lib/library-resolver.ts`

```typescript
export interface MatchedCondition {
  slug: string
  name: string
  sections: Array<{
    slug: string
    title: string
    content: unknown // ConditionSection.content shape
  }>
}

export async function resolveLibraryMatch(
  dx: string,
  conditionSlug?: string | null
): Promise<MatchedCondition | null>
```

**Lógica:**

1. **Si `conditionSlug` viene del frontend** (paciente eligió de la lista del combobox):
   - Query directo: `conditions.select(slug, name).eq('slug', conditionSlug).eq('published', true).single()`
   - Si existe, cargar `condition_sections` ordenadas
   - Devolver `{ slug, name, sections }`

2. **Si no viene `conditionSlug`** (texto libre del paciente):
   - Cargar todas las condiciones publicadas (`name, slug`)
   - Aplicar fuzzy match con normalización de acentos + Levenshtein (mismo algoritmo que `ConditionList`)
   - Si la mejor coincidencia tiene `score ≥ 0.85` (umbral conservador para evitar falsos positivos), cargar sus secciones
   - Si ninguna pasa el umbral, devolver `null`

**Por qué umbral alto en server-side:** En el frontend (combobox) el fuzzy es laxo porque el paciente confirma visualmente; en el server-side es laxo solo si el match es casi seguro, porque inyectar contenido equivocado al prompt sería peor que no inyectar nada.

**Reutilización:** la lógica de `normalize()` y `levenshtein()` se duplica entre frontend (`lib/fuzzy-search.ts`, a extraer) y backend (`lib/fuzzy-search.ts` nuevo). Es código pequeño y no vale la pena montar un módulo compartido entre dos `package.json` separados.

---

### Generator extendido

**Firma:** `generatePack(diagnostico, context, libraryMatch?)`

**Cambios al system prompt:**

Agregar al final del prompt (entre las reglas y antes del cierre):

```
== HERRAMIENTAS PARA EL DÍA A DÍA ==
Después de los 5 capítulos principales, incluye un campo "tools" en el JSON con un array de
herramientas/prácticas concretas que el paciente puede hacer en su día a día para vivir mejor
con su diagnóstico.

REGLAS ESTRICTAS para tools:
- SOLO herramientas, prácticas, técnicas no farmacológicas, hábitos
- NUNCA medicamentos, dosis, esquemas de tratamiento, suplementos
- NUNCA pruebas diagnósticas o consultas con especialistas
- Cada herramienta = título corto (3-6 palabras) + descripción concreta de 1-2 frases
- Si no hay nada genuino y útil que sugerir para este diagnóstico específico, devuelve "tools": []
- Máximo 4 herramientas. Calidad sobre cantidad.
- Ejemplos válidos: "diario de síntomas", "técnica de respiración 4-7-8", "rutina de sueño consistente"
- Ejemplos inválidos: "tomar X medicamento", "hacerse Y estudio", "consultar especialista en Z"
```

Y cuando `libraryMatch` existe, agregar antes de `== HERRAMIENTAS ==`:

```
== FUENTE DE VERDAD (BIBLIOTECA ALIIS) ==
Este diagnóstico tiene una guía curada por médicos residentes. Úsala como tu fuente de verdad
médica: todos los hechos clínicos, mecanismos, evolución típica y señales de alarma deben
venir de aquí o ser consistentes con esto. Personaliza el tono y enfoque según el contexto
del paciente, pero NO contradigas estos hechos.

CONDICIÓN: ${libraryMatch.name}

CONTENIDO CURADO:
${libraryMatch.sections.map(s => `## ${s.title}\n${formatSectionContent(s.content)}`).join('\n\n')}
```

`formatSectionContent` es una función helper en `library-resolver.ts` que serializa el JSON de `condition_sections.content` (que tiene shape `{ paragraphs?, callout?, timeline?, questions?, alarms?, references? }`) a texto plano legible para inyectar al prompt. Concatena párrafos, callout body, items de timeline, questions y alarms en líneas separadas. Las references curadas no se inyectan porque el AI genera las suyas con `verifyReferences`.

**JSON estructura extendida:**

```json
{
  "summary": "...",
  "chapters": [...],
  "references": [...],
  "tools": [
    { "title": "Diario de cefaleas", "description": "Anota cuándo, qué la disparó, qué tomaste y qué te alivió. Te ayuda a identificar patrones tú y tu médico." }
  ]
}
```

**Validación:** `isValidGeneratedPack` se extiende para validar que `tools` sea array (puede ser vacío) si está presente. `tools` es opcional en el JSON pero se normaliza a `[]` antes de persistir.

---

### EnrichedContext extendido

```typescript
export interface EnrichedContext {
  para: 'yo' | 'familiar' | 'acompanando'
  emocion?: string             // NUEVO
  dudas?: string
  nombre: string | null
  previousDx: string[]
  // frecuencia REMOVIDO
}
```

El `enricher.ts` recibe del request `{ para, emocion, dudas }` (sin `frecuencia`) y los pasa tal cual.

---

### Persistencia: cambios en tabla `packs`

Migración SQL:

```sql
alter table packs add column condition_slug text;
alter table packs add column tools jsonb default '[]'::jsonb;
create index packs_condition_slug_idx on packs(condition_slug) where condition_slug is not null;
```

`condition_slug` se llena desde el `libraryMatch.slug` (puede ser `null` si no hubo match).
`tools` se llena con el array generado por AI (default `[]`).

**Migración del lookup actual en `app/(shell)/pack/[id]/page.tsx`:**

Hoy hace:
```typescript
const { data: conditionMatch } = await supabase
  .from('conditions')
  .select('slug, name')
  .eq('published', true)
  .ilike('name', `%${row.dx}%`)
  .limit(1)
  .maybeSingle()
```

Esto se elimina. El slug ya viene en `row.condition_slug`.

---

### Cambios al request/response del endpoint

**Request `POST /pack/generate`:**
```typescript
{
  diagnostico: string,
  conditionSlug?: string | null,    // NUEVO
  contexto: {
    para: 'yo' | 'familiar' | 'acompanando',  // NUEVO valor 'acompanando'
    emocion?: string,                          // NUEVO
    dudas?: string,
    // frecuencia REMOVIDO
  },
  userId: string,
  userPlan: 'free' | 'pro'
}
```

**Response `POST /pack/generate` (success):**
```typescript
{
  pack: {
    id: string,
    dx: string,
    for: 'yo' | 'familiar' | 'acompanando',
    createdAt: string,
    summary: string,
    chapters: Chapter[],
    references: Reference[],
    conditionSlug: string | null,    // NUEVO
    tools: Tool[]                     // NUEVO
  }
}
```

---

## Tipos compartidos

**Frontend `frontend/lib/types.ts` — agregar:**

```typescript
export interface Tool {
  title: string
  description: string
}

// Extender Pack:
export interface Pack {
  id: string
  dx: string
  for: 'yo' | 'familiar' | 'acompanando'
  createdAt: string
  summary: string
  chapters: Chapter[]
  references: Reference[]
  conditionSlug: string | null   // NUEVO
  tools: Tool[]                  // NUEVO
}
```

**Backend `backend/src/types.ts` — extender `GeneratedPack`:**

```typescript
export interface GeneratedPack {
  summary: string
  chapters: Chapter[]
  references: Reference[]
  tools: Tool[]
}
```

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El AI ignora la "fuente de verdad" curada y genera contenido contradictorio | El system prompt es enfático ("NO contradigas estos hechos"). Si emerge como problema en QA, considerar capa de validación post-hoc que compare señales de alarma generadas vs. curadas. No bloqueante para v1. |
| El AI sugiere medicamentos en `tools` a pesar de las reglas | El prompt es enfático con ejemplos válidos/inválidos. Si emerge, agregar capa de validación regex que detecte palabras clave de medicamentos y elimine la herramienta correspondiente. No bloqueante para v1. |
| El fuzzy match server-side da falsos positivos e inyecta contenido de la condición equivocada | Umbral alto (0.85). En el peor caso, el contenido inyectado es de un diagnóstico relacionado, no completamente fuera de tema. Aceptable. |
| Migración de packs existentes — `condition_slug` y `tools` quedan null/[] en packs viejos | Aceptable: el `ilike` actual también ya devolvía null la mayoría del tiempo. UI degrada elegantemente (botón "Leer más" no aparece, capítulo "Herramientas" no aparece). |
| Combobox con muchas condiciones (cuando crezca la biblioteca) carga inicial pesada | Por ahora la biblioteca es chica (~5-10 condiciones). Si crece a >50, implementar carga lazy. No bloqueante para v1. |

---

## Out of scope (explícitamente)

- Recursos externos curados (apps, grupos de apoyo) — se evaluó como Pregunta 6 opción A y se descartó a favor de C
- Herramientas interactivas dentro de Aliis (diario, tracker) — se evaluó como Pregunta 6 opción B y se descartó
- Preguntas sobre tratamientos previos, red de apoyo, preferencia de aprendizaje, restricciones de vida — se evaluaron y se decidió mantener 4 preguntas
- Sección de "frecuencia" — eliminada del flujo

---

## Métricas de éxito (criterios de aceptación)

1. Un paciente puede escribir "sinkope" en el combobox y ver "Síncope" como sugerencia con badge "En biblioteca"
2. Cuando elige una sugerencia y genera el pack, el contenido del pack es consistente con la guía curada (verificación manual contra la condición publicada)
3. Cuando escribe un dx que NO está en biblioteca, el flujo funciona idéntico al de hoy y `condition_slug` queda `null`
4. El pack generado para un dx con match muestra el botón "✦ Leer más" en cada chapter
5. La sección "Herramientas" aparece sólo cuando el AI devuelve `tools.length > 0`
6. Las 4 preguntas se muestran en orden y la indicación dice "Paso N de 4"
7. El AI nunca sugiere medicamentos en la sección `tools` (validación manual sobre 5 packs generados de prueba)
