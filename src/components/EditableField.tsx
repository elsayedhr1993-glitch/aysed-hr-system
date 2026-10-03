import React from 'react';
import { useLang } from '../lib/i18n';
import { UI_KEYS } from '../utils/uiStudioKeys';
import { UiStudioTarget, useUiStudioLabel } from './studio/UiStudioTarget';

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  isEditMode: boolean;
  type?: 'text' | 'number' | 'date' | 'email';
  placeholder?: string;
  maxLength?: number;
  className?: string;
  /** Maps to screen.employees.field.{key} in Studio */
  studioFieldKey?: string;
  studioUiKey?: string;
  helpText?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditMode,
  type = 'text',
  placeholder,
  maxLength,
  className = '',
  studioFieldKey,
  studioUiKey,
  helpText,
}) => {
  const { lang } = useLang();
  const studioKey =
    studioUiKey || (studioFieldKey ? UI_KEYS.employeeField(studioFieldKey) : '');
  const studioEnabled = Boolean(studioKey);

  const { label: resolvedLabel, hidden } = useUiStudioLabel(
    studioEnabled ? studioKey : '__studio_field_disabled__',
    {
      kind: 'field',
      label: { ar: label, en: label },
      help: helpText ? { ar: helpText, en: helpText } : undefined,
    }
  );

  if (studioEnabled && hidden) return null;

  const displayLabel = studioEnabled ? resolvedLabel : label;

  const hasValue = value !== undefined && value !== null && value !== '' && value !== 'غير محدد';

  return (
    <div className={`py-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">
        {studioEnabled ? (
          <UiStudioTarget
            uiKey={studioKey}
            kind="field"
            defaults={{ label: { ar: label, en: label }, help: helpText ? { ar: helpText } : undefined }}
          >
            {displayLabel}
          </UiStudioTarget>
        ) : (
          displayLabel
        )}
      </label>
      {isEditMode ? (
        <input
          type={type}
          maxLength={maxLength}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition"
          placeholder={placeholder}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
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
  studioFieldKey?: string;
  studioUiKey?: string;
}> = ({ label, value, onChange, isEditMode, options, className = '', studioFieldKey, studioUiKey }) => {
  const studioKey =
    studioUiKey || (studioFieldKey ? UI_KEYS.employeeField(studioFieldKey) : '');
  const studioEnabled = Boolean(studioKey);

  const { label: resolvedLabel, hidden } = useUiStudioLabel(
    studioEnabled ? studioKey : '__studio_field_disabled__',
    { kind: 'field', label: { ar: label, en: label } }
  );

  if (studioEnabled && hidden) return null;

  const displayLabel = studioEnabled ? resolvedLabel : label;
  const matchedOpt = options.find(o => o.value === value);
  const displayValue = matchedOpt?.label || value;
  const hasValue = value !== undefined && value !== null && value !== '' && value !== 'غير محدد';

  return (
    <div className={`py-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">
        {studioEnabled ? (
          <UiStudioTarget uiKey={studioKey} kind="field" defaults={{ label: { ar: label, en: label } }}>
            {displayLabel}
          </UiStudioTarget>
        ) : (
          displayLabel
        )}
      </label>
      {isEditMode ? (
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition cursor-pointer"
        >
          <option value="">-- اختر --</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1 min-h-[26px] flex items-center">
          {hasValue ? (
            <span>{displayValue}</span>
          ) : (
            <span className="text-slate-400 font-normal text-xs">—</span>
          )}
        </div>
      )}
    </div>
  );
};
