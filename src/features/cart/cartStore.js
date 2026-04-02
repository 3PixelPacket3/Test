const KEY = 'dragons_den_cart';

export function getCart() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });
  saveCart(cart);
  return cart;
}

export function updateCartQty(id, qty) {
  const cart = getCart().map((c) => c.id === id ? { ...c, quantity: Math.max(1, qty) } : c);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}
