import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Building2, ShieldCheck, 
  FileText, Upload, AlertTriangle, Calendar, Award, Flame, 
  Store, Send, Building, CheckCircle2
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, getCompaniesCollectionName } from '../../lib/firebase';
import { syncFacilityWizardDraft, syncTenantLicensesAndCompanyProfile } from '../../services/companyLicenseSync';

import type { FacilityLicenseData } from '../../types/facilityLicense';
import { createEmptyFacilityData } from '../../types/facilityLicense';

export type { FacilityLicenseData } from '../../types/facilityLicense';
export { createEmptyFacilityData } from '../../types/facilityLicense';

export const FACILITY_STORAGE_KEY = 'facility_master_licensing_v1';
const FACILITY_CONFIG_COLLECTION = 'system_config';
const FACILITY_DOC_PREFIX = 'facility_licensing_';

/** @deprecated use createEmptyFacilityData — kept for imports that expect a template object */
export const defaultFacilityData: FacilityLicenseData = createEmptyFacilityData();

function facilityFromCompanyRecord(data: Record<string, unknown>): Partial<FacilityLicenseData> {
  return {
    nameAr: String(data.nameAr || data.name || '').trim(),
    nameEn: String(data.nameEn || '').trim(),
    paciCivilId: String(data.civilIdCompany || data.civilId || data.paciNumber || '').trim(),
    logoUrl: String(data.logoUrl || data.logo || '').trim(),
    mohLicenseNo: String(data.mohLicense || '').trim(),
    pamFileCode: String(data.wsiCode || data.pamFileNumber || data.pam || '').trim(),
    authorizedSignatoryName: String(data.authorizedSignatory || data.managerName || '').trim(),
  };
}

const getFacilityDocId = (companyId?: string) => `${FACILITY_DOC_PREFIX}${companyId || 'global'}`;

const readFacilityFromLocalStorage = (companyId?: string): FacilityLicenseData => {
  const storageKey = companyId ? `${FACILITY_STORAGE_KEY}_${companyId}` : FACILITY_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return { ...createEmptyFacilityData(), ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load facility data:', e);
  }
  return createEmptyFacilityData();
};

export const getFacilityMasterData = async (companyId?: string): Promise<FacilityLicenseData> => {
  const base = createEmptyFacilityData();
  let fromCompany: Partial<FacilityLicenseData> = {};

  if (companyId) {
    try {
      const compSnap = await getDoc(doc(db, getCompaniesCollectionName(), companyId));
      if (compSnap.exists()) {
        fromCompany = facilityFromCompanyRecord(compSnap.data() as Record<string, unknown>);
      }
    } catch (e) {
      console.error('Failed to load company profile for facility wizard:', e);
    }
  }

  try {
    const snap = await getDoc(doc(db, FACILITY_CONFIG_COLLECTION, getFacilityDocId(companyId)));
    if (snap.exists()) {
      const fromDb = { ...base, ...fromCompany, ...(snap.data() as Partial<FacilityLicenseData>) };
      const storageKey = companyId ? `${FACILITY_STORAGE_KEY}_${companyId}` : FACILITY_STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(fromDb));
      return fromDb;
    }
  } catch (e) {
    console.error('Failed to load facility data from Firestore:', e);
  }

  const local = readFacilityFromLocalStorage(companyId);
  return { ...base, ...fromCompany, ...local };
};

export const saveFacilityMasterData = async (data: FacilityLicenseData, companyId?: string): Promise<FacilityLicenseData> => {
  try {
    const updated = { ...data, lastUpdated: new Date().toISOString(), isCompleted: true };
    await setDoc(doc(db, FACILITY_CONFIG_COLLECTION, getFacilityDocId(companyId)), updated, { merge: true });
    const storageKey = companyId ? `${FACILITY_STORAGE_KEY}_${companyId}` : FACILITY_STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (companyId) {
      await syncTenantLicensesAndCompanyProfile(companyId, [], updated, {
        persistFacilityMaster: true,
        markFacilityCompleted: true,
      });
    }

    return updated;
  } catch (e) {
    console.error('Failed to save facility data:', e);
    return data;
  }
};

