import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, Pencil, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db, cleanFirestoreData } from '../../lib/firebase';
import { calculateKuwaitLeaveCashAmount } from '../../utils/kuwaitPayrollMath';
import { liquidateLeaveBalanceInAllocations } from '../../services/leaveSettlementService';
import { recordEncashmentLedgerEntries } from '../../services/leaveBalanceLedgerService';
import { upsertLeaveAllocationToSupabase } from '../../services/leaveSupabaseSync';
import type { Employee, HrLeaveAllocation } from '../../types';

export type AllocationRow = Record<string, unknown> & {
  id: string;
  employeeId?: string;
  employeeName?: string;
  days?: number;
  numberOfDays?: number;
  notes?: string;
  name?: string;
  state?: string;
};

interface QuickEncashmentModalProps {
  allocation: AllocationRow;
  companyId: string;
  allocations: HrLeaveAllocation[];
  employee?: Employee | null;
  netAvailableDays: number;
  onClose: () => void;
  onAllocationsUpdated: (next: HrLeaveAllocation[]) => void;
}

export const QuickEncashmentModal: React.FC<QuickEncashmentModalProps> = ({
  allocation,
  companyId,
  allocations,
  employee,
  netAvailableDays,
  onClose,
  onAllocationsUpdated,
}) => {
  const maxDays = Math.max(0, netAvailableDays);
  const [days, setDays] = useState(() => Math.min(maxDays, Number(allocation.days ?? allocation.numberOfDays ?? 0) || maxDays));
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const basicSalary = Number((employee as any)?.basicSalary ?? (employee as any)?.salary ?? 0) || 0;
  const cashAmount = useMemo(
    () => (basicSalary > 0 ? calculateKuwaitLeaveCashAmount(days, basicSalary) : 0),
    [days, basicSalary]
  );

  useEffect(() => {
    setDays(Math.min(maxDays, Number(allocation.days ?? allocation.numberOfDays ?? 0) || maxDays));
  }, [allocation, maxDays]);

  const autoNote = useMemo(() => {
    const emp = allocation.employeeName || 'موظف';
    return `تسييل نقدي من شاشة الأرصدة — سند ${allocation.id} — ${emp} — ${days.toFixed(2)} يوم — تاريخ فاعلية ${effectiveDate}`;
  }, [allocation, days, effectiveDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encashDays = Number(days);
    if (!companyId || !allocation.employeeId) {
      toast.error('بيانات الموظف أو الشركة غير مكتملة.');
      return;
    }
    if (encashDays <= 0) {
      toast.error('أدخل عدد أيام للتسييل أكبر من صفر.');
      return;
    }
    if (encashDays > maxDays + 0.01) {
      toast.error(`التسييل يتجاوز الرصيد المتاح (${maxDays.toFixed(2)} يوم).`);
      return;
    }

    setSaving(true);
    try {
      const sourceId = `encash-row-${allocation.id}-${Date.now()}`;
      await recordEncashmentLedgerEntries({
        companyId,
        employeeId: String(allocation.employeeId),
        encashedDays: encashDays,
        effectiveDate,
        openingBalanceBeforeEncash: maxDays,
        sourceId,
        notes: autoNote,
      });

      const result = liquidateLeaveBalanceInAllocations(
        String(allocation.employeeId),
        encashDays,
        allocations,
        (updated) => onAllocationsUpdated(updated),
        employee || undefined,
        undefined,
        { settlementVoucherId: sourceId, settlementVoucherNumber: sourceId }
      );

      if (!result.success) {
        toast.error(result.message || 'تعذر تسييل الرصيد في التخصيصات.');
        return;
      }

      const mergedNote = [allocation.notes || allocation.name, autoNote].filter(Boolean).join(' | ');
      await setDoc(
        doc(db, 'leave_allocations', allocation.id),
        cleanFirestoreData({
          notes: mergedNote,
          encashmentNote: autoNote,
          lastEncashmentAt: new Date().toISOString(),
          state: 'validate',
        }),
        { merge: true }
      );

      toast.success(`تم تسييل ${encashDays.toFixed(2)} يوم وتحديث السجل.`);
      onClose();
    } catch (error) {
      console.error('Quick encashment failed', error);
      toast.error('تعذر إتمام التسييل النقدي.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-emerald-600" size={18} />
            <div>
              <h3 className="font-bold text-slate-900">تسييل نقدي سريع</h3>
              <p className="text-[10px] text-slate-500">{allocation.employeeName || '—'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div className="text-[10px] text-emerald-800 font-bold">الرصيد المتاح (محرك العقد)</div>
            <div className="font-mono font-black text-lg text-emerald-900">{maxDays.toFixed(2)} يوم</div>
            {basicSalary > 0 && (
              <div className="text-[10px] text-emerald-700 mt-1">
                مبلغ تقديري: {cashAmount.toFixed(3)} د.ك (أساسي / 26)
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">أيام التسييل</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              max={maxDays}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تاريخ الفاعلية</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 font-mono"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] text-slate-600">
            <span className="font-bold text-slate-700">ملاحظة تلقائية:</span> {autoNote}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 size={15} />
              {saving ? 'جاري التسييل…' : 'تأكيد التسييل'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditAllocationBalanceModalProps {
  allocation: AllocationRow;
  companyId: string;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (patch: Partial<HrLeaveAllocation>) => void;
}

export const EditAllocationBalanceModal: React.FC<EditAllocationBalanceModalProps> = ({
  allocation,
  companyId,
  canEdit,
  onClose,
  onSaved,
}) => {
  const [days, setDays] = useState(Number(allocation.days ?? allocation.numberOfDays ?? 0) || 0);
  const [notes, setNotes] = useState(String(allocation.notes || allocation.name || ''));
  const [state, setState] = useState(String(allocation.state || 'validate'));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      toast.error('لا تملك صلاحية تعديل الرصيد.');
      return;
    }
    const daysNum = Number(days);
    if (daysNum < 0) {
      toast.error('عدد الأيام غير صالح.');
      return;
    }

    setSaving(true);
    try {
      const patch: Partial<HrLeaveAllocation> = {
        numberOfDays: daysNum,
        days: daysNum,
        remainingDays: daysNum,
        notes,
        name: notes,
        state: (state === 'draft' ? 'draft' : 'validate') as HrLeaveAllocation['state'],
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'leave_allocations', allocation.id), cleanFirestoreData({ ...patch, companyId }), {
        merge: true,
      });
      void upsertLeaveAllocationToSupabase({ ...allocation, ...patch, id: allocation.id } as HrLeaveAllocation, companyId).catch(
        () => false
      );
      onSaved(patch);
      toast.success('تم تحديث الرصيد.');
      onClose();
    } catch (error) {
      console.error('Edit allocation failed', error);
      toast.error('تعذر حفظ التعديل.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Pencil className="text-[#714B67]" size={18} />
            <h3 className="font-bold text-slate-900">تعديل الرصيد</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!canEdit ? (
          <p className="text-rose-700 font-bold py-4">التعديل المباشر متاح لمسؤول الموارد البشرية فقط.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الأيام الممنوحة</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">حالة السند</label>
              <select
                value={state === 'draft' ? 'draft' : 'validate'}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-bold"
              >
                <option value="validate">معتمد / Approved</option>
                <option value="draft">مسودة / Draft</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">البيان</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-lg p-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#714B67] hover:bg-[#5a3a52] text-white font-bold py-2.5 rounded-xl cursor-pointer disabled:opacity-60"
            >
              {saving ? 'جاري الحفظ…' : 'حفظ التعديل'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export function resolveAllocationStatusBadge(alloc: AllocationRow): {
  labelAr: string;
  labelEn: string;
  className: string;
} {
  const raw = String(alloc.state || alloc.status || 'validate').toLowerCase();
  if (raw === 'draft' || raw === 'مسودة') {
    return {
      labelAr: 'مسودة',
      labelEn: 'Draft',
      className: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  }
  return {
    labelAr: 'معتمد',
    labelEn: 'Approved',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
}
