// Simple Sentry wrapper. If SENTRY_DSN is not set or @sentry/node is missing,
// fall back to console logging so tests and local dev don't require Sentry.
let Sentry: any | null = null
const dsn = process.env.SENTRY_DSN

if (dsn) {
  try {
    // require dynamically so tests without @sentry/node don't fail
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/node')
    Sentry.init({ dsn, tracesSampleRate: 0.1 })
  } catch (e) {
    // If @sentry/node isn't installed, keep Sentry as null and fall back to console
    // but report the missing module once
    // eslint-disable-next-line no-console
    console.warn('Sentry not installed or failed to initialize, continuing without Sentry')
    Sentry = null
  }
}

export function captureException(e: any) {
  if (Sentry) return Sentry.captureException(e)
  // eslint-disable-next-line no-console
  console.error('Sentry exception:', e)
}

export function captureMessage(msg: string) {
  if (Sentry) return Sentry.captureMessage(msg)
  // eslint-disable-next-line no-console
  console.warn('Sentry message:', msg)
}
