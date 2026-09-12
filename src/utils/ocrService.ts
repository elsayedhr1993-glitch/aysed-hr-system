import * as pdfjsLib from 'pdfjs-dist';
// Vite will statically analyze this and serve the file correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parseKuwaitCivilId } from './kuwaitLaw';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

export interface ScannedData {
  documentType?: 'civil_id' | 'license' | 'contract' | 'passport' | 'other';
  civilId?: string;
  fullNameAr?: string;
  fullName?: string;
  fullNameEn?: string;
  nationality?: string;
  gender?: string;
  birthDate?: string;
  dob?: string;
  unifiedNo?: string;
  passportNo?: string;
  profession?: string;
  jobTitle?: string;
  expiryDate?: string;
  issueDate?: string;
  bloodGroup?: string;
  address?: {
    block?: string;
    street?: string;
    building?: string;
    area?: string;
  };
  rawText?: string;
  confidenceScore?: number;
  residencyType?: string;
  mohLicenseNo?: string;
  mohLicenseExpiryDate?: string;
  contractSalary?: number;
  passportExpiryDate?: string;
  residencyExpiryDate?: string;
  paciBuildingRef?: string;
}

interface PdfRenderOutput {
  pagesBase64: string[];
  mimeType: string;
}

/**
 * دالة تحويل الصفحة الأولى من ملف الـ PDF أو BDF إلى صورة عالية الجودة (Canvas rendering) داخل المتصفح
 */
