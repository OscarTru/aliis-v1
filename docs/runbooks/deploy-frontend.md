# Runbook: Deploy Frontend (Vercel)

## Deploy normal

Push a `master` → Vercel despliega automáticamente.

```bash
git checkout master
git merge dev
git push origin master
```

Vercel build tarda ~2-3 minutos. Verificar en https://vercel.com/dashboard.

## Verificar tras deploy

1. Abrir la app en producción.
2. Crear un pack de prueba con un diagnóstico simple.
3. Verificar que el chat responde.
4. Verificar que el agente responde.
5. Revisar Sentry — 0 errores nuevos en 5 minutos post-deploy.

## Rollback

En Vercel dashboard → Deployments → seleccionar deploy anterior → "Promote to Production".

O desde CLI:

```bash
vercel rollback
```

## Si el build falla

1. Revisar logs en Vercel dashboard.
2. Correr localmente: `cd frontend && npm run build`.
3. Fix en rama `dev`, merge a `master` cuando pase.
