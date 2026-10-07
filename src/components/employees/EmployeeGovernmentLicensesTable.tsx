import React from 'react';
import { Eye, Upload, X } from 'lucide-react';

type LicenseRow = {
  id: string;
  typeLabel: string;
  numberFields: { key: string; altKey?: string; placeholder: string };
  expiryField: string;
  docKey: string;
  docTitle: string;
};

const LICENSE_ROWS: LicenseRow[] = [
  {
    id: 'moh',
    typeLabel: 'ترخيص مزاولة المهنة (MOH)',
    numberFields: { key: 'mohLicense', altKey: 'mohLicenseNo', placeholder: 'رقم الترخيص' },
    expiryField: 'mohLicenseExpiry',
    docKey: 'mohLicense',
    docTitle: 'ترخيص MOH',
  },
  {
    id: 'medical',
    typeLabel: 'الشهادة الصحية / الفحص الطبي',
    numberFields: { key: 'medicalFitnessNo', placeholder: 'رقم الشهادة' },
    expiryField: 'medicalFitnessExpiry',
    docKey: 'medicalFitness',
    docTitle: 'شهادة الفحص الطبي',
  },
  {
    id: 'workBadge',
    typeLabel: 'بطاقة العمل / الهوية',
    numberFields: { key: 'workBadgeNo', altKey: 'badgeId', placeholder: 'رقم البطاقة' },
    expiryField: 'workBadgeExpiry',
    docKey: 'workBadgeScan',
    docTitle: 'بطاقة العمل',
  },
  {
    id: 'driving',
    typeLabel: 'رخصة القيادة',
    numberFields: { key: 'drivingLicenseNo', placeholder: 'رقم الرخصة' },
    expiryField: 'drivingLicenseExpiry',
    docKey: 'drivingLicenseScan',
    docTitle: 'رخصة القيادة',
  },
];

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleDocFileUpload: (docKey: string, e: React.ChangeEvent<HTMLInputElement>, customTitle?: string) => void;
  handleRemoveDocFile: (docKey: string) => void;
  onPreviewFile?: (url: string, title: string) => void;
}

export const EmployeeGovernmentLicensesTable: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  handleDocFileUpload,
  handleRemoveDocFile,
  onPreviewFile,
}) => {
  const files = employee.documentFiles || {};

  const readNumber = (row: LicenseRow) => {
    const { key, altKey } = row.numberFields;
    return employee[key] || (altKey ? employee[altKey] : '') || '';
  };

  const writeNumber = (row: LicenseRow, value: string) => {
    const { key, altKey } = row.numberFields;
    handleFieldChange(key, value);
    if (altKey) handleFieldChange(altKey, value);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <h3 className="text-xs font-black text-slate-900">الهويات والتراخيص الحكومية</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">
          أدخل الرقم وتاريخ الانتهاء وارفع المرفق مباشرة — بدون مفاتيح تفعيل.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-right min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
              <th className="px-3 py-2 whitespace-nowrap">نوع الترخيص</th>
              <th className="px-3 py-2 whitespace-nowrap">الرقم</th>
              <th className="px-3 py-2 whitespace-nowrap">تاريخ الانتهاء</th>
              <th className="px-3 py-2 whitespace-nowrap">المرفق</th>
            </tr>
          </thead>
          <tbody>
            {LICENSE_ROWS.map((row) => {
              const file = files[row.docKey];
              const expiry = (employee[row.expiryField] || '').toString().slice(0, 10);
              return (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-bold text-slate-800 align-middle">{row.typeLabel}</td>
                  <td className="px-3 py-2 align-middle">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={readNumber(row)}
                        onChange={(e) => writeNumber(row, e.target.value)}
                        placeholder={row.numberFields.placeholder}
                        className="w-full max-w-[180px] border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] focus:border-[#714B67]/50 focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono text-slate-700">{readNumber(row) || '—'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    {isEditMode ? (
                      <input
                        type="date"
                        value={expiry}
                        onChange={(e) => handleFieldChange(row.expiryField, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] focus:border-[#714B67]/50 focus:outline-none"
                      />
                    ) : (
                      <span className="font-mono text-slate-700">{expiry || '—'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {file?.url ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewFile
                                ? onPreviewFile(file.url, row.docTitle)
                                : window.open(file.url, '_blank')
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold cursor-pointer hover:bg-emerald-100"
                          >
                            <Eye className="w-3 h-3" />
                            عرض
                          </button>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile(row.docKey)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="إزالة المرفق"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : isEditMode ? (
                        <label className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20 font-bold cursor-pointer hover:bg-[#714B67]/15">
                          <Upload className="w-3 h-3" />
                          رفع
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => handleDocFileUpload(row.docKey, e, row.docTitle)}
                          />
                        </label>
                      ) : (
                        <span className="text-slate-400">لا يوجد مرفق</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
