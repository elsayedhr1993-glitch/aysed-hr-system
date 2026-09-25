import React, { useMemo, useState } from 'react';
import { Company } from '../types';
import {
  CompanyDocument,
  COMPANY_DOCUMENT_TYPE_SUGGESTIONS,
  formatCompanyDocumentType,
  getDocumentStatus,
} from '../types/companyDocuments';
import { createArchiveDocumentId } from '../utils/documentArchiveUtils';
import { CompanyLicensesPrintModal } from './documents/CompanyLicensesPrintModal';
import { exportToExcel } from '../utils/exportUtils';
import {
  Plus,
  Search,
  FileText,
  Download,
  X,
  Shield,
  Building,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CompanyDocumentsKanbanProps {
  documents: CompanyDocument[];
  company?: Company | null;
  onSaveDocument: (doc: CompanyDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const CompanyDocumentsKanban: React.FC<CompanyDocumentsKanbanProps> = ({
  documents,
  company,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [filter, setFilter] = useState<'all' | 'valid' | 'expiring_soon' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CompanyDocument | null>(null);
  const [detailDoc, setDetailDoc] = useState<CompanyDocument | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form state for creating / editing
  const [formData, setFormData] = useState<Partial<CompanyDocument>>({
    name: '',
    documentType: 'رخصة تجارية',
    documentNumber: '',
    issuingAuthority: 'وزارة التجارة والصناعة',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    fileUrl: ''
  });

  const filteredDocs = documents.filter(doc => {
    const { status } = getDocumentStatus(doc.expiryDate);
    const matchesFilter = filter === 'all' || status === filter;
    const typeLabel = formatCompanyDocumentType(doc.documentType).toLowerCase();
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          typeLabel.includes(searchTerm.toLowerCase()) ||
                          doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const metrics = useMemo(() => {
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    for (const doc of documents) {
      const { status } = getDocumentStatus(doc.expiryDate);
      if (status === 'expired') expired += 1;
      else if (status === 'expiring_soon') expiringSoon += 1;
      else valid += 1;
    }
    return { total: documents.length, valid, expiringSoon, expired };
  }, [documents]);

  const filterLabel =
    filter === 'all'
      ? 'جميع التراخيص'
      : filter === 'valid'
        ? 'التراخيص السارية'
        : filter === 'expiring_soon'
          ? 'قارب على الانتهاء'
          : 'منتهية الصلاحية';

  const handleExportExcel = () => {
    if (filteredDocs.length === 0) {
      toast.error('لا توجد تراخيص لتصديرها');
      return;
    }
    const rows = filteredDocs.map((doc, idx) => {
      const { badgeLabel, status, daysRemaining } = getDocumentStatus(doc.expiryDate);
      return {
        م: idx + 1,
        'اسم الترخيص': doc.name,
        النوع: formatCompanyDocumentType(doc.documentType),
        'رقم الترخيص': doc.documentNumber,
        'جهة الإصدار': doc.issuingAuthority,
        'تاريخ الإصدار': doc.issueDate,
        'تاريخ الانتهاء': doc.expiryDate,
        'الأيام المتبقية': daysRemaining ?? '—',
        الحالة: badgeLabel,
        'حالة النظام': status,
        ملاحظات: doc.notes || '—',
      };
    });
    const companyName = company?.nameAr || company?.name || 'المنشأة';
    exportToExcel(rows, `تراخيص_المنشأة_${companyName}_${new Date().toISOString().split('T')[0]}`, 'تراخيص المنشأة');
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      name: '',
      documentType: 'رخصة تجارية',
      documentNumber: '',
      issuingAuthority: 'وزارة التجارة والصناعة',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      fileUrl: '',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.documentNumber || !formData.expiryDate) {
      toast.error('يرجى تعبئة الحقول الإجبارية (اسم الترخيص، الرقم، تاريخ الانتهاء)');
      return;
    }

    const newDoc: CompanyDocument = {
      id: editingDoc ? editingDoc.id : createArchiveDocumentId('company-doc'),
      name: formData.name.trim(),
      documentType: String(formData.documentType || '').trim() || 'أخرى',
      documentNumber: formData.documentNumber.trim(),
      issuingAuthority: formData.issuingAuthority || 'جهات رسمية',
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate,
      fileUrl: formData.fileUrl || '',
      notes: formData.notes || '',
      companyId: editingDoc?.companyId,
    };

    onSaveDocument(newDoc);
    toast.success(editingDoc ? 'تم تحديث الترخيص بنجاح' : 'تم إضافة الترخيص بنجاح');
    setShowModal(false);
    setEditingDoc(null);
  };

  const printCompany: Company = company || {
    id: 'company',
    name: 'المنشأة',
    nameAr: 'المنشأة',
    nameEn: 'Company',
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#714B67]" />
            <h1 className="text-2xl font-bold text-slate-900">تراخيص ومستندات المنشأة (Odoo Kanban)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">نظام تتبع صلاحية الوثائق والتنبيهات المسبقة وتواريخ التجديد آلياً</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="بحث في التراخيص والجهات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          {/* Quick Filters (Odoo Style) */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button 
              onClick={() => setFilter('all')} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter === 'all' ? 'bg-[#714B67] text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
              الكل ({documents.length})
            </button>
            <button 
              onClick={() => setFilter('expiring_soon')} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter === 'expiring_soon' ? 'bg-amber-600 text-white shadow' : 'text-amber-700 hover:bg-amber-50'}`}>
              قارب على الانتهاء
            </button>
            <button 
              onClick={() => setFilter('expired')} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter === 'expired' ? 'bg-rose-600 text-white shadow' : 'text-rose-700 hover:bg-rose-50'}`}>
              منتهي
            </button>
            <button 
              onClick={() => setFilter('valid')} 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${filter === 'valid' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700 hover:bg-emerald-50'}`}>
              ساري
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض البطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="bg-[#714B67] hover:bg-[#5c3c53] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            طباعة A4
          </button>

          <button 
            onClick={handleOpenAdd}
            className="bg-[#714B67] hover:bg-[#5c3c53] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition">
            <Plus className="w-4 h-4" />
            إضافة ترخيص جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">إجمالي التراخيص</p>
            <h4 className="text-xl font-black text-slate-900 font-mono">{metrics.total}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#714B67] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFilter('valid')}
          className={`p-3 rounded-xl border transition text-right flex items-center justify-between ${
            filter === 'valid' ? 'border-emerald-500 bg-emerald-50/70' : 'border-slate-200 bg-white hover:bg-emerald-50/30'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-emerald-700">سارية</p>
            <h4 className="text-xl font-black text-emerald-800 font-mono">{metrics.valid}</h4>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </button>
        <button
          type="button"
          onClick={() => setFilter('expiring_soon')}
          className={`p-3 rounded-xl border transition text-right flex items-center justify-between ${
            filter === 'expiring_soon' ? 'border-amber-500 bg-amber-50/70' : 'border-slate-200 bg-white hover:bg-amber-50/30'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-amber-700">قريب الانتهاء</p>
            <h4 className="text-xl font-black text-amber-800 font-mono">{metrics.expiringSoon}</h4>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </button>
        <button
          type="button"
          onClick={() => setFilter('expired')}
          className={`p-3 rounded-xl border transition text-right flex items-center justify-between ${
            filter === 'expired' ? 'border-rose-500 bg-rose-50/70' : 'border-slate-200 bg-white hover:bg-rose-50/30'
          }`}
        >
          <div>
            <p className="text-xs font-medium text-rose-700">منتهية</p>
            <h4 className="text-xl font-black text-rose-800 font-mono">{metrics.expired}</h4>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </button>
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-500 text-sm">
          لا توجد تراخيص تطابق البحث أو الفلتر الحالي.
        </div>
      )}

      {viewMode === 'kanban' && filteredDocs.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const { badgeColor, badgeLabel, status, daysRemaining } = getDocumentStatus(doc.expiryDate);

          return (
            <div 
              key={doc.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
              
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badgeColor}`}>
                    {badgeLabel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    #{doc.documentNumber}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#714B67] mb-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{formatCompanyDocumentType(doc.documentType)}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-[#714B67] transition">
                  {doc.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{doc.issuingAuthority}</p>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الإصدار:</span>
                    <span className="font-medium font-mono">{doc.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">تاريخ الانتهاء:</span>
                    <span className={`font-medium font-mono ${status === 'expired' ? 'text-red-600 font-bold' : status === 'expiring_soon' ? 'text-amber-600 font-bold' : 'text-emerald-700'}`}>
                      {doc.expiryDate}
                    </span>
                  </div>
                  {doc.notes && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/40 italic">
                      {doc.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setDetailDoc(doc);
                    setIsDetailModalOpen(true);
                  }}
                  className="text-xs text-[#714B67] hover:text-[#5c3c53] font-bold flex items-center gap-1">
                  عرض التفاصيل والملف &larr;
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(doc.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    title="معاينة المستند"
                  >
                    👁️ عرض
                  </button>

                  {doc.fileUrl && doc.fileUrl !== '#' ? (
                    <a 
                      href={doc.fileUrl} 
                      download={`${doc.name}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-md transition-colors"
                      title="تحميل المرفق"
                    >
                      ⬇️ تحميل
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">لا يوجد ملف</span>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا الترخيص؟')) {
                        onDeleteDocument(doc.id);
                        toast.success('تم حذف الترخيص بنجاح');
                      }
                    }}
                    className="text-xs text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
                    title="حذف"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      )}

      {viewMode === 'list' && filteredDocs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">الترخيص</th>
                <th className="p-3">النوع</th>
                <th className="p-3 font-mono">الرقم</th>
                <th className="p-3">الجهة</th>
                <th className="p-3 font-mono">الانتهاء</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => {
                const { badgeColor, badgeLabel, status } = getDocumentStatus(doc.expiryDate);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{doc.name}</td>
                    <td className="p-3">{formatCompanyDocumentType(doc.documentType)}</td>
                    <td className="p-3 font-mono">{doc.documentNumber}</td>
                    <td className="p-3">{doc.issuingAuthority}</td>
                    <td className={`p-3 font-mono ${status === 'expired' ? 'text-rose-600 font-bold' : status === 'expiring_soon' ? 'text-amber-600' : ''}`}>
                      {doc.expiryDate}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeColor}`}>{badgeLabel}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailDoc(doc);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-[#714B67] font-bold hover:underline"
                      >
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CompanyLicensesPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        documents={filteredDocs}
        company={printCompany}
        filterLabel={filterLabel}
      />

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#714B67]" />
                {editingDoc ? 'تعديل بيانات الترخيص' : 'إضافة ترخيص أو مستند جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingDoc(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الترخيص / الوثيقة *</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: الرخصة التجارية للفرع الرئيسي"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الترخيص</label>
                  <input
                    type="text"
                    list="company-license-type-suggestions"
                    placeholder="اكتب المسمى أو اختر اقتراحاً..."
                    value={formData.documentType || ''}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-white"
                  />
                  <datalist id="company-license-type-suggestions">
                    {COMPANY_DOCUMENT_TYPE_SUGGESTIONS.map((label) => (
                      <option key={label} value={label} />
                    ))}
                  </datalist>
                  <p className="text-[10px] text-slate-400 mt-1">يمكنك كتابة أي مسمى مخصص — الاقتراحات للتسريع فقط.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم ترخيص وزارة الصحة *</label>
                  <input 
                    type="text"
                    required
                    placeholder="مثال: CN-2026-9982"
                    value={formData.documentNumber || ''}
                    onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">جهة الإصدار</label>
                  <input 
                    type="text"
                    placeholder="مثال: وزارة التجارة والصناعة"
                    value={formData.issuingAuthority || ''}
                    onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإصدار</label>
                  <input 
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء *</label>
                  <input 
                    type="date"
                    required
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">إرفاق نسخة الترخيص / المستند (PDF أو صورة)</label>
                  <input 
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFormData({...formData, fileUrl: URL.createObjectURL(e.target.files[0])});
                        toast.success('تم إرفاق الملف بنجاح');
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#714B67]/10 file:text-[#714B67] hover:file:bg-[#714B67]/20 cursor-pointer border border-slate-200 rounded-lg p-1"
                  />
                  {formData.fileUrl && formData.fileUrl !== '#' && formData.fileUrl !== 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' && (
                     <p className="text-emerald-600 text-[10px] mt-1 font-bold">✓ تم إرفاق ملف جاهز للحفظ</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات أو روابط إضافية</label>
                  <textarea 
                    rows={2}
                    placeholder="ملاحظات حول التجديد أو شروط الجهة الرسمية..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDoc(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5c3c53] rounded-lg shadow transition"
                >
                  حفظ الترخيص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailModalOpen && detailDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#714B67]" />
                تفاصيل ترخيص المنشأة
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">رقم ترخيص وزارة الصحة:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{detailDoc.documentNumber}</span>
                </div>
                <div>
                  {(() => {
                    const { badgeColor, badgeLabel } = getDocumentStatus(detailDoc.expiryDate);
                    return (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block mb-0.5">اسم الترخيص:</span>
                  <span className="font-bold text-sm text-slate-900">{detailDoc.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">نوع الترخيص:</span>
                    <span className="font-medium">{formatCompanyDocumentType(detailDoc.documentType)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">جهة الإصدار:</span>
                    <span className="font-medium">{detailDoc.issuingAuthority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">تاريخ الإصدار:</span>
                    <span className="font-mono font-medium">{detailDoc.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">تاريخ الانتهاء:</span>
                    <span className="font-mono font-medium text-red-600">{detailDoc.expiryDate}</span>
                  </div>
                </div>
                {detailDoc.notes && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">ملاحظات:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-600">{detailDoc.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                {detailDoc.fileUrl && detailDoc.fileUrl !== '#' ? (
                  <a
                    href={detailDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    تحميل المستند المرفق
                  </a>
                ) : (
                  <button
                    onClick={() => toast.error('لا يوجد ملف مرفق مع هذا الترخيص')}
                    className="bg-slate-100 text-slate-400 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 opacity-50" />
                    لا يوجد مرفق
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
