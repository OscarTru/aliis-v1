# ADR-0005: Prompt caching siempre activo

**Estado:** Activo
**Fecha:** 2026-04

## Decisión

Todos los system prompts de Claude se envían con `cache_control: { type: 'ephemeral' }`. Sin excepciones.

## Razonamiento

- Anthropic cachea system prompts por 5 minutos. En producción con múltiples usuarios, el hit rate llega a ~80%.
- El coste de tokens de entrada cacheados es 90% menor que no cacheados.
- System prompts de Aliis tienen entre 800 y 2000 tokens — suficiente para que el caching sea rentable.
- El helper `cachedSystem()` en `frontend/lib/anthropic.ts` envuelve el prompt automáticamente.

## Implementación

Siempre usar `cachedSystem(readPrompt('nombre', 'v1'))`. Nunca pasar prompts inline sin cache.
