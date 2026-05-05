---
name: aliis-prompt-engineer
description: Edita prompts de Aliis de forma segura: crea v(N+1).md, nunca edita versiones existentes, actualiza CHANGELOG.md.
---

# aliis-prompt-engineer

Edita system prompts de Aliis respetando el versionado inmutable: crea `v(N+1).md`, nunca toca versiones existentes, actualiza el CHANGELOG. Tú le das la dirección del cambio; él ejecuta.

## Cuándo usarlo

Cuando necesitas:
- Modificar un system prompt existente (tono, restricciones, secciones, instrucciones)
- Crear un system prompt nuevo
- Documentar por qué cambió un prompt

## Prompts disponibles en el sistema

| Nombre | Ubicación | Propósito |
|---|---|---|
| `aliis-agent` | `docs/prompts/aliis-agent/` | Acompañante de salud del paciente (agente principal) |
| `chapter-chat` | `docs/prompts/chapter-chat/` | Chat de capítulo educativo (Pro) |
| `aliis-core` | `docs/prompts/aliis-core/` | Respuestas cortas de orientación (Free) |
| `patient-context` | `docs/prompts/patient-context/` | Construcción de contexto médico del paciente |
| `pack-generator` | `docs/prompts/pack-generator/` | Generación de packs educativos (backend Railway) |

## Información que necesitas darle

1. Nombre del prompt (ver tabla arriba, o nombre del nuevo)
2. Qué cambiar: tono, una restricción nueva, una sección a reescribir, una instrucción que añadir/quitar
3. Por qué: razón del cambio (para el CHANGELOG)

## Qué hace — paso a paso

### 1. Lee la versión activa más reciente

Busca el archivo `v(N).md` más alto en `docs/prompts/<nombre>/`. Lo lee completo para entender el contexto.

### 2. Crea `v(N+1).md` con los cambios

Crea `docs/prompts/<nombre>/v(N+1).md` con:
- El contenido de `v(N).md` como base
- Los cambios solicitados aplicados
- Una línea de cabecera que indique versión y fecha: `<!-- v(N+1) — YYYY-MM-DD -->`

**Nunca modifica `v(N).md`.**

### 3. Actualiza `docs/prompts/CHANGELOG.md`

Añade una entrada al inicio del CHANGELOG con el formato:

```markdown
## YYYY-MM-DD — <nombre> v(N) → v(N+1)

**Razón:** <razón del cambio>
**Cambios:**
- <cambio 1>
- <cambio 2>
```

Si el archivo no existe, lo crea con esa entrada.

### 4. Indica qué actualizar en el route handler

Señala la línea exacta que hay que cambiar en el route handler para apuntar a la nueva versión:

```typescript
// Antes:
const prompt = await readPrompt('<nombre>', 'v(N)')
// Después:
const prompt = await readPrompt('<nombre>', 'v(N+1)')
```

Indica el archivo donde vive ese `readPrompt()`.

## Regla de oro — inmutabilidad de versiones

**Las versiones anteriores son inmutables.**

- Si algo sale mal con `v(N+1)`, se crea `v(N+2)`. Nunca se edita `v(N+1)`.
- Esto garantiza trazabilidad completa y posibilidad de rollback instantáneo (basta con apuntar `readPrompt()` a la versión anterior).

## Restricciones de contenido que nunca elimina

Independientemente de los cambios solicitados, estos bloques no se tocan si existen:
- La prohibición de diagnosticar, ajustar dosis u opinar sobre tratamientos
- La instrucción de regresar decisiones clínicas al médico tratante
- Cualquier bloque marcado con `<!-- IMMUTABLE -->` en el prompt

Si el cambio solicitado entra en conflicto con alguna de estas restricciones, lo señala y pide confirmación antes de proceder.

## Lo que NO hace

- No decide qué cambiar en el prompt. Tú das la dirección; él ejecuta.
- No evalúa si el cambio es clínicamente correcto. Esa responsabilidad es del equipo.
- No actualiza el `readPrompt()` en el route handler — solo indica qué línea cambiar.
- No crea endpoints ni migraciones. Para eso usa `aliis-route-builder` o `aliis-migration-writer`.
