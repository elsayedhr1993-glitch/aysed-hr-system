import React, { useState, useEffect } from 'react';
import { parseKuwaitCivilId } from './utils/kuwaitLaw';
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

  const { employees, addEmployee, updateEmployee } = useOdooHierarchy();

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

  // Single-View Controller: يمنع تداخل أي شاشتين نهائياً
  const [activeApp, setActiveApp] = useState<AppId>('switcher');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  // إدارة المرشحين وبيانات التوظيف الذكية (Recruitment & ATS)
  const defaultCandidates: Candidate[] = [
    {
      id: 'cand-1',
      companyId: activeCompany?.id || '',
      fullName: 'جاسم محمد الشمري',
      email: 'jassim.shammary@example.com',
      phone: '+965 99887766',
      appliedPosition: 'محاسب مالي أول (Senior Accountant)',
      department: 'الإدارة المالية والمحاسبة',
      expectedSalary: 850,
      stage: 'QUALIFIED',
      rating: 5,
      degree: 'بكالوريوس محاسبة - جامعة الكويت',
      certificates: ['شهادة SOCPA المعتمدة', 'معايير المحاسبة الدولية IFRS'],
      tags: ['محاسبة', 'WPS', 'خبرة 6 سنوات'],
      notes: 'مرشح ذو خبرة سابقة في البنوك الكويتية وحماية الأجور WPS، اجتاز المقابلة الفنية بامتياز.',
    },
    {
      id: 'cand-2',
      companyId: activeCompany?.id || '',
      fullName: 'مريم أحمد الكندري',
      email: 'maryam.kandari@example.com',
      phone: '+965 97654321',
      appliedPosition: 'أخصائي شؤون موظفين وعلاقات عمل',
      department: 'الموارد البشرية والإدارة',
      expectedSalary: 750,
      stage: 'INTERVIEW',
      rating: 4,
      degree: 'بكالوريوس إدارة أعمال وموارد بشرية',
      certificates: ['دبلوم قانون العمل الكويتي', 'إدارة المواهب والتوظيف'],
      tags: ['موارد بشرية', 'شؤون موظفين', 'قوى عاملة PAM'],
      notes: 'معرفة ممتازة ببوابة أسهل وقوانين الإقامة والعمل بالقطاع الأهلي مادة 18.',
    },
    {
      id: 'cand-3',
      companyId: activeCompany?.id || '',
      fullName: 'د. خالد عبد الرحمن العتيبي',
      email: 'dr.khaled.otaibi@example.com',
      phone: '+965 98112233',
      appliedPosition: 'طبيب عام (General Practitioner)',
      department: 'الخدمات الطبية والرعاية',
      expectedSalary: 1400,
      stage: 'CONTRACT',
      rating: 5,
      degree: 'بكالوريوس طب وجراحة (MBBS)',
      certificates: ['ترخيص مزاولة المهنة MOH ساري', 'شهادة الإنعاش القلبي المتقدم ACLS'],
      tags: ['كادر طبي', 'ترخيص MOH', 'طبيب'],
      notes: 'تم فحص أوراقه واعتمادها من وزارة الصحة، بانتظار توقيع العقد النهائي ومباشرة العمل.',
    },
    {
      id: 'cand-4',
      companyId: activeCompany?.id || '',
      fullName: 'ناصر فهد الدوسري',
      email: 'nasser.dousari@example.com',
      phone: '+965 94455667',
      appliedPosition: 'مسؤول نظم وشبكات وتكنولوجيا معلومات',
      department: 'تقنية المعلومات والتحول الرقمي',
      expectedSalary: 900,
      stage: 'INITIAL',
      rating: 4,
      degree: 'بكالوريوس هندسة حاسوب ونظم',
      certificates: ['CCNA Cisco', 'Microsoft Azure Administrator'],
      tags: ['IT', 'شبكات', 'أمن معلومات'],
      notes: 'سيرة ذاتية قوية وخبرة ممتازة في البنية التحتية والخوادم.',
    },
    {
      id: 'cand-5',
      companyId: activeCompany?.id || '',
      fullName: 'إيمان طارق الفضلي',
      email: 'eman.fadhli@example.com',
      phone: '+965 92345678',
      appliedPosition: 'سكرتيرة تنفيذية ومنسقة إدارية',
      department: 'الإدارة العامة ومكتب المدير',
      expectedSalary: 650,
      stage: 'HIRED',
      rating: 5,
      degree: 'دبلوم سكرتارية وإدارة مكتبية حديثة',
      certificates: ['شهادة ICDL الدولية', 'الكتابة السريعة والأرشفة الإلكترونية'],
      tags: ['سكرتارية', 'أرشفة', 'تم التعيين'],
      notes: 'تم قبولها وتعيينها رسمياً، وانضمت لفريق المنشأة بنجاح.',
    }
  ];

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    return getPersistentData<Candidate[]>(MANARA_STORAGE_KEYS.CANDIDATES, defaultCandidates);
  });

  const handleSaveCandidate = (cand: Candidate) => {
    setCandidates(prev => {
      const existingIndex = prev.findIndex(c => c.id === cand.id);
      let updated: Candidate[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = cand;
      } else {
        updated = [cand, ...prev];
      }
      setPersistentData(MANARA_STORAGE_KEYS.CANDIDATES, updated);
      return updated;
    });
    toast.success('تم حفظ وتحديث بيانات المرشح بنجاح');
  };

  const handleConvertCandidateToEmployee = (cand: Candidate) => {
    const newEmpId = `emp-${Date.now()}`;
    addEmployee({
      id: newEmpId,
      name: cand.fullName,
      fullNameAr: cand.fullName,
      fullNameEn: '',
      civilId: '',
      passportNo: '',
      passportExpiry: '',
      residencyExpiry: '',
      jobTitle: cand.appliedPosition,
      department: cand.department || 'الموارد البشرية والإدارة',
      basicSalary: cand.expectedSalary || 600,
      housingAllowance: 100,
      transportAllowance: 50,
      medicalAllowance: 0,
      status: 'ACTIVE',
      joinDate: new Date().toISOString().split('T')[0],
      nationality: 'كويتي',
      companyId: activeCompany?.id || '',
      phone: cand.phone,
      email: cand.email,
    } as any);

    handleSaveCandidate({
      ...cand,
      stage: 'HIRED'
    });

    toast.success(`🎉 مبارك! تم تحويل المرشح (${cand.fullName}) إلى موظف في المنظومة وإضافته لشؤون الموظفين`);
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

  const handleAutoAddEmpFromOCR = (empData: any, docType?: string) => {
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
    
    // Fallback direct storage guarantee for Scanner to ensure employee appears instantly in all views
    try {
      const activeCompId = activeCompany?.id || 'comp-super-admin';
      const existingKey = `odoo_employees_v1_${activeCompId}`;
      const existingList = JSON.parse(localStorage.getItem(existingKey) || '[]');
      const isAlreadyThere = existingList.some((e: any) => e.id === newEmp.id || e.civilId === newEmp.civilId);
      if (!isAlreadyThere) {
        const updatedList = [newEmp, ...existingList];
        localStorage.setItem(existingKey, JSON.stringify(updatedList));
        localStorage.setItem('manara_employees_data', JSON.stringify(updatedList));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('manara_employees_updated'));
      }
      TenantDatabaseService.saveEmployee({
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
    if (user && !isSuperAdmin) {
      if (activeApp === 'saas_admin') {
        setActiveApp('switcher');
      }
    }
  }, [activeApp, isSuperAdmin, user]);

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
      {(impersonatingCompanyId || isImpersonating) && activeApp !== 'saas_admin' && (
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
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowAvatarModal={setShowAvatarModal}
        setDebugMode={setDebugMode}
        debugMode={debugMode}
        logout={logout}
      />


      {debugMode && <OdooDebugMenu />}
      {/* حاوية العرض الصارمة المانعة للتداخل (Strict Single-View Canvas) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
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
                candidatesCount: candidates?.length || 5,
                contractsCount: employees?.length || 0,
                leavesPendingCount: 2,
                documentsCount: documents?.length || 0,
                automationsCount: 12,
                custodiesCount: 8,
                templatesCount: 15,
                auditLogsCount: 142,
                shiftsCount: 4,
                totalSalariesThisMonth: 18500,
                onLeaveToday: 1,
                absenceRate: 1.2,
                lateArrivalsCount: 0,
                saturdayAbsencesCount: 0
              }}
            />
          </div>
        )}

        {/* الحالة 2: الموظفون (Employees Directory) */}
        {activeApp === 'employees' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full">
            <EmployeesApp {...employeeAppProps} />
          </main>
        )}

        {/* تطبيق التوظيف والمقابلات الذكية المستقل (Recruitment & ATS) */}
        {activeApp === 'recruitment' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-2 sm:p-4">
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
          </main>
        )}

        {/* تطبيق عقود العمل والبدلات وقانون العمل المستقل (Odoo Contracts & PAM) */}
        {activeApp === 'contracts' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-2 sm:p-4">
            <OdooContractsApp />
          </main>
        )}

        {/* الحالة 3: الحضور والبصمة (Attendance) */}
        {activeApp === 'attendance' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooAttendanceApp />
          </main>
        )}

        {/* الحالة 5: الإجازات والغياب (Leaves) */}
        {activeApp === 'leaves' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooTimeOffApp />
          </main>
        )}

        {/* الحالة 6: الرواتب و WPS (Payroll) */}
        {activeApp === 'payroll' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooPayrollApp />
          </main>
        )}

        {/* الحالة 7: المعدات والعهد (Equipments & Custody) */}
        {activeApp === 'custody' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooOperationsApp />
          </main>
        )}

        {/* الحالة 8: أرشيف المستندات (Documents) */}
        {activeApp === 'archive' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
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
          </main>
        )}

        {/* الحالة المحورية: الماسح الضوئي الذكي (Scanner App) */}
        {activeApp === 'scanner' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <ScannerApp
              documents={documents}
              employees={employees as any}
              activeCompany={activeCompany}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
              onAutoAddEmpFromOCR={handleAutoAddEmpFromOCR}
              onNavigateToApp={(app) => setActiveApp(app)}
            />
          </main>
        )}

        {/* الحالة 9: النماذج والخطابات الرسمية (Templates) */}
        {activeApp === 'letters' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooTemplatesApp />
          </main>
        )}

        {/* الحالة 10: العطلات الرسمية (Kuwait Holidays) */}
        {activeApp === 'holidays' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooPublicHolidaysApp />
          </main>
        )}

        {/* الحالة 11: لوحة القيادة والتقارير (Reports Dashboard) */}
        {activeApp === 'reports' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full p-4">
            <OdooReportsApp />
          </main>
        )}

        {/* الحالة الطبية: تراخيص وزارة الصحة والكادر الطبي (MOH Medical Hub) */}
        {activeApp === 'moh' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full">
            <OdooMohMedicalHubApp />
          </main>
        )}

        {/* تطبيق سجل الرقابة وتتبع العمليات (Audit Logs & Diagnostic Center) */}
        {activeApp === 'audit' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full">
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
          </main>
        )}

        {/* الحالة 12: شاشة إعدادات المنشأة والنظام */}
        {activeApp === 'settings' && (
          <main className="flex-1 bg-slate-50 overflow-y-auto w-full relative">
            <OdooSettingsFull onNavigateToDeveloperTools={() => setActiveApp('settings_dev')} />
          </main>
        )}

        {/* الحالة 13: السوبر أدمن */}
        {activeApp === 'saas_admin' && (
          <main className="flex-1 overflow-y-auto w-full">
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
          </main>
        )}

        {/* الحالة 14: أدوات المطور ومحاكي البيانات */}
        {activeApp === 'settings_dev' && (
          <main className="flex-1 overflow-y-auto w-full">
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
