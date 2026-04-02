import { createDeck, dealHand, payout, scoreHand, shuffle } from './pokerEngine.js';
import { getAuthState } from '../auth/authState.js';
import { resolvePokerRound } from '../../services/firestore.js';
import { toast } from '../../components/toast.js';

let round;

export async function renderPoker() {
  setTimeout(bindPoker);
  return `<section class="panel"><h1>Tavern Poker</h1><p>Ante 5 gold. Draw up to 2 cards for a second chance.</p><button id="start-round" class="btn-primary">Start Round</button><div id="poker-table"></div></section>`;
}

function bindPoker() {
  document.getElementById('start-round')?.addEventListener('click', startRound);
}

function startRound() {
  const deck = shuffle(createDeck());
  const first = dealHand(deck);
  round = { ante: 5, deck: first.deck, hand: first.hand, stage: 'draw' };
  renderTable();
}

function renderTable() {
  const table = document.getElementById('poker-table');
  table.innerHTML = `${round.hand.map((c, i) => `<label class="card"><input type="checkbox" data-i="${i}"/>${c.rank}${c.suit}</label>`).join('')}<button id="draw-btn" class="btn-secondary">Draw Selected</button><button id="resolve-btn" class="btn-primary">Showdown</button>`;
  document.getElementById('draw-btn')?.addEventListener('click', drawCards);
  document.getElementById('resolve-btn')?.addEventListener('click', resolveRound);
}

function drawCards() {
  const marked = [...document.querySelectorAll('input[data-i]:checked')].slice(0, 2).map((i) => Number(i.dataset.i));
  marked.forEach((idx, n) => {
    round.hand[idx] = round.deck[n];
  });
  round.deck = round.deck.slice(marked.length);
  renderTable();
}

async function resolveRound() {
  const { user } = getAuthState();
  const score = scoreHand(round.hand);
  const winGold = payout(score.score, round.ante);
  const delta = winGold - round.ante;
  try {
    await resolvePokerRound(user.uid, delta, delta >= 0);
    toast(`${score.name}! ${delta >= 0 ? `You won ${delta} gold.` : `You lost ${Math.abs(delta)} gold.`}`, delta >= 0 ? 'success' : 'error');
  } catch (err) {
    toast(err.message, 'error');
  }
}
