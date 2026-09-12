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
import { printDocument } from '../../utils/printUtils';
import { exportToExcel } from '../../utils/exportUtils';
import { MedicalEmployeeAnalyticsRecord, ReportCategory } from '../OdooReportsApp';

interface OdooOfficialA4PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportCategory: ReportCategory;
  reportTitle: string;
  companyName: string;
  companyCivilId?: string;
  commercialRegNo?: string;
  data: MedicalEmployeeAnalyticsRecord[];
  selectedMonth: string;
  totalGrossSalaries: number;
  totalNetPayable: number;
  totalEosAccrual: number;
  totalLeaveLiability: number;
  totalKuwaitiPifssContribution: number;
}

export const OdooOfficialA4PrintModal: React.FC<OdooOfficialA4PrintModalProps> = ({
  isOpen,
  onClose,
  reportCategory,
  reportTitle,
  companyName,
  companyCivilId = '123456789012',
  commercialRegNo = 'CR-KW-987654',
  data,
  selectedMonth,
  totalGrossSalaries,
  totalNetPayable,
  totalEosAccrual,
  totalLeaveLiability,
  totalKuwaitiPifssContribution
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = async () => {
    await printDocument('odoo-official-report-a4-sheet', `${reportTitle} - ${selectedMonth}`);
  };

  const computePifssBreakdown = (grossSalary: number) => {
    const insuredSalary = Math.min(Math.max(grossSalary || 0, 0), 3000);
    const employeeShare = Number((insuredSalary * 0.105).toFixed(3));
    const employerShare = Number((insuredSalary * 0.115).toFixed(3));
    const totalShare = Number((employeeShare + employerShare).toFixed(3));
    return { insuredSalary, employeeShare, employerShare, totalShare };
  };

  const handleExport = () => {
    let exportRows: Record<string, any>[] = [];

    if (reportCategory === 'pifss_contributions') {
      exportRows = data.filter(d => d.isKuwaiti).map((d, idx) => {
        const pifss = computePifssBreakdown(d.totalSalary);
        return {
          'م': idx + 1,
          'اسم الموظف': d.name,
          'الرقم المدني': d.civilId,
          'المسمى': d.jobTitle,
          'القسم': d.department,
          'الراتب الشامل': Number(d.totalSalary.toFixed(3)),
          'الراتب التأميني (سقف 3,000)': Number(pifss.insuredSalary.toFixed(3)),
          'استقطاع الموظف (10.5%)': Number(pifss.employeeShare.toFixed(3)),
          'مساهمة صاحب العمل (11.5%)': Number(pifss.employerShare.toFixed(3)),
          'إجمالي اشتراك التأمينات (د.ك)': Number(pifss.totalShare.toFixed(3))
        };
      });
    } else {
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
    }

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
          <div 
            id="odoo-official-report-a4-sheet"
            ref={printAreaRef}
            className="bg-white border border-slate-300 print:border-none p-8 sm:p-12 max-w-4xl mx-auto shadow-sm print:shadow-none space-y-6 text-slate-800"
            style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
          >
            {/* 1. ترويسة المنشأة الرسمية */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center font-bold text-base">
                    {companyName.charAt(0) || 'ش'}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{companyName}</h2>
                </div>
                <p className="text-xs text-slate-500 font-bold">الرقم المدني للمنشأة: <span className="font-mono text-slate-800">{companyCivilId}</span></p>
                <p className="text-xs text-slate-500 font-bold">السجل التجاري / ترخيص MOH: <span className="font-mono text-slate-800">{commercialRegNo}</span></p>
                <p className="text-xs text-slate-500">دولة الكويت - منظومة حماية الأجور والامتثال</p>
              </div>

              <div className="text-center">
                <div className="border-2 border-slate-900 bg-slate-50 px-6 py-2 rounded-xl">
                  <h1 className="text-lg font-black text-slate-900">{reportTitle}</h1>
                  <span className="text-[11px] font-bold text-[#714B67] block mt-0.5">فترة الكشف: {selectedMonth}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 block mt-1 tracking-widest uppercase">
                  OFFICIAL AUDIT REPORT
                </span>
              </div>

              <div className="text-left text-xs text-slate-600 space-y-1 font-mono">
                <p><span className="font-bold font-sans">الرقم المرجعي:</span> REP-{new Date().getFullYear()}-{Math.floor(10000 + Math.random() * 90000)}</p>
                <p><span className="font-bold font-sans">تاريخ الإصدار:</span> {new Date().toISOString().split('T')[0]}</p>
                <p className="font-sans text-[10px] text-slate-400">{currentDateStr}</p>
              </div>
            </div>

            {/* 2. ملخص الإجماليات الإحصائية للكشف */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[11px]">عدد السجلات المدرجة:</span>
                <span className="font-bold text-slate-900 text-sm">{data.length} موظفاً</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[11px]">إجمالي الأجور الشاملة:</span>
                <span className="font-bold text-slate-900 text-sm font-mono">{totalGrossSalaries.toFixed(3)} د.ك</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[11px]">صافي التحويل البنكي (WPS):</span>
                <span className="font-bold text-emerald-800 text-sm font-mono">{totalNetPayable.toFixed(3)} د.ك</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[11px]">
                  {reportCategory === 'pifss_contributions' ? 'إجمالي سداد التأمينات:' : 'مخصص نهاية الخدمة:'}
                </span>
                <span className="font-bold text-purple-900 text-sm font-mono">
                  {reportCategory === 'pifss_contributions' 
                    ? `${totalKuwaitiPifssContribution.toFixed(3)} د.ك` 
                    : `${totalEosAccrual.toFixed(3)} د.ك`}
                </span>
              </div>
            </div>

            {/* 3. جدول البيانات التفصيلي المهيأ للطباعة */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              
              {/* حالة 1: كشف التأمينات الاجتماعية */}
              {reportCategory === 'pifss_contributions' ? (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 font-sans">
                    <tr>
                      <th className="p-2.5">م</th>
                      <th className="p-2.5">الموظف / الرقم المدني</th>
                      <th className="p-2.5">المسمى والفرع</th>
                      <th className="p-2.5 text-left font-mono">الراتب الشامل</th>
                      <th className="p-2.5 text-left font-mono">الراتب التأميني</th>
                      <th className="p-2.5 text-left font-mono">استقطاع الموظف (10.5%)</th>
                      <th className="p-2.5 text-left font-mono">مساهمة الشركة (11.5%)</th>
                      <th className="p-2.5 text-left font-mono text-purple-950 font-black">إجمالي السداد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {data.filter(d => d.isKuwaiti).map((emp, idx) => {
                      const pifss = computePifssBreakdown(emp.totalSalary);
                      const insurable = pifss.insuredSalary;
                      const empDeduct = pifss.employeeShare;
                      const compDeduct = pifss.employerShare;
                      const totalDue = pifss.totalShare;
                      return (
                        <tr key={emp.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
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
                          <td className="p-2.5 text-left font-bold">{insurable.toFixed(3)}</td>
                          <td className="p-2.5 text-left text-blue-700">{empDeduct.toFixed(3)}</td>
                          <td className="p-2.5 text-left text-purple-800">{compDeduct.toFixed(3)}</td>
                          <td className="p-2.5 text-left font-black text-slate-900">{totalDue.toFixed(3)} د.ك</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs font-mono">
                    <tr>
                      <td colSpan={3} className="p-2.5 font-sans text-slate-900">إجمالي اشتراكات المؤسسة العامة للتأمينات:</td>
                      <td className="p-2.5 text-left">
                        {data.filter(d => d.isKuwaiti).reduce((s, e) => s + e.totalSalary, 0).toFixed(3)}
                      </td>
                      <td className="p-2.5 text-left">
                        {data.filter(d => d.isKuwaiti).reduce((s, e) => s + computePifssBreakdown(e.totalSalary).insuredSalary, 0).toFixed(3)}
                      </td>
                      <td className="p-2.5 text-left text-blue-800">
                        {data.filter(d => d.isKuwaiti).reduce((s, e) => s + computePifssBreakdown(e.totalSalary).employeeShare, 0).toFixed(3)}
                      </td>
                      <td className="p-2.5 text-left text-purple-900">
                        {data.filter(d => d.isKuwaiti).reduce((s, e) => s + computePifssBreakdown(e.totalSalary).employerShare, 0).toFixed(3)}
                      </td>
                      <td className="p-2.5 text-left text-sm font-black text-slate-950">
                        {totalKuwaitiPifssContribution.toFixed(3)} د.ك
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : reportCategory === 'wps_reconciliation' ? (
                /* حالة 2: كشف مسيرات الرواتب وحماية الأجور WPS */
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 font-sans">
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
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp.civilId}</div>
                        </td>
                        <td className="p-2.5 font-sans text-slate-700">{emp.department}</td>
                        <td className="p-2.5 text-left">{emp.basicSalary.toFixed(3)}</td>
                        <td className="p-2.5 text-left">{(emp.totalSalary - emp.basicSalary).toFixed(3)}</td>
                        <td className="p-2.5 text-left text-purple-700">+{emp.overtimeAmount.toFixed(3)}</td>
                        <td className="p-2.5 text-left text-rose-600">-{(emp.delayDeductionAmount + emp.absenceDeductionAmount).toFixed(3)}</td>
                        <td className="p-2.5 text-left font-black text-emerald-800">{emp.netPayableSalary.toFixed(3)} د.ك</td>
                        <td className="p-2.5 font-sans text-[11px] text-slate-700">{emp.bankName}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs font-mono">
                    <tr>
                      <td colSpan={3} className="p-2.5 font-sans text-slate-900">إجمالي مسير الرواتب:</td>
                      <td className="p-2.5 text-left">{data.reduce((s, e) => s + e.basicSalary, 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left">{data.reduce((s, e) => s + (e.totalSalary - e.basicSalary), 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left text-purple-800">+{data.reduce((s, e) => s + e.overtimeAmount, 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left text-rose-700">-{data.reduce((s, e) => s + e.delayDeductionAmount + e.absenceDeductionAmount, 0).toFixed(3)}</td>
                      <td className="p-2.5 text-left text-sm font-black text-emerald-900">{totalNetPayable.toFixed(3)} د.ك</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                /* حالة 3: الكشف العام للتقارير الأخرى */
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 font-sans">
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
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {data.map((emp, idx) => (
                      <tr key={emp.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
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
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs font-mono">
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

            {/* 4. إشعار الامتثال القانوني الرسمي */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 space-y-1">
              <p className="font-black text-slate-800 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#714B67]" />
                إقرار المطابقة والامتثال للتشريعات الكويتية:
              </p>
              <p>• تم إعداد هذا الكشف وفقاً لأحكام قانون العمل في القطاع الأهلي الكويتي (رقم 6 لسنة 2010) وقرارات الهيئة العامة للقوى العاملة (PAM).</p>
              <p>• احتساب الأجور اليومية وبدلات الإجازات والاستقطاعات تم وفق معيار (الراتب الشامل ÷ 26 يوم عمل) طبقاً للمادتين (70 و 71).</p>
              <p>• الاشتراكات التأمينية للكادر الوطني مطابقة لنسب ولوائح المؤسسة العامة للتأمينات الاجتماعية (10.5% موظف + 11.5% صاحب عمل بحد أقصى 3,000 د.ك).</p>
            </div>

            {/* 5. التواقيع الرسمية الثلاثية المعتمدة */}
            <div className="grid grid-cols-3 gap-6 text-center text-xs pt-8 border-t-2 border-slate-300 print-avoid-break">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">إعداد المحاسب / مسؤول الرواتب</p>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end justify-center pb-1 text-[10px] text-slate-400">
                  التوقيع والتاريخ
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">تدقيق ومراجعة الإدارة المالية</p>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end justify-center pb-1 text-[10px] text-slate-400">
                  التوقيع والتاريخ
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-800">اعتماد الإدارة العامة / الختم الرسمي</p>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end justify-center pb-1 text-[10px] text-slate-400">
                  الختم الرسمي للمنشأة
                </div>
              </div>
            </div>

          </div>
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
