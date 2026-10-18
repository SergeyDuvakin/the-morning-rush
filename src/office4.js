// v4 M4 «От метро до офиса» (§C): улица-2 — самокаты сзади (C1), курьеры-бульдозеры (C2), кофейня (C3), трамвайный переезд (§P5/M4-11).
// Зоны БЦ (турникет/лифт/лестница/коллега) — ниже в этом файле по мере реализации. core.js не трогаем.
const M4={COFFEE:8,COFFEE_FRI:5,BUFF:1.15,BUFF_T:40};
// персонаж листа на самокате (atlas ch scoot_ride 48×52) + произвольная отрисовка актёра (a.drawFn) с сортировкой по y ног
{ const _da=drawActor; drawActor=function(a,ex){ if(a.drawFn){ a.drawFn(a); return; }
  if(a.atl&&a.atlSt==='ride'&&atlOk('ch')&&G.scene==='trip'){ const x=Math.round(a.x-G.cam), y=Math.round(a.y-(a.z||0)); ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(x-12,Math.round(a.y)-1,24,3);
    atlDraw(ctx,'ch','scoot_ride_'+(Math.floor(G.t*10)%2),x-24,y-51,(a.face||1)<0); if(window.__silh) return; // скорость-линии
    ctx.fillStyle='rgba(255,255,255,.55)'; const d=-(a.face||1); for(let i=0;i<3;i++){ const L=6+((Math.floor(G.t*20)+i*3)%5); ctx.fillRect(d>0?x+16:x-16-L,y-30+i*8,L,1); } if(ex) ex(x,y); return; }
  return _da(a,ex); }; }
// бафф кофе ×1.15 (40 с) — через z.slow, как зонт; таймер в tripUpdate вне модалок
{ const _hm=heroMove; heroMove=function(h,dt,z){ if(TR.coffeeT>0&&z&&!TR.smod){ const s0=z.slow; z.slow=(s0||1)*M4.BUFF; _hm(h,dt,z); z.slow=s0; return; } return _hm(h,dt,z); };
  const _tu=tripUpdate; tripUpdate=function(dt){ if(TR.coffeeT>0&&!TR.smod&&!TR.done) TR.coffeeT=Math.max(0,TR.coffeeT-dt); return _tu(dt); };
  const _st=startTrip; startTrip=function(...a){ TR.coffeeT=0; TR.coffee=0; return _st(...a); }; __trip.startTrip=startTrip;
  const _hud=tripHUD; tripHUD=function(){ _hud(); if(TR.coffeeT>0&&!TR.smod&&G.scene==='trip') m4CupHud(); }; }
function m4Cup(x,y){ x=Math.round(x); y=Math.round(y); const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,0,0,7,10); f('#f4ead8',1,2,5,7); f('#8a5a3a',1,4,5,3); f('#3a2418',1,1,5,1); f(P.ink,7,3,1,4); }
function m4CupHud(){ const x=SA.l+10, y=SA.t+50; const s=Math.ceil(TR.coffeeT); ctx.fillStyle='rgba(10,6,20,.55)'; ctx.fillRect(x-3,y-3,48,16); m4Cup(x,y); G.labels.push(['×1.15 '+s+'с',x+10,y+5,7,'#ffd98a','left',P.ink]); }
function m4Price(){ const d=TR.day||{}; return d.weekday===4?M4.COFFEE_FRI:M4.COFFEE; }
function m4Npc(atl,x,y,face){ const e=mkNpc(qType(6),x,y); e.atl=atl; e.ctl=1; e.ghost=true; e.noSolid=true; e.face=face||1; e.anT=Math.random()*3; return e; }
function m4Bell(){ try{ tone(1760,.07,'square',.10); tone(1760,.07,'square',.10,0,.12); }catch(e){} }
// предупреждение «!» у края экрана (как лужи M2-4): рамка-пульс, стрелка направления; y — над полосой тротуара
function m4Warn(side,y,txt){ ctx.globalAlpha=.8+.2*Math.abs(Math.sin(G.t*9)); const x=side<0?SA.l+30:W-SA.r-30; ctx.fillStyle='#e8303a'; ctx.fillRect(x-10,y-11,20,22); ctx.fillStyle=P.ink; ctx.fillRect(x-8,y-9,16,18); ctx.fillStyle='#ffd23f'; ctx.fillRect(x-7,y-8,14,16); ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-6,2,8); ctx.fillRect(x-1,y+4,2,2); ctx.globalAlpha=1;
  if(txt) G.labels.push([txt,side<0?x+14:x-14,y,7,'#ffe14a',side<0?'left':'right',P.ink]); }
// ---------- M4-1: самокаты сзади (звонок + тень + «!» слева), увернуться сменой полосы (3 полосы глубины); не в снег ----------
SEV.scooters={ title:z=>'САМОКАТЫ',
  init(z,r){ z.scW=z.v?3:4; z.scT=1.6; z.scWarn=null; z.dodge=0; z.scHit=0; },
  update(z,dt){ const h=G.hero, g=st4Geo();
    if(!z.scWarn){ z.scT-=dt; if(z.scT<=0&&z.scW>0&&h.x>60&&h.x<z.len-150){ const hl=st4Lane(h.y), ls=[hl]; if(z.v){ ls.push(hl===0?2:hl===2?0:(Math.random()<.5?0:2)); } z.scWarn={t:1.15,ls}; z.scW--; m4Bell(); try{ tone(90,.6,'sawtooth',.05); }catch(e){} tev('scooter_warn'); } }
    else { const w=z.scWarn; w.t-=dt; if(w.t<=0&&!w.go){ w.go=1; for(const l of w.ls){ const e=m4Npc('scoot',G.cam-30-Math.random()*16,g.lane[l],1); e.atlSt='ride'; e.scoot=1; e.lane=l; e.v=200+Math.random()*30; z.npcs.push(e); } } if(w.go&&!z.npcs.some(e=>e.scoot&&e.x<G.cam+W+40)){ z.scWarn=null; z.scT=1.8+Math.random()*1.4; } }
    for(const e of z.npcs){ if(!e.scoot) continue; e.x+=e.v*dt; e.anT=(e.anT||0)+dt;
      if(!e.hit&&!h.stun&&Math.abs(e.x-h.x)<10&&Math.abs(e.y-h.y)<6){ e.hit=1; z.scHit++; tev('scooter_hit'); penalize(3,'scooter'); h.stun=.5; h.set('hurt'); h.x+=10; TR.nerves=Math.max(0,TR.nerves-4); haptic('error'); pop('ВЖУХ! −3 с',h.x,h.y-50,'#ffe14a',8); bubble(e,pick(['Смотри куда идёшь!','Дзынь же было!','Посторонись!']),1.4,'#fff'); }
      if(!e.passed&&e.x>h.x+12){ e.passed=1; if(!e.hit&&Math.abs(e.y-h.y)<20){ z.dodge++; tev('scooter_dodge'); } } }
    z.npcs=z.npcs.filter(e=>!e.scoot||e.x<G.cam+W+80); },
  goal(z){ return z.scWarn&&!z.scWarn.go?'Самокат сзади! Смени полосу ↑↓':null; },
  tip:z=>'звонок и «!» слева — самокат по твоей полосе: уйди вверх или вниз',
  draw(z,layer){ const w=z.scWarn, g=st4Geo(); if(!w||w.go) return; const k=1-w.t/1.15;
    if(layer==='ground'){ for(const l of w.ls){ const y=g.lane[l]; ctx.fillStyle='rgba(255,90,60,'+(.10+.10*Math.abs(Math.sin(G.t*10)))+')'; ctx.fillRect(0,y-4,Math.round(G.hero.x-G.cam),7);
        const sx=Math.round(-16+k*44); ctx.fillStyle='rgba(10,6,20,'+(.18+.22*k)+')'; ctx.fillRect(sx-10,y-1,20,3); ctx.fillRect(sx-7,y-2,14,5); } }
    if(layer==='ui') m4Warn(-1,z.y0-14,'ДЗЫНЬ!'); },
  bot(z){ const h=G.hero, g=st4Geo(); const danger=new Set(); if(z.scWarn&&!z.scWarn.go) z.scWarn.ls.forEach(l=>danger.add(l)); for(const e of z.npcs) if(e.scoot&&e.x<h.x+4&&e.x>h.x-260) danger.add(e.lane);
    if(!danger.size) return null; const hl=st4Lane(h.y); if(!danger.has(hl)&&Math.abs(h.y-g.lane[hl])<5) return {x:h.x+6,y:g.lane[hl]}; const free=[0,1,2].filter(l=>!danger.has(l)).sort((a,b)=>Math.abs(a-hl)-Math.abs(b-hl))[0]; return {x:h.x+4,y:g.lane[free===undefined?0:free]}; } };
// ---------- M4-2: курьеры с клетчатыми сумками — идут «бульдозером» навстречу; не уступил — откидывает назад, −2 с ----------
SEV.couriers={ title:z=>'КУРЬЕРЫ',
  init(z,r){ const g=st4Geo(); z.cr=[]; const xs=z.v?[.42,.74]:[.36,.58,.8]; for(const f of xs){ const x=Math.round(z.len*f), l=Math.floor(r()*3); const ls=z.v?[l,(l+1+Math.floor(r()*2))%3]:[l]; // v1 — двое плечом к плечу (оставляют одну полосу)
      for(const k of ls){ const e=m4Npc('courier',x+(k===ls[0]?0:6),g.lane[k],-1); e.cour=1; e.lane=k; e.wake=0; z.npcs.push(e); z.cr.push(e); } }
    for(const e of z.npcs) if(!e.cour&&z.cr.some(c=>Math.abs(c.x-e.x)<40)) e.x+=60; z.knock=0; z.pass=0; },
  update(z,dt){ const h=G.hero;
    for(const e of z.cr){ if(!e.wake&&e.x-h.x<Math.max(260,W*.7)) e.wake=1; if(!e.wake||e.out){ e.vx=0; continue; } e.vx=-48; e.x+=e.vx*dt; e.anT=(e.anT||0)+dt;
      if(!e.said&&e.x-h.x<110&&e.x>h.x){ e.said=1; bubble(e,pick(['Дорогу! Заказ!','Посторони-и-ись!','Горячее несу!']),1.6,'#ffd23f'); tev('courier_warn'); }
      for(const n of z.npcs){ if(n===e||n.cour||n.scoot||n.ctl) continue; if(Math.abs(n.x-e.x)<12&&Math.abs(n.y-e.y)<7){ n.y=clamp(n.y+(n.y<e.y?-1:1)*40*dt,z.y0,z.y1); n.slowT=.6; } } // расталкивает прохожих
      if(!e.hit&&!h.stun&&Math.abs(e.x-h.x)<12&&Math.abs(e.y-h.y)<7){ e.hit=1; z.knock++; tev('courier_knock'); penalize(2,'courier'); h.stun=.45; h.set('hurt'); h.kbT=.3; TR.nerves=Math.max(0,TR.nerves-3); haptic('error'); pop('БУЛЬДОЗЕР! −2 с',h.x,h.y-50,'#ffb87a',8); bubble(e,'Не стой на пути!',1.4,'#fff'); }
      if(!e.passed&&e.x<h.x-14){ e.passed=1; if(!e.hit){ z.pass++; tev('courier_pass'); } } if(e.x<G.cam-60) e.out=1; }
    if(h.kbT>0){ h.kbT-=dt; h.x=Math.max(8,h.x-110*dt); }
    z.npcs=z.npcs.filter(e=>!e.out); z.cr=z.cr.filter(e=>!e.out); },
  goal(z){ const h=G.hero; return z.cr.some(e=>e.wake&&e.x>h.x&&e.x-h.x<140&&Math.abs(e.y-h.y)<9)?'Курьер прёт! Уступи полосу ↑↓':null; },
  tip:z=>'курьеры с клетчатыми сумками не сворачивают — уступи им полосу',
  bot(z){ const h=G.hero, g=st4Geo(); const near=z.cr.filter(e=>e.wake&&!e.passed&&e.x>h.x-6&&e.x-h.x<130); if(!near.length) return null; const bad=new Set(near.map(e=>e.lane)); const hl=st4Lane(h.y);
    if(!bad.has(hl)&&near.every(e=>Math.abs(e.y-h.y)>=9)) return null; const free=[0,1,2].filter(l=>!bad.has(l)).sort((a,b)=>Math.abs(a-hl)-Math.abs(b-hl))[0]; return {x:h.x+(near[0].x-h.x>50?4:0),y:g.lane[free===undefined?0:free]}; } };
