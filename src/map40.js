// map40.js — M1-11…M1-14: карта маршрута дня (§N). Ватман #141428 + сетка 8 px; кольцевая метро 24 ст. (3 ветки по 8 = дуги кольца),
// МЦК (бело-красное кольцо со шпалами, 8 пересадок), МЦД-1/2 (полосатые диаметры со стрелками-пародиями), ДОМ (дым) и ОФИС-башня (окно 14-го этажа мигает),
// маршрут дня: аура + бегущие точки ДОМ→ОФИС, остальное −40%; иконки событий 8×8 (≤3 на сегмент, «+N»); замки 5×6 (очки по тапу); ближайшая разблокировка пульсирует;
// «ТЫ ТУТ» кольцо 7/9 px + голова героя; поезд по маршруту 2.5 с (тап — пропуск). Шапка: день недели/погода/тип, новость бегущей строкой, МЕНЮ; внизу ПОЕХАЛИ.
// Подписанные кнопки: только МЕНЮ и ПОЕХАЛИ. Ветки (line0–2), ◀ ▶ (prev/next), станции (st0–7), герой (heroes) — иконки без подписей.
// Автораскладчик подписей (4 позиции, иначе скрыть) — 0 пересечений; MAP4.rects — для теста раскладки. Анимации выключаются «спокойным» режимом.
const MAP4={intro:0,introT:2.5,rects:[],pig:{t:8,x:-20},sel:-1,parts:[],lastKey:''};
function map4Calm(){ return !!save.calm; }
function map4Def(){ // станция по умолчанию: последняя сыгранная (если открыта) или первая непройденная открытая
  const li=save.lastIdx; if(li!=null&&lvOpen(Math.floor(li/8),li%8)) return li;
  for(let i=0;i<24;i++){ if(lvOpen(Math.floor(i/8),i%8)&&!(save.tbest&&save.tbest[i])) return i; } return 0; }
function map4Idx(){ return mapSel>=0?mapLine*8+mapSel:map4Def(); }
function map4Go(){ const idx=map4Idx(); save.lastIdx=idx; const w=Math.floor(idx/8), i=idx%8;
  if(i===0&&w>0&&!save.cut['line'+w]){ save.cut['line'+w]=1; store(); startCut('line',()=>startDay(idx,{resume:segResumable()}),w); } else startDay(idx,{resume:segResumable()}); }
// геометрия кольца
function map4Geo(){ const L=SA.l+6, R=W-SA.r-6, T=SA.t+4, bh=Math.max(26,44*DPR/SC), hh=bh, BH=Math.max(bh+8,40), by=H-SA.b-BH-4;
  const top=T+hh+8, bot=by-6, k=Math.max(1,Math.floor(Math.min(W/320,H/180)));
  const cy=Math.round((top+bot)/2), ry=Math.max(34,Math.round((bot-top)/2-20)), cx=Math.round((L+R)/2)-Math.round((R-L)*.08), rx=Math.round(Math.min((R-L)/2-90,ry*2.1));
  return {L,R,T,bh,hh,BH,by,top,bot,cx,cy,rx,ry,k}; }
function map4Ang(idx){ return ((idx-3.5)/24)*Math.PI*2-mapPan*Math.PI*2/3; }
function map4Pt(g,a,dr){ dr=dr||0; return {x:Math.round(g.cx+Math.cos(a)*(g.rx+dr)),y:Math.round(g.cy+Math.sin(a)*(g.ry+dr*g.ry/g.rx))}; }
function map4St(g,idx){ return map4Pt(g,map4Ang(idx)); }
function map4Out(g,idx,d){ const a=map4Ang(idx); return {x:Math.round(g.cx+Math.cos(a)*(g.rx+d)),y:Math.round(g.cy+Math.sin(a)*(g.ry+d))}; }
// «всратая» линия: точки с дрожанием 1 px на изгибах
function map4Poly(pts,col,w){ if(MAP4.seg) for(let i=0;i<pts.length-1;i++) MAP4.seg.push({a:pts[i],b:pts[i+1],hw:w/2}); ctx.fillStyle=col; for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1], n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y))); for(let s=0;s<=n;s++){ const x=a.x+(b.x-a.x)*s/n, y=a.y+(b.y-a.y)*s/n; ctx.fillRect(Math.round(x-w/2),Math.round(y-w/2),w,w); } } }
function map4Arc(g,i0,i1,dr,n){ const out=[]; n=n||Math.max(2,Math.abs(i1-i0)*4); for(let s=0;s<=n;s++){ const t=i0+(i1-i0)*s/n; out.push(map4Pt(g,map4Ang(t),dr)); } return out; }
function map4Dots(a,b,col,ph){ if(MAP4.seg) MAP4.seg.push({a,b,hw:1}); const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)); ctx.fillStyle=col; for(let s=0;s<n;s++){ if(((s+(ph|0))>>1)%2) continue; ctx.fillRect(Math.round(a.x+(b.x-a.x)*s/n),Math.round(a.y+(b.y-a.y)*s/n),1,1); } }
// иконки событий 8×8 (пиксельные)
const MAP4_EVI={light:'light',puddles:'drop',promoter:'flyer',pigeons:'pigeon',construction:'cone',accident:'car',ice:'snow',controllers:'vest',scooters:'scooter',couriers:'box',coffee:'cup',lift:'lift',stairs14:'stairs',colleague:'mug',
  vend:'cup',detector:'gate',stairs:'stairs',kiosk:'kiosk',lost:'box',short:'car2',cols:'gate',gangway:'car2',terminal:'stop',transfer:'xfer',headon:'xfer',musician:'note',walkway:'xfer',repairs:'cone',service:'gate',vendp:'cup',kioskp:'kiosk',stairs2:'stairs',rain:'drop'};
