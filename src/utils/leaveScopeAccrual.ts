import type { LeaveRequest } from '../types';
import { normalizeLeaveStatus } from './leaveModel';

export type LeaveScope = 'INTERNAL' | 'EXTERNAL';

export const LEAVE_SCOPE_LABELS: Record<LeaveScope, string> = {
  INTERNAL: 'إجازة داخلية (داخل الكويت)',
  EXTERNAL: 'إجازة خارجية (خارج البلاد)',
};

export function formatLeaveScopeLabel(raw?: string | null): string {
  return LEAVE_SCOPE_LABELS[normalizeLeaveScope(raw)];
}

export function normalizeLeaveScope(raw?: string | null): LeaveScope {
  const v = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (
    v === 'EXTERNAL' ||
    v === 'ABROAD' ||
    v === 'OUTSIDE_KUWAIT' ||
    v === 'OUTSIDE' ||
    v === 'خارجية' ||
    v === 'خارج_البلاد'
  ) {
    return 'EXTERNAL';
  }
  return 'INTERNAL';
}

export function leaveScopeFromRecord(leave: Partial<LeaveRequest> & Record<string, unknown>): LeaveScope {
  return normalizeLeaveScope(
    (leave.leaveScope as string) || (leave.leave_scope as string) || (leave.travelScope as string)
  );
}

/** @deprecated Accrual uses proportional days in leaveAccrual2026 — kept for legacy callers. */
export function isExternalAccrualFreezeLeave(leave: Partial<LeaveRequest> & Record<string, unknown>): boolean {
  if (leave.isHistorical) return false;
  const status = normalizeLeaveStatus(String(leave.status || ''));
  if (status !== 'APPROVED' && status !== 'RETURNED') return false;
  return leaveScopeFromRecord(leave) === 'EXTERNAL';
}

function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function eachMonthKeyBetween(startIso: string, endIso: string): string[] {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

  const keys: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();

  while (y < endY || (y === endY && m <= endM)) {
    keys.push(monthKey(y, m));
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return keys;
}

export function getExternalAccrualFrozenMonthKeys(
  leaves: Array<Partial<LeaveRequest> & Record<string, unknown>> | undefined,
  employeeId?: string,
  employeeCode?: string
): Set<string> {
  const frozen = new Set<string>();
  if (!leaves?.length) return frozen;

  const empId = String(employeeId || '').trim();
  const empCode = String(employeeCode || '').trim();

  for (const leave of leaves) {
    if (!isExternalAccrualFreezeLeave(leave)) continue;

    const lid = String(leave.employeeId || '').trim();
    if (empId && lid && lid !== empId && lid !== empCode) continue;

    const startDate = String(leave.startDate || '');
    const endDate = String(leave.endDate || '');
    if (!startDate || !endDate) continue;

    for (const key of eachMonthKeyBetween(startDate, endDate)) {
      frozen.add(key);
    }
  }

  return frozen;
}
