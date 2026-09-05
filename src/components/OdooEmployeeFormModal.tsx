import React, { useState } from 'react';
import { parseKuwaitCivilCardOCR, validateKuwaitCivilId } from '../services/ocrService';

// 1. الأقسام والإدارات (عربي / إنجليزي)
const DEPARTMENTS = [
  { id: 'MED', ar: 'الكادر الطبي (الأطباء)', en: 'Medical Staff (Doctors)' },
  { id: 'NUR', ar: 'الهيئة التمريضية والتعقيم', en: 'Nursing & Sterilization Staff' },
  { id: 'LAB_LSR', ar: 'الفنيين والمختبرات والليزر', en: 'Laser & Laboratory Technicians' },
  { id: 'REC_CS', ar: 'الاستقبال وتجربة المرضى', en: 'Reception & Patient Experience' },
  { id: 'HR_ADM', ar: 'الموارد البشرية والشؤون الإدارية', en: 'HR & Administration' },
  { id: 'MGMT_FIN', ar: 'الإدارة العليا والمالية', en: 'Executive Management & Finance' },
  { id: 'LOG_SEC', ar: 'الخدمات العامة والأمن والسلامة', en: 'General Services & Logistics' }
];

// 2. المسميات الوظيفية المعتمدة وفق وزارة الصحة وشؤون الكويت (عربي / إنجليزي)
const JOB_POSITIONS: Record<string, Array<{ ar: string; en: string }>> = {
  'الكادر الطبي (الأطباء)': [
    { ar: 'طبيب استشاري - جلدية وتجميل', en: 'Consultant - Dermatology & Cosmetology' },
    { ar: 'طبيب اختصاصي - طب وجراحة العيون', en: 'Specialist - Ophthalmology & Eye Surgery' },
    { ar: 'طبيب اختصاصي - جراحة تجميل', en: 'Specialist - Plastic Surgery' },
    { ar: 'طبيب ممارس عام', en: 'General Practitioner (GP)' },
    { ar: 'طبيب أسنان عام', en: 'General Dental Practitioner' }
  ],
  'الهيئة التمريضية والتعقيم': [
    { ar: 'رئيسة هيئة التمريض', en: 'Head of Nursing Staff' },
    { ar: 'ممرض / ممرضة عامة', en: 'General Staff Nurse' },
    { ar: 'ممرض عمليات وتخدير', en: 'Surgical & Anesthesia Nurse' },
    { ar: 'فني تعقيم أجهزة طبية', en: 'CSSD Sterilization Technician' }
  ],
  'الفنيين والمختبرات والليزر': [
    { ar: 'أخصائي / فني علاج بالليزر', en: 'Laser Treatment Specialist/Technician' },
    { ar: 'فني مختبرات وتحاليل طبية', en: 'Medical Laboratory Technician' },
    { ar: 'أخصائي تغذية علاجية', en: 'Clinical Dietitian' },
    { ar: 'فني صيانة أجهزة طبية وليزر', en: 'Biomedical & Laser Equipment Technician' }
  ],
  'الاستقبال وتجربة المرضى': [
    { ar: 'مسؤول استقبال ومواعيد', en: 'Reception & Appointment Officer' },
    { ar: 'منسق علاقات مرضى وتأمين طبي', en: 'Patient Relations & Insurance Coordinator' },
    { ar: 'مسؤول مركز الاتصال والخدمة', en: 'Call Center Representative' }
  ],
  'الموارد البشرية والشؤون الإدارية': [
    { ar: 'مدير الموارد البشرية والشؤون الإدارية', en: 'HR & Administrative Director' },
    { ar: 'أخصائي شؤون عاملين ورواتب (WPS)', en: 'Personnel & WPS Payroll Specialist' },
    { ar: 'مندوب شؤون وجوازات (علاقات حكومية PAM)', en: 'PRO / Government Relations Officer' }
  ],
  'الإدارة العليا والمالية': [
    { ar: 'المدير التنفيذي (CEO)', en: 'Chief Executive Officer (CEO)' },
    { ar: 'المدير المالي (CFO)', en: 'Chief Financial Officer (CFO)' },
    { ar: 'محاسب عام أول', en: 'Senior General Accountant' }
  ],
  'الخدمات العامة والأمن والسلامة': [
    { ar: 'مشرف أمن وسلامة ولوجستيات', en: 'Security & Safety Supervisor' },
    { ar: 'سائق ومندوب خدمات لوجستية', en: 'Logistics Driver & Dispatcher' }
  ]
};

