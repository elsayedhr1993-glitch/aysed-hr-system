import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import reshaperPkg from 'arabic-persian-reshaper';

export type PamFontChoice = 'cairo' | 'amiri';

/** Bump when DEFAULT_PAM_COORDINATES changes; Firestore layers below this are ignored. */
export const PAM_OVERLAY_SCHEMA_VERSION = 2;

export interface PamContractData {
  // إدارة العمل
  companyLaborDept: string;
  companyLaborDeptEn?: string;

  // اليوم والتاريخ
  contractDay: string;
  contractDayEn?: string;
  contractDate: string;

  // الطرف الأول (الشركة)
  companyName: string;
  companyNameEn?: string;
  companyRepName: string;
  companyRepNameEn?: string;
  companyRepCivilId: string;
  companyField: string;
  companyFieldEn?: string;

  // الطرف الثاني (العامل)
  employeeNameAr: string;
  employeeNameEn: string;
  employeeNationality: string;
  employeeNationalityEn?: string;
  employeeCivilId: string;
  employeeResidence: string;
  employeeResidenceEn?: string;

  // طبيعة العمل والراتب
  jobTitleAr: string;
  jobTitleEn: string;
  basicSalary: string | number;
  salaryPeriod: string;
  salaryPeriodEn?: string;

  // المدة والتواريخ
  effectiveDate: string;
  durationYears: string | number;
  leaveDay: string | number;
  leaveDayEn?: string;

  /** البند 15 — لغة العقد */
  contractLanguageAr?: string;
  contractLanguageEn?: string;
}

export interface FieldCoord {
  x: number; // in pt
  y: number; // in pt
  size?: number;
  align?: 'left' | 'right' | 'center';
  pageIndex?: number; // 0 for page 1, 1 for page 2
}

export interface PamCoordinatesConfig {
  // Page 1
  laborDeptAr: FieldCoord;
  laborDeptEn: FieldCoord;
  dayAr: FieldCoord;
  dateAr: FieldCoord;
  dayEn: FieldCoord;
  dateEn: FieldCoord;
  
  companyNameAr: FieldCoord;
  companyRepNameAr: FieldCoord;
  companyRepCivilIdAr: FieldCoord;
  companyNameEn: FieldCoord;
  companyRepNameEn: FieldCoord;
  companyRepCivilIdEn: FieldCoord;

  empNameAr: FieldCoord;
  empNationalityAr: FieldCoord;
  empCivilIdAr: FieldCoord;
  empResidenceAr: FieldCoord;
  empNameEn: FieldCoord;
  empNationalityEn: FieldCoord;
  empCivilIdEn: FieldCoord;
  empResidenceEn: FieldCoord;

  preambleCompanyNameAr: FieldCoord;
  preambleCompanyFieldAr: FieldCoord;
  preambleJobTitleAr: FieldCoord;
  preambleCompanyNameEn: FieldCoord;
  preambleCompanyFieldEn: FieldCoord;
  preambleJobTitleEn: FieldCoord;

  art2JobTitleAr: FieldCoord;
  art2JobTitleEn: FieldCoord;

  art4SalaryAr: FieldCoord;
  art4PeriodAr: FieldCoord;
  art4SalaryEn: FieldCoord;
  art4PeriodEn: FieldCoord;

  art5EffectiveDateAr: FieldCoord;
  art5EffectiveDateEn: FieldCoord;

  art6EffectiveDateAr: FieldCoord;
  art6DurationYearsAr: FieldCoord;
  art6EffectiveDateEn: FieldCoord;
  art6DurationYearsEn: FieldCoord;

  // Page 2
  art7LeaveDaysAr: FieldCoord;
  art7LeaveDaysEn: FieldCoord;
  art15LangAr: FieldCoord;
  art15LangEn: FieldCoord;
}

/**
 * Letter-size PAM Form (2) — calibrated for public/pam_contract_form_2.pdf (PdfProxy / 612×792pt).
 * Baseline tuned via scripts/test_fill_pam.ts against the official blank template.
 */
