import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, XCircle, FileText, Download, 
  Printer, Building2, CreditCard, Users, ExternalLink, X, Info
} from 'lucide-react';
import { tafqitKuwaiti } from '../../utils/tafqit';
import { generateKuwaitWpsFiles, exportToExcel } from '../../utils/exportUtils';

export interface WpsAuditItem {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  bankName: string;
  iban: string;
  basicSalary: number;
  contractSalary?: number; // MOSAL Registered Salary
  netSalary: number;
  totalDeductions: number;
  status: string;
}

interface WpsAuditShieldModalProps {
  payslips: WpsAuditItem[];
  period: string;
  companyInfo: {
    nameAr: string;
    nameEn: string;
    crNumber: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  };
  onClose: () => void;
}

export const WpsAuditShieldModal: React.FC<WpsAuditShieldModalProps> = ({
  payslips,
  period,
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
    generateKuwaitWpsFiles(
      payslips as any,
      period,
      {
        crNumber: companyInfo.crNumber,
        nameEn: companyInfo.nameEn,
        nameAr: companyInfo.nameAr,
      }
    );
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
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
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
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {activeView === 'audit' ? (
            <div className="space-y-6">
              {/* Scorecard KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block">إجمالي الموظفين بالمسير</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Users size={16} className="text-[#714B67]" />
                    <span className="text-lg font-black font-mono text-slate-900">{payslips.length}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-700 text-[10px] block">مطابق لمعايير WPS تماماً</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-lg font-black font-mono text-emerald-700">{totalValid}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-amber-700 text-[10px] block">تنبيهات تفاوت (قوى عاملة)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span className="text-lg font-black font-mono text-amber-700">{totalWarnings}</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-rose-700 text-[10px] block">أخطاء حرجة تمنع التحويل</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <XCircle size={16} className="text-rose-600" />
                    <span className="text-lg font-black font-mono text-rose-700">{totalErrors}</span>
                  </div>
                </div>
              </div>

              {/* Financial Totals Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-slate-500 text-[11px] block">إجمالي صافي المبالغ المستحقة للتحويل البنكي (WPS):</span>
                  <div className="text-xl font-black font-mono text-emerald-700 mt-0.5">
                    {totalNetSalary.toFixed(3)} <span className="text-xs font-normal">د.ك</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{totalNetInWords}</p>
                </div>

                <div className="flex items-center gap-2">
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
                        : 'bg-[#714B67] hover:bg-[#583950] text-white'
                    }`}
                  >
                    <FileText size={14} /> تصدير ملف البنك المعتمد (.SIF)
                  </button>
                </div>
              </div>

              {/* Audit Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">تفاصيل فحص سجلات الموظفين (Compliance Checklist)</span>
                  <span className="text-[11px] text-slate-500">تم الفحص وفق متطلبات بنك الكويت المركزي والهيئة العامة للقوى العاملة</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 text-[11px] border-b border-slate-200">
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
              </div>
            </div>
          ) : (
            /* Official Bank Cover Letter View */
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 max-w-2xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800" dir="rtl">
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

              {/* Company Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="text-base font-black text-slate-900">{companyInfo.nameAr}</h2>
                  <p className="text-[11px] font-semibold text-slate-500">{companyInfo.nameEn}</p>
                  <p className="text-[10px] text-slate-500 mt-1">سجل تجاري: {companyInfo.crNumber} | دولة الكويت</p>
                </div>
                <div className="text-left font-mono text-[11px]">
                  <p className="font-bold text-slate-700">التاريخ: {new Date().toLocaleDateString('ar-KW')}</p>
                  <p className="text-slate-500">الإشارة: PAY-WPS/{period.replace('-', '')}</p>
                </div>
              </div>

              {/* Bank Recipient */}
              <div className="mb-6 text-xs leading-relaxed">
                <p className="font-bold text-slate-900 mb-1">السادة / إدارة العمليات المصرفية وخدمات الشركات المحترمين</p>
                <p className="text-slate-700 font-semibold">{companyInfo.bankName || 'البنك المعتمد للشركة'} - دولة الكويت</p>
                <p className="text-slate-500 text-[11px]">تحية طيبة وبعد،،،</p>
              </div>

              {/* Subject */}
              <div className="bg-slate-100 p-2.5 rounded-lg font-bold text-center text-slate-900 mb-5 text-xs border border-slate-200">
                الموضوع: تحويل مسير رواتب الموظفين لشهر ({period}) - نظام حماية الأجور (WPS)
              </div>

              {/* Body */}
              <div className="space-y-3.5 text-xs leading-relaxed text-slate-700 mb-8 text-justify">
                <p>
                  يرجى التكرم بالخصم من حساب شركتنا المفتوح لديكم برقم:{' '}
                  <strong className="font-mono text-slate-900 text-sm">{companyInfo.accountNumber || '0123456789'}</strong>
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

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center">
                <div>
                  <span className="text-[11px] text-slate-600 font-bold block mb-12">المفوض بالتوقيع (1)</span>
                  <div className="border-b border-dashed border-slate-400 w-2/3 mx-auto mb-1"></div>
                  <span className="text-[10px] text-slate-400">الاسم والصفة</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-600 font-bold block mb-12">المفوض بالتوقيع (2) / الختم الرسمي</span>
                  <div className="border-b border-dashed border-slate-400 w-2/3 mx-auto mb-1"></div>
                  <span className="text-[10px] text-slate-400">الختم الرسمي المعتمد لدى البنك</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WpsAuditShieldModal;
