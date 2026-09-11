import React, { useState, useEffect } from 'react';
import { parseKuwaitCivilId, validateKuwaitCivilId } from './utils/kuwaitLaw';
import { TenantProvider, useTenant } from './context/TenantContext';
import { useCompany } from './context/CompanyContext';
import { OdooHierarchyProvider, useOdooHierarchy } from './context/OdooHierarchyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Users, 
  Clock, 
  Calendar, 
  Palmtree, 
  CreditCard, 
  Briefcase, Package, 
  FolderArchive, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  Building2, 
  ShieldAlert, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  LogOut, 
  Building,
  UserCircle,
  Settings,
  Shield,
  KeyRound,
  Phone,
  Layers,
  ArrowRight,
  Scan,
  Upload,
  Stethoscope
} from 'lucide-react';

// استيراد التطبيقات الكاملة الـ 11
import EmployeesApp from './apps/EmployeesApp';
import OdooAppLauncher from './components/OdooAppLauncher';
import { TopEnterpriseActionBar } from './components/header/TopEnterpriseActionBar';
import { GlobalSpotlightSearchModal } from './components/header/GlobalSpotlightSearchModal';
import { KuwaitHrQuickCalculatorModal } from './components/modals/KuwaitHrQuickCalculatorModal';
import { OdooAttendanceApp } from './components/OdooAttendanceApp';
import { OdooTimeOffApp } from './components/OdooTimeOffApp';
import { OdooPayrollApp } from './components/OdooPayrollApp';
import { OdooOperationsApp } from './components/OdooOperationsApp';
import { DocumentsApp } from './apps/DocumentsApp';
import { OdooTemplatesApp } from './components/OdooTemplatesApp';
import { OdooPublicHolidaysApp } from './components/OdooPublicHolidaysApp';
import { OdooReportsApp } from './components/OdooReportsApp';
import { OdooSettingsFull } from './components/OdooSettingsFull';
import { SettingsApp } from './apps/SettingsApp';
import { ScannerApp } from './apps/ScannerApp';
import { OdooMohMedicalHubApp } from './apps/OdooMohMedicalHubApp';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { OdooDebugMenu } from './components/OdooDebugMenu';
import OdooLoginPage from './components/OdooLoginPage';
import { TenantDatabaseService } from './services/tenantDataService';
import { AuditLogsApp } from './apps/AuditLogsApp';
import { RecruitmentApp } from './apps/RecruitmentApp';
import { OdooContractsApp } from './components/OdooContractsApp';
import { Candidate } from './types';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from './utils/persistentStorage';
import { AysedAICopilot } from './components/AysedAICopilot';
import { ComplianceSmartSentinelModal } from './components/ComplianceSmartSentinelModal';
import { LegalDocumentBotModal } from './components/LegalDocumentBotModal';
import { DataPayrollAnalystBotModal } from './components/DataPayrollAnalystBotModal';
import { FacilityLicensingWizardModal } from './components/facility/FacilityLicensingWizardModal';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { cleanFirestoreData, db } from './lib/firebase';

type AppId = 
  | 'switcher' 
  | 'employees' 
  | 'recruitment'
  | 'contracts'
  | 'attendance' 
  | 'leaves' 
  | 'payroll' 
  | 'custody' 
  | 'archive' 
  | 'letters' 
  | 'holidays' 
  | 'reports' 
  | 'settings'
  | 'settings_dev'
  | 'saas_admin'
  | 'scanner'
  | 'moh'
  | 'audit';

