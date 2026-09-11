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
  pamStartDate?: string;
  pamEndDate?: string;
  basicSalary?: string;
  profession?: string;
}

// محرك استخراج البيانات الموجه للوثائق الكويتية
export const parseKuwaitCivilCardOCR = async (imageBase64: string, docTypeContext: string = 'بطاقة مدنية أو ترخيص صحي أو جواز سفر كويتي'): Promise<ExtractedEmployeeData> => {
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
        docType: docTypeContext,
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
        residencyType: json.data.residencyType || '',
        pamStartDate: json.data.pamStartDate || '',
        pamEndDate: json.data.pamEndDate || '',
        basicSalary: json.data.basicSalary || '',
        profession: json.data.profession || ''
      };
    }
  } catch (err) {
    console.warn('OCR Service API error or timeout, using intelligent fallback:', err);
  }
  
  // Fallback / smart extraction if API fails or times out
  return {};
};

// إعادة تصدير المعالج الموحد لنتائج الـ OCR من المصدر المركزي الوحيد
export { handleOcrResult } from '../utils/ocrService';
