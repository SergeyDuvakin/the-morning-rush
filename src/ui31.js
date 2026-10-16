'use strict';
// ================= v3.1: чистое меню, минимальный HUD, фикс-джойстик, обучение, концовки =================
// ---------- джойстик: фиксированная база слева внизу ----------
window.STICK_BASE=()=>{ const r=Math.max(20,Math.round(34*DPR/SC)); return {x:SA.l+r+14,y:H-SA.b-r-12,r}; };
function drawStick(){ const B=STICK_BASE(), s=input.stick; ctx.globalAlpha=s?.5:.3; disc(ctx,B.x,B.y,B.r+2,B.r+2,P.ink); disc(ctx,B.x,B.y,B.r,B.r,'#ffffff'); ctx.globalAlpha=s?.85:.55;
  let tx=B.x, ty=B.y; if(s){ const v=stickVec(); tx=B.x+v.x*B.r*.75; ty=B.y+v.y*B.r*.75; } disc(ctx,tx,ty,Math.round(B.r*.45)+1,Math.round(B.r*.45)+1,P.ink); disc(ctx,tx,ty,Math.round(B.r*.45),Math.round(B.r*.45),'#e8e0f0'); ctx.globalAlpha=1;
  if(!save.stickSeen&&G.time<6) G.labels.push(['ДВИГАЙ',B.x,B.y-B.r-8,8,'#fff']); else if(G.time>6&&!save.stickSeen){ save.stickSeen=1; } }
// ---------- цель зоны простыми словами ----------
function goalText(z){ const h=G.hero; switch(z.k){
  case 'gate': if(z.passed) return 'Проходи дальше →'; if(z.inK>0) return z.K[0]===h?'Купи проезд (кнопка справа)':'Стой в очереди в кассу'; if(!canPass()) return 'Нет проезда — иди в КАССУ ←'; if(z.turnboss&&z.inQ) return 'Жди ЗЕЛЁНЫЙ на турникете'; if(z.inQ) return 'Стой в очереди… или влезь'; return 'Встань в очередь к турникету';
  case 'esc': return z.mode==='stairs'?'Поднимайся: жми ШАГ':z.lane===1?'Шагни влево и иди пешком':'Иди слева: жми ИДТИ';
  case 'passage': if(z.mus&&!z.tipped&&Math.abs(h.x-z.mus.x)<90) return 'Зеваки! Дай чаевые или обойди'; return z.flow==='headon'?'Протиснись через встречных →':'Иди по переходу →';
  case 'plat': if(z.boarded) return 'Ты внутри!'; if(z.ph==='open'||z.ph==='closing') return z.atDoor?'Жми ВОЙТИ!':'Беги к открытой двери!'; return 'Встань у двери вагона';
  case 'car': if(z.arrive) return 'Твоя станция! Выходи к двери'; if(h.seat) return z.terminal&&z.sleep>.3?'Не усни!':'Сидишь. Жди свою станцию'; if(h.hold!=null) return 'Держишься. Ищи свободное место'; return 'Займи место (или держись за поручень)';
  case 'exitz': return 'Выход в город →';
  case 'escape': return z.op?'ДВЕРИ ОТКРЫТЫ — ВЫХОДИ!':'Пробейся к двери';
  } return ''; }
