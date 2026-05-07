# Flutter UI Redesign — Design Spec

## Objetivo

Rediseñar la UI de la app Flutter de Aliis con un estilo Editorial Minimal que replique la identidad visual de la web: tipografía serif dominante, fondo blanco puro, color teal solo en acentos puntuales, y navegación inferior flotante estilo iOS 26.

---

## Decisiones de diseño

### Dirección visual — Editorial Minimal

- **Fondo:** blanco puro `#FFFFFF` en todas las pantallas. Sin grises de relleno en cards.
- **Tipografía heading:** Playfair Display italic weight 300, tamaño grande (26–32px). Igual que los headings serif de la web.
- **Tipografía body:** Inter 400/500, tamaño 10–12px.
- **Eyebrows:** monospace, uppercase, letter-spacing 1.5px, color `#999`.
- **Color:** teal `#1F8A9B` / teal oscuro `#14606E` solo en acentos: valores clave, pills activos, íconos activos, card de señal Aliis. Todo lo demás en `#272730` o `#999`.
- **Separadores:** líneas `1px solid #F0F0F0` en lugar de cards con background.
- **Sin sombras** en contenido. Sombra solo en el bottom nav flotante.

### Paleta exacta (heredada de la web)

| Token | Hex |
|---|---|
| primary | `#1F8A9B` |
| deep teal | `#14606E` |
| foreground | `#272730` |
| background | `#FFFFFF` |
| muted-fg | `#999999` |
| border | `#F0F0F0` |
| red alert | `#DC2626` |
| amber | `#F59E0B` |

### Bottom nav — iOS 26 glass pill

- Posición: absoluta, `bottom: 14px`, `left/right: 14px`.
- Forma: `border-radius: 36px`, fondo `rgba(255,255,255,0.88)`, `backdrop-filter: blur(28px) saturate(180%)`.
- Borde: `1px solid rgba(0,0,0,0.08)`.
- Sombra: `0 8px 32px rgba(0,0,0,0.12)`.
- Tab activo: ícono en `#1F8A9B` + dot indicator de 4px debajo.
- Tabs inactivos: ícono en `#BBBBBB`.
- FAB central ✦: círculo `#272730`, 42px, elevado `-8px` sobre el nav, sombra `0 4px 14px rgba(0,0,0,0.3)`.

---

## Arquitectura de navegación

```
Bottom nav: Inicio · Expediente · ✦ · Medicación · Perfil
```

| Tab | Ícono | Contenido |
|---|---|---|
| Inicio | home | Feed del día + campanita alertas |
| Expediente | document | Historial diario de síntomas y vitales |
| ✦ | FAB oscuro | Chat Aliis (full-screen sheet) |
| Medicación | clipboard-check | Checklist de tomas del día |
| Perfil | user | Datos médicos, tratamientos, cuenta |

**Alertas:** no son un tab. Viven como campanita (`🔔`) en la esquina superior derecha del header de Inicio con badge rojo numérico. Al tocar abre una pantalla de alertas/notificaciones.

---

## Pantallas

### 1. Inicio

**Header:**
- Row con greeting a la izquierda y campanita a la derecha.
- Eyebrow: fecha en monospace.
- Heading: `"Buenos días, Oscar"` en Playfair Display italic 30px.
- Accent line: 24px × 2px teal bajo el nombre.
- Campanita: ícono bell stroke `#272730`, badge rojo con contador numérico en esquina superior derecha del ícono.

**Secciones (en orden):**
1. **Señal Aliis del día** — card con fondo `#14606E`, texto blanco, eyebrow monospace, pills blancos. Única superficie con color de fondo fuerte.
2. **Adherencia hoy** — row con label + porcentaje teal, progress bar `#1F8A9B`, sublabel con medicamento pendiente.
3. **Alertas/insights de Aliis** — lista con `border-left: 2px` teal o rojo según tipo, sin background.
4. **Vitales recientes** — grid 2×2 inline con separadores de línea, valores en bold, unidades en muted, status en verde/amarillo.
5. **Próxima cita** — list item con pill "Preparar preguntas →".
6. **Pack activo** — list item con título, progreso textual, progress bar, link "Continuar ›".

---

### 2. Expediente

**Header:** eyebrow "Mi diario" + heading "Registros" serif + botón "+ Nuevo" pill oscuro a la derecha.

**Secciones:**
1. **Tendencias 30 días** — row con dos columnas (Glucosa / Tensión), valor grande, mini bar chart con barras de 7 días (históricas en `#E8E8E8`, recientes en `#1F8A9B` con opacidad creciente).
2. **Síntomas activos** — list items con nombre, frecuencia, pill de estado (Ver médico / Monitoreando).
3. **Historial** — list items con fecha, resumen de valores, estado (Completo/Parcial).

