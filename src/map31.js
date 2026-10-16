// ---------- v3.1: карта — стилизованная пиксельная схема метро ----------
let mapPan=0, mapPanV=0; const MAPX={tf:null};
function tfSet(){ if(MAPX.tf) return MAPX.tf; MAPX.tf=new Set(); for(let i=0;i<24;i++) if(stationTrip(i).some(q=>q.k==='passage'&&q.title==='ПЕРЕХОД НА ДРУГУЮ ЛИНИЮ')) MAPX.tf.add(i); return MAPX.tf; }
function padlock(x,y){ ctx.fillStyle=P.ink; ctx.fillRect(x-4,y-1,9,7); ctx.fillRect(x-3,y-5,7,2); ctx.fillRect(x-3,y-5,2,5); ctx.fillRect(x+2,y-5,2,5); ctx.fillStyle='#d8a020'; ctx.fillRect(x-3,y,7,5); ctx.fillStyle=P.ink; ctx.fillRect(x,y+1,1,2); }
function starPx(x,y,on){ const c=on?'#ffd23f':'#5a5068', R=[[0,-4,1],[-1,-3,3],[-4,-1,9],[-3,0,7],[-2,1,5],[-3,2,7],[-3,3,2],[2,3,2]]; ctx.fillStyle=P.ink; for(const [dx,dy,w] of R) ctx.fillRect(x+dx-1,y+dy-1,w+2,3); ctx.fillStyle=c; for(const [dx,dy,w] of R) ctx.fillRect(x+dx,y+dy,w,1); if(on){ ctx.fillStyle='#fff6a8'; ctx.fillRect(x-1,y-1,1,1); } }
function mapPts(line,x0,x1,ym,amp){ const a=[]; for(let i=0;i<8;i++){ const t=i/7; a.push({x:Math.round(x0+(x1-x0)*t),y:Math.round(ym+Math.sin(t*Math.PI*1.6+line*1.3)*amp)}); } return a; }
function lerpPath(pts,t){ const f=Math.max(0,Math.min(.9999,t))*(pts.length-1), i=Math.floor(f), k=f-i; return {x:pts[i].x+(pts[i+1].x-pts[i].x)*k,y:pts[i].y+(pts[i+1].y-pts[i].y)*k}; }
function thickLine(pts,col,w){ for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2); for(let s=0;s<=n;s++){ const x=a.x+(b.x-a.x)*s/n, y=a.y+(b.y-a.y)*s/n; ctx.fillStyle=col; ctx.fillRect(Math.round(x-w/2),Math.round(y-w/2),w,w); } } }
drawMap=function(){ G.labels=[]; buttons=[]; const L=SA.l+6, R=W-SA.r-6, T=SA.t+4, pts=tripPts(), bh=Math.max(26,44*DPR/SC), tf=tfSet();
  mapPan+=(mapLine-mapPan)*Math.min(1,1/60*9); if(Math.abs(mapLine-mapPan)<.002) mapPan=mapLine;
  // фон: тёмная схема с сеткой
  ctx.fillStyle='#1c1626'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#241d31'; for(let x=0;x<W;x+=20) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=20) ctx.fillRect(0,y,W,1);
  // шапка
  bigBtn('МЕНЮ',L,T,Math.max(54,bh*1.5),bh,'#4a3a5a',()=>toTitle(),'home',8);
  const tabW=Math.min(110,(R-L-bh*4)/3); for(let w=0;w<3;w++){ const x=Math.round(W/2-tabW*1.5+w*tabW), on=w===mapLine, op=lineOpen(w);
    ctx.fillStyle=on?LINE_COL[w]:'#2e2640'; ctx.fillRect(x+2,T,tabW-4,bh); if(on){ ctx.fillStyle='#fff'; ctx.fillRect(x+2,T+bh-3,tabW-4,3); }
    G.labels.push([LINE_NAMES[w],x+tabW/2,T+bh/2,8,on?'#fff':op?LINE_COL[w]:'#7a7088','center',on?P.ink:null]);
    buttons.push({x:x+2,y:T,w:tabW-4,h:bh,id:'line'+w,cb:()=>{ mapLine=w; mapSel=-1; SFX.ui(); }}); }
  G.labels.push(['★ '+pts+' очк.',R,T+bh/2,9,'#ffd23f','right',P.ink]);
  bigBtn('◀',L,H/2-bh/2-14,bh*.8,bh,'#2e2640',()=>{ mapLine=(mapLine+2)%3; mapSel=-1; },'prev',11); bigBtn('▶',R-bh*.8,H/2-bh/2-14,bh*.8,bh,'#2e2640',()=>{ mapLine=(mapLine+1)%3; mapSel=-1; },'next',11);
  // схема (все три ветки по горизонтали, плавная прокрутка)
  const CH=Math.max(70,H-SA.b-(T+bh)-90), cy=T+bh+10+CH/2, x0=L+bh+26, x1=R-bh-26, amp=Math.min(22,CH*.18), span=W;
  ctx.save(); ctx.beginPath(); ctx.rect(L+bh*.8+4,T+bh+4,R-L-bh*1.6-8,CH+12); ctx.clip();
  const nextIdx=ST_THR.findIndex((t,i)=>!save.tbest||!save.tbest[i]);
  for(let w=0;w<3;w++){ const off=Math.round((w-mapPan)*span); if(Math.abs(off)>W*1.2) continue; const ps=mapPts(w,x0+off,x1+off,cy,amp), lc=LINE_COL[w], op=lineOpen(w);
    thickLine(ps,P.ink,9); thickLine(ps,op?lc:'#4a4258',6); thickLine(ps,'#ffffff30',1);
    // поезд-малютка едет по ветке
    if(op){ const tp=lerpPath(ps,(G.t*.05+w*.3)%1); ctx.fillStyle=P.ink; ctx.fillRect(Math.round(tp.x-9),Math.round(tp.y-12),18,8); ctx.fillStyle='#e8e0d0'; ctx.fillRect(Math.round(tp.x-8),Math.round(tp.y-11),16,6); ctx.fillStyle=lc; ctx.fillRect(Math.round(tp.x-8),Math.round(tp.y-8),16,2); ctx.fillStyle='#9cf'; ctx.fillRect(Math.round(tp.x-6),Math.round(tp.y-10),3,2); ctx.fillRect(Math.round(tp.x-1),Math.round(tp.y-10),3,2); ctx.fillRect(Math.round(tp.x+4),Math.round(tp.y-10),3,2); }
    for(let i=0;i<8;i++){ const idx=w*8+i, s=LEVELS[idx], p=ps[i], o=lvOpen(w,i), st=save.stars[w+'.'+i]||0, sel=w===mapLine&&mapSel===i, cur=idx===nextIdx&&o;
      if(o){ const g=cur?3+Math.round((Math.sin(G.t*5)+1)*2):2; ctx.globalAlpha=.35; disc(ctx,p.x,p.y,9+g,9+g,lc); ctx.globalAlpha=1; }
      if(tf.has(idx)){ disc(ctx,p.x,p.y,10,10,P.ink); disc(ctx,p.x,p.y,9,9,'#fff'); disc(ctx,p.x+5,p.y,5,5,LINE_COL[(w+1)%3]); }
      disc(ctx,p.x,p.y,8,8,P.ink); disc(ctx,p.x,p.y,6,6,o?'#fff':'#5a5068'); if(o&&st) disc(ctx,p.x,p.y,3,3,lc);
      if(!o) padlock(p.x,p.y-1);
      if(sel){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.strokeRect(p.x-12,p.y-12,24,24); }
      const up=i%2===0, ws=wrapW(s.name,Math.max(56,(x1-x0)/7.5),7), ly=up?p.y-20:p.y+20;
      ws.forEach((t,j)=>G.labels.push([t,p.x,ly+(up?-(ws.length-1-j)*10:j*10),7,o?'#fff':'#8a8098','center',P.ink]));
      if(o&&st){ for(let k=0;k<3;k++) starPx(p.x-8+k*8,up?p.y+14:p.y-14,k<st); }
      else if(!o) G.labels.push([ST_THR[idx]+' очк.',p.x,up?p.y+15:p.y-15,7,'#ff9a8a','center',P.ink]);
      if(cur) G.labels.push(['▼ ТЫ ТУТ',p.x,(up?p.y+28:p.y-28),7,'#8fe03a','center',P.ink]);
      if(w===mapLine){ const hb=Math.max(30,44*DPR/SC); buttons.push({x:p.x-hb/2,y:p.y-hb/2,w:hb,h:hb,id:'st'+i,cb:()=>{ if(o){ mapSel=i; SFX.ui(); } else { say(lineOpen(w)?'Откроется при '+ST_THR[idx]+' очках (у тебя '+pts+')':'Сначала пройди предыдущую ветку',1.8,P.red); SFX.hurt(); } }}); } }
    // голубь гуляет у конечной
    const gp=ps[7], gx=Math.round(gp.x+14+Math.sin(G.t*.8+w)*6), gy=gp.y+4, peck=Math.floor(G.t*3+w)%4===0;
    ctx.fillStyle=P.ink; ctx.fillRect(gx-4,gy-4,9,6); ctx.fillStyle='#9a9aa8'; ctx.fillRect(gx-3,gy-3,7,4); ctx.fillStyle='#6a6a7a'; ctx.fillRect(gx+3,gy-(peck?2:6),3,3); ctx.fillStyle='#ff8a1f'; ctx.fillRect(gx+6,gy-(peck?1:5),1,1); ctx.fillStyle='#ff8a1f'; ctx.fillRect(gx-1,gy+2,1,2); ctx.fillRect(gx+2,gy+2,1,2);
    if(!op){ G.labels.push(['ветка закрыта — пройди «'+LEVELS[w*8-1].name+'»',W/2+off,cy+amp+36,8,'#ff9a8a','center',P.ink]); } }
  ctx.restore();
  // карточка станции / выбор героя
  const PH=Math.max(52,H-SA.b-(T+bh+CH+20)), py=H-SA.b-PH-4, lc=LINE_COL[mapLine];
  ctx.fillStyle=P.ink; ctx.fillRect(L,py-2,R-L,PH+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(L+2,py,R-L-4,PH); ctx.fillStyle=lc; ctx.fillRect(L+2,py,6,PH);
  if(mapSel>=0){ const idx=mapLine*8+mapSel, s=LEVELS[idx], st=save.stars[mapLine+'.'+mapSel]||0, nl=LOC.filter(l=>l[1]===idx);
    G.labels.push([s.name,L+16,py+12,11,'#1a1020','left',null]);
    for(let k=0;k<3;k++) starPx(L+20+k*11,py+28,k<st);
    G.labels.push(['рекорд: '+(save.tbest&&save.tbest[idx]||'—')+(save.tbest&&save.tbest[idx]?' очк.':''),L+56,py+28,7,'#5a4a6a','left',null]);
    if(nl.length){ ctx.fillStyle='#8a3ad8'; ctx.fillRect(L+16,py+38,8,8); ctx.fillStyle='#fff'; ctx.fillRect(L+19,py+39,2,4); ctx.fillRect(L+19,py+44,2,1); G.labels.push(['НОВОЕ: '+nl.map(l=>l[2]).join(', '),L+28,py+42,7,'#8a3ad8','left',null]); }
    else G.labels.push(['в пути: '+stationLocs(idx).slice(0,4).join(', '),L+16,py+42,7,'#6a5a7a','left',null]);
    bigBtn('ИГРАТЬ ▶',R-112,py+(PH-Math.min(PH-10,bh+8))/2,104,Math.min(PH-10,bh+8),'#2aa860',()=>{ if(mapSel===0&&mapLine>0&&!save.cut['line'+mapLine]){ save.cut['line'+mapLine]=1; store(); startCut('line',()=>startTrip(idx),mapLine); } else startTrip(idx); },'go',11); }
  else { G.labels.push(['Выбери станцию на схеме',L+16,py+12,10,'#1a1020','left',null]);
    const n=ST_THR.findIndex(t=>t>pts); G.labels.push([n<0?'Все станции открыты!':'следующая: «'+LEVELS[n].name+'» — ещё '+(ST_THR[n]-pts)+' очк.',L+16,py+30,7,'#6a5a7a','left',null]);
    const hb=Math.max(26,Math.min(PH-8,44*DPR/SC)), hx=R-hb*2-14, hy=py+(PH-hb)/2;
    for(const [j,id] of ['serega','baba'].entries()){ const x=hx+j*(hb+6), ok=id==='serega'||save.unlockedBaba; ctx.fillStyle=P.ink; ctx.fillRect(x-2,hy-2,hb+4,hb+4); ctx.fillStyle=heroId===id?'#ffd23f':'#d8ccb4'; ctx.fillRect(x,hy,hb,hb);
      ctx.save(); ctx.beginPath(); ctx.rect(x,hy,hb,hb); ctx.clip(); const img=personSprite(HERO_SPECS[id],'idle',Math.floor(G.t*6)%6,'norm',Math.floor(G.t*10)); ctx.globalAlpha=ok?1:.25; ctx.drawImage(img,Math.round(x+hb/2-32),Math.round(hy+hb-60)); ctx.restore(); ctx.globalAlpha=1;
      buttons.push({x,y:hy,w:hb,h:hb,id:'hero_'+id,cb:()=>{ if(ok){ heroId=id; save.hero=id; store(); SFX.squeak(); } else say('Бабка Зинаида откроется на станции с Бабушкой-Танком',2,P.red); }}); } }
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,py-12,8,G.msg.col,'center',P.ink]); }
};
