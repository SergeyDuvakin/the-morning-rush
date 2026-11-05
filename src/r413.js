// 4.1.3 (фаза обучения): меню «ОБУЧЕНИЕ · ГЛАВА» без подписи «новое: …»;
// подменю подлокаций с «← НАЗАД» и «ВСЯ ГЛАВА ▶»; одиночная зона не ставит ✓ главы.
// ПЕРЕХОД добавлен в МЕТРО (решение Сергея 05.11). Машины у перехода — позже.
'use strict';
const R413={ver:'4.1.3'};
if(typeof FB6!=='undefined') FB6.ver=R413.ver;
if(typeof R41!=='undefined') R41.ver=R413.ver;
if(typeof R411!=='undefined') R411.ver=R413.ver;
if(typeof R412!=='undefined') R412.ver=R413.ver;

// ---------- конфиги глав (те же объекты, что startLearn*) ----------
function r413Zones(){
  const metro=LEARN_ZONES().map((z,i)=>({id:['metro.gate','metro.esc','metro.plat','metro.car','metro.exitz'][i],label:['ТУРНИКЕТЫ','ЭСКАЛАТОР','ПЛАТФОРМА','ВАГОН','ВЫХОД'][i],short:null,z}));
  metro.push({id:'metro.passage',label:'ПЕРЕХОД',short:null,z:{k:'passage',title:'ОБУЧЕНИЕ: ПЕРЕХОД',feat:[],flow:'two',d:0}});
  const streetCfg=[
    {id:'street.light',label:'СВЕТОФОР И ПЕРЕУЛОК',short:'СВЕТОФОР',ev:'light',weather:'clear',seed:11},
    {id:'street.works',label:'РЕМОНТ (ДОСКА)',short:'РЕМОНТ',ev:'works',weather:'clear',seed:12},
    {id:'street.puddle',label:'ЛУЖИ',short:null,ev:'puddle',weather:'rain',seed:13},
    {id:'street.ice',label:'ГОЛОЛЁД',short:null,ev:'ice',weather:'snow',seed:14},
    {id:'street.promo',label:'ПРОМОУТЕР',short:null,ev:'promo',weather:'clear',seed:15}];
  const street=streetCfg.map(c=>({id:c.id,label:c.label,short:c.short,z:{k:'street',seg:'street1',ev:c.ev,v:0,weather:c.weather,d:0,seed:c.seed}}));
  const mcdZ=[
    {id:'mcd.mgate',label:'ВАЛИДАТОР',short:null,z:{k:'mgate',kind:'mcd',seg:'mcd',d:0,seed:21}},
    {id:'mcd.mplat',label:'ПЛАТФОРМА И ТАБЛО',short:'ПЛАТФОРМА',z:{k:'mplat',kind:'mcd',seg:'mcd',d:0,seed:21,board:3,shift:1}},
    {id:'mcd.mtrain',label:'ЭЛЕКТРИЧКА И КОНТРОЛЁРЫ',short:'ЭЛЕКТРИЧКА',z:{k:'mtrain',kind:'mcd',seg:'mcd',d:0,seed:22,ride:44,stops:1,crowd:10,ctl:{both:true,at:9},smoker:true,wcEnd:9,news:true,fat:2}},
    {id:'mcd.mexit',label:'ВЫХОД',short:null,z:{k:'mexit',kind:'mcd',seg:'mcd',d:0,seed:23,exit:1}}];
  const bcZ=[
    {id:'bc.bcgate',label:'ТУРНИКЕТ И ОХРАННИК',short:'ТУРНИКЕТ',z:{k:'bcgate',seg:'bc',d:0,seed:41,fails:1,guard:true,qa:0,flip:false}},
    {id:'bc.bclift',label:'ЛИФТ',short:null,z:{k:'bclift',seg:'bc',d:0,seed:42,v:0}},
    {id:'bc.bcstairs',label:'ЛЕСТНИЦА',short:null,z:{k:'bcstairs',seg:'bc',d:0,seed:43,floors:5}}];
  return {
    metro:{n:'МЕТРО',col:'#3d5ab0',mode:'learn',start:()=>startLearn(), done:()=>!!save.learned, items:metro},
    street:{n:'УЛИЦА',col:'#2aa860',mode:'learn2',start:()=>startLearnStreet(), done:()=>!!save.learned2, items:street},
    mcd:{n:'МЦД',col:'#d8501f',mode:'learn3',start:()=>startLearnMcd(), done:()=>!!save.learned3, items:mcdZ},
    bc:{n:'БЦ',col:'#8a5a3a',mode:'learn4',start:()=>startLearnBc(), done:()=>!!save.learned4, items:bcZ}
  };
}
const R413_ORDER=['metro','street','mcd','bc'];

// миграция сейва подлокаций
function r413MigLearnOne(){
  if(!save.learnOne||typeof save.learnOne!=='object'||Array.isArray(save.learnOne)) save.learnOne={};
}
r413MigLearnOne();
{ const _st=store; store=function(){ r413MigLearnOne(); return _st.apply(this,arguments); }; }

