import React, { useState, useMemo, useEffect } from 'react';
import { useLang } from '../lib/i18n';
import { DocumentItem, Employee, Company } from '../types';
import { CompanyDocument, getDocumentStatus } from '../types/companyDocuments';
import { PageHeader } from '../components/ui/PageHeader';
import { StatStrip } from '../components/ui/StatStrip';
import { MaskedValue } from '../components/ui/MaskedValue';
import { CompanyDocumentsKanban } from '../components/CompanyDocumentsKanban';
import { exportToExcel } from '../utils/exportUtils';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DirectDocumentUploadModal } from '../components/documents/DirectDocumentUploadModal';
import { DocumentCompliancePrintModal } from '../components/documents/DocumentCompliancePrintModal';
import { collection, deleteDoc, deleteField, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { cleanFirestoreData, db } from '../lib/firebase';
import toast from 'react-hot-toast';
import {
  employeeMatchesSearchQuery,
  resolveEmployeeDisplayName,
} from '../utils/employeeDisplayName';
import { resolveTenantCompanyId } from '../utils/tenantCompanyId';
import {
  employeeDocumentTypeLabel,
  validityBadgeLabelFromEmployeeStatus,
} from '../utils/documentDisplayLabels';
import { contractQueryCompanyIds, normalizeTenantCompanyId } from '../utils/contractTenantRules';
import { useCompanyForPrint } from '../hooks/useCompanyForPrint';
import { syncTenantLicensesAndCompanyProfile } from '../services/companyLicenseSync';
import { 
  FolderOpen, FileText, Upload, Trash2, Search, X, CheckCircle2, 
  Scan, AlertTriangle, Download, BellRing, Shield, 
  LayoutGrid, List, FileSpreadsheet, Printer, Eye, Plus, Building2, 
  User, Clock, Filter, Sparkles
} from 'lucide-react';
import { UiStudioTarget } from '../components/studio/UiStudioTarget';
import { UI_KEYS } from '../utils/uiStudioKeys';

interface DocumentsAppProps {
  documents: DocumentItem[];
  employees: Employee[];
  activeCompany: Company;
  /** Firestore tenant id (URL / CompanyContext); must match `documents` query in App. */
  tenantCompanyId?: string;
  onSaveDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onAutoAddEmpFromOCR: (empData: any, docType?: string) => string | Promise<string>;
  isOCRModalOpenInitially?: boolean;
  onNavigateToApp?: (app: any) => void;
  onSelectEmpForForm?: (emp: Employee) => void;
  documentsUiIntent?: {
    workspaceTab?: 'EMPLOYEE_DOCS' | 'COMPANY_LICENSES';
    openAddLicense?: boolean;
    nonce: number;
  } | null;
  onDocumentsUiIntentConsumed?: () => void;
}

export const DocumentsApp: React.FC<DocumentsAppProps> = ({
  documents,
  employees,
  activeCompany,
  tenantCompanyId,
  onSaveDocument,
  onDeleteDocument,
  onAutoAddEmpFromOCR,
  isOCRModalOpenInitially = false,
  onNavigateToApp,
  onSelectEmpForForm,
  documentsUiIntent,
  onDocumentsUiIntentConsumed,
}) => {
  const { lang: uiLang, t } = useLang();
  const dir = uiLang === 'ar' ? 'rtl' : 'ltr';
  const resolvedCompanyId = resolveTenantCompanyId(tenantCompanyId, activeCompany?.id);
  const { company: companyForPrint } = useCompanyForPrint(resolvedCompanyId);

  // Main Workspace Tab (Employee Docs vs Company Licenses)
  const [workspaceTab, setWorkspaceTab] = useState<'EMPLOYEE_DOCS' | 'COMPANY_LICENSES'>('EMPLOYEE_DOCS');
  const [companyLicenseAddNonce, setCompanyLicenseAddNonce] = useState(0);

  useEffect(() => {
    if (!documentsUiIntent) return;
    if (documentsUiIntent.workspaceTab) setWorkspaceTab(documentsUiIntent.workspaceTab);
    if (documentsUiIntent.openAddLicense) {
      setCompanyLicenseAddNonce(documentsUiIntent.nonce);
    }
    onDocumentsUiIntentConsumed?.();
  }, [documentsUiIntent, onDocumentsUiIntentConsumed]);

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
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  useEffect(() => {
    if (isOCRModalOpenInitially) {
      onNavigateToApp?.('scanner');
    }
  }, [isOCRModalOpenInitially, onNavigateToApp]);

  const handleOpenScanner = () => {
    onNavigateToApp?.('scanner');
    toast('تم تحويلك إلى تطبيق الماسح الرسمي لإجراء OCR المؤسسي.', { icon: '🔎' });
  };

  // Company Licenses Storage
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>([]);

  useEffect(() => {
    if (!resolvedCompanyId) {
      setCompanyDocuments([]);
      return;
    }

    const companyIds = contractQueryCompanyIds(resolvedCompanyId);
    const documentsQuery =
      companyIds.length === 1
        ? query(collection(db, 'company_documents'), where('companyId', '==', companyIds[0]))
        : query(collection(db, 'company_documents'), where('companyId', 'in', companyIds));
    return onSnapshot(documentsQuery, snapshot => {
      setCompanyDocuments(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as CompanyDocument)));
    }, error => console.error('Failed to load company documents:', error));
  }, [resolvedCompanyId]);

  const handleSaveCompanyDoc = async (document: CompanyDocument) => {
    const { responsiblePerson: _legacy, ...rest } = document;
    const companyDocument: CompanyDocument = {
      ...rest,
      companyId: normalizeTenantCompanyId(
        resolvedCompanyId || activeCompany?.id || 'comp-super-admin'
      ),
    };
    const updated = companyDocuments.some(d => d.id === document.id)
      ? companyDocuments.map(d => d.id === document.id ? companyDocument : d)
      : [companyDocument, ...companyDocuments];
    setCompanyDocuments(updated);
    await setDoc(
      doc(db, 'company_documents', document.id),
      {
        ...cleanFirestoreData(companyDocument),
        responsiblePerson: deleteField(),
      },
      { merge: true }
    );

    const tenantId = companyDocument.companyId;
    if (tenantId) {
      try {
        await syncTenantLicensesAndCompanyProfile(tenantId, updated);
      } catch (err) {
        console.error('Failed to sync company print profile from licenses:', err);
        toast.error('تم حفظ الترخيص لكن تعذّر تحديث هوية المنشأة للطباعة');
      }
    }
  };

  const handleDeleteCompanyDoc = async (docId: string) => {
    const updated = companyDocuments.filter(d => d.id !== docId);
    setCompanyDocuments(updated);
    await deleteDoc(doc(db, 'company_documents', docId));
    const tenantId = resolvedCompanyId || activeCompany?.id;
    if (tenantId) {
      try {
        await syncTenantLicensesAndCompanyProfile(tenantId, updated);
      } catch (err) {
        console.error('Failed to sync company profile after license delete:', err);
      }
    }
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
      .filter(
        d =>
          !d.companyId ||
          !resolvedCompanyId ||
          d.companyId === resolvedCompanyId ||
          d.companyId === 'default'
      )
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
  }, [documents, resolvedCompanyId, employees]);

  // KPI Summary Metrics
  const metrics = useMemo(() => {
    const total = enrichedCompanyDocs.length;
    const active = enrichedCompanyDocs.filter(d => d.currentStatus === 'active').length;
    const nearExpiry = enrichedCompanyDocs.filter(d => d.currentStatus === 'near_expiry').length;
    const expired = enrichedCompanyDocs.filter(d => d.currentStatus === 'expired').length;
    return { total, active, nearExpiry, expired };
  }, [enrichedCompanyDocs]);

  const licenseMetrics = useMemo(() => {
    let active = 0;
    let nearExpiry = 0;
    let expired = 0;
    for (const item of companyDocuments) {
      const status = getDocumentStatus(item.expiryDate || '').status;
      if (status === 'expired') expired += 1;
      else if (status === 'expiring_soon') nearExpiry += 1;
      else active += 1;
    }
    return { total: companyDocuments.length, active, nearExpiry, expired };
  }, [companyDocuments]);

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return enrichedCompanyDocs.filter(doc => {
      // Folder filter
      if (activeFolder === 'IDS' && !['CIVIL_ID', 'PASSPORT', 'DRIVING_LICENSE'].includes(doc.category)) return false;
      if (activeFolder === 'RESIDENCY' && doc.category !== 'RESIDENCY') return false;
      if (activeFolder === 'CONTRACTS' && !['CONTRACT', 'WORK_CONTRACT'].includes(doc.category)) return false;
      if (activeFolder === 'MEDICAL' && doc.category !== 'MOH_LICENSE') return false;

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
        const matchesEmp = employeeMatchesSearchQuery(doc.employee as Record<string, unknown>, q);
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
      'اسم الموظف': resolveEmployeeDisplayName(doc.employee as Record<string, unknown>) || 'مستند عام',
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
    <div className="odoo-app-surface flex flex-col min-h-[calc(100vh-10rem)] bg-white rounded-xl overflow-hidden shadow-xs border border-slate-200 w-full" dir={dir} data-ui-surface="documents" data-master-layout="wide">
      
      <PageHeader
        title={t('documents')}
        subtitle={workspaceTab === 'EMPLOYEE_DOCS' ? 'مستندات الكادر' : 'تراخيص المنشأة'}
        primaryAction={
          workspaceTab === 'EMPLOYEE_DOCS'
            ? { label: 'رفع مستند', onClick: () => setShowUploadModal(true) }
            : { label: 'إضافة ترخيص', onClick: () => setCompanyLicenseAddNonce(Date.now()) }
        }
        menu={[
          { id: 'scan', label: 'مسح ضوئي', onSelect: handleOpenScanner },
          { id: 'excel', label: 'تصدير إكسل', onSelect: handleExportExcel },
          { id: 'print', label: 'طباعة', onSelect: () => setShowPrintModal(true) },
        ]}
      />
      <div className="flex overflow-x-auto border-b bg-white">
        {([
          ['EMPLOYEE_DOCS', 'مستندات الكادر'],
          ['COMPANY_LICENSES', 'تراخيص المنشأة'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkspaceTab(id)}
            className="px-4 py-2 text-xs font-bold"
            style={{
              color: workspaceTab === id ? 'var(--color-primary, #6b3f5e)' : '#64748b',
              borderBottom: workspaceTab === id ? '2px solid var(--color-primary, #6b3f5e)' : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <StatStrip
        items={[
          {
            id: 'total',
            label: workspaceTab === 'EMPLOYEE_DOCS' ? 'مستندات الكادر' : 'تراخيص المنشأة',
            value: (workspaceTab === 'EMPLOYEE_DOCS' ? metrics : licenseMetrics).total,
          },
          { id: 'active', label: 'سارية', value: (workspaceTab === 'EMPLOYEE_DOCS' ? metrics : licenseMetrics).active },
          { id: 'near', label: 'تنتهي قريباً', value: (workspaceTab === 'EMPLOYEE_DOCS' ? metrics : licenseMetrics).nearExpiry },
          { id: 'expired', label: 'منتهية', value: (workspaceTab === 'EMPLOYEE_DOCS' ? metrics : licenseMetrics).expired },
        ]}
        onSelect={(id) => {
          if (workspaceTab !== 'EMPLOYEE_DOCS') return;
          if (id === 'total') setStatusFilter('ALL');
          if (id === 'active') setStatusFilter('ACTIVE');
          if (id === 'near') setStatusFilter('NEAR_EXPIRY');
          if (id === 'expired') setStatusFilter('EXPIRED');
        }}
      />
      {/* 3. Main Body */}
      {workspaceTab === 'COMPANY_LICENSES' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          <CompanyDocumentsKanban 
            documents={companyDocuments}
            company={companyForPrint}
            onSaveDocument={handleSaveCompanyDoc} 
            onDeleteDocument={handleDeleteCompanyDoc}
            openAddRequestNonce={companyLicenseAddNonce || undefined}
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
                className="w-full bg-primary hover:bg-[#5a3a51] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>رفع وأرشفة مستند جديد</span>
              </button>
              <button 
                onClick={handleOpenScanner}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 px-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs transition cursor-pointer"
              >
                <Scan className="w-3.5 h-3.5 text-primary" />
                <span>مسح ضوئي ذكي (OCR)</span>
              </button>
            </div>

            {/* Folders List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              
              <section>
                <header className="font-bold text-slate-700 text-xs mb-2.5 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary"/> المجلدات والتصنيفات
                </header>
                <ul className="space-y-1 text-xs font-semibold">
                  <li 
                    onClick={() => setActiveFolder('ALL')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'ALL' ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>كافة الوثائق (All)</span>
                    <span className="font-mono text-[10px] opacity-80">{metrics.total}</span>
                  </li>
                  <li 
                    onClick={() => setActiveFolder('IDS')} 
                    className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between ${
                      activeFolder === 'IDS' ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
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
                      activeFolder === 'RESIDENCY' ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
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
                      activeFolder === 'CONTRACTS' ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
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
                      activeFolder === 'MEDICAL' ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>تراخيص الصحة ومزاولة المهنة</span>
                    <span className="font-mono text-[10px] opacity-80">
                      {enrichedCompanyDocs.filter(d => d.category === 'MOH_LICENSE').length}
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
                    className="w-full pl-8 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary focus:bg-white transition"
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
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-primary cursor-pointer"
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
                      viewMode === 'kanban' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="عرض البطاقات (Kanban)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
                  className="bg-primary hover:bg-[#5a3a51] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
              {(statusFilter === 'NEAR_EXPIRY' || statusFilter === 'EXPIRED') && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">أنشطة التجديد الإدارية المطلوبة</h4>
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
                <div className="odoo-kanban-grid">
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
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition"
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
                            className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-primary cursor-pointer transition"
                            title={doc.title}
                          >
                            {employeeDocumentTypeLabel(doc)}
                          </h4>

                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">
                              {doc.employee
                                ? resolveEmployeeDisplayName(doc.employee as Record<string, unknown>)
                                : 'مستند عام للمنشأة'}
                            </span>
                          </div>

                          {doc.documentNumber && (
                            <div className="text-[11px] text-slate-400 font-mono mt-1">
                              رقم: {doc.documentNumber}
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Expiry Badge & Date */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                          {doc.expiryDate ? (
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border ${badgeClass} shrink-0`}>
                              {validityBadgeLabelFromEmployeeStatus(doc.currentStatus)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 shrink-0">بدون انتهاء</span>
                          )}

                          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
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
                  <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">اسم المستند / الوثيقة</th>
                        <th className="p-3.5">الموظف المعني</th>
                        <th className="p-3.5 font-mono">الرقم المدني</th>
                        <th className="p-3.5">القسم</th>
                        <th className="p-3.5 font-mono">رقم الوثيقة</th>
                        <th className="p-3.5 text-center">السريان</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocs.map((doc, idx) => {
                        let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        const badgeText = validityBadgeLabelFromEmployeeStatus(doc.currentStatus);

                        if (doc.currentStatus === 'expired') {
                          badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                        } else if (doc.currentStatus === 'near_expiry') {
                          badgeColor = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
                        }

                        return (
                          <tr key={doc.id} className={`hover:bg-purple-50/30 transition ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span 
                                  onClick={() => setSelectedDocForPreview(doc)} 
                                  className="hover:text-primary cursor-pointer whitespace-nowrap"
                                  title={doc.title}
                                >
                                  {employeeDocumentTypeLabel(doc)}
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-700">
                              {doc.employee
                                ? resolveEmployeeDisplayName(doc.employee as Record<string, unknown>)
                                : 'مستند عام'}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              <MaskedValue value={doc.employee?.civilId} kind="civil" purpose="archive-list" />
                            </td>
                            <td className="p-3.5 text-slate-600">
                              {doc.employee?.department || '—'}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {doc.documentNumber || '—'}
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="font-mono font-bold text-slate-900">{doc.expiryDate || '—'}</div>
                              <div className="text-[10px] text-slate-500">
                                {doc.daysToExpiry === null
                                  ? '—'
                                  : doc.daysToExpiry > 0
                                    ? `${doc.daysToExpiry} يوم`
                                    : `${Math.abs(doc.daysToExpiry)} يوم`}
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] border ${badgeColor}`}>
                                {badgeText}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setSelectedDocForPreview(doc)}
                                  className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition"
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
                </div>
              )}

              {/* Empty state */}
              {filteredDocs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-30 text-primary" />
                  <h4 className="font-bold text-slate-700 text-base mb-1">لا توجد مستندات مطابقة في هذا المجلد</h4>
                  <p className="text-xs text-slate-400 mb-4">جرّب تغيير معايير البحث أو رفع مستند جديد عبر الزر المخصص</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-[#5a3a51] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
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
        companyId={resolvedCompanyId || activeCompany?.id || 'default'}
        onSaveDocument={onSaveDocument}
      />

      {/* Modal 3: Compliance Print Report (A4) */}
      <DocumentCompliancePrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        documents={filteredDocs}
        employees={employees}
        company={companyForPrint}
        filterTitle={
          statusFilter === 'NEAR_EXPIRY' || statusFilter === 'EXPIRED'
            ? 'الوثائق المطلوب تجديدها عاجلاً'
            : 'أرشيف الوثائق العام'
        }
      />

    </div>
  );
};
