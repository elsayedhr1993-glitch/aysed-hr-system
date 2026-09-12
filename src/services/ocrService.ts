import { normalizeScannedData } from '../utils/ocrService';

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

    const res = await fetch('/api/ocr-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType: 'image/jpeg',
        docType: docTypeContext
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.success && json.data) {
      const normalized = normalizeScannedData(json.data);
      let genderStr = '';
      if (normalized.gender) {
         genderStr = normalized.gender.toLowerCase().includes('female') || normalized.gender.includes('أنثى') ? 'أنثى - Female' : 'ذكر - Male';
      }

      return {
        nameAr: normalized.fullNameAr || normalized.fullName || '',
        nameEn: normalized.fullNameEn || '',
        civilId: normalized.civilId || '',
        passportNo: normalized.passportNo || '',
        birthDate: normalized.birthDate || normalized.dob || '',
        expiryDate: normalized.expiryDate || '',
        nationality: normalized.nationality || '',
        gender: genderStr,
        mohLicense: normalized.mohLicenseNo || '',
        mohLicenseExpiry: normalized.mohLicenseExpiryDate || '',
        residencyType: normalized.residencyType || '',
        pamStartDate: (normalized as any).pamStartDate || '',
        pamEndDate: (normalized as any).pamEndDate || '',
        basicSalary: String((normalized as any).basicSalary || ''),
        profession: normalized.profession || ''
      };
    }
  } catch (err) {
    console.warn('OCR Service API error or timeout:', err);
  }
  
  // Fallback / smart extraction if API fails or times out
  return {};
};

// إعادة تصدير المعالج الموحد لنتائج الـ OCR من المصدر المركزي الوحيد
export { handleOcrResult } from '../utils/ocrService';
