import { requireAuth, requireRole, requireVerified } from './guards.js';
import { renderHome } from '../features/home/homePage.js';
import { renderLogin, renderRegister, renderForgot, renderVerifyNotice } from '../features/auth/authPages.js';
import { renderStore } from '../features/store/storePage.js';
import { renderInventory } from '../features/inventory/inventoryPage.js';
import { renderProfile } from '../features/profile/profilePage.js';
import { renderAdmin } from '../features/admin/adminPage.js';
import { renderPoker } from '../features/poker/pokerPage.js';

const routes = new Map();

export function registerRoutes() {
  routes.set('/', { render: renderHome });
  routes.set('/login', { render: renderLogin });
  routes.set('/register', { render: renderRegister });
  routes.set('/forgot-password', { render: renderForgot });
  routes.set('/verify-email', { render: renderVerifyNotice, guard: requireAuth });
  routes.set('/store', { render: renderStore, guard: requireAuth });
  routes.set('/inventory', { render: renderInventory, guard: () => requireAuth() && requireVerified() });
  routes.set('/profile', { render: renderProfile, guard: requireAuth });
  routes.set('/poker', { render: renderPoker, guard: () => requireAuth() && requireVerified() });
  routes.set('/admin', { render: renderAdmin, guard: () => requireAuth() && requireRole(['admin', 'superadmin']) });
}

export function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

export function navigate(path) {
  location.hash = path;
}

export async function renderRoute(root) {
  const path = currentPath();
  const route = routes.get(path) || routes.get('/');

  if (route.guard && !route.guard()) {
    navigate('/login');
    return;
  }

  root.innerHTML = '<section class="panel">Loading...</section>';
  root.innerHTML = await route.render();
}
