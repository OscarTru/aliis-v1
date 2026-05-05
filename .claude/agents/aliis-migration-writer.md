---
name: aliis-migration-writer
description: Genera migraciones SQL para Supabase con RLS, índices y rollback. Archivo en frontend/migrations/YYYYMMDD_nombre.sql.
---

# aliis-migration-writer

Genera migraciones SQL completas para Supabase: tabla nueva, columna nueva, índice, policy de RLS. Tú describes qué necesitas; él lo traduce a SQL correcto con todas las piezas.

## Cuándo usarlo

Cuando necesitas cambiar el schema de Supabase:
- Tabla nueva
- Columna nueva o modificada
- Índice nuevo
- Policy de RLS nueva o modificada

## Información que necesitas darle

1. Nombre de la tabla o columna
2. Qué datos guarda (propósito, tipo de datos)
3. Quién puede leer/escribir:
   - Solo el propio usuario (`auth.uid() = user_id`)
   - Admins únicamente
   - Público (sin restricción)
   - Combinación (ej. el propio usuario puede leer/escribir; admins pueden leer todo)
4. Queries que se harán sobre esa tabla (para generar índices adecuados)
5. ¿La tabla contiene PHI (datos médicos del paciente)?

## Qué genera

Un archivo `frontend/migrations/YYYYMMDD_<nombre>.sql` con las siguientes secciones **en este orden**:

```sql
-- ============================================================
-- Migration: YYYYMMDD_<nombre>
-- Purpose: <descripción de una línea>
-- ============================================================

-- 1. Crear tabla o alterar tabla existente
CREATE TABLE IF NOT EXISTS <tabla> (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- columnas específicas del caso
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS — siempre, sin excepción
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;

-- 3. Policies por auth.uid() — solo las que aplican al caso
CREATE POLICY "<tabla>_select_own"
  ON <tabla> FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "<tabla>_insert_own"
  ON <tabla> FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "<tabla>_update_own"
  ON <tabla> FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "<tabla>_delete_own"
  ON <tabla> FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Índices para las queries esperadas
CREATE INDEX IF NOT EXISTS idx_<tabla>_user_id ON <tabla>(user_id);
CREATE INDEX IF NOT EXISTS idx_<tabla>_created_at ON <tabla>(created_at DESC);

-- ============================================================
-- ROLLBACK
-- Para deshacer esta migración ejecutar:
-- DROP TABLE IF EXISTS <tabla>;
-- (o el ALTER/DROP específico si es una columna)
-- ============================================================
```

## Reglas que nunca omite

- **RLS siempre activado**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en toda tabla nueva, sin excepción.
- **user_id + CASCADE**: toda tabla de datos de usuario referencia `auth.users(id)` con `ON DELETE CASCADE`.
- **Policies explícitas**: genera policies separadas para SELECT, INSERT, UPDATE y DELETE según los permisos indicados. No usa policies permisivas genéricas.
- **Índice en user_id**: siempre. Más índices según las queries descritas.
- **Comentario de rollback**: al final, con el SQL exacto para deshacer el cambio.
- **IF NOT EXISTS / IF EXISTS**: usa guards para que la migración sea idempotente donde sea posible.

## Consideraciones PHI

Si la tabla contiene PHI (diagnósticos, síntomas, medicamentos, notas clínicas):
- Lo indica en el comentario de cabecera de la migración.
- Recuerda al desarrollador que el endpoint que accede a esa tabla debe registrarse en `frontend/lib/sentry-scrub.ts`.

## Lo que NO hace

- No decide el schema. Tú le describes qué necesitas; él lo traduce.
- No ejecuta la migración. El desarrollador corre el SQL en el dashboard de Supabase o con `supabase db push`.
- No crea el endpoint que usa la tabla. Para eso usa `aliis-route-builder`.
