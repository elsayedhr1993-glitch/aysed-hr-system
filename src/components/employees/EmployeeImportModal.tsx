import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Employee } from '../../types';
import {
  downloadEmployeeImportTemplate,
  importEmployeesBatch,
  parseEmployeeImportWorkbook,
  type EmployeeImportSummary,
} from '../../services/employeeImportService';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  existingEmployees: Array<Partial<Employee> & Record<string, unknown>>;
  onImported?: () => void;
}

export const EmployeeImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  companyId,
  existingEmployees,
  onImported,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<EmployeeImportSummary | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setSummary(null);
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseEmployeeImportWorkbook(buffer);
      setRowCount(rows.length);
      if (!rows.length) {
        toast.error('لم يُعثر على صفوف بيانات — تأكد من القالب والعناوين');
      }
    } catch (e) {
      toast.error('تعذر قراءة الملف');
      setRowCount(0);
    }
  };

  const runImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !companyId) {
      toast.error('اختر ملف Excel أو CSV أولاً');
      return;
    }
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseEmployeeImportWorkbook(buffer);
      if (!rows.length) {
        toast.error('لا توجد صفوف للاستيراد');
        return;
      }
      const result = await importEmployeesBatch(rows, companyId, [...existingEmployees]);
      setSummary(result);
      if (result.success > 0) {
        toast.success(`تم استيراد ${result.success} موظف بنجاح`);
        onImported?.();
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} صفوف فشلت — راجع التفاصيل`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'فشل الاستيراد');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-[#714B67]/5">
          <div>
            <div className="flex items-center gap-2 text-[#714B67] font-black text-sm">
              <FileSpreadsheet size={18} />
              استيراد الموظفين (Excel / CSV)
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Odoo 18 — رفع دفعة واحدة مع تاريخ المباشرة الأصلي لحساب EOS والأرصدة الافتتاحية
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X size={18} />
          </button>
        </header>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <button
            type="button"
            onClick={() => downloadEmployeeImportTemplate()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#714B67]/40 text-[#714B67] font-bold text-xs hover:bg-purple-50 cursor-pointer"
          >
            <Download size={16} />
            تحميل قالب Excel الجاهز (Template)
          </button>

          <label
            className="block rounded-xl border border-slate-200 bg-slate-50 p-6 text-center cursor-pointer hover:border-[#714B67]/50 transition"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <span className="text-sm font-bold text-slate-800">اختر ملف .xlsx أو .csv</span>
            <p className="text-[10px] text-slate-500 mt-1">الصف 1 عناوين — الصف 3 مثال (احذفه قبل الرفع)</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
          </label>

          {fileName && (
            <p className="text-xs text-slate-600 font-medium">
              الملف: <span className="font-mono text-slate-900">{fileName}</span>
              {rowCount > 0 && (
                <span className="text-[#714B67] font-bold"> — {rowCount} موظف جاهز للاستيراد</span>
              )}
            </p>
          )}

          {summary && (
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <div className="px-3 py-2 bg-slate-50 font-bold text-slate-700 flex justify-between">
                <span>نتيجة الاستيراد</span>
                <span>
                  نجح {summary.success} / {summary.total}
                </span>
              </div>
              <ul className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                {summary.results.map((r) => (
                  <li key={r.rowNumber} className="px-3 py-2 flex items-start gap-2">
                    {r.success ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>
                      صف {r.rowNumber}: {r.name || '—'}{' '}
                      {r.success ? `(${r.employeeId})` : `— ${r.error}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="p-4 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
          >
            إغلاق
          </button>
          <button
            type="button"
            disabled={importing || rowCount === 0}
            onClick={() => void runImport()}
            className="flex-1 py-2.5 rounded-xl bg-[#714B67] text-white font-bold cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            استيراد الآن
          </button>
        </footer>
      </div>
    </div>
  );
};
