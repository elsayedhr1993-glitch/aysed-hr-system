import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';
import { subscribeGovernmentLicenses } from '../../services/governmentLicenseService';
import { findDepartmentFolder } from '../../config/governmentComplianceDepartments';
import { getLicenseDaysRemaining } from '../../utils/governmentLicenseExpiry';
import type { LicenseDocument } from '../../types/governmentLicense';

interface Props {
  employeeId: string;
  employeeName?: string;
}

export const EmployeeGovernmentRegistryLicenses: React.FC<Props> = ({ employeeId, employeeName }) => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';
  const [licenses, setLicenses] = useState<LicenseDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = String(employeeId || '').trim();
    if (!isQueryableTenantCompanyId(companyId) || !id) {
      setLicenses([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    return subscribeGovernmentLicenses(
      companyId,
      (list) => {
        setLicenses(list);
        setLoaded(true);
      },
      { employeeId: id }
    );
  }, [companyId, employeeId]);

  if (!employeeId) return null;

  return (
    <div className="rounded-2xl border border-[#714B67]/20 bg-[#714B67]/5 overflow-hidden shadow-2xs" dir="rtl">
      <div className="px-4 py-3 border-b border-[#714B67]/15 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-black text-slate-900">تراخيص مرتبطة من شجرة الامتثال</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            تُجلب تلقائياً من <code className="font-mono text-[9px]">companies/…/licenses</code> حسب{' '}
            <strong>employeeId</strong>
            {employeeName ? ` — ${employeeName}` : ''}
          </p>
        </div>
      </div>

      {!loaded && (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري التحميل...
        </div>
      )}

      {loaded && licenses.length === 0 && (
        <p className="text-[11px] text-slate-500 px-4 py-5 text-center">
          لا توجد تراخيص مسجلة في السجل الحكومي لهذا الموظف. أضف ترخيصاً من تطبيق شجرة الامتثال واربطه بمعرّف
          الموظف.
        </p>
      )}

      {loaded && licenses.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-right min-w-[520px]">
            <thead className="bg-white/80 text-slate-600 font-bold border-b border-slate-200/80">
              <tr>
                <th className="py-2 px-3">الترخيص</th>
                <th className="py-2 px-3">الجهة / المجلد</th>
                <th className="py-2 px-3">الرقم</th>
                <th className="py-2 px-3">الانتهاء</th>
                <th className="py-2 px-3">الحالة</th>
                <th className="py-2 px-3 text-center">مرفق</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => {
                const { department, folder } = findDepartmentFolder(lic.departmentId, lic.folderId);
                const { status, label } = getLicenseDaysRemaining(lic.expiryDate);
                return (
                  <tr key={lic.id} className="border-b border-white/60 hover:bg-white/50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{lic.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {department?.icon} {department?.name}
                      <span className="text-slate-400 block text-[10px]">{folder?.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{lic.documentNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{lic.expiryDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          status === 'expired'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : status === 'warning'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {lic.fileUrl ? (
                        <a
                          href={lic.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[#714B67] font-bold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          عرض
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
