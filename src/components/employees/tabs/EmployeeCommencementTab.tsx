import React from 'react';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
}

export const EmployeeCommencementTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange
}) => {
  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">إقرار المباشرة والعهد (Job Commencement & Custody)</h4>
          <p className="text-xs text-slate-500">إثبات استلام الموظف لمهام عمله والعهد والتجهيزات المسلمة له</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
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
                      .signatures { display: flex; justify-content: space-between; margin-top: 60px; }
                      .sig-box { text-align: center; width: 45%; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <div class="title">نموذج وإقرار مباشرة عمل موظف رسمي (Job Commencement Form)</div>
                    </div>
                    <div class="box">
                      <strong>بيانات الموظف والمباشرة:</strong>
                      <table>
                        <tr><th>اسم الموظف</th><td>${employee.nameAr || employee.name}</td><th>الرقم المدني</th><td>${employee.civilId || '-'}</td></tr>
                        <tr><th>المسمى الوظيفي</th><td>${employee.jobTitle || '-'}</td><th>القسم / الإدارة</th><td>${employee.department || '-'}</td></tr>
                        <tr><th>تاريخ المباشرة الفعلية</th><td>${employee.commencementDate || employee.hireDate || '-'}</td><th>المشرف المباشر</th><td>${employee.directSupervisor || employee.manager || '-'}</td></tr>
                      </table>
                    </div>
                    <div class="box">
                      <strong>إقرار استلام العهد والتجهيزات:</strong>
                      <p style="font-size: 12px; margin-top: 8px;">يقر الموظف المذكور أعلاه بأنه استلم كافة العهد والتجهيزات المبينة أدناه بحالة جيدة وتعهد بالمحافظة عليها:</p>
                      <ul>
                        ${(employee.custodyItems || ['لاب توب محمول / جهاز كمبيوتر', 'بريد إلكتروني رسمي (@company.com)', 'بطاقة وبصمة بوابات المبنى']).map((c: string) => `<li>${c}</li>`).join('')}
                      </ul>
                    </div>
                    <div class="signatures">
                      <div class="sig-box">
                        <strong>توقيع الموظف المباشر</strong><br/><br/><br/>
                        <span>التاريخ: ${employee.commencementDate || employee.hireDate || ''}</span>
                      </div>
                      <div class="sig-box">
                        <strong>اعتماد مدير الموارد البشرية</strong><br/><br/><br/>
                      </div>
                    </div>
                    <script>window.print();</script>
                  </body>
                </html>
              `);
              printWindow.document.close();
            }
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>🖨️ طباعة إقرار المباشرة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="py-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ المباشرة الفعلية</label>
          {isEditMode ? (
            <input
              type="date"
              value={employee.commencementDate || employee.hireDate || ''}
              onChange={(e) => handleFieldChange('commencementDate', e.target.value)}
              className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
            />
          ) : (
            <div className="font-mono font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.commencementDate || employee.hireDate || '—'}
            </div>
          )}
        </div>

        <div className="py-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">المشرف المباشر</label>
          {isEditMode ? (
            <input
              type="text"
              value={employee.directSupervisor || employee.manager || ''}
              onChange={(e) => handleFieldChange('directSupervisor', e.target.value)}
              className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-bold text-slate-900 bg-white focus:outline-none text-sm"
            />
          ) : (
            <div className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-1">
              {employee.directSupervisor || employee.manager || 'مدير القسم'}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 mb-2">العهد والتجهيزات الرسمية المسلمة للموظف</label>
        <div className="flex flex-wrap gap-2 pt-1">
          {(employee.custodyItems || [
            'لاب توب محمول / جهاز كمبيوتر',
            'بريد إلكتروني رسمي (@company.com)',
            'بطاقة وبصمة بوابات المبنى'
          ]).map((item: string, idx: number) => (
            <span key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
