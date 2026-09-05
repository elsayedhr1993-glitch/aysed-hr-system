import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import reshaperPkg from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

function shapeAndReverseArabic(text: string, isEnglishField = false): string {
  if (!text) return '';
  const str = String(text).trim();
  if (!str) return '';

  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
  if (!hasArabic || (isEnglishField && !hasArabic)) {
    return str;
  }

  const shaperObj = (reshaperPkg as any)?.ArabicShaper || (reshaperPkg as any)?.default?.ArabicShaper || reshaperPkg;
  const shaped = shaperObj.convertArabic(str);
  const levels = bidi.getEmbeddingLevels(shaped, 'rtl');
  return bidi.getReorderedString(shaped, levels);
}

async function testFillPamPdf() {
  const templateBytes = fs.readFileSync(path.join(process.cwd(), 'public/pam_contract_form_2.pdf'));
  const fontBytes = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Cairo-Bold.ttf'));

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  const customFont = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1];

  const blueInk = rgb(0.04, 0.15, 0.65);

  const drawItem = (targetPage: any, rawText: string, x: number, y: number, size = 8, align: 'left' | 'right' | 'center' = 'right', isEn = false) => {
    if (!rawText) return;
    const textToDraw = shapeAndReverseArabic(rawText, isEn);
    const fontSize = size;
    const width = customFont.widthOfTextAtSize(textToDraw, fontSize);
    let drawX = x;
    if (align === 'right') drawX = x - width;
    if (align === 'center') drawX = x - (width / 2);
    targetPage.drawText(textToDraw, { x: drawX, y, size: fontSize, font: customFont, color: blueInk });
  };

  // 1. Labor Dept
  drawItem(page1, 'حولي', 395, 660, 8, 'right', false);
  drawItem(page1, 'Hawalli', 180, 660, 7.5, 'left', true);

  // 2. Day & Date
  drawItem(page1, 'السبت', 500, 648, 8, 'right', false);
  drawItem(page1, '2026/09/05', 440, 648, 7.5, 'right', false);
  drawItem(page1, 'Saturday', 65, 648, 7.5, 'left', true);
  drawItem(page1, '2026/09/05', 175, 648, 7.5, 'left', true);

  // 3. Company & Rep
  drawItem(page1, 'شركة الرعاية الطبية المتقدمة ذ.م.م', 450, 625, 7.5, 'right', false);
  drawItem(page1, 'Advanced Medical Care Co. W.L.L', 145, 625, 7, 'left', true);

  drawItem(page1, 'أحمد محمد الكندري', 510, 602, 7.5, 'right', false);
  drawItem(page1, 'Ahmed M. Al-Kandari', 85, 602, 7.5, 'left', true);

  drawItem(page1, '285010101234', 490, 590, 7.5, 'right', false);
  drawItem(page1, '285010101234', 95, 590, 7.5, 'left', true);

  // 4. Employee
  drawItem(page1, 'السيد بخت السيد سويلم', 505, 565, 8, 'right', false);
  drawItem(page1, 'ELSAYED BEKHIT ELSAYED SEWILEM', 90, 565, 7.5, 'left', true);

  drawItem(page1, 'مصري', 505, 553, 7.5, 'right', false);
  drawItem(page1, 'Egyptian', 100, 553, 7.5, 'left', true);

  drawItem(page1, '293080106877', 495, 541, 7.5, 'right', false);
  drawItem(page1, '293080106877', 95, 541, 7.5, 'left', true);

  drawItem(page1, 'مادة 18 - حولي', 505, 529, 7.5, 'right', false);
  drawItem(page1, 'Article 18 - Hawalli', 95, 529, 7.5, 'left', true);

  // 5. Preamble
  drawItem(page1, 'شركة الرعاية الطبية', 410, 491, 7, 'right', false);
  drawItem(page1, 'Advanced Medical Care', 190, 491, 7, 'left', true);

  drawItem(page1, 'الخدمات الطبية', 510, 480, 7, 'right', false);
  drawItem(page1, 'Medical Services', 130, 480, 7, 'left', true);

  drawItem(page1, 'طبيب بشري عام', 430, 469, 7, 'right', false);
  drawItem(page1, 'General Practitioner', 105, 458, 7, 'left', true);

  // 6. Article 2
  drawItem(page1, 'طبيب بشري عام', 320, 412, 7.5, 'right', false);
  drawItem(page1, 'General Practitioner', 140, 402, 7, 'left', true);

  // 7. Article 4
  drawItem(page1, '650', 360, 355, 8, 'right', false);
  drawItem(page1, 'شهر ميلادي', 440, 345, 7.5, 'right', false);
  drawItem(page1, '650', 110, 345, 7.5, 'left', true);
  drawItem(page1, 'Month', 50, 335, 7.5, 'left', true);

  // 8. Article 5
  drawItem(page1, '2026/09/05', 435, 299, 7.5, 'right', false);
  drawItem(page1, '2026/09/05', 180, 299, 7.5, 'left', true);

  // 9. Article 6
  drawItem(page1, '2026/09/05', 380, 263, 7.5, 'right', false);
  drawItem(page1, '3', 535, 253, 8, 'right', false);
  drawItem(page1, '2026/09/05', 50, 253, 7.5, 'left', true);
  drawItem(page1, '3', 185, 253, 7.5, 'left', true);

  // Page 2
  drawItem(page2, '30', 350, 660, 8, 'right', false);
  drawItem(page2, '30', 85, 649, 7.5, 'left', true);

  drawItem(page2, 'الإنجليزية', 410, 239, 7.5, 'right', false);
  drawItem(page2, 'English', 210, 239, 7.5, 'left', true);

  const filledBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(process.cwd(), 'test_filled_pam.pdf'), filledBytes);
  console.log('Filled test PDF saved successfully!');
}

testFillPamPdf().catch(console.error);
