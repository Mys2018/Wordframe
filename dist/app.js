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
const topicsById=new Map(grammarTopics.map(topic=>[topic.id,topic]));
const topicsByGroup=new Map();
for(const topic of grammarTopics){
  if(!topicsByGroup.has(topic.group))topicsByGroup.set(topic.group,[]);
  topicsByGroup.get(topic.group).push(topic);
}
const gapBank=new Map(grammarTopics.flatMap(topic=>topic.exercises.map(exercise=>[exercise.id,{...exercise,topic}])));
const modeLabels=new Map([['en-ru','EN → RU'],['ru-en','RU → EN'],['gap','Пропуски']]);
const mixedTopics='all-topics';
const gameCollection='Casualties Unknown', allLevels='all-levels', allParts='all';
const levels=Object.keys(source), key='wf-english-v1';
const levelLabels=new Map([[allLevels,'Все уровни'],...levels.map(level=>[level,level]),[gameCollection,gameCollection]]);
const partLabels=new Map([
  [allParts,'Все части речи'],['phrasal','Фразовые глаголы'],['verb','Глаголы'],['noun','Существительные'],
  ['adj','Прилагательные'],['adv','Наречия'],['prep','Предлоги'],['conj','Союзы'],['det','Определители']
]);
let state;try{state=JSON.parse(localStorage.getItem(key))}catch{}
state=Object.assign({level:'A2',part:allParts,mode:'en-ru',gapTopic:mixedTopics,saved:[],sessions:{},records:{},days:{},review:null,
  aiCards:[],aiDeckIds:[],activeAiDeck:false},state||{});
for(const card of state.aiCards)bank.set(card.id,card);
if(!levelLabels.has(state.level))state.level='A2';
if(!partLabels.has(state.part))state.part=allParts;
if(!modeLabels.has(state.mode))state.mode='en-ru';
if(!topicsById.has(state.gapTopic))state.gapTopic=mixedTopics;
const writeState=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
const shuffle=items=>{const arr=[...items];for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr};
function build(ids){
  if(state.mode==='gap')return {ids,pos:0,answers:{},responses:{}};
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
function workoutKey(){
  if(state.mode==='gap')return (state.activeAiDeck?'ai-gap:':'gap:')+state.gapTopic;
  if(state.activeAiDeck)return 'ai-deck:'+state.mode;
  const selection=state.part===allParts?state.level:state.level+':'+state.part;
  return state.mode==='en-ru'?selection:'ru-en:'+selection;
}
function newWorkout(){
  const items=state.mode==='gap'
    ? topicsById.get(state.gapTopic)?.exercises??[...gapBank.values()]
    : cardsAtLevel(state.level).filter(w=>state.part===allParts||(state.part==='phrasal'?w.phrasal:w.part===state.part));
  const pool=shuffle(items)
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
    const matches=state.aiDeckFilter?.level===state.level&&state.aiDeckFilter?.part===state.part;
    state.sessions[id]=id.startsWith('ai-deck:')?build(matches||!state.aiDeckFilter?state.aiDeckIds:[])
      :id.startsWith('ai-gap:')?build([]):newWorkout();
    writeState();
  }
  return state.sessions[id];
}
const cleared=s=>s.replace(/[\[\]]/g,'');
const contextLabel=index=>index===0?'Игровая ситуация':'Простой пример';
const contextIndex=(w,s)=>s.contexts?.[w.id]??0;
const currentContext=(w,s)=>contextIndex(w,s)==='ai'&&s.aiContexts?.[w.id]
  ? s.aiContexts[w.id] : w.contexts?.[contextIndex(w,s)]??w.contexts?.[0]??w;
