'use strict';
// ================= ЗОНА: ЭСКАЛАТОР / ЛЕСТНИЦА (диагональная мини-сценка) =================
ZONES.esc={ title:z=>z.mode==='stairs'?'ЭСКАЛАТОР СЛОМАН — ЛЕСТНИЦА':'ЭСКАЛАТОР',
  tip:z=>z.mode==='stairs'?'жми ШАГ без остановки; бабушек обходи сбоку':'уйди влево (стик) и жми «ИДТИ СЛЕВА»',
  init(z){ z.noCrowd=true; z.lockHero=true; z.letterbox=true; z.N=30; z.len=W; z.s=0; z.lane=1; z.belt=z.mode==='stairs'?0:2.1; z.tapT=0; z.ppl=[]; z.hop=0;
    const d=z.d; // правый ряд стоит плотно, левый — идущие и «стоялы»
    for(let s=2;s<z.N-1;s+=rnd(1.6,2.8)) z.ppl.push({lane:1,s,a:mkNpc(qType(d),0,0),stand:z.mode!=='stairs',v:z.mode==='stairs'?rnd(.6,1.1):0});
    const nl=z.mode==='stairs'?3+Math.min(4,d>>2):1+Math.min(4,d>>2); for(let i=0;i<nl;i++){ const s=rnd(4,z.N-3); if(z.ppl.some(p=>p.lane===0&&Math.abs(p.s-s)<2.5)) continue; z.ppl.push({lane:0,s,a:mkNpc(z.mode==='stairs'?'granny':qType(d),0,0),stand:true,v:0,blk:true}); }
    for(let i=0;i<2;i++) z.ppl.push({lane:0,s:rnd(-6,-1),a:mkNpc('courier',0,0),stand:false,v:2.4});
    for(const p of z.ppl){ p.a.face=1; p.a.pin=true; } z.y0=0; z.y1=H; },
  pos(z,s,lane){ const k=s/z.N; return {x:70+k*(W-250)+(lane===0?-6:6), y:40+k*(H-96)+(lane===0?-8:6)}; },
  ahead(z,lane,s){ let b=null; for(const p of z.ppl) if(p.lane===lane&&p.s>s&&(!b||p.s<b.s)) b=p; return b; },
  update(z,dt){ const h=G.hero; z.tapT-=dt; const st=stickVec();
    // смена ряда
    if(Math.abs(st.x)>.5||Math.abs(st.y)>.5){ const want=(st.x<-.5||st.y<-.5)?0:1; if(want!==z.lane&&!z.swT){ if(!z.ppl.some(p=>p.lane===want&&Math.abs(p.s-z.s)<1.1)){ z.lane=want; z.swT=.3; tev('esc_switch'); SFX.ui(); } else { z.swT=.4; pop('некуда!',h.x,h.y-50,'#ccc',7); } } }
    if(z.swT){ z.swT=Math.max(0,z.swT-dt); if(!z.swT) z.swT=0; }
    // движение людей
    for(const p of z.ppl){ p.s+=z.belt*dt; if(p.v){ const b=this.ahead(z,p.lane,p.s); const hb=p.lane===z.lane&&z.s>p.s&&z.s-p.s<1.3; if((!b||b.s-p.s>1.3)&&!hb) p.s+=p.v*dt; else if(hb&&p.v>2&&!p.a.bub) bubble(p.a,'Пропустите!',1.2); } if(p.leaveT>0){ p.leaveT-=dt; if(p.leaveT<=0){ p.lane=1; p.blk=false; p.a.bub=0; } } }
    z.ppl=z.ppl.filter(p=>p.s<z.N+1);
    // герой едет вместе с лентой
    const b=this.ahead(z,z.lane,z.s); const room=b?b.s-z.s-1.05:99; z.s+=Math.min(z.belt*dt,Math.max(0,room+.02));
    if(z.mode==='stairs'){ TR.nerves=Math.max(0,TR.nerves-dt*1.2); }
    // прыжки ступеней (анимация)
    z.hop=Math.max(0,z.hop-dt*6);
    const P0=this.pos(z,z.s,z.lane); h.x=P0.x+G.cam; h.y=P0.y; h.z=z.hop*5; h.face=1; h.set(z.hop>0?'walk':'idle');
    if(z.s>=z.N-.3){ z.s=z.N; if(!z.fin){ z.fin=1; pop(pick(['СОСКОК!','ПРИЕХАЛИ','ОП!']),h.x,h.y-40,P.edge,8); zoneDone(); } }
    z.hint=z.mode==='stairs'?'жми ШАГ! ('+Math.round(z.N-z.s)+' ступ.)':z.lane===1?'стоишь справа · веди влево — и бегом':'левый ряд: жми «ИДТИ СЛЕВА»';
  },
  step(z){ const h=G.hero; if(z.tapT>0) return; z.tapT=.14; const b=this.ahead(z,z.lane,z.s);
    if(z.lane===1&&z.mode!=='stairs'){ if(b&&b.s-z.s<1.6){ bubble(b.a,pick(['Не толкайтесь!','Стойте справа!','Куда торопимся?']),1.2); TR.scandal+=4; return; } }
    if(b&&b.s-z.s<1.3){ if(b.blk&&!b.leaveT){ bubble(b.a,pick(['Я тут стою.','Мне тоже на работу.','…']),1.1); } return; }
    z.s+=(z.mode==='stairs'?heroStats().stairsMul:1); z.hop=1; tev(z.mode==='stairs'?'stairs_step':'esc_step'); const nn=[0,2,4,5,7,9,11]; tone(mtof(72+nn[Math.floor(z.s)%7]),.06,'square',.1); },
  swap(z){ const want=1-z.lane, h=G.hero; if(!z.ppl.some(p=>p.lane===want&&Math.abs(p.s-z.s)<1.1)){ z.lane=want; z.swT=.3; tev('esc_switch'); SFX.ui(); } else pop('некуда!',h.x,h.y-50,'#ccc',7); },
  ctx(z){ const r={}; const b=this.ahead(z,z.lane,z.s);
    r.b={label:z.mode==='stairs'?'ШАГ':z.lane===0?'ИДТИ СЛЕВА':'ТОРОПИТЬСЯ',col:'#3a6ad8',fn:()=>this.step(z)};
    if(b&&b.blk&&b.s-z.s<2&&!b.leaveT) r.a={label:'ПРОПУСТИТЕ!',col:'#d87a20',fn:()=>{ tev('esc_ask'); if(Math.random()<.6){ b.leaveT=.8; bubble(b.a,'Ой, проходите',1); } else { bubble(b.a,'Мне тоже некуда!',1.2); TR.scandal+=8; } }};
    else r.a={label:z.lane===1?'← ВЛЕВО':'ВПРАВО →',col:'#2a4aa8',fn:()=>this.swap(z)};
    return r; },
  prog(z){ return z.s*12; }, unstick(z){ for(const p of z.ppl) if(p.lane===z.lane&&p.s>z.s&&p.s<z.s+4) { p.lane=1-p.lane; p.blk=false; } z.s=Math.min(z.N,z.s+6); },
  bot(z){ const r={x:G.hero.x,y:G.hero.y}; const b=this.ahead(z,z.lane,z.s);
    if(z.lane===1&&z.mode!=='stairs'&&!z.ppl.some(p=>p.lane===0&&Math.abs(p.s-z.s)<1.2)) { r.stick={x:-1,y:-.2}; return r; }
    if(b&&b.blk&&b.s-z.s<2&&!b.leaveT) { r.a=1; return r; } if(b&&b.s-z.s<1.4&&z.mode==='stairs'){ const o=1-z.lane; if(!z.ppl.some(p=>p.lane===o&&Math.abs(p.s-z.s)<1.2)) { r.stick={x:o?1:-1,y:0}; return r; } }
    r.b=1; return r; },
  draw(z){ const lc=LINE_COL[TR.line%10]; ctx.fillStyle='#2a2236'; ctx.fillRect(0,0,W,H); const A=this.pos(z,-3,0), B=this.pos(z,z.N+3,0);
    // свод тоннеля: полосы
    for(let i=0;i<14;i++){ const k=i/13; ctx.fillStyle=i%2?'#3a3046':'#332a40'; ctx.beginPath(); ctx.moveTo(0,k*H*1.4-60); ctx.lineTo(W,k*H*1.4+H*.35-60); ctx.lineTo(W,k*H*1.4+H*.35-40); ctx.lineTo(0,k*H*1.4-40); ctx.fill(); }
    // полотно
    const band=(off,col,wd)=>{ ctx.strokeStyle=col; ctx.lineWidth=wd; ctx.beginPath(); ctx.moveTo(A.x,A.y+off); ctx.lineTo(B.x+12,B.y+off+14); ctx.stroke(); };
    band(-14,P.ink,6); band(-14,'#c8b48a',4); band(14,P.ink,6); band(14,'#c8b48a',4); band(0,'#1a1020',22); band(0,z.mode==='stairs'?'#8a8090':'#4a4250',20);
    // ступени
    const off=z.mode==='stairs'?0:(BG.t*z.belt)%1; for(let s=-3;s<z.N+3;s++){ const p=this.pos(z,s+off,0), q=this.pos(z,s+off,1); ctx.fillStyle='#2a2430'; ctx.fillRect(Math.round(p.x-6),Math.round(p.y+2),Math.round(q.x-p.x+14),1); }
    // торшеры
    for(let s=0;s<z.N;s+=5){ const p=this.pos(z,s+(z.mode==='stairs'?0:(BG.t*z.belt)%5)-2.5,0); const x=Math.round(p.x-2), y=Math.round(p.y-30); ctx.fillStyle=P.ink; ctx.fillRect(x,y,3,18); ctx.fillStyle=P.lampHot; ctx.fillRect(x-2,y-4,7,5); ctx.fillStyle='rgba(255,240,180,.08)'; ctx.fillRect(x-10,y-10,23,20); }
    G.labels.push([z.mode==='stairs'?'СТОЙ — НЕ СТОЙ, ИДИ ПЕШКОМ':'СТОЙТЕ СПРАВА · ПРОХОДИТЕ СЛЕВА',W*.62,44,7,'#ffd23f']);
    if(z.mode==='stairs') G.labels.push(['ЭСКАЛАТОР НА РЕМОНТЕ',W*.3,H-30,7,P.red]);
    const acts=[]; for(const p of z.ppl){ const q=this.pos(z,p.s,p.lane); p.a.x=q.x+G.cam; p.a.y=q.y; p.a.set(p.v?'walk':'idle'); p.a.anT+=1/60; acts.push(p.a); }
    const sv=[FY0,FY1]; FY0=0; FY1=H*2.2; drawTripActors([G.hero,...acts]); FY0=sv[0]; FY1=sv[1];
    const nb=this.ahead(z,z.lane,z.s); if(nb&&nb.blk&&nb.s-z.s<2) nb.a.mark=P.red; for(const p of z.ppl) if(p!==nb) p.a.mark=null;
  } };
