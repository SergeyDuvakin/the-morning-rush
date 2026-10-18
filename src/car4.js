// car4.js — M1-18: вагон метро v4 (одобренный лист M0-9 §P1) в игре.
// Интерьер: модули 100 px (диван на 3 + дверь / диван на 3 + простенок) из атласа gtr (те же функции, что лист), сиденья перекрашены в цвет ветки;
// процедурно: петли с запаздыванием качки 0.15 с, пролёт ламп в окнах, тоннель/станция над крышей, линия-карта с мигающей точкой, рифлёный пол с жёлтыми полосами у дверей,
// подсветки doorHintLead / seatHintLead, пульс свободного места #b6ff3f. Экстерьер (перрон/пересадка): вагоны metro_ext + двери metro_door_0..3 по состоянию.
// Качка слоя — как в v3 (layX ≤ 1 px). Всё тяжёлое (перекраска, корпус поезда) кэшируется в offscreen-канвасах.
const CAR4={mods:{},ext:{},spd:0,tun:0,doorK:0,lt:0,perf:0};
function car4Ready(){ return typeof atlOk==='function'&&atlOk('gtr')&&atlOk('tr'); }
function c4rgb(h){ const n=parseInt(h.slice(1,7),16); return [n>>16,n>>8&255,n&255]; }
function c4recolor(c,w,h,li){ if(!li) return; const src=ATL4P.ln.ln0.map(c4rgb), dst=ATL4P.ln['ln'+li].map(c4rgb); const d=c.getImageData(0,0,w,h), p=d.data;
  for(let i=0;i<p.length;i+=4){ if(!p[i+3]) continue; for(let k=0;k<4;k++){ const s=src[k]; if(p[i]===s[0]&&p[i+1]===s[1]&&p[i+2]===s[2]){ const t=dst[k]; p[i]=t[0]; p[i+1]=t[1]; p[i+2]=t[2]; break; } } } c.putImageData(d,0,0); }
// после getImageData канвас уходит в CPU — копируем в свежий (GPU), иначе каждый кадр — заливка текстуры (~9 мс)
function c4fresh(cv){ const [n,c]=c4canvas(cv.width,cv.height); c.drawImage(cv,0,0); return n; }
function c4canvas(w,h){ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const c=cv.getContext('2d'); c.imageSmoothingEnabled=false; return [cv,c]; }
function car4Mods(li){ if(CAR4.mods[li]) return CAR4.mods[li]; const a=ATL4.gtr, m={};
  for(const n of ['mi_door_t','mi_door_s','mi_wall_t','mi_wall_s']){ const r=a.f[n]; const [cv,c]=c4canvas(r[2],r[3]); c.drawImage(a.img,r[0],r[1],r[2],r[3],0,0,r[2],r[3]); c4recolor(c,r[2],r[3],li); m[n]=li?c4fresh(cv):cv; }
  return CAR4.mods[li]=m; }
const C4=()=>ATL4P.c;
// ближайшее «событие двери» (остановка или прибытие) — для doorHintLead и торможения
function car4Next(z){ const sa=z.stopAt||[], ts=[]; if(z.si<sa.length) ts.push(sa[z.si]); if(z.ride!=null) ts.push(z.ride); return ts.length?Math.min(...ts)-(z.T||0):99; }
function car4DoorHint(z){ if(z.arrive||z.stopT>0) return false; const n=car4Next(z); return n>0&&n<=heroStats().doorHintLead; }
function car4Tick(z){ const now=z.t, dt=Math.min(.05,Math.max(0,now-(CAR4.lt||now))); CAR4.lt=now; const stop=z.stopT>0||z.arrive;
  const n=car4Next(z), tgt=stop?0:260*clamp(n/1.4,0,1); CAR4.spd+=(tgt-CAR4.spd)*Math.min(1,dt*(tgt>CAR4.spd?1.6:4)); CAR4.tun+=CAR4.spd*dt; CAR4.tt=(CAR4.tt||0)+dt*CAR4.spd/260;
  CAR4.doorK=clamp(CAR4.doorK+(stop?1:-1)*dt/.3,0,1); return dt; }
