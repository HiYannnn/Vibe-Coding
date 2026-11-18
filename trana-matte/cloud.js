'use strict';

window.MatteCloud = (() => {
  const queueKey = 'matte-cloud-queue-v1';
  const identitiesKey = 'matte-cloud-identities-v1';
  const status = document.createElement('p');
  status.className = 'muted';
  status.setAttribute('role', 'status');
  document.querySelector('main').append(status);
  let running = false;
  let latestState = '';
  const messages = {
    sv: { pending:'Sparar i molnet…', saved:'Resultatet har sparats i molnet.', offline:'Molnsparning väntar. Försöker igen automatiskt.' },
    en: { pending:'Saving to the cloud…', saved:'Result saved to the cloud.', offline:'Cloud save pending. Retrying automatically.' },
    'zh-CN': { pending:'正在保存到云端…', saved:'成绩已保存到云端。', offline:'云端保存待完成，将自动重试。' }
  };
  function show(state) {
    latestState = state;
    status.textContent = (messages[document.documentElement.lang] ?? messages.sv)[state] ?? '';
  }
  function read(key, fallback) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  }
  function tokenFor(name) {
    const identities = read(identitiesKey, {});
    const key = name.normalize('NFC').toLowerCase();
    if (!Object.hasOwn(identities, key)) {
      identities[key] = [...crypto.getRandomValues(new Uint8Array(32))]
        .map(byte => byte.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(identitiesKey, JSON.stringify(identities));
    }
    return identities[key];
  }
  async function flush() {
    if (running) return;
    running = true;
    try {
      let queue = read(queueKey, []);
      if (!queue.length) return;
      show('pending');
      for (const item of queue) {
        const response = await fetch('/api/practice', {
          method:'POST', headers:{ 'Content-Type':'application/json' },
          body:JSON.stringify(item), signal:AbortSignal.timeout(25000)
        });
        if (!response.ok) throw new Error('Cloud save pending');
        queue = read(queueKey, []).filter(entry => entry.record.id !== item.record.id);
        localStorage.setItem(queueKey, JSON.stringify(queue));
      }
      show('saved');
    } catch {
      show('offline');
    } finally {
      running = false;
    }
  }
  function save(source) {
    try {
      const record = {
        id:crypto.randomUUID(), player:source.player, operation:source.operation,
        activity:source.mission ?? source.difficulty ?? source.table ?? 'mixed',
        score:source.score, total:source.total, answered:source.answered,
        ms:Math.round(source.ms), passed:source.passed ?? null, finished:source.finished
      };
      const queue = read(queueKey, []);
      queue.push({ token:tokenFor(record.player), record });
      localStorage.setItem(queueKey, JSON.stringify(queue));
      void flush();
    } catch {
      show('offline');
    }
  }
  new MutationObserver(() => { if (latestState) show(latestState); })
    .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  window.addEventListener('online', flush);
  setInterval(flush, 30000);
  void flush();
  return { save };
})();
