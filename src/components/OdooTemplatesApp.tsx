import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Building2, 
  ShieldCheck, 
  FileSignature, 
  Globe, 
  FolderArchive, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  FileSpreadsheet, 
  Check, 
  FileCheck2, 
  Layers, 
  Copy,
  Info,
  Scale,
  Columns2,
  Maximize2,
  Minimize2,
  Edit3,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy, EmployeeContract } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportElementToPdf } from '../utils/printUtils';
import { tafqeet } from '../utils/tafqeet';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { DocumentItem } from '../types';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import OdooPamContractModal from './OdooPamContractModal';
import OdooRichDocumentEditor from './OdooRichDocumentEditor';

export type TemplateCategory = 'ALL' | 'CONTRACTS' | 'BANKING' | 'ADMIN';
export type WorkspaceView = 'split' | 'editor' | 'preview';

export type TemplateId = 
  | 'contract_kuwait' 
  | 'pam_contract' 
  | 'contract_part_time'
  | 'salary_cert_ar' 
  | 'salary_cert_en' 
  | 'to_whom' 
  | 'noc_letter'
  | 'commencement'
  | 'return_from_leave'
  | 'warning' 
  | 'non_renewal'
  | 'eos_settlement' 
  | 'experience_cert';

interface TemplateDef {
  id: TemplateId;
  category: 'CONTRACTS' | 'BANKING' | 'ADMIN';
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  isPamModal?: boolean;
}

const TEMPLATES_LIST: TemplateDef[] = [
  // 1. عقود العمل الرسمية
  {
    id: 'contract_kuwait',
    category: 'CONTRACTS',
    title: 'عقد عمل أهلي كويتي رسمي',
    subtitle: 'شامل كافة المواد الإلزامية طبقاً لقانون العمل الكويتي رقم 6 لسنة 2010',
    badge: 'معتمد قانونياً',
    icon: '📜'
  },
  {
    id: 'pam_contract',
    category: 'CONTRACTS',
    title: 'عقد القوى العاملة الموحد (PAM 2)',
    subtitle: 'النموذج الرسمي للهيئة العامة للقوى العاملة بدولة الكويت للتحويل وتجديد الإقامة',
    badge: 'نموذج PAM',
    icon: '🏛️',
    isPamModal: true
  },
  {
    id: 'contract_part_time',
    category: 'CONTRACTS',
    title: 'عقد عمل بدوام جزئي / استشاري',
    subtitle: 'عقد مهني مرن بالساعة والمهام للمستشارين والكوادر المؤقتة',
    badge: 'دوام جزئي',
    icon: '⏳'
  },

  // 2. الشهادات والخطابات البنكية
  {
    id: 'salary_cert_ar',
    category: 'BANKING',
    title: 'شهادة تفصيل راتب واستمرارية تحويل (عربي)',
    subtitle: 'موجهة للبنوك والجهات التمويلية موثقة برقم الآيبان ونظام حماية الأجور WPS',
    badge: 'معاملات بنكية',
    icon: '🏦'
  },
  {
    id: 'salary_cert_en',
    category: 'BANKING',
    title: 'Salary Certificate & Proof of Income (EN)',
    subtitle: 'Official certified salary certificate for Embassies, Consulates & International Banks',
    badge: 'English / Visa',
    icon: '🌐'
  },
  {
    id: 'to_whom',
    category: 'BANKING',
    title: 'شهادة لمن يهمه الأمر (إثبات عمل)',
    subtitle: 'إثبات رأس العمل والمسمى الوظيفي للجهات الحكومية والوزارات الكويتية',
    badge: 'إثبات كادر',
    icon: '📋'
  },
  {
    id: 'noc_letter',
    category: 'BANKING',
    title: 'خطاب عدم ممانعة (NOC)',
    subtitle: 'للمرور (استخراج رخصة قيادة) أو فتح حساب بنكي أو استكمال دراسات عليا',
    badge: 'عدم ممانعة',
    icon: '🚗'
  },

  // 3. الإجراءات الإدارية والقانونية
  {
    id: 'commencement',
    category: 'ADMIN',
    title: 'إشعار مباشرة عمل واستلام مهام',
    subtitle: 'توثيق تاريخ الالتحاق الفعلي بالعمل واستحقاق الراتب وتفعيل البصمة',
    badge: 'مباشرة عمل',
    icon: '🚀'
  },
  {
    id: 'return_from_leave',
    category: 'ADMIN',
    title: 'إشعار استئناف العمل بعد الإجازة',
    subtitle: 'إقرار بالعودة في الموعد المحدد وتحديث أرصدة الإجازات السنوية',
    badge: 'عودة من إجازة',
    icon: '🏖️'
  },
  {
    id: 'warning',
    category: 'ADMIN',
    title: 'كتاب إنذار ولفت نظر إداري رسمي',
    subtitle: 'وفق لائحة الجزاءات والمادة 35 من قانون العمل الكويتي رقم 6 لسنة 2010',
    badge: 'مساءلة قانونية',
    icon: '⚠️'
  },
  {
    id: 'non_renewal',
    category: 'ADMIN',
    title: 'إشعار عدم الرغبة في تجديد العقد',
    subtitle: 'إخطار رسمي للموظف قبل انتهاء مدة الإخطار المقررة قانوناً (Notice Period)',
    badge: 'إشعار تعاقدي',
    icon: '⏱️'
  },
  {
    id: 'eos_settlement',
    category: 'ADMIN',
    title: 'سند مخالصة نهائية وتصفية نهاية الخدمة',
    subtitle: 'حساب المستحقات وبدل الإجازات وإبراء الذمة الشامل طبقاً للمادتين 51 و 53',
    badge: 'إبراء ذمة',
    icon: '⚖️'
  },
  {
    id: 'experience_cert',
    category: 'ADMIN',
    title: 'شهادة خبرة وخدمة معتمدة',
    subtitle: 'وفق المادة 47 من قانون العمل الكويتي (تسلم للعامل عند انتهاء خدمته دون رسوم)',
    badge: 'شهادة خبرة',
    icon: '🎓'
  }
];

