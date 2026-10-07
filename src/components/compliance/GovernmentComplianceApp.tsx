import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCompany } from '../../context/CompanyContext';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';
import { GOVERNMENT_COMPLIANCE_DEPARTMENTS } from '../../config/governmentComplianceDepartments';
import type { DepartmentId, LicenseDocument } from '../../types/governmentLicense';
import { getLicenseDaysRemaining } from '../../utils/governmentLicenseExpiry';
import {
  subscribeGovernmentLicenses,
  upsertGovernmentLicense,
} from '../../services/governmentLicenseService';

export const GovernmentComplianceApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';

  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<LicenseDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    documentNumber: '',
    expiryDate: '',
    employeeId: '',
    employeeName: '',
    vehiclePlate: '',
    fileUrl: '',
  });

  useEffect(() => {
    if (!isQueryableTenantCompanyId(companyId)) {
      setDocuments([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    return subscribeGovernmentLicenses(companyId, (list) => {
      setDocuments(list);
      setLoaded(true);
    });
  }, [companyId]);

  const deptStats = useMemo(() => {
    const stats: Record<string, { total: number; expiringSoon: number }> = {};
    GOVERNMENT_COMPLIANCE_DEPARTMENTS.forEach((dept) => {
      const deptDocs = documents.filter((d) => d.departmentId === dept.id);
      const expiring = deptDocs.filter((d) => {
        const { status } = getLicenseDaysRemaining(d.expiryDate);
        return status === 'warning' || status === 'expired';
      }).length;
      stats[dept.id] = { total: deptDocs.length, expiringSoon: expiring };
    });
    return stats;
  }, [documents]);

  const activeDepartment = GOVERNMENT_COMPLIANCE_DEPARTMENTS.find((d) => d.id === selectedDeptId);
  const activeFolder = activeDepartment?.folders.find((f) => f.id === selectedFolderId);

  const filteredDocuments = useMemo(() => {
    if (!selectedDeptId || !selectedFolderId) return [];
    return documents.filter(
      (d) => d.departmentId === selectedDeptId && d.folderId === selectedFolderId
    );
  }, [documents, selectedDeptId, selectedFolderId]);

  const openAddModal = () => {
    if (!selectedDeptId || !selectedFolderId) {
      toast.error('اختر جهة حكومية ومجلداً قبل إضافة ترخيص');
      return;
    }
    setForm({
      title: '',
      documentNumber: '',
      expiryDate: '',
      employeeId: '',
      employeeName: '',
      vehiclePlate: '',
      fileUrl: '',
    });
    setAddOpen(true);
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQueryableTenantCompanyId(companyId) || !selectedDeptId || !selectedFolderId) return;
    if (!form.title.trim() || !form.documentNumber.trim() || !form.expiryDate) {
      toast.error('أكمل المسمى، الرقم، وتاريخ الانتهاء');
      return;
    }
    try {
      await upsertGovernmentLicense(companyId, {
        departmentId: selectedDeptId,
        folderId: selectedFolderId,
        title: form.title.trim(),
        documentNumber: form.documentNumber.trim(),
        expiryDate: form.expiryDate,
        employeeId: form.employeeId.trim() || undefined,
        employeeName: form.employeeName.trim() || undefined,
        vehiclePlate: form.vehiclePlate.trim() || undefined,
        fileUrl: form.fileUrl.trim() || undefined,
      });
      toast.success('تم حفظ الترخيص في السحابة');
      setAddOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('تعذر حفظ الترخيص');
    }
  };

  if (!isQueryableTenantCompanyId(companyId)) {
    return (
      <div className="p-8 text-center text-sm text-slate-500" dir="rtl">
        اختر منشأة نشطة لعرض شجرة الامتثال الحكومي والتراخيص.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-2xs">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => {
              setSelectedDeptId(null);
              setSelectedFolderId(null);
            }}
            className={`hover:text-[#714B67] transition-colors cursor-pointer ${
              !selectedDeptId ? 'text-slate-900 font-bold' : ''
            }`}
          >
            🏛️ شجرة الامتثال الحكومي
          </button>

          {activeDepartment && (
            <>
              <span className="text-slate-400">/</span>
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={`hover:text-[#714B67] transition-colors cursor-pointer ${
                  !selectedFolderId ? 'text-slate-900 font-bold' : ''
                }`}
              >
                {activeDepartment.icon} {activeDepartment.name}
              </button>
            </>
          )}

          {activeFolder && (
            <>
              <span className="text-slate-400">/</span>
              <span className="text-slate-900 font-bold">
                {activeFolder.icon} {activeFolder.name}
              </span>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={openAddModal}
          className="btn btn-primary bg-[#714B67] hover:bg-[#5b3c53] text-white text-xs md:text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span>
          <span>إضافة ترخيص جديد</span>
        </button>
      </div>

      {!loaded && (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#714B67]" />
          جاري تحميل التراخيص من السحابة...
        </div>
      )}

      {loaded && !selectedDeptId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GOVERNMENT_COMPLIANCE_DEPARTMENTS.map((dept) => {
            const stats = deptStats[dept.id] || { total: 0, expiringSoon: 0 };
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className="text-right bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-md hover:border-[#714B67]/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-slate-50 rounded-lg group-hover:scale-105 transition-transform">
                      {dept.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base group-hover:text-[#714B67]">
                        {dept.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{dept.code}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-semibold shrink-0">
                    {dept.folders.length} مجلدات
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    إجمالي التراخيص: <strong className="text-slate-800 font-bold">{stats.total}</strong>
                  </span>
                  {stats.expiringSoon > 0 ? (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      ⚠️ {stats.expiringSoon} يتطلب تجديد
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      ✓ ساري بالكامل
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {loaded && selectedDeptId && !selectedFolderId && activeDepartment && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>{activeDepartment.icon}</span>
              <span>مجلدات {activeDepartment.name}</span>
            </h2>
            <button
              type="button"
              onClick={() => setSelectedDeptId(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              العودة للجهات الحكومية
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDepartment.folders.map((folder) => {
              const count = documents.filter(
                (d) => d.departmentId === activeDepartment.id && d.folderId === folder.id
              ).length;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="text-right bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-[#714B67] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-50 rounded-lg">{folder.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{folder.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{folder.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">المستندات المحفوظة:</span>
                    <span className="font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">{count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loaded && selectedFolderId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>{activeFolder?.icon}</span>
                <span>{activeFolder?.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeFolder?.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer shrink-0"
            >
              العودة للمجلدات
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                لا توجد تراخيص مسجلة في هذا المجلد. استخدم «إضافة ترخيص جديد» لربط وثيقة بالسحابة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs md:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">مسمى الترخيص / الوثيقة</th>
                      <th className="py-3 px-4">رقم السجل / الترخيص</th>
                      <th className="py-3 px-4">الارتباط (موظف / مركبة)</th>
                      <th className="py-3 px-4">تاريخ الانتهاء</th>
                      <th className="py-3 px-4">الحالة والمهلة</th>
                      <th className="py-3 px-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => {
                      const { status, label } = getLicenseDaysRemaining(doc.expiryDate);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{doc.title}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{doc.documentNumber}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {doc.employeeName ? (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                👤 {doc.employeeName}
                              </span>
                            ) : doc.vehiclePlate ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-mono">
                                🚗 {doc.vehiclePlate}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">منشأة عامة</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">{doc.expiryDate}</td>
                          <td className="py-3.5 px-4">
                            {status === 'valid' && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-xs font-semibold">
                                ✓ {label}
                              </span>
                            )}
                            {status === 'warning' && (
                              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded text-xs font-semibold">
                                ⚠️ {label}
                              </span>
                            )}
                            {status === 'expired' && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded text-xs font-semibold">
                                ✕ {label}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {doc.fileUrl ? (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-semibold transition-colors inline-block"
                              >
                                معاينة PDF
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
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
        </div>
      )}

      {addOpen && selectedDeptId && selectedFolderId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40" dir="rtl">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">إضافة ترخيص</h4>
              <button type="button" onClick={() => setAddOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              {activeDepartment?.name} / {activeFolder?.name}
            </p>
            <form onSubmit={handleSaveLicense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">مسمى الترخيص</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67]/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم الترخيص</label>
                <input
                  value={form.documentNumber}
                  onChange={(e) => setForm((f) => ({ ...f, documentNumber: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#714B67]/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67]/50 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">معرّف الموظف (اختياري)</label>
                  <input
                    value={form.employeeId}
                    onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono text-[10px] focus:outline-none"
                    placeholder="Firestore employee id"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم الموظف</label>
                  <input
                    value={form.employeeName}
                    onChange={(e) => setForm((f) => ({ ...f, employeeName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">لوحة مركبة (اختياري)</label>
                <input
                  value={form.vehiclePlate}
                  onChange={(e) => setForm((f) => ({ ...f, vehiclePlate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">رابط المرفق (اختياري)</label>
                <input
                  value={form.fileUrl}
                  onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[10px] focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                className="w-full btn btn-primary bg-[#714B67] hover:bg-[#5b3c53] text-white font-bold py-2.5 rounded-lg cursor-pointer"
              >
                حفظ في السحابة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentComplianceApp;
