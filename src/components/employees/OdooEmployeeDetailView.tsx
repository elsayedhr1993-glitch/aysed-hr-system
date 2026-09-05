import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Printer, 
  Save, 
  Trash2, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  User,
  CreditCard,
  Plane,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { triggerContractRunningLeaveAllocation } from '../../utils/contractLeaveTrigger';
import { TabDocumentScanner } from '../TabDocumentScanner';

interface Props {
  employee: any;
  onSave: (updatedEmployee: any) => Promise<void>;
  onBack: () => void;
  onDelete?: (id: string, name: string) => void;
  onTriggerPrint: (title: string, data: any) => void;
  onOpenPamModal: () => void;
  activeCompany?: any;
}

export const OdooEmployeeDetailView: React.FC<Props> = ({
  employee: initialEmployee,
  onSave,
  onBack,
  onDelete,
  onTriggerPrint,
  onOpenPamModal,
  activeCompany
}) => {
  const [employee, setEmployee] = useState<any>({ ...initialEmployee });
  const [activeTab, setActiveTab] = useState<'work' | 'private' | 'hr'>('work');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Quick calculations for wages
  const basicSalary = parseFloat(employee.basicSalary || employee.salary || 0);
  const housingAllowance = parseFloat(employee.housingAllowance || 0);
  const transportAllowance = parseFloat(employee.transportAllowance || 0);
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0);
  const otherAllowance = parseFloat(employee.allowances || employee.otherAllowance || 0);
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;

  // Daily wage according to Kuwait Labor Law (26 work days)
  const dailyWage = totalSalary > 0 ? (totalSalary / 26) : 0;

  // Contract status
  const contractStatus = employee.contractStatus || employee.status || 'ساري';
  const isContractRunning = String(contractStatus).toLowerCase() === 'running' || 
                            String(contractStatus).toLowerCase() === 'active' || 
                            contractStatus === 'ساري';

  // Check if medical staff to show conditional MOH fields
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
                         (employee.jobTitle || '').includes('طبيب') || 
                         (employee.jobTitle || '').includes('ممرض') ||
                         (employee.jobTitle || '').includes('دكتور');

  const handleFieldChange = (field: string, value: any) => {
    setEmployee((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleOcrResult = (scannedData: any, docType: string) => {
    setEmployee((prev: any) => {
      const updated = { ...prev };
      if (docType === 'civil_id') {
        if (scannedData.civil_id || scannedData.civilId) updated.civil_id_number = scannedData.civil_id || scannedData.civilId;
        if (scannedData.full_name || scannedData.fullNameAr || scannedData.nameAr) updated.nameAr = scannedData.full_name || scannedData.fullNameAr || scannedData.nameAr;
        if (scannedData.nationality) updated.nationality = scannedData.nationality;
        if (scannedData.gender) {
          updated.gender = (scannedData.gender.toLowerCase().includes('female') || scannedData.gender.includes('أنثى')) ? 'أنثى - Female' : 'ذكر - Male';
        }
        if (scannedData.birth_date || scannedData.birthDate || scannedData.dob) updated.birthDate = scannedData.birth_date || scannedData.birthDate || scannedData.dob;
        if (scannedData.expiry_date || scannedData.civil_id_expiry || scannedData.expiryDate) updated.civilIdExpiry = scannedData.expiry_date || scannedData.civil_id_expiry || scannedData.expiryDate;
      } else if (docType === 'passport') {
        if (scannedData.passport_no || scannedData.passportNo) updated.passportNo = scannedData.passport_no || scannedData.passportNo;
        if (scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate) updated.passportExpiry = scannedData.passport_expiry || scannedData.passportExpiry || scannedData.expiry_date || scannedData.expiryDate;
        const nameEn = scannedData.name_en || scannedData.fullNameEn || scannedData.nameEn;
        if (!updated.nameEn && nameEn) updated.nameEn = nameEn;
      } else if (docType === 'medical_license') {
        if (scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense) updated.mohLicense = scannedData.license_no || scannedData.medical_license_no || scannedData.mohLicenseNo || scannedData.mohLicense;
        if (scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry) updated.mohLicenseExpiry = scannedData.license_expiry || scannedData.medical_license_expiry || scannedData.mohLicenseExpiryDate || scannedData.mohLicenseExpiry;
        if (scannedData.license_title || scannedData.profession || scannedData.jobTitle || scannedData.specialty) updated.specialty = scannedData.license_title || scannedData.profession || scannedData.jobTitle || scannedData.specialty;
      } else if (docType === 'work_permit') {
        if (scannedData.work_permit_no || scannedData.pam_no || scannedData.documentNumber) updated.workPermitNo = scannedData.work_permit_no || scannedData.pam_no || scannedData.documentNumber;
        if (scannedData.work_permit_start || scannedData.pam_start || scannedData.pamStartDate) updated.contractStartDate = scannedData.work_permit_start || scannedData.pam_start || scannedData.pamStartDate;
        if (scannedData.work_permit_end || scannedData.pam_end || scannedData.pamEndDate || scannedData.expiry_date || scannedData.expiryDate) updated.contractEndDate = scannedData.work_permit_end || scannedData.pam_end || scannedData.pamEndDate || scannedData.expiry_date || scannedData.expiryDate;
        if (scannedData.salary || scannedData.basic_salary || scannedData.basicSalary) updated.basicSalary = scannedData.salary || scannedData.basic_salary || scannedData.basicSalary;
        if (scannedData.profession || scannedData.job_title || scannedData.jobTitle) updated.jobTitle = scannedData.profession || scannedData.job_title || scannedData.jobTitle;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-trigger leave allocation if contract is active/running
      if (isContractRunning && employee.id) {
        triggerContractRunningLeaveAllocation({
          employeeId: employee.id,
          employeeName: employee.nameAr || employee.fullNameAr,
          startDate: employee.hireDate || employee.contractStartDate || '2026-01-01',
          contractStatus: 'running',
          companyId: employee.companyId || activeCompany?.id
        });
      }

      await onSave({
        ...employee,
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        allowances: otherAllowance,
        totalSalary
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-right font-sans text-slate-900" dir="rtl">
      
      {/* Top Breadcrumbs & Control Bar */}
      <div className="bg-white border border-slate-300 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#714B67] hover:text-[#5a3b52] hover:bg-purple-50 px-2.5 py-1.5 rounded-lg border border-[#714B67]/30 transition"
          >
            <ArrowRight size={16} />
            <span>العودة لدليل الموظفين</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-black">{employee.nameAr || employee.fullNameAr || 'ملف موظف جديد'}</span>
          <span className="font-mono bg-purple-100 text-[#714B67] px-2 py-0.5 rounded text-xs font-bold">{employee.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Check size={14} /> تم الحفظ بنجاح
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
          </button>

          <button
            type="button"
            onClick={() => onTriggerPrint(`ملف الموظف الشامل - ${employee.nameAr || employee.id}`, employee)}
            className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={15} className="text-[#714B67]" />
            <span>طباعة الملف (A4)</span>
          </button>

          {onDelete && employee.id && (
            <button
              type="button"
              onClick={() => onDelete(employee.id, employee.nameAr)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="حذف الموظف"
            >
              <Trash2 size={15} />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Employee Card & Smart Buttons */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Profile Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${employee.avatarColor || 'bg-[#714B67]'} text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0`}>
              {(employee.nameAr || employee.fullNameAr || 'م').slice(0, 2)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={employee.nameAr || ''}
                  onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                  placeholder="اسم الموظف بالعربية"
                  className="text-xl font-black text-slate-900 border border-transparent hover:border-slate-300 focus:border-[#714B67] rounded-lg px-2 py-0.5 focus:bg-purple-50/40 focus:outline-none transition"
                />
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  isContractRunning 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {contractStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-800">
                <input
                  type="text"
                  value={employee.nameEn || ''}
                  onChange={(e) => handleFieldChange('nameEn', e.target.value)}
                  placeholder="English Name"
                  className="font-semibold text-slate-700 border border-transparent hover:border-slate-300 focus:border-[#714B67] rounded px-1.5 py-0.5 focus:bg-purple-50/40 focus:outline-none"
                />
                <span className="text-slate-300">|</span>
                <span className="text-slate-900 font-bold">{employee.jobTitle || 'المسمى الوظيفي'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-700">{employee.dept || 'القسم العام'}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  🏢 {employee.companyId || activeCompany?.id || 'comp-super-admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Odoo Smart Buttons (العقود - الإجازات - نموذج PAM 2) */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Smart Button 1: العقود (Contracts) */}
            <div 
              onClick={() => setActiveTab('work')}
              className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-300 rounded-xl p-2.5 min-w-[135px] flex items-center gap-3 transition cursor-pointer shadow-2xs group"
              title="سجل عقد العمل والراتب"
            >
              <div className="w-9 h-9 rounded-lg bg-[#714B67] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <FileText size={18} />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-purple-900 font-bold">عقد العمل</div>
                <div className="text-sm font-black text-slate-900 font-mono">1 ساري</div>
              </div>
            </div>

            {/* Smart Button 2: رصيد الإجازات (Time Off) */}
            <div 
              onClick={() => setActiveTab('work')}
              className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-300 rounded-xl p-2.5 min-w-[135px] flex items-center gap-3 transition cursor-pointer shadow-2xs group"
              title="رصيد الإجازات السنوية المستحق"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Plane size={18} />
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-900 font-bold">رصيد الإجازات</div>
                <div className="text-sm font-black text-slate-900 font-mono">30 يوم</div>
              </div>
            </div>

            {/* Smart Button 3: نموذج القوى العاملة (PAM 2) */}
            <button
              type="button"
              onClick={onOpenPamModal}
              className="bg-amber-50/70 hover:bg-amber-100/80 border border-amber-300 rounded-xl p-2.5 min-w-[155px] flex items-center gap-3 transition cursor-pointer shadow-2xs group text-right"
              title="إصدار وطباعة عقد العمل ونموذج إذن العمل الرسمي PAM 2"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-[10px] text-amber-900 font-bold">نموذج PAM 2</div>
                <div className="text-xs font-black text-slate-900">إذن العمل الرسمي</div>
              </div>
            </button>

          </div>

        </div>

        {/* Notebook Tabs Bar (معلومات العمل - البيانات الشخصية - إعدادات HR) */}
        <div className="border-b border-slate-300 flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`px-5 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'work'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={16} />
            <span>معلومات العمل (Work Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-5 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'private'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={16} />
            <span>البيانات الشخصية (Private Information)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr')}
            className={`px-5 py-3 text-xs font-black border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'hr'
                ? 'border-[#714B67] text-[#714B67] bg-purple-50/40 rounded-t-lg'
                : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 size={16} />
            <span>إعدادات الموارد البشرية (HR Settings)</span>
          </button>

        </div>

        {/* Tab 1: معلومات العمل (Work Information) */}
        {activeTab === 'work' && (
          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* Work Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">المسمى الوظيفي (Job Position)</label>
                <input
                  type="text"
                  value={employee.jobTitle || ''}
                  onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="مثال: مسؤول موارد بشرية / طبيب عام"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الإدارة / القسم (Department)</label>
                <input
                  type="text"
                  value={employee.dept || ''}
                  onChange={(e) => handleFieldChange('dept', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="مثال: الشؤون الإدارية / التمريض"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">المدير المباشر (Coach / Manager)</label>
                <input
                  type="text"
                  value={employee.manager || ''}
                  onChange={(e) => handleFieldChange('manager', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="اسم المسؤول المباشر"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">موقع العمل / الفرع (Work Location)</label>
                <input
                  type="text"
                  value={employee.workLocation || ''}
                  onChange={(e) => handleFieldChange('workLocation', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="المقر الرئيسي - الكويت"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">البريد الإلكتروني للعمل (Work Email)</label>
                <input
                  type="email"
                  value={employee.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="employee@company.com"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">هاتف العمل (Work Phone)</label>
                <input
                  type="text"
                  value={employee.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="+965 22000000"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">تاريخ التعيين والمباشرة (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.hireDate ? employee.hireDate.slice(0, 10) : '2026-01-01'}
                  onChange={(e) => handleFieldChange('hireDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {isMedicalStaff && (
                <div>
                  <label className="block text-slate-900 font-bold mb-1.5">رقم ترخيص وزارة الصحة (MOH License)</label>
                  <input
                    type="text"
                    value={employee.mohLicense || ''}
                    onChange={(e) => handleFieldChange('mohLicense', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="MOH-2026-0000"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">جدول وساعات العمل (Working Schedule)</label>
                <select
                  value={employee.workingSchedule || 'standard_48h'}
                  onChange={(e) => handleFieldChange('workingSchedule', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="standard_48h">دوام قياسي (8 ساعات / 6 أيام - المادة 64)</option>
                  <option value="shifts_rotational">ورديات ونوبات متناوبة (حراسة / كادر طبي)</option>
                  <option value="part_time">دوام جزئي (Part-Time)</option>
                </select>
              </div>

            </div>

            {/* Compensation & Statutory Allowances (Kuwait WPS) */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                  <span className="font-black text-sm text-slate-900">حزمة الأجور والبدلات الشهرية (نظام حماية الأجور WPS)</span>
                </div>
                <div className="text-slate-900 font-bold flex items-center gap-4 font-mono">
                  <span>أجر اليوم (26 يوم): <strong className="text-purple-900">{dailyWage.toFixed(3)} د.ك</strong></span>
                  <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg font-black text-sm">
                    الراتب الإجمالي: {totalSalary.toFixed(3)} د.ك
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">الراتب الأساسي (Basic)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={employee.basicSalary || employee.salary || 0}
                    onChange={(e) => handleFieldChange('basicSalary', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">بدل السكن (Housing)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={employee.housingAllowance || 0}
                    onChange={(e) => handleFieldChange('housingAllowance', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">بدل الانتقال (Transport)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={employee.transportAllowance || 0}
                    onChange={(e) => handleFieldChange('transportAllowance', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">بدلات أخرى وطبيعة عمل</label>
                  <input
                    type="number"
                    step="0.001"
                    value={employee.allowances || employee.otherAllowance || 0}
                    onChange={(e) => handleFieldChange('allowances', e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: البيانات الشخصية (Private Information) */}
        {activeTab === 'private' && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TabDocumentScanner 
                tabType="CIVIL_ID" 
                title="البطاقة المدنية" 
                onDataExtracted={(data) => handleOcrResult(data, 'civil_id')} 
              />
              <TabDocumentScanner 
                tabType="PASSPORT" 
                title="جواز السفر" 
                onDataExtracted={(data) => handleOcrResult(data, 'passport')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الرقم المدني (Civil ID)</label>
                <input
                  type="text"
                  maxLength={12}
                  value={employee.civilId || employee.civil_id_number || ''}
                  onChange={(e) => handleFieldChange('civilId', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="290010100000"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">انتهاء البطاقة المدنية (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : ''}
                  onChange={(e) => handleFieldChange('civilIdExpiry', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الجنسية (Nationality)</label>
                <input
                  type="text"
                  value={employee.nationality || 'كويتي'}
                  onChange={(e) => handleFieldChange('nationality', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="كويتي / مصري / هندي / أردني..."
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">تاريخ الميلاد (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.dob ? employee.dob.slice(0, 10) : (employee.birthDate ? employee.birthDate.slice(0, 10) : '')}
                  onChange={(e) => handleFieldChange('dob', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الجنس (Gender)</label>
                <select
                  value={employee.gender || 'male'}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الحالة الاجتماعية (Marital Status)</label>
                <select
                  value={employee.maritalStatus || 'single'}
                  onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="single">أعزب (Single)</option>
                  <option value="married">متزوج (Married)</option>
                  <option value="divorced">مطلق (Divorced)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">رقم جواز السفر (Passport No)</label>
                <input
                  type="text"
                  value={employee.passportNo || ''}
                  onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="A12345678"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">انتهاء الجواز (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
                  onChange={(e) => handleFieldChange('passportExpiry', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">انتهاء الإقامة (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.residencyExpiry ? employee.residencyExpiry.slice(0, 10) : ''}
                  onChange={(e) => handleFieldChange('residencyExpiry', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الهاتف الشخصي (Personal Phone)</label>
                <input
                  type="text"
                  value={employee.personalPhone || employee.mobile || ''}
                  onChange={(e) => handleFieldChange('personalPhone', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="+965 90000000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-900 font-bold mb-1.5">العنوان بالتفصيل في دولة الكويت</label>
                <input
                  type="text"
                  value={employee.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="المحافظة، المنطقة، قطعة، شارع، قسيمة/مبنى، شقة"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">اسم البنك الكويتي (Bank Name)</label>
                <input
                  type="text"
                  value={employee.bankName || 'بنك الكويت الوطني NBK'}
                  onChange={(e) => handleFieldChange('bankName', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-900 font-bold mb-1.5">رقم الحساب والآيبان (IBAN)</label>
                <input
                  type="text"
                  value={employee.iban || ''}
                  onChange={(e) => handleFieldChange('iban', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="KW00NBOK0000000000000000000000"
                />
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: إعدادات HR (HR Settings) */}
        {activeTab === 'hr' && (
          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isMedicalStaff && (
                <TabDocumentScanner 
                  tabType="MEDICAL_LICENSE" 
                  title="ترخيص مزاولة المهنة (MOH)" 
                  onDataExtracted={(data) => handleOcrResult(data, 'medical_license')} 
                />
              )}
              <TabDocumentScanner 
                tabType="WORK_PERMIT" 
                title="إذن العمل (PAM)" 
                onDataExtracted={(data) => handleOcrResult(data, 'work_permit')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div>
                <label className="block text-slate-900 font-bold mb-1.5">نوع العقد (Contract Type)</label>
                <select
                  value={employee.contractType || 'محدد المدة'}
                  onChange={(e) => handleFieldChange('contractType', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="محدد المدة">محدد المدة (Fixed-Term)</option>
                  <option value="غير محدد المدة">غير محدد المدة (Indefinite)</option>
                  <option value="عقد تدريب / تأهيل">عقد تدريب / تأهيل</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">حالة العقد في النظام (Status)</label>
                <select
                  value={employee.contractStatus || 'ساري'}
                  onChange={(e) => handleFieldChange('contractStatus', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="ساري">ساري (Running / Active)</option>
                  <option value="قيد التجديد">قيد التجديد (To Renew)</option>
                  <option value="فترة تجربة">فترة تجربة (Probation)</option>
                  <option value="منتهي">منتهي (Expired)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">رقم البصمة البيومترية (ZKTeco PIN)</label>
                <input
                  type="text"
                  value={employee.pin || employee.badgeId || employee.id || ''}
                  onChange={(e) => handleFieldChange('pin', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="101"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">الخضوع للتأمينات الاجتماعية (PIFSS)</label>
                <select
                  value={employee.pifssStatus || ((employee.nationality || '').includes('كويت') ? 'subscribed' : 'exempt')}
                  onChange={(e) => handleFieldChange('pifssStatus', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="subscribed">مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)</option>
                  <option value="exempt">غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">تاريخ بداية العقد الحالي (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.contractStartDate ? employee.contractStartDate.slice(0, 10) : '2026-01-01'}
                  onChange={(e) => handleFieldChange('contractStartDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1.5">تاريخ نهاية العقد الحالي (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={employee.contractEndDate ? employee.contractEndDate.slice(0, 10) : '2027-01-01'}
                  onChange={(e) => handleFieldChange('contractEndDate', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-slate-900 font-bold mb-1.5">الملاحظات والسجلات الإدارية</label>
                <textarea
                  rows={3}
                  value={employee.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="أي شروط خاصة أو ملاحظات إدارية ملحقة بملف الموظف..."
                />
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default OdooEmployeeDetailView;
