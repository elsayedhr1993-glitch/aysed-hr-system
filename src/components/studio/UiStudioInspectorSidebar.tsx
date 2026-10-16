import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, EyeOff, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useUiStudio } from '../../context/UiStudioContext';
import {
  LAUNCHER_GROUPS,
  LAUNCHER_ICONS,
  launcherTileIdFromKey,
  resolveLauncherTile,
} from '../../config/launcherTiles';
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
  icon: string;
  group: string;
  order: string;
  permission: string;
};

function snapshotFromResolved(resolved: ResolvedUiElement, extra?: Partial<FormSnapshot>): FormSnapshot {
  return {
    labelAr: resolved.label.ar,
    labelEn: resolved.label.en || '',
    helpAr: resolved.help?.ar || '',
    helpEn: resolved.help?.en || '',
    visible: !resolved.hidden,
    icon: extra?.icon || '',
    group: extra?.group || '',
    order: extra?.order || '',
    permission: extra?.permission || '',
  };
}

function draftsEqual(a: FormSnapshot, b: FormSnapshot): boolean {
  return (
    a.labelAr === b.labelAr &&
    a.labelEn === b.labelEn &&
    a.helpAr === b.helpAr &&
    a.helpEn === b.helpEn &&
    a.visible === b.visible &&
    a.icon === b.icon &&
    a.group === b.group &&
    a.order === b.order &&
    a.permission === b.permission
  );
}

const GROUP_LABEL: Record<string, string> = {
  people: 'الموظفون',
  recruitment: 'التوظيف',
  time: 'الوقت',
  payroll: 'الرواتب',
  documents: 'المستندات',
  reports: 'التقارير',
  admin: 'الإدارة',
};

