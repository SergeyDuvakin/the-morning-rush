'use strict';
// ================= ОТРИСОВКА ПОЕЗДКИ: фоны зон, актёры, HUD, кнопки =================
const HBC=new Map();
function hallBG(z,o={}){ const cam=G.cam, lc=LINE_COL[TR.line%10]; const wallB=FY0-4; const px=Math.floor(cam*.6);
  const wall=o.wall||'#d9cfb4', grout=o.grout||'#c2b594', key=W+'|'+wallB+'|'+wall+'|'+grout+'|'+lc; let c=HBC.get(key);
  if(!c){ if(HBC.size>40) HBC.clear(); const SW=Math.ceil(W)+320; const [cv,x]=mkc(SW,wallB); x.fillStyle=wall; x.fillRect(0,0,SW,wallB); x.fillStyle=grout;
    for(let y=5;y<wallB;y+=10) x.fillRect(0,y,SW,1); for(let y=5,r=0;y<wallB;y+=10,r++) for(let xx=-((r%2)*10);xx<SW;xx+=20) x.fillRect(xx,y,1,10);
    x.fillStyle=lc; x.fillRect(0,wallB-30,SW,5); x.fillStyle=shade(lc,-.4); for(let xx=0;xx<SW;xx+=10) x.fillRect(xx,wallB-30,5,2);
    x.fillStyle=shade(wall,-.3); x.fillRect(0,wallB-8,SW,8);
    for(let i=0;i*64<SW+64;i++){ const lx=i*64+20; x.fillStyle=P.ink; x.fillRect(lx-9,2,22,5); x.fillStyle=P.lampHot; x.fillRect(lx-8,3,20,3); }
    c=cv; HBC.set(key,c); }
  ctx.drawImage(c,-(((px%320)+320)%320),0);
  wallFog(wallB);
  ctx.fillStyle=o.floor||'#7a7080'; ctx.fillRect(0,wallB,W,H-wallB); ctx.fillStyle=P.ink; ctx.fillRect(0,wallB,W,1); persFloor(cam,o.floor2||'#6a6070',34); }
function hallLight(){ floorAO(); lampPools(G.cam); }
window.SIGN_Y=()=>Math.max(66,Math.min(FY0-60,Math.round(H*.24)));
function wallSign(x,y,w,h,txt,col,tcol='#fff',size=8){ const sx=Math.round(x-G.cam); if(sx+w<-10||sx>W+10) return; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,y-1,w+2,h+2); ctx.fillStyle=col; ctx.fillRect(sx,y,w,h); G.labels.push([txt,sx+w/2,y+h/2,size,tcol]); }
function drawTripActors(list){ const arr=[...list].sort((a,b)=>a.y-b.y); for(const a of arr){ if(a.hide) continue;
    if(a===G.hero){ ctx.save(); ctx.filter='brightness(0) invert(1)'; for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){ ctx.save(); ctx.translate(dx,dy); drawActor(a); ctx.restore(); } ctx.restore(); }
    drawActor(a); const sx=Math.round(a.x-G.cam), sy=Math.round(a.y-a.z);
    if(a.bub>0&&a.bubS) G.labels.push([a.bubS,sx,sy-58,7,a.bubC||'#fff','center',P.ink]);
    if(a.mark) { const bob=Math.round(Math.sin(G.t*6)*2); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,sy-66+bob,9,9); ctx.fillStyle=a.mark; ctx.fillRect(sx-3,sy-65+bob,7,7); }
  } }
