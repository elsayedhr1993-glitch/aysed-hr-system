// إعدادات النظام الموحدة - دولة الكويت (القطاع الخاص)
export const KUWAIT_LABOR_CONFIG = {
  // 1. التوقيت والمنطقة
  timeZone: 'Asia/Kuwait', // GMT+3
  countryCode: 'KW',
  currency: 'KWD',
  currencyDecimals: 3, // الفلس الكويتي (3 خانات عشرية)

  // 2. نوع القطاع واللوائح
  sectorType: 'private_sector' as const, // قطاع خاص
  laborLaw: 'Kuwait Labor Law No. 6 of 2010',

  // 3. محرك الحسابات المالية (مادة 55 و 67)
  payroll: {
    monthlyWorkingDaysBasis: 26, // الحساب على 26 يوم عمل شهرياً
    dailyHoursBasis: 8,          // ساعات العمل اليومية القياسية
    pifssEnabled: false,         // التأمينات الاجتماعية معطلة (0%)
    pifssDeductionRate: 0.0,
    overtimeRateRegular: 1.25,   // 125% في الأيام العادية
    overtimeRateHoliday: 2.00,   // 200% في العطلات الرسمية (مادة 68)
  },

  // دوال الحساب السريعة
  helpers: {
    getDayRate: (grossSalary: number) => grossSalary / 26,
    getHourRate: (grossSalary: number) => (grossSalary / 26) / 8,
    getMinuteRate: (grossSalary: number) => (grossSalary / 26) / 8 / 60,
    formatKWD: (amount: number) => amount.toFixed(3) + ' د.ك'
  }
};
