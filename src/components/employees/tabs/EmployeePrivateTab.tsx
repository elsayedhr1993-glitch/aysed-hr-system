import React from 'react';
import { EditableField, EditableSelect } from '../../EditableField';
import { TabDocumentScanner } from '../../TabDocumentScanner';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleOcrResult: (data: any, type: string) => void;
}

export const EmployeePrivateTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  handleOcrResult
}) => {
  return (
    <>

          <div className="space-y-6 text-xs animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TabDocumentScanner 
                tabType="CIVIL_ID" 
                title="البطاقة المدنية" 
                onDataExtracted={(data) => handleOcrResult(data, 'civil_id')} 
              />
              <TabDocumentScanner 
                tabType="PASSPORT" 
                title="جواز السفر" 
                onDataExtracted={(data) => handleOcrResult(data, 'passport')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
                            <EditableField
                label="الرقم المدني (Civil ID)"
                value={employee.civilId || employee.civil_id_number || ''}
                onChange={(val) => handleFieldChange('civilId', val)}
                isEditMode={isEditMode}
                type="text"
                maxLength={12}
                placeholder="290010100000"
              />

                            <EditableField
                label="انتهاء البطاقة المدنية (YYYY-MM-DD)"
                value={employee.civilIdExpiry ? employee.civilIdExpiry.slice(0, 10) : ''}
                onChange={(val) => handleFieldChange('civilIdExpiry', val)}
                isEditMode={isEditMode}
                type="date"
              />

                            <EditableField
                label="الجنسية (Nationality)"
                value={employee.nationality || 'كويتي'}
                onChange={(val) => handleFieldChange('nationality', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="كويتي / مصري / هندي / أردني..."
              />

                            <EditableField
                label="تاريخ الميلاد (YYYY-MM-DD)"
                value={employee.dob ? employee.dob.slice(0, 10) : (employee.birthDate ? employee.birthDate.slice(0, 10) : '')}
                onChange={(val) => handleFieldChange('dob', val)}
                isEditMode={isEditMode}
                type="date"
              />

                            <EditableSelect
                label="الجنس (Gender)"
                value={employee.gender || 'male'}
                onChange={(val) => handleFieldChange('gender', val)}
                isEditMode={isEditMode}
                options={[{ value: "male", label: "ذكر (Male)" }, { value: "female", label: "أنثى (Female)" }]}
              />

                            <EditableSelect
                label="الحالة الاجتماعية (Marital Status)"
                value={employee.maritalStatus || 'single'}
                onChange={(val) => handleFieldChange('maritalStatus', val)}
                isEditMode={isEditMode}
                options={[{ value: "single", label: "أعزب (Single)" }, { value: "married", label: "متزوج (Married)" }, { value: "divorced", label: "مطلق (Divorced)" }]}
              />

                            <EditableField
                label="رقم جواز السفر (Passport No)"
                value={employee.passportNo || ''}
                onChange={(val) => handleFieldChange('passportNo', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="A12345678"
              />

                            <EditableField
                label="انتهاء الجواز (YYYY-MM-DD)"
                value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
                onChange={(val) => handleFieldChange('passportExpiry', val)}
                isEditMode={isEditMode}
                type="date"
              />

                            <EditableField
                label="انتهاء الإقامة (YYYY-MM-DD)"
                value={employee.residencyExpiry ? employee.residencyExpiry.slice(0, 10) : ''}
                onChange={(val) => handleFieldChange('residencyExpiry', val)}
                isEditMode={isEditMode}
                type="date"
              />

                            <EditableField
                label="الهاتف الشخصي (Personal Phone)"
                value={employee.personalPhone || employee.mobile || ''}
                onChange={(val) => handleFieldChange('personalPhone', val)}
                isEditMode={isEditMode}
                type="text"
                placeholder="+965 90000000"
              />

              <div className="md:col-span-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">العنوان بالتفصيل في دولة الكويت</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="المحافظة، المنطقة، قطعة، شارع، قسيمة/مبنى، شقة"
                  />
                ) : (
                  <div className="font-bold text-slate-900 text-sm">{employee.address || 'غير محدد'}</div>
                )}
              </div>

                            <EditableField
                label="اسم البنك الكويتي (Bank Name)"
                value={employee.bankName || 'بنك الكويت الوطني NBK'}
                onChange={(val) => handleFieldChange('bankName', val)}
                isEditMode={isEditMode}
                type="text"
              />

              <div className="md:col-span-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-slate-500 font-bold mb-1">رقم الحساب والآيبان (IBAN)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={employee.iban || ''}
                    onChange={(e) => handleFieldChange('iban', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="KW00NBOK0000000000000000000000"
                  />
                ) : (
                  <div className="font-mono font-bold text-slate-900 text-sm">{employee.iban || 'غير مدخل'}</div>
                )}
              </div>

            </div>

          </div>
        
        
    </>
  );
};
