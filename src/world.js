'use strict';
// ================= МИР: фон станции/вагона, эмбиент =================
let FY0=154,FY1=206; // полоса пола (глубина)
function floorBand(){ FY1=H-8-Math.min(SA.b,6); FY0=FY1-50; }
const BG={cache:{},trains:[],amb:[],dust:[],t:0};
function bgReset(lv){ BG.trains=[]; BG.amb=[]; BG.dust=[]; BG.t=0; BG.nextTrain=rnd(3,7); BG.lv=lv; BG.flick={};
  // ждущие на платформе пассажиры-фон (силуэты) и голуби
  const ty=['polite','aunt','kid','tourist','bag','seeds','musician']; for(let i=0;i<12;i++) BG.amb.push({k:'pax',x:rnd(0,lv.len),bob:rnd(0,6),spec:EN[pick(ty)].spec(),f:Math.random()<.5,pose:pick(['idle','idle','cheer','sit'])});
  BG.deco=[]; const kinds=['clock','mosaic','neon','vend','bench','kiosk','map','graf','plant']; let sd=(lv.w||0)*31+(lv.i||0)*7+3; const pk=()=>{ sd=(sd*9301+49297)%233280; return sd/233280; }; const chosen=[kinds[Math.floor(pk()*kinds.length)],kinds[Math.floor(pk()*kinds.length)]]; for(let x=90;x<lv.len*.6+W;x+=170) BG.deco.push({x,k:chosen[(x/170|0)%2],v:Math.floor(pk()*4)});
  for(let i=0;i<5;i++) BG.amb.push({k:'pig',x:rnd(0,lv.len),y:rnd(0,1),t:rnd(0,9),vx:0});
  for(let i=0;i<30;i++) BG.dust.push({x:rnd(0,600),y:rnd(0,140),v:rnd(2,6),p:rnd(0,6)});
}
function bgUpdate(dt,cam){ BG.t+=dt; const lv=BG.lv; if(!lv) return;
  if(lv.bg==='station'){ BG.nextTrain-=dt; if(BG.nextTrain<=0){ BG.nextTrain=rnd(9,16); const dir=Math.random()<.5?1:-1; BG.trains.push({x:dir>0?cam*.85-420:cam*.85+W+40,dir,v:0,st:'in',t:0}); SFX.train(); }
    for(const tr of BG.trains){ tr.t+=dt; if(tr.st==='in'){ tr.x+=tr.dir*220*dt; if(tr.t>2.2){tr.st='stop';tr.t=0;} } else if(tr.st==='stop'){ if(tr.t>3){tr.st='out';tr.t=0; if(Math.random()<.5) say('Осторожно, двери закрываются!',2.2,'#ffd23f'); } } else tr.x+=tr.dir*260*dt*Math.min(1,tr.t*1.2); }
    BG.trains=BG.trains.filter(t=>t.t<4||t.st!=='out'); }
  for(const a of BG.amb) if(a.k==='pig'){ a.t+=dt; if(a.vx){ a.x+=a.vx*dt; a.y-=dt*30; if(a.y<-80){a.vx=0;a.y=rnd(0,1);a.x=cam+rnd(0,W);} }
    else if(Math.random()<dt*.6) a.x+=pick([-3,3]);
    if(!a.vx&&G.hero&&Math.abs(G.hero.x-a.x)<20&&Math.abs(G.hero.y-(FY0+6+a.y*40))<12){ a.vx=pick([-60,60]); a.y=-1; SFX.squeak(); } }
}
function drawBG(cam){ const lv=BG.lv, lc=LINE_COL[lv.line], t=BG.t;
  if(lv.bg==='car') return drawCar(cam,lc,t);
  const wallB=FY0-22; // низ стены = верх путей
  // стена: плитка с параллаксом 0.6
  const px=Math.floor(cam*.6);
  ctx.fillStyle=lv.tile||P.tile; ctx.fillRect(0,0,W,wallB);
  ctx.fillStyle=lv.grout||P.grout;
  for(let y=6;y<wallB;y+=8) ctx.fillRect(0,y,W,1);
  for(let y=6,r=0;y<wallB;y+=8,r++) for(let x=-((px+(r%2)*6)%12);x<W;x+=12) ctx.fillRect(x,y,1,8);
  // полоса цвета ветки + шахматка
  ctx.fillStyle=lc; ctx.fillRect(0,wallB-26,W,7); ctx.fillStyle=shade(lc,-.35); for(let x=-(px%8);x<W;x+=8) ctx.fillRect(x,wallB-26,4,3);
  ctx.fillStyle=shade(lv.tile||P.tile,-.25); ctx.fillRect(0,wallB-6,W,6);
  // таблички с названием станции (текстом на оверлее) и пародийная реклама
  const spans=BG.trains.map(tr=>[tr.x-cam*.85-4,tr.x-cam*.85+404]); const hid=(x,y,w)=>y>wallB-52&&spans.some(s=>x+w/2>s[0]&&x-w/2<s[1]);
  const pushL=l=>{ if(!hid(l[1],l[2],txtW(l[0],l[3]))) G.labels.push(l); };
  for(let i=Math.floor(px/170)-1;i<=Math.floor((px+W)/170)+1;i++){ const sx=i*170-px+30;
    if(i%2===0){ ctx.fillStyle=P.ink; ctx.fillRect(sx-2,wallB-58,104,22); ctx.fillStyle=shade(lc,-.55); ctx.fillRect(sx,wallB-56,100,18);
      pushL([lv.name,sx+50,wallB-47,8,'#fff']); }
    else { // постер-пародия
      const ad=AD[(i%AD.length+AD.length)%AD.length]; ctx.fillStyle=P.ink; ctx.fillRect(sx-2,wallB-70,96,40); ctx.fillStyle=ad.c; ctx.fillRect(sx,wallB-68,92,36);
      ctx.fillStyle=shade(ad.c,.35); ctx.fillRect(sx+3,wallB-65,20,20); ctx.fillStyle=shade(ad.c,-.4); ctx.fillRect(sx+6,wallB-58,14,10);
      pushL([ad.t,sx+46,wallB-58,6.5,'#fff']); pushL([ad.s,sx+56,wallB-41,6,P.edge]); }
  }
  const FLOORD=['vend','bench','kiosk','plant'];
  for(const d of BG.deco||[]){ if(FLOORD.includes(d.k)) continue; const sx=Math.round(d.x-px+85); if(sx<-60||sx>W+60) continue; drawDeco(d,sx,wallB,lc,t); }
  // лампы-светильники (натриевый свет, мигают)
  const lpx=Math.floor(cam*.6);
  for(let i=Math.floor(lpx/64)-1;i<=Math.floor((lpx+W)/64)+1;i++){ const lx=i*64-lpx+20; const fl=lv.flicker&&((i*7+Math.floor(t*9))%23===0);
    ctx.fillStyle=P.ink; ctx.fillRect(lx-9,3,22,5); ctx.fillStyle=fl?'#6a5a3a':P.lampHot; ctx.fillRect(lx-8,4,20,3);
    if(!fl){ ctx.globalAlpha=.10; ctx.fillStyle=P.lamp; ctx.beginPath(); ctx.moveTo(lx-8,7); ctx.lineTo(lx+12,7); ctx.lineTo(lx+34,wallB); ctx.lineTo(lx-30,wallB); ctx.fill(); ctx.globalAlpha=1; } }
  // пылинки в свете
  ctx.fillStyle='#fff3c0'; for(const d of BG.dust){ const x=((d.x-cam*.6)%W+W)%W, y=(d.y+t*d.v)%wallB; if(Math.sin(t*2+d.p)>.2) ctx.fillRect(x|0,y|0,1,1); }
  wallFog(wallB);
  // пути
  ctx.fillStyle='#231b2b'; ctx.fillRect(0,wallB,W,FY0-wallB);
  const rpx=Math.floor(cam*.85); ctx.fillStyle='#3a2f2a'; for(let x=-(rpx%10);x<W;x+=10) ctx.fillRect(x,wallB+12,5,3);
  ctx.fillStyle='#8a8a9a'; ctx.fillRect(0,wallB+11,W,1); ctx.fillRect(0,wallB+16,W,1);
  // поезда
  for(const tr of BG.trains) drawTrain(tr.x-cam*.85, wallB, lc, tr);
  // край платформы
  ctx.fillStyle=P.edge; ctx.fillRect(0,FY0-4,W,3); ctx.fillStyle=P.ink; ctx.fillRect(0,FY0-1,W,1);
  // пол: гранит с плитами
  ctx.fillStyle=lv.floor||P.floor; ctx.fillRect(0,FY0,W,H-FY0);
  const fpx=Math.floor(cam); persFloor(cam,lv.floor2||P.floor2,40);
  for(const d of BG.deco||[]){ if(!['vend','bench','kiosk','plant'].includes(d.k)) continue; const sx=Math.round(d.x*1.4-cam); if(sx<-60||sx>W+60) continue; drawDeco(d,sx,FY0+2,lc,t); }
  // блики ламп на полу

  floorAO(); lampPools(cam);
  // фон-пассажиры у стены (силуэты, на платформе у края)
  for(const a of BG.amb){ const sx=Math.floor(a.x-cam); if(sx<-20||sx>W+20) continue;
    if(a.k==='pax'&&lv.bg==='station'){ const img=personSprite(a.spec,a.pose,Math.floor(t*4+a.bob)%4,'norm',Math.floor(t*10)); ctx.save(); ctx.filter='brightness(.55) saturate(.7)'; ctx.translate(sx,FY0-3); if(a.f) ctx.scale(-1,1); ctx.drawImage(img,-24,-46,48,48); ctx.restore(); }
  }
}
function drawPigeons(cam){ if(BG.lv&&BG.lv.bg==='car') return; for(const a of BG.amb) if(a.k==='pig'){ const sx=Math.floor(a.x-cam), sy=Math.floor(FY0+6+Math.max(0,a.y)*40+Math.min(0,a.y)); if(sx<-10||sx>W+10) continue;
  const fl=a.vx!==0, hop=!fl&&Math.sin(a.t*8)>.8?1:0; ctx.fillStyle=P.ink; ctx.fillRect(sx-4,sy-5-hop,9,5); ctx.fillStyle='#8a8aa8'; ctx.fillRect(sx-3,sy-4-hop,7,3); ctx.fillStyle='#6a6a88'; ctx.fillRect(sx+2,sy-7-hop,3,3); ctx.fillStyle='#ff9a3a'; ctx.fillRect(sx+5,sy-6-hop,1,1);
  if(fl){ ctx.fillStyle='#aaa'; const w=Math.sin(a.t*30)>0?-3:1; ctx.fillRect(sx-2,sy-6+w,5,2); } } }
