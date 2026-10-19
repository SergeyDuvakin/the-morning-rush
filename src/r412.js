// 4.1.2: рекламные плашки вагона не под стойками; столбы перед вывесками (и их текстом); самокаты не на сугробах; толчок NPC на льду;
// машины на перпендикулярном проезде у светофора (поворот в поток / из потока); обход глюков NPC.
const R412={ver:'4.1.2',fr:0,pl:null,TURN_T:.9}; if(typeof FB6!=='undefined') FB6.ver=R412.ver; if(typeof R41!=='undefined') R41.ver=R412.ver; if(typeof R411!=='undefined') R411.ver=R412.ver;

// ---------- 1) метро: третья плашка простенка (x 67..98) уходила под стойку (bx+83). Простенок: [СОН][КРЕДИТ] + чистая стена до стойки ----------
{ const _m=car4Mods; car4Mods=function(li){ const m=_m.apply(this,arguments); if(m&&!m.__r412){ m.__r412=1;
    for(const n of ['mi_wall_t','mi_wall_s']){ const s=m[n]; if(!s) continue; const [cv,c]=c4canvas(s.width,s.height); c.drawImage(s,0,0);
      const plate=c.getImageData(67,7,32,11); c.putImageData(plate,1,7); // СОН → на место первой плашки
      const wall=c.getImageData(0,7,1,11); for(let x=67;x<=98;x++) c.putImageData(wall,x,7); // освободить место у стойки
      m[n]=c4fresh(cv); } }
    return m; }; }

// ---------- 2) улица: столбы переднего плана поверх текста вывесок ----------
// Текст вывесок рисуется на верхнем канвасе tctx (над всеми пикселями мира) — столб «пропадал» за надписью.
// Запоминаем столбы кадра; надписи на табличках (wallSign) и вывески с глубиной перерисовываем: текст, затем сегмент столба поверх.
{ const _r=render; render=function(){ R412.fr++; R412.pl=null; return _r.apply(this,arguments); }; }
{ const _p=st4Poles; st4Poles=function(z){ const g=st4Geo(), c=G.cam*1.25, hx=Math.round(G.hero.x-G.cam), L=[];
    for(let x=-(Math.round(c)%170)+60;x<W+20;x+=170) L.push([x,Math.abs(x-hx)<14?.45:1]); R412.pl={fr:R412.fr,L,top:g.facadeB-78}; return _p.apply(this,arguments); }; }
{ const _w=wallSign; wallSign=function(x,y,w,h){ const n=G.labels.length; const r=_w.apply(this,arguments); if(G.labels.length>n&&G.scene==='trip'&&TR.z&&TR.z.k==='street'){ const l=G.labels[G.labels.length-1]; if(l[8]===undefined){ l[8]=Infinity; l.s412=1; } } return r; }; }
function r412PoleOver(l){ const P2=R412.pl; if(!P2||P2.fr!==R412.fr||G.scene!=='trip'||!TR.z||TR.z.k!=='street') return false;
  const hw=txtW(l[0],l[3])/2+1, hh=l[3]/2+2, lx=l[5]==='left'?l[1]+hw:l[5]==='right'?l[1]-hw:l[1], x0=lx-hw, x1=lx+hw, y0=l[2]-hh, y1=l[2]+hh;
  const hit=P2.L.filter(([x])=>x+3>x0&&x-2<x1&&y1>P2.top); if(!hit.length) return false;
  const o=(l[6]===undefined||l[6]===0)?'#1a1020':l[6]; txt(l[0],l[1],l[2],l[3],l[4],l[5]||'center',o,900,l[7]);
  const ya=Math.max(Math.floor(y0),P2.top), yb=Math.ceil(y1), S=SC; tctx.save(); tctx.setTransform(1,0,0,1,0,0);
  for(const [x,a] of hit){ tctx.globalAlpha=a; const R=(c,rx,w)=>{ tctx.fillStyle=c; tctx.fillRect(rx*S,ya*S,w*S,(yb-ya)*S); }; R(P.ink,x-2,5); R('#4a4a58',x-1,3); R('#6a6a7a',x-1,1); }
  tctx.restore(); R412.poleOver=(R412.poleOver|0)+1; return true; }
{ const _o=labOcc; labOcc=function(l){ if(l.s412||(l[8]!==undefined&&isFinite(l[8]))){ if(l.s412) return r412PoleOver(l); const occ=_o.apply(this,arguments); if(occ) return true; return r412PoleOver(l); } return _o.apply(this,arguments); }; }

// ---------- 3) снег: самокаты/остановка не на сугробах. Сугробы ставятся раньше (st4WeatherInit), транспорт — позже и сугробов не видел ----------
function r412DriftHit(z,x0,x1,pad=6){ return (z.drifts||[]).find(d=>x1>d.x-pad&&x0<d.x+d.w+pad); }
function r412DropDrift(z,d){ z.drifts=z.drifts.filter(q=>q!==d); const k=[d.x+3,d.top?z.y0-8:d.y0+3,d.x+d.w-3,d.top?d.y1-3:z.y1+8].join(','); z.solids=(z.solids||[]).filter(q=>q.join(',')!==k); }
{ const _t=st4TransInit; st4TransInit=function(z){ const r=_t.apply(this,arguments); try{ if(z.drifts&&z.drifts.length){
    const busy=x=>[[z.cx,z.cw],[z.px,z.pw],[z.ax-140,280],[z.pcx-60,120]].some(q=>q[0]!==undefined&&!isNaN(q[0])&&x>q[0]-90&&x<q[0]+q[1]+90);
    for(const s of z.scoots||[]){ if(!r412DriftHit(z,s.x-8,s.x+8)) continue; const old=[s.x-6,z.y0-4,s.x+8,z.y0+3].join(','); let nx=null;
      for(let k=8;k<=260&&nx===null;k+=4) for(const dx of [k,-k]){ const x=s.x+dx; if(x<40||x>z.len-60||busy(x)||r412DriftHit(z,x-8,x+8)||(z.scoots.some(o=>o!==s&&Math.abs(o.x-x)<30))) continue; nx=x; break; }
      const i=z.solids.findIndex(q=>q.join(',')===old); if(nx===null){ s.dead=1; if(i>=0) z.solids.splice(i,1); continue; } s.x=nx; if(i>=0) z.solids[i]=[nx-6,z.y0-4,nx+8,z.y0+3]; R412.drMoved=(R412.drMoved|0)+1; }
    z.scoots=(z.scoots||[]).filter(s=>!s.dead);
    if(z.bus){ for(const d of [...z.drifts]) if(z.bus.stop+8>d.x-8&&z.bus.stop-8<d.x+d.w+8) r412DropDrift(z,d); }
    if(z.taxi){ /* такси на дороге — с сугробами не пересекается */ } } }catch(e){} return r; }; }

