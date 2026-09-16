import React, { useState } from 'react';
import { DocumentItem, Employee } from '../../types';
import { X, Upload, FileText, User, Calendar, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DirectDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  companyId: string;
  onSaveDocument: (doc: DocumentItem) => void;
}

const DOCUMENT_CATEGORIES = [
  { id: 'CIVIL_ID', label: 'البطاقة المدنية (Civil ID)' },
  { id: 'PASSPORT', label: 'جواز السفر (Passport)' },
  { id: 'RESIDENCY', label: 'إقامة مادة 18 / سمة دخول (Residency)' },
  { id: 'WORK_CONTRACT', label: 'عقد العمل الحكومي (PAM Contract)' },
  { id: 'MOH_LICENSE', label: 'ترخيص مزاولة المهنة (MOH License)' },
  { id: 'DRIVING_LICENSE', label: 'رخصة القيادة (Driving License)' },
  { id: 'GRADUATION_DEGREE', label: 'المؤهل العلمي / شهادة المعادلة' },
  { id: 'SECURITY_CLEARANCE', label: 'صحيفة الحالة الجنائية (بصمات)' },
  { id: 'OTHER', label: 'مستند أو شهادة أخرى' },
];

export const DirectDocumentUploadModal: React.FC<DirectDocumentUploadModalProps> = ({
  isOpen,
  onClose,
  employees,
  companyId,
  onSaveDocument
}) => {
  if (!isOpen) return null;

  const [targetType, setTargetType] = useState<'employee' | 'company'>('employee');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [category, setCategory] = useState<string>('CIVIL_ID');
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setIsProcessingFile(true);
    setFileName(file.name);
    
    // Format file size
    const sizeInKb = Math.round(file.size / 1024);
    if (sizeInKb > 1024) {
      setFileSize(`${(sizeInKb / 1024).toFixed(1)} MB`);
    } else {
      setFileSize(`${sizeInKb} KB`);
    }

    // Default title if empty
    if (!title) {
      const catObj = DOCUMENT_CATEGORIES.find(c => c.id === category);
      const baseName = selectedEmployee ? `${catObj?.label.split(' ')[0]} - ${selectedEmployee.fullNameAr}` : file.name.replace(/\.[^/.]+$/, "");
      setTitle(baseName);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
      setIsProcessingFile(false);
      toast.success('تمت قراءة وتجهيز الملف للأرشفة');
    };
    reader.onerror = () => {
      setIsProcessingFile(false);
      toast.error('تعذر قراءة الملف المرفوع');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('يرجى تحديد عنوان للمستند');
      return;
    }

    if (targetType === 'employee' && !selectedEmpId) {
      toast.error('يرجى اختيار الموظف التابع له المستند');
      return;
    }

    // Determine status
    let status: 'active' | 'near_expiry' | 'expired' = 'active';
    if (expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = 'expired';
      else if (diffDays <= 60) status = 'near_expiry';
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      companyId: companyId || 'default',
      employeeId: targetType === 'employee' ? selectedEmpId : undefined,
      title: title.trim(),
      category,
      documentNumber: documentNumber.trim() || undefined,
      fileUrl: fileDataUrl || '#',
      fileName: fileName || `${title}.pdf`,
      fileSize: fileSize || '1.0 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      issueDate: issueDate || undefined,
      expiryDate,
      status,
      tags: [category, targetType === 'employee' ? 'كادر_وظيفي' : 'وثيقة_منشأة']
    };

    onSaveDocument(newDoc);
    toast.success('تمت أرشفة المستند بنجاح في قاعدة البيانات');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">رفع وأرشفة مستند جديد</h3>
              <p className="text-xs text-slate-500">حفظ وتصنيف الوثيقة مع إعداد تنبيهات الصلاحية التلقائية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Target Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTargetType('employee')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                targetType === 'employee' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>وثيقة لموظف / كادر</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('company')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                targetType === 'company' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>وثيقة عامة للمنشأة</span>
            </button>
          </div>

          {/* Employee Selector (if employee target) */}
          {targetType === 'employee' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الموظف المعني <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  const emp = employees.find(empItem => empItem.id === e.target.value);
                  if (emp && !title) {
                    const catObj = DOCUMENT_CATEGORIES.find(c => c.id === category);
                    setTitle(`${catObj?.label.split(' ')[0]} - ${emp.fullNameAr}`);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullNameAr} ({emp.civilId || emp.id}) - {emp.department || 'عام'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تصنيف الوثيقة <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const catObj = DOCUMENT_CATEGORIES.find(c => c.id === e.target.value);
                  if (selectedEmployee) {
                    setTitle(`${catObj?.label.split(' ')[0]} - ${selectedEmployee.fullNameAr}`);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition"
              >
                {DOCUMENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان المستند <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: جواز سفر - أحمد الكندري"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* Document Number & Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم المستند / السجل (اختياري)
              </label>
              <input
                type="text"
                placeholder="رقم الوثيقة، الرقم الآلي..."
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ الإصدار (اختياري)
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition font-mono"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تاريخ انتهاء الصلاحية <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#714B67] focus:bg-white transition font-mono font-bold"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              يستخدم هذا التاريخ لحساب الإنذار المبكر قبل 60 يوماً من الانتهاء في شاشة الأنشطة والتنبيهات.
            </p>
          </div>

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الملف المرفق (PDF أو صورة)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                fileDataUrl ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-[#714B67] bg-slate-50'
              }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                id="directDocFileInput"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="directDocFileInput" className="cursor-pointer block">
                {isProcessingFile ? (
                  <div className="py-2 text-slate-600 font-bold text-xs flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#714B67] border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري معالجة الملف...</span>
                  </div>
                ) : fileDataUrl ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>تم تجهيز الملف: {fileName} ({fileSize})</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">اسحب الملف هنا أو انقر للاختيار</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">يدعم PDF أو الصور (PNG, JPG) حتى 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex gap-3">
            <button
              type="submit"
              disabled={isProcessingFile}
              className="flex-1 bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد الأرشفة والحفظ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
