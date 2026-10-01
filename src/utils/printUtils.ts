import { jsPDF } from 'jspdf';
import html2canvasPro from 'html2canvas-pro';
import { triggerSystemAlert } from '../guards/SystemIntegrityGuard';
import {
  collectDocumentStylesheets,
  ODOO_NATIVE_PRINT_CSS,
} from './odooReportPrintBootstrap';

/**
 * تصدير PDF عبر html2canvas — للتنزيل فقط، وليس للطباعة المباشرة.
 */
export async function exportElementToPdf(
  elementIdOrEl: string | HTMLElement,
  fileName: string = 'Document'
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const element =
      typeof elementIdOrEl === 'string'
        ? document.getElementById(elementIdOrEl)
        : elementIdOrEl;

    if (!element) {
      console.error('Element not found for PDF export:', elementIdOrEl);
      return false;
    }

    window.scrollTo(0, 0);

    const canvas = await html2canvasPro(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 5;

    pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight - 10;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 5;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight - 10;
    }

    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(cleanFileName);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return false;
  }
}

function openCleanPrintPopup(element: HTMLElement, fileName: string): boolean {
  try {
    const printWindow = window.open('', '_blank', 'width=1024,height=900,toolbar=0,menubar=0,location=0');
    if (!printWindow || printWindow.closed) return false;

    const sheetHtml = element.outerHTML;
    const styleLinks = collectDocumentStylesheets();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
        ${styleLinks}
        <style>${ODOO_NATIVE_PRINT_CSS}</style>
      </head>
      <body>
        ${sheetHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              try {
                window.focus();
                window.print();
              } catch (e) {
                console.error('Print failed', e);
              }
            }, 350);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  } catch {
    return false;
  }
}

function printElementInPlace(element: HTMLElement): void {
  const placeholder = document.createComment('aysed-print-anchor');
  const parent = element.parentNode;
  if (!parent) {
    window.print();
    return;
  }

  parent.insertBefore(placeholder, element);
  document.body.classList.add('aysed-native-print');
  element.classList.add('odoo-report-print-root');
  document.body.appendChild(element);

  const cleanup = () => {
    element.classList.remove('odoo-report-print-root');
    document.body.classList.remove('aysed-native-print');
    if (placeholder.parentNode) {
      placeholder.parentNode.insertBefore(element, placeholder);
      placeholder.remove();
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  window.print();
}

/**
 * طباعة تقرير — DOM نظيف فقط (بدون html2canvas أو خلفية المودال).
 */
export async function printDocument(htmlContentOrId: string, fileName: string = 'Document') {
  if (typeof window === 'undefined') return;

  const targetEl =
    typeof htmlContentOrId === 'string' ? document.getElementById(htmlContentOrId) : null;

  if (!targetEl) {
    triggerSystemAlert({
      type: 'warning',
      title: 'تعذر الطباعة',
      solution: 'لم يُعثر على منطقة التقرير للطباعة. أعد فتح معاينة التقرير ثم حاول مرة أخرى.',
    });
    return;
  }

  targetEl.classList.add('odoo-report-print-root');

  if (openCleanPrintPopup(targetEl, fileName)) {
    return;
  }

  printElementInPlace(targetEl);
}