// ---------- минимальный HUD ----------
tripHUD=function(){ const L=SA.l+4, R=W-SA.r-4, T=SA.t+3, z=TR.z;
  // большие часы: 08:40 → 09:00
  const k=Math.max(0,TR.tLeft/TR.tTotal), mins=Math.floor(20*(1-k)), secs=Math.floor((20*(1-k)-mins)*60), crit=k<.15;
  const clock='08:'+String(40+Math.min(19,mins)).padStart(2,'0'); const blink=crit&&Math.floor(G.t*3)%2;
  ctx.fillStyle='#120c18c0'; ctx.fillRect(L,T,84,30); G.labels.push([clock,L+42,T+15,16,blink?'#ff4a4a':crit?'#ff8a8a':'#fff']);
  // строка цели
  const g=G.msg?G.msg.s:goalText(z), gc=G.msg?G.msg.col:'#ffe28a'; const gw=Math.min(W-200,txtW(g,10)+20); ctx.fillStyle='#120c18c0'; ctx.fillRect(Math.round(W/2-gw/2),T,gw,22); G.labels.push([g,W/2,T+11,10,gc]);
  // скандал — только когда растёт
  if(TR.scandal>12){ const bw=90, bx=Math.round(W/2-bw/2), by=T+26; ctx.fillStyle=P.ink; ctx.fillRect(bx-1,by-1,bw+2,6); ctx.fillStyle=TR.scandal>70?P.red:'#ff9a3a'; ctx.fillRect(bx,by,Math.round(bw*Math.min(1,TR.scandal/100)),4); G.labels.push(['СКАНДАЛ',bx-4,by+2,6,'#ffb0a0','right']); }
  // кошелёк — только у турникетов/кассы
  if(z&&z.k==='gate'&&!z.passed) G.labels.push([wallet().coins+' мон. · '+passInfo(),W/2,T+40,7,'#ffd23f']);
  // пауза
  const pb=Math.max(24,44*DPR/SC); buttons.push({x:R-pb,y:T,w:pb,h:pb,id:'pause',cb:()=>{paused=!paused; SFX.ui();}}); ctx.fillStyle='#120c18c0'; ctx.fillRect(R-pb,T,pb,pb); ctx.fillStyle='#fff'; ctx.fillRect(R-pb*.66,T+pb*.28,pb*.12,pb*.44); ctx.fillRect(R-pb*.46,T+pb*.28,pb*.12,pb*.44);
  // две кнопки справа внизу
  const bh=Math.max(32,56*DPR/SC), bwA=Math.max(76,110*DPR/SC), bxA=R-bwA, byA=H-SA.b-bh-6;
  actBtn(z&&z.ctxA?z.ctxA.label:'ТОЛКНУТЬ',bxA,byA,bwA,bh,z&&z.ctxA?(z.ctxA.col||'#2aa860'):'#a8264e','A');
  if(z&&z.ctxB){ const bwB=Math.max(bwA,txtW(z.ctxB.label,9)+18); actBtn(z.ctxB.label,bxA-bwB-8,byA,bwB,bh,z.ctxB.col||'#3a6ad8','B',Math.sin(G.t*8)>0); }
  drawStick();
  // обучение
  if(TR.tut) drawTut(); };
// ---------- обучение: короткая карточка при первой встрече с зоной ----------
const TUT31={gate:['ТУРНИКЕТЫ','Встань в хвост очереди и жди. Рядом с зевакой в телефоне жми «ВЛЕЗТЬ». Нет проезда — касса слева.'],
  esc:['ЭСКАЛАТОР','Справа стоят. Шагни джойстиком влево и жми кнопку — пойдёшь пешком быстрее.'],
  passage:['ПЕРЕХОД','Иди вправо. Встречных обходи. Зевак у музыканта разгонят чаевые.'],
  plat:['ПЛАТФОРМА','Встань у двери. Когда откроется — жми «ВОЙТИ». Полная — жми «ВТИСНУТЬСЯ» много раз.'],
  car:['ВАГОН','Займи свободное место (мигает зелёным) или держись за поручень. Мигает «!» — сейчас тряхнёт.'],
  exitz:['ВЫХОД','Последний рывок: обходи встречных и беги вправо.'],escape:['ПРОБИТЬСЯ','20 секунд. Двери откроются на 8 секунд — доберись и жми «ВЫЙТИ».']};
function tutCheck(){ const z=TR.z; if(!z||TR.tut||TR.mode==='learn') return; save.tut=save.tut||{}; if(!save.tut[z.k]&&TUT31[z.k]&&!window.__noTut){ save.tut[z.k]=1; store(); TR.tut={k:z.k,t:0}; } }
function drawTut(){ const c=TR.tut, d=TUT31[c.k]; G.labels.length=0; ctx.fillStyle='rgba(10,6,20,.55)'; ctx.fillRect(0,0,W,H); const w=Math.min(W-60,340), x=Math.round(W/2-w/2), y=Math.round(H*.3), hh=86;
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh); G.labels.push([d[0],W/2,y+12,11,'#d8265e','center',null]);
  const ln=wrapW(d[1],w-20,8); ln.forEach((s,i)=>G.labels.push([s,W/2,y+32+i*13,8,'#1a1020','center',null])); if(c.t>.8) G.labels.push(['нажми, чтобы продолжить',W/2,y+hh-8,6,'#8a7a9a','center',null]);
  buttons.push({x:0,y:0,w:W,h:H,id:'tutok',cb:()=>{ if(TR.tut&&TR.tut.t>.8) TR.tut=null; }}); }