// ---------- запуск одной подлокации ----------
function r413LearnOne(ch,i){
  const C=r413Zones()[ch]; if(!C||!C.items[i]) return;
  const it=C.items[i], z=Object.assign({},it.z,{last:true,d:it.z.d|0});
  G.lpick=0; TR._r413one={ch,key:it.id,i};
  startTrip(0,{mode:C.mode,budget:999,zones:[z]});
  if(C.mode==='learn'){ TR.name='Учебная · '+it.label; TR.lw={coins:20,tokens:0,rides:0,unlim:'',debt:0}; TR.ls=0; TR.lA=0; TR.lsw=0; TR.lcard=null; TR.lshown=0; TR.lstart=null;
    // для одиночной зоны промотаем шаги до своей (learn.js while тоже сделает, но сразу ставим на первый шаг зоны)
    while(TR.ls<LSTEPS.length&&LSTEPS[TR.ls][0]!==z.k) TR.ls++;
  }
  else if(C.mode==='learn2'){ TR.name='Учебная улица · '+it.label; }
  else if(C.mode==='learn3'){ TR.name='Учебная электричка · '+it.label; TR.lw3={coins:99,tokens:9,rides:0,unlim:false}; TR.hare=1; TR.hareSeg='mcd'; }
  else if(C.mode==='learn4'){ TR.name='Учебный БЦ · '+it.label; }
  tev('learn_one_'+it.id);
  // карточка «НОВОЕ · ПЕРЕХОД» один раз (без таймера)
  if(it.id==='metro.passage'){ save.tut=save.tut||{}; if(!save.tut.st_passage){ save.tut.st_passage=1; try{ store(); }catch(e){}
    // покажем после старта зоны через небольшой хук
    TR._r413passCard=1; } }
}
function r413StartAll(ch){ const C=r413Zones()[ch]; if(!C) return; G.lpick=0; TR._r413one=null; C.start(); }

// финиш одиночной зоны: НЕ ставим save.learned*, возвращаем в подменю
{ const _tf=tripFinish; tripFinish=function(win,reason){
    if(TR._r413one){ if(TR.done) return; TR.done=true; TR.win=true; G.done=true; G.win=true; G.doneT=0; musOn=false;
      r413MigLearnOne(); save.learnOne[TR._r413one.key]=1; try{ store(); }catch(e){} SFX.win(); return; }
    return _tf.apply(this,arguments); }; }
{ const _sr=showResult; showResult=function(){
    if(TR._r413one){ const ch=TR._r413one.ch; TR._r413one=null; TR.mode='learned'; toTitle(); G.lpick={ch}; say('Готово! Ещё раз или назад',3,P.neonLime); return; }
    return _sr.apply(this,arguments); }; }
// выход из обучения одиночной зоны (ПРОПУСТИТЬ / learnQuit) → в подменю
{ const _lq=typeof learnQuit==='function'?learnQuit:null; if(_lq){ learnQuit=function(){ if(TR._r413one){ const ch=TR._r413one.ch; tev('learn_one_skip'); TR.done=true; TR.lcard=null; TR._r413one=null; musOn=false; toTitle(); G.lpick={ch}; say('Можно выбрать другую подлокацию',2.2,P.neonLime); return; } return _lq.apply(this,arguments); }; } }
// карточка ПЕРЕХОД после init зоны
{ const _tu=tripUpdate; tripUpdate=function(dt){
    if(TR._r413passCard&&TR.z&&TR.z.k==='passage'&&!TR.smod&&TR.fade<=0){ TR._r413passCard=0;
      if(typeof st4Modal==='function') st4Modal({id:'tut',title:'НОВОЕ · ПЕРЕХОД',text:'Подземный переход: держись свободной стороны, у ларьков пахнет, у музыканта можно дать чаевые. Иди вправо.',opts:[['ПОНЯТНО','#2aa860',()=>{ tev('stut_passage'); }]]});
      else if(typeof say==='function') say('ПЕРЕХОД: держись свободной стороны →',3,'#9cf'); }
    return _tu.apply(this,arguments); }; }

