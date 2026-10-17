/**
 * Read-only production scan helpers. They do not open a connection and
 * they do not write. The script refuses --apply together with --scan.
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { COMPANY_ID_FIELDS, planCompanyIdFieldUpdates } from '../src/utils/companyIdAliases.ts';

export const SCAN_CREDENTIAL_HELP = [
  'توقف: المسح لا يقبل ملف مفتاح، ولا يفتح اتصالاً بلا قراءة مفوّضة.',
  'وفّر القراءة فقط دون لصق المفتاح في الطرفية أو المحادثة أو المستودع أو أي متغير بيئة:',
  '1. أزل GOOGLE_APPLICATION_CREDENTIALS وFIREBASE_SERVICE_ACCOUNT وFIREBASE_PRIVATE_KEY وFIREBASE_CLIENT_EMAIL من البيئة.',
  '2. امنح حساب Google دور Cloud Datastore Viewer (roles/datastore.viewer) على المشروع، وهو قراءة فقط.',
  '3. من ذلك الحساب نفّذ: gcloud auth application-default login',
  '4. أعد الأمر: npx tsx scripts/migrate-company-id-aliases.ts --scan --project <project-id>',
  'لا تستخدم --apply مع --scan. المسح لا يكتب.',
].join('\n');

export type MigrateArgs =
  | { ok: true; mode: 'emulator'; apply: boolean }
  | { ok: true; mode: 'scan'; projectId: string }
  | { ok: false; error: string };

export function parseMigrateArgs(argv: string[]): MigrateArgs {
  let apply = false;
  let scan = false;
  let projectId = '';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') apply = false;
    else if (arg === '--apply') apply = true;
    else if (arg === '--scan') scan = true;
    else if (arg === '--project') {
      projectId = String(argv[i + 1] || '').trim();
      i += 1;
      if (!projectId || projectId.startsWith('--')) {
        return { ok: false, error: 'المسح يحتاج --project <معرّف>. لم يُفتح اتصال.' };
      }
    } else if (arg.startsWith('--project=')) {
      projectId = arg.slice('--project='.length).trim();
      if (!projectId) return { ok: false, error: 'المسح يحتاج --project <معرّف>. لم يُفتح اتصال.' };
    } else {
      return { ok: false, error: `خيار غير معروف: ${arg}. لم يُفتح اتصال.` };
    }
  }

  if (scan && apply) {
    return { ok: false, error: 'لا يجتمع --scan مع --apply. المسح قراءة فقط ولم يُفتح اتصال.' };
  }
  if (!scan && apply && argv.includes('--dry-run')) {
    return { ok: false, error: 'لا يجتمع --apply مع --dry-run. لم يُكتب شيء.' };
  }
  if (scan) {
    if (!projectId) return { ok: false, error: 'المسح يحتاج --project <معرّف>. لم يُفتح اتصال.' };
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
      return { ok: false, error: 'معرّف المشروع غير صالح. لم يُفتح اتصال.' };
    }
    return { ok: true, mode: 'scan', projectId };
  }
  if (projectId) {
    return { ok: false, error: 'رفض: بدون --scan لا يُقبل --project. المحاكي المحلي demo-aysed فقط. لم يُفتح اتصال.' };
  }
  return { ok: true, mode: 'emulator', apply };
}

export function adcFilePath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.CLOUDSDK_CONFIG) return join(env.CLOUDSDK_CONFIG, 'application_default_credentials.json');
  if (process.platform === 'win32') {
    const appData = env.APPDATA || join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'gcloud', 'application_default_credentials.json');
  }
  return join(homedir(), '.config', 'gcloud', 'application_default_credentials.json');
}

export function adcCredentialKind(raw: string | undefined): 'authorized_user' | 'service_account' | 'absent' | 'unknown' {
  if (!raw || !raw.trim()) return 'absent';
  try {
    const parsed = JSON.parse(raw) as { type?: unknown };
    if (parsed.type === 'authorized_user') return 'authorized_user';
    if (parsed.type === 'service_account') return 'service_account';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

export function productionScanGate(input: {
  env: NodeJS.ProcessEnv;
  adcText?: string;
  adcFileExists: boolean;
}): { ok: true } | { ok: false; message: string } {
  const env = input.env;
  if (env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST) {
    return {
      ok: false,
      message: `توقف: أزل FIRESTORE_EMULATOR_HOST وFIREBASE_AUTH_EMULATOR_HOST قبل --scan حتى يُقرأ المشروع المذكور. لم يُفتح اتصال.\n${SCAN_CREDENTIAL_HELP}`,
    };
  }
  if (
    String(env.GOOGLE_APPLICATION_CREDENTIALS || '').trim()
    || String(env.FIREBASE_SERVICE_ACCOUNT || '').trim()
    || String(env.FIREBASE_PRIVATE_KEY || '').trim()
    || String(env.FIREBASE_CLIENT_EMAIL || '').trim()
  ) {
    return { ok: false, message: SCAN_CREDENTIAL_HELP };
  }
  const kind = input.adcFileExists ? adcCredentialKind(input.adcText) : 'absent';
  if (kind !== 'authorized_user') return { ok: false, message: SCAN_CREDENTIAL_HELP };
  return { ok: true };
}

export function scanDatabaseId(env: NodeJS.ProcessEnv, configText: string | undefined): string {
  const fromEnv = String(env.FIRESTORE_DATABASE_ID || env.FIREBASE_FIRESTORE_DATABASE_ID || '').trim();
  if (fromEnv) return fromEnv;
  if (configText) {
    try {
      const parsed = JSON.parse(configText) as { firestoreDatabaseId?: unknown };
      const id = String(parsed.firestoreDatabaseId || '').trim();
      if (id) return id;
    } catch {
      /* the config is optional; a bad file must not be printed */
    }
  }
  return 'ai-studio-remixaysedshr202-98c882d5-9491-4f4b-a838-c6b0b10a0472';
}

