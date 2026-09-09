import React, { useState, useRef } from 'react';
import { checkDocumentExpiry } from '../../../utils/dateUtils';
import { Camera, FileText, CheckCircle2, Shield, Upload, X, ZoomIn, Search, FileSignature, Folder, FolderOpen, RefreshCw, ZoomOut, FolderArchive, Plus, CheckSquare, Square, FileCheck, Eye, Download, Trash2 } from 'lucide-react';
import { TabDocumentScanner } from '../../TabDocumentScanner';
import { EditableField } from '../../EditableField';

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

export const EmployeeDocumentsTab: React.FC<Props> = ({
  employee,
  setEmployee,
  isEditMode,
  handleFieldChange,
  handleOcrResult,
  handleDocFileUpload,
  handleRemoveDocFile,
  handleToggleDocRequirement
}) => {
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; url: string; title: string; fileType?: string }>({ isOpen: false, url: '', title: '', fileType: '' });

  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
    employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
    
  const requiredChecklist: Record<string, boolean> = {
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: isMedicalStaff || (employee.dept || employee.department) === 'الأطباء',
    medicalFitness: true,
    signedContract: true,
    ...(employee.legalChecklist || {}),
    ...(employee.requiredDocuments ? Object.fromEntries(employee.requiredDocuments.map((k: string) => [k, true])) : {})
  };

  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState('');
  
  const handleAddCustomDocument = () => {
    if (!customDocTitle.trim()) return;
    const newDoc = {
      id: 'custom_' + Date.now(),
      title: customDocTitle,
      required: false,
    };
    const current = employee.customDocuments || [];
    setEmployee((prev: any) => ({ ...prev, customDocuments: [...current, newDoc] }));
    setCustomDocTitle('');
    setShowAddCustomModal(false);
  };
  
  const openFile = (url: string, title: string) => {
    setPreviewModal({ isOpen: true, url, title });
  };

  return (
    <>

          <div className="space-y-6 text-xs animate-fade-in">
            
            {/* 1. شريط التحكم بحالة الربط الديناميكي مع خطة التعيين */}
            <div className="bg-slate-900 text-white rounded-2xl p-4.5 shadow-md border border-slate-800 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                    <FolderArchive className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      الأرشيف والمستندات الإلزامية للموظف (الربط الديناميكي مع خطة التعيين)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      يتم توليد وإظهار خانات الوثائق أدناه استناداً إلى الوثائق التي تم تحديدها أثناء معالج التعيين والتهيئة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مستند إضافي</span>
                  </button>
                </div>
              </div>

              {/* Toggle checklist tags */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 ml-2">الوثائق المطلوبة للملف:</span>
                
                {[
                  { key: 'civilIdScan', label: '🪪 البطاقة المدنية', required: true },
                  { key: 'passportScan', label: '✈️ جواز السفر', required: true },
                  { key: 'pamWorkPermit', label: '📜 إذن عمل PAM', required: true },
                  { key: 'mohLicense', label: '🩺 ترخيص مزاولة المهنة MOH', conditional: true },
                  { key: 'medicalFitness', label: '🏥 شهادة الفحص الطبي', required: true },
                  { key: 'signedContract', label: '✍️ عقد العمل وإقرار المباشرة', required: true },
                  ...(employee.customDocuments || []).map((cd: any) => ({ key: cd.id, label: `📁 ${cd.title}`, custom: true }))
                ].map((item) => {
                  const isChecked = !!requiredChecklist[item.key];
                  const hasFile = !!(employee.documentFiles && employee.documentFiles[item.key]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleDocRequirement(item.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        isChecked 
                          ? hasFile
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                            : 'bg-purple-950/70 border-purple-500/60 text-purple-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isChecked ? <CheckSquare className="w-3 h-3 text-emerald-400" /> : <Square className="w-3 h-3 text-slate-500" />}
                      <span>{item.label}</span>
                      {hasFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. بطاقات مؤشرات حالة الوثائق (Dynamic KPI Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              
              {/* البطاقة المدنية */}
              {requiredChecklist.civilIdScan && (() => {
                const civilDate = employee.civilIdExpiry || employee.civilIdExpiryDate || employee.civil_id_expiry;
                const status = checkDocumentExpiry(civilDate, 'المدنية');
                return (
                <div className={`border rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs transition ${
                  status.isExpired 
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400' 
                    : status.isExpiringSoon 
                    ? 'bg-amber-50/80 border-amber-300' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🪪 البطاقة المدنية</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      status.isExpired
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : employee.documentFiles?.civilIdScan
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.civilIdExpiry
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {status.isExpired ? status.badgeText : employee.documentFiles?.civilIdScan ? 'مرفوع ✅' : employee.civilIdExpiry ? 'مسجل 📝' : 'بانتظار الرفع ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.civilId || employee.civil_id_number || 'غير مدخلة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between items-center">
                    <span>الانتهاء:</span>
                    <span className={`font-mono font-bold ${status.isExpired ? 'text-rose-700 underline' : 'text-slate-700'}`}>
                      {civilDate || 'غير محدد'}
                    </span>
                  </div>
                </div>
              );
              })()}

              {/* جواز السفر */}
              {requiredChecklist.passportScan && (() => {
                const passDate = employee.passportExpiry || employee.passportExpiryDate;
                const status = checkDocumentExpiry(passDate, 'جواز السفر');
                return (
                <div className={`border rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs transition ${
                  status.isExpired 
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400' 
                    : status.isExpiringSoon 
                    ? 'bg-amber-50/80 border-amber-300' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">✈️ جواز السفر</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      status.isExpired
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                        : employee.documentFiles?.passportScan
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.passportExpiry
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {status.isExpired ? status.badgeText : employee.documentFiles?.passportScan ? 'مرفوع ✅' : employee.passportExpiry ? 'ساري 📝' : 'بانتظار الرفع ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.passportNo || 'غير مدخل'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between items-center">
                    <span>الانتهاء:</span>
                    <span className={`font-mono font-bold ${status.isExpired ? 'text-rose-700 underline' : 'text-slate-700'}`}>
                      {passDate || 'غير محدد'}
                    </span>
                  </div>
                </div>
              );
              })()}

              {/* إذن العمل PAM */}
              {requiredChecklist.pamWorkPermit && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">📜 إذن عمل PAM</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.pamWorkPermit
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-purple-100 text-purple-900 border border-purple-300'
                    }`}>
                      {employee.documentFiles?.pamWorkPermit ? 'مرفوع ✅' : 'معتمد'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.workPermitNo || `PAM-${employee.id || '2026'}`}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>نهاية العقد:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.contractEndDate || '2027-01-01'}</span>
                  </div>
                </div>
              )}

              {/* ترخيص وزارة الصحة MOH */}
              {requiredChecklist.mohLicense && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🩺 ترخيص MOH</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.mohLicense
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : employee.mohLicense
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.mohLicense ? 'مرفوع ✅' : employee.mohLicense ? 'مسجل 🩺' : 'قيد الاستخراج ⏳'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-slate-700 truncate">
                    {employee.mohLicense || 'MOH-TEMP'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الانتهاء:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.mohLicenseExpiry || 'غير محدد'}</span>
                  </div>
                </div>
              )}

              {/* شهادة الفحص الطبي */}
              {requiredChecklist.medicalFitness && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">🏥 الفحص الطبي</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.medicalFitness || employee.medicalFitnessStatus === 'fit'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.medicalFitness ? 'مرفوع ✅' : employee.medicalFitnessStatus === 'fit' ? 'لائق طبياً' : 'بانتظار الشهادة'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">
                    {employee.medicalFitnessHospital || 'إدارة الصحة العامة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الحالة:</span>
                    <span className="text-emerald-700 font-bold">{employee.medicalFitnessStatus === 'fit' ? 'لائق طبياً (Fit)' : 'قيد المراجعة'}</span>
                  </div>
                </div>
              )}

              {/* عقد العمل وإقرار المباشرة */}
              {requiredChecklist.signedContract && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">✍️ عقد العمل</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.signedContract || employee.contractSigned
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {employee.documentFiles?.signedContract ? 'مرفوع وموقع ✅' : 'موقع ومعتمد'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 truncate">
                    {employee.contractType || 'محدد المدة'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>المباشرة:</span>
                    <span className="font-mono text-slate-700 font-bold">{employee.hireDate || employee.contractStartDate || '2026-01-01'}</span>
                  </div>
                </div>
              )}

              {/* Custom Documents KPIs */}
              {(employee.customDocuments || []).map((cd: any) => (
                <div key={cd.id} className="bg-slate-50 border border-purple-200 rounded-xl p-3 flex flex-col justify-between space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] truncate">📁 {cd.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      employee.documentFiles?.[cd.id]
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {employee.documentFiles?.[cd.id] ? 'مرفوع ✅' : 'مستند إضافي'}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-purple-900 truncate">
                    {cd.category || 'ملف إداري'}
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>الحالة:</span>
                    <span className="text-slate-700 font-bold">{employee.documentFiles?.[cd.id] ? 'جاهز' : 'بانتظار الملف'}</span>
                  </div>
                </div>
              ))}

            </div>

            {/* 3. منصة استخراج ورفع وثائق الموظف المعتمدة (Workspace & Scanners Grid) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                    <span>🗄️ مساحات حفظ ورفع ومسح المستندات الرسمية</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يمكنك رفع الملفات الأصلية (PDF أو صور)، أو استخدام الماسح الضوئي الذكي (OCR) لاستخراج وتعبئة البيانات تلقائياً
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* 1. مساحة البطاقة المدنية */}
                {requiredChecklist.civilIdScan && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🪪</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">البطاقة المدنية الكويتية (Civil ID)</h5>
                          <span className="text-[10px] text-slate-400">وثيقة إثبات الهوية والإقامة الرسمية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="CIVIL_ID" 
                      title="مسح واستخراج البطاقة المدنية (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'civil_id')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم المدني (12 رقماً)</label>
                        <input
                          type="text"
                          maxLength={12}
                          value={employee.civil_id_number || employee.civilId || ''}
                          onChange={(e) => {
                            handleFieldChange('civil_id_number', e.target.value);
                            handleFieldChange('civilId', e.target.value);
                          }}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="290010100000"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء البطاقة</label>
                        <input
                          type="date"
                          value={employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('civilIdExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.civilIdScan ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.civilIdScan.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.civilIdScan.fileSize} • رُفع في {employee.documentFiles.civilIdScan.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'البطاقة المدنية الكويتية',
                                url: employee.documentFiles.civilIdScan.url,
                                fileType: employee.documentFiles.civilIdScan.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.civilIdScan.url}
                              download={employee.documentFiles.civilIdScan.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('civilIdScan')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة البطاقة المدنية الممسوحة (PDF / صورة)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG حتى 10MB</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('civilIdScan', e, 'البطاقة المدنية')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. مساحة جواز السفر */}
                {requiredChecklist.passportScan && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✈️</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">جواز السفر (Passport)</h5>
                          <span className="text-[10px] text-slate-400">وثيقة السفر وبيانات الاسم اللاتيني</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="PASSPORT" 
                      title="مسح واستخراج جواز السفر (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'passport')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم جواز السفر</label>
                        <input
                          type="text"
                          value={employee.passportNo || ''}
                          onChange={(e) => handleFieldChange('passportNo', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="A12345678"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الجواز</label>
                        <input
                          type="date"
                          value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('passportExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.passportScan ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.passportScan.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.passportScan.fileSize} • رُفع في {employee.documentFiles.passportScan.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'جواز السفر',
                                url: employee.documentFiles.passportScan.url,
                                fileType: employee.documentFiles.passportScan.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.passportScan.url}
                              download={employee.documentFiles.passportScan.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('passportScan')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة جواز السفر الممسوحة</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('passportScan', e, 'جواز السفر')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. مساحة إذن العمل PAM */}
                {requiredChecklist.pamWorkPermit && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📜</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">إذن عمل القوى العاملة (PAM Work Permit)</h5>
                          <span className="text-[10px] text-slate-400">تصريح العمل الرسمي الصادر من الهيئة العامة للقوى العاملة</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        إلزامية
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="WORK_PERMIT" 
                      title="مسح واستخراج إذن العمل (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'work_permit')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم إذن العمل (PAM No)</label>
                        <input
                          type="text"
                          value={employee.workPermitNo || ''}
                          onChange={(e) => handleFieldChange('workPermitNo', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="PAM-2026-00000"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المسمى المعتمد بالقوى العاملة</label>
                        <input
                          type="text"
                          value={employee.jobTitle || ''}
                          onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="طبيب بشري / ممرض / إداري"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.pamWorkPermit ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.pamWorkPermit.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.pamWorkPermit.fileSize} • رُفع في {employee.documentFiles.pamWorkPermit.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'إذن عمل القوى العاملة (PAM)',
                                url: employee.documentFiles.pamWorkPermit.url,
                                fileType: employee.documentFiles.pamWorkPermit.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.pamWorkPermit.url}
                              download={employee.documentFiles.pamWorkPermit.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('pamWorkPermit')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة إذن العمل الرسمي (PAM)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('pamWorkPermit', e, 'إذن العمل')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. مساحة ترخيص مزاولة المهنة MOH */}
                {requiredChecklist.mohLicense && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🩺</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">ترخيص مزاولة المهنة (MOH Medical License)</h5>
                          <span className="text-[10px] text-slate-400">ترخيص إدارة التراخيص الصحية بوزارة الصحة الكويتية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        كادر طبي
                      </span>
                    </div>

                    {/* Scanner */}
                    <TabDocumentScanner 
                      tabType="MEDICAL_LICENSE" 
                      title="مسح واستخراج ترخيص وزارة الصحة (OCR)" 
                      onDataExtracted={(data) => handleOcrResult(data, 'medical_license')} 
                    />

                    {/* Document Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم ترخيص MOH</label>
                        <input
                          type="text"
                          value={employee.mohLicense || ''}
                          onChange={(e) => handleFieldChange('mohLicense', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="MOH-DOC-1234"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الترخيص</label>
                        <input
                          type="date"
                          value={employee.mohLicenseExpiry ? employee.mohLicenseExpiry.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('mohLicenseExpiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.mohLicense ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.mohLicense.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.mohLicense.fileSize} • رُفع في {employee.documentFiles.mohLicense.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'ترخيص وزارة الصحة (MOH)',
                                url: employee.documentFiles.mohLicense.url,
                                fileType: employee.documentFiles.mohLicense.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.mohLicense.url}
                              download={employee.documentFiles.mohLicense.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('mohLicense')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع شهادة ترخيص مزاولة المهنة الطبية</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('mohLicense', e, 'ترخيص MOH')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. مساحة شهادة اللياقة والفحص الطبي */}
                {requiredChecklist.medicalFitness && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏥</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">شهادة اللياقة والفحص الطبي (Medical Fitness)</h5>
                          <span className="text-[10px] text-slate-400">شهادة الخلو من الأمراض والفحوصات المخبرية الرسمية</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                        فحص الإقامة
                      </span>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">حالة اللياقة الصحية</label>
                        <select
                          value={employee.medicalFitnessStatus || 'fit'}
                          onChange={(e) => handleFieldChange('medicalFitnessStatus', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="fit">✅ لائق طبياً - Fit for duty</option>
                          <option value="pending">⏳ بانتظار نتائج الفحص - Pending</option>
                          <option value="unfit">❌ غير لائق طبياً - Unfit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ إجراء الفحص</label>
                        <input
                          type="date"
                          value={employee.medicalFitnessDate ? employee.medicalFitnessDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('medicalFitnessDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">المركز / المستشفى الفاحص</label>
                        <input
                          type="text"
                          value={employee.medicalFitnessHospital || ''}
                          onChange={(e) => handleFieldChange('medicalFitnessHospital', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="إدارة الصحة العامة / مركز الفحص الطبي للعمالة الوافدة"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.medicalFitness ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.medicalFitness.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.medicalFitness.fileSize} • رُفع في {employee.documentFiles.medicalFitness.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'شهادة الفحص الطبي واللياقة',
                                url: employee.documentFiles.medicalFitness.url,
                                fileType: employee.documentFiles.medicalFitness.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.medicalFitness.url}
                              download={employee.documentFiles.medicalFitness.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('medicalFitness')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع تقرير وشهادة الفحص الطبي (PDF / صورة)</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('medicalFitness', e, 'الفحص الطبي')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. مساحة عقد العمل الموقع وإقرار المباشرة */}
                {requiredChecklist.signedContract && (
                  <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✍️</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">عقد العمل الموقع وإقرار المباشرة (Signed Contract)</h5>
                          <span className="text-[10px] text-slate-400">النسخة الموقعة من الطرفين ونموذج مباشرة العمل الفعلي</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                        معتمد قانونياً
                      </span>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">حالة توقيع العقد</label>
                        <select
                          value={employee.contractSigned ? 'signed' : 'pending'}
                          onChange={(e) => handleFieldChange('contractSigned', e.target.value === 'signed')}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="signed">✅ موقع ومعتمد من الطرفين</option>
                          <option value="pending">⏳ قيد التوقيع والمراجعة</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ توقيع العقد</label>
                        <input
                          type="date"
                          value={employee.contractSignDate ? employee.contractSignDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('contractSignDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ مباشرة العمل الفعلي</label>
                        <input
                          type="date"
                          value={employee.hireDate ? employee.hireDate.slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange('hireDate', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Attachment Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.signedContract ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles.signedContract.name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles.signedContract.fileSize} • رُفع في {employee.documentFiles.signedContract.uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: 'عقد العمل الموقع وإقرار المباشرة',
                                url: employee.documentFiles.signedContract.url,
                                fileType: employee.documentFiles.signedContract.type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles.signedContract.url}
                              download={employee.documentFiles.signedContract.name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile('signedContract')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع نسخة العقد الموقعة وإقرار المباشرة</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload('signedContract', e, 'عقد العمل')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* 7. مساحات الوثائق الإضافية المخصصة (Custom Documents) */}
                {(employee.customDocuments || []).map((cd: any) => (
                  <div key={cd.id} className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📁</span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{cd.title}</h5>
                          <span className="text-[10px] text-purple-700 font-bold">{cd.category}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedCustomList = (employee.customDocuments || []).filter((item: any) => item.id !== cd.id);
                          setEmployee((prev: any) => ({ ...prev, customDocuments: updatedCustomList }));
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="إزالة هذا المستند"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">الرقم المرجعي / البيان</label>
                        <input
                          type="text"
                          value={employee[`doc_ref_${cd.id}`] || ''}
                          onChange={(e) => handleFieldChange(`doc_ref_${cd.id}`, e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                          placeholder="رقم الوثيقة أو الملاحظة"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ انتهاء الصلاحية</label>
                        <input
                          type="date"
                          value={employee[`doc_exp_${cd.id}`] ? employee[`doc_exp_${cd.id}`].slice(0, 10) : ''}
                          onChange={(e) => handleFieldChange(`doc_exp_${cd.id}`, e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* File Upload Zone */}
                    <div className="pt-2 border-t border-slate-100">
                      {employee.documentFiles?.[cd.id] ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{employee.documentFiles[cd.id].name}</p>
                              <span className="text-[10px] text-slate-500">{employee.documentFiles[cd.id].fileSize} • رُفع في {employee.documentFiles[cd.id].uploadDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewModal({
                                isOpen: true,
                                title: cd.title,
                                url: employee.documentFiles[cd.id].url,
                                fileType: employee.documentFiles[cd.id].type
                              })}
                              className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition"
                              title="معاينة الملف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={employee.documentFiles[cd.id].url}
                              download={employee.documentFiles[cd.id].name}
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocFile(cd.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-purple-50/30 transition group">
                          <Upload className="w-4 h-4 text-slate-400 group-hover:text-purple-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-700">اضغط لرفع مستند ({cd.title})</span>
                          <span className="text-[9px] text-slate-400">يدعم PDF, PNG, JPG</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocFileUpload(cd.id, e, cd.title)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        
        

      {/* Add Custom Document Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">إضافة نوع مستند جديد</h3>
              <button onClick={() => setShowAddCustomModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم المستند المطلوب <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                  placeholder="مثال: شهادة لمن يهمه الأمر، رخصة قيادة..."
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddCustomDocument}
                  disabled={!customDocTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  إضافة المستند
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-2 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-scale-in relative">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{previewModal.title}</h3>
                  <p className="text-xs text-slate-500">معاينة المستند المرفوع</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={previewModal.url} 
                  download={`${previewModal.title}.pdf`}
                  className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-bold text-sm flex items-center gap-2"
                >
                  تحميل الملف
                </a>
                <button onClick={() => setPreviewModal({ isOpen: false, url: '', title: '', fileType: '' })} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center relative">
              {previewModal.url.includes('application/pdf') || previewModal.url.startsWith('data:application/pdf') ? (
                <object 
                  data={previewModal.url} 
                  type="application/pdf"
                  className="w-full h-full rounded-xl shadow-sm border border-slate-200"
                >
                  <iframe src={previewModal.url} className="w-full h-full rounded-xl" title="PDF Preview" />
                </object>
              ) : (
                <img 
                  src={previewModal.url} 
                  alt={previewModal.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-slate-200"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
