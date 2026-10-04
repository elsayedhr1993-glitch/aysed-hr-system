import React from 'react';
import { ODOO_WORKSPACE_INNER } from './odooDesignTokens';

interface OdooAppCanvasProps {
  children: React.ReactNode;
  /** لوحة التطبيقات — خلفية متدرجة بدون حد أقصى ضيق */
  variant?: 'app' | 'launcher';
}

export const OdooAppCanvas: React.FC<OdooAppCanvasProps> = ({ children, variant = 'app' }) => {
  if (variant === 'launcher') {
    return (
      <main className="flex-1 overflow-y-auto w-full odoo-workspace-canvas odoo-workspace-canvas--launcher">
        <div className={`${ODOO_WORKSPACE_INNER} w-full max-w-full`} data-master-layout="wide">
          {children}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto w-full odoo-workspace-canvas">
      <div className={`${ODOO_WORKSPACE_INNER} w-full max-w-full py-4`} data-master-layout="wide">
        {children}
      </div>
    </main>
  );
};
