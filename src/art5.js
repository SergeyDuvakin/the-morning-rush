'use strict';
// M5 арт-ревью (V4_ART_RULES, контур #120c18): карточки выходного, зал МЕГАХИМОК, салоны трамвая/автобуса на весь экран,
// ночной фон такси, парковая аллея с Настей. Только отрисовка, логика зон не меняется.
const A5I='#120c18';
function a5R(c,x,y,w,h){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
// человечек 5×13 (ноги на y): контур, голова, волосы, туловище, ноги
function a5Fig(x,y,top,hair,skin,leg){ x=Math.round(x); y=Math.round(y); a5R(A5I,x-1,y-14,7,15); a5R(skin||'#f0c8a0',x,y-13,5,4); a5R(hair||'#5a3a2a',x,y-13,5,2); a5R(top,x,y-8,5,5); a5R(leg||'#3a3a5a',x,y-3,2,3); a5R(leg||'#3a3a5a',x+3,y-3,2,3); a5R(A5I,x+1,y-11,1,1); a5R(A5I,x+3,y-11,1,1); }
function a5Heart(x,y,c){ x=Math.round(x); y=Math.round(y); a5R(A5I,x-1,y-1,4,3); a5R(A5I,x+3,y-1,4,3); a5R(A5I,x-1,y+1,8,3); a5R(A5I,x+1,y+4,4,2); a5R(c,x,y,2,2); a5R(c,x+4,y,2,2); a5R(c,x,y+1,6,2); a5R(c,x+1,y+3,4,1); a5R(c,x+2,y+4,2,1); a5R('#fff',x,y,1,1); }
function a5Birch(x,y,h){ a5R(A5I,x-2,y-h,4,h); a5R('#f4f0ea',x-1,y-h,2,h); for(let i=4;i<h;i+=5) a5R(A5I,x-1+(i%2),y-h+i,1,1); a5R(A5I,x-8,y-h-12,16,15); a5R('#8ad06a',x-7,y-h-11,14,13); a5R('#b0e88a',x-5,y-h-10,5,3); a5R('#5aa84a',x-7,y-h,14,2); }
function a5Oak(x,y,h){ a5R(A5I,x-3,y-h,6,h); a5R('#7a5232',x-2,y-h,4,h); a5R(A5I,x-12,y-h-16,24,19); a5R(A5I,x-14,y-h-11,28,10); a5R('#3a8a3a',x-11,y-h-15,22,17); a5R('#3a8a3a',x-13,y-h-10,26,8); a5R('#5aa84a',x-8,y-h-13,8,4); a5R('#2a6a2a',x-13,y-h-3,26,2); }
function a5Fir(x,y,h){ a5R(A5I,x-2,y-5,5,5); a5R('#5a3a22',x-1,y-5,3,5); const th=Math.max(6,Math.round(h/2.4)); for(let k=0;k<3;k++){ const base=y-5-k*Math.round(th*.7), wmax=18-k*4; for(let r=0;r<th;r++){ const w=Math.max(1,Math.round(wmax*(r+1)/th)), yy=base-th+r; a5R(A5I,x-Math.floor(w/2)-1,yy,w+2,1); a5R(r%3===0?'#3a8a5a':'#2a6a4a',x-Math.floor(w/2),yy,w,1); } a5R(A5I,x-Math.floor(wmax/2)-1,base,wmax+2,1); } }
function a5Bench(x,y){ a5R(A5I,x-1,y-9,22,3); a5R(A5I,x-1,y-5,22,3); a5R('#c8845a',x,y-8,20,1); a5R('#c8845a',x,y-4,20,1); a5R(A5I,x+1,y-2,2,3); a5R(A5I,x+17,y-2,2,3); }
function a5Fountain(x,y,t){ a5R(A5I,x-15,y-6,30,7); a5R('#b8b0c4',x-14,y-5,28,5); a5R('#4a9ae8',x-12,y-5,24,2); a5R(A5I,x-2,y-15,4,10); a5R('#c8c0d4',x-1,y-14,2,9); a5R(A5I,x-6,y-17,12,3); a5R('#b8b0c4',x-5,y-16,10,1);
  for(let i=0;i<5;i++){ const k=(t*1.3+i/5)%1, dx=Math.round((i-2)*4*k), dy=Math.round(-22+26*(k-.4)*(k-.4)*2); a5R(i%2?'#9fd8ff':'#e8f6ff',x+dx,y+dy,1,2); } }
// ---------- 1. карточки выходного: сцены в карточке, полоса заголовка, подпись, полоса отсчёта, фон — квартира ----------
function a5CardArt(k,AW,AH,sun,t){
  const sky=sun?'#e8a07a':'#9fd0f0';
  if(k==='mega'){ a5R(sky,0,0,AW,AH); a5R(sun?'#f4c8a0':'#cfeaff',0,AH-26,AW,6); a5R('#fff',8,5,10,2); a5R('#fff',AW-22,8,12,2);
    const bx=6, bw=AW-12, by=9, bh=AH-21; a5R(A5I,bx-1,by-1,bw+2,bh+2); a5R('#ece6f0',bx,by,bw,bh); a5R('#e8562a',bx,by,bw,8); a5R('#ffd23f',bx,by+8,bw,1);
    for(let x=bx+3;x<bx+bw-6;x+=9){ if(Math.abs(x+3-AW/2)<10) continue; a5R(A5I,x,by+12,7,bh-15); a5R('#9fd0f0',x+1,by+13,5,bh-17); a5R('#cfeaff',x+1,by+13,1,bh-17); }
    a5R(A5I,AW/2-8,by+11,16,bh-11); a5R('#7ab8e0',AW/2-7,by+12,14,bh-12); a5R(A5I,AW/2,by+12,1,bh-12);
    a5R('#8a8e9a',0,AH-12,AW,12); a5R('#9a9eaa',0,AH-12,AW,1); for(let x=2;x<AW;x+=12) a5R('#e8e8f0',x,AH-9,1,6);
    const cx=4, cy=AH-4; a5R(A5I,cx,cy-6,19,6); a5R('#d84a4a',cx+1,cy-5,17,4); a5R(A5I,cx+4,cy-9,11,4); a5R('#9fd0f0',cx+5,cy-8,9,2); a5R(A5I,cx+2,cy-1,4,2); a5R(A5I,cx+13,cy-1,4,2); a5R('#ffe9a8',cx+17,cy-4,1,1);
    a5Fig(AW/2-16,AH-3,'#4a7ad8','#3a2a1a'); a5Fig(AW/2+8,AH-4,'#e85a8a','#c8642a'); a5Fig(AW/2+15,AH-2,'#5a9a5a','#d8d8e0'); a5Fig(AW/2-8,AH-5,'#d8a83a','#1a1a1a');
    const kx=AW-22, ky=AH-3; a5Fig(kx+12,ky,'#8a5ad8','#5a3a2a'); a5R(A5I,kx,ky-8,11,6); a5R('#c8ccd8',kx+1,ky-7,9,4); a5R('#8a90a0',kx+4,ky-7,1,4); a5R(A5I,kx+10,ky-10,2,3); a5R('#e8562a',kx+1,ky-11,3,4); a5R('#4ab04a',kx+5,ky-10,3,3); a5R('#ffd23f',kx+8,ky-10,2,2); a5R(A5I,kx+1,ky-2,2,2); a5R(A5I,kx+8,ky-2,2,2);
    return 'МЕГА'; }
  if(k==='nastya'){ a5R(sky,0,0,AW,AH); a5R('#fff',10,4,12,2); a5R('#fff',AW-28,7,10,2); a5R('#6a9a5a',0,AH-26,AW,10); for(let x=0;x<AW;x+=9) a5R('#7aaa6a',x,AH-28,6,3);
    a5R('#7ab86a',0,AH-17,AW,17); a5R('#d8c8a8',0,AH-9,AW,6); a5R('#c4b490',0,AH-9,AW,1); for(let x=1;x<AW;x+=5) a5R('#c4b490',x,AH-7,1,3);
    for(const [fx,c] of [[4,'#ff5a8a'],[9,'#ffd23f'],[AW-9,'#ff5a8a'],[AW-4,'#fff'],[AW/2+20,'#ffd23f']]){ a5R(A5I,fx-1,AH-15,3,3); a5R(c,fx,AH-14,1,1); }
    a5Birch(7,AH-11,18); a5Fir(AW-24,AH-11,22); a5Oak(AW-8,AH-11,10); a5Fountain(Math.round(AW/2+6),AH-10,t);
    a5Bench(14,AH-11); a5Fig(19,AH-5,'#4a7ad8','#3a2a1a'); a5Fig(26,AH-5,'#e85a8a','#c8642a','#ffd8b8','#3a3a6a'); a5R('#ffd8b8',24,AH-8,2,1);
    const b=Math.round(Math.sin(t*5)); a5Heart(22,AH-25+b,'#ff5a8a'); return null; }
  // дача: домик, забор, грядки, дед с лейкой
  a5R(sky,0,0,AW,AH); a5R('#ffe9a8',AW-14,4,7,7); a5R('#fff6d0',AW-13,5,5,5); a5R('#6a9a5a',0,AH-24,AW,8); a5R('#8ac06a',0,AH-16,AW,16);
  const hx=8; a5R(A5I,hx-1,AH-31,28,18); a5R('#d89a5a',hx,AH-30,26,16); for(let i=0;i<7;i++){ a5R(A5I,hx-2+i*2,AH-33-i*2,30-i*4,2); a5R('#b84a3a',hx-1+i*2,AH-33-i*2,28-i*4,2); } a5R(A5I,hx+4,AH-26,8,7); a5R('#9fd0f0',hx+5,AH-25,6,5); a5R(A5I,hx+16,AH-24,6,10); a5R('#8a5a3a',hx+17,AH-23,4,9);
  for(let x=0;x<AW;x+=5){ a5R(A5I,x,AH-20,3,6); a5R('#e8e2d0',x+1,AH-19,1,5); } a5R(A5I,0,AH-17,AW,1);
  for(let r=0;r<2;r++){ const y=AH-10+r*5; a5R(A5I,AW/2-6,y-1,AW/2,4); a5R('#7a4a2e',AW/2-5,y,AW/2-2,2); for(let x=AW/2-3;x<AW-8;x+=4){ a5R('#3a8a3a',x,y-2,1,2); a5R('#5ac85a',x+1,y-3,1,2); } }
  a5Fig(AW/2-14,AH-2,'#5a7a4a','#d8d8e0'); a5R(A5I,AW/2-8,AH-9,5,4); a5R('#5a9ad8',AW/2-7,AH-8,3,2); return null; }
function a5Room(sun){ const g=w5Begin(), {SW,SH}=g, FY=Math.round(SH*.8);
  e4r('#e8c8a0',0,0,SW,SH); for(let x=6;x<SW;x+=14) e4r('#dcbc94',x,6,6,FY-6); e4r(A5I,0,FY,SW,1); e4r('#8a5a3a',0,FY+1,SW,SH-FY);
  const wx=Math.round(SW*.12), wy=Math.round(SH*.14), ww=Math.round(SW*.22), wh=Math.round(SH*.38); e4r(A5I,wx-2,wy-2,ww+4,wh+4); e4r(sun?'#a8b8e0':'#9fd0f0',wx,wy,ww,wh); e4r('#ffe9a8',wx+ww-12,wy+5,8,8); e4r('#c84a5a',wx-6,wy-3,8,wh+10); e4r('#c84a5a',wx+ww-2,wy-3,8,wh+10);
  const bx=Math.round(SW*.5), bw=Math.min(110,Math.round(SW*.42)), by=FY-14; e4r(A5I,bx,by-6,bw,16); e4r('#f4f0ea',bx+1,by-5,bw-2,6); e4r('#7a5232',bx+1,by+1,bw-2,8); e4r('#4a7ad8',bx+23,by-17,bw-26,16); e4r('#ffffff',bx+5,by-12,22,7);
  const tx=bx-24; e4r('#a8784a',tx,FY-20,18,20); e4r('#e8e2ea',tx+4,FY-30,10,9); e4r('#3a8a3a',Math.round(SW*.85),FY-30,10,30); e4End(); }
{ const _dc=st4DrawCards; st4DrawCards=function(m){ if(!m.wk) return _dc(m); const keep=G.labels.filter(l=>l[2]<SA.t+34); G.labels.length=0; G.labels.push(...keep); buttons.length=0;
    ctx.save(); try{ ctx.filter='blur(2px)'; }catch(e){} a5Room(!!(TR.wk&&TR.wk.sun)||/ВОСКР/.test(m.title||'')); ctx.restore(); try{ ctx.filter='none'; }catch(e){} ctx.fillStyle='rgba(10,6,20,.5)'; ctx.fillRect(0,0,W,H);
    const cw=Math.min(170,Math.floor((W-60)/2)), ch=Math.min(132,H-SA.t-SA.b-104), gap=14, x0=Math.round(W/2-cw-gap/2), y=Math.round(Math.max(SA.t+56,H/2-ch/2));
    const sun=/ВОСКР/.test(m.title||''); G.labels.push([m.title,W/2,y-14,11,'#ffe14a','center',P.ink]);
    m.cards.forEach((c,i)=>{ const x=x0+i*(cw+gap), sel=m.t>.35&&Math.floor(m.t*2)%2===0&&false; a5R(A5I,x-2,y-2,cw+4,ch+4); a5R('#fff8e8',x,y,cw,ch); a5R(c.col,x,y,cw,20); a5R('rgba(255,255,255,.25)',x,y,cw,2); a5R(A5I,x,y+20,cw,2);
      G.labels.push([c.t,x+cw/2,y+10,9,'#fff','center',A5I]);
      const ax=x+4, ay=y+25, aw=cw-8, ah=ch-25-18, AW=Math.floor(aw/2), AH=Math.floor(ah/2); a5R(A5I,ax-1,ay-1,AW*2+2,AH*2+2); ctx.save(); ctx.beginPath(); ctx.rect(ax,ay,AW*2,AH*2); ctx.clip(); ctx.translate(ax,ay); ctx.scale(2,2); const sg=a5CardArt(c.k,AW,AH,sun,m.t); ctx.restore();
      if(sg) G.labels.push([sg,ax+AW,ay+26,8,'#ffd23f','center',A5I]);
      const cap=wrapW(c.sub,cw-12,7)[0]||''; G.labels.push([cap,x+cw/2,y+ch-8,7,'#5a4a6a','center',null]);
      if(m.t>.35) buttons.push({x,y,w:cw,h:ch,id:'wk'+i,cb:()=>{ if(TR.smod!==m) return; TR.smod=null; m.opts[i][2](); SFX.ui(); }}); });
    const bw=cw*2+gap, by=y+ch+8, f=Math.max(0,Math.min(1,1-m.t/m.auto)); a5R(A5I,x0-1,by-1,bw+2,12); a5R('#3a3046',x0,by,bw,10); a5R(f<.3?'#e8562a':'#8a7ad8',x0,by,Math.round(bw*f),10); a5R('rgba(255,255,255,.22)',x0,by,Math.round(bw*f),2);
    G.labels.push(['ОБРАТНО СПАТЬ · '+Math.max(0,Math.ceil(m.auto-m.t))+' с',W/2,by+5,7,'#fff','center',A5I]); }; }
// ---------- 2. зал МЕГАХИМОК: потолок со светильниками, подвесные указатели отделов, разные стеллажи, паллеты/промостойки, тележки ----------
const A5SEC=[['МОЛОКО','fridge'],['ХЛЕБ','bread'],['ОВОЩИ И ФРУКТЫ','produce'],['БЫТОВАЯ ХИМИЯ','chem'],['НАПИТКИ','drinks'],['БАКАЛЕЯ','boxes']];
function a5Shelf(type,x,top,h,w,s){ const R=a5R; R(A5I,x-1,top-1,w+2,h+2);
  if(type==='fridge'){ R('#dfe4ea',x,top,w,h); R('#f4fbff',x,top,w,4); const n=3, dw=Math.floor((w-4)/n); for(let d=0;d<n;d++){ const dx=x+2+d*dw; R(A5I,dx,top+6,dw-2,h-10); R('#bfe4f4',dx+1,top+7,dw-4,h-12); const rows=4, rh=Math.floor((h-14)/rows);
      for(let r=0;r<rows;r++){ const ry=top+8+r*rh; R('#9ab8c8',dx+1,ry+rh-2,dw-4,1); for(let k=0;k+5<dw-4;k+=6){ const c=(r+d+k)%3===0?'#3a7ad8':(r%2?'#ffffff':'#ffe0a0'); R(A5I,dx+2+k,ry+rh-10,5,8); R(c,dx+3+k,ry+rh-9,3,7); R('#d8e8f8',dx+3+k,ry+rh-9,3,1); } } R('rgba(255,255,255,.35)',dx+3,top+8,2,h-16); } return; }
  const wood=type==='bread'||type==='produce'; R(wood?'#b07a4a':'#8a96a8',x,top,w,h); R(wood?'#c89060':'#9aa6b8',x,top,w,2); const rows=type==='produce'?3:5, rh=Math.floor((h-4)/rows);
  for(let r=0;r<rows;r++){ const ry=top+2+r*rh, base=ry+rh-2; R(A5I,x,base,w,2); R(wood?'#8a5a32':'#6a7688',x,base+1,w,1);
    if(type==='bread'){ for(let k=0;k+12<w;k+=13){ if((k+r)%3===2){ R(A5I,x+3+k,base-4,12,4); R('#e8b878',x+4+k,base-3,10,2); } else { R(A5I,x+3+k,base-7,10,7); R('#d89a50',x+4+k,base-6,8,5); R('#f0c888',x+5+k,base-6,4,1); R('#b87a3a',x+6+k,base-3,1,2); R('#b87a3a',x+9+k,base-3,1,2); } } }
    else if(type==='produce'){ const cols=[['#ff8a1a','#ffb85a'],['#e83a3a','#ff8a8a'],['#4ab04a','#8ae07a'],['#ffd23f','#fff09a']]; for(let k=0;k+22<w;k+=24){ const c=cols[(k/24+r+s)%4|0]; R(A5I,x+2+k,base-9,22,9); R('#a8743a',x+3+k,base-3,20,2); for(let i=0;i<6;i++){ R(A5I,x+3+k+i*3,base-8+(i%2),4,4); R(c[0],x+4+k+i*3,base-7+(i%2),2,2); R(c[1],x+4+k+i*3,base-7+(i%2),1,1); } } }
    else if(type==='chem'){ const cols=['#3a7ad8','#8a5ad8','#3ab08a','#f4f4f8','#ff5a8a']; for(let k=0;k+9<w;k+=10){ const c=cols[(k/10+r*2+s)%5|0], bh=10+((k+r)%3)*2; R(A5I,x+2+k,base-bh,8,bh); R(c,x+3+k,base-bh+1,6,bh-1); R(A5I,x+4+k,base-bh-2,3,2); R('#fff',x+4+k,base-bh+4,4,3); } }
    else if(type==='drinks'){ const cols=['#4ab04a','#e83a3a','#8a5a2a','#3a7ad8','#ffd23f']; for(let k=0;k+5<w;k+=6){ const c=cols[(k/6+r+s)%5|0]; if(r%2){ R(A5I,x+2+k,base-7,5,7); R(c,x+3+k,base-6,3,6); R('#e8e8f0',x+3+k,base-6,3,1); } else { R(A5I,x+2+k,base-12,5,12); R(A5I,x+3+k,base-14,3,2); R(c,x+3+k,base-11,3,11); R('rgba(255,255,255,.5)',x+3+k,base-10,1,6); } } }
    else { const cols=['#e8562a','#ffd23f','#3a8ad8','#d8346a','#4ab04a','#e8e2a0']; let k=0, i=0; while(k<w-8){ const bw=7+((i*5+r+s)%3)*3, bh=9+((i*3+r)%3)*2, c=cols[(i+r*2+s)%6]; if(k+bw>w-2) break; R(A5I,x+2+k,base-bh,bw,bh); R(c,x+3+k,base-bh+1,bw-2,bh-1); R('#fff',x+4+k,base-bh+3,Math.max(1,bw-5),2); k+=bw+1; i++; } } } }
{ const MZ=ZONES.mega, i0=MZ.init; MZ.init=function(z){ i0.apply(this,arguments); /* M6: стоящие покупатели — только в верхнем ряду (не под кнопками справа внизу) */ for(const e of z.npcs) if(e.browse) e.y=z.ly[0]; z.scarts=z.npcs.filter(e=>e.browse&&(e.x|0)%2===0).map(e=>({x:e.x+(e.face>0?16:-26),y:e.y,z:0,noSolid:true,drawFn:megaCart})); };
  MZ.draw=function(z){ const c=G.cam, WT=Math.round(Math.max(SA.t+92,FY0-150)), sec=240;
    // потолок: тёмная решётка Армстронг, ряды светильников с параллаксом (ближе к низу — дальше)
    a5R('#7a7e8c',0,0,W,WT); const bands=[[0,18,1.0],[18,40,.85],[40,WT-36,.7],[WT-36,WT-14,.55],[WT-14,WT,.42]].filter(b=>b[1]>b[0]);
    bands.forEach(([y0,y1,p],bi)=>{ a5R(bi%2?'#868a98':'#8a8e9c',0,y0,W,y1-y0); a5R('#7a7e8c',0,y1-1,W,1); const step=Math.round(96*p+24)*2, off=-(Math.round(c*p)%step); for(let x=off;x<W+step;x+=step){ a5R('#7e8290',x,y0,1,y1-y0); if(bi!==1&&bi!==3) continue; const lw=Math.round(44*p), lh=Math.max(2,Math.round((y1-y0)*.35)), ly=Math.round((y0+y1)/2-lh/2); a5R(A5I,x+12-1,ly-1,lw+2,lh+2); a5R('#fffaf0',x+12,ly,lw,lh); a5R('#ffffff',x+12,ly,lw,1); a5R('rgba(255,250,220,.12)',x+6,y1,lw+12,4); } });
    a5R(A5I,0,WT,W,2); a5R(MEGA_C.wall,0,WT+2,W,FY0-WT-2); a5R(MEGA_C.wallSh,0,WT+2,W,4);
    // стеллажи по отделам
    const top=WT+12, sh=FY0-top-6; const s0=Math.floor((c-sec)/sec), s1=Math.floor((c+W+sec)/sec);
    for(let si=s0;si<=s1;si++){ const wx=si*sec; if(wx<170||wx+sec>z.K-40) continue; const S=A5SEC[((si%6)+6+(z.sun?3:0))%6], x=Math.round(wx-c); a5Shelf(S[1],x+6,top,sh,sec-30,si&7);
      // подвесной указатель отдела: тросы к потолку; надпись только если табличка целиком на экране
      const tw=Math.ceil(txtW(S[0],7))+14, tx=Math.round(x+6+(sec-30)/2-tw/2), ty=WT-24; a5R(A5I,tx+5,ty-12,1,12); a5R(A5I,tx+tw-6,ty-12,1,12); a5R(A5I,tx-1,ty-1,tw+2,15); a5R(S[1]==='fridge'?'#2a6ad8':S[1]==='produce'||S[1]==='bread'?'#3a8a3a':S[1]==='chem'?'#8a5ad8':'#d8742a',tx,ty,tw,13); a5R('rgba(255,255,255,.3)',tx,ty,tw,1);
      if(tx>=6&&tx+tw<=W-6) G.labels.push([S[0],tx+tw/2,ty+7,7,'#fff','center',null]);
      // паллета с коробками / промостойка «АКЦИЯ»
      const fx=x+Math.round(sec*.55); if(si%3===1){ a5R(A5I,fx-1,FY0-10,40,6); a5R('#c8945a',fx,FY0-9,38,4); for(let r=0;r<2;r++) for(let k=0;k<3;k++){ const bx=fx+1+k*12, by=FY0-10-(r+1)*11; a5R(A5I,bx,by,12,11); a5R('#d8a868',bx+1,by+1,10,9); a5R('#b8884a',bx+1,by+5,10,1); }
          const tg='−50%'; if(fx>8&&fx+40<W-8){ a5R(A5I,fx+8,FY0-42,22,10); a5R(MEGA_C.red,fx+9,FY0-41,20,8); G.labels.push([tg,fx+19,FY0-37,7,'#fff','center',null]); } }
      else if(si%3===2){ a5R(A5I,fx-1,FY0-36,38,32); a5R(MEGA_C.red,fx,FY0-35,36,30); a5R(MEGA_C.yel,fx,FY0-35,36,9); for(let k=0;k<5;k++){ a5R(A5I,fx+2+k*7,FY0-23,6,10); a5R(['#3a7ad8','#4ab04a','#ffd23f','#ff5a8a','#fff'][k],fx+3+k*7,FY0-22,4,9); } if(fx>8&&fx+40<W-8) G.labels.push(['АКЦИЯ',fx+18,FY0-30,6,'#5a1a0a','center',null]); } }
    // вход: стеклянные автодвери
    { const x=Math.round(40-c); if(x>-160){ a5R(A5I,x-1,WT+12,82,FY0-WT-12); a5R('#9fd0f0',x,WT+13,80,FY0-WT-14); a5R('#cfeaff',x+6,WT+16,8,FY0-WT-22); a5R(A5I,x+39,WT+13,2,FY0-WT-14); const s='ВХОД'; if(x+40-20>6&&x+60<W-6){ a5R(A5I,x+19,WT-20,42,14); a5R('#3a8a3a',x+20,WT-19,40,12); G.labels.push([s,x+40,WT-13,7,'#fff','center',null]); } } }
    // пол-плитка
    a5R(MEGA_C.floor,0,FY0-4,W,H-FY0+4); ctx.fillStyle=MEGA_C.floorSh; for(let x=-(Math.round(c)%32);x<W;x+=32) ctx.fillRect(x,FY0-4,1,H); for(let y=FY0+8;y<H;y+=12) ctx.fillRect(0,y,W,1); a5R(A5I,0,FY0-5,W,1);
    { const x=Math.round(z.K+4-c), s=z.sun?'ВОЗВРАТ ТОВАРА':'КАССЫ', w=Math.ceil(txtW(s,7))+12, y=WT-24; if(x+16-w/2>-w&&x+16-w/2<W){ a5R(A5I,x+16-1,y-12,1,12); a5R(A5I,x+16-w/2-1,y-1,w+2,15); a5R(MEGA_C.red,x+16-w/2,y,w,13); if(x+16-w/2>=6&&x+16+w/2<=W-6) G.labels.push([s,x+16,y+7,7,'#fff','center',null]); } }
    { const x=Math.round(z.len-60-c); if(x<W+20){ a5R(A5I,x-1,WT+12,62,FY0-WT-12); a5R('#9fd0f0',x,WT+13,60,FY0-WT-14); a5R('#7186a6',x,FY0-26,60,12); a5R(A5I,x+29,WT+13,2,FY0-WT-14); const px=x+30, py=WT+22; a5R(A5I,px-8,py-1,16,16); a5R('#2a6ad8',px-7,py,14,14); if(px>8&&px<W-8) G.labels.push(['P',px,py+7,9,'#fff','center',null]); } }
    drawTripActors([G.hero,...z.npcs,...z.carts,...(z.scarts||[]),...z.belts]); }; }
// ---------- 3. салоны трамвая/автобуса на весь экран (целый масштаб как у концовок), люди сидят на сиденьях ----------
function a5Win(x,y,w,h,t,kind){ e4r(A5I,x-1,y-1,w+2,h+2); e4r(kind==='tram'?'#9ad8ff':'#a8dcff',x,y,w,h); e4r('#c8ecff',x,y,w,3);
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); for(let i=-1;i<4;i++){ const fx=x+((i*23-t*10)%(w+30)+w+30)%(w+30)-15, bh=8+(i*7&7); e4r(kind==='tram'?'#b0a4c8':'#a8b4c8',fx,y+h-bh,14,bh); e4r('#e8e2a0',fx+3,y+h-bh+2,2,2); }
  for(let i=-1;i<3;i++){ const fx=x+((i*31-t*34)%(w+20)+w+20)%(w+20)-8; e4r('#3a8a4a',fx,y+h-9,7,6); e4r('#6a4a2a',fx+3,y+h-3,1,3); } ctx.restore(); e4r('rgba(255,255,255,.4)',x+2,y+2,1,h-4); }