function drawTrain(x,wallB,lc,tr){ x=Math.floor(x); const L=400, y=wallB-48;
  ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,L+2,50); ctx.fillStyle='#4a6a8a'; ctx.fillRect(x,y,L,48); ctx.fillStyle='#3a5a7a'; ctx.fillRect(x,y+36,L,12);
  ctx.fillStyle=lc; ctx.fillRect(x,y+30,L,3);
  for(let i=0;i<L;i+=40){ ctx.fillStyle=P.ink; ctx.fillRect(x+i+6,y+6,26,18); ctx.fillStyle='#ffe9a8'; ctx.fillRect(x+i+7,y+7,24,16);
    // лица в окнах (прилипли)
    const s=(i*13+(tr.dir>0?3:7))%5; ctx.fillStyle=['#ffd0a8','#d89668','#f2b48a','#a8714a','#ffd0a8'][s]; ctx.fillRect(x+i+11+s,y+12,7,8); ctx.fillStyle=P.ink; ctx.fillRect(x+i+12+s,y+14,1,1); ctx.fillRect(x+i+15+s,y+14,2,2); ctx.fillRect(x+i+13+s,y+17,3,1);
    if(i%80===0){ ctx.fillStyle='#2a3a4a'; ctx.fillRect(x+i+34,y+4,5,32); } }
  ctx.fillStyle=P.lampHot; if(tr.dir>0) ctx.fillRect(x+L-4,y+26,3,4); else ctx.fillRect(x+1,y+26,3,4); }
