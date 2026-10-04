import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet, 
  FileText, 
  Calendar,
  Layers,
  Award,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { OdooPdf } from '../../services/odooPdfService';
import { exportToExcel } from '../../utils/exportUtils';
import { MedicalEmployeeAnalyticsRecord, ReportCategory } from '../OdooReportsApp';
import type { Company } from '../../types';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';
import {
  OdooReportSheet,
  OdooReportKpiStrip,
  OdooReportKpiCell,
  OdooReportFooter,
  OdooReportLegalNotice,
} from '../print/OdooReportPrimitives';
import { OdooOfficialA4ReportLayout } from '../print/OdooOfficialA4ReportLayout';

interface OdooOfficialA4PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportCategory: ReportCategory;
  reportTitle: string;
  company: Company | null;
  data: MedicalEmployeeAnalyticsRecord[];
  selectedMonth: string;
  totalGrossSalaries: number;
  totalNetPayable: number;
  totalEosAccrual: number;
  totalLeaveLiability: number;
  reportRef?: string;
}

export const OdooOfficialA4PrintModal: React.FC<OdooOfficialA4PrintModalProps> = ({
  isOpen,
  onClose,
  reportCategory,
  reportTitle,
  company,
  data,
  selectedMonth,
  totalGrossSalaries,
  totalNetPayable,
  totalEosAccrual,
  totalLeaveLiability,
  reportRef,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = async () => {
    await OdooPdf.report.print('odoo-official-report-a4-sheet', `${reportTitle} - ${selectedMonth}`);
  };

  const handleExport = () => {
    let exportRows: Record<string, any>[] = [];

    exportRows = data.map((d, idx) => ({
        'م': idx + 1,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'المسمى': d.jobTitle,
        'القسم': d.department,
        'الراتب الأساسي': Number(d.basicSalary.toFixed(3)),
        'الراتب الشامل': Number(d.totalSalary.toFixed(3)),
        'صافي المحول': Number(d.netPayableSalary.toFixed(3)),
        'نهاية الخدمة المتراكمة': Number(d.eosAccruedAmount.toFixed(3)),
        'رصيد الإجازات': d.leaveBalance,
        'التزام الإجازة النقدي': Number(d.leaveCashLiability.toFixed(3))
      }));

    exportToExcel(exportRows, `${reportTitle}_${selectedMonth}.xlsx`, reportTitle.slice(0, 30));
  };

  const currentDateStr = new Date().toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden font-sans">
        
        {/* شريط الأدوات العلوي */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#714B67] text-white text-xs font-bold px-3 py-1 rounded-lg">
              معاينة الطباعة الرسمية A4
            </span>
            <h3 className="font-black text-slate-800 text-sm">
              {reportTitle} - {selectedMonth}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة مستند A4 (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* جسم مستند A4 الرسمي */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/60 print:bg-white print:p-0">
          <OdooReportSheet id="odoo-official-report-a4-sheet" ref={printAreaRef} variant="official-a4">
            <OdooOfficialA4ReportLayout
              header={
                <OfficialA4CompanyLetterhead
                  company={company}
                  subtitle="دولة الكويت — منظومة حماية الأجور والامتثال"
                  centerSlot={
                    <div className="odoo-report-center-title">
                      <h1 className="text-base font-bold text-slate-900">{reportTitle}</h1>
                      <span className="text-[11px] font-semibold text-[#714B67] block mt-0.5">فترة الكشف: {selectedMonth}</span>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1 tracking-widest uppercase">
                        OFFICIAL AUDIT REPORT
                      </span>
                    </div>
                  }
                  rightSlot={
                    <div className="text-xs text-slate-600 space-y-1 font-mono">
                      <p><span className="font-bold font-sans">الرقم المرجعي:</span> REP-{reportRef || `${selectedMonth}`}</p>
                      <p><span className="font-bold font-sans">تاريخ الإصدار:</span> {new Date().toISOString().split('T')[0]}</p>
                      <p className="font-sans text-[10px] text-slate-400">{currentDateStr}</p>
                    </div>
                  }
                />
              }
              footer={
                <OdooReportFooter
                  companyName={company ? getCompanyPrintProfile(company).displayNameAr : undefined}
                  reportRef={reportRef ? `REP-${reportRef}` : `REP-${selectedMonth}`}
                />
              }
            >
            <OdooReportKpiStrip>
              <OdooReportKpiCell label="عدد السجلات المدرجة" value={`${data.length} موظفاً`} />
              <OdooReportKpiCell
                label="إجمالي الأجور الشاملة"
                value={<span className="font-mono">{totalGrossSalaries.toFixed(3)} د.ك</span>}
              />
              <OdooReportKpiCell
                label="صافي التحويل البنكي (WPS)"
                value={<span className="font-mono text-emerald-800">{totalNetPayable.toFixed(3)} د.ك</span>}
              />
              <OdooReportKpiCell
                label="مخصص نهاية الخدمة"
                value={<span className="font-mono text-[#714B67]">{totalEosAccrual.toFixed(3)} د.ك</span>}
              />
            </OdooReportKpiStrip>

            <div className="odoo-report-table-wrap">
              
              {reportCategory === 'wps_reconciliation' ? (
                /* كشف مسيرات الرواتب وحماية الأجور WPS */
                <table className="odoo-report-table w-full text-right text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">الموظف / الرقم المدني</th>
                      <th className="p-2.5">القسم</th>
                      <th className="p-2.5 text-left font-mono">الأساسي</th>
                      <th className="p-2.5 text-left font-mono">البدلات</th>
                      <th className="p-2.5 text-left font-mono">الإضافي</th>
                      <th className="p-2.5 text-left font-mono">الاستقطاع</th>
                      <th className="p-2.5 text-left font-mono font-black text-emerald-800">صافي الراتب</th>
                      <th className="p-2.5">البنك</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp.civilId}</div>
                        </td>
                        <td className="p-2.5 font-sans text-slate-700">{emp.department}</td>
                        <td className="p-2.5 text-left">{emp.basicSalary.toFixed(3)}</td>
                        <td className="p-2.5 text-left">{(emp.totalSalary - emp.basicSalary).toFixed(3)}</td>
                        <td className="p-2.5 text-left text-purple-700">+{emp.overtimeAmount.toFixed(3)}</td>
                        <td className="p-2.5 text-left text-rose-600">
                          -{(emp.delayDeductionAmount + emp.absenceDeductionAmount + emp.loanDeductionAmount).toFixed(3)}
                        </td>
                        <td className="p-2.5 text-left font-black text-emerald-800">{emp.netPayableSalary.toFixed(3)} د.ك</td>
                        <td className="p-2.5 font-sans text-[11px] text-slate-700">{emp.bankName}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-mono text-[10px]">
                    <tr>
                      <td colSpan={3} className="p-2.5 font-sans text-slate-900">إجمالي مسير الرواتب:</td>
                      <td className="p-2.5 text-left">{data.reduce((s, e) => s + e.basicSalary, 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left">{data.reduce((s, e) => s + (e.totalSalary - e.basicSalary), 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left text-purple-800">+{data.reduce((s, e) => s + e.overtimeAmount, 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left text-rose-700">
                        -{data.reduce((s, e) => s + e.delayDeductionAmount + e.absenceDeductionAmount + e.loanDeductionAmount, 0).toFixed(3)}
                      </td>
                      <td className="p-2.5 text-left text-sm font-black text-emerald-900">{totalNetPayable.toFixed(3)} د.ك</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              ) : reportCategory === 'gov_compliance' ? (
                <table className="odoo-report-table w-full text-right text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">الموظف</th>
                      <th className="p-2.5">انتهاء الإقامة</th>
                      <th className="p-2.5">إذن العمل PAM</th>
                      <th className="p-2.5">ترخيص MOH</th>
                      <th className="p-2.5 text-center">حالة الامتثال</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-500">{emp.civilId}</div>
                        </td>
                        <td className="p-2.5">{emp.isKuwaiti ? 'مواطن' : emp.residencyExpiryDate}</td>
                        <td className="p-2.5">
                          <div>{emp.pamWorkPermitNo}</div>
                          <div className="text-[10px] text-slate-500">{emp.pamWorkPermitExpiryDate}</div>
                        </td>
                        <td className="p-2.5">
                          <div>{emp.mohLicenseNo}</div>
                          <div className="text-[10px] text-slate-500">{emp.mohLicenseExpiryDate}</div>
                        </td>
                        <td className="p-2.5 text-center font-sans">{emp.complianceStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : reportCategory === 'attendance_overtime_analytics' ? (
                <table className="odoo-report-table w-full text-right text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">الموظف</th>
                      <th className="p-2.5 text-center">ساعات الإضافي</th>
                      <th className="p-2.5 text-left">مبلغ الإضافي</th>
                      <th className="p-2.5 text-center">دقائق التأخير</th>
                      <th className="p-2.5 text-left">خصم التأخير</th>
                      <th className="p-2.5 text-center">أيام الغياب</th>
                      <th className="p-2.5 text-left">خصم الغياب</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-sans font-bold">{emp.name}</td>
                        <td className="p-2.5 text-center">{emp.overtimeHours}</td>
                        <td className="p-2.5 text-left">{emp.overtimeAmount.toFixed(3)}</td>
                        <td className="p-2.5 text-center">{emp.delayMinutes}</td>
                        <td className="p-2.5 text-left">{emp.delayDeductionAmount.toFixed(3)}</td>
                        <td className="p-2.5 text-center">{emp.unpaidAbsenceDays}</td>
                        <td className="p-2.5 text-left">{emp.absenceDeductionAmount.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* الكشف العام للتقارير المالية (إجازات / نهاية خدمة) */
                <table className="odoo-report-table w-full text-right text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">الموظف / الرقم المدني</th>
                      <th className="p-2.5">المسمى والفرع</th>
                      <th className="p-2.5 text-left font-mono">الراتب الشامل</th>
                      <th className="p-2.5 text-center font-mono">رصيد الإجازة</th>
                      <th className="p-2.5 text-left font-mono">التزام الإجازة (÷26)</th>
                      <th className="p-2.5 text-left font-mono font-black text-purple-900">مكافأة نهاية الخدمة</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp.civilId}</div>
                        </td>
                        <td className="p-2.5 font-sans">
                          <div className="text-slate-800">{emp.jobTitle}</div>
                          <div className="text-[10px] text-slate-400">{emp.department}</div>
                        </td>
                        <td className="p-2.5 text-left">{emp.totalSalary.toFixed(3)}</td>
                        <td className="p-2.5 text-center font-bold">{emp.leaveBalance} يوم</td>
                        <td className="p-2.5 text-left font-bold text-amber-800">{emp.leaveCashLiability.toFixed(3)}</td>
                        <td className="p-2.5 text-left font-black text-purple-900">{emp.eosAccruedAmount.toFixed(3)} د.ك</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-mono text-[10px]">
                    <tr>
                      <td colSpan={3} className="p-2.5 font-sans text-slate-900">الإجماليات العامة:</td>
                      <td className="p-2.5 text-left">{totalGrossSalaries.toFixed(3)}</td>
                      <td className="p-2.5 text-center">{data.reduce((s, e) => s + e.leaveBalance, 0).toFixed(1)} يوم</td>
                      <td className="p-2.5 text-left text-amber-900">{totalLeaveLiability.toFixed(3)} د.ك</td>
                      <td className="p-2.5 text-left text-purple-950 text-sm">{totalEosAccrual.toFixed(3)} د.ك</td>
                    </tr>
                  </tfoot>
                </table>
              )}

            </div>

            <OdooReportLegalNotice title="إقرار المطابقة والامتثال للتشريعات الكويتية">
              <p className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                <ShieldCheck size={14} className="text-[#714B67] shrink-0" />
                يُعد هذا الكشف للمراجعة الرسمية والتدقيق الداخلي.
              </p>
              <p>• تم إعداد هذا الكشف وفقاً لأحكام قانون العمل في القطاع الأهلي الكويتي (رقم 6 لسنة 2010) وقرارات الهيئة العامة للقوى العاملة (PAM).</p>
              <p>• احتساب أجر يوم الإجازة وبدلاتها تم وفق معيار (الراتب الأساسي ÷ 26 يوم عمل) طبقاً للمادتين (70 و 71).</p>
              <p>• بيانات الرواتب والحضور في هذا الكشف مرتبطة بفترة التقرير المحددة ومسيرات الرواتب/ترحيل الحضور الشهري عند توفرها.</p>
            </OdooReportLegalNotice>

            </OdooOfficialA4ReportLayout>

          </OdooReportSheet>
        </div>

        {/* الشريط السفلي للإجراءات */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <span className="text-xs text-slate-600 font-bold">
            جاهز للطباعة المباشرة على ورق قياس A4 أو التصدير إلى PDF و Excel
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة مستند A4 (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
