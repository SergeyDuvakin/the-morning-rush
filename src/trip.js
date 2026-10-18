'use strict';
function wrapFlow(z,e,yf){ const m=Math.round(W*.3)+12; if(e.dir<0&&e.x<-m){ e.x=z.len+rnd(14,170); yf(); } else if(e.dir>0&&e.x>z.len+m){ e.x=-m-rnd(0,150); yf(); } }
// ================= «УСПЕЙ И ВТИСНИСЬ»: поездка = цепочка зон под общим таймером до 09:00 =================
// TR — состояние поездки; ZONES — типы зон; каждая зона: init(z), update(z,dt), draw(z), ctx(z)→{label,fn,a?}, bot(z)→{x,y,b,a}, prog(z)→число, unstick(z)
const TR={};
const ZONES={};
const WALLET_DEF={coins:20,tokens:2,rides:0,unlim:'',debt:0};
function wallet(){ if(!save.wallet) { save.wallet=Object.assign({},WALLET_DEF); } return save.wallet; }
function mskDay(){ return today(); }
function hasUnlim(){ return wallet().unlim===mskDay(); }
function passInfo(){ const w=wallet(); if(hasUnlim()) return 'БЕЗЛИМИТ'; if(w.rides>0) return 'ПРОЕЗДНОЙ ×'+w.rides; return w.tokens>0?'ЖЕТОНЫ ×'+w.tokens:'НЕТ ПРОЕЗДНОГО'; }
function canPass(){ const w=wallet(); return hasUnlim()||w.rides>0||w.tokens>0; }
function usePass(){ const w=wallet(); if(hasUnlim()) return .5; if(w.rides>0){ w.rides--; return .5; } if(w.tokens>0){ w.tokens--; return 1.2; } return 0; }
function dailyBonus(){ const w=wallet(), d=mskDay(); if(save.daily!==d){ save.daily=d; w.tokens++; w.coins+=10; store(); return true; } return false; }
// ---------- очки и открытия ----------
const ST_THR=[...Array(24)].map((_,k)=>k===0?0:Math.round((k*280+k*k*10)/10)*10);
function tripPts(){ save.tbest=save.tbest||{}; return Object.values(save.tbest).reduce((a,b)=>a+b,0); }
const LOC=[ // [id, станция-индекс, название, описание]
 ['esc',1,'Эскалатор','мини-сценка: стой или обходи слева'],['kassa',2,'Касса и жетоны','нет проездного — в очередь за жетоном'],
 ['kiosk',3,'Переход с ларьками','запах шаурмы тормозит, продавцы мешают'],['vend',4,'Автомат кофе','3 монеты — бодрость, иногда ест монету'],
 ['detector',5,'Рамка и охранник','звенит ключами — проскочи, пока отвлёкся'],['stairs',6,'Сломанный эскалатор','лестница, бабушки отдыхают'],
 ['babatank',7,'Бабушка-Танк','таранит толпу к дверям — держись в кильватере'],['transfer',8,'Пересадка + музыкант','кинь монетку — зеваки расступятся'],
 ['short',9,'Короткий поезд','одна открытая дверь в конце'],['walkway',10,'Траволатор','стоят посередине, в конце все спотыкаются'],
 ['headon',11,'Узкий переход','два встречных потока лоб в лоб'],['repairs',12,'Ремонт','забор и стрелки «обход» в никуда'],
 ['service',13,'Служебный коридор','срезка; поймают — вернут'],['rain',14,'Дождливый вестибюль','мокрый пол, зонты, скользко'],
 ['turnboss',15,'Турникет-мутант','проход только на зелёный'],['lost',16,'Бюро находок','шапки, перки, монеты'],
 ['gangway',17,'Переход между вагонами','пасхалка: хор или рыбак'],['terminal',18,'Конечная','уснёшь — уедешь в депо'],
 ['controller',23,'Контролёр апокалипсиса','идёт по вагону, сбивает всех на пути'] ];