// ---------- 4) ТОЛКНУТЬ человека на льду → поскользнулся и упал (лежит 0.6 с, встаёт 0.35 с); −15 очков (половина скандала −30) ----------
R412.ICE_PTS=15;
function r412OnIce(z,e){ if(!z||z.ev!=='ice'||!z.ic) return null; const p=z.ic.find(p=>e.x>p.x&&e.x<p.x+p.w); return p&&Math.abs(e.y-p.sy)>5?p:null; }
{ const _tp=tripPress; tripPress=function(k){ const z=TR.z, h=G.hero; const ok=z&&z.k==='street'&&z.ev==='ice'&&k==='A'&&!z.ctxA&&!TR.smod&&h&&!TR.done&&!paused&&!(TR.next>0);
    const cd0=h&&h.shoveCd; const before=ok?z.npcs.filter(e=>!e.ghost&&!e.atl&&!e.scoot&&!e.slip412&&!(e.pin&&e.m>5)&&r412OnIce(z,e)).map(e=>[e,e.x,e.y]):[];
    const r=_tp.apply(this,arguments);
    if(ok&&h.shoveCd!==cd0) for(const [e,x0,y0] of before){ if(Math.abs(e.x-x0)<.01&&Math.abs(e.y-y0)<.01) continue; // не задели
      e.slip412={t:0,x:e.x,y:e.y,d:h.face}; e.vx=0; e.vy=0; e.angry=true; tev('ice_push'); TR.icePush=(TR.icePush|0)+1; TR.score=(TR.score||0)-R412.ICE_PTS;
      pop('−'+R412.ICE_PTS+' · УРОНИЛ',e.x,e.y-52,'#ff8a8a',8,1.2); e.bub=0; /* реплика — когда встанет, чтобы не наезжать на «−15» */ try{ SFX.land(); }catch(_){ } shake(2); haptic('error'); }
    return r; }; __trip.press=k=>tripPress(k); }
{ const S=ZONES.street, u0=S.update; S.update=function(z,dt){ const L=(z.npcs||[]).filter(e=>e.slip412); const r=u0.apply(this,arguments);
    for(const e of L){ const s=e.slip412; if(!TR.smod&&!paused) s.t+=dt; const k=Math.min(1,s.t/.18); e.x=s.x+s.d*Math.round(5*k*(2-k)); e.y=s.y; e.vx=0; e.vy=0; e.side411=0; e.wait411=0;
      if(s.t<.6){ if(e.st!=='down') e.set?e.set('down'):(e.st='down'); } else if(s.t<.95){ if(e.st!=='hurt') e.set?e.set('hurt'):(e.st='hurt'); }
      else { e.x=s.x+s.d*5; e.slip412=null; bubble(e,pick(['Ай! Скользко же!','Ты что творишь?!','Ой-ой-ой!']),1.4,P.red); e.set?e.set('idle'):(e.st='idle'); e.wait411=.5; } }
    return r; }; }
// НОВОЕ: карточка в стиле обучения (st4Modal id 'tut' — без таймера, 4.1.1)
STUT.ice[1]='На льду не дёргайся: резкий разворот — падение и −2 с. Толкнёшь человека на льду — упадёт: −15 очков. Песок безопасен.';
{ const _c=st4TutCheck; st4TutCheck=function(z){ const had=!!(save.tut&&save.tut.st_ice), m0=TR.smod; const r=_c.apply(this,arguments);
    if(z&&z.ev==='ice'&&TR.smod&&TR.smod!==m0&&TR.smod.id==='tut'){ save.tut.st_icepush=1; return r; }
    if(z&&z.ev==='ice'&&had&&!TR.smod&&!TR.stut&&!(save.tut&&save.tut.st_icepush)&&!window.__noTut&&TR.mode!=='learn'&&TR.mode!=='learn2'&&!z.tut412){ z.tut412=1; save.tut.st_icepush=1; try{ store(); }catch(e){}
      st4Modal({id:'tut',title:'НОВОЕ · ТОЛЧОК НА ЛЬДУ',text:'Толкнёшь человека на льду — поскользнётся и упадёт. Это −15 очков. Обходи людей по песку.',opts:[['ПОНЯТНО','#2aa860',()=>{ tev('stut_icepush'); }]]}); }
    return r; }; }

