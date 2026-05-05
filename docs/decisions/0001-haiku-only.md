# ADR-0001: Haiku como modelo base

**Estado:** Activo
**Fecha:** 2026-04

## Decisión

Usar `claude-haiku-4-5-20251001` como único modelo en producción. No usar Sonnet ni Opus por defecto.

## Razonamiento

- Haiku $0.25/$1.25 por Mtok. Sonnet es 12× más caro ($3/$15).
- Con prompt caching (~80% hit rate en system prompts largos), el coste efectivo baja aún más.
- Los casos de uso de Aliis (explicar diagnósticos, responder preguntas del paciente, analizar síntomas) no requieren el nivel de razonamiento de Sonnet.
- Latencia: Haiku responde en 1-3s. Sonnet en 5-15s. Para chat en tiempo real, Haiku gana.

## Cuándo reconsiderar

- Si aparece un caso de uso que Haiku no puede resolver bien (razonamiento complejo multi-paso, análisis de imágenes médicas avanzado).
- Si el precio de Sonnet baja significativamente.
- Si el volumen de usuarios justifica el coste adicional de Sonnet para features premium específicas.

## Implementación

Modelo centralizado en `frontend/lib/ai-models.ts`. Un cambio de línea lo actualiza en todo el sistema.
