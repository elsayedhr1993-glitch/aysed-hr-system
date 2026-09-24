/**
 * Lists employees that share the same civil ID across multiple companyId values.
 * Usage: npx tsx scripts/audit-employee-civil-duplicates.ts [civilIdOrNameSubstring]
 */
import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadServiceAccount(): Record<string, unknown> | null {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envJson) {
    try {
      return JSON.parse(envJson) as Record<string, unknown>;
    } catch {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
      return null;
    }
  }
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  const candidates = [
    resolve(process.cwd(), 'firebase-service-account.json'),
    resolve(process.cwd(), 'service-account.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
    }
  }
  return null;
}

function normalizeCivil(value: unknown): string {
  return String(value || '').replace(/\D/g, '').trim();
}

function pickCivil(data: Record<string, unknown>): string {
  return normalizeCivil(
    data.civilId ?? data.civil_id ?? data.civil_id_number ?? (data.raw_payload as any)?.civilId
  );
}

function pickName(data: Record<string, unknown>): string {
  return String(
    data.fullNameAr ?? data.full_name_ar ?? data.nameAr ?? data.name ?? (data.raw_payload as any)?.fullNameAr ?? ''
  );
}

async function main() {
  const filterArg = process.argv[2]?.trim();
  const sa = loadServiceAccount();
  if (!sa) {
    console.error('Set FIREBASE_SERVICE_ACCOUNT or place firebase-service-account.json in project root.');
    process.exit(1);
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(sa as any) });
  }
  const db = getFirestore();
  const snap = await db.collection('employees').get();

  const byCivil = new Map<string, Array<{ id: string; companyId: string; name: string }>>();

  snap.docs.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    const civil = pickCivil(data);
    if (!civil) return;
    const name = pickName(data);
    if (filterArg && !name.includes(filterArg) && !civil.includes(filterArg.replace(/\D/g, ''))) {
      return;
    }
    const companyId = String(data.companyId ?? data.company_id ?? '');
    const list = byCivil.get(civil) || [];
    list.push({ id: d.id, companyId, name });
    byCivil.set(civil, list);
  });

  const duplicates = [...byCivil.entries()].filter(([, rows]) => {
    const companies = new Set(rows.map((r) => r.companyId).filter(Boolean));
    return companies.size > 1;
  });

  if (duplicates.length === 0) {
    console.log('No cross-company civil ID duplicates found' + (filterArg ? ` for filter "${filterArg}"` : ''));
    return;
  }

  console.log(`Found ${duplicates.length} civil ID(s) registered in multiple companies:\n`);
  for (const [civil, rows] of duplicates) {
    console.log(`Civil ID: ${civil}`);
    rows.forEach((r) => console.log(`  - ${r.name} | companyId=${r.companyId || '(missing)'} | doc=${r.id}`));
    console.log('');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
