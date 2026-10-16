import React from 'react';
import { Briefcase, ExternalLink, Layers } from 'lucide-react';
import { EditableField, EditableSelect } from '../../EditableField';
import { CompactFormAccordion } from '../../ui/CompactFormAccordion';
interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  onOpenContracts?: () => void;
  onOpenLeaveSettings?: () => void;
  /** عرض مرجعي من تخصيصات الإجازة (إن وُجد) */
  displayedCarriedOverDays?: number | string;
  /** Pilot: حقول أساسية + أقسام قابلة للطي */
  compact?: boolean;
}

export const EmployeeWorkTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  onOpenContracts,
  onOpenLeaveSettings,
  displayedCarriedOverDays,
  compact = false,
}) => {
  const carriedOverDisplay =
    displayedCarriedOverDays !== undefined && displayedCarriedOverDays !== ''
      ? displayedCarriedOverDays
      : employee.carriedOverLeave2025 !== undefined
        ? employee.carriedOverLeave2025
        : employee.carriedOverBalance !== undefined
          ? employee.carriedOverBalance
          : 0;

  if (compact) {
    return (
      <div className="space-y-5 animate-fade-in text-slate-900">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">أساسي</span>
          <span>المسمى، القسم، وبيانات التواصل — الحقول الإلزامية للتشغيل اليومي</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 w-full">
          <EditableField
            studioFieldKey="jobTitle"
            label="المسمى الوظيفي"
            value={employee.jobTitle || ''}
            onChange={(val) => handleFieldChange('jobTitle', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="مثال: مسؤول موارد بشرية"
          />
          <EditableField
            studioFieldKey="dept"
            label="القسم / الإدارة"
            value={employee.dept || employee.department || ''}
            onChange={(val) => {
              handleFieldChange('dept', val);
              handleFieldChange('department', val);
            }}
            isEditMode={isEditMode}
            type="text"
            placeholder="الشؤون الإدارية"
          />
          <EditableField
            studioFieldKey="phone"
            label="هاتف العمل"
            value={employee.phone || ''}
            onChange={(val) => handleFieldChange('phone', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="+965"
          />
          <EditableField
            studioFieldKey="email"
            label="بريد العمل"
            value={employee.email || ''}
            onChange={(val) => handleFieldChange('email', val)}
            isEditMode={isEditMode}
            type="email"
            placeholder="employee@company.com"
          />
        </div>

        <CompactFormAccordion
          title="معلومات إضافية — التنظيم والدوام"
          subtitle="المدير، الموقع، الجدول، رصيد الإجازة المرجعي"
          icon={<Briefcase size={16} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
            <EditableField
            studioFieldKey="manager"
              label="المدير المباشر"
              value={employee.manager || employee.directSupervisor || ''}
              onChange={(val) => {
                handleFieldChange('manager', val);
                handleFieldChange('directSupervisor', val);
              }}
              isEditMode={isEditMode}
              type="text"
            />
            <EditableField
            studioFieldKey="workLocation"
              label="موقع العمل"
              value={employee.workLocation || ''}
              onChange={(val) => handleFieldChange('workLocation', val)}
              isEditMode={isEditMode}
              type="text"
            />
            <div className="py-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ التعيين</label>
              <div className="font-mono text-sm font-semibold text-slate-900">
                {(employee.hireDate || employee.joinDate || '—').toString().slice(0, 10)}
              </div>
            </div>
            <EditableField
              label="رصيد مرحّل (عرض)"
              value={`${Number(carriedOverDisplay) || 0} يوم`}
              onChange={() => {}}
              readOnly
              lockedHint="رصيد الإجازة المرحّل يُدار من تخصيصات الإجازة — افتح إعدادات HR للتعديل."
            />
            {onOpenLeaveSettings && (
              <button
                type="button"
                onClick={onOpenLeaveSettings}
                className="mt-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                إعدادات HR / كشف الرصيد
              </button>
            )}
            <EditableSelect
            studioFieldKey="workingSchedule"
              label="جدول العمل"
              value={employee.workingSchedule || 'standard_48h'}
              onChange={(val) => handleFieldChange('workingSchedule', val)}
              isEditMode={isEditMode}
              options={[
                { value: 'standard_48h', label: 'قياسي 48 ساعة' },
                { value: 'shifts_rotational', label: 'ورديات' },
                { value: 'part_time', label: 'جزئي' },
              ]}
            />
          </div>
        </CompactFormAccordion>

      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      {/* 2-Columns Standard Form Grid: Job & Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
        
        {/* Right Column: الوظيفة والتنظيم الإداري */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>التنظيم الوظيفي والإداري</span>
            </h4>
          </div>

          <EditableField
            studioFieldKey="jobTitle"
            label="المسمى الوظيفي (Job Position)"
            value={employee.jobTitle || ''}
            onChange={(val) => handleFieldChange('jobTitle', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="مثال: مسؤول موارد بشرية / طبيب عام"
          />

          <EditableField
            studioFieldKey="dept"
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
            studioFieldKey="manager"
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
            studioFieldKey="workLocation"
            label="موقع العمل / الفرع (Work Location)"
            value={employee.workLocation || ''}
            onChange={(val) => handleFieldChange('workLocation', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="المقر الرئيسي - الكويت"
          />

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
            studioFieldKey="email"
            label="البريد الإلكتروني للعمل (Work Email)"
            value={employee.email || ''}
            onChange={(val) => handleFieldChange('email', val)}
            isEditMode={isEditMode}
            type="email"
            placeholder="employee@company.com"
          />

          <EditableField
            studioFieldKey="phone"
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
                className="mt-2 text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink size={12} />
                فتح إعدادات الموارد البشرية / كشف الرصيد
              </button>
            )}
          </div>

          <EditableSelect
            studioFieldKey="workingSchedule"
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


    </div>
  );
};
