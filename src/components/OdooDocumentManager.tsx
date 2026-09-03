import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  ChevronRight, 
  Calendar, 
  User, 
  HardDrive, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X,
  FileCheck,
  Search,
  Palette,
  Edit2
} from 'lucide-react';
import { getExpiryStatus } from '../utils/expiryUtils';
import { ODOO_PALETTE, ODOO_COLOR_KEYS, OdooColorKey } from '../utils/odooPalette';

export interface DocumentAttachment {
  id: string;
  folderId: string;
  name: string;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc';
  uploadDate: string;
  uploadedBy: string;
  expiryDate?: string;
  documentNumber?: string;
  previewUrl?: string;
}

export interface DocumentFolder {
  id: string;
  scope: 'employee' | 'company';
  scopeId: string; // employeeId or companyId
  category: string; // e.g. 'work_permits', 'medical_licenses', 'company_docs'
  name: string;
  nameEn?: string;
  color?: OdooColorKey | string;
  icon?: string;
}

interface OdooDocumentManagerProps {
  scope: 'employee' | 'company';
  scopeId: string;
  scopeName: string;
  initialFolders: DocumentFolder[];
  initialAttachments?: DocumentAttachment[];
  onAttachmentChange?: (attachments: DocumentAttachment[]) => void;
}

