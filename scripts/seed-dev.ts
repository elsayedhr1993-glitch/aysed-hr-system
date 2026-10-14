/**
 * Writes fake tenant data to the Firebase emulators only.
 * Refuses to start unless both emulator hosts are local.
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const EMULATOR_PASSWORD = 'EmuOnly#2026x';
const COMPANY_ID = 'comp-emu-demo';

function assertLocalHost(name: string, value: string | undefined): string {
  const host = String(value || '').trim();
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
    console.error(`Refusing to seed: ${name} must be 127.0.0.1 or localhost with a port. Nothing was written.`);
    process.exit(1);
  }
  return host;
}

assertLocalHost('FIRESTORE_EMULATOR_HOST', process.env.FIRESTORE_EMULATOR_HOST);
assertLocalHost('FIREBASE_AUTH_EMULATOR_HOST', process.env.FIREBASE_AUTH_EMULATOR_HOST);

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8')) as {
  projectId?: string;
  firestoreDatabaseId?: string;
};
const projectId = String(config.projectId || '').trim();
const databaseId = String(config.firestoreDatabaseId || '').trim();
if (!projectId || !databaseId) {
  console.error('firebase-applet-config.json is missing projectId or firestoreDatabaseId.');
  process.exit(1);
}

function fakeCivilId(serial: number): string {
  const weights = [2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  for (let n = serial; n < serial + 40; n += 1) {
    const body = `3900101${String(n).padStart(4, '0')}`.slice(0, 11);
    let sum = 0;
    for (let i = 0; i < 11; i += 1) sum += Number(body[i]) * weights[i];
    const check = (11 - (sum % 11)) % 11;
    if (check <= 9) return `${body}${check}`;
  }
  throw new Error('Could not build a fake civil id');
}

const employees = [
  ['ألف', 'Alef'],
  ['باء', 'Baa'],
  ['تاء', 'Taa'],
  ['ثاء', 'Thaa'],
  ['جيم', 'Jeem'],
].map(([ar, en], index) => {
  const n = index + 1;
  return {
    id: `emu-emp-${n}`,
    employeeCode: `EMU-${n}`,
    fullNameAr: `موظف تجريبي ${ar}`,
    fullNameEn: `Test Employee ${en}`,
    civilId: fakeCivilId(n),
    jobTitle: n === 5 ? 'موظف' : 'موارد بشرية',
    department: n === 4 ? 'المالية' : 'الموارد البشرية',
    email: `dev.employee${n}@example.test`,
  };
});

const accounts = [
  { uid: 'emu-platform', email: 'dev.platform@example.test', name: 'مسؤول منصة تجريبي', role: 'SUPER_ADMIN', companyId: '' },
  { uid: 'emu-hr-manager', email: 'dev.hr.manager@example.test', name: 'مدير موارد بشرية تجريبي', role: 'HR_MANAGER', companyId: COMPANY_ID },
  { uid: 'emu-hr-user', email: 'dev.hr.user@example.test', name: 'مستخدم موارد بشرية تجريبي', role: 'HR_USER', companyId: COMPANY_ID },
  { uid: 'emu-finance', email: 'dev.finance@example.test', name: 'مستخدم مالية تجريبي', role: 'FINANCE', companyId: COMPANY_ID },
  { uid: 'emu-employee', email: 'dev.employee@example.test', name: 'موظف تجريبي', role: 'EMPLOYEE', companyId: COMPANY_ID },
];

async function main() {
  const app = initializeApp({ projectId });
  const auth = getAuth(app);
  const db = getFirestore(app, databaseId);

  await db.collection('companies').doc(COMPANY_ID).set({
    id: COMPANY_ID,
    companyId: COMPANY_ID,
    companyName: 'منشأة تجريبية للمحاكي',
    nameAr: 'منشأة تجريبية للمحاكي',
    nameEn: 'Emulator Demo Company',
    email: 'dev.hr.manager@example.test',
    status: 'active',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  for (const employee of employees) {
    await db.collection('employees').doc(employee.id).set({
      ...employee,
      companyId: COMPANY_ID,
      civilIdExpiry: '2030-01-01',
      passportNo: '',
      passportExpiry: '',
      nationality: 'تجريبي',
      isKuwaiti: false,
      residencyType: 'مادة 18 - قطاع أهلي',
      gender: 'MALE',
      dob: '1990-01-01',
      phone: '50000000',
      joinDate: '2026-01-01',
      status: 'ACTIVE',
      bankName: 'بنك تجريبي',
      iban: 'KW00EMU000000000000000000000',
      basicSalary: 100,
    });

    await db.collection('contracts').doc(`emu-contract-${employee.id}`).set({
      companyId: COMPANY_ID,
      employeeId: employee.id,
      employeeName: employee.fullNameAr,
      status: 'running',
      contractType: 'INDEFINITE',
      startDate: '2026-01-01',
      basicSalary: 100,
      wage: 100,
    });
  }

  const first = employees[0];
  await db.collection('payslips').doc('emu-payslip-1').set({
    id: 'emu-payslip-1',
    companyId: COMPANY_ID,
    payslipNumber: 'EMU-2026-10-1',
    employeeId: first.id,
    employeeName: first.fullNameAr,
    civilId: first.civilId,
    jobTitle: first.jobTitle,
    department: first.department,
    bankName: 'بنك تجريبي',
    iban: 'KW00EMU000000000000000000000',
    period: '2026-10',
    basicSalary: 100,
    housingAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    absenceDays: 0,
    absenceDeduction: 0,
    delayMinutes: 0,
    delayDeduction: 0,
    loanDeduction: 0,
    grossSalary: 100,
    totalDeductions: 0,
    netSalary: 100,
    status: 'draft',
  });

  for (const account of accounts) {
    try {
      await auth.getUser(account.uid);
      await auth.updateUser(account.uid, { email: account.email, password: EMULATOR_PASSWORD, displayName: account.name });
    } catch {
      await auth.createUser({
        uid: account.uid,
        email: account.email,
        password: EMULATOR_PASSWORD,
        displayName: account.name,
        emailVerified: true,
      });
    }
    await db.collection('users').doc(account.uid).set({
      email: account.email,
      name: account.name,
      role: account.role,
      companyId: account.companyId || null,
      status: 'active',
    });
  }

  console.log(`Seeded emulator company ${COMPANY_ID} with ${employees.length} fake employees and ${accounts.length} fake users.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Seed failed');
  process.exit(1);
});