// R412T-BEGIN
const R412T={src:'data:image/png;base64,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',f:{"hatch:front":[0,0,25,22],"hatch:f15":[26,0,35,22],"hatch:f30":[62,0,44,22],"hatch:f45":[107,0,51,22],"hatch:f60":[159,0,53,22],"hatch:r60":[213,0,53,22],"hatch:r45":[267,0,51,22],"hatch:r30":[319,0,44,22],"hatch:r15":[364,0,35,22],"hatch:rear":[400,0,25,22],"sedan:front":[426,0,25,22],"sedan:f15":[452,0,37,22],"sedan:f30":[490,0,48,22],"sedan:f45":[539,0,56,22],"sedan:f60":[596,0,60,22],"sedan:r60":[657,0,60,22],"sedan:r45":[718,0,56,22],"sedan:r30":[775,0,48,22],"sedan:r15":[824,0,37,22],"sedan:rear":[862,0,25,22],"taxi:front":[888,0,25,25],"taxi:f15":[914,0,37,25],"taxi:f30":[952,0,48,25],"taxi:f45":[1001,0,56,25],"taxi:f60":[1058,0,60,25],"taxi:r60":[1119,0,60,25],"taxi:r45":[1180,0,56,25],"taxi:r30":[1237,0,48,25],"taxi:r15":[1286,0,37,25],"taxi:rear":[1324,0,25,25]}}; /* сгенерировано art_v4/turn412.py */
// R412T-END
R412T.img=new Image(); R412T.img.src=R412T.src; R412T.K=['hatch','sedan','taxi'];
function r412TFr(mi,view){ const im=R412T.img; if(!im||!im.complete||!im.naturalWidth) return null; return R412T.f[R412T.K[mi]+':'+view]||null; }
// ---------- 5) перекрёсток: машины переулка — пиксель-арт в стиле атласа (спереди / сзади / 3⁄4 / сбоку из атласа),
// выезжают из переулка и поворачивают направо/налево в поток, или с дороги сворачивают в переулок. Без появления/исчезновения на виду. ----------
const R412C={M:[{spr:'car_hatch',c:'#c8302e',hi:'#d35958'},{spr:'car_sedan',c:'#e8e6ee',hi:'#f8f7fb',dk:'#b8b6c4'},{spr:'taxi',c:'#f0c020',hi:'#f3cd4d',taxi:1}],cache:{}};
function r412CarImg(mi,view){ const key=mi+view; if(R412C.cache[key]) return R412C.cache[key]; const m=R412C.M[mi], I='#120c18', G1='#1b1a1f', G2='#212025', T='#4a4752', dk=m.dk||shade(m.c,-.22), lit='#fff6c0', amb='#ffd23f', red='#ff4a4a', rdk='#a82a2a';
  const side=view==='qf'||view==='qr';
  if(side){ // 3⁄4: бок из атласа, сжатый ×0.72 (тот же стиль), + торец (перед/зад) сжатый до 13 px
    const r=ATL4.tr.f[m.spr], sw=Math.round(r[2]*.72), fw=13, Hh=Math.max(24,r[3]), [cv,c]=c4canvas(sw+fw-4,Hh); c.imageSmoothingEnabled=false; const face=r412CarImg(mi,view==='qf'?'front':'rear');
    if(view==='qf'){ c.drawImage(ATL4.tr.img,r[0],r[1],r[2],r[3],0,Hh-r[3],sw,r[3]); c.drawImage(face,0,11,24,13,sw-4,Hh-13,fw,13); }
    else { c.drawImage(ATL4.tr.img,r[0],r[1],r[2],r[3],fw-4,Hh-r[3],sw,r[3]); c.drawImage(face,0,11,24,13,0,Hh-13,fw,13); }
    return R412C.cache[key]=cv; }
  const [cv,c]=c4canvas(24,24), f=(col,x,y,w,h)=>{ c.fillStyle=col; c.fillRect(x,y,w,h); };
  if(!side){ const rear=view==='rear';
    if(m.taxi){ f(I,8,0,8,4); f(amb,9,1,6,2); }
    f(I,4,3,16,9); f(m.c,5,4,14,1); f(G1,5,5,14,6); f(G2,6,6,12,4); if(!rear){ f(T,7,6,3,1); f(T,6,7,2,1); } else { f(T,14,6,3,1); }
    f(I,1,9,3,3); f(m.c,2,10,1,1); f(I,20,9,3,3); f(m.c,21,10,1,1);
    f(I,0,11,24,9); f(m.c,1,12,22,7); f(m.hi,1,12,22,1); f(dk,1,17,22,2);
    if(!rear){ f(lit,2,13,4,2); f(amb,2,14,4,1); f(lit,18,13,4,2); f(amb,18,14,4,1); f(G2,8,13,8,3); f(T,8,14,8,1); }
    else { f(red,2,13,4,2); f(rdk,2,14,4,1); f(red,18,13,4,2); f(rdk,18,14,4,1); f(dk,7,13,10,1); }
    if(m.taxi){ for(let i=0;i<11;i++) if(i%2) f(I,1+i*2,16,2,1); }
    f('#e8e4d8',9,17,6,2); f(T,1,19,22,1); f(I,1,20,5,3); f('#302e35',2,20,3,2); f(I,18,20,5,3); f('#302e35',19,20,3,2); }
  return R412C.cache[key]=cv; }
function r412K(y){ const g=st4Geo(); return y>=g.facadeB?1:clamp(.55+.45*(y-(g.facadeB-42))/42,.55,1); }
function r412DrawView(mi,view,cx,base,k,flip){ const F=r412TFr(mi,view), img=F?R412T.img:r412CarImg(mi,view==='f30'||view==='f60'?'qf':view==='r30'||view==='r60'?'qr':view), IW=F?F[2]:img.width, IH=F?F[3]:img.height, w=Math.max(1,Math.round(IW*k)), h=Math.max(1,Math.round(IH*k)), x=Math.round(cx-w/2), y=Math.round(base-h+1);
  ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(x+Math.round(2*k),Math.round(base-1),w-Math.round(4*k),Math.max(1,Math.round(3*k)));
  const di=(X,Y)=>F?ctx.drawImage(img,F[0],F[1],F[2],F[3],X,Y,w,h):ctx.drawImage(img,X,Y,w,h);
  if(flip){ ctx.save(); ctx.translate(x+w,y); ctx.scale(-1,1); di(0,0); ctx.restore(); } else di(x,y); veh411(x,y,w,h); }
function r412DrawSide(mi,d,cx,base){ const m=R412C.M[mi], r=ATL4.tr&&ATL4.tr.f[m.spr]; if(!r) return; const lx=cx-r[2]/2, sx=Math.round(lx-G.cam), y=base-r[3]+Math.round(Math.sin(G.t*9+lx*.1)*.5);
  ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(sx+3,base-2,r[2]-6,3); atlDraw(ctx,'tr',m.spr,sx,y,d<0); veh411(sx,y,r[2],r[3]); }
