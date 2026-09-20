import React from 'react';
import { Sliders } from 'lucide-react';
import { useLayoutStudio } from '../../context/LayoutStudioContext';

interface ScreenLayoutStudioToggleProps {
  screenId: string;
  layoutVersion?: number;
}

/** Visible to Super Admin only — full Studio drawer ships in a later phase */
export const ScreenLayoutStudioToggle: React.FC<ScreenLayoutStudioToggleProps> = ({
  screenId,
  layoutVersion,
}) => {
  const { canEditCustomLayout, studioMode, toggleStudioMode } = useLayoutStudio();

  if (!canEditCustomLayout) return null;

  return (
    <button
      type="button"
      onClick={toggleStudioMode}
      title={`تخصيص الواجهة — ${screenId}`}
      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
        studioMode
          ? 'bg-amber-100 border-amber-400 text-amber-950'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      <Sliders size={14} />
      <span>{studioMode ? 'وضع Studio (معاينة)' : 'Studio'}</span>
      {layoutVersion != null && (
        <span className="font-mono text-[9px] opacity-70">v{layoutVersion}</span>
      )}
    </button>
  );
};