// вагон изнутри
function drawCar(cam,lc,t){ const px=Math.floor(cam*.7); const shake=Math.sin(t*25)>.92?1:0;
  ctx.fillStyle='#d9d2c0'; ctx.fillRect(0,0,W,FY0); ctx.fillStyle='#bfb6a2'; ctx.fillRect(0,0,W,10); ctx.fillStyle=P.lampHot; for(let x=-(px%60);x<W;x+=60) ctx.fillRect(x+10,3,36,3);
  // окна с туннелем, мелькают огни
  for(let x=-(px%90);x<W;x+=90){ ctx.fillStyle=P.ink; ctx.fillRect(x+6,22+shake,62,40); ctx.fillStyle='#1a1424'; ctx.fillRect(x+8,24+shake,58,36);
    const tl=((t*300+x*3)%180); ctx.fillStyle=P.lamp; ctx.fillRect(x+8+((tl)%58),40+shake,2,2);
    ctx.fillStyle='#ffffff18'; ctx.fillRect(x+12,26,8,32); ctx.fillStyle=lc; ctx.fillRect(x+6,64,62,2); }
  // реклама над окнами
  for(let x=-(px%180);x<W;x+=180){ ctx.fillStyle=P.ink; ctx.fillRect(x+90,10,70,10); ctx.fillStyle=lc; ctx.fillRect(x+91,11,68,8); }
  // сиденья
  ctx.fillStyle=P.ink; ctx.fillRect(0,FY0-26,W,1); for(let x=-(px%90);x<W;x+=90){ ctx.fillStyle=shade(lc,-.2); ctx.fillRect(x+4,FY0-24,66,10); ctx.fillStyle=shade(lc,-.45); ctx.fillRect(x+4,FY0-15,66,3); }
  // поручни
  for(let x=-(Math.floor(cam*.9)%90);x<W;x+=90){ ctx.fillStyle='#c8c8d8'; ctx.fillRect(x+80,0,2,FY0); }
  ctx.fillStyle='#bfb6a2'; ctx.fillRect(0,FY0-12,W,12);
  ctx.fillStyle='#7a6a5a'; ctx.fillRect(0,FY0,W,H-FY0); persFloor(cam,'#5a4a3a',30); floorAO();
}
function drawDeco(d,x,wb,lc,t){ const o=(a,b,w,h,c)=>{ ctx.fillStyle=P.ink; ctx.fillRect(a-1,b-1,w+2,h+2); ctx.fillStyle=c; ctx.fillRect(a,b,w,h); };
  switch(d.k){
   case 'clock': { o(x-9,wb-92,18,18,'#fff'); const d0=new Date(); const m=d0.getMinutes()/60*Math.PI*2, hh=(d0.getHours()%12)/12*Math.PI*2; ctx.fillStyle=P.ink; for(let i=0;i<6;i++){ ctx.fillRect(Math.round(x+Math.sin(m)*i),Math.round(wb-83-Math.cos(m)*i),1,1);} for(let i=0;i<4;i++){ ctx.fillRect(Math.round(x+Math.sin(hh)*i),Math.round(wb-83-Math.cos(hh)*i),1,1);} G.labels.push(['опаздываешь',x,wb-68,4.5,P.red,'center',undefined,1]); break; }
   case 'mosaic': o(x-22,wb-96,44,30,'#2a3a6a'); for(let i=0;i<20;i++){ ctx.fillStyle=['#ffd23f','#ff7ab8','#3ff0ff','#fff',lc][(i+d.v)%5]; ctx.fillRect(x-20+(i*7)%40,wb-94+((i*11)%26),4,4);} ctx.fillStyle='#ffd0a8'; ctx.fillRect(x-4,wb-88,8,8); ctx.fillStyle=P.ink; ctx.fillRect(x-2,wb-86,1,1); ctx.fillRect(x+1,wb-86,2,2); ctx.fillRect(x-2,wb-82,4,1); break;
   case 'neon': { const on=!!save.calm||Math.floor(t*3+d.v)%7!==0; o(x-26,wb-92,52,14,'#1a1424'); G.labels.push([['ВЫХОД В ГОРОД ↑','ПЕРЕХОД →','НЕ БЕГАТЬ (беги)','ТИШЕ ЕДЕШЬ'][d.v],x,wb-85,5,on?P.neonPink:'#5a2a4a','center',null,1]); break; }
   case 'vend': o(x-10,wb-40,20,40,'#d83a3a'); o(x-7,wb-36,14,18,'#fff6d0'); for(let i=0;i<6;i++){ ctx.fillStyle=['#3a8ad8','#ffd23f','#8ad83a'][i%3]; ctx.fillRect(x-6+(i%3)*5,wb-34+Math.floor(i/3)*8,3,5);} ctx.fillStyle=P.ink; ctx.fillRect(x-5,wb-12,10,3); break;
   case 'bench': o(x-22,wb-14,44,4,'#a06a3a'); o(x-20,wb-10,3,10,'#5a4a3a'); o(x+17,wb-10,3,10,'#5a4a3a'); o(x-22,wb-24,44,4,'#a06a3a'); if(d.v%2){ ctx.fillStyle='#ffd0a8'; ctx.fillRect(x-4,wb-30,7,6); ctx.fillStyle=P.ink; ctx.fillRect(x-3,wb-28,2,1); ctx.fillRect(x+1,wb-28,2,1); G.labels.push(['z',x+8,wb-36-(t*6%6),5,'#aaf','center',null,1]); } break;
   case 'kiosk': o(x-20,wb-50,40,50,'#3a8a5a'); o(x-16,wb-44,32,18,'#fff6d0'); ctx.fillStyle=P.ink; ctx.fillRect(x-14,wb-40,8,10); ctx.fillStyle='#ff7ab8'; ctx.fillRect(x-4,wb-40,8,10); ctx.fillStyle='#3a6ad8'; ctx.fillRect(x+6,wb-40,8,10); G.labels.push(['ГАЗЕТЫ·ПИРОЖКИ',x,wb-54,4.5,'#fff','center',undefined,1]); break;
   case 'map': o(x-24,wb-90,48,32,'#fff'); for(let i=0;i<4;i++){ ctx.fillStyle=LINE_COL[(i+d.v)%10]; ctx.fillRect(x-20,wb-86+i*7,40,2); ctx.fillRect(x-12+i*8,wb-88,2,26);} G.labels.push(['вы здесь (наверное)',x,wb-54,4.5,P.ink,'center',null,1]); disc(ctx,x+3,wb-73,2,2,P.red); break;
   case 'graf': for(let i=0;i<3;i++){ ctx.fillStyle=['#ff4fa3','#3ff0ff','#b6ff3f'][(i+d.v)%3]; ctx.fillRect(x-18+i*12,wb-40+(i%2)*4,10,3);} disc(ctx,x,wb-56,8,6,'#ffd23f'); ctx.fillStyle=P.ink; ctx.fillRect(x-4,wb-58,2,2); ctx.fillRect(x+2,wb-57,2,2); ctx.fillRect(x-3,wb-53,6,1); break;
   case 'plant': o(x-6,wb-12,12,12,'#a06a3a'); for(let i=0;i<5;i++){ ctx.fillStyle=i%2?'#3a9a4a':'#5ac85a'; ctx.fillRect(x-8+i*4,wb-26+Math.abs(2-i)*3+Math.round(Math.sin(t*2+i)),3,14-Math.abs(2-i)*3);} break;
  } }
