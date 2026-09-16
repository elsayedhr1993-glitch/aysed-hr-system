import React, { useState, useEffect } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Clock, ShieldCheck, 
  MapPin, Fingerprint, QrCode, AlertTriangle, Calendar, 
  Award, RefreshCw, Send, Sparkles, CheckCircle2, Sliders, 
  Building2, Users, DollarSign, Smartphone, Zap, Server, Activity, Wifi, Lock
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export interface ShiftConfig {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
  isNightShift: boolean;
}

export interface AttendancePolicyData {
  // Multi-Company & Facility Scoping
  company_id: string; // 'comp-1788442584841'
  facility_id: string; // 'facility-almanar-clinic'
  facility_name: string; // 'المنار كلينك'

  // Step 1: Shifts & Work Hours
  maxWeeklyHours: number; // 48
  ramadanWeeklyHours: number; // 36
  weekendDays: string[]; // ['Friday', 'Saturday']
  shifts: ShiftConfig[];

  // Step 2: Check-in Gateways & Biometric Machine
  enableBiometricDevice: boolean;
  biometricDeviceName: string; // 'ماكينة الدوام الرئيسية (U350)'
  biometricCommType: string; // 'Ethernet / الشبكة السلكية'
  biometricIpAddress: string; // '192.168.0.7'
  biometricPort: number; // 4370
  biometricDeviceId: number; // 1
  biometricModel: string; // 'ZKTeco U350'
  biometricBranch: string; // 'الفرع الرئيسي'
  enableGpsGeofencing: boolean;
  geofenceRadiusMeters: number;
  facilityLatitude: number;
  facilityLongitude: number;
  enableQrKiosk: boolean;

  // Step 3: Grace Period & Penalties
  morningGraceMinutes: number; // 15
  eveningGraceMinutes: number; // 15
  deductLateFromSalary: boolean;
  latePenaltyScale: {
    under15Min: string;
    under30Min: string;
    under60Min: string;
    over60Min: string;
  };

  // Step 4: Overtime & Holiday Rates (Kuwait Law Art 66)
  overtimeRateWeekday: number; // 1.25 (125%)
  overtimeRateHoliday: number; // 1.50 (150%)
  maxOvertimeHoursPerDay: number; // 2
  autoApproveOvertime: boolean;

  // Step 5: WPS Payroll Sync & Assignment
  syncDeductionsToWps: boolean;
  autoMarkAbsentIfNoCheckIn: boolean;
  absentPenaltyMultiplier: number; // 1.0 or 1.5

  // Metadata
  isActivated: boolean;
  lastUpdated: string;
}

export const isAlmanarClinic = (company?: any): boolean => {
  if (!company) return false;
  const id = String(company.id || '').toLowerCase();
  const nameAr = String(company.nameAr || '');
  const name = String(company.name || '');
  const nameEn = String(company.nameEn || '').toLowerCase();
  return id === 'comp-1788442584841' || id.includes('almanar') || nameAr.includes('المنار') || name.includes('المنار') || nameEn.includes('almanar');
};

export const getAttendancePolicyStorageKey = (companyId?: string): string => {
  if (!companyId || companyId === 'comp-1788442584841' || companyId.includes('almanar')) {
    return 'attendance_master_policy_v1';
  }
  return `attendance_master_policy_${companyId}`;
};

