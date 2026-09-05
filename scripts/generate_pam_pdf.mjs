import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import reshaper from "arabic-persian-reshaper";
import fs from "fs";

function shapeArabic(text) {
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

async function createPamTemplate() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const amiriRegularBytes = fs.readFileSync("public/fonts/Amiri-Regular.ttf");
  const amiriBoldBytes = fs.readFileSync("public/fonts/Amiri-Bold.ttf");
  
  const fontArRegular = await pdfDoc.embedFont(amiriRegularBytes);
  const fontArBold = await pdfDoc.embedFont(amiriBoldBytes);
  const fontEnRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontEnBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.08, 0.08, 0.08);
  const red = rgb(0.8, 0.15, 0.15);

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 42;
  const MARGIN_RIGHT = 42;
  const TABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // ~511.28
  const COL_WIDTH = TABLE_WIDTH / 2; // ~255.64
  const MID_X = MARGIN_LEFT + COL_WIDTH;

  // Function to draw text right-aligned for Arabic
  function drawArText(page, text, xRight, y, size = 9, isBold = false, color = black) {
    const font = isBold ? fontArBold : fontArRegular;
    const shaped = shapeArabic(text);
    const width = font.widthOfTextAtSize(shaped, size);
    page.drawText(shaped, {
      x: xRight - width,
      y,
      size,
      font,
      color,
    });
  }

  // Function to draw text left-aligned for English
  function drawEnText(page, text, xLeft, y, size = 8, isBold = false, color = black) {
    const font = isBold ? fontEnBold : fontEnRegular;
    page.drawText(text, {
      x: xLeft,
      y,
      size,
      font,
      color,
    });
  }

  // Draw Header on Top
  function drawHeader(page, pageNum) {
    // Top Right Form Number
    drawArText(page, "عقد نموذج (2)", PAGE_WIDTH - MARGIN_RIGHT, 805, 11, true);

    // Center circular emblem simulation
    const emblemCenterY = 808;
    const emblemCenterX = PAGE_WIDTH / 2;
    page.drawCircle({
      x: emblemCenterX,
      y: emblemCenterY,
      size: 14,
      borderColor: black,
      borderWidth: 1,
    });
    page.drawCircle({
      x: emblemCenterX,
      y: emblemCenterY,
      size: 11,
      borderColor: black,
      borderWidth: 0.5,
    });

    // Entity titles
    drawArText(page, "الهــــيئة العــامة للــقوى العـــاملة", emblemCenterX + 65, 782, 9.5, true);
    drawEnText(page, "The Public Authority For Manpower", emblemCenterX - 85, 770, 8.5, true);

    // Bottom note
    const footerNote = "ملاحظة / هذا النموذج يعد نموذجا إسترشاديا لشروط وأحكام عقد العمل في القطاع الأهلي ، ويحق لكل شركة إعداد نموذج مماثلا له على المطبوعات";
    const footerNote2 = "الخاصة بها شرط أن يتضمن كافة الأحكام والشروط الواردة بهذا النموذج .";
    
    // Page number
    page.drawText(String(pageNum), {
      x: PAGE_WIDTH / 2 - 3,
      y: 32,
      size: 9,
      font: fontEnBold,
      color: black,
    });

    drawArText(page, footerNote, PAGE_WIDTH - MARGIN_RIGHT, 18, 7.5, true, red);
    drawArText(page, footerNote2, PAGE_WIDTH - MARGIN_RIGHT, 9, 7.5, true, red);
  }

  // ================= PAGE 1 =================
  const page1 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page1, 1);

  const T1_TOP = 755;
  const T1_BOTTOM = 46;
  const T1_HEIGHT = T1_TOP - T1_BOTTOM;

  // Outer border of the main table
  page1.drawRectangle({
    x: MARGIN_LEFT,
    y: T1_BOTTOM,
    width: TABLE_WIDTH,
    height: T1_HEIGHT,
    borderColor: black,
    borderWidth: 1,
  });

  // Vertical center divider line
  page1.drawLine({
    start: { x: MID_X, y: T1_TOP },
    end: { x: MID_X, y: T1_BOTTOM },
    color: black,
    thickness: 1,
  });

  // Header row divider
  page1.drawLine({
    start: { x: MARGIN_LEFT, y: 720 },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: 720 },
    color: black,
    thickness: 1,
  });

  // Table Headers
  drawEnText(page1, "Sample Form of an Employment Contract in the Civil Sector", MARGIN_LEFT + 8, 735, 8, true);
  drawArText(page1, "نموذج عقد عمل إسترشادى", PAGE_WIDTH - MARGIN_RIGHT - 30, 740, 9.5, true);
  drawArText(page1, "فى القطاع الأهلى", PAGE_WIDTH - MARGIN_RIGHT - 50, 727, 9.5, true);

  // Column Content - Page 1
  const AR_RIGHT = PAGE_WIDTH - MARGIN_RIGHT - 6;
  const EN_LEFT = MARGIN_LEFT + 6;

  // --- Parties Section ---
  // Right Column (Arabic)
  let yAr = 708;
  drawArText(page1, "دولة الكويت", AR_RIGHT, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "الهيئة العامة للقوى العاملة / إدارة عمل --------", AR_RIGHT, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "إنه في يوم ----------- الموافق / / تحرر هذا العقد بين كل من-:", AR_RIGHT, yAr, 8.5, false);
  yAr -= 15;
  drawArText(page1, "-1 شركة / مؤسسة -------------- ويمثلها فى التوقيع على العقد", AR_RIGHT, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "الاسم", AR_RIGHT - 10, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "رقم مدني", AR_RIGHT - 10, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "\" طرف اول \"", AR_RIGHT - 60, yAr, 8.5, true);
  yAr -= 15;
  drawArText(page1, "-2 الاسم:", AR_RIGHT, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "الجنسية:", AR_RIGHT - 10, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "رقم مدني:", AR_RIGHT - 10, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "الإقامة:", AR_RIGHT - 10, yAr, 8.5, false);
  yAr -= 13;
  drawArText(page1, "\" طرف ثان \"", AR_RIGHT - 60, yAr, 8.5, true);

  // Left Column (English)
  let yEn = 708;
  drawEnText(page1, "State of Kuwait", EN_LEFT, yEn, 7.5, false);
  yEn -= 13;
  drawEnText(page1, "Public Authority for Manpower/_________Labour Department", EN_LEFT, yEn, 7.5, false);
  yEn -= 13;
  drawEnText(page1, "On _______ corresponding to ______ the present contract was", EN_LEFT, yEn, 7.5, false);
  yEn -= 11;
  drawEnText(page1, "concluded by and between:", EN_LEFT, yEn, 7.5, false);
  yEn -= 14;
  drawEnText(page1, "1.   Company/ institution ___________ represented in", EN_LEFT, yEn, 7.5, false);
  yEn -= 11;
  drawEnText(page1, "signature in the present contract by:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "Name:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "Civil card:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "(First party)", EN_LEFT + 30, yEn, 7.5, true);
  yEn -= 14;
  drawEnText(page1, "2.   Name:", EN_LEFT, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "Nationality:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "Civil card:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "Residence:", EN_LEFT + 18, yEn, 7.5, false);
  yEn -= 12;
  drawEnText(page1, "(Second party)", EN_LEFT + 30, yEn, 7.5, true);

  // Divider after Parties
  const P1_DIV1 = Math.min(yAr, yEn) - 8;
  page1.drawLine({
    start: { x: MARGIN_LEFT, y: P1_DIV1 },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: P1_DIV1 },
    color: black,
    thickness: 0.5,
  });

  // --- Preamble / تمهيد ---
  yAr = P1_DIV1 - 14;
  yEn = P1_DIV1 - 14;
  drawArText(page1, "تمهيد", MID_X + COL_WIDTH / 2 + 10, yAr, 9, true);
  drawEnText(page1, "Preamble", MARGIN_LEFT + COL_WIDTH / 2 - 20, yEn, 8, true);

  yAr -= 14;
  yEn -= 14;
  drawArText(page1, "يمتلك الطرف الأول منشأة بإسم -------- تعمل في مجال -----", AR_RIGHT, yAr, 8, false);
  yAr -= 12;
  drawArText(page1, "ويرغب فى التعاقد مع الطرف الثاني للعمل لديه بمهنة ------- وبعد أن", AR_RIGHT, yAr, 8, false);
  yAr -= 12;
  drawArText(page1, "أقر الطرفان بأهليتهما في إبرام هذا العقد تم الاتفاق على ما يلي :", AR_RIGHT, yAr, 8, false);

  drawEnText(page1, "The first party owns the facility entitled __________ working in the", EN_LEFT, yEn, 7.2, false);
  yEn -= 11;
  drawEnText(page1, "field of ________; whereas it wishes to conclude a contract with the", EN_LEFT, yEn, 7.2, false);
  yEn -= 11;
  drawEnText(page1, "second party to work for it in the profession of ___________;", EN_LEFT, yEn, 7.2, false);
  yEn -= 11;
  drawEnText(page1, "whereas the parties acknowledged their capacity to conclude this", EN_LEFT, yEn, 7.2, false);
  yEn -= 11;
  drawEnText(page1, "contract, they agreed upon the following:", EN_LEFT, yEn, 7.2, false);

  // --- Article One ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند الأول", MID_X + COL_WIDTH / 2 + 15, yAr, 8.5, true);
  drawEnText(page1, "Article One", MARGIN_LEFT + COL_WIDTH / 2 - 25, yEn, 7.8, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "يعتبر التمهيد السابق جزء لا يتجزأ من هذا العقد .", AR_RIGHT, yAr, 8, false);
  drawEnText(page1, "The preamble above shall constitute an integral part of the present", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "contract.", EN_LEFT, yEn, 7.2, false);

  // --- Article Two ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند الثاني", MID_X + COL_WIDTH / 2 + 15, yAr, 8.5, true);
  drawEnText(page1, "Article Two", MARGIN_LEFT + COL_WIDTH / 2 - 25, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page1, "\" طبيعة العمل \"", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page1, "\"Nature of the Work\"", MARGIN_LEFT + COL_WIDTH / 2 - 40, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "تعاقد الطرف الأول مع الطرف الثاني للعمل لديه بمهنة ------ داخل دولة", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "الكويت", AR_RIGHT, yAr, 8, false);
  drawEnText(page1, "The first party concluded a contract with the second party to work", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "for it in the profession of ________ in the State of Kuwait.", EN_LEFT, yEn, 7.2, false);

  // --- Article Three ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند الثالث", MID_X + COL_WIDTH / 2 + 15, yAr, 8.5, true);
  drawEnText(page1, "Article Three", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page1, "\" فترة التجربة \"", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page1, "\"Probation Period\"", MARGIN_LEFT + COL_WIDTH / 2 - 35, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "يخضع الطرف الثاني لفترة تجربة لمدة لا تزيد عن 100 يوم عمل ،", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "ويحق لكل طرف إنهاء العقد خلال تلك الفترة دون إخطار .", AR_RIGHT, yAr, 8, false);
  drawEnText(page1, "The second party shall be subject to a probation period for a term", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "not exceeding 100 work days. Each party shall have the right to", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "terminate the contract during the said term without notification.", EN_LEFT, yEn, 7.2, false);

  // --- Article Four ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند الرابع", MID_X + COL_WIDTH / 2 + 15, yAr, 8.5, true);
  drawEnText(page1, "Article Four", MARGIN_LEFT + COL_WIDTH / 2 - 28, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page1, "\" قيمة الأجر \"", MID_X + COL_WIDTH / 2 + 22, yAr, 8.5, true);
  drawEnText(page1, "\"Lease Value\"", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "يتقاضى الطرف الثاني عن تنفيذ هذا العقد أجرا مقداره -------- دينارا", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "يدفع في نهاية كل ------ ، ولا يجوز للطرف الأول تخفيض الأجر أثناء", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "سريان هذا العقد . ولا يجوز نقل الطرف الثانى إلى الأجر اليومى دون", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "موافقته .", AR_RIGHT, yAr, 8, false);

  drawEnText(page1, "For executing the present contract, the second party shall receive", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "the wage of _______ dinars to be paid at the end of every", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "__________. The first party may not decrease the wage during the", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "term of the contract. It may not transfer the second party to daily", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "wage without his approval.", EN_LEFT, yEn, 7.2, false);

  // --- Article Five ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند الخامس", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page1, "Article Five", MARGIN_LEFT + COL_WIDTH / 2 - 28, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page1, "\" نفاذ العقد \"", MID_X + COL_WIDTH / 2 + 20, yAr, 8.5, true);
  drawEnText(page1, "\"Contract Term\"", MARGIN_LEFT + COL_WIDTH / 2 - 35, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "يبدأ نفاذ العقد إعتبارا من ----/--/-- ويلتزم الطرف الثانى بالقيام بأداء", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "عمله طوال مدة نفاذه", AR_RIGHT, yAr, 8, false);

  drawEnText(page1, "The contract shall come into force on ___________. The second", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "party shall execute his work during the entire execution term", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "thereof.", EN_LEFT, yEn, 7.2, false);

  // --- Article Six ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page1, "البند السادس", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page1, "Article Six", MARGIN_LEFT + COL_WIDTH / 2 - 25, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page1, "\" مدة العقد \"", MID_X + COL_WIDTH / 2 + 20, yAr, 8.5, true);
  drawEnText(page1, "\"Contract Term\"", MARGIN_LEFT + COL_WIDTH / 2 - 35, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page1, "- هذا العقد محدد المدة ويبدأ إعتبارا من ---/--/-- ولمدة ------ سنوات ،", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "ويجوز تجديد العقد بموافقة الطرفين لمدد مماثلة بحد أقصى خمس سنوات", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "ميلادية", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "- هذا العقد غير محدد المدة ويبدأ إعتبارا من ----/---- / ------- .", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page1, "* إعتبار العقد محدد المدة أوغير محدد المدة يخضع إختياره لإرادة", AR_RIGHT, yAr, 7.8, false);

  drawEnText(page1, "The present contract has a definite term. It shall come into force on", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "__________ for a term of _______ years. The contract may be", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "renewed with the approval of the parties for similar terms not", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "exceeding five years.", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "The present contract has an indefinite term and it shall come into", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "force on _________.", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page1, "*Considering the contract as having a definite or indefinite term", EN_LEFT, yEn, 7, false);
  yEn -= 9;
  drawEnText(page1, "shall be subject to the will of the two parties.", EN_LEFT, yEn, 7, false);


  // ================= PAGE 2 =================
  const page2 = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawHeader(page2, 2);

  const T2_TOP = 755;
  const T2_BOTTOM = 180; // Above signature box
  const T2_HEIGHT = T2_TOP - T2_BOTTOM;

  // Outer border of the main table
  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: T2_BOTTOM,
    width: TABLE_WIDTH,
    height: T2_HEIGHT,
    borderColor: black,
    borderWidth: 1,
  });

  // Vertical center divider line
  page2.drawLine({
    start: { x: MID_X, y: T2_TOP },
    end: { x: MID_X, y: T2_BOTTOM },
    color: black,
    thickness: 1,
  });

  yAr = 745;
  yEn = 745;

  // Top line right: الطرفين .
  drawArText(page2, "الطرفين .", AR_RIGHT, yAr, 8, false);
  yAr -= 16;
  yEn -= 16;

  // --- Article Seven ---
  drawArText(page2, "البند السابع", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page2, "Article Seven", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" الإجازة السنوية \"", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "\"Annual Leave\"", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "للطرف الثاني الحق في إجازة سنوية مدفوعة الأجر مدتها ----- يوما ،", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "ولا يستحقها عن السنة الأولى إلا بعد انقضاء مدة تسعة أشهر تحسب من", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "تاريخ نفاذ العقد .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The second party shall have the right to a paid annual leave with a", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "term of _____ days. It shall not be due on the first year save after", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "the expiration of nine months to be calculated from the date of the", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "contract coming into force.", EN_LEFT, yEn, 7.2, false);

  // --- Article Eight ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الثامن", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page2, "Article Eight", MARGIN_LEFT + COL_WIDTH / 2 - 28, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" عدد ساعات العمل \"", MID_X + COL_WIDTH / 2 + 30, yAr, 8.5, true);
  drawEnText(page2, "\"Number of Work Hours\"", MARGIN_LEFT + COL_WIDTH / 2 - 50, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "لا يجوز للطرف الأول تشغيل الطرف الثاني لمدة تزيد عن ثماني ساعات", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "عمل يوميا تتخللها فترة راحة لا تقل عن ساعة باستثناء الحالات المقررة", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "قانونا .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The first party may not require that the second party work for a", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "term exceeding eight daily work hours with rest periods not less", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "than one hour, except for the cases set forth in the law.", EN_LEFT, yEn, 7.2, false);

  // --- Article Nine ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند التاسع", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page2, "Article Nine", MARGIN_LEFT + COL_WIDTH / 2 - 28, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" قيمة تذكرة السفر \"", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "\"Ticket Value\"", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "يتحمل الطرف الأول مصاريف عودة الطرف الثاني إلى بلده عند إنتهاء", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "علاقة العمل ومغادرته نهائيا للبلاد.", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The first party shall bear the expenses of the return of the second", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "party to his country after the expiration of the work relationship", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "and his final departure from the country.", EN_LEFT, yEn, 7.2, false);

  // --- Article Ten ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند العاشر", MID_X + COL_WIDTH / 2 + 18, yAr, 8.5, true);
  drawEnText(page2, "Article Ten", MARGIN_LEFT + COL_WIDTH / 2 - 28, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" التأمين ضد إصابات وأمراض العمل \"", MID_X + COL_WIDTH / 2 + 45, yAr, 8.5, true);
  drawEnText(page2, "\"Insurance against Injuries and Work Maladies\"", MARGIN_LEFT + COL_WIDTH / 2 - 80, yEn, 7.3, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "يلتزم الطرف الأول بالتأمين على الطرف الثاني ضد إصابات وأمراض", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "العمل ، كما يلتزم بقيمة التأمين الصحي طبقا للقانون رقم (1) لسنة 1999 .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The first party shall insure the second party against injuries and", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "work maladies. It shall also commit to the health insurance value in", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "accordance with the law No. (1) of the year 1999.", EN_LEFT, yEn, 7.2, false);

  // --- Article Eleven ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الحادى عشر", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "Article Eleven", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" مكافأة نهاية الخدمة \"", MID_X + COL_WIDTH / 2 + 30, yAr, 8.5, true);
  drawEnText(page2, "\"End of Service Benefit\"", MARGIN_LEFT + COL_WIDTH / 2 - 50, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "يستحق الطرف الثانى مكافأة نهاية الخدمة المنصوص عليها بالقوانين", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "المنظمة", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The second party shall be due the end of service benefit as set forth", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "in the regulating laws.", EN_LEFT, yEn, 7.2, false);

  // --- Article Twelve ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الثانى عشر", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "Article Twelve", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" القانون الواجب التطبيق \"", MID_X + COL_WIDTH / 2 + 35, yAr, 8.5, true);
  drawEnText(page2, "\"Applicable Law\"", MARGIN_LEFT + COL_WIDTH / 2 - 40, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "تسري أحكام قانون العمل فى القطاع الأهلى رقم 6 لسنة 2010", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "والقرارات المنفذة له فيما لم يرد بشأنه نص فى هذا العقد ، ويقع باطلا كل", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "شرط تم الإتفاق عليه بالمخالفة لأحكام القانون ، ما لم يكن فيه ميزة أفضل", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "للعامل .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The provisions of the Labour code in the civil sector No. 6 of 2010", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "and the decisions executing the same shall apply for all matters not", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "provided for in the present contract. Shall be considered null every", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "condition agreed upon in violation of the provisions of the law,", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "unless the same has a better benefit for the worker.", EN_LEFT, yEn, 7.2, false);

  // --- Article Thirteen ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الثالث عشر", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "Article Thirteen", MARGIN_LEFT + COL_WIDTH / 2 - 32, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\"شروط خاصة \"", MID_X + COL_WIDTH / 2 + 20, yAr, 8.5, true);
  drawEnText(page2, "\"Special Conditions\"", MARGIN_LEFT + COL_WIDTH / 2 - 40, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "1-------------------", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "2-------------------", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "3-------------------", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "1.-------------------", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "2. ------------------", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "3. ------------------", EN_LEFT, yEn, 7.2, false);

  // --- Article Fourteen ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الرابع عشر", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "Article Fourteen", MARGIN_LEFT + COL_WIDTH / 2 - 32, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" المحكمة المختصة \"", MID_X + COL_WIDTH / 2 + 25, yAr, 8.5, true);
  drawEnText(page2, "\"Specialized Court\"", MARGIN_LEFT + COL_WIDTH / 2 - 40, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "تختص المحكمة الكلية ودوائرها العمالية طبقا لأحكام القانون رقم 46", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "لسنة 1987 ، بنظر كافة المنازعات الناشئة عن تطبيق أو تفسير هذا", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "العقد .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The court of first instance and its Labour departments, in", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "accordance with the provisions of the law No. 46 of the year 1987,", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "shall be competent to peruse any conflicts resulting from the", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "execution or interpretation of the present contract.", EN_LEFT, yEn, 7.2, false);

  // --- Article Fifteen ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند الخامس عشر", MID_X + COL_WIDTH / 2 + 28, yAr, 8.5, true);
  drawEnText(page2, "Article Fifteen", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" لغة العقد \"", MID_X + COL_WIDTH / 2 + 20, yAr, 8.5, true);
  drawEnText(page2, "\"Contract Language\"", MARGIN_LEFT + COL_WIDTH / 2 - 40, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "حرر هذا العقد باللغتين العربية و---------- ، ويعتد بنصوص اللغة", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "العربية عند وقوع أى تعارض بينهما .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The present contract was made in Arabic and ____________. The", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "Arabic texts shall prevail in the case of any conflict between them.", EN_LEFT, yEn, 7.2, false);

  // --- Article Sixteen ---
  yAr = Math.min(yAr, yEn) - 13;
  yEn = yAr;
  drawArText(page2, "البند السادس عشر", MID_X + COL_WIDTH / 2 + 28, yAr, 8.5, true);
  drawEnText(page2, "Article Sixteen", MARGIN_LEFT + COL_WIDTH / 2 - 30, yEn, 7.8, true);
  yAr -= 11;
  yEn -= 11;
  drawArText(page2, "\" نسخ العقد \"", MID_X + COL_WIDTH / 2 + 20, yAr, 8.5, true);
  drawEnText(page2, "\"Contract Copies\"", MARGIN_LEFT + COL_WIDTH / 2 - 35, yEn, 7.5, true);
  yAr -= 12;
  yEn -= 12;
  drawArText(page2, "حرر هذا العقد من ثلاث نسخ بيد كل طرف نسخة للعمل بموجبها والثالثة", AR_RIGHT, yAr, 8, false);
  yAr -= 11;
  drawArText(page2, "تودع لدى الهيئة العامة للقوى العاملة .", AR_RIGHT, yAr, 8, false);

  drawEnText(page2, "The present contract was made in three copies, one for each party", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "to work in accordance therewith. The third copy shall be deposited", EN_LEFT, yEn, 7.2, false);
  yEn -= 10;
  drawEnText(page2, "at the Public Authority for Manpower.", EN_LEFT, yEn, 7.2, false);

  // --- Signatures Section Box at bottom of page 2 ---
  const SIG_TOP = 172;
  const SIG_BOTTOM = 60;
  const SIG_HEIGHT = SIG_TOP - SIG_BOTTOM;

  page2.drawRectangle({
    x: MARGIN_LEFT,
    y: SIG_BOTTOM,
    width: TABLE_WIDTH,
    height: SIG_HEIGHT,
    borderColor: black,
    borderWidth: 1,
  });

  page2.drawLine({
    start: { x: MID_X, y: SIG_TOP },
    end: { x: MID_X, y: SIG_BOTTOM },
    color: black,
    thickness: 1,
  });

  // Headers inside signature box
  drawArText(page2, "First Party الطرف الأول", PAGE_WIDTH - MARGIN_RIGHT - 20, SIG_TOP - 16, 9.5, true);
  drawArText(page2, "Second Party الطرف الثاني", MID_X - 20, SIG_TOP - 16, 9.5, true);

  // Save to public/pam_contract_form_2.pdf
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("public/pam_contract_form_2.pdf", pdfBytes);
  console.log("Successfully generated public/pam_contract_form_2.pdf! Bytes:", pdfBytes.length);
}

createPamTemplate().catch(console.error);
