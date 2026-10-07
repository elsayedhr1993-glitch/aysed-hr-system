import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Check, 
  X, 
  ShieldAlert, 
  BadgePercent, 
  Landmark, 
  Calculator,
  Calendar,
  DollarSign,
  Briefcase,
  Building2,
  Printer,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Save,
  Trash2,
  Sliders,
  Sparkles,
  Zap,
  Timer,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import { useOdooHierarchy, EmployeeContract } from '../context/OdooHierarchyContext';
import { useCompany } from '../context/CompanyContext';
import { TenantDatabaseService } from '../services/tenantDataService';
import { UploadedSignedContractModal } from './contracts/UploadedSignedContractModal';
import { resolveSignedContractFile } from '../utils/resolveSignedContractFile';
import { attachSignedContractFileToEmployee } from '../utils/signedContractUpload';
import { OdooChatter, ChatterMessage } from './OdooChatter';
import { AiInlineAssist } from './copilot/AiInlineAssist';
import { toast } from 'react-hot-toast';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';
import { triggerContractRunningLeaveAllocation } from '../utils/contractLeaveTrigger';
import { normalizeContractStatus } from '../utils/contractStatus';
import { UiStudioScreenTitle } from './studio/UiStudioScreenTitle';
import { UI_KEYS } from '../utils/uiStudioKeys';
import {
  canAutoMaterializeContractForEmployee,
  canonicalContractDocId,
  contractQueryCompanyIds,
  dedupeTenantContracts,
  employeeHasContractRecord,
} from '../utils/contractTenantRules';
import { FileSpreadsheet } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import OdooPamContractModal from './OdooPamContractModal';
import {
  formatContractDisplayRef,
  nextContractDisplaySequence,
} from '../utils/contractDisplayRef';

export interface DetailedContract extends EmployeeContract {
  contractRef: string;
  /** User-facing reference (CNT-2026-001); Firestore doc id stays in contractRef */
  displayRef?: string;
  medicalAllowance: number;
  startDate: string;
  endDate?: string;
  contractType: 'fixed' | 'unlimited';
  probationDays: number;
  noticePeriodMonths: number;
  workingHoursWeekly: number;
  notes?: string;
}

export type OdooContractsAppProps = {
  focusEmployeeId?: string | null;
  onFocusConsumed?: () => void;
};

function employeePayloadForPamContract(c: DetailedContract) {
  const total =
    Number(c.basicSalary || 0) +
    Number(c.housingAllowance || 0) +
    Number(c.transportAllowance || 0) +
    Number(c.medicalAllowance || 0) +
    Number((c as any).otherAllowance || 0);
  return {
    id: c.id,
    name: c.name,
    fullNameAr: c.name,
    civilId: c.civilId,
    nationality: (c as any).nationality || 'غير كويتي',
    jobTitle: c.jobTitle,
    department: c.department,
    salary: total > 0 ? total : c.basicSalary,
    basicSalary: c.basicSalary,
    hireDate: c.startDate,
    contractStartDate: c.startDate,
    contractEndDate: c.endDate,
    residencyType: (c as any).residencyType || 'مادة 18 - قطاع أهلي',
  };
}

