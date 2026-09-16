export interface ParsedEmployeeAction {
  nameAr?: string;
  nameEn?: string;
  civilId?: string;
  jobTitle?: string;
  department?: string;
  basicSalary?: string;
  phone?: string;
  nationality?: string;
  email?: string;
  iban?: string;
  bankName?: string;
}

export function parseEmployeeCreationPrompt(prompt: string): ParsedEmployeeAction | null {
  const text = String(prompt || '').trim();
  if (!text) return null;

  const hasCreateIntent = /(ضيف|أضف|أنشئ|إنشاء|create|add|new employee|hire|employee)/i.test(text);
  const hasEmployeeKeyword = /(موظف|employee|staff|hire|توظيف)/i.test(text);

  if (!hasCreateIntent || !hasEmployeeKeyword) {
    return null;
  }

  const nameFromPrompt = (() => {
    const direct = text.match(/(?:اسم|اسمه|name|named)[\s:]+([\u0600-\u06FFa-zA-Z\s.'-]{2,40})/i);
    if (direct) {
      return direct[1].replace(/(?:رقم|civil|job|وظيفة|department|قسم|راتب|salary|مدني|مسمى|الرقم|الوظيفة|القسم).*/i, '').trim();
    }

    const employeeName = text.match(/(?:\b(?:employee|موظف)\b[\s\S]{0,60}?\b(?:named|اسمه|اسم)\b[\s:]+)([\u0600-\u06FFa-zA-Z\s.'-]{2,40})/i);
    if (employeeName) {
      return employeeName[1].trim();
    }

    const implicit = text.match(/([\u0600-\u06FF]{2,20}\s+[\u0600-\u06FF]{2,20}(?:\s+[\u0600-\u06FF]{2,20})?)/);
    if (implicit) {
      return implicit[1].replace(/(?:رقم|مدني|وظيفة|القسم|الراتب|salary|department|section).*/i, '').trim();
    }

    return undefined;
  })();

  const civilId = text.match(/(?:رقم\s*مدني|civil\s*id|civilId|national\s*id|id\s*number)[\s:]*([0-9]{12})/i)?.[1] || text.match(/(?:مدني|civil)[\s:]*([0-9]{12})/i)?.[1];
  const jobTitle = text.match(/(?:وظيفة|job\s*title|position|المسمى|مسمى)[\s:]*([\u0600-\u06FFa-zA-Z\s.'-]{2,40})/i)?.[1]?.trim();
  const department = text.match(/(?:قسم|department|dept)[\s:]*([\u0600-\u06FFa-zA-Z\s.'-]{2,40})/i)?.[1]?.trim();
  const basicSalary = text.match(/(?:راتب|راتبه|salary|basic\s*salary|monthly\s*salary)[\s:]*([0-9]{2,9}(?:[.,][0-9]{1,2})?)/i)?.[1] || text.match(/(?:وراتبه|وعلى\s*راتبه|و\s*راتبه|راتبه\s*)([0-9]{2,9}(?:[.,][0-9]{1,2})?)/i)?.[1];
  const phone = text.match(/(?:هاتف|phone|mobile|tel)[\s:]*([0-9+\s-]{8,20})/i)?.[1]?.trim();
  const nationality = text.match(/(?:جنسية|nationality)[\s:]*([\u0600-\u06FFa-zA-Z\s.'-]{2,30})/i)?.[1]?.trim();
  const email = text.match(/(?:بريد|email)[\s:]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)?.[1];
  const iban = text.match(/(?:iban|آيبان|IBAN)[\s:]*([A-Za-z0-9]{10,34})/i)?.[1];
  const bankName = text.match(/(?:بنك|bank)[\s:]*([\u0600-\u06FFa-zA-Z\s.'-]{2,40})/i)?.[1]?.trim();

  const fallbackName = nameFromPrompt || text.match(/[\u0600-\u06FFa-zA-Z][\u0600-\u06FFa-zA-Z\s.'-]{2,30}/)?.[0]?.trim();

  return {
    nameAr: fallbackName,
    nameEn: fallbackName,
    civilId,
    jobTitle,
    department,
    basicSalary,
    phone,
    nationality,
    email,
    iban,
    bankName,
  };
}

export function shouldGenerateEmployeeAction(prompt: string): boolean {
  return parseEmployeeCreationPrompt(prompt) !== null;
}
