/**
 * Create onboarding plan ONB-QA-001 linked to emp-qa-master.
 *
 * Usage:
 *   npx tsx scripts/seed-qa-onboarding-plan.ts
 *   npx tsx scripts/seed-qa-onboarding-plan.ts --dry-run
 */
import dotenv from 'dotenv';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../src/lib/firebase';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper';
import { OnboardingPlan, OnboardingTask } from '../src/types';

dotenv.config();

const COMPANY_ID = 'comp-1788442584841';
const QA_EMPLOYEE_ID = 'emp-qa-master';
const PLAN_ID = 'ONB-QA-001';

const LEGAL_CHECKLIST = {
  civilIdScan: true,
  passportScan: true,
  pamWorkPermit: true,
  mohLicense: false,
  medicalFitness: true,
  signedContract: true,
};

const REQUIRED_DOCUMENTS = [
  'civilIdScan',
  'passportScan',
  'pamWorkPermit',
  'signedContract',
  'medicalFitness',
];

const CUSTODY_ITEMS = ['بطاقة دخول', 'زي موحد', 'جهاز بصمة — 9991'];

function buildQaTasks(): OnboardingTask[] {
  return [
    {
      id: 'task-1',
      title: 'استكمال ملف المستندات الرسمية والبطاقة المدنية',
      category: 'legal',
      assignedToRole: 'مسؤول الموارد البشرية',
      completed: true,
      completedAt: '2026-09-16T10:00:00.000Z',
    },
    {
      id: 'task-2',
      title: 'مراجعة وترخيص وزارة الصحة (MOH) وقيد النقابة',
      category: 'medical',
      assignedToRole: 'مسؤول تراخيص وزارة الصحة',
      completed: false,
      notes: 'غير مطلوب — كادر تمريض QA',
    },
    {
      id: 'task-3',
      title: 'تسليم العهد والأجهزة الإلكترونية والتجهيزات',
      category: 'custody',
      assignedToRole: 'قسم تقنية المعلومات والخدمات',
      completed: false,
    },
    {
      id: 'task-4',
      title: 'إعداد حساب البريد الإلكتروني وبصمة الحضور',
      category: 'it',
      assignedToRole: 'مسؤول شبكات الدعم الفني',
      completed: true,
      completedAt: '2026-09-16T10:30:00.000Z',
      notes: 'Biometric ID: 9991',
    },
    {
      id: 'task-5',
      title: 'الجلسة التعريفية باللوائح الداخلية وسياسة المنشأة',
      category: 'training',
      assignedToRole: 'مدير المورد البشري والموجه',
      completed: false,
    },
    {
      id: 'task-6',
      title: 'توقيع إقرار مباشرة العمل الرسمي بالفرع',
      category: 'legal',
      assignedToRole: 'المسؤول المباشر',
      completed: true,
      completedAt: '2026-09-16T11:00:00.000Z',
    },
  ];
}

function parseArgs() {
  return { dryRun: process.argv.includes('--dry-run') };
}

