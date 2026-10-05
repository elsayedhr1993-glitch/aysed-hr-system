import React, { useState } from 'react';
import { Bot, Loader2, X } from 'lucide-react';
import { useEntityAiSummary } from '../../hooks/useEntityAiSummary';
import { useLang } from '../../lib/i18n';

interface EntityAiSummaryButtonProps {
  employee: Record<string, unknown>;
  leaveRequests?: Array<Record<string, unknown>>;
  leaveAllocations?: Array<Record<string, unknown>>;
  commencementRecord?: Record<string, unknown> | null;
  className?: string;
}

export const EntityAiSummaryButton: React.FC<EntityAiSummaryButtonProps> = ({
  employee,
  leaveRequests,
  leaveAllocations,
  commencementRecord,
  className = '',
}) => {
  const { lang } = useLang();
  const isArabic = lang === 'ar';
  const { summarizeEmployee, loading } = useEntityAiSummary();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');

  const run = async () => {
    setOpen(true);
    setSummary('');
    const result = await summarizeEmployee({
      employee,
      leaveRequests,
      leaveAllocations,
      commencementRecord,
    });
    if (!result.success) {
      setSummary(result.error || (isArabic ? 'تعذر التلخيص.' : 'Summarize failed.'));
      return;
    }
    setSummary(result.reply || '');
    setSource(result.source || '');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-slate-900 text-amber-200 border border-amber-500/40 hover:bg-black disabled:opacity-50 cursor-pointer ${className}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
        <span>{isArabic ? 'تلخيص ذكي للسجل' : 'AI summary'}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#714B67] to-slate-900 text-white">
              <h3 className="text-sm font-bold">{isArabic ? 'ملخص الحالة الإدارية' : 'Administrative summary'}</h3>
              <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/20 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loading && !summary ? (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isArabic ? 'جاري تحليل السجل…' : 'Analyzing record…'}
                </p>
              ) : (
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{summary}</p>
              )}
            </div>
            {source && !loading && (
              <div className="px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">{source}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
