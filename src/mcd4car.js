'use strict';
// M3-3…M3-6, M3-14: длинный поезд МЦК «Ласточкин» / МЦД — 10 вагонов-подзон, тамбуры между ними (двери наружу, гармошка, дед-курильщик),
// поперечные сиденья (лист M0-9 lastochka_int / mcd_int), места занимаются NPC в реальном времени, «СВОБОДНО: N» над входом в вагон,
// розетки ⚡, туалет-модуль в концевом вагоне, «не спи» на длинном перегоне. Нумерация вагонов: 1 — голова (справа) … 10 — хвост (слева).
const M3C={TB:56,SM:64,WC:36,perf:0,land:null,spd:0,tt:0,lt:0};
function m3Mod(kind,part){ const key='m3mod|'+kind+'|'+part; let c=ST4.cache.get(key); if(c) return c; const A=ATL4.tr, r=A.f[kind==='mck'?'lastochka_int':'mcd_int'], [cv,x]=mkc(part==='wc'?M3C.WC:M3C.SM,66);
  if(part==='wc'){ const rw=A.f.mcd_int; x.drawImage(A.img,rw[0]+64,rw[1]+14,36,66,0,0,36,66); if(kind==='mck'){ const d=x.getImageData(0,0,36,66), p=d.data; for(let i=0;i<p.length;i+=4){ if(p[i]===0xe9&&p[i+1]===0xdf&&p[i+2]===0xc4){ p[i]=0xae; p[i+1]=0xad; p[i+2]=0xb8; } else if(p[i]===0x6c&&p[i+1]===0x62&&p[i+2]===0x74){ p[i]=0x64; p[i+1]=0x63; p[i+2]=0x6c; } } x.putImageData(d,0,0); const [c2,x2]=mkc(36,66); x2.drawImage(cv,0,0); ST4.cache.set(key,c2); return c2; } }
  else x.drawImage(A.img,r[0],r[1]+14,64,66,0,0,64,66); // верх (табло листа) рисуем сами: счётчик живой
  ST4.cache.set(key,cv); return cv; }
// пейзаж за окном: небо, лес/дачи/опоры; кэш-полоса 11 px
function m3Land(kind){ const key='m3land|'+kind; let c=ST4.cache.get(key); if(c) return c; const r=mulberry32(kind==='mck'?5:9), [cv,x]=mkc(640,11);
  x.fillStyle='#88b9ed'; x.fillRect(0,0,640,11); x.fillStyle='#a8d0f4'; x.fillRect(0,0,640,2);
  for(let px=0;px<640;){ const k=r(); if(k<.45){ const w=10+Math.round(r()*30); x.fillStyle='#3f6a3a'; for(let i=0;i<w;i+=3){ const hh=3+Math.round(r()*3); x.fillRect(px+i,7-hh,3,hh); } px+=w; } else if(k<.7){ x.fillStyle='#c8b8a0'; x.fillRect(px,4,8,4); x.fillStyle='#a0442c'; x.fillRect(px-1,3,10,1); x.fillRect(px,2,8,1); x.fillStyle='#ffe9a8'; x.fillRect(px+2,5,2,2); px+=12+Math.round(r()*6); } else if(k<.85){ x.fillStyle='#8a9ab6'; const hh=4+Math.round(r()*3); x.fillRect(px,7-hh,9,hh); x.fillStyle='#b0bed4'; x.fillRect(px+2,8-hh,1,1); x.fillRect(px+5,8-hh,1,1); px+=12; } else px+=6+Math.round(r()*10); }
  x.fillStyle=kind==='mck'?'#7f9565':'#5f7a3f'; x.fillRect(0,7,640,4); x.fillStyle=shade(kind==='mck'?'#7f9565':'#5f7a3f',-.2); for(let i=0;i<640;i+=5) x.fillRect(i,9,2,1);
  ST4.cache.set(key,cv); return cv; }
function m3Layout(z){ const TB=M3C.TB, SM=M3C.SM; z.cars=[]; let x=0;
  for(let i=0;i<10;i++){ const wc=z.wcEnd===i, c={i,n:10-i,x0:x,tb0:x,tb1:x+TB,s0:x+TB,mods:[]}; x+=TB; const wcF=wc&&i>=5; if(wcF){ c.mods.push({x,part:'wc'}); c.wcX=x+18; x+=M3C.WC; } for(let m=0;m<3;m++){ c.mods.push({x,part:'seat'}); x+=SM; } if(wc&&!wcF){ c.mods.push({x,part:'wc'}); c.wcX=x+18; x+=M3C.WC; } c.s1=x; c.x1=x; z.cars.push(c); }
  z.tbs=z.cars.map(c=>({x0:c.tb0,x1:c.tb1,door:c.tb0+30,car:c})); z.tbs.push({x0:x,x1:x+TB,door:x+30,car:null,end:1}); z.len=x+TB+24; }
