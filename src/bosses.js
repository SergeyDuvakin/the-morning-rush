'use strict';
// ================= БОССЫ (MVP: 3) =================
const BOSSES={
  babatank:{n:'БАБУШКА-ТАНК',sub:'Место не уступит',hp:36,spec:()=>mkSpec({skin:'#f2c49a',hairStyle:'scarf',hair:'#8a2a5a',top:'#6a3a8a',belly:'#8a5aaa',pants:'#3a2a3a',headR:10,bodyW:20,bodyH:16,legH:7,acc:['avoska'],face:{eyeL:4,eyeR:2,seed:3,mouth:'smug',blush:1,stubble:1}})},
  turnstile:{n:'ТУРНИКЕТ-МУТАНТ',sub:'Приложите лицо',hp:70},
  controller:{n:'КОНТРОЛЁР АПОКАЛИПСИСА',sub:'Ваш билетик?',hp:100,spec:()=>mkSpec({skin:'#e8b48a',hairStyle:'bigcap',hair:'#2a3a8a',top:'#2a3a8a',belly:'#3a4a9a',pants:'#1a2a5a',headR:9,bodyW:16,bodyH:15,legH:9,acc:['bigcap','whistle'],face:{eyeL:2,eyeR:4,seed:4,mouth:'smug',stubble:1}})},
};
function makeBoss(k,x,y){ const B=BOSSES[k]; const e=new Actor(x,y,B.spec?B.spec():null); Object.assign(e,{boss:k,B,hp:B.hp,maxhp:B.hp,T:{},type:'boss',ph:1,act:'intro',actT:0,scale:1.25}); e.onLand=()=>{e.sq=1.3; shake(2);};
  e.onHit=(d,kx,heavy,kind)=>{ if(k==='turnstile'&&!e.open){ pop('ДЗЫНЬ — ЖДИ ЗЕЛЁНУЮ',e.x,e.y-80,'#ccc',7); SFX.whiff(); return false; }
    if(k==='babatank'&&!e.stuck){ e.hp-=d*.5; e.flash=.1; SFX.hit(); pop('−'+(d*.5).toFixed(1),e.x,e.y-70,'#ccc',6); if(e.hp<=0) bossDie(e); return false; }
    e.hp-=d; e.flash=.12; e.sq=.85; SFX.hit(); G.score+=20; addCombo(); hitstop(.04); shake(1); parts(e.x,e.y,30,6,['#fff','#ffe066'],70,90,.4); if(e.hp<=0) bossDie(e); return false; };
  if(k==='turnstile'){ e.noHit=false; e.r=30; }
  return e; }
