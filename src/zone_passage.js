'use strict';
// ================= ЗОНА: ПЕРЕХОД (ларьки, музыкант, траволатор, ремонт, служебка, находки, автомат) =================
ZONES.passage={ title:z=>z.title||(z.flow==='headon'?'УЗКИЙ ПЕРЕХОД':'ПЕРЕХОД'),
  tip:z=>z.flow==='headon'?'жди просвет во встречном потоке или ТОЛКАЙ':'держись свободной стороны; у музыканта — ЧАЕВЫЕ',
  init(z){ const F=z.feat; z.len=Math.max(W,360+F.length*170+(z.flow==='headon'?120:0)); z.seg={}; let x=200; for(const f of F){ z.seg[f]=x; x+=170; }
    if(z.flow==='headon'){ const m=(z.y0+z.y1)/2; z.ny0=m-12; z.ny1=m+12; z.hx0=x-60; z.hx1=z.len-50; z.solids.push([z.hx0,z.y0-10,z.hx1,z.ny0-1],[z.hx0,z.ny1+1,z.hx1,z.y1+10]); }
    // потоки
    const n=10+Math.min(20,Math.round(z.d*.7))+Math.floor(z.d/8)*3; for(let i=0;i<n;i++){ const e=mkNpc(qType(z.d),rnd(40,z.len-20),rnd(z.y0,z.y1)); e.dir=e.y<(z.y0+z.y1)/2?-1:1; if(z.flow==='headon'&&e.x>z.hx0) { e.dir=-1; e.y=rnd(z.ny0,z.ny1); } e.sp=rnd(24,40); e.flow=1; z.npcs.push(e); }
    if(F.includes('kiosk')){ const k=z.seg.kiosk; z.kiosk=[k-50,k+70]; const v=mkNpc('aunt',k+10,z.y0+4); v.vendor=1; v.hx=k+10; z.npcs.push(v); z.vendor=v; z.vT=2; }
    if(F.includes('musician')){ const m=z.seg.musician, my=(z.y0+z.y1)/2; const mu=mkNpc('musician',m,my); mu.pin=true; mu.m=30; z.npcs.push(mu); z.mus=mu; z.ring=[]; for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; const e=mkNpc(pick(['polite','student','tourist','aunt','kid']),m+Math.cos(a)*26,clamp(my+Math.sin(a)*18,z.y0,z.y1)); e.pin=true; e.m=8; e.ring=1; e.face=Math.cos(a)>0?-1:1; z.npcs.push(e); z.ring.push(e); } z.tipped=false; }
    if(F.includes('walkway')){ const w=z.seg.walkway; z.ww=[w-60,w+110]; z.wy=[z.y0+14,z.y1-14]; for(let i=0;i<2+(z.d>12?1:0);i++){ const e=mkNpc(pick(['tourist','aunt','statue']),w-30+i*50,(z.wy[0]+z.wy[1])/2+rnd(-4,4)); e.onWW=1; e.pin=true; e.m=5; z.npcs.push(e); } }
    if(F.includes('repairs')){ const r=z.seg.repairs; const gapTop=Math.random()<.5; const gy=gapTop?z.y0+4:z.y1-4; z.rep={x:r,gapTop}; z.solids.push(gapTop?[r-4,z.y0+16,r+4,z.y1+10]:[r-4,z.y0-10,r+4,z.y1-16]); z.solids.push([r+40,gapTop?z.y1-14:z.y0-10,r+48,gapTop?z.y1+10:z.y0+14]); }
    if(F.includes('service')){ z.svc={x:z.seg.service,used:false}; }
    if(F.includes('lost')){ z.lost={x:z.seg.lost,used:false}; }
    if(F.includes('vendp')){ z.vend={x:z.seg.vendp,used:false}; z.solids.push([z.vend.x-9,z.y0-12,z.vend.x+9,z.y0+1]); } },
  update(z,dt){ const h=G.hero;
    for(const e of z.npcs){ if(e.flow){ if(e.blockT>0){ e.blockT-=dt; e.set('idle'); continue; } { const dx=(G.hero.x-e.x)*e.dir; if(dx>0&&dx<18&&Math.abs(G.hero.y-e.y)<10&&z.flow!=='headon'){ e.y+=(e.y<G.hero.y?-1:1)*26*dt; } } if(z.rep&&e.x>z.rep.x-30&&e.x<z.rep.x+70){ const gy=z.rep.gapTop?z.y0+5:z.y1-5; e.y+=(gy-e.y)*Math.min(1,dt*3); }
        e.stk=(e.stk||0)+dt; if(e.stk>1){ if(Math.abs(e.x-(e.lx||0))<6){ e.noSolid=true; e.nsT=2; } e.lx=e.x; e.stk=0; } if(e.nsT>0){ e.nsT-=dt; if(e.nsT<=0) e.noSolid=false; }
        e.x+=e.dir*e.sp*dt; e.face=e.dir; e.set('walk'); if(e.x<-8||e.x>z.len+8){ e.x=e.dir<0?z.len+6:-6; if(z.flow==='headon'&&e.dir<0){ e.y=rnd(z.ny0,z.ny1); } else e.y=e.dir<0?rnd(z.y0,(z.y0+z.y1)/2):rnd((z.y0+z.y1)/2,z.y1); } }
      else if(e.onWW&&!e.ring){ e.x+=40*dt; if(e.x>z.ww[1]){ e.x=z.ww[0]+4; pop('ОЙ!',e.x+100,e.y-50,'#fff',6); } e.set('idle'); }
      else if(e.parting){ walkTo(e,e.px,e.py,50,dt); } }
    z.slow=1; z.wet=false;
    // ларьки: запах и продавец
    if(z.kiosk){ if(h.x>z.kiosk[0]&&h.x<z.kiosk[1]){ z.slow=.62; if(!z.smell){ z.smell=1; tev('kiosk_smell'); pop('ЗАПАХ ШАУРМЫ…',h.x,h.y-52,'#ffb84a',8); } } const v=z.vendor; z.vT-=dt; if(z.vT<=0){ z.vT=rnd(2.2,3.6); if(Math.abs(v.x-h.x)<90){ v.hx=clamp(h.x+30*h.face,z.kiosk[0],z.kiosk[1]); v.hy=h.y; tev('vendor'); bubble(v,pick(['Шаурма горячая!','Чебурек, молодой человек!','Беляш — три по цене двух!']),1.6,'#ffb84a'); } }
      walkTo(v,v.hx,v.hy||z.y0+4,40,dt); }
    // траволатор
    if(z.ww){ const on=h.x>z.ww[0]&&h.x<z.ww[1]&&h.y>z.wy[0]-4&&h.y<z.wy[1]+4; if(on){ h.x+=46*dt; if(!z.onW) tev('walkway'); z.onW=1; } else if(z.onW&&h.x>=z.ww[1]){ z.onW=0; if(Math.random()<.55&&!h.stun){ tev('ww_stumble'); h.stun=.7; pop('СПОТКНУЛСЯ!',h.x,h.y-50,'#ff9a3a',8); SFX.land(); } } else z.onW=0; }
    // музыкант
    if(z.mus&&!z.tipped&&Math.abs(h.x-z.mus.x)<60&&!z.said){ z.said=1; bubble(z.mus,'♪ Группа крови на рукаве… ♪',3,'#c9f'); }
    // служебка — пойман?
    if(z.svcT>0){ z.svcT-=dt; if(z.svcT<=0) z.lockHero=false; }
    if(z.rep&&!z.repP&&h.x>z.rep.x+50){ z.repP=1; tev('rep_pass'); } if(z.flow==='headon'&&!z.hoP&&h.x>z.hx1){ z.hoP=1; tev('headon_pass'); }
    if(h.x>z.len-26) zoneDone();
    z.hint=z.kiosk&&z.slow<1?'пахнет… но не останавливайся!':z.mus&&!z.tipped&&Math.abs(h.x-z.mus.x)<90?'зеваки у музыканта: ЧАЕВЫЕ или обходи':z.title==='ПОДЗЕМНЫЙ ПЕРЕХОД'?'через переход →':'на другую линию →';
  },
  ctx(z){ const h=G.hero, w=wallet(), r={};
    if(z.mus&&!z.tipped&&Math.abs(h.x-z.mus.x)<70){ r.b={label:w.coins>=1?'ЧАЕВЫЕ · 1 мон.':'ХЛОПНУТЬ В ЛАДОШИ',col:'#9b4dff',fn:()=>{ if(w.coins>=1){ w.coins--; store(); } tev('mus_tip'); z.tipped=true; TR.polite++; bubble(z.mus,'Спасибо, брат! Расступитесь!',1.6,'#c9f'); for(const e of z.ring){ e.parting=1; e.px=e.x+(e.x<z.mus.x?-30:30); e.py=e.y<z.mus.y?z.y0:z.y1; e.pin=false; e.m=1; } SFX.coin(); }}; return r; }
    if(z.ww&&z.onW){ const b=z.npcs.find(e=>e.onWW&&e.x>h.x&&e.x-h.x<24&&Math.abs(e.y-h.y)<10); if(b){ r.b={label:'ПЕРЕШАГНУТЬ',col:'#3a6ad8',fn:()=>{ tev('ww_step'); h.x=b.x+16; h.z=0; pop('ХОП!',h.x,h.y-50,'#fff',8); TR.scandal+=6; bubble(b,'Ну вы и акробат!',1); }}; return r; } }
    if(z.svc&&!z.svc.used&&Math.abs(h.x-z.svc.x)<18&&h.y<z.y0+14){ r.b={label:'СРЕЗАТЬ СЛУЖЕБКОЙ',col:'#d87a20',fn:()=>{ z.svc.used=true; if(Math.random()<.65){ h.x=Math.min(z.len-30,h.x+170); tev('svc_ok'); h.y=(z.y0+z.y1)/2; pop('СРЕЗАЛ!',h.x,h.y-52,P.neonLime,9); SFX.pick(); } else { tev('svc_caught'); h.x=Math.max(10,h.x-80); h.stun=1.2; z.svcT=1.2; say('«А НУ НАЗАД! Тут служебное!» — вернули',2,P.red); SFX.hurt(); haptic('error'); } }}; return r; }
    if(z.lost&&!z.lost.used&&Math.abs(h.x-z.lost.x)<18&&h.y<z.y0+14){ r.b={label:'БЮРО НАХОДОК',col:'#2aa860',fn:()=>{ tev('lost'); z.lost.used=true; TR.found++; const k=ri(0,2); if(k===0){ w.coins+=5; say('Нашёл 5 монет в чужой варежке!',1.8,P.neonLime); } else if(k===1){ save.hats=save.hats||[]; const hat=pick(['ушанка','кепка таксиста','панама']); if(!save.hats.includes(hat)) save.hats.push(hat); say('Шапка в коллекцию: «'+hat+'»!',1.8,P.neonLime); } else { TR.boost=12; say('Чужой самокат… ой, кроссовки! +скорость',1.8,P.neonLime); } store(); SFX.pick(); }}; return r; }
    if(z.vend&&!z.vend.used&&Math.abs(h.x-z.vend.x)<16&&h.y<z.y0+14&&w.coins>=3){ r.b={label:'КОФЕ · 3 мон.',col:'#8a5a2e',fn:()=>{ tev('vendp'); w.coins-=3; z.vend.used=true; store(); if(Math.random()<.22) say('АВТОМАТ СЪЕЛ МОНЕТУ!',1.6,P.red); else { TR.boost=14; pop('КОФЕ!',h.x,h.y-56,'#ffb84a',8); } }}; return r; }
    return r; },
  prog(z){ return G.hero.x; },
  unstick(z){ const h=G.hero; h.x=Math.min(z.len-20,h.x+60); h.y=z.flow==='headon'&&h.x>z.hx0?(z.ny0+z.ny1)/2:h.y; for(const e of z.npcs) if(e.flow&&Math.abs(e.x-h.x)<30) e.y=e.y<h.y?z.y0:z.y1; if(z.ring&&!z.tipped&&Math.abs(h.x-z.mus.x)<80) { h.x=z.mus.x+50; } },
  bot(z){ const h=G.hero, r={x:z.len,y:(z.y0+z.y1)/2+8};
    if(z.mus&&!z.tipped&&h.x<z.mus.x&&z.mus.x-h.x<70){ r.x=h.x; if(z.ctxB) r.b=1; return r; }
    const topT=(tx)=>{ r.x=tx; r.y=Math.abs(h.x-tx)>22&&!(z.rep&&h.x<z.rep.x+52&&h.x>z.rep.x-80)?z.y1-6:z.y0+4; if(z.rep&&h.x<z.rep.x+52&&h.x>z.rep.x-80){ r.y=h.x<z.rep.x+4?(z.rep.gapTop?z.y0+4:z.y1-4):(z.rep.gapTop?z.y0+4:z.y1-4); } if(z.ctxB) r.b=1; return r; };
    if(z.svc&&!z.svc.used&&h.x<z.svc.x+10&&Math.abs(h.x-z.svc.x)<200) return topT(z.svc.x);
    if(z.lost&&!z.lost.used&&h.x<z.lost.x+10) return topT(z.lost.x);
    if(z.ww&&z.ctxB&&z.ctxB.label==='ПЕРЕШАГНУТЬ'){ r.b=1; return r; } if(z.ww&&h.x<z.ww[1]&&h.x>z.ww[0]-40){ r.y=(z.wy[0]+z.wy[1])/2+12; }
    if(z.rep&&h.x<z.rep.x+50&&h.x>z.rep.x-80){ r.y=h.x<z.rep.x+4?(z.rep.gapTop?z.y0+4:z.y1-4):(z.rep.gapTop?z.y1-2:z.y0+2); r.y=h.x>=z.rep.x+4&&h.x<z.rep.x+52?(z.rep.gapTop?z.y0+4:z.y1-4):r.y; }
    if(z.flow==='headon'&&h.x>z.hx0-30) { r.y=(z.ny0+z.ny1)/2; if(h.den>2&&Math.random()<.06) r.a=1; }
    else { for(const e of z.npcs){ if(e.flow&&e.dir<0&&e.x>h.x&&e.x<h.x+30&&Math.abs(e.y-h.y)<10) r.y=clamp(h.y+(e.y>h.y?-16:16),z.y0,z.y1); } }
    return r; },
  draw(z){ const c=G.cam, lc=LINE_COL[TR.line%10], wb=FY0-4; hallBG(z,{wall:'#cfc8d8',grout:'#b8b0c4',floor:'#6a6474'});
    wallSign(40,44,150,14,'ПЕРЕХОД · ДЕРЖИТЕСЬ ПРАВЕЕ',lc,'#fff',7);
    if(z.kiosk){ for(let x=z.kiosk[0];x<z.kiosk[1];x+=40){ const sx=Math.round(x-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-1,wb-62,38,60); ctx.fillStyle=['#d8a020','#c84a3a','#3a8a5a'][(x/40|0)%3]; ctx.fillRect(sx,wb-61,36,12); ctx.fillStyle='#ffe9a8'; ctx.fillRect(sx+2,wb-46,32,30); ctx.fillStyle='#8a5a3a'; ctx.fillRect(sx,wb-14,36,12); }
      G.labels.push(['ШАУРМА · ЧЕБУРЕКИ · ЧЕХЛЫ',Math.round((z.kiosk[0]+z.kiosk[1])/2-c),wb-68,6,'#ffb84a']); if(Math.floor(G.t*3)%2){ ctx.fillStyle='rgba(255,200,120,.10)'; ctx.fillRect(Math.round(z.kiosk[0]-c),FY0,z.kiosk[1]-z.kiosk[0],FY1-FY0); } }
    if(z.svc){ const sx=Math.round(z.svc.x-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-12,wb-60,24,60); ctx.fillStyle=z.svc.used?'#5a5a6a':'#7a8a7a'; ctx.fillRect(sx-11,wb-59,22,58); G.labels.push(['СЛУЖЕБНЫЙ',sx,wb-66,6,P.red]); }
    if(z.lost){ const sx=Math.round(z.lost.x-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-22,wb-56,44,52); ctx.fillStyle='#6a4a3a'; ctx.fillRect(sx-21,wb-55,42,50); ctx.fillStyle='#ffe9a8'; ctx.fillRect(sx-16,wb-48,32,18); ctx.fillStyle='#c84a3a'; ctx.fillRect(sx-12,wb-44,8,6); ctx.fillStyle='#3d6ff0'; ctx.fillRect(sx+2,wb-42,10,8); G.labels.push(['БЮРО НАХОДОК',sx,wb-62,6,P.edge]); }
    if(z.vend){ const vx=Math.round(z.vend.x-c); ctx.fillStyle=P.ink; ctx.fillRect(vx-10,wb-46,20,48); ctx.fillStyle='#8a2a2a'; ctx.fillRect(vx-9,wb-45,18,46); ctx.fillStyle='#ffe9a8'; ctx.fillRect(vx-6,wb-40,12,14); G.labels.push(['КОФЕ',vx,wb-52,6,'#ffb84a']); }
    hallLight();
    if(z.ww){ const a=Math.round(z.ww[0]-c), b=Math.round(z.ww[1]-c); ctx.fillStyle=P.ink; ctx.fillRect(a,Math.round(z.wy[0])-2,b-a,Math.round(z.wy[1]-z.wy[0])+4); ctx.fillStyle='#4a4a5a'; ctx.fillRect(a+1,Math.round(z.wy[0])-1,b-a-2,Math.round(z.wy[1]-z.wy[0])+2); ctx.fillStyle='#6a6a7a'; for(let x=a+((BG.t*46)%8);x<b;x+=8) ctx.fillRect(Math.round(x),Math.round(z.wy[0]),2,Math.round(z.wy[1]-z.wy[0])); G.labels.push(['ТРАВОЛАТОР →',(a+b)/2,Math.round(z.wy[0])-8,6,'#fff']); }
    if(z.rep){ const sx=Math.round(z.rep.x-c); for(const s of z.solids.filter(s=>s[0]>=z.rep.x-4&&s[0]<=z.rep.x+40)){ const x=Math.round(s[0]-c); const y1=Math.round(Math.max(s[1],FY0)), y2=Math.round(Math.min(s[3],FY1)); for(let y=y1;y<y2;y+=6){ ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-16,12,18); ctx.fillStyle=(y/6|0)%2?'#ff8a1f':'#fff'; ctx.fillRect(x-1,y-15,10,16); } }
      G.labels.push(['ОБХОД →',sx+70,z.rep.gapTop?FY1-30:FY0-14,7,'#ff8a1f']); G.labels.push(['РЕМОНТ',sx,FY0-20,7,P.red]); }
    if(z.flow==='headon'){ const a=Math.round(z.hx0-c), b=Math.round(z.hx1-c); ctx.fillStyle='#3a3046'; ctx.fillRect(a,FY0,b-a,Math.round(z.ny0-FY0)-6); ctx.fillRect(a,Math.round(z.ny1)+1,b-a,FY1-z.ny1+8); G.labels.push(['УЗКО · ВСТРЕЧНЫЙ ПОТОК',(a+b)/2,FY0-12,7,P.edge]); }
    drawTripActors([G.hero,...z.npcs]);
    if(z.mus&&!z.tipped) G.labels.push(['ЗЕВАКИ',Math.round(z.mus.x-c),z.mus.y-74,7,'#c9f']);
    goalArrow(z.len-30,FY0-20); } };
