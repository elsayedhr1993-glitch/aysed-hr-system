import React, { useState, useEffect } from 'react';
import { EmployeeWorkTab } from './tabs/EmployeeWorkTab';
import { EmployeePrivateTab } from './tabs/EmployeePrivateTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { checkDocumentExpiry } from '../../utils/dateUtils';
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
  const [activeTab, setActiveTab] = useState<'work' | 'contract' | 'commencement' | 'private' | 'documents' | 'hr'>('work');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // تحديث بيانات الموظف عند تغير الـ initialEmployee
  useEffect(() => {
    if (initialEmployee) {
      setEmployee({ ...initialEmployee });
    }
  }, [initialEmployee]);

  // تحديد اسم المنشأة الفعلي التابع لها الموظف
  // فحص ما إذا كان هناك شركة تابعة مطابقة، أو استخدام الشركة النشطة إذا كانت ليست الإدارة المركزية
  const resolvedActiveComp = activeCompany || contextActiveCompany;
  let displayCompanyName = 'المنار كلينك';

  if (employee.companyName || employee.company_name) {
    displayCompanyName = employee.companyName || employee.company_name;
  } else if (resolvedActiveComp && !resolvedActiveComp.nameAr?.includes('المركزية') && !resolvedActiveComp.name?.includes('Super Admin')) {
    displayCompanyName = resolvedActiveComp.nameAr || resolvedActiveComp.name;
  } else {
    const matched = companies.find(c => c.id === (employee.companyId || employee.company_id));
    if (matched && !matched.nameAr?.includes('المركزية')) {
      displayCompanyName = matched.nameAr || matched.name || 'المنار كلينك';
    } else if (employee.companyId?.includes('almanar') || employee.id?.includes('MANARA')) {
      displayCompanyName = 'مجموعة عيادات المنار التخصصية (Manara Clinic)';
    } else if (resolvedActiveComp) {
      displayCompanyName = resolvedActiveComp.nameAr || resolvedActiveComp.name || 'المنار كلينك';
    }
  }

  // Quick calculations for wages
  const basicSalary = parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || 0) || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || 0) || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0) || 0;
  const otherAllowance = parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;
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

      const bSal = parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
      const hAll = parseFloat(employee.housingAllowance || 0) || 0;
      const tAll = parseFloat(employee.transportAllowance || 0) || 0;
      const mAll = parseFloat(employee.medicalAllowance || 0) || 0;
      const oAll = parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;
      const totAllowances = hAll + tAll + mAll + oAll;
      const totSal = bSal + totAllowances;

      const payloadToSave = {
        ...employee,
        basicSalary: bSal,
        contractSalary: bSal,
        housingAllowance: hAll,
        transportAllowance: tAll,
        medicalAllowance: mAll,
        otherAllowance: oAll,
        otherAllowances: oAll,
        allowances: totAllowances,
        totalSalary: totSal,
        salary: totSal
      };

      await onSave(payloadToSave);
      setEmployee(payloadToSave);
      setIsEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 p-2 sm:p-4 md:p-6 space-y-4 text-right font-sans text-slate-900 w-full" dir="rtl">
      
      {/* Top Breadcrumbs & Control Bar */}
      <div className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#714B67] hover:text-[#5a3b52] hover:bg-purple-50 px-2.5 py-1.5 rounded-lg border border-[#714B67]/30 transition cursor-pointer"
          >
            <ArrowRight size={16} />
            <span>العودة لدليل الموظفين</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-black">{employee.nameAr || employee.fullNameAr || 'ملف موظف'}</span>
          <span className="font-mono bg-purple-50 text-[#714B67] border border-purple-200 px-2 py-0.5 rounded text-xs font-bold">{employee.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
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
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={15} className="text-[#714B67]" />
            <span>طباعة الملف (A4)</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="طباعة كشف رصيد الإجازات المعتمد والمستحق للموظف"
          >
            <Printer size={15} className="text-emerald-700" />
            <span>طباعة كشف الإجازات</span>
          </button>

          {onDelete && employee.id && (
            <button
              type="button"
              onClick={() => onDelete(employee.id, employee.nameAr)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="حذف الموظف"
            >
              <Trash2 size={15} />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>

      {/* Odoo Official Document Sheet (White Paper on bg-slate-100) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm w-full p-5 sm:p-7 md:p-9 space-y-6">
        
        {/* Top Header Row: Smart Stat Buttons in top-corner (RTL: top-left) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-slate-400">
            <span>بطاقة بيانات الموظف الرسمية</span>
          </div>

          {/* Smart Stat Buttons in a single clean horizontal row */}
          <div className="flex items-center gap-2.5">
            {/* Smart Button 1: العقود */}
            <div 
              onClick={() => {
                setActiveTab('contract');
                import('react-hot-toast').then(m => m.toast.success('تم الانتقال لبيانات العقد والأجر'));
              }}
              className="border border-slate-200 hover:border-[#714B67]/40 bg-white hover:bg-purple-50/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="انقر للانتقال لبيانات العقد والتعيين"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#714B67] flex items-center justify-center shrink-0 group-hover:bg-[#714B67] group-hover:text-white transition">
                <FileText size={16} />
              </div>
              <div className="text-right leading-tight">
                <div className="text-[10px] text-slate-400 font-semibold">عقد العمل</div>
                <div className="text-xs font-black text-slate-900 font-mono">1 نشط</div>
              </div>
            </div>

            {/* Smart Button 2: رصيد الإجازات */}
            <div 
              onClick={() => onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee)}
              className="border border-slate-200 hover:border-emerald-500/40 bg-white hover:bg-emerald-50/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="انقر لطباعة كشف رصيد الإجازات السنوية المعتمد"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition">
                <Plane size={16} />
              </div>
              <div className="text-right leading-tight">
                <div className="text-[10px] text-slate-400 font-semibold">رصيد الإجازات</div>
                <div className="text-xs font-black text-slate-900 font-mono">{calculatedBalance} يوم</div>
              </div>
            </div>

            {/* Smart Button 3: الهوية الذكية */}
            <div 
              onClick={() => onTriggerPrint(`بطاقة هوية الموظف - ${employee.nameAr || employee.id}`, { ...employee, type: 'ID_CARD' })}
              className="border border-slate-200 hover:border-blue-500/40 bg-white hover:bg-blue-50/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer shadow-2xs group"
              title="طباعة واستخراج بطاقة هوية الموظف والـ QR Code"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-700 group-hover:text-white transition">
                <CreditCard size={16} />
              </div>
              <div className="text-right leading-tight">
                <div className="text-[10px] text-slate-400 font-semibold">الهوية والبطاقة</div>
                <div className="text-xs font-black text-slate-900">طباعة QR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header Block: Avatar + Name + Subtitle + Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
          <div className={`w-20 h-20 rounded-2xl ${employee.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0 overflow-hidden relative`}>
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (employee.nameAr || employee.fullNameAr || 'م').slice(0, 2)
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            {isEditMode && (
              <div className="mb-2 flex items-center gap-2">
                <label className="cursor-pointer px-2.5 py-1 bg-[#714B67] text-white rounded-lg text-xs font-bold hover:bg-[#5a3a52] transition flex items-center gap-1">
                  <span>📷 تغيير الصورة الشخصية</span>
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
                    className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition"
                  >
                    حذف الصورة
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {isEditMode ? (
                <input
                  type="text"
                  value={employee.nameAr || ''}
                  onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                  placeholder="اسم الموظف بالعربية"
                  className="text-2xl font-black text-slate-900 border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1 bg-white focus:outline-none transition"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{employee.nameAr || employee.fullNameAr || 'اسم الموظف'}</span>
                  <button 
                    onClick={() => setIsEditMode(true)}
                    className="text-slate-300 hover:text-[#714B67] transition"
                    title="تعديل"
                  >
                    <Edit3 size={16} />
                  </button>
                </h2>
              )}

              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${
                isContractRunning 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{isContractRunning ? 'على رأس العمل' : contractStatus}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 font-medium pt-0.5">
              {isEditMode ? (
                <input
                  type="text"
                  value={employee.nameEn || ''}
                  onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                  placeholder="English Name"
                  className="font-semibold text-slate-700 border border-slate-300 rounded px-2 py-0.5 bg-white focus:outline-none"
                />
              ) : (
                <span className="font-semibold text-slate-500 font-mono">{employee.nameEn || employee.fullNameEn || '—'}</span>
              )}
              <span className="text-slate-300">•</span>
              <span className="text-slate-800 font-bold">{employee.jobTitle || 'المسمى الوظيفي'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{employee.dept || employee.department || 'القسم العام'}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-[#714B67]">
                🏢 {displayCompanyName}
              </span>
            </div>

            {/* شريط تحذير مباشر إذا كانت هناك وثيقة منتهية للموظف */}
            {(() => {
              const civilDate = employee.civilIdExpiry || employee.civilIdExpiryDate || employee.civil_id_expiry;
              const civilStatus = checkDocumentExpiry(civilDate, 'البطاقة المدنية');
              if (civilStatus.isExpired) {
                return (
                  <div className="mt-2.5 bg-rose-50 border border-rose-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-rose-950 font-bold shadow-xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-rose-600 w-4 h-4 shrink-0 animate-bounce" />
                      <span>⚠️ البطاقة المدنية لهذا الموظف {civilStatus.badgeText} بتاريخ ({civilDate}). يرجى تجديد البطاقة وتحديث الملف.</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-black transition cursor-pointer shrink-0"
                    >
                      تحديث الوثيقة 🪪
                    </button>
                  </div>
                );
              }
              if (civilStatus.isExpiringSoon) {
                return (
                  <div className="mt-2.5 bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-950 font-bold shadow-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="text-amber-600 w-4 h-4 shrink-0" />
                      <span>⏰ البطاقة المدنية {civilStatus.badgeText} بتاريخ ({civilDate}).</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-black transition cursor-pointer shrink-0"
                    >
                      مراجعة الوثيقة
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Clean Notebook Tabs Bar */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pt-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'work'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Briefcase size={15} />
            <span>معلومات العمل (Work Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'contract'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>📄</span>
            <span>عقد العمل والبدلات (Contract & Salary)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commencement')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'commencement'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>🚀</span>
            <span>إقرار المباشرة والجاهزية (Job Commencement)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'private'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <UserCheck size={15} />
            <span>البيانات الشخصية (Private Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>المستندات والتراخيص الكويتية (Documents)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'hr'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Building2 size={15} />
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

        {/* Tab 2: عقد العمل والأجر الشامل (Contract & Wages) */}
        {activeTab === 'contract' && (
          <div className="space-y-8 animate-fade-in text-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">عقد العمل الأهلي والهيكل المالي (Employment Contract & Wages)</h4>
                <p className="text-xs text-slate-500">توثيق بنود العقد الأهلي، فترات التجربة (المادة 32)، والبدلات المعتمدة</p>
              </div>
              <button
                type="button"
                onClick={onOpenPamModal}
                className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>👁️ معاينة العقد الأهلي الصادر من (PAM)</span>
              </button>
            </div>

            {/* 2-Columns Grid for Contract Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
                    <span>بنود وفترة العقد</span>
                  </h5>
                </div>

                <div className="py-1.5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">نوع العقد الأهلي</label>
                  {isEditMode ? (
                    <select
                      value={employee.contractType || 'محدد المدة (Fixed Term)'}
                      onChange={(e) => handleFieldChange('contractType', e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:outline-none text-sm"
                    >
                      <option value="محدد المدة (Fixed Term)">محدد المدة (Fixed Term)</option>
                      <option value="غير محدد المدة (Indefinite Term)">غير محدد المدة (Indefinite Term)</option>
                    </select>
                  ) : (
                    <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                      {employee.contractType || 'محدد المدة (Fixed Term)'}
                    </div>
                  )}
                </div>

                <div className="py-1.5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">فترة التجربة (Probation Period)</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={employee.probationDays || 100}
                      onChange={(e) => handleFieldChange('probationDays', e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                      {employee.probationDays || 100} يوم عمل (المادة 32)
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>سريان التواريخ</span>
                  </h5>
                </div>

                <div className="py-1.5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ بداية العقد</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={employee.contractStartDate || employee.hireDate || ''}
                      onChange={(e) => handleFieldChange('contractStartDate', e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                      {employee.contractStartDate || employee.hireDate || '—'}
                    </div>
                  )}
                </div>

                <div className="py-1.5">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ نهاية العقد</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      value={employee.contractEndDate || ''}
                      onChange={(e) => handleFieldChange('contractEndDate', e.target.value)}
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                      {employee.contractEndDate || 'عقد مفتوح / غير محدد'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
                <span className="text-xs font-black text-slate-900">💰 حزمة الراتب والبدلات الشهرية</span>
                <span className="font-mono text-purple-900 font-black text-sm">
                  الأجر الشامل: {totalSalary.toFixed(3)} د.ك
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
                <div className="py-1">
                  <span className="text-slate-500 block text-xs font-semibold mb-1">الراتب الأساسي</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.001"
                      value={employee.basicSalary !== undefined ? employee.basicSalary : ''}
                      onChange={(e) => handleFieldChange('basicSalary', e.target.value)}
                      placeholder="0.000"
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">{(Number(employee.basicSalary) || 0).toFixed(3)} د.ك</div>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-xs font-semibold mb-1">بدل السكن</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.001"
                      value={employee.housingAllowance !== undefined ? employee.housingAllowance : ''}
                      onChange={(e) => handleFieldChange('housingAllowance', e.target.value)}
                      placeholder="0.000"
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">{(Number(employee.housingAllowance) || 0).toFixed(3)} د.ك</div>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-xs font-semibold mb-1">بدل الانتقال</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.001"
                      value={employee.transportAllowance !== undefined ? employee.transportAllowance : ''}
                      onChange={(e) => handleFieldChange('transportAllowance', e.target.value)}
                      placeholder="0.000"
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">{(Number(employee.transportAllowance) || 0).toFixed(3)} د.ك</div>
                  )}
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-xs font-semibold mb-1">بدلات أخرى</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.001"
                      value={employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance !== undefined ? employee.otherAllowance : '')}
                      onChange={(e) => {
                        handleFieldChange('otherAllowances', e.target.value);
                        handleFieldChange('otherAllowance', e.target.value);
                      }}
                      placeholder="0.000"
                      className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">{(Number(employee.otherAllowances !== undefined ? employee.otherAllowances : employee.otherAllowance) || 0).toFixed(3)} د.ك</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: إقرار المباشرة والجاهزية (Job Commencement) */}
        {activeTab === 'commencement' && (
          <div className="space-y-8 animate-fade-in text-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">إقرار المباشرة الفعلية واستلام العهد (Job Commencement)</h4>
                <p className="text-xs text-slate-500">توثيق تاريخ المباشرة بالفرع واستلام تجهيزات العمل الرسمية</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html dir="rtl" lang="ar">
                        <head>
                          <title>إقرار مباشرة عمل - ${employee.nameAr || employee.name}</title>
                          <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                            .header { text-align: center; border-bottom: 2px solid #714B67; padding-bottom: 20px; margin-bottom: 30px; }
                            .title { font-size: 22px; font-weight: bold; color: #714B67; margin-bottom: 5px; }
                            .subtitle { font-size: 14px; color: #64748b; }
                            .box { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; background: #f8fafc; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-size: 13px; }
                            th { background: #f1f5f9; font-weight: bold; }
                            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
                            .sig-box { text-align: center; width: 45%; border-top: 1px solid #94a3b8; padding-top: 10px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="title">شركة المنار كلينك الطبية</div>
                            <div class="subtitle">نموذج وإقرار مباشرة عمل موظف رسمي (Job Commencement Form)</div>
                          </div>

                          <div class="box">
                            <strong>بيانات الموظف والمباشرة:</strong>
                            <table>
                              <tr><th>اسم الموظف</th><td>${employee.nameAr || employee.name}</td><th>الرقم المدني</th><td>${employee.civilId || '-'}</td></tr>
                              <tr><th>المسمى الوظيفي</th><td>${employee.jobTitle || '-'}</td><th>القسم / الإدارة</th><td>${employee.department || '-'}</td></tr>
                              <tr><th>تاريخ المباشرة الفعلية</th><td>${employee.commencementDate || employee.hireDate || '-'}</td><th>المشرف المباشر</th><td>${employee.directSupervisor || employee.manager || '-'}</td></tr>
                            </table>
                          </div>

                          <div class="box">
                            <strong>إقرار استلام العهد والتجهيزات:</strong>
                            <p style="font-size: 12px; margin-top: 8px;">يقر الموظف المذكور أعلاه بأنه استلم كافة العهد والتجهيزات المبينة أدناه بحالة جيدة وتعهد بالمحافظة عليها:</p>
                            <ul>
                              ${(employee.custodyItems || ['لاب توب محمول / جهاز كمبيوتر', 'بريد إلكتروني رسمي (@company.com)', 'بطاقة وبصمة بوابات المبنى']).map((c: string) => `<li>${c}</li>`).join('')}
                            </ul>
                          </div>

                          <div class="signatures">
                            <div class="sig-box">
                              <strong>توقيع الموظف المباشر</strong><br/><br/><br/>
                              <span>التاريخ: ${employee.commencementDate || employee.hireDate || ''}</span>
                            </div>
                            <div class="sig-box">
                              <strong>اعتماد مدير الموارد البشرية</strong><br/><br/><br/>
                              <span>شركة المنار كلينك الطبية</span>
                            </div>
                          </div>
                          <script>window.print();</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>🖨️ طباعة إقرار المباشرة</span>
              </button>
            </div>

            {/* 2-Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              <div className="py-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ المباشرة الفعلية</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={employee.commencementDate || employee.hireDate || ''}
                    onChange={(e) => handleFieldChange('commencementDate', e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                    {employee.commencementDate || employee.hireDate || '—'}
                  </div>
                )}
              </div>

              <div className="py-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">المشرف المباشر</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.directSupervisor || employee.manager || ''}
                    onChange={(e) => handleFieldChange('directSupervisor', e.target.value)}
                    className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:outline-none text-sm"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                    {employee.directSupervisor || employee.manager || 'مدير القسم'}
                  </div>
                )}
              </div>
            </div>

            {/* Custody Items */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-500 mb-2">العهد والتجهيزات الرسمية المسلمة للموظف</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {(employee.custodyItems || [
                  'لاب توب محمول / جهاز كمبيوتر',
                  'بريد إلكتروني رسمي (@company.com)',
                  'بطاقة وبصمة بوابات المبنى'
                ]).map((item: string, idx: number) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-600">✓</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              
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

              <div className="py-1.5">
                <label className="block text-xs font-semibold text-emerald-800 mb-1">صافي رصيد الإجازات المتاح (Available Balance)</label>
                <div className="font-mono font-black text-emerald-700 text-sm border-b border-emerald-300 pb-1">
                  {calculatedBalance} يوم
                </div>
              </div>

              <div className="py-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">الرصيد المرحّل من 2025</label>
                <div className="font-mono font-bold text-slate-800 text-sm border-b border-slate-200/70 pb-1">
                  {(employee.carriedOverLeave2025 ?? employee.carriedOverBalance ?? employee.openingBalance ?? 0)} يوم
                </div>
              </div>

              <div className="py-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ بداية العقد الحالي</label>
                <div className="font-mono font-bold text-slate-800 text-sm border-b border-slate-200/70 pb-1">
                  {employee.contractStartDate ? employee.contractStartDate.slice(0, 10) : '—'}
                </div>
              </div>

              <div className="py-1.5">
                <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ نهاية العقد الحالي</label>
                <div className="font-mono font-bold text-slate-800 text-sm border-b border-slate-200/70 pb-1">
                  {employee.contractEndDate ? employee.contractEndDate.slice(0, 10) : 'عقد غير محدد المدة'}
                </div>
              </div>

              <div className="col-span-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-700 text-xs font-medium leading-relaxed mt-2">
                <span className="text-base text-[#714B67]">ℹ️</span>
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