// миграция сейва v3 (бои) → v4 (очки поездок): открытые раньше станции остаются открытыми
(function(){ if(save.migr4) return; save.migr4=1; const ks=Object.keys(save.stars||{}).filter(k=>save.stars[k]>0); if(ks.length&&!save.tbest){ const idx=ks.map(k=>{ const [w,i]=k.split('.').map(Number); return w*8+i; }); const n=Math.min(23,Math.max(...idx)+1); save.tbest={}; const per=Math.ceil(ST_THR[n]/idx.length/10)*10; for(const i of idx) save.tbest[i]=per; } try{ store(); }catch(e){} })();
function locOpen(id){ const l=LOC.find(l=>l[0]===id); return !l||G.cheat||tripPts()>=ST_THR[l[1]]; }
lvOpen=function(w,i){ if(G.cheat) return true; return tripPts()>=ST_THR[w*8+i]; };
lineOpen=function(w){ return G.cheat||tripPts()>=ST_THR[w*8]; };
// ---------- состав поездки по станции ----------
function stationTrip(idx,pick){ const w=Math.floor(idx/8), i=idx%8, d=idx; const L=LEVELS[idx];
  const has=id=>{ const l=LOC.find(l=>l[0]===id); return l&&l[1]<=idx; }; // место уже введено к этой станции
  // M1-2: опциональные события станции. Без pick — как v3 (детерминированно по индексу); с pick — решает генератор дня. sig — «своя» станция события (всегда есть)
  const P=(k,def,sig,need)=>{ if(sig) return true; if(!pick) return !!def; return has(need||k)&&!!pick(k); };
  const z=[]; const gate={k:'gate',lanes:i===0&&w===0?2:3,qmin:2+Math.floor(d/6)+w,qmax:4+Math.floor(d/4)+w,kassa:true,vend:P('vend',has('vend')&&d%3!==2,false),detector:P('detector',has('detector')&&(d===5||d%4===1),d===5),turnboss:idx===15};
  z.push(gate);
  const stairs=P('stairs',idx===6||(has('stairs')&&d%5===1&&idx>6),idx===6);
  const down=stairs?{k:'esc',mode:'stairs'}:has('esc')?{k:'esc',mode:'esc'}:null;
  const pass=P('kiosk',has('kiosk')&&(idx===3||d%3===0),idx===3)?{k:'passage',title:'ПОДЗЕМНЫЙ ПЕРЕХОД',feat:['kiosk'].concat(P('lost',has('lost')&&d%2===0,false)?['lost']:[]),flow:'two'}:null;
  if(pass) z.push(pass); if(down) z.push(down);
  const plat={k:'plat',short:P('short',idx===9||(has('short')&&d%4===2&&idx>9),idx===9),babatank:idx===7,cols:P('cols',idx===2||d%5===2,idx===2,'kassa'),openT:Math.max(4.5,9-d*.18-w*.8),crowd:14+Math.min(26,Math.round(d*1.1))+w*3};
  const car={k:'car',stops:2+(d>8?1:0),ride:28+Math.min(12,d*.5),sway:Math.max(3.6,6-d*.1),seats:Math.max(1,4-Math.floor(d/7)),gangway:P('gangway',has('gangway')&&(idx===17||d%3===0),idx===17),terminal:P('terminal',idx===18||(has('terminal')&&d%4===3&&idx>18),idx===18),controller:idx===23,crowd:10+Math.min(18,d)+w*2};
  z.push(plat,car);
  if(P('transfer',has('transfer')&&(idx===8||idx===11||idx===13||d%2===0||idx>=19),idx===8||idx===11||idx===13)){ const tf={k:'passage',title:'ПЕРЕХОД НА ДРУГУЮ ЛИНИЮ',flow:P('headon',idx===11||(has('headon')&&d%3===2),idx===11)?'headon':'two',feat:[]};
    if(P('musician',idx===8||(d%3===1),idx===8,'transfer')) tf.feat.push('musician'); if(P('walkway',idx===10||(has('walkway')&&d%3===0),idx===10)) tf.feat.push('walkway'); if(P('repairs',idx===12||(has('repairs')&&d%4===0),idx===12)) tf.feat.push('repairs'); if(P('service',idx===13||(has('service')&&d%3===2),idx===13)) tf.feat.push('service'); if(P('lost',idx===16||(has('lost')&&d%4===1),idx===16)) tf.feat.push('lost'); if(P('vendp',has('vend')&&d%5===3,false,'vend')) tf.feat.push('vendp'); if(P('kioskp',has('kiosk')&&d%4===2,false,'kiosk')) tf.feat.push('kiosk');
    z.push(tf); z.push({k:'esc',mode:P('stairs2',has('stairs')&&d%2===1,false,'stairs')?'stairs':'esc'}); z.push(Object.assign({},plat,{babatank:false,short:false})); z.push(Object.assign({},car,{gangway:false,terminal:car.terminal,stops:1})); car.terminal=false; }
  z.push({k:'exitz',rain:P('rain',idx===14||(has('rain')&&d%3===1&&idx>14),idx===14),crowd:9+Math.min(16,d)+w*3});
  z.forEach(q=>q.d=d);
  return z; }