// ---------- UI: меню глав + подменю ----------
function r413LabFit(label,short,maxW,fs){ if(txtW(label,fs)<=maxW) return label; if(short&&txtW(short,fs)<=maxW) return short; return short||label; }
function r413DrawChapters(){
  buttons.length=0; G.labels.length=0;
  ctx.fillStyle='rgba(10,6,20,.6)'; ctx.fillRect(0,0,W,H);
  const w=Math.min(W-60,300), hh=112, x=Math.round(W/2-w/2), y=Math.round(Math.max(SA.t+8,H/2-hh/2));
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh);
  G.labels.push(['ОБУЧЕНИЕ · ГЛАВА',W/2,y+14,11,'#d8265e','center',null]);
  const Z=r413Zones(), bw=Math.round((w-30)/2), bh=28, gap=10, y0=y+28;
  R413_ORDER.forEach((ch,i)=>{
    const C=Z[ch], col=i%2, row=Math.floor(i/2), bx=x+10+col*(bw+10), by=y0+row*(bh+gap);
    const mark=C.done()?' ✓':'';
    bigBtn(C.n+mark,bx,by,bw,bh,C.col,()=>{ G.lpick={ch}; SFX.ui&&SFX.ui(); },'lp'+i,9);
  });
  buttons.unshift({x:0,y:0,w:W,h:H,id:'lpx',cb:()=>{ G.lpick=0; }});
}
function r413DrawSub(ch){
  const Z=r413Zones(), C=Z[ch]; if(!C){ G.lpick=1; return r413DrawChapters(); }
  buttons.length=0; G.labels.length=0;
  ctx.fillStyle='rgba(10,6,20,.6)'; ctx.fillRect(0,0,W,H);
  const n=C.items.length, cols=n>=5?3:2;
  const bw0=cols===3?108:130;
  const pw=Math.min(W-40, cols===3?360:300);
  const bh=Math.max(26, Math.round(44*DPR/SC));
  const gap=6, rows=Math.ceil(n/cols);
  const titleH=24, botH=bh+8, gridH=rows*bh+(rows-1)*gap;
  const hh=titleH+8+gridH+botH+10;
  const x=Math.round(W/2-pw/2), y=Math.round(Math.max(SA.t+6, Math.min(H-SA.b-hh-6, H/2-hh/2)));
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,pw+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,pw,hh);
  G.labels.push(['ОБУЧЕНИЕ · '+C.n,W/2,y+14,11,C.col,'center',null]);
  const bw=Math.floor((pw-20-(cols-1)*gap)/cols);
  const fs=9;
  r413MigLearnOne();
  C.items.forEach((it,i)=>{
    const col=i%cols, row=Math.floor(i/cols);
    const bx=x+10+col*(bw+gap), by=y+titleH+8+row*(bh+gap);
    const mark=save.learnOne[it.id]?' ✓':'';
    const lab=r413LabFit(it.label,it.short,bw-10,fs)+mark;
    bigBtn(lab,bx,by,bw,bh,C.col,()=>{ r413LearnOne(ch,i); },'ls'+i,fs);
  });
  const by=y+titleH+8+rows*(bh+gap)+4;
  const half=Math.floor((pw-20-gap)/2);
  bigBtn('← НАЗАД',x+10,by,half,bh,'#5a4a7a',()=>{ G.lpick=1; SFX.ui&&SFX.ui(); },'lsback',9);
  bigBtn('ВСЯ ГЛАВА ▶',x+10+half+gap,by,half,bh,C.col,()=>{ r413StartAll(ch); },'lsall',9);
  // тап мимо панели = назад в меню глав (не закрывать совсем — удобнее)
  buttons.unshift({x:0,y:0,w:W,h:H,id:'lpx',cb:()=>{ G.lpick=1; }});
}
{ const _dt=drawTitle; drawTitle=function(){
    _dt.apply(this,arguments);
    if(!G.lpick) return;
    // перекрываем то, что нарисовали street4ev/office4
    if(G.lpick===1||G.lpick===true) return r413DrawChapters();
    if(G.lpick&&typeof G.lpick==='object'&&G.lpick.ch) return r413DrawSub(G.lpick.ch);
  }; }

window.__r413={ver:R413.ver,zones:r413Zones,learnOne:r413LearnOne,startAll:r413StartAll,order:R413_ORDER};

// ========== раздел 3: поворот у перехода без наложений + A1/A2 поток/автобус/такси ==========
R413.GAP=56; // мин. дистанция между машинами одной полосы (бампер–бампер)
R413.RES_PAD=12;
R413.SPAWN_GAP=220;
R413.MOUTH_GAP=14; // px: низ анфаса в переулке выше верха машины на farY (farY-roadY≈18, спрайт~24)
R413.MOUTH_X=70;  // полуширина рта по x от центра переулка

