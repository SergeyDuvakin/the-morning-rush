// M5: дни недели, новости с эффектом, задания дня, выходные, голоса/музыка, интерьеры транспорта. Подключается после end4.js.
// ---------- M5-1: новость дня меняет ровно 1 совместимый параметр пула ----------
// fx: no — убрать событие из пула; force — гарантировать событие сегмента; on/off — опция метро; crowd — множитель толпы; t — секунды к бюджету; x2 — самокаты ×2; fast — очередь в кофейне быстрее; pies — бафф в электричке; task2 — задание ×2
const NEWS5=[
  {t:'Голуби Москвы объявили забастовку крошек',fx:'no',k:'pigeons'},
  {t:'На МЦК и МЦД раздают пирожки',fx:'pies',need:u=>u('mcd')||u('mck')},
  {t:'Самокаты вышли на тропу войны',fx:'x2',k:'scooters'},
  {t:'Эскалатор на Курочкинской чинят — все по лестнице',fx:'on',k:'stairs'},
  {t:'Промоутеры ушли на тимбилдинг',fx:'no',k:'promoter'},
  {t:'Кофейни у метро ввели тариф «на бегу»',fx:'fast',k:'coffee'},
  {t:'Контролёры МЦД проводят «день открытых валидаторов»',fx:'no',k:'controllers'},
  {t:'Синоптики: дождь пойдёт ровно когда выйдешь из метро',fx:'on',k:'rain'},
  {t:'Метро пустило дополнительные поезда',fx:'crowd',m:.85},
  {t:'Пробки на эскалаторе — 7 баллов',fx:'crowd',m:1.15},
  {t:'Музыканты в переходах дают бесплатный концерт',fx:'on',k:'musician'},
  {t:'Ларьки в переходах закрыты на санобработку',fx:'off',k:'kiosk'},
  {t:'Курьеры получили бонус за скорость',fx:'force',k:'couriers'},
  {t:'В лифте БЦ застрял квартальный отчёт — лифты стоят',fx:'no',k:'lift',need:u=>u('lift')&&u('stairs14')},
  {t:'Светофоры перевели на «зелёную волну»',fx:'no',k:'light'},
  {t:'Шпиц с поводком перекрыл переход на 40 секунд',fx:'force',k:'light'},
  {t:'Учёные: опоздание на 5 минут продлевает жизнь на 5 минут',fx:'t',s:5},
  {t:'Метро тестирует короткие поезда',fx:'on',k:'short'},
  {t:'Будильник признан главным врагом года',fx:'t',s:-4},
  {t:'Начальник сегодня в хорошем настроении',fx:'task2'} ];
NEWS4.length=0; for(const n of NEWS5) NEWS4.push(n.t);
const NEWS5_METRO={stairs:1,rain:1,musician:1,kiosk:1,short:1};
function news5Ok(n,u){ if(n.need) return !!n.need(u); if(!n.k||NEWS5_METRO[n.k]) return true; return !!u(n.k); }
// индекс новости дня: детерминирован по сиду, только из совместимых с открытым
function newsIdx5(day,u){ u=u||unl4; const ok=[]; for(let i=0;i<NEWS5.length;i++) if(news5Ok(NEWS5[i],u)) ok.push(i); return ok.length?ok[(day.news|0)%ok.length]:-1; }
function dayNews5(day,u){ const i=newsIdx5(day,u); return i<0?null:NEWS5[i]; }
// гарантировать событие сегмента (пересобрать его зоны)
function news5Force(plan,day,idx,k,unl){ const g=plan.segs.find(s=>SEG4[s.id]&&SEG4[s.id].ev&&SEG4[s.id].ev.includes(k)); if(!g||g.locked||!g.play||!unl(k)||g.events.some(e=>e.k===k)||typeof streetZones!=='function') return false;
  if(g.events.length) g.events[g.events.length-1]={k,v:0}; else g.events.push({k,v:0});
  const old=plan.zones.filter(q=>q.k==='street'&&q.seg===g.id&&!q.bcFront); if(!old.length) return false; const at=plan.zones.indexOf(old[0]);
  const nz=streetZones(g,day,idx); for(const q of nz){ q.weather=old[0].weather; q.crowdK=old[0].crowdK; } if(old[0].fork) nz[0].fork=old[0].fork;
  if(plan.zones.some(q=>q.bcFront)) nz[nz.length-1].last=false;
  plan.zones=plan.zones.filter(q=>!old.includes(q)); plan.zones.splice(at,0,...nz); return true; }
{ const _pr=planRoute; planRoute=function(day,idx,env){ env=env||{}; const unl=env.unl||(()=>false); const N=unl('news')&&day.type!=='weekend'?dayNews5(day,unl):null;
    if(!N) return _pr(day,idx,env);
    let plan; const _stT=stationTrip, e2=Object.assign({},env);
    if(N.fx==='no') e2.unl=k=>k===N.k?false:unl(k);
    if(N.fx==='on'||N.fx==='off'){ stationTrip=function(i,has){ return _stT(i,k=>k===N.k?N.fx==='on':has(k)); }; }
    try{ plan=_pr(day,idx,e2); } finally { stationTrip=_stT; }
    plan.news=NEWS5.indexOf(N); plan.newsFx=N.fx; plan.newsApplied=true;
    if(N.fx==='force') plan.newsApplied=news5Force(plan,day,idx,N.k,unl)||plan.segs.some(s=>s.events.some(e=>e.k===N.k));
    if(N.fx==='crowd'){ for(const q of plan.zones){ if(q.seg!=='metro') continue; if(q.crowd) q.crowd=Math.max(3,Math.round(q.crowd*N.m)); if(q.k==='gate'){ q.qmin=Math.max(1,Math.round(q.qmin*N.m)); q.qmax=Math.max(q.qmin+1,Math.round(q.qmax*N.m)); } } plan.crowdK=+(plan.crowdK*N.m).toFixed(2); }
    if(N.fx==='t'){ plan.total+=N.s; plan.newsT=N.s; }
    for(const q of plan.zones){ if(N.fx==='x2'&&q.ev==='scooters') q.x2=1; if(N.fx==='fast'&&q.ev==='coffee') q.fast=1; if(N.fx==='pies'&&q.k==='mtrain') q.pies=1; }
    return plan; }; }
// эффекты на зонах
{ const C=SEV.coffee, ci=C.init; C.init=function(z,r){ ci.apply(this,arguments); if(z.fast){ z.per*=.6; z.wait=Math.round(z.qn*z.per+1); tev('news_fast'); } };
  const S=SEV.scooters, si=S.init; S.init=function(z,r){ si.apply(this,arguments); if(z.x2){ z.scW*=2; z.v=1; tev('news_x2'); } };
  const T=ZONES.mtrain, ti=T.init; T.init=function(z){ ti.apply(this,arguments); if(z.pies&&!TR.pieGot&&TR.mode==='trip'){ TR.pieGot=1; TR.coffeeT=Math.max(TR.coffeeT||0,20); TR.pieT=20; tev('news_pie'); say('Пирожок с капустой! Бодрость ×1.15 на 20 с',2,'#ffd98a'); } }; }
// HUD бафа: пирожок вместо стаканчика, если бодрость от пирожка
{ const _ch=m4CupHud; m4CupHud=function(){ if(!(TR.pieT>0)) return _ch(); const x=SA.l+10, y=SA.t+50, s=Math.ceil(TR.coffeeT); ctx.fillStyle='rgba(10,6,20,.55)'; ctx.fillRect(x-3,y-3,48,16);
    ctx.fillStyle=P.ink; ctx.fillRect(x-1,y+2,12,7); ctx.fillStyle='#d8963a'; ctx.fillRect(x,y+3,10,5); ctx.fillStyle='#f0c070'; ctx.fillRect(x+1,y+3,8,2); ctx.fillStyle='#a86a2a'; ctx.fillRect(x+3,y+5,1,1); ctx.fillRect(x+6,y+5,1,1);
    G.labels.push(['×1.15 '+s+'с',x+14,y+5,7,'#ffd98a','left',P.ink]); };
  const _tu=tripUpdate; tripUpdate=function(dt){ _tu(dt); if(TR.pieT>0&&!TR.smod) TR.pieT=Math.max(0,TR.pieT-dt); if(!(TR.coffeeT>0)) TR.pieT=0; };
  const _st=startTrip; startTrip=function(...a){ TR.pieT=0; TR.pieGot=0; return _st(...a); }; __trip.startTrip=startTrip; }
// ---------- M5-2: задание дня — только совместимое с планом; награда монеты + очки + счётчик коллекции ----------
const TASKS5=[
  {id:'coffee',n:'купи кофе начальнику',ok:()=>!!TR.coffee,need:p=>p.zones.some(q=>q.ev==='coffee')},
  {id:'nopush',n:'никого не толкни',ok:()=>!(TR.ev&&TR.ev.shove)},
  {id:'phone',n:'заряди телефон до 100%',ok:()=>!!TR.phone100,need:p=>p.zones.some(q=>q.k==='mtrain')},
  {id:'hare',n:'проедь зайцем и не попадись',ok:()=>!!TR.hare&&!TR.caught,need:p=>p.zones.some(q=>q.k==='mtrain'||q.k==='mgate')}];
const TASK_PTS=20;
function pickTask5(day,plan){ if(!plan||plan.soft) return null; const L=TASKS4.concat(TASKS5).filter(t=>!t.need||t.need(plan)); return L[((day.task|0)+((day.seed>>>7)%97))%L.length]; }
{ const _sd=startDay; startDay=function(idx,opts){ const plan=_sd(idx,opts); TR.task=pickTask5(TR.day,plan); TR.taskX=plan.newsFx==='task2'?2:1; TR.taskSaid=0; TR.taskOk=false; TR.taskCoins=0; return plan; };
  const _tu=tripUpdate; tripUpdate=function(dt){ _tu(dt); if(TR.mode==='trip'&&TR.task&&!TR.taskSaid&&!TR.done&&!TR.smod&&TR.fade<=0&&G.t>1){ TR.taskSaid=1; say('Задание дня: '+TR.task.n+(TR.taskX>1?' (×2 — начальник добрый)':''),2.4,'#9ad8ff'); } };
  const _tf=tripFinish; tripFinish=function(win,reason){ const pre=!TR.done&&TR.mode==='trip'&&TR.day&&win&&TR.task&&TR.task.ok(); if(pre){ TR.score=(TR.score||0)+TASK_PTS; }
    _tf(win,reason); if(pre&&TR.taskOk){ const x=(TR.taskX||1); if(x>1){ wallet().coins+=TASK_COINS*(x-1); TR.coinsGot+=TASK_COINS*(x-1); } TR.taskCoins=TASK_COINS*x; save.tasksDone=save.tasksDone||{}; save.tasksDone[TR.task.id]=(save.tasksDone[TR.task.id]||0)+1; store(); } }; }