// ---------- общая физика толпы ----------
function mkNpc(type,x,y){ let e; if(type==='granny'){ e=new Actor(x,y,HERO_SPECS.baba); e.type='granny'; e.T={}; e.spd=22; }
  else if(type==='babatank'){ e=new Actor(x,y,BOSSES.babatank.spec()); e.type='babatank'; e.T={}; e.scale=1.25; e.spd=95; }
  else if(type==='controller'){ e=new Actor(x,y,BOSSES.controller.spec()); e.type='controller'; e.T={}; e.scale=1.2; e.spd=34; }
  else if(type==='guard'){ e=new Actor(x,y,mkSpec({skin:'#e8b48a',hairStyle:'bigcap',hair:'#1a1a1a',top:'#2a2a2a',belly:'#3a3a3a',pants:'#1a1a1a',headR:9,bodyW:16,acc:['bigcap'],face:{eyeL:2,eyeR:2,seed:2,mouth:'smug'}})); e.type='guard'; e.T={}; }
  else { e=makeEnemy(type,x,y); e.free=true; }
  e.st='idle'; e.stT=0; e.vx=0; e.vy=0; e.z=0; e.r=type==='bag'||type==='aunt'||type==='tourist'||type==='mom'?8:type==='kid'?5:type==='babatank'?11:6.5;
  e.m=type==='bag'||type==='mom'?4:type==='aunt'?2.2:type==='babatank'?9:type==='statue'?6:type==='kid'?.7:1; e.mood='norm'; e.face=Math.random()<.5?1:-1; e.anT=Math.random()*3; e.tx=null; return e; }
const SEP_R=7;
function crowdStep(list,dt,z){ // разведение капсул + «стены» зоны
  const h0=G.hero, smin=z.sepMin||0, cap=z.sepCap||0, sr=z.sepR!==undefined?z.sepR:SEP_R; // очереди у турникетов — с шагом 14, там радиус как в v3.2
  for(let i=0;i<list.length;i++){ const a=list[i]; if(a.ghost) continue; for(let j=i+1;j<list.length;j++){ const b=list[j]; if(b.ghost) continue; let dx=b.x-a.x, dy=(b.y-a.y)*2, d=Math.hypot(dx,dy); const R=Math.max(sr,a.r)+Math.max(sr,b.r); // V33-5: мягкое разделение, радиус ≥7
    if(d<=0.001&&R>0){ dx=(i%2?1:-1)*.01; dy=.01; d=.0141; } // двое в одной точке — развести
    if(d<R){ let o=(R-d); if(o<smin) continue; if(cap&&a!==h0&&b!==h0) o=Math.min(o,cap*2); const nx=dx/d, ny=dy/d/2; const ma=a.m*(a.inSoft?4:1), mb=b.m*(b.inSoft?4:1); /* V33-4: выталкиваемый из зоны контролов «тяжелее» — его не загоняют обратно */ const wa=a.pin?0:(b.pin?1:mb/(ma+mb)), wb=b.pin?0:(a.pin?1:ma/(ma+mb)); a.x-=nx*o*wa*.5; a.y-=ny*o*wa*.5; b.x+=nx*o*wb*.5; b.y+=ny*o*wb*.5; } } }
  for(const a of list){ a.y=clamp(a.y,z.y0,z.y1); if(!a.free) a.x=clamp(a.x,z.x0!==undefined?z.x0:4,z.len-4); if(z.solids&&!a.noSolid) for(const s of z.solids){ if(a.x>s[0]-a.r&&a.x<s[2]+a.r&&a.y>s[1]-a.r/2&&a.y<s[3]+a.r/2){ // вытолкнуть по меньшей оси
      const pl=a.x-(s[0]-a.r), pr=(s[2]+a.r)-a.x, pt=(a.y-(s[1]-a.r/2))*2, pb=((s[3]+a.r/2)-a.y)*2, m=Math.min(pl,pr,pt,pb);
      if(m===pl) a.x=s[0]-a.r; else if(m===pr) a.x=s[2]+a.r; else if(m===pt) a.y=s[1]-a.r/2; else a.y=s[3]+a.r/2; } } } }
