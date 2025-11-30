import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker, initializeInstallPrompt, setupOnlineOfflineListeners } from './utils/pwa';
import toast from 'react-hot-toast';

// VitePWA plugin automatically registers the service worker
// This is kept for additional setup if needed
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // VitePWA handles registration, but we can add custom logic here
    registerServiceWorker().catch(console.error);
  });
}

// Initialize PWA install prompt
initializeInstallPrompt();

// Setup online/offline listeners
setupOnlineOfflineListeners(
  () => {
    toast.success('Connection restored', { icon: '✅' });
  },
  () => {
    toast.error('You are offline. Some features may be limited.', { 
      icon: '📡',
      duration: 5000 
    });
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

