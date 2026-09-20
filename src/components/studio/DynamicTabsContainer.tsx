import React, { useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart,
  CalendarDays,
  DollarSign,
  Layers,
} from 'lucide-react';
import type { LayoutLocale, ResolvedScreenLayout } from '../../types/customLayout';
import { resolveLabel } from '../../utils/customLayoutUtils';
import { useLayoutStudio } from '../../context/LayoutStudioContext';

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarDays,
  BarChart,
  AlertTriangle,
  Layers,
  DollarSign,
};

export interface DynamicTabsContainerProps {
  layout: ResolvedScreenLayout;
  locale: LayoutLocale;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  icons?: Record<string, LucideIcon>;
  /** Appended to tab label, e.g. counts */
  tabSuffix?: Record<string, string>;
  className?: string;
}

export const DynamicTabsContainer: React.FC<DynamicTabsContainerProps> = ({
  layout,
  locale,
  activeTabId,
  onTabChange,
  icons = {},
  tabSuffix = {},
  className = '',
}) => {
  const { studioMode } = useLayoutStudio();
  const visibleTabs = layout.visibleTabs;

  useEffect(() => {
    if (!visibleTabs.length) return;
    if (!visibleTabs.some(tab => tab.id === activeTabId)) {
      onTabChange(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTabId, onTabChange]);

  if (!visibleTabs.length) return null;

  return (
    <div
      className={`flex bg-slate-100 p-1 rounded-xl border text-xs font-bold gap-1 w-full overflow-x-auto ${
        studioMode ? 'border-dashed border-amber-400 ring-1 ring-amber-200/80' : 'border-slate-200'
      } ${className}`}
      data-studio-tabs={studioMode ? 'true' : undefined}
    >
      {visibleTabs.map(tab => {
        const Icon =
          icons[tab.id] || (tab.icon ? ICON_MAP[tab.icon] : undefined) || CalendarDays;
        const suffix = tabSuffix[tab.id] || '';
        const label = resolveLabel(tab.label, locale);
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isActive ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon size={15} className={tab.id === 'operational_absence' ? 'text-amber-600' : undefined} />
            {label}
            {suffix ? ` ${suffix}` : ''}
          </button>
        );
      })}
    </div>
  );
};