// V33-4 (O5.2): мягкие запретные зоны джойстика/кнопок (+8 px): толпа выталкивается 30 px/с, внутри — полупрозрачна
const SOFT_V=45; // M2-ревью: сильнее уводим толпу из-под джойстика/кнопок
function softZones(z,dt){ if(!window.hudRects||z.k==='esc'||z.k==='escape') { for(const e of z.npcs) e.inSoft=false; return; } const rs=hudRects(12).filter(q=>q.id!=='B'||z.ctxB||(typeof buttons!=='undefined'&&buttons.some(b=>b.id==='tripB'))), c=G.cam, first=z.t<=dt*1.5, K=z.K||[]; const cv=z._camP===undefined||dt<=0?0:(c-z._camP)/dt; z._camP=c; // камера едет → толпа «уплывает» с экрана, толкаем по ходу экранного движения
  for(const e of z.npcs){ const sx=e.x-c; let r=null; for(const q of rs) if(sx>q.x&&sx<q.x+q.w&&e.y>q.y&&e.y-20<q.y+q.h){ r=q; break; } e.inSoft=!!r; if(!r) continue;
    const out=e.after&&!e.gone; if(!out&&(e.ghost||e.sit||(e.pin&&!first)||e.hide||e.lane||e.joinL||e.ctl||e===z.tank||e.leaving!==undefined||e.passingT>0||e.inside||K.includes(e))) continue; const fdir=e.dir||(out?1:0), fsp=e.spd2||e.sp||(out?50:30);
    // выход по ближайшему краю: влево/вправо, или вверх (глубина), если верх зоны ниже верха пола; поток — по своему направлению
    const dl=sx-r.x, dr=r.x+r.w-sx, du=r.y>z.y0+2?e.y-r.y:1e9; let ax='x', dir=fdir||(cv>8?-1:cv<-8?1:(dl<dr?-1:1)); if((!fdir&&du<Math.min(dl,dr)&&Math.abs(cv)<=8)||du<16){ ax='y'; dir=-1; }
    const d=first?(ax==='y'?du+1:dir<0?dl+1:dr+1):(SOFT_V+(fdir&&ax==='x'?fsp*1.5:0)+(!fdir&&ax==='x'&&dir*cv<0?Math.min(90,Math.abs(cv))*.5:0))*dt; /* поток проскакивает зону быстрее */ if(ax==='y'){ e.y-=d; if(e.hy!==undefined) e.hy-=d; if(e.py!==undefined) e.py-=d; } else { e.x+=dir*d; if(e.hx!==undefined) e.hx+=dir*d; if(e.px!==undefined) e.px+=dir*d; } if(e.wander&&e.tx!=null){ const tsx=e.tx-c; if(tsx>r.x&&tsx<r.x+r.w) e.tx=null; } } }
