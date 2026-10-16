/** Display rules for the attendance screen. They do not recompute hours or pay. */

export function attendanceExceptionRank(status: string): number {
  if (status === 'absent' || status === 'late' || status === 'single_punch') return 0;
  return 1;
}

export function attendanceEditBlocked(role: string | undefined, monthPosted: boolean): boolean {
  if (!monthPosted) return false;
  return String(role || '').toUpperCase() !== 'HR_MANAGER';
}

export function manualAttendanceReasonMissing(reason: string | undefined): boolean {
  return !String(reason || '').trim();
}
