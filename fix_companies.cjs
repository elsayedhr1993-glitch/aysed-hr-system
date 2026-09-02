const fs = require('fs');

const filePath = 'src/context/CompanyContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newCompanies = `const defaultCompanies: Company[] = [
  {
    id: 'comp-01',
    nameAr: 'مستوصف المنار كلينك الطبي',
    nameEn: 'Al-Manar Clinic Medical Center',
    crNumber: '201934',
    pifssNumber: 'KUW-884920',
    mohLicense: '107914',
    isDefault: true,
    name: 'مستوصف المنار كلينك الطبي',
    commercialRegNo: '107914',
    civilIdCompany: '201934',
    bankName: 'بيت التمويل الكويتي (KFH)',
    iban: 'KW12KFH000000000000107914',
    wsiCode: 'WSI-ALMANAR',
    currency: 'KWD',
    status: 'active'
  },
  {
    id: 'comp-02',
    nameAr: 'عيادة إيليت كلينك',
    nameEn: 'Elite Clinic',
    crNumber: '310452',
    pifssNumber: 'KUW-993211',
    mohLicense: '108842',
    name: 'عيادة إيليت كلينك',
    commercialRegNo: '112233',
    civilIdCompany: '203456',
    bankName: 'بنك الكويت الوطني (NBK)',
    iban: 'KW12NBOK0000000000001122334455',
    wsiCode: 'WSI-ELITE',
    currency: 'KWD',
    status: 'active'
  },
  {
    id: 'comp-03',
    nameAr: 'مستوصف الفنار كلينك الطبي',
    nameEn: 'Al Fanar Clinic',
    crNumber: '445210',
    pifssNumber: 'KUW-774102',
    name: 'مستوصف الفنار كلينك الطبي',
    commercialRegNo: '445566',
    civilIdCompany: '205678',
    bankName: 'بنك بوبيان (Boubyan)',
    iban: 'KW77BOUB0000000000004455667788',
    wsiCode: 'WSI-FANAR',
    currency: 'KWD',
    status: 'active'
  }
];`;

content = content.replace(/const defaultCompanies: Company\[\] = \[[\s\S]*?\];/, newCompanies);

// Change the localStorage key to force update for existing users without deleting other data
content = content.replace(/registered_companies_v1/g, 'aysed_registered_companies_live');

fs.writeFileSync(filePath, content, 'utf8');