// ---------- M5-3: выходные (СБ «Будильник врёт» / ВС «Завтра понедельник…») ----------
// день: улица-1 (пусто, без событий) → турникет → эскалатор с табло «СУББОТА» → кат «…СУББОТА?!» + 2 карточки (3-я — «ОБРАТНО СПАТЬ», если не выбрал) → забег по выбору → своя концовка
const WK5={ mega:{t:'МЕГАХИМКИ',sub:'тележки, касса, парковка',sun:'возврат товара, касса',icon:'cart',col:'#e8562a',bud:80},
  dacha:{t:'НА ДАЧУ',sub:'МЦД с рассадой, шашлык',sun:'с бабушкой и рассадой',icon:'sprout',col:'#3a9a4a',bud:80},
  nastya:{t:'С НАСТЕЙ',sub:'парк, кофе вдвоём, селфи',sun:'парк, кофе вдвоём, селфи',icon:'heart',col:'#e04a8a',bud:75},
  sleep:{t:'ОБРАТНО СПАТЬ',bud:0} };
const WK5_FUN=['mega','dacha','nastya'];
function wk5Pair(day){ const drop=(day.seed>>>3)%3; return WK5_FUN.filter((k,i)=>i!==drop); }
{ const _pr=planRoute; planRoute=function(day,idx,env){ const plan=_pr(day,idx,env); if(day.type!=='weekend') return plan;
    const sun=day.weekday===6, pre=plan.zones.filter(q=>q.seg==='street1'), met=plan.zones.filter(q=>q.seg==='metro');
    for(const q of pre){ q.ev=null; q.v=0; q.wend=1; } if(pre.length>1) pre.splice(1); if(pre.length){ pre[0].last=true; delete pre[0].fork; }
    const gi=met.findIndex(q=>q.k==='gate'), gate=gi>=0?met[gi]:null, esc=met.slice(gi+1).find(q=>q.k==='esc'); const out=[...pre];
    if(gate){ Object.assign(gate,{qmin:1,qmax:2,turnboss:false,detector:false,wend:1}); out.push(gate); }
    if(esc){ Object.assign(esc,{mode:'up',wboard:sun?'ВОСКРЕСЕНЬЕ':'СУББОТА',wend:1}); if(esc.crowd) esc.crowd=Math.max(3,Math.round(esc.crowd*.5)); out.push(esc); } else if(gate) gate.wboard=sun?'ВОСКРЕСЕНЬЕ':'СУББОТА';
    out.push({k:'wpick',seg:'metro',d:idx,seed:day.seed,sun,pair:wk5Pair(day),last:true});
    plan.zones=out; plan.total=Math.round(40+(gate?10:0)+(esc?8:0)); plan.wk=1; plan.expect=plan.total+Math.round((WK5.mega.bud+WK5.dacha.bud+WK5.nastya.bud)/3); plan.target=plan.total; return plan; }; }
// табло «СУББОТА» на эскалаторе/у турникетов — мигает
function wk5Board(z){ const s=z.wboard; if(!s) return; const w=Math.max(84,Math.ceil(txtW(s,10))+20), x=Math.round(W*.5-w/2), y=Math.round(SA.t+40), on=Math.floor(G.t*2.5)%2===0;
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,22); ctx.fillStyle='#1a1424'; ctx.fillRect(x,y,w,18); ctx.fillStyle='#3a3048'; ctx.fillRect(x+2,y+2,w-4,1);
  ctx.fillStyle=P.ink; ctx.fillRect(x+8,y-10,2,8); ctx.fillRect(x+w-10,y-10,2,8); if(on) G.labels.push([s,W/2,y+10,10,'#ffb42a','center',null]); else G.labels.push([s,W/2,y+10,10,'#5a4020','center',null]); }
for(const k of ['esc','gate']){ const Z=ZONES[k], d0=Z.draw; Z.draw=function(z){ d0.apply(this,arguments); if(z.wboard) wk5Board(z); }; }
// пустая улица выходного: людей втрое меньше
{ const S=ZONES.street, i0=S.init; S.init=function(z){ i0.apply(this,arguments); if(z.wend){ let n=0; z.npcs=z.npcs.filter(e=>e.ctl||e.q||(n++%3===0)); tev('wk_empty'); } }; }
// зона выбора: кат «…СУББОТА?!» (лампочка, «пиу-пиу») → 2 карточки; 9 с без выбора — ОБРАТНО СПАТЬ
ZONES.wpick={ title:z=>z.sun?'ВОСКРЕСЕНЬЕ?!':'СУББОТА?!', tip:z=>'выбери, как провести выходной',
  init(z){ z.len=W; z.lockHero=true; z.noStick=1; z.noAct=1; z.ph=0; const h=G.hero; h.x=Math.round(W*.42); h.y=Math.round(Math.min(z.y1+8,H*.8))-14; h.face=1; h.set('idle'); tev('wk_reveal'+(z.sun?'_sun':'')); },
  update(z,dt){ const h=G.hero; G.cam=0; h.x=Math.round(W*.42); h.set('idle'); if(z.ph===0&&z.t>.5){ z.ph=1; wk5Piu(z.sun); } if(z.ph===1&&z.t>2.3){ z.ph=2; this.ask(z); h.hide=true; /* ревью: макушка героя торчала из-под карточек; вернётся в nextZone */ } },
  ask(z){ const P2=z.pair, go=k=>()=>wk5Go(z,k);
    st4Modal({id:'wkpick',wk:1,title:z.sun?'ВОСКРЕСЕНЬЕ. ЧЕМ ЗАЙМЁМСЯ?':'СУББОТА! ЧЕМ ЗАЙМЁМСЯ?',cards:P2.map(k=>({k,t:WK5[k].t,sub:z.sun?WK5[k].sun:WK5[k].sub,icon:WK5[k].icon,col:WK5[k].col})),auto:9,onAuto:()=>wk5Go(z,'sleep'),opts:P2.map(k=>[WK5[k].t,WK5[k].col,go(k)])}); },
  ctx(z){ return {}; }, goal(z){ return z.sun?'Воскресенье… а ты в метро':'Стоп. Сегодня же суббота…'; }, prog(z){ return z.t*10; }, unstick(z){ if(!TR.smod&&z.ph<2){ z.ph=2; this.ask(z); } },
  bot(z){ const h=G.hero; if(TR.smod&&TR.smod.id==='wkpick'){ const want=window.__wkPick; if(want==='sleep') return {x:h.x,y:h.y}; return (want&&z.pair[1]===want)?{b:1}:{a:1}; } return {x:h.x,y:h.y}; },
  draw(z){ G.cam=0; const fy=Math.round(Math.min(z.y1+8,H*.8)); wk5Vestibule(fy,z.sun); drawTripActors([G.hero]); const h=G.hero, hx=Math.round(h.x), hy=Math.round(h.y);
    if(z.t>.5){ const by=hy-62+Math.round(Math.sin(G.t*5)); const L=(a,b2,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(hx+a,by+b2,w,h); }; L(-6,-1,13,1,P.ink); L(-8,0,17,11,P.ink); L(-6,11,13,3,P.ink); L(-7,1,15,9,'#ffe85a'); L(-5,0,11,1,'#ffe85a'); L(-5,1,4,4,'#fff8c0'); L(-5,11,11,2,'#ffd23f'); L(-4,14,9,5,P.ink); L(-3,14,7,1,'#a8a8b8'); L(-3,16,7,1,'#a8a8b8'); L(-2,19,5,1,P.ink);
      if(Math.floor(z.t*6)%2){ L(-14,4,4,1,'#ffe85a'); L(11,4,4,1,'#ffe85a'); L(0,-7,1,4,'#ffe85a'); L(-11,-4,2,2,'#ffe85a'); L(10,-4,2,2,'#ffe85a'); } }
    if(z.t>.9&&!TR.smod){ const s=z.sun?'…ВОСКРЕСЕНЬЕ?!':'…СУББОТА?!'; G.labels.push([s,W/2,Math.round(Math.max(SA.t+64,hy-104)),16,z.sun?'#9ab0ff':'#ffd23f','center',P.ink]); if(z.sun&&z.t>1.6) G.labels.push(['Завтра понедельник…',W/2,Math.round(Math.max(SA.t+84,hy-84)),8,'#cfd6ff','center',P.ink]); } } };
// вестибюль наверху эскалатора: стена, табло, турникеты вдали, пол
function wk5Vestibule(fy,sun){ const sky=sun?'#6a7ab0':'#8ac0e8'; ctx.fillStyle='#d8d0e0'; ctx.fillRect(0,0,W,fy); ctx.fillStyle='#c4bccc'; for(let x=0;x<W;x+=32) ctx.fillRect(x,0,1,fy); ctx.fillStyle=P.ink; ctx.fillRect(0,SA.t+26,W,2);
  // окна-выход с утренним светом
  for(let x=Math.round(W*.08);x<W-60;x+=Math.round(W*.28)){ const wy=Math.round(fy-118), wh=Math.max(40,Math.round(fy-wy-48)); ctx.fillStyle=P.ink; ctx.fillRect(x-1,wy-1,52,wh+2); ctx.fillStyle=sky; ctx.fillRect(x,wy,50,wh); ctx.fillStyle='#ffffff55'; ctx.fillRect(x+4,wy+3,10,wh-6); ctx.fillStyle=P.ink; ctx.fillRect(x+24,wy,2,wh); }
  // табло
  const s=sun?'ВОСКРЕСЕНЬЕ':'СУББОТА', w=Math.ceil(txtW(s,10))+24, bx=Math.round(W*.74-w/2), by=Math.round(Math.max(SA.t+40,fy-150)); ctx.fillStyle=P.ink; ctx.fillRect(bx-2,by-2,w+4,22); ctx.fillStyle='#1a1424'; ctx.fillRect(bx,by,w,18); G.labels.push([s,bx+w/2,by+10,10,Math.floor(G.t*2.5)%2?'#ffb42a':'#7a5020','center',null]);
  // пол
  ctx.fillStyle=P.ink; ctx.fillRect(0,fy-40,W,2); ctx.fillStyle='#8a8296'; ctx.fillRect(0,fy-38,W,H-fy+38); ctx.fillStyle='#7a7286'; for(let x=0;x<W;x+=40) ctx.fillRect(x,fy-38,1,H); for(let y=fy-24;y<H;y+=16) ctx.fillRect(0,y,W,1);
  // выход с эскалатора слева: гребёнка, поручни-балюстрады
  const ex=Math.round(SA.l+W*.06), ew=Math.round(W*.16); ctx.fillStyle=P.ink; ctx.fillRect(ex-1,fy-37,ew+2,H); ctx.fillStyle='#4a4656'; ctx.fillRect(ex,fy-36,ew,H); ctx.fillStyle='#ffd23f'; ctx.fillRect(ex,fy-36,ew,2); ctx.fillStyle='#3a3646'; for(let y=fy-30;y<H;y+=6) ctx.fillRect(ex,y,ew,1);
  for(const bx of [ex-8,ex+ew+2]){ ctx.fillStyle=P.ink; ctx.fillRect(bx-1,fy-58,8,H); ctx.fillStyle='#b8b0c4'; ctx.fillRect(bx,fy-57,6,H); ctx.fillStyle='#1a1424'; ctx.fillRect(bx-1,fy-61,8,5); }
  // турникеты справа
  for(let i=0;i<3;i++){ const tx=Math.round(W*.64)+i*26; if(tx+14>W-SA.r-60) break; ctx.fillStyle=P.ink; ctx.fillRect(tx-1,fy-58,14,20); ctx.fillStyle='#c8ccd8'; ctx.fillRect(tx,fy-57,12,18); ctx.fillStyle=i%2?'#e04a4a':'#3ad06a'; ctx.fillRect(tx+4,fy-55,4,3); } }
