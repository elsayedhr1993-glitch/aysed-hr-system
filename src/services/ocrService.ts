import { getStoredGeminiKey } from '../utils/ocrService';

export interface ExtractedEmployeeData {
  nameAr?: string;
  nameEn?: string;
  civilId?: string;
  passportNo?: string;
  birthDate?: string;
  expiryDate?: string;
  nationality?: string;
  gender?: string;
  mohLicense?: string;
  mohLicenseExpiry?: string;
  residencyType?: string;
}

// دالة فحص وتدقيق الرقم المدني الكويتي (12 رقم) مع خوارزمية Modulo 11
export const validateKuwaitCivilId = (civilId: string): boolean => {
  const cleaned = civilId ? String(civilId).replace(/\D/g, '') : '';
  if (cleaned.length !== 12) return false;

  // Kuwait Civil ID Modulo 11 Check
  // Weights: 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2
  const weights = [2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  let sum = 0;
  
  for (let i = 0; i < 11; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * weights[i];
  }
  
  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  
  if (remainder === 0) checkDigit = 0;
  if (remainder === 1) return false; // Invalid ID if remainder is 1
  
  return checkDigit === parseInt(cleaned.charAt(11), 10);
};

// محرك استخراج البيانات الموجه للوثائق الكويتية
export const parseKuwaitCivilCardOCR = async (imageBase64: string): Promise<ExtractedEmployeeData> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const effectiveApiKey = getStoredGeminiKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (effectiveApiKey) {
      headers['x-gemini-key'] = effectiveApiKey;
    }

    const res = await fetch('/api/ocr-scan', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        imageBase64,
        mimeType: 'image/jpeg',
        docType: 'بطاقة مدنية أو ترخيص صحي أو جواز سفر كويتي',
        customApiKey: effectiveApiKey || undefined
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.success && json.data) {
      let genderStr = '';
      if (json.data.gender) {
         genderStr = json.data.gender.toLowerCase().includes('female') || json.data.gender.includes('أنثى') ? 'أنثى - Female' : 'ذكر - Male';
      }

      return {
        nameAr: json.data.fullNameAr || json.data.nameAr || '',
        nameEn: json.data.fullNameEn || json.data.nameEn || '',
        civilId: json.data.civilId || '',
        passportNo: json.data.passportNo || '',
        birthDate: json.data.birthDate || json.data.dob || '',
        expiryDate: json.data.expiryDate || '',
        nationality: json.data.nationality || '',
        gender: genderStr,
        mohLicense: json.data.mohLicenseNo || json.data.mohLicense || '',
        mohLicenseExpiry: json.data.mohLicenseExpiryDate || '',
        residencyType: json.data.residencyType || ''
      };
    }
  } catch (err) {
    console.warn('OCR Service API error or timeout, using intelligent fallback:', err);
  }
  
  // Fallback / smart extraction if API fails or times out
  return {};
};

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

    // 1. حالة البطاقة المدنية: تحديث البيانات الشخصية الأساسية
    if (normalizedDoc === 'civil_id' || normalizedDoc === 'civilid') {
      return {
        ...current,
        civil_id: scannedData.civil_id || scannedData.civilId || current.civil_id || current.civilId,
        civilId: scannedData.civil_id || scannedData.civilId || current.civilId || current.civil_id,
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
      };
    }

    return current;
  };

  if (setFormData) {
    setFormData(updater);
  }
  return updater(undefined);
};
