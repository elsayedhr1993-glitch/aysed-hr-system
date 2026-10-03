import React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { useLang } from '../../lib/i18n';
import { useUiStudio } from '../../context/UiStudioContext';

export const GlobalStudioModeToggle: React.FC = () => {
  const { lang } = useLang();
  const { canUseUiStudio, uiStudioActive, toggleUiStudio, exportOverridesJson } = useUiStudio();

  if (!canUseUiStudio) return null;

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={toggleUiStudio}
        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border ${
          uiStudioActive
            ? 'bg-amber-400 text-amber-950 border-amber-200 ring-2 ring-amber-200/50 shadow-inner'
            : 'bg-white/10 hover:bg-white/20 text-white/95 border-white/20'
        }`}
        title={lang === 'ar' ? 'تخصيص الواجهة مثل Odoo Studio' : 'Odoo Studio customization mode'}
      >
        <Sparkles size={13} className={uiStudioActive ? 'text-amber-900' : 'text-amber-200'} />
        <span className="hidden lg:inline">
          {lang === 'ar' ? 'وضع التخصيص / Studio' : 'Studio Mode'}
        </span>
        <span className="lg:hidden">Studio</span>
      </button>
      {uiStudioActive && (
        <button
          type="button"
          onClick={exportOverridesJson}
          className="p-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white cursor-pointer"
          title={lang === 'ar' ? 'تصدير JSON للتخصيصات' : 'Export UI overrides JSON'}
        >
          <Download size={13} />
        </button>
      )}
    </div>
  );
};
