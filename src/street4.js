// M2 «Улица»: сегменты улица-1/улица-2 из зон 'street' (одно событие на зону), фасады-параллакс, тротуар 3 полосы глубины,
// проезжая часть на переднем плане, переулок с зеброй и светофором. События — в SEV (этот файл и street4ev.js).
const ST4={ cache:new Map() };
const ST4P={asph:'#3b3a44',asphHi:'#4a4954',curb:'#9a98a6',curbSh:'#6a6876',brick:'#b0573f',brickSh:'#8a3f2c',panel:'#c8c2b0',panelSh:'#a39d8c',win:'#2a3346',winLit:'#ffd98a',frame:'#e8e4d8',sky:'#9fc4e8',skyLo:'#d8e6f0'};
const SEV={}; // события улицы: {init,update,draw(z,layer),bot,ctx,tip,title,prog}
// геометрия улицы: полосы глубины тротуара y0..y1 (3 полосы), бордюр, дорога снизу
// M2-ревью: дорога целиком над нижним рядом кнопок (A: H-34…H-2): ближняя полоса — колёса на H-36, дальняя −12; тротуар 38 px над бордюром; фасады ниже/короче
function st4Geo(){ const bot=H-Math.min(SA.b||0,6), carY=bot-36, roadY=carY-30, curbY=roadY-3, y1=curbY-3, y0=y1-38; return {y0,y1,lane:[y0+5,Math.round((y0+y1)/2),y1-4],curbY,roadY,carY,farY:carY-12,kerb2:carY+3,facadeB:y0-2,bot}; }
function st4Lane(y){ const g=st4Geo(); return y<g.y0+(g.y1-g.y0)/3?0:y<g.y0+2*(g.y1-g.y0)/3?1:2; }
function st4Rng(z){ return mulberry32((z.seed>>>0)||1); }
// ---------- фасады (кэш длинной полосы на зону) ----------
const ST4_SIGNS=['ПРОДУКТЫ 24','ШАУРМА','АПТЕКА','ОПТИКА','ЦВЕТЫ','РЕМОНТ ОБУВИ','ШИНОМОНТАЖ','ПЕЛЬМЕННАЯ','ЗООТОВАРЫ','КОПИ-ЦЕНТР'];
function st4Facade(z){ const g=st4Geo(), key='f|'+z.len+'|'+g.facadeB+'|'+z.seed+'|'+(z.gaps||[]).map(q=>q.join(':')).join(','); let c=ST4.cache.get(key); if(c) return c; if(ST4.cache.size>24) ST4.cache.clear();
  const r=st4Rng(z), Hh=g.facadeB, [cv,x]=mkc(z.len+40,Hh); z.houses=[]; let px=-20;
  while(px<z.len+40){ let w=Math.round(90+r()*90); const gap=(z.gaps||[]).find(q=>px+w>q[0]-6&&px<q[1]); if(gap){ if(px<gap[0]-30){ w=gap[0]-px; } else { px=gap[1]; continue; } }
    const h=Math.round(Hh*(.55+r()*.4)), top=Hh-h, kind=r()<.5?'brick':'panel', base=kind==='brick'?ST4P.brick:ST4P.panel, sh=kind==='brick'?ST4P.brickSh:ST4P.panelSh, X=px+20;
    x.fillStyle=P.ink; x.fillRect(X-1,top-1,w+2,h+1); x.fillStyle=base; x.fillRect(X,top,w,h); x.fillStyle=shade(base,.15); x.fillRect(X,top,Math.round(w*.3),h); x.fillStyle=sh; x.fillRect(X+w-Math.round(w*.2),top,Math.round(w*.2),h);
    if(kind==='brick'){ x.fillStyle=sh; for(let yy=top+3;yy<Hh;yy+=4) for(let xx=X+((yy>>2)%2)*4;xx<X+w;xx+=8) x.fillRect(xx,yy,3,1); } else { x.fillStyle=sh; for(let yy=top+18;yy<Hh;yy+=18) x.fillRect(X,yy,w,1); for(let xx=X+30;xx<X+w;xx+=30) x.fillRect(xx,top,1,h); }
    x.fillStyle=shade(base,-.35); x.fillRect(X-2,top,w+4,3); // карниз
    const shopH=26, ww=8, wh=10; // окна этажей
    for(let yy=top+8;yy<Hh-shopH-28;yy+=18) for(let xx=X+8;xx<X+w-ww-4;xx+=16){ x.fillStyle=ST4P.frame; x.fillRect(xx-1,yy-1,ww+2,wh+2); const lit=r()<.22; x.fillStyle=lit?ST4P.winLit:ST4P.win; x.fillRect(xx,yy,ww,wh); x.fillStyle=lit?'#fff2c4':'#3d4a66'; x.fillRect(xx,yy,3,1); x.fillStyle=ST4P.frame; x.fillRect(xx+ww/2,yy,1,wh); if(r()<.15){ x.fillStyle='#4a8a3a'; x.fillRect(xx,yy+wh-2,ww,2); } }
    // первый этаж: витрина + дверь + маркиза
    const sy=Hh-shopH; x.fillStyle=shade(base,-.2); x.fillRect(X,sy,w,shopH); x.fillStyle=P.ink; x.fillRect(X+6,sy+6,w-30,shopH-8); x.fillStyle='#5a7090'; x.fillRect(X+7,sy+7,w-32,shopH-10); x.fillStyle='#8fb0d0'; for(let k=0;k<3;k++) x.fillRect(X+10+k*5,sy+8+k,2,6);
    x.fillStyle=P.ink; x.fillRect(X+w-20,sy+4,14,shopH-4); x.fillStyle='#6a4a32'; x.fillRect(X+w-19,sy+5,12,shopH-5); x.fillStyle='#d0c060'; x.fillRect(X+w-10,sy+14,1,2);
    const aw=pick2(r,['#d8265e','#19b874','#3d6ff0','#ff9a1f']); for(let k=0;k<w-26;k+=6){ x.fillStyle=(k/6)%2?'#fff':aw; x.fillRect(X+4+k,sy-2,6,4); } x.fillStyle=P.ink; x.fillRect(X+4,sy+2,w-26,1);
    z.houses.push({x:X-20,w,top,sign:(()=>{ const used=z.houses.slice(-3).map(q=>q.sign); let k=Math.floor(r()*ST4_SIGNS.length); for(let t=0;t<ST4_SIGNS.length&&used.includes(ST4_SIGNS[k]);t++) k=(k+1)%ST4_SIGNS.length; return ST4_SIGNS[k]; })()}); px+=w+(r()<.3?Math.round(6+r()*14):0); }
  ST4.cache.set(key,cv); return cv; }
