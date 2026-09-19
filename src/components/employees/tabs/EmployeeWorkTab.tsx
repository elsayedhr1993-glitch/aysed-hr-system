import React from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';
import { EditableField, EditableSelect } from '../../EditableField';
import { calculateKuwaitDailyRate } from '../../../utils/kuwaitPayrollMath';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  onOpenContracts?: () => void;
  onOpenLeaveSettings?: () => void;
  /** عرض مرجعي من تخصيصات الإجازة (إن وُجد) */
  displayedCarriedOverDays?: number | string;
}

export const EmployeeWorkTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  onOpenContracts,
  onOpenLeaveSettings,
  displayedCarriedOverDays
}) => {
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
    employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
    
  const basicSalary = parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || 0) || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || 0) || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0) || 0;
  const otherAllowance = parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;
  const dailyWage = calculateKuwaitDailyRate(basicSalary);

  const carriedOverDisplay =
    displayedCarriedOverDays !== undefined && displayedCarriedOverDays !== ''
      ? displayedCarriedOverDays
      : employee.carriedOverLeave2025 !== undefined
        ? employee.carriedOverLeave2025
        : employee.carriedOverBalance !== undefined
          ? employee.carriedOverBalance
          : 0;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      
      {/* 2-Columns Standard Form Grid: Job & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        
        {/* Right Column: الوظيفة والتنظيم الإداري */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
              <span>التنظيم الوظيفي والإداري</span>
            </h4>
          </div>

          <EditableField
            label="المسمى الوظيفي (Job Position)"
            value={employee.jobTitle || ''}
            onChange={(val) => handleFieldChange('jobTitle', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="مثال: مسؤول موارد بشرية / طبيب عام"
          />

          <EditableField
            label="الإدارة / القسم (Department)"
            value={employee.dept || employee.department || ''}
            onChange={(val) => {
              handleFieldChange('dept', val);
              handleFieldChange('department', val);
            }}
            isEditMode={isEditMode}
            type="text"
            placeholder="مثال: الشؤون الإدارية / التمريض"
          />

          <EditableField
            label="المدير المباشر (Coach / Manager)"
            value={employee.manager || employee.directSupervisor || ''}
            onChange={(val) => {
              handleFieldChange('manager', val);
              handleFieldChange('directSupervisor', val);
            }}
            isEditMode={isEditMode}
            type="text"
            placeholder="اسم المسؤول المباشر"
          />

          <EditableField
            label="موقع العمل / الفرع (Work Location)"
            value={employee.workLocation || ''}
            onChange={(val) => handleFieldChange('workLocation', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="المقر الرئيسي - الكويت"
          />

          {isMedicalStaff && (
            <EditableField
              label="رقم ترخيص مزاولة المهنة (MOH License)"
              value={employee.mohLicense || ''}
              onChange={(val) => handleFieldChange('mohLicense', val)}
              isEditMode={isEditMode}
              type="text"
              placeholder="MOH-2026-0000"
            />
          )}
        </div>

        {/* Left Column: الاتصال ومواعيد الدوام */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>الاتصال بالعمل ومواعيد الدوام</span>
            </h4>
          </div>

          <EditableField
            label="البريد الإلكتروني للعمل (Work Email)"
            value={employee.email || ''}
            onChange={(val) => handleFieldChange('email', val)}
            isEditMode={isEditMode}
            type="email"
            placeholder="employee@company.com"
          />

          <EditableField
            label="هاتف العمل (Work Phone)"
            value={employee.phone || ''}
            onChange={(val) => handleFieldChange('phone', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="+965 22000000"
          />

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              تاريخ التعيين والمباشرة (Hire Date) — للعرض فقط
            </label>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(employee.hireDate || employee.joinDate || '—').toString().slice(0, 10)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              يُحدَّث تلقائياً عند اعتماد إقرار المباشرة في تطبيق Commencement — لا يُعدَّل يدوياً من هنا.
            </p>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              رصيد الإجازات المرحل (Carried Over) — للعرض فقط
            </label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {Number(carriedOverDisplay) || 0} يوم
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              يُدار من تخصيصات الإجازة المعتمدة (leave_allocations) وليس من هذا الحقل. للتعديل استخدم تبويب إعدادات الموارد البشرية أو كشف الرصيد.
            </p>
            {onOpenLeaveSettings && (
              <button
                type="button"
                onClick={onOpenLeaveSettings}
                className="mt-2 text-[11px] font-bold text-[#714B67] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink size={12} />
                فتح إعدادات الموارد البشرية / كشف الرصيد
              </button>
            )}
          </div>

          <EditableSelect
            label="جدول وساعات العمل (Working Schedule)"
            value={employee.workingSchedule || 'standard_48h'}
            onChange={(val) => handleFieldChange('workingSchedule', val)}
            isEditMode={isEditMode}
            options={[
              { value: "standard_48h", label: "دوام قياسي (8 ساعات / 6 أيام - المادة 64)" },
              { value: "shifts_rotational", label: "ورديات ونوبات متناوبة (حراسة / كادر طبي)" },
              { value: "part_time", label: "دوام جزئي (Part-Time)" }
            ]}
          />
        </div>

      </div>

      {/* Financial Section: read-only — مصدر التعديل = تطبيق العقود */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-xs text-slate-900">حزمة الأجور والبدلات الشهرية (عرض من العقد — WPS)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-mono font-bold flex items-center gap-4 text-slate-700">
              <span>أجر اليوم (26 يوم): <strong className="text-purple-900">{dailyWage.toFixed(3)} د.ك</strong></span>
              <span className="text-emerald-700 font-bold">
                الراتب الإجمالي: {totalSalary.toFixed(3)} د.ك
              </span>
            </div>
            {onOpenContracts && (
              <button
                type="button"
                onClick={onOpenContracts}
                className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ExternalLink size={12} />
                تعديل في تطبيق العقود
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          لا يُعدَّل الراتب أو البدلات من «معلومات العمل». التحديث يتم حصرياً عبر سجل العقود المعتمد لضمان توافق WPS والقوى العاملة.
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-1">
          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">الراتب الأساسي (Basic)</label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(Number(employee.basicSalary) || 0).toFixed(3)} د.ك
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدل السكن (Housing)</label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(Number(employee.housingAllowance) || 0).toFixed(3)} د.ك
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدل الانتقال (Transport)</label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(Number(employee.transportAllowance) || 0).toFixed(3)} د.ك
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدل طبي (Medical)</label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(Number(employee.medicalAllowance) || 0).toFixed(3)} د.ك
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدلات أخرى وطبيعة عمل</label>
            <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
              {(Number(employee.otherAllowances !== undefined ? employee.otherAllowances : employee.otherAllowance) || 0).toFixed(3)} د.ك
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
          <span className="text-amber-600 font-bold">●</span>
          <span>تُعرض القيم من عقد العمل المعتمد في الهيئة العامة للقوى العاملة وفق قانون العمل الكويتي.</span>
        </p>
      </div>

    </div>
  );
};
