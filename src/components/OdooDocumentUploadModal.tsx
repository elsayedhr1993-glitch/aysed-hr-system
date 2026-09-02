import React, { useState } from 'react';
import { EmployeeDocument, checkDocumentExpiryStatus } from '../services/documentService';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: EmployeeDocument) => void;
  employeeList: Array<{ id: string; nameAr: string; civilId: string; dept: string; jobTitle: string }>;
}

const DOCUMENT_CATEGORIES = [
  'هويات وإقامات (Civil ID & Visa)',
  'تراخيص طبية (MOH Licenses)',
  'شهادات ومؤهلات علمية (Degrees & Certificates)',
  'عقود وإقرارات قانونية (Contracts & Declarations)',
  'فحوصات وبصمات (Medical & Security Clearances)'
] as const;

export default function OdooDocumentUploadModal({ isOpen, onClose, onSave, employeeList }: DocumentModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState(employeeList[0]?.id || '');
  const [category, setCategory] = useState<typeof DOCUMENT_CATEGORIES[number]>(DOCUMENT_CATEGORIES[0]);
  const [docTitleAr, setDocTitleAr] = useState('');
  const [docTitleEn, setDocTitleEn] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'JPG' | 'PNG'>('PDF');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const currentEmp = employeeList.find(e => e.id === selectedEmpId) || employeeList[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      if (file.name.endsWith('.pdf')) setFileType('PDF');
      else if (file.name.endsWith('.png')) setFileType('PNG');
      else setFileType('JPG');

      if (!docTitleAr) {
        setDocTitleAr(file.name.split('.')[0]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      if (file.name.endsWith('.pdf')) setFileType('PDF');
      else if (file.name.endsWith('.png')) setFileType('PNG');
      else setFileType('JPG');

      if (!docTitleAr) {
        setDocTitleAr(file.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitleAr) {
      alert('يرجى كتابة عنوان للمستند');
      return;
    }

    const { status, daysLeft } = checkDocumentExpiryStatus(expiryDate);

    const payload: EmployeeDocument = {
      id: `DOC-${Date.now()}`,
      employeeId: currentEmp?.id || 'EMP-001',
      employeeNameAr: currentEmp?.nameAr || '',
      civilId: currentEmp?.civilId || '',
      category,
      docTitleAr,
      docTitleEn: docTitleEn || docTitleAr,
      documentNumber: docNumber,
      issueDate,
      expiryDate,
      fileType,
      fileName: uploadedFileName || 'Document.pdf',
      fileSize: '1.2 MB',
      status,
      daysLeft,
      notes,
      uploadDate: new Date().toISOString().slice(0, 10)
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* 1. الترويسة بنمط Odoo Form Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-bold text-sm">أرشيف المستندات (Documents) /</span>
            <span className="text-slate-600 font-bold text-sm">أرشفة مستند جديد</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold transition px-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto p-6 space-y-4">
          
          {/* اختيار الموظف والتصنيف */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-slate-700 font-bold mb-1">نوع وتصنيف المستند <span className="text-rose-500">*</span></label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold text-purple-950"
              >
                {DOCUMENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* مسمى المستند عربي / إنجليزي ورقم الوثيقة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">عنوان المستند (عربي) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={docTitleAr} 
                onChange={(e) => setDocTitleAr(e.target.value)}
                placeholder="مثال: ترخيص مزاولة مهنة طب بشري MOH"
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Document Title (English)</label>
              <input 
                type="text" 
                value={docTitleEn} 
                onChange={(e) => setDocTitleEn(e.target.value)}
                placeholder="e.g. MOH Medical Practice License"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">رقم الوثيقة / السجل المرجعي (إن وجد)</label>
              <input 
                type="text" 
                value={docNumber} 
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="MOH-LIC-2026-998"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          {/* تواريخ الإصدار والانتهاء لتفعيل تنبيهات الصلاحية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">تاريخ الإصدار</label>
              <input 
                type="date" 
                value={issueDate} 
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>

            <div>
              <label className="block text-purple-950 font-bold mb-1">تاريخ انتهاء الصلاحية (Expiry Date)</label>
              <input 
                type="date" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-lg p-2 font-mono font-bold text-purple-900"
              />
              <span className="text-[10px] text-purple-700">سيقوم النظام بتنبيه الموارد البشرية قبل الانتهاء بـ 60 يوماً.</span>
            </div>
          </div>

          {/* منطقة رفع الملف بنمط Odoo Dropzone */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">ملف الوثيقة (PDF / صورة عالية الجودة)</label>
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer relative transition ${
                isDragging 
                  ? 'border-purple-600 bg-purple-50/80 scale-[1.01] shadow-md' 
                  : 'border-slate-300 hover:border-purple-600 bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500 pointer-events-none">
                <span className="text-2xl">📁</span>
                <p className="font-bold text-slate-700 text-xs">
                  {uploadedFileName ? uploadedFileName : 'اسحب الملف هنا أو اضغط للاختيار'}
                </p>
                <p className="text-[10px] text-slate-400">الصيغ المدعومة: PDF, JPG, PNG (الحد الأقصى 10MB)</p>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">ملاحظات الأرشفة</label>
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="نسخة أصلية مصدقة من التعليم العالي / وزارة الصحة..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2"
            />
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-lg font-bold transition shadow-sm"
            >
              حفظ وأرشفة المستند (Save)
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