export const OdooContractsApp: React.FC<OdooContractsAppProps> = ({
  focusEmployeeId,
  onFocusConsumed,
}) => {
  const { employees, updateContractSalary, updateContractDetails } = useOdooHierarchy();
  const { activeCompany, activeCompanyId } = useCompany();
  const currentCompanyId = activeCompanyId || activeCompany?.id || 'comp-super-admin';

  const [dbEmployees, setDbEmployees] = useState<EmployeeContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'draft' | 'expired'>('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState<'all' | 'full_time' | 'part_time'>('all');
  const [employeeRecordsById, setEmployeeRecordsById] = useState<Record<string, Record<string, unknown>>>({});
  const [signedContractPreview, setSignedContractPreview] = useState<{
    employeeId: string;
    employeeName: string;
    contractRef?: string;
  } | null>(null);
  const [isUploadingSignedContract, setIsUploadingSignedContract] = useState(false);
  const [pamPrintEmployee, setPamPrintEmployee] = useState<Record<string, unknown> | null>(null);
  const [contractsLoaded, setContractsLoaded] = useState(false);
  const [firestoreContractDocCount, setFirestoreContractDocCount] = useState(0);
  const [openRowActionsKey, setOpenRowActionsKey] = useState<string | null>(null);
  const materializingContractIds = useRef(new Set<string>());
  const contractsSnapshotRef = useRef<DetailedContract[]>([]);
  
  // مزامنة الموظفين والعقود حياً من قاعدة البيانات للشركة النشطة
  useEffect(() => {
    let isMounted = true;
    async function syncData() {
      if (!currentCompanyId) return;
      try {
        const fetchedEmps = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
        if (isMounted && fetchedEmps) {
          const mapped: EmployeeContract[] = fetchedEmps.map(emp => ({
            id: emp.id,
            name: emp.fullNameAr || (emp as any).nameAr || (emp as any).name || 'موظف',
            civilId: emp.civilId || '',
            jobTitle: emp.jobTitle || 'موظف',
            department: emp.department || (emp as any).dept || 'العموم',
            basicSalary: (emp as any).basicSalary || (emp as any).contractSalary || 1000,
            housingAllowance: (emp as any).housingAllowance || 0,
            transportAllowance: (emp as any).transportAllowance || 0,
            medicalAllowance: (emp as any).medicalAllowance || 0,
            isKuwaiti: Boolean(emp.isKuwaiti),
            bankName: emp.bankName || 'بيت التمويل الكويتي (KFH)',
            iban: emp.iban || '',
            contractStatus: normalizeContractStatus((emp as any).contractStatus || 'running'),
            contractStartDate: (emp as any).contractStartDate || emp.joinDate,
            contractEndDate: (emp as any).contractEndDate,
            noticePeriodDays: Number((emp as any).noticePeriodDays || 90),
            dailyWorkHours: Number((emp as any).dailyWorkHours || 8),
            workingHoursPerWeek: Number((emp as any).workingHoursPerWeek || 48),
            workingSchedule: (emp as any).workingSchedule || 'STANDARD'
          }));
          setDbEmployees(mapped);
          const byId: Record<string, Record<string, unknown>> = {};
          fetchedEmps.forEach((emp) => {
            byId[emp.id] = emp as Record<string, unknown>;
          });
          setEmployeeRecordsById(byId);
        }

      } catch (e) {
        console.error('Error syncing contracts/employees in OdooContractsApp:', e);
      }
    }
    syncData();
    return () => { isMounted = false; };
  }, [currentCompanyId]);

  useEffect(() => {
    setContractsLoaded(false);
    const companyIds = contractQueryCompanyIds(currentCompanyId);
    const contractsQuery =
      companyIds.length === 1
        ? query(collection(db, 'contracts'), where('companyId', '==', companyIds[0]))
        : query(collection(db, 'contracts'), where('companyId', 'in', companyIds));
    return onSnapshot(contractsQuery, snapshot => {
      const mappedContracts: DetailedContract[] = snapshot.docs.map(item => {
        const c = item.data() as any;
        return {
          id: c.employeeId || item.id,
          employeeId: c.employeeId,
          contractRef: item.id,
          displayRef: c.displayRef || c.contractNumber || undefined,
          name: c.employeeName || c.name || 'موظف',
          civilId: c.civilId || '',
          jobTitle: c.jobTitle || 'موظف',
          department: c.department || 'العموم',
          basicSalary: c.basicSalary || 0,
          housingAllowance: c.housingAllowance || 0,
          transportAllowance: c.transportAllowance || 0,
          medicalAllowance: c.otherAllowance || c.medicalAllowance || 0,
          isKuwaiti: Boolean(c.isKuwaiti),
          bankName: c.bankName || 'بيت التمويل الكويتي',
          iban: c.iban || '',
          contractStatus: normalizeContractStatus(c.status || c.contractStatus || 'running'),
          startDate: c.startDate || new Date().toISOString().split('T')[0],
          endDate: c.endDate || '',
          contractType: c.contractType || 'fixed',
          probationDays: c.probationDays || 100,
          noticePeriodMonths: c.noticePeriodMonths || 3,
          workingHoursWeekly: c.workingHoursPerWeek || 48,
          employmentType: c.workingSchedule || c.employmentType || 'full_time',
          hasCustomSchedule: c.hasCustomSchedule || false,
          dailyHours: c.customDailyHours || c.dailyWorkHours || 8,
          shiftStartTime: c.shiftStartTime || '08:00',
          shiftEndTime: c.shiftEndTime || '16:00',
          gracePeriodMinutes: c.gracePeriodMinutes || 15,
          hourlyRate: c.hourlyRate || 0
        };
      });
      contractsSnapshotRef.current = mappedContracts;
      setFirestoreContractDocCount(mappedContracts.length);
      setContracts(dedupeTenantContracts(mappedContracts, currentCompanyId) as DetailedContract[]);
      setContractsLoaded(true);
    }, error => console.error('Failed to load contracts from Firestore:', error));
  }, [currentCompanyId]);

  // القائمة الشاملة المندمجة لموظفي الشركة
  const availableEmployees: EmployeeContract[] = React.useMemo(() => {
    const map = new Map<string, EmployeeContract>();
    dbEmployees.forEach(e => map.set(e.id, e));
    employees.forEach(e => {
      if (!map.has(e.id)) map.set(e.id, e);
    });
    return Array.from(map.values());
  }, [dbEmployees, employees]);

  const [contracts, setContracts] = useState<DetailedContract[]>([]);

  const openSignedContractPreview = (contract: DetailedContract) => {
    setSignedContractPreview({
      employeeId: contract.id,
      employeeName: contract.name,
      contractRef: contract.contractRef,
    });
  };

  const previewEmployeeRecord = signedContractPreview
    ? employeeRecordsById[signedContractPreview.employeeId] || {
        id: signedContractPreview.employeeId,
        fullNameAr: signedContractPreview.employeeName,
      }
    : null;
  const previewSignedFile = resolveSignedContractFile(previewEmployeeRecord);

  const handleUploadSignedContractFromContracts = async (file: File) => {
    if (!signedContractPreview) return;
    const record =
      employeeRecordsById[signedContractPreview.employeeId] || {
        id: signedContractPreview.employeeId,
        fullNameAr: signedContractPreview.employeeName,
      };
    setIsUploadingSignedContract(true);
    try {
      const next = await attachSignedContractFileToEmployee(record, file, currentCompanyId);
      setEmployeeRecordsById((prev) => ({
        ...prev,
        [signedContractPreview.employeeId]: next,
      }));
      toast.success('تم رفع نسخة عقد العمل الموقع بنجاح');
    } catch (err: any) {
      toast.error(err?.message || 'تعذر رفع ملف العقد');
    } finally {
      setIsUploadingSignedContract(false);
    }
  };

  useEffect(() => {
    if (!contractsLoaded || !currentCompanyId || dbEmployees.length === 0) return;

    const materializeMissingContracts = async () => {
      for (const employee of dbEmployees) {
        const hasContract = employeeHasContractRecord(
          employee.id,
          currentCompanyId,
          contractsSnapshotRef.current
        );
        if (hasContract || materializingContractIds.current.has(employee.id)) continue;

        const employeeRecord = employeeRecordsById[employee.id];
        if (!canAutoMaterializeContractForEmployee(employeeRecord, currentCompanyId)) continue;

        const sourceEmployee = employee as EmployeeContract & Record<string, any>;
        const startDate = sourceEmployee.contractStartDate || sourceEmployee.joinDate || new Date().toISOString().split('T')[0];
        const endDate = sourceEmployee.contractEndDate || undefined;
        const contractId = canonicalContractDocId(currentCompanyId, employee.id);
        materializingContractIds.current.add(employee.id);

        const contract = {
          id: contractId,
          employeeId: employee.id,
          employeeName: employee.name,
          companyId: currentCompanyId,
          basicSalary: employee.basicSalary || 0,
          housingAllowance: employee.housingAllowance || 0,
          transportAllowance: employee.transportAllowance || 0,
          otherAllowance: employee.medicalAllowance || 0,
          contractType: endDate ? 'FIXED_TERM' : 'INDEFINITE',
          startDate,
          endDate,
          noticePeriodDays: Number(sourceEmployee.noticePeriodDays || 90),
          status: normalizeContractStatus(sourceEmployee.contractStatus || 'running'),
          dailyWorkHours: Number(sourceEmployee.dailyHours || sourceEmployee.dailyWorkHours || 8),
          workingHoursPerWeek: Number(sourceEmployee.workingHoursPerWeek || 48),
          workingSchedule: sourceEmployee.workingSchedule || 'STANDARD',
          createdAt: new Date().toISOString()
        };

        try {
          const saved = await TenantDatabaseService.saveContract(contract as any, currentCompanyId);
          if (saved) {
            updateContractDetails({
              id: employee.id,
              contractStatus: normalizeContractStatus(contract.status),
              contractStartDate: startDate,
              contractEndDate: endDate,
              contractRef: contractId
            } as any);
          }
        } catch (error) {
          console.error('Failed to materialize employee contract:', error);
        } finally {
          materializingContractIds.current.delete(employee.id);
        }
      }
    };

    void materializeMissingContracts();
  }, [contractsLoaded, currentCompanyId, dbEmployees, contracts, employeeRecordsById, updateContractDetails]);

  const handleDeleteContract = async (contractId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا العقد نهائياً من النظام؟')) {
      await TenantDatabaseService.deleteContract(contractId, currentCompanyId);
      const updated = contracts.filter(c => c.contractRef !== contractId && c.id !== contractId);
      setContracts(updated);
      alert('تم حذف العقد بنجاح.');
    }
  };

  // Modal / Form Sheet state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<DetailedContract | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showChatter, setShowChatter] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState(false);

  // Filtered list
  const filteredContracts = contracts.filter(c => {
    if (!c) return false;
    const normalizedStatus = normalizeContractStatus(c.contractStatus);
    const term = (searchTerm || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    const id = String(c.id || '').toLowerCase();
    const jobTitle = (c.jobTitle || '').toLowerCase();
    const contractRef = (c.contractRef || '').toLowerCase();
    const displayRef = formatContractDisplayRef(c).toLowerCase();
    const civilId = String(c.civilId || '').toLowerCase();

    const matchesSearch = name.includes(term) || 
                          id.includes(term) || 
                          jobTitle.includes(term) ||
                          contractRef.includes(term) ||
                          displayRef.includes(term) ||
                          civilId.includes(term);
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    const matchesEmpType = filterEmploymentType === 'all' || (c.employmentType || 'full_time') === filterEmploymentType;
    return matchesSearch && matchesStatus && matchesEmpType;
  });

  // Calculate totals
  const totalMonthlyPayroll = contracts.reduce((sum, c) => {
    if (!c) return sum;
    if (c.employmentType === 'part_time') {
      const estimatedMonthlyHours = (c.dailyHours || 4) * 26;
      return sum + (estimatedMonthlyHours * (c.hourlyRate || 0)) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
    }
    return sum + (c.basicSalary || 0) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
  }, 0);

  const averageSalary = contracts.length > 0 ? (totalMonthlyPayroll / contracts.length) : 0;
  const runningCount = contracts.filter(c => c && normalizeContractStatus(c.contractStatus) === 'running').length;
  const draftCount = contracts.filter(c => c && normalizeContractStatus(c.contractStatus) === 'draft').length;
  const partTimeCount = contracts.filter(c => c && c.employmentType === 'part_time').length;

  // Open Create Form
  const handleOpenCreateContract = () => {
    const year = new Date().getFullYear();
    const nextSeq = nextContractDisplaySequence(contracts, year);
    const displayRef = `CNT-${year}-${String(nextSeq).padStart(3, '0')}`;
    const newRef = `CONTRACT/${year}/${String(nextSeq).padStart(3, '0')}`;
    const firstEmp = availableEmployees[0] || {
      id: '',
      name: '',
      civilId: '',
      jobTitle: '',
      department: '',
      basicSalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      isKuwaiti: false,
      bankName: '',
      iban: ''
    };

    const newContract: DetailedContract = {
      id: firstEmp.id,
      contractRef: newRef,
      displayRef,
      name: firstEmp.name,
      civilId: firstEmp.civilId,
      jobTitle: firstEmp.jobTitle,
      department: firstEmp.department,
      basicSalary: firstEmp.basicSalary || 800,
      housingAllowance: firstEmp.housingAllowance || 200,
      transportAllowance: firstEmp.transportAllowance || 100,
      medicalAllowance: 0,
      isKuwaiti: firstEmp.isKuwaiti,
      bankName: firstEmp.bankName,
      iban: firstEmp.iban,
      contractStatus: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      contractType: 'fixed',
      probationDays: 100,
      noticePeriodMonths: 3,
      workingHoursWeekly: 48,
      employmentType: 'full_time',
      hasCustomSchedule: false,
      dailyHours: 8,
      shiftStartTime: '08:00',
      shiftEndTime: '16:00',
      gracePeriodMinutes: 15,
      hourlyRate: 0,
      notes: 'عقد عمل جديد يخضع لأحكام قانون العمل الكويتي رقم 6 لسنة 2010'
    };

    setSelectedContract(newContract);
    setIsCreatingNew(true);
    setIsContractModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEditContract = (c: DetailedContract) => {
    setSelectedContract({ 
      ...c,
      employmentType: c.employmentType || 'full_time',
      dailyHours: c.dailyHours !== undefined ? c.dailyHours : 8,
      shiftStartTime: c.shiftStartTime || '08:00',
      shiftEndTime: c.shiftEndTime || '16:00',
      gracePeriodMinutes: c.gracePeriodMinutes !== undefined ? c.gracePeriodMinutes : 15,
      hourlyRate: c.hourlyRate || 0,
      hasCustomSchedule: c.hasCustomSchedule !== undefined ? c.hasCustomSchedule : (c.employmentType === 'part_time')
    });
    setIsCreatingNew(false);
    setIsContractModalOpen(true);
  };

  useEffect(() => {
    if (!focusEmployeeId || !contractsLoaded) return;
    const match = contracts.find(
      (c) =>
        String(c?.id || '') === focusEmployeeId ||
        String(c?.employeeId || '') === focusEmployeeId
    );
    if (match) {
      const label = match.name || match.contractRef || '';
      if (label) setSearchTerm(label);
      handleOpenEditContract(match as DetailedContract);
    } else {
      setSearchTerm(focusEmployeeId);
    }
    onFocusConsumed?.();
  }, [focusEmployeeId, contractsLoaded, contracts, onFocusConsumed]);

  // Employee Selection auto-sync
  const handleEmployeeSelectionChange = (empId: string) => {
    const emp = availableEmployees.find(e => e.id === empId);
    if (emp && selectedContract) {
      setSelectedContract({
        ...selectedContract,
        id: emp.id,
        name: emp.name,
        civilId: emp.civilId,
        jobTitle: emp.jobTitle,
        department: emp.department,
        basicSalary: emp.basicSalary,
        housingAllowance: emp.housingAllowance,
        transportAllowance: emp.transportAllowance,
        isKuwaiti: emp.isKuwaiti,
        bankName: emp.bankName,
        iban: emp.iban,
        employmentType: emp.employmentType || selectedContract.employmentType || 'full_time',
        hourlyRate: emp.hourlyRate !== undefined ? emp.hourlyRate : selectedContract.hourlyRate,
        dailyHours: emp.dailyHours || selectedContract.dailyHours || 8,
        shiftStartTime: emp.shiftStartTime || selectedContract.shiftStartTime || '08:00',
        shiftEndTime: emp.shiftEndTime || selectedContract.shiftEndTime || '16:00',
        gracePeriodMinutes: emp.gracePeriodMinutes !== undefined ? emp.gracePeriodMinutes : 15
      });
    }
  };

  // Save Contract
  const handleSaveContract = async () => {
    if (!selectedContract) return;

    if (!selectedContract.id) {
      toast.error('يرجى اختيار الموظف أولاً');
      return;
    }
    if (Number(selectedContract.basicSalary || 0) <= 0) {
      toast.error('يجب إدخال راتب أساسي أكبر من صفر');
      return;
    }
    if (selectedContract.endDate && selectedContract.endDate < selectedContract.startDate) {
      toast.error('تاريخ نهاية العقد لا يمكن أن يسبق تاريخ البداية');
      return;
    }
    if (selectedContract.contractType === 'fixed' && !selectedContract.endDate) {
      toast.error('العقد محدد المدة يحتاج إلى تاريخ نهاية');
      return;
    }
    const normalizedContractStatus = normalizeContractStatus(selectedContract.contractStatus);
    const hasActiveContract = contracts.some(contract =>
      contract.id === selectedContract.id &&
      contract.contractRef !== selectedContract.contractRef &&
      normalizeContractStatus(contract.contractStatus) === 'running'
    );
    if (hasActiveContract && normalizedContractStatus === 'running') {
      toast.error('يوجد عقد ساري آخر لهذا الموظف');
      return;
    }

    // Persist to Firestore
    try {
      const displayRef =
        selectedContract.displayRef ||
        formatContractDisplayRef(selectedContract);
      const saved = await TenantDatabaseService.saveContract({
        id: selectedContract.contractRef || `CONTRACT-${selectedContract.id}`,
        companyId: currentCompanyId,
        employeeId: selectedContract.id,
        displayRef,
        contractNumber: displayRef,
        basicSalary: selectedContract.basicSalary,
        housingAllowance: selectedContract.housingAllowance,
        transportAllowance: selectedContract.transportAllowance,
        otherAllowance: selectedContract.medicalAllowance,
        startDate: selectedContract.startDate,
        endDate: selectedContract.endDate,
        contractType: selectedContract.contractType,
        status: normalizedContractStatus,
        customDailyHours: selectedContract.dailyHours,
        workingHoursPerWeek: selectedContract.workingHoursWeekly,
        workingSchedule: selectedContract.employmentType
      } as any, currentCompanyId);
      if (!saved) {
        toast.error('تعذر حفظ العقد في Firestore');
        return;
      }
    } catch (e) {
      console.error('Error saving contract to Firestore:', e);
      toast.error('تعذر حفظ العقد في Firestore');
      return;
    }

    // الربط الآلي للإجازات (Running Trigger Hook): إنشاء وتثبيت رصيد إجازات سنوية 30 يوم لسنة 2026 فور تفعيل العقد الساري
    await triggerContractRunningLeaveAllocation({
      employeeId: selectedContract.id,
      employeeName: selectedContract.name,
      startDate: selectedContract.startDate || '2026-01-01',
        contractStatus: normalizedContractStatus,
      companyId: currentCompanyId
    });

    if (isCreatingNew) {
      setContracts([{ ...selectedContract, displayRef }, ...contracts]);
      toast.success(`تم إنشاء العقد (${displayRef}) للموظف ${selectedContract.name} واعتماد رصيد 30 يوماً لسنة 2026 تلقائياً`);
    } else {
      setContracts(contracts.map(c => c.contractRef === selectedContract.contractRef ? { ...selectedContract, displayRef } : c));
      toast.success(`تم تحديث بيانات العقد (${displayRef}) وتحديث رصيد الإجازات لسنة 2026`);
    }

    // Sync full contract properties with global hierarchy
    updateContractDetails({
      id: selectedContract.id,
      basicSalary: selectedContract.basicSalary,
      housingAllowance: selectedContract.housingAllowance,
      transportAllowance: selectedContract.transportAllowance,
      medicalAllowance: selectedContract.medicalAllowance,
      employmentType: selectedContract.employmentType,
      hasCustomSchedule: selectedContract.hasCustomSchedule,
      dailyHours: selectedContract.dailyHours,
      shiftStartTime: selectedContract.shiftStartTime,
      shiftEndTime: selectedContract.shiftEndTime,
      gracePeriodMinutes: selectedContract.gracePeriodMinutes,
      hourlyRate: selectedContract.hourlyRate,
        contractStatus: normalizedContractStatus
    });

    // مزامنة خصائص الراتب مع سجل الموظف في Firestore
    try {
      const selCnt = selectedContract as any;
      const empList = await TenantDatabaseService.getEmployeesByTenant(currentCompanyId);
      const targetEmp = empList.find((e: any) => e.id === selCnt.id || e.id === selCnt.employeeId);
      if (targetEmp) {
          const bSal = Number(selCnt.basicSalary || 0);
          const hAll = Number(selCnt.housingAllowance || 0);
          const tAll = Number(selCnt.transportAllowance || 0);
          const mAll = Number(selCnt.medicalAllowance || 0);
          const oAll = Number(selCnt.otherAllowances || selCnt.otherAllowance || 0);
          const totAllowances = hAll + tAll + mAll + oAll;
          const totSal = bSal + totAllowances;

          const updatedEmp = {
            ...targetEmp,
            basicSalary: bSal,
            contractSalary: bSal,
            housingAllowance: hAll,
            transportAllowance: tAll,
            medicalAllowance: mAll,
            otherAllowance: oAll,
            otherAllowances: oAll,
            allowances: totAllowances,
            totalSalary: totSal,
            salary: totSal,
            contractType: selCnt.contractType || (targetEmp as any).contractType,
            contractStatus: selCnt.contractStatus || targetEmp.contractStatus,
            contractStartDate: selCnt.startDate || (targetEmp as any).contractStartDate,
            contractEndDate: selCnt.endDate || (targetEmp as any).contractEndDate,
          };
          await TenantDatabaseService.saveEmployee(updatedEmp, currentCompanyId);
      }
    } catch (err) {
      console.error('Error syncing employee salary from contract:', err);
    }

    setIsContractModalOpen(false);
  };

  return (
    <div className="odoo-app-surface contracts-print-root space-y-6 text-right font-sans dir-rtl text-slate-800" dir="rtl">
      
      {/* 1. Header Banner & Action Toolbar */}
      <div className="contracts-print-header bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <UiStudioScreenTitle
              uiKey={UI_KEYS.appTitle('contracts')}
              defaults={{
                label: {
                  ar: 'عقود العمل وهيكل الرواتب والدوام (hr.contract)',
                  en: 'Employment contracts (hr.contract)',
                },
              }}
              className="text-xl font-black text-slate-900 flex items-center gap-2"
              subtitleUiKey={UI_KEYS.appSubtitle('contracts')}
              subtitleDefaults={{
                label: {
                  ar: 'إدارة العقود الفردية، الدوام الكامل والجزئي، والربط مع البصمة و WPS',
                  en: 'Contracts, shifts, attendance & WPS',
                },
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleOpenCreateContract}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>إنشاء عقد جديد</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const exportData = filteredContracts.map((c, idx) => ({
                'م': idx + 1,
                'رقم العقد': formatContractDisplayRef(c, idx),
                'اسم الموظف': c.name,
                'الرقم المدني': c.civilId,
                'المسمى الوظيفي': c.jobTitle,
                'القسم': c.department,
                'نوع الدوام': c.employmentType === 'part_time' ? 'دوام جزئي / بالساعة' : 'دوام كامل',
                'الراتب الأساسي (د.ك)': Number((c.basicSalary || 0).toFixed(3)),
                'بدل السكن (د.ك)': Number((c.housingAllowance || 0).toFixed(3)),
                'بدل الانتقال (د.ك)': Number((c.transportAllowance || 0).toFixed(3)),
                'الراتب الشامل (د.ك)': Number(((c.basicSalary || 0) + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0)).toFixed(3)),
                'البنك': c.bankName,
                'الآيبان': c.iban,
                'حالة العقد': normalizeContractStatus(c.contractStatus) === 'running' ? 'ساري' : normalizeContractStatus(c.contractStatus) === 'draft' ? 'مسودة' : 'منتهي',
                'تاريخ البداية': c.startDate,
                'تاريخ الانتهاء': c.endDate || 'غير محدد'
              }));
              exportToExcel(exportData, 'سجل_عقود_العمل_والرواتب', 'عقود الموظفين');
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="تصدير سجل العقود إلى Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => safePrintAction('كشف عقود العمل')}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={15} />
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* 2. Merged filters + payroll hint */}
      <div className="odoo-filter-toolbar no-print flex-col lg:flex-row gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full lg:flex-1">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#714B67] text-white border-[#714B67]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            الكل ({contracts.length})
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={() => setFilterStatus('running')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              filterStatus === 'running' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            عقود سارية ({runningCount})
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              filterStatus === 'draft' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            مسودات ({draftCount})
          </button>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500 mr-1">
            <span className="whitespace-nowrap">نوع الدوام</span>
            <select
              value={filterEmploymentType}
              onChange={(e) => setFilterEmploymentType(e.target.value as 'all' | 'full_time' | 'part_time')}
              className="py-1.5 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold min-w-[9rem] cursor-pointer"
            >
              <option value="all">الكل</option>
              <option value="full_time">دوام كامل</option>
              <option value="part_time">دوام جزئي / بالساعة</option>
            </select>
          </label>
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[#714B67] font-bold ms-auto">
            <Calculator className="w-3.5 h-3.5" />
            <span>موازنة تقديرية:</span>
            <span className="font-mono">{totalMonthlyPayroll.toFixed(3)} د.ك</span>
          </div>
          {firestoreContractDocCount > contracts.length && (
            <span className="text-[10px] text-amber-800 flex items-center gap-1 w-full lg:w-auto">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {firestoreContractDocCount} مستند؛ يُعرض {contracts.length} بعد الدمج
            </span>
          )}
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث برقم العقد، اسم الموظف، أو الرقم المدني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* 3. Streamlined Contracts Table */}
      <div className="contracts-print-table bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3">كود العقد</th>
                <th className="p-3">الموظف والمسمى الوظيفي</th>
                <th className="p-3 text-center">نوع الدوام والشيفت</th>
                <th className="p-3 text-left font-mono">التفاصيل المالية والبدلات</th>
                <th className="p-3 text-center">حالة العقد</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c, idx) => {
                const isPartTime = c.employmentType === 'part_time';
                const totalAllowances = (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.medicalAllowance || 0);
                const totalGross = isPartTime 
                  ? ((c.hourlyRate || 0) * (c.dailyHours || 4) * 26 + totalAllowances)
                  : ((c.basicSalary || 0) + totalAllowances);
                
                const rowKey = `${c.contractRef}-${idx}`;
                const displayCode = formatContractDisplayRef(c, idx);

                return (
                  <tr 
                    key={rowKey} 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenEditContract(c)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenEditContract(c);
                      }
                    }}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-purple-50/40 transition cursor-pointer`}
                  >
                    <td className="p-3 font-mono font-bold text-[#714B67]">
                      {displayCode}
                    </td>
                    
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {c.jobTitle} | {c.department} | المدني: {c.civilId}
                      </div>
                    </td>

                    {/* Employment Type & Shift Combined Cell */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 mb-1">
                        {isPartTime ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Stethoscope size={10} />
                            <span>دوام جزئي / بالساعة</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            <Briefcase size={10} />
                            <span>دوام كامل</span>
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 flex items-center justify-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span>{c.shiftStartTime || '08:00'} - {c.shiftEndTime || '16:00'} ({c.dailyHours || 8}س)</span>
                      </div>
                    </td>
                    
                    {/* Combined Financial Details */}
                    <td className="p-3 text-left font-mono">
                      <div className="font-bold text-sm text-slate-900">
                        {totalGross.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {isPartTime ? (
                          <span>أجر الساعة: {(c.hourlyRate || 0).toFixed(3)} د.ك</span>
                        ) : (
                          <span>الأساسي: {(c.basicSalary || 0).toFixed(3)} د.ك | بدلات: {totalAllowances.toFixed(3)} د.ك</span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      {normalizeContractStatus(c.contractStatus) === 'running' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>ساري</span>
                        </span>
                      )}
                      {normalizeContractStatus(c.contractStatus) === 'draft' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>مسودة</span>
                        </span>
                      )}
                      {normalizeContractStatus(c.contractStatus) === 'expired' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          <span>منتهي</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setOpenRowActionsKey(openRowActionsKey === rowKey ? null : rowKey)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                          title="إجراءات"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openRowActionsKey === rowKey && (
                          <div className="absolute left-0 top-full mt-1 z-20 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenRowActionsKey(null);
                                setPamPrintEmployee(employeePayloadForPamContract(c));
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#714B67] hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                            >
                              <FileCheck size={13} />
                              <span>نموذج PAM</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenRowActionsKey(null);
                                openSignedContractPreview(c);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Printer size={13} />
                              <span>طباعة / معاينة</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                setOpenRowActionsKey(null);
                                handleDeleteContract(c.contractRef || c.id, e);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>حذف</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ODOO 18 CONTRACT FORM SHEET / MODAL */}
      {isContractModalOpen && selectedContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-right flex flex-col max-h-[92vh]">
            
            {/* Modal Top Header & Status Pipeline Bar */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#714B67] text-white rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {isCreatingNew
                        ? 'إنشاء عقد عمل جديد'
                        : `عقد العمل: ${formatContractDisplayRef(selectedContract)}`}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      الموظف: <strong className="text-[#714B67]">{selectedContract.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPamPrintEmployee(employeePayloadForPamContract(selectedContract))}
                    className="bg-[#714B67]/10 hover:bg-[#714B67] hover:text-white text-[#714B67] px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck size={14} />
                    <span>نموذج PAM الرسمي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openSignedContractPreview(selectedContract)}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>عرض العقد المرفوع</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsContractModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 cursor-pointer"
                    title="إغلاق"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: normalizeContractStatus('draft') })}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    normalizeContractStatus(selectedContract.contractStatus) === 'draft'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  مسودة
                </button>
                <ChevronRight size={12} className="text-slate-300 rotate-180" />
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: normalizeContractStatus('running') })}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    normalizeContractStatus(selectedContract.contractStatus) === 'running'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  قيد التنفيذ (ساري)
                </button>
                <ChevronRight size={12} className="text-slate-300 rotate-180" />
                <button
                  type="button"
                  onClick={() => setSelectedContract({ ...selectedContract, contractStatus: normalizeContractStatus('expired') })}
                  className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                    normalizeContractStatus(selectedContract.contractStatus) === 'expired'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  منتهي
                </button>
              </div>
            </div>

            {/* Modal Body / Form Sheet */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Section 1: Employee Binding & Employment Type Selector */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="font-bold text-slate-900 flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#714B67]" />
                    <span>بيانات الموظف ونوع الدوام والتعاقد</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">قانون العمل الكويتي رقم 6/2010</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">الموظف المعني بالعقد (Employee)</label>
                    <select
                      value={selectedContract.id}
                      onChange={(e) => handleEmployeeSelectionChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      {availableEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.id} - {emp.jobTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employment Type Selector (Full-Time vs Part-Time / Locum) */}
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">
                      نظام ونوع الدوام (Employment Type) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedContract.employmentType || 'full_time'}
                      onChange={(e) => {
                        const newType = e.target.value as 'full_time' | 'part_time';
                        setSelectedContract({
                          ...selectedContract,
                          employmentType: newType,
                          hasCustomSchedule: newType === 'part_time' ? true : selectedContract.hasCustomSchedule,
                          dailyHours: newType === 'part_time' ? (selectedContract.dailyHours || 4) : 8,
                          shiftStartTime: newType === 'part_time' ? '16:00' : '08:00',
                          shiftEndTime: newType === 'part_time' ? '20:00' : '16:00',
                          hourlyRate: newType === 'part_time' ? (selectedContract.hourlyRate || 25) : 0
                        });
                      }}
                      className="w-full p-2.5 bg-white border-2 border-[#714B67]/30 rounded-xl font-bold text-slate-900 focus:border-[#714B67]"
                    >
                      <option value="full_time">دوام كامل (Full-Time) - راتب شهري ثابت</option>
                      <option value="part_time">دوام جزئي / استشاري زائر (Part-Time / Locum) - بأجر الساعة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">نوع العقد القانوني</label>
                    <select
                      value={selectedContract.contractType}
                      onChange={(e) => setSelectedContract({ ...selectedContract, contractType: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    >
                      <option value="fixed">عقد محدد المدة (Fixed-Term Contract)</option>
                      <option value="unlimited">عقد غير محدد المدة (Indefinite Contract)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">المسمى الوظيفي المعتمد</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedContract.jobTitle}
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-not-allowed"
                      title="يُجلب تلقائياً من ملف الموظف"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">القسم / الإدارة</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedContract.department}
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 cursor-not-allowed"
                      title="يُجلب تلقائياً من ملف الموظف"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">الرقم المدني (Civil ID)</label>
                    <input
                      type="text"
                      readOnly
                      value={selectedContract.civilId}
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 cursor-not-allowed"
                      title="يُجلب تلقائياً من ملف الموظف"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dynamic Work Schedule Fields (ساعات وأوقات الدوام المخصصة) */}
              <div className="bg-indigo-50/40 p-3.5 rounded-2xl border border-indigo-200 space-y-3">
                <div className="font-bold text-indigo-950 flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-700" />
                    <span>جدول وساعات العمل المخصصة</span>
                  </div>
                  
                  {/* Enable Custom Schedule Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedContract.hasCustomSchedule || selectedContract.employmentType === 'part_time'}
                      onChange={(e) => setSelectedContract({ ...selectedContract, hasCustomSchedule: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-indigo-900 font-bold">تخصيص شيفت وساعات الموظف</span>
                  </label>
                </div>

                {(selectedContract.hasCustomSchedule || selectedContract.employmentType === 'part_time') ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">ساعات العمل اليومية</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          step="0.5"
                          value={selectedContract.dailyHours || 8}
                          onChange={(e) => setSelectedContract({ ...selectedContract, dailyHours: parseFloat(e.target.value) || 8 })}
                          className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 pl-10"
                        />
                        <span className="absolute left-3 top-2 text-xs text-slate-400">ساعة</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">وقت الحضور</label>
                      <input
                        type="time"
                        value={selectedContract.shiftStartTime || '08:00'}
                        onChange={(e) => setSelectedContract({ ...selectedContract, shiftStartTime: e.target.value })}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">وقت الانصراف</label>
                      <input
                        type="time"
                        value={selectedContract.shiftEndTime || '16:00'}
                        onChange={(e) => setSelectedContract({ ...selectedContract, shiftEndTime: e.target.value })}
                        className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 block mb-1 font-bold">سماح التأخير الصباحي</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={selectedContract.gracePeriodMinutes !== undefined ? selectedContract.gracePeriodMinutes : 15}
                          onChange={(e) => setSelectedContract({ ...selectedContract, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 pl-12"
                        />
                        <span className="absolute left-3 top-2 text-xs text-slate-400">دقيقة</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span>جدول قياسي افتراضي: <strong>08:00 ص - 04:00 م</strong> (8 ساعات يومياً | سماح 15 دقيقة)</span>
                    <button
                      type="button"
                      onClick={() => setSelectedContract({ ...selectedContract, hasCustomSchedule: true })}
                      className="text-indigo-700 font-bold hover:underline cursor-pointer"
                    >
                      تغيير الشيفت ⚙️
                    </button>
                  </div>
                )}
              </div>

              {/* Section 3: Wage Structure Breakdown & Hourly Rate */}
              <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200 space-y-4">
                <div className="font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-700" />
                    <span>الهيكل المالي للراتب والبدلات</span>
                  </div>
                  {selectedContract.employmentType === 'part_time' && (
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      نظام الساعات الفعلية (Locum Hourly Rate)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {selectedContract.employmentType === 'part_time' ? (
                    <div>
                      <label className="text-indigo-900 block mb-1 font-black flex items-center gap-1">
                        <Timer size={12} className="text-indigo-600" />
                        <span>أجر الساعة التعاقدي (Hourly Rate)</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.001"
                          value={selectedContract.hourlyRate || 0}
                          onChange={(e) => setSelectedContract({ ...selectedContract, hourlyRate: parseFloat(e.target.value) || 0, basicSalary: 0 })}
                          className="w-full p-2.5 bg-white border-2 border-indigo-400 rounded-xl font-mono font-bold text-indigo-900 pl-12"
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-indigo-400 font-bold">د.ك/س</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-slate-600 block mb-1 font-bold">الراتب الأساسي (Basic Salary)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedContract.basicSalary}
                        onChange={(e) => setSelectedContract({ ...selectedContract, basicSalary: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">بدل السكن (Housing)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.housingAllowance}
                      onChange={(e) => setSelectedContract({ ...selectedContract, housingAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">بدل الانتقال (Transport)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.transportAllowance}
                      onChange={(e) => setSelectedContract({ ...selectedContract, transportAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1 font-bold">البدل الطبي / بدلات أخرى</label>
                    <input
                      type="number"
                      step="0.001"
                      value={selectedContract.medicalAllowance || 0}
                      onChange={(e) => setSelectedContract({ ...selectedContract, medicalAllowance: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Calculation summary banner */}
                {(() => {
                  const isPartTime = selectedContract.employmentType === 'part_time';
                  const allowances = (selectedContract.housingAllowance || 0) + (selectedContract.transportAllowance || 0) + (selectedContract.medicalAllowance || 0);
                  
                  if (isPartTime) {
                    const hRate = selectedContract.hourlyRate || 0;
                    const dHours = selectedContract.dailyHours || 4;
                    const estimatedDayRate = hRate * dHours;
                    const estimatedMonthGross = (estimatedDayRate * 26) + allowances;

                    return (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold">معادلة مسير الرواتب (WPS Formula):</div>
                          <div className="text-xs font-black text-indigo-900 font-mono">
                            (ساعات البصمة الفعلية × {hRate.toFixed(3)} د.ك) + {allowances.toFixed(3)} د.ك بدلات
                          </div>
                        </div>
                        <div className="border-r border-slate-200 pr-4">
                          <div className="text-[10px] text-slate-400 font-bold">التقديري الشهري (أساس 26 يوم):</div>
                          <div className="text-base font-black text-indigo-700 font-mono">{estimatedMonthGross.toFixed(3)} د.ك</div>
                        </div>
                      </div>
                    );
                  }

                  const gross = (selectedContract.basicSalary || 0) + allowances;
                  const dayRate = gross / 26;
                  const hourRate = dayRate / (selectedContract.dailyHours || 8);

                  return (
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">إجمالي الراتب الشامل المعتمد (Gross Wage):</div>
                        <div className="text-base font-black text-emerald-800 font-mono">{gross.toFixed(3)} د.ك</div>
                      </div>
                      <div className="border-r border-slate-200 pr-4">
                        <div className="text-[10px] text-slate-400 font-bold">أجر اليوم الواحد (أساس 26 يوم):</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{dayRate.toFixed(3)} د.ك</div>
                      </div>
                      <div className="border-r border-slate-200 pr-4">
                        <div className="text-[10px] text-slate-400 font-bold">أجر ساعة العمل:</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{hourRate.toFixed(3)} د.ك</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Section 4: Collapsible Period & Legal Working Conditions */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowLegalDetails(!showLegalDetails)}
                  className="w-full p-3.5 flex items-center justify-between text-slate-800 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#714B67]" />
                    <span>المدد والاشتراطات القانونية (بداية العقد، التجربة، الإخطار)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal">
                    <span>{showLegalDetails ? 'إخفاء' : `بداية: ${selectedContract.startDate || 'اليوم'} | تجربة: ${selectedContract.probationDays || 100} يوم`}</span>
                    {showLegalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                {showLegalDetails && (
                  <div className="p-4 pt-1 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white">
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ بداية العقد</label>
                      <input
                        type="date"
                        value={selectedContract.startDate}
                        onChange={(e) => setSelectedContract({ ...selectedContract, startDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ نهاية العقد (إن وجد)</label>
                      <input
                        type="date"
                        value={selectedContract.endDate || ''}
                        onChange={(e) => setSelectedContract({ ...selectedContract, endDate: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">فترة التجربة (أيام)</label>
                      <input
                        type="number"
                        value={selectedContract.probationDays}
                        onChange={(e) => setSelectedContract({ ...selectedContract, probationDays: parseInt(e.target.value) || 100 })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">فترة الإخطار (أشهر)</label>
                      <input
                        type="number"
                        value={selectedContract.noticePeriodMonths}
                        onChange={(e) => setSelectedContract({ ...selectedContract, noticePeriodMonths: parseInt(e.target.value) || 3 })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-700 font-bold text-xs flex items-center gap-1">
                    بنود وملاحظات العقد (قانونية / إضافية)
                  </label>
                  <AiInlineAssist
                    fieldKind="contract_clause"
                    value={selectedContract.notes || ''}
                    maxLength={2500}
                    onApply={(text) => setSelectedContract({ ...selectedContract, notes: text })}
                  />
                </div>
                <textarea
                  rows={4}
                  value={selectedContract.notes || ''}
                  onChange={(e) => setSelectedContract({ ...selectedContract, notes: e.target.value })}
                  placeholder="بنود خاصة، شروط إضافية، أو ملاحق تعاقدية وفق قانون العمل الكويتي…"
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs leading-relaxed focus:border-[#714B67] outline-none"
                />
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsContractModalOpen(false)}
                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSaveContract}
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save size={16} />
                <span>حفظ واعتماد العقد</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <UploadedSignedContractModal
        isOpen={Boolean(signedContractPreview)}
        onClose={() => setSignedContractPreview(null)}
        employeeName={signedContractPreview?.employeeName || ''}
        contractRef={signedContractPreview?.contractRef}
        file={previewSignedFile}
        isUploading={isUploadingSignedContract}
        onUpload={
          signedContractPreview
            ? handleUploadSignedContractFromContracts
            : undefined
        }
      />

      {/* Collapsible Chatter Section */}
      <div className="mt-6 border-t border-slate-200 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowChatter(!showChatter)}
            className="text-xs font-bold text-slate-600 hover:text-[#714B67] flex items-center gap-2 transition cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>{showChatter ? 'إخفاء سجل التتبع والملاحظات (Odoo Chatter)' : 'عرض سجل التتبع والملاحظات الرسمية (Odoo Chatter)'}</span>
            {showChatter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showChatter && (
          <div className="mt-4 animate-fadeIn">
            {(() => {
               const messages: ChatterMessage[] = [];
               contracts.forEach(c => {
                 if (normalizeContractStatus(c.contractStatus) === 'draft') {
                    messages.push({
                      id: `auto-contract-${c.id}`,
                      author: 'نظام العقود (hr.contract)',
                      date: new Date().toLocaleDateString('ar-KW'),
                      content: `يرجى مراجعة واعتماد مسودة العقد (${c.contractRef}) للموظف (${c.name}) - نوع الدوام: ${c.employmentType === 'part_time' ? 'دوام جزئي/بالساعة' : 'دوام كامل'}.`,
                      type: 'activity',
                      activityDetails: {
                        type: 'متابعة وتوقيع عقد',
                        assignee: 'مدير الموارد البشرية',
                        dueDate: new Date().toISOString().split('T')[0],
                        status: 'yellow',
                        statusText: 'مسودة قيد المراجعة'
                      }
                    });
                 }
               });
               return (
                 <OdooChatter 
                   recordId="contracts_global" 
                   model="hr.contract"
                   inlineAiFieldKind="admin_decision"
                   followers={[
                     { id: '1', name: 'إدارة الموارد البشرية' },
                     { id: '2', name: 'مسؤول رواتب WPS' }
                   ]}
                   messages={messages.length > 0 ? messages : [
                     { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'جميع عقود العمل موثقة ومطابقة لقانون العمل الكويتي وتدعم الجداول المخصصة والساعات الفعلية.' }
                   ]}
                 />
               );
            })()}
          </div>
        )}
      </div>

      {pamPrintEmployee && (
        <OdooPamContractModal
          isOpen={Boolean(pamPrintEmployee)}
          onClose={() => setPamPrintEmployee(null)}
          employee={pamPrintEmployee}
          company={activeCompany}
        />
      )}
    </div>
  );
};

export default OdooContractsApp;

