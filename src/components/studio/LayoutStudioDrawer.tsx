import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useLayoutStudio } from '../../context/LayoutStudioContext';
import { StudioCustomFieldsPanel } from './StudioCustomFieldsPanel';

type StudioPanel = 'tabs' | 'custom_fields';

export const LayoutStudioDrawer: React.FC = () => {
  const {
    canEditCustomLayout,
    drawerOpen,
    studioSession,
    closeStudio,
    updateTab,
    reorderTab,
    moveTab,
    saveStudio,
    discardStudio,
  } = useLayoutStudio();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [panel, setPanel] = useState<StudioPanel>('tabs');

  if (!canEditCustomLayout || !drawerOpen || !studioSession) return null;

  const tabs = [...studioSession.draft.tabs].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-[250] flex justify-end dir-rtl" dir="rtl">
      <button
        type="button"
        className="flex-1 bg-black/40 backdrop-blur-[2px]"
        aria-label="إغلاق Studio"
        onClick={closeStudio}
      />
      <aside
        className="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-labelledby="layout-studio-title"
      >
        <header className="shrink-0 p-4 border-b border-slate-200 bg-gradient-to-l from-amber-50 to-white">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 id="layout-studio-title" className="text-sm font-black text-slate-900">
                Studio — تخصيص الشاشة
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {studioSession.screenId} · v{studioSession.draft.version}
                {studioSession.dirty ? ' · غير محفوظ' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={closeStudio}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="shrink-0 px-4 pt-3 flex gap-1 bg-white border-b border-slate-100">
          <button
            type="button"
            onClick={() => setPanel('tabs')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg ${
              panel === 'tabs' ? 'bg-amber-100 text-amber-950' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            التبويبات
          </button>
          <button
            type="button"
            onClick={() => setPanel('custom_fields')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg ${
              panel === 'custom_fields' ? 'bg-amber-100 text-amber-950' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            الحقول المخصصة ({studioSession.draft.customFields.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {panel === 'custom_fields' ? (
            <StudioCustomFieldsPanel />
          ) : (
            <>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            اسحب التبويب لإعادة الترتيب، أو استخدم الأزرار. التبويبات المقفلة لا يمكن إخفاؤها.
          </p>

          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              draggable={!tab.locked}
              onDragStart={() => setDragIndex(index)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragIndex != null && dragIndex !== index) {
                  reorderTab(dragIndex, index);
                }
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`rounded-xl border p-3 space-y-2 ${
                dragIndex === index ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} />
                </span>
                <span className="text-[10px] font-mono text-slate-500 flex-1">{tab.id}</span>
                {tab.locked && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    <Lock size={10} /> مقفل
                  </span>
                )}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveTab(tab.id, 'up')}
                    className="p-1 rounded hover:bg-white disabled:opacity-30"
                    title="أعلى"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === tabs.length - 1}
                    onClick={() => moveTab(tab.id, 'down')}
                    className="p-1 rounded hover:bg-white disabled:opacity-30"
                    title="أسفل"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={tab.locked}
                  onClick={() => updateTab(tab.id, { visible: !tab.visible })}
                  className={`p-1.5 rounded-lg border ${
                    tab.visible
                      ? 'bg-white border-emerald-200 text-emerald-700'
                      : 'bg-slate-200 border-slate-300 text-slate-500'
                  } disabled:opacity-50`}
                  title={tab.visible ? 'إخفاء' : 'إظهار'}
                >
                  {tab.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              <label className="block text-[10px] font-bold text-slate-600">التسمية (عربي)</label>
              <input
                type="text"
                value={tab.label.ar}
                onChange={e => updateTab(tab.id, { label: { ...tab.label, ar: e.target.value } })}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg"
              />
              <label className="block text-[10px] font-bold text-slate-600">Label (English)</label>
              <input
                type="text"
                value={tab.label.en || ''}
                onChange={e => updateTab(tab.id, { label: { ...tab.label, en: e.target.value } })}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg font-sans"
                dir="ltr"
              />
            </div>
          ))}
            </>
          )}
        </div>

        <footer className="shrink-0 p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void saveStudio()}
            disabled={!studioSession.dirty}
            className="w-full py-2.5 rounded-xl bg-[#714B67] hover:bg-[#5a3a52] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Save size={16} />
            حفظ وتفعيل التخطيط
          </button>
          <button
            type="button"
            onClick={discardStudio}
            className="w-full py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            إلغاء التعديلات
          </button>
        </footer>
      </aside>
    </div>
  );
};