async function main() {
  const { dryRun } = parseArgs();
  const empSnap = await getDoc(doc(db, 'employees', QA_EMPLOYEE_ID));
  if (!empSnap.exists()) {
    console.error('❌ emp-qa-master not found. Run: npm run qa:seed');
    process.exit(1);
  }

  const emp = empSnap.data();
  const tasks = buildQaTasks();
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);
  const now = new Date().toISOString();

  const plan: OnboardingPlan = {
    id: PLAN_ID,
    companyId: COMPANY_ID,
    employeeId: QA_EMPLOYEE_ID,
    employeeName: String(emp.fullNameAr || '[QA] عبدالله تجريبي — دورة اختبار'),
    jobTitle: String(emp.jobTitle || 'ممرض/ة — QA Test'),
    department: String(emp.department || 'التمريض'),
    civilId: String(emp.civilId || '299091600001'),
    expectedStartDate: String(emp.joinDate || '2024-01-01'),
    templateType: 'technical',
    status: 'active',
    progressPercentage,
    tasks,
    custodyItems: CUSTODY_ITEMS,
    legalChecklist: LEGAL_CHECKLIST,
    requiredDocuments: REQUIRED_DOCUMENTS,
    contractDetails: {
      contractType: 'دائم',
      startDate: String(emp.joinDate || '2024-01-01'),
      endDate: '',
      probationDays: 100,
      workEmail: String(emp.email || 'qa.master@almanar.test'),
      bankName: String(emp.bankName || 'بنك الكويت الوطني (NBK)'),
      iban: String(emp.iban || 'KW81CBKU000000000000009001'),
      basicSalary: Number(emp.basicSalary || 780),
      housingAllowance: Number(emp.housingAllowance || 100),
      transportAllowance: Number(emp.transportAllowance || 50),
      otherAllowances: Number(emp.otherAllowance || 20),
      totalSalary: Number(emp.totalSalary || 950),
    },
    commencementDetails: {
      actualJoiningDate: String(emp.commencementDate || emp.joinDate || '2024-01-01'),
      directSupervisor: 'مدير التمريض — QA',
      branchLocation: 'الفرع الرئيسي — المنار كلينك',
      isCommenced: true,
      commencedAt: now,
      custodyDelivered: ['بطاقة دخول'],
      leaveAccrualActivated: true,
      notes: '[QA] خطة تهيئة تجريبية — دورة اختبار النظام',
    },
    civilIdExpiry: String(emp.civilIdExpiry || '2029-09-16'),
    passportNo: String(emp.passportNo || 'QA000001'),
    passportExpiry: String(emp.passportExpiry || '2030-09-16'),
    biometricsRegistered: true,
    medicalFitnessStatus: 'fit',
    medicalFitnessDate: '2026-09-01',
    medicalFitnessHospital: 'مستشفى المنار',
    createdAt: now,
    updatedAt: now,
  };

  const employeePatch = {
    ...emp,
    id: QA_EMPLOYEE_ID,
    onboardingPlanId: PLAN_ID,
    legalChecklist: LEGAL_CHECKLIST,
    requiredDocuments: REQUIRED_DOCUMENTS,
    custodyItems: CUSTODY_ITEMS,
    status: 'على رأس العمل',
    isCommenced: true,
    leaveAccrualActivated: true,
    tags: Array.isArray(emp.tags) ? emp.tags : ['QA', 'تجريبي', 'لا_تحذف'],
  };

  console.log('=== QA Onboarding Plan Seed ===\n');
  console.log(`Plan ID:     ${PLAN_ID}`);
  console.log(`Employee:    ${plan.employeeName}`);
  console.log(`Progress:    ${progressPercentage}% (${completedCount}/${tasks.length} tasks)`);
  console.log(`Status:      ${plan.status}`);
  console.log(`Mode:        ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Would write onboarding_plans + update employee');
    return;
  }

  await setDoc(doc(db, 'onboarding_plans', PLAN_ID), cleanFirestoreData(plan), { merge: true });
  await setDoc(
    doc(db, 'employees', QA_EMPLOYEE_ID),
    cleanFirestoreData(toEmployeeFirestoreData(employeePatch, COMPANY_ID)),
    { merge: true }
  );

  const verifyPlan = await getDoc(doc(db, 'onboarding_plans', PLAN_ID));
  const verifyEmp = await getDoc(doc(db, 'employees', QA_EMPLOYEE_ID));

  console.log('\n✓ onboarding_plans/' + PLAN_ID + ':', verifyPlan.exists() ? 'OK' : 'FAILED');
  console.log('✓ employee onboardingPlanId:', verifyEmp.data()?.onboardingPlanId || 'MISSING');
  console.log('✓ employee status:', verifyEmp.data()?.status);
  console.log('\nNext: الموظفين → إجراءات → خطة التهيئة والتعيين → search "[QA]"');
}

main().catch(err => {
  console.error('❌', err?.message || err);
  process.exit(1);
});