// мигающая стрелка-цель
function goalArrow(x,y,col=P.neonLime){ const sx=Math.round(x-G.cam), b=Math.round(Math.sin(G.t*8)*2); if(sx<-10){ arrowEdge(4,y,-1,col); return; } if(sx>W+10){ arrowEdge(W-14,y,1,col); return; } ctx.fillStyle=P.ink; ctx.fillRect(sx-5,y-16+b,11,8); ctx.fillRect(sx-2,y-8+b,5,4); ctx.fillStyle=col; ctx.fillRect(sx-4,y-15+b,9,6); ctx.fillRect(sx-1,y-9+b,3,3); }
function arrowEdge(x,y,d,col){ const b=Math.round(Math.sin(G.t*8)*2); ctx.fillStyle=P.ink; ctx.fillRect(x-1+b*d,y-6,12,12); ctx.fillStyle=col; for(let i=0;i<5;i++) ctx.fillRect(x+(d>0?i:4-i)+b*d,y-4+i,2,9-i*2); }
function tripHUD(){ const L=SA.l+4, R=W-SA.r-4, T=SA.t+3, z=TR.z;
  // часы до 9:00
  const s=Math.ceil(TR.tLeft), mm=Math.floor(s/60), ss=String(s%60).padStart(2,'0'); const crit=TR.tLeft<15&&Math.floor(G.t*4)%2;
  const clockMin=Math.min(59,Math.floor(60-TR.tLeft/TR.tTotal*20)); ctx.fillStyle=P.ink; ctx.fillRect(L,T,92,26); ctx.fillStyle=crit?'#5a1020':'#1d1626'; ctx.fillRect(L+1,T+1,90,24);
  G.labels.push(['08:'+String(clockMin).padStart(2,'0'),L+24,T+8,7,'#ff5a5a']); G.labels.push(['до 09:00',L+64,T+8,6,'#aaa']); G.labels.push([mm+':'+ss,L+46,T+19,9,crit?'#fff':P.edge]);
  // табло зоны
  const bw=Math.max(120,Math.min(W-2*Math.max(100,SA.l+96,SA.r+160),300)), bx=Math.round(W/2-bw/2); ctx.fillStyle=P.ink; ctx.fillRect(bx-1,T,bw+2,14); ctx.fillStyle='#1d1626'; ctx.fillRect(bx,T+1,bw,12);
  const st=TR.mode==='escape'?'ПРОБИТЬСЯ':'«'+TR.name+'»'; const zt=z?ZONES[z.k].title(z):''; let ttl=txtW(st+' · '+zt,7)<bw-8?st+' · '+zt:zt; G.labels.push([ttl,W/2,T+7,7,'#ffb84a']);
  // полоска маршрута
  const n=TR.zones.length; for(let i=0;i<n;i++){ const x=Math.round(W/2-(n-1)*6+i*12), y=T+18; ctx.fillStyle=P.ink; ctx.fillRect(x-4,y-1,9,6); ctx.fillStyle=i<TR.zi?'#3a8a5a':i===TR.zi?P.edge:'#4a3a5a'; ctx.fillRect(x-3,y,7,4); }
  // цель зоны
  if(G.msg) G.labels.push([G.msg.s,W/2,T+34,8,G.msg.col]); else if(z&&z.hint) G.labels.push([z.hint,W/2,T+34,8,'#fff']);
  // кошелёк и проезд
  const w=wallet(); G.labels.push([w.coins+' мон. · '+passInfo(),R-Math.max(22,44*DPR/SC)-8,T+24,6,'#ffd23f','right']);
  // нервы и скандал
  const pbw=Math.max(22,44*DPR/SC), bx2=R-pbw-8-80, by2=T+12; ctx.fillStyle=P.ink; ctx.fillRect(bx2,by2,80,5); ctx.fillStyle='#5a3a4a'; ctx.fillRect(bx2+1,by2+1,78,3); ctx.fillStyle=TR.scandal>70?P.red:'#ff9a3a'; ctx.fillRect(bx2+1,by2+1,Math.round(78*Math.min(1,TR.scandal/100)),3);
  G.labels.push(['скандал',bx2-3,by2+2,5,'#ccc','right']);
  // пауза
  const pb=Math.max(22,44*DPR/SC); buttons.push({x:R-pb+4,y:T,w:pb,h:pb,id:'pause',cb:()=>{paused=!paused; SFX.ui();}}); ctx.fillStyle='#0008'; ctx.fillRect(R-pb+4,T,pb,pb); ctx.fillStyle='#fff'; ctx.fillRect(R-pb*.62+4,T+pb*.28,pb*.1,pb*.44); ctx.fillRect(R-pb*.42+4,T+pb*.28,pb*.1,pb*.44);
  // две кнопки
  const bh=Math.max(30,54*DPR/SC), bwA=Math.max(70,104*DPR/SC), bxA=R-bwA, byA=H-SA.b-bh-4;
  const aL=z&&z.ctxA?z.ctxA.label:'ТОЛКНУТЬ'; actBtn(aL,bxA,byA,bwA,bh,z&&z.ctxA?(z.ctxA.col||'#2aa860'):'#d8265e','A');
  if(z&&z.ctxB){ const bwB=Math.max(bwA,txtW(z.ctxB.label,8)+16); actBtn(z.ctxB.label,bxA-bwB-8,byA,bwB,bh,z.ctxB.col||'#3a6ad8','B',Math.sin(G.t*8)>0); }
  // стик-подсказка
  if(input.stick){ const s=input.stick; ctx.globalAlpha=.35; disc(ctx,s.x0,s.y0,18,18,'#fff'); ctx.globalAlpha=.7; disc(ctx,s.x,s.y,8,8,'#fff'); ctx.globalAlpha=1; }
  else if(G.time<5){ ctx.globalAlpha=.25+.1*Math.sin(G.t*4); disc(ctx,SA.l+40,H-SA.b-40,18,18,'#fff'); ctx.globalAlpha=1; G.labels.push(['веди пальцем',SA.l+40,H-SA.b-64,7,'#fff']); }
}
const ZONE_ICON={gate:'В',esc:'Э',passage:'П',plat:'Ж',car:'Ш',exitz:'⇧'};
function actBtn(label,x,y,w,h,col,id,pulse){ ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,h+4); ctx.fillStyle=shade(col,-.35); ctx.fillRect(x,y+3,w,h-3); ctx.fillStyle=pulse?shade(col,.2):col; ctx.fillRect(x,y,w,h-4); ctx.fillStyle='#ffffff40'; ctx.fillRect(x+2,y+2,w-4,2);
  G.labels.push([label,x+w/2,y+h/2-1,8,'#fff']); buttons.push({x,y,w,h,id:'trip'+id,cb:()=>tripPress(id)}); }
function drawTrip(){ G.labels=[]; buttons=[]; const z=TR.z; if(!z) return;
  const shx=G.shake>0?Math.round(rnd(-G.shake,G.shake)):0; ctx.save(); ctx.translate(shx,0);
  ZONES[z.k].draw(z);
  drawParts(); ctx.restore(); vignette(); drawPops();
  if(z.letterbox){ ctx.fillStyle='#000'; ctx.fillRect(0,0,W,14); ctx.fillRect(0,H-14,W,14); }
  if(TR.fade>0){ ctx.fillStyle='rgba(10,6,20,'+Math.min(1,TR.fade*2)+')'; ctx.fillRect(0,0,W,H); }
  if(TR.next>0){ const k=1-TR.next/.55; ctx.fillStyle='rgba(10,6,20,'+k+')'; ctx.fillRect(0,0,W,H); const nz=TR.zones[TR.zi+1]; if(nz) G.labels.push(['→ '+(nz.title||ZONES[nz.k].title(nz)),W/2,H/2,12,P.edge]); }
  if(!G.noHud) tripHUD();
  if(paused) drawPause(); }
