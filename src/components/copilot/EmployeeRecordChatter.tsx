import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { AiInlineAssist } from './AiInlineAssist';

export interface EmployeeChatterEntry {
  id: number | string;
  user: string;
  text: string;
  date: string;
}

interface EmployeeRecordChatterProps {
  chatter?: EmployeeChatterEntry[];
  onChatterChange: (entries: EmployeeChatterEntry[]) => void;
  disabled?: boolean;
}

export const EmployeeRecordChatter: React.FC<EmployeeRecordChatterProps> = ({
  chatter = [],
  onChatterChange,
  disabled,
}) => {
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<'message' | 'note'>('note');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || disabled) return;
    const entry: EmployeeChatterEntry = {
      id: Date.now(),
      user: 'مسؤول الموارد البشرية',
      text: draft.trim(),
      date: new Date().toLocaleString('ar-KW'),
    };
    onChatterChange([...chatter, entry]);
    setDraft('');
  };

  const fieldKind = mode === 'message' ? 'employee_notice' : 'hr_notes';

  return (
    <div className="mt-6 border border-slate-200 rounded-xl bg-slate-50/80 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
          <MessageCircle size={14} className="text-[#714B67]" />
          سجل المراسلات والملاحظات (Chatter)
        </h4>
        <div className="flex gap-1 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode('note')}
            className={`px-2 py-1 rounded-md cursor-pointer ${
              mode === 'note' ? 'bg-amber-100 text-amber-900' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            ملاحظة داخلية
          </button>
          <button
            type="button"
            onClick={() => setMode('message')}
            className={`px-2 py-1 rounded-md cursor-pointer ${
              mode === 'message' ? 'bg-[#714B67]/15 text-[#714B67]' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            إشعار / مراسلة
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
        {chatter.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">لا توجد رسائل مسجلة بعد.</p>
        ) : (
          chatter.map((msg) => (
            <div key={msg.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                <span className="font-bold text-[#714B67]">{msg.user}</span>
                <span>{msg.date}</span>
              </div>
              <div className="text-slate-700 whitespace-pre-wrap">{msg.text}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={submit} className="p-3 border-t border-slate-200 bg-white space-y-2">
        <div className="flex items-center justify-end">
          <AiInlineAssist
            fieldKind={fieldKind}
            value={draft}
            maxLength={1500}
            disabled={disabled}
            onApply={setDraft}
          />
        </div>
        <textarea
          rows={2}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            mode === 'message'
              ? 'صياغة إشعار أو مراسلة للموظف…'
              : 'ملاحظة إدارية داخلية على الملف…'
          }
          className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none resize-y disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
        >
          تسجيل في السجل
        </button>
      </form>
    </div>
  );
};
