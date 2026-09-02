import React, { useState } from 'react';
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
  FileCheck,
  FolderTree,
  ListFilter,
  Trash2
} from 'lucide-react';
import { useCompany } from '../context/CompanyContext';
import { OdooChatter, ChatterMessage } from './OdooChatter';
import { getExpiryStatus } from '../utils/expiryUtils';
import { OdooDocumentManager, DocumentFolder, DocumentAttachment } from './OdooDocumentManager';

interface CompanyDoc {
  id: string;
  docTitle: string;
  category: 'cr' | 'pifss' | 'paci' | 'moh' | 'fire' | 'lease';
  categoryLabel: string;
  issueDate: string;
  expiryDate: string;
  documentNumber: string;
  issuer: string;
  fileName: string;
  fileSize: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'expired';
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
    fileSize: '1.8 MB',
    daysRemaining: 251,
    status: 'valid'
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
    fileSize: '950 KB',
    daysRemaining: 20,
    status: 'expiring_soon'
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
    fileSize: '2.4 MB',
    daysRemaining: 122,
    status: 'valid'
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
    fileSize: '1.2 MB',
    daysRemaining: -16,
    status: 'expired'
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
    fileSize: '1.5 MB',
    daysRemaining: 62,
    status: 'valid'
  }
];

export const OdooCompanyDocsApp: React.FC = () => {
  const { activeCompany } = useCompany();
  const [docs, setDocs] = useState<CompanyDoc[]>(initialCompanyDocs);
  const [activeViewTab, setActiveViewTab] = useState<'folders' | 'table'>('folders');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const validCount = docs.filter(d => d.status === 'valid').length;
  const expiringCount = docs.filter(d => d.status === 'expiring_soon').length;
  const expiredCount = docs.filter(d => d.status === 'expired').length;

  const handleDeleteDoc = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوثيقة؟')) {
      setDocs(docs.filter(d => d.id !== id));
    }
  };

  const filteredDocs = docs.filter(d => selectedCategory === 'all' || d.category === selectedCategory);

  const companyScopeId = activeCompany?.id || 'main_company';
  const companyScopeName = activeCompany?.nameAr || 'الشركة والمنشأة الطبية';

  return (
    <div className="space-y-6 font-sans dir-rtl text-right text-slate-800" dir="rtl">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">مستندات وتراخيص المؤسسة (Odoo Documents)</h1>
            <p className="text-xs text-slate-500 font-medium">
              المنشأة: <strong className="text-[#714B67]">{companyScopeName}</strong> | تتبع صلاحيات التراخيص والعقود الحكومية
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveViewTab('folders')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'folders' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree size={14} />
            <span>نظام المجلدات المصنفة (Folders Engine)</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveViewTab('table')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeViewTab === 'table' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter size={14} />
            <span>جدول التراخيص وتواريخ الصلاحية</span>
          </button>
        </div>
      </div>

      {/* KPI Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>التراخيص السارية والمكتملة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{validCount} <span className="text-xs font-normal text-slate-500">مستندات</span></div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">مطابقة للاشتراطات الحكومية</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>تراخيص توشك على الانتهاء</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{expiringCount} <span className="text-xs font-normal text-slate-500">مستند</span></div>
          <div className="text-[10px] text-amber-700 mt-1 font-semibold">تنتهي خلال أقل من 30 يوماً</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
            <span>تراخيص منتهية تتطلب التجديد</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{expiredCount} <span className="text-xs font-normal text-slate-500">مستند</span></div>
          <div className="text-[10px] text-rose-700 mt-1 font-semibold">يلزم التجديد الفوري لتفادي المخالفات</div>
        </div>
      </div>

      {/* Main Content Area: Folders Engine or Table */}
      {activeViewTab === 'folders' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FolderTree size={18} className="text-[#714B67]" />
              مجلدات وثائق المنشأة والعيادة (Company & Clinic Folders)
            </h3>
            <span className="text-xs text-slate-400">Odoo Documents Architecture</span>
          </div>

          <OdooDocumentManager
            scope="company"
            scopeId={companyScopeId}
            scopeName={companyScopeName}
            initialFolders={[
              { id: `fold_comp_moh_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'moh_fire', name: 'تراخيص وزارة الصحة والمطافئ', color: 'red' },
              { id: `fold_comp_cr_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'cr_chamber', name: 'السجل التجاري والغرفة التجارية', color: 'blue' },
              { id: `fold_comp_lease_${companyScopeId}`, scope: 'company', scopeId: companyScopeId, category: 'lease_muni', name: 'عقود الإيجار والبلدية', color: 'green' }
            ]}
            initialAttachments={[
              {
                id: 'att_comp_moh_1',
                folderId: `fold_comp_moh_${companyScopeId}`,
                name: 'ترخيص_المنشأة_الطبية_MOH_107914.pdf',
                fileSize: '2.4 MB',
                fileType: 'pdf',
                uploadDate: '2026-02-15',
                uploadedBy: 'أحمد الكندري',
                expiryDate: '2026-12-31',
                documentNumber: 'MOH-CLINIC-107914'
              },
              {
                id: 'att_comp_fire_1',
                folderId: `fold_comp_moh_${companyScopeId}`,
                name: 'شهادة_مطافئ_الكويت_KFF.pdf',
                fileSize: '1.5 MB',
                fileType: 'pdf',
                uploadDate: '2025-11-01',
                uploadedBy: 'يوسف العلي',
                expiryDate: '2026-11-01',
                documentNumber: 'KFF-77312'
              },
              {
                id: 'att_comp_cr_1',
                folderId: `fold_comp_cr_${companyScopeId}`,
                name: 'السجل_التجاري_وزارة_التجارة_201934.pdf',
                fileSize: '1.8 MB',
                fileType: 'pdf',
                uploadDate: '2025-05-10',
                uploadedBy: 'محمد إبراهيم السيد',
                expiryDate: '2027-05-09',
                documentNumber: 'CR-KW-201934'
              },
              {
                id: 'att_comp_lease_1',
                folderId: `fold_comp_lease_${companyScopeId}`,
                name: 'عقد_إيجار_مقر_العيادة_برج_الأطباء.pdf',
                fileSize: '3.1 MB',
                fileType: 'pdf',
                uploadDate: '2025-01-01',
                uploadedBy: 'أحمد الكندري',
                expiryDate: '2027-12-31',
                documentNumber: 'LEASE-BLDG-992'
              }
            ]}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'جميع الوثائق' },
              { id: 'cr', label: 'السجل والتجارة' },
              { id: 'pifss', label: 'الشؤون والتأمينات' },
              { id: 'moh', label: 'تراخيص وزارة الصحة' },
              { id: 'fire', label: 'الإطفاء والسلامة' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedCategory(t.id)}
                className={`px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === t.id ? 'bg-white text-[#714B67] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Documents Grid / Table View */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">اسم المستند والترخيص</th>
                  <th className="p-3.5">الجهة المصدرة</th>
                  <th className="p-3.5">رقم الترخيص / السجل</th>
                  <th className="p-3.5">تاريخ الانتهاء</th>
                  <th className="p-3.5">المدة المتبقية</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <FileText size={16} className="text-[#714B67]" />
                        {doc.docTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.fileName} ({doc.fileSize})</div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{doc.issuer}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{doc.documentNumber}</td>
                    <td className="p-3.5 font-mono text-slate-700">{doc.expiryDate}</td>
                    <td className="p-3.5">
                      {doc.daysRemaining > 0 ? (
                        <span className="font-mono font-bold text-slate-800">{doc.daysRemaining} يوماً</span>
                      ) : (
                        <span className="font-mono font-bold text-rose-600">منتهي منذ {Math.abs(doc.daysRemaining)} يوم</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {doc.status === 'valid' && (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> سارٍ وموثق
                        </span>
                      )}
                      {doc.status === 'expiring_soon' && (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock size={11} /> يلزم التجديد
                        </span>
                      )}
                      {doc.status === 'expired' && (
                        <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle size={11} /> منتهي الصلاحية
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button type="button" className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer" title="معاينة الملف">
                          <Eye size={14} />
                        </button>
                        <button type="button" className="p-1.5 bg-purple-50 hover:bg-purple-100 text-[#714B67] rounded-lg transition cursor-pointer" title="تحميل الملف">
                          <Download size={14} />
                        </button>
                        <button type="button" onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer" title="حذف الملف">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Chatter & Automated Activity Schedule Engine */}
      <div className="mt-8">
        {(() => {
          const autoMessages: ChatterMessage[] = [];

          docs.forEach((doc) => {
            const exp = getExpiryStatus(doc.expiryDate);
            if (exp && exp.days <= 60) {
              const isMoh = doc.category === 'moh';
              autoMessages.push({
                id: `auto-doc-${doc.id}`,
                author: 'محرك تنبيهات الوثائق والتراخيص',
                date: new Date().toLocaleDateString('ar-KW'),
                content: `تنبيه: مستند (${doc.docTitle}) الصادر من (${doc.issuer}) ينتهي في تاريخ ${doc.expiryDate}. يرجى اتخاذ إجراءات التجديد قبل توقيع الغرامات أو إيقاف الملف.`,
                type: 'activity',
                activityDetails: {
                  type: isMoh ? '🩺 تجديد ترخيص طبي (MOH License)' : '📅 تجديد مستند (Document Renewal)',
                  assignee: isMoh ? 'أحمد الكندري' : 'يوسف العلي',
                  dueDate: doc.expiryDate,
                  status: exp.status,
                  statusText: exp.text
                }
              });
            }
          });

          return (
            <OdooChatter
              recordId={`company_docs_${activeCompany?.id || 'main'}`}
              model="res.company.document"
              followers={[
                { id: '1', name: 'أحمد الكندري (مدير الموارد البشرية)' },
                { id: '2', name: 'يوسف العلي (مسؤول الجوازات والإقامات)' },
                { id: '3', name: 'محمد إبراهيم السيد (شؤون العاملين)' }
              ]}
              messages={autoMessages}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default OdooCompanyDocsApp;

