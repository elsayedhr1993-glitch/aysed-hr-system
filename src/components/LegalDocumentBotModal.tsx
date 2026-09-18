import React, { useState, useRef } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Scale, X,
  FileSignature, Search, ShieldCheck, Download, Building
} from 'lucide-react';
import { processAnyDocument } from '../utils/ocrService';
import { parseKuwaitCivilCardOCR } from '../services/ocrService';
import type { Contract, Employee } from '../types';
import {
  auditPamContractAgainstRecord,
  findEmployeeForPamAudit,
} from '../lib/pamContractAudit';

interface LegalDocumentBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  employees?: Employee[];
  contracts?: Contract[];
}

export const LegalDocumentBotModal: React.FC<LegalDocumentBotModalProps> = ({
  isOpen,
  onClose,
  companyId,
  employees = [],
  contracts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'CONTRACTS' | 'PAM_AUDIT' | 'OCR_EXTRACTION'>('CONTRACTS');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      if (activeTab === 'OCR_EXTRACTION') {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result as string;
          const extractedData = await parseKuwaitCivilCardOCR(base64String, 'بطاقة مدنية كويتية');
          setIsScanning(false);
          setScanResult({
            type: 'ID_CARD',
            data: {
              name: extractedData.nameAr || extractedData.nameEn || '',
              civilId: extractedData.civilId || '',
              nationality: extractedData.nationality || '',
              expiry: extractedData.expiryDate || '',
            },
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      const docType =
        activeTab === 'PAM_AUDIT' ? 'PAM_WORK_PERMIT' : 'EMPLOYMENT_CONTRACT';
      const ocr = await processAnyDocument(file, undefined, docType);

      if (activeTab === 'PAM_AUDIT') {
        const employee = findEmployeeForPamAudit(employees, ocr as Record<string, unknown>, companyId);
        const contract = employee
          ? contracts.find((c) => c.employeeId === employee.id)
          : undefined;
        const audit = auditPamContractAgainstRecord(
          ocr as Record<string, unknown>,
          employee,
          contract
        );

        setIsScanning(false);
        setScanResult({
          type: 'PAM_CONTRACT',
          score: audit.score,
          findings: audit.findings,
          matchedEmployeeId: audit.matchedEmployeeId,
          extracted: audit.extracted,
        });
        return;
      }

      // CONTRACTS — عرض حقول مستخرجة فقط (بدون نتيجة عشوائية)
      const fields = [
        { label: 'الاسم', value: (ocr as any).fullNameAr || (ocr as any).fullName },
        { label: 'الرقم المدني', value: (ocr as any).civilId },
        { label: 'المسمى', value: (ocr as any).profession || (ocr as any).jobTitle },
        { label: 'الراتب الأساسي', value: (ocr as any).basicSalary || (ocr as any).contractSalary },
        { label: 'تاريخ البداية', value: (ocr as any).pamStartDate || (ocr as any).issueDate },
        { label: 'تاريخ النهاية', value: (ocr as any).pamEndDate || (ocr as any).expiryDate },
      ].filter((f) => f.value);

      setIsScanning(false);
      setScanResult({
        type: 'CONTRACT_EXTRACT',
        fields,
        findings: fields.length
          ? [
              {
                type: 'success',
                text: 'تم استخراج الحقول التالية من المستند عبر OCR. للمراجعة القانونية التفصيلية استخدم مساعد Aysed HR Copilot.',
              },
            ]
          : [
              {
                type: 'warning',
                text: 'لم يُستخرج حقول كافية من المستند. تأكد من وضوح الصورة أو PDF.',
              },
            ],
      });
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      setScanResult({
        type: 'ERROR',
        findings: [{ type: 'error', text: 'فشل تحليل المستند. حاول ملفاً أوضح (JPG/PNG/PDF).' }],
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center shadow-lg">
              <Scale size={24} className="text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">المستشار القانوني وقارئ العقود</h2>
              <p className="text-xs text-slate-300 font-medium">
                OCR حقيقي + تدقيق PAM مقابل سجلات الموظفين (بدون نتائج عشوائية).
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition cursor-pointer relative z-10">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('CONTRACTS'); setScanResult(null); }}
            className={`px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2 ${activeTab === 'CONTRACTS' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <FileSignature size={16} />
            <span>استخراج بنود العقد</span>
          </button>
          <button
            onClick={() => { setActiveTab('PAM_AUDIT'); setScanResult(null); }}
            className={`px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2 ${activeTab === 'PAM_AUDIT' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Building size={16} />
            <span>تدقيق PAM مقابل السجل</span>
          </button>
          <button
            onClick={() => { setActiveTab('OCR_EXTRACTION'); setScanResult(null); }}
            className={`px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2 ${activeTab === 'OCR_EXTRACTION' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Search size={16} />
            <span>استخراج بطاقة مدنية</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">

          {!isScanning && !scanResult && (
            <div className="max-w-xl mx-auto mt-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-white hover:bg-slate-50 hover:border-blue-400 transition cursor-pointer group"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                <div className="text-center">
                  <h3 className="font-black text-slate-800 text-lg">
                    {activeTab === 'OCR_EXTRACTION' ? 'رفع بطاقة مدنية أو جواز' : 'رفع عقد (PDF أو صورة)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">المعالجة عبر خادم OCR (Gemini Vision)</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept={activeTab === 'OCR_EXTRACTION' ? 'image/*,application/pdf' : 'application/pdf,image/*'}
                />
              </div>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 border-4 border-slate-200 rounded-full border-t-blue-600 animate-spin" />
              <h3 className="font-black text-slate-800 text-lg">جاري قراءة المستند...</h3>
            </div>
          )}

          {scanResult && !isScanning && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={22} className="text-emerald-600" />
                  <span>نتيجة الفحص</span>
                </h3>
                <button
                  onClick={() => setScanResult(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  فحص مستند آخر
                </button>
              </div>

              {scanResult.type === 'PAM_CONTRACT' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-sm font-bold text-slate-500">نسبة التطابق مع السجل</div>
                    <div className={`text-5xl font-black ${scanResult.score >= 85 ? 'text-emerald-600' : scanResult.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {scanResult.score}%
                    </div>
                    {scanResult.matchedEmployeeId && (
                      <div className="text-[10px] text-slate-500">موظف: {scanResult.matchedEmployeeId}</div>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                    <h4 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-3">ملاحظات التدقيق:</h4>
                    {scanResult.findings.map((finding: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                          finding.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                          finding.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                          'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        {finding.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />}
                        {finding.type === 'warning' && <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />}
                        {finding.type === 'error' && <X size={18} className="text-rose-600 shrink-0 mt-0.5" />}
                        <p className="text-xs font-bold leading-relaxed">{finding.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scanResult.type === 'CONTRACT_EXTRACT' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  {scanResult.fields?.map((f: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm border-b border-slate-100 py-2">
                      <span className="text-slate-500 font-bold">{f.label}</span>
                      <span className="font-mono text-slate-900">{f.value}</span>
                    </div>
                  ))}
                  {scanResult.findings?.map((finding: any, idx: number) => (
                    <p key={idx} className="text-xs text-slate-600">{finding.text}</p>
                  ))}
                </div>
              )}

              {scanResult.type === 'ID_CARD' && scanResult.data && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(scanResult.data).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-500 block text-xs">{k}</span>
                      <span className="font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {scanResult.type === 'ERROR' && scanResult.findings?.map((f: any, i: number) => (
                <p key={i} className="text-rose-700 text-sm font-bold">{f.text}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
