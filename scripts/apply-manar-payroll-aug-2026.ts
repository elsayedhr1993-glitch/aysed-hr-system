/**
 * Apply Manar Clinic payroll (Aug 2026) basic + allowances from PDF extract.
 * Usage: npx tsx scripts/apply-manar-payroll-aug-2026.ts [--dry-run]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788442584841';
const dryRun = process.argv.includes('--dry-run');
const PAYROLL_NOTE = 'كشف رواتب المنار كلينك — أغسطس 2026 (أساسي + بدلات)';

type PayrollRow = {
  civilId?: string;
  nameHint?: string;
  basic: number;
  otherAllowance: number;
  total: number;
  sheetName: string;
};

const PAYROLL: PayrollRow[] = [
  { civilId: '265082400641', basic: 1500, otherAllowance: 0, total: 1500, sheetName: 'نادية رابح الرشيدى' },
  { nameHint: 'كريم بخش رحيم', basic: 1050, otherAllowance: 0, total: 1050, sheetName: 'كريم بخش رحيم بخش' },
  { civilId: '284082903269', basic: 800, otherAllowance: 0, total: 800, sheetName: 'فؤاد نصر الحجوج' },
  { civilId: '293080106877', basic: 400, otherAllowance: 0, total: 400, sheetName: 'السيد بخيت السيد' },
  { civilId: '291071401218', basic: 570, otherAllowance: 30, total: 600, sheetName: 'احمد حسين ورودي' },
  { nameHint: 'اصف بشير', basic: 550, otherAllowance: 30, total: 580, sheetName: 'اصف بشير بتى' },
  { civilId: '296052502462', basic: 160, otherAllowance: 0, total: 160, sheetName: 'محمد شاجور حسين' },
  { civilId: '290092009835', basic: 130, otherAllowance: 0, total: 130, sheetName: 'برييتا بابو' },
  { civilId: '281060709226', basic: 145, otherAllowance: 25, total: 170, sheetName: 'انا بيلى اوبين ميالندريس' },
  { civilId: '283061801226', basic: 580, otherAllowance: 0, total: 580, sheetName: 'فاطمه احمد بالرشيد' },
  { civilId: '297062304595', basic: 150, otherAllowance: 0, total: 150, sheetName: 'سيلفا راجو' },
  { civilId: '285053007427', basic: 465, otherAllowance: 0, total: 465, sheetName: 'شيبى سباستيان' },
  { civilId: '295021105486', basic: 150, otherAllowance: 0, total: 150, sheetName: 'جانجامول ماداثيلفيلي' },
  { civilId: '287123003982', basic: 500, otherAllowance: 0, total: 500, sheetName: 'نيمى سباستيان توماس' },
  { civilId: '285121004384', basic: 420, otherAllowance: 0, total: 420, sheetName: 'ليزل دونيسيا' },
  { civilId: '281052307606', basic: 2870, otherAllowance: 330, total: 3200, sheetName: 'عمار محمد بنى فواز' },
  { civilId: '291010115613', basic: 360, otherAllowance: 25, total: 385, sheetName: 'منال صبحى الريس' },
  { civilId: '280030604437', basic: 190, otherAllowance: 0, total: 190, sheetName: 'نيلوكا شاندانى' },
  { nameHint: 'مرجة اصغرى', basic: 120, otherAllowance: 0, total: 120, sheetName: 'مرجة اصغرى طيبجى' },
  { nameHint: 'هناء بن الصغير', basic: 600, otherAllowance: 0, total: 600, sheetName: 'هناء بن الصغير' },
  { civilId: '291101105015', basic: 270, otherAllowance: 0, total: 270, sheetName: 'الفونسا سباستيان' },
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
        manarEmployeesInDb: snap.size,
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
