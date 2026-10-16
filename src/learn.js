// ---------- v3.1: ОБУЧЕНИЕ — отдельная учебная станция, без провала по 09:00 ----------
const LEARN_ZONES=()=>[{k:'gate',lanes:2,qmin:2,qmax:3,kassa:true,title:'ОБУЧЕНИЕ: ВЕСТИБЮЛЬ'},{k:'esc',mode:'esc'},{k:'plat',openT:12,crowd:8},{k:'car',stops:1,ride:34,sway:6,seats:3,crowd:6},{k:'exitz',crowd:6}].map(z=>(z.d=0,z));
const LSTEPS=[ // [зона, заголовок, текст карточки, цель в HUD, условие, заморозить поезд]
 ['gate','ДЖОЙСТИК','Тяни палец от кружка внизу слева — герой пойдёт туда. Пройди немного.','Подвигай героя джойстиком',(z,h,s)=>Math.hypot(h.x-s.x,h.y-s.y)>40],
 ['gate','ТОЛКНУТЬ','Большая кнопка справа внизу — толкнуть соседа. Нажми её. Много толкаешься — растёт скандал.','Нажми ТОЛКНУТЬ',()=>TR.lA>0],
 ['gate','КАССА','Жетона нет! Подойди к кассе слева. Появится вторая кнопка — она меняется по ситуации. Купи жетон.','Купи жетон в кассе ←',()=>Object.keys(TR.ev).some(k=>k.startsWith('buy_'))],
 ['gate','ОЧЕРЕДЬ','Встань в хвост очереди к турникету.','Встань в очередь',(z)=>!!z.inQ||z.passed],
 ['gate','ВЛЕЗТЬ','Зевака в телефоне? Встань рядом и жми «ВЛЕЗТЬ». Влезешь перед честным — скандал. Можно и просто подождать.','Влезь перед зевакой или жди',(z)=>TR.ev.cut_ok||TR.ev.cut_fail||z.passed||(z.inQ&&z.inQ.q.indexOf(G.hero)===0)],
 ['gate','ТУРНИКЕТ','У турникета жетон списывается сам. Проходи и иди вправо.','Пройди турникет →',(z)=>z.done],
 ['esc','ЭСКАЛАТОР','Справа стоят. Шагни влево и жми кнопку — пойдёшь пешком быстрее.','Спустись по эскалатору',(z)=>z.done],
 ['plat','ДВЕРИ','Встань у двери. Открылась — жми «ВОЙТИ», пока не закрылись! Набито — жми «ВТИСНУТЬСЯ» много раз.','Войди в вагон до закрытия',(z)=>z.boarded||z.done],
 ['car','МЕСТО','Зелёный квадрат — свободное место, подойди и сядь. Или держись за поручень (он подсвечен).','Займи место или поручень',(z,h)=>!!h.seat||h.hold!=null,1],
 ['car','ПОВОРОТ','Мигает «!» — через секунду тряхнёт. Кто не держится — падает. Переживи один поворот.','Переживи поворот',()=>TR.lsw>0,1],
 ['car','ВЫХОД','Объявили твою станцию — иди к двери и выходи.','Выйди на своей станции',(z)=>z.done],
 ['exitz','НА РАБОТУ','Последний рывок: обходи встречных и беги вправо. Тут таймера нет — это обучение.','Беги к выходу →',(z)=>z.done]];
