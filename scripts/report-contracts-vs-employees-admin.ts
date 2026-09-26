/**
 * Compare contract doc counts vs employee counts per company.
 * Usage: npx tsx scripts/report-contracts-vs-employees-admin.ts
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const [contractSnap, employeeSnap] = await Promise.all([
    db.collection('contracts').get(),
    db.collection('employees').get(),
  ]);

  const contractsByCompany = new Map<string, number>();
  const dupByEmployee = new Map<string, string[]>();

  for (const doc of contractSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const companyId = String(data.companyId || '').trim();
    if (!companyId) continue;
    contractsByCompany.set(companyId, (contractsByCompany.get(companyId) || 0) + 1);

    const employeeId = String(data.employeeId || '').trim();
    if (!employeeId) continue;
    const key = `${companyId}::${employeeId}`;
    const ids = dupByEmployee.get(key) || [];
    ids.push(doc.id);
    dupByEmployee.set(key, ids);
  }

  const employeesByCompany = new Map<string, number>();
  for (const doc of employeeSnap.docs) {
    const companyId = String(doc.data().companyId || '').trim();
    if (!companyId) continue;
    employeesByCompany.set(companyId, (employeesByCompany.get(companyId) || 0) + 1);
  }

  const companyIds = new Set([...contractsByCompany.keys(), ...employeesByCompany.keys()]);
  const rows = [...companyIds].sort().map((companyId) => ({
    companyId,
    employees: employeesByCompany.get(companyId) || 0,
    contracts: contractsByCompany.get(companyId) || 0,
    deltaContractsMinusEmployees:
      (contractsByCompany.get(companyId) || 0) - (employeesByCompany.get(companyId) || 0),
  }));

  const duplicateGroups = [...dupByEmployee.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, ids]) => ({ key, docIds: ids }));

  console.log(
    JSON.stringify(
      {
        totalContractDocs: contractSnap.size,
        totalEmployees: employeeSnap.size,
        perCompany: rows,
        duplicateEmployeeContractGroups: duplicateGroups.length,
        duplicateExamples: duplicateGroups.slice(0, 10),
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