export const DEFAULT_PAM_COORDINATES: PamCoordinatesConfig = {
  laborDeptAr: { x: 395, y: 660, size: 8, align: 'right', pageIndex: 0 },
  laborDeptEn: { x: 180, y: 660, size: 7.5, align: 'left', pageIndex: 0 },
  dayAr: { x: 500, y: 648, size: 8, align: 'right', pageIndex: 0 },
  dateAr: { x: 440, y: 648, size: 7.5, align: 'right', pageIndex: 0 },
  dayEn: { x: 65, y: 648, size: 7.5, align: 'left', pageIndex: 0 },
  dateEn: { x: 175, y: 648, size: 7.5, align: 'left', pageIndex: 0 },

  companyNameAr: { x: 450, y: 625, size: 7.5, align: 'right', pageIndex: 0 },
  companyRepNameAr: { x: 510, y: 602, size: 7.5, align: 'right', pageIndex: 0 },
  companyRepCivilIdAr: { x: 490, y: 590, size: 7.5, align: 'right', pageIndex: 0 },
  companyNameEn: { x: 145, y: 625, size: 7, align: 'left', pageIndex: 0 },
  companyRepNameEn: { x: 85, y: 602, size: 7.5, align: 'left', pageIndex: 0 },
  companyRepCivilIdEn: { x: 95, y: 590, size: 7.5, align: 'left', pageIndex: 0 },

  empNameAr: { x: 505, y: 565, size: 8, align: 'right', pageIndex: 0 },
  empNationalityAr: { x: 505, y: 553, size: 7.5, align: 'right', pageIndex: 0 },
  empCivilIdAr: { x: 495, y: 541, size: 7.5, align: 'right', pageIndex: 0 },
  empResidenceAr: { x: 505, y: 529, size: 7.5, align: 'right', pageIndex: 0 },

  empNameEn: { x: 90, y: 565, size: 7.5, align: 'left', pageIndex: 0 },
  empNationalityEn: { x: 100, y: 553, size: 7.5, align: 'left', pageIndex: 0 },
  empCivilIdEn: { x: 95, y: 541, size: 7.5, align: 'left', pageIndex: 0 },
  empResidenceEn: { x: 95, y: 529, size: 7.5, align: 'left', pageIndex: 0 },

  preambleCompanyNameAr: { x: 410, y: 491, size: 7, align: 'right', pageIndex: 0 },
  preambleCompanyFieldAr: { x: 510, y: 480, size: 7, align: 'right', pageIndex: 0 },
  preambleJobTitleAr: { x: 430, y: 469, size: 7, align: 'right', pageIndex: 0 },
  preambleCompanyNameEn: { x: 190, y: 491, size: 7, align: 'left', pageIndex: 0 },
  preambleCompanyFieldEn: { x: 130, y: 480, size: 7, align: 'left', pageIndex: 0 },
  preambleJobTitleEn: { x: 105, y: 458, size: 7, align: 'left', pageIndex: 0 },

  art2JobTitleAr: { x: 320, y: 412, size: 7.5, align: 'right', pageIndex: 0 },
  art2JobTitleEn: { x: 140, y: 402, size: 7, align: 'left', pageIndex: 0 },

  art4SalaryAr: { x: 360, y: 355, size: 8, align: 'right', pageIndex: 0 },
  art4PeriodAr: { x: 440, y: 345, size: 7.5, align: 'right', pageIndex: 0 },
  art4SalaryEn: { x: 110, y: 345, size: 7.5, align: 'left', pageIndex: 0 },
  art4PeriodEn: { x: 50, y: 335, size: 7.5, align: 'left', pageIndex: 0 },

  art5EffectiveDateAr: { x: 435, y: 299, size: 7.5, align: 'right', pageIndex: 0 },
  art5EffectiveDateEn: { x: 180, y: 299, size: 7.5, align: 'left', pageIndex: 0 },

  art6EffectiveDateAr: { x: 380, y: 263, size: 7.5, align: 'right', pageIndex: 0 },
  art6DurationYearsAr: { x: 535, y: 253, size: 8, align: 'right', pageIndex: 0 },
  art6EffectiveDateEn: { x: 50, y: 253, size: 7.5, align: 'left', pageIndex: 0 },
  art6DurationYearsEn: { x: 185, y: 253, size: 7.5, align: 'left', pageIndex: 0 },

  art7LeaveDaysAr: { x: 350, y: 660, size: 8, align: 'right', pageIndex: 1 },
  art7LeaveDaysEn: { x: 85, y: 649, size: 7.5, align: 'left', pageIndex: 1 },
  art15LangAr: { x: 410, y: 239, size: 7.5, align: 'right', pageIndex: 1 },
  art15LangEn: { x: 210, y: 239, size: 7.5, align: 'left', pageIndex: 1 },
};

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const DIGITS_ONLY_RE = /^\d+$/;

