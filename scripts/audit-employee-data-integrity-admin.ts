/**
 * Cross-tenant employee data integrity audit (Firestore Admin).
 * Usage: npx tsx scripts/audit-employee-data-integrity-admin.ts
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { normalizeTenantCompanyId, tenantCompanyIdsMatch } from '../src/utils/contractTenantRules.ts';

function normCivil(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '').trim();
}

function normEmail(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

function normIban(v: unknown): string {
  return String(v ?? '').replace(/\s/g, '').toUpperCase();
}

function pickName(data: Record<string, unknown>): string {
  return String(data.fullNameAr ?? data.nameAr ?? data.name ?? '');
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const [empSnap, contractSnap] = await Promise.all([
    db.collection('employees').get(),
    db.collection('contracts').get(),
  ]);

  const employees = empSnap.docs.map((d) => ({
    id: d.id,
    data: d.data() as Record<string, unknown>,
  }));

  const contracts = contractSnap.docs.map((d) => ({
    id: d.id,
    data: d.data() as Record<string, unknown>,
  }));

  const civilDupes: Array<{ civilId: string; rows: Array<{ id: string; companyId: string; name: string }> }> = [];
  const byCivil = new Map<string, Array<{ id: string; companyId: string; name: string }>>();
  for (const { id, data } of employees) {
    const civil = normCivil(data.civilId ?? data.civil_id ?? data.civil_id_number);
    if (!civil) continue;
    const row = {
      id,
      companyId: String(data.companyId ?? data.company_id ?? ''),
      name: pickName(data),
    };
    const list = byCivil.get(civil) || [];
    list.push(row);
    byCivil.set(civil, list);
  }
  for (const [civil, rows] of byCivil) {
    if (rows.length > 1) civilDupes.push({ civilId: civil, rows });
  }

  const idDupes: Array<{ employeeDocId: string; companies: string[]; names: string[] }> = [];
  const byDocId = new Map<string, Array<{ companyId: string; name: string }>>();
  for (const { id, data } of employees) {
    const list = byDocId.get(id) || [];
    list.push({
      companyId: String(data.companyId ?? data.company_id ?? ''),
      name: pickName(data),
    });
    byDocId.set(id, list);
  }
  for (const [docId, rows] of byDocId) {
    const companies = [...new Set(rows.map((r) => normalizeTenantCompanyId(r.companyId)).filter(Boolean))];
    if (companies.length > 1) {
      idDupes.push({ employeeDocId: docId, companies, names: rows.map((r) => r.name) });
    }
  }

  const sharedEmpIdAcrossTenants: Array<{
    employeeId: string;
    employeeDocs: Array<{ docId: string; companyId: string; name: string; civilId: string }>;
    contracts: Array<{ contractId: string; companyId: string; employeeName: string }>;
  }> = [];

  const empIdToDocs = new Map<string, Array<{ docId: string; companyId: string; name: string; civilId: string }>>();
  for (const { id, data } of employees) {
    const key = id;
    const list = empIdToDocs.get(key) || [];
    list.push({
      docId: id,
      companyId: String(data.companyId ?? data.company_id ?? ''),
      name: pickName(data),
      civilId: normCivil(data.civilId),
    });
    empIdToDocs.set(key, list);
  }

  const empIdToContracts = new Map<string, Array<{ contractId: string; companyId: string; employeeName: string }>>();
  for (const { id, data } of contracts) {
    const eid = String(data.employeeId ?? '').trim();
    if (!eid) continue;
    const list = empIdToContracts.get(eid) || [];
    list.push({
      contractId: id,
      companyId: String(data.companyId ?? ''),
      employeeName: String(data.employeeName ?? ''),
    });
    empIdToContracts.set(eid, list);
  }

  for (const [employeeId, docs] of empIdToDocs) {
    const tenantSet = new Set(docs.map((d) => normalizeTenantCompanyId(d.companyId)).filter(Boolean));
    const con = empIdToContracts.get(employeeId) || [];
    const contractTenants = new Set(con.map((c) => normalizeTenantCompanyId(c.companyId)).filter(Boolean));
    const allTenants = new Set([...tenantSet, ...contractTenants]);
    if (allTenants.size > 1 || (con.length > 0 && tenantSet.size === 1 && contractTenants.size > 1)) {
      const mismatchContractOnly =
        tenantSet.size === 1 &&
        contractTenants.size > 1 &&
        [...contractTenants].some((t) => !tenantCompanyIdsMatch(t, [...tenantSet][0]));
      const mismatchEmployee =
        tenantSet.size > 1 ||
        (docs.length === 1 &&
          con.some((c) => !tenantCompanyIdsMatch(c.companyId, docs[0].companyId)));
      if (mismatchContractOnly || mismatchEmployee || tenantSet.size > 1) {
        sharedEmpIdAcrossTenants.push({
          employeeId,
          employeeDocs: docs,
          contracts: con,
        });
      }
    }
  }

  const ibanDupes: Array<{ iban: string; rows: Array<{ id: string; companyId: string; name: string }> }> = [];
  const byIban = new Map<string, Array<{ id: string; companyId: string; name: string }>>();
  for (const { id, data } of employees) {
    const iban = normIban(data.iban ?? data.bankIban ?? data.bank_iban);
    if (!iban || iban.includes('PENDING')) continue;
    const row = { id, companyId: String(data.companyId ?? ''), name: pickName(data) };
    const list = byIban.get(iban) || [];
    list.push(row);
    byIban.set(iban, list);
  }
  for (const [iban, rows] of byIban) {
    const globalDup = rows.length > 1;
    const perCompany = new Map<string, number>();
    for (const r of rows) {
      const co = normalizeTenantCompanyId(r.companyId);
      perCompany.set(co, (perCompany.get(co) || 0) + 1);
    }
    const withinCompanyDup = [...perCompany.values()].some((n) => n > 1);
    if (globalDup || withinCompanyDup) ibanDupes.push({ iban, rows });
  }

  const emailDupes: Array<{ email: string; rows: Array<{ id: string; companyId: string; name: string }> }> = [];
  const byEmail = new Map<string, Array<{ id: string; companyId: string; name: string }>>();
  for (const { id, data } of employees) {
    for (const field of ['email', 'workEmail']) {
      const email = normEmail(data[field]);
      if (!email || !email.includes('@')) continue;
      const row = { id, companyId: String(data.companyId ?? ''), name: pickName(data) };
      const list = byEmail.get(email) || [];
      if (!list.some((x) => x.id === id)) list.push(row);
      byEmail.set(email, list);
    }
  }
  for (const [email, rows] of byEmail) {
    if (rows.length > 1) emailDupes.push({ email, rows });
  }

  const contractCompanyMismatches: Array<{
    employeeId: string;
    employeeCompanyId: string;
    contractId: string;
    contractCompanyId: string;
    employeeName: string;
  }> = [];

  const employeeById = new Map(employees.map((e) => [e.id, e]));

  for (const { id: contractId, data } of contracts) {
    const employeeId = String(data.employeeId ?? '').trim();
    if (!employeeId) continue;
    const emp = employeeById.get(employeeId);
    if (!emp) continue;
    const empCo = normalizeTenantCompanyId(String(emp.data.companyId ?? emp.data.company_id ?? ''));
    const conCo = normalizeTenantCompanyId(String(data.companyId ?? ''));
    if (!empCo || !conCo) continue;
    if (!tenantCompanyIdsMatch(empCo, conCo)) {
      contractCompanyMismatches.push({
        employeeId,
        employeeCompanyId: empCo,
        contractId,
        contractCompanyId: conCo,
        employeeName: pickName(emp.data),
      });
    }
  }

  const orphanContracts = contracts
    .filter((c) => {
      const eid = String(c.data.employeeId ?? '').trim();
      return eid && !employeeById.has(eid);
    })
    .map((c) => ({
      contractId: c.id,
      employeeId: String(c.data.employeeId),
      companyId: String(c.data.companyId ?? ''),
      employeeName: String(c.data.employeeName ?? ''),
    }));

  const issues = {
    civilIdDuplicates: civilDupes,
    employeeDocIdMultiTenant: idDupes,
    employeeIdSharedAcrossTenants: sharedEmpIdAcrossTenants,
    ibanDuplicates: ibanDupes,
    emailDuplicates: emailDupes,
    employeeContractCompanyMismatch: contractCompanyMismatches,
    orphanContracts,
  };

  const issueCount =
    civilDupes.length +
    idDupes.length +
    sharedEmpIdAcrossTenants.length +
    ibanDupes.length +
    emailDupes.length +
    contractCompanyMismatches.length +
    orphanContracts.length;

  const summary = {
    auditedAt: new Date().toISOString(),
    totalEmployees: employees.length,
    totalContracts: contracts.length,
    issueCount,
    clean: issueCount === 0,
    companiesRepresented: [
      ...new Set(employees.map((e) => normalizeTenantCompanyId(String(e.data.companyId ?? ''))).filter(Boolean)),
    ].sort(),
  };

  console.log(JSON.stringify({ summary, issues }, null, 2));
  if (!summary.clean) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