// вертикаль: верх модуля MT — так, чтобы сиденье (ряд 53) было на уровне v3 (FY0-13), сидящие садятся как раньше
function car4Ceil(MT){ const k='ceil'+MT; if(CAR4[k]) return CAR4[k]; const P4=C4(), [cv,c]=c4canvas(8,MT); const g=c.createLinearGradient(0,0,0,MT); g.addColorStop(0,shade(P4.tile,-.28)); g.addColorStop(1,P4['tile.hi']); c.fillStyle=g; c.fillRect(0,0,8,MT);
  c.fillStyle=P4['tile.sh']; for(let d=3,y=MT-3;y>0;d=Math.round(d*1.45)+1,y-=d) c.fillRect(0,y,8,1); return CAR4[k]=cv; }
function car4Led(){ if(CAR4.led) return CAR4.led; const P4=C4(), [cv,c]=c4canvas(160,5); c.fillStyle=P4.lamp; for(let q=0;q<160;q+=2){ const qq=q%96; if(qq>70||(qq%12)>=10) continue; const m=(qq*7+((qq/6)|0)*13)%11; for(let y=0;y<5;y++) if((m>>(y%4))&1) c.fillRect(q,y,1,1); } return CAR4.led=cv; }
function car4Loops(){ if(CAR4.loops) return CAR4.loops; const P4=C4(), [cv,c]=c4canvas(35,13); for(let i=0;i<5;i++){ const sw=i-2, x=i*7+3; c.fillStyle=P4.charc; c.fillRect(x,0,1,4); c.fillRect(x+Math.sign(sw),4,1,3); c.fillStyle=P.ink; c.fillRect(x-2+sw,7,5,4); c.fillStyle=P4.grey; c.fillRect(x-1+sw,7,3,3); c.fillStyle=P4['tile.hi']; c.fillRect(x+sw,8,1,1); c.fillStyle=P4['grey.hi']; c.fillRect(x-1+sw,7,3,1); } return CAR4.loops=cv; }
// торцевая межвагонная дверь с окном (вид в соседний вагон: 2 тона, силуэты)
function car4EndDoor(x,MT){ const P4=C4(); ctx.fillStyle=P.ink; ctx.fillRect(x-1,MT+17,16,42); ctx.fillStyle=P4.curb; ctx.fillRect(x,MT+18,14,40); ctx.fillStyle=P4['curb.sh']; ctx.fillRect(x+12,MT+18,2,40);
  ctx.fillStyle=P.ink; ctx.fillRect(x+2,MT+22,10,14); ctx.fillStyle=shade(P4.tile,-.3); ctx.fillRect(x+3,MT+23,8,12); ctx.fillStyle=shade(P4.tile,-.5); ctx.fillRect(x+4,MT+29,2,6); ctx.fillRect(x+3,MT+31,4,4); ctx.fillRect(x+8,MT+30,2,5); ctx.fillStyle='#fffaf0'; ctx.fillRect(x+3,MT+23,1,1); ctx.fillRect(x+4,MT+24,1,1); ctx.fillStyle=P4.charc; ctx.fillRect(x+10,MT+38,2,4); }