function map4Icon(kind,x,y){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-1,-1,10,10); f('#2a2a48',0,0,8,8);
  switch(kind){ case 'light': f('#4a4752',2,0,4,8); f('#e8343a',3,1,2,2); f('#ffd23f',3,3,2,1); f('#3fd06a',3,5,2,2); break; case 'drop': f('#3d6ff0',3,1,2,1); f('#3d6ff0',2,2,4,3); f('#8fd8ff',1,5,6,2); f('#fff',3,3,1,1); break;
    case 'flyer': f('#fff',1,1,6,6); f('#ff4fa3',2,2,4,2); f('#4a4752',2,5,4,1); break; case 'pigeon': f('#9a9aa8',1,3,5,3); f('#6a6a7a',5,1,2,3); f('#ff8a1f',7,2,1,1); f('#ff8a1f',2,6,1,1); f('#ff8a1f',4,6,1,1); break;
    case 'cone': f('#ff7a1f',3,1,2,2); f('#fff',2,3,4,1); f('#ff7a1f',2,4,4,2); f('#4a4752',1,6,6,1); break; case 'car': f('#e8343a',1,3,6,3); f('#8fd8ff',2,2,3,1); f(P.ink,1,6,2,1); f(P.ink,5,6,2,1); f('#ffd23f',7,4,1,1); break;
    case 'car2': f('#8f98a8',0,2,8,4); f('#ffe9a8',1,3,2,2); f('#ffe9a8',5,3,2,2); f(P.ink,1,6,2,1); f(P.ink,5,6,2,1); break; case 'snow': f('#cfe8ff',3,0,2,8); f('#cfe8ff',0,3,8,2); f('#fff',1,1,1,1); f('#fff',6,6,1,1); f('#fff',6,1,1,1); f('#fff',1,6,1,1); break;
    case 'vest': f('#c8f03a',1,1,6,6); f('#ff7a1f',1,4,6,1); f('#2a2a48',3,1,2,2); break; case 'scooter': f('#3fd06a',2,1,1,5); f('#3fd06a',2,5,5,1); f('#4a4752',1,6,2,2); f('#4a4752',6,6,2,2); break;
    case 'box': f('#c49a5c',1,2,6,5); f('#7a5232',1,4,6,1); f('#7a5232',4,2,1,5); break; case 'cup': f('#fff',2,2,4,5); f('#7a5232',2,2,4,1); f('#fff',6,3,1,2); f('#d8d4e0',2,0,1,1); f('#d8d4e0',4,1,1,1); break;
    case 'mug': f('#3d6ff0',1,2,5,5); f('#fff',2,3,3,1); f('#3d6ff0',6,3,1,2); break; case 'lift': f('#9a9aa8',1,0,6,8); f('#4a4752',2,1,4,6); f('#ffd23f',3,2,2,1); f('#ffd23f',3,5,2,1); break;
    case 'stairs': f('#c8c6d4',1,6,7,1); f('#c8c6d4',3,4,5,1); f('#c8c6d4',5,2,3,1); f('#9a98a6',1,7,7,1); break; case 'gate': f('#9a9aa8',1,1,2,6); f('#9a9aa8',5,1,2,6); f('#3fd06a',2,2,1,1); f('#e8343a',3,4,3,1); break;
    case 'kiosk': f('#e8343a',1,1,6,2); f('#fff',1,3,6,4); f('#ffd23f',2,4,4,2); break; case 'stop': f('#e8343a',1,1,6,6); f('#fff',2,3,4,2); break; case 'xfer': f('#fff',1,3,6,2); f('#fff',5,2,1,4); f('#fff',2,1,1,2); break;
    case 'note': f('#ffd23f',2,5,3,2); f('#ffd23f',4,1,1,5); f('#ffd23f',5,1,2,1); break; default: f('#fff',3,3,2,2); } }
function map4Weather(kind,x,y){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); };
  if(kind==='rain'){ f('#c8c6d4',2,2,8,4); f('#e9e6f0',3,1,5,2); f('#3d6ff0',3,8,1,2); f('#3d6ff0',6,9,1,2); f('#3d6ff0',9,8,1,2); }
  else if(kind==='snow'){ f('#c8c6d4',2,1,8,4); f('#fff',3,7,1,1); f('#fff',6,9,1,1); f('#fff',9,7,1,1); f('#fff',4,10,1,1); }
  else if(kind==='fog'){ f('#9a98a6',1,3,10,1); f('#c8c6d4',2,5,8,1); f('#9a98a6',0,7,11,1); f('#c8c6d4',3,9,7,1); }
  else { f('#ffd23f',4,3,4,6); f('#ffd23f',3,4,6,4); f('#ffe98a',5,4,2,2); f('#ff9a1f',5,0,2,2); f('#ff9a1f',5,10,2,2); f('#ff9a1f',0,5,2,2); f('#ff9a1f',10,5,2,2); } }
function map4House(x,y,t){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-1,4,14,11); f('#c49a5c',0,5,12,9); f(P.ink,-1,0,14,1); for(let i=0;i<6;i++) f('#b0573f',5-i,i,2+i*2,1); f('#b0573f',0,4,12,1);
  f('#7a5232',9,-2,2,4); f('#ffe98a',2,7,3,3); f('#7a5232',7,9,3,5); if(!map4Calm()){ for(let k=0;k<3;k++){ const p=((t*.6+k/3)%1); ctx.globalAlpha=.7*(1-p); f('#d8d4e0',Math.round(9+Math.sin(p*6+k)*2),Math.round(-4-p*12),2,2); } ctx.globalAlpha=1; } }
function map4Office(x,y,t){ const f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(P.ink,-1,-1,12,20); f('#3a3a5a',0,0,10,18); f('#5a5a7a',0,0,1,18);
  for(let r=0;r<8;r++) for(let c=0;c<3;c++){ const on=((r*3+c)*7)%5>1; f(on?'#ffe9a8':'#22223a',2+c*3,2+r*2,2,1); } if(map4Calm()||Math.floor(t*2)%2) f('#ffd23f',5,4,2,1); f('#8f98a8',3,-3,1,2); }
