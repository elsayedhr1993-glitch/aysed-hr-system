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
