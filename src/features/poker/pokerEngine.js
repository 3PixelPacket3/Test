const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck() {
  return SUITS.flatMap((s) => RANKS.map((r) => ({ suit: s, rank: r })));
}

export function shuffle(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealHand(deck, count = 5) {
  return { hand: deck.slice(0, count), deck: deck.slice(count) };
}

export function scoreHand(hand) {
  const values = hand.map((c) => RANKS.indexOf(c.rank)).sort((a, b) => a - b);
  const counts = values.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});
  const freq = Object.values(counts).sort((a, b) => b - a);
  const flush = new Set(hand.map((c) => c.suit)).size === 1;
  const straight = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
  if (straight && flush) return { score: 8, name: 'Straight Flush' };
  if (freq[0] === 4) return { score: 7, name: 'Four of a Kind' };
  if (freq[0] === 3 && freq[1] === 2) return { score: 6, name: 'Full House' };
  if (flush) return { score: 5, name: 'Flush' };
  if (straight) return { score: 4, name: 'Straight' };
  if (freq[0] === 3) return { score: 3, name: 'Three of a Kind' };
  if (freq[0] === 2 && freq[1] === 2) return { score: 2, name: 'Two Pair' };
  if (freq[0] === 2) return { score: 1, name: 'Pair' };
  return { score: 0, name: 'High Card' };
}

export function payout(score, ante) {
  const multipliers = [0, 1, 2, 3, 4, 6, 9, 25, 50];
  return multipliers[score] * ante;
}