const AD=[{t:'КРЕДИТ НА ПЕЛЬМЕНИ',s:'0% начинки',c:'#d83a3a'},{t:'КУРСЫ «ПРОСНИСЬ»',s:'за 5 минут',c:'#3a8ad8'},{t:'ДИВАН ВАШЕЙ МЕЧТЫ',s:'в рассрочку',c:'#8a3ad8'},{t:'ПОТЕРЯН КОТ',s:'отзывается на «кс»',c:'#e0a020'},{t:'ДОСТАВКА ВСЕГО',s:'вчера',c:'#20a070'}];

// ===== ГЛУБИНА 2.5D =====
const dS=d=>0.82+0.36*d; // масштаб по глубине: дальний край 0.82, ближний 1.18
function depthK(y){ return clamp((y-FY0)/Math.max(1,FY1-FY0),0,1); }
const PFC=new Map();
function persFloor(cam,col,step){ // кэш: узор зависит только от сдвига cam по модулю шага плитки
  const sh=((Math.round(cam)%step)+step)%step, key=W+'|'+H+'|'+FY0+'|'+col+'|'+step+'|'+sh; let c=PFC.get(key);
  if(!c){ if(PFC.size>200) PFC.clear(); const [cv,x]=mkc(W,H-FY0); const o=ctx; persFloorRaw.call(null,sh,col,step,x); c=cv; PFC.set(key,c); }
  ctx.drawImage(c,0,FY0); }