function pick2(r,a){ return a[Math.floor(r()*a.length)]; }
// дальний слой (параллакс .45): силуэты высоток + сквозь туман бледнее
function st4Far(z){ const g=st4Geo(), key='far|'+W+'|'+g.facadeB+'|'+(z.seed%7); let c=ST4.cache.get(key); if(c) return c; const r=mulberry32(z.seed%7+11), SW=Math.ceil(W*1.6+z.len*.5), [cv,x]=mkc(SW,g.facadeB);
  let px=0; while(px<SW){ const w=Math.round(30+r()*60), h=Math.round(g.facadeB*(.5+r()*.5)); x.fillStyle='#7a8aa8'; x.fillRect(px,g.facadeB-h,w,h); x.fillStyle='#8c9cba'; x.fillRect(px,g.facadeB-h,Math.round(w*.3),h); x.fillStyle='#9eacc6'; for(let yy=g.facadeB-h+5;yy<g.facadeB-4;yy+=7) for(let xx=px+4;xx<px+w-4;xx+=7) if(r()<.5) x.fillRect(xx,yy,3,3); if(r()<.2){ x.fillStyle='#7a8aa8'; x.fillRect(px+w/2-1,g.facadeB-h-10,2,10); } px+=w+Math.round(r()*10); }
  ST4.cache.set(key,cv); return cv; }
// тайлы атласа → паттерн
function st4Tile(name){ const key='t|'+name; let c=ST4.cache.get(key); if(c!==undefined) return c; if(!atlOk('pr')) return null; const r=ATL4.pr.f[name]; const [cv,x]=mkc(r[2],r[3]); x.drawImage(ATL4.pr.img,r[0],r[1],r[2],r[3],0,0,r[2],r[3]); c=ctx.createPattern(cv,'repeat'); ST4.cache.set(key,c); return c; }
function st4FillTile(name,col,x0,y0,w,h,ox){ const pt=st4Tile(name); ctx.save(); if(pt){ ctx.translate(-ox,y0); ctx.fillStyle=pt; ctx.fillRect(x0+ox,0,w,h); } else { ctx.fillStyle=col; ctx.fillRect(x0,y0,w,h); } ctx.restore(); }
// ---------- фон улицы ----------
function st4Sky(z){ const wt=z.weather, g=st4Geo(); const top={clear:'#8fbfe8',rain:'#7c8698',snow:'#b8c2d0',fog:'#c4c8cc'}[wt]||'#8fbfe8', lo={clear:'#d8eaf4',rain:'#a8b0bc',snow:'#e4e8ee',fog:'#d8dadc'}[wt]||'#d8eaf4';
  const key='sky|'+H+'|'+wt; let c=ST4.cache.get(key); if(!c){ const [cv,x]=mkc(8,g.facadeB); const gr=x.createLinearGradient(0,0,0,g.facadeB); gr.addColorStop(0,top); gr.addColorStop(1,lo); x.fillStyle=gr; x.fillRect(0,0,8,g.facadeB); ST4.cache.set(key,c=cv); }
  ctx.drawImage(c,0,0,W,g.facadeB); }
