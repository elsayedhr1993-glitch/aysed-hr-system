import React, { useState } from 'react';
import { CommencementData, printCommencementReport } from '../services/commencementService';
import { useCompany } from '../context/CompanyContext';

interface CommencementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CommencementData) => void;
  employeeList: Array<{ id: string; nameAr: string; civilId: string; dept: string; jobTitle: string; hireDate: string; mohLicense?: string }>;
}

export default function OdooCommencementModal({ isOpen, onClose, onSave, employeeList }: CommencementModalProps) {
  const { activeCompany } = useCompany();
  const [activeTab, setActiveTab] = useState<'details' | 'credentials' | 'approvals'>('details');
  const [status, setStatus] = useState<'draft' | 'approved' | 'cancelled'>('draft');

  // البيانات
  const [refNo] = useState(`COM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedEmpId, setSelectedEmpId] = useState(employeeList[0]?.id || '');
  const [commencementDate, setCommencementDate] = useState(new Date().toISOString().slice(0, 10));
  const [mohLicenseType, setMohLicenseType] = useState<'دائم (Permanent)' | 'مؤقت / تحت الإجراء (Temporary)'>('دائم (Permanent)');
  const [medicalFitness, setMedicalFitness] = useState<'لائق طبياً (Fit)' | 'قيد الفحص (Pending)'>('لائق طبياً (Fit)');
  const [criminalRecord, setCriminalRecord] = useState<'خلو سوابق معتمد (Cleared)' | 'قيد الإجراء (Pending)'>('خلو سوابق معتمد (Cleared)');
  const [supervisor, setSupervisor] = useState((activeCompany as any)?.authorizedSignatory || (activeCompany as any)?.managerName || 'المسؤول المباشر');
  const [notes, setNotes] = useState('باشر الموظف مهام عمله واستلم بطاقة الدخول وباشر مسؤولياته التعاقدية.');

  if (!isOpen) return null;

  const currentEmp = employeeList.find(e => e.id === selectedEmpId) || employeeList[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CommencementData = {
      id: `COMM-${Date.now()}`,
      referenceNo: refNo,
      companyName: activeCompany?.nameAr || activeCompany?.name || 'المنشأة',
      employeeId: currentEmp?.id || '',
      employeeNameAr: currentEmp?.nameAr || '',
      civilId: currentEmp?.civilId || '',
      jobTitleAr: currentEmp?.jobTitle || '',
      departmentAr: currentEmp?.dept || '',
      commencementDate,
      contractStartDate: currentEmp?.hireDate || commencementDate,
      mohLicenseNo: currentEmp?.mohLicense || '',
      mohLicenseType,
      medicalFitnessStatus: medicalFitness,
      criminalRecordStatus: criminalRecord,
      supervisorName: supervisor,
      notes,
      state: status
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* الترويسة وشريط الحالات */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-bold text-sm">مباشرة العمل /</span>
            <span className="text-slate-700 font-bold text-sm">{refNo}</span>
          </div>

          <div className="flex items-center bg-slate-200/70 p-1 rounded-lg gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`px-3 py-1 rounded-md transition ${status === 'draft' ? 'bg-white text-purple-950 shadow-sm' : 'text-slate-600'}`}
            >
              مسودة (Draft)
            </button>
            <button
              type="button"
              onClick={() => setStatus('approved')}
              className={`px-3 py-1 rounded-md transition ${status === 'approved' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600'}`}
            >
              معتمد ومباشر (Approved)
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
          
          {/* المنطقة العلوية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">الموظف المعني <span className="text-rose-500">*</span></label>
              <select 
                value={selectedEmpId} 
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
              >
                {employeeList.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nameAr} — ({emp.jobTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">تاريخ المباشرة الفعلي <span className="text-rose-500">*</span></label>
              <input 
                type="date" 
                value={commencementDate} 
                onChange={(e) => setCommencementDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-purple-900"
                required
              />
            </div>
          </div>

          {/* تبويبات أودو */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-4 font-bold border-b-2 ${activeTab === 'details' ? 'border-purple-800 text-purple-950' : 'border-transparent text-slate-500'}`}
            >
              البيانات الإدارية
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('credentials')}
              className={`pb-2 px-4 font-bold border-b-2 ${activeTab === 'credentials' ? 'border-purple-800 text-purple-950' : 'border-transparent text-slate-500'}`}
            >
              تراخيص MOH والفحوصات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`pb-2 px-4 font-bold border-b-2 ${activeTab === 'approvals' ? 'border-purple-800 text-purple-950' : 'border-transparent text-slate-500'}`}
            >
              الاعتمادات والملاحظات
            </button>
          </div>

          {/* محتوى التبويب */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">القسم المستلم</label>
                <input type="text" value={currentEmp?.dept || ''} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">المشرف المباشر</label>
                <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2" />
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">نوع ترخيص مزاولة المهنة</label>
                <select value={mohLicenseType} onChange={(e) => setMohLicenseType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2">
                  <option value="دائم (Permanent)">دائم (Permanent)</option>
                  <option value="مؤقت / تحت الإجراء (Temporary)">مؤقت / تحت الإجراء (Temporary)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">نتيجة الفحص الطبي والسموم</label>
                <select value={medicalFitness} onChange={(e) => setMedicalFitness(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2">
                  <option value="لائق طبياً (Fit)">لائق طبياً (Fit)</option>
                  <option value="قيد الفحص (Pending)">قيد الفحص (Pending)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">بصمات الأدلة الجنائية (خلو سوابق)</label>
                <select value={criminalRecord} onChange={(e) => setCriminalRecord(e.target.value as any)} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2">
                  <option value="خلو سوابق معتمد (Cleared)">خلو سوابق معتمد (Cleared)</option>
                  <option value="قيد الإجراء (Pending)">قيد الإجراء (Pending)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">ملاحظات المباشرة وتوجيهات الإدارة</label>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2.5" />
            </div>
          )}

          {/* الأزرار */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => {
                if (currentEmp) {
                  printCommencementReport({
                    id: 'PREVIEW',
                    referenceNo: refNo,
                    companyName: activeCompany?.nameAr || activeCompany?.name || 'المنشأة',
                    employeeId: currentEmp.id,
                    employeeNameAr: currentEmp.nameAr,
                    civilId: currentEmp.civilId,
                    jobTitleAr: currentEmp.jobTitle,
                    departmentAr: currentEmp.dept,
                    commencementDate,
                    contractStartDate: currentEmp.hireDate,
                    mohLicenseNo: currentEmp.mohLicense || 'MOH-TEMP',
                    mohLicenseType,
                    medicalFitnessStatus: medicalFitness,
                    criminalRecordStatus: criminalRecord,
                    supervisorName: supervisor,
                    notes,
                    state: status
                  });
                }
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition flex items-center gap-1.5"
            >
              <span>🖨️</span> طباعة إقرار المباشرة
            </button>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition">
                إلغاء
              </button>
              <button type="submit" className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-lg font-bold transition shadow-sm">
                حفظ وتثبيت المباشرة
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
