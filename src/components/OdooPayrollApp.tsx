import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calculator, 
  Building2, 
  Printer, 
  Search, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Plus,
  Filter,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Check,
  Send,
  Building,
  Hash,
  Landmark,
  ArrowUpRight,
  Trash2
, X} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { exportToExcel, generateKuwaitWpsFiles } from '../utils/exportUtils';

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
  absenceDays: number;
  absenceDeduction: number;
  delayMinutes: number;
  delayDeduction: number;
  loanDeduction: number;
  pifssDeduction: number; // اشتراك التأمينات الاجتماعية للكويتيين
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'review' | 'confirmed' | 'paid';
  wpsFileRef?: string;
  notes?: string;
}

const initialPayslipsList: PayslipItem[] = [];
// Legacy mock payslips purged for live Firebase usage

export const OdooPayrollApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { settings } = useSystemSettings();
  const { employees, attendance, loans, addLoan, deleteLoan, computedPayslips, processMonthlyBatch, registerLoanPayment } = useOdooHierarchy();
  
  const [activeSubTab, setActiveSubTab] = useState<'payslips' | 'loans' | 'eos'>('payslips');
  const [payslips, setPayslips] = useState<PayslipItem[]>(initialPayslipsList);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'review' | 'confirmed' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Payslip for Form Sheet View (Odoo Form View)
  const [activePayslipId, setActivePayslipId] = useState<string | null>(null);
  const [formActiveTab, setFormActiveTab] = useState<'computation' | 'wps_bank' | 'work_entries'>('computation');
  const [showNewPayslipModal, setShowNewPayslipModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const [newLoan, setNewLoan] = useState({
    employeeId: '',
    totalAmount: '',
    monthlyInstallment: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [eosData, setEosData] = useState({
    empName: '',
    salary: 0,
    years: 0,
    months: 0,
    reason: 'termination_by_company'
  });

  const calculateEOS = () => {
    const totalYears = eosData.years + (eosData.months / 12);
    let amount = 0;
    
    // أول 5 سنوات: 15 يوم عن كل سنة (الراتب / 26 * 15)
    if (totalYears <= 5) {
      amount = totalYears * (eosData.salary / 26) * 15;
    } else {
      // 5 سنوات الأولى
      const first5 = 5 * (eosData.salary / 26) * 15;
      // ما زاد عن 5 سنوات: شهر عن كل سنة
      const remaining = (totalYears - 5) * eosData.salary;
      amount = first5 + remaining;
    }

    // الحد الأقصى 18 شهر
    const maxAmount = eosData.salary * 18;
    if (amount > maxAmount) amount = maxAmount;

    // خصم الاستقالة (المادة 53)
    if (eosData.reason === 'resignation') {
      if (totalYears >= 3 && totalYears < 5) amount = amount / 2; // يستحق النصف
      else if (totalYears >= 5 && totalYears < 10) amount = amount * 0.6667; // يستحق الثلثين
      else if (totalYears < 3) amount = 0; // لا يستحق
    }

    return amount.toFixed(3);
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeId || !newLoan.totalAmount) return;
    const tot = parseFloat(newLoan.totalAmount) || 0;
    const inst = parseFloat(newLoan.monthlyInstallment) || 0;
    
    addLoan(newLoan.employeeId, tot, inst);
    
    setShowLoanModal(false);
    setNewLoan({
      employeeId: '',
      totalAmount: '',
      monthlyInstallment: '',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeletePayslip = (id: string) => {
    if (confirm('هل أنت متأكد من مسح مسير الراتب هذا؟')) {
      setPayslips(payslips.filter(p => p.id !== id));
      if (activePayslipId === id) {
        setActivePayslipId(null);
      }
    }
  };

  // New Payslip Form
  const [newForm, setNewForm] = useState({
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
    delayMinutes: '0',
    pifssDeduction: '0'
  });

  const activePayslip = payslips.find(p => p.id === activePayslipId) || null;

  // Filtered List
  const filteredPayslips = payslips.filter(slip => {
    const matchesMonth = slip.period === selectedMonth;
    const matchesStatus = statusFilter === 'all' || slip.status === statusFilter;
    const matchesSearch = 
      slip.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.civilId.includes(searchQuery) ||
      slip.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slip.bankName.includes(searchQuery);
    return matchesMonth && matchesStatus && matchesSearch;
  });

  // Financial KPIs
  const totalGross = filteredPayslips.reduce((acc, p) => acc + p.grossSalary, 0);
  const totalDeductions = filteredPayslips.reduce((acc, p) => acc + p.totalDeductions, 0);
  const totalNet = filteredPayslips.reduce((acc, p) => acc + p.netSalary, 0);
  const totalOvertime = filteredPayslips.reduce((acc, p) => acc + p.overtimeAmount, 0);

  // Status Action Handlers
  const handleUpdateStatus = (id: string, newStatus: 'draft' | 'review' | 'confirmed' | 'paid') => {
    setPayslips(prev => prev.map(p => {
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
    }));
  };

  // Re-compute single payslip based on Kuwait Labor Law settings (26 days / configurable)
  const handleRecomputePayslip = (id: string) => {
    const divisor = settings.workingDaysCalculation === '30_DAYS' ? 30 : 26;
    const dailyHours = settings.standardDailyHours || 8;
    const overtimeMult = settings.overtimeRateStandard || 1.25;

    setPayslips(prev => prev.map(p => {
      if (p.id === id) {
        const totalBase = p.basicSalary + p.housingAllowance + p.transportAllowance + p.medicalAllowance;
        const dayRate = totalBase / divisor;
        const hourRate = dayRate / dailyHours;
        const minRate = hourRate / 60;

        const overtimeAmount = Math.round((p.overtimeHours * hourRate * overtimeMult) * 1000) / 1000;
        const absenceDeduction = Math.round((p.absenceDays * dayRate) * 1000) / 1000;
        const delayDeduction = Math.round((p.delayMinutes * minRate) * 1000) / 1000;
        
        const grossSalary = totalBase + overtimeAmount;
        const totalDeductions = absenceDeduction + delayDeduction + p.pifssDeduction;
        const netSalary = Math.max(0, grossSalary - totalDeductions);

        return {
          ...p,
          overtimeAmount,
          absenceDeduction,
          delayDeduction,
          grossSalary,
          totalDeductions,
          netSalary
        };
      }
      return p;
    }));
  };

  // Batch Compute All for the month from Central Context (Attendance & Loans)
  const handleBatchComputeAll = () => {
    processMonthlyBatch(); // Refresh compute
    const newPayslips: PayslipItem[] = computedPayslips.map((cp, idx) => {
      const emp = employees.find(e => e.id === cp.employeeId);
      const att = attendance[cp.employeeId] || { employeeId: cp.employeeId, delayMinutes: 0, unpaidAbsenceDays: 0, overtimeHours: 0 };
      
        const dayRate = (cp.basic + (emp?.housingAllowance || 0) + (emp?.transportAllowance || 0) + (emp?.medicalAllowance || 0)) / 26;
        const minRate = (dayRate / (emp?.dailyHours || 8)) / 60;
        const calcAbsenceDed = (att.unpaidAbsenceDays || 0) * dayRate;
        const calcDelayDed = (att.delayMinutes || 0) * minRate;

        return {
          id: `SLIP-${selectedMonth}-${cp.employeeId}`,
          payslipNumber: `PAY/${selectedMonth.replace('-', '/')}/${String(idx + 1).padStart(4, '0')}`,
          employeeId: cp.employeeId,
          employeeName: cp.name,
          civilId: cp.civilId,
          jobTitle: emp?.jobTitle || 'موظف',
          department: emp?.department || 'إدارة',
          bankName: emp?.bankName || 'البنك',
          iban: cp.iban,
          period: selectedMonth,
          basicSalary: cp.basic,
          housingAllowance: emp?.housingAllowance || 0,
          transportAllowance: emp?.transportAllowance || 0,
          medicalAllowance: emp?.medicalAllowance || 0,
          overtimeHours: att.overtimeHours || 0,
          overtimeAmount: cp.overtimeAmount,
          absenceDays: att.unpaidAbsenceDays || 0,
          absenceDeduction: calcAbsenceDed, 
          delayMinutes: att.delayMinutes || 0,
          delayDeduction: calcDelayDed,
          loanDeduction: cp.loanDeduction,
          pifssDeduction: cp.pifssDeduction,
          grossSalary: cp.grossSalary,
          totalDeductions: cp.attendanceDeduction + cp.loanDeduction + cp.pifssDeduction + cp.prepaidDeduction,
          netSalary: cp.netSalary,
          status: 'draft',
          notes: 'تم استيراد واحتساب المسير تلقائياً من محرك البصمة والسلف (Odoo Core)'
        };
    });

    setPayslips(newPayslips);
    alert('تم توليد مسيرات الرواتب واحتساب التأخيرات والإضافي من سجل البصمة والسلف بنجاح!');
  };

  // Export Kuwait WPS File (.SIF) & Audit Sheet
  const handleDownloadWPS_SIF = () => {
    generateKuwaitWpsFiles(
      filteredPayslips, 
      selectedMonth, 
      {
        crNumber: activeCompany?.crNumber || activeCompany?.commercialRegNo || '',
        nameEn: activeCompany?.nameEn || '',
        nameAr: activeCompany?.nameAr || activeCompany?.name || ''
      }
    );
  };

  // Export Payroll List to Excel
  const handleExportPayrollExcel = () => {
    const excelData = filteredPayslips.map((p, idx) => ({
      'م': idx + 1,
      'رقم المسير': p.payslipNumber,
      'كود الموظف': p.employeeId,
      'اسم الموظف': p.employeeName,
      'الرقم المدني': p.civilId,
      'القسم': p.department,
      'المسمى الوظيفي': p.jobTitle,
      'البنك': p.bankName,
      'رقم الحساب (IBAN)': p.iban,
      'الراتب الأساسي (د.ك)': Number(p.basicSalary.toFixed(3)),
      'بدل السكن (د.ك)': Number(p.housingAllowance.toFixed(3)),
      'بدل الانتقال (د.ك)': Number(p.transportAllowance.toFixed(3)),
      'بدل طبي (د.ك)': Number(p.medicalAllowance.toFixed(3)),
      'مبلغ الإضافي (د.ك)': Number(p.overtimeAmount.toFixed(3)),
      'خصم الغياب (د.ك)': Number(p.absenceDeduction.toFixed(3)),
      'خصم التأخير (د.ك)': Number(p.delayDeduction.toFixed(3)),
      'إجمالي الراتب (د.ك)': Number(p.grossSalary.toFixed(3)),
      'إجمالي الاستقطاعات (د.ك)': Number(p.totalDeductions.toFixed(3)),
      'صافي الراتب المحول (د.ك)': Number(p.netSalary.toFixed(3)),
      'حالة المسير': p.status === 'paid' ? 'تم الصرف (WPS)' : p.status === 'confirmed' ? 'معتمد' : p.status === 'review' ? 'قيد المراجعة' : 'مسودة'
    }));

    exportToExcel(excelData, `مسير_رواتب_WPS_شهر_${selectedMonth}.xlsx`, `رواتب ${selectedMonth}`);
  };

  // Create New Payslip Submission
  const handleCreateNewPayslip = (e: React.FormEvent) => {
    e.preventDefault();
    const basic = parseFloat(newForm.basicSalary) || 0;
    const housing = parseFloat(newForm.housingAllowance) || 0;
    const transport = parseFloat(newForm.transportAllowance) || 0;
    const medical = parseFloat(newForm.medicalAllowance) || 0;
    const otHours = parseFloat(newForm.overtimeHours) || 0;
    const absDays = parseFloat(newForm.absenceDays) || 0;
    const delMins = parseFloat(newForm.delayMinutes) || 0;
    const pifss = parseFloat(newForm.pifssDeduction) || 0;

    const totalBase = basic + housing + transport + medical;
    const dayRate = totalBase / 26;
    const hourRate = dayRate / 8;
    const minRate = hourRate / 60;

    const overtimeAmount = Math.round((otHours * hourRate * 1.25) * 1000) / 1000;
    const absenceDeduction = Math.round((absDays * dayRate) * 1000) / 1000;
    const delayDeduction = Math.round((delMins * minRate) * 1000) / 1000;
    
    const grossSalary = totalBase + overtimeAmount;
    const totalDeductions = absenceDeduction + delayDeduction + pifss;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const newId = `SLIP-${selectedMonth}-00${payslips.length + 1}`;
    const newSeq = `PAY/${selectedMonth.replace('-', '/')}/${String(payslips.length + 1).padStart(4, '0')}`;

    const created: PayslipItem = {
      id: newId,
      payslipNumber: newSeq,
      employeeId: `EMP-${String(payslips.length + 1).padStart(3, '0')}`,
      employeeName: newForm.employeeName,
      civilId: newForm.civilId,
      jobTitle: newForm.jobTitle,
      department: newForm.department,
      bankName: newForm.bankName,
      iban: newForm.iban || 'KW00BANK0000000000000000000000',
      period: selectedMonth,
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
      loanDeduction: 0,
      pifssDeduction: pifss,
      grossSalary,
      totalDeductions,
      netSalary,
      status: 'draft',
      notes: 'مسير جديد تم إنشاؤه يدوياً'
    };

    setPayslips([created, ...payslips]);
    setShowNewPayslipModal(false);
    setActivePayslipId(created.id);
  };

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. ODOO CONTROL PANEL & HEADER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Breadcrumbs & Navigation */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>الرواتب</span>
            <span>/</span>
            {activePayslip ? (
              <>
                <button 
                  onClick={() => setActivePayslipId(null)}
                  className="text-slate-600 hover:text-[#714B67] hover:underline cursor-pointer"
                >
                  مسيرات الرواتب (Batch Payslips)
                </button>
                <span>/</span>
                <span className="text-[#714B67] font-black">{activePayslip.payslipNumber} ({activePayslip.employeeName})</span>
              </>
            ) : (
              <span className="text-[#714B67] font-black">مسيرات الرواتب (Batch Payslips - شهر {selectedMonth})</span>
            )}
      {/* --- MODAL: CREATE NEW LOAN --- */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="text-[#714B67]" size={18} />
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                  placeholder="مثال: 500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">القسط الشهري (يخصم من الراتب)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.001"
                  value={newLoan.monthlyInstallment}
                  onChange={(e) => setNewLoan({ ...newLoan, monthlyInstallment: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
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
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
                >
                  اعتماد وتأكيد السلفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="text-[#714B67]" size={22} />
            {activePayslip ? `قسيمة راتب: ${activePayslip.employeeName}` : 'مسير الرواتب ونظام حماية الأجور (Odoo Kuwait WPS)'}
          </h1>
          <p className="text-[11px] text-slate-500">
            المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'المؤسسة الطبية'}</strong> | حسابات قانون العمل الكويتي (أساس 26 يوماً / 8 ساعات)
          </p>
          
          {!activePayslip && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 mt-3 w-full md:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('payslips')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'payslips' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard size={14} /> مسيرات الرواتب
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('loans')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'loans' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign size={14} /> السلف والأقساط
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('eos')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'eos' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator size={14} /> التسويات ونهاية الخدمة
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {activePayslip ? (
            <>
              <button
                onClick={() => setActivePayslipId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRight size={14} /> العودة للمسيرات
              </button>
              <button
                onClick={() => safePrintAction('قسيمة راتب رسمية')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> طباعة القسيمة
              </button>
            </>
          ) : activeSubTab === 'payslips' ? (
            <>
              <button
                onClick={() => setShowNewPayslipModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={15} /> + إنشاء مسير جديد
              </button>
              <button
                onClick={handleBatchComputeAll}
                className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="إعادة احتساب كافة مسيرات الشهر على أساس 26 يوماً"
              >
                <Calculator size={14} /> احتساب الشهر (26 يوماً)
              </button>
              <button
                onClick={handleExportPayrollExcel}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="تصدير كشف مسير الرواتب إلى Excel (.xlsx)"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>تصدير Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleDownloadWPS_SIF}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download size={14} /> تصدير ملف WPS (.SIF)
              </button>
            </>
          ) : activeSubTab === 'loans' ? (
            <button
              onClick={() => setShowLoanModal(true)}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={15} /> تسجيل سلفة جديدة
            </button>
          ) : null}
        </div>

      </div>

      {/* VIEW 1: PAYSLIP FORM SHEET (WHEN A PAYSLIP IS SELECTED) */}
      {activeSubTab === 'payslips' && activePayslip ? (
        <div className="space-y-4">
          
          {/* Status Pipeline & Control Header */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Pipeline */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => handleUpdateStatus(activePayslip.id, 'draft')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activePayslip.status === 'draft' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>مسودة (Draft)</span>
              </button>
              <span className="text-slate-300 px-1">➔</span>
              <button
                onClick={() => handleUpdateStatus(activePayslip.id, 'review')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activePayslip.status === 'review' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>قيد المراجعة</span>
              </button>
              <span className="text-slate-300 px-1">➔</span>
              <button
                onClick={() => handleUpdateStatus(activePayslip.id, 'confirmed')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activePayslip.status === 'confirmed' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>معتمد (Confirmed)</span>
              </button>
              <span className="text-slate-300 px-1">➔</span>
              <button
                onClick={() => handleUpdateStatus(activePayslip.id, 'paid')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activePayslip.status === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>تم التصدير للبنك (Paid)</span>
              </button>
            </div>

            {/* Quick Pipeline Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRecomputePayslip(activePayslip.id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={13} /> إعادة احتساب الورقة
              </button>
              {activePayslip.status === 'draft' && (
                <button
                  onClick={() => handleUpdateStatus(activePayslip.id, 'review')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  إرسال للمراجعة
                </button>
              )}
              {activePayslip.status === 'review' && (
                <button
                  onClick={() => handleUpdateStatus(activePayslip.id, 'confirmed')}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  اعتماد المسير
                </button>
              )}
              {activePayslip.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(activePayslip.id, 'paid')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Send size={13} /> تصدير للبنك (WPS)
                </button>
              )}
            </div>
          </div>

          {/* ODOO FORM SHEET CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            
            {/* Top Smart Buttons (الأزرار الذكية العلوية بنمط Odoo) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-100 pb-5">
              
              {/* Smart Button 1: Gross Salary */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">إجمالي الراتب المستحق</div>
                  <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {activePayslip.grossSalary.toFixed(3)} <span className="text-[10px] font-normal text-slate-500">د.ك</span>
                  </div>
                </div>
                <div className="p-2 bg-purple-100 text-[#714B67] rounded-lg">
                  <DollarSign size={18} />
                </div>
              </div>

              {/* Smart Button 2: Deductions / Absence */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">أيام الخصم / الغياب</div>
                  <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                    {activePayslip.absenceDays} <span className="text-[10px] font-normal text-slate-500">يوم (-{activePayslip.totalDeductions.toFixed(3)} د.ك)</span>
                  </div>
                </div>
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <AlertCircle size={18} />
                </div>
              </div>

              {/* Smart Button 3: Overtime Hours */}
              <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500">ساعات العمل الإضافي</div>
                  <div className="text-base font-black text-blue-600 font-mono mt-0.5">
                    {activePayslip.overtimeHours} <span className="text-[10px] font-normal text-slate-500">ساعة (+{activePayslip.overtimeAmount.toFixed(3)} د.ك)</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Clock size={18} />
                </div>
              </div>

              {/* Smart Button 4: WPS File Ref */}
              <div className="p-3 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-800">ملف WPS المصدّر</div>
                  <div className="text-xs font-black text-emerald-700 font-mono mt-1">
                    {activePayslip.wpsFileRef || 'بانتظار الصرف البنكي'}
                  </div>
                </div>
                <div className="p-2 bg-emerald-200/70 text-emerald-800 rounded-lg">
                  <ShieldCheck size={18} />
                </div>
              </div>

            </div>

            {/* Payslip Main Title & Employee Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">الموظف:</span>
                  <span className="font-black text-sm text-slate-900">{activePayslip.employeeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">الرقم المدني:</span>
                  <span className="font-mono font-bold text-slate-800">{activePayslip.civilId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">المسمى والوظيفة:</span>
                  <span className="font-semibold text-slate-700">{activePayslip.jobTitle} - {activePayslip.department}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">رقم القسيمة:</span>
                  <span className="font-mono font-bold text-[#714B67]">{activePayslip.payslipNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">الفترة المالية:</span>
                  <span className="font-mono font-bold text-slate-800">{activePayslip.period} (30 يوماً / 26 عمل)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold w-24">الحساب البنكي:</span>
                  <span className="font-mono text-slate-700" dir="ltr">{activePayslip.iban}</span>
                </div>
              </div>
            </div>

            {/* Form Sheet Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setFormActiveTab('computation')}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                    formActiveTab === 'computation'
                      ? 'border-[#714B67] text-[#714B67]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calculator size={14} /> تفاصيل احتساب الراتب (Salary Computation)
                  </span>
                </button>
                <button
                  onClick={() => setFormActiveTab('wps_bank')}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                    formActiveTab === 'wps_bank'
                      ? 'border-[#714B67] text-[#714B67]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Landmark size={14} /> بيانات التحويل البنكي وحماية الأجور (WPS)
                  </span>
                </button>
                <button
                  onClick={() => setFormActiveTab('work_entries')}
                  className={`pb-3 px-4 text-xs font-bold transition border-b-2 cursor-pointer ${
                    formActiveTab === 'work_entries'
                      ? 'border-[#714B67] text-[#714B67]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> سجل أيام العمل والدخول (Work Entries & Days)
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: SALARY COMPUTATION BREAKDOWN */}
            {formActiveTab === 'computation' && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">الكود (Code)</th>
                        <th className="p-3">بند الراتب والاستحقاق</th>
                        <th className="p-3">التصنيف</th>
                        <th className="p-3">معادلة الحسبة / الكمية</th>
                        <th className="p-3 text-left">المبلغ (د.ك)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      
                      {/* 1. Basic Salary */}
                      <tr className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-slate-500">BASIC</td>
                        <td className="p-3 font-bold text-slate-900">الراتب الأساسي التعاقدي</td>
                        <td className="p-3"><span className="bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-[10px] font-bold">استحقاق ثابت</span></td>
                        <td className="p-3 text-slate-500">حسب عقد العمل المسجل بالشؤون</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-left">{activePayslip.basicSalary.toFixed(3)}</td>
                      </tr>

                      {/* 2. Housing Allowance */}
                      <tr className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-slate-500">HOUS</td>
                        <td className="p-3 font-bold text-slate-900">بدل السكن</td>
                        <td className="p-3"><span className="bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-[10px] font-bold">بدل نقدي</span></td>
                        <td className="p-3 text-slate-500">بدل شهري ثابت</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-left">{activePayslip.housingAllowance.toFixed(3)}</td>
                      </tr>

                      {/* 3. Transport Allowance */}
                      <tr className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono font-bold text-slate-500">TRANS</td>
                        <td className="p-3 font-bold text-slate-900">بدل الانتقال / المواصلات</td>
                        <td className="p-3"><span className="bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-[10px] font-bold">بدل نقدي</span></td>
                        <td className="p-3 text-slate-500">بدل شهري ثابت</td>
                        <td className="p-3 font-mono font-bold text-slate-900 text-left">{activePayslip.transportAllowance.toFixed(3)}</td>
                      </tr>

                      {/* 4. Medical / Extra Allowance */}
                      {activePayslip.medicalAllowance > 0 && (
                        <tr className="hover:bg-slate-50/60">
                          <td className="p-3 font-mono font-bold text-slate-500">MED</td>
                          <td className="p-3 font-bold text-slate-900">البدل الطبي والتخصصي</td>
                          <td className="p-3"><span className="bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-[10px] font-bold">بدل مهني</span></td>
                          <td className="p-3 text-slate-500">كادر المهن الطبية المساندة</td>
                          <td className="p-3 font-mono font-bold text-slate-900 text-left">{activePayslip.medicalAllowance.toFixed(3)}</td>
                        </tr>
                      )}

                      {/* 5. Overtime Pay */}
                      {activePayslip.overtimeAmount > 0 && (
                        <tr className="hover:bg-blue-50/50 bg-blue-50/20">
                          <td className="p-3 font-mono font-bold text-blue-600">OVERTIME</td>
                          <td className="p-3 font-bold text-blue-900">أجر العمل الإضافي (مادة 66)</td>
                          <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">إضافي (1.25x)</span></td>
                          <td className="p-3 text-blue-700 font-mono">{activePayslip.overtimeHours} ساعة × (الراتب ÷ 26 ÷ 8) × 1.25</td>
                          <td className="p-3 font-mono font-bold text-blue-700 text-left">+{activePayslip.overtimeAmount.toFixed(3)}</td>
                        </tr>
                      )}

                      {/* 6. Absence Deductions */}
                      {activePayslip.absenceDeduction > 0 && (
                        <tr className="hover:bg-rose-50/50 bg-rose-50/20">
                          <td className="p-3 font-mono font-bold text-rose-600">DED_ABSENCE</td>
                          <td className="p-3 font-bold text-rose-900">خصم أيام الغياب بدون إذن</td>
                          <td className="p-3"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">استقطاع</span></td>
                          <td className="p-3 text-rose-700 font-mono">{activePayslip.absenceDays} يوم × (الراتب الشامل ÷ 26)</td>
                          <td className="p-3 font-mono font-bold text-rose-600 text-left">-{activePayslip.absenceDeduction.toFixed(3)}</td>
                        </tr>
                      )}

                      {/* 7. Delay Deductions */}
                      {activePayslip.delayDeduction > 0 && (
                        <tr className="hover:bg-rose-50/50 bg-rose-50/20">
                          <td className="p-3 font-mono font-bold text-rose-600">DED_DELAY</td>
                          <td className="p-3 font-bold text-rose-900">خصم دقائق التأخير الصباحي</td>
                          <td className="p-3"><span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">استقطاع</span></td>
                          <td className="p-3 text-rose-700 font-mono">{activePayslip.delayMinutes} دقيقة بعد فترة السماح</td>
                          <td className="p-3 font-mono font-bold text-rose-600 text-left">-{activePayslip.delayDeduction.toFixed(3)}</td>
                        </tr>
                      )}

                      {/* 8. PIFSS Social Security */}
                      {activePayslip.pifssDeduction > 0 && (
                        <tr className="hover:bg-amber-50/50 bg-amber-50/20">
                          <td className="p-3 font-mono font-bold text-amber-600">PIFSS</td>
                          <td className="p-3 font-bold text-amber-900">اشتراك التأمينات الاجتماعية للمواطنين</td>
                          <td className="p-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">تأمينات</span></td>
                          <td className="p-3 text-amber-700 font-mono">حصة الموظف المسجلة بالتأمينات</td>
                          <td className="p-3 font-mono font-bold text-amber-600 text-left">-{activePayslip.pifssDeduction.toFixed(3)}</td>
                        </tr>
                      )}

                      {/* 9. Gross & Net Totals */}
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                        <td colSpan={4} className="p-3.5 text-slate-800 font-black">إجمالي الراتب المستحق (Gross Earnings):</td>
                        <td className="p-3.5 font-mono text-slate-900 text-sm font-black text-left">{activePayslip.grossSalary.toFixed(3)} د.ك</td>
                      </tr>
                      <tr className="bg-rose-50 font-bold">
                        <td colSpan={4} className="p-3.5 text-rose-800 font-black">إجمالي الاستقطاعات والخصومات (Total Deductions):</td>
                        <td className="p-3.5 font-mono text-rose-700 text-sm font-black text-left">-{activePayslip.totalDeductions.toFixed(3)} د.ك</td>
                      </tr>
                      <tr className="bg-emerald-100 font-black text-emerald-950 border-t border-emerald-300 text-sm">
                        <td colSpan={4} className="p-4 text-emerald-950">صافي الراتب المستحق للتحويل البنكي (NET PAYABLE):</td>
                        <td className="p-4 font-mono text-emerald-800 text-base text-left">{activePayslip.netSalary.toFixed(3)} د.ك</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] space-y-1">
                  <div className="font-bold text-slate-700">ملاحظات النظام وقانون العمل الكويتي:</div>
                  <div>• يتم احتساب أجر اليوم بقسمة الراتب الشامل على <strong>26 يوماً</strong> طبقاً للمادة 55 و 68 من القانون 6/2010.</div>
                  <div>• أجر الساعة = (أجر اليوم ÷ 8 ساعات عمل رسمية). العطلات الرسمية لا تخصم من الراتب.</div>
                </div>
              </div>
            )}

            {/* TAB 2: WPS & BANK DETAILS */}
            {formActiveTab === 'wps_bank' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Landmark className="text-[#714B67]" size={16} /> بيانات الحساب المصرفي (Bank Account)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">اسم البنك المعتمد:</span>
                        <span className="font-bold text-slate-900">{activePayslip.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">رقم الآيبان (IBAN):</span>
                        <span className="font-mono font-bold text-slate-900" dir="ltr">{activePayslip.iban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">كود البنك في المقاصة:</span>
                        <span className="font-mono text-slate-700">{(activePayslip.iban || '').substring(4, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600" size={16} /> نظام حماية الأجور (WPS SIF File)
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">رقم السجل التجاري للشركة:</span>
                        <span className="font-mono font-bold text-slate-900">{activeCompany?.crNumber || activeCompany?.commercialRegNo || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">رقم الملف بوزارة الشؤون:</span>
                        <span className="font-mono font-bold text-slate-900">{activeCompany?.pifssNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">مرجع عملية الصرف:</span>
                        <span className="font-mono font-bold text-emerald-700">{activePayslip.wpsFileRef || 'قيد الإنشاء'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">جاهزية الملف البنكي للكويت</div>
                    <div className="text-[11px] text-emerald-700">هذا السجل مستوفٍ لكافة متطلبات بنك الكويت المركزي ونظام حماية الأجور.</div>
                  </div>
                  <button
                    onClick={handleDownloadWPS_SIF}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={14} /> تحميل ملف SIF
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: WORK ENTRIES & DAYS */}
            {formActiveTab === 'work_entries' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-500 font-bold">أيام الشهر التقويمي</div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-1">30 يوماً</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-500 font-bold">أيام العمل المعتمدة</div>
                    <div className="text-xl font-black text-[#714B67] font-mono mt-1">26 يوماً</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-500 font-bold">العطلات الرسمية المعتمدة</div>
                    <div className="text-xl font-black text-emerald-700 font-mono mt-1">مدفوعة 100%</div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-500 font-bold">أيام الغياب المحتسبة</div>
                    <div className="text-xl font-black text-rose-600 font-mono mt-1">{activePayslip.absenceDays} يوم</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-2">ملاحظات المسير وسجل البصمة:</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activePayslip.notes || 'لا توجد ملاحظات إضافية على هذا المسير.'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      ) : activeSubTab === 'payslips' && !activePayslip ? (
        /* VIEW 2: PAYSLIPS BATCH LIST & DASHBOARD (ODOO LIST VIEW) */
        <div className="space-y-5">
          
          {/* Financial KPIs Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>إجمالي الاستحقاقات (Gross)</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalGross.toFixed(3)} <span className="text-xs font-normal text-slate-500">د.ك</span></div>
              <div className="text-[10px] text-slate-500 mt-1">الأساسي + البدلات + الإضافي</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>إجمالي الخصومات والتأمينات</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600">{totalDeductions.toFixed(3)} <span className="text-xs font-normal text-slate-500">د.ك</span></div>
              <div className="text-[10px] text-rose-700 mt-1">غياب + تأخير + تأمينات اجتماعية</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
                <span>بدل العمل الإضافي للشهر</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-600">{totalOvertime.toFixed(3)} <span className="text-xs font-normal text-slate-500">د.ك</span></div>
              <div className="text-[10px] text-blue-700 mt-1">طبقاً لساعات البصمة المعتمدة</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs bg-gradient-to-br from-emerald-50/60 to-white">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold mb-1">
                <span>صافي مسير التحويل (WPS)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{totalNet.toFixed(3)} <span className="text-xs font-normal text-emerald-600">د.ك</span></div>
              <div className="text-[10px] text-emerald-800 mt-1 font-bold">جاهز للصرف والتحويل للبنوك</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filters */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500">الشهر:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#714B67]"
              />

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  الكل ({payslips.filter(p => p.period === selectedMonth).length})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  مسودة
                </button>
                <button
                  onClick={() => setStatusFilter('review')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${statusFilter === 'review' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  قيد المراجعة
                </button>
                <button
                  onClick={() => setStatusFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${statusFilter === 'confirmed' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  تم التدقيق
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'}`}
                >
                  تم الدفع عبر WPS
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالموظف، الرقم المدني، أو الآيبان..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#714B67] outline-none"
              />
            </div>

          </div>

          {/* Payslips Table (Odoo Zebra Table) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">رقم القسيمة</th>
                    <th className="p-3.5">الموظف والرقم المدني</th>
                    <th className="p-3.5">البنك والآيبان</th>
                    <th className="p-3.5">الأساسي</th>
                    <th className="p-3.5">البدلات والإضافي</th>
                    <th className="p-3.5">الاستقطاعات</th>
                    <th className="p-3.5">صافي الراتب (0.000 د.ك)</th>
                    <th className="p-3.5 text-center">المرحلة / الحالة</th>
                    <th className="p-3.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayslips.map((slip, idx) => (
                    <tr 
                      key={slip.id} 
                      onClick={() => setActivePayslipId(slip.id)}
                      className={`hover:bg-purple-50/40 transition cursor-pointer ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                    >
                      <td className="p-3.5 font-mono font-bold text-[#714B67]">{slip.payslipNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{slip.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{slip.civilId} - {slip.jobTitle}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-700">{slip.bankName}</div>
                        <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{(slip.iban || '').substring(0, 12)}...</div>
                      </td>
                      <td className="p-3.5 font-bold font-mono text-slate-800">{slip.basicSalary.toFixed(3)}</td>
                      <td className="p-3.5 font-bold font-mono text-slate-700">
                        {(slip.housingAllowance + slip.transportAllowance + slip.medicalAllowance + slip.overtimeAmount).toFixed(3)}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-rose-600">
                        {slip.totalDeductions > 0 ? `-${slip.totalDeductions.toFixed(3)}` : '0.000'}
                      </td>
                      <td className="p-3.5 font-black font-mono text-emerald-700 text-sm">
                        {slip.netSalary.toFixed(3)} د.ك
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {slip.status === 'draft' && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            مسودة (Draft)
                          </span>
                        )}
                        {slip.status === 'review' && (
                          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            قيد المراجعة
                          </span>
                        )}
                        {slip.status === 'confirmed' && (
                          <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            تم التدقيق
                          </span>
                        )}
                        {slip.status === 'paid' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 size={11} /> مدفوع عبر WPS
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActivePayslipId(slip.id)}
                            className="p-1.5 bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 rounded-lg transition cursor-pointer"
                            title="فتح ورقة قسيمة الراتب"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePayslip(slip.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                            title="مسح المسير"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPayslips.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        لا توجد مسيرات رواتب مطابقة للبحث أو الفلتر المحدد لشهر {selectedMonth}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}

      {/* --- TAB 2: LOANS --- */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800">إدارة السلف والأقساط الشهرية</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">يتم استقطاع القسط الشهري تلقائياً من مسير الرواتب حتى سداد إجمالي السلفة.</p>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">رقم السلفة</th>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">إجمالي السلفة</th>
                <th className="p-3.5">القسط الشهري</th>
                <th className="p-3.5">ما تم سداده</th>
                <th className="p-3.5">الرصيد المتبقي</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((ln) => {
                const emp = employees.find(e => e.id === ln.employeeId);
                const paidAmt = ln.totalAmount - ln.remainingAmount;
                const isPaidOff = ln.remainingAmount <= 0;
                return (
                  <tr key={ln.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-500">{ln.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{emp?.name || '---'}</td>
                    <td className="p-3.5 font-bold font-mono text-slate-800">{ln.totalAmount.toFixed(3)} د.ك</td>
                    <td className="p-3.5 font-bold font-mono text-blue-600">{ln.monthlyInstallment.toFixed(3)} د.ك / شهر</td>
                    <td className="p-3.5 font-bold font-mono text-emerald-600">{paidAmt.toFixed(3)} د.ك</td>
                    <td className="p-3.5 font-bold font-mono text-rose-600">{ln.remainingAmount.toFixed(3)} د.ك</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isPaidOff ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {isPaidOff ? 'تم السداد بالكامل' : 'جاري الخصم بالراتب'}
                      </span>
                    </td>
                    <td className="p-3.5 flex items-center gap-1">
                      {!isPaidOff && (
                        <button onClick={() => registerLoanPayment(ln.id, ln.monthlyInstallment)} className="text-emerald-600 hover:text-emerald-800 p-1 rounded-md hover:bg-emerald-50 transition cursor-pointer" title="تسجيل سداد قسط يدوي (خارج الراتب)">
                          سداد قسط
                        </button>
                      )}
                      <button onClick={() => deleteLoan(ln.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer" title="حذف السلفة">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 3: EOS --- */}
      {activeSubTab === 'eos' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b pb-3 mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="text-[#714B67]" size={20} />
              حاسبة مكافأة نهاية الخدمة والتسوية الختامية (مادة 51 من قانون العمل الكويتي 6/2010)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحسب المكافأة على أساس أجر 15 يوماً عن كل سنة من السنوات الـ 5 الأولى، وأجر شهر عن كل سنة تالية (الحد الأقصى 18 شهراً).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الموظف المعني بالتسوية:</label>
                <input
                  type="text"
                  value={eosData.empName}
                  onChange={(e) => setEosData({ ...eosData, empName: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الراتب الشامل الأخير (د.ك):</label>
                  <input
                    type="number"
                    value={eosData.salary}
                    onChange={(e) => setEosData({ ...eosData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">سبب إنهاء العلاقة التعاقدية:</label>
                  <select
                    value={eosData.reason}
                    onChange={(e) => setEosData({ ...eosData, reason: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  >
                    <option value="termination_by_company">إنهاء خدمة من طرف المنشأة / انتهاء العقد</option>
                    <option value="resignation">استقالة الموظف (المادة 53)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">سنوات الخدمة:</label>
                  <input
                    type="number"
                    value={eosData.years}
                    onChange={(e) => setEosData({ ...eosData, years: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الأشهر الإضافية:</label>
                  <input
                    type="number"
                    value={eosData.months}
                    onChange={(e) => setEosData({ ...eosData, months: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between text-xs">
              <div>
                <h4 className="font-bold text-sm text-slate-800 border-b pb-2 mb-4">صافي المستحقات (مكافأة نهاية الخدمة)</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>الأساس القانوني:</span>
                    <span className="font-bold font-mono">26 يوم عمل (راتب كامل)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>معدل الأجر اليومي:</span>
                    <span className="font-bold font-mono">{(eosData.salary / 26).toFixed(3)} د.ك</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>استحقاق أول 5 سنوات (15 يوم):</span>
                    <span className="font-bold font-mono">
                      {Math.min(5, eosData.years + (eosData.months/12)) * 15} يوم
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>استحقاق ما بعد 5 سنوات (شهر):</span>
                    <span className="font-bold font-mono">
                      {Math.max(0, (eosData.years + (eosData.months/12) - 5))} شهر
                    </span>
                  </div>
                  {eosData.reason === 'resignation' && (
                    <div className="flex justify-between items-center text-rose-600 bg-rose-50 p-2 rounded-lg mt-2">
                      <span className="font-bold">خصم الاستقالة (المادة 53):</span>
                      <span className="font-bold">مُطبق</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-black text-sm text-slate-900">إجمالي مكافأة نهاية الخدمة:</span>
                  <span className="font-black text-xl text-[#714B67] bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                    {calculateEOS()} د.ك
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  * هذا الحساب للمكافأة فقط ولا يشمل تصفية رصيد الإجازات المتبقي أو استقطاع السلف القائمة.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW PAYSLIP --- */}
      {showNewPayslipModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="text-[#714B67]" size={18} />
                إنشاء قسيمة راتب جديدة لشهر {selectedMonth}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموظف *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الموظف الثلاثي"
                    value={newForm.employeeName}
                    onChange={(e) => setNewForm({ ...newForm, employeeName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني (12 رقم) *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="290010112345"
                    value={newForm.civilId}
                    onChange={(e) => setNewForm({ ...newForm, civilId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    value={newForm.jobTitle}
                    onChange={(e) => setNewForm({ ...newForm, jobTitle: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / الإدارة:</label>
                  <input
                    type="text"
                    value={newForm.department}
                    onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البنك المعتمد:</label>
                  <select
                    value={newForm.bankName}
                    onChange={(e) => setNewForm({ ...newForm, bankName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-bold outline-none focus:border-[#714B67]"
                  >
                    <option value="بنك الكويت الوطني (NBK)">بنك الكويت الوطني (NBK)</option>
                    <option value="بيت التمويل الكويتي (KFH)">بيت التمويل الكويتي (KFH)</option>
                    <option value="بنك بوبيان (Boubyan)">بنك بوبيان (Boubyan)</option>
                    <option value="بنك الخليج (Gulf Bank)">بنك الخليج (Gulf Bank)</option>
                    <option value="بنك برقان (Burgan)">بنك برقان (Burgan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الآيبان (IBAN):</label>
                  <input
                    type="text"
                    placeholder="KW00BANK0000000000000000000000"
                    value={newForm.iban}
                    onChange={(e) => setNewForm({ ...newForm, iban: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
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
                    <label className="block text-[11px] text-slate-500 mb-1">ساعات الإضافي</label>
                    <input
                      type="number"
                      value={newForm.overtimeHours}
                      onChange={(e) => setNewForm({ ...newForm, overtimeHours: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">أيام الغياب</label>
                    <input
                      type="number"
                      value={newForm.absenceDays}
                      onChange={(e) => setNewForm({ ...newForm, absenceDays: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">دقائق التأخير</label>
                    <input
                      type="number"
                      value={newForm.delayMinutes}
                      onChange={(e) => setNewForm({ ...newForm, delayMinutes: e.target.value })}
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
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer"
                >
                  إنشاء المسير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

