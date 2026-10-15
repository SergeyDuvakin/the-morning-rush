'use strict';
// ================= ПОЕЗДКА: сцены-финалы, результат, карта с кривой открытий, хуки в цикл =================
CUTS.tripwin={len:4,start:c=>{ c.g=ri(0,3); },draw:(t,c)=>{ ctx.fillStyle='#8ac8f0'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#bfe0ff'; ctx.fillRect(0,H*.3,W,H*.1);
  // город и офис
  for(let i=0;i<8;i++){ const x=i*W/7-20, hh=40+(i*37)%60; ctx.fillStyle=i%2?'#7a7a9a':'#8a8aa8'; ctx.fillRect(x,H*.72-hh,W/8,hh); }
  const ox=W*.72; ctx.fillStyle=P.ink; ctx.fillRect(ox-2,H*.18-2,W*.22+4,H*.56); ctx.fillStyle='#c8c0d8'; ctx.fillRect(ox,H*.18,W*.22,H*.54); ctx.fillStyle='#ffe9a8'; for(let y=H*.22;y<H*.66;y+=14) for(let x=ox+6;x<ox+W*.2;x+=14) ctx.fillRect(Math.round(x),Math.round(y),8,8);
  G.labels.push(['ОФИС',ox+W*.11,H*.15,9,P.ink,'center','#fff']); ctx.fillStyle='#6a6070'; ctx.fillRect(0,H*.72,W,H*.28);
  const k=Math.min(1,t/2.6); spr(HERO_SPECS[heroId],k<1?'walk':'cheer',Math.floor(t*12)%(k<1?8:4),'norm',W*.08+k*(W*.62),H*.9,false,1.2);
  const mm=Math.max(0,59-Math.ceil(TR.tLeft/TR.tTotal*20)); G.labels.push(['УСПЕЛ! 08:'+String(mm).padStart(2,'0'),W/2,H*.12,16*ease(t*2),P.edge]);
  sub(['Начальник даже не заметил. Обидно.','Пропуск пикнул с первого раза. Праздник.','Кофе в офисе бесплатный. Почти.','Коллеги: «Ты чего такой помятый?»'][c.g]); }};
CUTS.late={len:3.5,start:c=>{ SFX.alarm(); },draw:(t,c)=>{ ctx.fillStyle='#2a1020'; ctx.fillRect(0,0,W,H); const cx=W/2, cy=H*.42; disc(ctx,cx,cy,44,44,P.ink); disc(ctx,cx,cy,40,40,'#fff8e8');
  ctx.strokeStyle=P.ink; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy-30); ctx.moveTo(cx,cy); ctx.lineTo(cx-20,cy); ctx.stroke(); if(Math.floor(t*8)%2) G.labels.push(['ДЗЫНЬ!',cx+60,cy-30,12,P.edge]);
  G.labels.push(['09:00 — ОПОЗДАЛ',W/2,H*.12,15,'#ff6a6a']); sub('Начальник смотрит на часы. Потом на тебя. Потом снова на часы.'); }};
CUTS.depot={len:4,start:c=>{ SFX.ko(); },draw:(t,c)=>{ ctx.fillStyle='#14101c'; ctx.fillRect(0,0,W,H); for(let i=0;i<3;i++){ const y=H*.3+i*34; ctx.fillStyle='#3a4a5a'; ctx.fillRect(-20+i*30-t*10,y,W*.8,24); ctx.fillStyle='#ffe9a830'; for(let x=0;x<W*.8;x+=24) ctx.fillRect(-14+i*30-t*10+x,y+4,14,8); }
  spr(HERO_SPECS[heroId],'sit',0,'ko',W*.5,H*.86,false,1.2); G.labels.push(['Z z z',W*.5+24,H*.6,10,'#9cf']); G.labels.push(['УЕХАЛ В ДЕПО',W/2,H*.12,15,'#9cf']); sub('Проснулся от тишины. Механик: «Ты кто?»'); }};
