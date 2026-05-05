# ADR-0004: Supabase como backend de datos

**Estado:** Activo
**Fecha:** 2026-04

## Decisión

Usar Supabase (Postgres + Auth + Storage + RLS) como única fuente de verdad de datos.

## Razonamiento

- **RLS**: Row Level Security garantiza que cada usuario solo accede a sus datos sin lógica adicional en el servidor.
- **Auth SSR**: Supabase Auth con cookies funciona perfectamente con Next.js App Router.
- **Postgres**: datos relacionales complejos (condiciones, tratamientos, síntomas, adherencia) se modelan mejor en SQL que en NoSQL.
- **Velocidad de desarrollo**: el cliente JS de Supabase reduce boilerplate. Las migraciones SQL son predecibles.

## Trade-offs

- Vendor lock-in moderado (mitigable con SQL estándar).
- El service role key debe custodiarse con cuidado — bypasea RLS.
