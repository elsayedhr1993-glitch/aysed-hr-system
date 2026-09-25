import React from 'react';
import { Company } from '../../types';
import { CompanyDocument, formatCompanyDocumentType, getDocumentStatus } from '../../types/companyDocuments';
import { X, Printer, Shield } from 'lucide-react';
import { OfficialA4CompanyLetterhead } from '../print/OfficialA4CompanyLetterhead';

interface CompanyLicensesPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: CompanyDocument[];
  company: Company;
  filterLabel: string;
}

export const CompanyLicensesPrintModal: React.FC<CompanyLicensesPrintModalProps> = ({
  isOpen,
  onClose,
  documents,
  company,
  filterLabel,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const reportRef = `LIC-REP-${Date.now().toString().slice(-6)}`;

  const expiredCount = documents.filter(d => getDocumentStatus(d.expiryDate).status === 'expired').length;
  const expiringSoonCount = documents.filter(
    d => getDocumentStatus(d.expiryDate).status === 'expiring_soon'
  ).length;

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#714B67]" />
            <span className="font-bold text-slate-800 text-sm">
              كشف تراخيص وسجلات المنشأة (A4)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-[#714B67] hover:bg-[#5a3a51] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0">
          <OfficialA4CompanyLetterhead
            company={company}
            subtitle="كشف تراخيص المنشأة والامتثال الحكومي"
            className="mb-6"
            rightSlot={
              <div className="text-[10px] font-mono text-slate-500">
                <div>المرجع: {reportRef}</div>
                <div>التاريخ: {todayStr}</div>
              </div>
            }
          />

          <div className="bg-slate-100 rounded-xl p-3 mb-6 text-xs flex flex-wrap justify-between gap-2">
            <span>
              <strong>النطاق:</strong> {filterLabel}
            </span>
            <span className="font-mono">
              الإجمالي: {documents.length}
              {expiringSoonCount > 0 && ` · قريب الانتهاء: ${expiringSoonCount}`}
              {expiredCount > 0 && ` · منتهي: ${expiredCount}`}
            </span>
          </div>

          <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 font-bold text-slate-700">
              <tr>
                <th className="p-2 w-8 text-center">#</th>
                <th className="p-2">اسم الترخيص</th>
                <th className="p-2">النوع</th>
                <th className="p-2 font-mono">رقم الترخيص</th>
                <th className="p-2">جهة الإصدار</th>
                <th className="p-2 font-mono">الانتهاء</th>
                <th className="p-2 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {documents.map((doc, idx) => {
                const { badgeLabel, status } = getDocumentStatus(doc.expiryDate);
                const rowClass =
                  status === 'expired'
                    ? 'text-rose-800'
                    : status === 'expiring_soon'
                      ? 'text-amber-800'
                      : 'text-slate-800';
                return (
                  <tr key={doc.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : ''}>
                    <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                    <td className="p-2 font-bold">{doc.name}</td>
                    <td className="p-2">{formatCompanyDocumentType(doc.documentType)}</td>
                    <td className="p-2 font-mono">{doc.documentNumber}</td>
                    <td className="p-2">{doc.issuingAuthority}</td>
                    <td className="p-2 font-mono">{doc.expiryDate}</td>
                    <td className={`p-2 text-center text-[11px] font-semibold ${rowClass}`}>{badgeLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {documents.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">لا توجد تراخيص في هذا النطاق.</p>
          )}

          <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-slate-200 text-center text-xs">
            <div>
              <p className="font-bold mb-8">مسؤول المتابعة الحكومية</p>
              <p className="text-slate-400">التوقيع: ............</p>
            </div>
            <div>
              <p className="font-bold mb-8">مدير الموارد البشرية</p>
              <p className="text-slate-400">التوقيع: ............</p>
            </div>
            <div>
              <p className="font-bold mb-4 flex items-center justify-center gap-1">
                <Shield className="w-4 h-4" /> ختم المنشأة
              </p>
              <div className="w-16 h-16 border-2 border-dashed rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
