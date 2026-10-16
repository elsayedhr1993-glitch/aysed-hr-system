import { describe, expect, it } from 'vitest';
import {
  isPayrollReport,
  payrollReportsAllowed,
  previewPayAmount,
  reportMonthOptions,
  visibleReportIds,
} from './reportsAccess';

const ALL = [
  'wps_reconciliation',
  'gov_compliance',
  'eos_indemnity_accrual',
  'leaves_financial_liability',
  'attendance_overtime_analytics',
];

describe('report access', () => {
  it('keeps salary and end-of-service reports for server payroll roles only', () => {
    expect(payrollReportsAllowed('HR_MANAGER')).toBe(true);
    expect(payrollReportsAllowed('FINANCE')).toBe(true);
    expect(payrollReportsAllowed('HR_USER')).toBe(false);
    expect(payrollReportsAllowed('EMPLOYEE')).toBe(false);
    expect(visibleReportIds(ALL, false)).toEqual([
      'gov_compliance',
      'leaves_financial_liability',
      'attendance_overtime_analytics',
    ]);
    expect(visibleReportIds(ALL, true)).toEqual(ALL);
    expect(isPayrollReport('eos_indemnity_accrual')).toBe(true);
    expect(isPayrollReport('gov_compliance')).toBe(false);
  });

  it('builds a stable month list without changing the stored period key', () => {
    const options = reportMonthOptions(new Date('2026-10-16T00:00:00Z'), 3);
    expect(options.map((item) => item.value)).toEqual(['2026-10', '2026-09', '2026-08']);
  });

  it('hides salary text in a letter preview unless the server allowed payroll', () => {
    expect(previewPayAmount(false, '450.000 د.ك')).toBe('—');
    expect(previewPayAmount(true, '450.000 د.ك')).toBe('450.000 د.ك');
  });
});
