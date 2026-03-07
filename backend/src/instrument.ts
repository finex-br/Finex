import * as Sentry from '@sentry/nestjs';

// Sentry must initialize before the NestJS application boots.
// This file is imported at the very top of main.ts.
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  enabled: !!process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  serverName: process.env.SENTRY_SERVER_NAME || 'finex-backend',
});
