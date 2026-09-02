export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeNameAr: string;
  civilId: string;
  
  // تصنيف الوثيقة وفق اشتراطات الكويت والقطاع الطبي
  category: 
    | 'هويات وإقامات (Civil ID & Visa)'
    | 'تراخيص طبية (MOH Licenses)'
    | 'شهادات ومؤهلات علمية (Degrees & Certificates)'
    | 'عقود وإقرارات قانونية (Contracts & Declarations)'
    | 'فحوصات وبصمات (Medical & Security Clearances)';

  docTitleAr: string;
  docTitleEn: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileType: 'PDF' | 'JPG' | 'PNG';
  fileName: string;
  fileSize: string;
  fileUrl?: string; // أو base64
  
  // حالة الصلاحية والتنبيه التلقائي
  status: 'active' | 'expiring_soon' | 'expired';
  daysLeft?: number;
  notes?: string;
  uploadDate: string;
}

// دالة فحص وتحديث حالة صلاحية الوثيقة تلقائياً
export const checkDocumentExpiryStatus = (expiryDateStr?: string): { status: 'active' | 'expiring_soon' | 'expired'; daysLeft?: number } => {
  if (!expiryDateStr) return { status: 'active' };

  const today = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', daysLeft: diffDays };
  } else if (diffDays <= 60) {
    return { status: 'expiring_soon', daysLeft: diffDays };
  } else {
    return { status: 'active', daysLeft: diffDays };
  }
};
