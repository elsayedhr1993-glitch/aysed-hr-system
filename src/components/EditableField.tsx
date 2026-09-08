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
  return (
    <div className={`bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 ${className}`}>
      <label className="block text-slate-500 font-bold mb-1">{label}</label>
      {isEditMode ? (
        <input
          type={type}
          maxLength={maxLength}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder={placeholder}
        />
      ) : (
        <div className="font-bold text-slate-900 text-sm">{value || 'غير محدد'}</div>
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
  return (
    <div className={`bg-slate-50/50 p-3 rounded-xl border border-slate-200/80 ${className}`}>
      <label className="block text-slate-500 font-bold mb-1">{label}</label>
      {isEditMode ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="">-- اختر --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div className="font-bold text-slate-900 text-sm">
          {options.find(o => o.value === value)?.label || value || 'غير محدد'}
        </div>
      )}
    </div>
  );
};
