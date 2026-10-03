import React from 'react';
import { useLang } from '../../lib/i18n';
import { UiStudioTarget } from './UiStudioTarget';
import type { UiElementDefaults } from '../../types/uiOverrides';

interface Props {
  uiKey: string;
  defaults: UiElementDefaults;
  icon?: React.ReactNode;
  subtitleUiKey?: string;
  subtitleDefaults?: UiElementDefaults;
  subtitle?: React.ReactNode;
  className?: string;
}

export const UiStudioScreenTitle: React.FC<Props> = ({
  uiKey,
  defaults,
  icon,
  subtitleUiKey,
  subtitleDefaults,
  subtitle,
  className = 'text-xl font-black text-slate-900 flex items-center gap-2',
}) => {
  const { lang } = useLang();
  const titleFallback = lang === 'en' ? defaults.label.en || defaults.label.ar : defaults.label.ar;

  return (
    <div>
      <h1 className={className}>
        {icon}
        <UiStudioTarget uiKey={uiKey} kind="label" defaults={defaults}>
          {titleFallback}
        </UiStudioTarget>
      </h1>
      {(subtitle || subtitleUiKey) && (
        <p className="text-[11px] text-slate-500 mt-0.5">
          {subtitleUiKey && subtitleDefaults ? (
            <UiStudioTarget uiKey={subtitleUiKey} kind="help" defaults={subtitleDefaults}>
              {lang === 'en'
                ? subtitleDefaults.label.en || subtitleDefaults.label.ar
                : subtitleDefaults.label.ar}
            </UiStudioTarget>
          ) : (
            subtitle
          )}
        </p>
      )}
    </div>
  );
};