function r413TurnW(q){
  if(!q) return 56;
  if(q.ph==='tout'||q.ph==='tin'){
    const v=r412TurnView(q);
    if(v==='side') return r412SideW(q.mi);
    const F=r412TFr(q.mi,v); return Math.round((F?F[2]:24)*r412K(q.y));
  }
  if(q.ph==='min') return r412SideW(q.mi);
  return Math.round(24*r412K(q.y||0));
}
function r413CarBox(q){
  // поток
  if(q.spr){ const w=q.w||60, g=st4Geo(), y=q.dir>0?g.farY:g.carY; return {a:q.x,b:q.x+w,y,dir:q.dir,q}; }
  const w=r413TurnW(q), y=q.y|0; return {a:q.x-w/2,b:q.x+w/2,y,dir:q.d,q};
}
function r413MaxTurnW(mi){
  let m=r412SideW(mi);
  for(const v of ['front','f15','f30','f45','f60','rear','r15','r30','r45','r60']){ const F=r412TFr(mi,v); if(F) m=Math.max(m,F[2]); }
  return m;
}
// прогноз: свободно ли окно на дугу T+0.3 с
function r413WindowClear(z,q,T){
  const g=st4Geo(), vx=z.cx+z.cw/2, wMax=r413MaxTurnW(q.mi);
  const xs=q.x, xe=vx+q.d*30, x0=Math.min(xs,xe)-wMax/2, x1=Math.max(xs,xe)+wMax/2;
  const lanes=q.d<0?[1,-1]:[q.d]; // выезд налево пересекает дальнюю
  const horizon=T+0.3;
  for(const d of lanes){
    for(const c of z.cars||[]){
      if(c.dir!==d) continue;
      const w=c.w||60, v=c.v||100;
      // прогноз положения переднего бампера
      const front0=d>0?c.x+w:c.x, front1=front0+d*v*horizon;
      const a=Math.min(front0,front1)-w, b=Math.max(front0,front1);
      if(b>x0-R413.RES_PAD&&a<x1+R413.RES_PAD) return false;
    }
    // уже стоящие/ездящие vc в полосе
    for(const o of z.vc||[]){
      if(o===q) continue;
      if(o.ph==='min'&&o.d===d&&!o.wt412){ const w=r412SideW(o.mi); if(o.x+w/2>x0-20&&o.x-w/2<x1+20) return false; }
      if((o.ph==='tout'||o.ph==='tin')&&o.d===d) return false;
    }
  }
  return true;
}
function r413SetRes(z,q){
  const wMax=r413MaxTurnW(q.mi), vx=z.cx+z.cw/2;
  const xs=q.xs!=null?q.xs:q.x, xe=q.xe!=null?q.xe:vx+q.d*30;
  z.turnRes412={x0:Math.min(xs,xe)-wMax/2,x1:Math.max(xs,xe)+wMax/2,lanes:q.d<0?[1,-1]:[q.d],until:G.t+R412.TURN_T+0.05,d:q.d,q};
}
function r413ClearRes(z){ if(z.turnRes412&&(!z.vc||!z.vc.some(q=>q.ph==='tout'||q.ph==='tin'))) z.turnRes412=null; }
function r413MouthY(g){ return g.roadY-R413.MOUTH_GAP; }
/** дальняя полоса пересекает рот переулка по x? */
function r413MouthFarBusy(z,pad){
  pad=pad==null?R413.MOUTH_X:pad; const mid=z.cx+z.cw/2, a=mid-pad, b=mid+pad;
  for(const c of z.cars||[]){ if(c.dir<=0||c.spl) continue; const ca=c.x, cb=c.x+(c.w||60); if(Math.min(cb,b)-Math.max(ca,a)>2) return true; }
  return false;
}
/** экранный AABB анфаса (низ = y) и боковой машины потока */
function r413MouthVisOverlap(z,q,c){
  const g=st4Geo(); if(c.dir<=0||c.spl) return 0;
  const k=r412K(q.y), h=Math.round(24*k), top=q.y-h+1, bot=q.y;
  const r=ATL4.tr&&ATL4.tr.f[c.spr], ch=r?r[3]:26, cTop=g.farY-ch, cBot=g.farY;
  const yOv=Math.min(bot,cBot)-Math.max(top,cTop); if(yOv<=0) return 0;
  const w=Math.round(24*k), xa=q.x-w/2, xb=q.x+w/2, ca=c.x, cb=c.x+(c.w||60);
  const xOv=Math.min(xb,cb)-Math.max(xa,ca); return xOv>0&&yOv>0?Math.min(xOv,yOv):0;
}

