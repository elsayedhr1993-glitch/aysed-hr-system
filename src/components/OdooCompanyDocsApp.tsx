import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  FileText, 
  UploadCloud, 
  Download, 
  Eye, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  PlusCircle,
  FolderTree,
  ListFilter,
  Trash2,
  LayoutGrid,
  Search,
  X,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { OdooChatter, ChatterMessage } from './OdooChatter';
import { OdooDocumentManager } from './OdooDocumentManager';
import { getPersistentData, setPersistentData } from '../utils/persistentStorage';
import { toast } from 'react-hot-toast';

interface CompanyDoc {
  id: string;
  docTitle: string;
  category: 'cr' | 'pifss' | 'moh' | 'fire' | 'lease';
  categoryLabel: string;
  issueDate: string;
  expiryDate: string;
  documentNumber: string;
  issuer: string;
  fileName: string;
  fileSize: string;
}

const initialCompanyDocs: CompanyDoc[] = [
  {
    id: 'DOC-CR-01',
    docTitle: 'السجل التجاري الرئيسي (وزارة التجارة)',
    category: 'cr',
    categoryLabel: 'السجل التجاري',
    documentNumber: '201934',
    issuer: 'وزارة التجارة والصناعة',
    issueDate: '2023-05-10',
    expiryDate: '2027-05-09',
    fileName: 'commercial_register_2027.pdf',
    fileSize: '1.8 MB'
  },
  {
    id: 'DOC-PAM-02',
    docTitle: 'شهادة اعتماد التوقيع (القوى العاملة)',
    category: 'pifss',
    categoryLabel: 'الشؤون والعمل',
    documentNumber: 'PAM-KW-8849',
    issuer: 'الهيئة العامة للقوى العاملة',
    issueDate: '2025-09-01',
    expiryDate: '2026-09-20',
    fileName: 'authorized_signatory_pam.pdf',
    fileSize: '950 KB'
  },
  {
    id: 'DOC-MOH-03',
    docTitle: 'ترخيص المنشأة الطبية (وزارة الصحة)',
    category: 'moh',
    categoryLabel: 'تراخيص الصحة',
    documentNumber: '107914',
    issuer: 'وزارة الصحة - إدارة التراخيص الصحية',
    issueDate: '2024-02-15',
    expiryDate: '2026-12-31',
    fileName: 'moh_medical_license.pdf',
    fileSize: '2.4 MB'
  },
  {
    id: 'DOC-RAD-04',
    docTitle: 'ترخيص أجهزة الليزر والمعدات المشعة',
    category: 'moh',
    categoryLabel: 'الوقاية من الإشعاع',
    documentNumber: 'RAD-2026-X8',
    issuer: 'إدارة الوقاية من الإشعاع - MOH',
    issueDate: '2025-08-01',
    expiryDate: '2026-08-15',
    fileName: 'laser_radiation_permit.pdf',
    fileSize: '1.2 MB'
  },
  {
    id: 'DOC-FIRE-05',
    docTitle: 'رخصة الإطفاء والسلامة المهنية',
    category: 'fire',
    categoryLabel: 'قوة الإطفاء العام',
    documentNumber: 'KFF-77312',
    issuer: 'قوة الإطفاء العام الكويتية',
    issueDate: '2025-11-01',
    expiryDate: '2026-11-01',
    fileName: 'fire_safety_cert.pdf',
    fileSize: '1.5 MB'
  }
];

