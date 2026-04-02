import { getAuthState } from '../features/auth/authState.js';
import { logout } from '../features/auth/authService.js';

export function renderNav(root) {
  const { user, profile } = getAuthState();
  const adminLinks = profile && ['admin', 'superadmin'].includes(profile.role) ? '<a href="#/admin">Admin</a>' : '';

  root.innerHTML = `
    <nav class="nav container">
      <a class="brand" href="#/">🐉 Dragon's Den</a>
      <div class="links">
        <a href="#/store">Store</a>
        <a href="#/inventory">Inventory</a>
        <a href="#/poker">Poker</a>
        ${adminLinks}
      </div>
      <div class="auth-links">
        ${user ? `<a href="#/profile">${profile?.displayName || 'Profile'}</a><button id="logout-btn" class="btn-secondary">Logout</button>` : '<a href="#/login">Login</a><a href="#/register">Register</a>'}
      </div>
    </nav>
  `;

  const btn = root.querySelector('#logout-btn');
  if (btn) btn.addEventListener('click', async () => logout());
}
