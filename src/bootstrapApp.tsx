import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AysedCoreProvider } from './context/AysedCoreProvider';
import { AuthProvider } from './context/AuthContext';
import { clearOutdatedLocalStorage } from './utils/persistentStorage';
import { ProdWriteGuard } from './safety/ProdWriteGuard';

clearOutdatedLocalStorage();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <AysedCoreProvider>
            <ProdWriteGuard />
            <App />
          </AysedCoreProvider>
        </AuthProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
