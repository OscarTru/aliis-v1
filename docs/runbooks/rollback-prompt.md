# Runbook: Rollback de prompt

Usar cuando un prompt actualizado produce respuestas incorrectas, inseguras o fuera de tono.

## Síntomas

- Usuarios reportan respuestas raras del agente o del chat.
- `llm_usage` muestra aumento de tokens de output (respuestas más largas = posible drift).
- Sentry captura errores de parsing en respuestas JSON del generador.

## Pasos

1. **Identificar qué prompt cambió** — revisar `docs/prompts/CHANGELOG.md`.

2. **Revertir la importación** en el route handler correspondiente:
   ```typescript
   // Cambiar esto:
   const system = readPrompt('aliis-agent', 'v2')
   // Por esto:
   const system = readPrompt('aliis-agent', 'v1')
   ```

3. **Deploy** — push a master, Vercel despliega en ~2 min.

4. **Verificar** — probar el endpoint afectado manualmente.

5. **Documentar en CHANGELOG** — añadir nota de rollback con fecha y razón.

6. **No borrar v2** — mantener el archivo para análisis. El problema puede ser el prompt o el contexto de usuario.
