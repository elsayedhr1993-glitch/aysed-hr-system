import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  FileCheck, 
  ShieldCheck, 
  Laptop, 
  AlertCircle, 
  Send, 
  Briefcase, 
  Building2, 
  Calendar, 
  Stethoscope, 
  Lock,
  Layers,
  Award,
  Camera,
  Upload,
  Scan,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { processAnyDocument } from '../../utils/ocrService';
import { OnboardingPlan, OnboardingTask } from '../../types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLaunch: (plan: OnboardingPlan) => void;
  existingEmployees?: Array<{ id: string; nameAr: string; jobTitle?: string; dept?: string; civilId?: string }>;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onConfirmLaunch,
  existingEmployees = []
}) => {
  // Wizard active step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Wizard State (Transient until confirmed)
  const [selectedEmpId, setSelectedEmpId] = useState<string>('new');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [department, setDepartment] = useState<string>('الأطباء');
  const [civilId, setCivilId] = useState<string>('');
  const [expectedStartDate, setExpectedStartDate] = useState<string>(
    new Date(Date.now() + 864000000 * 3).toISOString().split('T')[0]
  );
  const [templateType, setTemplateType] = useState<
    'standard_admin' | 'medical_specialist' | 'executive' | 'technical'
  >('medical_specialist');

  // Smart OCR Scanner State for Step 1
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [scannedFileName, setScannedFileName] = useState<string>('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [scannedImageUrl, setScannedImageUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('تعذر تشغيل الكاميرا، يرجى استخدام رفع صورة أو ملف PDF.');
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
        const file = new File([blob], `civil_id_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        handleProcessScanFile(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleProcessScanFile = async (file: File) => {
    if (!file) return;
    setIsScanning(true);
    setScanSuccess(false);
    setScannedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setScannedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      const result = await processAnyDocument(file);
      if (result) {
        setScannedData(result);
        const name = result.fullNameAr || result.fullName || result.fullNameEn || '';
        if (name) setEmployeeName(name);
        if (result.civilId) setCivilId(result.civilId);
        if (result.jobTitle || result.profession) setJobTitle(result.jobTitle || result.profession);
        
        if (result.mohLicenseNo || (result.profession && (result.profession.includes('طبيب') || result.profession.includes('علاج')))) {
          setDepartment('الأطباء');
          setTemplateType('medical_specialist');
          setBasicSalary(1200);
        } else if (result.profession && result.profession.includes('تمريض')) {
          setDepartment('التمريض');
          setTemplateType('medical_specialist');
          setBasicSalary(850);
        } else if (result.profession && (result.profession.includes('محاسب') || result.profession.includes('إداري'))) {
          setDepartment('الموارد البشرية');
          setTemplateType('standard_admin');
          setBasicSalary(750);
        }
        
        setScanSuccess(true);
        toast.success(`تم استخراج بيانات ${name ? `الموظف (${name})` : 'الوثيقة'} بالذكاء الاصطناعي بنجاح! 🎉`);
      }
    } catch (err: any) {
      console.error('Scan error in wizard:', err);
      toast.error('حدث خطأ أثناء قراءة الوثيقة. يرجى التأكد من وضوح الصورة.');
    } finally {
      setIsScanning(false);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Contract Details State
  const [contractType, setContractType] = useState<string>('محدد المدة (Fixed Term)');
  const [probationDays, setProbationDays] = useState<number>(100);
  const [basicSalary, setBasicSalary] = useState<number>(850);
  const [housingAllowance, setHousingAllowance] = useState<number>(100);
  const [transportAllowance, setTransportAllowance] = useState<number>(50);
  const [otherAllowances, setOtherAllowances] = useState<number>(0);

  // Commencement Details State
  const [actualJoiningDate, setActualJoiningDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [directSupervisor, setDirectSupervisor] = useState<string>('مدير القسم الطبي');
  const [branchLocation, setBranchLocation] = useState<string>('الفرع الرئيسي');
  const [isCommenced, setIsCommenced] = useState<boolean>(true);
  const [leaveAccrualActivated, setLeaveAccrualActivated] = useState<boolean>(true);
  const [commencementNotes, setCommencementNotes] = useState<string>('تم استلام العهد والأنظمة وتوثيق المباشرة الرسمية بالفرع');

  // Step 2 Checklist state
  const [legalChecklist, setLegalChecklist] = useState({
    civilIdScan: true,
    passportScan: true,
    pamWorkPermit: true,
    mohLicense: true,
    medicalFitness: true,
    signedContract: true
  });

  // Step 3 Custody and IT Provisioning
  const [custodySelection, setCustodySelection] = useState<string[]>([
    'لاب توب محمول / جهاز كمبيوتر',
    'بريد إلكتروني رسمي (@company.com)',
    'بطاقة وبصمة بوابات المبنى'
  ]);

  const custodyOptions = [
    { id: 'laptop', label: 'لاب توب محمول / جهاز كمبيوتر', icon: '💻' },
    { id: 'email', label: 'بريد إلكتروني رسمي (@company.com)', icon: '📧' },
    { id: 'access_card', label: 'بطاقة وبصمة بوابات المبنى', icon: '🔑' },
    { id: 'sim', label: 'شريحة هاتف برقم رسمي (Corporate SIM)', icon: '📱' },
    { id: 'uniform', label: 'زي رسمي / سكراب طبي ومعدات وقاية', icon: '🥼' },
    { id: 'parking', label: 'تصريح مواقف السيارات والتأمين الصحي', icon: '🚗' }
  ];

  if (!isOpen) return null;

  // Handle employee selection change
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (empId === 'new') {
      setEmployeeName('');
      setJobTitle('');
      setCivilId('');
    } else {
      const emp = existingEmployees.find(e => e.id === empId);
      if (emp) {
        setEmployeeName(emp.nameAr || '');
        setJobTitle(emp.jobTitle || '');
        setDepartment(emp.dept || 'الأطباء');
        setCivilId(emp.civilId || '');
      }
    }
  };

  const toggleCustody = (itemLabel: string) => {
    if (custodySelection.includes(itemLabel)) {
      setCustodySelection(custodySelection.filter(c => c !== itemLabel));
    } else {
      setCustodySelection([...custodySelection, itemLabel]);
    }
  };

  // Generate tasks based on chosen template & checklist
  const buildFinalTasksList = (): OnboardingTask[] => {
    const defaultTasks: OnboardingTask[] = [
      {
        id: 'task-1',
        title: 'استكمال ملف المستندات الرسمية والبطاقة المدنية',
        category: 'legal',
        assignedToRole: 'مسؤول الموارد البشرية',
        completed: legalChecklist.civilIdScan && legalChecklist.passportScan
      },
      {
        id: 'task-2',
        title: 'مراجعة وترخيص وزارة الصحة (MOH) وقيد النقابة',
        category: 'medical',
        assignedToRole: 'مسؤول تراخيص وزارة الصحة',
        completed: legalChecklist.mohLicense
      },
      {
        id: 'task-3',
        title: 'تسليم العهد والأجهزة الإلكترونية والتجهيزات',
        category: 'custody',
        assignedToRole: 'قسم تقنية المعلومات والخدمات',
        completed: false
      },
      {
        id: 'task-4',
        title: 'إعداد حساب البريد الإلكتروني وبصمة الحضور',
        category: 'it',
        assignedToRole: 'مسؤول شبكات الدعم الفني',
        completed: false
      },
      {
        id: 'task-5',
        title: 'الجلسة التعريفية باللوائح الداخلية وسياسة المنشأة',
        category: 'training',
        assignedToRole: 'مدير المورد البشري والموجه',
        completed: false
      },
      {
        id: 'task-6',
        title: 'توقيع إقرار مباشرة العمل الرسمي بالفرع',
        category: 'legal',
        assignedToRole: 'المسؤول المباشر',
        completed: legalChecklist.signedContract
      }
    ];

    if (templateType === 'medical_specialist') {
      defaultTasks.push({
        id: 'task-7',
        title: 'اعتماد ختم الطبيب بالمركز وتفعيل الوصفات الإلكترونية',
        category: 'medical',
        assignedToRole: 'المدير الطبي',
        completed: false
      });
    } else if (templateType === 'executive') {
      defaultTasks.push({
        id: 'task-8',
        title: 'تسليم مصفوفة الصلاحيات واعتماد التواقيع المالية',
        category: 'legal',
        assignedToRole: 'الإدارة العليا / المدير التنفيذي',
        completed: false
      });
    }

    return defaultTasks;
  };

  const handleConfirmFinish = () => {
    if (!employeeName.trim()) {
      alert('يرجى إدخال اسم الموظف لاستكمال خطة التهيئة');
      return;
    }

    const tasks = buildFinalTasksList();
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const initialProgress = Math.round((completedTasksCount / tasks.length) * 100);

    const createdPlan: OnboardingPlan = {
      id: `ONB-${Date.now().toString().slice(-6)}`,
      employeeId: selectedEmpId !== 'new' ? selectedEmpId : undefined,
      employeeName: employeeName.trim(),
      jobTitle: jobTitle.trim() || 'موظف جديد',
      department: department || 'الأطباء',
      civilId: civilId.trim() || 'غير محدد',
      expectedStartDate: expectedStartDate || new Date().toISOString().split('T')[0],
      templateType,
      status: 'active',
      progressPercentage: initialProgress,
      tasks,
      custodyItems: custodySelection,
      legalChecklist: { ...legalChecklist },
      requiredDocuments: Object.entries(legalChecklist).filter(([_, v]) => v).map(([k]) => k),
      contractDetails: {
        contractType,
        startDate: expectedStartDate,
        probationDays,
        basicSalary,
        housingAllowance,
        transportAllowance,
        otherAllowances,
        totalSalary: basicSalary + housingAllowance + transportAllowance + otherAllowances
      },
      commencementDetails: {
        actualJoiningDate,
        directSupervisor,
        branchLocation,
        isCommenced,
        commencedAt: new Date().toISOString(),
        custodyDelivered: custodySelection,
        leaveAccrualActivated,
        notes: commencementNotes
      },
      scannedData: scannedData || undefined,
      scannedImageUrl: scannedImageUrl || undefined,
      documentFiles: scannedImageUrl ? {
        civilIdScan: {
          name: scannedFileName || 'civil_id_scan.jpg',
          url: scannedImageUrl,
          fileSize: '1.2 MB',
          uploadDate: new Date().toISOString().slice(0, 10),
          title: 'البطاقة المدنية / جواز السفر (مسح ذكي)',
          type: 'image',
          status: 'verified'
        }
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onConfirmLaunch(createdPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-fadeIn">
        
        {/* Header Bar */}
        <div className="bg-[#714B67] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">معالج إنشاء خطة التهيئة والتعيين (Onboarding Plan Wizard)</h3>
                <span className="bg-amber-400/20 text-amber-200 text-[10px] px-2 py-0.5 rounded-full border border-amber-300/30 font-mono">
                  Transient Model
                </span>
              </div>
              <p className="text-xs text-purple-200">
                إجراء مؤقت متعدد المراحل لإعداد مهام الموظف الجديد بأسلوب Odoo 18
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5">
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-bold">
            <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              currentStep === 1 
                ? 'bg-[#714B67] text-white shadow-xs' 
                : currentStep > 1 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                {currentStep > 1 ? <CheckCircle2 size={11} className="text-emerald-700" /> : '1'}
              </span>
              <span className="text-[10px] truncate">1. الأساسية</span>
            </div>

            <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              currentStep === 2 
                ? 'bg-[#714B67] text-white shadow-xs' 
                : currentStep > 2 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                {currentStep > 2 ? <CheckCircle2 size={11} className="text-emerald-700" /> : '2'}
              </span>
              <span className="text-[10px] truncate">2. عقد العمل والراتب</span>
            </div>

            <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              currentStep === 3 
                ? 'bg-[#714B67] text-white shadow-xs' 
                : currentStep > 3 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                {currentStep > 3 ? <CheckCircle2 size={11} className="text-emerald-700" /> : '3'}
              </span>
              <span className="text-[10px] truncate">3. الشروط والمستندات</span>
            </div>

            <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              currentStep === 4 
                ? 'bg-[#714B67] text-white shadow-xs' 
                : currentStep > 4 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">
                {currentStep > 4 ? <CheckCircle2 size={11} className="text-emerald-700" /> : '4'}
              </span>
              <span className="text-[10px] truncate">4. العهد وإقرار المباشرة</span>
            </div>

            <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 transition ${
              currentStep === 5 
                ? 'bg-[#714B67] text-white shadow-xs' 
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px]">5</span>
              <span className="text-[10px] truncate">5. الاعتماد والإنشاء</span>
            </div>
          </div>
        </div>

        {/* Wizard Form Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">

          {/* STEP 1: Basic Hire Info & Template */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center gap-2 text-purple-900">
                <UserPlus size={18} className="text-[#714B67]" />
                <div>
                  <strong className="block text-sm">تحديد الموظف ونموذج خطة التهيئة (Onboarding Template)</strong>
                  <span className="text-[11px] text-purple-700">حدد هل التعيين لموظف مسجل حالياً أو موظف مرشح جديد</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">اختيار الموظف المستهدف</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => handleSelectEmployee(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white"
                  >
                    <option value="new">+ إنشاء خطة لموظف جديد (غير مسجل بالدليل)</option>
                    {existingEmployees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.nameAr} | {e.jobTitle || 'موظف'} ({e.civilId || e.id})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmpId === 'new' && (
                  <div className="md:col-span-2 p-3.5 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50/60 border border-purple-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center shadow-xs">
                          <Scan className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-slate-800">
                            المسح الضوئي الذكي للبطاقة المدنية / جواز السفر (AI OCR Scanner)
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            التقط بالكاميرا أو ارفع صورة المستند لتعبئة الاسم والرقم المدني والوظيفة تلقائياً
                          </span>
                        </div>
                      </div>
                      
                      {scanSuccess && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          تم استخراج البيانات
                        </span>
                      )}
                    </div>

                    {/* Camera Live Viewfinder */}
                    {isCameraActive && (
                      <div className="relative rounded-xl overflow-hidden bg-black border border-slate-700 flex flex-col items-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full max-h-[260px] object-cover" />
                        <div className="absolute bottom-3 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>التقاط ومعالجة الصورة</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>إلغاء</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Scanning Spinner */}
                    {isScanning && (
                      <div className="p-3 bg-purple-100/90 border border-purple-300 rounded-xl flex items-center gap-2.5 text-purple-900 animate-pulse">
                        <Loader2 className="w-5 h-5 text-[#714B67] animate-spin shrink-0" />
                        <div className="text-xs">
                          <strong className="block font-bold">جاري قراءة واستخراج البيانات بالذكاء الاصطناعي...</strong>
                          <span className="text-[11px] text-purple-700">يتم التعرف على الاسم الكامل، الرقم المدني، والمسمى الوظيفي</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isCameraActive && !isScanning && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3.5 py-2 bg-[#714B67] hover:bg-[#5a3a51] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>مسح فوري بالكاميرا</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>رفع صورة أو مستند PDF</span>
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleProcessScanFile(f);
                            e.target.value = '';
                          }}
                        />

                        {scanSuccess && (
                          <button
                            type="button"
                            onClick={() => {
                              setScanSuccess(false);
                              setScannedData(null);
                              setScannedImageUrl('');
                            }}
                            className="px-2.5 py-2 text-slate-500 hover:text-red-600 text-xs flex items-center gap-1 transition cursor-pointer mr-auto"
                            title="مسح مستند آخر"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>مسح مستند آخر</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Scanned Summary Chip */}
                    {scanSuccess && scannedData && (
                      <div className="p-2.5 bg-white border border-emerald-200 rounded-lg text-[11px] text-slate-700 flex flex-wrap items-center gap-x-4 gap-y-1 shadow-xs">
                        <div><strong className="text-slate-900 font-bold">الاسم:</strong> {employeeName || '—'}</div>
                        <div><strong className="text-slate-900 font-bold">الرقم المدني:</strong> <span className="font-mono font-bold text-emerald-700">{civilId || '—'}</span></div>
                        {scannedData.nationality && <div><strong className="text-slate-900 font-bold">الجنسية:</strong> {scannedData.nationality}</div>}
                        {scannedData.dob && <div><strong className="text-slate-900 font-bold">الميلاد:</strong> {scannedData.dob}</div>}
                        {scannedData.passportNo && <div><strong className="text-slate-900 font-bold">الجواز:</strong> <span className="font-mono">{scannedData.passportNo}</span></div>}
                        {scannedData.mohLicenseNo && <div><strong className="text-slate-900 font-bold">ترخيص صحي:</strong> {scannedData.mohLicenseNo}</div>}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم الموظف الثلاثي / الرباعي *</label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="مثال: د. محمد عبد الرحمن العتيبي"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي المستهدف</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="مثال: طبيب أخصائي / محاسب أول"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">القسم / الإدارة</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="الأطباء">الأطباء</option>
                    <option value="التمريض">التمريض</option>
                    <option value="الفنيين">الفنيين والأشعة</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                    <option value="الإدارة المالية">الإدارة المالية</option>
                    <option value="الخدمات المساندة">الخدمات المساندة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم المدني (إن وجد)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={civilId}
                    onChange={(e) => setCivilId(e.target.value)}
                    placeholder="الرقم المدني"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ المباشرة والتوجيه المتوقع</label>
                  <input
                    type="date"
                    value={expectedStartDate}
                    onChange={(e) => setExpectedStartDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">نموذج الخطة القائم (Plan Template)</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-purple-300 rounded-xl font-bold text-[#714B67]"
                  >
                    <option value="medical_specialist">🩺 خطة تعيين الأطباء والتخصصات الطبية (MOH Plan)</option>
                    <option value="standard_admin">📋 خطة تعيين كادر إداري ومالي قياسية</option>
                    <option value="technical">💻 خطة تعيين كادر فني وتقني</option>
                    <option value="executive">👑 خطة تعيين قيادي / مدير قسم</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Employment Contract & Salary Breakdown */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between text-purple-900">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <div>
                    <strong className="block text-sm">عقد العمل والتفاصيل المالية (Employment Contract & Salary)</strong>
                    <span className="text-[11px] text-purple-700">تحديد نوع العقد الأهلي، فترة التجربة، وهيكل الراتب والبدلات الشاملة</span>
                  </div>
                </div>
                <div className="bg-purple-900 text-white px-3 py-1 rounded-xl text-xs font-mono font-bold">
                  الإجمالي: {(basicSalary + housingAllowance + transportAllowance + otherAllowances).toLocaleString()} د.ك
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع العقد الأهلي *</label>
                  <select 
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="محدد المدة (Fixed Term)">محدد المدة (Fixed Term - 3 سنوات)</option>
                    <option value="غير محدد المدة (Indefinite Term)">غير محدد المدة (Indefinite Term)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">فترة التجربة بالأيام (المادة 32)</label>
                  <input 
                    type="number"
                    max={100}
                    value={probationDays}
                    onChange={(e) => setProbationDays(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الراتب الأساسي (KWD)</label>
                  <input 
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    placeholder="850"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بدل السكن (KWD)</label>
                  <input 
                    type="number"
                    value={housingAllowance}
                    onChange={(e) => setHousingAllowance(Number(e.target.value))}
                    placeholder="100"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بدل النقل (KWD)</label>
                  <input 
                    type="number"
                    value={transportAllowance}
                    onChange={(e) => setTransportAllowance(Number(e.target.value))}
                    placeholder="50"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">بدلات أخرى (KWD)</label>
                  <input 
                    type="number"
                    value={otherAllowances}
                    onChange={(e) => setOtherAllowances(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Checklist & Legal Requirements */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-900">
                <ShieldCheck size={18} className="text-emerald-700" />
                <div>
                  <strong className="block text-sm">قوائم التحقق والمستندات القانونية (Legal Requirements)</strong>
                  <span className="text-[11px] text-emerald-700">حدد المستندات والشروط الجاهزة أو المطلوبة لاستكمال ملف التعيين</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.civilIdScan ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.civilIdScan}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, civilIdScan: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">ممسوح البطاقة المدنية صالحة</span>
                    <span className="text-[10px] text-slate-400">الوجهان بالألوان للهيئة العامة للمعلومات المدنية</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.passportScan ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.passportScan}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, passportScan: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">ممسوح جواز السفر (صلاحية +6 أشهر)</span>
                    <span className="text-[10px] text-slate-400">مقرونة بصفحة الإقامة ورقم المرجع</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.pamWorkPermit ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.pamWorkPermit}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, pamWorkPermit: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">إذن العمل الصادر من الهيئة العامة للقوى العاملة (PAM)</span>
                    <span className="text-[10px] text-slate-400">حفظ الإذن الصادر برقم الملف الرسمي</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.mohLicense ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.mohLicense}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, mohLicense: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">ترخيص مزاولة المهنة من وزارة الصحة (MOH)</span>
                    <span className="text-[10px] text-slate-400">للطاقم الطبي والتمريضي والفنيين</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.medicalFitness ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.medicalFitness}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, medicalFitness: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">شهادة اللياقة الصحية والفحص الطبي</span>
                    <span className="text-[10px] text-slate-400">فحوصات الأمراض السارية والبصمات</span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  legalChecklist.signedContract ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={legalChecklist.signedContract}
                    onChange={(e) => setLegalChecklist({ ...legalChecklist, signedContract: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">توقيع العقد وإقرار مباشرة العمل</span>
                    <span className="text-[10px] text-slate-400">توقيع الموظف والاعتماد الإداري النهائي</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Custody, IT & Access Provisioning */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 flex items-center gap-2 text-indigo-900">
                <Laptop size={18} className="text-indigo-700" />
                <div>
                  <strong className="block text-sm">تسليم العهد والأجهزة وتصاريح الأنظمة (Provisioning)</strong>
                  <span className="text-[11px] text-indigo-700">حدد التجهيزات التلقائية التي سيتم ربطها بمسؤول تقنية المعلومات والخدمات</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {custodyOptions.map((opt) => {
                  const isSelected = custodySelection.includes(opt.label);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleCustody(opt.label)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 size={13} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Commencement Details */}
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-3 mt-3">
                <h5 className="font-bold text-emerald-950 text-xs flex items-center justify-between">
                  <span>🚀 توثيق إقرار المباشرة الفعلية (Job Commencement)</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-emerald-900 font-semibold mb-0.5 text-[11px]">تاريخ المباشرة الفعلية بالفرع</label>
                    <input 
                      type="date"
                      value={actualJoiningDate}
                      onChange={(e) => setActualJoiningDate(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-900 font-semibold mb-0.5 text-[11px]">المشرف المباشر</label>
                    <input 
                      type="text"
                      value={directSupervisor}
                      onChange={(e) => setDirectSupervisor(e.target.value)}
                      placeholder="مدير القسم الطبي"
                      className="w-full bg-white border border-emerald-300 rounded-lg p-2 font-bold text-xs"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={leaveAccrualActivated}
                    onChange={(e) => setLeaveAccrualActivated(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-bold text-emerald-950 text-[11px]">تفعيل حساب رصيد الإجازات السنوية التلقائي (2.5 يوم/شهر) بدءاً من تاريخ المباشرة</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirm (Transient Confirmation) */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Transient Model Warning Banner */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300 text-amber-900 flex items-start gap-2.5">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">سلوك الأشكال المؤقتة (Transient Form Wizard):</strong>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    هذه البيانات متواجدة حالياً في الذاكرة المؤقتة للنموذج. لن يتم تسجيل أي بيانات في السجلات الدائمة للنظام حتى تنقر على زر <strong>"تأكيد وتفعيل خطة التهيئة"</strong> أدناه.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#714B67]">{employeeName || 'موظف جديد'}</h4>
                    <p className="text-[11px] text-slate-500">{jobTitle || 'غير محدد'} | {department}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    نموذج: {templateType === 'medical_specialist' ? 'كادر طبي (MOH)' : 'كادر قياسي'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">نوع العقد:</span>
                    <strong className="text-slate-800 font-bold">{contractType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">الأجر الشامل:</span>
                    <strong className="font-mono text-purple-950 font-black">{(basicSalary + housingAllowance + transportAllowance + otherAllowances).toLocaleString()} د.ك</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">المباشرة الفعلية:</span>
                    <strong className="font-mono text-emerald-800 font-bold">{actualJoiningDate || expectedStartDate}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold block mb-1">العهد والتجهيزات المطلوبة ({custodySelection.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {custodySelection.map((item, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700 font-medium">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-2">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight size={16} />
              <span>السابق (Previous)</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء الإجراء
            </button>
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => {
                if (currentStep === 1 && !employeeName.trim()) {
                  alert('يرجى كتابة اسم الموظف للانتقال للخطوة التالية');
                  return;
                }
                setCurrentStep(prev => prev + 1);
              }}
              className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#5c3c54] text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>التالي (Next)</span>
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleConfirmFinish}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Send size={15} />
              <span>تأكيد وتفعيل خطة التهيئة (Confirm & Launch)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
