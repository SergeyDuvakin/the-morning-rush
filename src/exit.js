'use strict';
// ================= РЕЖИМ «ПРОБИТЬСЯ К ВЫХОДУ» (30–60 с) =================
const ALL_ST=FULL_MAP.flatMap(l=>l[1].map(s=>[l[0],s]));
const EX={};
function startExit(chain=0){ floorBand(); const st=pick(ALL_ST); const len=Math.max(W,420);
  const lv={name:st[1],line:ri(0,9),bg:'car',len,arenas:[],props:[],items:[],hooks:{},w:0,i:0}; carDoors(lv); lv.doors=[len-40]; lv.doorState=()=>EX.t>EX.limit-3?'closing':'closed';
  G.lv=lv; Object.assign(G,{ens:[],items:[],fx:[],parts:[],pops:[],cam:0,camLock:[0,len],score:0,coins:0,combo:0,rage:0,msg:null,stats:{},done:false,time:0,moves:new Set(),tut:-1});
  G.hero=makeHero(heroId,len*.35,(FY0+FY1)/2); G.hero.slow=.8;
  Object.assign(EX,{chain,t:0,limit:Math.max(26,42-chain*2),st:st[1],stLine:st[0],state:'go',endT:0});
  // толпа: от героя до двери плотно
  const types=['polite','bag','aunt','kid','tourist','sleeper','seeds','musician','courier'];
  const n=16+Math.min(10,chain*2);
  for(let i=0;i<n;i++){ const x=rnd(len*.42,len-50), y=rnd(FY0+6,FY1-2); const t=pick(types); const e=makeEnemy(t,x,y); e.crowd=true; e.home={x,y}; e.mass=t==='bag'||t==='aunt'?2.2:t==='sleeper'?3:1; e.tall=Math.random()<.35; e.st='idle'; e.face=Math.random()<.5?1:-1; if(t==='polite') e.oncoming=true; G.ens.push(e); }
  for(let i=0;i<5;i++){ const e=makeEnemy(pick(types),rnd(10,len*.3),rnd(FY0+6,FY1-2)); e.crowd=true; e.home={x:e.x,y:e.y}; e.mass=1; G.ens.push(e); }
  bgReset(lv); G.scene='exit'; paused=false; tgBack(true); musTheme=2; musOn=true; say('Выход на «'+st[1]+'» — через '+EX.limit+' с!',2.4,P.edge); SFX.doors(); }
