import { getAuthState } from '../auth/authState.js';
import { addToCart, clearCart, getCart, updateCartQty } from '../cart/cartStore.js';
import { listProducts, purchaseCart } from '../../services/firestore.js';
import { toast } from '../../components/toast.js';

export async function renderStore() {
  const products = await listProducts().catch(() => []);
  const cart = getCart();

  setTimeout(() => bindStoreEvents(products));

  return `<section class="panel"><h1>Guild Store</h1><div class="card-grid">${products.map((p) => `<article class="card"><img src="${p.imageUrl || 'https://picsum.photos/seed/'+p.id+'/240/140'}" alt="${p.name}"/><h3>${p.name}</h3><p>${p.description}</p><p><strong>${p.price_gold} gold</strong></p><button class="btn-primary add-cart" data-id="${p.id}">Add to cart</button></article>`).join('')}</div></section>
  <section class="panel"><h2>Cart</h2>${cartView(cart)}</section>`;
}

function cartView(cart) {
  if (!cart.length) return '<p>Your pack is empty.</p>';
  const total = cart.reduce((sum, i) => sum + i.price_gold * i.quantity, 0);
  return `<ul>${cart.map((i) => `<li>${i.name} - ${i.price_gold}g x <input type="number" min="1" value="${i.quantity}" data-qty-id="${i.id}" class="qty"/></li>`).join('')}</ul><p><strong>Total: ${total}g</strong></p><button id="confirm-purchase" class="btn-primary">Confirm Purchase</button><button id="clear-cart" class="btn-secondary">Clear</button>`;
}

function bindStoreEvents(products) {
  document.querySelectorAll('.add-cart').forEach((b) => b.addEventListener('click', () => {
    const product = products.find((p) => p.id === b.dataset.id);
    addToCart(product);
    location.hash = '#/store';
  }));

  document.querySelectorAll('.qty').forEach((i) => i.addEventListener('change', () => {
    updateCartQty(i.dataset.qtyId, Number(i.value));
  }));

  document.getElementById('clear-cart')?.addEventListener('click', () => {
    clearCart();
    location.hash = '#/store';
  });

  document.getElementById('confirm-purchase')?.addEventListener('click', async () => {
    const { user } = getAuthState();
    try {
      await purchaseCart(user.uid, getCart());
      clearCart();
      toast('Purchase complete.', 'success');
      location.hash = '#/inventory';
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}
