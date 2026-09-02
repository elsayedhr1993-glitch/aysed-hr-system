import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plane, 
  Calendar, 
  UserCheck, 
  Calculator, 
  Printer, 
  CheckCircle2, 
  FileText, 
  Download,
  AlertCircle,
  Building2,
  ArrowRight,
  X
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';

export interface LeaveSettlement {
  id: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  jobTitle: string;
  bankName: string;
  iban: string;
  basicSalary: number;
  totalSalary: number; // الراتب الشامل (أساسي + بدلات)
  leaveStartDate: string;
  leaveEndDate: string;
  leaveDays: number;
  workedDaysBeforeLeave: number; // أيام العمل الفعلية في الشهر الحالي قبل الإجازة
  workedDaysAmount: number;
  leaveSalaryAdvance: number; // راتب الإجازة المدفوع مقدماً (مادة 71)
  ticketAllowance: number; // بدل تذكرة السفر (إن وجد)
  deductions: number; // أي سلف أو أقساط متبقية
  netPayable: number;
  status: 'draft' | 'approved' | 'paid';
}

const sampleSettlements: LeaveSettlement[] = [
  {
    id: 'LS-2026-001',
    employeeId: 'EMP-002',
    employeeName: 'محمد إبراهيم السيد',
    civilId: '288050498765',
    jobTitle: 'أخصائي شؤون إدارية',
    bankName: 'بنك بوبيان (Boubyan)',
    iban: 'KW45BOUB0000000000009876543210',
    basicSalary: 650,
    totalSalary: 850,
    leaveStartDate: '2026-09-01',
    leaveEndDate: '2026-09-30',
    leaveDays: 30,
    workedDaysBeforeLeave: 31, // شهر أغسطس كامل
    workedDaysAmount: 850,
    leaveSalaryAdvance: 850, // راتب شهر سبتمبر مقدماً
    ticketAllowance: 120, // بدل تذكرة سنوية
    deductions: 50, // قسط سلفة شهر 8
    netPayable: 1770, // 850 + 850 + 120 - 50
    status: 'approved'
  }
];

interface OdooLeaveSettlementAppProps {
  isModal?: boolean;
  onClose?: () => void;
  leaveRequest?: {
    id: string;
    employeeName: string;
    daysCount: number;
    startDate: string;
    endDate: string;
  } | null;
}

