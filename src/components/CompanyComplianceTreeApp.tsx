import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  FolderPlus,
  PlusCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Loader2,
  CloudUpload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCompany } from '../context/CompanyContext';
import { isQueryableTenantCompanyId } from '../utils/tenantCompanyId';
import type {
  ComplianceTreeGovernmentDepartment,
  ComplianceTreeLicenseItem,
} from '../types/companyComplianceTree';
import { formatCompanyDocumentExpiryDisplay } from '../types/companyDocuments';
import {
  saveGovComplianceTree,
  subscribeGovComplianceTree,
} from '../services/companyComplianceTreeService';
import { getDocumentStatus } from '../types/companyDocuments';

function computeLicenseStatus(lic: Pick<ComplianceTreeLicenseItem, 'expiryDate' | 'isPermanent'>): ComplianceTreeLicenseItem['status'] {
  if (lic.isPermanent || !lic.expiryDate?.trim()) return 'active';
  const v = getDocumentStatus(lic.expiryDate);
  if (v.status === 'expired') return 'expired';
  if (v.status === 'expiring_soon') return 'expiring';
  return 'active';
}

const statusUi: Record<ComplianceTreeLicenseItem['status'], { label: string; className: string }> = {
  active: { label: 'ساري', className: 'text-emerald-700 bg-emerald-50' },
  expiring: { label: 'قريب الانتهاء', className: 'text-amber-800 bg-amber-50' },
  expired: { label: 'منتهي', className: 'text-rose-700 bg-rose-50' },
};