**Wizard "+ Nuevo":** flujo de 3 pasos (estado general → síntomas → vitales). Sin paso de medicación — eso vive en el tab Medicación.

---

### 3. Chat Aliis (✦)

Se abre como bottom sheet draggable al tocar el FAB.

**Header del sheet:**
- Handle bar gris centrado.
- Heading "Aliis" en Playfair Display italic 22px.
- Subtítulo "Tu acompañante de salud" en muted 8px.

**Context strip:** row horizontal con Glucosa / Tensión / Adherencia como datos inline, separados por líneas verticales `#F0F0F0`. No card, solo datos en columnas.

**Mensajes:**
- Aliis: bubble con fondo `#F7F7F7`, `border-radius: 14px 14px 14px 4px`.
- Usuario: bubble con fondo `#14606E` blanco, `border-radius: 14px 14px 4px 14px`.
- Quick replies: pills con `border: 1px solid #1F8A9B`, color `#1F8A9B`.

**Input flotante:** `border-radius: 32px`, borde `#E8E8E8`, sombra suave. Send button: círculo `#14606E` con flecha blanca, sombra teal.

---

### 4. Medicación

**Header:** eyebrow con fecha + heading "Medicación" serif + accent line.

**Adherencia del día:** row label + porcentaje teal + progress bar + sublabel "X de Y tomas registradas".

**Lista por turno (Mañana / Tarde / Noche):**
- Eyebrow con nombre del turno y hora.
- Cada medicamento: row con checkbox cuadrado redondeado a la izquierda, nombre + dosis + condición en el centro, estado a la derecha.
  - **Tomado:** checkbox relleno `#14606E` con ✓, hora de registro en teal.
  - **Pendiente (hora pasada):** checkbox vacío borde `#E0E0E0`, texto "Pendiente" en muted.
  - **Futuro (aún no es la hora):** checkbox con borde punteado, row completa en `opacity: 0.4`.
- Tap en checkbox toggle inmediato, registra timestamp en `adherence_logs`.

**Historial:** list items de días anteriores con conteo de tomas y porcentaje de adherencia.

---

### 5. Perfil

**Header:** eyebrow "Mi cuenta" + nombre en Playfair Display + email muted + badge PRO en `#14606E` + accent line.

**Secciones:**
1. **Perfil médico** — condiciones como pills teal, edad/sexo como rows inline, botón "Editar ›".
2. **Tratamientos activos** — list items con nombre, dosis y condición asociada.
3. **Cuenta** — rows: Plan Pro (→ Gestionar), Exportar datos (GDPR), Cerrar sesión (rojo).

---

## Componentes reutilizables

| Componente | Descripción |
|---|---|
| `AliisSignalCard` | Card teal oscuro con texto blanco, pills blancos, eyebrow |
| `MetricGrid` | Grid 2×2 de vitales inline con separadores |
| `ListItem` | Row con título, subtítulo, acción derecha, separador inferior |
| `AlertRow` | Border-left de color + título + subtítulo, sin background |
| `MedCheckRow` | Row de medicamento con checkbox tapeable |
| `AdherenceBar` | Label + porcentaje + ProgressBar + sublabel |
| `GlassBottomNav` | Nav flotante iOS 26 con FAB central |
| `BellBadge` | Ícono campanita con badge numérico rojo |
| `SerifHeading` | Playfair Display italic con accent line teal |

---

## Animaciones

- **Checkbox medicación:** al marcar, fill animado del borde vacío → relleno teal (300ms ease-out).
- **Bottom sheet chat:** slide-up con spring physics, draggable 85%→95% altura.
- **Pantallas:** fade-through entre tabs (150ms).
- **Progress bars:** animación de fill al cargar (600ms ease-out).

Usar `flutter_animate` para todos los casos.

---

## Cambios respecto a la app actual (Fase 2A)

| Elemento | Antes | Después |
|---|---|---|
| Bottom nav | Inicio · Packs · ✦ · Alertas · Perfil | Inicio · Expediente · ✦ · Medicación · Perfil |
| Alertas | Tab propio | Campanita en header de Inicio |
| Packs | Tab "Packs" | Renombrado "Expediente", contenido expandido |
| Medicación | Paso dentro del wizard de Diario | Tab propio e independiente |
| Estilo visual | Material 3 con cards grises | Editorial Minimal, blanco puro, serif dominante |
| Fuente heading | Sin serif | Playfair Display italic |
| Cards | Background `#F4F4F6` con borde | Solo separadores de línea `#F0F0F0` |

---

## Fuera de alcance (este rediseño)

- HealthKit / Health Connect (Fase 2B).
- Dark mode (diferido).
- Widgets de pantalla de inicio (Fase 3).
- Packs educativos dentro de Expediente (siguiente iteración).
