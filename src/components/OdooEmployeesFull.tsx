import React, { useState, useEffect } from 'react';
import { Company } from '../types';
import { OdooChatter, ChatterMessage } from './OdooChatter';
import { getExpiryStatus } from '../utils/expiryUtils';
import { getDepartmentColorStyle } from '../utils/odooPalette';
import { OdooDocumentScanner, ExtractedData } from './OdooDocumentScanner';
import { handleOcrResult } from '../utils/ocrService';
import { OdooDocumentManager, DocumentFolder, DocumentAttachment } from './OdooDocumentManager';
import OdooPamContractModal from './OdooPamContractModal';
import { safePrintAction } from '../guards/SystemIntegrityGuard';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  CreditCard, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ChevronRight,
  ArrowRight,
  Save,
  Printer,
  FolderKanban,
  Trash2
} from 'lucide-react';

interface Employee {
  id: string;
  companyId?: string;
  name: string;
  nameEn: string;
  civilId: string;
  passportNo: string;
  nationality: string;
  jobTitle: string;
  department: string;
  parentId?: string; // المدير المباشر (Direct Manager in Odoo Hierarchy)
  workEmail: string;
  phone: string;
  joinDate: string;
  residencyExpiry: string;
  civilIdExpiry?: string;
  mohLicenseNo?: string; // ترخيص وزارة الصحة (MOH ID)
  mohLicenseExpiry?: string;
  passportExpiry: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  bankName: string;
  bankAccountNo?: string; // رقم الحساب البنكي
  bankIban: string;
  contractType: 'fixed' | 'unlimited';
  status: 'active' | 'on_leave' | 'resigned';
  pifssRegistered: boolean;
  avatarUrl?: string;
}

const initialEmployees: Employee[] = [];

interface OdooEmployeesFullProps {
  activeCompany: Company;
}