function wk5Piu(sun){ try{ AUD&&AUD.init&&AUD.init(); }catch(e){} try{ if(sun){ tone(392,.25,'triangle',.06); setTimeout(()=>tone(330,.3,'triangle',.06),260); setTimeout(()=>tone(262,.5,'triangle',.06),560); } else { tone(880,.09,'square',.05); setTimeout(()=>tone(1320,.12,'square',.05),110); } }catch(e){} }
function wk5Go(z,k){ if(TR.wk) return; TR.wk={c:k,sun:!!z.sun}; tev('wk_'+k); const add=wk5Zones(k,z); if(add.length){ z.last=false; TR.zones.splice(TR.zi+1,0,...add); } const b=WK5[k].bud; TR.tLeft+=b; TR.tTotal+=b; TR.wkClock=1; if(k==='sleep') bubble(G.hero,'…ну его. Спать.',1.4,'#fff'); zoneDone(); }
function wk5Zones(k,z){ return (WK5Z[k]||(()=>[]))(z); } const WK5Z={};
{ const _st=startTrip; startTrip=function(...a){ TR.wk=null; TR.wkClock=0; return _st(...a); }; __trip.startTrip=startTrip; }
// карточки выбора: иконки свои, подпись снизу — «ОБРАТНО СПАТЬ»
{ const _dc=st4DrawCards; st4DrawCards=function(m){ if(!m.wk) return _dc(m); const keep=G.labels.filter(l=>l[2]<SA.t+34); G.labels.length=0; G.labels.push(...keep); buttons.length=0; ctx.fillStyle='rgba(10,6,20,.55)'; ctx.fillRect(0,0,W,H);
    const cw=Math.min(170,Math.floor((W-60)/2)), ch=Math.min(132,H-SA.t-SA.b-96), gap=14, x0=Math.round(W/2-cw-gap/2), y=Math.round(Math.max(SA.t+56,H/2-ch/2+4));
    G.labels.push([m.title,W/2,y-14,11,'#ffe14a','center',P.ink]);
    m.cards.forEach((c,i)=>{ const x=x0+i*(cw+gap); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,cw+4,ch+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,cw,ch); ctx.fillStyle=c.col; ctx.fillRect(x,y,cw,22);
      G.labels.push([c.t,x+cw/2,y+11,9,'#fff','center',P.ink]); wk5Icon(c.icon,x+cw/2,y+50); wrapW(c.sub,cw-16,7).forEach((s,k)=>G.labels.push([s,x+cw/2,y+84+k*11,7,'#5a4a6a','center',null]));
      if(m.t>.35) buttons.push({x,y,w:cw,h:ch,id:'wk'+i,cb:()=>{ if(TR.smod!==m) return; TR.smod=null; m.opts[i][2](); SFX.ui(); }}); });
    G.labels.push(['не выберешь за '+Math.max(0,Math.ceil(m.auto-m.t))+' с — ОБРАТНО СПАТЬ',W/2,y+ch+14,7,'#bbb','center',P.ink]); }; }
function wk5Icon(k,cx,cy){ cx=Math.round(cx); cy=Math.round(cy); const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a,cy+b,w,h); };
  if(k==='cart'){ f(-14,-12,3,2,P.ink); f(-12,-11,26,2,P.ink); f(-11,-9,24,14,P.ink); f(-10,-8,22,12,'#c8ccd8'); for(let i=-8;i<12;i+=5) f(i,-8,1,12,'#8a90a0'); f(-10,-3,22,1,'#8a90a0'); f(-6,-14,6,7,P.ink); f(-5,-13,4,6,'#e8562a'); f(1,-12,6,5,P.ink); f(2,-11,4,4,'#4ab04a'); f(-9,7,5,5,P.ink); f(6,7,5,5,P.ink); f(-8,8,3,3,'#5a5a6a'); f(7,8,3,3,'#5a5a6a'); }
  else if(k==='sprout'){ f(-11,2,22,12,P.ink); f(-10,3,20,10,'#a8643a'); f(-10,3,20,2,'#c8845a'); f(-1,-12,2,15,P.ink); f(0,-11,1,14,'#3a8a3a'); f(-10,-12,10,7,P.ink); f(-9,-11,8,5,'#5ac85a'); f(1,-16,10,7,P.ink); f(2,-15,8,5,'#5ac85a'); f(-7,-10,4,1,'#8ae88a'); f(4,-14,4,1,'#8ae88a'); }
  else if(k==='heart'){ f(-11,-9,9,8,P.ink); f(2,-9,9,8,P.ink); f(-12,-5,24,7,P.ink); f(-9,2,18,4,P.ink); f(-6,6,12,3,P.ink); f(-3,9,6,2,P.ink); f(-10,-8,7,6,'#ff5a8a'); f(3,-8,7,6,'#ff5a8a'); f(-11,-4,22,5,'#ff5a8a'); f(-8,1,16,4,'#ff5a8a'); f(-5,5,10,3,'#ff5a8a'); f(-2,8,4,2,'#ff5a8a'); f(-8,-7,3,2,'#ffc0d4'); } }
// ---------- концовки выходного (END 7…10): ЛЕГЕНДА / парковка МЕГАХИМКИ / шашлык на даче / селфи у фонтана ----------
function w5Begin(){ const k=Math.max(1,Math.floor(H/120)), SW=Math.ceil(W/k), SH=Math.ceil(H/k); E4={k,SW,SH,BY:Math.round(SH*.56),FY:Math.round(SH*.87),dx:Math.round(SW*.55)}; ctx.save(); ctx.scale(k,k); return E4; }
const W5SUN=()=>!!(TR&&TR.wk&&TR.wk.sun)||window.__wkSun===1;
function w5Sleep(t,S){ const g=w5Begin(), {SW,SH}=g, FY=Math.round(SH*.8), sun=W5SUN();
  e4r('#e8c8a0',0,0,SW,SH); e4r('#d8b890',0,0,SW,6); for(let x=6;x<SW;x+=14) e4r('#dcbc94',x,6,6,FY-6); e4r(P.ink,0,FY,SW,1); e4r('#8a5a3a',0,FY+1,SW,SH-FY); for(let x=0;x<SW;x+=22) e4r('#7a4a2e',x,FY+1,1,SH); e4r('#9a6a48',0,FY+1,SW,2);
  // окно с утренним солнцем и шторами
  const wx=Math.round(SW*.12), wy=Math.round(SH*.14), ww=Math.round(SW*.22), wh=Math.round(SH*.38); e4r(P.ink,wx-2,wy-2,ww+4,wh+4); e4r(sun?'#a8b8e0':'#9fd0f0',wx,wy,ww,wh); e4r('#ffe9a8',wx+ww-12,wy+5,8,8); e4r('#fff6d0',wx+ww-11,wy+6,6,6); e4r('#7186a6',wx,wy+wh-10,ww,10); e4r('#8d9fbc',wx+5,wy+wh-16,8,16); e4r('#8d9fbc',wx+ww-20,wy+wh-13,7,13); e4r(P.ink,wx+Math.round(ww/2)-1,wy,2,wh);
  e4r(P.ink,wx-8,wy-5,ww+16,2); e4r('#c84a5a',wx-6,wy-3,8,wh+10); e4r('#c84a5a',wx+ww-2,wy-3,8,wh+10); e4r('#e06a7a',wx-5,wy-3,2,wh+10); e4r('#e06a7a',wx+ww-1,wy-3,2,wh+10);
  e4r('rgba(255,240,180,.22)',wx+4,FY-24,ww+10,24); // луч солнца на полу
  // кровать
  const bx=Math.round(SW*.5), bw=Math.min(110,Math.round(SW*.42)), by=FY-14; e4r(P.ink,bx-2,by-30,6,44); e4r('#a8784a',bx-1,by-29,4,42); e4r(P.ink,bx+bw-3,by-14,5,28); e4r('#a8784a',bx+bw-2,by-13,3,26);
  e4r(P.ink,bx,by-6,bw,16); e4r('#f4f0ea',bx+1,by-5,bw-2,6); e4r('#7a5232',bx+1,by+1,bw-2,8); e4r(P.ink,bx+4,by-13,24,9); e4r('#ffffff',bx+5,by-12,22,7); e4r('#e6e2ea',bx+5,by-7,22,2);
  spr(S,'idle',0,'norm',bx+46,by-9,false,1,-1.5708); // герой лежит, голова на подушке
  e4r(P.ink,bx+22,by-18,bw-24,18); e4r('#4a7ad8',bx+23,by-17,bw-26,16); e4r('#6a9aff',bx+23,by-17,bw-26,2); e4r('#3a5ab8',bx+23,by-3,bw-26,2); for(let x=bx+32;x<bx+bw-4;x+=10) e4r('#3a5ab8',x,by-14,2,8); e4r(P.ink,bx+22,by-18,1,16); // одеяло
  // тумбочка с будильником
  const tx=bx-24; e4r(P.ink,tx-1,FY-21,20,21); e4r('#a8784a',tx,FY-20,18,20); e4r('#7a5232',tx+2,FY-12,14,1); const sh=t<2.2?Math.round(Math.sin(t*40)):0; e4r(P.ink,tx+3+sh,FY-31,12,11); e4r('#e8e2ea',tx+4+sh,FY-30,10,9); e4r(P.ink,tx+8+sh,FY-28,1,4); e4r(P.ink,tx+8+sh,FY-25,3,1); e4r(P.ink,tx+3+sh,FY-33,3,2); e4r(P.ink,tx+12+sh,FY-33,3,2);
  if(t<2.2&&Math.floor(t*8)%2) E4L('ДЗЫНЬ',tx+9,FY-40,7,'#ffd23f');
  for(let i=0;i<3;i++){ const k=(t*.8+i*.33)%1; if(t>2.2) E4L('z',bx+16+i*6+k*10,by-26-k*22,6+i*2,'#cfe0ff'); }
  if(t>3){ const dy=Math.min(0,-30+(t-3)*60), px=Math.round(bx+bw/2+14), py=Math.round(SH*.2+dy); e4r(P.ink,px-34,py-1,68,18); e4r('#d8a83a',px-33,py,66,16); e4r('#ffd86a',px-33,py,66,2); e4r('#a87a2a',px-33,py+14,66,2); e4r(P.ink,px-20,py-8,1,7); e4r(P.ink,px+19,py-8,1,7); e4r(P.ink,px-21,py-9,42,1); E4L('ЛЕГЕНДА',px,py+8,9,'#5a3a10',null); }
  e4End(); sub(t<2.2?(sun?'Воскресенье. Будильник зачем-то верит в понедельник.':'Будильник врёт. Сегодня суббота.'):t<5?'Ты выключил будильник одним точным ударом.':(sun?'Завтра понедельник. А сегодня — подушка.':'Обратно спать. Это и есть настоящий выходной.')); }
