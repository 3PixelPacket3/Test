import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.js';

export async function registerWithEmail({ email, password, displayName, adminCode }) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await sendEmailVerification(result.user);

  if (adminCode?.trim()) {
    await redeemAdminCode(result.user.uid, adminCode.trim().toUpperCase());
  }

  return result.user;
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function redeemAdminCode(uid, code) {
  const codeRef = doc(db, 'adminCodes', code);
  const userRef = doc(db, 'users', uid);

  await runTransaction(db, async (tx) => {
    const [codeSnap, userSnap] = await Promise.all([tx.get(codeRef), tx.get(userRef)]);
    if (!codeSnap.exists()) throw new Error('Invalid admin code.');
    if (!userSnap.exists()) throw new Error('User profile missing.');

    const codeData = codeSnap.data();
    const userData = userSnap.data();

    if (!codeData.isActive) throw new Error('Admin code is inactive.');
    if (codeData.oneTimeUse && codeData.redeemed) throw new Error('Admin code already redeemed.');

    tx.update(userRef, {
      role: 'admin',
      adminCodeRedeemed: code,
      updatedAt: serverTimestamp()
    });

    if (codeData.oneTimeUse) {
      tx.update(codeRef, {
        redeemed: true,
        redeemedBy: uid,
        redeemedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    tx.set(doc(db, 'transactions', `${uid}_${Date.now()}_admin_upgrade`), {
      userId: uid,
      type: 'manual_adjustment',
      amountGold: 0,
      amountSilver: 0,
      metadata: { reason: 'Admin code redeemed', code },
      createdAt: serverTimestamp(),
      createdBy: uid
    });
  });
}
