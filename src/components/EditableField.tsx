import React from 'react';

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  isEditMode: boolean;
  type?: 'text' | 'number' | 'date' | 'email';
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditMode,
  type = 'text',
  placeholder,
  maxLength,
  className = ''
}) => {
  const hasValue = value !== undefined && value !== null && value !== '' && value !== 'غير محدد';

  return (
    <div className={`py-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">{label}</label>
      {isEditMode ? (
        <input
          type={type}
          maxLength={maxLength}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition"
          placeholder={placeholder}
        />
      ) : (
        <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1 min-h-[26px] flex items-center">
          {hasValue ? (
            <span>{value}</span>
          ) : (
            <span className="text-slate-400 font-normal text-xs">—</span>
          )}
        </div>
      )}
    </div>
  );
};

export const EditableSelect: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  isEditMode: boolean;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ label, value, onChange, isEditMode, options, className = '' }) => {
  const matchedOpt = options.find(o => o.value === value);
  const displayLabel = matchedOpt?.label || value;
  const hasValue = value !== undefined && value !== null && value !== '' && value !== 'غير محدد';

  return (
    <div className={`py-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">{label}</label>
      {isEditMode ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition cursor-pointer"
        >
          <option value="">-- اختر --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1 min-h-[26px] flex items-center">
          {hasValue ? (
            <span>{displayLabel}</span>
          ) : (
            <span className="text-slate-400 font-normal text-xs">—</span>
          )}
        </div>
      )}
    </div>
  );
};