function car4MT(){ return FY0-66; }
function car4Draw(z){ const t0=performance.now(); car4Tick(z); const lc=LINE_COL[TR.line%10], li=TR.line%10, c=G.cam, MT=car4MT(), P4=C4(), M=car4Mods(li), stop=z.stopT>0||z.arrive, stn=CAR4.spd<40, off=0;
  // фон за слоем качки (чтобы края не мигали)
  ctx.fillStyle=shade(P4.tile,-.2); ctx.fillRect(-4,0,W+8,MT); ctx.fillStyle=P4.floor; ctx.fillRect(-4,MT,W+8,H-MT);
  ctx.save(); ctx.translate(z.layX||0,0);
  // потолок салона в перспективе (зеркально полу): светлый свод, продольные полосы светильников, верхний поручень; в окнах — тоннель/станция
  { ctx.drawImage(car4Ceil(MT),-2,0,W+4,MT);
    const strip=(y,h,f,seg,gap)=>{ const per=seg+gap, o=Math.round(c*f)%per; for(let x=-o-per;x<W+per;x+=per){ ctx.fillStyle=P4['tile.sh']; ctx.fillRect(x-1,y-1,seg+2,h+2); ctx.fillStyle=P4['lamp.hi']||P4.lamp; ctx.fillRect(x,y,seg,h); ctx.fillStyle=P4.lamp; ctx.fillRect(x,y+h-1,seg,1); } };
    strip(Math.round(MT*.62),3,.96,44,12); strip(Math.round(MT*.18),5,1.12,52,16);
    const vy=Math.round(MT*.4); for(let x=-(Math.round(c)%100)-100;x<W+100;x+=100){ ctx.fillStyle=P4['tile.sh']; ctx.fillRect(x+30,vy,22,4); ctx.fillStyle=shade(P4.tile,-.12); for(let k=0;k<22;k+=3) ctx.fillRect(x+30+k,vy+1,2,2); }
    // табло над дверями: бегущая строка (янтарные точки) — следующая станция
    for(const dx of z.doorsX){ const sx=Math.round(dx-c)+1-32, ty=MT-34; if(sx>W+4||sx<-70) continue; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,ty-1,66,11); ctx.fillStyle='#231a14'; ctx.fillRect(sx,ty,64,9);
      const L=car4Led(), o=Math.floor(G.t*14)%96; ctx.drawImage(L,o,0,62,5,sx+1,ty+2,62,5);
      ctx.fillStyle=shade(P4.lamp,-.5); ctx.fillRect(sx,ty+8,64,1); }
    // верхний поручень с петлями (качка с запаздыванием 0.15 с)
    const ry=MT-17, lag=clamp(Math.round(Math.sin((z.t-.15)*Math.PI*2*.8))-(z.layX||0)+(z.brakeT>0?Math.round(Math.sin(z.brakeT*14)*1.6):0),-1,1);
    ctx.fillStyle=P.ink; ctx.fillRect(-2,ry-1,W+4,4); ctx.fillStyle=P4.chrome; ctx.fillRect(-2,ry,W+4,2); ctx.fillStyle=P4['chrome.hi']; ctx.fillRect(-2,ry,W+4,1);
    const LP=car4Loops(); for(let x=-(Math.round(c)%16)-16;x<W+16;x+=16){ const sw=clamp(lag*(1+((x+Math.round(c))>>4&1)),-2,2); ctx.drawImage(LP,(sw+2)*7,0,7,13,x-3,ry+2,7,13); } }
  // торцевые стенки до первого/после последнего модуля
  { const B0=z.bx0||24, a=Math.round(B0-c)-1, b=Math.round(z.len-24-c)+(B0+Math.ceil((z.len-24-B0)/100)*100-(z.len-24)); ctx.fillStyle=P4.tile; if(a>-2) ctx.fillRect(-2,MT,a+2,59); ctx.fillStyle=P4.charc; if(a>-2) ctx.fillRect(a-2,MT,2,59); if(a>14) car4EndDoor(a-18,MT); }
  // модули
  const fk=Math.floor(G.t*4)%2;
  for(let bx=(z.bx0||24);bx<z.len-24;bx+=100){ const sx=Math.round(bx-c)-1; if(sx>W+2||sx<-102) continue; const door=z.doorsX.includes(bx+83), img=M[(door?'mi_door_':'mi_wall_')+(stn?'s':'t')];
    if(bx+66<z.len-(z.bx0?60:24)) ctx.drawImage(img,sx,MT);
    else { ctx.drawImage(img,0,0,100,41,sx,MT,100,41); ctx.drawImage(img,0,41,1,18,sx,MT+41,100,18); ctx.fillStyle=P4.tile; ctx.fillRect(sx,MT+41,door?69:100,17); ctx.fillStyle=P4.charc; ctx.fillRect(sx,MT+58,100,1); if(door) ctx.drawImage(img,69,41,31,18,sx+69,MT+41,31,18); }
    // пролёт ламп тоннеля в окнах
    if(!stn){ for(const wx of (door?[7,41]:[7,41,75])){ const ph=(CAR4.tt+((bx*7+wx*13)%97)/97)%1.0, lx=Math.round(ph/.25*17); if(ph<.25){ ctx.fillStyle=P4['lamp.ln']; ctx.fillRect(sx+wx+lx,MT+28,1,3); ctx.fillStyle=P4.lamp; ctx.fillRect(sx+wx+lx+1,MT+28,1,3); } } }
    // линия-карта: мигающая точка текущего перегона
    if(door){ const pr=clamp(Math.floor((z.T/Math.max(1,z.ride))*6),0,5); if(fk||stop){ ctx.fillStyle=P4.red; ctx.fillRect(sx+73+pr*4,MT+12,1,3); }
      if((car4DoorHint(z)||z.arrive)&&fk){ ctx.fillStyle=P.ink; ctx.fillRect(sx+92,MT+11,4,5); ctx.fillStyle=P.edge; ctx.fillRect(sx+92,MT+12,1,3); ctx.fillRect(sx+93,MT+13,1,1); ctx.fillRect(sx+93,MT+12,1,3); ctx.fillRect(sx+94,MT+13,1,1); } }
    // петли — качаются с запаздыванием 0.15 с относительно слоя (± 1 px) + рывок при торможении
    const lag=Math.round(Math.sin((z.t-.15)*Math.PI*2*.8))-(z.layX||0)+(z.brakeT>0?Math.round(Math.sin(z.brakeT*14)*1.4):0);
    for(let lx=6;lx<(door?68:98);lx+=12){ const x=sx+lx, sw=clamp(lag,-1,1); ctx.fillStyle=P4.charc; ctx.fillRect(x,MT+21,1,2); ctx.fillRect(x+sw,MT+23,1,1); ctx.fillStyle=P4.grey; ctx.fillRect(x-1+sw,MT+24,1,1); ctx.fillRect(x+1+sw,MT+24,1,1); ctx.fillStyle=P4['grey.hi']; ctx.fillRect(x-1+sw,MT+25,3,1); }
  }
  // двери изнутри: 4 кадра по состоянию + подсветка doorHintLead
  const hint=car4DoorHint(z), df=Math.min(3,Math.round(CAR4.doorK*3));
  for(const dx of z.doorsX){ const sx=Math.round(dx-c)+1-13; if(sx>W+30||sx<-30) continue; atlDraw(ctx,'tr','metro_door_'+df,sx,MT+18); if(df===0){ ctx.fillStyle='#fff'; ctx.fillRect(sx+4,MT+39,6,3); ctx.fillRect(sx+16,MT+39,6,3); ctx.fillStyle=P.red; ctx.fillRect(sx+5,MT+40,1,1); ctx.fillRect(sx+17,MT+40,1,1); ctx.fillStyle=P4.charc; ctx.fillRect(sx+7,MT+40,2,1); ctx.fillRect(sx+19,MT+40,2,1); }
    if(hint||z.arrive){ ctx.fillStyle=(fk?P.edge:'#fff3a0'); ctx.fillRect(sx-1,MT+17,28,1); ctx.fillRect(sx-1,MT+60,28,1); ctx.fillRect(sx-1,MT+17,1,44); ctx.fillRect(sx+26,MT+17,1,44); }
    if(z.arrive) goalArrow(dx,MT+8,P.neonLime); }
  if(z.gangway){ const sx=Math.round(z.len-14-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,MT+5,18,55); ctx.fillStyle='#4a3a5a'; ctx.fillRect(sx-3,MT+6,16,53); ctx.fillStyle='#6a5a7a'; for(let y=MT+8;y<MT+58;y+=4) ctx.fillRect(sx-3,y,16,1); G.labels.push(['ТАМБУР',sx+4,MT-2,6,'#c9f']); }
  // свободные места: пульс #b6ff3f; seatHintLead (Костя): места, которые вот-вот освободятся
  for(const s of z.slots){ const sx=Math.round(s.x-c)-10; if(sx>W+20||sx<-30) continue;
    if(!s.occ){ const a=.3+.3*(.5+.5*Math.sin(G.t*Math.PI*2/1.2)); ctx.fillStyle=P.ink; ctx.fillRect(sx-1,MT+42,22,17); ctx.globalAlpha=a; ctx.fillStyle=P.neonLime; ctx.fillRect(sx,MT+43,20,15); ctx.globalAlpha=1; ctx.fillStyle=P.neonLime; ctx.fillRect(sx,MT+43,20,1); ctx.fillRect(sx,MT+57,20,1);
      G.labels.push(['МЕСТО',s.x-c,FY0-36,8,P.neonLime]); goalArrow(s.x,FY0-44,P.neonLime); }
    else if(z.pre&&z.pre.includes(s)){ ctx.fillStyle=fk?P.edge:'#ffe98a'; ctx.fillRect(sx-1,MT+42,22,1); ctx.fillRect(sx-1,MT+58,22,1); ctx.fillRect(sx-1,MT+42,1,17); ctx.fillRect(sx+20,MT+42,1,17); G.labels.push(['СКОРО',s.x-c,FY0-36,7,P.edge]); } }
  // пол: рифлёный, тень под диванами, жёлтые полосы у дверей
  const FT=MT+59; ctx.fillStyle=P4.floor; ctx.fillRect(-2,FT,W+4,H-FT); ctx.fillStyle=P4['floor.sh']; for(let y=FT+2;y<H;y+=4) ctx.fillRect(-2,y,W+4,1);
  ctx.fillStyle='rgba(10,6,20,.28)'; ctx.fillRect(-2,FT,W+4,4);
  for(const dx of z.doorsX){ const sx=Math.round(dx-c)+1; ctx.fillStyle=(hint||z.arrive)&&fk?'#fff3a0':P4.edge; ctx.fillRect(sx-12,FT,24,2); ctx.fillStyle=P4['edge.sh']; ctx.fillRect(sx-12,FT+2,24,1); }
  floorAO();
  // стойки (геймплей v3: у каждой двери/простенка), подсветка «ПОРУЧЕНЬ»
  for(const p of z.poles){ const sx=Math.round(p-c), hi=!G.hero.seat&&G.hero.hold==null&&Math.abs(p-G.hero.x)<60; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,0,4,FY1); ctx.fillStyle=hi?(fk?'#9cf':'#fff'):P4.chrome; ctx.fillRect(sx,0,2,FY1); ctx.fillStyle=P4['chrome.hi']; ctx.fillRect(sx,0,1,FY1); if(hi){ let ly=Math.max(MT+4,Math.round(G.hero.y-G.hero.z)-64); const lw=txtW('ПОРУЧЕНЬ',6); for(let k=0;k<4;k++){ const hit=G.labels.some(l=>Math.abs(l[2]-ly)<10&&Math.abs(l[1]-sx)<(lw+txtW(l[0],l[3]))/2+3); if(!hit) break; ly-=10; } G.labels.push(['ПОРУЧЕНЬ',sx,ly,6,'#9cf','center',P.ink]); } }
  const tA=performance.now(); drawTripActors([G.hero,...z.npcs]); const tB=performance.now(); ctx.restore();
  if(z.terminal&&G.hero.seat&&z.sleep>.2){ ctx.fillStyle='rgba(10,6,30,'+(z.sleep*.6)+')'; ctx.fillRect(0,0,W,H); G.labels.push(['Z z z',Math.round(G.hero.x-c)+14,G.hero.y-60,8,'#9cf']); }
  if(z.swT<1.6&&!z.arrive){ const bl=Math.floor(G.t*6)%2, cx=Math.round(W/2), cy=58; ctx.fillStyle=P.ink; ctx.beginPath(); ctx.moveTo(cx,cy-16); ctx.lineTo(cx+18,cy+14); ctx.lineTo(cx-18,cy+14); ctx.fill(); ctx.fillStyle=bl?'#ffd23f':'#ff8a1f'; ctx.beginPath(); ctx.moveTo(cx,cy-12); ctx.lineTo(cx+14,cy+12); ctx.lineTo(cx-14,cy+12); ctx.fill(); G.labels.push(['!',cx,cy+3,12,P.ink,'center',null]); G.labels.push([(z.warnS||'ТОРМОЖЕНИЕ')+' — ДЕРЖИСЬ',cx,cy+26,9,'#ffd23f']); }
  CAR4.perf=CAR4.perf*.9+(performance.now()-t0-(tB-tA))*.1; CAR4.perfA=tB-tA; }
{ const C=ZONES.car, d0=C.draw, i0=C.init; C.draw=function(z){ if(!car4Ready()) return d0.call(this,z); if(z.t==null) z=Object.assign({t:G.t,T:0,ride:99,stopAt:[],si:0,layX:0,brakeT:0},z); car4Draw(z); }; // зона «переход» рисует вагон фрагментом без полей зоны
  C.init=function(z){ CAR4.spd=0; CAR4.doorK=1; CAR4.lt=0; return i0.apply(this,arguments); }; }
