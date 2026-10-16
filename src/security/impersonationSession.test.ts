import { describe, expect, it } from 'vitest';
import {
  IMPERSONATION_MS,
  impersonationActive,
  openBreakGlass,
  sensitiveHidden,
  startImpersonationSession,
} from './impersonationSession';

describe('impersonation session', () => {
  it('requires a reason and lasts 30 minutes as read-only', () => {
    expect(startImpersonationSession({ companyId: 'c1', reason: '  ', now: 0 }).ok).toBe(false);
    const started = startImpersonationSession({ companyId: 'c1', reason: 'دعم', now: 1_000 });
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.session.readOnly).toBe(true);
    expect(started.session.expiresAt - started.session.startedAt).toBe(IMPERSONATION_MS);
    expect(impersonationActive(started.session, started.session.expiresAt - 1)).toBe(true);
    expect(impersonationActive(started.session, started.session.expiresAt)).toBe(false);
    expect(sensitiveHidden(started.session, 2_000)).toBe(true);
  });

  it('reveals salaries and identities only after a written break-glass reason', () => {
    const started = startImpersonationSession({ companyId: 'c1', reason: 'دعم', now: 0 });
    if (!started.ok) throw new Error('start');
    expect(openBreakGlass(started.session, ' ', 10).ok).toBe(false);
    const opened = openBreakGlass(started.session, 'مراجعة بلاغ', 10);
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(sensitiveHidden(opened.session, 10)).toBe(false);
    expect(opened.session.readOnly).toBe(true);
  });
});
