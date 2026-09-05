import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AysedCoreProvider } from './context/AysedCoreProvider';
import { clearOutdatedLocalStorage } from './utils/persistentStorage';
import './index.css';

// Purge any outdated local storage cache immediately upon loading
clearOutdatedLocalStorage();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AysedCoreProvider>
          <App />
        </AysedCoreProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
