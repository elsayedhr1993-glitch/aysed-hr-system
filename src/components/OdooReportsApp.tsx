import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Printer, 
  FileSpreadsheet, 
  Users, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  FileText, 
  UserCheck, 
  Download, 
  Briefcase, 
  DollarSign, 
  Plane, 
  AlertCircle,
  QrCode,
  CheckCircle2,
  PieChart,
  Table,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  Stethoscope,
  Activity,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
  Check,
  XCircle,
  HelpCircle,
  FileCheck,
  BadgeAlert
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel } from '../utils/exportUtils';

export type ReportCategory = 
  | 'wps_reconciliation'
  | 'gov_compliance'
  | 'kuwaitization'
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
  complianceStatus: 'ساري ومطابق' | 'ينتهي قريباً (<30 يوم)' | 'منتهي الصلاحية';

  // Leaves & Financial Liabilities
  leaveBalance: number;
  consumedLeaveDays: number;
  annualEntitlement: number;
  leaveCashLiability: number; // (totalSalary / 26) * leaveBalance
  
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
  const { employees: contextEmployees } = useOdooHierarchy();

  // الحالة العامة للتنقل بين التقارير والمحاور
  const [activeReport, setActiveReport] = useState<ReportCategory>('wps_reconciliation');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [pivotGroupBy, setPivotGroupBy] = useState<PivotGroupBy>('department');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('MED-001');

  const companyDisplayName = activeCompany?.nameAr || 'مجموعة رعاية النخبة الطبية ذ.م.م';

  // قاعدة بيانات الكادر الطبي والإداري الشاملة لبيئة القطاع الأهلي والصحي الكويتي
  const [analyticsData] = useState<MedicalEmployeeAnalyticsRecord[]>([
    {
      id: 'MED-001',
      name: 'د. أحمد محمود الكندري',
      civilId: '290010112345',
      nationality: 'كويتي',
      isKuwaiti: true,
      jobTitle: 'استشاري ورئيس قسم الباطنية',
      cadre: 'طبي بشري',
      department: 'قسم الباطنية والقلب',
      joinDate: '2019-03-01',
      serviceYears: 7.5,
      basicSalary: 1800.000,
      housingAllowance: 400.000,
      transportAllowance: 150.000,
      natureOfWorkAllowance: 250.000,
      otherAllowances: 0.000,
      totalSalary: 2600.000,
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: 'KW82NBOK0000000000001234567890',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2030-01-01', // مواطن
      residencyDaysLeft: 9999,
      pamWorkPermitNo: 'PAM-KW-882910',
      pamWorkPermitExpiryDate: '2027-03-01',
      pamDaysLeft: 540,
      mohLicenseNo: 'MOH-DOC-9921',
      mohLicenseExpiryDate: '2027-05-15',
      mohDaysLeft: 615,
      complianceStatus: 'ساري ومطابق',
      leaveBalance: 28.5,
      consumedLeaveDays: 14,
      annualEntitlement: 30,
      leaveCashLiability: 2850.000, // (2600 / 26) * 28.5 = 2850.000
      eosAccruedAmount: 0.000, // مواطن يخضع للتأمينات الاجتماعية PIFSS
      overtimeHours: 12,
      overtimeAmount: 180.000, // 15 د.ك/ساعة
      delayMinutes: 0,
      delayDeductionAmount: 0.000,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 2780.000
    },
    {
      id: 'MED-002',
      name: 'د. سامح عبد العزيز الفاروق',
      civilId: '284071509823',
      nationality: 'مصري',
      isKuwaiti: false,
      jobTitle: 'أخصائي أول جراحة عظام',
      cadre: 'طبي بشري',
      department: 'قسم الجراحة العامة والعمليات',
      joinDate: '2021-02-15',
      serviceYears: 5.5,
      basicSalary: 1400.000,
      housingAllowance: 350.000,
      transportAllowance: 100.000,
      natureOfWorkAllowance: 150.000,
      otherAllowances: 0.000,
      totalSalary: 2000.000,
      bankName: 'بنك بوبيان (Boubyan)',
      iban: 'KW45BOUB0000000000009876543210',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2026-11-20',
      residencyDaysLeft: 80,
      pamWorkPermitNo: 'PAM-EXP-449120',
      pamWorkPermitExpiryDate: '2026-11-15',
      pamDaysLeft: 75,
      mohLicenseNo: 'MOH-SURG-4432',
      mohLicenseExpiryDate: '2026-09-25', // أقل من 30 يوم
      mohDaysLeft: 24,
      complianceStatus: 'ينتهي قريباً (<30 يوم)',
      leaveBalance: 21.0,
      consumedLeaveDays: 9,
      annualEntitlement: 30,
      leaveCashLiability: 1615.385, // (2000 / 26) * 21 = 1615.385
      eosAccruedAmount: 4230.769, // 15 يوم لأول 5 سنوات (5769.23) + نصف سنة (1000) = 4230.769
      overtimeHours: 20,
      overtimeAmount: 240.385,
      delayMinutes: 25,
      delayDeductionAmount: 10.040,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 2230.345
    },
    {
      id: 'NUR-101',
      name: 'ماريا كروز سانتوس',
      civilId: '292081109923',
      nationality: 'فلبيني',
      isKuwaiti: false,
      jobTitle: 'مشرفة هيئة التمريض والعمليات',
      cadre: 'تمريض وتخصصي',
      department: 'هيئة التمريض والعناية',
      joinDate: '2022-06-01',
      serviceYears: 4.25,
      basicSalary: 600.000,
      housingAllowance: 150.000,
      transportAllowance: 50.000,
      natureOfWorkAllowance: 50.000,
      otherAllowances: 0.000,
      totalSalary: 850.000,
      bankName: 'بيت التمويل الكويتي (KFH)',
      iban: 'KW12KFH0000000000005544332211',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2026-09-18', // أقل من 30 يوم
      residencyDaysLeft: 17,
      pamWorkPermitNo: 'PAM-EXP-994102',
      pamWorkPermitExpiryDate: '2026-09-15',
      pamDaysLeft: 14,
      mohLicenseNo: 'MOH-NUR-8831',
      mohLicenseExpiryDate: '2027-01-10',
      mohDaysLeft: 131,
      complianceStatus: 'ينتهي قريباً (<30 يوم)',
      leaveBalance: 32.5,
      consumedLeaveDays: 5,
      annualEntitlement: 30,
      leaveCashLiability: 1062.500, // (850 / 26) * 32.5 = 1062.500
      eosAccruedAmount: 2082.211, // (850/26)*15*4.25 = 2082.211
      overtimeHours: 35,
      overtimeAmount: 178.605,
      delayMinutes: 0,
      delayDeductionAmount: 0.000,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 1028.605
    },
    {
      id: 'TEC-201',
      name: 'راجيش كومار باتيل',
      civilId: '286041208734',
      nationality: 'هندي',
      isKuwaiti: false,
      jobTitle: 'فني أول أشعة ورنين مغناطيسي',
      cadre: 'خدمات مساندة',
      department: 'الأشعة والتصوير التشخيصي',
      joinDate: '2020-10-10',
      serviceYears: 5.9,
      basicSalary: 650.000,
      housingAllowance: 150.000,
      transportAllowance: 50.000,
      natureOfWorkAllowance: 50.000,
      otherAllowances: 0.000,
      totalSalary: 900.000,
      bankName: 'بنك الخليج (Gulf Bank)',
      iban: 'KW99GULF0000000000007788990011',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2027-04-12',
      residencyDaysLeft: 223,
      pamWorkPermitNo: 'PAM-EXP-553201',
      pamWorkPermitExpiryDate: '2027-04-10',
      pamDaysLeft: 221,
      mohLicenseNo: 'MOH-RAD-1092',
      mohLicenseExpiryDate: '2027-06-01',
      mohDaysLeft: 273,
      complianceStatus: 'ساري ومطابق',
      leaveBalance: 15.0,
      consumedLeaveDays: 15,
      annualEntitlement: 30,
      leaveCashLiability: 519.231, // (900 / 26) * 15 = 519.231
      eosAccruedAmount: 3409.615, // (900/26)*15*5 + (900/26)*26*0.9 = 2596.15 + 810 = 3406.15
      overtimeHours: 24,
      overtimeAmount: 129.808,
      delayMinutes: 45,
      delayDeductionAmount: 19.471,
      unpaidAbsenceDays: 1,
      absenceDeductionAmount: 34.615, // 900 / 26
      netPayableSalary: 975.722
    },
    {
      id: 'ADM-301',
      name: 'فاطمة خالد العازمي',
      civilId: '295061903342',
      nationality: 'كويتي',
      isKuwaiti: true,
      jobTitle: 'مسؤول الموارد البشرية والامتثال (PAM & MOH)',
      cadre: 'إداري ومالي',
      department: 'الموارد البشرية والإدارة',
      joinDate: '2023-01-15',
      serviceYears: 3.6,
      basicSalary: 950.000,
      housingAllowance: 250.000,
      transportAllowance: 100.000,
      natureOfWorkAllowance: 0.000,
      otherAllowances: 0.000,
      totalSalary: 1300.000,
      bankName: 'بنك الكويت الدولي (KIB)',
      iban: 'KW55KIBK0000000000003322114455',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2030-01-01',
      residencyDaysLeft: 9999,
      pamWorkPermitNo: 'PAM-KW-773821',
      pamWorkPermitExpiryDate: '2027-01-15',
      pamDaysLeft: 495,
      mohLicenseNo: 'N/A - غير مطلوب',
      mohLicenseExpiryDate: '2030-01-01',
      mohDaysLeft: 9999,
      complianceStatus: 'ساري ومطابق',
      leaveBalance: 24.0,
      consumedLeaveDays: 6,
      annualEntitlement: 30,
      leaveCashLiability: 1200.000,
      eosAccruedAmount: 0.000, // كويتي
      overtimeHours: 0,
      overtimeAmount: 0.000,
      delayMinutes: 0,
      delayDeductionAmount: 0.000,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 1300.000
    },
    {
      id: 'SEC-401',
      name: 'سعد جابر العنزي',
      civilId: '289120109923',
      nationality: 'غير محدد الجنسية (بدون)',
      isKuwaiti: false,
      jobTitle: 'مشرف الأمن والسلامة والورديات الليلية',
      cadre: 'أمن وسلامة',
      department: 'الأمن والسلامة',
      joinDate: '2022-01-10',
      serviceYears: 4.6,
      basicSalary: 500.000,
      housingAllowance: 150.000,
      transportAllowance: 50.000,
      natureOfWorkAllowance: 100.000,
      otherAllowances: 0.000,
      totalSalary: 800.000,
      bankName: 'بنك برقان (Burgan Bank)',
      iban: 'KW22BURG0000000000006677889900',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2027-02-01',
      residencyDaysLeft: 150,
      pamWorkPermitNo: 'PAM-SEC-119283',
      pamWorkPermitExpiryDate: '2027-02-01',
      pamDaysLeft: 150,
      mohLicenseNo: 'N/A - أمن',
      mohLicenseExpiryDate: '2030-01-01',
      mohDaysLeft: 9999,
      complianceStatus: 'ساري ومطابق',
      leaveBalance: 18.0,
      consumedLeaveDays: 12,
      annualEntitlement: 30,
      leaveCashLiability: 553.846, // (800 / 26) * 18
      eosAccruedAmount: 2123.077, // (800/26)*15*4.6
      overtimeHours: 48,
      overtimeAmount: 221.538,
      delayMinutes: 10,
      delayDeductionAmount: 3.846,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 1017.692
    },
    {
      id: 'MED-003',
      name: 'د. يوسف طارق عبد الجليل',
      civilId: '287092104432',
      nationality: 'أردني',
      isKuwaiti: false,
      jobTitle: 'طبيب مسجل أول طوارئ وحوادث',
      cadre: 'طبي بشري',
      department: 'قسم الطوارئ والحوادث',
      joinDate: '2023-08-01',
      serviceYears: 3.1,
      basicSalary: 1100.000,
      housingAllowance: 300.000,
      transportAllowance: 100.000,
      natureOfWorkAllowance: 200.000,
      otherAllowances: 0.000,
      totalSalary: 1700.000,
      bankName: 'بنك وربة (Warba Bank)',
      iban: 'KW77WARB0000000000004455667788',
      wpsStatus: 'مطابق ومحوّل',
      wpsBatchNo: 'WPS-2026-08-01',
      residencyExpiryDate: '2026-08-15', // منتهي
      residencyDaysLeft: -17,
      pamWorkPermitNo: 'PAM-EXP-332910',
      pamWorkPermitExpiryDate: '2026-08-15',
      pamDaysLeft: -17,
      mohLicenseNo: 'MOH-EMG-6712',
      mohLicenseExpiryDate: '2026-08-20',
      mohDaysLeft: -12,
      complianceStatus: 'منتهي الصلاحية',
      leaveBalance: 12.0,
      consumedLeaveDays: 18,
      annualEntitlement: 30,
      leaveCashLiability: 784.615,
      eosAccruedAmount: 3040.385,
      overtimeHours: 28,
      overtimeAmount: 274.615,
      delayMinutes: 0,
      delayDeductionAmount: 0.000,
      unpaidAbsenceDays: 0,
      absenceDeductionAmount: 0.000,
      netPayableSalary: 1974.615
    }
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
  const kuwaitiCount = analyticsData.filter(e => e.isKuwaiti).length;
  const kuwaitizationRatio = totalEmployees > 0 ? (kuwaitiCount / totalEmployees) * 100 : 0;
  const totalGrossSalaries = analyticsData.reduce((acc, curr) => acc + curr.totalSalary, 0);
  const totalNetPayable = analyticsData.reduce((acc, curr) => acc + curr.netPayableSalary, 0);
  const totalEosAccrual = analyticsData.reduce((acc, curr) => acc + curr.eosAccruedAmount, 0);
  const totalLeaveLiability = analyticsData.reduce((acc, curr) => acc + curr.leaveCashLiability, 0);
  const totalOvertimeCost = analyticsData.reduce((acc, curr) => acc + curr.overtimeAmount, 0);
  const totalDeductions = analyticsData.reduce((acc, curr) => acc + curr.delayDeductionAmount + curr.absenceDeductionAmount, 0);
  const expiredComplianceCount = analyticsData.filter(e => e.complianceStatus === 'منتهي الصلاحية').length;
  const expiringSoonCount = analyticsData.filter(e => e.complianceStatus === 'ينتهي قريباً (<30 يوم)').length;

  // استخراج قائمة الأقسام الفريدة
  const departmentsList = useMemo(() => {
    return Array.from(new Set(analyticsData.map(d => d.department)));
  }, [analyticsData]);

  // تجميع البيانات للجدول المحوري (Pivot Table Groups)
  const pivotGroups = useMemo(() => {
    const map = new Map<string, {
      groupKey: string;
      count: number;
      kuwaitiCount: number;
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
          kuwaitiCount: 0,
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
      if (item.isKuwaiti) grp.kuwaitiCount += 1;
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
        'الاستقطاعات (د.ك)': Number((d.delayDeductionAmount + d.absenceDeductionAmount).toFixed(3)),
        'صافي الراتب WPS (د.ك)': Number(d.netPayableSalary.toFixed(3)),
        'البنك': d.bankName,
        'الآيبان': d.iban,
        'حالة المسير': d.wpsStatus
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
    } else if (activeReport === 'kuwaitization') {
      exportRecords = pivotGroups.map((g, idx) => {
        const kwRatio = g.count > 0 ? ((g.kuwaitiCount / g.count) * 100).toFixed(1) : '0';
        return {
          'م': idx + 1,
          'القسم': g.groupKey,
          'إجمالي الكادر': g.count,
          'عدد الكويتيين': g.kuwaitiCount,
          'عدد الوافدين': g.count - g.kuwaitiCount,
          'نسبة التكويت %': `${kwRatio}%`,
          'إجمالي الرواتب للكويتيين (د.ك)': Number((g.totalGross * (g.kuwaitiCount / g.count || 0)).toFixed(3)),
          'إجمالي الرواتب للوافدين (د.ك)': Number((g.totalGross * ((g.count - g.kuwaitiCount) / g.count || 0)).toFixed(3))
        };
      });
    } else if (activeReport === 'eos_indemnity_accrual') {
      exportRecords = filteredData.map((d, idx) => ({
        'م': idx + 1,
        'الكود': d.id,
        'اسم الموظف': d.name,
        'الرقم المدني': d.civilId,
        'تاريخ التعيين': d.joinDate,
        'سنوات الخدمة': d.serviceYears,
        'الراتب الشامل (د.ك)': Number(d.totalSalary.toFixed(3)),
        'أجر اليوم (÷26)': Number((d.totalSalary / 26).toFixed(3)),
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
        'أجر اليوم (÷26)': Number((d.totalSalary / 26).toFixed(3)),
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

    exportToExcel(exportRecords, `تقرير_${reportTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`, reportTitle.slice(0, 30));
  };

  const getReportTitle = (key: ReportCategory) => {
    switch (key) {
      case 'wps_reconciliation': return 'تقرير مطابقة مسيرات الرواتب وملفات WPS البنكية';
      case 'gov_compliance': return 'تقرير انتهاء الإقامات وأذونات العمل وتراخيص وزارة الصحة (MOH)';
      case 'kuwaitization': return 'تقرير نسب العمالة الوطنية والتكويت (PAM Compliance)';
      case 'eos_indemnity_accrual': return 'تقرير مخصصات نهاية الخدمة التراكمية (Indemnity Accrual - مادة 51)';
      case 'leaves_financial_liability': return 'تقرير الأرصدة السنوية والالتزامات النقدية للإجازات (مادة 70 & 71)';
      case 'attendance_overtime_analytics': return 'تحليل ساعات التأخير والغياب والساعات الإضافية وتكلفتها';
    }
  };

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. ODOO TOP CONTROL PANEL & ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>التقارير والتحليلات</span>
            <span>/</span>
            <span className="text-[#714B67] font-black">{getReportTitle(activeReport)}</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-[#714B67]" size={22} />
            نظام التقارير والتحليلات المؤسسية (Odoo HR Reporting & Analytics)
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            المنشأة: <strong className="text-[#714B67]">{companyDisplayName}</strong> | القطاع الطبي والخاص الكويتي (حسابات 26 يوم عمل بالدينار الكويتي 0.000 KWD)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* محول العروض الثلاثي (List, Pivot, Graph) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض الجدول التفصيلي"
            >
              <Table size={14} /> جدول تحليلي
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pivot')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'pivot' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="الجدول المحوري مع التجميع"
            >
              <Layers size={14} /> جدول محوري (Pivot)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'graph' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="الرسوم البيانية والمؤشرات"
            >
              <PieChart size={14} /> رسوم بيانية (Graph)
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={15} /> تصدير Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => safePrintAction(`${getReportTitle(activeReport)} - ${companyDisplayName}`)}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer size={15} /> طباعة تقرير PDF رسمي
          </button>
        </div>
      </div>

      {/* 2. SUB-MENUS NAVIGATION BAR (شريط القوائم الفرعية للتقارير) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          
          {/* المجموعة 1: الرواتب والامتثال الحكومي */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 block px-1 flex items-center gap-1">
              <CreditCard size={11} className="text-emerald-600" /> تقارير الرواتب والامتثال (WPS & PAM)
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveReport('wps_reconciliation')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'wps_reconciliation' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>1. مطابقة مسيرات الرواتب وملفات WPS</span>
                <ChevronRight size={14} className={activeReport === 'wps_reconciliation' ? 'text-white' : 'text-slate-400'} />
              </button>
              <button
                onClick={() => setActiveReport('gov_compliance')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'gov_compliance' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  2. الإقامات وأذونات PAM وتراخيص MOH
                  {expiredComplianceCount > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                      {expiredComplianceCount}
                    </span>
                  )}
                </span>
                <ChevronRight size={14} className={activeReport === 'gov_compliance' ? 'text-white' : 'text-slate-400'} />
              </button>
              <button
                onClick={() => setActiveReport('kuwaitization')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'kuwaitization' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>3. نسب العمالة الوطنية والتكويت</span>
                <ChevronRight size={14} className={activeReport === 'kuwaitization' ? 'text-white' : 'text-slate-400'} />
              </button>
            </div>
          </div>

          {/* المجموعة 2: الإجازات والالتزامات المالية */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 block px-1 flex items-center gap-1">
              <DollarSign size={11} className="text-purple-600" /> تقارير الإجازات والالتزامات المالية
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveReport('eos_indemnity_accrual')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'eos_indemnity_accrual' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>4. مخصصات نهاية الخدمة (مادة 51)</span>
                <ChevronRight size={14} className={activeReport === 'eos_indemnity_accrual' ? 'text-white' : 'text-slate-400'} />
              </button>
              <button
                onClick={() => setActiveReport('leaves_financial_liability')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'leaves_financial_liability' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>5. أرصدة الإجازات والالتزام النقدي</span>
                <ChevronRight size={14} className={activeReport === 'leaves_financial_liability' ? 'text-white' : 'text-slate-400'} />
              </button>
            </div>
          </div>

          {/* المجموعة 3: الحضور والشفتات والإضافي */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 block px-1 flex items-center gap-1">
              <Clock size={11} className="text-blue-600" /> تقارير الحضور والشفتات والتكاليف
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveReport('attendance_overtime_analytics')}
                className={`w-full text-right p-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeReport === 'attendance_overtime_analytics' 
                    ? 'bg-[#714B67] text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>6. تحليل التأخير والغياب والإضافي (OT)</span>
                <ChevronRight size={14} className={activeReport === 'attendance_overtime_analytics' ? 'text-white' : 'text-slate-400'} />
              </button>
              <div className="p-2 bg-purple-50/50 rounded-lg text-[10px] text-[#714B67] font-semibold flex items-center gap-1.5 border border-purple-100">
                <Sparkles size={13} className="shrink-0" />
                <span>محسوبة تلقائياً على أساس 26 يوم عمل</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. EXECUTIVE KPIS CARDS (المؤشرات التنفيذية اللحظية) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>إجمالي الكادر</span>
            <Users className="w-3.5 h-3.5 text-[#714B67]" />
          </div>
          <div className="text-lg font-black text-slate-900">{totalEmployees} <span className="text-[10px] font-normal text-slate-500">موظف</span></div>
          <div className="text-[9px] text-emerald-700 mt-0.5 font-bold">100% مسجلين بـ WPS</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>نسبة التكويت</span>
            <Percent className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-black text-blue-700">{kuwaitizationRatio.toFixed(1)}%</div>
          <div className="text-[9px] text-slate-500 mt-0.5 font-mono">{kuwaitiCount} كويتي من {totalEmployees}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>مسير الرواتب (WPS)</span>
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-700">{totalNetPayable.toFixed(3)} <span className="text-[9px] font-normal text-slate-500">د.ك</span></div>
          <div className="text-[9px] text-emerald-800 mt-0.5 font-bold">محول للبنك بالكامل</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>مخصص نهاية الخدمة</span>
            <Award className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-lg font-black text-purple-800">{totalEosAccrual.toFixed(3)} <span className="text-[9px] font-normal text-slate-500">د.ك</span></div>
          <div className="text-[9px] text-purple-600 mt-0.5">التزام مالي تراكمي (مادة 51)</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>التزام بدل الإجازات</span>
            <Plane className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-black text-amber-700">{totalLeaveLiability.toFixed(3)} <span className="text-[9px] font-normal text-slate-500">د.ك</span></div>
          <div className="text-[9px] text-amber-800 mt-0.5">رصيد الأيام غير المستهلكة</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-between">
            <span>تنبيهات الامتثال (MOH/PAM)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-black text-rose-700">{expiredComplianceCount + expiringSoonCount} <span className="text-[9px] font-normal text-slate-500">حالة</span></div>
          <div className="text-[9px] text-rose-600 mt-0.5 font-bold">{expiredComplianceCount} منتهي / {expiringSoonCount} قريباً</div>
        </div>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الرقم المدني، المسمى، أو القسم..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#714B67] outline-none"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">القسم:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-[#714B67] cursor-pointer"
            >
              <option value="ALL">كافة الأقسام الطبية والإدارية</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {activeReport === 'gov_compliance' && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">حالة الامتثال:</span>
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:border-[#714B67] cursor-pointer"
              >
                <option value="ALL">الكل</option>
                <option value="ساري ومطابق">ساري ومطابق</option>
                <option value="ينتهي قريباً (<30 يوم)">ينتهي قريباً (&lt;30 يوم)</option>
                <option value="منتهي الصلاحية">منتهي الصلاحية</option>
              </select>
            </div>
          )}

          {viewMode === 'pivot' && (
            <div className="flex items-center gap-1.5 bg-purple-50 p-1 rounded-lg border border-purple-200">
              <span className="font-bold text-[#714B67] px-1">تجميع حسب (Group By):</span>
              <select
                value={pivotGroupBy}
                onChange={(e) => setPivotGroupBy(e.target.value as PivotGroupBy)}
                className="p-1.5 bg-white border border-purple-300 rounded-md font-bold text-[#714B67] outline-none cursor-pointer"
              >
                <option value="department">القسم / الوحدة الطبية</option>
                <option value="nationality">الجنسية (كويتي / غير كويتي)</option>
                <option value="jobTitle">المسمى الوظيفي</option>
                <option value="cadre">الكادر الوظيفي (طبي/تمريض/أمن/إداري)</option>
                <option value="bank">البنك المحول إليه</option>
              </select>
            </div>
          )}
        </div>
      </div>

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
                <FileCheck className="text-[#714B67]" size={17} />
                {getReportTitle(activeReport)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                بيانات حية ومحدثة ومطابقة لقانون العمل بالقطاع الأهلي الكويتي (عدد السجلات: {filteredData.length})
              </p>
            </div>
            <span className="bg-purple-100 text-[#714B67] text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
              KWD 0.000 (26 Days)
            </span>
          </div>

          <div className="overflow-x-auto">
            
            {/* 1. REPORT 1: WPS RECONCILIATION TABLE */}
            {activeReport === 'wps_reconciliation' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-3.5">كود الموظف</th>
                    <th className="p-3.5">الموظف / الرقم المدني</th>
                    <th className="p-3.5">القسم والمسمى</th>
                    <th className="p-3.5 text-left">الأساسي (د.ك)</th>
                    <th className="p-3.5 text-left">البدلات (د.ك)</th>
                    <th className="p-3.5 text-left">الإضافي (+)</th>
                    <th className="p-3.5 text-left">الخصم (-)</th>
                    <th className="p-3.5 text-left text-emerald-800">صافي المحول WPS</th>
                    <th className="p-3.5">البنك والآيبان</th>
                    <th className="p-3.5 text-center">حالة الدفعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-bold text-[#714B67]">{emp.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 font-sans">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.civilId}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                        <div className="text-[10px] text-slate-400">{emp.department}</div>
                      </td>
                      <td className="p-3.5 text-left">{emp.basicSalary.toFixed(3)}</td>
                      <td className="p-3.5 text-left text-slate-600">+{(emp.totalSalary - emp.basicSalary).toFixed(3)}</td>
                      <td className="p-3.5 text-left text-purple-700">+{emp.overtimeAmount.toFixed(3)}</td>
                      <td className="p-3.5 text-left text-rose-600">-{(emp.delayDeductionAmount + emp.absenceDeductionAmount).toFixed(3)}</td>
                      <td className="p-3.5 text-left font-black text-emerald-700 text-sm">{emp.netPayableSalary.toFixed(3)} د.ك</td>
                      <td className="p-3.5 font-sans">
                        <div className="text-[11px] font-bold text-slate-800">{emp.bankName}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-[180px]">{emp.iban}</div>
                      </td>
                      <td className="p-3.5 text-center font-sans">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> {emp.wpsStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td colSpan={3} className="p-3.5 font-sans text-slate-900">إجمالي مسير الرواتب المعتمد:</td>
                    <td className="p-3.5 text-left">{filteredData.reduce((a, b) => a + b.basicSalary, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left">+{filteredData.reduce((a, b) => a + (b.totalSalary - b.basicSalary), 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-purple-700">+{filteredData.reduce((a, b) => a + b.overtimeAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-rose-600">-{filteredData.reduce((a, b) => a + b.delayDeductionAmount + b.absenceDeductionAmount, 0).toFixed(3)}</td>
                    <td className="p-3.5 text-left text-emerald-800 text-sm font-black">{filteredData.reduce((a, b) => a + b.netPayableSalary, 0).toFixed(3)} د.ك</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* 2. REPORT 2: GOVERNMENT & MOH COMPLIANCE TABLE */}
            {activeReport === 'gov_compliance' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-3.5">الموظف / الرقم المدني</th>
                    <th className="p-3.5">الجنسية والكادر</th>
                    <th className="p-3.5">انتهاء الإقامة (Residency)</th>
                    <th className="p-3.5">إذن العمل (PAM)</th>
                    <th className="p-3.5">ترخيص مزاولة المهنة (MOH)</th>
                    <th className="p-3.5 text-center">حالة الامتثال والإنذار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.civilId} - {emp.jobTitle}</div>
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
                        ) : (
                          <div>
                            <div className="font-bold text-slate-800">{emp.residencyExpiryDate}</div>
                            <div className={`text-[10px] font-sans font-bold ${emp.residencyDaysLeft < 0 ? 'text-rose-600' : emp.residencyDaysLeft < 30 ? 'text-amber-600' : 'text-emerald-700'}`}>
                              {emp.residencyDaysLeft < 0 ? `منتهية منذ ${Math.abs(emp.residencyDaysLeft)} يوماً ⚠️` : `متبقي ${emp.residencyDaysLeft} يوماً`}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. REPORT 3: KUWAITIZATION & PAM RATIOS TABLE */}
            {activeReport === 'kuwaitization' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-3.5">القسم / الوحدة الطبية</th>
                    <th className="p-3.5 text-center">إجمالي الكادر</th>
                    <th className="p-3.5 text-center text-blue-700">عدد الكويتيين</th>
                    <th className="p-3.5 text-center text-slate-600">عدد الوافدين</th>
                    <th className="p-3.5 text-center font-black text-purple-900">نسبة التكويت الحالية (%)</th>
                    <th className="p-3.5 text-center">النسبة المستهدفة (PAM)</th>
                    <th className="p-3.5 text-left">كتلة أجور الكويتيين (د.ك)</th>
                    <th className="p-3.5 text-center">حالة الامتثال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {pivotGroups.map((grp, idx) => {
                    const ratio = grp.count > 0 ? (grp.kuwaitiCount / grp.count) * 100 : 0;
                    const targetRatio = 15.0; // النسبة المستهدفة بالقطاع الطبي
                    const isCompliant = ratio >= targetRatio;

                    return (
                      <tr key={grp.groupKey} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                        <td className="p-3.5 font-bold text-slate-900 font-sans">{grp.groupKey}</td>
                        <td className="p-3.5 text-center font-bold">{grp.count}</td>
                        <td className="p-3.5 text-center font-bold text-blue-700">{grp.kuwaitiCount}</td>
                        <td className="p-3.5 text-center text-slate-600">{grp.count - grp.kuwaitiCount}</td>
                        <td className="p-3.5 text-center font-black text-purple-900 text-sm">{ratio.toFixed(1)}%</td>
                        <td className="p-3.5 text-center font-bold text-slate-500">{targetRatio.toFixed(1)}%</td>
                        <td className="p-3.5 text-left font-bold text-emerald-800">
                          {(grp.totalGross * (grp.kuwaitiCount / grp.count || 0)).toFixed(3)} د.ك
                        </td>
                        <td className="p-3.5 text-center font-sans">
                          {isCompliant ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              مستوفٍ لنسبة القوى العاملة ✓
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              بحاجة لتعيين عمالة وطنية
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs font-mono">
                  <tr>
                    <td className="p-3.5 font-sans text-slate-900">إجمالي المنشأة العام:</td>
                    <td className="p-3.5 text-center font-bold">{totalEmployees}</td>
                    <td className="p-3.5 text-center text-blue-700 font-bold">{kuwaitiCount}</td>
                    <td className="p-3.5 text-center text-slate-600">{totalEmployees - kuwaitiCount}</td>
                    <td className="p-3.5 text-center text-purple-900 text-sm font-black">{kuwaitizationRatio.toFixed(1)}%</td>
                    <td className="p-3.5 text-center font-bold">15.0%</td>
                    <td className="p-3.5 text-left text-emerald-800 font-black">
                      {filteredData.filter(e => e.isKuwaiti).reduce((a, b) => a + b.totalSalary, 0).toFixed(3)} د.ك
                    </td>
                    <td className="p-3.5 text-center font-sans text-emerald-800">
                      {kuwaitizationRatio >= 15 ? 'مطابق لنسب التكويت الإجمالية' : 'أقل من النسبة'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* 4. REPORT 4: END OF SERVICE INDEMNITY ACCRUAL TABLE */}
            {activeReport === 'eos_indemnity_accrual' && (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-3.5">الموظف / الرقم المدني</th>
                    <th className="p-3.5">تاريخ التعيين</th>
                    <th className="p-3.5">مدة الخدمة</th>
                    <th className="p-3.5 text-left">الراتب الشامل (د.ك)</th>
                    <th className="p-3.5 text-left">أجر اليوم (÷26)</th>
                    <th className="p-3.5">قاعدة الاحتساب (المادة 51)</th>
                    <th className="p-3.5 text-left text-purple-900">المخصص المتراكم (Accrual)</th>
                    <th className="p-3.5 text-left text-slate-400">الحد الأقصى (18 شهر)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.civilId} - {emp.jobTitle}</div>
                      </td>
                      <td className="p-3.5">{emp.joinDate}</td>
                      <td className="p-3.5 font-bold font-sans text-slate-800">{emp.serviceYears} سنوات</td>
                      <td className="p-3.5 text-left font-bold">{emp.totalSalary.toFixed(3)}</td>
                      <td className="p-3.5 text-left text-slate-600">{(emp.totalSalary / 26).toFixed(3)}</td>
                      <td className="p-3.5 font-sans text-[11px] text-slate-600">
                        {emp.isKuwaiti ? (
                          <span className="text-blue-700 font-bold">تأمينات اجتماعية (PIFSS)</span>
                        ) : emp.serviceYears <= 5 ? (
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
                  <tr>
                    <th className="p-3.5">الموظف / الرقم المدني</th>
                    <th className="p-3.5">المسمى والقسم</th>
                    <th className="p-3.5 text-center">الاستحقاق السنوي (يوم)</th>
                    <th className="p-3.5 text-center text-slate-500">المستهلك فعلياً</th>
                    <th className="p-3.5 text-center font-bold text-purple-900">الرصيد المتبقي (يوم)</th>
                    <th className="p-3.5 text-left">أجر اليوم (÷26)</th>
                    <th className="p-3.5 text-left text-amber-800 font-bold">الالتزام النقدي للرصيد (د.ك)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => (
                    <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.civilId}</div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                        <div className="text-[10px] text-slate-400">{emp.department}</div>
                      </td>
                      <td className="p-3.5 text-center font-bold">{emp.annualEntitlement} يوماً</td>
                      <td className="p-3.5 text-center text-slate-500">{emp.consumedLeaveDays} يوماً</td>
                      <td className="p-3.5 text-center font-black text-purple-900 text-sm">{emp.leaveBalance} يوماً</td>
                      <td className="p-3.5 text-left font-bold">{(emp.totalSalary / 26).toFixed(3)}</td>
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
                  <tr>
                    <th className="p-3.5">الموظف / الرقم المدني</th>
                    <th className="p-3.5">القسم والكادر</th>
                    <th className="p-3.5 text-center">ساعات الإضافي (OT)</th>
                    <th className="p-3.5 text-left text-purple-700 font-bold">مستحق الإضافي (د.ك)</th>
                    <th className="p-3.5 text-center">دقائق التأخير</th>
                    <th className="p-3.5 text-left text-rose-600">خصم التأخير (د.ك)</th>
                    <th className="p-3.5 text-center">أيام الغياب</th>
                    <th className="p-3.5 text-left text-rose-700">خصم الغياب (د.ك)</th>
                    <th className="p-3.5 text-left text-emerald-800 font-bold">صافي الأثر المالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredData.map((emp, idx) => {
                    const netImpact = emp.overtimeAmount - emp.delayDeductionAmount - emp.absenceDeductionAmount;
                    return (
                      <tr key={emp.id} className={`hover:bg-purple-50/40 transition ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}>
                        <td className="p-3.5 font-sans">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.civilId} - {emp.jobTitle}</div>
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
                <Layers className="text-[#714B67]" size={18} />
                الجدول المحوري التفاعلي (Odoo Interactive Pivot Table)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تجميع وتحليل البيانات حسب: <strong className="text-[#714B67]">{pivotGroupBy}</strong>
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-purple-50 text-[#714B67] px-3 py-1.5 rounded-lg border border-purple-200">
              عدد المجموعات التحليلية: {pivotGroups.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300 font-sans">
                <tr>
                  <th className="p-3.5">المجموعة المحورية ({pivotGroupBy})</th>
                  <th className="p-3.5 text-center">العدد</th>
                  <th className="p-3.5 text-center text-blue-700">كويتي</th>
                  <th className="p-3.5 text-center">وافد</th>
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
                      <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
                      {grp.groupKey}
                    </td>
                    <td className="p-3.5 text-center font-bold">{grp.count}</td>
                    <td className="p-3.5 text-center font-bold text-blue-700">{grp.kuwaitiCount}</td>
                    <td className="p-3.5 text-center text-slate-600">{grp.count - grp.kuwaitiCount}</td>
                    <td className="p-3.5 text-left">{grp.totalBasic.toFixed(3)}</td>
                    <td className="p-3.5 text-left font-bold">{grp.totalGross.toFixed(3)}</td>
                    <td className="p-3.5 text-left font-black text-emerald-700">{grp.totalNet.toFixed(3)}</td>
                    <td className="p-3.5 text-left font-bold text-purple-900">{grp.totalEos.toFixed(3)}</td>
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
                  <td className="p-3.5 text-center text-blue-700">{kuwaitiCount}</td>
                  <td className="p-3.5 text-center">{totalEmployees - kuwaitiCount}</td>
                  <td className="p-3.5 text-left">{filteredData.reduce((a, b) => a + b.basicSalary, 0).toFixed(3)}</td>
                  <td className="p-3.5 text-left">{totalGrossSalaries.toFixed(3)}</td>
                  <td className="p-3.5 text-left text-emerald-800 text-sm font-black">{totalNetPayable.toFixed(3)}</td>
                  <td className="p-3.5 text-left text-purple-900 text-sm font-black">{totalEosAccrual.toFixed(3)}</td>
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
                <BarChart3 className="text-[#714B67]" size={16} />
                توزيع كتلة الرواتب والالتزامات المالية حسب القسم (KWD)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Bar Analytics</span>
            </div>

            <div className="space-y-3 pt-2">
              {pivotGroups.map(grp => {
                const maxVal = Math.max(...pivotGroups.map(g => g.totalGross), 1);
                const percent = Math.min((grp.totalGross / maxVal) * 100, 100);

                return (
                  <div key={grp.groupKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{grp.groupKey} ({grp.count} موظفين)</span>
                      <span className="font-mono text-[#714B67]">{grp.totalGross.toFixed(3)} د.ك</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div 
                        className="bg-[#714B67] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph Card 2: نسب التكويت والامتثال لقانون العمل */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChart className="text-emerald-600" size={16} />
                توزيع الكادر الوطني والتكويت (Kuwaitization Ratio)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">PAM Compliance</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-4">
              <div className="relative w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center bg-purple-50">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#714B67]">{kuwaitizationRatio.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-500 font-bold">نسبة التكويت</div>
                </div>
              </div>

              <div className="space-y-3 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-6 p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-slate-800">عمالة وطنية (كويتيين):</span>
                  </div>
                  <span className="font-mono font-black text-blue-700">{kuwaitiCount} موظف</span>
                </div>

                <div className="flex items-center justify-between gap-6 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span className="font-bold text-slate-800">عمالة وافدة (مقيمين):</span>
                  </div>
                  <span className="font-mono font-black text-slate-700">{totalEmployees - kuwaitiCount} موظف</span>
                </div>

                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 font-bold">
                  ✓ النسبة المستوفاة تتوافق مع اشتراطات الهيئة العامة للقوى العاملة.
                </div>
              </div>
            </div>
          </div>

          {/* Graph Card 3: التزامات نهاية الخدمة وبدل الإجازات النقدية */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-purple-600" size={16} />
                تحليل الالتزامات المالية التراكمية (End of Service & Leave Liabilities)
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-700">
                إجمالي الالتزام الكلي: {(totalEosAccrual + totalLeaveLiability).toFixed(3)} د.ك
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1">
                <span className="text-xs font-bold text-purple-900 block">مخصص نهاية الخدمة المتراكم:</span>
                <div className="text-xl font-black text-purple-950 font-mono">{totalEosAccrual.toFixed(3)} د.ك</div>
                <p className="text-[10px] text-purple-700">تطبيق المادة 51 و 53 (15 يوم لأول 5 سنوات، شهر لما بعدها)</p>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-900 block">الالتزام النقدي لرصيد الإجازات:</span>
                <div className="text-xl font-black text-amber-950 font-mono">{totalLeaveLiability.toFixed(3)} د.ك</div>
                <p className="text-[10px] text-amber-700">محسوب بدقة: (الراتب الشامل ÷ 26) × الرصيد المتبقي</p>
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

    </div>
  );
};

export default OdooReportsApp;
