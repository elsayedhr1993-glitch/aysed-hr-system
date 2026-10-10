import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, Lock, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../lib/i18n';
import { UI_KEYS } from '../utils/uiStudioKeys';
import { UiStudioTarget, useUiStudioLabel } from './studio/UiStudioTarget';
import { useFieldPersist } from '../context/InlineEditContext';
import { EMPLOYEE_FIELD_MIRRORS } from '../utils/employeeFieldMirrors';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface EditableFieldProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  /** Legacy bulk form edit — when true, input is always visible. */
  isEditMode?: boolean;
  type?: 'text' | 'number' | 'date' | 'email';
  placeholder?: string;
  maxLength?: number;
  className?: string;
  studioFieldKey?: string;
  studioUiKey?: string;
  helpText?: string;
  /** Click-to-edit + Firestore persist on commit. */
  onPersist?: (value: string) => Promise<void>;
  /** Auto-wire `onPersist` from InlineEditProvider (defaults to studioFieldKey). */
  persistFieldKey?: string;
  persistMirrorKeys?: string[];
  hideLabel?: boolean;
  /** Calculated / protected — no inline edit. */
  readOnly?: boolean;
  lockedHint?: string;
  /** Save on Enter / blur without mini buttons (default true when onPersist set). */
  autoSaveOnBlur?: boolean;
  inlineEdit?: boolean;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
  isEditMode = false,
  type = 'text',
  placeholder,
  maxLength,
  className = '',
  studioFieldKey,
  studioUiKey,
  helpText,
  onPersist,
  persistFieldKey,
  persistMirrorKeys,
  hideLabel = false,
  readOnly = false,
  lockedHint = 'حقل محسوب أو محمي — لا يمكن تعديله مباشرة.',
  autoSaveOnBlur,
  inlineEdit,
}) => {
  const { lang } = useLang();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [hover, setHover] = useState(false);

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

  const displayLabel = studioEnabled ? resolvedLabel : label;
  const displayValue = value !== undefined && value !== null ? String(value) : '';
  const hasValue = displayValue !== '' && displayValue !== 'غير محدد';

  const resolvedPersistKey = persistFieldKey ?? studioFieldKey;
  const resolvedMirrors =
    persistMirrorKeys ??
    (resolvedPersistKey ? EMPLOYEE_FIELD_MIRRORS[resolvedPersistKey] : undefined);
  const contextPersist = useFieldPersist(resolvedPersistKey, resolvedMirrors);
  const effectivePersist = onPersist ?? contextPersist;

  const useInline = !readOnly && (inlineEdit ?? Boolean(effectivePersist)) && !isEditMode;
  const saveOnBlur = autoSaveOnBlur ?? Boolean(effectivePersist);

  useEffect(() => {
    if (!editing) setDraft(displayValue);
  }, [displayValue, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const cancelEdit = useCallback(() => {
    setDraft(displayValue);
    setEditing(false);
  }, [displayValue]);

  const commit = useCallback(async () => {
    const next = draft.trim();
    if (next === displayValue) {
      setEditing(false);
      return;
    }
    onChange(next);
    if (effectivePersist) {
      setSaveState('saving');
      try {
        await effectivePersist(next);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1200);
      } catch (err) {
        console.error(err);
        setSaveState('error');
        onChange(displayValue);
        setDraft(displayValue);
        toast.error('تعذر حفظ الحقل في السحابة');
      }
    }
    setEditing(false);
  }, [draft, displayValue, onChange, effectivePersist]);

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
      if (e.key === 'Enter' && type !== 'text') {
        e.preventDefault();
        void commit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, cancelEdit, commit, type]);

  const flashClass =
    saveState === 'saved'
      ? 'ring-2 ring-emerald-300/80 bg-emerald-50/50'
      : saveState === 'error'
        ? 'ring-2 ring-rose-200 bg-rose-50/40'
        : '';

  const startEdit = () => {
    if (readOnly) {
      toast(lockedHint, { icon: '🔒' });
      return;
    }
    if (!useInline) return;
    setEditing(true);
  };

  if (studioEnabled && hidden) return null;

  const renderInput = (commitOnBlur: boolean) => (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        id={inputId}
        type={type}
        maxLength={maxLength}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (commitOnBlur) void commit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void commit();
          }
        }}
        className="flex-1 border border-[#714B67]/40 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition"
        placeholder={placeholder}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        disabled={saveState === 'saving'}
      />
      {effectivePersist && !commitOnBlur && (
        <>
          <button
            type="button"
            onClick={() => void commit()}
            disabled={saveState === 'saving'}
            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
            title="حفظ سريع"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
            title="إلغاء"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div
      className={`py-1.5 rounded-lg transition-colors duration-300 ${flashClass} ${className}`}
    >
      {!hideLabel && (
        <label
          htmlFor={useInline && editing ? inputId : undefined}
          className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide"
        >
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
          {saveState === 'saving' && (
            <span className="mr-2 text-[10px] text-slate-400 font-normal">جاري الحفظ…</span>
          )}
          {saveState === 'saved' && (
            <span className="mr-2 text-[10px] text-emerald-700 font-bold">تم الحفظ</span>
          )}
        </label>
      )}

      {isEditMode ? (
        <input
          type={type}
          maxLength={maxLength}
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition"
          placeholder={placeholder}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
      ) : editing ? (
        renderInput(saveOnBlur)
      ) : (
        <button
          type="button"
          onClick={startEdit}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`w-full text-right font-bold text-slate-900 text-sm min-h-[30px] flex items-center justify-between gap-2 px-2 py-1 rounded-lg border transition ${
            readOnly
              ? 'border-transparent cursor-not-allowed opacity-90'
              : useInline
                ? hover
                  ? 'border-dashed border-[#714B67]/45 bg-[#714B67]/5 cursor-text'
                  : 'border-transparent border-b border-slate-200/70 cursor-text'
                : 'border-transparent border-b border-slate-200/70 cursor-default'
          }`}
        >
          <span className="flex-1 truncate">
            {hasValue ? <span>{displayValue}</span> : <span className="text-slate-400 font-normal text-xs">—</span>}
          </span>
          {readOnly ? (
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : useInline ? (
            <Pencil
              className={`w-3.5 h-3.5 shrink-0 transition ${hover ? 'text-[#714B67]' : 'text-slate-300'}`}
            />
          ) : null}
        </button>
      )}
    </div>
  );
};

