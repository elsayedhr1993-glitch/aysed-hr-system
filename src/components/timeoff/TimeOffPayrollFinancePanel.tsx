import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Info, Plane } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useCompany } from '../../context/CompanyContext';
import { useOdooHierarchy } from '../../context/OdooHierarchyContext';
import { useCompanyLeaveFinanceSnapshots } from '../../hooks/useCompanyLeaveFinanceSnapshots';
import { LeaveSettlementCalculator } from '../LeaveSettlementCalculator';
import type { LeaveRequest } from '../OdooTimeOffApp';
import { calculateKuwaitLeaveCashAmount } from '../../utils/kuwaitPayrollMath';
import { isAnnualLeaveType, normalizeLeaveStatus } from '../../utils/leaveModel';
import {
  resolveAnnualTicketAllowanceKwd,
  resolveLeaveBalancePoolHint,
  resolveLeavePaidUnpaidSplit,
} from '../../utils/leaveEngine';
import { getLeaveMasterPolicy, LeavePolicyData, TIMEOFF_POLICY_STORAGE_KEY } from '../leaves/LeavePolicyWizardModal';
import { loadTenantPolicy } from '../../services/hrPolicyStorage';
import { db, cleanFirestoreData } from '../../lib/firebase';
import { HrLeaveAllocation } from '../../types';
import { upsertLeaveAllocationToSupabase } from '../../services/leaveSupabaseSync';
import { normalizeLeaveType } from '../../utils/leaveModel';

interface Props {
  highlightAdvanceRequestId?: string | null;
}