// V33-1: экранная позиция шагает целыми пикселями без «дребезга» суб-пикселей (нет мерцания ±1 px)
function pixStep(e){ if(e.rx===undefined||Math.abs(e.x-e.rx)>6||Math.abs(e.y-e.ry)>6){ e.rx=Math.round(e.x); e.ry=Math.round(e.y); return; } e.rx+=Math.trunc(e.x-e.rx); e.ry+=Math.trunc(e.y-e.ry); }
function density(h,list){ let n=0; for(const e of list){ if(e===h||e.ghost) continue; const d=Math.hypot(e.x-h.x,(e.y-h.y)*2); if(d<h.r+e.r+5) n+=e.m; } return n; }
function walkTo(e,tx,ty,sp,dt){ const dx=tx-e.x, dy=ty-e.y, d=Math.hypot(dx,dy*1.6); if(d<1.5){ e.vx=0; e.vy=0; if(e.st==='walk') e.set('idle'); return true; } e.vx=dx/d*sp; e.vy=dy/d*sp*.7; e.x+=e.vx*dt; e.y+=e.vy*dt; e.face=Math.abs(dx)>2?(dx>0?1:-1):e.face; e.set('walk'); return false; }
function npcTick(e,dt){ e.anT+=dt; e.stT+=dt; e.sq+=(1-e.sq)*Math.min(1,dt*12); e.flash=Math.max(0,(e.flash||0)-dt); if(e.stun>0){ e.stun-=dt; } if(e.bub>0) e.bub-=dt; }
function tev(k){ (TR.ev=TR.ev||{})[k]=(TR.ev[k]||0)+1; }
function bubble(e,s,t=1.6,col='#fff'){ e.bub=t; e.bubS=s; e.bubC=col; }
// ---------- старт поездки ----------
let curTrip=-1;
// бюджет метро-сегмента (как v3): Σ нормативов зон × (1.35 − min(.25, idx·.01)) × k(день, погода)
function tripBudget(zones,idx,kT){ const par=zones.reduce((a,z)=>a+({gate:18,esc:9,passage:16,plat:14,car:(z.ride||16)+4,exitz:8}[z.k]||12),0); return Math.round(par*(1.35-Math.min(.25,idx*.01))*(kT||1)); }
function startTrip(idx,opts={}){ CUT=null; curIdx=idx; curTrip=idx; const L=LEVELS[idx]; floorBand(); paused=false; input.events.length=0; window.__botStick=window.__botStick||null;
  const zones=opts.zones||stationTrip(idx);
  Object.assign(TR,{over:null,idx,name:L?L.name:'',line:L?L.w:0,zones,zi:-1,z:null,tTotal:opts.budget||tripBudget(zones,idx,opts.kT),day:opts.day||null,soft:!!opts.soft,penT:0,overtime:0,score:0,scandal:0,scandals:0,polite:0,found:0,spot:0,spotName:'стоя',nerves:100,boost:0,eggs:[],done:false,win:false,reason:'',fade:0,wd:{t:0,best:-1e9,fired:0},log:[],mode:opts.mode||'trip',ev:{},coinsGot:0,stars:0,wasDaily:false,next:0,smod:null,tut:null}); /* M6: next/smod/tut не протекают из прошлой поездки (ЕЩЁ РАЗ пропускал зону 0, если проигрыш случился во время перехода) */
  TR.rain=zones.some(z=>z.k==='exitz'&&z.rain)||!!opts.rain;
  TR.tLeft=TR.tTotal; TR.wasDaily=TR.mode==='trip'&&dailyBonus();
  Object.assign(G,{ens:[],items:[],fx:[],parts:[],pops:[],cam:0,camLock:null,score:0,coins:0,combo:0,rage:0,msg:null,hurtTaken:0,time:0,stats:{},done:false,cutDone:false,win:false,lost:false,tut:-1,stars:0,bestCombo:0});
  G.lv={name:TR.name,line:L?L.w:0,w:L?L.w:0,i:L?L.i:0,len:600,bg:'station',arenas:[],props:[],items:[],poles:[],hooks:{},par:TR.tTotal};
  G.hero=makeHero(heroId,30,(FY0+FY1)/2); G.hero.r=6.5; G.hero.m=1.2;
  G.scene='trip'; tgBack(true); musTheme=TR.line%3; musOn=true; SFX.ding();
  nextZone();
  if(TR.wasDaily) setTimeout(()=>{ if(G.scene==='trip') say('Соседка дала жетон и 10 монет — ежедневный бонус!',2.6,P.neonLime); },2600);
}
startLevel=function(idx){ startTrip(idx); };
function nextZone(){ TR.zi++; if(TR.zi>=TR.zones.length){ return tripFinish(true); }
  const z=TR.zones[TR.zi]; TR.z=z; Object.assign(z,{t:0,npcs:[],solids:[],len:Math.max(W,420),y0:FY0+3,y1:FY1,x0:4,done:false,hint:'',ctxA:null,ctxB:null,stage:0});
  const h=G.hero; h.x=24; h.y=(FY0+FY1)/2; h.vx=h.vy=0; h.set('idle'); h.hold=null; h.seat=null; h.stun=0; h.pin=false; h.ghost=false; h.noSolid=false; h.passing=0; h.rot=0; h.z=0; h.face=1;
  G.cam=0; G.ens=[]; G.pops=[]; G.parts=[]; TR.wd={t:0,best:-1e9,fired:TR.wd?TR.wd.fired:0}; TR.fade=.5;
  ZONES[z.k].init(z); tev('z_'+z.k+(z.mode?'_'+z.mode:'')); for(const f of ['short','babatank','cols','terminal','controller','gangway','rain','detector','vend','turnboss']) if(z[f]) tev('f_'+f); (z.feat||[]).forEach(f=>tev('f_'+f)); if(z.flow==='headon') tev('f_headon'); G.lv.len=z.len; BG.lv=G.lv; BG.t=BG.t||0; TR.log.push(z.k);
  say(z.title||ZONES[z.k].title(z),1.8,P.edge); }
