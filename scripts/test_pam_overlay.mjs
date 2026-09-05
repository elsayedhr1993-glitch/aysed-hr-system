import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import reshaper from "arabic-persian-reshaper";
import fs from "fs";

function shapeAndReverseArabic(text) {
  if (!text) return "";
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  if (!hasArabic) return text;
  const reshaped = reshaper.ArabicShaper.convertArabic(text);
  const segments = reshaped.split(/(\d+)/);
  const reversedSegments = segments.map(seg => {
    if (/^\d+$/.test(seg)) return seg;
    return seg.split("").reverse().join("");
  });
  return reversedSegments.reverse().join("");
}

async function testOverlay() {
  const existingPdfBytes = fs.readFileSync("public/pam_contract_form_2.pdf");
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = fs.readFileSync("public/fonts/Amiri-Bold.ttf");
  const overlayFont = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page2 = pages[1];

  const blue = rgb(0.05, 0.18, 0.55); // Official document blue ink

  function drawField(page, text, xPt, yPt, size = 9, align = 'right') {
    if (!text) return;
    const isAr = /[\u0600-\u06FF]/.test(text);
    const processed = isAr ? shapeAndReverseArabic(text) : text;
    const width = overlayFont.widthOfTextAtSize(processed, size);
    const drawX = align === 'right' ? xPt - width : xPt;
    page.drawText(processed, {
      x: drawX,
      y: yPt,
      size,
      font: overlayFont,
      color: blue,
    });
  }

  // Sample test data
  const data = {
    companyLaborDept: "حولي",
    contractDay: "السبت",
    contractDate: "2026/09/05",
    companyName: "شركة مستشفى الأمل الطبي ذ.م.م",
    companyRepName: "أحمد محمد الكندري",
    companyRepCivilId: "285010101234",
    companyField: "الرعاية والخدمات الطبية",
    employeeNameAr: "محمد إبراهيم السيد",
    employeeNameEn: "Mohamed Ibrahim Elsayed",
    employeeNationality: "مصري",
    employeeCivilId: "293051501234",
    employeeResidence: "مادة 18 - حولي",
    jobTitleAr: "طبيب بشري عام",
    jobTitleEn: "General Physician",
    basicSalary: "750",
    salaryPeriod: "شهر ميلادي",
    salaryPeriodEn: "Month",
    effectiveDate: "2026/09/01",
    durationYears: "3",
    leaveDay: "30"
  };

  // --- PAGE 1 OVERLAY ---
  // 1. Labor Dept
  drawField(page1, data.companyLaborDept, 400, 695, 8.5, 'right');
  drawField(page1, "Hawalli", 155, 695, 8, 'left');

  // 2. Day & Date
  drawField(page1, data.contractDay, 490, 682, 8.5, 'right');
  drawField(page1, data.contractDate, 435, 682, 8.5, 'right');
  drawField(page1, "Saturday", 65, 682, 8, 'left');
  drawField(page1, data.contractDate, 160, 682, 8, 'left');

  // 3. First Party (Company)
  drawField(page1, data.companyName, 460, 667, 8.5, 'right');
  drawField(page1, data.companyRepName, 475, 654, 8.5, 'right');
  drawField(page1, data.companyRepCivilId, 475, 641, 8.5, 'right');

  drawField(page1, "Al-Amal Medical Hospital W.L.L", 140, 657, 8, 'left');
  drawField(page1, "Ahmed M. Al-Kandari", 95, 634, 8, 'left');
  drawField(page1, data.companyRepCivilId, 105, 622, 8, 'left');

  // 4. Second Party (Employee)
  drawField(page1, data.employeeNameAr, 495, 613, 8.5, 'right');
  drawField(page1, data.employeeNationality, 485, 600, 8.5, 'right');
  drawField(page1, data.employeeCivilId, 485, 587, 8.5, 'right');
  drawField(page1, data.employeeResidence, 485, 574, 8.5, 'right');

  drawField(page1, data.employeeNameEn, 95, 596, 8, 'left');
  drawField(page1, "Egyptian", 110, 584, 8, 'left');
  drawField(page1, data.employeeCivilId, 105, 572, 8, 'left');
  drawField(page1, "Art. 18 - Hawalli", 105, 560, 8, 'left');

  // 5. Preamble
  drawField(page1, data.companyName, 440, 534, 8, 'right');
  drawField(page1, data.companyField, 370, 534, 8, 'right');
  drawField(page1, data.jobTitleAr, 420, 522, 8, 'right');

  drawField(page1, "Al-Amal Medical Hospital", 145, 534, 7.5, 'left');
  drawField(page1, "Medical Services", 85, 523, 7.5, 'left');
  drawField(page1, data.jobTitleEn, 115, 512, 7.5, 'left');

  // 6. Article Two (Profession)
  drawField(page1, data.jobTitleAr, 430, 460, 8, 'right');
  drawField(page1, data.jobTitleEn, 115, 449, 7.5, 'left');

  // 7. Article Four (Wage)
  drawField(page1, data.basicSalary, 440, 375, 8.5, 'right');
  drawField(page1, data.salaryPeriod, 480, 364, 8, 'right');

  drawField(page1, data.basicSalary, 100, 365, 8, 'left');
  drawField(page1, data.salaryPeriodEn, 65, 355, 8, 'left');

  // 8. Article Five (In Force)
  drawField(page1, data.effectiveDate, 470, 308, 8, 'right');
  drawField(page1, data.effectiveDate, 140, 308, 7.5, 'left');

  // 9. Article Six (Definite Term)
  drawField(page1, data.effectiveDate, 475, 254, 8, 'right');
  drawField(page1, data.durationYears, 395, 254, 8.5, 'right');

  drawField(page1, data.effectiveDate, 65, 254, 7.5, 'left');
  drawField(page1, data.durationYears, 160, 254, 8, 'left');

  // --- PAGE 2 OVERLAY ---
  // 10. Article Seven (Leave Days)
  drawField(page2, data.leaveDay, 440, 706, 8.5, 'right');
  drawField(page2, data.leaveDay, 85, 706, 8, 'left');

  // 11. Article Fifteen (Language)
  drawField(page2, "الإنجليزية", 450, 218, 8, 'right');
  drawField(page2, "English", 125, 218, 7.5, 'left');

  const overlaidPdfBytes = await pdfDoc.save();
  fs.writeFileSync("test_pam_overlaid.pdf", overlaidPdfBytes);
  console.log("Successfully tested overlay! Result size:", overlaidPdfBytes.length);
}

testOverlay().catch(console.error);
