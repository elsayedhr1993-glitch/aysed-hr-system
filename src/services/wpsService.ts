export interface WPSRecord {
  civilId: string;
  iban: string;
  bankCode: string;
  netSalary: number;
  empName: string;
}

export const generateKuwaitWPSFile = (employerMOHId: string, month: string, year: string, records: WPSRecord[]) => {
  const totalAmount = records.reduce((sum, r) => sum + r.netSalary, 0).toFixed(3);
  const recordCount = records.length;
  
  // ترويسة ملف حماية الأجور PAM / البنوك
  const header = `HDR,${employerMOHId},${year}${month},${recordCount},${totalAmount}`;
  
  // أسطر الموظفين
  const body = records.map(r => 
    `DET,${r.civilId},${r.bankCode},${r.iban},${r.netSalary.toFixed(3)},${r.empName}`
  ).join('\n');

  const fileData = `${header}\n${body}`;
  const blob = new Blob([fileData], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `WPS_${employerMOHId}_${year}_${month}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