function currentGap(s){
  const id=s.ids[s.pos];
  const generated=s.aiGaps?.[id];
  return generated?{...generated,id,topic:topicsById.get(generated.topicId)}:gapBank.get(id);
}
function marked(s,answered){
  let i=0;
  return s.replace(/\[([^\]]+)\]|[\p{L}]+(?:'[\p{L}]+)*/gu,(token,target)=>{
    if(target)return '<mark>'+(answered?'<button type="button" class="lookup" data-gloss="target" aria-pressed="false">'+target+'</button>':target)+'</mark>';
    const index=i++;
    return '<button type="button" class="lookup" data-gloss="'+index+'" aria-pressed="false">'+token+'</button>';
  });
}
const day=()=>{const d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')};
const route=()=>location.hash.slice(1).split('/');
function page(){
  const [section]=route();
  if(section==='settings'&&aiLocal)return section;
  return ['stats','dictionary','grammar'].includes(section)?section:'practice';
}
const view=document.getElementById('view');
const aiLocal=Boolean(document.querySelector('meta[name="wordframe-local-settings"]'));
const aiCountCapable=Boolean(document.querySelector('meta[name="wordframe-ai-count"]'));
let aiCount=6;
const aiBatchCapable=Boolean(document.querySelector('meta[name="wordframe-ai-batch"]'));
let aiEnabled=Boolean(document.querySelector('meta[name="wordframe-ai"]'));
let aiSettings, settingsLoading=false, settingsBusy=false, settingsMessage='';
const modelTests=new Map();
if(aiLocal)document.querySelector('.lang').outerHTML='<a class="lang quietbtn settings-link" data-nav="settings" href="#settings">Настройки</a>';
const aiExamples=new Map();
let aiPending=false;
let aiAuto=false;
let aiAttempts=new WeakMap();
const phoneLayout=window.matchMedia('(max-width:680px)');
const glossBubble=document.createElement('div');
glossBubble.id='word-translation';
glossBubble.className='gloss-bubble';
glossBubble.setAttribute('role','tooltip');
glossBubble.setAttribute('lang','ru');
glossBubble.hidden=true;
document.body.append(glossBubble);
let hint=false,q='',timer,activeGloss,filtersOpen=false;
function note(msg){const e=document.getElementById('notice');e.textContent=msg;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2800)}
function speak(context){if(!('speechSynthesis'in window)){note('Этот браузер не поддерживает озвучку.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(cleared(context.sentence));u.lang='en-US';u.rate=.9;const v=speechSynthesis.getVoices().find(v=>/^en[-_]/i.test(v.lang));if(v)u.voice=v;u.onerror=e=>{if(!['canceled','interrupted'].includes(e.error))note('Английская озвучка сейчас недоступна в браузере.')};speechSynthesis.speak(u)}
const btn=(action,label,cls='quietbtn',val='')=>'<button class="'+cls+'" data-act="'+action+'" data-val="'+val+'">'+label+'</button>';
function iconBtn(action,id,label,symbol,active=false){return '<button class="iconbtn '+(active?'saved':'')+'" data-act="'+action+'" data-val="'+id+'" aria-label="'+label+'" title="'+label+'" '+(action==='save'?'aria-pressed="'+active+'"':'')+'>'+icon(symbol)+'</button>'}
function selectionButtons(labels,action,active,className=''){
  return [...labels].map(([value,label])=>'<button type="button" class="'+className+'" data-act="'+action+'" data-val="'+value
    +'" aria-pressed="'+(value===active)+'">'+label+'</button>').join('');
}
function dailyGoal(){
  const count=state.days[day()]||0;
  return '<div class="daily-goal" aria-label="Ответов сегодня: '+count+' из 10"><span>Сегодня</span><strong>'+count+' / 10</strong>'
    +bar(count*10)+'</div>';
}
function practiceControls(){
  const levelsAvailable=state.activeAiDeck?new Map(levels.map(level=>[level,level])):levelLabels;
  const selectedLevel=levelsAvailable.has(state.level)?state.level:'B1';
  const options=(labels,value)=>[...labels].map(([id,label])=>'<option value="'+id+'"'
    +(id===value?' selected':'')+'>'+label+'</option>').join('');
  return '<div id="practice-controls" class="practice-controls"><label class="filter-select">Уровень'
    +'<select id="practice-level">'+options(levelsAvailable,selectedLevel)+'</select></label>'
    +'<label class="filter-select">Часть речи<select id="practice-part">'+options(partLabels,state.part)+'</select></label>'
    +(state.activeAiDeck&&!state.review&&aiCountCapable?'<label class="filter-select count-select">Карточек<input id="ai-count" type="number" min="1" max="20" step="1" list="ai-count-options" value="'+aiCount+'"><datalist id="ai-count-options"><option value="6"><option value="10"><option value="15"><option value="20"></datalist></label>':'')+dailyGoal()+'</div>';
}
const head=(title,extra='')=>'<div class="rowhead"><h2>'+title+'</h2>'+extra+'</div>';
const bar=n=>'<div class="meter"><b style="width:'+Math.min(100,n)+'%"></b></div>';
const escapeText=value=>String(value).replace(/[&<>]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));
function settingsPage(){
  if(!aiSettings)return head('Настройки')+'<div class="panel sidebox">'+escapeText(settingsMessage||'Загрузка…')
    +(settingsMessage?' '+btn('settings-retry','Повторить'):'')+'</div>';
  const status=aiSettings.configured?'Ключ сохранён для текущего запуска.':'Ключ пока не добавлен.';
  const options=aiSettings.models.map(model=>'<option value="'+model.id+'"'+(model.id===aiSettings.model?' selected':'')+'>'
    +escapeText(model.label)+'</option>').join('');
  const results=[...modelTests.values()].map(result=>'<li><b>'+escapeText(result.label)+'</b><span>'
    +escapeText(result.status)+'</span>'+(result.sample?'<span lang="en">'+escapeText(result.sample)+'</span>':'')+'</li>').join('');
  return head('Настройки')+'<section class="panel sidebox ai-settings"><h3>Генерация через PlusVibe</h3>'
    +'<p>'+status+' Ключ хранится в памяти локального сервера до его остановки.</p>'
    +'<form id="ai-settings-form"><fieldset'+(settingsBusy?' disabled':'')+'>'
    +'<label>Ключ PlusVibe<input name="apiKey" class="answer-input" type="password" maxlength="246" placeholder="sk-pv-…"'
    +' autocomplete="off" autocapitalize="off" spellcheck="false"></label>'
    +'<label>Модель<select name="model" class="answer-input">'+options+'</select></label>'
    +'<div class="settings-actions"><button class="primary" type="submit">Сохранить</button>'
    +'<button class="quietbtn" type="submit" name="test" value="both">Сохранить и проверить модели</button></div>'
    +'<p class="desc">Проверка отправляет по одному запросу к каждой модели. Claude Haiku и GPT-6.1 Terra платные.</p>'
    +'</fieldset></form><p role="status">'+escapeText(settingsMessage)+'</p>'
    +(results?'<ul class="settings-results" aria-live="polite">'+results+'</ul>':'')+'</section>';
}
async function settingsRequest(path,body){
  const res=await fetch(path,body===undefined?undefined:{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)
  });
  const data=await res.json();
  if(!res.ok)throw Error(data.error??'Запрос не удался.');
  return data;
}
function refreshSettings(){
  if(page()==='settings')render();
}
async function loadSettings(){
  if(settingsLoading)return;
  settingsLoading=true;
  settingsMessage='';
  try{
    aiSettings=await settingsRequest('/api/settings');
    aiEnabled=aiSettings.configured;
  }catch{
    settingsMessage='Не удалось загрузить настройки.';
  }finally{
    settingsLoading=false;
    refreshSettings();
  }
}
async function saveAiSettings(form,testBoth){
  if(settingsBusy)return;
  const fields=new FormData(form);
  const key=fields.get('apiKey').trim();
  settingsBusy=true;
  settingsMessage='';
  form.querySelector('fieldset').disabled=true;
  try{
    aiSettings=await settingsRequest('/api/settings',{model:fields.get('model'),...(key?{apiKey:key}:{})});
    form.elements.apiKey.value='';
    aiEnabled=aiSettings.configured;
    settingsMessage='Настройки сохранены.';
    modelTests.clear();
    if(testBoth){
      if(!aiEnabled){
        settingsMessage='Добавь ключ, чтобы проверить модели.';
        return;
      }
      for(const model of aiSettings.models){
        const result={label:model.label,status:'Проверяю…'};
        modelTests.set(model.id,result);
        refreshSettings();
        try{
          const data=await settingsRequest('/api/settings/test',{model:model.id});
          result.status='Получено упражнение.';
          result.sample=data.sentence.replace('___',()=>data.answers[0]);
        }catch(error){
          result.status=error.message;
        }
      }
    }
  }catch(error){
    settingsMessage=error.message;
    if(form.isConnected){
      form.querySelector('fieldset').disabled=false;
      view.querySelector('.ai-settings [role="status"]').textContent=settingsMessage;
      return;
    }
  }finally{
    settingsBusy=false;
    if(!form.isConnected||form.querySelector('fieldset').disabled)refreshSettings();
  }
}
const aiButton=(kind,label)=>aiEnabled?'<button type="button" class="quietbtn" data-act="ai" data-val="'+kind+'"'
  +(aiPending?' disabled aria-busy="true"':'')+' data-label="'+label+'">'+(aiPending?'Генерация…':label)+'</button>':'';
function topicOptions(active){
  return [...topicsByGroup].map(([group,topics])=>'<optgroup label="'+group+'">'+topics.map(topic=>
    '<option value="'+topic.id+'"'+(topic.id===active?' selected':'')+'>'+topic.title+'</option>'
  ).join('')+'</optgroup>').join('');
}
function grammar(){
  const active=topicsById.get(route()[1])??grammarTopics[0];
  const visual=grammarVisuals[active.id];
  const index=[...topicsByGroup].map(([group,topics])=>'<div class="grammar-group"><h3>'+group+'</h3>'+topics.map(topic=>
    '<a class="grammar-topic" href="#grammar/'+topic.id+'"'+(active===topic?' aria-current="true"':'')+'>'+topic.title+'</a>'
  ).join('')+'</div>').join('');
  const examples=[...active.examples,...(aiExamples.get(active.id)??[])].map(([english,russian],index)=>{
    const target=visual?.example[index];
    const start=target?english.toLowerCase().indexOf(target.toLowerCase()):-1;
    const text=start<0?escapeText(english):escapeText(english.slice(0,start))
      +'<mark>'+escapeText(english.slice(start,start+target.length))+'</mark>'+escapeText(english.slice(start+target.length));
    return '<li><span lang="en">'+text+'</span><span class="grammar-example-translation">'+escapeText(russian)+'</span></li>';
  }).join('');
  const formula=visual?'<section class="grammar-visual-formula" aria-label="Схема построения"><h4>Как построить</h4>'
    +'<div class="grammar-formula">'+visual.formula.map(part=>'<span>'+escapeText(part)+'</span>').join('')+'</div></section>':'';
  const timeline=visual?.timeline;
  const line=timeline?'<section class="grammar-visual-timeline"><h4>На линии времени</h4><p>'+escapeText(timeline.description)
    +'</p><div class="grammar-timeline" aria-hidden="true"><div class="grammar-timeline-track"></div>'
    +timeline.bars.map(([start,end])=>'<span class="grammar-timeline-range" style="left:'+start+'%;width:'+(end-start)+'%"></span>').join('')
    +timeline.dots.map(point=>'<span class="grammar-timeline-point" style="left:'+point+'%"></span>').join('')
    +'<span class="grammar-timeline-now" style="left:'+timeline.reference+'%"></span></div>'
    +'<div class="grammar-timeline-labels" aria-hidden="true"><span>Прошлое</span><span>Сейчас</span><span>Будущее</span></div></section>':'';
  const relation=visual?.relationship?'<section class="grammar-visual-relation"><h4>Как связаны части</h4><p>'
    +escapeText(visual.description)+'</p><div class="grammar-relation">'+visual.relationship.map(part=>'<span>'+escapeText(part)+'</span>')
      .join('<span aria-hidden="true" class="grammar-relation-arrow">→</span>')+'</div></section>':'';
  return head('Грамматика')+'<div class="grammar-layout"><aside class="panel grammar-index" aria-label="Темы грамматики">'+index
    +'</aside><div class="grammar-area"><label class="grammar-topic-select">Тема<select id="grammar-page-topic">'+topicOptions(active.id)
    +'</select></label><article class="panel grammar-content"><div class="grammar-visual-heading"><span class="grammar-visual-level">'+active.level
    +'</span><h3>'+active.title+'</h3></div><p class="grammar-rule">'+escapeText(active.rule)+'</p>'
    +line+relation+formula+'<section class="grammar-visual-examples"><h4>Примеры</h4><ul class="grammar-examples">'+examples+'</ul></section>'
    +btn('practice-topic','Упражнения по теме','primary grammar-practice',active.id)
    +aiButton('examples','Ещё примеры · ИИ')+'</article></div></div>';
}
function contextControls(w,s){
  if(w.reverseOptions)return '';
  if(!w.contexts&&!s.aiContexts?.[w.id])return '';
  const contexts=w.contexts?w.contexts.map((_,index)=>[index,contextLabel(index)]):[[0,'Исходный пример']];
  if(s.aiContexts?.[w.id])contexts.push(['ai','Пример от ИИ']);
  const buttons=w.contexts||s.aiContexts?.[w.id]?contexts.map(([index,label])=>{
    const active=contextIndex(w,s)===index;
    return '<button class="quietbtn" data-act="context" data-val="'+index+'" aria-pressed="'+active+'">'+label+'</button>';
  }).join(''):'';
  return '<div class="contexts" role="group" aria-label="Контекст фразы">'+buttons+'</div>';
}
function entryContexts(w){
  return (w.contexts??[w]).map((context,index)=>'<div class="entry-context">'
    +(w.contexts?'<small>'+contextLabel(index)+'</small>':'')+'<p lang="en">'+cleared(context.sentence)
    +'</p><p>'+context.translation+'</p></div>').join('');
}
function choiceTranslation(w,option,index,reverse){
  if(index===0)return reverse?w.right:w.word;
  const stored=reverse?w.reverseTranslations:w.optionTranslations;
  if(stored?.[index])return stored[index];
  const authored=w.id==='A1-4'?null:reverseChoices.authoredDistractors[w.id];
  if(authored){
    if(reverse){
      const match=authored.findIndex(value=>value.toLowerCase()===option.toLowerCase());
      if(match>=0)return w.options[match+1];
    }else{
      const match=w.options.findIndex(value=>value.toLowerCase()===option.toLowerCase());
      if(match>0)return authored[match-1];
    }
  }
  const match=words.find(card=>reverse?card.word.toLowerCase()===option.toLowerCase():card.right.toLowerCase()===option.toLowerCase());
  return match?(reverse?match.right:match.word):null;
}
function trainingCard(s,w){
  const id=w.id, val=s.answers[id], answered=val!==undefined;
  const saved=state.saved.includes(id), context=currentContext(w,s);
  const reverse=state.mode==='ru-en';
  const options=reverse?(w.reverseOptions??reverseChoices(id)):w.options;
  const correct=options[0];
  const hasHint=!reverse&&contextIndex(w,s)!=='ai'&&w.hint;
  const choices=s.layouts[id].map((option,i)=>{
    const result=answered?(option===0?'ok':option===val?'bad':''):'';
    const resultIcon=result==='ok'?icon('check'):result==='bad'?icon('cross'):'';
    const translation=answered?choiceTranslation(w,options[option],option,reverse):null;
    return '<button type="button" '+(answered?'disabled ':'')+(reverse?'lang="en" ':'')+'class="choice '+result
      +'" data-act="answer" data-val="'+option+'"><span class="key">'+(i+1)+'</span><span class="choice-text">'
      +escapeText(options[option])+(answered?'<small lang="'+(reverse?'ru':'en')+'">'
        +escapeText(translation??'Перевод пока не добавлен')+'</small>':'')+'</span>'+resultIcon+'</button>';
  }).join('');
  const feedback=answered?'<div class="feedback" role="status"><b>'
    +(val===0?'Верно!':val===-1?'Карточка пропущена.':'Верный перевод — '+(reverse?'<span lang="en">'+correct+'</span>':correct)+'.')
    +'</b>'+(reverse?'<p lang="en">'+marked(context.sentence,true)+'</p>':'<span>'+escapeText(context.translation)+'</span>')
    +(hasHint?'<small>'+w.hint+'</small>':'')+'</div>':'';
  const actions=answered?'<span class="meta">'+w.word+' · '+w.right+'</span>'+btn('next',s.pos+1===s.ids.length?'Итоги':'Дальше','primary')
    :(hasHint?btn('hint',icon('bulb')+(hint?'Скрыть подсказку':'Подсказка'),'textbtn'):'<span></span>')
      +btn('skip','Пропустить '+icon('skip'),'textbtn');
  const prompt=reverse?'<b class="reverse-meaning">'+w.right+'</b><p>'+escapeText(context.translation)+'</p>'
    :'<span class="quote" aria-hidden="true">“</span><p class="phrase" lang="en">'+marked(context.sentence,answered)+'</p>';
  const question=reverse?'Выбери перевод на английский.':'Как переводится выделенное слово'+(w.word.includes(' ')?'сочетание':'')+'?';
  return '<section class="panel exercise"><div class="cardtop"><span class="counter"><strong>'+w.level+'</strong> Карточка '
    +(s.pos+1)+' / '+s.ids.length+(w.reverseOptions?' · ИИ':'')+'</span><div class="tools">'+(!reverse||answered?iconBtn('sound',id,'Прослушать фразу','volume'):'')
    +iconBtn('save',id,saved?'Убрать из словаря':'Сохранить в словарь','save',saved)+'</div></div>'+contextControls(w,s)
    +'<div class="prompt">'+prompt+'</div><h3 class="ask">'+question+'</h3><div class="choices">'+choices+'</div>'+feedback
    +(hasHint&&hint&&!answered?'<p class="hint">'+w.hint+'</p>':'')
    +'<div class="actions">'+actions+'</div></section>';
}
function gapCard(s,exercise){
  const {id,topic,sentence,cue,answers,explanation}=exercise;
  const val=s.answers[id], answered=val!==undefined;
  const blank=answered?'<mark>'+escapeText(answers[0])+'</mark>':'<span class="gap-blank" role="img" aria-label="пропуск"></span>';
  const phrase=sentence.split('___').map(escapeText).join(blank);
  const entered=s.responses[id];
  const acceptedAlternative=val===0&&answers.slice(1).find(form=>normalizeAnswer(form)===normalizeAnswer(entered));
  const response=answered?'<div class="feedback" role="status"><b>'
    +(val===0?'Верно!':val===-1?'Карточка пропущена.':'Верная форма — <span lang="en">'+escapeText(answers[0])+'</span>.')+'</b>'
    +(val===1?'<span>Твой ответ — <span lang="en">'+escapeText(entered)+'</span></span>':'')
    +(acceptedAlternative?'<span>Твой вариант тоже подходит: <span lang="en">'+escapeText(acceptedAlternative)+'</span></span>':'')
    +'<span>'+escapeText(explanation)+'</span></div>'
    :'<form class="answer-form" id="gap-answer-form"><input class="answer-input" name="answer" type="text" lang="en"'
    +' aria-label="Ответ на английском" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="120" required>'
    +'<button type="submit" class="primary">Проверить</button></form>';
  const next=answered?btn('next',s.pos+1===s.ids.length?'Итоги':'Дальше','primary'):btn('skip','Пропустить '+icon('skip'),'textbtn');
  const actions=(state.activeAiDeck?aiButton('gap','Новый пропуск · ИИ'):'')||'<span></span>';
  return '<section class="panel exercise"><div class="cardtop"><span class="counter"><strong>'+topic.level
    +'</strong> Карточка '+(s.pos+1)+' / '+s.ids.length+'</span><span class="meta">'+topic.title+(exercise.topicId?' · ИИ':'')+'</span></div>'
    +'<div class="prompt"><p class="phrase" lang="en">'+phrase+'</p></div>'
    +'<h3 class="ask">Заполни пропуск <span class="gap-cue" lang="en">'+escapeText(cue)+'</span></h3>'
    +response+'<div class="actions">'+actions+next+'</div></section>';
}
function training(s){
  const gap=state.mode==='gap';
  const batch=!gap&&state.activeAiDeck&&!state.review;
  const generated=state.activeAiDeck&&!state.review;
  const item=gap?currentGap(s):bank.get(s.ids[s.pos]);
  let card;
  if(item){
    card=gap?gapCard(s,item):trainingCard(s,item);
  }else if(!s.ids.length){
    card=generated?'<section class="panel finish"><h3>Создай новую подборку</h3><p>'
      +(gap?'Выбери тему, затем создай задание.':'Выбери уровень и часть речи, затем создай новые карточки.')+'</p>'
      +aiButton(gap?'gap':'deck',gap?'Создать задание · ИИ':'Создать подборку · ИИ')+'</section>'
      :'<section class="panel finish"><h3>В этой подборке пока нет карточек</h3>'
      +btn('level','Все уровни','primary',allLevels)+btn('part','Все части речи','quietbtn',allParts)+'</section>';
  }else{
    const good=s.ids.filter(id=>s.answers[id]===0).length;
    card='<section class="panel finish"><span class="tile">'+icon('check')+'</span><h3>Подборка пройдена</h3>'
      +'<p>Верных ответов — '+good+' из '+s.ids.length+'.</p>'+(good<s.ids.length?btn('mistakes',icon('repeat')+' Повторить ошибки'):'')
      +(generated?aiButton(gap?'gap':'deck',gap?'Новое задание · ИИ':'Новая подборка · ИИ'):btn('new','Новая подборка','primary'))+'</section>';
  }
  const sourceControls=aiBatchCapable?'<div class="source-switch" role="group" aria-label="Источник заданий">'
    +selectionButtons(new Map([['prepared','Готовые'],['generated','С ИИ']]),'source',state.activeAiDeck?'generated':'prepared','quietbtn')+'</div>'
    :aiLocal?'<p class="ai-upgrade-note">Подборки с ИИ доступны в <a href="http://127.0.0.1:8082/#practice">обновлённой версии Wordframe</a>.</p>':'';
  const modes='<div class="mode-controls" role="group" aria-label="Режим тренировки">'
    +selectionButtons(modeLabels,'mode',state.mode,'quietbtn')+'</div>';
  const controls=gap?'<div class="practice-controls"><label class="filter-select">Тема<select id="gap-topic"><option value="'+mixedTopics+'">Все темы</option>'
    +topicOptions(state.gapTopic)+'</select></label>'+dailyGoal()+'</div>':practiceControls();
  return head(state.review?'Повторение':batch?'Подборка от ИИ':'Тренировка')+sourceControls+modes+controls+'<div class="grid">'+card+'</div>';
}
function entries(){const items=state.saved.map(id=>bank.get(id)).filter(Boolean).filter(w=>(w.word+' '+w.right).toLowerCase().includes(q.toLowerCase().trim()));return items.length?items.map(w=>'<article class="panel entry"><div><small>'+w.level+'</small><div><b lang="en">'+w.word+'</b> · '+w.right+'</div>'+entryContexts(w)+'</div><div class="tools">'+iconBtn('sound',w.id,'Прослушать фразу','volume')+iconBtn('save',w.id,'Убрать из словаря','save',true)+'</div></article>').join(''):'<p class="panel empty">По этому запросу слов пока нет.</p>'}
function dictionary(){return head('Мой словарь',state.saved.length?btn('reviewSaved','Повторить слова','primary'):'')+(state.saved.length?'<input id="search" class="search" aria-label="Поиск по словарю" placeholder="Найти слово или перевод"><div class="list" id="entries">'+entries()+'</div>':'<div class="panel empty"><span class="tile">'+icon('book')+'</span><h3>Здесь будут твои слова</h3><p>Нажми на закладку в карточке, чтобы сохранить слово вместе с примером.</p>'+btn('practice','К тренировке','primary')+'</div>')}
function statistics(){
  const records=Object.values(state.records);
  const count=records.reduce((total,record)=>total+record.n,0);
  const correct=records.reduce((total,record)=>total+record.ok,0);
  const summary=[['Ответов',count],['Точность',count?Math.round(100*correct/count)+'%':'—'],['Дней практики',Object.keys(state.days).length]];
  const sections=[...levels,gameCollection].map(level=>[level,cardsAtLevel(level).map(card=>card.id)]);
  if(state.aiCards.length)sections.push(['Слова от ИИ',state.aiCards.map(card=>card.id)]);
  sections.push(['Пропуски',[...gapBank.keys()]]);
  const totals=sections.map(([label,ids])=>{
    const seen=ids.filter(id=>state.records[id]).length;
    return '<div class="levelstat'+(levels.includes(label)?'':' game-stat')+'"><b>'+label+'</b>'
      +bar(100*seen/ids.length)+'<span>'+seen+' / '+ids.length+'</span></div>';
  }).join('');
  return head('Твой прогресс')+'<div class="statsgrid">'+summary.map(([label,value])=>
    '<div class="panel sidebox"><span class="meta">'+label+'</span><strong>'+value+'</strong></div>'
  ).join('')+'</div><div class="panel sidebox statslevels"><h3>Практика по разделам</h3>'
    +'<p class="desc">Сколько разных карточек ты уже разобрал.</p>'+totals+'</div>';
}
let lastTraining;
function render(){
  closeGloss();
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
    maybeGenerate();
    return;
  }
  filtersOpen=false;
  lastTraining=undefined;
  if(p==='settings'){
    view.innerHTML=settingsPage();
    if(!aiSettings&&!settingsLoading&&!settingsMessage)void loadSettings();
    return;
  }
  view.innerHTML=p==='grammar'?grammar():p==='stats'?statistics():dictionary();
  const search=document.getElementById('search');
  if(search)search.value=q;
}
function answer(n,response){
  const s=session(),id=s.ids[s.pos];
  if(!id||s.answers[id]!==undefined)return;
  s.answers[id]=n;
  if(response!==undefined)s.responses[id]=response;
  if(n!==-1){
    const r=state.records[id]||(state.records[id]={n:0,ok:0});
    r.n++;
    if(n===0)r.ok++;
    state.days[day()]=(state.days[day()]||0)+1;
  }
  hint=false;
  filtersOpen=false;
  writeState();
  render();
  if(phoneLayout.matches)view.querySelector('[data-act="next"]')?.scrollIntoView({block:'nearest'});
}
function maybeGenerate(){
  if(!aiAuto||!aiEnabled||aiPending||page()!=='practice'||state.review)return;
  if(aiBatchCapable&&state.mode!=='gap')return;
  const s=session(), id=s.ids[s.pos];
  if(!id||s.answers[id]!==undefined||s.aiContexts?.[id]||s.aiGaps?.[id])return;
  const attempts=aiAttempts.get(s)??new Set();
  if(attempts.has(id))return;
  if(state.mode==='gap'&&Object.keys(s.aiGaps??{}).length>=10)return;
  attempts.add(id);
  aiAttempts.set(s,attempts);
  void generate(state.mode==='gap'?'gap':'context',true);
}
function stopAutoGeneration(){
  aiAuto=false;
  view.querySelector('[data-act="ai-auto"]')?.setAttribute('aria-pressed','false');
}
async function generate(kind,auto=false){
  if(!aiEnabled||aiPending)return;
  const inRules=kind==='examples';
  const batch=kind==='deck';
  const s=inRules?null:session();
  const cardId=s?.ids[s.pos];
  const originalPage=location.hash, originalMode=state.mode;
  const gapTopic=kind==='gap'?(currentGap(s)?.topic??topicsById.get(state.gapTopic)
    ??grammarTopics[Math.floor(Math.random()*grammarTopics.length)]):null;
  const id=batch?'deck':inRules?(topicsById.get(route()[1])??grammarTopics[0]).id
    :kind==='gap'?gapTopic.id:cardId;
  if(!id)return;
  if(batch&&(!Number.isInteger(aiCount)||aiCount<1||aiCount>20)){
    note('Укажи количество карточек от 1 до 20.');
    view.querySelector('#ai-count')?.focus();
    return;
  }
  if(batch&&state.aiCards.length+aiCount>800){
    note('Достигнут предел истории подборок. Новая пачка не создана.');
    return;
  }
  if(kind==='gap'&&Object.keys(s.aiGaps??{}).length>=10){
    note('В этой подборке уже десять заданий от ИИ. Открой новую подборку для продолжения.');
    return;
  }
  aiPending=true;
  const setButtonsBusy=busy=>view.querySelectorAll('[data-act="ai"]').forEach(button=>{
    button.disabled=busy;
    button.setAttribute('aria-busy',String(busy));
    button.textContent=busy?'Генерация…':button.dataset.label;
  });
  setButtonsBusy(true);
  let updated=false;
  try{
    const response=await fetch('/api/generate',{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(batch?{
        kind,level:levels.includes(state.level)?state.level:'B1',part:state.part,count:aiCount,
        history:state.aiCards.map(card=>[card.word,card.sentence])
      }:{kind,id})
    });
    const data=await response.json();
    if(!response.ok){
      note(data.error??'Генерация не удалась.');
      if(auto)stopAutoGeneration();
      return;
    }
    if(location.hash!==originalPage||(!inRules&&(state.mode!==originalMode||session()!==s||s.ids[s.pos]!==cardId)))return;
    if(auto&&(!aiAuto||s.answers[cardId]!==undefined||view.querySelector('#gap-answer-form input')?.value.trim()))return;
    if(batch){
      const cards=data.cards.map(card=>({...card,id:'ai-word-'+crypto.randomUUID()}));
      for(const card of cards)bank.set(card.id,card);
      state.aiCards.push(...cards);
      state.aiDeckIds=cards.map(card=>card.id);
      state.aiDeckFilter={level:state.level,part:state.part};
      delete state.sessions['ai-deck:en-ru'];
      delete state.sessions['ai-deck:ru-en'];
      state.activeAiDeck=true;
      state.review=null;
      filtersOpen=false;
    }else if(inRules){
      aiExamples.set(id,data.examples);
    }else if(kind==='context'){
      (s.aiContexts??={})[cardId]=data;
      (s.contexts??={})[cardId]='ai';
    }else{
      const exerciseId='ai-gap-'+crypto.randomUUID();
      (s.aiGaps??={})[exerciseId]={...data,topicId:id};
      if(!auto&&s.answers[cardId]!==undefined)s.pos++;
      s.ids.splice(s.pos,auto?1:0,exerciseId);
    }
    writeState();
    updated=true;
  }catch{
    note('Генерация не удалась. Попробуй ещё раз.');
    if(auto)stopAutoGeneration();
  }finally{
    aiPending=false;
    if(updated){
      render();
      if(kind==='gap'&&phoneLayout.matches)view.querySelector('.exercise')?.scrollIntoView({block:'start'});
    }else{
      setButtonsBusy(false);
      maybeGenerate();
    }
  }
}
function action(a,val){if(a==='sound'){const w=bank.get(val);speak(page()==='practice'?currentContext(w,session()):w.contexts?.[0]??w);return}
if(a==='ai'){void generate(val);return}
if(a==='source'){
  if(val==='generated'&&!aiEnabled){
    if(aiLocal){location.hash='settings';return}
    note('Сначала настрой ключ на сервере.');
    return;
  }
  state.activeAiDeck=val==='generated';
  state.review=null;
  aiAuto=false;
  if(state.activeAiDeck&&!levels.includes(state.level))state.level='B1';
  writeState();
  render();
  return;
}
if(a==='leave-ai-deck'||a==='resume-ai-deck'){
  state.activeAiDeck=a==='resume-ai-deck';
  state.review=null;
  writeState();
  render();
  return;
}
if(a==='ai-auto'){
  if(aiAuto){
    stopAutoGeneration();
  }else{
    aiAuto=true;
    aiAttempts=new WeakMap();
    view.querySelector('[data-act="ai-auto"]').setAttribute('aria-pressed','true');
    maybeGenerate();
  }
  return;
}
if(a==='settings-retry'){void loadSettings();return}
if(a==='filters'){
  filtersOpen=!filtersOpen;
  view.querySelector('#practice-controls').classList.toggle('is-open',filtersOpen);
  view.querySelector('.filters-toggle').setAttribute('aria-expanded',String(filtersOpen));
  return;
}
if(a==='context'){
  const s=session(),w=bank.get(s.ids[s.pos]),index=val==='ai'?val:Number(val);
  if(!w||(index==='ai'?!s.aiContexts?.[w.id]:!(w.contexts??[w])[index]))return;
  (s.contexts??={})[w.id]=index;
  writeState();
  render();
  view.querySelector('[data-act="context"][aria-pressed="true"]')?.focus({preventScroll:true});
  return;
}
if(a==='answer'||a==='skip'){
  if(a==='skip'||state.mode!=='gap')answer(a==='skip'?-1:Number(val));
  return;
}
if(a==='level'||a==='part'||a==='mode'){
  const labels=a==='level'?levelLabels:a==='part'?partLabels:modeLabels;
  if(!labels.has(val))return;
  state.review=null;
  state[a]=val;
  if((a==='level'||a==='part')&&state.activeAiDeck){
    delete state.sessions['ai-deck:en-ru'];
    delete state.sessions['ai-deck:ru-en'];
  }
  hint=false;
  if(a==='mode')filtersOpen=false;
  writeState();
  render();
  view.querySelector('[data-act="'+a+'"][aria-pressed="true"]')?.focus({preventScroll:true});
  return;
}
if(a==='practice-topic'){
  if(!topicsById.has(val))return;
  state.mode='gap';
  state.gapTopic=val;
  state.review=null;
  writeState();
  location.hash='practice';
  window.scrollTo(0,0);
  return;
}
if(a==='save'){const i=state.saved.indexOf(val);if(i<0)state.saved.unshift(val);else state.saved.splice(i,1);note(i<0?'Слово сохранено':'Слово убрано из словаря')}
if(a==='hint')hint=!hint;
if(a==='dictionary'||a==='practice'){location.hash=a;return}
if(a==='next'){const s=session();if(s.answers[s.ids[s.pos]]===undefined)return;s.pos++;hint=false;filtersOpen=false}
if(a==='new'){state.review=null;state.sessions[workoutKey()]=newWorkout();hint=false}
if(a==='reviewSaved'){
  if(!state.saved.length)return;
  if(state.mode==='gap')state.mode='en-ru';
  state.review=build(shuffle(state.saved).slice(0,10));
  hint=false;
  location.hash='practice';
}
if(a==='mistakes'){
  const s=session();
  state.review=build(shuffle(s.ids.filter(id=>s.answers[id]!==0)));
  if(s.aiGaps)state.review.aiGaps=s.aiGaps;
  if(s.aiContexts)state.review.aiContexts=s.aiContexts;
  hint=false;
}
writeState();render();
if(a==='next'&&phoneLayout.matches){
  const card=view.querySelector('.exercise, .finish');
  if(card.getBoundingClientRect().top<0)card.scrollIntoView({block:'start'});
}}
view.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(b&&!b.disabled)action(b.dataset.act,b.dataset.val)});
view.addEventListener('input',e=>{if(e.target.id==='search'){q=e.target.value;document.getElementById('entries').innerHTML=entries()}
  if(e.target.id==='ai-count')aiCount=e.target.value===''?NaN:Number(e.target.value);
});
view.addEventListener('change',e=>{
  const {id,value}=e.target;
  if(id==='practice-level'&&levelLabels.has(value))return action('level',value);
  if(id==='practice-part'&&partLabels.has(value))return action('part',value);
  if(id==='grammar-page-topic'&&topicsById.has(value))location.hash='grammar/'+value;
  if(id==='gap-topic'&&(value===mixedTopics||topicsById.has(value))){
    state.gapTopic=value;
    state.review=null;
    writeState();
    render();
    view.querySelector('#gap-topic')?.focus({preventScroll:true});
  }
});
const normalizeAnswer=value=>value.normalize('NFKC').replace(/[‘’ʼ]/g,"'").trim().toLowerCase()
  .replace(/\s+/g,' ').replace(/[.!?]+$/,'').trimEnd();
