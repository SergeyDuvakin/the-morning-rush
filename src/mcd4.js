'use strict';
// M3 «МЦК / МЦД» (§B, R3, R4, §K, D2): экономика веток, сегмент → зоны: вход (турникеты/валидатор, «ЗАЙЦЕМ»), перрон (табло врёт),
// длинный поезд (mcd4car.js: 10 вагонов, места в реальном времени, дед, розетки, «не спи»), контролёры и 7 укрытий (mcd4ev.js), выход (валидатор МЦД).
const M3={EXT_BODY:132,EXT_GAP:4,TR_MIN:90};
const M3_NAMES={mck:['ЛУЖНИКИ-НА-ДЫБАХ','ДЕЛОВОЙ ЦЕНТР ТЯЖЕСТИ','БОТАНИЧЕСКИЙ САД КАМНЕЙ','ПЛОЩАДЬ ГАГАРИНСКОГО БУТЕРБРОДА','КУТУЗОВСКИЙ КРЮК'],
  mcd:['ЛИАНОЗОВО-ТОВАРНОЕ','ОКРУЖНАЯ ПОНЕВОЛЕ','ТЕСТОВСКАЯ','БЕГОВАЯ ЗА ПОЕЗДОМ','КРАСНЫЙ БАЛТИЕЦ','МАРК ИЗ НОВОДАЧНОЙ']};
const M3_COL={mck:{a:'#e8354a',b:'#ffffff',n:'МЦК'},mcd:{a:'#ff8a1f',b:'#3d6ff0',n:'МЦД'}};
SEG_IMPL.mck=true; SEG_IMPL.mcd=true; // M3: сегменты реализованы
// ---------- M3-1: экономика (чистая функция для юнитов) ----------
// paid: {how,min} — чем платил на входе в метро и сколько минут назад. МЦК: бесплатная пересадка ≤90 мин при проходе по проездному/безлимиту;
// МЦД: 1 поездка (проездной/жетон/билет из автомата 5 мон./в долг −15 с) + валидатор на выходе. Безлимит — везде бесплатно.
function m3Fare(kind,w,paid,unl){ if(unl) return {how:'unlim',t:.5};
  if(kind==='mck'&&paid&&['ride','unlim','transfer'].includes(paid.how)&&paid.min<=M3.TR_MIN) return {how:'transfer',t:.5};
  if(w.rides>0) return {how:'ride',t:.5}; if(w.tokens>0) return {how:'token',t:1.2}; if(w.coins>=PRICE.token) return {how:'coins',t:1.6}; return {how:'debt',t:.6}; }
function m3Pay(kind){ const w=wallet(), h=G.hero; const f=m3Fare(kind,w,TR.paid?{how:TR.paid.how,min:(G.time-TR.paid.t)/60}:null,hasUnlim());
  if(f.how==='ride') w.rides--; else if(f.how==='token') w.tokens--; else if(f.how==='coins') w.coins-=PRICE.token;
  else if(f.how==='debt'){ pop('−'+penalize(15,'debt')+' с',h.x,h.y-56,P.red,9); save.debtDay=mskDay(); }
  if(f.how!=='transfer') TR.paid={how:f.how,t:G.time}; tev('m3_pay_'+f.how);
  pop({unlim:'БЕЗЛИМИТ',transfer:'ПЕРЕСАДКА 0 МОН.',ride:'−1 ПОЕЗДКА',token:'−1 ЖЕТОН',coins:'БИЛЕТ −5 МОН.',debt:'В ДОЛГ'}[f.how],h.x,h.y-48,f.how==='debt'?P.red:P.neonLime,8,1.2); return f; }
// метро: запоминаем, чем платили (для пересадки на МЦК)
{ const _up=usePass; usePass=function(){ const w=wallet(), u=hasUnlim(), r=w.rides>0, t=_up(); if(t&&typeof TR!=='undefined') TR.paid={how:u?'unlim':r?'ride':'token',t:G.time}; return t; }; }
{ const _st=startTrip; startTrip=function(...a){ Object.assign(TR,{paid:null,hare:0,hareSeg:null,mcdIn:0,mcdForgot:0,m3:{},m3hid:{},m3rules:{},phone100:0,caught:0}); return _st(...a); }; __trip.startTrip=startTrip; }
{ const G0=ZONES.gate, b0=G0.buy; G0.buy=function(z,id){ if(id==='debt') save.debtDay=mskDay(); return b0.apply(this,arguments); }; }
// «зайцем»: где нельзя
function m3NoHare(){ return !!(TR.mode!=='trip'||!!TR.soft||(TR.plan&&TR.plan.soft)||(TR.day&&TR.day.type==='weekend')); }
// шанс контролёров (§K): 35% МЦК/МЦД, 15% метро; ПН +15%, ПТ −10%
function m3CtlP(kind,weekday){ return Math.max(0,(kind==='metro'?.15:.35)+(weekday===0?.15:weekday===4?-.10:0)); }
// ---------- сегмент → зоны ----------
function m3Zones(seg,day,idx){ const kind=seg.id, r=routeRng(day,idx,0x33), ctl=seg.events.find(e=>e.k==='controllers'), B=seg.budget||75;
  const base={kind,seg:kind,d:idx,seed:((day.seed>>>0)^0x3a3a^Math.imul(idx+3,2654435761))>>>0};
  const stops=1+(r()<.5?1:0), ride=Math.round(clamp(B*.5,30,52));
  return [Object.assign({},base,{k:'mgate'}),Object.assign({},base,{k:'mplat',board:2+Math.floor(r()*3),shift:[-1,0,1,-1,1][Math.floor(r()*5)]}),
    Object.assign({},base,{k:'mtrain',ride,stops,crowd:Math.round(14*(day.type==='weekend'?.6:1)),ctl:ctl?{both:kind==='mcd',at:Math.round(ride*(.3+r()*.25)),v:ctl.v}:null,smoker:r()<.7,wcEnd:r()<.5?0:9,news:r()<.75,fat:1+(r()<.5?1:0),sleepy:true}),
    Object.assign({},base,{k:'mexit',exit:1,last:true})]; }