export const OdooDocumentManager: React.FC<OdooDocumentManagerProps> = ({
  scope,
  scopeId,
  scopeName,
  initialFolders,
  initialAttachments = [],
  onAttachmentChange
}) => {
  const storageKey = `odoo_docs_${scope}_${scopeId}`;

  // Load from local storage or initial
  const [folders, setFolders] = useState<DocumentFolder[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_folders`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialFolders;
  });

  const [attachments, setAttachments] = useState<DocumentAttachment[]>(() => {
    const saved = localStorage.getItem(`${storageKey}_files`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return initialAttachments;
  });

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<OdooColorKey>('blue');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string>(
    activeFolderId || (folders[0]?.id || '')
  );
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'image' | 'doc'>('pdf');
  const [uploadExpiryDate, setUploadExpiryDate] = useState('');
  const [uploadDocNo, setUploadDocNo] = useState('');
  const [uploadUploader, setUploadUploader] = useState('المسؤول المعتمد');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentAttachment | null>(null);

  // Sync to localStorage
  const saveState = (newFolders: DocumentFolder[], newAttachments: DocumentAttachment[]) => {
    setFolders(newFolders);
    setAttachments(newAttachments);
    localStorage.setItem(`${storageKey}_folders`, JSON.stringify(newFolders));
    localStorage.setItem(`${storageKey}_files`, JSON.stringify(newAttachments));
    if (onAttachmentChange) onAttachmentChange(newAttachments);
  };

  const handleCreateOrEditFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (editingFolderId) {
      // Editing existing folder
      const updated = folders.map(f => f.id === editingFolderId ? {
        ...f,
        name: newFolderName.trim(),
        color: newFolderColor
      } : f);
      saveState(updated, attachments);
    } else {
      // Create new folder
      const newFolder: DocumentFolder = {
        id: `fold_${Date.now()}`,
        scope,
        scopeId,
        category: 'custom',
        name: newFolderName.trim(),
        color: newFolderColor
      };
      const updated = [...folders, newFolder];
      saveState(updated, attachments);
    }

    setNewFolderName('');
    setNewFolderColor('blue');
    setEditingFolderId(null);
    setShowNewFolderModal(false);
  };

  const openCreateFolderModal = () => {
    setEditingFolderId(null);
    setNewFolderName('');
    setNewFolderColor('blue');
    setShowNewFolderModal(true);
  };

  const openEditFolderModal = (folder: DocumentFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setNewFolderName(folder.name);
    setNewFolderColor((folder.color as OdooColorKey) || 'blue');
    setShowNewFolderModal(true);
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !uploadTargetFolder) return;

    const newFile: DocumentAttachment = {
      id: `att_${Date.now()}`,
      folderId: uploadTargetFolder,
      name: uploadFileName.trim().endsWith('.pdf') || uploadFileName.trim().endsWith('.png') || uploadFileName.trim().endsWith('.jpg')
        ? uploadFileName.trim()
        : `${uploadFileName.trim()}.${uploadFileType === 'pdf' ? 'pdf' : uploadFileType === 'image' ? 'png' : 'docx'}`,
      fileSize: `${(Math.random() * 1.8 + 0.3).toFixed(1)} MB`,
      fileType: uploadFileType,
      uploadDate: new Date().toLocaleDateString('ar-KW'),
      uploadedBy: uploadUploader,
      expiryDate: uploadExpiryDate || undefined,
      documentNumber: uploadDocNo || undefined
    };

    const updatedFiles = [newFile, ...attachments];
    saveState(folders, updatedFiles);
    
    // Reset modal
    setUploadFileName('');
    setUploadExpiryDate('');
    setUploadDocNo('');
    setShowUploadModal(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      const updated = attachments.filter(f => f.id !== fileId);
      saveState(folders, updated);
      if (previewDoc?.id === fileId) setPreviewDoc(null);
    }
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا المجلد وجميع الملفات المرتبطة به؟')) {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      const updatedFiles = attachments.filter(f => f.folderId !== folderId);
      if (activeFolderId === folderId) setActiveFolderId(null);
      saveState(updatedFolders, updatedFiles);
    }
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);
  const currentFiles = activeFolderId 
    ? attachments.filter(a => a.folderId === activeFolderId)
    : attachments;

  const filteredFiles = currentFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.documentNumber && f.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden dir-rtl text-right">
      
      {/* 1. Folder Toolbar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 flex-wrap">
          <button 
            onClick={() => setActiveFolderId(null)}
            className={`hover:text-[#714B67] transition cursor-pointer ${!activeFolderId ? 'text-[#714B67]' : 'text-slate-500'}`}
          >
            {scopeName} (كافة المجلدات)
          </button>
          
          {activeFolder && (
            <>
              <ChevronRight size={14} className="text-slate-400 rotate-180" />
              <span className="text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded">
                📁 {activeFolder.name}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في الملفات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#714B67]"
            />
          </div>

          <button
            type="button"
            onClick={openCreateFolderModal}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <FolderPlus size={14} className="text-[#714B67]" />
            <span>+ إنشاء مجلد جديد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeFolderId) setUploadTargetFolder(activeFolderId);
              setShowUploadModal(true);
            }}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <UploadCloud size={14} />
            <span>رفع ملف / مستند</span>
          </button>
        </div>
      </div>

      {/* 2. Folder Cards View (When not inside a folder, or shown as top bar) */}
      {!activeFolderId && (
        <div className="p-4 bg-slate-50/40 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-bold text-slate-400">المجلدات المصنفة والترميز اللوني ({folders.length}):</div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Palette size={12} className="text-[#714B67]" />
              <span>Odoo Palette Architecture</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folders.map((folder) => {
              const fileCount = attachments.filter(a => a.folderId === folder.id).length;
              const colorKey = (folder.color as OdooColorKey) || 'blue';
              const colorCfg = ODOO_PALETTE[colorKey] || ODOO_PALETTE.blue;

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`bg-white p-3.5 rounded-xl border ${colorCfg.borderClass} hover:shadow-md transition cursor-pointer flex items-center justify-between group relative overflow-hidden`}
                >
                  {/* Subtle Color Accent Stripe */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: colorCfg.hex }}
                  />

                  <div className="flex items-center gap-3 pr-2">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-105 transition shadow-2xs ${colorCfg.bgLight} ${colorCfg.folderText}`}
                    >
                      <Folder size={22} style={{ color: colorCfg.hex }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-800 group-hover:text-[#714B67] transition">
                          {folder.name}
                        </h4>
                        <span 
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: colorCfg.hex }}
                          title={colorCfg.label}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {fileCount} {fileCount === 1 ? 'ملف مرفق' : fileCount === 2 ? 'ملفان' : fileCount > 2 && fileCount < 11 ? 'ملفات' : 'مستند'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => openEditFolderModal(folder, e)}
                      title="تعديل اسم أو لون المجلد"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#714B67] rounded transition"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      title="حذف المجلد"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#714B67] rotate-180 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Files List & Grid */}
      <div className="p-4">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-bold text-xs text-slate-600">لا توجد ملفات في هذا المجلد بعد</h4>
            <p className="text-[11px] text-slate-400 mt-1">اضغط على زر "رفع ملف / مستند" لإضافة المستندات الرسمية وتتبع صلاحيتها.</p>
            <button
              type="button"
              onClick={() => {
                if (activeFolderId) setUploadTargetFolder(activeFolderId);
                setShowUploadModal(true);
              }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-3 py-1.5 rounded-lg hover:bg-[#714B67]/20 transition"
            >
              <UploadCloud size={13} /> رفع مستند الآن
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/60">
                  <th className="p-3 text-right">المستند</th>
                  <th className="p-3 text-right">المجلد</th>
                  <th className="p-3 text-right">رقم المستند</th>
                  <th className="p-3 text-right">تاريخ الانتهاء</th>
                  <th className="p-3 text-right">تاريخ ومسؤول الرفع</th>
                  <th className="p-3 text-right">الحجم</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => {
                  const targetFolder = folders.find(f => f.id === file.folderId);
                  const expiry = file.expiryDate ? getExpiryStatus(file.expiryDate) : null;

                  return (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition">
                      {/* File Icon & Name */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            file.fileType === 'pdf' 
                              ? 'bg-rose-50 text-rose-600' 
                              : file.fileType === 'image' 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {file.fileType === 'pdf' ? <FileText size={16} /> : file.fileType === 'image' ? <ImageIcon size={16} /> : <FileCheck size={16} />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block hover:text-[#714B67] cursor-pointer" onClick={() => setPreviewDoc(file)}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-mono">{file.fileType}</span>
                          </div>
                        </div>
                      </td>

                      {/* Folder Name */}
                      <td className="p-3 text-slate-600">
                        {(() => {
                          const fColor = (targetFolder?.color as OdooColorKey) || 'blue';
                          const fCfg = ODOO_PALETTE[fColor] || ODOO_PALETTE.blue;
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${fCfg.bgLight} ${fCfg.folderText} ${fCfg.borderClass}`}>
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fCfg.hex }} />
                              <span>{targetFolder?.name || 'مجلد عام'}</span>
                            </span>
                          );
                        })()}
                      </td>

                      {/* Doc No */}
                      <td className="p-3 font-mono text-slate-700 font-bold">
                        {file.documentNumber || '-'}
                      </td>

                      {/* Expiry */}
                      <td className="p-3">
                        {file.expiryDate ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-slate-700 block">{file.expiryDate}</span>
                            {expiry && (
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${expiry.badgeClass}`}>
                                {expiry.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">غير محدد</span>
                        )}
                      </td>

                      {/* Upload Details */}
                      <td className="p-3 text-slate-600">
                        <div className="text-[11px] font-medium">{file.uploadedBy}</div>
                        <div className="text-[10px] text-slate-400">{file.uploadDate}</div>
                      </td>

                      {/* Size */}
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {file.fileSize}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(file)}
                            title="معاينة المستند"
                            className="p-1.5 text-slate-500 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              alert(`جاري تحميل المستند: ${file.name}`);
                            }}
                            title="تحميل الملف"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            title="حذف المستند"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={15} />
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
      </div>

      {/* Modal 1: Create or Edit Folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FolderPlus size={16} className="text-[#714B67]" />
                {editingFolderId ? 'تعديل بيانات وتلوين المجلد' : `إنشاء مجلد جديد في ${scopeName}`}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowNewFolderModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateOrEditFolder} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">اسم المجلد</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شهادات الخبرة والدورات التدريبية"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              {/* 8 Official Odoo Color Palette Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-600 font-bold flex items-center gap-1">
                    <Palette size={13} className="text-[#714B67]" />
                    <span>لون وتصنيف المجلد (Odoo Color Tag)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {ODOO_PALETTE[newFolderColor]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {ODOO_COLOR_KEYS.map((ck) => {
                    const cfg = ODOO_PALETTE[ck];
                    const isSelected = newFolderColor === ck;

                    return (
                      <button
                        key={ck}
                        type="button"
                        onClick={() => setNewFolderColor(ck)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-right transition cursor-pointer ${
                          isSelected
                            ? `${cfg.bgLight} ${cfg.borderClass} ring-2 ${cfg.ringClass} font-bold text-slate-900 shadow-2xs`
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-2xs"
                          style={{ backgroundColor: cfg.hex }}
                        />
                        <span className="text-[10px] truncate">{cfg.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{editingFolderId ? 'حفظ التعديلات' : '+ إنشاء المجلد'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload File / Document */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UploadCloud size={16} className="text-[#714B67]" />
                رفع مستند جديد (Upload Document)
              </h3>
              <button 
                type="button" 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="mt-4 space-y-3.5 text-xs">
              
              <div>
                <label className="text-slate-600 font-bold block mb-1">المجلد المستهدف (Target Folder)</label>
                <select
                  value={uploadTargetFolder}
                  onChange={(e) => setUploadTargetFolder(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-slate-800"
                  required
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>📁 {f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">اسم الملف أو عنوان المستند</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ترخيص مزاولة المهنة الطبية 2026.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">نوع الملف</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="image">صورة / مسح ضوئي (.png, .jpg)</option>
                    <option value="doc">مستند نصي (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">رقم المستند / الترخيص</label>
                  <input
                    type="text"
                    placeholder="مثال: PAM-99214"
                    value={uploadDocNo}
                    onChange={(e) => setUploadDocNo(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">تاريخ انتهاء الصلاحية (اختياري)</label>
                  <input
                    type="date"
                    value={uploadExpiryDate}
                    onChange={(e) => setUploadExpiryDate(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">يرتبط تلقائياً بمحرك التنبيهات قبل 60 يوماً.</p>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">المسؤول عن الرفع</label>
                  <input
                    type="text"
                    value={uploadUploader}
                    onChange={(e) => setUploadUploader(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                <UploadCloud className="mx-auto text-slate-400 mb-1" size={24} />
                <span className="text-[11px] text-slate-500 block">اسحب وأفلت الملف هنا أو انقر للاختيار</span>
                <span className="text-[10px] text-slate-400">يدعم صيغ PDF, PNG, JPG, DOCX حتى 25 ميجابايت</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-xl font-bold transition shadow-xs"
                >
                  حفظ ورفع المستند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#714B67]/10 text-[#714B67] rounded-lg">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-400">الحجم: {previewDoc.fileSize} | تاريخ الرفع: {previewDoc.uploadDate}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Sheet Simulation */}
            <div className="my-6 p-8 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-rose-500 font-bold text-2xl border border-slate-200">
                {previewDoc.fileType === 'pdf' ? 'PDF' : 'IMG'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{previewDoc.name}</h4>
                <p className="text-xs text-slate-500 mt-1">مستند رسمي مؤرشف في نظام Odoo Documents</p>
                {previewDoc.documentNumber && (
                  <p className="text-xs font-mono text-[#714B67] font-bold mt-1">
                    رقم الوثيقة: {previewDoc.documentNumber}
                  </p>
                )}
                {previewDoc.expiryDate && (
                  <p className="text-xs text-slate-600 mt-1">
                    تاريخ انتهاء الصلاحية: <strong>{previewDoc.expiryDate}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">بواسطة: {previewDoc.uploadedBy}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(`جاري تنزيل الملف: ${previewDoc.name}`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> تنزيل الملف
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
