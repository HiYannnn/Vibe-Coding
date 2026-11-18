'use strict';
const get=id=>document.getElementById(id);
const historyKey='kalana-multiplication-history-v1';
const languageKey='kalana-multiplication-language-v1';
const limits={2:90,3:150,4:240};
const isSubtraction=document.body.dataset.operation === 'subtraction';
const operation=isSubtraction?'subtraction':'addition';
let language='sv',copy,round,ticker;
try {const saved=localStorage.getItem(languageKey);if(Object.hasOwn(additionCopy,saved))language=saved;} catch {}
const random=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
function questions(digits) {
  const min=10**(digits-1),max=10**digits-1;
  const seen=new Set(),result=[];
  while(result.length<10) {
    const first=random(min,max),second=random(min,max);
    const a=isSubtraction?Math.max(first,second):first;
    const b=isSubtraction?Math.min(first,second):second;
    const key=[a,b].sort((x,y)=>x-y).join('-');
    const regrouping=String(a).split('').reverse().some((n,index)=>{
      const other=Number(String(b).at(-1-index));
      return isSubtraction?Number(n)<other:Number(n)+other>=10;
    });
    if(seen.has(key) || (result.length%2===0 && !regrouping))continue;
    seen.add(key);result.push({a,b,answer:isSubtraction?a-b:a+b});
  }
  return result;
}
function clock(ms) {const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function rules() {get('add-rules').textContent=copy.addRules(limits[get('add-level').value],get('add-mode').value==='challenge');}
function translate() {
  copy={...translations[language],...adventureCopy[language],...portalCopy[language],...crosswordCopy[language],...leaderboardCopy[language],...additionCopy[language],...(isSubtraction?subtractionCopy[language]:{})};
  document.documentElement.lang=language;document.title=copy.addTitle+' · '+copy.portalTitle;
  get('language').value=language;get('language').setAttribute('aria-label',copy.language);
  for(const el of document.querySelectorAll('[data-copy]'))el.textContent=copy[el.dataset.copy];
  get('player').placeholder=copy.placeholder;
  get('add-answer').setAttribute('aria-label',copy.answer);
  get('add-answer').setAttribute('aria-describedby','add-equation');
  get('add-energy').setAttribute('aria-label',copy.progress);
  get('add-timer').setAttribute('aria-label',copy.time);
  rules();
  if(round?.done)resultText();else if(round)hud();
}
function hud() {
  get('add-progress').textContent=copy.question(round.index+1,10);
  get('add-score').textContent='⚡ '+round.score;
  get('add-feedback').textContent=round.answered ? (round.correct?copy.correct:copy.incorrect(round.questions[round.index].answer)):'';
}
function tick() {
  const elapsed=performance.now()-round.start;
  const remaining=round.limit-elapsed;
  get('add-timer').textContent=clock(round.timed?remaining:elapsed);
  if(round.timed&&remaining<=0)finish(true);
}
function showQuestion() {
  round.answered=false;
  const q=round.questions[round.index];
  get('add-equation').textContent=q.a+(isSubtraction?' − ':' + ')+q.b+' = ?';
  get('add-energy').value=round.index;
  get('add-answer').value='';get('add-answer').disabled=false;
  get('add-check').disabled=false;get('add-next').hidden=true;
  hud();get('add-answer').focus();
}
get('add-start').addEventListener('submit',event=>{
 event.preventDefault();
 const name=get('player').value.trim();
 if(!name){get('player').setCustomValidity(copy.enterName);get('player').reportValidity();return;}
 const digits=Number(get('add-level').value);
 round={name,digits,timed:get('add-mode').value==='challenge',limit:limits[digits]*1000,
  questions:questions(digits),index:0,score:0,count:0,start:performance.now()};
 get('add-setup').hidden=true;get('add-result').hidden=true;get('add-game').hidden=false;
 showQuestion();tick();ticker=setInterval(tick,150);
});
get('add-answer-form').addEventListener('submit',event=>{
 event.preventDefault();
 if(!round||round.done||round.answered)return;
 if(round.timed&&performance.now()-round.start>=round.limit){finish(true);return;}
 const value=get('add-answer').value.trim();
 if(!/^\d{1,5}$/.test(value)){get('add-feedback').textContent=copy.addValid;return;}
 round.answered=true;round.count++;round.correct=Number(value)===round.questions[round.index].answer;
 if(round.correct)round.score++;
 get('add-answer').disabled=true;get('add-check').disabled=true;
 get('add-energy').value=round.count;
 if(round.count===10){finish(false);return;}
 hud();get('add-next').hidden=false;get('add-next').focus();
});
get('add-next').addEventListener('click',()=>{if(!round?.answered||round.done)return;round.index++;showQuestion();});
function finish(timeout) {
 if(round.done)return;
 clearInterval(ticker);round.done=true;round.timeout=timeout;
 round.ms=timeout?round.limit:Math.round(performance.now()-round.start);
 round.passed=round.timed&&!timeout&&round.score>=8;
 const record={player:round.name,operation,difficulty:round.digits+'-'+(round.timed?'challenge':'practice'),
  score:round.score,total:10,answered:round.count,ms:round.ms,passed:round.timed?round.passed:null,finished:new Date().toISOString()};
 window.MatteCloud?.save(record);
 try {const records=JSON.parse(localStorage.getItem(historyKey)||'[]');records.unshift(record);localStorage.setItem(historyKey,JSON.stringify(records));}catch {}
 get('add-game').hidden=true;get('add-result').hidden=false;resultText();get('add-result-title').focus();
}
function resultText(){
 get('add-reward').textContent=round.passed?'🏅':'🚀';
 get('add-result-title').textContent=round.timeout?copy.timeUp:round.passed?copy.addWon:copy.addDone;
 get('add-summary').textContent=round.name+' · '+round.score+'/10 · '+clock(round.ms);
 const notes=[copy.addPoints(round.score)];
 if(round.passed)notes.push(copy.addBadge);
 else if(round.timed)notes.push(copy.addRetry);
 if(round.answered&&!round.correct)notes.push(copy.incorrect(round.questions[round.index].answer));
 get('add-result-note').textContent=notes.join(' ');
}
get('add-again').addEventListener('click',()=>{round=undefined;get('add-result').hidden=true;get('add-setup').hidden=false;get('player').focus();});
get('add-quit').addEventListener('click',()=>{if(!confirm(copy.confirmQuit))return;clearInterval(ticker);round=undefined;get('add-game').hidden=true;get('add-setup').hidden=false;});
get('player').addEventListener('input',()=>get('player').setCustomValidity(''));
get('add-level').addEventListener('change',rules);get('add-mode').addEventListener('change',rules);
get('language').addEventListener('change',()=>{language=get('language').value;try{localStorage.setItem(languageKey,language);}catch{}translate();});
translate();