function st4Ground(z){ const g=st4Geo(), c=G.cam, ox=Math.round(c)%16;
  st4FillTile('t_paving','#8a8896',-16,g.facadeB,W+32,g.curbY-g.facadeB,Math.round(c)); // тротуар
  ctx.fillStyle='rgba(20,16,30,.18)'; ctx.fillRect(0,g.facadeB,W,3); // тень фасада
  st4FillTile('t_curb',ST4P.curb,-16,g.curbY,W+32,4,Math.round(c)); ctx.fillStyle=ST4P.curbSh; ctx.fillRect(0,g.curbY+3,W,1);
  st4FillTile('t_asphalt',ST4P.asph,-16,g.roadY,W+32,g.kerb2-g.roadY,Math.round(c*1.0));
  ctx.fillStyle='rgba(10,6,20,.22)'; ctx.fillRect(0,g.roadY,W,2); // тень бордюра на асфальте
  ctx.fillStyle='#e8e4d8'; const my=Math.round((g.roadY+g.carY)/2)+1; for(let x=-((Math.round(c))%40);x<W;x+=40) ctx.fillRect(x,my,20,1); // разметка между полосами
  // ближний бордюр и тротуар напротив (передний план под кнопками — без ключевых объектов)
  ctx.fillStyle=ST4P.curbSh; ctx.fillRect(0,g.kerb2,W,1); st4FillTile('t_curb',ST4P.curb,-16,g.kerb2+1,W+32,3,Math.round(c));
  st4FillTile('t_paving','#8a8896',-16,g.kerb2+4,W+32,H-g.kerb2-4,Math.round(c)); ctx.fillStyle='rgba(20,16,30,.16)'; ctx.fillRect(0,g.kerb2+4,W,H-g.kerb2-4);
  for(let x=-((Math.round(c))%96)+30;x<W+20;x+=96){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,g.kerb2+9,12,5); ctx.fillStyle='#4a4a56'; ctx.fillRect(x,g.kerb2+10,10,3); ctx.fillStyle='#2a2a34'; for(let k=1;k<10;k+=2) ctx.fillRect(x+k,g.kerb2+10,1,3); } // решётки ливнёвки
  if(z.weather==='rain'){ ctx.fillStyle='rgba(150,180,230,.10)'; ctx.fillRect(0,g.facadeB,W,g.curbY-g.facadeB); }
  if(z.weather==='snow'){ ctx.fillStyle='#eef2f8'; ctx.fillRect(0,g.facadeB,W,2); for(let x=-(Math.round(c)%23);x<W;x+=23) ctx.fillRect(x,g.curbY-2,9,2); } }
// переулок (просвет между домами) с асфальтом в глубину + зебра поперёк тротуара
function st4Alley(z,x0,x1,zebra){ const g=st4Geo(), c=G.cam, a=Math.round(x0-c), b=Math.round(x1-c); if(b<-20||a>W+20) return;
  ctx.fillStyle=ST4P.asph; ctx.beginPath(); ctx.moveTo(a+14,g.facadeB-40); ctx.lineTo(b-14,g.facadeB-40); ctx.lineTo(b,g.facadeB); ctx.lineTo(a,g.facadeB); ctx.fill();
  ctx.fillStyle='#55545e'; ctx.fillRect(a+14,g.facadeB-42,b-a-28,2); ctx.fillStyle='#e8e4d8'; ctx.fillRect(Math.round((a+b)/2),g.facadeB-34,1,4); ctx.fillRect(Math.round((a+b)/2),g.facadeB-24,1,5); ctx.fillRect(Math.round((a+b)/2),g.facadeB-12,1,6);
  ctx.fillStyle=ST4P.asph; ctx.fillRect(a,g.facadeB,b-a,g.roadY-g.facadeB+1); // проезд переулка поперёк тротуара до самой дороги (бордюр опущен)
  ctx.fillStyle='rgba(10,6,20,.18)'; ctx.fillRect(a,g.facadeB,b-a,2);
  if(zebra){ const cx=(a+b)/2, zt=g.y0-1, zb=g.y1+2, hw=(b-a)/2-5; // «зебра» в перспективе: полосы вдоль переулка, сходятся к точке схода вверху
    for(let k=-hw+2;k<=hw-3;k+=8){ for(let y=zt;y<zb;y++){ const t=(y-zt)/(zb-zt), kk=.86+.14*t, x=Math.round(cx+k*kk), w=Math.max(3,Math.round(5*kk)); ctx.fillStyle=y>=zb-2?'#c8c4b8':'#ece8dc'; ctx.fillRect(x,y,w,1); } }
    ctx.fillStyle='#e0b83a'; for(const tx of [a-7,b+3]) for(let y=g.y0;y<g.y1+2;y+=3){ ctx.fillRect(tx,y,4,2); } // жёлтая тактильная плитка у перехода
    ctx.fillStyle='#b08a20'; for(const tx of [a-7,b+3]) for(let y=g.y0+1;y<g.y1+2;y+=3){ ctx.fillRect(tx+1,y,1,1); ctx.fillRect(tx+3,y,1,1); } }
  ctx.fillStyle=ST4P.curbSh; ctx.fillRect(a-2,g.facadeB,2,g.roadY-g.facadeB+1); ctx.fillRect(b,g.facadeB,2,g.roadY-g.facadeB+1); ctx.fillStyle=ST4P.curb; ctx.fillRect(a-3,g.facadeB,1,g.roadY-g.facadeB+1); ctx.fillRect(b+2,g.facadeB,1,g.roadY-g.facadeB+1); }
