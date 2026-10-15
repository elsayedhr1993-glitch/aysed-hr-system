import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DevUiPreview } from './DevUiPreview';

export function mountDevUiPreview(): void {
  if (!import.meta.env.DEV) return;
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  createRoot(rootElement).render(
    <StrictMode>
      <DevUiPreview />
    </StrictMode>,
  );
}
