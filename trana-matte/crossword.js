'use strict';

const get = id => document.getElementById(id);
const historyKey = 'kalana-multiplication-history-v1';
const languageKey = 'kalana-multiplication-language-v1';
const picker = get('language');
const difficulty = get('difficulty');
const player = get('player');
const levels = { easy:3, medium:4, hard:5 };
const medals = { easy:'bronze', medium:'silver', hard:'gold' };
let language = 'sv';
let copy;
let round;
let ticker;

try {
  const saved = localStorage.getItem(languageKey);
  if (Object.hasOwn(crosswordCopy, saved)) language = saved;
} catch { /* Use the default language. */ }

const random = (min,max) => min + Math.floor(Math.random() * (max - min + 1));

function buildPuzzle(level) {
  let rows;
  let horizontal;
  let vertical;
  if (level === 'easy') {
    const a = random(4,6), b = random(1,3), c = random(1,3), d = random(1,c);
    rows = [[a,b,a+b],[c,d,c-d],[a-c,b+d,a+b-(c-d)]];
    horizontal = ['+','−'];
    vertical = ['−','+','−'];
  } else if (level === 'medium') {
    const a = random(3,9), b = random(3,9), c = random(10,29), d = random(3,9);
    rows = [[a,b,a*b],[c,d,c-d],[a+c,b*d,a*b+c-d]];
    horizontal = ['×','−'];
    vertical = ['+','×','+'];
  } else {
    const divisor = random(3,12), quotient = random(4,12);
    const a = divisor * quotient, b = random(20,95);
    const c = divisor, d = random(3,12);
    rows = [[a,b,a+b],[c,d,c*d],[quotient,b-d,a+b+c*d]];
    horizontal = ['+','×'];
    vertical = ['÷','−','+'];
  }
  const cells = Array(25).fill(null);
  // Two horizontal equations cross three vertical equations.
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) cells[10*r + 2*c] = rows[r][c];
  }
  for (let r = 0; r < 2; r++) {
    cells[10*r + 1] = horizontal[r];
    cells[10*r + 3] = '=';
  }
  for (let c = 0; c < 3; c++) {
    cells[5 + 2*c] = vertical[c];
    cells[15 + 2*c] = '=';
  }
  // Each across equation has at most one blank. The bottom cells can then
  // be solved from the completed columns, so every generated grid is solvable.
  const hidden = [2*random(0,2), 10 + 2*random(0,2)];
  let column = random(0,2);
  while (hidden.length < levels[level]) {
    hidden.push(20 + 2*column);
    column = (column + 1) % 3;
  }
  return { cells, hidden };
}

function readHistory() {
  const records = JSON.parse(localStorage.getItem(historyKey) || '[]');
  return Array.isArray(records) ? records : [];
}

function earnedMedals(records, name) {
  const normalized = name.trim().normalize('NFC').toLowerCase();
  if (!normalized) return new Set();
  return new Set(records.filter(record => record.operation === 'crossword' && record.passed
    && Object.hasOwn(medals, record.difficulty) && record.player?.trim().normalize('NFC').toLowerCase() === normalized)
    .map(record => record.difficulty));
}

function renderMedals() {
  let records = [];
  try { records = readHistory(); } catch { /* The collection is unavailable. */ }
  const name = player.value.trim();
  const earned = earnedMedals(records, name);
  get('medal-progress').textContent = name ? copy.medalProgress(earned.size) : copy.medalPrompt;
  for (const level of Object.keys(medals)) {
    const card = get('medal-' + level);
    const hasMedal = earned.has(level);
    card.classList.toggle('earned', hasMedal);
    card.querySelector('.medal-state').textContent = hasMedal ? copy.medalEarned : copy.medalLocked;
  }
}

function renderLanguage() {
  copy = { ...translations[language], ...adventureCopy[language], ...portalCopy[language], ...crosswordCopy[language] };
  document.documentElement.lang = language;
  document.title = copy.crossTitle;
  picker.value = language;
  picker.setAttribute('aria-label', copy.language);
  for (const node of document.querySelectorAll('[data-copy]')) node.textContent = copy[node.dataset.copy];
  player.placeholder = copy.placeholder;
  player.setCustomValidity('');
  get('difficulty-info').textContent = copy[difficulty.value + 'Info'];
  get('start').textContent = round ? copy.another : copy.newPuzzle;
  get('puzzle-timer').setAttribute('aria-label', copy.time);
  renderMedals();
  if (!round) return;
  get('active-level').textContent = copy[round.level];
  for (const [index,input] of round.inputs) labelInput(index,input);
  showStatus();
}