// фонарные столбы переднего плана (параллакс 1.25), полупрозрачные при перекрытии героя
function st4Poles(z){ const g=st4Geo(), c=G.cam*1.25, h=G.hero, hx=Math.round(h.x-G.cam);
  for(let x=-(Math.round(c)%170)+60;x<W+20;x+=170){ const near=Math.abs(x-hx)<14; ctx.globalAlpha=near?.45:1; ctx.fillStyle=P.ink; ctx.fillRect(x-2,g.facadeB-78,5,H); ctx.fillStyle='#4a4a58'; ctx.fillRect(x-1,g.facadeB-77,3,H); ctx.fillStyle='#6a6a7a'; ctx.fillRect(x-1,g.facadeB-77,1,H);
    ctx.fillStyle=P.ink; ctx.fillRect(x-1,g.facadeB-80,14,3); ctx.fillStyle='#ffe9a8'; ctx.fillRect(x+9,g.facadeB-78,4,2); ctx.globalAlpha=1; } }
// машины на дороге переднего плана (полоса глубины ближе героя)
function st4CarsDraw(z){ if(!atlOk('tr')) return; const g=st4Geo(); for(const q of z.cars||[]){ const r=ATL4.tr.f[q.spr]; if(!r) continue; const sx=Math.round(q.x-G.cam), y=g.carY-r[3]+Math.round(Math.sin(G.t*9+q.x*.1)*.5);
  if(sx<-r[2]-4||sx>W+4) continue; ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(sx+3,g.carY-2,r[2]-6,3); atlDraw(ctx,'tr',q.spr,sx,y,q.dir<0);
  if(q.brake){ ctx.fillStyle='#ff3a3a'; ctx.fillRect(q.dir>0?sx:sx+r[2]-2,y+r[3]-12,2,2); } } }
function st4CarsTick(z,dt){ z.cars=z.cars||[]; if(z.carsOff){ z.cars=z.cars.filter(q=>q.spl); for(const q of z.cars) q.x+=q.dir*q.v*dt; return; } z.carT=(z.carT||rnd(1,3))-dt; const g=st4Geo();
  if(z.carT<=0&&z.cars.length<3){ const dir=Math.random()<.5?1:-1, spr=pick(['car_hatch','car_sedan','car_van','taxi','car_hatch_1']); const w=(ATL4.tr&&ATL4.tr.f[spr]||[0,0,60])[2]; z.cars.push({spr,dir,x:dir>0?G.cam-w-20:G.cam+W+20,v:rnd(90,130),w}); z.carT=rnd(2.2,4.5)*(z.weather==='snow'?1.4:1); }
  for(const q of z.cars){ q.x+=q.dir*q.v*dt; } z.cars=z.cars.filter(q=>q.x>G.cam-200&&q.x<G.cam+W+200); }