function r412Lane(d){ const g=st4Geo(); return d>0?g.farY:g.carY; }
function r412SideW(mi){ const r=ATL4.tr&&ATL4.tr.f[R412C.M[mi].spr]; return r?r[2]:56; }
// кто занимает полосу d около x (машины потока и наши на дороге)
function r412LaneBusy(z,d,x,back=170,fwd=50){ for(const q of z.cars||[]){ if(q.dir!==d) continue; const c=q.x+(q.w||60)/2, rel=(c-x)*d; if(q.brake412&&((d>0?q.x+(q.w||60):q.x)-x)*d<-30) continue; /* стоит в очереди позади — не угроза */ if(rel>-back&&rel<fwd) return true; }
  for(const q of z.vc) if((q.ph==='min'&&!q.wt412||q.ph==='tin'||q.ph==='tout')&&q.d===d){ /* ждущий у переулка (стоит) не мешает выезду — иначе взаимная блокировка */ const rel=(q.x-x)*d; if(rel>-back&&rel<fwd+20) return true; } return false; }
{ const L=SEV.light, u0=L.update;
  L.update=function(z,dt){ const keep=z.vc; z.vc=[]; const vt=z.vcT; z.vcT=99; u0.call(this,z,dt); z.vc=keep; z.vcT=vt; r412VcTick(z,dt); };
  L.drawCars=function(z,front){ const h=G.hero, g=st4Geo(); ctx.save(); ctx.beginPath(); ctx.rect(-50,g.facadeB-42,W+100,H); ctx.clip();
    for(const q of [...z.vc].sort((a,b)=>a.y-b.y)){ if(q.ph!=='down'&&q.ph!=='up') continue; if((q.y>h.y)!==front) continue; const sx=q.x-G.cam, k=r412K(q.y); r412DrawView(q.mi,q.ph==='down'?'front':'rear',sx,Math.round(q.y),k,false); if(q.hk>0) st4Honk(h,q.x,Math.round(q.y-26)); }
    ctx.restore(); }; }
// ракурс по курсу машины на дуге: 0° — к нам/от нас, 90° — вдоль дороги; ближайший из 0/15/30/45/60/90
function r412TurnView(q){ const deg=(q.th||0)*180/Math.PI, a=q.ph==='tout'?deg:90-deg, n=a<7.5?0:a<22.5?1:a<37.5?2:a<52.5?3:a<75?4:5;
  return (q.ph==='tout'?['front','f15','f30','f45','f60','side']:['rear','r15','r30','r45','r60','side'])[n]; }
function r412VcDrawRoad(z,far){ if(!z||z.ev!=='light'||!z.vc) return; for(const q of z.vc){ if(q.ph==='down'||q.ph==='up') continue; const lane=q.ph==='tout'?q.d:q.d; if((lane>0)!==far) continue; const sx=q.x-G.cam, y=Math.round(q.y);
    if(q.ph==='min') r412DrawSide(q.mi,q.d,q.x,y);
    else if(q.ph==='tout'||q.ph==='tin'){ const v=r412TurnView(q); if(v==='side') r412DrawSide(q.mi,q.d,q.x,y); else r412DrawView(q.mi,v,sx,y,r412K(q.y),q.d<0&&v!=='front'&&v!=='rear'); }
    if(q.hk>0) st4Honk(G.hero,q.x,y-28); } }
{ const _cd=st4CarsDraw; st4CarsDraw=function(z){ try{ r412VcDrawRoad(z,true); }catch(e){} const r=_cd.apply(this,arguments); try{ r412VcDrawRoad(z,false); }catch(e){} return r; }; }
// поток: разгон машин, вывернувших из переулка; задние не проезжают сквозь стоящих/медленных (тормозят)
{ const _ct=st4CarsTick; st4CarsTick=function(z,dt){ const r=_ct.apply(this,arguments); if(!z||z.ev!=='light'||!z.vc) return r;
    for(const q of z.cars){ if(q.vt412){ q.v=Math.min(q.vt412,q.v+70*dt); if(q.v>=q.vt412) q.vt412=0; } }
    for(const d of [1,-1]){ const obs=[...z.cars.filter(q=>q.dir===d).map(q=>({a:q.x,b:q.x+(q.w||60),q})),...z.vc.filter(q=>(q.ph==='min'||q.ph==='tin'||q.ph==='tout')&&(q.d===d||(q.ph!=='min'&&Math.abs(q.y-r412Lane(d))<12))).map(q=>{ const w=r412SideW(q.mi); return {a:q.x-w/2,b:q.x+w/2,v:q}; })]; /* машина, пересекающая полосу в повороте, — тоже препятствие */
      obs.sort((A,B)=>d>0?B.b-A.b:A.a-B.a); // от головы колонны к хвосту
      for(let i=1;i<obs.length;i++){ const A=obs[i-1], B=obs[i]; if(!B.q) continue; const q=B.q, w=q.w||60; B.q.brake412=0;
        if(d>0&&B.b>A.a-10){ q.x=A.a-10-w; q.brake=1; q.brake412=1; B.a=q.x; B.b=q.x+w; } else if(d<0&&B.a<A.b+10){ q.x=A.b+10; q.brake=1; q.brake412=1; B.a=q.x; B.b=q.x+w; } else if(q.brake412===0&&q.brake===1&&!q.spl) q.brake=0; } }
    return r; }; }
