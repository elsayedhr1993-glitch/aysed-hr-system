import React from 'react';
import { ODOO_REPORT_SHEET_CLASS, ODOO_REPORT_TABLE_CLASS } from './odooReportTheme';

export const OdooReportSheet = React.forwardRef<
  HTMLDivElement,
  { id?: string; children: React.ReactNode; className?: string }
>(({ id, children, className = '' }, ref) => (
  <div
    ref={ref}
    id={id}
    className={`${ODOO_REPORT_SHEET_CLASS} bg-white border border-slate-200 print:border-none p-8 sm:p-10 max-w-[210mm] mx-auto shadow-sm print:shadow-none space-y-5 text-slate-800 ${className}`}
  >
    {children}
  </div>
));
OdooReportSheet.displayName = 'OdooReportSheet';

export const OdooReportTitleBand: React.FC<{
  title: string;
  subtitle?: string;
  meta?: string;
}> = ({ title, subtitle, meta }) => (
  <div className="odoo-report-title-band text-center">
    <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
    {subtitle && <p className="text-[11px] font-semibold text-[#714B67] mt-0.5">{subtitle}</p>}
    {meta && (
      <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{meta}</p>
    )}
  </div>
);

export const OdooReportKpiStrip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="odoo-report-kpi-strip grid grid-cols-2 sm:grid-cols-4 gap-2">{children}</div>
);

export const OdooReportKpiCell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="odoo-report-kpi-cell">
    <span className="odoo-report-kpi-label">{label}</span>
    <span className="odoo-report-kpi-value">{value}</span>
  </div>
);

export const OdooReportTable: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className="odoo-report-table-wrap overflow-hidden rounded-md border border-[#dee2e6]">
    <table className={`${ODOO_REPORT_TABLE_CLASS} w-full text-right ${className}`}>{children}</table>
  </div>
);

export const OdooReportFooter: React.FC<{
  companyName?: string;
  reportRef?: string;
  generatedAt?: string;
}> = ({ companyName, reportRef, generatedAt }) => {
  const when = generatedAt || new Date().toLocaleString('ar-KW');
  return (
    <footer className="odoo-report-footer mt-6 pt-3 border-t border-[#dee2e6] text-[10px] text-slate-500 flex flex-wrap justify-between gap-2">
      <span>{companyName ? `${companyName} · ` : ''}Aysed HR — تقرير رسمي</span>
      <span className="font-mono">
        {reportRef ? `REF: ${reportRef} · ` : ''}
        {when}
      </span>
    </footer>
  );
};

export const OdooReportLegalNotice: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title = 'إقرار المطابقة والامتثال',
}) => (
  <div className="odoo-report-legal-notice">
    <p className="odoo-report-legal-title">{title}</p>
    <div className="odoo-report-legal-body">{children}</div>
  </div>
);