export const CompanyComplianceTreeApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id || '';

  const [departments, setDepartments] = useState<ComplianceTreeGovernmentDepartment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [collapsedDepts, setCollapsedDepts] = useState<Record<string, boolean>>({});
  const skipNextSaveRef = useRef(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const [isAddLicModalOpen, setIsAddLicModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [newLicName, setNewLicName] = useState('');
  const [newLicNum, setNewLicNum] = useState('');
  const [newLicExpiry, setNewLicExpiry] = useState('');
  const [newLicIsPermanent, setNewLicIsPermanent] = useState(false);

  useEffect(() => {
    if (!isQueryableTenantCompanyId(companyId)) {
      setDepartments([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    skipNextSaveRef.current = true;
    return subscribeGovComplianceTree(companyId, data => {
      setDepartments(data);
      setLoaded(true);
    });
  }, [companyId]);

  const persistTree = useCallback(
    async (next: ComplianceTreeGovernmentDepartment[]) => {
      if (!isQueryableTenantCompanyId(companyId)) return;
      setIsSaving(true);
      try {
        await saveGovComplianceTree(companyId, next);
      } catch (e) {
        console.error(e);
        toast.error('تعذر حفظ شجرة الامتثال في السحابة');
      } finally {
        setIsSaving(false);
      }
    },
    [companyId]
  );

  useEffect(() => {
    if (!loaded || !isQueryableTenantCompanyId(companyId)) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void persistTree(departments);
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [departments, loaded, companyId, persistTree]);

  const toggleDept = (deptId: string) => {
    setCollapsedDepts(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const newDept: ComplianceTreeGovernmentDepartment = {
      id: `dept-${Date.now()}`,
      nameAr: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase() || 'GOV',
      description: newDeptDesc.trim() || 'دائرة حكومية مضافة',
      licenses: [],
    };
    setDepartments(prev => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptDesc('');
    setIsAddDeptModalOpen(false);
    toast.success('تمت إضافة الدائرة الحكومية');
  };

  const handleAddLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !newLicName.trim()) return;
    const newLic: ComplianceTreeLicenseItem = {
      id: `lic-${Date.now()}`,
      name: newLicName.trim(),
      licenseNumber: newLicNum.trim() || 'غير محدد',
      expiryDate: newLicIsPermanent ? '' : newLicExpiry,
      isPermanent: newLicIsPermanent,
      status: computeLicenseStatus({
        expiryDate: newLicIsPermanent ? '' : newLicExpiry,
        isPermanent: newLicIsPermanent,
      }),
    };
    setDepartments(prev =>
      prev.map(dept =>
        dept.id === selectedDeptId ? { ...dept, licenses: [...dept.licenses, newLic] } : dept
      )
    );
    setNewLicName('');
    setNewLicNum('');
    setNewLicExpiry('');
    setNewLicIsPermanent(false);
    setIsAddLicModalOpen(false);
    setSelectedDeptId(null);
    toast.success('تمت إضافة الترخيص');
  };

  const handleDeleteLicense = (deptId: string, licId: string) => {
    setDepartments(prev =>
      prev.map(dept =>
        dept.id === deptId ? { ...dept, licenses: dept.licenses.filter(l => l.id !== licId) } : dept
      )
    );
  };

  if (!isQueryableTenantCompanyId(companyId)) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm" dir="rtl">
        اختر منشأة نشطة لعرض شجرة الامتثال الحكومي.
      </div>
    );
  }

  return (
    <div className="min-h-0 bg-slate-50 text-slate-800 font-sans antialiased" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>المنشأة والامتثال</span>
            <span>/</span>
            <span className="text-[#714B67] font-semibold">شجرة الامتثال الحكومي والتراخيص</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#714B67]" />
            هيكل المنشأة وفق التراخيص الحكومية
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCompany?.nameAr || activeCompany?.name || companyId}
            {isSaving && (
              <span className="inline-flex items-center gap-1 mr-2 text-[#714B67]">
                <Loader2 className="w-3 h-3 animate-spin" />
                جاري الحفظ…
              </span>
            )}
            {!isSaving && loaded && (
              <span className="inline-flex items-center gap-1 mr-2 text-emerald-700">
                <CloudUpload className="w-3 h-3" />
                متزامن
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddDeptModalOpen(true)}
          className="flex items-center gap-2 bg-[#714B67] hover:bg-[#5a3b52] text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          إضافة دائرة حكومية
        </button>
      </div>

      {!loaded ? (
        <div className="flex justify-center py-16 text-slate-500 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#714B67]" />
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map(dept => {
            const isCollapsed = collapsedDepts[dept.id];
            return (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 p-3.5 flex items-center justify-between border-b border-slate-200">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none min-w-0"
                    onClick={() => toggleDept(dept.id)}
                  >
                    <button type="button" className="text-slate-500 hover:text-slate-700 shrink-0">
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{dept.nameAr}</span>
                        <span className="bg-[#714B67]/10 text-[#714B67] text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{dept.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full">
                      {dept.licenses.length} تراخيص
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setIsAddLicModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-[11px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#714B67]" />
                      إضافة ترخيص
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-3">
                    {dept.licenses.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                        لا توجد تراخيص تحت هذه الدائرة حتى الآن.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                        {dept.licenses.map(lic => {
                          const st = statusUi[lic.status] || statusUi.active;
                          const expiryLabel = lic.isPermanent
                            ? 'دائم / غير محدد'
                            : formatCompanyDocumentExpiryDisplay(lic.expiryDate);
                          return (
                            <div
                              key={lic.id}
                              className="border border-slate-200 rounded-lg p-3 bg-white hover:border-[#714B67]/40 transition flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 text-[#714B67] shrink-0" />
                                    <h4 className="font-bold text-sm text-slate-900 leading-tight truncate">
                                      {lic.name}
                                    </h4>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLicense(dept.id, lic.id)}
                                    className="text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="text-[11px] text-slate-500 space-y-1 mb-2">
                                  <p className="font-mono">رقم القيد: {lic.licenseNumber}</p>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>الانتهاء: {expiryLabel}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                                <span
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${st.className}`}
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  {st.label}
                                </span>
                                {lic.fileUrl ? (
                                  <a
                                    href={lic.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#714B67] hover:underline flex items-center gap-0.5"
                                  >
                                    الملف
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400">بدون مرفق</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAddDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              إضافة دائرة حكومية جديدة
            </div>
            <form onSubmit={handleAddDepartment} className="p-4 space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الدائرة الحكومية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بلدية الكويت"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الرمز (Code)</label>
                <input
                  type="text"
                  placeholder="MUN"
                  value={newDeptCode}
                  onChange={e => setNewDeptCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67] uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف</label>
                <input
                  type="text"
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] text-white rounded-lg cursor-pointer font-bold"
                >
                  إضافة الدائرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddLicModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              إضافة ترخيص رسمي جديد
            </div>
            <form onSubmit={handleAddLicense} className="p-4 space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الترخيص / المستند</label>
                <input
                  type="text"
                  required
                  value={newLicName}
                  onChange={e => setNewLicName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الترخيص / القيد</label>
                <input
                  type="text"
                  value={newLicNum}
                  onChange={e => setNewLicNum(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  disabled={newLicIsPermanent}
                  value={newLicExpiry}
                  onChange={e => setNewLicExpiry(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:border-[#714B67] disabled:bg-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permCheckTree"
                  checked={newLicIsPermanent}
                  onChange={e => setNewLicIsPermanent(e.target.checked)}
                  className="rounded border-slate-300 text-[#714B67]"
                />
                <label htmlFor="permCheckTree" className="text-slate-700 text-xs">
                  دائم أو غير محدد (بدون تاريخ وهمي)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddLicModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
                <button type="submit" className="px-4 py-2 bg-[#714B67] text-white rounded-lg font-bold cursor-pointer">
                  حفظ الترخيص
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyComplianceTreeApp;
