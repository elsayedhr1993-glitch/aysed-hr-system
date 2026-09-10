import React, { useState, useMemo, useEffect } from 'react';
import { DocumentItem, Employee, Company } from '../types';
import { CompanyDocument } from '../types/companyDocuments';
import { CompanyDocumentsKanban } from '../components/CompanyDocumentsKanban';
import { getPersistentData, setPersistentData, MANARA_STORAGE_KEYS } from '../utils/persistentStorage';
import { processAnyDocument } from '../utils/ocrService';
import { exportToExcel } from '../utils/exportUtils';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DirectDocumentUploadModal } from '../components/documents/DirectDocumentUploadModal';
import { DocumentCompliancePrintModal } from '../components/documents/DocumentCompliancePrintModal';
import toast from 'react-hot-toast';
import { 
  FolderOpen, FileText, Upload, Trash2, Search, X, CheckCircle2, 
  Scan, AlertTriangle, Download, Calendar, BellRing, Shield, 
  LayoutGrid, List, FileSpreadsheet, Printer, Eye, Plus, Building2, 
  User, Clock, Filter, Sparkles
} from 'lucide-react';

interface DocumentsAppProps {
  documents: DocumentItem[];
  employees: Employee[];
  activeCompany: Company;
  filterTab: string;
  onSaveDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onAutoAddEmpFromOCR: (empData: any, docType?: string) => string | Promise<string>;
  isOCRModalOpenInitially?: boolean;
  onNavigateToApp?: (app: any) => void;
  onSelectEmpForForm?: (emp: Employee) => void;
}

