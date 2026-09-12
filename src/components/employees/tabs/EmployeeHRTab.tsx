import React, { useState, useEffect } from 'react';
import { EditableSelect, EditableField } from '../../EditableField';
import { TabDocumentScanner } from '../../TabDocumentScanner';
import { 
  getHolidayWorkRecords, 
  saveHolidayWorkRecord, 
  approveHolidayWork, 
  deleteHolidayWorkRecord, 
  WorkOnHolidayRecord 
} from '../../../services/holidayWorkService';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  AlertCircle, 
  CalendarDays, 
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface Props {
  employee: any;
  isEditMode: boolean;
  handleFieldChange: (field: string, value: any) => void;
  handleOcrResult: (data: any, tab: string) => void;
  calculatedBalance: string | number;
  onRefresh?: () => void;
}

export const EmployeeHRTab: React.FC<Props> = ({
  employee,
  isEditMode,
  handleFieldChange,
  handleOcrResult,
  calculatedBalance,
  onRefresh
}) => {
  const [holidayRecords, setHolidayRecords] = useState<WorkOnHolidayRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [consumedLeaveDays, setConsumedLeaveDays] = useState(0);
  
  // Form State for new Holiday Work
  const [showAddForm, setShowAddForm] = useState(false);
  const [holidayName, setHolidayName] = useState('عطلة المولد النبوي الشريف');
  const [customHolidayName, setCustomHolidayName] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [compensationType, setCompensationType] = useState<'COMP_OFF' | 'ANNUAL_ACCRUAL'>('COMP_OFF');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  const isMedicalStaff = ['الأطباء', 'التمريض'].includes(employee.dept || employee.department) || 
                         employee.jobTitle?.includes('طبيب') || employee.jobTitle?.includes('ممرض') ||
                         employee.jobTitle?.includes('دكتور');

  // Popular Kuwait holidays list
  const popularHolidays = [
    'عطلة المولد النبوي الشريف',
    'عطلة العيد الوطني وعيد التحرير',
    'عطلة رأس السنة الهجرية',
    'عطلة رأس السنة الميلادية',
    'عطلة الإسراء والمعراج',
    'عطلة عيد الفطر السعيد',
    'عطلة عيد الأضحى المبارك',
    'راحة أسبوعية بديلة (تكليف الجمعة)',
    'راحة أسبوعية بديلة (تكليف السبت)',
    'أخرى (اسم مخصص)'
  ];

  // Fetch Holiday Work Records for this specific employee
  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const all = await getHolidayWorkRecords();
      const empId = employee.id || employee.civil_id_number || employee.civilId;
      const filtered = all.filter(r => r.employeeId === empId);
      setHolidayRecords(filtered);
    } catch (e) {
      console.error('Failed to fetch holiday work records:', e);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [employee.id, employee.civil_id_number, employee.civilId]);

  useEffect(() => {
    const employeeId = employee.id || employee.civil_id_number || employee.civilId;
    const companyId = employee.companyId || employee.company_id;
    if (!employeeId || !companyId) {
      setConsumedLeaveDays(0);
      return;
    }

    const requestsQuery = query(
      collection(db, 'leave_requests'),
      where('companyId', '==', companyId),
      where('employeeId', '==', employeeId)
    );
    return onSnapshot(requestsQuery, snapshot => {
      const consumed = snapshot.docs
        .map(item => item.data() as any)
        .filter(request => String(request.status || '').toLowerCase() === 'approved' && !request.isHistorical)
        .reduce((sum, request) => sum + Number(request.paidDays ?? request.totalDays ?? request.daysCount ?? 0), 0);
      setConsumedLeaveDays(Number(consumed.toFixed(2)));
    }, error => {
      console.error('Failed to load approved leave requests:', error);
      setConsumedLeaveDays(0);
    });
  }, [employee.id, employee.civil_id_number, employee.civilId, employee.companyId, employee.company_id]);

  // Approved Holiday Work days count
  const approvedHolidayDays = holidayRecords
    .filter(r => r.state === 'approved')
    .reduce((sum, r) => sum + (r.hoursWorked >= 4 ? 1 : Number((r.hoursWorked / 8).toFixed(2))), 0);

  // Approved leave consumption comes from the canonical Firestore request collection.
  const consumedDays = consumedLeaveDays;

  const carriedOver = Number(employee.carriedOverLeave2025 ?? employee.carriedOverBalance ?? employee.openingBalance ?? 0) || 0;
  const accruedDays = Number(employee.accruedAnnualDays ?? employee.accruedDays ?? employee.accruedLeave2026 ?? 0) || 0;

  // Final Net Available Balance formula output
  const availableBalance = Number(calculatedBalance) || 0;

  // Add Holiday Work Record Handler
  const handleAddHolidayWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = holidayName === 'أخرى (اسم مخصص)' ? customHolidayName : holidayName;
    if (!finalName.trim()) {
      toast.error('الرجاء إدخال اسم عطلة صحيح');
      return;
    }

    setIsSubmittingRecord(true);
    try {
      const empId = employee.id || employee.civil_id_number || employee.civilId;
      const basicSalary = parseFloat(employee.basicSalary || employee.salary || 0) || 0;

      const record: WorkOnHolidayRecord = {
        employeeId: empId,
        companyId: employee.companyId || '',
        date: workDate,
        holidayName: finalName,
        hoursWorked: hoursWorked,
        compensationType: compensationType,
        state: 'draft' // initially draft, then we approve it instantly
      };

      // Save as draft first
      const saved = await saveHolidayWorkRecord(record);
      
      // Directly approve it to credit the balance instantly!
      await approveHolidayWork(saved, basicSalary);

      toast.success('تم تسجيل التكليف بالعطلة واحتساب رصيد الإجازة التعويضية بنجاح!');
      setShowAddForm(false);
      setCustomHolidayName('');
      
      // Fetch updated records
      await fetchRecords();

      // Trigger parent update
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error('حدث خطأ أثناء حفظ السجل: ' + err.message);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Delete Holiday Work Record Handler
  const handleDeleteHolidayWork = async (recordId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟ سيتم إلغاء الرصيد التعويضي المضاف للموظف تلقائياً.')) {
      return;
    }

    try {
      const empId = employee.id || employee.civil_id_number || employee.civilId;
      const res = await deleteHolidayWorkRecord(recordId, empId);
      if (res.success) {
        toast.success(res.message);
        await fetchRecords();
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message);
    }
  };

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

      {/* 🌸 الوردة الكاملة لأرصدة الإجازات والدورة الديناميكية المتكاملة 🌸 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">الوردة الديناميكية المتكاملة لأرصدة الإجازات والترحيل الآلي</h4>
              <span className="text-[10px] text-slate-400">تتبع دقيق ومترابط لأرصدة الإجازات والتعويضات بناءً على قانون العمل الكويتي</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            دورة كاملة متكاملة
          </span>
        </div>

        {/* 4 Nodes of the flower & final balance display */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center pt-2">
          {/* Node 1: Carried Over Balance */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center relative group">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">1. الرصيد المرحّل من 2025</span>
            {isEditMode ? (
              <div className="mt-1 flex items-center justify-center">
                <input
                  type="number"
                  value={employee.carriedOverLeave2025 ?? employee.carriedOverBalance ?? employee.openingBalance ?? 0}
                  onChange={(e) => handleFieldChange('carriedOverLeave2025', parseFloat(e.target.value) || 0)}
                  className="w-20 text-center font-mono font-bold text-sm border border-slate-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-[#714B67]"
                />
              </div>
            ) : (
              <div className="text-base font-extrabold text-slate-700 font-mono">
                {carriedOver} <span className="text-xs font-normal">يوم</span>
              </div>
            )}
            <p className="text-[9px] text-slate-400 mt-1">المرحّل من العام الماضي</p>
          </div>

          <div className="hidden md:flex justify-center text-slate-300 font-bold text-sm">➕</div>

          {/* Node 2: Monthly Accrued 2026 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">2. الاستحقاق المتراكم 2026</span>
            <div className="text-base font-extrabold text-blue-700 font-mono">
              {accruedDays.toFixed(1)} <span className="text-xs font-normal">يوم</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">بمعدل 2.5 يوم/شهر</p>
          </div>

          <div className="hidden md:flex justify-center text-slate-300 font-bold text-sm">➕</div>

          {/* Node 3: Compensatory Days from Holiday Work */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">3. بديل العمل بالعطلات</span>
            <div className="text-base font-extrabold text-amber-600 font-mono">
              {approvedHolidayDays} <span className="text-xs font-normal">يوم</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">رصيد إضافي معتمد</p>
          </div>

          {/* Spacer row for larger viewports to place consumed & available below */}
          <div className="col-span-full border-t border-dashed border-slate-100 my-1 hidden md:block"></div>

          {/* Spacer to align Node 4 with central node */}
          <div className="hidden md:block"></div>

          {/* Node 4: Consumed Vacation Days */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">4. الرصيد المستهلك (-)</span>
            <div className="text-base font-extrabold text-rose-600 font-mono">
              {consumedDays} <span className="text-xs font-normal">يوم</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1">إجازات مستخدمة ومعتمدة</p>
          </div>

          <div className="hidden md:flex justify-center text-slate-300 font-bold text-sm">🟰</div>

          {/* Center/Goal Node: Final Available Net Balance */}
          <div className="bg-emerald-50/50 border-2 border-emerald-500/30 rounded-xl p-3 text-center shadow-xs">
            <span className="text-[10px] text-emerald-800 font-extrabold block mb-1">صافي الرصيد المتاح (Net)</span>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {availableBalance} <span className="text-xs font-normal">يوم</span>
            </div>
            <p className="text-[9px] text-emerald-600 mt-1">جاهز لطلب إجازة جديدة</p>
          </div>
        </div>
      </div>

      {/* 🛠️ قسم التكليف بالعمل في العطلات الرسمية (Holiday Work Dashboard) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">سجل العمل في العطلات الرسمية والراحات البديلة</h4>
              <span className="text-[10px] text-slate-400">إدارة وتوثيق التكليف في أيام الأعياد الرسمية لربطها تلقائياً بالرصيد التعويضي</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#714B67] hover:bg-[#5a3c52] text-white rounded-lg text-xs font-bold transition-colors"
          >
            {showAddForm ? 'إغلاق النموذج' : 'تسجيل تكليف جديد'}
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form to record a new Holiday Work */}
        {showAddForm && (
          <form onSubmit={handleAddHolidayWork} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 animate-fade-in">
            <h5 className="text-xs font-bold text-slate-800">تفاصيل التكليف بالعمل خلال العطلة</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">المناسبة الرسمية *</label>
                <select
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-950 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  {popularHolidays.map((h, idx) => (
                    <option key={idx} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {holidayName === 'أخرى (اسم مخصص)' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المناسبة المخصصة *</label>
                  <input
                    type="text"
                    required
                    value={customHolidayName}
                    onChange={(e) => setCustomHolidayName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-slate-950 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                    placeholder="مثال: عطلة يوم الوقوف بعرفات"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">تاريخ العمل الفعلي *</label>
                <input
                  type="date"
                  required
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-950 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد ساعات العمل *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={24}
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(parseInt(e.target.value) || 8)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-950 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">آلية التعويض (Compensation Type)</label>
                <select
                  value={compensationType}
                  onChange={(e) => setCompensationType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-950 text-xs focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                >
                  <option value="COMP_OFF">🎁 يوم إجازة تعويضي مستقل (Comp-Off)</option>
                  <option value="ANNUAL_ACCRUAL">📈 إضافة مباشرة لرصيد الإجازات السنوية (+1 يوم)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmittingRecord}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmittingRecord ? 'جاري الحفظ...' : 'تأكيد وحفظ السجل'}
              </button>
            </div>
          </form>
        )}

        {/* List of holiday work records */}
        <div className="overflow-x-auto">
          {isLoadingRecords ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">جاري تحميل سجلات العمل...</div>
          ) : holidayRecords.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">لا توجد سجلات تكليف بالعمل خلال العطلات لهذا الموظف.</p>
              <p className="text-[10px] text-slate-400 mt-1">العمل في العطل الرسمية يمنح الموظف يوماً تعويضياً إضافياً بشكل ديناميكي.</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-2">تاريخ التكليف</th>
                  <th className="pb-2">العطلة / المناسبة الرسمية</th>
                  <th className="pb-2 text-center">ساعات العمل</th>
                  <th className="pb-2">آلية التعويض المعتمدة</th>
                  <th className="pb-2 text-center">الحالة</th>
                  <th className="pb-2 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {holidayRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-slate-600">{rec.date}</td>
                    <td className="py-2.5 font-bold text-slate-900">{rec.holidayName}</td>
                    <td className="py-2.5 text-center font-mono">{rec.hoursWorked} ساعة</td>
                    <td className="py-2.5 text-slate-700">
                      {rec.compensationType === 'COMP_OFF' ? (
                        <span className="inline-flex items-center gap-1 text-purple-700 font-bold">
                          <span>🎁</span> يوم تعويضي (Comp-Off)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                          <span>📈</span> زيادة الرصيد السنوي
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        معتمد ومضاف
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => rec.id && handleDeleteHolidayWork(rec.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="حذف وإلغاء الاستحقاق"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 📋 تفاصيل العقد وبطاقة الموارد البشرية والرواتب */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <EditableSelect
          label="نوع العقد (Contract Type)"
          value={employee.contractType || 'محدد المدة'}
          onChange={(val) => handleFieldChange('contractType', val)}
          isEditMode={isEditMode}
          options={[
            { value: "محدد المدة", label: "محدد المدة (Fixed-Term)" }, 
            { value: "غير محدد المدة", label: "غير محدد المدة (Indefinite)" }, 
            { value: "عقد تدريب / تأهيل", label: "عقد تدريب / تأهيل" }
          ]}
        />

        <EditableSelect
          label="حالة العقد في النظام (Status)"
          value={employee.contractStatus || 'ساري'}
          onChange={(val) => handleFieldChange('contractStatus', val)}
          isEditMode={isEditMode}
          options={[
            { value: "ساري", label: "ساري (Running / Active)" }, 
            { value: "قيد التجديد", label: "قيد التجديد (To Renew)" }, 
            { value: "فترة تجربة", label: "فترة تجربة (Probation)" }, 
            { value: "منتهي", label: "منتهي (Expired)" }
          ]}
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
          options={[
            { value: "subscribed", label: "مشترك كويتي - خاضع للتأمينات (مكافأة = 0 د.ك)" }, 
            { value: "exempt", label: "غير كويتي - خاضع لمكافأة نهاية الخدمة (المادة 51)" }
          ]}
        />

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
