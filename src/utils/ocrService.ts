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

/**
 * دالة تحويل الصفحة الأولى من ملف الـ PDF أو BDF إلى صورة عالية الجودة (Canvas rendering) داخل المتصفح
 */
async function convertPdfPageToImage(file: File): Promise<{ base64: string; mimeType: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error('فشل في إنشاء سياق Canvas');

    await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;
    
    return {
      base64: canvas.toDataURL('image/jpeg', 0.95),
      mimeType: 'image/jpeg'
    };
  } catch (err) {
    console.error("PDF to Image conversion failed:", err);
    // Fallback to raw file reader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        base64: reader.result as string,
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
 * دالة جلب مفتاح Gemini الحقيقي المخزن في المتصفح بكل المسميات المحتملة
 */
export function getStoredGeminiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const knownKeys = [
    'custom_gemini_key',
    'custom_gemini_api_key',
    'gemini_api_key',
    'sys_gemini_key',
    'VITE_GEMINI_API_KEY'
  ];
  for (const k of knownKeys) {
    const val = localStorage.getItem(k);
    if (val && val.trim() !== '' && !val.includes('YOUR_')) {
      return val.trim().replace(/^['"]|['"]$/g, '');
    }
  }
  // البحث الشامل في localStorage لأي مفتاح يحتوي على gemini
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.toLowerCase().includes('gemini') && (k.toLowerCase().includes('key') || k.toLowerCase().includes('api'))) {
      const val = localStorage.getItem(k);
      if (val && val.trim() !== '' && !val.includes('YOUR_')) {
        return val.trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return null;
}

/**
 * الدالة الرئيسية الشاملة للماسح الضوئي الذكي (تعالج PDF, BDF, والـ صور بكفاءة عالية)
 */
export async function processAnyDocument(file: File, apiKey?: string, docType?: string): Promise<ScannedData> {
  const fileNameLower = file.name.toLowerCase();
  const isPdfOrBdf = file.type === 'application/pdf' || 
                     file.type.includes('pdf') || 
                     fileNameLower.endsWith('.pdf') || 
                     fileNameLower.endsWith('.bdf');

  let docData: { base64: string; mimeType: string };

  if (isPdfOrBdf) {
    docData = await convertPdfPageToImage(file);
  } else {
    docData = await convertImageToBase64(file);
  }

  // Get active Gemini API key from parameters or localStorage fallback
  const effectiveApiKey = apiKey || getStoredGeminiKey();

  // إرسال البيانات لمعالج الرؤية البصرية في السيرفر
  let response;
  let useClientFallback = false;
  let serverErrorMsg = '';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (effectiveApiKey && effectiveApiKey.trim() !== '') {
      headers['x-gemini-key'] = effectiveApiKey.trim();
    }

    response = await fetch('/api/ocr-scan', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        imageBase64: docData.base64,
        mimeType: docData.mimeType,
        docType: docType || 'CIVIL_ID',
        customApiKey: effectiveApiKey || undefined,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      serverErrorMsg = errJson.error || 'فشل نظام القراءة الضوئية (OCR) في تحليل المستند.';
      if (effectiveApiKey && effectiveApiKey.trim() !== '') {
        useClientFallback = true;
      } else {
        throw new Error(serverErrorMsg + (errJson.details ? '\nالسبب: ' + errJson.details : ''));
      }
    }
  } catch (netErr: any) {
    if (effectiveApiKey && effectiveApiKey.trim() !== '') {
      useClientFallback = true;
      serverErrorMsg = netErr.message || 'فشل الاتصال بالخادم';
    } else {
      throw new Error('فشل الاتصال بالخادم. يرجى التأكد من اتصالك بالإنترنت أو تحديث الصفحة أو إدخال مفتاح الذكاء الاصطناعي في إعدادات النظام.');
    }
  }

  if (useClientFallback && effectiveApiKey) {
    console.info('Server OCR failed or timed out. Initiating direct client-side Gemini OCR fallback...', serverErrorMsg);
    try {
      return await performClientSideGeminiOCR(docData.base64, docData.mimeType, effectiveApiKey, docType);
    } catch (clientErr: any) {
      throw new Error(`تعذر المسح الضوئي تلقائياً. فشل المسح السحابي والمحلي.\nالسبب: ${clientErr.message || clientErr}`);
    }
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
 * دالة مسح ضوئي مباشرة من جهة العميل (Client-Side Direct Gemini API Call)
 * تحل مشكلة انتهاء مهلة الخادم (Gateway Timeout 10s) في بيئة Vercel
 */
async function performClientSideGeminiOCR(base64Data: string, mimeType: string, apiKey: string, docType?: string): Promise<ScannedData> {
  // تنظيف الـ base64 من البادئة
  let rawBase64 = base64Data.replace(/^data:.*?;base64,/, "").replace(/\s/g, "");
  
  // تحديد نوع الميديا المناسب
  let resolvedMimeType = mimeType || "image/jpeg";
  if (rawBase64.startsWith("JVBERi")) {
    resolvedMimeType = "application/pdf";
  } else if (rawBase64.startsWith("/9j/")) {
    resolvedMimeType = "image/jpeg";
  } else if (rawBase64.startsWith("iVBORw")) {
    resolvedMimeType = "image/png";
  } else if (rawBase64.startsWith("UklGR")) {
    resolvedMimeType = "image/webp";
  }

  const prompt = `أنت نظام خبير في القراءة الضوئية واستخراج بيانات البطاقة المدنية والمستندات الرسمية الكويتية بدقة مطلقة (OCR Vision Engine).
مهمتك استخراج كافة حقول وبيانات المستند المرفق حصرياً بدقة 100% دون أي تخمين. تحذير شديد: إياك أن تؤلف بيانات وهمية (مثل أحمد محمد عبدالله أو أرقام عشوائية). إذا لم تستطع قراءة حقل، أرجعه فارغاً "".
أرجع الناتج بصيغة JSON فقط مطابق لهذا الهيكل بدقة:
{
  "civilId": "الرقم المدني (12 رقماً)",
  "fullNameAr": "الاسم الكامل بالعربية",
  "fullNameEn": "الاسم الكامل بالإنجليزية",
  "nationality": "الجنسية",
  "gender": "ذكر أو أنثى / MALE أو FEMALE",
  "birthDate": "YYYY-MM-DD",
  "unifiedNo": "الرقم الموحد / الرقم المرجع",
  "passportNo": "رقم جواز السفر إن وجد بالوجه الخلفي للبطاقة أو في جواز السفر",
  "passportExpiryDate": "تاريخ انتهاء جواز السفر إن وجد بالوجه الخلفي للبطاقة أو في جواز السفر YYYY-MM-DD",
  "residencyExpiryDate": "تاريخ انتهاء الإقامة المستقل والمكتوب بظهر البطاقة المدنية YYYY-MM-DD",
  "paciBuildingRef": "الرقم الآلي للعنوان (8 أرقام) المكتوب بظهر البطاقة المدنية"،
  "profession": "المهنة أو المسمى الوظيفي المسجل",
  "expiryDate": "تاريخ الانتهاء للبطاقة المدنية أو الإقامة YYYY-MM-DD",
  "issueDate": "تاريخ الإصدار YYYY-MM-DD",
  "mohLicenseNo": "رقم الترخيص الصحي إن وجد",
  "mohLicenseExpiryDate": "تاريخ انتهاء الترخيص الصحي YYYY-MM-DD",
  "residencyType": "نوع الإقامة أو مادة الإقامة (مثل مادة 18 أو غيرها)",
  "bloodGroup": "فصيلة الدم",
  "address": {
    "block": "القطعة",
    "street": "الشارع",
    "building": "المبنى / القسيمة",
    "area": "المنطقة / المحافظة"
  }
}`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              data: rawBase64,
              mime_type: resolvedMimeType
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      response_mime_type: "application/json"
    }
  };

  const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-1.5-flash"];
  let lastErrorDetail = '';

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const json = await response.json();
        const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        let cleanedJsonText = textResponse.trim();
        if (cleanedJsonText.includes('```json')) {
          cleanedJsonText = cleanedJsonText.split('```json')[1].split('```')[0].trim();
        } else if (cleanedJsonText.includes('```')) {
          cleanedJsonText = cleanedJsonText.split('```')[1].split('```')[0].trim();
        }

        let parsed: any;
        try {
          parsed = JSON.parse(cleanedJsonText);
        } catch (parseErr) {
          console.error('Failed to parse Gemini JSON output:', cleanedJsonText);
          throw new Error('فشل في معالجة صيغة البيانات المستخرجة من المستند.');
        }

        return normalizeScannedData(parsed);
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastErrorDetail = errJson.error?.message || `كود الاستجابة ${response.status}`;
        console.warn(`Gemini model ${modelName} call failed:`, lastErrorDetail);
      }
    } catch (err: any) {
      lastErrorDetail = err.message || String(err);
      console.warn(`Gemini model ${modelName} error:`, lastErrorDetail);
    }
  }

  let userFriendlyCause = lastErrorDetail;
  if (lastErrorDetail.includes('API_KEY_INVALID') || lastErrorDetail.includes('API key not valid') || lastErrorDetail.includes('400')) {
    userFriendlyCause = 'مفتاح الـ API الممرر غير صحيح أو لم يتم تفعيله في Google AI Studio.';
  } else if (lastErrorDetail.includes('RESOURCE_EXHAUSTED') || lastErrorDetail.includes('429') || lastErrorDetail.includes('Quota')) {
    userFriendlyCause = 'تم تجاوز الحد الأقصى للاستخدام اليومي لمفتاح الـ API (Quota Exceeded).';
  } else if (lastErrorDetail.includes('PERMISSION_DENIED')) {
    userFriendlyCause = 'مفتاح الـ API لا يملك صلاحية الوصول لنماذج الذكاء الاصطناعي.';
  }

  throw new Error(`فشل الاتصال المباشر بخوادم جوجل للذكاء الاصطناعي.\nالسبب: ${userFriendlyCause}`);
}
