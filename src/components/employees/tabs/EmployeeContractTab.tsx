import React from 'react';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  onOpenPamModal?: () => void;
}

export const EmployeeContractTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  onOpenPamModal
}) => {
  const basicSalary = parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
  const housingAllowance = parseFloat(employee.housingAllowance || 0) || 0;
  const transportAllowance = parseFloat(employee.transportAllowance || 0) || 0;
  const medicalAllowance = parseFloat(employee.medicalAllowance || 0) || 0;
  const otherAllowance = parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;
  
  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">عقد العمل الأهلي والهيكل المالي</h4>
          <p className="text-xs text-slate-500">توثيق بنود العقد الأهلي، فترات التجربة (المادة 32)، والبدلات المعتمدة</p>
        </div>
        {onOpenPamModal && (
          <button
            type="button"
            onClick={onOpenPamModal}
            className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>👁️ معاينة العقد الأهلي الصادر من (PAM)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
              <span>بنود وفترة العقد</span>
            </h5>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">نوع العقد الأهلي</label>
            {isEditMode ? (
              <select
                value={employee.contractType || 'محدد المدة (Fixed Term)'}
                onChange={(e) => handleFieldChange('contractType', e.target.value)}
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:outline-none text-sm"
              >
                <option value="محدد المدة (Fixed Term)">محدد المدة (Fixed Term)</option>
                <option value="غير محدد المدة (Indefinite Term)">غير محدد المدة (Indefinite Term)</option>
              </select>
            ) : (
              <div className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
                {employee.contractType || 'محدد المدة (Fixed Term)'}
              </div>
            )}
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">فترة التجربة (Probation Period)</label>
            {isEditMode ? (
              <input
                type="number"
                value={employee.probationDays || 100}
                onChange={(e) => handleFieldChange('probationDays', e.target.value)}
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
                {employee.probationDays || 100} يوم عمل (المادة 32)
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2 mb-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>سريان التواريخ</span>
            </h5>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ بداية العقد</label>
            {isEditMode ? (
              <input
                type="date"
                value={employee.contractStartDate || employee.hireDate || ''}
                onChange={(e) => handleFieldChange('contractStartDate', e.target.value)}
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
                {employee.contractStartDate || employee.hireDate || '—'}
              </div>
            )}
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ نهاية العقد</label>
            {isEditMode ? (
              <input
                type="date"
                value={employee.contractEndDate || ''}
                onChange={(e) => handleFieldChange('contractEndDate', e.target.value)}
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
                {employee.contractEndDate || 'عقد مفتوح / غير محدد'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900">💰 حزمة الراتب والبدلات الشهرية</span>
          <span className="font-mono text-[#714B67] font-bold text-sm">
            الأجر الشامل: {totalSalary.toFixed(3)} د.ك
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-1">
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">الراتب الأساسي</span>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.basicSalary !== undefined ? employee.basicSalary : ''}
                onChange={(e) => handleFieldChange('basicSalary', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.basicSalary) || 0).toFixed(3)} د.ك</div>
            )}
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدل السكن</span>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.housingAllowance !== undefined ? employee.housingAllowance : ''}
                onChange={(e) => handleFieldChange('housingAllowance', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.housingAllowance) || 0).toFixed(3)} د.ك</div>
            )}
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدل الانتقال</span>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.transportAllowance !== undefined ? employee.transportAllowance : ''}
                onChange={(e) => handleFieldChange('transportAllowance', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.transportAllowance) || 0).toFixed(3)} د.ك</div>
            )}
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدلات أخرى</span>
            {isEditMode ? (
              <input
                type="number"
                step="0.001"
                value={employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || '')}
                onChange={(e) => handleFieldChange('otherAllowances', e.target.value)}
                placeholder="0.000"
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-sm focus:outline-none"
              />
            ) : (
              <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.otherAllowances || employee.otherAllowance || employee.allowances || 0)).toFixed(3)} د.ك</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