// ===== экстерьер: поезд у перрона / на пересадке =====
// x0 — экранный левый край, len — длина, top — верх спрайта, li — ветка, doors — [{sx,open,hi,full}] (sx — экранный центр двери)
function car4ExtBody(len,li,offs){ const key=len+'|'+li+'|'+offs.join(','); if(CAR4.ext[key]) return CAR4.ext[key]; const A=ATL4.tr, r=A.f.metro_ext, [cv,c]=c4canvas(len+2,r[3]);
  for(let x=0;x<len;x+=r[2]-2){ const w=Math.min(r[2],len+2-x); c.drawImage(A.img,r[0],r[1],w,r[3],x,0,w,r[3]); }
  // запечённые двери листа → простенок с окном; игровые двери — по позициям зоны
  const col=(x0,w)=>{ for(let x=x0;x<x0+w;x++) c.drawImage(A.img,r[0]+66,r[1]+5,1,43,x,5,1,43); };
  const P=r[2]-2, hitD=(x0,x1)=>offs.some(o=>x1>o-15&&x0<o+15);
  for(let x=0;x<len;x+=P){ const e=Math.min(len-3,x+P-4); if(e>x+5) col(x+5,e-(x+5));
    for(let wx=x+10;wx+16<=Math.min(len-4,x+P-6);wx+=20){ if(hitD(wx-1,wx+16)) continue; c.drawImage(A.img,r[0]+70,r[1]+10,16,13,wx,10,16,13); }
    if(x+86<len&&!hitD(x+60,x+90)) c.drawImage(A.img,r[0]+66,r[1]+29,22,8,x+66,29,22,8); }
  c.fillStyle=P.ink; c.fillRect(0,0,1,r[3]-8); c.fillRect(len+1,0,1,r[3]-8);
  c4recolor(c,len+2,r[3],li); return CAR4.ext[key]=li?c4fresh(cv):cv; }