function m3CarAt(z,x){ for(const c of z.cars) if(x<c.x1) return c; return z.cars[9]; }
function m3TbAt(z,x){ return z.tbs.find(t=>x>=t.x0-2&&x<t.x1+2)||null; }
function m3Free(c){ return c.slots.filter(s=>!s.occ).length; }
ZONES.mtrain={ title:z=>(z.kind==='mck'?'«ЛАСТОЧКИН» · ':'МЦД · ')+'ВАГОН '+(z.curN||'?')+(z.arrive?' · ВАША СТАНЦИЯ':' · НАЙДИ МЕСТО'),
  tip:z=>'иди по вагонам через тамбуры, свободные места — зелёные; у места «СЕСТЬ»',
  init(z){ z.y0=FY0+3; z.y1=FY1; m3Layout(z); const r=st4Rng(z); z.T=0; z.si=0; z.stopT=0; z.arrive=false; z.sleep=0; z.layX=0; z.maxStep=.9; z.sepMin=.5; z.sepCap=.5; z.brakeT=0;
    z.stopAt=[]; for(let i=1;i<=z.stops;i++) z.stopAt.push(Math.round(z.ride*i/(z.stops+1.6))); z.longFrom=(z.stopAt[z.stopAt.length-1]||0)+4;
    z.seated=[]; const startN=clamp(TR.m3&&TR.m3.car||3,1,10), sc=z.cars[10-startN]; z.startCar=sc; const soft=TR.plan&&TR.plan.soft, pOcc=soft?.7:.92;
    const LOOKS=['polite','student','aunt','sleeper','tourist','granny','seeds','mom','bag'];
    for(const c of z.cars){ c.slots=[]; for(const m of c.mods) if(m.part==='seat') for(const dx of [12,28,44,60]) c.slots.push({x:m.x+dx,occ:null,car:c});
      if(r()<.8){ const s=c.slots[1+Math.floor(r()*(c.slots.length-2))]; s.sock=1; }
      let nFree=c===sc?(TR.m3&&TR.m3.first?3:1):Math.floor(r()*2.2); if(soft) nFree+=2; const idx=c.slots.map((s,i)=>i).sort(()=>r()-.5).slice(0,nFree);
      c.slots.forEach((s,i)=>{ if(idx.includes(i)&&r()>(1-pOcc)*0) return; const e=mkNpc(LOOKS[Math.floor(r()*LOOKS.length)],s.x,z.y0); e.sit=s; s.occ=e; e.pin=true; e.ghost=true; e.face=i%2?-1:1; e.set(r()<.45?'sleep':'idle'); e.anT=r()*3; z.seated.push(e); }); }
    // газета на свободном месте рядом со стартом (§K «газета»)
    if(z.news){ const near=[sc,z.cars[sc.i+1],z.cars[sc.i-1]].filter(Boolean); for(const c of near){ const s=c.slots.find(s=>!s.occ&&!s.sock); if(s){ s.news=1; z.newsSlot=s; break; } } }
    // стоящие: 1–3 на вагон, гуще у старта
    for(const c of z.cars){ const n=Math.abs(c.i-sc.i)<=1?ri(2,4):ri(0,2); for(let k=0;k<n;k++){ const e=mkNpc(qType(z.d||6),rnd(c.s0+10,c.s1-10),rnd(z.y0+14,z.y1-2)); e.car=c; z.npcs.push(e); } }
    // толстый пассажир у поручня (укрытие §K): в стартовом вагоне и ещё одном
    z.poles=z.cars.map(c=>Math.round((c.s0+c.s0+192)/2)); z.fats=[]; for(let k=0;k<(z.fat||1);k++){ const c=k===0?sc:z.cars[clamp(sc.i+(r()<.5?-2:2),0,9)]; const px=z.poles[c.i]; const e=mkNpc('polite',px+9,z.y0+24); e.atl='fat'; e.fat=1; e.pin=true; e.m=8; e.face=-1; e.ctl=1; e.car=c; z.npcs.push(e); z.fats.push(e); }
    // дед-курильщик в тамбуре (M3-4): ближайший тамбур, но не тот, где входим
    z.smk=null; if(z.smoker){ const ti=clamp(sc.i+(r()<.5?-1:1)+(sc.i===0?2:0),0,10), t=z.tbs[ti===sc.i?ti+1:ti]; const e=mkNpc('polite',t.x0+40,z.y0+18); e.atl='smoker'; e.pin=true; e.ghost=true; e.ctl=1; e.face=-1; e.smoker=1; z.npcs.push(e); z.smk={tb:t,e,on:1,t:rnd(5,8),hit:0}; }
    const h=G.hero; h.x=sc.tb0+30; h.y=z.y0+14; z.curN=sc.n; z.cur=sc; if(TR.m3&&TR.m3.first) tev('m3_first_bonus');
    G.cam=clamp(h.x-W*.42,-Math.round(W*.25),Math.max(0,z.len-W)); M3C.spd=0; M3C.lt=0; if(typeof m3CtlInit==='function') m3CtlInit(z); },
  update(z,dt){ const t0=performance.now(), h=G.hero; if(!z.arrive&&!z.hold) z.T+=dt;
    const cur=m3CarAt(z,h.x); z.curN=cur.n; z.cur=cur; const tb=m3TbAt(z,h.x); z.inTb=tb;
    // остановки (двери тамбуров открыты): выходят сидящие рядом, входят новые и ищут места
    if(z.si<z.stopAt.length&&z.T>=z.stopAt[z.si]){ z.si++; z.stopT=4.5; tev('m3_stop'); SFX.doors(); say('Станция «'+pick(M3_NAMES[z.kind])+'». Кто-то встаёт!',1.6,P.neonLime);
      for(const c of z.cars){ if(Math.abs(c.i-cur.i)>2) continue; const occ=c.slots.filter(s=>s.occ&&s.occ!=='hero'); for(let k=0;k<Math.min(occ.length,ri(1,2));k++){ const s=occ.splice(Math.floor(Math.random()*occ.length),1)[0], e=s.occ; s.occ=null; s.fresh=2; e.sit=null; e.pin=false; e.ghost=false; e.set('walk'); e.leaving=(z.tbs[c.i].door); z.seated.splice(z.seated.indexOf(e),1); z.npcs.push(e); }
        for(let k=0;k<ri(1,2);k++){ const t=z.tbs[c.i+(Math.random()<.5?0:1)]; const e=mkNpc(pick(['granny','polite','aunt','student']),t.door,z.y0+10); e.seek=rnd(.4,1.6); e.sspd=rnd(26,36); e.car=c; z.npcs.push(e); } } }
    if(z.stopT>0) z.stopT-=dt; for(const c of z.cars) for(const s of c.slots) if(s.fresh>0) s.fresh-=dt;
    // реальное время: стоящий рядом решает сесть
    z.seekT=(z.seekT==null?rnd(2,3.5):z.seekT)-dt; if(z.seekT<=0&&!z.arrive){ z.seekT=rnd(2.5,4.5); const cand=z.npcs.filter(e=>!e.ctl&&!e.fat&&e.seek===undefined&&e.leaving===undefined&&Math.abs(e.x-h.x)<W*.6); const e=pick(cand); if(e&&z.cars.some(c=>Math.abs(c.i-cur.i)<=1&&m3Free(c)>0)) e.seek=0; }
    for(const e of z.npcs){ if(e.ctl) continue;
      if(e.leaving!==undefined){ if(walkTo(e,e.leaving,z.y0+8,40,dt)) e.gone=true; continue; }
      if(e.seek!==undefined){ e.seek-=dt; if(e.seek<=0){ const f=z.cars.filter(c=>Math.abs(c.x0-e.x)<400).flatMap(c=>c.slots).filter(s=>!s.occ).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
          if(f&&Math.abs(f.x-e.x)<300){ if(walkTo(e,f.x,z.y0,e.sspd||30,dt)&&!f.occ){ f.occ=e; e.sit=f; e.pin=true; e.ghost=true; e.face=1; e.seek=undefined; e.set('sleep'); e.gone=true; e.toSeat=1; if(Math.abs(f.x-h.x)<50&&!(z.zanT>G.t)){ z.zanT=G.t+1.5; if(!m6BubNear(z,f.x)) pop('ЗАНЯЛИ!',f.x,z.y0-30,P.red,8); /* M6: не поверх реплики */ } tev('m3_npc_sat'); } } else e.seek=undefined; } continue; }
      if(e.kx||e.ky){ e.x+=(e.kx||0)*dt; e.y+=(e.ky||0)*dt; const k=Math.exp(-dt*5); e.kx=(e.kx||0)*k; e.ky=(e.ky||0)*k; if(Math.abs(e.kx)<2) e.kx=0; if(Math.abs(e.ky)<2) e.ky=0; } else if(e.st==='walk') e.set('idle');
      e.y=clamp(e.y,z.y0+12,z.y1); }
    for(const e of z.npcs) if(e.toSeat){ e.toSeat=0; e.gone=false; z.seated.push(e); }
    z.npcs=z.npcs.filter(e=>!e.sit&&!e.gone);
    // дед-курильщик: курит 6–8 с, перерыв 5 с; проход сквозь дым −2 с и кашель
    const S=z.smk; if(S){ S.t-=dt; if(S.t<=0){ S.on=!S.on; S.t=S.on?rnd(6,8):5; if(S.on) bubble(S.e,'Пф-ф…',1.2,'#ccc'); } S.e.atlSt=S.on?'idle':'sleepy';
      const inS=h.x>S.tb.x0+4&&h.x<S.tb.x1-4; if(inS&&S.on&&!S.hit&&!h.seat&&!(TR.m3hide&&TR.m3hide.k==='tb')){ S.hit=1; tev('m3_smoke'); const s=penalize(2,'smoke'); pop('КХЕ-КХЕ! −'+s+' с',h.x,h.y-52,'#bbb',8); h.stun=.6; bubble(S.e,'Не нравится — не дыши!',1.6); } if(!inS) S.hit=0; if(inS&&!S.on&&!S.waitOk){ S.waitOk=1; tev('m3_smoke_wait'); } }
    // герой
    if(h.seat){ h.x=h.seat.x; h.y=z.y0; h.face=1; }
    if(h.kx){ h.x+=h.kx*dt; h.kx*=Math.exp(-dt*5); if(Math.abs(h.kx)<2) h.kx=0; }
    h.x=clamp(h.x,8,z.len-20); if(!h.seat) h.y=Math.max(h.y,z.y0+(m3TbAt(z,h.x)?10:0));
    z.spot=h.seat?3:0; if(z.T>3) z.best=Math.max(z.best||0,z.spot); TR.spot=Math.max(TR.spot,z.best||0); TR.spotName=['стоя','у поручня','в углу','сидя'][TR.spot];
    // розетка ⚡ (M3-5)
    if(h.seat&&h.seat.sock&&!TR.phone100){ TR.phone100=1; TR.score+=10; tev('m3_socket'); pop('⚡ ТЕЛЕФОН 100% · +10',h.x,h.y-58,'#ffe14a',8,1.6); say('Розетка! Телефон 100% — на улице увидишь подсказки маршрута',2.2,'#ffe14a'); }
    // «не спи» (M3-6): сидя на длинном перегоне веки опускаются; ПРОСНУТЬСЯ в ритм (спокойный режим — зажать)
    const longS=h.seat&&!z.arrive&&z.stopT<=0&&z.T>=z.longFrom&&z.T<z.ride-3&&!z.slept&&!(TR.m3hide)&&!(z.C&&z.C.ph==='walk');
    if(longS){ z.sleep=Math.min(1,z.sleep+dt*.085); if(save.calm&&m3Holding()) z.sleep=Math.max(0,z.sleep-dt*.3); if(z.sleep>.3&&!z.zzz){ z.zzz=1; tev('m3_sleepy'); say(save.calm?'Глаза слипаются… зажми «ПРОСНУТЬСЯ»':'Глаза слипаются… жми «ПРОСНУТЬСЯ» в такт!',1.8,'#9cf'); }
      if(z.sleep>=1){ z.slept=1; z.sleep=0; tev('m3_overslept'); const s=penalize(20,'sleep'); say('ПРОСПАЛ! Проехал станцию и вернулся. −'+s+' с',2.4,P.red); pop('ПРОСПАЛ! −'+s+' с',h.x,h.y-58,P.red,9,1.6); SFX.hurt(); } }
    else z.sleep=Math.max(0,z.sleep-dt*.25);
    // прибытие
    if(z.T>=z.ride&&!z.arrive){ z.arrive=true; z.arrT=10; z.stopT=0; SFX.doors(); tev('m3_arrive'); say('Ваша станция! К двери в тамбуре — «ВЫЙТИ»',2,P.neonLime); }
    if(z.arrive){ z.arrT-=dt; if(z.arrT<=0&&!z.fin){ tev('m3_auto_out'); say('Толпа вынесла тебя на перрон',1.6,'#ccc'); m3TrainLeave(z); } }
    const dn=z.tbs.reduce((a,b)=>Math.abs(b.door-h.x)<Math.abs(a.door-h.x)?b:a); z.atExit=(z.arrive||(z.stopT>0&&TR.hare&&!TR.m3hid.out&&TR.m3hide==null&&z.C&&(z.C.ph==='warn'||z.C.ph==='walk')))&&!h.seat&&Math.abs(h.x-dn.door)<14&&h.y<z.y0+18?dn:null;
    z.layX=Math.round(Math.sin(z.t*Math.PI*2*.8)); if(z.brakeT>0) z.brakeT-=dt;
    if(typeof m3CtlTick==='function') m3CtlTick(z,dt);
    const nf=z.cur?m3Free(z.cur):0; z.hint=z.arrive?'ВАША СТАНЦИЯ: к двери тамбура — «ВЫЙТИ»':h.seat?(z.sleep>.3?(save.calm?'не спи! зажми «ПРОСНУТЬСЯ»':'не спи! жми «ПРОСНУТЬСЯ» в такт'):'сидишь · ехать '+Math.max(0,Math.ceil(z.ride-z.T))+' с'):'вагон '+z.curN+': свободно '+nf+(nf?'':' — иди в соседний ↔');
    M3C.perf=M3C.perf*.9+(performance.now()-t0)*.1; },
  ctx(z){ const h=G.hero;
    if(z.atExit) return {b:{label:'ВЫЙТИ',col:'#2aa860',fn:()=>{ if(z.fin) return; if(!z.arrive&&typeof m3HideExit==='function'){ m3HideExit(z); return; } tev('m3_exit'); m3TrainLeave(z); }}};
    if(typeof m3HideCtx==='function'){ const r=m3HideCtx(z); if(r) return r; } if(TR.m3hide||TR.caughtNow) return {};
    if(h.seat){ if(z.sleep>.3) return {b:{label:'ПРОСНУТЬСЯ',col:'#d87a20',fn:()=>{ const ph=(G.t%.8)/.8, on=ph<.25||ph>.85; z.sleep=Math.max(0,z.sleep-(on?.24:.08)); tev(on?'m3_wake_beat':'m3_wake'); shake(1); if(on) pop('В ТАКТ!',h.x,h.y-56,P.neonLime,7); }}}; return {}; }
    if(z.arrive) return {};
    const s=z.cur&&z.cars.flatMap(c=>c.slots).find(s=>!s.occ&&Math.abs(s.x-h.x)<8&&h.y<z.y0+14);
    if(s) return {b:{label:'СЕСТЬ',col:'#2aa860',fn:()=>{ if(s.occ) return; tev('m3_sit'); s.occ='hero'; h.seat=s; h.pin=true; h.hold=null; pop('СЕЛ!',h.x,h.y-50,P.neonLime,9); SFX.pick(); if(s.news) tev('m3_news_seat'); }}};
    return {}; },
  prog(z){ return z.T*10+(z.spot||0)*20+(G.hero.seat?5:0); },
  unstick(z){ const h=G.hero; if(z.arrive){ h.seat=null; if(!z.fin) m3TrainLeave(z); } else z.T+=4; },
  bot(z){ const h=G.hero, r={x:h.x,y:h.y}; if(typeof m3HideBot==='function'){ const q=m3HideBot(z); if(q) return q; }
    if(z.arrive){ if(h.seat){ r.stick={x:0,y:1}; return r; } const dn=z.tbs.reduce((a,b)=>Math.abs(b.door-h.x)<Math.abs(a.door-h.x)?b:a); r.x=dn.door; r.y=z.y0+6; if(z.atExit) r.b=1; return r; }
    if(h.seat){ if(z.ctxB&&z.ctxB.label==='ПРОСНУТЬСЯ') r.b=(G.t%.8)/.8<.2?1:0; return r; }
    const f=z.cars.filter(c=>Math.abs(c.i-z.cur.i)<=2).flatMap(c=>c.slots).filter(s=>!s.occ).sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x))[0];
    if(f){ r.x=f.x; r.y=Math.abs(f.x-h.x)<20?z.y0+4:z.y0+16; if(z.ctxB&&z.ctxB.label==='СЕСТЬ') r.b=1; return r; }
    r.x=z.startCar.i>4?h.x-80:h.x+80; r.y=z.y0+18; return r; },
  draw(z){ m3TrainDraw(z); } };
