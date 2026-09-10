import React from 'react';
import { EditableSelect, EditableField } from '../../EditableField';
import { TabDocumentScanner } from '../../TabDocumentScanner';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleOcrResult: (data: any, tab: string) => void;
  calculatedBalance: string | number;
}

export const EmployeeHRTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  handleOcrResult,
  calculatedBalance
}) => {
  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
                         employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض');
                         
  return (
    <div className="space-y-6 text-sm animate-fade-in text-slate-900">
      {isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {isMedicalStaff && (
            <TabDocumentScanner 
              tabType="MEDICAL_LICENSE" 
              title="ترخيص مزاولة المهنة (MOH)" 
              onDataExtracted={(data) => handleOcrResult(data, 'medical_license')} 
            />
          )}
          <TabDocumentScanner 
            tabType="WORK_PERMIT" 
            title="إذن العمل (PAM)" 
            onDataExtracted={(data) => handleOcrResult(data, 'work_permit')} 
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <EditableSelect
          label="نوع العقد (Contract Type)"
          value={employee.contractType || 'محدد المدة'}
          onChange={(val) => handleFieldChange('contractType', val)}
          isEditMode={isEditMode}
          options={[{ value: "محدد المدة", label: "محدد المدة (Fixed-Term)" }, { value: "غير محدد المدة", label: "غير محدد المدة (Indefinite)" }, { value: "عقد تدريب / تأهيل", label: "عقد تدريب / تأهيل" }]}
        />

        <EditableSelect
          label="حالة العقد في النظام (Status)"
          value={employee.contractStatus || 'ساري'}
          onChange={(val) => handleFieldChange('contractStatus', val)}
          isEditMode={isEditMode}
          options={[{ value: "ساري", label: "ساري (Running / Active)" }, { value: "قيد التجديد", label: "قيد التجديد (To Renew)" }, { value: "فترة تجربة", label: "فترة تجربة (Probation)" }, { value: "منتهي", label: "منتهي (Expired)" }]}
        />

        <EditableField
          label="رقم البصمة البيومترية (ZKTeco PIN)"
          value={employee.pin || employee.badgeId || employee.id || ''}
          onChange={(val) => handleFieldChange('pin', val)}
          isEditMode={isEditMode}
          type="text"
          placeholder="101"
        />

        <EditableSelect
          label="الخضوع للتأمينات الاجتماعية (PIFSS)"
          value={employee.pifssStatus || ((employee.nationality || '').includes('كويت') ? 'subscribed' : 'exempt')}
          onChange={(val) => handleFieldChange('pifssStatus', val)}
          isEditMode={isEditMode}
          options={[{ value: "subscribed", label: "مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)" }, { value: "exempt", label: "غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)" }]}
        />

        <div className="py-1.5">
          <label className="block text-xs font-semibold text-emerald-800 mb-1">صافي رصيد الإجازات المتاح (Available Balance)</label>
          <div className="font-mono font-bold text-emerald-700 text-sm border-b border-emerald-300 pb-1">
            {calculatedBalance} يوم
          </div>
        </div>

        <div className="py-1.5">
          <label className="block text-xs font-semibold text-slate-500 mb-1">الرصيد المرحّل من 2025</label>
          <div className="font-mono font-semibold text-slate-800 text-sm border-b border-slate-100 pb-1">
            {(employee.carriedOverLeave2025 ?? employee.carriedOverBalance ?? employee.openingBalance ?? 0)} يوم
          </div>
        </div>

        <div className="py-1.5">
          <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ بداية العقد الحالي</label>
          <div className="font-mono font-semibold text-slate-800 text-sm border-b border-slate-100 pb-1">
            {employee.contractStartDate ? employee.contractStartDate.slice(0, 10) : '—'}
          </div>
        </div>

        <div className="py-1.5">
          <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ نهاية العقد الحالي</label>
          <div className="font-mono font-semibold text-slate-800 text-sm border-b border-slate-100 pb-1">
            {employee.contractEndDate ? employee.contractEndDate.slice(0, 10) : 'عقد غير محدد المدة'}
          </div>
        </div>

        <div className="col-span-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-slate-700 text-xs font-medium leading-relaxed mt-2">
          <span className="text-base text-[#714B67]">ℹ️</span>
          <span>
            <strong>إدارة أرصدة الإجازات وتواريخ التعاقد:</strong> رصيد الموظف المرحّل يتم تتبعه واحتسابه ديناميكياً بناءً على طلبات الإجازات والتخصيصات (Allocations) المعتمدة في تطبيق <strong>"الإجازات والغياب"</strong>. كما أن تواريخ سريان ونهاية العقد تُستورد تلقائياً من تطبيق <strong>"العقود والرواتب"</strong> لضمان حوكمة البيانات.
          </span>
        </div>

        <div className="col-span-full md:col-span-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <label className="block text-slate-500 font-bold mb-2">الملاحظات والسجلات الإدارية</label>
          {isEditMode ? (
            <textarea
              rows={3}
              value={employee.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#714B67] focus:outline-none transition-shadow"
              placeholder="أي شروط خاصة أو ملاحظات إدارية ملحقة بملف الموظف..."
            />
          ) : (
            <div className="font-semibold text-slate-900 text-sm whitespace-pre-wrap">{employee.notes || 'لا توجد ملاحظات إدارية مسجلة.'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
