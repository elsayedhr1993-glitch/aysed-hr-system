import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import {
  DEFAULT_PAM_COORDINATES,
  generatePamContractPdfBytes,
  type PamContractData,
} from '../src/services/pamContractPdfService.ts';

// Node: load template + fonts from disk (service uses fetch for browser)
const origFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL) => {
  const url = String(input);
  if (url.includes('pam_contract_form_2.pdf')) {
    const bytes = fs.readFileSync(path.join(process.cwd(), 'public/pam_contract_form_2.pdf'));
    return new Response(bytes, { status: 200 });
  }
  if (url.startsWith('/fonts/')) {
    const rel = url.replace(/^\//, '');
    const file = path.join(process.cwd(), 'public', rel);
    const bytes = fs.readFileSync(file);
    return new Response(bytes, { status: 200 });
  }
  return origFetch(input);
};

const data: PamContractData = {
  companyLaborDept: 'حولي',
  companyLaborDeptEn: 'Hawalli',
  contractDay: 'الخميس',
  contractDayEn: 'Thursday',
  contractDate: '2026/09/25',
  companyName: 'إيليت كلينك',
  companyNameEn: 'Elite Clinic',
  companyRepName: 'مسؤول إيليت كلينك',
  companyRepNameEn: 'Elite Clinic Admin',
  companyRepCivilId: '000000000000',
  companyField: 'الرعاية والخدمات الطبية والصحية',
  companyFieldEn: 'Healthcare & Medical Services',
  employeeNameAr: 'ريميا ماناليل ماثيو',
  employeeNameEn: 'REMYA MANALEL MATHEW',
  employeeNationality: 'هندي',
  employeeNationalityEn: 'Indian',
  employeeCivilId: '283102704941',
  employeeResidence: 'مادة 18 - قطاع أهلي',
  employeeResidenceEn: 'Article 18',
  jobTitleAr: 'ممرض اختصاصي صحة عامة',
  jobTitleEn: 'Specialist Nurse',
  basicSalary: '470',
  salaryPeriod: 'نهاية كل شهر',
  salaryPeriodEn: 'End of each calendar month',
  effectiveDate: '2023/06/01',
  durationYears: '3',
  leaveDay: '30',
  leaveDayEn: '30 days (annual leave per Kuwait Private Sector Labor Law)',
  contractLanguageAr: 'باللغتين العربية والإنجليزية',
  contractLanguageEn: 'Arabic and English',
};

const bytes = await generatePamContractPdfBytes(data, DEFAULT_PAM_COORDINATES, 'cairo');
const out = path.join(process.cwd(), 'tmp-pam-remya-system.pdf');
fs.writeFileSync(out, bytes);

const refPath = 'c:\\Users\\السيد\\Downloads\\PAM_Form2_ريميا ماناليل ماثيو.pdf';
const ref = fs.readFileSync(refPath);
const refDoc = await PDFDocument.load(ref);
const sysDoc = await PDFDocument.load(bytes);
const refPage = refDoc.getPage(0);
const sysPage = sysDoc.getPage(0);
console.log(
  JSON.stringify(
    {
      out,
      refSize: { w: refPage.getWidth(), h: refPage.getHeight() },
      sysSize: { w: sysPage.getWidth(), h: sysPage.getHeight() },
    },
    null,
    2
  )
);