view.addEventListener('submit',e=>{
  if(e.target.id==='ai-settings-form'){
    e.preventDefault();
    void saveAiSettings(e.target,e.submitter?.value==='both');
    return;
  }
  if(e.target.id!=='gap-answer-form'||state.mode!=='gap')return;
  e.preventDefault();
  const input=e.target.elements.answer;
  const response=input.value.trim();
  const normalized=normalizeAnswer(response);
  if(!normalized){
    input.focus();
    return;
  }
  const exercise=currentGap(session());
  if(!exercise)return;
  answer(exercise.answers.some(expected=>normalizeAnswer(expected)===normalized)?0:1,response);
  view.querySelector('[data-act="next"]')?.focus({preventScroll:true});
});
window.addEventListener('hashchange',e=>{
  q='';
  hint=false;
  render();
  if(page()==='grammar'||e.oldURL?.split('#')[1]?.startsWith('grammar'))window.scrollTo(0,0);
});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.altKey||e.metaKey||e.repeat||page()!=='practice'||e.target.matches?.('input,textarea,select'))return;
  const s=session(),id=s.ids[s.pos];
  if(!id)return;
  if(state.mode!=='gap'&&/^[1-4]$/.test(e.key)){
    e.preventDefault();
    answer(s.layouts[id][Number(e.key)-1]);
  }else if(e.key==='Enter'&&s.answers[id]!==undefined&&!e.target.closest?.('button,a')){
    e.preventDefault();
    action('next');
  }
});
render();

