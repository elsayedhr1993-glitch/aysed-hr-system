import React from 'react';
import { Stethoscope, IdCard, Car } from 'lucide-react';

export type EmployeeComplianceFlags = {
  hasMedicalLicense?: boolean;
  hasBadges?: boolean;
  hasDrivingLicense?: boolean;
};

interface Props {
  flags: EmployeeComplianceFlags;
  isEditMode: boolean;
  onChange: (patch: Partial<EmployeeComplianceFlags>) => void;
  compact?: boolean;
}

function ToggleRow({
  id,
  label,
  description,
  icon,
  checked,
  disabled,
  onToggle,
}: {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start gap-2 min-w-0">
        <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0">{icon}</span>
        <div>
          <label htmlFor={id} className="font-bold text-xs text-slate-900 block cursor-pointer">{label}</label>
          <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{description}</p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${
          checked ? 'bg-[#714B67]' : 'bg-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition ${
            checked ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export const EmployeeComplianceToggles: React.FC<Props> = ({
  flags,
  isEditMode,
  onChange,
  compact,
}) => {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">امتثال</span>
        <span>تفعيل الحقول الإلزامية حسب دور الموظف (MOH / بطاقات / قيادة)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <ToggleRow
          id="toggle-moh"
          label="ترخيص وزارة الصحة (MOH)"
          description="للكادر الطبي: رقم الترخيص، الانتهاء، التخصص، والمرفق."
          icon={<Stethoscope size={16} />}
          checked={Boolean(flags.hasMedicalLicense)}
          disabled={!isEditMode}
          onToggle={() => onChange({ hasMedicalLicense: !flags.hasMedicalLicense })}
        />
        <ToggleRow
          id="toggle-badges"
          label="الهويات وبطاقات العمل"
          description="بيانات وتواريخ بطاقات الدخول والتعريف."
          icon={<IdCard size={16} />}
          checked={Boolean(flags.hasBadges)}
          disabled={!isEditMode}
          onToggle={() => onChange({ hasBadges: !flags.hasBadges })}
        />
        <ToggleRow
          id="toggle-driving"
          label="رخصة القيادة"
          description="رقم الرخصة، الفئة، وتاريخ الانتهاء."
          icon={<Car size={16} />}
          checked={Boolean(flags.hasDrivingLicense)}
          disabled={!isEditMode}
          onToggle={() => onChange({ hasDrivingLicense: !flags.hasDrivingLicense })}
        />
      </div>
    </div>
  );
};
