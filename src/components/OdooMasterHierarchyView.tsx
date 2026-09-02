import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Fingerprint, 
  CalendarDays, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  Layers, 
  Calculator, 
  RefreshCw,
  Clock,
  Plus,
  X,
  ShieldAlert
} from 'lucide-react';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';

export const OdooMasterHierarchyView: React.FC = () => {
  const { 
    employees, 
    attendance, 
    loans, 
    leaveAccruals, 
    computedPayslips, 
    updateContractSalary,
    recordAttendanceShift,
    processMonthlyBatch,
    addEmployee,
    addLoan,
    updateLeaveAccrual
  } = useOdooHierarchy();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'EMP-001');
  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const selectedAtt = attendance[selectedEmpId] || { delayMinutes: 0, overtimeHours: 0, unpaidAbsenceDays: 0 };
  const selectedLoan = loans.find(l => l.employeeId === selectedEmpId);
  const selectedLeave = leaveAccruals[selectedEmpId] || { carriedFrom2025: 0, earned2026: 0, consumedDays: 0, prepaidLeaveDays: 0 };
  const selectedSlip = computedPayslips.find(p => p.employeeId === selectedEmpId);

  // Modal Control States
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // Validation state
  const [civilIdError, setCivilIdError] = useState<string | null>(null);

  // Form states
  const [newEmp, setNewEmp] = useState({
    name: '',
    civilId: '',
    jobTitle: '',
    department: 'الموارد البشرية',
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    isKuwaiti: false,
    bankName: 'بنك الكويت الوطني (NBK)',
    iban: ''
  });

  const [adjustLeave, setAdjustLeave] = useState({
    carried: '',
    earned: '',
    consumed: ''
  });

  const [newLoan, setNewLoan] = useState({
    totalAmount: '',
    monthlyInstallment: ''
  });

  // Civil ID MOD 11 Validation Function
  const validateCivilId = (civilId: string) => {
    if (!/^\d{12}$/.test(civilId)) {
      return 'الرقم المدني يجب أن يتكون من 12 رقماً فقط';
    }
    const weights = [2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(civilId.charAt(i), 10) * weights[i];
    }
    const remainder = sum % 11;
    if (remainder === 0) {
      return 'الرقم المدني الكويتي غير صالح وفق صيغة MOD 11';
    }
    const checkDigit = 11 - remainder;
    if (checkDigit !== parseInt(civilId.charAt(11), 10)) {
      return 'الرقم المدني غير متطابق مع مفتاح التحقق (MOD 11)';
    }
    return null;
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCivilId(newEmp.civilId);
    if (error) {
      setCivilIdError(error);
      return;
    }
    setCivilIdError(null);

    const nextId = `EMP-00${employees.length + 1}`;
    addEmployee({
      id: nextId,
      name: newEmp.name,
      civilId: newEmp.civilId,
      jobTitle: newEmp.jobTitle,
      department: newEmp.department,
      basicSalary: parseFloat(newEmp.basicSalary) || 0,
      housingAllowance: parseFloat(newEmp.housingAllowance) || 0,
      transportAllowance: parseFloat(newEmp.transportAllowance) || 0,
      isKuwaiti: newEmp.isKuwaiti,
      bankName: newEmp.bankName,
      iban: newEmp.iban || 'KW12NBOK0000000000000000000000',
      contractStatus: 'running'
    });

    setSelectedEmpId(nextId);
    setShowAddEmpModal(false);
    setNewEmp({
      name: '',
      civilId: '',
      jobTitle: '',
      department: 'الموارد البشرية',
      basicSalary: '',
      housingAllowance: '',
      transportAllowance: '',
      isKuwaiti: false,
      bankName: 'بنك الكويت الوطني (NBK)',
      iban: ''
    });
  };

  const handleUpdateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLeaveAccrual(
      selectedEmp.id,
      parseFloat(adjustLeave.carried) || 0,
      parseFloat(adjustLeave.earned) || 0,
      parseFloat(adjustLeave.consumed) || 0
    );
    setShowLeaveModal(false);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    addLoan(
      selectedEmp.id,
      parseFloat(newLoan.totalAmount) || 0,
      parseFloat(newLoan.monthlyInstallment) || 0
    );
    setShowLoanModal(false);
    setNewLoan({
      totalAmount: '',
      monthlyInstallment: ''
    });
  };

  // تصدير ملف البنوك وحماية الأجور WPS SIF
  const exportWPS = () => {
    const totalNet = computedPayslips.reduce((acc, p) => acc + p.netSalary, 0);
    const header = `HDR,201934,AYSED_HR_KUWAIT,2026-08,${computedPayslips.length},${totalNet.toFixed(3)},KWD\n`;
    const rows = computedPayslips.map((p, idx) => 
      `REC,${idx + 1},${p.civilId},${p.iban},${p.netSalary.toFixed(3)},${p.basic.toFixed(3)},${p.allowances.toFixed(3)},${(p.attendanceDeduction + p.loanDeduction + p.pifssDeduction).toFixed(3)}`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WPS_MOSAL_KUWAIT_2026_08.sif`;
    a.click();
  };

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">الهيكل الهرمي ومحرك العمليات المركزي (Odoo Engine)</h1>
            <p className="text-xs text-slate-500 font-medium">العقد (الأصل) ──► البصمة والإجازات (الحركة) ──► مسير الرواتب و WPS (الإغلاق)</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAddEmpModal(true)}
            className="bg-[#714B67]/10 text-[#714B67] hover:bg-[#714B67]/20 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-[#714B67]/20"
          >
            <Plus size={14} /> تسجيل موظف جديد / عقد
          </button>
          <button
            type="button"
            onClick={processMonthlyBatch}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <RefreshCw size={14} /> إعادة احتساب الهيكل (Compute)
          </button>
          <button
            type="button"
            onClick={exportWPS}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download size={14} /> تصدير ملف البنوك (WPS .SIF)
          </button>
        </div>
      </div>

      {/* Employee Selector Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {employees.map(emp => (
          <button
            key={emp.id}
            type="button"
            onClick={() => setSelectedEmpId(emp.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 border cursor-pointer ${
              selectedEmpId === emp.id 
                ? 'bg-[#714B67] text-white border-[#714B67] shadow-sm' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users size={14} />
            <span>{emp.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({emp.id})</span>
          </button>
        ))}
      </div>

      {/* Odoo Smart Buttons (أزرار أودو الذكية أعلى ملف الموظف) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Smart Button 1: Contract */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">عقد العمل والراتب</span>
            <span className="text-sm font-black text-slate-900 font-mono">{(selectedEmp.basicSalary + selectedEmp.housingAllowance + selectedEmp.transportAllowance).toFixed(3)} د.ك</span>
          </div>
          <FileText className="text-[#714B67] w-5 h-5 opacity-80" />
        </div>

        {/* Smart Button 2: Attendance */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">بصمة التأخير / إضافي</span>
            <span className="text-sm font-black text-rose-600 font-mono">{selectedAtt.delayMinutes} دقيقة / +{selectedAtt.overtimeHours} س</span>
          </div>
          <Fingerprint className="text-rose-500 w-5 h-5 opacity-80" />
        </div>

        {/* Smart Button 3: Time Off Balance */}
        <button
          type="button"
          onClick={() => {
            setAdjustLeave({
              carried: selectedLeave.carriedFrom2025.toString(),
              earned: selectedLeave.earned2026.toString(),
              consumed: selectedLeave.consumedDays.toString()
            });
            setShowLeaveModal(true);
          }}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-right hover:border-purple-400 hover:shadow-xs transition cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">الرصيد المتبقي (تعديل الرصيد)</span>
            <span className="text-sm font-black text-purple-700 font-mono">
              {(selectedLeave.carriedFrom2025 + selectedLeave.earned2026 - selectedLeave.consumedDays).toFixed(1)} يوم
            </span>
          </div>
          <CalendarDays className="text-purple-600 w-5 h-5 opacity-80" />
        </button>

        {/* Smart Button 4: Loans */}
        <button
          type="button"
          onClick={() => {
            setNewLoan({
              totalAmount: selectedLoan ? selectedLoan.totalAmount.toString() : '',
              monthlyInstallment: selectedLoan ? selectedLoan.monthlyInstallment.toString() : ''
            });
            setShowLoanModal(true);
          }}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-right hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">سلفة جارية (قيد سلفة جديدة)</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {selectedLoan ? `${selectedLoan.monthlyInstallment.toFixed(3)} د.ك` : 'لا توجد'}
            </span>
          </div>
          <DollarSign className="text-blue-500 w-5 h-5 opacity-80" />
        </button>

      </div>

      {/* Odoo Live Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Real-time Controls (Master Data & Movement Inputs) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2 flex items-center gap-2">
            <FileText size={16} className="text-[#714B67]" />
            تعديل بيانات العقد والحركة اليومية (تنعكس فوراً بالراتب)
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">الراتب الأساسي (العقد):</label>
                <input
                  type="number"
                  value={selectedEmp.basicSalary}
                  onChange={(e) => updateContractSalary(selectedEmp.id, parseFloat(e.target.value) || 0, selectedEmp.housingAllowance)}
                  className="w-full p-2.5 border rounded-lg font-mono font-bold bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">بدل السكن:</label>
                <input
                  type="number"
                  value={selectedEmp.housingAllowance}
                  onChange={(e) => updateContractSalary(selectedEmp.id, selectedEmp.basicSalary, parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-lg font-mono font-bold bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div>
                <label className="block font-bold text-slate-600 mb-1">دقائق تأخير البصمة للشهر:</label>
                <input
                  type="number"
                  value={selectedAtt.delayMinutes}
                  onChange={(e) => recordAttendanceShift(selectedEmp.id, parseInt(e.target.value) || 0, selectedAtt.overtimeHours)}
                  className="w-full p-2.5 border rounded-lg font-mono font-bold text-rose-600 bg-rose-50/50 outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">ساعات العمل الإضافي (Overtime):</label>
                <input
                  type="number"
                  value={selectedAtt.overtimeHours}
                  onChange={(e) => recordAttendanceShift(selectedEmp.id, selectedAtt.delayMinutes, parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border rounded-lg font-mono font-bold text-purple-700 bg-purple-50/50 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>الجنسية والتأمينات:</span>
                <span className="font-bold">{selectedEmp.isKuwaiti ? 'كويتي (استقطاع 10.5% PIFSS)' : 'غير كويتي (معفي من التأمينات)'}</span>
              </div>
              <div className="flex justify-between">
                <span>الرقم المدني والبنك:</span>
                <span className="font-mono">{selectedEmp.civilId} | {selectedEmp.bankName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Automated Payslip Output (Odoo Salary Sheet View) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calculator size={16} className="text-emerald-700" />
              قسيمة ومفردات الراتب المحتسبة آلياً (Payslip Rule View)
            </h3>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">جاهز للتحويل WPS</span>
          </div>

          {selectedSlip && (
            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-600">الراتب الأساسي المستحق:</span>
                <span className="font-mono font-bold">{selectedSlip.basic.toFixed(3)} د.ك</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-600">إجمالي البدلات (سكن + انتقال):</span>
                <span className="font-mono font-bold">+{selectedSlip.allowances.toFixed(3)} د.ك</span>
              </div>
              {selectedSlip.overtimeAmount > 0 && (
                <div className="flex justify-between py-1 border-b text-purple-700">
                  <span>أجر ساعات العمل الإضافي:</span>
                  <span className="font-mono font-bold">+{selectedSlip.overtimeAmount.toFixed(3)} د.ك</span>
                </div>
              )}
              {selectedSlip.attendanceDeduction > 0 && (
                <div className="flex justify-between py-1 border-b text-rose-600">
                  <span>استقطاع دقائق تأخير البصمة:</span>
                  <span className="font-mono font-bold">-{selectedSlip.attendanceDeduction.toFixed(3)} د.ك</span>
                </div>
              )}
              {selectedSlip.loanDeduction > 0 && (
                <div className="flex justify-between py-1 border-b text-blue-600">
                  <span>خصم قسط السلفة الشهرية:</span>
                  <span className="font-mono font-bold">-{selectedSlip.loanDeduction.toFixed(3)} د.ك</span>
                </div>
              )}
              {selectedSlip.pifssDeduction > 0 && (
                <div className="flex justify-between py-1 border-b text-amber-700">
                  <span>استقطاع التأمينات الاجتماعية (10.5%):</span>
                  <span className="font-mono font-bold">-{selectedSlip.pifssDeduction.toFixed(3)} د.ك</span>
                </div>
              )}

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-emerald-950 font-black text-sm mt-3">
                <span>صافي الراتب النهائي في ملف البنك (WPS):</span>
                <span className="text-base font-mono text-emerald-700">{selectedSlip.netSalary.toFixed(3)} د.ك</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-[#714B67]" size={20} />
                تسجيل موظف جديد وإنشاء عقد العمل (hr.contract)
              </h3>
              <button type="button" onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            {civilIdError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>{civilIdError}</span>
              </div>
            )}
            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="أحمد جابر الصباح"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم المدني (12 رقماً) *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={newEmp.civilId}
                    onChange={(e) => setNewEmp({ ...newEmp, civilId: e.target.value })}
                    placeholder="مثال: 290010112346"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                    placeholder="مثال: مهندس برمجيات"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم *</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                  >
                    <option value="الموارد البشرية">الموارد البشرية</option>
                    <option value="تقنية المعلومات">تقنية المعلومات</option>
                    <option value="المالية والمحاسبة">المالية والمحاسبة</option>
                    <option value="الإدارة العامة">الإدارة العامة</option>
                    <option value="الخدمات الطبية">الخدمات الطبية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t pt-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الأساسي (د.ك) *</label>
                  <input
                    type="number"
                    required
                    value={newEmp.basicSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, basicSalary: e.target.value })}
                    placeholder="800"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بدل السكن (د.ك) *</label>
                  <input
                    type="number"
                    required
                    value={newEmp.housingAllowance}
                    onChange={(e) => setNewEmp({ ...newEmp, housingAllowance: e.target.value })}
                    placeholder="150"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بدل الانتقال (د.ك) *</label>
                  <input
                    type="number"
                    required
                    value={newEmp.transportAllowance}
                    onChange={(e) => setNewEmp({ ...newEmp, transportAllowance: e.target.value })}
                    placeholder="50"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجنسية *</label>
                  <select
                    value={newEmp.isKuwaiti ? 'true' : 'false'}
                    onChange={(e) => setNewEmp({ ...newEmp, isKuwaiti: e.target.value === 'true' })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                  >
                    <option value="false">غير كويتي (معفي من التأمينات)</option>
                    <option value="true">كويتي (استقطاع 10.5% PIFSS معطل)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم البنك المعتمد *</label>
                  <select
                    value={newEmp.bankName}
                    onChange={(e) => setNewEmp({ ...newEmp, bankName: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                  >
                    <option value="بنك الكويت الوطني (NBK)">بنك الكويت الوطني (NBK)</option>
                    <option value="بنك بوبيان (Boubyan)">بنك بوبيان (Boubyan)</option>
                    <option value="بنك الخليج (Gulf Bank)">بنك الخليج (Gulf Bank)</option>
                    <option value="بيت التمويل الكويتي (KFH)">بيت التمويل الكويتي (KFH)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الحساب الدولي (IBAN) *</label>
                <input
                  type="text"
                  required
                  value={newEmp.iban}
                  onChange={(e) => setNewEmp({ ...newEmp, iban: e.target.value })}
                  placeholder="KWXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#714B67] text-white font-bold transition shadow-sm">اعتماد العقد وتسجيل الموظف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="text-purple-600" size={20} />
                تعديل وتحديث رصيد الإجازات السنوية للموظف
              </h3>
              <button type="button" onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">الموظف الحالي: <span className="font-bold text-slate-900">{selectedEmp.name}</span></p>
            <form onSubmit={handleUpdateLeave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المرحل من 2025</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={adjustLeave.carried}
                    onChange={(e) => setAdjustLeave({ ...adjustLeave, carried: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-purple-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المكتسب في 2026</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={adjustLeave.earned}
                    onChange={(e) => setAdjustLeave({ ...adjustLeave, earned: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-purple-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستهلك / المأخوذ</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={adjustLeave.consumed}
                    onChange={(e) => setAdjustLeave({ ...adjustLeave, consumed: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-purple-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-900">
                <p className="font-bold">رصيد الإجازة الإجمالي المتبقي:</p>
                <p className="text-sm font-mono font-black mt-1">
                  {( (parseFloat(adjustLeave.carried) || 0) + (parseFloat(adjustLeave.earned) || 0) - (parseFloat(adjustLeave.consumed) || 0) ).toFixed(1)} يوماً
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 text-white font-bold transition shadow-sm">تعديل رصيد الإجازة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                قيد أو تعديل سلفة مالية للموظف الحالي
              </h3>
              <button type="button" onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">الموظف الحالي: <span className="font-bold text-slate-900">{selectedEmp.name}</span></p>
            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">إجمالي مبلغ السلفة (د.ك)</label>
                  <input
                    type="number"
                    required
                    value={newLoan.totalAmount}
                    onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                    placeholder="600.000"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسط المقتطع شهرياً (د.ك)</label>
                  <input
                    type="number"
                    required
                    value={newLoan.monthlyInstallment}
                    onChange={(e) => setNewLoan({ ...newLoan, monthlyInstallment: e.target.value })}
                    placeholder="100.000"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowLoanModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold transition shadow-sm">تسجيل السلفة في الملف</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooMasterHierarchyView;
