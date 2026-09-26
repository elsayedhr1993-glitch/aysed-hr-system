import React, { useRef } from 'react';
import { X, FileText, Upload, ExternalLink, AlertTriangle } from 'lucide-react';
import type { SignedContractFileView } from '../../utils/resolveSignedContractFile';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  contractRef?: string;
  file: SignedContractFileView | null;
  onUpload?: (file: File) => void | Promise<void>;
  isUploading?: boolean;
}

export const UploadedSignedContractModal: React.FC<Props> = ({
  isOpen,
  onClose,
  employeeName,
  contractRef,
  file,
  onUpload,
  isUploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#714B67]/10 text-[#714B67] shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-slate-900 truncate">عرض عقد العمل المرفوع — {employeeName}</h3>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {contractRef ? `مرجع: ${contractRef}` : 'النسخة الأصلية الموقعة (PDF / صورة)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 transition cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {!file ? (
            <div className="max-w-lg mx-auto mt-8 text-center space-y-4 p-6 bg-white rounded-2xl border border-amber-200 shadow-sm">
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
              <p className="text-sm font-bold text-slate-900">لم يتم رفع ملف العقد بعد</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                لا يُعرض أي عقد نصي تلقائي. يجب رفع نسخة العقد الأصلي الموقع (PDF أو صورة ممسوحة).
              </p>
              {onUpload && (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const picked = e.target.files?.[0];
                      if (picked) void onUpload(picked);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => inputRef.current?.click()}
                    className="w-full bg-[#714B67] hover:bg-[#5a3a52] disabled:opacity-60 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload size={16} />
                    {isUploading
                      ? 'جاري الرفع...'
                      : 'لم يتم رفع ملف العقد بعد — اضغط هنا لرفع نسخة العقد (PDF / صورة)'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[60vh] flex flex-col">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800 truncate">{file.name}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#714B67] font-bold flex items-center gap-1 hover:underline shrink-0"
                >
                  <ExternalLink size={13} />
                  فتح في نافذة جديدة
                </a>
              </div>
              <div className="flex-1 min-h-[55vh]">
                {file.kind === 'pdf' ? (
                  <iframe title={file.name} src={file.url} className="w-full h-full min-h-[55vh] border-0" />
                ) : (
                  <img src={file.url} alt={file.name} className="w-full h-auto max-h-[75vh] object-contain mx-auto" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