// 3. الجنسيات (عربي / إنجليزي)
const NATIONALITIES = [
  { ar: 'كويتي', en: 'Kuwaiti' },
  { ar: 'سعودي', en: 'Saudi' },
  { ar: 'إماراتي', en: 'Emirati' },
  { ar: 'بحريني', en: 'Bahraini' },
  { ar: 'قطري', en: 'Qatari' },
  { ar: 'عماني', en: 'Omani' },
  { ar: 'مصري', en: 'Egyptian' },
  { ar: 'أردني', en: 'Jordanian' },
  { ar: 'لبناني', en: 'Lebanese' },
  { ar: 'سوري', en: 'Syrian' },
  { ar: 'هندي', en: 'Indian' },
  { ar: 'فلبيني', en: 'Filipino' },
  { ar: 'تونسي', en: 'Tunisian' }
];

// 4. البنوك الكويتية المعتمدة
const KUWAIT_BANKS = [
  { code: 'NBK', ar: 'بنك الكويت الوطني', en: 'National Bank of Kuwait (NBK)' },
  { code: 'KFH', ar: 'بيت التمويل الكويتي', en: 'Kuwait Finance House (KFH)' },
  { code: 'BOUBYAN', ar: 'بنك بوبيان', en: 'Boubyan Bank' },
  { code: 'GBK', ar: 'بنك الخليج', en: 'Gulf Bank (GBK)' },
  { code: 'CBK', ar: 'البنك التجاري الكويتي', en: 'Commercial Bank of Kuwait (CBK)' },
  { code: 'BURGAN', ar: 'بنك برقان', en: 'Burgan Bank' },
  { code: 'ABK', ar: 'البنك الأهلي الكويتي', en: 'Al Ahli Bank of Kuwait (ABK)' },
  { code: 'WARBA', ar: 'بنك وربة', en: 'Warba Bank' }
];

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeData: any) => void;
  existingEmployees?: any[];
  activeCompanyId?: string;
}

