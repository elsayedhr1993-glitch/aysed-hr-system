import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Paperclip, 
  Send, 
  Clock, 
  Edit3, 
  AlignLeft, 
  Calendar as CalendarIcon, 
  User, 
  MessageCircle, 
  FileText, 
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  FileCheck,
  Check,
  X,
  Plus,
  Info,
  CalendarCheck2,
  ShieldCheck
} from 'lucide-react';
import { getExpiryStatus, ODOO_ACTIVITY_TYPES, OdooActivityTypeKey } from '../utils/expiryUtils';

export interface ScheduledActivity {
  id: string;
  type: string; // e.g. '📅 تجديد مستند (Document Renewal)' | '🩺 تجديد ترخيص طبي (MOH License)' | '📝 متابعة عقد (Contract Review)'
  typeKey?: OdooActivityTypeKey;
  summary: string;
  note?: string;
  assignee: string;
  assigneeRole?: string;
  dueDate: string;
  status: 'green' | 'yellow' | 'red';
  statusText: string;
  daysRemaining?: number;
  isAutomated?: boolean;
  relatedDoc?: string;
}

export interface ChatterMessage {
  id: string;
  author: string;
  authorAvatar?: string;
  date: string;
  content: string;
  type: 'message' | 'note' | 'tracking' | 'activity';
  trackingChanges?: { field: string; oldValue: string; newValue: string }[];
  activityDetails?: {
    type: string;
    assignee: string;
    dueDate: string;
    status: 'green' | 'yellow' | 'red';
    statusText: string;
  };
}

interface OdooChatterProps {
  recordId: string;
  model: string;
  messages?: ChatterMessage[];
  followers?: { id: string; name: string; avatar?: string }[];
  onSendMessage?: (content: string, type: 'message' | 'note') => void;
  onScheduleActivity?: (activity: ScheduledActivity) => void;
  extraActivities?: ScheduledActivity[];
}