export function readAdcForScan(env: NodeJS.ProcessEnv = process.env): { exists: boolean; text?: string } {
  const path = adcFilePath(env);
  if (!existsSync(path)) return { exists: false };
  return { exists: true, text: readFileSync(path, 'utf8') };
}

export interface ScanCollection {
  get(): Promise<{ docs: ScanDoc[] }>;
}

export interface ScanDoc {
  id: string;
  path: string;
  data(): Record<string, unknown> | undefined | null;
  collections(): Promise<ScanCollection[]>;
}

export interface AliasCount {
  field: string;
  value: string;
  count: number;
}

export interface CollectionScanRow {
  collection: string;
  documents: number;
  aliases: AliasCount[];
  examples: string[];
}

export function collectionPattern(docPath: string): string {
  const parts = docPath.split('/').slice(0, -1);
  return parts.map((part, index) => (index % 2 === 1 ? '*' : part)).join('/');
}

export async function collectAliasRows(roots: ScanCollection[]): Promise<CollectionScanRow[]> {
  const buckets = new Map<string, {
    documents: number;
    counts: Map<string, number>;
    aliasExamples: string[];
    plainExamples: string[];
  }>();

  async function walk(col: ScanCollection): Promise<void> {
    const snap = await col.get();
    for (const doc of snap.docs) {
      const pattern = collectionPattern(doc.path);
      const bucket = buckets.get(pattern) || {
        documents: 0,
        counts: new Map<string, number>(),
        aliasExamples: [],
        plainExamples: [],
      };
      bucket.documents += 1;
      const hits = planCompanyIdFieldUpdates(doc.path, doc.data());
      if (hits.length) {
        if (bucket.aliasExamples.length < 3) bucket.aliasExamples.push(doc.id);
        for (const hit of hits) {
          const key = `${hit.field}\0${hit.from}`;
          bucket.counts.set(key, (bucket.counts.get(key) || 0) + 1);
        }
      } else if (bucket.plainExamples.length < 3) {
        bucket.plainExamples.push(doc.id);
      }
      buckets.set(pattern, bucket);
      for (const child of await doc.collections()) await walk(child);
    }
  }

  for (const root of roots) await walk(root);

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([collection, bucket]) => ({
      collection,
      documents: bucket.documents,
      aliases: [...bucket.counts.entries()]
        .map(([key, count]) => {
          const [field, value] = key.split('\0');
          return { field, value, count };
        })
        .sort((a, b) => a.field.localeCompare(b.field) || a.value.localeCompare(b.value)),
      examples: bucket.aliasExamples.length ? bucket.aliasExamples : bucket.plainExamples,
    }));
}

function cell(value: string): string {
  return value.replace(/\|/g, '/').replace(/\n/g, ' ').trim() || '—';
}

export function formatAliasCell(row: CollectionScanRow): string {
  return COMPANY_ID_FIELDS.map((field) => {
    const items = row.aliases.filter((alias) => alias.field === field);
    if (!items.length) return `${field}: —`;
    return `${field}: ${items.map((item) => `${item.value} ×${item.count}`).join('، ')}`;
  }).join(' | ');
}

export function formatScanTable(rows: CollectionScanRow[]): string {
  const lines = [
    '| المجموعة | عدد المستندات | القيم القديمة | أمثلة معرّفات |',
    '| --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    lines.push(`| ${cell(row.collection)} | ${row.documents} | ${cell(formatAliasCell(row))} | ${cell(row.examples.join('، ') || '—')} |`);
  }
  return lines.join('\n');
}

export function safeScanError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'فشل الاتصال';
  if (/private_key|BEGIN |client_email|refresh_token|access_token/i.test(message)) {
    return 'فشل الاتصال. راجع دور القراءة فقط دون لصق أي مفتاح.';
  }
  return message.slice(0, 200);
}
