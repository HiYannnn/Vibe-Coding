'use strict';

window.MatteCloud = (() => {
  const queueKey = 'matte-cloud-queue-v1';
  const identitiesKey = 'matte-cloud-identities-v1';
  const historyKey = 'kalana-multiplication-history-v1';
  const box = document.createElement('section');
  box.className = 'cloud-status';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'outline';
  box.append(status, retry);
  const main = document.querySelector('main');
  main.insertBefore(box, main.firstChild);
  let running = false;
  let recovering = false;
  let latestState = 'ready';
  let detail = '';
  const messages = {
    sv: {
      ready:'Molnsparning är redo.',pending:'Sparar i molnet…',saved:'Resultaten har sparats i molnet.',
      offline:'Molnsparning väntar. Försöker igen automatiskt.',storage:'Webbläsaren kan inte lagra väntande resultat.',
      retry:'Synka sparade omgångar',empty:'Inga sparade omgångar på den här enheten.',loading:'Hämtar sparade omgångar…'
    },
    en: {
      ready:'Cloud saving is ready.',pending:'Saving to the cloud…',saved:'Results saved to the cloud.',
      offline:'Cloud save pending. Retrying automatically.',storage:'This browser cannot store pending results.',
      retry:'Sync saved rounds',empty:'No saved rounds on this device.',loading:'Preparing saved rounds…'
    },
    'zh-CN': {
      ready:'云端保存已就绪。',pending:'正在保存到云端…',saved:'成绩已保存到云端。',
      offline:'云端保存待完成，将自动重试。',storage:'当前浏览器无法储存待同步成绩。',
      retry:'同步本机已完成的练习',empty:'本机没有已保存的练习。',loading:'正在准备已保存的练习…'
    }
  };
  function show(state, error = '') {
    latestState = state;
    detail = error;
    const copy = messages[document.documentElement.lang] || messages.sv;
    status.textContent = copy[state] + (error ? ' (' + error + ')' : '');
    retry.textContent = copy.retry;
    retry.disabled = running || recovering;
  }
  function read(key, fallback) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  }
  function tokenFor(name) {
    const identities = read(identitiesKey, {});
    const key = name.trim().normalize('NFC').toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(identities, key)) {
      identities[key] = [...crypto.getRandomValues(new Uint8Array(32))]
        .map(byte => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(identitiesKey, JSON.stringify(identities));
    }
    return identities[key];
  }
  function uuid() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
  }
  function normalize(source) {
    const total = source.total === undefined ? 10 : source.total;
    return {
      id:uuid(), player:source.player.trim(), operation:source.operation || 'multiplication',
      activity:String(source.mission || source.difficulty || source.table || 'mixed'),
      score:source.score, total, answered:source.answered === undefined ? total : source.answered,
      ms:Math.round(source.ms), passed:source.passed === undefined ? null : source.passed, finished:source.finished
    };
  }
  function sameRound(left, right) {
    if (!left || !right || typeof left.player !== 'string' || typeof right.player !== 'string') return false;
    return left.player.trim().normalize('NFC').toLowerCase() === right.player.trim().normalize('NFC').toLowerCase()
      && left.operation === right.operation && left.activity === right.activity && left.finished === right.finished;
  }
  async function upload(item) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      return await fetch('/api/practice', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify(item), signal:controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }
  }
  async function flush() {
    if (running || recovering) return;
    running = true;
    let failure = '';
    try {
      const queue = read(queueKey, []);
      if (!queue.length) return;
      show('pending');
      for (const item of queue) {
        try {
          const response = await upload(item);
          if (!response.ok) {
            failure = 'HTTP ' + response.status;
            continue;
          }
          const remaining = read(queueKey, []).filter(entry => entry.record.id !== item.record.id);
          localStorage.setItem(queueKey, JSON.stringify(remaining));
        } catch {
          failure = 'Connection';
        }
      }
      show(read(queueKey, []).length ? 'offline' : 'saved', failure);
    } catch {
      show('storage');
    } finally {
      running = false;
      retry.disabled = recovering;
    }
  }
  function save(source) {
    try {
      const record = normalize(source);
      const queue = read(queueKey, []);
      if (!queue.some(item => sameRound(item.record, record))) {
        queue.push({token:tokenFor(record.player), record});
        localStorage.setItem(queueKey, JSON.stringify(queue));
      }
      void flush();
    } catch {
      show('storage');
    }
  }
  async function recover() {
    if (running || recovering) return;
    recovering = true;
    try {
      show('loading');
      const history = read(historyKey, []);
      if (!Array.isArray(history) || !history.length) {
        show('empty');
        return;
      }
      const queue = read(queueKey, []);
      for (const source of history) {
        if (typeof source.player !== 'string' || !source.finished || !Number.isFinite(source.ms)) continue;
        const record = normalize(source);
        if (!queue.some(item => sameRound(item.record, record))) {
          queue.push({token:tokenFor(record.player), record});
        }
      }
      localStorage.setItem(queueKey, JSON.stringify(queue));
    } catch {
      show('storage');
      return;
    } finally {
      recovering = false;
      retry.disabled = false;
    }
    await flush();
  }
  retry.addEventListener('click', recover);
  new MutationObserver(() => show(latestState, detail))
    .observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  window.addEventListener('online', flush);
  setInterval(flush, 30000);
  show('ready');
  void flush();
  return {save, recover};
})();