function labelInput(index,input) {
  input.setAttribute('aria-label', copy.square(Math.floor(index/5)+1,index%5+1));
}

function showStatus() {
  const status = round.status ? copy[round.status] : '';
  const save = round.solved ? copy[round.saved ? 'saved' : 'crossSaveError'] : '';
  const reward = round.newMedal ? copy.medalWon(copy[medals[round.level]]) : '';
  get('puzzle-status').textContent = [status, reward, save].filter(Boolean).join(' ');
}

function renderTime(ms) {
  const seconds = Math.floor(ms / 1000);
  get('puzzle-timer').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0');
}

get('setup').addEventListener('submit', event => {
  event.preventDefault();
  const name = player.value.trim();
  if (!name) {
    player.setCustomValidity(copy.enterName);
    player.reportValidity();
    return;
  }
  clearInterval(ticker);
  const level = difficulty.value;
  const { cells, hidden } = buildPuzzle(level);
  round = { name, level, cells, inputs:new Map(), start:performance.now(), solved:false };
  const board = get('board');
  board.replaceChildren();
  for (const [index,value] of cells.entries()) {
    const cell = document.createElement('div');
    cell.className = value === null ? 'cross-gap' : 'cross-cell';
    if (value === null) cell.setAttribute('aria-hidden','true');
    else if (hidden.includes(index)) {
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.autocomplete = 'off';
      input.maxLength = 3;
      labelInput(index,input);
      input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
      round.inputs.set(index,input);
      cell.append(input);
    } else {
      cell.textContent = value;
    }
    board.append(cell);
  }
  get('puzzle').hidden = false;
  get('check').disabled = false;
  renderTime(0);
  renderLanguage();
  round.inputs.values().next().value.focus();
  ticker = setInterval(() => renderTime(performance.now() - round.start), 150);
});

get('puzzle').addEventListener('submit', event => {
  event.preventDefault();
  if (!round || round.solved) return;
  const firstEmpty = [...round.inputs.values()].find(input => !input.value.trim());
  if (firstEmpty) {
    round.status = 'emptyBoxes';
    showStatus();
    firstEmpty.focus();
    return;
  }
  let firstWrong;
  for (const [index,input] of round.inputs) {
    const valid = /^\d{1,3}$/.test(input.value.trim()) && Number(input.value) === round.cells[index];
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) firstWrong ??= input;
  }
  if (firstWrong) {
    round.status = 'tryAgain';
    showStatus();
    firstWrong.focus();
    return;
  }
  clearInterval(ticker);
  const ms = performance.now() - round.start;
  renderTime(ms);
  round.solved = true;
  round.status = 'solved';
  get('check').disabled = true;
  for (const input of round.inputs.values()) input.readOnly = true;
  const total = round.inputs.size;
  const record = { player:round.name, operation:'crossword', difficulty:round.level, score:total, total,
    answered:total, passed:true, ms, finished:new Date().toISOString() };
  window.MatteCloud?.save(record);
  try {
    const records = readHistory();
    const newMedal = !earnedMedals(records, round.name).has(round.level);
    records.unshift(record);
    localStorage.setItem(historyKey, JSON.stringify(records));
    round.saved = true;
    round.newMedal = newMedal;
  } catch { round.saved = false; }
  renderMedals();
  showStatus();
});

player.addEventListener('input', () => {
  player.setCustomValidity('');
  renderMedals();
});
window.addEventListener('storage', event => {
  if (event.key === historyKey || event.key === null) renderMedals();
});
difficulty.addEventListener('change', () => { get('difficulty-info').textContent = copy[difficulty.value + 'Info']; });
picker.addEventListener('change', () => {
  language = picker.value;
  try { localStorage.setItem(languageKey,language); } catch { /* Keep the choice in memory. */ }
  renderLanguage();
});

renderLanguage();