// --- усиленный tick перекрёстка: окно перед tout, резерв, подшаги dt ---
const _r412VcTick=r412VcTick;
r412VcTick=function(z,dt){
  // подшаги при большом dt
  const maxStep=1/30; let left=dt;
  while(left>1e-6){ const s=Math.min(left,maxStep); _r413VcTickOnce(z,s); left-=s; }
};
function _r413VcTickOnce(z,dt){
  const h=G.hero, g=st4Geo(), cx=z.cx, CW=z.cw, vx=cx+CW/2, stopY=z.y0-9, L=SEV.light, pedGreen=z.v!==1&&L.green(z), yTop=g.facadeB-42, yRoad=g.roadY+2;
  z.vcT412=(z.vcT412===undefined?.4:z.vcT412)-dt;
  if(z.vcT412<=0&&z.vc.length<3){ const mi=Math.floor(Math.random()*R412C.M.length); if(Math.random()<.6) z.vc.push({ph:'down',mi,x:vx-12*r412K(yTop),y:yTop,v:z.v===1?48:72,d:Math.random()<.5?1:-1,hk:0});
    else { const d=Math.random()<.5?1:-1, x=d>0?G.cam-50:G.cam+W+50; if(!r412LaneBusy(z,d,x,80,120)) z.vc.push({ph:'min',mi,d,x,y:r412Lane(d),v:100,hk:0}); }
    z.vcT412=z.v===1?rnd(2.2,4):rnd(1.4,2.2); }
  for(const q of z.vc){ if(!q.ph){ q.ph='down'; q.mi=q.mi|0; q.d=q.d||1; } q.hk=Math.max(0,(q.hk||0)-dt); }
  const D=z.vc.filter(q=>q.ph==='down').sort((a,b)=>b.y-a.y), U=z.vc.filter(q=>q.ph==='up').sort((a,b)=>a.y-b.y), busyTurn=z.vc.some(q=>q.ph==='tin'||q.ph==='tout');
  const mouthY=r413MouthY(g), farAtMouth=r413MouthFarBusy(z);
  for(let i=0;i<D.length;i++){ const q=D[i], ahead=D[i-1];
    // по умолчанию держимся выше рта: спрайт анфаса не пересекается с крышей far-lane
    let lim=(pedGreen&&q.y<=stopY+1)?stopY:mouthY;
    if(ahead) lim=Math.min(lim,ahead.y-30*r412K(ahead.y));
    const turning=z.vc.find(o=>o.ph==='tout'||o.ph==='tin');
    if(turning) lim=Math.min(lim, Math.min(stopY+2, turning.y-34*r412K(turning.y)));
    const near=Math.abs(h.x-q.x)<20&&h.y>q.y-2&&h.y-q.y<34; if(near&&z.v===1&&q.y<z.y0) lim=Math.min(lim,q.y);
    // у hold-линии ждём окно; к yRoad подъезжаем только когда рот свободен
    if(q.y>=mouthY-2&&!busyTurn){
      const blocked=!r413WindowClear(z,q,R412.TURN_T)||r412LaneBusy(z,q.d,vx+q.d*30,190,60)||z.vc.some(o=>o.ph==='tin')||(q.d<0&&r412LaneBusy(z,1,vx,190,60))||farAtMouth;
      if(blocked){ lim=Math.min(lim,mouthY); q.waitWin413=1; }
      else { q.waitWin413=0; lim=yRoad; }
    }
    const y0=q.y;
    if(q.y>lim) q.y=Math.max(lim,q.y-90*dt);
    else q.y=Math.min(q.y+q.v*dt,lim);
    q.mv=(q.y-y0)/Math.max(dt,1e-4); q.x=vx-12*r412K(q.y);
    if(q.y>=yRoad-.01&&!q.waitWin413&&!turning&&!farAtMouth){ const tx=vx+q.d*30; if(!r412LaneBusy(z,q.d,tx,190,60)&&!z.vc.some(o=>o.ph==='tin')&&!(q.d<0&&r412LaneBusy(z,1,vx,190,60))&&r413WindowClear(z,q,R412.TURN_T)){ q.ph='tout'; q.t=0; q.xs=q.x; q.ys=q.y; q.xe=vx+q.d*30; q.ye=r412Lane(q.d); r413SetRes(z,q); } } }
  for(const q of z.vc.filter(q=>q.ph==='min')){ const w=r412SideW(q.mi), xs=vx+12-q.d*44, dist=(xs-q.x)*q.d;
    const winOk=r413WindowClear(z,Object.assign({},q,{d:q.d}),R412.TURN_T);
    const canGo=!pedGreen&&!D.some(o=>o.y>stopY+4)&&!busyTurn&&!(q.d<0&&r412LaneBusy(z,1,vx+12,150,70))&&winOk;
    const vT=dist<110?Math.max(28,dist*.9):100; q.v+=(vT-q.v)*Math.min(1,dt*3);
    // не врезаемся в поток своей полосы (и в другие min) — учитываем уже начатое наложение
    let maxX=null;
    const consider=(stop)=>{ if(maxX==null||(q.d>0?stop<maxX:stop>maxX)) maxX=stop; };
    for(const c of z.cars||[]){ if(c.dir!==q.d||c.spl) continue;
      const ca=c.x, cb=c.x+(c.w||60), ma=q.x-w/2, mb=q.x+w/2;
      const clear=q.d>0?ca-mb:ma-cb; // >0 — зазор впереди
      if(clear<R413.GAP+80&&clear>-w-4) consider(q.d>0?ca-R413.GAP:cb+R413.GAP); }
    for(const o of z.vc){ if(o===q||o.ph!=='min'||o.d!==q.d) continue;
      const ow=r412SideW(o.mi), oa=o.x-ow/2, ob=o.x+ow/2, ma=q.x-w/2, mb=q.x+w/2;
      const clear=q.d>0?oa-mb:ma-ob; if(clear<R413.GAP+80&&clear>-ow-4) consider(q.d>0?oa-R413.GAP:ob+R413.GAP); }
    let nx=q.x+q.d*q.v*dt;
    if(maxX!=null){ const front=q.d>0?nx+w/2:nx-w/2; if((maxX-front)*q.d<0){ nx=q.d>0?maxX-w/2:maxX+w/2; q.v=Math.max(0,q.v-260*dt); } }
    // жёсткая сепарация, если всё ещё пересекаемся
    for(const c of z.cars||[]){ if(c.dir!==q.d||c.spl) continue;
      const ca=c.x, cb=c.x+(c.w||60), ma=nx-w/2, mb=nx+w/2; if(Math.min(mb,cb)-Math.max(ma,ca)<=2) continue;
      nx=q.d>0?ca-R413.GAP-w/2:cb+R413.GAP+w/2; q.v=0; }
    if(!canGo&&(xs-nx)*q.d<0) nx=xs; q.x=nx; q.mv=q.v; q.wt412=!canGo&&Math.abs(xs-q.x)<3; q.waitWin413=!winOk&&Math.abs(xs-q.x)<8;
    if(canGo&&(xs-q.x)*q.d<=1){ q.ph='tin'; q.t=0; q.xs=q.x; q.ys=q.y; q.xe=vx+12; q.ye=yRoad; r413SetRes(z,q); } }
  for(const q of z.vc.filter(q=>q.ph==='tout'||q.ph==='tin')){ q.t=Math.min(1,q.t+dt/R412.TURN_T); const e=q.ph==='tout'?1-Math.cos(q.t*Math.PI/2):.5-.5*Math.cos(q.t*Math.PI), th=e*Math.PI/2; q.th=th;
    if(q.ph==='tout'){ q.x=q.xs+(q.xe-q.xs)*(1-Math.cos(th)); q.y=q.ys+(q.ye-q.ys)*Math.sin(th); }
    else { q.x=q.xs+(q.xe-q.xs)*Math.sin(th); q.y=q.ys+(q.ye-q.ys)*(1-Math.cos(th)); }
    if(z.turnRes412&&z.turnRes412.q===q){ const w=r413TurnW(q); z.turnRes412.x0=Math.min(z.turnRes412.x0,q.x-w/2); z.turnRes412.x1=Math.max(z.turnRes412.x1,q.x+w/2); }
    if(q.t>=1){ if(q.ph==='tout'){ const m=R412C.M[q.mi], w=r412SideW(q.mi); const vx0=Math.min(120,Math.abs(q.xe-q.xs)*Math.PI*Math.PI/4/R412.TURN_T); z.cars.push({spr:m.spr,dir:q.d,x:q.xe-w/2,v:Math.max(45,vx0),vt412:rnd(90,130),w,from412:1}); q.dead=1; tev('light_merge'); }
      else { q.ph='up'; q.v=14; } if(z.turnRes412&&z.turnRes412.q===q) z.turnRes412=null; } }
  for(let i=0;i<U.length;i++){ const q=U[i]; q.v=Math.min(58,q.v+50*dt); const y0=q.y; q.y-=q.v*r412K(q.y)*dt; q.mv=(y0-q.y)/Math.max(dt,1e-4); q.x=vx+12*r412K(q.y); if(q.y<yTop-2) q.dead=1; }
  for(const q of z.vc){ if(q.dead||(q.ph!=='down'&&q.ph!=='up'&&q.ph!=='tin'&&q.ph!=='tout')) continue; if(!(q.mv>5)) continue;
    const near=Math.abs(h.x-q.x)<20&&((q.ph==='up')?(h.y<q.y+2&&q.y-h.y<34):(h.y>q.y-2&&h.y-q.y<34));
    if(near&&!q.hk&&Math.abs(h.y-q.y)<26){ q.hk=1.2; st4Beep(); tev('honk'); }
    if(!h.stun&&Math.abs(h.x-q.x)<16&&Math.abs(h.y-q.y)<6&&q.y>z.y0-4&&q.y<z.y1+6){ tev('light_hit'); penalize(3,'honk'); TR.nerves=Math.max(0,TR.nerves-5); h.x=Math.min(h.x,cx)-40+20; h.x=Math.max(8,h.x); h.stun=.45; h.set('hurt'); SFX.hurt(); shake(2); haptic('error'); pop('−3 с',h.x,h.y-52,'#ff8a8a',8); say('БИИП! На красный нельзя — откинуло назад',2,'#ffd23f'); } }
  z.vc=z.vc.filter(q=>!q.dead&&!(q.ph==='min'&&(q.d>0?q.x>G.cam+W+120:q.x<G.cam-120)));
  for(const q of z.vc){ if(q.ph!=='min') continue; const w=r412SideW(q.mi);
    for(const c of z.cars||[]){ if(c.dir!==q.d||c.spl) continue;
      const ca=c.x, cb=c.x+(c.w||60), ma=q.x-w/2, mb=q.x+w/2;
      if(Math.min(mb,cb)-Math.max(ma,ca)<=2) continue;
      // min уступает потоку вперёд: если поток впереди по направлению — откат min; иначе сдвиг потока назад
      const carAhead=q.d>0?ca>=q.x:cb<=q.x;
      if(carAhead){ q.x=q.d>0?ca-R413.GAP-w/2:cb+R413.GAP+w/2; q.v=0; }
      else { c.x=q.d>0?ma-R413.GAP-(c.w||60):mb+R413.GAP; c.v=Math.min(c.v||0,16); c.brake=1; c.brake412=1; }
    }
  }
  r413ClearRes(z);
}

