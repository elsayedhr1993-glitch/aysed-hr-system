import {
  impersonationActive,
  openBreakGlass,
  startImpersonationSession,
  type ImpersonationSession,
} from '../src/security/impersonationSession';

const sessions = new Map<string, ImpersonationSession>();

export function beginImpersonation(userId: string, companyId: string, reason: string, now = Date.now()) {
  const started = startImpersonationSession({ companyId, reason, now });
  if (!started.ok) return started;
  sessions.set(userId, started.session);
  return started;
}

export function currentImpersonation(userId: string, now = Date.now()): ImpersonationSession | null {
  const session = sessions.get(userId);
  if (!session || !impersonationActive(session, now)) {
    if (session) sessions.delete(userId);
    return null;
  }
  return session;
}

export function breakGlassImpersonation(userId: string, reason: string, now = Date.now()) {
  const session = currentImpersonation(userId, now);
  if (!session) return { ok: false as const, error: 'لا توجد جلسة' };
  const opened = openBreakGlass(session, reason, now);
  if (!opened.ok) return opened;
  sessions.set(userId, opened.session);
  return opened;
}

export function endImpersonation(userId: string): void {
  sessions.delete(userId);
}