function r412VcTick(z,dt){ const h=G.hero, g=st4Geo(), cx=z.cx, CW=z.cw, vx=cx+CW/2, stopY=z.y0-9, L=SEV.light, pedGreen=z.v!==1&&L.green(z), yTop=g.facadeB-42, yRoad=g.roadY+2;
  // спавн: 60% — из переулка (выезд), 40% — с дороги в переулок
  z.vcT412=(z.vcT412===undefined?.4:z.vcT412)-dt;
  if(z.vcT412<=0&&z.vc.length<3){ const mi=Math.floor(Math.random()*R412C.M.length); if(Math.random()<.6) z.vc.push({ph:'down',mi,x:vx-12*r412K(yTop),y:yTop,v:z.v===1?48:72,d:Math.random()<.5?1:-1,hk:0});
    else { const d=Math.random()<.5?1:-1, x=d>0?G.cam-50:G.cam+W+50; if(!r412LaneBusy(z,d,x,80,120)) z.vc.push({ph:'min',mi,d,x,y:r412Lane(d),v:100,hk:0}); }
    z.vcT412=z.v===1?rnd(2.2,4):rnd(1.4,2.2); }
  for(const q of z.vc){ if(!q.ph){ q.ph='down'; q.mi=q.mi|0; q.d=q.d||1; } q.hk=Math.max(0,(q.hk||0)-dt); }
  const D=z.vc.filter(q=>q.ph==='down').sort((a,b)=>b.y-a.y), U=z.vc.filter(q=>q.ph==='up').sort((a,b)=>a.y-b.y), busyTurn=z.vc.some(q=>q.ph==='tin'||q.ph==='tout');
  // вниз по переулку: стоп-линия на зелёный для пешеходов, дистанция, уступить потоку перед поворотом
  for(let i=0;i<D.length;i++){ const q=D[i], ahead=D[i-1]; let lim=(pedGreen&&q.y<=stopY+1)?stopY:yRoad;
    if(ahead) lim=Math.min(lim,ahead.y-26*r412K(ahead.y)); if(z.vc.some(o=>o.ph==='tout'&&o.t<.6)) lim=Math.min(lim,g.roadY-2);
    const near=Math.abs(h.x-q.x)<20&&h.y>q.y-2&&h.y-q.y<34; if(near&&z.v===1&&q.y<z.y0) lim=Math.min(lim,q.y);
    const y0=q.y; q.y=Math.min(q.y+q.v*dt,Math.max(q.y,lim)); q.mv=(q.y-y0)/Math.max(dt,1e-4); q.x=vx-12*r412K(q.y);
    if(q.y>=yRoad-.01){ const tx=vx+q.d*30; if(!r412LaneBusy(z,q.d,tx,190,60)&&!z.vc.some(o=>o.ph==='tin')&&!(q.d<0&&r412LaneBusy(z,1,vx,190,60))){ q.ph='tout'; q.t=0; q.xs=q.x; q.ys=q.y; q.xe=vx+q.d*30; q.ye=r412Lane(q.d); } } }
  // с дороги: подъезд к переулку, ждать зелёный для машин и свободный переулок
  for(const q of z.vc.filter(q=>q.ph==='min')){ const w=r412SideW(q.mi), xs=vx+12-q.d*44, dist=(xs-q.x)*q.d; const canGo=!pedGreen&&!D.some(o=>o.y>stopY+4)&&!busyTurn&&!(q.d<0&&r412LaneBusy(z,1,vx+12,150,70)); /* из ближней полосы — через дальнюю: она должна быть свободна */
    const vT=dist<110?Math.max(28,dist*.9):100; q.v+=(vT-q.v)*Math.min(1,dt*3); let nx=q.x+q.d*q.v*dt; if(!canGo&&(xs-nx)*q.d<0) nx=xs; q.x=nx; q.mv=q.v; q.wt412=!canGo&&Math.abs(xs-q.x)<3;
    if(canGo&&(xs-q.x)*q.d<=1){ q.ph='tin'; q.t=0; q.xs=q.x; q.ys=q.y; q.xe=vx+12; q.ye=yRoad; } }
  // повороты (четверть дуги, 0.7 с)
  for(const q of z.vc.filter(q=>q.ph==='tout'||q.ph==='tin')){ q.t=Math.min(1,q.t+dt/R412.TURN_T); const e=q.ph==='tout'?1-Math.cos(q.t*Math.PI/2):.5-.5*Math.cos(q.t*Math.PI), th=e*Math.PI/2; q.th=th;
    if(q.ph==='tout'){ q.x=q.xs+(q.xe-q.xs)*(1-Math.cos(th)); q.y=q.ys+(q.ye-q.ys)*Math.sin(th); }
    else { q.x=q.xs+(q.xe-q.xs)*Math.sin(th); q.y=q.ys+(q.ye-q.ys)*(1-Math.cos(th)); }
    if(q.t>=1){ if(q.ph==='tout'){ const m=R412C.M[q.mi], w=r412SideW(q.mi); const vx0=Math.min(120,Math.abs(q.xe-q.xs)*Math.PI*Math.PI/4/R412.TURN_T); z.cars.push({spr:m.spr,dir:q.d,x:q.xe-w/2,v:Math.max(45,vx0),vt412:rnd(90,130),w,from412:1}); q.dead=1; tev('light_merge'); }
      else { q.ph='up'; q.v=14; } } }
  // вверх по переулку: уходит за гребень (обрезка по верху переулка)
  for(let i=0;i<U.length;i++){ const q=U[i]; q.v=Math.min(58,q.v+50*dt); const y0=q.y; q.y-=q.v*r412K(q.y)*dt; q.mv=(y0-q.y)/Math.max(dt,1e-4); q.x=vx+12*r412K(q.y); if(q.y<yTop-2) q.dead=1; }
  // гудок/сбило — как раньше, только движущаяся машина на тротуаре
  for(const q of z.vc){ if(q.dead||(q.ph!=='down'&&q.ph!=='up'&&q.ph!=='tin'&&q.ph!=='tout')) continue; if(!(q.mv>5)) continue;
    const near=Math.abs(h.x-q.x)<20&&((q.ph==='up')?(h.y<q.y+2&&q.y-h.y<34):(h.y>q.y-2&&h.y-q.y<34));
    if(near&&!q.hk&&Math.abs(h.y-q.y)<26){ q.hk=1.2; st4Beep(); tev('honk'); }
    if(!h.stun&&Math.abs(h.x-q.x)<16&&Math.abs(h.y-q.y)<6&&q.y>z.y0-4&&q.y<z.y1+6){ tev('light_hit'); penalize(3,'honk'); TR.nerves=Math.max(0,TR.nerves-5); h.x=Math.min(h.x,cx)-40+20; h.x=Math.max(8,h.x); h.stun=.45; h.set('hurt'); SFX.hurt(); shake(2); haptic('error'); pop('−3 с',h.x,h.y-52,'#ff8a8a',8); say('БИИП! На красный нельзя — откинуло назад',2,'#ffd23f'); } }
  z.vc=z.vc.filter(q=>!q.dead&&!(q.ph==='min'&&(q.d>0?q.x>G.cam+W+120:q.x<G.cam-120))); }

