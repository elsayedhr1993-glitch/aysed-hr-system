import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator, X, Scale, Clock, Calendar, CheckCircle2, ShieldCheck, User, ExternalLink,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCompany } from '../../context/CompanyContext';
import { useOdooHierarchy } from '../../context/OdooHierarchyContext';
import type { QuickCalculatorTab } from '../../utils/kuwaitQuickCalculators';
import {
  calculateOvertimeTotals,
  calculatePifssContributions,
  PIFSS_SALARY_CAP_KWD,
} from '../../utils/kuwaitQuickCalculators';
import { calculateKuwaitEOS, calculateDailyWage } from '../../utils/kuwaitPayrollEngine';
import {
  getEmployeeLeaveEosSnapshot,
  resolveContractType,
  resolveEmployeeDisplayName,
  resolveEmployeeGrossSalary,
  resolveEmployeeServiceStartDate,
  type EosTerminationType,
} from '../../utils/eosEmployeeContext';

interface KuwaitHrQuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: QuickCalculatorTab;
  onOpenPayrollSettlement?: (employeeId: string) => void;
}

export const KuwaitHrQuickCalculatorModal: React.FC<KuwaitHrQuickCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'eos',
  onOpenPayrollSettlement,
}) => {
  const { activeCompany } = useCompany();
  const { employees: hierarchyEmployees } = useOdooHierarchy();
  const companyId = activeCompany?.id || '';

  const [activeTab, setActiveTab] = useState<QuickCalculatorTab>(initialTab);

  const [eosMode, setEosMode] = useState<'employee' | 'manual'>('employee');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [eosJoinDate, setEosJoinDate] = useState<string>('');
  const [eosLeaveDate, setEosLeaveDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [eosSalary, setEosSalary] = useState<number>(850);
  const [eosTerminationType, setEosTerminationType] = useState<EosTerminationType>('TERMINATION');
  const [eosContractType, setEosContractType] = useState<'INDEFINITE' | 'FIXED_TERM'>('INDEFINITE');
  const [eosUnusedLeaveDays, setEosUnusedLeaveDays] = useState<number>(0);
  const [eosLeaveDaysTouched, setEosLeaveDaysTouched] = useState(false);
  const [eosUnpaidLeaveDays, setEosUnpaidLeaveDays] = useState<number>(0);
  const [contracts, setContracts] = useState<Record<string, unknown>[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<unknown[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<unknown[]>([]);

  // Daily & Hourly Wage state
  const [wageSalary, setWageSalary] = useState<number>(750);
  const [wageDivisor, setWageDivisor] = useState<number>(26); // مادة 56
  const [workHoursPerDay, setWorkHoursPerDay] = useState<number>(8);
  const [otDayHours, setOtDayHours] = useState<number>(0);
  const [otNightHours, setOtNightHours] = useState<number>(0);
  const [pifssGross, setPifssGross] = useState<number>(1200);

  // Leave Liquidation state
  const [leaveSalary, setLeaveSalary] = useState<number>(800);
  const [leaveDaysBalance, setLeaveDaysBalance] = useState<number>(24);
  const [leaveDivisor, setLeaveDivisor] = useState<number>(26);

  const companyEmployees = useMemo(() => {
    return (hierarchyEmployees || []).filter((e) => {
      if ((e as { isDeleted?: boolean }).isDeleted) return false;
      if (!companyId) return true;
      return e.companyId === companyId;
    });
  }, [hierarchyEmployees, companyId]);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    const emp = companyEmployees.find((e) => e.id === selectedEmployeeId);
    return emp ? (emp as Record<string, unknown>) : null;
  }, [companyEmployees, selectedEmployeeId]);

  const leaveSnapshot = useMemo(() => {
    if (!selectedEmployee) return null;
    return getEmployeeLeaveEosSnapshot(selectedEmployee, leaveAllocations, leaveRequests);
  }, [selectedEmployee, leaveAllocations, leaveRequests]);

  useEffect(() => {
    if (!isOpen || !companyId) {
      setContracts([]);
      setLeaveRequests([]);
      setLeaveAllocations([]);
      return;
    }

    const unsubContracts = onSnapshot(
      query(collection(db, 'contracts'), where('companyId', '==', companyId)),
      (snap) => setContracts(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (err) => console.error('Quick calculator: contracts', err)
    );
    const unsubLeaves = onSnapshot(
      query(collection(db, 'leave_requests'), where('companyId', '==', companyId)),
      (snap) => setLeaveRequests(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (err) => console.error('Quick calculator: leave_requests', err)
    );
    const unsubAlloc = onSnapshot(
      query(collection(db, 'leave_allocations'), where('companyId', '==', companyId)),
      (snap) => setLeaveAllocations(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (err) => console.error('Quick calculator: leave_allocations', err)
    );

    return () => {
      unsubContracts();
      unsubLeaves();
      unsubAlloc();
    };
  }, [isOpen, companyId]);

  useEffect(() => {
    if (!isOpen || eosMode !== 'employee') return;
    if (!selectedEmployeeId && companyEmployees.length > 0) {
      setSelectedEmployeeId(companyEmployees[0].id);
    }
  }, [isOpen, eosMode, selectedEmployeeId, companyEmployees]);

  useEffect(() => {
    if (!selectedEmployee || eosMode !== 'employee') return;
    setEosJoinDate(resolveEmployeeServiceStartDate(selectedEmployee));
    setEosSalary(resolveEmployeeGrossSalary(selectedEmployee, contracts));
    setEosContractType(resolveContractType(selectedEmployee, contracts));
    if (!eosLeaveDaysTouched && leaveSnapshot) {
      setEosUnusedLeaveDays(leaveSnapshot.netAvailable);
      setEosUnpaidLeaveDays(leaveSnapshot.unpaidExcess);
    }
  }, [selectedEmployee, eosMode, contracts, leaveSnapshot, eosLeaveDaysTouched]);

  const eosEngineResult = useMemo(() => {
    if (!eosJoinDate || !eosLeaveDate || eosSalary <= 0) return null;
    const join = new Date(eosJoinDate);
    const leave = new Date(eosLeaveDate);
    if (Number.isNaN(join.getTime()) || Number.isNaN(leave.getTime()) || leave < join) {
      return null;
    }

    return calculateKuwaitEOS({
      employeeId: selectedEmployeeId || 'manual-estimate',
      employeeName: selectedEmployee ? resolveEmployeeDisplayName(selectedEmployee) : 'تقدير يدوي',
      civilId: String(selectedEmployee?.civilId || ''),
      joinDate: eosJoinDate,
      leaveDate: eosLeaveDate,
      grossSalary: eosSalary,
      terminationType: eosTerminationType,
      contractType: eosContractType,
      unusedLeaveDays: Math.max(0, eosUnusedLeaveDays),
      otherDeductions: 0,
      totalUnpaidLeaveDays: Math.max(0, eosUnpaidLeaveDays),
    });
  }, [
    eosJoinDate,
    eosLeaveDate,
    eosSalary,
    eosTerminationType,
    eosContractType,
    eosUnusedLeaveDays,
    eosUnpaidLeaveDays,
    selectedEmployeeId,
    selectedEmployee,
  ]);

  const eosDailyWage = eosSalary > 0 ? calculateDailyWage(eosSalary) : 0;
  const capExceeded =
    eosEngineResult != null &&
    eosEngineResult.grossEosAmount >= eosSalary * 18 - 0.001;

  const wageResult = useMemo(
    () =>
      calculateOvertimeTotals({
        monthlySalary: wageSalary,
        divisor: wageDivisor,
        hoursPerDay: workHoursPerDay,
        dayOtHours: otDayHours,
        nightHolidayOtHours: otNightHours,
      }),
    [wageSalary, wageDivisor, workHoursPerDay, otDayHours, otNightHours]
  );

  const pifssResult = useMemo(() => calculatePifssContributions(pifssGross), [pifssGross]);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) {
      setEosLeaveDaysTouched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'leave' && selectedEmployee && eosMode === 'employee') {
      const gross = resolveEmployeeGrossSalary(selectedEmployee, contracts);
      const basic = Number(selectedEmployee.basicSalary ?? gross);
      setLeaveSalary(basic > 0 ? basic : gross);
      if (leaveSnapshot) {
        setLeaveDaysBalance(leaveSnapshot.netAvailable);
      }
    }
  }, [activeTab, selectedEmployee, eosMode, contracts, leaveSnapshot]);

  // Leave liquidation calculation
  const leaveResult = useMemo(() => {
    const divisor = leaveDivisor > 0 ? leaveDivisor : 26;
    const dailyWage = leaveSalary / divisor;
    const totalAmount = dailyWage * Number(leaveDaysBalance || 0);

    return {
      dailyWage: Number(dailyWage.toFixed(3)),
      totalAmount: Number(totalAmount.toFixed(3))
    };
  }, [leaveSalary, leaveDaysBalance, leaveDivisor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 dir-rtl" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-[#714B67] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">الحاسبات السريعة — قانون العمل الكويتي</h3>
              <p className="text-[11px] text-white/80">EOS · الإجازات · الإضافي · التأمينات (PIFSS)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white/90 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-4 pt-2 gap-1 sm:gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('eos')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'eos'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Scale size={15} className="text-[#714B67]" />
            <span>نهاية الخدمة (مادة 51 و 53)</span>
          </button>

          <button
            onClick={() => setActiveTab('wage')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'wage'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Clock size={15} className="text-[#714B67]" />
            <span>الأجر اليومي والإضافي (مادة 56)</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x ${
              activeTab === 'leave'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <Calendar size={15} className="text-[#714B67]" />
            <span>تسييل الإجازات</span>
          </button>

          <button
            onClick={() => setActiveTab('pifss')}
            className={`px-3 sm:px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer border-t border-x shrink-0 ${
              activeTab === 'pifss'
                ? 'bg-white text-[#714B67] border-slate-200 -mb-px font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/80'
            }`}
          >
            <ShieldCheck size={15} className="text-[#714B67]" />
            <span>التأمينات PIFSS</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* TAB 1: EOS */}
          {activeTab === 'eos' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEosMode('employee')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    eosMode === 'employee'
                      ? 'bg-[#714B67] text-white border-[#714B67]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <User size={12} className="inline ml-1" /> من ملف موظف
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEosMode('manual');
                    setEosLeaveDaysTouched(false);
                    if (!eosJoinDate) {
                      const end = new Date(eosLeaveDate || new Date().toISOString().slice(0, 10));
                      const start = new Date(end);
                      start.setFullYear(start.getFullYear() - 4);
                      setEosJoinDate(start.toISOString().slice(0, 10));
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                    eosMode === 'manual'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  تقدير بدون موظف (تواريخ)
                </button>
              </div>

              {eosMode === 'employee' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الموظف *</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      setSelectedEmployeeId(e.target.value);
                      setEosLeaveDaysTouched(false);
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  >
                    {companyEmployees.length === 0 ? (
                      <option value="">لا يوجد موظفون للشركة النشطة</option>
                    ) : (
                      companyEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {resolveEmployeeDisplayName(emp as Record<string, unknown>)}
                        </option>
                      ))
                    )}
                  </select>
                  <span className="text-[10px] text-slate-500">
                    الراتب من العقد (Firestore) · الإجازة من leaveEngine
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التعيين / المباشرة *</label>
                  <input
                    type="date"
                    value={eosJoinDate}
                    onChange={(e) => setEosJoinDate(e.target.value)}
                    disabled={eosMode === 'employee'}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 disabled:opacity-70"
                  />
                  <span className="text-[10px] text-slate-500">hireDate → commencement → joinDate</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">آخر يوم عمل *</label>
                  <input
                    type="date"
                    value={eosLeaveDate}
                    onChange={(e) => setEosLeaveDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل الأخير (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={eosSalary}
                    onChange={(e) => setEosSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                  <span className="text-[10px] text-slate-500">أساسي + بدلات ثابتة (÷ 26 للأجر اليومي)</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سبب إنهاء العلاقة *</label>
                  <select
                    value={eosTerminationType}
                    onChange={(e) => setEosTerminationType(e.target.value as EosTerminationType)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  >
                    <option value="TERMINATION">إنهاء من صاحب العمل / فصل</option>
                    <option value="CONTRACT_EXPIRED">انتهاء مدة العقد</option>
                    <option value="RETIREMENT">تقاعد</option>
                    <option value="RESIGNATION">استقالة (مادة 53)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">أيام إجازة للتسييل</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={eosUnusedLeaveDays}
                    onChange={(e) => {
                      setEosLeaveDaysTouched(true);
                      setEosUnusedLeaveDays(Math.max(0, Number(e.target.value)));
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                  {leaveSnapshot && eosMode === 'employee' && (
                    <span className="text-[10px] text-emerald-700">
                      leaveEngine: {leaveSnapshot.netAvailable.toFixed(2)} يوم متاح
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">أيام إجازة بدون راتب (خصم من الخدمة)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={eosUnpaidLeaveDays}
                    onChange={(e) => setEosUnpaidLeaveDays(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                </div>
              </div>

              {!eosEngineResult && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  تحقق من التواريخ (آخر يوم ≥ تاريخ التعيين) والراتب الشامل.
                </div>
              )}

              {eosEngineResult && (
                <div className="bg-gradient-to-br from-purple-50 via-slate-50 to-emerald-50 rounded-2xl p-4 border border-purple-200/80 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-700 text-xs">إجمالي التسوية (مكافأة + تسييل إجازة):</span>
                    <div className="text-xl font-black text-[#714B67] font-mono">
                      {eosEngineResult.totalSettlement.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                      <span className="text-xs font-bold text-slate-500">د.ك</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    مدة الخدمة الصافية:{' '}
                    <strong className="font-mono">
                      {eosEngineResult.totalYears}س {eosEngineResult.totalMonths}ش {eosEngineResult.totalDays}ي
                    </strong>{' '}
                    ({eosEngineResult.netServiceDays} يوماً)
                    {eosEngineResult.totalUnpaidLeaveDays > 0 && (
                      <span className="text-amber-700"> — بعد خصم {eosEngineResult.totalUnpaidLeaveDays} يوم غير مدفوع</span>
                    )}
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">صافي المكافأة (51+53):</span>
                      <strong className="font-mono text-slate-800">{eosEngineResult.netEosAmount.toFixed(3)} د.ك</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">تسييل الإجازة:</span>
                      <strong className="font-mono text-slate-800">{eosEngineResult.leavePayoutAmount.toFixed(3)} د.ك</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">المكافأة قبل المادة 53:</span>
                      <strong className="font-mono text-slate-800">{eosEngineResult.grossEosAmount.toFixed(3)} د.ك</strong>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">نسبة الاستحقاق:</span>
                      <strong className="font-mono text-emerald-700">{(eosEngineResult.article53Ratio * 100).toFixed(0)}%</strong>
                    </div>
                  </div>

                  {capExceeded && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-medium">
                      تم تطبيق سقف 18 شهراً ({(eosSalary * 18).toFixed(3)} د.ك) — المادة 51.
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 bg-white/60 p-2.5 rounded-xl border border-slate-200 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>{eosEngineResult.article53Note}</span>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    نفس محرك <strong>calculateKuwaitEOS</strong> المستخدم في مخالصة الرواتب و EOSApp. الأجر اليومي: {eosDailyWage.toFixed(3)} د.ك.
                  </p>

                  {eosMode === 'employee' && selectedEmployeeId && onOpenPayrollSettlement && (
                    <button
                      type="button"
                      onClick={() => onOpenPayrollSettlement(selectedEmployeeId)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ExternalLink size={14} />
                      فتح مخالصة نهاية الخدمة الكاملة (الرواتب)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WAGE & OVERTIME */}
          {activeTab === 'wage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشهري (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={wageSalary}
                    onChange={(e) => setWageSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مقسم الشهر (أيام العمل) *</label>
                  <input
                    type="number"
                    min="20"
                    max="31"
                    value={wageDivisor}
                    onChange={(e) => setWageDivisor(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">26 يوماً حسب المادة 56 من القانون</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعات العمل اليومية</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={workHoursPerDay}
                    onChange={(e) => setWorkHoursPerDay(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">الحد الأقصى القانوني: 8 ساعات (48 أسبوعياً)</span>
                </div>
              </div>

              {/* Wage Result Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الأجر اليومي (Daily Wage):</span>
                  <div className="text-base font-black text-slate-900 font-mono mt-1">
                    {wageResult.daily.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">أجر الساعة الأساسي (Hourly):</span>
                  <div className="text-base font-black text-blue-700 font-mono mt-1">
                    {wageResult.hourly.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الإضافي النهاري (125%):</span>
                  <div className="text-base font-black text-emerald-700 font-mono mt-1">
                    {wageResult.rate125.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك/س</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-bold">الإضافي الليلي/العطلات (150%):</span>
                  <div className="text-base font-black text-purple-700 font-mono mt-1">
                    {wageResult.rate150.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك/س</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعات إضافي نهاري (125%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={otDayHours}
                    onChange={(e) => setOtDayHours(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعات إضافي ليلي / عطلة (150%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={otNightHours}
                    onChange={(e) => setOtNightHours(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold focus:outline-none focus:border-[#714B67] bg-slate-50"
                  />
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-indigo-900">إجمالي مستحقات الإضافي:</span>
                <span className="text-xl font-black text-indigo-800 font-mono">
                  {wageResult.totalOt.toFixed(3)} <span className="text-xs text-slate-500">د.ك</span>
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed font-medium">
                💡 <strong>سند قانوني:</strong> تحسب معدلات الأجر لجميع العمال الذين يتقاضون أجورهم بالشهر بقسمة الراتب على 26 يوماً (المادة 56). ويستحق العامل عن ساعات العمل الإضافية أجراً يعادل أجره العادي في تلك الفترة مضافاً إليه 25% نهاراً أو 50% ليلاً وفي أيام الراحة الأسبوعية (المادة 66).
              </div>
            </div>
          )}

          {/* TAB 3: LEAVE LIQUIDATION */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشامل للموظف (د.ك) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={leaveSalary}
                    onChange={(e) => setLeaveSalary(Math.max(0, Number(e.target.value)))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">رصيد الإجازات المتبقي (أيام) *</label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={leaveDaysBalance}
                    onChange={(e) => setLeaveDaysBalance(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">مقسم الراتب (أيام)</label>
                  <input
                    type="number"
                    min="20"
                    max="31"
                    value={leaveDivisor}
                    onChange={(e) => setLeaveDivisor(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-[#714B67] bg-slate-50 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-500">26 يوماً (المعتمد في الكويت)</span>
                </div>
              </div>

              {/* Leave Result Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-600 block text-xs font-bold">القيمة النقدية لبدل رصيد الإجازات المستحق:</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    (أجر اليوم: {leaveResult.dailyWage.toFixed(3)} د.ك × {leaveDaysBalance} يوم)
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-800 font-mono">
                  {leaveResult.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-xs font-bold text-slate-500">د.ك</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed font-medium">
                💡 <strong>المادة 70 و 71:</strong> يستحق العامل إجازة سنوية مدفوعة الأجر مدتها 30 يوماً عمل عن كل سنة. ويجوز تصفية الإجازة أو صرف بدلها النقدي عند انتهاء العقد على أساس آخر أجر تقاضاه العامل شاملاً جميع البدلات.
              </div>
            </div>
          )}

          {activeTab === 'pifss' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الراتب الشامل الخاضع للتأمين (د.ك) *</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={pifssGross}
                  onChange={(e) => setPifssGross(Math.max(0, Number(e.target.value)))}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono text-sm font-bold focus:outline-none focus:border-[#714B67] bg-slate-50"
                />
                <span className="text-[10px] text-slate-500">
                  سقف الاشتراك الشهري: {PIFSS_SALARY_CAP_KWD} د.ك (للمواطنين الكويتيين)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold">الأجر الخاضع</span>
                  <div className="font-black font-mono text-slate-900 mt-1">{pifssResult.insuredSalary.toFixed(3)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold">حصة الموظف 10.5%</span>
                  <div className="font-black font-mono text-rose-700 mt-1">{pifssResult.employeeShare.toFixed(3)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold">حصة المنشأة 11.5%</span>
                  <div className="font-black font-mono text-amber-700 mt-1">{pifssResult.employerShare.toFixed(3)}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200">
                  <span className="text-[10px] text-purple-700 font-bold">إجمالي الاشتراك</span>
                  <div className="font-black font-mono text-[#714B67] mt-1">{pifssResult.totalContribution.toFixed(3)}</div>
                </div>
              </div>

              {pifssResult.capped && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  تم تطبيق سقف {PIFSS_SALARY_CAP_KWD} د.ك على الراتب الخاضع للاشتراك.
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700">
                الاستقطاع من صافي راتب الموظف الكويتي = <strong className="font-mono">{pifssResult.employeeShare.toFixed(3)}</strong> د.ك شهرياً.
                تكلفة المنشأة الإضافية = <strong className="font-mono">{pifssResult.employerShare.toFixed(3)}</strong> د.ك.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};

export default KuwaitHrQuickCalculatorModal;
