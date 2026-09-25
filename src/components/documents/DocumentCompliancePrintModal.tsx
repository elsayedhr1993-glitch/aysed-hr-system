import React from 'react';
import { DocumentItem, Employee, Company } from '../../types';
import { X, Printer } from 'lucide-react';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';

interface DocumentCompliancePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  employees: Employee[];
  company: Company;
  filterTitle: string;
}

export const DocumentCompliancePrintModal: React.FC<DocumentCompliancePrintModalProps> = ({
  isOpen,
  onClose,
  documents,
  employees,
  company,
  filterTitle
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    void import('../../utils/printUtils').then(({ printDocument }) => {
      printDocument('document-compliance-print-root', filterTitle || 'كشف_امتثال_المستندات');
    });
  };

  const profile = getCompanyPrintProfile(company);
  const todayStr = new Date().toLocaleDateString('ar-KW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const reportRef = `DOC-REP-${Date.now().toString().slice(-6)}`;

  // إحصائيات سريعة للتقرير
  const total = documents.length;
  const expiredCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    const diff = new Date(d.expiryDate).getTime() - new Date().getTime();
    return diff < 0;
  }).length;

  const expiringSoonCount = documents.filter(d => {
    if (!d.expiryDate) return false;
    const diff = Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 60;
  }).length;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#714B67]" />
            <span className="font-bold text-slate-800 text-sm">معاينة التقرير الرسمي لطباعة الأرشيف والامتثال الحكومي (A4)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#714B67] hover:bg-[#5a3a51] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> طباعة المستند (Print)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Content */}
        <div
          id="document-compliance-print-root"
          className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible"
        >
          
          <OfficialA4CompanyLetterhead
            company={company}
            departmentLine="إدارة الشؤون الإدارية والموارد البشرية — قسم الأرشيف الرقمي"
            className="mb-6"
            rightSlot={
              <div className="flex flex-col items-end">
                <div className="w-16 h-16 border border-slate-300 rounded p-1 bg-slate-50 flex items-center justify-center text-[8px] font-mono text-center text-slate-500 leading-tight">
                  VERIFY
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">المرجع: {reportRef}</span>
                <span className="text-[10px] font-mono text-slate-500">التاريخ: {todayStr}</span>
              </div>
            }
          />

          {/* Title & Filter Info */}
          <div className="bg-slate-100 rounded-xl p-3.5 mb-6 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 font-medium">نوع التقرير: </span>
              <strong className="text-slate-900 font-bold text-sm">كشف حالة الوثائق والتراخيص الرسمية ({filterTitle})</strong>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>إجمالي المستندات: <strong>{total}</strong></span>
              {expiringSoonCount > 0 && <span className="text-amber-700 font-bold">تنتهي قريباً: {expiringSoonCount}</span>}
              {expiredCount > 0 && <span className="text-rose-700 font-bold">منتهية: {expiredCount}</span>}
            </div>
          </div>

          {/* Documents Table */}
          <div className="overflow-hidden border border-slate-300 rounded-lg mb-6">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5">اسم المستند / الوثيقة</th>
                  <th className="p-2.5">الموظف المعني</th>
                  <th className="p-2.5 font-mono">الرقم المدني</th>
                  <th className="p-2.5">القسم</th>
                  <th className="p-2.5 font-mono">تاريخ الانتهاء</th>
                  <th className="p-2.5 text-center">حالة السريان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {documents.map((doc, idx) => {
                  const emp = employees.find(e => e.id === doc.employeeId);
                  
                  let days = null;
                  let statusBadge = 'ساري';
                  let statusColor = 'text-emerald-700 bg-emerald-50';

                  if (doc.expiryDate) {
                    const diff = Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    days = diff;
                    if (diff < 0) {
                      statusBadge = `منتهي (${Math.abs(diff)} يوم)`;
                      statusColor = 'text-rose-700 bg-rose-50 font-bold';
                    } else if (diff <= 60) {
                      statusBadge = `ينتهي قريباً (${diff} يوم)`;
                      statusColor = 'text-amber-700 bg-amber-50 font-bold';
                    }
                  }

                  return (
                    <tr key={doc.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{doc.title}</td>
                      <td className="p-2 text-slate-800">{emp ? emp.fullNameAr : 'وثيقة منشأة عامة'}</td>
                      <td className="p-2 font-mono text-slate-600">{emp?.civilId || '—'}</td>
                      <td className="p-2 text-slate-600">{emp?.department || '—'}</td>
                      <td className="p-2 font-mono text-slate-800 font-bold">{doc.expiryDate || '—'}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures & Approvals */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-xs mt-12">
            <div>
              <p className="font-bold text-slate-700 mb-10">إعداد مسؤول الأرشيف</p>
              <p className="text-slate-400">التوقيع: ................................</p>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-10">اعتماد مدير الموارد البشرية</p>
              <p className="text-slate-400">التوقيع: ................................</p>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-10">ختم المنشأة الرسمي</p>
              <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400">
                خاتم الشركة
              </div>
            </div>
          </div>

          {/* Footer notice */}
          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            تم استخراج هذا التقرير آلياً لصالح {profile.displayNameAr} — أرشيف ومستندات المنشأة — صالح لمراجعة الجهات الرسمية والهيئة العامة للقوى العاملة.
          </div>

        </div>

      </div>
    </div>
  );
};
