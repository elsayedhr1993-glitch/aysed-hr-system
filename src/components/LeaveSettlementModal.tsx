import React, { useState, useMemo, useCallback } from 'react';
import { validateLeaveSettlement } from '../services/guards';
import { calculateUniversalLeaveSettlement, cleanKwdAmount } from '../services/leaveSettlementService';
import { getEmployeeUnifiedSummary } from '../utils/leaveEngine';
import { calculateKuwaitLeaveCashAmount } from '../utils/kuwaitPayrollMath';
import { Employee, HrLeaveAllocation, LeaveRequest, Contract } from '../types';
import { X, DollarSign, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface LeaveSettlementModalProps {
  employeeData?: {
    id?: string;
    name?: string;
    carriedOver?: number;
    accrued?: number;
    approvedLeaveDays?: number;
    basicSalary?: number;
    dailyWageRate?: number;
    companyId?: string;
    [key: string]: any;
  };
  onSubmit?: (data: {
    employeeId?: string;
    carriedOver: number;
    accrued: number;
    requestedDays: number;
    balanceRemaining: number;
    cashAmount?: number;
  }) => Promise<void> | void;
  onCancel?: () => void;
  employee?: Employee | any;
  allocations?: HrLeaveAllocation[];
  leaves?: LeaveRequest[];
  contract?: Contract;
  leaveRequest?: LeaveRequest;
  initialDays?: number;
  onClose?: () => void;
  onConfirmSettlement?: (encashedDays: number, cashAmount: number, notes?: string) => Promise<void> | void;
}

export const LeaveSettlementModal: React.FC<LeaveSettlementModalProps> = ({
  employeeData,
  onSubmit,
  onCancel,
  employee,
  allocations = [],
  leaves = [],
  contract,
  leaveRequest,
  initialDays,
  onClose,
  onConfirmSettlement
}) => {
  const handleCancel = onCancel || onClose || (() => {});

  const summaryEmployee = useMemo(() => {
    if (employee) return employee;
    if (employeeData) {
      return {
        ...employeeData,
        id: employeeData.id,
        companyId: employeeData.companyId,
        fullNameAr: employeeData.name,
        basicSalary: employeeData.basicSalary,
        carriedOverBalance: employeeData.carriedOver,
        accruedAnnualLeave: employeeData.accrued,
      };
    }
    return null;
  }, [employee, employeeData]);

  const summary = useMemo(() => {
    if (!summaryEmployee) {
      return {
        carriedOverDays: 0,
        accruedAnnualDays: 0,
        totalAvailableDays: 0,
        netBalance: 0,
        basicSalary: 0,
        dailyWageRate: 0,
      };
    }
    return getEmployeeUnifiedSummary(summaryEmployee, allocations, leaves, contract);
  }, [summaryEmployee, allocations, leaves, contract]);

  const carriedOver = Number(summary.carriedOverDays || 0);
  const accrued = Number(summary.accruedAnnualDays || 0);
  const totalAvailable = Number((summary.netBalance ?? summary.totalAvailableDays ?? 0).toFixed(2));
  const dailyWage = Number(summary.dailyWageRate || 0);
  const employeeId = summaryEmployee?.id;
  const companyId = summaryEmployee?.companyId || 'comp-main';
  const employeeDisplayName =
    summaryEmployee?.name ||
    summaryEmployee?.fullNameAr ||
    summaryEmployee?.nameAr ||
    'الموظف';

  const initialApprovedDays = useMemo(() => {
    if (employeeData?.approvedLeaveDays !== undefined && employeeData.approvedLeaveDays !== null) {
      return Number(employeeData.approvedLeaveDays);
    }
    if (initialDays !== undefined && initialDays !== null && initialDays > 0) {
      return initialDays;
    }
    if (leaveRequest?.paidDays) {
      return leaveRequest.paidDays;
    }
    if (leaveRequest?.totalDays) {
      return leaveRequest.totalDays;
    }
    if (employeeId) {
      const targetLeave = leaves.find(
        l => l.employeeId === employeeId && (l.status === 'APPROVED' || l.status === 'SUBMITTED')
      );
      if (targetLeave) {
        return targetLeave.paidDays || targetLeave.totalDays || 0;
      }
    }
    return Math.min(15, totalAvailable > 0 ? totalAvailable : 0);
  }, [employeeData, initialDays, leaveRequest, leaves, employeeId, totalAvailable]);

  const [requestedDays, setRequestedDays] = useState<number | string>(initialApprovedDays);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedRemaining = useMemo(() => {
    return Number((totalAvailable - Number(requestedDays || 0)).toFixed(2));
  }, [totalAvailable, requestedDays]);

  const calculatedCashAmount = useMemo(() => {
    const numReq = Number(requestedDays || 0);
    if (numReq <= 0) return 0;
    if (dailyWage > 0) {
      return cleanKwdAmount(numReq * dailyWage);
    }
    const basicSalary = Number(summary.basicSalary || 0);
    return calculateKuwaitLeaveCashAmount(numReq, basicSalary);
  }, [requestedDays, dailyWage, summary.basicSalary]);

  const validationError = useMemo((): string | null => {
    const numReq = Number(requestedDays);
    if (!numReq || numReq <= 0) {
      return 'يجب تحديد عدد أيام إجازة أكبر من الصفر.';
    }

    try {
      const settlement = calculateUniversalLeaveSettlement({
        companyId,
        employeeId: employeeId || '',
        settlementDate: new Date().toISOString().split('T')[0],
        settlementMode: 'ENCASHMENT_LIQUIDATION',
        basicSalary: summary.basicSalary || 0,
        allowances: 0,
        grossSalary: summary.basicSalary || 0,
        dailyWage,
        hourlyWage: dailyWage > 0 ? cleanKwdAmount(dailyWage / 8) : 0,
        carriedOverBalance: carriedOver,
        accruedBalance: accrued,
        totalAvailableBalance: totalAvailable,
        requestedLeaveDays: numReq,
        statutoryLeaveDays: 0,
        consumedLeaveDays: 0,
        unpaidLeaveDays: 0,
        includeProratedSalary: false,
        workedDaysInMonth: 0,
        proratedSalaryDivisor: 26,
        includeOvertime: false,
        overtimeHours: 0,
        overtimeMultiplier: 1.25,
        includeEncashment: true,
        encashmentDays: numReq,
        ticketAllowance: 0,
        housingAllowance: 0,
        loanDeduction: 0,
        salaryAdvanceDeduction: 0,
        adminDeduction: 0,
        customItems: [],
        paymentMethod: 'BANK_TRANSFER',
      });

      validateLeaveSettlement({
        carriedOver,
        accrued,
        totalAvailable,
        requestedDays: numReq,
        balanceRemaining: settlement.remainingBalanceAfter,
      });

      return null;
    } catch (guardErr: any) {
      return guardErr.message || 'خطأ في التحقق من صحة التسوية المالية';
    }
  }, [
    requestedDays,
    companyId,
    employeeId,
    summary.basicSalary,
    carriedOver,
    accrued,
    totalAvailable,
    dailyWage,
  ]);

  const handleSave = useCallback(async () => {
    if (validationError || isSubmitting || !summaryEmployee) return;

    const numReq = Number(requestedDays);

    try {
      setIsSubmitting(true);
      if (onSubmit) {
        await onSubmit({
          employeeId,
          carriedOver,
          accrued,
          requestedDays: numReq,
          balanceRemaining: calculatedRemaining,
          cashAmount: calculatedCashAmount,
        });
      } else if (onConfirmSettlement) {
        await onConfirmSettlement(
          numReq,
          calculatedCashAmount,
          `تسوية وصرف إجازة (${numReq} يوم) - الرصيد المتبقي: ${calculatedRemaining}`
        );
      }
      toast.success('تم اعتماد وصرف التسوية المالية بنجاح');
      handleCancel();
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ أثناء اعتماد التسوية');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validationError,
    isSubmitting,
    summaryEmployee,
    requestedDays,
    onSubmit,
    onConfirmSettlement,
    employeeId,
    carriedOver,
    accrued,
    calculatedRemaining,
    calculatedCashAmount,
    handleCancel,
  ]);

  if (!summaryEmployee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="p-6 bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg relative overflow-hidden flex flex-col text-right">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">اعتماد وتسوية الإجازة</h3>
              <p className="text-[11px] text-gray-500">
                {employeeDisplayName} • الحارس اللحظي الذكي
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs font-semibold">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
            <p className="text-gray-500 text-[11px]">المرحل</p>
            <p className="text-base text-blue-700 font-bold tabular-nums">{carriedOver}</p>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
            <p className="text-gray-500 text-[11px]">المكتسب</p>
            <p className="text-base text-blue-700 font-bold tabular-nums">+{accrued}</p>
          </div>
          <div className="bg-red-50 p-2.5 rounded-xl border border-red-200">
            <p className="text-gray-500 text-[11px]">المطلوب</p>
            <p className="text-base text-red-700 font-bold tabular-nums">-{requestedDays || 0}</p>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
            <p className="text-gray-500 text-[11px]">المتبقي</p>
            <p className="text-base text-purple-700 font-bold tabular-nums">{calculatedRemaining}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-700">أيام الإجازة المصروفة مقدماً:</label>
            {totalAvailable > 0 && (
              <button
                type="button"
                onClick={() => setRequestedDays(totalAvailable)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
              >
                صرف كامل الرصيد ({totalAvailable} يوم)
              </button>
            )}
          </div>
          <input
            type="number"
            min="0.5"
            step="0.5"
            max={totalAvailable}
            value={requestedDays}
            onChange={(e) => setRequestedDays(e.target.value)}
            className="w-full text-center font-bold text-lg border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none tabular-nums"
            placeholder="0"
          />
        </div>

        {calculatedCashAmount > 0 && Number(requestedDays) > 0 && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              القيمة المالية المستحقة للصرف:
            </span>
            <span className="text-base font-black text-emerald-700 tabular-nums flex items-center gap-1" dir="ltr">
              <span>{calculatedCashAmount.toFixed(3)}</span> <span className="text-xs font-bold">د.ك</span>
            </span>
          </div>
        )}

        {validationError && (
          <div className="p-2.5 mb-4 bg-rose-100 border border-rose-300 text-rose-700 text-xs rounded-xl text-center font-bold animate-shake flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>⚠️ {validationError}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={Boolean(validationError) || isSubmitting}
            className={`flex-1 py-2.5 rounded-xl font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm ${
              validationError || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'جاري الاعتماد...' : 'اعتماد وصرف التسوية المالية'}</span>
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveSettlementModal;
