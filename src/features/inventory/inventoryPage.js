import { getAuthState } from '../auth/authState.js';
import { listInventory } from '../../services/firestore.js';

export async function renderInventory() {
  const { user } = getAuthState();
  const items = await listInventory(user.uid).catch(() => []);
  return `<section class="panel"><h1>Inventory</h1><input id="inv-search" placeholder="Search"/><div id="inv-list">${renderItems(items)}</div></section>`;
}

function renderItems(items) {
  if (!items.length) return '<p>No items yet.</p>';
  return `<div class="card-grid">${items.map((i) => `<article class="card"><h3>${i.name}</h3><p>${i.category}</p><p>Qty: ${i.quantity}</p><small>${i.sourceType}</small></article>`).join('')}</div>`;
}