// ---------- M4-3: кофейня — очередь 4–15 с видна заранее (люди у окна), B «В ОЧЕРЕДЬ» → ждёшь (часы идут), −8 мон. (ПТ 5) → ×1.15 на 40 с + концовка «с кофе в руке» ----------
SEV.coffee={ title:z=>'КОФЕЙНЯ',
  init(z,r){ const g=st4Geo(); z.kx=Math.round(z.len*(.4+r()*.06)); z.noSign=[[z.kx-80,z.kx+60]]; const n=2+Math.floor(r()*6); z.qn=n; z.q=[]; z.qT=0; z.inQ=0;
    const T=['polite','aunt','tourist','bag','kid']; for(let i=0;i<n;i++){ const e=mkNpc(qType(6),z.kx-6-i*15,g.lane[0]-2); e.ctl=1; e.face=1; e.q=1; e.noSolid=true; z.npcs.push(e); z.q.push(e); }
    for(const e of z.npcs) if(!e.q&&Math.abs(e.x-z.kx+40)<70) e.x+=e.x<z.kx-40?-80:80; z.per=1.7+r()*.3; z.wait=Math.round(n*z.per+1); },
  tail(z){ return z.kx-6-z.q.filter(e=>!e.leave).length*15; },
  update(z,dt){ const h=G.hero, g=st4Geo(); const live=z.q.filter(e=>!e.leave);
    // очередь движется всегда (бариста работает): первый уходит с кофе, остальные подтягиваются
    z.qT+=dt; if(live.length&&z.qT>=z.per*(z.inQ?1:2.2)){ z.qT=0; const f=live[0]; f.leave=1; f.cup=1; f.ctl=1; f.face=1; f.vx=30; if(!z.inQ&&Math.random()<.6){ const e=mkNpc(qType(6),z.kx-6-live.length*15,g.lane[0]-2); e.ctl=1; e.face=1; e.q=1; e.noSolid=true; e.x=z.kx-6-(live.length)*15; z.npcs.push(e); z.q.push(e); } }
    let i=0; for(const e of z.q){ if(e.leave){ e.x+=30*dt; e.y=Math.min(g.lane[1],e.y+12*dt); e.vx=30; continue; } const tx=z.kx-6-i*15; if(e.x<tx-.5){ e.x=Math.min(tx,e.x+26*dt); e.vx=26; } else e.vx=0; i++; }
    z.q=z.q.filter(e=>!(e.leave&&e.x>z.kx+70)); z.npcs=z.npcs.filter(e=>!e.q||z.q.includes(e));
    if(z.inQ){ const pos=z.q.filter(e=>!e.leave).length; const tx=z.kx-6-pos*15; h.vx=0; h.vy=0; h.x+=(tx-h.x)*Math.min(1,dt*6); h.y=g.lane[0]-2; h.face=1; const s=stickVec();
      if(Math.hypot(s.x,s.y)>.6&&z.qT>.2&&pos>0){ z.inQ=0; h.pin=false; tev('coffee_leave'); say('Без кофе. Бегом!',1.4,'#ffd98a'); }
      else if(pos===0){ z.inQ=0; h.pin=false; const w=wallet(), pr=m4Price(); w.coins-=pr; TR.coffeeT=M4.BUFF_T; TR.coffee=1; z.got=1; tev('coffee_buy'); try{ SFX.coin&&SFX.coin(); }catch(e){} pop('КОФЕ −'+pr+' мон. · ×1.15',h.x,h.y-52,'#ffd98a',8,1.4); haptic('success'); } }
    if(!z.tipd&&z.kx-h.x<W*.6&&h.x<z.kx){ z.tipd=1; say('Кофейня: очередь ≈'+this.est(z)+' с · бодрость ×1.15',1.8,'#ffd98a'); } },
  est(z){ return Math.round(z.q.filter(e=>!e.leave).length*z.per+1); },
  ctx(z){ const h=G.hero; if(z.inQ||z.got) return null; const tl=this.tail(z); if(h.x>tl-26&&h.x<z.kx+8&&h.y<z.y0+14){ const w=wallet(), pr=m4Price(); if(w.coins<pr) return null; return {b:{label:'В ОЧЕРЕДЬ',col:'#8a5a3a',fn:()=>{ z.inQ=1; z.qT=Math.min(z.qT,.0); h.pin=true; tev('coffee_join'); }}}; } return null; },
  goal(z){ const h=G.hero; if(z.inQ) return 'Ждёшь кофе… ещё ≈'+this.est(z)+' с (джойстик — уйти)'; if(!z.got&&Math.abs(h.x-z.kx)<W*.5) return 'Кофе: очередь ≈'+this.est(z)+' с → ×1.15 на 40 с'; return null; },
  tip:z=>'по людям у окна видно очередь; кофе = быстрее 40 с, но часы идут',
  draw(z,layer){ const g=st4Geo(), x=Math.round(z.kx-G.cam), y=g.facadeB; if(layer==='back'){ if(x<-90||x>W+40) return; m4Kiosk(x,y,z); }
    if(layer==='front'){ for(const e of z.q) if(e.cup&&e.leave) m4Cup(e.x-G.cam+5,e.y-28); if(TR.coffee&&G.hero&&!G.hero.hide) m4Cup(G.hero.x-G.cam+(G.hero.face>0?5:-11),G.hero.y-G.hero.z-28); }
    if(layer==='ui'&&!z.got&&x>-60&&x<W+60&&!z.inQ){ const n=z.q.filter(e=>!e.leave).length; G.labels.push(['очередь '+n+' чел. ≈'+this.est(z)+' с',clamp(x-14,SA.l+60,W-SA.r-70),y-64,7,'#ffd98a','center',P.ink]); } },
  bot(z){ const h=G.hero, w=wallet(); if(z.inQ) return {x:h.x,y:h.y}; if(z.got||h.x>z.kx+10) return null; const want=(z.seed%3!==0)&&z.q.filter(e=>!e.leave).length<=4&&w.coins>=m4Price(); if(!want) return null; const tl=this.tail(z);
    if(h.x>tl-20&&h.y<z.y0+12) return {x:h.x,y:h.y,b:1}; return {x:tl-10,y:z.y0+4}; } };
// киоск-кофейня на фасаде (64×54): навес в полоску, вывеска «КОФЕ» с чашкой, окно выдачи с баристой, прилавок, меню-доска
function m4Kiosk(x,y,z){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); };
  f(P.ink,-35,-55,70,55); f('#5a3424',-34,-54,68,54); f('#6e4230',-34,-54,68,3); for(let i=-34;i<34;i+=4) f('#4a2a1c',i,-50,1,46);
  f(P.ink,-38,-42,76,10); for(let i=0;i<19;i++) f(i%2?'#f4ead8':'#2f8a6a',-37+i*4,-41,4,7); f(P.ink,-38,-34,76,1); for(let i=0;i<19;i++) f(i%2?'#d8ccb0':'#226a50',-37+i*4,-34,4,2);
  f(P.ink,-22,-54,44,11); f('#2a1810',-21,-53,42,9); m4Cup(x-19,y-53); ctx.fillStyle='#ffd98a'; G.labels.push(['КОФЕ',x+3,y-48,7,'#ffd98a','center',null]);
  f(P.ink,-26,-30,40,22); f('#ffd98a',-25,-29,38,20); f('#f0b860',-25,-29,38,3); // окно выдачи, тёплый свет
  f('#e8b890',-10,-24,8,7); f('#2f8a6a',-11,-26,10,3); f(P.ink,-8,-21,1,1); f(P.ink,-5,-21,1,1); f('#2f8a6a',-12,-17,12,8); // бариста: кепка, лицо, фартук
  f('#a87850',-22,-25,6,1); f('#f4ead8',-21,-24,3,4); f('#f4ead8',6,-24,3,4); f('#c84a3a',6,-25,3,1);
  f(P.ink,-28,-9,44,4); f('#8a5a3a',-27,-9,42,3); f('#b07a50',-27,-9,42,1); // прилавок
  f(P.ink,18,-30,14,22); f('#1e2a22',19,-29,12,20); f('#e8e4d8',21,-26,8,1); f('#e8e4d8',21,-22,6,1); f('#e8e4d8',21,-18,7,1); f('#ffd23f',21,-14,4,1); // меню-доска
  f(P.ink,-26,-5,44,5); f('#3a2418',-25,-4,42,4); }
// ---------- M4-11: трамвайный переезд на улице-2 (§P5): пути поперёк тротуара из переулка, звонок «ДЗЫНЬ!» + «!»; на рельсах при проходе — −4 с ----------
const M4TR={W:40,PASS:1.7};
function m4TramInit(z,r){ z.tr={x:Math.round(z.len*(.66+r()*.08)),t:2.5+r()*2,st:'idle',y:0,n:0}; const w=56; z.gaps=(z.gaps||[]).concat([[z.tr.x-w/2,z.tr.x+w/2]]); z.noSign=(z.noSign||[]).concat([[z.tr.x-90,z.tr.x+90]]);
  for(const e of z.npcs) if(!e.ctl&&Math.abs(e.x-z.tr.x)<30) e.x+=50; }
function m4TramTick(z,dt){ const T=z.tr, h=G.hero, g=st4Geo(); if(!T) return; const near=Math.abs(h.x-T.x)<W*.75;
  if(T.st==='idle'){ T.t-=dt; if(T.t<=0&&near){ T.st='warn'; T.wt=1.4; m4Bell(); setTimeout(m4Bell,350); tev('tram_warn'); } }
  else if(T.st==='warn'){ T.wt-=dt; if(T.wt<=0){ T.st='go'; T.y=g.facadeB-40; } }
  else if(T.st==='go'){ T.y+=(H+70-(g.facadeB-40))/M4TR.PASS*dt; const on=Math.abs(h.x-T.x)<M4TR.W/2+4;
    if(on&&!T.hit&&!h.stun&&T.y>=h.y-3&&T.y<h.y+10){ T.hit=1; tev('tram_hit'); penalize(4,'tram'); h.stun=.6; h.set('hurt'); h.x=T.x+(h.x<T.x?-1:1)*(M4TR.W/2+10); TR.nerves=Math.max(0,TR.nerves-5); haptic('error'); pop('ДЗЫНЬ!!! −4 с',h.x,h.y-52,'#ff6a5a',9); say('Не стой на рельсах, когда звенит трамвай!',2,'#ffb87a'); }
    if(T.y>H+50){ T.st='idle'; T.n++; if(!T.hit) tev('tram_clear'); T.hit=0; T.t=6+Math.random()*4; z.trEx=null; } }
  if(T.st!=='idle'){ const B=M4TR.W/2+8; for(const e of z.npcs){ if(e.ctl||e.scoot||e.cour) continue; const d=e.x-T.x; if(Math.abs(d)<B){ const s=d<0?-1:1, px=e.x-e.dir*e.spd2*dt; if(Math.abs(px-T.x)>=B-.5) e.x=px; else e.x+=s*46*dt; e.slowT=.3; } } } // прохожие не стоят на путях
  if(T.st!=='idle') for(const q of z.cars||[]){ if(q.spl) continue; const front=q.dir>0?q.x+q.w:q.x, d=(T.x-q.dir*(M4TR.W/2+8))-front; if(d*q.dir>-2&&d*q.dir<70){ q.x-=q.dir*q.v*dt; q.brake=1; } else q.brake=0; }
  if(T.st==='go'){ z.extra=z.extra||[]; if(!z.trEx){ z.trEx={x:T.x,y:0,z:0,drawFn:m4TramFront,tram:1,noSolid:true}; z.extra.push(z.trEx); } z.trEx.y=Math.round(T.y); } else if(z.extra) z.extra=z.extra.filter(e=>!e.tram); }
