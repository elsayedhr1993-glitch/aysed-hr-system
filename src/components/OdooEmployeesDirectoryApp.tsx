import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Phone, 
  Mail, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  DollarSign, 
  Plane, 
  Fingerprint, 
  X,
  CreditCard,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Save,
  Printer,
  Clock,
  FolderKanban,
  ShieldAlert,
  Edit2,
  CheckCircle2,
  Camera,
  Scan,
  Sparkles,
  Upload,
  User,
  HeartHandshake,
  AlertCircle,
  FileCheck,
  ChevronDown,
  Loader2,
  Check,
  Award,
  BookOpen,
  List,
  LayoutGrid,
  Network,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { getDepartmentColorStyle } from '../utils/odooPalette';
import { OdooChatter } from './OdooChatter';
import { toast } from 'react-hot-toast';
import { processAnyDocument, ScannedData } from '../utils/ocrService';
import { validateKuwaitCivilId, parseKuwaitCivilId } from '../utils/kuwaitLaw';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { getPersistentData, setPersistentData, MANARA_STORAGE_KEYS } from '../utils/persistentStorage';
import { EmployeeListView } from './employees/EmployeeListView';
import { EmployeeHierarchyView } from './employees/EmployeeHierarchyView';
import { EmployeeKanbanView } from './employees/EmployeeKanbanView';
import { EmployeeDeleteConfirmModal } from './employees/EmployeeDeleteConfirmModal';
import OdooDocumentUploadModal from './OdooDocumentUploadModal';

export interface EmployeeDocument {
  id: string;
  type: 'civil_id' | 'passport' | 'moh_license' | 'pam_permit' | 'contract';
  title: string;
  docNumber: string;
  issueDate?: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  fileUrl?: string;
  scannedAt: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  nameEn?: string;
  civilId: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  avatarBg: string;
  status: 'active' | 'on_leave' | 'resigned';
  
  // Work Info
  joinDate: string;
  leaveBalance: number;
  shiftType?: string;
  directManager?: string;
  
  // Private Info
  nationality: string;
  birthDate: string;
  gender: 'ذكر' | 'أنثى';
  maritalStatus: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل' | 'عزباء' | 'متزوجة' | 'مطلقة' | 'أرملة';
  paciAddressNo: string;
  fullAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation: string;

  // WPS Payroll
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance?: number;
  bankName: string;
  iban: string;

  // PAM & Residency
  residencyType: string;
  residencyReferenceNo?: string;
  residencyExpiry?: string;
  passportNo?: string;
  passportExpiry?: string;
  pamPermitNo?: string;
  mosalFileNo?: string;
  authorizedJobTitle?: string;

  // MOH & Medical
  mohLicenseNo?: string;
  mohLicenseExpiry?: string;
  medicalDegree?: string;
  cmeHoursCompleted?: number;
  specialty?: string;

  // Attached Documents
  documents: EmployeeDocument[];
}

