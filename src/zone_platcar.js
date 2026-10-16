'use strict';
// ================= ЗОНА: ПЛАТФОРМА — пробиться к дверям =================
ZONES.plat={ title:z=>z.short?'КОРОТКИЙ ПОЕЗД!':z.babatank?'ПЛАТФОРМА · БАБУШКА-ТАНК':'ПЛАТФОРМА',
  tip:z=>'встань у двери (жёлтая стрелка) и жми «ВОЙТИ»; полна — жми «ВОЙТИ» много раз',
  init(z){ z.len=Math.max(W,560); const L=z.len; z.ph='arrive'; z.pT=2.2; z.trainX=L+40; z.boarded=false; z.sq=0; z.trains=0;
    z.doors=[]; if(z.short){ z.shX=Math.round(Math.min(L*.45,W*.5-70)); z.doors.push({x:z.shX+90,cap:ri(2,3),n:0,open:0}); } else for(let x=110;x<L-40;x+=Math.max(80,Math.round((L-130)/Math.max(3,Math.round((L-130)/95))))) z.doors.push({x,cap:ri(2,5),n:0,open:0});
    if(z.cols){ for(let x=180;x<L-60;x+=150){ z.solids.push([x-6,z.y0+16,x+6,z.y0+26]); } }
    for(let i=0;i<z.crowd;i++){ const d=pick(z.doors); const e=mkNpc(qType(z.d),z.short?rnd(60,L-40):d.x+rnd(-24,24),rnd(z.y0+2,z.y1-6)); e.door=z.short?z.doors[0]:d; e.hx=e.x; e.hy=e.y; z.npcs.push(e); }
    if(z.babatank){ const b=mkNpc('babatank',-20,(z.y0+z.y1)/2); b.ghost=true; z.tank=b; b.st='idle'; z.npcs.push(b); b.hide=true; } },
  nearDoor(z){ const h=G.hero; let b=null; for(const d of z.doors) if(!b||Math.abs(d.x-h.x)<Math.abs(b.x-h.x)) b=d; return b; },
  update(z,dt){ const h=G.hero; z.pT-=dt; const L=z.len;
    // цикл поезда
    if(z.ph==='arrive'){ z.trainX+=(0-z.trainX)*Math.min(1,dt*2.2); if(z.pT<=0){ z.trainX=0; z.ph='open'; z.pT=z.openT; z.trains++; SFX.doors(); for(const d of z.doors){ d.n=0; d.cap=ri(2,5)-(z.d>12?1:0); } say(z.short?'Открыта только последняя дверь!':'Двери открыты!',1.4,P.neonLime);
        // выходящие
        for(const d of z.doors) for(let i=0;i<ri(1,2);i++){ const e=mkNpc(qType(z.d),d.x+rnd(-4,4),z.y0); e.out=true; e.door=null; z.npcs.push(e); }
        if(z.tank){ z.tank.hide=false; z.tank.x=Math.max(10,h.x-60); z.tank.y=h.y; z.tank.ghost=false; z.tank.pin=true; z.tank.go=1; bubble(z.tank,'ПОСТОРОНИСЬ!',1.6,P.red); SFX.boss(); } } }
    else if(z.ph==='open'){ for(const d of z.doors) d.open=Math.min(1,d.open+dt*3); if(z.pT<=0){ z.ph='closing'; z.pT=1.6; say('Осторожно, двери закрываются!',1.5,P.edge); SFX.doors(); } }
    else if(z.ph==='closing'){ if(z.pT<=0){ z.ph='leave'; z.pT=2; for(const d of z.doors) d.open=0; if(!z.boarded){ tev('missed'); } if(!z.boarded) say('Уехал без тебя… следующий через минуту',1.8,'#ccc'); } }
    else if(z.ph==='leave'){ z.trainX-=dt*(260+(2-z.pT)*200); if(z.pT<=0){ z.ph='arrive'; z.pT=2.6; z.trainX=L+40; } }
    const open=z.ph==='open'||z.ph==='closing';
    // толпа
    for(const e of z.npcs){ if(e===z.tank) continue; if(e.out){ e.ghost=false; if(walkTo(e,e.x+(e.x<L/2?-40:40),z.y1,40,dt)) e.out=false; continue; }
      if(e.door&&open&&!e.inside){ if(walkTo(e,e.door.x,z.y0,46,dt)||(Math.abs(e.x-e.door.x)<5&&e.y<z.y0+4)){ if(e.door.n<e.door.cap){ e.door.n++; e.inside=true; e.gone=true; } else { e.door=null; bubble(e,pick(['Да не влезу…','Следующий!','Ну куда?!']),1.2); } } }
      else if(!open&&!e.inside&&e.hx!==undefined){ walkTo(e,e.hx,e.hy,26,dt); if(!e.door) e.door=z.short?z.doors[0]:pick(z.doors); } }
    z.npcs=z.npcs.filter(e=>!e.gone);
    // подсыпаем народ, пока ждём
    if(!open&&z.npcs.length<z.crowd){ const d=z.short?z.doors[0]:pick(z.doors); const e=mkNpc(qType(z.d),Math.random()<.5?6:L-6,rnd(z.y0+6,z.y1)); e.door=d; e.hx=d.x+rnd(-24,24); e.hy=rnd(z.y0+2,z.y1-6); z.npcs.push(e); }
    // Бабушка-Танк: таран к двери, позади — кильватер
    const tk=z.tank; z.wake=false; if(tk&&tk.go){ const d=this.nearDoor(z); const tx=d.x, ty=z.y0; walkTo(tk,tx,ty,70,dt); tk.set('walk');
      for(const e of z.npcs){ if(e===tk) continue; const dx=e.x-tk.x, dy=(e.y-tk.y)*2; if(Math.hypot(dx,dy)<tk.r+e.r+4){ e.y+=dy>0?14:-14; e.x+=dx>0?6:-6; e.sq=.7; if(Math.random()<.3) bubble(e,'АЙ!',.8); } }
      const bx=h.x-tk.x, by=(h.y-tk.y)*2; if(Math.hypot(bx,by)<tk.r+h.r+2&&bx>-2&&!h.stun){ tev('tank_hit'); h.stun=.9; h.y+=by>0?16:-16; pop('СНЕСЛА!',h.x,h.y-50,P.red,8); shake(3); SFX.heavy(); }
      if(bx<0&&bx>-30&&Math.abs(by)<16){ z.wake=true; if(!z.wakeSaid){ tev('tank_wake'); z.wakeSaid=1; pop('КИЛЬВАТЕР!',h.x,h.y-52,P.neonLime,8); } }
      if(Math.abs(tk.x-tx)<5&&tk.y<z.y0+5){ tk.go=0; tk.gone=true; tk.hide=true; d.n=Math.max(0,d.n-1); } }
    z.slow=z.wake?1.6:1; if(z.wake) h.den=0;
    // посадка
    if(open&&!z.boarded){ const d=this.nearDoor(z); z.atDoor=Math.abs(h.x-d.x)<12&&h.y<z.y0+10?d:null; } else z.atDoor=null;
    if(z.boarded){ z.lockHero=true; walkTo(h,z.bd.x,z.y0-14,40,dt); h.y=Math.max(h.y,z.y0-14); z.bT-=dt; if(z.bT<=0&&!z.fin){ z.fin=1; zoneDone(); } }
    z.hint=z.boarded?'ты в вагоне!':open?(z.atDoor?(z.atDoor.n>=z.atDoor.cap?'ЖМИ «ВОЙТИ» ЧАЩЕ!':'ЖМИ «ВОЙТИ»!'):'к двери! ↑'):z.ph==='arrive'?'поезд подходит — займи место у двери':'жди следующий поезд';
  },
  board(z,d,squeeze){ const h=G.hero; tev(squeeze?'squeeze':'board'); if(z.short) tev('short_board'); z.boarded=true; z.bd=d; z.bT=.9; d.n++; h.pin=true; h.ghost=true; if(z.ph==='closing'&&z.pT<.6){ tev('pinched'); pop('ЗАЖАЛО!',h.x,h.y-52,P.red,9); shake(4); SFX.heavy(); TR.nerves=Math.max(0,TR.nerves-10); } else { pop(squeeze?'ВТИСНУЛСЯ!':'ВОШЁЛ!',h.x,h.y-52,P.neonLime,9); SFX.pick(); } haptic('success'); },
  ctx(z){ const d=z.atDoor; if(!d||z.boarded) return {}; if(d.n<d.cap) return {b:{label:'ВОЙТИ',col:'#2aa860',fn:()=>this.board(z,d)}};
    return {b:{label:'ВОЙТИ',sq:true,col:'#d87a20',fn:()=>{ z.sq+=.26+(heroId==='baba'?.12:0); shake(1); pop(pick(['ЫЫЫ','ХРУСТ','ВДОХ']),G.hero.x,G.hero.y-50,'#fff',7); if(z.sq>=1){ z.sq=0; this.board(z,d,true); TR.scandal+=10; } }}}; },
  prog(z){ const h=G.hero, d=this.nearDoor(z); return (z.boarded?1000:0)-Math.abs(h.x-d.x)-Math.abs(h.y-z.y0)+z.trains*30; },
  unstick(z){ const h=G.hero, d=this.nearDoor(z); h.x=d.x; h.y=z.y0+4; for(const e of z.npcs) if(Math.abs(e.x-d.x)<16&&e.y<z.y0+16) e.y=z.y1; if(z.ph==='open'||z.ph==='closing') this.board(z,d,true); },
  bot(z){ const h=G.hero, d=this.nearDoor(z); const r={x:d.x,y:z.y0}; if(z.tank&&z.tank.go){ r.x=z.tank.x-14; r.y=z.tank.y; } if(z.atDoor) r.b=1; else if(h.den>3&&Math.random()<.04) r.a=1; return r; },
  draw(z){ const lc=LINE_COL[TR.line%10], c=G.cam, wb=FY0-4; hallBG(z,{wall:'#d6ccb0'});
    // путь
    ctx.fillStyle='#1a1424'; ctx.fillRect(0,wb-62,W,58); ctx.fillStyle='#3a3046'; ctx.fillRect(0,wb-10,W,6);
    // поезд
    const tx=Math.round(z.trainX-c), ty=wb-58, TL=z.short?140:z.len; const t0=z.short?Math.round(z.shX+z.trainX-c):tx;
    if(z.ph!=='leave'||z.trainX>-z.len-50){ ctx.fillStyle=P.ink; ctx.fillRect(t0-1,ty-1,TL+2,52); ctx.fillStyle='#4a6a8a'; ctx.fillRect(t0,ty,TL,50); ctx.fillStyle=lc; ctx.fillRect(t0,ty+34,TL,3);
      for(let x=10;x<TL-20;x+=30){ ctx.fillStyle=P.ink; ctx.fillRect(t0+x,ty+8,20,16); ctx.fillStyle='#ffe9a8'; ctx.fillRect(t0+x+1,ty+9,18,14); }
      for(const d of z.doors){ const dx=Math.round(d.x-c+(z.trainX)), o=Math.round(d.open*8); ctx.fillStyle=P.ink; ctx.fillRect(dx-11,ty+4,22,46); ctx.fillStyle=z.atDoor===d?'#ffe9a8':'#5a7a9a'; ctx.fillRect(dx-10,ty+5,20,44);
        if(d.open>0){ ctx.fillStyle='#2a1a1a'; ctx.fillRect(dx-o,ty+5,o*2,44); ctx.fillStyle='#ffe0a0'; ctx.fillRect(dx-o+1,ty+8,o*2-2,8); }
        ctx.fillStyle='#4a6a8a'; ctx.fillRect(dx-10-o,ty+5,10,44); ctx.fillRect(dx+o,ty+5,10,44); ctx.fillStyle='#bfe0ff'; ctx.fillRect(dx-8-o,ty+9,6,14); ctx.fillRect(dx+o+2,ty+9,6,14);
        if(d.open>0&&d.n>=d.cap){ G.labels.push(['ПОЛНАЯ',dx,ty-6,6,P.red]); } } }
    if(z.short){ G.labels.push(['ДВЕРЬ ТУТ →',Math.round(z.shX-38-c),ty+20,7,P.edge]); }
    ctx.fillStyle='#e8d040'; ctx.fillRect(0,wb+2,W,2);
    hallLight();
    for(const x of z.solids){ const sx=Math.round(x[0]-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-1,0,14,x[3]); ctx.fillStyle='#c8bca0'; ctx.fillRect(sx,0,12,x[3]-1); ctx.fillStyle='#a89c80'; ctx.fillRect(sx+8,0,4,x[3]-1); }
    drawTripActors([G.hero,...z.npcs]);
    if(!z.boarded){ const d=this.nearDoor(z); goalArrow(d.x+(z.ph==='arrive'?z.trainX:0),wb-70,z.ph==='open'||z.ph==='closing'?P.neonLime:P.edge); }
    if(z.ph==='closing'&&Math.floor(G.t*6)%2){ ctx.fillStyle='rgba(255,60,60,.12)'; ctx.fillRect(0,0,W,H); }
  } };
