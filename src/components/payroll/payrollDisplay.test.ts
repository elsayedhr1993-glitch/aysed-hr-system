import { describe, expect, it } from 'vitest';
import { buildPayrollReversal, columnAllZero, payslipHasReversal, type PayslipLedgerFields } from './payrollDisplay';

const source: PayslipLedgerFields = {
  id: 'SLIP-1',
  payslipNumber: 'PAY/2026/08/0001',
  basicSalary: 600,
  housingAllowance: 150,
  transportAllowance: 50,
  medicalAllowance: 0,
  overtimeHours: 2,
  overtimeAmount: 15.5,
  bonusAmount: 0,
  absenceDays: 1,
  absenceDeduction: 20,
  delayMinutes: 10,
  delayDeduction: 3,
  loanDeduction: 40,
  grossSalary: 800,
  totalDeductions: 63,
  netSalary: 752.5,
  status: 'paid',
};

describe('payroll display', () => {
  it('builds a reverse slip from stored amounts without recomputing them', () => {
    const reversal = buildPayrollReversal(source, '  اعتماد مكرر  ', 'REV-SLIP-1');
    expect(reversal.id).toBe('REV-SLIP-1');
    expect(reversal.reversalOfId).toBe('SLIP-1');
    expect(reversal.reversalReason).toBe('اعتماد مكرر');
    expect(reversal.netSalary).toBe(-752.5);
    expect(reversal.grossSalary).toBe(-800);
    expect(reversal.totalDeductions).toBe(-63);
    expect(reversal.basicSalary).toBe(-600);
    expect(reversal.overtimeAmount).toBe(-15.5);
    expect(reversal.status).toBe('confirmed');
    expect(source.netSalary).toBe(752.5);
  });

  it('hides a column only when every row is zero', () => {
    expect(columnAllZero([{ n: 0 }, { n: 0 }], (row) => row.n)).toBe(true);
    expect(columnAllZero([{ n: 0 }, { n: 1 }], (row) => row.n)).toBe(false);
    expect(columnAllZero([], (row: { n: number }) => row.n)).toBe(false);
  });

  it('detects an existing reversal for a slip', () => {
    expect(payslipHasReversal([{ id: 'a' }, { id: 'b', reversalOfId: 'a' }], 'a')).toBe(true);
    expect(payslipHasReversal([{ id: 'a' }], 'a')).toBe(false);
  });
});
