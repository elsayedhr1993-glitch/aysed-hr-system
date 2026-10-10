import React from 'react';
import { Check, Edit3, Loader2, Save, Undo2 } from 'lucide-react';

export interface OdooScreenEditToolbarProps {
  isEditMode: boolean;
  isSaving?: boolean;
  saveSuccess?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  editLabel?: string;
  saveLabel?: string;
  discardLabel?: string;
  className?: string;
  trailing?: React.ReactNode;
}

/** Shared Odoo-style Edit / Save / Discard control strip for app screens. */
export const OdooScreenEditToolbar: React.FC<OdooScreenEditToolbarProps> = ({
  isEditMode,
  isSaving = false,
  saveSuccess = false,
  onEdit,
  onSave,
  onDiscard,
  editLabel = 'تعديل',
  saveLabel = 'حفظ',
  discardLabel = 'تراجع',
  className = '',
  trailing,
}) => (
  <div
    className={`flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs ${className}`}
  >
    <div className="flex flex-wrap items-center gap-2">
      {saveSuccess && (
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Check size={14} /> تم الحفظ
        </span>
      )}
      {isEditMode ? (
        <>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isSaving ? 'جاري الحفظ…' : saveLabel}</span>
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Undo2 size={15} />
            <span>{discardLabel}</span>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Edit3 size={15} />
          <span>{editLabel}</span>
        </button>
      )}
    </div>
    {trailing}
  </div>
);
