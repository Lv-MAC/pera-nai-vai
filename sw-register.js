// Service Worker Registration & Update Handler
// This file handles PWA installation, updates, and offline detection

let deferredInstallPrompt = null;
let newWorker = null;

// Configuration
const PWA_CONFIG = {
  showInstallPrompt: true,
  installPromptDelay: 30000, // Show install prompt after 30 seconds
  showUpdateNotification: true,
  autoUpdateDelay: 5000, // Auto-update after 5 seconds if user doesn't interact
  enableOfflineIndicator: true
};

// Initialize PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    setupInstallPrompt();
    setupOfflineDetection();
  });
}

// Register Service Worker
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered successfully:', registration.scope);

    // Check for updates every 60 seconds
    setInterval(() => {
      registration.update();
    }, 60000);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      newWorker = registration.installing;
      console.log('[PWA] New service worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, show update notification
          console.log('[PWA] New version available!');
          if (PWA_CONFIG.showUpdateNotification) {
            showUpdateNotification();
          }
        }
      });
    });

    // Check for updates on visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        registration.update();
      }
    });

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

// Show update notification
function showUpdateNotification() {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="pwa-update-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    <div class="pwa-update-content">
      <div class="pwa-update-title">
        New Version Available! 🎉
      </div>
      <div class="pwa-update-message">
        We've added new features and improvements.
      </div>
    </div>
    <div class="pwa-update-actions">
      <button class="pwa-update-btn pwa-update-btn-primary" onclick="updateApp()">
        Update Now
      </button>
      <button class="pwa-update-btn pwa-update-btn-secondary" onclick="dismissUpdate()">
        Later
      </button>
    </div>
  `;

  document.body.appendChild(notification);

  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Auto-update after delay if user doesn't interact
  if (PWA_CONFIG.autoUpdateDelay > 0) {
    setTimeout(() => {
      if (document.body.contains(notification)) {
        updateApp();
      }
    }, PWA_CONFIG.autoUpdateDelay);
  }
}

// Update app - reload page with new service worker
window.updateApp = function() {
  const notification = document.querySelector('.pwa-update-notification');
  if (notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  // Tell service worker to skip waiting
  if (newWorker) {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
  }

  // Reload page to activate new service worker
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

// Dismiss update notification
window.dismissUpdate = function() {
  const notification = document.querySelector('.pwa-update-notification');
  if (notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }

  // Show again after next reload
  sessionStorage.setItem('pwa-update-dismissed', 'true');
};

// Setup install prompt
function setupInstallPrompt() {
  if (!PWA_CONFIG.showInstallPrompt) return;

  // Capture install prompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('[PWA] Install prompt captured');

    // Don't show if already dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      return;
    }

    // Show custom install prompt after delay
    setTimeout(() => {
      showInstallPrompt();
    }, PWA_CONFIG.installPromptDelay);
  });

  // Log install result
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredInstallPrompt = null;

    // Hide install prompt if showing
    const prompt = document.querySelector('.pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
  });
}

// Show install prompt
function showInstallPrompt() {
  // Don't show if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // Create install prompt
  const prompt = document.createElement('div');
  prompt.className = 'pwa-install-prompt';
  prompt.innerHTML = `
    <div class="pwa-install-header">
      <div class="pwa-install-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        </svg>
      </div>
      <div>
        <div class="pwa-install-title">Install Pera nai Vai</div>
        <div class="pwa-install-subtitle">Use like a native app</div>
      </div>
    </div>
    <ul class="pwa-install-benefits">
      <li class="pwa-install-benefit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        Works offline - no internet needed
      </li>
      <li class="pwa-install-benefit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        Quick access from home screen
      </li>
      <li class="pwa-install-benefit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
        Faster than browser version
      </li>
    </ul>
    <div class="pwa-install-actions">
      <button class="pwa-install-btn pwa-install-btn-install" onclick="installPWA()">
        Install App
      </button>
      <button class="pwa-install-btn pwa-install-btn-later" onclick="dismissInstallPrompt()">
        Maybe Later
      </button>
    </div>
  `;

  document.body.appendChild(prompt);

  // Show with animation
  setTimeout(() => {
    prompt.classList.add('show');
  }, 100);
}

// Install PWA
window.installPWA = async function() {
  if (!deferredInstallPrompt) {
    console.log('[PWA] Install prompt not available');
    return;
  }

  // Show native install prompt
  deferredInstallPrompt.prompt();

  // Wait for user choice
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log('[PWA] Install outcome:', outcome);

  // Hide custom prompt
  const prompt = document.querySelector('.pwa-install-prompt');
  if (prompt) {
    prompt.classList.remove('show');
    setTimeout(() => {
      prompt.remove();
    }, 300);
  }

  deferredInstallPrompt = null;
};

// Dismiss install prompt
window.dismissInstallPrompt = function() {
  const prompt = document.querySelector('.pwa-install-prompt');
  if (prompt) {
    prompt.classList.remove('show');
    setTimeout(() => {
      prompt.remove();
    }, 300);
  }

  // Don't show again for 7 days
  const dismissUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
  localStorage.setItem('pwa-install-dismissed', dismissUntil.toString());
};

// Setup offline detection
function setupOfflineDetection() {
  if (!PWA_CONFIG.enableOfflineIndicator) return;

  // Create offline indicator
  const indicator = document.createElement('div');
  indicator.className = 'pwa-offline-indicator';
  indicator.textContent = 'You are offline - some features may be limited';
  document.body.appendChild(indicator);

  // Show/hide based on connection status
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      indicator.classList.add('show');
      indicator.classList.remove('online');
      indicator.textContent = 'You are offline - some features may be limited';
    } else {
      indicator.classList.add('online');
      indicator.textContent = 'Back online! ✓';
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 3000);
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial check
  if (!navigator.onLine) {
    updateOnlineStatus();
  }
}

// Listen for controller change (new service worker activated)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] New service worker activated');
  });
}

// Export for use in other scripts
window.PWA = {
  updateApp,
  dismissUpdate,
  installPWA,
  dismissInstallPrompt,
  getVersion: async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      });
    }
    return null;
  }
};

console.log('[PWA] Registration script loaded');
