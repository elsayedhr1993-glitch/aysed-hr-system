import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CompactFormAccordionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export const CompactFormAccordion: React.FC<CompactFormAccordionProps> = ({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  badge,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-right hover:bg-slate-50 transition cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="shrink-0 text-slate-500">{icon}</span>}
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              <span>{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-slate-200/80 bg-white">{children}</div>}
    </div>
  );
};