// ---------- 6) обход глюков NPC (детекторы test/npcstuck.js) ----------
// а) МЦД/МЦК: правило «стоящие не под стиком/кнопками» телепортировало NPC на 50–110 px за кадр (и обратно при движении камеры) → плавный сдвиг ≤140 px/с.
// б) любые зоны: двое стоящих NPC в одной точке (первый кадр зоны «выталкивает» всех из-под кнопок к одному краю) → мягко разводим.
// в) турникеты: новые в очередь появлялись у видимого края зала (x=8) → входят из-за края экрана.
// г) кофейня: ушедший с кофе исчезал посреди экрана, новый появлялся в хвосте → уходит/приходит из-за края экрана.
// д) светофор: новые ждущие появлялись у зебры → подходят слева из-за края экрана.
const R412W=new WeakMap(); function r412Own(e,k,mk){ let o=e[k]; if(!o||R412W.get(o)!==e){ o=e[k]=mk(); R412W.set(o,e); } return o; } // состояние не делится между клонами NPC
function r412Off(z){ return G.cam-26; }
function r412Destack(z,dt){ const A=(z.npcs||[]).filter(e=>!e.hide&&!e.ghost&&!e.sit&&!e.seat&&!(e.pin&&!e.ctl)&&!(e.ctl&&!e.pin)&&!e.slip412&&!e.inQ&&!e.q);
  for(let i=0;i<A.length;i++) for(let j=i+1;j<A.length;j++){ const a=A[i], b=A[j]; if(Math.abs(a.x-b.x)<5&&Math.abs(a.y-b.y)<3){ const m=a.dk412||(a.dk412=new Map()), t=(m.get(b)||0)+dt; m.set(b,t); if(t<.35) continue; const s=a.x<b.x?-1:a.x>b.x?1:(i%2?1:-1), v=(z.k==='car'?24:40)*dt; if(a.leaving!==undefined||b.leaving!==undefined){ const m=(a.leaving!==undefined&&b.leaving!==undefined)?b:(a.leaving!==undefined?b:a), sm=m===b?-s:s; m.x+=sm*v*1.4; if(m.hx!==undefined) m.hx+=sm*v*1.4; continue; } a.x+=s*v; b.x-=s*v; if(a.hx!==undefined) a.hx+=s*v; if(b.hx!==undefined) b.hx-=s*v;
      if(z.y0!==undefined){ const sy=a.y<=b.y?-1:1; a.y=clamp(a.y+sy*v*.5,z.y0,z.y1); b.y=clamp(b.y-sy*v*.5,z.y0,z.y1); } } } }
{ const _tu=tripUpdate; tripUpdate=function(dt){ const z=TR.z, live=G.scene==='trip'&&z&&!TR.smod&&!paused;
    const pre=live&&z.k==='mtrain'?new Map(z.npcs.map(e=>[e,e.x])):null, ids=live?new Set(z.npcs):null;
    const cofL=live&&z.k==='street'&&z.ev==='coffee'&&z.q?z.q.filter(e=>z.npcs.includes(e)):null;
    const cofX=cofL?new Map(z.q.filter(e=>!e.leave).map(e=>[e,e.x])):null;
    const preF=live?z.npcs.map(e=>[e,e.face]):[]; // стоящий не «мигает» разворотами чаще 1 раза за 0.4 с
    const hN0=e=>{ const h=G.hero; return h&&Math.abs(e.x-h.x)<30&&Math.abs(e.y-h.y)<16; }, hN=e=>e.inSoft||hN0(e); // рядом с героем — не «замораживать» (герой толкает/проходит)
    const preO=live?z.npcs.filter(e=>!e.ctl&&!e.sit&&!e.slip412&&e!==G.hero&&!hN0(e)).map(e=>[e,e.x,e.y]):[]; // «дрожь на месте»: толкает вперёд, отбрасывает назад
    const preW=live?z.npcs.filter(e=>e.wait411>0&&!e.ctl&&!e.slip412&&!hN(e)).map(e=>[e,e.x,e.y]):[]; // ждёт (idle) — не скользит боком
    const pinT=pre?z.npcs.filter(e=>!e.pin&&(e.seek!==undefined||e.leaving!==undefined)):[]; for(const e of pinT){ e.pin=true; e.p412=1; } // идущие к месту/к двери — не под правило «не под кнопками»
    const r=_tu.apply(this,arguments);
    for(const e of pinT){ if(e.p412){ e.p412=0; if(!e.sit) e.pin=false; } }
    const mid=live&&z.k==='car'?z.npcs.map(e=>[e,e.x,e.y]):null; // вагон: правки r412 не дают рывков >0.4 px/кадр (V40 плавность)
    try{ if(!live||TR.z!==z||!(dt>0)) return r;
      if(pre&&z.tbs){ for(const e of z.npcs) if(!pre.has(e)&&e.seek!==undefined){ const d=z.tbs.map(t=>t.door).filter(x=>x!=null).reduce((a,b)=>Math.abs(b-e.x)<Math.abs(a-e.x)?b:a,1e9); if(Math.abs(d-e.x)<130){ const k=(R412.dk=R412.dk||{})[d]=(R412.dk[d]||0)+1, off=[0,-9,9,-18,18][(k-1)%5]; e.x=d+off; if(z.y0!==undefined&&z.y1!==undefined) e.y=Math.max(z.y0+2,Math.min(z.y1-2,e.y+((k-1)%3-1)*5)); } } R412.dk={}; for(const e of z.npcs) if(e.seek!==undefined){ const d=z.tbs.map(t=>t.door).filter(x=>x!=null).find(x=>Math.abs(x-e.x)<20); if(d!==undefined) R412.dk[d]=(R412.dk[d]||0)+1; } }
      if(pre){ const mx=Math.max(2,140*dt); for(const e of z.npcs){ const x0=pre.get(e); if(x0===undefined||e.sit||e.ctl||e.pin||e.ghost||e.leaving!==undefined||e.seek!==undefined) continue; const d=e.x-x0; if(Math.abs(d)>6){ e.x=x0+Math.sign(d)*mx; e.face=Math.sign(d); e.slide412=.15; } if(e.slide412>0){ e.slide412-=dt; e.set('walk'); } } }
      if(z.k==='plat'&&z.L!==undefined||z.k==='plat'){ const L=z.len||z.L||W; for(const e of z.npcs) if(!ids.has(e)&&e.door&&!e.out){ if(e.x<=6&&e.x-G.cam>-20) e.x=Math.min(6,G.cam-26); else if(e.x>=L-6&&e.x-G.cam<W+20) e.x=Math.max(L-6,G.cam+W+26); } }
      if(z.k==='mplat'&&z.hx===undefined){ for(const e of z.npcs) if(!ids.has(e)&&e.hx!==undefined&&!e.ctl){ const sx=e.x-G.cam; if(Math.abs(e.x-(SA.l+70))<1&&sx>-20) e.x=G.cam-24; else if(Math.abs(e.x-(W-140))<1&&sx<W+20) e.x=G.cam+W+24; } }
      if(z.k==='gate'){ for(const e of z.npcs) if(!ids.has(e)&&!e.ctl&&e.x<=14&&e.x-G.cam>-20){ e.x=r412Off(z); e.in412=1; } }
      if(cofL){ for(const e of cofL) if(!z.npcs.includes(e)&&e.x-G.cam<W+30&&e.x-G.cam>-30){ e.q=0; e.left412=1; e.ghost=true; e.noSolid=true; e.wait411=0; z.npcs.push(e); } }
      if(z.k==='street'&&z.ev==='coffee'){ for(const e of z.npcs){ if(e.left412){ e.x+=30*dt; e.face=1; e.wait411=0; e.side411=0; e.set('walk'); } else if(e.q&&!ids.has(e)&&e.x-G.cam>-20&&e.x-G.cam<W+20){ e.x=Math.min(e.x,r412Off(z)); e.set('walk'); } else if(e.q&&!e.leave&&e.vx>0) e.set('walk'); }
        if(cofX){ let i=0; for(const e of z.q){ if(e.leave) continue; const tx=z.kx-6-i*15; i++; e.wait411=0; e.side411=0; const x0=cofX.get(e); if(x0!==undefined&&e.x<tx-.5&&e.x-x0<13*dt){ e.x=Math.min(tx,x0+26*dt); e.face=1; e.set('walk'); } } }
        z.npcs=z.npcs.filter(e=>!(e.left412&&e.x-G.cam>W+40)); }
      if(z.k==='street'&&z.ev==='light'&&z.wait){ for(const e of z.wait){ if(!ids.has(e)&&!e.go&&e.x-G.cam>-20){ e.tx412=e.x; e.x=Math.min(e.x,r412Off(z)); }
          if(e.tx412!==undefined){ if(e.go){ e.tx412=undefined; continue; } const stuck=e.lx412!==undefined&&Math.abs(e.x-e.lx412)<.05; if(e.x<e.tx412-.5&&!stuck){ e.x=Math.min(e.tx412,e.x+34*dt); e.face=1; e.set('walk'); e.lx412=e.x; } else { e.tx412=undefined; e.lx412=undefined; e.set('idle'); } } } }
      for(const [e,f] of preF){ e.fT412=(e.fT412||0)+dt; if(e.face!==f){ if(e.fT412<(e.st==='idle'?.4:.3)&&!e.slip412&&!e.ctl&&e!==G.hero) e.face=f; else e.fT412=0; } }
      for(const [e,x,y] of preO){ const o=r412Own(e,'os412',()=>({t:0,n:0,s:0,h:0})); if(o.h>0&&(e.inSoft||o.sf>0)){ o.h-=dt; e.x=x+(e.x-x)*.3; e.y=y+(e.y-y)*.3; e.set('idle'); continue; } if(e.inSoft) o.sf=.6; else if(o.sf>0) o.sf-=dt; if(o.h>0){ o.h-=dt; e.x=x; e.y=y; if(e.blockT!==undefined||e.flow) e.blockT=Math.max(e.blockT||0,dt*1.5); e.set('idle'); continue; } const dx=e.x-x; if(Math.abs(dx)>.05){ const sg=Math.sign(dx); if(o.s&&sg!==o.s) o.n++; o.s=sg; } o.t+=dt; if(o.t>=1||o.n>=3){ if(o.n>=3&&Math.abs(e.x-(o.x0??e.x))<6){ o.h=(o.rep=(o.rep||0)+1)>1?2.5:1.2; e.x=x; e.y=y; e.set('idle'); } o.t=0; o.n=0; o.x0=e.x; } if(o.x0===undefined) o.x0=e.x; }
      for(const [e,x,y] of preW) if(e.wait411>0&&!e.inSoft){ e.x=x; e.y=y; e.side411=0; }
      if(z.k!=="street"&&z.y0!==undefined&&z.y1!==undefined){ for(const e of [...z.npcs,...(z.extra||[])]){ if(e===G.hero||e.ghost||e.seat||e.sit||e.ctl||e.hide||(e.z>0)) continue; if(e.y>z.y1+6){ const S=(z.solids||[]).find(q=>e.x>q[0]-(e.r||6)-1&&e.x<q[2]+(e.r||6)+1&&q[3]>=z.y1-2); if(S&&!e.noSolid){ const L=e.x-S[0], R=S[2]-e.x; e.x+=(L<R?-1:1)*150*dt; if(e.flow) e.dir=L<R?-1:1; } else e.y=Math.max(z.y1+6,e.y-40*dt); } else if(e.y<z.y0-6) e.y=Math.min(z.y0-6,e.y+40*dt); } } // вытолкнули за пол — плавно назад
      r412Destack(z,dt);
      if(mid){ const m=24*dt; for(const [e,x,y] of mid){ if(e.slip412) continue; if(Math.abs(e.x-x)>m) e.x=x+Math.sign(e.x-x)*m; if(Math.abs(e.y-y)>m) e.y=y+Math.sign(e.y-y)*m; } }
      { for(const e of z.npcs){ if(e===G.hero||e.slip412||(e.st!=='walk'&&!(e.wp412&&e.wp412.i>0))){ e.wp412=null; continue; } const w=r412Own(e,'wp412',()=>({x:e.x,y:e.y,t:0,i:0,n:0,h:[]})); w.t+=dt; w.T=(w.T||0)+dt; w.h.push([e.x,e.y,w.T]); while(w.h.length&&w.T-w.h[0][2]>1.15) w.h.shift(); for(const q of w.h){ const a=w.T-q[2]; if(a<.45) break; if(Math.hypot(e.x-q[0],e.y-q[1])<(a<.6?1.6:2.3)){ w.i=Math.max(w.i,.3); break; } } /* по времени */ if(w.i>0){ w.i-=dt; e.set('idle'); } if(w.ax===undefined||Math.hypot(e.x-w.ax,e.y-w.ay)>2){ w.ax=e.x; w.ay=e.y; w.at=0; } w.at+=dt; if(w.at>.5){ w.i=Math.max(w.i,.1); e.set('idle'); } if(w.t>=.5){ const d=Math.hypot(e.x-w.x,e.y-w.y); if(d<1.2){ w.i=.5; w.n++; e.set('idle'); if(w.n>=1&&e.seek!==undefined&&!e.sit&&z.k==='mtrain') e.seek=undefined; } else w.n=0; w.x=e.x; w.y=e.y; w.t=0; } } } // «шаг на месте»: стоит, а не перебирает ногами (по итоговой позиции кадра)
    }catch(e){ if(!R412.err) R412.err=String(e); }
    return r; }; }

