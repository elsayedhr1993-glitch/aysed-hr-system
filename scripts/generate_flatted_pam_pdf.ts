import fs from 'fs';
import path from 'path';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { PDFDocument } from 'pdf-lib';

// Register standard Cairo and Amiri fonts for native Skia rendering
GlobalFonts.registerFromPath(path.join(process.cwd(), 'public/fonts/Cairo-Regular.ttf'), 'Cairo');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'public/fonts/Cairo-Bold.ttf'), 'CairoBold');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'public/fonts/Amiri-Regular.ttf'), 'Amiri');
GlobalFonts.registerFromPath(path.join(process.cwd(), 'public/fonts/Amiri-Bold.ttf'), 'AmiriBold');

const CANVAS_WIDTH = 1240; // ~150 DPI A4
const CANVAS_HEIGHT = 1754;

const scaleX = CANVAS_WIDTH / 595.28;
const scaleY = CANVAS_HEIGHT / 841.89;

function toPxX(pt: number): number {
  return pt * scaleX;
}
function toPxY(pt: number): number {
  return (841.89 - pt) * scaleY; // Invert PDF y-coordinates to Canvas Top-Down
}

async function renderPage1(): Promise<Buffer> {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const borderX = toPxX(38);
  const borderY = toPxY(730);
  const borderW = toPxX(519.28);
  const borderH = toPxY(55) - toPxY(730);
  const dividerX = toPxX(297.64);

  // Outer Framing Box
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(borderX, borderY, borderW, borderH);

  // Vertical Center Dividing Line
  ctx.beginPath();
  ctx.moveTo(dividerX, borderY);
  ctx.lineTo(dividerX, borderY + borderH);
  ctx.stroke();

  // Top Header Box (Sample Form...)
  const headerBoxH = toPxY(688) - toPxY(730);
  ctx.strokeRect(borderX, borderY, borderW, headerBoxH);

  // --- Official Header Above Box ---
  // Emblem / Logo
  try {
    const emblemPath = path.join(process.cwd(), 'public/kuwait_emblem.png');
    if (fs.existsSync(emblemPath)) {
      const emblem = await loadImage(emblemPath);
      ctx.drawImage(emblem, dividerX - 25, toPxY(815), 50, 50);
    } else {
      // Draw official geometric seal
      ctx.beginPath();
      ctx.arc(dividerX, toPxY(792), 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  } catch (e) {
    ctx.beginPath();
    ctx.arc(dividerX, toPxY(792), 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header Titles
  ctx.fillStyle = '#0f172a';
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px CairoBold';
  ctx.fillText('(2) نموذج عقد', toPxX(545), toPxY(790));

  ctx.textAlign = 'center';
  ctx.font = 'bold 17px CairoBold';
  ctx.fillText('دولة الكويت - الهيئة العامة للقوى العاملة', dividerX, toPxY(768));

  ctx.direction = 'ltr';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('The Public Authority For Manpower', dividerX, toPxY(753));

  // Header Box Content
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = 'bold 17px CairoBold';
  ctx.fillText('نموذج عقد عمل إسترشادي في القطاع الأهلي', toPxX(545), toPxY(707));

  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('Sample Form of an Employment Contract in the Civil Sector', toPxX(48), toPxY(707));

  // Helpers for columns
  const drawAr = (text: string, xPt: number, yPt: number, size = 13.5, isBold = false) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px ${isBold ? 'CairoBold' : 'Cairo'}`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawArCenter = (text: string, xPt: number, yPt: number, size = 14, isBold = true) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px ${isBold ? 'CairoBold' : 'Cairo'}`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawEn = (text: string, xPt: number, yPt: number, size = 12.5, isBold = false) => {
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px Arial`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawEnCenter = (text: string, xPt: number, yPt: number, size = 13, isBold = true) => {
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px Arial`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  // --- PAGE 1 CONTENT ---
  const rx = 545;
  const lx = 48;
  const rCenter = 421;
  const lCenter = 172;

  // Opening
  drawAr('دولة الكويت', rx, 672, 14, true);
  drawEn('State of Kuwait', lx, 672, 13, true);

  drawAr('الهيئة العامة للقوى العاملة / إدارة عمل ..........................', rx, 660, 13.5);
  drawEn('Public Authority for Manpower/ .................... Labour Department', lx, 660, 12.5);

  drawAr('إنه في يوم ............ الموافق ..... / ..... / ......... تم تحرير هذا العقد بين كل من:-', rx, 648, 13);
  drawEn('On ............ corresponding to ............ the present contract was', lx, 648, 12.5);
  drawEn('concluded by and between:', lx, 637, 12.5);

  // 1- First Party (Company)
  drawAr('1- شركة / مؤسسة ........................................ ويمثلها في', rx, 625, 13.5);
  drawEn('1. Company/ institution ........................................ represented in', lx, 625, 12.5);
  drawAr('التوقيع على هذا العقد:', rx, 614, 13.5);
  drawEn('signature in the present contract by:', lx, 614, 12.5);

  drawAr('الاسم: .................................................................', rx, 602, 13.5);
  drawEn('Name: .................................................................', lx, 602, 12.5);

  drawAr('الرقم المدني: .........................................................', rx, 590, 13.5);
  drawEn('Civil card: .........................................................', lx, 590, 12.5);

  drawArCenter('" طرف أول "', rCenter, 578, 14, true);
  drawEnCenter('(First party)', lCenter, 578, 13, true);

  // 2- Second Party (Employee)
  drawAr('2- الاسم: .................................................................', rx, 565, 13.5);
  drawEn('2. Name: .................................................................', lx, 565, 12.5);

  drawAr('الجنسية: .............................................................', rx, 553, 13.5);
  drawEn('Nationality: .........................................................', lx, 553, 12.5);

  drawAr('رقم مدني: .............................................................', rx, 541, 13.5);
  drawEn('Civil card: .........................................................', lx, 541, 12.5);

  drawAr('الإقامة: .............................................................', rx, 529, 13.5);
  drawEn('Residence: .........................................................', lx, 529, 12.5);

  drawArCenter('" طرف ثان "', rCenter, 517, 14, true);
  drawEnCenter('(Second party)', lCenter, 517, 13, true);

  // Preamble
  drawArCenter('تمهيد', rCenter, 503, 14, true);
  drawEnCenter('Preamble', lCenter, 503, 13, true);

  drawAr('يمتلك الطرف الأول منشأة بإسم ........................................ تعمل', rx, 491, 13);
  drawEn('The first party owns the facility entitled ........................................', lx, 491, 12);

  drawAr('في مجال .............................. ؛ ويرغب في التعاقد مع الطرف', rx, 480, 13);
  drawEn('working in the field of ..............................; whereas it wishes to', lx, 480, 12);

  drawAr('الثاني للعمل لديه بمهنة ................................................. ؛', rx, 469, 13);
  drawEn('conclude a contract with the second party to work for it in the', lx, 469, 12);

  drawAr('وبعد أن أقر الطرفان بأهليتهما في إبرام هذا العقد تم الإتفاق على ما يلي:', rx, 458, 13);
  drawEn('profession of ..............................; whereas the parties', lx, 458, 12);
  drawEn('acknowledged their capacity to conclude this contract, they agreed', lx, 447, 12);
  drawEn('upon the following:', lx, 437, 12);

  // Article 1
  drawArCenter('البند الأول "التمهيد"', rCenter, 424, 13.5, true);
  drawEnCenter('Article One "Preamble"', lCenter, 424, 12.5, true);

  drawAr('يعتبر التمهيد السابق جزءاً لا يتجزأ من هذا العقد .', rx, 412, 13);
  drawEn('The preamble above shall constitute an integral part of the present', lx, 412, 12);
  drawEn('contract.', lx, 402, 12);

  // Article 2
  drawArCenter('البند الثاني "طبيعة العمل"', rCenter, 389, 13.5, true);
  drawEnCenter('Article Two "Nature of the Work"', lCenter, 389, 12.5, true);

  drawAr('تعاقد الطرف الأول مع الطرف الثاني للعمل لديه بمهنة ........................', rx, 377, 13);
  drawEn('The first party concluded a contract with the second party to work', lx, 377, 12);

  drawAr('داخل دولة الكويت .', rx, 366, 13);
  drawEn('for it in the profession of ................................ in the State of Kuwait.', lx, 366, 12);

  // Article 3
  drawArCenter('البند الثالث "فترة التجربة"', rCenter, 353, 13.5, true);
  drawEnCenter('Article Three "Probation Period"', lCenter, 353, 12.5, true);

  drawAr('يخضع الطرف الثاني لفترة تجربة لمدة لا تزيد عن 100 يوم عمل ،', rx, 341, 13);
  drawEn('The second party shall be subject to a probation period for a term', lx, 341, 12);

  drawAr('ويحق لكل طرف إنهاء العقد خلال تلك الفترة دون إخطار .', rx, 330, 13);
  drawEn('not exceeding 100 work days. Each party shall have the right to', lx, 330, 12);
  drawEn('terminate the contract during the said term without notification.', lx, 319, 12);

  // Article 4
  drawArCenter('البند الرابع "قيمة الأجر"', rCenter, 306, 13.5, true);
  drawEnCenter('Article Four "Wage Value"', lCenter, 306, 12.5, true);

  drawAr('يتقاضى الطرف الثاني عن تنفيذ هذا العقد أجراً مقداره ....................', rx, 294, 13);
  drawEn('For executing the present contract, the second party shall receive', lx, 294, 12);

  drawAr('ديناراً يدفع في نهاية كل .................... ، ولا يجوز للطرف الأول تخفيض', rx, 283, 13);
  drawEn('the wage of .................... dinars to be paid at the end of every', lx, 283, 12);

  drawAr('الأجر أثناء سريان هذا العقد . ولا يجوز نقل الطرف الثاني إلى الأجر اليومي', rx, 272, 13);
  drawEn('.................... . The first party may not decrease the wage during the', lx, 272, 12);

  drawAr('دون موافقته .', rx, 261, 13);
  drawEn('term of the contract. It may not transfer the second party to daily', lx, 261, 12);
  drawEn('wage without his approval.', lx, 250, 12);

  // Article 5
  drawArCenter('البند الخامس "نفاذ العقد"', rCenter, 237, 13.5, true);
  drawEnCenter('Article Five "Contract Term"', lCenter, 237, 12.5, true);

  drawAr('يبدأ نفاذ العقد إعتباراً من ..... / ..... / ......... ويلتزم الطرف الثاني بالقيام', rx, 225, 13);
  drawEn('The contract shall come into force on .................... . The second', lx, 225, 12);

  drawAr('بأداء عمله طوال مدة نفاذه .', rx, 214, 13);
  drawEn('party shall execute his work during the entire execution term thereof.', lx, 214, 12);

  // Article 6
  drawArCenter('البند السادس "مدة العقد"', rCenter, 201, 13.5, true);
  drawEnCenter('Article Six "Contract Term"', lCenter, 201, 12.5, true);

  drawAr('- هذا العقد محدد المدة ويبدأ إعتباراً من ..... / ..... / ......... ولمدة', rx, 189, 12.5);
  drawEn('The present contract has a definite term. It shall come into force on', lx, 189, 11.5);

  drawAr('........... سنوات ، ويجوز تجديد العقد بموافقة الطرفين لمدد مماثلة', rx, 178, 12.5);
  drawEn('.................... for a term of ............ years. The contract may be', lx, 178, 11.5);

  drawAr('بحد أقصى خمس سنوات ميلادية .', rx, 167, 12.5);
  drawEn('renewed with the approval of the parties for similar terms not', lx, 167, 11.5);

  drawAr('- هذا العقد غير محدد المدة ويبدأ إعتباراً من ..... / ..... / ......... .', rx, 156, 12.5);
  drawEn('exceeding five years.', lx, 156, 11.5);

  drawAr('* إعتبار العقد محدد المدة أو غير محدد المدة يخضع لإختياره لإرادة الطرفين .', rx, 145, 11.5);
  drawEn('The present contract has an indefinite term and it shall come into', lx, 145, 11.5);
  drawEn('force on .................... .', lx, 135, 11.5);

  drawEn('* Considering the contract as having a definite or indefinite term', lx, 125, 11);
  drawEn('shall be subject to the will of the two parties.', lx, 115, 11);

  // Page 1 Footer
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = '11px Cairo';
  ctx.fillStyle = '#475569';
  ctx.fillText('ملاحظة / يعد هذا النموذج نموذجاً استرشادياً لشروط وأحكام عقد العمل في القطاع الأهلي ، ويحق لكل شركة إعداد نموذج مماثل له على مطبوعاتها الخاصة بها بشرط أن يتضمن كافة الأحكام والشروط الواردة بهذا النموذج .', toPxX(545), toPxY(40));

  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px Arial';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('1', dividerX, toPxY(40));

  return canvas.toBuffer('image/png');
}

async function renderPage2(): Promise<Buffer> {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const borderX = toPxX(38);
  const borderY = toPxY(730);
  const borderW = toPxX(519.28);
  const borderH = toPxY(55) - toPxY(730);
  const dividerX = toPxX(297.64);

  // Outer Framing Box
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(borderX, borderY, borderW, borderH);

  // Vertical Center Dividing Line
  ctx.beginPath();
  ctx.moveTo(dividerX, borderY);
  ctx.lineTo(dividerX, borderY + borderH);
  ctx.stroke();

  // Top Header Box
  const headerBoxH = toPxY(688) - toPxY(730);
  ctx.strokeRect(borderX, borderY, borderW, headerBoxH);

  // Emblem / Logo
  try {
    const emblemPath = path.join(process.cwd(), 'public/kuwait_emblem.png');
    if (fs.existsSync(emblemPath)) {
      const emblem = await loadImage(emblemPath);
      ctx.drawImage(emblem, dividerX - 25, toPxY(815), 50, 50);
    } else {
      ctx.beginPath();
      ctx.arc(dividerX, toPxY(792), 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  } catch (e) {
    ctx.beginPath();
    ctx.arc(dividerX, toPxY(792), 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header Titles
  ctx.fillStyle = '#0f172a';
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px CairoBold';
  ctx.fillText('(2) نموذج عقد', toPxX(545), toPxY(790));

  ctx.textAlign = 'center';
  ctx.font = 'bold 17px CairoBold';
  ctx.fillText('دولة الكويت - الهيئة العامة للقوى العاملة', dividerX, toPxY(768));

  ctx.direction = 'ltr';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('The Public Authority For Manpower', dividerX, toPxY(753));

  // Header Box Content
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = 'bold 17px CairoBold';
  ctx.fillText('نموذج عقد عمل إسترشادي في القطاع الأهلي', toPxX(545), toPxY(707));

  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('Sample Form of an Employment Contract in the Civil Sector', toPxX(48), toPxY(707));

  const drawAr = (text: string, xPt: number, yPt: number, size = 13.5, isBold = false) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px ${isBold ? 'CairoBold' : 'Cairo'}`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawArCenter = (text: string, xPt: number, yPt: number, size = 14, isBold = true) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px ${isBold ? 'CairoBold' : 'Cairo'}`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawEn = (text: string, xPt: number, yPt: number, size = 12.5, isBold = false) => {
    ctx.direction = 'ltr';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px Arial`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const drawEnCenter = (text: string, xPt: number, yPt: number, size = 13, isBold = true) => {
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `${isBold ? 'bold ' : ''}${size}px Arial`;
    ctx.fillText(text, toPxX(xPt), toPxY(yPt));
  };

  const rx = 545;
  const lx = 48;
  const rCenter = 421;
  const lCenter = 172;

  // Article 7
  drawArCenter('البند السابع "الإجازة السنوية"', rCenter, 672, 13.5, true);
  drawEnCenter('Article Seven "Annual Leave"', lCenter, 672, 12.5, true);

  drawAr('للطرف الثاني الحق في إجازة سنوية مدفوعة الأجر مدتها ............ يوماً ،', rx, 660, 13);
  drawEn('The second party shall have the right to a paid annual leave with a', lx, 660, 12);

  drawAr('ولا يستحقها عن السنة الأولى إلا بعد انقضاء مدة تسعة أشهر تحسب من', rx, 649, 13);
  drawEn('term of ............ days. It shall not be due on the first year save after', lx, 649, 12);

  drawAr('تاريخ نفاذ العقد .', rx, 638, 13);
  drawEn('the expiration of nine months to be calculated from the date of the', lx, 638, 12);
  drawEn('contract coming into force.', lx, 627, 12);

  // Article 8
  drawArCenter('البند الثامن "عدد ساعات العمل"', rCenter, 614, 13.5, true);
  drawEnCenter('Article Eight "Number of Work Hours"', lCenter, 614, 12.5, true);

  drawAr('لا يجوز للطرف الأول تشغيل الطرف الثاني لمدة تزيد عن ثماني ساعات عمل', rx, 602, 13);
  drawEn('The first party may not require that the second party work for a', lx, 602, 12);

  drawAr('يومياً تتخللها فترة راحة لا تقل عن ساعة باستثناء الحالات المقررة قانوناً .', rx, 591, 13);
  drawEn('term exceeding eight daily work hours with rest periods not less', lx, 591, 12);
  drawEn('than one hour, except for the cases set forth in the law.', lx, 580, 12);

  // Article 9
  drawArCenter('البند التاسع "قيمة تذكرة السفر"', rCenter, 567, 13.5, true);
  drawEnCenter('Article Nine "Ticket Value"', lCenter, 567, 12.5, true);

  drawAr('يتحمل الطرف الأول مصاريف عودة الطرف الثاني إلى بلده عند إنتهاء', rx, 555, 13);
  drawEn('The first party shall bear the expenses of the return of the second', lx, 555, 12);

  drawAr('علاقة العمل ومغادرته نهائياً للبلاد .', rx, 544, 13);
  drawEn('party to his country after the expiration of the work relationship', lx, 544, 12);
  drawEn('and his final departure from the country.', lx, 533, 12);

  // Article 10
  drawArCenter('البند العاشر "التأمين ضد إصابات وأمراض العمل"', rCenter, 520, 13.5, true);
  drawEnCenter('Article Ten "Insurance against Injuries and Work Maladies"', lCenter, 520, 12.5, true);

  drawAr('يلتزم الطرف الأول بالتأمين على الطرف الثاني ضد إصابات وأمراض', rx, 508, 13);
  drawEn('The first party shall insure the second party against injuries and', lx, 508, 12);

  drawAr('العمل ، كما يلتزم بقيمة التأمين الصحي طبقاً للقانون رقم (1) لسنة 1999 .', rx, 497, 13);
  drawEn('work maladies. It shall also commit to the health insurance value in', lx, 497, 12);
  drawEn('accordance with the law No. (1) of the year 1999.', lx, 486, 12);

  // Article 11
  drawArCenter('البند الحادي عشر "مكافأة نهاية الخدمة"', rCenter, 473, 13.5, true);
  drawEnCenter('Article Eleven "End of Service Benefit"', lCenter, 473, 12.5, true);

  drawAr('يستحق الطرف الثاني مكافأة نهاية الخدمة المنصوص عليها بالقوانين المنظمة .', rx, 461, 13);
  drawEn('The second party shall be due the end of service benefit as set forth', lx, 461, 12);
  drawEn('in the regulating laws.', lx, 450, 12);

  // Article 12
  drawArCenter('البند الثاني عشر "القانون الواجب التطبيق"', rCenter, 437, 13.5, true);
  drawEnCenter('Article Twelve "Applicable Law"', lCenter, 437, 12.5, true);

  drawAr('تسري أحكام قانون العمل في القطاع الأهلي رقم 6 لسنة 2010 والقرارات', rx, 425, 13);
  drawEn('The provisions of the Labour code in the civil sector No. 6 of 2010', lx, 425, 12);

  drawAr('المنفذة له فيما لم يرد بشأنه نص في هذا العقد ، ويقع باطلاً كل شرط تم', rx, 414, 13);
  drawEn('and the decisions executing the same shall apply for all matters not', lx, 414, 12);

  drawAr('الإتفاق عليه بالمخالفة لأحكام القانون ، ما لم يكن فيه ميزة أفضل للعامل .', rx, 403, 13);
  drawEn('provided for in the present contract. Shall be considered null every', lx, 403, 12);
  drawEn('condition agreed upon in violation of the provisions of the law,', lx, 392, 12);
  drawEn('unless the same has a better benefit for the worker.', lx, 381, 12);

  // Article 13
  drawArCenter('البند الثالث عشر "شروط خاصة"', rCenter, 368, 13.5, true);
  drawEnCenter('Article Thirteen "Special Conditions"', lCenter, 368, 12.5, true);

  drawAr('1- ............................................................................', rx, 356, 13);
  drawEn('1. ............................................................................', lx, 356, 12);

  drawAr('2- ............................................................................', rx, 345, 13);
  drawEn('2. ............................................................................', lx, 345, 12);

  drawAr('3- ............................................................................', rx, 334, 13);
  drawEn('3. ............................................................................', lx, 334, 12);

  // Article 14
  drawArCenter('البند الرابع عشر "المحكمة المختصة"', rCenter, 321, 13.5, true);
  drawEnCenter('Article Fourteen "Specialized Court"', lCenter, 321, 12.5, true);

  drawAr('تختص المحكمة الكلية ودوائرها العمالية طبقاً لأحكام القانون رقم 46', rx, 309, 13);
  drawEn('The court of first instance and its Labour departments, in', lx, 309, 12);

  drawAr('لسنة 1987 ، بنظر كافة المنازعات الناشئة عن تطبيق أو تفسير هذا العقد .', rx, 298, 13);
  drawEn('accordance with the provisions of the law No. 46 of the year 1987,', lx, 298, 12);
  drawEn('shall be competent to peruse any conflicts resulting from the', lx, 287, 12);
  drawEn('execution or interpretation of the present contract.', lx, 276, 12);

  // Article 15
  drawArCenter('البند الخامس عشر "لغة العقد"', rCenter, 263, 13.5, true);
  drawEnCenter('Article Fifteen "Contract Language"', lCenter, 263, 12.5, true);

  drawAr('حرر هذا العقد باللغتين العربية و .................... ، ويعتد بنصوص اللغة', rx, 251, 13);
  drawEn('The present contract was made in Arabic and .................... . The', lx, 251, 12);

  drawAr('العربية عند وقوع أي تعارض بينهما .', rx, 240, 13);
  drawEn('Arabic texts shall prevail in the case of any conflict between them.', lx, 240, 12);

  // Article 16
  drawArCenter('البند السادس عشر "نسخ العقد"', rCenter, 227, 13.5, true);
  drawEnCenter('Article Sixteen "Contract Copies"', lCenter, 227, 12.5, true);

  drawAr('حرر هذا العقد من ثلاث نسخ بيد كل طرف نسخة للعمل بموجبها ،', rx, 215, 13);
  drawEn('The present contract was made in three copies, one for each party', lx, 215, 12);

  drawAr('والثالثة تودع لدى الهيئة العامة للقوى العاملة .', rx, 204, 13);
  drawEn('to work in accordance therewith. The third copy shall be deposited', lx, 204, 12);
  drawEn('at the Public Authority for Manpower.', lx, 193, 12);

  // Signature Section
  const sigY = toPxY(120);
  ctx.beginPath();
  ctx.moveTo(borderX, sigY);
  ctx.lineTo(borderX + borderW, sigY);
  ctx.stroke();

  drawArCenter('الطرف الأول First Party', rCenter, 106, 14, true);
  drawEnCenter('الطرف الثاني Second Party', lCenter, 106, 14, true);

  drawArCenter('التوقيع / الختم Signature / Stamp', rCenter, 75, 13, false);
  drawEnCenter('التوقيع Signature', lCenter, 75, 13, false);

  // Page 2 Footer
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.font = '11px Cairo';
  ctx.fillStyle = '#475569';
  ctx.fillText('ملاحظة / يعد هذا النموذج نموذجاً استرشادياً لشروط وأحكام عقد العمل في القطاع الأهلي ، ويحق لكل شركة إعداد نموذج مماثل له على مطبوعاتها الخاصة بها بشرط أن يتضمن كافة الأحكام والشروط الواردة بهذا النموذج .', toPxX(545), toPxY(40));

  ctx.direction = 'ltr';
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px Arial';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('2', dividerX, toPxY(40));

  return canvas.toBuffer('image/png');
}

async function buildCleanFlattenedPdf() {
  console.log('Rendering Page 1 PNG...');
  const page1Png = await renderPage1();
  console.log('Rendering Page 2 PNG...');
  const page2Png = await renderPage2();

  // Save PNGs to public for HTML Overlay Preview
  fs.writeFileSync(path.join(process.cwd(), 'public/pam_form2_page1.png'), page1Png);
  fs.writeFileSync(path.join(process.cwd(), 'public/pam_form2_page2.png'), page2Png);

  const pdfDoc = await PDFDocument.create();
  const page1Img = await pdfDoc.embedPng(page1Png);
  const page2Img = await pdfDoc.embedPng(page2Png);

  const p1 = pdfDoc.addPage([595.28, 841.89]);
  p1.drawImage(page1Img, { x: 0, y: 0, width: 595.28, height: 841.89 });

  const p2 = pdfDoc.addPage([595.28, 841.89]);
  p2.drawImage(page2Img, { x: 0, y: 0, width: 595.28, height: 841.89 });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'public/pam_contract_form_2.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Pristine Flatted PAM PDF and PNGs created at ${outputPath}`);
}

buildCleanFlattenedPdf().catch(console.error);
