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
const levels=Object.keys(source), key='wf-english-v1';
let state;try{state=JSON.parse(localStorage.getItem(key))}catch{}
state=Object.assign({level:'A2',saved:[],sessions:{},records:{},days:{},review:null},state||{});
const writeState=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const shuffle=items=>{const arr=[...items];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
function build(ids){return {ids,pos:0,answers:{},layouts:Object.fromEntries(ids.map(id=>[id,shuffle([0,1,2,3])]))}}
function newLevel(l){const pool=shuffle(words.filter(w=>w.level===l)).sort((a,b)=>(state.records[a.id]?.n||0)-(state.records[b.id]?.n||0));if(l==='A2'&&!state.sessions.A2&&!state.records['A2-0']){const i=pool.findIndex(w=>w.id==='A2-0');pool.unshift(pool.splice(i,1)[0])}return build(pool.slice(0,10).map(w=>w.id))}
function session(){if(!state.sessions[state.level]){state.sessions[state.level]=newLevel(state.level);writeState()}return state.review||state.sessions[state.level]}
const cleared=s=>s.replace(/[\[\]]/g,'');
function marked(s){
  let i=0;
  return s.replace(/\[([^\]]+)\]|[\p{L}]+(?:'[\p{L}]+)*/gu,(token,target)=>target?'<mark>'+target+'</mark>':'<button type="button" class="lookup" data-gloss="'+i+++'">'+token+'</button>');
}
const day=()=>{const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')};
const page=()=>['stats','dictionary'].includes(location.hash.slice(1))?location.hash.slice(1):'practice';
const view=document.getElementById('view');let hint=false,q='',timer;
function note(msg){const e=document.getElementById('notice');e.textContent=msg;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2800)}
function speak(id){if(!('speechSynthesis'in window)){note('Этот браузер не поддерживает озвучку.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(cleared(bank.get(id).sentence));u.lang='en-US';u.rate=.9;const v=speechSynthesis.getVoices().find(v=>/^en[-_]/i.test(v.lang));if(v)u.voice=v;u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))note('Английская озвучка сейчас недоступна в браузере.')};speechSynthesis.speak(u)}
const btn=(action,label,cls='quietbtn',val='')=>'<button class="'+cls+'" data-act="'+action+'" data-val="'+val+'">'+label+'</button>';
function iconBtn(action,id,label,symbol,active=false){return '<button class="iconbtn '+(active?'saved':'')+'" data-act="'+action+'" data-val="'+id+'" aria-label="'+label+'" title="'+label+'" '+(action==='save'?'aria-pressed="'+active+'"':'')+'>'+icon(symbol)+'</button>'}
const tabs=()=>'<div class="levels" aria-label="Уровень английского">'+levels.map(l=>'<button data-act="level" data-val="'+l+'" aria-pressed="'+(!state.review&&state.level===l)+'" class="'+(!state.review&&state.level===l?'sel':'')+'">'+l+'</button>').join('')+'</div>';
const head=(title,extra='')=>'<div class="rowhead"><h2>'+title+'</h2>'+extra+'</div>';
const bar=n=>'<div class="meter"><b style="width:'+Math.min(100,n)+'%"></b></div>';
function rail(){const n=state.days[day()]||0;return '<aside class="rail"><section class="panel sidebox"><h3 class="sidehead"><span class="tile">'+icon('goal')+'</span>Цель на день</h3><div class="spread"><div class="goalnum">'+n+' <small>/ 10</small></div><span class="meta">ответов сегодня</span></div>'+bar(n*10)+'<p class="desc">'+(n>=10?'Дневная цель выполнена.':n?'До цели осталось '+(10-n)+'.':'Начни с десяти карточек в день.')+'</p></section><section class="panel sidebox tint"><h3 class="sidehead"><span class="tile">'+icon('book')+'</span>Мой словарь</h3><p class="desc">'+(state.saved.length?'Сохранено слов и выражений: '+state.saved.length+'.':'Сохраняй слова из карточек, чтобы повторить их позже.')+'</p>'+btn('dictionary','Открыть словарь')+'</section></aside>'}
function training(){const s=session(),id=s.ids[s.pos],w=bank.get(id);let card;if(!w){const good=s.ids.filter(i=>s.answers[i]===0).length;card='<section class="panel finish"><span class="tile">'+icon('check')+'</span><h3>Подборка пройдена</h3><p>Верных ответов — '+good+' из '+s.ids.length+'.</p>'+(good<s.ids.length?btn('mistakes',icon('repeat')+' Повторить ошибки'):'')+btn('new','Новая подборка','primary')+'</section>'}else{const val=s.answers[id],answered=val!==undefined,book=state.saved.includes(id);card='<section class="panel exercise"><div class="cardtop"><span class="counter"><strong>'+w.level+'</strong> Карточка '+(s.pos+1)+' / '+s.ids.length+'</span><div class="tools">'+iconBtn('sound',id,'Прослушать фразу','volume')+iconBtn('save',id,book?'Убрать из словаря':'Сохранить в словарь','save',book)+'</div></div><div class="prompt"><span class="quote" aria-hidden="true">“</span><p class="phrase" lang="en">'+marked(w.sentence)+'</p><div class="glossnote" role="status" lang="ru">Нажми на другое слово, чтобы увидеть перевод.</div></div><h3 class="ask">Как переводится выделенное слово'+(w.word.includes(' ')?'сочетание':'')+'?</h3><div class="choices">'+s.layouts[id].map((a,i)=>'<button '+(answered?'disabled':'')+' class="choice '+(answered?(a===0?'ok':a===val?'bad':''):'')+'" data-act="answer" data-val="'+a+'"><span class="key">'+(i+1)+'</span>'+w.options[a]+(answered&&a===0?icon('check'):answered&&a===val?icon('cross'):'')+'</button>').join('')+'</div>'+(answered?'<div class="feedback" role="status"><b>'+(val===0?'Верно!':val===-1?'Карточка пропущена.':'Верный перевод — '+w.right+'.')+'</b><span>'+w.translation+'</span>'+(w.hint?'<small>'+w.hint+'</small>':'')+'</div>':'')+(w.hint&&hint&&!answered?'<p class="hint">'+w.hint+'</p>':'')+'<div class="actions">'+(answered?'<span class="meta">'+w.word+' · '+w.right+'</span>'+btn('next',s.pos+1===s.ids.length?'Итоги':'Дальше','primary'):(w.hint?btn('hint',icon('bulb')+(hint?'Скрыть подсказку':'Подсказка'),'textbtn'):'<span></span>')+btn('skip','Пропустить '+icon('skip'),'textbtn'))+'</div></section>'}return head(state.review?'Повторение':'Тренировка',tabs())+'<div class="grid">'+card+rail()+'</div>'}
function entries(){const items=state.saved.map(id=>bank.get(id)).filter(Boolean).filter(w=>(w.word+' '+w.right).toLowerCase().includes(q.toLowerCase().trim()));return items.length?items.map(w=>'<article class="panel entry"><div><small>'+w.level+'</small><div><b lang="en">'+w.word+'</b> · '+w.right+'</div><p lang="en">'+cleared(w.sentence)+'</p><p>'+w.translation+'</p></div><div class="tools">'+iconBtn('sound',w.id,'Прослушать фразу','volume')+iconBtn('save',w.id,'Убрать из словаря','save',true)+'</div></article>').join(''):'<p class="panel empty">По этому запросу слов пока нет.</p>'}
function dictionary(){return head('Мой словарь',state.saved.length?btn('reviewSaved','Повторить слова','primary'):'')+(state.saved.length?'<input id="search" class="search" aria-label="Поиск по словарю" placeholder="Найти слово или перевод"><div class="list" id="entries">'+entries()+'</div>':'<div class="panel empty"><span class="tile">'+icon('book')+'</span><h3>Здесь будут твои слова</h3><p>Нажми на закладку в карточке, чтобы сохранить слово вместе с примером.</p>'+btn('practice','К тренировке','primary')+'</div>')}
function statistics(){const data=Object.values(state.records),n=data.reduce((a,r)=>a+r.n,0),ok=data.reduce((a,r)=>a+r.ok,0);return head('Твой прогресс')+'<div class="statsgrid">'+[['Ответов',n],['Точность',n?Math.round(100*ok/n)+'%':'—'],['Дней практики',Object.keys(state.days).length]].map(([label,val])=>'<div class="panel sidebox"><span class="meta">'+label+'</span><strong>'+val+'</strong></div>').join('')+'</div><div class="panel sidebox statslevels"><h3>Практика по уровням</h3><p class="desc">Сколько разных карточек ты уже разобрал.</p>'+levels.map(l=>{const pool=words.filter(w=>w.level===l),seen=pool.filter(w=>state.records[w.id]).length;return '<div class="levelstat"><b>'+l+'</b>'+bar(100*seen/pool.length)+'<span>'+seen+' / '+pool.length+'</span></div>'}).join('')+'</div>'}
function render(){const p=page();document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===p);if(a.dataset.nav===p)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});view.innerHTML=p==='practice'?training():p==='stats'?statistics():dictionary();if(document.getElementById('search'))document.getElementById('search').value=q}
function answer(n){const s=session(),id=s.ids[s.pos];if(!id||s.answers[id]!==undefined)return;s.answers[id]=n;if(n!==-1){const r=state.records[id]||(state.records[id]={n:0,ok:0});r.n++;if(n===0)r.ok++;state.days[day()]=(state.days[day()]||0)+1}hint=false;writeState();render()}
function action(a,val){if(a==='sound'){speak(val);return}if(a==='answer'||a==='skip'){answer(a==='skip'?-1:Number(val));return}
if(a==='level'){state.review=null;state.level=val;hint=false}
if(a==='save'){const i=state.saved.indexOf(val);if(i<0)state.saved.unshift(val);else state.saved.splice(i,1);note(i<0?'Слово сохранено':'Слово убрано из словаря')}
if(a==='hint')hint=!hint;
if(a==='dictionary'||a==='practice'){location.hash=a;return}
if(a==='next'){const s=session();if(s.answers[s.ids[s.pos]]===undefined)return;s.pos++;hint=false}
if(a==='new'){state.review=null;state.sessions[state.level]=newLevel(state.level);hint=false}
if(a==='reviewSaved'){if(!state.saved.length)return;state.review=build(shuffle(state.saved).slice(0,10));hint=false;location.hash='practice'}
if(a==='mistakes'){const s=session();state.review=build(shuffle(s.ids.filter(id=>s.answers[id]!==0)));hint=false}
writeState();render()}
view.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b&&!b.disabled)action(b.dataset.act,b.dataset.val)});
view.addEventListener('input',e=>{if(e.target.id==='search'){q=e.target.value;document.getElementById('entries').innerHTML=entries()}});
window.addEventListener('hashchange',()=>{q='';hint=false;render()});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||page()!=='practice'||e.target.matches('input,textarea'))return;const s=session(),id=s.ids[s.pos];if(!id)return;if(/^[1-4]$/.test(e.key)){e.preventDefault();answer(s.layouts[id][Number(e.key)-1])}else if(e.key==='Enter'&&s.answers[id]!==undefined&&!e.target.closest('button,a')){e.preventDefault();action('next')}});
render();

function closeGloss(){const b=view.querySelector('.lookup.chosen');if(b){b.classList.remove('chosen');view.querySelector('.glossnote').textContent='Нажми на другое слово, чтобы увидеть перевод.'}}
document.addEventListener('click',e=>{const b=e.target.closest('.lookup');const was=b?.classList.contains('chosen');closeGloss();if(!b||was)return;const s=session(),w=bank.get(s.ids[s.pos]);b.classList.add('chosen');view.querySelector('.glossnote').textContent=glosses[w.sentence][Number(b.dataset.gloss)]});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGloss()});

