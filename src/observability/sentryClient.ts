import { resolveSentryDsn, scrubSentryEvent } from './sentryScrub';

type SentryReact = typeof import('@sentry/react');

let ready: Promise<SentryReact> | null = null;

function clientDsn(): string {
  const injected = typeof __SENTRY_DSN__ === 'string' ? __SENTRY_DSN__ : '';
  return resolveSentryDsn(injected);
}

/** Starts browser reporting only when SENTRY_DSN was present at build time. */
export function initClientSentry(): void {
  const dsn = clientDsn();
  if (!dsn || ready) return;
  ready = import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
        stackFrameVariables: false,
      },
      beforeSend(event) {
        return scrubSentryEvent(event);
      },
    });
    return Sentry;
  });
}

export function captureClientException(error: unknown): void {
  if (!ready) return;
  void ready.then((Sentry) => {
    Sentry.captureException(error);
  });
}
