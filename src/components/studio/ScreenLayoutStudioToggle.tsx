import React from 'react';
import { Sliders } from 'lucide-react';
import { useLayoutStudio } from '../../context/LayoutStudioContext';
import type { ResolvedScreenLayout, ScreenId } from '../../types/customLayout';

interface ScreenLayoutStudioToggleProps {
  screenId: ScreenId;
  layout: ResolvedScreenLayout;
}

/** Super Admin only — opens layout Studio drawer */
export const ScreenLayoutStudioToggle: React.FC<ScreenLayoutStudioToggleProps> = ({
  screenId,
  layout,
}) => {
  const { canEditCustomLayout, studioMode, drawerOpen, studioSession, openStudio, closeStudio } =
    useLayoutStudio();

  if (!canEditCustomLayout) return null;

  const isActive = drawerOpen && studioSession?.screenId === screenId;

  return (
    <button
      type="button"
      onClick={() => (isActive ? closeStudio() : openStudio(screenId, layout))}
      title={`تخصيص الواجهة — ${screenId}`}
      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
        isActive || studioMode
          ? 'bg-amber-100 border-amber-400 text-amber-950'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      <Sliders size={14} />
      <span>{isActive ? 'إغلاق Studio' : 'Studio'}</span>
      <span className="font-mono text-[9px] opacity-70">v{layout.version}</span>
    </button>
  );
};