// поворотник у ждущей окно машины (2 px #ffb43a, 2 Гц)
{ const _draw=r412VcDrawRoad;
  // replaced below by depth-aware draw
}

// --- поток: дистанция на ВСЕХ улицах + резерв + автобус/такси; плавное торможение ---
{ const _ct=st4CarsTick;
  st4CarsTick=function(z,dt){
    // базовая логика спавна без движения — вызовем оригинал, потом поправим
    // Чтобы оригинал не двигал «сквозь», сначала применим свой спавн-гард через флаг
    const cars0=(z.cars||[]).slice();
    const r=_ct.apply(this,arguments);
    if(!z||z.carsOff) return r;
    const g=st4Geo();
    // ускорение after-merge
    for(const q of z.cars){ if(q.vt412){ q.v=Math.min(q.vt412,q.v+70*dt); if(q.v>=q.vt412) q.vt412=0; } }
    // собрать препятствия по полосам: поток + vc на дуге/полосе + автобус + такси
    function staticObs(d){
      const o=[];
      if(d>0){ // дальняя полоса: автобус (ждёт или уезжает) и такси
        if(z.bus){ const r=ATL4.tr&&ATL4.tr.f.bus_ext; const w=r?r[2]:130; o.push({a:z.bus.bx,b:z.bus.bx+w,static:1}); }
        if(z.taxi){ const r=ATL4.tr&&ATL4.tr.f.taxi; const w=r?r[2]:60; o.push({a:z.taxi.x,b:z.taxi.x+w,static:1}); }
        // рот переулка: если анфас уже у hold-линии — поток дальней не лезет под него по x
        if(z.ev==='light'&&z.cx!=null&&(z.vc||[]).some(q=>q.ph==='down'&&q.y>=r413MouthY(st4Geo())-2)){
          const mid=z.cx+z.cw/2; o.push({a:mid-R413.MOUTH_X,b:mid+R413.MOUTH_X,static:1,mouth:1});
        }
      }
      const R=z.turnRes412;
      if(R&&R.lanes.includes(d)&&G.t<R.until) o.push({a:R.x0-R413.RES_PAD,b:R.x1+R413.RES_PAD,static:1,res:1});
      for(const q of z.vc||[]){
        if(q.ph==='min'&&q.d===d){ const w=r412SideW(q.mi); o.push({a:q.x-w/2,b:q.x+w/2,static:1}); }
        if((q.ph==='tout'||q.ph==='tin')){
          const laneY=r412Lane(d);
          if(q.d===d||Math.abs(q.y-laneY)<28||(q.d<0&&d===1)){ const w=r413TurnW(q); o.push({a:q.x-w/2,b:q.x+w/2,static:1}); }
        }
      }
      return o;
    }
    for(const d of [1,-1]){
      const lane=z.cars.filter(q=>q.dir===d&&!q.spl);
      lane.sort((a,b)=>d>0?(b.x-a.x):(a.x-b.x)); // голова колонны первой
      const extras=staticObs(d);
      for(let i=0;i<lane.length;i++){
        const q=lane[i], w=q.w||60;
        // цель — либо бампер впереди идущей, либо ближайший static впереди
        let limit=null; // x, до которого можно подъехать передним бампером
        if(i>0){ const lead=lane[i-1], lw=lead.w||60; limit=d>0?lead.x-R413.GAP:lead.x+lw+R413.GAP; }
        for(const e of extras){
          // препятствие впереди ИЛИ уже перекрыто (ещё не проехали хвост)
          if(d>0){ if(e.b>q.x&&(limit==null||e.a-R413.GAP<limit)) limit=e.a-R413.GAP; }
          else { if(e.a<q.x+w&&(limit==null||e.b+R413.GAP>limit)) limit=e.b+R413.GAP; }
        }
        q.brake412=0; q.brake=0;
        if(limit!=null){
          const front=d>0?q.x+w:q.x;
          const gap=d>0?limit-front:front-limit;
          if(gap<R413.GAP+40){ // тормозим плавно
            const want=Math.max(0, gap*1.2);
            if(q.v>want) q.v=Math.max(want, q.v-260*dt);
            q.brake=1; q.brake412=1;
            // не телепортируем — только поджимаем если сильно врезались
            if(gap<0){ if(d>0) q.x=limit-w; else q.x=limit; }
          }
        }
      }
    }
    // спавн: если новая машина слишком близко к резерву или к хвосту — отодвинуть/убрать
    for(const q of z.cars){
      if(cars0.includes(q)) continue; // новая
      const d=q.dir, R=z.turnRes412;
      if(R&&R.lanes.includes(d)){
        const front=d>0?q.x+(q.w||60):q.x;
        const dist=d>0?R.x0-front:front-R.x1;
        if(dist<R413.SPAWN_GAP&&dist>-80){ q.dead413=1; }
      }
      // к хвосту своей полосы
      for(const o of z.cars){ if(o===q||o.dir!==d||o.spl) continue;
        const gap=d>0?(q.x-(o.x+(o.w||60))):(o.x-(q.x+(q.w||60)));
        if(Math.abs((d>0?q.x:q.x)-(d>0?o.x:o.x))<10) continue;
        if(gap>=0&&gap<R413.GAP){ q.dead413=1; break; }
      }
    }
    z.cars=z.cars.filter(q=>!q.dead413);
    return r;
  };
}

