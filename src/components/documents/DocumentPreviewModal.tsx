import React from 'react';
import { DocumentItem, Employee } from '../../types';
import { 
  X, Download, Printer, Trash2, Calendar, User, 
  FileText, Shield, AlertCircle, CheckCircle2, Clock, ExternalLink 
} from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  employee?: Employee;
  onDelete?: (docId: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  employee,
  onDelete
}) => {
  if (!isOpen || !document) return null;

  // حساب الأيام المتبقية والحالة ديناميكياً
  const calculateExpiry = () => {
    if (!document.expiryDate) return { status: 'UNKNOWN', label: 'بدون تاريخ انتهاء', days: null, color: 'text-slate-500 bg-slate-100' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(document.expiryDate);
    expDate.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { 
        status: 'EXPIRED', 
        label: `منتهي الصلاحية (منذ ${Math.abs(days)} يوم)`, 
        days, 
        color: 'text-rose-700 bg-rose-50 border-rose-200' 
      };
    } else if (days <= 60) {
      return { 
        status: 'EXPIRING_SOON', 
        label: `ينتهي قريباً (متبقي ${days} يوم)`, 
        days, 
        color: 'text-amber-700 bg-amber-50 border-amber-200' 
      };
    } else {
      return { 
        status: 'ACTIVE', 
        label: `ساري المفعول (متبقي ${days} يوم)`, 
        days, 
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200' 
      };
    }
  };

  const expiryInfo = calculateExpiry();

  // فحص نوع الملف
  const isImage = document.fileUrl?.startsWith('data:image') || 
                  document.fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || 
                  document.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                  
  const isPdf = document.fileUrl?.startsWith('data:application/pdf') || 
                document.fileName?.endsWith('.pdf') || 
                document.fileUrl?.endsWith('.pdf');

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!document.fileUrl || document.fileUrl === '#') {
      alert('لا يتوفر ملف للتحميل لهذا المستند');
      return;
    }
    const link = window.document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName || `${document.title}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">{document.title}</h3>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>كود: {document.id}</span>
                {document.documentNumber && <span>• رقم الوثيقة: {document.documentNumber}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-[#714B67] hover:bg-slate-200/60 rounded-lg transition"
              title="تنزيل الملف"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-[#714B67] hover:bg-slate-200/60 rounded-lg transition"
              title="طباعة"
            >
              <Printer className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد من رغبتك في حذف هذا المستند من الأرشيف؟')) {
                    onDelete(document.id);
                    onClose();
                  }
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="حذف المستند"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Two columns layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* File Viewer Box (Left on LTR, Right on RTL) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[320px] max-h-[500px] relative p-2">
            {isImage && document.fileUrl ? (
              <img 
                src={document.fileUrl} 
                alt={document.title} 
                className="max-h-[480px] max-w-full object-contain rounded"
              />
            ) : isPdf && document.fileUrl && document.fileUrl.startsWith('data:') ? (
              <iframe 
                src={document.fileUrl} 
                title={document.title} 
                className="w-full h-[460px] rounded border-0 bg-white"
              />
            ) : (
              <div className="text-center p-8 text-slate-300">
                <FileText className="w-16 h-16 mx-auto mb-3 text-slate-500 opacity-60" />
                <h4 className="font-bold text-white text-base mb-1">{document.fileName || document.title}</h4>
                <p className="text-xs text-slate-400 mb-4">
                  {document.fileSize ? `حجم الملف: ${document.fileSize}` : 'مستند رقمي مؤرشف'}
                </p>
                {document.fileUrl && document.fileUrl !== '#' ? (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5a3a51] text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                  >
                    <Download className="w-4 h-4" /> فتح / تنزيل الملف
                  </button>
                ) : (
                  <span className="inline-block bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-md">
                    مستند مسجل بدون ملف رقمي مرفق
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Metadata Card (Details) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              
              {/* Status Badge */}
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${expiryInfo.color}`}>
                {expiryInfo.status === 'EXPIRED' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : expiryInfo.status === 'EXPIRING_SOON' ? (
                  <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>حالة الوثيقة: {expiryInfo.label}</span>
              </div>

              {/* Employee Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#714B67]" />
                  <span>بيانات صاحب المستند</span>
                </div>
                {employee ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 text-sm">{employee.fullNameAr || employee.fullNameEn}</p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div><span className="text-slate-400">الرقم المدني:</span> <span className="font-mono">{employee.civilId || '—'}</span></div>
                      <div><span className="text-slate-400">القسم:</span> {employee.department || '—'}</div>
                      <div><span className="text-slate-400">المسمى:</span> {employee.jobTitle || '—'}</div>
                      <div><span className="text-slate-400">الجنسية:</span> {employee.nationality || (employee.isKuwaiti ? 'كويتي' : 'غير كويتي')}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-medium">مستند عام أو ترخيص تابع للشركة</p>
                )}
              </div>

              {/* Document Meta Fields */}
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">التصنيف الإداري:</span>
                  <span className="font-bold text-slate-800">{document.category}</span>
                </div>
                {document.documentNumber && (
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">رقم الوثيقة:</span>
                    <span className="font-bold font-mono text-slate-800">{document.documentNumber}</span>
                  </div>
                )}
                {document.issueDate && (
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">تاريخ الإصدار:</span>
                    <span className="font-mono text-slate-700">{document.issueDate}</span>
                  </div>
                )}
                <div className="p-3 flex justify-between">
                  <span className="text-slate-400">تاريخ الانتهاء:</span>
                  <span className="font-mono font-bold text-slate-900">{document.expiryDate || 'غير محدد'}</span>
                </div>
                {document.uploadDate && (
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-400">تاريخ الأرشفة:</span>
                    <span className="font-mono text-slate-500">{document.uploadDate}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
            >
              إغلاق المعاينة
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
