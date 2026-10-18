'use strict';
const R41={ver:'4.1.0'};
function wrap41(s,w,f){ const ws=s.split(' '), L=[]; let cur=''; for(const x of ws){ const t=cur?cur+' '+x:x; if(txtW(t,f)<=w) cur=t; else { if(!cur) return null; L.push(cur); cur=x; if(txtW(cur,f)>w) return null; } } if(cur) L.push(cur); return L; } if(typeof FB6!=='undefined') FB6.ver=R41.ver;
// ================= R41 (v4.1.0): правки «парящих» персонажей + полные маршруты =================
// ---------- депо: герой сидит на скамейке на полу депо (раньше — в пустоте), под поездами рельсы ----------
CUTS.depot.draw=(t,c)=>{ ctx.fillStyle='#14101c'; ctx.fillRect(0,0,W,H); const fy=Math.round(H*.8);
  for(let i=0;i<3;i++){ const y=Math.round(H*.3+i*34), x0=Math.round(-20+i*30-t*10); ctx.fillStyle='#3a4a5a'; ctx.fillRect(x0,y,Math.round(W*.8),24); ctx.fillStyle='#ffe9a830'; for(let x=0;x<W*.8;x+=24) ctx.fillRect(x0+6+x,y+4,14,8);
    ctx.fillStyle='#1a1a22'; ctx.fillRect(x0+10,y+24,8,4); ctx.fillRect(Math.round(x0+W*.8-18),y+24,8,4); ctx.fillStyle='#5a5a66'; ctx.fillRect(0,y+28,W,2); ctx.fillStyle='#2a2430'; for(let x=(i*7)%16;x<W;x+=16) ctx.fillRect(x,y+30,6,2); }
  ctx.fillStyle='#2a2a34'; ctx.fillRect(0,fy,W,H-fy); ctx.fillStyle=P.ink; ctx.fillRect(0,fy,W,2); ctx.fillStyle='#e8c020'; ctx.fillRect(0,fy+3,W,2); ctx.fillStyle='#22222a'; for(let x=0;x<W;x+=40) ctx.fillRect(x,fy+6,1,H-fy-6);
  // скамейка: сиденье на высоте ~ колена, ножки на полу
  const hx=Math.round(W*.5), sc=1.2, seat=Math.round(fy+16-18*sc), bw=Math.round(70*sc);
  ctx.fillStyle=P.ink; ctx.fillRect(hx-bw/2-1,seat-1,bw+2,6); ctx.fillStyle='#8a5a3a'; ctx.fillRect(hx-bw/2,seat,bw,4); ctx.fillStyle=P.ink; ctx.fillRect(hx-bw/2+4,seat+5,3,fy+16-seat-5); ctx.fillRect(hx+bw/2-7,seat+5,3,fy+16-seat-5);
  ctx.fillRect(hx-bw/2,seat-16,bw,2); ctx.fillStyle='#6a4a2a'; ctx.fillRect(hx-bw/2,seat-14,bw,3);
  spr(heroSpec(heroId),'sit',0,'ko',hx,Math.round(seat+9*sc),false,sc); R41.depot={seat,fy,hx};
  G.labels.push(['Z z z',W*.5+24,seat-48,10,'#9cf']); G.labels.push(['УЕХАЛ В ДЕПО',W/2,H*.12,15,'#9cf']); sub('Проснулся от тишины. Механик: «Ты кто?»'); };
// =====================================================================================================
// ПОЛНЫЕ МАРШРУТЫ (ROUTES_SPEC round4): каждый день — ДОМ → ОФИС из 3 экранов; открываются целые маршруты (очки ИЛИ дни, что раньше)
// =====================================================================================================
const RT41_STREET=['light','puddles','promoter','pigeons','construction','accident','ice'], RT41_ST2=['scooters','couriers','coffee'], RT41_BC=['lift','stairs14','colleague'];
const ROUTES41=[
  {id:1,n:'ПЕРВЫЙ ДЕНЬ',idx:1,segs:['street1','metro','street2'],ev:['light'],evN:{street1:1,street2:0},stops:2,pts:0,days:0,len:'2:30–3:00',neu:'турникет, эскалатор, вагон'},
  {id:2,n:'ЧЕРЕЗ СВЕТОФОР',idx:4,segs:['street1','metro','street2'],ev:['light','puddles','pigeons','coffee'],evN:{street1:1,street2:1},stops:2,pts:1200,days:2,len:'3:20–3:50',neu:'светофор, лужи, кофейня'},
  {id:3,n:'С ПЕРЕСАДКОЙ',idx:8,segs:['street1','metro','street2'],ev:['light','puddles','promoter','pigeons','couriers','coffee'],evN:{street1:1,street2:1},transfer:1,stops:2,pts:3500,days:4,len:'4:00–4:30',neu:'пересадка, промоутер'},
  {id:4,n:'АВТОБУС ДО МЕТРО',idx:10,segs:['street1','metro','street2'],ev:['pigeons','construction','ice','puddles','scooters','couriers','coffee'],evN:{street1:1,street2:1},bus:1,stops:3,pts:6500,days:6,len:'4:20–4:50',neu:'автобус, стройка, самокаты'},
  {id:5,n:'БИЗНЕС-ЦЕНТР',idx:12,segs:['street1','metro','street2','bc'],ev:[...RT41_STREET,...RT41_ST2,...RT41_BC],evN:{street1:2,street2:1,bc:1},stops:3,pts:10000,days:8,len:'4:40–5:10',neu:'БЦ: турникет, лифт, лестница'},
  {id:6,n:'ПО КОЛЬЦУ (МЦК)',idx:14,segs:['street1','metro','mck','street2'],ev:[...RT41_STREET,...RT41_ST2],evN:{street1:2,street2:2},stops:2,pts:15000,days:11,len:'5:00–5:40',neu:'МЦК'},
  {id:7,n:'ИЗ ОБЛАСТИ (МЦД)',idx:16,segs:['street1','mcd','metro','street2','bc'],ev:[...RT41_STREET,...RT41_ST2,...RT41_BC,'controllers'],evN:{street1:2,street2:1,bc:1},scr:{mcd:1},stops:2,pts:21000,days:14,len:'5:40–6:20',neu:'МЦД, контролёры'},
  {id:8,n:'ЧЕРЕЗ ВЕСЬ ГОРОД',idx:19,segs:['street1','metro','mck','street2','bc'],ev:[...RT41_STREET,...RT41_ST2,...RT41_BC,'controllers'],evN:{street1:2,street2:2,bc:1},bus:1,transfer:1,stops:2,pts:28000,days:18,len:'6:30–7:00',neu:'всё сразу'} ];