// ---------- 7) подсказки мира (МЕСТО и т.п.) не наезжают на подпись джойстика «ДВИГАЙ» (первые 6 с) ----------
{ const _d=drawTrip; drawTrip=function(){ const r=_d.apply(this,arguments); try{ const L=G.labels, k=L&&L.find(l=>l[0]==='ДВИГАЙ'); if(k){ const bx=(l)=>{ const hw=txtW(l[0],l[3])/2+2, hh=l[3]/2+2, cx=l[5]==='left'?l[1]+hw:l[5]==='right'?l[1]-hw:l[1]; return [cx-hw,l[2]-hh,cx+hw,l[2]+hh]; }, K=bx(k);
      G.labels=L.filter(l=>{ if(l===k||typeof l[0]!=='string') return true; const B=bx(l); return !(B[2]>K[0]&&B[0]<K[2]&&B[3]>K[1]&&B[1]<K[3]); }); } }catch(e){ if(!R412.err) R412.err=String(e); } return r; }; }

// ---------- 8) вагоны (метро/МЦК/МЦД): подсказки МЕСТО/ПОРУЧЕНЬ/СКОРО/ТАМБУР не налезают друг на друга, на рекламу и на ДВИГАЙ ----------
function r412LabBox(l){ const s=Math.max(l[3],typeof MINPX==='function'?MINPX():0), hw=txtW(l[0],s)/2+2, hh=s*.62+1, al=l[5]||'center', cx=al==='left'?l[1]+hw-2:al==='right'?l[1]-hw+2:l[1]; return [cx-hw,l[2]-hh,cx+hw,l[2]+hh]; }
function r412AdRects(z){ const R=[]; if(z.k==='car'){ const MT=car4MT(); R.push([-10,MT+5,W+10,MT+19]); }
  else if(z.k==='mtrain'){ const MT=FY0-66, ay=Math.round(MT*.7)+1, ah=Math.max(12,Math.round(MT*.16)), c=G.cam, lx=z.layX||0;
    for(const car of z.cars||[]) (car.mods||[]).forEach((m,mi)=>{ if(m.part!=='seat'||(mi+car.i)%2) return; const ax=Math.round(m.x-c)+12+lx; if(ax>W+4||ax<-48) return; R.push([ax-2,ay-2,ax+42,ay+ah+2]); }); }
  return R; }