// аккуратный текст с тенью: регистрирует прямоугольник в раскладчике
// линии карты не пересекают подписи: отрезок (с полутолщиной) против прямоугольника (Лян–Барски)
function map4SegRect(a,b,hw,r,pad){ const e=hw+(pad||0), x0=r.x-e, y0=r.y-e, x1=r.x+r.w+e, y1=r.y+r.h+e; let t0=0,t1=1; const dx=b.x-a.x, dy=b.y-a.y;
  for(const [p,q] of [[-dx,a.x-x0],[dx,x1-a.x],[-dy,a.y-y0],[dy,y1-a.y]]){ if(p===0){ if(q<0) return false; } else { const t=q/p; if(p<0){ if(t>t1) return false; if(t>t0) t0=t; } else { if(t<t0) return false; if(t<t1) t1=t; } } } return true; }
function map4SegHit(r,pad){ for(const sg of MAP4.seg||[]) if(map4SegRect(sg.a,sg.b,sg.hw,r,pad==null?1:pad)) return true; return false; }
function map4Fit(r,used){ return map4LabelFits(r,used)&&!map4SegHit(r); }
// МЦД: октилинейная трасса (горизонталь — 45° — горизонталь внутри кольца, над/под центром — 45° — горизонталь)
const MCK4R=-13;
const MCD4P=[{yl:.5,ym:-.5,yr:-.5},{yl:-.5,ym:.5,yr:.5}];
// y выхода к краю карты — в промежутке между подписями станций этой стороны (станции крутятся вместе с веткой)
function map4Gap(g,side,f){ const bands=[]; for(let i=0;i<24;i++){ const a=map4Ang(i); if(Math.cos(a)*side>.3){ const y=map4St(g,i).y; bands.push([Math.round(y-4.5),Math.round(y-4.5)+9]); } } const want=Math.round(g.cy+f*g.ry); let best=want, bc=1e9;
  for(let y=Math.max(g.top+3,want-Math.round(g.ry*.3));y<=Math.min(g.bot-3,want+Math.round(g.ry*.3));y++){ let n=0; for(const [y0,y1] of bands) if(y+4.5>y0&&y-4.5<y1) n++; const c=n*1000+Math.abs(y-want); if(c<bc){ bc=c; best=y; } } return best; }
function map4Mcd(g,k){ const q=MCD4P[k], {L,R,cx,cy,rx,ry,top,bot}=g, Y=f=>clamp(Math.round(cy+f*ry),top+3,bot-3), yl=clamp(map4Gap(g,-1,q.yl),top+3,bot-3), ym=Y(q.ym), yr=clamp(map4Gap(g,1,q.yr),top+3,bot-3), d1=Math.abs(ym-yl), d2=Math.abs(yr-ym),
    xe=Math.round(cx-Math.max(28,Math.min(80,rx*.46))), xb1=xe-d1, xb2=Math.round(cx+rx*.62)-d2;
  return [{x:L-8,y:yl},{x:xb1,y:yl},{x:xe,y:ym},{x:xb2,y:ym},{x:xb2+d2,y:yr},{x:R+8,y:yr}]; }
