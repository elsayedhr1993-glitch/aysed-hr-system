import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AysedCoreProvider } from './context/AysedCoreProvider';
import { AuthProvider } from './context/AuthContext';
import { clearOutdatedLocalStorage } from './utils/persistentStorage';
import { brand } from './config/brand';
import './index.css';
import './styles/odooReportPrint.css';

document.title = brand.name;

// Purge any outdated local storage cache immediately upon loading
clearOutdatedLocalStorage();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <AysedCoreProvider>
            <App />
          </AysedCoreProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
