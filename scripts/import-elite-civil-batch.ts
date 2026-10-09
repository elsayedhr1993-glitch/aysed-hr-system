/**
 * Batch import employees to Elite Clinic from civil ID OCR data.
 * Usage: npx tsx scripts/import-elite-civil-batch.ts [--dry-run]
 */
import 'dotenv/config';
import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { buildEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService.ts';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';

const COMPANY_ID = 'comp-1788435917695';
const dryRun = process.argv.includes('--dry-run');
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
    fullNameAr: 'آيه ماجد الصمد',
    fullNameEn: 'AYA ELSAMAD',
    civilId: '297070500916',
    civilIdExpiry: '2026-09-28',
    passportNo: 'RL4297425',
    nationality: 'لبناني',
    gender: 'FEMALE',
    dob: '1997-07-05',
    jobTitle: 'كاتب إدخال بيانات',
    department: 'الإدارة العامة',
    fullAddress: 'حولي - ق 6 - ش 322 - قسيمة 5513 - دور 2 - شقة 4',
    paciBuildingRef: '15046976',
    emailSlug: 'aya.elsamad',
  },
  {
    fullNameAr: 'ريميا ماناليل ماثيو',
    fullNameEn: 'REMYA MANALEL MATHEW',
    civilId: '283102704941',
    civilIdExpiry: '2027-01-30',
    passportNo: 'AH428793',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1983-10-27',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'بنيد القار - ق 1 - ش محمد رفيع معرفي - مبنى 20 - دور 8 - شقة 18',
    paciBuildingRef: '17969782',
    emailSlug: 'remya.mathew',
  },
  {
    fullNameAr: 'ايرينا شاكر',
    fullNameEn: 'IRYNA SHAKER',
    civilId: '268033004363',
    civilIdExpiry: '2027-01-05',
    passportNo: 'PU213656',
    nationality: 'أوكرانية',
    gender: 'FEMALE',
    dob: '1968-03-30',
    jobTitle: 'طبيب مسجل أمراض جلدية وتناسلية',
    department: 'الخدمات الطبية',
    fullAddress: 'حولي - ق 9 - ش 242 - مبنى 7 - دور 3 - شقة 12',
    paciBuildingRef: '15019038',
    emailSlug: 'iryna.shaker',
  },
  {
    fullNameAr: 'رضوى عمر يللو',
    fullNameEn: 'RADWA OMAR BALLO',
    civilId: '301071200818',
    civilIdExpiry: '2026-12-20',
    passportNo: 'N015791935',
    nationality: 'سوري',
    gender: 'FEMALE',
    dob: '2001-07-12',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'حولي - ق 11 - ش 186 - قسيمة 12511 - دور 2 - شقة 4',
    paciBuildingRef: '11058857',
    emailSlug: 'radwa.ballo',
  },
  {
    fullNameAr: 'بارعه عبدالله قصير',
    fullNameEn: 'BARIA KASSIR',
    civilId: '279070302646',
    civilIdExpiry: '2026-12-20',
    passportNo: 'LR4086832',
    nationality: 'لبناني',
    gender: 'FEMALE',
    dob: '1979-07-03',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 11 - ش يثرب جادة 3 - مبنى 6 - دور 9 - شقة 16',
    paciBuildingRef: '17082057',
    emailSlug: 'baria.kassir',
  },
  {
    fullNameAr: 'ان ماري ريجينا جوزون جينيو',
    fullNameEn: 'ANNE MARIE REGINA GOZON GENIO',
    civilId: '272041304624',
    civilIdExpiry: '2026-11-01',
    passportNo: 'P6025641B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1972-04-13',
    jobTitle: 'فني أسنان',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 11 - ش عبدالله الفضالة جادة 11 - مبنى 1 - دور 4 - شقة 26',
    paciBuildingRef: '20769634',
    emailSlug: 'anne.genio',
  },
  {
    fullNameAr: 'جيجي فارجيس',
    fullNameEn: 'JIJY VARGHESE',
    civilId: '286040409085',
    civilIdExpiry: '2027-03-08',
    passportNo: 'U1255487',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1986-04-04',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2 - شقة 6',
    paciBuildingRef: '16817322',
    emailSlug: 'jijy.varghese',
  },
  {
    fullNameAr: 'باسل سعد سلامه عليان',
    fullNameEn: 'BASEL SAAD SALAMEH ELYAN',
    civilId: '284082400987',
    civilIdExpiry: '2026-10-12',
    passportNo: 'Q669249',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1984-08-24',
    jobTitle: 'طبيب أسنان',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 11 - ش 2 جادة 1 - مبنى 19 - دور 4 - شقة 7',
    paciBuildingRef: '19591808',
    emailSlug: 'basel.elyan',
  },
  {
    fullNameAr: 'ريماري جوي دونيسا سانشيز',
    fullNameEn: 'REY MARIE JOY DONISA SANCHEZ',
    civilId: '294090902193',
    civilIdExpiry: '2027-03-15',
    passportNo: 'P8604999B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1994-09-09',
    jobTitle: 'كاتب دوام',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 8 - شقة 29',
    paciBuildingRef: '16817605',
    emailSlug: 'rey.sanchez',
  },
  {
    fullNameAr: 'دينا ماريا ديسوزا',
    fullNameEn: 'DEENA MARIA DSOUZA',
    civilId: '289112106176',
    civilIdExpiry: '2026-12-20',
    passportNo: 'C6101348',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1989-11-21',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 10 - ش المغيرة بن شعبة - مبنى 81 - دور 1 - شقة 18',
    paciBuildingRef: '16745787',
    emailSlug: 'deena.dsouza',
  },
  {
    fullNameAr: 'جوليا نيسا مانتيلا سانشيز',
    fullNameEn: 'JULIE NESSA MANTILLA SANCHEZ',
    civilId: '290072703723',
    civilIdExpiry: '2026-11-15',
    passportNo: 'P3451228B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1990-07-27',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'المنقف - ق 4 - ش 28 - مبنى 87 - دور 7 - شقة 26',
    paciBuildingRef: '18979237',
    emailSlug: 'julie.sanchez',
  },
];

