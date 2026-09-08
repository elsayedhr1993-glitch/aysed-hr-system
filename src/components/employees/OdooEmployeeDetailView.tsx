import React, { useState, useEffect } from 'react';
import { EmployeeWorkTab } from './tabs/EmployeeWorkTab';
import { EmployeePrivateTab } from './tabs/EmployeePrivateTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
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
import { EditableField, EditableSelect } from '../EditableField';
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
      const rawManaraLeaves = localStorage.getItem('manara_leaves_data');
      const rawAllocations = localStorage.getItem('odoo_leave_allocations_v2');

      const requestsList = rawRequests ? JSON.parse(rawRequests) : [];
      const manaraList = rawManaraLeaves ? JSON.parse(rawManaraLeaves) : [];
      const allocationsList = rawAllocations ? JSON.parse(rawAllocations) : [];

      const combinedRequests = [...requestsList, ...manaraList];

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
      const fifoResult = computeFifoLeaveAllocations(employee as any, empAllocs, combinedRequests as any);

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
          <EmployeeWorkTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
          />
        )}
        {activeTab === 'private' && (
          <EmployeePrivateTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            handleOcrResult={handleOcrResult}
          />
        )}
        {activeTab === 'documents' && (
          <EmployeeDocumentsTab
            employee={employee}
            setEmployee={setEmployee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            handleOcrResult={handleOcrResult}
            handleDocFileUpload={handleDocFileUpload}
            handleRemoveDocFile={handleRemoveDocFile}
            handleToggleDocRequirement={handleToggleDocRequirement}
          />
        )}
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
              
                            <EditableSelect
                label="نوع العقد (Contract Type)"
                value={employee.contractType || 'محدد المدة'}
                onChange={(val) => handleFieldChange('contractType', val)}
                isEditMode={isEditMode}
                options={[{ value: "محدد المدة", label: "محدد المدة (Fixed-Term)" }, { value: "غير محدد المدة", label: "غير محدد المدة (Indefinite)" }, { value: "عقد تدريب / تأهيل", label: "عقد تدريب / تأهيل" }]}
              />

                            <EditableSelect
                label="حالة العقد في النظام (Status)"
                value={employee.contractStatus || 'ساري'}
                onChange={(val) => handleFieldChange('contractStatus', val)}
                isEditMode={isEditMode}
                options={[{ value: "ساري", label: "ساري (Running / Active)" }, { value: "قيد التجديد", label: "قيد التجديد (To Renew)" }, { value: "فترة تجربة", label: "فترة تجربة (Probation)" }, { value: "منتهي", label: "منتهي (Expired)" }]}
              />

                            <EditableField
                label="رقم البصمة البيومترية (ZKTeco PIN)"
                value={employee.pin || employee.badgeId || employee.id || ''}
                onChange={(val) => handleFieldChange('pin', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="101"
              />

                            <EditableSelect
                label="الخضوع للتأمينات الاجتماعية (PIFSS)"
                value={employee.pifssStatus || ((employee.nationality || '').includes('كويت') ? 'subscribed' : 'exempt')}
                onChange={(val) => handleFieldChange('pifssStatus', val)}
                isEditMode={isEditMode}
                options={[{ value: "subscribed", label: "مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)" }, { value: "exempt", label: "غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)" }]}
              />

              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <label className="block text-emerald-900 font-bold mb-1">صافي رصيد الإجازات المتاح (Available Leave Balance)</label>
                <input
                  type="text"
                  readOnly={true}
                  value={`${calculatedBalance} يوم`}
                  className="w-full border border-emerald-300 rounded-lg p-2 font-mono font-black text-emerald-800 bg-white cursor-not-allowed focus:outline-none"
                  title="الرصيد المتاح المحسوب تلقائياً بالربط مع نظام الإجازات وقانون العمل الكويتي"
                />
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

          </div>
  );
};

export default OdooEmployeeDetailView;
