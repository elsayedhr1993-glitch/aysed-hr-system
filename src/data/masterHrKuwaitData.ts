// ============================================================================
// 1. جدول الجنسيات والدول المركزي (Odoo: res.country / Nationalities Master Data)
// ============================================================================
export interface CountryMaster {
  code: string;
  nameAr: string;
  nameEn: string;
  nationalityAr: string;
  nationalityEn: string;
}

export const MASTER_NATIONALITIES: CountryMaster[] = [
  // دول مجلس التعاون الخليجي
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', nationalityAr: 'كويتي', nationalityEn: 'Kuwaiti' },
  { code: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', nationalityAr: 'سعودي', nationalityEn: 'Saudi' },
  { code: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', nationalityAr: 'إماراتي', nationalityEn: 'Emirati' },
  { code: 'BH', nameAr: 'مملكة البحرين', nameEn: 'Bahrain', nationalityAr: 'بحريني', nationalityEn: 'Bahraini' },
  { code: 'QA', nameAr: 'دولة قطر', nameEn: 'Qatar', nationalityAr: 'قطري', nationalityEn: 'Qatari' },
  { code: 'OM', nameAr: 'سلطنة عمان', nameEn: 'Oman', nationalityAr: 'عماني', nationalityEn: 'Omani' },

  // الدول العربية
  { code: 'EG', nameAr: 'جمهورية مصر العربية', nameEn: 'Egypt', nationalityAr: 'مصري', nationalityEn: 'Egyptian' },
  { code: 'JO', nameAr: 'المملكة الأردنية الهاشمية', nameEn: 'Jordan', nationalityAr: 'أردني', nationalityEn: 'Jordanian' },
  { code: 'LB', nameAr: 'الجمهورية اللبنانية', nameEn: 'Lebanon', nationalityAr: 'لبناني', nationalityEn: 'Lebanese' },
  { code: 'SY', nameAr: 'الجمهورية العربية السورية', nameEn: 'Syria', nationalityAr: 'سوري', nationalityEn: 'Syrian' },
  { code: 'IQ', nameAr: 'جمهورية العراق', nameEn: 'Iraq', nationalityAr: 'عراقي', nationalityEn: 'Iraqi' },
  { code: 'PS', nameAr: 'دولة فلسطين', nameEn: 'Palestine', nationalityAr: 'فلسطيني', nationalityEn: 'Palestinian' },
  { code: 'YE', nameAr: 'الجمهورية اليمنية', nameEn: 'Yemen', nationalityAr: 'يمني', nationalityEn: 'Yemeni' },
  { code: 'SD', nameAr: 'جمهورية السودان', nameEn: 'Sudan', nationalityAr: 'سوداني', nationalityEn: 'Sudanese' },
  { code: 'TN', nameAr: 'الجمهورية التونسية', nameEn: 'Tunisia', nationalityAr: 'تونسي', nationalityEn: 'Tunisian' },
  { code: 'MA', nameAr: 'المملكة المغربية', nameEn: 'Morocco', nationalityAr: 'مغربي', nationalityEn: 'Moroccan' },
  { code: 'DZ', nameAr: 'الجمهورية الجزائرية', nameEn: 'Algeria', nationalityAr: 'جزائري', nationalityEn: 'Algerian' },

  // آسيا والكوادر الطبية والخدمية
  { code: 'IN', nameAr: 'الهند', nameEn: 'India', nationalityAr: 'هندي', nationalityEn: 'Indian' },
  { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', nationalityAr: 'فلبيني', nationalityEn: 'Filipino' },
  { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', nationalityAr: 'باكستاني', nationalityEn: 'Pakistani' },
  { code: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', nationalityAr: 'بنغلاديشي', nationalityEn: 'Bangladeshi' },
  { code: 'LK', nameAr: 'سريلانكا', nameEn: 'Sri Lanka', nationalityAr: 'سريلانكي', nationalityEn: 'Sri Lankan' },
  { code: 'NP', nameAr: 'نيبال', nameEn: 'Nepal', nationalityAr: 'نيبالي', nationalityEn: 'Nepalese' },
  { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', nationalityAr: 'إندونيسي', nationalityEn: 'Indonesian' },

  // أوروبا وأمريكا والدول الأخرى
  { code: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', nationalityAr: 'بريطاني', nationalityEn: 'British' },
  { code: 'US', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', nationalityAr: 'أمريكي', nationalityEn: 'American' },
  { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', nationalityAr: 'كندي', nationalityEn: 'Canadian' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', nationalityAr: 'فرنسي', nationalityEn: 'French' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', nationalityAr: 'ألماني', nationalityEn: 'German' },
  { code: 'RU', nameAr: 'روسيا الاتحادية', nameEn: 'Russia', nationalityAr: 'روسي', nationalityEn: 'Russian' },
  { code: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine', nationalityAr: 'أوكراني', nationalityEn: 'Ukrainian' }
];

// ============================================================================
// 2. جدول الأقسام الطبية والإدارية (Odoo: hr.department Master Data)
// ============================================================================
export interface DepartmentMaster {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'medical' | 'administrative' | 'support';
}

export const MASTER_DEPARTMENTS: DepartmentMaster[] = [
  // الأقسام الطبية التخصصية (Medical Departments)
  { id: 'DEP-MED-DOC', nameAr: 'الكادر الطبي (الأطباء والاستشاريون)', nameEn: 'Medical Staff (Doctors & Consultants)', type: 'medical' },
  { id: 'DEP-MED-NUR', nameAr: 'الهيئة التمريضية والتعقيم', nameEn: 'Nursing & Sterilization Services', type: 'medical' },
  { id: 'DEP-MED-LSR', nameAr: 'قسم العلاج بالليزر والعناية بالبشرة', nameEn: 'Laser Therapy & Skin Care Dept', type: 'medical' },
  { id: 'DEP-MED-DEN', nameAr: 'قسم طب وجراحة الفم والأسنان', nameEn: 'Dental & Oral Surgery Dept', type: 'medical' },
  { id: 'DEP-MED-LAB', nameAr: 'المختبرات والتحاليل الطبية', nameEn: 'Clinical Laboratories & Pathology', type: 'medical' },
  { id: 'DEP-MED-RAD', nameAr: 'الأشعة والتصوير الطبي', nameEn: 'Radiology & Medical Imaging', type: 'medical' },
  { id: 'DEP-MED-PHA', nameAr: 'الصيدلية والتموين الطبي', nameEn: 'Pharmacy & Medical Supply', type: 'medical' },
  { id: 'DEP-MED-PHY', nameAr: 'العلاج الطبيعي والتأهيل الصحي', nameEn: 'Physiotherapy & Rehabilitation', type: 'medical' },

  // الأقسام الإدارية والمالية (Administrative Departments)
  { id: 'DEP-ADM-MGMT', nameAr: 'الإدارة التنفيذية والإدارة العليا', nameEn: 'Executive & Upper Management', type: 'administrative' },
  { id: 'DEP-ADM-HR', nameAr: 'الموارد البشرية والشؤون الإدارية', nameEn: 'Human Resources & Administration', type: 'administrative' },
  { id: 'DEP-ADM-FIN', nameAr: 'الشؤون المالية والمحاسبة', nameEn: 'Finance & Accounts', type: 'administrative' },
  { id: 'DEP-ADM-REC', nameAr: 'الاستقبال وتجربة وخدمة المرضى', nameEn: 'Reception & Patient Care Service', type: 'administrative' },
  { id: 'DEP-ADM-INS', nameAr: 'التأمين الطبي والتدقيق المالي الصحي', nameEn: 'Medical Insurance & Billing', type: 'administrative' },
  { id: 'DEP-ADM-MKT', nameAr: 'التسويق والعلاقات العامة والإعلام', nameEn: 'Marketing & Public Relations', type: 'administrative' },

  // الخدمات المساندة والتشغيلية (Support & Logistics)
  { id: 'DEP-SUP-IT', nameAr: 'تقنية المعلومات ونظم السجلات الطبية (IT)', nameEn: 'Information Technology & EMR', type: 'support' },
  { id: 'DEP-SUP-BIO', nameAr: 'الهندسة الطبية وصيانة الأجهزة الليزرية', nameEn: 'Biomedical & Laser Engineering', type: 'support' },
  { id: 'DEP-SUP-LOG', nameAr: 'الخدمات العامة والأمن والسلامة المهنية', nameEn: 'General Services, Security & Safety', type: 'support' }
];

// ============================================================================
// 3. جدول مسميات القوى العاملة (PAM) وتراخيص MOH المعتمدة (Odoo: hr.job)
// ============================================================================
export interface JobPositionMaster {
  id: string;
  deptId: string;
  titleAr: string;
  titleEn: string;
  pamCode: string; // كود مهنة القوى العاملة بالكويت
  category: string;
}

export const MASTER_JOB_POSITIONS: JobPositionMaster[] = [
  // 3.1 الكادر الطبي البشري (MOH Medical Cadre)
  { id: 'JOB-001', deptId: 'DEP-MED-DOC', titleAr: 'طبيب استشاري - أمراض جلدية وتناسلية', titleEn: 'Consultant - Dermatology & Venereology', pamCode: '221101', category: 'Medical' },
  { id: 'JOB-002', deptId: 'DEP-MED-DOC', titleAr: 'طبيب استشاري - جراحة التجميل والترميم', titleEn: 'Consultant - Plastic & Reconstructive Surgery', pamCode: '221102', category: 'Medical' },
  { id: 'JOB-003', deptId: 'DEP-MED-DOC', titleAr: 'طبيب اختصاصي - طب وجراحة العيون', titleEn: 'Specialist - Ophthalmology & Eye Surgery', pamCode: '221103', category: 'Medical' },
  { id: 'JOB-004', deptId: 'DEP-MED-DOC', titleAr: 'طبيب اختصاصي - أنف وأذن وحنجرة', titleEn: 'Specialist - ENT & Otolaryngology', pamCode: '221104', category: 'Medical' },
  { id: 'JOB-005', deptId: 'DEP-MED-DOC', titleAr: 'طبيب اختصاصي - باطنية وغدد صماء', titleEn: 'Specialist - Internal Medicine & Endocrinology', pamCode: '221105', category: 'Medical' },
  { id: 'JOB-006', deptId: 'DEP-MED-DOC', titleAr: 'طبيب ممارس عام', titleEn: 'General Practitioner (GP)', pamCode: '221106', category: 'Medical' },
  { id: 'JOB-007', deptId: 'DEP-MED-DOC', titleAr: 'المدير الطبي للعيادة / المركز', titleEn: 'Clinic Medical Director', pamCode: '112001', category: 'Medical' },

  // 3.2 طب وجراحة الأسنان
  { id: 'JOB-008', deptId: 'DEP-MED-DEN', titleAr: 'طبيب اختصاصي - طب وجراحة الأسنان', titleEn: 'Specialist - Dental & Oral Surgery', pamCode: '226101', category: 'Dental' },
  { id: 'JOB-009', deptId: 'DEP-MED-DEN', titleAr: 'طبيب اختصاصي - تقويم وزراعة الأسنان', titleEn: 'Specialist - Orthodontics & Dental Implants', pamCode: '226102', category: 'Dental' },
  { id: 'JOB-010', deptId: 'DEP-MED-DEN', titleAr: 'فني صناعة وتركيبات أسنان', titleEn: 'Dental Laboratory Technician', pamCode: '321401', category: 'Dental' },
  { id: 'JOB-011', deptId: 'DEP-MED-DEN', titleAr: 'مساعد / فني عيادة أسنان', titleEn: 'Dental Assistant Technician', pamCode: '325101', category: 'Dental' },

  // 3.3 الهيئة التمريضية والتعقيم
  { id: 'JOB-012', deptId: 'DEP-MED-NUR', titleAr: 'رئيسة هيئة التمريض والمشرفة الفنية', titleEn: 'Head of Nursing & Clinical Supervisor', pamCode: '222101', category: 'Nursing' },
  { id: 'JOB-013', deptId: 'DEP-MED-NUR', titleAr: 'ممرض عام / ممرضة عامة', titleEn: 'General Registered Staff Nurse', pamCode: '222102', category: 'Nursing' },
  { id: 'JOB-014', deptId: 'DEP-MED-NUR', titleAr: 'ممرض عمليات والعناية التخدير', titleEn: 'Surgical & Anesthesia Operating Nurse', pamCode: '222103', category: 'Nursing' },
  { id: 'JOB-015', deptId: 'DEP-MED-NUR', titleAr: 'فني تعقيم أجهزة طبية ومكافحة عدوى', titleEn: 'CSSD & Infection Control Technician', pamCode: '325601', category: 'Nursing' },

  // 3.4 الليزر والمختبرات والمهن الطبية المعاونة
  { id: 'JOB-016', deptId: 'DEP-MED-LSR', titleAr: 'أخصائي / فني علاج بالليزر الطبي', titleEn: 'Medical Laser Specialist/Technician', pamCode: '321101', category: 'Allied' },
  { id: 'JOB-017', deptId: 'DEP-MED-LSR', titleAr: 'أخصائي / خبير عناية بالبشرة والتجميل', titleEn: 'Aesthetician & Clinical Skin Specialist', pamCode: '514201', category: 'Allied' },
  { id: 'JOB-018', deptId: 'DEP-MED-LAB', titleAr: 'أخصائي تحاليل ومختبرات طبية', titleEn: 'Medical Laboratory Specialist', pamCode: '221201', category: 'Allied' },
  { id: 'JOB-019', deptId: 'DEP-MED-LAB', titleAr: 'فني سحب عينات ومختبر', titleEn: 'Phlebotomist & Lab Technician', pamCode: '321201', category: 'Allied' },
  { id: 'JOB-020', deptId: 'DEP-MED-RAD', titleAr: 'فني أشعة وتصوير تشخيصي', titleEn: 'Radiological & Medical Imaging Tech', pamCode: '321102', category: 'Allied' },
  { id: 'JOB-021', deptId: 'DEP-MED-PHA', titleAr: 'صيدلي مرخص', titleEn: 'Licensed Clinical Pharmacist', pamCode: '226201', category: 'Allied' },
  { id: 'JOB-022', deptId: 'DEP-MED-PHY', titleAr: 'أخصائي علاج طبيعي وتأهيل', titleEn: 'Physiotherapist Specialist', pamCode: '226401', category: 'Allied' },
  { id: 'JOB-023', deptId: 'DEP-MED-LSR', titleAr: 'أخصائي تغذية علاجية وتنسيق قوام', titleEn: 'Clinical Nutritionist & Dietitian', pamCode: '226501', category: 'Allied' },

  // 3.5 الإدارة العليا والشؤون الإدارية والموارد البشرية (PAM Administrative)
  { id: 'JOB-024', deptId: 'DEP-ADM-MGMT', titleAr: 'الرئيس التنفيذي / مدير عام المنشأة', titleEn: 'Chief Executive Officer (CEO) / General Manager', pamCode: '111201', category: 'Admin' },
  { id: 'JOB-025', deptId: 'DEP-ADM-MGMT', titleAr: 'المدير المالي (CFO)', titleEn: 'Chief Financial Officer (CFO)', pamCode: '121101', category: 'Admin' },
  { id: 'JOB-026', deptId: 'DEP-ADM-HR', titleAr: 'مدير الموارد البشرية والشؤون الإدارية', titleEn: 'Human Resources & Admin Director', pamCode: '121201', category: 'Admin' },
  { id: 'JOB-027', deptId: 'DEP-ADM-HR', titleAr: 'أخصائي شؤون العاملين والرواتب (WPS)', titleEn: 'Personnel & WPS Payroll Specialist', pamCode: '242301', category: 'Admin' },
  { id: 'JOB-028', deptId: 'DEP-ADM-HR', titleAr: 'مندوب علاقات حكومية وجوازات (PRO)', titleEn: 'Public Relations Officer / PRO (PAM)', pamCode: '334301', category: 'Admin' },
  { id: 'JOB-029', deptId: 'DEP-ADM-FIN', titleAr: 'محاسب عام أول', titleEn: 'Senior General Accountant', pamCode: '241101', category: 'Admin' },
  { id: 'JOB-030', deptId: 'DEP-ADM-FIN', titleAr: 'أمين صندوق وصندوق عهد نقدية', titleEn: 'Cashier & Petty Cash Officer', pamCode: '431101', category: 'Admin' },
  { id: 'JOB-031', deptId: 'DEP-ADM-REC', titleAr: 'مشرف قسم الاستقبال والمواعيد', titleEn: 'Reception & Appointments Supervisor', pamCode: '422601', category: 'Admin' },
  { id: 'JOB-032', deptId: 'DEP-ADM-REC', titleAr: 'موظف استقبال وتنسيق دخول مرضى', titleEn: 'Receptionist & Patient Admissions Clerk', pamCode: '422602', category: 'Admin' },
  { id: 'JOB-033', deptId: 'DEP-ADM-INS', titleAr: 'مسؤول تأمين صحي ومطالبات طبية', titleEn: 'Medical Insurance Claims Officer', pamCode: '241201', category: 'Admin' },
  { id: 'JOB-034', deptId: 'DEP-ADM-MKT', titleAr: 'مدير التسويق والتواصل الرقمي', titleEn: 'Digital Marketing & Communications Manager', pamCode: '122101', category: 'Admin' },

  // 3.6 التقنية والخدمات المساندة
  { id: 'JOB-035', deptId: 'DEP-SUP-BIO', titleAr: 'مهندس أجهزة طبية وليزر', titleEn: 'Biomedical & Laser Service Engineer', pamCode: '214901', category: 'Technical' },
  { id: 'JOB-036', deptId: 'DEP-SUP-IT', titleAr: 'مسؤول نظم ومعلومات شبكات (IT)', titleEn: 'IT Systems & Network Administrator', pamCode: '251101', category: 'Technical' },
  { id: 'JOB-037', deptId: 'DEP-SUP-LOG', titleAr: 'مشرف أمن وسلامة مهنية ومرافق', titleEn: 'Security, Facilities & Safety Supervisor', pamCode: '541401', category: 'Services' },
  { id: 'JOB-038', deptId: 'DEP-SUP-LOG', titleAr: 'سائق ومندوب خدمات لوجستية ونقل', titleEn: 'Logistics Driver & Dispatcher', pamCode: '832201', category: 'Services' }
];
