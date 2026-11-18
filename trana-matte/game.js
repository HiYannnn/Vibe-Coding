'use strict';

const get = id => document.getElementById(id);
const historyKey = 'kalana-multiplication-history-v1';
const languageKey = 'kalana-multiplication-language-v1';
const missions = [
  { id:'dock', icon:'🚀', size:6, goal:4, low:1, high:5 },
  { id:'belt', icon:'☄️', size:8, goal:6, low:2, high:7, limit:60000 },
  { id:'vault', icon:'💎', size:8, goal:6, low:4, high:9 },
  { id:'boss', icon:'👾', size:10, goal:8, low:2, high:10, shields:3 }
];
const bonusMission = { id:'bonus', icon:'⚡', size:12, goal:11, low:6, high:12, minFactor:6, maxFactor:12, limit:45000 };
const player = get('player');
const languagePicker = get('language');
const tableChoice = get('table-choice');
const numberInput = get('number-answer');
const stages = [];
let language = 'sv';
let copy;
let records = [];
let historyReadFailed = false;
let game;
let timer;

function readRecords(raw) {
  const parsed = JSON.parse(raw || '[]');
  return Array.isArray(parsed) ? parsed : [];
}

try {
  records = readRecords(localStorage.getItem(historyKey));
} catch {
  historyReadFailed = true;
}

try {
  const saved = localStorage.getItem(languageKey);
  if (Object.hasOwn(translations, saved)) language = saved;
} catch {
  // The language can still be changed for this visit.
}

const playerName = () => player.value.trim();
const playerKey = name => name.normalize('NFC').toLowerCase();
const missionName = mission => mission === bonusMission ? copy.bonusTitle : copy.worlds[missions.indexOf(mission)][0];
const tableLabel = table => table === 'mixed' ? copy.mixed : copy.table(table);
const recordScope = record => {
  if (record.operation === 'crossword') return copy.crossTitle + ' · ' + copy[record.difficulty];
  const mission = record.mission === bonusMission.id ? bonusMission : missions.find(item => item.id === record.mission);
  return mission ? missionName(mission) : tableLabel(record.table);
};
const formatDate = date => new Date(date).toLocaleString(language, { hour12:false });