// рельсы (2 пути по 2 рельса #9a98a6) поперёк тротуара и дороги, светофор-«Т» у переезда
function m4TramGround(z){ const T=z.tr, g=st4Geo(); if(!T) return; const cx=Math.round(T.x-G.cam); if(cx<-70||cx>W+70) return; st4Alley(z,T.x-28,T.x+28,false);
  for(const dx of [-9,8]){ ctx.fillStyle='#55545e'; ctx.fillRect(cx+dx-1,g.facadeB-40,4,H); ctx.fillStyle='#9a98a6'; ctx.fillRect(cx+dx,g.facadeB-40,2,H); ctx.fillStyle='#c8c6d0'; ctx.fillRect(cx+dx,g.facadeB-40,1,H); }
  ctx.fillStyle='#2a2933'; ctx.fillRect(cx,g.facadeB-110,1,70); // контактный провод над путём (в глубину)
  const px=cx-34, py=g.facadeB-2, on=T.st!=='idle', bl=on&&Math.floor(G.t*6)%2===0; ctx.fillStyle=P.ink; ctx.fillRect(px-1,py-44,3,44); ctx.fillStyle='#5a5a68'; ctx.fillRect(px,py-43,1,43);
  ctx.fillStyle=P.ink; ctx.fillRect(px-5,py-56,11,13); ctx.fillStyle='#1a1a24'; ctx.fillRect(px-4,py-55,9,11); ctx.fillStyle=bl?'#ff4a3a':'#4a2020'; ctx.fillRect(px-2,py-53,5,3); ctx.fillStyle=on?'#4a3a20':'#fff6c0'; ctx.fillRect(px-3,py-48,7,1); ctx.fillRect(px,py-48,1,3); }
// трамвай анфас (36×46): бело-синий низкопольный, пантограф-ромб к проводу, табло маршрута, лобовое стекло с бликом, фары
const M4_12=['.XX...XXXX.','XXX......XX','.XX.....XX.','.XX....XX..','.XX...XX...','XXXX..XXXXX'];
function m4TramFront(a){ const x=Math.round(a.x-G.cam-20), y=Math.round(a.y-56), f=(c,p,q,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+p,y+q,w,h); }; if(window.__silh) return;
  f('rgba(10,6,20,.35)',-1,54,42,4); ctx.fillStyle=P.ink; for(let i=0;i<6;i++){ ctx.fillRect(x+20-i*2,y-12+i,1,1); ctx.fillRect(x+20+i*2,y-12+i,1,1); ctx.fillRect(x+10+i*2,y-1-i,1,1); ctx.fillRect(x+30-i*2,y-1-i,1,1); } f(P.ink,19,-16,2,4); f(P.ink,12,-2,17,2); // пантограф-ромб к проводу
  f(P.ink,0,0,40,56); f('#e8ecf4',1,1,38,54); f('#ffffff',2,1,36,1); f('#c8ccd8',1,2,38,2); f(P.ink,7,3,26,10); f('#1a1a24',8,4,24,8); ctx.fillStyle='#ffa83a'; M4_12.forEach((r,q)=>{ for(let p=0;p<r.length;p++) if(r[p]==='X') ctx.fillRect(x+15+p,y+5+q,1,1); }); // табло «12» + маршрут
  f(P.ink,3,13,34,21); f('#2a3346',4,14,32,19); f('#3a4258',4,30,32,3); f('#8fb0d0',6,15,4,9); f('#5a6a8a',11,15,2,4); f('#8fb0d0',27,27,6,1); f('#1e2433',19,14,2,19); f('#d8b890',13,24,5,4); f('#2a3a60',12,28,7,2); // стекло, блик, стойка, водитель
  f('#2f5ec8',1,36,38,5); f('#5a86e8',1,36,38,1); f('#1e3f90',1,41,38,1); f(P.ink,4,43,8,5); f('#fff6c0',5,44,6,3); f('#ffffff',6,44,2,1); f(P.ink,28,43,8,5); f('#fff6c0',29,44,6,3); f('#ffffff',30,44,2,1); f('#d8dce6',14,44,12,3); f('#a8acb8',14,46,12,1);
  f(P.ink,1,49,38,1); f('#3a3a48',2,50,36,5); f('#5a5a68',2,50,36,1); f('#ffd23f',3,52,4,2); f('#ffd23f',33,52,4,2); }
// транспорт/прокатные самокаты M2 не ставим на ключевые места M4 (киоск, курилка, переезд)
function m4Purge(z){ const K=[]; if((z.ev==='coffee'||z.ev==='colleague')&&z.kx) K.push(z.kx); if(z.tr) K.push(z.tr.x); if(!K.length) return; const near=(x,d)=>K.some(k=>Math.abs(x-k)<d);
  if(z.bus&&near(z.bus.stop,W*.6)) z.bus=null; if(z.taxi&&near(z.taxi.x,W*.5)) z.taxi=null; if(z.scoots){ const rm=z.scoots.filter(q=>near(q.x,90)); z.scoots=z.scoots.filter(q=>!rm.includes(q)); z.solids=(z.solids||[]).filter(q=>!rm.some(o=>q[0]===o.x-6&&q[2]===o.x+8)); } }
{ const ZS=ZONES.street, _i=ZS.init, _u=ZS.update, _d=ZS.draw, _b=ZS.bot;
  ZS.init=function(z){ z.tr=null; const r=mulberry32(((z.seed>>>0)^0x7a11)>>>0); const want=z.tram!==undefined?z.tram:(z.seg==='street2'&&z.ev!=='light'&&!z.last&&r()<.5); _i.call(this,z); if(want&&z.ev!=='light'){ m4TramInit(z,r); ST4.cache.clear(); } m4Purge(z); };
  ZS.update=function(z,dt){ _u.call(this,z,dt); if(z.tr&&!TR.smod) m4TramTick(z,dt); };
  ZS.draw=function(z){ if(!z.tr) return _d.call(this,z); const E=SEV[z.ev], d0=E&&E.draw; const self=this; const ev=z.ev; SEV.__tramwrap={draw(zz,layer){ if(layer==='ground') m4TramGround(zz); if(d0) d0.call(E,zz,layer); if(layer==='ui'&&zz.tr.st==='warn') m4Warn(1,zz.y0-14,'ДЗЫНЬ! ТРАМВАЙ'); }, title:E&&E.title, tip:E&&E.tip, goal:E&&E.goal};
    z.ev='__tramwrap'; try{ _d.call(this,z); } finally{ z.ev=ev; } };
  ZS.bot=function(z){ const T=z.tr, h=G.hero; if(T&&T.st!=='idle'){ const on=Math.abs(h.x-T.x)<M4TR.W/2+12; if(on||(h.x<T.x&&T.x-h.x<M4TR.W/2+30)) return {x:T.x-M4TR.W/2-22,y:h.y}; } return _b.call(this,z); }; }
{ const _gt=goalText; goalText=function(z){ if(z&&z.tr&&z.tr.st==='warn') return 'Трамвай! Не стой на рельсах'; return _gt(z); }; }
// ================= БЦ «ДАВКА-ПЛАЗА»: коллега у курилки (M4-7), турникет + охранник (M4-4), лифт (M4-5), лестница на 14 (M4-6) =================
SEG_IMPL.bc=true;
const M4P={marble:'#e6e0d4',marbleSh:'#cfc8b8',seam:'#bdb6a6',floor:'#c9c3b6',floorSh:'#b3ad9f',floorHi:'#dcd6ca',steel:'#8a92a2',steelHi:'#c4cad6',steelSh:'#5a6272',wood:'#8a5a3a',woodHi:'#b07a50',glass:'#9fd0ec',led:'#ff6a3a'};
function bcZones(seg,day,idx,post){ const r=routeRng(day,idx,0xbc), ev=k=>seg.events.find(e=>e.k===k), base={seg:'bc',d:idx,seed:((day.seed>>>0)^0xbcbc^Math.imul(idx+5,2654435761))>>>0}; const out=[];
  const col=ev('colleague'); if(col){ if(post&&post.length) post[post.length-1].last=false; out.push(Object.assign({},base,{k:'street',seg:'street2',ev:'colleague',v:col.v,weather:post&&post[0]?post[0].weather:'clear',last:true,bcFront:1})); }
  let st=ev('stairs14'); const lf=ev('lift'); out.push(Object.assign({},base,{k:'bcgate',fails:1+Math.floor(r()*3),guard:r()<.5,qa:Math.floor(r()*4),flip:r()<.5,last:!st&&!lf}));
  if(st&&lf&&r()<.6) st=null;
  if(st) out.push(Object.assign({},base,{k:'bcstairs',v:st.v,floors:14,last:true})); else if(lf) out.push(Object.assign({},base,{k:'bclift',v:lf.v,last:true}));
  return out; }
{ const _st=startTrip; startTrip=function(...a){ const r=_st(...a); if(G.hero) G.hero.hide=false; return r; }; __trip.startTrip=startTrip; }
// общий интерьер лобби: мраморная стена со швами, потолок с даунлайтами, плинтус, пол-плитка
function m4Lobby(z,sign){ const c=G.cam, RB=Math.max(SA.t+30,FY0-110);
  ctx.fillStyle='#4a4e5c'; ctx.fillRect(0,0,W,RB); ctx.fillStyle='#3e4250'; for(let y=5;y<RB-3;y+=8) ctx.fillRect(0,y,W,1);
  for(let x=-(Math.round(c)%80);x<W+80;x+=80){ ctx.fillStyle=P.ink; ctx.fillRect(x+30,RB-5,22,4); ctx.fillStyle='#fffaf0'; ctx.fillRect(x+31,RB-4,20,2); ctx.fillStyle='rgba(255,244,214,.12)'; ctx.fillRect(x+22,RB,38,30); }
  ctx.fillStyle=P.ink; ctx.fillRect(0,RB,W,2); ctx.fillStyle=M4P.marble; ctx.fillRect(0,RB+2,W,FY0-RB-2); ctx.fillStyle=M4P.marbleSh; ctx.fillRect(0,RB+2,W,3);
  for(let x=-(Math.round(c)%48);x<W+48;x+=48){ ctx.fillStyle=M4P.seam; ctx.fillRect(x,RB+5,1,FY0-RB-8); ctx.fillStyle='rgba(160,150,130,.25)'; ctx.fillRect(x+12,RB+20,9,1); ctx.fillRect(x+16,RB+21,7,1); ctx.fillRect(x+30,RB+48,6,1); }
  ctx.fillStyle='#3a3a48'; ctx.fillRect(0,FY0-6,W,6); ctx.fillStyle='#5a5a68'; ctx.fillRect(0,FY0-6,W,1);
  ctx.fillStyle=M4P.floor; ctx.fillRect(0,FY0,W,H-FY0); ctx.fillStyle=M4P.floorSh; for(let x=-(Math.round(c)%32);x<W;x+=32) ctx.fillRect(x,FY0,1,H-FY0); for(let y=FY0+10;y<H;y+=14) ctx.fillRect(0,y,W,1); ctx.fillStyle=M4P.floorHi; for(let x=-(Math.round(c)%32)+6;x<W;x+=64) ctx.fillRect(x,FY0+3,8,1);
  ctx.fillStyle='rgba(10,6,20,.18)'; ctx.fillRect(0,FY0,W,3); if(sign){ const sw=Math.min(180,txtW(sign,8)+24); wallSign(Math.round(W/2-sw/2),Math.max(SA.t+50,RB+8),sw,14,sign,'#1e2a44','#ffe9a8',8); } return RB; }
// спидгейт БЦ: тумба из нержавейки (8×24) со считывателем; стеклянные створки между тумбами (по глубине — сверху вниз)
function m4Gate(x,y,st){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f('rgba(10,6,20,.28)',-6,-1,14,3); f(P.ink,-5,-25,10,25); f(M4P.steel,-4,-24,8,24); f(M4P.steelHi,-4,-24,2,24); f(M4P.steelSh,2,-24,2,24); f(P.ink,-5,-27,10,3); f('#2a2e3a',-4,-26,8,1);
  if(st){ f(P.ink,-4,-21,8,5); f(st.ok?'#3ad06a':st.bad?'#e8354a':'#3a5a8a',-3,-20,6,3); f('rgba(255,255,255,.35)',-3,-20,6,1); } }
