import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../lib/i18n';
import { formatPeriodLabel } from '../lib/localeFormat';
import { 
  CreditCard, Download, FileSpreadsheet, CheckCircle2, AlertCircle, 
  Clock, Calculator, Building2, Printer, Search, Eye, ArrowRight,
  ShieldCheck, DollarSign, Plus, Filter, FileText, User, Calendar, 
  AlertTriangle, RotateCcw, Check, Send, Building, Hash, Landmark, 
  ArrowUpRight, Trash2, X, RefreshCw, Layers, Sliders, Scale
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useCompanyForPrint } from '../hooks/useCompanyForPrint';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { exportToExcel } from '../utils/exportUtils';
import { OfficialPayslipPrintModal, PayslipPrintData } from './payroll/OfficialPayslipPrintModal';
import { WpsAuditShieldModal, WpsAuditItem } from './payroll/WpsAuditShieldModal';
import { FinalSettlementModal } from './payroll/FinalSettlementModal';
import { PayrollStructureWizardModal } from './payroll/PayrollStructureWizardModal';
import { EosSetupWizardModal } from './payroll/EosSetupWizardModal';
import { EOSApp } from '../apps/EOSApp';
import type { Contract, Employee } from '../types';
import { db, cleanFirestoreData } from '../lib/firebase';
import { TenantDatabaseService } from '../services/tenantDataService';
import {
  calculateKuwaitDailyRate,
  calculateKuwaitHourlyRate,
  computeNetPayrollFromComponents,
} from '../utils/kuwaitPayrollMath';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { employerPamOrEstablishmentCode, isMohMedicalEstablishment } from '../utils/mohMedicalFacility';
import { TimeOffPayrollFinancePanel } from './timeoff/TimeOffPayrollFinancePanel';
import { MaskedCivilField } from './security/MaskedValue';
import { PageHeader } from './ui/PageHeader';
import { StatStrip } from './ui/StatStrip';
import { DataTable, type DataTableColumn } from './ui/DataTable';
import { RowActions } from './ui/RowActions';
import { StatusBadge } from './ui/StatusBadge';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { Modal } from './ui';
import { MaskedValue } from './ui/MaskedValue';
import { tokens } from '../design/tokens';
import {
  LAW_51_53_TEXT,
  LAW_59_TEXT,
  LAW_66_TEXT,
  LAW_70_TEXT,
  LAW_71_TEXT,
  buildPayrollReversal,
  columnAllZero,
  payslipHasReversal,
} from './payroll/payrollDisplay';

function LawTip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute z-20 hidden w-64 text-white group-hover:block group-focus-within:block"
        style={{
          bottom: '100%',
          insetInlineStart: 0,
          marginBlockEnd: tokens.space[1],
          background: tokens.color.gray[900],
          paddingInline: tokens.space[2],
          paddingBlock: tokens.space[1],
          borderRadius: tokens.radius.sm,
          fontSize: tokens.text.xs,
          fontWeight: 400,
          lineHeight: 1.6,
          whiteSpace: 'normal',
        }}
      >
        {text}
      </span>
    </span>
  );
}

function payslipStatusLabel(slip: PayslipItem, all: readonly PayslipItem[]) {
  if (slip.reversalOfId) return 'قيد عكسي';
  if (payslipHasReversal(all, slip.id)) return 'ملغى';
  if (slip.status === 'review') return 'قيد المراجعة';
  if (slip.status === 'draft') return 'مسودة';
  if (slip.status === 'confirmed') return 'معتمد';
  return 'مصروف';
}

export interface PayslipItem {
  id: string;
  payslipNumber: string;
  employeeId: string;
  employeeName: string;
  civilId: string;
  jobTitle: string;
  department: string;
  bankName: string;
  iban: string;
  period: string; // e.g. "2026-08"
  // بنود الراتب طبقاً لقانون العمل الكويتي (أساس 26 يوم)
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonusAmount?: number;
  absenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  loanDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'review' | 'confirmed' | 'paid';
  wpsFileRef?: string;
  notes?: string;
  reversalOfId?: string;
  reversalReason?: string;
}

interface MonthlyAttendanceRollupEntry {
  employeeId: string;
  lateMinutes: number;
  unexcusedAbsenceDays: number;
  overtimeHours: number;
  overtimePay: number;
  delayDeduction: number;
  absenceDeduction: number;
  actualHours: number;
}

export interface OdooPayrollAppProps {
  initialSettlementEmployeeId?: string;
  openFinalSettlementTriggerKey?: number;
  highlightLeaveAdvanceRequestId?: string | null;
  openLeaveFinanceTriggerKey?: number;
}