export const TimeOffPayrollFinancePanel: React.FC<Props> = ({ highlightAdvanceRequestId }) => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';
  const { employees } = useOdooHierarchy();
  const {
    leaveRequests: requests,
    setLeaveRequests: setRequests,
    leaveAllocations: allocations,
    setLeaveAllocations: setAllocations,
    leaveSettlements: settlementVouchers,
  } = useCompanyLeaveFinanceSnapshots(companyId);

  const [financeSubTab, setFinanceSubTab] = useState<'advance_salary' | 'encashment_calculator'>('advance_salary');
  const [leavePolicy, setLeavePolicy] = useState<LeavePolicyData>(() => getLeaveMasterPolicy());

  useEffect(() => {
    let cancelled = false;
    void loadTenantPolicy(
      companyId,
      'leave_policy',
      getLeaveMasterPolicy,
      companyId ? `${TIMEOFF_POLICY_STORAGE_KEY}_${companyId}` : TIMEOFF_POLICY_STORAGE_KEY
    ).then((loaded) => {
      if (!cancelled) setLeavePolicy(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const companyEmployees = employees?.length ? employees : [];

  const mappedAllocations = useMemo(
    () =>
      allocations.map((allocation: any) => ({
        ...allocation,
        numberOfDays: Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0,
        consumedDays: Number(allocation.consumedDays || 0) || 0,
        encashedDays: Number(allocation.encashedDays || 0) || 0,
        remainingDays:
          allocation.remainingDays !== undefined
            ? Number(allocation.remainingDays) || 0
            : Math.max(
                0,
                (Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0) -
                  (Number(allocation.consumedDays || 0) || 0) -
                  (Number(allocation.encashedDays || 0) || 0)
              ),
        allocationType: allocation.allocationType || 'regular',
        state: allocation.state || 'validate',
        name: allocation.name || allocation.notes || '',
        dateFrom: allocation.dateFrom || allocation.allocationDate || `${new Date().getFullYear()}-01-01`,
        leaveType: normalizeLeaveType(allocation.leaveType || 'ANNUAL'),
        companyId: allocation.companyId || companyId,
      })) as HrLeaveAllocation[],
    [allocations, companyId]
  );

  const mappedLeaveRequests = useMemo(
    () =>
      requests.map((req) => ({
        id: req.id,
        companyId: req.companyId || companyId,
        employeeId: req.employeeId,
        leaveType: normalizeLeaveType(req.leaveType),
        startDate: req.startDate,
        endDate: req.endDate,
        totalDays: Number(req.daysCount ?? req.totalDays ?? 0),
        status: normalizeLeaveStatus(req.status),
        reason: req.reason || '',
        createdAt: req.appliedDate || new Date().toISOString(),
      })),
    [requests, companyId]
  );

  const handleUpdateAllocations = async (updated: HrLeaveAllocation[]) => {
    await Promise.all(
      updated.map(async (allocation) => {
        await setDoc(
          doc(db, 'leave_allocations', allocation.id),
          cleanFirestoreData({ ...allocation, companyId }),
          { merge: true }
        );
        void upsertLeaveAllocationToSupabase(allocation, companyId).catch(() => false);
      })
    );
    setAllocations(updated as any);
  };

  const resolveLeaveRequestFinancials = (req: LeaveRequest) => {
    const emp = companyEmployees.find((e) => e.id === req.employeeId);
    const empAny = emp as any;
    const basicSalary = Number(req.basicSalary ?? empAny?.basicSalary ?? 0) || 0;
    const totalSalary =
      Number(req.totalSalary ?? empAny?.totalSalary ?? empAny?.salary ?? basicSalary) || 0;
    const daysCount = Number(req.daysCount ?? req.totalDays ?? 0) || 0;
    const poolBefore = Math.max(resolveLeaveBalancePoolHint(req), Number(req.totalAvailableBalance ?? 0));
    const split = resolveLeavePaidUnpaidSplit(req, poolBefore);

    return {
      basicSalary,
      totalSalary,
      daysCount,
      paidDays: split.paid,
      unpaidDays: split.unpaid,
      employeeName: req.employeeName || empAny?.name || empAny?.fullNameAr || 'موظف',
      civilId: req.civilId || empAny?.civilId || '',
      department: req.department || empAny?.department || 'الإدارة العامة',
    };
  };

  const markSettlementPaid = async (id: string) => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;
    const updated = { ...target, companyId, settlementDone: true };
    setRequests((previous) => previous.map((req) => (req.id === id ? updated : req)));
    try {
      await setDoc(doc(db, 'leave_requests', id), cleanFirestoreData(updated), { merge: true });
      toast.success('تم اعتماد التسوية المسبقة وترحيل المستحقات لمسير الرواتب.');
    } catch (error) {
      console.error('markSettlementPaid failed:', error);
      toast.error('تعذر حفظ حالة السند على الخادم.');
    }
  };

  const confirmAdvanceSettlement = (req: LeaveRequest) => {
    if (req.settlementDone) return;
    if (!window.confirm('اعتماد صرف راتب الإجازة مقدماً (مادة 71) وترحيل المبلغ لمسير الرواتب؟')) return;
    void markSettlementPaid(req.id);
  };

  useEffect(() => {
    if (!highlightAdvanceRequestId) return;
    setFinanceSubTab('advance_salary');
    const timer = window.setTimeout(() => {
      document.getElementById(`advance-pay-row-${highlightAdvanceRequestId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [highlightAdvanceRequestId]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300" dir="rtl">
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setFinanceSubTab('advance_salary')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            financeSubTab === 'advance_salary' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plane size={14} /> صرف راتب الإجازة مقدماً (مادة 71)
        </button>
        <button
          type="button"
          onClick={() => setFinanceSubTab('encashment_calculator')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            financeSubTab === 'encashment_calculator' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator size={14} /> تصفية وبيع رصيد الإجازات
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700">
        المركز المالي للإجازات (سلف مادة 71، تذاكر السفر، وتسييل الرصيد) — يُعالج محاسبياً ضمن{' '}
        <strong>تطبيق الرواتب → تسويات الإجازات</strong>. طلبات الإجازة تعرض خيار الصرف المسبق فقط.
      </div>

      {financeSubTab === 'advance_salary' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">سندات صرف راتب الإجازة السنوية مقدماً (مادة 71):</strong>
              <span>
                يُرحَّل المبلغ آلياً من قيود <code className="text-[10px]">payroll_leave_accruals</code> عند اعتماد HR
                إذا طُلب الصرف المسبق في الطلب.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">الموظف</th>
                  <th className="p-3.5">فترة الإجازة</th>
                  <th className="p-3.5">أجر الإجازة (د.ك)</th>
                  <th className="p-3.5">بدل التذاكر</th>
                  <th className="p-3.5">صافي المستحق</th>
                  <th className="p-3.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests
                  .filter((r) => normalizeLeaveStatus(r.status) === 'APPROVED' && isAnnualLeaveType(r.leaveType))
                  .map((req) => {
                    const fin = resolveLeaveRequestFinancials(req);
                    const advanceSalary = calculateKuwaitLeaveCashAmount(fin.paidDays, fin.basicSalary);
                    const empRecord = companyEmployees.find((e) => e.id === req.employeeId) as Record<string, unknown> | undefined;
                    const ticketAllowance = req.requestAdvanceSalaryArticle71
                      ? resolveAnnualTicketAllowanceKwd(empRecord, leavePolicy as Record<string, unknown>)
                      : 0;
                    const totalPayable = advanceSalary + ticketAllowance;
                    const isHighlighted = highlightAdvanceRequestId === req.id;

                    return (
                      <tr
                        key={req.id}
                        id={`advance-pay-row-${req.id}`}
                        className={`hover:bg-slate-50/70 transition ${isHighlighted ? 'ring-2 ring-[#714B67] bg-purple-50/40' : ''}`}
                      >
                        <td className="p-3.5 font-bold text-slate-900">{fin.employeeName}</td>
                        <td className="p-3.5 font-mono text-[10px]">
                          {req.startDate} → {req.endDate}
                          <div className="text-slate-400">{fin.daysCount} يوم</div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-purple-900">{advanceSalary.toFixed(3)}</td>
                        <td className="p-3.5 font-mono">{ticketAllowance.toFixed(3)}</td>
                        <td className="p-3.5 font-mono font-black text-emerald-700">{totalPayable.toFixed(3)}</td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => confirmAdvanceSettlement(req)}
                            disabled={!req.requestAdvanceSalaryArticle71}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer ${
                              req.settlementDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.requestAdvanceSalaryArticle71
                                  ? 'bg-[#714B67] hover:bg-[#5a3a52] text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Plane size={12} />
                            <span>
                              {req.settlementDone ? 'مسدّد' : req.requestAdvanceSalaryArticle71 ? 'اعتماد الصرف' : 'لم يُطلب م71'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {financeSubTab === 'encashment_calculator' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <LeaveSettlementCalculator
            employees={companyEmployees as any}
            allocations={mappedAllocations}
            leaves={mappedLeaveRequests as any}
            activeCompany={activeCompany as any}
            leavePolicy={leavePolicy}
            onUpdateAllocations={handleUpdateAllocations}
            firestoreSettlementVouchers={settlementVouchers}
          />
        </div>
      )}
    </div>
  );
};
