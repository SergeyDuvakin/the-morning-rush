// M1-2/M1-3: маршрут дня. Дом → улица-1 → метро/МЦК/МЦД → улица-2 → БЦ → офис. Пул событий по сегменту, без повторов зоны подряд,
// событие не 2 дня подряд, 2–3 вариации на событие. Бюджеты: улица-1 35–55, метро как v3, МЦК/МЦД 60–90, улица-2 30–45, БЦ 25–40 с.
// M5-11 баланс: «пар» зоны = медиана опытного бота (90 будних дней, всё открыто); бюджет = Σпар·(погода/ПН вполсилы)·1.04 + 14 с запаса
const PAR5={gate:18,esc:7,passage:18,plat:7,exitz:14,mgate:13,mplat:9,mexit:11,street:30,bcgate:11,bclift:9,bcstairs:15}, BAL5={k:1.04,add:14};
function zonePar5(z){ if(z.k==='car') return (z.ride||16)+3; if(z.k==='mtrain') return (z.ride||32)+1; const p=PAR5[z.k]||12; if(z.k==='street') return p; const wf=typeof W==='number'?.5+.5*Math.max(W,480)/844:1; return p*wf; } // зоны шириной в экран короче на узких экранах (улица нормирована в days5)
function balPar5(zones,kT){ const par=zones.reduce((a,z)=>a+zonePar5(z),0); return Math.round(par*(1+((kT||1)-1)*.5)*BAL5.k+BAL5.add); }
const SEG4={
  home:{n:'ДОМ'}, office:{n:'ОФИС'},
  street1:{n:'УЛИЦА',bud:[35,55],unlock:'street1',ev:['light','puddles','promoter','pigeons','construction','accident','ice']},
  metro:{n:'МЕТРО',bud:[60,140]},
  mck:{n:'МЦК',bud:[60,90],unlock:'mck',ev:[]}, mcd:{n:'МЦД',bud:[60,90],unlock:'mcd',ev:['controllers']},
  street2:{n:'УЛИЦА',bud:[30,45],unlock:'street2',ev:['scooters','couriers','coffee']},
  bc:{n:'БЦ',bud:[25,40],unlock:'bcgate',ev:['lift','stairs14','colleague']} };
// реализованные сегменты (M1: только метро; улица — M2, МЦК/МЦД — M3, БЦ — M4)
const SEG_IMPL={metro:true,street1:true,street2:true}; // M2: улицы реализованы (street4.js)
// события: v — число вариаций, heavy — «тяжёлое» (для ПН), w — только в погоду, nw — не в погоду
const EV4={ light:{v:3,n:'светофор'}, puddles:{v:2,w:'rain',n:'лужи'}, promoter:{v:3,nw:'rain',n:'промоутер'}, pigeons:{v:2,nw:'rain snow',n:'голуби'}, construction:{v:2,heavy:1,n:'стройка'}, accident:{v:2,heavy:1,n:'ДТП'}, ice:{v:2,w:'snow',n:'лёд'},
  controllers:{v:2,heavy:1,n:'контролёры'}, scooters:{v:2,nw:'snow',n:'самокаты'}, couriers:{v:2,n:'курьеры'}, coffee:{v:3,n:'кофейня'}, lift:{v:2,n:'лифт'}, stairs14:{v:2,heavy:1,n:'лестница'}, colleague:{v:3,n:'коллега'},
  vend:{v:2,n:'автомат кофе'}, detector:{v:2,heavy:1,n:'рамка'}, stairs:{v:2,heavy:1,n:'лестница'}, kiosk:{v:3,n:'ларьки'}, lost:{v:2,n:'бюро находок'}, short:{v:2,heavy:1,n:'короткий поезд'}, cols:{v:2,n:'колонны'},
  gangway:{v:2,n:'тамбур'}, terminal:{v:2,heavy:1,n:'конечная'}, transfer:{v:2,heavy:1,n:'пересадка'}, headon:{v:2,heavy:1,n:'узкий проход'}, musician:{v:3,n:'музыкант'}, walkway:{v:2,n:'траволатор'},
  repairs:{v:3,heavy:1,n:'ремонт'}, service:{v:2,n:'служебка'}, vendp:{v:2,n:'автомат'}, kioskp:{v:2,n:'ларьки'}, stairs2:{v:2,n:'лестница'}, rain:{v:2,w:'rain',n:'дождь'} };
