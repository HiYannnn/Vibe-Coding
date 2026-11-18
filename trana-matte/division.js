'use strict';

const get = id => document.getElementById(id);
const historyKey = 'kalana-multiplication-history-v1';
const languageKey = 'kalana-multiplication-language-v1';
const stages = [
  { id:'cargo', icon:'🚀', size:8, goal:6 },
  { id:'vault', icon:'💎', size:8, goal:6 },
  { id:'guardian', icon:'👾', size:10, goal:8 }
];
let language='sv';
let digits=2;
let copy;
let round;
let ticker;
let records=[];
try {
  const saved=JSON.parse(localStorage.getItem(historyKey)||'[]');
  if(Array.isArray(saved)) records=saved;
  const locale=localStorage.getItem(languageKey);
  if(Object.hasOwn(divisionCopy,locale)) language=locale;
} catch { /* Retain the current in-memory progress if storage is unavailable. */ }

const normalize=name=>name.trim().normalize('NFC').toLowerCase();
const activity=(level,index)=>level+'-'+stages[index].id;
const limit=(level,index)=>index===0?0:index===1?(level===2?120:180):(level===2?90:150);
const random=(min,max)=>min+Math.floor(Math.random()*(max-min+1));

function questions(level,index) {
  const min=10**(level-1),max=10**level-1;
  const pool=[];
  for(let divisor=2;divisor<=9;divisor++) {
    for(let quotient=Math.ceil(min/divisor);quotient<=Math.floor(max/divisor);quotient++) {
      pool.push({dividend:divisor*quotient,divisor,quotient});
    }
  }
  for(let i=pool.length-1;i>0;i--) {
    const j=random(0,i);
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool.slice(0,stages[index].size).map((q,i)=>{
    const type=index===0?'quotient':index===1?'dividend':['quotient','dividend','divisor'][i%3];
    const {dividend,divisor,quotient}=q;
    const answer=q[type];
    const text=(type==='dividend'?'?':dividend)+' ÷ '+(type==='divisor'?'?':divisor)+' = '+(type==='quotient'?'?':quotient);
    return {...q,type,answer,text};
  });
}

function cleared(name,level) {
  const key=normalize(name);
  return new Set(records.filter(r=>r.operation==='division' && r.passed && normalize(r.player)===key
    && r.difficulty?.startsWith(level+'-')).map(r=>r.difficulty));
}

function show(id,focus) {
  for(const section of ['div-map','div-game','div-result']) get(section).hidden=section!==id;
  get(id).scrollIntoView({block:'start'});
  if(focus) get(focus).focus({preventScroll:true});
}

function renderMap() {
  const name=get('player').value.trim();
  const done=cleared(name,digits);
  get('div-map-progress').textContent=name?copy.divProgress(name,done.size):copy.divPrompt;
  get('div-two').setAttribute('aria-pressed',String(digits===2));
  get('div-three').setAttribute('aria-pressed',String(digits===3));
  get('div-track-info').textContent=copy.divTrackInfo(digits);
  const trail=get('div-stages');
  trail.replaceChildren();
  for(const [index,stage] of stages.entries()) {
    const unlocked=index===0||done.has(activity(digits,index-1));
    const passed=done.has(activity(digits,index));
    const button=document.createElement('button');
    button.type='button';
    button.className='stage';
    button.disabled=!unlocked;
    button.dataset.state=passed?'cleared':unlocked?'current':'locked';
    const head=document.createElement('span');
    head.className='stage-head';
    const icon=document.createElement('span');
    icon.className='world';icon.textContent=stage.icon;icon.setAttribute('aria-hidden','true');
    const flag=document.createElement('span');
    flag.className='flag';flag.textContent=passed?copy.cleared:unlocked?copy.current:copy.locked;
    head.append(icon,flag);
    const title=document.createElement('span');
    title.className='stage-title';title.textContent=copy.divStages[index];
    const description=document.createElement('span');
    description.className='stage-description';
    description.textContent=copy.divDescription[index]+' '+copy.divRules(stage.goal,stage.size,limit(digits,index));
    const action=document.createElement('span');
    action.className='stage-foot';action.textContent=unlocked?(passed?copy.replay:copy.launch):'';
    button.append(head,title,description,action);
    button.addEventListener('click',()=>start(index));
    trail.append(button);
  }
}

function translate() {
  copy={...translations[language],...adventureCopy[language],...portalCopy[language],
    ...crosswordCopy[language],...leaderboardCopy[language],...additionCopy[language],...divisionCopy[language]};
  document.documentElement.lang=language;
  document.title=copy.divTitle+' · '+copy.portalTitle;
  get('language').value=language;get('language').setAttribute('aria-label',copy.language);
  for(const el of document.querySelectorAll('[data-copy]')) el.textContent=copy[el.dataset.copy];
  get('player').placeholder=copy.placeholder;get('player').setCustomValidity('');
  get('div-answer').setAttribute('aria-label',copy.answer);
  get('div-answer').setAttribute('aria-describedby','div-equation');
  get('div-progress').setAttribute('aria-label',copy.progress);
  get('div-timer').setAttribute('aria-label',copy.time);
  get('div-tracks').setAttribute('aria-label',copy.difficulty);
  renderMap();
  if(round?.done) renderResult();
  else if(round) renderHud();
}

function clock(ms) {
  const seconds=Math.max(0,Math.ceil(ms/1000));
  return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function renderHud() {
  const stage=stages[round.index];
  get('div-number').textContent=copy.question(round.questionIndex+1,stage.size);
  get('div-mission').textContent=copy.divStages[round.index];
  get('div-score').textContent='⭐ '+round.score;
  get('div-goal').textContent=copy.divRules(stage.goal,stage.size,round.limit/1000)
    +(round.shields===undefined?'':' · '+copy.lives(round.shields));
  get('div-feedback').textContent=round.answered
    ?(round.correct?copy.correct:copy.incorrect(round.questions[round.questionIndex].answer)):'';
  get('div-icon').textContent=stage.icon+(round.shields===undefined?'':' '+ '🛡️'.repeat(round.shields));
}
function tick() {
  if(round.done) return;
  const elapsed=performance.now()-round.start;
  get('div-timer').textContent=clock(round.limit?round.limit-elapsed:elapsed);
  if(round.limit&&elapsed>=round.limit)finish('timeUp');
}
function start(index) {
  const name=get('player').value.trim();
  if(!name){get('player').setCustomValidity(copy.enterName);get('player').reportValidity();get('player').focus();return;}
  if(index>0&&!cleared(name,digits).has(activity(digits,index-1)))return;
  clearInterval(ticker);
  round={name,digits,index,questions:questions(digits,index),score:0,count:0,questionIndex:0,
    shields:index===2?3:undefined,limit:limit(digits,index)*1000,start:performance.now()};
  get('div-progress').max=stages[index].size;
  get('div-arena').dataset.world=index===2?'boss':'dock';
  show('div-game');showQuestion();tick();ticker=setInterval(tick,150);
}
function showQuestion() {
  round.answered=false;
  get('div-equation').textContent=round.questions[round.questionIndex].text;
  get('div-answer').value='';get('div-answer').disabled=false;
  get('div-check').disabled=false;get('div-next').hidden=true;
  get('div-progress').value=round.count;
  renderHud();get('div-answer').focus({preventScroll:true});
}
function finish(reason) {
  if(round.done)return;
  clearInterval(ticker);round.done=true;round.reason=reason;
  round.ms=reason==='timeUp'?round.limit:Math.round(performance.now()-round.start);
  round.passed=!reason&&round.score>=stages[round.index].goal;
  const record={player:round.name,operation:'division',difficulty:activity(round.digits,round.index),
    score:round.score,total:stages[round.index].size,answered:round.count,ms:round.ms,
    passed:round.passed,finished:new Date().toISOString()};
  window.MatteCloud?.save(record);
  records.unshift(record);
  try {
    const latest=JSON.parse(localStorage.getItem(historyKey)||'[]');
    if(Array.isArray(latest))records=[record,...latest];
    localStorage.setItem(historyKey,JSON.stringify(records));
  } catch { /* Retain results for this visit. */ }
  renderMap();renderResult();show('div-result','div-result-title');
}
function renderResult() {
  const complete=round.passed&&round.index===2;
  get('div-reward').textContent=complete?'🏆':round.passed?'🌟':stages[round.index].icon;
  get('div-result-title').textContent=round.reason?copy[round.reason]:complete?copy.divDone:round.passed?copy.missionWon:copy.missionLost;
  get('div-summary').textContent=round.name+' · '+round.score+'/'+stages[round.index].size+' · '+clock(round.ms);
  const notes=[copy.divPoints(round.score)];
  if(round.passed)notes.push(complete?copy.divComplete:copy.unlocked(copy.divStages[round.index+1]));
  if(round.answered&&!round.correct)notes.push(copy.incorrect(round.questions[round.questionIndex].answer));
  get('div-note').textContent=notes.join(' ');
  get('div-retry').textContent=round.passed&&round.index<2?copy.nextWorld:copy.retry;
}
get('div-answer-form').addEventListener('submit',event=>{
  event.preventDefault();
  if(!round||round.done||round.answered)return;
  if(round.limit&&performance.now()-round.start>=round.limit){finish('timeUp');return;}
  const value=get('div-answer').value.trim();
  if(!/^\d{1,3}$/.test(value)){get('div-feedback').textContent=copy.divValid;return;}
  round.answered=true;round.count++;
  round.correct=Number(value)===round.questions[round.questionIndex].answer;
  if(round.correct)round.score++;
  else if(round.shields!==undefined)round.shields--;
  get('div-answer').disabled=true;get('div-check').disabled=true;
  get('div-progress').value=round.count;
  if(round.shields===0){finish('shieldsLost');return;}
  if(round.count===stages[round.index].size){finish();return;}
  renderHud();get('div-next').hidden=false;get('div-next').focus({preventScroll:true});
});
get('div-next').addEventListener('click',()=>{
  if(!round?.answered||round.done)return;
  round.questionIndex++;showQuestion();
});
get('div-retry').addEventListener('click',()=>start(round.passed&&round.index<2?round.index+1:round.index));
get('div-back').addEventListener('click',()=>show('div-map','div-map-title'));
get('div-quit').addEventListener('click',()=>{
  if(!confirm(copy.confirmQuit))return;
  clearInterval(ticker);round=undefined;show('div-map','div-map-title');
});
for(const level of [2,3])get(level===2?'div-two':'div-three').addEventListener('click',()=>{digits=level;renderMap();});
get('player').addEventListener('input',()=>{get('player').setCustomValidity('');renderMap();});
get('div-profile').addEventListener('submit',event=>event.preventDefault());
get('language').addEventListener('change',()=>{
  language=get('language').value;
  try{localStorage.setItem(languageKey,language);}catch{}
  translate();
});
window.addEventListener('storage',event=>{
  if(event.key!==historyKey&&event.key!==null)return;
  try{const latest=JSON.parse(event.newValue||'[]');if(Array.isArray(latest)){records=latest;renderMap();}}catch{}
});
translate();
