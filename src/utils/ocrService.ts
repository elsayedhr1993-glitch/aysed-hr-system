import * as pdfjsLib from 'pdfjs-dist';
// Vite will statically analyze this and serve the file correctly
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

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

  // Get active Gemini API key from parameters, localStorage fallback (custom_gemini_key / custom_gemini_api_key)
  const effectiveApiKey = apiKey || 
    (typeof window !== 'undefined' ? (
      localStorage.getItem('custom_gemini_key') || 
      localStorage.getItem('custom_gemini_api_key') || 
      localStorage.getItem('gemini_api_key')
    ) : null);

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

  const text = await response!.text();
  let result;
  try { result = JSON.parse(text); } catch(e) { throw new Error('استجابة غير صالحة من الخادم (تحديث النظام).'); }
  return result.data;
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
  "passportNo": "رقم جواز السفر إن وجد",
  "profession": "المهنة أو المسمى الوظيفي المسجل",
  "expiryDate": "تاريخ الانتهاء للبطاقة المدنية أو الإقامة YYYY-MM-DD",
  "issueDate": "تاريخ الإصدار YYYY-MM-DD",
  "mohLicenseNo": "رقم الترخيص الصحي إن وجد",
  "mohLicenseExpiryDate": "تاريخ انتهاء الترخيص الصحي YYYY-MM-DD",
  "residencyType": "نوع الإقامة",
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
            inlineData: {
              data: rawBase64,
              mimeType: resolvedMimeType
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  // سنقوم بتجربة Gemini 2.5 Flash كونه مجاني وسريع جداً وممتاز في الاستخراج
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('Client-side Gemini API call failed:', errorText);
    throw new Error('فشل الاتصال المباشر بخوادم جوجل للذكاء الاصطناعي. يرجى التحقق من صلاحية مفتاح الـ API.');
  }

  const json = await response.json();
  const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  
  // استخراج الـ JSON بأمان من النص المسترجع
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

  return {
    civilId: parsed.civilId || "",
    fullNameAr: parsed.fullNameAr || parsed.fullName || "",
    fullNameEn: parsed.fullNameEn || "",
    nationality: parsed.nationality || "",
    gender: parsed.gender || "MALE",
    birthDate: parsed.birthDate || parsed.dob || "",
    dob: parsed.birthDate || parsed.dob || "",
    unifiedNo: parsed.unifiedNo || "",
    passportNo: parsed.passportNo || "",
    profession: parsed.profession || parsed.jobTitle || "",
    jobTitle: parsed.profession || parsed.jobTitle || "",
    expiryDate: parsed.expiryDate || "",
    issueDate: parsed.issueDate || "",
    bloodGroup: parsed.bloodGroup || "",
    address: parsed.address || { block: "", street: "", building: "", area: "" },
    residencyType: parsed.residencyType || "",
    mohLicenseNo: parsed.mohLicenseNo || "",
    mohLicenseExpiryDate: parsed.mohLicenseExpiryDate || "",
    contractSalary: Number(parsed.contractSalary) || 0,
  };
}
