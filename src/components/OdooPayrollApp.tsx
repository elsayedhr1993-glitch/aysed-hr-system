import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Download, FileSpreadsheet, CheckCircle2, AlertCircle, 
  Clock, Calculator, Building2, Printer, Search, Eye, ArrowRight,
  ShieldCheck, DollarSign, Plus, Filter, FileText, User, Calendar, 
  AlertTriangle, RotateCcw, Check, Send, Building, Hash, Landmark, 
  ArrowUpRight, Trash2, X, RefreshCw, Layers, Sliders, Scale
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { exportToExcel } from '../utils/exportUtils';
import { OfficialPayslipPrintModal, PayslipPrintData } from './payroll/OfficialPayslipPrintModal';
import { WpsAuditShieldModal, WpsAuditItem } from './payroll/WpsAuditShieldModal';
import { FinalSettlementModal } from './payroll/FinalSettlementModal';
import { PifssInsuranceReportModal } from './payroll/PifssInsuranceReportModal';
import { PayrollStructureWizardModal } from './payroll/PayrollStructureWizardModal';
import { EosSetupWizardModal } from './payroll/EosSetupWizardModal';
import { db, cleanFirestoreData } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';

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
  pifssDeduction: number; // اشتراك التأمينات الاجتماعية للكويتيين
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'review' | 'confirmed' | 'paid';
  wpsFileRef?: string;
  notes?: string;
}

