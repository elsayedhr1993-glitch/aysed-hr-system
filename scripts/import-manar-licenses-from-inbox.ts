/**
 * Read PDFs/images from scripts/data/manar-licenses-inbox/, extract license fields (Gemini),
 * write scripts/data/manar-facility-licenses.json, optionally apply to Firestore.
 *
 * Usage:
 *   npx tsx scripts/import-manar-licenses-from-inbox.ts
 *   npx tsx scripts/import-manar-licenses-from-inbox.ts --apply
 */
import 'dotenv/config';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { getGeminiClient } from '../server/geminiServer.ts';
import { getOcrModelCandidates } from '../src/config/aiConfig.ts';
import type { CompanyDocument } from '../src/types/companyDocuments.ts';
import type { FacilityLicenseData } from '../src/types/facilityLicense.ts';
import { createEmptyFacilityData } from '../src/types/facilityLicense.ts';

const COMPANY_ID = 'comp-1788442584841';
const INBOX = join(process.cwd(), 'scripts/data/manar-licenses-inbox');
const OUT_JSON = join(process.cwd(), 'scripts/data/manar-facility-licenses.json');

const SLUG_BY_HINT: Array<{ hint: RegExp; id: string; documentType: string; name: string; authority: string }> = [
  {
    hint: /صح|طبي|moh|health|وزارة الصحة/i,
    id: `lic-${COMPANY_ID}-moh`,
    documentType: 'ترخيص صحي/طبي',
    name: 'ترخيص وزارة الصحة',
    authority: 'وزارة الصحة — دولة الكويت',
  },
  {
    hint: /بلد|municip|baladiya/i,
    id: `lic-${COMPANY_ID}-baladiya`,
    documentType: 'رخصة بلدية',
    name: 'رخصة البلدية',
    authority: 'بلدية الكويت',
  },
  {
    hint: /إطفاء|اطفاء|دفاع|kff|fire|civil defense/i,
    id: `lic-${COMPANY_ID}-kff`,
    documentType: 'دفاع مدني',
    name: 'ترخيص الإطفاء / الدفاع المدني',
    authority: 'إدارة الإطفاء العام — دولة الكويت',
  },
  {
    hint: /pam|قوى|شؤون|wps|workforce/i,
    id: `lic-${COMPANY_ID}-pam`,
    documentType: 'ملف الشؤون PAM/WPS',
    name: 'ملف الشؤون — القوى العاملة (PAM/WPS)',
    authority: 'الهيئة العامة للقوى العاملة',
  },
  {
    hint: /غرفة|commerce|chamber/i,
    id: `lic-${COMPANY_ID}-chamber`,
    documentType: 'عضوية غرفة التجارة',
    name: 'عضوية غرفة التجارة والصناعة',
    authority: 'غرفة تجارة وصناعة الكويت',
  },
];

type Extracted = {
  licenseName?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  facilityNameAr?: string;
  notes?: string;
  confidence?: string;
};