async function convertPdfPagesToImages(file: File, maxPages: number = 4): Promise<PdfRenderOutput> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;

    const pageCount = Math.min(pdf.numPages || 1, Math.max(1, maxPages));
    const pagesBase64: string[] = [];

    for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) throw new Error('فشل في إنشاء سياق Canvas');

      await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;
      pagesBase64.push(canvas.toDataURL('image/jpeg', 0.95));
    }

    return {
      pagesBase64,
      mimeType: 'image/jpeg'
    };
  } catch (err) {
    console.error("PDF to Image conversion failed:", err);
    // Fallback to raw file reader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        pagesBase64: [reader.result as string],
        mimeType: 'application/pdf'
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/**
 * دالة تحويل الصور العادية إلى Base64
 */
function convertImageToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      base64: reader.result as string,
      mimeType: file.type || 'image/jpeg'
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * الدالة الرئيسية الشاملة للماسح الضوئي الذكي (تعالج PDF, BDF, والـ صور بكفاءة عالية)
 */
export async function processAnyDocument(file: File, _apiKey?: string, docType?: string): Promise<ScannedData> {
  const fileNameLower = file.name.toLowerCase();
  const isPdfOrBdf = file.type === 'application/pdf' || 
                     file.type.includes('pdf') || 
                     fileNameLower.endsWith('.pdf') || 
                     fileNameLower.endsWith('.bdf');

  let docData: { base64: string; mimeType: string };
  let pdfPages: string[] = [];

  if (isPdfOrBdf) {
    const pdfData = await convertPdfPagesToImages(file, 4);
    pdfPages = pdfData.pagesBase64;
    docData = {
      base64: pdfData.pagesBase64[0] || '',
      mimeType: pdfData.mimeType
    };
  } else {
    docData = await convertImageToBase64(file);
  }

  // إرسال البيانات لمعالج الرؤية البصرية في السيرفر
  let response;

  try {
    response = await fetch('/api/ocr-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: docData.base64,
        imageBase64Pages: pdfPages.length > 0 ? pdfPages : undefined,
        mimeType: docData.mimeType,
        docType: docType || 'CIVIL_ID'
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error((errJson.error || 'فشل نظام القراءة الضوئية (OCR) في تحليل المستند.') + (errJson.details ? '\nالسبب: ' + errJson.details : ''));
    }
  } catch (netErr: any) {
    throw new Error('فشل الاتصال بخدمة OCR على الخادم. يرجى المحاولة لاحقاً.\n' + (netErr?.message || ''));
  }

  const rawParsed = await response.json();
  const dataToNormalize = rawParsed.data || rawParsed;
  return normalizeScannedData(dataToNormalize);
}

export function normalizeScannedData(parsed: any): ScannedData {
  if (!parsed || typeof parsed !== 'object') parsed = {};

  const toWesternDigits = (str: string) => {
    if (!str) return '';
    return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
  };

  let civilId = toWesternDigits((parsed.civilId || parsed.civil_id || parsed.civilIdNumber || '').toString()).replace(/\D/g, '');
  let fullNameAr = (parsed.fullNameAr || parsed.fullName || parsed.nameAr || parsed.name || '').toString().trim();
  let fullNameEn = (parsed.fullNameEn || parsed.nameEn || '').toString().trim();
  let nationality = (parsed.nationality || parsed.citizenship || parsed.country || parsed.nationalityAr || '').toString().trim();
  let genderRaw = (parsed.gender || parsed.sex || parsed.genderAr || '').toString().trim();
  let birthDateRaw = (parsed.birthDate || parsed.dob || parsed.birth_date || parsed.dateOfBirth || parsed.date_of_birth || '').toString().trim();
  let passportNo = (parsed.passportNo || parsed.passport_no || parsed.passportNumber || parsed.passport || '').toString().trim().toUpperCase();
  let residencyType = (parsed.residencyType || parsed.residency_type || parsed.article || parsed.residencyArticle || '').toString().trim();
  let profession = (parsed.profession || parsed.jobTitle || parsed.job_title || parsed.occupation || '').toString().trim();
  let expiryDate = toWesternDigits((parsed.expiryDate || parsed.expiry_date || parsed.expirationDate || '').toString()).trim();
  let issueDate = toWesternDigits((parsed.issueDate || parsed.issue_date || '').toString()).trim();
  let unifiedNo = toWesternDigits((parsed.unifiedNo || parsed.unified_no || parsed.referenceNo || '').toString()).trim();
  let mohLicenseNo = toWesternDigits((parsed.mohLicenseNo || parsed.moh_license_no || '').toString()).trim();
  let mohLicenseExpiryDate = toWesternDigits((parsed.mohLicenseExpiryDate || parsed.moh_license_expiry || '').toString()).trim();
  let passportExpiryDateRaw = (parsed.passportExpiryDate || parsed.passport_expiry_date || parsed.passportExpiry || '').toString().trim();
  let residencyExpiryDateRaw = (parsed.residencyExpiryDate || parsed.residency_expiry_date || parsed.residencyExpiry || '').toString().trim();
  let paciBuildingRef = toWesternDigits((parsed.paciBuildingRef || parsed.paci_building_ref || parsed.paciBuildingNumber || parsed.paciBuildingRefNo || '').toString()).replace(/\D/g, '').trim();

  const formatOcrDate = (raw: string): string => {
    if (!raw) return '';
    const clean = toWesternDigits(raw).replace(/[\/\.]/g, '-');
    const parts = clean.split('-').map(p => p.trim());
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return clean;
  };

  let birthDate = formatOcrDate(birthDateRaw);
  expiryDate = formatOcrDate(expiryDate);
  issueDate = formatOcrDate(issueDate);
  let passportExpiryDate = formatOcrDate(passportExpiryDateRaw);
  let residencyExpiryDate = formatOcrDate(residencyExpiryDateRaw);

  let gender = 'MALE';
  if (genderRaw) {
    const gUpper = genderRaw.toUpperCase();
    if (gUpper.includes('FEMALE') || gUpper.includes('أنثى') || gUpper === 'F') {
      gender = 'FEMALE';
    } else if (gUpper.includes('MALE') || gUpper.includes('ذكر') || gUpper === 'M') {
      gender = 'MALE';
    }
  }

  // Automatic Fallback: Compute birthDate and gender from Kuwait Civil ID (12 digits) if missing or incomplete
  if (civilId.length === 12) {
    const parsedCivil = parseKuwaitCivilId(civilId);
    if (parsedCivil) {
      if (!birthDate || birthDate.length !== 10) {
        birthDate = parsedCivil.birthDate;
      }
      if (!genderRaw || genderRaw === '') {
        gender = parsedCivil.gender;
      }
    }
  }

  return {
    ...parsed,
    civilId,
    fullNameAr,
    fullName: fullNameAr,
    fullNameEn,
    nationality: nationality || 'كويتي',
    gender,
    birthDate,
    dob: birthDate,
    unifiedNo,
    passportNo,
    profession,
    jobTitle: profession,
    expiryDate,
    issueDate,
    residencyType,
    mohLicenseNo,
    mohLicenseExpiryDate,
    passportExpiryDate,
    residencyExpiryDate,
    paciBuildingRef,
    bloodGroup: parsed.bloodGroup || '',
    address: parsed.address || { block: '', street: '', building: '', area: '' },
    contractSalary: Number(parsed.contractSalary) || 0
  };
}

/**
 * دالة تحديث واستقبال بيانات الـ OCR حسب نوع المستند الممسوح (Document Type Logic):
 * 1. بطاقة مدنية (civil_id): المرجع الأساسي للاسم العربي، الرقم المدني، تاريخ الميلاد، والجنسية.
 * 2. جواز سفر (passport): يحدّث فقط: رقم الجواز (passport_no)، تاريخ انتهاء الجواز (passport_expiry)، والاسم بالإنجليزي (name_en إذا كان فارغاً)، ولا يلمس الرقم المدني أو الاسم بالعربية.
 * 3. ترخيص صحي / مزاولة مهنة (medical_license / license): يحدّث فقط: رقم الترخيص (license_no)، تاريخ انتهاء الترخيص (license_expiry)، والمسمى الفني للترخيص، ولا يلمس البيانات الشخصية.
 */
export const handleOcrResult = (
  scannedData: any, 
  docType: string, 
  setFormData?: (updater: (prev: any) => any) => void
) => {
  const updater = (prev: any) => {
    const current = prev || {};
    const normalizedDoc = (docType || scannedData?.documentType || 'civil_id').toLowerCase();

    // 1. حالة البطاقة المدنية: تحديث البيانات الشخصية الأساسية والمسمى الوظيفي
    if (normalizedDoc === 'civil_id' || normalizedDoc === 'civilid') {
      return {
        ...current,
        civil_id: scannedData.civil_id || scannedData.civilId || current.civil_id || current.civilId,
        civilId: scannedData.civil_id || scannedData.civilId || current.civilId || current.civil_id,
        civil_id_number: scannedData.civil_id || scannedData.civilId || current.civil_id_number || current.civilId,
        full_name: scannedData.full_name || scannedData.fullNameAr || scannedData.fullName || current.full_name || current.name,
        name: scannedData.full_name || scannedData.fullNameAr || scannedData.fullName || current.name || current.full_name,
        fullNameAr: scannedData.full_name || scannedData.fullNameAr || scannedData.fullName || current.fullNameAr || current.nameAr,
        nameAr: scannedData.full_name || scannedData.fullNameAr || scannedData.fullName || current.nameAr || current.fullNameAr,
        nationality: scannedData.nationality || current.nationality,
        birth_date: scannedData.birth_date || scannedData.birthDate || scannedData.dob || current.birth_date || current.birthDate,
        birthDate: scannedData.birth_date || scannedData.birthDate || scannedData.dob || current.birthDate || current.birth_date,
        gender: scannedData.gender || current.gender,
        civil_id_expiry: scannedData.expiry_date || scannedData.expiryDate || scannedData.civil_id_expiry || current.civil_id_expiry || current.civilIdExpiry,
        civilIdExpiry: scannedData.expiry_date || scannedData.expiryDate || scannedData.civil_id_expiry || current.civilIdExpiry || current.civil_id_expiry,
        jobTitle: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.jobTitle || '',
        profession: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.profession || '',
      };
    }

    // 2. حالة جواز السفر: تحديث بيانات الجواز فقط
    if (normalizedDoc === 'passport') {
      const existingNameEn = current.name_en || current.nameEn || current.fullNameEn;
      const incomingNameEn = scannedData.name_en || scannedData.fullNameEn || scannedData.nameEn;
      return {
        ...current,
        passport_no: scannedData.passport_no || scannedData.passportNo || current.passport_no || current.passportNo,
        passportNo: scannedData.passport_no || scannedData.passportNo || current.passportNo || current.passport_no,
        passport_expiry: scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate || current.passport_expiry || current.passportExpiry,
        passportExpiry: scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate || current.passportExpiry || current.passport_expiry,
        name_en: existingNameEn ? existingNameEn : (incomingNameEn || existingNameEn),
        nameEn: existingNameEn ? existingNameEn : (incomingNameEn || existingNameEn),
        fullNameEn: existingNameEn ? existingNameEn : (incomingNameEn || existingNameEn),
      };
    }

    // 3. حالة الترخيص الصحي (وزارة الصحة MOH): تحديث التراخيص فقط
    if (normalizedDoc === 'medical_license' || normalizedDoc === 'license' || normalizedDoc === 'moh_license' || normalizedDoc === 'professional_license') {
      return {
        ...current,
        medical_license_no: scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense || current.medical_license_no || current.mohLicense,
        medical_license_expiry: scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry || scannedData.expiryDate || current.medical_license_expiry || current.mohLicenseExpiry,
        mohLicense: scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense || current.mohLicense || current.medical_license_no,
        mohLicenseExpiry: scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry || scannedData.expiryDate || current.mohLicenseExpiry || current.medical_license_expiry,
        license_title: scannedData.license_title || scannedData.profession || scannedData.jobTitle || current.license_title,
        specialty: scannedData.license_title || scannedData.profession || scannedData.jobTitle || current.specialty || '',
      };
    }

    // 4. حالة إذن العمل (PAM Work Permit): تحديث بيانات إذن العمل والرواتب والمسمى
    if (normalizedDoc === 'work_permit' || normalizedDoc === 'workpermit' || normalizedDoc === 'pam_work_permit') {
      const parsedSalary = parseFloat(scannedData.contractSalary || scannedData.salary || '') || undefined;
      return {
        ...current,
        workPermitNo: scannedData.workPermitNo || scannedData.work_permit_no || scannedData.pam_no || current.workPermitNo || '',
        work_permit_no: scannedData.workPermitNo || scannedData.work_permit_no || scannedData.pam_no || current.work_permit_no || '',
        pam_no: scannedData.workPermitNo || scannedData.work_permit_no || scannedData.pam_no || current.pam_no || '',
        contractStartDate: scannedData.issueDate || scannedData.work_permit_start || scannedData.pam_start || current.contractStartDate || '',
        contractEndDate: scannedData.expiryDate || scannedData.work_permit_end || scannedData.pam_end || current.contractEndDate || '',
        basicSalary: parsedSalary !== undefined ? parsedSalary : current.basicSalary,
        salary: parsedSalary !== undefined ? parsedSalary : current.salary,
        jobTitle: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.jobTitle || '',
        profession: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.profession || '',
      };
    }

    // 5. حالة عقد العمل (Employment Contract): تحديث تفاصيل العقد والراتب والتواريخ
    if (normalizedDoc === 'contract' || normalizedDoc === 'employment_contract' || normalizedDoc === 'contract_work' || normalizedDoc === 'signedcontract') {
      const parsedSalary = parseFloat(scannedData.contractSalary || scannedData.salary || '') || undefined;
      return {
        ...current,
        contractSigned: true,
        contractType: scannedData.contractType || current.contractType || 'محدد المدة',
        contractStartDate: scannedData.issueDate || scannedData.startDate || current.contractStartDate || current.hireDate || '',
        hireDate: scannedData.issueDate || scannedData.startDate || current.hireDate || current.contractStartDate || '',
        contractEndDate: scannedData.expiryDate || scannedData.endDate || current.contractEndDate || '',
        basicSalary: parsedSalary !== undefined ? parsedSalary : current.basicSalary,
        salary: parsedSalary !== undefined ? parsedSalary : current.salary,
        jobTitle: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.jobTitle || '',
        profession: scannedData.profession || scannedData.jobTitle || scannedData.job_title || current.profession || '',
        probationDays: scannedData.probationDays || current.probationDays || 100,
        contractSignDate: scannedData.issueDate || current.contractSignDate || new Date().toISOString().split('T')[0],
      };
    }

    return current;
  };

  if (setFormData) {
    setFormData(updater);
  }
  return updater(undefined);
};