const RT41_SCR={street1:1,metro:2,mck:2,mcd:2,street2:3,bc:3};
const RT41_SN=['ДОМ → МЕТРО','МЕТРО','МЕТРО → ОФИС'];
function rt41(id){ return ROUTES41.find(r=>r.id===id)||ROUTES41[0]; }
function rt41ByIdx(idx){ return ROUTES41.find(r=>r.idx===idx)||null; }
function rt41Scr(R,seg){ return (R&&R.scr&&R.scr[seg])||RT41_SCR[seg]||2; }
// ---------- сейв ----------
function rt41Init(s){ s=s||save; if(!s.routes||typeof s.routes!=='object'||Array.isArray(s.routes)) s.routes={};
  const r=s.routes; if(!Array.isArray(r.open)) r.open=[1]; r.open=[...new Set([1,...r.open.map(Number).filter(x=>x>=1&&x<=8)])].sort((a,b)=>a-b);
  if(!r.best||typeof r.best!=='object') r.best={}; if(!r.stars||typeof r.stars!=='object') r.stars={}; r.days=Math.max(0,r.days|0); if(!Array.isArray(r.seen)) r.seen=r.open.slice();
  if(!r.open.includes(r.cur|0)) r.cur=r.open[r.open.length-1]; if(!s.cut||typeof s.cut!=='object') s.cut={}; s.cut.line1=1; s.cut.line2=1; /* старые ролики «новая линия» в маршрутах не нужны */ s.career=Math.max(0,Math.floor(+s.career||0)); if(!Number.isFinite(s.career)) s.career=0;
  if(!s.mig5){ // одноразовая миграция со старой системы «станции/куски»
    const tb=s.tbest&&typeof s.tbest==='object'?Object.values(s.tbest).reduce((a,b)=>a+(+b||0),0):0; s.career=Math.max(s.career,tb|0); r.days=Math.max(r.days,s.dayN|0);
    const u=Array.isArray(s.unlocks4)?s.unlocks4:[]; const floor=u.includes('mcd')?7:u.includes('mck')?6:u.includes('bcgate')?5:u.includes('street2')?3:u.includes('street1')?2:1;
    for(const R of ROUTES41) if(R.id<=floor||s.career>=R.pts||r.days>=R.days) r.open.push(R.id); r.open=[...new Set(r.open)].sort((a,b)=>a-b); r.seen=r.open.slice(); r.cur=r.open[r.open.length-1];
    if(s.segSave&&!s.segSave.route) s.segSave=null; s.mig5=1; }
  return s; }