function map4LabelFits(r,used){ for(const u of used) if(r.x<u.x+u.w&&r.x+r.w>u.x&&r.y<u.y+u.h&&r.y+r.h>u.y) return false; return true; }
drawMap=function(){ G.labels=[]; buttons=[]; MAP4.rects=[]; MAP4.seg=[]; MAP4.labs=[]; MAP4.labN=0; const SBTN=[], LBTN=[]; const g=map4Geo(), {L,R,T,bh,hh,BH,by,top,bot,cx,cy,rx,ry}=g, pts=tripPts(), tf=tfSet(), t=G.t, calm=map4Calm(), dt=1/60;
  mapPan+=(mapLine-mapPan)*Math.min(1,dt*9); if(Math.abs(mapLine-mapPan)<.002) mapPan=mapLine;
  const day=ensureDay(), idx=map4Idx(), plan=dayPlan(idx,day), nxt=ST_THR.findIndex((v,i)=>!(save.tbest&&save.tbest[i])&&!lvOpen(Math.floor(i/8),i%8));
  const used=[]; const reg=(kind,x,y,w,h)=>{ const r={kind,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)}; used.push(r); MAP4.rects.push(r); if(kind==='lab') MAP4.labs.push(r); return r; };
  // ватман + сетка 8 px
  ctx.fillStyle='#141428'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#1c1c38'; for(let x=0;x<W;x+=8) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=8) ctx.fillRect(0,y,W,1);
  // зарезервировать центр кольца (чипы веток, стрелки, название ветки) до раскладки иконок/подписей
  { const cw=14, gap=8, x0=Math.round(cx-(cw*3+gap*2)/2), y0=Math.round(cy-cw/2), hb=Math.max(24,Math.min(30,44*DPR/SC)), xa=Math.round(x0-gap-hb-2), xb=Math.round(x0+cw*3+gap*3-6+hb), ya=Math.min(Math.round(cy-hb/2+4),y0-2), yb=y0+cw+14;
    MAP4.blk={kind:'blk',x:xa-1,y:ya-1,w:xb-xa+2,h:yb-ya+2}; used.push(MAP4.blk); }
  // МЦД-1/МЦД-2: полосатые диаметры (хорды), стрелки-пародии у края
  const dia=[{c:'#ff9a1f',a:-.32,o:-.42,n:'→ ОДИНЦОВО-ПАРОДИЯ'},{c:'#ff4fa0',a:.28,o:.46,n:'→ НАХАБИНО-ШУТКА'}];
  dia.forEach((d,k)=>{ const pl=map4Mcd(g,k); map4Poly(pl,P.ink,5); MAP4.seg.length-=pl.length-1; map4Poly(pl,d.c,3); ctx.fillStyle=shade(d.c,.5);
    for(let j=0;j<pl.length-1;j++){ const A=pl[j], B=pl[j+1], n=Math.ceil(Math.hypot(B.x-A.x,B.y-A.y)); for(let s=0;s<n;s+=6) ctx.fillRect(Math.round(A.x+(B.x-A.x)*s/n),Math.round(A.y+(B.y-A.y)*s/n),1,1); }
    MAP4.seg[MAP4.seg.length-pl.length+1+0].hw=2.5; for(let j=MAP4.seg.length-pl.length+1;j<MAP4.seg.length;j++) MAP4.seg[j].hw=2.5; d.pl=pl; d.B=pl[pl.length-2]; });
  // МЦК: кольцо снаружи кольцевой, бело-красное, шпалы каждые 6 px, 8 пересадок 5×5
  { const ring=[]; for(let s=0;s<=96;s++) ring.push(map4Pt(g,s/96*Math.PI*2,MCK4R)); map4Poly(ring,P.ink,5); map4Poly(ring,'#e8354a',3); map4Poly(ring,'#fff',1);
    let acc=0; ctx.fillStyle='#7a1f34'; for(let i=0;i<ring.length-1;i++){ const a=ring[i], b=ring[i+1], d=Math.hypot(b.x-a.x,b.y-a.y); acc+=d; if(acc>=6){ acc=0; ctx.fillRect(a.x,a.y,1,1); } }
    for(let k=0;k<8;k++){ const p=map4Pt(g,(k+.5)/8*Math.PI*2,MCK4R); if(!map4LabelFits({x:p.x-3,y:p.y-3,w:7,h:7},[MAP4.blk])) continue; ctx.fillStyle=P.ink; ctx.fillRect(p.x-3,p.y-3,7,7); ctx.fillStyle='#fff'; ctx.fillRect(p.x-2,p.y-2,5,5); ctx.fillStyle='#e8354a'; ctx.fillRect(p.x-1,p.y-1,3,3); reg('ico',p.x-3,p.y-3,7,7); }
    { /* M6: подпись кольца — бейдж «МЦК» на самом кольце, в свободном месте (без редизайна карты) */ const cands=[.5,.25,.75,1.25,1.75,1.5].map(f=>map4Pt(g,f*Math.PI,MCK4R)); /* между значками пересадок ((k+.5)·π/4) */ const bw=Math.ceil(txtW('МЦК',7))+10, bh=11; for(const p of cands){ const r={x:p.x-bw/2,y:p.y-bh/2,w:bw,h:bh}; if(!map4LabelFits(r,[MAP4.blk,...used])) continue; ctx.fillStyle=P.ink; ctx.fillRect(r.x-1,r.y-1,bw+2,bh+2); ctx.fillStyle='#e8354a'; ctx.fillRect(r.x,r.y,bw,bh); ctx.fillStyle='#fff'; ctx.fillRect(r.x,r.y,bw,1); G.labels.push(['МЦК',p.x,p.y,7,'#fff','center',null]); reg('ico',r.x,r.y,bw,bh); break; } }
    if(!calm){ const p=map4Pt(g,(t*.05)%1*Math.PI*2,MCK4R); ctx.fillStyle=P.ink; ctx.fillRect(p.x-2,p.y-2,5,5); ctx.fillStyle='#e8354a'; ctx.fillRect(p.x-1,p.y-1,3,3); ctx.fillStyle='#fff'; ctx.fillRect(p.x,p.y-1,1,1); } }
  // кольцевая метро: 3 дуги-ветки по 8 станций
  for(let w=0;w<3;w++){ const op=lineOpen(w), arc=map4Arc(g,w*8-.5,w*8+7.5,0,40); map4Poly(arc,P.ink,6); map4Poly(arc,op?LINE_COL[w]:'#4a4a5a',4); }
  const SP=[]; for(let i=0;i<24;i++){ const w=Math.floor(i/8), o=lvOpen(w,i%8), p=map4St(g,i); SP.push({i,w,o,p});
    if(tf.has(i)){ ctx.fillStyle=P.ink; ctx.fillRect(p.x-4,p.y-4,9,9); ctx.fillStyle='#fff'; ctx.fillRect(p.x-3,p.y-3,7,7); }
    disc(ctx,p.x,p.y,3,3,'#120c18'); disc(ctx,p.x,p.y,2,2,o?'#fff':'#6a6a7a'); if(o&&save.stars[w+'.'+(i%8)]) { ctx.fillStyle=LINE_COL[w]; ctx.fillRect(p.x,p.y,1,1); }
    reg('st',p.x-4,p.y-4,9,9); }
  // затемнение всего не входящего в маршрут на 40%
  ctx.fillStyle='rgba(20,20,40,.4)'; ctx.fillRect(0,top-6,W,bot-top+12);
  // маршрут дня: ДОМ → улица-1 → вход E → дуга метро → станция idx → улица-2/БЦ → ОФИС
  const wl=Math.floor(idx/8), i8=idx%8, k=2+(day.seed>>>3)%2, E=i8-k>=0?idx-k:Math.min(wl*8+7,idx+k), segs=plan.segs, sg=id=>segs.find(s=>s.id===id);
  const pE=map4St(g,E), pI=map4St(g,idx), home=map4Out(g,E,30), off=map4Out(g,idx,30);
  const place=(st,o,w,h,dx,dy)=>{ for(const d of [30,38,46,24,54,62]) for(const sy of [0,-8,8,-16,16,-24,24]) for(const sx of [0,-12,12]){ const q=map4Out(g,st,d); q.x=clamp(q.x+sx,L+8,R-w-6); q.y=clamp(q.y+sy,top+6,bot-h+4); if(map4Fit({x:q.x+dx,y:q.y+dy,w,h},used)) return q; } return o; };
  { const h2=place(E,home,16,22,-2,-6); home.x=h2.x; home.y=h2.y; } home.x=clamp(home.x,L+8,R-20); home.y=clamp(home.y,top+6,bot-14);
  { used.push({kind:'tmp',x:home.x-2,y:home.y-6,w:16,h:22}); const o2=place(idx,off,14,24,-2,-4); off.x=o2.x; off.y=o2.y; used.pop(); } off.x=clamp(off.x,L+8,R-14); off.y=clamp(off.y,top+6,bot-18);
  const arc=map4Arc(g,E,idx,0); const route=[{x:home.x+6,y:home.y+8},pE,...arc,pI,{x:off.x+5,y:off.y+9}];
  map4Poly(arc,'rgba(255,255,255,.55)',8); map4Poly(arc,P.ink,6); map4Poly(arc,LINE_COL[wl],4);
  const s1=sg('street1'), s2=sg('street2'), bc=sg('bc'), ph=calm?0:t*6;
  map4Dots({x:home.x+6,y:home.y+8},pE,s1&&!s1.locked?'#c8c8e0':'#4a4a5a',-ph); map4Dots(pI,{x:off.x+5,y:off.y+9},(s2&&!s2.locked)||(bc&&!bc.locked)?'#c8c8e0':'#4a4a5a',-ph);
  for(const q of [pE,pI]){ disc(ctx,q.x,q.y,4,4,'#120c18'); disc(ctx,q.x,q.y,3,3,'#fff'); disc(ctx,q.x,q.y,1,1,LINE_COL[wl]); }
  // бегущие точки ДОМ→ОФИС (6 px/с)
  if(!calm){ let total=0; const seg=[]; for(let j=0;j<route.length-1;j++){ const d=Math.hypot(route[j+1].x-route[j].x,route[j+1].y-route[j].y); seg.push(d); total+=d; }
    for(let m=((t*6)%14);m<total;m+=14){ let s=m, j=0; while(j<seg.length&&s>seg[j]){ s-=seg[j]; j++; } if(j>=seg.length) break; const a=route[j], b=route[j+1], f=seg[j]?s/seg[j]:0; ctx.fillStyle='#fff8'; ctx.fillRect(Math.round(a.x+(b.x-a.x)*f),Math.round(a.y+(b.y-a.y)*f),2,2); } }
  map4House(home.x,home.y,t); reg('home',home.x-2,home.y-6,16,22); map4Office(off.x,off.y,t); reg('office',off.x-2,off.y-4,14,24);
  // замки сегментов (серые, очки по тапу)
  const lockAt=(a,b,s)=>{ if(!s||!s.locked) return; let x=0,y=0,fit=false; for(const f of [.5,.4,.6,.3,.7,.2,.8]){ for(const [ox,oy] of [[0,0],[0,-9],[0,9],[-9,0],[9,0]]){ x=Math.round(a.x+(b.x-a.x)*f)-3+ox; y=Math.round(a.y+(b.y-a.y)*f)-4+oy; if(map4LabelFits({x:x-1,y:y-1,w:9,h:9},used)){ fit=true; break; } } if(fit) break; } if(!fit) return; lock4(x,y); reg('lock',x-1,y-1,9,9); const thr=unlockThr(SEG4[s.id].unlock); LBTN.push({x:x-8,y:y-8,w:23,h:23,id:'lock_'+s.id,cb:()=>{ G.msg={s:'«'+SEG4[s.id].n.toLowerCase()+'» откроется при '+thr+' очк. (у тебя '+pts+')',t:2,col:'#ff9a8a'}; SFX.hurt(); }}); };
  lockAt({x:home.x+6,y:home.y+8},pE,s1); lockAt(pI,{x:off.x+5,y:off.y+9},s2&&s2.locked?s2:bc);
  // иконки событий: ≤3 на сегмент, иначе «+N»
  const icoRow=(list,ax,ay,dir)=>{ const n=list.length; if(!n) return; const show=list.slice(0,n>3?2:3); let hid=0; let x=clamp(Math.round(ax),L+2,R-12-11*show.length), y=clamp(Math.round(ay),top+2,bot-10); for(const k of show){ const r={x:x-1,y:y-1,w:10,h:10}; let tries=0; while(!map4Fit(r,used)&&tries<8){ y+=dir*11; if(y<top+2||y>bot-10){ dir=-dir; y=clamp(y,top+2,bot-10); } r.y=y-1; tries++; } if(!map4Fit(r,used)){ hid++; continue; } map4Icon(MAP4_EVI[k]||'x',x,y); reg('ico',x-1,y-1,10,10); x+=11; }
    const more=n-show.length+hid; if(more>0){ const s='+'+more, w=txtW(s,6)+2; if(map4Fit({x,y:y-1,w,h:10},used)){ G.labels.push([s,x+w/2,y+4,6,'#fff','center',P.ink]); reg('lab',x,y-1,w,10); } } };
  const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
  if(s1&&!s1.locked) { const m=mid(home,pE); icoRow(s1.events.map(e=>e.k),m.x+6,m.y-14,-1); }
  { const am=map4Pt(g,map4Ang((E+idx)/2),-24); icoRow(plan.events,am.x-12,am.y-4,1); }
  { const ev=[].concat(s2&&!s2.locked?s2.events.map(e=>e.k):[],bc&&!bc.locked?bc.events.map(e=>e.k):[]); const m=mid(pI,off); icoRow(ev,m.x+6,m.y+6,1); }
  // «ТЫ ТУТ»: кольцо 7/9 px у ДОМА + голова героя 10×10
  { const yx=home.x+6, yy=home.y+8, r=(calm||Math.floor(t*2)%2)?4:3; ctx.strokeStyle='#8fe03a'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(yx+.5,yy+.5,r,0,Math.PI*2); ctx.stroke();
    const por=typeof heroPortrait==='function'?heroPortrait(save.hero||'serega'):null; if(por){ let hx=home.x+15, hy=home.y-8; { const cand=[[home.x+15,home.y-8],[home.x-13,home.y-8],[home.x+1,home.y-20],[home.x+15,home.y+6],[home.x-13,home.y+6]]; for(const c of cand){ if(c[0]>=L&&c[0]+11<=R&&c[1]>=top-4&&map4Fit({x:c[0]-1,y:c[1]-1,w:12,h:12},used)){ hx=c[0]; hy=c[1]; break; } } } ctx.fillStyle=P.ink; ctx.fillRect(hx-1,hy-1,12,12); ctx.drawImage(por,7,1,10,10,hx,hy,10,10); reg('head',hx-1,hy-1,12,12); } }
  // поезд по маршруту (2.5 с, тап — пропуск)
  if(MAP4.intro>0){ MAP4.intro=Math.max(0,MAP4.intro-dt); const f=1-MAP4.intro/MAP4.introT; let total=0; const seg=[]; for(let j=0;j<route.length-1;j++){ const d=Math.hypot(route[j+1].x-route[j].x,route[j+1].y-route[j].y); seg.push(d); total+=d; }
    let s=f*total, j=0; while(j<seg.length-1&&s>seg[j]){ s-=seg[j]; j++; } const a=route[j], b=route[j+1], q=seg[j]?Math.min(1,s/seg[j]):0, x=Math.round(a.x+(b.x-a.x)*q), y=Math.round(a.y+(b.y-a.y)*q);
    ctx.fillStyle=P.ink; ctx.fillRect(x-5,y-3,10,6); ctx.fillStyle='#e8e0d0'; ctx.fillRect(x-4,y-2,8,4); ctx.fillStyle=LINE_COL[wl]; ctx.fillRect(x-4,y,8,1); ctx.fillStyle='#8fd8ff'; ctx.fillRect(x-3,y-2,2,1); ctx.fillRect(x+1,y-2,2,1); }
  // ближайшая разблокировка: пульс золотом + «ещё N очков»
  if(nxt>=0&&lineOpen(Math.floor(nxt/8))){ const p=map4St(g,nxt), a=calm?.6:.35+.35*Math.sin(t*5); ctx.globalAlpha=a; disc(ctx,p.x,p.y,6,6,'#ffd23f'); ctx.globalAlpha=1; disc(ctx,p.x,p.y,2,2,'#ffd23f'); }
  // замки станций 5×6
  for(const s of SP) if(!s.o){ const x=s.p.x-2, y=s.p.y-3; ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,7,8); ctx.fillStyle='#4a4a5a'; ctx.fillRect(x,y+2,5,4); ctx.fillStyle='#8a8aa0'; ctx.fillRect(x+1,y,3,1); ctx.fillRect(x,y+1,1,1); ctx.fillRect(x+4,y+1,1,1); ctx.fillStyle='#ffd23f'; ctx.fillRect(x+2,y+3,1,2); }
  // ---------- шапка ----------
  ctx.fillStyle='#0e0e20'; ctx.fillRect(0,0,W,T+hh+4); ctx.fillStyle='#2a2a48'; ctx.fillRect(0,T+hh+4,W,1);
  const mw=Math.max(54,bh*1.5); bigBtn('МЕНЮ',R-mw,T,mw,bh,'#4a3a5a',()=>toTitle(),'home',8); reg('hdr',R-mw-2,T-2,mw+4,bh+4);
  const wd=day.weekday, wdS=WD4[wd]; let hx=L; G.labels.push([wdS,hx,T+hh/2,10,WD4_COL[wd],'left',P.ink]); hx+=txtW(wdS,10)+6;
  map4Weather(dayWeather(day),hx,Math.round(T+hh/2-6)); hx+=16; const tyS=(DAYTYPE4[day.type]||{n:''}).n; G.labels.push([tyS,hx,T+hh/2,7,'#c8c8e0','left',P.ink]); hx+=txtW(tyS,7)+8; reg('hdr',L-2,T-2,hx-L,bh+4);
  // центр: новость дня бегущей строкой (или подсказка ближайшего открытия), обрезка по своей полосе
  { const x0=Math.round(hx+4), x1=Math.round(R-mw-10), nw=x1-x0, nu=nextUnlock4();
    const s=unl4('news')?('НОВОСТИ: '+(typeof dayNews5==='function'&&dayNews5(day)?dayNews5(day).t:NEWS4[day.news%NEWS4.length])):(nu?('Скоро откроется: '+nu.n+' — ещё '+nu.left+' очк.'):'Всё открыто!');
    if(nw>40){ ctx.fillStyle='#1a1a34'; ctx.fillRect(x0,T+3,nw,hh-6); const sw=txtW(s,7); let lx;
      if(sw<=nw-8) lx=x0+nw/2-sw/2; else { const per=sw+40; lx=x0+nw-((calm?0:t*22)%per); }
      MAP4.news={x:x0,w:nw,s,lx,sw}; reg('hdr',x0,T+3,nw,hh-6);
      if(sw<=nw-8) G.labels.push([s,x0+nw/2,T+hh/2,7,'#ffd23f','center',P.ink]); else MAP4.newsClip={x0,x1,y:T+hh/2,s,lx}; }
    // полоса прогресса до следующего открытия (под шапкой)
    if(nu){ const p0=nu.thr-(nu.thr-nu.left), f=clamp(1-nu.left/Math.max(1,nu.thr*.25),0,1); ctx.fillStyle='#2a2a48'; ctx.fillRect(0,T+hh+5,W,2); ctx.fillStyle='#ffd23f'; ctx.fillRect(0,T+hh+5,Math.round(W*f),2); } }
  // ---------- центр кольца: выбор ветки (иконки без подписей) + стрелки ◀ ▶ ----------
  { const cw=14, gap=8, x0=Math.round(cx-(cw*3+gap*2)/2), y0=Math.round(cy-cw/2); const hb=Math.max(24,Math.min(30,44*DPR/SC));
    for(let w=0;w<3;w++){ const x=x0+w*(cw+gap), on=w===mapLine, op=lineOpen(w); ctx.fillStyle=on?'#fff':P.ink; ctx.fillRect(x-2,y0-2,cw+4,cw+4); ctx.fillStyle=op?LINE_COL[w]:'#4a4a5a'; ctx.fillRect(x,y0,cw,cw);
      if(!op) lock4(x+3,y0+3); else { ctx.fillStyle='#fff'; for(let d=0;d<=w;d++) ctx.fillRect(x+3+d*3,y0+cw-4,2,2); }
      reg('chip',x-2,y0-2,cw+4,cw+4); buttons.push({x:x+cw/2-hb/2+(w-1)*0,y:y0+cw/2-hb/2,w:Math.min(hb,cw+gap-1),h:hb,id:'line'+w,cb:()=>{ mapLine=w; mapSel=-1; SFX.ui(); }}); }
    const nm=LINE_NAMES[mapLine]+' ветка', ny=y0+cw+9; G.labels.push([nm,cx,ny,7,lineOpen(mapLine)?LINE_COL[mapLine]:'#8a8aa0','center',P.ink]); const nmw=txtW(nm,7); reg('lab',cx-nmw/2-1,ny-5,nmw+2,10); MAP4.nameR={x:cx-nmw/2-1,y:ny-5,w:nmw+2,h:10};
    const ah=hb, ax0=x0-gap-ah, ax1=x0+cw*3+gap*3; const arrow=(x,dirR,id,cb)=>{ const yy=Math.round(cy-ah/2); ctx.fillStyle=P.ink; ctx.fillRect(x,yy+4,ah,ah-8); ctx.fillStyle='#2e2e50'; ctx.fillRect(x+1,yy+5,ah-2,ah-10); ctx.fillStyle='#fff'; const mx=Math.round(x+ah/2), my=Math.round(cy);
      for(let r=0;r<5;r++){ const hgt=r*2+1; ctx.fillRect(dirR?mx-2+(4-r):mx-2+r,my-r,1,hgt); } reg('chip',x,yy+4,ah,ah-8); buttons.push({x,y:yy,w:ah,h:ah,id,cb}); };
    arrow(Math.round(ax0-2),false,'prev',()=>{ mapLine=(mapLine+2)%3; mapSel=-1; SFX.ui(); }); arrow(Math.round(ax1-6),true,'next',()=>{ mapLine=(mapLine+1)%3; mapSel=-1; SFX.ui(); }); }
  // ---------- нижняя панель: карточка станции, герой, ПОЕХАЛИ ----------
  { const py=by, lc=LINE_COL[Math.floor(idx/8)], s=LEVELS[idx], st=save.stars[Math.floor(idx/8)+'.'+(idx%8)]||0; ctx.fillStyle=P.ink; ctx.fillRect(L,py-2,R-L,BH+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(L+2,py,R-L-4,BH); ctx.fillStyle=lc; ctx.fillRect(L+2,py,5,BH); reg('bar',L,py-2,R-L,BH+4);
    const gw=Math.min(150,Math.max(110,(R-L)*.3)), gx=R-gw-6, gh=BH-8, res=segResumable(); bigBtn(res?'ПРОДОЛЖИТЬ ▶':'ПОЕХАЛИ ▶',gx,py+4,gw,gh,'#2aa860',()=>map4Go(),'go',10);
    const hs=BH-8, hx2=gx-hs-10, por=typeof heroPortrait==='function'?heroPortrait(save.hero||'serega'):null; ctx.fillStyle=P.ink; ctx.fillRect(hx2-2,py+2,hs+4,hs+4); ctx.fillStyle='#d8ccb4'; ctx.fillRect(hx2,py+4,hs,hs);
    if(por){ const sc=Math.max(1,Math.floor(hs/24)); ctx.drawImage(por,Math.round(hx2+hs/2-12*sc),Math.round(py+4+hs-24*sc),24*sc,24*sc); } ctx.fillStyle='#ffd23f'; ctx.fillRect(hx2+hs-6,py+5,5,5); ctx.fillStyle=P.ink; ctx.fillRect(hx2+hs-4,py+6,1,3); ctx.fillRect(hx2+hs-5,py+7,3,1);
    buttons.push({x:hx2-2,y:py+2,w:hs+4,h:hs+4,id:'heroes',cb:()=>{ SFX.ui(); openHeroes(); }});
    const tx=L+14, tw=hx2-tx-10; const nm=wrapW(s.name,tw,10)[0]; G.labels.push([nm,tx,py+BH*.3,10,'#1a1020','left',null]);
    for(let q=0;q<3;q++) starPx(tx+4+q*10,Math.round(py+BH*.72),q<st);
    const mm=Math.floor(plan.total/60), ss=String(Math.round(plan.total%60)).padStart(2,'0'), info='≈ '+mm+':'+ss+' · '+(plan.target?'цель '+plan.target:'')+(save.tbest&&save.tbest[idx]?' · рекорд '+save.tbest[idx]:'');
    const iw=tw-36; if(iw>40) G.labels.push([wrapW(info,iw,7)[0],tx+34,Math.round(py+BH*.72),7,'#5a4a6a','left',null]); }
  // ---------- подписи станций: автораскладчик (4 позиции; иначе скрыть, показ по тапу) ----------
  { const small=H<190, pri=[idx,E,...SP.filter(s=>s.w===mapLine).map(s=>s.i),...[...tf],...SP.map(s=>s.i)], seen=new Set();
    for(const i of pri){ if(seen.has(i)) continue; seen.add(i); const s=SP[i]; if(small&&!(i===idx||i===E||tf.has(i)||(mapSel>=0&&i===mapLine*8+mapSel))) continue;
      const name=LEVELS[i].name, fs=7, w=txtW(name,fs)+2, h=9, a=map4Ang(i), ox=Math.cos(a), oy=Math.sin(a), p=s.p;
      const cand=[]; for(const D of [7,10,13,23]) cand.push({x:ox>=0?p.x+D:p.x-D-w,y:p.y-h/2},{x:p.x-w/2,y:oy>=0?p.y+D:p.y-D-h},{x:ox>=0?p.x+D-4:p.x-D-w+4,y:oy>=0?p.y+D-4:p.y-D-h+4}); for(const D of [7,14,17]) cand.push({x:p.x-w/2,y:oy>=0?p.y-D-h:p.y+D},{x:ox>=0?p.x-w+4:p.x-4,y:oy>=0?p.y-D-h:p.y+D},{x:ox>=0?p.x-w-D:p.x+D,y:p.y-h/2}); cand.push({x:ox>=0?p.x-7-w:p.x+7,y:p.y-h/2},{x:ox>=0?p.x-7-w:p.x+7,y:oy>=0?p.y-7-h:p.y+5},{x:ox>=0?p.x-7-w:p.x+7,y:oy>=0?p.y+5:p.y-7-h}); if(i===idx||i===E) cand.push({x:p.x+5,y:p.y-6-h},{x:p.x-5-w,y:p.y-6-h},{x:p.x+5,y:p.y+6},{x:p.x-5-w,y:p.y+6});
      for(const c of cand){ const r={x:Math.round(c.x),y:Math.round(c.y),w:Math.round(w),h}; if(r.x<L||r.x+r.w>R||r.y<top-4||r.y+r.h>bot+4) continue; if(!map4Fit(r,used)) continue;
        reg('lab',r.x,r.y,r.w,r.h); MAP4.labN++; const col=!s.o?'#8a8aa0':i===idx?'#ffd23f':s.w===mapLine?'#fff':'#b8b8d0'; G.labels.push([name,r.x+1,r.y+h/2,fs,col,'left','#000']); break; } } }
  // «ещё N очков» над ближайшей разблокировкой
  if(nxt>=0&&lineOpen(Math.floor(nxt/8))){ const p=map4St(g,nxt), s='ещё '+Math.max(0,ST_THR[nxt]-pts)+' очк.', w=txtW(s,6)+2, r={x:Math.round(p.x-w/2),y:p.y-17,w:Math.round(w),h:9}; if(!map4Fit(r,used)) r.y=p.y+8; if(map4Fit(r,used)){ reg('lab',r.x,r.y,r.w,r.h); G.labels.push([s,p.x,r.y+5,6,'#ffd23f','center',P.ink]); } }
  // кнопки станций текущей ветки (st0–7): открытая — выбрать; закрытая — очки
  { const PS=[]; for(let i=0;i<8;i++) PS.push(map4St(g,mapLine*8+i));
    for(let i=0;i<8;i++){ const ii=mapLine*8+i, p=PS[i], o=lvOpen(mapLine,i); let bw=30, bhh=30; for(const j of [i-1,i+1]){ if(j<0||j>7) continue; const q=PS[j], dx=Math.abs(q.x-p.x), dy=Math.abs(q.y-p.y); if(dy>=dx) bhh=Math.min(bhh,dy-1); else bw=Math.min(bw,dx-1); }
      const sb={x:p.x-bw/2,y:p.y-bhh/2,w:bw,h:bhh}; SBTN.push(sb); buttons.push({x:sb.x,y:sb.y,w:bw,h:bhh,id:'st'+i,cb:()=>{ if(o){ mapSel=i; SFX.ui(); } else { G.msg={s:lineOpen(mapLine)?'Откроется при '+ST_THR[ii]+' очк. (у тебя '+pts+')':'Сначала пройди предыдущую ветку (очк.: '+pts+')',t:1.8,col:P.red}; SFX.hurt(); } }}); } }
  for(const lb of LBTN){ let r=lb; if(SBTN.some(q=>map4LabelFits(r,[q])===false)){ r=Object.assign({},lb,{x:lb.x+4,y:lb.y+4,w:15,h:15}); if(SBTN.some(q=>map4LabelFits(r,[q])===false)) continue; } buttons.push(r); }
  // голубь раз в 20 с; облака/снег при погоде
  if(!calm){ const pg=MAP4.pig; pg.t-=dt; if(pg.t<=0&&pg.x<0){ pg.x=0.001; pg.y=top+10+Math.random()*(bot-top-20); } if(pg.x>0){ pg.x+=dt*60; const x=Math.round(pg.x), y=Math.round(pg.y+Math.sin(pg.x*.1)*3), fl=Math.floor(t*8)%2; ctx.fillStyle=P.ink; ctx.fillRect(x-4,y-2,9,4); ctx.fillStyle='#9a9aa8'; ctx.fillRect(x-3,y-1,7,2); ctx.fillRect(x-2,fl?y-4:y+1,4,2); ctx.fillStyle='#6a6a7a'; ctx.fillRect(x+3,y-2,2,2); ctx.fillStyle='#ff8a1f'; ctx.fillRect(x+5,y-1,1,1); if(pg.x>W+10){ pg.x=-20; pg.t=20; } }
    const wt=dayWeather(day); if(wt==='rain'||wt==='snow'){ MAP4.parts=MAP4.parts.length===30?MAP4.parts:Array.from({length:30},()=>({x:Math.random()*W,y:top+Math.random()*(bot-top),v:.5+Math.random()}));
      for(const q of MAP4.parts){ q.y+=dt*(wt==='rain'?120:22)*q.v; q.x+=dt*(wt==='rain'?-20:Math.sin(t+q.v*5)*8); if(q.y>bot){ q.y=top; q.x=Math.random()*W; } ctx.fillStyle=wt==='rain'?'#6f9fe0':'#fff'; ctx.fillRect(Math.round(q.x),Math.round(q.y),1,wt==='rain'?3:1); } } }
  // МЦД — подписи-стрелки у правого края (через раскладчик)
  for(const d of dia){ const w=Math.round(txtW(d.n,6)+2), yr=d.B.y; let ok=null; for(const dx of [0,20,40,60,80]) for(const y of [yr-13,yr+5]){ const r={x:Math.round(R-w-2-dx),y,w,h:9}; if(!ok&&r.y>=top-4&&r.y+9<=bot+4&&map4Fit(r,used)) ok=r; } if(ok){ reg('lab',ok.x,ok.y,ok.w,ok.h); G.labels.push([d.n,ok.x+1,ok.y+4,6,d.c,'left','#000']); } }
  if(G.msg){ G.msg.t-=dt; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,by-10,8,G.msg.col,'center',P.ink]); }
};
// новость бегущей строкой: рисуем на текстовом слое с обрезкой своей полосой (после основного рендера)
{ const _r=render; render=function(){ MAP4.newsClip=null; _r.apply(this,arguments); const n=MAP4.newsClip; if(G.scene==='map'&&n&&!(typeof HS!=='undefined'&&HS.open)&&typeof tctx!=='undefined'){ tctx.save(); tctx.beginPath(); tctx.rect(n.x0*SC,(n.y-8)*SC,(n.x1-n.x0)*SC,16*SC); tctx.clip(); txt(n.s,n.lx,n.y,7,'#ffd23f','left',P.ink); tctx.restore(); } }; }
// вход на карту: поезд по маршруту дня 2.5 с; любой тап — пропуск
{ const _tm=toMap; toMap=function(){ const r=_tm.apply(this,arguments); MAP4.intro=map4Calm()?0:MAP4.introT; const d=map4Def(); if(mapSel<0){ mapLine=Math.floor(d/8); mapPan=mapLine; } return r; }; }
addEventListener('pointerdown',()=>{ if(G.scene==='map') MAP4.intro=0; },true);
