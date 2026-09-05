import React, { useState } from 'react';
import { parseKuwaitCivilCardOCR } from '../services/ocrService';
import toast from 'react-hot-toast';

interface TabDocumentScannerProps {
  tabType: 'CIVIL_ID' | 'PASSPORT' | 'WORK_PERMIT' | 'MEDICAL_LICENSE';
  title: string;
  onDataExtracted: (data: any) => void;
}

export const TabDocumentScanner: React.FC<TabDocumentScannerProps> = ({ 
  tabType,
  title,
  onDataExtracted 
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        try {
          let docTypeContext = '';
          switch (tabType) {
            case 'CIVIL_ID': docTypeContext = 'بطاقة مدنية كويتية'; break;
            case 'PASSPORT': docTypeContext = 'جواز سفر'; break;
            case 'WORK_PERMIT': docTypeContext = 'إذن عمل الشؤون الكويت (PAM)'; break;
            case 'MEDICAL_LICENSE': docTypeContext = 'ترخيص مزاولة مهنة طبية (وزارة الصحة)'; break;
            default: docTypeContext = title;
          }

          const extractedData = await parseKuwaitCivilCardOCR(base64String, docTypeContext);
          
          if (extractedData && Object.keys(extractedData).length > 0) {
            onDataExtracted(extractedData);
            setStatus({ type: 'success', msg: 'تم استخراج البيانات وملء الحقول بنجاح' });
            toast.success('تم قراءة المستند واستخراج البيانات بنجاح.');
          } else {
            setStatus({ type: 'error', msg: 'تعذر القراءة، يرجى التدقيق' });
            toast.error('لم يتم العثور على بيانات واضحة في المستند.');
          }
        } catch (apiErr: any) {
          setStatus({ type: 'error', msg: apiErr.message || 'خطأ أثناء استخراج البيانات' });
          toast.error(apiErr.message || 'حدث خطأ أثناء الاتصال بخدمة الماسح الضوئي.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'فشل قراءة الملف' });
      setLoading(false);
    }
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div className="border border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div>
        <h4 className="text-sm font-bold text-slate-800">الماسح الضوئي الذكي: {title}</h4>
        <p className="text-xs text-slate-500">ارفع المستند ليتم استخراج البيانات وملء حقول هذا التبويب تلقائياً</p>
        {status && (
          <span className={`text-xs mt-1 block font-medium ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {status.msg}
          </span>
        )}
      </div>
      <label className={`cursor-pointer ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2`}>
        <span>{loading ? '⏳ جاري المسح والاستخراج...' : '📁 رفع ومسح المستند'}</span>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={handleUpload} 
          disabled={loading} 
          className="hidden" 
        />
      </label>
    </div>
  );
};
