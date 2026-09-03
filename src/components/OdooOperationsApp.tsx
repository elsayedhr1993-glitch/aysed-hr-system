import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  X,
  Trash2
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy } from '../context/OdooHierarchyContext';

export const OdooOperationsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();

  const [showCustodyModal, setShowCustodyModal] = useState(false);

  // Form states
  const [newCustody, setNewCustody] = useState({
    employeeName: '',
    itemType: '',
    serialNumber: '',
    handoverDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 1. بيانات العهد العينية (Custodies)
  const [custodies, setCustodies] = useState<any[]>([]);

  const handleAddCustody = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CUST-00${custodies.length + 1}`;
    setCustodies([
      ...custodies,
      { ...newCustody, id: newId, status: 'active' }
    ]);
    setShowCustodyModal(false);
    setNewCustody({
      employeeName: '',
      itemType: '',
      serialNumber: '',
      handoverDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleDeleteCustody = (id: string) => {
    if (confirm('هل أنت متأكد من مسح أو إخلاء طرف هذه العهدة؟')) {
      setCustodies(custodies.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. ODOO CONTROL PANEL & HEADER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Breadcrumbs & Navigation */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>العمليات والمعدات</span>
            <span>/</span>
            <span className="text-[#714B67] font-black">العهد والمعدات المخصصة للموظفين (Custodies & Equipments)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package className="text-[#714B67]" size={22} />
            العهد والمعدات (Equipments)
          </h1>
          <p className="text-[11px] text-slate-500">
            المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'المؤسسة الطبية'}</strong> | تتبع أصول الشركة والمعدات المخصصة للموظفين.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCustodyModal(true)}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle size={16} /> تسجيل عهدة جديدة
          </button>
        </div>
      </div>

      {/* Tab 1: العهد والمعدات */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-800">الأصول والعهد العينية المسلمة للموظفين</h3>
        </div>
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">رقم العهدة</th>
              <th className="p-3.5">اسم الموظف</th>
              <th className="p-3.5">نوع واسم العهدة</th>
              <th className="p-3.5">الرقم التسلسلي / الكود</th>
              <th className="p-3.5">تاريخ التسليم</th>
              <th className="p-3.5">ملاحظات</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {custodies.map((custody) => (
              <tr key={custody.id} className="hover:bg-slate-50/70 transition">
                <td className="p-3.5 font-mono font-bold text-slate-500">{custody.id}</td>
                <td className="p-3.5 font-bold text-slate-900">{custody.employeeName}</td>
                <td className="p-3.5 text-slate-800 font-bold">{custody.itemType}</td>
                <td className="p-3.5 font-mono text-slate-600">{custody.serialNumber}</td>
                <td className="p-3.5 font-mono text-slate-600">{custody.handoverDate}</td>
                <td className="p-3.5 text-slate-600 truncate max-w-[150px]">{custody.notes}</td>
                <td className="p-3.5">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    مسلمة (نشط)
                  </span>
                </td>
                <td className="p-3.5">
                  <button onClick={() => handleDeleteCustody(custody.id)} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 rounded-md transition font-bold text-[10px] cursor-pointer">
                    إخلاء طرف (تسليم)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}
      {showCustodyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package className="text-[#714B67]" size={18} />
                تسجيل استلام عهدة / أصل جديد
              </h3>
              <button onClick={() => setShowCustodyModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustody} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الموظف المستلم</label>
                <select
                  required
                  value={newCustody.employeeName}
                  onChange={(e) => setNewCustody({ ...newCustody, employeeName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                >
                  <option value="">-- اختر الموظف --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.jobTitle})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم/نوع العهدة (جهاز، سيارة، خط هاتف...)</label>
                <input
                  type="text"
                  required
                  value={newCustody.itemType}
                  onChange={(e) => setNewCustody({ ...newCustody, itemType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">الرقم التسلسلي / الباركود</label>
                <input
                  type="text"
                  required
                  value={newCustody.serialNumber}
                  onChange={(e) => setNewCustody({ ...newCustody, serialNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ الاستلام الفعلي</label>
                <input
                  type="date"
                  required
                  value={newCustody.handoverDate}
                  onChange={(e) => setNewCustody({ ...newCustody, handoverDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">ملاحظات وحالة العهدة عند التسليم</label>
                <textarea
                  value={newCustody.notes}
                  onChange={(e) => setNewCustody({ ...newCustody, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] transition-all"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowCustodyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl font-bold cursor-pointer transition shadow-sm"
                >
                  حفظ وتسجيل الاستلام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdooOperationsApp;
