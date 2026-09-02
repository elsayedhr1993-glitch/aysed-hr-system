import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Award, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search, 
  Calculator, 
  Printer, 
  Building2,
  FileCheck,
  UserCheck,
  X,
  Trash2
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { OdooChatter } from './OdooChatter';

export const OdooOperationsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [activeSubTab, setActiveSubTab] = useState<'custodies' | 'loans' | 'warnings' | 'eos'>('custodies');

  // Modal Control States
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Form states
  const [newCustody, setNewCustody] = useState({
    employeeName: '',
    itemType: '',
    serialNumber: '',
    handoverDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [newLoan, setNewLoan] = useState({
    employeeName: '',
    totalAmount: '',
    monthlyInstallment: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [newWarning, setNewWarning] = useState({
    employeeName: '',
    warningType: 'إنذار كتابي أول',
    reason: '',
    actionTaken: 'خصم أجر يوم واحد من مسير الرواتب',
    date: new Date().toISOString().split('T')[0]
  });

  // 1. بيانات العهد العينية (Custodies)
  const [custodies, setCustodies] = useState([
    {
      id: 'CUST-001',
      employeeName: 'أحمد محمود الكندري',
      itemType: 'جهاز لابتوب MacBook Pro M3 + شاشة',
      serialNumber: 'SN-998231',
      handoverDate: '2025-01-10',
      status: 'active',
      notes: 'عهدة عمل رئيسية بحالة ممتازة'
    },
    {
      id: 'CUST-002',
      employeeName: 'سعد جابر العنزي',
      itemType: 'مفاتيح المقر الطبي + جهاز لاسلكي أمني',
      serialNumber: 'SEC-KEY-08',
      handoverDate: '2026-02-01',
      status: 'active',
      notes: 'عهدة أمن وورديات'
    }
  ]);

  // 2. بيانات السلف والأقساط (Loans & Advances)
  const [loans, setLoans] = useState([
    {
      id: 'LN-2026-01',
      employeeName: 'محمد إبراهيم السيد',
      totalAmount: 600,
      monthlyInstallment: 100,
      paidAmount: 200,
      remainingAmount: 400,
      startDate: '2026-06-01',
      status: 'active'
    }
  ]);

  // 3. بيانات الإنذارات والجزاءات (Disciplinary Warnings)
  const [warnings, setWarnings] = useState([
    {
      id: 'WARN-2026-01',
      employeeName: 'محمد إبراهيم السيد',
      warningType: 'إنذار كتابي أول',
      reason: 'تأخير متكرر عن مواعيد العمل الصباحية بدون إذن مسبق',
      actionTaken: 'خصم أجر يوم واحد من مسير الرواتب',
      date: '2026-08-15',
      status: 'signed'
    }
  ]);

  // 4. حاسبة نهاية الخدمة (Kuwait Labor Law Art 51)
  const [eosData, setEosData] = useState({
    empName: 'أحمد محمود الكندري',
    salary: 1650,
    years: 5,
    months: 6,
    reason: 'termination_by_company' // termination | resignation
  });

  const calculateEOS = () => {
    const totalYears = eosData.years + (eosData.months / 12);
    let amount = 0;
    
    // أول 5 سنوات: 15 يوم عن كل سنة (الراتب / 26 * 15)
    if (totalYears <= 5) {
      amount = (eosData.salary / 26) * 15 * totalYears;
    } else {
      const first5Years = (eosData.salary / 26) * 15 * 5;
      const remainingYears = totalYears - 5;
      const nextYearsAmount = (eosData.salary / 26) * 26 * remainingYears; // راتب شهر كامل عن كل سنة إضافية
      amount = first5Years + nextYearsAmount;
    }

    // استقالة الموظف (المادة 53)
    if (eosData.reason === 'resignation') {
      if (totalYears < 3) amount = 0;
      else if (totalYears >= 3 && totalYears < 5) amount = amount * 0.5;
      else if (totalYears >= 5 && totalYears < 10) amount = amount * (2/3);
      // 10 سنوات فأكثر يستحق المكافأة كاملة
    }

    return Math.min(amount, eosData.salary * 18); // الحد الأقصى القانوني: راتب 18 شهراً
  };

  const handleAddCustody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustody.employeeName || !newCustody.itemType) return;
    setCustodies([
      ...custodies,
      {
        id: `CUST-00${custodies.length + 1}`,
        employeeName: newCustody.employeeName,
        itemType: newCustody.itemType,
        serialNumber: newCustody.serialNumber || 'SN-N/A',
        handoverDate: newCustody.handoverDate,
        status: 'active',
        notes: newCustody.notes || 'تسليم رسمي'
      }
    ]);
    setShowCustodyModal(false);
    setNewCustody({
      employeeName: '',
      itemType: '',
      serialNumber: '',
      handoverDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.employeeName || !newLoan.totalAmount) return;
    const tot = parseFloat(newLoan.totalAmount) || 0;
    const inst = parseFloat(newLoan.monthlyInstallment) || 0;
    setLoans([
      ...loans,
      {
        id: `LN-2026-0${loans.length + 1}`,
        employeeName: newLoan.employeeName,
        totalAmount: tot,
        monthlyInstallment: inst,
        paidAmount: 0,
        remainingAmount: tot,
        startDate: newLoan.startDate,
        status: 'active'
      }
    ]);
    setShowLoanModal(false);
    setNewLoan({
      employeeName: '',
      totalAmount: '',
      monthlyInstallment: '',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarning.employeeName || !newWarning.reason) return;
    setWarnings([
      ...warnings,
      {
        id: `WARN-2026-0${warnings.length + 1}`,
        employeeName: newWarning.employeeName,
        warningType: newWarning.warningType,
        reason: newWarning.reason,
        actionTaken: newWarning.actionTaken,
        date: newWarning.date,
        status: 'signed'
      }
    ]);
    setShowWarningModal(false);
    setNewWarning({
      employeeName: '',
      warningType: 'إنذار كتابي أول',
      reason: '',
      actionTaken: 'خصم أجر يوم واحد من مسير الرواتب',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteCustody = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      setCustodies(custodies.filter(c => c.id !== id));
    }
  };

  const handleDeleteLoan = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      setLoans(loans.filter(l => l.id !== id));
    }
  };

  const handleDeleteWarning = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      setWarnings(warnings.filter(w => w.id !== id));
    }
  };

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800 animate-fadeIn" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">العهد والسلف والإنذارات ونهاية الخدمة (HR Operations)</h1>
            <p className="text-xs text-slate-500 font-medium">
              المنشأة: <strong className="text-[#714B67]">{activeCompany?.nameAr || 'الشركة الرئيسية'}</strong> | إدارة المستحقات والعهد وفق قانون العمل الكويتي
            </p>
          </div>
        </div>

        {/* Sub-tabs Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('custodies')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'custodies' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package size={14} /> العهد العينية
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('loans')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'loans' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign size={14} /> السلف والأقساط
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('warnings')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'warnings' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={14} /> الإنذارات والجزاءات
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('eos')}
            className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'eos' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator size={14} /> حاسبة نهاية الخدمة
          </button>
        </div>
      </div>

      {/* Tab 1: العهد العينية */}
      {activeSubTab === 'custodies' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">سجل تسليم واستلام العهد والأصول للموظفين</h3>
            <button type="button" onClick={() => setShowCustodyModal(true)} className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <PlusCircle size={14} /> تسليم عهدة جديدة
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">المعرف</th>
                <th className="p-3.5">اسم الموظف</th>
                <th className="p-3.5">بيان العهدة والمعدات</th>
                <th className="p-3.5">الرقم التسلسلي (S/N)</th>
                <th className="p-3.5">تاريخ التسليم</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {custodies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-500">{c.id}</td>
                  <td className="p-3.5 font-bold text-slate-900">{c.employeeName}</td>
                  <td className="p-3.5 text-slate-700">{c.itemType}</td>
                  <td className="p-3.5 font-mono text-slate-600">{c.serialNumber}</td>
                  <td className="p-3.5 font-mono text-slate-600">{c.handoverDate}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      بعهدة الموظف (سارية)
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => handleDeleteCustody(c.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: السلف والأقساط */}
      {activeSubTab === 'loans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">سجل سلف الرواتب والخصم الشهري التلقائي</h3>
            <button type="button" onClick={() => setShowLoanModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <PlusCircle size={14} /> إضافة سلفة مالية
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">المعرف</th>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">إجمالي السلفة</th>
                <th className="p-3.5">القسط الشهري</th>
                <th className="p-3.5">المسدد</th>
                <th className="p-3.5">المتبقي</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((ln) => (
                <tr key={ln.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-500">{ln.id}</td>
                  <td className="p-3.5 font-bold text-slate-900">{ln.employeeName}</td>
                  <td className="p-3.5 font-bold font-mono text-slate-800">{ln.totalAmount.toFixed(3)} د.ك</td>
                  <td className="p-3.5 font-bold font-mono text-blue-600">{ln.monthlyInstallment.toFixed(3)} د.ك / شهر</td>
                  <td className="p-3.5 font-bold font-mono text-emerald-600">{ln.paidAmount.toFixed(3)} د.ك</td>
                  <td className="p-3.5 font-bold font-mono text-rose-600">{ln.remainingAmount.toFixed(3)} د.ك</td>
                  <td className="p-3.5">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      جاري الخصم بالراتب
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => handleDeleteLoan(ln.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: الإنذارات والجزاءات */}
      {activeSubTab === 'warnings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800">سجل الإجراءات التأديبية والإنذارات القانونية</h3>
            <button type="button" onClick={() => setShowWarningModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <PlusCircle size={14} /> إصدار كتاب إنذار / جزاء
            </button>
          </div>
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">رقم الإجراء</th>
                <th className="p-3.5">الموظف</th>
                <th className="p-3.5">نوع العقوبة</th>
                <th className="p-3.5">سبب الجزاء</th>
                <th className="p-3.5">الإجراء المترتب</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warnings.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-mono font-bold text-slate-500">{w.id}</td>
                  <td className="p-3.5 font-bold text-slate-900">{w.employeeName}</td>
                  <td className="p-3.5 font-bold text-rose-700">{w.warningType}</td>
                  <td className="p-3.5 text-slate-700">{w.reason}</td>
                  <td className="p-3.5 font-bold text-slate-800">{w.actionTaken}</td>
                  <td className="p-3.5 font-mono text-slate-600">{w.date}</td>
                  <td className="p-3.5">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      موقع ومحفوظ بالملف
                    </span>
                  </td>
                  <td className="p-3.5">
                    <button onClick={() => handleDeleteWarning(w.id)} className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: حاسبة وتصفية نهاية الخدمة (Kuwait Art 51) */}
      {activeSubTab === 'eos' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="border-b pb-3 mb-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="text-[#714B67]" size={20} />
              حاسبة مكافأة نهاية الخدمة والتسوية الختامية (مادة 51 من قانون العمل الكويتي 6/2010)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحسب المكافأة على أساس أجر 15 يوماً عن كل سنة من السنوات الـ 5 الأولى، وأجر شهر عن كل سنة تالية (الحد الأقصى 18 شهراً).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">اسم الموظف المعني بالتسوية:</label>
                <input
                  type="text"
                  value={eosData.empName}
                  onChange={(e) => setEosData({ ...eosData, empName: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الراتب الشامل الأخير (د.ك):</label>
                  <input
                    type="number"
                    value={eosData.salary}
                    onChange={(e) => setEosData({ ...eosData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">سبب إنهاء العلاقة التعاقدية:</label>
                  <select
                    value={eosData.reason}
                    onChange={(e) => setEosData({ ...eosData, reason: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  >
                    <option value="termination_by_company">إنهاء خدمة من طرف المنشأة / انتهاء العقد</option>
                    <option value="resignation">استقالة الموظف (المادة 53)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">سنوات الخدمة:</label>
                  <input
                    type="number"
                    value={eosData.years}
                    onChange={(e) => setEosData({ ...eosData, years: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">الأشهر الإضافية:</label>
                  <input
                    type="number"
                    value={eosData.months}
                    onChange={(e) => setEosData({ ...eosData, months: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-700 border-b pb-2 mb-4">تفاصيل الحسبة القانونية التراكمية:</h4>
                <div className="space-y-2.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>أجر اليوم الواحد (الراتب ÷ 26):</span>
                    <span className="font-mono font-bold">{(eosData.salary / 26).toFixed(3)} د.ك</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي مدة الخدمة المعتمدة:</span>
                    <span className="font-bold">{eosData.years} سنوات و {eosData.months} أشهر</span>
                  </div>
                  <div className="flex justify-between">
                    <span>النسبة المستحقة طبقاً لسبب الإنهاء:</span>
                    <span className="font-bold text-emerald-700">
                      {eosData.reason === 'resignation' ? (
                        (eosData.years + eosData.months/12) < 3 ? '0%' :
                        (eosData.years + eosData.months/12) < 5 ? '50% (نصف مكافأة)' :
                        (eosData.years + eosData.months/12) < 10 ? '66.6% (ثلثي مكافأة)' : '100% كاملة'
                      ) : '100% كاملة'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-4">
                <div className="p-4 bg-[#714B67]/10 border border-[#714B67]/20 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-[#714B67]">صافي مكافأة نهاية الخدمة المستحقة:</span>
                  <span className="font-black text-xl font-mono text-[#714B67]">
                    {calculateEOS().toFixed(3)} د.ك
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCustodyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-[#714B67]" size={20} />
                تسليم عهدة عينية جديدة للموظف
              </h3>
              <button type="button" onClick={() => setShowCustodyModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustody} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف المستلم *</label>
                <input
                  type="text"
                  required
                  value={newCustody.employeeName}
                  onChange={(e) => setNewCustody({ ...newCustody, employeeName: e.target.value })}
                  placeholder="مثال: أحمد محمود الكندري"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">بيان العهدة والأصل المستلم *</label>
                <input
                  type="text"
                  required
                  value={newCustody.itemType}
                  onChange={(e) => setNewCustody({ ...newCustody, itemType: e.target.value })}
                  placeholder="مثال: جهاز لابتوب Dell Latitude + شاحن"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي (S/N)</label>
                  <input
                    type="text"
                    value={newCustody.serialNumber}
                    onChange={(e) => setNewCustody({ ...newCustody, serialNumber: e.target.value })}
                    placeholder="SN-XXXXXX"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم *</label>
                  <input
                    type="date"
                    required
                    value={newCustody.handoverDate}
                    onChange={(e) => setNewCustody({ ...newCustody, handoverDate: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات تسليم العهدة</label>
                <textarea
                  rows={2}
                  value={newCustody.notes}
                  onChange={(e) => setNewCustody({ ...newCustody, notes: e.target.value })}
                  placeholder="ملاحظات حول حالة المعدات أو الملحقات..."
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowCustodyModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#714B67] text-white font-bold transition shadow-sm">إقرار وتسليم العهدة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="text-emerald-600" size={20} />
                تقييد سلفة مالية جديدة للموظف
              </h3>
              <button type="button" onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddLoan} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف طالب السلفة *</label>
                <input
                  type="text"
                  required
                  value={newLoan.employeeName}
                  onChange={(e) => setNewLoan({ ...newLoan, employeeName: e.target.value })}
                  placeholder="مثال: محمد إبراهيم السيد"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">إجمالي مبلغ السلفة (د.ك) *</label>
                  <input
                    type="number"
                    required
                    value={newLoan.totalAmount}
                    onChange={(e) => setNewLoan({ ...newLoan, totalAmount: e.target.value })}
                    placeholder="0.000"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسط الشهري المقتطع *</label>
                  <input
                    type="number"
                    required
                    value={newLoan.monthlyInstallment}
                    onChange={(e) => setNewLoan({ ...newLoan, monthlyInstallment: e.target.value })}
                    placeholder="100.000"
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ البدء بالاقتطاع *</label>
                <input
                  type="date"
                  required
                  value={newLoan.startDate}
                  onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                <p className="font-bold">ملاحظة محاسبية:</p>
                <p className="text-[10px] mt-0.5">يتم خصم هذا القسط شهرياً من مسير رواتب الموظف (WPS) حتى استيفاء السداد بالكامل.</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowLoanModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold transition shadow-sm">اعتماد وقيد السلفة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-600" size={20} />
                إصدار قرار عقوبة أو إنذار قانوني جديد
              </h3>
              <button type="button" onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddWarning} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الموظف المخالف *</label>
                <input
                  type="text"
                  required
                  value={newWarning.employeeName}
                  onChange={(e) => setNewWarning({ ...newWarning, employeeName: e.target.value })}
                  placeholder="مثال: محمد إبراهيم السيد"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الإنذار / العقوبة *</label>
                  <select
                    value={newWarning.warningType}
                    onChange={(e) => setNewWarning({ ...newWarning, warningType: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67] font-bold"
                  >
                    <option value="لفت نظر أول">لفت نظر شفوي/كتابي</option>
                    <option value="إنذار كتابي أول">إنذار كتابي أول</option>
                    <option value="إنذار كتابي نهائي">إنذار كتابي نهائي</option>
                    <option value="قرار خصم مباشر">قرار خصم مباشر</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ تحرير الواقعة *</label>
                  <input
                    type="date"
                    required
                    value={newWarning.date}
                    onChange={(e) => setNewWarning({ ...newWarning, date: e.target.value })}
                    className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب المخالفة بالتفصيل *</label>
                <textarea
                  rows={2}
                  required
                  value={newWarning.reason}
                  onChange={(e) => setNewWarning({ ...newWarning, reason: e.target.value })}
                  placeholder="يرجى ذكر سبب المخالفة والشهود وتوقيت حدوثها بدقة..."
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                ></textarea>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الإجراء التأديبي المترتب *</label>
                <input
                  type="text"
                  required
                  value={newWarning.actionTaken}
                  onChange={(e) => setNewWarning({ ...newWarning, actionTaken: e.target.value })}
                  placeholder="خصم أجر يوم واحد من مسير الرواتب"
                  className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:border-[#714B67]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowWarningModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 font-bold transition">إلغاء</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-rose-600 text-white font-bold transition shadow-sm">اعتماد وإصدار الإنذار</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Chatter Component */}
      <div className="mt-8">
        <OdooChatter 
          recordId="operations_global" 
          model="operations" 
          followers={[{id: '3', name: 'مدير الشؤون الإدارية'}]}
          messages={[
            { id: '1', author: 'النظام', type: 'tracking', date: new Date().toLocaleDateString('ar-KW'), content: 'تم تسجيل العهد والسلف الجديدة' }
          ]}
        />
      </div>
    </div>
  );
};

export default OdooOperationsApp;