function MainAppLayout() {
  const { 
    isSuperAdmin, 
    isActualSuperAdmin,
    activeCompany, 
    companies, 
    impersonatingCompanyId, 
    impersonateCompany, 
    exitImpersonation,
    addCompany,
    updateCompanyPassword,
    deleteCompany
  } = useTenant();

  const { isImpersonating, startImpersonation, exitImpersonation: exitCompanyImpersonation } = useCompany();

  const { employees, attendance, computedPayslips, addEmployee, updateEmployee } = useOdooHierarchy();

  const { logout, user, isLoading, updateAvatar } = useAuth();


  const [shifts, setShifts] = useState<any[]>([]);
  const [employeeShifts, setEmployeeShifts] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // User Avatar & Profile state
  const [userAvatar, setUserAvatar] = useState<string>(
    user?.photoURL || localStorage.getItem('aysed_user_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );

  useEffect(() => {
    if (user?.photoURL) {
      setUserAvatar(user.photoURL);
      localStorage.setItem('aysed_user_avatar', user.photoURL);
    }
  }, [user?.photoURL]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const isDevPreview = window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost');
  
  const [activeApp, setActiveApp] = useState<AppId>(() => {
    return isDevPreview ? 'saas_admin' : 'switcher';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState({ pending: 0, onLeaveToday: 0 });
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSentinelOpen, setIsSentinelOpen] = useState(false);
  const [isLegalBotOpen, setIsLegalBotOpen] = useState(false);
  const [isAnalystBotOpen, setIsAnalystBotOpen] = useState(false);
  const [isFacilityWizardOpen, setIsFacilityWizardOpen] = useState(false);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) {
      setLeaveStats({ pending: 0, onLeaveToday: 0 });
      return;
    }
    const leavesQuery = query(collection(db, 'leave_requests'), where('companyId', '==', companyId));
    return onSnapshot(leavesQuery, snapshot => {
      const today = new Date().toISOString().slice(0, 10);
      const requests = snapshot.docs.map(item => item.data() as any);
      setLeaveStats({
        pending: requests.filter(request => ['pending', 'pending_manager', 'pending_hr', 'WAITING', 'DRAFT', 'قيد الانتظار'].includes(request.status)).length,
        onLeaveToday: requests.filter(request => ['approved', 'APPROVED'].includes(request.status) && request.startDate <= today && request.endDate >= today).length
      });
    }, error => console.error('Failed to load leave statistics from Firestore:', error));
  }, [activeCompany?.id]);
  const [contracts, setContracts] = useState<any[]>(() => {
    return getPersistentData<any[]>(MANARA_STORAGE_KEYS.CONTRACTS, []);
  });

  // إدارة المرشحين وبيانات التوظيف الذكية (Recruitment & ATS)
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) {
      setCandidates([]);
      return;
    }

    const candidatesQuery = query(collection(db, 'candidates'), where('companyId', '==', companyId));
    return onSnapshot(candidatesQuery, snapshot => {
      setCandidates(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Candidate)));
    }, error => console.error('Failed to load candidates from Firestore:', error));
  }, [activeCompany?.id]);

  const handleSaveCandidate = async (cand: Candidate) => {
    const companyId = cand.companyId || activeCompany?.id || 'comp-super-admin';
    const candidate = { ...cand, companyId, updatedAt: new Date().toISOString() };
    setCandidates(prev => {
      const existingIndex = prev.findIndex(c => c.id === candidate.id);
      let updated: Candidate[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = candidate;
      } else {
        updated = [candidate, ...prev];
      }
      return updated;
    });
    await setDoc(doc(db, 'candidates', candidate.id), cleanFirestoreData(candidate), { merge: true });
    toast.success('تم حفظ وتحديث بيانات المرشح بنجاح');
  };

  const handleConvertCandidateToEmployee = async (cand: Candidate) => {
    const newEmpId = `EMP-${Date.now().toString().slice(-6)}`;
    const compId = activeCompany?.id || 'comp-super-admin';
    const compName = activeCompany?.nameAr || (activeCompany as any)?.name || 'المنار كلينك';
    const todayStr = new Date().toISOString().split('T')[0];

    const newEmployeeRecord = {
      id: newEmpId,
      name: cand.fullName,
      fullNameAr: cand.fullName,
      nameAr: cand.fullName,
      fullNameEn: '',
      nameEn: '',
      civilId: '',
      passportNo: '',
      passportExpiry: '',
      residencyExpiry: '',
      jobTitle: cand.appliedPosition,
      department: cand.department || 'الموارد البشرية والإدارة',
      dept: cand.department || 'الموارد البشرية والإدارة',
      basicSalary: cand.expectedSalary || 600,
      housingAllowance: 100,
      transportAllowance: 50,
      medicalAllowance: 0,
      status: 'ONBOARDING',
      contractStatus: 'draft',
      joinDate: todayStr,
      nationality: 'كويتي',
      companyId: compId,
      phone: cand.phone,
      email: cand.email,
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: '',
      notes: `تم التعيين والتحويل من بوابة التوظيف - مرحلة التهيئة والتعاقد الأولية`
    };

    addEmployee(newEmployeeRecord as any);

    // إنشاء خطة تهيئة واستقبال تلقائية في Firestore
    try {
      const newPlan = {
        id: `ONB-${Date.now().toString().slice(-6)}`,
        employeeId: newEmpId,
        employeeName: cand.fullName,
        jobTitle: cand.appliedPosition,
        department: cand.department || 'العموم',
        civilId: 'غير محدد',
        expectedStartDate: todayStr,
        templateType: (cand.department || '').includes('أطباء') ? 'medical_specialist' : 'general',
        status: 'active',
        progressPercentage: 20,
        tasks: [
          { id: 't1', title: 'استلام وتدقيق أوراق التعيين والبطاقة المدنية', category: 'legal', assignedToRole: 'الموارد البشرية', completed: false },
          { id: 't2', title: 'إعداد وتوقيع عقد العمل الرسمي', category: 'legal', assignedToRole: 'مسؤول العقود', completed: false },
          { id: 't3', title: 'تسجيل الموظف في البصمة وإصدار البريد الإلكتروني', category: 'it', assignedToRole: 'تقنية المعلومات', completed: false },
          { id: 't4', title: 'توقيع واعتماد إقرار مباشرة العمل وتحديد الدوام', category: 'legal', assignedToRole: 'مدير الموارد البشرية', completed: false }
        ],
        custodyItems: ['بطاقة الهوية', 'بريد إلكتروني'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'onboarding_plans', newPlan.id), cleanFirestoreData({ ...newPlan, companyId: compId }), { merge: true });
    } catch (e) {
      console.error('Error auto-creating onboarding plan:', e);
    }

    // إنشاء سجل مباشرة عمل مبدئي في Firestore
    try {
      const newCommRecord = {
        id: `COM-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
        companyId: compId,
        companyName: compName,
        employeeId: newEmpId,
        employeeName: cand.fullName,
        civilId: 'غير محدد',
        jobTitle: cand.appliedPosition,
        department: cand.department || 'العموم',
        commencementDate: todayStr,
        reportingTime: '08:00',
        workScheduleId: 'SCHEDULE-A',
        workScheduleName: 'دوام صباحي كادر طبي (8:00 ص - 4:00 م)',
        supervisorName: 'مدير الموارد البشرية',
        readinessStatus: 'IN_PREPARATION',
        isUnderProbation: true,
        probationDaysTotal: 100,
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'commencements', newCommRecord.id), cleanFirestoreData(newCommRecord), { merge: true });
    } catch (e) {
      console.error('Error auto-creating draft commencement:', e);
    }

    handleSaveCandidate({
      ...cand,
      stage: 'HIRED'
    });

    toast.success(`🎉 تم نقل المرشح (${cand.fullName}) إلى مرحلة "التهيئة والتعاقد (Onboarding)". بانتظار توثيق وتأكيد مباشرة العمل.`);
  };

  // Load documents when activeCompany?.id changes (Cloud-First Single Source of Truth)
  useEffect(() => {
    let isMounted = true;
    if (activeCompany?.id) {
      TenantDatabaseService.getDocumentsByTenant(activeCompany.id).then(dbDocs => {
        if (isMounted) {
          if (dbDocs && dbDocs.length > 0) {
            setDocuments(dbDocs);
          } else {
            setDocuments([]);
          }
        }
      }).catch(() => {
        if (isMounted) setDocuments([]);
      });
    } else {
      setDocuments([]);
    }
    return () => { isMounted = false; };
  }, [activeCompany?.id]);

  const handleSaveDocument = async (doc: any) => {
    setDocuments(prev => [doc, ...prev]);
    if (activeCompany?.id) {
      await TenantDatabaseService.saveDocument(doc, activeCompany.id);
    }
    toast.success('تم حفظ المستند في الأرشيف والسحابة بنجاح');
  };

  const handleDeleteDocument = async (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (activeCompany?.id) {
      await TenantDatabaseService.deleteDocument(docId, activeCompany.id);
    }
    toast.success('تم حذف المستند');
  };
  const [employeeNotifications, setEmployeeNotifications] = useState<any[]>([]);

  const handleAutoAddEmpFromOCR = async (empData: any, docType?: string): Promise<string> => {
    const normalizedDoc = (docType || empData?.documentType || 'civil_id').toLowerCase();
    const civilIdClean = (empData.civilId || empData.civil_id || '').replace(/\D/g, '');
    const passportClean = (empData.passportNo || empData.passport_no || '').trim();
    const licenseClean = (empData.license_no || empData.medical_license_no || empData.mohLicenseNo || empData.mohLicense || '').trim();

    // فحص هل الموظف موجود مسبقاً في المنظومة
    const existingEmp = (employees || []).find(e => 
      (civilIdClean && (e.civilId === civilIdClean || (e as any).civil_id === civilIdClean)) ||
      (passportClean && (e as any).passportNo === passportClean)
    );

    // إذا كان الموظف مسجلاً بالفعل، يتم التحديث طبقاً لنوع المستند الممسوح بدقة متناهية
    if (existingEmp && updateEmployee) {
      if (normalizedDoc === 'civil_id' || normalizedDoc === 'civilid') {
        updateEmployee(existingEmp.id, {
          civilId: civilIdClean || existingEmp.civilId,
          name: empData.fullNameAr || empData.fullName || existingEmp.name,
          nationality: empData.nationality || (existingEmp as any).nationality,
          birthDate: empData.birthDate || empData.dob || (existingEmp as any).birthDate,
          gender: empData.gender || (existingEmp as any).gender,
          civilIdExpiry: empData.expiryDate || empData.civilIdExpiry || (existingEmp as any).civilIdExpiry,
          residencyExpiry: empData.expiryDate || (existingEmp as any).residencyExpiry
        } as any);
        toast.success(`تم تحديث البيانات الشخصية للموظف (${existingEmp.name}) من البطاقة المدنية`);
        return existingEmp.id;
      }

      if (normalizedDoc === 'passport') {
        const existingNameEn = (existingEmp as any).nameEn || (existingEmp as any).fullNameEn;
        const incomingNameEn = empData.name_en || empData.fullNameEn || empData.nameEn;
        updateEmployee(existingEmp.id, {
          passportNo: passportClean || (existingEmp as any).passportNo,
          passportExpiry: empData.passport_expiry || empData.passportExpiry || empData.expiryDate || (existingEmp as any).passportExpiry,
          nameEn: existingNameEn ? existingNameEn : (incomingNameEn || existingNameEn),
          fullNameEn: existingNameEn ? existingNameEn : (incomingNameEn || existingNameEn)
        } as any);
        toast.success(`تم تحديث بيانات جواز السفر للموظف (${existingEmp.name}) دون المساس بالبيانات الشخصية`);
        return existingEmp.id;
      }

      if (normalizedDoc === 'medical_license' || normalizedDoc === 'license' || normalizedDoc === 'moh_license' || normalizedDoc === 'professional_license') {
        updateEmployee(existingEmp.id, {
          mohLicense: licenseClean || (existingEmp as any).mohLicense,
          mohLicenseExpiry: empData.license_expiry || empData.medical_license_expiry || empData.mohLicenseExpiryDate || empData.expiryDate || (existingEmp as any).mohLicenseExpiry,
          jobTitle: empData.license_title || empData.profession || empData.jobTitle || existingEmp.jobTitle
        } as any);
        toast.success(`تم تحديث ترخيص مزاولة المهنة للموظف (${existingEmp.name}) دون المساس بالبيانات الشخصية`);
        return existingEmp.id;
      }
    }

    // إذا لم يكن الموظف مسجلاً، يتم إنشاء سجل جديد مع ضبط الحقول حسب نوع المستند
    const newEmpId = `emp-${Date.now()}`;
    let birthDateVal = empData.birthDate || empData.dob || '';
    let genderVal = empData.gender || 'MALE';

    if (civilIdClean.length === 12 && !validateKuwaitCivilId(civilIdClean).isValid) {
      toast(`تنبيه: الرقم المدني (${civilIdClean}) لم يجتز خوارزمية التحقق الرسمية (MOD 11)، يرجى مراجعة صحته يدوياً.`, { icon: '⚠️' });
    }

    if (civilIdClean.length === 12) {
      const parsedCivil = parseKuwaitCivilId(civilIdClean);
      if (parsedCivil) {
        if (!birthDateVal) birthDateVal = parsedCivil.birthDate;
        if (!empData.gender) genderVal = parsedCivil.gender;
      }
    }

    const newEmp = {
      id: newEmpId,
      name: (normalizedDoc === 'civil_id' || normalizedDoc === 'civilid') 
        ? (empData.fullNameAr || empData.fullName || 'موظف جديد') 
        : (empData.fullNameAr || empData.fullNameEn || 'موظف مستخرج من الوثائق'),
      fullNameAr: empData.fullNameAr || empData.fullName || '',
      fullNameEn: empData.fullNameEn || empData.name_en || '',
      civilId: (normalizedDoc === 'civil_id' || normalizedDoc === 'civilid') ? civilIdClean : (civilIdClean || ''),
      civil_id_number: civilIdClean,
      passportNo: (normalizedDoc === 'passport') ? (passportClean || empData.passportNo || '') : (empData.passportNo || ''),
      passportExpiry: empData.passportExpiryDate || empData.passport_expiry || '',
      residencyExpiry: empData.residencyExpiryDate || empData.expiryDate || '',
      paciAddressNo: empData.paciBuildingRef || (empData.address?.block ? `${empData.address.block}-${empData.address.building || ''}` : ''),
      fullAddress: empData.address ? `${empData.address.area || ''} - ق ${empData.address.block || ''} - ش ${empData.address.street || ''} - مبنى ${empData.address.building || ''}` : '',
      residencyType: empData.residencyType || 'مادة 18',
      jobTitle: empData.license_title || empData.profession || empData.jobTitle || 'موظف معتمد',
      department: (normalizedDoc.includes('medical') || normalizedDoc.includes('license')) ? 'الخدمات الطبية' : 'الإدارة العامة',
      basicSalary: 600,
      housingAllowance: 150,
      transportAllowance: 50,
      medicalAllowance: 0,
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
      nationality: empData.nationality || 'كويتي',
      gender: genderVal,
      birthDate: birthDateVal || '1990-01-01',
      dob: birthDateVal || '1990-01-01',
      expiryDate: empData.expiryDate || '2027-01-01',
      civilIdExpiry: empData.expiryDate || '2027-01-01',
      civilIdExpiryDate: empData.expiryDate || '2027-01-01',
      mohLicense: licenseClean,
      mohLicenseExpiry: empData.license_expiry || empData.medical_license_expiry || empData.mohLicenseExpiryDate || '',
      iban: ''
    };

    if (addEmployee) {
      addEmployee(newEmp as any);
    }
    
    try {
      const activeCompId = activeCompany?.id || 'comp-super-admin';
      await TenantDatabaseService.saveEmployee({
        ...newEmp,
        companyId: activeCompId
      } as any, activeCompId);
    } catch (err) {
      console.error('Error in scanner direct persist:', err);
    }

    if (empData.expiryDate) {
      setEmployeeNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `تنبيه تجديد مستند (${docType || 'المستند'})`,
          message: `المستند الخاص بالموظف ${newEmp.name} ينتهي في تاريخ ${empData.expiryDate}. يرجى اتخاذ الإجراء اللازم.`,
          date: empData.expiryDate,
          type: 'warning',
          read: false
        },
        ...prev
      ]);
    }

    toast.success(`تم اعتماد بيانات ${docType || 'المستند'} بنجاح`);
    return newEmpId;
  };

  // نموذج إضافة مشترك جديد
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPamNumber, setNewPamNumber] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [superAdminSettingsTab, setSuperAdminSettingsTab] = useState<'tenants' | 'settings'>('tenants');

  // الوقت والتاريخ المباشر لدولة الكويت
  const [kuwaitTime, setKuwaitTime] = useState('');

  // Spotlight Search & Quick HR Calculator modal states
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [employeeAppProps, setEmployeeAppProps] = useState<any>({});

  // Global Keyboard Shortcut: Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSpotlight(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_employee':
        setEmployeeAppProps({ initialTab: 'directory', initialShowAdd: true, triggerKey: Date.now() });
        setActiveApp('employees');
        break;
      case 'new_contract':
        setActiveApp('contracts');
        break;
      case 'new_leave':
        setActiveApp('leaves');
        break;
      case 'new_letter':
        setActiveApp('letters');
        break;
      case 'attendance_movement':
        setActiveApp('attendance');
        break;
      case 'scanner':
        setActiveApp('scanner');
        break;
      case 'calculator':
        setShowCalculator(true);
        break;
      default:
        break;
    }
  };

  const handleSpotlightSelectEmployee = (emp: any) => {
    setEmployeeAppProps({
      initialTab: 'directory',
      selectedEmployeeId: emp.id,
      triggerKey: Date.now()
    });
    setActiveApp('employees');
  };

  useEffect(() => {
    const updateKuwaitTime = () => {
      const now = new Date();
      setKuwaitTime(now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Kuwait', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      }));
    };
    updateKuwaitTime();
    const interval = setInterval(updateKuwaitTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Guard against unauthorized access to Super Admin screens
  useEffect(() => {
    if (isDevPreview) return; // Allow dev preview to stay on saas_admin
    if (user && !isSuperAdmin) {
      if (activeApp === 'saas_admin') {
        setActiveApp('switcher');
      }
    }
  }, [activeApp, isSuperAdmin, user, isDevPreview]);

  const appsList = [
    { id: 'employees', name: 'شؤون الموظفين', subtitle: 'Employees Directory', icon: Users, color: 'bg-rose-500' },
    { id: 'attendance', name: 'الحضور والانصراف', subtitle: 'Time & Attendance', icon: Clock, color: 'bg-indigo-600' },
    { id: 'leaves', name: 'إجازات والغياب', subtitle: 'Time Off & Leaves', icon: Palmtree, color: 'bg-emerald-600' },
    { id: 'payroll', name: 'الرواتب وحماية الأجور', subtitle: 'Payroll & WPS', icon: CreditCard, color: 'bg-green-600' },
    { id: 'custody', name: 'العهد والممتلكات', subtitle: 'Assets & Custodies', icon: Package, color: 'bg-orange-500' },
    { id: 'archive', name: 'أرشيف المستندات', subtitle: 'Documents Archive', icon: FolderArchive, color: 'bg-amber-500' },
    { id: 'scanner', name: 'الماسح الضوئي الذكي', subtitle: 'Document Scanner OCR', icon: Scan, color: 'bg-teal-600' },
    { id: 'letters', name: 'النماذج والخطابات', subtitle: 'Templates & Letters', icon: FileText, color: 'bg-sky-600' },
    { id: 'holidays', name: 'العطلات الرسمية', subtitle: 'Public Holidays', icon: Sparkles, color: 'bg-purple-600' },
    { id: 'reports', name: 'التقارير والتحليلات', subtitle: 'Reports, Pivot & Executive Dashboard', icon: BarChart3, color: 'bg-blue-600' },
    { id: 'moh', name: 'تراخيص وزارة الصحة', subtitle: 'MOH Medical Hub', icon: Stethoscope, color: 'bg-teal-700' },
    { id: 'audit', name: 'سجل الرقابة وتتبع العمليات', subtitle: 'Audit Logs & Diagnostics', icon: ShieldAlert, color: 'bg-zinc-800' },
  ];

  const filteredApps = appsList.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActiveAppTitle = () => {
    switch (activeApp) {
      case 'switcher': return 'التطبيقات الرئيسية (App Launcher)';
      case 'employees': return 'شؤون الموظفين (Employees Directory)';
      case 'recruitment': return 'التوظيف والمقابلات الذكية (Recruitment & ATS)';
      case 'contracts': return 'عقود العمل والبدلات الرسمية (Odoo Contracts & PAM)';
      case 'attendance': return 'الحضور والانصراف (Time & Attendance)';
      case 'leaves': return 'الإجازات والغياب (Time Off & Leaves)';
      case 'payroll': return 'الرواتب وحماية الأجور (Payroll & WPS)';
      case 'custody': return 'العهد والممتلكات (Assets & Custodies)';
      case 'archive': return 'أرشيف المستندات (Documents Archive)';
      case 'scanner': return 'الماسح الضوئي الذكي (Odoo Document Scanner)';
      case 'letters': return 'النماذج والخطابات (Templates & Letters)';
      case 'holidays': return 'العطلات الرسمية (Public Holidays)';
      case 'reports': return 'التقارير والتحليلات (Reports & Analytics)';
      case 'moh': return 'إدارة التراخيص الطبية والكادر الصحي (MOH Medical Hub)';
      case 'audit': return 'سجل الرقابة وتتبع العمليات (Audit Logs & Diagnostic Center)';
      case 'settings': return isSuperAdmin ? 'الإعدادات والمشتركين (Settings & SaaS Tenants)' : 'بيانات المنشأة والإعدادات (Company Profile & Settings)';
      case 'settings_dev': return 'أدوات المطور ومحاكي البيانات (Developer Tools)';
      default: return 'نظام Aysed S HR 2026';
    }
  };

  // Authentication Guard (Gateway)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center font-sans">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#714B67] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">جاري التحقق من الهوية...</p>
      </div>
    );
  }

  if (!user) {
    return <OdooLoginPage />;
  }

  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-hidden bg-slate-100 dir-rtl text-right text-slate-800" dir="rtl">
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} reverseOrder={false} />

      {/* شريط تنبيه الدخول كمسؤول (Strict Impersonation Banner) */}
      {isActualSuperAdmin && (impersonatingCompanyId || isImpersonating) && activeApp !== 'saas_admin' && (
        <div className="h-10 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 text-xs px-4 font-bold flex items-center justify-between shrink-0 shadow-md border-b border-amber-500 z-50 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping inline-block" />
            <span className="bg-slate-950 text-amber-300 text-[10px] px-2.5 py-0.5 rounded font-black tracking-wider uppercase">
              👑 وضع المعاينة الفورية كمسؤول (Impersonation Mode)
            </span>
            <span className="text-slate-950 font-bold">
              أنت تتصفح وتدير شركة: <strong className="underline decoration-2 font-black text-slate-950">{activeCompany?.nameAr || (activeCompany as any)?.name || 'الشركة المشتركة'}</strong>
            </span>
            <span className="bg-slate-950/15 text-slate-950 text-[11px] px-2.5 py-0.5 rounded font-mono font-bold">
              ملف الشؤون: {activeCompany?.pamFileNumber || '---'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setActiveApp('saas_admin')}
              className="bg-slate-900/80 hover:bg-slate-950 text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>لوحة الإدارة المركزية ⚙️</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                exitImpersonation();
                exitCompanyImpersonation();
                setActiveApp('saas_admin');
                toast.success('تم إنهاء وضع المعاينة والعودة للوحة السوبر أدمن المركزية');
              }} 
              className="bg-slate-950 hover:bg-black text-amber-300 hover:text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogOut size={12} />
              <span>إنهاء المعاينة والعودة للسوبر أدمن ✕</span>
            </button>
          </div>
        </div>
      )}

      {/* الشريط العلوي المطور الشامل (Top Enterprise Action Bar) */}
      <TopEnterpriseActionBar
        activeApp={activeApp}
        setActiveApp={setActiveApp}
        getActiveAppTitle={getActiveAppTitle}
        kuwaitTime={kuwaitTime}
        user={user}
        userAvatar={userAvatar}
        setUserAvatar={setUserAvatar}
        isSuperAdmin={isSuperAdmin}
        activeCompany={activeCompany}
        companies={companies}
        impersonatingCompanyId={impersonatingCompanyId}
        onSelectCompany={(companyId) => {
          const comp = companies.find(c => c.id === companyId);
          if (comp) {
            impersonateCompany(comp.id);
            startImpersonation(comp);
            toast.success(`تم الانتقال إلى منشأة: ${comp.nameAr}`);
          }
        }}
        onAddNewCompany={() => setShowAddModal(true)}
        employees={employees}
        documents={documents}
        onQuickAction={handleQuickAction}
        onOpenSpotlight={() => setShowSpotlight(true)}
        onOpenCalculator={() => setShowCalculator(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSentinel={() => setIsSentinelOpen(true)}
        onOpenLegalBot={() => setIsLegalBotOpen(true)}
        onOpenAnalystBot={() => setIsAnalystBotOpen(true)}
        onOpenFacilityWizard={() => setIsFacilityWizardOpen(true)}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowAvatarModal={setShowAvatarModal}
        setDebugMode={setDebugMode}
        debugMode={debugMode}
        logout={logout}
      />


      {debugMode && <OdooDebugMenu />}
      {/* حاوية العرض الصارمة المانعة للتداخل (Strict Single-View Canvas) */}
      <div className="flex-1 flex overflow-hidden w-full relative bg-slate-100">
        
        {/* الحالة 1: شاشة مبدل التطبيقات والأيقونات فقط (Odoo App Launcher) */}
        {activeApp === 'switcher' && (
          <div className="flex-1 overflow-y-auto w-full bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] p-2 sm:p-3 md:p-4">
            <OdooAppLauncher
              onSelectApp={(selectedApp) => {
                switch (selectedApp) {
                  case 'EMPLOYEES':
                    setActiveApp('employees');
                    break;
                  case 'RECRUITMENT':
                    setActiveApp('recruitment');
                    break;
                  case 'CONTRACTS':
                    setActiveApp('contracts');
                    break;
                  case 'ATTENDANCE':
                    setActiveApp('attendance');
                    break;
                  case 'LEAVES':
                    setActiveApp('leaves');
                    break;
                  case 'PAYROLL':
                  case 'EOS':
                    setActiveApp('payroll');
                    break;
                  case 'CUSTODY_LOANS':
                    setActiveApp('custody');
                    break;
                  case 'DOCUMENTS':
                    setActiveApp('archive');
                    break;
                  case 'SCANNER_APP':
                    setActiveApp('scanner');
                    break;
                  case 'DOCUMENT_TEMPLATES':
                    setActiveApp('letters');
                    break;
                  case 'HOLIDAYS':
                    setActiveApp('holidays');
                    break;
                  case 'REPORTS':
                    setActiveApp('reports');
                    break;
                  case 'AUDIT_LOGS':
                    setActiveApp('audit');
                    break;
                  case 'SETTINGS':
                  case 'COMPANIES':
                    setActiveApp('settings');
                    break;
                  case 'SAAS_ADMIN':
                    setActiveApp('saas_admin');
                    break;
                  default:
                    setActiveApp('switcher');
                    break;
                }
              }}
              currentUserEmail={user?.email || ''}
              currentUserRole={isSuperAdmin ? 'SUPER_ADMIN' : 'COMPANY_ADMIN'}
              activeCompany={activeCompany}
              stats={{
                employeesCount: employees?.length || 0,
                candidatesCount: candidates?.length || 0,
                contractsCount: contracts?.length || employees?.length || 0,
                leavesPendingCount: leaveStats.pending,
                documentsCount: documents?.length || 0,
                automationsCount: 0,
                custodiesCount: 0,
                templatesCount: 0,
                auditLogsCount: 0,
                shiftsCount: shifts?.length || 0,
                totalSalariesThisMonth: employees?.reduce((acc: number, e: any) => acc + (Number(e.basicSalary || e.salary || 0) + Number(e.housingAllowance || 0) + Number(e.transportAllowance || 0) + Number(e.natureOfWorkAllowance || 0)), 0) || 0,
                onLeaveToday: leaveStats.onLeaveToday,
                absenceRate: employees?.length
                  ? Number(((Object.values(attendance || {}).filter((record: any) => Number(record.unpaidAbsenceDays || 0) > 0).length / employees.length) * 100).toFixed(1))
                  : 0,
                lateArrivalsCount: Object.values(attendance || {}).filter((record: any) => Number(record.delayMinutes || 0) > 0).length,
                saturdayAbsencesCount: Object.values(attendance || {}).filter((record: any) => Number(record.unpaidAbsenceDays || 0) > 0 && record.date && new Date(record.date).getDay() === 6).length,
                leaveCostKwd: computedPayslips?.reduce((total: number, payslip: any) => total + Number(payslip.attendanceDeduction || 0) + Number(payslip.loanDeduction || 0), 0) || 0
              }}
            />
          </div>
        )}

        {/* الحالة 2: الموظفون (Employees Directory) */}
        {activeApp === 'employees' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <EmployeesApp {...employeeAppProps} isSuperAdmin={isSuperAdmin} />
            </div>
          </main>
        )}

        {/* تطبيق التوظيف والمقابلات الذكية المستقل (Recruitment & ATS) */}
        {activeApp === 'recruitment' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <RecruitmentApp
                candidates={candidates}
                activeCompany={activeCompany || {
                  id: 'comp-main',
                  nameAr: 'المنشأة المركزية',
                  nameEn: 'Central Company',
                  pamFileNumber: '12345678',
                  civilId: '123456789012',
                  commercialLicense: '98765/2023',
                  status: 'ACTIVE',
                  subscriptionPlan: 'ENTERPRISE',
                  usersCount: 1,
                  employeesCount: employees.length
                } as any}
                onSaveCandidate={handleSaveCandidate}
                onConvertCandidateToEmployee={handleConvertCandidateToEmployee}
              />
            </div>
          </main>
        )}

        {/* تطبيق عقود العمل والبدلات وقانون العمل المستقل (Odoo Contracts & PAM) */}
        {activeApp === 'contracts' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooContractsApp />
            </div>
          </main>
        )}

        {/* الحالة 3: الحضور والبصمة (Attendance) */}
        {activeApp === 'attendance' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooAttendanceApp />
            </div>
          </main>
        )}

        {/* الحالة 5: الإجازات والغياب (Leaves) */}
        {activeApp === 'leaves' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooTimeOffApp />
            </div>
          </main>
        )}

        {/* الحالة 6: الرواتب و WPS (Payroll) */}
        {activeApp === 'payroll' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooPayrollApp />
            </div>
          </main>
        )}

        {/* الحالة 7: المعدات والعهد (Equipments & Custody) */}
        {activeApp === 'custody' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooOperationsApp />
            </div>
          </main>
        )}

        {/* الحالة 8: أرشيف المستندات (Documents) */}
        {activeApp === 'archive' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <DocumentsApp
                documents={documents}
                employees={employees as any}
                activeCompany={activeCompany}
                filterTab=""
                onSaveDocument={handleSaveDocument}
                onDeleteDocument={handleDeleteDocument}
                onAutoAddEmpFromOCR={handleAutoAddEmpFromOCR}
                onNavigateToApp={(app) => setActiveApp(app)}
              />
            </div>
          </main>
        )}

        {/* الحالة المحورية: الماسح الضوئي الذكي (Scanner App) */}
        {activeApp === 'scanner' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <ScannerApp
                documents={documents}
                employees={employees as any}
                activeCompany={activeCompany}
                onSaveDocument={handleSaveDocument}
                onDeleteDocument={handleDeleteDocument}
                onAutoAddEmpFromOCR={handleAutoAddEmpFromOCR}
                onNavigateToApp={(app) => setActiveApp(app)}
              />
            </div>
          </main>
        )}

        {/* الحالة 9: النماذج والخطابات الرسمية (Templates) */}
        {activeApp === 'letters' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooTemplatesApp />
            </div>
          </main>
        )}

        {/* الحالة 10: العطلات الرسمية (Kuwait Holidays) */}
        {activeApp === 'holidays' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooPublicHolidaysApp />
            </div>
          </main>
        )}

        {/* الحالة 11: لوحة القيادة والتقارير (Reports Dashboard) */}
        {activeApp === 'reports' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooReportsApp />
            </div>
          </main>
        )}

        {/* الحالة الطبية: تراخيص وزارة الصحة والكادر الطبي (MOH Medical Hub) */}
        {activeApp === 'moh' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <OdooMohMedicalHubApp />
            </div>
          </main>
        )}

        {/* تطبيق سجل الرقابة وتتبع العمليات (Audit Logs & Diagnostic Center) */}
        {activeApp === 'audit' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <AuditLogsApp
                activeCompany={activeCompany}
                employees={employees}
                contracts={[]}
                leaves={[]}
                attendance={[]}
                payslips={[]}
                generatedDocs={documents}
                documentTemplates={[]}
                onAddEmployee={addEmployee}
              />
            </div>
          </main>
        )}

        {/* الحالة 12: شاشة إعدادات المنشأة والنظام */}
        {activeApp === 'settings' && (
          <main className="flex-1 overflow-y-auto w-full relative">
            <OdooSettingsFull onNavigateToDeveloperTools={() => setActiveApp('settings_dev')} />
          </main>
        )}

        {/* الحالة 13: السوبر أدمن */}
        {activeApp === 'saas_admin' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <SuperAdminDashboard 
                currentUserEmail={user?.email || 'elsayedhr1993@gmail.com'}
                onLogout={logout}
                onSwitchToApps={() => setActiveApp('switcher')}
                onSwitchToWorkspace={() => setActiveApp('employees')}
                onImpersonateCompany={(companyName) => {
                  const targetComp = companies.find(c => c.nameAr === companyName || c.nameEn === companyName || c.id === companyName) || {
                    id: `comp_${Date.now()}`,
                    nameAr: companyName,
                    nameEn: companyName,
                    name: companyName,
                    crNumber: '301122',
                    pifssNumber: 'KUW-554433',
                    commercialRegNo: '301122',
                    civilIdCompany: '203344',
                    bankName: 'بيت التمويل الكويتي (KFH)',
                    iban: 'KW12KFH000000000000301122',
                    wsiCode: 'WSI-TENANT',
                    currency: 'KWD',
                    status: 'active'
                  };
                  impersonateCompany(targetComp.id);
                  startImpersonation(targetComp);
                  setActiveApp('switcher');
                  toast.success(`تم التبديل بنجاح! أنت الآن تتصفح وتدير شركة: ${targetComp.nameAr || companyName}`);
                }}
              />
            </div>
          </main>
        )}

        {/* الحالة 14: أدوات المطور ومحاكي البيانات */}
        {activeApp === 'settings_dev' && (
          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full px-3 sm:px-5 lg:px-6 py-4">
              <SettingsApp
                companies={companies || []}
                activeCompany={activeCompany}
                onSaveCompany={(c) => addCompany(c as any)}
                onAddCompany={(c) => addCompany(c as any)}
                onDeleteCompany={(id) => deleteCompany(id)}
                onSelectCompany={(c) => impersonateCompany(c.id)}
                bgTheme="FOREST_VIDEO"
                setBgTheme={() => {}}
                motionEnabled={true}
                setMotionEnabled={() => {}}
                initialSubTab="DEVELOPER_TOOLS"
                currentUserEmail={user?.email || ''}
                currentUserRole={isSuperAdmin ? 'SUPER_ADMIN' : 'COMPANY_ADMIN'}
                onNavigateHome={() => setActiveApp('switcher')}
              />
            </div>
          </main>
        )}
      </div>

      {/* نافذة تعديل الصورة الشخصية (Avatar Update Modal) */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 dir-rtl" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-[#714B67]" />
                تحديث الصورة الشخصية وصورة الحساب
              </h3>
              <button 
                onClick={() => setShowAvatarModal(false)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-col items-center justify-center space-y-3">
                <img 
                  src={newAvatarUrl || userAvatar} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#714B67]/20 shadow-md"
                />
                <p className="text-xs text-slate-500">معاينة صورتك الشخصية في شريط النظام العلوي</p>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1.5">اختر صورة من جهازك (Upload File)</label>
                <label className="border-2 border-dashed border-slate-300 hover:border-[#714B67] bg-slate-50 hover:bg-slate-100/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs mb-2 border border-slate-200">
                    <Upload className="w-6 h-6 text-[#714B67]" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">اختر صورة من جهازك</span>
                  <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (يتم الحفظ محلياً كـ Base64)</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64Str = reader.result as string;
                        setNewAvatarUrl(base64Str);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  onClick={async () => {
                    if (newAvatarUrl.trim()) {
                      setUserAvatar(newAvatarUrl);
                      localStorage.setItem('aysed_user_avatar', newAvatarUrl);
                      try {
                        await updateAvatar(newAvatarUrl);
                        toast.success('تم تحديث وحفظ الصورة الشخصية في قاعدة بيانات Firestore ومزامنتها بنجاح');
                      } catch (err) {
                        toast.success('تم تحديث وحفظ الصورة محلياً بنجاح');
                      }
                      setShowAvatarModal(false);
                    } else {
                      toast.error('يرجى اختيار صورة أولاً');
                    }
                  }}
                  className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  حفظ الصورة الجديدة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Global Spotlight Search Modal (Ctrl + K) */}
      <GlobalSpotlightSearchModal
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
        employees={employees}
        onSelectEmployee={handleSpotlightSelectEmployee}
        onNavigateToApp={(appId) => {
          setShowSpotlight(false);
          setActiveApp(appId as any);
        }}
        onTriggerAction={(action) => {
          setShowSpotlight(false);
          handleQuickAction(action);
        }}
      />

      {/* Kuwait HR Quick Calculator Modal */}
      <KuwaitHrQuickCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />

      {/* Aysed HR AI Copilot Side Drawer */}
      <AysedAICopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        employees={employees as any}
        contracts={contracts}
        onQuickAction={(actionType, payload) => {
          if (actionType === 'navigate' && payload) {
            setActiveApp(payload as any);
          } else if (actionType === 'new_employee') {
            setShowAddModal(true);
          } else if (actionType === 'calculator') {
            setShowCalculator(true);
          } else if (actionType === 'employees') {
            setActiveApp('employees');
          }
          setIsCopilotOpen(false);
        }}
      />

      {/* Compliance Smart Sentinel Modal */}
      <ComplianceSmartSentinelModal
        isOpen={isSentinelOpen}
        onClose={() => setIsSentinelOpen(false)}
        employees={employees as any}
        contracts={contracts}
        attendance={[]}
        leaves={[]}
      />

      {/* Legal & Document OCR Bot Modal */}
      <LegalDocumentBotModal
        isOpen={isLegalBotOpen}
        onClose={() => setIsLegalBotOpen(false)}
      />

      {/* Data & Payroll Analyst Bot Modal */}
      <DataPayrollAnalystBotModal
        isOpen={isAnalystBotOpen}
        onClose={() => setIsAnalystBotOpen(false)}
        employees={employees as any}
      />

      {/* Facility Licensing Onboarding Wizard Modal */}
      <FacilityLicensingWizardModal
        isOpen={isFacilityWizardOpen}
        onClose={() => setIsFacilityWizardOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <OdooHierarchyProvider>
          <MainAppLayout />
        </OdooHierarchyProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
