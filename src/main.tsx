import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/schibsted-grotesk/latin-400';
import '@fontsource/schibsted-grotesk/latin-500';
import '@fontsource/schibsted-grotesk/latin-600';
import '@fontsource/schibsted-grotesk/latin-700';
import '@fontsource/schibsted-grotesk/latin-400-italic';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import App from './App';
import { ProvedorSessao } from './sessao';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ProvedorSessao>
        <App />
      </ProvedorSessao>
    </MotionConfig>
  </StrictMode>,
);