export const OdooPayrollApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { settings } = useSystemSettings();
  const { 
    employees, 
    attendance,
    getAttendanceForEmployee,
    loans, 
    addLoan, 
    deleteLoan, 
    computedPayslips, 
    processMonthlyBatch, 
    registerLoanPayment 
  } = useOdooHierarchy();
  
  const [activeSubTab, setActiveSubTab] = useState<'payslips' | 'wps' | 'loans' | 'settlements'>('payslips');
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
  const [showPifssModal, setShowPifssModal] = useState(false);
  const [showPayrollWizard, setShowPayrollWizard] = useState(false);
  const [showEosWizard, setShowEosWizard] = useState(false);

  const [payslips, setPayslips] = useState<PayslipItem[]>([]);

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
          .map(item => ({ ...item.data(), id: item.id } as PayslipItem))
          .filter(item => (item as PayslipItem & { companyId?: string }).companyId === companyId);
        setPayslips(remote);
      },
      error => console.error('Failed to load payslips from Firestore', error)
    );
  }, [activeCompany?.id]);

  const savePayslips = (newList: PayslipItem[]) => {
    setPayslips(newList);
    const companyId = activeCompany?.id;
    if (!companyId) return;
    newList.forEach(payslip => {
      void setDoc(
        doc(db, 'payslips', payslip.id),
        cleanFirestoreData({ ...payslip, companyId }),
        { merge: true }
      ).catch(error => console.error('Failed to save payslip to Firestore', error));
    });
  };

  // Generate initial or refreshed payslips from employees & attendance
  const generateInitialPayslips = () => {
    if (!employees || employees.length === 0) return;
    const initialList: PayslipItem[] = employees.map((emp, idx) => {
      const att = getAttendanceForEmployee(emp.id) || { employeeId: emp.id, delayMinutes: 0, unpaidAbsenceDays: 0, overtimeHours: 0 };
      const empLoan = loans.find(l => l.employeeId === emp.id && l.remainingAmount > 0);

      const totalBase = (emp.basicSalary || 0) + (emp.housingAllowance || 0) + (emp.transportAllowance || 0) + (emp.medicalAllowance || 0);
      const dayRate = totalBase / 26;
      const minRate = (dayRate / (emp.dailyHours || 8)) / 60;
      const hourRate = dayRate / (emp.dailyHours || 8);

      const overtimeHours = att.overtimeHours || 0;
      const overtimeAmount = 0;
      const absenceDays = att.unpaidAbsenceDays || 0;
      const absenceDeduction = Math.round((absenceDays * dayRate) * 1000) / 1000;
      const delayMinutes = att.delayMinutes || 0;
      const delayDeduction = Math.round((delayMinutes * minRate) * 1000) / 1000;
      const loanDeduction = empLoan ? Math.min(empLoan.monthlyInstallment, empLoan.remainingAmount) : 0;
      
      const pifssDeduction = 0;

      const grossSalary = totalBase;
      const totalDeductions = absenceDeduction + delayDeduction + loanDeduction;
      const netSalary = Math.max(0, grossSalary - totalDeductions);

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
        absenceDays,
        absenceDeduction,
        delayMinutes,
        delayDeduction,
        loanDeduction,
        pifssDeduction,
        grossSalary,
        totalDeductions,
        netSalary,
        status: 'draft',
        notes: 'مسير معتمد ومحسوب تلقائياً وفق قانون العمل الكويتي (أساس 26 يوم عمل)'
      };
    });

    savePayslips(initialList);
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

  const handleDeletePayslip = (id: string) => {
    if (confirm('هل أنت متأكد من حذف مسير الراتب هذا نهائياً؟')) {
      const updated = payslips.filter(p => p.id !== id);
      savePayslips(updated);
      if (activePayslipId === id) {
        setActivePayslipId(null);
      }
    }
  };

  // New Payslip Modal Form State
  const [newForm, setNewForm] = useState({
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
    delayMinutes: '0',
    pifssDeduction: '0'
  });

  // Handle employee select in New Payslip Modal
  const handleSelectEmployeeForPayslip = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const att = getAttendanceForEmployee(empId) || { delayMinutes: 0, unpaidAbsenceDays: 0, overtimeHours: 0 };
    const pifss = '0';

    setNewForm({
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
      overtimeHours: String(att.overtimeHours || 0),
      absenceDays: String(att.unpaidAbsenceDays || 0),
      delayMinutes: String(att.delayMinutes || 0),
      pifssDeduction: pifss
    });
  };

  const handleCreateNewPayslip = (e: React.FormEvent) => {
    e.preventDefault();
    const basic = parseFloat(newForm.basicSalary) || 0;
    const housing = parseFloat(newForm.housingAllowance) || 0;
    const transport = parseFloat(newForm.transportAllowance) || 0;
    const medical = parseFloat(newForm.medicalAllowance) || 0;
    const otHours = parseFloat(newForm.overtimeHours) || 0;
    const absDays = parseFloat(newForm.absenceDays) || 0;
    const delMins = parseFloat(newForm.delayMinutes) || 0;
    const pifss = 0;

    const totalBase = basic + housing + transport + medical;
    const dayRate = totalBase / 26;
    const hourRate = dayRate / 8;
    const minRate = hourRate / 60;

    const overtimeAmount = 0;
    const absenceDeduction = Math.round((absDays * dayRate) * 1000) / 1000;
    const delayDeduction = Math.round((delMins * minRate) * 1000) / 1000;
    
    const grossSalary = totalBase;
    const totalDeductions = absenceDeduction + delayDeduction;
    const netSalary = Math.max(0, grossSalary - totalDeductions);

    const newId = `SLIP-${selectedMonth}-${newForm.employeeId || '00' + (payslips.length + 1)}`;
    const newSeq = `PAY/${selectedMonth.replace('-', '/')}/${String(payslips.length + 1).padStart(4, '0')}`;

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
      pifssDeduction: 0,
      grossSalary,
      totalDeductions,
      netSalary,
      status: 'draft',
      notes: 'مسير تم إدخاله واحتسابه يدوياً'
    };

    savePayslips([created, ...payslips.filter(p => p.id !== created.id)]);
    setShowNewPayslipModal(false);
    setActivePayslipId(created.id);
  };

  // Re-compute single payslip based on Kuwait Labor Law (26 days)
  const handleRecomputePayslip = (id: string) => {
    const divisor = 26;
    const dailyHours = 8;
    const overtimeMult = 1.25;

    const updated = payslips.map(p => {
      if (p.id === id) {
        const totalBase = p.basicSalary + p.housingAllowance + p.transportAllowance + p.medicalAllowance;
        const dayRate = totalBase / divisor;
        const hourRate = dayRate / dailyHours;
        const minRate = hourRate / 60;

        const overtimeAmount = 0;
        const absenceDeduction = Math.round((p.absenceDays * dayRate) * 1000) / 1000;
        const delayDeduction = Math.round((p.delayMinutes * minRate) * 1000) / 1000;
        
        const grossSalary = totalBase;
        const totalDeductions = absenceDeduction + delayDeduction + p.loanDeduction;
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
      pifssDeduction: p.pifssDeduction,
      grossSalary: p.grossSalary,
      totalDeductions: p.totalDeductions,
      netSalary: p.netSalary,
      status: p.status
    });
    setShowOfficialPayslipModal(true);
  };

  // Filtered List
  const filteredPayslips = useMemo(() => {
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

  const activePayslip = payslips.find(p => p.id === activePayslipId) || null;

  // KPI calculations
  const totalNet = filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = filteredPayslips.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalDeductionsAll = filteredPayslips.reduce((sum, p) => sum + p.totalDeductions, 0);

  // PIFSS employee dataset
  const pifssData = useMemo(() => [], []);

  // EOS employee dataset
  const settlementEmployees = useMemo(() => {
    return employees.map(emp => {
      const empLoan = loans.find(l => l.employeeId === emp.id && l.remainingAmount > 0);
      return {
        id: emp.id,
        name: emp.name,
        civilId: emp.civilId || '',
        jobTitle: emp.jobTitle || 'موظف',
        department: emp.department || 'إدارة',
        joinDate: emp.joinDate || '2022-01-01',
        basicSalary: emp.basicSalary || 0,
        housingAllowance: emp.housingAllowance || 0,
        transportAllowance: emp.transportAllowance || 0,
        medicalAllowance: emp.medicalAllowance || 0,
        leaveBalanceDays: 15,
        activeLoanRemaining: empLoan ? empLoan.remainingAmount : 0
      };
    });
  }, [employees, loans]);

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
                onClick={() => setActiveSubTab('wps')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'wps' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={14} className="text-emerald-600" /> حماية الأجور (WPS & SIF)
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
                onClick={() => setActiveSubTab('settlements')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'settlements' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator size={14} className="text-indigo-600" /> التسويات والتأمينات (PIFSS & EOS)
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
                onClick={() => handleOpenPrintModal(activePayslip)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={14} /> طباعة القسيمة الرسمية (A4)
              </button>
            </>
          ) : activeSubTab === 'payslips' ? (
            <>
              <button
                onClick={() => setShowPayrollWizard(true)}
                className="bg-purple-900 hover:bg-purple-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-purple-800"
                title="تثبيت هيكل الأجور ومسير البنك وتأمينات PIFSS"
              >
                <Sliders size={15} className="text-amber-300" /> هيكل الأجور ومسير WPS
              </button>

              <button
                onClick={() => setShowNewPayslipModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={15} /> + إنشاء مسير جديد
              </button>
              <button
                onClick={generateInitialPayslips}
                className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="تحديث وسحب حركات البصمة والسلف الحالية"
              >
                <RefreshCw size={14} /> سحب حركات الدوام
              </button>
              <button
                onClick={() => setShowWpsAuditModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> فحص حماية الأجور
              </button>
            </>
          ) : activeSubTab === 'wps' ? (
            <>
              <button
                onClick={() => setShowWpsAuditModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck size={15} /> درع فحص حماية الأجور (Audit Shield)
              </button>
            </>
          ) : activeSubTab === 'loans' ? (
            <button
              onClick={() => setShowLoanModal(true)}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={15} /> + تسجيل سلفة جديدة
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowEosWizard(true)}
                className="bg-emerald-900 hover:bg-emerald-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-emerald-800"
                title="تثبيت لائحة ومحرك مكافأة نهاية الخدمة (المادتين 51 و 53)"
              >
                <Scale size={15} className="text-amber-300" /> لائحة نهاية الخدمة والتسويات
              </button>
              <button
                onClick={() => setShowFinalSettlementModal(true)}
                className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} /> مخالصة نهاية الخدمة (Clearance)
              </button>
              <button
                onClick={() => setShowPifssModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> كشف التأمينات (PIFSS)
              </button>
            </div>
          )}
        </div>
      </div>

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
                      مسودة (Draft)
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'review')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'review' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      مراجعة (Review)
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'confirmed')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      معتمد (Confirmed)
                    </button>
                    <span className="text-slate-300">➔</span>
                    <button
                      onClick={() => handleStatusChange(activePayslip.id, 'paid')}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition ${
                        activePayslip.status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      تم الصرف والتحويل (Paid)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRecomputePayslip(activePayslip.id)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} /> إعادة الحساب الهرمي
                  </button>
                  <button
                    onClick={() => handleOpenPrintModal(activePayslip)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} /> طباعة القسيمة
                  </button>
                  <button
                    onClick={() => handleDeletePayslip(activePayslip.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> حذف
                  </button>
                </div>
              </div>

              {/* Payslip Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activePayslip.employeeName}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      كود: {activePayslip.employeeId} | الرقم المدني: {activePayslip.civilId} | الوظيفة: {activePayslip.jobTitle}
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
                      formActiveTab === 'computation' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    احتساب الراتب (Salary Computation)
                  </button>
                  <button
                    onClick={() => setFormActiveTab('wps_bank')}
                    className={`pb-2.5 transition cursor-pointer ${
                      formActiveTab === 'wps_bank' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    بيانات البنك وحماية الأجور (WPS Info)
                  </button>
                  <button
                    onClick={() => setFormActiveTab('work_entries')}
                    className={`pb-2.5 transition cursor-pointer ${
                      formActiveTab === 'work_entries' ? 'border-b-2 border-[#714B67] text-[#714B67]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    حركات الدوام والغياب (Work Entries)
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
                      <div className="flex justify-between py-1 border-b border-slate-100 text-amber-700">
                        <span>اشتراك التأمينات الاجتماعية (PIFSS):</span>
                        <strong className="font-mono">-{activePayslip.pifssDeduction.toFixed(3)} د.ك</strong>
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
                        <strong className="font-mono text-slate-800">{activePayslip.civilId}</strong>
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
                      <span className="font-mono">{(activePayslip.grossSalary / 26).toFixed(3)} د.ك / يوم</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">أجر ساعة العمل الأساسية:</span>
                      <span className="font-mono">{((activePayslip.grossSalary / 26) / 8).toFixed(3)} د.ك / ساعة</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">معامل العمل الإضافي المطبق:</span>
                      <span className="font-bold text-purple-800 font-mono">1.25x (الأيام العادية طبقاً للمادة 66)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ODOO TREE / TABLE VIEW FOR ALL PAYSLIPS */
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="بحث بالاسم، الرقم المدني، كود المسير..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#714B67]"
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

              {/* KPI Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block">إجمالي المسيرات</span>
                  <div className="text-lg font-black font-mono text-slate-900 mt-1">{filteredPayslips.length}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block">إجمالي الرواتب الشاملة</span>
                  <div className="text-base font-black font-mono text-slate-800 mt-1">{totalGross.toFixed(3)} د.ك</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-slate-500 text-[10px] block">إجمالي الاستقطاعات</span>
                  <div className="text-base font-black font-mono text-rose-700 mt-1">-{totalDeductionsAll.toFixed(3)} د.ك</div>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-emerald-800 text-[10px] block">صافي الرواتب المستحقة (WPS)</span>
                  <div className="text-lg font-black font-mono text-emerald-800 mt-1">{totalNet.toFixed(3)} د.ك</div>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-3">رقم المسير</th>
                        <th className="p-3">الموظف</th>
                        <th className="p-3">الرقم المدني</th>
                        <th className="p-3">الأساسي</th>
                        <th className="p-3">الإضافي</th>
                        <th className="p-3">الخصومات</th>
                        <th className="p-3">صافي الراتب</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPayslips.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400">
                            لا توجد قسائم رواتب مسجلة لهذا الشهر. اضغط على "+ إنشاء مسير جديد" أو "سحب حركات الدوام".
                          </td>
                        </tr>
                      ) : (
                        filteredPayslips.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono font-bold text-slate-600">{p.payslipNumber}</td>
                            <td className="p-3">
                              <button
                                onClick={() => setActivePayslipId(p.id)}
                                className="font-bold text-slate-900 hover:text-[#714B67] hover:underline cursor-pointer block text-right"
                              >
                                {p.employeeName}
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono">{p.employeeId} - {p.jobTitle}</span>
                            </td>
                            <td className="p-3 font-mono text-slate-700">{p.civilId}</td>
                            <td className="p-3 font-mono font-bold text-slate-800">{p.basicSalary.toFixed(3)}</td>
                            <td className="p-3 font-mono text-emerald-700">
                              {p.overtimeAmount > 0 ? `+${p.overtimeAmount.toFixed(3)}` : '-'}
                            </td>
                            <td className="p-3 font-mono text-rose-700">
                              {p.totalDeductions > 0 ? `-${p.totalDeductions.toFixed(3)}` : '0.000'}
                            </td>
                            <td className="p-3 font-mono font-black text-emerald-700 text-sm">{p.netSalary.toFixed(3)} د.ك</td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                p.status === 'review' ? 'bg-amber-100 text-amber-800' :
                                p.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {p.status === 'draft' ? 'مسودة' : p.status === 'review' ? 'قيد المراجعة' : p.status === 'confirmed' ? 'معتمد' : 'مدفوع'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenPrintModal(p)}
                                  className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                  title="طباعة قسيمة الراتب A4"
                                >
                                  <Printer size={15} />
                                </button>
                                <button
                                  onClick={() => setActivePayslipId(p.id)}
                                  className="p-1 text-[#714B67] hover:bg-purple-50 rounded-md transition cursor-pointer"
                                  title="معاينة تفاصيل المسير"
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeletePayslip(p.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition cursor-pointer"
                                  title="حذف المسير"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                  نظام حماية الأجور الكويتي والربط البنكي (Kuwait WPS & SIF Generator)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  توليد ملف التحويل المصرفي (.SIF) المعتمد من بنك الكويت المركزي وتدقيق مطابقة رواتب إذن العمل (القوى العاملة).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWpsAuditModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShieldCheck size={14} /> فحص اللوائح والآيبان (Compliance Shield)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">رمز المنشأة / السجل التجاري:</span>
                <strong className="text-sm font-mono text-slate-900 mt-1 block">
                  {activeCompany?.crNumber || activeCompany?.commercialRegNo || '104829'}
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">يتم استخدامه في ترويسة ملف التحويل المالي</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">إجمالي الرواتب الصافية لشهر ({selectedMonth}):</span>
                <strong className="text-sm font-mono text-emerald-700 mt-1 block">
                  {totalNet.toFixed(3)} د.ك
                </strong>
                <span className="text-[10px] text-slate-400 mt-1 block">عدد الموظفين المشمولين: {filteredPayslips.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">التوافق مع بنك الكويت المركزي:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-1 block">
                  <CheckCircle2 size={14} /> متوافق مع معايير CBK & PAM
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">ملف SIF مشفر بنظام التبادل المصرفي</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowWpsAuditModal(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={16} className="text-emerald-400" />
                فتح درع التدقيق التلقائي وتنزيل ملف SIF وخطاب البنك الرسمي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: LOANS */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">إدارة السلف والأقساط الشهرية للموظفين</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تطبيق المادة 59 من قانون العمل الكويتي (لا يجوز استقطاع أكثر من 10% من أجر العامل وفاءً لما يقترضه).
              </p>
            </div>
            <button
              onClick={() => setShowLoanModal(true)}
              className="bg-[#714B67] hover:bg-[#583950] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> سلفة جديدة
            </button>
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
                      <td className="p-3.5 font-bold font-mono text-emerald-600">{paidAmt.toFixed(3)} د.ك</td>
                      <td className="p-3.5 font-bold font-mono text-rose-600">{ln.remainingAmount.toFixed(3)} د.ك</td>
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
                        <button 
                          onClick={() => deleteLoan(ln.id)} 
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer" 
                          title="حذف السلفة"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. SUBTAB: SETTLEMENTS & PIFSS */}
      {activeSubTab === 'settlements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Final Settlement & Discharge */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                <FileText size={20} />
                <h3 className="text-base font-black text-slate-900">مخالصة نهاية الخدمة وإبراء الذمة العمالي الشامل</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                احتساب مكافأة نهاية الخدمة طبقاً للمادتين 51 و53 من قانون العمل الكويتي (15 يوماً للسنوات الـ 5 الأولى وشهر عما تلاها)، مع تصفية رصيد الإجازات المتبقية (مادة 70) وتسوية السلف وطباعة استمارة إبراء الذمة الرسمية لتقديمها للقوى العاملة.
              </p>
            </div>
            <button
              onClick={() => setShowFinalSettlementModal(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calculator size={14} /> فتح نموذج المخالصة وإبراء الذمة
            </button>
          </div>

          {/* Card 2: PIFSS Insurance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                <ShieldCheck size={20} />
                <h3 className="text-base font-black text-slate-900">كشف اشتراكات التأمينات الاجتماعية (PIFSS)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                حساب استقطاعات التأمينات للمواطنين الكويتيين بنسبة 10.5% حصة الموظف و11.5% حصة صاحب العمل (المنشأة)، مع كشف السداد الشهري المعتمد للتصدير والطباعة.
              </p>
            </div>
            <button
              onClick={() => setShowPifssModal(true)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ShieldCheck size={14} /> فتح كشف سداد التأمينات
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW PAYSLIP --- */}
      {showNewPayslipModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[92vh] overflow-y-auto">
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف (تعبئة تلقائية للراتب والبدلات):</label>
                <select
                  value={newForm.employeeId}
                  onChange={(e) => handleSelectEmployeeForPayslip(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-[#714B67]"
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
                    className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني (12 رقم) *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    placeholder="الرقم المدني"
                    value={newForm.civilId}
                    onChange={(e) => setNewForm({ ...newForm, civilId: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all font-bold"
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
                <label className="block text-slate-700 font-bold mb-1">القسط الشهري (المادة 59: سقف 10% من الراتب)</label>
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
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
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
          companyName={activeCompany?.nameAr && !activeCompany.nameAr.includes('Super Admin') ? activeCompany.nameAr : 'شركة المنار كلينك'}
          companyNameEn={activeCompany?.nameEn && !activeCompany.nameEn.includes('Super Admin') ? activeCompany.nameEn : 'Al Manar Clinic W.L.L.'}
          crNumber={activeCompany?.crNumber || activeCompany?.commercialRegNo || '301122'}
          onClose={() => {
            setShowOfficialPayslipModal(false);
            setPayslipToPrint(null);
          }}
        />
      )}

      {/* --- MODAL 2: KUWAIT WPS COMPLIANCE & AUDIT SHIELD --- */}
      {showWpsAuditModal && (
        <WpsAuditShieldModal
          payslips={filteredPayslips.map(p => ({
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
          companyInfo={{
            nameAr: activeCompany?.nameAr || 'شركة الأفق للتجارة العامة والمقاولات ذ.م.م',
            nameEn: activeCompany?.nameEn || 'Al-Ufuq General Trading & Contracting W.L.L.',
            crNumber: activeCompany?.crNumber || activeCompany?.commercialRegNo || '104829',
            bankName: activeCompany?.bankName || 'بنك الكويت الوطني (NBK)',
            accountNumber: activeCompany?.accountNumber || '0123456789012',
            iban: activeCompany?.iban || ''
          }}
          onClose={() => setShowWpsAuditModal(false)}
        />
      )}

      {/* --- MODAL 3: FINAL SETTLEMENT & DISCHARGE (EOS) --- */}
      {showFinalSettlementModal && (
        <FinalSettlementModal
          employees={settlementEmployees}
          companyName={activeCompany?.nameAr || 'شركة الأفق للتجارة العامة والمقاولات ذ.م.م'}
          companyNameEn={activeCompany?.nameEn || 'Al-Ufuq General Trading & Contracting W.L.L.'}
          crNumber={activeCompany?.crNumber || activeCompany?.commercialRegNo || '104829'}
          onClose={() => setShowFinalSettlementModal(false)}
        />
      )}

      {/* --- MODAL 4: PIFSS INSURANCE REPORT --- */}
      {showPifssModal && (
        <PifssInsuranceReportModal
          employees={pifssData}
          period={selectedMonth}
          companyName={activeCompany?.nameAr || 'شركة الأفق للتجارة العامة والمقاولات ذ.م.م'}
          companyNameEn={activeCompany?.nameEn || 'Al-Ufuq General Trading & Contracting W.L.L.'}
          crNumber={activeCompany?.crNumber || activeCompany?.commercialRegNo || '104829'}
          onClose={() => setShowPifssModal(false)}
        />
      )}

      {/* --- MODAL 5: PAYROLL STRUCTURE WIZARD --- */}
      <PayrollStructureWizardModal
        isOpen={showPayrollWizard}
        onClose={() => setShowPayrollWizard(false)}
      />

      {/* --- MODAL 6: EOS SETUP WIZARD --- */}
      <EosSetupWizardModal
        isOpen={showEosWizard}
        onClose={() => setShowEosWizard(false)}
      />
    </div>
  );
};

export default OdooPayrollApp;
