import type { ComplianceTreeGovernmentDepartment } from '../types/companyComplianceTree';
import { getDocumentStatus } from '../types/companyDocuments';

export const GOV_COMPLIANCE_TREE_DOC_ID = 'gov_license_tree';

function licStatus(expiryDate: string, isPermanent: boolean): 'active' | 'expiring' | 'expired' {
  if (isPermanent || !expiryDate?.trim()) return 'active';
  const v = getDocumentStatus(expiryDate);
  if (v.status === 'expired') return 'expired';
  if (v.status === 'expiring_soon') return 'expiring';
  return 'active';
}

/** قالب شجري افتراضي (دوائر حكومية فارغة أو عيّنة) — يُستبدل من Firestore أو من أرشيف المنشأة. */
export function createDefaultGovComplianceTree(): ComplianceTreeGovernmentDepartment[] {
  return [
    {
      id: 'dept-moh',
      nameAr: 'وزارة الصحة (MOH)',
      code: 'MOH',
      description: 'تراخيص المنشأة الطبية والعيادات والكوادر',
      licenses: [],
    },
    {
      id: 'dept-pam',
      nameAr: 'الهيئة العامة للقوى العاملة (PAM)',
      code: 'PAM',
      description: 'ملف الشؤون، اعتماد التوقيع، وتصاريح العمل',
      licenses: [],
    },
    {
      id: 'dept-kff',
      nameAr: 'قوة الإطفاء العام (KFF)',
      code: 'KFF',
      description: 'تراخيص السلامة والوقاية من الحريق',
      licenses: [],
    },
    {
      id: 'dept-mun',
      nameAr: 'بلدية الكويت (Municipality)',
      code: 'MUN',
      description: 'اعتمادات المرور والبلدية واللافتات',
      licenses: [],
    },
    {
      id: 'dept-bank',
      nameAr: 'البنوك وحماية الأجور (WPS)',
      code: 'BANK',
      description: 'شهادات الحساب والآيبان وملفات البنوك',
      licenses: [],
    },
  ];
}

/** بذرة مستوصف المنار من بيانات التهيئة المعتمدة في المستودع. */
export function createManarGovComplianceTreeSeed(): ComplianceTreeGovernmentDepartment[] {
  const depts = createDefaultGovComplianceTree();
  const byCode = (code: string) => depts.find(d => d.code === code)!;

  const push = (
    code: string,
    lic: Omit<ComplianceTreeGovernmentDepartment['licenses'][0], 'status'> & { status?: never }
  ) => {
    byCode(code).licenses.push({
      ...lic,
      status: licStatus(lic.expiryDate, lic.isPermanent),
    });
  };

  push('MOH', {
    id: 'lic-comp-1788442584841-moh',
    name: 'ترخيص بفتح منشأة صحية — مستوصف المنار كلينك',
    licenseNumber: '32',
    expiryDate: '2029-04-25',
    isPermanent: false,
    companyDocumentId: 'lic-comp-1788442584841-moh',
  });
  push('PAM', {
    id: 'lic-comp-1788442584841-signature-auth',
    name: 'شهادة اعتماد توقيع صاحب عمل',
    licenseNumber: '100031031',
    expiryDate: '2026-12-12',
    isPermanent: false,
    companyDocumentId: 'lic-comp-1788442584841-signature-auth',
  });
  push('PAM', {
    id: 'lic-pam-wps-file',
    name: 'ملف الشؤون الرئيسي (WPS)',
    licenseNumber: '100031031',
    expiryDate: '',
    isPermanent: true,
  });
  push('KFF', {
    id: 'lic-comp-1788442584841-kff',
    name: 'رخصة إطفاء لوحدة — مستوصف المنار كلينك',
    licenseNumber: '211213212',
    expiryDate: '2027-11-10',
    isPermanent: false,
    companyDocumentId: 'lic-comp-1788442584841-kff',
  });
  push('MUN', {
    id: 'lic-comp-1788442584841-traffic',
    name: 'اعتماد مرور — مستوصف المنار كلينك',
    licenseNumber: '4-2029',
    expiryDate: '2029-04-30',
    isPermanent: false,
    companyDocumentId: 'lic-comp-1788442584841-traffic',
  });
  push('BANK', {
    id: 'lic-comp-1788442584841-bank-iban',
    name: 'شهادة حساب وآيبان',
    licenseNumber: '421010008487',
    expiryDate: '',
    isPermanent: true,
    companyDocumentId: 'lic-comp-1788442584841-bank-iban',
  });

  return depts;
}

export function resolveGovTreeSeedForCompany(companyId: string): ComplianceTreeGovernmentDepartment[] {
  if (companyId === 'comp-1788442584841') {
    return createManarGovComplianceTreeSeed();
  }
  return createDefaultGovComplianceTree();
}
