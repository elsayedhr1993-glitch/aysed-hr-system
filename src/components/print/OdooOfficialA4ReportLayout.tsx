import React from 'react';

export const OdooReportSignatureBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`odoo-report-signature-block ${className}`} aria-label="خانات التوقيع">
    <div className="odoo-report-signature-cell">
      <span className="odoo-report-signature-label">إعداد</span>
      <div className="odoo-report-signature-line" />
      <span className="odoo-report-signature-hint">الاسم والتوقيع</span>
    </div>
    <div className="odoo-report-signature-cell">
      <span className="odoo-report-signature-label">مراجعة</span>
      <div className="odoo-report-signature-line" />
      <span className="odoo-report-signature-hint">الاسم والتوقيع</span>
    </div>
    <div className="odoo-report-signature-cell">
      <span className="odoo-report-signature-label">اعتماد</span>
      <div className="odoo-report-signature-line" />
      <span className="odoo-report-signature-hint">الاسم والتوقيع</span>
    </div>
  </div>
);

export interface OdooOfficialA4ReportLayoutProps {
  /** ترويسة رسمية (شعار المنشأة وبياناتها) */
  header?: React.ReactNode;
  children: React.ReactNode;
  /** تذييل مرجعي (REF / تاريخ الإصدار) — يظهر تحت التوقيعات */
  footer?: React.ReactNode;
  showSignatures?: boolean;
  className?: string;
}

/**
 * هيكل A4 موحّد: ترويسة + محتوى يملأ الارتفاع + توقيعات ثلاثية مثبتة أسفل الصفحة.
 */
export const OdooOfficialA4ReportLayout: React.FC<OdooOfficialA4ReportLayoutProps> = ({
  header,
  children,
  footer,
  showSignatures = true,
  className = '',
}) => (
  <div className={`odoo-report-a4-layout ${className}`}>
    {header ? <div className="odoo-report-a4-layout__header">{header}</div> : null}
    <div className="odoo-report-a4-layout__body">{children}</div>
    <div className="odoo-report-a4-layout__bottom print-avoid-break">
      {showSignatures ? <OdooReportSignatureBlock /> : null}
      {footer}
    </div>
  </div>
);
