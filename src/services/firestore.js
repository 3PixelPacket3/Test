import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase.js';

export async function listPublishedNotes() {
  const q = query(collection(db, 'developerNotes'), where('isPublished', '==', true), orderBy('updatedAt', 'desc'), limit(5));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listProducts({ category = '', search = '' } = {}) {
  const q = query(collection(db, 'products'), where('isActive', '==', true), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => (!category || p.category === category) && (!search || p.name.toLowerCase().includes(search.toLowerCase())));
}

export async function listInventory(uid) {
  const q = query(collection(db, 'inventory'), where('userId', '==', uid), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPokerStats(uid) {
  const ref = doc(db, 'pokerStats', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { wins: 0, losses: 0, gamesPlayed: 0, lifetimeGoldWon: 0, lifetimeGoldLost: 0 };
}

export async function convertSilverToGold(uid, silverToConvert = 10) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data();
    if (!data || data.silver < silverToConvert) throw new Error('Not enough silver.');
    const gained = Math.floor(silverToConvert / 10);
    tx.update(userRef, {
      silver: data.silver - gained * 10,
      gold: data.gold + gained,
      updatedAt: serverTimestamp()
    });
    tx.set(doc(collection(db, 'transactions')), {
      userId: uid,
      type: 'currency_conversion',
      amountGold: gained,
      amountSilver: -gained * 10,
      createdAt: serverTimestamp(),
      createdBy: uid,
      metadata: { conversionRate: 10 }
    });
  });
}

export async function purchaseCart(uid, cartItems) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const user = userSnap.data();
    const total = cartItems.reduce((sum, item) => sum + item.price_gold * item.quantity, 0);
    if (user.gold < total) throw new Error('Insufficient gold.');

    tx.update(userRef, { gold: user.gold - total, updatedAt: serverTimestamp() });

    for (const item of cartItems) {
      tx.set(doc(collection(db, 'inventory')), {
        userId: uid,
        storeItemId: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl || '',
        quantity: item.quantity,
        notes: '',
        sourceType: 'store_purchase',
        createdBy: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    tx.set(doc(collection(db, 'transactions')), {
      userId: uid,
      type: 'purchase',
      amountGold: -total,
      amountSilver: 0,
      metadata: { itemCount: cartItems.length },
      createdAt: serverTimestamp(),
      createdBy: uid
    });
  });
}

export async function resolvePokerRound(uid, deltaGold, didWin) {
  const userRef = doc(db, 'users', uid);
  const statRef = doc(db, 'pokerStats', uid);

  await runTransaction(db, async (tx) => {
    const [userSnap, statSnap] = await Promise.all([tx.get(userRef), tx.get(statRef)]);
    const user = userSnap.data();
    const stats = statSnap.exists() ? statSnap.data() : { wins: 0, losses: 0, gamesPlayed: 0, lifetimeGoldWon: 0, lifetimeGoldLost: 0 };
    if (user.gold + deltaGold < 0) throw new Error('Insufficient gold for this action.');

    tx.update(userRef, { gold: user.gold + deltaGold, updatedAt: serverTimestamp() });
    tx.set(statRef, {
      wins: stats.wins + (didWin ? 1 : 0),
      losses: stats.losses + (didWin ? 0 : 1),
      gamesPlayed: stats.gamesPlayed + 1,
      lifetimeGoldWon: stats.lifetimeGoldWon + (didWin ? Math.max(0, deltaGold) : 0),
      lifetimeGoldLost: stats.lifetimeGoldLost + (!didWin ? Math.abs(Math.min(0, deltaGold)) : 0),
      updatedAt: serverTimestamp()
    }, { merge: true });

    tx.set(doc(collection(db, 'transactions')), {
      userId: uid,
      type: 'poker_result',
      amountGold: deltaGold,
      amountSilver: 0,
      metadata: { didWin },
      createdAt: serverTimestamp(),
      createdBy: uid
    });
  });
}

export async function saveAdminDocument(collectionName, payload, id = null) {
  if (id) {
    await updateDoc(doc(db, collectionName, id), { ...payload, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function deleteAdminDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}

export async function listCollection(collectionName) {
  const snap = await getDocs(query(collection(db, collectionName), orderBy('updatedAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setUserRole(uid, role) {
  await setDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() }, { merge: true });
}
