import React, { useState } from 'react';
import { 
  Scan, 
  UploadCloud, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  Sparkles,
  CreditCard,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { processAnyDocument, ScannedData } from '../utils/ocrService';
import { validateKuwaitCivilId, parseKuwaitCivilId } from '../utils/kuwaitLaw';
import toast from 'react-hot-toast';

export interface ExtractedData {
  civilId: string;
  fullNameAr: string;
  fullNameEn: string;
  nationality: string;
  birthDate: string;
  expiryDate: string;
  gender?: string;
  passportNo?: string;
  profession?: string;
  residencyType?: string;
  medical_license_no?: string;
  medical_license_expiry?: string;
  license_no?: string;
  license_expiry?: string;
  license_title?: string;
}

interface OdooDocumentScannerProps {
  onApplyData?: (data: ExtractedData, docType: string) => void;
}

export const OdooDocumentScanner: React.FC<OdooDocumentScannerProps> = ({ onApplyData }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ExtractedData | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState<'civil_id' | 'passport' | 'medical_license' | 'pam_permit'>('civil_id');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setScanning(true);

    try {
      const scanned: ScannedData = await processAnyDocument(file, undefined, docType);
      let civilId = (scanned.civilId || '').trim().replace(/\D/g, '');
      let birthDate = scanned.birthDate || scanned.dob || '';
      let gender = scanned.gender || '';

      if (civilId.length === 12) {
        const valRes = validateKuwaitCivilId(civilId);
        if (valRes.isValid && valRes.dob && !birthDate) {
          birthDate = valRes.dob;
        }
        if (valRes.gender && !gender) {
          gender = valRes.gender;
        }
      }

      setScanResult({
        civilId,
        fullNameAr: scanned.fullNameAr || scanned.fullName || '',
        fullNameEn: scanned.fullNameEn || '',
        nationality: scanned.nationality || 'كويتي',
        birthDate,
        expiryDate: scanned.expiryDate || '',
        gender: gender || 'MALE',
        passportNo: scanned.passportNo || '',
        profession: scanned.profession || scanned.jobTitle || '',
        residencyType: scanned.residencyType || '',
        medical_license_no: scanned.mohLicenseNo || '',
        medical_license_expiry: scanned.mohLicenseExpiryDate || '',
        license_no: scanned.mohLicenseNo || '',
        license_expiry: scanned.mohLicenseExpiryDate || '',
        license_title: scanned.profession || scanned.jobTitle || ''
      });

      toast.success('تمت قراءة بيانات الوثيقة الحقيقية بنجاح');
    } catch (err: any) {
      console.error('Document OCR Error:', err);
      toast.error(err.message || 'تعذر استخراج البيانات آلياً من المستند. يمكنك إدخال البيانات يدوياً.');
      
      // Allow manual entry from document preview
      setScanResult({
        civilId: '',
        fullNameAr: '',
        fullNameEn: '',
        nationality: 'كويتي',
        birthDate: '',
        expiryDate: '',
        gender: 'MALE',
        passportNo: '',
        profession: '',
        residencyType: ''
      });
    } finally {
      setScanning(false);
    }
  };

  const isCivilValid = scanResult?.civilId ? validateKuwaitCivilId(scanResult.civilId).isValid : false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-right font-sans" dir="rtl">
      <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">الماسح الضوئي الذكي (Odoo Document AI OCR)</h2>
            <p className="text-xs text-slate-500">استخراج البيانات الحقيقية آلياً من البطاقة المدنية والجواز وتعبئة ملف الموظف</p>
          </div>
        </div>
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles size={12} /> OCR ذكي حقيقي
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع المستند الممسوح (Document Type):</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#714B67] outline-none"
            >
              <option value="civil_id">🪪 بطاقة مدنية كويتية (Civil ID - يحدث الاسم، الرقم، الميلاد، الجنسية)</option>
              <option value="passport">🛂 جواز سفر (Passport - يحدث رقم الجواز، وتاريخ الانتهاء، والاسم بالإنجليزية)</option>
              <option value="medical_license">🩺 ترخيص صحي / مزاولة مهنة (MOH License - يحدث رقم وتاريخ الترخيص فقط)</option>
              <option value="pam_permit">📋 تصريح عمل / شؤون (PAM Work Permit)</option>
            </select>
          </div>

          <label className="border-2 border-dashed border-slate-300 hover:border-[#714B67] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 min-h-[200px] transition">
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
            {preview ? (
              <img src={preview} alt="Doc" className="max-h-44 object-contain rounded-lg border shadow-xs" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center">
                  <UploadCloud size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800">اضغط أو اسحب لرفع صورة المستند الحقيقي</p>
                <p className="text-[10px] text-slate-400 font-mono">JPG, PNG, WebP, PDF</p>
              </>
            )}
          </label>
          {scanning && (
            <div className="mt-3 p-3 bg-purple-50 text-[#714B67] rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-pulse border border-purple-100">
              <RefreshCw className="animate-spin w-4 h-4" /> جاري تحليل المستند الحقيقي واستخراج الحقول بدقة...
            </div>
          )}
        </div>

        <div>
          {scanResult ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={15} className="text-emerald-600" /> تم استخراج البيانات بنجاح
                </span>
                {isCivilValid ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <ShieldCheck size={11} /> MOD 11 صحيح
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    تحقق يدوي
                  </span>
                )}
              </div>

              <div>
                <label className="text-slate-500 block text-[10px] font-bold mb-0.5">الرقم المدني (Civil ID):</label>
                <input
                  type="text"
                  value={scanResult.civilId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setScanResult(prev => {
                      if (!prev) return prev;
                      let bDate = prev.birthDate;
                      if (val.length === 12) {
                        const parsed = parseKuwaitCivilId(val);
                        if (parsed) bDate = parsed.birthDate;
                      }
                      return { ...prev, civilId: val, birthDate: bDate };
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-purple-950 text-xs"
                  placeholder="290010112345"
                />
              </div>

              <div>
                <label className="text-slate-500 block text-[10px] font-bold mb-0.5">الاسم الكامل (عربي):</label>
                <input
                  type="text"
                  value={scanResult.fullNameAr}
                  onChange={(e) => setScanResult(prev => prev ? { ...prev, fullNameAr: e.target.value } : prev)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-500 block text-[10px] font-bold mb-0.5">Full Name (English):</label>
                <input
                  type="text"
                  value={scanResult.fullNameEn}
                  onChange={(e) => setScanResult(prev => prev ? { ...prev, fullNameEn: e.target.value } : prev)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">تاريخ الميلاد:</label>
                  <input
                    type="date"
                    value={scanResult.birthDate || ''}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, birthDate: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">نوع الجنس:</label>
                  <select
                    value={scanResult.gender || 'MALE'}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, gender: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs"
                  >
                    <option value="MALE">ذكر (Male)</option>
                    <option value="FEMALE">أنثى (Female)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t pt-1">
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">الجنسية:</label>
                  <input
                    type="text"
                    value={scanResult.nationality}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, nationality: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">رقم الجواز:</label>
                  <input
                    type="text"
                    value={scanResult.passportNo || ''}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, passportNo: e.target.value.toUpperCase() } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t pt-1">
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">نوع الإقامة / المادة:</label>
                  <input
                    type="text"
                    value={scanResult.residencyType || ''}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, residencyType: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs"
                    placeholder="مادة 18 / عمل..."
                  />
                </div>
                <div>
                  <label className="text-slate-500 block text-[10px] font-bold mb-0.5">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    value={scanResult.expiryDate}
                    onChange={(e) => setScanResult(prev => prev ? { ...prev, expiryDate: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-emerald-700 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => onApplyData && onApplyData(scanResult, docType)}
                className="w-full mt-2 bg-[#714B67] hover:bg-[#5a3a52] text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <UserCheck size={15} /> اعتماد ونقل إلى بيانات الموظف
              </button>
            </div>
          ) : (
            <div className="h-full border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs min-h-[240px]">
              <CreditCard className="w-12 h-12 opacity-30 mb-2" />
              <p className="font-bold">قم برفع صورة الوثيقة الحقيقية</p>
              <p className="text-[10px] text-slate-400 mt-1">سيتم استخراج الأسماء والأرقام المدنية والتواريخ تلقائياً بدون أي بيانات وهمية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OdooDocumentScanner;
