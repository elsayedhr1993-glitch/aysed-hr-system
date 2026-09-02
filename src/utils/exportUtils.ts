import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

/**
 * Universal Excel Exporter (.xlsx) using SheetJS
 * Converts JSON array or key-value objects directly into styled .xlsx file
 */
export function exportToExcel(
  data: Record<string, any>[], 
  fileName: string = 'Export_Data', 
  sheetName: string = 'بيانات'
): boolean {
  if (!data || data.length === 0) {
    toast.error('لا توجد بيانات متاحة للتصدير');
    return false;
  }

  try {
    const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Set Right-to-Left sheet view for Arabic support
    if (!worksheet['!views']) {
      worksheet['!views'] = [{ RTL: true }];
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, cleanFileName);
    toast.success(`تم تصدير ملف إكسيل بنجاح (${cleanFileName})`);
    return true;
  } catch (error) {
    console.error('Excel export error, falling back to CSV:', error);
    // Fallback to UTF-8 BOM CSV
    return exportToCsv(data, fileName);
  }
}

/**
 * Universal CSV Exporter with UTF-8 BOM (\uFEFF)
 * Ensures 100% Arabic character readability in Excel and all operating systems
 */
export function exportToCsv(
  data: Record<string, any>[], 
  fileName: string = 'Export_Data'
): boolean {
  if (!data || data.length === 0) {
    toast.error('لا توجد بيانات متاحة للتصدير');
    return false;
  }

  try {
    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    // Add UTF-8 BOM for immediate Arabic support in Excel
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const cleanFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', cleanFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`تم تصدير ملف CSV بنجاح (${cleanFileName})`);
    return true;
  } catch (error) {
    console.error('CSV export error:', error);
    toast.error('فشل في تصدير البيانات');
    return false;
  }
}

/**
 * Generate Kuwait Wage Protection System (WPS) Bank Salary File (.sif / .txt / .csv)
 * Strictly matches the Central Bank of Kuwait (CBK) & Ministry of Social Affairs and Labour (MOSAL) WPS specification
 */
export function generateKuwaitWpsFiles(
  payslips: any[], 
  month: string, 
  company: { crNumber?: string; nameEn?: string; nameAr?: string; pifssNumber?: string } = {}
) {
  if (!payslips || payslips.length === 0) {
    toast.error('لا توجد مسيرات رواتب لإنشاء ملف WPS');
    return;
  }

  const crNo = company.crNumber || '201934';
  const compNameEn = (company.nameEn || 'ALMANAR_MEDICAL_CO').replace(/\s+/g, '_').toUpperCase();
  const monthClean = month.replace(/-/g, '');
  const totalNet = payslips.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);
  const recordCount = payslips.length;

  // 1. Official SIF Format (Header & Details)
  const sifHeader = `HDR,${crNo},${compNameEn},${monthClean},${recordCount},${totalNet.toFixed(3)},KWD`;
  const sifRows = payslips.map((p, idx) => {
    const net = (Number(p.netSalary) || 0).toFixed(3);
    const basic = (Number(p.basicSalary) || 0).toFixed(3);
    const allowances = ((Number(p.housingAllowance) || 0) + (Number(p.transportAllowance) || 0) + (Number(p.medicalAllowance) || 0)).toFixed(3);
    const deductions = (Number(p.totalDeductions) || 0).toFixed(3);
    const iban = p.iban || 'KW00BANK0000000000000000000000';
    const civilId = p.civilId || '000000000000';
    const bankName = (p.bankName || 'BANK').replace(/,/g, ' ');

    return `REC,${idx + 1},${civilId},${iban},${bankName},${net},${basic},${allowances},${deductions}`;
  });

  const fullSifText = [sifHeader, ...sifRows].join('\r\n');

  // Trigger SIF (.sif) Download
  const sifBlob = new Blob([fullSifText], { type: 'text/plain;charset=utf-8;' });
  const sifUrl = URL.createObjectURL(sifBlob);
  const sifLink = document.createElement('a');
  sifLink.href = sifUrl;
  sifLink.setAttribute('download', `WPS_MOSAL_${crNo}_${monthClean}.sif`);
  document.body.appendChild(sifLink);
  sifLink.click();
  document.body.removeChild(sifLink);
  URL.revokeObjectURL(sifUrl);

  // 2. Generate matching Excel Sheet (.xlsx) for Finance Audit
  const excelData = payslips.map((p, idx) => ({
    'م': idx + 1,
    'رقم المسير': p.payslipNumber || `PAY-${idx + 1}`,
    'كود الموظف': p.employeeId || `EMP-${idx + 1}`,
    'اسم الموظف': p.employeeName || p.name,
    'الرقم المدني': p.civilId,
    'القسم': p.department,
    'المسمى الوظيفي': p.jobTitle,
    'اسم البنك': p.bankName,
    'رقم الآيبان (IBAN)': p.iban,
    'الراتب الأساسي (د.ك)': Number((p.basicSalary || 0).toFixed(3)),
    'بدل السكن (د.ك)': Number((p.housingAllowance || 0).toFixed(3)),
    'بدل الانتقال (د.ك)': Number((p.transportAllowance || 0).toFixed(3)),
    'بدل طبي / إضافي (د.ك)': Number(((p.medicalAllowance || 0) + (p.overtimeAmount || 0)).toFixed(3)),
    'إجمالي الراتب الشامل (د.ك)': Number((p.grossSalary || 0).toFixed(3)),
    'إجمالي الاستقطاعات والغياب (د.ك)': Number((p.totalDeductions || 0).toFixed(3)),
    'صافي الراتب المستحق للتحويل (د.ك)': Number((p.netSalary || 0).toFixed(3)),
    'حالة المسير': p.status === 'paid' ? 'تم الصرف (WPS)' : p.status === 'confirmed' ? 'معتمد للبنك' : 'مسودة'
  }));

  exportToExcel(excelData, `WPS_Payroll_Sheet_${crNo}_${monthClean}.xlsx`, 'مسير الرواتب WPS');
  toast.success('تم توليد وتنزيل ملف WPS البنكي (.sif) وكشف الإكسيل بنجاح');
}

/**
 * Generate and download text files
 */
export function downloadTextFile(content: string, fileName: string, mimeType: string = 'text/plain;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