function wrapW(s,maxW,size){ const out=[]; let cur=''; for(const w of s.split(' ')){ const t=cur?cur+' '+w:w; if(txtW(t,size)>maxW&&cur){ out.push(cur); cur=w; } else cur=t; } if(cur) out.push(cur); return out; }
const _tu31=tripUpdate; tripUpdate=function(dt){ tutCheck(); if(TR.tut&&!paused){ TR.tut.t+=dt; if(TR.tut.t>4.5) TR.tut=null; for(const ev of input.events) if(ev.t==='key'&&TR.tut&&TR.tut.t>.8) TR.tut=null; input.events.length=0; return; } _tu31(dt); };
// камера держит героя правее зоны большого пальца
const _nz31=nextZone; nextZone=function(){ _nz31(); if(TR.z&&TR.z.k!=='esc'){ G.cam=-Math.round(W*.25); } };
// ---------- меню ----------
drawTitle=function(){ G.labels=[]; buttons=[]; drawBG(G.t*20); G.labels=[]; ctx.fillStyle='rgba(18,12,24,.62)'; ctx.fillRect(0,0,W,H);
  const by=FY1; for(const c of TITLE.crowd){ const x=((c.x*W*1.4+G.t*24*c.sp)%(W*1.4))-W*.2; const img=personSprite(c.spec,'walk',Math.floor(G.t*10*c.sp+c.ph)%8,'norm',Math.floor(G.t*10)); ctx.globalAlpha=.55; ctx.drawImage(img,Math.round(x-32),Math.round(by-4-(c.ph%3)*5-60)); ctx.globalAlpha=1; }
  const T=SA.t, wob=Math.sin(G.t*3)*1; G.labels.push(['ДАВКА ДО РАБОТЫ',W/2,T+26+wob,22,P.edge,'center',P.ink]); G.labels.push(['успей к 09:00',W/2,T+48,9,'#fff']);
  buttons.push({x:W/2-120,y:T+10,w:240,h:40,id:'logo',cb:()=>{ logoTaps++; SFX.squeak(); if(logoTaps>=7&&!save.eggs.metrofan){ save.eggs.metrofan=true; store(); say('Кот Метрофан вышел из туннеля!',3,P.neonLime); } }});
  const bw=Math.min(W*.46,240), bh=Math.max(40,70*DPR/SC), bx=Math.round(W/2-bw/2), y0=Math.round(H*.42);
  bigBtn('ИГРАТЬ',bx,y0,bw,bh,'#d8265e',()=>{ if(!save.cut.intro31){ save.cut.intro31=1; save.cut.intro=1; store(); startCut('intro',()=>startCut('metro',()=>toMap())); } else toMap(); },'play',16);
  const sw=Math.round((bw-10)/2), sh=Math.max(28,44*DPR/SC), sy=y0+bh+12;
  const op=()=>!(window.__econ&&__econ.isOpen());
  bigBtn('ОБУЧЕНИЕ',bx,sy,sw,sh,save.learned?'#3d5ab0':'#2aa860',()=>{ if(op()) startLearn(); },'learn',8); bigBtn('ПРОБИТЬСЯ 20 с',bx+sw+10,sy,sw,sh,'#3d5ab0',()=>{ if(op()) startExit(); },'exit',8);
  const ty=sy+sh+16; G.labels.push(['КОШЕЛЁК',W/2-50,ty,8,'#ffd23f']); G.labels.push(['ЗАСТАВКА',W/2+50,ty,8,'#c8b8e8']);
  buttons.push({x:W/2-95,y:ty-12,w:90,h:24,id:'econ',cb:()=>{ if(op()){ __econ.open(); SFX.ui(); } }}); buttons.push({x:W/2+5,y:ty-12,w:90,h:24,id:'introbtn',cb:()=>{ if(op()) startCut('intro',()=>toTitle()); }});
  if(!save.learned) G.labels.push(['впервые? начни с ОБУЧЕНИЯ',W/2,y0-10,7,'#8fe03a']);
  if(save.escBest) G.labels.push(['рекорд прорыва: '+save.escBest.toFixed(1)+' с',W/2,ty+16,7,'#aaa']);
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,H-SA.b-14,9,G.msg.col]); } };
// ---------- концовки: офис ----------
function office(t){ ctx.fillStyle='#d8d4c4'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#c4bfae'; for(let x=0;x<W;x+=40) ctx.fillRect(x,0,2,H*.7);
  ctx.fillStyle=P.ink; ctx.fillRect(W*.08-2,H*.1-2,W*.22+4,H*.3+4); ctx.fillStyle='#9ad0f0'; ctx.fillRect(W*.08,H*.1,W*.22,H*.3); ctx.fillStyle='#ffffff80'; ctx.fillRect(W*.1,H*.13,W*.05,H*.05);
  ctx.fillStyle='#7a6a8a'; ctx.fillRect(0,H*.7,W,H*.3); ctx.fillStyle='#6a5a7a'; for(let x=0;x<W;x+=30) ctx.fillRect(x,H*.7,1,H*.3);
  G.labels.push(['ООО «ОТЧЁТНОСТЬ»',W*.7,H*.08,8,'#5a4a6a','center',null]); }