function persFloorRaw(cam,col,step,ctx){ const FY=FY0; const h=H-FY; ctx.fillStyle=col; const FY0_=0;
  for(let i=1;i<9;i++){ const d=Math.pow(i/9,1.6); ctx.fillRect(0,Math.round(FY0_+d*h),W,1); }
  const k0=Math.floor((cam-W)/step)-2, k1=Math.ceil((cam+W*1.4)/step)+2;
  for(let k=k0;k<=k1;k++){ const X=k*step; for(let r=0;r<h;r++){ const d=r/h, s=dS(d); const sx=Math.round((X-cam-W/2)*s+W/2); if(sx>=0&&sx<W) ctx.fillRect(sx,FY0_+r,1,1); } } }
function persFloorOld(cam,col,step){
  const h=H-FY0; ctx.fillStyle=col;
  for(let i=1;i<9;i++){ const d=Math.pow(i/9,1.6); ctx.fillRect(0,Math.round(FY0+d*h),W,1); }
  const k0=Math.floor((cam-W)/step)-2, k1=Math.ceil((cam+W*1.4)/step)+2;
  for(let k=k0;k<=k1;k++){ const X=k*step; for(let r=0;r<h;r++){ const d=r/h, s=dS(d); const sx=Math.round((X-cam-W/2)*s+W/2); if(sx>=0&&sx<W) ctx.fillRect(sx,FY0+r,1,1); } } }
