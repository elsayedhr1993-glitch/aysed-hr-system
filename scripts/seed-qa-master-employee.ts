/**
 * Seed the QA master test employee via createEmployeeOnboardingBundle,
 * then run a verification cycle (Firestore + leave math + Supabase sync).
 *
 * Usage:
 *   npx tsx scripts/seed-qa-master-employee.ts
 *   npx tsx scripts/seed-qa-master-employee.ts --dry-run
 */
import dotenv from 'dotenv';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { createEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService';
import { upsertLeaveAllocationToSupabase } from '../src/services/leaveSupabaseSync';
import { isSupabaseConfigured } from '../src/lib/supabase';
import { calculateKuwaitDailyRate, calculateKuwaitLeaveCashAmount } from '../src/utils/kuwaitPayrollMath';
import { computeAccrual2026Unified } from '../src/utils/leaveAccrual2026';
import { calculateLeaveBalanceSnapshot } from '../src/utils/leaveEngine';
import { getGlobalOpeningBalance, getGlobalAccrued2026 } from '../src/utils/kuwaitLaw';
import { Employee, HrLeaveAllocation, LeaveRequest } from '../src/types';

dotenv.config();

const COMPANY_ID = 'comp-1788442584841';
const QA_EMPLOYEE_ID = 'emp-qa-master';

const QA_EMPLOYEE: Partial<Employee> & Record<string, unknown> = {
  id: QA_EMPLOYEE_ID,
  employeeCode: 'EMP-QA-0001',
  fullNameAr: '[QA] عبدالله تجريبي — دورة اختبار',
  fullNameEn: 'Abdullah QA Test Cycle',
  civilId: '299091600001',
  civilIdExpiry: '2029-09-16',
  passportNo: 'QA000001',
  passportExpiry: '2030-09-16',
  nationality: 'مصري',
  isKuwaiti: false,
  residencyType: 'مادة 18 - قطاع أهلي',
  gender: 'MALE',
  dob: '1990-09-16',
  department: 'التمريض',
  jobTitle: 'ممرض/ة — QA Test',
  email: 'qa.master@almanar.test',
  phone: '96590000999',
  joinDate: '2024-01-01',
  commencementDate: '2024-01-01',
  status: 'ACTIVE',
  contractStatus: 'running',
  isCommenced: true,
  bankName: 'بنك الكويت الوطني (NBK)',
  iban: 'KW81CBKU000000000000009001',
  basicSalary: 780,
  contractSalary: 780,
  housingAllowance: 100,
  transportAllowance: 50,
  medicalAllowance: 20,
  otherAllowance: 0,
  totalSalary: 950,
  salary: 950,
  carriedOverLeave2025: 5,
  carriedOverBalance: 5,
  openingBalance: 5,
  badgeId: '9991',
  biometricId: '9991',
  tags: ['QA', 'تجريبي', 'لا_تحذف'],
  contractType: 'دائم',
};

function parseArgs() {
  return { dryRun: process.argv.includes('--dry-run') };
}

async function fetchCompanyEmployees(companyId: string) {
  const snap = await getDocs(query(collection(db, 'employees'), where('companyId', '==', companyId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function fetchEmployeeAllocations(employeeId: string, companyId: string): Promise<HrLeaveAllocation[]> {
  const snap = await getDocs(
    query(collection(db, 'leave_allocations'), where('companyId', '==', companyId))
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as HrLeaveAllocation))
    .filter(a => String(a.employeeId) === employeeId);
}

async function fetchEmployeeLeaves(employeeId: string, companyId: string): Promise<LeaveRequest[]> {
  const snap = await getDocs(
    query(collection(db, 'leave_requests'), where('companyId', '==', companyId))
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as LeaveRequest))
    .filter(l => String(l.employeeId) === employeeId);
}

function printSection(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
}

async function verifyFirestoreRecords(employeeId: string, companyId: string) {
  const checks = [
    { label: 'employees', id: employeeId },
    { label: 'contracts', id: `contract-${companyId}-${employeeId}` },
    { label: 'commencements', id: `commencement-${companyId}-${employeeId}` },
    { label: 'leave_allocations', id: `ALC-${companyId}-${employeeId}-2024` },
  ];

  const results: Record<string, boolean> = {};
  for (const check of checks) {
    const snap = await getDoc(doc(db, check.label, check.id));
    results[check.label] = snap.exists();
    console.log(`${results[check.label] ? '✓' : '❌'} ${check.label}/${check.id}`);
  }
  return results;
}

async function main() {
  const { dryRun } = parseArgs();
  const asOf = new Date('2026-09-16');

  printSection('QA Master Employee — Seed & Verification Cycle');
  console.log(`Company: ${COMPANY_ID}`);
  console.log(`Employee ID: ${QA_EMPLOYEE_ID}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  const existingEmployees = await fetchCompanyEmployees(COMPANY_ID);
  const alreadyExists = existingEmployees.some(e => String(e.id) === QA_EMPLOYEE_ID);

  if (alreadyExists) {
    console.log('\n⚠️  QA employee already exists — skipping creation, running verification only.');
  } else if (dryRun) {
    console.log('\n[DRY RUN] Would create employee via createEmployeeOnboardingBundle');
  } else {
    printSection('Step 1 — Create via createEmployeeOnboardingBundle');
    const bundle = await createEmployeeOnboardingBundle({
      companyId: COMPANY_ID,
      employee: QA_EMPLOYEE,
      existingEmployees,
    });

    console.log('✓ Employee:', bundle.employee.id, '—', bundle.employee.fullNameAr);
    console.log('✓ Contract:', bundle.contract.id, '— status:', bundle.contract.status);
    console.log('✓ Commencement:', bundle.commencement.id, '— status:', bundle.commencement.status);
    console.log('✓ Leave allocation:', bundle.leaveAllocation?.id ?? '(none)');

    if (bundle.leaveAllocation && isSupabaseConfigured(true)) {
      const synced = await upsertLeaveAllocationToSupabase(bundle.leaveAllocation, COMPANY_ID, true);
      console.log(synced ? '✓ Supabase leave_allocations synced' : '⚠️  Supabase leave_allocations sync failed');
    }
  }

  printSection('Step 2 — Firestore document check');
  const firestoreOk = await verifyFirestoreRecords(QA_EMPLOYEE_ID, COMPANY_ID);

  printSection('Step 3 — Leave & payroll math');
  const empSnap = await getDoc(doc(db, 'employees', QA_EMPLOYEE_ID));
  if (!empSnap.exists()) {
    console.error('❌ Employee document not found — cannot continue verification.');
    process.exit(1);
  }

  const employee = { id: empSnap.id, ...empSnap.data() } as Employee;
  const allocations = await fetchEmployeeAllocations(QA_EMPLOYEE_ID, COMPANY_ID);
  const leaves = await fetchEmployeeLeaves(QA_EMPLOYEE_ID, COMPANY_ID);

  const carriedOver = getGlobalOpeningBalance(employee);
  const accrued2026 = getGlobalAccrued2026(employee, asOf);
  const accrualUnified = computeAccrual2026Unified(employee.joinDate, asOf);
  const dailyRate = calculateKuwaitDailyRate(Number(employee.basicSalary));
  const snapshot = calculateLeaveBalanceSnapshot({ employee, allocations, leaves });

  console.log(`Carried over (2025):     ${carriedOver} days`);
  console.log(`Accrued 2026 (engine):   ${accrued2026} days`);
  console.log(`Accrued 2026 (unified):  ${accrualUnified} days`);
  console.log(`Basic salary:            ${employee.basicSalary} KWD`);
  console.log(`Daily wage (÷26):        ${dailyRate} KWD`);
  console.log(`Engine net balance:      ${snapshot.netBalance} days`);
  console.log(`Cash liability:          ${snapshot.cashLiability} KWD`);
  console.log(`Settlement (3 days):     ${calculateKuwaitLeaveCashAmount(3, Number(employee.basicSalary))} KWD`);

  const expectedCarried = 5;
  const expectedAccrual = 22.5; // Jan–Sep 2026
  const expectedDaily = 30;
  const mathOk =
    carriedOver === expectedCarried &&
    accrualUnified === expectedAccrual &&
    dailyRate === expectedDaily;

  console.log(`\nExpected carried: ${expectedCarried} | Expected accrual: ${expectedAccrual} | Expected daily: ${expectedDaily}`);
  console.log(mathOk ? '✓ Core math checks passed' : '⚠️  Some math values differ — review engine vs unified accrual');

  printSection('Step 4 — Summary');
  const allFirestore = Object.values(firestoreOk).every(Boolean);
  console.log(`Firestore records:  ${allFirestore ? '✓ ALL OK' : '❌ MISSING DOCS'}`);
  console.log(`Leave allocations:  ${allocations.length} record(s)`);
  console.log(`Leave requests:     ${leaves.length} record(s)`);
  console.log(`\nNext manual tests in UI:`);
  console.log('  1. App Launcher → الموظفين → search "[QA]"');
  console.log('  2. App Launcher → الإجازات → verify balance & daily rate 30.000');
  console.log('  3. Submit a 3-day annual leave request');
  console.log('  4. Run: npm run supabase:verify && npm run supabase:sync:allocations');

  if (!allFirestore) process.exit(1);
}

main().catch(err => {
  console.error('\n❌ Seed/verify failed:', err?.message || err);
  process.exit(1);
});
