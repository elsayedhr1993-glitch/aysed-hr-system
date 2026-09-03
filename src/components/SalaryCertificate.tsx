import React from 'react';

export interface EmployeeData {
  name: string;
  gender?: 'male' | 'female' | string;
  nationality: string;
  civilId: string;
  companyName: string;
  jobTitle: string;
  joinDate: string;
  basicSalary: number | string;
  salaryInWords: string;
  bankName: string;
  iban: string;
}

export interface SalaryCertificateProps {
  date?: string;
  employee: EmployeeData;
}

export const SalaryCertificate: React.FC<SalaryCertificateProps> = ({
  date = new Date().toLocaleDateString('en-GB'), // يظهر التاريخ الحالي بصيغة DD/MM/YYYY تلقائياً
  employee,
}) => {
  if (!employee) return null;

  // 1. تحديد الضمائر وصيغ التأنيث بناءً على جنس الموظف المسجل
  const genderStr = String(employee.gender || '').toUpperCase();
  const isFemale = genderStr === 'FEMALE' || 
                   String(employee.gender || '').toLowerCase() === 'female' || 
                   String(employee.gender || '').includes('أنثى') || 
                   String(employee.gender || '').includes('انثى') ||
                   genderStr === 'F';

  const verbText = isFemale ? 'تعمل لدينا بـ' : 'يعمل لدينا بـ';
  const salaryPronoun = isFemale ? 'راتبها' : 'راتبه';
  const accountPronoun = isFemale ? 'حسابها' : 'حسابه';
  const certificatePronoun = isFemale ? 'لها' : 'له';
  const requestPronoun = isFemale ? 'طلبها' : 'طلبه';

  // تحديد وصف الاستمرارية ديناميكياً بناءً على الجنس
  const ongoingStatus = isFemale ? 'ومستمرة بالعمل حتى تاريخه' : 'ومستمر بالعمل حتى تاريخه';

  // معالجة تأنيث الجنسية
  const rawNat = (employee.nationality || '').trim();
  const femaleNatMap: Record<string, string> = {
    'كويتي': 'كويتية',
    'مصري': 'مصرية',
    'هندي': 'هندية',
    'سيريلانكي': 'سيريلانكية',
    'فلبيني': 'فلبينية',
    'باكستاني': 'باكستانية',
    'أردني': 'أردنية',
    'سوري': 'سورية',
    'لبناني': 'لبنانية',
    'سعودي': 'سعودية',
    'إماراتي': 'إماراتية',
    'قطري': 'قطرية',
    'عماني': 'عمانية',
    'بحريني': 'بحرينية',
    'سوداني': 'سودانية',
    'يمني': 'يمنية',
    'عراقي': 'عراقية',
    'تنسي': 'تونسية',
    'مغربي': 'مغربية',
  };
  const formattedNationality = (isFemale && femaleNatMap[rawNat]) ? femaleNatMap[rawNat] : rawNat;

  // 2. تنسيق الراتب لإزالة الأصفار العشرية الزائدة (مثلاً 270 بدلاً من 270.000)
  const numericSalary = typeof employee.basicSalary === 'number' 
    ? employee.basicSalary 
    : parseFloat(employee.basicSalary || '0');
  
  const formattedSalary = Number.isInteger(numericSalary)
    ? numericSalary.toLocaleString('en-US')
    : numericSalary.toFixed(3);

  // 3. تنظيف نص التفقيط لمنع أي تكرار لكلمة "لا غير"
  const cleanSalaryInWords = (employee.salaryInWords || '')
    .replace(/لا غير\s+لا غير/g, 'لا غير')
    .trim();

  // 4. ضبط اسم جهة العمل
  const rawCompany = employee.companyName || '';
  const formattedCompanyName = rawCompany;

  // 5. ضبط تنسيق التواريخ بالسلاش مع منع التفاف السطر
  const formattedJoinDate = (employee.joinDate || '').replace(/-/g, '/');
  const formattedDocDate = (date || '').replace(/-/g, '/');

  // 6. ضبط اسم البنك ليكون مسبوقاً بـ "بنك" إذا لزم الأمر
  const rawBank = (employee.bankName || '').trim();
  const formattedBankName = (rawBank.startsWith('بنك') || rawBank.startsWith('البنك'))
    ? rawBank
    : (rawBank === 'بيتك' || rawBank === 'بيت التمويل' || rawBank === 'بيت التمويل الكويتي'
        ? 'بنك بيت التمويل الكويتي'
        : (rawBank ? `بنك ${rawBank}` : 'بنك بيت التمويل الكويتي'));

  return (
    <div className="salary-certificate-root w-full bg-white text-gray-900 font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          /* مسافات أمان لترويسة وتذييل ورق الشركة المطبوع مسبقاً */
          margin-top: 48mm;
          margin-bottom: 35mm;
          margin-right: 22mm;
          margin-left: 22mm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .salary-certificate-root {
            padding: 0 !important;
            max-width: 100% !important;
            background: transparent !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="max-w-[210mm] mx-auto p-8 pt-10 md:p-12 text-justify select-none" 
        dir="rtl"
        style={{ pageBreakInside: 'avoid' }}
      >
        {/* التاريخ في أقصى اليسار العلوي بدون أي ترويسة أو لوجو */}
        <div className="flex justify-start mb-6 text-sm font-bold text-gray-800">
          <span>التاريخ: <span className="inline-block whitespace-nowrap" dir="ltr">{formattedDocDate}</span></span>
        </div>

        {/* عنوان الشهادة */}
        <div className="text-center my-6">
          <h1 className="text-2xl font-bold border-b-2 border-gray-900 inline-block pb-1.5 text-gray-900">
            شهادة راتب وإستمرارية راتب
          </h1>
        </div>

        {/* الجهة الموجه إليها الخطاب */}
        <div className="mt-8 mb-6">
          <h2 className="text-lg font-bold underline text-gray-900">
            السادة / إلى من يهمه الأمر
          </h2>
        </div>

        {/* نص الشهادة المعتمد */}
        <div className="space-y-4 text-base text-gray-800 leading-[2.3]">
          <p>
            نحيط سيادتكم علماً بأن/ <strong>{employee.name}</strong> (الجنسية: {formattedNationality}) بموجب بطاقة مدنية رقم/ <strong>{employee.civilId}</strong>، {verbText} <strong>{formattedCompanyName}</strong>، بوظيفة/ <strong>{employee.jobTitle}</strong> وذلك إعتباراً من <span className="inline-block whitespace-nowrap font-bold" dir="ltr">{formattedJoinDate}</span> براتب شهري وقدره (<strong>{formattedSalary} د.ك</strong>) {cleanSalaryInWords}، ويتم تحويل {salaryPronoun} إلى {accountPronoun} لدى <strong>{formattedBankName}</strong> رقم الآيبان (<span className="inline-block whitespace-nowrap font-bold" dir="ltr">{employee.iban}</span>) {ongoingStatus}.
          </p>

          <p>
            وقد أُعطيت {certificatePronoun} هذه الشهادة بناءً على {requestPronoun} دون أدنى مسؤولية على المؤسسة تجاه حقوق الغير.
          </p>
        </div>

        {/* التحية الختامية */}
        <div className="text-center my-10 font-bold text-base text-gray-800">
          وتفضلوا بقبول فائق التحية والاحترام ،،،
        </div>

        {/* خانة المفوض بالتوقيع في أقصى اليسار */}
        <div className="flex justify-start mt-12 pl-4" style={{ direction: 'ltr' }}>
          <div className="text-center w-64" style={{ direction: 'rtl' }}>
            <p className="font-bold text-lg text-gray-900">المفوض بالتوقيع</p>
            {/* مساحة فارغة مخصصة للتوقيع والختم اليدوي */}
            <div className="h-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCertificate;
