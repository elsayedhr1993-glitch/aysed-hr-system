import * as Sentry from '@sentry/node';
import { resolveSentryDsn, scrubSentryEvent } from '../src/observability/sentryScrub.ts';

const dsn = resolveSentryDsn(process.env.SENTRY_DSN);

if (dsn) {
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
}