function bossDie(e){ if(e.dying) return; e.dying=true; e.act='die'; e.actT=0; SFX.ko(); haptic('success'); shake(6); hitstop(.25); say(e.B.n+' ПОВЕРЖЕН!',2.5,P.edge); G.score+=2000; quest('boss'); }
function bossUpdate(e,dt){ const h=G.hero, A=G.camLock; e.actT+=dt; const k=e.boss; const ph=e.hp<e.maxhp*.33?3:e.hp<e.maxhp*.66?2:1;
  if(ph!==e.ph){ e.ph=ph; say(k==='babatank'?(ph===2?'Бабушка достала СОЛЕНЬЯ!':'«А МЕСТО?!» — прячься за поручень!'):k==='turnstile'?(ph===2?'Турникет плюётся проездными!':'ДВЕ ЛИНИИ СРАЗУ!'):(ph===2?'Стажёры, ко мне!':'ЖЕТОН-ШТРАФ!'),2.4,P.red); if(k==='controller') for(let i=0;i<2;i++) G.ens.push(makeEnemy('trainee',A[i]+(i?-10:10),rnd(FY0+8,FY1-4))); }
  if(e.act==='die'){ e.vx=0; e.flash=.1; e.rot=Math.sin(e.actT*30)*.15; if(Math.random()<.4) parts(e.x,e.y,30,2,['#fff','#ffd23f'],100,120,.6); if(e.actT>1.6){ e.dead=true; parts(e.x,e.y,20,50,['#fff','#ffd23f','#ff7ab8','#3ff0ff'],160,200,1.2,2); for(let i=0;i<10;i++) G.items.push({k:'coin',x:e.x+rnd(-20,20),y:clamp(e.y+rnd(-10,10),FY0+3,FY1),z:20,vz:rnd(80,160)}); } e.phys(dt); return; }
  if(e.act==='intro'){ if(e.actT>1.2){ e.act='idle'; e.actT=0; } e.phys(dt); return; }
  if(k==='babatank'){
    e.stuck=e.act==='stuck';
    if(e.act==='idle'){ e.face=h.x>e.x?1:-1; e.vy=clamp((h.y-e.y)*2,-30,30); e.vx=0; e.poseOv=['idle',Math.floor(G.t*6)%6];
      if(e.actT>(ph===3?.9:1.3)){ e.actT=0; const r=Math.random(); e.act=ph>=3&&r<.3?'scream':ph>=2&&r<.6?'jars':'charge'; e.tele=.7; } }
    else if(e.act==='charge'){ e.tele=Math.max(0,.7-e.actT); e.poseOv=['dash',0]; if(e.actT<.7){ e.vx=0; if(Math.random()<.5) parts(e.x-e.face*12,e.y,0,1,'#ccc',20,30,.4);} else { e.vx=e.face*(150+ph*25); hitTest({x:e.x,y:e.y,z:0,face:e.face},0,0,0,()=>{});
        if(Math.abs(h.x-e.x)<20&&Math.abs(h.y-e.y)<11&&h.z<14) hurtHero(1.5,e.face*170,true);
        if((e.face>0&&e.x>A[1]-30)||(e.face<0&&e.x<A[0]+30)){ e.vx=0; shake(3); SFX.heavy(); const dc=(G.lv.doorClosingNear&&G.lv.doorClosingNear(e.x))||Math.random()<.25;
          if(dc){ e.act='stuck'; e.actT=0; say('ЗАЖАЛО ДВЕРЯМИ! БЕЙ!',1.8,P.neonLime); pop('ХРУМ',e.x,e.y-70,'#fff',12); haptic('success'); } else { e.act='idle'; e.actT=0; pop('БУМ',e.x,e.y-70,'#fff',9); } } } }
    else if(e.act==='stuck'){ e.vx=0; e.poseOv=['hurt',0]; e.rot=Math.sin(G.t*20)*.05; if(Math.random()<dt*3) pop(pick(['ОЙ-ОЙ','ПУСТИТЕ!','МОЯ ТАЧКА!']),e.x,e.y-80,'#fff',7); if(e.actT>3.2){ e.act='idle'; e.actT=0; e.rot=0; } }
    else if(e.act==='jars'){ e.poseOv=['p3',e.actT>.4?1:0]; e.vx=0; if(e.actT>.4&&!e.thrown){ e.thrown=true; for(let i=0;i<ph;i++){ const tx=h.x+rnd(-30,30), ty=clamp(h.y+rnd(-12,12),FY0+4,FY1), T=.9; G.fx.push({k:'jar',x:e.x,y:ty,z:40,vx:(tx-e.x)/T,vz:GRAV*T/2-40/T+10,t:0,own:'boss',tx,ty}); } }
      if(e.actT>1.1){ e.act='idle'; e.actT=0; e.thrown=false; } }
    else if(e.act==='scream'){ e.vx=0; e.tele=Math.max(0,1.3-e.actT); e.poseOv=['super',Math.floor(G.t*10)%4]; if(e.actT<1.3&&Math.random()<.3) pop('А…',e.x,e.y-80,'#fff',7);
      if(e.actT>1.3&&!e.screamed){ e.screamed=true; say('А МЕСТО?!!',1.4,P.red); shake(7); SFX.boss(); haptic('heavy'); const safe=(G.lv.poles||[]).some(px=>Math.abs(h.x-px)<9); if(safe){ pop('СПРЯТАЛСЯ!',h.x,h.y-60,P.neonLime,9); G.score+=200; } else hurtHero(1.5,(h.x>e.x?1:-1)*220,true); }
      if(e.actT>2){ e.act='idle'; e.actT=0; e.screamed=false; } }
  }
  else if(k==='turnstile'){ // стоит в центре, бьёт створками по линиям глубины
    e.vx=0; e.vy=0; e.lanes=e.lanes||[];
    e.openT=(e.openT||0)+dt; const cyc=ph===3?5:6; const tt=e.openT%cyc; e.open=tt>cyc-1.8; if(e.open&&!e.wasOpen){ say('ЗЕЛЁНАЯ СТРЕЛКА — БЕЙ!',1.2,P.neonLime); SFX.ding(); } e.wasOpen=e.open;
    if(!e.open){ e.swT=(e.swT||0)-dt; if(e.swT<=0){ e.swT=ph===3?1.1:1.5; const n=ph===3?2:1; for(let i=0;i<n;i++){ const y=i===0?clamp(h.y,FY0+5,FY1-2):(h.y>(FY0+FY1)/2?FY0+10:FY1-6); e.lanes.push({y,t:0,dir:Math.random()<.5?1:-1}); } }
      if(ph>=2&&Math.random()<dt*.9){ G.fx.push({k:'card',x:e.x,y:clamp(h.y+rnd(-6,6),FY0+3,FY1),z:30,vx:(h.x>e.x?1:-1)*150,t:0,own:'en',dmg:1}); } }
    for(const L of e.lanes){ L.t+=dt; if(L.t>.8&&!L.hit){ L.hit=true; SFX.heavy(); shake(2); if(Math.abs(h.y-L.y)<7&&h.z<16) hurtHero(1.5,L.dir*160,true); } }
    e.lanes=e.lanes.filter(L=>L.t<1.1);
  }
  else if(k==='controller'){
    if(e.act==='idle'){ e.poseOv=null; e.face=h.x>e.x?1:-1; const tx=h.x-e.face*50; e.vx=clamp((tx-e.x)*2,-50,50); e.vy=clamp((h.y-e.y)*2,-35,35); e.st=Math.abs(e.vx)>5?'walk':'idle';
      if(e.actT>(ph===3?1.2:1.7)){ e.actT=0; e.act=ph===3&&Math.random()<.4?'token':'grab'; e.tele=.6; } }
    else if(e.act==='grab'){ e.tele=Math.max(0,.6-e.actT); e.poseOv=['grab',0]; if(e.actT<.6){ e.vx=0; e.vy=0;} else if(e.actT<1.1){ e.vx=e.face*240; if(Math.abs(h.x-e.x)<16&&Math.abs(h.y-e.y)<9&&h.z<14&&!e.got){ e.got=true; hurtHero(2,e.face*80,false); pop('КОМПОСТ!',h.x,h.y-60,P.red,10); h.set('hurt'); h.stT=-.8; SFX.squeak(); } } else { e.vx=0; if(!e.got){ e.act='dizzy'; e.actT=0; pop('@_@',e.x,e.y-80,'#fff',10); } else { e.act='idle'; e.actT=0; } e.got=false; } }
    else if(e.act==='dizzy'){ e.vx=0; e.vy=0; e.poseOv=['hurt',0]; e.rot=Math.sin(G.t*8)*.12; if(e.actT>1.6){ e.act='idle'; e.actT=0; e.rot=0; } }
    else if(e.act==='token'){ e.poseOv=['p3',1]; e.vx=0; if(!e.tok){ e.tok=true; say('ЖЕТОН! ПРЫГАЙ!',1.2,P.edge); G.ens.push(Object.assign(makeProp('roll',e.face>0?A[0]+10:A[1]-10,0),{sub:'token',dir:e.face>0?1:-1,spd:150,big:true,y:clamp(h.y,FY0+4,FY1),col:'#ffd23f'})); }
      if(e.actT>1.4){ e.act='idle'; e.actT=0; e.tok=false; } }
  }
  e.phys(dt); e.x=clamp(e.x,A[0]+14,A[1]-14);
}
function drawBossExtra(e){ const sx=Math.round(e.x-G.cam);
  if(e.boss==='turnstile'){ // сам турникет-мутант
    const sy=Math.round(e.y); const o=(x,y,w,h,c)=>{ ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=c; ctx.fillRect(x,y,w,h); };
    const jig=e.flash>0?1:0; o(sx-18+jig,sy-60,36,60,'#9aa0b0'); o(sx-14,sy-56,28,12,'#2a2a3a'); // «лицо»-экран
    const open=e.open; ctx.fillStyle=open?P.neonLime:P.red; if(open){ ctx.fillRect(sx-8,sy-51,10,2); ctx.fillRect(sx,sy-53,2,6); ctx.fillRect(sx+2,sy-52,2,4);} else { ctx.fillRect(sx-6,sy-53,2,2); ctx.fillRect(sx+4,sy-53,3,3); ctx.fillRect(sx-5,sy-48,10,1);} 
    o(sx-16,sy-40,32,6,'#c0c6d0'); // рот-прорезь
    ctx.fillStyle=P.ink; for(let i=-14;i<14;i+=4) ctx.fillRect(sx+i,sy-39,2,4);
    const arm=Math.sin(G.t*(open?2:9))*6; o(sx-40,sy-30+arm,24,5,'#c0c6d0'); o(sx+16,sy-30-arm,24,5,'#c0c6d0');
    for(const L of e.lanes||[]){ const ly=Math.round(L.y); if(L.t<.8){ ctx.globalAlpha=.25+.25*Math.sin(L.t*30); ctx.fillStyle=P.red; ctx.fillRect(G.camLock[0]-G.cam,ly-5,W,9); ctx.globalAlpha=1; } else { o(G.camLock[0]-G.cam+(L.dir>0?0:W/2),ly-4,W/2,6,'#c0c6d0'); } }
  }
  if(e.boss==='babatank'&&e.act!=='die'){ // тачка-баул перед бабкой
    const sy=Math.round(e.y-e.z); const d=e.face; const bx=sx+d*20; ctx.fillStyle=P.ink; ctx.fillRect(bx-11,sy-24,22,20); ctx.fillStyle=P.white; ctx.fillRect(bx-10,sy-23,20,18); ctx.fillStyle='#d83a6f'; for(let i=-10;i<10;i+=4) ctx.fillRect(bx+i,sy-23,2,18); for(let j=-23;j<-5;j+=5) ctx.fillRect(bx-10,sy+j,20,1);
    ctx.fillStyle=P.ink; const r=Math.floor(G.t*10)%2; ctx.fillRect(bx-9,sy-4,5,5); ctx.fillRect(bx+4,sy-4,5,5); ctx.fillStyle='#888'; ctx.fillRect(bx-8+r,sy-3,1,1); ctx.fillRect(bx+5+r,sy-3,1,1); }
}
function drawBossBar(e){ const w=Math.min(200,W-120), x=Math.round(W/2-w/2), y=SA.t+20; ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,9); ctx.fillStyle='#3a2a3a'; ctx.fillRect(x,y,w,5); ctx.fillStyle=e.hp<e.maxhp*.33?P.red:P.neonPink; ctx.fillRect(x,y,Math.max(0,w*e.hp/e.maxhp),5); ctx.fillStyle='#fff6'; ctx.fillRect(x,y,Math.max(0,w*e.hp/e.maxhp),1);
  G.labels.push([e.B.n,W/2,y+13,7,'#fff']); }
// банки бабушки: летят дугой и разбиваются соленьями
function updBossProj(p,dt){}
