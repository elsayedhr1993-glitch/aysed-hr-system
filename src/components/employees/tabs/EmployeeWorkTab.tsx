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
    
  const basicSalary = parseFloat(employee.basicSalary || '0') || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || '0') || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || '0') || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || '0') || 0;
  const otherAllowance = parseFloat(employee.otherAllowance || '0') || 0;
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;
  const dailyWage = totalSalary > 0 ? (totalSalary / 26) : 0;
  return (
    <>

          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* Work Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
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
                value={employee.dept || ''}
                onChange={(val) => handleFieldChange('dept', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="مثال: الشؤون الإدارية / التمريض"
              />

                            <EditableField
                label="المدير المباشر (Coach / Manager)"
                value={employee.manager || ''}
                onChange={(val) => handleFieldChange('manager', val)}
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
                label="تاريخ التعيين والمباشرة (YYYY-MM-DD)"
                value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}
                onChange={(val) => handleFieldChange('hireDate', val)}
                isEditMode={isEditMode}
                type="date"
              />

              {isMedicalStaff && (
                              <EditableField
                label="رقم ترخيص وزارة الصحة (MOH License)"
                value={employee.mohLicense || ''}
                onChange={(val) => handleFieldChange('mohLicense', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="MOH-2026-0000"
              />
              )}

                            <EditableSelect
                label="جدول وساعات العمل (Working Schedule)"
                value={employee.workingSchedule || 'standard_48h'}
                onChange={(val) => handleFieldChange('workingSchedule', val)}
                isEditMode={isEditMode}
                options={[{ value: "standard_48h", label: "دوام قياسي (8 ساعات / 6 أيام - المادة 64)" }, { value: "shifts_rotational", label: "ورديات ونوبات متناوبة (حراسة / كادر طبي)" }, { value: "part_time", label: "دوام جزئي (Part-Time)" }]}
              />

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
                  <label className="block text-slate-600 font-bold mb-1">الراتب الأساسي (Basic)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.basicSalary || employee.salary || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدل السكن (Housing)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.housingAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدل الانتقال (Transport)</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.transportAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">بدلات أخرى وطبيعة عمل</label>
                  <input
                    type="number"
                    step="0.001"
                    readOnly={true}
                    value={employee.allowances || employee.otherAllowance || 0}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-500 bg-slate-100 cursor-not-allowed focus:outline-none"
                    title="تُقرأ هذه القيمة تلقائياً من عقد العمل النشط"
                  />
                </div>

                <div className="col-span-full bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs font-bold leading-relaxed">
                  <span className="text-base">💡</span>
                  <span>
                    <strong>حماية الأجور والامتثال لـ WPS:</strong> حقول الراتب والبدلات هي حقول محمية (قراءة فقط) تُسحب بشكل آلي وتطبيقي دائم من تفاصيل العقد النشط (Active Contract) في نظام العقود، وذلك لضمان تطابق البيانات تماماً ومنع أي ثغرات أو غرامات من هيئة القوى العاملة.
                  </span>
                </div>
              </div>
            </div>

          </div>
        
        
    </>
  );
};
