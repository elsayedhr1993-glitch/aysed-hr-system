import React, { useState, useMemo } from 'react';
import { DocumentItem, Employee, Company } from '../types';
import { 
  Scan, Upload, FileText, Search, Trash2, Download, CheckCircle2, 
  FolderOpen, Calendar, Shield, Sparkles, Filter, Eye, Plus, ArrowRight
} from 'lucide-react';
import { processAnyDocument } from '../utils/ocrService';
import toast from 'react-hot-toast';

interface ScannerAppProps {
  documents: DocumentItem[];
  employees: Employee[];
  activeCompany: Company;
  onSaveDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (docId: string) => void;
  onAutoAddEmpFromOCR: (empData: any, docType?: string) => string;
  onNavigateToApp?: (app: any) => void;
}

export const ScannerApp: React.FC<ScannerAppProps> = ({
  documents,
  employees,
  activeCompany,
  onSaveDocument,
  onDeleteDocument,
  onAutoAddEmpFromOCR,
  onNavigateToApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  
  // Scanner Modal state
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('CIVIL_ID');

  // Filter documents strictly for active company and zero mock data if none exist
  const companyDocuments = useMemo(() => {
    return (documents || []).filter(d => d.companyId === activeCompany?.id);
  }, [documents, activeCompany]);

  const filteredDocuments = useMemo(() => {
    return companyDocuments.filter(doc => {
      if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const emp = employees.find(e => e.id === doc.employeeId);
      return doc.title?.toLowerCase().includes(q) || emp?.fullNameAr?.toLowerCase().includes(q);
    });
  }, [companyDocuments, selectedCategory, searchTerm, employees]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsScanning(true);
      try {
        const result = await processAnyDocument(file, undefined, selectedDocType);
        setScanResult({
          docType: selectedDocType || result.documentType || 'CIVIL_ID',
          extractedData: result,
          fileName: file.name
        });
        toast.success('تم مسح وتحليل المستند بنجاح عبر الماسح الذكي');
      } catch (error: any) {
        console.error("Scanner OCR Error:", error);
        toast.error(error.message || 'فشل تحليل الوثيقة. يرجى التأكد من وضوح الصورة.');
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200 dir-rtl" dir="rtl">
      
      {/* Odoo Enterprise Control Panel Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#714B67]/10 text-[#714B67] rounded-xl">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-950">الماسح الضوئي الذكي (Odoo Document Scanner)</h1>
              <span className="text-[10px] bg-[#714B67]/10 text-[#714B67] font-bold px-2 py-0.5 rounded-full">Odoo 18 OCR</span>
            </div>
            <p className="text-xs text-slate-500">مسح الأوراق، استخراج البيانات بالذكاء الاصطناعي، والأرشفة الفورية لمنشأة: {activeCompany?.nameAr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'KANBAN' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              عرض البطاقات (Kanban)
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'LIST' ? 'bg-[#714B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              عرض القائمة (List)
            </button>
          </div>

          <button 
            onClick={() => {
              setScanResult(null);
              setIsScannerModalOpen(true);
            }}
            className="bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition text-sm"
          >
            <Plus className="w-4 h-4" /> مسح ضوئي جديد (New Scan)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Filters */}
        <div className="w-64 bg-white border-l border-slate-200 p-4 shrink-0 overflow-y-auto hidden md:block">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">تصنيفات المستندات</h3>
          <ul className="space-y-1 text-sm font-medium">
            <li>
              <button 
                onClick={() => setSelectedCategory('ALL')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'ALL' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>جميع المستندات</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('CIVIL_ID')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'CIVIL_ID' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>البطاقات المدنية (Civil IDs)</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'CIVIL_ID').length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('PASSPORT')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'PASSPORT' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>جوازات السفر (Passports)</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'PASSPORT').length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('DRIVING_LICENSE')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'DRIVING_LICENSE' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>رخص القيادة (Driving Licenses)</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'DRIVING_LICENSE').length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('PROFESSIONAL_LICENSE')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'PROFESSIONAL_LICENSE' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>التراخيص المهنية/الطبية</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'PROFESSIONAL_LICENSE').length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('RESIDENCY')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'RESIDENCY' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>الإقامات وتراخيص العمل</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'RESIDENCY').length}</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSelectedCategory('CONTRACT')}
                className={`w-full text-right px-3 py-2 rounded-lg transition flex items-center justify-between ${selectedCategory === 'CONTRACT' ? 'bg-[#714B67]/10 text-[#714B67] font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <span>عقود العمل الرسمية</span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">{companyDocuments.filter(d => d.category === 'CONTRACT' || d.category === 'WORK_CONTRACT').length}</span>
              </button>
            </li>
          </ul>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#714B67]" />
              <span>محرك OCR المعتمد</span>
            </div>
            <p className="text-purple-700 leading-relaxed">
              يقوم الماسح الضوئي باستخراج البيانات بدقة عالية وإنشاء سجلات الموظفين والتواريخ تلقائياً.
            </p>
          </div>
        </div>

        {/* Documents Grid / List */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <input 
                type="text" 
                placeholder="بحث في المستندات أو أسماء الموظفين..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#714B67] transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <div className="text-xs font-bold text-slate-500">
              عدد المستندات المؤرشفة: <span className="text-[#714B67]">{filteredDocuments.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {viewMode === 'KANBAN' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => {
                  const emp = employees.find(e => e.id === doc.employeeId);
                  return (
                    <div key={doc.id} className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="p-2 bg-slate-100 text-[#714B67] rounded-lg">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                            {doc.category || 'مستند'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{doc.title}</h4>
                        <p className="text-xs text-slate-500 mb-3">{emp ? emp.fullNameAr : 'مستند منشأة عام'}</p>
                        
                        {doc.expiryDate && (
                          <div className="text-xs bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between text-slate-600 mb-4">
                            <span>تاريخ الانتهاء:</span>
                            <span className="font-mono font-bold text-slate-800">{doc.expiryDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            if (doc.fileUrl && doc.fileUrl !== '#') {
                              window.open(doc.fileUrl, '_blank');
                            } else {
                              toast.error('الملف غير متوفر للعرض المباشر');
                            }
                          }}
                          className="text-xs text-[#714B67] hover:underline font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> عرض المستند
                        </button>
                        <button 
                          onClick={() => onDeleteDocument(doc.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-xs">
                    <tr>
                      <th className="p-3">عنوان المستند</th>
                      <th className="p-3">الموظف / الجهة</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">تاريخ الانتهاء</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map(doc => {
                      const emp = employees.find(e => e.id === doc.employeeId);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">{doc.title}</td>
                          <td className="p-3 text-slate-600">{emp ? emp.fullNameAr : 'مستند عام'}</td>
                          <td className="p-3">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                              {doc.category}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs text-slate-600">{doc.expiryDate || 'غير محدد'}</td>
                          <td className="p-3 text-center flex items-center justify-center gap-2">
                            <button 
                              onClick={() => {
                                if (doc.fileUrl && doc.fileUrl !== '#') window.open(doc.fileUrl, '_blank');
                                else toast.error('الملف غير متوفر');
                              }}
                              className="p-1.5 text-slate-600 hover:text-[#714B67] hover:bg-slate-100 rounded transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-40 text-[#714B67]" />
                <h4 className="font-bold text-slate-700 text-lg mb-1">لا توجد مستندات مسجلة</h4>
                <p className="text-sm text-slate-500 mb-6">ابدأ بالضغط على زر "مسح ضوئي جديد" لأرشفة أول مستند في هذه المنشأة.</p>
                <button 
                  onClick={() => setIsScannerModalOpen(true)}
                  className="bg-[#714B67] text-white font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-[#5a3a51] transition shadow-sm"
                >
                  فتح الماسح الضوئي الذكي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Scan / OCR Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#714B67]" />
                الماسح الضوئي الذكي وتحليل OCR
              </h3>
              <button 
                onClick={() => setIsScannerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              {isScanning ? (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="font-bold text-slate-700 animate-pulse text-sm">جاري قراءة وتحليل المستند بالذكاء الاصطناعي (OCR)...</p>
                </div>
              ) : scanResult ? (
                <div className="w-full space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-900 text-base mb-1">تم قراءة المستند بنجاح!</h4>
                      <div className="text-xs text-emerald-700 space-y-1 font-mono">
                        <p>نوع المستند: {scanResult.docType}</p>
                        <p>الاسم المستخرج: {scanResult.extractedData.fullNameAr || 'مستند معتمد'}</p>
                        <p>الرقم المدني / المعرّف: {scanResult.extractedData.civilId || 'غير متوفر'}</p>
                        <p>تاريخ الانتهاء: {scanResult.extractedData.expiryDate || '2027-01-01'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        const newEmpId = onAutoAddEmpFromOCR(scanResult.extractedData, scanResult.docType);
                        onSaveDocument({
                          id: `doc-${Date.now()}`,
                          companyId: activeCompany?.id || '',
                          employeeId: newEmpId,
                          title: `${scanResult.docType} - ${scanResult.extractedData.fullNameAr || scanResult.fileName}`,
                          category: scanResult.docType || 'CIVIL_ID',
                          fileUrl: 'https://storage.googleapis.com/simulated-upload/document.pdf',
                          expiryDate: scanResult.extractedData.expiryDate || '2027-01-01',
                          status: 'active'
                        });
                        toast.success('تم أرشفة المستند وإنشاء السجل بنجاح');
                        setIsScannerModalOpen(false);
                      }}
                      className="flex-1 bg-[#714B67] text-white font-bold py-3 rounded-lg hover:bg-[#5a3a51] transition shadow-sm text-sm"
                    >
                      تأكيد وحفظ في أرشيف المنشأة
                    </button>
                    <button
                      onClick={() => setScanResult(null)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-sm"
                    >
                      إعادة المسح
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر نوع المستند المراد مسحه (Document Type):</label>
                    <select 
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium outline-none focus:border-[#714B67]"
                    >
                      <option value="CIVIL_ID">البطاقة المدنية (Civil ID)</option>
                      <option value="PASSPORT">جواز السفر (Passport)</option>
                      <option value="DRIVING_LICENSE">رخصة القيادة (Driving License)</option>
                      <option value="PROFESSIONAL_LICENSE">الترخيص المهني أو الطبي (Professional License)</option>
                      <option value="RESIDENCY">إقامة العمل (Residency Permit)</option>
                      <option value="CONTRACT">عقد العمل الرسمي (Employment Contract)</option>
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xs mx-auto mb-3 border border-purple-100">
                      <Upload className="w-8 h-8 text-[#714B67]" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">ارفع صورة المستند أو ملف PDF</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      سيقوم الذكاء الاصطناعي باستخراج الأرقام وتواريخ الانتهاء وترحيلها لملف الموظف تلقائياً.
                    </p>
                    <label className="bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 px-6 rounded-lg cursor-pointer transition shadow-sm inline-block text-xs">
                      <span>اختيار الملف من الجهاز</span>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
