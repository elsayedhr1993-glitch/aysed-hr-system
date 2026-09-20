import React from 'react';

export interface OperationalAbsenceRow {
  id: string;
  date?: string;
  employeeName?: string;
  employeeId?: string;
  department?: string;
  status?: string;
  notes?: string;
  excuseReason?: string;
}

interface OperationalAbsencePanelProps {
  rows: OperationalAbsenceRow[];
}

export const OperationalAbsencePanel: React.FC<OperationalAbsencePanelProps> = ({ rows }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
        <strong>غياب تشغيلي:</strong> من سجلات الحضور (<code className="font-mono">attendance_records</code>) — وليس طلبات
        الإجازة. اعتماد الشهر وخصومات الغياب من تطبيق <strong>الحضور والانصراف</strong>.
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold">
            <tr>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الموظف</th>
              <th className="p-3 text-right">القسم</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  لا توجد سجلات غياب تشغيلي حالياً.
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono">{row.date || '—'}</td>
                  <td className="p-3 font-bold">{row.employeeName || row.employeeId || '—'}</td>
                  <td className="p-3">{row.department || '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-bold">
                      {row.status || 'absent'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{row.notes || row.excuseReason || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
