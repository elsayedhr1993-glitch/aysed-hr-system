/**
 * Emulator migration is dry-run by default and refuses a real project.
 * --scan --project <id> reads a real project and never writes.
 * --scan rejects --apply. It does not accept a service-account key file.
 *
 *   $env:FIRESTORE_EMULATOR_HOST='127.0.0.1:8080'
 *   npx tsx scripts/migrate-company-id-aliases.ts
 *   npx tsx scripts/migrate-company-id-aliases.ts --apply
 *
 *   npx tsx scripts/migrate-company-id-aliases.ts --scan --project <project-id>
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { applicationDefault, initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, type CollectionReference, type Firestore } from 'firebase-admin/firestore';
import {
  planCompanyIdFieldUpdates,
  planLegacyDocumentId,
  type CompanyIdFieldHit,
  type LegacyDocumentIdHit,
} from '../src/utils/companyIdAliases.ts';
import {
  SCAN_CREDENTIAL_HELP,
  collectAliasRows,
  formatScanTable,
  parseMigrateArgs,
  productionScanGate,
  readAdcForScan,
  safeScanError,
  scanDatabaseId,
  adcFilePath,
  type ScanCollection,
  type ScanDoc,
} from './companyIdAliasScan.ts';

const EMULATOR_PROJECT = 'demo-aysed';
const parsed = parseMigrateArgs(process.argv.slice(2));
if (!parsed.ok) {
  console.error(parsed.error);
  process.exit(1);
}
const apply = parsed.mode === 'emulator' && parsed.apply;

function isLocalHost(value: string | undefined): boolean {
  return /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(String(value || '').trim());
}

function cell(value: string): string {
  return value.replace(/\|/g, '/').trim() || '—';
}

function printFieldTable(hits: CompanyIdFieldHit[]): void {
  console.log('| المسار | الحقل | من | إلى |');
  console.log('| --- | --- | --- | --- |');
  for (const hit of hits) {
    console.log(`| ${cell(hit.path)} | ${cell(hit.field)} | ${cell(hit.from)} | ${cell(hit.to)} |`);
  }
}

function printIdTable(hits: LegacyDocumentIdHit[]): void {
  console.log('| المسار | من | إلى |');
  console.log('| --- | --- | --- |');
  for (const hit of hits) {
    console.log(`| ${cell(hit.path)} | ${cell(hit.from)} | ${cell(hit.to)} |`);
  }
}

async function confirmEmulator(): Promise<void> {
  if (!input.isTTY) {
    console.error('التطبيق يحتاج طرفية تفاعلية لكتابة demo-aysed. لم يُكتب شيء.');
    process.exit(1);
  }
  const rl = createInterface({ input, output });
  const typed = (await rl.question('اكتب demo-aysed للتأكيد: ')).trim();
  rl.close();
  if (typed !== EMULATOR_PROJECT) {
    console.error('التأكيد غير مطابق. لم يُكتب شيء.');
    process.exit(1);
  }
}

async function walkCollection(
  collectionRef: CollectionReference,
  fieldHits: CompanyIdFieldHit[],
  idHits: LegacyDocumentIdHit[]
): Promise<void> {
  const snap = await collectionRef.get();
  for (const doc of snap.docs) {
    const path = doc.ref.path;
    const idHit = planLegacyDocumentId(path, doc.id);
    if (idHit) idHits.push(idHit);
    fieldHits.push(...planCompanyIdFieldUpdates(path, doc.data()));
    const children = await doc.ref.listCollections();
    for (const child of children) {
      await walkCollection(child, fieldHits, idHits);
    }
  }
}

async function scan(db: Firestore): Promise<{ fieldHits: CompanyIdFieldHit[]; idHits: LegacyDocumentIdHit[] }> {
  const fieldHits: CompanyIdFieldHit[] = [];
  const idHits: LegacyDocumentIdHit[] = [];
  const roots = await db.listCollections();
  for (const root of roots) {
    await walkCollection(root, fieldHits, idHits);
  }
  fieldHits.sort((a, b) => a.path.localeCompare(b.path) || a.field.localeCompare(b.field));
  idHits.sort((a, b) => a.path.localeCompare(b.path));
  return { fieldHits, idHits };
}

async function applyFieldHits(db: Firestore, hits: CompanyIdFieldHit[]): Promise<number> {
  const byPath = new Map<string, Record<string, string>>();
  for (const hit of hits) {
    const patch = byPath.get(hit.path) || {};
    patch[hit.field] = hit.to;
    byPath.set(hit.path, patch);
  }
  const entries = [...byPath.entries()];
  let written = 0;
  for (let i = 0; i < entries.length; i += 400) {
    const batch = db.batch();
    for (const [path, patch] of entries.slice(i, i + 400)) {
      batch.set(db.doc(path), patch, { merge: true });
    }
    await batch.commit();
    written += Math.min(400, entries.length - i);
  }
  return written;
}

function asScanCollection(collectionRef: CollectionReference): ScanCollection {
  return {
    async get() {
      const snap = await collectionRef.get();
      const docs: ScanDoc[] = snap.docs.map((doc) => ({
        id: doc.id,
        path: doc.ref.path,
        data: () => doc.data() as Record<string, unknown>,
        async collections() {
          const children = await doc.ref.listCollections();
          return children.map(asScanCollection);
        },
      }));
      return { docs };
    },
  };
}

async function runProductionScan(projectId: string): Promise<void> {
  const adc = readAdcForScan(process.env);
  const gate = productionScanGate({
    env: process.env,
    adcText: adc.text,
    adcFileExists: adc.exists,
  });
  if (!gate.ok) {
    console.error(gate.message);
    process.exit(1);
  }
  let configText: string | undefined;
  try {
    configText = readFileSync(join(process.cwd(), 'firebase-applet-config.json'), 'utf8');
  } catch {
    configText = undefined;
  }
  const databaseId = scanDatabaseId(process.env, configText);
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId });
  const db = getFirestore(app, databaseId);
  const roots = await db.listCollections();
  const rows = await collectAliasRows(roots.map(asScanCollection));
  console.log(`المشروع: ${projectId}`);
  console.log(`قاعدة البيانات: ${databaseId}`);
  console.log(`بيانات الاعتماد: ${adcFilePath()} (حساب مستخدم، قراءة فقط)`);
  console.log('الوضع: scan (قراءة فقط، بلا كتابة)');
  console.log('');
  if (rows.length === 0) console.log('لا مجموعات.');
  else console.log(formatScanTable(rows));
  console.log('');
  console.log('لم يُكتب شيء.');
}

async function main(): Promise<void> {
  if (parsed.mode === 'scan') {
    await runProductionScan(parsed.projectId);
    return;
  }

  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
  if (!isLocalHost(firestoreHost)) {
    console.error('رفض: اضبط FIRESTORE_EMULATOR_HOST على 127.0.0.1:8080. السكربت لا يتصل بمشروع حقيقي. لم يُفتح اتصال.');
    process.exit(1);
  }

  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;

  if (getApps().length === 0) {
    initializeApp({ projectId: EMULATOR_PROJECT });
  }
  const db = getFirestore();
  const { fieldHits, idHits } = await scan(db);

  console.log(`المشروع: ${EMULATOR_PROJECT}`);
  console.log(`المضيف: ${firestoreHost}`);
  console.log(apply ? 'الوضع: تطبيق على المحاكي بعد تأكيد demo-aysed' : 'الوضع: dry-run (قراءة فقط، بلا كتابة)');
  console.log('');
  console.log('حقول ستُوحَّد:');
  if (fieldHits.length === 0) console.log('لا حقول بمعرّف قديم.');
  else printFieldTable(fieldHits);
  console.log('');
  console.log('معرّفات وثائق قديمة (تُطبع ولا تُنقل):');
  if (idHits.length === 0) console.log('لا معرّفات وثائق قديمة.');
  else printIdTable(idHits);
  console.log('');
  console.log(`${fieldHits.length} حقل. ${idHits.length} معرّف وثيقة لن يُنقل.`);

  if (!apply) {
    console.log('لم يُكتب شيء.');
    return;
  }

  await confirmEmulator();
  const written = await applyFieldHits(db, fieldHits);
  console.log(`كُتبت حقول ${written} وثيقة على محاكي ${EMULATOR_PROJECT}. معرّفات الوثائق لم تُنقل.`);
}

main().catch((error) => {
  if (parsed.mode === 'scan') {
    console.error(SCAN_CREDENTIAL_HELP);
    console.error(safeScanError(error));
  } else {
    console.error(error instanceof Error ? error.message : 'فشل ترحيل companyId');
  }
  process.exit(1);
});
