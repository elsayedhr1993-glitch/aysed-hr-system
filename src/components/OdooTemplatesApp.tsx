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
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useCompanyForPrint } from '../hooks/useCompanyForPrint';
import { employerLicenseTokenForTemplates } from '../utils/mohMedicalFacility';
import { OfficialA4CompanyLetterhead } from './print/OfficialA4CompanyLetterhead';
import { useOdooHierarchy, EmployeeContract } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { OdooPdf } from '../services/odooPdfService';
import { tafqeet } from '../utils/tafqeet';
import { TenantDatabaseService } from '../services/tenantDataService';
import { DocumentItem } from '../types';
import { toast } from 'react-hot-toast';
import OdooPamContractModal from './OdooPamContractModal';
import OdooRichDocumentEditor, { SMART_PLACEHOLDERS } from './OdooRichDocumentEditor';

export type TemplateCategory = 'ALL' | 'CONTRACTS' | 'BANKING' | 'ADMIN';
export type WorkspaceView = 'split' | 'editor' | 'preview';

export type TemplateId = 
  | 'pam_contract' 
  | 'leave_request_form'
  | 'custody_handover'
  | 'custody_clearance'
  | 'commencement'
  | 'return_from_leave'
  | 'warning' 
  | 'non_renewal'
  | 'termination_notice'
  | 'probation_notice'
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
  {
    id: 'pam_contract',
    category: 'CONTRACTS',
    title: 'عقد عمل — نموذج (2) الهيئة العامة للقوى العاملة',
    subtitle: 'النموذج الرسمي المعتمد (PdfProxy) — تعبئة تلقائية فوق pam_contract_form_2.pdf',
    badge: 'PAM نموذج 2',
    icon: '🏛️',
    isPamModal: true
  },

  // الإجراءات الإدارية والقانونية
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
    id: 'leave_request_form',
    category: 'ADMIN',
    title: 'نموذج طلب إجازة واعتماد رسمي',
    subtitle: 'طلب إجازة متكامل يتضمن بيانات الموظف والفترة والتوقيعات والاعتماد الإداري',
    badge: 'إجازات',
    icon: '📝'
  },
  {
    id: 'custody_handover',
    category: 'ADMIN',
    title: 'نموذج استلام عهدة',
    subtitle: 'توثيق استلام العهد والأصول وتسليم المسؤولية على الموظف المستلم',
    badge: 'عهد وأصول',
    icon: '📦'
  },
  {
    id: 'custody_clearance',
    category: 'ADMIN',
    title: 'نموذج إخلاء وتصفية عهدة',
    subtitle: 'إقرار تسليم كامل العهد وبراءة مسؤولية الإدارات المعنية قبل المخالصة',
    badge: 'إخلاء عهدة',
    icon: '✅'
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
    id: 'termination_notice',
    category: 'ADMIN',
    title: 'إخطار إنهاء خدمة',
    subtitle: 'إشعار رسمي بإنهاء الخدمة مع تحديد آخر يوم عمل وأسباب الإنهاء النظامية',
    badge: 'إنهاء خدمة',
    icon: '🛑'
  },
  {
    id: 'probation_notice',
    category: 'ADMIN',
    title: 'إخطار عدم اجتياز فترة التجربة',
    subtitle: 'إخطار إداري بعدم اجتياز التجربة وفق فترة 100 يوم عمل المعمول بها',
    badge: 'فترة التجربة',
    icon: '📌'
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
const DEFAULT_TEMPLATE_BODIES: Partial<Record<TemplateId, string>> = {
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

  leave_request_form: `
<div style="text-align: center; margin: 10px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 4px;">
    نموذج طلب إجازة واعتماد رسمي
  </h1>
</div>

<p>أرجو الموافقة على منحي إجازة وفق البيانات التالية:</p>
<div style="padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 10px 0;">
  <p style="margin: 4px 0;"><strong>اسم الموظف:</strong> {اسم_الموظف}</p>
  <p style="margin: 4px 0;"><strong>الرقم المدني:</strong> {الرقم_المدني}</p>
  <p style="margin: 4px 0;"><strong>المسمى الوظيفي:</strong> {المسمى_الوظيفي}</p>
  <p style="margin: 4px 0;"><strong>القسم:</strong> {القسم}</p>
  <p style="margin: 4px 0;"><strong>نوع الإجازة:</strong> سنوية</p>
  <p style="margin: 4px 0;"><strong>تاريخ بدء الإجازة:</strong> __ / __ / ____</p>
  <p style="margin: 4px 0;"><strong>تاريخ العودة:</strong> __ / __ / ____</p>
</div>

<p><strong>توقيع الموظف:</strong> ____________________</p>
<p><strong>اعتماد المدير المباشر:</strong> ____________________</p>
<p><strong>اعتماد الموارد البشرية:</strong> ____________________</p>
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

  termination_notice: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; color: #991b1b; border-bottom: 2px solid #991b1b; display: inline-block; padding-bottom: 6px;">
    إخطار إنهاء خدمة
  </h1>
</div>

<p><strong>إلى {السيد_السيدة}/</strong> {اسم_الموظف} | <strong>الرقم المدني:</strong> {الرقم_المدني}</p>
<p>
  نفيدكم بصدور قرار إدارة <strong>{اسم_الشركة}</strong> بإنهاء خدماتكم اعتباراً من تاريخ <strong>{نهاية_العقد}</strong>،
  ويعتبر هذا الخطاب إشعاراً رسمياً لتحديد آخر يوم عمل واستكمال إجراءات التسليم والمخالصة وفق قانون العمل الكويتي.
</p>
<p><strong>آخر يوم عمل:</strong> {نهاية_العقد}</p>
<p><strong>سبب الإنهاء الإداري:</strong> مقتضيات تنظيم العمل.</p>
`,

  probation_notice: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    إخطار عدم اجتياز فترة التجربة
  </h1>
</div>

<p><strong>إلى {السيد_السيدة}/</strong> {اسم_الموظف}</p>
<p>
  بالإشارة إلى عقد العمل المبرم معكم، نفيدكم بعدم اجتياز فترة التجربة المنصوص عليها في العقد،
  وعليه ينتهي التعاقد اعتباراً من تاريخ <strong>{نهاية_العقد}</strong> مع استكمال كافة الإجراءات النظامية.
</p>
<p>
  يرجى مراجعة إدارة الموارد البشرية لتسليم ما بعهدتكم واستلام مستحقاتكم القانونية.
</p>
`,

  custody_handover: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    نموذج استلام عهدة
  </h1>
</div>

<p>أقر أنا {السيد_السيدة}/ <strong>{اسم_الموظف}</strong> (المدني: <strong>{الرقم_المدني}</strong>) باستلام العهد التالية:</p>
<div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 12px 0;">
  <p style="margin: 4px 0;">1) جهاز/أصل: ____________________</p>
  <p style="margin: 4px 0;">2) الرقم التسلسلي: ____________________</p>
  <p style="margin: 4px 0;">3) تاريخ الاستلام: {تاريخ_اليوم}</p>
  <p style="margin: 4px 0;">4) الحالة الفنية: سليمة</p>
</div>
<p><strong>توقيع المستلم:</strong> ____________________</p>
<p><strong>توقيع مسؤول العهد:</strong> ____________________</p>
`,

  custody_clearance: `
<div style="text-align: center; margin: 15px 0;">
  <h1 style="font-size: 20px; font-weight: 900; border-bottom: 2px solid #0f172a; display: inline-block; padding-bottom: 6px;">
    نموذج إخلاء وتصفية عهدة
  </h1>
</div>

<p>تفيد الإدارات المختصة بأن {السيد_السيدة}/ <strong>{اسم_الموظف}</strong> قد قام بتسليم كافة العهد المسجلة عليه، ولا يوجد عليه أي التزامات عهد قائمة حتى تاريخ <strong>{تاريخ_اليوم}</strong>.</p>

<table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #cbd5e1;">
  <tbody>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">إدارة تقنية المعلومات</td><td style="border: 1px solid #cbd5e1; padding: 8px;">تم الإخلاء</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">الإدارة المالية</td><td style="border: 1px solid #cbd5e1; padding: 8px;">تم الإخلاء</td></tr>
    <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">الموارد البشرية</td><td style="border: 1px solid #cbd5e1; padding: 8px;">تم الإخلاء</td></tr>
  </tbody>
</table>

<p><strong>توقيع الموظف:</strong> ____________________</p>
<p><strong>اعتماد الموارد البشرية:</strong> ____________________</p>
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
  const { company: companyForPrint, profile: printProfile } = useCompanyForPrint();
  const { employees } = useOdooHierarchy();

  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('pam_contract');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [showPamModal, setShowPamModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [useLetterhead, setUseLetterhead] = useState<boolean>(true); // true = print company header, false = for pre-printed letterhead
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('split');
  const [smartPanelOpen, setSmartPanelOpen] = useState(true);
  const [smartPanelTab, setSmartPanelTab] = useState<'context' | 'fields'>('context');
  const insertPlaceholderRef = useRef<((tag: string) => void) | null>(null);
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
  const [editorContent, setEditorContent] = useState<string>('');

  const previewSheetRef = useRef<HTMLDivElement>(null);

  // Dynamic Reference & Dates
  const todayFormattedAr = new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
  const referenceNumber = `HR-DOC-${new Date().getFullYear()}-${civilId ? civilId.slice(-6) : '001234'}`;

  const companyDisplayName = printProfile.displayNameAr;
  const companyCommercialReg = employerLicenseTokenForTemplates(printProfile, companyForPrint);
  const companyPaci = printProfile.paciNumber;
  const companyLogoUrl = printProfile.logoUrl;
  const companyAccountNumber = activeCompany?.accountNumber || '—';
  const companyWsiCode = activeCompany?.wsiCode || '—';

  // Load template body when template changes
  useEffect(() => {
    const defaultBody = DEFAULT_TEMPLATE_BODIES[selectedTemplate];
    setEditorContent(defaultBody || '');
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
      '{رقم_الحساب}': companyAccountNumber || '—',
      '{الآيبان}': iban || '—',
      '{رقم_الملف_العمالي}': companyWsiCode || '—',
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
    companyAccountNumber,
    companyWsiCode,
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
      const success = await OdooPdf.report.exportElement(previewSheetRef.current, fileName);
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

  const handleArchiveDocument = async () => {
    if (!selectedEmpId) {
      toast.error('يرجى تحديد الموظف أولاً لأرشفة المستند في ملفه.');
      return;
    }

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

    const saved = await TenantDatabaseService.saveDocument(newDoc, activeCompany?.id);
    if (saved) {
      toast.success(`تم حفظ وأرشفة المستند بنجاح في ملف الموظف (${empName}) برقم إشاري: ${referenceNumber}`);
    } else {
      toast.error('تعذر حفظ المستند في السحابة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleResetTemplate = () => {
    const defaultBody = DEFAULT_TEMPLATE_BODIES[selectedTemplate];
    if (defaultBody) {
      setEditorContent(defaultBody);
      toast.success('تمت إعادة ضبط نص القالب إلى الصياغة القانونية الأصلية');
    } else if (selectedTemplate === 'pam_contract') {
      setEditorContent('');
      toast.success('قالب PAM يعتمد على المولد المتخصص فقط وتم تنظيف النص الاحتياطي');
    }
  };

  const filteredTemplates = TEMPLATES_LIST.filter(t => {
    if (activeCategory === 'ALL') return true;
    return t.category === activeCategory;
  });

  const insertSmartField = (tag: string) => {
    insertPlaceholderRef.current?.(tag);
  };

  const showTemplatesCol = workspaceView !== 'preview';
  const showEditorCol = workspaceView === 'split' || workspaceView === 'editor';
  const showPreviewCol = workspaceView === 'split' || workspaceView === 'preview';

  return (
    <div
      className="flex flex-col font-sans text-slate-800 animate-fade-in print:block min-h-[calc(100vh-8rem)]"
      dir="rtl"
    >
      {/* Odoo-style control panel */}
      <header className="shrink-0 bg-white border border-slate-200 rounded-t-xl shadow-sm print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#714B67] text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-slate-900 truncate">
                استوديو النماذج والخطابات
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                {companyDisplayName}
                <span className="text-slate-300 mx-1">·</span>
                <span className="font-mono text-slate-600">{referenceNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              {(
                [
                  { id: 'split' as WorkspaceView, icon: Columns2, label: 'ثلاثي' },
                  { id: 'editor' as WorkspaceView, icon: Edit3, label: 'محرر' },
                  { id: 'preview' as WorkspaceView, icon: Eye, label: 'معاينة' },
                ] as const
              ).map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setWorkspaceView(v.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                    workspaceView === v.id ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <v.icon size={13} />
                  {v.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSmartPanelOpen(o => !o)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                smartPanelOpen
                  ? 'bg-[#714B67]/10 border-[#714B67]/30 text-[#714B67]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={13} />
              السياق والحقول
            </button>

            <button
              type="button"
              onClick={() => setUseLetterhead(!useLetterhead)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
              title="ترويسة رقمية أو ورق مسبق"
            >
              {useLetterhead ? 'ترويسة رقمية' : 'ورق مسبق 48mm'}
            </button>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
              title="إعادة القالب"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-slate-50/80">
          {activeTemplateDef.isPamModal ? (
            <button
              type="button"
              onClick={() => setShowPamModal(true)}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              فتح مولد عقد PAM (2)
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer size={13} /> طباعة A4
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? 'PDF…' : 'PDF'}
              </button>
              <button
                type="button"
                onClick={handleExportWord}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Word
              </button>
              <button
                type="button"
                onClick={handleArchiveDocument}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <FolderArchive size={13} className="inline ml-1" />
                أرشفة
              </button>
            </>
          )}
          <span className="text-[10px] text-slate-400 mr-auto hidden sm:inline">
            {activeTemplateDef.title}
          </span>
        </div>
      </header>

      {/* 3-pane studio: templates (right) · editor (center) · preview (left) — RTL order */}
      <div
        className="flex flex-1 min-h-[560px] border border-t-0 border-slate-200 rounded-b-xl overflow-hidden bg-slate-100 print:hidden"
      >
        {showTemplatesCol && (
          <aside className="w-[17rem] shrink-0 bg-white border-s border-slate-200 flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-black text-slate-700">
              مكتبة النماذج
            </div>
            <div className="p-2 border-b border-slate-100">
              <div className="flex gap-0.5 p-0.5 bg-slate-100 rounded-lg">
                {[
                  { id: 'ALL', label: `الكل (${TEMPLATES_LIST.length})` },
                  { id: 'CONTRACTS', label: 'عقود' },
                  { id: 'ADMIN', label: 'إداري' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as TemplateCategory)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                      activeCategory === cat.id ? 'bg-white text-[#714B67] shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
              {filteredTemplates.map(t => {
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-right p-2 rounded-lg border text-xs transition cursor-pointer flex gap-2 ${
                      isSelected
                        ? 'bg-[#714B67]/10 border-[#714B67]/40'
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-base leading-none">{t.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`font-bold block truncate ${isSelected ? 'text-[#714B67]' : 'text-slate-800'}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-2">{t.subtitle}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {showEditorCol && (
          <section className="flex-1 min-w-0 flex flex-col bg-white border-s border-slate-200 min-h-0">
            <div className="shrink-0 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                <Edit3 size={13} className="text-[#714B67]" />
                محرر النص
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <OdooRichDocumentEditor
                value={editorContent}
                onChange={setEditorContent}
                employeeGender={gender}
                useLetterhead={useLetterhead}
                minHeight="100%"
                hideSmartPlaceholders
                insertPlaceholderRef={insertPlaceholderRef}
                className="h-full border-0 shadow-none rounded-none"
              />
            </div>
          </section>
        )}

        {smartPanelOpen && showEditorCol && (
          <aside className="w-[15.5rem] shrink-0 bg-white border-s border-slate-200 flex flex-col min-h-0 z-10 shadow-[inset_4px_0_12px_-8px_rgba(0,0,0,0.08)]">
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSmartPanelTab('context')}
                className={`flex-1 py-2 text-[10px] font-bold cursor-pointer ${
                  smartPanelTab === 'context' ? 'text-[#714B67] border-b-2 border-[#714B67]' : 'text-slate-500'
                }`}
              >
                سياق الوثيقة
              </button>
              <button
                type="button"
                onClick={() => setSmartPanelTab('fields')}
                className={`flex-1 py-2 text-[10px] font-bold cursor-pointer ${
                  smartPanelTab === 'fields' ? 'text-[#714B67] border-b-2 border-[#714B67]' : 'text-slate-500'
                }`}
              >
                حقول ذكية
              </button>
              <button
                type="button"
                onClick={() => setSmartPanelOpen(false)}
                className="px-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="إخفاء اللوحة"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 text-xs min-h-0">
              {smartPanelTab === 'context' ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <Users size={12} /> الموظف المستهدف
                    </span>
                    <select
                      value={selectedEmpId}
                      onChange={e => setSelectedEmpId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 text-[11px] outline-none focus:border-[#714B67]"
                    >
                      <option value="">— اختر موظفاً —</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <span className="text-[10px] font-bold text-slate-600 mb-1 block">الضبط اللغوي</span>
                    <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                          gender === 'male' ? 'bg-[#714B67] text-white' : 'text-slate-600'
                        }`}
                      >
                        مذكر
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                          gender === 'female' ? 'bg-[#714B67] text-white' : 'text-slate-600'
                        }`}
                      >
                        مؤنث
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 space-y-1 text-[10px] text-slate-600">
                    <div>
                      المدني: <span className="font-mono font-bold text-slate-800">{civilId || '—'}</span>
                    </div>
                    <div>
                      الراتب: <span className="font-mono font-bold text-[#714B67]">{totalSalary} د.ك</span>
                    </div>
                    <div>
                      المسمى: <span className="font-bold">{jobTitle || '—'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {SMART_PLACEHOLDERS.map(cat => (
                    <div key={cat.category}>
                      <div className="text-[10px] font-black text-[#714B67] mb-1.5">{cat.category}</div>
                      <div className="space-y-1">
                        {cat.items.map(item => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => insertSmartField(item.tag)}
                            className="w-full text-right px-2 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-[#714B67] hover:text-white hover:border-[#714B67] text-[10px] font-bold transition cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {!smartPanelOpen && showEditorCol && (
          <button
            type="button"
            onClick={() => setSmartPanelOpen(true)}
            className="shrink-0 w-8 border-s border-slate-200 bg-white hover:bg-slate-50 text-[#714B67] flex items-center justify-center cursor-pointer"
            title="إظهار السياق والحقول"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}

        {showPreviewCol && (
          <aside className="w-[min(44%,28rem)] shrink-0 flex flex-col min-h-0 bg-slate-200/60 border-s border-slate-200">
            <div className="shrink-0 px-3 py-1.5 border-b border-slate-300/50 bg-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                <Eye size={13} className="text-emerald-700" />
                معاينة A4
              </span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                حية
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex justify-center min-h-0">
              <div
                ref={previewSheetRef}
                id="live-printable-a4"
                className="bg-white text-slate-900 shadow-lg w-full max-w-[210mm] min-h-[297mm] p-8 md:p-10 flex flex-col"
                style={{
                  fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
                  lineHeight: 1.85,
                  paddingTop: useLetterhead ? '40px' : '48mm',
                }}
              >
                {useLetterhead ? (
                  <OfficialA4CompanyLetterhead
                    company={companyForPrint}
                    className="border-[#714B67] mb-6 pb-5"
                    rightSlot={
                      <div className="font-mono text-[11px] text-slate-600 space-y-1">
                        <div>
                          <strong className="text-slate-800">التاريخ:</strong> {todayFormattedAr}
                        </div>
                        <div>
                          <strong className="text-slate-800">المرجع:</strong> {referenceNumber}
                        </div>
                      </div>
                    }
                  />
                ) : (
                  <div className="text-center font-mono text-[10px] text-slate-300 pb-4 border-b border-dashed border-slate-200 mb-6 print:hidden">
                    هامش ورق مسبق (48mm)
                  </div>
                )}
                <div
                  className="flex-1 text-sm leading-relaxed text-slate-900"
                  dangerouslySetInnerHTML={{ __html: compiledHtml }}
                />
              </div>
            </div>
          </aside>
        )}
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