function closeGloss(){
  if(!activeGloss)return;
  activeGloss.classList.remove('chosen');
  activeGloss.setAttribute('aria-pressed','false');
  activeGloss.removeAttribute('aria-describedby');
  glossBubble.hidden=true;
  activeGloss=null;
}
function positionGloss(){
  if(!activeGloss)return;
  const anchor=activeGloss.getBoundingClientRect();
  const {clientWidth,clientHeight}=document.documentElement;
  if(anchor.bottom<=0||anchor.top>=clientHeight){
    closeGloss();
    return;
  }
  const {width,height}=glossBubble.getBoundingClientRect();
  const gap=9, margin=8, center=anchor.left+anchor.width/2;
  const left=Math.max(margin,Math.min(center-width/2,clientWidth-width-margin));
  const fitsAbove=anchor.top>=height+gap+margin;
  const above=fitsAbove||anchor.top>clientHeight-anchor.bottom;
  const top=above?anchor.top-height-gap:anchor.bottom+gap;
  glossBubble.style.left=left+'px';
  glossBubble.style.top=Math.max(margin,Math.min(top,clientHeight-height-margin))+'px';
  glossBubble.style.setProperty('--arrow-x',Math.max(10,Math.min(width-10,center-left))+'px');
  glossBubble.classList.toggle('below-word',!above);
}
document.addEventListener('click',e=>{
  const button=e.target.closest('.lookup');
  const wasActive=button===activeGloss;
  closeGloss();
  if(!button||wasActive)return;
  const s=session(),w=bank.get(s.ids[s.pos]);
  const translations=currentContext(w,s).glosses??glosses[w.sentence];
  activeGloss=button;
  glossBubble.textContent=button.dataset.gloss==='target'?w.right:translations[Number(button.dataset.gloss)];
  glossBubble.hidden=false;
  positionGloss();
  if(!activeGloss)return;
  button.classList.add('chosen');
  button.setAttribute('aria-pressed','true');
  button.setAttribute('aria-describedby',glossBubble.id);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeGloss()});
view.addEventListener('focusout',e=>{if(e.target===activeGloss)closeGloss()});
window.addEventListener('scroll',positionGloss,{passive:true});
window.addEventListener('resize',positionGloss);