// Default HTML template bodies with smart placeholders embedded
const DEFAULT_TEMPLATE_BODIES: Record<TemplateId, string> = {
  salary_cert_ar: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    شهادة تفصيل راتب واستمرارية تحويل
  </h1>
</div>

<p><strong>السادة / إلى من يهمه الأمر المحترمين</strong></p>
<p>تحية طيبة وبعد ،،،</p>

<p>
  تشهد إدارة <strong>{اسم_الشركة}</strong> بأن {السيد_السيدة}/ <strong>{اسم_الموظف}</strong>، حامل البطاقة المدنية رقم (<strong>{الرقم_المدني}</strong>)، وجنسيته (<strong>{الجنسية}</strong>)، {يعمل_تعمل} لدينا بوظيفة (<strong>{المسمى_الوظيفي}</strong>) في قسم (<strong>{القسم}</strong>) وذلك اعتباراً من تاريخ <strong>{تاريخ_المباشرة}</strong> ولا يزال على رأس عمله حتى تاريخه.
</p>

<p>ويتقاضى المذكور راتباً شهرياً شاملاً ومفصلاً على النحو الآتي:</p>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #cbd5e1;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">الراتب الأساسي</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">بدل السكن</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">بدل الانتقال</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; color: #714B67;">إجمالي الراتب الشهري</th>
    </tr>
  </thead>
  <tbody>
    <tr style="font-weight: bold;">
      <td style="border: 1px solid #cbd5e1; padding: 8px;">{الراتب_الأساسي}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">{بدل_السكن}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px;">{بدل_الانتقال}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; background-color: #faf5ff; color: #714B67; font-size: 15px;">
        {الراتب_الشامل}
      </td>
    </tr>
  </tbody>
</table>

<p><strong>فقط وقدره:</strong> ({تفقيت_الراتب}).</p>

<p>
  ويتم تحويل مستحقاته الشهرية بانتظام عبر نظام حماية الأجور (WPS) لحسابه البنكي طرف <strong>{اسم_البنك}</strong>، رقم الآيبان (IBAN): <strong>{الآيبان}</strong>.
</p>

<p>
  وقد أُعطيت {له_لها} هذه الشهادة بناءً على طلبه دون أدنى مسؤولية مالية أو قانونية على المنشأة تجاه حقوق الغير.
</p>

<p style="text-align: center; font-weight: bold; margin-top: 25px;">وتفضلوا بقبول فائق التقدير والاحترام ،،،</p>
`,

  salary_cert_en: `
<div style="text-align: center; margin: 15px 0;" dir="ltr">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    SALARY CERTIFICATE & PROOF OF EMPLOYMENT
  </h1>
</div>

<div dir="ltr">
  <p><strong>To Whom It May Concern</strong></p>
  <p>Dear Sir / Madam,</p>

  <p>
    This is to certify that Mr./Ms. <strong>{اسم_الموظف}</strong>, holding Civil ID No. (<strong>{الرقم_المدني}</strong>) and {الجنسية} nationality, is a full-time employee with <strong>{اسم_الشركة}</strong>.
  </p>

  <p>
    The employee has been actively engaged as a <strong>{المسمى_الوظيفي}</strong> in the {القسم} department since <strong>{تاريخ_المباشرة}</strong>, and remains in good standing up to the present date.
  </p>

  <p>His/Her current gross monthly remuneration is structured as follows:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #cbd5e1;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Basic Salary</th>
        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Housing Allowance</th>
        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Transport</th>
        <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left; color: #714B67;">Total Gross Salary</th>
      </tr>
    </thead>
    <tbody>
      <tr style="font-weight: bold;">
        <td style="border: 1px solid #cbd5e1; padding: 8px;">{الراتب_الأساسي}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">{بدل_السكن}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px;">{بدل_الانتقال}</td>
        <td style="border: 1px solid #cbd5e1; padding: 8px; background-color: #faf5ff; color: #714B67; font-size: 15px;">
          {الراتب_الشامل}
        </td>
      </tr>
    </tbody>
  </table>

  <p>
    Remuneration is remitted monthly in compliance with the Kuwait Wages Protection System (WPS) to {اسم_البنك}, IBAN: <strong>{الآيبان}</strong>.
  </p>

  <p>
    This certificate is issued upon the employee's request without any financial liability or commitment on the company's part towards third parties.
  </p>

  <p style="margin-top: 25px;">Sincerely,</p>
</div>
`,

  contract_kuwait: `
<div style="text-align: center; margin: 10px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 4px;">
    عقد عمل في القطاع الأهلي
  </h1>
  <div style="font-size: 12px; color: #475569; font-weight: bold; margin-top: 4px;">
    (محرر وفقاً لأحكام قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010 والقرارات المنفذة له)
  </div>
</div>

<p>
  إنه في يوم <strong>{تاريخ_اليوم}</strong> بدولة الكويت، تم الاتفاق والتراضي بين كل من:
</p>

<div style="padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 10px 0;">
  <p style="margin: 4px 0;"><strong>الطرف الأول (صاحب العمل):</strong> {اسم_الشركة}، سجل تجاري: {السجل_التجاري}، الرقم الآلي: {الرقم_الآلي}.</p>
  <p style="margin: 4px 0;"><strong>الطرف الثاني (العامل):</strong> {السيد_السيدة}/ {اسم_الموظف}، الجنسية: {الجنسية}، البطاقة المدنية: ({الرقم_المدني}).</p>
</div>

<p>
  <strong>البند الأول (طبيعة العمل ومكانه):</strong> {يعمل_تعمل} {العامل_العاملة} لدى الطرف الأول بمهنة (<strong>{المسمى_الوظيفي}</strong>) في إدارة (<strong>{القسم}</strong>)، ويلتزم بأداء واجباته في مقرات المنشأة وفروعها بدولة الكويت.
</p>

<p>
  <strong>البند الثاني (مدة العقد والتجربة):</strong> يبدأ سريان هذا العقد من تاريخ <strong>{تاريخ_المباشرة}</strong> وحتى <strong>{نهاية_العقد}</strong>، ويخضع الطرف الثاني لفترة تجربة مدتها <strong>100 يوم عمل</strong> طبقاً للمادة (24) من قانون العمل.
</p>

<p>
  <strong>البند الثالث (الأجر والبدلات):</strong> يتقاضى الطرف الثاني أجراً شهرياً شاملاً قدره (<strong>{الراتب_الشامل}</strong>) فقط ({تفقيت_الراتب})، مفصلاً كالتالي: أساسي ({الراتب_الأساسي}) + بدل سكن ({بدل_السكن}) + بدل انتقال ({بدل_الانتقال})، ويحول عبر نظام حماية الأجور (WPS) لحسابه طرف {اسم_البنك}.
</p>

<p>
  <strong>البند الرابع (ساعات العمل والراحة):</strong> ساعات العمل <strong>48 ساعة أسبوعياً</strong>، مع منح العامل يوم راحة أسبوعية مدفوعة الأجر طبقاً للمادتين (64 و 67).
</p>

<p>
  <strong>البند الخامس (الإجازات السنوية ومكافأة نهاية الخدمة):</strong> يستحق العامل إجازة سنوية مدتها 30 يوماً مدفوعة الأجر، وتصرف مكافأة نهاية الخدمة طبقاً للمادة (51) من القانون رقم 6 لسنة 2010.
</p>

<p>
  <strong>البند السادس (المحاكم المختصة):</strong> تختص المحاكم العمالية بدولة الكويت بنظر أي نزاع قد ينشأ، وحُرر هذا العقد من نسختين بيد كل طرف نسخة للعمل بموجبها.
</p>
`,

  pam_contract: `<p>نموذج عقد القوى العاملة الموحد PAM 2</p>`,

  contract_part_time: `
<div style="text-align: center; margin: 10px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 4px;">
    عقد عمل جزئي وتقديم خدمات استشارية (Part-Time)
  </h1>
</div>

<p>
  تم الاتفاق بين <strong>{اسم_الشركة}</strong> (طرف أول) و{السيد_السيدة}/ <strong>{اسم_الموظف}</strong>، المدني: <strong>{الرقم_المدني}</strong> (طرف ثانٍ) {بصفته_بصفتها} مستشاراً وخبيراً في مجال (<strong>{المسمى_الوظيفي}</strong>).
</p>

<p>
  <strong>1. نطاق المهام:</strong> يقدم الطرف الثاني استشاراته التخصصية بما لا يقل عن <strong>20 ساعة شهرياً</strong> بمقر الشركة أو عن بُعد بحسب حاجة العمل.
</p>
<p>
  <strong>2. المقابل المالي:</strong> يتقاضى الطرف الثاني أتعاباً شهرية إجمالية قدرها (<strong>{الراتب_الشامل}</strong>) فقط ({تفقيت_الراتب}) تصرف في نهاية كل شهر ميلادي.
</p>
<p>
  <strong>3. السرية والملكية الفكرية:</strong> يتعهد الطرف الثاني بالمحافظة على سرية بيانات المنشأة ومشاريعها وعملائها تعهداً أبدياً لا يسقط بانتهاء العقد.
</p>
`,

  to_whom: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    شهادة لمن يهمه الأمر
  </h1>
</div>

<p><strong>السادة / الجهات الرسمية والمعنية المحترمين</strong></p>
<p>تحية طيبة وبعد ،،،</p>

<p>
  تفيد إدارة <strong>{اسم_الشركة}</strong> بأن {المذكور_المذكورة}/ <strong>{اسم_الموظف}</strong>، حامل البطاقة المدنية رقم (<strong>{الرقم_المدني}</strong>)، من الجنسية (<strong>{الجنسية}</strong>)، {يعمل_تعمل} لدينا بالمنشأة بمسمى (<strong>{المسمى_الوظيفي}</strong>) في قسم (<strong>{القسم}</strong>) وذلك اعتباراً من <strong>{تاريخ_المباشرة}</strong> وما زال على رأس عمله حتى تاريخ هذا الخطاب.
</p>

<p>
  وقد أعطيت {له_لها} هذه الشهادة بناءً على طلبه لتقديمها إلى من يهمه الأمر دون أي التزام مالي أو قانوني على الشركة تجاه الغير.
</p>

<p style="text-align: center; font-weight: bold; margin-top: 30px;">وتفضلوا بقبول فائق الاحترام والتقدير ،،،</p>
`,

  noc_letter: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    كتاب عدم ممانعة رسمي (No Objection Certificate)
  </h1>
</div>

<p><strong>السادة / الإدارة العامة للمرور - وزارة الداخلية المحترمين</strong></p>
<p>تحية طيبة وبعد ،،،</p>

<p>
  تفيد شركة <strong>{اسم_الشركة}</strong> بأنها لا تمانع من قيام {مكفولها_مكفولتها} {السيد_السيدة}/ <strong>{اسم_الموظف}</strong>، حامل البطاقة المدنية رقم (<strong>{الرقم_المدني}</strong>)، والذي {يعمل_تعمل} لدينا بمهنة (<strong>{المسمى_الوظيفي}</strong>) باستخراج رخصة سوق خاصة طبقاً للقوانين واللوائح المعمول بها بدولة الكويت.
</p>

<p>
  وهذا إقرار وتفويض منا بذلك دون أي مسؤولية مدنية أو جنائية على كاهل الشركة.
</p>

<p style="text-align: center; font-weight: bold; margin-top: 30px;">وتفضلوا بقبول فائق التقدير ،،،</p>
`,

  commencement: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    إشعار مباشرة عمل واستلام مهام وظيفية
  </h1>
</div>

<p>نحيطكم علماً بأن الموظف الموضحة بياناته أدناه قد باشر مهام عمله رسمياً بالمنشأة وفق الآتي:</p>

<div style="padding: 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin: 15px 0; font-size: 13px;">
  <p style="margin: 4px 0;">اسم الموظف: <strong>{اسم_الموظف}</strong></p>
  <p style="margin: 4px 0;">الرقم المدني: <strong>{الرقم_المدني}</strong> | الجنسية: <strong>{الجنسية}</strong></p>
  <p style="margin: 4px 0;">المسمى التعاقدي: <strong>{المسمى_الوظيفي}</strong> | القسم: <strong>{القسم}</strong></p>
  <p style="margin: 4px 0;">تاريخ المباشرة الفعلية: <strong>{تاريخ_المباشرة}</strong> (الساعة 08:00 صباحاً عبر البصمة)</p>
</div>

<p>
  بناءً عليه، يرجى من إدارة الموارد البشرية والمالية إدراج الموظف ضمن كشوفات الرواتب وحسابات الدوام والبصمة والعهد من تاريخ مباشرته الموضح أعلاه.
</p>
`,

  return_from_leave: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    إشعار عودة واستئناف العمل بعد إجازة دورية
  </h1>
</div>

<p>
  أقر أنا {السيد_السيدة}/ <strong>{اسم_الموظف}</strong>، المدني: (<strong>{الرقم_المدني}</strong>)، بأنني قد استأنفت مهام عملي رسمياً في <strong>{اسم_الشركة}</strong> بمسمى (<strong>{المسمى_الوظيفي}</strong>) اعتباراً من تاريخ اليوم <strong>{تاريخ_اليوم}</strong> بعد انتهاء إجازتي الدورية المعتمدة.
</p>

<div style="padding: 10px; background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; margin: 15px 0;">
  <p style="margin: 2px 0;">المسمى الوظيفي: <strong>{المسمى_الوظيفي}</strong> | الإدارة: <strong>{القسم}</strong></p>
  <p style="margin: 2px 0; color: #047857; font-weight: bold;">حالة العودة: في الموعد المحدد دون تأخير</p>
</div>

<p>ويرجى اعتماد استئناف دوامي وإخطار قسم الأجور لتحديث سجلات الإجازات والرصيد المتبقي.</p>
`,

  warning: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; color: #991b1b; border-bottom: 2px solid #991b1b; display: inline-block; padding-bottom: 6px;">
    كتاب إنذار إداري ولفت نظر رسمي
  </h1>
</div>

<div style="padding: 10px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 10px 0;">
  <strong>إلى {السيد_السيدة}/</strong> {اسم_الموظف} | <strong>المسمى:</strong> {المسمى_الوظيفي} | <strong>المدني:</strong> {الرقم_المدني}
</div>

<p>توجه إليكم إدارة الموارد البشرية في <strong>{اسم_الشركة}</strong> هذا الإنذار الإداري نظراً للآتي:</p>

<div style="padding: 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: bold; margin: 12px 0;">
  تكرار التأخر عن مواعيد العمل الرسمية دون إذن مسبق وعدم الالتزام بجدول البصمة المعتمد بالمنشأة.
</div>

<p>
  وحيث أن هذا التصرف يخالف لائحة تنظيم العمل والجزاءات وأحكام قانون العمل الكويتي رقم 6 لسنة 2010 (المادة 35)، فإننا نوجه إليكم هذا الإنذار الرسمي مع مطالبتكم بالتلافي التام والالتزام بأنظمة العمل، تجنباً لتطبيق العقوبات القانونية الأشد.
</p>
`,

  non_renewal: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    إشعار رسمي بعدم الرغبة في تجديد عقد العمل
  </h1>
</div>

<p><strong>إلى {السيد_السيدة}/</strong> {اسم_الموظف} | <strong>الرقم المدني:</strong> {الرقم_المدني}</p>
<p>تحية طيبة وبعد ،،،</p>

<p>
  نود إحاطتكم علماً بأن إدارة <strong>{اسم_الشركة}</strong> لا ترغب في تجديد عقد العمل المبرم معكم والمقرر انتهاؤه بتاريخ <strong>{نهاية_العقد}</strong>.
</p>

<p>
  ويعتبر هذا الخطاب إخطاراً رسمياً مسبقاً قبل الميعاد القانوني المحدد في العقد وقانون العمل، ويرجى منكم التكرم بمراجعة إدارة الموارد البشرية لاستكمال إجراءات تسليم العهد وإجراء المخالصة النهائية واستلام مستحقاتكم القانونية كاملة.
</p>
`,

  eos_settlement: `
<div style="text-align: center; margin: 10px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 4px;">
    سند مخالصة نهائية وبراءة ذمة شاملة
  </h1>
  <div style="font-size: 11px; color: #475569; font-weight: bold; margin-top: 2px;">
    (وفقاً لأحكام المواد 51 و 53 و 70 من قانون العمل الكويتي رقم 6 لسنة 2010)
  </div>
</div>

<div style="padding: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; margin: 8px 0;">
  <strong>اسم العامل:</strong> {اسم_الموظف} | <strong>المدني:</strong> {الرقم_المدني} | <strong>الجنسية:</strong> {الجنسية} | <strong>الراتب:</strong> {الراتب_الشامل}
</div>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1; font-size: 12px;">
  <thead>
    <tr style="background-color: #f1f5f9;">
      <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">بيان البند المستحق</th>
      <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">المدة / التفصيل</th>
      <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right;">المبلغ المستحق</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px;">مكافأة نهاية الخدمة (مادة 51)</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px;">{سنوات_الخدمة}</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">{مكافأة_نهاية_الخدمة}</td>
    </tr>
    <tr style="background-color: #faf5ff; font-weight: bold;">
      <td style="border: 1px solid #cbd5e1; padding: 6px; color: #714B67;" colspan="2">صافي المبلغ المصروف للموظف</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; color: #714B67; font-size: 14px;">{مكافأة_نهاية_الخدمة}</td>
    </tr>
  </tbody>
</table>

<p><strong>فقط وقدره:</strong> ({تفقيت_نهاية_الخدمة}).</p>

<p style="font-size: 12px;">
  <strong>إقرار وبراءة ذمة:</strong> أقر أنا الموقع أدناه بأنني قد استلمت كافة مستحقاتي العمالية والمالية ونهاية الخدمة المبينة أعلاه، وسلّمت كافة ما بعهدتي، وأبرئ ذمة <strong>{اسم_الشركة}</strong> براءة تامة وشاملة ونهائية لا رجعة فيها.
</p>
`,

  experience_cert: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    شهادة خدمة وخبرة مهنية
  </h1>
  <div style="font-size: 12px; color: #475569; font-weight: bold; margin-top: 4px;">
    (صادرة طبقاً للمادة 47 من قانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010)
  </div>
</div>

<p>
  تشهد إدارة <strong>{اسم_الشركة}</strong> بأن {السيد_السيدة}/ <strong>{اسم_الموظف}</strong>، حامل البطاقة المدنية رقم (<strong>{الرقم_المدني}</strong>)، وجنسيته (<strong>{الجنسية}</strong>)، قد عمل لدينا بالمنشأة خلال الفترة من <strong>{تاريخ_المباشرة}</strong> وحتى <strong>{نهاية_العقد}</strong> بوظيفة (<strong>{المسمى_الوظيفي}</strong>) في إدارة ({القسم}).
</p>

<p>
  وطوال فترة عمله، كان مثالاً للموظف الملتزم والمثابر، وتميز بحسن السيرة والسلوك والحرص على أداء واجباته المهنية بأعلى درجات الكفاءة والإخلاص.
</p>

<p>
  وقد أعطيت {له_لها} هذه الشهادة بناءً على طلبه عند انتهاء خدمته دون أي رسوم، مع خالص تمنياتنا له بدوام التوفيق والنجاح.
</p>
`
};

