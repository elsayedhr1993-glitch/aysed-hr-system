import React, { useState } from 'react';
import { 
  Users, CalendarDays, CreditCard, Fingerprint, ShieldCheck, 
  FileCheck, Settings, PlusCircle, CheckCircle2, Clock, 
  Trash2, Eye, X, Calculator, Plane, Package, DollarSign, 
  AlertTriangle, FolderKanban, Scan, Download, RefreshCw
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export const OdooFullEnterpriseHub: React.FC = () => {
  const { activeCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<'employees' | 'leaves' | 'payroll' | 'operations' | 'guards' | 'docs'>('employees');

  // --- 1. MODALS STATE ---
  const [modalType, setModalType] = useState<string | null>(null);

  // --- 2. DATA STATES (DYNAMIC) ---
  const [employees, setEmployees] = useState([
    { id: 'EMP-001', name: 'أحمد محمود الكندري', civilId: '290010112345', job: 'مدير الموارد البشرية', dept: 'الإدارة العامة', salary: 1650, status: 'نشط' },
    { id: 'EMP-002', name: 'محمد إبراهيم السيد', civilId: '288050498765', job: 'أخصائي شؤون إدارية', dept: 'الموارد البشرية', salary: 850, status: 'نشط' }
  ]);

  const [leaves, setLeaves] = useState([
    { id: 'LV-01', empName: 'محمد إبراهيم السيد', type: 'إجازة سنوية', from: '2026-09-01', to: '2026-09-30', days: 30, status: 'approved' }
  ]);

  const [custodies, setCustodies] = useState([
    { id: 'CUST-01', empName: 'أحمد محمود الكندري', item: 'MacBook Pro M3', serial: 'SN-884920', date: '2025-01-10' }
  ]);

  const [loans, setLoans] = useState([
    { id: 'LN-01', empName: 'محمد إبراهيم السيد', total: 600, installment: 100, remaining: 400 }
  ]);

  const [warnings, setWarnings] = useState([
    { id: 'WRN-01', empName: 'محمد إبراهيم السيد', type: 'إنذار كتابي', reason: 'تأخير متكرر', penalty: 'خصم أجر يوم' }
  ]);

  const [guards, setGuards] = useState([
    { id: 'SEC-01', name: 'سعد جابر العنزي', location: 'المقر الطبي الرئيسي', shift: 'وردية ليلية (10م - 6ص)', phone: '+965 99441122' }
  ]);

  const [docs, setDocs] = useState([
    { id: 'DOC-01', title: 'السجل التجاري الرئيسي', issuer: 'وزارة التجارة', expiry: '2027-05-09', status: 'valid' }
  ]);

  // Temporary Input Form States
  const [formData, setFormData] = useState<any>({});

  // Universal Form Submit Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'new_emp') {
      const newEmp = {
        id: `EMP-00${employees.length + 1}`,
        name: formData.name || 'موظف جديد',
        civilId: formData.civilId || '290000000000',
        job: formData.job || 'موظف',
        dept: formData.dept || 'الإدارة',
        salary: Number(formData.salary) || 500,
        status: 'نشط'
      };
      setEmployees([newEmp, ...employees]);
    } else if (modalType === 'new_leave') {
      const newLv = {
        id: `LV-0${leaves.length + 1}`,
        empName: formData.empName || (employees.length > 0 ? employees[0].name : 'محمد إبراهيم السيد'),
        type: formData.type || 'إجازة سنوية',
        from: formData.from || '2026-09-10',
        to: formData.to || '2026-09-25',
        days: Number(formData.days) || 15,
        status: 'approved'
      };
      setLeaves([newLv, ...leaves]);
    } else if (modalType === 'new_custody') {
      const newC = {
        id: `CUST-0${custodies.length + 1}`,
        empName: formData.empName || (employees.length > 0 ? employees[0].name : 'أحمد محمود الكندري'),
        item: formData.item || 'عهدة عامة',
        serial: formData.serial || 'SN-N/A',
        date: new Date().toISOString().split('T')[0]
      };
      setCustodies([newC, ...custodies]);
    } else if (modalType === 'new_loan') {
      const total = Number(formData.total) || 300;
      const inst = Number(formData.installment) || total / 3;
      const newL = {
        id: `LN-0${loans.length + 1}`,
        empName: formData.empName || (employees.length > 0 ? employees[0].name : 'محمد إبراهيم السيد'),
        total,
        installment: inst,
        remaining: total
      };
      setLoans([newL, ...loans]);
    } else if (modalType === 'new_guard') {
      const newG = {
        id: `SEC-0${guards.length + 1}`,
        name: formData.name || 'حارس أمن',
        location: formData.location || 'المقر الرئيسي',
        shift: formData.shift || 'وردية صباحية',
        phone: formData.phone || '+965 99000000'
      };
      setGuards([newG, ...guards]);
    } else if (modalType === 'new_doc') {
      const newD = {
        id: `DOC-0${docs.length + 1}`,
        title: formData.title || 'ترخيص جديد',
        issuer: formData.issuer || 'وزارة الشؤون',
        expiry: formData.expiry || '2027-01-01',
        status: 'valid'
      };
      setDocs([newD, ...docs]);
    }

    setModalType(null);
    setFormData({});
  };

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Navigation Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex gap-1.5 text-xs font-bold">
          {[
            { id: 'employees', label: 'الموظفون', icon: Users },
            { id: 'leaves', label: 'الإجازات والأرصدة', icon: CalendarDays },
            { id: 'operations', label: 'العهد والسلف والإنذارات', icon: Package },
            { id: 'guards', label: 'الأمن والورديات', icon: ShieldCheck },
            { id: 'docs', label: 'مستندات المؤسسة', icon: FolderKanban }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === t.id ? 'bg-[#714B67] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. تبويب الموظفين */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">سجل الموظفين النشطين</h3>
            <button 
              type="button"
              onClick={() => { setModalType('new_emp'); setFormData({}); }}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={14} /> إضافة موظف جديد
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 font-bold border-b">
              <tr>
                <th className="p-3">المعرف</th>
                <th className="p-3">الاسم الكامل</th>
                <th className="p-3">الرقم المدني</th>
                <th className="p-3">المسمى والوظيفة</th>
                <th className="p-3">الراتب الشامل</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono text-slate-400 font-bold">{e.id}</td>
                  <td className="p-3 font-bold text-slate-900">{e.name}</td>
                  <td className="p-3 font-mono">{e.civilId}</td>
                  <td className="p-3">{e.job} - {e.dept}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{e.salary.toFixed(3)} د.ك</td>
                  <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">نشط</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. تبويب الإجازات وتسوية المادة 71 */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">طلبات الإجازات وتسوية الراتب المسبق (مادة 71)</h3>
            <button 
              type="button"
              onClick={() => { setModalType('new_leave'); setFormData({}); }}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={14} /> طلب إجازة جديد
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 font-bold border-b">
              <tr>
                <th className="p-3">الموظف</th>
                <th className="p-3">نوع الإجازة</th>
                <th className="p-3">الفترة</th>
                <th className="p-3">المدة</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراءات التسوية</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaves.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-bold">{l.empName}</td>
                  <td className="p-3">{l.type}</td>
                  <td className="p-3 font-mono">{l.from} إلى {l.to}</td>
                  <td className="p-3 font-bold">{l.days} يوم</td>
                  <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">معتمدة</span></td>
                  <td className="p-3 text-center">
                    <button 
                      type="button"
                      onClick={() => alert(`تم إصدار وتأكيد سند صرف راتب الإجازة مقدماً للموظف ${l.empName} وفق المادة 71 وتوجيهه إلى مسير الرواتب WPS`)}
                      className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-2.5 py-1 rounded text-[10px] font-bold shadow-2xs cursor-pointer"
                    >
                      صرف المستحقات ✈️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. تبويب العمليات والعهد والسلف */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm">سجل العهد والسلف المالية</h4>
              <p className="text-xs text-slate-400">إضافة وتتبع العهد والأقساط المستقطعة شهرياً</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setModalType('new_custody'); setFormData({}); }} className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                + تسليم عهدة
              </button>
              <button type="button" onClick={() => { setModalType('new_loan'); setFormData({}); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                + إضافة سلفة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <h5 className="font-bold text-xs mb-3 border-b pb-2">العهد العينية المسلمة:</h5>
              <div className="space-y-2 text-xs">
                {custodies.map(c => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-bold">{c.empName}</div>
                      <div className="text-[11px] text-slate-500">{c.item} ({c.serial})</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{c.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4 shadow-sm">
              <h5 className="font-bold text-xs mb-3 border-b pb-2">السلف الجاري خصمها:</h5>
              <div className="space-y-2 text-xs">
                {loans.map(ln => (
                  <div key={ln.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-bold">{ln.empName}</div>
                      <div className="text-[11px] text-blue-600">قسط: {ln.installment} د.ك / شهر</div>
                    </div>
                    <div className="font-mono font-bold text-rose-600">{ln.remaining} د.ك متبقي</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. تبويب الحراس والورديات */}
      {activeTab === 'guards' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">سجل حراس الأمن والورديات الليلية</h3>
            <button 
              type="button"
              onClick={() => { setModalType('new_guard'); setFormData({}); }}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={14} /> تعيين حارس أمن
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 font-bold border-b">
              <tr>
                <th className="p-3">المعرف</th>
                <th className="p-3">اسم الحارس</th>
                <th className="p-3">الموقع الأمني</th>
                <th className="p-3">الوردية والتوقيت</th>
                <th className="p-3">الهاتف</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {guards.map(g => (
                <tr key={g.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono font-bold text-slate-400">{g.id}</td>
                  <td className="p-3 font-bold">{g.name}</td>
                  <td className="p-3">{g.location}</td>
                  <td className="p-3 font-semibold text-purple-900">{g.shift}</td>
                  <td className="p-3 font-mono">{g.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. تبويب مستندات وتراخيص المؤسسة */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">وثائق وتراخيص المنشأة</h3>
            <button 
              type="button"
              onClick={() => { setModalType('new_doc'); setFormData({}); }}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle size={14} /> توثيق ترخيص / مستند
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 font-bold border-b">
              <tr>
                <th className="p-3">اسم المستند</th>
                <th className="p-3">الجهة المصدرة</th>
                <th className="p-3">تاريخ الانتهاء</th>
                <th className="p-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-bold">{d.title}</td>
                  <td className="p-3">{d.issuer}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{d.expiry}</td>
                  <td className="p-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">سارٍ ومطابق</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DYNAMIC MODAL ENGINE (تعمل مع كل الأزرار فورياً) --- */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border text-xs">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                {modalType === 'new_emp' && 'إضافة موظف جديد للمنشأة'}
                {modalType === 'new_leave' && 'تقديم طلب إجازة موظف'}
                {modalType === 'new_custody' && 'تسليم عهدة وأصل'}
                {modalType === 'new_loan' && 'إضافة سلفة وخصم شهري'}
                {modalType === 'new_guard' && 'تعيين حارس أمن جديد'}
                {modalType === 'new_doc' && 'إضافة ترخيص ومستند مؤسسة'}
              </h3>
              <button type="button" onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Form Inputs based on Action */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم / العنوان *</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل الاسم أو البيان..."
                  value={formData.name || formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                />
              </div>

              {modalType === 'new_emp' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الرقم المدني (Civil ID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="290000000000"
                      value={formData.civilId || ''}
                      onChange={(e) => setFormData({ ...formData, civilId: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
                      <input
                        type="text"
                        placeholder="محاسب / فني"
                        value={formData.job || ''}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الراتب الشامل (د.ك)</label>
                      <input
                        type="number"
                        placeholder="850"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="w-full p-2.5 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'new_custody' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بيان العهدة والسيريال *</label>
                  <input
                    type="text"
                    required
                    placeholder="لابتوب - هاتف - مفاتيح"
                    value={formData.item || ''}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full p-2.5 border rounded-lg mb-2 outline-none focus:border-[#714B67]"
                  />
                  <input
                    type="text"
                    placeholder="الرقم التسلسلي S/N"
                    value={formData.serial || ''}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
              )}

              {modalType === 'new_loan' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">مبلغ السلفة (د.ك)</label>
                    <input
                      type="number"
                      required
                      placeholder="600"
                      value={formData.total || ''}
                      onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono font-bold outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">القسط الشهري</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={formData.installment || ''}
                      onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>
              )}

              {modalType === 'new_guard' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الموقع المكلف به</label>
                    <input
                      type="text"
                      placeholder="المقر الطبي"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 border rounded-lg outline-none focus:border-[#714B67]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الهاتف</label>
                    <input
                      type="text"
                      placeholder="+965 99441122"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                    />
                  </div>
                </div>
              )}

              {modalType === 'new_doc' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry || ''}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full p-2.5 border rounded-lg font-mono outline-none focus:border-[#714B67]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setModalType(null)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-lg font-bold cursor-pointer">حفظ وتحديث النظام فوراً</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OdooFullEnterpriseHub;