const BATCH_2: Incoming[] = [
  {
    fullNameAr: 'ولاء بشير محمد الصدقه',
    fullNameEn: 'WALAA BASHIR ALSADAKA',
    civilId: '298100900174',
    civilIdExpiry: '2027-01-24',
    passportNo: 'N02663295',
    nationality: 'سوري',
    gender: 'FEMALE',
    dob: '1998-10-09',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: '',
    emailSlug: 'walaa.alsadaka',
  },
  {
    fullNameAr: 'سميه اسحق اميريان',
    fullNameEn: 'SOMAYEH ISAAC AMIRIYAN',
    civilId: '300112703805',
    civilIdExpiry: '2026-09-15',
    passportNo: 'M69511762',
    nationality: 'إيراني',
    gender: 'FEMALE',
    dob: '2000-11-27',
    jobTitle: 'كاتب علاقات عامة',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2 - شقة 6',
    paciBuildingRef: '16817322',
    emailSlug: 'somayeh.amiriyan',
  },
  {
    fullNameAr: 'عامر خضر شاكر',
    fullNameEn: 'AMER CHAKER',
    civilId: '265051805689',
    civilIdExpiry: '2026-05-26',
    passportNo: 'LR3831387',
    nationality: 'لبناني',
    gender: 'MALE',
    dob: '1965-05-18',
    jobTitle: 'موظف إداري',
    department: 'الإدارة العامة',
    fullAddress: '',
    emailSlug: 'amer.chaker',
  },
  {
    fullNameAr: 'سعود شاكر طعمه مناحي',
    fullNameEn: 'SAUD SHAKER TUMAH MANAHI',
    civilId: '288020400824',
    civilIdExpiry: '2026-11-10',
    passportNo: '',
    nationality: 'بدون',
    gender: 'MALE',
    dob: '1988-02-04',
    jobTitle: 'موظف إداري',
    department: 'الإدارة العامة',
    fullAddress: '',
    emailSlug: 'saud.manahi',
  },
  {
    fullNameAr: 'على محمد غلامي',
    fullNameEn: 'ALI MOHAMMAD GHOLAMI',
    civilId: '251041401659',
    civilIdExpiry: '2026-04-21',
    passportNo: 'F97808514',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1951-04-14',
    jobTitle: 'مخلص معاملات',
    department: 'الإدارة العامة',
    fullAddress: 'الدسمة - ق 1 - ش 16 - مبنى 5 - منزل 18',
    paciBuildingRef: '15537169',
    emailSlug: 'ali.gholami',
  },
  {
    fullNameAr: 'شيمول فيدهيانان دهان',
    fullNameEn: 'SHYMOL VIDHYANANDHAN',
    civilId: '284021507254',
    civilIdExpiry: '2026-06-09',
    passportNo: 'S3691594',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1984-02-15',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'جليب الشيوخ - ق 4 - ش 13 - قسيمة 23108 - دور 6 - شقة 18',
    paciBuildingRef: '19086107',
    emailSlug: 'shymol.vidhyanandhan',
  },
  {
    fullNameAr: 'طلال مالك محمد خير الكردي',
    fullNameEn: 'TALAL MALEK MOHD ALKURDI',
    civilId: '286051210047',
    civilIdExpiry: '2026-05-06',
    passportNo: 'Q491241',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1986-05-12',
    jobTitle: 'طبيب أسنان عام',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 6 - ش العوازم جادة 6 - مبنى 4 - دور 3 - شقة 9',
    paciBuildingRef: '20814327',
    emailSlug: 'talal.alkurdi',
  },
  {
    fullNameAr: 'ستيلا سانشيز سامباس',
    fullNameEn: 'STELLA SANCHEZ SAMBAS',
    civilId: '287112405388',
    civilIdExpiry: '2026-12-20',
    passportNo: 'P3558081B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1987-11-24',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 7 - شقة',
    paciBuildingRef: '16817568',
    emailSlug: 'stella.sambas',
  },
  {
    fullNameAr: 'عماد احمد محمد سبوبه',
    fullNameEn: 'EMAD AHMED MOUHAMMED SABOUBA',
    civilId: '265012000175',
    civilIdExpiry: '2026-10-27',
    passportNo: 'U0077430',
    nationality: 'أردني',
    gender: 'MALE',
    dob: '1965-01-20',
    jobTitle: 'مندوب مبيعات',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 11 - ش ربيعه - مبنى 21 - دور 9 - شقة 92',
    paciBuildingRef: '16954597',
    emailSlug: 'emad.sabouba',
  },
  {
    fullNameAr: 'شعبان حسين محمد أحمد',
    fullNameEn: 'SHABAN H M AHMAD',
    civilId: '250090300147',
    civilIdExpiry: '2026-06-15',
    passportNo: '',
    nationality: 'كويتي',
    gender: 'MALE',
    dob: '1950-09-03',
    jobTitle: 'موظف إداري',
    department: 'الإدارة العامة',
    fullAddress: 'بيان - ق 10 - ش 1 جادة 2 - مبنى 21',
    paciBuildingRef: '12033192',
    emailSlug: 'shaban.ahmad',
  },
  {
    fullNameAr: 'سوجاتا بيسالا جوندا',
    fullNameEn: 'SUJATHA PESALA GUNDA',
    civilId: '283021207281',
    civilIdExpiry: '2026-10-12',
    passportNo: 'V7436324',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1983-02-12',
    jobTitle: 'فراش',
    department: 'الخدمات العامة',
    fullAddress: 'الفروانية - ق 1 - ش 91 - قسيمة 68149 - دور 1 - شقة 3',
    paciBuildingRef: '16359851',
    emailSlug: 'sujatha.gunda',
  },
];

