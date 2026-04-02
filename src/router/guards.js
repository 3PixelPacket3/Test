import { getAuthState } from '../features/auth/authState.js';

export function requireAuth() {
  const { user } = getAuthState();
  return !!user;
}

export function requireVerified() {
  const { user } = getAuthState();
  return !!user?.emailVerified;
}

export function requireRole(roles = []) {
  const { profile } = getAuthState();
  return profile && roles.includes(profile.role);
}
