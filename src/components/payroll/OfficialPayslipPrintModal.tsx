import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, Building2, ShieldCheck, DollarSign } from 'lucide-react';
import { tafqitKuwaiti } from '../../utils/tafqit';

export interface PayslipPrintData {
  payslipNumber: string;
  period: string;
  employeeName: string;
  employeeId: string;
  civilId: string;
  jobTitle: string;
  department: string;
  bankName: string;
  iban: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusAmount?: number;
  absenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  loanDeduction: number;
  pifssDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
}

interface OfficialPayslipPrintModalProps {
  payslip: PayslipPrintData;
  companyName?: string;
  companyNameEn?: string;
  crNumber?: string;
  companyLogo?: string;
  onClose: () => void;
}

export const OfficialPayslipPrintModal: React.FC<OfficialPayslipPrintModalProps> = ({
  payslip,
  companyName = 'شركة الأفق للتجارة العامة والمقاولات ذ.م.م',
  companyNameEn = 'Al-Ufuq General Trading & Contracting W.L.L.',
  crNumber = '104829',
  companyLogo,
  onClose,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const netSalaryInWords = tafqitKuwaiti(payslip.netSalary);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Bar - Hidden during printing */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-[#a37ba0]" />
            <h3 className="font-bold text-sm">معاينة وطباعة قسيمة الراتب الرسمية (Official Payslip)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#593a52] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer size={14} /> طباعة الآن (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-slate-50 flex-1">
          <div
            ref={printContentRef}
            id="official-payslip-sheet"
            className="bg-white p-8 sm:p-10 rounded-xl shadow-xs border border-slate-200 max-w-2xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-800 text-xs"
            dir="rtl"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-5 mb-5 flex justify-between items-start">
              <div>
                <h1 className="text-base font-black text-slate-900">{companyName}</h1>
                <p className="text-[11px] font-semibold text-slate-500">{companyNameEn}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">سجل تجاري: {crNumber} | دولة الكويت</p>
              </div>
              <div className="text-left font-mono">
                <div className="inline-block bg-[#714B67]/10 text-[#714B67] px-3 py-1 rounded-md font-bold text-[11px] mb-1">
                  قسيمة راتب شهرية (Payslip)
                </div>
                <div className="text-[11px] text-slate-600 font-bold">الشهر: <span className="font-black text-slate-900">{payslip.period}</span></div>
                <div className="text-[10px] text-slate-500">رقم القسيمة: {payslip.payslipNumber}</div>
              </div>
            </div>

            {/* Employee Info Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
              <div>
                <span className="text-[10px] text-slate-500 block">اسم الموظف:</span>
                <strong className="text-slate-900 font-bold">{payslip.employeeName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">الرقم المدني:</span>
                <span className="font-mono font-bold text-slate-800">{payslip.civilId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">الرقم الوظيفي:</span>
                <span className="font-mono text-slate-800">{payslip.employeeId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">المسمى الوظيفي:</span>
                <span className="text-slate-800">{payslip.jobTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">القسم / الإدارة:</span>
                <span className="text-slate-800">{payslip.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">البنك المحول إليه:</span>
                <span className="text-slate-800">{payslip.bankName}</span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 inline-block ml-2">رقم الآيبان (IBAN):</span>
                <span className="font-mono text-slate-700 text-[11px] tracking-wide">{payslip.iban || 'غير مسجل'}</span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Earnings Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-100 flex justify-between items-center text-emerald-800 font-bold">
                    <span>الاستحقاقات (Earnings)</span>
                    <span className="text-[10px]">د.ك</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-slate-700">
                    <div className="px-3 py-1.5 flex justify-between">
                      <span>الراتب الأساسي</span>
                      <span className="font-mono font-bold">{payslip.basicSalary.toFixed(3)}</span>
                    </div>
                    {payslip.housingAllowance > 0 && (
                      <div className="px-3 py-1.5 flex justify-between">
                        <span>بدل سكن</span>
                        <span className="font-mono">{payslip.housingAllowance.toFixed(3)}</span>
                      </div>
                    )}
                    {payslip.transportAllowance > 0 && (
                      <div className="px-3 py-1.5 flex justify-between">
                        <span>بدل انتقال</span>
                        <span className="font-mono">{payslip.transportAllowance.toFixed(3)}</span>
                      </div>
                    )}
                    {payslip.medicalAllowance > 0 && (
                      <div className="px-3 py-1.5 flex justify-between">
                        <span>بدل هاتف / طبي</span>
                        <span className="font-mono">{payslip.medicalAllowance.toFixed(3)}</span>
                      </div>
                    )}
                    {payslip.overtimeAmount > 0 && (
                      <div className="px-3 py-1.5 flex justify-between text-emerald-700">
                        <span>عمل إضافي ({payslip.overtimeHours} س × 1.25)</span>
                        <span className="font-mono font-bold">+{payslip.overtimeAmount.toFixed(3)}</span>
                      </div>
                    )}
                    {(payslip.bonusAmount || 0) > 0 && (
                      <div className="px-3 py-1.5 flex justify-between text-emerald-700">
                        <span>مكافآت وحوافز أخرى</span>
                        <span className="font-mono font-bold">+{(payslip.bonusAmount || 0).toFixed(3)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-emerald-100/60 px-3 py-2 border-t border-emerald-200 flex justify-between items-center font-black text-emerald-900">
                  <span>إجمالي الاستحقاقات</span>
                  <span className="font-mono text-sm">{payslip.grossSalary.toFixed(3)} د.ك</span>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-rose-50 px-3 py-1.5 border-b border-rose-100 flex justify-between items-center text-rose-800 font-bold">
                    <span>الاستقطاعات (Deductions)</span>
                    <span className="text-[10px]">د.ك</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-slate-700">
                    <div className="px-3 py-1.5 flex justify-between">
                      <span>غياب بدون أجر ({payslip.absenceDays} يوم)</span>
                      <span className="font-mono">{payslip.absenceDeduction.toFixed(3)}</span>
                    </div>
                    <div className="px-3 py-1.5 flex justify-between">
                      <span>تأخيرات البصمة ({payslip.delayMinutes} دقيقة)</span>
                      <span className="font-mono">{payslip.delayDeduction.toFixed(3)}</span>
                    </div>
                    {payslip.loanDeduction > 0 && (
                      <div className="px-3 py-1.5 flex justify-between text-rose-700">
                        <span>قسط سلفة شهرية (Loan)</span>
                        <span className="font-mono font-bold">-{payslip.loanDeduction.toFixed(3)}</span>
                      </div>
                    )}
                    {payslip.pifssDeduction > 0 && (
                      <div className="px-3 py-1.5 flex justify-between text-amber-700">
                        <span>اشتراك التأمينات (PIFSS 10.5%)</span>
                        <span className="font-mono font-bold">-{payslip.pifssDeduction.toFixed(3)}</span>
                      </div>
                    )}
                    {payslip.absenceDeduction === 0 && payslip.delayDeduction === 0 && payslip.loanDeduction === 0 && payslip.pifssDeduction === 0 && (
                      <div className="px-3 py-4 text-center text-slate-400 text-[11px]">
                        لا توجد استقطاعات مسجلة لهذا الشهر
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-rose-100/60 px-3 py-2 border-t border-rose-200 flex justify-between items-center font-black text-rose-900">
                  <span>إجمالي الاستقطاعات</span>
                  <span className="font-mono text-sm">{(payslip.totalDeductions || 0).toFixed(3)} د.ك</span>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">صافي الراتب المستحق للصرف (Net Payable):</span>
                <span className="text-xs text-amber-300 font-semibold">{netSalaryInWords}</span>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  {payslip.netSalary.toFixed(3)}
                </span>
                <span className="text-xs text-slate-400 mr-1.5">دينار كويتي</span>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="text-[9px] text-slate-500 mb-8 border-r-2 border-[#714B67] pr-2">
              <p>تم احتساب هذا المسير وفقاً لأحكام قانون العمل الكويتي في القطاع الأهلي (رقم 6 لسنة 2010) وقرارات وزارة الشؤون الاجتماعية ونظام حماية الأجور (WPS).</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block mb-8">إعداد / محاسب الرواتب</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">التوقيع والتاريخ</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-8">اعتماد / الموارد البشرية</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">التوقيع والختم</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-8">استلام الموظف المقر بصحته</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">توقيع المستلم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialPayslipPrintModal;