function exitUpdate(dt){ const h=G.hero, lv=G.lv;
  for(const ev of input.events){ if(paused) continue; if(EX.state!=='go') { if(ev.t==='tap'){} continue; }
    if(ev.t==='tap') exitShove(h,26,60,'локоть'); else if(ev.t==='swipe'){ if(ev.dir==='up') heroAct(h,'up'); else if(ev.dir==='down') { heroAct(h,'down'); h.under=.45; } else { h.face=ev.dir==='right'?1:-1; h.set('dash'); h.vx=h.face*170; h.dashHit=new Set(); exitShove(h,30,140,'рывок'); } }
    else if(ev.t==='release') exitShove(h,34,110,'вертушка',true);
    else if(ev.t==='key'){ const c=ev.code; if(c==='KeyJ'||c==='Space') exitShove(h,26,60,'локоть'); else if(c==='KeyL'){ h.face=1; h.set('dash'); h.vx=170; h.dashHit=new Set(); exitShove(h,30,140,'рывок'); } else if(c==='KeyI'){ heroAct(h,'down'); h.under=.45; } else if(c==='Escape') paused=!paused; } }
  if(paused) return;
  if(G.msg){ G.msg.t-=dt; if(G.msg.t<=0) G.msg=null; }
  if(EX.state==='go'){ EX.t+=dt; G.time+=dt; }
  h.under=Math.max(0,(h.under||0)-dt);
  // герой: без боя, только толкание
  const sv=stickVec(); if(h.st==='idle'||h.st==='walk'){ h.vx=sv.x*58; h.vy=sv.y*36; if(Math.abs(sv.x)>.15) h.face=sv.x>0?1:-1; h.set(Math.hypot(sv.x,sv.y)>.15?'walk':'idle'); }
  else if(h.st==='dash'){ h.vx*=Math.pow(.02,dt); if(h.stT>.25) h.set('idle'); } else if(h.st==='slide'){ h.vx*=Math.pow(.1,dt); if(h.stT>.45) h.set('idle'); } else if(h.st==='atk'){ h.vx*=.8; if(h.stT>.2) h.set('idle'); } else if(h.st==='jump'){} else if(h.st==='hurt'&&h.stT>.3) h.set('idle');
  h.phys(dt); if(h.z===0&&h.st==='jump') h.set('idle');
  // толпа: мягкие столкновения
  for(const e of G.ens){ if(!e.crowd) continue; e.anT+=dt; e.stT+=dt; e.poseOv=null;
    if(e.oncoming&&EX.state==='go'){ e.vx=-14; e.face=-1; if(Math.abs(e.x-h.x)<30&&Math.random()<dt) pop('Можно пройти?',e.x,e.y-56,'#fff',6); }
    else { e.vx=(e.home.x-e.x)*.6; e.vy=(e.home.y-e.y)*.8; }
    const dx=h.x-e.x, dy=(h.y-e.y)*1.8, d=Math.hypot(dx,dy), R=13; const under=(h.under>0&&e.tall)||h.z>18;
    if(d<R&&d>0.01&&!under){ const o=(R-d); const k=1/(1+e.mass); h.x+=dx/d*o*(1-k)*.9; h.y+=dy/d*o*(1-k)*.5; e.x-=dx/d*o*k; e.y-=dy/d*o*k*.5; e.home.x-=dx/d*o*k*.6; e.home.y=clamp(e.home.y-dy/d*o*k*.3,FY0+4,FY1); if(Math.random()<dt*1.2) pop(pick(['э!','ай','куда?!','ну!','мужчина!']),e.x,e.y-52,'#fff',6); }
    e.x+=e.vx*dt; e.y=clamp(e.y+e.vy*dt,FY0+3,FY1); e.st=Math.abs(e.vx)>4?'walk':'idle'; if(e.tall) e.poseOv=['cheer',0]; if(e.type==='sleeper') e.poseOv=['sit',0]; }
  h.x=clamp(h.x,6,lv.len-6); h.y=clamp(h.y,FY0+3,FY1);
  updFX(dt); bgUpdate(dt,G.cam);
  // успех/провал
  if(EX.state==='go'){ if(h.x>lv.len-48){ EX.state='win'; EX.endT=0; SFX.win(); haptic('success'); G.score=Math.round((EX.limit-EX.t)*10); quest('exit'); EX.chain++; save.exitBest=Math.max(save.exitBest||0,EX.chain); store(); say('ВЫШЕЛ! Цепочка: '+EX.chain,2,P.neonLime); h.set('cheer'); }
    else if(EX.t>=EX.limit){ EX.state='lose'; EX.endT=0; SFX.ko(); haptic('error'); say('Двери закрылись. Проехал «'+EX.st+'»…',2.5,'#ff8a8a'); } }
  else EX.endT+=dt;
  let tx=clamp(h.x-W*.45,0,Math.max(0,lv.len-W)); G.cam+=(tx-G.cam)*Math.min(1,dt*6); G.shake=Math.max(0,G.shake-dt*14); }
function exitShove(h,reach,force,name,all){ if(h.st!=='dash') { h.set('atk'); h.atkPose=pick(['p1','p2']); } SFX.whiff(); let n=0;
  for(const e of G.ens){ if(!e.crowd) continue; const dx=(e.x-h.x)*(all?Math.sign(e.x-h.x):h.face); if(dx>-4&&dx<reach&&Math.abs(e.y-h.y)<12){ const f=force/(e.mass||1); e.home.x+=(e.x>h.x?1:-1)*f*.25; e.home.y=clamp(e.home.y+(e.y>h.y?1:-1)*f*.12,FY0+4,FY1); e.flash=.1; e.sq=.8; n++; if(e.type==='sleeper'&&Math.random()<.5) pop('ЧЁ?!',e.x,e.y-52,P.red,7); } }
  if(n){ SFX.hit(); shake(1); haptic('light'); } }
