import React, { useState, useEffect } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Scale, ShieldCheck, 
  Building2, DollarSign, FileText, AlertTriangle, Calendar, 
  Award, RefreshCw, Send, Sparkles, CheckCircle2, Sliders, 
  Users, Layers, Lock, FileCheck, Landmark, Shield
} from 'lucide-react';

export interface EosPolicyData {
  // Step 1: Article 51 Indemnity Standard
  daysPerYearFirst5Years: number; // 15 days
  daysPerYearAfter5Years: number; // 30 days
  maxIndemnityCapMonths: number; // 18 months (1.5 years)
  salaryBasisType: 'GROSS' | 'BASIC'; // GROSS is Kuwait Law Art 51 standard

  // Step 2: Article 53 Resignation Entitlement Scale
  under2YearsPercent: number; // 0%
  from2To5YearsPercent: number; // 33.33%
  from5To10YearsPercent: number; // 66.66%
  over10YearsPercent: number; // 100%
  termByCompanyEntitlementPercent: number; // 100%

  // Step 3: Deductions & Debts Offsetting
  autoDeductOutstandingLoans: boolean;
  autoDeductUnreturnedCustody: boolean;
  autoDeductUnpaidLeaveBalance: boolean; // Add cashout for unused leave

  // Step 4: Clearance Workflow Signoffs
  requireItClearance: boolean;
  requireFinanceClearance: boolean;
  requireHrClearance: boolean;
  requireLineManagerClearance: boolean;

  // Metadata
  isActivated: boolean;
  lastUpdated: string;
}

export const EOS_POLICY_STORAGE_KEY = 'eos_master_policy_v1';

export const defaultEosPolicy: EosPolicyData = {
  daysPerYearFirst5Years: 15,
  daysPerYearAfter5Years: 30,
  maxIndemnityCapMonths: 18,
  salaryBasisType: 'GROSS',

  under2YearsPercent: 0,
  from2To5YearsPercent: 33.33,
  from5To10YearsPercent: 66.66,
  over10YearsPercent: 100,
  termByCompanyEntitlementPercent: 100,

  autoDeductOutstandingLoans: true,
  autoDeductUnreturnedCustody: true,
  autoDeductUnpaidLeaveBalance: true,

  requireItClearance: true,
  requireFinanceClearance: true,
  requireHrClearance: true,
  requireLineManagerClearance: true,

  isActivated: true,
  lastUpdated: new Date().toISOString(),
};

