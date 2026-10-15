'use strict';
// ================= УРОВНИ: 3 ветки MVP × 8 станций, у каждой своя фишка (GDD §17) =================
const LINE_NAMES=['Компотная','Тортральная','Пирожанская'];
const LINE_TILES=[{tile:'#efe2c8',grout:'#c9b48e',floor:'#6c6274',floor2:'#5a5163'},{tile:'#d8efe0',grout:'#9ac8ac',floor:'#5f6a70',floor2:'#4e585e'},{tile:'#dfe6f6',grout:'#a8b4d8',floor:'#5e6078',floor2:'#4c4e66'}];
const POOL=[['polite','bag','kid','tourist','aunt','sleeper'],['polite','bag','aunt','musician','courier','seeds','kid','tourist'],['polite','bag','aunt','musician','courier','seeds','trainee','kid','sleeper']];
const LEVELS=[]; LINES_SRC.forEach((L,w)=>L[2].forEach((s,i)=>LEVELS.push({w,i,line:w,name:s[0],twistText:s[1],boss:i===7?['babatank','turnstile','controller'][w]:null})));
function lvIndex(w,i){ return w*8+i; }
function rollWave(lv,n,extra=[]){ const pool=POOL[lv.w]; const out=[...extra]; while(out.length<n) out.push(pick(pool)); return out; }
function buildLevel(L){ const lv=Object.assign({},L,LINE_TILES[L.w]); lv.bg='station'; lv.arenas=[]; lv.props=[]; lv.items=[]; lv.poles=[]; lv.hooks={};
  const AW=Math.max(300,Math.min(W,470)); lv.AW=AW; const d=L.w*7+L.i; // сложность 0..20
  const nA=L.boss?1:(L.i===0&&L.w===0?3:3+(d>10?1:0)); let x=AW*0.15;
  for(let a=0;a<nA;a++){ x+=AW*(a===0?0.4:1.1); const per=2+Math.min(2,Math.floor(d/6)); lv.arenas.push({x0:x-AW/2,x1:x+AW/2,waves:[rollWave(lv,per),rollWave(lv,per+1)]}); }
  lv.len=x+AW*0.9; lv.par=30+nA*22;
  // фишки ветки по станции
  const key=L.w+'.'+(L.i+1); const T=TWISTS[key]; if(T) T(lv);
  if(!L.boss&&L.w>=1&&lv.arenas[2]) lv.items.push({k:'pie',x:lv.arenas[2].x0+40,y:FY0+8}); // пирожок на лавке перед 3-й ареной
  if(L.boss){ lv.len=x+AW/2+6; }
  return lv; }
const between=(lv,a)=>rnd(lv.arenas[a].x0+40,lv.arenas[a].x1-40);
function carDoors(lv){ lv.bg='car'; lv.doors=[]; for(let x=150;x<lv.len+200;x+=300) lv.doors.push(x);
  const per=8; lv.doorState=x=>{ const t=(G.t+x*.01)%per; return t<3?'open':t<4?'closing':'closed'; };
  lv.doorOpenNear=x=>lv.doors.some(d=>Math.abs(d-x)<26&&lv.doorState(d)!=='closed');
  lv.doorClosingNear=x=>lv.doors.some(d=>Math.abs(d-x)<60&&lv.doorState(d)!=='closed'); }
