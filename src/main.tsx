import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for Android/PWA offline capabilities and instant updates
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nueva versión disponible para Elibeth Store');
  },
  onOfflineReady() {
    console.log('Elibeth Store lista para funcionar sin conexión');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