END.push(['ЛЕГЕНДА',8,w5Sleep,'wk']);
const W5END={sleep:END.length-1};
{ const T=CUTS.tripwin, _s=T.start, _d=T.draw; T.start=function(c){ _s(c); if(TR&&TR.wk&&window.__endV===undefined&&W5END[TR.wk.c]!==undefined){ c.v=W5END[TR.wk.c]; c.len=END[c.v][1]; if(CUT) CUT.len=c.len; } };
  T.draw=function(t,c){ const E=END[c.v]; if(E&&E[3]==='wk'){ E[2](t,heroSpec(heroId)); const sun=W5SUN(), hh=(TR&&TR.wkClock)?Math.min(12,10+Math.floor(2*(1-Math.max(0,TR.tLeft)/Math.max(1,TR.tTotal)))):10; G.labels.push([(sun?'ВОСКРЕСЕНЬЕ':'СУББОТА')+' · ВЫХОДНОЙ!',W/2,SA.t+18,13,'#ffd23f']); return; } return _d(t,c); }; }

{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='wpick') return ZONES.wpick.goal(z); return _gt(z); }; }
// ---------- M5-3b: МЕГАХИМКИ — фан-забег по гипермаркету: тележки навстречу, мама с коляской, 3 кассы с очередями (ВС — «ВОЗВРАТ ТОВАРА»), выход к парковке ----------
const MEGA_C={wall:'#f2ece0',wallSh:'#e0d8c8',floor:'#d8dce4',floorSh:'#c4c8d4',tile:'#b8bcc8',shelf:'#8a96a8',shelfSh:'#6a7688',red:'#e8562a',yel:'#ffd23f'};
WK5Z.mega=z=>[{k:'mega',seg:'wk',d:z.d,seed:(z.seed^0x3e6a)>>>0,sun:z.sun,last:true}];
ZONES.mega={ title:z=>z.sun?'МЕГАХИМКИ · ВОЗВРАТ ТОВАРА':'МЕГАХИМКИ · СУББОТА', tip:z=>'обходи тележки, у касс выбирай очередь покороче',
  init(z){ const r=mulberry32(z.seed); z.len=Math.max(2700,Math.round(W*3.1)); /* M5-11: выходной 1.5–3 мин — длиннее торговый зал */ z.K=z.len-230; const y0=z.y0, y1=z.y1; z.ly=[y0+7,Math.round((y0+y1)/2),y1-7]; z.ky=[y0+5,y1-5];
    z.carts=[]; z.cT=1.2; z.bump=0; z.paid=0; z.payT=0; z.kq=[]; z.rng=r; z.noSign=1;
    const nq=z.sun?[3,4]:[1+Math.floor(r()*4),1+Math.floor(r()*4)]; if(!z.sun&&nq[0]===nq[1]) nq[Math.floor(r()*2)]+=2;
    for(let i=0;i<2;i++){ const q=[]; for(let j=0;j<nq[i];j++){ const e=mkNpc(pick(['aunt','polite','tourist','bag','granny']),z.K-16-j*17,z.ky[i]); e.ctl=1; e.q=1; e.face=1; e.m=40; q.push(e); z.npcs.push(e); } z.kq.push(q); }
    z.per=z.sun?2.0:1.5; z.kT=[0,.7]; z.belts=[0,1].map(i=>({x:z.K,y:z.ky[i]+7,z:0,i,noSolid:true,drawFn:megaBelt})); for(let i=0;i<2;i++){ const cs=mkNpc(i?'aunt':'polite',z.K+44,z.ky[i]-1); cs.ctl=1; cs.face=-1; cs.m=60; cs.cashier=1; z.npcs.push(cs); }
    // мама с коляской — идёт медленно вправо по середине
    const mom=mkNpc('mom',360,z.ly[1]); mom.ctl=1; mom.stroll=1; mom.face=1; mom.m=30; z.npcs.push(mom); z.mom=mom;
    // покупатели у полок (стоят, разглядывают)
    for(let i=0;i<5;i++){ const e=mkNpc(pick(['aunt','polite','student','tourist']),420+i*Math.round((z.K-600)/5)+Math.round(r()*40),z.ly[r()<.5?0:2]); e.ctl=1; e.face=r()<.5?1:-1; e.m=20; e.browse=1; z.npcs.push(e); } },
  lane(y,z){ let b=0; for(let i=1;i<3;i++) if(Math.abs(y-z.ly[i])<Math.abs(y-z.ly[b])) b=i; return b; },
  update(z,dt){ const h=G.hero;
    // мама с коляской
    const m=z.mom; if(m){ if(m.x<z.K-190){ m.x+=18*dt; m.set('walk'); } else { m.y+=(z.y1-1-m.y)*Math.min(1,dt*2); m.set('idle'); m.face=-1; } if(!m.said&&Math.abs(h.x-m.x)<50){ m.said=1; bubble(m,z.sun?'Осторожно, ребёнок спит!':'Проезжайте, мы не спешим!',1.6,'#fff'); } }
    // тележки навстречу
    if(h.x<z.K-120){ z.cT-=dt; if(z.cT<=0){ z.cT=1.6+z.rng()*1.4; const l=Math.floor(z.rng()*3), x=Math.min(z.K-140,G.cam+W+30); if(x>h.x+90){ const s=mkNpc(pick(['aunt','polite','student']),x+22,z.ly[l]); s.ctl=1; s.noSolid=true; s.face=-1; s.pushC=1; z.npcs.push(s); z.carts.push({x,y:z.ly[l],z:0,l,v:52+z.rng()*30,s,noSolid:true,drawFn:megaCart}); } } }
    for(const c of z.carts){ c.x-=c.v*dt; c.s.x=c.x+20; c.s.y=c.y; c.s.set('walk');
      if(!c.hit&&!h.stun&&Math.abs(c.x-h.x)<12&&Math.abs(c.y-h.y)<7){ c.hit=1; z.bump++; tev('mega_cart'); penalize(2,'cart'); h.stun=.4; h.set('hurt'); h.x-=8; pop('ТЕЛЕЖКОЙ ПО НОГЕ! −2 с',h.x,h.y-50,'#ffe14a',8); bubble(c.s,pick(['Ой, простите!','Тормоза не работают!','Она сама!']),1.4,'#fff'); try{ tone(140,.12,'square',.05); }catch(e){} } }
    const gone=z.carts.filter(c=>c.x<G.cam-60); if(gone.length){ z.carts=z.carts.filter(c=>!gone.includes(c)); z.npcs=z.npcs.filter(e=>!gone.some(c=>c.s===e)); }
    // кассы: очередь движется сама; первый уходит направо
    for(let i=0;i<2;i++){ const q=z.kq[i]; z.kT[i]+=dt; if(q.length&&z.kT[i]>=z.per){ z.kT[i]=0; const f=q.shift(); f.leave=1; f.noSolid=true; } q.forEach((e,j)=>{ const tx=z.K-16-j*17; if(e.x<tx) e.x=Math.min(tx,e.x+40*dt); e.set(e.x<tx?'walk':'idle'); }); }
    for(const e of z.npcs) if(e.leave){ e.x+=46*dt; e.set('walk'); } z.npcs=z.npcs.filter(e=>!(e.leave&&e.x>z.len+30));
    // у кассы: держим полосу, ждём своих, пробиваем
    if(h.x>z.K-24&&h.x<z.K+34){ const l=h.y<(z.ky[0]+z.ky[1])/2?0:1; h.y+=(z.ky[l]-h.y)*Math.min(1,dt*10); if(!z.paid){ const blk=z.kq[l].length>0; if(h.x>z.K-4){ h.x=Math.min(h.x,z.K+2); if(!blk){ z.payT+=dt; if(Math.floor(z.payT*4)!==Math.floor((z.payT-dt)*4)) pop('ПИК',z.K+12,z.ky[l]-44,'#7af0a0',7,.5); if(z.payT>(z.sun?2.6:1.4)){ z.paid=1; tev('mega_paid'); pop(z.sun?'ВОЗВРАТ ОФОРМЛЕН':'ОПЛАЧЕНО',h.x,h.y-52,'#7af0a0',8); try{ tone(1200,.06,'square',.04); setTimeout(()=>tone(1500,.08,'square',.04),80); }catch(e){} } } } } }
    else if(h.x>=z.K+34&&!z.paid) h.x=z.K+33;
    if(z.paid&&h.x>z.len-26){ if(!z.park){ z.park=1; tev('mega_exit'); } zoneDone(); } },
  ctx(z){ return {}; }, prog(z){ return G.hero.x+(z.paid?200:0)+z.payT*20; },
  unstick(z){ const h=G.hero; if(h.x<z.K-40){ h.x=Math.min(z.K-40,h.x+80); for(const c of z.carts) if(Math.abs(c.x-h.x)<40) c.x-=60; } else { const l=h.y<(z.ky[0]+z.ky[1])/2?0:1; const q=z.kq[l]; if(q.length){ const f=q.shift(); f.leave=1; f.noSolid=true; } } },
  bot(z){ const h=G.hero; if(h.x>z.K-150&&!z.paid){ const b=z.kq[1].length<z.kq[0].length?1:0; return {x:z.K+10,y:z.ky[b]}; }
    if(z.paid) return {x:z.len,y:h.y};
    const bad=new Set(); for(const c of z.carts) if(c.x>h.x-6&&c.x-h.x<150) bad.add(c.l); if(z.mom&&z.mom.x>h.x-10&&z.mom.x-h.x<70) bad.add(1);
    const hl=this.lane(h.y,z); let tl=hl; if(bad.has(hl)){ const opts=[0,1,2].filter(l=>!bad.has(l)).sort((a,b)=>Math.abs(a-hl)-Math.abs(b-hl)); if(opts.length) tl=opts[0]; } return {x:h.x+60,y:z.ly[tl]}; },
  draw(z){ const c=G.cam, RB=Math.max(SA.t+30,FY0-110);
    ctx.fillStyle='#c8ccd8'; ctx.fillRect(0,0,W,RB); for(let x=-(Math.round(c*.9)%96);x<W+96;x+=96){ ctx.fillStyle=P.ink; ctx.fillRect(x+10,RB-8,60,4); ctx.fillStyle='#fffaf0'; ctx.fillRect(x+11,RB-7,58,2); }
    ctx.fillStyle=P.ink; ctx.fillRect(0,RB,W,2); ctx.fillStyle=MEGA_C.wall; ctx.fillRect(0,RB+2,W,FY0-RB-2);
    // стеллажи с товаром вдоль стены
    const sy=RB+14, sh=FY0-RB-20; for(let x=-(Math.round(c)%120);x<W+120;x+=120){ const wx=x+Math.round(c); if(wx<170||wx>z.K-60) continue; ctx.fillStyle=P.ink; ctx.fillRect(x-1,sy-1,112,sh+2); ctx.fillStyle=MEGA_C.shelf; ctx.fillRect(x,sy,110,sh);
      const rows=Math.max(3,Math.floor(sh/16)); for(let rI=0;rI<rows;rI++){ const ry=sy+4+rI*Math.floor((sh-6)/rows); ctx.fillStyle=MEGA_C.shelfSh; ctx.fillRect(x,ry+10,110,2); const seed=(Math.floor(wx/120)*7+rI*13)%5; const cols=[['#e8562a','#ffd23f'],['#3a8ad8','#ffffff'],['#4ab04a','#e8e2a0'],['#d8346a','#ffc0d4'],['#8a5a3a','#e8c890']][seed];
        for(let k=0;k<11;k++){ const bh=6+((k*5+rI)%4); ctx.fillStyle=P.ink; ctx.fillRect(x+2+k*10,ry+10-bh,8,bh); ctx.fillStyle=cols[k%2]; ctx.fillRect(x+3+k*10,ry+11-bh,6,bh-1); } } }
    // подвесные указатели отделов
    const signs=z.sun?['ВОЗВРАТ →','ЧЕК СОХРАНИЛИ?','АКЦИЯ −50%']:['ХЛЕБ','АКЦИЯ −50%','ТОВАРЫ ДЛЯ ДАЧИ','МОЛОКО']; signs.forEach((s,i)=>{ const wx=300+i*Math.round((z.K-520)/signs.length), x=Math.round(wx-c); if(x<-80||x>W+80) return; const w=Math.ceil(txtW(s,7))+12, y=RB+2; ctx.fillStyle=P.ink; ctx.fillRect(x+w/2-1,RB-6,2,8); ctx.fillRect(x-1,y+4,w+2,13); ctx.fillStyle=s.includes('АКЦИЯ')?MEGA_C.red:'#2a6ad8'; ctx.fillRect(x,y+5,w,11); G.labels.push([s,x+w/2,y+11,7,'#fff','center',null]); });
    // вход: стеклянные автодвери + вывеска
    { const x=Math.round(40-c); if(x>-160){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,RB+12,82,FY0-RB-12); ctx.fillStyle='#9fd0f0'; ctx.fillRect(x,RB+13,80,FY0-RB-14); ctx.fillStyle='#cfeaff'; ctx.fillRect(x+6,RB+16,8,FY0-RB-22); ctx.fillStyle=P.ink; ctx.fillRect(x+39,RB+13,2,FY0-RB-14);
      const w=112, sx=x-16; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,RB-1+(RB<SA.t+40?40:0),w+2,0); } }
    // пол-плитка
    ctx.fillStyle=MEGA_C.floor; ctx.fillRect(0,FY0-4,W,H-FY0+4); ctx.fillStyle=MEGA_C.floorSh; for(let x=-(Math.round(c)%32);x<W;x+=32) ctx.fillRect(x,FY0-4,1,H); for(let y=FY0+8;y<H;y+=12) ctx.fillRect(0,y,W,1); ctx.fillStyle=P.ink; ctx.fillRect(0,FY0-5,W,1);
    { const x=Math.round(z.K+4-c), y=Math.max(SA.t+44,RB+4), s=z.sun?'ВОЗВРАТ ТОВАРА':'КАССЫ'; if(x>-60&&x<W){ const w=Math.ceil(txtW(s,7))+12; ctx.fillStyle=P.ink; ctx.fillRect(x+16-w/2-1,y-1,w+2,13); ctx.fillStyle=MEGA_C.red; ctx.fillRect(x+16-w/2,y,w,11); G.labels.push([s,x+16,y+6,7,'#fff','center',null]); } }
    // выход на парковку
    { const x=Math.round(z.len-60-c); if(x<W+20){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,RB+12,62,FY0-RB-12); ctx.fillStyle='#9fd0f0'; ctx.fillRect(x,RB+13,60,FY0-RB-14); ctx.fillStyle='#7186a6'; ctx.fillRect(x,FY0-26,60,12); ctx.fillStyle=P.ink; ctx.fillRect(x+29,RB+13,2,FY0-RB-14); const px=x+30, py=RB+22; ctx.fillStyle=P.ink; ctx.fillRect(px-8,py-1,16,16); ctx.fillStyle='#2a6ad8'; ctx.fillRect(px-7,py,14,14); G.labels.push(['P',px,py+7,9,'#fff','center',null]); } }
    drawTripActors([G.hero,...z.npcs,...z.carts,...z.belts]);
    // счётчики очередей над кассами
    for(let i=0;i<3;i++){ const x=Math.round(z.K-40-c); if(x<-20||x>W) continue; } } };