const TWISTS={
  '0.1':lv=>{ lv.tutorial=true; lv.arenas.forEach(a=>{a.waves=[['polite','polite'],['tourist','kid']];}); lv.arenas[0].waves=[['polite'],['polite','tourist']];
    lv.hooks.update=dt=>{ if(Math.random()<dt*.35&&G.camLock) G.ens.push(mkRoll('coco',G.camLock[1]+10,rnd(FY0+5,FY1),-1,70)); }; },
  '0.2':lv=>{ lv.syrup=true; lv.floor='#a05a7a'; lv.floor2='#8a4a6a'; say('Пол липкий — подкат летит ДАЛЕКО',2.5,'#ff9ac8'); },
  '0.3':lv=>{ lv.arenas.forEach((a,ai)=>{ for(let i=0;i<3;i++){ const c=Object.assign(makeProp('column',a.x0+60+i*((a.x1-a.x0-120)/2),FY0+6),{noHit:false,hp:3}); c.onHit=()=>{ c.hp--; c.flash=.1; SFX.hit(); shake(1); return false; }; lv.props.push(c);} a.fromCols=true; }); },
  '0.4':lv=>{ lv.hooks.update=dt=>{ if(G.camLock&&Math.random()<dt*.5) G.ens.push(mkRoll('case',G.camLock[1]+10,rnd(FY0+5,FY1),-1,90)); }; say('Чемоданы — это кегли. Отбей их во врагов!',2.6,P.edge); },
  '0.5':lv=>{ lv.arenas.forEach(a=>{ for(let i=0;i<2;i++){ const d=makeProp('duck',between(lv,lv.arenas.indexOf(a)),rnd(FY0+5,FY1),{noHit:false}); d.onHit=()=>{ if(d.carry){ G.items.push({k:d.carry,w:true,x:d.x,y:d.y,z:10,vz:80}); } d.dead=true; G.score+=80; pop('КРЯ! +80',d.x,d.y-20,'#fff',8); parts(d.x,d.y,8,8,'#fff6d0',50,60,.5); return false; }; lv.props.push(d);} }); lv.items.push({k:'umbrella',w:true,x:lv.arenas[0].x0+80,y:FY0+20}); lv.items.push({k:'baton',w:true,x:lv.arenas[1].x0+90,y:FY1-6}); lv.floor='#5a6a74'; },
  '0.6':lv=>{ lv.bg='car'; carDoors(lv); lv.arenas.forEach(a=>{ a.waves=[['sleeper','sleeper','sleeper',pick(POOL[0])],['sleeper','sleeper',pick(POOL[0]),pick(POOL[0])]]; a.sleepy=true; lv.props.push(Object.assign(makeProp('smell',a.x0+a.x1>>1,FY0+6),{every:3.5})); }); },
  '0.7':lv=>{ lv.escort=true; lv.arenas.forEach(a=>a.waves=a.waves.map(w=>w.slice(0,Math.max(2,w.length-1)))); },
  '0.8':lv=>{ carDoors(lv); const a0=lv.arenas[0], aw=Math.min(W,lv.AW); lv.doors=[a0.x0+34,a0.x0+aw-34]; lv.poles=[a0.x0+aw*.33,a0.x0+aw*.67]; lv.arenas[0].waves=[['boss:babatank']]; lv.items.push({k:'pie',x:lv.arenas[0].x0+40,y:FY1-4}); },
  '1.1':lv=>{ carDoors(lv); lv.trickle=true; lv.arenas.forEach(a=>a.waves=[rollWave(lv,1),rollWave(lv,2),rollWave(lv,3)]); },
  '1.2':lv=>{ lv.rocking=true; },
  '1.3':lv=>{ lv.dropIn=true; lv.board=[['Хрювино','ЗАДЕРЖАН'],['Аэроторт','ПОСАДКА'],['Диваномо','УЛЕТЕЛ']]; },
  '1.4':lv=>{ carDoors(lv); lv.sofa=true; },
  '1.5':lv=>{ lv.poet=true; },
  '1.6':lv=>{ lv.stage=true; },
  '1.7':lv=>{ lv.windGusts=true; },
  '1.8':lv=>{ lv.arenas[0].waves=[['boss:turnstile']]; lv.items.push({k:'pie',x:lv.arenas[0].x0+40,y:FY1-4}); },
  '2.1':lv=>{ lv.cats=true; },
  '2.2':lv=>{ lv.blizzard=true; lv.tile='#e8eef8'; },
  '2.3':lv=>{ lv.mimic=true; lv.arenas.forEach(a=>a.waves=a.waves.map(w=>w.map((t,i)=>i%2?'dancer':t))); },
  '2.4':lv=>{ lv.picnic=true; },
  '2.5':lv=>{ lv.flicker=true; lv.dark=true; },
  '2.6':lv=>{ lv.arenas.forEach(a=>a.waves=a.waves.map(w=>[...w.slice(0,w.length-1),'statue'])); lv.tile='#efe0b8'; },
  '2.7':lv=>{ lv.peels=true; },
  '2.8':lv=>{ lv.arenas[0].waves=[['boss:controller']]; lv.items.push({k:'pie',x:lv.arenas[0].x0+40,y:FY1-4}); },
};
function mkRoll(sub,x,y,dir,spd){ const r=Object.assign(makeProp('roll',x,y),{sub,dir,spd,col:pick(['#d83a3a','#3a8ad8','#e0a020','#8a3ad8']),noHit:false,hitSet:new Set()}); r.onHit=()=>{ r.hero=true; r.dir=G.hero.face; r.spd=210; SFX.hit(); pop('ОТБИЛ!',r.x,r.y-24,'#fff',7); return false; }; return r; }
// --- рантайм фишек ---
function twistUpdate(lv,dt){ const h=G.hero; lv.hooks.update&&lv.hooks.update(dt);
  if(lv.rocking){ const f=Math.sin(G.t*1.1)*26; for(const a of [h,...G.ens]) if(!a.boss&&a.z===0&&a.st!=='sleep') a.x+=f*dt; G.tilt=Math.sin(G.t*1.1)*1.5; }
  if(lv.windGusts){ lv.gT=(lv.gT||8)-dt; if(lv.gT<1.2&&!lv.warned){ lv.warned=true; say('Встречный поезд! Держись!',1.2,P.edge); SFX.train(); }
    if(lv.gT<=0){ lv.gT=10; lv.warned=false; lv.gust=1.2; }
    if(lv.gust>0){ lv.gust-=dt; shake(1.5); for(const e of G.ens){ if(e.boss||e.dead||e.isProp&&e.kind!=='duck') continue; e.x-=90*dt; e.y-=12*dt; if(e.y<FY0+6&&e.hp>0&&e.st!=='rail'&&!e.isProp&&!e.T.peaceful){ e.set('rail'); e.vz=60; G.score+=150; pop('СДУЛО!',e.x,e.y-40,P.edge,8);} } h.x-=(h.st==='walk'?30:55)*dt; for(let i=0;i<3;i++) G.parts.push({x:G.cam+W+rnd(0,20),y:rnd(FY0,FY1),z:rnd(0,60),vx:-300,vy:0,vz:0,col:'#fff8',t:0,life:1,s:1}); } }
  if(lv.blizzard){ for(let i=0;i<3;i++) G.parts.push({x:G.cam+rnd(0,W+40),y:rnd(FY0,FY1),z:rnd(60,140),vx:-80,vy:0,vz:-30,col:'#fff',t:0,life:2,s:1}); h.x-=6*dt; }
  if(lv.trickle&&G.camLock&&Math.random()<dt*.12&&liveEnemies().length<4){ G.ens.push(makeEnemy(pick(POOL[1]),G.camLock[pick([0,1])],rnd(FY0+6,FY1))); }
  if(lv.cats&&G.camLock&&G.ens.filter(e=>e.type==='cat'&&!e.dead).length<3){ const c=makeEnemy('cat',rnd(G.camLock[0]+20,G.camLock[1]-20),rnd(FY0+6,FY1)); c.col=pick(['#ff9a3a','#4a4a4a','#e8e0d0','#a87a4a']); c.noHit=true; G.ens.push(c); }
  if(lv.stage&&G.stats.moves){ /* артистичность считается в heroAct */ }
  if(lv.mimic){ for(const e of G.ens){ if(e.type==='dancer'&&e.st==='idle'&&h.st==='atk'&&h.stT<dt*1.5&&Math.abs(e.x-h.x)<70){ e.set('atk'); e.tele=.25; e.atkWind=.25; e.hitDone=false; e.atkPose=h.atkPose; e.face=h.x>e.x?1:-1; } } }
  if(lv.picnic&&G.camLock&&!lv.foodPlaced){ lv.foodPlaced=G.camLock[0]; for(let i=0;i<3;i++) G.ens.push(makeProp('food',rnd(G.camLock[0]+40,G.camLock[1]-40),rnd(FY0+8,FY1-4))); } 
  if(lv.picnic&&G.camLock&&lv.foodPlaced!==G.camLock[0]) lv.foodPlaced=null;
  if(lv.picnic){ for(const e of liveEnemies()){ if(e.eating>0){ e.eating-=dt; e.vx=0; e.vy=0; e.poseOv=['sit',0]; if(Math.random()<dt*2) pop('ням',e.x,e.y-40,'#ffd23f',6); if(e.eating<=0){ e.poseOv=null; e.food&&(e.food.eaten=true);} continue; }
      const f=G.ens.find(o=>o.kind==='food'&&!o.dead&&!o.taken); if(f&&e.st==='walk'&&Math.abs(f.x-e.x)<40&&!e.ate){ e.vx=clamp((f.x-e.x)*3,-40,40); e.vy=clamp((f.y-e.y)*3,-30,30); if(Math.abs(f.x-e.x)<6&&Math.abs(f.y-e.y)<5){ f.taken=true; e.food=f; e.eating=3; e.ate=true; } } } }
  if(lv.peels&&G.camLock&&!lv.peelsAt){ lv.peelsAt=1; for(let i=0;i<6;i++) G.ens.push(makeProp('peel',rnd(G.camLock[0]+20,G.camLock[1]-20),rnd(FY0+6,FY1-2))); }
  if(lv.escort&&!lv.cake){ lv.cake=makeProp('cake',lv.arenas[0].x0-40,(FY0+FY1)/2-2,{hp:12,maxhp:12,go:true}); G.ens.push(lv.cake); for(const dx of [-16,16]){ const s=makeEnemy('student',lv.cake.x+dx,lv.cake.y+(dx>0?-6:6)); s.dir=1; s.escort=dx; G.ens.push(s);} 
    const egg=makeEnemy('student',lv.cake.x-34,lv.cake.y+10); egg.spec=mkSpec({skin:'#8ae05a',hairStyle:'bald',top:'#8ae05a',belly:'#b6f07a',pants:'#6ac03a',shoes:'#6ac03a',headR:9,legH:3,acc:['gradcap'],face:{eyeL:4,eyeR:3,seed:7,tooth:1}}); egg.shmyaks=true; egg.dir=1; egg.escort=-34; G.ens.push(egg); }
  if(lv.escort&&lv.cake){ const c=lv.cake; c.go=!G.camLock||c.x<G.camLock[1]-50; if(G.camLock&&c.x<G.camLock[0]+30) c.go=true; for(const s of G.ens) if(s.escort){ s.x=c.x+s.escort; s.st='walk'; s.vx=0; }
    for(const e of liveEnemies()){ if(e.T.ranged) continue; if(Math.abs(e.x-c.x)<70&&!e.vsHero&&e.st==='walk'){ e.vx=clamp((c.x-e.x)*3,-e.spd,e.spd); e.vy=clamp((c.y-e.y)*3,-30,30); if(Math.abs(c.x-e.x)<18&&Math.abs(c.y-e.y)<8&&(e.cakeCd||0)<G.t){ e.cakeCd=G.t+1.2; c.hp-=1; c.flash=.1; pop('ням-ням',c.x,c.y-56,'#ff8a8a',7); e.vsHero=Math.random()<.5; } } } }
  if(lv.dropIn) {}
  if(lv.poet&&!lv.poetObj){ lv.poetObj=makeProp('poet',0,FY0+4,{spec:mkSpec({hairStyle:'spiky',hair:'#2a2a2a',top:'#2a2a2a',pants:'#2a2a2a',acc:['mug'],face:{eyeL:3,eyeR:3,seed:5,mouth:'o'}})}); G.ens.push(lv.poetObj); lv.freezeEnemies=e=>lv.poetObj.read&&!e.T.peaceful&&!e.boss&&!e.isProp; }
  if(lv.poetObj&&G.camLock) lv.poetObj.x=(G.camLock[0]+G.camLock[1])/2;
}
function twistDraw(lv,layer){ if(layer==='front'&&lv.stage){ for(let i=0;i<Math.ceil(W/14)+1;i++){ const x=i*14-((G.cam*1.3)%14), j=Math.sin(G.t*(lv.cheer>0?14:2)+i)*(lv.cheer>0?3:1); const c=['#3a2a4a','#2a2a3a','#4a2a3a'][i%3]; ctx.fillStyle=c; ctx.fillRect(Math.round(x),H-9+Math.round(j),11,12); ctx.fillRect(Math.round(x+2),H-15+Math.round(j),7,7); if(lv.cheer>0&&i%3===0){ ctx.fillStyle='#ffd0a8'; ctx.fillRect(Math.round(x),H-22+Math.round(j),2,6);} } }
  if(layer==='back'&&lv.board){ const bx=Math.round(W*.55), by=FY0-96; lv.boardRect=[bx-6,by-6,bx+176,by+56]; ctx.fillStyle=P.ink; ctx.fillRect(bx-2,by-2,170,52); ctx.fillStyle='#101418'; ctx.fillRect(bx,by,166,48); G.labels.push(['ВЫЛЕТ   ВАГОН   СТАТУС',bx+83,by+8,6,'#ffd23f','center',null,0,'board']);
    const rows=lv.board; rows.forEach((r,i)=>{ const blink=r[1]==='ПОСАДКА'&&Math.floor(G.t*3)%2; G.labels.push([r[0]+'  '+r[1],bx+83,by+20+i*12,6,blink?'#fff':r[1]==='ЗАДЕРЖАН'?'#ff6a6a':'#9aff9a','center',null,0,'board']); }); }
  if(layer==='front'){
    if(lv.dark){ const on=(G.t%2)<1.25; if(!on){ ctx.fillStyle='#0b0812f0'; ctx.fillRect(0,0,W,H); for(const e of [G.hero,...liveEnemies()]){ const sx=Math.round(e.x-G.cam), sy=Math.round(e.y-e.z-(e===G.hero?42:40)); ctx.fillStyle='#fff'; ctx.fillRect(sx-3,sy,3,3); ctx.fillRect(sx+2,sy,2,2); ctx.fillStyle=P.ink; ctx.fillRect(sx-2,sy+1,1,1); ctx.fillRect(sx+2,sy+1,1,1);} } }
    if(lv.stage&&G.camLock){ const l=G.camLock[0]-G.cam, r=G.camLock[1]-G.cam; ctx.fillStyle='#a8203a'; const op=Math.min(1,(G.t-(lv.stageT||0))*1.5); const cw=Math.round((W/2)*(1-op)); ctx.fillRect(0,0,cw+10,H); ctx.fillRect(W-cw-10,0,cw+10,H); ctx.fillRect(0,0,W,12); ctx.fillStyle='#7a1028'; for(let x=0;x<W;x+=10) ctx.fillRect(x,0,4,12); ctx.globalAlpha=.12; ctx.fillStyle='#fff6c0'; const hx=G.hero.x-G.cam; ctx.beginPath(); ctx.moveTo(hx-6,0); ctx.lineTo(hx+6,0); ctx.lineTo(hx+30,H); ctx.lineTo(hx-30,H); ctx.fill(); ctx.globalAlpha=1; } }
  if(layer==='back'&&lv.bg==='car'&&lv.doors){ for(const d of lv.doors){ const sx=Math.round(d-G.cam*.7-(d*.3)), st=lv.doorState(d); const dx=Math.round(d-G.cam); if(dx<-40||dx>W+40) continue; const op=st==='open'?12:st==='closing'?Math.round(12*(1-((G.t+d*.01)%8-3))):0;
      ctx.fillStyle=P.ink; ctx.fillRect(dx-16,FY0-60,32,60); ctx.fillStyle='#1a1424'; ctx.fillRect(dx-14,FY0-58,28,58); ctx.fillStyle='#b8b0a0'; ctx.fillRect(dx-14,FY0-58,14-op,58); ctx.fillRect(dx+op,FY0-58,14-op,58); ctx.fillStyle='#8a8070'; ctx.fillRect(dx-14,FY0-40,14-op,10); ctx.fillRect(dx+op,FY0-40,14-op,10);
      ctx.fillStyle=st==='closing'?(Math.floor(G.t*8)%2?P.red:'#600'):st==='open'?P.neonLime:'#444'; ctx.fillRect(dx-2,FY0-64,4,3); if(st==='closing'&&Math.abs(dx-W/2)<W/2) G.labels.push(['двери закрываются',dx,FY0-70,5,'#ffd0d0']); } }
  if(layer==='back'&&lv.poles&&lv.poles.length){ for(const px of lv.poles){ const sx=Math.round(px-G.cam); ctx.fillStyle=P.ink; ctx.fillRect(sx-2,0,4,FY1); ctx.fillStyle='#d8d8e8'; ctx.fillRect(sx-1,0,2,FY1); ctx.fillStyle='#fff'; ctx.fillRect(sx-1,0,1,FY1); } }
}