function a5Sit(S,x,seatY,flip,mode){ if(S) spr(S,'sit',0,mode||'norm',x,seatY,flip,1); }
function t5Full(m,kind){ G.labels.length=0; buttons.length=0; const g=w5Begin(), {SW,SH}=g, t=m.t||0, sh=Math.round(Math.sin(t*(kind==='tram'?9:14))*.6), FY=SH-16, S=t5Specs();
  ctx.translate(0,sh);
  e4r(kind==='tram'?'#e4e8f0':'#ece6da',0,-2,SW,SH+4); e4r(kind==='tram'?'#b8c0d0':'#c8c0b0',0,-2,SW,12); e4r('#fffaf0',0,9,SW,1); for(let x=10;x<SW;x+=46){ e4r(A5I,x-1,3,26,4); e4r('#fffaf0',x,4,24,2); }
  const wy=20, wh=Math.round(FY*.42), cab=kind==='tram'?44:0, step=kind==='tram'?38:44, ww=step-8;
  for(let x=6;x+ww<=SW-cab-4;x+=step){ if(kind==='bus'&&Math.abs(x+ww/2-SW*.42)<28) continue; a5Win(x,wy,ww,wh,t,kind); }
  e4r(kind==='tram'?'#d4d8e4':'#ddd6c6',0,wy+wh+2,SW,FY-wy-wh-2); e4r(kind==='tram'?'#c0c6d4':'#cfc6b4',0,wy+wh+2,SW,2);
  e4r(A5I,0,FY,SW,1); e4r('#4a4a56',0,FY+1,SW,SH-FY); for(let x=2;x<SW;x+=6) e4r('#3a3a46',x,FY+4,3,1);
  // поручень + ручки-петли
  e4r('#c0c0c8',0,14,SW-cab,2); for(let x=12;x<SW-cab;x+=16){ e4r('#c0c0c8',x,16,1,5); e4r(A5I,x-2,21,5,4); e4r('#e8e8f0',x-1,22,3,2); }
  const seatY=FY-12; let seats=[];
  if(kind==='tram'){ // продольный диван вдоль стены, стойки, кабина за стеклом справа
    const x0=6, x1=SW-cab-30; e4r(A5I,x0-1,seatY-14,x1-x0+2,9); e4r('#3a5ab0',x0,seatY-13,x1-x0,7); e4r('#5a7ad0',x0,seatY-13,x1-x0,1); e4r(A5I,x0-1,seatY-1,x1-x0+2,6); e4r('#3a5ab0',x0,seatY,x1-x0,4); e4r('#5a7ad0',x0,seatY,x1-x0,1); for(let x=x0+4;x<x1;x+=18) e4r('#2a2a34',x,seatY+5,2,FY-seatY-5);
    for(let x=x0;x<x1-10;x+=20) seats.push(x+8);
    const dx=SW-cab-26; e4r(A5I,dx-1,wy-4,24,FY-wy+4); e4r('#5a5a68',dx,wy-3,22,FY-wy+3); e4r('#8fd8ff55',dx+1,wy-2,9,FY-wy-1); e4r('#8fd8ff55',dx+12,wy-2,9,FY-wy-1); e4r(A5I,dx+10,wy-3,2,FY-wy+3);
    const cx=SW-cab; e4r('#8a8aa0',cx,8,2,FY-8); e4r('#8fd8ff4d',cx+2,10,cab-2,FY-28); e4r('#3a3a48',cx+12,FY-22,cab-14,22); spr(heroSpec('serega')&&S.polite||S.aunt,'sit',0,'norm',cx+24,FY-10,false,1); e4r(A5I,cx+30,FY-30,10,10); e4r('#5a5a68',cx+31,FY-29,8,8);
    for(const px of [Math.round(SW*.3),Math.round(SW*.55)]) { e4r('#e8c020',px,16,2,FY-16); e4r('#fff09a',px,16,1,FY-16); } }
  else { // автобус: поштучные сиденья парами, двери посередине, кнопка СТОП, валидатор
    for(let x=10;x<SW-20;x+=30){ if(Math.abs(x+8-SW*.42)<30) continue; const c=(x/30|0)%2?'#3a5ad8':'#d84a4a'; e4r(A5I,x-1,seatY-17,5,18); e4r(c,x,seatY-16,3,16); e4r(A5I,x-1,seatY-1,17,5); e4r(c,x,seatY,15,3); e4r('rgba(255,255,255,.3)',x+1,seatY,13,1); e4r('#2a2a34',x+6,seatY+4,2,FY-seatY-4); seats.push(x+8); }
    const dx=Math.round(SW*.42)-14; e4r(A5I,dx-1,wy-4,30,FY-wy+4); e4r('#5a5a68',dx,wy-3,28,FY-wy+3); e4r('#8fd8ff55',dx+1,wy-2,12,FY-wy-1); e4r('#8fd8ff55',dx+15,wy-2,12,FY-wy-1); e4r(A5I,dx+13,wy-3,2,FY-wy+3); e4r(A5I,dx+31,wy+wh-2,5,5); e4r('#d82626',dx+32,wy+wh-1,3,3);
    e4r(A5I,dx+40,FY-36,7,10); e4r('#e8e8f0',dx+41,FY-35,5,8); e4r('#3ac84a',dx+41,FY-33,5,2); e4r('#e8c020',dx+43,16,1,FY-36-16);
    for(const px of [Math.round(SW*.2),Math.round(SW*.72)]){ e4r('#e8c020',px,16,2,FY-16); e4r('#fff09a',px,16,1,FY-16); } }
  // пассажиры: сидят ровно на сиденье (точка посадки = верх подушки)
  const hs=heroSpec(heroId), sy=seatY+1;
  if(kind==='tram'){ const n=seats.length; a5Sit(S.seeds,seats[0],sy,false); a5Sit(hs,seats[Math.min(n-1,Math.floor(n*.45))],sy,false,'happy'); if(typeof NASTYA!=='undefined') a5Sit(NASTYA,seats[Math.min(n-1,Math.floor(n*.45))]+12,sy,true,'happy'); a5Sit(S.aunt,seats[Math.max(0,n-2)],sy,true); if(S.student) spr(S.student,'idle',0,'norm',SW-cab-34,FY,true,1);
    const hx=seats[Math.min(n-1,Math.floor(n*.45))]+6, b=Math.round(Math.sin(t*5)); e4r(A5I,hx-1,sy-36+b,4,3); e4r(A5I,hx+3,sy-36+b,4,3); e4r(A5I,hx,sy-33+b,6,3); e4r('#ff5a8a',hx,sy-35+b,2,1); e4r('#ff5a8a',hx+4,sy-35+b,2,1); e4r('#ff5a8a',hx+1,sy-34+b,4,2); }
  else { a5Sit(S.aunt,seats[0],sy,false); a5Sit(S.kid,seats[seats.length-1],sy,true,'o'); a5Sit(S.tourist,seats[1],sy,false); spr(hs,'idle',Math.floor(t*4)%2,'norm',Math.round(SW*.42)+24,FY,true,1); }
  e4End(); const k=g.k, bdY=Math.round((wy-8+sh)*k);
  const bd=kind==='tram'?'ПАРК ▸ ФОНТАН':'№ 33 МЕГА'; const bw=Math.ceil(txtW(bd,9))+16; a5R(A5I,W/2-bw/2-1,bdY-8,bw+2,16); a5R('#1a1424',W/2-bw/2,bdY-7,bw,14); G.labels.push([bd,W/2,bdY,9,'#ffb42a','center',null]);
  const barH=24+(SA.b||0), barY=H-barH; a5R(A5I,0,barY,W,barH); a5R('#2a2236',0,barY,W,1); G.labels.push([m.title||'',W/2,barY+12,11,'#ffe14a','center',null]); /* M6: подпись в нижней плашке, ниже пола — не на ногах */
  const cue=kind==='tram'?(Math.floor(t*2)%3===0?'ДЗЫНЬ!':''):(t<.7?'ПШШ…':''); if(cue) G.labels.push([cue,Math.round(W-Math.max(SA.r||0,0)-60),barY+12,10,'#bfe8ff','center',null]); }
{ const _dm=st4DrawModal; st4DrawModal=function(m){ if(m.scene==='bus'||m.scene==='tram') return t5Full(m,m.scene);
    if(m.scene==='taxi'){ const fr=ctx.fillRect; let done=0; ctx.fillRect=function(x,y,w,h){ if(!done&&x<=0&&y<=0&&w>=W&&h>=H){ done=1; a5Night(m.t||0); return; } return fr.apply(this,arguments); }; try{ return _dm(m); } finally{ ctx.fillRect=fr; } }
    return _dm(m); }; }
