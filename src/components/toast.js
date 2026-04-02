let host;

export function renderToastHost(el) {
  host = el;
}

export function toast(message, type = 'info') {
  if (!host) return;
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = message;
  host.append(item);
  setTimeout(() => item.remove(), 3500);
}
