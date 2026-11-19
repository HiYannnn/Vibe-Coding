'use strict';
const get=id=>document.getElementById(id);
const historyKey='kalana-multiplication-history-v1';
const languageKey='kalana-multiplication-language-v1';
const modes=['kitchen','energy','scales'];
const icons=['🍕','⚡','⚖️'];
const denominators={basic:[2,3,4],advanced:[4,6,8,10,12]};
const kitchenFoods=['pizza','orange','cheesecake','cookie','waffle','kiwi','watermelon','pancake','applepie','quiche'];
let language='sv',copy,round,ticker;
let records=[];
try {
 const history=JSON.parse(localStorage.getItem(historyKey)||'[]');
 if(Array.isArray(history))records=history;
 const saved=localStorage.getItem(languageKey);
 if(Object.prototype.hasOwnProperty.call(fractionCopy,saved))language=saved;
}catch{}
const random=max=>Math.floor(Math.random()*max);
const fractionText=q=>q.n+'/'+q.d;
const compare=(a,b)=>a.n*b.d===b.n*a.d?'=':a.n*b.d<b.n*a.d?'<':'>';

function questions(mode,level) {
 const pool=[];
 const parts=mode==='kitchen'&&level==='basic'?[2,3,4,5,6]:denominators[level];
 for(const d of parts)for(let n=1;n<d;n++)pool.push({n,d});
 if(mode==='kitchen') {
  const shuffled=pool.slice();
  for(let i=shuffled.length-1;i>0;i--){const j=random(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const unique=[];
  for(const q of shuffled){
   if(!unique.some(previous=>previous.n*q.d===q.n*previous.d))unique.push(q);
  }
  const foods=kitchenFoods.slice();
  for(let i=foods.length-1;i>0;i--){const j=random(i+1);[foods[i],foods[j]]=[foods[j],foods[i]];}
  return unique.slice(0,10).map((q,index)=>({...q,food:foods[index]}));
 }
 if(mode!=='scales') {
  const result=[];
  while(result.length<10){
   const cycle=pool.slice();
   for(let i=cycle.length-1;i>0;i--){const j=random(i+1);[cycle[i],cycle[j]]=[cycle[j],cycle[i]];}
   result.push(...cycle.slice(0,10-result.length).map(q=>({...q})));
  }
  return result;
 }
 const candidates={'<':[],'=':[],'>':[]};
 for(const a of pool)for(const b of pool){
  if(level==='basic'&&a.d!==b.d)continue;
  if(level==='advanced'&&a.d===b.d)continue;
  candidates[compare(a,b)].push({a:{...a},b:{...b}});
 }
 const result=Array.from({length:10},(_,i)=>{
  const sign=['<','=','>'][i%3],choices=candidates[sign];
  const q=choices[random(choices.length)];
  return {a:{...q.a},b:{...q.b},sign};
 });
 for(let i=result.length-1;i>0;i--){const j=random(i+1);[result[i],result[j]]=[result[j],result[i]];}
 return result;
}

function make(tag,className,text) {
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(text!==undefined)el.textContent=text;
 return el;
}
function readRecords() {
 try{const history=JSON.parse(localStorage.getItem(historyKey)||'[]');if(Array.isArray(history))records=history;}catch{}
}
function hasMedal(mode,level) {
 const name=get('player').value.trim().normalize('NFC').toLowerCase();
 return records.some(r=>r.operation==='fractions'&&r.passed&&r.difficulty===mode+'-'+level
  &&r.player.trim().normalize('NFC').toLowerCase()===name);
}
function renderMenu() {
 const menu=get('frac-modes');menu.replaceChildren();
 const level=get('frac-level').value;
 get('frac-level-info').textContent=copy[level==='basic'?'fracBasicInfo':'fracAdvancedInfo'];
 for(const [i,mode] of modes.entries()){
  const button=make('button','stage');button.type='button';
  const head=make('span','stage-head'),icon=make('span','world',icons[i]);
  icon.setAttribute('aria-hidden','true');
  head.append(icon,make('span','flag',hasMedal(mode,level)?'🏅 '+copy.medalEarned:copy.current));
  button.append(head,make('span','stage-title',copy.fracNames[i]),
   make('span','stage-description',copy.fracDescriptions[i]),make('span','stage-foot',copy.launch));
  button.addEventListener('click',()=>start(mode));menu.append(button);
 }
}
function translate() {
 copy={...translations[language],...adventureCopy[language],...portalCopy[language],...crosswordCopy[language],
  ...leaderboardCopy[language],...fractionCopy[language]};
 document.documentElement.lang=language;document.title=copy.fracSubject+' · '+copy.portalTitle;
 get('language').value=language;get('language').setAttribute('aria-label',copy.language);
 for(const el of document.querySelectorAll('[data-copy]'))el.textContent=copy[el.dataset.copy];
 get('player').placeholder=copy.placeholder;get('player').setCustomValidity('');
 get('frac-progress').setAttribute('aria-label',copy.progress);
 get('frac-timer').setAttribute('aria-label',copy.time);
 for(const button of get('frac-comparisons').children){
  button.setAttribute('aria-label',copy[button.dataset.relation==='<'?'fracLess':button.dataset.relation==='='?'fracEqual':'fracGreater']);
 }
 renderMenu();
 if(round?.done){
  renderResult();
  if(!get('frac-game').hidden){renderQuestionVisual();hud();get('frac-next').textContent=copy.seeResult;}
 }else if(round){renderQuestionVisual();hud();}
}
function clock(ms) {
 const seconds=Math.floor(ms/1000);
 return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
}
function show(id,focus) {
 for(const name of ['frac-setup','frac-game','frac-result'])get(name).hidden=name!==id;
 get(id).scrollIntoView({block:'start'});
 if(focus)get(focus).focus({preventScroll:true});
}
function start(mode) {
 const name=get('player').value.trim();
 if(!name){get('player').setCustomValidity(copy.enterName);get('player').reportValidity();get('player').focus();return;}
 clearInterval(ticker);
 const level=get('frac-level').value;
 round={name,mode,level,questions:questions(mode,level),index:0,score:0,start:performance.now(),selected:new Set()};
 show('frac-game');nextQuestion();
 get('frac-timer').textContent='0:00';
 ticker=setInterval(()=>{get('frac-timer').textContent=clock(performance.now()-round.start);},150);
}
function diagram(q,interactive=false) {
 const wrapper=make('div','fraction-diagram');
 const grid=make('div','fraction-grid');
 grid.style.setProperty('--parts',q.d>4?q.d/2:q.d);
 if(!interactive){grid.setAttribute('role','img');grid.setAttribute('aria-label',copy.fracImage(q.n,q.d));}
 for(let i=0;i<q.d;i++){
  const piece=make(interactive?'button':'span','fraction-piece');
  if(interactive){
   piece.type='button';
   piece.setAttribute('aria-label',copy.fracPiece(i+1,q.d));
   piece.setAttribute('aria-pressed',String(round.selected.has(i)));
   piece.classList.toggle('painted',round.selected.has(i));
   piece.disabled=round.answered;
   piece.addEventListener('click',()=>{
    if(round.answered)return;
    if(round.selected.has(i))round.selected.delete(i);else round.selected.add(i);
    piece.classList.toggle('painted',round.selected.has(i));
    piece.setAttribute('aria-pressed',String(round.selected.has(i)));
    get('frac-selection').textContent=copy.fracSelected(round.selected.size,q.d);
   });
  }else{
   piece.classList.toggle('painted',i<q.n);
   piece.setAttribute('aria-hidden','true');
  }
  grid.append(piece);
 }
 wrapper.append(grid);
 return wrapper;
}
function renderQuestionVisual() {
 const q=round.questions[round.index],visual=get('frac-visual');visual.replaceChildren();
 if(round.mode==='kitchen'){
  get('frac-prompt').textContent=copy.fracRead;
  const foodIndex=kitchenFoods.indexOf(q.food);
  const plate=make('figure','kitchen-plate');
  const disc=make('div','kitchen-disc');
  disc.style.setProperty('--fraction-angle',(360*q.n/q.d)+'deg');
  disc.style.setProperty('--slice-angle',(360/q.d)+'deg');
  disc.setAttribute('role','img');
  disc.setAttribute('aria-label',copy.fracFoods[foodIndex]+'. '+copy.fracImage(q.n,q.d));
  const photo=make('div','kitchen-photo');
  photo.style.backgroundPosition=(foodIndex%5*25)+'% '+(Math.floor(foodIndex/5)*100)+'%';
  const shading=make('div','kitchen-shading');
  const lines=make('div','kitchen-slices');
  for(const layer of [photo,shading,lines])layer.setAttribute('aria-hidden','true');
  disc.append(photo,shading,lines);
  plate.append(disc,make('figcaption','kitchen-caption',copy.fracFoods[foodIndex]),
    make('p','muted',copy.fracFoodHelp));
  visual.append(plate);
 }else if(round.mode==='energy'){
  get('frac-prompt').textContent=copy.fracPaint(fractionText(q));
  visual.append(diagram(q,true));
  const selected=make('p','muted',copy.fracSelected(round.selected.size,q.d));selected.id='frac-selection';visual.append(selected);
 }else{
  get('frac-prompt').textContent=copy.fracCompare;
  const pair=make('div','fraction-pair');
  for(const part of [q.a,q.b]){
   const card=make('div','fraction-compare-card');
   card.append(make('strong','fraction-value',fractionText(part)),diagram(part));pair.append(card);
  }
  visual.append(pair);
 }
}
function hud() {
 get('frac-number').textContent=copy.question(round.index+1,10);
 get('frac-mission').textContent=copy.fracNames[modes.indexOf(round.mode)];
 get('frac-score').textContent='⭐ '+round.score;
 if(!round.answered)get('frac-feedback').textContent='';
 else{
  const q=round.questions[round.index];
  get('frac-feedback').textContent=round.correct?copy.correct:
   round.mode==='scales'?copy.fracCompareSolution(fractionText(q.a),q.sign,fractionText(q.b)):
   round.mode==='energy'?copy.fracPaintSolution(q.n,q.d):copy.fracSolution(fractionText(q));
 }
}
function nextQuestion() {
 round.answered=false;round.selected=new Set();
 get('frac-quit').hidden=false;
 get('frac-inputs').hidden=round.mode!=='kitchen';
 get('frac-comparisons').hidden=round.mode!=='scales';
 get('frac-check').hidden=round.mode==='scales';get('frac-check').disabled=false;
 for(const id of ['frac-numerator','frac-denominator']){get(id).value='';get(id).disabled=false;}
 for(const button of get('frac-comparisons').children){button.disabled=false;button.classList.remove('right','wrong');}
 get('frac-next').hidden=true;get('frac-progress').value=round.index;
 renderQuestionVisual();hud();get('frac-prompt').focus({preventScroll:true});
}
function answer(relation) {
 if(!round||round.done||round.answered)return;
 const q=round.questions[round.index];
 if(round.mode==='kitchen'){
  const n=get('frac-numerator').value.trim(),d=get('frac-denominator').value.trim();
  if(!/^\d{1,2}$/.test(n)||!/^\d{1,2}$/.test(d)||Number(d)===0){get('frac-feedback').textContent=copy.fracValid;return;}
  round.correct=Number(n)*q.d===q.n*Number(d);
 }else if(round.mode==='energy'){
  round.correct=round.selected.size===q.n;
 }else{
  round.correct=relation===q.sign;
 }
 round.answered=true;if(round.correct)round.score++;
 for(const id of ['frac-numerator','frac-denominator'])get(id).disabled=true;
 get('frac-check').disabled=true;
 for(const button of get('frac-comparisons').children){
  button.disabled=true;
  if(button.dataset.relation===q.sign)button.classList.add('right');
  else if(button.dataset.relation===relation)button.classList.add('wrong');
 }
 renderQuestionVisual();hud();get('frac-progress').value=round.index+1;
 get('frac-next').textContent=round.index===9?copy.seeResult:copy.next;
 get('frac-next').hidden=false;get('frac-next').focus({preventScroll:true});
 // Stop the timer and save on the final submitted answer, while keeping feedback visible.
 if(round.index===9)finish();
}
function finish() {
 clearInterval(ticker);round.done=true;get('frac-quit').hidden=true;
 round.ms=Math.round(performance.now()-round.start);round.passed=round.score>=8;
 const record={player:round.name,operation:'fractions',difficulty:round.mode+'-'+round.level,score:round.score,
  total:10,answered:10,ms:round.ms,passed:round.passed,finished:new Date().toISOString()};
 window.MatteCloud?.save(record);readRecords();records.unshift(record);
 try{localStorage.setItem(historyKey,JSON.stringify(records));}catch{}
 renderMenu();renderResult();
}
function renderResult() {
 get('frac-reward').textContent=round.passed?'🏅':icons[modes.indexOf(round.mode)];
 get('frac-result-title').textContent=round.passed?copy.fracMedal:copy.complete;
 get('frac-summary').textContent=round.name+' · '+round.score+'/10 · '+clock(round.ms);
 get('frac-result-note').textContent=copy.fracPoints(round.score);
}
get('frac-answer-form').addEventListener('submit',event=>{event.preventDefault();if(round?.mode!=='scales')answer();});
for(const button of get('frac-comparisons').children)button.addEventListener('click',()=>answer(button.dataset.relation));
get('frac-next').addEventListener('click',()=>{
 if(!round?.answered)return;
 if(round.done){show('frac-result','frac-result-title');return;}
 round.index++;nextQuestion();
});
get('frac-back').addEventListener('click',()=>{round=undefined;show('frac-setup');renderMenu();});
get('frac-again').addEventListener('click',()=>start(round.mode));
get('frac-quit').addEventListener('click',()=>{
 if(!confirm(copy.confirmQuit))return;
 clearInterval(ticker);round=undefined;show('frac-setup');
});
get('frac-profile').addEventListener('submit',event=>event.preventDefault());
get('player').addEventListener('input',()=>{get('player').setCustomValidity('');renderMenu();});
get('frac-level').addEventListener('change',renderMenu);
get('language').addEventListener('change',()=>{
 language=get('language').value;try{localStorage.setItem(languageKey,language);}catch{}translate();
});
window.addEventListener('storage',event=>{if(event.key===historyKey||event.key===null){readRecords();renderMenu();}});
translate();
