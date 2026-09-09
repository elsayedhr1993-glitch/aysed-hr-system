import React, { useState, useEffect } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Banknote, ShieldCheck, 
  Building2, CreditCard, DollarSign, FileText, AlertTriangle, 
  Calendar, Award, RefreshCw, Send, Sparkles, CheckCircle2, 
  Sliders, Users, Layers, Lock, Landmark
} from 'lucide-react';

export interface AllowanceCategory {
  id: string;
  name: string;
  isTaxable: boolean;
  isSubjectToPifss: boolean;
  defaultAmount: number;
}

export interface PayrollStructureData {
  // Step 1: Basic & Allowances Structure
  minBasicSalaryRatioPercent: number; // e.g. 60%
  allowances: AllowanceCategory[];

  // Step 2: PIFSS Social Security (Kuwaiti Employees Law)
  enablePifssDeductions: boolean;
  pifssEmployeePercent: number; // 11.5%
  pifssEmployerPercent: number; // 11.5%
  pifssMaxSalaryCap: number; // 2750 KWD

  // Step 3: WPS SIF File & Bank Integration
  wpsEmployerId: string;
  payerBankShortCode: string; // e.g., 'KFH'
  wpsPaymentDayOfMonth: number; // 28
  validateIbanStrictly: boolean;

  // Step 4: Daily Rate & Deduction Formula
  workingDaysPerMonth: number; // 26 or 30 days
  hourlyDivisor: number; // 8 hours
  autoDeductAbsenceDays: boolean;
  autoDeductUnpaidLeave: boolean;

  // Step 5: Payslip Branding & Security
  showCompanyStampOnPayslip: boolean;
  maskIbanOnPayslip: boolean;

  // Metadata
  isActivated: boolean;
  lastUpdated: string;
}

export const PAYROLL_STRUCTURE_STORAGE_KEY = 'payroll_master_structure_v1';

export const defaultPayrollStructure: PayrollStructureData = {
  minBasicSalaryRatioPercent: 60,
  allowances: [
    { id: '1', name: 'بدل سكن (Housing Allowance)', isTaxable: false, isSubjectToPifss: true, defaultAmount: 150 },
    { id: '2', name: 'بدل انتقال / سيارة (Transport)', isTaxable: false, isSubjectToPifss: false, defaultAmount: 50 },
    { id: '3', name: 'بدل طبيعة عمل (Nature of Work)', isTaxable: false, isSubjectToPifss: true, defaultAmount: 100 },
    { id: '4', name: 'بدل اتصال وموبايل (Mobile)', isTaxable: false, isSubjectToPifss: false, defaultAmount: 25 },
  ],

  enablePifssDeductions: true,
  pifssEmployeePercent: 11.5,
  pifssEmployerPercent: 11.5,
  pifssMaxSalaryCap: 2750,

  wpsEmployerId: 'KW-PAM-998811',
  payerBankShortCode: 'KFH',
  wpsPaymentDayOfMonth: 28,
  validateIbanStrictly: true,

  workingDaysPerMonth: 26,
  hourlyDivisor: 8,
  autoDeductAbsenceDays: true,
  autoDeductUnpaidLeave: true,

  showCompanyStampOnPayslip: true,
  maskIbanOnPayslip: true,

  isActivated: true,
  lastUpdated: new Date().toISOString(),
};