const R412HINT=/^(⚡?МЕСТО|ПОРУЧЕНЬ|СКОРО|ТАМБУР)$/;
function r412HintLayout(){ const z=TR.z; R412.hl=null; if(G.scene!=='trip'||!z||(z.k!=='car'&&z.k!=='mtrain')) return;
  const L=G.labels, hit=(A,B)=>A[2]>B[0]&&A[0]<B[2]&&A[3]>B[1]&&A[1]<B[3], ads=r412AdRects(z);
  const fixed=L.filter(l=>typeof l[0]==='string'&&!R412HINT.test(l[0])).map(r412LabBox), hx=G.hero.x-G.cam;
  const hints=L.filter(l=>typeof l[0]==='string'&&R412HINT.test(l[0])), pri=l=>/МЕСТО/.test(l[0])?0:l[0]==='ПОРУЧЕНЬ'?1:2;
  hints.sort((a,b)=>pri(a)-pri(b)||Math.abs(a[1]-hx)-Math.abs(b[1]-hx));
  const placed=[], drop=new Set(), top=(SA.t||0)+56; let moved=0;
  for(const l of hints){ const y0=l[2]; let ok=false;
    for(const dy of [0,-3,3,-6,6,-9,9,-12,-15,-18,-21,-24,-27,-30,-34,-38,-42,-46,-50]){ l[2]=y0+dy; const B=r412LabBox(l); if(B[1]<top||B[3]>H-2) continue;
      if(ads.some(a=>hit(B,a))||fixed.some(a=>hit(B,a))||placed.some(a=>hit(B,a))) continue; ok=true; if(dy) moved++; placed.push(B); break; }
    if(!ok){ l[2]=y0; drop.add(l); } }
  if(drop.size) G.labels=L.filter(l=>!drop.has(l)); R412.hl={n:hints.length,moved,drop:drop.size,ads:ads.length}; }
{ const _d=drawTrip; drawTrip=function(){ const r=_d.apply(this,arguments); try{ r412HintLayout(); }catch(e){ if(!R412.err) R412.err=String(e); } return r; }; }
