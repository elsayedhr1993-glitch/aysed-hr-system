import React, { useRef, useState } from 'react';
import { checkDocumentExpiry } from '../../../utils/dateUtils';
import { Eye, Upload, X, FileText, Pencil, Camera, Loader2 } from 'lucide-react';
import { EmployeeGovernmentRegistryLicenses } from '../EmployeeGovernmentRegistryLicenses';
import { employeeRequiresMohCompliance } from '../../../utils/employeeCompliance';
import { processAnyDocument } from '../../../utils/ocrService';
import toast from 'react-hot-toast';

interface Props {
  employee: any;
  setEmployee: React.Dispatch<React.SetStateAction<any>>;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleOcrResult: (data: any, type: string) => void;
  handleDocFileUpload: (docKey: string, e: React.ChangeEvent<HTMLInputElement>, customTitle?: string) => void;
  handleRemoveDocFile: (docKey: string) => void;
  handleToggleDocRequirement: (docKey: string) => void;
}

type DocCardDef = {
  key: string;
  icon: string;
  title: string;
  ocrType: string;
  uploadTitle: string;
  getNumber: (emp: any) => string;
  getExpiry: (emp: any) => string | undefined;
  editFields?: { numberKey: string; expiryKey: string; numberLabel: string };
  show: (emp: any, checklist: Record<string, boolean>) => boolean;
};

function inferOcrDocType(data: Record<string, unknown>): string {
  if (data.license_no || data.medical_license_no || data.mohLicenseNo || data.mohLicense) {
    return 'medical_license';
  }
  if (data.passport_no || data.passportNo) return 'passport';
  if (data.work_permit_no || data.pam_no || data.documentNumber) return 'work_permit';
  if (data.salary || data.basic_salary || data.basicSalary || data.contractSalary) {
    return 'contract';
  }
  return 'civil_id';
}

function mapOcrPayload(extracted: Record<string, unknown>) {
  return {
    civil_id: extracted.civilId,
    civilId: extracted.civilId,
    full_name: extracted.fullNameAr || extracted.fullName,
    fullNameAr: extracted.fullNameAr || extracted.fullName,
    nameAr: extracted.fullNameAr || extracted.fullName,
    nationality: extracted.nationality,
    gender: extracted.gender,
    birth_date: extracted.birthDate || extracted.dob,
    birthDate: extracted.birthDate || extracted.dob,
    expiry_date: extracted.expiryDate,
    civil_id_expiry: extracted.expiryDate,
    passport_no: extracted.passportNo,
    passportNo: extracted.passportNo,
    passport_expiry: extracted.passportExpiryDate || extracted.expiryDate,
    name_en: extracted.fullNameEn,
    fullNameEn: extracted.fullNameEn,
    license_no: extracted.mohLicenseNo,
    medical_license_no: extracted.mohLicenseNo,
    license_expiry: extracted.mohLicenseExpiryDate || extracted.expiryDate,
    license_title: extracted.jobTitle || extracted.profession,
    work_permit_no: extracted.paciBuildingRef || extracted.civilId,
    pam_start: extracted.issueDate,
    pam_end: extracted.expiryDate,
    salary: extracted.contractSalary,
    basic_salary: extracted.contractSalary,
  };
}

const OCR_TO_DOC_KEY: Record<string, string> = {
  civil_id: 'civilIdScan',
  passport: 'passportScan',
  work_permit: 'pamWorkPermit',
  contract: 'signedContract',
  medical_license: 'mohLicense',
};