export const OdooLeaveSettlementApp: React.FC<OdooLeaveSettlementAppProps> = ({ isModal = false, onClose, leaveRequest = null }) => {
  const { activeCompany } = useCompany();
  const [settlements, setSettlements] = useState<LeaveSettlement[]>(sampleSettlements);
  const [selectedSettlement, setSelectedSettlement] = useState<LeaveSettlement | null>(null);

  // حساب الحسبة التلقائية للموظف النازل إجازة
  const [formData, setFormData] = useState({
    empName: 'محمد إبراهيم السيد',
    totalSalary: 850,
    workedDays: 30,
    leaveDays: 30,
    ticket: 120,
    deductions: 0,
    leaveStartDate: '2026-09-01',
    leaveEndDate: '2026-09-30'
  });

  // Sync with incoming leaveRequest if provided
  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        empName: leaveRequest.employeeName,
        totalSalary: 850, // افتراضي
        workedDays: 30,
        leaveDays: leaveRequest.daysCount,
        ticket: 120,
        deductions: 0,
        leaveStartDate: leaveRequest.startDate,
        leaveEndDate: leaveRequest.endDate
      });
    }
  }, [leaveRequest]);

  const calculateAuto = () => {
    const workedAmount = (formData.workedDays / 30) * formData.totalSalary;
    const leaveAdvance = (formData.leaveDays / 30) * formData.totalSalary;
    const total = workedAmount + leaveAdvance + formData.ticket - formData.deductions;
    return {
      workedAmount: Math.round(workedAmount * 1000) / 1000,
      leaveAdvance: Math.round(leaveAdvance * 1000) / 1000,
      net: Math.round(total * 1000) / 1000
    };
  };

  const results = calculateAuto();

  const handleAddSettlement = () => {
    const newId = `LS-2026-0${settlements.length + 1}`;
    const newRecord: LeaveSettlement = {
      id: newId,
      employeeId: 'EMP-00' + (settlements.length + 2),
      employeeName: formData.empName,
      civilId: '290000000000', // افتراضي
      jobTitle: 'موظف معتمد',
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW00NBOK0000000000000000000000',
      basicSalary: formData.totalSalary * 0.7,
      totalSalary: formData.totalSalary,
      leaveStartDate: formData.leaveStartDate,
      leaveEndDate: formData.leaveEndDate,
      leaveDays: formData.leaveDays,
      workedDaysBeforeLeave: formData.workedDays,
      workedDaysAmount: results.workedAmount,
      leaveSalaryAdvance: results.leaveAdvance,
      ticketAllowance: formData.ticket,
      deductions: formData.deductions,
      netPayable: results.net,
      status: 'approved'
    };

    setSettlements([newRecord, ...settlements]);
    alert('تم اعتماد سند الصرف بنجاح وإدراجه في كشف تسويات الإجازة!');
    if (isModal && onClose) {
      onClose();
    }
  };

  const appContent = (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Top Header */}
      {!isModal && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">تسوية وصرف مستحقات الإجازة السنوية (Leave Settlement)</h1>
              <p className="text-xs text-slate-500 font-medium">
                المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | صرف الراتب وتذكرة السفر مقدماً وفق المادة 71
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => safePrintAction('طباعة التقرير')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <Printer size={14} /> طباعة مسير الإجازات
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create / Calculate Leave Settlement */}
        <div className={`${isModal ? 'lg:col-span-12' : 'lg:col-span-5'} bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs`}>
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-1.5">
            <Calculator size={16} className="text-[#714B67]" />
            إنشاء تسوية إجازة لموظف مغادر
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 font-bold mb-1">اسم الموظف المسافر:</label>
              <input
                type="text"
                value={formData.empName}
                onChange={(e) => setFormData({ ...formData, empName: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold outline-none focus:border-[#714B67]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">الراتب الشامل (د.ك):</label>
                <input
                  type="number"
                  value={formData.totalSalary}
                  onChange={(e) => setFormData({ ...formData, totalSalary: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold font-mono outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">مدة الإجازة (أيام):</label>
                <input
                  type="number"
                  value={formData.leaveDays}
                  onChange={(e) => setFormData({ ...formData, leaveDays: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">أيام العمل قبل السفر:</label>
                <input
                  type="number"
                  value={formData.workedDays}
                  onChange={(e) => setFormData({ ...formData, workedDays: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">بدل تذكرة سفر (د.ك):</label>
                <input
                  type="number"
                  value={formData.ticket}
                  onChange={(e) => setFormData({ ...formData, ticket: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">استقطاعات / سلف متبقية (د.ك):</label>
              <input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-rose-600 font-mono outline-none focus:border-[#714B67]"
              />
            </div>
          </div>

          {/* Quick Breakdown Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>راتب أيام العمل المنقضية:</span>
              <span className="font-bold font-mono">{results.workedAmount.toFixed(3)} د.ك</span>
            </div>
            <div className="flex justify-between text-purple-800">
              <span>راتب الإجازة مقدماً (مادة 71):</span>
              <span className="font-bold font-mono">+{results.leaveAdvance.toFixed(3)} د.ك</span>
            </div>
            {formData.ticket > 0 && (
              <div className="flex justify-between text-blue-700">
                <span>بدل التذكرة المستحق:</span>
                <span className="font-bold font-mono">+{formData.ticket.toFixed(3)} د.ك</span>
              </div>
            )}
            <div className="pt-2 border-t flex justify-between items-center text-emerald-800 font-black text-sm">
              <span>صافي المستحق للصرف قبل السفر:</span>
              <span className="text-base font-mono">{results.net.toFixed(3)} د.ك</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleAddSettlement}
            className="w-full bg-[#714B67] hover:bg-[#5a3a52] text-white py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 size={16} /> اعتماد سند الصرف وتحويل البنك (WPS)
          </button>
        </div>

        {/* Right Side: Settlement Record & Printable Voucher */}
        {!isModal && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-xs">
              <div className="border-b pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">سند تسوية مستحقات إجازة سنوية (Leave Voucher)</h3>
                  <p className="text-slate-400 mt-0.5">الرقم المرجعي: LS-2026-001 | معتمد للصرف المالي</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                  معتمد ومحول للبنك
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px]">الموظف المستفيد:</span>
                  <span className="font-bold text-slate-900 text-xs">محمد إبراهيم السيد</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الرقم المدني:</span>
                  <span className="font-mono font-bold text-slate-800">288050498765</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">فترة الإجازة السنوية:</span>
                  <span className="font-bold text-slate-800">2026-09-01 إلى 2026-09-30 (30 يوم)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">الحساب البنكي (IBAN):</span>
                  <span className="font-mono text-slate-700" dir="ltr">KW45BOUB...9876543210</span>
                </div>
              </div>

              <table className="w-full text-right text-xs mb-4">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5 rounded-r">البند المالي</th>
                    <th className="p-2.5">البيان</th>
                    <th className="p-2.5 text-left rounded-l">المبلغ (د.ك)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold">راتب الشهر الحالي الفعلي</td>
                    <td className="p-2.5 text-slate-500">أيام العمل المنقضية (31 يوم عمل)</td>
                    <td className="p-2.5 font-mono font-bold text-left">850.000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-purple-900">راتب الإجازة السنوية مقدماً</td>
                    <td className="p-2.5 text-slate-500">مستحق شهر سبتمبر 2026 مقدماً (مادة 71)</td>
                    <td className="p-2.5 font-mono font-bold text-left text-purple-900">850.000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">بدل تذاكر السفر السنوية</td>
                    <td className="p-2.5 text-slate-500">استحقاق تذكرة سنوية للموظف</td>
                    <td className="p-2.5 font-mono font-bold text-left">120.000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-rose-600">خصم قسط سلفة</td>
                    <td className="p-2.5 text-slate-500">قسط السلفة المعتمد لشهر أغسطس</td>
                    <td className="p-2.5 font-mono font-bold text-left text-rose-600">-50.000</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 text-emerald-900 font-black border-t-2 border-emerald-300">
                    <td className="p-3 text-sm">صافي المبلغ المسلم للموظف:</td>
                    <td></td>
                    <td className="p-3 text-base font-mono text-left">1,770.000 د.ك</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signature Area */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t text-center text-[11px] text-slate-600">
                <div>
                  <p className="font-bold mb-8">إعداد الشؤون الإدارية</p>
                  <p className="border-t border-slate-300 pt-1">التوقيع</p>
                </div>
                <div>
                  <p className="font-bold mb-8">اعتماد الإدارة المالية</p>
                  <p className="border-t border-slate-300 pt-1">التوقيع والختم</p>
                </div>
                <div>
                  <p className="font-bold mb-8">إقرار واستلام الموظف</p>
                  <p className="border-t border-slate-300 pt-1">التوقيع / البصمة</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plane className="text-[#714B67]" size={18} />
              تسوية ومستحقات إجازة الموظف (المادة 71)
            </h3>
            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          {appContent}
        </div>
      </div>
    );
  }

  return appContent;
};

export default OdooLeaveSettlementApp;
