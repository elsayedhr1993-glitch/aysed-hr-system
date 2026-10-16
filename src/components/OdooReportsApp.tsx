import React, { useState, useMemo, useEffect } from 'react';
import { LauncherExecutiveCharts } from './launcher/LauncherExecutiveCharts';
import {
  BarChart3,
  Printer,
  FileSpreadsheet,
  Users,
  CreditCard,
  Calendar,
  ShieldCheck,
  DollarSign,
  Plane,
  CheckCircle2,
  PieChart,
  Table,
  Layers,
  Sparkles,
  Search,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useCompanyForPrint } from '../hooks/useCompanyForPrint';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { exportToExcel } from '../utils/exportUtils';
import { buildAuthedJsonHeaders } from '../lib/clientAuth';
import { PageHeader } from './ui/PageHeader';
import { StatStrip, type StatItem } from './ui/StatStrip';
import { FilterBar } from './ui/FilterBar';
import { tokens } from '../design/tokens';
import { isPayrollReport, reportMonthOptions, visibleReportIds } from './reports/reportsAccess';
import { OdooOfficialA4PrintModal } from './reports/OdooOfficialA4PrintModal';
import { UiStudioReportHeadRow } from './studio/UiStudioReportHeadRow';
import { UiStudioTableCell } from './studio/UiStudioTableCell';
import { UiStudioTarget } from './studio/UiStudioTarget';
import {
  ATTENDANCE_OT_COLUMNS,
  EOS_ACCRUAL_COLUMNS,
  GOV_COMPLIANCE_COLUMNS,
  LEAVES_LIABILITY_COLUMNS,
  REPORT_NAV_ITEMS,
  WPS_RECONCILIATION_COLUMNS,
} from '../config/uiStudio/reportColumns';
import { UI_KEYS } from '../utils/uiStudioKeys';
import { getEmployeeLeaveBalanceView } from '../utils/leaveEngine';
import type { LeaveSettlementVoucher } from '../types';
import { computeNetPayrollFromComponents } from '../utils/kuwaitPayrollMath';
import {
  REPORTS_MISSING,
  MonthlyAttendanceRollupEntry,
  ReportsPayslipSnapshot,
  daysUntilExpiry,
  isActiveReportEmployee,
  pickEmployeeText,
  resolveComplianceStatus,
  resolveWpsStatus,
} from '../utils/reportsPeriodData';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MaskedValue } from './security/MaskedValue';

function mapFirestorePayslip(raw: Record<string, unknown>): ReportsPayslipSnapshot {
  const basicSalary = Number(raw.basicSalary || 0);
  const housingAllowance = Number(raw.housingAllowance || 0);
  const transportAllowance = Number(raw.transportAllowance || 0);
  const medicalAllowance = Number(raw.medicalAllowance || 0);
  const grossSalary = Number(
    raw.grossSalary ?? basicSalary + housingAllowance + transportAllowance + medicalAllowance
  );
  const { netSalary } = computeNetPayrollFromComponents({
    grossSalary,
    overtimeAmount: Number(raw.overtimeAmount ?? 0),
    bonusAmount: Number(raw.bonusAmount ?? 0),
    absenceDeduction: Number(raw.absenceDeduction ?? 0),
    delayDeduction: Number(raw.delayDeduction ?? 0),
    loanDeduction: Number(raw.loanDeduction ?? 0),
  });
  return {
    id: String(raw.id || ''),
    employeeId: String(raw.employeeId || ''),
    period: String(raw.period || ''),
    basicSalary,
    housingAllowance,
    transportAllowance,
    medicalAllowance,
    overtimeHours: Number(raw.overtimeHours || 0),
    overtimeAmount: Number(raw.overtimeAmount || 0),
    absenceDays: Number(raw.absenceDays || 0),
    absenceDeduction: Number(raw.absenceDeduction || 0),
    delayMinutes: Number(raw.delayMinutes || 0),
    delayDeduction: Number(raw.delayDeduction || 0),
    loanDeduction: Number(raw.loanDeduction || 0),
    grossSalary,
    netSalary: Number(raw.netSalary ?? netSalary),
    status: String(raw.status || 'draft'),
    wpsFileRef: raw.wpsFileRef ? String(raw.wpsFileRef) : undefined,
    bankName: raw.bankName ? String(raw.bankName) : undefined,
    iban: raw.iban ? String(raw.iban) : undefined,
  };
}

export type ReportCategory = 
  | 'wps_reconciliation'
  | 'gov_compliance'
  | 'eos_indemnity_accrual'
  | 'leaves_financial_liability'
  | 'attendance_overtime_analytics';

export type ViewMode = 'table' | 'pivot' | 'graph';
export type PivotGroupBy = 'department' | 'nationality' | 'jobTitle' | 'cadre' | 'bank';

export interface MedicalEmployeeAnalyticsRecord {
  id: string;
  name: string;
  civilId: string;
  nationality: string;
  isKuwaiti: boolean;
  jobTitle: string;
  cadre: 'طبي بشري' | 'تمريض وتخصصي' | 'خدمات مساندة' | 'إداري ومالي' | 'أمن وسلامة';
  department: string;
  joinDate: string;
  serviceYears: number;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  natureOfWorkAllowance: number;
  otherAllowances: number;
  totalSalary: number;
  
  // WPS & Bank
  bankName: string;
  iban: string;
  wpsStatus: 'مطابق ومحوّل' | 'قيد المراجعة' | 'فروقات غير مسواة';
  wpsBatchNo: string;
  
  // Government & MOH Compliance
  residencyExpiryDate: string;
  residencyDaysLeft: number;
  pamWorkPermitNo: string;
  pamWorkPermitExpiryDate: string;
  pamDaysLeft: number;
  mohLicenseNo: string;
  mohLicenseExpiryDate: string;
  mohDaysLeft: number;
  complianceStatus: 'ساري ومطابق' | 'ينتهي قريباً (<30 يوم)' | 'منتهي الصلاحية' | 'بيانات ناقصة';
  loanDeductionAmount: number;
  hasPayslipForPeriod: boolean;

  // Leaves & Financial Liabilities
  leaveBalance: number;
  consumedLeaveDays: number;
  consumedFromCarried: number;
  consumedFromAccrued: number;
  consumedFromComp: number;
  remainingCarried: number;
  remainingAccrued: number;
  remainingComp: number;
  annualEntitlement: number;
  dailyWage: number;
  leaveCashLiability: number;
  
  // End of Service Indemnity (Accrual Article 51 & 53)
  eosAccruedAmount: number;

  // Attendance, Overtime & Deductions
  overtimeHours: number;
  overtimeAmount: number;
  delayMinutes: number;
  delayDeductionAmount: number;
  unpaidAbsenceDays: number;
  absenceDeductionAmount: number;
  netPayableSalary: number;
}

