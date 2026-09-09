import React from 'react';
import { DollarSign } from 'lucide-react';
import { EditableField, EditableSelect } from '../../EditableField';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
}

export const EmployeeWorkTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange
}) => {
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
    employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
    
  const basicSalary = parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || 0) || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || 0) || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0) || 0;
  const otherAllowance = parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;
  const dailyWage = totalSalary > 0 ? (totalSalary / 26) : 0;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      
      {/* 2-Columns Standard Form Grid: Job & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        
        {/* Right Column: الوظيفة والتنظيم الإداري */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
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
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
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

          <EditableField
            label="تاريخ التعيين والمباشرة (Hire Date)"
            value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}
            onChange={(val) => handleFieldChange('hireDate', val)}
            isEditMode={isEditMode}
            type="date"
          />

          <EditableField
            label="رصيد الإجازات المرحل (Carried Over Leave Balance)"
            value={employee.carriedOverLeave2025 !== undefined ? employee.carriedOverLeave2025 : (employee.carriedOverBalance !== undefined ? employee.carriedOverBalance : 0)}
            onChange={(val) => {
              const num = parseFloat(val) || 0;
              handleFieldChange('carriedOverLeave2025', num);
              handleFieldChange('carriedOverBalance', num);
              handleFieldChange('openingBalance', num);
            }}
            isEditMode={isEditMode}
            type="number"
            placeholder="0"
          />

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

      {/* Financial Section: Odoo Open Wage Fields */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span className="font-black text-xs text-slate-900">حزمة الأجور والبدلات الشهرية (نظام حماية الأجور WPS)</span>
          </div>
          <div className="text-xs font-mono font-bold flex items-center gap-4 text-slate-700">
            <span>أجر اليوم (26 يوم): <strong className="text-purple-900">{dailyWage.toFixed(3)} د.ك</strong></span>
            <span className="text-emerald-700 font-black">
              الراتب الإجمالي: {totalSalary.toFixed(3)} د.ك
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">الراتب الأساسي (Basic)</label>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.basicSalary !== undefined ? employee.basicSalary : ''}
                onChange={(e) => handleFieldChange('basicSalary', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                {(Number(employee.basicSalary) || 0).toFixed(3)} د.ك
              </div>
            )}
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدل السكن (Housing)</label>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.housingAllowance !== undefined ? employee.housingAllowance : ''}
                onChange={(e) => handleFieldChange('housingAllowance', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                {(Number(employee.housingAllowance) || 0).toFixed(3)} د.ك
              </div>
            )}
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدل الانتقال (Transport)</label>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.transportAllowance !== undefined ? employee.transportAllowance : ''}
                onChange={(e) => handleFieldChange('transportAllowance', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                {(Number(employee.transportAllowance) || 0).toFixed(3)} د.ك
              </div>
            )}
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">بدلات أخرى وطبيعة عمل</label>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance !== undefined ? employee.otherAllowance : '')}
                onChange={(e) => {
                  handleFieldChange('otherAllowances', e.target.value);
                  handleFieldChange('otherAllowance', e.target.value);
                }}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1">
                {(Number(employee.otherAllowances !== undefined ? employee.otherAllowances : employee.otherAllowance) || 0).toFixed(3)} د.ك
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
          <span className="text-amber-600 font-bold">●</span>
          <span>تُسحب البدلات تلقائياً من عقد العمل المعتمد في الهيئة العامة للقوى العاملة وفق قانون العمل الكويتي.</span>
        </p>
      </div>

    </div>
  );
};
