import React from 'react';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  onOpenPamModal?: () => void;
  onOpenContracts?: () => void;
}

export const EmployeeContractTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  onOpenPamModal,
  onOpenContracts
}) => {
  const basicSalary = Number.parseFloat(employee.basicSalary !== undefined ? employee.basicSalary : (employee.salary || 0)) || 0;
  const housingAllowance = Number.parseFloat(employee.housingAllowance || 0) || 0;
  const transportAllowance = Number.parseFloat(employee.transportAllowance || 0) || 0;
  const medicalAllowance = Number.parseFloat(employee.medicalAllowance || 0) || 0;
  const otherAllowance = Number.parseFloat(employee.otherAllowances !== undefined ? employee.otherAllowances : (employee.otherAllowance || employee.allowances || 0)) || 0;

  const totalSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + otherAllowance;

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">عقد العمل الأهلي والهيكل المالي</h4>
          <p className="text-xs text-slate-500">عرض ملخصي فقط. التعديل يتم داخل تطبيق العقود الرسمي لضمان مصدر موحد للبيانات.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenPamModal && (
            <button
              type="button"
              onClick={onOpenPamModal}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>👁️ معاينة العقد الأهلي الصادر من (PAM)</span>
            </button>
          )}
          {onOpenContracts && (
            <button
              type="button"
              onClick={onOpenContracts}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              فتح تطبيق العقود للتعديل
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        التعديل على بيانات العقد لا يتم من هذه الصفحة. استخدم تطبيق العقود الرسمي فقط لتحديث العقد أو الراتب أو البدلات.
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
            <div className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.contractType || 'محدد المدة (Fixed Term)'}
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">فترة التجربة (Probation Period)</label>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.probationDays || 100} يوم عمل (المادة 32)
            </div>
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
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.contractStartDate || employee.hireDate || '—'}
            </div>
          </div>

          <div className="py-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ نهاية العقد</label>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.contractEndDate || 'عقد مفتوح / غير محدد'}
            </div>
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
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.basicSalary) || 0).toFixed(3)} د.ك</div>
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدل السكن</span>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.housingAllowance) || 0).toFixed(3)} د.ك</div>
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدل الانتقال</span>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.transportAllowance) || 0).toFixed(3)} د.ك</div>
          </div>
          <div className="py-1">
            <span className="text-slate-500 block text-xs font-semibold mb-1">بدلات أخرى</span>
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">{(Number(employee.otherAllowances || employee.otherAllowance || employee.allowances || 0)).toFixed(3)} د.ك</div>
          </div>
        </div>
      </div>
    </div>
  );
};
