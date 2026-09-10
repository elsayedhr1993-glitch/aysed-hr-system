import React, { useState } from 'react';
import { processAnyDocument } from '../utils/ocrService';
import toast from 'react-hot-toast';

interface TabDocumentScannerProps {
  tabType: 'CIVIL_ID' | 'PASSPORT' | 'WORK_PERMIT' | 'MEDICAL_LICENSE' | 'CONTRACT';
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
      let docTypeContext = '';
      switch (tabType) {
        case 'CIVIL_ID': docTypeContext = 'CIVIL_ID'; break;
        case 'PASSPORT': docTypeContext = 'PASSPORT'; break;
        case 'WORK_PERMIT': docTypeContext = 'PAM_WORK_PERMIT'; break;
        case 'MEDICAL_LICENSE': docTypeContext = 'MEDICAL_LICENSE'; break;
        case 'CONTRACT': docTypeContext = 'EMPLOYMENT_CONTRACT'; break;
        default: docTypeContext = 'OTHER';
      }
      
      const extractedData = await processAnyDocument(file, undefined, docTypeContext);
      
      if (extractedData && Object.keys(extractedData).length > 0) {
        // Map ScannedData properties to match the expected structure
        const mappedData = {
          civil_id: extractedData.civilId,
          civilId: extractedData.civilId,
          full_name: extractedData.fullNameAr || extractedData.fullName,
          fullNameAr: extractedData.fullNameAr || extractedData.fullName,
          nameAr: extractedData.fullNameAr || extractedData.fullName,
          nationality: extractedData.nationality,
          gender: extractedData.gender,
          birth_date: extractedData.birthDate || extractedData.dob,
          birthDate: extractedData.birthDate || extractedData.dob,
          expiry_date: extractedData.expiryDate,
          civil_id_expiry: extractedData.expiryDate,
          passport_no: extractedData.passportNo,
          passportNo: extractedData.passportNo,
          passport_expiry: extractedData.passportExpiryDate || extractedData.expiryDate,
          name_en: extractedData.fullNameEn,
          fullNameEn: extractedData.fullNameEn,
          license_no: extractedData.mohLicenseNo,
          medical_license_no: extractedData.mohLicenseNo,
          license_expiry: extractedData.mohLicenseExpiryDate || extractedData.expiryDate,
          license_title: extractedData.jobTitle || extractedData.profession,
          work_permit_no: extractedData.paciBuildingRef || extractedData.civilId, // Or map to proper field if added
          pam_start: extractedData.issueDate,
          pam_end: extractedData.expiryDate,
          salary: extractedData.contractSalary
        };

        onDataExtracted(mappedData);
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
      if (e.target) e.target.value = '';
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
