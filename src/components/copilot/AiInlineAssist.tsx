import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAiTextGenerate } from '../../hooks/useAiTextGenerate';
import { AI_FIELD_KIND_LABELS, type AiFieldKind } from '../../lib/aiAssistTypes';
import { useLang } from '../../lib/i18n';

interface AiInlineAssistProps {
  fieldKind: AiFieldKind;
  value?: string;
  onApply: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export const AiInlineAssist: React.FC<AiInlineAssistProps> = ({
  fieldKind,
  value = '',
  onApply,
  disabled,
  maxLength = 1200,
  className = '',
}) => {
  const { lang } = useLang();
  const isArabic = lang === 'ar';
  const { generate, loading } = useAiTextGenerate();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [preview, setPreview] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const runGenerate = async () => {
    const result = await generate({
      instruction,
      fieldKind,
      currentValue: value,
      maxLength,
    });
    if (!result.success || !result.reply) {
      toast.error(result.error || (isArabic ? 'تعذر التوليد.' : 'Generation failed.'));
      return;
    }
    setPreview(result.reply);
  };

  const apply = () => {
    if (!preview.trim()) return;
    onApply(preview.trim());
    setOpen(false);
    setPreview('');
    setInstruction('');
    toast.success(isArabic ? 'تم إدراج النص.' : 'Text applied.');
  };

  const label = AI_FIELD_KIND_LABELS[fieldKind];

  return (
    <div className={`relative inline-flex ${className}`} ref={panelRef}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-[#714B67] border border-purple-200 hover:bg-purple-100 disabled:opacity-50 cursor-pointer"
        title={isArabic ? `صياغة ذكية — ${label}` : `AI assist — ${label}`}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        <span>{isArabic ? 'ذكي' : 'AI'}</span>
      </button>

      {open && (
        <div
          className="absolute z-[80] top-full mt-1 end-0 w-[min(100vw-2rem,320px)] bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2 text-right"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-800">{label}</span>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={isArabic ? 'تعليمات اختيارية (مثلاً: رسمي وقصير)...' : 'Optional instructions…'}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:border-[#714B67] outline-none"
          />
          <button
            type="button"
            onClick={() => void runGenerate()}
            disabled={loading}
            className="w-full py-1.5 rounded-lg bg-[#714B67] text-white text-xs font-bold hover:bg-[#5a3b52] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (isArabic ? 'جاري التوليد…' : 'Generating…') : isArabic ? 'توليد النص' : 'Generate'}
          </button>
          {preview && (
            <textarea
              readOnly
              rows={4}
              value={preview}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 resize-none"
            />
          )}
          {preview && (
            <button
              type="button"
              onClick={apply}
              className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              {isArabic ? 'استخدام النص في الحقل' : 'Apply to field'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