export const getPayrollMasterStructure = (): PayrollStructureData => {
  try {
    const raw = localStorage.getItem(PAYROLL_STRUCTURE_STORAGE_KEY);
    if (raw) {
      return { ...defaultPayrollStructure, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load payroll structure:', e);
  }
  return defaultPayrollStructure;
};

export const savePayrollMasterStructure = (structure: PayrollStructureData): PayrollStructureData => {
  try {
    const updated = { ...structure, lastUpdated: new Date().toISOString(), isActivated: true };
    localStorage.setItem(PAYROLL_STRUCTURE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('payroll_structure_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save payroll structure:', e);
    return structure;
  }
};

interface PayrollStructureWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (structure: PayrollStructureData) => void;
}

export const PayrollStructureWizardModal: React.FC<PayrollStructureWizardModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [structure, setStructure] = useState<PayrollStructureData>(defaultPayrollStructure);

  // New Allowance State
  const [newAllowanceName, setNewAllowanceName] = useState('');
  const [newAllowanceAmount, setNewAllowanceAmount] = useState<number>(50);

  useEffect(() => {
    if (isOpen) {
      setStructure(getPayrollMasterStructure());
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof PayrollStructureData, value: any) => {
    setStructure(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAllowance = () => {
    if (!newAllowanceName.trim()) return;
    const newCategory: AllowanceCategory = {
      id: Date.now().toString(),
      name: newAllowanceName.trim(),
      isTaxable: false,
      isSubjectToPifss: true,
      defaultAmount: newAllowanceAmount,
    };
    setStructure(prev => ({ ...prev, allowances: [...prev.allowances, newCategory] }));
    setNewAllowanceName('');
  };

  const handleRemoveAllowance = (id: string) => {
    setStructure(prev => ({ ...prev, allowances: prev.allowances.filter(a => a.id !== id) }));
  };

  const handleSaveAndActivate = () => {
    const saved = savePayrollMasterStructure(structure);
    if (onSaved) onSaved(saved);
    alert('✅ تم تثبيت واعتماد هيكل الرواتب ومسيرات WPS البنكية بنجاح!');
    onClose();
  };

  const steps = [
    { num: 1, title: 'هيكل الراتب والبدلات', desc: 'الأساسي وبدلات السكن والنقل' },
    { num: 2, title: 'التأمينات الاجتماعية PIFSS', desc: 'استقطاع العمالة الكويتية 11.5%' },
    { num: 3, title: 'ملف SIF ومسير WPS', desc: 'ربط البنوك والبنك المركزي' },
    { num: 4, title: 'معادلة اليومية والخصوم', desc: 'أجر اليوم = الشهر / 26' },
    { num: 5, title: 'الاعتماد وتصميم القسيمة', desc: 'قسيمة الراتب والختم الآلي' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Banknote className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>معالج تهيئة وتأسيس هيكل الأجور ومسيرات WPS</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Kuwait Central Bank WPS Standard
                </span>
              </h3>
              <p className="text-xs text-purple-200 font-medium">
                تثبيت عناصر الراتب، التأمينات الاجتماعية (PIFSS)، ملف SIF البنكي، ومعادلة الخصومات
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
                      ? 'bg-purple-900 text-white border-purple-950 shadow-sm'
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
                  <span className={`text-[9px] hidden sm:block ${isCurrent ? 'text-purple-200' : 'text-slate-400'}`}>
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 dir-rtl">

          {/* STEP 1: Basic & Allowances */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center justify-between text-purple-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Banknote size={16} className="text-[#714B67]" />
                  <span>الخطوة 1: حد الأحد للراتب الأساسي والبدلات المعتمدة بالمنشأة</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded-full">
                  Basic & Allowances
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">نسبة الراتب الأساسي من الإجمالي (%) *</label>
                  <input
                    type="number"
                    value={structure.minBasicSalaryRatioPercent}
                    onChange={(e) => handleFieldChange('minBasicSalaryRatioPercent', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">التوصية القانونية: لا يقل الأساسي عن 60% من إجمالي الراتب</span>
                </div>
              </div>

              {/* Allowances Builder */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900">البدلات الافتراضية المتاحة بمسير الراتب:</h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="اسم البدل (مثلاً: بدل هاتف)"
                    value={newAllowanceName}
                    onChange={(e) => setNewAllowanceName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="القيمة التقديرية (د.ك)"
                    value={newAllowanceAmount}
                    onChange={(e) => setNewAllowanceAmount(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllowance}
                    className="bg-purple-900 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-purple-950 cursor-pointer"
                  >
                    + إضافة بدل جديد
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {structure.allowances.map((allowance) => (
                    <div key={allowance.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span className="text-slate-800">{allowance.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          {allowance.defaultAmount} د.ك
                        </span>
                        <button type="button" onClick={() => handleRemoveAllowance(allowance.id)} className="text-rose-600 hover:text-rose-800">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PIFSS Social Security */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Landmark size={16} className="text-blue-700" />
                  <span>الخطوة 2: استقطاعات المؤسسة العامة للتأمينات الاجتماعية (PIFSS للعمالة الوطنية)</span>
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-950 px-2 py-0.5 rounded-full">
                  Kuwait PIFSS Law
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={structure.enablePifssDeductions}
                    onChange={(e) => handleFieldChange('enablePifssDeductions', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">تفعيل الخصم الآلي للتأمينات الاجتماعية للموظفين الكويتيين</span>
                    <span className="text-[10px] text-slate-500 block">تطبيق النسبة القانونية الحالية واستخراج تقرير PIFSS الشهري.</span>
                  </div>
                </label>

                {structure.enablePifssDeductions && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">نسبة خصم الموظف (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={structure.pifssEmployeePercent}
                        onChange={(e) => handleFieldChange('pifssEmployeePercent', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">11.5% تخصم من راتب الموظف</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">نسبة مساهمة الشركة (%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={structure.pifssEmployerPercent}
                        onChange={(e) => handleFieldChange('pifssEmployerPercent', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">11.5% تتحملها الشركة</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى للراتب الخاضع (د.ك)</label>
                      <input
                        type="number"
                        value={structure.pifssMaxSalaryCap}
                        onChange={(e) => handleFieldChange('pifssMaxSalaryCap', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">2,750 د.ك الحد الأقصى للتأمين</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: WPS SIF File */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-700" />
                  <span>الخطوة 3: إعدادات ملف SIF البنكي المحول لـ WPS ونظام الأجور</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  WPS SIF Integration
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">رمز المنشأة لدى البنك / الشؤون *</label>
                  <input
                    type="text"
                    value={structure.wpsEmployerId}
                    onChange={(e) => handleFieldChange('wpsEmployerId', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">رمز الملف المعتمد بوزارة الشؤون</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">البنك المحول الرئيسي (Payer Bank) *</label>
                  <select
                    value={structure.payerBankShortCode}
                    onChange={(e) => handleFieldChange('payerBankShortCode', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="KFH">بيت التمويل الكويتي (KFH)</option>
                    <option value="NBK">بنك الكويت الوطني (NBK)</option>
                    <option value="CBK">البنك التجاري الكويتي (CBK)</option>
                    <option value="BOUBYAN">بنك بوبيان (Boubyan)</option>
                    <option value="GULF">بنك الخليج (Gulf Bank)</option>
                    <option value="BURGAN">بنك برقان (Burgan Bank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">يوم صرف الأجور الشهري المعتمد *</label>
                  <input
                    type="number"
                    value={structure.wpsPaymentDayOfMonth}
                    onChange={(e) => handleFieldChange('wpsPaymentDayOfMonth', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">يوم 28 من كل شهر ميلادي</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Daily Rate Formula */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Sliders size={16} className="text-emerald-700" />
                  <span>الخطوة 4: معادلة أجر اليوم والساعة وقواعد استقطاع الغياب والخصوم</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                  Daily Rate Formula
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">المقام المعتمد لحساب أجر اليوم (Days Divisor) *</label>
                  <select
                    value={structure.workingDaysPerMonth}
                    onChange={(e) => handleFieldChange('workingDaysPerMonth', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value={26}>26 يوماً (أجر اليوم = الشهر / 26 - المعيار الكويتي الشائع)</option>
                    <option value={30}>30 يوماً (أجر اليوم = الشهر / 30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">ساعات الدوام لحساب أجر الساعة *</label>
                  <input
                    type="number"
                    value={structure.hourlyDivisor}
                    onChange={(e) => handleFieldChange('hourlyDivisor', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">8 ساعات عمل يومية كحد أقصى</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Payslip Branding */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">جاهزية التفعيل والربط مع كشوف مسيرات الأجور:</strong>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    سيقوم النظام الآن بتطبيق هذه القواعد والمعادلات آلياً على كشوف أجور جميع الموظفين وإصدار قسائم الراتب المعتمدة.
                  </p>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>ملخص هيكل الأجور ومسير WPS المعتمد:</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">الحد الأدنى للأساسي:</span>
                    <strong className="font-mono text-emerald-300">{structure.minBasicSalaryRatioPercent}% من الراتب</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">استقطاع PIFSS:</span>
                    <strong className="font-mono text-blue-300">{structure.pifssEmployeePercent}% موظف / {structure.pifssEmployerPercent}% شركة</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">البنك المحول:</span>
                    <strong className="font-mono text-amber-300">{structure.payerBankShortCode} (يوم {structure.wpsPaymentDayOfMonth})</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">معادلة أجر اليوم:</span>
                    <strong className="font-mono text-purple-300">الراتب / {structure.workingDaysPerMonth} يوماً</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
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
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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
              <span>اعتماد وتثبيت هيكل الأجور ومسير WPS رسمياً</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PayrollStructureWizardModal;