const BATCH_3: Incoming[] = [
  {
    fullNameAr: 'كيرانماي ادارا',
    fullNameEn: 'KIRANMAYI EDARA',
    civilId: '296010404928',
    civilIdExpiry: '2026-09-09',
    passportNo: 'V5842230',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1996-01-04',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2 - شقة 6',
    paciBuildingRef: '16817322',
    emailSlug: 'kiranmayi.edara',
  },
  {
    fullNameAr: 'فاديا عمر يوسف',
    fullNameEn: 'FADIA OMAR YOUSSEF',
    civilId: '274110503387',
    civilIdExpiry: '2026-10-03',
    passportNo: 'RL4291664',
    nationality: 'لبناني',
    gender: 'FEMALE',
    dob: '1974-11-05',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'حولي - ق 8 - ش 274 - قسيمة 8997ب - دور 3 - شقة 12',
    paciBuildingRef: '15501596',
    emailSlug: 'fadia.youssef',
  },
  {
    fullNameAr: 'مريم رياض مرزوق',
    fullNameEn: 'MARIAM RIAD MARZOUK',
    civilId: '283060402127',
    civilIdExpiry: '2026-07-08',
    passportNo: 'LR3018717',
    nationality: 'لبناني',
    gender: 'FEMALE',
    dob: '1983-06-04',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'حولي - ق 4 - ش ابن رشد - قسيمة 1905 - دور 5 - شقة 53',
    paciBuildingRef: '16996869',
    emailSlug: 'mariam.marzouk',
  },
  {
    fullNameAr: 'لافييلا اريسينو بليناردو',
    fullNameEn: 'LOVEBELLA ARSENIO BELINARIO',
    civilId: '286102015533',
    civilIdExpiry: '2026-12-20',
    passportNo: 'P0844907C',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1986-10-20',
    jobTitle: 'عامل تنظيف مكاتب',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 7 - شقة 25',
    paciBuildingRef: '16817568',
    emailSlug: 'lovebella.belinario',
  },
  {
    fullNameAr: 'ليزي كوندوديكال جوزيف',
    fullNameEn: 'LIZY KONDODICKAL JOSEPH',
    civilId: '284053105209',
    civilIdExpiry: '2026-10-08',
    passportNo: 'S2348431',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1984-05-31',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'جليب الشيوخ - ق 4 - ش 4 - قسيمة 1725 - دور 7 - شقة 22',
    paciBuildingRef: '16423913',
    emailSlug: 'lizy.joseph',
  },
  {
    fullNameAr: 'مانجو جوسي',
    fullNameEn: 'MANJU JOSE',
    civilId: '283053111831',
    civilIdExpiry: '2027-03-08',
    passportNo: 'U9496533',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1983-05-31',
    jobTitle: 'مساعد تمريض عام',
    department: 'الخدمات الطبية',
    fullAddress: 'المهبولة - ق 2 - ش 216 - مبنى 15 - دور 9',
    paciBuildingRef: '19706206',
    emailSlug: 'manju.jose',
  },
  {
    fullNameAr: 'مارسيل بالاتيبات ماتامبالي',
    fullNameEn: 'MARICEL BALATIBAT MATAMPALE',
    civilId: '277012405226',
    civilIdExpiry: '2026-12-20',
    passportNo: 'P9606992A',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1977-01-24',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'حولي - ق 9 - ش بغداد جادة 10 - قسيمة 106 - دور 3 - شقة 12',
    paciBuildingRef: '18492867',
    emailSlug: 'maricel.matampale',
  },
];

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
    email: `${row.emailSlug}@eliteclinic.com`,
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
    notes: 'استيراد دفعة بطاقات مدنية — ايليت كلينك',
    tags: ['استيراد-بطاقة-مدنية', 'ايليت'],
    isCommenced: true,
    leaveAccrualActivated: true,
    contractStatus: 'running',
  };
}