function m3TrainLeave(z){ const h=G.hero; if(z.fin) return; z.fin=1; h.seat=null; h.pin=false; h.hold=null; zoneDone(); }
// ---------- рисование салона ----------
function m3Tick(z){ const now=z.t, dt=Math.min(.05,Math.max(0,now-(M3C.lt||now))); M3C.lt=now; const stop=z.stopT>0||z.arrive||(z.hold); const tgt=stop?0:220; M3C.spd+=(tgt-M3C.spd)*Math.min(1,dt*(tgt>M3C.spd?1.2:3)); M3C.tt+=M3C.spd*dt; return dt; }
function m3TrainDraw(z){ m3Tick(z); const c=G.cam, MT=FY0-66, kind=z.kind, col=M3_COL[kind], fk=Math.floor(G.t*4)%2, stop=z.stopT>0||z.arrive;
  const wall=kind==='mck'?'#aeadb8':'#e9dfc4', floor=kind==='mck'?'#64636c':'#6c6274';
  ctx.fillStyle=shade(wall,-.15); ctx.fillRect(-4,0,W+8,MT); ctx.fillStyle=floor; ctx.fillRect(-4,MT,W+8,H-MT);
  ctx.save(); ctx.translate(z.layX||0,0);
  // потолок: светлый свод, полосы светильников, багажные полки
  if(typeof car4Ceil==='function'&&atlOk('gtr')) ctx.drawImage(car4Ceil(MT),-2,0,W+4,MT);
  // свод вагона (M3-ревью): затемнение к верху, рёбра по модулям, плафоны, продольный поручень с петлями, торцевые стенки у тамбуров
  { const g=ctx.createLinearGradient(0,0,0,MT); g.addColorStop(0,'rgba(20,14,34,.55)'); g.addColorStop(.55,'rgba(20,14,34,.12)'); g.addColorStop(1,'rgba(20,14,34,0)'); ctx.fillStyle=g; ctx.fillRect(-4,0,W+8,MT);
    const ly=Math.max(SA.t+34,Math.round(MT*.34)), hy=Math.round(MT*.6);
    for(const car of z.cars){ if(car.x1-c<-80||car.x0-c>W+80) continue;
      for(const m of car.mods){ const sx=Math.round(m.x-c), w=m.part==='wc'?M3C.WC:M3C.SM; if(sx>W+2||sx<-w-2) continue;
        ctx.fillStyle=shade(wall,-.42); ctx.fillRect(sx,0,1,MT-14); ctx.fillStyle=shade(wall,.06); ctx.fillRect(sx+1,0,1,MT-14);
        if(m.part==='seat'){ const gy=Math.max(SA.t+20,Math.round(MT*.16)); ctx.fillStyle=shade(wall,-.5); ctx.fillRect(sx+14,gy,w-28,5); ctx.fillStyle=shade(wall,-.25); for(let k=sx+15;k<sx+w-14;k+=3) ctx.fillRect(k,gy+1,2,3); }
        if(m.part==='seat'){ const lx=sx+8, lw=w-16; ctx.fillStyle=P.ink; ctx.fillRect(lx-1,ly-1,lw+2,7); ctx.fillStyle='#fffaf0'; ctx.fillRect(lx,ly,lw,5); ctx.fillStyle='#ffe6a8'; ctx.fillRect(lx,ly+4,lw,1); ctx.fillStyle='rgba(255,240,200,.16)'; ctx.fillRect(lx-6,ly+6,lw+12,6); } }
      const a=Math.round(car.s0-c), b=Math.round(car.s1-c); if(b>-4&&a<W+4){ ctx.fillStyle=P.ink; ctx.fillRect(a,hy-1,b-a,4); ctx.fillStyle='#d8d8e8'; ctx.fillRect(a,hy,b-a,2); ctx.fillStyle='#fff'; ctx.fillRect(a,hy,b-a,1);
        for(let x=car.s0+8;x<car.s1-4;x+=14){ const sx=Math.round(x-c); if(sx<-4||sx>W+4) continue; const sw=Math.round(Math.sin(G.t*2+x*.05)*(z.stopT>0?0:.6)); ctx.fillStyle=P.ink; ctx.fillRect(sx,hy+2,1,5); ctx.fillRect(sx-2+sw,hy+7,5,4); ctx.fillStyle='#e8e4d8'; ctx.fillRect(sx-1+sw,hy+8,3,2); } } }
    for(const t of z.tbs){ const a=Math.round(t.x0-c), b=Math.round(t.x1-c); if(b<-8||a>W+8) continue; ctx.fillStyle=shade(wall,-.5); ctx.fillRect(a,0,b-a,MT); ctx.fillStyle=shade(wall,-.62); for(let y=4;y<MT;y+=6) ctx.fillRect(a+4,y,b-a-8,2);
      for(const x of [a,b-6]){ ctx.fillStyle=P.ink; ctx.fillRect(x,0,6,MT); ctx.fillStyle=shade(wall,-.18); ctx.fillRect(x+1,0,4,MT); ctx.fillStyle=shade(wall,.05); ctx.fillRect(x+1,0,1,MT); } } }
  // рекламные плашки над полками (пародийные), через модуль — оживляют свод
  { const AD=[['#e8354a','#fff'],['#3d6ff0','#ffd23f'],['#19b874','#fff'],['#ffd23f','#2a1a1a'],['#8a4ad8','#fff']], ay=Math.round(MT*.7)+1, ah=Math.max(12,Math.round(MT*.16));
    for(const car of z.cars) car.mods.forEach((m,mi)=>{ if(m.part!=='seat'||(mi+car.i)%2) return; const ax=Math.round(m.x-c)+12; if(ax>W+4||ax<-48) return; const [bg,fg]=AD[(car.i*3+mi)%AD.length];
      ctx.fillStyle=P.ink; ctx.fillRect(ax-1,ay-1,42,ah+2); ctx.fillStyle='#fffaf0'; ctx.fillRect(ax,ay,40,ah); ctx.fillStyle=bg; ctx.fillRect(ax,ay,14,ah); ctx.fillStyle=fg; ctx.fillRect(ax+3,ay+3,8,2); ctx.fillRect(ax+3,ay+7,6,2);
      ctx.fillStyle='#4a4058'; ctx.fillRect(ax+17,ay+3,20,2); ctx.fillRect(ax+17,ay+7,14,1); ctx.fillRect(ax+17,ay+10,18,1); ctx.fillStyle=bg; ctx.fillRect(ax+17,ay+ah-3,10,1); }); }
  // багажные полки над окнами с сумками; бегущая строка над тамбурами
  for(const car of z.cars){ const a=Math.round(car.s0-c), b=Math.round(car.s1-c); if(b<-4||a>W+4) continue; const y=MT-12; ctx.fillStyle=P.ink; ctx.fillRect(a,y+6,b-a,3); ctx.fillStyle=kind==='mck'?'#9aa0b0':'#b8bcc8'; ctx.fillRect(a,y+6,b-a,1); ctx.fillStyle=P.ink; for(let x=a+8;x<b;x+=32) ctx.fillRect(x,y+6,1,8);
    const r=mulberry32(car.i*31+7); for(let x=car.s0+6;x<car.s1-14;x+=10+Math.floor(r()*18)){ if(r()<.45) continue; const w=8+Math.floor(r()*6), hh=4+Math.floor(r()*3), bx=Math.round(x-c), cl=['#4a5a8a','#8a3a3a','#3a6a4a','#6a5a3a','#5a4a6a'][Math.floor(r()*5)]; ctx.fillStyle=P.ink; ctx.fillRect(bx-1,y+5-hh,w+2,hh+1); ctx.fillStyle=cl; ctx.fillRect(bx,y+6-hh,w,hh); ctx.fillStyle=shade(cl,.25); ctx.fillRect(bx,y+6-hh,w,1); } }
  for(const t of z.tbs){ const a=Math.round(t.x0-c); if(a<-80||a>W+20) continue; const y=Math.max(SA.t+50,MT-34), nm=M3_NAMES[z.kind][(z.si+1)%M3_NAMES[z.kind].length], ph=Math.floor(G.t/2.2)%2;
    const txt=z.arrive?'ВАША СТАНЦИЯ':z.stopT>0?'ДВЕРИ ОТКРЫТЫ':(txtW('→ '+nm,6)<=100?'→ '+nm:'→ '+nm.split(' ')[0]); const w=Math.max(56,Math.min(110,txtW(txt,6)+10)); if(a+28-w/2<3||a+28+w/2>W-3) continue; m3Led(a+28-w/2,y,w,txt,z.kind==='mck'?'#ff5a4a':'#ffb84a',6); }
  const land=m3Land(kind), lo=Math.round(M3C.tt*.5)%(land.width-80);
  // модули вагонов
  for(const car of z.cars){ if(car.x1-c<-80||car.x0-c>W+80) continue;
    for(const m of car.mods){ const sx=Math.round(m.x-c); if(sx>W+2||sx<-102) continue; const w=m.part==='wc'?M3C.WC:M3C.SM;
      ctx.fillStyle=wall; ctx.fillRect(sx,MT,w,14); ctx.fillStyle='#fffaf0'; ctx.fillRect(sx,MT,w,1); ctx.fillStyle='#ffd67d'; ctx.fillRect(sx+4,MT+2,w-8,1); ctx.fillStyle='#fffaf0'; ctx.fillRect(sx,MT+4,w,1);
      ctx.drawImage(m3Mod(kind,m.part),sx,MT+14);
      if(m.part==='seat'){ const wins=kind==='mck'?[[3,21],[37,21]]:[[4,22],[34,22]]; for(const [wx,ww] of wins){ const off=(lo+Math.round(m.x*.37)+wx)%(land.width-ww); if(stop){ ctx.fillStyle='#b8b4bc'; ctx.fillRect(sx+wx,MT+19,ww,11); ctx.fillStyle='#7a8494'; ctx.fillRect(sx+wx,MT+19,ww,3); ctx.fillStyle='#e8d040'; ctx.fillRect(sx+wx,MT+28,ww,1); } else ctx.drawImage(land,off,0,ww,11,sx+wx,MT+19,ww,11); ctx.fillStyle='rgba(255,255,255,.22)'; ctx.fillRect(sx+wx+2,MT+20,1,3); ctx.fillRect(sx+wx+3,MT+19,1,2); } } }
    // счётчик «СВОБОДНО: N» над входом в вагон (M3-3)
    { const sx=Math.round(car.s0-c)+3, nf=m3Free(car); if(sx>=3&&sx+60<=W-3) m3Led(sx,MT+2,60,'СВОБОДНО '+nf,nf?'#7aff6a':'#ff6a5a',6); }
    // номер вагона на торце
    { const sx=Math.round((car.mods[0].part==='wc'?car.mods[1].x:car.s0)-c); if(sx>-20&&sx<W+20){ ctx.fillStyle=P.ink; ctx.fillRect(sx+1,MT+36,9,9); ctx.fillStyle='#fff'; ctx.fillRect(sx+2,MT+37,7,7); G.labels.push([String(car.n),sx+5,MT+41,6,'#1a1020','center',null]); } }
    // розетки ⚡ под окном у места
    for(const s of car.slots){ const sx=Math.round(s.x-c); if(sx<-20||sx>W+20) continue; if(s.sock){ ctx.fillStyle=P.ink; ctx.fillRect(sx+3,MT+33,6,7); ctx.fillStyle='#fff'; ctx.fillRect(sx+4,MT+34,4,5); ctx.fillStyle='#e0a010'; ctx.fillRect(sx+6,MT+34,1,2); ctx.fillRect(sx+5,MT+36,2,1); ctx.fillRect(sx+5,MT+37,1,2); }
      if(s.news&&!s.occ&&!z.newsUsed){ atlDraw(ctx,'pr','news_open',sx-6,MT+57); } }
    // туалет: флажок замка (занято — красный, свободно — зелёный); дверь «дёргается» при попытке
    if(car.wcX!=null){ const sx=Math.round(car.wcX-c), busy=z.wcBusy||(TR.m3hide&&TR.m3hide.k==='wc'); ctx.fillStyle=busy?'#d8265e':'#2aa860'; ctx.fillRect(sx-4,MT+39,8,2); if(z.wcRattle>0){ z.wcRattle-=1/60; ctx.fillStyle=P.ink; ctx.fillRect(sx-12+(fk?1:0),MT+21,1,40); G.labels.push(['ЗАНЯТО!',sx,MT+12,7,P.red]); } } }
  // тамбуры: дверь наружу (26×40, жёлтые торцы), перегородки, гармошка, мигающая лампа
  for(const t of z.tbs){ const a=Math.round(t.x0-c); if(a>W+4||a<-M3C.TB-4) continue; m3Tambour(z,t,a,MT,wall,floor); }
  // кабины по концам
  { const a=Math.round(-c); if(a>-4){ ctx.fillStyle=shade(wall,-.2); ctx.fillRect(a-30,MT,30,60); ctx.fillStyle=P.ink; ctx.fillRect(a-2,MT,2,60); }
    const b=Math.round(z.len-24-c); if(b<W+4){ ctx.fillStyle=shade(wall,-.2); ctx.fillRect(b,MT,40,60); ctx.fillStyle=P.ink; ctx.fillRect(b,MT,2,60); } }
  // свободные места: пульс + «МЕСТО» (M5 ревью: подпись не рисуется под пузырём NPC/курильщика ±60 px)
  const bubNear5=(z,x)=>(z.npcs||[]).concat(z.smk?[z.smk.e]:[]).some(e=>e&&e.bub>0&&e.bubS&&Math.abs((e.bubX!==undefined?e.bubX:e.x)-x)<60);
  let lastL=-1e9; for(const car of z.cars) for(const s of car.slots){ if(s.occ) continue; const sx=Math.round(s.x-c)-6; if(sx>W+20||sx<-30) continue; const a=.3+.3*(.5+.5*Math.sin(G.t*Math.PI*2/1.2));
    ctx.fillStyle=P.ink; ctx.fillRect(sx-1,MT+44,13,8); ctx.globalAlpha=a; ctx.fillStyle=P.neonLime; ctx.fillRect(sx,MT+45,11,6); ctx.globalAlpha=1; ctx.fillStyle=P.neonLime; ctx.fillRect(sx,MT+45,11,1);
    if(!G.hero.seat&&!(TR.hare&&z.C&&(z.C.ph==='warn'||z.C.ph==='walk'))&&Math.abs(s.x-G.hero.x)<W*.7&&s.x-lastL>(s.sock?40:34)&&!bubNear5(z,s.x)){ lastL=s.x; G.labels.push([s.sock?'⚡МЕСТО':'МЕСТО',s.x-c,FY0-40,7,P.neonLime]); } }
  // пол: рифлёная резина, жёлтые полосы у дверей тамбуров
  const FT=MT+60; ctx.fillStyle=floor; ctx.fillRect(-2,FT,W+4,H-FT); ctx.fillStyle=shade(floor,-.25); for(let y=FT+2;y<H;y+=4) ctx.fillRect(-2,y,W+4,1); ctx.fillStyle='rgba(10,6,20,.28)'; ctx.fillRect(-2,FT,W+4,4);
  for(const t of z.tbs){ const sx=Math.round(t.door-c); if(sx<-30||sx>W+30) continue; ctx.fillStyle=(stop||z.atExit)&&fk?'#fff3a0':'#e8c020'; ctx.fillRect(sx-14,FT,28,2); }
  floorAO();
  // поручни-стойки в проходе (по одному на вагон, у толстяка)
  for(const p of z.poles){ const sx=Math.round(p-c); if(sx<-6||sx>W+6) continue; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,MT-4,4,FY0-MT+30); ctx.fillStyle='#d8d8e8'; ctx.fillRect(sx,MT-4,2,FY0-MT+30); ctx.fillStyle='#fff'; ctx.fillRect(sx,MT-4,1,FY0-MT+30); }
  if(typeof m3CtlDraw==='function') m3CtlDraw(z,'back');
  const vis=[G.hero,...z.npcs,...z.seated.filter(e=>Math.abs(e.x-c-W/2)<W/2+40)];
  // подушки сидений перед сидящими (M3-ревью): сидящие «в креслах», а не ряд голов
  { const sc=kind==='mck'?'#4a6ad0':'#3b5bb8', sh=shade(sc,-.3); for(const car of z.cars){ if(car.x1-c<-40||car.x0-c>W+40) continue; for(const s of car.slots){ const sx=Math.round(s.x-c); if(sx<-12||sx>W+12) continue; const y=Math.round(z.y0);
    vis.push(m3Prop(s.x,z.y0+1.5,()=>{ ctx.fillStyle=P.ink; ctx.fillRect(sx-8,y-12,16,8); ctx.fillStyle=sc; ctx.fillRect(sx-7,y-11,14,5); ctx.fillStyle=shade(sc,.25); ctx.fillRect(sx-7,y-11,14,1); ctx.fillStyle=sh; ctx.fillRect(sx-7,y-7,14,1); ctx.fillStyle=P.ink; ctx.fillRect(sx-6,y-4,2,4); ctx.fillRect(sx+4,y-4,2,4); })); } } } if(typeof m3CtlActors==='function') m3CtlActors(z,vis);
  drawTripActors(vis);
  // дым деда: полупрозрачное облако поверх
  if(z.smk&&z.smk.on){ const e=z.smk.e, sx=Math.round(e.x-c); ctx.globalAlpha=.42; for(let k=0;k<6;k++){ const ph=(G.t*.5+k/6)%1; const px=sx-6-k*3+Math.round(Math.sin(G.t*2+k)*3), py=Math.round(e.y-46-ph*20); disc(ctx,px,py,5+Math.round(ph*4),4+Math.round(ph*3),'#d8d8e0'); } ctx.globalAlpha=1; }
  if(typeof m3CtlDraw==='function') m3CtlDraw(z,'front');
  ctx.restore();
  // веки: сверху/снизу чёрные шторки (M3-6), ритм-индикатор
  if(z.sleep>.12){ const k=Math.min(1,z.sleep), hh=Math.round(H*.5*k*.92); ctx.fillStyle='rgba(8,4,16,.94)'; ctx.fillRect(0,0,W,hh); ctx.fillRect(0,H-hh,W,hh); ctx.fillStyle='rgba(8,4,16,.5)'; ctx.fillRect(0,hh,W,4); ctx.fillRect(0,H-hh-4,W,4);
    if(G.hero.seat){ const ph=(G.t%.8)/.8, on=ph<.25||ph>.85, cx=Math.round(W/2), cy=SA.t+44; disc(ctx,cx,cy,on?9:6,on?9:6,P.ink); disc(ctx,cx,cy,on?8:5,on?8:5,on?'#ffe14a':'#9cf'); G.labels.push(['Z z z — В ТАКТ!',cx+14,cy,8,'#9cf','left',P.ink]); } }
  if(z.arrive) goalArrow(z.tbs.reduce((a,b)=>Math.abs(b.door-G.hero.x)<Math.abs(a.door-G.hero.x)?b:a).door,MT+4,P.neonLime); }