CUTS.escwin={len:2.5,draw:(t,c)=>{ ctx.fillStyle='#1d3a2a'; ctx.fillRect(0,0,W,H); spr(HERO_SPECS[heroId],'cheer',Math.floor(t*10)%4,'norm',W/2,H*.8,false,1.4); G.labels.push(['ВЫРВАЛСЯ! '+TR.escT.toFixed(1)+' с',W/2,H*.2,15,P.neonLime]); }};
CUTS.esclose={len:2.5,draw:(t,c)=>{ ctx.fillStyle='#2a1020'; ctx.fillRect(0,0,W,H); spr(HERO_SPECS[heroId],'hurt',0,'hurt',W/2,H*.8,false,1.4); G.labels.push(['ДВЕРИ ЗАКРЫЛИСЬ…',W/2,H*.2,15,'#ff6a6a']); sub('Едешь дальше. Зато тепло.'); }};
// финал из tripUpdate → катсцена → результат
const _tripUpd=tripUpdate;
// ---------- результат ----------
drawResult=function(){ G.labels=[]; buttons=[]; ctx.fillStyle='#2a1d33'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#3a2a48'; for(let x=0;x<W;x+=24) ctx.fillRect(x,0,12,H);
  const w=TR.win, T=SA.t, bh=Math.max(28,48*DPR/SC), by=H-SA.b-bh-8, bw=Math.min(130,(W-SA.l-SA.r-40)/3);
  if(TR.mode==='escape'){ G.labels.push([w?'ВЫРВАЛСЯ за '+TR.escT.toFixed(1)+' с':'Не успел выйти',W/2,T+24,13,w?P.neonLime:'#ff8a8a']);
    G.labels.push(['Рекорд: '+(save.escBest?save.escBest.toFixed(1)+' с':'—')+(w&&TR.escNew?'  · НОВЫЙ!':''),W/2,T+50,9,P.edge]); if(w) G.labels.push(['+2 монеты',W/2,T+66,8,'#ffd23f']);
    bigBtn('МЕНЮ',W/2-bw-6,by,bw,bh,'#8a3ad8',()=>toTitle(),'rmenu'); bigBtn('ЕЩЁ РАЗ',W/2+6,by,bw,bh,'#3a6ad8',()=>startEscape(),'retry'); return; }
  G.labels.push([w?'«'+TR.name+'» — УСПЕЛ!':TR.reason==='depot'?'Уехал в депо':'Опоздал на работу',W/2,T+16,12,w?P.edge:'#ff8a8a']);
  if(w){ for(let i=0;i<3;i++){ const on=i<TR.stars, x=W/2+(i-1)*30, y=T+40; G.labels.push(['★',x,y,20,on?P.edge:'#5a4a6a']); }
    G.labels.push(['★ успел · ★ запас 20% времени · ★ запас + место у поручня/в углу/сидя',W/2,T+60,6,'#bbb']); }
  const rows=w?[['Очки',TR.score],['Запас',Math.round(TR.tLeft)+' с'],['В вагоне',TR.spotName],['Вежливость',TR.polite],['Скандалы',TR.scandals],['Монеты','+'+TR.coinsGot]]:[['Где застрял',ZONES[TR.z.k].title(TR.z)],['Скандалы',TR.scandals]];
  const cx=W/2, ry=T+(w?74:44), two=rows.length>2; rows.forEach((r,i)=>{ const col=two?i%2:0, row=two?i>>1:i, x=two?cx+(col?70:-70):cx; G.labels.push([r[0]+':',x-4,ry+row*12,7,'#ccc','right']); G.labels.push([String(r[1]),x+2,ry+row*12,7,'#fff','left']); });
  const pts=tripPts(); G.labels.push(['Кошелёк: '+wallet().coins+' мон. · '+passInfo()+'   ·   Очки всего: '+pts+(w&&TR.ptsGain?' (+'+TR.ptsGain+')':''),W/2,ry+(two?Math.ceil(rows.length/2):rows.length)*12+4,7,'#ffd23f']);
  const nu=[...(TR.newSt||[]).map(s=>'станция «'+s+'»'),...(TR.newUnlocks||[])]; if(w&&nu.length) G.labels.push(['ОТКРЫТО: '+nu.slice(0,3).join(', ')+(nu.length>3?'…':''),W/2,ry+(two?Math.ceil(rows.length/2):rows.length)*12+18,7,P.neonLime]);
  else { const n=ST_THR.findIndex(t=>t>pts); if(n>0) G.labels.push(['до станции «'+LEVELS[n].name+'»: ещё '+(ST_THR[n]-pts)+' очк.',W/2,ry+(two?Math.ceil(rows.length/2):rows.length)*12+18,7,'#ccc']); }
  bigBtn('КАРТА',W/2-bw*1.5-10,by,bw,bh,'#8a3ad8',()=>{ mapLine=TR.line; toMap(); },'rmap');
  bigBtn('ЕЩЁ РАЗ',W/2-bw/2,by,bw,bh,'#3a6ad8',()=>startTrip(TR.idx),'retry');
  const nx=TR.idx+1; if(nx<LEVELS.length&&lvOpen(Math.floor(nx/8),nx%8)) bigBtn('ДАЛЬШЕ ▶',W/2+bw/2+10,by,bw,bh,'#2aa860',()=>{ const L=LEVELS[nx]; if(L.i===0&&!save.cut['line'+L.w]){ save.cut['line'+L.w]=1; store(); startCut('line',()=>startTrip(nx),L.w); } else startTrip(nx); },'next');
};
// ---------- карта: станции по очкам + кривая открытий ----------
function stationLocs(idx){ const z=stationTrip(idx); const s=new Set(); for(const q of z){ if(q.k==='gate'){ s.add('турникеты'); if(q.vend) s.add('автомат кофе'); if(q.detector) s.add('рамка'); if(q.turnboss) s.add('турникет-мутант'); }
  if(q.k==='esc') s.add(q.mode==='stairs'?'лестница':'эскалатор'); if(q.k==='plat'){ if(q.short) s.add('короткий поезд'); if(q.babatank) s.add('Бабушка-Танк'); }
  if(q.k==='car'){ if(q.terminal) s.add('конечная'); if(q.controller) s.add('контролёр'); if(q.gangway) s.add('тамбур'); }
  if(q.k==='passage'){ s.add(q.title==='ПОДЗЕМНЫЙ ПЕРЕХОД'?'переход':'пересадка'); for(const f of q.feat) s.add({kiosk:'ларьки',musician:'музыкант',walkway:'траволатор',repairs:'ремонт',service:'служебка',lost:'бюро находок',vendp:'автомат'}[f]); if(q.flow==='headon') s.add('узкий проход'); }
  if(q.k==='exitz'&&q.rain) s.add('дождь'); } return [...s]; }