export const OdooChatter: React.FC<OdooChatterProps> = ({
  recordId,
  model,
  messages = [],
  followers = [],
  onSendMessage,
  onScheduleActivity,
  extraActivities = []
}) => {
  const [activeTab, setActiveTab] = useState<'message' | 'note' | 'activity'>('note');
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatterMessage[]>(messages);
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Derive initial activities from messages + extraActivities
  const initialActivities: ScheduledActivity[] = [
    ...extraActivities,
    ...messages
      .filter(m => m.type === 'activity' && m.activityDetails)
      .map((m) => ({
        id: m.id,
        type: m.activityDetails!.type,
        summary: m.content,
        assignee: m.activityDetails!.assignee,
        dueDate: m.activityDetails!.dueDate,
        status: m.activityDetails!.status,
        statusText: m.activityDetails!.statusText,
        isAutomated: true
      }))
  ];

  const [activeActivities, setActiveActivities] = useState<ScheduledActivity[]>(initialActivities);

  // Activity Schedule Form State
  const [selectedActivityType, setSelectedActivityType] = useState<OdooActivityTypeKey>('doc_renewal');
  const [activitySummary, setActivitySummary] = useState('');
  const [activityDueDate, setActivityDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [activityAssignee, setActivityAssignee] = useState(ODOO_ACTIVITY_TYPES.doc_renewal.defaultAssignee);
  const [activityNote, setActivityNote] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    if (!showActivityModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowActivityModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showActivityModal]);

  // Handle activity type change to auto-fill responsible officer
  const handleActivityTypeSelect = (key: OdooActivityTypeKey) => {
    setSelectedActivityType(key);
    const config = ODOO_ACTIVITY_TYPES[key];
    setActivityAssignee(config.defaultAssignee);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatterMessage = {
      id: `msg-${Date.now()}`,
      author: 'المستخدم الحالي',
      date: new Date().toLocaleDateString('ar-KW'),
      content: inputText,
      type: activeTab === 'message' ? 'message' : 'note'
    };
    setLocalMessages(prev => [newMsg, ...prev]);
    if (onSendMessage) {
      onSendMessage(inputText, activeTab === 'message' ? 'message' : 'note');
    }
    setInputText('');
  };

  // Schedule activity handler
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config = ODOO_ACTIVITY_TYPES[selectedActivityType];
    const expiryStatus = getExpiryStatus(activityDueDate) || {
      status: 'yellow' as const,
      text: 'يستحق قريباً',
      days: 30,
      isExpired: false,
      isExpiringSoon: true,
      badgeClass: 'bg-amber-100 text-amber-800'
    };

    const newActivity: ScheduledActivity = {
      id: `act-${Date.now()}`,
      type: config.label,
      typeKey: selectedActivityType,
      summary: activitySummary || `متابعة ${config.label}`,
      note: activityNote,
      assignee: activityAssignee || config.defaultAssignee,
      assigneeRole: config.defaultAssigneeRole,
      dueDate: activityDueDate,
      status: expiryStatus.status,
      statusText: expiryStatus.text,
      daysRemaining: expiryStatus.days,
      isAutomated: false
    };

    setActiveActivities(prev => [newActivity, ...prev]);

    // Also record tracking message in chatter
    const trackingMsg: ChatterMessage = {
      id: `act-log-${Date.now()}`,
      author: 'نظام الأنشطة',
      date: new Date().toLocaleDateString('ar-KW'),
      content: `تمت جدولة نشاط جديد: ${newActivity.summary} للمسؤول (${newActivity.assignee}) يستحق في ${newActivity.dueDate}.`,
      type: 'tracking'
    };
    setLocalMessages(prev => [trackingMsg, ...prev]);

    if (onScheduleActivity) {
      onScheduleActivity(newActivity);
    }

    // Reset & close
    setShowActivityModal(false);
    setActivitySummary('');
    setActivityNote('');
  };

  // Complete an activity
  const handleMarkAsDone = (activityId: string, feedback?: string) => {
    const act = activeActivities.find(a => a.id === activityId);
    if (!act) return;

    setActiveActivities(prev => prev.filter(a => a.id !== activityId));

    const doneMsg: ChatterMessage = {
      id: `done-${Date.now()}`,
      author: act.assignee,
      date: new Date().toLocaleDateString('ar-KW'),
      content: `✅ تم إنجاز النشاط: ${act.type} - "${act.summary}". ${feedback ? `ملاحظة الإنجاز: ${feedback}` : 'تم التجديد والمطابقة بنجاح.'}`,
      type: 'note'
    };
    setLocalMessages(prev => [doneMsg, ...prev]);
  };

  // Cancel an activity
  const handleCancelActivity = (activityId: string) => {
    const act = activeActivities.find(a => a.id === activityId);
    if (!act) return;

    setActiveActivities(prev => prev.filter(a => a.id !== activityId));

    const cancelMsg: ChatterMessage = {
      id: `cancel-${Date.now()}`,
      author: 'النظام',
      date: new Date().toLocaleDateString('ar-KW'),
      content: `تم إلغاء النشاط المجدول: ${act.type} (${act.summary}).`,
      type: 'tracking'
    };
    setLocalMessages(prev => [cancelMsg, ...prev]);
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 mt-8 font-sans" dir="rtl">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'message' ? 'text-[#714B67] border-[#714B67]' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <MessageCircle size={15} />
            إرسال رسالة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold pb-3 -mb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'note' ? 'text-[#714B67] border-[#714B67]' : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            <AlignLeft size={15} />
            تسجيل ملاحظة
          </button>
          <button
            type="button"
            onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold pb-3 -mb-3 text-[#714B67] hover:text-[#5a3a52] transition-colors cursor-pointer border-b-2 border-transparent hover:border-[#714B67]"
          >
            <Clock size={15} />
            جدولة نشاط (Schedule Activity)
          </button>
        </div>
        
        {/* Followers Widget */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="flex -space-x-2 space-x-reverse mr-2">
            {followers.length > 0 ? followers.map((f, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-2xs" title={f.name}>
                {f.avatar ? <img src={f.avatar} alt={f.name} className="w-full h-full rounded-full object-cover" /> : <User size={12} />}
              </div>
            )) : (
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                <User size={12} />
              </div>
            )}
          </div>
          <span className="font-bold text-slate-700">{followers.length} متابعين</span>
        </div>
      </div>

      {/* 🚀 Odoo 18 Scheduled Activities Panel (الأنشطة المجدولة والتنبيهات التلقائية) */}
      {activeActivities.length > 0 && (
        <div className="p-4 bg-purple-50/40 border-b border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-[#714B67]" />
              <h4 className="text-xs font-black text-slate-900">
                محرك الأنشطة المجدولة والتنبيهات التلقائية ({activeActivities.length})
              </h4>
            </div>
            <span className="text-[10px] bg-[#714B67]/10 text-[#714B67] font-bold px-2 py-0.5 rounded-md">
              Odoo Activity Engine (Kuwait Expiry Triggers)
            </span>
          </div>

          <div className="space-y-2.5">
            {activeActivities.map((act) => {
              // Calculate status live if dueDate is present
              const expiry = act.dueDate ? getExpiryStatus(act.dueDate) : null;
              const status = expiry ? expiry.status : act.status;
              const statusText = expiry ? expiry.text : act.statusText;

              return (
                <div 
                  key={act.id} 
                  className={`p-3 rounded-xl border transition shadow-2xs bg-white ${
                    status === 'red' ? 'border-rose-200 bg-rose-50/30' :
                    status === 'yellow' ? 'border-amber-200 bg-amber-50/20' :
                    'border-emerald-200 bg-emerald-50/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        status === 'red' ? 'bg-rose-100 text-rose-700' :
                        status === 'yellow' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {act.type.includes('ترخيص طبي') || act.type.includes('MOH') ? (
                          <Stethoscope size={16} />
                        ) : act.type.includes('عقد') || act.type.includes('Contract') ? (
                          <FileCheck size={16} />
                        ) : (
                          <CalendarIcon size={16} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{act.type}</span>
                          {/* Live Status Badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                            status === 'green' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            status === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'green' ? 'bg-emerald-500' :
                              status === 'yellow' ? 'bg-amber-500' :
                              'bg-rose-500 animate-ping'
                            }`} />
                            {statusText}
                          </span>

                          {act.isAutomated && (
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              تنبيه تلقائي قبل 60 يوماً
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 font-medium mt-1">{act.summary}</p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 font-medium">
                            <User size={12} className="text-[#714B67]" />
                            <span>المسؤول الموجه له: <strong className="text-slate-800">{act.assignee}</strong></span>
                            {act.assigneeRole && <span className="text-[10px] text-slate-400">({act.assigneeRole})</span>}
                          </div>

                          <div className="flex items-center gap-1 font-medium">
                            <Clock size={12} className="text-slate-400" />
                            <span>تاريخ الاستحقاق: <strong className="font-mono text-slate-800">{act.dueDate}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleMarkAsDone(act.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="تعليم كمنجز"
                      >
                        <Check size={13} />
                        تم الإنجاز
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelActivity(act.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="إلغاء النشاط"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className={`border border-slate-300 rounded-xl overflow-hidden transition-shadow focus-within:ring-2 ${
          activeTab === 'note' ? 'bg-amber-50/60 focus-within:ring-amber-200' : 'bg-white focus-within:ring-[#714B67]/20'
        }`}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={activeTab === 'message' ? "اكتب رسالتك هنا... سيتم إرسال إشعار للمتابعين" : "تسجيل ملاحظة داخلية... لن يتم إرسال إشعار للمتابعين"}
            className="w-full min-h-[75px] p-3 text-xs sm:text-sm resize-y outline-none bg-transparent"
          />
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors" title="إرفاق ملف">
                <Paperclip size={15} />
              </button>
              <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors" title="استخدام الكاميرا">
                <Camera size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                inputText.trim() 
                  ? (activeTab === 'note' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#714B67] hover:bg-[#5a3a52]') 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {activeTab === 'message' ? 'إرسال' : 'تسجيل ملاحظة'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail & Message History */}
      <div className="p-6 space-y-5">
        {localMessages.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-medium">
            لا توجد رسائل أو سجلات تتبع سابقة.
          </div>
        ) : (
          localMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-300">
                {msg.authorAvatar ? (
                  <img src={msg.authorAvatar} alt={msg.author} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-slate-500" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-xs text-slate-800">{msg.author}</span>
                  <span className="text-[10px] text-slate-400 font-mono" title={msg.date}>{msg.date}</span>
                </div>
                
                {msg.type === 'message' && (
                  <div className="text-xs text-slate-800 p-3 bg-white border border-slate-200 rounded-xl rounded-tr-none shadow-2xs whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                )}

                {msg.type === 'note' && (
                  <div className="text-xs text-slate-800 p-3 bg-amber-50/80 border border-amber-200 rounded-xl shadow-2xs whitespace-pre-wrap leading-relaxed">
                    <div className="flex items-center gap-1.5 mb-1 text-amber-800 text-[11px] font-bold">
                      <FileText size={12} />
                      ملاحظة داخلية (Internal Note)
                    </div>
                    {msg.content}
                  </div>
                )}

                {msg.type === 'tracking' && (
                  <div className="text-xs">
                    {msg.content && <p className="text-slate-600 mb-1.5">{msg.content}</p>}
                    {msg.trackingChanges && msg.trackingChanges.length > 0 && (
                      <div className="inline-block bg-slate-100 rounded-lg p-2.5 border border-slate-200">
                        {msg.trackingChanges.map((change, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-[11px] mb-1 last:mb-0">
                            <span className="font-bold text-slate-700">{change.field}:</span>
                            <span className="text-slate-500 line-through">{change.oldValue}</span>
                            <span className="text-slate-400">←</span>
                            <span className="text-emerald-600 font-bold">{change.newValue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 📅 Modal: جدولة نشاط (Odoo Activity Scheduler Modal) */}
      {showActivityModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in" 
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowActivityModal(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-bold text-sm">جدولة نشاط جديد (Schedule Activity - Odoo)</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowActivityModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer hover:scale-105 active:scale-95"
                title="إغلاق النافذة (Esc)"
                aria-label="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleScheduleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
                
                {/* Activity Type Selection */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    نوع النشاط (Activity Type) *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(ODOO_ACTIVITY_TYPES) as OdooActivityTypeKey[]).map((key) => {
                      const cfg = ODOO_ACTIVITY_TYPES[key];
                      const isSelected = selectedActivityType === key;
                      return (
                        <div
                          key={key}
                          onClick={() => handleActivityTypeSelect(key)}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                            isSelected 
                              ? 'bg-[#714B67]/5 border-[#714B67] ring-1 ring-[#714B67]' 
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {cfg.label}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{cfg.description}</p>
                            <div className="text-[10px] text-[#714B67] font-semibold mt-1">
                              المسؤول التلقائي: {cfg.defaultAssignee} ({cfg.defaultAssigneeRole})
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="activityType"
                            checked={isSelected}
                            onChange={() => handleActivityTypeSelect(key)}
                            className="mt-1 text-[#714B67] focus:ring-[#714B67]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Due Date & Assignee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      تاريخ الاستحقاق (Due Date) *
                    </label>
                    <input
                      type="date"
                      required
                      value={activityDueDate}
                      onChange={(e) => setActivityDueDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-[#714B67]"
                    />
                    {/* Live Status Badge Preview */}
                    {activityDueDate && (() => {
                      const exp = getExpiryStatus(activityDueDate);
                      if (!exp) return null;
                      return (
                        <div className="mt-1 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold inline-block ${exp.badgeClass}`}>
                            {exp.text}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      المسؤول المكلف (Assignee) *
                    </label>
                    <input
                      type="text"
                      required
                      value={activityAssignee}
                      onChange={(e) => setActivityAssignee(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>

                {/* Summary / Notes */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ملخص النشاط (Summary)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: متابعة تجديد ترخيص مزاولة المهنة قبل انتهاء المهلة"
                    value={activitySummary}
                    onChange={(e) => setActivitySummary(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    تفاصيل إضافية / تعليمات المتابعة
                  </label>
                  <textarea
                    rows={2}
                    placeholder="أدخل أي ملاحظات خاصة بجهة التجديد أو المستندات المطلوبة..."
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="flex items-center justify-end gap-2 p-4 bg-slate-50 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check size={14} />
                  جدولة النشاط في الـ Chatter
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooChatter;