// ================= ЗОНА: ВЫХОД В ГОРОД (встречный поток, дождь) =================
ZONES.exitz={ title:z=>z.rain?'ДОЖДЛИВЫЙ ВЕСТИБЮЛЬ':'ВЫХОД В ГОРОД',
  tip:z=>'иди вправо, обходи встречных; ТОЛКНУТЬ — если совсем зажали',
  init(z){ z.len=Math.max(W,520)+z.d*4; z.wet=!!z.rain; z.spawnT=0;
    for(let i=0;i<z.crowd;i++){ const e=mkNpc(qType(z.d),rnd(80,z.len-40),rnd(z.y0,z.y1)); e.dir=Math.random()<.65?-1:1; e.spd2=rnd(22,40); e.free=1; if(z.rain&&Math.random()<.5) e.umb=pick(['#d8265e','#3d6ff0','#19b874','#1a1a1a']); z.npcs.push(e); } },
  update(z,dt){ const h=G.hero; for(const e of z.npcs){ e.x+=e.dir*e.spd2*dt; e.face=e.dir; e.set('walk'); wrapFlow(z,e,()=>{ e.y=rnd(z.y0,z.y1); }); e.y+=Math.sin(G.t*1.3+e.anT)*dt*6; }
    if(z.rain&&Math.abs(h.vx)>60&&Math.random()<dt*.6&&!h.stun){ tev('rain_slip'); h.stun=.6; h.vx*=.3; pop('СКОЛЬЗКО!',h.x,h.y-50,'#9cf',7); SFX.land(); }
    if(h.x>z.len-26) zoneDone(); z.hint='ВЫХОД В ГОРОД →'; },
  ctx(z){ return {}; }, prog(z){ return G.hero.x; }, unstick(z){ G.hero.x+=40; for(const e of z.npcs) if(Math.abs(e.x-G.hero.x)<40) e.y=e.y<G.hero.y?z.y0:z.y1; },
  bot(z){ const h=G.hero; let ty=h.y; for(const e of z.npcs){ if(e.x>h.x&&e.x<h.x+30&&Math.abs(e.y-h.y)<10) ty=e.y>h.y?h.y-14:h.y+14; } return {x:z.len,y:clamp(ty,z.y0,z.y1),a:h.den>4&&Math.random()<.05?1:0}; },
  draw(z){ hallBG(z,{wall:z.rain?'#c8c4b8':'#e8dcc0',floor:z.rain?'#5a6070':'#7a7080'}); const c=G.cam;
    wallSign(z.len-130,SIGN_Y(),110,14,'ВЫХОД В ГОРОД ↑',LINE_COL[TR.line%10],'#fff',8);
    // двери на улицу
    const dx=Math.round(z.len-60-c); ctx.fillStyle=P.ink; ctx.fillRect(dx-4,FY0-74,64,74); ctx.fillStyle=z.rain?'#7a8aa0':'#bfe0ff'; ctx.fillRect(dx-2,FY0-72,60,70); ctx.fillStyle=P.ink; ctx.fillRect(dx+27,FY0-72,2,70);
    if(z.rain){ ctx.fillStyle='#ffffff60'; for(let i=0;i<24;i++){ const x=(i*37+BG.t*30)%60, y=(i*53+BG.t*220)%70; ctx.fillRect(dx-2+x,FY0-72+y,1,4); } ctx.fillStyle='rgba(150,190,255,.12)'; for(let i=0;i<8;i++) ctx.fillRect(Math.round(((i*97)%z.len)-c),FY0+8+(i*13)%40,40,2); }
    hallLight(); drawTripActors([G.hero,...z.npcs]);
    // зонты — umb4.js (V33-3)
    goalArrow(z.len-30,FY0-20); } };
