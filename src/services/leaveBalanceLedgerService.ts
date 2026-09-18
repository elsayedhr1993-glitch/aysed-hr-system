import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';

export type LeaveBalanceTransactionType =
  | 'CARRIED_OVER'
  | 'ANNUAL_ACCRUAL'
  | 'COMP_OFF'
  | 'LEAVE_CONSUMPTION'
  | 'MANUAL_ADJUSTMENT';

export type LeaveBalanceTransactionSource =
  | 'HOLIDAY_WORK'
  | 'LEAVE_REQUEST'
  | 'MANUAL_ADJUSTMENT'
  | 'MIGRATION';

export interface LeaveBalanceTransaction {
  id: string;
  companyId: string;
  employeeId: string;
  type: LeaveBalanceTransactionType;
  source: LeaveBalanceTransactionSource;
  sourceId: string;
  days: number;
  status: 'APPROVED' | 'CANCELLED';
  effectiveDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const TRANSACTION_COLLECTION = 'leave_balance_transactions';

const roundDays = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

const emitLedgerUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leave_balance_ledger_updated'));
    window.dispatchEvent(new Event('storage'));
  }
};

export function getLedgerTransactions(): LeaveBalanceTransaction[] {
  return getPersistentData<LeaveBalanceTransaction[]>(MANARA_STORAGE_KEYS.LEAVE_BALANCE_TRANSACTIONS, []);
}

export function getApprovedLedgerTransactions(employeeId: string, companyId?: string): LeaveBalanceTransaction[] {
  return getLedgerTransactions().filter(transaction =>
    transaction.employeeId === employeeId &&
    (!companyId || transaction.companyId === companyId) &&
    transaction.status === 'APPROVED'
  );
}

export function getApprovedCompensatoryDays(employeeId: string, companyId?: string): number {
  return roundDays(
    getApprovedLedgerTransactions(employeeId, companyId)
      .filter(transaction => transaction.type === 'COMP_OFF')
      .reduce((sum, transaction) => sum + transaction.days, 0)
  );
}

/** أيام ممنوحة من تكليفات العطلات (مادة 68): Comp-Off أو إضافة للرصيد السنوي */
export function getApprovedHolidayWorkBalanceDays(employeeId: string, companyId?: string): number {
  return roundDays(
    getApprovedLedgerTransactions(employeeId, companyId)
      .filter(
        transaction =>
          transaction.source === 'HOLIDAY_WORK' &&
          (transaction.type === 'COMP_OFF' || transaction.type === 'ANNUAL_ACCRUAL')
      )
      .reduce((sum, transaction) => sum + transaction.days, 0)
  );
}

export async function upsertLeaveBalanceTransaction(
  transaction: Omit<LeaveBalanceTransaction, 'createdAt' | 'updatedAt'>
): Promise<LeaveBalanceTransaction> {
  const now = new Date().toISOString();
  const existing = getLedgerTransactions().find(item => item.id === transaction.id);
  const next: LeaveBalanceTransaction = {
    ...transaction,
    days: roundDays(transaction.days),
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  const current = getLedgerTransactions().filter(item => item.id !== next.id);
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_BALANCE_TRANSACTIONS, [next, ...current]);

  try {
    await setDoc(doc(db, TRANSACTION_COLLECTION, next.id), next, { merge: true });
  } catch (error) {
    console.warn('[LeaveBalanceLedger] Firestore write warning:', error);
  }

  emitLedgerUpdated();
  return next;
}

export async function cancelLeaveBalanceTransaction(transactionId: string): Promise<void> {
  const current = getLedgerTransactions();
  const target = current.find(item => item.id === transactionId);
  if (!target) return;

  const cancelled: LeaveBalanceTransaction = {
    ...target,
    status: 'CANCELLED',
    updatedAt: new Date().toISOString()
  };
  setPersistentData(
    MANARA_STORAGE_KEYS.LEAVE_BALANCE_TRANSACTIONS,
    current.map(item => item.id === transactionId ? cancelled : item)
  );

  try {
    await setDoc(doc(db, TRANSACTION_COLLECTION, transactionId), cancelled, { merge: true });
  } catch (error) {
    console.warn('[LeaveBalanceLedger] Firestore cancellation warning:', error);
  }

  emitLedgerUpdated();
}

