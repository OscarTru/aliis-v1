# ADR-0002: Flutter sobre React Native

**Estado:** Activo
**Fecha:** 2026-05

## Decisión

Usar Flutter para la app móvil de Aliis, no React Native ni Capacitor.

## Razonamiento

- **Sensación nativa**: Flutter compila a código nativo real (Impeller). React Native usa bridge JS→nativo. Capacitor usa WebView. En apps de salud donde la confianza del usuario es crítica, la calidad de la UX importa.
- **Animaciones**: Flutter a 60/120fps sin jank. El bridge de RN introduce latencia en animaciones complejas.
- **Dart vs TypeScript**: Curva similar de aprendizaje. Dart es más predecible para UI que JS.
- **Timeline**: sin presión de 1 mes, la inversión en Flutter vale la pena.

## Trade-offs aceptados

- Reescritura completa de UI (la web Next.js no se reutiliza en Flutter).
- Dart es un lenguaje nuevo para el equipo.
- Ecosistema más pequeño que React Native.

## Por qué no Capacitor

Capacitor habría sido válido con timeline corto, pero la experiencia WebView no alcanza el estándar de calidad que Aliis quiere proyectar.
