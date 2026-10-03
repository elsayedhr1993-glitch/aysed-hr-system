import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, EyeOff, MoreHorizontal, Pencil } from 'lucide-react';
import { useLang } from '../../lib/i18n';
import { useUiStudio } from '../../context/UiStudioContext';
import type { UiElementDefaults, UiElementKind } from '../../types/uiOverrides';
import { pickUiHelp, pickUiLabel } from '../../utils/uiOverrideUtils';

export interface UiStudioTargetProps {
  uiKey: string;
  kind?: UiElementKind;
  defaults: UiElementDefaults;
  /** Keys in display order — required for reorder actions */
  reorderGroupKeys?: string[];
  className?: string;
  children?: React.ReactNode;
  /** When true, hides entire wrapper when element is hidden (not only in studio) */
  respectHidden?: boolean;
}

export const UiStudioTarget: React.FC<UiStudioTargetProps> = ({
  uiKey,
  kind,
  defaults,
  reorderGroupKeys,
  className = '',
  children,
  respectHidden = true,
}) => {
  const { lang } = useLang();
  const {
    canUseUiStudio,
    uiStudioActive,
    resolveElement,
    saveElementPatch,
    hideElement,
    reorderKeys,
  } = useUiStudio();

  const resolved = useMemo(
    () => resolveElement(uiKey, { ...defaults, kind: kind ?? defaults.kind }),
    [resolveElement, uiKey, defaults, kind]
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [labelAr, setLabelAr] = useState(resolved.label.ar);
  const [labelEn, setLabelEn] = useState(resolved.label.en || '');
  const [helpAr, setHelpAr] = useState(resolved.help?.ar || '');
  const [helpEn, setHelpEn] = useState(resolved.help?.en || '');

  if (respectHidden && resolved.hidden && !uiStudioActive) {
    return null;
  }

  const showChrome = canUseUiStudio && uiStudioActive;

  const move = async (direction: 'up' | 'down') => {
    if (!reorderGroupKeys?.length) return;
    const idx = reorderGroupKeys.indexOf(uiKey);
    if (idx < 0) return;
    const next = [...reorderGroupKeys];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    await reorderKeys(next);
    setMenuOpen(false);
  };

  const submitEdit = async () => {
    await saveElementPatch(uiKey, {
      kind: kind ?? defaults.kind,
      label: { ar: labelAr.trim() || defaults.label.ar, en: labelEn.trim() || undefined },
      help:
        helpAr.trim() || helpEn.trim()
          ? { ar: helpAr.trim() || helpEn.trim(), en: helpEn.trim() || undefined }
          : undefined,
      hidden: false,
    });
    setEditOpen(false);
    setMenuOpen(false);
  };

  const labelText = pickUiLabel(resolved, lang === 'en' ? 'en' : 'ar');
  const helpText = pickUiHelp(resolved, lang === 'en' ? 'en' : 'ar');

  return (
    <span
      className={`relative inline-flex items-start gap-1 max-w-full group/studio ${
        showChrome ? 'ring-1 ring-amber-300/80 ring-offset-1 rounded-md px-0.5' : ''
      } ${resolved.hidden && uiStudioActive ? 'opacity-40 line-through' : ''} ${className}`}
      data-ui-key={uiKey}
    >
      <span className="min-w-0 flex-1">
        {children ?? (
          <>
            <span>{labelText}</span>
            {helpText ? (
              <span className="block text-[10px] text-slate-500 font-normal mt-0.5">{helpText}</span>
            ) : null}
          </>
        )}
      </span>

      {showChrome && (
        <div className="relative shrink-0 print:hidden">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              setMenuOpen(o => !o);
            }}
            className="p-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer"
            title="Studio"
            aria-label="خيارات التخصيص"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              className="absolute z-[80] top-full mt-1 min-w-[9.5rem] bg-white border border-slate-200 rounded-lg shadow-xl text-[11px] font-bold text-slate-800 py-1"
              style={{ insetInlineEnd: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                className="w-full px-3 py-1.5 text-right hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setLabelAr(resolved.label.ar);
                  setLabelEn(resolved.label.en || '');
                  setHelpAr(resolved.help?.ar || '');
                  setHelpEn(resolved.help?.en || '');
                  setEditOpen(true);
                  setMenuOpen(false);
                }}
              >
                <Pencil size={12} /> تعديل
              </button>
              {reorderGroupKeys && reorderGroupKeys.length > 1 && (
                <>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-right hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    onClick={() => void move('up')}
                  >
                    <ArrowUp size={12} /> تقديم
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-right hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    onClick={() => void move('down')}
                  >
                    <ArrowDown size={12} /> تأخير
                  </button>
                </>
              )}
              {!resolved.locked && (
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-right hover:bg-rose-50 text-rose-800 flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    void hideElement(uiKey);
                    setMenuOpen(false);
                  }}
                >
                  <EyeOff size={12} /> إخفاء
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {editOpen && (
        <div
          className="fixed inset-0 z-[90] bg-slate-900/40 flex items-center justify-center p-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-md p-4 text-right"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-black text-slate-900 mb-3">تعديل عنصر Studio</h3>
            <p className="text-[10px] font-mono text-slate-500 mb-3 break-all">{uiKey}</p>
            <div className="space-y-2 text-xs">
              <label className="block">
                <span className="font-bold text-slate-600">المسمى (عربي)</span>
                <input
                  value={labelAr}
                  onChange={e => setLabelAr(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-600">Label (English)</span>
                <input
                  value={labelEn}
                  onChange={e => setLabelEn(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2"
                  dir="ltr"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-600">نص توضيحي (عربي)</span>
                <textarea
                  value={helpAr}
                  onChange={e => setHelpAr(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 min-h-[60px]"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-600">Help (English)</span>
                <textarea
                  value={helpEn}
                  onChange={e => setHelpEn(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 min-h-[60px]"
                  dir="ltr"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void submitEdit()}
                className="px-3 py-1.5 rounded-lg bg-[#714B67] text-white font-bold cursor-pointer"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

/** Hook for labels / columns without wrapping interactive children */
export function useUiStudioLabel(uiKey: string, defaults: UiElementDefaults) {
  const { lang } = useLang();
  const { resolveElement, uiStudioActive } = useUiStudio();
  const resolved = useMemo(() => resolveElement(uiKey, defaults), [resolveElement, uiKey, defaults]);
  const locale = lang === 'en' ? 'en' : 'ar';
  return {
    resolved,
    hidden: resolved.hidden && !uiStudioActive,
    label: pickUiLabel(resolved, locale),
    help: pickUiHelp(resolved, locale),
  };
}