// --- отрисовка: единый проход по y (глубина) для потока + дуг vc ---
function r413DrawBlinker(q,sx,y){
  if(!(q.waitWin413||q.wt412)) return;
  if(Math.floor(G.t*4)%2){ ctx.fillStyle='#ffb43a'; ctx.fillRect(Math.round(sx+(q.d>0?r413TurnW(q)/2-3:-r413TurnW(q)/2)),Math.round(y-6),2,2); }
}
{ const _cd=st4CarsDraw;
  st4CarsDraw=function(z){
    if(!z||z.carsOff||!atlOk('tr')) return _cd.apply(this,arguments);
    const g=st4Geo(), items=[], light=z.ev==='light'&&z.vc&&z.vc.length;
    // поток
    for(const q of z.cars||[]){ const r=ATL4.tr.f[q.spr]; if(!r) continue; const far=q.dir>0||q.spl, base=far?g.farY:g.carY;
      items.push({y:base,draw:()=>{ const sx=Math.round(q.x-G.cam), y=base-r[3]+Math.round(Math.sin(G.t*9+q.x*.1)*.5);
        if(sx<-r[2]-4||sx>W+4) return; ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(sx+3,base-2,r[2]-6,3); atlDraw(ctx,'tr',q.spr,sx,y,q.dir<0); veh411(sx,y,r[2],r[3]);
        if(q.brake){ ctx.fillStyle='#ff3a3a'; ctx.fillRect(q.dir>0?sx:sx+r[2]-2,y+r[3]-12,2,2); } }}); }
    // vc на дороге (min/tout/tin) — только light
    if(light) for(const q of z.vc){ if(q.ph==='down'||q.ph==='up') continue;
      items.push({y:q.y,draw:()=>{ const sx=q.x-G.cam, y=Math.round(q.y);
        if(q.ph==='min'){ r412DrawSide(q.mi,q.d,q.x,y); r413DrawBlinker(q,sx,y); }
        else { const v=r412TurnView(q); if(v==='side') r412DrawSide(q.mi,q.d,q.x,y); else r412DrawView(q.mi,v,sx,y,r412K(q.y),q.d<0&&v!=='front'&&v!=='rear'); }
        if(q.hk>0) st4Honk(G.hero,q.x,y-28); }}); }
    // автобус и такси в общем проходе по y
    if(z.bus){ const B=z.bus, r=ATL4.tr.f.bus_ext; if(r){ const nm=B.st==='wait'?'bus_ext_open':'bus_ext';
      items.push({y:g.farY,trans:1,draw:()=>{ const bx=Math.round(B.bx-G.cam), by=g.farY-r[3]; atlDraw(ctx,'tr',nm,bx,by,false); veh411(bx,by,r[2],r[3]); }}); } }
    if(z.taxi){ const r=ATL4.tr.f.taxi; if(r) items.push({y:g.farY,trans:1,draw:()=>{ const sx=Math.round(z.taxi.x-G.cam); atlDraw(ctx,'tr','taxi',sx,g.farY-r[3],true); veh411(sx,g.farY-r[3],r[2],r[3]);
      if(Math.floor(G.t*2)%2){ ctx.fillStyle='#3aff7a'; ctx.fillRect(sx+28,g.carY-6-r[3]-2,3,2); } }}); }
    items.sort((a,b)=>a.y-b.y||0);
    z._r413DrewTrans=1;
    for(const it of items) it.draw();
    if(z.weather==='rain'){ for(const q of z.cars||[]){ const r=ATL4.tr.f[q.spr]; if(!r) continue; const far=q.dir>0||q.spl, base=far?g.farY:g.carY, sx=Math.round(q.x-G.cam);
      ctx.fillStyle='rgba(170,210,255,.8)'; const wx=q.dir>0?sx+6:sx+r[2]-6; for(let k=0;k<4;k++){ const ph=(G.t*6+k*.25+q.x*.01)%1; ctx.fillRect(Math.round(wx-q.dir*ph*12),Math.round(base-2-Math.sin(ph*3.14)*6),1,1); } } }
  };
  // столбик остановки — здесь; кузов автобуса/такси уже в CarsDraw
  const _td=st4TransDraw;
  st4TransDraw=function(z,layer){
    if(layer==='front'&&z&&z._r413DrewTrans){
      z._r413DrewTrans=0;
      const g=st4Geo(), c=G.cam, B=z.bus;
      if(B){ const sx=Math.round(B.stop-c);
        ctx.fillStyle=P.ink; ctx.fillRect(sx-1,g.curbY-40,3,40); ctx.fillStyle='#5a5a68'; ctx.fillRect(sx,g.curbY-39,1,39);
        ctx.fillStyle=P.ink; ctx.fillRect(sx-7,g.curbY-50,15,12); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-6,g.curbY-49,13,10);
        ctx.fillStyle=P.ink; ctx.fillRect(sx-4,g.curbY-47,9,5); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-3,g.curbY-46,2,2); ctx.fillRect(sx+2,g.curbY-46,2,2);
        ctx.fillStyle=P.ink; ctx.fillRect(sx-4,g.curbY-42,2,1); ctx.fillRect(sx+3,g.curbY-42,2,1); }
      return;
    }
    return _td.apply(this,arguments);
  };
}