// ================= ЗОНА: ПРОБИТЬСЯ (20 с, вагон, двери открыты 8 с) =================
ZONES.escape={ title:z=>'ПРОБЕЙСЯ К ДВЕРИ!',
  tip:z=>'ТОЛКАЙ и иди к двери; на открытой — «ВЫЙТИ»',
  init(z){ z.len=W; z.doorX=Math.round(W*.78); z.op=0; z.openAt=6; z.openFor=8; z.out=false; G.hero.x=36; G.hero.y=z.y1-4;
    for(let i=0;i<18;i++){ const e=mkNpc(qType(10+i),rnd(60,W-20),rnd(z.y0,z.y1)); e.hx=e.x; e.hy=e.y; z.npcs.push(e); } },
  update(z,dt){ const h=G.hero; z.op=z.t>=z.openAt&&z.t<z.openAt+z.openFor; for(const e of z.npcs){ walkTo(e,e.hx,e.hy,10,dt); }
    if(z.t>=z.openAt+z.openFor&&!z.out) return tripFinish(false,'doors');
    z.atDoor=z.op&&Math.abs(h.x-z.doorX)<14&&h.y<z.y0+14;
    z.hint=z.op?'ДВЕРИ ОТКРЫТЫ! '+Math.ceil(z.openAt+z.openFor-z.t)+' с':'двери откроются через '+Math.ceil(z.openAt-z.t)+' с — пробивайся!'; },
  ctx(z){ return z.atDoor?{b:{label:'ВЫЙТИ',col:'#2aa860',fn:()=>{ z.out=true; TR.escT=TR.tTotal-TR.tLeft; tripFinish(true); }}}:{}; },
  prog(z){ return -Math.abs(G.hero.x-z.doorX)-Math.abs(G.hero.y-z.y0); }, unstick(z){ for(const e of z.npcs) if(Math.abs(e.x-G.hero.x)<30) e.hy=e.y=e.y<G.hero.y?z.y0:z.y1; },
  bot(z){ const h=G.hero; return {x:z.doorX,y:z.y0+2,b:z.atDoor?1:0,a:h.den>2&&Math.random()<.08?1:0}; },
  draw(z){ ZONES.car.draw.call(ZONES.car,{len:z.len,slots:[],poles:[Math.round(W*.3)],doorsX:[z.doorX],stopT:z.op?1:0,arrive:z.op,swT:9,npcs:z.npcs}); } };
let escBestShown=0;
function startEscape(){ startTrip(0,{mode:'escape',zones:[{k:'escape'}]}); TR.tTotal=TR.tLeft=20; TR.name='Пробиться'; }
function escapeFinish(win){ if(win){ const t=Math.round(TR.escT*10)/10; TR.escNew=!save.escBest||t<save.escBest; if(TR.escNew) save.escBest=t; wallet().coins+=2; TR.coinsGot=2; G.score=TR.score=Math.round(200-t*8); SFX.win(); } else SFX.ko(); store(); }
startExit=function(){ startEscape(); };