function megaCart(c){ const x=Math.round(c.x-G.cam), y=Math.round(c.y); ctx.fillStyle='rgba(10,6,20,.2)'; ctx.fillRect(x-11,y-1,22,3); ctx.fillStyle=P.ink; ctx.fillRect(x-11,y-17,22,13); ctx.fillStyle='#c8ccd8'; ctx.fillRect(x-10,y-16,20,11); ctx.fillStyle='#8a90a0'; for(let i=-8;i<10;i+=4) ctx.fillRect(x+i,y-16,1,11); ctx.fillStyle='#e8562a'; ctx.fillRect(x-7,y-21,6,5); ctx.fillStyle='#4ab04a'; ctx.fillRect(x,y-20,5,4); ctx.fillStyle=P.ink; ctx.fillRect(x+10,y-19,3,2); ctx.fillRect(x-9,y-4,4,4); ctx.fillRect(x+6,y-4,4,4); }
{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='mega'){ const h=G.hero; return z.paid?'К выходу — на парковку →':h.x>z.K-150?'Встань в короткую очередь':(z.sun?'К стойке возврата →':'Через зал к кассам →'); } return _gt(z); }; }
function megaBelt(b){ const x=Math.round(b.x-G.cam), y=Math.round(b.y); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-4,38,6); ctx.fillStyle='#3a3e4a'; ctx.fillRect(x-1,y-3,36,3); ctx.fillStyle='#8a90a0'; ctx.fillRect(x-1,y,36,1); ctx.fillStyle='#5a5e6a'; for(let k=(Math.floor(G.t*8)%4);k<36;k+=4) ctx.fillRect(x-1+k,y-3,1,3);
  ctx.fillStyle=P.ink; ctx.fillRect(x+28,y-10,8,7); ctx.fillStyle='#2a2e3a'; ctx.fillRect(x+29,y-9,6,5); ctx.fillStyle='#3ad06a'; ctx.fillRect(x+30,y-8,4,2); }
// концовка МЕГАХИМКИ: парковка, герой с тележкой ищет машину… «у меня же нет машины». ВС — возврат: «деньги вернут за 10 рабочих дней»
function w5Car(x,y,col,flip){ x=Math.round(x); y=Math.round(y); e4r('rgba(10,6,20,.25)',x-2,y,46,3); e4r(P.ink,x,y-14,44,12); e4r(P.ink,x+8,y-21,26,8); e4r(col,x+1,y-13,42,10); e4r(col,x+9,y-20,24,7); e4r('#2a3a5a',x+11,y-19,9,5); e4r('#2a3a5a',x+22,y-19,9,5); e4r('#ffffff88',x+12,y-19,2,4);
  e4r(flip?'#ffe9a8':'#e04a4a',x+1,y-10,2,2); e4r(flip?'#e04a4a':'#ffe9a8',x+41,y-10,2,2); for(const wx of [x+6,x+30]){ e4r(P.ink,wx,y-5,8,8); e4r('#8a8a9a',wx+2,y-3,4,4); } }
function w5Mega(t,S){ const g=w5Begin(), {SW,SH}=g, HY=Math.round(SH*.42), FY=Math.round(SH*.86), sun=W5SUN();
  e4r('#9fd0f0',0,0,SW,HY); e4r('#cfeaff',0,HY-12,SW,12); // небо
  // здание МЕГАХИМКИ вдали
  const bx=Math.round(SW*.08), bw=Math.round(SW*.84); e4r(P.ink,bx-1,HY-34,bw+2,35); e4r('#e8e2d8',bx,HY-33,bw,33); e4r('#d0c8bc',bx,HY-12,bw,12); for(let x=bx+6;x<bx+bw-10;x+=16) e4r('#9fc8e8',x,HY-10,10,9);
  const sw=96, sx=Math.round(SW/2-sw/2); e4r(P.ink,sx-1,HY-31,sw+2,14); e4r('#e8562a',sx,HY-30,sw,12); E4L('МЕГАХИМКИ',SW/2,HY-24,9,'#ffd23f',P.ink);
  // асфальт, разметка, ряды машин
  e4r('#6a6a76',0,HY,SW,SH-HY); e4r('#5e5e6a',0,HY,SW,3); 
  const cols=['#d84a4a','#e8e8f0','#4a7ad8','#3a3a48','#ffd23f','#5ab05a']; for(let x=0;x<SW;x+=50) e4r('#e8e8f0',x-3,HY+8,2,16); for(let i=0;i*50<SW;i++){ if(i%4===2) continue; w5Car(4+i*50,HY+22,cols[i%6],0); }
  for(let i=0;i*50<SW;i++){ if(i%3===1) continue; w5Car(-20+i*50,HY+44,cols[(i+3)%6],1); }
  // столб с «P»
  const px=Math.round(SW*.86); e4r(P.ink,px,HY+2,2,FY-HY-30); e4r(P.ink,px-7,HY-2,16,16); e4r('#2a6ad8',px-6,HY-1,14,14); E4L('P',px+1,HY+6,9,'#fff',null);
  // герой с тележкой и пакетами
  const walk=t<3, hx=Math.round(walk?SW*.12+t/3*(SW*.42):SW*.54), hy=FY-2, look=t>3&&t<5.5?(Math.floor(t*1.6)%2===0):false;
  spr(S,walk?'walk':'idle',Math.floor(t*10)%8,t>5.5?'o':'norm',hx,hy,look,1);
  const cx=look?hx-22:hx+14; e4r(P.ink,cx-11,hy-17,22,13); e4r('#c8ccd8',cx-10,hy-16,20,11); e4r('#8a90a0',cx-6,hy-16,1,11); e4r('#8a90a0',cx,hy-16,1,11); e4r('#8a90a0',cx+5,hy-16,1,11);
  e4r(P.ink,cx-8,hy-25,9,10); e4r('#fff8e8',cx-7,hy-24,7,8); e4r('#e8562a',cx-7,hy-21,7,2); e4r(P.ink,cx+1,hy-23,8,8); e4r('#4ab04a',cx+2,hy-22,6,6); e4r(P.ink,cx-9,hy-4,4,4); e4r(P.ink,cx+6,hy-4,4,4);
  if(t>3&&t<5.5) E4L('?',hx+(look?-6:6),hy-44,12,'#ffd23f'); if(t>5.5) E4L('…',hx,hy-44,16,'#fff');
  e4End(); sub(sun?(t<3?'Воскресенье. Возврат оформлен.':t<5.5?'Деньги вернут за 10 рабочих дней.':'Зато какая прогулка до парковки!'):(t<3?'Суббота в МЕГАХИМКАХ. Пакеты, тележка, счастье.':t<5.5?'Так… где я припарковался?':'…у меня же нет машины.')); }