function startLearn(){ startTrip(0,{mode:'learn',zones:LEARN_ZONES()}); TR.name='Учебная'; TR.lw={coins:20,tokens:0,rides:0,unlim:'',debt:0}; TR.ls=0; TR.lA=0; TR.lsw=0; TR.lcard=null; TR.lshown=0; TR.lstart=null; tev('learn_start'); }
const _wal31=wallet; wallet=function(){ return TR.mode==='learn'&&TR.lw&&!TR.done?TR.lw:_wal31(); };
const _tp31=tripPress; tripPress=function(k){ if(TR.mode==='learn'&&TR.lcard) return; const z=TR.z; if(TR.mode==='learn'&&k==='A'&&z&&!z.ctxA) TR.lA=(TR.lA||0)+1; return _tp31(k); }; __trip.press=k=>tripPress(k);
function learnStep(){ return TR.mode==='learn'?LSTEPS[TR.ls]:null; }
const _tuL=tripUpdate; tripUpdate=function(dt){ if(TR.mode!=='learn'||TR.done) return _tuL(dt);
  TR.tLeft=TR.tTotal; const z=TR.z, h=G.hero; let st=learnStep();
  while(st&&TR.zones.findIndex(q=>q.k===st[0])<TR.zi){ TR.ls++; TR.lshown=0; st=learnStep(); }
  if(st&&z&&z.k===st[0]&&!TR.lcard&&!TR.lshown){ TR.lshown=1; TR.lcard={t:0}; TR.lstart={x:h.x,y:h.y}; tev('learn_card'); }
  if(TR.lcard&&!paused){ TR.lcard.t+=dt; if(window.__learnAuto&&TR.lcard.t>.3) TR.lcard=null; for(const ev of input.events) if(ev.t==='key'&&TR.lcard&&TR.lcard.t>.6) TR.lcard=null; input.events.length=0; return; }
  const T0=z&&z.k==='car'?z.T:null, w0=z&&z.warn;
  _tuL(dt);
  if(z&&z.k==='car'){ if(w0&&!z.warn) TR.lsw++; if(st&&st[5]&&st[0]==='car'&&!st[4](z,h,TR.lstart||h)) z.T=Math.min(z.T,T0); }
  if(st&&TR.lshown&&!TR.lcard&&(z!==TR.z||st[4](z,h,TR.lstart||h))){ TR.ls++; TR.lshown=0; tev('learn_ok'); pop('ГОТОВО ✓',h.x,h.y-50,P.neonLime,9); SFX.coin(); } };
const _gtL=goalText; goalText=function(z){ const st=learnStep(); if(st&&z&&z.k===st[0]&&TR.lshown) return '★ '+st[3]; return _gtL(z); };
const _hudL=tripHUD; tripHUD=function(){ _hudL(); if(TR.mode!=='learn') return; const T=SA.t+3;
  G.labels.push(['ОБУЧЕНИЕ '+Math.min(TR.ls+1,LSTEPS.length)+'/'+LSTEPS.length,SA.l+46,T+38,7,'#9cf']);
  if(TR.lcard) drawLearnCard(); };
function drawLearnCard(){ const st=learnStep(); if(!st) return; G.labels.length=0; ctx.fillStyle='rgba(10,6,20,.42)'; ctx.fillRect(0,0,W,H); buttons.length=0;
  const w=Math.min(W-60,360), x=Math.round(W/2-w/2), y=Math.round(H*.2), ln=wrapW(st[2],w-20,8), hh=44+ln.length*13+18;
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh);
  G.labels.push(['ШАГ '+(TR.ls+1)+' · '+st[1],W/2,y+13,11,'#d8265e','center',null]);
  ln.forEach((s,i)=>G.labels.push([s,W/2,y+34+i*13,8,'#1a1020','center',null]));
  if(TR.lcard.t>.6) G.labels.push(['нажми — попробовать',W/2,y+hh-9,7,'#6a5a8a','center',null]);
  buttons.push({x:0,y:0,w:W,h:H,id:'learnok',cb:()=>{ if(TR.lcard&&TR.lcard.t>.6) TR.lcard=null; }});
  const sw=170, sh=30; bigBtn('ПРОПУСТИТЬ ОБУЧЕНИЕ',Math.round(W/2-sw/2),y+hh+10,sw,sh,'#5a4a7a',()=>learnQuit(),'learnskip',7); }
function learnQuit(){ tev('learn_skip'); TR.done=true; TR.lcard=null; musOn=false; toTitle(); say('Обучение можно пройти снова из меню',2.4,P.neonLime); }
const _tfL=tripFinish; tripFinish=function(win,reason){ if(TR.mode!=='learn') return _tfL(win,reason); if(TR.done) return; TR.done=true; TR.win=true; G.done=true; G.win=true; G.doneT=0; musOn=false; save.learned=1; store(); SFX.win(); };
const _srL=showResult; showResult=function(){ if(TR.mode==='learn'){ TR.mode='learned'; toTitle(); say('Обучение пройдено! Теперь — ИГРАТЬ',3,P.neonLime); return; } return _srL(); };
window.__learn={start:startLearn,steps:LSTEPS};
