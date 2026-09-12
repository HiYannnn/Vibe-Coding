const regionNames={'01':'Stockholm','03':'Uppsala','04':'Sörmland','05':'Östergötland','06':'Jönköpings län','07':'Kronoberg','08':'Kalmar län','09':'Gotland','10':'Blekinge','12':'Skåne','13':'Halland','14':'Västra Götaland','17':'Värmland','18':'Örebro län','19':'Västmanland','20':'Dalarna','21':'Gävleborg','22':'Västernorrland','23':'Jämtland Härjedalen','24':'Västerbotten','25':'Norrbotten'};
const officialURL='https://www.val.se/english/the-swedish-electoral-system/the-right-to-vote-and-voting-cards';
const scbURL='https://www.scb.se/en/finding-statistics/regional-statistics/regional-divisions/counties-and-municipalities/counties-and-municipalities-in-numerical-order/';
const app=document.getElementById('app');
let lang='en',step='citizen',trail=[],municipalities=[],loadState='loading',query='',selectedParty=null,scope='municipal';
let answers={citizen:null,group:null,age:null,years:null,municipality:'0180',prior:null};
const text=key=>translations[lang][key];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
function region(code){return code?'Region '+regionNames[code.slice(0,2)]:text('unknown');}
function placeName(){return municipalities.find(m=>m.code===answers.municipality)?.name||(answers.municipality==='0180'?'Stockholm':text('unknown'));}
function eligible(a){
 if(a.age!==true)return [];
 if(a.citizen===true){if(a.municipality)return a.municipality==='0980'?['national','municipal']:['national','municipal','regional'];return a.prior===true?['national']:[];}
 if(a.citizen===false&&a.municipality&&(a.group===true||(a.group===false&&a.years===true)))return a.municipality==='0980'?['municipal']:['municipal','regional'];
 return [];
}
function go(next){trail.push(step);step=next;render(true);}
function back(){step=trail.pop()||'citizen';render(true);}
function pick(value){
 switch(step){
 case 'citizen': answers={citizen:value,group:null,age:null,years:null,municipality:answers.municipality||'0180',prior:null};go(value?'age':'group');break;
 case 'group': answers.group=value;answers.years=null;go('age');break;
 case 'age': answers.age=value;go(!value?'result':answers.citizen===false&&answers.group===false?'years':'place');break;
 case 'years': answers.years=value;go(value?'place':'result');break;
 case 'prior': answers.prior=value;go('result');break;
 }
}
function answerButton(value,title,note,icon){return `<button class="answer" data-pick="${value}"><span class="option-icon" aria-hidden="true">${icon}</span><span class="answer-copy"><strong>${esc(title)}</strong>${note?`<small>${esc(note)}</small>`:''}</span><span class="arrow" aria-hidden="true">→</span></button>`;}
function footer(){document.getElementById('footer').innerHTML=`<div class="footer"><span>${esc(text('footer'))}</span><span>${esc(text('date'))}</span></div>`;}
function questionConfig(){return {
 citizen:['citizenTitle','citizenLead','citizenYes','citizenNo','citizenYesNote','citizenNoNote','✓'],
 group:['groupTitle','groupLead','groupYes','groupNo','groupYesNote','groupNoNote','◎'],
 age:['ageTitle','ageLead','ageYes','ageNo',null,null,'18'],
 years:['yearsTitle','yearsLead','yearsYes','yearsNo',null,null,'3'],
 prior:['priorTitle','priorLead','yes','no',null,null,'↶']
 }[step];}