END.push(['МЕГАХИМКИ',8,w5Mega,'wk']); W5END.mega=END.length-1;
// ---------- M5-3c: ДАЧА — МЦД пустая, но у всех рассада; дед с рассадой занял 3 места (ВС — бабушка); финал «шашлык» ----------
WK5Z.dacha=z=>{ const base={kind:'mcd',seg:'wk',d:z.d,seed:(z.seed^0xdac4)>>>0,sun:z.sun}; return [Object.assign({},base,{k:'mplat',board:3,shift:0}),Object.assign({},base,{k:'mtrain',ride:44,stops:2,crowd:6,ctl:null,smoker:false,wcEnd:0,news:false,fat:1,sleepy:true,dacha:1}),Object.assign({},base,{k:'mexit',exit:1,dacha:1,last:true})]; }; // M5-11: + выход на платформе «Дачная»
{ const T=ZONES.mtrain, ti=T.init; T.init=function(z){ ti.apply(this,arguments); if(!z.dacha) return; tev('wk_dacha_car');
    // все с рассадой: стоящие и часть сидящих — «seeds»
    const swap=e=>{ const n=mkNpc('seeds',e.x,e.y); for(const k of ['sit','pin','ghost','face','car','anT']) n[k]=e[k]; if(e.sit) e.sit.occ=n; n.set(e.st||'idle'); return n; };
    z.npcs=z.npcs.map((e,i)=>e.fat||e.smoker||i%2?e:swap(e)); z.seated=z.seated.map((e,i)=>i%2?e:swap(e));
    // дед (ВС — бабушка) с ящиками рассады на трёх местах в стартовом вагоне
    const c=z.startCar, sl=c.slots; let k=-1; for(let i=0;i+2<sl.length;i++) if(sl[i].x>G.hero.x+30){ k=i; break; } if(k<0) k=Math.max(0,sl.length-3);
    const trio=sl.slice(k,k+3); for(const s of trio){ if(s.occ){ z.seated=z.seated.filter(e=>e!==s.occ); } s.occ=null; s.sock=0; }
    const g=mkNpc(z.sun?'granny':'seeds',trio[0].x,z.y0); g.sit=trio[0]; trio[0].occ=g; g.pin=true; g.ghost=true; g.face=1; g.ded=1; g.set('idle'); z.seated.push(g); z.ded=g;
    for(const s of trio.slice(1)){ const b=mkNpc('polite',s.x,z.y0); b.sit=s; s.occ=b; b.pin=true; b.ghost=true; b.drawFn=dachaBox; b.box=1; z.seated.push(b); } z.trio=trio; };
  const tu=T.update; T.update=function(z,dt){ tu.apply(this,arguments); if(z.dacha&&z.ded&&!z.dedSaid&&Math.abs(G.hero.x-z.ded.x)<70){ z.dedSaid=1; tev('wk_ded'); { const tx=z.sun?'Бабушка: «Внучек, это места для помидоров!»':'Дед: «Занято! Тут огурцы едут!»'; say(tx,2.2,'#fff'); try{ if(typeof crowdVoice==='function') crowdVoice(z.sun?'granny':'male',tx,'angry','other'); }catch(e){} } /* M5 ревью: пузырь перекрывал табло «СВОБОДНО N» → строка подсказки */ } }; }
function dachaBox(b){ const x=Math.round(b.x-G.cam), y=Math.round(b.y-(b.sit?6:0)); ctx.fillStyle=P.ink; ctx.fillRect(x-8,y-9,16,9); ctx.fillStyle='#a8643a'; ctx.fillRect(x-7,y-8,14,7); ctx.fillStyle='#c8845a'; ctx.fillRect(x-7,y-8,14,2);
  for(let i=-5;i<=5;i+=5){ ctx.fillStyle=P.ink; ctx.fillRect(x+i,y-15,1,7); ctx.fillStyle='#3a8a3a'; ctx.fillRect(x+i-2,y-16,3,3); ctx.fillStyle='#5ac85a'; ctx.fillRect(x+i,y-14,3,2); } }
// концовка ДАЧА: грядки, домик, мангал с дымом, шампур; ВС — бабушка «Ешь, а то худой!»
function w5Dacha(t,S){ const g=w5Begin(), {SW,SH}=g, HY=Math.round(SH*.5), FY=Math.round(SH*.86), sun=W5SUN();
  e4r('#9fd0f0',0,0,SW,HY); e4r('#cfeaff',0,HY-10,SW,10); e4r('#ffe9a8',Math.round(SW*.7),12,10,10); e4r('#fff6d0',Math.round(SW*.7)+1,13,8,8);
  for(let x=-10;x<SW;x+=34){ e4r('#5a9a4a',x,HY-14-((x*7)%9),30,20); e4r('#4a8a3a',x+4,HY-8,24,8); } // лес
  e4r('#6ab04a',0,HY,SW,SH-HY); e4r('#5aa03a',0,HY,SW,2);
  // забор
  for(let x=0;x<SW;x+=6){ e4r(P.ink,x,HY-12,5,14); e4r('#c8a070',x+1,HY-11,3,12); } e4r('#a8804a',0,HY-8,SW,2);
  // домик
  const dx=Math.round(SW*.08); e4r(P.ink,dx-1,HY-30,46,36); e4r('#d8c090',dx,HY-29,44,34); e4r(P.ink,dx-5,HY-31,54,2); for(let i=0;i<14;i++) e4r(i%2?'#b84a3a':'#c85a4a',dx-4+i*2,HY-44+Math.abs(i-11)*1,2,14-Math.abs(i-11)); e4r(P.ink,dx+22,HY-46,1,15);
  e4r(P.ink,dx+6,HY-20,13,11); e4r('#9fd0f0',dx+7,HY-19,11,9); e4r(P.ink,dx+12,HY-19,1,9); e4r(P.ink,dx+26,HY-18,12,24); e4r('#8a5a3a',dx+27,HY-17,10,23); e4r('#ffd23f',dx+34,HY-6,1,1);
  // грядки с рассадой
  for(let r=0;r<3;r++){ const y=HY+8+r*9, x0=Math.round(SW*.36); e4r(P.ink,x0-1,y-1,Math.round(SW*.4)+2,6); e4r('#7a4a2a',x0,y,Math.round(SW*.4),4); for(let x=x0+3;x<x0+SW*.4-2;x+=7){ e4r('#3a8a3a',x,y-3,1,3); e4r('#5ac85a',x-1,y-4,3,2); } }
  // мангал с дымом и шампурами
  const mx=Math.round(SW*.66), my=FY-10; e4r(P.ink,mx-14,my-8,30,7); e4r('#3a3a48',mx-13,my-7,28,5); e4r('#ff7a2a',mx-12,my-8,26,1); e4r(P.ink,mx-12,my-1,2,10); e4r(P.ink,mx+12,my-1,2,10);
  for(let i=0;i<4;i++){ e4r('#a8a8b8',mx-15,my-10+i*0-1+i*0,32,1); e4r('#a0522d',mx-10+i*7,my-12,4,3); }
  for(let i=0;i<5;i++){ const k=(t*.7+i*.2)%1; ctx.globalAlpha=.6*(1-k); e4r('#e8e8f0',mx-4+Math.round(Math.sin(t*2+i)*4)+i*2,my-16-k*30,5,4); } ctx.globalAlpha=1;
  // герой с шампуром и дед/бабушка
  const hx=Math.round(SW*.5), sp=sun?HERO_SPECS.baba:W5_DED; spr(sp,'idle',0,'norm',Math.round(SW*.82),FY,true,1);
  spr(S,t>4?'cheer':'idle',Math.floor(t*8)%8,'norm',hx,FY,false,1); e4r('#a8a8b8',hx+6,FY-26,14,1); e4r('#a0522d',hx+11,FY-28,4,3); e4r('#a0522d',hx+16,FY-28,3,3);
  if(t>4) E4L('ШАШЛЫК!',hx,FY-46,10,'#ffd23f'); if(sun&&t>2&&t<5) E4L('Ешь, а то худой!',Math.round(SW*.82),FY-46,7,'#fff');
  e4End(); sub(sun?(t<2?'Воскресенье на даче. Рассада доехала.':t<5?'Бабушка накладывает третью порцию.':'Завтра понедельник. Но сейчас — шашлык.'):(t<2?'Суббота. Дача. Рассада доехала целой.':t<4?'Дед: «Огурцы — в теплицу, ты — к мангалу».':'Шашлык готов. Это и есть счастье.')); }
const W5_DED=mkSpec({skin:'#f0c8a0',hair:'#d8d8e0',hairStyle:'cap',top:'#5a7a4a',pants:'#3a3a4a',shoes:'#2a2a2a',headR:7,bodyW:10,bodyH:11});
END.push(['ДАЧА',8,w5Dacha,'wk']); W5END.dacha=END.length-1;
// ---------- M5-3d: С НАСТЕЙ — прогулка за руку через парк (голуби), кофейня вдвоём, финал «селфи у фонтана»; толкаться нельзя — «ссора» ----------
const NASTYA=mkSpec({skin:'#ffd8b8',hair:'#c8642a',hairStyle:'bun',top:'#e85a8a',belly:'#ff8ab0',pants:'#3a3a6a',shoes:'#ffffff',headR:7,bodyW:9,bodyH:10});
WK5Z.nastya=z=>{ const b={k:'street',seg:'wk',d:z.d,weather:'clear',nastya:1,sun:z.sun}; return [Object.assign({},b,{ev:'pigeons',v:0,seed:(z.seed^0x4a51)>>>0}),Object.assign({},b,{ev:'promoter',v:0,seed:(z.seed^0x4a53)>>>0}),Object.assign({},b,{ev:'coffee',v:0,seed:(z.seed^0x4a52)>>>0,last:true})]; }; // M5-11: + аллея с промоутером
{ const S=ZONES.street, i0=S.init, u0=S.update, t0=S.title;
  S.title=function(z){ return z.nastya?(z.ev==='coffee'?'ПАРК · КОФЕ ВДВОЁМ':'ПАРК · С НАСТЕЙ'):t0.apply(this,arguments); };
  S.init=function(z){ i0.apply(this,arguments); if(!z.nastya) return; if(z.last) z.end='fountain'; z.noSign=[[-9999,99999]]; z.npcs=z.npcs.filter((e,i)=>e.ctl||e.q||i%2===0);
    const n=new Actor(G.hero.x-14,G.hero.y+3,NASTYA); n.type='nastya'; n.ctl=1; n.ghost=true; n.noSolid=true; n.pin=false; n.face=1; n.nastya=1; z.npcs.push(n); z.nas=n; z.sh0=(TR.ev&&TR.ev.shove)||0; z.cof0=!!TR.coffee; tev('wk_nastya'); };
  S.update=function(z,dt){ u0.apply(this,arguments); const n=z.nas; if(!n) return; const h=G.hero; const tx=h.x-13*h.face, ty=h.y+3; n.x+=(tx-n.x)*Math.min(1,dt*10); n.y+=(ty-n.y)*Math.min(1,dt*10); n.face=h.face; n.set(Math.hypot(h.vx||0,h.vy||0)>5?'walk':'idle');
    const sh=(TR.ev&&TR.ev.shove)||0; if(sh>z.sh0){ z.sh0=sh; TR.wkFight=(TR.wkFight||0)+1; TR.score=Math.max(0,(TR.score||0)-30); tev('wk_fight'); bubble(n,pick(['Ну зачем ты толкаешься?!','Мы же гуляем!','Я так не играю…']),1.8,'#ff8ab0'); pop('ССОРА −30',h.x,h.y-56,'#ff8ab0',8); }
    if(!z.cof0&&TR.coffee){ z.cof0=true; tev('wk_double_coffee'); pop('ДВА КАПУЧИНО ♥',h.x,h.y-56,'#ffd98a',8); bubble(n,'Мне с корицей!',1.6,'#fff'); }
    if(!z.saidN&&z.t>1.2){ z.saidN=1; bubble(n,z.ev==='coffee'?'Зайдём за кофе?':z.ev==='promoter'?'Ой, шаурма в костюме!':'Смотри, голуби!',1.6,'#fff'); } }; }
