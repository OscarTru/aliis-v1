# Diseño — "Entiende tu diagnóstico"
### Cerebros Esponjosos · MVP v1.0
**Fecha:** 2026-04-24
**Estado:** Aprobado

---

## 1. Propósito

Web app pública donde un paciente hispanohablante escribe su diagnóstico neurológico y recibe un pack educativo personalizado generado por IA, en el lenguaje conversacional de Cerebros Esponjosos. No reemplaza al médico — amplifica la comprensión del paciente.

---

## 2. Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v3 |
| IA | Anthropic SDK · `claude-haiku-4-5-20251001` |
| Fuente | Inter (Google Fonts) |
| Deploy | Vercel |

---

## 3. Estructura de archivos

```
Aliis/                          ← directorio raíz del proyecto
├── app/
│   ├── layout.tsx              # Metadata SEO + fuente Inter
│   ├── page.tsx                # UI completa: formulario + resultados
│   ├── globals.css             # Animaciones fadeInUp + shimmer
│   └── api/
│       └── diagnostico/
│           └── route.ts        # POST → Claude Haiku → JSON
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── .env.local.example
```

---

## 4. Arquitectura

**Patrón:** Single-route stateless. Sin base de datos, sin autenticación.

**Flujo de datos:**
1. `page.tsx` captura formulario → `POST /api/diagnostico`
2. `route.ts` valida → llama Claude Haiku → extrae JSON con regex → retorna
3. `page.tsx` recibe JSON → renderiza 8 cards con animación escalonada

---

## 5. API Route `/api/diagnostico`

**Método:** POST

**Request body:**
```typescript
{
  diagnostico: string;   // requerido, max 500 chars
  contexto?: string;     // opcional, max 300 chars
}
```

**Response 200:**
```typescript
interface DiagnosticoResponse {
  diagnostico_recibido: string;
  que_es: string;
  como_funciona: string;
  que_esperar: string;
  preguntas_para_medico: string[];   // 5 preguntas
  senales_de_alarma: string[];       // 3 señales
  mito_frecuente: string;
  nota_final: string;
}
```

**Response error:**
```typescript
{ error: string }   // 400 validación | 500 IA
```

**Detalles de implementación:**
- Modelo: `claude-haiku-4-5-20251001`
- `max_tokens: 2048`
- Prompt caching activado en el system prompt (reduce costo en llamadas repetidas)
- Extracción: regex `/\{[\s\S]*\}/` → `JSON.parse()`
- Validaciones: trim de whitespace, longitud máxima, campo requerido

**System prompt:** El definido en la especificación original (sección 8) — voz y estilo Cerebros Esponjosos, respuesta siempre en JSON válido.

---

## 6. UI — Estados y componentes

### Estados de `page.tsx`

| Estado | Qué se muestra |
|--------|---------------|
| Idle | Hero + formulario + chips |
| Loading | Spinner en botón + 4 skeleton cards + texto animado |
| Result | 8 cards con animación escalonada + botón reset |

### Chips de ejemplos (onboarding)
"Migraña" · "Vértigo" · "Epilepsia" · "Temblor esencial" · "Insomnio"

### Cards de resultado

| # | Icono | Título |
|---|-------|--------|
| 0 | — | Diagnóstico confirmado (fondo `bg-purple-900/40`) |
| 1 | 🔍 | ¿Qué es esto, exactamente? |
| 2 | ⚙️ | ¿Cómo funciona por dentro? |
| 3 | 📅 | ¿Qué puedes esperar? |
| 4 | 💬 | Preguntas para tu próxima consulta |
| 5 | 🚨 | Cuándo buscar atención urgente |
| 6 | 💡 | Algo que mucha gente malentiende |
| 7 | — | Una última cosa (nota final) |

Card de disclaimer al final: una línea de texto pequeño discreto — "Esta información es educativa y no reemplaza tu consulta médica."

### Paleta de colores

| Token | Valor |
|-------|-------|
| Fondo | `#0f0f1a` |
| Acento | `purple-600` / `violet-600` |
| Texto principal | `white` |
| Texto secundario | `gray-400` |
| Cards resultado | `white` |

---

## 7. Animaciones CSS

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
```

Delays escalonados por card: 100ms · 200ms · ... · 700ms, todas con `opacity: 0` inicial.

---

## 8. Navbar

```
bg-[#0f0f1a] border-b border-white/5 px-6 py-4
→ Izquierda: SVG cerebro + "Cerebros Esponjosos" text-purple-400
→ Derecha: badge "Beta" bg-gray-800/60
```

---

## 9. Variable de entorno

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 10. Fuera de alcance (MVP)

- Export PDF del pack
- Envío por email
- Historial de diagnósticos (auth + DB)
- URL compartible por resultado
- Analytics de diagnósticos consultados