// ---------- зона ----------
ZONES.street={ title:z=>(SEV[z.ev]&&SEV[z.ev].title&&SEV[z.ev].title(z))||(z.seg==='street2'?'УЛИЦА · К ОФИСУ':'УЛИЦА · К МЕТРО'),
  tip:z=>(SEV[z.ev]&&SEV[z.ev].tip)?SEV[z.ev].tip(z):'иди вправо по тротуару, обходи прохожих',
  init(z){ const g=st4Geo(); z.y0=g.y0; z.y1=g.y1; z.seed=z.seed||((Math.random()*1e9)>>>0); const r=st4Rng(z); z.len=Math.round(Math.max(W,420)*(1.5+r()*1)*(z.lenK||1)); z.weather=z.weather||(TR.plan&&TR.plan.weather)||'clear';
    z.gaps=[]; z.cars=[]; z.fx=[]; z.end=z.last?(z.seg==='street2'?'bc':'metro'):null;
    const n=Math.round(z.len/90*(z.crowdK||1)); for(let i=0;i<n;i++){ const e=(typeof st4VarNpc==='function'&&r()<.4)?st4VarNpc(rnd(60,z.len-30),rnd(z.y0,z.y1),r):mkNpc(qType(z.d||6),rnd(60,z.len-30),rnd(z.y0,z.y1)); e.dir=Math.random()<.6?-1:1; e.spd2=rnd(20,36); e.free=1; e.street=1; z.npcs.push(e); }
    if(SEV[z.ev]&&SEV[z.ev].init) SEV[z.ev].init(z,r);
    if(typeof st4WeatherInit==='function') st4WeatherInit(z); if(typeof st4UmbInit==='function') st4UmbInit(z); },
  update(z,dt){ const h=G.hero, E=SEV[z.ev];
    h.y=clamp(h.y,z.y0,z.y1); h.x=Math.max(8,h.x);
    for(const e of z.npcs){ if(e.ctl) continue; e.x+=e.dir*e.spd2*dt*(e.slowT>0?.5:1); e.face=e.dir; e.set('walk'); if(e.slowT>0) e.slowT-=dt; const lim=e.lim; if(lim){ if(e.x<lim[0]){ e.x=lim[1]-4; e.y=rnd(z.y0,z.y1); } else if(e.x>lim[1]){ e.x=lim[0]+4; e.y=rnd(z.y0,z.y1); } } else wrapFlow(z,e,()=>{ e.y=rnd(z.y0,z.y1); }); e.y=clamp(e.y,z.y0,z.y1); }
    st4CarsTick(z,dt); if(typeof st4WeatherTick==='function') st4WeatherTick(z,dt); if(typeof st4UmbTick==='function') st4UmbTick(z,dt);
    if(z.fork&&!TR.forkAsked&&z.t>.4){ st4Fork(z); return; }
    if(E&&E.update) E.update(z,dt);
    if(h.x>z.len-26&&!z.block) zoneDone(); z.hint=z.end==='metro'?'МЕТРО →':z.end==='bc'?'К ОФИСУ →':'ВПЕРЁД →'; },
  ctx(z){ const E=SEV[z.ev]; return (E&&E.ctx&&E.ctx(z))||{}; },
  prog(z){ const E=SEV[z.ev]; return (E&&E.prog)?E.prog(z):G.hero.x; },
  unstick(z){ const E=SEV[z.ev]; if(E&&E.unstick&&E.unstick(z)) return; G.hero.x+=40; for(const e of z.npcs) if(Math.abs(e.x-G.hero.x)<40) e.y=e.y<G.hero.y?z.y0:z.y1; },
  bot(z){ if(TR.smod&&TR.smod.id==='tut') return {x:0,y:0,a:1}; if(TR.smod&&TR.smod.id==='fork') return {x:0,y:0,[(z.seed%2)?'a':'b']:1}; const E=SEV[z.ev]; const r=E&&E.bot&&E.bot(z); if(r){ if(r.a||r.b||TR.smod||z.yard) return r; const av=st4BotDrift(z,r); return av||r; } const h=G.hero; let ty=h.y, dg=0; for(const e of z.npcs){ if(e.x>h.x&&e.x<h.x+30&&Math.abs(e.y-h.y)<10){ ty=e.y>h.y?h.y-12:h.y+12; if(ty<z.y0+2||ty>z.y1-2) ty=e.y>h.y?h.y+14:h.y-14; dg=1; } } { const av=st4BotDrift(z,null); if(av&&!TR.smod) return av; } const dr=(z.drifts||[]).find(d=>d.x+d.w>h.x-4&&d.x-h.x<60); if(dr){ ty=dr.top?z.y1-2:z.y0+2; if(Math.abs(h.y-ty)>6&&dr.x-h.x<14) return {x:h.x,y:ty}; } return {x:dg?h.x+40:z.len,y:clamp(ty,z.y0+2,z.y1-2)}; /* M5 dodge: near target so the side-step isn't diluted by a far x */ },
  draw(z){ const g=st4Geo(), c=G.cam, E=SEV[z.ev];
    st4Sky(z); const far=st4Far(z); ctx.drawImage(far,-Math.round((c+W*.3)*.45)%Math.max(1,far.width-W)-0,0);
    if(z.weather==='fog'){ ctx.fillStyle='rgba(220,222,226,.55)'; ctx.fillRect(0,0,W,g.facadeB); }
    const fc=st4Facade(z); ctx.drawImage(fc,-Math.round(c)-20,0);
    if(!z.yard) for(const hs of z.houses||[]){ if(hs.w<110) continue; if(z.noSign&&z.noSign.some(q=>hs.x+20+hs.w>q[0]&&hs.x+20<q[1])) continue; const sw=Math.min(hs.w-16,txtW(hs.sign,8)+14); wallSign(hs.x+20+(hs.w-sw)/2,g.facadeB-26-19,sw,14,hs.sign,'#2a2440','#ffe9a8',8); }
    if(z.weather==='fog'){ ctx.fillStyle='rgba(220,222,226,.28)'; ctx.fillRect(0,0,W,g.facadeB); }
    st4Ground(z); if(E&&E.draw) E.draw(z,'ground');
    if(z.end==="metro"&&!z.yard) st4MetroEntrance(z); if(z.first2&&!z.yard) st4MetroEntrance(z,-8); if(z.end==='bc') st4BcEntrance(z);
    if(typeof st4WeatherDraw==='function') st4WeatherDraw(z,'ground'); if(typeof st4UmbDraw==='function') st4UmbDraw(z,'ground');
    if(E&&E.draw) E.draw(z,'back'); if(typeof st4TransDraw==='function'&&!z.yard) st4TransDraw(z,'back');
    drawTripActors([G.hero,...z.npcs,...(z.extra||[])]);
    if(E&&E.draw) E.draw(z,'front'); st4Dirty(G.hero);
    if(typeof st4WeatherDraw==='function') st4WeatherDraw(z,'drift');
    if(!z.yard){ st4CarsDraw(z); if(typeof st4TransDraw==='function') st4TransDraw(z,'front'); st4Poles(z); }
    if(typeof st4UmbDraw==='function') st4UmbDraw(z,'air'); if(typeof st4WeatherDraw==='function') st4WeatherDraw(z,'air');
    if(E&&E.draw) E.draw(z,'ui');
    if(z.end) goalArrow(z.len-30,g.y0-30); } };
