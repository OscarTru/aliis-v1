import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

// pino transport (pino-pretty) uses worker_threads which are not available in
// Next.js edge runtime or RSC. Use plain pino in all server contexts — pretty
// printing only works in a standalone Node process.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  base: { app: 'aliis-frontend' },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export function requestLogger(route: string) {
  return logger.child({
    route,
    requestId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : undefined,
  })
}
