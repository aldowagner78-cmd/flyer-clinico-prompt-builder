function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!window.isSecureContext) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .catch(error => {
        console.warn('No se pudo registrar la PWA:', error);
      });
  });
}

registrarServiceWorker();