function zoneDone(){ const z=TR.z; if(z.done) return; z.done=true; TR.score+=40; setTimeout(()=>{},0); TR.next=.55; }
function tripFinish(win,reason){ if(TR.done) return; TR.done=true; TR.win=win; TR.reason=reason||''; G.done=true; G.win=win; G.doneT=0; musOn=false;
  if(TR.mode==='escape') return escapeFinish(win);
  if(win){ const tl=Math.max(0,TR.tLeft); TR.score+=100+Math.round(tl*3)+({0:0,1:40,2:80,3:120}[TR.spot]||0)+TR.polite*20+TR.found*5+TR.eggs.length*50-TR.scandals*30; TR.score=Math.max(50,TR.score);
    TR.stars=TR.overtime>0?1:1+(tl>=TR.tTotal*.2?1:0)+(tl>=TR.tTotal*.2&&TR.spot>=2?1:0); G.stars=TR.stars; G.score=TR.score;
    const k=TR.line+'.'+(TR.idx%8); save.stars[k]=Math.max(save.stars[k]||0,TR.stars); save.tbest=save.tbest||{}; const before=tripPts(); save.tbest[TR.idx]=Math.max(save.tbest[TR.idx]||0,TR.score); TR.ptsGain=tripPts()-before;
    TR.coinsGot=TR.stars*3+TR.found; wallet().coins+=TR.coinsGot; G.coins=TR.coinsGot; TR.newUnlocks=LOC.filter(l=>ST_THR[l[1]]>before&&ST_THR[l[1]]<=tripPts()).map(l=>l[2]); TR.newSt=ST_THR.map((t,i)=>i).filter(i=>ST_THR[i]>before&&ST_THR[i]<=tripPts()).map(i=>LEVELS[i].name);
    if(TR.idx===7&&!save.unlockedBaba){ save.unlockedBaba=true; TR.newUnlocks.push('герой: Бабка Зинаида'); }
    store(); SFX.win(); }
  else { G.score=0; G.stars=0; store(); SFX.ko(); }
}
// ---------- обновление ----------
// M1-5: штрафы событий — через кламп 45 с за день (объезд V33-2 — свой лимит 60 с); бездействие не клампится
const PEN_CAP=45;
function penalize(sec,src){ const room=Math.max(0,PEN_CAP-(TR.penT||0)), s=Math.min(sec,room); TR.penT=(TR.penT||0)+s; TR.tLeft-=s; if(s<sec) tev('pen_cap'); tev('pen_'+(src||'x')); return s; }
const HSPD={serega:72,baba:60,rustam:84,varya:78,gena:66};
function tripUpdate(dt){ const h=G.hero, z=TR.z; if(!z) return;
  if(window.__botTick&&!paused) window.__botTick(dt);
  for(const ev of input.events){ if(ev.t==='key'){ if(ev.code==='Escape') paused=!paused; else if(ev.code==='KeyJ'||ev.code==='Space') tripPress('A'); else if(ev.code==='KeyK'||ev.code==='Enter') tripPress('B'); } }
  if(paused) return;
  if(TR.done){ G.doneT+=dt; if(G.doneT>1.2&&!G.cutDone){ G.cutDone=true; startCut(TR.mode==='escape'?(TR.win?'escwin':'esclose'):TR.win?'tripwin':(TR.reason==='depot'?'depot':'late'),()=>showResult()); } return; }
  G.time+=dt; TR.tLeft-=dt; if(TR.tLeft<=0){ TR.tLeft=0; if(TR.soft) TR.overtime+=dt; else return tripFinish(false,'late'); } // выходной: мягкие часы, 09:00 не проигрыш
  if(TR.fade>0) TR.fade-=dt;
  detourGuard();
  if(TR.next>0){ TR.next-=dt; if(TR.next<=0){ TR.next=0; nextZone(); } return; }
  z.t+=dt; TR.boost=Math.max(0,TR.boost-dt); if(G.msg){ G.msg.t-=dt; if(G.msg.t<=0) G.msg=null; }
  TR.scandal=Math.max(0,TR.scandal-dt*4);
  // герой: движение по стику (зона может перехватить)
  if(!z.lockHero){ heroMove(h,dt,z); }
  h.anT+=dt; h.stT+=dt; h.sq+=(1-h.sq)*Math.min(1,dt*12); h.flash=Math.max(0,(h.flash||0)-dt);
  if(z.maxStep) for(const e of z.npcs){ e._px=e.x; e._py=e.y; }
  ZONES[z.k].update(z,dt);
  for(const e of z.npcs) npcTick(e,dt);
  if(!z.noCrowd) crowdStep([h,...z.npcs],dt,z);
  softZones(z,dt);
  if(z.maxStep) for(const e of z.npcs){ if(e._px===undefined||e.kx||e.ky||e.ctl||e.sit) continue; const m=z.maxStep*dt*60; e.x=e._px+clamp(e.x-e._px,-m,m); e.y=e._py+clamp(e.y-e._py,-m,m); } // V33-1: стоящие не дёргаются >1 px/кадр
  if(z.k==='car') for(const e of z.npcs){ if(e.sit||e.ctl||e.leaving!==undefined||e.inside||e.after||e.hide||e.seek!==undefined) continue; const lo=G.cam+(z.bx0||24)+10, hi=G.cam+W-96; if(hi>lo&&(e.x<lo||e.x>hi)){ e.x=clamp(e.x,lo,hi); e.kx=0; } } // M2-ревью: в вагоне стоящие не под джойстиком/кнопками (камера почти неподвижна)
  if(z.k==='mtrain'&&window.hudRects){ const rs=hudRects(10).filter(q=>q.id!=='B'||z.ctxB), ctx2=clamp(h.x-W*.42,-Math.round(W*.25),Math.max(0,z.len-W)), c=G.cam+(ctx2-G.cam)*Math.min(1,dt*6), cv=z._cp2===undefined||dt<=0?0:(c-z._cp2)/dt; z._cp2=c; for(const e of z.npcs){ if(e.sit||e.ctl||e.pin||e.ghost) continue; const sx=e.x-c; for(const q of rs){ if(sx+10>q.x&&sx-10<q.x+q.w&&e.y>q.y-2&&e.y-42<q.y+q.h){ const dl=sx+10-q.x, dr=q.x+q.w-(sx-10), m=1e9; const left=e._pd!==undefined?e._pd:(cv>10?true:cv<-10?false:(dl<dr&&q.x>2)); e._pd=left; if(left) e.x-=Math.min(dl+1,m); else e.x+=Math.min(dr+1,m); e.kx=0; e._pin2=1; break; } } if(!e._pin2) e._pd=undefined; e._pin2=0; } } // M3: длинный поезд — стоящие не под стиком/кнопками (по экрану)
  for(const e of z.npcs) pixStep(e); pixStep(h);
  // сторож: нет прогресса 10 с — подсказка, 18 с — зона помогает сама
  const p=ZONES[z.k].prog(z); if(p>TR.wd.best+4){ TR.wd.best=p; TR.wd.t=0; } else TR.wd.t+=dt;
  if(TR.wd.t>10&&!z.hintShown){ z.hintShown=true; say('Подсказка: '+(ZONES[z.k].tip?ZONES[z.k].tip(z):'жми ТОЛКНУТЬ и иди вперёд'),2.6,P.neonCyan); }
  { const lim=z.k==='gate'?40:z.k==='car'||z.k==='mtrain'?(z.ride||30)+40:z.k==='mega'?100:70; /* M6: МЕГА ≥2700 px + касса — 70 с мало на широких экранах */ if(z.t>lim+(z.hardN||0)*20){ z.hardN=(z.hardN||0)+1; TR.wd.fired++; tev('wd_hard_'+z.k); ZONES[z.k].unstick(z); say('Толпа сама расступилась…',1.6,'#ccc'); } }
  if(TR.wd.t>18){ TR.wd.t=0; TR.wd.fired++; tev('wd_'+z.k); z.hintShown=false; ZONES[z.k].unstick(z); say('Толпа сама расступилась…',1.6,'#ccc'); }
  // камера
  const tx=z.k==='esc'?0:clamp(h.x-W*.42,-Math.round(W*.25),Math.max(0,z.len-W)); G.cam+=(tx-G.cam)*Math.min(1,dt*6);
  G.shake=Math.max(0,G.shake-dt*14); updFX(dt);
  for(const q of G.pops){ q.t+=dt; } G.pops=G.pops.filter(q=>q.t<q.life);
  BG.t+=dt;
  // контекст-кнопки
  const c=ZONES[z.k].ctx(z)||{}; z.ctxB=c.b||null; z.ctxA=c.a||null;
}
function heroMove(h,dt,z){ if(h.stun>0){ h.stun-=dt; h.set('hurt'); return; } if(h.hold||h.seat){ const s=stickVec(); if(Math.hypot(s.x,s.y)>.6&&!z.noLeave){ h.hold=null; h.seat=null; h.pin=false; TR.spot=0; TR.spotName='стоя'; } else { h.set(h.seat?'sleep':'idle'); return; } }
  const s=stickVec(); const den=z.noCrowd?0:density(h,z.npcs); const S=heroStats(); let sp=S.SPD*(1/(1+den*S.SQZ*(1-S.YIELD)))*(TR.boost>0?1.35:1)*(z.slow||1)*(TR.nerves<25?.8:1)*(z.wet?S.stairsMul:1); // M1-19: статы героя
  if(z.wet){ h.vx+=(s.x*sp-h.vx)*Math.min(1,dt*2.2); h.vy+=(s.y*sp*.7-h.vy)*Math.min(1,dt*2.2); } else { h.vx=s.x*sp; h.vy=s.y*sp*.7; }
  h.x+=h.vx*dt; h.y+=h.vy*dt; if(Math.abs(h.vx)>4) h.face=h.vx>0?1:-1;
  if(h.st!=='atk'||h.stT>.25) h.set(Math.hypot(h.vx,h.vy)>6?'walk':'idle');
  h.den=den; }