function trainExt4(x0,len,top,li,doors){ if(!car4Ready()) return false; const t0=performance.now(); x0=Math.round(x0); len=Math.round(len); if(x0>W+4||x0+len<-4) return true;
  ctx.drawImage(car4ExtBody(len,li,doors.map(d=>Math.round(d.sx-x0))),x0-1,top);
  const fk=Math.floor(G.t*4)%2;
  for(const d of doors){ const sx=Math.round(d.sx)-13, f=Math.min(3,Math.round(clamp(d.open,0,1)*3)); atlDraw(ctx,'tr','metro_door_'+f,sx,top+8);
    if(d.hi){ ctx.fillStyle=fk?P.edge:'#fff3a0'; ctx.fillRect(sx-1,top+7,28,1); ctx.fillRect(sx-1,top+50,28,1); ctx.fillRect(sx-1,top+7,1,44); ctx.fillRect(sx+26,top+7,1,44); }
    if(d.full) G.labels.push(['ПОЛНАЯ',d.sx,top+2,6,P.red]); }
  CAR4.perf=CAR4.perf*.9+(performance.now()-t0)*.1; return true; }

// прогрев кэшей (перекраска модулей под 10 веток, LED, петли) сразу после загрузки атласа — без рывка в первом кадре вагона
(function warm(){ if(!car4Ready()) return setTimeout(warm,120); try{ for(let li=0;li<10;li++) car4Mods(li); car4Led(); car4Loops(); }catch(e){} })();