export const DocumentsApp: React.FC<DocumentsAppProps> = ({
  documents,
  employees,
  activeCompany,
  filterTab,
  onSaveDocument,
  onDeleteDocument,
  onAutoAddEmpFromOCR,
  isOCRModalOpenInitially = false,
  onNavigateToApp,
  onSelectEmpForForm,
}) => {
  // Main Workspace Tab (Employee Docs vs Company Licenses)
  const [workspaceTab, setWorkspaceTab] = useState<'EMPLOYEE_DOCS' | 'COMPANY_LICENSES'>('EMPLOYEE_DOCS');

  // Sidebar Folders for employee docs
  const [activeFolder, setActiveFolder] = useState<string>('ALL');

  // View Mode: Kanban vs List/Table
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(isOCRModalOpenInitially);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  // OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Company Licenses Storage
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>(() => 
    getPersistentData<CompanyDocument[]>(MANARA_STORAGE_KEYS.COMPANY_DOCUMENTS, [])
  );

  const handleSaveCompanyDoc = (doc: CompanyDocument) => {
    const updated = companyDocuments.some(d => d.id === doc.id)
      ? companyDocuments.map(d => d.id === doc.id ? doc : d)
      : [doc, ...companyDocuments];
    setCompanyDocuments(updated);
    setPersistentData(MANARA_STORAGE_KEYS.COMPANY_DOCUMENTS, updated);
  };

  const handleDeleteCompanyDoc = (docId: string) => {
    const updated = companyDocuments.filter(d => d.id !== docId);
    setCompanyDocuments(updated);
    setPersistentData(MANARA_STORAGE_KEYS.COMPANY_DOCUMENTS, updated);
  };

  // Departments list
  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(e => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Alert threshold in days
  const ALERT_THRESHOLD = 60;

  // Enriched Documents with dynamic live calculations
  const enrichedCompanyDocs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (documents || [])
      .filter(d => !d.companyId || d.companyId === activeCompany?.id || d.companyId === 'default')
      .map(doc => {
        let currentStatus: 'active' | 'near_expiry' | 'expired' = 'active';
        let daysToExpiry: number | null = null;

        if (doc.expiryDate) {
          const expDate = new Date(doc.expiryDate);
          expDate.setHours(0, 0, 0, 0);
          const diffTime = expDate.getTime() - today.getTime();
          daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (daysToExpiry < 0) {
            currentStatus = 'expired';
          } else if (daysToExpiry <= ALERT_THRESHOLD) {
            currentStatus = 'near_expiry';
          } else {
            currentStatus = 'active';
          }
        }

        const employee = employees.find(e => e.id === doc.employeeId);
        return { ...doc, currentStatus, daysToExpiry, employee };
      });
  }, [documents, activeCompany, employees]);

  // KPI Summary Metrics
  const metrics = useMemo(() => {
    const total = enrichedCompanyDocs.length;
    const active = enrichedCompanyDocs.filter(d => d.currentStatus === 'active').length;
    const nearExpiry = enrichedCompanyDocs.filter(d => d.currentStatus === 'near_expiry').length;
    const expired = enrichedCompanyDocs.filter(d => d.currentStatus === 'expired').length;
    return { total, active, nearExpiry, expired };
  }, [enrichedCompanyDocs]);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return enrichedCompanyDocs.filter(doc => {
      // Folder filter
      if (activeFolder === 'IDS' && !['CIVIL_ID', 'PASSPORT', 'DRIVING_LICENSE'].includes(doc.category)) return false;
      if (activeFolder === 'RESIDENCY' && doc.category !== 'RESIDENCY') return false;
      if (activeFolder === 'CONTRACTS' && !['CONTRACT', 'WORK_CONTRACT'].includes(doc.category)) return false;
      if (activeFolder === 'MEDICAL' && doc.category !== 'MOH_LICENSE') return false;
      if (activeFolder === 'ACTIVITIES' && doc.currentStatus === 'active') return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && doc.currentStatus !== 'active') return false;
      if (statusFilter === 'NEAR_EXPIRY' && doc.currentStatus !== 'near_expiry') return false;
      if (statusFilter === 'EXPIRED' && doc.currentStatus !== 'expired') return false;

      // Department filter
      if (departmentFilter !== 'ALL' && doc.employee?.department !== departmentFilter) return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = doc.title?.toLowerCase().includes(q);
        const matchesEmp = doc.employee?.fullNameAr?.toLowerCase().includes(q) || doc.employee?.fullNameEn?.toLowerCase().includes(q);
        const matchesCivil = doc.employee?.civilId?.includes(q);
        const matchesDocNum = doc.documentNumber?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesEmp && !matchesCivil && !matchesDocNum) return false;
      }

      return true;
    });
  }, [enrichedCompanyDocs, activeFolder, statusFilter, departmentFilter, searchTerm]);

  // Handle Export to Excel
  const handleExportExcel = () => {
    if (filteredDocs.length === 0) {
      toast.error('لا توجد مستندات لتصديرها');
      return;
    }

    const excelRows = filteredDocs.map((doc, idx) => ({
      'م': idx + 1,
      'عنوان المستند': doc.title,
      'التصنيف': doc.category,
      'رقم الوثيقة': doc.documentNumber || '—',
      'اسم الموظف': doc.employee?.fullNameAr || 'مستند عام',
      'الرقم المدني': doc.employee?.civilId || '—',
      'القسم': doc.employee?.department || '—',
      'المسمى الوظيفي': doc.employee?.jobTitle || '—',
      'تاريخ الإصدار': doc.issueDate || '—',
      'تاريخ الانتهاء': doc.expiryDate || '—',
      'الأيام المتبقية': doc.daysToExpiry !== null ? doc.daysToExpiry : '—',
      'حالة الصلاحية': doc.currentStatus === 'expired' ? 'منتهي' : doc.currentStatus === 'near_expiry' ? 'يوشك على الانتهاء' : 'ساري',
      'تاريخ الأرشفة': doc.uploadDate || '—'
    }));

    exportToExcel(excelRows, `ارشيف_المستندات_${activeCompany?.name || 'الشركة'}_${new Date().toISOString().split('T')[0]}`);
  };

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'CIVIL_ID': return <FileText className="w-7 h-7 text-sky-500" />;
      case 'PASSPORT': return <FileText className="w-7 h-7 text-indigo-500" />;
      case 'RESIDENCY': return <FileText className="w-7 h-7 text-emerald-500" />;
      case 'CONTRACT': 
      case 'WORK_CONTRACT': return <FileText className="w-7 h-7 text-amber-500" />;
      case 'MOH_LICENSE': return <FileText className="w-7 h-7 text-rose-500" />;
      default: return <FileText className="w-7 h-7 text-purple-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)] bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200" dir="rtl">
      
      {/* 1. Header Workspace Selector & Main Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center shadow-xs">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">الأرشيف الرقمي والوثائق</h2>
              <span className="bg-purple-100 text-[#714B67] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                Odoo Documents v17
              </span>
            </div>
            <p className="text-xs text-slate-500">
              إدارة الهويات، الجوازات، العقود، وتراخيص المنشأة مع الرقابة اللحظية على مدد الانتهاء
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setWorkspaceTab('EMPLOYEE_DOCS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              workspaceTab === 'EMPLOYEE_DOCS'
                ? 'bg-white text-[#714B67] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>مستندات الكادر والموظفين ({metrics.total})</span>
          </button>
          <button
            onClick={() => setWorkspaceTab('COMPANY_LICENSES')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              workspaceTab === 'COMPANY_LICENSES'
                ? 'bg-white text-[#714B67] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>تراخيص وسجلات المنشأة ({companyDocuments.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Summary Cards (Shown for Employee Docs) */}
      {workspaceTab === 'EMPLOYEE_DOCS' && (
        <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Total */}
            <div 
              onClick={() => setStatusFilter('ALL')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                statusFilter === 'ALL' ? 'border-[#714B67] bg-purple-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
              }`}
            >
              <div>
                <p className="text-xs font-medium text-slate-500">إجمالي المستندات</p>
                <h4 className="text-xl font-black text-slate-900 font-mono mt-0.5">{metrics.total}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-700">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Active */}
            <div 
              onClick={() => setStatusFilter('ACTIVE')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                statusFilter === 'ACTIVE' ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/50 hover:bg-emerald-50/30'
              }`}
            >
              <div>
                <p className="text-xs font-medium text-emerald-700">سارية وصالحة</p>
                <h4 className="text-xl font-black text-emerald-800 font-mono mt-0.5">{metrics.active}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Expiring Soon */}
            <div 
              onClick={() => setStatusFilter('NEAR_EXPIRY')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                statusFilter === 'NEAR_EXPIRY' ? 'border-amber-500 bg-amber-50/70' : 'border-slate-200 bg-slate-50/50 hover:bg-amber-50/30'
              }`}
            >
              <div>
                <p className="text-xs font-medium text-amber-700">تنتهي قريباً (&lt;60 يوم)</p>
                <h4 className="text-xl font-black text-amber-800 font-mono mt-0.5">{metrics.nearExpiry}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Expired */}
            <div 
              onClick={() => setStatusFilter('EXPIRED')}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                statusFilter === 'EXPIRED' ? 'border-rose-500 bg-rose-50/70' : 'border-slate-200 bg-slate-50/50 hover:bg-rose-50/30'
              }`}
            >
              <div>
                <p className="text-xs font-medium text-rose-700">منتهية الصلاحية</p>
                <h4 className="text-xl font-black text-rose-800 font-mono mt-0.5">{metrics.expired}</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Main Body */}
      {workspaceTab === 'COMPANY_LICENSES' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <CompanyDocumentsKanban 
            documents={companyDocuments} 
            onSaveDocument={handleSaveCompanyDoc} 
            onDeleteDocument={handleDeleteCompanyDoc} 
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left / Right Sidebar: Smart Folders (Odoo Workspaces) */}
          <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0">
            
            {/* Quick Action: Direct Upload & OCR buttons */}
            <div className="p-3.5 border-b border-slate-200 space-y-2">
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="w-full bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>رفع وأرشفة مستند جديد</span>
              </button>
              <button 
                onClick={() => setShowOCRModal(true)} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5 text-[#714B67]" />
                <span>مسح ضوئي ذكي (OCR)</span>
              </button>
            </div>

            {/* Folders List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              
              <section>
                <header className="font-bold text-slate-700 text-xs mb-2.5 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#714B67]"/> المجلدات والتصنيفات
                </header>
                <ul className="space-y-1 text-xs font-semibold">
                  <li 
                    onClick={() => setActiveFolder('ALL')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'ALL' ? 'bg-[#714B67] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>كافة الوثائق (All)</span>
                    <span className="font-mono text-[10px] opacity-80">{metrics.total}</span>
                  </li>
                  <li 
                    onClick={() => setActiveFolder('IDS')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'IDS' ? 'bg-[#714B67] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>البطاقات المدنية والجوازات</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {enrichedCompanyDocs.filter(d => ['CIVIL_ID', 'PASSPORT', 'DRIVING_LICENSE'].includes(d.category)).length}
                    </span>
                  </li>
                  <li 
                    onClick={() => setActiveFolder('RESIDENCY')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'RESIDENCY' ? 'bg-[#714B67] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>الإقامات وتأشيرات العمل</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {enrichedCompanyDocs.filter(d => d.category === 'RESIDENCY').length}
                    </span>
                  </li>
                  <li 
                    onClick={() => setActiveFolder('CONTRACTS')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'CONTRACTS' ? 'bg-[#714B67] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>عقود العمل الحكومية (PAM)</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {enrichedCompanyDocs.filter(d => ['CONTRACT', 'WORK_CONTRACT'].includes(d.category)).length}
                    </span>
                  </li>
                  <li 
                    onClick={() => setActiveFolder('MEDICAL')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'MEDICAL' ? 'bg-[#714B67] text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>تراخيص الصحة ومزاولة المهنة</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {enrichedCompanyDocs.filter(d => d.category === 'MOH_LICENSE').length}
                    </span>
                  </li>
                </ul>
              </section>

              {/* Activities section */}
              <section>
                <header className="font-bold text-slate-700 text-xs mb-2.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#714B67]"/> المتابعة والأنشطة (Activities)
                </header>
                <ul className="space-y-1 text-xs font-semibold">
                  <li 
                    onClick={() => setActiveFolder('ACTIVITIES')} 
                    className={`p-2.5 rounded-xl cursor-pointer transition flex justify-between items-center ${
                      activeFolder === 'ACTIVITIES' ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5" />
                      تتطلب تجديداً عاجلاً
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeFolder === 'ACTIVITIES' ? 'bg-white text-amber-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {metrics.nearExpiry + metrics.expired}
                    </span>
                  </li>
                </ul>
              </section>

            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
            
            {/* Toolbar: Search, Dept Filter, View Mode, Export, Print */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              {/* Search input */}
              <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    placeholder="ابحث بالاسم، الرقم المدني، رقم الوثيقة..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67] focus:bg-white transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Department Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> القسم:
                </span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#714B67] cursor-pointer"
                >
                  <option value="ALL">كافة الأقسام</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Right Side Buttons: View Mode Switcher, Export Excel, Print A4 */}
              <div className="flex items-center gap-2">
                
                {/* View Switcher: Kanban vs List */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'kanban' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="عرض البطاقات (Kanban)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="عرض الجدول المفصل (List)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Export Excel */}
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="تصدير كشف إكسيل"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">تصدير Excel</span>
                </button>

                {/* Print Report */}
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="bg-[#714B67] hover:bg-[#5a3a51] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="طباعة التقرير الرسمي A4"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">طباعة كشف A4</span>
                </button>

              </div>

            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Alert notice if viewing activities */}
              {activeFolder === 'ACTIVITIES' && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">أنشطة التجديد الإدارية المطلوبة (Odoo Compliance)</h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        الوثائق التالية تتطلب إجراءات عاجلة للتجديد (منتهية أو تنتهي خلال 60 يوماً).
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-200 text-amber-900 font-mono font-bold text-xs px-3 py-1 rounded-full">
                    {filteredDocs.length} وثيقة
                  </span>
                </div>
              )}

              {/* View 1: Kanban Cards Grid */}
              {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredDocs.map(doc => {
                    let borderClass = 'border-slate-200';
                    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                    if (doc.currentStatus === 'expired') {
                      borderClass = 'border-r-4 border-r-rose-600 border-slate-200';
                      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                    } else if (doc.currentStatus === 'near_expiry') {
                      borderClass = 'border-r-4 border-r-amber-500 border-slate-200';
                      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                    }

                    return (
                      <div 
                        key={doc.id} 
                        className={`bg-white rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between border ${borderClass} group`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                              {getFileIcon(doc.category)}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedDocForPreview(doc)}
                                className="p-1.5 text-slate-400 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition"
                                title="معاينة المستند"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف المستند: ${doc.title}؟`)) {
                                    onDeleteDocument(doc.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h4 
                            onClick={() => setSelectedDocForPreview(doc)}
                            className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-[#714B67] cursor-pointer transition"
                          >
                            {doc.title}
                          </h4>

                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{doc.employee ? doc.employee.fullNameAr : 'مستند عام للمنشأة'}</span>
                          </div>

                          {doc.documentNumber && (
                            <div className="text-[11px] text-slate-400 font-mono mt-1">
                              رقم: {doc.documentNumber}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Expiry Badge & Date */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          {doc.expiryDate ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badgeClass} font-mono`}>
                              {doc.daysToExpiry !== null && (
                                <span>{doc.daysToExpiry > 0 ? `متبقي ${doc.daysToExpiry} يوم` : `منتهي (${Math.abs(doc.daysToExpiry)} يوم)`}</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">بدون انتهاء</span>
                          )}

                          <span className="text-[11px] font-mono text-slate-400">
                            {doc.expiryDate || '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* View 2: Detailed List / Table View */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">اسم المستند / الوثيقة</th>
                        <th className="p-3.5">الموظف المعني</th>
                        <th className="p-3.5 font-mono">الرقم المدني</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5 font-mono">رقم الوثيقة</th>
                        <th className="p-3.5 font-mono">تاريخ الانتهاء</th>
                        <th className="p-3.5 text-center">الأيام المتبقية</th>
                        <th className="p-3.5 text-center">حالة السريان</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc, idx) => {
                        let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        let badgeText = 'ساري المفعول';

                        if (doc.currentStatus === 'expired') {
                          badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                          badgeText = 'منتهي الصلاحية';
                        } else if (doc.currentStatus === 'near_expiry') {
                          badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                          badgeText = 'يوشك على الانتهاء';
                        }

                        return (
                          <tr key={doc.id} className={`hover:bg-purple-50/30 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#714B67]" />
                                <span 
                                  onClick={() => setSelectedDocForPreview(doc)} 
                                  className="hover:text-[#714B67] cursor-pointer"
                                >
                                  {doc.title}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-700">
                              {doc.employee ? doc.employee.fullNameAr : 'مستند عام'}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {doc.employee?.civilId || '—'}
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {doc.employee?.department || '—'}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {doc.documentNumber || '—'}
                            </td>
                            <td className="p-3.5 font-mono font-bold text-slate-900">
                              {doc.expiryDate || '—'}
                            </td>
                            <td className="p-3.5 text-center font-mono">
                              {doc.daysToExpiry !== null ? (
                                <span className={doc.daysToExpiry < 0 ? 'text-rose-600 font-bold' : doc.daysToExpiry <= 60 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                                  {doc.daysToExpiry > 0 ? `${doc.daysToExpiry} يوم` : `-${Math.abs(doc.daysToExpiry)} يوم`}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] border ${badgeColor}`}>
                                {badgeText}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedDocForPreview(doc)}
                                  className="p-1.5 text-slate-400 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition"
                                  title="معاينة"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`حذف المستند: ${doc.title}؟`)) {
                                      onDeleteDocument(doc.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty state */}
              {filteredDocs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-30 text-[#714B67]" />
                  <h4 className="font-bold text-slate-700 text-base mb-1">لا توجد مستندات مطابقة في هذا المجلد</h4>
                  <p className="text-xs text-slate-400 mb-4">جرّب تغيير معايير البحث أو رفع مستند جديد عبر الزر المخصص</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5a3a51] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> رفع وأرشفة مستند الآن
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* 4. Modals */}
      
      {/* Modal 1: Document Live Preview */}
      <DocumentPreviewModal
        isOpen={Boolean(selectedDocForPreview)}
        onClose={() => setSelectedDocForPreview(null)}
        document={selectedDocForPreview}
        employee={selectedDocForPreview ? employees.find(e => e.id === selectedDocForPreview.employeeId) : undefined}
        onDelete={(id) => {
          onDeleteDocument(id);
          setSelectedDocForPreview(null);
        }}
      />

      {/* Modal 2: Direct Document Upload */}
      <DirectDocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        employees={employees}
        companyId={activeCompany?.id || 'default'}
        onSaveDocument={onSaveDocument}
      />

      {/* Modal 3: Compliance Print Report (A4) */}
      <DocumentCompliancePrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        documents={filteredDocs}
        employees={employees}
        company={activeCompany}
        filterTitle={activeFolder === 'ACTIVITIES' ? 'الوثائق المطلوب تجديدها عاجلاً' : 'أرشيف الوثائق العام'}
      />

      {/* Modal 4: Smart OCR Scanner Modal */}
      {showOCRModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#714B67]" />
                الماسح الضوئي الذكي (AI OCR)
              </h3>
              <button 
                onClick={() => {
                  setShowOCRModal(false);
                  setScanResult(null);
                }} 
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              {isScanning ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-bold text-slate-700 text-sm animate-pulse">جاري تحليل الوثيقة واستخراج البيانات آلياً...</p>
                </div>
              ) : scanResult ? (
                <div className="w-full space-y-4">
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      <strong className="block mb-1 text-base">تم التعرف على الوثيقة بنجاح!</strong>
                      <div className="text-xs space-y-1 font-mono">
                        <p>نوع الوثيقة: {scanResult.docType}</p>
                        <p>الاسم: {scanResult.extractedData.fullNameAr || scanResult.extractedData.fullNameEn || '—'}</p>
                        <p>الرقم المدني / الجواز: {scanResult.extractedData.civilId || scanResult.extractedData.passportNumber || '—'}</p>
                        <p>تاريخ الانتهاء: {scanResult.extractedData.expiryDate || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        const newEmpId = await onAutoAddEmpFromOCR(scanResult.extractedData, scanResult.docType);
                        onSaveDocument({
                          id: `doc-${Date.now()}`,
                          companyId: activeCompany?.id || '',
                          employeeId: newEmpId,
                          title: `${scanResult.docType} - ${scanResult.extractedData.fullNameAr || 'موظف جديد'}`,
                          category: scanResult.docType === 'CIVIL_ID' ? 'CIVIL_ID' : 'PASSPORT',
                          fileUrl: scanResult.fileUrl || '#',
                          fileName: `${scanResult.docType}.pdf`,
                          fileSize: '1.2 MB',
                          uploadDate: new Date().toISOString().split('T')[0],
                          expiryDate: scanResult.extractedData.expiryDate || '2027-01-01',
                          status: 'active'
                        });
                        toast.success('تمت أرشفة الوثيقة وإدراج بيانات الموظف بنجاح');
                        setShowOCRModal(false);
                        setScanResult(null);
                      }}
                      className="flex-1 bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 rounded-xl transition text-xs shadow-xs"
                    >
                      تأكيد الأرشفة وإنشاء الموظف
                    </button>
                    <button
                      onClick={() => setScanResult(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      مسح وثيقة أخرى
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-dashed border-slate-300">
                    <Upload className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">قم برفع أو تصوير الوثيقة</h4>
                    <p className="text-xs text-slate-500 mb-5 max-w-sm">
                      يدعم قراءة (البطاقة المدنية، الجواز، الإقامة، وتراخيص وزارة الصحة) عبر الذكاء الاصطناعي.
                    </p>
                    <label className="bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer transition shadow-xs inline-flex items-center gap-2 text-xs">
                      <Scan className="w-4 h-4" />
                      <span>اختيار صورة أو ملف PDF</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setIsScanning(true);
                            try {
                              const result = await processAnyDocument(file);
                              
                              // Read data URL for preview
                              const reader = new FileReader();
                              reader.onload = () => {
                                setScanResult({
                                  docType: result.documentType || 'CIVIL_ID',
                                  extractedData: result,
                                  fileUrl: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            } catch (error: any) {
                              console.error("OCR Scan Error:", error);
                              toast.error(error.message || 'فشل نظام القراءة الضوئية. يرجى التأكد من وضوح الصورة.');
                              setScanResult(null);
                            } finally {
                              setIsScanning(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