function shell(body){const stage=step==='citizen'?0:['group','age','years'].includes(step)?1:['place','prior'].includes(step)?2:3;
 return `<section class="wizard"><div class="step-meta"><span>${step==='result'?esc(text('section')):esc(text('step'))+' '+(trail.length+1)}</span><span>${esc(text('country'))}</span></div><div class="route-labels"><span class="${stage<2?'current':''}">01 ${esc(text('navEligibility'))}</span><span class="${stage===2?'current':''}">02 ${esc(text('navPlace'))}</span><span class="${stage===3?'current':''}">03 ${esc(text('navCompare'))}</span></div><div class="progress" aria-hidden="true">${[0,1,2,3].map(i=>`<span class="${i<=stage?'done':''}"></span>`).join('')}</div>${body}<div class="bottom-row">${trail.length?`<button class="back" data-back>← ${esc(text('back'))}</button>`:'<span></span>'}<span class="quiet">${esc(text('private'))}</span></div></section>`;
}
function placeView(){return `<div class="question-icon" aria-hidden="true">⌖</div><h1 tabindex="-1">${esc(text('placeTitle'))}</h1><p class="lead">${esc(text('placeLead'))}</p><div class="place-box"><label for="search">${esc(text('municipality'))}</label><input id="search" type="search" value="${esc(query)}" aria-label="${esc(text('search'))}" placeholder="${esc(text('search'))}" autocomplete="off"><select id="municipality" aria-label="${esc(text('municipality'))}"></select><div class="region-name" id="region-name" aria-live="polite"></div><div id="load-message"></div></div><div class="bottom-row"><span class="quiet">${link(scbURL,text('municipalSource'))}</span><button class="primary" id="place-next">${esc(text('next'))} →</button></div><button class="text-button" id="outside">${esc(text('outside'))}</button>`;}
function resultView(){const allowed=eligible(answers);let title='resultTitle',lead='resultLead';
 if(answers.age===false){title='underTitle';lead='underLead';}
 else if(answers.citizen===false&&answers.group===false&&answers.years===false){title='yearsResultTitle';lead='yearsResultLead';}
 else if(!answers.municipality&&answers.citizen===true&&answers.prior===false){title='noPriorTitle';lead='noPriorLead';}
 else if(!allowed.length){title='outsideTitle';lead='outsideLead';}
 return `<div class="question-icon" aria-hidden="true">${allowed.length?'✓':'i'}</div><h1 tabindex="-1">${esc(text(title))}</h1><p class="lead">${esc(text(lead))}</p>${answers.municipality==='0980'?`<div class="result-note">${esc(text('gotland'))}</div>`:''}<div class="result-note"><p>${esc(text('roll'))}</p><p style="margin-top:10px">${link(officialURL,text('official'))}</p></div>${allowed.length?`<p class="eyebrow">${esc(text('choose'))}</p><div class="choices">${allowed.map(s=>`<button class="answer" data-election="${s}"><span class="option-icon" aria-hidden="true">${{national:'▤',municipal:'⌂',regional:'+'}[s]}</span><span class="answer-copy"><strong>${esc(text(s))}${s==='municipal'?' · '+esc(placeName()):s==='regional'?' · '+esc(region(answers.municipality)):''}</strong><small>${esc(text(s+'Note'))}</small></span><span class="arrow" aria-hidden="true">→</span></button>`).join('')}</div>`:`<button class="primary" data-election="municipal">${esc(text('browse'))} →</button>`}`;
}
function spectrum(){const sorted=[...parties].sort((a,b)=>positions[a.id]-positions[b.id]);return `<section class="spectrum-panel" id="spectrum"><h2>${esc(text('spectrum'))}</h2><p class="spectrum-sub">${esc(text('spectrumSub'))}</p><div class="spectrum-frame"><div class="spectrum-scroll" tabindex="0" role="group" aria-label="${esc(text('spectrum'))}"><div class="axis-labels"><span>${esc(text('left'))} · 0</span><span>${esc(text('centre'))} · 5</span><span>10 · ${esc(text('right'))}</span></div><div class="spectrum-chart"><div class="axis" aria-hidden="true"></div>${[0,25,50,75,100].map(x=>`<span class="axis-tick" style="left:${x}%" aria-hidden="true"></span>`).join('')}${sorted.map((p,i)=>`<button class="party-marker ${i%2?'lower':''}" style="left:${positions[p.id]*10}%;--party-color:${partyColors[p.id]}" data-party="${p.id}" aria-pressed="${selectedParty===p.id}" aria-label="${esc(p.name)}, ${positions[p.id].toFixed(1)} / 10" title="${esc(p.name)} · ${positions[p.id].toFixed(1)} / 10"><span class="badge">${p.id}</span><span class="marker-name">${esc(lang==='zh'?partyPoints[p.id].zh:lang==='en'?p.en:p.name)}</span></button>`).join('')}</div></div></div><p class="mobile-hint">${esc(text('spectrumMobile'))}</p><div class="spectrum-help"><p>${esc(text('spectrumNote'))}</p>${link('https://www.chesdata.eu/ches-europe/',text('spectrumSource'))}</div></section>`;}
function cards(){const covered=scope==='national'||(scope==='municipal'?answers.municipality==='0180':answers.municipality?.startsWith('01'));
 if(!covered)return `<div class="notice"><p>${esc(text('uncovered'))}</p>${link('https://valkompass.svt.se/2026/',text('svtGuide'))}</div>`;
 return `<div class="party-grid">${parties.filter(p=>!selectedParty||p.id===selectedParty).map(p=>`<article class="party-card" style="--party-color:${partyColors[p.id]}"><header><span class="badge">${p.id}</span><div><h3>${esc(p.name)}</h3>${lang!=='sv'?`<small>${esc(lang==='zh'?partyPoints[p.id].zh:p.en)}</small>`:''}</div></header><p class="card-label">${esc(text(scope==='national'?'priorities':'proposals'))}</p><ul>${partyPoints[p.id][scope][lang].map(point=>`<li>${esc(point)}</li>`).join('')}</ul><div class="card-source"><span class="proposed">${esc(text(scope==='national'?'priorityBadge':'proposalBadge'))}</span>${link(scope==='national'?p.url:'https://valkompass.svt.se/2026/parti/'+p.slug+(scope==='municipal'?'-stockholm/':'-region-stockholm/'),text('readSource'))}</div></article>`).join('')}</div>`;
}
const election2022=[['S',1964474,30.33],['SD',1330325,20.54],['M',1237428,19.10],['V',437050,6.75],['C',434945,6.71],['KD',345712,5.34],['MP',329242,5.08],['L',298542,4.61],[null,100076,1.54]];
function previousElection(){const locale={sv:'sv-SE',en:'en-GB',zh:'zh-CN'}[lang];const number=n=>n.toLocaleString(locale);return `<section class="election-results" id="election-2022"><h2>${esc(text('previousElection'))}</h2><p class="spectrum-sub">${esc(text('previousNote'))}</p><div class="results-scroll"><table><thead><tr><th scope="col">${esc(text('resultParty'))}</th><th scope="col">${esc(text('resultVotes'))}</th><th scope="col">${esc(text('resultShare'))}</th></tr></thead><tbody>${election2022.map(([id,votes,share])=>{const p=parties.find(p=>p.id===id);return `<tr><th scope="row">${p?'<span class="result-party"><span class="result-party-badge" style="--party-color:'+partyColors[id]+'">'+esc(id)+'</span><span>'+esc(lang==='zh'?partyPoints[id].zh:lang==='en'?p.en:p.name)+'</span></span>':esc(text('resultOthers'))}</th><td>${number(votes)}</td><td>${share.toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2})}%</td></tr>`;}).join('')}</tbody><tfoot><tr><th scope="row">${esc(text('resultTotal'))}</th><td>${number(6477794)}</td><td>100%</td></tr></tfoot></table></div><p class="quiet">${link('https://www.val.se/download/18.162047b519a91d05331146ae/1663951746642/Riksdag%20val%202022%20Beslut%20med%20bilagor%20-%20med%20r%C3%A4ttelse%20enligt%20FL.pdf',text('resultSource'))}</p></section>`;}
function exploreView(){const gotland=answers.municipality==='0980';if(gotland&&scope==='regional')scope='municipal';
 const location=scope==='national'?text('national'):scope==='municipal'?placeName():region(answers.municipality);
 return `<section class="explore"><button class="back" data-back>← ${esc(text('back'))}</button><div class="explore-top"><div><p class="eyebrow">${esc(text('section'))}</p><h1 tabindex="-1">${esc(location)}<br>${esc(text('guideSuffix'))}</h1><p class="lead">${esc(text('learnLead'))}</p></div><span class="location-pill">${esc(location)}</span></div><div class="switcher" role="group" aria-label="${esc(text('choose'))}">${(gotland?['municipal','national']:['municipal','regional','national']).map(s=>`<button data-scope="${s}" aria-pressed="${scope===s}">${esc(text(s))}</button>`).join('')}</div><nav class="section-nav" aria-label="${esc(text('navCompare'))}"><a href="#responsibilities">${esc(text('responsibilities'))}</a><a href="#spectrum">${esc(text('spectrum'))}</a><a href="#party-heading">${esc(text('partyList'))}</a><a href="#election-2022">${esc(text('previousElection'))}</a></nav><div class="responsibility" id="responsibilities"><span aria-hidden="true">${{national:'▤',municipal:'⌂',regional:'+'}[scope]}</span><p><strong>${esc(text('responsibilities'))}</strong>${esc(text(gotland&&scope==='municipal'?'gotlandRole':scope+'Role'))}</p></div>${spectrum()}<div class="list-heading" id="party-heading"><h2>${esc(text('partyList'))}</h2>${selectedParty?`<button class="all-button" id="show-all">${esc(text('showAll'))}</button>`:''}</div><p class="quiet">${esc(text('context'+scope[0].toUpperCase()+scope.slice(1)))} · ${esc(location)}. ${esc(text('sourceLanguage'))}</p><div id="party-list" aria-live="polite">${cards()}</div>${previousElection()}<details class="source-details"><summary>${esc(text('method'))}</summary><p>${esc(text('methodText'))}</p><p>${esc(text('recordText'))}</p>${link('https://www.regionstockholm.se/om-region-stockholm/ekonomi-och-budget/budget/partiernas-budgetforslag-2026/',text('budget'))}<p>${esc(text('otherText'))}</p>${link('https://www.val.se/english',text('official'))}<p>${esc(text('research'))}</p>${link('https://www.chesdata.eu/ches-europe/','CHES 2024')}<p>${esc(text('checked'))}</p></details><p class="quiet">${esc(text('browseOnly'))}</p><button class="text-button" id="restart">${esc(text('restart'))}</button></section>`;
}
function render(focus=false){document.documentElement.lang=lang==='zh'?'zh-CN':lang;document.title=text('title');footer();
 if(step==='explore')app.innerHTML=exploreView();
 else if(step==='place')app.innerHTML=shell(placeView());
 else if(step==='result')app.innerHTML=shell(resultView());
 else{const c=questionConfig();app.innerHTML=shell(`<div class="question-icon" aria-hidden="true">${c[6]}</div><h1 tabindex="-1">${esc(text(c[0]))}</h1><p class="lead">${esc(text(c[1]))}</p><div class="choices">${answerButton(true,text(c[2]),c[4]?text(c[4]):'', '✓')}${answerButton(false,text(c[3]),c[5]?text(c[5]):'','◎')}</div>`);}
 app.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.pick==='true')));
 app.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',back));
 app.querySelectorAll('[data-election]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.election;selectedParty=null;go('explore');}));
 app.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;render();}));
 app.querySelectorAll('[data-party]').forEach(b=>b.addEventListener('click',()=>{selectedParty=selectedParty===b.dataset.party?null:b.dataset.party;render();app.querySelector(`[data-party="${b.dataset.party}"]`)?.focus({preventScroll:true});}));
 document.getElementById('show-all')?.addEventListener('click',()=>{selectedParty=null;render();});
 document.getElementById('restart')?.addEventListener('click',()=>{step='citizen';trail=[];render(true);});
 if(step==='place'){
  refreshOptions();document.getElementById('search').addEventListener('input',e=>{query=e.target.value;refreshOptions();});
  document.getElementById('municipality').addEventListener('change',e=>{answers.municipality=e.target.value;document.getElementById('region-name').textContent='↳ '+region(answers.municipality);});
  document.getElementById('place-next').addEventListener('click',()=>{const code=document.getElementById('municipality').value;if(municipalities.some(m=>m.code===code)){answers.municipality=code;go('result');}});
  document.getElementById('outside').addEventListener('click',()=>{answers.municipality=null;go(answers.citizen?'prior':'result');});
 }
 if(focus){window.scrollTo({top:0,behavior:'instant'});app.querySelector('h1')?.focus({preventScroll:true});}
}
function refreshOptions(){const select=document.getElementById('municipality');if(!select)return;
 const rows=municipalities.filter(m=>m.name.toLocaleLowerCase('sv').includes(query.trim().toLocaleLowerCase('sv')));
 select.replaceChildren(...rows.map(m=>new Option(m.name,m.code)));
 if(rows.some(m=>m.code===answers.municipality))select.value=answers.municipality;
 if(!rows.length)select.add(new Option(text(loadState==='loading'?'loading':'noMatch'),''));
 select.disabled=!rows.length;document.getElementById('place-next').disabled=!rows.length;
 document.getElementById('region-name').textContent=rows.length?'↳ '+region(select.value):'';
 const message=document.getElementById('load-message');message.innerHTML=loadState==='error'?`<p role="alert">${esc(text('loadError'))}</p><button class="text-button" id="retry">${esc(text('retry'))}</button>`:'';
 document.getElementById('retry')?.addEventListener('click',loadMunicipalities);
}
async function loadMunicipalities(){loadState='loading';refreshOptions();try{const response=await fetch('municipalities.json');if(!response.ok)throw Error('load');const data=await response.json();if(!Array.isArray(data)||data.length!==290)throw Error('invalid data');municipalities=data.sort((a,b)=>a.name.localeCompare(b.name,'sv'));loadState='ready';refreshOptions();}catch{loadState='error';refreshOptions();}}
const languageSelect=document.getElementById('language');
function setLanguage(value){
 if(!Object.prototype.hasOwnProperty.call(translations,value))return;
 lang=value;languageSelect.value=value;
 try{localStorage.setItem('valguide-language',value);}catch{}
 render();
}
languageSelect.addEventListener('change',e=>setLanguage(e.target.value));
try{const savedLanguage=localStorage.getItem('valguide-language');if(Object.prototype.hasOwnProperty.call(translations,savedLanguage))lang=savedLanguage;}catch{}
languageSelect.value=lang;
render();loadMunicipalities();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'select_municipality',description:'Choose a municipality by its four-digit code. Update the location in the current guide; this does not confirm voting eligibility.',inputSchema:{type:'object',properties:{code:{type:'string',pattern:'^[0-9]{4}$'}},required:['code'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='code')||typeof input.code!=='string')throw Error('Provide only a municipality code.');const row=municipalities.find(m=>m.code===input.code);if(!row)throw Error('Unknown municipality or list not loaded.');answers.municipality=row.code;query='';render();return {municipality:row.name,code:row.code,region:region(row.code)};}})).catch(()=>{});}catch{}}
