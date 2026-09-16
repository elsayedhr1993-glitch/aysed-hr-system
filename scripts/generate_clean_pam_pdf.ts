import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import reshaperPkg from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

function shapeAndReverse(text: string): string {
  if (!text) return '';
  const str = String(text).trim();
  if (!str) return '';

  const hasArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
  if (!hasArabic) return str;

  const shaperObj = (reshaperPkg as any)?.ArabicShaper || (reshaperPkg as any)?.default?.ArabicShaper || reshaperPkg;
  const shaped = shaperObj.convertArabic(str);
  const levels = bidi.getEmbeddingLevels(shaped, 'rtl');
  return bidi.getReorderedString(shaped, levels);
}

async function buildCleanPamTemplate() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load Amiri and Cairo fonts
  const cairoRegularBytes = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Cairo-Regular.ttf'));
  const cairoBoldBytes = fs.readFileSync(path.join(process.cwd(), 'public/fonts/Cairo-Bold.ttf'));
  
  const cairoRegular = await pdfDoc.embedFont(cairoRegularBytes);
  const cairoBold = await pdfDoc.embedFont(cairoBoldBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.1, 0.1, 0.1);
  const darkGray = rgb(0.3, 0.3, 0.3);
  const lightGray = rgb(0.7, 0.7, 0.7);
  const borderGray = rgb(0.2, 0.2, 0.2);

  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Helper drawing functions
  function drawAr(page: any, text: string, x: number, y: number, size = 8, font = cairoRegular, color = black, align: 'right' | 'center' | 'left' = 'right') {
    const formatted = shapeAndReverse(text);
    const width = font.widthOfTextAtSize(formatted, size);
    let drawX = x;
    if (align === 'right') drawX = x - width;
    if (align === 'center') drawX = x - width / 2;
    page.drawText(formatted, { x: drawX, y, size, font, color });
  }

  function drawEn(page: any, text: string, x: number, y: number, size = 7.5, font = helvetica, color = black, align: 'left' | 'center' | 'right' = 'left') {
    const width = font.widthOfTextAtSize(text, size);
    let drawX = x;
    if (align === 'right') drawX = x - width;
    if (align === 'center') drawX = x - width / 2;
    page.drawText(text, { x: drawX, y, size, font, color });
  }

  // Common Header & Framing for both pages
  function setupPage(pageIndex: number) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Outer Main Border Box
    page.drawRectangle({
      x: 38,
      y: 55,
      width: 519.28,
      height: 675,
      borderColor: borderGray,
      borderWidth: 1,
    });

    // Vertical Divider between English (Left) and Arabic (Right)
    page.drawLine({
      start: { x: 297.64, y: 55 },
      end: { x: 297.64, y: 688 },
      color: borderGray,
      thickness: 1,
    });

    // Top Header Box (Sample Form of an Employment Contract in the Civil Sector)
    page.drawRectangle({
      x: 38,
      y: 688,
      width: 519.28,
      height: 42,
      borderColor: borderGray,
      borderWidth: 1,
    });

    // Horizontal line splitting header box
    page.drawLine({
      start: { x: 297.64, y: 688 },
      end: { x: 297.64, y: 730 },
      color: borderGray,
      thickness: 1,
    });

    // English Box Title (Left)
    drawEn(page, 'Sample Form of an Employment Contract in the Civil Sector', 48, 706, 8.5, helveticaBold, black);

    // Arabic Box Title (Right)
    drawAr(page, 'نموذج عقد عمل استرشادي في القطاع الأهلي', 545, 706, 9.5, cairoBold, black, 'right');

    // Official State Header (Above the boxes)
    drawAr(page, '(2) نموذج عقد', 545, 790, 10, cairoBold, black, 'right');

    // Center Emblem circles
    page.drawCircle({ x: 297.64, y: 792, size: 14, borderColor: borderGray, borderWidth: 1.5 });
    page.drawCircle({ x: 297.64, y: 792, size: 9, borderColor: borderGray, borderWidth: 1 });

    drawAr(page, 'دولة الكويت - الهيئة العامة للقوى العاملة', 297.64, 768, 9, cairoBold, black, 'center');
    drawEn(page, 'The Public Authority For Manpower', 297.64, 755, 8.5, helveticaBold, black, 'center');

    // Footer Note
    const footerNoticeAr = 'ملاحظة / يعد هذا النموذج نموذجاً استرشادياً لشروط وأحكام عقد العمل في القطاع الأهلي ، ويحق لكل شركة إعداد نموذج مماثل له على مطبوعاتها الخاصة بها بشرط أن يتضمن كافة الأحكام والشروط الواردة بهذا النموذج .';
    drawAr(page, footerNoticeAr, 545, 40, 6.2, cairoRegular, darkGray, 'right');
    drawEn(page, String(pageIndex + 1), 297.64, 40, 9, helveticaBold, black, 'center');

    return page;
  }

  // ==================== PAGE 1 ====================
  const page1 = setupPage(0);

  // Right Column (Arabic)
  let yAr = 672;
  const rightColX = 545;
  const leftColX = 48;

  drawAr(page1, 'دولة الكويت', rightColX, yAr, 8, cairoBold);
  drawEn(page1, 'State of Kuwait', leftColX, yAr, 8, helveticaBold);

  yAr -= 12;
  drawAr(page1, 'الهيئة العامة للقوى العاملة / إدارة عمل ..........................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Public Authority for Manpower/ .................... Labour Department', leftColX, yAr, 7.5, helvetica);

  yAr -= 12;
  drawAr(page1, 'إنه في يوم ............ الموافق ..... / ..... / ......... تم تحرير هذا العقد بين كل من:-', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'On ............ corresponding to ............ the present contract was', leftColX, yAr, 7.2, helvetica);

  yAr -= 11;
  drawEn(page1, 'concluded by and between:', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, '1- شركة / مؤسسة ........................................ ويمثلها في', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, '1. Company/ institution ........................................ represented in', leftColX, yAr, 7.2, helvetica);

  yAr -= 11;
  drawAr(page1, 'التوقيع على هذا العقد:', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'signature in the present contract by:', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, 'الاسم: .................................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Name: .................................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, 'الرقم المدني: .........................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Civil card: .........................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, '" طرف أول "', 421, yAr, 8, cairoBold, black, 'center');
  drawEn(page1, '(First party)', 172, yAr, 7.5, helveticaBold, black, 'center');

  yAr -= 13;
  drawAr(page1, '2- الاسم: .................................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, '2. Name: .................................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, 'الجنسية: .............................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Nationality: .........................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, 'رقم مدني: .............................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Civil card: .........................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, 'الإقامة: .............................................................', rightColX, yAr, 7.5, cairoRegular);
  drawEn(page1, 'Residence: .........................................................', leftColX, yAr, 7.2, helvetica);

  yAr -= 12;
  drawAr(page1, '" طرف ثان "', 421, yAr, 8, cairoBold, black, 'center');
  drawEn(page1, '(Second party)', 172, yAr, 7.5, helveticaBold, black, 'center');

  // Preamble Section
  yAr -= 14;
  drawAr(page1, 'تمهيد', 421, yAr, 8, cairoBold, black, 'center');
  drawEn(page1, 'Preamble', 172, yAr, 7.5, helveticaBold, black, 'center');

  yAr -= 12;
  drawAr(page1, 'يمتلك الطرف الأول منشأة بإسم ........................................ تعمل', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'The first party owns the facility entitled ........................................', leftColX, yAr, 7, helvetica);

  yAr -= 11;
  drawAr(page1, 'في مجال .............................. ؛ ويرغب في التعاقد مع الطرف', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'working in the field of ..............................; whereas it wishes to', leftColX, yAr, 7, helvetica);

  yAr -= 11;
  drawAr(page1, 'الثاني للعمل لديه بمهنة ................................................. ؛', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'conclude a contract with the second party to work for it in the', leftColX, yAr, 7, helvetica);

  yAr -= 11;
  drawAr(page1, 'وبعد أن أقر الطرفان بأهليتهما في إبرام هذا العقد تم الإتفاق على ما يلي:', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'profession of ..............................; whereas the parties', leftColX, yAr, 7, helvetica);

  yAr -= 11;
  drawEn(page1, 'acknowledged their capacity to conclude this contract, they agreed', leftColX, yAr, 7, helvetica);
  yAr -= 10;
  drawEn(page1, 'upon the following:', leftColX, yAr, 7, helvetica);

  // Article One
  yAr -= 13;
  drawAr(page1, 'البند الأول "التمهيد"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article One "Preamble"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, 'يعتبر التمهيد السابق جزءاً لا يتجزأ من هذا العقد .', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'The preamble above shall constitute an integral part of the present', leftColX, yAr, 7, helvetica);
  yAr -= 10;
  drawEn(page1, 'contract.', leftColX, yAr, 7, helvetica);

  // Article Two
  yAr -= 13;
  drawAr(page1, 'البند الثاني "طبيعة العمل"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article Two "Nature of the Work"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, 'تعاقد الطرف الأول مع الطرف الثاني للعمل لديه بمهنة ........................', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'The first party concluded a contract with the second party to work', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'داخل دولة الكويت .', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'for it in the profession of ................................ in the State of Kuwait.', leftColX, yAr, 7, helvetica);

  // Article Three
  yAr -= 13;
  drawAr(page1, 'البند الثالث "فترة التجربة"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article Three "Probation Period"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, 'يخضع الطرف الثاني لفترة تجربة لمدة لا تزيد عن 100 يوم عمل ،', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'The second party shall be subject to a probation period for a term', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'ويحق لكل طرف إنهاء العقد خلال تلك الفترة دون إخطار .', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'not exceeding 100 work days. Each party shall have the right to', leftColX, yAr, 7, helvetica);
  yAr -= 10;
  drawEn(page1, 'terminate the contract during the said term without notification.', leftColX, yAr, 7, helvetica);

  // Article Four
  yAr -= 13;
  drawAr(page1, 'البند الرابع "قيمة الأجر"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article Four "Wage Value"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, 'يتقاضى الطرف الثاني عن تنفيذ هذا العقد أجراً مقداره ....................', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'For executing the present contract, the second party shall receive', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'ديناراً يدفع في نهاية كل .................... ، ولا يجوز للطرف الأول تخفيض', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'the wage of .................... dinars to be paid at the end of every', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'الأجر أثناء سريان هذا العقد . ولا يجوز نقل الطرف الثاني إلى الأجر اليومي', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, '.................... . The first party may not decrease the wage during the', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'دون موافقته .', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'term of the contract. It may not transfer the second party to daily', leftColX, yAr, 7, helvetica);
  yAr -= 10;
  drawEn(page1, 'wage without his approval.', leftColX, yAr, 7, helvetica);

  // Article Five
  yAr -= 13;
  drawAr(page1, 'البند الخامس "نفاذ العقد"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article Five "Contract Term"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, 'يبدأ نفاذ العقد إعتباراً من ..... / ..... / ......... ويلتزم الطرف الثاني بالقيام', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'The contract shall come into force on .................... . The second', leftColX, yAr, 7, helvetica);

  yAr -= 10;
  drawAr(page1, 'بأداء عمله طوال مدة نفاذه .', rightColX, yAr, 7.2, cairoRegular);
  drawEn(page1, 'party shall execute his work during the entire execution term thereof.', leftColX, yAr, 7, helvetica);

  // Article Six
  yAr -= 13;
  drawAr(page1, 'البند السادس "مدة العقد"', 421, yAr, 7.5, cairoBold, black, 'center');
  drawEn(page1, 'Article Six "Contract Term"', 172, yAr, 7.2, helveticaBold, black, 'center');

  yAr -= 11;
  drawAr(page1, '- هذا العقد محدد المدة ويبدأ إعتباراً من ..... / ..... / ......... ولمدة', rightColX, yAr, 7, cairoRegular);
  drawEn(page1, 'The present contract has a definite term. It shall come into force on', leftColX, yAr, 6.8, helvetica);

  yAr -= 10;
  drawAr(page1, '........... سنوات ، ويجوز تجديد العقد بموافقة الطرفين لمدد مماثلة', rightColX, yAr, 7, cairoRegular);
  drawEn(page1, '.................... for a term of ............ years. The contract may be', leftColX, yAr, 6.8, helvetica);

  yAr -= 10;
  drawAr(page1, 'بحد أقصى خمس سنوات ميلادية .', rightColX, yAr, 7, cairoRegular);
  drawEn(page1, 'renewed with the approval of the parties for similar terms not', leftColX, yAr, 6.8, helvetica);

  yAr -= 10;
  drawAr(page1, '- هذا العقد غير محدد المدة ويبدأ إعتباراً من ..... / ..... / ......... .', rightColX, yAr, 7, cairoRegular);
  drawEn(page1, 'exceeding five years.', leftColX, yAr, 6.8, helvetica);

  yAr -= 9;
  drawAr(page1, '* إعتبار العقد محدد المدة أو غير محدد المدة يخضع لإختياره لإرادة الطرفين .', rightColX, yAr, 6.5, cairoRegular, darkGray);
  drawEn(page1, 'The present contract has an indefinite term and it shall come into', leftColX, yAr, 6.8, helvetica);
  yAr -= 9;
  drawEn(page1, 'force on .................... .', leftColX, yAr, 6.8, helvetica);
  yAr -= 9;
  drawEn(page1, '* Considering the contract as having a definite or indefinite term', leftColX, yAr, 6.5, helvetica, darkGray);
  yAr -= 8;
  drawEn(page1, 'shall be subject to the will of the two parties.', leftColX, yAr, 6.5, helvetica, darkGray);


  // ==================== PAGE 2 ====================
  const page2 = setupPage(1);
  let yAr2 = 672;

  // Article Seven
  drawAr(page2, 'البند السابع "الإجازة السنوية"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Seven "Annual Leave"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'للطرف الثاني الحق في إجازة سنوية مدفوعة الأجر مدتها ............ يوماً ،', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The second party shall have the right to a paid annual leave with a', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'ولا يستحقها عن السنة الأولى إلا بعد انقضاء مدة تسعة أشهر تحسب من', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'term of ............ days. It shall not be due on the first year save after', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'تاريخ نفاذ العقد .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'the expiration of nine months to be calculated from the date of the', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'contract coming into force.', leftColX, yAr2, 7, helvetica);

  // Article Eight
  yAr2 -= 13;
  drawAr(page2, 'البند الثامن "عدد ساعات العمل"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Eight "Number of Work Hours"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'لا يجوز للطرف الأول تشغيل الطرف الثاني لمدة تزيد عن ثماني ساعات عمل', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The first party may not require that the second party work for a', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'يومياً تتخللها فترة راحة لا تقل عن ساعة باستثناء الحالات المقررة قانوناً .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'term exceeding eight daily work hours with rest periods not less', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'than one hour, except for the cases set forth in the law.', leftColX, yAr2, 7, helvetica);

  // Article Nine
  yAr2 -= 13;
  drawAr(page2, 'البند التاسع "قيمة تذكرة السفر"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Nine "Ticket Value"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'يتحمل الطرف الأول مصاريف عودة الطرف الثاني إلى بلده عند إنتهاء', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The first party shall bear the expenses of the return of the second', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'علاقة العمل ومغادرته نهائياً للبلاد .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'party to his country after the expiration of the work relationship', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'and his final departure from the country.', leftColX, yAr2, 7, helvetica);

  // Article Ten
  yAr2 -= 13;
  drawAr(page2, 'البند العاشر "التأمين ضد إصابات وأمراض العمل"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Ten "Insurance against Injuries and Work Maladies"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'يلتزم الطرف الأول بالتأمين على الطرف الثاني ضد إصابات وأمراض', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The first party shall insure the second party against injuries and', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'العمل ، كما يلتزم بقيمة التأمين الصحي طبقاً للقانون رقم (1) لسنة 1999 .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'work maladies. It shall also commit to the health insurance value in', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'accordance with the law No. (1) of the year 1999.', leftColX, yAr2, 7, helvetica);

  // Article Eleven
  yAr2 -= 13;
  drawAr(page2, 'البند الحادي عشر "مكافأة نهاية الخدمة"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Eleven "End of Service Benefit"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'يستحق الطرف الثاني مكافأة نهاية الخدمة المنصوص عليها بالقوانين المنظمة .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The second party shall be due the end of service benefit as set forth', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'in the regulating laws.', leftColX, yAr2, 7, helvetica);

  // Article Twelve
  yAr2 -= 13;
  drawAr(page2, 'البند الثاني عشر "القانون الواجب التطبيق"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Twelve "Applicable Law"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 12;
  drawAr(page2, 'تسري أحكام قانون العمل في القطاع الأهلي رقم 6 لسنة 2010 والقرارات', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The provisions of the Labour code in the civil sector No. 6 of 2010', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'المنفذة له فيما لم يرد بشأنه نص في هذا العقد ، ويقع باطلاً كل شرط تم', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'and the decisions executing the same shall apply for all matters not', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'الإتفاق عليه بالمخالفة لأحكام القانون ، ما لم يكن فيه ميزة أفضل للعامل .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'provided for in the present contract. Shall be considered null every', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'condition agreed upon in violation of the provisions of the law,', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'unless the same has a better benefit for the worker.', leftColX, yAr2, 7, helvetica);

  // Article Thirteen
  yAr2 -= 13;
  drawAr(page2, 'البند الثالث عشر "شروط خاصة"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Thirteen "Special Conditions"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 11;
  drawAr(page2, '1- ............................................................................', rightColX, yAr2, 7, cairoRegular);
  drawEn(page2, '1. ............................................................................', leftColX, yAr2, 7, helvetica);

  yAr2 -= 10;
  drawAr(page2, '2- ............................................................................', rightColX, yAr2, 7, cairoRegular);
  drawEn(page2, '2. ............................................................................', leftColX, yAr2, 7, helvetica);

  yAr2 -= 10;
  drawAr(page2, '3- ............................................................................', rightColX, yAr2, 7, cairoRegular);
  drawEn(page2, '3. ............................................................................', leftColX, yAr2, 7, helvetica);

  // Article Fourteen
  yAr2 -= 13;
  drawAr(page2, 'البند الرابع عشر "المحكمة المختصة"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Fourteen "Specialized Court"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 11;
  drawAr(page2, 'تختص المحكمة الكلية ودوائرها العمالية طبقاً لأحكام القانون رقم 46', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The court of first instance and its Labour departments, in', leftColX, yAr2, 7, helvetica);

  yAr2 -= 11;
  drawAr(page2, 'لسنة 1987 ، بنظر كافة المنازعات الناشئة عن تطبيق أو تفسير هذا العقد .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'accordance with the provisions of the law No. 46 of the year 1987,', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'shall be competent to peruse any conflicts resulting from the', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'execution or interpretation of the present contract.', leftColX, yAr2, 7, helvetica);

  // Article Fifteen
  yAr2 -= 13;
  drawAr(page2, 'البند الخامس عشر "لغة العقد"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Fifteen "Contract Language"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 11;
  drawAr(page2, 'حرر هذا العقد باللغتين العربية و .................... ، ويعتد بنصوص اللغة', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The present contract was made in Arabic and .................... . The', leftColX, yAr2, 7, helvetica);

  yAr2 -= 10;
  drawAr(page2, 'العربية عند وقوع أي تعارض بينهما .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'Arabic texts shall prevail in the case of any conflict between them.', leftColX, yAr2, 7, helvetica);

  // Article Sixteen
  yAr2 -= 13;
  drawAr(page2, 'البند السادس عشر "نسخ العقد"', 421, yAr2, 7.5, cairoBold, black, 'center');
  drawEn(page2, 'Article Sixteen "Contract Copies"', 172, yAr2, 7.2, helveticaBold, black, 'center');

  yAr2 -= 11;
  drawAr(page2, 'حرر هذا العقد من ثلاث نسخ بيد كل طرف نسخة للعمل بموجبها ،', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'The present contract was made in three copies, one for each party', leftColX, yAr2, 7, helvetica);

  yAr2 -= 10;
  drawAr(page2, 'والثالثة تودع لدى الهيئة العامة للقوى العاملة .', rightColX, yAr2, 7.2, cairoRegular);
  drawEn(page2, 'to work in accordance therewith. The third copy shall be deposited', leftColX, yAr2, 7, helvetica);
  yAr2 -= 10;
  drawEn(page2, 'at the Public Authority for Manpower.', leftColX, yAr2, 7, helvetica);

  // Signature Boxes at Bottom of Page 2
  const sigY = 120;
  page2.drawLine({ start: { x: 38, y: sigY }, end: { x: 557.28, y: sigY }, color: borderGray, thickness: 1 });
  
  drawAr(page2, 'الطرف الأول First Party', 421, sigY - 14, 8, cairoBold, black, 'center');
  drawEn(page2, 'الطرف الثاني Second Party', 172, sigY - 14, 8, cairoBold, black, 'center');

  drawAr(page2, 'التوقيع / الختم Signature / Stamp', 421, sigY - 45, 7.5, cairoRegular, darkGray, 'center');
  drawEn(page2, 'التوقيع Signature', 172, sigY - 45, 7.5, cairoRegular, darkGray, 'center');

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(process.cwd(), 'public/pam_contract_form_2.pdf'), pdfBytes);
  console.log('Clean PAM Contract Form 2 template written successfully!');
}

buildCleanPamTemplate().catch(console.error);