export const OdooCompanyDocsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [docs, setDocs] = useState<CompanyDoc[]>(() => 
    getPersistentData<CompanyDoc[]>('manara_odoo_company_docs_v2', [])
  );

  useEffect(() => {
    setPersistentData('manara_odoo_company_docs_v2', docs);
  }, [docs]);

  const [activeViewTab, setActiveViewTab] = useState<'kanban' | 'table' | 'folders'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<CompanyDoc>>({
    docTitle: '', category: 'cr', issuer: '', documentNumber: '', issueDate: '', expiryDate: ''
  });
  const [selectedAttachment, setSelectedAttachment] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الملف يتجاوز 10 ميجابايت');
      return;
    }
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeMb} MB`;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedAttachment({
        name: file.name,
        size: sizeStr,
        dataUrl: e.target?.result as string
      });
      toast.success(`تم اختيار المرفق: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const getDocStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(expiryDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', days: diffDays, text: 'منتهي الصلاحية', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (diffDays <= 90) return { status: 'warning', days: diffDays, text: 'يحتاج تجديد قريباً', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { status: 'valid', days: diffDays, text: 'ساري وموثق', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const enrichedDocs = docs.map(doc => ({
    ...doc,
    ...getDocStatus(doc.expiryDate)
  }));

  const validCount = enrichedDocs.filter(d => d.status === 'valid').length;
  const expiringCount = enrichedDocs.filter(d => d.status === 'warning').length;
  const expiredCount = enrichedDocs.filter(d => d.status === 'expired').length;

  const filteredDocs = enrichedDocs.filter(d => 
    d.docTitle.includes(searchQuery) || 
    d.issuer.includes(searchQuery) || 
    d.documentNumber.includes(searchQuery)
  );

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newDoc.docTitle || !newDoc.expiryDate) {
      toast.error('يرجى تعبئة الحقول الأساسية (الاسم وتاريخ الانتهاء)');
      return;
    }
    
    const categoryLabels = {
      cr: 'السجل التجاري',
      pifss: 'الشؤون والعمل',
      moh: 'تراخيص الصحة',
      fire: 'قوة الإطفاء العام',
      lease: 'عقود وإيجارات'
    };

    const addedDoc: CompanyDoc = {
      id: `DOC-NEW-${Date.now()}`,
      docTitle: newDoc.docTitle!,
      category: newDoc.category as any,
      categoryLabel: categoryLabels[newDoc.category as keyof typeof categoryLabels],
      issuer: newDoc.issuer || 'جهة حكومية',
      documentNumber: newDoc.documentNumber || '---',
      issueDate: newDoc.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: newDoc.expiryDate!,
      fileName: selectedAttachment?.name || 'document_attachment.pdf',
      fileSize: selectedAttachment?.size || '1.0 MB'
    };
    
    setDocs([addedDoc, ...docs]);
    setShowAddModal(false);
    setSelectedAttachment(null);
    setNewDoc({docTitle: '', category: 'cr', issuer: '', documentNumber: '', issueDate: '', expiryDate: ''});
    toast.success('تمت إضافة المستند والمرفق للأرشيف بنجاح');
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوثيقة من الأرشيف؟')) {
      setDocs(docs.filter(d => d.id !== id));
      toast.success('تم حذف الوثيقة بنجاح');
    }
  };

  const companyScopeId = activeCompany?.id || 'main_company';
  const companyScopeName = activeCompany?.nameAr || 'الشركة والمنشأة الطبية';

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800 animate-fade-in" dir="rtl">
      
      {/* Header & View Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">أرشيف المستندات والتراخيص (Documents)</h1>
            <p className="text-xs text-slate-500 font-medium">
              المنشأة: <strong className="text-[#714B67]">{companyScopeName}</strong> | نظام متابعة التراخيص وتنبيهات الانتهاء
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="بحث في الأرشيف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#714B67]"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveViewTab('kanban')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${activeViewTab === 'kanban' ? 'bg-white text-[#714B67] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} /> كروت التنبيهات
            </button>
            <button
              onClick={() => setActiveViewTab('table')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${activeViewTab === 'table' ? 'bg-white text-[#714B67] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ListFilter size={14} /> قائمة
            </button>
            <button
              onClick={() => setActiveViewTab('folders')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-1 justify-center ${activeViewTab === 'folders' ? 'bg-white text-[#714B67] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FolderTree size={14} /> مجلدات
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#714B67] hover:bg-[#5a3c52] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 w-full sm:w-auto justify-center shadow-md"
          >
            <PlusCircle size={16} /> أرشفة مستند
          </button>
        </div>
      </div>

      {/* KPI Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-bold mb-1">ساري وموثق</div>
            <div className="text-2xl font-black text-slate-800">{validCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-bold mb-1">ينتهي خلال 90 يوماً</div>
            <div className="text-2xl font-black text-slate-800">{expiringCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center animate-pulse">
            <Clock size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-rose-500 border-y border-r border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-bold mb-1">منتهي الصلاحية</div>
            <div className="text-2xl font-black text-rose-600">{expiredCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Main Views */}
      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-[#714B67]/10 text-[#714B67] rounded-2xl flex items-center justify-center mx-auto">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">أرشيف المستندات فارغ تماماً</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            يبدأ الأرشيف بنظافة تامة على نمط Odoo المحترف. يمكنك البدء بأرشفة تراخيص ومستندات شركتك الرسمية مباشرة.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#714B67] hover:bg-[#5a3c52] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={16} /> أرشفة مستند جديد
            </button>
          </div>
        </div>
      ) : activeViewTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group cursor-pointer relative">
              {/* Top Banner Status */}
              <div className={`h-1.5 w-full ${doc.status === 'valid' ? 'bg-emerald-500' : doc.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
              
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">{doc.categoryLabel}</span>
                  </div>
                  <button onClick={() => handleDeleteDoc(doc.id)} className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-black text-slate-900 text-base mb-1 line-clamp-2 leading-snug group-hover:text-[#714B67] transition">
                  {doc.docTitle}
                </h3>
                <div className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                  <Building2 size={13} /> {doc.issuer}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-5 border-y border-slate-100 py-3">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-0.5">رقم المستند</div>
                    <div className="font-mono text-xs font-bold text-slate-800">{doc.documentNumber}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold mb-0.5">تاريخ الانتهاء</div>
                    <div className="font-mono text-xs font-bold text-slate-800">{doc.expiryDate}</div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${doc.color}`}>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {doc.status === 'valid' ? <CheckCircle2 size={14} /> : doc.status === 'warning' ? <Clock size={14} /> : <AlertTriangle size={14} />}
                    {doc.text}
                  </span>
                  <span className="font-black text-sm font-mono" dir="ltr">
                    {doc.days > 0 ? `${doc.days} Days` : doc.status === 'expired' ? 'Expired' : 'Today'}
                  </span>
                </div>
              </div>
              
              {/* Bottom Actions */}
              <div className="bg-slate-50 p-3 flex justify-between items-center border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1"><FileText size={12}/> {doc.fileName}</span>
                <div className="flex gap-2">
                  <button className="text-slate-500 hover:text-[#714B67] cursor-pointer"><Eye size={16} /></button>
                  <button className="text-slate-500 hover:text-[#714B67] cursor-pointer"><Download size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              <FileCheck size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="font-bold">لا توجد مستندات مطابقة للبحث</p>
            </div>
          )}
        </div>
      )}

      {activeViewTab === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم المستند والجهة</th>
                  <th className="p-4">رقم الترخيص</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">مؤشر الصلاحية</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{doc.docTitle}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{doc.issuer}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">{doc.documentNumber}</td>
                    <td className="p-4 font-mono text-slate-700">{doc.expiryDate}</td>
                    <td className="p-4">
                      <div className={`px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1.5 font-bold ${doc.color}`}>
                        {doc.status === 'valid' ? <CheckCircle2 size={12} /> : doc.status === 'warning' ? <Clock size={12} /> : <AlertTriangle size={12} />}
                        <span className="font-mono text-[10px]">{Math.abs(doc.days)} {doc.days < 0 ? 'أيام منتهية' : 'يوم متبقي'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"><Eye size={14} /></button>
                        <button className="p-1.5 bg-purple-50 hover:bg-purple-100 text-[#714B67] rounded-lg cursor-pointer"><Download size={14} /></button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeViewTab === 'folders' && (
        <div className="space-y-4">
          <OdooDocumentManager
            scope="company"
            scopeId={companyScopeId}
            scopeName={companyScopeName}
            initialFolders={[
              { id: `fold_comp_moh_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'moh_fire', name: 'تراخيص وزارة الصحة والمطافئ', color: 'red' },
              { id: `fold_comp_cr_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'cr_chamber', name: 'السجل التجاري والغرفة التجارية', color: 'blue' },
              { id: `fold_comp_lease_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'lease_muni', name: 'عقود الإيجار والبلدية', color: 'green' }
            ]}
            initialAttachments={[]}
          />
        </div>
      )}

      {/* Chatter & Automated Alerts Engine */}
      <div className="mt-8">
        {(() => {
          const autoMessages: ChatterMessage[] = enrichedDocs
            .filter(d => d.status === 'warning' || d.status === 'expired')
            .map(doc => ({
              id: `auto-doc-${doc.id}`,
              author: 'محرك تنبيهات الوثائق والتراخيص',
              date: new Date().toLocaleDateString('ar-KW'),
              content: `تنبيه: مستند (${doc.docTitle}) الصادر من (${doc.issuer}) ${doc.status === 'expired' ? 'منتهي الصلاحية!' : 'يوشك على الانتهاء'}. يرجى اتخاذ الإجراءات لتفادي الغرامات.`,
              type: 'activity',
              activityDetails: {
                type: '📅 تجديد مستند',
                assignee: 'مسؤول الشؤون الإدارية',
                dueDate: doc.expiryDate,
                status: doc.status === 'expired' ? 'red' : 'yellow',
                statusText: doc.text
              }
            }));

          return (
            <OdooChatter
              recordId={`company_docs_${companyScopeId}`}
              model="res.company.document"
              followers={[
                { id: '1', name: 'مدير الموارد البشرية' },
                { id: '2', name: 'الممثل القانوني للشركة' }
              ]}
              messages={autoMessages}
            />
          );
        })()}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto pt-16 pb-8 animate-fade-in" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] my-auto border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="font-black text-slate-800 flex items-center gap-2">
                <UploadCloud className="text-[#714B67]" size={20} /> أرشفة مستند جديد
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedAttachment(null);
                }} 
                className="text-slate-400 hover:text-rose-500 transition p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان المستند / الترخيص <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={newDoc.docTitle} 
                  onChange={e => setNewDoc({...newDoc, docTitle: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#714B67] bg-white font-bold"
                  placeholder="مثال: رخصة البلدية للمقر الرئيسي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">التصنيف</label>
                  <select 
                    value={newDoc.category} 
                    onChange={e => setNewDoc({...newDoc, category: e.target.value as any})}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#714B67] bg-white cursor-pointer"
                  >
                    <option value="cr">السجل والتجارة</option>
                    <option value="pifss">الشؤون والعمل</option>
                    <option value="moh">تراخيص الصحة</option>
                    <option value="fire">قوة الإطفاء العام</option>
                    <option value="lease">عقود الإيجار والبلدية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">الجهة المصدرة</label>
                  <input 
                    type="text" 
                    value={newDoc.issuer} 
                    onChange={e => setNewDoc({...newDoc, issuer: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#714B67] bg-white"
                    placeholder="مثال: بلدية الكويت"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم المستند / السجل</label>
                <input 
                  type="text" 
                  value={newDoc.documentNumber} 
                  onChange={e => setNewDoc({...newDoc, documentNumber: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-[#714B67] bg-white"
                  placeholder="XXXX-YYYY"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الإصدار</label>
                  <input 
                    type="date" 
                    value={newDoc.issueDate} 
                    onChange={e => setNewDoc({...newDoc, issueDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-[#714B67] bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الانتهاء <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={newDoc.expiryDate} 
                    onChange={e => setNewDoc({...newDoc, expiryDate: e.target.value})}
                    className="w-full p-2.5 border border-rose-300 rounded-xl text-sm font-mono outline-none focus:border-rose-500 bg-rose-50 cursor-pointer"
                  />
                </div>
              </div>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" 
                className="hidden" 
              />

              {/* Dropzone & File Preview */}
              {selectedAttachment ? (
                <div className="mt-4 p-4 border border-emerald-300 rounded-xl bg-emerald-50/80 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileCheck size={20} />
                    </div>
                    <div className="truncate text-right">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedAttachment.name}</p>
                      <p className="text-[10px] font-semibold text-emerald-700">{selectedAttachment.size} • تم إرفاق الملف بنجاح</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAttachment(null)}
                    className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-100 rounded-lg transition shrink-0 cursor-pointer"
                    title="حذف المرفق"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`mt-4 p-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition select-none ${
                    isDragging 
                      ? 'border-[#714B67] bg-[#714B67]/10' 
                      : 'border-slate-300 hover:border-[#714B67] bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <UploadCloud className={`${isDragging ? 'text-[#714B67]' : 'text-slate-400'} mb-2`} size={36} />
                  <span className="text-sm font-bold text-slate-700">اضغط لرفع المرفقات أو اسحب الملف هنا</span>
                  <span className="text-[10px] text-slate-500 mt-1">يدعم PDF, JPG, PNG, DOCX بحجم أقصى 10MB</span>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedAttachment(null);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                إلغاء
              </button>
              <button 
                type="button"
                onClick={handleAddDocument}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#714B67] text-white hover:bg-[#5a3c52] shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> حفظ وأرشفة المستند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdooCompanyDocsApp;
