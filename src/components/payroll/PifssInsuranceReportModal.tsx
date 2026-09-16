import React from 'react';
import { ShieldCheck, Printer, Download, X, Building2, Users, FileText } from 'lucide-react';
import { exportToExcel } from '../../utils/exportUtils';
import { tafqitKuwaiti } from '../../utils/tafqit';

export interface PifssEmployeeData {
  id: string;
  name: string;
  civilId: string;
  jobTitle: string;
  nationality?: string;
  basicSalary: number;
  insuredSalary: number; // Max capped at 3000 KWD in PIFSS
  employeeShare: number; // 10.5%
  companyShare: number;  // 11.5%
  totalContribution: number; // 22%
}

interface PifssInsuranceReportModalProps {
  employees: PifssEmployeeData[];
  period: string;
  companyName: string;
  companyNameEn: string;
  crNumber: string;
  onClose: () => void;
}

export const PifssInsuranceReportModal: React.FC<PifssInsuranceReportModalProps> = ({
  employees,
  period,
  companyName,
  companyNameEn,
  crNumber,
  onClose,
}) => {
  const totalInsuredSalary = employees.reduce((acc, e) => acc + e.insuredSalary, 0);
  const totalEmployeeShare = employees.reduce((acc, e) => acc + e.employeeShare, 0);
  const totalCompanyShare = employees.reduce((acc, e) => acc + e.companyShare, 0);
  const totalContribution = employees.reduce((acc, e) => acc + e.totalContribution, 0);

  const totalInWords = tafqitKuwaiti(totalContribution);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const data = employees.map((e, idx) => ({
      'م': idx + 1,
      'اسم المؤمن عليه': e.name,
      'الرقم المدني': e.civilId,
      'المسمى الوظيفي': e.jobTitle,
      'المرتب الخاضع للاشتراك': e.insuredSalary.toFixed(3),
      'حصة المؤمن عليه (10.5%)': e.employeeShare.toFixed(3),
      'حصة صاحب العمل (11.5%)': e.companyShare.toFixed(3),
      'إجمالي الاشتراك (22%)': e.totalContribution.toFixed(3),
    }));
    exportToExcel(data, `PIFSS_Monthly_Report_${period}`);
  };

  return (
    <div className="fixed printable-modal-root inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="printable-modal-sheet bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">كشف اشتراكات المؤسسة العامة للتأمينات الاجتماعية (PIFSS)</h3>
              <p className="text-[11px] text-slate-400">عن شهر: {period} (الموظفون الكويتيون المشمولون بالباب الثالث)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> تصدير Excel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#714B67] hover:bg-[#593a52] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer size={14} /> طباعة الكشف (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="printable-scroll p-6 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:hidden">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block">المؤمن عليهم المسجلين</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Users size={16} className="text-[#714B67]" />
                <span className="text-lg font-black font-mono text-slate-900">{employees.length}</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block">حصة الموظفين (10.5%)</span>
              <div className="text-base font-black font-mono text-slate-800 mt-1">
                {totalEmployeeShare.toFixed(3)} <span className="text-[10px]">د.ك</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block">حصة صاحب العمل (11.5%)</span>
              <div className="text-base font-black font-mono text-slate-800 mt-1">
                {totalCompanyShare.toFixed(3)} <span className="text-[10px]">د.ك</span>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-amber-800 text-[10px] block">إجمالي السداد الشهري (22%)</span>
              <div className="text-base font-black font-mono text-amber-900 mt-1">
                {totalContribution.toFixed(3)} <span className="text-[10px]">د.ك</span>
              </div>
            </div>
          </div>

          {/* Printable Sheet */}
          <div
            id="pifss-monthly-sheet"
            className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-5">
              <div>
                <h1 className="text-base font-black text-slate-900">{companyName}</h1>
                <p className="text-[11px] font-semibold text-slate-500">{companyNameEn}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">سجل تجاري: {crNumber} | رقم المنشأة بالتأمينات: 902841</p>
              </div>
              <div className="text-left font-mono">
                <div className="inline-block bg-amber-100 text-amber-900 px-3 py-1 rounded-md font-bold text-[11px] mb-1">
                  كشف سداد اشتراكات التأمينات
                </div>
                <div className="text-[11px] text-slate-600 font-bold">عن شهر: <span className="text-slate-900 font-black">{period}</span></div>
                <div className="text-[10px] text-slate-500">تاريخ الإصدار: {new Date().toLocaleDateString('ar-KW')}</div>
              </div>
            </div>

            {/* Empty state check */}
            {employees.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <ShieldCheck size={36} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-600 font-bold">لا يوجد موظفون كويتيون مسجلون في هذه المنشأة حالياً</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  يطبق نظام التأمينات الاجتماعية حصراً على المواطنين الكويتيين ومواطني دول مجلس التعاون (نظام مد الحماية).
                </p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
                  <table className="w-full text-right border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-2.5">المؤمن عليه</th>
                        <th className="p-2.5">الرقم المدني</th>
                        <th className="p-2.5">المرتب الخاضع</th>
                        <th className="p-2.5 text-center">حصة الموظف (10.5%)</th>
                        <th className="p-2.5 text-center">حصة المنشأة (11.5%)</th>
                        <th className="p-2.5 text-left">إجمالي الاشتراك (22%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition">
                          <td className="p-2.5">
                            <strong className="text-slate-900 block">{emp.name}</strong>
                            <span className="text-[10px] text-slate-500">{emp.jobTitle}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-700">{emp.civilId}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">{emp.insuredSalary.toFixed(3)} د.ك</td>
                          <td className="p-2.5 font-mono text-rose-700 text-center">{emp.employeeShare.toFixed(3)} د.ك</td>
                          <td className="p-2.5 font-mono text-blue-700 text-center">{emp.companyShare.toFixed(3)} د.ك</td>
                          <td className="p-2.5 font-mono font-black text-amber-900 text-left">{emp.totalContribution.toFixed(3)} د.ك</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-amber-50/70 font-black border-t-2 border-amber-200 text-slate-900">
                        <td className="p-2.5" colSpan={2}>الإجمالي العام المستحق</td>
                        <td className="p-2.5 font-mono">{totalInsuredSalary.toFixed(3)} د.ك</td>
                        <td className="p-2.5 font-mono text-rose-800 text-center">{totalEmployeeShare.toFixed(3)} د.ك</td>
                        <td className="p-2.5 font-mono text-blue-800 text-center">{totalCompanyShare.toFixed(3)} د.ك</td>
                        <td className="p-2.5 font-mono text-amber-900 text-left text-xs">{totalContribution.toFixed(3)} د.ك</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Total in Words */}
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 mb-6 flex justify-between items-center print-avoid-break">
                  <div>
                    <span className="text-slate-500 text-[10px] block">إجمالي المبلغ المطلوب سداده لبوابة التأمينات:</span>
                    <strong className="text-slate-900">{totalInWords}</strong>
                  </div>
                  <div className="text-left font-mono font-black text-lg text-slate-900">
                    {totalContribution.toFixed(3)} د.ك
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-center print-avoid-break">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-10">إعداد / قسم الرواتب وشؤون الموظفين</span>
                    <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                    <span className="text-[10px] text-slate-400">التوقيع والتاريخ</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-10">اعتماد / المدير المالي</span>
                    <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                    <span className="text-[10px] text-slate-400">التوقيع والختم</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PifssInsuranceReportModal;
