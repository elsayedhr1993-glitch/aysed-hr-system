import type { LeaveBalanceTransaction } from '../services/leaveBalanceLedgerService';
import { getApprovedLedgerTransactions } from '../services/leaveBalanceLedgerService';

const MONTHLY_ACCRUAL_DAYS = 2.5;

export const roundLedgerDays = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

function parseYmd(dateStr: string): Date | null {
  const s = String(dateStr || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * +2.5 لكل شهر مكتمل بعد تاريخ التسييل (يُضاف الاستحقاق يوم 28 من كل شهر لاحق).
 * مثال: تسييل 2026-08-31 → سبتمبر وأكتوبر 2026 = 5 أيام عند 2026-10-28 فما فوق.
 */
export function computeMonthlyAccrualAfterEncashment(
  encashmentEffectiveDate: string,
  asOfDate: Date = new Date()
): number {
  const anchor = parseYmd(encashmentEffectiveDate);
  if (!anchor) return 0;

  let year = anchor.getFullYear();
  let month = anchor.getMonth() + 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  const asOf = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());
  let total = 0;
  let guard = 0;

  while (guard < 240) {
    guard += 1;
    const creditOn28 = new Date(year, month, 28);
    if (creditOn28 > asOf) break;
    total += MONTHLY_ACCRUAL_DAYS;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  return roundLedgerDays(total);
}

function transactionDayImpact(transaction: LeaveBalanceTransaction): number {
  const days = Math.abs(Number(transaction.days) || 0);
  if (transaction.type === 'ENCASHMENT' || transaction.type === 'LEAVE_CONSUMPTION') {
    return -days;
  }
  if (transaction.type === 'MANUAL_ADJUSTMENT') {
    return Number(transaction.days) || 0;
  }
  return days;
}

export function sumLedgerTransactionsAsOf(
  transactions: LeaveBalanceTransaction[],
  asOfDate: string
): { sum: number; lastEncashmentEffectiveDate: string | null } {
  const asOf = asOfDate.slice(0, 10);
  let sum = 0;
  let lastEncashmentEffectiveDate: string | null = null;

  const sorted = [...transactions].sort((a, b) =>
    (a.effectiveDate || '').localeCompare(b.effectiveDate || '')
  );

  for (const tx of sorted) {
    const eff = (tx.effectiveDate || '').slice(0, 10);
    if (!eff || eff > asOf) continue;
    sum += transactionDayImpact(tx);
    if (tx.type === 'ENCASHMENT') {
      if (!lastEncashmentEffectiveDate || eff > lastEncashmentEffectiveDate) {
        lastEncashmentEffectiveDate = eff;
      }
    }
  }

  return { sum: roundLedgerDays(sum), lastEncashmentEffectiveDate };
}

/**
 * الرصيد الحالي = مجموع حركات السجل حتى التاريخ + الاستحقاق الشهري (+2.5) بعد آخر تسييل.
 */
export function computeLedgerRecalculatedBalance(
  employeeId: string,
  companyId?: string,
  asOfDate: string = new Date().toISOString().slice(0, 10)
): number {
  const transactions = getApprovedLedgerTransactions(employeeId, companyId);
  const { sum, lastEncashmentEffectiveDate } = sumLedgerTransactionsAsOf(transactions, asOfDate);

  let total = sum;
  if (lastEncashmentEffectiveDate) {
    total += computeMonthlyAccrualAfterEncashment(
      lastEncashmentEffectiveDate,
      parseYmd(asOfDate) || new Date()
    );
  }

  return roundLedgerDays(Math.max(0, total));
}

export function findLatestEncashmentEffectiveDate(
  employeeId: string,
  companyId?: string
): string | null {
  const transactions = getApprovedLedgerTransactions(employeeId, companyId).filter(
    (t) => t.type === 'ENCASHMENT'
  );
  if (!transactions.length) return null;
  return transactions
    .map((t) => (t.effectiveDate || '').slice(0, 10))
    .filter(Boolean)
    .sort()
    .pop() || null;
}
