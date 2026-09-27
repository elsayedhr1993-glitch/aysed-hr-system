/**
 * Apply Al-Fanar Clinic payroll (Aug 2026) basic + allowances from PDF extract.
 * Usage: npx tsx scripts/apply-fanar-payroll-aug-2026.ts [--dry-run]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'tenant_1788413304890';
const dryRun = process.argv.includes('--dry-run');
const PAYROLL_NOTE = 'كشف رواتب الفنار كلينك — أغسطس 2026 (أساسي + بدلات)';

type PayrollRow = {
  civilId?: string;
  nameHint?: string;
  basic: number;
  otherAllowance: number;
  total: number;
  sheetName: string;
};

const PAYROLL: PayrollRow[] = [
  { civilId: '288051200526', basic: 800, otherAllowance: 0, total: 800, sheetName: 'يوسف اسماعيل الموسوى' },
  { nameHint: 'كريم بخش رحيم', basic: 350, otherAllowance: 0, total: 350, sheetName: 'كريم بخش رحيم بخش' },
  { civilId: '271031803345', basic: 2000, otherAllowance: 0, total: 2000, sheetName: 'حنان محمد ابوالغيط' },
  { civilId: '273082305011', basic: 1000, otherAllowance: 0, total: 1000, sheetName: 'داني نصر' },
  { civilId: '288081511966', basic: 400, otherAllowance: 0, total: 400, sheetName: 'ليلي كمال محفوظ' },
  { civilId: '280060201946', basic: 400, otherAllowance: 0, total: 400, sheetName: 'بريسا فاخر عساكره' },
  { civilId: '289090601431', basic: 380, otherAllowance: 40, total: 420, sheetName: 'رغده نواف محمد الحلو' },
  { civilId: '288041705707', basic: 295, otherAllowance: 0, total: 295, sheetName: 'انجليكا الزليتا سلبنتان' },
  { civilId: '291031105115', basic: 220, otherAllowance: 0, total: 220, sheetName: 'كاميلى ان كويزون بيلوسو' },
  { civilId: '297052204152', basic: 150, otherAllowance: 0, total: 150, sheetName: 'روز مارى كيودياميسيريل' },
  { civilId: '290111708122', basic: 150, otherAllowance: 0, total: 150, sheetName: 'بليسمول ثيبرامبيل جوزيف' },
  { civilId: '286070805556', basic: 200, otherAllowance: 25, total: 225, sheetName: 'ماريروز نافارو باهيت' },
  { civilId: '282100305512', basic: 370, otherAllowance: 0, total: 370, sheetName: 'كاوينا ناديسان تيرونونى' },
  { civilId: '287042104562', basic: 415, otherAllowance: 0, total: 415, sheetName: 'بليسى ماثيو باولوسى' },
  { civilId: '288080707852', basic: 390, otherAllowance: 0, total: 390, sheetName: 'بريانكا راتنيش' },
  { civilId: '288111511327', basic: 270, otherAllowance: 0, total: 270, sheetName: 'سونيا باول' },
  { nameHint: 'الفونسا سيباستيان', basic: 270, otherAllowance: 0, total: 270, sheetName: 'الفونسا سيباستيان' },
  { civilId: '274050604257', basic: 280, otherAllowance: 0, total: 280, sheetName: 'حبيب خان الل خان' },
  { civilId: '277070703475', basic: 230, otherAllowance: 0, total: 230, sheetName: 'محمد اسماعيل' },
  { civilId: '281072702865', basic: 320, otherAllowance: 0, total: 320, sheetName: 'عبد الوهاب طارق نزير' },
  { civilId: '297010105981', basic: 400, otherAllowance: 0, total: 400, sheetName: 'احمد رحيم بخش' },
  { civilId: '284041007804', basic: 260, otherAllowance: 0, total: 260, sheetName: 'محمد حسن' },
  { civilId: '295041007306', basic: 140, otherAllowance: 0, total: 140, sheetName: 'اسيا صديق' },
  { civilId: '301042503537', basic: 135, otherAllowance: 0, total: 135, sheetName: 'اريا مينى' },
  { civilId: '297052007466', basic: 135, otherAllowance: 0, total: 135, sheetName: 'راجى راجو سوما' },
  { civilId: '298021703906', basic: 135, otherAllowance: 0, total: 135, sheetName: 'برافينا براسنان' },
  { nameHint: 'صغرا خسرو', basic: 150, otherAllowance: 0, total: 150, sheetName: 'صغرا خسرو اميري' },
  { nameHint: 'فاتن غالب', basic: 150, otherAllowance: 0, total: 150, sheetName: 'فاتن غالب بندر' },
];

function normName(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase();
}

function findEmployee(
  byCivil: Map<string, { id: string; name: string }>,
  byName: { id: string; name: string; norm: string }[],
  row: PayrollRow
): { id: string; name: string } | null {
  if (row.civilId && byCivil.has(row.civilId)) {
    return byCivil.get(row.civilId)!;
  }
  if (row.nameHint) {
    const hint = normName(row.nameHint);
    const hit = byName.find((e) => e.norm.includes(hint) || hint.includes(e.norm));
    if (hit) return { id: hit.id, name: hit.name };
  }
  return null;
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const snap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  const byCivil = new Map<string, { id: string; name: string }>();
  const byName: { id: string; name: string; norm: string }[] = [];
  for (const doc of snap.docs) {
    const e = doc.data();
    const name = String(e.fullNameAr || e.nameAr || '');
    const civil = String(e.civilId || '').replace(/\D/g, '');
    if (civil) byCivil.set(civil, { id: doc.id, name });
    byName.push({ id: doc.id, name, norm: normName(name) });
  }

  const now = new Date().toISOString();
  const results: Record<string, unknown>[] = [];

  for (const row of PAYROLL) {
    const emp = findEmployee(byCivil, byName, row);
    if (!emp) {
      results.push({ status: 'not_found', sheetName: row.sheetName, row });
      continue;
    }

    const basicSalary = row.basic;
    const otherAllowance = row.otherAllowance;
    const allowances = otherAllowance;
    const totalSalary = row.total;
    const hasAllowances = allowances > 0;
    const salaryPackageType = hasAllowances ? 'FIXED_WITH_ALLOWANCES' : 'FIXED_NO_ALLOWANCES';

    const patch = {
      basicSalary,
      contractSalary: basicSalary,
      housingAllowance: 0,
      transportAllowance: 0,
      medicalAllowance: 0,
      otherAllowance,
      otherAllowances: otherAllowance,
      allowances,
      hasAllowances,
      salaryPackageType,
      totalSalary,
      salary: totalSalary,
      payrollNotes: PAYROLL_NOTE,
      updatedAt: now,
    };

    if (!dryRun) {
      await db.collection('employees').doc(emp.id).set(patch, { merge: true });
      const contractId = `contract-${COMPANY_ID}-${emp.id}`;
      const contractRef = db.collection('contracts').doc(contractId);
      if ((await contractRef.get()).exists) {
        await contractRef.set(
          {
            basicSalary,
            housingAllowance: 0,
            transportAllowance: 0,
            medicalAllowance: 0,
            otherAllowance,
            hasAllowances,
            salaryPackageType,
            updatedAt: now,
          },
          { merge: true }
        );
      }
    }

    results.push({
      status: dryRun ? 'would_update' : 'updated',
      employeeId: emp.id,
      name: emp.name,
      sheetName: row.sheetName,
      basicSalary,
      otherAllowance,
      totalSalary,
    });
  }

  const updated = results.filter((r) => r.status === 'updated' || r.status === 'would_update').length;
  const notFound = results.filter((r) => r.status === 'not_found');

  console.log(
    JSON.stringify(
      {
        companyId: COMPANY_ID,
        dryRun,
        onSheet: PAYROLL.length,
        fanarEmployeesInDb: snap.size,
        updated,
        notFound,
        results,
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
