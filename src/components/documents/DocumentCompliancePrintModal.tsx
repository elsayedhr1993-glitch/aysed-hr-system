import React from 'react';
import { DocumentItem, Employee, Company } from '../../types';
import { X, Printer } from 'lucide-react';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';
import { OdooReportFooter, OdooReportSheet } from '../print/OdooReportPrimitives';
import { OdooOfficialA4ReportLayout } from '../print/OdooOfficialA4ReportLayout';
import { getCompanyPrintProfile } from '../../utils/companyPrintProfile';
import {
  employeeDocumentTypeLabel,
  validityBadgeLabelFromEmployeeStatus,
} from '../../utils/documentDisplayLabels';

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
    <div className="fixed printable-modal-root inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:bg-white" dir="rtl">
      <div className="printable-modal-sheet bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        
        {/* Modal Action Bar (Hidden on Print) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
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
        <OdooReportSheet
          id="document-compliance-print-root"
          variant="official-a4"
          className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-900 font-sans print:p-0 print:overflow-visible"
        >
          <OdooOfficialA4ReportLayout
            header={
              <OfficialA4CompanyLetterhead
                company={company}
                departmentLine="إدارة الشؤون الإدارية والموارد البشرية — قسم الأرشيف الرقمي"
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
            }
            footer={<OdooReportFooter companyName={profile.displayNameAr} reportRef={reportRef} />}
          >
          <div className="odoo-report-meta-strip flex justify-between items-center text-xs">
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
          <div className="odoo-report-table-wrap mb-6">
            <table className="odoo-report-table odoo-report-table--wrap document-compliance-print-table w-full text-right text-xs">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>نوع الوثيقة</th>
                  <th>الموظف المعني</th>
                  <th className="font-mono">الرقم المدني</th>
                  <th>القسم</th>
                  <th className="font-mono">تاريخ الانتهاء</th>
                  <th className="text-center">حالة السريان</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => {
                  const emp = employees.find(e => e.id === doc.employeeId);

                  let isExpired = false;
                  if (doc.expiryDate) {
                    const diff = Math.ceil(
                      (new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    isExpired = diff < 0;
                  }

                  const statusBadge = validityBadgeLabelFromEmployeeStatus(
                    isExpired ? 'expired' : 'active'
                  );
                  const statusColor = isExpired
                    ? 'text-rose-700 bg-rose-50 font-bold'
                    : 'text-emerald-700 bg-emerald-50';

                  const typeLabel = employeeDocumentTypeLabel(doc);

                  return (
                    <tr key={doc.id}>
                      <td className="text-center text-slate-500 font-mono">{idx + 1}</td>
                      <td className="font-bold text-slate-900">{typeLabel}</td>
                      <td className="text-slate-800">{emp ? emp.fullNameAr : 'وثيقة منشأة عامة'}</td>
                      <td className="font-mono text-slate-600">{emp?.civilId || '—'}</td>
                      <td className="text-slate-600">{emp?.department || '—'}</td>
                      <td className="font-mono text-slate-800 font-bold">{doc.expiryDate || '—'}</td>
                      <td className="text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${statusColor}`}>
                          {statusBadge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          </OdooOfficialA4ReportLayout>
        </OdooReportSheet>

      </div>
    </div>
  );
};
