import React, { useState, useEffect } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Palmtree, Scale, 
  ShieldCheck, Clock, FileText, AlertTriangle, Calendar, 
  Award, Stethoscope, RefreshCw, Send, Sparkles, CheckCircle2,
  Sliders, Layers, DollarSign, Users, ArrowUpRight
} from 'lucide-react';

export interface LeavePolicyData {
  // Step 1: Accrual
  annualDays: number;
  monthlyAccrualRate: number;
  minMonthsServiceRequired: number;
  includeHolidaysInAnnual: boolean;
  probationAllowedPaidLeave: boolean;

  // Step 2: Sick Leave & Special Scale (Kuwait Law 6/2010 Articles 69 & 70)
  sickFullPayDays: number;
  sick75PayDays: number;
  sick50PayDays: number;
  sick25PayDays: number;
  sickUnpaidDays: number;
  hajjLeaveDays: number;
  compassionateLeaveDays: number;
  maternityLeaveDays: number;
  paternityLeaveDays: number;

  // Step 3: Carryover & Opening Balances
  maxCarryoverYears: number;
  maxCarryoverDays: number;
  expireUnusedDaysAfterMonths: number;
  cashoutAllowedAtEos: boolean;

  // Step 4: Approval Pipeline
  approvalLevelsCount: number;
  requireHrApproval: boolean;
  requireMedicalReportForSickDays: number;
  autoApproveUnderDays: number;

  // Step 5: WPS & Attendance Sync
  syncWithWpsPayroll: boolean;
  autoDeductUnpaidFromSalary: boolean;
  syncWithAttendanceRoster: boolean;

  // Metadata
  isActivated: boolean;
  lastUpdated: string;
}

export const TIMEOFF_POLICY_STORAGE_KEY = 'timeoff_master_policy_v1';

export const defaultLeavePolicy: LeavePolicyData = {
  annualDays: 30,
  monthlyAccrualRate: 2.5,
  minMonthsServiceRequired: 9,
  includeHolidaysInAnnual: false,
  probationAllowedPaidLeave: false,

  sickFullPayDays: 15,
  sick75PayDays: 10,
  sick50PayDays: 10,
  sick25PayDays: 10,
  sickUnpaidDays: 15,
  hajjLeaveDays: 21,
  compassionateLeaveDays: 3,
  maternityLeaveDays: 70,
  paternityLeaveDays: 3,

  maxCarryoverYears: 2,
  maxCarryoverDays: 60,
  expireUnusedDaysAfterMonths: 24,
  cashoutAllowedAtEos: true,

  approvalLevelsCount: 2,
  requireHrApproval: true,
  requireMedicalReportForSickDays: 1,
  autoApproveUnderDays: 0,

  syncWithWpsPayroll: true,
  autoDeductUnpaidFromSalary: true,
  syncWithAttendanceRoster: true,

  isActivated: true,
  lastUpdated: new Date().toISOString(),
};