const PAM_COORD_KEYS = Object.keys(DEFAULT_PAM_COORDINATES) as (keyof PamCoordinatesConfig)[];

/** Merge platform / company calibration layers onto code defaults */
export function mergePamCoordinates(
  ...layers: (Partial<PamCoordinatesConfig> | null | undefined)[]
): PamCoordinatesConfig {
  const result = { ...DEFAULT_PAM_COORDINATES };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of PAM_COORD_KEYS) {
      const patch = layer[key];
      if (patch && typeof patch === 'object') {
        result[key] = { ...result[key], ...patch };
      }
    }
  }
  return result;
}

/**
 * Reshape Arabic characters into connected contextual presentation glyphs (Isolated, Initial, Medial, Final)
 */
export function reshapeArabic(text: string): string {
  if (!text) return '';
  try {
    const shaper = (reshaperPkg as { ArabicShaper?: { convertArabic: (s: string) => string } })
      .ArabicShaper;
    if (shaper?.convertArabic) {
      return shaper.convertArabic(text);
    }
  } catch (err) {
    console.error('Arabic reshaping error:', err);
  }
  return text;
}

/**
 * Prepare text for pdf-lib drawText (LTR): reshape Arabic, then reverse glyph order per segment
 * while keeping Latin/digits LTR — same pipeline as scripts/verify_bidi.ts (proven on PAM tests).
 */