export const OdooPayrollApp: React.FC<OdooPayrollAppProps> = ({
  initialSettlementEmployeeId,
  openFinalSettlementTriggerKey,
  highlightLeaveAdvanceRequestId,
  openLeaveFinanceTriggerKey,
}) => {
  const { lang: uiLang, t } = useLang();
  const dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  const { activeCompany } = useCompany();
  const { company: companyForPrint, profile: printProfile } = useCompanyForPrint();
  const { settings } = useSystemSettings();
  const { 
    employees, 
    loans, 
    addLoan, 
    deleteLoan, 
    computedPayslips, 
    processMonthlyBatch, 
    registerLoanPayment 
  } = useOdooHierarchy();
  
  const [activeSubTab, setActiveSubTab] = useState<
    'payslips' | 'wps' | 'loans' | 'settlements' | 'leave_finance'
  >('payslips');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'review' | 'confirmed' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Payslip for Form Sheet View (Odoo Form View)
  const [activePayslipId, setActivePayslipId] = useState<string | null>(null);
  const [formActiveTab, setFormActiveTab] = useState<'computation' | 'wps_bank' | 'work_entries'>('computation');

  // Modals state
  const [showNewPayslipModal, setShowNewPayslipModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showOfficialPayslipModal, setShowOfficialPayslipModal] = useState(false);
  const [payslipToPrint, setPayslipToPrint] = useState<PayslipPrintData | null>(null);
  const [showWpsAuditModal, setShowWpsAuditModal] = useState(false);
  const [showFinalSettlementModal, setShowFinalSettlementModal] = useState(false);
  const [showPayrollWizard, setShowPayrollWizard] = useState(false);
  const [showEosWizard, setShowEosWizard] = useState(false);
  const [showEosEngineModal, setShowEosEngineModal] = useState(false);
  const [statFocus, setStatFocus] = useState<string | undefined>();
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);
  const [reverseTargetId, setReverseTargetId] = useState<string | null>(null);
  const [reverseReason, setReverseReason] = useState('');
  const [deleteLoanId, setDeleteLoanId] = useState<string | null>(null);

  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);
  const [leaveSettlements, setLeaveSettlements] = useState<any[]>([]);
  const [monthlyRollupByEmployee, setMonthlyRollupByEmployee] = useState<Record<string, MonthlyAttendanceRollupEntry>>({});

  useEffect(() => {
    if (!openFinalSettlementTriggerKey) return;
    setActiveSubTab('settlements');
    setShowFinalSettlementModal(true);
  }, [openFinalSettlementTriggerKey, initialSettlementEmployeeId]);

  useEffect(() => {
    if (!openLeaveFinanceTriggerKey) return;
    setActiveSubTab('leave_finance');
  }, [openLeaveFinanceTriggerKey]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) {
      setPayslips([]);
      return;
    }
    return onSnapshot(
      collection(db, 'payslips'),
      snapshot => {
        const remote = snapshot.docs
          .map(item => normalizePayslipItem({ ...item.data(), id: item.id } as PayslipItem))
          .filter(item => (item as PayslipItem & { companyId?: string }).companyId === companyId);
        setPayslips(remote);
      },
      error => console.error('Failed to load payslips from Firestore', error)
    );
  }, [activeCompany?.id]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId || !selectedMonth) {
      setMonthlyRollupByEmployee({});
      return;
    }

    return onSnapshot(
      doc(db, 'attendance_monthly_rollups', `${companyId}_${selectedMonth}`),
      (snapshot) => {
        const summaries = (snapshot.data()?.summaries || {}) as Record<string, MonthlyAttendanceRollupEntry>;
        setMonthlyRollupByEmployee(summaries);
      },
      () => setMonthlyRollupByEmployee({})
    );
  }, [activeCompany?.id, selectedMonth]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) {
      setLeaveRequests([]);
      setLeaveAllocations([]);
      setLeaveSettlements([]);
      return;
    }

    const requestsQuery = query(collection(db, 'leave_requests'), where('companyId', '==', companyId));
    const allocationsQuery = query(collection(db, 'leave_allocations'), where('companyId', '==', companyId));
    const settlementsQuery = query(collection(db, 'leave_settlements'), where('companyId', '==', companyId));

    const unsubscribeRequests = onSnapshot(requestsQuery, snapshot => {
      setLeaveRequests(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, error => console.error('Failed to load leave requests for payroll settlements', error));

    const unsubscribeAllocations = onSnapshot(allocationsQuery, snapshot => {
      setLeaveAllocations(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, error => console.error('Failed to load leave allocations for payroll settlements', error));

    const unsubscribeSettlements = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        setLeaveSettlements(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })));
      },
      (error) => console.error('Failed to load leave settlements for payroll settlements', error)
    );

    return () => {
      unsubscribeRequests();
      unsubscribeAllocations();
      unsubscribeSettlements();
    };
  }, [activeCompany?.id]);

  const savePayslips = (newList: PayslipItem[]) => {
    setPayslips(newList);
    const companyId = activeCompany?.id;
    if (!companyId) return;
    newList.forEach(payslip => {
      const normalized = normalizePayslipItem(payslip);
      void setDoc(
        doc(db, 'payslips', payslip.id),
        cleanFirestoreData({ ...normalized, companyId }),
        { merge: true }
      ).catch(error => console.error('Failed to save payslip to Firestore', error));
    });
  };

  const round3 = (value: number) => Math.round((Number(value) || 0) * 1000) / 1000;

  const normalizePayslipItem = (raw: PayslipItem): PayslipItem => {
    if (raw.reversalOfId) return raw;
    const grossSalary = Number(
      raw.grossSalary ??
        (raw.basicSalary || 0) +
          (raw.housingAllowance || 0) +
          (raw.transportAllowance || 0) +
          (raw.medicalAllowance || 0)
    );
    const { totalDeductions, netSalary } = computeNetPayrollFromComponents({
      grossSalary,
      overtimeAmount: raw.overtimeAmount,
      bonusAmount: raw.bonusAmount,
      absenceDeduction: raw.absenceDeduction,
      delayDeduction: raw.delayDeduction,
      loanDeduction: raw.loanDeduction,
    });
    const { pifssDeduction: _legacyPifss, ...rest } = raw as PayslipItem & { pifssDeduction?: number };
    return { ...rest, grossSalary, totalDeductions, netSalary };
  };

  const getAttendanceFinancials = (emp: any, rollupByEmployee?: Record<string, MonthlyAttendanceRollupEntry>) => {
    const sourceRollup = rollupByEmployee || monthlyRollupByEmployee;
    const monthly = sourceRollup[emp.id];
    if (!monthly) {
      return {
        hasMonthlyRollup: false,
        overtimeHours: 0,
        overtimeAmount: 0,
        absenceDays: 0,
        absenceDeduction: 0,
        delayMinutes: 0,
        delayDeduction: 0
      };
    }

    const overtimeHours = Number(monthly.overtimeHours || 0);
    const overtimeAmount = round3(Number(monthly.overtimePay || 0));
    const absenceDays = Number(monthly.unexcusedAbsenceDays || 0);
    const absenceDeduction = round3(Number(monthly.absenceDeduction || 0));
    const delayMinutes = Number(monthly.lateMinutes || 0);
    const delayDeduction = round3(Number(monthly.delayDeduction || 0));

    return {
      hasMonthlyRollup: true,
      overtimeHours,
      overtimeAmount,
      absenceDays,
      absenceDeduction,
      delayMinutes,
      delayDeduction
    };
  };

  const loadMonthlyRollupForPeriod = async (monthKey: string) => {
    const companyId = activeCompany?.id;
    if (!companyId || !monthKey) return {} as Record<string, MonthlyAttendanceRollupEntry>;

    if (monthKey === selectedMonth) {
      return monthlyRollupByEmployee;
    }

    const snapshot = await getDoc(doc(db, 'attendance_monthly_rollups', `${companyId}_${monthKey}`));
    return (snapshot.data()?.summaries || {}) as Record<string, MonthlyAttendanceRollupEntry>;
  };

  // Generate initial or refreshed payslips from employees & attendance
  const generateInitialPayslips = () => {
    if (!employees || employees.length === 0) return;
    const initialList: PayslipItem[] = employees.map((emp, idx) => {
      const empLoan = loans.find(l => l.employeeId === emp.id && l.remainingAmount > 0);

      const totalBase = (emp.basicSalary || 0) + (emp.housingAllowance || 0) + (emp.transportAllowance || 0) + (emp.medicalAllowance || 0);
      const attendanceFinancials = getAttendanceFinancials(emp);
      const overtimeHours = attendanceFinancials.overtimeHours;
      const overtimeAmount = attendanceFinancials.overtimeAmount;
      const absenceDays = attendanceFinancials.absenceDays;
      const absenceDeduction = attendanceFinancials.absenceDeduction;
      const delayMinutes = attendanceFinancials.delayMinutes;
      const delayDeduction = attendanceFinancials.delayDeduction;
      const loanDeduction = empLoan ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount) : 0;
      
      const grossSalary = totalBase;
      const bonusAmount = 0;
      const { totalDeductions, netSalary } = computeNetPayrollFromComponents({
        grossSalary,
        overtimeAmount,
        bonusAmount,
        absenceDeduction,
        delayDeduction,
        loanDeduction,
      });

      return {
        id: `SLIP-${selectedMonth}-${emp.id}`,
        payslipNumber: `PAY/${selectedMonth.replace('-', '/')}/${String(idx + 1).padStart(4, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        civilId: emp.civilId || '',
        jobTitle: emp.jobTitle || 'موظف',
        department: emp.department || 'الإدارة العامة',
        bankName: emp.bankName || 'بنك الكويت الوطني (NBK)',
        iban: emp.iban || '',
        period: selectedMonth,
        basicSalary: emp.basicSalary || 600,
        housingAllowance: emp.housingAllowance || 0,
        transportAllowance: emp.transportAllowance || 0,
        medicalAllowance: emp.medicalAllowance || 0,
        overtimeHours,
        overtimeAmount,
        bonusAmount,
        absenceDays,
        absenceDeduction,
        delayMinutes,
        delayDeduction,
        loanDeduction,
        grossSalary,
        totalDeductions,
        netSalary,
        status: 'draft',
        notes: 'مسير معتمد ومحسوب تلقائياً وفق قانون العمل الكويتي (أساس 26 يوم عمل)'
      };
    });

    const reversals = payslips.filter((slip) => slip.reversalOfId && slip.period === selectedMonth);
    savePayslips([...initialList, ...reversals]);
  };

  // Loan state
  const [newLoan, setNewLoan] = useState({
    employeeId: '',
    totalAmount: '',
    monthlyInstallment: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeId || !newLoan.totalAmount) return;
    const tot = parseFloat(newLoan.totalAmount) || 0;
    const inst = parseFloat(newLoan.monthlyInstallment) || 0;

    const emp = employees.find(e => e.id === newLoan.employeeId);
    if (emp) {
      const comprehensive = (emp.basicSalary || 0) + (emp.housingAllowance || 0) + (emp.transportAllowance || 0) + (emp.medicalAllowance || 0);
      const maxAllowedTenPercent = comprehensive * 0.10;
      if (inst > maxAllowedTenPercent && maxAllowedTenPercent > 0) {
        if (!confirm(`تنبيه قانوني (المادة 59 من قانون العمل الكويتي):\nالقسط الشهري المحدد (${inst.toFixed(3)} د.ك) يتجاوز نسبة 10% من الراتب الشامل للموظف (${maxAllowedTenPercent.toFixed(3)} د.ك).\n\nهل ترغب بالمتابعة استثنائياً بموافقة الموظف الخطية؟`)) {
          return;
        }
      }
    }
    
    addLoan(newLoan.employeeId, tot, inst);
    setShowLoanModal(false);
    setNewLoan({
      employeeId: '',
      totalAmount: '',
      monthlyInstallment: '',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  // State transitions
  const handleStatusChange = (id: string, newStatus: 'draft' | 'review' | 'confirmed' | 'paid') => {
    const updated = payslips.map(p => {
      if (p.id === id) {
        if (newStatus === 'paid' && p.status !== 'paid' && p.loanDeduction > 0) {
          const empLoan = loans.find(l => l.employeeId === p.employeeId && l.remainingAmount > 0);
          if (empLoan) {
            registerLoanPayment(empLoan.id, p.loanDeduction);
          }
        }
        return {
          ...p,
          status: newStatus,
          wpsFileRef: newStatus === 'paid' ? `WPS-${selectedMonth.replace('-', '')}-KW-01` : p.wpsFileRef
        };
      }
      return p;
    });
    savePayslips(updated);
  };

  const handleBatchStatusChange = (newStatus: 'draft' | 'review' | 'confirmed' | 'paid') => {
    const updated = payslips.map(p => ({
      ...p,
      status: newStatus,
      wpsFileRef: newStatus === 'paid' ? `WPS-${selectedMonth.replace('-', '')}-KW-01` : p.wpsFileRef
    }));
    savePayslips(updated);
  };

  const confirmDeleteDraftPayslip = () => {
    if (!deleteDraftId) return;
    const target = payslips.find((slip) => slip.id === deleteDraftId);
    if (!target || target.status !== 'draft' || target.reversalOfId) {
      setDeleteDraftId(null);
      return;
    }
    savePayslips(payslips.filter((slip) => slip.id !== deleteDraftId));
    if (activePayslipId === deleteDraftId) setActivePayslipId(null);
    setDeleteDraftId(null);
  };

  const confirmReversePayslip = () => {
    const reason = reverseReason.trim();
    if (!reverseTargetId || !reason) return;
    const source = payslips.find((slip) => slip.id === reverseTargetId);
    if (!source || source.status === 'draft' || source.reversalOfId || payslipHasReversal(payslips, source.id)) {
      setReverseTargetId(null);
      setReverseReason('');
      return;
    }
    const reversal = buildPayrollReversal(source, reason, `REV-${source.id}`);
    savePayslips([reversal, ...payslips]);
    setReverseTargetId(null);
    setReverseReason('');
  };

  const requestPayslipRemoval = (slip: PayslipItem) => {
    if (slip.reversalOfId || payslipHasReversal(payslips, slip.id)) return;
    if (slip.status === 'draft') {
      setDeleteDraftId(slip.id);
      return;
    }
    setReverseReason('');
    setReverseTargetId(slip.id);
  };

  // New Payslip Modal Form State
  const [newForm, setNewForm] = useState({
    period: selectedMonth,
    employeeId: '',
    employeeName: '',
    civilId: '',
    jobTitle: 'موظف',
    department: 'الإدارة العامة',
    bankName: 'بنك الكويت الوطني (NBK)',
    iban: '',
    basicSalary: '600',
    housingAllowance: '150',
    transportAllowance: '50',
    medicalAllowance: '0',
    overtimeHours: '0',
    absenceDays: '0',
    delayMinutes: '0'
  });
  const [newPayslipPeriodStatus, setNewPayslipPeriodStatus] = useState<{
    isLoading: boolean;
    hasPostedRollup: boolean;
    isLocked: boolean;
    employeesCount: number;
  }>({
    isLoading: false,
    hasPostedRollup: false,
    isLocked: false,
    employeesCount: 0
  });

  const refreshNewPayslipPeriodStatus = async (monthKey: string) => {
    const companyId = activeCompany?.id;
    if (!companyId || !monthKey) {
      setNewPayslipPeriodStatus({ isLoading: false, hasPostedRollup: false, isLocked: false, employeesCount: 0 });
      return;
    }

    setNewPayslipPeriodStatus(prev => ({ ...prev, isLoading: true }));
    const snapshot = await getDoc(doc(db, 'attendance_monthly_rollups', `${companyId}_${monthKey}`));
    const data = snapshot.data() || {};
    const summaries = (data.summaries || {}) as Record<string, MonthlyAttendanceRollupEntry>;
    const employeesCount = Object.keys(summaries).length;
    const hasPostedRollup = snapshot.exists() && employeesCount > 0;
    setNewPayslipPeriodStatus({
      isLoading: false,
      hasPostedRollup,
      isLocked: Boolean(data.locked),
      employeesCount
    });
  };

  useEffect(() => {
    if (!showNewPayslipModal) return;
    const effectivePeriod = newForm.period || selectedMonth;
    if (newForm.period !== effectivePeriod) {
      setNewForm(prev => ({ ...prev, period: effectivePeriod }));
    }
    void refreshNewPayslipPeriodStatus(effectivePeriod);
  }, [showNewPayslipModal, newForm.period, selectedMonth, activeCompany?.id]);

  // Handle employee select in New Payslip Modal
  const handleSelectEmployeeForPayslip = async (empId: string, periodMonth?: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const targetMonth = periodMonth || newForm.period || selectedMonth;
    const rollupByEmployee = await loadMonthlyRollupForPeriod(targetMonth);
    const attendanceFinancials = getAttendanceFinancials(emp, rollupByEmployee);
    if (!attendanceFinancials.hasMonthlyRollup) {
      alert(`لا توجد بيانات حضور مرحّلة لشهر ${targetMonth} لهذا الموظف. قم بترحيل الشهر من شاشة الحضور أولاً.`);
      return;
    }
    setNewForm({
      period: targetMonth,
      employeeId: emp.id,
      employeeName: emp.name,
      civilId: emp.civilId || '',
      jobTitle: emp.jobTitle || 'موظف',
      department: emp.department || 'الإدارة العامة',
      bankName: emp.bankName || 'بنك الكويت الوطني (NBK)',
      iban: emp.iban || '',
      basicSalary: String(emp.basicSalary || 0),
      housingAllowance: String(emp.housingAllowance || 0),
      transportAllowance: String(emp.transportAllowance || 0),
      medicalAllowance: String(emp.medicalAllowance || 0),
      overtimeHours: String(attendanceFinancials.overtimeHours || 0),
      absenceDays: String(attendanceFinancials.absenceDays || 0),
      delayMinutes: String(attendanceFinancials.delayMinutes || 0)
    });
  };

  const handleCreateNewPayslip = (e: React.FormEvent) => {
    e.preventDefault();
    const periodMonth = newForm.period || selectedMonth;
    if (!periodMonth) {
      alert('يرجى تحديد شهر القسيمة أولاً.');
      return;
    }

    if (!newForm.employeeId) {
      alert('يرجى اختيار الموظف أولاً لإنشاء قسيمة مرتبطة بترحيل الحضور الشهري.');
      return;
    }

    const selectedEmployee = employees.find(emp => emp.id === newForm.employeeId);
    if (!selectedEmployee) {
      alert('تعذر العثور على بيانات الموظف المختار.');
      return;
    }

    const basic = parseFloat(newForm.basicSalary) || 0;
    const housing = parseFloat(newForm.housingAllowance) || 0;
    const transport = parseFloat(newForm.transportAllowance) || 0;
    const medical = parseFloat(newForm.medicalAllowance) || 0;
    const createWithMonthlyRollup = async () => {
      const rollupByEmployee = await loadMonthlyRollupForPeriod(periodMonth);
      const attendanceFinancials = getAttendanceFinancials(selectedEmployee, rollupByEmployee);
      if (!attendanceFinancials.hasMonthlyRollup) {
        alert(`لا توجد بيانات حضور مرحّلة لشهر ${periodMonth} لهذا الموظف. قم بترحيل الشهر من شاشة الحضور أولاً.`);
        return;
      }

      const otHours = attendanceFinancials.overtimeHours;
      const absDays = attendanceFinancials.absenceDays;
      const delMins = attendanceFinancials.delayMinutes;
      const totalBase = basic + housing + transport + medical;
      const overtimeAmount = attendanceFinancials.overtimeAmount;
      const absenceDeduction = attendanceFinancials.absenceDeduction;
      const delayDeduction = attendanceFinancials.delayDeduction;
      
      const empLoan = loans.find((l) => l.employeeId === newForm.employeeId && l.remainingAmount > 0);
      const loanDeduction = empLoan
        ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount)
        : 0;
      const grossSalary = totalBase;
      const { totalDeductions, netSalary } = computeNetPayrollFromComponents({
        grossSalary,
        overtimeAmount,
        absenceDeduction,
        delayDeduction,
        loanDeduction,
      });

      const newId = `SLIP-${periodMonth}-${newForm.employeeId || '00' + (payslips.length + 1)}`;
      const newSeq = `PAY/${periodMonth.replace('-', '/')}/${String(payslips.length + 1).padStart(4, '0')}`;

      const created: PayslipItem = {
        id: newId,
        payslipNumber: newSeq,
        employeeId: newForm.employeeId || `EMP-${String(payslips.length + 1).padStart(3, '0')}`,
        employeeName: newForm.employeeName,
        civilId: newForm.civilId,
        jobTitle: newForm.jobTitle,
        department: newForm.department,
        bankName: newForm.bankName,
        iban: newForm.iban,
        period: periodMonth,
        basicSalary: basic,
        housingAllowance: housing,
        transportAllowance: transport,
        medicalAllowance: medical,
        overtimeHours: otHours,
        overtimeAmount,
        absenceDays: absDays,
        absenceDeduction,
        delayMinutes: delMins,
        delayDeduction,
        loanDeduction,
        grossSalary,
        totalDeductions,
        netSalary,
        status: 'draft',
        notes: `مسير مرتبط بترحيل الحضور الشهري (${periodMonth})`
      };

      savePayslips([created, ...payslips.filter(p => p.id !== created.id)]);
      setShowNewPayslipModal(false);
      setActivePayslipId(created.id);
    };

    void createWithMonthlyRollup();
  };

  // Re-compute single payslip based on Kuwait Labor Law (26 days)
  const handleRecomputePayslip = async (id: string) => {
    const targetPayslip = payslips.find(p => p.id === id);
    if (!targetPayslip || targetPayslip.reversalOfId) return;

    const targetEmployee = employees.find(emp => emp.id === targetPayslip.employeeId);
    if (!targetEmployee) {
      alert('لا يمكن إعادة الاحتساب: الموظف غير موجود.');
      return;
    }

    const periodMonth = targetPayslip.period || selectedMonth;
    const rollupByEmployee = await loadMonthlyRollupForPeriod(periodMonth);
    const attendanceFinancials = getAttendanceFinancials(targetEmployee, rollupByEmployee);
    if (!attendanceFinancials.hasMonthlyRollup) {
      alert(`لا توجد بيانات حضور مرحّلة لشهر ${periodMonth} لهذا الموظف. قم بترحيل الشهر من شاشة الحضور أولاً.`);
      return;
    }

    const updated = payslips.map(p => {
      if (p.id === id) {
        const totalBase = p.basicSalary + p.housingAllowance + p.transportAllowance + p.medicalAllowance;
        const overtimeAmount = attendanceFinancials.overtimeAmount;
        const absenceDeduction = attendanceFinancials.absenceDeduction;
        const delayDeduction = attendanceFinancials.delayDeduction;
        
        const grossSalary = totalBase;
        const { totalDeductions, netSalary } = computeNetPayrollFromComponents({
          grossSalary,
          overtimeAmount,
          absenceDeduction,
          delayDeduction,
          loanDeduction: p.loanDeduction,
        });

        return {
          ...p,
          overtimeHours: attendanceFinancials.overtimeHours,
          absenceDays: attendanceFinancials.absenceDays,
          delayMinutes: attendanceFinancials.delayMinutes,
          overtimeAmount,
          absenceDeduction,
          delayDeduction,
          grossSalary,
          totalDeductions,
          netSalary
        };
      }
      return p;
    });

    savePayslips(updated);
  };

  // Open Official Print Modal
  const handleOpenPrintModal = (p: PayslipItem) => {
    setPayslipToPrint({
      payslipNumber: p.payslipNumber,
      period: p.period,
      employeeName: p.employeeName,
      employeeId: p.employeeId,
      civilId: p.civilId,
      jobTitle: p.jobTitle,
      department: p.department,
      bankName: p.bankName,
      iban: p.iban,
      basicSalary: p.basicSalary,
      housingAllowance: p.housingAllowance,
      transportAllowance: p.transportAllowance,
      medicalAllowance: p.medicalAllowance,
      overtimeHours: p.overtimeHours,
      overtimeAmount: p.overtimeAmount,
      bonusAmount: p.bonusAmount || 0,
      absenceDays: p.absenceDays,
      absenceDeduction: p.absenceDeduction,
      delayMinutes: p.delayMinutes,
      delayDeduction: p.delayDeduction,
      loanDeduction: p.loanDeduction,
      grossSalary: p.grossSalary,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      status: p.status
    });
    setShowOfficialPayslipModal(true);
  };

  // Filtered List
  const monthPayslips = useMemo(() => {
    return payslips.filter(p => {
      const matchMonth = p.period === selectedMonth;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchQuery = !searchQuery || 
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.civilId.includes(searchQuery) ||
        p.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMonth && matchStatus && matchQuery;
    });
  }, [payslips, selectedMonth, statusFilter, searchQuery]);

  const filteredPayslips = useMemo(() => {
    if (!statFocus || statFocus === 'count') return monthPayslips;
    if (statFocus === 'gross') return monthPayslips.filter((slip) => slip.grossSalary !== 0);
    if (statFocus === 'deductions') return monthPayslips.filter((slip) => slip.totalDeductions !== 0);
    if (statFocus === 'net') return monthPayslips.filter((slip) => slip.netSalary !== 0);
    return monthPayslips;
  }, [monthPayslips, statFocus]);

  const activePayslip = payslips.find(p => p.id === activePayslipId) || null;

  // KPI calculations stay on the month list. The strip click only filters rows.
  const totalNet = monthPayslips.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = monthPayslips.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductionsAll = monthPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);

  const normalizeSettlementEmployee = (emp: any, empLoan?: any) => {
    const basicSalary = Number(emp?.basicSalary || emp?.salary || 0);
    const housingAllowance = Number(emp?.housingAllowance || 0);
    const transportAllowance = Number(emp?.transportAllowance || 0);
    const medicalAllowance = Number(emp?.medicalAllowance || 0);

    return {
      id: emp?.id || '',
      name: emp?.name || (emp as any)?.fullNameAr || (emp as any)?.nameAr || 'موظف',
      fullNameAr: (emp as any)?.fullNameAr || (emp as any)?.nameAr || emp?.name || 'موظف',
      nameAr: (emp as any)?.nameAr || (emp as any)?.fullNameAr || emp?.name || 'موظف',
      employeeCode: (emp as any)?.employeeCode || emp?.id || '',
      companyId: (emp as any)?.companyId || activeCompany?.id || '',
      civilId: emp?.civilId || '',
      jobTitle: emp?.jobTitle || 'موظف',
      department: emp?.department || 'إدارة',
      joinDate: emp?.joinDate || '2022-01-01',
      basicSalary,
      salary: Number((emp as any)?.salary || basicSalary),
      carriedOverBalance: (emp as any)?.carriedOverBalance,
      carriedOverLeave2025: (emp as any)?.carriedOverLeave2025,
      openingBalance: (emp as any)?.openingBalance,
      openingLeaveBalance: (emp as any)?.openingLeaveBalance,
      allowances: (emp as any)?.allowances ?? (basicSalary + housingAllowance + transportAllowance + medicalAllowance),
      housingAllowance,
      transportAllowance,
      medicalAllowance,
      activeLoanRemaining: empLoan ? empLoan.remainingAmount : 0
    };
  };

  // EOS employee dataset - single source of truth for settlement and payroll computations
  const settlementEmployees = useMemo(() => {
    return employees.map(emp => {
      const empLoan = loans.find(l => l.employeeId === emp.id && l.remainingAmount > 0);
      return normalizeSettlementEmployee(emp, empLoan);
    });
  }, [employees, loans, activeCompany?.id]);

  const payrollContracts = useMemo((): Contract[] => {
    const companyId = activeCompany?.id || '';
    return employees.map(emp => {
      const e = emp as Record<string, unknown>;
      return {
        id: `payroll-contract-${emp.id}`,
        employeeId: emp.id,
        companyId,
        basicSalary: Number(e.basicSalary ?? 0),
        housingAllowance: Number(e.housingAllowance ?? 0),
        transportAllowance: Number(e.transportAllowance ?? 0),
        otherAllowance: Number(e.medicalAllowance ?? 0),
        contractType: 'INDEFINITE',
        startDate: String(e.contractStartDate || e.joinDate || new Date().toISOString().split('T')[0]),
        noticePeriodDays: 90,
        status: 'RUNNING'
      };
    });
  }, [employees, activeCompany?.id]);

  const hideLoanPaidColumn = columnAllZero(loans, (loan) => loan.totalAmount - loan.remainingAmount);
  const hideLoanRemainColumn = columnAllZero(loans, (loan) => loan.remainingAmount);
  const showBasicColumn = !columnAllZero(filteredPayslips, (slip) => slip.basicSalary);
  const showOvertimeColumn = !columnAllZero(filteredPayslips, (slip) => slip.overtimeAmount);
  const showDeductionColumn = !columnAllZero(filteredPayslips, (slip) => slip.totalDeductions);
  const payslipColumns: DataTableColumn<PayslipItem>[] = [
    { id: 'number', header: 'رقم المسير', cell: (slip) => slip.payslipNumber },
    { id: 'employee', header: 'الموظف', cell: (slip) => slip.employeeName },
    {
      id: 'civil',
      header: 'الرقم المدني',
      cell: (slip) => <MaskedValue kind="civil" value={slip.civilId} purpose="payroll-list" />,
    },
    ...(showBasicColumn
      ? [{
          id: 'basic',
          header: 'الأساسي',
          money: true,
          cell: (slip: PayslipItem) => slip.basicSalary,
          total: (rows: readonly PayslipItem[]) => rows.reduce((sum, row) => sum + row.basicSalary, 0),
        } satisfies DataTableColumn<PayslipItem>]
      : []),
    ...(showOvertimeColumn
      ? [{
          id: 'overtime',
          header: 'الإضافي',
          money: true,
          cell: (slip: PayslipItem) => slip.overtimeAmount,
          total: (rows: readonly PayslipItem[]) => rows.reduce((sum, row) => sum + row.overtimeAmount, 0),
        } satisfies DataTableColumn<PayslipItem>]
      : []),
    ...(showDeductionColumn
      ? [{
          id: 'deductions',
          header: 'الاستقطاعات',
          money: true,
          cell: (slip: PayslipItem) => slip.totalDeductions,
          total: (rows: readonly PayslipItem[]) => rows.reduce((sum, row) => sum + row.totalDeductions, 0),
        } satisfies DataTableColumn<PayslipItem>]
      : []),
    {
      id: 'net',
      header: 'الصافي',
      money: true,
      cell: (slip) => slip.netSalary,
      total: (rows) => rows.reduce((sum, row) => sum + row.netSalary, 0),
    },
    {
      id: 'status',
      header: 'الحالة',
      cell: (slip) => {
        const label = payslipStatusLabel(slip, payslips);
        if (label === 'ملغى') return <StatusBadge tone="danger">{label}</StatusBadge>;
        if (label === 'قيد المراجعة') return <StatusBadge tone="warning">{label}</StatusBadge>;
        return label;
      },
    },
    {
      id: 'actions',
      header: 'إجراءات',
      cell: (slip) => (
        <RowActions
          actions={[
            { id: 'view', label: 'عرض', icon: Eye, onSelect: () => setActivePayslipId(slip.id) },
            { id: 'pdf', label: 'قسيمة', icon: Printer, onSelect: () => handleOpenPrintModal(slip) },
          ]}
          menu={
            slip.reversalOfId || payslipHasReversal(payslips, slip.id)
              ? []
              : [
                  slip.status === 'draft'
                    ? { id: 'delete', label: 'حذف المسودة', onSelect: () => requestPayslipRemoval(slip) }
                    : { id: 'reverse', label: 'إلغاء بقيد عكسي', onSelect: () => requestPayslipRemoval(slip) },
                ]
          }
        />
      ),
    },
  ];

  const payrollTabs: { id: typeof activeSubTab; label: string }[] = [
    { id: 'payslips', label: 'مسيرات الرواتب' },
    { id: 'wps', label: 'حماية الأجور' },
    { id: 'loans', label: 'السلف والأقساط' },
    { id: 'settlements', label: 'التسويات ونهاية الخدمة' },
    { id: 'leave_finance', label: 'تسويات الإجازات' },
  ];

  const payrollPrimary = activePayslip
    ? { label: 'طباعة القسيمة', onClick: () => handleOpenPrintModal(activePayslip) }
    : activeSubTab === 'wps'
      ? { label: 'تنزيل ملف التحويل', onClick: () => setShowWpsAuditModal(true) }
      : activeSubTab === 'loans'
        ? { label: 'تسجيل سلفة', onClick: () => setShowLoanModal(true) }
        : activeSubTab === 'settlements'
          ? { label: 'مخالصة نهاية الخدمة', onClick: () => setShowFinalSettlementModal(true) }
          : activeSubTab === 'leave_finance'
            ? {
                label: 'عرض التسويات',
                onClick: () => document.getElementById('leave-finance-panel')?.scrollIntoView({ block: 'start' }),
              }
            : { label: 'إنشاء مسير', onClick: () => setShowNewPayslipModal(true) };

  const payrollMenu = [
    ...(activePayslip
      ? [
          { id: 'back', label: 'العودة للمسيرات', onSelect: () => setActivePayslipId(null) },
          { id: 'recompute', label: 'إعادة الحساب', onSelect: () => void handleRecomputePayslip(activePayslip.id) },
          ...(activePayslip.reversalOfId || payslipHasReversal(payslips, activePayslip.id)
            ? []
            : [
                activePayslip.status === 'draft'
                  ? { id: 'delete-open', label: 'حذف المسودة', onSelect: () => requestPayslipRemoval(activePayslip) }
                  : { id: 'reverse-open', label: 'إلغاء بقيد عكسي', onSelect: () => requestPayslipRemoval(activePayslip) },
              ]),
        ]
      : []),
    { id: 'structure', label: 'هيكل الأجور', onSelect: () => setShowPayrollWizard(true) },
    { id: 'pull', label: 'سحب حركات الدوام', onSelect: () => generateInitialPayslips() },
    { id: 'wps-check', label: 'فحص حماية الأجور', onSelect: () => setShowWpsAuditModal(true) },
    ...(!activePayslip && (activeSubTab === 'settlements' || activeSubTab === 'leave_finance')
      ? [
          { id: 'eos-rules', label: 'لائحة نهاية الخدمة', onSelect: () => setShowEosWizard(true) },
          { id: 'eos-engine', label: 'محرك نهاية الخدمة', onSelect: () => setShowEosEngineModal(true) },
        ]
      : []),
  ];

  return (
    <div className="odoo-app-surface space-y-5 font-sans text-right text-slate-800 animate-fade-in" dir={dir} data-ui-surface="payroll">
      
      <PageHeader
        title={t('payroll')}
        subtitle={activePayslip ? activePayslip.employeeName + ' — ' + activePayslip.payslipNumber : formatPeriodLabel(String(selectedMonth), uiLang)}
        primaryAction={payrollPrimary}
        menu={payrollMenu}
      />
      {!activePayslip && (
        <div className="flex overflow-x-auto border-b bg-white" style={{ borderColor: tokens.color.gray[200], fontFamily: 'var(--font-sans)' }}>
          {payrollTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                paddingInline: tokens.space[3],
                paddingBlock: tokens.space[2],
                fontSize: tokens.text.xs,
                fontWeight: 700,
                color: activeSubTab === tab.id ? tokens.color.primary : tokens.color.gray[500],
                borderBottom: activeSubTab === tab.id ? '2px solid ' + tokens.color.primary : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.id === 'loans' ? <LawTip text={LAW_59_TEXT}>{tab.label}</LawTip> : tab.id === 'settlements' ? <LawTip text={LAW_51_53_TEXT + ' — ' + LAW_70_TEXT}>{tab.label}</LawTip> : tab.id === 'leave_finance' ? <LawTip text={LAW_71_TEXT}>{tab.label}</LawTip> : tab.label}
            </button>
          ))}
        </div>
      )}
      {activeSubTab === 'payslips' && !activePayslip && (
        <StatStrip
          items={[
            { id: 'count', label: 'عدد المسيرات', value: monthPayslips.length, kind: 'count' },
            { id: 'gross', label: 'الإجمالي', value: totalGross, kind: 'money' },
            { id: 'deductions', label: 'الاستقطاعات', value: totalDeductionsAll, kind: 'money' },
            { id: 'net', label: 'الصافي', value: totalNet, kind: 'money' },
          ]}
          activeId={statFocus}
          onSelect={(id) => setStatFocus((current) => (current === id ? undefined : id))}
        />
      )}

      {/* 2. SUBTAB: PAYSLIPS (TREE OR FORM) */}
      {activeSubTab === 'payslips' && (
        <>
          {/* ODOO FORM VIEW FOR SINGLE PAYSLIP */}
          {activePayslip ? (
            <div className="space-y-4">
              {/* Odoo Status Pipeline Banner */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">حالة المسير:</span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'draft')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'draft' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      مسودة
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'review')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'review' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      مراجعة
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'confirmed')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      معتمد
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'paid')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      مصروف
                    </button>
                  </div>
                </div>

                <LawTip text={LAW_66_TEXT}>
                  <span className="text-xs text-slate-500">مرجع العمل الإضافي</span>
                </LawTip>
              </div>

              {/* Payslip Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activePayslip.employeeName}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      كود: {activePayslip.employeeId} | الرقم المدني: <MaskedValue kind="civil" value={activePayslip.civilId} /> | الوظيفة: {activePayslip.jobTitle}
                    </p>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-xs text-slate-500 block">صافي الراتب المستحق للصرف</span>
                    <span className="text-2xl font-black text-emerald-600">{activePayslip.netSalary.toFixed(3)} د.ك</span>
                  </div>
                </div>

                {/* Form Tabs */}
                <div className="flex border-b border-slate-200 text-xs font-bold gap-4">
                  <button
                    onClick={() => setFormActiveTab('computation')}
                    className={`pb-2.5 transition cursor-pointer ${
                      formActiveTab === 'computation' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    احتساب الراتب
                  </button>
                  <button
                    onClick={() => setFormActiveTab('wps_bank')}
                    className={`pb-2.5 transition cursor-pointer ${
                      formActiveTab === 'wps_bank' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    بيانات البنك وحماية الأجور
                  </button>
                  <button
                    onClick={() => setFormActiveTab('work_entries')}
                    className={`pb-2.5 transition cursor-pointer ${
                      formActiveTab === 'work_entries' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    حركات الدوام والغياب
                  </button>
                </div>

                {/* Tab 1: Computation Table */}
                {formActiveTab === 'computation' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <div className="font-bold text-slate-900 border-b pb-1 text-emerald-800">الاستحقاقات (Earnings)</div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">الراتب الأساسي:</span>
                        <strong className="font-mono">{activePayslip.basicSalary.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">بدل سكن:</span>
                        <strong className="font-mono">{activePayslip.housingAllowance.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">بدل انتقال:</span>
                        <strong className="font-mono">{activePayslip.transportAllowance.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">بدل هاتف / طبي:</span>
                        <strong className="font-mono">{activePayslip.medicalAllowance.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 text-emerald-700">
                        <span className="font-bold">أجر العمل الإضافي ({activePayslip.overtimeHours} س):</span>
                        <strong className="font-mono font-bold">+{activePayslip.overtimeAmount.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black text-slate-900">
                        <span>إجمالي الراتب الشامل:</span>
                        <span className="font-mono">{activePayslip.grossSalary.toFixed(3)} د.ك</span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <div className="font-bold text-slate-900 border-b pb-1 text-rose-800">الاستقطاعات (Deductions)</div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                        <span>خصم غياب ({activePayslip.absenceDays} أيام):</span>
                        <strong className="font-mono">-{activePayslip.absenceDeduction.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                        <span>خصم تأخيرات ({activePayslip.delayMinutes} دقيقة):</span>
                        <strong className="font-mono">-{activePayslip.delayDeduction.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-rose-700">
                        <span>قسط سلفة شهرية:</span>
                        <strong className="font-mono">-{activePayslip.loanDeduction.toFixed(3)} د.ك</strong>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black text-rose-900">
                        <span>إجمالي الاستقطاعات:</span>
                        <span className="font-mono">-{activePayslip.totalDeductions.toFixed(3)} د.ك</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: WPS Bank Info */}
                {formActiveTab === 'wps_bank' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block">اسم البنك المعتمد:</span>
                        <strong className="text-slate-900">{activePayslip.bankName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">رقم الآيبان (IBAN):</span>
                        <strong className="font-mono tracking-wider text-slate-800">{activePayslip.iban}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الرقم المدني لصاحب الحساب:</span>
                        <strong className="font-mono text-slate-800"><MaskedValue kind="civil" value={activePayslip.civilId} /></strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">حالة التطابق مع راتب الشؤون:</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 size={13} /> مطابق وموثق بنظام حماية الأجور
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Work Entries */}
                {formActiveTab === 'work_entries' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">أساس احتساب الشهر التعاقدي:</span>
                      <strong className="font-bold">26 يوم عمل (المعيار الرسمي في الكويت)</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">أجر اليوم الكامل:</span>
                      <span className="font-mono">{calculateKuwaitDailyRate(activePayslip.basicSalary).toFixed(3)} د.ك / يوم</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">أجر ساعة العمل الأساسية:</span>
                      <span className="font-mono">{calculateKuwaitHourlyRate(calculateKuwaitDailyRate(activePayslip.basicSalary)).toFixed(3)} د.ك / ساعة</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">معامل العمل الإضافي المطبق:</span>
                      <LawTip text={LAW_66_TEXT}><span className="font-bold text-purple-800 font-mono">1.25</span></LawTip>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ODOO TREE / TABLE VIEW FOR ALL PAYSLIPS */
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="odoo-filter-toolbar">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="بحث بالاسم، الرقم المدني، كود المسير..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-slate-400" />
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-bold ml-1">الحالة:</span>
                  {(['all', 'draft', 'review', 'confirmed', 'paid'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                        statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' ? 'الكل' : st === 'draft' ? 'مسودة' : st === 'review' ? 'مراجعة' : st === 'confirmed' ? 'معتمد' : 'مدفوع'}
                    </button>
                  ))}
                </div>
              </div>

              <DataTable
                columns={payslipColumns}
                rows={filteredPayslips}
                rowKey={(slip) => slip.id}
                empty={{
                  message: 'لا توجد مسيرات لهذا الشهر.',
                  actionLabel: 'إنشاء مسير',
                  onAction: () => setShowNewPayslipModal(true),
                }}
              />

            </div>
          )}
        </>
      )}

      {/* 3. SUBTAB: WPS & AUDIT */}
      {activeSubTab === 'wps' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  حماية الأجور وملف التحويل
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  توليد ملف التحويل المصرفي المعتمد من بنك الكويت المركزي وتدقيق مطابقة رواتب إذن العمل.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">
                  {isMohMedicalEstablishment(activeCompany)
                    ? 'ترخيص وزارة الصحة / ملف الشؤون:'
                    : 'رمز المنشأة / السجل التجاري:'}
                </span>
                <strong className="text-sm font-mono text-slate-900 mt-1 block">
                  {employerPamOrEstablishmentCode(printProfile, activeCompany)}
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">يتم استخدامه في ترويسة ملف التحويل المالي</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">إجمالي الرواتب الصافية لشهر ({selectedMonth}):</span>
                <strong className="text-sm font-mono text-emerald-700 mt-1 block">
                  {totalNet.toFixed(3)} د.ك
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">عدد الموظفين المشمولين: {monthPayslips.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">التوافق مع بنك الكويت المركزي:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-1 block">
                  <CheckCircle2 size={14} /> متوافق مع معايير بنك الكويت المركزي والقوى العاملة
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">ملف التحويل يُجهَّز من فحص حماية الأجور</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. SUBTAB: LOANS */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                <LawTip text={LAW_59_TEXT}>السلف والأقساط</LawTip>
              </h3>
            </div>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">رقم السلفة</th>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">إجمالي السلفة</th>
                <th className="p-3.5">القسط الشهري</th>
                {!hideLoanPaidColumn && <th className="p-3.5">ما تم سداده</th>}
                {!hideLoanRemainColumn && <th className="p-3.5">الرصيد المتبقي</th>}
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    لا توجد سلف مالية مسجلة حالياً
                  </td>
                </tr>
              ) : (
                loans.map((ln) => {
                  const emp = employees.find(e => e.id === ln.employeeId);
                  const paidAmt = ln.totalAmount - ln.remainingAmount;
                  const isPaidOff = ln.remainingAmount <= 0;
                  return (
                    <tr key={ln.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-500">{ln.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{emp?.name || '---'}</td>
                      <td className="p-3.5 font-bold font-mono text-slate-800">{ln.totalAmount.toFixed(3)} د.ك</td>
                      <td className="p-3.5 font-bold font-mono text-blue-600">{ln.monthlyInstallment.toFixed(3)} د.ك / شهر</td>
                      {!hideLoanPaidColumn && <td className="p-3.5 font-bold font-mono text-emerald-600">{paidAmt.toFixed(3)} د.ك</td>}
                      {!hideLoanRemainColumn && <td className="p-3.5 font-bold font-mono text-rose-600">{ln.remainingAmount.toFixed(3)} د.ك</td>}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isPaidOff ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isPaidOff ? 'تم السداد بالكامل' : 'جاري الخصم بالراتب'}
                        </span>
                      </td>
                      <td className="p-3.5 flex items-center gap-1">
                        {!isPaidOff && (
                          <button 
                            onClick={() => registerLoanPayment(ln.id, ln.monthlyInstallment)} 
                            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md hover:bg-emerald-50 transition cursor-pointer" 
                            title="تسجيل سداد قسط يدوي"
                          >
                            سداد قسط
                          </button>
                        )}
                        {paidAmt === 0 && (
                          <button
                            type="button"
                            onClick={() => setDeleteLoanId(ln.id)}
                            className="text-slate-600 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                          >
                            حذف المسودة
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. SUBTAB: SETTLEMENTS & EOS */}
      {activeSubTab === 'leave_finance' && (
        <div id="leave-finance-panel">
          <TimeOffPayrollFinancePanel highlightAdvanceRequestId={highlightLeaveAdvanceRequestId} />
        </div>
      )}

      {activeSubTab === 'settlements' && (
        <div className="odoo-master-form-sheet grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
          {/* Card 1: Final Settlement & Discharge */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                <FileText size={20} />
                <h3 className="text-base font-black text-slate-900">مخالصة نهاية الخدمة وإبراء الذمة العمالي الشامل</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <LawTip text={LAW_51_53_TEXT}>المادتان 51 و53</LawTip>
                {' — '}
                <LawTip text={LAW_70_TEXT}>المادة 70</LawTip>
                . المخالصة والمحرك من قائمة المزيد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW PAYSLIP --- */}
      {showNewPayslipModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="text-primary" size={18} />
                إنشاء قسيمة راتب جديدة لشهر {newForm.period || selectedMonth}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNewPayslipModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewPayslip} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">شهر القسيمة (مستقل عن شهر الشاشة):</label>
                <input
                  type="month"
                  value={newForm.period}
                  onChange={async (e) => {
                    const nextPeriod = e.target.value;
                    setNewForm(prev => ({ ...prev, period: nextPeriod }));
                    await refreshNewPayslipPeriodStatus(nextPeriod);
                    if (newForm.employeeId) {
                      await handleSelectEmployeeForPayslip(newForm.employeeId, nextPeriod);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 outline-none focus:border-primary"
                />
                <div className="mt-2">
                  {newPayslipPeriodStatus.isLoading ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      جاري التحقق من ترحيل الشهر...
                    </span>
                  ) : newPayslipPeriodStatus.hasPostedRollup ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      تم ترحيل الشهر ({newPayslipPeriodStatus.employeesCount} موظف) {newPayslipPeriodStatus.isLocked ? 'ومقفّل رسميًا' : 'وغير مقفّل'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      الشهر غير مُرحّل بعد. لا يمكن إنشاء القسيمة قبل الترحيل من شاشة الحضور.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف (تعبئة تلقائية للراتب والبدلات):</label>
                <select
                  value={newForm.employeeId}
                  onChange={(e) => {
                    void handleSelectEmployeeForPayslip(e.target.value, newForm.period || selectedMonth);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-primary"
                >
                  <option value="">-- اختر من موظفي المنشأة --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.jobTitle || 'موظف'}) - راتب: {emp.basicSalary || 600} د.ك
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموظف *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الموظف الثلاثي"
                    value={newForm.employeeName}
                    onChange={(e) => setNewForm({ ...newForm, employeeName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني (12 رقم) *</label>
                  <MaskedCivilField
                    maxLength={12}
                    placeholder="الرقم المدني"
                    value={newForm.civilId}
                    onChange={(val) => setNewForm({ ...newForm, civilId: val })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البنك المعتمد:</label>
                  <select
                    value={newForm.bankName}
                    onChange={(e) => setNewForm({ ...newForm, bankName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-bold outline-none focus:border-primary"
                  >
                    <option value="بنك الكويت الوطني (NBK)">بنك الكويت الوطني (NBK)</option>
                    <option value="بيت التمويل الكويتي (KFH)">بيت التمويل الكويتي (KFH)</option>
                    <option value="بنك بوبيان (Boubyan)">بنك بوبيان (Boubyan)</option>
                    <option value="بنك الخليج (Gulf Bank)">بنك الخليج (Gulf Bank)</option>
                    <option value="بنك برقان (Burgan)">بنك برقان (Burgan)</option>
                    <option value="البنك التجاري الكويتي (CBK)">البنك التجاري الكويتي (CBK)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الآيبان (IBAN):</label>
                  <input
                    type="text"
                    placeholder="رقم IBAN الفعلي"
                    value={newForm.iban}
                    onChange={(e) => setNewForm({ ...newForm, iban: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-primary"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Salary Breakdown Inputs */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">بنود الراتب التعاقدي (د.ك):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">الأساسي *</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={newForm.basicSalary}
                      onChange={(e) => setNewForm({ ...newForm, basicSalary: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">بدل السكن</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newForm.housingAllowance}
                      onChange={(e) => setNewForm({ ...newForm, housingAllowance: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">بدل الانتقال</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newForm.transportAllowance}
                      onChange={(e) => setNewForm({ ...newForm, transportAllowance: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">ساعات الإضافي (من ترحيل الشهر)</label>
                    <input
                      type="number"
                      value={newForm.overtimeHours}
                      readOnly
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">أيام الغياب (من ترحيل الشهر)</label>
                    <input
                      type="number"
                      value={newForm.absenceDays}
                      readOnly
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">دقائق التأخير (من ترحيل الشهر)</label>
                    <input
                      type="number"
                      value={newForm.delayMinutes}
                      readOnly
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewPayslipModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={newPayslipPeriodStatus.isLoading || !newPayslipPeriodStatus.hasPostedRollup}
                  className="px-5 py-2 bg-primary hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إنشاء المسير
                </button>
              </div>

              {(newPayslipPeriodStatus.isLoading || !newPayslipPeriodStatus.hasPostedRollup) && (
                <div className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {newPayslipPeriodStatus.isLoading
                    ? 'تعذر إنشاء القسيمة حالياً: يتم التحقق من حالة ترحيل الشهر المختار.'
                    : 'تعذر إنشاء القسيمة: الشهر المختار غير مُرحّل بعد من شاشة الحضور.'}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW LOAN --- */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="text-primary" size={18} />
                تسجيل سلفة مالية جديدة
              </h3>
              <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddLoan} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الموظف</label>
                <select
                  required
                  value={newLoan.employeeId}
                  onChange={(e) => setNewLoan({ ...newLoan, employeeId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">إجمالي مبلغ السلفة (د.ك)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.001"
                  value={newLoan.totalAmount}
                  onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  placeholder="مثال: 500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  <LawTip text={LAW_59_TEXT}>القسط الشهري</LawTip>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.001"
                  value={newLoan.monthlyInstallment}
                  onChange={(e) => setNewLoan({ ...newLoan, monthlyInstallment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-700"
                  placeholder="مثال: 50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ بداية السلفة</label>
                <input
                  type="date"
                  required
                  value={newLoan.startDate}
                  onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
                >
                  اعتماد وتأكيد السلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 1: OFFICIAL PAYSLIP PRINT MODAL --- */}
      {showOfficialPayslipModal && payslipToPrint && (
        <OfficialPayslipPrintModal
          payslip={payslipToPrint}
          company={companyForPrint}
          onClose={() => {
            setShowOfficialPayslipModal(false);
            setPayslipToPrint(null);
          }}
        />
      )}

      {/* --- MODAL 2: KUWAIT WPS COMPLIANCE & AUDIT SHIELD --- */}
      {showWpsAuditModal && (
        <WpsAuditShieldModal
          payslips={monthPayslips.map(p => ({
            id: p.id,
            payslipNumber: p.payslipNumber,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            civilId: p.civilId,
            bankName: p.bankName,
            iban: p.iban,
            basicSalary: p.basicSalary,
            contractSalary: p.basicSalary + p.housingAllowance,
            netSalary: p.netSalary,
            totalDeductions: p.totalDeductions,
            status: p.status
          }))}
          period={selectedMonth}
          company={companyForPrint}
          companyInfo={{
            nameAr: printProfile.displayNameAr,
            nameEn: printProfile.displayNameEn,
            crNumber: employerPamOrEstablishmentCode(printProfile, activeCompany),
            employerMosaCode: employerPamOrEstablishmentCode(printProfile, activeCompany),
            bankName: activeCompany?.bankName || '—',
            accountNumber: activeCompany?.accountNumber || '—',
            iban: activeCompany?.iban || ''
          }}
          onClose={() => setShowWpsAuditModal(false)}
        />
      )}

      {/* --- MODAL 3: FINAL SETTLEMENT & DISCHARGE (EOS) --- */}
      {showFinalSettlementModal && (
        <FinalSettlementModal
          employees={settlementEmployees}
          leaveRequests={leaveRequests}
          leaveAllocations={leaveAllocations}
          leaveSettlements={leaveSettlements}
          company={companyForPrint}
          initialEmployeeId={initialSettlementEmployeeId}
          onClose={() => setShowFinalSettlementModal(false)}
        />
      )}

      {/* --- MODAL 4: PAYROLL STRUCTURE WIZARD --- */}
      <PayrollStructureWizardModal
        isOpen={showPayrollWizard}
        onClose={() => setShowPayrollWizard(false)}
      />

      {/* --- MODAL 6: EOS SETUP WIZARD --- */}
      <EosSetupWizardModal
        isOpen={showEosWizard}
        onClose={() => setShowEosWizard(false)}
      />

      {showEosEngineModal && activeCompany && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-slate-100">
          <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-xs">
            <h2 className="text-sm font-black text-slate-900">محرك نهاية الخدمة</h2>
            <button
              type="button"
              onClick={() => setShowEosEngineModal(false)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <EOSApp
              employees={employees as Employee[]}
              contracts={payrollContracts}
              leaves={leaveRequests as any}
              activeCompany={activeCompany}
              onSaveEmployee={(emp) => {
                TenantDatabaseService.saveEmployee(emp as any, activeCompany.id).catch(console.error);
              }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDraftId !== null}
        title="حذف مسودة المسير"
        message="يُحذف المسير وهو ما زال مسودة. المعتمد والمصروف لا يُحذفان من هنا."
        confirmWord="حذف"
        confirmLabel="حذف المسودة"
        onConfirm={confirmDeleteDraftPayslip}
        onCancel={() => setDeleteDraftId(null)}
      />
      <ConfirmDialog
        open={deleteLoanId !== null}
        title="حذف مسودة السلفة"
        message="الحذف متاح فقط قبل أي سداد. السلفة التي سُدد منها قسط تبقى في السجل."
        confirmWord="حذف"
        confirmLabel="حذف المسودة"
        onConfirm={() => {
          if (deleteLoanId) void deleteLoan(deleteLoanId);
          setDeleteLoanId(null);
        }}
        onCancel={() => setDeleteLoanId(null)}
      />
      <Modal
        open={reverseTargetId !== null}
        onClose={() => {
          setReverseTargetId(null);
          setReverseReason('');
        }}
        title="إلغاء بقيد عكسي"
        subtitle="اكتب سبب الإلغاء. المبالغ المخزنة تُنسخ بإشارة معاكسة بلا إعادة احتساب."
        footer={
          <button
            type="button"
            disabled={!reverseReason.trim()}
            onClick={confirmReversePayslip}
            style={{
              background: tokens.color.danger,
              color: '#ffffff',
              paddingInline: tokens.space[3],
              paddingBlock: tokens.space[2],
              borderRadius: tokens.radius.md,
              fontSize: tokens.text.xs,
              fontWeight: 700,
              opacity: reverseReason.trim() ? 1 : 0.45,
            }}
          >
            ترحيل القيد العكسي
          </button>
        }
      >
        <label className="block" style={{ color: tokens.color.gray[700], fontSize: tokens.text.xs }}>
          السبب
          <textarea
            value={reverseReason}
            onChange={(event) => setReverseReason(event.target.value)}
            className="block w-full border bg-white"
            style={{
              marginBlockStart: tokens.space[1],
              paddingInline: tokens.space[2],
              paddingBlock: tokens.space[2],
              borderColor: tokens.color.gray[200],
              borderRadius: tokens.radius.md,
              minHeight: '5rem',
            }}
          />
        </label>
      </Modal>
    </div>
  );
};

export default OdooPayrollApp;