// парк вместо фасадов: деревья, газон, фонари, скамейки; в конце — фонтан
{ const _wd=st4WeatherDraw; st4WeatherDraw=function(z,layer){ if(layer==='ground'&&z&&z.nastya) wk5Park(z); return _wd.apply(this,arguments); }; }
function wk5Park(z){ const g=st4Geo(), c=G.cam, fb=g.facadeB; ctx.fillStyle='#9fd0f0'; ctx.fillRect(0,0,W,fb); ctx.fillStyle='#cfeaff'; ctx.fillRect(0,fb-40,W,16);
  ctx.fillStyle='#6a9a5a'; for(let x=-(Math.round(c*.4)%60)-30;x<W+60;x+=60){ ctx.fillRect(x,fb-36,50,24); } ctx.fillStyle='#7ab86a'; ctx.fillRect(0,fb-16,W,16); ctx.fillStyle=P.ink; ctx.fillRect(0,fb-1,W,1);
  for(let x=-(Math.round(c)%90);x<W+90;x+=90){ const wx=x+Math.round(c); const tx=x+20, ty=fb-4; ctx.fillStyle=P.ink; ctx.fillRect(tx-3,ty-30,6,30); ctx.fillStyle='#7a5232'; ctx.fillRect(tx-2,ty-30,4,30);
    ctx.fillStyle=P.ink; ctx.fillRect(tx-19,ty-62,38,36); ctx.fillStyle='#3a8a3a'; ctx.fillRect(tx-18,ty-61,36,34); ctx.fillStyle='#5aa84a'; ctx.fillRect(tx-14,ty-58,14,10); ctx.fillRect(tx+2,ty-50,10,8); ctx.fillStyle='#2a6a2a'; ctx.fillRect(tx-18,ty-34,36,6);
    if((Math.floor(wx/90))%2===0){ const bx=x+58; ctx.fillStyle=P.ink; ctx.fillRect(bx-1,ty-12,26,4); ctx.fillRect(bx-1,ty-18,26,3); ctx.fillStyle='#c8845a'; ctx.fillRect(bx,ty-11,24,2); ctx.fillRect(bx,ty-17,24,1); ctx.fillStyle=P.ink; ctx.fillRect(bx+2,ty-8,2,8); ctx.fillRect(bx+20,ty-8,2,8); }
    else { const lx=x+66; ctx.fillStyle=P.ink; ctx.fillRect(lx,ty-46,2,46); ctx.fillRect(lx-3,ty-50,8,5); ctx.fillStyle='#ffe9a8'; ctx.fillRect(lx-2,ty-49,6,3); } }
  if(z.ev==='coffee'&&z.kx){ const fc=st4Facade(z), x0=z.kx-80; ctx.drawImage(fc,x0+20,0,170,fb,Math.round(x0-c),0,170,fb); }
  if(z.end==='fountain'){ const fx=Math.round(z.len-110-c); if(fx>-80&&fx<W+80) wk5Fountain(fx,fb-2); } }
function wk5Fountain(x,y){ const f=(a,b,w,h,col)=>{ ctx.fillStyle=col; ctx.fillRect(x+a,y+b,w,h); }; f(-40,-14,80,14,P.ink); f(-39,-13,78,12,'#b8b0c4'); f(-39,-13,78,2,'#d8d0e0'); f(-36,-9,72,6,'#4a9ae8'); f(-6,-34,12,22,P.ink); f(-5,-33,10,20,'#c8c0d4'); f(-14,-38,28,5,P.ink); f(-13,-37,26,3,'#b8b0c4');
  for(let i=0;i<7;i++){ const k=(G.t*1.4+i/7)%1, dx=Math.round((i-3)*5*k*2), dy=Math.round(-50+70*(k-.5)*(k-.5)*4*.5-20*k); ctx.fillStyle=i%2?'#9fd8ff':'#e8f6ff'; ctx.fillRect(x+dx,y+dy-4,2,3); } f(-1,-52,2,14,'#cfeaff'); }
// HUD: цель и подсказка про руку
{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='street'&&z.nastya) return z.end==='fountain'?'К фонтану — за руку, не толкаясь':'Гуляем за руку: не толкайся'; return _gt(z); }; }
// концовка С НАСТЕЙ: фонтан, селфи — вспышка, «полароид» с сердечком
function w5Nastya(t,S){ const g=w5Begin(), {SW,SH}=g, HY=Math.round(SH*.52), FY=Math.round(SH*.88), sun=W5SUN();
  e4r(sun?'#b8c8e8':'#9fd0f0',0,0,SW,HY); e4r('#cfeaff',0,HY-12,SW,12); for(let x=-10;x<SW;x+=46){ e4r(P.ink,x+18,HY-30,4,30); e4r('#7a5232',x+19,HY-30,2,30); e4r(P.ink,x+5,HY-56,30,30); e4r('#3a8a3a',x+6,HY-55,28,28); e4r('#5aa84a',x+9,HY-52,10,8); }
  e4r('#c8c0b0',0,HY,SW,SH-HY); for(let x=0;x<SW;x+=12) e4r('#b8b0a0',x,HY,1,SH-HY); for(let y=HY+8;y<SH;y+=8) e4r('#b8b0a0',0,y,SW,1);
  const fx=Math.round(SW*.5); wk5FountainS(fx,HY+16,t);
  const hx=Math.round(SW*.42), nx=Math.round(SW*.56); spr(NASTYA,t>3.6?'cheer':'idle',Math.floor(t*8)%8,'norm',nx,FY,true,1); spr(S,'idle',0,'norm',hx,FY,false,1);
  const up=Math.min(1,t/1.2), ph=Math.round(hx+10), py=Math.round(FY-30-up*14); e4r(P.ink,ph-1,py-1,7,11); e4r('#2a2a36',ph,py,5,9); e4r('#9fd0f0',ph+1,py+1,3,6);
  if(t>3.4&&t<3.7){ ctx.globalAlpha=.85; e4r('#ffffff',0,0,SW,SH); ctx.globalAlpha=1; }
  if(t>3.7){ const k=Math.min(1,(t-3.7)/.5), pw=Math.round(SW*.2), phh=Math.round(pw*.95), px=Math.round(SW*.8-pw/2), pY=Math.round(SH*.24+(1-k)*20); ctx.save(); ctx.translate(px+pw/2,pY+phh/2); ctx.rotate(.08); e4r(P.ink,-pw/2-1,-phh/2-1,pw+2,phh+2); e4r('#fffaf0',-pw/2,-phh/2,pw,phh); e4r(sun?'#b8c8e8':'#9fd0f0',-pw/2+3,-phh/2+3,pw-6,phh-14); e4r('#4a9ae8',-pw/2+3,phh/2-18,pw-6,6); for(const [ox,hc,tc] of [[-7,'#5a3a2a','#8a5ad8'],[6,'#c8642a','#e85a8a']]){ e4r(P.ink,ox-5,-phh/2+10,10,10); e4r('#ffd8b8',ox-4,-phh/2+11,8,8); e4r(hc,ox-4,-phh/2+11,8,3); e4r(P.ink,ox-2,-phh/2+15,1,1); e4r(P.ink,ox+1,-phh/2+15,1,1); e4r(P.ink,ox-6,-phh/2+20,12,phh-34); e4r(tc,ox-5,-phh/2+21,10,phh-35); } e4r('#e85a8a',-4,phh/2-9,3,3); e4r('#e85a8a',1,phh/2-9,3,3); e4r('#e85a8a',-3,phh/2-7,6,2); ctx.restore(); }
  if(t>4.2) E4L('♥',Math.round((hx+nx)/2),FY-50,12,'#ff5a8a');
  e4End(); sub(t<1.4?(sun?'Воскресенье. Парк. Настя.':'Суббота. Парк. Настя.'):t<3.4?'Улыбочку! Фонтан тоже в кадре.':(sun?'Завтра понедельник, но это фото — навсегда.':'Лучшее фото недели. Без давки.')); }
function wk5FountainS(x,y,t){ e4r(P.ink,x-30,y-8,60,10); e4r('#b8b0c4',x-29,y-7,58,8); e4r('#4a9ae8',x-27,y-6,54,4); e4r(P.ink,x-4,y-24,8,17); e4r('#c8c0d4',x-3,y-23,6,15); e4r(P.ink,x-11,y-27,22,4); e4r('#b8b0c4',x-10,y-26,20,2);
  for(let i=0;i<9;i++){ const k=(t*1.3+i/9)%1, dx=Math.round((i-4)*3*k*2), dy=Math.round(-34+40*k*k-6*k); e4r(i%2?'#9fd8ff':'#e8f6ff',x+dx,y+dy-4,1,2); } e4r('#cfeaff',x,y-38,1,12); }
END.push(['С НАСТЕЙ',8,w5Nastya,'wk']); W5END.nastya=END.length-1;
// ---------- M5-3e: мягкие часы «до обеда» (10:00 → 12:00 после «…СУББОТА?!»), награда выходного: 1 жетон + косметика коллекции «Выходные» (4 шт.) ----------
const WK5_COSM={mega:['bag','пакет из МЕГАХИМОК'],dacha:['panama','панама дачника'],nastya:['heart','значок-сердечко'],sleep:['nightcap','ночной колпак']};
const COSM_HAT={panama:1,nightcap:1,ears:1};
{ const _hud=tripHUD; tripHUD=function(){ const n0=G.labels.length; _hud(); if(!(TR.soft&&TR.wkClock)) return; for(let i=n0;i<G.labels.length;i++){ const l=G.labels[i]; if(l&&/^08:\d\d$/.test(l[0])){ const k=Math.max(0,TR.tLeft/Math.max(1,TR.tTotal)), m=Math.floor(120*(1-k)); l[0]=TR.tLeft<=0?'12:'+String(Math.min(59,Math.floor((TR.overtime||0)/2))).padStart(2,'0'):(10+Math.floor(m/60))+':'+String(m%60).padStart(2,'0'); l[4]=TR.tLeft<=0?'#ffb84a':'#bfe8ff'; break; } } }; }
function cosmGive(id){ const cs=save.cosmetics||(save.cosmetics={owned:[],on:{}}); if(cs.owned.includes(id)) return false; cs.owned.push(id); if(COSM_HAT[id]) for(const h in COSM_HAT) if(cs.on[h]) cs.on[h]=false; cs.on[id]=true; return true; }
{ const _tf=tripFinish; tripFinish=function(win,reason){ const pre=!TR.done&&TR.mode==='trip'&&TR.day&&TR.day.type==='weekend'; _tf(win,reason); if(!pre||!win) return; const w=wallet(); w.tokens=(w.tokens||0)+1; TR.newUnlocks=TR.newUnlocks||[]; TR.newUnlocks.push('+1 жетон (выходной)'); TR.wkToken=1;
    const c=TR.wk&&WK5_COSM[TR.wk.c]; if(c&&cosmGive(c[0])){ TR.newUnlocks.push('косметика: '+c[1]); TR.wkCosm=c[0]; tev('wk_cosm_'+c[0]); } save.weekends=(save.weekends|0)+1; store(); }; }