function rt41Sync(){ rt41Init(); const r=save.routes, add=[]; for(const R of ROUTES41) if(!r.open.includes(R.id)&&(save.career>=R.pts||r.days>=R.days)){ r.open.push(R.id); add.push(R); } r.open.sort((a,b)=>a-b); return add; }
function rt41Next(){ rt41Init(); const R=ROUTES41.find(R=>!save.routes.open.includes(R.id)); if(!R) return null; return {R,pts:Math.max(0,R.pts-save.career),days:Math.max(0,R.days-save.routes.days)}; }
function rt41NextLine(){ const n=rt41Next(); if(!n) return 'открыты все 8 маршрутов'; return 'до маршрута '+n.R.id+': ещё '+fmtN41(n.pts)+' очк. или '+n.days+' '+dn41(n.days); }
function fmtN41(v){ return String(v|0).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
function dn41(n){ n=Math.abs(n|0); const a=n%10,b=n%100; return a===1&&b!==11?'день':a>=2&&a<=4&&(b<12||b>14)?'дня':'дней'; }
{ const _m=migrate4; migrate4=function(s){ s=_m(s); try{ rt41Init(s); }catch(e){} return s; }; }
{ const _mc=mergeCloud4; mergeCloud4=function(a,b){ const ca=a&&+a.career||0, cb=b&&+b.career||0, ra=a&&a.routes, rb=b&&b.routes; const r=_mc(a,b);
    try{ r.career=Math.max(ca,cb,r.career|0); if(rb&&Array.isArray(rb.open)){ r.routes.open=[...new Set([...r.routes.open,...rb.open.map(Number).filter(x=>x>=1&&x<=8)])].sort((x,y)=>x-y); r.routes.days=Math.max(r.routes.days|0,rb.days|0); for(const k in rb.best||{}) r.routes.best[k]=Math.max(r.routes.best[k]|0,rb.best[k]|0); for(const k in rb.stars||{}) r.routes.stars[k]=Math.max(r.routes.stars[k]|0,rb.stars[k]|0); } rt41Init(r); }catch(e){} return r; }; }
rt41Init(save); store();
// ---------- открытия: фон по номеру дня + события/сегменты открытых маршрутов ----------
function rt41Bg(id){ const d=Math.max(save.dayN|0,(save.routes&&save.routes.days)|0); return id==='news'?d>=2:id==='weather'?d>=3:id==='weekdays'?d>=4:null; }
function rt41Feat(R){ const f=new Set([...R.segs,...R.ev]); if(R.segs.includes('bc')) f.add('bcgate'); if(R.id>=2) f.add('fork'); if(R.id>=4) f.add('taxi'); if(R.segs.includes('mcd')||R.segs.includes('mck')) f.add('controllers'); return f; }
unl4=function(id){ const b=rt41Bg(id); if(b!==null) return b; rt41Init(); return save.routes.open.some(r=>rt41Feat(rt41(r)).has(id)); };
syncUnlocks4=function(){ return []; }; // старые «куски» больше не открываются (список unlocks4 не трогаем — откат на 4.0.x безопасен)
nextUnlock4=function(){ const n=rt41Next(); return n?{id:'route'+n.R.id,n:'маршрут '+n.R.id+' «'+n.R.n+'»',thr:n.R.pts,left:n.pts,days:n.days}:null; };
dayWeather=function(d){ d=d||save.day; return d&&unl4('weather')?d.weather:'clear'; };
lvOpen=function(w,i){ return true; }; lineOpen=function(w){ return true; }; // станции — остановки внутри маршрутов, отдельно не открываются
// ---------- план дня по маршруту ----------
const _planRoute41=planRoute;
function planRoute2(day,R,env){ env=env||{}; const evLast=env.evLast||{}, dayN=env.dayN||0, idx=R.idx;
  const unl=id=>{ const b=rt41Bg(id); if(b!==null) return env.unl?!!env.unl(id):b; return rt41Feat(R).has(id); };
  const rng=routeRng(day,idx), type=day.type, wk=unl('weekdays'), wth=unl('weather')?day.weather:'clear';
  const mon=wk&&day.weekday===0, fri=wk&&day.weekday===4, wend=type==='weekend';
  const yest=k=>evLast[k]===dayN-1; let heavyDay=0;
  const ids=['home',...R.segs,'office'];
  const segs=ids.map(id=>{ const S=SEG4[id], play=id!=='home'&&id!=='office';
    const g={id,n:S.n,locked:false,impl:true,play,events:[],scr:play?rt41Scr(R,id):0};
    if(S.bud){ g.budget=Math.round(S.bud[0]+rng()*(S.bud[1]-S.bud[0])); }
    if(S.ev&&play){ const pool=S.ev.filter(k=>R.ev.includes(k)&&!yest(k)&&(!EV4[k].w||EV4[k].w.split(' ').includes(wth))&&!(EV4[k].nw&&EV4[k].nw.split(' ').includes(wth)));
      const cap=(R.evN&&R.evN[id]!=null?R.evN[id]:1), n=Math.min(pool.length,type==='short'||wend?Math.min(1,cap):cap);
      for(let i=0;i<n&&pool.length;i++){ const k=pool.splice(Math.floor(rng()*pool.length),1)[0]; if(EV4[k].heavy&&(g.events.some(e=>EV4[e.k].heavy)||heavyDay>=3)){ i--; continue; } if(EV4[k].heavy) heavyDay++; g.events.push({k,v:Math.floor(rng()*EV4[k].v)}); } }
    return g; });
  { const gb=segs.find(g=>g.id==='bc'); if(gb&&gb.play&&!gb.events.some(e=>e.k==='lift'||e.k==='stairs14')){ const k=rng()<.5?'lift':'stairs14'; gb.events.push({k,v:Math.floor(rng()*((EV4[k]&&EV4[k].v)||1))}); } } // БЦ: всегда турникет + лифт или лестница
  for(const g of segs) if(g.id==='mck'||g.id==='mcd'){ const pc=typeof m3CtlP==='function'?m3CtlP(g.id,wk?day.weekday:-1):.35; g.events=R.ev.includes('controllers')&&!wend&&rng()<pc?[{k:'controllers',v:Math.floor(rng()*2)}]:[]; }
  const p0=wend?.18:type==='short'?.2:type==='long'?.5:.35; const on={};
  for(const k of METRO_EV){ if(!evIntro(k,idx)) continue; if(k==='rain'){ on[k]=unl('weather')?wth==='rain':rng()<p0*.6; continue; } on[k]=!yest(k)&&rng()<p0; }
  if(R.id===1) for(const k in on) on[k]=false; // маршрут 1 — обучение: метро без событий
  if(mon&&R.id>1){ const hv=METRO_EV.filter(k=>EV4[k].heavy&&evIntro(k,idx)&&!on[k]&&!yest(k)&&k!=='transfer'); if(hv.length) on[hv[Math.floor(rng()*hv.length)]]=true; }
  on.transfer=!!R.transfer; if(!R.transfer){ on.musician=false; on.walkway=false; on.repairs=false; on.service=false; on.headon=false; }
  const zones=stationTrip(idx,k=>!!on[k]).filter(q=>R.transfer||q.title!=='ПЕРЕХОД НА ДРУГУЮ ЛИНИЮ');
  { const car=zones.find(q=>q.k==='car'); if(car) car.stops=R.stops; }
  const used=new Set(); let aftT=false; for(const q of zones){ for(const k of ['vend','detector','short','cols','gangway','terminal']) if(q[k]) used.add(k); if(q.k==='esc'&&q.mode==='stairs') used.add(aftT?'stairs2':'stairs'); if(q.k==='passage'){ if(q.title==='ПЕРЕХОД НА ДРУГУЮ ЛИНИЮ'){ used.add('transfer'); aftT=true; } if(q.flow==='headon') used.add('headon'); for(const f of q.feat) used.add(f==='kiosk'&&q.title!=='ПОДЗЕМНЫЙ ПЕРЕХОД'?'kioskp':f); } if(q.k==='exitz'&&q.rain) used.add('rain'); }
  const vars={}; for(const k of used) vars[k]=Math.floor(rng()*(EV4[k]?EV4[k].v:2));
  const crowdK=(wend?.6:1)*(mon?1.35:fri?.8:1)*(R.id===1?.8:R.id===2?.9:R.id>=8?1.15:R.id>=6?1.08:1);
  for(const q of zones){ if(q.crowd) q.crowd=Math.max(3,Math.round(q.crowd*crowdK*(1+((vars.cols||0)-.5)*.1)));
    if(q.k==='gate'){ q.qmin=Math.max(1,Math.round(q.qmin*crowdK)); q.qmax=Math.max(q.qmin+1,Math.round(q.qmax*crowdK)); }
    if(q.k==='car'&&!q.back){ if(type==='short'||wend){ q.stops=Math.max(1,q.stops-1); q.ride=Math.round(q.ride*(wend?.7:.8)); } else if(type==='long'){ q.stops+=1; q.ride=Math.round(q.ride*1.2); } }
    if(q.k==='plat'&&vars.short!==undefined&&q.short) q.openT=+(q.openT+(vars.short?.5:0)).toFixed(2); q.vars=vars; }
  const metro=segs.find(s=>s.id==='metro'); metro.events=[...used].map(k=>({k,v:vars[k]}));
  const kT=(mon?1.10:1)*({clear:1,rain:1.10,snow:1.15,fog:1.08}[wth]||1);
  metro.budget=tripBudget(zones,idx,kT); const others=segs.filter(g=>g.play&&g.id!=='metro'), T=Math.round(day.len*(mon?1.15:fri?.85:1));
  if(others.length){ const S=others.reduce((a,g)=>a+g.budget+8*g.events.length,0), f=Math.max(.6,Math.min(1.6,(T-metro.budget)/Math.max(1,S)));
    for(const g of others){ const B=SEG4[g.id].bud; g.budget=Math.round(Math.max(B[0]*.8,Math.min(B[1]*1.25,(g.budget+8*g.events.length)*f))); } }
  let total=segs.filter(g=>g.play).reduce((a,g)=>a+g.budget,0);
  for(const q of zones) q.seg=q.seg||'metro';
  const sg=id=>segs.find(g=>g.id===id); const s1=sg('street1'), s2=sg('street2');
  const pre=s1&&typeof streetZones==='function'?streetZones(s1,day,idx):[]; if(pre.length&&unl('fork')&&s1.events.length&&rng()<.45) pre[0].fork=1;
  const post=s2&&typeof streetZones==='function'?streetZones(s2,day,idx):[];
  const sx=segs.find(g=>g.id==='mck'||g.id==='mcd'), mid=sx&&typeof m3Zones==='function'?m3Zones(sx,day,idx):[];
  const sb=sg('bc'), bz=sb&&typeof bcZones==='function'?bcZones(sb,day,idx,post):[];
  for(const q of [...pre,...post,...bz]){ q.weather=q.weather||wth; q.crowdK=crowdK; }
  if(R.bus&&pre.length){ const bad=q=>q.ev==='accident'||q.ev==='crash'; let q=pre.find(q=>!bad(q)); if(!q){ q=pre[0]; q.ev=null; } q.busForce=1; } // ДТП перекрывает дорогу — автобус ставим на другой кусок улицы
  const all=R.segs.indexOf('mcd')>=0&&R.segs.indexOf('mcd')<R.segs.indexOf('metro')?[...pre,...mid,...zones,...post,...bz]:[...pre,...zones,...mid,...post,...bz];
  for(const q of all){ q.scr=rt41Scr(R,q.seg==='metro'?'metro':q.seg); }
  if(!wend&&all.length){ const add=(R.id<=2?6:0)+3*Math.max(0,all.length-12), tgt=balPar5(all,kT)+add, /* длинные маршруты: +3 с за каждый экран сверх 12 — бот укладывается в ~85% */ f=tgt/Math.max(1,total); for(const g of segs) if(g.play) g.budget=Math.round(g.budget*f); total=segs.filter(g=>g.play).reduce((a,g)=>a+g.budget,0); }
  return {total,target:T,segs,zones:all,kT:+kT.toFixed(3),soft:wend,rain:wth==='rain',crowdK:+crowdK.toFixed(2),events:[...used],trans:'metro',weather:wth,route:R.id}; }
planRoute=function(day,idx,env){ const R=rt41ByIdx(idx); if(!R||(day&&day.type==='weekend')||(env&&env.raw)) return _planRoute41(day,idx,env); return planRoute2(day,R,env); };
// табло/старт: «станция» = маршрут игрока
map4Idx=function(){ rt41Init(); return rt41(save.routes.cur).idx; };
if(typeof map4Def==='function') map4Def=function(){ return map4Idx(); };
// автобус на маршрутах 4 и 8: остановка на экране 1 всегда есть
{ const _ti=st4TransInit; st4TransInit=function(z){ _ti(z); if(z&&z.busForce&&!z.bus&&!z.yard&&!z.carsOff){ const x=Math.round(z.len*.45); z.bus={stop:x,st:'wait',bx:x-60,t:0}; } }; }
// ---------- старт/финал дня: сейв маршрута, стаж (очки), дни, звёзды, открытия ----------
{ const _sd=startDay; startDay=function(idx,opts){ const plan=_sd(idx,opts); try{ if(save.segSave&&plan&&plan.route) { save.segSave.route=plan.route; store(); } if(TR) { TR.route=plan&&plan.route||0; TR.scrSeen=0; TR.legCard=null; } }catch(e){} return plan; }; }
{ const _tf=tripFinish; tripFinish=function(win,reason){ const pre=!TR.done&&TR.mode==='trip'&&TR.day; const d=TR.day; _tf(win,reason); if(!pre) return; try{ rt41Init();
    const R=TR.route?rt41(TR.route):null, wend=d.type==='weekend', r=save.routes; TR.newSt=[];
    const old=new Set([...LOC.map(l=>l[2]),...UNLOCK4.map(u=>u[1])]); TR.newUnlocks=(TR.newUnlocks||[]).filter(u=>!old.has(u));
    if(!wend&&r.lastDay!==d.seed){ r.days++; r.lastDay=d.seed; }
    if(win){ const sc=Math.max(0,TR.score|0); save.career+=sc; TR.careerGain=sc; if(R){ r.best[R.id]=Math.max(r.best[R.id]|0,sc); r.stars[R.id]=Math.max(r.stars[R.id]|0,TR.stars|0); } }
    const add=rt41Sync(); TR.newRoutes=add.map(R=>R.id); for(const R of add) TR.newUnlocks.unshift('МАРШРУТ '+R.id+' «'+R.n+'»'); if(add.length){ r.cur=r.cur; MAP5.msg={s:'НОВЫЙ МАРШРУТ!',t:6}; }
    store(); }catch(e){ console.error(e); } }; }
// ---------- ТАБЛО (map5): шапка маршрута, «СМЕНИТЬ», полоса 3 экранов, выбор маршрута ----------
function m5R41(plan){ return plan&&plan.route&&!plan.wk?rt41(plan.route):null; }
function m5RouteBadge(cx,cy,k,n,r){ disc(ctx,cx,cy,r+k,r+k,P.ink); disc(ctx,cx,cy,r,r,'#2aa860'); disc(ctx,cx-Math.round(r*.3),cy-Math.round(r*.3),Math.max(1,Math.round(r*.3)),Math.max(1,Math.round(r*.3)),'#5ad888'); G.labels.push([String(n),cx-txtW(String(n),m5fs(10,k))/2,cy+.5,m5fs(10,k),'#fff','left',null]); }
function m5ChangeChip(pl,hy,k,pad){ const fs=m5fs(10,k), s='СМЕНИТЬ ▾', cw=Math.round(txtW(s,fs)+10*k), ch=Math.round(Math.max(9*k,Math.min(12*k,fs*1.6))), x=Math.round(pl.ix+pl.iw-pad-cw), y=Math.round(hy-ch/2);
  m5Box(x,y,cw,ch,'#e8dcc4',k); ctx.fillStyle='#fffaf0'; ctx.fillRect(x,y,cw,k); m5Lab(s,x+5*k,hy+.5,fs,'#4a3a5a','left','chip');
  const hb=Math.max(28*DPR/SC,ch); buttons.push({x:x-2*k,y:Math.round(hy-hb/2),w:cw+4*k,h:Math.round(hb),id:'routes',cb:()=>{ m5Sheet(true); SFX.ui(); }}); R41.chip={x,y,w:cw,h:ch}; return x; }
function fmtT41(s){ s=Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function rt41CurScr(plan){ const st=typeof m5Start==='function'?m5Start(plan):null; if(!st) return 1; const R=rt41(plan.route); return rt41Scr(R,st); }
function m5Strip3(RT,N,plan,k,lowL,pl,axL,axR,D){ const R=rt41(plan.route), cur=rt41CurScr(plan), res=typeof segResumable==='function'&&segResumable();
  // x-диапазоны экранов по рёбрам маршрута
  const rng={1:[1e9,-1e9],2:[1e9,-1e9],3:[1e9,-1e9]}, bud={1:0,2:0,3:0};
  for(const g of RT.G){ const sg=g.seg; if(!sg||!sg.scr) continue; const a=N[g.a].x, b=N[g.b].x, r=rng[sg.scr]; r[0]=Math.min(r[0],a); r[1]=Math.max(r[1],b); }
  for(const g of plan.segs||[]) if(g.play&&g.scr) bud[g.scr]+=g.budget||0;
  let prev=axL-D.rl; for(const i of [1,2,3]){ const r=rng[i]; if(r[0]>r[1]){ r[0]=prev; r[1]=prev; } r[0]=Math.max(r[0],prev); prev=r[1]; } rng[1][0]=axL-D.rl; rng[3][1]=axR+D.rl;
  const spare=pl.iy+pl.ih-4*k-lowL, h=Math.round(Math.min(13*k,Math.max(8*k,spare-6*k))); if(spare<h+2*k){ R41.strip=null; return; }
  const sY=Math.round(lowL+Math.min(spare/2,(spare+h)/2-h/2+k)), fs=m5fs(11,k), fsT=m5fs(10,k); R41.strip={tabs:[],y:sY-h/2,h};
  const metro=(plan.zones||[]).filter(z=>(z.k==='car'||z.k==='mtrain')&&(z.scr||2)===2).reduce((a,z)=>a+(z.stops||1),0);
  for(const i of [1,2,3]){ const a=Math.round(rng[i][0]+(i>1?k:0)), b=Math.round(rng[i][1]-(i<3?k:0)), w=b-a; if(w<10*k) continue; const done=res&&i<cur, on=i===cur;
    m5Box(a,sY-h/2,w,h,on?'#2aa860':done?'#bfe6b0':'#efe6d2',k); if(on){ ctx.fillStyle='#5ad888'; ctx.fillRect(a,sY-h/2,w,k); }
    const ccx=a+Math.round(h/2)+k, r=Math.max(3*k,Math.round(h*.32)); disc(ctx,ccx,sY,r+k,r+k,P.ink); disc(ctx,ccx,sY,r,r,on?'#fff':done?'#2aa860':'#8a7a9a'); m5Lab(done?'✓':String(i),ccx-txtW(done?'✓':String(i),fsT)/2,sY+.5,fsT,on?'#1f6a3a':'#fff','left','strip');
    const tx=ccx+r+3*k, tw=b-3*k-tx, tm='≈'+fmtT41(bud[i]); const full=[RT41_SN[i-1]+(i===2&&metro?' · '+metro+' ост.':''),RT41_SN[i-1],['ДОМ→М','МЕТРО','→ОФИС'][i-1]];
    let showT=txtW(tm,fsT)+txtW(full[1],fs)+5*k<=tw, lab=full.find(s=>txtW(s,fs)+(showT?txtW(tm,fsT)+5*k:0)<=tw); if(!lab){ showT=false; lab=full.find(s=>txtW(s,fs)<=tw)||''; }
    if(lab) m5Lab(lab,tx,sY+.5,fs,on?'#fff':'#3a2a48','left','strip'); if(showT) m5Lab(tm,b-3*k-txtW(tm,fsT),sY+.5,fsT,on?'#d8ffe0':'#7a6a5a','left','strip');
    ctx.fillStyle=on?'#2aa860':'#c8bca4'; ctx.fillRect(Math.round((a+b)/2),Math.round(sY-h/2-4*k),k,3*k); R41.strip.tabs.push({i,a,b,lab,on,done}); } }
function m5GoalTxt(RT,res){ if(!m5R41(dayPlanCached41())) return null; if(res){ const sc=rt41CurScr(dayPlanCached41()); return ['ПРОДОЛЖИ ПОЕЗДКУ','экран '+sc+' из 3 → ОФИС к 09:00']; } return ['ЗАДАЧА ДНЯ','дом → офис к 09:00']; }
function dayPlanCached41(){ return (MAP5.rt&&MAP5.rt.plan)||(typeof dayPlan==='function'?dayPlan(map4Idx()):null); }
function rt41Reorder(RT,plan){ const R=rt41(plan.route); if(!R||RT.wk) return RT; let N=RT.N.slice(), G=RT.G.map(g=>Object.assign({},g));
  // маршрут без бизнес-центра: улица ведёт прямо к офису (узла «БЦ» нет)
  if(!R.segs.includes('bc')){ const bi=N.findIndex(n=>n.t==='bc'); if(bi>0){ const gi=G.findIndex(g=>g.a===bi&&g.t==='in'); if(gi>=0){ G.splice(gi,1); N.splice(bi,1); G.forEach(g=>{ if(g.a>bi) g.a--; if(g.b>bi) g.b--; }); } } }
  // МЦД до метро (из области): дом → МЦД (низ) → пересадка вверх → метро → улица
  if(RT.x&&R.segs.indexOf(RT.x.id)>=0&&R.segs.indexOf(RT.x.id)<R.segs.indexOf('metro')){ const xs=N.map((n,i)=>n.t==='x'?i:-1).filter(i=>i>=0), sts=N.map((n,i)=>n.t==='st'?i:-1).filter(i=>i>=0); if(xs.length===2&&sts.length){
      const gF=G.find(g=>g.t==='fork'), gX=G.find(g=>g.t==='xm'), gU=G.find(g=>g.t==='forkup'), mg=G.filter(g=>g.t==='metro'||g.t==='metro2'), metroSeg=(mg[0]&&mg[0].seg)||(plan.segs||[]).find(s=>s.id==='metro'), s2seg=gU.seg, tail=N.slice(xs[1]+1);
      const N2=[N[0],N[xs[0]],N[xs[1]],...sts.map(i=>N[i]),...tail], G2=[]; let i=0; const add=(t,w,seg,ex)=>{ G2.push(Object.assign({t,w,seg,a:i,b:i+1},ex||{})); i++; };
      add('fork',gF.w,gF.seg); add('xm',gX.w,gX.seg); add('forkup',1.1,metroSeg,{walk:1}); mg.forEach(g=>add(g.t,g.w,g.seg)); const st2=sts.length; void st2;
      add('walk',1.3,s2seg); for(const g of G.filter(g=>g.a>xs[1]&&g.t!=='forkup')) add(g.t,g.w,g.seg); N=N2; G=G2; RT.xFirst=true; } }
  RT.N=N; RT.G=G; return RT; }
{ const _mr=m5Route; m5Route=function(idx,day,plan){ const RT=_mr(idx,day,plan); RT.plan=plan; if(plan&&plan.route&&!plan.wk) rt41Reorder(RT,plan); R41.layEx=(plan&&plan.route&&!plan.wk)?(RT.x?17:13):0; return RT; }; }
// выбор маршрута: 4×2 карточки; закрытые — серые с замком, «ещё N очк. · или M дней» и полоса к открытию (что ближе)
function rt41Ico(kind,x,y,k){ if(kind==='walk') m5Steps(x,y,k,'#3a3442'); else if(kind==='bus') m5MiniIco('bus',x,y,k); else if(kind==='metro') m5MSign(x,y,k); else if(kind==='mck') m5Lamp(x,y,k,'sq','next',true,4*k); else if(kind==='mcd') m5Lamp(x,y,k,'tri','next',true,4*k); else if(kind==='bc') m5Bc(x,y+6*k,k); else if(kind==='x'){ ctx.fillStyle=P.ink; ctx.fillRect(x-4*k,y-k,8*k,2*k); ctx.fillRect(x+2*k,y-3*k,2*k,6*k); } }
function rt41Legs(R){ const o=[R.bus?'bus':'walk']; for(const s of R.segs){ if(s==='metro'){ o.push('metro'); if(R.transfer) o.push('x'); } else if(s==='mck'||s==='mcd') o.push(s); else if(s==='bc') o.push('bc'); } if(!R.segs.includes('bc')) o.push('walk'); return o; }
function m5Picker(Y,pl,plan){ rt41Init(); const k=Y.k, pad=m5Pad(k), hs=Y.hs, hy=pl.iy+Math.round((hs-3*k)/2), r=save.routes, fsH=m5fs(12,k), fsS=m5fs(10,k);
  const nOpen=r.open.length; m5Lab('ВЫБЕРИ МАРШРУТ',pl.ix+pad,hy+.5,fsH,'#3a2a48','left','hdr');
  // закрыть
  const cs=Math.round(Math.max(10*k,Math.min(14*k,hs))), cxx=pl.ix+pl.iw-pad-cs; m5Box(cxx,hy-cs/2,cs,cs,'#e8dcc4',k); m5Lab('✕',cxx+cs/2-txtW('✕',fsS)/2,hy+.5,fsS,'#4a3a5a','left','chip'); const hb=Math.max(28*DPR/SC,cs); buttons.push({x:Math.min(cxx-2*k,cxx+cs+2*k-Math.max(cs+4*k,hb)),y:hy-hb/2,w:Math.max(cs+4*k,hb),h:hb,id:'pclose',cb:()=>{ m5Sheet(false); SFX.ui(); }});
  { const x0=pl.ix+pad+txtW('ВЫБЕРИ МАРШРУТ',fsH)+8*k, x1=cxx-6*k, s=[`открыто ${nOpen} из 8 · новый маршрут — за очки ИЛИ за дни, что раньше`,`открыто ${nOpen} из 8 · очки или дни`,`${nOpen} из 8`].find(s=>txtW(s,fsS)*1.08+4*k<=x1-x0); if(s) m5Lab(s,Math.round(x1-txtW(s,fsS)*1.08),hy+.5,fsS,'#6a6478','left','legend'); }
  const gap=Math.max(3*k,4), cols=4, top=pl.iy+hs+gap, cw=Math.floor((pl.iw-2*pad-(cols-1)*gap)/cols), chh=Math.floor((pl.iy+pl.ih-top-gap-gap)/2); R41.cards=[];
  for(const R of ROUTES41){ const i=R.id-1, cx=pl.ix+pad+(i%cols)*(cw+gap), cy=top+Math.floor(i/cols)*(chh+gap), open=r.open.includes(R.id), cur=r.cur===R.id, fresh=open&&!r.seen.includes(R.id);
    if(cur){ ctx.fillStyle='#5ad888'; ctx.fillRect(cx-2*k,cy-2*k,cw+4*k,chh+4*k); } m5Box(cx,cy,cw,chh,open?'#fffaf0':'#e4e0e8',k); const th=Math.round(Math.max(9*k,Math.min(12*k,fsS*1.7))); ctx.fillStyle=open?(cur?'#2aa860':'#3a6ad8'):'#a8a4b4'; ctx.fillRect(cx,cy,cw,th);
    const tag=cur?'СЕГОДНЯ':fresh?'НОВЫЙ!':''; const tfs=m5fs(9,k), tagW=tag?txtW(tag,tfs)+4*k:0; let hdrTxt=[R.id+' · '+R.n,R.id+' '+R.n].find(q=>txtW(q,fsS)<=cw-6*k-tagW), tagIn=!!hdrTxt; if(!hdrTxt){ hdrTxt=[R.id+' · '+R.n,R.id+' '+R.n,R.n].find(q=>txtW(q,fsS)<=cw-6*k)||R.n; } let hf=fsS; while(txtW(hdrTxt,hf)>cw-6*k&&hf>m5fs(8,k)) hf-=.5; m5Lab(hdrTxt,cx+3*k,cy+th/2+.5,hf,'#fff','left','pcard'); if(tag&&tagIn) m5Lab(tag,cx+cw-3*k-txtW(tag,tfs),cy+th/2+.5,tfs,cur?'#d8ffe0':'#ffe680','left','pcard'); R41.tagBadge=tag&&!tagIn?tag:'';
    const legs=rt41Legs(R), body=chh-th, iy=Math.round(cy+th+Math.min(body*.36,13*k)), n=legs.length, x0=cx+8*k, x1=cx+cw-8*k; ctx.globalAlpha=open?1:.4; ctx.fillStyle='#8a8898'; ctx.fillRect(x0,iy-k,x1-x0,2*k);
    const ik=(x1-x0)/n>=13*k?k:Math.max(1,k-1); legs.forEach((lg,j)=>{ const x=Math.round(x0+(x1-x0)*(j+.5)/n); ctx.fillStyle=open?'#fffaf0':'#e4e0e8'; ctx.fillRect(x-6*ik,iy-6*ik,12*ik,12*ik); rt41Ico(lg,x,iy,ik); }); ctx.globalAlpha=1;
    const by=cy+chh-Math.round(Math.max(6*k,fsS*.9)); { const ny=Math.round(iy+8*k+fsS*.8), LH=Math.ceil(Math.max(fsS,MINPX())*1.15)+1, lim=by-(open?LH:2*LH); if(ny<lim){ const rec=open&&(r.best[R.id]|0)?'рекорд '+fmtN41(r.best[R.id]):'', nl=Math.max(1,Math.floor((lim-ny)/LH)+1), ww=cw-6*k; let lines=null; for(const src of ['новое: '+R.neu,R.neu,R.neuS||R.neu]){ for(let f=fsS;f>=m5fs(8,k)-.01&&!lines;f-=.5){ const L=wrap41(src,ww,f); if(L&&L.length<=Math.min(nl,2)) lines={L,f}; } if(lines) break; } if(!lines) lines={L:wrap41(R.neuS||R.neu,ww,m5fs(8,k))||[R.neuS||R.neu],f:m5fs(8,k)}; lines.L.forEach((q,j)=>m5Lab(q,cx+3*k,ny+j*LH,lines.f,open?'#8a6a2a':'#8a8498','left','pcard')); if(rec&&ny+lines.L.length*LH<lim) m5Lab(rec,cx+3*k,ny+lines.L.length*LH,fsS,'#5a4a6a','left','pcard'); } }
    if(open){ m5Lab('≈'+R.len.split('–')[0],cx+3*k,by,fsS,'#5a4a6a','left','pcard'); const st=r.stars[R.id]|0; for(let q=0;q<3;q++) starPx(cx+cw-3*k-36+6+q*12,by,q<st); if(R41.tagBadge){ const tb=R41.tagBadge, tfs2=m5fs(9,k), bw2=txtW(tb,tfs2)+6*k, bh2=Math.max(tfs2,MINPX())+3*k, l0=cx+3*k+txtW('≈'+R.len.split('–')[0],fsS)+3*k, r0=cx+cw-3*k-36-3*k, bx2=Math.round(Math.max(l0,(l0+r0)/2-bw2/2)); ctx.fillStyle=cur?'#2aa860':'#e0a020'; ctx.fillRect(bx2,Math.round(by-bh2/2),Math.round(bw2),Math.round(bh2)); m5Lab(tb,bx2+3*k,by+.5,tfs2,'#fff','left','pcard'); R41.tagBadge=''; } }
    else { const pl2=Math.max(0,R.pts-save.career), dl=Math.max(0,R.days-r.days), f=Math.max(save.career/Math.max(1,R.pts),r.days/Math.max(1,R.days)); m5LockIco(cx+6*k,by-1*k,k,'#6a6478');
      const l1=m5Fit('ещё '+fmtN41(pl2)+' очк.',cw-16*k,fsS), l2='или '+dl+' '+dn41(dl); const LH2=Math.ceil(Math.max(fsS,MINPX())*1.15)+1, two=by-LH2-Math.max(fsS,MINPX())*.6>=cy+th+2*k; if(two){ m5Lab(l1,cx+12*k,by-LH2,fsS,'#4a3a5a','left','pcard'); m5Lab(m5Fit(l2,cw-16*k,fsS),cx+12*k,by,fsS,'#6a5a7a','left','pcard'); } else m5Lab(m5Fit(l1+' · '+l2,cw-16*k,fsS),cx+12*k,by,fsS,'#4a3a5a','left','pcard');
      ctx.fillStyle='#c8c4d0'; ctx.fillRect(cx+3*k,cy+chh-3*k,cw-6*k,2*k); ctx.fillStyle='#ffc04a'; ctx.fillRect(cx+3*k,cy+chh-3*k,Math.round((cw-6*k)*Math.min(1,f)),2*k); }
    R41.cards.push({id:R.id,x:cx,y:cy,w:cw,h:chh,open});
    buttons.push({x:cx,y:cy,w:cw,h:chh,id:'route'+R.id,cb:()=>{ SFX.ui(); if(open){ if(r.cur!==R.id){ if(save.segSave&&save.segSave.route&&save.segSave.route!==R.id){ const now=performance.now(); if(!(R41.swc&&R41.swc.id===R.id&&now-R41.swc.t<3500)){ R41.swc={id:R.id,t:now}; say('Начатый день пропадёт. Тапни ещё раз, чтобы сменить',2.6,'#ffd23f'); MAP5.msg={s:'ТАПНИ ЕЩЁ РАЗ: ПРОГРЕСС ДНЯ ПРОПАДЁТ',t:3}; return; } R41.swc=null; save.segSave=null; } r.cur=R.id; } if(!r.seen.includes(R.id)) r.seen.push(R.id); store(); m5Sheet(false); MAP5.msg={s:'МАРШРУТ '+R.id+': '+R.n,t:3}; }
      else { const pl3=Math.max(0,R.pts-save.career), dl3=Math.max(0,R.days-r.days); say('Откроется через '+fmtN41(pl3)+' очк. или '+dl3+' '+dn41(dl3),2.2,'#ffd23f'); MAP5.msg={s:'ЗАКРЫТ: ЕЩЁ '+fmtN41(pl3)+' ОЧК. ИЛИ '+dl3+' '+dn41(dl3).toUpperCase(),t:3}; } }}); } }
// при новом маршруте табло предлагает его (если игрок не в середине дня)
{ const _tm=toMap; toMap=function(){ const r0=_tm.apply(this,arguments); try{ rt41Init(); const r=save.routes, nw=r.open.filter(id=>!r.seen.includes(id)); if(nw.length&&!(typeof segResumable==='function'&&segResumable())){ r.cur=nw[nw.length-1]; MAP5.msg={s:'НОВЫЙ МАРШРУТ: '+rt41(r.cur).n,t:6}; r.seen.push(...nw); store(); } }catch(e){} return r0; }; }
// ---------- В ПОЕЗДКЕ: чипы 3 экранов под часами + карточка между экранами (таймер стоит, тап — дальше) ----------
function rt41ScrOf(z){ return z&&z.scr|0; }
function rt41ScrProg(){ const zs=TR.zones||[], s=rt41ScrOf(TR.z); const idx=zs.map((q,i)=>[q,i]).filter(([q])=>rt41ScrOf(q)===s).map(([,i])=>i); if(!idx.length) return 0; return Math.max(0,Math.min(1,(TR.zi-idx[0]+.5)/idx.length)); }
{ const _h=tripHUD; tripHUD=function(){ _h.apply(this,arguments); if(G.scene!=='trip'||TR.mode!=='trip'||!TR.route||!TR.z||paused) { R41.chips=null; TR.hudScr=null; return; }
  const L=SA.l+4, T=SA.t+3, cur=rt41ScrOf(TR.z); if(!cur) return; const names=['ДОМ','МЕТРО','ОФИС'], cw=Math.max(30,Math.ceil(Math.max(...names.map(n=>txtW('✓ '+n,6))))+6), ch=Math.max(11,Math.ceil(MINPX()*1.3)), y=T+33; R41.chips=[];
  ctx.fillStyle='#120c18ee'; ctx.fillRect(L,y,cw*3+4,ch+2);
  for(let i=1;i<=3;i++){ const x=L+1+(i-1)*(cw+1), on=i===cur, done=i<cur; ctx.fillStyle=on?'#2aa860':done?'#1f5a3a':'#3a3050'; ctx.fillRect(x,y+1,cw,ch);
    if(on){ ctx.fillStyle='#5ad888'; ctx.fillRect(x,y+1,Math.round(cw*rt41ScrProg()),2); }
    G.labels.push([(done?'✓':String(i))+' '+names[i-1],x+cw/2,y+1+ch/2,6,on?'#fff':done?'#bfe6b0':'#9a8ab8']); R41.chips.push({i,x,y:y+1,w:cw,h:ch}); }
  if(typeof ux5Reg==='function') ux5Reg('hud',L,y,cw*3+4,ch+2); TR.hudScr={x:L,y,w:cw*3+4,h:ch+2};
  if(TR.legCard) rt41DrawCard(TR.legCard); }; }
function rt41Next3(R,to){ const zs=TR.zones||[]; if(to===2){ const st=LEVELS[R.idx]; const car=zs.find(q=>q.k==='car'); return 'дальше: метро'+(st&&st.name?' «'+st.name+'»':'')+(car?' → '+car.stops+' '+(car.stops===1?'остановка':car.stops<5?'остановки':'остановок'):'')+(R.transfer?' и пересадка':''); }
  if(to===3) return R.segs.includes('bc')?'дальше: улица → бизнес-центр → офис':'дальше: улица → офис'; return ''; }
function rt41DrawCard(c){ const R=rt41(TR.route), a=Math.min(1,c.t/.15); ctx.fillStyle='rgba(18,12,24,'+(.55*a).toFixed(3)+')'; ctx.fillRect(0,0,W,H);
  const w=Math.min(380,W-SA.l-SA.r-24), h=98, cx=Math.round(W/2-w/2), cy=Math.round(H/2-h/2-4); G.labels=G.labels.filter(l=>!(l[1]>cx-80&&l[1]<cx+w+80&&l[2]>cy-8&&l[2]<cy+h+8));
  ctx.fillStyle=P.ink; ctx.fillRect(cx-2,cy-2,w+4,h+4); ctx.fillStyle='#fffaf0'; ctx.fillRect(cx,cy,w,h); ctx.fillStyle='#2aa860'; ctx.fillRect(cx,cy,w,18);
  const k=Math.max(0,TR.tLeft/TR.tTotal), mm=Math.min(19,Math.floor(20*(1-k))); G.labels.push(['ЭКРАН '+c.from+' ИЗ 3 ПРОЙДЕН ✓  ·  на часах 08:'+String(40+mm).padStart(2,'0'),W/2,cy+9,8,'#fff']);
  const tw=(w-40)/3; for(let i=1;i<=3;i++){ const x0=cx+10+(i-1)*(tw+10), on=i===c.to, done=i<c.to; ctx.fillStyle=P.ink; ctx.fillRect(Math.round(x0-1),cy+27,Math.round(tw+2),24); ctx.fillStyle=done?'#bfe6b0':on?'#ffd23f':'#efe6d2'; ctx.fillRect(Math.round(x0),cy+28,Math.round(tw),22);
    const pre=(done?'✓ ':on?'▶ ':'')+i, s=[pre+' · '+RT41_SN[i-1],pre+' '+RT41_SN[i-1],pre+' '+['ДОМ→МЕТРО','МЕТРО','МЕТРО→ОФИС'][i-1],pre+' '+['ДОМ→М','МЕТРО','→ОФИС'][i-1],pre].find(q=>txtW(q,6)<=tw-4)||pre; let f=7; while(f>6&&txtW(s,f)>tw-4) f-=.5; G.labels.push([s,x0+tw/2,cy+39,f,'#2a1d33','center',null]); }
  let nx=rt41Next3(R,c.to), f2=8; while(f2>6&&txtW(nx,f2)>w-16) f2-=.5; G.labels.push([nx,W/2,cy+64,f2,'#3a2a48','center',null]); G.labels.push(['тапни, чтобы ехать',W/2,cy+82,7,'#7a6a9a','center',null]); R41.cardRect={x:cx,y:cy,w,h}; }
{ const _nz=nextZone; nextZone=function(){ const prev=TR.z, ps=rt41ScrOf(prev); const r=_nz.apply(this,arguments); try{ if(TR.mode==='trip'&&TR.route&&!TR.done&&prev&&TR.z&&TR.z!==prev){ const ns=rt41ScrOf(TR.z); if(ps&&ns>ps){ TR.legCard={t:0,len:window.__legCardLen!=null?window.__legCardLen:1.6,from:ps,to:ns}; R41.cardsShown=(R41.cardsShown||0)+1; } } }catch(e){} return r; }; }
{ const _tu=tripUpdate; tripUpdate=function(dt){ const c=TR.legCard; if(c&&G.scene==='trip'&&!TR.done){ c.t+=dt; const tap=c.t>.25&&input.events.some(e=>e.t==='tap'||e.t==='key'||e.t==='down'); input.events.length=0; if(tap||c.t>=c.len){ TR.legCard=null; R41.cardSkipped=(R41.cardSkipped||0)+(tap?1:0); } return; } return _tu(dt); }; }
{ const _st=startTrip; startTrip=function(){ const r=_st.apply(this,arguments); TR.legCard=null; return r; }; if(window.__trip) __trip.startTrip=startTrip; }
// ---------- ролик-объяснение, сцена 4: «новые маршруты открываются» (карточки маршрутов, без замков на участках) ----------
function fb6Routes(cx,cy,pw,ph,k,lt){ const ids=[1,2,4,7], n=ids.length, gap=Math.round(8*k), cw=Math.min(Math.round((pw-40-gap*(n-1))/n),Math.round(120*k)), chh=Math.round(ph*.5), x0=Math.round(cx-(cw*n+gap*(n-1))/2), y0=Math.round(cy-chh/2+2*k);
  G.labels.push(['ОЧКИ ИЛИ ДНИ → НОВЫЕ МАРШРУТЫ',cx,cy-ph/2+14,10,'#3a2a48','center',null]); const R=(a,b,c,d,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(a),Math.round(b),Math.round(c),Math.round(d)); };
  const last=rt41(ids[n-1]), cnt=l=>{ const pk=Math.max(0,Math.min(1,l/(n*.9))); return {pts:Math.round(last.pts*pk),dd:1+Math.round((last.days-1)*pk)}; }, isOp=(Rt,c)=>c.pts>=Rt.pts||c.dd>=Rt.days, C=cnt(lt), C0=cnt(lt-.7);
  ids.forEach((id,j)=>{ const Rt=rt41(id), x=x0+j*(cw+gap), op=isOp(Rt,C), fresh=op&&j>0&&!isOp(Rt,C0); R(x-2,y0-2,cw+4,chh+4,P.ink); R(x,y0,cw,chh,op?(fresh?'#fff2b0':'#e9f6e2'):'#ece6f2'); R(x,y0,cw,Math.round(chh*.22),op?'#2aa860':'#8a8898');
    G.labels.push(['МАРШРУТ '+id,x+cw/2,y0+chh*.11,7,'#fff','center',null]); { const col=op?'#2a1d33':'#7a6a8a'; let f=7; while(f>6&&txtW(Rt.n,f)>cw-6) f-=.5; if(txtW(Rt.n,f)<=cw-6) G.labels.push([Rt.n,x+cw/2,y0+chh*.36,f,col,'center',null]); else { const L=wrap41(Rt.n,cw-6,6)||[Rt.n]; L.slice(0,2).forEach((q,j)=>G.labels.push([q,x+cw/2,y0+chh*(L.length>1?.31+j*.11:.36),6,col,'center',null])); } }
    const ik=Math.min(k*.8,chh*.2/12), legs=rt41Legs(Rt), st=Math.min(16*ik,(cw-10)/legs.length), lx=x+cw/2-(legs.length-1)*st/2; if(op) legs.forEach((g,q)=>rt41Ico(g,Math.round(lx+q*st),Math.round(y0+chh*.6),ik));
    else { m5LockIco(x+cw/2,Math.round(y0+chh*.6),ik,'#8a8898'); }
    G.labels.push([op?(fresh?'НОВЫЙ!':'открыт'):('ещё '+fmtN41(Rt.pts)+' очк.'),x+cw/2,y0+chh*.85,7,op?(fresh?'#c8581a':'#1f8a4a'):'#5a4a6a','center',null]); });
  const pts=C.pts, dd=C.dd;
  G.labels.push(['очки: '+fmtN41(pts)+'   ·   день '+dd+'   — что раньше, то и открывает',cx,Math.round((y0+chh+cy+ph/2)/2),8,'#3a2a48','center',null]); }
// ---------- МЦД → метро: пересадка бесплатно (маршрут 7 начинается с МЦД, второй жетон не нужен) ----------
function rt41FreeXfer(){ try{ if(TR.mode!=='trip'||!TR.route||!TR.z||TR.z.k!=='gate'||TR.xferUsed) return false; const p=TR.paid; if(!p||p.how==='debt') return false; const min=(G.time-p.t)/60, lim=(typeof M3!=='undefined'&&M3.TR_MIN)||90; return min<=lim; }catch(e){ return false; } }
{ const _cp=canPass; canPass=function(){ return rt41FreeXfer()||_cp.apply(this,arguments); }; }
{ const _up=usePass; usePass=function(){ if(rt41FreeXfer()){ TR.xferUsed=1; try{ pop('ПЕРЕСАДКА С МЦД — БЕСПЛАТНО',G.hero.x,G.hero.y-56,'#7af0a0',8); }catch(e){} if(typeof tev==='function') tev('r41_free_xfer'); return .5; } return _up.apply(this,arguments); }; }
{ const _sd=startDay; startDay=function(){ const r=_sd.apply(this,arguments); TR.xferUsed=0; return r; }; }
// ---------- маршруты 4 и 8: настоящий автобус до метро (вместо гэга «уехал»): подходишь к остановке → садишься → едешь до конца улицы ----------
{ const _bt=st4TransTick; st4TransTick=function(z,dt){ const B=z&&z.bus, h=G.hero; if(!(B&&z.busForce&&TR.mode==='trip'&&TR.route)) return _bt.apply(this,arguments);
  if(B.st==='wait'){ B.t+=dt; if(B.t>12) B.t=0; /* ждёт героя, не уезжает */ if(Math.abs(h.x-B.stop)<60&&!h.stun){ B.st='ride'; B.bx=B.stop-50; B.v=0; B.rt=0; h.hide=true; h.noSolid=true; h.vx=0; h.vy=0; tev('r41_bus_board'); try{ SFX.doors(); pop('ПОЕХАЛИ НА АВТОБУСЕ!',h.x,h.y-56,'#ffd23f',9); }catch(e){} } return; }
  if(B.st==='ride'){ B.rt+=dt; B.v=Math.min(170,B.v+80*dt); B.bx+=B.v*dt; h.x=Math.round(B.bx+40); h.vx=0; const end=z.len-90; if(h.x>=end){ h.x=end; h.hide=false; h.noSolid=false; B.st='leave'; tev('r41_bus_off'); try{ pop('ВЫШЕЛ У МЕТРО',h.x,h.y-56,'#7af0a0',9); SFX.doors(); }catch(e){} } return; }
  return _bt.apply(this,arguments); }; }
{ const _nz2=nextZone; nextZone=function(){ try{ const h=G.hero; if(h&&h.hide&&TR.z&&TR.z.k==='street'){ h.hide=false; h.noSolid=false; } }catch(e){} return _nz2.apply(this,arguments); }; }
// автобус: пока герой едет внутри, подсказки событий улицы не показываем (они про пешехода)
{ const _say=say; say=function(){ try{ const z=TR&&TR.z, h=G.hero; if(G.scene==='trip'&&h&&h.hide&&z&&z.k==='street'&&z.bus&&z.bus.st==='ride') return; }catch(e){} return _say.apply(this,arguments); }; }
{ const _gt=goalText; goalText=function(z){ try{ const h=G.hero; if(z&&z.k==='street'&&h&&h.hide&&z.bus&&z.bus.st==='ride') return 'Едем на автобусе до метро'; }catch(e){} return _gt.apply(this,arguments); }; }
