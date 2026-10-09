/**
 * Batch import employees to Al-Manar Clinic from civil ID OCR data.
 * Usage: npx tsx scripts/import-manar-civil-batch.ts [--dry-run]
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { getGeminiClient } from '../server/geminiServer.ts';
import { getOcrModelCandidates } from '../src/config/aiConfig.ts';
import { buildEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService.ts';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';

const COMPANY_ID = 'comp-1788442584841';
const dryRun = process.argv.includes('--dry-run');
const PDF_PATHS = [
  process.argv[2],
  'd:\\بطاقات المنار\\كريم بخش - مدنية 19-08-2028.pdf',
  'd:\\بطاقات المنار\\البطاقة المدنية.pdf',
].filter(Boolean) as string[];

const DEFAULT_JOIN = '2023-06-01';
const DEFAULT_SALARY = 800;

type Incoming = {
  fullNameAr: string;
  fullNameEn: string;
  civilId: string;
  civilIdExpiry: string;
  passportNo: string;
  nationality: string;
  gender: 'MALE' | 'FEMALE';
  dob: string;
  jobTitle: string;
  department: string;
  fullAddress?: string;
  paciBuildingRef?: string;
  emailSlug: string;
};

const BATCH: Incoming[] = [
  {
    fullNameAr: 'سيد محمد سيد محمد هادي مدرسي',
    fullNameEn: 'SEYED MOHAMMAD S H MODARRESI',
    civilId: '284042701953',
    civilIdExpiry: '2024-05-29',
    passportNo: 'H96871543',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1984-09-14',
    jobTitle: 'طبيب بشري',
    department: 'الخدمات الطبية',
    fullAddress: 'الدسمة - ق 4 - ش 48 - مبنى 7',
    paciBuildingRef: '16827563',
    emailSlug: 'seyed.modarresi',
  },
  {
    fullNameAr: 'سيلفا راجو',
    fullNameEn: 'SILPA RAJU',
    civilId: '297062304595',
    civilIdExpiry: '2027-01-26',
    passportNo: 'W8844198',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1997-06-23',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش الثالث - مبنى 5 - دور 6 - شقة 22',
    paciBuildingRef: '16817525',
    emailSlug: 'silpa.raju',
  },
  {
    fullNameAr: 'احمد حسين ورودي',
    fullNameEn: 'AHMAD HOSSEIN VOROUDI',
    civilId: '291071401218',
    civilIdExpiry: '2027-05-31',
    passportNo: 'T97676198',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1991-07-04',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 12 - ش أبوهريرة جادة 5 - مبنى 1',
    paciBuildingRef: '11794483',
    emailSlug: 'ahmad.voroudi',
  },
  {
    fullNameAr: 'برييثا بابو',
    fullNameEn: 'PREETHA BABU',
    civilId: '290092009835',
    civilIdExpiry: '2026-06-23',
    passportNo: 'U9487864',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1990-09-20',
    jobTitle: 'فراش',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 7 - شقة 25',
    paciBuildingRef: '16817568',
    emailSlug: 'preetha.babu',
  },
  {
    fullNameAr: 'الفونسا فيلوتارا بارامبيل سيباستيان',
    fullNameEn: 'ALPHONSA VELUTHARA PARAMBIL SEBASTIAN',
    civilId: '291101105015',
    civilIdExpiry: '2026-06-08',
    passportNo: 'W3242476',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1991-10-11',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2 - شقة 6',
    paciBuildingRef: '16817322',
    emailSlug: 'alphonsa.sebastian',
  },
  {
    fullNameAr: 'انابيلي اوبين ميلاندريس',
    fullNameEn: 'ANABELLE OBIEN MELENDRES',
    civilId: '281060709226',
    civilIdExpiry: '2027-12-20',
    passportNo: 'P2896088B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1981-06-07',
    jobTitle: 'عامل تنظيف مكاتب',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 22',
    paciBuildingRef: '16817525',
    emailSlug: 'anabelle.melendres',
  },
  {
    fullNameAr: 'جاتجامول ماداثيلفيلي اوماناكوتان',
    fullNameEn: 'GANGAMOL MADATHILVELI OMANAKUTTAN',
    civilId: '295021105486',
    civilIdExpiry: '2026-07-02',
    passportNo: 'Y4394817',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1995-02-11',
    jobTitle: 'كاتب إدخال بيانات',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 22',
    paciBuildingRef: '16817525',
    emailSlug: 'gangamol.omanakuttan',
  },
];

const BATCH_2: Incoming[] = [
  {
    fullNameAr: 'محمد شاجور حسين',
    fullNameEn: 'MOHAMMAD SHAGOR HOSSEN',
    civilId: '296052502462',
    civilIdExpiry: '2025-08-28',
    passportNo: 'EK0166658',
    nationality: 'بنغلاديشي',
    gender: 'MALE',
    dob: '1996-05-25',
    jobTitle: 'كاتب إدخال بيانات',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 6 - ش قطر - مبنى 1 - دور 2 - شقة 24',
    paciBuildingRef: '17303542',
    emailSlug: 'mohammad.hossen',
  },
  {
    fullNameAr: 'فؤاد عوض خالد عداد',
    fullNameEn: 'FUAD AWAD KHALED ADDAD',
    civilId: '275081400294',
    civilIdExpiry: '2027-09-06',
    passportNo: 'U0191055',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1975-08-14',
    jobTitle: 'طبيب أسنان عام',
    department: 'الخدمات الطبية',
    fullAddress: 'الفروانية - ق 4 - ش 115 - مبنى 1509 - دور 4 - شقة 18',
    paciBuildingRef: '17286877',
    emailSlug: 'fuad.addad',
  },
  {
    fullNameAr: 'شيبي سباستيان',
    fullNameEn: 'SHIBI SEBASTIAN',
    civilId: '285053007427',
    civilIdExpiry: '2026-06-15',
    passportNo: 'V7437715',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1985-05-30',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 10 - ش عمان - مبنى 37 - دور 5 - شقة 18',
    paciBuildingRef: '11504896',
    emailSlug: 'shibi.sebastian',
  },
  {
    fullNameAr: 'عمار محمد محمود بني فواز',
    fullNameEn: 'AMMAR MOHAMMAD MAHMOUD BANI FAWWAZ',
    civilId: '281052307606',
    civilIdExpiry: '2027-03-08',
    passportNo: 'S0266427',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1981-05-23',
    jobTitle: 'طبيب اختصاصي أمراض جلدية',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 6 - ش 6 - مبنى 8 - دور 3',
    paciBuildingRef: '19417797',
    emailSlug: 'ammar.fawwaz',
  },
  {
    fullNameAr: 'فداء محمد سلامة الدرعاوي',
    fullNameEn: 'FEDA M S ALDARAWI',
    civilId: '269042100079',
    civilIdExpiry: '2026-09-16',
    passportNo: 'R861308',
    nationality: 'أردني',
    gender: 'FEMALE',
    dob: '1969-04-21',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 6 - ش 9 - قسيمة 115 - دور 4 - شقة 18',
    paciBuildingRef: '15250328',
    emailSlug: 'feda.aldarawi',
  },
  {
    fullNameAr: 'لين باسم حمدان محمود',
    fullNameEn: 'LEEN BASEM HAMDAN MAHMOUD',
    civilId: '302010101167',
    civilIdExpiry: '2027-01-10',
    passportNo: 'S017336',
    nationality: 'أردني',
    gender: 'FEMALE',
    dob: '2002-01-01',
    jobTitle: 'سكرتير',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 6 - ش 9 - قسيمة 115 - مبنى 14 - دور 4 - شقة 18',
    paciBuildingRef: '15250328',
    emailSlug: 'leen.mahmoud',
  },
  {
    fullNameAr: 'فاطمه احمد محمد بالرشيد',
    fullNameEn: 'FATIMA AHMED MOHAMMED BALRASHED',
    civilId: '283061801226',
    civilIdExpiry: '2026-05-27',
    passportNo: '09574107',
    nationality: 'يمني',
    gender: 'FEMALE',
    dob: '1983-06-18',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'الاندلس - ق 5 - ش 1 - مبنى 45',
    paciBuildingRef: '12770782',
    emailSlug: 'fatima.balrashed',
  },
  {
    fullNameAr: 'ليزل داجويمول دونيسا',
    fullNameEn: 'LIEZL DONESA',
    civilId: '285121004384',
    civilIdExpiry: '2026-08-16',
    passportNo: 'P7894904A',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1985-12-10',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 7 - شقة',
    paciBuildingRef: '16817592',
    emailSlug: 'liezl.donesa',
  },
  {
    fullNameAr: 'معصومه محمد ضيائي',
    fullNameEn: 'MASOUMEH MOHAMMAD ZYAEI',
    civilId: '296040305023',
    civilIdExpiry: '2027-11-30',
    passportNo: 'B61712020',
    nationality: 'إيراني',
    gender: 'FEMALE',
    dob: '1996-04-03',
    jobTitle: 'مدير علاقات عامة',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 9 - ش 1 جادة 2 - مبنى 2 - دور 3',
    paciBuildingRef: '22383428',
    emailSlug: 'masoumeh.zyaei',
  },
];

const BATCH_3: Incoming[] = [
  {
    fullNameAr: 'نيمي سيباستيان توماس',
    fullNameEn: 'NIMMY SEBASTIAN',
    civilId: '287123003982',
    civilIdExpiry: '2027-12-20',
    passportNo: 'X8238142',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1987-12-30',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'المنقف - ق 4 - ش 17 - قسيمة 5478 - مبنى 16 - دور 2 - شقة 5',
    paciBuildingRef: '16831204',
    emailSlug: 'nimmy.sebastian',
  },
  {
    fullNameAr: 'منال صبحي الريس',
    fullNameEn: 'MANAL EL RAYESS',
    civilId: '291010115613',
    civilIdExpiry: '2026-09-21',
    passportNo: 'RL4127817',
    nationality: 'لبناني',
    gender: 'FEMALE',
    dob: '1991-01-01',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'حولي - ق 7 - ش 285 - قسيمة 5215 - دور 1 - شقة 5',
    paciBuildingRef: '18449287',
    emailSlug: 'manal.rayess',
  },
  {
    fullNameAr: 'نيلوكا شانداني هيراث موديانسيلاجي',
    fullNameEn: 'NILUKA CHANDANI HERATH',
    civilId: '280030604437',
    civilIdExpiry: '2026-08-16',
    passportNo: 'N7470706',
    nationality: 'سريلانكي',
    gender: 'FEMALE',
    dob: '1980-03-06',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 6 - ش 5 جادة 11 - مبنى 23 - دور 8 - شقة 18',
    paciBuildingRef: '18240328',
    emailSlug: 'niluka.herath',
  },
  {
    fullNameAr: 'ناديه رابح مفرح الرشيدي',
    fullNameEn: 'NADIAH RABEH MEFARREH ALRASHEEDI',
    civilId: '265082400641',
    civilIdExpiry: '2027-03-31',
    passportNo: '',
    nationality: 'كويتي',
    gender: 'FEMALE',
    dob: '1965-08-24',
    jobTitle: 'موظفة إدارية',
    department: 'الإدارة العامة',
    fullAddress: 'جليب الشيوخ - ق 4 - ش 340 - مبنى 13',
    paciBuildingRef: '15839976',
    emailSlug: 'nadiah.alrasheedi',
  },
  {
    fullNameAr: 'نورهان حسن كربوج',
    fullNameEn: 'NOURHAN HASAN KARBOUJ',
    civilId: '289072500354',
    civilIdExpiry: '2027-02-22',
    passportNo: 'N02863781',
    nationality: 'سوري',
    gender: 'FEMALE',
    dob: '1989-07-25',
    jobTitle: 'كاتب دوام',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 12 - ش أبو هريرة جادة 9 - مبنى 10',
    paciBuildingRef: '11795339',
    emailSlug: 'nourhan.karbouj',
  },
];

const BATCH_4: Incoming[] = [
  {
    fullNameAr: 'فؤاد نصر عبدالكريم الحجوج',
    fullNameEn: 'FUAD NASER ABDELKARIM AL HJOUJ',
    civilId: '284082903269',
    civilIdExpiry: '2027-05-29',
    passportNo: 'S0440637',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1984-08-29',
    jobTitle: 'مسئول المحاسبة',
    department: 'الإدارة العامة',
    fullAddress: 'حطين - ق 3 - ش 301 - مبنى 48',
    paciBuildingRef: '15821864',
    emailSlug: 'fuad.hjouj',
  },
];

function nextEmpId(existingIds: string[]): string {
  const nums = existingIds
    .map((id) => {
      const m = /^EMP-2026-(\d+)$/i.exec(id);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => n > 0 && n < 9000);
  const max = nums.length ? Math.max(...nums) : 0;
  return `EMP-2026-${String(max + 1).padStart(3, '0')}`;
}

function toEmployeePayload(row: Incoming, empId: string, ibanSuffix: string) {
  return {
    id: empId,
    employeeCode: empId,
    companyId: COMPANY_ID,
    fullNameAr: row.fullNameAr,
    fullNameEn: row.fullNameEn,
    civilId: row.civilId,
    civilIdExpiry: row.civilIdExpiry,
    passportNo: row.passportNo,
    nationality: row.nationality,
    isKuwaiti: String(row.nationality).includes('كويت'),
    gender: row.gender,
    dob: row.dob,
    birthDate: row.dob,
    residencyType: 'مادة 18 - قطاع أهلي',
    jobTitle: row.jobTitle,
    department: row.department,
    joinDate: DEFAULT_JOIN,
    email: `${row.emailSlug}@almanarclinic.com`,
    bankName: 'بيت التمويل الكويتي (KFH)',
    iban: `KW81CBKU000000000000000000${ibanSuffix}`,
    basicSalary: DEFAULT_SALARY,
    housingAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    otherAllowance: 0,
    hasAllowances: false,
    salaryPackageType: 'FIXED_NO_ALLOWANCES',
    payrollNotes: 'راتب ثابت 800 د.ك بدون بدلات',
    paciBuildingRef: row.paciBuildingRef || '',
    fullAddress: row.fullAddress || '',
    notes: 'استيراد دفعة بطاقات مدنية — المنار كلينك',
    tags: ['استيراد-بطاقة-مدنية', 'دفعة-pdf'],
    isCommenced: true,
    leaveAccrualActivated: true,
    contractStatus: 'running',
  };
}

function deptForJob(jobTitle: string): string {
  const j = jobTitle.toLowerCase();
  if (j.includes('طبيب') || j.includes('تمريض') || j.includes('ممرض')) return 'الخدمات الطبية';
  if (j.includes('استقبال')) return 'الاستقبال';
  if (j.includes('تنظيف') || j.includes('فراش')) return 'الخدمات العامة';
  return 'الإدارة العامة';
}

async function tryExtractFromPdfPath(pdfPath: string): Promise<Incoming[]> {
  if (!existsSync(pdfPath)) {
    return [];
  }
  const client = getGeminiClient();
  if (!client) {
    console.warn('GEMINI_API_KEY missing — skipping PDF extraction');
    return [];
  }
  const b64 = readFileSync(pdfPath).toString('base64');
  const prompt = `استخرج كل بطاقة مدنية في PDF. أرجع JSON: { "employees": [ { civilId, fullNameAr, fullNameEn, passportNo, nationality, gender, dob, expiryDate, profession, address } ] }. لا تخمّن.`;
  const models = uniqueModels(['gemini-3.8-flash', ...getOcrModelCandidates()]);
  try {
    let text = '';
    let lastErr: Error | null = null;
    for (const model of models) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { data: b64, mimeType: 'application/pdf' } },
              { text: prompt },
            ],
          },
          config: { temperature: 0, responseMimeType: 'application/json' },
        });
        text = response.text || '{}';
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e as Error;
      }
    }
    if (lastErr) throw lastErr;
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : parsed.employees || [];
    return rows
      .map((r: any, i: number) => {
        const civil = String(r.civilId || '').replace(/\D/g, '');
        if (civil.length !== 12) return null;
        const slug = `pdf${i + 1}.${civil.slice(-4)}`;
        return {
          fullNameAr: String(r.fullNameAr || r.nameAr || '').trim(),
          fullNameEn: String(r.fullNameEn || r.nameEn || '').trim(),
          civilId: civil,
          civilIdExpiry: String(r.expiryDate || r.civilIdExpiry || '').slice(0, 10),
          passportNo: String(r.passportNo || '').trim(),
          nationality: String(r.nationality || 'غير محدد').trim(),
          gender: String(r.gender || '').toUpperCase().includes('F') ? 'FEMALE' : 'MALE',
          dob: String(r.dob || r.birthDate || '').slice(0, 10),
          jobTitle: String(r.profession || r.jobTitle || 'موظف').trim(),
          department: deptForJob(String(r.profession || r.jobTitle || '')),
          fullAddress: String(r.address || r.fullAddress || '').trim(),
          emailSlug: slug,
        } as Incoming;
      })
      .filter(Boolean) as Incoming[];
  } catch (e) {
    console.warn('PDF OCR failed:', pdfPath, (e as Error).message);
    return [];
  }
}

function uniqueModels(candidates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of candidates) {
    const x = String(m || '').trim();
    if (!x || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

async function tryExtractMoreFromPdfs(): Promise<Incoming[]> {
  const merged: Incoming[] = [];
  for (const p of PDF_PATHS) {
    const rows = await tryExtractFromPdfPath(p);
    if (rows.length) console.log(`PDF ${p}: ${rows.length} record(s)`);
    merged.push(...rows);
  }
  return merged;
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const pdfRows = await tryExtractMoreFromPdfs();
  const byCivil = new Map<string, Incoming>();
  for (const row of [...BATCH, ...BATCH_2, ...BATCH_3, ...BATCH_4, ...pdfRows]) {
    if (row.fullNameAr && row.civilId) byCivil.set(row.civilId, row);
  }
  const queue = [...byCivil.values()];

  const manarSnap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  let existingEmployees = manarSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const allEmpSnap = await db.collection('employees').get();
  let existingIds = allEmpSnap.docs.map((d) => d.id);

  const results: Array<{ status: string; civilId: string; name?: string; employeeId?: string; reason?: string }> = [];

  for (const row of queue) {
    const dup = await db.collection('employees').where('civilId', '==', row.civilId).get();
    if (!dup.empty) {
      const hit = dup.docs[0];
      results.push({
        status: 'skipped',
        civilId: row.civilId,
        name: row.fullNameAr,
        employeeId: hit.id,
        reason: `exists @ ${hit.data().companyId}`,
      });
      continue;
    }

    const empId = nextEmpId([...existingIds, ...results.filter((r) => r.employeeId).map((r) => r.employeeId!)]);
    existingIds.push(empId);
    const ibanSuffix = empId.replace(/^EMP-2026-/i, '').padStart(4, '0');
    const employee = toEmployeePayload(row, empId, ibanSuffix);

    try {
      const bundle = buildEmployeeOnboardingBundle({
        companyId: COMPANY_ID,
        employee,
        existingEmployees,
      });

      if (!dryRun) {
        const batch = db.batch();
        batch.set(
          db.collection('employees').doc(String(bundle.employee.id)),
          cleanFirestoreData(toEmployeeFirestoreData(bundle.employee as any, COMPANY_ID)),
          { merge: true }
        );
        batch.set(db.collection('contracts').doc(String(bundle.contract.id)), cleanFirestoreData(bundle.contract), { merge: true });
        batch.set(
          db.collection('commencements').doc(String(bundle.commencement.id)),
          cleanFirestoreData(bundle.commencement),
          { merge: true }
        );
        if (bundle.leaveAllocation) {
          batch.set(
            db.collection('leave_allocations').doc(String(bundle.leaveAllocation.id)),
            cleanFirestoreData(bundle.leaveAllocation),
            { merge: true }
          );
        }
        await batch.commit();
      }

      existingEmployees.push(bundle.employee as any);
      results.push({ status: dryRun ? 'dry-run' : 'created', civilId: row.civilId, name: row.fullNameAr, employeeId: empId });
    } catch (e) {
      results.push({ status: 'error', civilId: row.civilId, name: row.fullNameAr, reason: (e as Error).message });
    }
  }

  console.log(JSON.stringify({ companyId: COMPANY_ID, total: results.length, results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
