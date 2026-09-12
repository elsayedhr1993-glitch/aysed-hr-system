import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calculator, Printer, Download, CheckCircle, FileText, X, 
  Building2, User, Calendar, DollarSign, AlertCircle, Shield
} from 'lucide-react';
import { tafqitKuwaiti } from '../../utils/tafqit';
import { calculateKuwaitEOS, calculateDailyWage } from '../../utils/kuwaitPayrollEngine';
import { LeaveBalanceEngine } from '../../utils/leaveEngine';

export interface FinalSettlementEmployee {
  id: string;
  name: string;
  civilId: string;
  jobTitle: string;
  department: string;
  joinDate: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  activeLoanRemaining?: number;
}

interface FinalSettlementModalProps {
  employees: FinalSettlementEmployee[];
  leaveRequests?: any[];
  leaveAllocations?: any[];
  companyName: string;
  companyNameEn: string;
  crNumber: string;
  onClose: () => void;
}

export const FinalSettlementModal: React.FC<FinalSettlementModalProps> = ({
  employees,
  leaveRequests = [],
  leaveAllocations = [],
  companyName,
  companyNameEn,
  crNumber,
  onClose,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [terminationDate, setTerminationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<'termination' | 'resignation' | 'contract_expiry'>('termination');
  const [workedDaysLastMonth, setWorkedDaysLastMonth] = useState<number>(0);
  const [leaveDaysToLiquidate, setLeaveDaysToLiquidate] = useState<number>(0);
  const [deductLoanAmount, setDeductLoanAmount] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);

  const currentEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const liveLeaveBalance = useMemo(() => {
    if (!currentEmp) return 0;

    const normalizedAllocations = (leaveAllocations || []).map((a: any) => ({
      ...a,
      employeeId: a.employeeId || a.employee_id || '',
      days: Number(a.days ?? a.numberOfDays ?? a.number_of_days ?? 0) || 0,
      numberOfDays: Number(a.numberOfDays ?? a.number_of_days ?? a.days ?? 0) || 0,
      allocationDate: a.allocationDate || a.dateFrom || a.date_from || '2026-01-01',
      notes: a.notes || a.name || ''
    }));

    const normalizedLeaves = (leaveRequests || []).map((l: any) => ({
      ...l,
      employeeId: l.employeeId || l.employee_id || '',
      totalDays: Number(l.totalDays ?? l.daysCount ?? l.numberOfDays ?? l.days ?? 0) || 0,
      status: String(l.status || '').toUpperCase()
    }));

    const snapshot = LeaveBalanceEngine.calculate({
      employee: {
        id: currentEmp.id,
        employeeCode: currentEmp.id,
        fullNameAr: currentEmp.name,
        civilId: currentEmp.civilId,
        joinDate: currentEmp.joinDate,
        basicSalary: currentEmp.basicSalary,
        salary: currentEmp.basicSalary
      } as any,
      allocations: normalizedAllocations as any,
      leaves: normalizedLeaves as any
    });

    return Number(snapshot.totalBalance || 0);
  }, [currentEmp, leaveAllocations, leaveRequests]);

  // Auto set default values on employee change
  useEffect(() => {
    if (currentEmp) {
      setLeaveDaysToLiquidate(liveLeaveBalance);
      setDeductLoanAmount(currentEmp.activeLoanRemaining || 0);
    }
  }, [currentEmp, liveLeaveBalance]);

  // Calculations under Kuwait Labor Law (Law No. 6 of 2010)
  const totalComprehensiveSalary = 
    (currentEmp?.basicSalary || 0) + 
    (currentEmp?.housingAllowance || 0) + 
    (currentEmp?.transportAllowance || 0) + 
    (currentEmp?.medicalAllowance || 0);

  const settlementReasonMap: Record<'termination' | 'resignation' | 'contract_expiry', 'TERMINATION' | 'RESIGNATION' | 'CONTRACT_EXPIRED'> = {
    termination: 'TERMINATION',
    resignation: 'RESIGNATION',
    contract_expiry: 'CONTRACT_EXPIRED'
  };

  const eosDayRate = calculateDailyWage(totalComprehensiveSalary);
  const leaveDayRate = calculateDailyWage(Number(currentEmp?.basicSalary || 0));
  const eosResult = calculateKuwaitEOS({
    employeeId: currentEmp?.id || '',
    employeeName: currentEmp?.name || '',
    civilId: currentEmp?.civilId || '',
    joinDate: currentEmp?.joinDate || terminationDate,
    leaveDate: terminationDate,
    grossSalary: totalComprehensiveSalary,
    terminationType: settlementReasonMap[reason],
    contractType: 'INDEFINITE',
    unusedLeaveDays: leaveDaysToLiquidate,
    otherDeductions: (deductLoanAmount || 0) + (otherDeductions || 0),
  });
  const finalEosAward = Math.round(eosResult.netEosAmount * 1000) / 1000;
  const tenureYears = eosResult.totalYears + (eosResult.totalMonths / 12) + (eosResult.totalDays / 365.25);
  const tenureDays = eosResult.netServiceDays;

  // Article 70: Leave Liquidation
  const leaveLiquidationAmount = Math.round((leaveDaysToLiquidate * leaveDayRate) * 1000) / 1000;

  // Last month salary
  const lastMonthSalaryAmount = Math.round((workedDaysLastMonth * eosDayRate) * 1000) / 1000;

  // Total Gross Entitlements
  const totalEntitlements = finalEosAward + leaveLiquidationAmount + lastMonthSalaryAmount + (otherAllowances || 0);

  // Total Deductions
  const totalSettlementDeductions = (deductLoanAmount || 0) + (otherDeductions || 0);

  // Net Final Settlement
  const netFinalPayable = Math.max(0, Math.round((totalEntitlements - totalSettlementDeductions) * 1000) / 1000);
  const netInWords = tafqitKuwaiti(netFinalPayable);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#a37ba0]" />
            <h3 className="font-bold text-sm">حاسبة ومخالصة نهاية الخدمة الشاملة (Final Settlement & Clearance)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#593a52] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer size={14} /> طباعة وثيقة المخالصة (A4)
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

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-xs">
          {/* Controls - Hidden when printing */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-2xs print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الموظف المعني بالتسوية:</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ نهاية الخدمة / العمل:</label>
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب انتهاء العلاقة العمالية:</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="termination">إنهاء خدمة من قبل الشركة (مكافأة كاملة)</option>
                  <option value="contract_expiry">انتهاء مدة العقد المحدد (مكافأة كاملة)</option>
                  <option value="resignation">استقالة الموظف (المادة 53 من قانون العمل)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-slate-600 text-[10px] mb-1">أيام العمل في الشهر الأخير:</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={workedDaysLastMonth}
                  onChange={(e) => setWorkedDaysLastMonth(Number(e.target.value))}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">رصيد إجازات للتصفية (أيام):</label>
                <input
                  type="number"
                  min="0"
                  value={leaveDaysToLiquidate}
                  readOnly
                  className="w-full p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg font-mono text-emerald-800 font-bold"
                />
                <p className="text-[10px] text-emerald-700 mt-1">يُسحب تلقائياً من LeaveBalanceEngine (رصيد حي موحد).</p>
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">خصم رصيد السلف القائم (د.ك):</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={deductLoanAmount}
                  onChange={(e) => setDeductLoanAmount(Number(e.target.value))}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-rose-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">خصومات أو تسويات أخرى (د.ك):</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* Printable Official Document */}
          <div
            id="official-final-settlement-print"
            className="bg-white p-8 sm:p-12 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800"
            dir="rtl"
          >
            {/* Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-5">
              <div>
                <h1 className="text-base font-black text-slate-900">{companyName}</h1>
                <p className="text-[11px] font-semibold text-slate-500">{companyNameEn}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">سجل تجاري: {crNumber} | دولة الكويت</p>
              </div>
              <div className="text-left font-mono">
                <div className="inline-block bg-[#714B67] text-white px-3 py-1 rounded-md font-bold text-[11px] mb-1">
                  مخالصة نهائية وإبراء ذمة عمالي
                </div>
                <div className="text-[10px] text-slate-500">التاريخ: {new Date().toLocaleDateString('ar-KW')}</div>
                <div className="text-[10px] text-slate-500">الرقم المرجعي: EOS-{currentEmp?.id}-{terminationDate.replace(/-/g, '')}</div>
              </div>
            </div>

            {/* Employee Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">اسم الموظف:</span>
                <strong className="text-slate-900">{currentEmp?.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">الرقم المدني:</span>
                <span className="font-mono text-slate-800">{currentEmp?.civilId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">المسمى والوظيفة:</span>
                <span className="text-slate-800">{currentEmp?.jobTitle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">تاريخ التعيين:</span>
                <span className="font-mono text-slate-800">{currentEmp?.joinDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">تاريخ انتهاء الخدمة:</span>
                <span className="font-mono text-slate-800 font-bold">{terminationDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">مدة الخدمة الإجمالية:</span>
                <span className="font-bold text-[#714B67]">{tenureYears.toFixed(2)} سنة ({tenureDays} يوماً)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">الراتب الشامل المعتمد:</span>
                <span className="font-mono font-bold text-slate-900">{totalComprehensiveSalary.toFixed(3)} د.ك</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">سبب الانتهاء:</span>
                <span className="font-bold text-slate-700">
                  {reason === 'termination' ? 'إنهاء خدمة' : reason === 'contract_expiry' ? 'انتهاء عقد' : 'استقالة (م 53)'}
                </span>
              </div>
            </div>

            {/* Settlement Detailed Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[11px] border-b border-slate-200">
                    <th className="p-2.5">البيان والتفاصيل القانونية (قانون العمل الكويتي رقم 6 لسنة 2010)</th>
                    <th className="p-2.5 w-32 text-left">الاستحقاق (+)</th>
                    <th className="p-2.5 w-32 text-left">الاستقطاع (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5">
                      <strong className="text-slate-900 block">مكافأة نهاية الخدمة (المادة 51 والمادة 53)</strong>
                      <span className="text-[10px] text-slate-500">
                        احتساب: 15 يوماً للسنوات الـ 5 الأولى + شهر عن كل سنة لاحقة (معامل الاستحقاق: {eosResult.article53Ratio * 100}%)
                      </span>
                    </td>
                    <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                      +{finalEosAward.toFixed(3)} د.ك
                    </td>
                    <td className="p-2.5 text-left font-mono text-slate-400">-</td>
                  </tr>

                  {leaveLiquidationAmount > 0 && (
                    <tr>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">بدل رصيد الإجازات السنوية المتبقية (المادة 70)</strong>
                        <span className="text-[10px] text-slate-500">
                            تصفية نقدي لـ ({leaveDaysToLiquidate}) يوم × أجر اليوم الأساسي ({leaveDayRate.toFixed(3)} د.ك = الأساسي ÷ 26)
                        </span>
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                        +{leaveLiquidationAmount.toFixed(3)} د.ك
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-400">-</td>
                    </tr>
                  )}

                  {lastMonthSalaryAmount > 0 && (
                    <tr>
                      <td className="p-2.5">
                        <strong className="text-slate-900 block">أجر أيام العمل المتبقية من الشهر الأخير</strong>
                        <span className="text-[10px] text-slate-500">
                          احتساب ({workedDaysLastMonth}) أيام عمل فعلية حتى تاريخ الانقطاع
                        </span>
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                        +{lastMonthSalaryAmount.toFixed(3)} د.ك
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-400">-</td>
                    </tr>
                  )}

                  {deductLoanAmount > 0 && (
                    <tr className="bg-rose-50/40">
                      <td className="p-2.5">
                        <strong className="text-rose-900 block">تسوية واسترداد رصيد السلف المالية القائم</strong>
                        <span className="text-[10px] text-slate-500">إغلاق وتصفية كامل رصيد السلفة المسجلة بالنظام</span>
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-400">-</td>
                      <td className="p-2.5 text-left font-mono font-bold text-rose-700">
                        -{deductLoanAmount.toFixed(3)} د.ك
                      </td>
                    </tr>
                  )}

                  {otherDeductions > 0 && (
                    <tr className="bg-rose-50/40">
                      <td className="p-2.5">
                        <strong className="text-rose-900 block">استقطاعات وعهد أخرى</strong>
                        <span className="text-[10px] text-slate-500">خصم عهد ومعدات أو التزامات مثبتة</span>
                      </td>
                      <td className="p-2.5 text-left font-mono text-slate-400">-</td>
                      <td className="p-2.5 text-left font-mono font-bold text-rose-700">
                        -{otherDeductions.toFixed(3)} د.ك
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300">
                    <td className="p-2.5 text-slate-800">إجمالي المبالغ</td>
                    <td className="p-2.5 text-left font-mono text-emerald-800">+{totalEntitlements.toFixed(3)} د.ك</td>
                    <td className="p-2.5 text-left font-mono text-rose-800">-{totalSettlementDeductions.toFixed(3)} د.ك</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Net Total Box */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">صافي مبلغ التسوية والمخالصة النهائية المستحق:</span>
                <span className="text-xs text-amber-300 font-semibold">{netInWords}</span>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  {netFinalPayable.toFixed(3)}
                </span>
                <span className="text-xs text-slate-400 mr-1.5">دينار كويتي</span>
              </div>
            </div>

            {/* Legal Discharge Statement */}
            <div className="border border-slate-300 bg-slate-50 p-3.5 rounded-xl text-justify text-[11px] leading-relaxed text-slate-700 mb-8">
              <strong className="text-slate-900 block mb-1">إقرار وتنازل وإبراء ذمة شامل (قانون العمل الكويتي):</strong>
              أقر أنا الموقع أدناه / <strong>{currentEmp?.name}</strong>، حامل البطاقة المدنية رقم (<span className="font-mono">{currentEmp?.civilId}</span>)،
              بأنني قد استلمت كافة مستحقاتي العمالية والمالية من رواتب، ومكافأة نهاية خدمة، وبدل إجازات سنوية، وتذاكر سفر، وكافة التعويضات المقررة بموجب عقد العمل وقانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010.
              وبذلك أبرئ ذمة الشركة المذكورة أعلاه إبراءً شاملاً ومانعاً لأي مطالبة حالية أو مستقبلية، وتعتبر هذه الوثيقة مخالصة عمالية نهائية تامة لا رجعة فيها.
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-center">
              <div>
                <span className="text-[10px] text-slate-600 font-bold block mb-10">إعداد / محاسب الرواتب</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">التوقيع والتاريخ</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-bold block mb-10">اعتماد / الموارد البشرية</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">التوقيع والختم</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-900 font-bold block mb-10">الموظف المقر بما فيه (المستلم)</span>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto mb-1"></div>
                <span className="text-[10px] text-slate-400">التوقيع والبصمة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSettlementModal;