// ---------- общий фон: наземный павильон ----------
const M3P={steel:'#5a6474',steelHi:'#8a94a6',glass:'#9fd0ec',glassHi:'#d8f0ff',floor:'#9a96a2',floorSh:'#827e8c',tile:'#b4b0bc',wall:'#e9dfc4',sky:'#9fc8ea',skyLo:'#dcecf6'};
function m3Sky(top){ const k='m3sky'+top; let c=ST4.cache.get(k); if(!c){ const [cv,x]=mkc(8,Math.max(1,top)); const g=x.createLinearGradient(0,0,0,top); g.addColorStop(0,M3P.sky); g.addColorStop(1,M3P.skyLo); x.fillStyle=g; x.fillRect(0,0,8,top); ST4.cache.set(k,c=cv); } ctx.drawImage(c,0,0,W,top); }
function m3City(z,y,k){ const key='m3city|'+W+'|'+y+'|'+(z.seed%5); let c=ST4.cache.get(key); if(!c){ const r=mulberry32(z.seed%5+3), SW=W*2+200, [cv,x]=mkc(SW,y); let px=0;
    while(px<SW){ const w=Math.round(24+r()*50), h=Math.round(y*(.25+r()*.45)); x.fillStyle='#8a9ab6'; x.fillRect(px,y-h,w,h); x.fillStyle='#9aaac4'; x.fillRect(px,y-h,Math.round(w*.3),h); x.fillStyle='#b0bed4'; for(let yy=y-h+4;yy<y-3;yy+=6) for(let xx=px+3;xx<px+w-3;xx+=6) if(r()<.45) x.fillRect(xx,yy,2,3); px+=w+Math.round(r()*8); }
    x.fillStyle='#6f9a5a'; for(let xx=0;xx<SW;xx+=7){ const hh=4+Math.round(r()*6); x.fillRect(xx,y-hh,7,hh); } x.fillStyle='#5d8a4c'; for(let xx=3;xx<SW;xx+=11) x.fillRect(xx,y-3,5,3); ST4.cache.set(key,c=cv); }
  ctx.drawImage(c,-Math.round(G.cam*(k||.3))%(c.width-W),0); }
// турникет-«рама» v4 (props turnstile_*): f — кадр 0..2 (открытие), no — красный
// пропсы как псевдо-акторы: сортируются по y ног вместе с людьми (строгая глубина)
{ const _da=drawActor; drawActor=function(a,ex){ if(a&&a.propFn){ if(!window.__silh&&!window.__ring) a.propFn(); return; } return _da(a,ex); }; }
function m3LedBoard(x,y,w,t){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,w+2,14); ctx.fillStyle='#1a1420'; ctx.fillRect(x,y,w,12); G.labels.push([t,x+w/2,y+6,6,'#ffb84a','center',null]); }
function m3Prop(x,y,fn){ return {x,y,propFn:fn,anT:0,z:0}; }
function m3Turn(x,y,f,no){ atlDraw(ctx,'pr',no?'turnstile_no':'turnstile_'+clamp(f|0,0,2),Math.round(x-5),Math.round(y-18)); }
function m3Validator(x,y,ok){ x=Math.round(x); y=Math.round(y); const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; // жёлтая стойка-валидатор МЦД (M3-ревью: крупнее, свет)
  f(-8,-1,16,4,'rgba(10,6,20,.3)'); f(-6,-3,12,4,P.ink); f(-5,-2,10,2,'#5a5a68'); f(-3,-24,6,22,P.ink); f(-2,-24,4,22,'#e0b020'); f(-2,-24,1,22,'#ffe070');
  f(-8,-40,16,18,P.ink); f(-7,-39,14,16,'#ffd23f'); f(-7,-39,14,1,'#fff3a0'); f(-7,-24,14,1,'#c89010'); f(-5,-36,10,6,'#1a1a2a'); f(-4,-35,8,1,'#4a8ad8'); f(-3,-33,6,1,'#4a8ad8');
  f(-4,-28,8,3,'#2a3a8a'); f(-2,-27,4,1,'#fff'); const on=ok===true?'#3ad06a':ok===false?'#e8354a':'#ffb84a'; f(-2,-44,4,4,P.ink); f(-1,-43,2,2,on); if(ok!=null){ ctx.fillStyle=ok?'rgba(58,208,106,.25)':'rgba(232,53,74,.25)'; ctx.fillRect(x-4,y-46,8,8); } }
// LED-табло (тёмное, янтарный/красный текст)
function m3Led(x,y,w,txt,col,size){ x=Math.round(x); y=Math.round(y); ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,w+2,13); ctx.fillStyle='#231a14'; ctx.fillRect(x,y,w,11); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(x,y,w,1);
  G.labels.push([txt,x+w/2,y+6,size||7,col||'#ffb84a','center',null]); }
