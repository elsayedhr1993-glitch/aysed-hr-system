import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Landmark,
  BadgeCheck,
  ListChecks
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { triggerContractRunningLeaveAllocation } from '../../utils/contractLeaveTrigger';
import { TabDocumentScanner } from '../TabDocumentScanner';
import { EditableField, EditableSelect } from '../EditableField';
import { getCarriedOverBalance } from '../../utils/kuwaitLaw';
import { buildEmployeeBaselineAllocations, computeFifoLeaveAllocations } from '../../services/leaveService';
import { getEmployeeUnifiedSummary } from '../../utils/leaveEngine';
import { calculateKuwaitDailyRate } from '../../utils/kuwaitPayrollMath';
import { deleteEmployeeDocument, saveEmployeeDocument } from '../../services/documentService';
import { syncEmployeeDocumentsToArchive } from '../../services/employeeDocumentArchiveSync';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { OdooSmartButtons, type SmartButtonStat } from '../ui/OdooSmartButtons';
import { employeeRequiresMohCompliance, mohComplianceGaps } from '../../utils/employeeCompliance';
import { attachSignedContractFileToEmployee } from '../../utils/signedContractUpload';
import { EmployeeOnboardingChecklistModal } from '../onboarding/EmployeeOnboardingChecklistModal';
import { EmployeeOnboardingPlanPanel } from '../onboarding/EmployeeOnboardingPlanPanel';
import { subscribeEmployeeOnboardingChecklist } from '../../services/employeeOnboardingChecklistService';
import { UiStudioTarget } from '../studio/UiStudioTarget';
import { useRegisterReorderGroup } from '../../context/UiStudioContext';
import { UI_KEYS } from '../../utils/uiStudioKeys';

interface Props {
  employee: any;
  onSave: (updatedEmployee: any) => Promise<void>;
  onBack: () => void;
  onDelete?: (id: string, name: string) => void;
  onTriggerPrint: (title: string, data: any) => void;
  onOpenPamModal: () => void;
  onOpenContracts?: () => void;
  onQuickEdit?: () => void;
  onOpenCommencement?: () => void;
  onOpenLeaves?: () => void;
  onOpenPayroll?: () => void;
  commencementRecord?: any;
  activeCompany?: any;
}

