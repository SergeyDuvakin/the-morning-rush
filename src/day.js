// M1-1/M1-4/M1-6/M1-9: день (сид mulberry32, день недели, погода, новость, тип, задание), жизненный цикл дня, открытия 25…48.
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const WD4=['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'], WD4_N=['понедельник','вторник','среда','четверг','пятница','суббота','воскресенье'];
const WD4_COL=['#ff5a5a','#e6e6f4','#e6e6f4','#e6e6f4','#5aff8a','#ffd23f','#ffd23f'];
const WEATHER4={clear:{n:'ясно',p:.55},rain:{n:'дождь',p:.2},snow:{n:'снег',p:.12},fog:{n:'туман',p:.13}};
const DAYTYPE4={short:{n:'короткий день',p:20,len:[180,210]},normal:{n:'обычный день',p:45,len:[270,330]},long:{n:'длинный день',p:25,len:[360,420]},weekend:{n:'выходной',len:[90,180]}};
const NEWS4=['Метро: эскалаторы будут ехать в обе стороны сразу','Учёные: опоздание на 5 минут продлевает жизнь на 5 минут','В МЦД заметили поезд, пришедший вовремя. Ищут свидетелей',
  'Голуби Москвы объявили забастовку крошек','Бабушки требуют выделенную полосу для сумок-тележек','Курс шаурмы к жетону снова вырос','Начальники массово переходят на часы без минутных стрелок',
  'Найден человек, который стоит справа на эскалаторе. Сам','Кофейни у метро ввели тариф «на бегу»','Промоутеры научились раздавать листовки взглядом','Пробки на эскалаторе — 7 баллов',
  'Синоптики: дождь пойдёт ровно когда выйдешь из метро','Метро тестирует вагоны «только для сидящих»','Самокатчики признаны отдельным видом погоды','В лифте БЦ застрял квартальный отчёт',
  'Контролёры МЦД проводят «день открытых валидаторов»','Шпиц с поводком перекрыл переход на 40 секунд','МЦК пошла в обратную сторону. Никто не заметил','Будильник признан главным врагом года','Офис переехал на 15-й этаж. Лифт — нет'];
const TASKS4=[{id:'sit',n:'сядь в вагоне',ok:()=>TR.spot>=3},{id:'calm',n:'без скандалов',ok:()=>TR.scandals===0},{id:'polite',n:'уступи место',ok:()=>TR.polite>0},
  {id:'spare',n:'успей с запасом 20 с',ok:()=>TR.tLeft>=20},{id:'hold',n:'держись за поручень',ok:()=>TR.spot>=1},{id:'egg',n:'найди пасхалку',ok:()=>TR.eggs.length>0}];
const TASK_COINS=5;
// открытия по очкам — продолжение ST_THR: индексы 25…48 в порядке §0
const UNLOCK4=[['street1','улица-1'],['light','светофор'],['puddles','лужи'],['promoter','промоутер'],['pigeons','голуби'],['construction','стройка'],['accident','ДТП'],['ice','лёд'],
  ['mcd','МЦД'],['mck','МЦК'],['controllers','контролёры'],['street2','улица-2'],['scooters','самокаты'],['couriers','курьеры'],['coffee','кофейня'],['bcgate','БЦ-турникет'],['lift','лифт'],
  ['stairs14','лестница'],['colleague','коллега'],['weather','погода'],['weekdays','будни'],['news','новости'],['fork','развилка'],['taxi','такси']];
const thr4=n=>Math.round((280*n+10*n*n)/10)*10; // та же кривая, что ST_THR
function unlockThr(id){ const i=UNLOCK4.findIndex(u=>u[0]===id); return i<0?Infinity:thr4(25+i); }
function unl4(id){ return (save.unlocks4||[]).includes(id); }
// уже открытое остаётся открытым (список в сейве только растёт)
function syncUnlocks4(){ const pts=tripPts(), add=[]; save.unlocks4=save.unlocks4||[]; for(let i=0;i<UNLOCK4.length;i++){ const [id]=UNLOCK4[i]; if(pts>=thr4(25+i)&&!save.unlocks4.includes(id)){ save.unlocks4.push(id); add.push(UNLOCK4[i]); } } return add; }
function nextUnlock4(){ const pts=tripPts(); for(let i=0;i<UNLOCK4.length;i++){ if(!unl4(UNLOCK4[i][0])) return {id:UNLOCK4[i][0],n:UNLOCK4[i][1],thr:thr4(25+i),left:Math.max(0,thr4(25+i)-pts)}; } return null; }
// ---------- генерация дня (детерминирована по сиду + контексту) ----------
function genDay(seed,env){ env=env||{}; const r=mulberry32(seed>>>0); let wd=Math.floor(r()*7); const r2=r();
  if(wd>=5&&r2>=.5) wd=Math.floor((r2-.5)*10); // M5-3: выходной ≈1/7 (СБ 1/14, ВС 1/14)
  else if(wd>=5&&((env.dayN||0)<=3||env.prevWeekend)) wd=Math.floor(r2*5); // выходной — не в первые 3 дня и не два подряд
  let w=r(), weather='clear'; for(const k in WEATHER4){ if((w-=WEATHER4[k].p)<0){ weather=k; break; } }
  let type; const rt=r()*90; if(wd>=5) type='weekend'; else if(env.fresh) type='short'; else type=rt<20?'short':rt<65?'normal':'long';
  const news=Math.floor(r()*NEWS4.length), task=Math.floor(r()*TASKS4.length), lu=r();
  const L=DAYTYPE4[type].len; return {seed:seed>>>0,weekday:wd,weather,news,type,task,len:Math.round(L[0]+lu*(L[1]-L[0])),n:env.dayN||0}; }
