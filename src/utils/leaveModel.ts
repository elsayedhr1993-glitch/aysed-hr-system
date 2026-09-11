export type CanonicalLeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'HAJJ'
  | 'UNPAID'
  | 'COMPASSIONATE'
  | 'BEREAVEMENT'
  | 'HOURLY_PERMISSION'
  | 'COMPENSATORY';

export type CanonicalLeaveStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_MANAGER'
  | 'PENDING_HR'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED';

const LEAVE_TYPE_MAP: Record<string, CanonicalLeaveType> = {
  ANNUAL: 'ANNUAL',
  ANNUA: 'ANNUAL',
  SICK: 'SICK',
  MATERNITY: 'MATERNITY',
  HAJJ: 'HAJJ',
  UNPAID: 'UNPAID',
  COMPASSIONATE: 'COMPASSIONATE',
  BEREAVEMENT: 'BEREAVEMENT',
  HOURLY_PERMISSION: 'HOURLY_PERMISSION',
  HOURLY: 'HOURLY_PERMISSION',
  COMPENSATORY: 'COMPENSATORY',
  COMPENSATION: 'COMPENSATORY',
  ANNUAL_LEAVE: 'ANNUAL',
};

const LEAVE_STATUS_MAP: Record<string, CanonicalLeaveStatus> = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PENDING_MANAGER: 'PENDING_MANAGER',
  PENDING_HR: 'PENDING_HR',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  VALIDATED: 'APPROVED',
};

export function normalizeLeaveType(value: unknown): CanonicalLeaveType {
  const raw = String(value ?? 'ANNUAL').trim();
  const normalized = raw.toUpperCase().replace(/[-\s]/g, '_');
  return LEAVE_TYPE_MAP[normalized] ?? 'ANNUAL';
}

export function normalizeLeaveStatus(value: unknown): CanonicalLeaveStatus {
  const raw = String(value ?? 'DRAFT').trim();
  const normalized = raw.toUpperCase().replace(/[-\s]/g, '_');
  return LEAVE_STATUS_MAP[normalized] ?? 'DRAFT';
}

export function hasLeaveDateOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  if (!startA || !endA || !startB || !endB) return false;

  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  if ([aStart, aEnd, bStart, bEnd].some(Number.isNaN)) return false;

  return aStart <= bEnd && aEnd >= bStart;
}

export function isLeaveRequestInConflict(
  candidate: { employeeId?: string; startDate?: string; endDate?: string; status?: unknown },
  existingRequests: Array<{ employeeId?: string; startDate?: string; endDate?: string; status?: unknown }>
): boolean {
  if (!candidate?.employeeId || !candidate.startDate || !candidate.endDate) {
    return false;
  }

  return existingRequests.some(existing => {
    if (!existing?.employeeId || existing.employeeId !== candidate.employeeId) return false;
    const existingStatus = normalizeLeaveStatus(existing.status);
    if (existingStatus === 'REJECTED' || existingStatus === 'DRAFT') return false;

    if (!existing.startDate || !existing.endDate) return false;
    return hasLeaveDateOverlap(candidate.startDate, candidate.endDate, existing.startDate, existing.endDate);
  });
}

export function canTransitionLeaveStatus(currentStatus: unknown, nextStatus: unknown): boolean {
  const current = normalizeLeaveStatus(currentStatus);
  const next = normalizeLeaveStatus(nextStatus);

  const allowedTransitions: Record<CanonicalLeaveStatus, CanonicalLeaveStatus[]> = {
    DRAFT: ['SUBMITTED', 'REJECTED'],
    SUBMITTED: ['PENDING_MANAGER', 'REJECTED'],
    PENDING_MANAGER: ['PENDING_HR', 'REJECTED'],
    PENDING_HR: ['APPROVED', 'REJECTED'],
    APPROVED: ['RETURNED'],
    REJECTED: [],
    RETURNED: [],
  };

  return allowedTransitions[current]?.includes(next) ?? false;
}