export const OdooReportsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { company: companyForPrint } = useCompanyForPrint();
  const { employees: contextEmployees, computedPayslips } = useOdooHierarchy();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);
  const [leaveSettlements, setLeaveSettlements] = useState<LeaveSettlementVoucher[]>([]);
  const [periodPayslips, setPeriodPayslips] = useState<ReportsPayslipSnapshot[]>([]);
  const [monthlyRollup, setMonthlyRollup] = useState<Record<string, MonthlyAttendanceRollupEntry>>({});

  // الحالة العامة للتنقل بين التقارير والمحاور
  const [activeReport, setActiveReport] = useState<ReportCategory>('wps_reconciliation');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [pivotGroupBy, setPivotGroupBy] = useState<PivotGroupBy>('department');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [selectedPeriodMonth, setSelectedPeriodMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [isA4ModalOpen, setIsA4ModalOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [payrollAllowed, setPayrollAllowed] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const headers = await buildAuthedJsonHeaders();
        const response = await fetch('/api/reports/access', { headers });
        const payload = await response.json().catch(() => ({}));
        if (live) setPayrollAllowed(response.ok && payload?.payroll === true);
      } catch {
        if (live) setPayrollAllowed(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!payrollAllowed && isPayrollReport(activeReport)) {
      setActiveReport('gov_compliance');
    }
  }, [payrollAllowed, activeReport]);

  const companyDisplayName = activeCompany?.nameAr || activeCompany?.name || '';
  const companyCivilId =
    pickEmployeeText(activeCompany?.civilIdCompany || activeCompany?.civilId, REPORTS_MISSING);
  const companyMohLicense = pickEmployeeText(activeCompany?.mohLicense, REPORTS_MISSING);

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
    }, error => console.error('Failed to load leave requests for reports:', error));
    const unsubscribeAllocations = onSnapshot(allocationsQuery, snapshot => {
      setLeaveAllocations(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
    }, error => console.error('Failed to load leave allocations for reports:', error));
    const unsubscribeSettlements = onSnapshot(
      settlementsQuery,
      (snapshot) => {
        setLeaveSettlements(
          snapshot.docs.map((item) => ({ ...(item.data() as LeaveSettlementVoucher), id: item.id }))
        );
      },
      (error) => console.error('Failed to load leave settlements for reports:', error)
    );

    return () => {
      unsubscribeRequests();
      unsubscribeAllocations();
      unsubscribeSettlements();
    };
  }, [activeCompany?.id]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) {
      setPeriodPayslips([]);
      return;
    }
    return onSnapshot(
      collection(db, 'payslips'),
      (snapshot) => {
        const rows = snapshot.docs
          .filter((item) => String(item.data().companyId || '') === companyId)
          .map((item) => mapFirestorePayslip({ ...item.data(), id: item.id }));
        setPeriodPayslips(rows);
      },
      (error) => console.error('Failed to load payslips for reports:', error)
    );
  }, [activeCompany?.id]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId || !selectedPeriodMonth) {
      setMonthlyRollup({});
      return;
    }
    return onSnapshot(
      doc(db, 'attendance_monthly_rollups', `${companyId}_${selectedPeriodMonth}`),
      (snapshot) => {
        setMonthlyRollup((snapshot.data()?.summaries || {}) as Record<string, MonthlyAttendanceRollupEntry>);
      },
      () => setMonthlyRollup({})
    );
  }, [activeCompany?.id, selectedPeriodMonth]);

  // قاعدة بيانات الكادر الشاملة من موظفي النظام الحقيقيين ومسيرات/ترحيل الحضور للفترة
  const analyticsData: MedicalEmployeeAnalyticsRecord[] = useMemo(() => {
    if (!contextEmployees || contextEmployees.length === 0) return [];

    const now = new Date();
    const activeEmployees = contextEmployees.filter((e) => isActiveReportEmployee(e as Record<string, unknown>));

    return activeEmployees.map((emp: any) => {
      const basic = Number(emp.basicSalary || emp.salary || 0);
      const housing = Number(emp.housingAllowance || 0);
      const transport = Number(emp.transportAllowance || 0);
      const nature = Number(emp.natureOfWorkAllowance || 0);
      const other = Number(emp.medicalAllowance || emp.otherAllowance || 0);
      const total = basic + housing + transport + nature + other;
      const isKw = !!emp.isKuwaiti || emp.nationality?.includes('كويت');
      
      // احتساب مدة الخدمة الفعلية وتاريخ بداية العقد
      const joinDateStr = emp.joinDate || emp.contractStartDate || emp.date_start || '2026-01-01';
      const joinDateObj = new Date(joinDateStr);
      const elapsedDays = Math.max(0, (now.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24));
      const serviceYears = elapsedDays / 365.25;

      const normalizedAllocations = leaveAllocations.map((allocation: any) => ({
        ...allocation,
        numberOfDays: Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0,
        consumedDays: Number(allocation.consumedDays || 0) || 0,
        remainingDays: allocation.remainingDays !== undefined
          ? Number(allocation.remainingDays) || 0
          : Math.max(0, (Number(allocation.numberOfDays ?? allocation.days ?? 0) || 0) - (Number(allocation.consumedDays || 0) || 0)),
        allocationType: allocation.allocationType || 'regular',
        state: allocation.state || 'validate',
        name: allocation.name || allocation.notes,
        dateFrom: allocation.dateFrom || allocation.allocationDate || '2026-01-01'
      }));
      const empLeaves = leaveRequests.filter((l: any) =>
        String(l.employeeId || '') === String(emp.id || '') ||
        (emp.employeeCode && l.employeeId === emp.employeeCode)
      );
      const leaveSummary = getEmployeeLeaveBalanceView(
        emp as any,
        normalizedAllocations as any,
        empLeaves as any,
        leaveSettlements
      );
      const consumedDays = Number(leaveSummary.totalDeductedDays || leaveSummary.usedLeaveDays || 0);
      const leaveBal = Number(leaveSummary.displayNetBalance || 0);

      // أجر اليوم الواحد وفق معيار الـ 26 يوم عمل (المادتين 70 و 71)
      const dailyWage = Number(leaveSummary.dailyWageRate || 0);
      const leaveCashLiability = Number(leaveSummary.cashSettlementAmount || 0);

      // احتساب مخصص مكافأة نهاية الخدمة المتراكم (المادة 51)
      let eosAccruedAmount = 0;
      if (!isKw && total > 0 && serviceYears > 0) {
        if (serviceYears <= 5) {
          // أول 5 سنوات: 15 يوماً عن كل سنة خدمة
          eosAccruedAmount = serviceYears * 15 * dailyWage;
        } else {
          // ما بعد 5 سنوات: 15 يوماً للخمس سنوات الأولى + شهر كامل عن كل سنة إضافية
          const first5Years = 5 * 15 * dailyWage;
          const remainingYears = (serviceYears - 5) * total;
          eosAccruedAmount = first5Years + remainingYears;
        }
        // الحد الأقصى للمكافأة: أجر 18 شهراً كحد أقصى
        const maxCap = total * 18;
        if (eosAccruedAmount > maxCap) {
          eosAccruedAmount = maxCap;
        }
      }

      const resExpiryRaw =
        emp.residencyExpiryDate ||
        (emp as any).residencyExpiry ||
        (emp as any).civilIdExpiry ||
        (emp as any).civilIdExpiryDate;
      const pamExpiryRaw = emp.pamWorkPermitExpiryDate || (emp as any).pamPermitExpiry;
      const mohExpiryRaw = emp.mohLicenseExpiryDate || (emp as any).mohExpiry;

      const resExpiry = isKw ? '' : pickEmployeeText(resExpiryRaw, '');
      const pamExpiry = isKw ? '' : pickEmployeeText(pamExpiryRaw, '');
      const mohExpiry = pickEmployeeText(mohExpiryRaw, '');

      const resDaysLeft = isKw ? null : daysUntilExpiry(resExpiry || undefined, now);
      const pamDaysLeft = isKw ? null : daysUntilExpiry(pamExpiry || undefined, now);
      const mohDaysLeft = daysUntilExpiry(mohExpiry || undefined, now);

      const complianceStatus = resolveComplianceStatus(
        isKw,
        resExpiry || undefined,
        pamExpiry || undefined,
        mohExpiry || undefined,
        now
      );

      const payslip = periodPayslips.find(
        (p) => p.employeeId === emp.id && p.period === selectedPeriodMonth
      );
      const rollup = monthlyRollup[emp.id];
      const hasMonthlyRollup = Boolean(rollup);
      const compPayslip = computedPayslips?.find((p) => p.employeeId === emp.id);

      const iban = pickEmployeeText(payslip?.iban || emp.iban, '');
      const bankName = pickEmployeeText(payslip?.bankName || emp.bankName, REPORTS_MISSING);

      let otHours = 0;
      let otAmount = 0;
      let delayMin = 0;
      let delayDeduct = 0;
      let absenceDays = 0;
      let absenceDeduct = 0;
      let loanDeduct = 0;
      let netSalary = 0;
      let basicForRow = basic;
      let totalForRow = total;

      if (payslip) {
        basicForRow = payslip.basicSalary;
        totalForRow = payslip.grossSalary;
        otHours = payslip.overtimeHours;
        otAmount = payslip.overtimeAmount;
        delayMin = payslip.delayMinutes;
        delayDeduct = payslip.delayDeduction;
        absenceDays = payslip.absenceDays;
        absenceDeduct = payslip.absenceDeduction;
        loanDeduct = payslip.loanDeduction;
        netSalary = payslip.netSalary;
      } else if (rollup) {
        otHours = Number(rollup.overtimeHours || 0);
        otAmount = Number(rollup.overtimePay || 0);
        delayMin = Number(rollup.lateMinutes || 0);
        delayDeduct = Number(rollup.delayDeduction || 0);
        absenceDays = Number(rollup.unexcusedAbsenceDays || 0);
        absenceDeduct = Number(rollup.absenceDeduction || 0);
        const { netSalary: rollupNet } = computeNetPayrollFromComponents({
          grossSalary: total,
          overtimeAmount: otAmount,
          absenceDeduction: absenceDeduct,
          delayDeduction: delayDeduct,
          loanDeduction: 0,
        });
        netSalary = rollupNet;
      } else if (compPayslip?.netSalary !== undefined) {
        otAmount = compPayslip.overtimeAmount || 0;
        delayDeduct = compPayslip.attendanceDeduction || 0;
        loanDeduct = compPayslip.loanDeduction || 0;
        netSalary = compPayslip.netSalary;
      } else {
        netSalary = Math.max(0, total);
      }

      const wpsStatus = resolveWpsStatus(iban, payslip, hasMonthlyRollup);
      const wpsBatchNo = payslip?.wpsFileRef || (payslip ? `مسير-${selectedPeriodMonth}` : REPORTS_MISSING);

      return {
        id: emp.id || `EMP-${Math.random().toString(36).substring(2, 7)}`,
        name: emp.fullNameAr || emp.name || emp.nameAr || 'موظف',
        civilId: emp.civilId || '',
        nationality: emp.nationality || (isKw ? 'كويتي' : 'مقيم'),
        isKuwaiti: isKw,
        jobTitle: emp.jobTitle || 'موظف',
        cadre: (emp.cadre as any) || 'إداري ومالي',
        department: emp.department || 'إدارة عامة',
        joinDate: joinDateStr,
        serviceYears: Number(serviceYears.toFixed(2)),
        basicSalary: basicForRow,
        housingAllowance: housing,
        transportAllowance: transport,
        natureOfWorkAllowance: nature,
        otherAllowances: other,
        totalSalary: totalForRow,
        bankName,
        iban,
        wpsStatus,
        wpsBatchNo,
        residencyExpiryDate: resExpiry || REPORTS_MISSING,
        residencyDaysLeft: resDaysLeft ?? -1,
        pamWorkPermitNo: pickEmployeeText(emp.pamWorkPermitNo || (emp as any).pamFileNumber, REPORTS_MISSING),
        pamWorkPermitExpiryDate: pamExpiry || REPORTS_MISSING,
        pamDaysLeft: pamDaysLeft ?? -1,
        mohLicenseNo: pickEmployeeText(emp.mohLicenseNo, REPORTS_MISSING),
        mohLicenseExpiryDate: mohExpiry || REPORTS_MISSING,
        mohDaysLeft: mohDaysLeft ?? -1,
        complianceStatus,
        leaveBalance: leaveBal,
        consumedLeaveDays: consumedDays,
        consumedFromCarried: Number(leaveSummary.consumedFromCarried || 0),
        consumedFromAccrued: Number(leaveSummary.consumedFromAccrued || 0),
        consumedFromComp: Number(leaveSummary.consumedFromComp || 0),
        remainingCarried: Number(leaveSummary.remainingCarried || 0),
        remainingAccrued: Number(leaveSummary.remainingAccrued || 0),
        remainingComp: Number(leaveSummary.remainingComp || 0),
        annualEntitlement: Number(((leaveSummary.carriedOverDays || 0) + (leaveSummary.accruedAnnualDays || 0) + (leaveSummary.holidayCompensationDays || 0)).toFixed(2)),
        dailyWage: Number(dailyWage.toFixed(3)),
        leaveCashLiability: Number(leaveCashLiability.toFixed(3)),
        eosAccruedAmount: Number(eosAccruedAmount.toFixed(3)),
        overtimeHours: Number(otHours.toFixed(1)),
        overtimeAmount: Number(otAmount.toFixed(3)),
        delayMinutes: delayMin,
        delayDeductionAmount: Number(delayDeduct.toFixed(3)),
        unpaidAbsenceDays: absenceDays,
        absenceDeductionAmount: Number(absenceDeduct.toFixed(3)),
        loanDeductionAmount: Number(loanDeduct.toFixed(3)),
        netPayableSalary: Number(netSalary.toFixed(3)),
        hasPayslipForPeriod: Boolean(payslip),
      };
    });
  }, [
    contextEmployees,
    computedPayslips,
    selectedPeriodMonth,
    leaveRequests,
    leaveAllocations,
    periodPayslips,
    monthlyRollup,
  ]);

  // تصفية البيانات حسب البحث والأقسام وحالة الامتثال
  const filteredData = useMemo(() => {
    return analyticsData.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.civilId.includes(searchQuery) ||
        item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDept = departmentFilter === 'ALL' || item.department === departmentFilter;
      const matchCompliance = complianceFilter === 'ALL' || item.complianceStatus === complianceFilter;

      return matchSearch && matchDept && matchCompliance;
    });
  }, [analyticsData, searchQuery, departmentFilter, complianceFilter]);

  // إجماليات وإحصائيات عامة
  const totalEmployees = analyticsData.length;
  const totalGrossSalaries = analyticsData.reduce((acc, curr) => acc + curr.totalSalary, 0);
  const totalNetPayable = analyticsData.reduce((acc, curr) => acc + curr.netPayableSalary, 0);
  const totalEosAccrual = analyticsData.reduce((acc, curr) => acc + curr.eosAccruedAmount, 0);
  const totalLeaveLiability = analyticsData.reduce((acc, curr) => acc + curr.leaveCashLiability, 0);
  const totalOvertimeCost = analyticsData.reduce((acc, curr) => acc + curr.overtimeAmount, 0);
  const totalDeductions = analyticsData.reduce((acc, curr) => acc + curr.delayDeductionAmount + curr.absenceDeductionAmount, 0);
  const expiredComplianceCount = analyticsData.filter(e => e.complianceStatus === 'منتهي الصلاحية').length;
  const expiringSoonCount = analyticsData.filter(e => e.complianceStatus === 'ينتهي قريباً (<30 يوم)').length;
  const missingComplianceDataCount = analyticsData.filter(e => e.complianceStatus === 'بيانات ناقصة').length;
  const payslipCoverageCount = analyticsData.filter(e => e.hasPayslipForPeriod).length;
  const wpsReadyCount = analyticsData.filter(e => e.wpsStatus === 'مطابق ومحوّل').length;
  const ibanReadyCount = analyticsData.filter(
    (e) => e.iban && e.iban !== REPORTS_MISSING && e.iban.replace(/\s/g, '').length >= 15
  ).length;

  // استخراج قائمة الأقسام الفريدة
  const departmentsList = useMemo(() => {
    return Array.from(new Set(analyticsData.map(d => d.department)));
  }, [analyticsData]);

  // تجميع البيانات للجدول المحوري (Pivot Table Groups)
  const pivotGroups = useMemo(() => {
    const map = new Map<string, {
      groupKey: string;
      count: number;
      totalBasic: number;
      totalGross: number;
      totalNet: number;
      totalEos: number;
      totalLeaveLiability: number;
      totalOvertimeHours: number;
      totalOvertimeAmount: number;
    }>();

    filteredData.forEach(item => {
      let key = '';
      if (pivotGroupBy === 'department') key = item.department;
      else if (pivotGroupBy === 'nationality') key = item.nationality;
      else if (pivotGroupBy === 'jobTitle') key = item.jobTitle;
      else if (pivotGroupBy === 'cadre') key = item.cadre;
      else if (pivotGroupBy === 'bank') key = item.bankName;

      if (!map.has(key)) {
        map.set(key, {
          groupKey: key,
          count: 0,
          totalBasic: 0,
          totalGross: 0,
          totalNet: 0,
          totalEos: 0,
          totalLeaveLiability: 0,
          totalOvertimeHours: 0,
          totalOvertimeAmount: 0,
        });
      }

      const grp = map.get(key)!;
      grp.count += 1;
      grp.totalBasic += item.basicSalary;
      grp.totalGross += item.totalSalary;
      grp.totalNet += item.netPayableSalary;
      grp.totalEos += item.eosAccruedAmount;
      grp.totalLeaveLiability += item.leaveCashLiability;
      grp.totalOvertimeHours += item.overtimeHours;
      grp.totalOvertimeAmount += item.overtimeAmount;
    });

    return Array.from(map.values());
  }, [filteredData, pivotGroupBy]);

  // دالة تصدير ملفات Excel (.xlsx / CSV) مع كامل دعم العربية
  const handleExportExcel = () => {
    if (isPayrollReport(activeReport) && !payrollAllowed) return;
    let exportRecords: Record<string, any>[] = [];
    const reportTitle = getReportTitle(activeReport);

    if (activeReport === 'wps_reconciliation') {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'المسمى الوظيفي': d.jobTitle,
        'القسم': d.department,
        'الأساسي (د.ك)': Number(d.basicSalary.toFixed(3)),
        'البدلات (د.ك)': Number((d.totalSalary - d.basicSalary).toFixed(3)),
        'الإضافي (د.ك)': Number(d.overtimeAmount.toFixed(3)),
        'الاستقطاعات (د.ك)': Number((d.delayDeductionAmount + d.absenceDeductionAmount + d.loanDeductionAmount).toFixed(3)),
        'خصم السلف (د.ك)': Number(d.loanDeductionAmount.toFixed(3)),
        'صافي الراتب WPS (د.ك)': Number(d.netPayableSalary.toFixed(3)),
        'البنك': d.bankName,
        'الآيبان': d.iban,
        'حالة المسير': d.wpsStatus,
        'فترة المسير': selectedPeriodMonth,
      }));
    } else if (activeReport === 'gov_compliance') {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'الجنسية': d.nationality,
        'المسمى': d.jobTitle,
        'انتهاء الإقامة': d.residencyExpiryDate,
        'أيام الإقامة المتبقية': d.residencyDaysLeft,
        'رقم إذن العمل PAM': d.pamWorkPermitNo,
        'انتهاء إذن العمل': d.pamWorkPermitExpiryDate,
        'ترخيص وزارة الصحة MOH': d.mohLicenseNo,
        'انتهاء ترخيص MOH': d.mohLicenseExpiryDate,
        'حالة الامتثال': d.complianceStatus
      }));
    } else if (activeReport === 'eos_indemnity_accrual') {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'تاريخ التعيين': d.joinDate,
        'سنوات الخدمة': d.serviceYears,
        'الراتب الشامل (د.ك)': Number(d.totalSalary.toFixed(3)),
        'أجر اليوم (÷26)': Number(d.dailyWage.toFixed(3)),
        'مخصص نهاية الخدمة المتراكم (المادة 51)': Number(d.eosAccruedAmount.toFixed(3)),
        'الحد الأقصى (18 شهراً)': Number((d.totalSalary * 18).toFixed(3))
      }));
    } else if (activeReport === 'leaves_financial_liability') {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'الاستحقاق السنوي': d.annualEntitlement,
        'الأيام المستهلكة': d.consumedLeaveDays,
        'الرصيد المتبقي (أيام)': d.leaveBalance,
        'أجر اليوم (÷26)': Number(d.dailyWage.toFixed(3)),
        'الالتزام المالي النقدي لرصيد الإجازة (د.ك)': Number(d.leaveCashLiability.toFixed(3))
      }));
    } else {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'المسمى': d.jobTitle,
        'القسم': d.department,
        'ساعات الإضافي': d.overtimeHours,
        'مبلغ الإضافي (د.ك)': Number(d.overtimeAmount.toFixed(3)),
        'دقائق التأخير': d.delayMinutes,
        'خصم التأخير (د.ك)': Number(d.delayDeductionAmount.toFixed(3)),
        'أيام الغياب': d.unpaidAbsenceDays,
        'خصم الغياب (د.ك)': Number(d.absenceDeductionAmount.toFixed(3)),
        'صافي التكلفة (د.ك)': Number((d.overtimeAmount - d.delayDeductionAmount - d.absenceDeductionAmount).toFixed(3))
      }));
    }

    exportToExcel(exportRecords, `تقرير_${reportTitle}_${selectedPeriodMonth}.xlsx`, reportTitle.slice(0, 30));
  };

  const visibleReports = visibleReportIds(
    REPORT_NAV_ITEMS.map((item) => item.id),
    payrollAllowed,
  );
  const monthChoices = useMemo(() => {
    const options = reportMonthOptions();
    if (!options.some((item) => item.value === selectedPeriodMonth)) {
      return [{ value: selectedPeriodMonth, label: selectedPeriodMonth }, ...options];
    }
    return options;
  }, [selectedPeriodMonth]);
  const reportStats: StatItem[] = [
    { id: 'staff', label: 'إجمالي الكادر', value: totalEmployees },
    ...(payrollAllowed
      ? [
          { id: 'wps', label: 'صافي الرواتب', value: totalNetPayable, kind: 'money' as const },
          { id: 'eos', label: 'نهاية الخدمة', value: totalEosAccrual, kind: 'money' as const },
        ]
      : []),
    { id: 'leave', label: 'التزام الإجازات', value: totalLeaveLiability, kind: 'money' as const },
    { id: 'compliance', label: 'تنبيهات الامتثال', value: expiredComplianceCount + expiringSoonCount },
  ];
  const payrollMoney = (value: number) => (payrollAllowed ? value.toFixed(3) : '—');
  const openPrint = () => {
    if (isPayrollReport(activeReport) && !payrollAllowed) return;
    setIsA4ModalOpen(true);
  };

  const getReportTitle = (key: ReportCategory) => {
    switch (key) {
      case 'wps_reconciliation': return 'تقرير مطابقة مسيرات الرواتب وملفات WPS البنكية';
      case 'gov_compliance': return 'تقرير انتهاء الإقامات وأذونات العمل وتراخيص وزارة الصحة (MOH)';
      case 'eos_indemnity_accrual': return 'تقرير مخصصات نهاية الخدمة التراكمية (Indemnity Accrual - مادة 51)';
      case 'leaves_financial_liability': return 'تقرير الأرصدة السنوية والالتزامات النقدية للإجازات (مادة 70 & 71)';
      case 'attendance_overtime_analytics': return 'تحليل ساعات التأخير والغياب والساعات الإضافية وتكلفتها';
    }
  };

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      <PageHeader
        title="التقارير"
        subtitle={companyDisplayName || getReportTitle(activeReport)}
        primaryAction={{ label: 'تصدير Excel', onClick: handleExportExcel }}
        menu={[
          { id: 'pdf', label: 'طباعة PDF', onSelect: openPrint },
          { id: 'table', label: 'جدول', onSelect: () => setViewMode('table') },
          { id: 'pivot', label: 'جدول محوري', onSelect: () => setViewMode('pivot') },
          { id: 'graph', label: 'رسوم التقرير', onSelect: () => setViewMode('graph') },
        ]}
      />
      <div className="flex items-start" style={{ columnGap: tokens.space[3] }}>
        <aside
          className="hidden w-56 shrink-0 border-e bg-white md:block"
          style={{ borderColor: tokens.color.gray[200], fontFamily: 'var(--font-sans)' }}
        >
          {visibleReports.map((id) => {
            const item = REPORT_NAV_ITEMS.find((entry) => entry.id === id);
            const active = activeReport === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveReport(id as ReportCategory)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'start',
                  paddingInline: tokens.space[3],
                  paddingBlock: tokens.space[2],
                  background: active ? tokens.color.primary : 'transparent',
                  color: active ? '#ffffff' : tokens.color.gray[700],
                  fontSize: tokens.text.xs,
                  fontWeight: 700,
                }}
              >
                {item?.ar || id}
              </button>
            );
          })}
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-1 overflow-x-auto md:hidden">
            {visibleReports.map((id) => {
              const item = REPORT_NAV_ITEMS.find((entry) => entry.id === id);
              return (
                <button key={id} type="button" onClick={() => setActiveReport(id as ReportCategory)} className="shrink-0 rounded-lg border px-2 py-1 text-[11px] font-bold">
                  {item?.ar || id}
                </button>
              );
            })}
          </div>
          <StatStrip
            items={reportStats}
            activeId={activeReport === 'wps_reconciliation' ? 'wps' : activeReport === 'eos_indemnity_accrual' ? 'eos' : activeReport === 'leaves_financial_liability' ? 'leave' : activeReport === 'gov_compliance' ? 'compliance' : undefined}
            onSelect={(id) => {
              if (id === 'wps') setActiveReport('wps_reconciliation');
              if (id === 'eos') setActiveReport('eos_indemnity_accrual');
              if (id === 'leave') setActiveReport('leaves_financial_liability');
              if (id === 'compliance') setActiveReport('gov_compliance');
            }}
          />
          <FilterBar
            search={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="بحث بالاسم أو الرقم المدني أو القسم"
            segments={[{ id: 'all', label: 'الكل', count: filteredData.length }]}
            activeSegment="all"
            onSegment={() => setSearchQuery('')}
            dropdowns={[
              {
                id: 'department',
                label: 'القسم',
                value: departmentFilter,
                onChange: setDepartmentFilter,
                options: [{ value: 'ALL', label: 'كل الأقسام' }, ...departmentsList.map((dept) => ({ value: dept, label: dept }))],
              },
              {
                id: 'month',
                label: 'الفترة',
                value: selectedPeriodMonth,
                onChange: setSelectedPeriodMonth,
                options: monthChoices,
              },
              {
                id: 'compliance',
                label: 'الامتثال',
                value: complianceFilter,
                onChange: setComplianceFilter,
                options: [
                  { value: 'ALL', label: 'كل حالات الامتثال' },
                  { value: 'ساري ومطابق', label: 'ساري ومطابق' },
                  { value: 'ينتهي قريباً (<30 يوم)', label: 'ينتهي قريباً' },
                  { value: 'منتهي الصلاحية', label: 'منتهي الصلاحية' },
                  { value: 'بيانات ناقصة', label: 'بيانات ناقصة' },
                ],
              },
            ]}
          />

      {/* 5. MAIN CONTENT AREA BASED ON VIEW MODE */}

      {/* ------------------------------------------------------------- */}
      {/* 5.A: VIEW MODE 1: ANALYTICAL DATA TABLE (عرض الجدول التفصيلي) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header Description */}
          <div className="p-4 border-b bg-slate-50/70 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck className="text-primary" size={17} />
                {getReportTitle(activeReport)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                بيانات حية ومحدثة ومطابقة لقانون العمل بالقطاع الأهلي الكويتي (عدد السجلات: {filteredData.length})
              </p>
            </div>
            <span className="bg-purple-100 text-primary text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
              {selectedPeriodMonth}{payrollAllowed ? ` · صافي ${payrollMoney(totalNetPayable)} د.ك` : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            {filteredData.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500 font-bold">
                لا توجد سجلات نشطة لهذه الشركة أو لا تطابق الفلاتر الحالية.
              </div>
            )}

            {/* 1. REPORT 1: WPS RECONCILIATION TABLE */}
            {activeReport === 'wps_reconciliation' && payrollAllowed && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <UiStudioReportHeadRow reorderGroupId="report.wps.columns" columns={[...WPS_RECONCILIATION_COLUMNS]} />
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <UiStudioTableCell uiKey="reports.wps.col.emp_code" defaults={{ label: { ar: 'كود الموظف', en: 'Code' } }} className="p-3.5 font-bold text-primary">
                        {emp.id}
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.employee" defaults={{ label: { ar: 'الموظف', en: 'Employee' } }} className="p-3.5">
                        <div className="font-bold text-slate-900 font-sans">{emp.name}</div>
                        <div className="text-[10px] text-slate-400"><MaskedValue kind="civil" value={emp.civilId} /></div>
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.dept" defaults={{ label: { ar: 'القسم', en: 'Dept' } }} className="p-3.5 font-sans">
                        <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                        <div className="text-[10px] text-slate-400">{emp.department}</div>
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.basic" defaults={{ label: { ar: 'الأساسي', en: 'Basic' } }} className="p-3.5 text-left">
                        {emp.basicSalary.toFixed(3)}
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.allowances" defaults={{ label: { ar: 'البدلات', en: 'Allowances' } }} className="p-3.5 text-left text-slate-600">
                        +{(emp.totalSalary - emp.basicSalary).toFixed(3)}
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.extra" defaults={{ label: { ar: 'الإضافي', en: 'Extra' } }} className="p-3.5 text-left text-purple-700">
                        +{emp.overtimeAmount.toFixed(3)}
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.deduction" defaults={{ label: { ar: 'الخصم', en: 'Deduction' } }} className="p-3.5 text-left text-rose-600">
                        -{(emp.delayDeductionAmount + emp.absenceDeductionAmount + emp.loanDeductionAmount).toFixed(3)}
                        {emp.loanDeductionAmount > 0 && (
                          <span className="block text-[9px] text-rose-500 font-sans">سلف: {emp.loanDeductionAmount.toFixed(3)}</span>
                        )}
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.net" defaults={{ label: { ar: 'الصافي', en: 'Net' } }} className="p-3.5 text-left font-black text-emerald-700 text-sm">
                        {emp.netPayableSalary.toFixed(3)} د.ك
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.bank" defaults={{ label: { ar: 'البنك', en: 'Bank' } }} className="p-3.5 font-sans">
                        <div className="text-[11px] font-bold text-slate-800">{emp.bankName}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-[180px]">{emp.iban}</div>
                      </UiStudioTableCell>
                      <UiStudioTableCell uiKey="reports.wps.col.status" defaults={{ label: { ar: 'الحالة', en: 'Status' } }} className="p-3.5 text-center font-sans">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                            emp.wpsStatus === 'مطابق ومحوّل'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : emp.wpsStatus === 'قيد المراجعة'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {emp.wpsStatus === 'مطابق ومحوّل' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                          {emp.wpsStatus}
                        </span>
                      </UiStudioTableCell>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td colSpan={3} className="p-3.5 font-sans text-slate-900">إجمالي مسير الرواتب المعتمد:</td>
                    <td className="p-3.5 text-left">{filteredData.reduce((a, b) => a + b.basicSalary, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left">+{filteredData.reduce((a, b) => a + (b.totalSalary - b.basicSalary), 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-purple-700">+{filteredData.reduce((a, b) => a + b.overtimeAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-rose-600">
                      -{filteredData.reduce((a, b) => a + b.delayDeductionAmount + b.absenceDeductionAmount + b.loanDeductionAmount, 0).toFixed(3)}
                    </td>
                    <td className="p-3.5 text-left text-emerald-800 text-sm font-black">{filteredData.reduce((a, b) => a + b.netPayableSalary, 0).toFixed(3)} د.ك</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* 2. REPORT: GOVERNMENT & MOH COMPLIANCE TABLE */}
            {activeReport === 'gov_compliance' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <UiStudioReportHeadRow reorderGroupId="report.gov.columns" columns={[...GOV_COMPLIANCE_COLUMNS]} />
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono"><MaskedValue kind="civil" value={emp.civilId} /> - {emp.jobTitle}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${emp.isKuwaiti ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                          {emp.nationality}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{emp.cadre}</div>
                      </td>
                      <td className="p-3.5">
                        {emp.isKuwaiti ? (
                          <span className="text-slate-400 font-sans">مواطن كويتي</span>
                        ) : emp.residencyExpiryDate === REPORTS_MISSING ? (
                          <span className="text-slate-400 font-sans">{REPORTS_MISSING}</span>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-800">{emp.residencyExpiryDate}</div>
                            <div
                              className={`text-[10px] font-sans font-bold ${
                                emp.residencyDaysLeft < 0
                                  ? 'text-rose-600'
                                  : emp.residencyDaysLeft < 30
                                    ? 'text-amber-600'
                                    : 'text-emerald-700'
                              }`}
                            >
                              {emp.residencyDaysLeft < 0
                                ? `منتهية منذ ${Math.abs(emp.residencyDaysLeft)} يوماً`
                                : `متبقي ${emp.residencyDaysLeft} يوماً`}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{emp.pamWorkPermitNo}</div>
                        <div className="text-[10px] text-slate-500">ينتهي: {emp.pamWorkPermitExpiryDate}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{emp.mohLicenseNo}</div>
                        <div className="text-[10px] text-slate-500">ينتهي: {emp.mohLicenseExpiryDate}</div>
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        {emp.complianceStatus === 'ساري ومطابق' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 size={11} /> ساري ومطابق
                          </span>
                        )}
                        {emp.complianceStatus === 'ينتهي قريباً (<30 يوم)' && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={11} /> ينتهي قريباً (&lt;30 يوم)
                          </span>
                        )}
                        {emp.complianceStatus === 'منتهي الصلاحية' && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <XCircle size={11} /> منتهي الصلاحية ⚠️
                          </span>
                        )}
                        {emp.complianceStatus === 'بيانات ناقصة' && (
                          <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle size={11} /> بيانات ناقصة
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. REPORT: END OF SERVICE INDEMNITY ACCRUAL TABLE */}
            {activeReport === 'eos_indemnity_accrual' && payrollAllowed && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <UiStudioReportHeadRow reorderGroupId="report.eos.columns" columns={[...EOS_ACCRUAL_COLUMNS]} />
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono"><MaskedValue kind="civil" value={emp.civilId} /> - {emp.jobTitle}</div>
                      </td>
                      <td className="p-3.5">{emp.joinDate}</td>
                      <td className="p-3.5 font-bold font-sans text-slate-800">{emp.serviceYears} سنوات</td>
                      <td className="p-3.5 text-left font-bold">{emp.totalSalary.toFixed(3)}</td>
                      <td className="p-3.5 text-left text-slate-600">{emp.dailyWage.toFixed(3)}</td>
                      <td className="p-3.5 font-sans text-[11px] text-slate-600">
                        {emp.serviceYears <= 5 ? (
                          <span>15 يوماً لكل سنة عن الـ 5 سنوات الأولى</span>
                        ) : (
                          <span>15 يوماً (أول 5 سنوات) + شهر لكل سنة تالية</span>
                        )}
                      </td>
                      <td className="p-3.5 text-left font-black text-purple-800 text-sm">
                        {emp.eosAccruedAmount.toFixed(3)} د.ك
                      </td>
                      <td className="p-3.5 text-left text-slate-400">
                        {(emp.totalSalary * 18).toFixed(3)} د.ك
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td colSpan={3} className="p-3.5 font-sans text-slate-900">إجمالي الالتزام المالي لمخصص نهاية الخدمة المتراكم:</td>
                    <td className="p-3.5 text-left">{filteredData.reduce((a, b) => a + b.totalSalary, 0).toFixed(3)}</td>
                    <td colSpan={2}></td>
                    <td className="p-3.5 text-left text-purple-900 text-base font-black">
                      {filteredData.reduce((a, b) => a + b.eosAccruedAmount, 0).toFixed(3)} د.ك
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* 5. REPORT 5: LEAVES BALANCES & FINANCIAL LIABILITY TABLE */}
            {activeReport === 'leaves_financial_liability' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <UiStudioReportHeadRow reorderGroupId="report.leaves.columns" columns={[...LEAVES_LIABILITY_COLUMNS]} />
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono"><MaskedValue kind="civil" value={emp.civilId} /></div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                        <div className="text-[10px] text-slate-400">{emp.department}</div>
                      </td>
                      <td className="p-3.5 text-center font-bold">{emp.annualEntitlement} يوماً</td>
                      <td className="p-3.5 text-center text-slate-500">{emp.consumedLeaveDays} يوماً</td>
                      <td className="p-3.5 text-center text-[10px] leading-5 text-slate-600 font-sans">
                        <div>خصم: {emp.consumedFromCarried} / {emp.consumedFromAccrued} / {emp.consumedFromComp}</div>
                        <div className="text-slate-400">متبق: {emp.remainingCarried} / {emp.remainingAccrued} / {emp.remainingComp}</div>
                      </td>
                      <td className="p-3.5 text-center font-black text-purple-900 text-sm">{emp.leaveBalance} يوماً</td>
                      <td className="p-3.5 text-left font-bold">{emp.dailyWage.toFixed(3)}</td>
                      <td className="p-3.5 text-left font-black text-amber-700 text-sm">
                        {emp.leaveCashLiability.toFixed(3)} د.ك
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td colSpan={4} className="p-3.5 font-sans text-slate-900">إجمالي الالتزام المالي لبدل رصيد الإجازات لكافة الموظفين:</td>
                    <td className="p-3.5 text-center font-black text-purple-900 text-sm">
                      {filteredData.reduce((a, b) => a + b.leaveBalance, 0).toFixed(1)} يوماً
                    </td>
                    <td></td>
                    <td className="p-3.5 text-left text-amber-800 text-base font-black">
                      {filteredData.reduce((a, b) => a + b.leaveCashLiability, 0).toFixed(3)} د.ك
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* 6. REPORT 6: ATTENDANCE, DELAYS & OVERTIME ANALYTICS */}
            {activeReport === 'attendance_overtime_analytics' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <UiStudioReportHeadRow reorderGroupId="report.attendance.columns" columns={[...ATTENDANCE_OT_COLUMNS]} />
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => {
                    const netImpact = emp.overtimeAmount - emp.delayDeductionAmount - emp.absenceDeductionAmount;
                    return (
                      <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                        <td className="p-3.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono"><MaskedValue kind="civil" value={emp.civilId} /> - {emp.jobTitle}</div>
                        </td>
                        <td className="p-3.5 font-sans">
                          <div className="font-semibold text-slate-800">{emp.department}</div>
                          <div className="text-[10px] text-slate-400">{emp.cadre}</div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-purple-900">{emp.overtimeHours} ساعة</td>
                        <td className="p-3.5 text-left font-bold text-purple-700">+{emp.overtimeAmount.toFixed(3)}</td>
                        <td className="p-3.5 text-center text-slate-600">{emp.delayMinutes} دقيقة</td>
                        <td className="p-3.5 text-left text-rose-600">{emp.delayDeductionAmount > 0 ? `-${emp.delayDeductionAmount.toFixed(3)}` : '0.000'}</td>
                        <td className="p-3.5 text-center text-slate-600">{emp.unpaidAbsenceDays} يوم</td>
                        <td className="p-3.5 text-left text-rose-700">{emp.absenceDeductionAmount > 0 ? `-${emp.absenceDeductionAmount.toFixed(3)}` : '0.000'}</td>
                        <td className="p-3.5 text-left font-black text-sm">
                          <span className={netImpact >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {netImpact >= 0 ? `+${netImpact.toFixed(3)}` : netImpact.toFixed(3)} د.ك
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td colSpan={2} className="p-3.5 font-sans text-slate-900">إجمالي تكاليف واستقطاعات الحضور والورديات:</td>
                    <td className="p-3.5 text-center font-bold">{filteredData.reduce((a, b) => a + b.overtimeHours, 0)} ساعة</td>
                    <td className="p-3.5 text-left text-purple-700 font-bold">+{filteredData.reduce((a, b) => a + b.overtimeAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-center">{filteredData.reduce((a, b) => a + b.delayMinutes, 0)} دقيقة</td>
                    <td className="p-3.5 text-left text-rose-600">-{filteredData.reduce((a, b) => a + b.delayDeductionAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-center">{filteredData.reduce((a, b) => a + b.unpaidAbsenceDays, 0)} يوم</td>
                    <td className="p-3.5 text-left text-rose-700">-{filteredData.reduce((a, b) => a + b.absenceDeductionAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-emerald-800 font-black">
                      {(totalOvertimeCost - totalDeductions).toFixed(3)} د.ك
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5.B: VIEW MODE 2: PIVOT TABLE VIEW (عرض الجدول المحوري) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'pivot' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="text-primary" size={18} />
                الجدول المحوري التفاعلي
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تجميع وتحليل البيانات حسب: <strong className="text-primary">{pivotGroupBy}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pivotGroupBy}
                onChange={(event) => setPivotGroupBy(event.target.value as PivotGroupBy)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold"
                aria-label="تجميع الجدول المحوري"
              >
                <option value="department">القسم</option>
                <option value="nationality">الجنسية</option>
                <option value="jobTitle">المسمى</option>
                <option value="cadre">الكادر</option>
                <option value="bank">البنك</option>
              </select>
              <div className="text-xs font-mono font-bold bg-purple-50 text-primary px-3 py-1.5 rounded-lg border border-purple-200">
                عدد المجموعات التحليلية: {pivotGroups.length}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 font-sans">
                <tr>
                  <th className="p-3.5">المجموعة المحورية ({pivotGroupBy})</th>
                  <th className="p-3.5 text-center">العدد</th>
                  <th className="p-3.5 text-left">إجمالي الأساسي (د.ك)</th>
                  <th className="p-3.5 text-left">إجمالي الشامل (د.ك)</th>
                  <th className="p-3.5 text-left text-emerald-700">صافي الرواتب (WPS)</th>
                  <th className="p-3.5 text-left text-purple-900">مخصص نهاية الخدمة</th>
                  <th className="p-3.5 text-left text-amber-800">التزام الإجازات</th>
                  <th className="p-3.5 text-center">ساعات الإضافي</th>
                  <th className="p-3.5 text-left">تكلفة الإضافي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {pivotGroups.map((grp, idx) => (
                  <tr key={grp.groupKey} className={`hover:bg-purple-50/50 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                    <td className="p-3.5 font-bold text-slate-900 font-sans flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      {grp.groupKey}
                    </td>
                    <td className="p-3.5 text-center font-bold">{grp.count}</td>
                    <td className="p-3.5 text-left">{payrollMoney(grp.totalBasic)}</td>
                    <td className="p-3.5 text-left font-bold">{payrollMoney(grp.totalGross)}</td>
                    <td className="p-3.5 text-left font-black text-emerald-700">{payrollMoney(grp.totalNet)}</td>
                    <td className="p-3.5 text-left font-bold text-purple-900">{payrollMoney(grp.totalEos)}</td>
                    <td className="p-3.5 text-left font-bold text-amber-800">{grp.totalLeaveLiability.toFixed(3)}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{grp.totalOvertimeHours} س</td>
                    <td className="p-3.5 text-left font-bold text-purple-700">{grp.totalOvertimeAmount.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black border-t-2 border-slate-900 text-xs font-mono">
                <tr>
                  <td className="p-3.5 font-sans text-slate-900">المجموع الكلي (Total Summary):</td>
                  <td className="p-3.5 text-center font-black">{totalEmployees}</td>
                  <td className="p-3.5 text-left">{payrollMoney(filteredData.reduce((a, b) => a + b.basicSalary, 0))}</td>
                  <td className="p-3.5 text-left">{payrollMoney(totalGrossSalaries)}</td>
                  <td className="p-3.5 text-left text-emerald-800 text-sm font-black">{payrollMoney(totalNetPayable)}</td>
                  <td className="p-3.5 text-left text-purple-900 text-sm font-black">{payrollMoney(totalEosAccrual)}</td>
                  <td className="p-3.5 text-left text-amber-800 text-sm font-black">{totalLeaveLiability.toFixed(3)}</td>
                  <td className="p-3.5 text-center">{filteredData.reduce((a, b) => a + b.overtimeHours, 0)} س</td>
                  <td className="p-3.5 text-left text-purple-700 font-black">{totalOvertimeCost.toFixed(3)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5.C: VIEW MODE 3: GRAPH & VISUAL ANALYTICS (عرض الرسوم البيانية) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Graph Card 1: توزيع الرواتب والالتزامات حسب الأقسام */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="text-primary" size={16} />
                توزيع كتلة الرواتب والالتزامات المالية حسب القسم (KWD)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Bar Analytics</span>
            </div>

            <div className="space-y-3 pt-2">
              {!payrollAllowed ? (
                <p className="text-xs font-bold text-slate-500">توزيع الرواتب متاح للأدوار المخولة.</p>
              ) : pivotGroups.map(grp => {
                const maxVal = Math.max(...pivotGroups.map(g => g.totalGross), 1);
                const percent = Math.min((grp.totalGross / maxVal) * 100, 100);

                return (
                  <div key={grp.groupKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{grp.groupKey} ({grp.count} موظفين)</span>
                      <span className="font-mono text-primary">{grp.totalGross.toFixed(3)} د.ك</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph Card 2: التزامات نهاية الخدمة وبدل الإجازات النقدية */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={16} />
                تحليل الالتزامات المالية التراكمية (End of Service & Leave Liabilities)
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {payrollAllowed ? `إجمالي الالتزام الكلي: ${(totalEosAccrual + totalLeaveLiability).toFixed(3)} د.ك` : 'نهاية الخدمة للأدوار المخولة'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1">
                <span className="text-xs font-bold text-purple-900 block">مخصص نهاية الخدمة المتراكم:</span>
                <div className="text-xl font-black text-purple-950 font-mono">{payrollAllowed ? `${payrollMoney(totalEosAccrual)} د.ك` : '—'}</div>
                <p className="text-[10px] text-purple-700">تطبيق المادة 51 و 53 (15 يوم لأول 5 سنوات، شهر لما بعدها)</p>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-900 block">الالتزام النقدي لرصيد الإجازات:</span>
                <div className="text-xl font-black text-amber-950 font-mono">{totalLeaveLiability.toFixed(3)} د.ك</div>
                <p className="text-[10px] text-amber-700">محسوب بدقة: (الراتب الأساسي ÷ 26) × الرصيد المتبقي</p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-xs font-bold text-emerald-900 block">إجمالي كلفة العمل الإضافي:</span>
                <div className="text-xl font-black text-emerald-950 font-mono">{totalOvertimeCost.toFixed(3)} د.ك</div>
                <p className="text-[10px] text-emerald-700">ساعات الورديات والعمل الإضافي المعتمدة</p>
              </div>
            </div>
          </div>

        </div>
      )}

          <div className="border-t bg-white" style={{ borderColor: tokens.color.gray[200] }}>
            <button
              type="button"
              onClick={() => setChartsOpen((open) => !open)}
              className="px-4 py-2 text-xs font-bold"
              style={{ color: tokens.color.gray[700] }}
            >
              {chartsOpen ? 'إخفاء المخططات' : 'المخططات'}
            </button>
            {chartsOpen ? (
              <LauncherExecutiveCharts employeesCount={analyticsData.length} showPayroll={payrollAllowed} />
            ) : null}
          </div>
        </div>
      </div>

      {/* مودال الطباعة الرسمية للتقارير A4 مع QR والترويسة */}
      <OdooOfficialA4PrintModal
        isOpen={isA4ModalOpen}
        onClose={() => setIsA4ModalOpen(false)}
        reportCategory={activeReport}
        reportTitle={getReportTitle(activeReport)}
        company={companyForPrint}
        data={filteredData}
        selectedMonth={selectedPeriodMonth}
        totalGrossSalaries={totalGrossSalaries}
        totalNetPayable={totalNetPayable}
        totalEosAccrual={totalEosAccrual}
        totalLeaveLiability={totalLeaveLiability}
        reportRef={`${activeCompany?.id || 'company'}-${selectedPeriodMonth}`}
      />

    </div>
  );
};

export default OdooReportsApp;