function newDay(seed){ save.dayN=(save.dayN|0)+1; const prevWeekend=!!(save.day&&save.day.weekday>=5); const fresh=!!(save.fresh&&save.fresh.left>0);
  save.day=genDay(seed===undefined?(Math.random()*4294967296)>>>0:seed,{dayN:save.dayN,prevWeekend,fresh}); if(fresh){ save.day.fresh=save.fresh.id; save.fresh.left--; }
  save.segSave=null; store(); return save.day; }
function ensureDay(){ if(!save.day||save.day.done) newDay(); return save.day; }
function dayEnv(){ return {unl:unl4,impl:s=>!!SEG_IMPL[s],evLast:save.evLast||{},dayN:save.dayN|0}; }
function dayPlan(idx,day){ return planRoute(day||ensureDay(),idx,dayEnv()); }
// эффективные погода/новость: открываются по очкам (M1-9)
function dayWeather(d){ d=d||save.day; return d&&unl4('weather')?d.weather:'clear'; }
// ---------- запуск дня ----------
function startDay(idx,opts){ opts=opts||{}; const day=opts.day||ensureDay(); const plan=planRoute(day,idx,dayEnv());
  startTrip(idx,{zones:plan.zones,kT:plan.kT,day,soft:plan.soft,rain:plan.rain,budget:plan.total}); TR.plan=plan; TR.task=TASKS4[day.task]; save.evLast=save.evLast||{};
  for(const k of plan.events) save.evLast[k]=day.n; const ss=save.segSave;
  if(opts.resume&&ss&&ss.idx===idx&&ss.seed===day.seed&&ss.tLeft>0){ TR.tLeft=Math.min(TR.tTotal,ss.tLeft); tev('resume'); }
  else save.segSave={idx,seed:day.seed,seg:plan.trans,tLeft:TR.tTotal,tTotal:TR.tTotal,ts:Date.now()}; // автосейв на границе сегмента
  store(); return plan; }
function segResumable(){ const s=save.segSave; return !!(s&&save.day&&s.seed===save.day.seed&&Date.now()-s.ts<12*3600e3&&!save.day.done); }
// финал дня
{ const _tf=tripFinish; tripFinish=function(win,reason){ const was=TR.done; _tf(win,reason); if(was||TR.mode!=='trip'||!TR.day) return; const d=TR.day; save.segSave=null;
  if(win){ d.done=true; save.streak.n++; save.streak.best=Math.max(save.streak.best,save.streak.n);
    if(TR.task&&TR.task.ok()){ TR.taskOk=true; wallet().coins+=TASK_COINS; TR.coinsGot+=TASK_COINS; }
    TR.newUnlocks=TR.newUnlocks||[];
    if(d.type==='weekend'&&!save.weekendDone){ save.weekendDone=true; if(!save.heroes.owned.includes('tima')){ save.heroes.owned.push('tima'); TR.newUnlocks.push('герой: Тимоха'); } }
    for(const u of syncUnlocks4()){ TR.newUnlocks.push(u[1]); save.fresh={id:u[0],left:3}; } }
  else save.streak.n=0;
  if(save.day&&save.day.seed===d.seed) Object.assign(save.day,{done:d.done}); store(); }; }
// выходной: мягкие часы — подсказка один раз
{ const _tu=tripUpdate; tripUpdate=function(dt){ _tu(dt); if(TR.soft&&TR.overtime>0&&!TR.softSaid&&!TR.done){ TR.softSaid=1; say('Выходной: 09:00 не страшно, но звёзд будет меньше',2.2,'#ffd23f'); } }; }
// свернули TG/вкладку — пауза поездки (M1-6)
document.addEventListener('visibilitychange',()=>{ try{ if(document.hidden&&G.scene==='trip'&&!TR.done&&!navigator.webdriver) paused=true; /* в автотестах headless-окно «прячется» само — там автопаузу не включаем */ }catch(e){} });
syncUnlocks4();
// пауза «ЗАНОВО» и прочие startLevel — в рамках того же дня
startLevel=function(idx){ if(TR.mode==='escape'&&G.scene==='trip') return startEscape(); if(TR.mode==='learn'&&G.scene==='trip') return startLearn(); if(TR.day&&TR.idx===idx) return startDay(idx,{day:TR.day}); startDay(idx); };
// после победного дня на карте уже следующий день
{ const _tm=toMap; toMap=function(){ if(save.day&&save.day.done) newDay(); return _tm.apply(this,arguments); }; }
