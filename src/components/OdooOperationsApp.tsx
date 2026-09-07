import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Laptop, 
  Car, 
  PhoneCall, 
  CreditCard, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Printer, 
  Download, 
  ArrowRightLeft, 
  FileCheck, 
  Building2, 
  User, 
  RefreshCw, 
  X, 
  Calendar, 
  Eye,
  ShieldCheck,
  Tag,
  Hash
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { useOdooHierarchy, EmployeeContract } from '../context/OdooHierarchyContext';
import { CustodyItem } from '../types';
import { MANARA_STORAGE_KEYS, getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { formatKWD } from '../utils/kuwaitLaw';
import { exportToExcel } from '../utils/exportUtils';
import { printDocument, exportElementToPdf } from '../utils/printUtils';
import { toast } from 'react-hot-toast';

export const OdooOperationsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const { employees } = useOdooHierarchy();

  // Company-scoped employees
  const companyEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return employees.filter(e => !activeCompany?.id || e.companyId === activeCompany.id);
  }, [employees, activeCompany]);

  // Seed sample initial custodies if empty
  const defaultCustodies: CustodyItem[] = useMemo(() => {
    const emp1 = companyEmployees[0]?.id || 'emp-1';
    const emp2 = companyEmployees[1]?.id || companyEmployees[0]?.id || 'emp-2';
    const emp3 = companyEmployees[2]?.id || companyEmployees[0]?.id || 'emp-3';
    const cId = activeCompany?.id || '';

    return [
      {
        id: 'cust-101',
        companyId: cId,
        employeeId: emp1,
        itemCode: 'CST-4091',
        itemName: 'لابتوب Dell Latitude 5540 Core i7 (16GB RAM / 512GB SSD)',
        itemCategory: 'ELECTRONICS',
        serialNumber: 'DL-992341A-KW',
        handoverDate: '2025-01-15',
        valueKwd: 420.000,
        condition: 'EXCELLENT',
        status: 'ASSIGNED',
        notes: 'تم تسليم الجهاز مع الشاحن الأصلي وحقيبة لابتوب مقاومة للصدمات.'
      },
      {
        id: 'cust-102',
        companyId: cId,
        employeeId: emp2,
        itemCode: 'CST-4092',
        itemName: 'سيارة تويوتا كامري 2024 (لوحة رقم 14-8890 أبيض)',
        itemCategory: 'VEHICLE',
        serialNumber: 'VIN-JT2BF22K9812903',
        handoverDate: '2024-11-01',
        expiryDate: '2026-11-01',
        valueKwd: 6850.000,
        condition: 'GOOD',
        status: 'ASSIGNED',
        notes: 'مخصصة للمهندس الميداني ومندوب الشؤون الحكومية. شاملة التأمين الذهبي والفحص الفني.'
      },
      {
        id: 'cust-103',
        companyId: cId,
        employeeId: emp3,
        itemCode: 'CST-4093',
        itemName: 'هاتف ذكي iPhone 15 Pro (256GB) + شريحة زين أعمال 5G',
        itemCategory: 'SIM_PHONE',
        serialNumber: 'IMEI-3589012398124',
        handoverDate: '2025-02-01',
        valueKwd: 390.000,
        condition: 'EXCELLENT',
        status: 'ASSIGNED',
        notes: 'شريحة اتصال مفوترة مخصصة للتواصل مع العملاء والجهات الرسمية.'
      },
      {
        id: 'cust-104',
        companyId: cId,
        employeeId: emp1,
        itemCode: 'CST-4094',
        itemName: 'بطاقة وقود ومشتريات بترول K-Net مسبقة الدفع',
        itemCategory: 'FINANCIAL_CARD',
        serialNumber: 'PETRO-CARD-9921',
        handoverDate: '2025-01-20',
        valueKwd: 150.000,
        condition: 'EXCELLENT',
        status: 'ASSIGNED',
        notes: 'مخصصة للتزود بالوقود أثناء الزيارات الرسمية للمشاريع.'
      },
      {
        id: 'cust-105',
        companyId: cId,
        employeeId: '',
        itemCode: 'CST-4095',
        itemName: 'طابعة ليزر متعددة المهام HP LaserJet Pro MFP 4103',
        itemCategory: 'ELECTRONICS',
        serialNumber: 'HP-CNB28190X',
        handoverDate: '2024-08-10',
        valueKwd: 210.000,
        condition: 'EXCELLENT',
        status: 'RETURNED',
        notes: 'مستردة في مستودع المنشأة وجاهزة للتسليم لأي قسم يحتاجها.'
      },
      {
        id: 'cust-106',
        companyId: cId,
        employeeId: '',
        itemCode: 'CST-4096',
        itemName: 'جهاز فحص وقياس إلكتروني محمول (Precision Multi-Tester)',
        itemCategory: 'TOOLS',
        serialNumber: 'FLK-8842-TEST',
        handoverDate: '2024-05-12',
        valueKwd: 340.000,
        condition: 'NEEDS_REPAIR',
        status: 'MAINTENANCE',
        notes: 'في قسم الصيانة للمعايرة وإصلاح شاشة العرض.'
      }
    ];
  }, [companyEmployees, activeCompany]);

  // Persistent State
  const [custodies, setCustodies] = useState<CustodyItem[]>(() => {
    return getPersistentData<CustodyItem[]>(MANARA_STORAGE_KEYS.CUSTODIES, defaultCustodies);
  });

  const saveCustodies = (updated: CustodyItem[]) => {
    setCustodies(updated);
    setPersistentData(MANARA_STORAGE_KEYS.CUSTODIES, updated);
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<CustodyItem> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CustodyItem | null>(null);
  const [printableRecord, setPrintableRecord] = useState<{
    type: 'HANDOVER' | 'CLEARANCE';
    custody: CustodyItem;
    employee?: EmployeeContract | null;
  } | null>(null);

  // Filtered Custodies
  const companyCustodies = useMemo(() => {
    return custodies.filter(c => !activeCompany?.id || c.companyId === activeCompany.id || !c.companyId);
  }, [custodies, activeCompany]);

  const filteredCustodies = useMemo(() => {
    return companyCustodies.filter(item => {
      const emp = companyEmployees.find(e => e.id === item.employeeId);
      const empName = emp ? (emp.name || '') : '';
      
      const matchesSearch = 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        empName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || item.itemCategory === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [companyCustodies, companyEmployees, searchQuery, selectedCategory, selectedStatus]);

  // KPIs
  const totalValueKwd = useMemo(() => {
    return companyCustodies.reduce((sum, item) => sum + (Number(item.valueKwd) || 0), 0);
  }, [companyCustodies]);

  const assignedCount = useMemo(() => {
    return companyCustodies.filter(c => c.status === 'ASSIGNED').length;
  }, [companyCustodies]);

  const inStockCount = useMemo(() => {
    return companyCustodies.filter(c => c.status === 'RETURNED' || !c.employeeId).length;
  }, [companyCustodies]);

  const maintenanceDamagedCount = useMemo(() => {
    return companyCustodies.filter(c => c.status === 'MAINTENANCE' || c.status === 'DAMAGED').length;
  }, [companyCustodies]);

  // Actions
  const handleOpenAddModal = () => {
    setEditingItem({
      companyId: activeCompany?.id || '',
      itemCode: `CST-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: '',
      itemCategory: 'ELECTRONICS',
      serialNumber: '',
      employeeId: '',
      handoverDate: new Date().toISOString().split('T')[0],
      valueKwd: 150.000,
      condition: 'EXCELLENT',
      status: 'ASSIGNED',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CustodyItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveCustody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.itemName?.trim()) {
      toast.error('يرجى كتابة اسم أو وصف العهدة');
      return;
    }

    const isAssigned = !!editingItem.employeeId;
    const finalStatus = isAssigned ? (editingItem.status || 'ASSIGNED') : 'RETURNED';

    const itemToSave: CustodyItem = {
      id: editingItem.id || `cst-${Date.now()}`,
      companyId: activeCompany?.id || '',
      employeeId: editingItem.employeeId || '',
      itemCode: editingItem.itemCode || `CST-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: editingItem.itemName.trim(),
      itemCategory: editingItem.itemCategory || 'ELECTRONICS',
      serialNumber: editingItem.serialNumber?.trim() || '',
      handoverDate: editingItem.handoverDate || new Date().toISOString().split('T')[0],
      returnDate: editingItem.returnDate || '',
      expiryDate: editingItem.expiryDate || '',
      valueKwd: Number(editingItem.valueKwd) || 0,
      condition: editingItem.condition || 'EXCELLENT',
      status: finalStatus,
      notes: editingItem.notes?.trim() || ''
    };

    let updated: CustodyItem[];
    const idx = custodies.findIndex(c => c.id === itemToSave.id);
    if (idx >= 0) {
      updated = [...custodies];
      updated[idx] = itemToSave;
      toast.success('تم تحديث بيانات العهدة بنجاح');
    } else {
      updated = [itemToSave, ...custodies];
      toast.success('تمت إضافة العهدة الجديدة بنجاح');
    }

    saveCustodies(updated);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteCustody = () => {
    if (!deleteConfirm) return;
    const updated = custodies.filter(c => c.id !== deleteConfirm.id);
    saveCustodies(updated);
    toast.success('تم حذف سجل العهدة بنجاح');
    setDeleteConfirm(null);
  };

  const handleQuickStatusChange = (item: CustodyItem, newStatus: CustodyItem['status']) => {
    const updated = custodies.map(c => {
      if (c.id === item.id) {
        return {
          ...c,
          status: newStatus,
          returnDate: newStatus === 'RETURNED' ? new Date().toISOString().split('T')[0] : c.returnDate,
          employeeId: newStatus === 'RETURNED' ? '' : c.employeeId
        };
      }
      return c;
    });
    saveCustodies(updated);
    if (newStatus === 'RETURNED') {
      toast.success(`تم استرداد العهدة (${item.itemName}) إلى المستودع`);
    } else {
      toast.success(`تم تحديث حالة العهدة إلى: ${newStatus}`);
    }
  };

  const handleOpenPrintVoucher = (custody: CustodyItem, type: 'HANDOVER' | 'CLEARANCE') => {
    const emp = companyEmployees.find(e => e.id === custody.employeeId);
    setPrintableRecord({ type, custody, employee: emp });
  };

  const handleExportExcel = () => {
    const exportData = filteredCustodies.map((item, index) => {
      const emp = companyEmployees.find(e => e.id === item.employeeId);
      const catName = getCategoryLabel(item.itemCategory);
      const conditionName = getConditionLabel(item.condition);
      const statusName = getStatusLabel(item.status);

      return {
        'م': index + 1,
        'كود العهدة': item.itemCode,
        'اسم ووصف العهدة': item.itemName,
        'فئة العهدة': catName,
        'الرقم التسلسلي / S/N': item.serialNumber || '—',
        'الموظف المستلم': emp ? emp.name : 'بالمستودع (غير مسند)',
        'الرقم المدني': emp?.civilId || '—',
        'المسمى الوظيفي': emp?.jobTitle || '—',
        'القيمة التقديرية (د.ك)': (item.valueKwd || 0).toFixed(3),
        'الحالة التشغيلية': conditionName,
        'حالة العهدة': statusName,
        'تاريخ التسليم': item.handoverDate || '—',
        'تاريخ الاسترداد': item.returnDate || '—',
        'تاريخ الانتهاء/الضمان': item.expiryDate || '—',
        'ملاحظات': item.notes || '—'
      };
    });

    exportToExcel(exportData, `سجل_العهد_والممتلكات_${activeCompany?.nameAr || 'المنشأة'}_${new Date().toISOString().split('T')[0]}`);
  };

  // Helper Labels & Icons
  function getCategoryLabel(cat?: string) {
    switch (cat) {
      case 'ELECTRONICS': return 'أجهزة إلكترونية وحواسيب';
      case 'VEHICLE': return 'مركبة / سيارة عمل';
      case 'SIM_PHONE': return 'هاتف محمول / شريحة SIM';
      case 'FINANCIAL_CARD': return 'بطاقة مالية / وقود';
      case 'TOOLS': return 'معدات وأجهزة طبية ومهنية';
      default: return 'أصول وعهد أخرى';
    }
  }

  function getCategoryIcon(cat?: string) {
    switch (cat) {
      case 'ELECTRONICS': return <Laptop size={16} className="text-indigo-600" />;
      case 'VEHICLE': return <Car size={16} className="text-amber-600" />;
      case 'SIM_PHONE': return <PhoneCall size={16} className="text-emerald-600" />;
      case 'FINANCIAL_CARD': return <CreditCard size={16} className="text-purple-600" />;
      case 'TOOLS': return <Wrench size={16} className="text-cyan-600" />;
      default: return <Package size={16} className="text-slate-600" />;
    }
  }

  function getStatusBadge(status?: string) {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> قيد الاستخدام (مسلّمة)
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Package size={12} /> في المستودع (متاحة)
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> قيد الصيانة والإصلاح
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} /> تالفة / مفقودة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            غير محدد
          </span>
        );
    }
  }

  function getStatusLabel(status?: string) {
    switch (status) {
      case 'ASSIGNED': return 'قيد الاستخدام (مسلمة)';
      case 'RETURNED': return 'في المستودع (مستردة)';
      case 'MAINTENANCE': return 'تحت الصيانة';
      case 'DAMAGED': return 'تالفة / مفقودة';
      default: return 'غير محدد';
    }
  }

  function getConditionLabel(cond?: string) {
    switch (cond) {
      case 'EXCELLENT': return 'ممتازة (كالجديدة)';
      case 'GOOD': return 'جيدة وصالحة للعمل';
      case 'NEEDS_REPAIR': return 'تحتاج إلى فحص / صيانة';
      case 'DAMAGED': return 'تالفة أو معطلة';
      default: return 'جيدة';
    }
  }

  return (
    <div className="space-y-5 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* 1. ODOO ENTERPRISE HEADER */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>إدارة العمليات والأصول</span>
            <span>/</span>
            <span className="text-[#714B67] font-black">العهد والممتلكات (Odoo 18 Assets & Custodies)</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-xl">
              <Package size={22} />
            </div>
            العهد والممتلكات وأصول المنشأة
          </h1>
          <p className="text-xs text-slate-500">
            المنشأة النشطة: <strong className="text-[#714B67] font-bold">{activeCompany?.nameAr || 'المؤسسة الطبية'}</strong> | حصر شامل للأجهزة والمعدات والمركبات وسندات إخلاء الطرف المعتمدة.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="تصدير كشف العهد إلى إكسيل"
          >
            <Download size={15} /> تصدير Excel
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#714B67] hover:bg-[#583950] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
          >
            <Plus size={16} /> تسجيل عهدة جديدة
          </button>
        </div>
      </div>

      {/* 2. KPIS METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">القيمة التقديرية للأصول</span>
            <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
              {formatKWD(totalValueKwd)}
            </div>
            <span className="text-[11px] text-slate-400">إجمالي {companyCustodies.length} أصل مسجل</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CreditCard size={24} />
          </div>
        </div>

        {/* Metric 2: Assigned to Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">عهد قيد الاستخدام (مسلّمة)</span>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {assignedCount} <span className="text-xs font-sans text-slate-400 font-normal">عهدة</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">بحوزة الكادر الوظيفي</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Metric 3: In Stock / Returned */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">متاحة في المستودع</span>
            <div className="text-xl font-black text-blue-700 font-mono">
              {inStockCount} <span className="text-xs font-sans text-slate-400 font-normal">أصل</span>
            </div>
            <span className="text-[11px] text-blue-600 font-bold">جاهزة للإسناد والتسليم</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        {/* Metric 4: Maintenance / Damaged */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">تحت الصيانة أو تالفة</span>
            <div className="text-xl font-black text-amber-700 font-mono">
              {maintenanceDamagedCount} <span className="text-xs font-sans text-slate-400 font-normal">عنصر</span>
            </div>
            <span className="text-[11px] text-amber-600 font-bold">تحتاج متابعة وفحص فني</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

      </div>

      {/* 3. SEARCH & SMART FILTERS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، كود العهدة، السيريال، أو اسم الموظف..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#714B67] transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'ASSIGNED', label: 'مسلّمة قيد الاستخدام' },
              { id: 'RETURNED', label: 'بالمستودع' },
              { id: 'MAINTENANCE', label: 'صيانة' },
              { id: 'DAMAGED', label: 'تالفة' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#714B67] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1">
            <Filter size={13} /> الفئة:
          </span>
          {[
            { id: 'ALL', label: 'كافة الفئات' },
            { id: 'ELECTRONICS', label: 'أجهزة ولابتوبات' },
            { id: 'VEHICLE', label: 'سيارات ومركبات' },
            { id: 'SIM_PHONE', label: 'هواتف وشرائح' },
            { id: 'FINANCIAL_CARD', label: 'بطاقات مالية' },
            { id: 'TOOLS', label: 'معدات وأدوات' },
            { id: 'OTHER', label: 'أخرى' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CUSTODIES DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-sm text-slate-800">قائمة العهد والممتلكات المسجلة</h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {filteredCustodies.length}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            انقر على زر السند لطباعة إقرار استلام أو إخلاء طرف رسمي A4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">كود العهدة</th>
                <th className="p-3.5">اسم ووصف الأصل</th>
                <th className="p-3.5">الموظف المسند إليه</th>
                <th className="p-3.5">الرقم التسلسلي (S/N)</th>
                <th className="p-3.5">القيمة التقديرية</th>
                <th className="p-3.5">الحالة التشغيلية</th>
                <th className="p-3.5">حالة العهدة</th>
                <th className="p-3.5 text-center">السندات والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustodies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                    <Package className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">لا توجد عهد تطابق معايير البحث أو الفلترة</p>
                    <p className="text-[11px] text-slate-400">يمكنك إضافة عهدة جديدة أو إعادة ضبط معايير الفلترة.</p>
                  </td>
                </tr>
              ) : (
                filteredCustodies.map(custody => {
                  const emp = companyEmployees.find(e => e.id === custody.employeeId);

                  return (
                    <tr key={custody.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Code */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 rounded-lg">
                            {getCategoryIcon(custody.itemCategory)}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-[#714B67]">{custody.itemCode}</span>
                            <div className="text-[10px] text-slate-400">{getCategoryLabel(custody.itemCategory)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 max-w-xs">{custody.itemName}</div>
                        {custody.notes && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{custody.notes}</div>
                        )}
                      </td>

                      {/* Employee */}
                      <td className="p-3.5 whitespace-nowrap">
                        {emp ? (
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1">
                              <User size={12} className="text-slate-400" />
                              {emp.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {emp.civilId || 'كادر معتمد'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic bg-slate-100 px-2 py-0.5 rounded-md">
                            غير مسندة (بالمستودع)
                          </span>
                        )}
                      </td>

                      {/* Serial */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {custody.serialNumber || '—'}
                        </span>
                        {custody.expiryDate && (
                          <div className="text-[10px] text-amber-700 font-bold mt-1">
                            انتهاء: {custody.expiryDate}
                          </div>
                        )}
                      </td>

                      {/* Value KWD */}
                      <td className="p-3.5 whitespace-nowrap font-mono font-bold text-slate-800">
                        {formatKWD(custody.valueKwd || 0)}
                      </td>

                      {/* Condition */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          custody.condition === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-700' :
                          custody.condition === 'GOOD' ? 'bg-blue-50 text-blue-700' :
                          custody.condition === 'NEEDS_REPAIR' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {getConditionLabel(custody.condition)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getStatusBadge(custody.status)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          
                          {/* Print Handover Voucher (سند تسليم) */}
                          <button
                            onClick={() => handleOpenPrintVoucher(custody, 'HANDOVER')}
                            className="p-1.5 text-slate-500 hover:text-[#714B67] hover:bg-purple-50 rounded-lg transition"
                            title="طباعة إقرار واستلام عهدة رسمي A4"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Print Clearance Certificate (سند إخلاء طرف) */}
                          {custody.employeeId && (
                            <button
                              onClick={() => handleOpenPrintVoucher(custody, 'CLEARANCE')}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="طباعة شهادة إخلاء طرف واسترداد عهدة A4"
                            >
                              <FileCheck size={15} />
                            </button>
                          )}

                          {/* Quick Return / Assign */}
                          {custody.status === 'ASSIGNED' ? (
                            <button
                              onClick={() => handleQuickStatusChange(custody, 'RETURNED')}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="استرداد العهدة إلى المستودع"
                            >
                              <ArrowRightLeft size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenEditModal(custody)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                              title="إسناد العهدة لموظف جديد"
                            >
                              <User size={15} />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(custody)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="تعديل بيانات العهدة"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirm(custody)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف العهدة نهائياً"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== ADD / EDIT MODAL ==================== */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-xl">
                  <Package size={18} />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingItem.id ? 'تعديل بيانات العهدة / الأصل' : 'تسجيل عهدة جديدة'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustody} className="space-y-4 text-xs">
              
              {/* Row 1: Code & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">كود العهدة / الرمز التعريفي *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.itemCode || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, itemCode: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تصنيف العهدة *</label>
                  <select
                    value={editingItem.itemCategory || 'ELECTRONICS'}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, itemCategory: e.target.value as any }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-800 focus:border-[#714B67]"
                  >
                    <option value="ELECTRONICS">أجهزة إلكترونية ولابتوبات</option>
                    <option value="VEHICLE">مركبة / سيارة شركة</option>
                    <option value="SIM_PHONE">هاتف محمول / شريحة SIM</option>
                    <option value="FINANCIAL_CARD">بطاقة مشتريات / وقود</option>
                    <option value="TOOLS">معدات وأدوات مهنية وطبية</option>
                    <option value="OTHER">أصول وعهد أخرى</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Item Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم ووصف العهدة التفصيلي *</label>
                <input
                  type="text"
                  required
                  value={editingItem.itemName || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, itemName: e.target.value }))}
                  placeholder="مثال: لابتوب MacBook Pro M3 Max 16-inch رمادي فلكي"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-bold text-slate-800 focus:border-[#714B67]"
                />
              </div>

              {/* Row 3: Employee Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الموظف المستلم (اتركه فارغاً إذا كانت العهدة بالمستودع)
                </label>
                <select
                  value={editingItem.employeeId || ''}
                  onChange={(e) => setEditingItem(prev => ({ 
                    ...prev, 
                    employeeId: e.target.value,
                    status: e.target.value ? 'ASSIGNED' : 'RETURNED'
                  }))}
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-800 focus:border-[#714B67]"
                >
                  <option value="">-- متوفرة في المستودع (غير مسندة لموظف) --</option>
                  {companyEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.civilId || 'موظف'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Serial & Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الرقم التسلسلي (Serial / Chassis / IMEI)</label>
                  <input
                    type="text"
                    value={editingItem.serialNumber || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="مثال: DL-992341A-KW"
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono text-slate-800 focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القيمة التقديرية (دينار كويتي KWD)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={editingItem.valueKwd || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, valueKwd: parseFloat(e.target.value) }))}
                    placeholder="0.000"
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono font-bold text-slate-800 focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم الفعلي</label>
                  <input
                    type="date"
                    value={editingItem.handoverDate || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, handoverDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono text-slate-800 focus:border-[#714B67]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الضمان أو تأمين المركبة</label>
                  <input
                    type="date"
                    value={editingItem.expiryDate || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none font-mono text-slate-800 focus:border-[#714B67]"
                  />
                </div>
              </div>

              {/* Row 6: Condition & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحالة التشغيلية</label>
                  <select
                    value={editingItem.condition || 'EXCELLENT'}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, condition: e.target.value as any }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-800 focus:border-[#714B67]"
                  >
                    <option value="EXCELLENT">ممتازة (بحالة المصنع / جديدة)</option>
                    <option value="GOOD">جيدة ومستقرة</option>
                    <option value="NEEDS_REPAIR">تحتاج فحص أو صيانة دورية</option>
                    <option value="DAMAGED">تالفة أو غير صالحة للاستخدام</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حالة العهدة</label>
                  <select
                    value={editingItem.status || 'ASSIGNED'}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 outline-none bg-white font-bold text-slate-800 focus:border-[#714B67]"
                  >
                    <option value="ASSIGNED">مسلّمة قيد الاستخدام</option>
                    <option value="RETURNED">في المستودع (مستردة)</option>
                    <option value="MAINTENANCE">تحت الصيانة والإصلاح</option>
                    <option value="DAMAGED">تالفة / مفقودة</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات ومرفقات العهدة</label>
                <textarea
                  rows={2}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="الملحقات المسلمة (شاحن، حقيبة، مفتاح إضافي، رقم اللوحة...)"
                  className="w-full border border-slate-300 rounded-xl p-2.5 outline-none text-slate-800 focus:border-[#714B67]"
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#714B67] hover:bg-[#583950] text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> حفظ بيانات العهدة
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">تأكيد حذف العهدة</h3>
                <p className="text-xs text-slate-500">حذف نهائي من قاعدة البيانات</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              هل أنت متأكد من رغبتك في حذف العهدة: <strong className="text-slate-900">{deleteConfirm.itemName}</strong> (كود: <span className="font-mono text-[#714B67]">{deleteConfirm.itemCode}</span>)؟
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteCustody}
                className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={15} /> نعم، حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== A4 OFFICIAL PRINT VOUCHER MODAL ==================== */}
      {printableRecord && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-8 space-y-6 print:p-0 print:border-none print:shadow-none animate-in fade-in zoom-in duration-150">
            
            {/* Top Toolbar (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="text-[#714B67]" size={20} />
                <span className="font-bold text-sm text-slate-800">
                  {printableRecord.type === 'HANDOVER' ? 'معاينة سند استلام وتسليم عهدة عينية' : 'معاينة شهادة إخلاء طرف واسترداد عهدة'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportElementToPdf('custody-voucher-print-area', printableRecord.type === 'HANDOVER' ? 'Custody_Handover_Voucher' : 'Custody_Clearance_Certificate')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download size={14} /> تصدير PDF
                </button>
                <button
                  onClick={() => printDocument('custody-voucher-print-area', printableRecord.type === 'HANDOVER' ? 'سند_استلام_عهدة' : 'شهادة_إخلاء_طرف_عهدة')}
                  className="px-4 py-1.5 bg-[#714B67] hover:bg-[#583950] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer size={14} /> طباعة رسمية
                </button>
                <button
                  onClick={() => setPrintableRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div id="custody-voucher-print-area" className="p-4 space-y-6 text-slate-900 bg-white" dir="rtl">
              
              {/* Header */}
              <div className="border-b-2 border-[#714B67] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{activeCompany?.nameAr || 'المؤسسة الطبية المتخصصة'}</h2>
                  <div className="text-xs text-slate-500 font-serif">{activeCompany?.nameEn || 'Specialized Medical Enterprise'}</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    السجل التجاري: {activeCompany?.commercialRegNo || '189201'} | دولة الكويت
                  </div>
                </div>
                <div className="text-left dir-ltr">
                  <span className="text-[11px] font-black text-[#714B67] bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    Odoo 18 Custody Document
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                    التاريخ: {new Date().toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 py-2">
                <h3 className="text-lg font-black text-slate-900 underline decoration-[#714B67] decoration-2 underline-offset-8">
                  {printableRecord.type === 'HANDOVER' 
                    ? 'إقرار تسليم واستلام عهدة عينية رسمية' 
                    : 'سند إخلاء طرف واسترداد عهدة وممتلكات'}
                </h3>
                <p className="text-xs text-slate-500">
                  {printableRecord.type === 'HANDOVER'
                    ? 'مستند إداري رسمي صادر عن إدارة الموارد البشرية والعهد'
                    : 'شهادة إبراء ذمة واسترداد أصول الشركة بحالة سليمة'}
                </p>
              </div>

              {/* Employee Information Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-[#714B67] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <User size={14} /> بيانات الموظف المعني:
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500">اسم الموظف:</span>
                    <strong className="mr-2 text-slate-900">{printableRecord.employee?.name || 'كادر معتمد'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">الرقم المدني (PACI):</span>
                    <strong className="mr-2 font-mono text-slate-900">{printableRecord.employee?.civilId || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">المسمى الوظيفي:</span>
                    <strong className="mr-2 text-slate-900">{printableRecord.employee?.jobTitle || 'موظف بالمنشأة'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">القسم / الإدارة:</span>
                    <strong className="mr-2 text-slate-900">{printableRecord.employee?.department || 'الإدارة العامة'}</strong>
                  </div>
                </div>
              </div>

              {/* Custody Details Table */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Package size={14} className="text-[#714B67]" /> تفاصيل العهدة المسجلة:
                </div>
                <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">كود العهدة</th>
                      <th className="p-2.5">اسم ووصف الأصل</th>
                      <th className="p-2.5">الرقم التسلسلي S/N</th>
                      <th className="p-2.5">القيمة التقديرية</th>
                      <th className="p-2.5">تاريخ التسليم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-[#714B67]">{printableRecord.custody.itemCode}</td>
                      <td className="p-2.5 font-bold text-slate-900">{printableRecord.custody.itemName}</td>
                      <td className="p-2.5 font-mono text-slate-700">{printableRecord.custody.serialNumber || '—'}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{formatKWD(printableRecord.custody.valueKwd || 0)}</td>
                      <td className="p-2.5 font-mono text-slate-700">{printableRecord.custody.handoverDate || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Acknowledgment Statement */}
              <div className="p-4 rounded-xl border text-xs leading-relaxed space-y-2 bg-amber-50/70 border-amber-200 text-amber-950">
                {printableRecord.type === 'HANDOVER' ? (
                  <>
                    <div className="font-bold text-amber-900">تعهد وإقرار بالمسؤولية:</div>
                    <p>
                      أقر أنا الموظف الموقع أدناه بأنني قد استلمت العهدة الموضحة بياناتها أعلاه بحالة تشغيلية سليمة وصالحة للعمل، وأتعهد بالمحافظة عليها واستخدامها في أغراض العمل المخصصة لها فقط، كما أتعهد بإعادتها فوراً إلى إدارة الشركة عند طلبها أو عند انتهاء فترة العمل أو الاستقالة، وأتحمل كامل المسؤولية القانونية والمادية في حال فقدانها أو التسبب في إتلافها عمداً أو إهمالاً طبقاً لأحكام قانون العمل الكويتي رقم 6 لسنة 2010.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-emerald-900">إبراء ذمة واسترداد نهائي:</div>
                    <p>
                      تشهد إدارة الموارد البشرية ومستودع الأصول بأن الموظف المذكور أعلاه قد قام بتسليم وإرجاع العهدة الموضحة بعاليه إلى مستودع الشركة بحالة سليمة، وبذلك تعتبر ذمته بريئة تماماً من أي تبعات مادية أو عينية متعلقة بهذه العهدة اعتباراً من تاريخ توقيع هذا السند.
                    </p>
                  </>
                )}
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200 text-center text-xs font-bold text-slate-700">
                <div className="space-y-12">
                  <div>توقيع الموظف المستلم / المفرغ</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
                <div className="space-y-12">
                  <div>مسؤول العهد والمستودع</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
                <div className="space-y-12">
                  <div>ختم واعتماد الموارد البشرية</div>
                  <div className="border-b border-dashed border-slate-400 w-36 mx-auto"></div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default OdooOperationsApp;
