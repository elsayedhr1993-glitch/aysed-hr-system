/**
 * Reads users/{uid} and prints the custom claims that match each document.
 * Default is dry-run: no Auth writes.
 * --apply writes role and companyId only after the operator types the project id.
 *
 * Local rehearsal uses the emulator only (demo-aysed, 127.0.0.1).
 * A non-demo project is contacted only when --project is passed explicitly.
 * This file does not deploy rules and does not load .env on the emulator path.
 */
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

type Row = { user: string; role: string; companyId: string; uid: string };

const args = process.argv.slice(2);
let apply = false;
let projectFlag = '';

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--dry-run') apply = false;
  else if (arg === '--apply') apply = true;
  else if (arg === '--project') {
    projectFlag = String(args[i + 1] || '').trim();
    i += 1;
  } else {
    console.error(`خيار غير معروف: ${arg}. لم يُفتح اتصال.`);
    process.exit(1);
  }
}

if (args.includes('--apply') && args.includes('--dry-run')) {
  console.error('لا يجتمع --apply مع --dry-run. لم يُكتب شيء.');
  process.exit(1);
}

function isLocalHost(value: string | undefined): boolean {
  return /^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(String(value || '').trim());
}

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
if ((authHost || firestoreHost) && !(isLocalHost(authHost) && isLocalHost(firestoreHost))) {
  console.error('رفض: مضيف المحاكي ليس 127.0.0.1 أو localhost. لم يُكتب شيء.');
  process.exit(1);
}

const onEmulator = isLocalHost(authHost) && isLocalHost(firestoreHost);
if (onEmulator && projectFlag && projectFlag !== 'demo-aysed') {
  console.error('رفض: المحاكي المحلي يقبل demo-aysed فقط. لم يُكتب شيء.');
  process.exit(1);
}
if (!onEmulator && !projectFlag) {
  console.error('رفض: بدون محاكي محلي مرّر --project. الوضع الافتراضي لا يفتح مشروعاً حقيقياً.');
  process.exit(1);
}
if (!onEmulator && projectFlag.startsWith('demo-')) {
  console.error('رفض: مشروع demo يُشغَّل على المحاكي المحلي فقط.');
  process.exit(1);
}

const projectId = onEmulator ? 'demo-aysed' : projectFlag;

function readServiceAccount(): ServiceAccount & { project_id?: string } {
  const email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectFromEnv = process.env.FIREBASE_PROJECT_ID?.trim();
  if (email && privateKey) {
    if (projectFromEnv !== projectId) {
      throw new Error('FIREBASE_PROJECT_ID لا يطابق --project. لم يُكتب شيء.');
    }
    return { projectId, clientEmail: email, privateKey };
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw || raw.includes('YOUR_')) {
    throw new Error('لا توجد شهادة خدمة للمشروع المطلوب. لم يُفتح اتصال.');
  }
  const parsed = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')) as ServiceAccount & {
    project_id?: string;
  };
  if (parsed.project_id !== projectId) {
    throw new Error('مشروع الشهادة لا يطابق --project. لم يُكتب شيء.');
  }
  return parsed;
}

async function initAdmin(): Promise<void> {
  if (getApps().length > 0) return;
  if (onEmulator) {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    initializeApp({ projectId: 'demo-aysed' });
    return;
  }
  const dotenv = await import('dotenv');
  dotenv.config();
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new Error('رفض: --project مع مضيف محاكي. لم يُكتب شيء.');
  }
  const serviceAccount = readServiceAccount();
  initializeApp({ credential: cert(serviceAccount), projectId });
}

function cell(value: string): string {
  return value.replace(/\|/g, '/').trim() || '—';
}

function printTable(rows: Row[]): void {
  console.log(`المشروع: ${projectId}`);
  console.log(apply ? 'الوضع: تطبيق بعد تأكيد اسم المشروع' : 'الوضع: dry-run (قراءة فقط، بلا كتابة)');
  console.log('');
  console.log('| المستخدم | الدور | المنشأة |');
  console.log('| --- | --- | --- |');
  for (const row of rows) {
    console.log(`| ${cell(row.user)} | ${cell(row.role)} | ${cell(row.companyId)} |`);
  }
  console.log('');
  console.log(`${rows.length} مستخدم. ${apply ? 'ستُكتب المطالبات بعد نجاح التأكيد.' : 'لم تُكتب أي مطالبة.'}`);
}

async function confirmProjectName(): Promise<void> {
  if (!input.isTTY) {
    console.error('التطبيق يحتاج طرفية تفاعلية لكتابة اسم المشروع. لم يُكتب شيء.');
    process.exit(1);
  }
  const rl = createInterface({ input, output });
  const typed = (await rl.question('اكتب اسم المشروع للتأكيد: ')).trim();
  rl.close();
  if (typed !== projectId) {
    console.error('اسم المشروع غير مطابق. لم يُكتب شيء.');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  await initAdmin();
  const db = getFirestore();
  const snap = await db.collection('users').get();
  const rows: Row[] = snap.docs
    .map((doc) => {
      const data = doc.data() || {};
      const companyRaw = data.companyId != null ? String(data.companyId).trim() : '';
      return {
        uid: doc.id,
        user: String(data.email || doc.id),
        role: String(data.role || '').trim(),
        companyId: companyRaw,
      };
    })
    .sort((a, b) => a.user.localeCompare(b.user, 'ar'));

  printTable(rows);
  if (!apply) return;

  await confirmProjectName();
  const auth = getAuth();
  let written = 0;
  for (const row of rows) {
    try {
      const existing = await auth.getUser(row.uid);
      await auth.setCustomUserClaims(row.uid, {
        ...(existing.customClaims || {}),
        role: row.role || null,
        companyId: row.companyId || null,
      });
      written += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر التعيين';
      console.error(`تخطّي ${row.user}: ${message}`);
    }
  }
  console.log(`كُتبت مطالبات ${written} مستخدم في ${projectId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'فشل سكربت المطالبات');
  process.exit(1);
});
