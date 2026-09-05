import { safePrintAction } from '../guards/SystemIntegrityGuard';

export interface CommencementData {
  id: string;
  referenceNo: string;
  companyName?: string;
  employeeId: string;
  employeeNameAr: string;
  civilId: string;
  jobTitleAr: string;
  departmentAr: string;
  commencementDate: string; // تاريخ المباشرة الفعلي
  contractStartDate: string;
  mohLicenseNo: string;
  mohLicenseType: 'دائم (Permanent)' | 'مؤقت / تحت الإجراء (Temporary)';
  medicalFitnessStatus: 'لائق طبياً (Fit)' | 'قيد الفحص (Pending)';
  criminalRecordStatus: 'خلو سوابق معتمد (Cleared)' | 'قيد الإجراء (Pending)';
  supervisorName: string;
  notes: string;
  state: 'draft' | 'approved' | 'cancelled';
}

// توليد وطباعة إقرار المباشرة الرسمي A4 (HTML/CSS Engine)
export const printCommencementReport = (data: CommencementData) => {
  const container = document.createElement('div');
  container.className = 'print-area';
  container.innerHTML = `
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
      .a4-commencement {
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
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 20px;
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
      .a4-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #cbd5e1;
        font-size: 12px;
        margin-bottom: 25px;
      }
      .a4-table td {
        padding: 9px 12px;
        border-bottom: 1px solid #e2e8f0;
      }
      .a4-table td.label-col {
        background: #f8fafc;
        font-weight: bold;
        width: 32%;
        color: #334155;
      }
      .a4-signatures {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 1px solid #cbd5e1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        text-align: center;
        font-size: 12px;
      }
    </style>

    <div class="a4-commencement">
      <div class="a4-header">
        <div>
          <h1 style="font-size: 18px; font-weight: bold; color: #0f172a; margin: 0 0 4px 0;">إقرار مباشرة عمل رسمي (Work Commencement Declaration)</h1>
          <p style="font-size: 11px; color: #64748b; margin: 0;">${data.companyName || 'المنشأة'} | الشؤون الإدارية والموارد البشرية</p>
        </div>
        <div class="a4-badge">
          ${data.referenceNo}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 13px; margin-bottom: 15px; color: #1e293b;">
          نقر نحن إدارة الشؤون الإدارية والموارد البشرية بأن الموظف المذكور أدناه قد <strong>باشر العمل فعلياً</strong> لدى المنشأة وفق البيانات التالية:
        </p>

        <table class="a4-table">
          <tbody>
            <tr>
              <td class="label-col">اسم الموظف:</td>
              <td style="font-weight: bold; font-size: 13px;">${data.employeeNameAr}</td>
            </tr>
            <tr>
              <td class="label-col">الرقم المدني:</td>
              <td><span dir="ltr" style="font-family: monospace; font-weight: bold;">${data.civilId}</span></td>
            </tr>
            <tr>
              <td class="label-col">المسمى الوظيفي والقسم:</td>
              <td>${data.jobTitleAr} — (${data.departmentAr})</td>
            </tr>
            <tr>
              <td class="label-col" style="color: #714B67;">تاريخ المباشرة الفعلي:</td>
              <td><span dir="ltr" style="font-family: monospace; font-weight: bold; color: #714B67; font-size: 13px;">${data.commencementDate}</span></td>
            </tr>
            <tr>
              <td class="label-col">ترخيص مزاولة المهنة (MOH):</td>
              <td><span dir="ltr" style="font-family: monospace;">${data.mohLicenseNo || 'N/A'}</span> (${data.mohLicenseType})</td>
            </tr>
            <tr>
              <td class="label-col">اللياقة الصحية وبصمات الأدلة:</td>
              <td>${data.medicalFitnessStatus} | ${data.criminalRecordStatus}</td>
            </tr>
            <tr>
              <td class="label-col">المشرف المباشر:</td>
              <td>${data.supervisorName || 'مدير الدائرة / القسم'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="a4-signatures">
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">إقرار واستلام الموظف</p>
          <p style="color: #94a3b8;">.....................................</p>
        </div>
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">المشرف المباشر / المفوض</p>
          <p style="color: #94a3b8;">.....................................</p>
        </div>
        <div>
          <p style="font-weight: bold; margin-bottom: 40px;">اعتماد الموارد البشرية والختم</p>
          <p style="color: #94a3b8;">.....................................</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  safePrintAction(`إقرار مباشرة عمل - ${data.employeeNameAr || data.referenceNo || ''}`);
  setTimeout(() => {
    if (document.body.contains(container)) {
      container.remove();
    }
  }, 1000);
};
