import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import reshaperPkg from 'arabic-persian-reshaper';
import fs from 'fs';
import path from 'path';

export function reshapeArabic(text: string): string {
  if (!text) return '';
  try {
    const shaperObj =
      (reshaperPkg as any)?.ArabicShaper ||
      (reshaperPkg as any)?.default?.ArabicShaper ||
      (reshaperPkg as any)?.default ||
      reshaperPkg;

    if (shaperObj && typeof shaperObj.convertArabic === 'function') {
      return shaperObj.convertArabic(text);
    }
  } catch (err) {
    console.error('Arabic reshaping error:', err);
  }
  return text;
}

export function formatForPdfLib(text: string | number | undefined, isEnglish = false): string {
  if (text === undefined || text === null) return '';
  const str = String(text).trim();
  if (!str) return '';

  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);

  // Pure English / numbers or forced English field
  if (!hasArabic || isEnglish) {
    return str;
  }

  // Reshape Arabic letters
  const shaped = reshapeArabic(str);

  // Tokenize by non-Arabic (Latin words, digits, and punct)
  const tokens = shaped.split(/([a-zA-Z0-9\-_./@#:]+)/);
  const processed = tokens.map(tok => {
    if (/^[a-zA-Z0-9\-_./@#:]+$/.test(tok)) {
      return tok; // Keep Latin/digits LTR
    }
    // Reverse Arabic characters for pdf-lib LTR placement
    return tok.split('').reverse().join('');
  });

  return processed.reverse().join('');
}

async function verify() {
  console.log('Arabic name:', formatForPdfLib('أحمد محمد الكندري'));
  console.log('Civil ID:', formatForPdfLib('285010101234'));
  console.log('Mixed Article 18:', formatForPdfLib('مادة 18 - حولي'));
  console.log('English Job:', formatForPdfLib('General Practitioner', true));
}

verify();