export const EmployeeDocumentsTab: React.FC<Props> = ({
  employee,
  setEmployee,
  isEditMode,
  handleFieldChange,
  handleOcrResult,
  handleDocFileUpload,
}) => {
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({ isOpen: false, url: '', title: '' });
  const [editingCardKey, setEditingCardKey] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const unifiedScanRef = useRef<HTMLInputElement>(null);
  const perCardUploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const requiredChecklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: employeeRequiresMohCompliance(employee),
    medicalFitness: true,
    signedContract: true,
    ...(employee.legalChecklist || {}),
    ...(employee.requiredDocuments
      ? Object.fromEntries(employee.requiredDocuments.map((k: string) => [k, true]))
      : {}),
  };

  const docCards: DocCardDef[] = [
    {
      key: 'civilIdScan',
      icon: '🪪',
      title: 'البطاقة المدنية',
      ocrType: 'civil_id',
      uploadTitle: 'البطاقة المدنية',
      getNumber: (e) => e.civilId || e.civil_id_number || '—',
      getExpiry: (e) => e.civilIdExpiry || e.civilIdExpiryDate || e.civil_id_expiry,
      editFields: {
        numberKey: 'civilId',
        expiryKey: 'civilIdExpiry',
        numberLabel: 'الرقم المدني',
      },
      show: (_, c) => !!c.civilIdScan,
    },
    {
      key: 'passportScan',
      icon: '✈️',
      title: 'جواز السفر',
      ocrType: 'passport',
      uploadTitle: 'جواز السفر',
      getNumber: (e) => e.passportNo || '—',
      getExpiry: (e) => e.passportExpiry || e.passportExpiryDate,
      editFields: { numberKey: 'passportNo', expiryKey: 'passportExpiry', numberLabel: 'رقم الجواز' },
      show: (_, c) => !!c.passportScan,
    },
    {
      key: 'pamWorkPermit',
      icon: '📜',
      title: 'إذن عمل PAM',
      ocrType: 'work_permit',
      uploadTitle: 'إذن العمل',
      getNumber: (e) => e.workPermitNo || `PAM-${e.id || '—'}`,
      getExpiry: (e) => e.contractEndDate || e.residencyExpiry,
      editFields: {
        numberKey: 'workPermitNo',
        expiryKey: 'contractEndDate',
        numberLabel: 'رقم إذن العمل',
      },
      show: (_, c) => !!c.pamWorkPermit,
    },
    {
      key: 'signedContract',
      icon: '✍️',
      title: 'عقد العمل',
      ocrType: 'contract',
      uploadTitle: 'عقد العمل الموقع',
      getNumber: (e) => e.contractType || 'عقد عمل',
      getExpiry: (e) => e.contractEndDate || e.hireDate,
      show: (_, c) => !!c.signedContract,
    },
    {
      key: 'mohLicense',
      icon: '🩺',
      title: 'ترخيص MOH',
      ocrType: 'medical_license',
      uploadTitle: 'ترخيص MOH',
      getNumber: (e) => e.mohLicense || e.mohLicenseNo || '—',
      getExpiry: (e) => e.mohLicenseExpiry,
      editFields: {
        numberKey: 'mohLicense',
        expiryKey: 'mohLicenseExpiry',
        numberLabel: 'رقم الترخيص',
      },
      show: (_, c) => !!c.mohLicense,
    },
    {
      key: 'medicalFitness',
      icon: '🏥',
      title: 'الشهادة الصحية',
      ocrType: 'medical_license',
      uploadTitle: 'شهادة الفحص الطبي',
      getNumber: (e) => e.medicalFitnessNo || e.medicalFitnessHospital || 'فحص طبي',
      getExpiry: (e) => e.medicalFitnessExpiry,
      editFields: {
        numberKey: 'medicalFitnessNo',
        expiryKey: 'medicalFitnessExpiry',
        numberLabel: 'رقم الشهادة',
      },
      show: (_, c) => !!c.medicalFitness,
    },
  ];

  const visibleCards = docCards.filter((d) => d.show(employee, requiredChecklist));

  const statusBadge = (expiryRaw: string | undefined, hasFile: boolean) => {
    const expiry = expiryRaw ? String(expiryRaw).slice(0, 10) : '';
    if (!expiry && !hasFile) {
      return { label: 'غير متوفر', className: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    if (!expiry) {
      return {
        label: hasFile ? 'مرفوع' : 'مسجل',
        className: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    const st = checkDocumentExpiry(expiry, 'وثيقة');
    if (st.isExpired) {
      return { label: 'منتهي', className: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (st.isExpiringSoon) {
      return { label: 'قريب الانتهاء', className: 'bg-amber-50 text-amber-900 border-amber-200' };
    }
    return { label: 'ساري', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  const triggerUpload = (docKey: string, title: string) => {
    const input = perCardUploadRefs.current[docKey];
    if (input) input.click();
    else {
      const el = document.createElement('input');
      el.type = 'file';
      el.accept = 'image/*,.pdf';
      el.onchange = (ev) => handleDocFileUpload(docKey, ev as unknown as React.ChangeEvent<HTMLInputElement>, title);
      el.click();
    }
  };

  const uploadFileForDocKey = (docKey: string, file: File, title: string) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = document.createElement('input');
    input.type = 'file';
    input.files = dt.files;
    handleDocFileUpload(docKey, { target: input } as React.ChangeEvent<HTMLInputElement>, title);
  };

  const handleUnifiedScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowed =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      /\.(pdf|png|jpe?g|webp)$/i.test(file.name);
    if (!allowed) {
      toast.error('يُسمح بصور أو PDF فقط.');
      return;
    }

    setScanLoading(true);
    try {
      const extracted = await processAnyDocument(file, undefined, 'AUTO_DETECT');
      const mapped = mapOcrPayload(extracted as Record<string, unknown>);
      const ocrType = inferOcrDocType(mapped);
      handleOcrResult(mapped, ocrType);
      const docKey = OCR_TO_DOC_KEY[ocrType] || 'civilIdScan';
      const card = docCards.find((c) => c.key === docKey);
      uploadFileForDocKey(docKey, file, card?.uploadTitle || 'مستند');
      toast.success(`تم التعرف على المستند وتحديث «${card?.title || docKey}»`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر قراءة المستند';
      toast.error(message);
    } finally {
      setScanLoading(false);
    }
  };

  const getFileUrl = (docKey: string) => {
    const f = employee.documentFiles?.[docKey];
    return f?.url || f?.fileUrl;
  };

  return (
    <>
      <div className="space-y-5 text-xs animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 max-w-xl">
            شبكة موحّدة لوثائق الهوية والامتثال. استخدم الماسح الذكي لملء الحقول ورفع المرفق تلقائياً، أو
            {isEditMode ? ' عدّل الحقول من أيقونة التعديل على كل كرت.' : ' فعّل «تعديل» من أعلى ملف الموظف لتعديل الأرقام والتواريخ.'}
          </p>
          <label
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-sm border transition ${
              scanLoading
                ? 'bg-slate-200 text-slate-500 border-slate-300 pointer-events-none'
                : 'bg-gradient-to-l from-[#714B67] to-indigo-700 text-white border-[#714B67]/40 hover:opacity-95'
            }`}
          >
            {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>⚡ ماسح المستندات الذكي (AI OCR)</span>
            <input
              ref={unifiedScanRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={scanLoading}
              onChange={handleUnifiedScan}
            />
          </label>
        </div>

        <EmployeeGovernmentRegistryLicenses
          employeeId={String(employee.id || '')}
          employeeName={employee.nameAr || employee.fullNameAr}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleCards.map((card) => {
            const expiry = card.getExpiry(employee);
            const hasFile = Boolean(employee.documentFiles?.[card.key]);
            const fileUrl = getFileUrl(card.key);
            const badge = statusBadge(expiry, hasFile);
            const isEditing = editingCardKey === card.key && isEditMode && card.editFields;

            return (
              <div
                key={card.key}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-[#714B67]/30 transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{card.icon}</span>
                      {card.title}
                    </h4>
                    {isEditing && card.editFields ? (
                      <div className="mt-2 space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">{card.editFields.numberLabel}</label>
                          <input
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs mt-0.5"
                            value={String(employee[card.editFields.numberKey] || '')}
                            onChange={(ev) => {
                              handleFieldChange(card.editFields!.numberKey, ev.target.value);
                              if (card.editFields!.numberKey === 'civilId') {
                                handleFieldChange('civil_id_number', ev.target.value);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500">تاريخ الانتهاء</label>
                          <input
                            type="date"
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-xs mt-0.5"
                            value={expiry ? String(expiry).slice(0, 10) : ''}
                            onChange={(ev) => handleFieldChange(card.editFields!.expiryKey, ev.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingCardKey(null)}
                          className="text-[10px] font-bold text-[#714B67] hover:underline cursor-pointer"
                        >
                          تم
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-mono text-[11px] text-slate-700 mt-1 truncate">
                          {card.getNumber(employee)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          الانتهاء:{' '}
                          <span className="font-mono font-semibold text-slate-800">
                            {expiry ? String(expiry).slice(0, 10) : '—'}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    disabled={!fileUrl}
                    onClick={() =>
                      fileUrl &&
                      setPreviewModal({ isOpen: true, url: fileUrl, title: card.title })
                    }
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    title="عرض المرفق"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    عرض
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerUpload(card.key, card.uploadTitle)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#714B67]/30 text-[10px] font-bold text-[#714B67] hover:bg-[#714B67]/5 cursor-pointer"
                    title="رفع أو مسح"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    رفع
                  </button>
                  {card.editFields && (
                    <button
                      type="button"
                      disabled={!isEditMode}
                      onClick={() => setEditingCardKey(card.key)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      title="تعديل الرقم والتاريخ"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      تعديل
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      perCardUploadRefs.current[card.key] = el;
                    }}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(ev) => handleDocFileUpload(card.key, ev, card.uploadTitle)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-2 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">{previewModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center">
              {previewModal.url.includes('application/pdf') || previewModal.url.startsWith('data:application/pdf') ? (
                <iframe src={previewModal.url} className="w-full h-full rounded-xl border border-slate-200" title="PDF" />
              ) : (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-w-full max-h-full object-contain rounded-xl border border-slate-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