interface FacilityLicensingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (data: FacilityLicenseData) => void;
  companyId?: string;
  /** يفتح تطبيق أرشيف المستندات → تراخيص المنشأة → نموذج إضافة ترخيص حر */
  onOpenCompanyLicenseArchive?: () => void;
}

export const FacilityLicensingWizardModal: React.FC<FacilityLicensingWizardModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  companyId,
  onOpenCompanyLicenseArchive: _onOpenCompanyLicenseArchive,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FacilityLicenseData>(createEmptyFacilityData());

  // New dept / device input state
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newDeviceInput, setNewDeviceInput] = useState('');
  const [newBranchInput, setNewBranchInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistLocalDraft = useCallback(
    (draft: FacilityLicenseData) => {
      const storageKey = companyId ? `${FACILITY_STORAGE_KEY}_${companyId}` : FACILITY_STORAGE_KEY;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            ...draft,
            lastUpdated: new Date().toISOString(),
            isCompleted: Boolean(draft.isCompleted),
          })
        );
      } catch (err) {
        console.error('Facility wizard local draft save failed:', err);
      }
    },
    [companyId]
  );

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const data = await getFacilityMasterData(companyId);
        setFormData(data);
        setCurrentStep(1);
      };
      loadData();
    }
  }, [isOpen, companyId]);

  useEffect(() => {
    if (!isOpen) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      persistLocalDraft(formData);
    }, 400);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [formData, isOpen, persistLocalDraft]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof FacilityLicenseData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDept = () => {
    if (!newDeptInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      mohApprovedDepts: [...prev.mohApprovedDepts, newDeptInput.trim()]
    }));
    setNewDeptInput('');
  };

  const handleRemoveDept = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mohApprovedDepts: prev.mohApprovedDepts.filter((_, i) => i !== index)
    }));
  };

  const handleAddDevice = () => {
    if (!newDeviceInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      mohSpecialDevices: [...prev.mohSpecialDevices, newDeviceInput.trim()]
    }));
    setNewDeviceInput('');
  };

  const handleRemoveDevice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mohSpecialDevices: prev.mohSpecialDevices.filter((_, i) => i !== index)
    }));
  };

  const handleAddBranch = () => {
    if (!newBranchInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      branchesList: [...prev.branchesList, newBranchInput.trim()]
    }));
    setNewBranchInput('');
  };

  const handleRemoveBranch = (index: number) => {
    setFormData(prev => ({
      ...prev,
      branchesList: prev.branchesList.filter((_, i) => i !== index)
    }));
  };

  const handleSaveAndActivate = async () => {
    setIsActivating(true);
    try {
      persistLocalDraft(formData);
      if (companyId) {
        await syncFacilityWizardDraft(companyId, formData);
      }
      const saved = await saveFacilityMasterData(formData, companyId);
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Facility activation failed:', err);
      alert('تعذر اعتماد الترخيص. راجع الاتصال وحاول مرة أخرى.');
    } finally {
      setIsActivating(false);
    }
  };

  const goToStep = (step: number) => {
    persistLocalDraft(formData);
    setCurrentStep(step);
  };

  const steps = [
    { num: 1, title: 'الهوية' },
    { num: 2, title: 'وزارة الصحة' },
    { num: 3, title: 'PAM / WPS' },
    { num: 4, title: 'السلامة والبلدية' },
    { num: 5, title: 'الاعتماد' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#714B67] via-[#5c3c54] to-purple-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Building2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">معالج تراخيص المنشأة</h3>
              <p className="text-[11px] text-purple-200/95 mt-0.5">هوية · MOH · PAM · سلامة · اعتماد نهائي</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Step Stepper Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 shrink-0">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {steps.map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => goToStep(step.num)}
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
                    <span className="font-bold text-[10px] sm:text-[11px] truncate max-w-[72px] sm:max-w-[100px]">
                      {step.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 dir-rtl">
          
          {/* STEP 1: Facility identity & logo (MOH medical — no commercial registry) */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Building size={15} className="text-[#714B67]" />
                الخطوة 1 — الهوية والشعار
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">اسم المنشأة الرسمي (بالعربية) *</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                    placeholder="مستوصف المنار الطبي"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">اسم المنشأة الرسمي (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                    placeholder="Al Manar Medical Center"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:border-[#714B67]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold text-xs mb-1">الرقم المدني للجهة / الرقم الآلي (PACI) *</label>
                  <input
                    type="text"
                    value={formData.paciCivilId}
                    onChange={(e) => handleFieldChange('paciCivilId', e.target.value)}
                    placeholder="988123049182"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900 focus:bg-white focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-slate-800 font-bold text-xs">الشعار الدائم للمنشأة (Company Logo):</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-purple-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-purple-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition">
                      <Upload size={14} />
                      <span>اختيار وتحميل صورة الشعار</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Main Branch & Branches List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">اسم الفرع الرئيسي *</label>
                  <input
                    type="text"
                    value={formData.mainBranchName}
                    onChange={(e) => handleFieldChange('mainBranchName', e.target.value)}
                    placeholder="الفرع الرئيسي - حولي"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">إضافة فروع أخرى التابعة للمنشأة</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBranchInput}
                      onChange={(e) => setNewBranchInput(e.target.value)}
                      placeholder="اسم الفرع الإضافي"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      className="bg-purple-800 text-white px-3 rounded-xl text-xs font-bold shrink-0 hover:bg-purple-900"
                    >
                      إضافة
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.branchesList.map((branch, i) => (
                      <span key={i} className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <span>{branch}</span>
                        <button type="button" onClick={() => handleRemoveBranch(i)} className="text-purple-600 hover:text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MOH Licensing */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Award size={15} className="text-emerald-700" />
                الخطوة 2 — ترخيص وزارة الصحة
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">رقم ترخيص المنشأة الطبية (MOH License) *</label>
                  <input
                    type="text"
                    value={formData.mohLicenseNo}
                    onChange={(e) => handleFieldChange('mohLicenseNo', e.target.value)}
                    placeholder="MOH-KW-2024-998"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">تاريخ إصدار الترخيص</label>
                  <input
                    type="date"
                    value={formData.mohStartDate}
                    onChange={(e) => handleFieldChange('mohStartDate', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">تاريخ انتهاء ترخيص MOH *</label>
                  <input
                    type="date"
                    value={formData.mohExpiryDate}
                    onChange={(e) => handleFieldChange('mohExpiryDate', e.target.value)}
                    className="w-full bg-white border-2 border-emerald-400 rounded-xl p-2 text-xs font-bold font-mono text-emerald-950"
                  />
                </div>
              </div>

              {/* Approved Medical Departments */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold text-xs">الأقسام والخدمات الطبية المصرح بها من وزارة الصحة:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    placeholder="مثل: قسم الأسنان، الجلدية، الأشعة..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddDept}
                    className="bg-emerald-700 text-white px-4 rounded-xl text-xs font-bold hover:bg-emerald-800 shrink-0"
                  >
                    + إضافة قسم
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.mohApprovedDepts.map((dept, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>✓ {dept}</span>
                      <button type="button" onClick={() => handleRemoveDept(i)} className="text-emerald-700 hover:text-rose-700 font-black">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Devices (Radiation, Laser) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold text-xs">تراخيص الأجهزة والتقنيات الخاصة (أشعة / ليـزر):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeviceInput}
                    onChange={(e) => setNewDeviceInput(e.target.value)}
                    placeholder="اسم الجهاز أو الترخيص الخاص"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddDevice}
                    className="bg-teal-700 text-white px-4 rounded-xl text-xs font-bold hover:bg-teal-800 shrink-0"
                  >
                    + إضافة جهاز
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.mohSpecialDevices.map((dev, i) => (
                    <span key={i} className="bg-teal-100 text-teal-900 border border-teal-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <span>⚡ {dev}</span>
                      <button type="button" onClick={() => handleRemoveDevice(i)} className="text-teal-700 hover:text-rose-700 font-black">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAM & Labor Files */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileText size={15} className="text-blue-700" />
                الخطوة 3 — PAM و WPS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">رمز ملف المنشأة لدى القوى العاملة (PAM File Code) *</label>
                  <input
                    type="text"
                    value={formData.pamFileCode}
                    onChange={(e) => handleFieldChange('pamFileCode', e.target.value)}
                    placeholder="PAM-7788192"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">اسم المفوض بالتوقيع لدى PAM *</label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryName}
                    onChange={(e) => handleFieldChange('authorizedSignatoryName', e.target.value)}
                    placeholder="الاسم كما في ملف PAM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الرقم المدني للمفوض بالتوقيع</label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryCivilId}
                    onChange={(e) => handleFieldChange('authorizedSignatoryCivilId', e.target.value)}
                    placeholder="285091204918"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">رمز البنك الرئيسي لمسيرات الأجور (WPS Bank Code)</label>
                  <input
                    type="text"
                    value={formData.wpsBankCode}
                    onChange={(e) => handleFieldChange('wpsBankCode', e.target.value)}
                    placeholder="NBK-KW-001"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Fire Force & Municipality */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Flame size={15} className="text-amber-700" />
                الخطوة 4 — الإطفاء والبلدية
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fire Force */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                    <Flame size={16} className="text-rose-600" />
                    <span>ترخيص قوة الإطفاء العام (KFF)</span>
                  </h5>
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">رقم ترخيص الإطفاء</label>
                    <input
                      type="text"
                      value={formData.kffLicenseNo}
                      onChange={(e) => handleFieldChange('kffLicenseNo', e.target.value)}
                      placeholder="KFF-2024-4410"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">تاريخ انتهاء ترخيص الإطفاء *</label>
                    <input
                      type="date"
                      value={formData.kffExpiryDate}
                      onChange={(e) => handleFieldChange('kffExpiryDate', e.target.value)}
                      className="w-full bg-white border-2 border-amber-400 rounded-lg p-2 text-xs font-bold font-mono text-amber-950"
                    />
                  </div>
                </div>

                {/* Baladiya */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                    <Store size={16} className="text-indigo-600" />
                    <span>ترخيص البلدية والإعلانات (Kuwait Municipality)</span>
                  </h5>
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">رقم ترخيص البلدية</label>
                    <input
                      type="text"
                      value={formData.baladiyaLicenseNo}
                      onChange={(e) => handleFieldChange('baladiyaLicenseNo', e.target.value)}
                      placeholder="BAL-KW-88391"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">تاريخ انتهاء ترخيص البلدية *</label>
                    <input
                      type="date"
                      value={formData.baladiyaExpiryDate}
                      onChange={(e) => handleFieldChange('baladiyaExpiryDate', e.target.value)}
                      className="w-full bg-white border-2 border-indigo-400 rounded-lg p-2 text-xs font-bold font-mono text-indigo-950"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Activation */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600" />
                الخطوة 5 — مراجعة قبل الاعتماد
              </h4>

              {/* Review Summary Cards */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-[#714B67]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-[#714B67]">{formData.nameAr}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{formData.nameEn}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    جاهز للاعتماد النهائي
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">الرقم المدني / PACI:</span>
                    <strong className="font-mono text-slate-800">{formData.paciCivilId || '—'}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ترخيص الصحة MOH:</span>
                    <strong className="font-mono text-emerald-800">{formData.mohLicenseNo}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ملف القوى العاملة PAM:</span>
                    <strong className="font-mono text-blue-800">{formData.pamFileCode}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">ترخيص الإطفاء KFF:</span>
                    <strong className="font-mono text-amber-800">{formData.kffLicenseNo}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-bold block mb-1">الأقسام الطبية المعتمدة ({formData.mohApprovedDepts.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.mohApprovedDepts.map((d, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] text-slate-700 font-bold">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-2 shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => goToStep(currentStep - 1)}
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
              type="button"
              onClick={() => goToStep(currentStep + 1)}
              className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#5c3c54] text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>التالي (Next)</span>
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSaveAndActivate()}
              disabled={isActivating}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              <Send size={15} />
              <span>
                {isActivating
                  ? 'جاري الاعتماد والمزامنة...'
                  : 'اعتماد وتفعيل ترخيص المنشأة رسمياً'}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default FacilityLicensingWizardModal;