export default function OdooEmployeeFormModal({ isOpen, onClose, onSave, existingEmployees = [], activeCompanyId }: EmployeeModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'private' | 'hr' | 'resume' | 'warnings'>('work');

  // البيانات العامة
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedDeptAr, setSelectedDeptAr] = useState(DEPARTMENTS[0].ar);
  const [selectedJob, setSelectedJob] = useState(JOB_POSITIONS[DEPARTMENTS[0].ar][0]);
  const [workEmail, setWorkEmail] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [manager, setManager] = useState('');
  const [workLocation, setWorkLocation] = useState('الفرع الرئيسي');
  const [hireDate, setHireDate] = useState('');

  // البيانات الشخصية والإقامة
  const [civilId, setCivilId] = useState('');
  const [badgeId, setBadgeId] = useState(''); // رقم كود البصمة
  const [civilIdData, setCivilIdData] = useState<{
    serialNo?: string;
    birthDate?: string;
    expiryDate?: string;
    cardVersion?: string;
    sex?: string;
  }>({
    serialNo: '928374102',
    birthDate: '1990-05-14',
    expiryDate: '2031-08-20',
    cardVersion: '02',
    sex: 'ذكر'
  });
  const [passportNo, setPassportNo] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [nationality, setNationality] = useState('كويتي - Kuwaiti');
  const [gender, setGender] = useState('ذكر - Male');
  const [maritalStatus, setMaritalStatus] = useState('أعزب - Single');
  const [residencyType, setResidencyType] = useState('إقامة مادة 18 (أهلي) - Article 18 Visa');
  const [residencyExpiry, setResidencyExpiry] = useState('');
  const [bankName, setBankName] = useState(KUWAIT_BANKS[0].ar);
  const [iban, setIban] = useState('');
  const [dependents, setDependents] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // التراخيص الطبية والموارد البشرية
  const [mohLicense, setMohLicense] = useState('');
  const [mohLicenseExpiry, setMohLicenseExpiry] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [employeeType, setEmployeeType] = useState('employee');
  const [relatedUser, setRelatedUser] = useState('');
  const [pinCode, setPinCode] = useState('');

  if (!isOpen) return null;

  const handleDeptChange = (deptAr: string) => {
    setSelectedDeptAr(deptAr);
    if (JOB_POSITIONS[deptAr] && JOB_POSITIONS[deptAr].length > 0) {
      setSelectedJob(JOB_POSITIONS[deptAr][0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !civilId) {
      alert('يرجى ملء الحقول الإلزامية: الاسم والرقم المدني');
      return;
    }

    const cleanCivilId = (civilId || '').trim();
    if (existingEmployees && existingEmployees.length > 0 && cleanCivilId) {
      const compId = activeCompanyId || 'comp-super-admin';
      const isDuplicate = existingEmployees.some(emp => 
        (emp.companyId === compId || compId === 'comp-super-admin') && 
        ((emp.civil_id_number && emp.civil_id_number.trim() === cleanCivilId) ||
         (emp.civilId && emp.civilId.trim() === cleanCivilId) ||
         (emp.civil_id && emp.civil_id.trim() === cleanCivilId))
      );
      if (isDuplicate) {
        alert('خطأ: الموظف مسجل بالفعل! الرقم المدني مكرر في هذه الشركة.');
        return;
      }
    }

    const payload = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      companyId: activeCompanyId || 'comp-super-admin',
      civilId: cleanCivilId,
      civil_id_number: cleanCivilId,
      createdAt: new Date().toISOString(),
      badgeId,
      nameAr,
      nameEn: nameEn || nameAr,
      fullNameAr: nameAr,
      fullNameEn: nameEn || nameAr,
      dept: selectedDeptAr,
      department: selectedDeptAr,
      jobTitle: selectedJob.ar,
      jobPositionAr: selectedJob.ar,
      jobPositionEn: selectedJob.en,
      workEmail,
      phone: workPhone || '+965 9',
      manager,
      workLocation,
      passportNo,
      passportExpiry,
      nationality,
      gender,
      maritalStatus,
      dependents,
      residencyType,
      residencyExpiry,
      bankName,
      iban,
      mohLicense,
      mohLicenseExpiry,
      qualification,
      specialty,
      bloodType,
      employeeType,
      relatedUser,
      pinCode,
      status: 'على رأس العمل',
      hireDate: hireDate || new Date().toISOString().slice(0, 10),
      basicSalary: 850,
      allowances: 150,
      avatarColor: 'bg-emerald-600',
      chatter: [
        { id: 1, user: 'مدير الموارد البشرية', date: new Date().toISOString().split('T')[0], text: 'تم إنشاء بطاقة الموظف الرسمية في النظام بنجاح وتعيينه على القسم والمسمى الوظيفي المعتمد.' }
      ]
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* 1. Header (Odoo Form Title) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 font-bold text-sm">الموظفون (Employees) /</span>
            <span className="text-slate-500 font-semibold text-sm">تسجيل موظف جديد (New)</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold transition px-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
          
          {/* 2. Top Sheet */}
          <div className="flex flex-col md:flex-row gap-6 items-start pb-4 border-b border-slate-100">
            <div className="w-20 h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-purple-600 transition cursor-pointer shrink-0">
              <span className="text-2xl">📷</span>
              <span className="text-[10px] mt-1 font-semibold">الصورة Photo</span>
            </div>

            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الاسم الكامل (بالعربي) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={nameAr} 
                  onChange={(e) => setNameAr(e.target.value)} 
                  placeholder="الاسم الرباعي الكامل للموظف"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name (English)</label>
                <input 
                  type="text" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)} 
                  placeholder="e.g. Dr. Ahmed Al-Kandari"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">الرقم المدني الكويتي (Civil ID) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={civilId} 
                    onChange={(e) => setCivilId(e.target.value)} 
                    placeholder="290010112345"
                    maxLength={12}
                    className={`w-full bg-white border rounded-lg p-2 focus:ring-2 focus:outline-none font-mono font-bold text-slate-800 ${
                      civilId.length > 0 && !validateKuwaitCivilId(civilId)
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-purple-600'
                    }`}
                    required
                  />
                  {civilId.length > 0 && !validateKuwaitCivilId(civilId) && (
                    <span className="absolute left-2 top-2.5 text-[10px] text-rose-500 font-bold">غير صالح (Invalid)</span>
                  )}
                  {civilId.length === 12 && validateKuwaitCivilId(civilId) && (
                    <span className="absolute left-2 top-2.5 text-[10px] text-emerald-600 font-bold">صالح ✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Notebook Tabs */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto whitespace-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab('work')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'work' 
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              معلومات العمل (Work Information)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('private')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'private'
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              المعلومات الخاصة / الشخصية (Private Information)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hr')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'hr'
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              إعدادات الموارد البشرية (HR Settings)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resume')}
              className={`pb-2 px-4 font-bold transition border-b-2 ${
                activeTab === 'resume' 
                  ? 'border-purple-800 text-purple-950 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              السيرة الذاتية والمهارات (Resume & Skills)
            </button>
          </div>

          {/* 4. Tab Content */}
          {activeTab === 'work' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">القسم / الإدارة (Department)</label>
                <select 
                  value={selectedDeptAr} 
                  onChange={(e) => handleDeptChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.ar}>
                      {d.ar} — ({d.en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المسمى الوظيفي (Job Position)</label>
                <select 
                  value={selectedJob.ar} 
                  onChange={(e) => {
                    const match = JOB_POSITIONS[selectedDeptAr]?.find(j => j.ar === e.target.value);
                    if (match) setSelectedJob(match);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                >
                  {JOB_POSITIONS[selectedDeptAr]?.map((j, idx) => (
                    <option key={idx} value={j.ar}>
                      {j.ar} — ({j.en})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">البريد الإلكتروني للعمل (Work Email)</label>
                <input 
                  type="email" 
                  value={workEmail} 
                  onChange={(e) => setWorkEmail(e.target.value)} 
                  placeholder="emp@elite-clinic.com"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">هاتف العمل الداخلي (Work Phone)</label>
                <input 
                  type="text" 
                  value={workPhone} 
                  onChange={(e) => setWorkPhone(e.target.value)} 
                  placeholder="+965 99001122"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">تاريخ المباشرة والتعيين (Hire Date)</label>
                <input 
                  type="date"
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">المدير المباشر (Manager / Supervisor)</label>
                <input 
                  type="text" 
                  value={manager} 
                  onChange={(e) => setManager(e.target.value)} 
                  placeholder="المدير الطبي / Medical Director"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">موقع العمل (Work Location)</label>
                <input 
                  type="text" 
                  value={workLocation} 
                  onChange={(e) => setWorkLocation(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'private' && (
            <div className="space-y-4">
              {/* Kuwait Civil ID OCR Scanner Bar & File Upload */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-xl shadow-md flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                      🪪
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">الماسح الضوئي الذكي للبطاقة المدنية (PACI OCR Scanner)</h4>
                      <p className="text-[11px] text-purple-200">ارفع صورة البطاقة المدنية أو جواز السفر لقراءة البيانات واستخراجها آلياً بالذكاء الاصطناعي</p>
                    </div>
                  </div>
                  <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-xs transition shadow flex items-center gap-2 shrink-0 cursor-pointer">
                    <span>📁</span> {isScanning ? '⏳ جاري القراءة بالذكاء الاصطناعي...' : 'رفع وتصوير المستند (Real OCR)'}
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      className="hidden" 
                      disabled={isScanning}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setIsScanning(true);
                        try {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64String = reader.result as string;
                            try {
                              const d = await parseKuwaitCivilCardOCR(base64String);
                              if (d) {
                                if (d.civilId) {
                                  if (validateKuwaitCivilId(d.civilId)) {
                                    setCivilId(d.civilId);
                                  } else {
                                    setCivilId(d.civilId);
                                  }
                                }
                                if (d.nameAr) setNameAr(d.nameAr);
                                if (d.nameEn) setNameEn(d.nameEn);
                                if (d.nationality) setNationality(d.nationality);
                                if (d.gender) {
                                  setGender(d.gender.toLowerCase().includes('female') || d.gender.includes('أنثى') ? 'أنثى - Female' : 'ذكر - Male');
                                }
                                if (d.passportNo) setPassportNo(d.passportNo);
                                if (d.expiryDate) setResidencyExpiry(d.expiryDate);
                                if (d.birthDate) {
                                  setCivilIdData(prev => ({...prev, birthDate: d.birthDate}));
                                }
                                if (d.mohLicense) setMohLicense(d.mohLicense);
                                if (d.mohLicenseExpiry) setMohLicenseExpiry(d.mohLicenseExpiry);
                                if (d.residencyType) setResidencyType(d.residencyType);
                                setScanSuccess(true);
                                setTimeout(() => setScanSuccess(false), 5000);
                              } else {
                                alert('تعذر قراءة المستند واستخراج البيانات بالذكاء الاصطناعي');
                              }
                            } catch (apiErr: any) {
                              alert('حدث خطأ أثناء الاتصال بخدمة الماسح الضوئي: ' + apiErr.message);
                            } finally {
                              setIsScanning(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        } catch (err: any) {
                          setIsScanning(false);
                          alert('فشل قراءة الملف: ' + err.message);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-purple-700/60 pt-2 text-[11px] text-purple-200">
                  <span>أو استخدم التعبئة التجريبية السريعة للتجربة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanning(true);
                      setTimeout(() => {
                        setIsScanning(false);
                        setScanSuccess(true);
                        setCivilId('292051401832');
                        setNameAr('د. فاطمة عبدالله الصباح');
                        setNameEn('Dr. Fatima Abdullah Al-Sabah');
                        setCivilIdData({
                          serialNo: '8839210',
                          birthDate: '1992-05-14',
                          expiryDate: '2030-11-12',
                          cardVersion: '03',
                          sex: 'أنثى'
                        });
                        setTimeout(() => setScanSuccess(false), 4000);
                      }, 800);
                    }}
                    disabled={isScanning}
                    className="bg-white/10 hover:bg-white/25 text-white px-3 py-1 rounded font-bold transition"
                  >
                    {isScanning ? '⏳ جاري التعبئة...' : '⚡ تعبئة تجريبية سريعة'}
                  </button>
                </div>
              </div>

              {scanSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold animate-pulse">
                  ✅ تم مسح المستند وتحليل البيانات الحقيقية بالذكاء الاصطناعي بنجاح تام!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ الولادة (Date of Birth)</label>
                  <input 
                    type="date" 
                    value={civilIdData.birthDate || ''} 
                    onChange={(e) => setCivilIdData({...civilIdData, birthDate: e.target.value})} 
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الجنسية (Nationality)</label>
                  <select 
                    value={nationality} 
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    {NATIONALITIES.map((n, idx) => (
                      <option key={idx} value={`${n.ar} - ${n.en}`}>
                        {n.ar} — ({n.en})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">النوع (Gender)</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="ذكر - Male">ذكر (Male)</option>
                    <option value="أنثى - Female">أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الحالة الاجتماعية والمعالين</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      placeholder="متزوج"
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      value={dependents}
                      onChange={(e) => setDependents(Number(e.target.value))}
                      placeholder="المعالين"
                      className="w-1/2 bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">فصيلة الدم (Blood Type)</label>
                  <select 
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">رقم جواز السفر (Passport No)</label>
                  <input 
                    type="text" 
                    value={passportNo} 
                    onChange={(e) => setPassportNo(e.target.value)} 
                    placeholder="A12345678"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">تاريخ انتهاء الجواز (Passport Expiry)</label>
                  <input 
                    type="date" 
                    value={passportExpiry} 
                    onChange={(e) => setPassportExpiry(e.target.value)} 
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">نوع الإقامة (Visa / Residency Type)</label>
                  <select 
                    value={residencyType} 
                    onChange={(e) => setResidencyType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="إقامة مادة 18 (أهلي) - Article 18 Visa">إقامة مادة 18 (أهلي - عيادة) — Article 18</option>
                    <option value="كويتي (تأمينات اجتماعية) - Kuwaiti (PIFSS)">كويتي (تأمينات اجتماعية) — Kuwaiti PIFSS</option>
                    <option value="إقامة مادة 19 (شريك / مستثمر) - Article 19 Partner">إقامة مادة 19 (شريك / مستثمر) — Article 19</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">تاريخ انتهاء الإقامة / البطاقة المدنية (Expiry)</label>
                  <input 
                    type="date" 
                    value={residencyExpiry} 
                    onChange={(e) => setResidencyExpiry(e.target.value)} 
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">اسم البنك (Bank Name - WPS)</label>
                    <select 
                      value={bankName} 
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      {KUWAIT_BANKS.map(b => (
                        <option key={b.code} value={b.ar}>
                          {b.ar} — ({b.en})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">رقم الآيبان (IBAN)</label>
                    <input 
                      type="text" 
                      value={iban} 
                      onChange={(e) => setIban(e.target.value)} 
                      placeholder="أدخل رقم الآيبان الحقيقي (IBAN)"
                      maxLength={30}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع الموظف (Employee Type)</label>
                  <select 
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-bold"
                  >
                    <option value="employee">موظف (Employee)</option>
                    <option value="student">متدرب / طالب (Student)</option>
                    <option value="contractor">مقاول (Contractor)</option>
                    <option value="freelance">مستقل (Freelancer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المستخدم المرتبط (Related User)</label>
                  <input 
                    type="text" 
                    value={relatedUser}
                    onChange={(e) => setRelatedUser(e.target.value)}
                    placeholder="ربط بحساب مستخدم..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رقم تعريف البصمة (Badge ID)</label>
                  <input 
                    type="text" 
                    value={badgeId} 
                    onChange={(e) => setBadgeId(e.target.value)} 
                    placeholder="EMP-XXXX"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الرقم السري للحضور (PIN Code)</label>
                  <input 
                    type="password" 
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="****"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4 text-sm">تراخيص وزارة الصحة (MOH Credentials) - خاص بالكادر الطبي</h4>
                
                {/* MOH License OCR Scanner */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-xl shadow-md flex flex-col gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                        🏥
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">الماسح الضوئي لترخيص مزاولة المهنة (MOH OCR)</h4>
                        <p className="text-[11px] text-emerald-200">ارفع صورة الترخيص الصحي لاستخراج بياناته تلقائياً بالذكاء الاصطناعي</p>
                      </div>
                    </div>
                    <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-xs transition shadow flex items-center gap-2 shrink-0 cursor-pointer">
                      <span>📁</span> {isScanning ? '⏳ جاري القراءة بالذكاء الاصطناعي...' : 'رفع وقراءة الترخيص'}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        disabled={isScanning}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsScanning(true);
                          try {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const base64String = reader.result as string;
                              try {
                                const d = await parseKuwaitCivilCardOCR(base64String);
                                if (d) {
                                  if (d.mohLicense) setMohLicense(d.mohLicense);
                                  if (d.mohLicenseExpiry) setMohLicenseExpiry(d.mohLicenseExpiry);
                                  if (d.nameAr && !nameAr) setNameAr(d.nameAr);
                                  if (d.nameEn && !nameEn) setNameEn(d.nameEn);
                                  if (d.civilId && !civilId) {
                                    setCivilId(d.civilId);
                                  }
                                  setScanSuccess(true);
                                  setTimeout(() => setScanSuccess(false), 5000);
                                } else {
                                  alert('تعذر قراءة المستند واستخراج البيانات بالذكاء الاصطناعي');
                                }
                              } catch (apiErr: any) {
                                alert('حدث خطأ أثناء الاتصال بخدمة الماسح الضوئي: ' + apiErr.message);
                              } finally {
                                setIsScanning(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch (err: any) {
                            setIsScanning(false);
                            alert('فشل قراءة الملف: ' + err.message);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {scanSuccess && (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold animate-pulse mb-4">
                    ✅ تم مسح ترخيص مزاولة المهنة وتحليل البيانات بالذكاء الاصطناعي بنجاح!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-900 font-bold mb-1">رقم ترخيص مزاولة المهنة (MOH License No)</label>
                    <input 
                      type="text" 
                      value={mohLicense} 
                      onChange={(e) => setMohLicense(e.target.value)} 
                      placeholder="MOH-DOC-9821"
                      className="w-full bg-white border border-purple-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono font-bold text-purple-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">تاريخ انتهاء ترخيص (MOH Expiry Date)</label>
                    <input 
                      type="date" 
                      value={mohLicenseExpiry} 
                      onChange={(e) => setMohLicenseExpiry(e.target.value)} 
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">الدرجة العلمية والشهادة (Degree / Qualification)</label>
                  <input 
                    type="text" 
                    value={qualification} 
                    onChange={(e) => setQualification(e.target.value)} 
                    placeholder="بورد طب وجراحة الجلدية / Fellowship"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">التخصص الدقيق (Specialty)</label>
                  <input 
                    type="text" 
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="مثال: جراحة التجميل"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">السيرة الذاتية (Resume Lines)</h4>
                  <button type="button" className="text-purple-600 hover:text-purple-800 font-bold transition text-xs bg-purple-50 px-3 py-1.5 rounded-lg">➕ إضافة خبرة جديدة</button>
                </div>
                <div className="text-slate-400 text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  لا توجد بيانات سيرة ذاتية مسجلة حالياً
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">المهارات (Skills)</h4>
                  <button type="button" className="text-purple-600 hover:text-purple-800 font-bold transition text-xs bg-purple-50 px-3 py-1.5 rounded-lg">➕ إضافة مهارة جديدة</button>
                </div>
                <div className="text-slate-400 text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  لا توجد مهارات مسجلة حالياً
                </div>
              </div>
            </div>
          )}

          {/* 5. Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              Odoo 18 Multi-language Form: hr.employee
            </span>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition"
              >
                إلغاء (Discard)
              </button>
              <button 
                type="submit"
                className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-lg font-bold transition shadow-sm"
              >
                حفظ وتسجيل الموظف (Save)
              </button>
            </div>
          </div>

          {activeTab === 'warnings' && (
             <div className="space-y-4">
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm font-bold">
                 هذا السجل يعرض المخالفات والإنذارات التأديبية الخاصة بالموظف.
               </div>
               <table className="w-full text-right text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                 <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                   <tr>
                     <th className="p-3.5">رقم الإجراء</th>
                     <th className="p-3.5">نوع العقوبة</th>
                     <th className="p-3.5">سبب الجزاء</th>
                     <th className="p-3.5">الإجراء المترتب</th>
                     <th className="p-3.5">التاريخ</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   <tr className="hover:bg-slate-50 transition">
                     <td className="p-3.5 font-mono text-slate-500">WARN-2026-01</td>
                     <td className="p-3.5 font-bold text-rose-700">إنذار كتابي أول</td>
                     <td className="p-3.5">تأخير متكرر عن مواعيد العمل</td>
                     <td className="p-3.5 font-bold text-slate-800">خصم أجر يوم واحد</td>
                     <td className="p-3.5 font-mono text-slate-600">2026-08-15</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          )}
        </form>
      </div>
    </div>
  );
}