// ================= ЗОНА: ВАГОН — охота за местом =================
ZONES.car={ title:z=>z.terminal?'ВАГОН · ДО КОНЕЧНОЙ':z.controller?'ВАГОН · КОНТРОЛЁР!':'ВАГОН · НАЙДИ МЕСТО',
  tip:z=>'место освобождается на остановках — беги и жми «СЕСТЬ»; на твоей — к двери',
  init(z){ z.len=Math.max(W,500); const L=z.len; z.T=0; z.spot=0; z.best=0; z.stopAt=[]; for(let i=1;i<=z.stops;i++) z.stopAt.push(z.ride*i/(z.stops+1)); z.si=0; z.stopT=0; z.arrive=false; z.swT=z.sway; z.warn=0; z.sleep=0;
    z.slots=[]; for(let bx=24;bx+66<L-24;bx+=100){ for(let k=0;k<3;k++) z.slots.push({x:bx+11+k*22,occ:null}); }
    z.poles=[]; for(let bx=24;bx<L-24;bx+=100) z.poles.push(bx+83);
    z.doorsX=[]; for(let bx=24;bx<L-24;bx+=200) z.doorsX.push(bx+83);
    // почти все места заняты
    const free=z.slots.length>4?1:0; const fr=new Set(); while(fr.size<free) fr.add(ri(2,z.slots.length-1));
    z.slots.forEach((s,i)=>{ if(!fr.has(i)){ const e=mkNpc(pick(['polite','student','aunt','sleeper','tourist','granny','seeds']),s.x,z.y0); e.sit=s; s.occ=e; e.pin=true; e.st='sleep'; z.npcs.push(e); } });
    for(let i=0;i<z.crowd;i++){ const e=mkNpc(qType(z.d),rnd(40,L-30),rnd(z.y0+14,z.y1)); z.npcs.push(e); e.hx=e.x; e.hy=e.y; }
    if(z.controller){ const c=mkNpc('controller',L+10,(z.y0+z.y1)/2+6); c.ctl=true; c.m=20; z.npcs.push(c); z.ctl=c; }
    G.hero.x=z.doorsX[0]; G.hero.y=z.y0+14; },
  update(z,dt){ const h=G.hero, L=z.len; if(!z.arrive) z.T+=dt;
    // качка
    z.swT-=dt; if(z.swT<1.6&&!z.warn){ z.warn=1; z.warnS=pick(['ТОРМОЖЕНИЕ','ПОВОРОТ','РЫВОК']); SFX.squeak(); } if(z.swT<=0){ z.swT=z.sway+rnd(-.6,.8); z.warn=0; const dir=Math.random()<.5?-1:1; shake(3); SFX.land();
      for(const e of z.npcs){ if(!e.sit&&!e.ctl) e.x+=dir*rnd(8,18); }
      if(!h.seat&&!h.hold&&!z.arrive){ tev('sway_hit'); h.x+=dir*24; h.stun=.5; TR.nerves=Math.max(0,TR.nerves-6); pop('ШАТНУЛО!',h.x,h.y-50,'#ff9a3a',8); } }
    // остановки: кто-то выходит — место свободно
    if(z.si<z.stopAt.length&&z.T>=z.stopAt[z.si]){ z.si++; z.stopT=3.2; tev('stop'); SFX.doors(); say('Остановка. Кто-то встаёт!',1.4,P.neonLime);
      const occ=z.slots.filter(s=>s.occ&&s.occ!=='hero'); for(let i=0;i<Math.min(occ.length,ri(1,2));i++){ const s=pick(occ); const e=s.occ; if(!e||e==='hero') continue; s.occ=null; s.fresh=2; e.sit=null; e.pin=false; e.st='walk'; e.leaving=pick(z.doorsX); }
      for(let i=0;i<ri(1,3);i++){ const e=mkNpc(pick(['granny','polite','aunt','student']),pick(z.doorsX),z.y0+8); e.seek=Math.max(1,3.2-z.d*.1)+Math.random()*1.4; e.sspd=24+Math.min(24,z.d*1.2); z.npcs.push(e); } }
    if(z.stopT>0) z.stopT-=dt;
    for(const s of z.slots) if(s.fresh>0) s.fresh-=dt;
    for(const e of z.npcs){ if(e.sit){ e.x=e.sit.x; e.y=z.y0; e.set('sleep'); continue; }
      if(e.leaving!==undefined){ if(walkTo(e,e.leaving,z.y0+4,44,dt)) e.gone=true; continue; }
      if(e.ctl){ walkTo(e,-20,e.y,34,dt); e.set('walk'); for(const o of z.npcs){ if(o!==e&&!o.sit&&Math.abs(o.x-e.x)<14&&Math.abs(o.y-e.y)<10){ o.y+=o.y>e.y?14:-14; o.x-=10; if(Math.random()<.2) bubble(o,'АЙ!',.6); } }
        if(!h.seat&&Math.abs(h.x-e.x)<14&&Math.abs(h.y-e.y)<10&&!h.stun){ tev('ctl_hit'); h.stun=1.1; h.x-=26; bubble(e,'ВАШ БИЛЕТИК!',1.4,P.red); shake(3); SFX.heavy(); TR.nerves=Math.max(0,TR.nerves-10); }
        if(e.x<-10){ e.x=L+40; } continue; }
      if(e.seek!==undefined){ e.seek-=dt; if(e.seek<=0){ const f=z.slots.filter(s=>!s.occ).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0]; if(f){ if(walkTo(e,f.x,z.y0,e.sspd||40,dt)&&!f.occ){ f.occ=e; e.sit=f; e.pin=true; e.seek=undefined; if(f.near) pop('ОПЕРЕДИЛИ!',f.x,z.y0-50,P.red,8); } } else e.seek=undefined; } continue; }
      if(e.hx!==undefined) walkTo(e,e.hx,e.hy,14,dt); }
    z.npcs=z.npcs.filter(e=>!e.gone);
    // герой: сидит/держится
    if(h.seat){ h.x=h.seat.x; h.y=z.y0; } if(h.hold!=null){ h.x+=(h.hold-6-h.x)*Math.min(1,dt*8); }
    z.spot=h.seat?3:h.hold!=null?(h.corner?2:1):0; if(z.T>3) z.best=Math.max(z.best,z.spot); TR.spot=Math.max(TR.spot,z.best); TR.spotName=['стоя','у поручня','в углу','сидя'][TR.spot];
    for(const s of z.slots){ s.near=Math.abs(h.x-s.x)<40; }
    // конечная: сонливость
    if(z.terminal&&h.seat&&!z.arrive){ z.sleep=Math.min(1,z.sleep+dt*.07); if(z.sleep>.6&&!z.zzz){ z.zzz=1; say('Глаза слипаются… жми «ПРОСНУТЬСЯ»!',1.6,'#9cf'); } } else z.sleep=Math.max(0,z.sleep-dt*.2);
    // прибытие
    if(z.T>=z.ride&&!z.arrive){ if(z.terminal) tev('terminal_ok'); if(z.terminal&&z.sleep>=.95){ return tripFinish(false,'depot'); } z.arrive=true; z.arrT=9; SFX.doors(); say('Ваша станция! Выход — к дверям',1.8,P.neonLime); }
    if(z.arrive){ z.arrT-=dt; if(z.arrT<=0){ tev('overshoot'); z.arrive=false; z.T=z.ride-8; TR.tLeft-=20; say('Проехал! −20 с, обратно…',2,P.red); SFX.hurt(); } }
    const dn=z.doorsX.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a); z.atExit=z.arrive&&!h.seat&&Math.abs(h.x-dn)<14&&h.y<z.y0+16;
    z.hint=z.arrive?'К ДВЕРИ И «ВЫЙТИ»':z.terminal&&h.seat?'не спи! '+Math.round(z.sleep*100)+'% сна':'ехать ещё '+Math.max(0,Math.ceil(z.ride-z.T))+' с · ты: '+['стоишь','у поручня','в углу','сидишь'][z.spot];
  },
  ctx(z){ const h=G.hero, r={};
    if(z.atExit) { r.b={label:'ВЫЙТИ',col:'#2aa860',fn:()=>{ if(!z.fin){ tev('exit_car'); z.fin=1; h.seat=null; h.hold=null; zoneDone(); } }}; return r; }
    if(h.seat){ if(z.terminal&&z.sleep>.3) r.b={label:'ПРОСНУТЬСЯ',col:'#d87a20',fn:()=>{ tev('wake'); z.sleep=Math.max(0,z.sleep-.18); shake(1); }};
      else { const g=z.npcs.find(e=>e.type==='granny'&&!e.sit&&Math.abs(e.x-h.x)<36); if(g){ if(!g.bub) bubble(g,'Ох, мои ноги…',1.4); r.b={label:'УСТУПИТЬ',col:'#2aa860',fn:()=>{ const s=h.seat; h.seat=null; s.occ=g; g.sit=s; g.pin=true; g.seek=undefined; g.hx=undefined; h.y=z.y0+16; TR.polite++; tev('give_seat'); pop('ВЕЖЛИВОСТЬ +20',h.x,h.y-56,P.neonLime,8); bubble(g,'Дай бог здоровья!',1.4); }}; } } return r; }
    if(z.arrive) return r;
    const s=z.slots.find(s=>!s.occ&&Math.abs(s.x-h.x)<12&&h.y<z.y0+14); if(s){ r.b={label:'СЕСТЬ',col:'#2aa860',fn:()=>{ if(s.occ) return; for(const o of z.slots) if(o.occ==='hero') o.occ=null; tev('sit'); s.occ='hero'; h.seat=s; h.hold=null; h.pin=true; pop('СЕЛ!',h.x,h.y-50,P.neonLime,9); SFX.pick(); }}; return r; }
    if(z.gangway&&!z.egg&&h.x>z.len-30){ r.b={label:'ЗАГЛЯНУТЬ В ТАМБУР',col:'#9b4dff',fn:()=>{ tev('gangway'); z.egg=1; TR.eggs.push('gangway'); say(pick(['Там хор ветеранов поёт «Подмосковные…»','Там рыбак с удочкой: «Клюёт только на Кольцевой»']),2.6,'#c9f'); SFX.win(); }}; return r; }
    const p=z.poles.find(x=>Math.abs(x-h.x)<12); const corner=h.x<38||h.x>z.len-38;
    if(h.hold==null&&(p!==undefined||corner)) r.b={label:corner?'В УГОЛ':'ДЕРЖАТЬСЯ',col:'#3a6ad8',fn:()=>{ tev(corner?'corner':'hold'); h.hold=corner?h.x+6:p; h.corner=corner; pop(corner?'УГОЛ!':'ДЕРЖУСЬ',h.x,h.y-50,'#9cf',8); }};
    return r; },
  prog(z){ return z.T*10+z.spot*20+(z.arrive?-Math.abs(G.hero.x-z.doorsX[0])*.1:0); },
  unstick(z){ const h=G.hero; if(z.arrive){ h.seat=null; h.hold=null; h.x=z.doorsX.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a); h.y=z.y0+6; if(!z.fin){ z.fin=1; zoneDone(); } } else z.T+=4; },
  bot(z){ const h=G.hero, r={x:h.x,y:h.y};
    if(z.arrive){ if(h.seat&&!z.atExit){ r.stick={x:0,y:1}; return r; } const dn=z.doorsX.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a); r.x=dn; r.y=z.y0+4; if(z.atExit) r.b=1; return r; }
    if(h.seat){ if(z.ctxB) r.b=Math.random()<.5?1:0; if(z.ctxB&&z.ctxB.label==='УСТУПИТЬ') r.b=Math.random()<.02?1:0; return r; }
    if(z.gangway&&!z.egg){ r.x=z.len-20; r.y=z.y0+12; if(z.ctxB) r.b=1; return r; }
    const f=z.slots.filter(s=>!s.occ).sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x))[0]; if(f){ r.x=f.x; r.y=z.y0+4; if(z.ctxB&&z.ctxB.label==='СЕСТЬ') r.b=1; return r; }
    if(h.hold==null){ const p=z.poles.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a); r.x=p; r.y=z.y0+16; if(z.ctxB) r.b=1; } return r; },
  draw(z){ const lc=LINE_COL[TR.line%10], c=G.cam, sh=z.swT<.3?Math.round(Math.sin(G.t*60)):0;
    ctx.fillStyle='#d9d2c0'; ctx.fillRect(0,0,W,FY0); ctx.fillStyle='#bfb6a2'; ctx.fillRect(0,0,W,10); ctx.fillStyle=P.lampHot; for(let x=-(Math.round(c)%60);x<W;x+=60) ctx.fillRect(x+10,3,36,3);
    for(let x=24;x<z.len;x+=100){ const sx=Math.round(x-c); ctx.fillStyle=P.ink; ctx.fillRect(sx+2,22+sh,62,40); ctx.fillStyle=z.stopT>0||z.arrive?'#c8bca0':'#1a1424'; ctx.fillRect(sx+4,24+sh,58,36); if(!(z.stopT>0||z.arrive)){ const tl=(BG.t*300+x*3)%58; ctx.fillStyle=P.lamp; ctx.fillRect(sx+4+tl,40+sh,2,2); } ctx.fillStyle=lc; ctx.fillRect(sx+2,64,62,2); }
    for(const dx of z.doorsX){ const sx=Math.round(dx-c), op=z.stopT>0||z.arrive; ctx.fillStyle=P.ink; ctx.fillRect(sx-13,FY0-74,26,72); ctx.fillStyle=op?'#c8bca0':'#8a8a9a'; ctx.fillRect(sx-12,FY0-73,24,70); if(!op){ ctx.fillStyle=P.ink; ctx.fillRect(sx,FY0-73,1,70); ctx.fillStyle='#bfe0ff'; ctx.fillRect(sx-9,FY0-66,6,22); ctx.fillRect(sx+4,FY0-66,6,22); } if(z.arrive) goalArrow(dx,FY0-84,P.neonLime); }
    if(z.gangway){ const sx=Math.round(z.len-14-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,FY0-76,18,74); ctx.fillStyle='#6a5a7a'; ctx.fillRect(sx-3,FY0-75,16,72); G.labels.push(['ТАМБУР',sx+4,FY0-82,6,'#c9f']); }
    // сиденья
    for(let bx=24;bx+66<z.len-24;bx+=100){ const sx=Math.round(bx-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-1,FY0-26,68,22); ctx.fillStyle=shade(lc,-.2); ctx.fillRect(sx,FY0-25,66,12); ctx.fillStyle=shade(lc,-.45); ctx.fillRect(sx,FY0-13,66,8); }
    for(const s of z.slots) if(!s.occ){ const sx=Math.round(s.x-c), on=Math.floor(G.t*4)%2; ctx.fillStyle=P.ink; ctx.fillRect(sx-11,FY0-28,22,17); ctx.fillStyle=on?P.neonLime:'#7aff9a'; ctx.fillRect(sx-10,FY0-27,20,15); G.labels.push(['МЕСТО',sx,FY0-36,8,P.neonLime]); goalArrow(s.x,FY0-44,P.neonLime); }
    ctx.fillStyle='#7a6a5a'; ctx.fillRect(0,FY0,W,H-FY0); persFloor(c,'#5a4a3a',30); floorAO();
    for(const p of z.poles){ const sx=Math.round(p-c), hi=!G.hero.seat&&G.hero.hold==null&&Math.abs(p-G.hero.x)<60; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,0,4,FY1); ctx.fillStyle=hi?(Math.floor(G.t*4)%2?'#9cf':'#fff'):'#d8d8e8'; ctx.fillRect(sx,0,2,FY1); if(hi) G.labels.push(['ПОРУЧЕНЬ',sx,FY0+4,6,'#9cf']); }
    ctx.fillStyle=P.ink; ctx.fillRect(0,12,W,2); ctx.fillStyle='#d8d8e8'; ctx.fillRect(0,12,W,1);
    drawTripActors([G.hero,...z.npcs]);
    if(z.terminal&&G.hero.seat&&z.sleep>.2){ ctx.fillStyle='rgba(10,6,30,'+(z.sleep*.6)+')'; ctx.fillRect(0,0,W,H); G.labels.push(['Z z z',Math.round(G.hero.x-c)+14,G.hero.y-60,8,'#9cf']); }
    if(z.swT<1.6&&!z.arrive){ const bl=Math.floor(G.t*6)%2, cx=Math.round(W/2), cy=58; ctx.fillStyle=P.ink; ctx.beginPath(); ctx.moveTo(cx,cy-16); ctx.lineTo(cx+18,cy+14); ctx.lineTo(cx-18,cy+14); ctx.fill(); ctx.fillStyle=bl?'#ffd23f':'#ff8a1f'; ctx.beginPath(); ctx.moveTo(cx,cy-12); ctx.lineTo(cx+14,cy+12); ctx.lineTo(cx-14,cy+12); ctx.fill(); G.labels.push(['!',cx,cy+3,12,P.ink,'center',null]); G.labels.push([(z.warnS||'ТОРМОЖЕНИЕ')+' — ДЕРЖИСЬ',cx,cy+26,9,'#ffd23f']); }
  } };