function m4Flap(x,y0,y1,op){ const t=y0+3, b=y1-3; if(op){ ctx.fillStyle='rgba(159,208,236,.55)'; ctx.fillRect(x+4,t-14,5,4); ctx.fillRect(x+4,b-14,5,4); return; } ctx.fillStyle='rgba(159,208,236,.45)'; for(let y=t;y<b;y++){ ctx.fillRect(x-1,y-16,3,10); } ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(x,t-15,1,b-t); }
function m4Plant(x,y){ x=Math.round(x); y=Math.round(y); const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f('rgba(10,6,20,.28)',-8,-1,16,3); f(P.ink,-6,-12,12,12); f('#c8c2b0',-5,-11,10,10); f('#a39d8c',-5,-4,10,3);
  for(const [a,b,w,h,c] of [[-7,-30,6,10,'#2f7a3a'],[1,-34,7,12,'#3a8a44'],[-3,-40,6,12,'#2f7a3a'],[-9,-22,7,8,'#3a8a44'],[3,-24,7,9,'#2a6a32']]){ f(P.ink,a-1,b-1,w+2,h+2); f(c,a,b,w,h); f('#5aaa5a',a+1,b+1,2,1); } f('#5a3a24',-1,-14,2,4); }
// ---------- M4-4: турникет БЦ — пропуск не срабатывает 1–3 раза, затем (50%) охранник «Вы к кому?»: 2 ответа (неверный −10 с и звонок «на ресепшн») ----------
const M4QA=[['«Я в ДАВКА-СОФТ, 14 этаж, вот пропуск»','«Я… к Иванову. Или к Петрову»'],['«Работаю тут, пропуск глючит»','«Я курьер! Ой, то есть нет»'],['«В бухгалтерию, 14-й, я свой»','«Мне только спросить»'],['«Отдел аналитики, вот бейдж»','«Я на собеседование… в прошлом году»']];
ZONES.bcgate={ title:z=>'БЦ «ДАВКА-ПЛАЗА» · ТУРНИКЕТЫ',
  tip:z=>'к турникету и «ПРИЛОЖИТЬ»; не пикает — приложи ещё; охраннику отвечай честно',
  init(z){ z.len=Math.max(W,460); z.tx=Math.round(Math.min(z.len*.48,W*.5)); const y0=z.y0,y1=z.y1; z.lanes=[y0+7,Math.round((y0+y1)/2),y1-6]; z.tries=0; z.passed=0; z.tf=[0,0,0]; z.red=[0,0,0]; z.cd=0; z.endX=Math.round(Math.min(z.len-26,z.tx+150)); G.hero.hide=false;
    const n=5; for(let i=0;i<n;i++){ const e=mkNpc(qType(6),rnd(30,z.len-30),pick(z.lanes.slice(0,2))+rnd(-2,2)); e.dir=1; e.spd2=rnd(24,32); e.lane=i%2===0?0:1; e.free=1; z.npcs.push(e); }
    const g=mkNpc(qType(6),z.tx+78,z.y0+1); g.atl='guard'; g.ctl=1; g.pin=true; g.face=-1; g.ghost=true; g.noSolid=true; g.guard=1; z.npcs.push(g); z.gd=g; z.solids.push([z.tx+60,z.y0-4,z.tx+104,z.y0+5]);
    const h=G.hero; h.x=36; h.y=z.lanes[1]; },
  near(z){ const h=G.hero; if(z.passed) return null; const dx=z.tx-10-h.x; if(dx<-2||dx>18) return null; let li=0; for(let i=1;i<3;i++) if(Math.abs(z.lanes[i]-h.y)<Math.abs(z.lanes[li]-h.y)) li=i; return Math.abs(z.lanes[li]-h.y)<10?li:null; },
  tap(z,li){ const h=G.hero; z.li=li; z.cd=.45; z.tries++; tev('bc_tap');
    if(z.tries<=z.fails){ z.red[li]=.5; try{ tone(220,.18,'square',.12); }catch(e){} pop(pick(['ПИП ✗','НЕ ЧИТАЕТ','ЕЩЁ РАЗ']),z.tx,z.lanes[li]-36,'#ff6a5a',7); tev('bc_fail');
      if(z.tries===z.fails&&z.guard){ z.cd=1e9; z.gd.walkTo=1; setTimeout(()=>{},0); } return; }
    this.open(z,li); },
  open(z,li){ const h=G.hero; z.passed=1; z.tf[li]=.7; z.passT=.55; z.goY=z.lanes[li]; z.lockHero=true; SFX.coin(); pop('ПИК ✓',z.tx,z.lanes[li]-36,P.neonLime,8); tev('bc_pass'); },
  ask(z){ const q=M4QA[(z.qa|0)%M4QA.length], good=[q[0],'#3a6ad8',()=>{ tev('bc_guard_ok'); bubble(z.gd,'Проходите.',1.4,'#fff'); z.gd.walkTo=2; this.open(z,z.li||1); }], bad=[q[1],'#3a6ad8',()=>{ tev('bc_guard_bad'); const s=penalize(10,'guard'); pop('−'+s+' с',G.hero.x,G.hero.y-50,P.red,9); bubble(z.gd,'Алло, ресепшн? Тут к кому-то…',2.2,'#ffd23f'); z.call=2.2; z.gd.walkTo=2; }];
    z.goodIdx=z.flip?1:0; st4Modal({id:'guard',title:'ОХРАНА',spr:'guard_angry',text:'«Молодой человек! Вы к кому?»',opts:z.flip?[bad,good]:[good,bad]}); },
  update(z,dt){ const h=G.hero, gd=z.gd; for(let i=0;i<3;i++){ z.tf[i]=Math.max(0,z.tf[i]-dt); z.red[i]=Math.max(0,z.red[i]-dt); } z.cd-=dt;
    // поток сотрудников: проходят рамки 0 и 2 с зелёным
    for(const e of z.npcs){ if(e.ctl) continue; const ly=z.lanes[e.lane]; e.y+=(ly-e.y)*Math.min(1,dt*2); const at=Math.abs(e.x-(z.tx-6))<3; if(at&&!e.paidG){ e.waitG=(e.waitG||0)+dt; if(e.waitG<.45){ e.set('idle'); continue; } e.paidG=1; z.tf[e.lane]=.5; } if(e.x>z.tx+8) e.paidG=0; e.x+=e.spd2*dt; e.face=1; e.set('walk'); if(e.x>z.len+20){ e.x=-rnd(20,90); e.waitG=0; e.paidG=0; } }
    // охранник: выходит из-за стойки к герою, спрашивает; потом возвращается
    if(gd.walkTo===1){ const tx=z.tx+14, ty=clamp(h.y,z.y0+2,z.y1-2); gd.x+=(tx-gd.x)*Math.min(1,dt*3); gd.y+=(ty-gd.y)*Math.min(1,dt*3); gd.vx=(tx-gd.x)*3; gd.face=-1; if(Math.abs(gd.x-tx)<2&&!z.asked&&!TR.smod){ z.asked=1; gd.vx=0; this.ask(z); } }
    else if(gd.walkTo===2){ const tx=z.tx+78, ty=z.y0+1; gd.x+=(tx-gd.x)*Math.min(1,dt*2); gd.y+=(ty-gd.y)*Math.min(1,dt*2); gd.vx=(tx-gd.x)*2; gd.face=-1; if(Math.abs(gd.x-tx)<1.5){ gd.walkTo=0; gd.vx=0; } }
    if(z.call>0){ z.call-=dt; h.set('idle'); if(z.call<=0){ pop('РЕСЕПШН: «ПУСТИТЕ»',z.tx,z.lanes[1]-50,'#ffd23f',7,1.2); this.open(z,z.li||1); } }
    if(z.passT>0){ z.passT-=dt; h.y+=(z.goY-h.y)*Math.min(1,dt*10); h.x+=(z.tx+14-h.x)*Math.min(1,dt*6); h.set('walk'); if(z.passT<=0){ z.lockHero=false; h.x=Math.max(h.x,z.tx+12); } }
    else if(!z.passed) h.x=Math.min(h.x,z.tx-10);
    if(z.passed&&!(z.passT>0)&&h.x>z.endX) zoneDone();
    z.hint=z.passed?(z.last?'к лифтам →':'дальше →'):z.tries&&z.tries<=z.fails?'не пикнуло — ещё раз «ПРИЛОЖИТЬ»':'к турникету'; },
  ctx(z){ if(z.passed||z.cd>0||z.call>0||TR.smod) return {}; const li=this.near(z); if(li==null) return {}; return {b:{label:'ПРИЛОЖИТЬ',col:'#2aa860',fn:()=>this.tap(z,li)}}; },
  prog(z){ return (z.passed?400:0)+z.tries*20+G.hero.x; },
  unstick(z){ if(!z.passed){ z.li=1; this.open(z,1); } else G.hero.x=Math.max(G.hero.x,z.tx+16); },
  bot(z){ const h=G.hero; if(TR.smod&&TR.smod.id==='guard') return z.goodIdx?{b:1}:{a:1}; const r={x:z.tx-10,y:z.lanes[1]}; if(!z.passed){ if(z.ctxB&&z.ctxB.label==='ПРИЛОЖИТЬ') r.b=1; return r; } return {x:z.endX+30,y:z.lanes[1]}; },
  draw(z){ const c=G.cam; m4Lobby(z,'ДАВКА-ПЛАЗА · ЛИФТЫ →');
    { const dx0=Math.round(22-c), f=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(dx0+a,FY0+b,w,h); }; f(P.ink,4,-70,52,64); f('#bfe0ff',5,-69,24,63); f('#bfe0ff',31,-69,24,63); f('#e8f6ff',8,-66,3,40); f('#e8f6ff',34,-66,3,40); f(P.ink,29,-69,2,63); f('#5a6272',24,-40,3,8); f('#5a6272',33,-40,3,8); G.labels.push(['ВХОД',dx0+30,FY0-76,6,'#5a5a68','center',null]);
      const wx=Math.round(z.tx+40-c); if(wx>-140&&wx<W+20){ const g=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(wx+a,FY0+b,w,h); }; g(P.ink,0,-74,104,68); g(M4P.wood,1,-73,102,66); for(let i=8;i<104;i+=12) g('#74482c',i,-73,1,66); g(M4P.woodHi,1,-73,102,1); g(P.ink,30,-62,44,20); g('#2a2440',31,-61,42,18); G.labels.push(['ДП',wx+52,FY0-52,10,'#ffd98a','center',null]); }
      const cx=Math.round(z.tx-120-c); if(cx>-20&&cx<W+20){ const k=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(cx+a,FY0+b,w,h); }; k(P.ink,-8,-86,17,17); k('#fff8e8',-7,-85,15,15); k(P.ink,0,-83,1,7); k(P.ink,0,-78,5,1); k('#d8265e',0,-78,1,1); } }
    { const px=Math.round(112-c); m4Plant(px,FY0-2); const p2=Math.round(z.len-50-c); if(p2<W+20&&!hudRects(4).some(r=>p2+12>r.x&&p2-12<r.x+r.w&&r.y<FY0)) m4Plant(p2,FY0-2); }
    const tx=Math.round(z.tx-c), props=[]; ctx.fillStyle='#d8c040'; ctx.fillRect(tx-14,FY0+1,1,H-FY0-1);
    const bnd=[z.lanes[0]-8,(z.lanes[0]+z.lanes[1])/2,(z.lanes[1]+z.lanes[2])/2,z.lanes[2]+7].map(Math.round);
    for(let i=0;i<4;i++){ const y=bnd[i]; props.push(m3Prop(z.tx,y,()=>m4Gate(tx,y,i<3?{ok:z.tf[i]>0,bad:z.red[i]>0}:null))); }
    for(let i=0;i<3;i++){ const y0=bnd[i], y1=bnd[i+1], op=z.tf[i]>0; props.push(m3Prop(z.tx,y1-1,()=>m4Flap(tx,y0,y1,op))); }
    // стойка ресепшн/охраны (дерево + мраморная столешница), монитор
    const dx=Math.round(z.tx+60-c), dy=z.y0+5; props.push(m3Prop(z.tx+82,dy,()=>{ const f=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(dx+a,dy+b,w,h); }; f('rgba(10,6,20,.25)',-2,0,48,3); f(P.ink,0,-20,44,20); f(M4P.wood,1,-19,42,19); f(M4P.woodHi,1,-19,42,1); for(let i=6;i<44;i+=9) f('#74482c',i,-16,1,14); f(P.ink,-1,-23,46,4); f(M4P.marble,0,-22,44,2); f(P.ink,26,-31,12,9); f('#2a3a5a',27,-30,10,6); f('#8fd8ff',28,-29,3,1); G.labels.push(['ОХРАНА',dx+22,dy-10,6,'#ffe9a8','center',P.ink]); }));
    floorAO(); drawTripActors([G.hero,...z.npcs,...props]);
    if(!z.passed) goalArrow(z.tx-10,FY0-30,P.neonLime); else goalArrow(z.endX,FY0-30); } };