function mimeFor(path: string): string {
  const ext = extname(path).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

function normalizeDate(s?: string): string {
  if (!s) return '';
  const t = String(s).trim();
  const m = t.match(/(\d{4})[./\-](\d{1,2})[./\-](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const m2 = t.match(/(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;
  return '';
}

function classifyFile(fileName: string, extracted: Extracted) {
  const blob = `${fileName} ${extracted.licenseName || ''} ${extracted.issuingAuthority || ''}`;
  for (const row of SLUG_BY_HINT) {
    if (row.hint.test(blob)) return row;
  }
  return {
    hint: /.*/,
    id: `lic-${COMPANY_ID}-other-${basename(fileName, extname(fileName)).replace(/\W+/g, '-').slice(0, 24)}`,
    documentType: 'أخرى',
    name: extracted.licenseName || basename(fileName),
    authority: extracted.issuingAuthority || 'جهة رسمية',
  };
}

async function extractFromFile(client: NonNullable<ReturnType<typeof getGeminiClient>>, filePath: string): Promise<Extracted> {
  const b64 = readFileSync(filePath).toString('base64');
  const prompt = `You extract Kuwait clinic/facility license metadata from this document.
Return JSON only with keys:
licenseName (Arabic preferred),
documentNumber,
issuingAuthority,
issueDate (YYYY-MM-DD if possible),
expiryDate (YYYY-MM-DD if possible),
facilityNameAr,
notes (short),
confidence (high|medium|low).
Use empty string for unknown fields. Do not invent numbers.`;

  let lastError: unknown;
  for (const model of getOcrModelCandidates()) {
    try {
      const r = await client.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: b64, mimeType: mimeFor(filePath) } },
            { text: prompt },
          ],
        },
        config: { temperature: 0, responseMimeType: 'application/json' },
      });
      const raw = r.text || '{}';
      return JSON.parse(raw) as Extracted;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function applyToFacility(facility: FacilityLicenseData, doc: CompanyDocument, kind: string) {
  const num = doc.documentNumber?.trim();
  if (!num) return;
  if (kind.includes('moh')) {
    facility.mohLicenseNo = num;
    if (doc.issueDate) facility.mohStartDate = doc.issueDate;
    if (doc.expiryDate) facility.mohExpiryDate = doc.expiryDate;
  } else if (kind.includes('pam')) {
    facility.pamFileCode = num;
  } else if (kind.includes('kff')) {
    facility.kffLicenseNo = num;
    if (doc.expiryDate) facility.kffExpiryDate = doc.expiryDate;
  } else if (kind.includes('baladiya')) {
    facility.baladiyaLicenseNo = num;
    if (doc.expiryDate) facility.baladiyaExpiryDate = doc.expiryDate;
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  if (!existsSync(INBOX)) {
    throw new Error(`Create folder and add PDFs: ${INBOX}`);
  }

  const files = readdirSync(INBOX).filter((f) => /\.(pdf|png|jpe?g|webp)$/i.test(f));
  if (files.length === 0) {
    console.error(JSON.stringify({ ok: false, error: 'inbox_empty', inbox: INBOX }, null, 2));
    process.exit(2);
  }

  const client = getGeminiClient();
  if (!client) throw new Error('GEMINI_API_KEY required for OCR extraction');

  const facility: FacilityLicenseData = {
    ...createEmptyFacilityData(),
    nameAr: 'المنار كلينك',
    nameEn: 'Al Manar Clinic',
    mainBranchName: 'الفرع الرئيسي',
    isCompleted: true,
  };

  const extraDocuments: CompanyDocument[] = [];
  const gaps: Array<{ file: string; issue: string }> = [];

  for (const file of files) {
    const full = join(INBOX, file);
    console.log(`Extracting: ${file}`);
    let extracted: Extracted;
    try {
      extracted = await extractFromFile(client, full);
    } catch (e) {
      gaps.push({ file, issue: `فشل الاستخراج: ${(e as Error).message}` });
      continue;
    }

    const meta = classifyFile(file, extracted);
    const issueDate = normalizeDate(extracted.issueDate);
    const expiryDate = normalizeDate(extracted.expiryDate);

    if (!extracted.documentNumber?.trim()) {
      gaps.push({ file, issue: 'رقم الترخيص غير واضح في الملف' });
    }
    if (!expiryDate) {
      gaps.push({ file, issue: 'تاريخ الانتهاء غير واضح أو غير موجود' });
    }
    if (!issueDate) {
      gaps.push({ file, issue: 'تاريخ البدء/الإصدار غير واضح (اختياري — يمكن استكماله لاحقاً)' });
    }

    const row: CompanyDocument = {
      id: meta.id,
      companyId: COMPANY_ID,
      name: extracted.licenseName?.trim() || meta.name,
      documentType: meta.documentType,
      documentNumber: String(extracted.documentNumber || '').trim(),
      issuingAuthority: extracted.issuingAuthority?.trim() || meta.authority,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '',
      fileUrl: `file://inbox/${file}`,
      notes: [extracted.notes, extracted.confidence ? `ثقة OCR: ${extracted.confidence}` : ''].filter(Boolean).join(' — '),
    };

    if (extracted.facilityNameAr?.trim()) {
      facility.nameAr = extracted.facilityNameAr.trim();
      facility.nameEn = facility.nameEn || 'Al Manar Clinic';
    }

    extraDocuments.push(row);
    applyToFacility(facility, row, meta.id);
  }

  const payload = {
    companyId: COMPANY_ID,
    companyPatch: {
      regulatoryRegime: 'MOH_MEDICAL',
      nameAr: facility.nameAr || 'المنار كلينك',
      nameEn: facility.nameEn || 'Al Manar Clinic',
    },
    facility,
    extraDocuments,
    gaps,
    extractedAt: new Date().toISOString(),
  };

  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  console.log(JSON.stringify({ ok: true, files: files.length, documents: extraDocuments.length, gaps, out: OUT_JSON }, null, 2));

  if (apply) {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync('npx', ['tsx', 'scripts/apply-manar-facility-licenses-admin.ts', OUT_JSON], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
    });
    process.exit(r.status ?? 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