// ночной город за такси: небо, дома с окнами (параллакс), фонари, дорога
function a5Night(t){ const fr=CanvasRenderingContext2D.prototype.fillRect, R=(c,x,y,w,h)=>{ ctx.fillStyle=c; fr.call(ctx,Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  R('#1a1430',0,0,W,H); R('#241c44',0,H*.35,W,H*.2); R('#ffe9a8',W*.82,24,10,10); const hz=Math.round(H*.62);
  for(let L=0;L<2;L++){ const p=L?60:24, col=L?'#2a2448':'#211b3c', off=(t*p)%90; for(let x=-off-90,i=0;x<W+90;x+=L?70:56,i++){ const bh=(L?90:130)+((i*37)%5)*14; R(A5I,x,hz-bh,L?62:50,bh); R(col,x+1,hz-bh+1,L?60:48,bh-1); for(let wy=hz-bh+8;wy<hz-10;wy+=12) for(let wx=x+6;wx<x+(L?54:42);wx+=10) if(((wx*7+wy*3+i)>>2)%3) R('#ffd86a',wx,wy,4,5); } }
  R('#2a2a34',0,hz,W,H-hz); R('#3a3a46',0,hz,W,3); const o=(t*220)%80; for(let x=-o;x<W;x+=80) R('#8a7a4a',x,hz+Math.round((H-hz)*.55),36,4);
  for(let x=-((t*160)%200);x<W+200;x+=200){ R(A5I,x,hz-90,4,90); R('#ffe9a8',x-6,hz-94,16,5); R('rgba(255,233,168,.08)',x-30,hz-88,64,88); } }
// ---------- 4. парковая аллея с Настей: мощёная дорожка, газоны, клумбы, разные деревья, киоск, скамейки с людьми, фонтан; без дороги и машин ----------
{ const _g=st4Ground; st4Ground=function(z){ if(!(z&&z.nastya)) return _g.apply(this,arguments); const g=st4Geo(), c=Math.round(G.cam);
    a5R('#d8c8a8',0,g.facadeB,W,g.curbY-g.facadeB); for(let y=g.facadeB+6;y<g.curbY;y+=8){ const o=((y/8)|0)%2?8:0; a5R('#c8b694',0,y,W,1); for(let x=-((c+o)%16);x<W;x+=16) a5R('#c8b694',x,y-7,1,7); }
    a5R('#b8a684',0,g.facadeB,W,2); a5R(A5I,0,g.curbY,W,1); a5R('#9a9aa6',0,g.curbY+1,W,2);
    a5R('#7ab86a',0,g.curbY+3,W,g.bot-g.curbY); a5R('#6aa85a',0,g.curbY+3,W,2); for(let x=-(c%12);x<W;x+=12) a5R('#8ac87a',x,g.curbY+8+((x+c)/12&1)*9,2,1);
    for(let x=-(c%180)-180;x<W+180;x+=180){ const wx=x+c, fx=x+30, fy=g.curbY+12; if(fy+16>g.bot) continue; a5R(A5I,fx-1,fy-1,74,14); a5R('#7a4a2e',fx,fy,72,12); a5R('#6a3a22',fx,fy+9,72,3);
      for(let i=0;i<8;i++){ const cc=['#ff5a8a','#ffd23f','#ffffff','#e8562a','#b05ad8'][(i+(wx/180|0))%5]; const px=fx+5+i*8, py=fy-4+(i%2)*3; a5R(A5I,px-2,py+3,7,4); a5R('#3a8a3a',px-1,py+4,5,2); a5R(A5I,px-1,py-1,5,5); a5R(cc,px,py,3,3); a5R('#fff6a0',px+1,py+1,1,1); } } };
  for(const fn of ['st4CarsDraw','st4Poles']){ const o=window[fn]; if(typeof o==='function') window[fn]=function(z){ if(z&&z.nastya) return; return o.apply(this,arguments); }; }
  if(typeof st4TransDraw==='function'){ const o=st4TransDraw; st4TransDraw=function(z){ if(z&&z.nastya) return; return o.apply(this,arguments); }; } }
wk5Park=function(z){ const g=st4Geo(), c=G.cam, fb=g.facadeB; a5R('#9fd0f0',0,0,W,fb); a5R('#cfeaff',0,fb-56,W,16); for(let x=-(Math.round(c*.15)%220);x<W+220;x+=220){ a5R('#fff',x+30,SA.t+60,34,5); a5R('#fff',x+40,SA.t+56,18,4); }
  a5R('#5a8a5a',0,fb-48,W,30); for(let x=-(Math.round(c*.4)%40)-40;x<W+40;x+=40){ a5R('#4a7a4a',x,fb-54,26,10); a5R('#6a9a5a',x+14,fb-58,20,12); }
  a5R('#7ab86a',0,fb-22,W,22); a5R(A5I,0,fb-1,W,1);
  const S=t5Specs(), step=110; for(let x=-(Math.round(c)%step)-step;x<W+step;x+=step){ const wx=x+Math.round(c), i=Math.floor(wx/step), ty=fb-6;
    ctx.save(); ctx.translate(x+24,ty); ctx.scale(2,2); const kind=((i%3)+3)%3; if(kind===0) a5Birch(0,0,18); else if(kind===1) a5Oak(0,0,12); else a5Fir(0,0,22); ctx.restore();
    if(i%4===1){ const kx=x+62; a5R(A5I,kx-1,ty-44,40,44); a5R('#f4f0ea',kx,ty-43,38,43); a5R('#e85a8a',kx,ty-43,38,9); for(let s=0;s<38;s+=8) a5R('#fff',kx+s,ty-43,4,9); a5R(A5I,kx+5,ty-30,28,14); a5R('#ffe9a8',kx+6,ty-29,26,12); a5R('#7ab8e0',kx+8,ty-27,8,6); a5R('#ff8ab0',kx+20,ty-27,4,4); a5R('#ffd23f',kx+25,ty-27,4,4); a5R('#8a5a3a',kx,ty-14,38,2); if(kx+19>30&&kx+19<W-30) G.labels.push(['МОРОЖЕНОЕ',kx+19,ty-50,6,'#fff','center',A5I]); }
    else if(i%2===0){ const bx=x+60; a5R(A5I,bx-1,ty-14,34,4); a5R(A5I,bx-1,ty-22,34,4); a5R('#c8845a',bx,ty-13,32,2); a5R('#c8845a',bx,ty-21,32,2); a5R(A5I,bx+2,ty-10,3,10); a5R(A5I,bx+27,ty-10,3,10);
      const L=[S.aunt,S.tourist,S.student,S.polite].filter(Boolean); const p=L[((i%L.length)+L.length)%L.length]; if(p) spr(p,'sit',0,'norm',bx+10,ty-12,false,.85); if(i%4===0&&L[1]) spr(L[(i+1)%L.length],'sit',0,'norm',bx+23,ty-12,true,.85); }
    else { const lx=x+80; a5R(A5I,lx,ty-56,3,56); a5R('#3a3a4a',lx+1,ty-56,1,56); a5R(A5I,lx-5,ty-62,13,7); a5R('#ffe9a8',lx-4,ty-61,11,4); } }
  if(z.ev==='coffee'&&z.kx){ const fc=st4Facade(z), x0=z.kx-80; ctx.drawImage(fc,x0+20,0,170,fb,Math.round(x0-c),0,170,fb); }
  if(z.end==='fountain'){ const fx=Math.round(z.len-110-c); if(fx>-120&&fx<W+120){ ctx.save(); ctx.translate(fx,fb-2); ctx.scale(2,2); a5Fountain(0,0,G.t); ctx.restore(); } } };
// крупнее и читаемее: герой и Настя в парке ×1.25, держатся за руки
{ const ZS=ZONES.street, _u=ZS.update; ZS.update=function(z,dt){ const r=_u.apply(this,arguments); const h=G.hero; if(h) h.scale=z&&z.nastya?1.25:(h.scale===1.25?1:h.scale); if(z&&z.nas) z.nas.scale=1.25; return r; };
  const _nz=nextZone; nextZone=function(){ const r=_nz.apply(this,arguments); if(G.hero&&!(TR.z&&TR.z.nastya)&&G.hero.scale===1.25) G.hero.scale=1; return r; }; }
// ---------- M6: парк — без транспорта (логика, гудки, автобус/такси не создаются) ----------
{ const ZS=ZONES.street, i0=ZS.init; ZS.init=function(z){ if(z&&z.nastya) z.carsOff=1; const r=i0.apply(this,arguments); if(z&&z.nastya){ z.carsOff=1; z.cars=[]; z.bus=null; z.taxi=null; z.cars2=[]; } return r; }; }
// ---------- M6: пауза — две ровные колонки: слева 3 действия, справа громкости + ЗВУК/ВИБРО одной строкой (низ колонок выровнен) ----------
drawPause=function(){ G.labels.length=0; SLD.list=[]; ctx.fillStyle='#120c18d8'; ctx.fillRect(0,0,W,H);
  const bh=Math.max(26,Math.round(44*DPR/SC)), gap=8, colH=3*bh+2*gap, bw=Math.min(170,Math.round((W-SA.l-SA.r)*.3)), rw=Math.min(250,Math.round((W-SA.l-SA.r)*.42)), mid=22, tot=bw+mid+rw;
  const x0=Math.round(SA.l+(W-SA.l-SA.r)/2-tot/2), y=Math.round(Math.max(SA.t+44,(H-colH)/2+8)); G.labels.push(['ПАУЗА',W/2,y-22,16,P.edge]);
  bigBtn('ПРОДОЛЖИТЬ',x0,y,bw,bh,'#2aa860',()=>paused=false,'resume'); bigBtn('ЗАНОВО',x0,y+bh+gap,bw,bh,'#3a6ad8',()=>{paused=false; startLevel(curIdx);},'restart'); bigBtn('НА КАРТУ',x0,y+2*(bh+gap),bw,bh,'#8a3ad8',()=>{paused=false; toMap();},'map');
  const rx=x0+bw+mid, th=Math.max(22,Math.round(34*DPR/SC)), rh=Math.max(18,Math.floor((colH-th-12)/3)); a5R('rgba(255,255,255,.06)',rx-2,y-2,rw+4,colH+4); volSliders(rx+8,y+2,rw-16,rh);
  const ty=y+colH-th, tw=Math.floor((rw-gap)/2);
  bigBtn(save.mute?'ЗВУК: ВЫКЛ':'ЗВУК: ВКЛ',rx,ty,tw,th,save.mute?'#5a4a5a':'#3a7a5a',()=>{save.mute=!save.mute; if(typeof master!=='undefined'&&master) audApply(); store();},'mute',8);
  bigBtn(save.noHaptic?'ВИБРО: ВЫКЛ':'ВИБРО: ВКЛ',rx+tw+gap,ty,rw-tw-gap,th,save.noHaptic?'#5a4a5a':'#3a7a5a',()=>{save.noHaptic=!save.noHaptic; store(); haptic('select');},'hapt',8); };
// ---------- M6: указатели направления на полу (до актёров): платформа — разметка дверей, переход → , обратный переход ← ----------
function a5Chev(x,y,dir,col){ for(let k=0;k<6;k++){ a5R(col,x+dir*k*2,y-10+k*2,4,2); a5R(col,x+dir*k*2,y+10-k*2,4,2); } }
{ const _h=hallBG; hallBG=function(z,o){ const r=_h.apply(this,arguments); try{ const k=z&&z.k, c=G.cam, fy=Math.round(FY0+(FY1-FY0)*.82);
    if(k==='plat'&&z.doors){ const on=z.ph==='open'||z.ph==='closing', bl=on&&Math.floor(G.t*3)%2===0; for(const d of z.doors){ const x=Math.round(d.x-c); if(x<-40||x>W+40) continue; const col=on?(bl?'#ffe14a':'#ffd23f'):'rgba(255,210,63,.55)'; a5R(col,x-18,FY0+1,36,2); a5R(col,x-18,FY0+1,2,12); a5R(col,x+16,FY0+1,2,12); for(let i=0;i<2;i++){ const yy=FY0+5+i*5; for(let k=0;k<4;k++) a5R(col,x-7+k,yy+k,14-2*k,1); } } }
    else if(k==='passage'||k==='xfer'){ const dir=k==='xfer'?-1:1, step=170, col='rgba(255,220,90,.55)', lo=SA.l+130, hi=W-SA.r-140; for(let x=-(Math.round(c)%step)+40;x<W+step;x+=step){ if(x<lo||x+30>hi) continue; for(let j=0;j<2;j++) a5Chev(x+j*14*dir,fy,dir,col); } } }catch(e){} return r; }; }
