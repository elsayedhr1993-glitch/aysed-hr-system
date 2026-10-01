import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, FileText, Download, 
  Printer, Building2, CreditCard, Users, ExternalLink, X, Info
} from 'lucide-react';
import { tafqitKuwaiti } from '../../utils/tafqit';
import { exportToExcel } from '../../utils/exportUtils';
import toast from 'react-hot-toast';
import type { Company } from '../../types';
import { OfficialA4CompanyLetterheadCompact } from '../print/OfficialA4CompanyLetterhead';
import {
  OdooReportFooter,
  OdooReportKpiCell,
  OdooReportKpiStrip,
  OdooReportLegalNotice,
} from '../print/OdooReportPrimitives';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';
import { OdooPdf } from '../../services/odooPdfService';

export interface WpsAuditItem {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  bankName: string;
  iban: string;
  basicSalary: number;
  allowances?: number;
  contractSalary?: number; // MOSAL Registered Salary
  netSalary: number;
  totalDeductions: number;
  status: string;
}

interface WpsAuditShieldModalProps {
  payslips: WpsAuditItem[];
  period: string;
  company?: Company | null;
  companyInfo: {
    nameAr: string;
    nameEn: string;
    crNumber: string;
    employerMosaCode?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  };
  onClose: () => void;
}

