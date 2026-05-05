# ADR-0006: Deprecación del /app raíz

**Estado:** Pendiente
**Fecha:** 2026-05

## Situación actual

El directorio raíz contiene una app Next.js legacy (`/app`, `package.json`, `tailwind.config.ts`) que servía como landing pública anterior. El `/frontend` la reemplaza completamente.

## Decisión pendiente

No borrar hasta que `frontend/` cubra 100% de la funcionalidad de la landing pública y esté confirmado en producción.

## Plan de deprecación

1. Verificar que el dominio principal apunta a `frontend/` en Vercel.
2. Confirmar que no hay rutas en el raíz que no existan en `frontend/`.
3. Mover a `/app-legacy/` con un README explicativo.
4. Eliminar en la siguiente fase si no hay regresiones en 2 semanas.

## Por qué no borrar ahora

Riesgo de perder rutas o configuración que no se han auditado completamente.
