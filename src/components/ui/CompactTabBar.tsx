import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  onMoreMenuOpenChange?: (open: boolean) => void;
  moreLabel?: string;
}

export const CompactTabBar: React.FC<CompactTabBarProps> = ({
  tabs,
  moreItems = [],
  activeTabId,
  activeMoreId,
  onTabChange,
  onMoreChange,
  onMoreMenuOpenChange,
  moreLabel = 'المزيد',
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const menuPortalRef = useRef<HTMLDivElement>(null);

  const setMoreOpenSafe = (open: boolean) => {
    setMoreOpen(open);
    if (!open) setMenuAnchor(null);
    onMoreMenuOpenChange?.(open);
  };

  const syncMenuAnchor = () => {
    const rect = moreButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuAnchor({ top: rect.bottom + 4, left: rect.left });
  };

  const toggleMore = () => {
    if (moreOpen) {
      setMoreOpenSafe(false);
      return;
    }
    syncMenuAnchor();
    setMoreOpen(true);
    onMoreMenuOpenChange?.(true);
  };

  useEffect(() => {
    if (!moreOpen) return;
    syncMenuAnchor();
    const onScrollOrResize = () => syncMenuAnchor();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreButtonRef.current?.contains(target) || menuPortalRef.current?.contains(target)) {
        return;
      }
      setMoreOpenSafe(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [moreOpen]);

  const moreActive = Boolean(activeMoreId && moreItems.some((m) => m.id === activeMoreId));

  const moreMenuPortal =
    moreOpen && menuAnchor && moreItems.length > 0 && onMoreChange
      ? createPortal(
          <div
            ref={menuPortalRef}
            className="fixed z-[200] w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-in fade-in duration-100"
            style={{ top: menuAnchor.top, left: menuAnchor.left }}
            dir="rtl"
          >
            {moreItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMoreOpenSafe(false);
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
          </div>,
          document.body
        )
      : null;

  return (
    <div className="border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5">
      {tabs.map((tab) => {
        const active = activeTabId === tab.id && !moreActive;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setMoreOpenSafe(false);
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
        <div className="relative shrink-0">
          <button
            ref={moreButtonRef}
            type="button"
            onClick={toggleMore}
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
        </div>
      )}

      {moreMenuPortal}
    </div>
  );
};