// ---------- M4-7: коллега у курилки (улица перед БЦ) — ловит на разговор, «Я ОПАЗДЫВАЮ» срабатывает со 2-го раза; обход по дальней полосе (припаркованные самокаты) ----------
SEV.colleague={ title:z=>'ПЕРЕД БЦ · КУРИЛКА',
  init(z,r){ const g=st4Geo(); z.kx=Math.round(z.len*(.5+r()*.06)); z.noSign=[[z.kx-70,z.kx+70]]; const c=m4Npc('colleague',z.kx,g.lane[0]+1,-1); c.coll=1; z.npcs.push(c); z.col=c; const s=m4Npc('smoker',z.kx+16,g.lane[0]-1,-1); z.npcs.push(s); z.smk=s;
    z.caught=0; z.lateN=0; z.free=0; z.parked=[]; for(let i=0;i<3;i++){ const x=z.kx-60+i*48+Math.round(r()*10); z.parked.push(x); z.solids.push([x-6,z.y1-6,x+6,z.y1+1]); }
    for(const e of z.npcs) if(!e.ctl&&Math.abs(e.x-z.kx)<70) e.x+=e.x<z.kx?-80:80; },
  update(z,dt){ const h=G.hero, c=z.col; c.anT=(c.anT||0)+dt;
    if(!z.caught&&!z.free&&Math.abs(h.x-c.x)<30&&Math.abs(h.y-c.y)<15&&!TR.smod){ z.caught=1; tev('coll_caught'); c.face=h.x<c.x?-1:1; this.talk(z,0); }
    if(!z.free&&h.x>c.x+40){ z.free=1; if(!z.caught) tev('coll_avoid'); }
    if(!z.tipd&&c.x-h.x<W*.55&&h.x<c.x){ z.tipd=1; bubble(c,'О! Привет!',1.4,'#fff'); } },
  talk(z,n){ const T=['«О, привет! Ты видел вчерашнее?»','«Да погоди ты, минутку! Короче, там…»','«…и вот он говорит…»']; const late=['Я ОПАЗДЫВАЮ','#d8265e',()=>{ z.lateN++; tev('coll_late'); if(z.lateN<2){ penalize(2,'coll'); this.talk(z,1); } else { z.free=1; bubble(z.col,'Ну беги, беги…',1.4,'#fff'); tev('coll_free'); } }], chat=['ДА, СЛУШАЙ…','#3a6ad8',()=>{ tev('coll_chat'); const s=penalize(8,'coll'); TR.nerves=Math.min(100,(TR.nerves||0)+6); pop('−'+s+' с · ПОБОЛТАЛИ',G.hero.x,G.hero.y-50,'#9ad0ff',8,1.2); z.free=1; bubble(z.col,'Ладно, до обеда!',1.4,'#fff'); }];
    st4Modal({id:'coll',title:'КОЛЛЕГА',spr:'colleague_idle_0',text:T[Math.min(n,2)],clock:1,auto:6,onAuto:()=>{ z.free=1; tev('coll_auto'); bubble(z.col,'Ой, ты спешишь? Ну беги!',1.4,'#fff'); },opts:[late,chat]}); },
  goal(z){ const h=G.hero; return !z.free&&Math.abs(h.x-z.kx)<W*.5?'Коллега у курилки — обойди по дальней стороне ↓':null; },
  tip:z=>'коллега заговорит, если пройти рядом; «Я ОПАЗДЫВАЮ» сработает со второго раза',
  draw(z,layer){ const c=G.cam; if(layer==='back'){ const x=Math.round(z.kx+34-c), y=z.y0-1; if(x>-40&&x<W+40){ const f=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(x+a,y+b,w,h); }; f('rgba(10,6,20,.25)',-6,-1,12,3); f(P.ink,-5,-16,10,16); f('#5a5a68',-4,-15,8,15); f('#8a8a9a',-4,-15,8,2); f('#2a2a33',-3,-13,6,1); f('rgba(220,220,230,.5)',-1,-22+Math.round(Math.sin(G.t*2)*1),2,4); f(P.ink,14,-30,34,12); f('#2a6a4a',15,-29,32,10); G.labels.push(['КУРИЛКА',x+31,y-24,6,'#ffe9a8','center',null]); f(P.ink,20,-18,2,18); f('#5a5a68',21,-18,1,18); }
      for(const px of z.parked){ const sx=Math.round(px-c); if(sx<-20||sx>W+20) continue; ctx.fillStyle='rgba(10,6,20,.25)'; ctx.fillRect(sx-7,z.y1,14,2); atlDraw(ctx,'tr','scooter_share_0',sx-8,z.y1-16); } } },
  bot(z){ const h=G.hero; if(TR.smod&&TR.smod.id==='coll') return {a:1}; if(z.free||h.x>z.kx+40) return null; if(h.x<z.kx-90) return null; return {x:h.x+10,y:z.y1-15}; } }; /* M6: y1−8 упиралось в припаркованные самокаты (солиды y1−6…y1+1) → бот стоял 18 с (wd_street) */
// ---------- M4-5: лифт — 3 кабины, приезжает одна (стрелка + «ДИНЬ»), есть места — ВОЙТИ; полна — ВТИСНУТЬСЯ (центр-метр N%); перегруз пищит → кто-то выходит; v1 — экспресс с 7-го ----------
ZONES.bclift={ title:z=>'ЛИФТОВОЙ ХОЛЛ'+(z.v?' · ЭКСПРЕСС':''),
  tip:z=>'жди у горящей стрелки; полный — жми «ВТИСНУТЬСЯ» часто',
  init(z){ z.len=W; z.dx=[Math.round(W*.3),Math.round(W*.5),Math.round(W*.7)]; z.ph='wait'; z.t1=1.2+Math.random(); z.door=-1; z.open=0; z.sq=0; z.in=0; z.n=0; z.floor=[1+Math.floor(Math.random()*9),12,5]; G.hero.hide=false;
    const h=G.hero; h.x=Math.round(W*.18); h.y=Math.round((z.y0+z.y1)/2); for(let i=0;i<4;i++){ const e=mkNpc(qType(6),rnd(W*.25,W*.75),rnd(z.y0+10,z.y1-2)); e.ctl=1; e.face=Math.random()<.5?1:-1; e.wait=1; z.npcs.push(e); } },
  arrive(z){ z.n++; const last=z.door; let d=Math.floor(Math.random()*3); if(d===last) d=(d+1)%3; if(z.v&&z.n===2) d=G.hero.x<W/2?2:0; z.door=d; z.floor[d]=1; z.ph='open'; z.open=0; z.tOpen=z.v&&z.n===2?3.2:4.2;
    z.exp=!!(z.v&&z.n===2); z.cap=z.exp?2:(z.n===1?0:Math.random()<.5?1:0); z.inside=z.exp?2:5; z.sq=0; z.over=0; try{ tone(1320,.25,'sine',.12); tone(990,.35,'sine',.10,0,.22); }catch(e){} tev('lift_arrive'); if(z.exp) tev('lift_express');
    { let k=0; for(const e of z.npcs) if(e.wait&&k<2&&Math.random()<.6){ e.board=d; k++; } } },
  board(z,how){ const h=G.hero; z.in=1; z.ph='ride'; z.rideT=2.6; z.lockHero=true; h.hide=true; tev('lift_in_'+how); pop(how==='sq'?'ВТИСНУЛСЯ!':'В ЛИФТЕ!',z.dx[z.door],z.y0-50,P.neonLime,8); },
  update(z,dt){ const h=G.hero, d=z.door; G.cam=0; h.x=clamp(h.x,12,W-12);
    if(z.ph==='wait'){ z.t1-=dt; if(z.t1<=0) this.arrive(z); }
    else if(z.ph==='open'){ z.open=Math.min(1,z.open+dt*3); z.tOpen-=dt; z.sq=Math.max(0,z.sq-dt*.18);
      for(const e of z.npcs){ if(e.board===d&&!e.gone){ const tx=z.dx[d]; e.x+=(tx-e.x)*Math.min(1,dt*2.5); e.y+=(z.y0+2-e.y)*Math.min(1,dt*2.5); e.vx=(tx-e.x)*2.5; if(Math.abs(e.x-tx)<3&&Math.abs(e.y-z.y0-2)<3){ e.gone=1; if(z.cap>0) z.cap--; else z.inside++; } } }
      z.npcs=z.npcs.filter(e=>!e.gone);
      if(z.over>0){ z.over-=dt; if(Math.floor(z.over*8)%2===0) try{ tone(1900,.05,'square',.05); }catch(e){} if(z.over<=0){ const e=mkNpc(qType(6),z.dx[d],z.y0+2); e.ctl=1; e.face=1; e.leaveL=1; bubble(e,pick(['Ладно, я пешком…','Поеду следующим','Ну и ладно!']),1.8,'#fff'); z.npcs.push(e); tev('lift_someone_out'); this.board(z,'sq'); } }
      if(z.tOpen<=0&&!z.in&&!(z.over>0)){ z.ph='close'; z.cT=.5; tev('lift_missed'); } }
    else if(z.ph==='close'){ z.open=Math.max(0,z.open-dt*2.5); z.cT-=dt; if(z.cT<=0){ z.ph='wait'; z.t1=2+Math.random()*1.5; z.door=-1; for(let i=0;i<2;i++){ const e=mkNpc(qType(6),Math.random()<.5?-10:W+10,rnd(z.y0+8,z.y1-2)); e.ctl=1; e.wait=1; e.walkIn=rnd(W*.25,W*.75); z.npcs.push(e); } } }
    else if(z.ph==='ride'){ z.open=Math.max(0,z.open-dt*2.5); z.rideT-=dt; z.floor[d]=Math.min(14,Math.round(1+(1-z.rideT/2.6)*13)); if(z.rideT<=0) zoneDone(); }
    for(const e of z.npcs){ if(e.walkIn!==undefined){ const tx=e.walkIn; e.x+=Math.sign(tx-e.x)*30*dt; e.vx=Math.sign(tx-e.x)*30; e.face=e.vx>0?1:-1; if(Math.abs(e.x-tx)<2){ e.walkIn=undefined; e.vx=0; } } if(e.leaveL){ e.x-=34*dt; e.vx=-34; e.face=-1; e.y=Math.min(z.y1-2,e.y+10*dt); } }
    z.npcs=z.npcs.filter(e=>!(e.leaveL&&e.x<-30));
    z.hint=z.ph==='open'?(this.atDoor(z)?(z.cap>0?'ЖМИ «ВОЙТИ»':'ЖМИ «ВТИСНУТЬСЯ» ЧАЩЕ!'):'к лифту! ↑'):z.ph==='ride'?'едем на 14…':'жди лифт'; },
  atDoor(z){ const h=G.hero; return z.door>=0&&Math.abs(h.x-z.dx[z.door])<16&&h.y<z.y0+14; },
  ctx(z){ if(z.ph!=='open'||z.in||!(z.open>.6)||!this.atDoor(z)||z.over>0) return {}; if(z.cap>0) return {b:{label:'ВОЙТИ',col:'#2aa860',fn:()=>{ z.cap--; this.board(z,'free'); }}};
    return {b:{label:'ВТИСНУТЬСЯ',sq:true,col:'#d87a20',fn:()=>{ z.sq+=heroStats().TAP*.9; shake(1); pop(pick(['ЫЫЫ','ХРУСТ','ВДОХ','ПОДВИНЬТЕСЬ']),G.hero.x+(G.hero.x>W*.6?-34:34),G.hero.y-26,'#fff',7); if(z.sq>=1){ z.sq=0; if(Math.random()<.5){ z.over=1.2; tev('lift_overload'); pop('ПИ-И-И! ПЕРЕГРУЗ',z.dx[z.door],z.y0-58,'#ff6a5a',8,1.2); } else { TR.scandal+=6; this.board(z,'sq'); } } }}}; },
  prog(z){ const h=G.hero; return (z.in?1000:0)+z.n*30-(z.door>=0?Math.abs(h.x-z.dx[z.door]):0)+z.sq*50; },
  unstick(z){ if(z.ph==='open'&&!z.in){ G.hero.x=z.dx[z.door]; G.hero.y=z.y0+4; this.board(z,'sq'); } else if(z.ph==='wait') z.t1=0; },
  bot(z){ const h=G.hero; if(z.ph!=='open'||z.in) return {x:W*.5,y:(z.y0+z.y1)/2}; const r={x:z.dx[z.door],y:z.y0+4}; if(z.ctxB) r.b=1; return r; },
  draw(z){ G.cam=0; const c=0; m4Lobby(z,null); { const t='ЛИФТЫ · 1–14 ЭТАЖ'+(z.v?' · ЭКСПРЕСС 7–14':''), sw=Math.min(220,txtW(t,8)+24), sy=Math.round(Math.max(SA.t+58,H*.3))+28; if(sy+14<FY0-80) wallSign(Math.round(W/2-sw/2),sy,sw,14,t,'#1e2a44','#ffe9a8',8); }
    for(let i=0;i<3;i++){ const x=z.dx[i], y=FY0-6, open=i===z.door?z.open:0; const f=(cl,a,b,w,h)=>{ ctx.fillStyle=cl; ctx.fillRect(x+a,y+b,w,h); };
      f(P.ink,-20,-58,40,58); f(M4P.steelSh,-19,-57,38,57); f(M4P.steelHi,-19,-57,38,2); // портал
      const iw=Math.round(16*open); if(open>0){ f('#f0e6c8',-16,-52,32,52); f('#d8ccaa',-16,-52,32,3); f('#c0b490',-16,-8,32,8); f('#e0d2aa',-16,-30,32,1); f('#fffaf0',-10,-52,20,2); const k=i===z.door?Math.min(4,Math.max(0,(z.inside||0))):0; // кабина: поручень, плафон; пассажиры по росту, у задней стенки
        for(let p=0;p<k;p++){ const hx=-14+p*7+(p===2?1:0), hy=-44+[2,0,3,1][p], sk=['#e8b890','#c08a60','#f0c8a0','#a87050'][p], hr=['#3a2a20','#1a1a24','#7a4a2a','#d8c070'][p], cl=['#3a6ad8','#8a5aa8','#2aa860','#5a5a68'][p];
          f(P.ink,hx,hy+6,8,22-[2,0,3,1][p]+2); f(cl,hx+1,hy+7,6,20-[2,0,3,1][p]+2); f(shade(cl,.18),hx+1,hy+7,1,10); f(P.ink,hx+1,hy-1,6,7); f(sk,hx+2,hy,4,5); f(hr,hx+2,hy,4,2); f(P.ink,hx+3,hy+3,1,1); } }
      f('#9aa2b2',-16,-52,16-iw,52); f('#9aa2b2',iw,-52,16-iw,52); f('#b8c0ce',-16,-52,1,52); f('#b8c0ce',iw,-52,1,52); f('#7a8292',-1-iw,-52,1,52); f(P.ink,-iw-1,-52,1,52); f(P.ink,iw,-52,1,52);
      f(P.ink,-12,-70,24,10); f('#1a1414',-11,-69,22,8); G.labels.push([String(z.floor[i]),x-3,y-65,7,M4P.led,'center',null]); const ar=i===z.door&&z.ph!=='ride'; ctx.fillStyle=ar?'#ffe14a':'#4a4430'; ctx.fillRect(x+4,y-67,5,2); ctx.fillRect(x+5,y-68,3,1); ctx.fillRect(x+6,y-69,1,1); ctx.fillRect(x+5,y-65,3,2);
      f(P.ink,23,-34,6,10); f('#c8ccd8',24,-33,4,8); f(i===z.door&&z.ph==='open'?'#ffe14a':'#5a5a68',25,-31,2,2); }
    if(z.exp&&z.door>=0){ const x=z.dx[z.door]; ctx.fillStyle=P.ink; ctx.fillRect(x-24,FY0-90,48,11); ctx.fillStyle='#2aa860'; ctx.fillRect(x-23,FY0-89,46,9); G.labels.push(['ЭКСПРЕСС',x,FY0-84,6,'#fff','center',null]); }
    if(z.over>0&&z.door>=0){ const x=z.dx[z.door]; ctx.fillStyle=Math.floor(G.t*8)%2?'#ff3a3a':'#7a1a1a'; ctx.fillRect(x-6,FY0-62,12,3); }
    floorAO(); drawTripActors([G.hero,...z.npcs]); if(z.ph==='open'&&!z.in) goalArrow(z.dx[z.door],FY0-30,z.cap>0?P.neonLime:'#ff9a3a'); } };
