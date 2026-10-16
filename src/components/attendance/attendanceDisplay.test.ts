import { describe, expect, it } from 'vitest';
import {
  attendanceEditBlocked,
  attendanceExceptionRank,
  manualAttendanceReasonMissing,
} from './attendanceDisplay';

describe('attendance display rules', () => {
  it('lists exceptions before a normal day', () => {
    expect(attendanceExceptionRank('absent')).toBeLessThan(attendanceExceptionRank('present'));
    expect(attendanceExceptionRank('late')).toBeLessThan(attendanceExceptionRank('overtime'));
    expect(attendanceExceptionRank('single_punch')).toBe(0);
  });

  it('blocks retroactive edits after payroll posting except for the HR manager', () => {
    expect(attendanceEditBlocked('HR_USER', true)).toBe(true);
    expect(attendanceEditBlocked('COMPANY_ADMIN', true)).toBe(true);
    expect(attendanceEditBlocked('HR_MANAGER', true)).toBe(false);
    expect(attendanceEditBlocked('HR_USER', false)).toBe(false);
  });

  it('requires a written reason for a manual edit', () => {
    expect(manualAttendanceReasonMissing('')).toBe(true);
    expect(manualAttendanceReasonMissing('   ')).toBe(true);
    expect(manualAttendanceReasonMissing('نسيان التبصيم')).toBe(false);
  });
});
