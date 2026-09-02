// ============================================================================
// Aysed S HR 2026 - Central Bilingual HR Data Constants (hrData.ts)
// مصفوفات المسميات الوظيفية والجنسيات الثنائية المعتمدة (Bilingual Job Titles & Nationalities)
// ============================================================================

export interface BilingualJobTitle {
  ar: string;
  en: string;
  department: string;
}

export interface BilingualNationality {
  ar: string;
  en: string;
}

export const CENTRAL_JOB_TITLES: BilingualJobTitle[] = [
  // القطاع الطبي والصحي (Medical & Health Sector)
  { ar: "طبيب عام", en: "General Practitioner", department: "Medical" },
  { ar: "طبيب ممارس عام", en: "General Practitioner", department: "Medical" },
  { ar: "طبيب اختصاصي", en: "Specialist Physician", department: "Medical" },
  { ar: "طبيب استشاري", en: "Consultant Physician", department: "Medical" },
  { ar: "طبيب أسنان", en: "Dentist", department: "Medical" },
  { ar: "طبيب أسنان عام", en: "General Dental Practitioner", department: "Medical" },
  { ar: "طبيب اختصاصي أسنان", en: "Dental Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي جلدية", en: "Dermatology Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي نساء وتوليد", en: "Obstetrics & Gynecology Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي باطنية", en: "Internal Medicine Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي أطفال", en: "Pediatrics Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي جراحة", en: "Surgery Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي عيون", en: "Ophthalmology Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي عظام", en: "Orthopedics Specialist", department: "Medical" },
  { ar: "طبيب اختصاصي تخدير", en: "Anesthesiology Specialist", department: "Medical" },
  { ar: "ممرض", en: "Nurse", department: "Medical" },
  { ar: "ممرضة", en: "Nurse", department: "Medical" },
  { ar: "ممرض عام", en: "General Nurse", department: "Medical" },
  { ar: "ممرضة عامة", en: "General Nurse", department: "Medical" },
  { ar: "رئيس هيئة تمريض", en: "Head of Nursing", department: "Medical" },
  { ar: "مشرف تمريض", en: "Nursing Supervisor", department: "Medical" },
  { ar: "أخصائي علاج طبيعي", en: "Physiotherapist", department: "Medical" },
  { ar: "فني علاج طبيعي", en: "Physiotherapy Technician", department: "Medical" },
  { ar: "فني ليزر", en: "Laser Technician", department: "Medical" },
  { ar: "فني مختبر", en: "Laboratory Technician", department: "Medical" },
  { ar: "فني مختبرات طبية", en: "Medical Laboratory Technician", department: "Medical" },
  { ar: "أخصائي مختبر", en: "Laboratory Specialist", department: "Medical" },
  { ar: "فني أشعة", en: "Radiology Technician", department: "Medical" },
  { ar: "أخصائي أشعة", en: "Radiology Specialist", department: "Medical" },
  { ar: "صيدلي", en: "Pharmacist", department: "Medical" },
  { ar: "صيدلاني", en: "Pharmacist", department: "Medical" },
  { ar: "مساعد صيدلي", en: "Pharmacist Assistant", department: "Medical" },
  { ar: "فني تعقيم", en: "Sterilization Technician", department: "Medical" },
  { ar: "أخصائي تغذية", en: "Dietitian", department: "Medical" },
  { ar: "أخصائي بصريات", en: "Optometrist", department: "Medical" },
  { ar: "فني بصريات", en: "Optician", department: "Medical" },

  // المهن الإدارية والموارد البشرية (Administrative & HR)
  { ar: "مسؤول شؤون موظفين", en: "Personnel Officer", department: "Administration" },
  { ar: "اختصاصي شؤون موظفين", en: "Personnel Specialist", department: "Administration" },
  { ar: "أخصائي موارد بشرية", en: "Human Resources Specialist", department: "Human Resources" },
  { ar: "مدير موارد بشرية", en: "Human Resources Manager", department: "Human Resources" },
  { ar: "مدير إداري", en: "Administrative Manager", department: "Administration" },
  { ar: "مشرف إداري", en: "Administrative Supervisor", department: "Administration" },
  { ar: "سكرتير", en: "Secretary", department: "Secretarial" },
  { ar: "سكرتيرة", en: "Secretary", department: "Secretarial" },
  { ar: "سكرتير تنفيذي", en: "Executive Secretary", department: "Secretarial" },
  { ar: "موظف استقبال", en: "Receptionist", department: "Administration" },
  { ar: "كاتب إداري", en: "Administrative Clerk", department: "Administration" },
  { ar: "مدخل بيانات", en: "Data Entry Operator", department: "Administration" },
  { ar: "مندوب علاقات حكومية", en: "Government Relations Representative (PRO)", department: "Government Relations" },
  { ar: "مندوب مبيعات", en: "Sales Representative", department: "Sales" },
  { ar: "أمين مخزن", en: "Storekeeper", department: "Logistics" },
  { ar: "مراقب دوام", en: "Timekeeper", department: "Administration" },
  { ar: "موظف خدمة عملاء", en: "Customer Service Representative", department: "Customer Service" },
  { ar: "مترجم", en: "Translator", department: "Administration" },
  { ar: "مستشار قانوني", en: "Legal Advisor", department: "Legal" },

  // المهن المالية والمحاسبية (Financial & Accounting)
  { ar: "محاسب", en: "Accountant", department: "Finance" },
  { ar: "محاسب عام", en: "General Accountant", department: "Finance" },
  { ar: "محاسب تكاليف", en: "Cost Accountant", department: "Finance" },
  { ar: "محاسب رئيسي", en: "Chief Accountant", department: "Finance" },
  { ar: "مدير مالي", en: "Financial Manager", department: "Finance" },
  { ar: "مدقق حسابات", en: "Auditor", department: "Finance" },
  { ar: "أمين صندوق", en: "Cashier", department: "Finance" },

  // تقنية المعلومات (IT Sector)
  { ar: "مهندس كمبيوتر", en: "Computer Engineer", department: "IT" },
  { ar: "مطور برمجيات", en: "Software Developer", department: "IT" },
  { ar: "فني شبكات", en: "Network Technician", department: "IT" },
  { ar: "أخصائي دعم فني", en: "IT Support Specialist", department: "IT" },
  { ar: "مدير تقنية معلومات", en: "IT Manager", department: "IT" },
  { ar: "مصمم جرافيك", en: "Graphic Designer", department: "Marketing" },

  // الخدمات والتشغيل (Support Services)
  { ar: "سائق", en: "Driver", department: "Operations" },
  { ar: "مراسل مكتبي", en: "Office Messenger", department: "Operations" }
];

