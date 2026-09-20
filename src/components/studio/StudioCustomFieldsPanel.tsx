import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomFieldType } from '../../types/customLayout';
import { useLayoutStudio } from '../../context/LayoutStudioContext';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'نص' },
  { value: 'number', label: 'رقم' },
  { value: 'date', label: 'تاريخ' },
  { value: 'boolean', label: 'نعم/لا' },
  { value: 'select', label: 'قائمة' },
  { value: 'textarea', label: 'نص طويل' },
];

export const StudioCustomFieldsPanel: React.FC = () => {
  const { studioSession, addCustomField, updateCustomField, removeCustomField } = useLayoutStudio();
  if (!studioSession) return null;

  const tabs = [...studioSession.draft.tabs].sort((a, b) => a.order - b.order);
  const fields = [...studioSession.draft.customFields].sort((a, b) => a.order - b.order);
  const defaultTabId = tabs[0]?.id;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-600 leading-relaxed">
        الحقول تُخزَّن في <code className="text-[10px] bg-slate-100 px-1 rounded">customData</code> على السجل.
        مفتاح التخزين يجب أن يكون فريداً.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {FIELD_TYPES.map(t => (
          <button
            key={t.value}
            type="button"
            disabled={!defaultTabId}
            onClick={() => addCustomField(defaultTabId, t.value)}
            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            + {t.label}
          </button>
        ))}
      </div>

      {!fields.length && (
        <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">
          لا توجد حقول مخصصة بعد
        </div>
      )}

      {fields.map(field => (
        <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-500">{field.storageKey}</span>
            <button
              type="button"
              onClick={() => removeCustomField(field.id)}
              className="p-1 rounded text-rose-600 hover:bg-rose-50"
              title="حذف الحقل"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <label className="block text-[10px] font-bold text-slate-600">التبويب</label>
          <select
            value={field.tabId}
            onChange={e => updateCustomField(field.id, { tabId: e.target.value })}
            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label.ar}</option>
            ))}
          </select>

          <label className="block text-[10px] font-bold text-slate-600">نوع الحقل</label>
          <select
            value={field.type}
            onChange={e => updateCustomField(field.id, { type: e.target.value as CustomFieldType })}
            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg"
          >
            {FIELD_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <label className="block text-[10px] font-bold text-slate-600">مفتاح التخزين</label>
          <input
            type="text"
            dir="ltr"
            value={field.storageKey}
            onChange={e => updateCustomField(field.id, { storageKey: e.target.value })}
            className="w-full text-xs font-mono px-2 py-1.5 border border-slate-300 rounded-lg"
          />

          <label className="block text-[10px] font-bold text-slate-600">التسمية (عربي)</label>
          <input
            type="text"
            value={field.label.ar}
            onChange={e => updateCustomField(field.id, { label: { ...field.label, ar: e.target.value } })}
            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg"
          />

          <label className="block text-[10px] font-bold text-slate-600">Label (English)</label>
          <input
            type="text"
            dir="ltr"
            value={field.label.en || ''}
            onChange={e => updateCustomField(field.id, { label: { ...field.label, en: e.target.value } })}
            className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg"
          />

          {field.type === 'select' && (
            <>
              <label className="block text-[10px] font-bold text-slate-600">خيارات (قيمة|عربي لكل سطر)</label>
              <textarea
                rows={3}
                className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg font-mono"
                value={(field.options || []).map(o => `${o.value}|${o.label.ar}`).join('\n')}
                onChange={e => {
                  const options = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(Boolean)
                    .map(line => {
                      const [value, ar] = line.split('|');
                      const v = (value || '').trim();
                      return {
                        value: v,
                        label: { ar: (ar || v).trim(), en: (ar || v).trim() },
                      };
                    });
                  updateCustomField(field.id, { options });
                }}
              />
            </>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={field.required}
                onChange={e => updateCustomField(field.id, { required: e.target.checked })}
              />
              إلزامي
            </label>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={field.hidden}
                onChange={e => updateCustomField(field.id, { hidden: e.target.checked })}
              />
              مخفي
            </label>
          </div>
        </div>
      ))}

      {defaultTabId && (
        <button
          type="button"
          onClick={() => addCustomField(defaultTabId, 'text')}
          className="w-full py-2 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-600 flex items-center justify-center gap-1 hover:bg-slate-50"
        >
          <Plus size={14} />
          حقل نصي جديد
        </button>
      )}
    </div>
  );
};