export function preparePdfText(text: string | number | undefined, isEnglishField = false): string {
  if (text === undefined || text === null) return '';
  const str = String(text).trim();
  if (!str) return '';

  if (isEnglishField && !ARABIC_CHAR_RE.test(str)) {
    return str;
  }

  if (DIGITS_ONLY_RE.test(str) || /^[\d./\-:\s]+$/.test(str)) {
    return str;
  }

  const hasArabic = ARABIC_CHAR_RE.test(str);
  if (!hasArabic) {
    return str;
  }

  const shaped = reshapeArabic(str);
  const tokens = shaped.split(/([a-zA-Z0-9\-_./@#:]+)/);
  const processed = tokens.map((tok) => {
    if (/^[a-zA-Z0-9\-_./@#:]+$/.test(tok)) return tok;
    if (!tok) return tok;
    return [...tok].reverse().join('');
  });
  return processed.reverse().join('');
}

/** @deprecated Use preparePdfText — kept for existing imports/scripts */
export function shapeAndReverseArabic(text: string, isEnglishField = false): string {
  return preparePdfText(text, isEnglishField);
}

/**
 * Load font bytes with resilient multi-path fallbacks
 */
function fontCandidatePaths(fontChoice: PamFontChoice): string[] {
  return fontChoice === 'cairo'
    ? ['fonts/Cairo-Bold.ttf', 'fonts/Cairo-Regular.ttf', 'fonts/Amiri-Bold.ttf', 'fonts/Amiri-Regular.ttf']
    : ['fonts/Amiri-Bold.ttf', 'fonts/Amiri-Regular.ttf', 'fonts/Cairo-Bold.ttf', 'fonts/Cairo-Regular.ttf'];
}

/** Browser / Vite client: fetch fonts from /public */
async function loadFontBytes(fontChoice: PamFontChoice = 'cairo'): Promise<ArrayBuffer> {
  const relPaths = fontCandidatePaths(fontChoice);

  let lastError: unknown = null;
  for (const rel of relPaths) {
    const url = `/${rel}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const bytes = await res.arrayBuffer();
        if (bytes.byteLength > 10000) {
          return bytes;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  const msg = lastError instanceof Error ? lastError.message : '';
  throw new Error(`تعذر تحميل الخط العربي (${fontChoice}). يرجى التأكد من وجود ملفات الخطوط في /fonts/: ${msg}`);
}

/**
 * Build and overlay official PAM Form 2 Employment Contract PDF (template bytes provided)
 */
export async function generatePamContractPdfBytesFromTemplate(
  templateBytes: ArrayBuffer | Uint8Array,
  data: PamContractData,
  coords: PamCoordinatesConfig = DEFAULT_PAM_COORDINATES,
  fontChoice: PamFontChoice = 'cairo',
  preloadedFontBytes?: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const fontBytes = preloadedFontBytes
    ? preloadedFontBytes instanceof Uint8Array
      ? preloadedFontBytes.buffer.slice(
          preloadedFontBytes.byteOffset,
          preloadedFontBytes.byteOffset + preloadedFontBytes.byteLength
        )
      : preloadedFontBytes
    : await loadFontBytes(fontChoice);

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  const customFont = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1] || pages[0];

  // Official Document Royal Blue Ink
  const blueInk = rgb(0.04, 0.15, 0.65);

  // Helper drawing function with explicit English vs Arabic column handling
  const drawItem = (
    targetPage: any,
    rawText: string | number | undefined,
    coord: FieldCoord,
    isEnglishField = false
  ) => {
    if (rawText === undefined || rawText === null || rawText === '') return;
    const str = String(rawText).trim();
    if (!str) return;

    const textToDraw = preparePdfText(str, isEnglishField);
    const fontSize = coord.size || 8;
    const width = customFont.widthOfTextAtSize(textToDraw, fontSize);
    
    let drawX = coord.x;
    if (coord.align === 'right') {
      drawX = coord.x - width;
    } else if (coord.align === 'center') {
      drawX = coord.x - (width / 2);
    }

    targetPage.drawText(textToDraw, {
      x: drawX,
      y: coord.y,
      size: fontSize,
      font: customFont,
      color: blueInk,
    });
  };

  // --- OVERLAY PAGE 1 ---
  // 1. Labor Dept
  drawItem(page1, data.companyLaborDept, coords.laborDeptAr, false);
  drawItem(page1, data.companyLaborDeptEn, coords.laborDeptEn, true);

  // 2. Day & Date
  drawItem(page1, data.contractDay, coords.dayAr, false);
  drawItem(page1, data.contractDate, coords.dateAr, false);
  drawItem(page1, data.contractDayEn, coords.dayEn, true);
  drawItem(page1, data.contractDate, coords.dateEn, true);

  // 3. First Party (Company)
  drawItem(page1, data.companyName, coords.companyNameAr, false);
  drawItem(page1, data.companyRepName, coords.companyRepNameAr, false);
  drawItem(page1, data.companyRepCivilId, coords.companyRepCivilIdAr, false);

  drawItem(page1, data.companyNameEn, coords.companyNameEn, true);
  drawItem(page1, data.companyRepNameEn, coords.companyRepNameEn, true);
  drawItem(page1, data.companyRepCivilId, coords.companyRepCivilIdEn, true);

  // 4. Second Party (Employee)
  drawItem(page1, data.employeeNameAr, coords.empNameAr, false);
  drawItem(page1, data.employeeNationality, coords.empNationalityAr, false);
  drawItem(page1, data.employeeCivilId, coords.empCivilIdAr, false);
  drawItem(page1, data.employeeResidence, coords.empResidenceAr, false);

  drawItem(page1, data.employeeNameEn, coords.empNameEn, true);
  drawItem(page1, data.employeeNationalityEn, coords.empNationalityEn, true);
  drawItem(page1, data.employeeCivilId, coords.empCivilIdEn, true);
  drawItem(page1, data.employeeResidenceEn, coords.empResidenceEn, true);

  // 5. Preamble
  drawItem(page1, data.companyName, coords.preambleCompanyNameAr, false);
  drawItem(page1, data.companyField, coords.preambleCompanyFieldAr, false);
  drawItem(page1, data.jobTitleAr, coords.preambleJobTitleAr, false);

  drawItem(page1, data.companyNameEn, coords.preambleCompanyNameEn, true);
  drawItem(page1, data.companyFieldEn, coords.preambleCompanyFieldEn, true);
  drawItem(page1, data.jobTitleEn, coords.preambleJobTitleEn, true);

  // 6. Article Two (Profession)
  drawItem(page1, data.jobTitleAr, coords.art2JobTitleAr, false);
  drawItem(page1, data.jobTitleEn, coords.art2JobTitleEn, true);

  // 7. Article Four (Salary & Period)
  drawItem(page1, data.basicSalary, coords.art4SalaryAr, false);
  drawItem(page1, data.salaryPeriod, coords.art4PeriodAr, false);

  drawItem(page1, data.basicSalary, coords.art4SalaryEn, true);
  drawItem(page1, data.salaryPeriodEn, coords.art4PeriodEn, true);

  // 8. Article Five (In Force)
  drawItem(page1, data.effectiveDate, coords.art5EffectiveDateAr, false);
  drawItem(page1, data.effectiveDate, coords.art5EffectiveDateEn, true);

  // 9. Article Six (Duration & Start)
  drawItem(page1, data.effectiveDate, coords.art6EffectiveDateAr, false);
  drawItem(page1, data.durationYears, coords.art6DurationYearsAr, false);

  drawItem(page1, data.effectiveDate, coords.art6EffectiveDateEn, true);
  drawItem(page1, data.durationYears, coords.art6DurationYearsEn, true);

  // --- OVERLAY PAGE 2 ---
  // 10. Article Seven (Leave Days)
  const leaveAr =
    typeof data.leaveDay === 'number'
      ? `${data.leaveDay} يوماً`
      : String(data.leaveDay).includes('يوم')
        ? String(data.leaveDay)
        : `${data.leaveDay} يوماً`;
  const leaveEn = data.leaveDayEn || `${data.leaveDay} days (annual leave per Kuwait law)`;

  drawItem(page2, leaveAr, coords.art7LeaveDaysAr, false);
  drawItem(page2, leaveEn, coords.art7LeaveDaysEn, true);

  // 11. Article Fifteen (Contract Language)
  drawItem(
    page2,
    data.contractLanguageAr || 'باللغتين العربية والإنجليزية',
    coords.art15LangAr,
    false
  );
  drawItem(
    page2,
    data.contractLanguageEn || 'Arabic and English',
    coords.art15LangEn,
    true
  );

  return await pdfDoc.save();
}

/**
 * Build and overlay official PAM Form 2 Employment Contract PDF (browser: fetches public template)
 */
export async function generatePamContractPdfBytes(
  data: PamContractData,
  coords: PamCoordinatesConfig = DEFAULT_PAM_COORDINATES,
  fontChoice: PamFontChoice = 'cairo'
): Promise<Uint8Array> {
  const templateRes = await fetch('/pam_contract_form_2.pdf');
  if (!templateRes.ok) {
    throw new Error('تعذر تحميل ملف نموذج عقد العمل الرسمي pam_contract_form_2.pdf من المجلد العام');
  }
  const templateBytes = await templateRes.arrayBuffer();
  return generatePamContractPdfBytesFromTemplate(templateBytes, data, coords, fontChoice);
}

/**
 * Generate Blob & URL for live preview / download
 */
export async function generatePamContractBlob(
  data: PamContractData,
  coords: PamCoordinatesConfig = DEFAULT_PAM_COORDINATES,
  fontChoice: PamFontChoice = 'cairo'
): Promise<{ blob: Blob; url: string }> {
  const bytes = await generatePamContractPdfBytes(data, coords, fontChoice);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}

/**
 * Trigger immediate download of the filled official PAM Contract PDF
 */
export async function downloadPamContractPdf(
  data: PamContractData,
  filename?: string,
  coords?: PamCoordinatesConfig,
  fontChoice: PamFontChoice = 'cairo'
): Promise<void> {
  const { url } = await generatePamContractBlob(data, coords, fontChoice);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `PAM_Contract_Form2_${data.employeeNameAr || data.employeeNameEn || 'Kuwait'}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 3000);
}

/**
 * Print the filled official PAM Contract PDF (via clean PDF download / popup)
 */
export async function printPamContractPdf(
  data: PamContractData,
  coords?: PamCoordinatesConfig,
  fontChoice: PamFontChoice = 'cairo'
): Promise<void> {
  const { url } = await generatePamContractBlob(data, coords, fontChoice);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = `PAM_Contract_Form2_${data.employeeNameAr || data.employeeNameEn || 'Kuwait'}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 4000);
  } catch (err) {
    console.warn('PDF printing/download error:', err);
  }
}
