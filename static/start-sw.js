import { dev } from '$app/environment';
if ('serviceWorker' in navigator) {
  addEventListener('load', function () {
    navigator.serviceWorker.register('../service-worker.js', {
        type: dev ? 'module' : 'classic'
    });
  });
}