export const getEosMasterPolicy = (): EosPolicyData => {
  try {
    const raw = localStorage.getItem(EOS_POLICY_STORAGE_KEY);
    if (raw) {
      return { ...defaultEosPolicy, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load EOS policy:', e);
  }
  return defaultEosPolicy;
};

export const saveEosMasterPolicy = (policy: EosPolicyData): EosPolicyData => {
  try {
    const updated = { ...policy, lastUpdated: new Date().toISOString(), isActivated: true };
    localStorage.setItem(EOS_POLICY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('eos_policy_updated'));
    return updated;
  } catch (e) {
    console.error('Failed to save EOS policy:', e);
    return policy;
  }
};

interface EosSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (policy: EosPolicyData) => void;
}

export const EosSetupWizardModal: React.FC<EosSetupWizardModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [policy, setPolicy] = useState<EosPolicyData>(defaultEosPolicy);

  useEffect(() => {
    if (isOpen) {
      setPolicy(getEosMasterPolicy());
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof EosPolicyData, value: any) => {
    setPolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAndActivate = () => {
    const saved = saveEosMasterPolicy(policy);
    if (onSaved) onSaved(saved);
    alert('✅ تم اعتماد وتثبيت لائحة وحاسبة مكافأة نهاية الخدمة والتسويات رسمياً!');
    onClose();
  };

  const steps = [
    { num: 1, title: 'المادة 51 (مكافأة الخدمة)', desc: '15 يوماً للأولى وشهر للبعدها' },
    { num: 2, title: 'المادة 53 (سلم الاستقالة)', desc: 'تدرج النسب 0% إلى 100%' },
    { num: 3, title: 'خصم السلف والعهد', desc: 'تسوية الديون والالتزامات' },
    { num: 4, title: 'إخلاء الطرف وبراءة الذمة', desc: 'اعتماد IT والمالية وHR' },
    { num: 5, title: 'الاعتماد وتثبيت المحرك', desc: 'تفعيل حاسبة التسويات' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Scale className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>معالج تهيئة وتثبيت حاسبة مكافأة نهاية الخدمة والتسويات</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Kuwait Labor Law 6/2010 Arts 51 & 53
                </span>
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                تثبيت معادلات مكافأة الخدمة، سلم الاستقالة، خصم السلف والعهد، وبراءة الذمة
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
                      ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm'
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

        {/* Wizard Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 dir-rtl">

          {/* STEP 1: Article 51 Formula */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Scale size={16} className="text-emerald-700" />
                  <span>الخطوة 1: قاعدة حساب مكافأة نهاية الخدمة (المادة 51 من قانون العمل)</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                  Article 51 Standard
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">أيام المكافأة للسنوات الـ 5 الأولى *</label>
                  <input
                    type="number"
                    value={policy.daysPerYearFirst5Years}
                    onChange={(e) => handleFieldChange('daysPerYearFirst5Years', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">15 يوماً عن كل سنة من السنوات الـ 5 الأولى</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">أيام المكافأة للسنوات التالية للـ 5 *</label>
                  <input
                    type="number"
                    value={policy.daysPerYearAfter5Years}
                    onChange={(e) => handleFieldChange('daysPerYearAfter5Years', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">أجر شهر كامل (30 يوماً) عن كل سنة بعد الـ 5</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى للمكافأة (أشهر) *</label>
                  <input
                    type="number"
                    value={policy.maxIndemnityCapMonths}
                    onChange={(e) => handleFieldChange('maxIndemnityCapMonths', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">18 شهراً (أجر سنة ونصف كحد أقصى)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-slate-700 font-bold text-xs mb-1">الأجر المعتمد للعملية الحسابية (Salary Basis):</label>
                <div className="flex items-center gap-4 text-xs font-bold pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salaryBasis"
                      checked={policy.salaryBasisType === 'GROSS'}
                      onChange={() => handleFieldChange('salaryBasisType', 'GROSS')}
                      className="text-emerald-600"
                    />
                    <span>الأجر الإجمالي الشامل (Gross Salary - المعيار القانوني الكويتي)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salaryBasis"
                      checked={policy.salaryBasisType === 'BASIC'}
                      onChange={() => handleFieldChange('salaryBasisType', 'BASIC')}
                      className="text-emerald-600"
                    />
                    <span>الراتب الأساسي فقط (Basic Salary)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Article 53 Scale */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Award size={16} className="text-amber-700" />
                  <span>الخطوة 2: سلم استحقاق الاستقالة (تدرج المادة 53 من قانون العمل)</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  Article 53 Resignation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-800 block">خدمة أقل من سنتين</span>
                  <input
                    type="number"
                    value={policy.under2YearsPercent}
                    onChange={(e) => handleFieldChange('under2YearsPercent', Number(e.target.value))}
                    className="w-full bg-white border border-rose-300 rounded-lg p-1.5 text-center font-bold font-mono text-rose-950 mt-1"
                  />
                  <span className="text-[9px] text-rose-600 block text-center mt-1">0% (لا يستحق مكافأة)</span>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 block">من 2 إلى 5 سنوات</span>
                  <input
                    type="number"
                    step="0.01"
                    value={policy.from2To5YearsPercent}
                    onChange={(e) => handleFieldChange('from2To5YearsPercent', Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-center font-bold font-mono text-amber-950 mt-1"
                  />
                  <span className="text-[9px] text-amber-600 block text-center mt-1">33.33% (ثلث المكافأة)</span>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 block">من 5 إلى 10 سنوات</span>
                  <input
                    type="number"
                    step="0.01"
                    value={policy.from5To10YearsPercent}
                    onChange={(e) => handleFieldChange('from5To10YearsPercent', Number(e.target.value))}
                    className="w-full bg-white border border-blue-300 rounded-lg p-1.5 text-center font-bold font-mono text-blue-950 mt-1"
                  />
                  <span className="text-[9px] text-blue-600 block text-center mt-1">66.66% (ثلثا المكافأة)</span>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 block">أكثر من 10 سنوات</span>
                  <input
                    type="number"
                    value={policy.over10YearsPercent}
                    onChange={(e) => handleFieldChange('over10YearsPercent', Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-center font-bold font-mono text-emerald-950 mt-1"
                  />
                  <span className="text-[9px] text-emerald-600 block text-center mt-1">100% (المكافأة كاملة)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Deductions & Debts Offsetting */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-700" />
                  <span>الخطوة 3: قواعد خصم الديون والعهد والخصومات المتبقية (Debts & Offsetting)</span>
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-950 px-2 py-0.5 rounded-full">
                  Debts & Deductions
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.autoDeductOutstandingLoans}
                    onChange={(e) => handleFieldChange('autoDeductOutstandingLoans', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">خصم أقساط السلف والديون المتبقية من صافي مكافأة نهاية الخدمة</span>
                    <span className="text-[10px] text-slate-500 block">تسوية أوتوماتيكية لرصيد السلف غير المسددة.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={policy.autoDeductUnreturnedCustody}
                    onChange={(e) => handleFieldChange('autoDeductUnreturnedCustody', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">خصم قيمة العُهد العينية والمعدات غير المسلمة (Custody Offsetting)</span>
                    <span className="text-[10px] text-slate-500 block">ربط قائمة العهد (أجهزة، سيارات) بكشف التسوية النهائية.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={policy.autoDeductUnpaidLeaveBalance}
                    onChange={(e) => handleFieldChange('autoDeductUnpaidLeaveBalance', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">صرف بديل الإجازات السنوية المتبقية نقداً (Leave Cashout)</span>
                    <span className="text-[10px] text-slate-500 block">إضافة أجر الأيام المتبقية من الإجازة السنوية لمستحقات نهاية الخدمة.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Clearance Workflow Signoffs */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center justify-between text-purple-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <FileCheck size={16} className="text-[#714B67]" />
                  <span>الخطوة 4: نموذج ودورة اعتماد براءة الذمة وإخلاء الطرف (Clearance Signoffs)</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded-full">
                  Clearance Workflow
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900">توقيعات واعتمادات الأقسام المطلوبة لإنهاء التسوية:</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.requireItClearance}
                      onChange={(e) => handleFieldChange('requireItClearance', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-slate-800">إخلاء طرف قسم تكنولوجيا المعلومات (IT Devices & Email)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.requireFinanceClearance}
                      onChange={(e) => handleFieldChange('requireFinanceClearance', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-slate-800">إخلاء طرف الإدارة المالية (Loans & Advances)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.requireHrClearance}
                      onChange={(e) => handleFieldChange('requireHrClearance', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-slate-800">إخلاء طرف الموارد البشرية (Residency Cancel & PAM)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.requireLineManagerClearance}
                      onChange={(e) => handleFieldChange('requireLineManagerClearance', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="font-bold text-slate-800">إخلاء طرف المسؤول المباشر (Handover Tasks)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Master Activation */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">جاهزية التفعيل وتثبيت حاسبة التسويات الرسمية:</strong>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    سيقوم النظام بربط هذه المعادلات تلقائياً بكشوف التسويات النهائية والطباعة الرسمية لإخلاء الطرف.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>ملخص قواعد حاسبة نهاية الخدمة والتسويات:</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">السنوات الـ 5 الأولى:</span>
                    <strong className="font-mono text-emerald-300">{policy.daysPerYearFirst5Years} يوماً / سنة</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">السنوات التالية:</span>
                    <strong className="font-mono text-blue-300">{policy.daysPerYearAfter5Years} يوماً / سنة</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">حد الأقصى للمكافأة:</span>
                    <strong className="font-mono text-amber-300">{policy.maxIndemnityCapMonths} شهراً (سنة ونصف)</strong>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">سلم الاستقالة:</span>
                    <strong className="font-mono text-purple-300">0% إلى {policy.over10YearsPercent}%</strong>
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
              className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
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
              <span>اعتماد وتثبيت حاسبة مكافأة نهاية الخدمة رسمياً</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default EosSetupWizardModal;