export const CENTRAL_NATIONALITIES: BilingualNationality[] = [
  { ar: "كويتي", en: "Kuwaiti" },
  { ar: "كويتية", en: "Kuwaiti" },
  { ar: "مصري", en: "Egyptian" },
  { ar: "مصرية", en: "Egyptian" },
  { ar: "أردني", en: "Jordanian" },
  { ar: "أردنية", en: "Jordanian" },
  { ar: "لبناني", en: "Lebanese" },
  { ar: "لبنانية", en: "Lebanese" },
  { ar: "سوري", en: "Syrian" },
  { ar: "سورية", en: "Syrian" },
  { ar: "عراقي", en: "Iraqi" },
  { ar: "عراقية", en: "Iraqi" },
  { ar: "سعودي", en: "Saudi" },
  { ar: "سعودية", en: "Saudi" },
  { ar: "إماراتي", en: "Emirati" },
  { ar: "إماراتية", en: "Emirati" },
  { ar: "بحريني", en: "Bahraini" },
  { ar: "بحرينية", en: "Bahraini" },
  { ar: "عماني", en: "Omani" },
  { ar: "عمانية", en: "Omani" },
  { ar: "قطري", en: "Qatari" },
  { ar: "قطرية", en: "Qatari" },
  { ar: "يمني", en: "Yemeni" },
  { ar: "يمنية", en: "Yemeni" },
  { ar: "سوداني", en: "Sudanese" },
  { ar: "سودانية", en: "Sudanese" },
  { ar: "هندي", en: "Indian" },
  { ar: "هندية", en: "Indian" },
  { ar: "فلبيني", en: "Filipino" },
  { ar: "فلبينية", en: "Filipino" },
  { ar: "بنغلاديشي", en: "Bangladeshi" },
  { ar: "بنغلاديشية", en: "Bangladeshi" },
  { ar: "باكستاني", en: "Pakistani" },
  { ar: "باكستانية", en: "Pakistani" },
  { ar: "سيريلانكي", en: "Sri Lankan" },
  { ar: "سيريلانكية", en: "Sri Lankan" },
  { ar: "نيبالي", en: "Nepali" },
  { ar: "نيبالية", en: "Nepali" },
  { ar: "إيراني", en: "Iranian" },
  { ar: "إيرانية", en: "Iranian" }
];