// заяц у часов (метка «БЕЗ БИЛЕТА»)
function m3HareIco(x,y){ x=Math.round(x); y=Math.round(y); const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); };
  f(-4,-10,3,8,P.ink); f(1,-10,3,8,P.ink); f(-6,-4,12,10,P.ink); f(-3,-9,1,6,'#f4f0ea'); f(2,-9,1,6,'#f4f0ea'); f(-5,-3,10,8,'#f4f0ea'); f(-3,-2,1,1,P.ink); f(2,-2,1,1,P.ink); f(-1,0,2,1,'#ff8aa0'); f(-5,3,10,2,'#d8d0c8'); f(-2,-8,1,4,'#ffb0c0'); f(3,-8,1,4,'#ffb0c0'); }
{ const _hud=tripHUD; tripHUD=function(){ _hud(); if(TR.hare&&G.scene==='trip'&&!TR.done){ const L=SA.l+4, T=SA.t+3, x=L+6, y=T+34; ctx.fillStyle='#120c18c0'; ctx.fillRect(L,T+32,84,18); m3HareIco(x+2,T+44); if(!TR.smod) G.labels.push(['БЕЗ БИЛЕТА',L+18,T+41,6,'#ff9a3a','left',P.ink]); } }; }
// ---------- ЗОНА: вход / выход (турникеты, валидатор МЦД, «ЗАЙЦЕМ») ----------
ZONES.mgate={ title:z=>(z.exit?'ВЫХОД ':'ВХОД ')+'· '+M3_COL[z.kind].n+(z.exit&&z.kind==='mcd'?' · ВАЛИДАТОР':''),
  tip:z=>z.exit?(z.kind==='mcd'?'у валидатора жми «ПРИЛОЖИТЬ» — выход открыт':'иди к выходу вправо'):'к турникету и «ПРИЛОЖИТЬ»'+(z.kind==='mcd'?', потом жёлтый валидатор':''),
  init(z){ z.len=Math.max(W,480); z.tx=Math.round(Math.min(z.len*.5,W*.5)); const y0=z.y0, y1=z.y1; z.lanes=[y0+7,Math.round((y0+y1)/2),y1-6]; z.passed=0; z.payT=0; z.noHare=m3NoHare();
    z.vx=z.kind==='mcd'&&!z.exit&&TR.mode!=='learn3'?Math.round(z.tx+Math.min(110,W*.16)):null; z.endX=Math.round(Math.min(z.len-26,(z.vx||z.tx)+130)); z.vy=z.lanes[1]; z.valDone=z.vx==null; if(z.vx!=null) z.solids.push([z.vx-6,z.vy-3,z.vx+6,z.vy+2]);
    z.free=(z.exit&&z.kind==='mck')||TR.mode==='learn3'; // МЦК: выход свободный; в обучении рамки открыты // МЦК: выход свободный (рамки открываются сами)
    z.hold={t:z.noHare?1e9:rnd(1.5,3),on:0,e:null}; z.tf=[0,0,0];
    const n=z.exit?4:6; for(let i=0;i<n;i++){ const e=mkNpc(qType(z.d||6),rnd(30,z.len-30),pick(z.lanes.slice(0,2))+rnd(-3,3)); e.dir=1; e.spd2=rnd(22,32); e.free=1; e.lane=Math.random()<.5?0:1; z.npcs.push(e); }
    const h=G.hero; h.x=36; h.y=z.lanes[1]; if(z.exit&&TR.hare) tev('m3_exit_hare'); },
  near(z){ const h=G.hero; if(z.passed) return null; const dx=z.tx-10-h.x; if(dx<-2||dx>18) return null; let li=0; for(let i=1;i<3;i++) if(Math.abs(z.lanes[i]-h.y)<Math.abs(z.lanes[li]-h.y)) li=i; return Math.abs(z.lanes[li]-h.y)<10?li:null; },
  pass(z,how){ const h=G.hero; z.passed=1; z.how=how; z.passT=.55; z.lockHero=true; z.goY=z.lanes[z.li||0]; h.vx=h.vy=0; },
  update(z,dt){ const h=G.hero, H0=z.hold;
    // кто-то держит широкую створку: «ПРОХОДИТЕ!» ~3.5 с
    H0.t-=dt; if(!H0.on&&H0.t<=0&&!z.passed){ H0.on=1; H0.t=3.6; const e=mkNpc(pick(['aunt','bag','tourist']),z.tx+14,z.lanes[2]+2); e.ctl=1; e.pin=true; e.face=-1; e.ghost=true; e.holdG=1; z.npcs.push(e); H0.e=e; bubble(e,'ПРОХОДИТЕ!',2.2,'#ffe14a'); tev('m3_hold'); }
    else if(H0.on&&H0.t<=0){ H0.on=0; H0.t=z.exit&&TR.hare?rnd(1.5,2.5):rnd(4,6.5); if(H0.e){ H0.e.gone=true; H0.e=null; } }
    // поток пассажиров: проходят рамки по своим полосам
    for(const e of z.npcs){ if(e.ctl) continue; const ly=(z.vx!=null&&e.lane===1&&e.x>z.vx-56&&e.x<z.vx+36)?z.lanes[0]:z.lanes[e.lane]; e.y+=(ly-e.y)*Math.min(1,dt*2); const at=Math.abs(e.x-(z.tx-6))<3; if(at&&!e.paidG){ e.waitG=(e.waitG||0)+dt; if(e.waitG<.5){ e.set('idle'); continue; } e.paidG=1; z.tf[e.lane]=.5; }
      if(e.x>z.tx+8) e.paidG=0; e.x+=e.spd2*dt; e.face=1; e.set('walk'); if(e.x>z.len+20){ e.x=-rnd(20,90); e.waitG=0; e.paidG=0; } }
    z.npcs=z.npcs.filter(e=>!e.gone); for(let i=0;i<3;i++) z.tf[i]=Math.max(0,z.tf[i]-dt);
    // проход
    if(z.passT>0){ z.passT-=dt; h.y+=(z.goY-h.y)*Math.min(1,dt*10); h.x+=(z.tx+14-h.x)*Math.min(1,dt*6); h.set('walk'); if(z.passT<=0){ z.lockHero=false; h.x=Math.max(h.x,z.tx+12); } }
    else if(z.payT>0){ z.payT-=dt; h.set('idle'); if(z.payT<=0) this.pass(z,'pay'); }
    else if(!z.passed){ if(z.free&&Math.abs(h.x-(z.tx-10))<16){ z.li=this.near(z)??1; z.tf[z.li]=.6; tev('m3_free_exit'); this.pass(z,'free'); } else h.x=Math.min(h.x,z.tx-10); }
    if(z.payT>0||z.passT>0) z.lockHero=true;
    // валидатор МЦД на входе: приложить или пробежать мимо (−2 с, «забыл приложить» → штраф на выходе)
    if(z.vx!=null&&z.passed&&!z.valDone&&h.x>z.vx+10){ z.valDone=1; if(!TR.hare){ TR.mcdForgot=1; tev('m3_val_skip'); pop('НЕ ПРИЛОЖИЛ…',h.x,h.y-50,'#ff9a3a',7,1.2); } }
    if(z.valT>0){ z.valT-=dt; if(z.valT<=0){ z.lockHero=false; } }
    if(z.passed&&z.valDone&&!(z.valT>0)&&h.x>z.endX) zoneDone();
    z.hareOk=!z.noHare&&(!z.exit||TR.hare); z.hint=z.passed?(z.valDone?'дальше →':'жёлтый валидатор: «ПРИЛОЖИТЬ»'):(z.free?'выход свободный →':H0.on&&z.hareOk?'створку держат — можно «ЗАЙЦЕМ»':'к рамке турникета'); },
  ctx(z){ const h=G.hero;
    if(z.passed){ if(z.vx!=null&&!z.valDone&&!(z.valT>0)&&Math.abs(h.x-z.vx)<22&&Math.abs(h.y-z.vy)<14) return {b:{label:'ПРИЛОЖИТЬ',col:'#d8a020',fn:()=>{ z.valDone=1; z.valT=.6; z.lockHero=true; TR.mcdIn=1; z.valOk=1.2; tev('m3_val_in'); pop('ПИК!',z.vx,z.vy-34,P.neonLime,8); SFX.coin(); }}}; return {}; }
    if(z.payT>0||z.passT>0||z.free) return {};
    const li=this.near(z); if(li==null) return {};
    if(li===2){ if(z.hold.on&&!z.noHare&&(!z.exit||TR.hare)) return {b:{label:'ЗАЙЦЕМ',col:'#ff8a1f',fn:()=>{ z.li=2; if(!z.exit){ TR.hare=1; TR.hareSeg=z.kind; } tev(z.exit?'m3_hare_out':'m3_hare'); pop('ЗАЙЦЕМ!',h.x,h.y-50,'#ff9a3a',9); SFX.whiff(); this.pass(z,'hare'); }}}; return {}; }
    if(z.exit){ return {b:{label:'ПРИЛОЖИТЬ',col:'#2aa860',fn:()=>{ z.li=li; z.payT=.5; tev('m3_tap_out'); if(TR.hare){ const f=m3Pay(z.kind); TR.hare=0; TR.hareSeg=null; tev('m3_hare_paid'); pop('ОПЛАЧЕНО НА ВЫХОДЕ',z.tx,z.lanes[li]-34,'#ffe14a',7,1.2); z.payT=Math.max(.5,f.t); } else if(TR.mcdForgot){ m3Fine(z,'forgot'); } else { pop('ПИК!',z.tx,z.lanes[li]-34,P.neonLime,8); SFX.coin(); } }}}; }
    return {b:{label:'ПРИЛОЖИТЬ',col:'#2aa860',fn:()=>{ z.li=li; const f=m3Pay(z.kind); z.payT=f.t; z.tf[li]=f.t+.4; SFX.coin(); }}}; },
  prog(z){ const h=G.hero; return (z.passed?400:0)+(z.valDone?100:0)+h.x; },
  unstick(z){ const h=G.hero; if(!z.passed){ z.li=1; if(z.exit){ if(TR.mcdForgot&&!TR.hare) m3Fine(z,'forgot'); } else m3Pay(z.kind); this.pass(z,'stuck'); } else { z.valDone=1; h.x=Math.max(h.x,(z.vx||z.tx)+16); } },
  bot(z){ const h=G.hero, r={x:z.tx-10,y:z.lanes[1]};
    if(!z.passed){ if(z.exit&&TR.hare&&!z.noHare){ r.y=z.lanes[2]; if(z.ctxB&&z.ctxB.label==='ЗАЙЦЕМ') r.b=1; return r; } if(z.hold.on&&!z.noHare&&!z.exit&&(z.seed%3===0)){ r.y=z.lanes[2]; if(z.ctxB&&z.ctxB.label==='ЗАЙЦЕМ') r.b=1; return r; } if(z.ctxB&&z.ctxB.label==='ПРИЛОЖИТЬ') r.b=1; return r; }
    if(!z.valDone){ if(z.seed%4===1){ r.x=z.vx+30; r.y=z.lanes[0]; return r; } r.x=z.vx-14; r.y=z.vy; if(z.ctxB) r.b=1; return r; }
    if(z.vx!=null&&h.x<z.vx+12) return {x:z.vx+16,y:z.lanes[2]}; return {x:z.endX+30,y:z.lanes[1]}; },
  draw(z){ const c=G.cam, col=M3_COL[z.kind], MT=FY0-66;
    m3Sky(FY0); m3City(z,FY0-30,.2);
    // стеклянный павильон: рама и панели
    ctx.fillStyle='rgba(159,208,236,.28)'; ctx.fillRect(0,MT-60,W,90); ctx.fillStyle=M3P.steel; ctx.fillRect(0,MT-64,W,6); ctx.fillStyle=M3P.steelHi; ctx.fillRect(0,MT-64,W,1);
    for(let x=-(Math.round(c)%64);x<W+64;x+=64){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,MT-58,4,88); ctx.fillStyle=M3P.steel; ctx.fillRect(x,MT-58,2,88); ctx.fillStyle=M3P.glassHi; ctx.fillRect(x+10,MT-50,1,8); ctx.fillRect(x+12,MT-52,1,4); }
    // навес павильона (M3-ревью): потолок с плафонами и фермами вместо пустого неба
    { const RB=MT-64; ctx.fillStyle='#5a5e6c'; ctx.fillRect(0,0,W,RB); ctx.fillStyle='#4a4e5c'; for(let y=4;y<RB-4;y+=7) ctx.fillRect(0,y,W,1);
      for(let x=-(Math.round(c*1)%64);x<W+64;x+=64){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,0,4,RB); ctx.fillStyle=M3P.steel; ctx.fillRect(x,0,2,RB); const lx=x+18; if(RB>SA.t+24){ ctx.fillStyle=P.ink; ctx.fillRect(lx-1,RB-14,30,7); ctx.fillStyle='#fffaf0'; ctx.fillRect(lx,RB-13,28,5); ctx.fillStyle='rgba(255,240,200,.18)'; ctx.fillRect(lx-6,RB-8,40,10); } }
      ctx.fillStyle=P.ink; ctx.fillRect(0,RB-2,W,3); ctx.fillStyle=M3P.steelHi; ctx.fillRect(0,RB-1,W,1);
      if(!z.exit){ const bx=Math.round(z.tx+40-c), by=Math.max(SA.t+44,RB+6); if(bx>8&&bx+96<W-8){ ctx.fillStyle=P.ink; ctx.fillRect(bx+20,RB,2,by-RB); ctx.fillRect(bx+74,RB,2,by-RB); m3LedBoard(bx,by,96,(z.kind==='mck'?'КОЛЬЦО':'МЦД')+' · '+(2+(z.seed%4))+' МИН'); } } }
    ctx.fillStyle=M3P.wall; ctx.fillRect(0,MT+30,W,FY0-MT-30); ctx.fillStyle=shade(M3P.wall,-.12); ctx.fillRect(0,MT+30,W,2); ctx.fillStyle=shade(M3P.wall,-.25); ctx.fillRect(0,FY0-3,W,3);
    // полоса ветки по стене + вывеска
    ctx.fillStyle=col.a; ctx.fillRect(0,MT+40,W,3); if(z.kind==='mcd'){ ctx.fillStyle=col.b; ctx.fillRect(0,MT+43,W,2); }
    const sg=(z.exit?'ВЫХОД В ГОРОД':(z.kind==='mck'?'МЦК · КОЛЬЦО':'МЦД · ДИАМЕТР'))+' →'; wallSign(Math.round(z.tx-60),Math.max(SA.t+50,MT-40),120,14,sg,z.kind==='mck'?'#e8354a':'#2a3a8a','#fff',8);
    // автомат билетов и схема на стене
    { const ax=Math.round(z.tx-150-c); if(ax>-30&&ax<W){ ctx.fillStyle=P.ink; ctx.fillRect(ax-1,FY0-48,26,46); ctx.fillStyle=z.kind==='mck'?'#e8354a':'#3d6ff0'; ctx.fillRect(ax,FY0-47,24,44); ctx.fillStyle='#bfe0ff'; ctx.fillRect(ax+4,FY0-42,16,10); ctx.fillStyle='#2a1a1a'; ctx.fillRect(ax+6,FY0-26,12,3); ctx.fillStyle='#ffd23f'; ctx.fillRect(ax+9,FY0-20,6,2); G.labels.push(['БИЛЕТЫ',ax+12,FY0-54,6,'#ffe9a8','center',P.ink]); }
      const mx=Math.round(z.tx+90-c); if(mx>-60&&mx<W){ ctx.fillStyle=P.ink; ctx.fillRect(mx-1,MT+2,58,26); ctx.fillStyle='#fff8e8'; ctx.fillRect(mx,MT+3,56,24); ctx.fillStyle=col.a; ctx.fillRect(mx+4,MT+14,48,2); if(z.kind==='mcd'){ ctx.fillStyle=col.b; ctx.fillRect(mx+4,MT+17,48,1); } else { ctx.strokeStyle=col.a; ctx.lineWidth=2; ctx.strokeRect(mx+14,MT+6,28,18); } ctx.fillStyle=P.ink; for(let k=0;k<5;k++) ctx.fillRect(mx+6+k*11,MT+13,3,4); } }
    // пол
    ctx.fillStyle=M3P.floor; ctx.fillRect(0,FY0,W,H-FY0); ctx.fillStyle=M3P.floorSh; for(let x=-(Math.round(c)%24);x<W;x+=24) ctx.fillRect(x,FY0,1,H-FY0); for(let y=FY0+8;y<H;y+=12) ctx.fillRect(0,y,W,1); ctx.fillStyle='rgba(10,6,20,.2)'; ctx.fillRect(0,FY0,W,3);
    // линия рам: 2 турникета + широкая створка (3-я полоса)
    const tx=Math.round(z.tx-c); ctx.fillStyle='#e8d040'; ctx.fillRect(tx-14,FY0+1,2,H-FY0-1);
    // ряд рам (лист props turnstile_*): шкаф у каждой полосы, стеклянная створка; разделители-поручни между полосами
    const props=[];
    for(let i=0;i<3;i++){ const y=z.lanes[i]-7; props.push(m3Prop(z.tx,y-3,()=>{ ctx.fillStyle=P.ink; ctx.fillRect(tx-8,y-12,16,3); ctx.fillStyle='#c8ccd8'; ctx.fillRect(tx-7,y-11,14,1); })); }
    for(let i=0;i<2;i++){ const y=z.lanes[i]; const red=z.exit&&(TR.hare||TR.mcdForgot)&&z.payT>0&&z.li===i; props.push(m3Prop(z.tx,y-5,()=>m3Turn(tx,y-6,z.tf[i]>0?2:0,red))); }
    { const y=z.lanes[2]-5, op=z.hold.on||(z.how==='hare'&&z.passT>0); props.push(m3Prop(z.tx,y,()=>{ ctx.fillStyle='rgba(10,6,20,.25)'; ctx.fillRect(tx-7,y,20,3); ctx.fillStyle=P.ink; ctx.fillRect(tx-6,y-22,6,23); ctx.fillStyle='#9aa0b0'; ctx.fillRect(tx-5,y-21,4,21); ctx.fillStyle=op?'#3ad06a':'#e8354a'; ctx.fillRect(tx-5,y-19,4,3); ctx.fillStyle='#ffd23f'; ctx.fillRect(tx-5,y-12,4,1);
      if(op){ ctx.fillStyle=P.ink; ctx.fillRect(tx-1,y-19,16,4); ctx.fillStyle='#bfe0ff'; ctx.fillRect(tx,y-18,14,2); ctx.fillStyle='#fff'; ctx.fillRect(tx+2,y-18,4,1); } else { ctx.fillStyle=P.ink; ctx.fillRect(tx-1,y-19,5,19); ctx.fillStyle='#bfe0ff'; ctx.fillRect(tx,y-18,3,17); ctx.fillStyle='#fff'; ctx.fillRect(tx,y-16,1,5); } })); }
    if(z.hold.on&&z.hareOk&&!z.passed){ const y=z.lanes[2]; const fk=Math.floor(G.t*4)%2; ctx.fillStyle=fk?'#ff8a1f':'#ffe14a'; ctx.fillRect(tx-10,y+3,22,1); }
    if(z.vx!=null){ const vx=Math.round(z.vx-c); props.push(m3Prop(z.vx,z.vy+1,()=>m3Validator(z.vx-c,z.vy,z.valDone?true:z.passed?false:null))); if(!z.valDone&&z.passed){ const fk=Math.floor(G.t*4)%2; ctx.fillStyle=fk?P.edge:'#fff3a0'; ctx.fillRect(vx-10,z.vy+4,20,1); G.labels.push(['ПРИЛОЖИ ↓',vx,z.vy-54,7,P.edge,'center',P.ink]); }
      if(z.valOk>0){ z.valOk-=1/60; ctx.fillStyle=P.neonLime; ctx.fillRect(vx-5,z.vy-36,10,6); } }
    floorAO();
    drawTripActors([G.hero,...z.npcs,...props]);
    if(!z.passed) goalArrow(z.tx-10,FY0-30,z.hold.on&&z.hareOk?'#ff9a3a':P.neonLime); else if(!z.valDone) goalArrow(z.vx,FY0-30,P.edge); else goalArrow(z.endX,FY0-30); } };
