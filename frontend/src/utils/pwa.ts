/**
 * PWA Utility Functions
 * Handles service worker registration and PWA install prompts
 */

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // VitePWA will automatically register the service worker
      // This function is kept for manual registration if needed
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available. Refresh to update.');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }
};

// PWA Install Prompt
let deferredPrompt: any = null;

export const initializeInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('PWA install prompt available');
  });
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('User accepted the install prompt');
  } else {
    console.log('User dismissed the install prompt');
  }

  // Clear the deferredPrompt
  deferredPrompt = null;
  return outcome === 'accepted';
};

export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const setupOnlineOfflineListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', () => {
    console.log('App is online');
    onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('App is offline');
    onOffline();
  });
};