function st4MetroEntrance(z,wx){ const g=st4Geo(), x=Math.round((wx!==undefined?wx:z.len-56)-G.cam); if(x>W+10||x<-80) return; const y=g.facadeB;
  ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-52,62,52); ctx.fillStyle='#c8c2b0'; ctx.fillRect(x,y-51,60,51); ctx.fillStyle='#8f98a8'; ctx.fillRect(x,y-51,60,4);
  ctx.fillStyle=P.ink; ctx.fillRect(x+12,y-34,36,34); ctx.fillStyle='#3a4250'; ctx.fillRect(x+13,y-33,34,33); ctx.fillStyle='#5a6880'; ctx.fillRect(x+14,y-32,4,30);
  ctx.fillStyle=P.ink; ctx.fillRect(x+22,y-50,16,13); ctx.fillStyle='#e8343a'; ctx.fillRect(x+23,y-49,14,11); ctx.fillStyle='#fff'; for(const [a,b,w,h] of [[25,-47,2,7],[33,-47,2,7],[27,-46,2,2],[31,-46,2,2],[29,-44,2,2]]) ctx.fillRect(x+a,y+b,w,h); }
function st4BcEntrance(z){ const g=st4Geo(), x=Math.round(z.len-60-G.cam); if(x>W+10||x<-80) return; const y=g.facadeB;
  ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-60,66,60); ctx.fillStyle='#3a4a66'; ctx.fillRect(x,y-59,64,59); ctx.fillStyle='#8fd8ff'; for(let yy=y-56;yy<y-24;yy+=8) for(let xx=x+4;xx<x+60;xx+=10) ctx.fillRect(xx,yy,7,5);
  ctx.fillStyle=P.ink; ctx.fillRect(x+16,y-22,32,22); ctx.fillStyle='#bfe0ff'; ctx.fillRect(x+17,y-21,14,21); ctx.fillRect(x+33,y-21,14,21); const lt='БЦ «ДАВКА-ПЛАЗА»', lw=txtW(lt,6)/2; G.labels.push([lt,Math.round(Math.min(x+32,W-SA.r-lw-6)),y-64,6,'#ffe9a8']); }
// ---------- сегменты → зоны ----------
// события сегмента → по зоне на событие (без событий — одна «чистая» улица); последняя зона заканчивается входом в метро / БЦ
function streetZones(seg,day,idx){ const r=routeRng(day,idx,seg.id==='street1'?0x51:0x52); const ev=[...seg.events]; for(let i=ev.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [ev[i],ev[j]]=[ev[j],ev[i]]; }
  const out=(ev.length?ev:[{k:null,v:0}]).map((e,i)=>({k:'street',seg:seg.id,ev:e.k,v:e.v,seed:(day.seed^Math.imul(idx+7,2654435761)^(i*977)^(seg.id==='street2'?0xabc:0))>>>0,d:idx}));
  out[out.length-1].last=true; if(seg.id==='street2') out[0].first2=true; return out; }
// строка цели HUD для улицы
{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='street'){ const E=SEV[z.ev], g=E&&E.goal&&E.goal(z); return g||(z.end==='metro'?'Дойди до метро':z.end==='bc'?'Дойди до офиса':'Иди вперёд по улице'); } return _gt(z); }; }
// грязные/мокрые ноги героя (после ямы / лужи)
function st4Dirty(h){ const x=Math.round(h.x-G.cam), y=Math.round(h.y-h.z); if(h.dirty>0){ ctx.globalAlpha=Math.min(1,h.dirty/2); ctx.fillStyle='#6a4a2a'; ctx.fillRect(x-6,y-4,5,3); ctx.fillRect(x+1,y-4,5,3); ctx.fillStyle='#4a3020'; ctx.fillRect(x-5,y-6,2,2); ctx.fillRect(x+3,y-7,2,2); ctx.globalAlpha=1; }
  if(h.wetT>0){ ctx.fillStyle='#7ab8ff'; for(let i=0;i<4;i++){ const ph=(G.t*1.6+i*.27)%1; ctx.fillRect(x-7+i*4,y-30+Math.round(ph*26),1,2); } ctx.fillStyle='#4a8ad8'; ctx.fillRect(x-6,y-3,12,1); } }