async function nextEmpIdGlobal(db: Firestore, pendingIds: string[] = []): Promise<string> {
  const snap = await db.collection('employees').get();
  const nums = [...snap.docs.map((d) => d.id), ...pendingIds]
    .map((id) => {
      const m = /^EMP-2026-(\d+)$/i.exec(id);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => n > 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `EMP-2026-${String(max + 1).padStart(3, '0')}`;
}

function usedIbanSuffixes(employees: Array<Record<string, unknown>>): Set<string> {
  const used = new Set<string>();
  for (const e of employees) {
    const iban = String(e.iban || e.bankIban || '').replace(/\s/g, '');
    const tail = iban.slice(-4);
    if (/^\d{4}$/.test(tail)) used.add(tail);
  }
  return used;
}

/** Unique 4-digit tail for placeholder IBANs (prefer last digits of civil ID). */
function nextIbanSuffix(used: Set<string>, civilId: string): string {
  const digits = civilId.replace(/\D/g, '');
  let candidate = (digits.slice(-4) || '0001').padStart(4, '0');
  for (let i = 0; i < 10000 && used.has(candidate); i++) {
    candidate = String((parseInt(candidate, 10) + 1) % 10000).padStart(4, '0');
  }
  used.add(candidate);
  return candidate;
}

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const companySnap = await db.collection('companies').doc(COMPANY_ID).get();
  if (!companySnap.exists) throw new Error(`Company not found: ${COMPANY_ID}`);

  const snap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  let existingEmployees = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const existingIds = snap.docs.map((d) => d.id);
  const ibanSuffixUsed = usedIbanSuffixes(existingEmployees);

  const results: Array<{ status: string; civilId: string; name?: string; employeeId?: string; reason?: string }> = [];

  for (const row of [...BATCH, ...BATCH_2, ...BATCH_3]) {
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

    const empId = await nextEmpIdGlobal(db, existingIds);
    existingIds.push(empId);
    const ibanSuffix = nextIbanSuffix(ibanSuffixUsed, row.civilId);
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
      results.push({
        status: dryRun ? 'dry-run' : 'created',
        civilId: row.civilId,
        name: row.fullNameAr,
        employeeId: empId,
      });
    } catch (e) {
      results.push({ status: 'error', civilId: row.civilId, name: row.fullNameAr, reason: (e as Error).message });
    }
  }

  console.log(
    JSON.stringify(
      {
        companyId: COMPANY_ID,
        companyName: companySnap.data()?.nameAr || companySnap.data()?.name,
        total: results.length,
        created: results.filter((r) => r.status === 'created').length,
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
