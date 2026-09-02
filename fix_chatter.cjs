const fs = require('fs');

const content = `import React, { useState } from 'react';
import { Camera, Paperclip, Send, Clock, Edit3, AlignLeft, Calendar as CalendarIcon, User, MessageCircle, FileText, CheckCircle2 } from 'lucide-react';

export interface ChatterMessage {
  id: string;
  author: string;
  authorAvatar?: string;
  date: string;
  content: string;
  type: 'message' | 'note' | 'tracking' | 'activity';
  trackingChanges?: { field: string; oldValue: string; newValue: string }[];
}

interface OdooChatterProps {
  recordId: string;
  model: string;
  messages?: ChatterMessage[];
  followers?: { id: string; name: string; avatar?: string }[];
  onSendMessage?: (content: string, type: 'message' | 'note') => void;
  onScheduleActivity?: (activityDetails: any) => void;
}

export const OdooChatter: React.FC<OdooChatterProps> = ({
  recordId,
  model,
  messages = [],
  followers = [],
  onSendMessage,
  onScheduleActivity
}) => {
  const [activeTab, setActiveTab] = useState<'message' | 'note' | 'activity'>('note');
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText, activeTab === 'message' ? 'message' : 'note');
    }
    setInputText('');
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 mt-8 font-sans" dir="rtl">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('message')}
            className={\`flex items-center gap-2 text-sm font-bold pb-3 -mb-3 border-b-2 transition-colors \${
              activeTab === 'message' ? 'text-[#714B67] border-[#714B67]' : 'text-slate-500 border-transparent hover:text-slate-700'
            }\`}
          >
            <MessageCircle size={16} />
            إرسال رسالة
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={\`flex items-center gap-2 text-sm font-bold pb-3 -mb-3 border-b-2 transition-colors \${
              activeTab === 'note' ? 'text-[#714B67] border-[#714B67]' : 'text-slate-500 border-transparent hover:text-slate-700'
            }\`}
          >
            <AlignLeft size={16} />
            تسجيل ملاحظة
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={\`flex items-center gap-2 text-sm font-bold pb-3 -mb-3 border-b-2 transition-colors \${
              activeTab === 'activity' ? 'text-[#714B67] border-[#714B67]' : 'text-slate-500 border-transparent hover:text-slate-700'
            }\`}
          >
            <Clock size={16} />
            جدولة نشاط
          </button>
        </div>
        
        {/* Followers Widget */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="flex -space-x-2 space-x-reverse mr-4">
            {followers.length > 0 ? followers.map((f, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500" title={f.name}>
                {f.avatar ? <img src={f.avatar} alt={f.name} className="w-full h-full rounded-full" /> : <User size={14} />}
              </div>
            )) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                <User size={14} />
              </div>
            )}
          </div>
          <button className="flex items-center gap-1 hover:text-slate-800 transition-colors">
            <span className="font-bold">{followers.length}</span>
            <span>متابعين</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className={\`border border-slate-300 rounded-lg overflow-hidden transition-shadow focus-within:ring-2 \${
          activeTab === 'note' ? 'bg-amber-50 focus-within:ring-amber-200' : 'bg-white focus-within:ring-[#714B67]/20'
        }\`}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeTab === 'message' ? "اكتب رسالتك هنا... سيتم إرسال إشعار للمتابعين" : activeTab === 'note' ? "تسجيل ملاحظة داخلية... لن يتم إرسال إشعار للمتابعين" : "تفاصيل النشاط المستقبلي..."}
            className="w-full min-h-[80px] p-3 text-sm resize-y outline-none bg-transparent"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors" title="إرفاق ملف">
                <Paperclip size={16} />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors" title="استخدام الكاميرا">
                <Camera size={16} />
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={\`px-4 py-1.5 text-sm font-bold text-white rounded transition-colors flex items-center gap-2 \${
                inputText.trim() 
                  ? (activeTab === 'note' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#714B67] hover:bg-[#5a3a52]') 
                  : 'bg-slate-300 cursor-not-allowed'
              }\`}
            >
              {activeTab === 'message' ? 'إرسال' : activeTab === 'note' ? 'تسجيل' : 'جدولة'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail & Message History */}
      <div className="p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            لا توجد رسائل أو سجلات تتبع حتى الآن.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {msg.authorAvatar ? (
                  <img src={msg.authorAvatar} alt={msg.author} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-sm text-slate-800">{msg.author}</span>
                  <span className="text-xs text-slate-500" title={msg.date}>{msg.date}</span>
                </div>
                
                {msg.type === 'message' && (
                  <div className="text-sm text-slate-700 p-3 bg-white border border-slate-200 rounded-xl rounded-tr-none shadow-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}

                {msg.type === 'note' && (
                  <div className="text-sm text-slate-800 p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-sm whitespace-pre-wrap">
                    <div className="flex items-center gap-2 mb-1 text-amber-700 text-xs font-bold">
                      <FileText size={12} />
                      ملاحظة داخلية
                    </div>
                    {msg.content}
                  </div>
                )}

                {msg.type === 'tracking' && (
                  <div className="text-sm">
                    {msg.content && <p className="text-slate-600 mb-2">{msg.content}</p>}
                    {msg.trackingChanges && msg.trackingChanges.length > 0 && (
                      <div className="inline-block bg-slate-100 rounded-lg p-3 border border-slate-200">
                        {msg.trackingChanges.map((change, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs mb-1 last:mb-0">
                            <span className="font-bold text-slate-700 w-24">{change.field}</span>
                            <span className="text-slate-500 line-through">{change.oldValue}</span>
                            <span className="text-slate-400">←</span>
                            <span className="text-emerald-600 font-bold">{change.newValue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {msg.type === 'activity' && (
                  <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-1 text-blue-700 font-bold">
                      <CalendarIcon size={14} />
                      نشاط مجدول
                    </div>
                    <p className="text-slate-700">{msg.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/OdooChatter.tsx', content, 'utf8');
console.log('Fixed OdooChatter.tsx');