export const OdooTemplatesApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();

  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('salary_cert_ar');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [showPamModal, setShowPamModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [useLetterhead, setUseLetterhead] = useState<boolean>(true); // true = print company header, false = for pre-printed letterhead
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('split');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Editable Form & Context State
  const [empName, setEmpName] = useState('');
  const [civilId, setCivilId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('الإدارة العامة');
  const [nationality, setNationality] = useState('كويتي');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bankName, setBankName] = useState('بيت التمويل الكويتي (KFH)');
  const [iban, setIban] = useState('');
  const [basicSalary, setBasicSalary] = useState('0.000');
  const [housingAllowance, setHousingAllowance] = useState('0.000');
  const [transportAllowance, setTransportAllowance] = useState('0.000');
  const [totalSalary, setTotalSalary] = useState('0.000');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
  );
  const [serviceYears, setServiceYears] = useState('3');
  const [eosAmount, setEosAmount] = useState('0.000');

  // Active Template HTML Content (loaded in the rich editor)
  const [editorContent, setEditorContent] = useState<string>(DEFAULT_TEMPLATE_BODIES.salary_cert_ar);

  const previewSheetRef = useRef<HTMLDivElement>(null);

  // Dynamic Reference & Dates
  const todayFormattedAr = new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
  const referenceNumber = `HR-DOC-${new Date().getFullYear()}-${civilId ? civilId.slice(-6) : '001234'}`;

  const companyDisplayName = activeCompany?.nameAr || activeCompany?.name || 'مجموعة المنارة للخدمات المتكاملة ذ.م.م';
  const companyCommercialReg = activeCompany?.commercialRegNo || (activeCompany as any)?.commercialRegister || '148291';
  const companyPaci = (activeCompany as any)?.paciNumber || '20491823';

  // Load template body when template changes
  useEffect(() => {
    if (DEFAULT_TEMPLATE_BODIES[selectedTemplate]) {
      setEditorContent(DEFAULT_TEMPLATE_BODIES[selectedTemplate]);
    }
  }, [selectedTemplate]);

  // Auto-fill when employee is selected
  useEffect(() => {
    if (selectedEmpId) {
      const emp = employees.find(e => e.id === selectedEmpId);
      if (emp) {
        setEmpName(emp.name || '');
        setCivilId(emp.civilId || '');
        setJobTitle(emp.jobTitle || 'موظف');
        setDepartment(emp.department || 'الإدارة العامة');
        
        const anyEmp = emp as any;
        setNationality(anyEmp.nationality || (emp.isKuwaiti ? 'كويتي' : 'غير كويتي'));
        setBankName(emp.bankName || 'بيت التمويل الكويتي (KFH)');
        setIban(emp.iban || 'KW82CBKU0000000000001234567890');

        // Detect or set gender
        if (anyEmp.gender) {
          setGender(anyEmp.gender === 'female' ? 'female' : 'male');
        } else {
          // Heuristic for female Arabic names
          const n = emp.name || '';
          const isLikelyFemale = n.includes('فاطمة') || n.includes('مريم') || n.includes('نورة') || n.includes('سارة') || n.includes('دلال') || n.includes('شيخة') || n.includes('هدى') || n.includes('منى') || n.includes('أمل') || n.includes('ريم');
          setGender(isLikelyFemale ? 'female' : 'male');
        }

        const bSal = Number(emp.basicSalary) || 0;
        const hAll = Number(emp.housingAllowance) || 0;
        const tAll = Number(emp.transportAllowance) || 0;
        const tot = bSal + hAll + tAll;

        setBasicSalary(bSal.toFixed(3));
        setHousingAllowance(hAll.toFixed(3));
        setTransportAllowance(tAll.toFixed(3));
        setTotalSalary(tot.toFixed(3));

        if (anyEmp.hireDate || anyEmp.joinDate) {
          setJoinDate(anyEmp.hireDate || anyEmp.joinDate);
        }

        // Calculate approximate service years
        const jDate = new Date(anyEmp.hireDate || anyEmp.joinDate || '2023-01-01');
        const diffYears = Math.max(0.5, parseFloat(((Date.now() - jDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)));
        setServiceYears(diffYears.toString());

        const eosCalc = (tot * (diffYears <= 5 ? diffYears * 0.5 : (2.5 + (diffYears - 5) * 1))).toFixed(3);
        setEosAmount(eosCalc);
      }
    } else if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [selectedEmpId, employees]);

  // Generate QR Code dynamically for the document
  useEffect(() => {
    async function makeQr() {
      const qrPayload = JSON.stringify({
        docRef: referenceNumber,
        company: companyDisplayName,
        employee: empName,
        civilId: civilId,
        date: new Date().toISOString().slice(0, 10),
        status: 'VERIFIED_OFFICIAL'
      });
      try {
        const url = await QRCode.toDataURL(qrPayload, {
          width: 130,
          margin: 1,
          color: {
            dark: '#1e293b',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(url);
      } catch (err) {
        console.error('QR code generation failed', err);
      }
    }
    makeQr();
  }, [referenceNumber, companyDisplayName, empName, civilId]);

  // Compile editor HTML content by replacing all {placeholders} with live context
  const compiledHtml = useMemo(() => {
    let output = editorContent || '';
    const isFemale = gender === 'female';

    const salaryNumber = parseFloat(totalSalary) || 0;
    const salaryTafqeetAr = tafqeet(salaryNumber);
    const eosNumber = parseFloat(eosAmount) || 0;
    const eosTafqeetAr = tafqeet(eosNumber);

    const replacements: Record<string, string> = {
      '{اسم_الموظف}': empName || '—',
      '{الرقم_المدني}': civilId || '—',
      '{المسمى_الوظيفي}': jobTitle || '—',
      '{القسم}': department || '—',
      '{الجنسية}': nationality || '—',
      '{تاريخ_المباشرة}': joinDate || '—',
      '{نهاية_العقد}': endDate || '—',

      // Gender Sensitive logic
      '{السيد_السيدة}': isFemale ? 'السيدة' : 'السيد',
      '{المذكور_المذكورة}': isFemale ? 'المذكورة' : 'المذكور',
      '{يعمل_تعمل}': isFemale ? 'تعمل' : 'يعمل',
      '{بصفته_بصفتها}': isFemale ? 'بصفتها' : 'بصفته',
      '{مكفولها_مكفولتها}': isFemale ? 'مكفولتها وموظفتها' : 'مكفولها وموظفها',
      '{العامل_العاملة}': isFemale ? 'الطرف الثاني (العاملة)' : 'الطرف الثاني (العامل)',
      '{له_لها}': isFemale ? 'لها' : 'له',

      // Financials
      '{الراتب_الأساسي}': `${basicSalary} د.ك`,
      '{بدل_السكن}': `${housingAllowance} د.ك`,
      '{بدل_الانتقال}': `${transportAllowance} د.ك`,
      '{الراتب_الشامل}': `${totalSalary} د.ك`,
      '{تفقيت_الراتب}': `${salaryTafqeetAr} لا غير`,
      '{اسم_البنك}': bankName || 'البنك المعتمد',
      '{الآيبان}': iban || '—',
      '{سنوات_الخدمة}': `${serviceYears} سنوات`,
      '{مكافأة_نهاية_الخدمة}': `${eosAmount} د.ك`,
      '{تفقيت_نهاية_الخدمة}': `${eosTafqeetAr} لا غير`,

      // Company
      '{اسم_الشركة}': companyDisplayName || '—',
      '{السجل_التجاري}': companyCommercialReg || '—',
      '{الرقم_الآلي}': companyPaci || '—',
      '{تاريخ_اليوم}': todayFormattedAr || '—',
      '{الرقم_المرجعي}': referenceNumber || '—'
    };

    for (const [tag, val] of Object.entries(replacements)) {
      output = output.split(tag).join(val);
    }

    // Strip smart-tag wrappers if any
    output = output.replace(/<span class="smart-tag[^>]*>(.*?)<\/span>/g, '$1');

    return output;
  }, [
    editorContent, 
    gender, 
    empName, 
    civilId, 
    jobTitle, 
    department, 
    nationality, 
    joinDate, 
    endDate, 
    basicSalary, 
    housingAllowance, 
    transportAllowance, 
    totalSalary, 
    bankName, 
    iban, 
    serviceYears, 
    eosAmount, 
    companyDisplayName, 
    companyCommercialReg, 
    companyPaci, 
    todayFormattedAr, 
    referenceNumber
  ]);

  const activeTemplateDef = TEMPLATES_LIST.find(t => t.id === selectedTemplate) || TEMPLATES_LIST[0];

  // Actions
  const handlePrint = () => {
    safePrintAction(`${activeTemplateDef.title} - ${empName}`);
  };

  const handleExportPdf = async () => {
    if (!previewSheetRef.current) return;
    setIsExportingPdf(true);
    try {
      const fileName = `${activeTemplateDef.title}_${empName}_${civilId}`;
      const success = await exportElementToPdf(previewSheetRef.current, fileName);
      if (success) {
        toast.success('تم تصدير ملف PDF بنجاح فائق الدقة!');
      } else {
        toast.error('حدث خطأ أثناء تصدير PDF، يرجى المحاولة عبر زر الطباعة.');
      }
    } catch (e) {
      console.error(e);
      toast.error('فشل تصدير PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    if (!previewSheetRef.current) return;
    const content = previewSheetRef.current.innerHTML;
    const docTitle = `${activeTemplateDef.title}_${empName}`;
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${docTitle}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 11pt; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل المستند بصيغة Word (.doc) بنجاح');
  };

  const handleArchiveDocument = () => {
    if (!selectedEmpId) {
      toast.error('يرجى تحديد الموظف أولاً لأرشفة المستند في ملفه.');
      return;
    }

    const currentDocs = getPersistentData<DocumentItem[]>(MANARA_STORAGE_KEYS.DOCUMENTS, []);
    
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      companyId: activeCompany?.id || 'comp-super-admin',
      employeeId: selectedEmpId,
      title: `${activeTemplateDef.title} - ${empName}`,
      category: activeTemplateDef.category === 'CONTRACTS' ? 'WORK_CONTRACT' : 'OTHER',
      documentType: activeTemplateDef.category === 'CONTRACTS' ? 'CONTRACT' : 'OTHER',
      documentNumber: referenceNumber,
      fileUrl: '',
      fileName: `${activeTemplateDef.title}_${empName}.pdf`,
      fileSize: '195 KB',
      uploadDate: new Date().toISOString().slice(0, 10),
      issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
      status: 'active',
      tags: ['صادر رسمي', activeTemplateDef.title, 'موارد بشرية', referenceNumber]
    };

    const updated = [newDoc, ...currentDocs];
    setPersistentData(MANARA_STORAGE_KEYS.DOCUMENTS, updated);
    toast.success(`تم حفظ وأرشفة المستند بنجاح في ملف الموظف (${empName}) برقم إشاري: ${referenceNumber}`);
  };

  const handleResetTemplate = () => {
    if (DEFAULT_TEMPLATE_BODIES[selectedTemplate]) {
      setEditorContent(DEFAULT_TEMPLATE_BODIES[selectedTemplate]);
      toast.success('تمت إعادة ضبط نص القالب إلى الصياغة القانونية الأصلية');
    }
  };

  const filteredTemplates = TEMPLATES_LIST.filter(t => {
    if (activeCategory === 'ALL') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. Header Toolbar (Odoo 18 Studio Suite) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 print:hidden">
        
        {/* Left: Branding & Meta */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#714B67]/10 text-[#714B67] rounded-2xl">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">استوديو النماذج والخطابات وعقود العمل الذكي</h1>
              <span className="bg-purple-100 text-[#714B67] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Odoo 18 Document Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              المنشأة: <strong className="text-[#714B67]">{companyDisplayName}</strong> | تحرير وتفقيت وضبط لغوي وأرشفة فورية
            </p>
          </div>
        </div>

        {/* Right: Workspace & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Workspace Views Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setWorkspaceView('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                workspaceView === 'split' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="تقسيم الشاشة: تحرير على اليمين ومعاينة حية على اليسار"
            >
              <Columns2 size={13} />
              <span>تقسيم الشاشة</span>
            </button>
            <button
              onClick={() => setWorkspaceView('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                workspaceView === 'editor' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="محرر الورقة الكامل"
            >
              <Edit3 size={13} />
              <span>المحرر فقط</span>
            </button>
            <button
              onClick={() => setWorkspaceView('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                workspaceView === 'preview' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="معاينة الورقة النهائية والطباعة"
            >
              <Eye size={13} />
              <span>المعاينة فقط</span>
            </button>
          </div>

          {/* Letterhead toggle */}
          <button
            onClick={() => setUseLetterhead(!useLetterhead)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
              useLetterhead 
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                : 'bg-amber-50 border-amber-300 text-amber-900 font-black'
            }`}
            title="تبديل بين طباعة ترويسة المنشأة الرقمية أو استخدام ورق الشركة المطبوع مسبقاً"
          >
            <span>{useLetterhead ? '📄 ورق أبيض (مع الترويسة)' : '🖨️ ورق مسبق (هامش 48mm)'}</span>
          </button>

          {/* Reset Template */}
          <button
            onClick={handleResetTemplate}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="إعادة ضبط نص القالب للأصل"
          >
            <RotateCcw size={15} />
          </button>

          {activeTemplateDef.isPamModal ? (
            <button
              onClick={() => setShowPamModal(true)}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <span>🏛️</span> فتح مولد عقد PAM 2
            </button>
          ) : (
            <>
              {/* Word (.doc) */}
              <button
                onClick={handleExportWord}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="تنزيل كملف Word"
              >
                <Download size={13} /> Word
              </button>

              {/* PDF */}
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="تصدير ملف PDF مباشر عالي الدقة"
              >
                {isExportingPdf ? <RefreshCw size={13} className="animate-spin" /> : <FileCheck2 size={13} />}
                <span>{isExportingPdf ? 'جاري التصدير...' : 'PDF'}</span>
              </button>

              {/* Archive */}
              <button
                onClick={handleArchiveDocument}
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="حفظ وأرشفة الوثيقة في أرشيف مستندات الموظف"
              >
                <FolderArchive size={13} /> أرشفة
              </button>

              {/* Print A4 */}
              <button
                onClick={handlePrint}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Printer size={14} /> طباعة A4
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Employee Quick Auto-Fill & Gender Adjustment Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        
        {/* Employee Selector */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="font-bold text-slate-700 flex items-center gap-1 whitespace-nowrap">
            <Users size={14} className="text-[#714B67]" /> الموظف المستهدف:
          </span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-[#714B67] transition cursor-pointer"
          >
            <option value="">-- اختر الموظف لملء البيانات تلقائياً --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.civilId || emp.id}) - {emp.jobTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Auto-Tuning Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <span className="text-[11px] font-bold text-slate-600 px-1">الضبط اللغوي:</span>
          <button
            onClick={() => setGender('male')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              gender === 'male' ? 'bg-[#714B67] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            ذكر (تذكير)
          </button>
          <button
            onClick={() => setGender('female')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              gender === 'female' ? 'bg-[#714B67] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            أنثى (تأنيث)
          </button>
        </div>

        {/* Meta badge */}
        <div className="font-mono text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          المرجع: <strong className="text-slate-800">{referenceNumber}</strong>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Templates Navigation (3 Cols on Desktop, hidden in full preview) */}
        <div className={`lg:col-span-3 space-y-4 print:hidden ${workspaceView === 'preview' ? 'hidden' : ''}`}>
          
          {/* Category Navigation Pills */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-2">
              {[
                { id: 'ALL', label: 'الكل (13)' },
                { id: 'CONTRACTS', label: 'عقود العمل' },
                { id: 'BANKING', label: 'الشهادات' },
                { id: 'ADMIN', label: 'إداري' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as TemplateCategory)}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-white text-[#714B67] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template List Cards */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredTemplates.map(t => {
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-right p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? 'bg-[#714B67]/10 border-[#714B67] shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg mt-0.5">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-[#714B67]' : 'text-slate-800'}`}>
                          {t.title}
                        </span>
                        {isSelected && <CheckCircle2 size={13} className="text-[#714B67] shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {t.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Context Summary Box */}
          <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200 text-xs space-y-1.5">
            <div className="font-bold text-[#714B67] flex items-center gap-1">
              <Sparkles size={13} /> ملخص المتغيرات الحية:
            </div>
            <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
              <div>الموظف: <strong>{empName || '—'}</strong></div>
              <div>المدني: <strong className="font-mono">{civilId || '—'}</strong></div>
              <div>الراتب الشامل: <strong className="font-mono text-[#714B67]">{totalSalary} د.ك</strong></div>
              <div>الصياغة اللغوية: <strong>{gender === 'female' ? 'مؤنث (السيدة/تعمل)' : 'مذكر (السيد/يعمل)'}</strong></div>
            </div>
          </div>
        </div>

        {/* Center / Right: Interactive Split-Screen or Full View (9 or 12 Cols) */}
        <div className={workspaceView === 'preview' ? 'lg:col-span-12' : 'lg:col-span-9'}>
          
          <div className={`grid gap-6 ${workspaceView === 'split' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* 1. Rich Document Editor (Visible in 'split' or 'editor' mode) */}
            {(workspaceView === 'split' || workspaceView === 'editor') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Edit3 size={14} className="text-[#714B67]" /> محرر صياغة الوثيقة التفاعلي (Rich WYSIWYG):
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    عدل النص أو أدرج الحقول الذكية بنقرة واحدة
                  </span>
                </div>

                <OdooRichDocumentEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  employeeGender={gender}
                  useLetterhead={useLetterhead}
                  minHeight={workspaceView === 'split' ? '650px' : '750px'}
                />
              </div>
            )}

            {/* 2. Live A4 Printable Preview Sheet (Visible in 'split' or 'preview' mode) */}
            {(workspaceView === 'split' || workspaceView === 'preview') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-700" /> المعاينة الحية المباشرة لورقة A4 (Live Preview):
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    مخرجات الطباعة الحقيقية
                  </span>
                </div>

                {/* Printable Canvas Wrapper */}
                <div className="bg-slate-200/70 p-4 sm:p-6 rounded-2xl border border-slate-300 flex justify-center overflow-x-auto print:p-0 print:bg-white print:border-none">
                  <div
                    ref={previewSheetRef}
                    id="live-printable-a4"
                    className="bg-white text-slate-900 shadow-xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-8 md:p-12 relative flex flex-col justify-between"
                    style={{
                      fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
                      lineHeight: 1.85,
                      paddingTop: useLetterhead ? '40px' : '48mm'
                    }}
                  >

                    {/* Official Company Header (Rendered only if useLetterhead is true) */}
                    {useLetterhead ? (
                      <div className="border-b-2 border-[#714B67] pb-5 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 bg-slate-50 border-2 border-[#714B67] rounded-2xl flex items-center justify-center font-black text-[#714B67] text-2xl shadow-2xs">
                              {companyDisplayName.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-xl font-black text-[#714B67] leading-tight">
                                {companyDisplayName}
                              </h2>
                              <p className="text-[11px] font-bold text-slate-500 font-mono mt-0.5">
                                دولة الكويت | سجل تجاري: {companyCommercialReg} | الرقم الآلي: {companyPaci}
                              </p>
                            </div>
                          </div>

                          <div className="text-left font-mono text-[11px] text-slate-600 space-y-1">
                            <div><strong className="text-slate-800">التاريخ:</strong> {todayFormattedAr}</div>
                            <div><strong className="text-slate-800">الرقم المرجعي:</strong> {referenceNumber}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center font-mono text-[10px] text-slate-300 pb-4 border-b border-dashed border-slate-200 mb-6 print:hidden">
                        --- منطقة الترويسة المسبقة للورق الرسمي (Pre-printed Letterhead 48mm) ---
                      </div>
                    )}

                    {/* Live Compiled Document Body */}
                    <div 
                      className="flex-1 text-sm md:text-[14px] leading-relaxed text-slate-900"
                      dangerouslySetInnerHTML={{ __html: compiledHtml }}
                    />

                    {/* Signatures & Official Stamp & QR Footer */}
                    <div className="border-t-2 border-slate-200 pt-6 mt-8 space-y-4">
                      <div className="grid grid-cols-3 items-end text-xs md:text-sm">
                        
                        {/* Authorized Signatory */}
                        <div className="text-right space-y-1">
                          <div className="font-black text-slate-800">المفوض بالتوقيع:</div>
                          <div className="text-slate-500 text-xs font-semibold">إدارة الموارد البشرية والشؤون القانونية</div>
                          <div className="pt-8 font-bold text-slate-400">التوقيع: ............................</div>
                        </div>

                        {/* Stamp */}
                        <div className="text-center flex flex-col items-center justify-center">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#714B67]/40 flex flex-col items-center justify-center p-2 text-center text-[10px] text-[#714B67] font-bold rotate-[-6deg]">
                            <span>ختم المنشأة الرسمي</span>
                            <span className="text-[8px] font-mono mt-0.5">{companyCommercialReg}</span>
                          </div>
                        </div>

                        {/* Second Party Signature or QR Code */}
                        <div className="text-left flex flex-col items-end space-y-1">
                          {selectedTemplate.startsWith('contract') || selectedTemplate === 'eos_settlement' ? (
                            <div className="text-right w-full space-y-1">
                              <div className="font-black text-slate-800">
                                {gender === 'female' ? 'توقيع الطرف الثاني (العاملة):' : 'توقيع الطرف الثاني (العامل):'}
                              </div>
                              <div className="text-slate-500 text-xs font-semibold">{empName}</div>
                              <div className="pt-8 font-bold text-slate-400">التوقيع: ............................</div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              {qrCodeDataUrl ? (
                                <img 
                                  src={qrCodeDataUrl} 
                                  alt="رمز التحقق الرقمي" 
                                  className="w-20 h-20 border border-slate-200 rounded-lg p-0.5 bg-white"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200" />
                              )}
                              <span className="text-[9px] font-mono text-slate-400 mt-1">التحقق الرقمي المعتمد</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Bottom Line */}
                      <div className="text-center font-mono text-[10px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span>{companyDisplayName} - دولة الكويت</span>
                        <span>الرقم المرجعي: {referenceNumber}</span>
                        <span>وثيقة رسمية صادرة ومؤرشفة إلكترونياً</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* PAM Modal Integration */}
      {showPamModal && (
        <OdooPamContractModal
          isOpen={showPamModal}
          onClose={() => setShowPamModal(false)}
          employee={employees.find(e => e.id === selectedEmpId) || { name: empName, civilId, jobTitle }}
          company={activeCompany}
        />
      )}

    </div>
  );
};

export default OdooTemplatesApp;
