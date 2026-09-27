/**
 * Create employee + contract + commencement + leave allocation via Firebase Admin.
 * Usage: npx tsx scripts/add-employee-onboarding-admin.ts [--dry-run]
 * Env: employee payload is embedded for one-off imports; extend as needed.
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { buildEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService.ts';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';

const COMPANY_ID = 'comp-1788442584841';
const dryRun = process.argv.includes('--dry-run');

const incomingEmployee = {
  id: '', // assigned after scan
  fullNameAr: 'فؤاد نصر عبدالكريم الحجوج',
  fullNameEn: 'FUAD NASER ABDELKARIM AL HJOUJ',
  civilId: '284082903269',
  civilIdExpiry: '2027-05-29',
  passportNo: 'S0440637',
  nationality: 'أردني',
  isKuwaiti: false,
  gender: 'MALE',
  dob: '1984-08-29',
  birthDate: '1984-08-29',
  residencyType: 'مادة 18 - قطاع أهلي',
  jobTitle: 'مدير مالي',
  department: 'الإدارة المالية',
  joinDate: '2023-06-01',
  email: 'fuad.hjouj@almanarclinic.com',
  bankName: 'بيت التمويل الكويتي (KFH)',
  iban: 'KW00PENDING0000000000000000000',
  basicSalary: 800,
  housingAllowance: 0,
  transportAllowance: 0,
  medicalAllowance: 0,
  otherAllowance: 0,
  paciBuildingRef: '15821864',
  fullAddress: 'حطين - ق 3 - ش 301 - مبنى 48',
  notes: 'مضاف عبر مساعد Cursor من بطاقة مدنية (OCR) — يُرجى تحديث الآيبان والراتب إن لزم.',
  tags: ['استيراد-بطاقة-مدنية'],
  isCommenced: true,
  leaveAccrualActivated: true,
  contractStatus: 'running',
};

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const civil = incomingEmployee.civilId;
  const dupSnap = await db.collection('employees').where('civilId', '==', civil).get();
  if (!dupSnap.empty) {
    const rows = dupSnap.docs.map((d) => ({
      id: d.id,
      companyId: d.data().companyId,
      name: d.data().fullNameAr || d.data().nameAr,
    }));
    throw new Error(`Civil ID already exists: ${JSON.stringify(rows)}`);
  }

  const manarSnap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  const nextNum = manarSnap.size + 1;
  const empId = `EMP-2026-${String(nextNum).padStart(3, '0')}`;

  const existingEmployees = manarSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const employee = {
    ...incomingEmployee,
    id: empId,
    employeeCode: empId,
    companyId: COMPANY_ID,
  };

  const bundle = buildEmployeeOnboardingBundle({
    companyId: COMPANY_ID,
    employee,
    existingEmployees,
  });

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, employeeId: bundle.employee.id, civilId: bundle.employee.civilId }, null, 2));
    return;
  }

  const batch = db.batch();
  batch.set(
    db.collection('employees').doc(String(bundle.employee.id)),
    cleanFirestoreData(toEmployeeFirestoreData(bundle.employee as any, COMPANY_ID)),
    { merge: true }
  );
  batch.set(db.collection('contracts').doc(String(bundle.contract.id)), cleanFirestoreData(bundle.contract), { merge: true });
  batch.set(
    db.collection('commencements').doc(String(bundle.commencement.id)),
    cleanFirestoreData(bundle.commencement),
    { merge: true }
  );
  if (bundle.leaveAllocation) {
    batch.set(
      db.collection('leave_allocations').doc(String(bundle.leaveAllocation.id)),
      cleanFirestoreData(bundle.leaveAllocation),
      { merge: true }
    );
  }

  await batch.commit();

  console.log(
    JSON.stringify(
      {
        ok: true,
        employeeId: bundle.employee.id,
        name: bundle.employee.fullNameAr,
        civilId: bundle.employee.civilId,
        companyId: COMPANY_ID,
        contractId: bundle.contract.id,
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
