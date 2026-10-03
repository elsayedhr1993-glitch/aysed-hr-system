import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLang } from '../../lib/i18n';
import { useUiStudio } from '../../context/UiStudioContext';

export const GlobalStudioModeToggle: React.FC = () => {
  const { lang } = useLang();
  const { canUseUiStudio, uiStudioActive, toggleUiStudio } = useUiStudio();

  if (!canUseUiStudio) return null;

  return (
    <button
      type="button"
      onClick={toggleUiStudio}
      className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer border shrink-0 ${
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
      <span className="lg:hidden">{uiStudioActive ? 'Studio' : 'Studio'}</span>
    </button>
  );
};
