import { maskAuditSnapshot } from '../security/auditMask';

export interface AuditReportInput {
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  userName?: string;
}

/** Fire-and-forget. Failures stay local and do not change the business call. */
export function reportAudit(input: AuditReportInput): void {
  if (typeof window === 'undefined') return;
  const body = {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || '',
    before: maskAuditSnapshot(input.before),
    after: maskAuditSnapshot(input.after),
    userName: input.userName || '',
  };
  void (async () => {
    try {
      const { buildAuthedJsonHeaders } = await import('../lib/clientAuth');
      const headers = await buildAuthedJsonHeaders();
      await fetch('/api/audit/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    } catch {
      /* audit reporting must not alter the saved business result */
    }
  })();
}
