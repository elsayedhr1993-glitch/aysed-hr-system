import type { Express, Request, Response } from 'express';
import express from 'express';
import { Type } from '@google/genai';
import { getOcrModelCandidates } from '../src/config/aiConfig.ts';
import { parseJsonFromAiText } from '../src/utils/ocrJsonParse.ts';
import { requireFirebaseAuthFromHeader } from './apiAuth.ts';
import { getGeminiClient } from './geminiServer.ts';

const OCR_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const OCR_RATE_LIMIT_MAX_REQUESTS = 12;
const OCR_RATE_LIMIT_BLOCK_MS = 5 * 60 * 1000;
const OCR_MAX_TOTAL_FILE_BYTES = 15 * 1024 * 1024;
const OCR_MAX_SINGLE_PAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_OCR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ocrRateLimitStore = new Map<string, { windowStart: number; count: number; blockedUntil?: number }>();

function getClientIpAddress(req: any): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function logOcrAudit(event: string, data: Record<string, unknown>) {
  console.warn(`[OCR Audit] ${event}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

function enforceOcrRateLimit(req: any, res: any): boolean {
  const ip = getClientIpAddress(req);
  const now = Date.now();
  const entry = ocrRateLimitStore.get(ip);

  if (entry?.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000));
    res.setHeader("Retry-After", String(retryAfterSeconds));
    logOcrAudit("rate_limit_blocked", { ip, retryAfterSeconds });
    res.status(429).json({
      error: "تم تجاوز الحد المسموح لطلبات OCR من هذا الجهاز مؤقتاً.",
      details: `يرجى الانتظار ${retryAfterSeconds} ثانية ثم إعادة المحاولة.`,
    });
    return false;
  }

  if (!entry || now - entry.windowStart >= OCR_RATE_LIMIT_WINDOW_MS) {
    ocrRateLimitStore.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  entry.count += 1;
  if (entry.count > OCR_RATE_LIMIT_MAX_REQUESTS) {
    entry.blockedUntil = now + OCR_RATE_LIMIT_BLOCK_MS;
    const retryAfterSeconds = Math.ceil(OCR_RATE_LIMIT_BLOCK_MS / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    logOcrAudit("rate_limit_exceeded", { ip, count: entry.count, windowMs: OCR_RATE_LIMIT_WINDOW_MS });
    res.status(429).json({
      error: "تم تجاوز الحد المسموح لطلبات OCR.",
      details: "لحماية الخدمة، تم إيقاف الطلبات مؤقتاً لهذا المصدر.",
    });
    return false;
  }

  ocrRateLimitStore.set(ip, entry);
  return true;
}
function parseKuwaitCivilIdServer(civilId: string): { birthDate: string; gender: 'MALE' | 'FEMALE' } | null {
  const cleanId = (civilId || '').replace(/\D/g, '');
  if (cleanId.length !== 12) return null;

  const centuryDigit = cleanId.charAt(0);
  const yy = cleanId.substring(1, 3);
  const mm = cleanId.substring(3, 5);
  const dd = cleanId.substring(5, 7);
  const genderDigit = parseInt(cleanId.charAt(8), 10) || parseInt(cleanId.charAt(9), 10);

  const century = centuryDigit === '2' ? '19' : '20';
  const birthDate = `${century}${yy}-${mm}-${dd}`;
  const gender = (genderDigit % 2 !== 0) ? 'MALE' : 'FEMALE';

  return { birthDate, gender };
}

function normalizeOcrDataServer(parsed: any) {
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
  let expiryDate = toWesternDigits((parsed.expiryDate || parsed.expiry_date || parsed.expirationDate || parsed.civilIdExpiry || '').toString()).trim();
  let issueDate = toWesternDigits((parsed.issueDate || parsed.issue_date || '').toString()).trim();
  let unifiedNo = toWesternDigits((parsed.unifiedNo || parsed.unified_no || parsed.referenceNo || '').toString()).trim();
  let mohLicenseNo = toWesternDigits((parsed.mohLicenseNo || parsed.moh_license_no || '').toString()).trim();
  let mohLicenseExpiryDate = toWesternDigits((parsed.mohLicenseExpiryDate || parsed.moh_license_expiry || '').toString()).trim();

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
    const parsedCivil = parseKuwaitCivilIdServer(civilId);
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
    pamStartDate: parsed.pamStartDate || '',
    pamEndDate: parsed.pamEndDate || '',
    basicSalary: parsed.basicSalary || '',
    bloodGroup: parsed.bloodGroup || '',
    address: parsed.address || { block: '', street: '', building: '', area: '' },
    contractSalary: Number(parsed.contractSalary) || Number(parsed.basicSalary) || 0
  };
}
export async function handleOcrScanHttp(req: Request, res: Response) {
  const authCheck = await requireFirebaseAuthFromHeader(req.headers?.authorization || req.headers?.Authorization);
  if (!authCheck.ok) {
    return res.status(authCheck.status).json({ success: false, error: authCheck.error });
  }

  if (!enforceOcrRateLimit(req, res)) {
    return;
  }

  const { imageBase64, imageBase64Pages, mimeType, docType } = req.body;
  const clientIp = getClientIpAddress(req);

  const normalizePageInputs = (input: any): string[] => {
    if (!Array.isArray(input)) return [];
    return input
      .filter((v) => typeof v === 'string' && v.trim() !== '')
      .map((v) => v.trim())
      .slice(0, 4);
  };

  const pageInputs = normalizePageInputs(imageBase64Pages);
  if (!imageBase64 && pageInputs.length === 0) {
    logOcrAudit("invalid_request_empty_payload", { ip: clientIp, docType: docType || "unknown" });
    return res.status(400).json({ error: "يرجى اختيار ورفع صورة المستند الحقيقي أولاً قبل إجراء الماسح الضوئي OCR" });
  }

  const rawInputs = pageInputs.length > 0 ? pageInputs : [imageBase64];
  const stripDataUrl = (value: string) => value.replace(/^data:.*?;base64,/, "").replace(/\s/g, "");
  const extractMimeFromDataUrl = (value: string) => {
    const match = value.match(/^data:(.*?);base64,/i);
    return match?.[1] || '';
  };

  const firstRaw = stripDataUrl(rawInputs[0] || '');
  let resolvedMimeType = "image/jpeg";
  if (firstRaw.startsWith("JVBERi")) {
    resolvedMimeType = "application/pdf";
  } else if (firstRaw.startsWith("/9j/")) {
    resolvedMimeType = "image/jpeg";
  } else if (firstRaw.startsWith("iVBORw")) {
    resolvedMimeType = "image/png";
  } else if (firstRaw.startsWith("UklGR")) {
    resolvedMimeType = "image/webp";
  } else {
    resolvedMimeType = extractMimeFromDataUrl(rawInputs[0] || '') || mimeType || "image/jpeg";
  }

  resolvedMimeType = (resolvedMimeType || "").toLowerCase().trim();
  if (!ALLOWED_OCR_MIME_TYPES.has(resolvedMimeType)) {
    logOcrAudit("invalid_mime_type", {
      ip: clientIp,
      mimeType: resolvedMimeType,
      docType: docType || "unknown",
      pages: rawInputs.length,
    });
    return res.status(415).json({
      error: "صيغة الملف غير مدعومة للماسح الضوئي.",
      details: "الصيغ المسموح بها: JPG, PNG, WEBP, PDF.",
    });
  }

  const normalizedPages = rawInputs.map((payload) => {
    const payloadMime = extractMimeFromDataUrl(payload) || resolvedMimeType;
    return {
      data: stripDataUrl(payload),
      mimeType: payloadMime
    };
  });

  const pageBytes = normalizedPages.map((page) => {
    try {
      return Buffer.byteLength(page.data, "base64");
    } catch {
      return Number.NaN;
    }
  });
  const hasInvalidBase64 = pageBytes.some((size) => !Number.isFinite(size) || size <= 0);
  if (hasInvalidBase64) {
    logOcrAudit("invalid_base64_payload", { ip: clientIp, docType: docType || "unknown", pages: normalizedPages.length });
    return res.status(400).json({
      error: "الملف المرفوع غير صالح.",
      details: "تعذر قراءة ترميز الملف (Base64). يرجى إعادة الرفع والمحاولة مرة أخرى.",
    });
  }

  const totalBytes = pageBytes.reduce((sum, size) => sum + size, 0);
  const tooLargePageIndex = pageBytes.findIndex((size) => size > OCR_MAX_SINGLE_PAGE_BYTES);
  if (tooLargePageIndex >= 0 || totalBytes > OCR_MAX_TOTAL_FILE_BYTES) {
    logOcrAudit("payload_too_large", {
      ip: clientIp,
      docType: docType || "unknown",
      pages: normalizedPages.length,
      totalBytes,
      pageBytes,
    });
    return res.status(413).json({
      error: "حجم الملف يتجاوز الحد المسموح للماسح الضوئي.",
      details: "الحد الأقصى لكل صفحة 8MB وبإجمالي 15MB للطلب الواحد.",
    });
  }

  const systemPrompt = `أنت نظام خبير في القراءة الضوئية واستخراج بيانات البطاقة المدنية وجواز السفر والإقامة والمستندات الرسمية الكويتية (Kuwait OCR Vision Engine).
مهمتك استخراج كافة النصوص والبيانات الحقيقية الموجودة في المستند بدقة 100% دون أي تخمين. تحذير شديد: إياك أن تؤلف بيانات وهمية. إذا لم تجد الحقل، اتركه فارغاً.
قم باستخراج البيانات التالية بدقة:
- civilId: الرقم المدني الكويتي (12 رقماً).
- fullNameAr: الاسم الكامل بالعربية.
- fullNameEn: الاسم الكامل بالإنجليزية (Full Name in English).
- nationality: الجنسية المسجلة (مثال: مصري، كويتي، هندي، سوري، أردني، فلبيني، إلخ).
- gender: نوع الجنس (ذكر أو أنثى / MALE أو FEMALE).
- birthDate: تاريخ الميلاد بصيغة YYYY-MM-DD. ابحث بتمعن عن تاريخ الميلاد / Birth Date / Date of Birth.
- passportNo: رقم جواز السفر (Passport No) من الجواز أو خلفية البطاقة أو الإقامة.
- residencyType: نوع الإقامة أو رقم المادة (مثال: مادة 18، مادة 17، مادة 22، مادة 20، إقامة عمل، مواطن).
- unifiedNo: الرقم الموحد / الرقم المرجع.
- profession: المهنة أو الوظيفة المسجلة.
- expiryDate: تاريخ انتهاء الوثيقة YYYY-MM-DD.
- issueDate: تاريخ الإصدار YYYY-MM-DD.
- mohLicenseNo: رقم ترخيص وزارة الصحة إن وجد.
- mohLicenseExpiryDate: تاريخ انتهاء ترخيص الصحة YYYY-MM-DD.
- pamStartDate: تاريخ بداية إذن العمل أو العقد YYYY-MM-DD.
- pamEndDate: تاريخ نهاية إذن العمل أو العقد YYYY-MM-DD.
- basicSalary: الراتب الأساسي (أرقام فقط د.ك).
- bloodGroup: فصيلة الدم.
- address: تفاصيل العنوان (قطعة، شارع، مبنى، منطقة).

أرجع النتيجة حصرياً بصيغة JSON مطابق للهيكل التالي:
{
  "civilId": "",
  "fullNameAr": "",
  "fullNameEn": "",
  "nationality": "",
  "gender": "",
  "birthDate": "",
  "unifiedNo": "",
  "passportNo": "",
  "profession": "",
  "expiryDate": "",
  "issueDate": "",
  "mohLicenseNo": "",
  "mohLicenseExpiryDate": "",
  "pamStartDate": "",
  "pamEndDate": "",
  "basicSalary": "",
  "residencyType": "",
  "bloodGroup": "",
  "address": { "block": "", "street": "", "building": "", "area": "" }
}`;

  // 1. Check if OPENAI_API_KEY is available and use OpenAI Vision API
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const isPdfFile = resolvedMimeType === 'application/pdf' || resolvedMimeType?.includes('pdf');
  if (openaiApiKey && openaiApiKey.trim() !== "" && !openaiApiKey.includes("YOUR_") && !isPdfFile) {
    try {
      const userImageParts = normalizedPages.map((page) => ({
        type: "image_url",
        image_url: {
          url: `data:${page.mimeType || resolvedMimeType};base64,${page.data}`,
          detail: "high"
        }
      }));
      const oaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          temperature: 0,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: [
                { type: "text", text: `قم بتحليل المستند (${docType || 'بطاقة مدنية/جواز سفر'}) عبر جميع الصفحات/الأوجه المرفقة واستخراج كافة الحقول وخاصة (تاريخ الميلاد، الجنسية، نوع الجنس، رقم الجواز، ونوع الإقامة).` },
                ...userImageParts
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1500
        })
      });

      if (oaiResponse.ok) {
        const oaiData = await oaiResponse.json();
        const contentStr = oaiData.choices?.[0]?.message?.content || "{}";
        const parsed = parseJsonFromAiText(contentStr);
        if (!Object.keys(parsed).length) {
          console.error("[OCR OpenAI] JSON parse yielded empty object", {
            preview: String(contentStr).slice(0, 300),
          });
        }
        const normalized = normalizeOcrDataServer(parsed);
        return res.json({
          success: true,
          data: normalized,
          source: "openai-vision-gpt4o"
        });
      }
    } catch (oaiErr) {
      console.error("OpenAI Vision error:", oaiErr);
      logOcrAudit("openai_vision_failure", {
        ip: clientIp,
        docType: docType || "unknown",
        mimeType: resolvedMimeType,
        pages: normalizedPages.length,
      });
    }
  }

  const ai = getGeminiClient();
  if (!ai) {
    logOcrAudit("missing_server_ai_key", {
      ip: clientIp,
      docType: docType || "unknown",
      mimeType: resolvedMimeType,
    });
    return res.status(400).json({ 
      error: "مفتاح الذكاء الاصطناعي على الخادم غير متوفر (GEMINI_API_KEY أو OPENAI_API_KEY). يرجى تهيئة متغيرات البيئة." 
    });
  }

  const modelsToTry = getOcrModelCandidates();
  let lastError: any = null;
  let firstError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            ...normalizedPages.map((page) => ({
              inlineData: {
                data: page.data,
                mimeType: page.mimeType || resolvedMimeType,
              },
            })),
            { text: systemPrompt + "\nاعتمد جميع الصفحات/الأوجه المرفقة معاً قبل الإخراج." },
          ],
        },
        config: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              civilId: { type: Type.STRING },
              fullNameAr: { type: Type.STRING },
              fullNameEn: { type: Type.STRING },
              nationality: { type: Type.STRING },
              gender: { type: Type.STRING },
              birthDate: { type: Type.STRING },
              unifiedNo: { type: Type.STRING },
              passportNo: { type: Type.STRING },
              profession: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              issueDate: { type: Type.STRING },
              mohLicenseNo: { type: Type.STRING },
              mohLicenseExpiryDate: { type: Type.STRING },
              residencyType: { type: Type.STRING },
              bloodGroup: { type: Type.STRING },
              address: {
                type: Type.OBJECT,
                properties: {
                  block: { type: Type.STRING },
                  street: { type: Type.STRING },
                  building: { type: Type.STRING },
                  area: { type: Type.STRING },
                }
              },
            },
          },
        },
      });

      const responseText = response.text || "{}";
      const parsedData = parseJsonFromAiText(responseText);
      if (!Object.keys(parsedData).length) {
        throw new Error(
          `Gemini returned non-JSON or empty JSON (model=${modelName}, preview=${String(responseText).slice(0, 120)})`
        );
      }
      const normalized = normalizeOcrDataServer(parsedData);

      return res.json({
        success: true,
        data: normalized,
        source: `gemini-vision-${modelName}`,
      });
    } catch (err: any) {
      console.error("[OCR Gemini] model failed with schema:", modelName, err?.message || err);
      if (!firstError) firstError = err;
      lastError = err;
      continue;
    }
  }

  // Fallback without schema
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            ...normalizedPages.map((page) => ({
              inlineData: {
                data: page.data,
                mimeType: page.mimeType || resolvedMimeType,
              },
            })),
            { text: systemPrompt + "\nاعتمد جميع الصفحات/الأوجه المرفقة معاً قبل الإخراج. أرجع النتيجة بصيغة JSON فقط." },
          ],
        },
        config: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedData = parseJsonFromAiText(responseText);
      if (!Object.keys(parsedData).length) {
        throw new Error(
          `Gemini noschema empty JSON (model=${modelName}, preview=${String(responseText).slice(0, 120)})`
        );
      }
      const normalized = normalizeOcrDataServer(parsedData);

      return res.json({
        success: true,
        data: normalized,
        source: `gemini-vision-${modelName}-noschema`,
      });
    } catch (err: any) {
      console.error("[OCR Gemini] model failed without schema:", modelName, err?.message || err);
      if (!firstError) firstError = err;
      lastError = err;
      continue;
    }
  }


  const errorMessage =
    firstError?.message || lastError?.message || firstError?.toString() || lastError?.toString() || "";
  let friendlyError = "فشل نظام القراءة الضوئية (OCR) في تحليل المستند.";
  let cause = "حدث خطأ داخلي أثناء معالجة الصورة وتحليل النصوص.";

  if (imageBase64 && imageBase64.length > 8 * 1024 * 1024) {
    friendlyError = "حجم المستند كبير جداً.";
    cause = "حجم الصورة المرفوعة يتجاوز الحد المسموح به لخادم الذكاء الاصطناعي. يرجى تقليل حجم أو دقة الصورة وإعادة المحاولة.";
  } else if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("key is invalid") || errorMessage.includes("API key not valid") || errorMessage.includes("unauthorized") || errorMessage.includes("invalid api key")) {
    friendlyError = "مفتاح الـ API غير صالح أو غير مهيأ.";
    cause = "مفتاح الذكاء الاصطناعي (Gemini/OpenAI API Key) الممرر غير صحيح أو لم يتم تهيئته بشكل صحيح في بيئة التشغيل المستقلة.";
  } else if (errorMessage.includes("QUOTA_EXCEEDED") || errorMessage.includes("Quota exceeded") || errorMessage.includes("429") || errorMessage.includes("LimitExceeded")) {
    friendlyError = "تم تجاوز حد الاستخدام المسموح به (Quota Exceeded).";
    cause = "تم استهلاك الحصة المجانية لمفتاح الـ API الحالي. يرجى تحديث المفتاح أو المحاولة مجدداً بعد فترة وجيزة.";
  } else if (errorMessage.includes("getaddrinfo") || errorMessage.includes("ENOTFOUND") || errorMessage.includes("fetch failed") || errorMessage.includes("timeout") || errorMessage.includes("Connection failed")) {
    friendlyError = "فشل الاتصال بخادم الذكاء الاصطناعي.";
    cause = "تعذر الاتصال بخوادم تحليل الرؤية البصرية بسبب انقطاع الاتصال بالإنترنت أو توقف الخادم عن الاستجابة.";
  } else if (errorMessage.includes("INVALID_ARGUMENT") || errorMessage.includes("mimetype") || errorMessage.includes("Unsupported mime type") || errorMessage.includes("unsupported")) {
    friendlyError = "صيغة الملف المرفوع غير صالحة.";
    cause = "المستند المرفوع يحتوي على ترميز أو امتداد غير مدعوم من محرك الـ OCR. يرجى تجربة ملف بصيغة JPG أو PNG أو PDF حقيقي.";
  } else if (errorMessage) {
    cause = errorMessage;
  }

  logOcrAudit("ocr_processing_failure", {
    ip: clientIp,
    docType: docType || "unknown",
    mimeType: resolvedMimeType,
    pages: normalizedPages.length,
    totalBytes,
    providerError: errorMessage || "unknown",
  });

  return res.status(500).json({
    error: friendlyError,
    details: cause
  });
}

export function registerOcrScanRoute(app: Express) {
  app.post('/api/ocr-scan', express.json({ limit: '50mb' }), handleOcrScanHttp);
}
