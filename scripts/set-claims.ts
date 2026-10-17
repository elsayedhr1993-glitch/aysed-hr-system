/**
 * Reads users/{uid} and prints the custom claims that match each document.
 * Default is dry-run: no Auth writes.
 * --apply writes role and companyId only after the operator types the project id.
 * SUPER_ADMIN never receives companyId unless a later, separate confirmation
 * types that exact id. The re-login column marks sessions still on the old token.
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

type Row = {
  user: string;
  role: string;
  companyId: string;
  uid: string;
  assignCompanyId: string;
  platformOwnerWarning: boolean;
  needsRelogin: 'نعم' | 'لا';
};

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

function companyCell(row: Row): string {
  if (row.platformOwnerWarning) {
    return `تحذير: لن يُعيَّن (${row.companyId}) إلا بتأكيد منفصل`;
  }
  return row.assignCompanyId;
}

function printTable(rows: Row[]): void {
  const warnings = rows.filter((row) => row.platformOwnerWarning).length;
  console.log(`المشروع: ${projectId}`);
  console.log(apply ? 'الوضع: تطبيق بعد تأكيد اسم المشروع' : 'الوضع: dry-run (قراءة فقط، بلا كتابة)');
  console.log('');
  console.log('| المستخدم | الدور | المنشأة | يحتاج إعادة تسجيل دخول |');
  console.log('| --- | --- | --- | --- |');
  for (const row of rows) {
    console.log(`| ${cell(row.user)} | ${cell(row.role)} | ${cell(companyCell(row))} | ${row.needsRelogin} |`);
  }
  console.log('');
  console.log(`${rows.length} مستخدم. ${apply ? 'ستُكتب المطالبات بعد نجاح التأكيد.' : 'لم تُكتب أي مطالبة.'}`);
  if (warnings > 0) {
    console.log(`تحذير: ${warnings} من ملاك المنصة لديهم companyId في users. لا يُعيَّن إلا إذا كُتب المعرّف حرفياً في تأكيد منفصل عند --apply.`);
  }
  console.log('«يحتاج إعادة تسجيل دخول» = نعم عندما تحمل الجلسة الحالية رمزاً قديماً يختلف عن المطالبة التي ستُكتب. حتى إعادة الدخول، غياب الـ claim يجعل القواعد ترجع إلى users/{uid}.');
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

function claimText(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

async function confirmSuperAdminCompany(user: string, companyId: string): Promise<boolean> {
  if (!input.isTTY) {
    console.error(`تخطّي companyId لمالك المنصة ${user}: لا طرفية لهذا التأكيد المنفصل.`);
    return false;
  }
  const rl = createInterface({ input, output });
  const typed = (await rl.question(
    `مالك المنصة ${user} لديه companyId=${companyId} في users ولن يُعيَّن. لتطبيقه اكتب المعرّف كما هو، وإلا Enter: `,
  )).trim();
  rl.close();
  return typed === companyId;
}

async function loadRows(): Promise<Row[]> {
  const db = getFirestore();
  const auth = getAuth();
  const snap = await db.collection('users').get();
  const rows: Row[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() || {};
    const companyRaw = data.companyId != null ? String(data.companyId).trim() : '';
    const role = String(data.role || '').trim();
    const platformOwner = role === 'SUPER_ADMIN';
    const assignCompanyId = platformOwner ? '' : companyRaw;
    let needsRelogin: 'نعم' | 'لا' = 'نعم';
    try {
      const existing = await auth.getUser(doc.id);
      const claims = existing.customClaims || {};
      const sameRole = claimText(claims.role) === role;
      const sameCompany = claimText(claims.companyId) === assignCompanyId;
      needsRelogin = sameRole && sameCompany ? 'لا' : 'نعم';
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'auth/user-not-found') {
        needsRelogin = 'لا';
      } else {
        const message = error instanceof Error ? error.message : 'تعذر قراءة الرمز';
        console.error(`تعذر قراءة رمز ${String(data.email || doc.id)}: ${message}`);
      }
    }
    rows.push({
      uid: doc.id,
      user: String(data.email || doc.id),
      role,
      companyId: companyRaw,
      assignCompanyId,
      platformOwnerWarning: platformOwner && companyRaw !== '',
      needsRelogin,
    });
  }
  rows.sort((a, b) => a.user.localeCompare(b.user, 'ar'));
  return rows;
}

async function main(): Promise<void> {
  await initAdmin();
  const rows = await loadRows();

  printTable(rows);
  if (!apply) return;

  await confirmProjectName();
  const auth = getAuth();
  let written = 0;
  for (const row of rows) {
    try {
      let companyToWrite = row.assignCompanyId;
      if (row.platformOwnerWarning) {
        const confirmed = await confirmSuperAdminCompany(row.user, row.companyId);
        if (confirmed) {
          companyToWrite = row.companyId;
          console.log(`تأكيد منفصل: سيُعيَّن companyId لمالك المنصة ${row.user}. الجلسة الحالية تبقى على الرمز القديم حتى إعادة تسجيل الدخول.`);
        } else {
          console.log(`لم يُؤكَّد companyId لمالك المنصة ${row.user}. لن يُعيَّن.`);
        }
      }
      const existing = await auth.getUser(row.uid);
      await auth.setCustomUserClaims(row.uid, {
        ...(existing.customClaims || {}),
        role: row.role || null,
        companyId: companyToWrite || null,
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