export const WpsAuditShieldModal: React.FC<WpsAuditShieldModalProps> = ({
  payslips,
  period,
  company,
  companyInfo,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'audit' | 'cover_letter'>('audit');

  // Audit Calculations
  const auditResults = payslips.map((p) => {
    const issues: { type: 'error' | 'warning'; msg: string }[] = [];

    // 1. IBAN Kuwait Validation
    const cleanIban = (p.iban || '').replace(/\s+/g, '').toUpperCase();
    if (!cleanIban) {
      issues.push({ type: 'error', msg: 'رقم الآيبان (IBAN) مفقود تماماً' });
    } else if (!cleanIban.startsWith('KW') || cleanIban.length !== 30) {
      issues.push({ type: 'error', msg: `الآيبان غير مطابق لمعايير الكويت (30 خانة تبدأ بـ KW) - الطول الحالي: ${cleanIban.length}` });
    }

    // 2. Civil ID Validation (Kuwait Civil ID is exactly 12 digits)
    const cleanCivil = (p.civilId || '').replace(/\D/g, '');
    if (!cleanCivil || cleanCivil.length !== 12) {
      issues.push({ type: 'error', msg: 'الرقم المدني غير صالح (يجب أن يتكون من 12 رقماً)' });
    }

    // 3. Net Salary Check (Must be greater than 0)
    if (p.netSalary <= 0) {
      issues.push({ type: 'error', msg: 'صافي الراتب صفر أو سالب - يرفضه نظام حماية الأجور فوراً' });
    }

    // 4. PAM / MOSAL Contract Comparison
    if (p.contractSalary && p.contractSalary > 0) {
      if (p.netSalary < p.contractSalary * 0.75) {
        issues.push({
          type: 'warning',
          msg: `الصافي المحول (${p.netSalary.toFixed(3)}) يقل عن راتب إذن العمل (${p.contractSalary.toFixed(3)}) بنسبة تتجاوز 25% - قد يعرض المنشأة لملاحظات القوى العاملة (رمز 71)`,
        });
      }
    }

    return {
      ...p,
      issues,
      hasError: issues.some((i) => i.type === 'error'),
      hasWarning: issues.some((i) => i.type === 'warning'),
    };
  });

  const totalErrors = auditResults.filter((r) => r.hasError).length;
  const totalWarnings = auditResults.filter((r) => r.hasWarning && !r.hasError).length;
  const totalValid = auditResults.filter((r) => !r.hasError && !r.hasWarning).length;

  const totalNetSalary = payslips.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGrossSalary = payslips.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
  const totalDeductions = payslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);

  const totalNetInWords = tafqitKuwaiti(totalNetSalary);

  const handleDownloadSIF = () => {
    // Generate SIF file natively using our robust generator
    import('../../utils/wpsSifGenerator').then(({ generateWpsSifFile, downloadSifFile }) => {
      const formattedRecords = payslips.map(p => ({
        employee: {
          id: p.employeeId,
          name: p.employeeName,
          civilId: p.civilId,
          bankName: p.bankName,
          iban: p.iban,
        },
        calculation: {
          basicSalary: p.basicSalary || 0,
          allowances: p.allowances || 0,
          absenceDeduction: p.totalDeductions || 0,
          delayDeduction: 0,
          netSalary: p.netSalary || 0
        }
      })) as any;

      const content = generateWpsSifFile(
        'companyId', 
        companyInfo.nameEn || 'Company', 
        companyInfo.employerMosaCode || companyInfo.crNumber || '000000', 
        period, 
        formattedRecords
      );
      
      downloadSifFile(content, `WPS_SIF_${period.replace('-', '')}_KW.sif`);
      toast.success('تم إنشاء وتحميل ملف الرواتب بصيغة SIF بنجاح للمصرف.');
    });
  };

  const handleExportAuditExcel = () => {
    const data = auditResults.map((r, idx) => ({
      'م': idx + 1,
      'رقم المسير': r.payslipNumber,
      'اسم الموظف': r.employeeName,
      'الرقم المدني': r.civilId,
      'رقم الآيبان': r.iban,
      'البنك': r.bankName,
      'الراتب الأساسي': r.basicSalary.toFixed(3),
      'الاستقطاعات': r.totalDeductions.toFixed(3),
      'صافي الراتب': r.netSalary.toFixed(3),
      'حالة التدقيق': r.hasError ? 'غير مطابق (خطأ)' : r.hasWarning ? 'تحذير تفاوت' : 'مطابق ومعتمد',
      'ملاحظات التدقيق': r.issues.map((i) => i.msg).join(' | ') || 'لا توجد ملاحظات',
    }));
    exportToExcel(data, `WPS_Audit_Report_${period}`);
  };

  const handlePrintCoverLetter = () => {
    void OdooPdf.report.print('wps-bank-cover-letter-print', `WPS_Cover_Letter_${period}`);
  };

  const handlePrintAuditReport = () => {
    void OdooPdf.report.print('wps-audit-print-sheet', `WPS_Audit_${period}`);
  };

  return (
    <div className="fixed printable-modal-root inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="printable-modal-sheet bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={22} className="text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">محرك تدقيق حماية الأجور الكويتي (Kuwait WPS Compliance Shield)</h3>
              <p className="text-[11px] text-slate-400">فحص اللوائح والآيبان ومطابقة راتب الشؤون لشهر: {period}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === 'audit' ? 'bg-[#714B67] text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              تقرير الفحص والمطابقة
            </button>
            <button
              onClick={() => setActiveView('cover_letter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeView === 'cover_letter' ? 'bg-[#714B67] text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              خطاب التغطية البنكي الرسمي
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="printable-scroll p-6 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {activeView === 'audit' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-end gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintAuditReport}
                  className="px-3.5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer size={14} /> طباعة تقرير التدقيق (A4)
                </button>
                <button
                  onClick={handleExportAuditExcel}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download size={14} /> كشف التدقيق (Excel)
                </button>
                <button
                  onClick={handleDownloadSIF}
                  disabled={totalErrors > 0}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    totalErrors > 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <FileText size={14} /> تصدير ملف البنك (.SIF)
                </button>
              </div>

              <div id="wps-audit-print-sheet" className="odoo-report-sheet space-y-5 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
                <OfficialA4CompanyLetterheadCompact
                  company={company ?? null}
                  rightSlot={
                    <div className="text-left font-mono text-[10px] text-slate-500">
                      <div>فترة المسير: {period}</div>
                      <div>REF: WPS-AUDIT/{period.replace('-', '')}</div>
                    </div>
                  }
                />

                <div className="odoo-report-center-title">
                  <h2 className="text-base font-bold text-slate-900">تقرير تدقيق حماية الأجور (WPS Compliance)</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">فحص الآيبان والرقم المدني ومطابقة الصافي لإذن العمل</p>
                </div>

                <OdooReportKpiStrip>
                  <OdooReportKpiCell label="إجمالي الموظفين بالمسير" value={payslips.length} />
                  <OdooReportKpiCell
                    label="مطابق لمعايير WPS"
                    value={<span className="text-emerald-700">{totalValid}</span>}
                  />
                  <OdooReportKpiCell
                    label="تنبيهات تفاوت"
                    value={<span className="text-amber-700">{totalWarnings}</span>}
                  />
                  <OdooReportKpiCell
                    label="أخطاء حرجة"
                    value={<span className="text-rose-700">{totalErrors}</span>}
                  />
                </OdooReportKpiStrip>

                <div className="odoo-report-meta-strip flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <span className="text-slate-500 text-[11px] block">إجمالي صافي التحويل البنكي (WPS):</span>
                    <div className="text-lg font-bold font-mono text-emerald-700">
                      {totalNetSalary.toFixed(3)} د.ك
                    </div>
                    <p className="text-[10px] text-slate-500">{totalNetInWords}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    إجمالي الأساسي: {totalGrossSalary.toFixed(3)} · الاستقطاعات: {totalDeductions.toFixed(3)}
                  </div>
                </div>

                <div className="odoo-report-meta-strip py-2 flex justify-between items-center gap-2">
                  <span className="font-bold text-slate-800">تفاصيل فحص سجلات الموظفين</span>
                  <span className="text-[10px] text-slate-500">بنك الكويت المركزي · الهيئة العامة للقوى العاملة</span>
                </div>

                <div className="odoo-report-table-wrap overflow-x-auto">
                  <table className="odoo-report-table w-full text-right text-[10px]">
                    <thead>
                      <tr>
                        <th className="p-3">الموظف</th>
                        <th className="p-3">الرقم المدني</th>
                        <th className="p-3">الآيبان البنكي (IBAN)</th>
                        <th className="p-3">الصافي</th>
                        <th className="p-3">حالة التدقيق</th>
                        <th className="p-3">الملاحظات والمخالفات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditResults.map((row) => (
                        <tr key={row.id} className={`hover:bg-slate-50/80 transition ${row.hasError ? 'bg-rose-50/40' : row.hasWarning ? 'bg-amber-50/30' : ''}`}>
                          <td className="p-3">
                            <strong className="text-slate-900 block">{row.employeeName}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{row.employeeId}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">{row.civilId}</td>
                          <td className="p-3 font-mono text-[10px] text-slate-600">
                            {row.iban ? (
                              <span className="tracking-wider">{row.iban}</span>
                            ) : (
                              <span className="text-rose-600 font-bold">غير متوفر</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">{row.netSalary.toFixed(3)} د.ك</td>
                          <td className="p-3">
                            {row.hasError ? (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <XCircle size={12} /> خطأ مانع
                              </span>
                            ) : row.hasWarning ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <AlertTriangle size={12} /> تحذير تفاوت
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <CheckCircle size={12} /> سليم ومعتمد
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-[10px]">
                            {row.issues.length > 0 ? (
                              <div className="space-y-1">
                                {row.issues.map((iss, i) => (
                                  <div key={i} className={iss.type === 'error' ? 'text-rose-700 font-bold' : 'text-amber-700'}>
                                    • {iss.msg}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-600">جاهز للتضمين في ملف التحويل البنكي</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <OdooReportLegalNotice title="إقرار المطابقة">
                  <p>
                    تم إعداد هذا التقرير آلياً من مسير الرواتب لشهر {period}. يجب معالجة جميع الأخطاء الحرجة قبل رفع ملف SIF إلى البنك أو نظام حماية الأجور.
                  </p>
                </OdooReportLegalNotice>

                <OdooReportFooter
                  companyName={company ? getCompanyPrintProfile(company).displayNameAr : companyInfo.nameAr}
                  reportRef={`WPS-AUDIT/${period.replace('-', '')}`}
                />
              </div>
            </div>
          ) : (
            /* Official Bank Cover Letter View */
            <div
              id="wps-bank-cover-letter-print"
              className="odoo-report-sheet bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 max-w-2xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800 print-avoid-break"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 print:hidden">
                <span className="font-bold text-sm text-slate-800">خطاب تحويل الرواتب الرسمي الموجه للبنك</span>
                <button
                  type="button"
                  onClick={handlePrintCoverLetter}
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#593a52] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={14} /> طباعة الخطاب (A4)
                </button>
              </div>

              <OfficialA4CompanyLetterheadCompact
                company={company}
                className="mb-6"
                rightSlot={
                  <div className="text-left font-mono text-[11px]">
                    <p className="font-bold text-slate-700">التاريخ: {new Date().toLocaleDateString('ar-KW')}</p>
                    <p className="text-slate-500">الإشارة: PAY-WPS/{period.replace('-', '')}</p>
                  </div>
                }
              />

              {/* Bank Recipient */}
              <div className="mb-6 text-xs leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">السادة / إدارة العمليات المصرفية وخدمات الشركات المحترمين</p>
                <p className="text-slate-700 font-semibold">{companyInfo.bankName || 'البنك المعتمد للشركة'} - دولة الكويت</p>
                <p className="text-slate-500 text-[11px]">تحية طيبة وبعد،،،</p>
              </div>

              {/* Subject */}
              <div className="odoo-report-center-title mb-5 text-xs">
                <p className="font-bold text-slate-900">
                  الموضوع: تحويل مسير رواتب الموظفين لشهر ({period}) — نظام حماية الأجور (WPS)
                </p>
              </div>

              {/* Body */}
              <div className="space-y-3.5 text-xs leading-relaxed text-slate-700 mb-8 text-justify">
                <p>
                  يرجى التكرم بالخصم من حساب شركتنا المفتوح لديكم برقم:{' '}
                  <strong className="font-mono text-slate-900 text-sm">{companyInfo.accountNumber || '—'}</strong>
                  {companyInfo.iban && (
                    <span> (آيبان: <strong className="font-mono text-slate-900">{companyInfo.iban}</strong>)</span>
                  )}
                  ، وتحويل صافي رواتب موظفينا عن شهر <strong>{period}</strong> وفقاً للكشف المرفق والملف الإلكتروني المعتمد بصيغة (.SIF).
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 my-4 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">إجمالي عدد الموظفين المشمولين بالتحويل:</span>
                    <strong className="font-mono text-slate-900">{payslips.length} موظفاً</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-600">إجمالي المبلغ المطلوب خصمه وتحويله:</span>
                    <strong className="font-mono text-slate-900 text-sm">{totalNetSalary.toFixed(3)} د.ك</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-600">المبلغ بالحروف:</span>
                    <span className="font-bold text-[#714B67]">{totalNetInWords}</span>
                  </div>
                </div>
                <p>
                  نقر ونؤكد بأن البيانات الواردة في الكشف والملف الإلكتروني صحيحة ومطابقة للوائح بنك الكويت المركزي والهيئة العامة للقوى العاملة.
                </p>
                <p className="text-slate-600 text-[11px]">شاكرين لكم حسن تعاونكم الدائم،،،</p>
              </div>

              <OdooReportLegalNotice title="تعهد المطابقة">
                <p>
                  نقر بأن الكشف والملف الإلكتروني (.SIF) مطابقان لسجلات الشركة ومتطلبات WPS والهيئة العامة للقوى العاملة.
                </p>
              </OdooReportLegalNotice>

              <OdooReportFooter
                companyName={company ? getCompanyPrintProfile(company).displayNameAr : companyInfo.nameAr}
                reportRef={`PAY-WPS/${period.replace('-', '')}`}
              />

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WpsAuditShieldModal;