function drawExit(){ G.labels=[]; buttons=[]; const lv=G.lv, h=G.hero; const shx=G.shake>0?Math.round(rnd(-G.shake,G.shake)):0; ctx.save(); ctx.translate(shx,0);
  drawBG(G.cam); twistDraw(lv,'back');
  // дверь выхода
  const dx=Math.round(lv.len-30-G.cam); const urgent=EX.t>EX.limit-5; ctx.fillStyle=P.ink; ctx.fillRect(dx-18,FY0-64,36,FY1-FY0+64); ctx.fillStyle=urgent&&Math.floor(G.t*8)%2?'#ff4a4a':'#ffe9a8'; ctx.fillRect(dx-16,FY0-62,32,FY1-FY0+60);
  G.labels.push(['ВЫХОД',dx,FY0-70,9,P.neonLime]);
  const list=[h,...G.ens].sort((a,b)=>a.y-b.y); for(const a of list) drawActor(a,(sx,sy)=>{ if(a.tall&&a.crowd){ ctx.fillStyle='#fff'; ctx.fillRect(sx-1,sy-58,2,2);} });
  drawParts(); drawForeground(G.cam); vignette(); drawPops(); ctx.restore();
  // HUD: таймер-полоса и станция
  const L=SA.l+4,R=W-SA.r-4,T=SA.t+3, left=Math.max(0,EX.limit-EX.t), w=R-L-60;
  ctx.fillStyle=P.ink; ctx.fillRect(L-1,T-1,w+2,10); ctx.fillStyle='#3a2a3a'; ctx.fillRect(L,T,w,8); ctx.fillStyle=left<5?P.red:P.edge; ctx.fillRect(L,T,w*left/EX.limit,8);
  G.labels.push([(left<5?'⚠ ':'')+'«'+EX.st+'» · '+Math.ceil(left)+' с',L+w/2,T+18,9,left<5?'#ff8a8a':'#fff']);
  G.labels.push(['Цепочка: '+EX.chain+'   Рекорд: '+(save.exitBest||0),L+w/2,T+31,7,'#ccc']);
  G.labels.push([EX.stLine+' ветка',L+w/2,T+42,6,'#aaa']);
  const pb=Math.max(22,44*DPR/SC); buttons.push({x:R-pb,y:T,w:pb,h:pb,id:'pause',cb:()=>{paused=!paused;}}); ctx.fillStyle='#0008'; ctx.fillRect(R-pb,T,pb,pb); ctx.fillStyle='#fff'; ctx.fillRect(R-pb*.62,T+pb*.28,pb*.1,pb*.44); ctx.fillRect(R-pb*.42,T+pb*.28,pb*.1,pb*.44);
  if(input.stick){ const s=input.stick; ctx.globalAlpha=.35; disc(ctx,s.x0,s.y0,18,18,'#fff'); ctx.globalAlpha=.7; disc(ctx,s.x,s.y,8,8,'#fff'); ctx.globalAlpha=1; }
  if(G.time<5) G.labels.push(['Тап — локоть · свайп вбок — рывок · вниз — под рукой',W/2,H-SA.b-14,8,'#fff']);
  if(G.msg) G.labels.push([G.msg.s,W/2,H*.32,10,G.msg.col]);
  if(EX.state!=='go'&&EX.endT>1){ const bh=Math.max(28,48*DPR/SC), bw=130; ctx.fillStyle='#0009'; ctx.fillRect(0,0,W,H);
    G.labels.push([EX.state==='win'?'ВЫШЕЛ! 🎉':'ПРОЕХАЛ…',W/2,H*.3,18,EX.state==='win'?P.neonLime:'#ff8a8a']);
    if(EX.state==='win') bigBtn('СЛЕДУЮЩАЯ ▶',W/2+6,H*.55,bw,bh,'#2aa860',()=>startExit(EX.chain),'exnext'); else bigBtn('ЕЩЁ РАЗ',W/2+6,H*.55,bw,bh,'#3a6ad8',()=>startExit(0),'exretry');
    bigBtn('МЕНЮ',W/2-bw-6,H*.55,bw,bh,'#8a3ad8',()=>toTitle(),'exmenu'); }
  if(paused) drawPause(); }