export const UiStudioInspectorSidebar: React.FC = () => {
  const {
    canUseUiStudio,
    uiStudioActive,
    selection,
    clearSelection,
    resolveElement,
    saveElementPatch,
    resetElement,
    exportOverridesJson,
    overridesDoc,
    studioCompanyId,
  } = useUiStudio();

  const [labelAr, setLabelAr] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [helpAr, setHelpAr] = useState('');
  const [helpEn, setHelpEn] = useState('');
  const [visible, setVisible] = useState(true);
  const [icon, setIcon] = useState('');
  const [group, setGroup] = useState('');
  const [order, setOrder] = useState('');
  const [permission, setPermission] = useState('');
  const [saving, setSaving] = useState(false);

  const selectionKey = selection?.uiKey ?? '';
  const overridesVersion = overridesDoc?.version ?? 0;
  const launcherId = launcherTileIdFromKey(selectionKey);

  const persistedSnapshot = useMemo((): FormSnapshot | null => {
    if (!selection) return null;
    const resolved = resolveElement(selection.uiKey, {
      ...selection.defaults,
      kind: selection.kind ?? selection.defaults.kind,
    });
    const tile = launcherId ? resolveLauncherTile(launcherId, overridesDoc?.elements?.[selection.uiKey]) : null;
    const storedPermission = overridesDoc?.elements?.[selection.uiKey]?.permission;
    return snapshotFromResolved(resolved, tile ? {
      icon: tile.icon,
      group: tile.group,
      order: String(tile.order),
      permission: storedPermission === 'employee' || storedPermission === 'staff' ? storedPermission : tile.permission,
    } : undefined);
  }, [selection, selectionKey, overridesVersion, resolveElement, launcherId, overridesDoc]);

  useEffect(() => {
    if (!persistedSnapshot) return;
    setLabelAr(persistedSnapshot.labelAr);
    setLabelEn(persistedSnapshot.labelEn);
    setHelpAr(persistedSnapshot.helpAr);
    setHelpEn(persistedSnapshot.helpEn);
    setVisible(persistedSnapshot.visible);
    setIcon(persistedSnapshot.icon);
    setGroup(persistedSnapshot.group);
    setOrder(persistedSnapshot.order);
    setPermission(persistedSnapshot.permission);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync form only on element / version change
  }, [selectionKey, overridesVersion]);

  const draft = useMemo(
    () => ({ labelAr, labelEn, helpAr, helpEn, visible, icon, group, order, permission }),
    [labelAr, labelEn, helpAr, helpEn, visible, icon, group, order, permission]
  );

  const isDirty = persistedSnapshot ? !draftsEqual(draft, persistedSnapshot) : false;

  const resolved = selection
    ? resolveElement(selection.uiKey, {
        ...selection.defaults,
        kind: selection.kind ?? selection.defaults.kind,
      })
    : null;

  const canPersist = Boolean(canUseUiStudio && studioCompanyId);

  if (!canUseUiStudio || !uiStudioActive || !selection) return null;

  const handleSave = async () => {
    if (saving || !isDirty) return;

    setSaving(true);
    try {
      const orderNumber = Number(order);
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
          ...(launcherId
            ? {
                icon,
                group,
                order: Number.isFinite(orderNumber) ? orderNumber : undefined,
                permission,
              }
            : {}),
        },
        { quiet: false }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await resetElement(selection.uiKey);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="fixed top-12 bottom-0 z-[190] w-[min(100%,20rem)] bg-white border-s border-slate-200 shadow-xl flex flex-col print:hidden"
      style={{ insetInlineStart: 0 }}
      dir="rtl"
      aria-label="لوحة الخصائص"
    >
      <header className="shrink-0 px-3 py-2.5 border-b border-slate-200 bg-primary text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={16} className="shrink-0 text-amber-200" />
          <div className="text-xs font-black leading-tight">لوحة الخصائص</div>
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

      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold text-slate-500">المعرّف</div>
            <div className="font-mono text-[10px] text-slate-800 break-all mt-0.5">{selection.uiKey}</div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              الشركة: <span className="font-mono font-bold text-slate-800">{studioCompanyId || '—'}</span>
            </div>
            <div className="mt-1.5 inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {kindLabel[selection.kind || selection.defaults.kind || 'label'] || 'عنصر'}
            </div>
          </div>

          {!canPersist && (
            <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
              الحفظ يتبع منشأة الجلسة على الخادم.
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
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
          </div>

          {launcherId && (
            <>
              <label className="block">
                <span className="font-bold text-slate-700">الأيقونة</span>
                <select
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                >
                  {LAUNCHER_ICONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">المجموعة</span>
                <select
                  value={group}
                  onChange={e => setGroup(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                >
                  {LAUNCHER_GROUPS.map((id) => (
                    <option key={id} value={id}>{GROUP_LABEL[id] || id}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">الترتيب</span>
                <input
                  value={order}
                  onChange={e => setOrder(e.target.value)}
                  inputMode="numeric"
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="font-bold text-slate-700">الصلاحية</span>
                <select
                  value={permission}
                  onChange={e => setPermission(e.target.value)}
                  className="w-full mt-1 border border-slate-200 rounded-lg p-2 text-sm"
                >
                  <option value="staff">الموظفون الإداريون</option>
                  <option value="employee">تشمل الموظف</option>
                </select>
                <span className="block mt-1 text-[10px] text-slate-500">إخفاء المربع لا يغيّر فتح التطبيق.</span>
              </label>
            </>
          )}
        </div>

      <footer className="shrink-0 p-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleReset()}
          className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 font-bold cursor-pointer hover:bg-slate-50 flex items-center justify-center gap-1"
        >
          <RotateCcw size={14} />
          استعادة الافتراضي
        </button>
        <div className="flex gap-2">
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
          className="flex-1 py-2 rounded-lg bg-primary text-white font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Save size={14} />
          {saving ? 'جاري الحفظ…' : 'حفظ'}
        </button>
        </div>
      </footer>
    </aside>
  );
};
