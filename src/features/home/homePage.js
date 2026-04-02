import { getAuthState } from '../auth/authState.js';
import { listPublishedNotes, listInventory } from '../../services/firestore.js';

export async function renderHome() {
  const { user, profile } = getAuthState();
  const notes = await listPublishedNotes().catch(() => []);
  const inventory = user ? await listInventory(user.uid).catch(() => []) : [];

  return `
  <section class="hero panel">
    <h1>Dragon's Den</h1>
    <p>Your guild hall for loot, trade, and table games. Forge your legend one transaction at a time.</p>
    <div class="chip-row">
      <a class="btn-primary" href="#/store">Visit Store</a>
      <a class="btn-secondary" href="#/poker">Play Poker</a>
    </div>
  </section>

  <section class="grid-2">
    <article class="panel">
      <h2>Patch Notes</h2>
      ${notes.length ? notes.map((n) => `<div class="note"><h3>${n.title}</h3>${n.contentHtml}</div>`).join('') : '<p>No published notes yet.</p>'}
    </article>
    <article class="panel">
      <h2>Account Summary</h2>
      ${user ? `<p><strong>Role:</strong> ${profile?.role}</p><p><strong>Gold/Silver:</strong> ${profile?.gold ?? 0} / ${profile?.silver ?? 0}</p><p><strong>Inventory Slots:</strong> ${inventory.length}</p>` : '<p>Sign in to view your adventurer profile.</p>'}
    </article>
  </section>`;
}
