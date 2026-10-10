import React, { useMemo } from 'react';
import {
  GOVERNMENT_COMPLIANCE_DEPARTMENTS,
  findDepartmentFolder,
} from '../../config/governmentComplianceDepartments';
import type { LicenseDocument } from '../../types/governmentLicense';
import type { FacilityLicenseData } from '../../types/facilityLicense';
import { getLicenseDaysRemaining } from '../../utils/governmentLicenseExpiry';

export const COMPLIANCE_TREE_PRINT_ROOT_ID = 'compliance-tree-print-root';

type DeptStat = { total: number; expiringSoon: number };

function deptStatusLabel(stat: DeptStat, hasExpired: boolean): string {
  if (stat.total === 0) return 'غير مسجل';
  if (hasExpired) return 'منتهي / يتطلب إجراء';
  if (stat.expiringSoon > 0) return 'تنبيه قرب انتهاء';
  return 'ساري';
}

function statusBadgeAr(status: 'valid' | 'warning' | 'expired'): string {
  if (status === 'expired') return 'منتهي';
  if (status === 'warning') return 'تنبيه قرب انتهاء';
  return 'ساري';
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const s = String(value).slice(0, 10);
  return s || '—';
}

export interface ComplianceTreePrintReportProps {
  companyNameAr: string;
  companyNameEn?: string;
  logoUrl?: string;
  paciCivilId?: string;
  generatedAt: string;
  facility?: FacilityLicenseData | null;
  activeDocuments: LicenseDocument[];
  deptStats: Record<string, DeptStat>;
}

