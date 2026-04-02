import { auth } from '../../lib/firebase.js';
import { registerWithEmail, loginWithEmail, resetPassword } from './authService.js';
import { toast } from '../../components/toast.js';

function formWrap(title, fields, actionLabel, id) {
  return `<section class="panel auth"><h1>${title}</h1><form id="${id}">${fields}<button class="btn-primary">${actionLabel}</button></form></section>`;
}

export async function renderLogin() {
  setTimeout(() => {
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await loginWithEmail(fd.get('email'), fd.get('password'));
        location.hash = '#/';
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });
  return formWrap('Login', '<input name="email" type="email" placeholder="Email" required/><input name="password" type="password" placeholder="Password" required/><a href="#/forgot-password">Forgot password?</a>', 'Enter Den', 'login-form');
}

export async function renderRegister() {
  setTimeout(() => {
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await registerWithEmail({
          email: fd.get('email'),
          password: fd.get('password'),
          displayName: fd.get('displayName'),
          adminCode: fd.get('adminCode')
        });
        toast('Verification email sent.', 'success');
        location.hash = '#/verify-email';
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });

  return formWrap('Register', '<input name="displayName" placeholder="Display Name" required/><input name="email" type="email" placeholder="Email" required/><input name="password" type="password" minlength="6" placeholder="Password" required/><input name="adminCode" placeholder="Admin code (optional)"/>', 'Create Adventurer', 'register-form');
}

export async function renderForgot() {
  setTimeout(() => {
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await resetPassword(fd.get('email'));
        toast('Reset email sent.', 'success');
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  });

  return formWrap('Reset Password', '<input name="email" type="email" placeholder="Email" required/>', 'Send Reset Link', 'forgot-form');
}

export async function renderVerifyNotice() {
  return `<section class="panel"><h1>Verify your email</h1><p>Signed in as <strong>${auth.currentUser?.email || 'unknown'}</strong>. Please verify your email before protected gameplay features.</p></section>`;
}
