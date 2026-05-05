# Runbook: Deploy Backend (Railway)

## Deploy normal

Push a `master` → Railway despliega automáticamente si está configurado con auto-deploy.

```bash
git push origin master
```

Railway build tarda ~1-2 minutos.

## Verificar tras deploy

```bash
curl https://aliis-v1-production.up.railway.app/health
# Expected: {"status":"ok"}
```

## Rollback

En Railway dashboard → Deployments → seleccionar deploy anterior → "Rollback".

## Variables de entorno

Nunca commitear `.env`. Variables en Railway dashboard → Variables.
Mínimo requerido: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
