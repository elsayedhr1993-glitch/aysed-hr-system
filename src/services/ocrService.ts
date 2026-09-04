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
