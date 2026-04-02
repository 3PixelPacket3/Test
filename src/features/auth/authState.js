import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.js';

const state = { user: null, profile: null, loading: true };
const listeners = new Set();

export function getAuthState() {
  return state;
}

export function subscribeAuth(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener(state));
}

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'player',
      gold: 50,
      silver: 0,
      emailVerified: user.emailVerified,
      adminCodeRedeemed: null,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  return (await getDoc(ref)).data();
}

export function initAuthState(onReady) {
  onAuthStateChanged(auth, async (user) => {
    state.loading = false;
    state.user = user;
    state.profile = user ? await ensureUserDoc(user) : null;
    notify();
    onReady();
  });
}
