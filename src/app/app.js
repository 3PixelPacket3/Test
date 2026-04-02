import { initAuthState } from '../features/auth/authState.js';
import { registerRoutes, renderRoute } from '../router/router.js';
import { renderNav } from '../components/nav.js';
import { renderToastHost } from '../components/toast.js';

export function createApp(root) {
  root.innerHTML = `
    <div class="app-shell">
      <header id="site-nav"></header>
      <main id="route-view" class="container"></main>
      <div id="toast-host"></div>
    </div>
  `;

  registerRoutes();
  renderToastHost(document.getElementById('toast-host'));

  initAuthState(() => {
    renderNav(document.getElementById('site-nav'));
    renderRoute(document.getElementById('route-view'));
  });

  window.addEventListener('hashchange', () => {
    renderNav(document.getElementById('site-nav'));
    renderRoute(document.getElementById('route-view'));
  });
}
