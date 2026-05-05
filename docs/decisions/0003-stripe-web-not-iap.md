# ADR-0003: Stripe en web, no IAP en app móvil

**Estado:** Activo
**Fecha:** 2026-05

## Decisión

Los pagos de suscripción Pro se procesan exclusivamente en la web (Stripe). La app Flutter no implementa IAP (In-App Purchase).

## Razonamiento

- **Apple App Store Rule 3.1.1**: apps que ofrecen suscripciones deben usar IAP si el servicio se consume en la app. La comisión es 30% (15% después del año 1).
- **Margen**: con Stripe (~2.9%), el margen es viable. Con IAP 30%, no.
- **Complejidad**: IAP requiere implementación en StoreKit (iOS) + Play Billing (Android) + reconciliación con Supabase. Stripe ya está implementado y funciona.
- **Workaround legal**: la app puede mostrar precios y dirigir al usuario a completar el pago en la web. Apple permite esto si la app no es el único canal de compra.

## Implementación

La app Flutter muestra los planes y redirige a `aliis.app/precios` con deep link de vuelta. La sesión de Supabase SSR en web reconoce al usuario y activa Pro automáticamente tras el pago.

## Riesgo

Apple puede rechazar la app si el flujo de redirección a web no está bien implementado. El runbook `docs/runbooks/apple-app-review-rejection.md` cubre este caso.
