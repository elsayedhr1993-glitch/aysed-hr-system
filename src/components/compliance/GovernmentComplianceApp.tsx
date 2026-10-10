import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, Loader2, MoreHorizontal, Pencil, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCompany } from '../../context/CompanyContext';
import { isQueryableTenantCompanyId } from '../../utils/tenantCompanyId';
import { GOVERNMENT_COMPLIANCE_DEPARTMENTS } from '../../config/governmentComplianceDepartments';
import type { DepartmentId, LicenseDocument } from '../../types/governmentLicense';
import { getLicenseDaysRemaining } from '../../utils/governmentLicenseExpiry';
import {
  archiveGovernmentLicense,
  deleteGovernmentLicense,
  subscribeGovernmentLicenses,
  upsertGovernmentLicense,
} from '../../services/governmentLicenseService';
import {
  uploadGovernmentLicenseAttachmentToStorage,
  validateGovernmentLicenseAttachment,
} from '../../utils/governmentLicenseStorage';

export const GovernmentComplianceApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';

  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<LicenseDocument[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [renewLicenseId, setRenewLicenseId] = useState<string | null>(null);
  const [renewExpiry, setRenewExpiry] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);
  const [savingLicense, setSavingLicense] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
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

  const activeDocuments = useMemo(
    () => documents.filter((d) => !d.archived),
    [documents]
  );

  const deptStats = useMemo(() => {
    const stats: Record<string, { total: number; expiringSoon: number }> = {};
    GOVERNMENT_COMPLIANCE_DEPARTMENTS.forEach((dept) => {
      const deptDocs = activeDocuments.filter((d) => d.departmentId === dept.id);
      const expiring = deptDocs.filter((d) => {
        const { status } = getLicenseDaysRemaining(d.expiryDate);
        return status === 'warning' || status === 'expired';
      }).length;
      stats[dept.id] = { total: deptDocs.length, expiringSoon: expiring };
    });
    return stats;
  }, [activeDocuments]);

  const activeDepartment = GOVERNMENT_COMPLIANCE_DEPARTMENTS.find((d) => d.id === selectedDeptId);
  const activeFolder = activeDepartment?.folders.find((f) => f.id === selectedFolderId);

  const filteredDocuments = useMemo(() => {
    if (!selectedDeptId || !selectedFolderId) return [];
    return documents.filter((d) => {
      if (d.departmentId !== selectedDeptId || d.folderId !== selectedFolderId) return false;
      if (showArchived) return Boolean(d.archived);
      return !d.archived;
    });
  }, [documents, selectedDeptId, selectedFolderId, showArchived]);

  const openAddModal = () => {
    setEditingLicenseId(null);
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
    setAttachmentFile(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    setAddOpen(true);
  };

  const openEditModal = (lic: LicenseDocument) => {
    setEditingLicenseId(lic.id);
    setForm({
      title: lic.title,
      documentNumber: lic.documentNumber,
      expiryDate: lic.expiryDate,
      employeeId: lic.employeeId || '',
      employeeName: lic.employeeName || '',
      vehiclePlate: lic.vehiclePlate || '',
      fileUrl: lic.fileUrl || '',
    });
    setAttachmentFile(null);
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    setAddOpen(true);
    setOpenActionsId(null);
  };

  const openRenewModal = (lic: LicenseDocument) => {
    setRenewLicenseId(lic.id);
    setRenewExpiry(lic.expiryDate);
    setOpenActionsId(null);
  };

  const handleRenewExpiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewLicenseId || !renewExpiry || !isQueryableTenantCompanyId(companyId)) return;
    const lic = documents.find((d) => d.id === renewLicenseId);
    if (!lic) return;
    setRowBusyId(renewLicenseId);
    try {
      await upsertGovernmentLicense(companyId, { ...lic, expiryDate: renewExpiry });
      toast.success('تم تحديث تاريخ الصلاحية ومزامنة النظام');
      setRenewLicenseId(null);
    } catch (err) {
      console.error(err);
      toast.error('تعذر تحديث الصلاحية');
    } finally {
      setRowBusyId(null);
    }
  };

  const handleArchiveLicense = async (lic: LicenseDocument) => {
    const nextArchived = !lic.archived;
    const ok = window.confirm(
      nextArchived
        ? `أرشفة «${lic.title}»؟ سيُحفظ في أرشيف الوثائق ويُخفى من القائمة النشطة.`
        : `إلغاء أرشفة «${lic.title}» وإعادته للقائمة النشطة؟`
    );
    if (!ok) return;
    setRowBusyId(lic.id);
    setOpenActionsId(null);
    try {
      await archiveGovernmentLicense(companyId, lic.id, nextArchived);
      toast.success(nextArchived ? 'تمت الأرشفة والمزامنة' : 'تمت إعادة التفعيل والمزامنة');
    } catch (err) {
      console.error(err);
      toast.error('تعذر تحديث الأرشفة');
    } finally {
      setRowBusyId(null);
    }
  };

  const handleDeleteLicense = async (lic: LicenseDocument) => {
    const ok = window.confirm(
      `حذف «${lic.title}» نهائياً؟\nسيتم إزالة السجل من الشجرة وملف الشركة المرتبط. لا يمكن التراجع.`
    );
    if (!ok) return;
    setRowBusyId(lic.id);
    setOpenActionsId(null);
    try {
      await deleteGovernmentLicense(companyId, lic.id);
      toast.success('تم الحذف ومزامنة ملف الشركة');
    } catch (err) {
      console.error(err);
      toast.error('تعذر الحذف');
    } finally {
      setRowBusyId(null);
    }
  };

  const onAttachmentSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentFile(null);
      return;
    }
    const err = validateGovernmentLicenseAttachment(file);
    if (err) {
      toast.error(err);
      e.target.value = '';
      setAttachmentFile(null);
      return;
    }
    setAttachmentFile(file);
    setForm((f) => ({ ...f, fileUrl: '' }));
  };

  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isQueryableTenantCompanyId(companyId) || !selectedDeptId || !selectedFolderId) return;
    if (!form.title.trim() || !form.documentNumber.trim() || !form.expiryDate) {
      toast.error('أكمل المسمى، الرقم، وتاريخ الانتهاء');
      return;
    }
    setSavingLicense(true);
    try {
      let fileUrl = form.fileUrl.trim() || undefined;
      if (attachmentFile) {
        const uploaded = await uploadGovernmentLicenseAttachmentToStorage({
          companyId,
          departmentId: selectedDeptId,
          folderId: selectedFolderId,
          documentNumber: form.documentNumber.trim(),
          file: attachmentFile,
        });
        fileUrl = uploaded.downloadUrl;
      }

      const existing = editingLicenseId
        ? documents.find((d) => d.id === editingLicenseId)
        : undefined;

      await upsertGovernmentLicense(companyId, {
        id: editingLicenseId || undefined,
        departmentId: selectedDeptId,
        folderId: selectedFolderId,
        title: form.title.trim(),
        documentNumber: form.documentNumber.trim(),
        expiryDate: form.expiryDate,
        employeeId: form.employeeId.trim() || undefined,
        employeeName: form.employeeName.trim() || undefined,
        vehiclePlate: form.vehiclePlate.trim() || undefined,
        fileUrl,
        archived: existing?.archived,
        archivedAt: existing?.archivedAt,
      });
      toast.success(editingLicenseId ? 'تم التحديث والمزامنة مع النظام' : 'تم الحفظ والمزامنة مع النظام');
      setAddOpen(false);
      setEditingLicenseId(null);
      setAttachmentFile(null);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'تعذر حفظ الترخيص';
      toast.error(message);
    } finally {
      setSavingLicense(false);
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
              const count = activeDocuments.filter(
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
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-slate-300 text-[#714B67]"
                />
                عرض المؤرشف
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectedFolderId(null);
                  setShowArchived(false);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                العودة للمجلدات
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {showArchived
                  ? 'لا توجد سجلات مؤرشفة في هذا المجلد.'
                  : 'لا توجد تراخيص مسجلة في هذا المجلد. استخدم «إضافة ترخيص جديد» لربط وثيقة بالسحابة.'}
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
                        <tr
                          key={doc.id}
                          className={`hover:bg-slate-50/60 transition-colors ${doc.archived ? 'opacity-75 bg-slate-50/40' : ''}`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {doc.title}
                            {doc.archived && (
                              <span className="mr-2 text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                                مؤرشف
                              </span>
                            )}
                          </td>
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
                            <div className="inline-flex items-center justify-center gap-1 flex-wrap">
                              {doc.fileUrl && (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-semibold transition-colors"
                                >
                                  مرفق
                                </a>
                              )}
                              <div className="relative">
                                <button
                                  type="button"
                                  disabled={rowBusyId === doc.id}
                                  onClick={() =>
                                    setOpenActionsId((id) => (id === doc.id ? null : doc.id))
                                  }
                                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer disabled:opacity-50"
                                  aria-label="إجراءات"
                                >
                                  {rowBusyId === doc.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="w-4 h-4" />
                                  )}
                                </button>
                                {openActionsId === doc.id && (
                                  <div
                                    className="absolute left-0 top-full mt-1 z-20 min-w-[11rem] bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-right text-[11px]"
                                    onMouseLeave={() => setOpenActionsId(null)}
                                  >
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                      onClick={() => openEditModal(doc)}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      تعديل البيانات
                                    </button>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                      onClick={() => openRenewModal(doc)}
                                    >
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      تجديد / تحديث الصلاحية
                                    </button>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                      onClick={() => void handleArchiveLicense(doc)}
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                      {doc.archived ? 'إلغاء الأرشفة' : 'أرشفة السجل'}
                                    </button>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                                      onClick={() => void handleDeleteLicense(doc)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      حذف نهائي
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
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
              <h4 className="text-sm font-black text-slate-900">
                {editingLicenseId ? 'تعديل ترخيص' : 'إضافة ترخيص'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setEditingLicenseId(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
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
                <label className="font-bold text-slate-700 block mb-1">مرفق الترخيص (اختياري)</label>
                <p className="text-[10px] text-slate-500 mb-2">PDF أو صورة PNG/JPG — يُرفع إلى Firebase Storage تلقائياً</p>
                <label
                  className="flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-slate-200 rounded-xl px-3 py-4 cursor-pointer hover:border-[#714B67]/40 hover:bg-slate-50/80 transition-colors"
                >
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">اختر ملفاً أو اسحبه هنا</span>
                  <span className="text-[10px] text-slate-400">PDF · PNG · JPG (حد أقصى 25 ميجابايت)</span>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                    className="hidden"
                    onChange={onAttachmentSelected}
                    disabled={savingLicense}
                  />
                </label>
                {attachmentFile && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2">
                    <span className="text-[10px] font-mono text-slate-700 truncate">{attachmentFile.name}</span>
                    <button
                      type="button"
                      className="text-[10px] text-rose-600 font-bold shrink-0 cursor-pointer"
                      onClick={() => {
                        setAttachmentFile(null);
                        if (attachmentInputRef.current) attachmentInputRef.current.value = '';
                      }}
                      disabled={savingLicense}
                    >
                      إزالة
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={savingLicense}
                className="w-full btn btn-primary bg-[#714B67] hover:bg-[#5b3c53] text-white font-bold py-2.5 rounded-lg cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingLicense ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {attachmentFile ? 'جاري رفع المرفق والحفظ…' : 'جاري الحفظ…'}
                  </>
                ) : (
                  editingLicenseId ? 'حفظ التعديل والمزامنة' : 'حفظ في السحابة والمزامنة'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {renewLicenseId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40" dir="rtl">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900">تحديث صلاحية الترخيص</h4>
              <button
                type="button"
                onClick={() => setRenewLicenseId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRenewExpiry} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">تاريخ الانتهاء الجديد</label>
                <input
                  type="date"
                  value={renewExpiry}
                  onChange={(e) => setRenewExpiry(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67]/50 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500">
                يُحدَّث ملف الموظف، أرشيف الوثائق، وملف الشركة تلقائياً عند الحفظ.
              </p>
              <button
                type="submit"
                disabled={rowBusyId === renewLicenseId}
                className="w-full bg-[#714B67] hover:bg-[#5b3c53] text-white font-bold py-2.5 rounded-lg cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {rowBusyId === renewLicenseId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري التحديث…
                  </>
                ) : (
                  'تأكيد التجديد'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentComplianceApp;