export const OdooEmployeesDirectoryApp: React.FC = () => {
  const { activeCompany } = useCompany();

  const [employees, setEmployees] = useState<EmployeeProfile[]>([
    {
      id: 'EMP-001',
      name: 'أحمد محمود الكندري',
      nameEn: 'Ahmed Mahmoud Al-Kandari',
      civilId: '290010112345',
      jobTitle: 'مدير الموارد البشرية والشؤون الإدارية',
      department: 'الإدارة العليا',
      email: 'kandari@almanar-clinic.com',
      phone: '+965 99001122',
      avatarBg: 'bg-[#714B67]',
      status: 'active',
      joinDate: '2022-01-15',
      leaveBalance: 25.0,
      shiftType: 'دوام صباحي (8:00 ص - 4:00 م)',
      directManager: 'د. خالد العميري',
      nationality: 'كويتي',
      birthDate: '1990-01-01',
      gender: 'ذكر',
      maritalStatus: 'متزوج',
      paciAddressNo: '18492019',
      fullAddress: 'محافظة العاصمة - منطقة كيفان - قطعة 3 - شارع 32 - قسيمة 14',
      emergencyContactName: 'فاطمة الكندري',
      emergencyContactPhone: '+965 99881122',
      emergencyRelation: 'الزوجة',
      basicSalary: 1200,
      housingAllowance: 300,
      transportAllowance: 150,
      medicalAllowance: 0,
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW82NBOK0000000000001234567890',
      residencyType: 'مواطن كويتي',
      passportNo: 'K10293847',
      passportExpiry: '2029-06-30',
      residencyExpiry: '2029-12-31',
      documents: [
        {
          id: 'DOC-1',
          type: 'civil_id',
          title: 'البطاقة المدنية الكويتية (وجهان)',
          docNumber: '290010112345',
          expiryDate: '2028-11-20',
          status: 'valid',
          scannedAt: '2024-01-15'
        }
      ]
    },
    {
      id: 'EMP-002',
      name: 'محمد إبراهيم السيد',
      nameEn: 'Mohamed Ibrahim Elsayed',
      civilId: '288050498765',
      jobTitle: 'أخصائي شؤون العاملين والرواتب (WPS)',
      department: 'الموارد البشرية',
      email: 'm.ibrahim@almanar-clinic.com',
      phone: '+965 66778899',
      avatarBg: 'bg-blue-600',
      status: 'active',
      joinDate: '2023-04-01',
      leaveBalance: 17.5,
      shiftType: 'دوام صباحي (8:00 ص - 4:00 م)',
      directManager: 'أحمد محمود الكندري',
      nationality: 'مصري',
      birthDate: '1988-05-04',
      gender: 'ذكر',
      maritalStatus: 'متزوج',
      paciAddressNo: '44820193',
      fullAddress: 'محافظة حولي - منطقة السالمية - قطعة 10 - شارع سالم المبارك',
      emergencyContactName: 'أحمد إبراهيم',
      emergencyContactPhone: '+965 66442211',
      emergencyRelation: 'شقيق',
      basicSalary: 650,
      housingAllowance: 150,
      transportAllowance: 50,
      medicalAllowance: 0,
      bankName: 'بنك بوبيان (Boubyan)',
      iban: 'KW45BOUB0000000000009876543210',
      residencyType: 'مادة 18 (قطاع أهلي)',
      residencyReferenceNo: 'REF-2023-88991',
      residencyExpiry: '2026-11-20',
      passportNo: 'A28394810',
      passportExpiry: '2027-04-15',
      pamPermitNo: 'PAM-2023-9912',
      mosalFileNo: 'MSAL-998811',
      authorizedJobTitle: 'أخصائي شؤون موظفين',
      documents: [
        {
          id: 'DOC-2',
          type: 'pam_permit',
          title: 'إذن العمل الصادر من القوى العاملة (PAM)',
          docNumber: 'PAM-2023-9912',
          expiryDate: '2026-11-20',
          status: 'valid',
          scannedAt: '2023-04-05'
        }
      ]
    },
    {
      id: 'MED-201',
      name: 'د. سارة عادل المنصور',
      nameEn: 'Dr. Sarah Adel Al-Mansour',
      civilId: '292081501234',
      jobTitle: 'طبيبة استشارية - طب وجراحة العيون',
      department: 'الأطباء',
      email: 'dr.sarah@almanar-clinic.com',
      phone: '+965 97711223',
      avatarBg: 'bg-sky-600',
      status: 'active',
      joinDate: '2021-08-01',
      leaveBalance: 32.0,
      shiftType: 'دوام مناوبة عيادات (9:00 ص - 9:00 م)',
      directManager: 'د. خالد العميري (المدير الطبي)',
      nationality: 'كويتية',
      birthDate: '1992-08-15',
      gender: 'أنثى',
      maritalStatus: 'متزوجة',
      paciAddressNo: '99201948',
      fullAddress: 'محافظة العاصمة - الشامية - قطعة 5 - شارع 51 - منزل 12',
      emergencyContactName: 'عادل المنصور',
      emergencyContactPhone: '+965 99110022',
      emergencyRelation: 'الوالد',
      basicSalary: 2200,
      housingAllowance: 500,
      transportAllowance: 200,
      medicalAllowance: 300,
      bankName: 'بنك الخليج (Gulf Bank)',
      iban: 'KW55GULF0000000000001122334455',
      residencyType: 'مواطن كويتي',
      passportNo: 'K22998811',
      passportExpiry: '2030-01-10',
      residencyExpiry: '2030-01-10',
      mohLicenseNo: 'MOH-OPH-2021-499',
      mohLicenseExpiry: '2027-09-30',
      medicalDegree: 'استشاري أول (Consultant A)',
      specialty: 'طب وجراحة العيون والليزك',
      cmeHoursCompleted: 58,
      documents: [
        {
          id: 'DOC-3',
          type: 'moh_license',
          title: 'ترخيص مزاولة مهنة الطب البشري (MOH)',
          docNumber: 'MOH-OPH-2021-499',
          expiryDate: '2027-09-30',
          status: 'valid',
          scannedAt: '2021-08-10'
        }
      ]
    },
    {
      id: 'MED-202',
      name: 'مريم يوسف العتيبي',
      nameEn: 'Maryam Yousef Al-Otaibi',
      civilId: '295031209876',
      jobTitle: 'رئيسة هيئة التمريض والتعقيم',
      department: 'التمريض',
      email: 'm.otaibi@almanar-clinic.com',
      phone: '+965 55443322',
      avatarBg: 'bg-purple-600',
      status: 'active',
      joinDate: '2022-09-15',
      leaveBalance: 21.0,
      shiftType: 'دوام صباحي ومناوبة',
      directManager: 'د. سارة عادل المنصور',
      nationality: 'كويتية',
      birthDate: '1995-03-12',
      gender: 'أنثى',
      maritalStatus: 'عزباء',
      paciAddressNo: '67129038',
      fullAddress: 'محافظة الفروانية - منطقة إشبيلية - قطعة 4 - شارع 401',
      emergencyContactName: 'يوسف العتيبي',
      emergencyContactPhone: '+965 55009988',
      emergencyRelation: 'الوالد',
      basicSalary: 850,
      housingAllowance: 200,
      transportAllowance: 100,
      medicalAllowance: 150,
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW12KFH0000000000009988776655',
      residencyType: 'مواطن كويتي',
      passportNo: 'K33445566',
      passportExpiry: '2029-08-15',
      residencyExpiry: '2029-08-15',
      mohLicenseNo: 'MOH-NUR-2022-811',
      mohLicenseExpiry: '2026-12-15',
      medicalDegree: 'أخصائي تمريض عام وتمريض عيادات',
      specialty: 'التمريض والتعقيم الجراحي',
      cmeHoursCompleted: 40,
      documents: [
        {
          id: 'DOC-4',
          type: 'moh_license',
          title: 'ترخيص مزاولة مهنة التمريض (MOH)',
          docNumber: 'MOH-NUR-2022-811',
          expiryDate: '2026-12-15',
          status: 'valid',
          scannedAt: '2022-09-20'
        }
      ]
    },
    {
      id: 'SEC-101',
      name: 'سعد جابر العنزي',
      nameEn: 'Saad Jaber Al-Enezi',
      civilId: '289120109923',
      jobTitle: 'مشرف الأمن والسلامة والورديات',
      department: 'الأمن والخدمات',
      email: 'sec.saad@almanar-clinic.com',
      phone: '+965 99441122',
      avatarBg: 'bg-slate-700',
      status: 'active',
      joinDate: '2024-02-10',
      leaveBalance: 30.0,
      shiftType: 'شفت ليلي طوارئ',
      directManager: 'أحمد محمود الكندري',
      nationality: 'كويتي',
      birthDate: '1989-12-01',
      gender: 'ذكر',
      maritalStatus: 'متزوج',
      paciAddressNo: '33918204',
      fullAddress: 'محافظة الجهراء - منطقة القصر - قطعة 2 - شارع 11',
      emergencyContactName: 'جابر العنزي',
      emergencyContactPhone: '+965 99332211',
      emergencyRelation: 'الوالد',
      basicSalary: 450,
      housingAllowance: 150,
      transportAllowance: 0,
      medicalAllowance: 0,
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW12KFH0000000000005544332211',
      residencyType: 'مواطن كويتي',
      passportNo: 'K44556677',
      passportExpiry: '2029-01-20',
      residencyExpiry: '2029-01-20',
      documents: []
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'work' | 'private' | 'payroll' | 'residency' | 'medical'>('work');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('الكل');
  
  // View mode switcher: Kanban cards, Detailed List table, or Department Hierarchy
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'tree'>('kanban');
  
  // Employee Deletion & Selection States
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeProfile | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Multi-Document AI Scanner Engine State
  const [showScannerDropdown, setShowScannerDropdown] = useState(false);
  const [isScanningModalOpen, setIsScanningModalOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [scanningDocType, setScanningDocType] = useState<'civil_id' | 'passport' | 'moh_license' | 'pam_permit'>('civil_id');
  const [isScanningInProgress, setIsScanningInProgress] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('');
  const [scannedPreviewImage, setScannedPreviewImage] = useState<string | null>(null);
  const scannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNewDocument = (doc: any) => {
    const mappedDoc: EmployeeDocument = {
      id: doc.id,
      type: doc.category.includes('هويات') ? 'civil_id' : doc.category.includes('تراخيص') ? 'moh_license' : 'pam_permit',
      title: doc.docTitleAr,
      docNumber: doc.documentNumber || 'N/A',
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate || '2027-01-01',
      status: doc.status === 'active' ? 'valid' : doc.status === 'expiring_soon' ? 'expiring_soon' : 'expired',
      fileUrl: doc.fileUrl,
      scannedAt: doc.uploadDate
    };
    
    if (selectedEmployee) {
      const updated = {
        ...selectedEmployee,
        documents: [mappedDoc, ...(selectedEmployee.documents || [])]
      };
      setSelectedEmployee(updated);
      setEmployees(employees.map(e => e.id === updated.id ? updated : e));
      toast.success('تم أرشفة المستند بنجاح وتفعيل تنبيهات الصلاحية (Odoo Documents)');
    }
  };

  // Listen for global Back Navigation event
  useEffect(() => {
    const handleNavBack = (e: Event) => {
      if (selectedEmployee || isCreating) {
        e.preventDefault();
        setSelectedEmployee(null);
        setIsCreating(false);
      }
    };
    window.addEventListener('odoo_nav_back', handleNavBack);
    return () => window.removeEventListener('odoo_nav_back', handleNavBack);
  }, [selectedEmployee, isCreating]);

  const departments = ['الكل', 'الموارد البشرية', 'الإدارة العليا', 'الأطباء', 'التمريض', 'الأمن والخدمات'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.includes(searchQuery) || 
                          (emp.nameEn && emp.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          emp.civilId.includes(searchQuery) || 
                          emp.jobTitle.includes(searchQuery) ||
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'الكل' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    const newEmp: EmployeeProfile = {
      id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      name: '',
      nameEn: '',
      civilId: '',
      jobTitle: '',
      department: 'الموارد البشرية',
      email: '',
      phone: '',
      avatarBg: 'bg-[#714B67]',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      leaveBalance: 30.0,
      shiftType: 'دوام صباحي (8:00 ص - 4:00 م)',
      directManager: 'أحمد محمود الكندري',
      nationality: 'كويتي',
      birthDate: '1992-01-01',
      gender: 'ذكر',
      maritalStatus: 'أعزب',
      paciAddressNo: '',
      fullAddress: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyRelation: '',
      basicSalary: 600,
      housingAllowance: 150,
      transportAllowance: 50,
      medicalAllowance: 0,
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: '',
      residencyType: 'مادة 18 (قطاع أهلي)',
      documents: []
    };
    setSelectedEmployee(newEmp);
    setActiveFormTab('work');
  };

  const handleSaveEmployee = () => {
    if (!selectedEmployee || !selectedEmployee.name) {
      toast.error('يرجى كتابة اسم الموظف على الأقل للحفظ');
      return;
    }
    
    let updated: EmployeeProfile[];
    if (isCreating) {
      updated = [selectedEmployee, ...employees];
      setEmployees(updated);
      setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
      setIsCreating(false);
      toast.success(`تم تسجيل الموظف (${selectedEmployee.name}) بنجاح`);
    } else {
      updated = employees.map(e => e.id === selectedEmployee.id ? selectedEmployee : e);
      setEmployees(updated);
      setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
      toast.success(`تم حفظ بيانات الموظف (${selectedEmployee.name})`);
    }
  };

  const handleDeleteRequest = (emp: EmployeeProfile) => {
    setIsBulkDeleting(false);
    setEmployeeToDelete(emp);
  };

  const handleBulkDeleteRequest = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    setEmployeeToDelete({
      id: 'BULK',
      name: `${selectedIds.length} موظفين محددين`,
      civilId: '',
      jobTitle: '',
      department: '',
      email: '',
      phone: '',
      avatarBg: 'bg-rose-700',
      status: 'active',
      joinDate: '',
      leaveBalance: 0,
      nationality: '',
      birthDate: '',
      gender: 'ذكر',
      maritalStatus: 'أعزب',
      paciAddressNo: '',
      fullAddress: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyRelation: '',
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      bankName: '',
      iban: '',
      residencyType: '',
      documents: []
    });
  };

  const handleConfirmDelete = () => {
    if (isBulkDeleting) {
      const count = selectedIds.length;
      const updated = employees.filter(e => !selectedIds.includes(e.id));
      setEmployees(updated);
      setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
      setSelectedIds([]);
      setIsBulkDeleting(false);
      setEmployeeToDelete(null);
      toast.success(`تم حذف ${count} موظفين بنجاح`);
      return;
    }

    if (!employeeToDelete) return;
    const empName = employeeToDelete.name;
    const updated = employees.filter(e => e.id !== employeeToDelete.id);
    setEmployees(updated);
    setPersistentData(MANARA_STORAGE_KEYS.EMPLOYEES, updated);
    
    if (selectedEmployee?.id === employeeToDelete.id) {
      setSelectedEmployee(null);
      setIsCreating(false);
    }
    setEmployeeToDelete(null);
    toast.success(`تم حذف ملف الموظف (${empName}) بنجاح`);
  };

  // Open Scanner for a specific Document Type
  const handleTriggerScanner = (type: 'civil_id' | 'passport' | 'moh_license' | 'pam_permit') => {
    setShowScannerDropdown(false);
    setScanningDocType(type);
    setScannedPreviewImage(null);
    setIsScanningInProgress(false);
    setIsScanningModalOpen(true);
  };

  // Process Document and Extract Data (Real AI Vision OCR)
  const processDocumentExtraction = async (file?: File) => {
    if (!file) return;
    setIsScanningInProgress(true);
    setScanStepMessage('جاري إرسال المستند لتحليل القراءة الضوئية الذكية (AI Vision OCR)...');

    try {
      const scanned: ScannedData = await processAnyDocument(file, undefined, scanningDocType);
      
      if (!selectedEmployee) return;
      let updatedEmp = { ...selectedEmployee };
      let newDoc: EmployeeDocument | null = null;

      if (scanningDocType === 'civil_id') {
        const cleanCivilId = (scanned.civilId || '').trim().replace(/\D/g, '');
        let bDate = scanned.birthDate || scanned.dob || '';
        let genderVal: 'ذكر' | 'أنثى' = (scanned.gender === 'FEMALE' || scanned.gender === 'أنثى') ? 'أنثى' : 'ذكر';

        if (cleanCivilId.length === 12) {
          const valRes = validateKuwaitCivilId(cleanCivilId);
          if (valRes.isValid && valRes.dob && !bDate) {
            bDate = valRes.dob;
          }
          if (valRes.gender) {
            genderVal = valRes.gender === 'FEMALE' ? 'أنثى' : 'ذكر';
          }
        }

        updatedEmp = {
          ...updatedEmp,
          civilId: cleanCivilId || updatedEmp.civilId,
          name: scanned.fullNameAr || scanned.fullName || updatedEmp.name,
          nameEn: scanned.fullNameEn || updatedEmp.nameEn,
          birthDate: bDate || updatedEmp.birthDate,
          gender: genderVal || updatedEmp.gender,
          paciAddressNo: (scanned.address as any)?.block ? `${(scanned.address as any).block}-${(scanned.address as any).building || ''}` : updatedEmp.paciAddressNo,
          fullAddress: scanned.address ? `${scanned.address.area || ''} - ق ${scanned.address.block || ''} - ش ${scanned.address.street || ''} - مبنى ${scanned.address.building || ''}` : updatedEmp.fullAddress,
          nationality: scanned.nationality || updatedEmp.nationality
        };

        newDoc = {
          id: `DOC-PACI-${Date.now()}`,
          type: 'civil_id',
          title: 'البطاقة المدنية (الوجهين) - PACI',
          docNumber: cleanCivilId || updatedEmp.civilId,
          expiryDate: scanned.expiryDate || '2028-10-15',
          status: 'valid',
          scannedAt: new Date().toISOString().split('T')[0]
        };

        setActiveFormTab('private');
        toast.success(`تم مسح البطاقة المدنية بنجاح: ${updatedEmp.name} (${updatedEmp.civilId})`);

      } else if (scanningDocType === 'passport') {
        const passNum = (scanned.passportNo || '').trim();
        const resExpiry = scanned.expiryDate || updatedEmp.residencyExpiry || '';

        updatedEmp = {
          ...updatedEmp,
          passportNo: passNum || updatedEmp.passportNo,
          passportExpiry: scanned.expiryDate || updatedEmp.passportExpiry,
          residencyReferenceNo: scanned.unifiedNo || updatedEmp.residencyReferenceNo,
          residencyExpiry: resExpiry || updatedEmp.residencyExpiry,
          nationality: scanned.nationality || updatedEmp.nationality
        };

        newDoc = {
          id: `DOC-PASS-${Date.now()}`,
          type: 'passport',
          title: 'جواز السفر ومرجع الإقامة',
          docNumber: passNum || updatedEmp.passportNo,
          expiryDate: resExpiry || '2027-11-30',
          status: 'valid',
          scannedAt: new Date().toISOString().split('T')[0]
        };

        setActiveFormTab('residency');
        toast.success('تم مسح جواز السفر والإقامة واستخراج البيانات بنجاح');

      } else if (scanningDocType === 'moh_license') {
        const mohLic = (scanned.mohLicenseNo || scanned.civilId || '').trim();
        const mohExp = scanned.expiryDate || '2027-12-31';

        updatedEmp = {
          ...updatedEmp,
          mohLicenseNo: mohLic || updatedEmp.mohLicenseNo,
          mohLicenseExpiry: mohExp,
          medicalDegree: scanned.profession || updatedEmp.medicalDegree || 'طبيب أخصائي (Specialist)',
          specialty: scanned.profession || updatedEmp.specialty || 'طب عام وجراحة'
        };

        newDoc = {
          id: `DOC-MOH-${Date.now()}`,
          type: 'moh_license',
          title: 'ترخيص مزاولة المهنة الطبية - MOH',
          docNumber: mohLic || updatedEmp.mohLicenseNo,
          expiryDate: mohExp,
          status: 'valid',
          scannedAt: new Date().toISOString().split('T')[0]
        };

        setActiveFormTab('medical');
        toast.success('تم مسح ترخيص وزارة الصحة (MOH) وتعبئة بيانات الترخيص بنجاح');

      } else if (scanningDocType === 'pam_permit') {
        const pamNo = (scanned.civilId || scanned.unifiedNo || '').trim();

        updatedEmp = {
          ...updatedEmp,
          pamPermitNo: pamNo || updatedEmp.pamPermitNo,
          authorizedJobTitle: scanned.profession || scanned.jobTitle || updatedEmp.jobTitle || 'موظف معتمد'
        };

        newDoc = {
          id: `DOC-PAM-${Date.now()}`,
          type: 'pam_permit',
          title: 'إذن العمل الصادر من القوى العاملة (PAM)',
          docNumber: pamNo || updatedEmp.pamPermitNo,
          expiryDate: scanned.expiryDate || updatedEmp.residencyExpiry || '2027-05-15',
          status: 'valid',
          scannedAt: new Date().toISOString().split('T')[0]
        };

        setActiveFormTab('residency');
        toast.success('تم مسح إذن العمل (PAM) وتحديث البيانات المصرح بها');
      }

      if (newDoc) {
        const existingDocs = updatedEmp.documents ? updatedEmp.documents.filter(d => d.type !== newDoc!.type) : [];
        updatedEmp.documents = [newDoc, ...existingDocs];
      }

      setSelectedEmployee(updatedEmp);
    } catch (err: any) {
      console.error('OCR Extraction Error:', err);
      toast.error(err.message || 'تعذر استخراج البيانات آلياً من المستند. يمكنك مراجعة الملف وتعبئة البيانات يدوياً.');
    } finally {
      setIsScanningInProgress(false);
      setIsScanningModalOpen(false);
    }
  };

  const handleScannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setScannedPreviewImage(url);
      processDocumentExtraction(file);
    }
  };

  return (
    <div className="space-y-4 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* 1. Top Header & Breadcrumbs Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedEmployee ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedEmployee(null); setIsCreating(false); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="الرجوع إلى دليل الموظفين"
              >
                <ArrowRight size={15} />
                <span>دليل الموظفين</span>
              </button>
              <ChevronRight size={14} className="text-slate-400 rotate-180" />
              <span className="text-xs font-bold text-[#714B67] truncate max-w-[220px] sm:max-w-xs">
                {selectedEmployee.name || (isCreating ? 'تسجيل موظف جديد' : selectedEmployee.id)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900">دليل وبطاقات الموظفين (Odoo Directory & Scanner)</h1>
                <p className="text-[11px] text-slate-500">
                  المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | ماسح الوثائق الذكي AI OCR
                </p>
              </div>
            </div>
          )}

          {selectedEmployee && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-2 mr-1">
              <button
                type="button"
                onClick={handleSaveEmployee}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save size={14} /> حفظ (Save)
              </button>

              <button
                type="button"
                onClick={() => { setSelectedEmployee(null); setIsCreating(false); }}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                تجاهل (Discard)
              </button>

              <button
                type="button"
                onClick={() => safePrintAction(`بطاقة الموظف - ${selectedEmployee.name || selectedEmployee.id}`)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="طباعة بطاقة الموظف"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              {!isCreating && (
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(selectedEmployee)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="حذف ملف الموظف"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">حذف</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Header Action Buttons & AI Scanner Dropdown */}
        <div className="flex items-center gap-2 relative">
          
          {selectedEmployee && (
            /* AI OCR Scanner Dropdown Button */
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowScannerDropdown(!showScannerDropdown)}
                className="bg-gradient-to-r from-purple-700 to-[#714B67] hover:from-purple-800 hover:to-[#5a3a52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Camera size={15} className="text-amber-300 animate-pulse" />
                <span>📷 المسح الضوئي للوثائق (AI Scanner)</span>
                <ChevronDown size={14} />
              </button>

              {showScannerDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scaleUp">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                    اختر نوع الوثيقة للمسح والتفريغ التلقائي:
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTriggerScanner('civil_id')}
                    className="w-full text-right px-3.5 py-2.5 text-xs hover:bg-purple-50 text-slate-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">🆔</div>
                    <div>
                      <div className="text-slate-900">مسح البطاقة المدنية (الوجهين)</div>
                      <div className="text-[10px] text-slate-400 font-normal">استخراج الاسم، الرقم المدني، والمواليد، والعنوان الآلي</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerScanner('passport')}
                    className="w-full text-right px-3.5 py-2.5 text-xs hover:bg-purple-50 text-slate-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">🛂</div>
                    <div>
                      <div className="text-slate-900">مسح جواز السفر والإقامة</div>
                      <div className="text-[10px] text-slate-400 font-normal">استخراج رقم الجواز، مرجع الإقامة، وتاريخ الانتهاء</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerScanner('moh_license')}
                    className="w-full text-right px-3.5 py-2.5 text-xs hover:bg-purple-50 text-slate-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">🩺</div>
                    <div>
                      <div className="text-slate-900">مسح ترخيص مزاولة المهنة (MOH)</div>
                      <div className="text-[10px] text-slate-400 font-normal">استخراج رقم الترخيص، الدرجة الطبية، وتاريخ الصلاحية</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerScanner('pam_permit')}
                    className="w-full text-right px-3.5 py-2.5 text-xs hover:bg-purple-50 text-slate-800 font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="p-1.5 bg-purple-50 text-[#714B67] rounded-lg">📄</div>
                    <div>
                      <div className="text-slate-900">مسح إذن العمل (PAM Permit)</div>
                      <div className="text-[10px] text-slate-400 font-normal">استخراج رقم إذن العمل، المهنة المصرح بها، وملف الشؤون</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {!selectedEmployee && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Odoo 18 View Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض شبكة البطاقات (Kanban)"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">بطاقات</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض القائمة والجدول (List)"
                >
                  <List size={14} />
                  <span className="hidden sm:inline">قائمة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'tree' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض الهيكل الإداري والأقسام (Hierarchy)"
                >
                  <Network size={14} />
                  <span className="hidden sm:inline">هيكل</span>
                </button>
              </div>

              {/* Export to Excel Button */}
              <button
                type="button"
                onClick={() => {
                  const exportData = filteredEmployees.map((emp, idx) => ({
                    'م': idx + 1,
                    'الكود': emp.id,
                    'اسم الموظف': emp.name,
                    'الرقم المدني': emp.civilId,
                    'المسمى الوظيفي': emp.jobTitle,
                    'القسم': emp.department,
                    'الجنسية': emp.nationality,
                    'الراتب الأساسي (د.ك)': Number(emp.basicSalary.toFixed(3)),
                    'الراتب الإجمالي (د.ك)': Number((emp.basicSalary + (emp.housingAllowance || 0) + (emp.transportAllowance || 0) + (emp.medicalAllowance || 0)).toFixed(3)),
                    'البنك': emp.bankName,
                    'الآيبان': emp.iban,
                    'رقم الهاتف': emp.phone,
                    'تاريخ التعيين': emp.joinDate,
                    'انتهاء الإقامة': emp.residencyExpiry,
                    'ترخيص MOH': emp.mohLicenseNo || 'لا ينطبق',
                    'الحالة': emp.status === 'active' ? 'على رأس عمله' : emp.status === 'on_leave' ? 'في إجازة' : 'متوقف'
                  }));
                  exportToExcel(exportData, 'دليل_الموظفين_المنار_كلينك', 'الموظفين');
                }}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="تصدير بيانات الموظفين إلى Excel (.xlsx)"
              >
                <FileSpreadsheet size={15} className="text-emerald-600" />
                <span className="hidden sm:inline">تصدير Excel</span>
              </button>

              {/* Print Directory Button */}
              <button
                type="button"
                onClick={() => safePrintAction('دليل الموظفين العام')}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="طباعة تقرير دليل الموظفين"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">طباعة الدليل</span>
              </button>

              {/* Create Employee Button */}
              <button
                type="button"
                onClick={handleStartCreate}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PlusCircle size={15} /> <span>تسجيل موظف</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main View: Full-Width Form Sheet OR Kanban Grid */}
      {selectedEmployee ? (
        /* ODOO 18 ENTERPRISE FULL-WIDTH FORM SHEET */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden w-full space-y-0">
          
          {/* Top Form Header & Smart Stat Buttons */}
          <div className="bg-slate-50/80 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
            
            {/* Status & ID Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">الرقم التعريفي:</span>
              <span className="text-xs font-mono font-bold bg-[#714B67]/10 text-[#714B67] px-2 py-0.5 rounded-md border border-[#714B67]/20">
                {selectedEmployee.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmployee({
                  ...selectedEmployee,
                  status: selectedEmployee.status === 'active' ? 'on_leave' : 'active'
                })}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border transition cursor-pointer flex items-center gap-1 ${
                  selectedEmployee.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
                title="انقر لتبديل الحالة"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{selectedEmployee.status === 'active' ? 'على رأس العمل (Active)' : 'إجازة / معلق (On Leave)'}</span>
              </button>
            </div>

            {/* Smart Stat Buttons Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              
              {/* 1. Leave Balance */}
              <button
                type="button"
                onClick={() => setActiveFormTab('work')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#714B67] rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-purple-50 text-[#714B67] rounded-lg group-hover:bg-[#714B67] group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">{selectedEmployee.leaveBalance} يوماً</div>
                  <div className="text-slate-400 text-[10px]">رصيد الإجازات</div>
                </div>
              </button>

              {/* 2. WPS Gross Salary */}
              <button
                type="button"
                onClick={() => setActiveFormTab('payroll')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">
                    {(selectedEmployee.basicSalary + selectedEmployee.housingAllowance + selectedEmployee.transportAllowance + (selectedEmployee.medicalAllowance || 0)).toFixed(3)} د.ك
                  </div>
                  <div className="text-slate-400 text-[10px]">الراتب الشامل (WPS)</div>
                </div>
              </button>

              {/* 3. Attendance */}
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs text-right">
                <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">176 ساعة / 99%</div>
                  <div className="text-slate-400 text-[10px]">ساعات الحضور</div>
                </div>
              </div>

              {/* 4. Residency & PAM */}
              <button
                type="button"
                onClick={() => setActiveFormTab('residency')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">{selectedEmployee.residencyType}</div>
                  <div className="text-slate-400 text-[10px]">أذونات PAM</div>
                </div>
              </button>

              {/* 5. Medical MOH */}
              {selectedEmployee.department.includes('طب') && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab('medical')}
                  className="bg-white hover:bg-slate-50 border border-teal-200 hover:border-teal-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
                >
                  <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-teal-800 text-[10px]">ترخيص صحي MOH</div>
                    <div className="text-slate-400 text-[10px]">الكادر الطبي</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Form Header Sheet (Avatar + Main Employee Title) */}
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-start gap-6 bg-white">
            <div className={`w-24 h-24 rounded-2xl ${selectedEmployee.avatarBg || 'bg-[#714B67]'} text-white font-black text-2xl flex items-center justify-center shadow-md flex-shrink-0`}>
              {selectedEmployee.name ? selectedEmployee.name.slice(0, 2) : 'جديد'}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل بالعربية (Arabic Name) *</label>
                  <input
                    type="text"
                    required
                    value={selectedEmployee.name}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                    placeholder="مثال: د. أحمد محمود الكندري"
                    className="w-full text-lg font-black text-slate-900 border-b border-slate-300 focus:border-[#714B67] outline-none bg-transparent pb-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الاسم بالإنجليزية (English Name)</label>
                  <input
                    type="text"
                    value={selectedEmployee.nameEn || ''}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, nameEn: e.target.value })}
                    placeholder="e.g. Dr. Ahmed Mahmoud Al-Kandari"
                    className="w-full text-base font-bold text-slate-800 border-b border-slate-300 focus:border-[#714B67] outline-none bg-transparent pb-1 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">المسمى الوظيفي (Job Position)</label>
                  <input
                    type="text"
                    required
                    value={selectedEmployee.jobTitle}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, jobTitle: e.target.value })}
                    placeholder="مدير الموارد البشرية والشؤون الإدارية"
                    className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67] bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">القسم / الإدارة</label>
                  <select
                    value={selectedEmployee.department}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67] bg-transparent"
                  >
                    <option value="الموارد البشرية">الموارد البشرية</option>
                    <option value="الإدارة العليا">الإدارة العليا</option>
                    <option value="الأطباء">الأطباء</option>
                    <option value="التمريض">التمريض</option>
                    <option value="الأمن والخدمات">الأمن والخدمات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">الرقم المدني الكويتي (12 رقم)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={selectedEmployee.civilId}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, civilId: e.target.value })}
                    placeholder="290010112345"
                    className="w-full text-xs font-mono font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67] bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Odoo Multi-Tab Notebook Navigation */}
          <div className="border-b border-slate-200 bg-slate-50/60 flex gap-2 px-6 overflow-x-auto">
            {[
              { id: 'work', label: 'معلومات العمل والعيادة (Work Info)' },
              { id: 'private', label: 'البيانات الشخصية والخاصة (Private Info)' },
              { id: 'payroll', label: 'الرواتب والبيانات البنكية (WPS Payroll)' },
              { id: 'residency', label: 'أذونات العمل والإقامات (PAM & Residency)' },
              { id: 'medical', label: 'التراخيص الطبية والمؤهلات (MOH & CME)' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeFormTab === tab.id
                    ? 'border-[#714B67] text-[#714B67] bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notebook Tab Contents */}
          <div className="p-6 bg-white min-h-[340px]">
            
            {/* TAB 1: Work Information */}
            {activeFormTab === 'work' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Mail size={14} className="text-[#714B67]" />
                    <span>بيانات الاتصال والتواصل الرسمي</span>
                  </h4>
                  <div>
                    <label className="text-slate-500 block mb-1">البريد الإلكتروني للعمل</label>
                    <input
                      type="email"
                      value={selectedEmployee.email}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم الهاتف النقال (الكويت)</label>
                    <input
                      type="text"
                      value={selectedEmployee.phone}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">المدير المباشر (Direct Manager)</label>
                    <input
                      type="text"
                      value={selectedEmployee.directManager || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, directManager: e.target.value })}
                      placeholder="اسم المدير المباشر للاعتمادات"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Building2 size={14} className="text-[#714B67]" />
                    <span>المنشأة ونظام الدوام</span>
                  </h4>
                  <div>
                    <label className="text-slate-500 block mb-1">المنشأة والمركز التابع له</label>
                    <input
                      type="text"
                      disabled
                      value={activeCompany?.nameAr || 'الشركة الطبية الرئيسية'}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ التعيين</label>
                      <input
                        type="date"
                        value={selectedEmployee.joinDate}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, joinDate: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">رصيد الإجازات السنوية</label>
                      <input
                        type="number"
                        step="0.5"
                        value={selectedEmployee.leaveBalance}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, leaveBalance: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">نوع الشفت والدوام</label>
                    <select 
                      value={selectedEmployee.shiftType || 'دوام صباحي (8:00 ص - 4:00 م)'}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, shiftType: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-bold"
                    >
                      <option>دوام صباحي (8:00 ص - 4:00 م)</option>
                      <option>دوام مناوبة عيادات (9:00 ص - 9:00 م)</option>
                      <option>شفت ليلي طوارئ</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Private Information (البيانات الشخصية والخاصة) */}
            {activeFormTab === 'private' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Private Details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <User size={14} className="text-[#714B67]" />
                      <span>الحالة والبيانات المدنية والشخصية</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 block mb-1">الجنسية</label>
                        <input
                          type="text"
                          value={selectedEmployee.nationality}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, nationality: e.target.value })}
                          placeholder="كويتي / مصري / لبناني..."
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1">تاريخ الميلاد</label>
                        <input
                          type="date"
                          value={selectedEmployee.birthDate}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, birthDate: e.target.value })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 block mb-1">النوع / الجنس</label>
                        <select
                          value={selectedEmployee.gender}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, gender: e.target.value as any })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                        >
                          <option value="ذكر">ذكر</option>
                          <option value="أنثى">أنثى</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1">الحالة الاجتماعية</label>
                        <select
                          value={selectedEmployee.maritalStatus}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, maritalStatus: e.target.value as any })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                        >
                          <option value="أعزب">أعزب</option>
                          <option value="متزوج">متزوج / معيل</option>
                          <option value="مطلق">مطلق</option>
                          <option value="أرمل">أرمل</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                        <MapPin size={13} className="text-blue-600" />
                        <span>الرقم الآلي للعنوان (PACI Automated No)</span>
                      </div>
                      <input
                        type="text"
                        value={selectedEmployee.paciAddressNo || ''}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, paciAddressNo: e.target.value })}
                        placeholder="8 أرقام مثل: 18492019"
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900"
                      />
                    </div>
                  </div>

                  {/* Address & Emergency Contacts */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <HeartHandshake size={14} className="text-[#714B67]" />
                      <span>العنوان التفصيلي وجهة الاتصال في الطوارئ</span>
                    </h4>

                    <div>
                      <label className="text-slate-500 block mb-1">العنوان بالتفصيل (المحافظة، المنطقة، القطعة، الشارع)</label>
                      <textarea
                        rows={2}
                        value={selectedEmployee.fullAddress}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, fullAddress: e.target.value })}
                        placeholder="محافظة العاصمة - منطقة الشرق - قطعة 1 - شارع مبارك الكبير - مبنى 14"
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                      />
                    </div>

                    <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-3">
                      <div className="font-bold text-rose-900 flex items-center gap-1.5">
                        <Phone size={13} className="text-rose-600" />
                        <span>جهة الاتصال في حالات الطوارئ (Emergency Contact)</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-500 block mb-1 text-[11px]">اسم الشخص المقرب</label>
                          <input
                            type="text"
                            value={selectedEmployee.emergencyContactName || ''}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, emergencyContactName: e.target.value })}
                            placeholder="الاسم الثلاثي"
                            className="w-full p-2 bg-white border border-rose-200 rounded-lg text-slate-800 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-500 block mb-1 text-[11px]">صلة القرابة</label>
                          <input
                            type="text"
                            value={selectedEmployee.emergencyRelation || ''}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, emergencyRelation: e.target.value })}
                            placeholder="الزوجة / الوالد / الشقيق"
                            className="w-full p-2 bg-white border border-rose-200 rounded-lg text-slate-800 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1 text-[11px]">رقم هاتف الطوارئ</label>
                        <input
                          type="text"
                          value={selectedEmployee.emergencyContactPhone || ''}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, emergencyContactPhone: e.target.value })}
                          placeholder="+965 99000000"
                          className="w-full p-2 bg-white border border-rose-200 rounded-lg text-slate-800 font-mono font-bold"
                          dir="ltr"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WPS Payroll & Banking */}
            {activeFormTab === 'payroll' && (
              <div className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Salary Structure */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-600" />
                      <span>مكونات الراتب ونظام حماية الأجور (WPS)</span>
                    </h4>
                    <div>
                      <label className="text-slate-500 block mb-1">الراتب الأساسي (Basic Salary - د.ك)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedEmployee.basicSalary}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, basicSalary: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-500 block mb-1 text-[11px]">بدل السكن (د.ك)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={selectedEmployee.housingAllowance}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, housingAllowance: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1 text-[11px]">بدل الانتقال (د.ك)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={selectedEmployee.transportAllowance}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, transportAllowance: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1 text-[11px]">البدل الطبي / أخرى</label>
                        <input
                          type="number"
                          step="0.001"
                          value={selectedEmployee.medicalAllowance || 0}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, medicalAllowance: Number(e.target.value) })}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <span className="font-bold text-emerald-800">إجمالي الراتب المستحق (Gross Salary):</span>
                      <span className="font-mono font-black text-sm text-emerald-900">
                        {(selectedEmployee.basicSalary + selectedEmployee.housingAllowance + selectedEmployee.transportAllowance + (selectedEmployee.medicalAllowance || 0)).toFixed(3)} KWD
                      </span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                      <CreditCard size={14} className="text-[#714B67]" />
                      <span>البيانات البنكية وتحويل الرواتب (WPS)</span>
                    </h4>
                    <div>
                      <label className="text-slate-500 block mb-1">اسم البنك الكويتي المعتمد</label>
                      <select
                        value={selectedEmployee.bankName}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, bankName: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-900"
                      >
                        <option value="بنك الكويت الوطني (NBK)">بنك الكويت الوطني (NBK)</option>
                        <option value="بيت التمويل الكويتي (KFH)">بيت التمويل الكويتي (KFH)</option>
                        <option value="بنك بوبيان (Boubyan)">بنك بوبيان (Boubyan)</option>
                        <option value="بنك الخليج (Gulf Bank)">بنك الخليج (Gulf Bank)</option>
                        <option value="البنك التجاري الكويتي (CBK)">البنك التجاري الكويتي (CBK)</option>
                        <option value="بنك برقان (Burgan)">بنك برقان (Burgan)</option>
                        <option value="بنك وربة (Warba)">بنك وربة (Warba)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">رقم الآيبان (IBAN - 30 حرف ورقم)</label>
                      <input
                        type="text"
                        maxLength={30}
                        value={selectedEmployee.iban}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, iban: e.target.value })}
                        placeholder="KW00XXXX0000000000000000000000"
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold uppercase text-slate-900"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Residency & PAM */}
            {activeFormTab === 'residency' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <FolderKanban size={14} className="text-amber-600" />
                  <span>الهيئة العامة للقوى العاملة والجوازات (PAM & Residency)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">نوع الإقامة</label>
                    <select 
                      value={selectedEmployee.residencyType}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, residencyType: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    >
                      <option value="مواطن كويتي">مواطن كويتي</option>
                      <option value="مادة 18 (قطاع أهلي)">مادة 18 (قطاع أهلي / عيادات ومستشفيات)</option>
                      <option value="مادة 17 (قطاع حكومي)">مادة 17 (قطاع حكومي)</option>
                      <option value="أبناء كويتيات">أبناء كويتيات</option>
                      <option value="مواطن خليجي">مواطن خليجي</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم مرجع الإقامة (MOI Reference)</label>
                    <input
                      type="text"
                      value={selectedEmployee.residencyReferenceNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, residencyReferenceNo: e.target.value })}
                      placeholder="REF-XXXXXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">تاريخ انتهاء الإقامة</label>
                    <input
                      type="date"
                      value={selectedEmployee.residencyExpiry || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, residencyExpiry: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">رقم جواز السفر</label>
                    <input
                      type="text"
                      value={selectedEmployee.passportNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, passportNo: e.target.value })}
                      placeholder="K12345678"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">تاريخ انتهاء جواز السفر</label>
                    <input
                      type="date"
                      value={selectedEmployee.passportExpiry || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, passportExpiry: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم إذن العمل (PAM Permit)</label>
                    <input
                      type="text"
                      value={selectedEmployee.pamPermitNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, pamPermitNo: e.target.value })}
                      placeholder="PAM-2024-XXXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Scanned Documents Badges & Files */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderKanban size={15} className="text-[#714B67]" />
                      <span>المستندات، الإقامات وتراخيص العمل المرفقة (Odoo Documents & Visas):</span>
                    </h5>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDocumentUploadOpen(true)}
                        className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <PlusCircle size={14} />
                        <span>أرشفة ورفع مستند جديد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTriggerScanner('pam_permit')}
                        className="bg-purple-100 text-[#714B67] hover:bg-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Scan size={14} />
                        <span>فحص بالـ AI</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                      selectedEmployee.documents.map(doc => (
                        <div key={doc.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold shrink-0">
                              <FileCheck size={18} />
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-800 truncate text-xs">{doc.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">{doc.docNumber} | ينتهي: {doc.expiryDate}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              doc.status === 'valid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              doc.status === 'expiring_soon' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {doc.status === 'valid' ? 'سارٍ وموثق' : doc.status === 'expiring_soon' ? 'قريب الانتهاء' : 'منتهي الصلاحية'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedDocs = selectedEmployee.documents.filter(d => d.id !== doc.id);
                                setSelectedEmployee({ ...selectedEmployee, documents: updatedDocs });
                                setEmployees(employees.map(e => e.id === selectedEmployee.id ? { ...e, documents: updatedDocs } : e));
                                toast.success('تم حذف المستند بنجاح');
                              }}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="حذف المستند"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-6 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-xs text-slate-600">لا توجد وثائق أو إقامات مرفقة لهذا الموظف حالياً.</p>
                        <p className="text-[11px]">اضغط على زر (أرشفة ورفع مستند جديد) بالأعلى لرفع البطاقة المدنية، الإقامة، أو ترخيص وزارة الصحة.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Medical Licenses (MOH & CME) */}
            {activeFormTab === 'medical' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
                  <ShieldAlert size={14} className="text-teal-600" />
                  <span>التراخيص الطبية وساعات التعليم الطبي المستمر (MOH & CME)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">رقم ترخيص مزاولة المهنة (MOH ID)</label>
                    <input
                      type="text"
                      value={selectedEmployee.mohLicenseNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseNo: e.target.value })}
                      placeholder="MOH-OPH-2024-XXXX"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-teal-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">الدرجة الطبية والتصنيف المهني</label>
                    <input
                      type="text"
                      value={selectedEmployee.medicalDegree || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, medicalDegree: e.target.value })}
                      placeholder="استشاري أول / أخصائي / ممارس عام"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">التخصص الدقيق (Medical Specialty)</label>
                    <input
                      type="text"
                      value={selectedEmployee.specialty || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, specialty: e.target.value })}
                      placeholder="طب وجراحة العيون / التمريض العام..."
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">تاريخ انتهاء ترخيص مزاولة المهنة (MOH Expiry)</label>
                    <input
                      type="date"
                      value={selectedEmployee.mohLicenseExpiry || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseExpiry: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">ساعات التعليم الطبي المستمر المنجزة (CME Hours)</label>
                    <input
                      type="number"
                      value={selectedEmployee.cmeHoursCompleted || 0}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, cmeHoursCompleted: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-600 text-white rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-teal-950">حالة الاعتماد في السجل الطبي لوزارة الصحة (MOH Registry)</div>
                      <div className="text-[11px] text-teal-700">ترخيص سارٍ ومستوفٍ لكافة اشتراطات النقابة والتعليم المستمر</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerScanner('moh_license')}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scan size={14} /> مسح ترخيص جديد
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chatter Section */}
          <div className="border-t border-slate-200">
            <OdooChatter 
              recordId={selectedEmployee.id}
              model="hr.employee"
              followers={[
                { id: '1', name: 'أحمد الكندري (مدير الموارد البشرية)' },
                { id: '2', name: 'يوسف العلي (مسؤول الجوازات)' }
              ]}
              messages={[
                {
                  id: '1',
                  author: 'النظام',
                  type: 'tracking',
                  date: new Date().toLocaleDateString('ar-KW'),
                  content: `تم فتح وتوثيق بطاقة الموظف (${selectedEmployee.name}) بنمط Odoo 18 Form Sheet وتحديث الوثائق بالماسح الضوئي الذكي`
                }
              ]}
            />
          </div>

        </div>
      ) : (
        /* EMPLOYEES DIRECTORY MAIN CONTAINER */
        <div className="space-y-4">
          {/* Department Filter, Search Bar & Bulk Actions */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                    selectedDept === dept 
                      ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Bulk Actions Bar if items selected */}
              {selectedIds.length > 0 && viewMode === 'list' && (
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 animate-fadeIn">
                  <span className="text-xs font-bold text-purple-900">
                    محدد: {selectedIds.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkDeleteRequest}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>حذف المحدد</span>
                  </button>
                </div>
              )}

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالاسم أو الرقم المدني أو الكود..."
                  className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67] shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC VIEW RENDERING */}
          {viewMode === 'kanban' && (
            <EmployeeKanbanView
              employees={filteredEmployees}
              onSelectEmployee={(emp) => { setSelectedEmployee(emp); setIsCreating(false); }}
              onDeleteEmployee={handleDeleteRequest}
            />
          )}

          {viewMode === 'list' && (
            <EmployeeListView
              employees={filteredEmployees}
              onSelectEmployee={(emp) => { setSelectedEmployee(emp); setIsCreating(false); }}
              onDeleteEmployee={handleDeleteRequest}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          )}

          {viewMode === 'tree' && (
            <EmployeeHierarchyView
              employees={filteredEmployees}
              onSelectEmployee={(emp) => { setSelectedEmployee(emp); setIsCreating(false); }}
              onDeleteEmployee={handleDeleteRequest}
            />
          )}
        </div>
      )}

      {/* 3. MULTI-DOCUMENT AI OCR SCANNER MODAL */}
      {isScanningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-right">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-purple-600 to-[#714B67] text-white rounded-xl">
                  <Scan className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {scanningDocType === 'civil_id' && 'مسح وتفريغ البطاقة المدنية (PACI)'}
                    {scanningDocType === 'passport' && 'مسح جواز السفر وتأشيرة الإقامة'}
                    {scanningDocType === 'moh_license' && 'مسح ترخيص مزاولة المهنة (MOH)'}
                    {scanningDocType === 'pam_permit' && 'مسح إذن العمل (PAM Permit)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    محرك الاستخراج الذكي AI OCR وقراءة النصوص وتعبئة الحقول
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScanningModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              
              {isScanningInProgress ? (
                /* Scanning Progress Indicator */
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-[#714B67] border-2 border-purple-200 flex items-center justify-center mx-auto animate-spin">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{scanStepMessage}</h4>
                    <p className="text-xs text-slate-400 font-mono">OpenAI Vision & Regex Engine Running...</p>
                  </div>
                </div>
              ) : (
                /* Upload & Drag Drop Zone */
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={scannerFileInputRef}
                    onChange={handleScannerFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />

                  <div
                    onClick={() => scannerFileInputRef.current?.click()}
                    className="border-2 border-dashed border-purple-300 hover:border-[#714B67] bg-purple-50/40 hover:bg-purple-50/80 p-8 rounded-2xl text-center cursor-pointer transition space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#714B67] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-slate-800">
                        انقر لاختيار صورة الوثيقة أو اسحبها هنا
                      </div>
                      <div className="text-[10px] text-slate-400">
                        يدعم ملفات JPG، PNG، و PDF عالية الدقة
                      </div>
                    </div>
                  </div>

                  {/* Fast Simulation Scan Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => processDocumentExtraction()}
                      className="w-full bg-[#714B67] hover:bg-[#5a3a52] text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Sparkles size={15} className="text-amber-300" />
                      <span>بدء المسح والتفريغ التلقائي السريع (Auto-Fill)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* 4. EMPLOYEE DELETE CONFIRMATION MODAL */}
      <EmployeeDeleteConfirmModal
        isOpen={!!employeeToDelete}
        onClose={() => { setEmployeeToDelete(null); setIsBulkDeleting(false); }}
        onConfirm={handleConfirmDelete}
        employee={employeeToDelete}
        count={isBulkDeleting ? selectedIds.length : 1}
      />

      {/* 5. ODOO DOCUMENT UPLOAD MODAL */}
      <OdooDocumentUploadModal
        isOpen={isDocumentUploadOpen}
        onClose={() => setIsDocumentUploadOpen(false)}
        onSave={handleSaveNewDocument}
        employeeList={employees.map(emp => ({
          id: emp.id,
          nameAr: emp.name,
          civilId: emp.civilId,
          dept: emp.department,
          jobTitle: emp.jobTitle
        }))}
      />

    </div>
  );
};

export default OdooEmployeesDirectoryApp;