function clock(ms, countdown = false) {
  const seconds = Math[countdown ? 'ceil' : 'floor'](ms / 1000);
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

function duration(ms) {
  const tenths = Math.round(ms / 100);
  const seconds = (tenths % 600 / 10).toLocaleString(language, {
    minimumFractionDigits:1, maximumFractionDigits:1
  });
  return copy.duration(Math.floor(tenths / 600), seconds);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function questionSet(mission, table) {
  const low = mission?.low ?? (table === 'mixed' ? 1 : Number(table));
  const high = mission?.high ?? (table === 'mixed' ? 10 : Number(table));
  const pool = [];
  for (let a = low; a <= high; a++) {
    for (let b = mission?.minFactor ?? 1; b <= (mission?.maxFactor ?? 10); b++) {
      if (((!mission && table === 'mixed') || mission === bonusMission) && a > b) continue;
      pool.push({ a, b });
    }
  }
  return shuffle(pool).slice(0, mission?.size ?? 10).map(({ a, b }, index) => {
    const missing = mission?.id === 'vault' || ((mission?.id === 'boss' || mission === bonusMission) && index % 2 === 1);
    return missing ? { text:`${a} × ? = ${a * b}`, correct:b, missing }
      : { text:`${a} × ${b} = ?`, correct:a * b, missing, a, b };
  });
}

function clearedFor(name) {
  const key = playerKey(name);
  return new Set(records.filter(record => record.mission && record.passed && playerKey(record.player) === key)
    .map(record => record.mission));
}

function renderMap() {
  const name = playerName();
  const cleared = clearedFor(name);
  const completedWorlds = missions.filter(mission => cleared.has(mission.id)).length;
  get('map-status').textContent = name ? copy.mapProgress(name, completedWorlds, missions.length) : copy.mapPrompt;
  const bonusUnlocked = cleared.has('boss');
  get('bonus-start').disabled = !bonusUnlocked;
  get('bonus-status').textContent = cleared.has(bonusMission.id)
    ? copy.bonusEarned : bonusUnlocked ? copy.bonusReady : copy.bonusLocked;
  stages.forEach((stage, index) => {
    const mission = missions[index];
    const unlocked = index === 0 || cleared.has(missions[index - 1].id);
    const done = cleared.has(mission.id);
    const [title, description] = copy.worlds[index];
    stage.button.disabled = !unlocked;
    stage.button.dataset.state = done ? 'cleared' : unlocked ? 'current' : 'locked';
    stage.flag.textContent = done ? copy.cleared : unlocked ? copy.current : copy.locked;
    stage.title.textContent = title;
    stage.description.textContent = description;
    stage.action.textContent = unlocked ? (done ? copy.replay : copy.launch) : '';
  });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

missions.forEach((mission, index) => {
  const button = element('button', 'stage');
  button.type = 'button';
  const head = element('span', 'stage-head');
  const world = element('span', 'world', mission.icon);
  world.setAttribute('aria-hidden', 'true');
  const flag = element('span', 'flag');
  const title = element('span', 'stage-title');
  const description = element('span', 'stage-description');
  const action = element('span', 'stage-foot');
  head.append(world, flag);
  button.append(head, title, description, action);
  button.addEventListener('click', () => start(missions[index]));
  get('trail').append(button);
  stages.push({ button, flag, title, description, action });
});

for (let n = 1; n <= 10; n++) tableChoice.add(new Option('', String(n)));

function renderRecords() {
  const body = get('history');
  body.replaceChildren();
  for (const record of records) {
    const row = body.insertRow();
    const values = [record.player, duration(record.ms), record.score + '/' + (record.total ?? 10),
      recordScope(record), (record.mission || record.operation === 'crossword') ? (record.passed ? copy.passed : copy.lost) : '—', formatDate(record.finished)];
    for (const value of values) row.insertCell().textContent = value;
  }
  get('empty').hidden = records.length > 0;
  get('table-wrap').hidden = records.length === 0;
  get('export').hidden = records.length === 0;
}

function applyLanguage() {
  copy = { ...translations[language], ...adventureCopy[language], ...portalCopy[language], ...crosswordCopy[language] };
  document.documentElement.lang = language;
  document.title = copy.adventureTitle;
  languagePicker.value = language;
  languagePicker.setAttribute('aria-label', copy.language);
  for (const node of document.querySelectorAll('[data-copy]')) node.textContent = copy[node.dataset.copy];
  player.placeholder = copy.placeholder;
  player.setCustomValidity('');
  numberInput.setCustomValidity('');
  numberInput.setAttribute('aria-label', copy.answer);
  tableChoice.setAttribute('aria-label', copy.choose);
  get('timer').setAttribute('aria-label', copy.time);
  get('progress').setAttribute('aria-label', copy.progress);
  get('storage-note').textContent = historyReadFailed ? copy.readError : copy.storage;
  for (const option of tableChoice.options) option.textContent = tableLabel(option.value);
  renderMap();
  renderRecords();
  if (!get('game').hidden) renderHud();
  if (!get('result').hidden) renderResult();
}

function reveal(id, focus) {
  get('map').hidden = id !== 'map';
  get('game').hidden = id !== 'game';
  get('result').hidden = id !== 'result';
  get(id).scrollIntoView({ block:'start' });
  if (focus) get(focus).focus({ preventScroll:true });
}

function start(mission) {
  const name = playerName();
  if (!name) {
    player.setCustomValidity(copy.enterName);
    player.focus();
    player.reportValidity();
    return;
  }
  const index = missions.indexOf(mission);
  const prerequisite = mission === bonusMission ? 'boss' : missions[index - 1]?.id;
  if (prerequisite && !clearedFor(name).has(prerequisite)) return;
  clearInterval(timer);
  const table = tableChoice.value;
  game = {
    name, mission, table, questions:questionSet(mission, table), index:0, score:0, answered:0,
    shields:mission?.shields, started:performance.now(), phase:'question'
  };
  get('progress').max = game.questions.length;
  get('arena').dataset.world = mission?.id ?? 'practice';
  reveal('game');
  showQuestion();
  tick();
  timer = setInterval(tick, 100);
}

function remaining() {
  return Math.max(0, game.mission.limit - (performance.now() - game.started));
}

function tick() {
  if (game.phase === 'done') return;
  const limit = game.mission?.limit;
  get('timer').textContent = limit
    ? copy.remaining(clock(remaining(), true))
    : '⏱ ' + clock(performance.now() - game.started);
  if (limit && remaining() === 0) finish('timeUp');
}

function renderHud() {
  const { mission, questions, index, phase, score } = game;
  const question = questions[index];
  get('mission-title').textContent = mission ? missionName(mission) : tableLabel(game.table);
  get('question-number').textContent = copy.question(index + 1, questions.length);
  get('stars').textContent = '⭐ ' + score;
  const goals = [];
  if (mission) goals.push(copy.goal(mission.goal, questions.length));
  if (game.shields !== undefined) goals.push(copy.lives(game.shields));
  if (question.missing) goals.push(copy.missing);
  get('mission-hud').textContent = goals.join(' · ');
  get('orbit').textContent = mission?.id === 'boss'
    ? (game.shields ? '👾 ' + '🛡️'.repeat(game.shields) : '👾')
    : (mission?.icon ?? '🛰️');
  get('feedback').textContent = phase === 'feedback'
    ? (game.answerWasCorrect ? copy.correct : copy.incorrect(question.correct)) : '';
  get('next').textContent = copy.next;
}

function showQuestion() {
  game.phase = 'question';
  const question = game.questions[game.index];
  const typed = game.mission && game.mission.id !== 'dock';
  get('equation').textContent = question.text;
  get('progress').value = game.answered;
  get('next').hidden = true;
  get('orbit').classList.remove('hit');
  const answers = get('answers');
  answers.replaceChildren();
  get('answer-form').hidden = !typed;
  numberInput.value = '';
  numberInput.disabled = false;
  numberInput.classList.remove('wrong');
  numberInput.setCustomValidity('');
  get('answer-form').querySelector('button').disabled = false;
  if (!typed) {
    const { a, b, correct } = question;
    const nearby = [...new Set([correct-a, correct+a, correct-b, correct+b, correct-1,
      correct+1, correct-2, correct+2, correct+3])].filter(n => n > 0 && n <= 100 && n !== correct);
    for (const value of shuffle([correct, ...shuffle(nearby).slice(0, 3)])) {
      const button = element('button', 'answer', String(value));
      button.type = 'button';
      button.addEventListener('click', () => answer(value));
      answers.append(button);
    }
  }
  renderHud();
  // Focus the equation so keyboard and screen-reader users encounter the question before the answer.
  if (game.mission === bonusMission) {
    numberInput.setAttribute('aria-describedby', 'equation');
    numberInput.focus({ preventScroll:true });
  } else {
    numberInput.removeAttribute('aria-describedby');
    get('equation').focus({ preventScroll:true });
  }
}

function answer(value) {
  if (game.phase !== 'question') return;
  if (game.mission?.limit && remaining() === 0) {
    finish('timeUp');
    return;
  }
  const { correct } = game.questions[game.index];
  game.answerWasCorrect = value === correct;
  game.answered++;
  if (game.answerWasCorrect) game.score++;
  else if (game.shields !== undefined) game.shields--;
  game.phase = 'feedback';
  if (!game.answerWasCorrect && game.shields === 0) {
    finish('shieldsLost');
    return;
  }
  if (game.answered === game.questions.length) {
    finish();
    return;
  }
  for (const button of get('answers').children) {
    button.disabled = true;
    const number = Number(button.textContent);
    if (number === correct) button.classList.add('right');
    else if (number === value) button.classList.add('wrong');
  }
  numberInput.disabled = true;
  get('answer-form').querySelector('button').disabled = true;
  if (!game.answerWasCorrect) numberInput.classList.add('wrong');
  if (game.answerWasCorrect) get('orbit').classList.add('hit');
  get('progress').value = game.answered;
  renderHud();
  get('next').hidden = false;
  get('next').focus({ preventScroll:true });
}

function finish(reason) {
  if (game.phase === 'done') return;
  clearInterval(timer);
  game.phase = 'done';
  game.reason = reason;
  const elapsed = performance.now() - game.started;
  game.ms = reason === 'timeUp' ? game.mission.limit : elapsed;
  game.passed = Boolean(game.mission && !reason && game.score >= game.mission.goal);
  const isBonus = game.mission === bonusMission;
  game.firstMedal = isBonus && game.passed && !clearedFor(game.name).has(bonusMission.id);
  game.nextMission = game.passed && !isBonus
    ? (game.mission.id === 'boss' ? bonusMission : missions[missions.indexOf(game.mission) + 1])
    : undefined;
  const record = {
    player:game.name, operation:'multiplication', table:game.table, score:game.score, total:game.questions.length,
    answered:game.answered, ms:game.ms, finished:new Date().toISOString()
  };
  if (game.mission) Object.assign(record, { mission:game.mission.id, passed:game.passed });

  try {
    const updated = [record, ...readRecords(localStorage.getItem(historyKey))];
    localStorage.setItem(historyKey, JSON.stringify(updated));
    records = updated;
    game.saved = true;
    historyReadFailed = false;
    get('storage-note').textContent = copy.storage;
  } catch {
    records.unshift(record);
    game.saved = false;
  }
  renderRecords();
  renderMap();
  renderResult();
  reveal('result', 'result-title');
}

function renderResult() {
  const { mission, passed, reason, nextMission, score, questions, answered, name, ms, saved } = game;
  const finalQuestion = questions[game.index];
  const notes = [];
  if (reason !== 'timeUp' && !game.answerWasCorrect) notes.push(copy.incorrect(finalQuestion.correct));
  if (nextMission) notes.push(copy.unlocked(missionName(nextMission)));
  if (passed && mission?.id === 'boss') notes.push(copy.allCleared);
  if (passed && mission === bonusMission && !game.firstMedal) notes.push(copy.bonusEarned);
  get('reward').textContent = passed ? (mission === bonusMission ? '🏅' : mission.id === 'boss' ? '🏆' : '🌟')
    : (mission?.icon ?? '🚀');
  get('result-title').textContent = reason ? copy[reason]
    : passed && mission === bonusMission ? (game.firstMedal ? copy.bonusWon : copy.bonusRepeat)
    : mission ? (passed ? copy.missionWon : copy.missionLost) : copy.complete;
  get('summary').textContent = [name, copy.roundScore(score, questions.length, answered), duration(ms)].join(' · ');
  get('result-note').textContent = notes.join(' ');
  get('save-status').textContent = saved ? copy.saved : copy.saveError;
  get('retry').textContent = nextMission === bonusMission ? copy.bonusStart
    : nextMission ? copy.nextWorld : mission && !passed ? copy.retry : copy.again;
}

languagePicker.addEventListener('change', () => {
  language = languagePicker.value;
  try { localStorage.setItem(languageKey, language); } catch { /* Keep the choice in memory. */ }
  applyLanguage();
});

player.addEventListener('input', () => {
  player.setCustomValidity('');
  renderMap();
});
get('name-form').addEventListener('submit', event => event.preventDefault());
get('bonus-start').addEventListener('click', () => start(bonusMission));
get('practice').addEventListener('submit', event => {
  event.preventDefault();
  start();
});
numberInput.addEventListener('input', () => numberInput.setCustomValidity(''));
get('answer-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!/^\d{1,3}$/.test(numberInput.value.trim())) {
    numberInput.setCustomValidity(copy.answerPrompt);
    numberInput.reportValidity();
    return;
  }
  answer(Number(numberInput.value));
});
get('next').addEventListener('click', () => {
  if (game.phase !== 'feedback') return;
  game.index++;
  showQuestion();
});
get('quit').addEventListener('click', () => {
  if (!confirm(copy.confirmQuit)) return;
  clearInterval(timer);
  game = undefined;
  reveal('map', 'map-title');
});
get('back').addEventListener('click', () => reveal('map', 'map-title'));
get('retry').addEventListener('click', () => start(game.nextMission ?? game.mission));
get('view-records').addEventListener('click', () => get('records-title').focus());
get('export').addEventListener('click', () => {
  const cell = value => {
    const text = String(value);
    const safe = /^[=+@\-\t\r\n]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const rows = [[copy.name, copy.seconds, copy.score, copy.total, copy.scope, copy.outcome, copy.finished]];
  for (const record of records) rows.push([record.player, (record.ms / 1000).toFixed(1),
    record.score, record.total ?? 10, recordScope(record),
    (record.mission || record.operation === 'crossword') ? (record.passed ? copy.passed : copy.lost) : '', formatDate(record.finished)]);
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')],
    { type:'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = copy.filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener('storage', event => {
  if (event.key !== historyKey && event.key !== null) return;
  try {
    records = readRecords(event.newValue);
    renderRecords();
    renderMap();
  } catch {
    // Keep the current history visible if the new value cannot be read.
  }
});

applyLanguage();
