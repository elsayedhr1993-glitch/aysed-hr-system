import { applyDesignTokens } from './design/tokens';
import { brand } from './config/brand';
import './index.css';
import './styles/odooReportPrint.css';

document.title = brand.name;
applyDesignTokens();

const devUi =
  import.meta.env.DEV &&
  (window.location.pathname.replace(/\/+$/, '') || '/') === '/dev/ui';

if (devUi) {
  void import('./pages/devUiMount').then((mod) => mod.mountDevUiPreview());
} else {
  void import('./bootstrapApp');
}
