import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, RefreshCw, ChevronLeft, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { Employee, Contract } from '../types';
import toast from 'react-hot-toast';
import { downloadKuwaitWPSFile } from '../utils/kuwaitLaw';
import { addDirectEmployeeViaAi } from '../services/tenantDataService';

export interface CopilotAction {
  type: 'NAVIGATE' | 'OPEN_MODAL' | 'TRIGGER_FUNCTION' | 'CREATE_EMPLOYEE';
  appId?: string;
  modal?: 'new_employee' | 'pam_contract' | 'upload_doc';
  functionName?: 'export_wps' | 'export_report';
  employeeData?: {
    nameAr?: string;
    nameEn?: string;
    civilId?: string;
    jobTitle?: string;
    department?: string;
    basicSalary?: string;
    phone?: string;
    nationality?: string;
  };
  title: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  action?: CopilotAction | null;
}

interface AysedAICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  contracts: Contract[];
  onQuickAction?: (actionType: string, payload?: any) => void;
}

export const AysedAICopilot: React.FC<AysedAICopilotProps> = ({
  isOpen,
  onClose,
  employees = [],
  contracts = [],
  onQuickAction,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'أهلاً بك! أنا مساعد Aysed S HR 2026 الذكي والخاص بإدارة الموارد البشرية الكويتي.\nأنا قادر على تنفيذ الأوامر المباشرة، فتح الشاشات، تنزيل ملفات WPS للبنوك، وإضافة الموظفين بالذكاء الاصطناعي مباشرة إلى النظام.\n\nكيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'افتح شاشة تسوية الموظف ونهاية الخدمة',
    'ضيف موظف اسمه أحمد الكندري رقم مدني 290010112345 ووظيفته محامي وراتبه 850',
    'تحميل ملف حماية الأجور للبنوك (WPS)',
    'استخراج عقد عمل حكومي PAM Form 2',
    'سجلات الحضور والدوام والبصمة',
    'عرض كشوف الرواتب وحماية الأجور'
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const queryText = customText || input;
    if (!queryText.trim() || isLoading) return;

    console.log('💬 [Aysed Copilot Query Input]:', queryText);

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-api-key': localStorage.getItem('gemini_api_key') || ''
        },
        body: JSON.stringify({
          prompt: queryText,
          userQuery: queryText,
          messages: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      console.log('🤖 [Aysed Copilot AI Response]:', data);

      const botMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'عذراً، لم أستطع معالجة الإجابة حالياً.',
        timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
        action: data.action || null
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot Chat Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.',
          timestamp: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async (action: CopilotAction) => {
    console.log('⚡ [Aysed Copilot Action Execution Triggered]:', action);

    if (action.type === 'NAVIGATE' && action.appId) {
      console.log(`🚀 [Copilot Navigation] Switching activeApp to: "${action.appId}"`);
      if (onQuickAction) {
        onQuickAction('navigate', action.appId);
      }
      onClose();
    } else if (action.type === 'OPEN_MODAL') {
      console.log(`📂 [Copilot Modal Trigger] Opening modal: "${action.modal}"`);
      if (action.modal === 'new_employee' && onQuickAction) {
        onQuickAction('new_employee');
      } else if (onQuickAction) {
        onQuickAction(action.modal || 'new_employee');
      }
      onClose();
    } else if (action.type === 'TRIGGER_FUNCTION') {
      console.log(`📥 [Copilot Function Execution] Executing: "${action.functionName}"`);
      if (action.functionName === 'export_wps' || !action.functionName) {
        downloadKuwaitWPSFile(
          {
            companyMOSALId: '301122',
            employerBankCode: 'KFH',
            payrollMonthYear: new Date().toISOString().slice(0, 7)
          },
          employees.length > 0 ? employees.map(e => ({
            civil_id: e.civilId || '290010112345',
            bank_code: 'KFH',
            iban: e.iban || 'KW12KFH000000000000112233',
            basic_salary: Number((e as any).basicSalary || (e as any).salary) || 850,
            allowances: 0,
            deductions: 0,
            net_salary: Number((e as any).basicSalary || (e as any).salary) || 850
          })) : [{
            civil_id: '290010112345',
            bank_code: 'KFH',
            iban: 'KW12KFH000000000000112233',
            basic_salary: 850,
            allowances: 0,
            deductions: 0,
            net_salary: 850
          }]
        );
        toast.success('تم تنزيل واستخراج ملف حماية الأجور (WPS SIF) للبنوك بنجاح');
      }
      onClose();
    } else if (action.type === 'CREATE_EMPLOYEE' && action.employeeData) {
      console.log('👤 [Copilot Direct Employee Creation]:', action.employeeData);
      try {
        const activeCompanyId = localStorage.getItem('active_company_id') || 'company_1';
        await addDirectEmployeeViaAi(activeCompanyId, action.employeeData);
        toast.success(`تم إضافة الموظف (${action.employeeData.nameAr || 'الجديد'}) بنجاح إلى قاعدة البيانات!`);
        if (onQuickAction) {
          onQuickAction('navigate', 'employees');
        }
      } catch (err) {
        toast.error('حدث خطأ أثناء إضافة الموظف');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden dir-rtl">
      {/* Backdrop for closing drawer */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sliding Side Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300 border-r border-slate-200">
        {/* Drawer Header */}
        <div className="bg-gradient-to-r from-[#261928] via-[#714B67] to-[#3a2234] text-white p-4 flex items-center justify-between border-b border-purple-900/50 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 font-black flex items-center justify-center shadow-md">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Aysed HR Copilot</span>
                <span className="text-[9px] bg-amber-400 text-purple-950 px-1.5 py-0.5 rounded-full font-black">Executive AI</span>
              </h3>
              <p className="text-[10px] text-purple-200">مساعدك الذكي لتنفيذ الأوامر وإضافة الموظفين بالذكاء الاصطناعي</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق النافذة الجانبية"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                msg.sender === 'user' ? 'bg-[#714B67] text-white' : 'bg-amber-400 text-purple-950'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs ${
                msg.sender === 'user'
                  ? 'bg-[#714B67] text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </p>

                {msg.action && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-900 via-[#714B67] to-slate-900 text-white rounded-xl border border-amber-400/50 shadow-lg flex flex-col items-start gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-purple-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        {msg.action.type === 'CREATE_EMPLOYEE' ? '👤' : '⚡'}
                      </div>
                      <div>
                        <div className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                          {msg.action.type === 'CREATE_EMPLOYEE' ? 'إضافة موظف جديد آلياً' : 'إجراء تنفيذي آلي جاهز'}
                        </div>
                        <div className="text-xs font-bold text-white">{msg.action.title}</div>
                      </div>
                    </div>

                    {msg.action.employeeData && (
                      <div className="w-full bg-black/30 rounded-lg p-2.5 text-[11px] space-y-1 border border-white/10 my-1">
                        <div className="flex justify-between"><span className="text-purple-300">الاسم:</span> <span className="font-bold">{msg.action.employeeData.nameAr || 'غير محدد'}</span></div>
                        {msg.action.employeeData.civilId && <div className="flex justify-between"><span className="text-purple-300">الرقم المدني:</span> <span className="font-mono text-amber-300 font-bold">{msg.action.employeeData.civilId}</span></div>}
                        {msg.action.employeeData.jobTitle && <div className="flex justify-between"><span className="text-purple-300">الوظيفة:</span> <span>{msg.action.employeeData.jobTitle}</span></div>}
                        {msg.action.employeeData.department && <div className="flex justify-between"><span className="text-purple-300">القسم:</span> <span>{msg.action.employeeData.department}</span></div>}
                        {msg.action.employeeData.basicSalary && <div className="flex justify-between"><span className="text-purple-300">الراتب الأساسي:</span> <span className="text-emerald-400 font-bold">{msg.action.employeeData.basicSalary} د.ك</span></div>}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExecuteAction(msg.action!)}
                      className="w-full px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 font-extrabold text-xs rounded-lg shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>
                        {msg.action.type === 'CREATE_EMPLOYEE' ? '👤 اعتماد وإضافة الموظف للنظام الآن' : '🚀 تنفيذ الإجراء وإغلاق المساعد'}
                      </span>
                    </button>
                  </div>
                )}

                <span className={`text-[9px] block mt-1 font-medium ${msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs bg-white p-3 rounded-xl border border-slate-200 w-fit">
              <span className="animate-spin text-amber-600">⏳</span>
              <span>جاري المعالجة وتنفيذ الذكاء الاصطناعي...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Commands Bar */}
        <div className="p-2.5 bg-purple-50/50 border-t border-purple-100 overflow-x-auto whitespace-nowrap scrollbar-thin">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-purple-800 font-bold shrink-0">أوامر سريعة:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-white hover:bg-purple-700 hover:text-white text-purple-900 border border-purple-200 rounded-full text-[10px] font-semibold transition cursor-pointer shadow-2xs shrink-0"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Footer Input */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أمرك هنا (مثال: ضيف موظف اسمه أحمد الكندري...)"
              className="flex-1 text-xs bg-slate-100 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3.5 py-2.5 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