export const getLeaveMasterPolicy = (): LeavePolicyData => {
  try {
    const raw = localStorage.getItem(TIMEOFF_POLICY_STORAGE_KEY);
    if (raw) {
      return { ...defaultLeavePolicy, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load leave policy:', e);
  }
  return defaultLeavePolicy;
};

export const saveLeaveMasterPolicy = (policy: LeavePolicyData): LeavePolicyData => {
  try {
    const updated = { ...policy, lastUpdated: new Date().toISOString(), isActivated: true };
    localStorage.setItem(TIMEOFF_POLICY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('timeoff_policy_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save leave policy:', e);
    return policy;
  }
};

interface LeavePolicyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (policy: LeavePolicyData) => void;
}

export const LeavePolicyWizardModal: React.FC<LeavePolicyWizardModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [policy, setPolicy] = useState<LeavePolicyData>(defaultLeavePolicy);

  useEffect(() => {
    if (isOpen) {
      setPolicy(getLeaveMasterPolicy());
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof LeavePolicyData, value: any) => {
    setPolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAndActivate = () => {
    const saved = saveLeaveMasterPolicy(policy);
    if (onSaved) onSaved(saved);
    alert('✅ تم تثبيت واعتماد لائحة وقواعد الإجازات الرسمية بنجاح!');
    onClose();
  };

  const steps = [
    { num: 1, title: 'الاستحقاق والاحتساب', desc: '30 يوم سنوي و2.5 شهري' },
    { num: 2, title: 'سلم المرضيات والخاصة', desc: 'المادة 69 من قانون العمل' },
    { num: 3, title: 'الترحيل والأرصدة', desc: 'ترحيل لسنتين والتصفية النقدية' },
    { num: 4, title: 'مسار الاعتمادات', desc: 'دورة الموافقات والتقرير الطبي' },
    { num: 5, title: 'المزامنة مع WPS والدوام', desc: 'الربط التلقائي بالرواتب والخصوم' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Palmtree className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>معالج تهيئة وتثبيت لائحة الإجازات الرسمية</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Kuwait Labor Law 6/2010
                </span>
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                تحديد القواعد اللائحية للاستحقاق، تدرج المرضيات، الترحيل، ودورة الاعتماد التلقائي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 shrink-0">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {steps.map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition cursor-pointer border ${
                    isCurrent
                      ? 'bg-emerald-800 text-white border-emerald-950 shadow-sm'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                      isCurrent 
                        ? 'bg-amber-400 text-slate-950' 
                        : isPassed 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isPassed ? <Check size={12} /> : step.num}
                    </span>
                    <span className="font-bold text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
                      {step.title}
                    </span>
                  </div>
                  <span className={`text-[9px] hidden sm:block ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 dir-rtl">

          {/* STEP 1: Accrual Rules */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Palmtree size={16} className="text-emerald-700" />
                  <span>الخطوة 1: استحقاق الإجازة السنوية ومعدل الاحتساب التراكمي (المادة 70)</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                  Annual Accrual Rules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">عدد أيام الإجازة السنوية المدفوعة *</label>
                  <input
                    type="number"
                    value={policy.annualDays}
                    onChange={(e) => handleFieldChange('annualDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">30 يوماً طبقاً لقانون العمل الكويتي</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">معدل التراكم الشهري (أيام / شهر) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={policy.monthlyAccrualRate}
                    onChange={(e) => handleFieldChange('monthlyAccrualRate', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">2.5 يوم شهرياً لحساب الأرصدة المستحقة</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">شرط مدة الخدمة لاستحقاق أول إجازة (أشهر) *</label>
                  <input
                    type="number"
                    value={policy.minMonthsServiceRequired}
                    onChange={(e) => handleFieldChange('minMonthsServiceRequired', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">9 أشهر خدمة فعلية طبقاً للمادة 70</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.includeHolidaysInAnnual}
                    onChange={(e) => handleFieldChange('includeHolidaysInAnnual', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">احتساب أيام العطل الرسمية وأيام الراحة ضمن الإجازة السنوية</span>
                    <span className="text-[10px] text-slate-500 block">
                      عند التفعيل: لا تُخصم العطل الأسبوعية المتخللة للإجازة. التوصية القانونية: تعطيل الخيار لحماية حق الموظف.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={policy.probationAllowedPaidLeave}
                    onChange={(e) => handleFieldChange('probationAllowedPaidLeave', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">السماح بالإجازة السنوية المدفوعة خلال فترة التجربة (Probation)</span>
                    <span className="text-[10px] text-slate-500 block">
                      الافتراضي القانوني: عدم السماح بالإجازات المدفوعة خلال الأشهر الـ 100 الأولى إلا للضرورة العاجلة.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Sick Leave Scale & Special Leaves */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-amber-700" />
                  <span>الخطوة 2: سلم الإجازات المرضية والخاصة (تدرج المادة 69 من قانون العمل)</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  Article 69 Scale
                </span>
              </div>

              {/* Sick Scale Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Scale size={15} className="text-amber-600" />
                  <span>تدرج الأجر للإجازة المرضية السنوية (المجموع: 60 يوماً):</span>
                </h5>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 block">100% أجر كامل</span>
                    <input
                      type="number"
                      value={policy.sickFullPayDays}
                      onChange={(e) => handleFieldChange('sickFullPayDays', Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold font-mono text-emerald-950 mt-1"
                    />
                    <span className="text-[9px] text-emerald-600 block text-center mt-1">15 يوماً الأولى</span>
                  </div>

                  <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                    <span className="text-[10px] font-bold text-teal-800 block">75% أجر</span>
                    <input
                      type="number"
                      value={policy.sick75PayDays}
                      onChange={(e) => handleFieldChange('sick75PayDays', Number(e.target.value))}
                      className="w-full bg-white border border-teal-300 rounded-lg p-1.5 text-center font-bold font-mono text-teal-950 mt-1"
                    />
                    <span className="text-[9px] text-teal-600 block text-center mt-1">10 أيام التالية</span>
                  </div>

                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 block">50% أجر</span>
                    <input
                      type="number"
                      value={policy.sick50PayDays}
                      onChange={(e) => handleFieldChange('sick50PayDays', Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-center font-bold font-mono text-amber-950 mt-1"
                    />
                    <span className="text-[9px] text-amber-600 block text-center mt-1">10 أيام التالية</span>
                  </div>

                  <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200">
                    <span className="text-[10px] font-bold text-orange-800 block">25% أجر</span>
                    <input
                      type="number"
                      value={policy.sick25PayDays}
                      onChange={(e) => handleFieldChange('sick25PayDays', Number(e.target.value))}
                      className="w-full bg-white border border-orange-300 rounded-lg p-1.5 text-center font-bold font-mono text-orange-950 mt-1"
                    />
                    <span className="text-[9px] text-orange-600 block text-center mt-1">10 أيام التالية</span>
                  </div>

                  <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-800 block">0% بدون أجر</span>
                    <input
                      type="number"
                      value={policy.sickUnpaidDays}
                      onChange={(e) => handleFieldChange('sickUnpaidDays', Number(e.target.value))}
                      className="w-full bg-white border border-rose-300 rounded-lg p-1.5 text-center font-bold font-mono text-rose-950 mt-1"
                    />
                    <span className="text-[9px] text-rose-600 block text-center mt-1">15 يوماً الأخيرة</span>
                  </div>
                </div>
              </div>

              {/* Special Leaves */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">إجازة الحج (مرة واحدة)</label>
                  <input
                    type="number"
                    value={policy.hajjLeaveDays}
                    onChange={(e) => handleFieldChange('hajjLeaveDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">21 يوماً مدفوعة الأجر</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">إجازة الوفاة / التعزية</label>
                  <input
                    type="number"
                    value={policy.compassionateLeaveDays}
                    onChange={(e) => handleFieldChange('compassionateLeaveDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">3 أيام للأقارب من الدرجة الأولى</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">إجازة وضع والأمومة</label>
                  <input
                    type="number"
                    value={policy.maternityLeaveDays}
                    onChange={(e) => handleFieldChange('maternityLeaveDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">70 يوماً مدفوعة للموظفات</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">إجازة الأبوة</label>
                  <input
                    type="number"
                    value={policy.paternityLeaveDays}
                    onChange={(e) => handleFieldChange('paternityLeaveDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">3 أيام للموظف الأب</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Carryover & Opening Balances */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-700" />
                  <span>الخطوة 3: الترحيل والتصفية النقدية (Carryover & Cashout Rules)</span>
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-950 px-2 py-0.5 rounded-full">
                  Carryover Policy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى لسنوات الترحيل *</label>
                  <input
                    type="number"
                    value={policy.maxCarryoverYears}
                    onChange={(e) => handleFieldChange('maxCarryoverYears', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">سنتين متتاليتين كحد أقصى طبقاً للقانون</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى لأيام الترحيل المسموحة</label>
                  <input
                    type="number"
                    value={policy.maxCarryoverDays}
                    onChange={(e) => handleFieldChange('maxCarryoverDays', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">60 يوماً كحد أقصى للرصيد المرحل</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">انقضاء الأيام غير المستعملة بعد (شهر)</label>
                  <input
                    type="number"
                    value={policy.expireUnusedDaysAfterMonths}
                    onChange={(e) => handleFieldChange('expireUnusedDaysAfterMonths', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">24 شهراً (تسقط الأيام الزائدة قانوناً)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.cashoutAllowedAtEos}
                    onChange={(e) => handleFieldChange('cashoutAllowedAtEos', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">تصفية وصرف الرصيد المتبقي نقداً عند نهاية الخدمة (EOS Settlement)</span>
                    <span className="text-[10px] text-slate-500 block">
                      إلزام قانوني: يُحسب بديل إجازة الموظف المتبقي على أساس آخر أجر شامل يتقاضاه عند الاستقالة أو الإقالة.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Approval Pipeline */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center justify-between text-purple-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#714B67]" />
                  <span>الخطوة 4: مسار الاعتمادات ودورة الموافقات (Multi-Level Approval)</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded-full">
                  Approval Pipeline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">عدد مستويات الموافقات المطلوبة *</label>
                  <select
                    value={policy.approvalLevelsCount}
                    onChange={(e) => handleFieldChange('approvalLevelsCount', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value={1}>مستوى واحد (المسؤول المباشر فقط)</option>
                    <option value={2}>مستويان (المسؤول المباشر + مدير الموارد البشرية)</option>
                    <option value={3}>3 مستويات (+ المدير التنفيذي للطلبات الخاصة)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">اشتراط تقرير طبي للإجازات المرضية التي تتجاوز</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={policy.requireMedicalReportForSickDays}
                      onChange={(e) => handleFieldChange('requireMedicalReportForSickDays', Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                    />
                    <span className="text-xs font-bold text-slate-600 shrink-0">أيام</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">إلزامية التقرير المعتمد من الصحة للمرضيات</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.requireHrApproval}
                    onChange={(e) => handleFieldChange('requireHrApproval', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">اعتماد قسم الموارد البشرية (HR Approval) إلزامي لكافة الطلبات</span>
                    <span className="text-[10px] text-slate-500 block">
                      يتحقق مسؤول HR من مطابقة الرصيد المتبقي وجدول البدلاء قبل الخروج الفعلي للإجازة.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: WPS & Attendance Sync */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">جاهزية التفعيل والمزامنة المباشرة (Live WPS & Attendance Sync):</strong>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    عند التفعيل، سيقوم النظام تلقائياً بربط أيام الإجازات المرضية المخصومة أو غير المدفوعة بكشوف مسيرات الرواتب (WPS) وسجلات الحضور والدوام.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.syncWithWpsPayroll}
                    onChange={(e) => handleFieldChange('syncWithWpsPayroll', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">المزامنة التلقائية مع كشوف مسيرات الرواتب (WPS Payroll Sync)</span>
                    <span className="text-[10px] text-slate-500 block">خصم أيام الغياب والإجازات غير المدفوعة تلقائياً من راتب الشهر المستحق.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={policy.syncWithAttendanceRoster}
                    onChange={(e) => handleFieldChange('syncWithAttendanceRoster', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">تحديث جدول المناوبات وبصمة الحضور تلقائياً</span>
                    <span className="text-[10px] text-slate-500 block">تسجيل الموظف كـ "في إجازة رسمية" تلقائياً ومنع تسجيل غياب غير مبرر له.</span>
                  </div>
                </label>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>ملخص اللائحة المفعلة (Active Leave Policy Summary):</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">الاستحقاق السنوي:</span>
                    <strong className="font-mono text-amber-300">{policy.annualDays} يوماً / سنة</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">المرضيات أجر كامل:</span>
                    <strong className="font-mono text-emerald-300">{policy.sickFullPayDays} يوماً الأولى</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">أقصى ترحيل:</span>
                    <strong className="font-mono text-blue-300">{policy.maxCarryoverDays} يوماً ({policy.maxCarryoverYears} سنة)</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">مستويات الاعتماد:</span>
                    <strong className="font-mono text-purple-300">{policy.approvalLevelsCount} مستويات</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-2 shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight size={16} />
              <span>السابق (Previous)</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>التالي (Next)</span>
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleSaveAndActivate}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Send size={15} />
              <span>اعتماد وتثبيت لائحة الإجازات رسمياً (Activate Leave Policy)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default LeavePolicyWizardModal;
