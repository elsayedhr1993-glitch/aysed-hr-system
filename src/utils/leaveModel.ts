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
  EMERGENCY: 'ANNUAL',
};

export function isAnnualLeaveType(value: unknown): boolean {
  return normalizeLeaveType(value) === 'ANNUAL';
}

const LEAVE_STATUS_MAP: Record<string, CanonicalLeaveStatus> = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  PENDING_MANAGER: 'PENDING_MANAGER',
  PENDING_HR: 'PENDING_HR',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  VALIDATED: 'APPROVED',
  VALIDATE: 'APPROVED',
  APPROVAL: 'APPROVED',
  'معتمدة_نهائياً': 'APPROVED',
  'معتمدة': 'APPROVED',
  'موافقة_نهائية': 'APPROVED',
  'موافقة_المدير': 'PENDING_HR',
  'قيد_الاعتماد': 'PENDING_MANAGER',
  'قيد_المراجعة': 'PENDING_MANAGER',
  'بانتظار_موافقة_المدير': 'PENDING_MANAGER',
  'بانتظار_اعتماد_الموارد_البشرية': 'PENDING_HR',
};

export function normalizeLeaveType(value: unknown): CanonicalLeaveType {
  const raw = String(value ?? 'ANNUAL').trim();
  const normalized = raw.toUpperCase().replace(/[-\s]/g, '_');
  return LEAVE_TYPE_MAP[normalized] ?? 'ANNUAL';
}

export function normalizeLeaveStatus(value: unknown): CanonicalLeaveStatus {
  const raw = String(value ?? 'DRAFT').trim();
  const normalized = raw
    .normalize('NFKC')
    .replace(/[\u0640\u200C\u200D\s\-_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  if (LEAVE_STATUS_MAP[normalized]) return LEAVE_STATUS_MAP[normalized];

  const arabicApprovedAliases = ['معتمدة', 'معتمدة_نهائياً', 'موافقة_نهائية', 'مؤكد', 'مؤكدة'];
  if (arabicApprovedAliases.some(alias => normalized.includes(alias.replace(/_/g, '')) || normalized.includes(alias))) {
    return 'APPROVED';
  }

  if (normalized.includes('PENDING') || normalized.includes('قيد') || normalized.includes('بانتظار')) {
    if (normalized.includes('HR') || normalized.includes('موارد') || normalized.includes('البشرية')) return 'PENDING_HR';
    return 'PENDING_MANAGER';
  }

  if (normalized.includes('APPROVE') || normalized.includes('VALIDAT') || normalized.includes('اعتمد')) return 'APPROVED';
  if (normalized.includes('REJECT') || normalized.includes('رفض')) return 'REJECTED';
  if (normalized.includes('RETURN') || normalized.includes('مباشرة') || normalized.includes('عودة')) return 'RETURNED';

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