// отрисовка косметики «Выходные» на герое (поверх спрайта, как «уши» M3)
{ const _da=drawActor; drawActor=function(a,ex){ _da(a,ex); if(a!==G.hero||a.hide||window.__silh||!save.cosmetics||!save.cosmetics.on) return; const on=save.cosmetics.on; if(!(G.scene==='trip'||G.scene==='cut')) return; const x=Math.round(a.x-(G.scene==='trip'?G.cam:0)), y=Math.round(a.y-(a.z||0)), f=a.face||1;
    if(on.panama){ ctx.fillStyle=P.ink; ctx.fillRect(x-10,y-47,20,3); ctx.fillRect(x-7,y-53,14,7); ctx.fillStyle='#f0e0a8'; ctx.fillRect(x-9,y-46,18,1); ctx.fillRect(x-6,y-52,12,5); ctx.fillStyle='#5aa84a'; ctx.fillRect(x-6,y-48,12,1); }
    else if(on.nightcap){ ctx.fillStyle=P.ink; ctx.fillRect(x-7,y-50,14,5); ctx.fillRect(x-4,y-55,10,6); ctx.fillRect(x+2*f,y-58,6,5); ctx.fillStyle='#4a6ad8'; ctx.fillRect(x-6,y-49,12,3); ctx.fillRect(x-3,y-54,8,5); ctx.fillStyle='#ffffff'; ctx.fillRect(x-6,y-47,12,1); ctx.fillRect(x+3*f+(f<0?-1:0),y-57,3,3); }
    if(on.heart){ ctx.fillStyle=P.ink; ctx.fillRect(x-2+f,y-29,5,4); ctx.fillStyle='#ff5a8a'; ctx.fillRect(x-1+f,y-28,3,2); }
    if(on.bag&&!a.hold&&!a.seat){ const bx=x+8*f-(f<0?6:0); ctx.fillStyle=P.ink; ctx.fillRect(bx-1,y-22,8,10); ctx.fillStyle='#fff8e8'; ctx.fillRect(bx,y-21,6,8); ctx.fillStyle='#e8562a'; ctx.fillRect(bx,y-18,6,2); ctx.fillStyle=P.ink; ctx.fillRect(bx+2,y-24,2,2); } }; }
// ---------- M5-9: доступность — «спокойный» режим: QTE ×1.5, без ритма (зажать — уже в M3), без мигания/тряски; визуальные дубли звуков ----------
const CALM_K=1.5;
{ const _sh=shake; shake=function(a){ if(save.calm) return; return _sh(a); }; }
{ const _m=st4Modal; st4Modal=function(m){ if(save.calm&&m&&m.auto) m=Object.assign({},m,{auto:m.auto*CALM_K}); return _m(m); }; }
{ const P0=ZONES.plat, pi=P0.init; P0.init=function(z){ pi.apply(this,arguments); if(save.calm&&z.openT){ z.openT=+(z.openT*CALM_K).toFixed(2); tev('calm_plat'); } }; }
{ const L=ZONES.bclift, la=L.arrive; if(la) L.arrive=function(z){ la.apply(this,arguments); if(save.calm&&z.tOpen>0){ z.tOpen*=CALM_K; tev('calm_lift'); } }; }
// без мигания: часы в «критике» и табло выходного — ровным цветом
{ const _hud=tripHUD; tripHUD=function(){ const n0=G.labels.length; _hud(); if(!save.calm) return; for(let i=n0;i<G.labels.length;i++){ const l=G.labels[i]; if(l&&l[4]==='#ff4a4a') l[4]='#ff8a8a'; } }; }
{ const _wb=wk5Board; wk5Board=function(z){ if(!save.calm) return _wb(z); const t=G.t; G.t=0; _wb(z); G.t=t; }; }
// визуальный дубль тревоги 08:55: «♪ ТРЕВОГА» под часами (звук «пи-пи» + мигание часов)
{ const _hud=tripHUD; tripHUD=function(){ _hud(); if(G.scene==='trip'&&typeof AUD!=='undefined'&&AUD.alarm&&!TR.smod){ G.labels.push(['♪ 08:55 — БЕГОМ!',SA.l+46,SA.t+40,7,'#ff8a8a','center',P.ink]); } }; }
// контраст: отношение яркостей WCAG
function lum5(hex){ const h=hex.replace('#',''), v=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4)); return .2126*v[0]+.7152*v[1]+.0722*v[2]; }
function contrast5(a,b){ const x=lum5(a), y=lum5(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
// ---------- M5-10: удержание без монетизации — коллекции косметики (Выходные / Заяц / Кофе), серия «вовремя N дней», статистика дня в итоге. Покупок и рекламы нет ----------
const COLL5={ weekend:{n:'Выходные',items:[['bag','пакет из МЕГАХИМОК'],['panama','панама дачника'],['heart','значок-сердечко'],['nightcap','ночной колпак']]},
  hare:{n:'Заяц',items:[['ears','заячьи уши',5],['shades','тёмные очки',10],['carrot','морковка',20]]},
  coffee:{n:'Кофе',items:[['cuppin','значок-стаканчик',1],['scarf','кофейный шарф',5],['thermos','термос',10]]} };
const COSM_SLOT={panama:'hat',nightcap:'hat',ears:'hat',bag:'hand',thermos:'hand',carrot:'hand',heart:'pin',cuppin:'pin',shades:'face',scarf:'neck'};
cosmGive=function(id){ const cs=save.cosmetics||(save.cosmetics={owned:[],on:{}}); if(cs.owned.includes(id)) return false; cs.owned.push(id); const sl=COSM_SLOT[id]; if(sl) for(const k in COSM_SLOT) if(COSM_SLOT[k]===sl&&cs.on[k]) cs.on[k]=false; cs.on[id]=true; return true; };
function collProg5(){ const own=(save.cosmetics&&save.cosmetics.owned)||[]; const o={}; for(const k in COLL5){ const L=COLL5[k].items; o[k]={n:COLL5[k].n,got:L.filter(i=>own.includes(i[0])).length,of:L.length}; } return o; }
function collLine5(){ const p=collProg5(); return 'Коллекции: '+Object.values(p).map(c=>c.n+' '+c.got+'/'+c.of).join(' · '); }
// счётчики и выдача по порогам после победного дня
{ const _tf=tripFinish; tripFinish=function(win,reason){ const pre=!TR.done&&TR.mode==='trip'&&TR.day; _tf(win,reason); if(!pre||!win) return; TR.newUnlocks=TR.newUnlocks||[];
    if(TR.coffee) save.coffees=(save.coffees|0)+1; const cnt={hare:save.hareOk|0,coffee:save.coffees|0};
    for(const k of ['hare','coffee']) for(const [id,nm,th] of COLL5[k].items) if(cnt[k]>=th&&cosmGive(id)){ TR.newUnlocks.push('косметика: '+nm); tev('cosm_'+id); }
    if(TR.newUnlocks.some(u=>/^косметика/.test(u))) TR.collNew=1; store(); }; }
// статистика дня на экране итога (8 строк в 2 колонки)
function dayStats5(){ const sh=(TR.ev&&TR.ev.shove)||0, ev=TR.plan&&TR.plan.events?TR.plan.events.length+(TR.plan.segs||[]).reduce((a,g)=>a+(g.id!=='metro'?g.events.length:0),0):0;
  const r=[['Очки',TR.score],TR.wk?['Выходной',(WK5[TR.wk.c]||{}).t||'—']:['Запас',Math.round(TR.tLeft)+' с'],['В вагоне',TR.spotName],['Толчки',sh],['Скандалы',TR.scandals],['Событий',ev],['Монеты','+'+TR.coinsGot],['Вовремя подряд',((save.streak&&save.streak.n)|0)+' дн.']]; return r; }
// строка коллекций — над строкой дня недели/задания
{ const _dr=drawResult; drawResult=function(){ _dr.apply(this,arguments); if(TR.mode==='escape'||!TR.day||!TR.win) return; const bh=Math.max(28,48*DPR/SC), by=H-SA.b-bh-8; G.labels.push([collLine5(),W/2,by-22,7,TR.collNew?P.neonLime:'#b8a8d8']); }; }
// косметика коллекций Заяц/Кофе на герое
{ const _da=drawActor; drawActor=function(a,ex){ _da(a,ex); if(a!==G.hero||a.hide||window.__silh||!save.cosmetics||!save.cosmetics.on) return; const on=save.cosmetics.on; if(!(G.scene==='trip'||G.scene==='cut')) return; const x=Math.round(a.x-(G.scene==='trip'?G.cam:0)), y=Math.round(a.y-(a.z||0)), f=a.face||1;
    if(on.shades){ ctx.fillStyle=P.ink; ctx.fillRect(x-5+f,y-38,11,3); ctx.fillStyle='#3a3a4a'; ctx.fillRect(x-4+f,y-38,4,2); ctx.fillRect(x+1+f,y-38,4,2); }
    if(on.scarf){ ctx.fillStyle=P.ink; ctx.fillRect(x-6,y-32,12,4); ctx.fillStyle='#8a5a3a'; ctx.fillRect(x-5,y-31,10,2); ctx.fillStyle='#f0e0c0'; ctx.fillRect(x-3,y-31,2,2); ctx.fillRect(x+2,y-31,2,2); }
    if(on.cuppin){ ctx.fillStyle=P.ink; ctx.fillRect(x-2+f,y-29,4,5); ctx.fillStyle='#f4ead8'; ctx.fillRect(x-1+f,y-28,2,3); ctx.fillStyle='#2f8a6a'; ctx.fillRect(x-1+f,y-27,2,1); }
    if(!a.hold&&!a.seat){ const bx=x+8*f-(f<0?4:0); if(on.thermos){ ctx.fillStyle=P.ink; ctx.fillRect(bx-1,y-23,6,11); ctx.fillStyle='#c8ccd8'; ctx.fillRect(bx,y-22,4,9); ctx.fillStyle='#d8343a'; ctx.fillRect(bx,y-22,4,2); }
      else if(on.carrot){ ctx.fillStyle=P.ink; ctx.fillRect(bx-1,y-21,4,9); ctx.fillStyle='#ff8a2a'; ctx.fillRect(bx,y-20,2,7); ctx.fillStyle='#3ab04a'; ctx.fillRect(bx-1,y-24,4,3); } } }; }
// M5-11: длина улицы не зависит от ширины экрана (бюджет «пар» посчитан на 844): lenK × 844/max(W,420)
{ const ZS=ZONES.street, _i=ZS.init; ZS.init=function(z){ if(z.lenK0===undefined) z.lenK0=z.lenK||1; z.lenK=z.lenK0*844/Math.max(W,420); return _i.apply(this,arguments); }; }
{ const _nz=nextZone; nextZone=function(){ const was=TR.z&&TR.z.k==='wpick'; const r=_nz.apply(this,arguments); if(was&&G.hero) G.hero.hide=false; return r; }; }