ZONES.mexit=ZONES.mgate;
// штраф на выходе (забыл приложить: 15 мон. / в долг −15 с; заяц без билета — как пойманный, §K)
function m3Fine(z,why){ if(why==='hare'){ m3Caught('валидатор'); return; } const w=wallet(), h=G.hero; tev('m3_fine_forgot'); TR.mcdForgot=0;
  if(w.coins>=15){ w.coins-=15; st4Modal({id:'m3fine',title:'ВАЛИДАТОР: ШТРАФ',text:'«Забыли приложить на входе?» Штраф 15 монет.',clock:1,auto:2.2,opts:[['ЛАДНО','#d8265e',()=>{}]]}); }
  else { const s=penalize(15,'fine'); save.debtDay=mskDay(); st4Modal({id:'m3fine',title:'ВАЛИДАТОР: В ДОЛГ',text:'Монет нет — оформляют долг. −'+s+' с.',clock:1,auto:2.2,opts:[['ЭХ','#d8265e',()=>{}]]}); pop('−'+s+' с',h.x,h.y-56,P.red,9); } }
// ---------- ЗОНА: перрон — табло врёт (M3-2) ----------
// Табло: «ВАГОН N ↔» над разметкой; реальная остановка сдвинута (±½ вагона, двери не там); полосы света у реальных дверей за 1.5 с до остановки.
ZONES.mplat={ title:z=>'ПЕРРОН · '+M3_COL[z.kind].n+' · ТАБЛО: ВАГОН '+z.board,
  tip:z=>'жди у разметки, но смотри на жёлтые полосы — двери встанут там; у двери «ВОЙТИ»',
  init(z){ z.len=W; const L=z.len, P2=M3.EXT_BODY+M3.EXT_GAP; z.pitch=P2; z.ph='wait'; z.pT=4.2; z.trainX=-L*1.4; z.boarded=false; z.trains=0; z.inN=0;
    // ожидаемые двери (разметка) — вагоны 1.. справа налево; голова поезда (нос) справа
    z.headX=L-60-178; const dOff=z.kind==='mck'?76:67; z.dOff=dOff; z.cars=[]; for(let k=1;k<=7;k++){ const x0=k===1?z.headX:z.headX-(k-1)*P2; z.cars.push({k,x0,door:x0+(k===1?dOff:dOff-2)}); }
    const lo=SA.l+118, hi=W-SA.r-170; z.exp=z.cars.filter(c=>c.door>=lo&&c.door<=hi); if(!z.exp.length) z.exp=[z.cars[1]]; const bc=z.exp.find(c=>c.k===z.board)||z.exp[Math.floor(z.exp.length/2)]; z.board=bc.k; z.bx=bc.door;
    let s=z.shift*Math.round(P2/2); if(bc.door+s<lo||bc.door+s>hi) s=-s; if(bc.door+s<lo||bc.door+s>hi) s=0; z.sh=s; z.real=z.exp.map(c=>({k:c.k,x:c.door+s,open:0,n:0,cap:ri(3,5)})).filter(d=>d.x>=lo-4&&d.x<=hi+4);
    if(!z.real.length) z.real=[{k:bc.k,x:bc.door,open:0,n:0,cap:4}];
    for(let i=0;i<Math.round(9*(TR.plan&&TR.plan.crowdK||1));i++){ const c=pick(z.exp); const e=mkNpc(qType(z.d||6),c.door+rnd(-18,18),rnd(z.y0+2,z.y1-8)); e.hx=e.x; e.hy=e.y; z.npcs.push(e); }
    const h=G.hero; h.x=Math.max(60,SA.l+60); h.y=(z.y0+z.y1)/2; tev('m3_plat_'+(s?'lie':'true')); },
  nearDoor(z){ const h=G.hero; let b=null; for(const d of z.real) if(!b||Math.abs(d.x-h.x)<Math.abs(b.x-h.x)) b=d; return b; },
  update(z,dt){ const h=G.hero; z.pT-=dt; const L=z.len;
    if(z.ph==='wait'){ if(z.pT<=0){ z.ph='arrive'; z.pT=3; SFX.squeak&&SFX.squeak(); } }
    else if(z.ph==='arrive'){ const k=1-clamp(z.pT/3,0,1); z.trainX=-L*1.4*(1-(1-Math.pow(1-k,2.2))); if(z.pT<=1.5&&!z.lit){ z.lit=1; tev('m3_marks'); } if(z.pT<=0){ z.trainX=0; z.ph='open'; z.pT=9; z.trains++; SFX.doors(); for(const d of z.real){ d.open=0; d.n=0; } say(z.sh?'Двери не у разметки — табло врёт!':'Двери открываются',1.4,z.sh?'#ff9a3a':P.neonLime); } }
    else if(z.ph==='open'){ for(const d of z.real) d.open=Math.min(1,d.open+dt*3); if(z.pT<=0){ z.ph='closing'; z.pT=1.6; say('Осторожно, двери закрываются!',1.5,P.edge); SFX.doors(); } }
    else if(z.ph==='closing'){ if(z.pT<=0){ z.ph='leave'; z.pT=2.2; for(const d of z.real) d.open=0; if(!z.boarded){ tev('m3_missed'); say('Уехала без тебя… следующая скоро',1.8,'#ccc'); } } }
    else if(z.ph==='leave'){ z.trainX+=dt*(200+(2.2-z.pT)*220); if(z.pT<=0){ z.ph='wait'; z.pT=3.5; z.lit=0; z.trainX=-L*1.4; for(const e of z.npcs){ e.door=null; } } }
    const open=z.ph==='open'||z.ph==='closing';
    for(const e of z.npcs){ if(open&&!e.inside){ const d=e.door||(e.door=z.real.reduce((a,b)=>Math.abs(b.x-e.x)<Math.abs(a.x-e.x)?b:a)); if(walkTo(e,d.x,z.y0,38,dt)||(Math.abs(e.x-d.x)<5&&e.y<z.y0+4)){ if(d.n<d.cap){ d.n++; e.inside=true; e.gone=true; } else { e.door=null; e.hx=e.x+rnd(-30,30); } } }
      else if(!open&&e.hx!==undefined){ if(z.lit){ const d=z.real.reduce((a,b)=>Math.abs(b.x-e.x)<Math.abs(a.x-e.x)?b:a); walkTo(e,d.x+(e.x<d.x?-12:12),e.hy,20,dt); } else walkTo(e,e.hx,e.hy,22,dt); } }
    z.npcs=z.npcs.filter(e=>!e.gone);
    if(!open&&z.npcs.length<8){ const c=pick(z.exp); const e=mkNpc(qType(z.d||6),Math.random()<.5?SA.l+70:W-140,rnd(z.y0+6,z.y1-6)); e.hx=c.door+rnd(-18,18); e.hy=rnd(z.y0+2,z.y1-8); z.npcs.push(e); }
    if(open&&!z.boarded){ const d=this.nearDoor(z); z.atDoor=Math.abs(h.x-d.x)<13&&h.y<z.y0+11?d:null; } else z.atDoor=null;
    if(z.boarded){ z.lockHero=true; walkTo(h,z.bd.x,z.y0-14,40,dt); h.y=Math.max(h.y,z.y0-14); z.bT-=dt; if(z.bT<=0&&!z.fin){ z.fin=1; zoneDone(); } }
    z.hint=z.boarded?(TR.m3.first?'первым в вагон — места твои!':'внутри!'):open?(z.atDoor?'ЖМИ «ВОЙТИ»!':'к открытой двери!'):z.lit?'жёлтые полосы — двери встанут тут!':z.ph==='arrive'?'поезд подходит…':'табло: ВАГОН '+z.board+' ↔'; },
  board(z,d){ const h=G.hero; z.boarded=true; z.bd=d; z.bT=.8; d.n++; h.pin=true; h.ghost=true; TR.m3.first=d.n<=2; TR.m3.car=d.k; TR.m3.sh=z.sh; tev(TR.m3.first?'m3_first_wave':'m3_board'); pop(TR.m3.first?'ПЕРВЫМ!':'ВОШЁЛ!',h.x,h.y-52,P.neonLime,9); SFX.pick(); haptic('success'); },
  ctx(z){ const d=z.atDoor; if(!d||z.boarded) return {}; return {b:{label:'ВОЙТИ',col:'#2aa860',fn:()=>this.board(z,d)}}; },
  prog(z){ const h=G.hero, d=this.nearDoor(z); return (z.boarded?1000:0)-Math.abs(h.x-d.x)-Math.abs(h.y-z.y0)+z.trains*30; },
  unstick(z){ const h=G.hero, d=this.nearDoor(z); h.x=d.x; h.y=z.y0+4; if(z.ph==='open'||z.ph==='closing') this.board(z,d); },
  bot(z){ const h=G.hero; const tgt=z.lit||z.ph==='open'||z.ph==='closing'?this.nearDoor(z).x:z.bx; const r={x:tgt,y:z.lit?z.y0+2:z.y0+8}; if(z.atDoor) r.b=1; return r; },
  draw(z){ const c=G.cam, MT=FY0-66, wb=FY0-4, col=M3_COL[z.kind];
    m3Sky(wb); m3City(z,wb-46,.15);
    // пути и контактная сеть
    ctx.fillStyle='#6a6458'; ctx.fillRect(0,wb-14,W,10); ctx.fillStyle='#4a4438'; for(let x=-(Math.round(c)%10);x<W;x+=10) ctx.fillRect(x,wb-12,6,2); ctx.fillStyle='#8a8a94'; ctx.fillRect(0,wb-9,W,1);
    ctx.fillStyle='#3a3a44'; ctx.fillRect(0,wb-86,W,1); for(let x=-(Math.round(c)%150)+40;x<W+20;x+=150){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,wb-96,4,92); ctx.fillStyle='#6a7080'; ctx.fillRect(x,wb-95,2,90); ctx.fillStyle=P.ink; ctx.fillRect(x-10,wb-96,22,3); }
    // поезд
    const tx=Math.round(z.trainX-c); if(atlOk('tr')) m3TrainExt(z,tx,wb-62);
    // навес перрона
    ctx.fillStyle=P.ink; ctx.fillRect(0,MT-50,W,8); ctx.fillStyle='#7a8494'; ctx.fillRect(0,MT-49,W,6); ctx.fillStyle='#9aa4b4'; ctx.fillRect(0,MT-49,W,1); ctx.fillStyle='rgba(10,6,20,.12)'; ctx.fillRect(0,MT-42,W,4);
    // табло «ВАГОН N ↔» над разметкой
    { const bx=Math.round(z.bx-c), w=96, y=Math.max(SA.t+48,MT-36); ctx.fillStyle=P.ink; ctx.fillRect(bx-1,MT-42,2,y-(MT-42)); m3Led(bx-w/2,y,w,'ВАГОН '+z.board+' ↔',z.lit&&z.sh&&Math.floor(G.t*4)%2?'#ff5a3a':'#ffb84a',8); }
    // платформа: край, жёлтая линия, разметка ожидаемых дверей, номера вагонов
    ctx.fillStyle='#b8b4bc'; ctx.fillRect(0,wb,W,H-wb); ctx.fillStyle='#a4a0aa'; for(let x=-(Math.round(c)%32);x<W;x+=32) ctx.fillRect(x,wb,1,H-wb); ctx.fillStyle=P.ink; ctx.fillRect(0,wb,W,1); ctx.fillStyle='#e8d040'; ctx.fillRect(0,wb+3,W,2); ctx.fillStyle='rgba(10,6,20,.18)'; ctx.fillRect(0,wb+1,W,2);
    for(const cr of z.exp){ const x=Math.round(cr.door-c); ctx.fillStyle='#f4f0e4'; ctx.fillRect(x-12,wb+7,2,6); ctx.fillRect(x+10,wb+7,2,6); ctx.fillRect(x-12,wb+12,24,1); G.labels.push([String(cr.k),x,wb+20,7,'#f4f0e4','center',P.ink]); }
    if(z.lit&&z.ph!=='leave') for(const d of z.real){ const x=Math.round(d.x-c), fk=Math.floor(G.t*6)%2; ctx.fillStyle=P.ink; ctx.fillRect(x-14,wb+5,28,6); ctx.fillStyle=fk?'#ffd23f':'#fff3a0'; ctx.fillRect(x-13,wb+6,26,4); ctx.fillStyle='#e0a010'; for(let k=-11;k<12;k+=6) ctx.fillRect(x+k,wb+6,3,4);
      if(z.ph==='arrive'){ ctx.fillStyle=P.ink; ctx.fillRect(x-4,wb+13,9,5); ctx.fillStyle='#ffd23f'; ctx.fillRect(x-3,wb+14,7,1); ctx.fillRect(x-2,wb+15,5,1); ctx.fillRect(x-1,wb+16,3,1); } }
    floorAO();
    drawTripActors([G.hero,...z.npcs]);
    if(!z.boarded){ const open=z.ph==='open'||z.ph==='closing'; const d=this.nearDoor(z); goalArrow(z.lit||open?d.x:z.bx,wb-72,open?P.neonLime:z.lit?P.edge:'#ffb84a'); }
    if(z.ph==='closing'&&Math.floor(G.t*6)%2){ ctx.fillStyle='rgba(255,60,60,.10)'; ctx.fillRect(0,0,W,H); } } };
