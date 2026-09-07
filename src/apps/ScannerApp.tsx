import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DocumentItem, Employee, Company } from '../types';
import { 
  Scan, Upload, FileText, Search, Trash2, Download, CheckCircle2, AlertCircle,
  FolderOpen, Calendar, Shield, Sparkles, Filter, Eye, Plus, ArrowRight,
  Camera, RotateCw, ZoomIn, ZoomOut, Maximize2, UserCheck, Building2,
  Check, RefreshCw, X, AlertTriangle, ShieldCheck, UserPlus
} from 'lucide-react';
import { processAnyDocument, ScannedData } from '../utils/ocrService';
import { parseKuwaitCivilId, validateKuwaitCivilId } from '../utils/kuwaitLaw';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
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

// ضغط وتجهيز الصورة للعرض والحفظ الرقمي
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      // PDF or non-image
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string || '');
        }
      };
      img.onerror = () => resolve(event.target?.result as string || '');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
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
  // Navigation & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Scanner Workstation State
  const [selectedDocType, setSelectedDocType] = useState<string>('CIVIL_ID');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    docType: string;
    extractedData: any;
    fileName: string;
    isManualFallback: boolean;
    imagePreviewUrl: string;
  } | null>(null);

  // Inspector Viewer State (Zoom & Rotation)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Target Destination Routing:
  // 'NEW_EMP': Create new employee record
  // 'EXISTING_EMP': Link to existing employee and update them
  // 'COMPANY_DOC': Save as company general license/doc
  const [routingMode, setRoutingMode] = useState<'NEW_EMP' | 'EXISTING_EMP' | 'COMPANY_DOC'>('NEW_EMP');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');

  // Camera Live Capture Modal State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Filtered documents strictly for this company
  const companyDocuments = useMemo(() => {
    return (documents || []).filter(d => !d.companyId || d.companyId === activeCompany?.id || d.companyId === 'default');
  }, [documents, activeCompany]);

  const recentScans = useMemo(() => {
    return companyDocuments
      .filter(doc => {
        if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const emp = employees.find(e => e.id === doc.employeeId);
        return doc.title?.toLowerCase().includes(q) || 
               emp?.fullNameAr?.toLowerCase().includes(q) ||
               emp?.civilId?.includes(q) ||
               doc.documentNumber?.toLowerCase().includes(q);
      })
      .slice(0, 15);
  }, [companyDocuments, selectedCategory, searchTerm, employees]);

  // Statistics Metrics
  const metrics = useMemo(() => {
    const total = companyDocuments.length;
    const civilIds = companyDocuments.filter(d => d.category === 'CIVIL_ID').length;
    const passports = companyDocuments.filter(d => d.category === 'PASSPORT').length;
    const licenses = companyDocuments.filter(d => ['PROFESSIONAL_LICENSE', 'MOH_LICENSE', 'DRIVING_LICENSE'].includes(d.category)).length;
    return { total, civilIds, passports, licenses };
  }, [companyDocuments]);

  // Handle File Upload & Processing
  const handleProcessFile = async (file: File) => {
    setIsScanning(true);
    setZoomLevel(1);
    setRotationAngle(0);

    let base64Preview = '';
    try {
      base64Preview = await compressImage(file);
    } catch (err) {
      console.warn('Image compression failed:', err);
    }

    try {
      const result = await processAnyDocument(file, undefined, selectedDocType);
      
      // Check if Civil ID belongs to an existing employee automatically
      const cleanCivil = (result.civilId || '').replace(/\D/g, '');
      const existing = employees.find(e => cleanCivil && (e.civilId === cleanCivil || (e as any).civil_id === cleanCivil));
      if (existing) {
        setRoutingMode('EXISTING_EMP');
        setTargetEmployeeId(existing.id);
      } else {
        setRoutingMode('NEW_EMP');
        setTargetEmployeeId('');
      }

      setScanResult({
        docType: selectedDocType || result.documentType || 'CIVIL_ID',
        extractedData: result,
        fileName: file.name,
        isManualFallback: false,
        imagePreviewUrl: base64Preview
      });
      toast.success('تمت قراءة وتحليل المستند بالذكاء الاصطناعي بنجاح');
    } catch (error: any) {
      console.error("Scanner OCR Error:", error);
      toast.error('تعذر القراءة التلقائية الكاملة للمستند. تم فتح نمط التدقيق اليدوي.');
      
      setScanResult({
        docType: selectedDocType || 'CIVIL_ID',
        extractedData: {
          fullNameAr: '',
          fullNameEn: '',
          civilId: '',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nationality: 'كويتي',
        },
        fileName: file.name,
        isManualFallback: true,
        imagePreviewUrl: base64Preview
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Live Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('تعذر الوصول إلى الكاميرا. يرجى التحقق من أذونات المتصفح.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `scan_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        handleProcessFile(file);
      }
    }, 'image/jpeg', 0.9);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Civil ID Live Validation Feedback
  const civilIdValidation = useMemo(() => {
    if (!scanResult?.extractedData?.civilId) return null;
    const cleanId = scanResult.extractedData.civilId.replace(/\D/g, '');
    if (cleanId.length !== 12) return { isValid: false, message: 'يجب أن يتكون الرقم المدني من 12 رقماً' };
    const val = validateKuwaitCivilId(cleanId);
    return {
      isValid: val.isValid,
      message: val.isValid ? 'الرقم المدني كويتي صالح ومطابق لمعادلة الهيئة العامة PACI' : 'الرقم المدني غير صالح حسابياً وفق معيار PACI',
      dob: val.dob,
      gender: val.gender
    };
  }, [scanResult?.extractedData?.civilId]);

  // Handle Save and Dispatch
  const handleSaveAndDispatch = () => {
    if (!scanResult) return;

    const data = scanResult.extractedData;
    let employeeId = '';

    if (routingMode === 'NEW_EMP') {
      employeeId = onAutoAddEmpFromOCR(data, scanResult.docType);
      toast.success('تم إنشاء وتعيين سجل الموظف الجديد آلياً');
    } else if (routingMode === 'EXISTING_EMP') {
      if (!targetEmployeeId) {
        toast.error('يرجى اختيار الموظف المراد تحديث بياناته');
        return;
      }
      employeeId = targetEmployeeId;
      // Trigger employee update by passing employee's own info merged with scanned fields
      onAutoAddEmpFromOCR({ ...data, id: targetEmployeeId }, scanResult.docType);
      const matchedEmp = employees.find(e => e.id === targetEmployeeId);
      toast.success(`تم تحديث وثائق الموظف: ${matchedEmp?.fullNameAr || 'الموظف'}`);
    } else {
      // Company Document
      employeeId = '';
      toast.success('تمت أرشفة المستند ضمن وثائق المنشأة العامة');
    }

    const docNumber = data.civilId || data.passportNo || data.documentNumber || data.mohLicenseNo || '';
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      companyId: activeCompany?.id || '',
      employeeId: employeeId,
      title: `${scanResult.docType} - ${data.fullNameAr || data.fullNameEn || scanResult.fileName}`,
      category: scanResult.docType,
      fileUrl: scanResult.imagePreviewUrl || '#',
      fileName: scanResult.fileName,
      fileSize: '1.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || '',
      issueDate: data.issueDate || '',
      documentNumber: docNumber,
      status: 'active'
    };

    onSaveDocument(newDoc);
    setScanResult(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-100 rounded-xl overflow-hidden shadow-xs border border-slate-200" dir="rtl">
      
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center shadow-xs">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">الماسح الضوئي الذكي (AI Document Scanner)</h1>
              <span className="bg-purple-100 text-[#714B67] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                Odoo 18 OCR Station
              </span>
            </div>
            <p className="text-xs text-slate-500">
              استخراج البيانات وتدقيق الهويات، الجوازات، ورخص العمل بالذكاء الاصطناعي وترحيلها لحظياً
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <span className="text-slate-400">إجمالي الممسوح:</span>
            <span className="font-mono text-[#714B67]">{metrics.total}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>بطاقات مدنية:</span>
            <span className="font-mono font-bold text-sky-600">{metrics.civilIds}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>جوازات:</span>
            <span className="font-mono font-bold text-indigo-600">{metrics.passports}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Workstation Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* State A: Ready to Scan (Dropzone & Pre-selectors) */}
        {!scanResult && !isScanning && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
            
            {/* Header / Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                اختر نوع الوثيقة المستهدفة للمسح (Document Type):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'CIVIL_ID', label: 'بطاقة مدنية كويتية', icon: ShieldCheck },
                  { id: 'PASSPORT', label: 'جواز سفر', icon: FileText },
                  { id: 'RESIDENCY', label: 'إقامة / تأشيرة عمل', icon: UserCheck },
                  { id: 'PROFESSIONAL_LICENSE', label: 'ترخيص مهني / صحي', icon: Sparkles },
                  { id: 'DRIVING_LICENSE', label: 'رخصة قيادة', icon: FolderOpen },
                  { id: 'CONTRACT', label: 'عقد عمل رسمي', icon: Building2 },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = selectedDocType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDocType(item.id)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'border-[#714B67] bg-purple-50/70 text-[#714B67] shadow-xs' 
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropzone & Actions */}
            <div className="border-2 border-dashed border-purple-200 bg-purple-50/30 rounded-2xl p-8 text-center space-y-4 hover:border-[#714B67] transition">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xs mx-auto flex items-center justify-center text-[#714B67] border border-purple-100">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  اسحب وأفلت صورة الوثيقة أو ملف الـ PDF هنا
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  يقوم محرك الذكاء الاصطناعي بقراءة النصوص والبيانات والأرقام وتواريخ الانتهاء تلقائياً، مع دعم كامل للوثائق الكويتية.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <label className="bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer transition shadow-xs flex items-center gap-2 text-xs">
                  <Upload className="w-4 h-4" />
                  <span>اختيار ملف من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={startCamera}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-6 rounded-xl border border-slate-300 transition shadow-xs flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#714B67]" />
                  <span>تصوير مباشر بالكاميرا</span>
                </button>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                صيغ مقبولة: JPG, PNG, WEBP, PDF (بحد أقصى 15 ميغابايت)
              </div>
            </div>

          </div>
        )}

        {/* State B: Processing Spinner */}
        {isScanning && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="text-base font-bold text-slate-900">جاري قراءة واستخراج بيانات الوثيقة بالذكاء الاصطناعي...</h4>
            <p className="text-xs text-slate-500">
              يتم الآن فحص النصوص، الأرقام المدنية، تواريخ الانتهاء، ومطابقتها وفق معايير دولة الكويت.
            </p>
          </div>
        )}

        {/* State C: Active Inspection & Split View */}
        {scanResult && !isScanning && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">محطة تدقيق واعتماد المستند</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{scanResult.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScanResult(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> مسح وثيقة أخرى
                </button>
                <button
                  onClick={handleSaveAndDispatch}
                  className="px-5 py-1.5 bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" /> اعتماد وتأكيد الأرشفة
                </button>
              </div>
            </div>

            {/* Split Screen Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-200">
              
              {/* Right Side (7 Cols): Visual Document Inspector with Zoom & Rotation */}
              <div className="lg:col-span-7 p-5 bg-slate-100/60 flex flex-col items-center justify-between min-h-[520px]">
                
                {/* Visual Tools Bar */}
                <div className="w-full flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs mb-3 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#714B67]" /> معاينة المستند الممسوح
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="تكبير"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[10px] text-slate-500 w-10 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="تصغير"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setRotationAngle(prev => (prev + 90) % 360)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition mr-2"
                      title="تدوير 90 درجة"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Canvas / Image Display Container */}
                <div className="flex-1 w-full flex items-center justify-center overflow-auto rounded-xl bg-slate-900/5 p-4 max-h-[500px]">
                  {scanResult.imagePreviewUrl?.startsWith('data:image') || scanResult.imagePreviewUrl?.includes('.jpg') || scanResult.imagePreviewUrl?.includes('.png') ? (
                    <img
                      src={scanResult.imagePreviewUrl}
                      alt="Scanned Preview"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                        transition: 'transform 0.2s ease-out'
                      }}
                      className="max-h-[460px] max-w-full object-contain rounded-lg shadow-md border border-slate-300"
                    />
                  ) : (
                    <div className="text-center p-8 bg-white rounded-xl border border-slate-200">
                      <FileText className="w-16 h-16 mx-auto mb-2 text-[#714B67]" />
                      <p className="font-bold text-slate-800 text-sm">{scanResult.fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">ملف رقمي مؤكد ومحفوظ بنجاح</p>
                    </div>
                  )}
                </div>

                <div className="w-full text-center text-[11px] text-slate-400 mt-2">
                  استخدم أدوات التكبير والتدوير أعلاه لمطابقة البيانات المكتوبة في الاستمارة
                </div>

              </div>

              {/* Left Side (5 Cols): Extracted Fields Form & Routing Options */}
              <div className="lg:col-span-5 p-5 space-y-4 bg-white overflow-y-auto max-h-[600px]">
                
                {/* 1. Target Routing Options */}
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
                  <span className="text-xs font-bold text-purple-950 block">وجهة المستند (Target Destination):</span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => setRoutingMode('NEW_EMP')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        routingMode === 'NEW_EMP' 
                          ? 'bg-[#714B67] text-white border-[#714B67] shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      موظف جديد
                    </button>
                    <button
                      onClick={() => setRoutingMode('EXISTING_EMP')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        routingMode === 'EXISTING_EMP' 
                          ? 'bg-[#714B67] text-white border-[#714B67] shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      تحديث موظف قائم
                    </button>
                    <button
                      onClick={() => setRoutingMode('COMPANY_DOC')}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                        routingMode === 'COMPANY_DOC' 
                          ? 'bg-[#714B67] text-white border-[#714B67] shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ترخيص منشأة
                    </button>
                  </div>

                  {/* Dropdown if updating existing employee */}
                  {routingMode === 'EXISTING_EMP' && (
                    <div className="mt-2 pt-2 border-t border-purple-200">
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">
                        اختر الموظف المستهدف للتحديث:
                      </label>
                      <select
                        value={targetEmployeeId}
                        onChange={(e) => setTargetEmployeeId(e.target.value)}
                        className="w-full bg-white border border-purple-300 rounded-lg p-2 text-xs font-bold text-slate-800 outline-none focus:border-[#714B67]"
                      >
                        <option value="">-- اضغط لاختيار الموظف --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullNameAr} ({emp.civilId || 'بدون رقم مدني'}) - {emp.jobTitle || emp.department || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Civil ID Validation Notice */}
                {civilIdValidation && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
                    civilIdValidation.isValid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {civilIdValidation.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block font-bold">{civilIdValidation.message}</strong>
                      {civilIdValidation.dob && (
                        <div className="font-mono text-[11px] mt-0.5 opacity-80">
                          الميلاد المحتسب: {civilIdValidation.dob} | الجنس: {civilIdValidation.gender === 'FEMALE' ? 'أنثى' : 'ذكر'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Extracted Fields Inputs */}
                <div className="space-y-3 text-xs">
                  
                  {/* Name Ar */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الاسم الكامل بالعربية:</label>
                    <input
                      type="text"
                      value={scanResult.extractedData.fullNameAr || ''}
                      onChange={(e) => setScanResult({
                        ...scanResult,
                        extractedData: { ...scanResult.extractedData, fullNameAr: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-bold focus:bg-white focus:border-[#714B67] outline-none"
                    />
                  </div>

                  {/* Name En */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name (English):</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={scanResult.extractedData.fullNameEn || ''}
                      onChange={(e) => setScanResult({
                        ...scanResult,
                        extractedData: { ...scanResult.extractedData, fullNameEn: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:bg-white focus:border-[#714B67] outline-none text-left"
                    />
                  </div>

                  {/* Civil ID & Nationality */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الرقم المدني (12 رقماً):</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={scanResult.extractedData.civilId || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setScanResult({
                            ...scanResult,
                            extractedData: { ...scanResult.extractedData, civilId: val }
                          });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الجنسية:</label>
                      <input
                        type="text"
                        value={scanResult.extractedData.nationality || ''}
                        onChange={(e) => setScanResult({
                          ...scanResult,
                          extractedData: { ...scanResult.extractedData, nationality: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  {/* Expiry Date & Passport No */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">تاريخ انتهاء الوثيقة:</label>
                      <input
                        type="date"
                        value={scanResult.extractedData.expiryDate || ''}
                        onChange={(e) => setScanResult({
                          ...scanResult,
                          extractedData: { ...scanResult.extractedData, expiryDate: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">رقم جواز السفر:</label>
                      <input
                        type="text"
                        value={scanResult.extractedData.passportNo || ''}
                        onChange={(e) => setScanResult({
                          ...scanResult,
                          extractedData: { ...scanResult.extractedData, passportNo: e.target.value.toUpperCase() }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                  {/* Job Title / Profession & MOH License */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي / المهنة:</label>
                      <input
                        type="text"
                        value={scanResult.extractedData.profession || scanResult.extractedData.jobTitle || ''}
                        onChange={(e) => setScanResult({
                          ...scanResult,
                          extractedData: { 
                            ...scanResult.extractedData, 
                            profession: e.target.value,
                            jobTitle: e.target.value 
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ترخيص مزاولة المهنة (MOH):</label>
                      <input
                        type="text"
                        value={scanResult.extractedData.mohLicenseNo || scanResult.extractedData.license_no || ''}
                        onChange={(e) => setScanResult({
                          ...scanResult,
                          extractedData: { 
                            ...scanResult.extractedData, 
                            mohLicenseNo: e.target.value,
                            license_no: e.target.value 
                          }
                        })}
                        placeholder="اختياري للكادر الطبي"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono focus:bg-white focus:border-[#714B67] outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Confirm Dispatch CTA */}
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={handleSaveAndDispatch}
                    className="flex-1 bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold py-3 rounded-xl transition text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد واعتماد وحفظ في الأرشيف</span>
                  </button>
                  <button
                    onClick={() => setScanResult(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 3. Recent Scanned Documents Archive Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#714B67]" />
              <h3 className="text-xs font-bold text-slate-900">سجل عمليات المسح والأرشفة الأخيرة بالمنشأة</h3>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {recentScans.length} وثيقة
              </span>
            </div>

            {/* Filter Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="بحث في الوثائق الممسوحة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#714B67]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">عنوان الوثيقة</th>
                <th className="p-3">الموظف المعني</th>
                <th className="p-3 font-mono">الرقم المدني</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3 font-mono">تاريخ الانتهاء</th>
                <th className="p-3 font-mono">تاريخ المسح</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentScans.map((doc, idx) => {
                const emp = employees.find(e => e.id === doc.employeeId);
                return (
                  <tr key={doc.id} className={`hover:bg-purple-50/20 transition ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                    <td className="p-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#714B67]" />
                        <span 
                          onClick={() => setPreviewDoc(doc)}
                          className="hover:text-[#714B67] cursor-pointer"
                        >
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-700">
                      {emp ? emp.fullNameAr : 'وثيقة منشأة عامة'}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {emp?.civilId || doc.documentNumber || '—'}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#714B67] border border-purple-100">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {doc.expiryDate || '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">
                      {doc.uploadDate || '—'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition"
                          title="معاينة الوثيقة"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentScans.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Scan className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#714B67]" />
              <p className="font-bold text-slate-600 text-xs">لا توجد وثائق ممسوحة مسبقاً مطابقة للبحث</p>
            </div>
          )}

        </div>

      </div>

      {/* 4. Live Camera Capture Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl flex flex-col border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#714B67]" />
                التصوير المباشر للوثيقة
              </h4>
              <button
                onClick={stopCamera}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center relative min-h-[340px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-[380px] object-cover rounded-lg"
              />
              {/* Card alignment guide overlay */}
              <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="bg-black/50 text-white text-[11px] px-3 py-1 rounded-full backdrop-blur-xs font-mono">
                  ضع البطاقة أو المستند داخل الإطار
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                إلغاء
              </button>

              <button
                onClick={capturePhoto}
                className="px-6 py-2.5 bg-[#714B67] hover:bg-[#5a3a51] text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>التقاط ومسح الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        employee={previewDoc ? employees.find(e => e.id === previewDoc.employeeId) : undefined}
        onDelete={(id) => {
          onDeleteDocument(id);
          setPreviewDoc(null);
        }}
      />

    </div>
  );
};
