/**
 * Firestore rules against the local emulator only.
 * Project id is the fake demo-aysed. This file never calls production.
 *
 * Run while the emulator is up:
 *   npx firebase emulators:start --only firestore --project demo-aysed
 *   npx tsx tests/firestoreRulesEmulator.ts
 */
import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

const PROJECT_ID = 'demo-aysed';
const COMPANY_A = 'comp-a';
const COMPANY_B = 'comp-b';

type Verdict = { name: string; result: 'نجحت' | 'فشلت'; detail?: string };

const results: Verdict[] = [];

function contextFor(
  testEnv: Awaited<ReturnType<typeof initializeTestEnvironment>>,
  uid: string,
  role: string,
  companyId: string
) {
  return testEnv.authenticatedContext(uid, {
    email: `${uid}@facility.example`,
    role,
    companyId,
  }).firestore();
}

async function runCase(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, result: 'نجحت' });
  } catch (error) {
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    results.push({ name, result: 'فشلت', detail });
  }
}

async function main() {
  if (PROJECT_ID !== 'demo-aysed' || !PROJECT_ID.startsWith('demo-')) {
    throw new Error('refusing to run rules tests against a non-demo project');
  }

  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });

  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const users = [
      ['user-admin-a', 'COMPANY_ADMIN', COMPANY_A],
      ['user-admin-b', 'COMPANY_ADMIN', COMPANY_B],
      ['user-hr-manager', 'HR_MANAGER', COMPANY_A],
      ['user-hr-user', 'HR_USER', COMPANY_A],
      ['user-finance', 'FINANCE', COMPANY_A],
      ['user-dept', 'DEPARTMENT_MANAGER', COMPANY_A],
      ['user-employee', 'EMPLOYEE', COMPANY_A],
      ['user-unknown', 'UNKNOWN', COMPANY_A],
      ['user-super', 'SUPER_ADMIN', COMPANY_A],
    ] as const;
    for (const [uid, role, companyId] of users) {
      await setDoc(doc(db, 'users', uid), {
        role,
        companyId,
        email: `${uid}@facility.example`,
        ...(uid === 'user-dept' ? { departmentId: 'dept-1' } : {}),
        ...(uid === 'user-employee' ? { employeeId: 'emp-own' } : {}),
      });
    }
    await setDoc(doc(db, 'companies', COMPANY_A), { name: 'Facility A' });
    await setDoc(doc(db, 'companies', COMPANY_B), { name: 'Facility B' });
    await setDoc(doc(db, 'employees', 'emp-a'), { companyId: COMPANY_A, fullName: 'A' });
    await setDoc(doc(db, 'employees', 'emp-b'), { companyId: COMPANY_B, fullName: 'B' });
    await setDoc(doc(db, 'employees', 'emp-own'), {
      companyId: COMPANY_A,
      fullName: 'Own',
      authUid: 'user-employee',
    });
    await setDoc(doc(db, 'employees', 'emp-other'), {
      companyId: COMPANY_A,
      fullName: 'Other',
      authUid: 'someone-else',
    });
    await setDoc(doc(db, 'payslips', 'pay-a'), { companyId: COMPANY_A, net: 1 });
    await setDoc(doc(db, 'payslips', 'pay-b'), { companyId: COMPANY_B, net: 1 });
    await setDoc(doc(db, 'contracts', 'contract-a'), { companyId: COMPANY_A, employeeId: 'emp-own' });
    await setDoc(doc(db, 'contracts', 'contract-other'), { companyId: COMPANY_A, employeeId: 'emp-other' });
    await setDoc(doc(db, 'contracts', 'contract-b'), { companyId: COMPANY_B, employeeId: 'emp-b' });
    await setDoc(doc(db, 'attendance', 'att-same'), { companyId: COMPANY_A, departmentId: 'dept-1' });
    await setDoc(doc(db, 'attendance', 'att-other'), { companyId: COMPANY_A, departmentId: 'dept-2' });
    await setDoc(doc(db, 'audit_logs', 'log-a'), { companyId: COMPANY_A, action: 'read' });
    await setDoc(doc(db, 'audit_logs', 'log-b'), { companyId: COMPANY_B, action: 'read' });
    await setDoc(doc(db, 'audit_logs', 'log-platform'), { companyId: '', action: 'platform' });
    await setDoc(doc(db, 'documents', 'doc-a'), { companyId: COMPANY_A, name: 'file' });
    await setDoc(doc(db, 'subscriptions', 'sub-1'), { plan: 'demo' });
    await setDoc(doc(db, 'platform_users', 'owner'), { role: 'SUPER_ADMIN' });
    await setDoc(doc(db, 'unlisted_collection', 'secret'), { companyId: COMPANY_A });
    await setDoc(doc(db, 'companies', COMPANY_A), { name: 'Facility A', companyId: COMPANY_A });
    const screenDocs = [
      'departments', 'job_titles', 'warnings', 'employeeNotes', 'notifications',
      'shift_profiles', 'employee_shifts', 'attendance_monthly_rollups',
      'leave_balance_transactions', 'payroll_runs', 'payroll_inputs', 'payroll_leave_accruals',
      'loans', 'leave_settlements', 'attendance_records',
    ];
    for (const name of screenDocs) {
      await setDoc(doc(db, name, `${name}-a`), { companyId: COMPANY_A, employeeId: 'emp-own', departmentId: 'dept-1' });
      await setDoc(doc(db, name, `${name}-b`), { companyId: COMPANY_B, employeeId: 'emp-b', departmentId: 'dept-9' });
    }
    await setDoc(doc(db, 'leave_requests', 'leave-own'), { companyId: COMPANY_A, employeeId: 'emp-own', departmentId: 'dept-1' });
    await setDoc(doc(db, 'leave_requests', 'leave-other'), { companyId: COMPANY_A, employeeId: 'emp-other', departmentId: 'dept-2' });
    await setDoc(doc(db, 'documents', 'doc-own'), { companyId: COMPANY_A, employeeId: 'emp-own', name: 'own' });
    await setDoc(doc(db, 'documents', 'doc-other-emp'), { companyId: COMPANY_A, employeeId: 'emp-other', name: 'other' });
    await setDoc(doc(db, 'attendance_posted_months', COMPANY_A), { months: ['2026-10'] });
    await setDoc(doc(db, 'attendance_posted_months', COMPANY_B), { months: ['2026-10'] });
    await setDoc(doc(db, 'companies', COMPANY_A, 'licenses', 'lic-a'), { companyId: COMPANY_A, name: 'license' });
    await setDoc(doc(db, 'companies', COMPANY_B, 'licenses', 'lic-b'), { companyId: COMPANY_B, name: 'license' });
    await setDoc(doc(db, 'company_settings', COMPANY_A), { companyId: COMPANY_A });
    await setDoc(doc(db, 'company_settings', COMPANY_B), { companyId: COMPANY_B });
    await setDoc(doc(db, 'platform_settings', 'pam_form_2'), { title: 'pam' });
    await setDoc(doc(db, 'subscription_requests', 'req-1'), { companyId: COMPANY_A });
    await setDoc(doc(db, 'system_config', 'keys'), { secret: 'closed' });
    await setDoc(doc(db, 'system_integrations', COMPANY_A), { companyId: COMPANY_A });
    await setDoc(doc(db, 'purged_tenants', COMPANY_A), { companyId: COMPANY_A });
    await setDoc(doc(db, 'allocations', 'alloc-1'), { companyId: COMPANY_A });
  });

  const adminA = () => contextFor(testEnv, 'user-admin-a', 'COMPANY_ADMIN', COMPANY_A);
  const hrManager = () => contextFor(testEnv, 'user-hr-manager', 'HR_MANAGER', COMPANY_A);
  const hrUser = () => contextFor(testEnv, 'user-hr-user', 'HR_USER', COMPANY_A);
  const finance = () => contextFor(testEnv, 'user-finance', 'FINANCE', COMPANY_A);
  const dept = () => contextFor(testEnv, 'user-dept', 'DEPARTMENT_MANAGER', COMPANY_A);
  const employee = () => contextFor(testEnv, 'user-employee', 'EMPLOYEE', COMPANY_A);
  const unknown = () => contextFor(testEnv, 'user-unknown', 'UNKNOWN', COMPANY_A);
  const superAdmin = () => contextFor(testEnv, 'user-super', 'SUPER_ADMIN', COMPANY_A);

  await runCase('منشأة A لا تقرأ موظفي منشأة B', async () => {
    await assertFails(getDoc(doc(adminA(), 'employees', 'emp-b')));
  });
  await runCase('منشأة A لا تنشئ موظفاً في منشأة B', async () => {
    await assertFails(setDoc(doc(adminA(), 'employees', 'emp-forged'), { companyId: COMPANY_B, fullName: 'x' }));
  });
  await runCase('منشأة A لا تعدّل موظفاً في منشأة B', async () => {
    await assertFails(updateDoc(doc(adminA(), 'employees', 'emp-b'), { fullName: 'hacked' }));
  });
  await runCase('منشأة A لا تحذف موظفاً في منشأة B', async () => {
    await assertFails(deleteDoc(doc(adminA(), 'employees', 'emp-b')));
  });
  await runCase('منشأة A لا تقرأ رواتب منشأة B', async () => {
    await assertFails(getDoc(doc(adminA(), 'payslips', 'pay-b')));
  });
  await runCase('منشأة A لا تقرأ عقود منشأة B', async () => {
    await assertFails(getDoc(doc(adminA(), 'contracts', 'contract-b')));
  });
  await runCase('منشأة A لا تقرأ سجل تدقيق منشأة B', async () => {
    await assertFails(getDoc(doc(adminA(), 'audit_logs', 'log-b')));
  });
  await runCase('مدير المنشأة يقرأ موظفي منشأته', async () => {
    await assertSucceeds(getDoc(doc(adminA(), 'employees', 'emp-a')));
  });
  await runCase('مدير المنشأة ينشئ موظفاً في منشأته', async () => {
    await assertSucceeds(setDoc(doc(adminA(), 'employees', 'emp-new-a'), { companyId: COMPANY_A, fullName: 'new' }));
  });

  await runCase('EMPLOYEE لا يقرأ كشوف الرواتب', async () => {
    await assertFails(getDoc(doc(employee(), 'payslips', 'pay-a')));
  });
  await runCase('EMPLOYEE لا يقرأ سجل موظف آخر', async () => {
    await assertFails(getDoc(doc(employee(), 'employees', 'emp-other')));
  });
  await runCase('EMPLOYEE يقرأ سجله فقط', async () => {
    await assertSucceeds(getDoc(doc(employee(), 'employees', 'emp-own')));
  });
  await runCase('EMPLOYEE لا ينشئ موظفين', async () => {
    await assertFails(setDoc(doc(employee(), 'employees', 'emp-emp-create'), { companyId: COMPANY_A, fullName: 'no' }));
  });
  await runCase('EMPLOYEE يقرأ عقده فقط', async () => {
    await assertSucceeds(getDoc(doc(employee(), 'contracts', 'contract-a')));
  });
  await runCase('EMPLOYEE لا يقرأ عقد زميل', async () => {
    await assertFails(getDoc(doc(employee(), 'contracts', 'contract-other')));
  });

  await runCase('HR_USER لا يقرأ كشوف الرواتب', async () => {
    await assertFails(getDoc(doc(hrUser(), 'payslips', 'pay-a')));
  });
  await runCase('HR_USER لا ينشئ عقوداً', async () => {
    await assertFails(setDoc(doc(hrUser(), 'contracts', 'contract-new'), { companyId: COMPANY_A, employeeId: 'emp-a' }));
  });
  await runCase('HR_USER يقرأ الموظفين في منشأته', async () => {
    await assertSucceeds(getDoc(doc(hrUser(), 'employees', 'emp-a')));
  });
  await runCase('HR_USER يقرأ العقود في منشأته', async () => {
    await assertSucceeds(getDoc(doc(hrUser(), 'contracts', 'contract-a')));
  });
  await runCase('HR_USER لا يقرأ سجل التدقيق', async () => {
    await assertFails(getDoc(doc(hrUser(), 'audit_logs', 'log-a')));
  });

  await runCase('FINANCE يقرأ كشوف الرواتب', async () => {
    await assertSucceeds(getDoc(doc(finance(), 'payslips', 'pay-a')));
  });
  await runCase('FINANCE لا ينشئ موظفين', async () => {
    await assertFails(setDoc(doc(finance(), 'employees', 'emp-fin'), { companyId: COMPANY_A, fullName: 'no' }));
  });
  await runCase('FINANCE لا يعدّل العقود', async () => {
    await assertFails(updateDoc(doc(finance(), 'contracts', 'contract-a'), { note: 'no' }));
  });

  await runCase('DEPARTMENT_MANAGER يقرأ حضور قسمه', async () => {
    await assertSucceeds(getDoc(doc(dept(), 'attendance', 'att-same')));
  });
  await runCase('DEPARTMENT_MANAGER لا يقرأ حضور قسم آخر', async () => {
    await assertFails(getDoc(doc(dept(), 'attendance', 'att-other')));
  });
  await runCase('DEPARTMENT_MANAGER لا يقرأ كشوف الرواتب', async () => {
    await assertFails(getDoc(doc(dept(), 'payslips', 'pay-a')));
  });
  await runCase('DEPARTMENT_MANAGER لا ينشئ موظفين', async () => {
    await assertFails(setDoc(doc(dept(), 'employees', 'emp-dept'), { companyId: COMPANY_A, fullName: 'no' }));
  });

  await runCase('COMPANY_ADMIN لا يعدّل سجل المنشأة', async () => {
    await assertFails(updateDoc(doc(adminA(), 'companies', COMPANY_A), { name: 'renamed' }));
  });
  await runCase('COMPANY_ADMIN لا يقرأ الاشتراكات', async () => {
    await assertFails(getDoc(doc(adminA(), 'subscriptions', 'sub-1')));
  });
  await runCase('HR_MANAGER يقرأ سجل تدقيق منشأته', async () => {
    await assertSucceeds(getDoc(doc(hrManager(), 'audit_logs', 'log-a')));
  });
  await runCase('UNKNOWN لا يقرأ الموظفين', async () => {
    await assertFails(getDoc(doc(unknown(), 'employees', 'emp-a')));
  });
  await runCase('SUPER_ADMIN لا يقرأ موظفي المنشآت', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'employees', 'emp-b')));
  });

  await runCase('audit_logs يمنع الإنشاء حتى على SUPER_ADMIN', async () => {
    await assertFails(setDoc(doc(superAdmin(), 'audit_logs', 'log-new'), { companyId: COMPANY_A, action: 'create' }));
  });
  await runCase('audit_logs يمنع التعديل على SUPER_ADMIN', async () => {
    await assertFails(updateDoc(doc(superAdmin(), 'audit_logs', 'log-a'), { action: 'tamper' }));
  });
  await runCase('audit_logs يمنع الحذف على SUPER_ADMIN', async () => {
    await assertFails(deleteDoc(doc(superAdmin(), 'audit_logs', 'log-a')));
  });
  await runCase('audit_logs يمنع الإنشاء على COMPANY_ADMIN', async () => {
    await assertFails(setDoc(doc(adminA(), 'audit_logs', 'log-admin'), { companyId: COMPANY_A, action: 'create' }));
  });
  await runCase('audit_logs يمنع التعديل على COMPANY_ADMIN', async () => {
    await assertFails(updateDoc(doc(adminA(), 'audit_logs', 'log-a'), { action: 'tamper' }));
  });
  await runCase('audit_logs يمنع الحذف على COMPANY_ADMIN', async () => {
    await assertFails(deleteDoc(doc(adminA(), 'audit_logs', 'log-a')));
  });
  await runCase('audit_logs يمنع التعديل على HR_MANAGER', async () => {
    await assertFails(updateDoc(doc(hrManager(), 'audit_logs', 'log-a'), { action: 'tamper' }));
  });
  await runCase('audit_logs يمنع الحذف على HR_MANAGER', async () => {
    await assertFails(deleteDoc(doc(hrManager(), 'audit_logs', 'log-a')));
  });

  await runCase('مسؤول المنشأة يقرأ سجل تدقيق منشأته', async () => {
    await assertSucceeds(getDoc(doc(adminA(), 'audit_logs', 'log-a')));
  });
  await runCase('SUPER_ADMIN لا يقرأ سجل تدقيق منشأة', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'audit_logs', 'log-a')));
  });
  await runCase('SUPER_ADMIN يقرأ سجل المنصة', async () => {
    await assertSucceeds(getDoc(doc(superAdmin(), 'audit_logs', 'log-platform')));
  });
  await runCase('مسؤول المنشأة لا يقرأ سجل المنصة', async () => {
    await assertFails(getDoc(doc(adminA(), 'audit_logs', 'log-platform')));
  });
  await runCase('SUPER_ADMIN لا يقرأ عقود المنشأة', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'contracts', 'contract-a')));
  });
  await runCase('SUPER_ADMIN لا يقرأ كشوف رواتب المنشأة', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'payslips', 'pay-a')));
  });
  await runCase('SUPER_ADMIN لا يقرأ مستندات المنشأة', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'documents', 'doc-a')));
  });
  await runCase('SUPER_ADMIN يقرأ الشركات', async () => {
    await assertSucceeds(getDoc(doc(superAdmin(), 'companies', COMPANY_A)));
  });
  await runCase('SUPER_ADMIN يكتب الشركات', async () => {
    await assertSucceeds(updateDoc(doc(superAdmin(), 'companies', COMPANY_A), { name: 'from platform' }));
  });
  await runCase('SUPER_ADMIN يقرأ الاشتراكات', async () => {
    await assertSucceeds(getDoc(doc(superAdmin(), 'subscriptions', 'sub-1')));
  });
  await runCase('SUPER_ADMIN يكتب الاشتراكات', async () => {
    await assertSucceeds(setDoc(doc(superAdmin(), 'subscriptions', 'sub-new'), { plan: 'platform' }));
  });
  await runCase('SUPER_ADMIN يقرأ platform_users', async () => {
    await assertSucceeds(getDoc(doc(superAdmin(), 'platform_users', 'owner')));
  });
  await runCase('SUPER_ADMIN يكتب platform_users', async () => {
    await assertSucceeds(setDoc(doc(superAdmin(), 'platform_users', 'owner-2'), { role: 'SUPER_ADMIN' }));
  });
  await runCase('مجموعة بلا allow تُرفض حتى على SUPER_ADMIN', async () => {
    await assertFails(getDoc(doc(superAdmin(), 'unlisted_collection', 'secret')));
  });

  const listByCompany = (db: ReturnType<typeof adminA>, name: string, companyId: string) =>
    getDocs(query(collection(db, name), where('companyId', '==', companyId)));
  const hrScreens = [
    'employees', 'departments', 'job_titles', 'warnings', 'employeeNotes', 'notifications',
    'shift_profiles', 'employee_shifts', 'documents', 'leave_requests', 'attendance_monthly_rollups',
    'leave_balance_transactions',
  ];
  const payrollScreens = [
    'payslips', 'loans', 'leave_settlements', 'payroll_runs', 'payroll_inputs', 'payroll_leave_accruals',
  ];
  const closedDocs = [
    ['subscription_requests', 'req-1'],
    ['system_config', 'keys'],
    ['system_integrations', COMPANY_A],
    ['purged_tenants', COMPANY_A],
    ['allocations', 'alloc-1'],
  ] as const;
  const staff = [
    ['COMPANY_ADMIN', adminA],
    ['HR_MANAGER', hrManager],
    ['HR_USER', hrUser],
    ['FINANCE', finance],
  ] as const;

  for (const [roleName, dbFor] of staff) {
    for (const name of hrScreens) {
      await runCase(`${roleName} يفتح قائمة ${name}`, async () => {
        await assertSucceeds(listByCompany(dbFor(), name, COMPANY_A));
      });
      await runCase(`${roleName} تُرفض قائمة ${name} لمنشأة أخرى`, async () => {
        await assertFails(listByCompany(dbFor(), name, COMPANY_B));
      });
    }
    for (const [collectionName, id] of closedDocs) {
      await runCase(`${roleName} تُرفض المجموعة المغلقة ${collectionName}`, async () => {
        await assertFails(getDoc(doc(dbFor(), collectionName, id)));
      });
    }
  }

  for (const [roleName, dbFor] of [['COMPANY_ADMIN', adminA], ['FINANCE', finance]] as const) {
    for (const name of payrollScreens) {
      await runCase(`${roleName} يفتح قائمة ${name}`, async () => {
        await assertSucceeds(listByCompany(dbFor(), name, COMPANY_A));
      });
      await runCase(`${roleName} تُرفض قائمة ${name} لمنشأة أخرى`, async () => {
        await assertFails(listByCompany(dbFor(), name, COMPANY_B));
      });
    }
  }

  for (const [roleName, dbFor] of [['HR_MANAGER', hrManager], ['HR_USER', hrUser], ['EMPLOYEE', employee], ['DEPARTMENT_MANAGER', dept]] as const) {
    for (const name of payrollScreens) {
      await runCase(`${roleName} تُرفض قائمة ${name}`, async () => {
        await assertFails(listByCompany(dbFor(), name, COMPANY_A));
      });
    }
  }

  await runCase('COMPANY_ADMIN يفتح إعدادات منشأته', async () => {
    await assertSucceeds(getDoc(doc(adminA(), 'company_settings', COMPANY_A)));
  });
  await runCase('COMPANY_ADMIN تُرفض إعدادات منشأة أخرى', async () => {
    await assertFails(getDoc(doc(adminA(), 'company_settings', COMPANY_B)));
  });
  await runCase('HR_USER تُرفض إعدادات المنشأة', async () => {
    await assertFails(getDoc(doc(hrUser(), 'company_settings', COMPANY_A)));
  });
  await runCase('COMPANY_ADMIN يفتح تراخيص منشأته', async () => {
    await assertSucceeds(getDocs(query(collection(adminA(), 'companies', COMPANY_A, 'licenses'), where('companyId', '==', COMPANY_A))));
  });
  await runCase('COMPANY_ADMIN تُرفض تراخيص منشأة أخرى', async () => {
    await assertFails(getDocs(query(collection(adminA(), 'companies', COMPANY_B, 'licenses'), where('companyId', '==', COMPANY_B))));
  });
  await runCase('COMPANY_ADMIN يفتح أشهر الحضور المرحّلة', async () => {
    await assertSucceeds(getDoc(doc(adminA(), 'attendance_posted_months', COMPANY_A)));
  });
  await runCase('COMPANY_ADMIN تُرفض أشهر منشأة أخرى', async () => {
    await assertFails(getDoc(doc(adminA(), 'attendance_posted_months', COMPANY_B)));
  });
  await runCase('HR_USER يقرأ نموذج PAM', async () => {
    await assertSucceeds(getDoc(doc(hrUser(), 'platform_settings', 'pam_form_2')));
  });
  await runCase('HR_USER لا يكتب نموذج PAM', async () => {
    await assertFails(setDoc(doc(hrUser(), 'platform_settings', 'pam_form_2'), { title: 'changed' }));
  });

  const ownEmployeeList = (db: ReturnType<typeof employee>, name: string) =>
    getDocs(query(collection(db, name), where('companyId', '==', COMPANY_A), where('employeeId', '==', 'emp-own')));
  for (const name of ['leave_requests', 'documents', 'attendance_records', 'attendance']) {
    await runCase(`EMPLOYEE يفتح قائمته ${name}`, async () => {
      await assertSucceeds(ownEmployeeList(employee(), name));
    });
    await runCase(`EMPLOYEE تُرفض قائمة ${name} لمنشأة أخرى`, async () => {
      await assertFails(getDocs(query(collection(employee(), name), where('companyId', '==', COMPANY_B), where('employeeId', '==', 'emp-own'))));
    });
  }
  await runCase('EMPLOYEE تُرفض قائمة الموظفين العامة', async () => {
    await assertFails(listByCompany(employee(), 'employees', COMPANY_A));
  });
  for (const [collectionName, id] of closedDocs) {
    await runCase(`EMPLOYEE تُرفض المجموعة المغلقة ${collectionName}`, async () => {
      await assertFails(getDoc(doc(employee(), collectionName, id)));
    });
  }

  await runCase('DEPARTMENT_MANAGER يفتح حضور قسمه', async () => {
    await assertSucceeds(getDocs(query(
      collection(dept(), 'attendance'),
      where('companyId', '==', COMPANY_A),
      where('departmentId', '==', 'dept-1')
    )));
  });
  await runCase('DEPARTMENT_MANAGER تُرفض قائمة حضور المنشأة كاملة', async () => {
    await assertFails(listByCompany(dept(), 'attendance', COMPANY_A));
  });
  await runCase('DEPARTMENT_MANAGER تُرفض حضور منشأة أخرى', async () => {
    await assertFails(getDocs(query(
      collection(dept(), 'attendance'),
      where('companyId', '==', COMPANY_B),
      where('departmentId', '==', 'dept-1')
    )));
  });
  for (const [collectionName, id] of closedDocs) {
    await runCase(`DEPARTMENT_MANAGER تُرفض المجموعة المغلقة ${collectionName}`, async () => {
      await assertFails(getDoc(doc(dept(), collectionName, id)));
    });
  }

  const hrManagerNoClaim = testEnv.authenticatedContext('user-hr-manager', {
    email: 'user-hr-manager@facility.example',
    role: 'HR_MANAGER',
  }).firestore();
  await runCase('HR_MANAGER بلا claim للمنشأة يفتح الموظفين من users/{uid}', async () => {
    await assertSucceeds(listByCompany(hrManagerNoClaim, 'employees', COMPANY_A));
  });

  await testEnv.cleanup();

  const failed = results.filter((row) => row.result === 'فشلت');
  console.log('\n| الحالة | النتيجة |');
  console.log('| --- | --- |');
  for (const row of results) {
    console.log(`| ${row.name} | ${row.result} |`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} نجحت`);
  if (failed.length) {
    for (const row of failed) console.error(`FAIL ${row.name}: ${row.detail}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