export const OdooEmployeesFull: React.FC<OdooEmployeesFullProps> = ({ activeCompany }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('aysed_employees_multitenant');
    let allEmps: Employee[] = stored ? JSON.parse(stored) : [];
    
    setEmployees(allEmps.filter(e => e.companyId === activeCompany?.id));
    setSelectedEmployee(null);
    setIsEditing(false);
  }, [activeCompany]);

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'work' | 'private' | 'medical_docs' | 'payroll' | 'contract'>('work');
  const [isEditing, setIsEditing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPamContractModal, setShowPamContractModal] = useState(false);

  // حساب أيام انتهاء الإقامة
  const checkExpiryStatus = (expiryDate: string) => {
    const today = new Date('2026-08-31');
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { label: 'منتهية', color: 'bg-rose-500 text-white' };
    if (diffDays <= 30) return { label: `تنتهي خلال ${diffDays} يوم`, color: 'bg-rose-100 text-rose-800 border border-rose-300' };
    if (diffDays <= 60) return { label: `تنتهي خلال ${diffDays} يوم`, color: 'bg-amber-100 text-amber-800 border border-amber-300' };
    return { label: 'صالحة', color: 'bg-emerald-100 text-emerald-800' };
  };

  const isMedicalStaff = (jobTitle: string, dept: string) => {
    const text = `${jobTitle} ${dept}`.toLowerCase();
    return text.includes('طبيب') || 
           text.includes('د.') || 
           text.includes('دكتور') || 
           text.includes('تمريض') || 
           text.includes('صيدل') || 
           text.includes('مختبر') || 
           text.includes('جلدية') || 
           text.includes('ليزر') || 
           text.includes('طب') || 
           text.includes('جراح') || 
           text.includes('عياد') ||
           text.includes('doctor') ||
           text.includes('nurse') ||
           text.includes('medic');
  };

  // توليد الكود التلقائي فور الحفظ أو التعيين
  const generateEmployeeCode = (jobTitle: string, dept: string, existingList: Employee[], currentId?: string) => {
    // إذا كان الموظف لديه كود مخصص بالفعل وليس كود مؤقت أو جديد
    if (currentId && !currentId.startsWith('NEW-') && currentId !== 'TEMP') {
      return currentId;
    }

    const isMed = isMedicalStaff(jobTitle, dept);
    const prefix = isMed ? 'MED' : 'EMP';
    
    // إيجاد أعلى رقم تسلسلي لنفس البادئة
    let maxNum = 0;
    existingList.forEach(e => {
      if (e?.id && e.id.startsWith(`${prefix}-`)) {
        const parts = e.id.split('-');
        if (parts.length >= 2) {
          const num = parseInt(parts[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextNum = maxNum + 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  };

  const handleCreateNew = () => {
    const newEmp: Employee = {
      id: 'NEW-TEMP',
      companyId: activeCompany.id,
      name: 'موظف جديد',
      nameEn: 'New Employee',
      civilId: '',
      passportNo: '',
      nationality: 'كويتي',
      jobTitle: 'المسمى الوظيفي',
      department: 'الإدارة العامة',
      parentId: employees.length > 0 ? employees[0].id : undefined,
      workEmail: '',
      phone: '+965 ',
      joinDate: new Date().toISOString().split('T')[0],
      residencyExpiry: '2027-12-31',
      civilIdExpiry: '2027-12-31',
      mohLicenseNo: '',
      mohLicenseExpiry: '',
      passportExpiry: '2028-12-31',
      basicSalary: 500,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowance: 0,
      bankAccountNo: '',
      bankIban: '',
      bankName: 'بنك الكويت الوطني (NBK)',
      contractType: 'unlimited',
      status: 'active',
      pifssRegistered: false,
    };
    setSelectedEmployee(newEmp);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedEmployee) return;
    
    const stored = localStorage.getItem('aysed_employees_multitenant');
    let allEmps: Employee[] = stored ? JSON.parse(stored) : [];
    
    // إنشاء كود وظيفي تلقائي فور الحفظ (EMP-003 أو MED-001 للأطباء)
    let finalCode = selectedEmployee.id;
    if (!finalCode || finalCode === 'NEW-TEMP' || finalCode.startsWith('NEW-')) {
      finalCode = generateEmployeeCode(
        selectedEmployee.jobTitle,
        selectedEmployee.department,
        allEmps.filter(e => e.companyId === activeCompany.id)
      );
    }

    const employeeToSave: Employee = {
      ...selectedEmployee,
      id: finalCode,
      companyId: activeCompany.id
    };

    const existsIndex = allEmps.findIndex((e) => e.id === employeeToSave.id || (selectedEmployee.id === 'NEW-TEMP' && false));
    if (existsIndex >= 0) {
      allEmps[existsIndex] = employeeToSave;
    } else {
      allEmps = [employeeToSave, ...allEmps.filter(e => e.id !== selectedEmployee.id)];
    }

    localStorage.setItem('aysed_employees_multitenant', JSON.stringify(allEmps));
    setEmployees(allEmps.filter(e => e.companyId === activeCompany.id));
    setIsEditing(false);
    setSelectedEmployee(employeeToSave);
  };

  const handleDeleteEmployee = (empId: string) => {
    if (confirm('هل أنت متأكد من حذف ملف هذا الموظف نهائياً؟')) {
      const stored = localStorage.getItem('aysed_employees_multitenant');
      let allEmps: Employee[] = stored ? JSON.parse(stored) : [];
      allEmps = allEmps.filter(e => String(e.id) !== String(empId));
      localStorage.setItem('aysed_employees_multitenant', JSON.stringify(allEmps));
      setEmployees(allEmps.filter(e => String(e.companyId) === String(activeCompany.id)));
      if (selectedEmployee && String(selectedEmployee.id) === String(empId)) {
        setSelectedEmployee(null);
      }
    }
  };

  const filteredEmployees = employees.filter((emp) => 
    emp.name.includes(searchQuery) || 
    emp.jobTitle.includes(searchQuery) || 
    emp.civilId.includes(searchQuery)
  );

  return (
    <div className="space-y-4 font-sans text-slate-800 dir-rtl" dir="rtl">
      
      {/* Top Control Bar - Odoo Header & Breadcrumbs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Action & Breadcrumbs Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedEmployee ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSelectedEmployee(null); setIsEditing(false); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="الرجوع إلى قائمة الموظفين"
              >
                <ArrowRight size={15} />
                <span>الموظفون</span>
              </button>
              <ChevronRight size={14} className="text-slate-400 rotate-180" />
              <span className="text-xs font-bold text-[#714B67] truncate max-w-[200px] sm:max-w-xs">
                {selectedEmployee.name || 'موظف جديد'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleCreateNew}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus size={16} /> إضافة موظف جديد
            </button>
          )}

          {selectedEmployee && (
            <div className="flex items-center gap-2 border-r border-slate-200 pr-2 mr-1">
              <button
                type="button"
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save size={14} /> حفظ (Save)
              </button>

              <button
                type="button"
                onClick={() => { setSelectedEmployee(null); setIsEditing(false); }}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                تجاهل (Discard)
              </button>

              <button
                type="button"
                onClick={() => safePrintAction('ملف الموظف')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="طباعة ملف الموظف"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPamContractModal(true)}
                className="bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-[#714B67]/30 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="إصدار عقد العمل الرسمي (نموذج 2 - القوى العاملة PAM)"
              >
                <FileText size={14} className="text-[#714B67]" />
                <span className="hidden sm:inline">عقد القوى العاملة (PAM 2)</span>
              </button>
            </div>
          )}
        </div>

        {/* Search and View Toggles (When in List/Kanban mode) */}
        {!selectedEmployee && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، الرقم المدني، المسمى..."
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#714B67] outline-none transition"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition cursor-pointer ${viewMode === 'kanban' ? 'bg-white shadow text-[#714B67]' : 'text-slate-500 hover:text-slate-800'}`}
                title="عرض البطاقات (Kanban)"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition cursor-pointer ${viewMode === 'list' ? 'bg-white shadow text-[#714B67]' : 'text-slate-500 hover:text-slate-800'}`}
                title="عرض الجدول (List)"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main View: Employee Form Sheet OR Kanban / List */}
      {selectedEmployee ? (
        /* ODOO 18 ENTERPRISE FULL-WIDTH FORM SHEET */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden w-full">
          
          {/* Form Header & Smart Stat Buttons (Odoo Smart Buttons Header) */}
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
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                }`}
                title="انقر لتغيير الحالة"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{selectedEmployee.status === 'active' ? 'على رأس العمل (Active)' : 'إجازة / معلق (On Leave)'}</span>
              </button>
            </div>

            {/* Odoo Smart Buttons (Interactive Stat Buttons) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              
              {/* 1. Time Off Button */}
              <button
                type="button"
                onClick={() => setActiveTab('contract')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#714B67] rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-purple-50 text-[#714B67] rounded-lg group-hover:bg-[#714B67] group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">30.0 يوماً</div>
                  <div className="text-slate-400 text-[10px]">رصيد الإجازات</div>
                </div>
              </button>

              {/* 2. Payslips & Gross Salary Button */}
              <button
                type="button"
                onClick={() => setActiveTab('payroll')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">
                    {(selectedEmployee.basicSalary + selectedEmployee.housingAllowance + selectedEmployee.transportAllowance).toFixed(3)} د.ك
                  </div>
                  <div className="text-slate-400 text-[10px]">مسيرات الرواتب (WPS)</div>
                </div>
              </button>

              {/* 3. Attendance Button */}
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs text-right">
                <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">176 س / 98.5%</div>
                  <div className="text-slate-400 text-[10px]">ساعات الحضور</div>
                </div>
              </div>

              {/* 4. Documents & Folders Button */}
              <button
                type="button"
                onClick={() => setActiveTab('private')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
              >
                <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-mono font-bold text-slate-800">6 وثائق</div>
                  <div className="text-slate-400 text-[10px]">أذونات وإقامات</div>
                </div>
              </button>

              {/* 5. Medical Licenses Button (for medical staff) */}
              {(selectedEmployee.id.startsWith('MED-') || isMedicalStaff(selectedEmployee.jobTitle, selectedEmployee.department)) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('medical_docs')}
                  className="bg-white hover:bg-slate-50 border border-teal-200 hover:border-teal-500 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-2xs transition cursor-pointer text-right group"
                >
                  <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-teal-800 text-[10px]">MOH ترخيص</div>
                    <div className="text-slate-400 text-[10px]">الكادر الطبي</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Employee Basic Card Header */}
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl border border-slate-300 flex items-center justify-center text-slate-400 font-bold text-2xl flex-shrink-0 shadow-inner">
              {selectedEmployee.name.charAt(0)}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">الاسم الكامل (عربي)</label>
                  <input
                    type="text"
                    value={selectedEmployee.name}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                    className="w-full text-lg font-bold text-slate-900 border-b border-slate-300 focus:border-[#714B67] outline-none bg-transparent pb-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name (English)</label>
                  <input
                    type="text"
                    value={selectedEmployee.nameEn}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, nameEn: e.target.value })}
                    className="w-full text-base font-semibold text-slate-800 border-b border-slate-300 focus:border-[#714B67] outline-none bg-transparent pb-1"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs text-slate-400">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={selectedEmployee.jobTitle}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, jobTitle: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">القسم / الإدارة</label>
                  <input
                    type="text"
                    value={selectedEmployee.department}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">الجنسية</label>
                  <input
                    type="text"
                    value={selectedEmployee.nationality}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, nationality: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Odoo Tabs Navigation */}
          <div className="border-b border-slate-200 bg-slate-50/50 flex gap-2 px-6 overflow-x-auto">
            {[
              { id: 'work', label: 'بيانات العمل والاتصال' },
              { id: 'private', label: 'أذونات العمل والإقامات (PAM & Residency)' },
              { id: 'medical_docs', label: 'التراخيص الطبية والمؤهلات (MOH & CME)' },
              { id: 'payroll', label: 'الراتب ونظام حماية الأجور (WPS)' },
              { id: 'contract', label: 'تفاصيل العقد وقانون العمل' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#714B67] text-[#714B67] bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            {activeTab === 'work' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2">بيانات الاتصال المؤسسي</h4>
                  <div>
                    <label className="text-slate-500 block mb-1">البريد الإلكتروني للعمل</label>
                    <input
                      type="email"
                      value={selectedEmployee.workEmail}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, workEmail: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم الهاتف النقال (الكويت)</label>
                    <input
                      type="text"
                      value={selectedEmployee.phone}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2">الهيكل الإداري والتعيين</h4>
                  <div>
                    <label className="text-slate-500 block mb-1">المدير المباشر (Direct Manager - Odoo Hierarchy)</label>
                    <select
                      value={selectedEmployee.parentId || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, parentId: e.target.value || undefined })}
                      className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-800 text-xs"
                    >
                      <option value="">-- بدون مدير مباشر (إدارة عليا / رئيس مجلس إدارة) --</option>
                      {employees
                        .filter(e => e.id !== selectedEmployee.id)
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.jobTitle} - {emp.id})
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">يُحدد المدير المباشر المسار الشجري والموافقات وسلسلة التصعيد الإداري للطلبات.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ مباشرة العمل</label>
                      <input
                        type="date"
                        value={selectedEmployee.joinDate}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, joinDate: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">التسجيل بالتأمينات (PIFSS)</label>
                      <select
                        value={selectedEmployee.pifssRegistered ? 'yes' : 'no'}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, pifssRegistered: e.target.value === 'yes' })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white font-bold"
                      >
                        <option value="yes">مسجل بالتأمينات</option>
                        <option value="no">غير خاضع (وافد)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'private' && (
              <div className="space-y-6">
                {/* زر تفعيل الماسح الضوئي الذكي */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-[#714B67] flex items-center gap-1.5">
                      <span>✨</span> مسح ذكي للبطاقة المدنية / جواز السفر (OCR)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      قم برفع صورة البطاقة المدنية لاستخراج الرقم المدني والاسم الكامل وتواريخ الصلاحية وتعبئتها فورياً.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {showScanner ? 'إغلاق الماسح الضوئي' : 'تفعيل الماسح الضوئي OCR'}
                  </button>
                </div>

                {showScanner && (
                  <OdooDocumentScanner
                    onApplyData={(data, docType) => {
                      handleOcrResult(data, docType, setSelectedEmployee);
                      setShowScanner(false);
                    }}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2">الهيئة العامة للمعلومات المدنية والإقامة</h4>
                    <div>
                      <label className="text-slate-500 block mb-1">الرقم المدني الكويتي (Civil ID - 12 رقم)</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={selectedEmployee.civilId}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, civilId: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white font-mono font-bold"
                        placeholder="290010112345"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ انتهاء الإقامة (مادة 18 / 17)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={selectedEmployee.residencyExpiry}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, residencyExpiry: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                        />
                        <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${checkExpiryStatus(selectedEmployee.residencyExpiry).color}`}>
                          {checkExpiryStatus(selectedEmployee.residencyExpiry).label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ انتهاء البطاقة المدنية</label>
                      <input
                        type="date"
                        value={selectedEmployee.civilIdExpiry || selectedEmployee.residencyExpiry}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, civilIdExpiry: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 border-b pb-2">جواز السفر وتراخيص مزاولة المهنة الطبية</h4>
                    <div>
                      <label className="text-slate-500 block mb-1">رقم جواز السفر</label>
                      <input
                        type="text"
                        value={selectedEmployee.passportNo}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, passportNo: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white uppercase font-mono font-bold"
                        placeholder="K12345678"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">تاريخ انتهاء الجواز</label>
                      <input
                        type="date"
                        value={selectedEmployee.passportExpiry}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, passportExpiry: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">رقم ترخيص مزاولة المهنة الطبية (MOH ID)</label>
                        <input
                          type="text"
                          value={selectedEmployee.mohLicenseNo || ''}
                          onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseNo: e.target.value })}
                          className="w-full p-2 border rounded-lg bg-white font-mono text-xs font-bold"
                          placeholder="MOH-MED-XXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">تاريخ انتهاء ترخيص وزارة الصحة (MOH License Expiry)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="date"
                            value={selectedEmployee.mohLicenseExpiry || ''}
                            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseExpiry: e.target.value })}
                            className="w-full p-2 border rounded-lg bg-white"
                          />
                          {selectedEmployee.mohLicenseExpiry && (() => {
                            const st = getExpiryStatus(selectedEmployee.mohLicenseExpiry);
                            if (!st) return null;
                            return (
                              <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${st.badgeClass}`}>
                                {st.text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* نظام إدارة المجلدات والمستندات (Folders & Attachments Engine) لتبويب أذونات العمل والإقامات */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <FolderKanban size={16} className="text-[#714B67]" />
                      مجلدات ومستندات الإقامة وأذونات العمل (Odoo Documents & Folders)
                    </h4>
                    <span className="text-[11px] text-slate-400">مجلدات مصنفة ومؤرشفة سحابياً</span>
                  </div>
                  
                  <OdooDocumentManager
                    scope="employee"
                    scopeId={`${selectedEmployee.id}_pam`}
                    scopeName={`ملف (${selectedEmployee.name})`}
                    initialFolders={[
                      { id: `fold_pam_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'work_permits', name: 'أذونات العمل (PAM Permits)', color: 'blue' },
                      { id: `fold_pass_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'passports', name: 'جوازات السفر والإقامات', color: 'orange' },
                      { id: `fold_paci_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'civil_id', name: 'البطاقات المدنية والبيانات السكنية (PACI)', color: 'teal' }
                    ]}
                    initialAttachments={[]}
                  />
                </div>
              </div>
            )}

            {activeTab === 'medical_docs' && (
              <div className="space-y-6">
                <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200/80 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-[#714B67] flex items-center gap-1.5">
                      <span>🩺</span> إدارة التراخيص الطبية وشهادات الكادر الصحي (MOH & CME)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      أرشفة وتتبع تراخيص مزاولة المهنة الصادرة من إدارة التراخيص الصحية بوزارة الصحة الكويتية، وشهادات التخصص، وساعات التعليم الطبي المستمر (CME Points).
                    </p>
                  </div>
                  {selectedEmployee.mohLicenseExpiry && (() => {
                    const st = getExpiryStatus(selectedEmployee.mohLicenseExpiry);
                    if (!st) return null;
                    return (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${st.badgeClass}`}>
                        {st.text}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">رقم ترخيص مزاولة المهنة (MOH Medical License ID)</label>
                    <input
                      type="text"
                      value={selectedEmployee.mohLicenseNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseNo: e.target.value })}
                      className="w-full p-2.5 border rounded-lg bg-white font-mono font-bold text-slate-800 text-xs"
                      placeholder="MOH-MED-88912"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-bold block mb-1">تاريخ انتهاء ترخيص وزارة الصحة</label>
                    <input
                      type="date"
                      value={selectedEmployee.mohLicenseExpiry || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mohLicenseExpiry: e.target.value })}
                      className="w-full p-2.5 border rounded-lg bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                {/* نظام إدارة المجلدات والمستندات للكادر الطبي */}
                <div className="pt-2">
                  <OdooDocumentManager
                    scope="employee"
                    scopeId={`${selectedEmployee.id}_med`}
                    scopeName={`تراخيص (${selectedEmployee.name})`}
                    initialFolders={[
                      { id: `fold_moh_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'moh', name: 'تراخيص مزاولة المهنة (MOH Licenses)', color: 'teal' },
                      { id: `fold_degrees_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'degrees', name: 'الشهادات العلمية والجامعية', color: 'purple' },
                      { id: `fold_cme_${selectedEmployee.id}`, scope: 'employee', scopeId: selectedEmployee.id, category: 'cme', name: 'ساعات التعليم الطبي المستمر (CME Points)', color: 'blue' }
                    ]}
                    initialAttachments={[]}
                  />
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 border-b pb-2">هيكلية الراتب (بالدينار الكويتي - KWD)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1">الراتب الأساسي (عقد العمل)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedEmployee.basicSalary}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, basicSalary: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">بدل السكن</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedEmployee.housingAllowance}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, housingAllowance: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-500 block mb-1">بدل الانتقال</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedEmployee.transportAllowance}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, transportAllowance: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">بدلات ومزايا أخرى</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedEmployee.otherAllowance}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, otherAllowance: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-emerald-950 font-bold mt-2">
                    <span>إجمالي الأجر الشامل (Gross Salary):</span>
                    <span className="font-mono text-sm">{(selectedEmployee.basicSalary + selectedEmployee.housingAllowance + selectedEmployee.transportAllowance + selectedEmployee.otherAllowance).toFixed(3)} د.ك</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b pb-2">البيانات المالية والبنكية ونظام حماية الأجور (WPS SIF)</h4>
                  <div>
                    <label className="text-slate-500 block mb-1">اسم البنك المعتمد</label>
                    <select
                      value={selectedEmployee.bankName}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, bankName: e.target.value })}
                      className="w-full p-2 border rounded-lg bg-slate-50 font-semibold text-xs"
                    >
                      <option value="بنك الكويت الوطني (NBK)">بنك الكويت الوطني (NBK)</option>
                      <option value="بيت التمويل الكويتي (KFH)">بيت التمويل الكويتي (KFH)</option>
                      <option value="بنك بوبيان (Boubyan)">بنك بوبيان (Boubyan)</option>
                      <option value="بنك الخليج (Gulf Bank)">بنك الخليج (Gulf Bank)</option>
                      <option value="البنك التجاري الكويتي (CBK)">البنك التجاري الكويتي (CBK)</option>
                      <option value="بنك برقان (Burgan Bank)">بنك برقان (Burgan Bank)</option>
                      <option value="بنك وربة (Warba Bank)">بنك وربة (Warba Bank)</option>
                      <option value="البنك الأهلي الكويتي (ABK)">البنك الأهلي الكويتي (ABK)</option>
                      <option value="البنك الأهلي المتحد (AUB)">البنك الأهلي المتحد (AUB)</option>
                      <option value="بنك الكويت الدولي (KIB)">بنك الكويت الدولي (KIB)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم الحساب البنكي (Bank Account Number)</label>
                    <input
                      type="text"
                      value={selectedEmployee.bankAccountNo || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, bankAccountNo: e.target.value })}
                      placeholder="e.g. 001234567890"
                      className="w-full p-2 border rounded-lg bg-slate-50 font-mono font-bold text-slate-900"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">رقم الآيبان (IBAN - 30 حرف ورقم)</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={selectedEmployee.bankIban}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, bankIban: e.target.value })}
                      placeholder="KW00XXXX0000000000000000000000"
                      className="w-full p-2 border rounded-lg bg-slate-50 font-mono font-bold uppercase text-slate-900"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 border-b pb-2">شروط العقد ومكافأة نهاية الخدمة (مادة 51)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block mb-1">نوع العقد</label>
                    <select
                      value={selectedEmployee.contractType}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, contractType: e.target.value as any })}
                      className="w-full p-2 border rounded-lg bg-slate-50 font-bold text-xs"
                    >
                      <option value="unlimited">عقد غير محدد المدة (دائم)</option>
                      <option value="fixed">عقد محدد المدة (سنة / سنتين)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">فترة التجربة القانونية (أقصاها 100 يوم)</label>
                    <input type="text" defaultValue="100 يوم عمل" disabled className="w-full p-2 border rounded-lg bg-slate-100 text-slate-600" />
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <p className="font-bold mb-1">احتساب مكافأة نهاية الخدمة التلقائي (قانون 6/2010):</p>
                  <p>يتم احتساب 15 يوماً عن كل سنة من السنوات الخمس الأولى، وشهر كامل عن كل سنة تالية، وفق آخر أجر شامل تلقائياً عند تسوية الاستقالة أو إنهاء الخدمة.</p>
                </div>

                <div className="p-4 bg-gradient-to-l from-purple-50 to-white rounded-xl border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={18} className="text-[#714B67]" />
                      <span className="font-bold text-sm text-[#714B67]">عقد العمل الرسمي - نموذج (2) الهيئة العامة للقوى العاملة</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">معتمد PDF Overlay</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      توليد وطباعة عقد العمل طبق الأصل 100% للنموذج الحكومي الكويتي المعتمد، مع تعبئة المتغيرات باللغتين العربية والإنجليزية فوق الخطوط المنقطة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPamContractModal(true)}
                    className="bg-[#714B67] hover:bg-[#593951] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
                  >
                    <FileText size={15} />
                    فتح وتوليد نموذج (PAM Form 2)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chatter Component */}
          <div className="-mx-6 -mb-6">
            {(() => {
              const messages: ChatterMessage[] = [
                { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: `تم فتح وتحديث ملف الموظف (${selectedEmployee.name})` }
              ];

              // 1. Civil ID & Residency Expiry -> 📅 تجديد مستند (Document Renewal)
              const civilExpiry = getExpiryStatus(selectedEmployee.civilIdExpiry || selectedEmployee.residencyExpiry);
              if (civilExpiry && civilExpiry.days <= 60) {
                messages.push({
                  id: 'auto-civil',
                  author: 'محرك جدولة الأنشطة (Odoo Activity Schedule)',
                  date: new Date().toLocaleDateString('ar-KW'),
                  content: `تنبيه انتهاء وثيقة: يرجى تجديد الإقامة والبطاقة المدنية للموظف (${selectedEmployee.name}) قبل انتهاء الصلاحية لتفادي الغرامات ومخالفات الإقامة.`, 
                  type: 'activity',
                  activityDetails: {
                    type: '📅 تجديد مستند (Document Renewal)',
                    assignee: 'مسؤول الجوازات والعلاقات الحكومية',
                    dueDate: selectedEmployee.civilIdExpiry || selectedEmployee.residencyExpiry || '',
                    status: civilExpiry.status,
                    statusText: civilExpiry.text
                  }
                });
              }

              // 2. MOH License Expiry (Medical) -> 🩺 تجديد ترخيص طبي (MOH License)
              const mohExpiry = getExpiryStatus(selectedEmployee.mohLicenseExpiry);
              if (mohExpiry && mohExpiry.days <= 60) {
                messages.push({
                  id: 'auto-moh',
                  author: 'محرك جدولة الأنشطة (Odoo Activity Schedule)',
                  date: new Date().toLocaleDateString('ar-KW'),
                  content: `تنبيه ترخيص طبي: يرجى البدء بإجراءات تجديد ترخيص مزاولة المهنة الطبية (MOH) للكادر الطبي (${selectedEmployee.name}) لدى إدارة التراخيص الصحية بوزارة الصحة.`,
                  type: 'activity',
                  activityDetails: {
                    type: '🩺 تجديد ترخيص طبي (MOH License)',
                    assignee: 'مدير الموارد البشرية',
                    dueDate: selectedEmployee.mohLicenseExpiry || '',
                    status: mohExpiry.status,
                    statusText: mohExpiry.text
                  }
                });
              }

              // 3. Contract Review -> 📝 متابعة عقد (Contract Review)
              if (selectedEmployee.contractType === 'fixed') {
                messages.push({
                  id: 'auto-contract',
                  author: 'محرك جدولة الأنشطة (Odoo Activity Schedule)',
                  date: new Date().toLocaleDateString('ar-KW'),
                  content: `متابعة عقد عمل: مراجعة تجديد عقد العمل محدد المدة أو تقييم الأداء للموظف (${selectedEmployee.name}).`,
                  type: 'activity',
                  activityDetails: {
                    type: '📝 متابعة عقد (Contract Review)',
                    assignee: 'مسؤول شؤون العاملين',
                    dueDate: selectedEmployee.residencyExpiry || new Date().toISOString().split('T')[0],
                    status: 'yellow',
                    statusText: 'يستحق المراجعة'
                  }
                });
              }

              return (
                <OdooChatter 
                  recordId={selectedEmployee.id} 
                  model="hr.employee" 
                  followers={[
                    { id: '1', name: 'مدير الموارد البشرية' },
                    { id: '2', name: 'مسؤول الجوازات والإقامات' },
                    { id: '3', name: 'مسؤول شؤون العاملين' }
                  ]}
                  messages={messages}
                />
              );
            })()}
          </div>

        </div>
      ) : (
        /* KANBAN / LIST VIEW */
        viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const expiry = checkExpiryStatus(emp.residencyExpiry);
              const mohStatus = getExpiryStatus(emp.mohLicenseExpiry);
              const totalSalary = emp.basicSalary + emp.housingAllowance + emp.transportAllowance;
              const manager = employees.find(m => m.id === emp.parentId);
              const isMed = emp.id.startsWith('MED-') || isMedicalStaff(emp.jobTitle, emp.department);
              const deptStyle = getDepartmentColorStyle(emp.department, emp.jobTitle);

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-[#714B67] transition cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 text-[#714B67] font-bold flex items-center justify-center text-lg flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isMed ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {emp.id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            emp.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {emp.status === 'active' ? '● نشط' : '● إجازة'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}
                            className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="مسح"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 truncate text-right mt-1 group-hover:text-[#714B67] transition">{emp.name}</h3>
                        <p className="text-xs text-slate-500 truncate text-right">{emp.jobTitle}</p>
                        <div className="text-right flex flex-wrap gap-1 mt-1.5">
                          {/* Distinctive Department Color Badge */}
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold border ${deptStyle.badgeBg}`}>
                            <span>{deptStyle.icon}</span>
                            <span>{emp.department}</span>
                          </span>
                          {manager && manager.name && (
                            <span className="inline-block text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                              مسؤول: {manager.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">إجمالي الراتب:</span>
                      <span className="font-bold text-slate-800 font-mono">{totalSalary.toFixed(3)} د.ك</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">الإقامة:</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${expiry.color}`}>
                        {expiry.label}
                      </span>
                    </div>

                    {mohStatus && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">ترخيص الصحة (MOH):</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${mohStatus.badgeClass}`}>
                          {mohStatus.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3 text-right">المعرف</th>
                  <th className="p-3 text-right">الموظف</th>
                  <th className="p-3 text-right">المسمى الوظيفي</th>
                  <th className="p-3 text-right">القسم والمدير المباشر</th>
                  <th className="p-3 text-right">الرقم المدني</th>
                  <th className="p-3 text-right">إجمالي الراتب</th>
                  <th className="p-3 text-right">صلاحية المستندات</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const manager = employees.find(m => m.id === emp.parentId);
                  const isMed = emp.id.startsWith('MED-') || isMedicalStaff(emp.jobTitle, emp.department);
                  const mohStatus = getExpiryStatus(emp.mohLicenseExpiry);
                  const deptStyle = getDepartmentColorStyle(emp.department, emp.jobTitle);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-right">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isMed ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {emp.id}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 text-right">{emp.name}</td>
                      <td className="p-3 text-slate-600 text-right">{emp.jobTitle}</td>
                      <td className="p-3 text-slate-500 text-right">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold border ${deptStyle.badgeBg}`}>
                          <span>{deptStyle.icon}</span>
                          <span>{emp.department}</span>
                        </span>
                        {manager && (
                          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                            المدير: {manager.name}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-right">{emp.civilId}</td>
                      <td className="p-3 font-bold text-slate-800 text-right font-mono">
                        {(emp.basicSalary + emp.housingAllowance + emp.transportAllowance).toFixed(3)} د.ك
                      </td>
                      <td className="p-3 text-right space-y-1">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${checkExpiryStatus(emp.residencyExpiry).color}`}>
                            إقامة: {checkExpiryStatus(emp.residencyExpiry).label}
                          </span>
                        </div>
                        {mohStatus && (
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${mohStatus.badgeClass}`}>
                              MOH: {mohStatus.text}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="text-[#714B67] hover:underline font-bold cursor-pointer text-xs"
                          >
                            عرض وتعديل
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                            title="مسح"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* PAM Contract Form 2 Modal */}
      {showPamContractModal && selectedEmployee && (
        <OdooPamContractModal
          isOpen={showPamContractModal}
          onClose={() => setShowPamContractModal(false)}
          employee={selectedEmployee}
          company={activeCompany}
        />
      )}
    </div>
  );
};

export default OdooEmployeesFull;
