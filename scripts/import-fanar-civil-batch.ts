/**
 * Batch import employees to Al-Fanar Clinic from civil ID OCR data.
 * Usage: npx tsx scripts/import-fanar-civil-batch.ts [--dry-run]
 */
import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';
import { buildEmployeeOnboardingBundle } from '../src/services/employeeOnboardingService.ts';
import { toEmployeeFirestoreData } from '../src/utils/employeeMapper.ts';
import { cleanFirestoreData } from '../src/lib/firebase.ts';

const COMPANY_ID = 'tenant_1788413304890';
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
    fullNameAr: 'آسيا صديق',
    fullNameEn: 'ASIYA SIDHIK',
    civilId: '295041007306',
    civilIdExpiry: '2027-03-10',
    passportNo: 'V4784908',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1995-04-10',
    jobTitle: 'كاتب دوام',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2',
    paciBuildingRef: '16817322',
    emailSlug: 'asiya.sidik',
  },
  {
    fullNameAr: 'برافينا براسانان',
    fullNameEn: 'PRAVEENA PRASANNAN',
    civilId: '298021703906',
    civilIdExpiry: '2027-04-12',
    passportNo: 'U5541528',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1998-02-17',
    jobTitle: 'فراش',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 22',
    paciBuildingRef: '16817525',
    emailSlug: 'praveena.prasannan',
  },
  {
    fullNameAr: 'بليسي ماثيو',
    fullNameEn: 'BLESSY MATHEW',
    civilId: '287042104562',
    civilIdExpiry: '2026-12-06',
    passportNo: 'P9481972',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1987-04-21',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 10 - ش عيسى القطامي جادة 10 - قسيمة 218 - دور 6 - شقة 24',
    paciBuildingRef: '19721932',
    emailSlug: 'blessy.mathew',
  },
  {
    fullNameAr: 'احمد رحيم بخش ساميراد',
    fullNameEn: 'AHMAD RAHIM BAKHSH SAMIRAD',
    civilId: '297010105981',
    civilIdExpiry: '2026-11-15',
    passportNo: 'A97033650',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1994-03-21',
    jobTitle: 'مندوب مشتريات',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 9 - ش 1 جادة 2 - مبنى 2 - دور 3 - شقة',
    paciBuildingRef: '22383428',
    emailSlug: 'ahmad.samirad',
  },
  {
    fullNameAr: 'سونيا باول',
    fullNameEn: 'SONIA PAUL',
    civilId: '288111511327',
    civilIdExpiry: '2027-05-16',
    passportNo: 'W3621934',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1988-11-15',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 8 - شقة 29',
    paciBuildingRef: '16817605',
    emailSlug: 'sonia.paul',
  },
  {
    fullNameAr: 'بريانكا بائيش',
    fullNameEn: 'PRIYANKA VASAVAN',
    civilId: '288080707852',
    civilIdExpiry: '2026-11-15',
    passportNo: 'W0772806',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1988-08-07',
    jobTitle: 'ممرض اختصاصي صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 10 - شقة 38',
    paciBuildingRef: '16817728',
    emailSlug: 'priyanka.vasavan',
  },
  {
    fullNameAr: 'انجيليكا لازيليتا سلابنتان',
    fullNameEn: 'ANGELICA LAZALITA SALAPANTAN',
    civilId: '288041705707',
    civilIdExpiry: '2026-08-17',
    passportNo: 'P7124330A',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1988-04-17',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 8 - شقة 29',
    paciBuildingRef: '16817605',
    emailSlug: 'angelica.salapantan',
  },
  {
    fullNameAr: 'بريسا فاخر عساكره',
    fullNameEn: 'PARISA FAKHER ASAKEREH',
    civilId: '280060201946',
    civilIdExpiry: '2026-05-26',
    passportNo: 'F97808760',
    nationality: 'إيراني',
    gender: 'FEMALE',
    dob: '1980-06-02',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'شمال غرب الصليبخات - ق 2 - ش 231 - مبنى 16',
    paciBuildingRef: '20367686',
    emailSlug: 'parisa.asakereh',
  },
  {
    fullNameAr: 'علي لشكر بلوجهي',
    fullNameEn: 'ALI LASHKAR BALOUGHZEHI',
    civilId: '259021700199',
    civilIdExpiry: '2021-05-04',
    passportNo: 'U96444396',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1964-12-30',
    jobTitle: 'أمين مخزن',
    department: 'الإدارة العامة',
    fullAddress: 'حولي - ق 5 - ش 134 - قسيمة 631 - وحدة 2',
    paciBuildingRef: '10880718',
    emailSlug: 'ali.baloughzehi',
  },
  {
    fullNameAr: 'الله بخش كريم بخش ساميراد',
    fullNameEn: 'ALLAH BAKHSH KARIM BAKHSH SAMIRAD',
    civilId: '294042101471',
    civilIdExpiry: '2026-07-11',
    passportNo: 'W97950807',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1994-04-21',
    jobTitle: 'موظف علاقات عامة',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 9 - ش 1 جادة 2 - مبنى 2 - دور 3 - شقة 5',
    paciBuildingRef: '22383428',
    emailSlug: 'karim.samirad',
  },
  {
    fullNameAr: 'اريا ميني',
    fullNameEn: 'ARYA MINI',
    civilId: '301042503537',
    civilIdExpiry: '2027-04-12',
    passportNo: 'C2675759',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '2001-04-25',
    jobTitle: 'فراش',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 22',
    paciBuildingRef: '16817525',
    emailSlug: 'arya.mini',
  },
];

