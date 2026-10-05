import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, EyeOff, PanelRightClose, Save, Sparkles } from 'lucide-react';
import { useUiStudio } from '../../context/UiStudioContext';
import type { ResolvedUiElement } from '../../types/uiOverrides';

const kindLabel: Record<string, string> = {
  app: 'تطبيق',
  tab: 'تبويب',
  field: 'حقل',
  label: 'تسمية',
  help: 'نص توضيحي',
  column: 'عمود',
  section: 'قسم',
};

type FormSnapshot = {
  labelAr: string;
  labelEn: string;
  helpAr: string;
  helpEn: string;
  visible: boolean;
};

function snapshotFromResolved(resolved: ResolvedUiElement): FormSnapshot {
  return {
    labelAr: resolved.label.ar,
    labelEn: resolved.label.en || '',
    helpAr: resolved.help?.ar || '',
    helpEn: resolved.help?.en || '',
    visible: !resolved.hidden,
  };
}

function draftsEqual(a: FormSnapshot, b: FormSnapshot): boolean {
  return (
    a.labelAr === b.labelAr &&
    a.labelEn === b.labelEn &&
    a.helpAr === b.helpAr &&
    a.helpEn === b.helpEn &&
    a.visible === b.visible
  );
}

export const UiStudioInspectorSidebar: React.FC = () => {
  const {
    canUseUiStudio,
    uiStudioActive,
    selection,
    clearSelection,
    resolveElement,
    saveElementPatch,
    exportOverridesJson,
    overridesDoc,
    studioCompanyId,
  } = useUiStudio();

  const [labelAr, setLabelAr] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [helpAr, setHelpAr] = useState('');
  const [helpEn, setHelpEn] = useState('');
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectionKey = selection?.uiKey ?? '';
  const overridesVersion = overridesDoc?.version ?? 0;

  const persistedSnapshot = useMemo((): FormSnapshot | null => {
    if (!selection) return null;
    const resolved = resolveElement(selection.uiKey, {
      ...selection.defaults,
      kind: selection.kind ?? selection.defaults.kind,
    });
    return snapshotFromResolved(resolved);
  }, [selection, selectionKey, overridesVersion, resolveElement]);

  useEffect(() => {
    if (!persistedSnapshot) return;
    setLabelAr(persistedSnapshot.labelAr);
    setLabelEn(persistedSnapshot.labelEn);
    setHelpAr(persistedSnapshot.helpAr);
    setHelpEn(persistedSnapshot.helpEn);
    setVisible(persistedSnapshot.visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync form only on element / version change
  }, [selectionKey, overridesVersion]);

  const draft = useMemo(
    () => ({ labelAr, labelEn, helpAr, helpEn, visible }),
    [labelAr, labelEn, helpAr, helpEn, visible]
  );

  const isDirty = persistedSnapshot ? !draftsEqual(draft, persistedSnapshot) : false;

  const resolved = selection
    ? resolveElement(selection.uiKey, {
        ...selection.defaults,
        kind: selection.kind ?? selection.defaults.kind,
      })
    : null;

  const canPersist = Boolean(canUseUiStudio && studioCompanyId);

  if (!canUseUiStudio || !uiStudioActive) return null;

  const handleSave = async () => {
    if (!selection || saving || !isDirty) return;

    setSaving(true);
    try {
      const ok = await saveElementPatch(
        selection.uiKey,
        {
          kind: selection.kind ?? selection.defaults.kind,
          label: {
            ar: labelAr.trim() || selection.defaults.label.ar,
            en: labelEn.trim() || undefined,
          },
          help:
            helpAr.trim() || helpEn.trim()
              ? { ar: helpAr.trim() || helpEn.trim(), en: helpEn.trim() || undefined }
              : undefined,
          hidden: !visible,
        },
        { quiet: false }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="fixed top-12 bottom-0 z-[190] w-[min(100%,20rem)] bg-white border-s border-slate-200 shadow-xl flex flex-col print:hidden"
      style={{ insetInlineStart: 0 }}
      dir="rtl"
      aria-label="Odoo Studio Inspector"
    >
      <header className="shrink-0 px-3 py-2.5 border-b border-slate-200 bg-[#714B67] text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={16} className="shrink-0 text-amber-200" />
          <div className="min-w-0">
            <div className="text-xs font-black leading-tight">Studio — لوحة الخصائص</div>
            <div className="text-[10px] text-white/75 font-medium">انقر على عنصر في الشاشة لتحريره</div>
          </div>
        </div>
        <button
          type="button"
          onClick={exportOverridesJson}
          className="p-1.5 rounded-md hover:bg-white/15 cursor-pointer"
          title="تصدير JSON"
        >
          <Download size={14} />
        </button>
      </header>

      {!selection ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <PanelRightClose size={32} className="text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">لم يُحدد عنصر بعد</p>
          <p className="text-[11px] mt-2 leading-relaxed">
            فعّل وضع Studio ثم انقر على تبويب، حقل، عمود، أو عنوان لتعديل المسمى والترجمة والإظهار.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold text-slate-500">المعرّف</div>
            <div className="font-mono text-[10px] text-slate-800 break-all mt-0.5">{selection.uiKey}</div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              الشركة: <span className="font-mono font-bold text-slate-800">{studioCompanyId || '—'}</span>
            </div>
            <div className="mt-1.5 inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#714B67]/10 text-[#714B67]">
              {kindLabel[selection.kind || selection.defaults.kind || 'label'] || 'عنصر'}
            </div>
          </div>

          {!canPersist && (
            <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-relaxed">
              لحفظ التخصيصات، اختر شركة من القائمة أو من لوحة السوبر أدمن (معاينة/انتحال) حتى يظهر معرّف الشركة أعلاه.
            </p>
          )}

          <label className="block">
            <span className="font-bold text-slate-700">المسمى (عربي)</span>
            <input
              value={labelAr}
              onChange={e => setLabelAr(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="font-bold text-slate-700">Label (English)</span>
            <input
              value={labelEn}
              onChange={e => setLabelEn(e.target.value)}
              dir="ltr"
              className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="font-bold text-slate-700">شرح / تلميح (عربي)</span>
            <textarea
              value={helpAr}
              onChange={e => setHelpAr(e.target.value)}
              className="w-full mt-1 border border-slate-200 rounded-lg p-2 min-h-[72px] text-sm"
            />
          </label>
          <label className="block">
            <span className="font-bold text-slate-700">Help (English)</span>
            <textarea
              value={helpEn}
              onChange={e => setHelpEn(e.target.value)}
              dir="ltr"
              className="w-full mt-1 border border-slate-200 rounded-lg p-2 min-h-[72px] text-sm"
            />
          </label>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              {visible ? <Eye size={14} /> : <EyeOff size={14} />}
              إظهار في الواجهة
            </span>
            <input
              type="checkbox"
              checked={visible}
              disabled={resolved?.locked}
              onChange={e => setVisible(e.target.checked)}
              className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
            />
          </div>

          {selection.reorderGroupId && (
            <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
              اسحب العنصر نفسه وأفلته فوق عنصر آخر في نفس المجموعة لإعادة الترتيب.
            </p>
          )}
        </div>
      )}

      <footer className="shrink-0 p-3 border-t border-slate-200 flex gap-2">
        <button
          type="button"
          onClick={clearSelection}
          className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold cursor-pointer hover:bg-slate-50"
        >
          إلغاء التحديد
        </button>
        <button
          type="button"
          disabled={!selection || !isDirty || saving}
          onClick={() => void handleSave()}
          className="flex-1 py-2 rounded-lg bg-[#714B67] text-white font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Save size={14} />
          {saving ? 'جاري الحفظ…' : 'حفظ'}
        </button>
      </footer>
    </aside>
  );
};
