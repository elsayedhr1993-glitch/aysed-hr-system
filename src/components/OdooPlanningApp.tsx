import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CalendarDays,
  Plus, 
  Clock, 
  Save, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft,
  Users,
  Building2,
  Copy,
  AlertCircle,
  Filter,
  MoreHorizontal
, X} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import { toast } from 'react-hot-toast';

// Helper for dates
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const getDayName = (date: Date) => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
};

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface AssignedShift {
  id: string;
  employeeId: string;
  date: string;
  templateId: string;
}

const DEFAULT_TEMPLATES: ShiftTemplate[] = [
  { id: 'T1', name: 'صباحي (العيادة)', startTime: '08:00', endTime: '16:00', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'T2', name: 'مسائي (طوارئ)', startTime: '16:00', endTime: '00:00', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'T3', name: 'ليلي (مبيّت)', startTime: '00:00', endTime: '08:00', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'T4', name: 'إداري عام', startTime: '09:00', endTime: '17:00', color: 'bg-amber-100 text-amber-800 border-amber-300' },
];

export const OdooPlanningApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const day = today.getDay(); // 0 is Sunday
    return addDays(today, -day); // Start on Sunday
  });

  const [templates, setTemplates] = useState<ShiftTemplate[]>(DEFAULT_TEMPLATES);
  const [assignedShifts, setAssignedShifts] = useState<AssignedShift[]>([
    { id: 'S1', employeeId: employees[0]?.id || '1', date: formatDate(new Date()), templateId: 'T1' },
    { id: 'S2', employeeId: employees[1]?.id || '2', date: formatDate(new Date()), templateId: 'T2' }
  ]);

  const [activeTab, setActiveTab] = useState<'GANTT' | 'TEMPLATES'>('GANTT');
  
  // New assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{empId: string, date: string} | null>(null);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplStartTime, setTplStartTime] = useState('09:00');
  const [tplEndTime, setTplEndTime] = useState('17:00');
  const [tplColor, setTplColor] = useState('bg-emerald-100 text-emerald-800 border-emerald-300');

  const handleOpenAddTemplate = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplStartTime('09:00');
    setTplEndTime('17:00');
    setTplColor('bg-emerald-100 text-emerald-800 border-emerald-300');
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (tpl: ShiftTemplate) => {
    setEditingTemplate(tpl);
    setTplName(tpl.name);
    setTplStartTime(tpl.startTime);
    setTplEndTime(tpl.endTime);
    setTplColor(tpl.color);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!tplName.trim()) {
      toast.error('يرجى إدخال اسم القالب');
      return;
    }
    if (!tplStartTime || !tplEndTime) {
      toast.error('يرجى تحديد وقت البدء ووقت الانتهاء');
      return;
    }

    if (editingTemplate) {
      // Edit
      setTemplates(templates.map(t => t.id === editingTemplate.id ? {
        ...t,
        name: tplName.trim(),
        startTime: tplStartTime,
        endTime: tplEndTime,
        color: tplColor
      } : t));
      toast.success('تم تعديل قالب الشفت بنجاح');
    } else {
      // Add
      const newId = `T-${Date.now()}`;
      setTemplates([...templates, {
        id: newId,
        name: tplName.trim(),
        startTime: tplStartTime,
        endTime: tplEndTime,
        color: tplColor
      }]);
      toast.success('تمت إضافة قالب الشفت الجديد بنجاح');
    }
    setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (id: string) => {
    // Check if being used
    const isUsed = assignedShifts.some(s => s.templateId === id);
    if (isUsed) {
      toast.error('لا يمكن حذف هذا القالب لأنه مستخدم حالياً في شفتات الموظفين');
      return;
    }
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('تم حذف قالب الشفت');
    setShowTemplateModal(false);
  };
  
  const weekDates = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const handleNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const handlePrevWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const handleToday = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    setCurrentWeekStart(addDays(today, -today.getDay()));
  };

  const handleCellClick = (empId: string, date: string) => {
    setSelectedCell({ empId, date });
    setShowAssignModal(true);
  };

  const handleAssignShift = (templateId: string) => {
    if (selectedCell) {
      // Check if already assigned
      const existingIdx = assignedShifts.findIndex(s => s.employeeId === selectedCell.empId && s.date === selectedCell.date);
      if (existingIdx >= 0) {
        // Update
        const newShifts = [...assignedShifts];
        newShifts[existingIdx].templateId = templateId;
        setAssignedShifts(newShifts);
      } else {
        // Add
        setAssignedShifts([...assignedShifts, {
          id: `AS-${Date.now()}`,
          employeeId: selectedCell.empId,
          date: selectedCell.date,
          templateId
        }]);
      }
      setShowAssignModal(false);
      toast.success('تم تعيين الشفت بنجاح');
    }
  };

  const handleDeleteShift = (empId: string, date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignedShifts(assignedShifts.filter(s => !(s.employeeId === empId && s.date === date)));
    toast.success('تم حذف الشفت');
  };

  const copyPreviousWeek = () => {
    // Generate previous week dates
    const prevWeekDates = Array.from({length: 7}).map((_, i) => formatDate(addDays(currentWeekStart, i - 7)));
    
    // Find shifts from previous week
    const prevShifts = assignedShifts.filter(s => prevWeekDates.includes(s.date));
    
    // Map them to current week
    const newShifts = prevShifts.map(s => {
      const dateObj = new Date(s.date);
      const newDateObj = addDays(dateObj, 7);
      return {
        ...s,
        id: `AS-COPY-${Date.now()}-${Math.random()}`,
        date: formatDate(newDateObj)
      };
    });

    if (newShifts.length > 0) {
      // Filter out current week shifts to avoid duplicates, or just merge
      const currentWeekDates = weekDates.map(d => formatDate(d));
      const filteredExisting = assignedShifts.filter(s => !currentWeekDates.includes(s.date));
      
      setAssignedShifts([...filteredExisting, ...newShifts]);
      toast.success(`تم نسخ ${newShifts.length} شفت من الأسبوع الماضي`);
    } else {
      toast.error('لا توجد شفتات في الأسبوع الماضي لنسخها');
    }
  };

  const companyScopeName = activeCompany?.nameAr || 'الشركة والمنشأة الطبية';

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">تخطيط الشفتات (Odoo Planning)</h1>
            <p className="text-xs text-slate-500 font-medium">
              المنشأة: <strong className="text-[#714B67]">{companyScopeName}</strong> | جدولة وتوزيع نوبات العمل
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab('GANTT')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${activeTab === 'GANTT' ? 'bg-white text-[#714B67] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Calendar size={14} /> جدول التخطيط
            </button>
            <button
              onClick={() => setActiveTab('TEMPLATES')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${activeTab === 'TEMPLATES' ? 'bg-white text-[#714B67] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Clock size={14} /> قوالب الشفتات
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'GANTT' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={handleToday} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                اليوم
              </button>
              <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                <button onClick={handlePrevWeek} className="p-1.5 hover:bg-slate-100 text-slate-600 border-l border-slate-200 transition cursor-pointer">
                  <ChevronRight size={18} />
                </button>
                <div className="px-3 text-xs font-bold text-slate-700 min-w-[120px] text-center">
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </div>
                <button onClick={handleNextWeek} className="p-1.5 hover:bg-slate-100 text-slate-600 border-r border-slate-200 transition cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={copyPreviousWeek}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition cursor-pointer"
              >
                <Copy size={14} /> نسخ الأسبوع الماضي
              </button>
            </div>
          </div>

          {/* Matrix / Gantt */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100/50">
                  <th className="p-4 border-b border-l border-slate-200 font-black text-slate-700 w-48 sticky right-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">الموظف</th>
                  {weekDates.map(date => {
                    const isToday = formatDate(date) === formatDate(new Date());
                    return (
                      <th key={date.toISOString()} className={`p-3 border-b border-l border-slate-200 min-w-[140px] ${isToday ? 'bg-amber-50' : ''}`}>
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] font-bold ${isToday ? 'text-amber-700' : 'text-slate-500'}`}>{getDayName(date)}</span>
                          <span className={`text-base font-black ${isToday ? 'text-amber-900' : 'text-slate-800'} mt-1`}>
                            {date.getDate()} {date.toLocaleString('ar-KW', { month: 'short' })}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 group transition">
                    <td className="p-3 border-b border-l border-slate-200 sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-800 truncate" title={emp.name}>{emp.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{emp.jobTitle}</div>
                        </div>
                      </div>
                    </td>
                    
                    {weekDates.map(date => {
                      const dateStr = formatDate(date);
                      const shift = assignedShifts.find(s => s.employeeId === emp.id && s.date === dateStr);
                      const template = shift ? templates.find(t => t.id === shift.templateId) : null;
                      const isToday = dateStr === formatDate(new Date());
                      
                      return (
                        <td 
                          key={dateStr} 
                          className={`p-2 border-b border-l border-slate-200 relative group/cell cursor-pointer transition ${isToday ? 'bg-amber-50/30' : ''}`}
                          onClick={() => handleCellClick(emp.id, dateStr)}
                        >
                          <div className="absolute inset-0 group-hover/cell:bg-slate-100/50 transition m-[1px] rounded-lg border border-transparent group-hover/cell:border-slate-200 flex items-center justify-center">
                            {!template && (
                              <Plus className="opacity-0 group-hover/cell:opacity-100 text-slate-400 transition" size={16} />
                            )}
                          </div>
                          
                          {template && (
                            <div className={`relative z-10 p-2 rounded-lg border-2 ${template.color} shadow-sm flex flex-col gap-1 hover:shadow-md transition`}>
                              <div className="font-bold text-[10px] truncate leading-tight">{template.name}</div>
                              <div className="font-mono text-xs opacity-90">
                                {template.startTime} - {template.endTime}
                              </div>
                              <button 
                                onClick={(e) => handleDeleteShift(emp.id, dateStr, e)}
                                className="absolute top-1 left-1 opacity-0 group-hover/cell:opacity-100 text-rose-500 hover:text-rose-700 bg-white/80 rounded-full p-0.5 transition cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      <Users size={32} className="mx-auto mb-3 opacity-20" />
                      <div className="font-bold">لا يوجد موظفين في السجل</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TEMPLATES' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Clock className="text-[#714B67]" /> قوالب الشفتات (Shift Templates)
            </h3>
            <button 
              onClick={handleOpenAddTemplate}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> إضافة قالب جديد
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map(tpl => (
              <div key={tpl.id} className={`p-4 rounded-xl border-2 transition hover:shadow-md flex flex-col justify-between ${tpl.color}`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-sm">{tpl.name}</h4>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="p-1 hover:bg-black/5 rounded text-slate-700 transition"
                        title="تعديل القالب"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="p-1 hover:bg-rose-100 rounded text-rose-600 transition"
                        title="حذف القالب"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-lg">
                    <span>{tpl.startTime}</span>
                    <ArrowLeft size={14} className="opacity-50" />
                    <span>{tpl.endTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-slate-800">تعيين شفت</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-sm font-bold text-slate-600 mb-4">
                الموظف: <span className="text-[#714B67]">{employees.find(e => e.id === selectedCell.empId)?.name}</span><br/>
                التاريخ: <span className="font-mono">{selectedCell.date}</span>
              </div>
              
              <div className="space-y-2">
                {templates.map(tpl => (
                  <button 
                    key={tpl.id}
                    onClick={() => handleAssignShift(tpl.id)}
                    className={`w-full text-right p-3 rounded-xl border-2 transition cursor-pointer hover:shadow-sm ${tpl.color}`}
                  >
                    <div className="font-bold text-sm">{tpl.name}</div>
                    <div className="text-xs font-mono mt-1 opacity-90">{tpl.startTime} - {tpl.endTime}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Create/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-slate-800">
                {editingTemplate ? 'تعديل قالب الشفت' : 'إضافة قالب شفت جديد'}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم قالب الشفت (مثال: صباحي العيادة)</label>
                <input 
                  type="text"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#714B67] transition font-medium"
                  placeholder="مثال: الشفت الصباحي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">وقت البدء (In)</label>
                  <input 
                    type="time"
                    value={tplStartTime}
                    onChange={(e) => setTplStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#714B67] transition font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">وقت الانتهاء (Out)</label>
                  <input 
                    type="time"
                    value={tplEndTime}
                    onChange={(e) => setTplEndTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#714B67] transition font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">النمط اللوني المخصص لتمييز الشفت</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'أخضر (صباحي)' },
                    { value: 'bg-blue-100 text-blue-800 border-blue-300', label: 'أزرق (مسائي)' },
                    { value: 'bg-purple-100 text-purple-800 border-purple-300', label: 'بنفسجي (ليلي)' },
                    { value: 'bg-amber-100 text-amber-800 border-amber-300', label: 'أصفر (إداري)' },
                    { value: 'bg-rose-100 text-rose-800 border-rose-300', label: 'أحمر (طوارئ)' },
                    { value: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: 'نيلي (مخصص)' },
                  ].map(colorOpt => (
                    <button
                      key={colorOpt.value}
                      onClick={() => setTplColor(colorOpt.value)}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center transition ${colorOpt.value} ${tplColor === colorOpt.value ? 'ring-2 ring-offset-1 ring-[#714B67]' : 'opacity-80 hover:opacity-100'}`}
                    >
                      {colorOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-[#714B67] hover:bg-[#5e3d55] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition"
              >
                حفظ القالب
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooPlanningApp;