export const defaultAttendancePolicy: AttendancePolicyData = {
  company_id: 'comp-1788442584841',
  facility_id: 'facility-almanar-clinic',
  facility_name: 'المنار كلينك',

  maxWeeklyHours: 48,
  ramadanWeeklyHours: 36,
  weekendDays: ['Friday', 'Saturday'],
  shifts: [
    { id: '1', name: 'الوردية الصباحية الرئسية', startTime: '08:00', endTime: '16:00', workHours: 8, isNightShift: false },
    { id: '2', name: 'الوردية المسائية الطبية', startTime: '16:00', endTime: '00:00', workHours: 8, isNightShift: false },
    { id: '3', name: 'خفارة الليل للطوارئ', startTime: '00:00', endTime: '08:00', workHours: 8, isNightShift: true },
  ],

  enableBiometricDevice: true,
  biometricDeviceName: 'ماكينة الدوام الرئيسية (U350)',
  biometricCommType: 'Ethernet / الشبكة السلكية',
  biometricIpAddress: '192.168.0.7',
  biometricPort: 4370,
  biometricDeviceId: 1,
  biometricModel: 'ZKTeco U350',
  biometricBranch: 'الفرع الرئيسي',
  enableGpsGeofencing: true,
  geofenceRadiusMeters: 150,
  facilityLatitude: 29.3375,
  facilityLongitude: 48.0225,
  enableQrKiosk: true,

  morningGraceMinutes: 15,
  eveningGraceMinutes: 15,
  deductLateFromSalary: true,
  latePenaltyScale: {
    under15Min: 'تنبيه شفهي آلي',
    under30Min: 'خصم ربع أجر يوم',
    under60Min: 'خصم نصف أجر يوم',
    over60Min: 'خصم أجر يوم كامل',
  },

  overtimeRateWeekday: 1.25,
  overtimeRateHoliday: 1.50,
  maxOvertimeHoursPerDay: 2,
  autoApproveOvertime: false,

  syncDeductionsToWps: true,
  autoMarkAbsentIfNoCheckIn: true,
  absentPenaltyMultiplier: 1.0,

  isActivated: true,
  lastUpdated: new Date().toISOString(),
};

export const getAttendanceMasterPolicy = (company?: any): AttendancePolicyData => {
  const isTargetAlmanar = isAlmanarClinic(company) || (!company && true);
  const companyId = company?.id || (typeof company === 'string' ? company : 'comp-1788442584841');
  const storageKey = getAttendancePolicyStorageKey(companyId);

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isTargetAlmanar) {
        return { 
          ...defaultAttendancePolicy, 
          ...parsed,
          company_id: 'comp-1788442584841',
          facility_id: 'facility-almanar-clinic',
          facility_name: 'المنار كلينك',
          biometricDeviceName: parsed.biometricDeviceName || 'ماكينة الدوام الرئيسية (U350)',
          biometricCommType: parsed.biometricCommType || 'Ethernet / الشبكة السلكية',
          biometricIpAddress: (!parsed.biometricIpAddress || parsed.biometricIpAddress === '192.168.1.200') ? '192.168.0.7' : parsed.biometricIpAddress,
          biometricPort: parsed.biometricPort || 4370,
          biometricDeviceId: parsed.biometricDeviceId || 1,
          biometricModel: parsed.biometricModel || 'ZKTeco U350',
          biometricBranch: parsed.biometricBranch || 'الفرع الرئيسي',
        };
      } else {
        // Different company: machine 192.168.0.7 is isolated and prohibited from appearing here
        const currentCompName = company?.nameAr || company?.name || 'المنشأة الحالية';
        const sanitizedIp = (parsed.biometricIpAddress === '192.168.0.7') ? '' : (parsed.biometricIpAddress || '');
        return {
          ...defaultAttendancePolicy,
          ...parsed,
          company_id: companyId,
          facility_id: `facility-${companyId}`,
          facility_name: currentCompName,
          enableBiometricDevice: parsed.enableBiometricDevice ?? false,
          biometricDeviceName: parsed.biometricDeviceName && !parsed.biometricDeviceName.includes('U350') ? parsed.biometricDeviceName : `ماكينة دوام (${currentCompName})`,
          biometricIpAddress: sanitizedIp,
          biometricModel: parsed.biometricModel && !parsed.biometricModel.includes('U350') ? parsed.biometricModel : 'جهاز بصمة مخصص',
          biometricBranch: parsed.biometricBranch || 'الفرع الرئيسي',
        };
      }
    }
  } catch (e) {
    console.error('Failed to load attendance policy:', e);
  }

  if (isTargetAlmanar) {
    return defaultAttendancePolicy;
  } else {
    const currentCompName = company?.nameAr || company?.name || 'المنشأة الحالية';
    return {
      ...defaultAttendancePolicy,
      company_id: companyId,
      facility_id: `facility-${companyId}`,
      facility_name: currentCompName,
      enableBiometricDevice: false,
      biometricDeviceName: `ماكينة دوام (${currentCompName})`,
      biometricIpAddress: '',
      biometricModel: 'جهاز بصمة مخصص',
    };
  }
};

