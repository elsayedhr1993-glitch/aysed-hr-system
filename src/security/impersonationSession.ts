export const IMPERSONATION_MS = 30 * 60 * 1000;

export type ImpersonationSession = {
  companyId: string;
  reason: string;
  startedAt: number;
  expiresAt: number;
  readOnly: true;
  breakGlass: boolean;
  breakGlassReason: string;
};

export function startImpersonationSession(input: {
  companyId: string;
  reason: string;
  now: number;
}): { ok: true; session: ImpersonationSession } | { ok: false; error: string } {
  const reason = input.reason.trim();
  const companyId = input.companyId.trim();
  if (!reason) return { ok: false, error: 'السبب إلزامي' };
  if (!companyId) return { ok: false, error: 'المنشأة مطلوبة' };
  return {
    ok: true,
    session: {
      companyId,
      reason,
      startedAt: input.now,
      expiresAt: input.now + IMPERSONATION_MS,
      readOnly: true,
      breakGlass: false,
      breakGlassReason: '',
    },
  };
}

export function impersonationActive(session: ImpersonationSession | null | undefined, now: number): boolean {
  return Boolean(session) && now < (session?.expiresAt || 0);
}

export function openBreakGlass(
  session: ImpersonationSession,
  reason: string,
  now: number
): { ok: true; session: ImpersonationSession } | { ok: false; error: string } {
  if (!impersonationActive(session, now)) return { ok: false, error: 'انتهت الجلسة' };
  const text = reason.trim();
  if (!text) return { ok: false, error: 'السبب إلزامي' };
  return { ok: true, session: { ...session, breakGlass: true, breakGlassReason: text } };
}

export function sensitiveHidden(session: ImpersonationSession | null | undefined, now: number): boolean {
  return impersonationActive(session, now) && !session?.breakGlass;
}