// ---------- M4-6: лестница на 14 этаж — шкала выносливости (центр-метр), ШАГ (A) / ОТДЫХ (B), пусто — одышка, стоп 2 с ----------
ZONES.bcstairs={ title:z=>'ЛЕСТНИЦА НА '+(z.floors||14)+' ЭТАЖ',
  tip:z=>'жми «ШАГ»; шкала кончится — одышка 2 с; «ОТДЫХ» восстанавливает',
  init(z){ z.len=W; z.fl=1; z.st=0; z.sta=1; z.rest=0; z.puff=0; z.lockHero=true; z.per=4; G.hero.hide=false; const h=G.hero; this.place(z); tev('stairs_start'); },
  geo(z){ const x0=Math.round(W*.28), x1=Math.round(W*.72), yb=Math.min(H-SA.b-20,z.y1), yt=Math.max(SA.t+96,yb-90); return {x0,x1,yb,yt}; },
  place(z){ const g=this.geo(z), k=z.st/z.per, h=G.hero; h.x=g.x0+(g.x1-g.x0)*k; h.y=g.yb-(g.yb-g.yt)*k; h.face=1; },
  step(z){ if(z.puff>0||z.top) return; const S=heroStats(), cost=.075/Math.max(.6,(S.SPD||60)/60); z.rest=0; z.sta=Math.max(0,z.sta-cost); z.st++; G.hero.set('walk'); G.hero.anT=(G.hero.anT||0)+.12; tev('stairs_step');
    if(z.st>=z.per){ z.st=0; z.fl++; pop('ЭТАЖ '+z.fl,W/2,this.geo(z).yt-30,'#ffe14a',8); if(z.fl>=(z.floors||14)){ z.top=1; tev('stairs_top'); setTimeout(()=>{},0); zoneDone(); } }
    if(z.sta<=0){ z.puff=2; tev('stairs_puff'); pop('ОДЫШКА… 2 с',G.hero.x,G.hero.y-52,'#ff9a3a',8,1.4); try{ tone(160,.4,'triangle',.08); }catch(e){} } this.place(z); },
  update(z,dt){ const h=G.hero; G.cam=0; if(z.puff>0){ z.puff-=dt; z.sta=Math.min(1,z.sta+dt*.12); h.set('hurt'); } else if(z.rest){ z.sta=Math.min(1,z.sta+dt*.42); h.set('idle'); if(z.sta>=1) z.rest=0; } else z.sta=Math.min(1,z.sta+dt*.06);
    this.place(z); z.hint=z.puff>0?'одышка…':z.sta<.25?'отдохни: «ОТДЫХ»':'жми «ШАГ»'; },
  ctx(z){ if(z.top) return {}; return {a:{label:'ШАГ',col:'#2aa860',fn:()=>this.step(z)},b:{label:'ОТДЫХ',col:'#3a6ad8',fn:()=>{ if(z.puff>0) return; z.rest=1; tev('stairs_rest'); }}}; },
  prog(z){ return z.fl*100+z.st*20; },
  unstick(z){ z.puff=0; z.sta=1; this.step(z); },
  bot(z){ const h=G.hero, r={x:h.x,y:h.y}; if(z.puff>0||z.rest) return r; if(z.sta<.2) r.b=1; else r.a=1; return r; },
  draw(z){ G.cam=0; const g=this.geo(z); ctx.fillStyle='#d8d2c0'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#c8c0aa'; ctx.fillRect(0,0,W,SA.t+60); ctx.fillStyle='#b8b09a'; for(let y=SA.t+66;y<H;y+=24) ctx.fillRect(0,y,W,1);
    ctx.fillStyle='#3a8a5a'; ctx.fillRect(0,g.yb+18,W,4); // зелёная полоса-панель подъезда
    { const wx=Math.round(g.x1+14), wy=Math.round(g.yt-70); if(wx+40<W-SA.r-8){ ctx.fillStyle=P.ink; ctx.fillRect(wx-1,wy-1,40,46); ctx.fillStyle='#9fc8ea'; ctx.fillRect(wx,wy,38,44); ctx.fillStyle='#dcecf6'; ctx.fillRect(wx,wy+30,38,14); ctx.fillStyle='#8a9ab6'; ctx.fillRect(wx+4,wy+24,8,20); ctx.fillRect(wx+20,wy+18,10,26); ctx.fillStyle=P.ink; ctx.fillRect(wx+18,wy,2,44); ctx.fillRect(wx,wy+21,38,2); ctx.fillStyle='#e8e2d0'; ctx.fillRect(wx-3,wy+44,44,3); }
      const fx=Math.round(g.x0-56), fy=Math.round(g.yb-58); if(fx>SA.l+70){ ctx.fillStyle=P.ink; ctx.fillRect(fx-1,fy-1,26,32); ctx.fillStyle='#d8343a'; ctx.fillRect(fx,fy,24,30); ctx.fillStyle='#ff6a6a'; ctx.fillRect(fx,fy,24,1); ctx.fillStyle='#bfe0ff'; ctx.fillRect(fx+4,fy+4,16,12); ctx.fillStyle='#c84a3a'; ctx.fillRect(fx+7,fy+7,10,6); ctx.fillStyle='#fff'; ctx.fillRect(fx+5,fy+21,14,2); G.labels.push(['ПК',fx+12,fy+26,6,'#fff','center',null]); } }
    // номер этажа на стене (крупно, трафарет)
    { const nx=Math.round(W*.16), ny=Math.max(SA.t+60,g.yt-10); ctx.fillStyle=P.ink; ctx.fillRect(nx-22,ny-14,44,28); ctx.fillStyle='#e8e2d0'; ctx.fillRect(nx-21,ny-13,42,26); G.labels.push([String(z.fl),nx,ny-1,14,'#2a4a8a','center',null]); G.labels.push(['ЭТАЖ',nx,ny+20,6,'#5a5a68','center',null]); }
    // марш: ступени от (x0,yb) к (x1,yt), перила, площадки
    const n=z.per*3, sw=(g.x1-g.x0)/n, sh=(g.yb-g.yt)/n; ctx.fillStyle='#8a8478'; ctx.fillRect(g.x0-30,g.yb,30+4,H-g.yb); ctx.fillRect(g.x1-2,g.yt,60,6);
    for(let i=0;i<n;i++){ const x=Math.round(g.x0+i*sw), y=Math.round(g.yb-(i+1)*sh); ctx.fillStyle=P.ink; ctx.fillRect(x,y,Math.ceil(sw)+1,Math.ceil(sh)+H); ctx.fillStyle='#a8a294'; ctx.fillRect(x+1,y+1,Math.ceil(sw),Math.ceil(sh)+H); ctx.fillStyle='#c8c2b2'; ctx.fillRect(x+1,y+1,Math.ceil(sw),2); }
    ctx.fillStyle=P.ink; ctx.fillRect(g.x0-30,g.yb,34,1); ctx.fillRect(g.x1-2,g.yt,60,1);
    ctx.strokeStyle=P.ink; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(g.x0-6,g.yb-30); ctx.lineTo(g.x1+4,g.yt-30); ctx.stroke(); ctx.strokeStyle='#c84a3a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(g.x0-6,g.yb-30.5); ctx.lineTo(g.x1+4,g.yt-30.5); ctx.stroke();
    ctx.fillStyle=P.ink; for(let i=0;i<=n;i+=3){ const x=Math.round(g.x0+i*sw), y=Math.round(g.yb-i*sh); ctx.fillRect(x,y-30,1,30); }
    drawTripActors([G.hero]);
    // центр-метр выносливости
    { const w=120, x=Math.round(W/2-w/2), y=Math.round(Math.max(SA.t+58,H*.3)); ctx.fillStyle='#120c18c8'; ctx.fillRect(x-6,y-14,w+12,30); G.labels.push(['ВЫНОСЛИВОСТЬ '+Math.round(z.sta*100)+'%',W/2,y-6,7,'#fff','center',null]); ctx.fillStyle=P.ink; ctx.fillRect(x-1,y+1,w+2,9); ctx.fillStyle='#3a3440'; ctx.fillRect(x,y+2,w,7); ctx.fillStyle=z.puff>0?'#ff6a5a':z.sta<.25?'#ff9a3a':'#3ad06a'; ctx.fillRect(x,y+2,Math.round(w*z.sta),7); ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(x,y+2,Math.round(w*z.sta),1); } } };

