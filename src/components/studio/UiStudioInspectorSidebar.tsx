import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Eye, EyeOff, PanelRightClose, Save, Sparkles } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
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

function snapshotFromResolved(resolved: ResolvedUiElement) {
  return {
    labelAr: resolved.label.ar,
    labelEn: resolved.label.en || '',
    helpAr: resolved.help?.ar || '',
    helpEn: resolved.help?.en || '',
    visible: !resolved.hidden,
  };
}

function draftsEqual(
  a: ReturnType<typeof snapshotFromResolved>,
  b: ReturnType<typeof snapshotFromResolved>
): boolean {
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
  } = useUiStudio();
  const { activeCompanyId, activeCompany } = useCompany();
  const tenantCompanyId =
    activeCompanyId && activeCompanyId !== 'SAAS_PLATFORM'
      ? activeCompanyId
      : activeCompany?.id || '';

  const resolved = selection
    ? resolveElement(selection.uiKey, {
        ...selection.defaults,
        kind: selection.kind ?? selection.defaults.kind,
      })
    : null;

  const [labelAr, setLabelAr] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [helpAr, setHelpAr] = useState('');
  const [helpEn, setHelpEn] = useState('');
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  /** Baseline at selection / after successful save — not updated on every overrides tick while editing */
  const baselineRef = useRef<ReturnType<typeof snapshotFromResolved> | null>(null);
  const lastSyncKeyRef = useRef<string | null>(null);

  const overridesVersion = overridesDoc?.version ?? 0;

  useEffect(() => {
    if (!selection || !resolved) {
      baselineRef.current = null;
      lastSyncKeyRef.current = null;
      return;
    }

    const syncKey = `${selection.uiKey}@${overridesVersion}`;
    if (lastSyncKeyRef.current === syncKey) return;

    lastSyncKeyRef.current = syncKey;
    const snap = snapshotFromResolved(resolved);
    baselineRef.current = snap;
    setLabelAr(snap.labelAr);
    setLabelEn(snap.labelEn);
    setHelpAr(snap.helpAr);
    setHelpEn(snap.helpEn);
    setVisible(snap.visible);
  }, [selection, resolved, overridesVersion]);

  const draft = useMemo(
    () => ({ labelAr, labelEn, helpAr, helpEn, visible }),
    [labelAr, labelEn, helpAr, helpEn, visible]
  );

  const isDirty = useMemo(() => {
    if (!baselineRef.current) return false;
    return !draftsEqual(draft, baselineRef.current);
  }, [draft, overridesVersion, selection?.uiKey]);

  const canPersist = Boolean(
    canUseUiStudio && selection && tenantCompanyId && tenantCompanyId !== 'SAAS_PLATFORM'
  );

  if (!canUseUiStudio || !uiStudioActive) return null;

  const handleSave = async () => {
    if (!selection || !isDirty || saving) return;
    setSaving(true);
    try {
      await saveElementPatch(
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
          <p className="text-[10px] mt-3 text-slate-400">
            لإعادة الترتيب: اسحب العنصر المحدد داخل مجموعته (تبويبات، أعمدة، تطبيقات).
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold text-slate-500">المعرّف</div>
            <div className="font-mono text-[10px] text-slate-800 break-all mt-0.5">{selection.uiKey}</div>
            <div className="mt-1.5 inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#714B67]/10 text-[#714B67]">
              {kindLabel[selection.kind || selection.defaults.kind || 'label'] || 'عنصر'}
            </div>
          </div>

          {!canPersist && (
            <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-relaxed">
              لحفظ التخصيصات، ادخل بمعاينة شركة محددة (انتحال هوية) وليس لوحة المنصة فقط.
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
          disabled={!selection || !isDirty || saving || !canPersist}
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
