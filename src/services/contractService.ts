import { safePrintAction } from '../guards/SystemIntegrityGuard';

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

// دالة طباعة وتوليد وثيقة عقد العمل الرسمية A4 (HTML/CSS Engine)
export const printKuwaitContractReport = (contract: ContractData) => {
  const container = document.createElement('div');
  container.className = 'print-area';
  container.innerHTML = `
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
      .a4-document {
        width: 100%;
        max-width: 210mm;
        margin: 0 auto;
        background: #ffffff;
        color: #0f172a;
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
        font-size: 12px;
        line-height: 1.6;
      }
      .a4-header {
        border-bottom: 2px solid #714B67;
        padding-bottom: 12px;
        margin-bottom: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .a4-badge {
        font-family: monospace;
        font-weight: bold;
        background: #f8fafc;
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        direction: ltr;
        display: inline-block;
      }
      .a4-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        background: #f8fafc;
        padding: 14px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        margin-bottom: 18px;
      }
      .a4-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 18px;
        text-align: right;
      }
      .a4-table th {
        background: #f1f5f9;
        color: #714B67;
        font-weight: bold;
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        font-size: 11px;
      }
      .a4-table td {
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        font-family: monospace;
        font-size: 12px;
      }
      .a4-signatures {
        margin-top: 35px;
        padding-top: 15px;
        border-top: 1px solid #cbd5e1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        text-align: center;
      }
    </style>

    <div class="a4-document">
      <div class="a4-header">
        <div>
          <h1 style="font-size: 18px; font-weight: bold; color: #714B67; margin: 0 0 4px 0;">عقد عمل كادر طبي وإداري</h1>
          <p style="font-size: 11px; color: #64748b; margin: 0;">وفق أحكام القانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي بدولة الكويت</p>
        </div>
        <div class="a4-badge">
          ${contract.contractReference}
        </div>
      </div>

      <div class="a4-grid">
        <div><strong>الطرف الأول (صاحب العمل):</strong> ${contract.companyName || 'المنشأة (صاحب العمل)'}</div>
        <div><strong>الطرف الثاني (الموظف):</strong> ${contract.employeeNameAr} <span dir="ltr" style="color: #64748b;">(${contract.employeeNameEn})</span></div>
        <div><strong>الرقم المدني:</strong> <span dir="ltr" style="font-family: monospace;">${contract.civilId}</span></div>
        <div><strong>المسمى الوظيفي:</strong> ${contract.jobTitleAr} <span dir="ltr" style="color: #64748b;">(${contract.jobTitleEn})</span></div>
        <div><strong>تاريخ السريان:</strong> <span dir="ltr">${contract.startDate}</span></div>
        <div><strong>نوع العقد:</strong> ${contract.contractType}</div>
      </div>

      <h3 style="font-weight: bold; font-size: 13px; margin: 0 0 8px 0; color: #714B67; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">جدول الأجور والمخصصات الشهرية:</h3>
      <table class="a4-table">
        <thead>
          <tr>
            <th>الراتب الأساسي</th>
            <th>بدل السكن</th>
            <th>بدل الانتقال</th>
            <th>بدل كادر طبي</th>
            <th style="color: #714B67;">إجمالي الراتب التعاقدي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${contract.wageBasic.toFixed(3)} د.ك</td>
            <td>${contract.housingAllowance.toFixed(3)} د.ك</td>
            <td>${contract.transportAllowance.toFixed(3)} د.ك</td>
            <td>${contract.medicalNatureAllowance.toFixed(3)} د.ك</td>
            <td style="font-weight: bold; color: #714B67; background: #faf5ff;">${contract.totalWage.toFixed(3)} د.ك</td>
          </tr>
        </tbody>
      </table>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 18px;">
        <h4 style="font-weight: bold; margin: 0 0 6px 0; color: #334155; font-size: 12px;">أحكام وشروط عامة:</h4>
        <ul style="margin: 0; padding-right: 18px; font-size: 11px; color: #475569; space-y: 4px;">
          <li>فترة التجربة: خضوع الموظف لفترة تجربة مدتها <strong>${contract.trialPeriodDays || 100}</strong> يوماً وفق قانون العمل.</li>
          <li>ساعات العمل الأسبوعية: <strong>${contract.workingHoursWeekly || 48}</strong> ساعة أسبوعياً.</li>
          <li>الإجازة السنوية: يستحق الطرف الثاني إجازة سنوية مدفوعة الأجر قدرها <strong>${contract.annualLeaveDays || 30}</strong> يوماً.</li>
          <li>فترة الإخطار لإنهاء التعاقد: <strong>${contract.noticePeriodDays || 90}</strong> يوماً.</li>
          <li>تذكرة السفر السنوية: ${contract.airTicketAllowance ? 'مستحقة وفق سياسة المنشأة' : 'غير مشمولة'}.</li>
        </ul>
      </div>

      <div class="a4-signatures">
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">توقيع واعتماد الطرف الأول (المنشأة)</p>
          <p style="color: #94a3b8;">............................................</p>
        </div>
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">توقيع وإقرار الطرف الثاني (الموظف)</p>
          <p style="color: #94a3b8;">............................................</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  safePrintAction(`عقد عمل - ${contract.employeeNameAr || contract.employeeNameEn || ''}`);
  setTimeout(() => {
    if (document.body.contains(container)) {
      container.remove();
    }
  }, 1000);
};