const METRO_EV=['vend','detector','stairs','kiosk','lost','short','cols','gangway','terminal','transfer','headon','musician','walkway','repairs','service','vendp','kioskp','stairs2','rain'];
const EV_NEED={vendp:'vend',kioskp:'kiosk',stairs2:'stairs',musician:'transfer',cols:'kassa'};
function evIntro(k,idx){ const id=EV_NEED[k]||k, l=LOC.find(l=>l[0]===id); return !!l&&l[1]<=idx; }
const EV_SUB={transfer:1}; // «своя» станция события задаётся в stationTrip (sig)
function routeRng(day,idx,salt){ return mulberry32(((day.seed>>>0)^Math.imul(idx+1,0x9e3779b1)^(salt||0))>>>0); }
// план дня для станции idx. env: {unl(id), impl(seg), evLast, dayN}
function planRoute(day,idx,env){ env=env||{}; const unl=env.unl||(()=>false), impl=env.impl||(s=>!!SEG_IMPL[s]), evLast=env.evLast||{}, dayN=env.dayN||0;
  const rng=routeRng(day,idx), type=day.type, wk=unl('weekdays'), wth=unl('weather')?day.weather:'clear';
  const mon=wk&&day.weekday===0, fri=wk&&day.weekday===4, wend=type==='weekend';
  const yest=k=>evLast[k]===dayN-1; let heavyDay=0; // R5: ≤1 тяжёлое на сегмент, ≤3 на день // было вчера — сегодня нет
  // сегменты
  const extra=type==='long'?(unl('mcd')&&impl('mcd')?'mcd':unl('mck')&&impl('mck')?'mck':null):null, trans='metro'; // длинный: + МЦК/МЦД (или 2 пересадки)
  const ids=['home','street1','metro'].concat(extra?[extra]:[],['street2','bc','office']);
  const segs=ids.map(id=>{ const S=SEG4[id], locked=!!(S.unlock&&!unl(S.unlock)), play=id==='home'||id==='office'?false:id==='metro'?true:(!locked&&impl(id));
    const g={id,n:S.n,locked,impl:id==='metro'||!!impl(id),play,events:[]};
    if(S.bud){ g.budget=Math.round(S.bud[0]+rng()*(S.bud[1]-S.bud[0])); }
    if(S.ev&&!locked){ const pool=S.ev.filter(k=>unl(k)&&!yest(k)&&(!EV4[k].w||EV4[k].w.split(' ').includes(wth))&&!(EV4[k].nw&&EV4[k].nw.split(' ').includes(wth)));
      const n=Math.min(pool.length,type==='short'||wend?1:2); /* M5-11: длинный день — не больше 2 событий на улицу (длина 6–7 мин) */ for(let i=0;i<n&&pool.length;i++){ const k=pool.splice(Math.floor(rng()*pool.length),1)[0]; if(EV4[k].heavy&&(g.events.some(e=>EV4[e.k].heavy)||heavyDay>=3)){ i--; continue; } if(EV4[k].heavy) heavyDay++; g.events.push({k,v:Math.floor(rng()*EV4[k].v)}); } }
    return g; });
  // M3-8: контролёры на МЦК/МЦД — шанс 35% (ПН +15%, ПТ −10%), не в выходные; событие сегмента
  for(const g of segs) if((g.id==='mck'||g.id==='mcd')&&!g.locked){ const pc=typeof m3CtlP==='function'?m3CtlP(g.id,wk?day.weekday:-1):.35; g.events=unl('controllers')&&!wend&&rng()<pc?[{k:'controllers',v:Math.floor(rng()*2)}]:[]; }
  // метро: опции станции решает генератор
  const p0=wend?.18:type==='short'?.2:type==='long'?.5:.35; const on={};
  for(const k of METRO_EV){ if(!evIntro(k,idx)) continue; if(k==='rain'){ on[k]=unl('weather')?wth==='rain':rng()<p0*.6; continue; } on[k]=!yest(k)&&rng()<p0; }
  if(mon){ const hv=METRO_EV.filter(k=>EV4[k].heavy&&evIntro(k,idx)&&!on[k]&&!yest(k)&&k!=='transfer'); if(hv.length) on[hv[Math.floor(rng()*hv.length)]]=true; }
  if(type==='long'&&!extra&&evIntro('transfer',idx)&&!yest('transfer')) on.transfer=true; // M5-11: при МЦК/МЦД длинный день не форсирует пересадку
  const zones=stationTrip(idx,k=>!!on[k]);
  const used=new Set(); let aftT=false; for(const q of zones){ for(const k of ['vend','detector','short','cols','gangway','terminal']) if(q[k]) used.add(k); if(q.k==='esc'&&q.mode==='stairs') used.add(aftT?'stairs2':'stairs'); if(q.k==='passage'){ if(q.title==='ПЕРЕХОД НА ДРУГУЮ ЛИНИЮ'){ used.add('transfer'); aftT=true; } if(q.flow==='headon') used.add('headon'); for(const f of q.feat) used.add(f==='kiosk'&&q.title!=='ПОДЗЕМНЫЙ ПЕРЕХОД'?'kioskp':f); } if(q.k==='exitz'&&q.rain) used.add('rain'); }
  const vars={}; for(const k of used) vars[k]=Math.floor(rng()*(EV4[k]?EV4[k].v:2));
  // тип дня и день недели → состав и толпа
  const crowdK=(wend?.6:1)*(mon?1.35:fri?.8:1);
  for(const q of zones){ if(q.crowd) q.crowd=Math.max(3,Math.round(q.crowd*crowdK*(1+((vars.cols||0)-.5)*.1)));
    if(q.k==='gate'){ q.qmin=Math.max(1,Math.round(q.qmin*crowdK)); q.qmax=Math.max(q.qmin+1,Math.round(q.qmax*crowdK)); }
    if(q.k==='car'&&!q.back){ if(type==='short'||wend){ q.stops=Math.max(1,q.stops-1); q.ride=Math.round(q.ride*(wend?.7:.8)); } else if(type==='long'){ q.stops+=1; q.ride=Math.round(q.ride*1.2); } }
    if(q.k==='plat'&&vars.short!==undefined&&q.short) q.openT=+(q.openT+(vars.short?.5:0)).toFixed(2); q.vars=vars; }
  const metro=segs.find(s=>s.id===trans); metro.events=[...used].map(k=>({k,v:vars[k]}));
  const kT=(mon?1.10:1)*({clear:1,rain:1.10,snow:1.15,fog:1.08}[wth]||1); // M2-9: погода +8–15%
  // M1-3: бюджеты. Метро — как v3 (tripBudget). Остальные играбельные сегменты подгоняются под длину дня по типу (±, клампы диапазонов)
  metro.budget=tripBudget(zones,idx,kT); const others=segs.filter(g=>g.play&&g.id!=='metro'), T=Math.round(day.len*(mon?1.15:fri?.85:1));
  if(others.length){ const S=others.reduce((a,g)=>a+g.budget+8*g.events.length,0), f=Math.max(.6,Math.min(1.6,(T-metro.budget)/Math.max(1,S)));
    for(const g of others){ const B=SEG4[g.id].bud; g.budget=Math.round(Math.max(B[0]*.8,Math.min(B[1]*1.25,(g.budget+8*g.events.length)*f))); } }
  let total=segs.filter(g=>g.play).reduce((a,g)=>a+g.budget,0);
  // M2: зоны дня = улица-1 + метро + улица-2 (играбельные сегменты)
  for(const q of zones) q.seg=q.seg||'metro';
  let all=zones; if(typeof streetZones==='function'){ const s1=segs.find(g=>g.id==='street1'), s2=segs.find(g=>g.id==='street2'); const pre=s1&&s1.play?streetZones(s1,day,idx):[]; if(pre.length&&unl('fork')&&s1.events.length&&rng()<.45) pre[0].fork=1; const _pre0=0, post=s2&&s2.play?streetZones(s2,day,idx):[];
    const sx=segs.find(g=>(g.id==='mck'||g.id==='mcd')&&g.play), mid=sx&&typeof m3Zones==='function'?m3Zones(sx,day,idx):[]; // M3: МЦК/МЦД после метро
    const sb=segs.find(g=>g.id==='bc'&&g.play), bz=sb&&typeof bcZones==='function'?bcZones(sb,day,idx,post):[]; // M4: БЦ после улицы-2
    for(const q of [...pre,...post,...bz]){ q.weather=q.weather||wth; q.crowdK=crowdK; } all=[...pre,...zones,...mid,...post,...bz]; }
  if(!wend&&all.length){ const tgt=balPar5(all,kT), f=tgt/Math.max(1,total); for(const g of segs) if(g.play) g.budget=Math.round(g.budget*f); total=segs.filter(g=>g.play).reduce((a,g)=>a+g.budget,0); } // M5-11: бюджет от «пара» зон
  return {total,target:T,segs,zones:all,kT:+kT.toFixed(3),soft:wend,rain:wth==='rain',crowdK:+crowdK.toFixed(2),events:[...used],trans,weather:wth}; }
// проверка «без повторов зоны подряд»: соседние зоны разных типов (кроме перрон→вагон пересадки — разные k всегда)
function zonesNoRepeat(zones){ for(let i=1;i<zones.length;i++) if(zones[i].k===zones[i-1].k) return false; return true; }
// M1-10: первый сегмент после интро — улица-1 только если открыта и реализована, иначе вестибюль как в v3
function firstSegment(unl,impl){ unl=unl||(id=>(save.unlocks4||[]).includes(id)); impl=impl||(s=>!!SEG_IMPL[s]); return unl('street1')&&impl('street1')?'street1':'lobby'; }