function m3Tambour(z,t,a,MT,wall,floor){ const fk=Math.floor(G.t*3)%2, TB=M3C.TB, open=z.stopT>0||z.arrive; const tw=shade(wall,-.12);
  ctx.fillStyle=tw; ctx.fillRect(a,MT,TB,60); ctx.fillStyle='#fffaf0'; ctx.fillRect(a,MT,TB,1); ctx.fillStyle=shade(tw,-.15); ctx.fillRect(a,MT+58,TB,2);
  // мигающая лампа тамбура
  ctx.fillStyle=fk&&!open?'#fff6c0':'#e0d8b0'; ctx.fillRect(a+20,MT+2,16,3); ctx.fillStyle=P.ink; ctx.fillRect(a+20,MT+5,16,1);
  // гармошка-переход на левом краю
  if(!(t.x0===0)){ ctx.fillStyle=P.ink; ctx.fillRect(a,MT+8,6,52); ctx.fillStyle='#3a3440'; ctx.fillRect(a+1,MT+9,4,50); ctx.fillStyle='#5a5462'; for(let y=MT+11;y<MT+58;y+=4) ctx.fillRect(a+1,y,4,1); }
  // перегородки: стекло (Ласточка) / дверь с окном (МЦД)
  for(const px of [a+6,a+TB-6]){ ctx.fillStyle=P.ink; ctx.fillRect(px-1,MT+10,3,50); if(z.kind==='mck'){ ctx.globalAlpha=.3; ctx.fillStyle='#8fd8ff'; ctx.fillRect(px+1,MT+12,px<a+TB/2?6:-6,46); ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.fillRect(px+(px<a+TB/2?3:-4),MT+16,1,6); } else { ctx.fillStyle='#8a8a96'; ctx.fillRect(px,MT+11,1,48); } }
  // дверь наружу: 26×40, жёлтые торцы, окна; открыта на станции
  const dx=Math.round(t.door-G.cam), y=MT+18; const o=open?9:0; ctx.fillStyle=P.ink; ctx.fillRect(dx-14,y-1,28,42);
  if(open){ ctx.fillStyle=z.arrive||z.stopT>0?'#b8b4bc':'#4a4038'; ctx.fillRect(dx-o,y,o*2,40); ctx.fillStyle='#7a8494'; ctx.fillRect(dx-o,y,o*2,6); ctx.fillStyle='#e8d040'; ctx.fillRect(dx-o,y+36,o*2,2); }
  const lc=z.kind==='mck'?'#c8ccd4':'#d0d0d8'; ctx.fillStyle=lc; ctx.fillRect(dx-13,y,13-o,40); ctx.fillRect(dx+o,y,13-o,40); ctx.fillStyle='#e8c020'; ctx.fillRect(dx-13,y,1,40); ctx.fillRect(dx+12,y,1,40);
  if(!open){ ctx.fillStyle=P.ink; ctx.fillRect(dx,y,1,40); ctx.fillStyle='#2a3346'; ctx.fillRect(dx-10,y+5,7,12); ctx.fillRect(dx+4,y+5,7,12); ctx.fillStyle='#88b9ed'; ctx.fillRect(dx-10,y+5,7,2); ctx.fillRect(dx+4,y+5,7,2); ctx.fillStyle=z.kind==='mck'?'#2aa860':'#e8c020'; ctx.fillRect(dx+8,y+21,2,2); }
  if(z.atExit===t&&fk){ ctx.fillStyle=P.neonLime; ctx.fillRect(dx-15,y-2,30,1); ctx.fillRect(dx-15,y+41,30,1); } }
// M3-6 «спокойный» режим: зажать «ПРОСНУТЬСЯ» (палец на кнопке B или клавиша K)
M3C.holdB=null;
window.addEventListener('pointerdown',e=>{ if(G.scene!=='trip'||!TR.z||TR.z.k!=='mtrain') return; const [x,y]=toIn(e.clientX,e.clientY); const b=buttons.find(q=>q.id==='tripB'); if(b&&x>=b.x-2&&x<=b.x+b.w+2&&y>=b.y-2&&y<=b.y+b.h+2) M3C.holdB=e.pointerId; });
{ const up=e=>{ if(M3C.holdB===e.pointerId) M3C.holdB=null; }; window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up); }
function m3Holding(){ return M3C.holdB!=null||!!input.keys.KeyK; }
// M6: реплика рядом (в т.ч. курильщик в тамбуре) — всплывашки не кладём поверх
function m6BubNear(z,x){ return (z.npcs||[]).concat(z.smk&&z.smk.e?[z.smk.e]:[]).some(e=>e&&e.bub>0&&e.bubS&&Math.abs((e.bubX!==undefined?e.bubX:e.x)-x)<70); }