const BATCH_2: Incoming[] = [
  {
    fullNameAr: 'روز ماري كيوديامسيريل جوزيف',
    fullNameEn: 'ROSE MARY KUDIAMSSERIL JOSEPH',
    civilId: '297052204152',
    civilIdExpiry: '2027-02-13',
    passportNo: 'X2847331',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1997-05-22',
    jobTitle: 'سكرتير',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 7 - شقة 25',
    paciBuildingRef: '16817568',
    emailSlug: 'rose.joseph',
  },
  {
    fullNameAr: 'سودير كومار نينجا ريدي',
    fullNameEn: 'SUDHIR KUMAR NINGA REDDY',
    civilId: '288021809744',
    civilIdExpiry: '2027-11-07',
    passportNo: 'T5952117',
    nationality: 'هندي',
    gender: 'MALE',
    dob: '1988-02-18',
    jobTitle: 'طبيب اختصاصي أمراض جلدية',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 4 - شقة 15',
    paciBuildingRef: '16817445',
    emailSlug: 'sudhir.reddy',
  },
  {
    fullNameAr: 'بليسي مول ثيبارامبيل جوزيف',
    fullNameEn: 'BLESSYMOL THYPARAMBIL JOSEPH',
    civilId: '290111708122',
    civilIdExpiry: '2027-06-23',
    passportNo: 'V1003747',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1990-11-17',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 18',
    paciBuildingRef: '16817525',
    emailSlug: 'blessymol.joseph',
  },
  {
    fullNameAr: 'سحر رجب احمد محمد',
    fullNameEn: 'SAHAR RAGAB AHMED MOHAMED',
    civilId: '290010173915',
    civilIdExpiry: '2026-12-20',
    passportNo: 'A34381554',
    nationality: 'مصري',
    gender: 'FEMALE',
    dob: '1990-01-01',
    jobTitle: 'كاتب دوام',
    department: 'الإدارة العامة',
    fullAddress: 'الرقعي - ق 2 - جادة 1 - مبنى 37 - شقة',
    paciBuildingRef: '12736875',
    emailSlug: 'sahar.mohamed',
  },
  {
    fullNameAr: 'ساجده يحيى عباس كمال',
    fullNameEn: 'SAJEDAH YAHYA ABBAS KAMAL',
    civilId: '291032401434',
    civilIdExpiry: '2030-03-23',
    passportNo: '',
    nationality: 'معاملة كويتية',
    gender: 'FEMALE',
    dob: '1991-03-24',
    jobTitle: 'موظفة إدارية',
    department: 'الإدارة العامة',
    fullAddress: '',
    emailSlug: 'sajedah.kamal',
  },
  {
    fullNameAr: 'حنان محمد احمد ابوالغيط',
    fullNameEn: 'HANAN MOHAMED AHMED ABOUELGHET',
    civilId: '271031803345',
    civilIdExpiry: '2027-11-08',
    passportNo: 'A27762331',
    nationality: 'مصري',
    gender: 'FEMALE',
    dob: '1971-03-18',
    jobTitle: 'طبيب ممارس عام',
    department: 'الخدمات الطبية',
    fullAddress: 'الجابرية - ق 3أ - ش ابراهيم حسين معرفي - مبنى 71 - دور 5 - شقة 14',
    paciBuildingRef: '12114611',
    emailSlug: 'hanan.abouelghet',
  },
  {
    fullNameAr: 'حبيب خان لال خان',
    fullNameEn: 'HABIB KHAN LAL KHAN',
    civilId: '274050604257',
    civilIdExpiry: '2027-02-23',
    passportNo: 'A09484019',
    nationality: 'بنغلاديشي',
    gender: 'MALE',
    dob: '1974-05-06',
    jobTitle: 'كاتب دوام',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 10 - ش يوسف البدر - مبنى 21 - شقة',
    paciBuildingRef: '17297103',
    emailSlug: 'habib.khan',
  },
  {
    fullNameAr: 'الدكتور خليل رضا حسين اليوسفي',
    fullNameEn: 'KHALIL R H Y ALYOUSIFI',
    civilId: '259010600053',
    civilIdExpiry: '2026-11-02',
    passportNo: '',
    nationality: 'كويتي',
    gender: 'MALE',
    dob: '1959-01-11',
    jobTitle: 'طبيب',
    department: 'الخدمات الطبية',
    fullAddress: '',
    emailSlug: 'khalil.alyousifi',
  },
  {
    fullNameAr: 'راجي راجو سوما',
    fullNameEn: 'RAJI RAJU SUMA',
    civilId: '297052007466',
    civilIdExpiry: '2027-04-12',
    passportNo: 'Y1294662',
    nationality: 'هندي',
    gender: 'FEMALE',
    dob: '1997-05-20',
    jobTitle: 'فراش',
    department: 'الخدمات العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 6 - شقة 18',
    paciBuildingRef: '16817525',
    emailSlug: 'raji.suma',
  },
  {
    fullNameAr: 'داني مأمون نصر',
    fullNameEn: 'DANY MAAMOUN NASR',
    civilId: '273082305011',
    civilIdExpiry: '2028-02-06',
    passportNo: 'LR3070734',
    nationality: 'لبناني',
    gender: 'MALE',
    dob: '1973-08-23',
    jobTitle: 'طبيب صحة عامة',
    department: 'الخدمات الطبية',
    fullAddress: 'السالمية - ق 6 - ش قطر - مبنى 1 - دور 2 - شقة 18',
    paciBuildingRef: '17303542',
    emailSlug: 'dany.nasr',
  },
  {
    fullNameAr: 'رغده نواف محمد الحلو',
    fullNameEn: 'RAGHDA NAWAF MOHAMMAD ALHELO',
    civilId: '289090601431',
    civilIdExpiry: '2026-08-11',
    passportNo: 'R115568',
    nationality: 'أردني',
    gender: 'FEMALE',
    dob: '1989-09-06',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 3 - شقة 12',
    paciBuildingRef: '16817402',
    emailSlug: 'raghda.alhelo',
  },
];