// ---------- модальная карточка улицы (R13): реплика + 2 варианта; мир и часы стоят ----------
{ const _st=startTrip; startTrip=function(...a){ TR.smod=null; TR.forkAsked=0; TR.forkLong=0; return _st(...a); }; __trip.startTrip=startTrip; }
function st4Modal(m){ TR.smod=Object.assign({t:0},m); tev('modal_'+(m.id||'x')); SFX.ui(); }
{ const _tu=tripUpdate; tripUpdate=function(dt){ const m=TR.smod; if(m&&!TR.done){ m.t+=dt; if(m.clock){ TR.tLeft-=dt; if(TR.tLeft<=0){ TR.smod=null; return _tu(dt); } } if(window.__botTick&&!paused&&m.opts&&m.t>.5){ const r=ZONES[TR.z.k].bot(TR.z)||{}; if(r.a||r.b) tripPress(r.b?'B':'A'); } if(m.auto&&m.t>=m.auto){ TR.smod=null; m.onAuto&&m.onAuto(); } input.events&&(input.events.length=0); return; } return _tu(dt); };
  const _tp=tripPress; tripPress=function(k){ const m=TR.smod; if(m){ if(m.t>.35&&m.opts){ const o=m.opts[k==='A'?0:1]; if(o){ TR.smod=null; o[2](); SFX.ui(); } } return; } return _tp(k); }; __trip.press=k=>tripPress(k);
  const _hud=tripHUD; tripHUD=function(){ _hud(); if(TR.smod) st4DrawModal(TR.smod); }; }
function st4DrawModal(m){ if(m.cards) return st4DrawCards(m); const keep=G.labels.filter(l=>l[2]<SA.t+34); G.labels.length=0; G.labels.push(...keep); buttons.length=0; ctx.fillStyle='rgba(10,6,20,.45)'; ctx.fillRect(0,0,W,H);
  const w=Math.min(W-60,350), x=Math.round(W/2-w/2), pw=m.spr?44:0, ln=wrapW(m.text,w-24-pw,8), bh=30, hh=Math.max(34+ln.length*13,m.spr?62:0)+(m.opts?bh+18:12), y=Math.round(Math.max(SA.t+30,H/2-hh/2-10));
  ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh); ctx.fillStyle='#f0e4c8'; ctx.fillRect(x,y,w,18);
  G.labels.push([m.title,W/2,y+10,9,'#d8265e','center',null]);
  if(m.spr){ ctx.fillStyle='#e8dcc0'; ctx.fillRect(x+8,y+22,36,40); atlDraw(ctx,'ch',m.spr,x+10,y+18); }
  ln.forEach((s,i)=>G.labels.push([s,x+12+pw,y+32+i*13,8,'#1a1020','left',null]));
  if(m.opts&&m.t>.35){ const bw=Math.round((w-30)/2); m.opts.forEach((o,i)=>bigBtn(o[0],x+10+i*(bw+10),y+hh-bh-8,bw,bh,o[1],()=>{ if(TR.smod!==m) return; TR.smod=null; o[2](); },'smod'+i,8)); } }
// персонажи из листа M0 (atlas ch: baba/promo/guard/courier/scoot/…): a.atl='promo' и т.п.
{ const _da=drawActor; drawActor=function(a,ex){ if(!a.atl||!atlOk('ch')||G.scene!=='trip') return _da(a,ex);
  const sp=Math.hypot(a.vx||0,a.vy||0); let st='idle', n=3, fr=Math.floor((a.anT||G.t)*5);
  if(a.st==='hurt') { st='surprised'; n=1; } else if(a.angry) { st='angry'; n=1; } else if(a.st==='walk'||sp>6) { st=sp>70?'run':'walk'; n=4; fr=Math.floor((a.anT||G.t)*8); } else if(a.atlSt){ st=a.atlSt; n=st==='ride'?2:1; }
  const x=Math.round(a.x-G.cam), y=Math.round(a.y-(a.z||0)); ctx.fillStyle='rgba(10,6,20,.28)'; ctx.fillRect(x-8,Math.round(a.y)-1,16,3); ctx.fillRect(x-6,Math.round(a.y)-2,12,5);
  atlDraw(ctx,'ch',a.atl+'_'+st+'_'+(fr%n),x-16,y-45,(a.face||1)<0); if(ex) ex(x,y); }; }
// надписи «в мире» (l[8] = глубина основания): прячутся, если перед ними стоит персонаж (текст рисуется поверх канваса)
function labOcc(l){ const z=TR.z; if(!z) return false; const hw=txtW(l[0],l[3])/2+1, hh=l[3]/2+1, lx=l[5]==='left'?l[1]+hw:l[1]; for(const a of [G.hero,...(z.npcs||[]),...(z.extra||[])]){ if(!a||a.hide||a.y<=l[8]) continue; const sx=a.x-G.cam, sy=a.y-(a.z||0); if(sx+9>lx-hw&&sx-9<lx+hw&&sy>l[2]-hh&&sy-44<l[2]+hh) return true; } return false; }