export async function syncLedgerFromFirestore(companyId?: string): Promise<LeaveBalanceTransaction[]> {
  try {
    const constraints = companyId ? [where('companyId', '==', companyId)] : [];
    const snapshot = await getDocs(query(collection(db, TRANSACTION_COLLECTION), ...constraints));
    const cloud = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as LeaveBalanceTransaction));
    const local = getLedgerTransactions();
    const merged = new Map<string, LeaveBalanceTransaction>();
    [...local, ...cloud].forEach(item => merged.set(item.id, item));

    // Backfill approved legacy holiday-work records once, preserving the original records.
    const legacyRecords = getPersistentData<Array<{
      id?: string;
      employeeId?: string;
      companyId?: string;
      date?: string;
      holidayName?: string;
      compensationType?: string;
      state?: string;
      hoursWorked?: number;
    }>>(MANARA_STORAGE_KEYS.HOLIDAY_WORK_RECORDS, []);
    const missingLegacyTransactions: LeaveBalanceTransaction[] = [];
    legacyRecords.forEach(record => {
      const recordId = String(record.id || '').trim();
      const employeeId = String(record.employeeId || '').trim();
      const recordCompanyId = String(record.companyId || '').trim();
      const state = String(record.state || '').toLowerCase();
      if (!recordId || !employeeId || (companyId && recordCompanyId !== companyId) || !['approved', 'done', ''].includes(state)) return;

      const transactionId = `holiday-work-${recordId}`;
      if (merged.has(transactionId)) return;
      const compensationType = String(record.compensationType || '').toUpperCase();
      const type: LeaveBalanceTransactionType = compensationType === 'ANNUAL_ACCRUAL' ? 'ANNUAL_ACCRUAL' : 'COMP_OFF';
      const hours = Number(record.hoursWorked || 8);
      const days = hours >= 4 ? 1 : Number((hours / 8).toFixed(2));
      const now = new Date().toISOString();
      const transaction: LeaveBalanceTransaction = {
        id: transactionId,
        companyId: recordCompanyId,
        employeeId,
        type,
        source: 'MIGRATION',
        sourceId: recordId,
        days: roundDays(days),
        status: 'APPROVED',
        effectiveDate: record.date || now.slice(0, 10),
        notes: record.holidayName || 'Migrated approved holiday-work record',
        createdAt: now,
        updatedAt: now
      };
      merged.set(transactionId, transaction);
      missingLegacyTransactions.push(transaction);
    });

    await Promise.all(missingLegacyTransactions.map(transaction =>
      setDoc(doc(db, TRANSACTION_COLLECTION, transaction.id), transaction, { merge: true })
        .catch(error => console.warn('[LeaveBalanceLedger] Legacy migration warning:', error))
    ));

    const result = Array.from(merged.values());
    setPersistentData(MANARA_STORAGE_KEYS.LEAVE_BALANCE_TRANSACTIONS, result);
    emitLedgerUpdated();
    return result;
  } catch (error) {
    console.warn('[LeaveBalanceLedger] Firestore sync warning:', error);
    return getLedgerTransactions();
  }
}

export async function deleteLedgerTransaction(transactionId: string): Promise<void> {
  const current = getLedgerTransactions().filter(item => item.id !== transactionId);
  setPersistentData(MANARA_STORAGE_KEYS.LEAVE_BALANCE_TRANSACTIONS, current);
  try {
    await deleteDoc(doc(db, TRANSACTION_COLLECTION, transactionId));
  } catch (error) {
    console.warn('[LeaveBalanceLedger] Firestore delete warning:', error);
  }
  emitLedgerUpdated();
}
