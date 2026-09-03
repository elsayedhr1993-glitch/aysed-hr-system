export interface ContractData {
  id: string;
  contractReference: string;
  companyName?: string;
  employeeId: string;
  employeeNameAr: string;
  employeeNameEn: string;
  civilId: string;
  jobTitleAr: string;
  jobTitleEn: string;
  departmentAr: string;
  departmentEn: string;
  contractType: 'محدد المدة (Fixed Term)' | 'غير محدد المدة (Indefinite)';
  startDate: string;
  endDate?: string;
  trialPeriodDays: number;
  
  // هيكل الراتب والبدلات (KWD)
  wageBasic: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalNatureAllowance: number;
  otherAllowances: number;
  totalWage: number;

  // شروط العمل وساعات الدوام
  workingHoursWeekly: number;
  annualLeaveDays: number;
  noticePeriodDays: number;
  airTicketAllowance: boolean;
  termsAndConditionsAr: string;
  
  // حالة العقد وفق دورة حياة أودو
  state: 'draft' | 'running' | 'expired' | 'cancelled';
}

// دالة احتساب الراتب الإجمالي الشامل
export const calculateTotalContractWage = (
  basic: number,
  housing: number,
  transport: number,
  medical: number,
  other: number
): number => {
  return Number((basic + housing + transport + medical + other).toFixed(3));
};

// دالة طباعة وتوليد وثيقة عقد العمل الرسمية A4
export const printKuwaitContractReport = (contract: ContractData) => {
  const container = document.createElement('div');
  container.className = 'print-area';
  container.innerHTML = `
    <div style="padding: 20px; background: white; color: #0f172a; direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
      <div style="border-bottom: 2px solid #714B67; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 18px; font-weight: bold; color: #714B67;">عقد عمل كادر طبي وإداري</h1>
          <p style="font-size: 11px; color: #64748b;">وفق أحكام القانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي بدولة الكويت</p>
        </div>
        <div style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
          ${contract.contractReference}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 12px;">
        <div><strong>الطرف الأول (صاحب العمل):</strong> ${contract.companyName || 'المنشأة (صاحب العمل)'}</div>
        <div><strong>الطرف الثاني (الموظف):</strong> ${contract.employeeNameAr} (${contract.employeeNameEn})</div>
        <div><strong>الرقم المدني:</strong> ${contract.civilId}</div>
        <div><strong>المسمى الوظيفي:</strong> ${contract.jobTitleAr}</div>
        <div><strong>تاريخ السريان:</strong> ${contract.startDate}</div>
        <div><strong>نوع العقد:</strong> ${contract.contractType}</div>
      </div>

      <h3 style="font-weight: bold; font-size: 13px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">جدول الأجور والمخصصات الشهرية:</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: right; margin-bottom: 20px; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9; color: #714B67;">
            <th style="padding: 8px; border: 1px solid #cbd5e1;">الراتب الأساسي</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">بدل السكن</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">بدل الانتقال</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1;">بدل كادر طبي</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #714B67;">إجمالي الراتب التعاقدي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${contract.wageBasic.toFixed(3)} د.ك</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${contract.housingAllowance.toFixed(3)} د.ك</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${contract.transportAllowance.toFixed(3)} د.ك</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace;">${contract.medicalNatureAllowance.toFixed(3)} د.ك</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #714B67;">${contract.totalWage.toFixed(3)} د.ك</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); text-align: center; font-size: 12px;">
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">توقيع واعتماد الطرف الأول (المنشأة)</p>
          <p style="color: #94a3b8;">............................................</p>
        </div>
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">توقيع الطرف الثاني (الموظف)</p>
          <p style="color: #94a3b8;">............................................</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  window.print();
  setTimeout(() => {
    container.remove();
  }, 1000);
};
