import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Printer, 
  Save, 
  Trash2, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  User,
  CreditCard,
  Plane,
  FileSpreadsheet,
  Check,
  Upload,
  Eye,
  Download,
  Plus,
  CheckSquare,
  Square,
  FileCheck,
  Stethoscope,
  HeartPulse,
  FileSignature,
  FolderArchive,
  RefreshCw,
  X,
  ExternalLink,
  Paperclip,
  Edit3,
  Undo2,
  Phone,
  Mail,
  MapPin,
  Landmark,
  BadgeCheck
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { triggerContractRunningLeaveAllocation } from '../../utils/contractLeaveTrigger';
import { TabDocumentScanner } from '../TabDocumentScanner';
import { getCarriedOverBalance, calculate2026AccruedDays, getGlobalCompensatoryDays } from '../../utils/kuwaitLaw';
import { buildEmployeeBaselineAllocations, computeFifoLeaveAllocations } from '../../services/leaveService';

interface Props {
  employee: any;
  onSave: (updatedEmployee: any) => Promise<void>;
  onBack: () => void;
  onDelete?: (id: string, name: string) => void;
  onTriggerPrint: (title: string, data: any) => void;
  onOpenPamModal: () => void;
  activeCompany?: any;
}

export const OdooEmployeeDetailView: React.FC<Props> = ({
  employee: initialEmployee,
  onSave,
  onBack,
  onDelete,
  onTriggerPrint,
  onOpenPamModal,
  activeCompany
}) => {
  const { companies, activeCompany: contextActiveCompany } = useCompany();
  const [employee, setEmployee] = useState<any>(() => {
    const base = { ...initialEmployee };
    // محاولة ربط خطة التعيين المحفوظة ديناميكياً إذا لم تكن مسجلة في الموظف مسبقاً
    try {
      if (typeof window !== 'undefined') {
        const savedPlans = localStorage.getItem('odoo_onboarding_plans_v1');
        if (savedPlans) {
          const plansList = JSON.parse(savedPlans);
          const matchedPlan = plansList.find((p: any) => 
            (base.onboardingPlanId && p.id === base.onboardingPlanId) ||
            (base.id && p.employeeId === base.id) ||
            (base.civilId && p.civilId && p.civilId === base.civilId && p.civilId !== 'غير محدد') ||
            (base.nameAr && p.employeeName && p.employeeName === base.nameAr)
          );
          if (matchedPlan) {
            if (!base.legalChecklist && matchedPlan.legalChecklist) {
              base.legalChecklist = matchedPlan.legalChecklist;
            }
            if (!base.requiredDocuments && matchedPlan.requiredDocuments) {
              base.requiredDocuments = matchedPlan.requiredDocuments;
            }
            if (!base.custodyItems && matchedPlan.custodyItems) {
              base.custodyItems = matchedPlan.custodyItems;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error auto-syncing onboarding plan with employee:', e);
    }
    return base;
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'work' | 'private' | 'documents' | 'hr'>('work');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // تحديث بيانات الموظف عند تغير الـ initialEmployee
  useEffect(() => {
    if (initialEmployee) {
      setEmployee((prev: any) => ({ ...initialEmployee, ...prev }));
    }
  }, [initialEmployee?.id]);

  // تحديد اسم المنشأة الفعلي التابع لها الموظف
  const matchedCompany = companies.find(c => c.id === (employee.companyId || employee.company_id)) || activeCompany || contextActiveCompany;
  const displayCompanyName = matchedCompany?.nameAr || matchedCompany?.name || 'المنار كلينك';

  // Quick calculations for wages
  const basicSalary = parseFloat(employee.basicSalary || employee.salary || 0);
  const housingAllowance = parseFloat(employee.housingAllowance || 0);
  const transportAllowance = parseFloat(employee.transportAllowance || 0);
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0);
  const otherAllowance = parseFloat(employee.allowances || employee.otherAllowance || 0);
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;

  // Daily wage according to Kuwait Labor Law (26 work days)
  const dailyWage = totalSalary > 0 ? (totalSalary / 26) : 0;

  // Dynamic Time Off Balance Calculation using the core Leave Engine and kuwaitLaw
  const getDynamicBalance = () => {
    try {
      if (typeof window === 'undefined') return 30;

      // 1. Fetch live requests and allocations from standard localStorage keys
      const rawRequests = localStorage.getItem('odoo_leave_requests_v2');
      const rawAllocations = localStorage.getItem('odoo_leave_allocations_v2');

      const requestsList = rawRequests ? JSON.parse(rawRequests) : [];
      const allocationsList = rawAllocations ? JSON.parse(rawAllocations) : [];

      // 2. Map and parse allocations to match HrLeaveAllocation structure
      const mappedAllocations = allocationsList.map((a: any) => ({
        ...a,
        numberOfDays: a.days,
        allocationType: 'regular',
        state: 'validate',
        name: a.notes,
        dateFrom: a.allocationDate
      }));

      // 3. Use the core engine to build baseline allocations including 2025 carried over and 2026 accrued
      const empAllocs = buildEmployeeBaselineAllocations(employee as any, mappedAllocations as any);
      const fifoResult = computeFifoLeaveAllocations(employee as any, empAllocs, requestsList as any);

      const totalOpening = fifoResult.allocations.filter(a => a.allocationType === 'regular').reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalAccrued = fifoResult.allocations.filter(a => a.allocationType === 'accrual' && !a.name?.includes('تعويضي') && !a.name?.includes('بديل') && !a.name?.includes('عطلة')).reduce((s, a) => s + (a.numberOfDays || 0), 0);
      const totalCompensatory = getGlobalCompensatoryDays(employee as any);

      const carried = totalOpening;
      const earned = totalAccrued + totalCompensatory;
      const consumed = fifoResult.totalConsumed;
      const available = Math.max(0, (carried + earned) - consumed);

      return available;
    } catch (err) {
      console.error('Failed to compute dynamic balance in detail view:', err);
      // Fallback to simpler lookup
      const carriedVal = getCarriedOverBalance(employee);
      return Math.max(0, carriedVal + 30);
    }
  };

  const calculatedBalance = getDynamicBalance();

  // Contract status
  const contractStatus = employee.contractStatus || employee.status || 'ساري';
  const isContractRunning = String(contractStatus).toLowerCase() === 'running' || 
                            String(contractStatus).toLowerCase() === 'active' || 
                            contractStatus === 'ساري';

  // Check if medical staff to show conditional MOH fields
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
                         (employee.jobTitle || '').includes('طبيب') || 
                         (employee.jobTitle || '').includes('ممرض') ||
                         (employee.jobTitle || '').includes('دكتور');

  // Document Management & Dynamic Binding State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    url: string;
    fileType: string;
  } | null>(null);

  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newCustomDoc, setNewCustomDoc] = useState({
    title: '',
    category: 'مؤهل علمي وشهادات',
    notes: ''
  });

  // Dynamic Legal Documents Checklist (Inherited from Onboarding Plan or Defaults)
  const requiredChecklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: isMedicalStaff || (employee.dept || employee.department) === 'الأطباء',
    medicalFitness: true,
    signedContract: true,
    ...(employee.legalChecklist || {}),
    ...(employee.requiredDocuments ? Object.fromEntries(employee.requiredDocuments.map((k: string) => [k, true])) : {})
  };

  const handleToggleDocRequirement = (docKey: string) => {
    const updated = { ...requiredChecklist, [docKey]: !requiredChecklist[docKey] };
    const updatedReqList = Object.entries(updated).filter(([_, v]) => v).map(([k]) => k);
    setEmployee((prev: any) => ({
      ...prev,
      legalChecklist: updated,
      requiredDocuments: updatedReqList
    }));
  };

  const handleDocFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>, customTitle?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const fileInfo = {
        name: file.name,
        url: base64Url,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().slice(0, 10),
        title: customTitle || docKey,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        status: 'verified'
      };

      setEmployee((prev: any) => {
        const currentFiles = prev.documentFiles || {};
        return {
          ...prev,
          documentFiles: {
            ...currentFiles,
            [docKey]: fileInfo
          }
        };
      });

      import('react-hot-toast').then(m => m.default.success(`تم حفظ وإرفاق مستند (${file.name}) بنجاح.`));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveDocFile = (docKey: string) => {
    setEmployee((prev: any) => {
      const currentFiles = { ...(prev.documentFiles || {}) };
      delete currentFiles[docKey];
      return {
        ...prev,
        documentFiles: currentFiles
      };
    });
    import('react-hot-toast').then(m => m.default.success('تم حذف المرفق بنجاح.'));
  };

  const handleAddCustomDocument = () => {
    if (!newCustomDoc.title.trim()) return;
    const docKey = `custom_${Date.now()}`;
    const updatedChecklist = { ...requiredChecklist, [docKey]: true };
    const updatedCustomList = [
      ...(employee.customDocuments || []),
      {
        id: docKey,
        title: newCustomDoc.title.trim(),
        category: newCustomDoc.category,
        notes: newCustomDoc.notes
      }
    ];
    
    setEmployee((prev: any) => ({
      ...prev,
      legalChecklist: updatedChecklist,
      customDocuments: updatedCustomList
    }));

    const addedTitle = newCustomDoc.title;
    setNewCustomDoc({
      title: '',
      category: 'مؤهل علمي وشهادات',
      notes: ''
    });
    setShowAddCustomModal(false);
    import('react-hot-toast').then(m => m.default.success(`تمت إضافة خانة (${addedTitle}) إلى وثائق الموظف.`));
  };

  const handleFieldChange = (field: string, value: any) => {
    setEmployee((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleOcrResult = (scannedData: any, docType: string) => {
    setEmployee((prev: any) => {
      const updated = { ...prev };
      if (docType === 'civil_id') {
        if (scannedData.civil_id || scannedData.civilId) updated.civil_id_number = scannedData.civil_id || scannedData.civilId;
        if (scannedData.full_name || scannedData.fullNameAr || scannedData.nameAr) updated.nameAr = scannedData.full_name || scannedData.fullNameAr || scannedData.nameAr;
        if (scannedData.nationality) updated.nationality = scannedData.nationality;
        if (scannedData.gender) {
          updated.gender = (scannedData.gender.toLowerCase().includes('female') || scannedData.gender.includes('أنثى')) ? 'أنثى - Female' : 'ذكر - Male';
        }
        if (scannedData.birth_date || scannedData.birthDate || scannedData.dob) updated.birthDate = scannedData.birth_date || scannedData.birthDate || scannedData.dob;
        if (scannedData.expiry_date || scannedData.civil_id_expiry || scannedData.expiryDate) updated.civilIdExpiry = scannedData.expiry_date || scannedData.civil_id_expiry || scannedData.expiryDate;
      } else if (docType === 'passport') {
        if (scannedData.passport_no || scannedData.passportNo) updated.passportNo = scannedData.passport_no || scannedData.passportNo;
        if (scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate) updated.passportExpiry = scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate;
        const nameEn = scannedData.name_en || scannedData.fullNameEn || scannedData.nameEn;
        if (!updated.nameEn && nameEn) updated.nameEn = nameEn;
      } else if (docType === 'medical_license') {
        if (scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense) updated.mohLicense = scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense;
        if (scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry) updated.mohLicenseExpiry = scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry;
        if (scannedData.license_title || scannedData.profession || scannedData.jobTitle || scannedData.specialty) updated.specialty = scannedData.license_title || scannedData.profession || scannedData.jobTitle || scannedData.specialty;
      } else if (docType === 'work_permit') {
        if (scannedData.work_permit_no || scannedData.pam_no || scannedData.documentNumber) updated.workPermitNo = scannedData.work_permit_no || scannedData.pam_no || scannedData.documentNumber;
        if (scannedData.work_permit_start || scannedData.pam_start || scannedData.pamStartDate) updated.contractStartDate = scannedData.work_permit_start || scannedData.pam_start || scannedData.pamStartDate;
        if (scannedData.work_permit_end || scannedData.pam_end || scannedData.pamEndDate || scannedData.expiry_date || scannedData.expiryDate) updated.contractEndDate = scannedData.work_permit_end || scannedData.pam_end || scannedData.pamEndDate || scannedData.expiry_date || scannedData.expiryDate;
        if (scannedData.salary || scannedData.basic_salary || scannedData.basicSalary) updated.basicSalary = scannedData.salary || scannedData.basic_salary || scannedData.basicSalary;
        if (scannedData.profession || scannedData.job_title || scannedData.jobTitle) updated.jobTitle = scannedData.profession || scannedData.job_title || scannedData.jobTitle;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-trigger leave allocation if contract is active/running
      if (isContractRunning && employee.id) {
        triggerContractRunningLeaveAllocation({
          employeeId: employee.id,
          employeeName: employee.nameAr || employee.fullNameAr,
          startDate: employee.hireDate || employee.contractStartDate || '2026-01-01',
          contractStatus: 'running',
          companyId: employee.companyId || activeCompany?.id
        });
      }

      await onSave({
        ...employee,
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        allowances: otherAllowance,
        totalSalary
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-right font-sans text-slate-900" dir="rtl">
      
      {/* Top Breadcrumbs & Control Bar */}
      <div className="bg-white border border-slate-300 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#714B67] hover:text-[#5a3b52] hover:bg-purple-50 px-2.5 py-1.5 rounded-lg border border-[#714B67]/30 transition"
          >
            <ArrowRight size={16} />
            <span>العودة لدليل الموظفين</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-black">{employee.nameAr || employee.fullNameAr || 'ملف موظف جديد'}</span>
          <span className="font-mono bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-xs font-bold">{employee.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Check size={14} /> تم الحفظ بنجاح
            </span>
          )}

          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmployee({ ...initialEmployee });
                  setIsEditMode(false);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Undo2 size={15} />
                <span>إلغاء التعديل</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Edit3 size={15} />
              <span>تعديل الملف (Edit)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onTriggerPrint(`ملف الموظف الشامل - ${employee.nameAr || employee.id}`, employee)}
            className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={15} className="text-[#714B67]" />
            <span>طباعة الملف (A4)</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="طباعة كشف رصيد الإجازات المعتمد والمستحق للموظف"
          >
            <Printer size={15} className="text-emerald-700 animate-pulse" />
            <span>طباعة كشف الإجازات</span>
          </button>

          {onDelete && employee.id && (
            <button
              type="button"
              onClick={() => onDelete(employee.id, employee.nameAr)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="حذف الموظف"
            >
              <Trash2 size={15} />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Employee Card & Smart Buttons */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Profile Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${employee.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0 overflow-hidden relative`}>
              {employee.avatarUrl ? (
                <img src={employee.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                (employee.nameAr || employee.fullNameAr || 'م').slice(0, 2)
              )}
            </div>

            <div className="space-y-1.5">
              {isEditMode && (
                <div className="mb-2 flex items-center gap-2">
                  <label className="cursor-pointer px-2.5 py-1 bg-[#714B67] text-white rounded text-xs font-bold hover:bg-[#5a3a52] transition flex items-center gap-1">
                    <span>📷 ارفاق صورة شخصية</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvt) => {
                            handleFieldChange('avatarUrl', uploadEvt.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {employee.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('avatarUrl', '')}
                      className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold hover:bg-rose-200 transition"
                    >
                      حذف الصورة
                    </button>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.nameAr || ''}
                    onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                    placeholder="اسم الموظف بالعربية"
                    className="text-xl font-black text-slate-900 border border-purple-300 focus:border-[#714B67] rounded-lg px-2 py-0.5 bg-purple-50/40 focus:outline-none transition"
                  />
                ) : (
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{employee.nameAr || employee.fullNameAr || 'اسم الموظف'}</span>
                    <button 
                      onClick={() => setIsEditMode(true)}
                      className="text-slate-400 hover:text-purple-700 transition"
                      title="انقر للتعديل السريع"
                    >
                      <Edit3 size={14} />
                    </button>
                  </h2>
                )}

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
                  isContractRunning 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{isContractRunning ? 'على رأس العمل' : contractStatus}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-800">
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.nameEn || ''}
                    onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                    placeholder="English Name"
                    className="font-semibold text-slate-700 border border-purple-300 rounded px-1.5 py-0.5 bg-purple-50/40 focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-slate-600 font-mono">{employee.nameEn || employee.fullNameEn || '-'}</span>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-slate-900 font-bold">{employee.jobTitle || 'المسمى الوظيفي'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700">{employee.dept || employee.department || 'القسم العام'}</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  🏢 {displayCompanyName}
                </span>
              </div>
            </div>
          </div>

          {/* Odoo Smart Buttons (العقود - الإجازات - الهوية الذكية - المباشرة) */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Smart Button 1: العقود (Contracts) */}
            <div 
              onClick={() => {
                setActiveTab('hr');
                import('react-hot-toast').then(m => m.toast.success('تم الانتقال لبيانات العقد. يرجى تعديل باقة الأجور الكاملة من تطبيق العقود والرواتب الرئيسي.'));
              }}
              className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-300 rounded-xl p-2.5 min-w-[130px] flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="انقر للانتقال لبيانات العقد والتعيين"
            >
              <div className="w-9 h-9 rounded-lg bg-[#714B67] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-purple-900 font-bold">عقد العمل</div>
                <div className="text-xs font-black text-slate-900 font-mono">1 نشط</div>
              </div>
            </div>

            {/* Smart Button 2: رصيد الإجازات (Time Off) */}
            <div 
              onClick={() => onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee)}
              className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl p-2.5 min-w-[130px] flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="انقر لطباعة كشف رصيد الإجازات السنوية المعتمد والمستحق فوراً"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Plane size={18} />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-900 font-bold">رصيد الإجازات</div>
                <div className="text-xs font-black text-slate-900 font-mono">{calculatedBalance} يوم</div>
              </div>
            </div>

            {/* Smart Button 3: الهوية الذكية (ID Card) */}
            <div 
              onClick={() => onTriggerPrint(`بطاقة هوية الموظف - ${employee.nameAr || employee.id}`, { ...employee, type: 'ID_CARD' })}
              className="bg-blue-50/70 hover:bg-blue-100/80 border border-blue-300 rounded-xl p-2.5 min-w-[130px] flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="طباعة واستخراج بطاقة هوية الموظف والـ QR Code"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <CreditCard size={18} />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-blue-900 font-bold">الهوية والبطاقة</div>
                <div className="text-xs font-black text-slate-900">طباعة QR 🪪</div>
              </div>
            </div>

          </div>

        </div>

        {/* Notebook Tabs Bar (معلومات العمل - البيانات الشخصية - المستندات - إعدادات HR) */}
        <div className="border-b border-slate-300 flex items-center gap-2 overflow-x-auto">
          
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`px-4 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'work'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={16} />
            <span>معلومات العمل (Work Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-4 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'private'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={16} />
            <span>البيانات الشخصية (Private Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>المستندات والتراخيص الكويتية (Documents & Compliance)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`px-4 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'hr'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 size={16} />
            <span>إعدادات الموارد البشرية (HR Settings)</span>
          </button>

        </div>

        {/* Tab 1: معلومات العمل (Work Information) */}
        {activeTab === 'work' && (
          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* Work Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">المسمى الوظيفي (Job Position)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.jobTitle || ''}
                    onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="مثال: مسؤول موارد بشرية / طبيب عام"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.jobTitle || 'غير محدد'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الإدارة / القسم (Department)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.dept || ''}
                    onChange={(e) => handleFieldChange('dept', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="مثال: الشؤون الإدارية / التمريض"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.dept || employee.department || 'القسم العام'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">المدير المباشر (Coach / Manager)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.manager || ''}
                    onChange={(e) => handleFieldChange('manager', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="اسم المسؤول المباشر"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.manager || 'الإدارة العامة'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">موقع العمل / الفرع (Work Location)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.workLocation || ''}
                    onChange={(e) => handleFieldChange('workLocation', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="المقر الرئيسي - الكويت"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.workLocation || 'المقر الرئيسي - الكويت'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">البريد الإلكتروني للعمل (Work Email)</label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={employee.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="employee@company.com"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.email || 'غير مدخل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">هاتف العمل (Work Phone)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="+965 22000000"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.phone || 'غير مدخل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">تاريخ التعيين والمباشرة (YYYY-MM-DD)</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}
                    onChange={(e) => handleFieldChange('hireDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.hireDate ? employee.hireDate.slice(0, 10) : 'غير مسجل'}</div>
                )}
              </div>

              {isMedicalStaff && (
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                  <label className="block text-slate-500 font-bold mb-1">رقم ترخيص وزارة الصحة (MOH License)</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={employee.mohLicense || ''}
                      onChange={(e) => handleFieldChange('mohLicense', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      placeholder="MOH-2026-0000"
                    />
                  ) : (
                    <div className="font-mono font-bold text-purple-900 text-sm">{employee.mohLicense || 'قيد الاستخراج'}</div>
                  )}
                </div>
              )}

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">جدول وساعات العمل (Working Schedule)</label>
                {isEditMode ? (
                  <select
                    value={employee.workingSchedule || 'standard_48h'}
                    onChange={(e) => handleFieldChange('workingSchedule', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="standard_48h">دوام قياسي (8 ساعات / 6 أيام - المادة 64)</option>
                    <option value="shifts_rotational">ورديات ونوبات متناوبة (حراسة / كادر طبي)</option>
                    <option value="part_time">دوام جزئي (Part-Time)</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">
                    {employee.workingSchedule === 'shifts_rotational' 
                      ? 'ورديات ونوبات متناوبة (نظام الشفتات)'
                      : employee.workingSchedule === 'part_time'
                      ? 'دوام جزئي (Part-Time)'
                      : 'دوام قياسي (8 ساعات / 6 أيام - المادة 64)'}
                  </div>
                )}
              </div>

            </div>

            {/* Compensation & Statutory Allowances (Kuwait WPS) */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                  <span className="font-black text-sm text-slate-900">حزمة الأجور والبدلات الشهرية (نظام حماية الأجور WPS)</span>
                </div>
                <div className="text-slate-900 font-bold flex items-center gap-4 font-mono">
                  <span>أجر اليوم (26 يوم): <strong className="text-purple-900">{dailyWage.toFixed(3)} د.ك</strong></span>
                  <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg font-black text-sm">
                    الراتب الإجمالي: {totalSalary.toFixed(3)} د.ك
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي (Basic)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.basicSalary || employee.salary || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدل السكن (Housing)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.housingAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدل الانتقال (Transport)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.transportAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدلات أخرى وطبيعة عمل</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.allowances || employee.otherAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div className="col-span-full bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs font-bold leading-relaxed">
                  <span className="text-base">💡</span>
                  <span>
                    <strong>حماية الأجور والامتثال لـ WPS:</strong> حقول الراتب والبدلات هي حقول محمية (قراءة فقط) تُسحب بشكل آلي وتطبيقي دائم من تفاصيل العقد النشط (Active Contract) في نظام العقود، وذلك لضمان تطابق البيانات تماماً ومنع أي ثغرات أو غرامات من هيئة القوى العاملة.
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: البيانات الشخصية (Private Information) */}
        {activeTab === 'private' && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TabDocumentScanner 
                tabType="CIVIL_ID" 
                title="البطاقة المدنية" 
                onDataExtracted={(data) => handleOcrResult(data, 'civil_id')} 
              />
              <TabDocumentScanner 
                tabType="PASSPORT" 
                title="جواز السفر" 
                onDataExtracted={(data) => handleOcrResult(data, 'passport')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الرقم المدني (Civil ID)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    maxLength={12}
                    value={employee.civilId || employee.civil_id_number || ''}
                    onChange={(e) => handleFieldChange('civilId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="290010100000"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm">{employee.civilId || employee.civil_id_number || 'غير مدخل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">انتهاء البطاقة المدنية (YYYY-MM-DD)</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : ''}
                    onChange={(e) => handleFieldChange('civilIdExpiry', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : 'غير مسجل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الجنسية (Nationality)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.nationality || 'كويتي'}
                    onChange={(e) => handleFieldChange('nationality', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="كويتي / مصري / هندي / أردني..."
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.nationality || 'كويتي'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">تاريخ الميلاد (YYYY-MM-DD)</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.dob ? employee.dob.slice(0, 10) : (employee.birthDate ? employee.birthDate.slice(0, 10) : '')}
                    onChange={(e) => handleFieldChange('dob', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.dob ? employee.dob.slice(0, 10) : (employee.birthDate ? employee.birthDate.slice(0, 10) : 'غير مسجل')}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الجنس (Gender)</label>
                {isEditMode ? (
                  <select
                    value={employee.gender || 'male'}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="male">ذكر (Male)</option>
                    <option value="female">أنثى (Female)</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.gender === 'female' ? 'أنثى' : 'ذكر'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الحالة الاجتماعية (Marital Status)</label>
                {isEditMode ? (
                  <select
                    value={employee.maritalStatus || 'single'}
                    onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="single">أعزب (Single)</option>
                    <option value="married">متزوج (Married)</option>
                    <option value="divorced">مطلق (Divorced)</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">
                    {employee.maritalStatus === 'married' ? 'متزوج' : employee.maritalStatus === 'divorced' ? 'مطلق' : 'أعزب'}
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">رقم جواز السفر (Passport No)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.passportNo || ''}
                    onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="A12345678"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm">{employee.passportNo || 'غير مسجل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">انتهاء الجواز (YYYY-MM-DD)</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
                    onChange={(e) => handleFieldChange('passportExpiry', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : 'غير مسجل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">انتهاء الإقامة (YYYY-MM-DD)</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.residencyExpiry ? employee.residencyExpiry.slice(0, 10) : ''}
                    onChange={(e) => handleFieldChange('residencyExpiry', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.residencyExpiry ? employee.residencyExpiry.slice(0, 10) : 'غير مسجل'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الهاتف الشخصي (Personal Phone)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.personalPhone || employee.mobile || ''}
                    onChange={(e) => handleFieldChange('personalPhone', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="+965 90000000"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-800 text-sm">{employee.personalPhone || employee.mobile || 'غير مدخل'}</div>
                )}
              </div>

              <div className="md:col-span-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">العنوان بالتفصيل في دولة الكويت</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="المحافظة، المنطقة، قطعة، شارع، قسيمة/مبنى، شقة"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.address || 'غير محدد'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">اسم البنك الكويتي (Bank Name)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.bankName || 'بنك الكويت الوطني NBK'}
                    onChange={(e) => handleFieldChange('bankName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.bankName || 'بنك الكويت الوطني NBK'}</div>
                )}
              </div>

              <div className="md:col-span-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">رقم الحساب والآيبان (IBAN)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.iban || ''}
                    onChange={(e) => handleFieldChange('iban', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="KW00NBOK0000000000000000000000"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm">{employee.iban || 'غير مدخل'}</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: المستندات والوثائق والأرشيف الإلكتروني (Documents & Electronic Archive) */}
        {activeTab === 'documents' && (
          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* 1. شريط التحكم بحالة الربط الديناميكي مع خطة التعيين */}
            <div className="bg-slate-900 text-white rounded-2xl p-4.5 shadow-md border border-slate-800 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                    <FolderArchive className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      الأرشيف والمستندات الإلزامية للموظف (الربط الديناميكي مع خطة التعيين)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      يتم توليد وإظهار خانات الوثائق أدناه استناداً إلى الوثائق التي تم تحديدها أثناء معالج التعيين والتهيئة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مستند إضافي</span>
                  </button>
                </div>
              </div>

              {/* Toggle checklist tags */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 ml-2">الوثائق المطلوبة للملف:</span>
                
                {[
                  { key: 'civilIdScan', label: '🪪 البطاقة المدنية', required: true },
                  { key: 'passportScan', label: '✈️ جواز السفر', required: true },
                  { key: 'pamWorkPermit', label: '📜 إذن عمل PAM', required: true },
                  { key: 'mohLicense', label: '🩺 ترخيص مزاولة المهنة MOH', conditional: true },
                  { key: 'medicalFitness', label: '🏥 شهادة الفحص الطبي', required: true },
                  { key: 'signedContract', label: '✍️ عقد العمل وإقرار المباشرة', required: true },
                  ...(employee.customDocuments || []).map((cd: any) => ({ key: cd.id, label: `📁 ${cd.title}`, custom: true }))
                ].map((item) => {
                  const isChecked = !!requiredChecklist[item.key];
                  const hasFile = !!(employee.documentFiles && employee.documentFiles[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleDocRequirement(item.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        isChecked 
                          ? hasFile
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                            : 'bg-purple-950/70 border-purple-500/60 text-purple-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3 text-slate-500" />}
                      <span>{item.label}</span>
                      {hasFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. بطاقات مؤشرات حالة الوثائق (Dynamic KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              
              {/* البطاقة المدنية */}
              {requiredChecklist.civilIdScan && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🪪 البطاقة المدنية</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.civilIdScan
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.civilIdExpiry
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.civilIdScan ? 'مرفوع ✅' : employee.civilIdExpiry ? 'مسجل 📝' : 'بانتظار الرفع ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.civilId || employee.civil_id_number || 'غير مدخلة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الانتهاء:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.civilIdExpiry || 'غير محدد'}</span>
                  </div>
                </div>
              )}

              {/* جواز السفر */}
              {requiredChecklist.passportScan && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">✈️ جواز السفر</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.passportScan
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.passportExpiry
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.passportScan ? 'مرفوع ✅' : employee.passportExpiry ? 'ساري 📝' : 'بانتظار الرفع ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.passportNo || 'غير مدخل'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الانتهاء:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.passportExpiry || 'غير محدد'}</span>
                  </div>
                </div>
              )}

              {/* إذن العمل PAM */}
              {requiredChecklist.pamWorkPermit && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">📜 إذن عمل PAM</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.pamWorkPermit
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-purple-100 text-purple-900 border border-purple-300'
                    }`}>
                      {employee.documentFiles?.pamWorkPermit ? 'مرفوع ✅' : 'معتمد'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.workPermitNo || `PAM-${employee.id || '2026'}`}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>نهاية العقد:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.contractEndDate || '2027-01-01'}</span>
                  </div>
                </div>
              )}

              {/* ترخيص وزارة الصحة MOH */}
              {requiredChecklist.mohLicense && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🩺 ترخيص MOH</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.mohLicense
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.mohLicense
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.mohLicense ? 'مرفوع ✅' : employee.mohLicense ? 'مسجل 🩺' : 'قيد الاستخراج ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.mohLicense || 'MOH-TEMP'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الانتهاء:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.mohLicenseExpiry || 'غير محدد'}</span>
                  </div>
                </div>
              )}

              {/* شهادة الفحص الطبي */}
              {requiredChecklist.medicalFitness && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🏥 الفحص الطبي</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.medicalFitness || employee.medicalFitnessStatus === 'fit'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.medicalFitness ? 'مرفوع ✅' : employee.medicalFitnessStatus === 'fit' ? 'لائق طبياً' : 'بانتظار الشهادة'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">
                    {employee.medicalFitnessHospital || 'إدارة الصحة العامة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الحالة:</span>
                    <span className="text-emerald-700 font-bold">{employee.medicalFitnessStatus === 'fit' ? 'لائق طبياً (Fit)' : 'قيد المراجعة'}</span>
                  </div>
                </div>
              )}

              {/* عقد العمل وإقرار المباشرة */}
              {requiredChecklist.signedContract && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">✍️ عقد العمل</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.signedContract || employee.contractSigned
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.signedContract ? 'مرفوع وموقع ✅' : 'موقع ومعتمد'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">
                    {employee.contractType || 'محدد المدة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>المباشرة:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.hireDate || employee.contractStartDate || '2026-01-01'}</span>
                  </div>
                </div>
              )}

              {/* Custom Documents KPIs */}
              {(employee.customDocuments || []).map((cd: any) => (
                <div key={cd.id} className="bg-slate-50 border border-purple-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] truncate">📁 {cd.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.[cd.id]
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {employee.documentFiles?.[cd.id] ? 'مرفوع ✅' : 'مستند إضافي'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-900 truncate">
                    {cd.category || 'ملف إداري'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الحالة:</span>
                    <span className="text-slate-700 font-bold">{employee.documentFiles?.[cd.id] ? 'جاهز' : 'بانتظار الملف'}</span>
                  </div>
                </div>
              ))}

            </div>

            {/* 3. منصة استخراج ورفع وثائق الموظف المعتمدة (Workspace & Scanners Grid) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                    <span>🗄️ مساحات حفظ ورفع ومسح المستندات الرسمية</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يمكنك رفع الملفات الأصلية (PDF أو صور)، أو استخدام الماسح الضوئي الذكي (OCR) لاستخراج وتعبئة البيانات تلقائياً
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* 1. مساحة البطاقة المدنية */}
                {requiredChecklist.civilIdScan && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪪</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">البطاقة المدنية الكويتية (Civil ID)</h5>
                          <span className="text-[10px] text-slate-400">وثيقة إثبات الهوية والإقامة الرسمية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="CIVIL_ID" 
                      title="مسح واستخراج البطاقة المدنية (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'civil_id')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم المدني (12 رقماً)</label>
                        <input
                          type="text"
                          maxLength={12}
                          value={employee.civil_id_number || employee.civilId || ''}
                          onChange={(e) => {
                            handleFieldChange('civil_id_number', e.target.value);
                            handleFieldChange('civilId', e.target.value);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="290010100000"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء البطاقة</label>
                        <input
                          type="date"
                          value={employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('civilIdExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.civilIdScan ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.civilIdScan.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.civilIdScan.fileSize} • رُفع في {employee.documentFiles.civilIdScan.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'البطاقة المدنية الكويتية',
                                url: employee.documentFiles.civilIdScan.url,
                                fileType: employee.documentFiles.civilIdScan.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.civilIdScan.url}
                              download={employee.documentFiles.civilIdScan.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('civilIdScan')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة البطاقة المدنية الممسوحة (PDF / صورة)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG حتى 10MB</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('civilIdScan', e, 'البطاقة المدنية')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. مساحة جواز السفر */}
                {requiredChecklist.passportScan && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✈️</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">جواز السفر (Passport)</h5>
                          <span className="text-[10px] text-slate-400">وثيقة السفر وبيانات الاسم اللاتيني</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="PASSPORT" 
                      title="مسح واستخراج جواز السفر (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'passport')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم جواز السفر</label>
                        <input
                          type="text"
                          value={employee.passportNo || ''}
                          onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="A12345678"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الجواز</label>
                        <input
                          type="date"
                          value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('passportExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.passportScan ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.passportScan.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.passportScan.fileSize} • رُفع في {employee.documentFiles.passportScan.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'جواز السفر',
                                url: employee.documentFiles.passportScan.url,
                                fileType: employee.documentFiles.passportScan.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.passportScan.url}
                              download={employee.documentFiles.passportScan.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('passportScan')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة جواز السفر الممسوحة</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('passportScan', e, 'جواز السفر')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. مساحة إذن العمل PAM */}
                {requiredChecklist.pamWorkPermit && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📜</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">إذن عمل القوى العاملة (PAM Work Permit)</h5>
                          <span className="text-[10px] text-slate-400">تصريح العمل الرسمي الصادر من الهيئة العامة للقوى العاملة</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="WORK_PERMIT" 
                      title="مسح واستخراج إذن العمل (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'work_permit')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم إذن العمل (PAM No)</label>
                        <input
                          type="text"
                          value={employee.workPermitNo || ''}
                          onChange={(e) => handleFieldChange('workPermitNo', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="PAM-2026-00000"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المسمى المعتمد بالقوى العاملة</label>
                        <input
                          type="text"
                          value={employee.jobTitle || ''}
                          onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="طبيب بشري / ممرض / إداري"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.pamWorkPermit ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.pamWorkPermit.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.pamWorkPermit.fileSize} • رُفع في {employee.documentFiles.pamWorkPermit.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'إذن عمل القوى العاملة (PAM)',
                                url: employee.documentFiles.pamWorkPermit.url,
                                fileType: employee.documentFiles.pamWorkPermit.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.pamWorkPermit.url}
                              download={employee.documentFiles.pamWorkPermit.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('pamWorkPermit')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة إذن العمل الرسمي (PAM)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('pamWorkPermit', e, 'إذن العمل')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. مساحة ترخيص مزاولة المهنة MOH */}
                {requiredChecklist.mohLicense && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🩺</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">ترخيص مزاولة المهنة (MOH Medical License)</h5>
                          <span className="text-[10px] text-slate-400">ترخيص إدارة التراخيص الصحية بوزارة الصحة الكويتية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        كادر طبي
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="MEDICAL_LICENSE" 
                      title="مسح واستخراج ترخيص وزارة الصحة (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'medical_license')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم ترخيص MOH</label>
                        <input
                          type="text"
                          value={employee.mohLicense || ''}
                          onChange={(e) => handleFieldChange('mohLicense', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="MOH-DOC-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الترخيص</label>
                        <input
                          type="date"
                          value={employee.mohLicenseExpiry ? employee.mohLicenseExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('mohLicenseExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.mohLicense ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.mohLicense.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.mohLicense.fileSize} • رُفع في {employee.documentFiles.mohLicense.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'ترخيص وزارة الصحة (MOH)',
                                url: employee.documentFiles.mohLicense.url,
                                fileType: employee.documentFiles.mohLicense.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.mohLicense.url}
                              download={employee.documentFiles.mohLicense.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('mohLicense')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع شهادة ترخيص مزاولة المهنة الطبية</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('mohLicense', e, 'ترخيص MOH')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. مساحة شهادة اللياقة والفحص الطبي */}
                {requiredChecklist.medicalFitness && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏥</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">شهادة اللياقة والفحص الطبي (Medical Fitness)</h5>
                          <span className="text-[10px] text-slate-400">شهادة الخلو من الأمراض والفحوصات المخبرية الرسمية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                        فحص الإقامة
                      </span>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">حالة اللياقة الصحية</label>
                        <select
                          value={employee.medicalFitnessStatus || 'fit'}
                          onChange={(e) => handleFieldChange('medicalFitnessStatus', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="fit">✅ لائق طبياً - Fit for duty</option>
                          <option value="pending">⏳ بانتظار نتائج الفحص - Pending</option>
                          <option value="unfit">❌ غير لائق طبياً - Unfit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ إجراء الفحص</label>
                        <input
                          type="date"
                          value={employee.medicalFitnessDate ? employee.medicalFitnessDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('medicalFitnessDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المركز / المستشفى الفاحص</label>
                        <input
                          type="text"
                          value={employee.medicalFitnessHospital || ''}
                          onChange={(e) => handleFieldChange('medicalFitnessHospital', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="إدارة الصحة العامة / مركز الفحص الطبي للعمالة الوافدة"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.medicalFitness ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.medicalFitness.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.medicalFitness.fileSize} • رُفع في {employee.documentFiles.medicalFitness.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'شهادة الفحص الطبي واللياقة',
                                url: employee.documentFiles.medicalFitness.url,
                                fileType: employee.documentFiles.medicalFitness.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.medicalFitness.url}
                              download={employee.documentFiles.medicalFitness.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('medicalFitness')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع تقرير وشهادة الفحص الطبي (PDF / صورة)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('medicalFitness', e, 'الفحص الطبي')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. مساحة عقد العمل الموقع وإقرار المباشرة */}
                {requiredChecklist.signedContract && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✍️</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">عقد العمل الموقع وإقرار المباشرة (Signed Contract)</h5>
                          <span className="text-[10px] text-slate-400">النسخة الموقعة من الطرفين ونموذج مباشرة العمل الفعلي</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        معتمد قانونياً
                      </span>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">حالة توقيع العقد</label>
                        <select
                          value={employee.contractSigned ? 'signed' : 'pending'}
                          onChange={(e) => handleFieldChange('contractSigned', e.target.value === 'signed')}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="signed">✅ موقع ومعتمد من الطرفين</option>
                          <option value="pending">⏳ قيد التوقيع والمراجعة</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ توقيع العقد</label>
                        <input
                          type="date"
                          value={employee.contractSignDate ? employee.contractSignDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('contractSignDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ مباشرة العمل الفعلي</label>
                        <input
                          type="date"
                          value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('hireDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.signedContract ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.signedContract.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.signedContract.fileSize} • رُفع في {employee.documentFiles.signedContract.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'عقد العمل الموقع وإقرار المباشرة',
                                url: employee.documentFiles.signedContract.url,
                                fileType: employee.documentFiles.signedContract.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.signedContract.url}
                              download={employee.documentFiles.signedContract.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('signedContract')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة العقد الموقعة وإقرار المباشرة</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('signedContract', e, 'عقد العمل')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. مساحات الوثائق الإضافية المخصصة (Custom Documents) */}
                {(employee.customDocuments || []).map((cd: any) => (
                  <div key={cd.id} className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📁</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{cd.title}</h5>
                          <span className="text-[10px] text-purple-700 font-bold">{cd.category}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedCustomList = (employee.customDocuments || []).filter((item: any) => item.id !== cd.id);
                          setEmployee((prev: any) => ({ ...prev, customDocuments: updatedCustomList }));
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="إزالة هذا المستند"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم المرجعي / البيان</label>
                        <input
                          type="text"
                          value={employee[`doc_ref_${cd.id}`] || ''}
                          onChange={(e) => handleFieldChange(`doc_ref_${cd.id}`, e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="رقم الوثيقة أو الملاحظة"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الصلاحية</label>
                        <input
                          type="date"
                          value={employee[`doc_exp_${cd.id}`] ? employee[`doc_exp_${cd.id}`].slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange(`doc_exp_${cd.id}`, e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.[cd.id] ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles[cd.id].name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles[cd.id].fileSize} • رُفع في {employee.documentFiles[cd.id].uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: cd.title,
                                url: employee.documentFiles[cd.id].url,
                                fileType: employee.documentFiles[cd.id].type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles[cd.id].url}
                              download={employee.documentFiles[cd.id].name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile(cd.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع مستند ({cd.title})</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload(cd.id, e, cd.title)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}

        {/* Tab 3: إعدادات HR (HR Settings) */}
        {activeTab === 'hr' && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isMedicalStaff && (
                <TabDocumentScanner 
                  tabType="MEDICAL_LICENSE" 
                  title="ترخيص مزاولة المهنة (MOH)" 
                  onDataExtracted={(data) => handleOcrResult(data, 'medical_license')} 
                />
              )}
              <TabDocumentScanner 
                tabType="WORK_PERMIT" 
                title="إذن العمل (PAM)" 
                onDataExtracted={(data) => handleOcrResult(data, 'work_permit')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">نوع العقد (Contract Type)</label>
                {isEditMode ? (
                  <select
                    value={employee.contractType || 'محدد المدة'}
                    onChange={(e) => handleFieldChange('contractType', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="محدد المدة">محدد المدة (Fixed-Term)</option>
                    <option value="غير محدد المدة">غير محدد المدة (Indefinite)</option>
                    <option value="عقد تدريب / تأهيل">عقد تدريب / تأهيل</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.contractType || 'محدد المدة'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">حالة العقد في النظام (Status)</label>
                {isEditMode ? (
                  <select
                    value={employee.contractStatus || 'ساري'}
                    onChange={(e) => handleFieldChange('contractStatus', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="ساري">ساري (Running / Active)</option>
                    <option value="قيد التجديد">قيد التجديد (To Renew)</option>
                    <option value="فترة تجربة">فترة تجربة (Probation)</option>
                    <option value="منتهي">منتهي (Expired)</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.contractStatus || 'ساري'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">رقم البصمة البيومترية (ZKTeco PIN)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.pin || employee.badgeId || employee.id || ''}
                    onChange={(e) => handleFieldChange('pin', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="101"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm">{employee.pin || employee.badgeId || employee.id || '-'}</div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الخضوع للتأمينات الاجتماعية (PIFSS)</label>
                {isEditMode ? (
                  <select
                    value={employee.pifssStatus || ((employee.nationality || '').includes('كويت') ? 'subscribed' : 'exempt')}
                    onChange={(e) => handleFieldChange('pifssStatus', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="subscribed">مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)</option>
                    <option value="exempt">غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)</option>
                  </select>
                ) : (
                  <div className="font-bold text-slate-900 text-sm">
                    {employee.pifssStatus === 'subscribed' || ((employee.nationality || '').includes('كويت'))
                      ? 'مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)'
                      : 'غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)'}
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-600 font-bold mb-1">الرصيد المرحّل من 2025 (Carried-Over Balance)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  readOnly={true}
                  value={employee.carriedOverLeave2025 ?? employee.carriedOverBalance ?? employee.openingBalance ?? 0}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                  placeholder="0.0"
                  title="تُدار وتُخصّص هذه الأرصدة تلقائياً عبر نظام الإجازات والغياب"
                />
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-600 font-bold mb-1">تاريخ بداية العقد الحالي (YYYY-MM-DD)</label>
                <input
                  type="date"
                  readOnly={true}
                  value={employee.contractStartDate ? employee.contractStartDate.slice(0, 10) : ''}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                  title="يُسحب تلقائياً من عقد العمل النشط للموظف"
                />
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-600 font-bold mb-1">تاريخ نهاية العقد الحالي (YYYY-MM-DD)</label>
                <input
                  type="date"
                  readOnly={true}
                  value={employee.contractEndDate ? employee.contractEndDate.slice(0, 10) : '2027-01-01'}
                  className="w-full border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                  title="يُسحب تلقائياً من عقد العمل النشط للموظف"
                />
              </div>

              <div className="col-span-full bg-emerald-50/55 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-emerald-900 text-xs font-bold leading-relaxed">
                <span className="text-base">✈️</span>
                <span>
                  <strong>إدارة أرصدة الإجازات وتواريخ التعاقد:</strong> رصيد الموظف المرحّل يتم تتبعه واحتسابه ديناميكياً بناءً على طلبات الإجازات والتخصيصات (Allocations) المعتمدة في تطبيق <strong>"الإجازات والغياب"</strong>. كما أن تواريخ سريان ونهاية العقد تُستورد تلقائياً من تطبيق <strong>"العقود والرواتب"</strong> لضمان حوكمة البيانات.
                </span>
              </div>

              <div className="md:col-span-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">الملاحظات والسجلات الإدارية</label>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={employee.notes || ''}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="أي شروط خاصة أو ملاحظات إدارية ملحقة بملف الموظف..."
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm whitespace-pre-wrap">{employee.notes || 'لا توجد ملاحظات إدارية مسجلة.'}</div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* نافذة معاينة المستندات المرفوعة (Preview Modal) */}
      {Boolean(previewModal?.isOpen) && previewModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm">{previewModal.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModal.url}
                  download
                  className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                  title="تنزيل الملف"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ isOpen: false, title: '', url: '', fileType: '' })}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[350px]">
              {previewModal.fileType === 'application/pdf' ? (
                <iframe
                  src={previewModal.url}
                  className="w-full h-[550px] rounded-xl border border-slate-300 bg-white"
                  title="معاينة PDF"
                />
              ) : (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-h-[550px] max-w-full rounded-xl object-contain shadow-md"
                />
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModal({ isOpen: false, title: '', url: '', fileType: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة مستند إضافي مخصص (Add Custom Document Modal) */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-purple-50/50">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm">إضافة خانة مستند جديد لملف الموظف</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">اسم المستند أو الوثيقة *</label>
                <input
                  type="text"
                  value={newCustomDoc.title}
                  onChange={(e) => setNewCustomDoc({ ...newCustomDoc, title: e.target.value })}
                  placeholder="مثال: شهادة المؤهل الدراسي / رخصة القيادة / شهادة راتب"
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">تصنيف الوثيقة</label>
                <select
                  value={newCustomDoc.category}
                  onChange={(e) => setNewCustomDoc({ ...newCustomDoc, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="مؤهل علمي وشهادات">مؤهل علمي وشهادات (Education & Degrees)</option>
                  <option value="تراخيص وسياقة">تراخيص وسياقة (Licenses & Driving)</option>
                  <option value="شؤون قانونية وعقود">شؤون قانونية وعقود (Legal & Agreements)</option>
                  <option value="تأمين ومالية">تأمين ومالية (Insurance & Finance)</option>
                  <option value="مستندات أخرى">مستندات أخرى (Other Documents)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">ملاحظات أو تعليمات إضافية (اختياري)</label>
                <input
                  type="text"
                  value={newCustomDoc.notes}
                  onChange={(e) => setNewCustomDoc({ ...newCustomDoc, notes: e.target.value })}
                  placeholder="أي تفاصيل خاصة بالمستند..."
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-bold rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleAddCustomDocument}
                disabled={!newCustomDoc.title.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs"
              >
                تأكيد وإضافة للأرشيف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooEmployeeDetailView;
