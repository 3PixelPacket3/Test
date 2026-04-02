import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getAuthState } from '../auth/authState.js';
import { db } from '../../lib/firebase.js';
import { convertSilverToGold, getPokerStats } from '../../services/firestore.js';

export async function renderProfile() {
  const { user, profile } = getAuthState();
  const stats = await getPokerStats(user.uid);
  const txSnap = await getDocs(query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(8))).catch(() => ({ docs: [] }));
  const tx = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  setTimeout(() => {
    document.getElementById('convert-btn')?.addEventListener('click', async () => {
      await convertSilverToGold(user.uid, 10);
      location.reload();
    });
  });

  return `<section class="panel"><h1>Profile</h1><p>${profile.displayName} (${profile.role})</p><p>Email verified: ${user.emailVerified ? 'Yes' : 'No'}</p><p>Gold: ${profile.gold} / Silver: ${profile.silver}</p><button id="convert-btn" class="btn-secondary">Convert 10 silver to 1 gold</button></section>
  <section class="panel"><h2>Poker Stats</h2><p>Wins/Losses: ${stats.wins}/${stats.losses}</p><p>Games: ${stats.gamesPlayed}</p></section>
  <section class="panel"><h2>Recent Transactions</h2><ul>${tx.map((t) => `<li>${t.type} (${t.amountGold}g/${t.amountSilver}s)</li>`).join('')}</ul></section>`;
}