function floorAO(){ const g=ctx.createLinearGradient(0,FY0,0,FY0+14); g.addColorStop(0,'rgba(10,6,20,.55)'); g.addColorStop(1,'rgba(10,6,20,0)'); ctx.fillStyle=g; ctx.fillRect(0,FY0,W,14); }
function wallFog(wallB){ ctx.fillStyle='rgba(40,30,80,.16)'; ctx.fillRect(0,0,W,wallB); const g=ctx.createLinearGradient(0,wallB-18,0,wallB); g.addColorStop(0,'rgba(10,6,20,0)'); g.addColorStop(1,'rgba(10,6,20,.45)'); ctx.fillStyle=g; ctx.fillRect(0,wallB-18,W,18); }
function lampPools(cam){ // объёмные конусы света до пола и пятна
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const lpx=Math.floor(cam*.6); for(let i=Math.floor(lpx/64)-1;i<=Math.floor((lpx+W)/64)+1;i++){ const lx=i*64-lpx+22; if(BG.lv.flicker&&((i*7+Math.floor(BG.t*9))%23===0)) continue;
    const g=ctx.createLinearGradient(0,6,0,H); g.addColorStop(0,'rgba(255,200,90,.16)'); g.addColorStop(1,'rgba(255,200,90,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(lx-6,7); ctx.lineTo(lx+6,7); ctx.lineTo(lx+44,H); ctx.lineTo(lx-44,H); ctx.fill();
    const fx=lx, fy=FY0+(H-FY0)*.45; const rg=ctx.createRadialGradient(fx,fy,2,fx,fy,40); rg.addColorStop(0,'rgba(255,210,120,.14)'); rg.addColorStop(1,'rgba(255,210,120,0)'); ctx.fillStyle=rg; ctx.save(); ctx.translate(fx,fy); ctx.scale(1,.35); ctx.translate(-fx,-fy); ctx.fillRect(fx-40,fy-40,80,80); ctx.restore(); }
  ctx.restore(); }
let VIG=null,VIGK='';
function vignette(){ const k=W+'x'+H; if(VIGK!==k){ VIGK=k; const [c,x]=mkc(W,H); const g=x.createRadialGradient(W/2,H*.55,Math.min(W,H)*.35,W/2,H*.55,Math.max(W,H)*.75); g.addColorStop(0,'rgba(10,6,20,0)'); g.addColorStop(1,'rgba(10,6,20,.55)'); x.fillStyle=g; x.fillRect(0,0,W,H); VIG=c; } ctx.drawImage(VIG,0,0); }
// передний план: колонны/поручни/головы пассажиров проезжают перед камерой (параллакс 1.45)
function drawForeground(cam){ const lv=BG.lv; if(!lv) return; const f=1.45, px=cam*f;
  if(lv.bg==='station'){ const step=360; for(let k=Math.floor(px/step)-1;k<=Math.floor((px+W)/step)+1;k++){ const sx=Math.round(k*step-px+120); if(sx<-30||sx>W+30) continue;
      if(G.occ) G.occ.push([sx-11,sx+11]); ctx.fillStyle='rgba(18,12,28,.88)'; ctx.fillRect(sx-11,0,22,H); ctx.fillStyle='rgba(255,220,150,.10)'; ctx.fillRect(sx+6,0,3,H); ctx.fillStyle='rgba(18,12,28,.95)'; ctx.fillRect(sx-14,H-10,28,10); } }
  else { const step=210; for(let k=Math.floor(px/step)-1;k<=Math.floor((px+W)/step)+1;k++){ const sx=Math.round(k*step-px+60); if(sx<-20||sx>W+20) continue; ctx.fillStyle='rgba(30,26,40,.85)'; ctx.fillRect(sx-3,0,6,H); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(sx-2,0,1,H);
      for(const hx of [sx+40,sx+80]){ const sw=Math.sin(BG.t*2+hx*.05)*2; ctx.fillStyle='rgba(30,26,40,.85)'; ctx.fillRect(hx+sw,0,2,18); ctx.fillRect(hx-4+sw,18,10,8); ctx.clearRect; } } }
  // макушки пассажиров у нижнего края
  const hp=cam*1.7; for(let k=Math.floor(hp/260)-1;k<=Math.floor((hp+W)/260)+1;k++){ const sx=Math.round(k*260-hp+(k*97%130)); if(sx<-30||sx>W+30) continue; const bob=Math.round(Math.sin(BG.t*3+k)*1.5);
    ctx.fillStyle='rgba(18,12,28,.9)'; ctx.beginPath(); ctx.ellipse(sx,H+4+bob,16,14,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(sx+2,H-12+bob,8,8,0,0,Math.PI*2); ctx.fill(); if(k%3===0){ ctx.fillRect(sx-8,H-21+bob,20,3); } }
}
