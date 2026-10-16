import { applyDesignTokens } from './design/tokens';
import { brand } from './config/brand';
import './index.css';
import './styles/odooReportPrint.css';

document.title = brand.name;
applyDesignTokens();

if (import.meta.env.DEV) {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/dev/ui') {
    void import('./pages/devUiMount').then((mod) => mod.mountDevUiPreview());
  } else {
    void import('./bootstrapApp');
  }
} else {
  void import('./bootstrapApp');
}
