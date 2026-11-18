'use strict';
const get = id => document.getElementById(id);
const picker = get('language');
const languageKey = 'kalana-multiplication-language-v1';
let language = 'sv';
let players = [];
let state = 'rankLoading';
let request;
try {
  const saved = localStorage.getItem(languageKey);
  if (Object.hasOwn(leaderboardCopy,saved)) language=saved;
} catch { /* Use Swedish. */ }

function node(tag, className, text) {
  const item=document.createElement(tag);
  if(className) item.className=className;
  if(text !== undefined) item.textContent=text;
  return item;
}
function render() {
  const copy={...translations[language],...portalCopy[language],...leaderboardCopy[language]};
  document.documentElement.lang=language;
  document.title=copy.rankTitle+' · '+copy.portalTitle;
  picker.value=language;
  picker.setAttribute('aria-label',copy.language);
  get('podium').setAttribute('aria-label',copy.rankTitle);
  for(const item of document.querySelectorAll('[data-copy]')) item.textContent=copy[item.dataset.copy];
  get('rank-status').textContent=state ? copy[state] : '';
  const podium=get('podium');
  podium.replaceChildren();
  const medals=['🥇','🥈','🥉'];
  for(const [index,player] of players.slice(0,3).entries()) {
    const card=node('article','podium-card podium-'+(index+1));
    const medal=node('div','podium-medal',medals[Math.min(player.rank-1,2)]);
    medal.setAttribute('aria-hidden','true');
    card.append(medal,node('p','podium-rank',copy.rankPosition+' '+player.rank),
      node('h2','podium-name',player.nickname),
      node('strong','podium-points',player.points.toLocaleString(language)),
      node('span','muted',copy.rankLifetime));
    podium.append(card);
  }
  const rows=get('rank-rows');
  rows.replaceChildren();
  for(const player of players) {
    const row=node('tr');
    for(const value of [player.rank,player.nickname,player.points.toLocaleString(language),player.rounds.toLocaleString(language)]) {
      row.append(node('td','',String(value)));
    }
    rows.append(row);
  }
}
async function load() {
  request?.abort();
  const current=new AbortController();
  request=current;
  state='rankLoading';
  render();
  try {
    const response=await fetch('/api/leaderboard',{signal:current.signal});
    if(!response.ok) throw new Error('Unavailable');
    const result=await response.json();
    players=result.players;
    state=players.length ? '' : 'rankEmpty';
  } catch {
    if(current.signal.aborted) return;
    state='rankError';
  }
  render();
}
picker.addEventListener('change',()=>{
  language=picker.value;
  try {localStorage.setItem(languageKey,language);} catch { /* Keep this choice in memory. */ }
  render();
});
get('rank-refresh').addEventListener('click',load);
void load();