export const EditableSelect: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  isEditMode?: boolean;
  options: { value: string; label: string }[];
  className?: string;
  studioFieldKey?: string;
  studioUiKey?: string;
  onPersist?: (value: string) => Promise<void>;
  persistFieldKey?: string;
  persistMirrorKeys?: string[];
  readOnly?: boolean;
  lockedHint?: string;
  inlineEdit?: boolean;
}> = ({
  label,
  value,
  onChange,
  isEditMode = false,
  options,
  className = '',
  studioFieldKey,
  studioUiKey,
  onPersist,
  persistFieldKey,
  persistMirrorKeys,
  readOnly = false,
  lockedHint,
  inlineEdit,
}) => {
  const studioKey =
    studioUiKey || (studioFieldKey ? UI_KEYS.employeeField(studioFieldKey) : '');
  const studioEnabled = Boolean(studioKey);

  const { label: resolvedLabel, hidden } = useUiStudioLabel(
    studioEnabled ? studioKey : '__studio_field_disabled__',
    { kind: 'field', label: { ar: label, en: label } }
  );

  const displayLabel = studioEnabled ? resolvedLabel : label;
  const matchedOpt = options.find((o) => o.value === value);
  const displayValue = matchedOpt?.label || value;
  const hasValue = value !== undefined && value !== null && value !== '' && value !== 'غير محدد';

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [hover, setHover] = useState(false);

  const resolvedPersistKey = persistFieldKey ?? studioFieldKey;
  const resolvedMirrors =
    persistMirrorKeys ??
    (resolvedPersistKey ? EMPLOYEE_FIELD_MIRRORS[resolvedPersistKey] : undefined);
  const contextPersist = useFieldPersist(resolvedPersistKey, resolvedMirrors);
  const effectivePersist = onPersist ?? contextPersist;

  const useInline = !readOnly && (inlineEdit ?? Boolean(effectivePersist)) && !isEditMode;

  const commit = async (next: string) => {
    if (next === value) {
      setEditing(false);
      return;
    }
    onChange(next);
    if (effectivePersist) {
      setSaveState('saving');
      try {
        await effectivePersist(next);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1200);
      } catch {
        onChange(value);
        setDraft(value);
        toast.error('تعذر حفظ الحقل');
      }
    }
    setEditing(false);
  };

  if (studioEnabled && hidden) return null;

  const flashClass = saveState === 'saved' ? 'ring-2 ring-emerald-300/80 bg-emerald-50/50' : '';

  return (
    <div className={`py-1.5 rounded-lg transition-colors duration-300 ${flashClass} ${className}`}>
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
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#714B67] focus:outline-none text-sm transition cursor-pointer"
        >
          <option value="">-- اختر --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : editing ? (
        <select
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            void commit(e.target.value);
          }}
          onBlur={() => setEditing(false)}
          autoFocus
          className="w-full border border-[#714B67]/40 rounded-lg px-2.5 py-1.5 font-bold text-sm"
        >
          <option value="">-- اختر --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (readOnly) {
              toast(lockedHint || 'حقل محمي', { icon: '🔒' });
              return;
            }
            if (useInline) {
              setDraft(value || '');
              setEditing(true);
            }
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={`w-full text-right font-bold text-slate-900 text-sm min-h-[30px] flex items-center justify-between gap-2 px-2 py-1 rounded-lg border transition ${
            useInline && hover ? 'border-dashed border-[#714B67]/45 bg-[#714B67]/5' : 'border-b border-slate-200/70'
          }`}
        >
          <span>{hasValue ? displayValue : <span className="text-slate-400 font-normal text-xs">—</span>}</span>
          {readOnly ? (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Pencil className={`w-3.5 h-3.5 ${hover ? 'text-[#714B67]' : 'text-slate-300'}`} />
          )}
        </button>
      )}
    </div>
  );
};
