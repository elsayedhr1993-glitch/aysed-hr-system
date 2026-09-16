import React, { useState } from 'react';
import { UserCheck, Search, Plus, Check, Clock, Calendar, AlertTriangle, Printer, Trash2 } from 'lucide-react';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';
import toast from 'react-hot-toast';

interface ResumptionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'NEW_JOIN' | 'RETURN_ANNUAL' | 'RETURN_SICK' | 'RETURN_UNPAID';
  resumptionDate: string;
  status: 'draft' | 'approved';
  notes: string;
}

export const OdooWorkResumptionApp: React.FC = () => {
  const { employees } = useOdooHierarchy();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Local state for resumption records (in production, synchronized via db/context)
  const [records, setRecords] = useState<ResumptionRecord[]>([]);

  // Form state
  const [newRecord, setNewRecord] = useState({
    employeeId: employees[0]?.id || '',
    type: 'RETURN_ANNUAL' as ResumptionRecord['type'],
    resumptionDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === newRecord.employeeId);
    if (!emp) return;

    const nextId = `RES-2026-00${records.length + 1}`;
    const record: ResumptionRecord = {
      id: nextId,
      employeeId: newRecord.employeeId,
      employeeName: emp.name,
      type: newRecord.type,
      resumptionDate: newRecord.resumptionDate,
      status: 'draft',
      notes: newRecord.notes
    };

    setRecords([record, ...records]);
    setShowAddModal(false);
    setNewRecord({
      employeeId: employees[0]?.id || '',
      type: 'RETURN_ANNUAL',
      resumptionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    toast.success('تم قيد طلب مباشرة العمل بنجاح (وضع المسودة).');
  };

  const handleApprove = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'approved' as const } : r));
    toast.success('تم اعتماد كتاب مباشرة العمل رسمياً وتحديث حالة الملف.');
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast.error('تم إلغاء قيد مباشرة العمل.');
  };

  const getTypeLabel = (type: ResumptionRecord['type']) => {
    switch (type) {
      case 'NEW_JOIN': return 'مباشرة أول مرة (تعيين جديد)';
      case 'RETURN_ANNUAL': return 'عودة من إجازة دورية';
      case 'RETURN_SICK': return 'عودة من إجازة مرضية';
      case 'RETURN_UNPAID': return 'عودة من إجازة غير مدفوعة الأجر';
    }
  };

  const filteredRecords = records.filter(r => 
    r.employeeName.includes(searchTerm) || r.id.includes(searchTerm) || r.notes.includes(searchTerm)
  );

  const pendingCount = records.filter(r => r.status === 'draft').length;
  const approvedCount = records.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">مباشرة العمل واستئناف العودة (hr.resumption)</h1>
            <p className="text-xs text-slate-500 font-medium">قيد وتوثيق تاريخ مباشرة العمل الفعلي للموظفين الجدد أو العائدين من الإجازات الرسمية</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#714B67] hover:bg-[#714B67]/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Plus size={15} /> قيد كتاب مباشرة جديد
        </button>
      </div>

      {/* 2. KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">مباشرات معلقة (مسودة)</span>
            <span className="text-base font-black text-amber-600 font-mono">{pendingCount} طلبات</span>
          </div>
          <Clock className="text-amber-500 w-5 h-5 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">مباشرات معتمدة رسمياً</span>
            <span className="text-base font-black text-emerald-600 font-mono">{approvedCount} موثقة</span>
          </div>
          <Check className="text-emerald-500 w-5 h-5 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-bold">إجمالي حركات الربع الحالي</span>
            <span className="text-base font-black text-[#714B67] font-mono">{records.length} حركة</span>
          </div>
          <Calendar className="text-[#714B67] w-5 h-5 opacity-80" />
        </div>
      </div>

      {/* 3. Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs font-bold">
        <span className="text-slate-500 text-[11px]">سجلات الحضور وتوقيت المباشرة بعد العودة من الإجازات الرسمية للقطاع الطبي والأهلي</span>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-2.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث باسم الموظف أو رقم المعاملة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
          />
        </div>
      </div>

      {/* 4. Resumption Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="p-3.5">كود المعاملة</th>
                <th className="p-3.5">اسم الموظف / الرمز</th>
                <th className="p-3.5">تصنيف المباشرة</th>
                <th className="p-3.5 font-mono">تاريخ المباشرة الفعلي</th>
                <th className="p-3.5 max-w-xs">ملاحظات وشهود المباشرة</th>
                <th className="p-3.5 text-center">الحالة الإدارية</th>
                <th className="p-3.5 text-center">الإجراءات والاعتماد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3.5 font-mono font-bold text-[#714B67]">{r.id}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">{r.employeeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{r.employeeId}</span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">{getTypeLabel(r.type)}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-800">{r.resumptionDate}</td>
                  <td className="p-3.5 max-w-xs text-slate-500 truncate" title={r.notes}>{r.notes}</td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.status === 'approved' ? 'معتمدة رسمياً' : 'مسودة معلقة'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex gap-1.5 justify-center">
                      {r.status === 'draft' && (
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Check size={12} /> اعتماد المباشرة
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded transition cursor-pointer"
                        title="حذف القيد"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="text-[#714B67]" size={18} />
                قيد كتاب مباشرة عمل جديد (hr.resumption)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الموظف *</label>
                <select
                  required
                  value={newRecord.employeeId}
                  onChange={(e) => setNewRecord({ ...newRecord, employeeId: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف المباشرة والاستئناف *</label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as ResumptionRecord['type'] })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                >
                  <option value="RETURN_ANNUAL">عودة من إجازة دورية سنوية</option>
                  <option value="NEW_JOIN">تعيين ومباشرة عمل لأول مرة</option>
                  <option value="RETURN_SICK">عودة من إجازة مرضية طويلة</option>
                  <option value="RETURN_UNPAID">عودة من إجازة خاصة (بدون راتب)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المباشرة الفعلية بالعمل *</label>
                <input
                  type="date"
                  required
                  value={newRecord.resumptionDate}
                  onChange={(e) => setNewRecord({ ...newRecord, resumptionDate: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات واعتبارات إدارية</label>
                <textarea
                  rows={3}
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="مثال: تمت مباشرة العمل في التوقيت الصباحي المعتاد وتم إخطار قسم الرواتب لاستئناف احتساب الدوام..."
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#714B67] text-white font-bold transition shadow-sm">حفظ ومسودة</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooWorkResumptionApp;
