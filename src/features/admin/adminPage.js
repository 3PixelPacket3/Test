import { getAuthState } from '../auth/authState.js';
import { listCollection, saveAdminDocument, deleteAdminDocument, setUserRole } from '../../services/firestore.js';

export async function renderAdmin() {
  const { profile } = getAuthState();
  const [products, loot, codes, notes, users] = await Promise.all([
    listCollection('products').catch(() => []),
    listCollection('dmLoot').catch(() => []),
    listCollection('adminCodes').catch(() => []),
    listCollection('developerNotes').catch(() => []),
    profile.role === 'superadmin' ? listCollection('users').catch(() => []) : Promise.resolve([])
  ]);

  setTimeout(() => bindAdmin());

  return `<section class="panel"><h1>Admin Console</h1><p>Manage products, loot, notes, and access codes.</p></section>
  <section class="grid-2">
    ${adminCollection('products', products, ['name','category','price_gold','isActive'])}
    ${adminCollection('dmLoot', loot, ['name','rarity','isActive'])}
    ${adminCollection('adminCodes', codes, ['code','isActive','oneTimeUse'])}
    ${adminCollection('developerNotes', notes, ['title','isPublished'])}
  </section>
  ${profile.role === 'superadmin' ? `<section class="panel"><h2>User Role Management</h2>${users.map((u) => `<div>${u.email} <select data-role-uid="${u.id}"><option ${u.role==='player'?'selected':''}>player</option><option ${u.role==='admin'?'selected':''}>admin</option><option ${u.role==='superadmin'?'selected':''}>superadmin</option></select></div>`).join('')}<button id="save-roles" class="btn-primary">Save roles</button></section>` : ''}`;
}

function adminCollection(name, data, keys) {
  return `<article class="panel"><h2>${name}</h2><button class="btn-secondary" data-add="${name}">Add</button>${data.map((d) => `<div class="row"><code>${keys.map((k)=>`${k}:${d[k]}`).join(' | ')}</code><button data-del="${name}" data-id="${d.id}">Delete</button></div>`).join('') || '<p>Empty</p>'}</article>`;
}

function bindAdmin() {
  document.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', async () => {
    const coll = btn.dataset.add;
    const name = prompt(`Enter name/title/code for ${coll}`);
    if (!name) return;
    const payload = coll === 'adminCodes'
      ? { code: name.toUpperCase(), isActive: true, oneTimeUse: true, redeemed: false }
      : coll === 'developerNotes'
      ? { title: name, contentHtml: '<p>Write release notes.</p>', isPublished: false }
      : { name, isActive: true };
    await saveAdminDocument(coll, payload);
    location.reload();
  }));

  document.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', async () => {
    await deleteAdminDocument(btn.dataset.del, btn.dataset.id);
    location.reload();
  }));

  document.getElementById('save-roles')?.addEventListener('click', async () => {
    const changes = [...document.querySelectorAll('[data-role-uid]')].map((s) => ({ uid: s.dataset.roleUid, role: s.value }));
    await Promise.all(changes.map((c) => setUserRole(c.uid, c.role)));
    location.reload();
  });
}
