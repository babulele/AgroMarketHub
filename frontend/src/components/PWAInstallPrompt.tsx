import { useState, useEffect } from 'react';
import { showInstallPrompt, isPWAInstalled } from '../utils/pwa';
import { FaDownload, FaTimes } from 'react-icons/fa';

/**
 * PWA Install Prompt Component
 * Shows a banner to prompt users to install the PWA
 */
const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isPWAInstalled());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if user has dismissed the prompt before (stored in localStorage)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-600 text-white p-4 shadow-lg z-50 md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaDownload className="text-2xl" />
          <div>
            <p className="font-semibold">Install AgroMarketHub</p>
            <p className="text-sm text-primary-100">
              Add to your home screen for quick access
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-white text-primary-600 rounded-md hover:bg-primary-50 font-medium text-sm"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-primary-700 rounded-md"
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