const BATCH_3: Incoming[] = [
  {
    fullNameAr: 'علي أ ك حسون',
    fullNameEn: 'ALI A K HASSOON',
    civilId: '263010207464',
    civilIdExpiry: '2026-11-05',
    passportNo: 'P626003HO',
    nationality: 'كندي',
    gender: 'MALE',
    dob: '1963-01-02',
    jobTitle: 'طبيب أسنان عام',
    department: 'الخدمات الطبية',
    fullAddress: 'الجابرية - ق 7 - ش 6 - مبنى 23أ',
    paciBuildingRef: '15167591',
    emailSlug: 'ali.hassoon',
  },
  {
    fullNameAr: 'على احمد سعادت فر',
    fullNameEn: 'ALI AHMED SAADATFAR',
    civilId: '267053001405',
    civilIdExpiry: '2026-07-05',
    passportNo: 'T54542775',
    nationality: 'إيراني',
    gender: 'MALE',
    dob: '1967-09-11',
    jobTitle: 'موظف علاقات عامة',
    department: 'الإدارة العامة',
    fullAddress: 'سلوى - ق 11 - ش 8 - مبنى 4 - ملحق - دور 2',
    paciBuildingRef: '11907337',
    emailSlug: 'ali.saadatfar',
  },
  {
    fullNameAr: 'كاميل ان كويزون بيلوسو',
    fullNameEn: 'CAMMELLE ANNE QUEZON BELOSO',
    civilId: '291031105115',
    civilIdExpiry: '2027-01-25',
    passportNo: 'P8360349B',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1991-03-11',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 2 - شقة',
    paciBuildingRef: '16817322',
    emailSlug: 'cammelle.beloso',
  },
  {
    fullNameAr: 'كاوينا ناديسان تيروموني',
    fullNameEn: 'KAVINA NADESON TIRUMANI',
    civilId: '282100305512',
    civilIdExpiry: '2027-05-05',
    passportNo: 'P0671809',
    nationality: 'سريلانكي',
    gender: 'FEMALE',
    dob: '1982-10-03',
    jobTitle: 'كاتب استقبال مرضى',
    department: 'الاستقبال',
    fullAddress: 'السالمية - ق 5 - ش 5 - مبنى 17 - دور 1 - شقة 2',
    paciBuildingRef: '11270487',
    emailSlug: 'kavina.tirumani',
  },
  {
    fullNameAr: 'ليلى كمال محفوظ محمد',
    fullNameEn: 'LAILA KAMAL MAHFOUZE MOHAMED',
    civilId: '288081511966',
    civilIdExpiry: '2025-05-15',
    passportNo: 'A30208395',
    nationality: 'مصري',
    gender: 'FEMALE',
    dob: '1988-08-15',
    jobTitle: 'كاتب استقبال عام',
    department: 'الاستقبال',
    fullAddress: 'الشرق - ق 4 - ش الشهداء - قسيمة 44 - منزل 18',
    paciBuildingRef: '14858497',
    emailSlug: 'laila.mahfouze',
  },
  {
    fullNameAr: 'عبدالوهاب طارق نزير',
    fullNameEn: 'ABDUL WAHAB NAZIR TARIQ',
    civilId: '281072702865',
    civilIdExpiry: '2027-08-02',
    passportNo: 'GA1076653',
    nationality: 'باكستاني',
    gender: 'MALE',
    dob: '1981-07-27',
    jobTitle: 'مراسل',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 6 - ش قطر - مبنى 15 - دور 7 - شقة 27',
    paciBuildingRef: '16672805',
    emailSlug: 'abdulwahab.nazir',
  },
  {
    fullNameAr: 'محمد حسن',
    fullNameEn: 'MOHAMMAD HASAN',
    civilId: '284041007804',
    civilIdExpiry: '2026-08-19',
    passportNo: 'R5456586',
    nationality: 'هندي',
    gender: 'MALE',
    dob: '1984-04-10',
    jobTitle: 'مخلص معاملات',
    department: 'الإدارة العامة',
    fullAddress: 'حولي - ق 7 - ش 284 - قسيمة 5904 - شقة 2',
    paciBuildingRef: '10942106',
    emailSlug: 'mohammad.hasan',
  },
  {
    fullNameAr: 'يوسف اسماعيل سيد حسن الموسوي',
    fullNameEn: 'YOUSEF E S H ALMOUSAWI',
    civilId: '288051200526',
    civilIdExpiry: '2026-09-29',
    passportNo: '',
    nationality: 'كويتي',
    gender: 'MALE',
    dob: '1988-05-12',
    jobTitle: 'موظف إداري',
    department: 'الإدارة العامة',
    fullAddress: 'الدسمة - ق 6 - ش حسان بن ثابت - مبنى 4',
    paciBuildingRef: '16840733',
    emailSlug: 'yousef.almousawi',
  },
  {
    fullNameAr: 'ماريروز نافارو باهيت',
    fullNameEn: 'MARYROSE NAVARRO PAHIT',
    civilId: '286070805556',
    civilIdExpiry: '2026-12-20',
    passportNo: 'P1534235C',
    nationality: 'فلبيني',
    gender: 'FEMALE',
    dob: '1986-07-08',
    jobTitle: 'كاتب إدخال بيانات',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 5 - ش 3 - مبنى 5 - دور 8 - شقة 29',
    paciBuildingRef: '16817605',
    emailSlug: 'maryrose.pahit',
  },
  {
    fullNameAr: 'محمد اسماعيل',
    fullNameEn: 'MOHAMMED ISMAIL',
    civilId: '277070703475',
    civilIdExpiry: '2026-09-28',
    passportNo: 'EK0721016',
    nationality: 'بنغلاديشي',
    gender: 'MALE',
    dob: '1977-07-07',
    jobTitle: 'سكرتير',
    department: 'الإدارة العامة',
    fullAddress: 'السالمية - ق 6 - ش 5 جادة 11 - مبنى 23 - دور 1 - شقة 3',
    paciBuildingRef: '18240061',
    emailSlug: 'mohammed.ismail',
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
    email: `${row.emailSlug}@fanarclinic.com`,
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
    notes: 'استيراد دفعة بطاقات مدنية — الفنار كلينك',
    tags: ['استيراد-بطاقة-مدنية', 'الفنار'],
    isCommenced: true,
    leaveAccrualActivated: true,
    contractStatus: 'running',
  };
}

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

async function main() {
  const db = getAdminFirestore();
  if (!db) throw new Error('Firebase Admin unavailable');

  const companySnap = await db.collection('companies').doc(COMPANY_ID).get();
  if (!companySnap.exists) throw new Error(`Company not found: ${COMPANY_ID}`);

  const fanarSnap = await db.collection('employees').where('companyId', '==', COMPANY_ID).get();
  let existingEmployees = fanarSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const allEmpSnap = await db.collection('employees').get();
  const existingIds = allEmpSnap.docs.map((d) => d.id);

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

    const empId = nextEmpId([...existingIds, ...results.filter((r) => r.employeeId).map((r) => r.employeeId!)]);
    existingIds.push(empId);
    const ibanSuffix = String(existingIds.length + 100).padStart(4, '0');
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

  console.log(
    JSON.stringify(
      {
        companyId: COMPANY_ID,
        companyName: companySnap.data()?.nameAr || companySnap.data()?.name,
        total: results.length,
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
