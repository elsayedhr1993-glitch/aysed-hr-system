import type { LeaveApprovalInput, LeaveApprovalResult } from './leaveApprovalService';
import { auth } from '../lib/firebase';

async function authHeader(): Promise<string | undefined> {
  const user = auth.currentUser;
  if (!user) return undefined;
  const token = await user.getIdToken();
  return token ? `Bearer ${token}` : undefined;
}

/**
 * Server-side atomic approval (Firebase transaction + work_entries).
 * Falls back to caller when API unreachable (local dev without server).
 */
export async function approveLeaveViaServerApi(
  request: LeaveApprovalInput,
  approver: string
): Promise<LeaveApprovalResult> {
  const companyId = request.companyId;
  if (!request.id || !companyId) {
    throw new Error('معرّف الطلب والشركة مطلوبان للاعتماد عبر السيرفر');
  }

  const authorization = await authHeader();
  const response = await fetch('/api/leave/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify({
      leaveRequestId: request.id,
      companyId,
      approverLabel: approver,
    }),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    error?: string;
    data?: LeaveApprovalResult & { annualRemaining?: number; workEntryId?: string };
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error || 'فشل اعتماد الإجازة على السيرفر');
  }

  const data = payload.data;
  return {
    paidDays: data.paidDays,
    unpaidDays: data.unpaidDays,
    remainingDays: data.remainingDays ?? data.annualRemaining ?? 0,
    allocationBreakdown: data.allocationBreakdown || [],
  };
}
