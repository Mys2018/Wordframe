const paths={
layers:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
book:'<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14"/>',
chart:'<path d="M4 4v16h17M8 16v-5m5 5V6m5 10v-8"/>',
globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
volume:'<path d="M4 9h4l5-4v14l-5-4H4zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
save:'<path d="M6 4h12v17l-6-4-6 4z"/>',goal:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
bulb:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2z"/>',
check:'<path d="m4 12 5 5L20 6"/>',cross:'<path d="m6 6 12 12M6 18 18 6"/>',repeat:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',skip:'<path d="m5 5 10 7-10 7zM19 5v14"/>'};
const icon=k=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+paths[k]+'</svg>';
document.querySelectorAll('[data-i]').forEach(e=>e.outerHTML=icon(e.dataset.i));
const bank=new Map(words.map(w=>[w.id,w]));
const gameCollection='Casualties Unknown', allLevels='all-levels', allParts='all';
const levels=Object.keys(source), key='wf-english-v1';
const levelLabels=new Map([[allLevels,'Все уровни'],...levels.map(level=>[level,level]),[gameCollection,gameCollection]]);
const partLabels=new Map([
  [allParts,'Все части речи'],['phrasal','Фразовые глаголы'],['verb','Глаголы'],['noun','Существительные'],
  ['adj','Прилагательные'],['adv','Наречия'],['prep','Предлоги'],['conj','Союзы'],['det','Определители']
]);
let state;try{state=JSON.parse(localStorage.getItem(key))}catch{}
state=Object.assign({level:'A2',part:allParts,saved:[],sessions:{},records:{},days:{},review:null},state||{});
if(!levelLabels.has(state.level))state.level='A2';
if(!partLabels.has(state.part))state.part=allParts;
const writeState=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const shuffle=items=>{const arr=[...items];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
function build(ids){
  const contexts={};
  for(const id of ids){
    const count=bank.get(id)?.contexts?.length;
    if(count)contexts[id]=(state.records[id]?.n||0)%count;
  }
  return {ids,pos:0,answers:{},contexts,layouts:Object.fromEntries(ids.map(id=>[id,shuffle([0,1,2,3])]))};
}
function cardsAtLevel(level){
  if(level===allLevels)return words;
  return words.filter(w=>w.level===level||w.collection===level);
}
const workoutKey=()=>state.part===allParts?state.level:state.level+':'+state.part;
function newWorkout(){
  const pool=shuffle(cardsAtLevel(state.level).filter(w=>state.part===allParts
    || (state.part==='phrasal'?w.phrasal:w.part===state.part)))
    .sort((a,b)=>(state.records[a.id]?.n||0)-(state.records[b.id]?.n||0));
  if(workoutKey()==='A2'&&!state.sessions.A2&&!state.records['A2-0']){
    const first=pool.findIndex(w=>w.id==='A2-0');
    if(first>=0)pool.unshift(pool.splice(first,1)[0]);
  }
  return build(pool.slice(0,10).map(w=>w.id));
}
function session(){
  if(state.review)return state.review;
  const id=workoutKey();
  if(!state.sessions[id]){
    state.sessions[id]=newWorkout();
    writeState();
  }
  return state.sessions[id];
}
const cleared=s=>s.replace(/[\[\]]/g,'');
const contextLabel=index=>index===0?'Игровая ситуация':'Простой пример';
const contextIndex=(w,s)=>s.contexts?.[w.id]??0;
const currentContext=(w,s)=>w.contexts?.[contextIndex(w,s)]??w;
const glossPrompt='Нажми на подчёркнутое слово, чтобы увидеть перевод.';
function marked(s,answered){
  let i=0;
  return s.replace(/\[([^\]]+)\]|[\p{L}]+(?:'[\p{L}]+)*/gu,(token,target)=>{
    if(target)return '<mark>'+(answered?'<button type="button" class="lookup" data-gloss="target" aria-pressed="false">'+target+'</button>':target)+'</mark>';
    const index=i++;
    return '<button type="button" class="lookup" data-gloss="'+index+'" aria-pressed="false">'+token+'</button>';
  });
}
const day=()=>{const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')};
const page=()=>['stats','dictionary'].includes(location.hash.slice(1))?location.hash.slice(1):'practice';
const view=document.getElementById('view');let hint=false,q='',timer;
function note(msg){const e=document.getElementById('notice');e.textContent=msg;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2800)}
function speak(context){if(!('speechSynthesis'in window)){note('Этот браузер не поддерживает озвучку.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(cleared(context.sentence));u.lang='en-US';u.rate=.9;const v=speechSynthesis.getVoices().find(v=>/^en[-_]/i.test(v.lang));if(v)u.voice=v;u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))note('Английская озвучка сейчас недоступна в браузере.')};speechSynthesis.speak(u)}
const btn=(action,label,cls='quietbtn',val='')=>'<button class="'+cls+'" data-act="'+action+'" data-val="'+val+'">'+label+'</button>';
function iconBtn(action,id,label,symbol,active=false){return '<button class="iconbtn '+(active?'saved':'')+'" data-act="'+action+'" data-val="'+id+'" aria-label="'+label+'" title="'+label+'" '+(action==='save'?'aria-pressed="'+active+'"':'')+'>'+icon(symbol)+'</button>'}
function practiceControls(){
  function buttons(labels,action,active){
    return [...labels].map(([value,label])=>'<button type="button" data-act="'+action+'" data-val="'+value
      +'" aria-pressed="'+(value===active)+'">'+label+'</button>').join('');
  }
  return '<div class="practice-controls"><div class="levels" role="group" aria-label="Уровень или подборка">'
    +buttons(levelLabels,'level',state.level)+'</div><div class="practice-filters" role="group" aria-label="Часть речи">'
    +buttons(partLabels,'part',state.part)+'</div></div>';
}
const head=(title,extra='')=>'<div class="rowhead"><h2>'+title+'</h2>'+extra+'</div>';
const bar=n=>'<div class="meter"><b style="width:'+Math.min(100,n)+'%"></b></div>';
function contextControls(w,s){
  if(!w.contexts)return '';
  return '<div class="contexts" role="group" aria-label="Контекст фразы">'+w.contexts.map((_,index)=>{
    const active=contextIndex(w,s)===index;
    return '<button class="quietbtn" data-act="context" data-val="'+index+'" aria-pressed="'+active+'">'+contextLabel(index)+'</button>';
  }).join('')+'</div>';
}
function entryContexts(w){
  return (w.contexts??[w]).map((context,index)=>'<div class="entry-context">'
    +(w.contexts?'<small>'+contextLabel(index)+'</small>':'')+'<p lang="en">'+cleared(context.sentence)
    +'</p><p>'+context.translation+'</p></div>').join('');
}
function rail(){const n=state.days[day()]||0;return '<aside class="rail"><section class="panel sidebox"><h3 class="sidehead"><span class="tile">'+icon('goal')+'</span>Цель на день</h3><div class="spread"><div class="goalnum">'+n+' <small>/ 10</small></div><span class="meta">ответов сегодня</span></div>'+bar(n*10)+'<p class="desc">'+(n>=10?'Дневная цель выполнена.':n?'До цели осталось '+(10-n)+'.':'Начни с десяти карточек в день.')+'</p></section><section class="panel sidebox tint"><h3 class="sidehead"><span class="tile">'+icon('book')+'</span>Мой словарь</h3><p class="desc">'+(state.saved.length?'Сохранено слов и выражений: '+state.saved.length+'.':'Сохраняй слова из карточек, чтобы повторить их позже.')+'</p>'+btn('dictionary','Открыть словарь')+'</section></aside>'}
function trainingCard(s,w){
  const id=w.id, val=s.answers[id], answered=val!==undefined;
  const saved=state.saved.includes(id), context=currentContext(w,s);
  const choices=s.layouts[id].map((option,i)=>{
    const result=answered?(option===0?'ok':option===val?'bad':''):'';
    const resultIcon=result==='ok'?icon('check'):result==='bad'?icon('cross'):'';
    return '<button type="button" '+(answered?'disabled':'')+' class="choice '+result
      +'" data-act="answer" data-val="'+option+'"><span class="key">'+(i+1)+'</span>'+w.options[option]+resultIcon+'</button>';
  }).join('');
  const feedback=answered?'<div class="feedback" role="status"><b>'
    +(val===0?'Верно!':val===-1?'Карточка пропущена.':'Верный перевод — '+w.right+'.')
    +'</b><span>'+context.translation+'</span>'+(w.hint?'<small>'+w.hint+'</small>':'')+'</div>':'';
  const actions=answered?'<span class="meta">'+w.word+' · '+w.right+'</span>'+btn('next',s.pos+1===s.ids.length?'Итоги':'Дальше','primary')
    :(w.hint?btn('hint',icon('bulb')+(hint?'Скрыть подсказку':'Подсказка'),'textbtn'):'<span></span>')
      +btn('skip','Пропустить '+icon('skip'),'textbtn');
  return '<section class="panel exercise"><div class="cardtop"><span class="counter"><strong>'+w.level+'</strong> Карточка '
    +(s.pos+1)+' / '+s.ids.length+'</span><div class="tools">'+iconBtn('sound',id,'Прослушать фразу','volume')
    +iconBtn('save',id,saved?'Убрать из словаря':'Сохранить в словарь','save',saved)+'</div></div>'+contextControls(w,s)
    +'<div class="prompt"><span class="quote" aria-hidden="true">“</span><p class="phrase" lang="en">'+marked(context.sentence,answered)
    +'</p><div class="glossnote" role="status" lang="ru">'+glossPrompt+'</div></div>'
    +'<h3 class="ask">Как переводится выделенное слово'+(w.word.includes(' ')?'сочетание':'')+'?</h3>'
    +'<div class="choices">'+choices+'</div>'+feedback+(w.hint&&hint&&!answered?'<p class="hint">'+w.hint+'</p>':'')
    +'<div class="actions">'+actions+'</div></section>';
}
function training(s){
  const w=bank.get(s.ids[s.pos]);
  let card;
  if(w){
    card=trainingCard(s,w);
  }else if(!s.ids.length){
    card='<section class="panel finish"><h3>В этой подборке пока нет карточек</h3>'
      +btn('level','Все уровни','primary',allLevels)+btn('part','Все части речи','quietbtn',allParts)+'</section>';
  }else{
    const good=s.ids.filter(id=>s.answers[id]===0).length;
    card='<section class="panel finish"><span class="tile">'+icon('check')+'</span><h3>Подборка пройдена</h3>'
      +'<p>Верных ответов — '+good+' из '+s.ids.length+'.</p>'+(good<s.ids.length?btn('mistakes',icon('repeat')+' Повторить ошибки'):'')
      +btn('new','Новая подборка','primary')+'</section>';
  }
  return head(state.review?'Повторение':'Тренировка')+practiceControls()+'<div class="grid">'+card+rail()+'</div>';
}
function entries(){const items=state.saved.map(id=>bank.get(id)).filter(Boolean).filter(w=>(w.word+' '+w.right).toLowerCase().includes(q.toLowerCase().trim()));return items.length?items.map(w=>'<article class="panel entry"><div><small>'+w.level+'</small><div><b lang="en">'+w.word+'</b> · '+w.right+'</div>'+entryContexts(w)+'</div><div class="tools">'+iconBtn('sound',w.id,'Прослушать фразу','volume')+iconBtn('save',w.id,'Убрать из словаря','save',true)+'</div></article>').join(''):'<p class="panel empty">По этому запросу слов пока нет.</p>'}
function dictionary(){return head('Мой словарь',state.saved.length?btn('reviewSaved','Повторить слова','primary'):'')+(state.saved.length?'<input id="search" class="search" aria-label="Поиск по словарю" placeholder="Найти слово или перевод"><div class="list" id="entries">'+entries()+'</div>':'<div class="panel empty"><span class="tile">'+icon('book')+'</span><h3>Здесь будут твои слова</h3><p>Нажми на закладку в карточке, чтобы сохранить слово вместе с примером.</p>'+btn('practice','К тренировке','primary')+'</div>')}
function statistics(){const data=Object.values(state.records),n=data.reduce((a,r)=>a+r.n,0),ok=data.reduce((a,r)=>a+r.ok,0);return head('Твой прогресс')+'<div class="statsgrid">'+[['Ответов',n],['Точность',n?Math.round(100*ok/n)+'%':'—'],['Дней практики',Object.keys(state.days).length]].map(([label,val])=>'<div class="panel sidebox"><span class="meta">'+label+'</span><strong>'+val+'</strong></div>').join('')+'</div><div class="panel sidebox statslevels"><h3>Практика по разделам</h3><p class="desc">Сколько разных карточек ты уже разобрал.</p>'+[...levels,gameCollection].map(l=>{const pool=cardsAtLevel(l),seen=pool.filter(w=>state.records[w.id]).length;return '<div class="levelstat'+(l===gameCollection?' game-stat':'')+'"><b>'+l+'</b>'+bar(100*seen/pool.length)+'<span>'+seen+' / '+pool.length+'</span></div>'}).join('')+'</div>'}
let lastTraining;
function render(){
  const p=page();
  document.querySelectorAll('[data-nav]').forEach(a=>{
    a.classList.toggle('active',a.dataset.nav===p);
    if(a.dataset.nav===p)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  if(p==='practice'){
    const s=session(), answered=s.answers[s.ids[s.pos]]!==undefined;
    const newCard=lastTraining?.session!==s||lastTraining.pos!==s.pos;
    view.innerHTML=training(s);
    if(newCard)view.querySelector('.exercise, .finish')?.classList.add('enter');
    if(!newCard&&answered&&!lastTraining.answered)view.querySelector('.feedback')?.classList.add('enter');
    lastTraining={session:s,pos:s.pos,answered};
    return;
  }
  lastTraining=undefined;
  view.innerHTML=p==='stats'?statistics():dictionary();
  const search=document.getElementById('search');
  if(search)search.value=q;
}
function answer(n){const s=session(),id=s.ids[s.pos];if(!id||s.answers[id]!==undefined)return;s.answers[id]=n;if(n!==-1){const r=state.records[id]||(state.records[id]={n:0,ok:0});r.n++;if(n===0)r.ok++;state.days[day()]=(state.days[day()]||0)+1}hint=false;writeState();render()}
function action(a,val){if(a==='sound'){const w=bank.get(val);speak(page()==='practice'?currentContext(w,session()):w.contexts?.[0]??w);return}
if(a==='context'){
  const s=session(),w=bank.get(s.ids[s.pos]),index=Number(val);
  if(!w?.contexts?.[index])return;
  (s.contexts??={})[w.id]=index;
  writeState();
  render();
  view.querySelector('[data-act="context"][aria-pressed="true"]')?.focus({preventScroll:true});
  return;
}
if(a==='answer'||a==='skip'){answer(a==='skip'?-1:Number(val));return}
if(a==='level'||a==='part'){
  const labels=a==='level'?levelLabels:partLabels;
  if(!labels.has(val))return;
  state.review=null;
  state[a]=val;
  hint=false;
  writeState();
  render();
  view.querySelector('[data-act="'+a+'"][aria-pressed="true"]')?.focus({preventScroll:true});
  return;
}
if(a==='save'){const i=state.saved.indexOf(val);if(i<0)state.saved.unshift(val);else state.saved.splice(i,1);note(i<0?'Слово сохранено':'Слово убрано из словаря')}
if(a==='hint')hint=!hint;
if(a==='dictionary'||a==='practice'){location.hash=a;return}
if(a==='next'){const s=session();if(s.answers[s.ids[s.pos]]===undefined)return;s.pos++;hint=false}
if(a==='new'){state.review=null;state.sessions[workoutKey()]=newWorkout();hint=false}
if(a==='reviewSaved'){if(!state.saved.length)return;state.review=build(shuffle(state.saved).slice(0,10));hint=false;location.hash='practice'}
if(a==='mistakes'){const s=session();state.review=build(shuffle(s.ids.filter(id=>s.answers[id]!==0)));hint=false}
writeState();render()}
view.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b&&!b.disabled)action(b.dataset.act,b.dataset.val)});
view.addEventListener('input',e=>{if(e.target.id==='search'){q=e.target.value;document.getElementById('entries').innerHTML=entries()}});
window.addEventListener('hashchange',()=>{q='';hint=false;render()});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||page()!=='practice'||e.target.matches('input,textarea'))return;const s=session(),id=s.ids[s.pos];if(!id)return;if(/^[1-4]$/.test(e.key)){e.preventDefault();answer(s.layouts[id][Number(e.key)-1])}else if(e.key==='Enter'&&s.answers[id]!==undefined&&!e.target.closest('button,a')){e.preventDefault();action('next')}});
render();

function closeGloss(){
  const active=view.querySelector('.lookup.chosen');
  if(!active)return;
  active.classList.remove('chosen');
  active.setAttribute('aria-pressed','false');
  view.querySelector('.glossnote').textContent=glossPrompt;
}
document.addEventListener('click',e=>{
  const button=e.target.closest('.lookup');
  const wasActive=button?.classList.contains('chosen');
  closeGloss();
  if(!button||wasActive)return;
  const s=session(),w=bank.get(s.ids[s.pos]);
  const translations=currentContext(w,s).glosses??glosses[w.sentence];
  button.classList.add('chosen');
  button.setAttribute('aria-pressed','true');
  view.querySelector('.glossnote').textContent=button.dataset.gloss==='target'?w.right:translations[Number(button.dataset.gloss)];
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGloss()});