export const OdooEmployeeDetailView: React.FC<Props> = ({
  employee: initialEmployee,
  onSave,
  onBack,
  onDelete,
  onTriggerPrint,
  onOpenPamModal,
  onOpenContracts,
  onQuickEdit,
  onOpenCommencement,
  onOpenLeaves,
  onOpenPayroll,
  commencementRecord,
  activeCompany
}) => {
  const { companies, activeCompany: contextActiveCompany } = useCompany();
  const [employee, setEmployee] = useState<any>(() => {
    return { ...initialEmployee };
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  type EmployeeDetailTab =
    | 'work'
    | 'private'
    | 'contract'
    | 'licenses'
    | 'commencement'
    | 'hr'
    | 'onboarding';
  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>('work');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isUploadingSignedContract, setIsUploadingSignedContract] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [showOnboardingChecklist, setShowOnboardingChecklist] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const resolvedCompanyId =
    employee.companyId ||
    employee.company_id ||
    activeCompany?.id ||
    contextActiveCompany?.id ||
    '';

  const handleUploadSignedContract = async (file: File) => {
    if (!resolvedCompanyId) {
      import('react-hot-toast').then((m) => m.default.error('تعذر تحديد الشركة لرفع العقد'));
      return;
    }
    setIsUploadingSignedContract(true);
    try {
      const next = await attachSignedContractFileToEmployee(employee, file, resolvedCompanyId);
      setEmployee(next);
      await onSave(next);
      import('react-hot-toast').then((m) => m.default.success('تم رفع نسخة عقد العمل الموقع بنجاح'));
    } catch (err: any) {
      import('react-hot-toast').then((m) => m.default.error(err?.message || 'تعذر رفع ملف العقد'));
    } finally {
      setIsUploadingSignedContract(false);
    }
  };

  useEffect(() => {
    if (!actionsMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setActionsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [actionsMenuOpen]);

  // تحديث بيانات الموظف عند تغير الـ initialEmployee
  useEffect(() => {
    if (initialEmployee) {
      setEmployee({ ...initialEmployee });
    }
  }, [initialEmployee]);

  // ربط خطة التهيئة من Firestore (مصدر موحّد مع OnboardingTrackerApp)
  useEffect(() => {
    const employeeId = initialEmployee?.id;
    const companyId =
      initialEmployee?.companyId || initialEmployee?.company_id || activeCompany?.id || contextActiveCompany?.id;
    if (!employeeId || !companyId) return;

    const plansQuery = query(collection(db, 'onboarding_plans'), where('companyId', '==', companyId));
    const unsubscribe = onSnapshot(plansQuery, (snapshot) => {
      const plansList = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
      const matchedPlan = plansList.find(
        (p: any) =>
          (initialEmployee?.onboardingPlanId && p.id === initialEmployee.onboardingPlanId) ||
          (p.employeeId && p.employeeId === employeeId) ||
          (initialEmployee?.civilId &&
            p.civilId &&
            p.civilId === initialEmployee.civilId &&
            p.civilId !== 'غير محدد') ||
          (initialEmployee?.nameAr && p.employeeName && p.employeeName === initialEmployee.nameAr)
      );
      if (!matchedPlan) return;
      setEmployee((prev: any) => ({
        ...prev,
        legalChecklist: prev.legalChecklist || matchedPlan.legalChecklist,
        requiredDocuments: prev.requiredDocuments || matchedPlan.requiredDocuments,
        custodyItems: prev.custodyItems || matchedPlan.custodyItems,
        onboardingPlanId: prev.onboardingPlanId || matchedPlan.id
      }));
    }, (error) => console.error('Failed to sync onboarding plan for employee:', error));

    return () => unsubscribe();
  }, [
    initialEmployee?.id,
    initialEmployee?.companyId,
    initialEmployee?.company_id,
    initialEmployee?.civilId,
    initialEmployee?.nameAr,
    initialEmployee?.onboardingPlanId,
    activeCompany?.id,
    contextActiveCompany?.id
  ]);

  useEffect(() => {
    const employeeId = employee?.id || initialEmployee?.id;
    if (!employeeId || !resolvedCompanyId) {
      setOnboardingProgress(0);
      return;
    }
    return subscribeEmployeeOnboardingChecklist(
      employeeId,
      resolvedCompanyId,
      employee,
      (doc) => setOnboardingProgress(doc.progressPercent),
      () => setOnboardingProgress(0)
    );
  }, [employee, initialEmployee?.id, resolvedCompanyId]);

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

  // Daily wage: basic salary ÷ 26 (Kuwait leave standard)
  const dailyWage = calculateKuwaitDailyRate(basicSalary);

  const mapAllocationsForEngine = () =>
    leaveAllocations.map((a: any) => ({
      ...a,
      numberOfDays: Number(a.numberOfDays ?? a.days ?? 0) || 0,
      consumedDays: Number(a.consumedDays || 0) || 0,
      remainingDays:
        a.remainingDays ??
        Math.max(0, (Number(a.numberOfDays ?? a.days ?? 0) || 0) - (Number(a.consumedDays || 0) || 0)),
      allocationType: a.allocationType || 'regular',
      state: a.state || 'validate',
      name: a.name || a.notes,
      dateFrom: a.dateFrom || a.allocationDate
    }));

  const getLeaveEngineSummary = () => {
    const mappedAllocations = mapAllocationsForEngine();
    return getEmployeeUnifiedSummary(employee as any, mappedAllocations as any, leaveRequests as any);
  };

  // Dynamic Time Off Balance Calculation using the core Leave Engine and kuwaitLaw
  const getDynamicBalance = () => {
    try {
      const summary = getLeaveEngineSummary();
      return Number(summary.totalAvailableDays || 0);
    } catch (err) {
      console.error('Failed to compute dynamic balance in detail view:', err);
      const carriedVal = getCarriedOverBalance(employee);
      const scalarBalance = Number(
        (employee as any).remaining_leaves ??
          (employee as any).leaveBalance ??
          (employee as any).paid_days_remaining ??
          0
      );
      return Math.max(0, scalarBalance || carriedVal);
    }
  };

  const getCarriedOverForDisplay = () => {
    try {
      const summary = getLeaveEngineSummary();
      return Number(summary.carriedOverDays ?? summary.remainingCarried ?? 0);
    } catch {
      return getCarriedOverBalance(employee);
    }
  };

  const calculatedBalance = getDynamicBalance();
  const docsCount = employee.documentFiles ? Object.keys(employee.documentFiles).length : 0;
  const leaveRequestsCount = leaveRequests.length;
  const pendingLeavesCount = leaveRequests.filter((r: any) => {
    const s = String(r.status || '').toUpperCase();
    return ['PENDING', 'PENDING_MANAGER', 'PENDING_HR', 'SUBMITTED', 'DRAFT'].includes(s);
  }).length;

  const startDateStr =
    employee.commencementDate || employee.hireDate || employee.join_date || employee.startDate;
  const isCommenced = Boolean(startDateStr);
  const contractCount = employee.contractId || employee.pamContractId ? 1 : 1;

  const masterTabId: 'work' | 'private' | 'contract' | 'licenses' | 'onboarding' =
    activeTab === 'commencement' || activeTab === 'hr'
      ? 'licenses'
      : activeTab === 'onboarding'
        ? 'onboarding'
        : activeTab;

  // Contract status
  const contractStatus = employee.contractStatus || employee.status || 'ساري';
  const isContractRunning = String(contractStatus).toLowerCase() === 'running' || 
                            String(contractStatus).toLowerCase() === 'active' || 
                            contractStatus === 'ساري';

  const mohGaps = mohComplianceGaps(employee);

  const smartButtonStats: SmartButtonStat[] = [
    {
      id: 'contract',
      label: 'العقد',
      value: contractCount,
      icon: FileText,
      colorTheme: 'purple',
      onClick: () => setActiveTab('contract'),
    },
    {
      id: 'leaves',
      label: 'الإجازات',
      value: leaveRequestsCount,
      icon: Plane,
      colorTheme: 'blue',
      badge: pendingLeavesCount > 0 ? String(pendingLeavesCount) : undefined,
      onClick: () => (onOpenLeaves ? onOpenLeaves() : setActiveTab('hr')),
    },
    {
      id: 'balance',
      label: 'رصيد الإجازة',
      value: `${calculatedBalance}`,
      icon: Calendar,
      colorTheme: 'emerald',
      onClick: () =>
        onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee),
    },
    {
      id: 'documents',
      label: 'الوثائق',
      value: docsCount,
      icon: FolderArchive,
      colorTheme: 'indigo',
      onClick: () => setActiveTab('licenses'),
    },
    {
      id: 'onboarding_plan',
      label: 'خطة التهيئة',
      value: `${onboardingProgress}%`,
      icon: ListChecks,
      colorTheme: 'slate',
      onClick: () => setActiveTab('onboarding'),
    },
    ...(onOpenPayroll
      ? [
          {
            id: 'payroll',
            label: 'مسير الرواتب',
            value: totalSalary > 0 ? `${totalSalary} د.ك` : '—',
            icon: DollarSign,
            colorTheme: 'amber' as const,
            onClick: onOpenPayroll,
          },
        ]
      : []),
  ];

  const masterTabs: {
    id: 'work' | 'private' | 'contract' | 'licenses' | 'onboarding';
    label: string;
    labelEn: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'work', label: 'معلومات العمل', labelEn: 'Work information', icon: <Briefcase size={16} /> },
    { id: 'private', label: 'البيانات الشخصية', labelEn: 'Personal data', icon: <User size={16} /> },
    { id: 'contract', label: 'عقد العمل والراتب', labelEn: 'Contract & salary', icon: <FileText size={16} /> },
    {
      id: 'licenses',
      label: 'التراخيص والإقامات (PAM / MOH)',
      labelEn: 'Licenses & residency',
      icon: <Stethoscope size={16} />,
    },
    {
      id: 'onboarding',
      label: 'خطة التهيئة',
      labelEn: 'Onboarding plan',
      icon: <ListChecks size={16} />,
    },
  ];
  const employeeTabUiKeys = masterTabs.map(t => UI_KEYS.employeeTab(t.id));
  const employeeTabsReorderGroupId = 'employee.master.tabs';
  useRegisterReorderGroup(employeeTabsReorderGroupId, employeeTabUiKeys);

  // Dynamic Legal Documents Checklist (Inherited from Onboarding Plan or Defaults)
  const requiredChecklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: employeeRequiresMohCompliance(employee),
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
    e.target.value = '';

    const companyId =
      employee.companyId || activeCompany?.id || contextActiveCompany?.id || '';
    if (!companyId) {
      import('react-hot-toast').then(m =>
        m.default.error('تعذر رفع المستند: لم يتم تحديد الشركة النشطة.')
      );
      return;
    }

    void (async () => {
      const toast = (await import('react-hot-toast')).default;
      try {
        const { uploadEmployeeDocumentToStorage } = await import('../../utils/employeeDocumentStorage');
        const { downloadUrl, storagePath } = await uploadEmployeeDocumentToStorage({
          companyId,
          employeeId: String(employee.id),
          docKey,
          file,
        });

        const fileInfo = {
          id: `${employee.id}-${docKey}`,
          employeeId: employee.id,
          companyId,
          docKey,
          employeeNameAr: employee.fullNameAr || employee.nameAr || employee.name || '',
          civilId: employee.civilId || '',
          category: 'عقود وإقرارات قانونية (Contracts & Declarations)' as const,
          docTitleAr: customTitle || docKey,
          docTitleEn: customTitle || docKey,
          fileType: file.type.includes('pdf') ? 'PDF' as const : 'JPG' as const,
          fileName: file.name,
          name: file.name,
          url: downloadUrl,
          fileUrl: downloadUrl,
          storagePath,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toISOString().slice(0, 10),
          title: customTitle || docKey,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          status: 'verified',
        };

        setEmployee((prev: any) => {
          const currentFiles = prev.documentFiles || {};
          const next = {
            ...prev,
            documentFiles: {
              ...currentFiles,
              [docKey]: fileInfo,
            },
            ...(docKey === 'signedContract'
              ? { signedContractUrl: downloadUrl, contractSigned: true }
              : {}),
          };
          void saveEmployeeDocument(fileInfo as any)
            .then(() => syncEmployeeDocumentsToArchive(next as Record<string, unknown>))
            .catch(error => {
              console.error('Failed to persist employee document:', error);
              toast.error(error?.message || 'تعذر أرشفة المستند في قاعدة البيانات');
            });
          return next;
        });

        toast.success(`تم حفظ وإرفاق مستند (${file.name}) بنجاح.`);
      } catch (error: any) {
        console.error('Employee document upload failed:', error);
        toast.error(error?.message || 'تعذر رفع المستند إلى التخزين السحابي');
      }
    })();
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
    <div
      className="min-h-screen bg-slate-100/60 py-2 sm:py-3 text-right font-sans text-slate-900 w-full"
      dir="rtl"
      data-master-layout="wide"
      data-employee-master-layout="wide-toolbar-v2"
    >
      <div className="odoo-workspace-inner space-y-4">
      
      {/* Breadcrumb — سطر مستقل */}
      <div className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#714B67] hover:text-[#5a3b52] hover:bg-purple-50 px-2 py-1 rounded-lg border border-[#714B67]/25 transition cursor-pointer shrink-0"
          >
            <ArrowRight size={15} />
            <span>العودة لدليل الموظفين</span>
          </button>
          <span className="text-slate-300 shrink-0">/</span>
          <span className="text-slate-900 truncate max-w-[min(100%,280px)] sm:max-w-md">
            {employee.nameAr || employee.fullNameAr || 'ملف موظف'}
          </span>
          <span className="font-mono bg-purple-50 text-[#714B67] border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
            {employee.id}
          </span>
        </nav>
      </div>

      {/* شريط الإجراءات */}
      <div className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Check size={14} /> تم الحفظ
            </span>
          )}
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Undo2 size={15} />
                <span>إلغاء</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Edit3 size={15} />
              <span>تعديل الملف</span>
            </button>
          )}
        </div>

        {!isEditMode && (
          <div className="relative shrink-0" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => setActionsMenuOpen((v) => !v)}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>إجراءات</span>
              <ChevronDown size={14} className={`text-slate-500 transition ${actionsMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {actionsMenuOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 text-right animate-in fade-in duration-100">
                {onQuickEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setActionsMenuOpen(false);
                      onQuickEdit();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} className="text-emerald-600" />
                    تعديل سريع
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActionsMenuOpen(false);
                    onTriggerPrint(`ملف الموظف الشامل - ${employee.nameAr || employee.id}`, employee);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} className="text-[#714B67]" />
                  طباعة الملف (A4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionsMenuOpen(false);
                    onTriggerPrint(`كشف رصيد إجازات الموظف - ${employee.nameAr || employee.id}`, employee);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={14} />
                  طباعة كشف الإجازات
                </button>
                {(onOpenContracts || onOpenCommencement || onOpenLeaves || onOpenPayroll) && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <p className="px-3 py-1 text-[10px] font-bold text-slate-400">انتقال سريع</p>
                    {onOpenContracts && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionsMenuOpen(false);
                          onOpenContracts();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium hover:bg-purple-50 text-purple-900 cursor-pointer text-right"
                      >
                        العقود
                      </button>
                    )}
                    {onOpenCommencement && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionsMenuOpen(false);
                          onOpenCommencement();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium hover:bg-emerald-50 text-emerald-900 cursor-pointer text-right"
                      >
                        المباشرة
                      </button>
                    )}
                    {onOpenLeaves && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionsMenuOpen(false);
                          onOpenLeaves();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-50 text-blue-900 cursor-pointer text-right"
                      >
                        الإجازات
                      </button>
                    )}
                    {onOpenPayroll && (
                      <button
                        type="button"
                        onClick={() => {
                          setActionsMenuOpen(false);
                          onOpenPayroll();
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-medium hover:bg-amber-50 text-amber-900 cursor-pointer text-right"
                      >
                        المسير
                      </button>
                    )}
                  </>
                )}
                {onDelete && employee.id && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setActionsMenuOpen(false);
                        onDelete(employee.id, employee.nameAr);
                      }}
                      className="w-full px-3 py-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      حذف الموظف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Odoo HR Master Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm w-full p-5 sm:p-6 md:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {/* Status ribbon */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'docs', label: 'مستندات', ok: docsCount >= 3, onClick: () => setActiveTab('licenses') },
              { key: 'start', label: 'مباشرة', ok: isCommenced, onClick: () => setActiveTab('commencement') },
              { key: 'wps', label: 'WPS', ok: totalSalary > 0 && !!(employee.iban || employee.iban_number), onClick: () => setActiveTab('contract') },
              { key: 'duty', label: isContractRunning ? 'نشط' : 'غير نشط', ok: isContractRunning, onClick: () => setActiveTab('work') },
            ].map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onClick}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                  chip.ok
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
            {mohGaps.length > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                MOH {mohGaps.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        {/* Profile Header Block: Avatar + Name + Subtitle + Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full min-w-0">
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

            <p className="text-sm font-bold text-[#714B67] pt-0.5">
              {employee.jobTitle || 'المسمى الوظيفي'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {employee.dept || employee.department || '—'} · {displayCompanyName}
            </p>
            {!isEditMode && (
              <p className="text-[11px] text-slate-400 font-mono">{employee.nameEn || employee.fullNameEn || ''}</p>
            )}
            {isEditMode && (
              <input
                type="text"
                value={employee.nameEn || ''}
                onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                placeholder="English Name"
                className="mt-1 text-xs font-semibold text-slate-700 border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none w-full max-w-md"
              />
            )}

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
                      onClick={() => setActiveTab('licenses')}
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
                      onClick={() => setActiveTab('licenses')}
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

        <div className="w-full min-w-0 border-t border-slate-100 pt-3">
          <OdooSmartButtons stats={smartButtonStats} variant="toolbar" />
        </div>
        </div>


        <div className="flex flex-wrap gap-1 border-b-2 border-slate-200 pt-1">
          {masterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition flex items-center gap-2 shrink-0 cursor-pointer border-b-2 -mb-[2px] ${
                masterTabId === tab.id
                  ? 'bg-white text-[#714B67] border-[#714B67]'
                  : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <UiStudioTarget
                uiKey={UI_KEYS.employeeTab(tab.id)}
                kind="tab"
                defaults={{ label: { ar: tab.label, en: tab.labelEn } }}
                reorderGroupId={employeeTabsReorderGroupId}
              >
                {tab.label}
              </UiStudioTarget>
            </button>
          ))}
        </div>

        <div className="w-full pt-2 odoo-master-form-sheet employee-master-form-sheet">
        {(activeTab === 'commencement' || activeTab === 'hr') && (
          <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('licenses')}
              className="text-[#714B67] font-bold hover:underline cursor-pointer"
            >
              ← العودة للتبويبات الرئيسية
            </button>
            <span className="text-slate-300">|</span>
            <span className="font-semibold">
              {activeTab === 'commencement' ? 'إقرار المباشرة' : 'رصيد الإجازات والموارد البشرية'}
            </span>
          </div>
        )}

        {/* Tab 1: معلومات العمل (Work Information) */}
        {activeTab === 'work' && (
          <EmployeeWorkTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            onOpenContracts={onOpenContracts}
            onOpenLeaveSettings={() => setActiveTab('hr')}
            displayedCarriedOverDays={getCarriedOverForDisplay()}
            compact
          />
        )}

        {/* Tab 2: عقد العمل والأجر الشامل (Contract & Wages) */}
        {activeTab === 'contract' && (
          <EmployeeContractTab
            employee={employee}
            isEditMode={false}
            handleFieldChange={handleFieldChange}
            onOpenPamModal={onOpenPamModal}
            onOpenContracts={onOpenContracts}
            onUploadSignedContract={handleUploadSignedContract}
            isUploadingSignedContract={isUploadingSignedContract}
          />
        )}

        {/* Tab 3: إقرار المباشرة والجاهزية (Job Commencement) */}
        {activeTab === 'commencement' && (
          <EmployeeCommencementTab
            employee={employee}
            commencementRecord={commencementRecord}
            onOpenCommencementApp={onOpenCommencement}
          />
        )}
        {activeTab === 'private' && (
          <EmployeePrivateTab
            employee={employee}
            isEditMode={isEditMode}
            handleFieldChange={handleFieldChange}
            handleOcrResult={handleOcrResult}
            compact
          />
        )}
        {activeTab === 'licenses' && (
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
            onOpenTimeOffApp={onOpenLeaves}
            holidayWorkReadOnly={Boolean(onOpenLeaves)}
          />
        )}
        {activeTab === 'onboarding' && (
          <EmployeeOnboardingPlanPanel
            employeeId={String(employee?.id || '')}
            companyId={String(resolvedCompanyId || '')}
            employee={employee as Record<string, unknown>}
            employeeName={employee.nameAr || employee.name}
          />
        )}
        </div>
      </div>
      </div>

      <EmployeeOnboardingChecklistModal
        isOpen={showOnboardingChecklist}
        onClose={() => setShowOnboardingChecklist(false)}
        employeeId={String(employee?.id || '')}
        companyId={String(resolvedCompanyId || '')}
        employee={employee}
        employeeName={employee?.nameAr || employee?.fullNameAr}
      />
    </div>
  );
};

export default OdooEmployeeDetailView;
