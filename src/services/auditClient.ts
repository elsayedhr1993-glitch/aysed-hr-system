import { maskAuditSnapshot } from '../security/auditMask';

export interface AuditReportInput {
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  userName?: string;
  details?: string;
}

type AuditSender = (input: AuditReportInput) => Promise<void>;
let testSender: AuditSender | null = null;

export function __setAuditReportSenderForTests(sender: AuditSender | null): void {
  testSender = sender;
}

/** Failures are reported and do not change the business call. */
export async function reportAudit(input: AuditReportInput): Promise<void> {
  const body: AuditReportInput = {
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || '',
    before: maskAuditSnapshot(input.before),
    after: maskAuditSnapshot(input.after),
    userName: input.userName || '',
    details: input.details || '',
  };
  if (testSender) {
    await testSender(body);
    return;
  }
  if (typeof window === 'undefined') return;
  try {
    const { buildAuthedJsonHeaders } = await import('../lib/clientAuth');
    const headers = await buildAuthedJsonHeaders();
    const response = await fetch('/api/audit/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.stored === false) {
      console.error('[audit] report failed', payload?.warning || response.status);
      const { toast } = await import('react-hot-toast');
      toast.error('تعذر حفظ سجل الرقابة. العملية الأصلية اكتملت.');
    }
  } catch (error) {
    console.error('[audit] report failed', error);
  }
}