// цель HUD для зон БЦ (не пустая плашка)
{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='bcgate') return z.passed?'К лифтам →':z.tries&&z.tries<=z.fails?'Не пикнуло — приложи ещё раз':'Приложи пропуск к турникету';
  if(z&&z.k==='bclift') return z.ph==='ride'?'Едем на 14-й…':z.ph==='open'?(z.cap>0?'Лифт! Есть место — заходи':'Лифт полный — втиснись!'):'Жди лифт у дверей';
  if(z&&z.k==='bcstairs') return z.puff>0?'Одышка… стой':'Поднимись на '+(z.floors||14)+'-й: ШАГ / ОТДЫХ'; return _gt(z); }; }
// ================= M4-8: концовки v3.1 + «с кофе в руке» (купил кофе в кофейне) + «после лестницы» =================
function m4BigCup(x,y,steam){ x=Math.round(x); y=Math.round(y); const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-1,-1,10,14); f('#f4ead8',0,1,8,11); f('#2f8a6a',0,4,8,4); f('#fff8e8',3,5,2,2); f('#3a2418',0,0,8,1); f(P.ink,8,4,2,5); f('#d8ccb0',0,11,8,1);
  if(steam) for(let i=0;i<3;i++){ const k=(G.t*14+i*6)%14; ctx.fillStyle='rgba(255,255,255,'+(.7-k/20)+')'; ctx.fillRect(x+1+i*3+Math.round(Math.sin(G.t*3+i)),y-3-k,1,3); } }
END.push(['кофе в руке',9,(t,S)=>{ office(t); const dx=W*.6, y=H*.7; desk(dx); chair(dx-30,y+4); const sit=t>3; const hx=sit?dx-30:W*.05+t/3*(dx-30-W*.05);
  const p=Math.min(1,Math.max(0,(t-3.5)/4)); monitor(dx,t<3.5?'#1a2a3a':'#ffd23f'); if(t>3.5){ ctx.fillStyle='#c82a2a'; ctx.fillRect(dx+2,y-58,8,6); ctx.fillStyle=P.ink; ctx.fillRect(dx+2,y-44,28,3); ctx.fillStyle='#2aa860'; ctx.fillRect(dx+2,y-44,Math.round(28*p),3); G.labels.push(['1С:Предприятие',dx+16,y-76,7,'#c82a2a']); }
  spr(S,sit?'sit':'walk',Math.floor(t*10)%8,t>6?'o':'norm',hx,y+(sit?-2:4),false,1.1);
  const sip=t>5.2&&t<6.4; if(!sit) m4BigCup(hx+9,y-34,true); else if(sip) m4BigCup(hx+6,y-52,false); else m4BigCup(dx-15,y-43,true); // в руке → глоток → на столе
  if(t>6.6) G.labels.push(['+БОДРОСТЬ',hx-6,y-98,8,'#ffd98a']);
  sub(t<3?'С кофе в руке. Как в рекламе.':t<6.4?'Глоток. 1С грузится… '+Math.round(p*100)+'%':'Ты бодр. 1С — нет. Но это не твои проблемы.'); }]);
END.push(['лестница',8,(t,S)=>{ office(t); const dx=W*.6, y=H*.7; desk(dx); monitor(dx,'#3a6a9a'); chair(dx-30,y+4); const sit=t>3.4; const hx=sit?dx-30:W*.05+t/3.4*(dx-30-W*.05);
  spr(S,sit?'sit':'walk',Math.floor(t*(sit?4:6))%8,sit?'o':'hurt',hx,y+(sit?-2:4)+(sit?Math.round(Math.sin(t*6)):0),false,1.1);
  if(Math.floor(t*3)%2) G.labels.push(['ХХХ… ХХХ…',hx+18,y-82,7,'#9ad0ff']); { const nx=Math.round(W*.86), ny=Math.round(H*.2); ctx.fillStyle=P.ink; ctx.fillRect(nx-23,ny-15,46,40); ctx.fillStyle='#e8e2d0'; ctx.fillRect(nx-22,ny-14,44,38); } G.labels.push(['14',W*.86,H*.2,16,'#2a4a8a','center',null]); G.labels.push(['ЭТАЖ',W*.86,H*.2+16,7,'#5a4a6a','center',null]);
  sub(t<3.4?'Четырнадцать этажей пешком.':t<6?'Ноги — вата. Зато успел.':'Лифт починят завтра. Говорят.'); }]);
{ const T=CUTS.tripwin, _s=T.start; T.start=function(c){ _s(c); if(window.__endV===undefined){ const n=5; if(TR&&TR.coffee) c.v=5; else if(TR&&TR.ev&&TR.ev.stairs_top) c.v=6; else if(c.v>=n) c.v=Math.floor(Math.random()*n); c.len=END[c.v][1]; if(CUT) CUT.len=c.len; } tev&&TR&&(TR.endV=c.v); };
  const L=CUTS.late, _d=L.draw; L.draw=function(t,c){ _d(t,c); if(TR&&TR.coffee){ const bx=W*.62, y=H*.7, hx=t<4?W*.05+t/4*(bx-60-W*.05):bx-60; m4BigCup(hx+9,y-34,t<4); if(t>4.5) G.labels.push(['…зато с кофе',hx,y-84,7,'#ffd98a']); } }; }
// ================= M4-9: обучение БЦ — карточка при первой встрече (ПОПРОБОВАТЬ/ПРОПУСТИТЬ) + глава «БЦ» в ОБУЧЕНИИ =================
const BTUT={ bcgate:['ТУРНИКЕТ БЦ','Пропуск иногда не читает — приложи ещё раз. Охранник спросит «Вы к кому?» — отвечай по делу, иначе −10 с и звонок на ресепшн.','Пройди турникет',z=>z.passed],
  bclift:['ЛИФТ','Жди у горящей стрелки. Есть место — «ВОЙТИ». Полный — жми «ВТИСНУТЬСЯ» часто. Перегруз пищит — кто-нибудь выйдет.','Уедь на лифте',z=>z.in],
  bcstairs:['ЛЕСТНИЦА','«ШАГ» — вверх, тратит выносливость. Шкала пуста — одышка 2 с. «ОТДЫХ» — восстановиться.','Поднимись на 3 этажа',z=>z.fl>=4] };
function m4TutCheck(z){ const k=z.k; if(!BTUT[k]||TR.smod||TR.btut) return; const L4=TR.mode==='learn4'; if(!L4&&(window.__noTut||TR.mode==='learn')) return; save.tut=save.tut||{}; const key='bc_'+k;
  if(!L4&&save.tut[key]) return; if(z.tutDone) return; z.tutDone=1; save.tut[key]=1; try{ store(); }catch(e){} const d=BTUT[k];
  st4Modal({id:'btut',title:'НОВОЕ · '+d[0],text:d[1],auto:9,onAuto:()=>{ TR.btut={k,z}; },opts:[['ПОПРОБОВАТЬ','#2aa860',()=>{ TR.btut={k,z}; tev('btut_try'); }],['ПРОПУСТИТЬ','#5a4a7a',()=>{ tev('btut_skip'); }]]}); }
for(const k of Object.keys(BTUT)){ const Z=ZONES[k], u0=Z.update, b0=Z.bot; Z.update=function(z,dt){ m4TutCheck(z); if(TR.smod) return; const s=TR.btut; if(s&&s.z===z&&BTUT[s.k][3](z)){ TR.btut=null; tev('btut_ok'); pop('ГОТОВО ✓',W/2+G.cam,z.y0-60,P.neonLime,9); SFX.coin(); } else if(s&&s.z!==z) TR.btut=null; return u0.call(this,z,dt); };
  Z.bot=function(z){ if(TR.smod&&TR.smod.id==='btut') return {x:G.hero.x,y:G.hero.y,a:1}; return b0.call(this,z); }; }
{ const _gt=goalText; goalText=function(z){ if(z&&TR.btut&&TR.btut.z===z) return '★ '+BTUT[TR.btut.k][2]; return _gt(z); }; }
function startLearnBc(){ startTrip(0,{mode:'learn4',budget:999,zones:[{k:'bcgate',seg:'bc',d:0,seed:41,fails:1,guard:true,qa:0,flip:false},{k:'bclift',seg:'bc',d:0,seed:42,v:0},{k:'bcstairs',seg:'bc',d:0,seed:43,floors:5,last:true}]}); TR.name='Учебный БЦ'; tev('learn4_start'); }
{ const _tu=tripUpdate; tripUpdate=function(dt){ if(TR.mode==='learn4'&&!TR.done) TR.tLeft=TR.tTotal; return _tu(dt); };
  const _tf=tripFinish; tripFinish=function(win,reason){ if(TR.mode!=='learn4') return _tf(win,reason); if(TR.done) return; TR.done=true; TR.win=true; G.done=true; G.win=true; G.doneT=0; musOn=false; save.learned4=1; try{ store(); }catch(e){} SFX.win(); };
  const _sr=showResult; showResult=function(){ if(TR.mode==='learn4'){ TR.mode='learned'; toTitle(); say('БЦ пройден! Пропуск, лифт, лестница — всё твоё',3,P.neonLime); return; } return _sr(); };
  // в обучении у охранника нет штрафа, у кофе/лифта — без провала по времени
  const _pen=penalize; penalize=function(sec,src){ if(TR.mode==='learn4') return 0; return _pen(sec,src); }; }
window.__learn4={start:startLearnBc,steps:BTUT};
// выбор главы ОБУЧЕНИЯ: 4 главы сеткой 2×2 (МЕТРО / УЛИЦА / МЦД / БЦ)
{ const _dt=drawTitle; drawTitle=function(){ _dt(); if(!G.lpick) return; buttons.length=0; G.labels.length=0; ctx.fillStyle='rgba(10,6,20,.6)'; ctx.fillRect(0,0,W,H);
  const w=Math.min(W-60,300), hh=128, x=Math.round(W/2-w/2), y=Math.round(Math.max(SA.t+8,H/2-hh/2)); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh);
  G.labels.push(['ОБУЧЕНИЕ · ГЛАВА',W/2,y+14,11,'#d8265e','center',null]); G.labels.push([save.learned4?'все главы пройдены ✓':save.learned3?'новое: БЦ — турникет, охранник, лифт, лестница':save.learned2?'новое: МЦД — табло, контролёры, укрытия':'новое: светофор, доска, лужи, лёд, промоутер',W/2,y+32,7,'#5a4a6a','center',null]);
  const bw=Math.round((w-30)/2), bh=28; bigBtn('МЕТРО',x+10,y+44,bw,bh,'#3d5ab0',()=>{ G.lpick=0; startLearn(); },'lp0',9); bigBtn('УЛИЦА',x+20+bw,y+44,bw,bh,'#2aa860',()=>{ G.lpick=0; startLearnStreet(); },'lp1',9);
  bigBtn('МЦД',x+10,y+44+bh+10,bw,bh,'#d8501f',()=>{ G.lpick=0; startLearnMcd(); },'lp2',9); bigBtn('БЦ',x+20+bw,y+44+bh+10,bw,bh,'#8a5a3a',()=>{ G.lpick=0; startLearnBc(); },'lp3',9);
  buttons.unshift({x:0,y:0,w:W,h:H,id:'lpx',cb:()=>{ G.lpick=0; }}); }; }
