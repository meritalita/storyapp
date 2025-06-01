import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  // Buat instance App dan simpan ke window.appInstance supaya bisa diakses global
  window.appInstance = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await window.appInstance.renderPage();
  await registerServiceWorker();

  console.log('Berhasil mendaftarkan service worker.');

  window.addEventListener('hashchange', async () => {
    await window.appInstance.renderPage();
  });

   // Skip to Content agar tidak reload halaman dan fokus ke konten utama
  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');
  skipLink.addEventListener('click', function(event) {
    event.preventDefault();
    skipLink.blur();

    mainContent.setAttribute('tabindex', '-1'); // supaya bisa fokus
    mainContent.focus();
    mainContent.scrollIntoView();
  });
});
