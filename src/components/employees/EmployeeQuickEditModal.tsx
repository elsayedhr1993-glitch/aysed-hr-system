import React, { useEffect, useMemo, useState } from 'react';
import { X, Save } from 'lucide-react';
import { EMPLOYEES_QUICK_EDIT_TAB_ID } from '../../config/defaultLayouts/employees';
import { CustomFieldsFormBlock } from '../studio/DynamicFieldRenderer';
import { useScreenLayout } from '../../hooks/useScreenLayout';
import type { CustomDataBag } from '../../types/customLayout';
import {
  pickAllowedCustomData,
  validateCustomFieldValue,
} from '../../utils/customLayoutUtils';

interface Props {
  isOpen: boolean;
  employee: any | null;
  onClose: () => void;
  onSave: (merged: any) => Promise<void>;
}

const STATUS_OPTIONS = [
  'على رأس العمل',
  'في إجازة',
  'قيد التعيين',
  'منتهي الخدمة'
];

export const EmployeeQuickEditModal: React.FC<Props> = ({ isOpen, employee, onClose, onSave }) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [customData, setCustomData] = useState<CustomDataBag>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { layout, locale } = useScreenLayout('employees');

  const customFieldsForQuickEdit = useMemo(
    () =>
      layout.customFields.filter(
        f => f.tabId === EMPLOYEES_QUICK_EDIT_TAB_ID && !f.hidden
      ),
    [layout.customFields]
  );

  useEffect(() => {
    if (!isOpen || !employee) return;
    setForm({
      nameAr: employee.nameAr || employee.fullNameAr || '',
      nameEn: employee.nameEn || employee.fullNameEn || '',
      email: employee.email || employee.workEmail || '',
      phone: employee.phone || employee.workPhone || '',
      jobTitle: employee.jobTitle || '',
      dept: employee.dept || employee.department || '',
      manager: employee.manager || employee.directSupervisor || '',
      workLocation: employee.workLocation || '',
      civilId: employee.civilId || employee.civil_id_number || '',
      bankName: employee.bankName || '',
      iban: employee.iban || '',
      mohLicense: employee.mohLicense || employee.mohLicenseNo || '',
      status: employee.status || 'على رأس العمل'
    });
    setCustomData(
      pickAllowedCustomData(employee.customData as CustomDataBag, layout.customFields)
    );
    setCustomErrors({});
  }, [isOpen, employee, layout.customFields]);

  if (!isOpen || !employee) return null;

  const setField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    for (const field of customFieldsForQuickEdit) {
      const msg = validateCustomFieldValue(field, customData[field.storageKey]);
      if (msg) errors[field.storageKey] = msg;
    }
    if (Object.keys(errors).length) {
      setCustomErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const merged = {
        ...employee,
        nameAr: form.nameAr,
        fullNameAr: form.nameAr,
        nameEn: form.nameEn,
        fullNameEn: form.nameEn,
        email: form.email,
        workEmail: form.email,
        phone: form.phone,
        jobTitle: form.jobTitle,
        dept: form.dept,
        department: form.dept,
        manager: form.manager,
        directSupervisor: form.manager,
        workLocation: form.workLocation,
        civilId: form.civilId,
        civil_id_number: form.civilId,
        bankName: form.bankName,
        iban: form.iban,
        mohLicense: form.mohLicense,
        mohLicenseNo: form.mohLicense,
        status: form.status,
        customData: pickAllowedCustomData(customData, layout.customFields),
      };
      await onSave(merged);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]" dir="rtl">
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h2 className="text-sm font-bold text-slate-900">تعديل سريع</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              بيانات التواصل والهوية — الراتب يُعدَّل من تطبيق العقود فقط
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-slate-500 font-semibold mb-1 block">الاسم (عربي)</span>
              <input
                required
                value={form.nameAr}
                onChange={(e) => setField('nameAr', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-slate-500 font-semibold mb-1 block">الاسم (إنجليزي)</span>
              <input
                value={form.nameEn}
                onChange={(e) => setField('nameEn', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">البريد</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">الهاتف</span>
              <input
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">المسمى الوظيفي</span>
              <input
                value={form.jobTitle}
                onChange={(e) => setField('jobTitle', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">القسم</span>
              <input
                value={form.dept}
                onChange={(e) => setField('dept', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">المدير المباشر</span>
              <input
                value={form.manager}
                onChange={(e) => setField('manager', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">موقع العمل</span>
              <input
                value={form.workLocation}
                onChange={(e) => setField('workLocation', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">الرقم المدني</span>
              <input
                value={form.civilId}
                onChange={(e) => setField('civilId', e.target.value)}
                maxLength={12}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#714B67] focus:outline-none"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">الحالة</span>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">البنك (WPS)</span>
              <input
                value={form.bankName}
                onChange={(e) => setField('bankName', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-500 font-semibold mb-1 block">IBAN</span>
              <input
                value={form.iban}
                onChange={(e) => setField('iban', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 font-mono focus:border-[#714B67] focus:outline-none uppercase"
                dir="ltr"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-slate-500 font-semibold mb-1 block">ترخيص MOH (إن وجد)</span>
              <input
                value={form.mohLicense}
                onChange={(e) => setField('mohLicense', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 focus:border-[#714B67] focus:outline-none"
              />
            </label>
          </div>

          <CustomFieldsFormBlock
            fields={customFieldsForQuickEdit}
            locale={locale}
            values={customData}
            errors={customErrors}
            onChange={setCustomData}
          />
        </form>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#714B67] hover:bg-[#5b3c53] text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeQuickEditModal;
