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

// توليد وطباعة إقرار المباشرة الرسمي A4
export const printCommencementReport = (data: CommencementData) => {
  const container = document.createElement('div');
  container.className = 'print-area';
  container.innerHTML = `
    <div style="padding: 20px; background: white; color: #0f172a; direction: rtl; text-align: right; font-family: 'Cairo', sans-serif;">
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 18px; font-weight: bold; color: #0f172a;">إقرار مباشرة عمل رسمي (Work Commencement Declaration)</h1>
          <p style="font-size: 11px; color: #64748b;">${data.companyName || 'المنشأة'} | الشؤون الإدارية والموارد البشرية</p>
        </div>
        <div style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
          ${data.referenceNo}
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 13px; margin-bottom: 15px;">
          نقر نحن إدارة الشؤون الإدارية والموارد البشرية بأن الموظف المذكور أدناه قد <strong>باشر العمل فعلياً</strong> لدى المنشأة وفق البيانات التالية:
        </p>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 12px;">
          <tbody>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold; width: 30%;">اسم الموظف:</td><td style="padding: 8px; font-weight: bold;">${data.employeeNameAr}</td></tr>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold;">الرقم المدني:</td><td style="padding: 8px; font-family: monospace;">${data.civilId}</td></tr>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold;">المسمى الوظيفي والقسم:</td><td style="padding: 8px;">${data.jobTitleAr} — (${data.departmentAr})</td></tr>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold; color: #714B67;">تاريخ المباشرة الفعلي:</td><td style="padding: 8px; font-family: monospace; font-weight: bold; color: #714B67;">${data.commencementDate}</td></tr>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold;">ترخيص مزاولة المهنة (MOH):</td><td style="padding: 8px; font-family: monospace;">${data.mohLicenseNo} (${data.mohLicenseType})</td></tr>
            <tr style="border-bottom: 1px solid #cbd5e1;"><td style="padding: 8px; background: #f8fafc; font-weight: bold;">اللياقة الصحية وبصمات الأدلة:</td><td style="padding: 8px;">${data.medicalFitnessStatus} | ${data.criminalRecordStatus}</td></tr>
            <tr><td style="padding: 8px; background: #f8fafc; font-weight: bold;">المشرف المباشر:</td><td style="padding: 8px;">${data.supervisorName}</td></tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); text-align: center; font-size: 12px;">
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
  window.print();
  setTimeout(() => {
    container.remove();
  }, 1000);
};
