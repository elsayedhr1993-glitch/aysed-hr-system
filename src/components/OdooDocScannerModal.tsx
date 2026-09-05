import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  X, 
  Sparkles, 
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Building
} from 'lucide-react';
import { processAnyDocument, ScannedData } from '../utils/ocrService';
import { validateKuwaitCivilId, parseKuwaitCivilId } from '../utils/kuwaitLaw';
import toast from 'react-hot-toast';

export interface ExtractedCivilData {
  civilId: string;
  fullNameAr: string;
  fullNameEn: string;
  birthDate: string;
  expiryDate: string;
  nationality: string;
  gender?: string;
  passportNo?: string;
  profession?: string;
  rawTextPreview?: string;
  mohLicenseNo?: string;
  pamPermitNo?: string;
  residencyType?: string;
}

interface ScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: ExtractedCivilData) => void;
}

export const OdooDocScannerModal: React.FC<ScannerProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCivilData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [docType, setDocType] = useState<'civil_id' | 'passport' | 'moh_license' | 'pam_permit'>('civil_id');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // معالجة الملف المحمّل بالقراءة الضوئية الحقيقية
  const handleFileProcess = async (file: File) => {
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsProcessing(true);
    setProgressStatus('جاري إرسال المستند لتحليل القراءة الضوئية الذكية (AI Vision OCR)...');

    try {
      // استدعاء محرك القراءة الضوئية الحقيقي
      const scanned: ScannedData = await processAnyDocument(file, undefined, docType);
      
      let civilId = (scanned.civilId || '').trim().replace(/\D/g, '');
      let birthDate = scanned.birthDate || scanned.dob || '';
      let gender = scanned.gender || '';

      // التحقق من الرقم المدني الكويتي واستخراج تاريخ الميلاد تلقائياً إن وجد
      if (civilId.length === 12) {
        const valRes = validateKuwaitCivilId(civilId);
        if (valRes.isValid && valRes.dob && !birthDate) {
          birthDate = valRes.dob;
        }
        if (valRes.gender && !gender) {
          gender = valRes.gender;
        }
      }

      const formattedData: ExtractedCivilData = {
        civilId: civilId,
        fullNameAr: scanned.fullNameAr || scanned.fullName || '',
        fullNameEn: scanned.fullNameEn || '',
        birthDate: birthDate,
        expiryDate: scanned.expiryDate || '',
        nationality: scanned.nationality || 'كويتي',
        gender: gender || 'MALE',
        passportNo: scanned.passportNo || '',
        profession: scanned.profession || scanned.jobTitle || '',
        mohLicenseNo: scanned.mohLicenseNo || '',
        residencyType: scanned.residencyType || '',
        rawTextPreview: scanned.rawText || ''
      };

      setExtractedData(formattedData);
      toast.success('تمت قراءة وتحليل المستند بنجاح عبر محرك الذكاء الاصطناعي');
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      toast.error(err.message || 'تعذر استخراج البيانات آلياً من المستند. يمكنك إدخال البيانات يدوياً.');
      
      // فتح نموذج فارغ للمستخدم للتعبئة اليدوية من الصورة المعروضة أمامه
      setExtractedData({
        civilId: '',
        fullNameAr: '',
        fullNameEn: '',
        birthDate: '',
        expiryDate: '',
        nationality: 'كويتي',
        gender: 'MALE',
        passportNo: '',
        profession: ''
      });
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleApplyData = () => {
    if (!extractedData) return;

    if (extractedData.civilId && extractedData.civilId.length > 0) {
      const val = validateKuwaitCivilId(extractedData.civilId);
      if (!val.isValid && extractedData.civilId.length === 12) {
        toast.error(`تنبيه: ${val.message}`);
      }
    }

    onScanComplete(extractedData);
    onClose();
  };

  const isCivilValid = extractedData?.civilId ? validateKuwaitCivilId(extractedData.civilId).isValid : false;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs font-sans dir-rtl" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-2xl">
              <Scan size={22} />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                الماسح الضوئي الذكي (Odoo AI OCR Digitization)
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> محرك بصري حقيقي
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">قراءة البطاقة المدنية، جواز السفر، وتراخيص وزارة الصحة بدقة تامة</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Type Selector */}
        {!extractedData && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-[11px]">
            <button
              type="button"
              onClick={() => setDocType('civil_id')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer text-center ${
                docType === 'civil_id' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              بطاقة مدنية (PACI)
            </button>
            <button
              type="button"
              onClick={() => setDocType('passport')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer text-center ${
                docType === 'passport' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جواز السفر والإقامة
            </button>
            <button
              type="button"
              onClick={() => setDocType('moh_license')}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition cursor-pointer text-center ${
                docType === 'moh_license' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ترخيص صحي (MOH)
            </button>
          </div>
        )}

        {/* Upload & Drag Drop Box */}
        {!extractedData && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileProcess(e.dataTransfer.files[0]);
            }}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
              isDragging ? 'border-[#714B67] bg-[#714B67]/5' : 'border-slate-300 hover:border-[#714B67] bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept="image/*,application/pdf"
              className="hidden"
            />

            <div className="w-16 h-16 bg-purple-100 text-[#714B67] rounded-2xl flex items-center justify-center shadow-xs">
              {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
            </div>

            <div>
              <p className="font-bold text-slate-800 text-sm">
                {isProcessing ? progressStatus : 'اسحب وأسقط صورة المستند الحقيقي أو اضغط للاختيار'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">يدعم ملفات JPG, PNG, WebP, وملفات PDF الرسمية</p>
            </div>
          </div>
        )}

        {/* Extracted Structured Data (Odoo Field Mapping & Live Verification) */}
        {extractedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl font-bold text-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                تم تحليل المستند واستخراج الحقول الحقيقية بنجاح
              </span>
              {isCivilValid ? (
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck size={12} /> MOD 11 معتمد
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  يرجى مراجعة وتأكيد الحقول
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Preview */}
              {previewUrl && (
                <div className="bg-slate-100 rounded-2xl p-2 border border-slate-200 flex flex-col items-center justify-center max-h-64 overflow-hidden">
                  <span className="text-[10px] text-slate-400 mb-1">معاينة المستند المرفوع</span>
                  <img src={previewUrl} alt="Document" className="max-h-56 object-contain rounded-lg shadow-xs" />
                </div>
              )}

              {/* Editable Form Fields */}
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الرقم المدني الكويتي (12 رقم):</label>
                  <input
                    type="text"
                    value={extractedData.civilId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExtractedData(prev => {
                        if (!prev) return prev;
                        let bDate = prev.birthDate;
                        if (val.length === 12) {
                          const parsed = parseKuwaitCivilId(val);
                          if (parsed) bDate = parsed.birthDate;
                        }
                        return { ...prev, civilId: val, birthDate: bDate };
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-purple-950 text-xs focus:ring-2 focus:ring-[#714B67]"
                    placeholder="290010112345"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الاسم الكامل (عربي):</label>
                  <input
                    type="text"
                    value={extractedData.fullNameAr}
                    onChange={(e) => setExtractedData(prev => prev ? { ...prev, fullNameAr: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#714B67]"
                    placeholder="الاسم الكامل بالعربية"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Full Name (English):</label>
                  <input
                    type="text"
                    value={extractedData.fullNameEn}
                    onChange={(e) => setExtractedData(prev => prev ? { ...prev, fullNameEn: e.target.value } : prev)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-[#714B67]"
                    placeholder="FULL NAME IN ENGLISH"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">تاريخ الميلاد:</label>
                    <input
                      type="date"
                      value={extractedData.birthDate}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, birthDate: e.target.value } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">تاريخ انتهاء الوثيقة:</label>
                    <input
                      type="date"
                      value={extractedData.expiryDate}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, expiryDate: e.target.value } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-emerald-800 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">الجنسية:</label>
                    <input
                      type="text"
                      value={extractedData.nationality}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, nationality: e.target.value } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs"
                      placeholder="كويتي / مصري / هندي..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">نوع الجنس:</label>
                    <select
                      value={extractedData.gender || 'MALE'}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, gender: e.target.value } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs"
                    >
                      <option value="MALE">ذكر (Male)</option>
                      <option value="FEMALE">أنثى (Female)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">رقم الجواز (إن وجد):</label>
                    <input
                      type="text"
                      value={extractedData.passportNo || ''}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, passportNo: e.target.value.toUpperCase() } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs font-mono"
                      placeholder="K12345678"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">نوع الإقامة / المادة:</label>
                    <input
                      type="text"
                      value={extractedData.residencyType || ''}
                      onChange={(e) => setExtractedData(prev => prev ? { ...prev, residencyType: e.target.value } : prev)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 text-xs"
                      placeholder="مادة 18 / عمل..."
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setExtractedData(null); setPreviewUrl(null); setSelectedFile(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition text-xs"
              >
                <RefreshCw size={14} />
                <span>إعادة المسح</span>
              </button>
              <button
                type="button"
                onClick={handleApplyData}
                className="px-5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm transition text-xs"
              >
                <Sparkles size={15} />
                <span>تطبيق وتعبئة ملف الموظف</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OdooDocScannerModal;
