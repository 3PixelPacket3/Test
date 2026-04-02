import { initAuthState } from '../features/auth/authState.js';
import { registerRoutes, renderRoute } from '../router/router.js';
import { renderNav } from '../components/nav.js';
import { renderToastHost } from '../components/toast.js';
import { firebaseConfigErrors, firebaseReady } from '../lib/firebase.js';

function renderBootstrapError(root, title, details) {
  root.innerHTML = `
    <div class="app-shell">
      <main class="container">
        <section class="panel">
          <h1>${title}</h1>
          <p>The app could not start. Fix the setup items below and refresh.</p>
          <ul>${details.map((d) => `<li>${d}</li>`).join('')}</ul>
          <p>Also ensure Firebase Authentication (Email/Password) and Firestore are enabled, and your web origin is in Authorized Domains.</p>
        </section>
      </main>
    </div>
  `;
}

export function createApp(root) {
  if (!firebaseReady) {
    renderBootstrapError(root, 'Firebase configuration missing', firebaseConfigErrors);
    return;
  }

  root.innerHTML = `
    <div class="app-shell">
      <header id="site-nav"></header>
      <main id="route-view" class="container"></main>
      <div id="toast-host"></div>
    </div>
  `;

  registerRoutes();
  renderToastHost(document.getElementById('toast-host'));

  const safeRender = async () => {
    try {
      renderNav(document.getElementById('site-nav'));
      await renderRoute(document.getElementById('route-view'));
    } catch (error) {
      renderBootstrapError(root, 'Runtime startup error', [error?.message || 'Unknown error']);
    }
  };

  initAuthState(() => {
    safeRender();
  });

  window.addEventListener('hashchange', safeRender);
}