// ================= M4-10: звук БЦ — лифтовый muzak 90 BPM (Fmaj7–Dm7–Gm7–C7: бас, электропиано, виброфон, щётки), голос охранника с ducking =================
const BC_THEME={bpm:90, ch:[[53,57,60,64],[50,53,57,60],[55,58,62,65],[48,52,55,58]], bass:[41,38,43,36],
  mel:[0,0,72,0,0,0,76,0,74,0,0,0,72,0,0,0, 0,0,69,0,0,0,72,0,0,0,74,0,0,0,0,0, 0,0,70,0,0,0,74,0,77,0,0,0,74,0,0,0, 0,0,76,0,0,0,72,0,70,0,0,0,67,0,0,0]};
{ const _mt=musicTick; musicTick=function(){ const z=TR&&TR.z; if(!(G.scene==='trip'&&z&&/^bc(gate|lift|stairs)$/.test(z.k))) return _mt(); if(!AC||!musOn||save.mute) return; const sp=60/BC_THEME.bpm/4; AUD.bc=1; const lift=z.k==='bclift', stairs=z.k==='bcstairs', v=stairs?.5:1;
  while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02; const i=musStep%64, bar=i>>4, s=i%16, d=musNext-AC.currentTime, C=BC_THEME.ch[bar];
    if(s===0||s===8) tone(mtof(BC_THEME.bass[bar]+(s===8?7:0)),sp*3.5,'sine',.45*v,0,d,mus); if(s===6) tone(mtof(BC_THEME.bass[bar]+12),sp*1.5,'sine',.25*v,0,d,mus);
    if(s===2||s===10) for(const n of C) tone(mtof(n),sp*2.6,'triangle',.07*v,0,d,mus);
    const m=BC_THEME.mel[i]; if(m&&!stairs) tone(mtof(m+(lift?12:0)),sp*3,lift?'square':'sine',lift?.05:.16,0,d,mus);
    if(s%4===2) noise(.05,.025*v,5000,d); musStep++; musNext+=sp; } }; }
VOICE4.guard={w:'sawtooth',f:105,s:.08,r:7,lp:900,sub:1};
VOICE4.colleague=VOICE4.colleague||{w:'triangle',f:230,s:.18,r:12,lp:1800};
{ const B=ZONES.bcgate, a0=B.ask; B.ask=function(z){ a0.call(this,z); try{ heroVoice('guard','Молодой человек! Вы к кому?'); tev('guard_voice'); }catch(e){} }; }
// ---------- открытый вопрос: охранник за краем экрана — портрет-указатель у края (не у джойстика/кнопок) ----------
function m4EdgePortrait(e,name,z){ const sx=e.x-G.cam; if(sx>SA.l+6&&sx<W-SA.r-6) return; const left=sx<=SA.l+6, x=left?SA.l+8:W-SA.r-8-30, y=Math.round(Math.max(SA.t+44,z.y0-62));
  ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,32,34); ctx.fillStyle='#e8dcc0'; ctx.fillRect(x,y,30,32); if(atlOk('ch')) atlDraw(ctx,'ch',name,x+3,y-4,!left);
  ctx.fillStyle=P.ink; const ax=left?x-6:x+32; for(let k=0;k<5;k++) ctx.fillRect(left?ax+k:ax+4-k,y+16-k,1,k*2+1); }
{ const B=ZONES.bcgate, d0=B.draw; B.draw=function(z){ d0.call(this,z); const g=z.gd; if(g&&(g.walkTo||z.call>0||(TR.smod&&TR.smod.id==='guard'))) m4EdgePortrait(g,z.call>0||g.walkTo===1?'guard_angry':'guard_idle_0',z); }; }
// ---------- открытый вопрос: на лестнице ходьбы нет — джойстик и «ДВИГАЙ» скрыты (только ШАГ/ОТДЫХ) ----------
{ const _ds=drawStick; drawStick=function(){ const z=G.scene==='trip'&&TR&&TR.z; if(z&&(z.k==='bcstairs'||z.noStick)) return; return _ds(); }; }
// ---------- открытый вопрос: пустой мрамор на широких экранах — постеры, растения, справочное табло, скамьи (только в свободных промежутках, не у краёв и не над контролами) ----------
function m4Poster(x,y,k){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-14,0,28,36); f('#d8cfb8',-13,1,26,34); f(P.ink,-11,3,22,26);
  if(k%3===0){ f('#7ab8e8',-10,4,20,24); f('#e8f4ff',-10,4,20,6); for(const [a,h] of [[-10,12],[-5,18],[0,9],[4,15],[7,11]]) f('#3a4a6a',a,28-h,4,h); for(const [a,b] of [[-4,14],[5,17],[-9,20],[1,22]]) f('#ffd98a',a,b,1,1); }
  else if(k%3===1){ f('#2f8a6a',-10,4,20,24); f('#f4ead8',-4,11,8,11); f('#2f8a6a',-4,14,8,3); f(P.ink,4,14,2,4); f('#fff8e8',-2,7,1,3); f('#fff8e8',1,6,1,3); }
  else { f('#e8a838',-10,4,20,24); f('#fff2d0',-10,22,20,6); f('#d8265e',-6,9,12,9); f('#fff8e8',-3,12,6,3); }
  f('#5a5a68',-10,31,20,1); f('#5a5a68',-10,33,12,1); }
function m4Board(x,y){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-18,0,36,48); f('#1e2a44',-17,1,34,46); f('#c9a24a',-17,1,34,6); f('#fff2d0',-12,3,24,2);
  const col=['#ffe9a8','#8fd8ff','#ffe9a8','#a8e8a0','#ffe9a8','#ff9a8a'], ln=[18,14,20,12,16,10]; for(let i=0;i<6;i++){ f('#fff8e8',-14,10+i*6,3,3); f(col[i],-9,11+i*6,ln[i],1); } f(P.ink,-2,48,4,14); f('#5a5a68',-1,48,2,14); f(P.ink,-8,61,16,2); }
function m4Bench(x,y){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f('rgba(10,6,20,.22)',-24,-1,48,3); f(P.ink,-23,-14,46,5); f(M4P.wood,-22,-13,44,3); f(M4P.woodHi,-22,-13,44,1); f(P.ink,-20,-9,3,9); f(P.ink,17,-9,3,9); f('#8a8a9a',-19,-9,1,8); f('#8a8a9a',18,-9,1,8); f(P.ink,-23,-22,46,4); f(M4P.wood,-22,-21,44,2); f(P.ink,-12,-18,2,4); f(P.ink,10,-18,2,4); }
function m4Decor(z,occ){ const c=G.cam, L=SA.l+8, R=W-SA.r-8, iv=[]; for(const q of occ) iv.push([q[0]-8,q[1]+8]); for(const r of hudRects(6)) if(r.y<FY0+2) iv.push([r.x,r.x+r.w]);
  iv.sort((a,b)=>a[0]-b[0]); const free=[]; let x=L; for(const q of iv){ if(q[0]>x) free.push([x,Math.min(q[0],R)]); x=Math.max(x,q[1]); if(x>=R) break; } if(x<R) free.push([x,R]);
  let board=0, last=''; const W_={bench:56,board:44,poster:36,plant:24};
  for(const [a,b] of free){ const w=b-a; if(w<W_.plant) continue; const n=w>170?2:1;
    for(let i=0;i<n;i++){ const cx=Math.round(a+w*(i+.5)/n), cw=w/n, seed=((Math.round(cx+c)*2654435761)^(z.seed||7))>>>0;
      let opts=['bench','board','poster','plant'].filter(t=>W_[t]<=cw&&!(t==='board'&&board)&&t!==last&&!(t==='plant'&&occ.some(q=>q[2]==='plant'&&Math.abs((q[0]+q[1])/2-cx)<100))); if(!opts.length) continue; const t=opts[(seed>>>5)%Math.min(opts.length,cw>=80?4:2)]; last=t;
      if(t==='poster') m4Poster(cx,FY0-74,seed>>>9); else if(t==='board'){ board=1; m4Board(cx,FY0-68); } else if(t==='plant') m4Plant(cx,FY0-2); else m4Bench(cx,FY0-1); } } }
{ const _lb=m4Lobby; m4Lobby=function(z,sign){ const RB=_lb(z,sign); try{ const c=G.cam, occ=[]; if(sign){ const sw=Math.min(180,txtW(sign,8)+24); if(Math.max(SA.t+50,RB+8)+14>FY0-80) occ.push([W/2-sw/2,W/2+sw/2]); }
  if(z.k==='bcgate'){ occ.push([18-c,86-c],[z.tx-120-c-12,z.tx-120-c+12],[z.tx+36-c,z.tx+148-c],[112-c-14,112-c+14,'plant'],[z.len-50-c-14,z.len-50-c+14,'plant'],[z.tx-c-26,z.tx-c+16]); }
  else if(z.k==='bclift'){ for(const x of z.dx||[]) occ.push([x-24,x+32]); const t='ЛИФТЫ · 1–14 ЭТАЖ'+(z.v?' · ЭКСПРЕСС 7–14':''), sw=Math.min(220,txtW(t,8)+24), sy=Math.round(Math.max(SA.t+58,H*.3))+28; if(sy+14>=FY0-80) occ.push([W/2-sw/2,W/2+sw/2]); }
  m4Decor(z,occ); }catch(e){} return RB; }; }
// ---------- ревью R2: пока открыта модалка (охранник/промоутер/коллега/такси/карточки) — кнопки действия справа внизу не рисуются ----------
{ const _ab=actBtn; actBtn=function(){ if(G.scene==='trip'&&TR&&(TR.smod||TR.z&&TR.z.noAct)) return; return _ab.apply(this,arguments); }; }
// ---------- ревью R3: в лифтовом холле — компактный индикатор «втиснуться» над дверями целевого лифта (не плавает на стыке потолка, не задевает табличку «ЛИФТЫ») ----------
{ const _sq=sqMeter; sqMeter=function(z){ if(!(z&&z.k==='bclift'&&z.dx)) return _sq(z); const p=Math.round(Math.min(1,z.sq||0)*100), x=Math.round(z.dx[z.door||0]), y=FY0-6-57, w=46, h=12, x0=x-w/2;
  ctx.fillStyle=P.ink; ctx.fillRect(x0-1,y-1,w+2,h+2); ctx.fillStyle='#120c18'; ctx.fillRect(x0,y,w,h); ctx.fillStyle='#2a2238'; ctx.fillRect(x0,y,w,1);
  G.labels.push([p+'%',x0+10,y+6,7,Math.sin(G.t*10)>0?'#ffd23f':'#fff','center',null]); ctx.fillStyle='#3a3048'; ctx.fillRect(x0+21,y+4,22,4); ctx.fillStyle='#d87a20'; ctx.fillRect(x0+21,y+4,Math.round(22*p/100),4); ctx.fillStyle='#ffb050'; ctx.fillRect(x0+21,y+4,Math.round(22*p/100),1);
  ctx.fillStyle=P.ink; ctx.fillRect(x-1,y+h+1,3,2); }; }
// ---------- ревью R4: стрелка конца зоны не ложится на фасадную вывеску — у конца зоны вывесок нет ----------
{ const S=ZONES.street, i0=S.init; S.init=function(z){ i0.call(this,z); if(z.end) z.noSign=(z.noSign||[]).concat([[z.len-110,z.len+40]]); }; }
// ---------- ревью R5: обратный отсчёт «N с» в шапке модалок с автозакрытием (коллега, промоутер, карточки обучения) ----------
{ const _dm=st4DrawModal; st4DrawModal=function(m){ _dm(m); if(!m||m.cards||m.scene||!m.auto||!m.opts) return; const w=Math.min(W-60,350), x=Math.round(W/2-w/2), pw=m.spr?44:0, ln=wrapW(m.text,w-24-pw,8), bh=30, hh=Math.max(34+ln.length*13,m.spr?62:0)+(m.opts?bh+18:12), y=Math.round(Math.max(SA.t+30,H/2-hh/2-10));
  const n=Math.max(0,Math.ceil(m.auto-m.t)), cx=x+w-38, cy=y+9; ctx.fillStyle=P.ink; ctx.fillRect(cx-5,cy-5,10,10); ctx.fillStyle='#fff8e8'; ctx.fillRect(cx-4,cy-4,8,8); ctx.fillStyle=n<=2?'#d8265e':P.ink; ctx.fillRect(cx,cy-3,1,4); ctx.fillRect(cx,cy,3,1);
  G.labels.push([n+' с',cx+8,cy+1,8,n<=2?'#d8265e':'#5a4a6a','left',null]); }; }