export const ComplianceTreePrintReport: React.FC<ComplianceTreePrintReportProps> = ({
  companyNameAr,
  companyNameEn,
  logoUrl,
  paciCivilId,
  generatedAt,
  facility,
  activeDocuments,
  deptStats,
}) => {
  const deptExpiredFlags = useMemo(() => {
    const flags: Record<string, boolean> = {};
    GOVERNMENT_COMPLIANCE_DEPARTMENTS.forEach((dept) => {
      const hasExpired = activeDocuments.some(
        (d) =>
          d.departmentId === dept.id &&
          getLicenseDaysRemaining(d.expiryDate).status === 'expired'
      );
      flags[dept.id] = hasExpired;
    });
    return flags;
  }, [activeDocuments]);

  const masterPathNotes: Record<string, string> = {
    MOH: facility?.mohLicenseNo
      ? `ترخيص المنشأة: ${facility.mohLicenseNo} · انتهاء ${formatDate(facility.mohExpiryDate)}`
      : '',
    PAM: facility?.pamFileCode
      ? `ملف PAM: ${facility.pamFileCode}${facility.authorizedSignatoryName ? ` · ${facility.authorizedSignatoryName}` : ''}`
      : '',
    KFF: facility?.kffLicenseNo
      ? `ترخيص KFF: ${facility.kffLicenseNo} · انتهاء ${formatDate(facility.kffExpiryDate)}`
      : '',
    BALADIYA: facility?.baladiyaLicenseNo
      ? `بلدية: ${facility.baladiyaLicenseNo} · انتهاء ${formatDate(facility.baladiyaExpiryDate)}`
      : '',
    MOI_TRAFFIC: '',
  };

  const sortedDocs = [...activeDocuments].sort((a, b) => {
    const deptOrder = GOVERNMENT_COMPLIANCE_DEPARTMENTS.findIndex((d) => d.id === a.departmentId) -
      GOVERNMENT_COMPLIANCE_DEPARTMENTS.findIndex((d) => d.id === b.departmentId);
    if (deptOrder !== 0) return deptOrder;
    return (a.title || '').localeCompare(b.title || '', 'ar');
  });

  return (
    <div
      id={COMPLIANCE_TREE_PRINT_ROOT_ID}
      className="odoo-report-sheet compliance-tree-print-report bg-white text-slate-900 p-8"
      dir="rtl"
    >
      <div className="odoo-report-letterhead">
        <div className="odoo-report-letterhead-accent" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-16 h-16 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-white">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] text-slate-400 font-bold">شعار المنشأة</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-black text-[#714B67]">{companyNameAr || 'المنشأة'}</h1>
              {companyNameEn ? (
                <p className="text-xs font-mono text-slate-600 mt-0.5">{companyNameEn}</p>
              ) : null}
              <p className="text-[11px] text-slate-600 mt-1">
                الرقم المدني للجهة (PACI):{' '}
                <strong className="font-mono">{paciCivilId || facility?.paciCivilId || '—'}</strong>
              </p>
            </div>
          </div>
          <div className="text-left text-[11px] text-slate-600 shrink-0">
            <div className="font-bold text-slate-800">تقرير الامتثال الحكومي</div>
            <div>تاريخ الاستخراج: {generatedAt}</div>
          </div>
        </div>
      </div>

      <div className="odoo-report-title-band my-4 text-center">
        <div className="text-sm font-black text-[#714B67]">ملخص مسارات الامتثال والتراخيص</div>
        <div className="text-[10px] text-slate-500 mt-0.5">MOH · PAM · KFF · البلدية · الخدمات العامة</div>
      </div>

      <div className="odoo-report-table-wrap mb-6">
        <table className="odoo-report-table">
          <thead>
            <tr>
              <th>المسار / الجهة</th>
              <th>الحالة</th>
              <th>عدد التراخيص</th>
              <th>بيانات مرجعية</th>
            </tr>
          </thead>
          <tbody>
            {GOVERNMENT_COMPLIANCE_DEPARTMENTS.map((dept) => {
              const stat = deptStats[dept.id] || { total: 0, expiringSoon: 0 };
              return (
                <tr key={dept.id}>
                  <td className="font-bold">{dept.name} ({dept.code})</td>
                  <td>{deptStatusLabel(stat, Boolean(deptExpiredFlags[dept.id]))}</td>
                  <td className="font-mono text-center">{stat.total}</td>
                  <td className="text-[10px]">{masterPathNotes[dept.id] || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-xs font-black text-slate-800 mb-2 border-b border-slate-300 pb-1">
        تفاصيل التراخيص والمستندات
      </h2>

      <div className="odoo-report-table-wrap mb-8">
        <table className="odoo-report-table text-[10px]">
          <thead>
            <tr>
              <th>الجهة / المجلد</th>
              <th>العنوان</th>
              <th>رقم الترخيص</th>
              <th>تاريخ الإصدار</th>
              <th>تاريخ الانتهاء</th>
              <th>الأيام المتبقية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {sortedDocs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-slate-500 py-4">
                  لا توجد تراخيص نشطة مسجلة في شجرة الامتثال — راجع بيانات معالج تراخيص المنشأة في الملخص أعلاه.
                </td>
              </tr>
            ) : (
              sortedDocs.map((doc) => {
                const { department, folder } = findDepartmentFolder(doc.departmentId, doc.folderId);
                const rem = getLicenseDaysRemaining(doc.expiryDate);
                const issueDate = doc.updatedAt ? formatDate(doc.updatedAt) : '—';
                return (
                  <tr key={doc.id}>
                    <td>
                      {department?.name || doc.departmentId}
                      <br />
                      <span className="text-slate-500">{folder?.name || doc.folderId}</span>
                    </td>
                    <td>{doc.title}</td>
                    <td className="font-mono">{doc.documentNumber || '—'}</td>
                    <td className="font-mono">{issueDate}</td>
                    <td className="font-mono">{formatDate(doc.expiryDate)}</td>
                    <td className="font-mono text-center">{rem.days}</td>
                    <td>{statusBadgeAr(rem.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-400 text-[11px]">
        <div>
          <p className="font-bold text-slate-800 mb-6">توقيع مسؤول الموارد البشرية</p>
          <div className="border-b border-slate-400 h-10" />
          <p className="text-slate-500 mt-2">الاسم والتوقيع</p>
        </div>
        <div>
          <p className="font-bold text-slate-800 mb-6">ختم المنشأة والاعتماد</p>
          <div className="border border-dashed border-slate-400 h-16 rounded-md flex items-center justify-center text-slate-400">
            مكان الختم
          </div>
        </div>
      </div>

      <p className="text-[9px] text-slate-400 text-center mt-6">
        وثيقة مُولَّدة من نظام Aysed HR — شجرة الامتثال الحكومي · للاستخدام الداخلي الرسمي
      </p>
    </div>
  );
};
