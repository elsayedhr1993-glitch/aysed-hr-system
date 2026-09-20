import React from 'react';
import type { CustomDataBag, CustomFieldLayout, LayoutLocale } from '../../types/customLayout';
import { resolveLabel } from '../../utils/customLayoutUtils';

export interface DynamicFieldRendererProps {
  field: CustomFieldLayout;
  locale: LayoutLocale;
  value: unknown;
  onChange: (value: string | number | boolean | null) => void;
  error?: string;
  disabled?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  locale,
  value,
  onChange,
  error,
  disabled,
}) => {
  const label = resolveLabel(field.label, locale);
  const help = field.helpText ? resolveLabel(field.helpText, locale) : undefined;
  const inputClass =
    'w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none disabled:bg-slate-50';

  return (
    <label className={`block ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
      <span className="text-slate-500 font-semibold mb-1 block">
        {label}
        {field.required && <span className="text-red-500"> *</span>}
      </span>
      {field.type === 'textarea' && (
        <textarea
          rows={3}
          disabled={disabled || field.readOnly}
          value={value == null ? '' : String(value)}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      )}
      {field.type === 'text' && (
        <input
          type="text"
          disabled={disabled || field.readOnly}
          value={value == null ? '' : String(value)}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      )}
      {field.type === 'number' && (
        <input
          type="number"
          disabled={disabled || field.readOnly}
          value={value == null || value === '' ? '' : Number(value)}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={inputClass}
          dir="ltr"
        />
      )}
      {field.type === 'date' && (
        <input
          type="date"
          disabled={disabled || field.readOnly}
          value={value == null ? '' : String(value)}
          onChange={e => onChange(e.target.value || null)}
          className={inputClass}
          dir="ltr"
        />
      )}
      {field.type === 'boolean' && (
        <input
          type="checkbox"
          disabled={disabled || field.readOnly}
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 text-[#714B67] rounded border-slate-300"
        />
      )}
      {field.type === 'select' && (
        <select
          disabled={disabled || field.readOnly}
          value={value == null ? '' : String(value)}
          onChange={e => onChange(e.target.value || null)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">— اختر —</option>
          {(field.options || []).map(opt => (
            <option key={opt.value} value={opt.value}>
              {resolveLabel(opt.label, locale)}
            </option>
          ))}
        </select>
      )}
      {help && <span className="text-[10px] text-slate-400 mt-0.5 block">{help}</span>}
      {error && <span className="text-[10px] text-red-600 mt-0.5 block">{error}</span>}
    </label>
  );
};

export interface CustomFieldsFormBlockProps {
  fields: CustomFieldLayout[];
  locale: LayoutLocale;
  values: CustomDataBag;
  onChange: (next: CustomDataBag) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const CustomFieldsFormBlock: React.FC<CustomFieldsFormBlockProps> = ({
  fields,
  locale,
  values,
  onChange,
  errors = {},
  disabled,
}) => {
  const visible = [...fields].filter(f => !f.hidden).sort((a, b) => a.order - b.order);
  if (!visible.length) return null;

  return (
    <div className="border-t border-dashed border-slate-200 pt-3 mt-1 space-y-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">حقول مخصصة (Studio)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map(field => (
          <DynamicFieldRenderer
            key={field.id}
            field={field}
            locale={locale}
            value={values[field.storageKey]}
            error={errors[field.storageKey]}
            disabled={disabled}
            onChange={v =>
              onChange({
                ...values,
                [field.storageKey]: v,
              })
            }
          />
        ))}
      </div>
    </div>
  );
};
