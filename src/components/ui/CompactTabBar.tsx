import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

export interface CompactTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface CompactTabBarProps {
  tabs: CompactTabItem[];
  moreItems?: CompactTabItem[];
  activeTabId: string;
  activeMoreId?: string;
  onTabChange: (id: string) => void;
  onMoreChange?: (id: string) => void;
  moreLabel?: string;
}

export const CompactTabBar: React.FC<CompactTabBarProps> = ({
  tabs,
  moreItems = [],
  activeTabId,
  activeMoreId,
  onTabChange,
  onMoreChange,
  moreLabel = 'المزيد',
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [moreOpen]);

  const moreActive = Boolean(activeMoreId && moreItems.some((m) => m.id === activeMoreId));

  return (
    <div className="border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5">
      {tabs.map((tab) => {
        const active = activeTabId === tab.id && !moreActive;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMoreOpen(false);
              onTabChange(tab.id);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer duration-200 ${
              active
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            {tab.icon}
            <span>{tab.shortLabel || tab.label}</span>
            {tab.badge}
          </button>
        );
      })}

      {moreItems.length > 0 && onMoreChange && (
        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              moreActive
                ? 'bg-white text-[#714B67] shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
            }`}
          >
            <MoreHorizontal size={15} />
            <span>{moreLabel}</span>
            <ChevronDown size={13} className={`text-slate-400 transition ${moreOpen ? 'rotate-180' : ''}`} />
          </button>

          {moreOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in duration-100">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onMoreChange(item.id);
                  }}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer ${
                    activeMoreId === item.id
                      ? 'bg-purple-50 text-[#714B67] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
