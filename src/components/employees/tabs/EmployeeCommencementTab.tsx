import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Props {
  employee: any;
  commencementRecord?: {
    id?: string;
    status?: string;
    actualJoiningDate?: string;
    approvalDate?: string;
    workingSchedule?: string;
    location?: string;
    notes?: string;
  } | null;
  onOpenCommencementApp?: () => void;
}

export const EmployeeCommencementTab: React.FC<Props> = ({
  employee,
  commencementRecord,
  onOpenCommencementApp
}) => {
  const status = commencementRecord?.status || employee.commencementStatus || 'غير مسجل';
  const joiningDate =
    commencementRecord?.actualJoiningDate ||
    employee.commencementDate ||
    employee.hireDate ||
    employee.joinDate ||
    '—';

  const printCommencement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>إقرار مباشرة عمل - ${employee.nameAr || employee.name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: right; padding: 8px; border-bottom: 1px solid #eee; }
            th { width: 25%; font-size: 14px; color: #555; }
            td { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ملخص إقرار مباشرة عمل (من السجل المعتمد)</div>
          </div>
          <div class="box">
            <table>
              <tr><th>اسم الموظف</th><td>${employee.nameAr || employee.name}</td><th>الرقم المدني</th><td>${employee.civilId || '-'}</td></tr>
              <tr><th>تاريخ المباشرة</th><td>${joiningDate}</td><th>حالة الإقرار</th><td>${status}</td></tr>
              <tr><th>المشرف</th><td>${employee.directSupervisor || employee.manager || '-'}</td><th>جدول العمل</th><td>${commencementRecord?.workingSchedule || employee.workingSchedule || '-'}</td></tr>
            </table>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">ملخص إقرار المباشرة والعهد</h4>
          <p className="text-xs text-slate-500 max-w-xl">
            التعديل والاعتماد يتم في تطبيق <strong>إقرارات المباشرة</strong> فقط. هذا التبويب للعرض والطباعة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenCommencementApp && (
            <button
              type="button"
              onClick={onOpenCommencementApp}
              className="bg-[#714B67] hover:bg-[#5a3b52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={13} />
              فتح سجل المباشرة
            </button>
          )}
          <button
            type="button"
            onClick={printCommencement}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            طباعة الملخص
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-slate-500 font-semibold">تاريخ المباشرة المعتمد</span>
          <p className="font-mono font-bold text-slate-900 mt-1">{joiningDate}</p>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">حالة الإقرار</span>
          <p className="font-bold text-slate-900 mt-1">{status}</p>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">المشرف المباشر</span>
          <p className="font-bold text-slate-900 mt-1">{employee.directSupervisor || employee.manager || '—'}</p>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">جدول / موقع العمل</span>
          <p className="font-bold text-slate-900 mt-1">
            {commencementRecord?.workingSchedule || employee.workingSchedule || '—'}
            {commencementRecord?.location ? ` • ${commencementRecord.location}` : ''}
          </p>
        </div>
        {commencementRecord?.id && (
          <div className="md:col-span-2">
            <span className="text-slate-500 font-semibold">رقم السجل</span>
            <p className="font-mono text-[11px] text-slate-700 mt-1">{commencementRecord.id}</p>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 mb-2">العهد والتجهيزات (من ملف الموظف)</label>
        <div className="flex flex-wrap gap-2">
          {(employee.custodyItems || [
            'لاب توب محمول / جهاز كمبيوتر',
            'بريد إلكتروني رسمي (@company.com)',
            'بطاقة وبصمة بوابات المبنى'
          ]).map((item: string, idx: number) => (
            <span
              key={idx}
              className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800"
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