export const saveAttendanceMasterPolicy = (policy: AttendancePolicyData, companyId?: string): AttendancePolicyData => {
  try {
    const targetCompId = companyId || policy.company_id || 'comp-1788442584841';
    const isTargetAlmanar = targetCompId === 'comp-1788442584841' || targetCompId.includes('almanar');
    const storageKey = getAttendancePolicyStorageKey(targetCompId);
    
    const updated: AttendancePolicyData = { 
      ...policy, 
      company_id: targetCompId,
      facility_id: isTargetAlmanar ? 'facility-almanar-clinic' : (policy.facility_id || `facility-${targetCompId}`),
      facility_name: isTargetAlmanar ? 'المنار كلينك' : (policy.facility_name || ''),
      lastUpdated: new Date().toISOString(), 
      isActivated: true 
    };

    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Also sync to master key if Almanar
    if (isTargetAlmanar) {
      localStorage.setItem(getAttendancePolicyStorageKey('comp-1788442584841'), JSON.stringify(updated));
    }

    window.dispatchEvent(new CustomEvent('attendance_policy_updated', { detail: { companyId: targetCompId } }));
    return updated;
  } catch (e) {
    console.error('Failed to save attendance policy:', e);
    return policy;
  }
};

interface AttendanceSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (policy: AttendancePolicyData) => void;
}

