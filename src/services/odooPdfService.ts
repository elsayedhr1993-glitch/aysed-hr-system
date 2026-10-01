/**
 * Odoo-style PDF gateway (مسار موحّد للمنظومة)
 *
 * - **report** — تقارير وشاشات HTML → طباعة / PDF (مثل QWeb Print في Odoo)
 * - **form** — نماذج رسمية مُعبَّأة بـ pdf-lib (مثل عقد PAM)
 * - **view** — قراءة ومعاينة PDF بـ pdfjs (معاينة / OCR)
 *
 * استخدم `OdooPdf` أو الدوال المُصدَّرة مباشرة بدلاً من استيراد المكتبات الخام.
 */
import { exportElementToPdf, printDocument } from '../utils/printUtils';
import {
  downloadPamContractPdf,
  generatePamContractBlob,
  generatePamContractPdfBytes,
  printPamContractPdf,
  type PamContractData,
  type PamCoordinatesConfig,
  type PamFontChoice,
} from './pamContractPdfService';
import { loadPdfDocument, renderPdfBytesToPageImages, renderPdfFileToPageImages } from '../lib/pdfjsClient';

export type OdooPdfRail = 'report' | 'form' | 'view';

export type ReportPdfOptions = {
  fileName?: string;
};

export type PamFormPdfOptions = {
  coords: PamCoordinatesConfig;
  fontChoice?: PamFontChoice;
};

/** تقرير A4 من عنصر DOM (شاشة / قالب React) */
export async function exportReportPdfFromElement(
  elementIdOrEl: string | HTMLElement,
  fileName = 'Document'
): Promise<boolean> {
  return exportElementToPdf(elementIdOrEl, fileName);
}

/** طباعة تقرير (نافذة طباعة أو fallback PDF) */
export async function printReport(htmlContentOrId: string, fileName = 'Document'): Promise<void> {
  await printDocument(htmlContentOrId, fileName);
}

/** نموذج رسمي: عقد العمل الأهلي (PAM) */
export async function exportOfficialPamContractPdf(
  data: PamContractData,
  options: PamFormPdfOptions
) {
  return generatePamContractBlob(data, options.coords, options.fontChoice);
}

export async function downloadOfficialPamContractPdf(
  data: PamContractData,
  options: PamFormPdfOptions,
  fileName?: string
) {
  return downloadPamContractPdf(data, fileName, options.coords, options.fontChoice);
}

export async function printOfficialPamContractPdf(data: PamContractData, options: PamFormPdfOptions) {
  return printPamContractPdf(data, options.coords, options.fontChoice);
}

export async function getOfficialPamContractPdfBytes(
  data: PamContractData,
  options: PamFormPdfOptions
) {
  return generatePamContractPdfBytes(data, options.coords, options.fontChoice);
}

/** معاينة / OCR: تحميل مستند PDF */
export { loadPdfDocument, renderPdfBytesToPageImages, renderPdfFileToPageImages };

export function revokePdfObjectUrl(url: string | undefined | null) {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

export const OdooPdf = {
  rail: {
    report: 'report' as OdooPdfRail,
    form: 'form' as OdooPdfRail,
    view: 'view' as OdooPdfRail,
  },
  report: {
    exportElement: exportReportPdfFromElement,
    print: printReport,
    /** @deprecated استخدم exportElement */
    exportElementToPdf,
    /** @deprecated استخدم print */
    printDocument,
  },
  form: {
    pamContract: {
      generateBlob: exportOfficialPamContractPdf,
      download: downloadOfficialPamContractPdf,
      print: printOfficialPamContractPdf,
      toBytes: getOfficialPamContractPdfBytes,
    },
  },
  view: {
    loadDocument: loadPdfDocument,
    renderFileToImages: renderPdfFileToPageImages,
    renderBytesToImages: renderPdfBytesToPageImages,
    revokeObjectUrl: revokePdfObjectUrl,
  },
};

export type { PamContractData, PamCoordinatesConfig, PamFontChoice };