drawMap=function(){ G.labels=[]; buttons=[]; const L=SA.l+6, R=W-SA.r-6, T=SA.t+4, pts=tripPts();
  ctx.fillStyle='#f1e8d4'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#e2d6bc'; for(let x=0;x<W;x+=16) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=16) ctx.fillRect(0,y,W,1);
  const lc=LINE_COL[mapLine], bh=Math.max(24,44*DPR/SC);
  bigBtn('◀',L,T,bh,bh,'#4a3a5a',()=>{ mapLine=(mapLine+2)%3; mapSel=-1; },'prev',12); bigBtn('▶',R-bh,T,bh,bh,'#4a3a5a',()=>{ mapLine=(mapLine+1)%3; mapSel=-1; },'next',12);
  G.labels.push([LINE_NAMES[mapLine]+' ветка',W/2,T+bh/2-5,11,lc,'center','#fff']); G.labels.push(['ОЧКИ '+pts+' · '+wallet().coins+' мон. · '+passInfo(),W/2,T+bh/2+8,7,'#1a1020','center','#fff']);
  const y0=Math.round(T+bh+44), x0=L+24, x1=R-24, open=lineOpen(mapLine);
  ctx.fillStyle=P.ink; ctx.fillRect(x0-2,y0-4,x1-x0+4,9); ctx.fillStyle=open?lc:'#aaa'; ctx.fillRect(x0,y0-2,x1-x0,5);
  for(let i=0;i<8;i++){ const idx=mapLine*8+i, s=LEVELS[idx], x=Math.round(x0+(x1-x0)*i/7), op=lvOpen(mapLine,i), stars=save.stars[mapLine+'.'+i]||0, sel=mapSel===i, r=6;
    disc(ctx,x,y0,r+1,r+1,P.ink); disc(ctx,x,y0,r,r,op?'#fff':'#bbb'); if(stars) disc(ctx,x,y0,r-3,r-3,lc); if(sel){ ctx.strokeStyle=P.neonPink; ctx.lineWidth=2; ctx.strokeRect(x-r-3,y0-r-3,r*2+6,r*2+6); }
    const up=i%2===0, ty=up?y0-16:y0+16; const ws=wrap(s.name,58); ws.forEach((w,j)=>G.labels.push([w,x,ty+(up?-(ws.length-1-j)*9:j*9),6,op?'#1a1020':'#9a9090','center','#fff']));
    G.labels.push([op?'★'.repeat(stars)+'☆'.repeat(3-stars):ST_THR[idx]+' очк.',x,up?y0+12:y0-12,6,op?P.edge:'#8a3a3a','center',op?P.ink:'#fff']);
    const hb=Math.max(28,44*DPR/SC); buttons.push({x:x-hb/2,y:y0-hb/2,w:hb,h:hb,id:'st'+i,cb:()=>{ if(op){ mapSel=i; SFX.ui(); } else { say('Откроется при '+ST_THR[idx]+' очках (у тебя '+pts+')',1.8,P.red); SFX.hurt(); } }}); }
  const PH=Math.max(44,H-SA.b-(y0+34)-6), py=H-SA.b-PH-4;
  ctx.fillStyle=P.ink; ctx.fillRect(L,py-2,R-L,PH+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(L+2,py,R-L-4,PH);
  if(mapSel>=0){ const idx=mapLine*8+mapSel, s=LEVELS[idx]; G.labels.push(['«'+s.name+'»',L+10,py+10,9,lc,'left',null]);
    G.labels.push(['В пути: '+stationLocs(idx).join(', '),L+10,py+24,6,'#1a1020','left',null]); G.labels.push(['Рекорд: '+(save.tbest&&save.tbest[idx]||0)+' очк.',L+10,py+36,6,'#5a4a6a','left',null]);
    bigBtn('ПОЕХАЛИ',R-100,py+4,92,Math.min(PH-8,bh+6),'#2aa860',()=>{ if(mapSel===0&&mapLine>0&&!save.cut['line'+mapLine]){ save.cut['line'+mapLine]=1; store(); startCut('line',()=>startTrip(idx),mapLine); } else startTrip(idx); },'go',10); }
  else { // кривая открытий: x — станция 1..24, y — порог очков; линия «твои очки»
    const gx0=L+60, gx1=R-bh*2-20, gy0=py+6, gy1=py+PH-10, max=ST_THR[23]; G.labels.push(['КРИВАЯ',L+30,py+12,6,P.neonPink,'center',null]); G.labels.push(['ОТКРЫТИЙ',L+30,py+22,6,P.neonPink,'center',null]);
    ctx.fillStyle='#e8dcc0'; ctx.fillRect(gx0,gy0,gx1-gx0,gy1-gy0);
    const X=i=>gx0+(gx1-gx0)*i/23, Y=v=>gy1-(gy1-gy0)*Math.min(1,v/max);
    const yp=Math.round(Y(pts)); ctx.fillStyle='#2aa86060'; ctx.fillRect(gx0,yp,gx1-gx0,gy1-yp); ctx.fillStyle='#2aa860'; ctx.fillRect(gx0,yp,gx1-gx0,1);
    for(let i=0;i<24;i++){ const x=Math.round(X(i)), y=Math.round(Y(ST_THR[i])), ok=pts>=ST_THR[i], loc=LOC.some(l=>l[1]===i); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,loc?5:4,loc?5:4); ctx.fillStyle=ok?LINE_COL[Math.floor(i/8)]:'#bbb'; ctx.fillRect(x-1,y-1,loc?3:2,loc?3:2); }
    const n=ST_THR.findIndex(t=>t>pts); const nl=LOC.find(l=>ST_THR[l[1]]>pts);
    G.labels.push([n<0?'Всё открыто!':'след.: «'+LEVELS[n].name+'» при '+ST_THR[n],gx0+2,gy0+6,6,'#1a1020','left','#fff']);
    if(nl) G.labels.push(['новое место: '+nl[2]+' ('+ST_THR[nl[1]]+')',gx0+2,gy0+16,6,'#8a3ad8','left','#fff']);
    // герой
    const hb=Math.max(26,Math.min(PH-6,44*DPR/SC)); const hx=R-hb*2-10, hy=py+(PH-hb)/2;
    for(const [j,id] of ['serega','baba'].entries()){ const x=hx+j*(hb+6), ok=id==='serega'||save.unlockedBaba; ctx.fillStyle=P.ink; ctx.fillRect(x-2,hy-2,hb+4,hb+4); ctx.fillStyle=heroId===id?'#ffd23f':'#d8ccb4'; ctx.fillRect(x,hy,hb,hb);
      ctx.save(); ctx.beginPath(); ctx.rect(x,hy,hb,hb); ctx.clip(); const img=personSprite(HERO_SPECS[id],'idle',Math.floor(G.t*6)%6,'norm',Math.floor(G.t*10)); ctx.globalAlpha=ok?1:.25; ctx.drawImage(img,Math.round(x+hb/2-32),Math.round(hy+hb-60)); ctx.restore(); ctx.globalAlpha=1;
      buttons.push({x,y:hy,w:hb,h:hb,id:'hero_'+id,cb:()=>{ if(ok){ heroId=id; save.hero=id; store(); SFX.squeak(); } else say('Бабка Зинаида откроется на станции с Бабушкой-Танком',2,P.red); }}); } }
  bigBtn('МЕНЮ',L+bh+6,T,Math.max(50,bh*1.5),bh,'#4a3a5a',()=>toTitle(),'home',8);
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,y0+30,8,G.msg.col,'center','#fff']); }
};
// ---------- хуки в главный цикл ----------
window.wantsStick=()=>(G.scene==='trip')&&!paused;
window.onBack=()=>{ if(G.scene==='trip'){ paused=!paused; } else if(G.scene==='map') toTitle(); else if(G.scene==='result') toMap(); };
const _update=update; update=function(dt){ if(G.scene!=='trip') return _update(dt); G.t+=dt; musicTick(); input.events=input.events||[]; if(portrait){ input.events.length=0; return; } tripUpdate(dt); input.events.length=0; };
const _render=render; render=function(){ if(G.scene!=='trip'||portrait) return _render();
  clearText(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; floorBand(); drawTrip();
  for(const l of G.labels){ const o=(l[6]===undefined||l[6]===0)?'#1a1020':l[6]; txt(l[0],l[1],l[2],l[3],l[4],l[5]||'center',o,900,l[7]); } };
startLevel=function(idx){ if(TR.mode==='escape'&&G.scene==='trip') return startEscape(); startTrip(idx); };