function tripPress(k){ const z=TR.z; if(!z||TR.done||paused||TR.next>0) return; const h=G.hero;
  if(k==='B'){ if(z.ctxB){ z.ctxB.fn(); SFX.ui(); haptic('select'); } return; }
  if(z.ctxA){ z.ctxA.fn(); SFX.ui(); return; }
  // ТОЛКНУТЬ
  if((h.shoveCd||0)>G.t||h.stun>0) return; h.shoveCd=G.t+.45; h.set('atk'); h.atkPose='p2'; h.stT=0; SFX.whiff(); haptic('light');
  const S=heroStats(), pk=S.PUSH[1]/16; let n=0, rude=0; for(const e of z.npcs){ if(e.ghost||e.pin&&e.m>5) continue; const dx=(e.x-h.x)*h.face, dy=Math.abs(e.y-h.y); if(dx>-4&&dx<S.PUSH[0]&&dy<9){ const f=140/Math.max(.7,e.m); e.x+=h.face*Math.min(S.PUSH[1],f*.08*pk); e.y+=(e.y>h.y?1:-1)*6; e.sq=.8; e.flash=.1; n++; if(e.type==='mom'||e.type==='granny'||e.type==='polite') rude++; if(Math.random()<.35) bubble(e,pick(['Э!','Ну-ну!','Куда?!','Ай!','Молодой человек!']),1); if(e.onShove) e.onShove(e); } }
  if(n){ tev('shove'); TR.scandal+=(6+n*4+rude*10)*S.SCN; if(typeof heroOnShove==='function') heroOnShove(n,h); pop(pick(['ТЫЦ','ПШШ','ТОЛК','ПОДВИНЬСЯ']),h.x+h.face*14,h.y-40,'#fff',7); shake(1); }
  if(TR.scandal>=100){ tev('scandal'); TR.scandal=40; TR.scandals++; h.stun=2.2; say('СКАНДАЛ! «Совсем совесть потеряли!»',2,P.red); SFX.hurt(); haptic('heavy'); TR.nerves=Math.max(0,TR.nerves-20); for(const e of z.npcs){ if(Math.abs(e.x-h.x)<50) { e.angry=true; bubble(e,pick(['ХАМ!','Безобразие!','Я на тебя напишу!']),1.6,P.red); } } }
}
window.__trip={TR,press:tripPress,stationTrip,ST_THR,LOC,tripPts,wallet,startTrip,ZONES};
