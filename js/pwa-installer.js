// PWA Register & Network Status Handler

export function initPWA() {
  const offlineBadge = document.getElementById('offline-badge');
  const onlineBadge = document.getElementById('online-badge');

  function updateOnlineStatus() {
    if (navigator.onLine) {
      if (offlineBadge) offlineBadge.classList.remove('visible');
      if (onlineBadge) onlineBadge.style.display = 'inline-flex';
    } else {
      if (offlineBadge) offlineBadge.classList.add('visible');
      if (onlineBadge) onlineBadge.style.display = 'none';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('Service Worker Registered successfully:', reg.scope);
        })
        .catch(err => {
          console.warn('Service Worker registration failed:', err);
        });
    });
  }

  // Handle Install Prompt (Optional PWA banner)
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted PWA installation');
          }
          deferredPrompt = null;
          installBtn.style.display = 'none';
        });
      });
    }
  });
}
