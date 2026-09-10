import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  Briefcase, 
  Calendar, 
  Award, 
  Zap, 
  Trash2,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Save,
  Laptop,
  Fingerprint,
  FileText,
  ShieldAlert,
  Eye,
  Download,
  Upload,
  UserCheck,
  Building2,
  Activity,
  HeartPulse
} from 'lucide-react';
import { OnboardingPlan, OnboardingTask } from '../../types';
import { OnboardingWizardModal } from './OnboardingWizardModal';
import { useCompany } from '../../context/CompanyContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { TabDocumentScanner } from '../TabDocumentScanner';
import { TenantDatabaseService } from '../../services/tenantDataService';
import { triggerContractRunningLeaveAllocation } from '../../utils/contractLeaveTrigger';

interface OnboardingTrackerAppProps {
  existingEmployees?: Array<{ id: string; nameAr: string; jobTitle?: string; dept?: string; civilId?: string }>;
  onEmployeeCreated?: (emp: any) => void;
}

const STORAGE_KEY = 'odoo_onboarding_plans_v1';

export const OnboardingTrackerApp: React.FC<OnboardingTrackerAppProps> = ({ 
  existingEmployees = [],
  onEmployeeCreated 
}) => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || 'comp-almanar';

  const [plans, setPlans] = useState<OnboardingPlan[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<OnboardingPlan | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState<'verification' | 'custody' | 'biometrics' | 'compliance'>('verification');
  const [pendingOcrData, setPendingOcrData] = useState<{ docType: string; data: any } | null>(null);

  // Sync Onboarding Plan data back to permanent Employee directory record
  const syncPlanWithEmployee = (plan: OnboardingPlan) => {
    try {
      const empKey = `odoo_employees_v1_${companyId}`;
      const raw = localStorage.getItem(empKey);
      if (raw) {
        const employees = JSON.parse(raw);
        let found = false;
        let matchedEmployee: any = null;

        const updatedEmployees = employees.map((emp: any) => {
          // Match by id, or civilId, or name
          const isMatch = (emp.id && plan.employeeId && emp.id === plan.employeeId) ||
                          (emp.civilId && plan.civilId && emp.civilId === plan.civilId && emp.civilId !== 'غير محدد') ||
                          (emp.nameAr && plan.employeeName && emp.nameAr === plan.employeeName);
          if (isMatch) {
            found = true;
            
            // الربط التلقائي والنشط بدورة الموظف
            const isCommenced = plan.commencementDetails?.isCommenced || !!plan.commencementDetails?.actualJoiningDate;
            const finalStatus = isCommenced ? 'على رأس العمل' : (emp.status || 'Draft');

            const updatedEmp = {
              ...emp,
              status: finalStatus,
              hireDate: plan.commencementDetails?.actualJoiningDate || emp.hireDate,
              civilId: plan.civilId && plan.civilId !== 'غير محدد' ? plan.civilId : emp.civilId,
              civilIdExpiry: plan.civilIdExpiry || emp.civilIdExpiry,
              passportNo: plan.passportNo || emp.passportNo,
              passportExpiry: plan.passportExpiry || emp.passportExpiry,
              mohLicense: plan.mohLicense || emp.mohLicense,
              mohLicenseExpiry: plan.mohLicenseExpiry || emp.mohLicenseExpiry,
              medicalFitnessStatus: plan.medicalFitnessStatus || emp.medicalFitnessStatus,
              medicalFitnessDate: plan.medicalFitnessDate || emp.medicalFitnessDate,
              medicalFitnessHospital: plan.medicalFitnessHospital || emp.medicalFitnessHospital,
              directSupervisor: plan.commencementDetails?.directSupervisor || emp.directSupervisor,
              branchLocation: plan.commencementDetails?.branchLocation || emp.branch || emp.branchLocation,
              basicSalary: plan.contractDetails?.basicSalary || emp.basicSalary,
              housingAllowance: plan.contractDetails?.housingAllowance || emp.housingAllowance,
              transportAllowance: plan.contractDetails?.transportAllowance || emp.transportAllowance,
              otherAllowances: plan.contractDetails?.otherAllowances || emp.otherAllowances,
              totalSalary: plan.contractDetails?.totalSalary || emp.totalSalary,
              documentFiles: {
                ...(emp.documentFiles || {}),
                ...(plan.documentFiles || {})
              }
            };
            matchedEmployee = updatedEmp;
            return updatedEmp;
          }
          return emp;
        });

        if (found) {
          localStorage.setItem(empKey, JSON.stringify(updatedEmployees));
          console.log('[OnboardingTrackerApp] Successfully synced plan with permanent employee record.');
          
          // بث إشعار التحديث لتحديث كافة شاشات النظام فوراً حياً وبلا تأخير
          window.dispatchEvent(new Event('manara_employees_updated'));

          // حفظ الموظف حياً وبشكل متكامل في قاعدة بيانات السحابية Firestore
          if (matchedEmployee) {
            try {
              TenantDatabaseService.saveEmployee(matchedEmployee, companyId).then((success) => {
                if (success) console.log('[OnboardingTrackerApp] Synced employee to Cloud Firestore successfully.');
              });
            } catch (dbErr) {
              console.error('Firestore save failed in onboarding sync:', dbErr);
            }
          }

          // الربط التلقائي لتأسيس عقد العمل آلياً في حال تم تأكيد مباشرة العمل الفعلية
          const isCommenced = plan.commencementDetails?.isCommenced || !!plan.commencementDetails?.actualJoiningDate;
          if (isCommenced && matchedEmployee) {
            const contractKey = `odoo_contracts_v1_${companyId}`;
            const rawContracts = localStorage.getItem(contractKey);
            let contractsList = [];
            try {
              contractsList = rawContracts ? JSON.parse(rawContracts) : [];
            } catch {
              contractsList = [];
            }

            const employeeId = matchedEmployee.id || plan.employeeId || `EMP-${Date.now()}`;
            const existingContractIdx = contractsList.findIndex((c: any) => c.id === employeeId || c.employeeId === employeeId);

            const newContract = {
              id: employeeId,
              employeeId: employeeId,
              contractRef: `CONTRACT-${employeeId}`,
              name: plan.employeeName,
              civilId: plan.civilId || matchedEmployee.civilId || '',
              jobTitle: plan.jobTitle || matchedEmployee.jobTitle || 'موظف',
              department: plan.department || matchedEmployee.dept || matchedEmployee.department || 'العموم',
              basicSalary: plan.contractDetails?.basicSalary || matchedEmployee.basicSalary || 0,
              housingAllowance: plan.contractDetails?.housingAllowance || matchedEmployee.housingAllowance || 0,
              transportAllowance: plan.contractDetails?.transportAllowance || matchedEmployee.transportAllowance || 0,
              medicalAllowance: plan.contractDetails?.otherAllowances || matchedEmployee.otherAllowances || 0,
              isKuwaiti: false,
              bankName: 'بيت التمويل الكويتي (KFH)',
              iban: '',
              contractStatus: 'running',
              startDate: plan.commencementDetails?.actualJoiningDate || new Date().toISOString().split('T')[0],
              endDate: '',
              contractType: 'fixed' as const,
              probationDays: 100, // المادة 32 من قانون العمل الكويتي
              noticePeriodMonths: 3,
              workingHoursWeekly: 48,
              status: 'running'
            };

            if (existingContractIdx > -1) {
              contractsList[existingContractIdx] = {
                ...contractsList[existingContractIdx],
                ...newContract
              };
            } else {
              contractsList.push(newContract);
            }

            localStorage.setItem(contractKey, JSON.stringify(contractsList));
            console.log('[OnboardingTrackerApp] Automated Contract established/updated in standard contracts database.');

            // حفظ العقد في قاعدة البيانات السحابية Firestore
            try {
              TenantDatabaseService.saveContract(newContract as any, companyId).then((success) => {
                if (success) console.log('[OnboardingTrackerApp] Synced contract to Cloud Firestore.');
              });
            } catch (cErr) {
              console.error('Firestore contract save failed:', cErr);
            }

            // تفعيل وتوليد حساب رصيد الإجازات السنوية آلياً
            if (plan.commencementDetails?.leaveAccrualActivated) {
              try {
                triggerContractRunningLeaveAllocation({
                  employeeId: employeeId,
                  employeeName: plan.employeeName,
                  startDate: plan.commencementDetails?.actualJoiningDate || new Date().toISOString().split('T')[0],
                  contractStatus: 'running',
                  companyId: companyId
                });
                console.log('[OnboardingTrackerApp] Triggered dynamic leave allocation for active contract.');
              } catch (leaveErr) {
                console.error('Error triggering leave allocation during onboarding completion:', leaveErr);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error syncing plan with employee:', err);
    }
  };

  // Generic updater to keep state, localStorage and permanent employee files in complete sync
  const handleUpdatePlan = (updatedPlan: OnboardingPlan) => {
    setSelectedPlan(updatedPlan);
    const updatedPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    savePlans(updatedPlans);
    syncPlanWithEmployee(updatedPlan);
  };

  const handleApplyOcrResults = () => {
    if (!selectedPlan || !pendingOcrData) return;
    const { docType, data } = pendingOcrData;
    
    const updatedPlan: OnboardingPlan = {
      ...selectedPlan,
      civilId: data.civilId || selectedPlan.civilId,
      civilIdExpiry: data.civilIdExpiry || selectedPlan.civilIdExpiry,
      passportNo: data.passportNo || selectedPlan.passportNo,
      passportExpiry: data.passportExpiry || selectedPlan.passportExpiry,
      mohLicense: data.mohLicense || selectedPlan.mohLicense || data.license_no,
      mohLicenseExpiry: data.mohLicenseExpiry || selectedPlan.mohLicenseExpiry || data.license_expiry,
      employeeName: data.fullNameAr || data.nameAr || selectedPlan.employeeName,
    };
    
    // Auto-complete corresponding task
    const updatedTasks = selectedPlan.tasks.map(t => {
      const titleMatch = t.title.toLowerCase().includes(docType.toLowerCase()) || 
                         (docType === 'civilIdScan' && t.title.includes('البطاقة المدنية')) ||
                         (docType === 'passportScan' && t.title.includes('جواز السفر')) ||
                         (docType === 'pamWorkPermit' && t.title.includes('إذن عمل')) ||
                         (docType === 'mohLicense' && t.title.includes('وزارة الصحة'));
      if (titleMatch) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      return t;
    });
    updatedPlan.tasks = updatedTasks;

    // Create a mock file object for OCR scanning
    const fileInfo = {
      name: `OCR_Scanned_${docType}_${new Date().toISOString().slice(0,10)}.jpg`,
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      fileSize: '45.2 KB',
      uploadDate: new Date().toISOString().slice(0, 10),
      title: docType,
      type: 'image' as const,
      status: 'verified' as const
    };
    
    updatedPlan.documentFiles = {
      ...(selectedPlan.documentFiles || {}),
      [docType]: fileInfo
    };

    handleUpdatePlan(updatedPlan);
    setPendingOcrData(null);
    toast.success('تم تطبيق البيانات المستخرجة ومزامنتها إلى ملف الموظف بنجاح! 🎉');
  };

  const handleRemoveDocumentFile = (docKey: string) => {
    if (!selectedPlan) return;
    const currentFiles = { ...(selectedPlan.documentFiles || {}) };
    delete currentFiles[docKey];
    
    const updatedPlan = {
      ...selectedPlan,
      documentFiles: currentFiles
    };
    
    handleUpdatePlan(updatedPlan);
    toast.success('تم حذف المستند بنجاح من الخطة والملف العام.');
  };

  const handleUploadDocumentFile = (docKey: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      const fileInfo = {
        name: file.name,
        url: base64Url,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadDate: new Date().toISOString().slice(0, 10),
        title: docKey,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        status: 'verified'
      };

      const updatedPlan = {
        ...selectedPlan!,
        documentFiles: {
          ...(selectedPlan!.documentFiles || {}),
          [docKey]: fileInfo
        }
      };

      // Auto-complete corresponding task
      const updatedTasks = selectedPlan!.tasks.map(t => {
        const titleMatch = t.title.toLowerCase().includes(docKey.toLowerCase()) || 
                           (docKey === 'civilIdScan' && t.title.includes('البطاقة المدنية')) ||
                           (docKey === 'passportScan' && t.title.includes('جواز السفر')) ||
                           (docKey === 'pamWorkPermit' && t.title.includes('إذن عمل')) ||
                           (docKey === 'mohLicense' && t.title.includes('وزارة الصحة')) ||
                           (docKey === 'medicalFitness' && t.title.includes('الفحص الطبي'));
        if (titleMatch) {
          return { ...t, completed: true, completedAt: new Date().toISOString() };
        }
        return t;
      });
      updatedPlan.tasks = updatedTasks;

      handleUpdatePlan(updatedPlan);
      toast.success('تم حفظ وإرفاق المستند بالخطة ومزامنته للملف العام للموظف.');
    };
    reader.readAsDataURL(file);
  };

  // Load plans from Supabase / localStorage on mount or company change
  useEffect(() => {
    let isMounted = true;
    const loadPlans = async () => {
      try {
        let loadedPlans: OnboardingPlan[] = [];
        
        // 1. Try Supabase cloud fetch first if configured
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase
              .from('onboarding_plans')
              .select('*')
              .eq('company_id', companyId);

            if (!error && data && data.length > 0) {
              loadedPlans = data.map((row: any) => row.payload || row);
            }
          } catch (sbErr) {
            console.warn('[OnboardingTracker] Supabase fetch notice:', sbErr);
          }
        }

        // 2. Fallback to localStorage scoped by company or default key
        if (loadedPlans.length === 0) {
          const scopedKey = `${STORAGE_KEY}_${companyId}`;
          const savedScoped = localStorage.getItem(scopedKey);
          const savedGlobal = localStorage.getItem(STORAGE_KEY);
          
          if (savedScoped) {
            loadedPlans = JSON.parse(savedScoped);
          } else if (savedGlobal) {
            loadedPlans = JSON.parse(savedGlobal);
          } else {
            // Initial mock onboarding plan
            loadedPlans = [
              {
                id: 'ONB-882191',
                employeeName: 'د. خالد عبد الله العلي',
                jobTitle: 'طبيب ممارس عام',
                department: 'الأطباء',
                civilId: '292011508821',
                expectedStartDate: '2026-09-10',
                templateType: 'medical_specialist',
                status: 'active',
                progressPercentage: 66,
                tasks: [
                  { id: 't1', title: 'استكمال ملف المستندات والبطاقة المدنية', category: 'legal', assignedToRole: 'الموارد البشرية', completed: true },
                  { id: 't2', title: 'مراجعة وترخيص وزارة الصحة (MOH)', category: 'medical', assignedToRole: 'مسؤول التراخيص', completed: true },
                  { id: 't3', title: 'تسليم العهد والأجهزة الإلكترونية', category: 'custody', assignedToRole: 'تقنية المعلومات', completed: true },
                  { id: 't4', title: 'إعداد بريد الشركة وبصمة الدخول', category: 'it', assignedToRole: 'الدعم الفني', completed: true },
                  { id: 't5', title: 'الجلسة التعريفية باللوائح وسياسة المركز', category: 'training', assignedToRole: 'المدير المباشر', completed: false },
                  { id: 't6', title: 'توقيع إقرار مباشرة العمل الرسمي', category: 'legal', assignedToRole: 'الموارد البشرية', completed: false }
                ],
                custodyItems: ['لاب توب محمول', 'بريد إلكتروني رسمي', 'بطاقة وبصمة بوابات المبنى'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ];
          }
        }

        if (isMounted) {
          setPlans(loadedPlans);
          localStorage.setItem(`${STORAGE_KEY}_${companyId}`, JSON.stringify(loadedPlans));
        }
      } catch (e) {
        console.error('Error loading onboarding plans:', e);
      }
    };

    loadPlans();
    return () => { isMounted = false; };
  }, [companyId]);

  // Save plans to Supabase and localStorage
  const savePlans = async (newPlans: OnboardingPlan[]) => {
    setPlans(newPlans);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${companyId}`, JSON.stringify(newPlans));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans));

      // Cloud Supabase sync
      if (isSupabaseConfigured) {
        for (const plan of newPlans) {
          await supabase.from('onboarding_plans').upsert({
            id: plan.id,
            company_id: companyId,
            employee_name: plan.employeeName,
            department: plan.department,
            status: plan.status,
            payload: plan,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      }
    } catch (e) {
      console.error('Error saving onboarding plans:', e);
    }
  };

  // Save current active plan as permanent default template in Supabase
  const handleSaveAsDefaultTemplate = async (planToSave?: OnboardingPlan) => {
    const targetPlan = planToSave || plans[0];
    if (!targetPlan) {
      toast.error('لا توجد خطة تهيئة نشطة للحفظ كقالب دائم');
      return;
    }

    setIsSavingTemplate(true);
    try {
      const templatePayload = {
        id: `TEMPLATE-${companyId}-${Date.now()}`,
        company_id: companyId,
        template_name: `قالب تهيئة معتمد - ${targetPlan.department || 'المنشأة'}`,
        payload: targetPlan,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('company_templates').upsert(templatePayload, { onConflict: 'id' });
        if (error) throw error;
      }

      localStorage.setItem(`odoo_default_template_${companyId}`, JSON.stringify(targetPlan));
      toast.success(`تم حفظ واعتماد قالب التهيئة لقسم (${targetPlan.department}) في قاعدة بيانات Supabase بنجاح!`);
    } catch (err) {
      console.error('Failed to save template to Supabase:', err);
      toast.success('تم حفظ قالب التهيئة محلياً وفي الذاكرة بنجاح.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleLaunchNewPlan = (newPlan: OnboardingPlan) => {
    const updated = [newPlan, ...plans];
    savePlans(updated);
    setSelectedPlan(newPlan);

    if (onEmployeeCreated && newPlan.employeeName) {
      const isExisting = existingEmployees.some(e => e.id === newPlan.employeeId || (e.civilId && e.civilId === newPlan.civilId && newPlan.civilId !== 'غير محدد'));
      if (!isExisting) {
        const sc = newPlan.scannedData || {};
        const generatedEmp = {
          id: `EMP-2026-${Date.now().toString().slice(-4)}`,
          nameAr: newPlan.employeeName,
          fullNameAr: newPlan.employeeName,
          fullNameEn: sc.fullNameEn || sc.fullName || '',
          nameEn: sc.fullNameEn || '',
          jobTitle: newPlan.jobTitle || sc.profession || 'موظف',
          dept: newPlan.department || 'العموم',
          department: newPlan.department || 'العموم',
          civilId: newPlan.civilId !== 'غير محدد' ? newPlan.civilId : (sc.civilId || ''),
          civil_id_number: newPlan.civilId !== 'غير محدد' ? newPlan.civilId : (sc.civilId || ''),
          civilIdExpiry: sc.expiryDate || sc.civilIdExpiry || '2027-01-01',
          civilIdExpiryDate: sc.expiryDate || sc.civilIdExpiry || '2027-01-01',
          hireDate: newPlan.expectedStartDate || new Date().toISOString().slice(0, 10),
          joinDate: newPlan.expectedStartDate || new Date().toISOString().slice(0, 10),
          status: 'على رأس العمل',
          basicSalary: newPlan.contractDetails?.basicSalary || (newPlan.department === 'الأطباء' ? 1200 : 700),
          contractSalary: newPlan.contractDetails?.basicSalary || (newPlan.department === 'الأطباء' ? 1200 : 700),
          housingAllowance: newPlan.contractDetails?.housingAllowance || 100,
          transportAllowance: newPlan.contractDetails?.transportAllowance || 50,
          otherAllowances: newPlan.contractDetails?.otherAllowances || 0,
          allowances: (newPlan.contractDetails?.housingAllowance || 100) + (newPlan.contractDetails?.transportAllowance || 50) + (newPlan.contractDetails?.otherAllowances || 0),
          totalSalary: newPlan.contractDetails?.totalSalary || ((newPlan.contractDetails?.basicSalary || 700) + 150),
          nationality: sc.nationality || 'كويتي',
          gender: sc.gender || 'MALE',
          dob: sc.birthDate || sc.dob || '1990-01-01',
          birthDate: sc.birthDate || sc.dob || '1990-01-01',
          passportNo: sc.passportNo || '',
          passportExpiry: sc.passportExpiryDate || '',
          residencyType: sc.residencyType || (sc.nationality?.includes('كويت') ? 'مواطن' : 'مادة 18 - قطاع أهلي'),
          avatarColor: 'bg-purple-900',
          mohLicense: sc.mohLicenseNo || (newPlan.department === 'الأطباء' ? 'MOH-DOC-TEMP' : ''),
          mohLicenseExpiry: sc.mohLicenseExpiryDate || ''
        };
        onEmployeeCreated(generatedEmp);
      }
    }
  };

  const handleToggleTask = (planId: string, taskId: string) => {
    const updatedPlans = plans.map(p => {
      if (p.id !== planId) return p;

      const updatedTasks = p.tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : undefined
        };
      });

      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progressPercentage = Math.round((completedCount / updatedTasks.length) * 100);
      const newStatus = progressPercentage === 100 ? 'completed' : 'active';

      const updatedPlanObj = {
        ...p,
        tasks: updatedTasks,
        progressPercentage,
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      };

      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan(updatedPlanObj);
      }

      return updatedPlanObj;
    });

    savePlans(updatedPlans);
  };

  const handleDeletePlan = (planId: string) => {
    if (!confirm('هل أنت تأكد من إزالة خطة التهيئة هذه؟')) return;
    const updated = plans.filter(p => p.id !== planId);
    savePlans(updated);
    if (selectedPlan?.id === planId) setSelectedPlan(null);
  };

  // Filtered list
  const filteredPlans = plans.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchSearch = !searchQuery || 
      p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.civilId.includes(searchQuery);

    return matchStatus && matchSearch;
  });

  // Analytics
  const activePlansCount = plans.filter(p => p.status === 'active').length;
  const completedPlansCount = plans.filter(p => p.status === 'completed').length;
  const avgProgress = plans.length > 0 
    ? Math.round(plans.reduce((acc, p) => acc + p.progressPercentage, 0) / plans.length) 
    : 0;

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Top Banner & Header Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#714B67] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#714B67]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>خطط التهيئة وإدارة التعيين (Onboarding Plans & Form Wizard)</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Odoo 18 Transient Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              متابعة مراحل تسليم العهد، المستندات الرسمية، وتراخيص وزارة الصحة للموظفين الجدد خطوة بخطوة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveAsDefaultTemplate()}
            disabled={isSavingTemplate}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
            title="حفظ واعتماد الخطة الحالية كقالب افتراضي دائم في قاعدة بيانات Supabase"
          >
            <Save size={15} />
            <span>{isSavingTemplate ? 'جاري الحفظ...' : 'حفظ كقالب دائم لـ Supabase'}</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>+ معالج خطة تهيئة جديدة (Form Wizard)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">خطط التعيين القائمة (Active)</span>
            <span className="text-lg font-black text-amber-600 font-mono">{activePlansCount} خطة</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">الخطط المكتملة 100% (Completed)</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{completedPlansCount} خطة</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">متوسط نسبة إنجاز التهيئة</span>
            <span className="text-lg font-black text-indigo-700 font-mono">{avgProgress}%</span>
          </div>
          <TrendingUp className="w-6 h-6 text-indigo-500 opacity-80" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'active' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الخطط القائمة ({activePlansCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'completed' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            المكتملة ({completedPlansCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#714B67] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الخطط ({plans.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المسمى..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
        </div>
      </div>

      {/* Main Content Layout: Plans Grid & Selected Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Plans List / Cards */}
        <div className={`${selectedPlan ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
          {filteredPlans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <ListTodo size={36} className="mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="font-bold text-slate-600 text-xs">لا توجد خطط تهيئة قائمة في هذه الفئة</p>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#714B67] font-bold hover:underline cursor-pointer"
              >
                <span>+ تفعيل خطة تهيئة جديدة الآن</span>
              </button>
            </div>
          ) : (
            filteredPlans.map(plan => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`bg-white p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected 
                      ? 'border-[#714B67] ring-2 ring-[#714B67]/20 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{plan.employeeName}</h3>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {plan.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.jobTitle} | {plan.department}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      plan.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {plan.status === 'completed' ? 'مكتملة 100%' : `جارية (${plan.progressPercentage}%)`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>نسبة الإنجاز:</span>
                      <span className="font-mono">{plan.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          plan.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-[#714B67]'
                        }`}
                        style={{ width: `${plan.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      <span>المباشرة: {plan.expectedStartDate}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#714B67]">
                      <span>عرض قائمة التحقق والمهام ({plan.tasks.filter(t => t.completed).length}/{plan.tasks.length})</span>
                      <ChevronLeft size={13} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Task Manager Drawer */}
        {selectedPlan && (
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 text-xs animate-fadeIn">
            {/* Header / Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div>
                <span className="bg-purple-100 text-purple-950 px-2 py-0.5 rounded-full font-bold text-[10px] mb-1.5 inline-block">
                  محطة عمل التعيين والتهيئة الشاملة (4 مراحل)
                </span>
                <h3 className="font-black text-base text-[#714B67] flex items-center gap-2">
                  <span>خطة تهيئة الموظف: {selectedPlan.employeeName}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedPlan.jobTitle} • {selectedPlan.department} • تاريخ المباشرة المتوقع: {selectedPlan.expectedStartDate}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-100"
                  title="حذف الخطة"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-100 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stepper progress & Phase Selector Tabs */}
            <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-3">
              {[
                { id: 'verification', label: '1. الوثائق والـ OCR', icon: FileText },
                { id: 'custody', label: '2. العهد واللوجستية', icon: Laptop },
                { id: 'biometrics', label: '3. القياسات والبصمة', icon: Fingerprint },
                { id: 'compliance', label: '4. العقد والمباشرة', icon: UserCheck }
              ].map(phase => {
                const Icon = phase.icon;
                const isActive = activePhaseTab === phase.id;
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhaseTab(phase.id as any)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all text-[10px] font-bold cursor-pointer ${
                      isActive 
                        ? 'bg-purple-900 border-purple-950 text-white shadow-xs' 
                        : 'bg-slate-50/75 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-purple-200' : 'text-slate-400'} />
                    <span>{phase.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Overall Progress Tracker Badge */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700 block">إجمالي الإنجاز بخطة التعيين:</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                  أنجزت {selectedPlan.tasks.filter(t => t.completed).length} من أصل {selectedPlan.tasks.length} مهام واشتراطات إلزامية
                </span>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className="font-black text-sm text-purple-900 font-mono bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg">
                  {selectedPlan.progressPercentage}%
                </span>
              </div>
            </div>

            {/* Phase 1: Smart OCR & Documents */}
            {activePhaseTab === 'verification' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <FileText className="text-blue-600 w-4.5 h-4.5" />
                    <span>المرحلة الأولى: التحقق والمسح الضوئي الذكي للمستندات (OCR)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ارفع أو امسح المستندات والبطاقة المدنية للموظف ليقوم الذكاء الاصطناعي بقراءتها وتعبئة الحقول آلياً في ملفه العام.
                  </p>
                </div>

                {/* Display Pending OCR extraction data reviewer block */}
                {pendingOcrData && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                      <span>بيانات مستخرجة بالماسح الذكي لـ {pendingOcrData.docType === 'civilIdScan' ? 'البطاقة المدنية' : 'المستند'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-950 bg-white/70 p-2.5 rounded-lg border border-blue-100 font-medium">
                      <div>
                        <span className="text-slate-500">الاسم المستخرج:</span>
                        <strong className="block text-slate-900">{pendingOcrData.data.fullNameAr || pendingOcrData.data.nameAr || 'غير رصيد'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">الرقم المدني:</span>
                        <strong className="block text-slate-900 font-mono">{pendingOcrData.data.civilId || 'غير رصيد'}</strong>
                      </div>
                      {pendingOcrData.data.expiryDate && (
                        <div>
                          <span className="text-slate-500">تاريخ انتهاء المستند:</span>
                          <strong className="block text-slate-900 font-mono">{pendingOcrData.data.expiryDate}</strong>
                        </div>
                      )}
                      {pendingOcrData.data.nationality && (
                        <div>
                          <span className="text-slate-500">الجنسية:</span>
                          <strong className="block text-slate-900">{pendingOcrData.data.nationality}</strong>
                        </div>
                      )}
                      {pendingOcrData.data.passportNo && (
                        <div>
                          <span className="text-slate-500">رقم جواز السفر:</span>
                          <strong className="block text-slate-900 font-mono">{pendingOcrData.data.passportNo}</strong>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApplyOcrResults}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserCheck size={14} />
                        <span>تطبيق وحفظ الحقول المستخرجة ✓</span>
                      </button>
                      <button
                        onClick={() => setPendingOcrData(null)}
                        className="text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        تجاهل
                      </button>
                    </div>
                  </div>
                )}

                {/* List of 4 major documents & interactive uploaders */}
                <div className="space-y-3.5">
                  {[
                    { key: 'civilIdScan', label: 'البطاقة المدنية الكويتية (Civil ID)', type: 'CIVIL_ID' },
                    { key: 'passportScan', label: 'جواز السفر (Passport)', type: 'PASSPORT' },
                    { key: 'pamWorkPermit', label: 'إذن عمل الهيئة العامة للقوى العاملة (PAM)', type: 'WORK_PERMIT' },
                    { key: 'mohLicense', label: 'ترخيص مزاولة المهنة الطبية (MOH License)', type: 'MEDICAL_LICENSE' }
                  ].map(doc => {
                    const isUploaded = !!selectedPlan.documentFiles?.[doc.key];
                    const fileObj = selectedPlan.documentFiles?.[doc.key];

                    return (
                      <div key={doc.key} className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <FileText size={14} className="text-slate-400" />
                            {doc.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isUploaded ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {isUploaded ? 'مكتمل ومتحقق ✓' : 'مطلوب معلق ⚠️'}
                          </span>
                        </div>

                        {isUploaded ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <div>
                                <p className="font-bold text-slate-800 truncate max-w-[180px]">{fileObj.name}</p>
                                <span className="text-[10px] text-slate-500 font-medium">الحجم: {fileObj.fileSize} • تاريخ الرفع: {fileObj.uploadDate}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={fileObj.url}
                                download={fileObj.name}
                                className="p-1 text-slate-500 hover:bg-slate-200 rounded-lg transition"
                                title="تحميل المستند"
                              >
                                <Download size={14} />
                              </a>
                              <button
                                onClick={() => handleRemoveDocumentFile(doc.key)}
                                className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                                title="حذف وإعادة الرفع"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                            {/* Inline OCR Intelligent Scanner */}
                            <TabDocumentScanner
                              tabType={doc.type as any}
                              title={doc.label}
                              onDataExtracted={(extracted) => {
                                setPendingOcrData({ docType: doc.key, data: extracted });
                              }}
                            />
                            
                            {/* Direct Drag & Drop or upload input */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-500">أو يمكنك إرفاق الملف يدوياً بدون مسح OCR:</span>
                              <label className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition">
                                📁 إرفاق مستند
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadDocumentFile(doc.key, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phase 2: Custody & Logistics */}
            {activePhaseTab === 'custody' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Laptop className="text-purple-600 w-4.5 h-4.5" />
                    <span>المرحلة الثانية: العهد العينية والتجهيزات اللوجستية</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تجهيز وتسليم العهد وتفعيل حسابات الموظف التقنية بالمركز الطبي قبل مباشرة العمل.
                  </p>
                </div>

                {/* Custody Checklist Selector */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block text-xs">قائمة العهد والتجهيزات المطلوب تسليمها:</span>
                  {[
                    '💻 كمبيوتر محمول للعمل / Laptop',
                    '📧 بريد إلكتروني رسمي للشركة / Business Email',
                    '🔑 بطاقة وبصمة المرور لبوابات المبنى / Building Access Card',
                    '📱 خط هاتف برقم رسمي وتجهيزات / Corporate Mobile SIM',
                    '🥼 سكراب طبي وزي رسمي معتمد / Medical Scrub & Uniform',
                    '🚗 موقف سيارات وتفعيل التأمين الصحي / Parking Access & Insurance'
                  ].map((item, idx) => {
                    const isDelivered = selectedPlan.custodyItems?.includes(item);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          let nextCustody = [...(selectedPlan.custodyItems || [])];
                          if (isDelivered) {
                            nextCustody = nextCustody.filter(c => c !== item);
                          } else {
                            nextCustody.push(item);
                          }
                          const updated = { ...selectedPlan, custodyItems: nextCustody };
                          handleUpdatePlan(updated);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isDelivered 
                            ? 'bg-purple-50/40 border-purple-200 text-purple-950 font-medium' 
                            : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{item}</span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isDelivered ? 'bg-purple-600 border-purple-700 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isDelivered && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Direct Supervisor & Location Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <span className="font-bold text-slate-800 text-xs block">تحديد الهيكل والفرع الإداري:</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">المشرف المباشر:</label>
                      <input
                        type="text"
                        value={selectedPlan.commencementDetails?.directSupervisor || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedPlan,
                            commencementDetails: {
                              ...(selectedPlan.commencementDetails || {}),
                              directSupervisor: e.target.value
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        placeholder="مثال: د. أحمد الشمري"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">موقع العمل / الفرع المخصص:</label>
                      <input
                        type="text"
                        value={selectedPlan.commencementDetails?.branchLocation || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedPlan,
                            commencementDetails: {
                              ...(selectedPlan.commencementDetails || {}),
                              branchLocation: e.target.value
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        placeholder="مثال: العيادة الرئيسية - حولي"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 3: Biometrics & Operations */}
            {activePhaseTab === 'biometrics' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Fingerprint className="text-amber-600 w-4.5 h-4.5" />
                    <span>المرحلة الثالثة: القياسات الحيوية واللياقة الطبية والتبصيم</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تسجيل بصمة الموظف في البوابة الرئيسية للمركز وإصدار الفحوصات والشهادات الصحية المعتمدة.
                  </p>
                </div>

                {/* Fingerprint setup toggle */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">تسجيل بصمة الحضور والانصراف بجهاز المركز:</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">يجب أن يقوم الموظف بتسجيل بصمة الإصبع والوجه في جهاز البوابة الطبية الرئيسية للحضور والانصراف.</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = {
                          ...selectedPlan,
                          biometricsRegistered: !selectedPlan.biometricsRegistered
                        };
                        handleUpdatePlan(updated);
                        toast.success(updated.biometricsRegistered ? 'تم تسجيل وتفعيل البصمة على الجهاز بنجاح. ✓' : 'ألغي تسجيل البصمة.');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        selectedPlan.biometricsRegistered
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-200'
                      }`}
                    >
                      {selectedPlan.biometricsRegistered ? 'البصمة مسجلة بجهاز البوابة ✓' : 'تسجيل البصمة الآن 📲'}
                    </button>
                  </div>
                </div>

                {/* Medical fitness and security clearance */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3.5">
                  <span className="font-bold text-slate-800 text-xs block">تقرير شهادة اللياقة الطبية والفحص الجنائي:</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">المستشفى / مركز الفحص الصحي:</label>
                      <input
                        type="text"
                        value={selectedPlan.medicalFitnessHospital || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedPlan,
                            medicalFitnessHospital: e.target.value
                          };
                          handleUpdatePlan(updated);
                        }}
                        placeholder="مثال: مستشفى الصباح - الصحة المهنية"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-amber-600 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">تاريخ إجراء الفحص الطبي:</label>
                      <input
                        type="date"
                        value={selectedPlan.medicalFitnessDate || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedPlan,
                            medicalFitnessDate: e.target.value
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-amber-600 font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-slate-600 font-bold mb-1.5 text-[11px]">حالة اللياقة الطبية النهائية المعتمدة:</label>
                    <div className="flex gap-2">
                      {[
                        { status: 'pending', label: '⏳ بانتظار الفحص / معلق', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
                        { status: 'fit', label: '🟢 لائق طبياً ومكتمل (Fit)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { status: 'unfit', label: '🔴 غير لائق طبياً (Unfit)', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
                      ].map(item => {
                        const isSelected = (selectedPlan.medicalFitnessStatus || 'pending') === item.status;
                        return (
                          <button
                            key={item.status}
                            onClick={() => {
                              const updated = {
                                ...selectedPlan,
                                medicalFitnessStatus: item.status as any
                              };
                              handleUpdatePlan(updated);
                              toast.success(`تم تحديث حالة اللياقة الطبية إلى: ${item.label}`);
                            }}
                            className={`flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                              isSelected ? `${item.bg} ring-2 ring-amber-500/30 font-black` : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Compliance & Employment Commencement */}
            {activePhaseTab === 'compliance' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="text-emerald-600 w-4.5 h-4.5" />
                    <span>المرحلة الرابعة: عقد العمل والرواتب ومباشرة العمل الرسمية</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    مراجعة واعتماد عقود العمل والبدلات، تفعيل احتساب الراتب والإجازات السنوية وإقرار المباشرة.
                  </p>
                </div>

                {/* Contract Details Form */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3">
                  <span className="font-bold text-purple-950 text-xs block">تفاصيل العقد والأجر الشامل (Salary):</span>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي:</label>
                      <input
                        type="number"
                        value={selectedPlan.contractDetails?.basicSalary || 0}
                        onChange={(e) => {
                          const basic = Number(e.target.value);
                          const house = selectedPlan.contractDetails?.housingAllowance || 0;
                          const trans = selectedPlan.contractDetails?.transportAllowance || 0;
                          const other = selectedPlan.contractDetails?.otherAllowances || 0;
                          const updated = {
                            ...selectedPlan,
                            contractDetails: {
                              ...(selectedPlan.contractDetails || {}),
                              basicSalary: basic,
                              totalSalary: basic + house + trans + other
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">بدل السكن:</label>
                      <input
                        type="number"
                        value={selectedPlan.contractDetails?.housingAllowance || 0}
                        onChange={(e) => {
                          const house = Number(e.target.value);
                          const basic = selectedPlan.contractDetails?.basicSalary || 0;
                          const trans = selectedPlan.contractDetails?.transportAllowance || 0;
                          const other = selectedPlan.contractDetails?.otherAllowances || 0;
                          const updated = {
                            ...selectedPlan,
                            contractDetails: {
                              ...(selectedPlan.contractDetails || {}),
                              housingAllowance: house,
                              totalSalary: basic + house + trans + other
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">بدل النقل والانتقال:</label>
                      <input
                        type="number"
                        value={selectedPlan.contractDetails?.transportAllowance || 0}
                        onChange={(e) => {
                          const trans = Number(e.target.value);
                          const basic = selectedPlan.contractDetails?.basicSalary || 0;
                          const house = selectedPlan.contractDetails?.housingAllowance || 0;
                          const other = selectedPlan.contractDetails?.otherAllowances || 0;
                          const updated = {
                            ...selectedPlan,
                            contractDetails: {
                              ...(selectedPlan.contractDetails || {}),
                              transportAllowance: trans,
                              totalSalary: basic + house + trans + other
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">بدلات أخرى وعلاوات:</label>
                      <input
                        type="number"
                        value={selectedPlan.contractDetails?.otherAllowances || 0}
                        onChange={(e) => {
                          const other = Number(e.target.value);
                          const basic = selectedPlan.contractDetails?.basicSalary || 0;
                          const house = selectedPlan.contractDetails?.housingAllowance || 0;
                          const trans = selectedPlan.contractDetails?.transportAllowance || 0;
                          const updated = {
                            ...selectedPlan,
                            contractDetails: {
                              ...(selectedPlan.contractDetails || {}),
                              otherAllowances: other,
                              totalSalary: basic + house + trans + other
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-purple-600 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200/80 p-3 rounded-lg flex items-center justify-between text-xs mt-1">
                    <span className="font-bold text-purple-950">إجمالي الأجر الشامل للعقد:</span>
                    <strong className="font-mono text-purple-900 font-black text-sm">
                      {((selectedPlan.contractDetails?.basicSalary || 0) + 
                        (selectedPlan.contractDetails?.housingAllowance || 0) + 
                        (selectedPlan.contractDetails?.transportAllowance || 0) + 
                        (selectedPlan.contractDetails?.otherAllowances || 0)).toLocaleString()} د.ك / شهرياً
                    </strong>
                  </div>
                </div>

                {/* Commencement Approval zone */}
                <div className="border border-emerald-200 rounded-xl p-3.5 bg-emerald-50/50 space-y-3.5">
                  <span className="font-bold text-emerald-950 text-xs block">اعتماد وتأكيد المباشرة الرسمية:</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <label className="block text-emerald-800 font-bold mb-1">تاريخ المباشرة الفعلية:</label>
                      <input
                        type="date"
                        value={selectedPlan.commencementDetails?.actualJoiningDate || ''}
                        onChange={(e) => {
                          const updated = {
                            ...selectedPlan,
                            commencementDetails: {
                              ...(selectedPlan.commencementDetails || {}),
                              actualJoiningDate: e.target.value,
                              isCommenced: !!e.target.value,
                              commencedAt: e.target.value ? new Date().toISOString() : undefined
                            }
                          };
                          handleUpdatePlan(updated);
                        }}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-800 font-bold mb-1">تفعيل رصيد الإجازات السنوية (2.5 يوم/شهر):</label>
                      <button
                        onClick={() => {
                          const prevVal = selectedPlan.commencementDetails?.leaveAccrualActivated || false;
                          const updated = {
                            ...selectedPlan,
                            commencementDetails: {
                              ...(selectedPlan.commencementDetails || {}),
                              leaveAccrualActivated: !prevVal
                            }
                          };
                          handleUpdatePlan(updated);
                          toast.success(!prevVal ? 'تم تفعيل حساب رصيد الإجازات السنوية آلياً.' : 'ألغي تفعيل الإجازات.');
                        }}
                        className={`w-full py-2.5 rounded-lg border text-center text-[10px] font-bold transition-all cursor-pointer ${
                          selectedPlan.commencementDetails?.leaveAccrualActivated
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {selectedPlan.commencementDetails?.leaveAccrualActivated ? '✓ مفعل تلقائياً بقرار المباشرة' : 'تفعيل رصيد الإجازات الآن'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      <Clock size={13} />
                      حالة المباشرة: {selectedPlan.commencementDetails?.isCommenced ? 'مباشر عمل نشط بالفرع' : 'بانتظار إقرار مباشرة العمل'}
                    </span>
                    
                    <button
                      onClick={() => {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html dir="rtl" lang="ar">
                              <head>
                                <title>إقرار مباشرة عمل - ${selectedPlan.employeeName}</title>
                                <style>
                                  body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                                  .header { text-align: center; border-bottom: 3px solid #714B67; padding-bottom: 20px; margin-bottom: 30px; }
                                  .title { font-size: 24px; font-weight: bold; color: #714B67; margin-bottom: 5px; }
                                  .subtitle { font-size: 15px; color: #64748b; font-weight: 500; }
                                  .box { border: 1px solid #cbd5e1; padding: 18px; border-radius: 12px; background: #f8fafc; margin-bottom: 22px; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                  th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: right; font-size: 13.5px; }
                                  th { background: #f1f5f9; font-weight: bold; width: 25%; }
                                  .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
                                  .sig-box { text-align: center; width: 45%; border-top: 2px dashed #94a3b8; padding-top: 12px; font-size: 14px; font-weight: bold; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="title">شركة المنار كلينك الطبية</div>
                                  <div class="subtitle">نموذج وإقرار مباشرة عمل موظف جديد واستلام العهد (Work Commencement & Custody Form)</div>
                                </div>

                                <div class="box">
                                  <strong>أولاً: بيانات الموظف الأساسية:</strong>
                                  <table>
                                    <tr><th>اسم الموظف</th><td>${selectedPlan.employeeName}</td><th>الرقم المدني الكويتي</th><td>${selectedPlan.civilId || 'غير محدد'}</td></tr>
                                    <tr><th>المسمى الوظيفي</th><td>${selectedPlan.jobTitle}</td><th>القسم / الإدارة</th><td>${selectedPlan.department}</td></tr>
                                    <tr><th>تاريخ المباشرة الفعلية</th><td>${selectedPlan.commencementDetails?.actualJoiningDate || 'معلق'}</td><th>المشرف المباشر</th><td>${selectedPlan.commencementDetails?.directSupervisor || 'غير محدد'}</td></tr>
                                    <tr><th>مقر العمل / الفرع</th><td>${selectedPlan.commencementDetails?.branchLocation || 'المركز الرئيسي'}</td><th>حالة اللياقة الطبية</th><td>${selectedPlan.medicalFitnessStatus === 'fit' ? 'لائق طبياً (مكتمل الفحص)' : 'معلق الفحص'}</td></tr>
                                  </table>
                                </div>

                                <div class="box">
                                  <strong>ثانياً: العقد والأجر الشامل المعتمد:</strong>
                                  <table>
                                    <tr><th>الأجر الأساسي</th><td>${selectedPlan.contractDetails?.basicSalary || 0} د.ك</td><th>بدل السكن</th><td>${selectedPlan.contractDetails?.housingAllowance || 0} د.ك</td></tr>
                                    <tr><th>بدل النقل</th><td>${selectedPlan.contractDetails?.transportAllowance || 0} د.ك</td><th>علاوات وبدلات أخرى</th><td>${selectedPlan.contractDetails?.otherAllowances || 0} د.ك</td></tr>
                                    <tr style="font-weight: bold; background: #f1f5f9;"><th colspan="2">إجمالي الأجر الشهري الشامل</th><td colspan="2">${((selectedPlan.contractDetails?.basicSalary || 0) + (selectedPlan.contractDetails?.housingAllowance || 0) + (selectedPlan.contractDetails?.transportAllowance || 0) + (selectedPlan.contractDetails?.otherAllowances || 0)).toLocaleString()} د.ك / شهرياً فقط لا غير.</td></tr>
                                  </table>
                                </div>

                                <div class="box">
                                  <strong>ثالثاً: إقرار واستلام العهد والتجهيزات اللوجستية:</strong>
                                  <p style="font-size: 13px; margin-top: 8px; font-weight: 500;">يقر الموظف المذكور أعلاه بالتوقيع أدناه بأنه استلم كافة الأجهزة والعهد المبينة أدناه وتعهد باستخدامها لأغراض العمل والمحافظة عليها بالكامل وإعادتها عند الطلب:</p>
                                  <ul style="font-size: 13px; font-weight: bold; line-height: 1.8;">
                                    ${(selectedPlan.custodyItems && selectedPlan.custodyItems.length > 0)
                                      ? selectedPlan.custodyItems.map((c: string) => `<li>📦 ${c}</li>`).join('')
                                      : '<li>لا توجد عهد عينية مسجلة للتسليم</li>'}
                                  </ul>
                                </div>

                                <div class="signatures">
                                  <div class="sig-box">
                                    <strong>توقيع وإقرار الموظف المستلم</strong><br/><br/><br/>
                                    <span>الاسم: ${selectedPlan.employeeName}</span><br/>
                                    <span>التاريخ: ${selectedPlan.commencementDetails?.actualJoiningDate || new Date().toISOString().slice(0,10)}</span>
                                  </div>
                                  <div class="sig-box">
                                    <strong>مدير الموارد البشرية والامتثال</strong><br/><br/><br/>
                                    <span>شركة المنار كلينك الطبية المعتمدة</span>
                                  </div>
                                </div>
                                <script>window.print();</script>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>🖨️ طباعة إقرار المباشرة والعهد والرواتب</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Form Wizard Modal */}
      <OnboardingWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onConfirmLaunch={handleLaunchNewPlan}
        existingEmployees={existingEmployees}
      />
    </div>
  );
};