// ---------- M2-11: развилка — 2 карточки «КОРОТКО (риск)» / «ДЛИННО (надёжно)», ожидаемое время ± разброс, иконки; часы стоят ----------
function st4DrawCards(m){ const keep=G.labels.filter(l=>l[2]<SA.t+34); G.labels.length=0; G.labels.push(...keep); buttons.length=0; ctx.fillStyle='rgba(10,6,20,.55)'; ctx.fillRect(0,0,W,H);
  const cw=Math.min(170,Math.floor((W-60)/2)), ch=Math.min(150,H-SA.t-SA.b-90), gap=14, x0=Math.round(W/2-cw-gap/2), y=Math.round(Math.max(SA.t+56,H/2-ch/2+8));
  G.labels.push([m.title,W/2,y-14,11,'#ffe14a','center',P.ink]);
  m.cards.forEach((c,i)=>{ const x=x0+i*(cw+gap); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,cw+4,ch+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,cw,ch); ctx.fillStyle=c.col; ctx.fillRect(x,y,cw,22);
    G.labels.push([c.t,x+cw/2,y+11,9,'#fff','center',P.ink]); st4Icon(c.icon,x+cw/2,y+46);
    G.labels.push(['≈ '+c.est+' с  ± '+c.sp,x+cw/2,y+76,10,'#1a1020','center',null]); wrapW(c.sub,cw-16,7).forEach((s,k)=>G.labels.push([s,x+cw/2,y+96+k*11,7,'#5a4a6a','center',null]));
    if(m.t>.35) buttons.push({x,y,w:cw,h:ch,id:'fork'+i,cb:()=>{ if(TR.smod!==m) return; TR.smod=null; m.opts[i][2](); SFX.ui(); }}); });
  G.labels.push(['выбор сам через '+Math.max(0,Math.ceil(m.auto-m.t))+' с: ДЛИННО',W/2,y+ch+14,7,'#bbb','center',P.ink]); }
function st4Icon(k,cx,cy){ cx=Math.round(cx); cy=Math.round(cy); const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a,cy+b,w,h); };
  if(k==='bolt'){ f(-7,-13,14,26,'#fff8e8'); [[1,-12,5,2],[-1,-10,5,2],[-3,-8,5,2],[-5,-6,5,2],[-5,-4,11,2],[1,-2,5,2],[-1,0,5,2],[-3,2,5,2],[-5,4,5,2]].forEach(r=>f(r[0]-1,r[1]-1,r[2]+2,r[3]+2,P.ink)); [[1,-12,5,2],[-1,-10,5,2],[-3,-8,5,2],[-5,-6,5,2],[-5,-4,11,2],[1,-2,5,2],[-1,0,5,2],[-3,2,5,2],[-5,4,5,2]].forEach(r=>f(r[0],r[1],r[2],r[3],'#ffd23f')); }
  else { f(-9,-12,18,4,P.ink); f(-10,-9,20,12,P.ink); f(-8,3,16,4,P.ink); f(-5,7,10,3,P.ink); f(-2,10,4,2,P.ink); f(-8,-11,16,3,'#3d6ff0'); f(-9,-8,18,11,'#3d6ff0'); f(-7,3,14,3,'#3d6ff0'); f(-4,6,8,3,'#3d6ff0'); f(-1,9,2,1,'#3d6ff0'); f(-6,-9,4,8,'#8fb0ff'); f(-3,-4,2,2,'#fff'); f(-1,-2,2,2,'#fff'); f(1,-4,2,2,'#fff'); f(3,-6,2,2,'#fff'); } }
function st4Fork(z){ if(TR.forkAsked) return; TR.forkAsked=1; const s1=TR.zones.filter(q=>q.k==='street'&&q.seg===z.seg), nE=s1.filter(q=>q.ev).length, base=Math.round(s1.length*2*Math.max(W,420)/62);
  const go=(long)=>{ tev(long?'fork_long':'fork_short'); TR.forkLong=long; if(!long) return; for(const q of s1){ if(q===z) continue; q.ev=null; q.lenK=1.35; } z.ev=null; z.npcs=[]; z.solids=[]; z.cars=[]; z.lenK=1.35; ZONES.street.init(z); G.hero.x=Math.min(G.hero.x,30); };
  st4Modal({id:'fork',title:'РАЗВИЛКА',cards:[{t:'КОРОТКО (риск)',sub:nE+' соб. по пути, можно влипнуть',est:base+5*nE,sp:Math.max(3,6*nE),icon:'bolt',col:'#d8265e'},{t:'ДЛИННО (надёжно)',sub:'дворами, без событий',est:Math.round(base*1.35),sp:2,icon:'shield',col:'#3d6ff0'}],auto:10,onAuto:()=>go(true),opts:[['КОРОТКО','#d8265e',()=>go(false)],['ДЛИННО','#3d6ff0',()=>go(true)]]}); }

// бот: обход сугроба, если цель события ведёт сквозь него (сугроб в ряду героя впереди ≤50 px)
function st4BotDrift(z,r){ const h=G.hero; const goingR=!r||(r.stick?r.stick.x>0:(r.x===undefined||r.x>h.x)); if(!goingR||z.yard) return null;
  const S=(z.solids||[]).filter(q=>q[2]>h.x-2&&q[0]-h.x<46&&h.y>q[1]-5&&h.y<q[3]+5); if(!S.length) return null; const q=S.sort((a,b)=>a[0]-b[0])[0];
  const up=Math.max(z.y0+1,q[1]-7), dn=Math.min(z.y1-1,q[3]+7); const roomUp=q[1]-z.y0, roomDn=z.y1-q[3]; const fy=roomUp>roomDn?up:dn;
  return Math.abs(h.y-fy)>3&&q[0]-h.x<16?{x:h.x,y:fy}:{x:q[2]+14,y:fy}; }
