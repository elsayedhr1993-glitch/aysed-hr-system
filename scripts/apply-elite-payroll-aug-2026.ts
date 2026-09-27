/**
 * Apply Elite Clinic payroll (Aug 2026) basic + allowances from PDF extract.
 * Source: كشف رواتب ايليت اغسطس 2026.pdf
 * Usage: npx tsx scripts/apply-elite-payroll-aug-2026.ts [--dry-run]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const COMPANY_ID = 'comp-1788435917695';
const dryRun = process.argv.includes('--dry-run');
const PAYROLL_NOTE = 'كشف رواتب إيليت كلينك — أغسطس 2026 (أساسي + بدلات)';

type PayrollRow = {
  /** Match key: civil ID when known */
  civilId?: string;
  /** Fallback: substring of fullNameAr on sheet */
  nameHint?: string;
  basic: number;
  otherAllowance: number;
  total: number;
  sheetName: string;
};

/** Parsed from PDF text (المستحقات column → otherAllowance). */
const PAYROLL: PayrollRow[] = [
  { nameHint: 'جنسي جورج', basic: 390, otherAllowance: 40, total: 430, sheetName: 'جنسي جورج' },
  { civilId: '296010404928', basic: 270, otherAllowance: 0, total: 270, sheetName: 'كيرانماى ادارا' },
  { civilId: '288020400824', basic: 390, otherAllowance: 30, total: 420, sheetName: 'سعود طعمه عساكره' },
  { nameHint: 'فؤاد نصر عبد الكريم', basic: 300, otherAllowance: 0, total: 300, sheetName: 'فؤاد نصر عبد الكريم' },
  { civilId: '287112405388', basic: 315, otherAllowance: 0, total: 315, sheetName: 'ستيلا سانشيز سامباس' },
  { civilId: '290072703723', basic: 375, otherAllowance: 0, total: 375, sheetName: 'جوليا نيسا سانشيز' },
  { civilId: '294090902193', basic: 250, otherAllowance: 0, total: 250, sheetName: 'ريومارى جوي دونيسيا سانشيز' },
  { civilId: '286102015533', basic: 140, otherAllowance: 25, total: 165, sheetName: 'الفيال اريسينو بليناردو' },
  { civilId: '283102704941', basic: 470, otherAllowance: 0, total: 470, sheetName: 'ريميا ماناليل ماثيو' },
  { civilId: '277012405226', basic: 350, otherAllowance: 0, total: 350, sheetName: 'مارسيل بالتيبات ماتامبالى' },
  { civilId: '279070302646', basic: 400, otherAllowance: 0, total: 400, sheetName: 'بارعة عبدهللا قصير' },
  { civilId: '283060402127', basic: 300, otherAllowance: 0, total: 300, sheetName: 'مريم رياض مرزوق' },
  { civilId: '286040409085', basic: 250, otherAllowance: 0, total: 250, sheetName: 'جيجي فارجيس' },
  { civilId: '289112106176', basic: 380, otherAllowance: 50, total: 430, sheetName: 'دينا ماريا ديسوزا' },
  { nameHint: 'يوليا روسو شينكو', basic: 650, otherAllowance: 0, total: 650, sheetName: 'يوليا روسو شينكو' },
  { civilId: '297070500916', basic: 400, otherAllowance: 0, total: 400, sheetName: 'ايه ماجد الصمد' },
  { civilId: '274110503387', basic: 600, otherAllowance: 0, total: 600, sheetName: 'فاديا عمر يوسف' },
  { civilId: '284021507254', basic: 480, otherAllowance: 0, total: 480, sheetName: 'شيمول فيدهيانان دهار' },
  { civilId: '283021207281', basic: 200, otherAllowance: 0, total: 200, sheetName: 'سوجاتا بيساال جوندا' },
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
    const housingAllowance = 0;
    const transportAllowance = 0;
    const medicalAllowance = 0;
    const allowances = otherAllowance;
    const totalSalary = row.total;
    const hasAllowances = allowances > 0;
    const salaryPackageType = hasAllowances ? 'FIXED_WITH_ALLOWANCES' : 'FIXED_NO_ALLOWANCES';

    const patch = {
      basicSalary,
      contractSalary: basicSalary,
      housingAllowance,
      transportAllowance,
      medicalAllowance,
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
            housingAllowance,
            transportAllowance,
            medicalAllowance,
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

  const onSheet = PAYROLL.length;
  const updated = results.filter((r) => r.status === 'updated' || r.status === 'would_update').length;
  const notFound = results.filter((r) => r.status === 'not_found');

  console.log(
    JSON.stringify(
      {
        companyId: COMPANY_ID,
        dryRun,
        onSheet,
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