function desk(x){ const y=H*.7; ctx.fillStyle=P.ink; ctx.fillRect(x-50,y-30,100,6); ctx.fillRect(x-46,y-24,4,24); ctx.fillRect(x+42,y-24,4,24); ctx.fillStyle='#a8784a'; ctx.fillRect(x-49,y-29,98,4);
  ctx.fillStyle=P.ink; ctx.fillRect(x-4,y-66,40,32); ctx.fillRect(x+12,y-34,6,4); }
function monitor(x,col){ const y=H*.7; ctx.fillStyle=col; ctx.fillRect(x-2,y-63,34,26); }
function chair(x,y){ ctx.fillStyle=P.ink; ctx.fillRect(x-10,y-26,20,4); ctx.fillRect(x-1,y-22,3,14); ctx.fillRect(x-10,y-8,20,2); ctx.fillStyle='#3a3a4a'; ctx.fillRect(x-12,y-48,4,24); }
const END=[ // [название, длительность, отрисовка]
 ['1С',9,(t,S)=>{ office(t); const dx=W*.6; desk(dx); const sit=t>3; const hx=sit?dx-30:W*.05+t/3*(dx-30-W*.05); chair(dx-30,H*.7+4); spr(S,sit?'sit':'walk',Math.floor(t*10)%8,t>6?'o':'norm',hx,H*.7+(sit?-2:4),false,1.1);
   const p=Math.min(1,Math.max(0,(t-3.5)/4)); monitor(dx,t<3.5?'#1a2a3a':'#ffd23f'); if(t>3.5){ ctx.fillStyle='#c82a2a'; ctx.fillRect(dx+2,H*.7-58,8,6); ctx.fillStyle=P.ink; ctx.fillRect(dx+2,H*.7-44,28,3); ctx.fillStyle='#2aa860'; ctx.fillRect(dx+2,H*.7-44,Math.round(28*Math.min(p,.97)),3); G.labels.push(['1С:Предприятие',dx+16,H*.7-76,7,'#c82a2a']); }
   sub(t<3?'Аналитик прибыл. Ровно.':t<7?'Запуск 1С… '+Math.round(Math.min(p,.97)*100)+'%':'97%. Можно сходить за кофе. Ещё дважды.'); }],
 ['кофе',8,(t,S)=>{ office(t); const mx=W*.55, y=H*.7; ctx.fillStyle=P.ink; ctx.fillRect(mx-16,y-70,32,70); ctx.fillStyle='#4a4a5a'; ctx.fillRect(mx-15,y-69,30,68); ctx.fillStyle='#ff4a4a'; ctx.fillRect(mx+8,y-62,4,4); G.labels.push(['КОФЕ',mx,y-78,7,'#5a4a6a','center',null]);
   const hx=t<2.5?W*.05+t/2.5*(mx-30-W*.05):mx-30; spr(S,t<2.5?'walk':t<6?'idle':'cheer',Math.floor(t*10)%8,'norm',hx,y+4,false,1.1);
   if(t>3){ const f=Math.min(1,(t-3)/2); ctx.fillStyle='#5a3a1a'; ctx.fillRect(mx-3,y-24-Math.round(6*f),6,Math.round(6*f)+2); ctx.fillStyle='#fff'; ctx.fillRect(mx-4,y-22,8,8); for(let i=0;i<3;i++){ ctx.fillStyle='#ffffff90'; ctx.fillRect(mx-3+i*3,y-32-((t*20+i*7)%14),1,4); } }
   sub(t<3?'Первым делом — кофе.':t<6?'Автомат думает. Ты тоже.':'Кофе! День спасён (на 15 минут).'); }],
 ['лоб',8,(t,S)=>{ office(t); const dx=W*.55; desk(dx); monitor(dx,'#3a6a9a'); chair(dx-30,H*.7+4); const sit=t>2.5; const hx=sit?dx-30:W*.05+t/2.5*(dx-30-W*.05);
   const bang=sit&&t>3.5?Math.max(0,Math.sin((t-3.5)*5)):0; spr(S,sit?'sit':'walk',Math.floor(t*10)%8,bang>.8?'hurt':'norm',hx+bang*10,H*.7+(sit?-2:4),false,1.1,bang*.6);
   if(bang>.95) { G.labels.push(['БУМ',dx-10,H*.7-60,12,P.red]); shake(1); } G.labels.push(['ПИСЕМ: 148',dx+16,H*.7-76,7,'#c82a2a']); sub(t<3?'Сел. Открыл почту.':'Утренняя медитация.'); }],
 ['кресло',8,(t,S)=>{ office(t); const dx=W*.62; desk(dx); monitor(dx,'#3a6a9a'); const roll=t>3?Math.min(W*.5,(t-3)*(t-3)*30):0; chair(dx-30-roll,H*.7+4); const sit=t>2.6;
   const hx=sit?dx-30-roll:W*.05+t/2.6*(dx-30-W*.05); spr(S,sit?(t>5.5?'hurt':'sit'):'walk',Math.floor(t*10)%8,t>3?'o':'norm',hx,H*.7+(sit?-2:4),false,1.1,t>5.5?-.5:0);
   sub(t<3?'Наконец-то сесть…':t<5.5?'Кресло на колёсиках имеет своё мнение.':'Доброе утро, отдел продаж!'); }],
 ['голубь',8,(t,S)=>{ office(t); const dx=W*.55; desk(dx); monitor(dx,'#3a6a9a'); chair(dx-30,H*.7+4); const px=dx-30, py=H*.7-28; ctx.fillStyle=P.ink; ctx.fillRect(px-7,py-8,14,10); ctx.fillStyle='#8a8aa8'; ctx.fillRect(px-6,py-7,12,8); ctx.fillStyle='#ffb84a'; ctx.fillRect(px+6,py-5,3,2);
   const hx=Math.min(dx-70,W*.05+t/2.5*(dx-70-W*.05)); spr(S,t<2.5?'walk':'idle',Math.floor(t*10)%8,t>3?'o':'norm',hx,H*.7+4,false,1.1); if(t>3) G.labels.push(['КУРЛЫ.',px,py-18,9,'#fff']);
   sub(t<3?'Твоё место…':t<6?'…уже занято. Голубь с Курского.':'Он тоже хотел успеть к девяти.'); }],
];
CUTS.tripwin={len:9,start:c=>{ c.v=Math.floor(Math.random()*END.length); if(window.__endV!==undefined) c.v=window.__endV; c.len=END[c.v][1]; if(CUT) CUT.len=c.len; },draw:(t,c)=>{ END[c.v][2](t,HERO_SPECS[heroId]); const mm=Math.max(40,Math.min(59,40+Math.floor(20*(1-((TR.tLeft||0)/(TR.tTotal||1)))))); G.labels.push(['УСПЕЛ! 08:'+mm,W/2,SA.t+18,13,P.edge]); }};
CUTS.late={len:8,start:c=>{ SFX.alarm(); },draw:(t,c)=>{ office(t); const bx=W*.62, y=H*.7; spr(HERO_SPECS.baba,'idle',0,'angry',bx,y+4,true,1.2); ctx.fillStyle=P.ink; ctx.fillRect(bx+20,H*.18,30,30); ctx.fillStyle='#fff'; ctx.fillRect(bx+22,H*.18+2,26,26); ctx.fillStyle=P.ink; ctx.fillRect(bx+34,H*.18+6,2,10); ctx.fillRect(bx+34,H*.18+14,8,2);
  const hx=t<4?W*.05+t/4*(bx-60-W*.05):bx-60; spr(HERO_SPECS[heroId],t<4?'walk':'hurt',Math.floor(t*6)%8,'o',hx,y+4,false,1.1); if(t<4) G.labels.push(['на цыпочках…',hx,y-70,7,'#fff']);
  if(t>4.5){ ctx.fillStyle='#fff'; ctx.fillRect(bx-34,y-46,18,22); ctx.fillStyle=P.ink; for(let i=0;i<4;i++) ctx.fillRect(bx-31,y-42+i*4,12,1); G.labels.push(['ОБЪЯСНИТЕЛЬНАЯ',bx-25,y-56,7,P.red]); }
  G.labels.push(['09:0'+Math.min(9,Math.floor(t)),W/2,SA.t+18,14,'#ff6a6a']); sub(t<4?'Опоздал. Может, никто не заметит?':'Начальница заметила. Бланк уже распечатан.'); }};
// витрина: после всех хуков, кнопка «ПРОПУСТИТЬ» есть у всех катсцен (drawCut)