// на обычных улицах (не light) — та же дистанция потока уже в нашем st4CarsTick (работает для всех).
// Спавн-гард от резерва на non-light не нужен.

// визуальный зазор: анфас у рта рисуем чуть выше, если AABB ещё цепляет far-lane
{ const L=SEV.light, _dc=L.drawCars;
  L.drawCars=function(z,front){
    const g=st4Geo(), saved=[];
    for(const q of z.vc||[]){
      if(q.ph!=='down'&&q.ph!=='up') continue;
      let bias=0;
      if(q.ph==='down'&&q.y>r413MouthY(g)-6){
        for(const c of z.cars||[]){ const ov=r413MouthVisOverlap(z,q,c); if(ov>0) bias=Math.max(bias, Math.min(10, ov+2)); }
      }
      if(bias){ saved.push([q,q.y]); q._drawY413=q.y-bias; q.y=q._drawY413; }
    }
    const r=_dc.apply(this,arguments);
    for(const [q,y] of saved){ q.y=y; delete q._drawY413; }
    return r;
  };
}
window.__r413.turn={w:r413TurnW,box:r413CarBox,window:r413WindowClear,GAP:R413.GAP,mouthY:r413MouthY,mouthFar:r413MouthFarBusy,mouthVis:r413MouthVisOverlap,MOUTH_GAP:R413.MOUTH_GAP};