// экстерьер поезда (P2/P3): голова — целый спрайт (нос справа), прочие вагоны — корпус без носа + межвагонная гармошка; двери по состоянию
function m3TrainExt(z,tx,top){ const A=ATL4.tr, kind=z.kind, spr=kind==='mck'?'lastochka_ext':(TR.idx%2?'mcd2_ext':'mcd_ext'), r=A.f[spr]; if(!r) return; const P2=z.pitch;
  for(const cr of z.cars){ const x=tx+cr.x0; if(x>W+4||x+178<-4) continue; const d=z.real.find(q=>q.k===cr.k); const op=d&&d.open>0&&(z.ph==='open'||z.ph==='closing'); const s=op&&kind==='mck'?'lastochka_ext_open':spr, rr=A.f[s];
    if(cr.k===1) ctx.drawImage(A.img,rr[0],rr[1],rr[2],rr[3],x,top,rr[2],rr[3]);
    else { ctx.drawImage(A.img,rr[0]+2,rr[1],M3.EXT_BODY,rr[3],x,top,M3.EXT_BODY,rr[3]); const gx=x+M3.EXT_BODY; ctx.fillStyle=P.ink; ctx.fillRect(gx,top+14,M3.EXT_GAP,36); ctx.fillStyle='#3a3440'; ctx.fillRect(gx+1,top+15,M3.EXT_GAP-2,34); ctx.fillStyle='#5a5462'; for(let y=top+17;y<top+48;y+=4) ctx.fillRect(gx+1,y,M3.EXT_GAP-2,1); }
    if(op&&kind!=='mck'){ const dx=Math.round(tx+cr.door), o=Math.round(d.open*9); ctx.fillStyle=P.ink; ctx.fillRect(dx-o,top+12,o*2,36); ctx.fillStyle='#4a4038'; ctx.fillRect(dx-o+1,top+13,o*2-2,34); ctx.fillStyle='#ffe0a0'; ctx.fillRect(dx-o+1,top+15,o*2-2,6); ctx.fillStyle='#e8c020'; ctx.fillRect(dx-o-1,top+12,1,36); ctx.fillRect(dx+o,top+12,1,36); }
    if(d&&z.atDoor===d){ ctx.fillStyle=Math.floor(G.t*6)%2?P.neonLime:'#fff'; const dx=Math.round(tx+cr.door); ctx.fillRect(dx-13,top+10,26,1); ctx.fillRect(dx-13,top+49,26,1); } } }