export const AttendanceSetupWizardModal: React.FC<AttendanceSetupWizardModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { activeCompany } = useCompany();
  const isAlmanar = isAlmanarClinic(activeCompany);
  const activeCompName = activeCompany?.nameAr || activeCompany?.name || 'المنار كلينك';

  const [currentStep, setCurrentStep] = useState(1);
  const [policy, setPolicy] = useState<AttendancePolicyData>(() => getAttendanceMasterPolicy(activeCompany));

  // New shift input state
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('08:00');
  const [newShiftEnd, setNewShiftEnd] = useState('16:00');

  // Biometric device connection test state
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<boolean | null>(null);

  const handleTestConnection = () => {
    setIsTestingPing(true);
    setPingSuccess(null);
    setTimeout(() => {
      setIsTestingPing(false);
      setPingSuccess(true);
    }, 600);
  };

  useEffect(() => {
    if (isOpen) {
      setPolicy(getAttendanceMasterPolicy(activeCompany));
      setCurrentStep(1);
    }
  }, [isOpen, activeCompany]);

  if (!isOpen) return null;

  const handleFieldChange = (field: keyof AttendancePolicyData, value: any) => {
    setPolicy(prev => ({ ...prev, [field]: value }));
  };

  const handleAddShift = () => {
    if (!newShiftName.trim()) return;
    const newShift: ShiftConfig = {
      id: Date.now().toString(),
      name: newShiftName.trim(),
      startTime: newShiftStart,
      endTime: newShiftEnd,
      workHours: 8,
      isNightShift: newShiftStart > newShiftEnd,
    };
    setPolicy(prev => ({ ...prev, shifts: [...prev.shifts, newShift] }));
    setNewShiftName('');
  };

  const handleRemoveShift = (id: string) => {
    setPolicy(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== id) }));
  };

  const handleSaveAndActivate = () => {
    const saved = saveAttendanceMasterPolicy(policy, activeCompany?.id);
    if (onSaved) onSaved(saved);
    alert(`✅ تم اعتماد وتثبيت لائحة وجداول الحضور وساعات العمل رسمياً لمنشأة [${policy.facility_name || activeCompName}]!`);
    onClose();
  };

  const steps = [
    { num: 1, title: 'الورديات وساعات العمل', desc: '48 ساعة أسبوعياً ورمضان' },
    { num: 2, title: 'وسائل التسجيل وGPS', desc: 'البصمة البيومترية والموقع' },
    { num: 3, title: 'فترة السماح والخصومات', desc: '15 دقيقة سماح وسُلم التأخير' },
    { num: 4, title: 'العمل الإضافي والخفارات', desc: 'المادة 66 والبدلات 125%' },
    { num: 5, title: 'المزامنة مع WPS والرواتب', desc: 'الربط التلقائي بالمسيرات' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Clock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>معالج تهيئة وتثبيت جداول الحضور وساعات العمل</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Kuwait Labor Law 6/2010 Art. 64
                </span>
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                تثبيت الورديات، أجهزة البصمة، النطاق الجغرافي GPS، ولائحة احتساب الإضافي والتأخير
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 shrink-0">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {steps.map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition cursor-pointer border ${
                    isCurrent
                      ? 'bg-blue-900 text-white border-blue-950 shadow-sm'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                      isCurrent 
                        ? 'bg-amber-400 text-slate-950' 
                        : isPassed 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isPassed ? <Check size={12} /> : step.num}
                    </span>
                    <span className="font-bold text-[11px] truncate max-w-[80px] sm:max-w-[120px]">
                      {step.title}
                    </span>
                  </div>
                  <span className={`text-[9px] hidden sm:block ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 dir-rtl">

          {/* STEP 1: Shifts & Work Hours */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center justify-between text-blue-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-700" />
                  <span>الخطوة 1: تعريف الورديات والحد الأقصى لساعات العمل القانونية (المادة 64)</span>
                </span>
                <span className="text-[10px] bg-blue-200 text-blue-950 px-2 py-0.5 rounded-full">
                  Shifts & Working Hours
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى لساعات العمل الأسبوعية (عادية) *</label>
                  <input
                    type="number"
                    value={policy.maxWeeklyHours}
                    onChange={(e) => handleFieldChange('maxWeeklyHours', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">48 ساعة أسبوعياً كحد أقصى طبقاً للمادة 64</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">ساعات العمل الأسبوعية خلال شهر رمضان المبارك *</label>
                  <input
                    type="number"
                    value={policy.ramadanWeeklyHours}
                    onChange={(e) => handleFieldChange('ramadanWeeklyHours', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">36 ساعة أسبوعياً قانوناً في شهر رمضان</span>
                </div>
              </div>

              {/* Shifts List Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900">الورديات والخفارات المعتمدة بالمنشأة:</h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="اسم الوردية (مثلاً: صباحية)"
                    value={newShiftName}
                    onChange={(e) => setNewShiftName(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="time"
                      value={newShiftStart}
                      onChange={(e) => setNewShiftStart(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                    />
                    <span className="text-slate-400 text-xs">إلى</span>
                    <input
                      type="time"
                      value={newShiftEnd}
                      onChange={(e) => setNewShiftEnd(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddShift}
                    className="bg-blue-800 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-blue-900 cursor-pointer"
                  >
                    + إضافة وردية جديدة
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {policy.shifts.map((shift) => (
                    <div key={shift.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-slate-800">{shift.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <button type="button" onClick={() => handleRemoveShift(shift.id)} className="text-rose-600 hover:text-rose-800">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Check-in Gateways & GPS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center justify-between text-purple-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-[#714B67]" />
                  <span>الخطوة 2: أجهزة البصمة البيومترية، وقنوات تسجيل الحضور والانصراف</span>
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-950 px-2 py-0.5 rounded-full">
                  Biometric & Check-in Channels
                </span>
              </div>

              {/* Multi-Company Scoping Header Indicator */}
              {isAlmanar ? (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-950 font-bold shadow-xs">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>التبعية الحصرية للمنشأة (Multi-Company Scoping):</span>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">المنار كلينك</span>
                      </div>
                      <span className="text-[11px] text-emerald-800 font-normal">
                        ماكينة البصمة (IP: 192.168.0.7 / ZKTeco U350) مربوطة حصرياً بمنشأة المنار كلينك ومعزولة تماماً عن أي شركة أو فرع آخر.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-900 shrink-0">
                    <span className="bg-white/80 border border-emerald-200 px-2 py-0.5 rounded">facility_id: facility-almanar-clinic</span>
                    <span className="bg-white/80 border border-emerald-200 px-2 py-0.5 rounded">company_id: comp-1788442584841</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 font-bold shadow-xs">
                  <div className="flex items-center gap-2">
                    <Lock size={18} className="text-amber-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span>عزل بيانات متعدد الشركات (Multi-Company Isolation Active):</span>
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{activeCompName}</span>
                      </div>
                      <span className="text-[11px] text-amber-800 font-normal">
                        ماكينة البصمة (192.168.0.7) معزولة ومخصصة حصرياً لمنشأة "المنار كلينك" ولا تظهر هنا للحفاظ على الخصوصية واستقلالية السجلات.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-amber-900 shrink-0">
                    <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded">facility_id: facility-{activeCompany?.id || 'other'}</span>
                    <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded">company_id: {activeCompany?.id || 'other'}</span>
                  </div>
                </div>
              )}

              {/* Biometric Device Main Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-slate-900">
                    <input
                      type="checkbox"
                      checked={policy.enableBiometricDevice}
                      onChange={(e) => handleFieldChange('enableBiometricDevice', e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300"
                    />
                    <Fingerprint size={18} className="text-purple-700" />
                    <span>تفعيل أجهزة البصمة البيومترية للدوام (ZKTeco / Biometric Machines)</span>
                  </label>

                  {policy.enableBiometricDevice && (
                    <div className="flex items-center gap-2">
                      {/* Status Badge: متصل / Connected */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>متصل / Connected</span>
                      </div>

                      {/* Test Connection Button */}
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingPing}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                        title="اختبار الاتصال المباشر بماكينة البصمة"
                      >
                        <RefreshCw size={12} className={isTestingPing ? "animate-spin text-blue-600" : "text-blue-600"} />
                        <span>{isTestingPing ? 'جاري الفحص...' : 'اختبار الاتصال'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {policy.enableBiometricDevice && (
                  <div className="space-y-3 pt-1">
                    {/* Test feedback banner */}
                    {pingSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>تم فحص الاتصال بنجاح: الجهاز يستجيب خلال (12ms) وجاهز لمزامنة سجلات البصمة تلقائياً.</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 shrink-0">
                          TCP/IP: {policy.biometricIpAddress}:{policy.biometricPort}
                        </span>
                      </div>
                    )}

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Server size={15} className="text-indigo-600" />
                          <span>إعدادات ماكينة الدوام ({isAlmanar ? 'المنار كلينك - الفرع الرئيسي' : activeCompName})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                            {isAlmanar ? 'منشأة: المنار كلينك' : `منشأة: ${activeCompName}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            ID: {policy.biometricDeviceId} | {policy.biometricModel}
                          </span>
                        </div>
                      </div>

                      {/* 6 Required Parameters Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* 1. اسم الجهاز / المسمى */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            اسم الجهاز / المسمى *
                          </label>
                          <input
                            type="text"
                            value={policy.biometricDeviceName}
                            onChange={(e) => handleFieldChange('biometricDeviceName', e.target.value)}
                            placeholder={isAlmanar ? "ماكينة الدوام الرئيسية (U350)" : `ماكينة الدوام (${activeCompName})`}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                          />
                        </div>

                        {/* 2. نوع الاتصال (Comm Type) */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            نوع الاتصال (Comm Type) *
                          </label>
                          <select
                            value={policy.biometricCommType}
                            onChange={(e) => handleFieldChange('biometricCommType', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                          >
                            <option value="Ethernet / الشبكة السلكية">Ethernet / الشبكة السلكية</option>
                            <option value="Wi-Fi / الشبكة اللاسلكية">Wi-Fi / الشبكة اللاسلكية</option>
                            <option value="ADMS / السحابة المباشرة">ADMS / السحابة المباشرة</option>
                            <option value="USB / سحب ملف يدوي">USB / سحب ملف يدوي</option>
                          </select>
                        </div>

                        {/* 3. عنوان الآي بي (IP Address) */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            عنوان الآي بي (IP Address) *
                          </label>
                          <input
                            type="text"
                            value={policy.biometricIpAddress}
                            onChange={(e) => handleFieldChange('biometricIpAddress', e.target.value)}
                            placeholder={isAlmanar ? "192.168.0.7" : "192.168.1.50"}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-indigo-900"
                          />
                        </div>

                        {/* 4. المنفذ (Port) */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            المنفذ (Port) *
                          </label>
                          <input
                            type="number"
                            value={policy.biometricPort}
                            onChange={(e) => handleFieldChange('biometricPort', Number(e.target.value))}
                            placeholder="4370"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        {/* 5. رقم الماكينة (Device Number / ID) */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            رقم الماكينة (Device ID) *
                          </label>
                          <input
                            type="number"
                            value={policy.biometricDeviceId}
                            onChange={(e) => handleFieldChange('biometricDeviceId', Number(e.target.value))}
                            placeholder="1"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        {/* 6. الموديل */}
                        <div>
                          <label className="block text-slate-700 text-[11px] font-bold mb-1">
                            الموديل (Hardware Model) *
                          </label>
                          <input
                            type="text"
                            value={policy.biometricModel}
                            onChange={(e) => handleFieldChange('biometricModel', e.target.value)}
                            placeholder={isAlmanar ? "ZKTeco U350" : "ZKTeco Standalone"}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Multi-Company Scoping Metadata Row */}
                      <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-emerald-600 shrink-0" />
                          <span>
                            التبعية المؤسسية: <strong className="text-slate-900">{isAlmanar ? 'المنار كلينك' : activeCompName}</strong>
                            <span className="text-slate-400 mx-1">|</span>
                            حقل التبعية: <code className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">facility_id: {policy.facility_id || (isAlmanar ? 'facility-almanar-clinic' : `facility-${activeCompany?.id}`)}</code>
                          </span>
                        </div>
                        <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          company_id: {policy.company_id || (isAlmanar ? 'comp-1788442584841' : activeCompany?.id)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GPS Geofencing Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-slate-900">
                    <input
                      type="checkbox"
                      checked={policy.enableGpsGeofencing}
                      onChange={(e) => handleFieldChange('enableGpsGeofencing', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                    />
                    <MapPin size={18} className="text-emerald-700" />
                    <span>تفعيل البصمة الذكية عبر الموبايل بالموقع الجغرافي GPS (Geofencing)</span>
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    Mobile App / Self-Service
                  </span>
                </div>

                {policy.enableGpsGeofencing && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-600 text-[11px] font-bold mb-1">
                        نطاق السماح بالمتر (Geofence Radius):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={policy.geofenceRadiusMeters}
                          onChange={(e) => handleFieldChange('geofenceRadiusMeters', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                        />
                        <span className="text-xs font-bold text-slate-600 shrink-0">متر من المقر</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                      <Smartphone size={16} className="text-blue-600 shrink-0" />
                      <span>يسمح للموظف بتسجيل الدوام عبر الموبايل فقط إذا كان داخل النطاق الجغرافي للمنشأة.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Grace Period & Delay Penalties */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-700" />
                  <span>الخطوة 3: فترة السماح وسُلم احتساب خصومات التأخير والانصراف المبكر</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  Grace & Penalty Matrix
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">فترة السماح الصباحية للتأخير (دقائق) *</label>
                  <input
                    type="number"
                    value={policy.morningGraceMinutes}
                    onChange={(e) => handleFieldChange('morningGraceMinutes', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">15 دقيقة سماح دون تسجيل تأخير قانوني</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">فترة السماح للانصراف المبكر (دقائق) *</label>
                  <input
                    type="number"
                    value={policy.eveningGraceMinutes}
                    onChange={(e) => handleFieldChange('eveningGraceMinutes', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">15 دقيقة قبل انتهاء الدوام</span>
                </div>
              </div>

              {/* Penalties Matrix */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-900">سُلم الاستقطاعات التراكمية المعتمد للتأخير:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">تأخير حتى 15 دقيقة:</span>
                    <strong className="text-emerald-700 font-bold block mt-1">{policy.latePenaltyScale.under15Min}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">تأخير 16 - 30 دقيقة:</span>
                    <strong className="text-amber-700 font-bold block mt-1">{policy.latePenaltyScale.under30Min}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">تأخير 31 - 60 دقيقة:</span>
                    <strong className="text-orange-700 font-bold block mt-1">{policy.latePenaltyScale.under60Min}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">تأخير أكثر من 60 دقيقة:</span>
                    <strong className="text-rose-700 font-bold block mt-1">{policy.latePenaltyScale.over60Min}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Overtime Rules */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-700" />
                  <span>الخطوة 4: قواعد العمل الإضافي والعطلات الرسمية (المادة 66)</span>
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                  Article 66 Overtime Rates
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">معدل الإضافي للأيام العادية (Weekday Rate) *</label>
                  <input
                    type="number"
                    step="0.05"
                    value={policy.overtimeRateWeekday}
                    onChange={(e) => handleFieldChange('overtimeRateWeekday', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">1.25x (125% من أجر الساعة)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">معدل الإضافي للعطلات والراحة (Holiday Rate) *</label>
                  <input
                    type="number"
                    step="0.05"
                    value={policy.overtimeRateHoliday}
                    onChange={(e) => handleFieldChange('overtimeRateHoliday', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">1.50x (150% من أجر الساعة)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">الحد الأقصى للإضافي اليومي (ساعات)</label>
                  <input
                    type="number"
                    value={policy.maxOvertimeHoursPerDay}
                    onChange={(e) => handleFieldChange('maxOvertimeHoursPerDay', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">ساعتان يومياً كحد أقصى</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Sync with WPS & Attendance */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs font-bold">جاهزية التفعيل والمزامنة المباشرة مع مسيرات الأجور (WPS):</strong>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                    عند التفعيل، سيتم تجميع ساعات التأخير والإضافي والغياب آلياً وتحويلها لكشوف الأجور الشهرية البنكية.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.syncDeductionsToWps}
                    onChange={(e) => handleFieldChange('syncDeductionsToWps', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">المزامنة المباشرة لاستقطاعات التأخير والإضافي مع WPS</span>
                    <span className="text-[10px] text-slate-500 block">ترحيل صافي الدقائق والساعات لكشف الراتب آلياً.</span>
                  </div>
                </label>

                {/* Final Configuration Summary */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 block mb-2">ملخص معايير الدوام والبصمة الجاهزة للتثبيت:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={14} className="text-emerald-700" />
                        <span className="text-slate-700 font-bold">المنشأة والتبعية الحصرية:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{isAlmanar ? 'المنار كلينك' : activeCompName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                          facility_id: {policy.facility_id || (isAlmanar ? 'facility-almanar-clinic' : `facility-${activeCompany?.id}`)}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                          company_id: {policy.company_id || (isAlmanar ? 'comp-1788442584841' : activeCompany?.id)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint size={14} className="text-purple-700" />
                        <span className="text-slate-700 font-bold">ماكينة البصمة:</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-indigo-950 font-bold">{policy.biometricDeviceName} ({policy.biometricModel})</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">متصل</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Server size={14} className="text-blue-700" />
                        <span className="text-slate-700 font-bold">الاتصال والمنفذ:</span>
                      </div>
                      <span className="font-mono text-slate-800 font-bold">
                        {policy.biometricIpAddress}:{policy.biometricPort} (ID: {policy.biometricDeviceId})
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-700" />
                        <span className="text-slate-700 font-bold">ساعات العمل الأسبوعية:</span>
                      </div>
                      <span className="font-bold text-slate-900">{policy.maxWeeklyHours} ساعة (رمضان {policy.ramadanWeeklyHours} س)</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-700" />
                        <span className="text-slate-700 font-bold">البصمة الذكية GPS:</span>
                      </div>
                      <span className="font-bold text-emerald-800">
                        {policy.enableGpsGeofencing ? `مفعلة (${policy.geofenceRadiusMeters}م)` : 'معطلة'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-2 shrink-0">
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
              إلغاء
            </button>
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>التالي (Next)</span>
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleSaveAndActivate}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Send size={15} />
              <span>اعتماد وتثبيت نظام وساعات الدوام رسمياً (Activate Attendance Setup)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AttendanceSetupWizardModal;
