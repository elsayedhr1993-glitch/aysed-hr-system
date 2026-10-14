import { tokens } from '../design/tokens';
/** CSS مضمّن لنافذة الطباعة المنبثقة (بدون html2canvas) */
export const ODOO_NATIVE_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 8mm 10mm 10mm 10mm;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: 100% !important;
    direction: rtl !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: 'Cairo', 'Tajawal', sans-serif !important;
    color: #212529 !important;
  }
  .compliance-tree-print-report,
  .odoo-report-print-root,
  #document-compliance-print-root {
    direction: rtl !important;
    unicode-bidi: embed;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .odoo-report-table-wrap {
    overflow: visible !important;
    border: 1px solid #495057 !important;
    width: 100% !important;
  }
  .odoo-report-table {
    width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
  }
  .odoo-report-table--wrap td,
  .odoo-report-table--wrap th {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    vertical-align: top !important;
  }
  .odoo-report-table thead th {
    border: 1px solid #6d4f66 !important;
    padding: 8px 10px !important;
    font-size: 9pt !important;
    text-align: right !important;
  }
  .odoo-report-table tbody td {
    border: 1px solid #adb5bd !important;
    padding: 7px 10px !important;
    font-size: 9pt !important;
    line-height: 1.4 !important;
    text-align: right !important;
  }
  .odoo-report-print-root {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    box-shadow: none !important;
    border: none !important;
  }
  .odoo-report-sheet--compact-portrait {
    font-size: 9px !important;
    line-height: 1.28 !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-letterhead {
    padding-bottom: 6px !important;
    margin-bottom: 4px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-letterhead-accent {
    height: 3px !important;
    margin-bottom: 6px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-meta-strip {
    padding: 6px 8px !important;
    font-size: 9px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-kpi-cell {
    padding: 4px 6px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-kpi-value {
    font-size: 10px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-table thead th {
    padding: 4px 6px !important;
    font-size: 8px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-table tbody td {
    padding: 3px 5px !important;
    font-size: 8px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-legal-notice {
    padding: 6px 8px !important;
    font-size: 8px !important;
    margin-top: 4px !important;
  }
  .odoo-report-sheet--compact-portrait .odoo-report-footer {
    margin-top: 6px !important;
    padding-top: 4px !important;
    font-size: 8px !important;
  }
  .odoo-report-sheet--framed {
    border: 1px solid ${tokens.color.primary} !important;
    outline: 1px solid #dee2e6;
    outline-offset: -4px;
    padding: 6mm !important;
  }
  .odoo-report-compact-one-page {
    break-inside: avoid-page;
    page-break-inside: avoid;
  }
  .odoo-report-sheet--official-a4 {
    min-height: 279mm !important;
    display: flex !important;
    flex-direction: column !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .odoo-report-a4-layout {
    min-height: 265mm !important;
    display: flex !important;
    flex-direction: column !important;
    flex: 1 1 auto !important;
  }
  .odoo-report-a4-layout__bottom {
    margin-top: auto !important;
  }
  .odoo-report-signature-block {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .odoo-report-table thead th,
  .odoo-report-table tbody tr:nth-child(even) td,
  .odoo-report-table tfoot td,
  .odoo-report-kpi-cell,
  .odoo-report-meta-strip,
  .odoo-report-legal-notice {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  button, .print\\:hidden, .no-print {
    display: none !important;
  }
`;

export function collectDocumentStylesheets(): string {
  if (typeof document === 'undefined') return '';
  const origin = window.location.origin;
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => {
      const href = link.getAttribute('href');
      if (!href) return link.outerHTML;
      const absolute = href.startsWith('http') ? href : `${origin}${href.startsWith('/') ? '' : '/'}${href}`;
      return `<link rel="stylesheet" href="${absolute}" crossorigin>`;
    })
    .join('\n');
}
