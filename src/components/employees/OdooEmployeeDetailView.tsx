import React, { useState, useEffect } from 'react';
import { EmployeeWorkTab } from './tabs/EmployeeWorkTab';
import { EmployeePrivateTab } from './tabs/EmployeePrivateTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { EmployeeContractTab } from './tabs/EmployeeContractTab';
import { EmployeeCommencementTab } from './tabs/EmployeeCommencementTab';
import { EmployeeHRTab } from './tabs/EmployeeHRTab';
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
import { deleteEmployeeDocument, saveEmployeeDocument } from '../../services/documentService';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);

  // تحديث بيانات الموظف عند تغير الـ initialEmployee
  useEffect(() => {
    if (initialEmployee) {
      setEmployee({ ...initialEmployee });
    }
  }, [initialEmployee]);

  useEffect(() => {
    const employeeId = initialEmployee?.id;
    const companyId = initialEmployee?.companyId || initialEmployee?.company_id || activeCompany?.id;
    if (!employeeId || !companyId) {
      setLeaveRequests([]);
      setLeaveAllocations([]);
      return;
    }

    const requestsQuery = query(
      collection(db, 'leave_requests'),
      where('companyId', '==', companyId),
      where('employeeId', '==', employeeId)
    );
    const allocationsQuery = query(
      collection(db, 'leave_allocations'),
      where('companyId', '==', companyId),
      where('employeeId', '==', employeeId)
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, snapshot => {
      setLeaveRequests(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, error => console.error('Failed to load employee leave requests:', error));
    const unsubscribeAllocations = onSnapshot(allocationsQuery, snapshot => {
      setLeaveAllocations(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, error => console.error('Failed to load employee leave allocations:', error));

    return () => {
      unsubscribeRequests();
      unsubscribeAllocations();
    };
  }, [initialEmployee?.id, initialEmployee?.companyId, initialEmployee?.company_id, activeCompany?.id]);

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
      // Firestore is the operational source for leave balances.
      const mappedAllocations = leaveAllocations.map((a: any) => ({
        ...a,
        numberOfDays: a.numberOfDays ?? a.days ?? 0,
        consumedDays: a.consumedDays || 0,
        remainingDays: a.remainingDays ?? Math.max(0, (a.numberOfDays ?? a.days ?? 0) - (a.consumedDays || 0)),
        allocationType: a.allocationType || 'regular',
        state: a.state || 'validate',
        name: a.name || a.notes,
        dateFrom: a.dateFrom || a.allocationDate
      }));

      // Build baseline allocations including carried-over and accrued entitlement.
      const empAllocs = buildEmployeeBaselineAllocations(employee as any, mappedAllocations as any);
      const fifoResult = computeFifoLeaveAllocations(employee as any, empAllocs, leaveRequests as any);

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
        id: `${employee.id}-${docKey}`,
        employeeId: employee.id,
        employeeNameAr: employee.fullNameAr || employee.name || '',
        civilId: employee.civilId || '',
        category: 'عقود وإقرارات قانونية (Contracts & Declarations)' as const,
        docTitleAr: customTitle || docKey,
        docTitleEn: customTitle || docKey,
        fileType: file.type.includes('pdf') ? 'PDF' as const : 'JPG' as const,
        fileName: file.name,
        name: file.name,
        url: base64Url,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().slice(0, 10),
        title: customTitle || docKey,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        status: 'verified'
      };

      void saveEmployeeDocument(fileInfo as any).catch(error => {
        console.error('Failed to persist employee document:', error);
      });

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
    void deleteEmployeeDocument(`${employee.id}-${docKey}`).catch(error => {
      console.error('Failed to delete employee document:', error);
    });
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
      import('react-hot-toast').then(m => m.default.success(`تم حفظ بيانات الموظف (${payloadToSave.nameAr || payloadToSave.fullNameAr}) بنجاح والبقاء في نفس الصفحة.`));
    } catch (err) {
      console.error('Failed to save employee:', err);
      import('react-hot-toast').then(m => m.default.error('حدث خطأ أثناء حفظ بيانات الموظف.'));
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
          <span className="text-slate-900 font-bold">{employee.nameAr || employee.fullNameAr || 'ملف موظف'}</span>
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
                <div className="text-xs font-bold text-slate-900 font-mono">1 نشط</div>
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
                <div className="text-xs font-bold text-slate-900 font-mono">{calculatedBalance} يوم</div>
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
                <div className="text-xs font-bold text-slate-900">طباعة QR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Header Block: Avatar + Name + Subtitle + Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
          <div className={`w-20 h-20 rounded-2xl ${employee.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 overflow-hidden relative`}>
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
                  className="text-2xl font-bold text-slate-900 border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1 bg-white focus:outline-none transition"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
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
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0"
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
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0"
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

        {/* Visual Lifecycle Timeline (الربط الديناميكي الاحترافي بدورة حياة الموظف) */}
        {(() => {
          // Calculations
          const docsCount = employee.documentFiles ? Object.keys(employee.documentFiles).length : 0;
          const totalReqDocs = 6;
          const docsProgress = Math.min(100, Math.round((docsCount / totalReqDocs) * 100));

          const startDateStr = employee.commencementDate || employee.hireDate || employee.join_date || employee.startDate;
          let isCommenced = !!startDateStr;
          
          let probationDaysPassed = 0;
          let probationRemaining = 100;
          let probationPercentage = 0;
          let isProbationPassed = false;
          if (startDateStr) {
            const start = new Date(startDateStr);
            const today = new Date();
            const diffTime = today.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            probationDaysPassed = Math.max(0, diffDays);
            if (probationDaysPassed >= 100) {
              isProbationPassed = true;
              probationPercentage = 100;
              probationRemaining = 0;
            } else {
              probationPercentage = Math.round((probationDaysPassed / 100) * 100);
              probationRemaining = 100 - probationDaysPassed;
            }
          }

          const hasWpsSalary = (parseFloat(employee.basicSalary) || parseFloat(employee.salary) || 0) > 0;
          const hasIban = !!(employee.iban || employee.iban_number);
          const hasBank = !!(employee.bankName || employee.bank_name);
          const isWpsEnrolled = hasWpsSalary && hasIban && hasBank;

          const isFullyActive = isCommenced && isProbationPassed && isWpsEnrolled && (employee.status === 'على رأس العمل' || !employee.status || employee.status === 'ACTIVE');

          return (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 md:p-5 space-y-4 shadow-3xs" id="employee_lifecycle_timeline">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-100 text-[#714B67] rounded-lg">
                    <RefreshCw size={15} className="animate-spin-slow" />
                  </span>
                  <span className="font-bold text-xs text-slate-800">تتبع دورة حياة الموظف المهنية المترابطة (Employee Lifecycle)</span>
                </div>
                <span className="text-[10px] font-bold text-[#714B67] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                  الربط التلقائي النشط
                </span>
              </div>

              {/* Horizontal Stepper Timeline */}
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2 pt-2 pb-1">
                {/* Connector line (desktop only) */}
                <div className="absolute top-[26px] right-8 left-8 h-[2px] bg-slate-200 -z-0 hidden md:block" />

                {/* Step 1: Onboarding Docs */}
                <div 
                  onClick={() => setActiveTab('documents')}
                  className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center flex-1 cursor-pointer group z-10 w-full md:w-auto"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 border-2 ${
                    docsCount >= 3 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-500 border-slate-300 group-hover:border-purple-500'
                  }`}>
                    {docsCount >= 3 ? '✓' : '1'}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block group-hover:text-[#714B67] transition">أرشفة وتهيئة المستندات</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {docsCount} وثائق مرفقة ({docsProgress}%)
                    </span>
                  </div>
                </div>

                {/* Step 2: Commencement */}
                <div 
                  onClick={() => setActiveTab('commencement')}
                  className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center flex-1 cursor-pointer group z-10 w-full md:w-auto"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 border-2 ${
                    isCommenced 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-500 border-slate-300 group-hover:border-purple-500'
                  }`}>
                    {isCommenced ? '✓' : '2'}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block group-hover:text-[#714B67] transition">مباشرة العمل الفعلية</span>
                    <span className="text-[10px] text-slate-500 block">
                      {isCommenced ? `تمت في ${startDateStr}` : 'بانتظار تأكيد المباشرة'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Probation */}
                <div 
                  className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center flex-1 z-10 w-full md:w-auto"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 border-2 ${
                    !isCommenced 
                      ? 'bg-slate-50 text-slate-300 border-slate-200'
                      : isProbationPassed 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-amber-500 text-white border-amber-500 animate-pulse'
                  }`}>
                    {isProbationPassed ? '✓' : '3'}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block">فترة التجربة (100 يوم)</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {isCommenced 
                        ? (isProbationPassed ? 'اجتاز فترة التجربة' : `متبقي ${probationRemaining} يوماً (${probationPercentage}%)`) 
                        : 'معلقة لحين المباشرة'}
                    </span>
                  </div>
                </div>

                {/* Step 4: Payroll & WPS */}
                <div 
                  onClick={() => setActiveTab('contract')}
                  className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center flex-1 cursor-pointer group z-10 w-full md:w-auto"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 border-2 ${
                    isWpsEnrolled 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-500 border-slate-300 group-hover:border-purple-500'
                  }`}>
                    {isWpsEnrolled ? '✓' : '4'}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block group-hover:text-[#714B67] transition">نظام الرواتب والـ WPS</span>
                    <span className="text-[10px] text-slate-500 block">
                      {isWpsEnrolled ? 'مسجل ومثبت' : (hasWpsSalary ? 'بانتظار الآيبان والبنك' : 'غير مسجل بالرواتب')}
                    </span>
                  </div>
                </div>

                {/* Step 5: Active Duty */}
                <div 
                  onClick={() => setActiveTab('hr')}
                  className="flex items-center md:flex-col gap-3 md:gap-2 text-right md:text-center flex-1 cursor-pointer group z-10 w-full md:w-auto"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 border-2 ${
                    isFullyActive 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white text-slate-500 border-slate-300 group-hover:border-purple-500'
                  }`}>
                    {isFullyActive ? '✓' : '5'}
                  </div>
                  <div>
                    <span className="font-bold text-[11px] text-slate-800 block group-hover:text-[#714B67] transition">كادر دائم نشط</span>
                    <span className="text-[10px] text-slate-500 block">
                      {isFullyActive ? 'مكتمل بالكامل وبلا نواقص' : 'بانتظار استيفاء الشروط'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Informative alerts / stats block connected to the current active stage */}
              <div className="border border-slate-200/60 bg-white rounded-lg p-3 text-xs text-slate-700 leading-relaxed font-sans space-y-2">
                {!isCommenced ? (
                  <div className="flex items-start gap-2 text-amber-900">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>تنبيه الموارد البشرية:</strong> الموظف مسجل في قاعدة البيانات كـ <span className="underline font-bold">مسودة أو تحت التهيئة</span>. يرجى استكمال المستندات اللازمة وتحديد تاريخ مباشرة العمل الفعلية في علامة تبويب "إقرار المباشرة" لتنشيط ملفه بشكل كامل وتوليد عقده بشكل تلقائي.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1: Probation Warning System */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <Clock size={14} className="text-[#714B67]" />
                        <span>نظام فترة التجربة والتحذير المسبق:</span>
                      </div>
                      {isProbationPassed ? (
                        <p className="text-[11px] text-emerald-800 font-bold">
                          ✓ اجتاز الموظف فترة التجربة القانونية بنجاح (100 يوم) من تاريخ مباشرة العمل ({startDateStr}) وتم تثبيته رسمياً كعضو كادر دائم بالمنشأة بموجب قانون العمل الكويتي.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[11px] text-slate-600">
                            الموظف حالياً في <span className="font-bold text-[#714B67]">فترة التجربة القانونية</span>. مضى منها <span className="font-mono font-bold">{probationDaysPassed} يوم</span> ومتبقي <span className="font-mono font-bold text-amber-700">{probationRemaining} يوم</span>.
                          </p>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-50 h-1.5 rounded-full" style={{ width: `${probationPercentage}%` }} />
                          </div>
                          {probationRemaining <= 15 && (
                            <p className="text-[10px] text-rose-700 font-bold animate-pulse">
                              🚨 تحذير: متبقي أقل من 15 يوماً لاتخاذ قرار التثبيت أو إنهاء الخدمة قبل انتهاء فترة التجربة القانونية!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Column 2: Payroll WPS Integration */}
                    <div className="space-y-1 border-r border-slate-100 pr-4">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>جاهزية نظام حماية الأجور والـ WPS:</span>
                      </div>
                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={hasWpsSalary ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {hasWpsSalary ? "✓" : "✗"}
                          </span>
                          <span>إدراج الأجر الأساسي والبدلات ({totalSalary} د.ك)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={hasBank ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {hasBank ? "✓" : "✗"}
                          </span>
                          <span>الحساب البنكي: {employee.bankName || "غير محدد"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={hasIban ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {hasIban ? "✓" : "✗"}
                          </span>
                          <span>الآيبان البنكي (IBAN): {employee.iban || "غير محدد"}</span>
                        </div>
                        {isWpsEnrolled ? (
                          <p className="text-[10px] text-emerald-800 font-bold pt-1">
                            ✓ الموظف جاهز ومدرج تلقائياً في ملف حماية الأجور والـ WPS للدورة القادمة.
                          </p>
                        ) : (
                          <p className="text-[10px] text-amber-700 font-bold pt-1">
                            ⚠️ يرجى إدخال البيانات المصرفية الناقصة في تبويب "البيانات الشخصية" لتجنب مخالفات الشؤون في ملف WPS.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Clean Notebook Tabs Bar */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pt-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'work'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <Briefcase size={15} />
            <span>معلومات العمل (Work Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'contract'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span>📄</span>
            <span>عقد العمل والبدلات (Contract & Salary)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commencement')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'commencement'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <span>🚀</span>
            <span>إقرار المباشرة والجاهزية (Job Commencement)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'private'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck size={15} />
            <span>البيانات الشخصية (Private Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'documents'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <FileSpreadsheet size={15} />
            <span>المستندات والتراخيص الكويتية (Documents)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer duration-200 ${
              activeTab === 'hr'
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
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
          <EmployeeContractTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            onOpenPamModal={onOpenPamModal}
          />
        )}

        {/* Tab 3: إقرار المباشرة والجاهزية (Job Commencement) */}
        {activeTab === 'commencement' && (
          <EmployeeCommencementTab
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
            isEditMode={false} // شاشة مستندات الموظف تكون فقط للمشاهدة كما هو مطلوب بالكامل
            handleFieldChange={handleFieldChange}
            handleOcrResult={handleOcrResult}
            handleDocFileUpload={handleDocFileUpload}
            handleRemoveDocFile={handleRemoveDocFile}
            handleToggleDocRequirement={handleToggleDocRequirement}
          />
        )}
        {activeTab === 'hr' && (
          <EmployeeHRTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            handleOcrResult={handleOcrResult}
            calculatedBalance={calculatedBalance}
            onRefresh={() => setEmployee((prev: any) => ({ ...prev, _refreshTrigger: (prev._refreshTrigger || 0) + 1 }))}
          />
        )}
      </div>
    </div>
  );
};

export default OdooEmployeeDetailView;
