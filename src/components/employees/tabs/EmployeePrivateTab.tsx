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
    <div className="space-y-8 animate-fade-in text-slate-900">
      {isEditMode && (
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
      )}
      
      {/* 2-Columns Standard Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        
        {/* Right Column: الهوية والجنسية */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#714B67]"></span>
              <span>بيانات الهوية والجنسية</span>
            </h4>
          </div>

          <EditableField
            label="الرقم المدني (Civil ID)"
            value={employee.civilId || employee.civil_id_number || ''}
            onChange={(val) => {
              handleFieldChange('civilId', val);
              handleFieldChange('civil_id_number', val);
            }}
            isEditMode={isEditMode}
            type="text"
            maxLength={12}
            placeholder="290010100000"
          />

          <EditableField
            label="انتهاء البطاقة المدنية (Civil ID Expiry)"
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
            label="تاريخ الميلاد (Date of Birth)"
            value={employee.dob ? employee.dob.slice(0, 10) : (employee.birthDate ? employee.birthDate.slice(0, 10) : '')}
            onChange={(val) => {
              handleFieldChange('dob', val);
              handleFieldChange('birthDate', val);
            }}
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
        </div>

        {/* Left Column: السفر والإقامة والبنك */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>السفر والإقامة والبيانات البنكية</span>
            </h4>
          </div>

          <EditableField
            label="رقم جواز السفر (Passport No)"
            value={employee.passportNo || ''}
            onChange={(val) => handleFieldChange('passportNo', val)}
            isEditMode={isEditMode}
            type="text"
            placeholder="A12345678"
          />

          <EditableField
            label="انتهاء الجواز (Passport Expiry)"
            value={employee.passportExpiry ? employee.passportExpiry.slice(0, 10) : ''}
            onChange={(val) => handleFieldChange('passportExpiry', val)}
            isEditMode={isEditMode}
            type="date"
          />

          <EditableField
            label="انتهاء الإقامة (Residency Expiry)"
            value={employee.residencyExpiry ? employee.residencyExpiry.slice(0, 10) : ''}
            onChange={(val) => handleFieldChange('residencyExpiry', val)}
            isEditMode={isEditMode}
            type="date"
          />

          <EditableField
            label="الهاتف الشخصي (Personal Phone)"
            value={employee.personalPhone || employee.mobile || ''}
            onChange={(val) => {
              handleFieldChange('personalPhone', val);
              handleFieldChange('mobile', val);
            }}
            isEditMode={isEditMode}
            type="text"
            placeholder="+965 90000000"
          />

          <EditableField
            label="اسم البنك الكويتي (Bank Name)"
            value={employee.bankName || 'بنك الكويت الوطني NBK'}
            onChange={(val) => handleFieldChange('bankName', val)}
            isEditMode={isEditMode}
            type="text"
          />

          <div className="py-1.5">
            <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">رقم الحساب والآيبان (IBAN)</label>
            {isEditMode ? (
              <input
                type="text"
                value={employee.iban || ''}
                onChange={(e) => handleFieldChange('iban', e.target.value)}
                className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 bg-white focus:outline-none text-sm"
                placeholder="KW00NBOK0000000000000000000000"
              />
            ) : (
              <div className="font-mono font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1 min-h-[26px] flex items-center">
                {employee.iban ? <span>{employee.iban}</span> : <span className="text-slate-400 font-normal text-xs">—</span>}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full Width Row: Address */}
      <div className="pt-4 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide">العنوان بالتفصيل في دولة الكويت</label>
        {isEditMode ? (
          <input
            type="text"
            value={employee.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            className="w-full border border-slate-300 focus:border-[#714B67] rounded-lg px-3 py-1.5 font-bold text-slate-900 bg-white focus:outline-none text-sm"
            placeholder="المحافظة، المنطقة، قطعة، شارع، قسيمة/مبنى، شقة"
          />
        ) : (
          <div className="font-bold text-slate-900 text-sm border-b border-slate-200/70 pb-1 min-h-[26px] flex items-center">
            {employee.address ? <span>{employee.address}</span> : <span className="text-slate-400 font-normal text-xs">—</span>}
          </div>
        )}
      </div>

    </div>
  );
};
