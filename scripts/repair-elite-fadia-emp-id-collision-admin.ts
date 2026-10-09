/**
 * Fadia was imported as EMP-2026-030 which collided with Fanar employee.
 * Moves Fadia to a globally unique ID and restores EMP-2026-030 for Fanar.
 */
import 'dotenv/config';
import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { buildEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService.ts';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';

const ELITE_ID = 'comp-1788435917695';
const FANAR_ID = 'tenant_1788413304890';
const COLLIDING_ID = 'EMP-2026-030';
const FADIA_CIVIL = '274110503387';
const YUSUF_CIVIL = '288051200526';

async function globalNextEmpId(db: Firestore): Promise<string> {
  const snap = await db.collection('employees').get();
  const nums = snap.docs
    .map((d) => {
      const m = /^EMP-2026-(\d+)$/i.exec(d.id);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `EMP-2026-${String(max + 1).padStart(3, '0')}`;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const current = await db.collection('employees').doc(COLLIDING_ID).get();
  if (!current.exists) throw new Error(`${COLLIDING_ID} missing`);
  const data = current.data() as Record<string, unknown>;
  if (String(data.civilId) !== FADIA_CIVIL) {
    throw new Error(`Expected Fadia at ${COLLIDING_ID}, got civil ${data.civilId}`);
  }

  const newFadiaId = await globalNextEmpId(db);
  const fadiaEmployee = {
    ...data,
    id: newFadiaId,
    employeeCode: newFadiaId,
    companyId: ELITE_ID,
    company_id: ELITE_ID,
  };

  const eliteSnap = await db.collection('employees').where('companyId', '==', ELITE_ID).get();
  const eliteExisting = eliteSnap.docs
    .filter((d) => d.id !== COLLIDING_ID)
    .map((d) => ({ id: d.id, ...d.data() }));

  const fadiaBundle = buildEmployeeOnboardingBundle({
    companyId: ELITE_ID,
    employee: fadiaEmployee as any,
    existingEmployees: eliteExisting as any[],
  });

  const yusufPayload = {
    id: COLLIDING_ID,
    employeeCode: COLLIDING_ID,
    companyId: FANAR_ID,
    fullNameAr: 'يوسف اسماعيل سيد حسن الموسوي',
    fullNameEn: 'YOUSEF E S H ALMOUSAWI',
    civilId: YUSUF_CIVIL,
    civilIdExpiry: '2026-09-29',
    passportNo: '',
    nationality: 'كويتي',
    isKuwaiti: true,
    gender: 'MALE',
    dob: '1988-05-12',
    birthDate: '1988-05-12',
    residencyType: 'كويتي',
    jobTitle: 'موظف إداري',
    department: 'الإدارة العامة',
    joinDate: '2023-06-01',
    email: 'yousef.almousawi@fanarclinic.com',
    bankName: 'بيت التمويل الكويتي (KFH)',
    iban: 'KW81CBKU0000000000000000000130',
    basicSalary: 800,
    housingAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    otherAllowance: 0,
    hasAllowances: false,
    salaryPackageType: 'FIXED_NO_ALLOWANCES',
    paciBuildingRef: '16840733',
    fullAddress: 'الدسمة - ق 6 - ش حسان بن ثابت - مبنى 4',
    notes: 'استعادة بعد تصحيح تعارض معرف EMP-2026-030',
    tags: ['استيراد-بطاقة-مدنية', 'فنار'],
    isCommenced: true,
    leaveAccrualActivated: true,
    contractStatus: 'running',
  };

  const fanarSnap = await db.collection('employees').where('companyId', '==', FANAR_ID).get();
  const fanarExisting = fanarSnap.docs
    .filter((d) => d.id !== COLLIDING_ID)
    .map((d) => ({ id: d.id, ...d.data() }));

  const yusufBundle = buildEmployeeOnboardingBundle({
    companyId: FANAR_ID,
    employee: yusufPayload as any,
    existingEmployees: fanarExisting as any[],
  });

  const pathsToDelete = [
    `contracts/contract-${ELITE_ID}-${COLLIDING_ID}`,
    `contracts/contract-comp-1788435917695-${COLLIDING_ID}`,
    `commencements/commencement-${ELITE_ID}-${COLLIDING_ID}`,
    `commencements/commencement-comp-1788435917695-${COLLIDING_ID}`,
  ];

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          newFadiaId,
          fadiaContractId: fadiaBundle.contract.id,
          yusufContractId: yusufBundle.contract.id,
          pathsToDelete,
        },
        null,
        2
      )
    );
    return;
  }

  const batch = db.batch();

  batch.set(
    db.collection('employees').doc(newFadiaId),
    cleanFirestoreData(toEmployeeFirestoreData(fadiaBundle.employee as any, ELITE_ID)),
    { merge: true }
  );
  batch.set(db.collection('contracts').doc(String(fadiaBundle.contract.id)), cleanFirestoreData(fadiaBundle.contract), {
    merge: true,
  });
  batch.set(
    db.collection('commencements').doc(String(fadiaBundle.commencement.id)),
    cleanFirestoreData(fadiaBundle.commencement),
    { merge: true }
  );
  if (fadiaBundle.leaveAllocation) {
    batch.set(
      db.collection('leave_allocations').doc(String(fadiaBundle.leaveAllocation.id)),
      cleanFirestoreData(fadiaBundle.leaveAllocation),
      { merge: true }
    );
  }

  batch.set(
    db.collection('employees').doc(COLLIDING_ID),
    cleanFirestoreData(toEmployeeFirestoreData(yusufBundle.employee as any, FANAR_ID)),
    { merge: true }
  );
  batch.set(db.collection('contracts').doc(String(yusufBundle.contract.id)), cleanFirestoreData(yusufBundle.contract), {
    merge: true,
  });
  batch.set(
    db.collection('commencements').doc(String(yusufBundle.commencement.id)),
    cleanFirestoreData(yusufBundle.commencement),
    { merge: true }
  );
  if (yusufBundle.leaveAllocation) {
    batch.set(
      db.collection('leave_allocations').doc(String(yusufBundle.leaveAllocation.id)),
      cleanFirestoreData(yusufBundle.leaveAllocation),
      { merge: true }
    );
  }

  await batch.commit();

  for (const path of pathsToDelete) {
    await db.doc(path).delete().catch(() => {});
  }

  const leaveOld = await db
    .collection('leave_allocations')
    .where('employeeId', '==', COLLIDING_ID)
    .where('companyId', '==', ELITE_ID)
    .get();
  for (const d of leaveOld.docs) {
    const name = String(d.data().employeeName || '');
    if (name.includes('فاديا')) await d.ref.delete();
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        fadia: { employeeId: newFadiaId, civilId: FADIA_CIVIL, companyId: ELITE_ID, contractId: fadiaBundle.contract.id },
        restoredFanar: { employeeId: COLLIDING_ID, civilId: YUSUF_CIVIL, companyId: FANAR_ID },
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
