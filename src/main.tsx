import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/mhchem.mjs';
import './index.css';
import { FirebaseProvider, useFirebase } from './FirebaseProvider';

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { loading, error } = useFirebase();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#14b8a6' }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono tracking-widest">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Authentication Error</h1>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <p>Please go to the Firebase Console &gt; Authentication &gt; Sign-in method, and enable <strong>Anonymous</strong>.</p>
      </div>
    );
  }

  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseProvider>
      <AuthWrapper>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthWrapper>
    </FirebaseProvider>
  </StrictMode>,
);
