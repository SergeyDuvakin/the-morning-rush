'use strict';
// ================= ГЕРОЙ =================
const HEROES={
  serega:{name:'Серёга',spec:()=>HERO_SPECS.serega,hp:12,spd:74,dmg:1,reach:22,superName:'КОФЕЙНЫЙ ПЛЕВОК'},
  baba:{name:'Бабка Зинаида',spec:()=>HERO_SPECS.baba,hp:15,spd:60,dmg:1.4,reach:28,superName:'А МНЕ ВЫХОДИТЬ!'},
};
function makeHero(id,x,y){ const d=HEROES[id]; const h=new Actor(x,y,d.spec()); h.id=id; h.def=d; h.hp=h.maxhp=d.hp; h.chain=0; h.chainT=0; h.buf=null; h.weapon=null; h.lastMove=null;
  h.onLand=v=>{ h.sq=1.35; SFX.land(); parts(h.x,h.y,0,5,'#bbb',40,30,.3); if(h.st==='jump') h.set('idle'); h.airAtk=false; };
  return h; }
const WEAPONS={
  umbrella:{n:'Мокрый зонт',uses:10,reach:32,dmg:1.5,col:'#2a6ad8'},
  coffee:{n:'Кофе-плевок',uses:6,ranged:true,dmg:1.2,col:'#7a4a2a'},
  scooter:{n:'Самокат-подкат',uses:5,dmg:2,col:'#3ff0ff'},
  baton:{n:'Батон',uses:12,reach:24,dmg:.8,fast:true,col:'#e0b060'},
  baul:{n:'Баул',uses:1,throw:true,dmg:3,col:'#d83a6f'},
  pan:{n:'Сковородка',uses:9,reach:24,dmg:1.6,col:'#444'},
};
function heroAct(h,ev){ // события ввода
  if(h.st==='hurt'||h.st==='fly'||h.st==='down'||h.st==='super'||h.st==='cheer') { if(ev==='tap') h.buf='tap'; return; }
  if(ev==='tap'){ if(h.z>0){ if(!h.airAtk){ h.airAtk=true; h.vx=h.face*60; attackBox(h,24,14,40,1.2,90,140,true,'air'); } return; }
    if(h.st==='atk'&&h.stT<h.atkLen*.6){ h.buf='tap'; return; }
    startAttack(h); }
  else if(ev==='up'){ if(h.z===0&&h.st!=='slide'){ h.set('jump'); h.vz=205; h.sq=.7; SFX.jump(); } }
  else if(ev==='down'){ if(h.z===0){ h.set('slide'); h.vx=h.face*(G.lv&&G.lv.syrup?260:170); h.slideHit=new Set(); SFX.whiff(); parts(h.x,h.y,0,6,'#ccc',30,20,.3); G.stats.slides=(G.stats.slides||0)+1; } }
  else if(ev==='left'||ev==='right'){ const d=ev==='right'?1:-1; if(h.z===0){ h.face=d; h.set('dash'); h.vx=d*(h.weapon&&h.weapon.k==='scooter'?300:210); h.dashHit=new Set(); SFX.whiff(); h.lastMove='dash'; h.lastMoveT=G.t;
      if(h.weapon&&h.weapon.k==='scooter') useWeapon(h); } }
  else if(ev==='release'){ if(h.z===0){ h.set('spin'); h.spinHit=new Set(); SFX.heavy(); shake(2); h.lastMove='spin'; h.lastMoveT=G.t; } }
  else if(ev==='super'){ if(G.rage>=100){ G.rage=0; h.set('super'); h.inv=1.6; SFX.super(); haptic('heavy'); shake(4); say(h.def.superName,1.6,P.edge); G.stats.supers=(G.stats.supers||0)+1; quest('super'); } }
}
function startAttack(h){ // авто-разворот к ближайшему врагу, если стик в покое
  const sv=stickVec(); if(Math.abs(sv.x)<.2){ let best=null,bd=60; for(const e of G.ens){ if(e.dead||e.noHit||e.st==='ko') continue; const d=Math.abs(e.x-h.x)+Math.abs(e.y-h.y)*2; if(d<bd){bd=d;best=e;} } if(best) h.face=best.x>h.x?1:-1; }
  const w=h.weapon&&WEAPONS[h.weapon.k];
  if(w&&w.ranged){ h.set('atk'); h.atkPose='p1'; h.atkLen=.3; h.atkWind=.08; G.fx.push({k:'spit',x:h.x+h.face*12,y:h.y,z:24,vx:h.face*230,t:0,own:'hero'}); SFX.whiff(); useWeapon(h); return; }
  if(w&&w.throw){ h.set('atk'); h.atkPose='p3'; h.atkLen=.35; h.atkWind=.1; G.fx.push({k:'thrown',x:h.x+h.face*10,y:h.y,z:28,vx:h.face*240,vz:60,t:0,col:w.col,hit:new Set()}); useWeapon(h); return; }
  if(h.chainT<=0) h.chain=0; h.chain=h.chain%3+1;
  h.set('atk'); h.atkPose='p'+h.chain; h.atkLen=h.chain===3?.36:(w&&w.fast?.16:.22); h.atkWind=h.chain===3?.12:.06; h.hitDone=false; h.chainT=.6;
  if(h.lastMove==='dash'&&G.t-h.lastMoveT<.8&&h.chain===3) h.elbowCombo=true; }
function useWeapon(h){ if(!h.weapon) return; h.weapon.uses--; if(h.weapon.uses<=0){ const w=WEAPONS[h.weapon.k]; pop(w.n+' — всё!',h.x,h.y-60,'#ffb0b0',7); parts(h.x+h.face*10,h.y,24,10,w.col,60,80,.6,2); h.weapon=null; SFX.ko(); } }
function attackBox(h,reach,depth,zr,dmg,kx,kz,heavy,kind){ return hitTest(h,reach,depth,zr,e=>{ dmgEnemy(e,dmg,h.face*kx,kz,heavy,kind); if(kind==='p3'&&h.elbowCombo) e.elbow=G.t; }); }
function heroUpdate(h,dt){ const d=h.def; h.chainT-=dt;
  const sv=stickVec(); const free=h.st==='idle'||h.st==='walk'||h.st==='jump';
  if(free){ const sp=d.spd*(G.coffeeT>0?1.35:1)*(h.slow||1); h.vx=sv.x*sp; h.vy=sv.y*sp*.62; if(Math.abs(sv.x)>.15) h.face=sv.x>0?1:-1;
    if(h.z===0) h.set(Math.hypot(sv.x,sv.y)>.15?'walk':'idle'); }
  else if(h.st==='atk'){ h.vx*=.8; h.vy=0;
    if(!h.hitDone&&h.stT>=h.atkWind){ h.hitDone=true; const w=h.weapon&&WEAPONS[h.weapon.k]; const reach=w&&w.reach||d.reach, heavy=h.chain===3, dm=(w?w.dmg:1)*d.dmg*(heavy?1.6:1);
      const n=attackBox(h,reach,12,30,dm,heavy?150:60,heavy?150:0,heavy,'p'+h.chain); if(n){ if(w) useWeapon(h); h.vx=h.face*20; } else SFX.whiff(); }
    if(h.stT>=h.atkLen){ h.set('idle'); h.elbowCombo=false; if(h.buf==='tap'){ h.buf=null; startAttack(h);} } }
  else if(h.st==='slide'){ h.vx*=Math.pow(G.lv&&G.lv.syrup?.35:.08,dt); h.vy=0; hitTest(h,16,12,12,e=>{ if(h.slideHit.has(e)) return; h.slideHit.add(e); dmgEnemy(e,1,h.face*40,170,true,'slide'); });
    if(h.stT>.42){ h.set('idle'); h.vx=0; } }
  else if(h.st==='dash'){ h.vx*=Math.pow(.02,dt); hitTest(h,18,12,20,e=>{ if(h.dashHit.has(e)) return; h.dashHit.add(e); dmgEnemy(e,.7,h.face*170,70,false,'dash'); e.vx=h.face*170; });
    if(h.stT>.28){ h.set('idle'); h.vx=0; } }
  else if(h.st==='spin'){ h.vx=0; h.face=Math.floor(h.stT*20)%2?1:-1; if(h.stT>.08&&h.stT<.4){ for(const e of G.ens){ if(e.dead||e.noHit||h.spinHit.has(e)||e.st==='ko') continue; if(Math.abs(e.x-h.x)<30&&Math.abs(e.y-h.y)<14&&e.z<30){ h.spinHit.add(e); dmgEnemy(e,2*d.dmg,(e.x>h.x?1:-1)*170,160,true,'spin'); } } }
    if(h.stT>.5) h.set('idle'); }
  else if(h.st==='super'){ h.vx=0; h.vy=0; if(h.stT>.35&&!h.superDone){ h.superDone=true; for(const e of G.ens){ if(e.dead||e.noHit) continue; if(Math.abs(e.x-h.x)<W){ dmgEnemy(e,h.id==='baba'?4:3.2,(e.x>h.x?1:-1)*200,190,true,'super'); e.slip=2; } }
      for(let i=0;i<40;i++) parts(h.x,h.y,30,1,h.id==='baba'?['#ff7ab8','#fff']:['#7a4a2a','#a0703a','#fff'],260,160,.9,2); }
    if(h.stT>.9){ h.set('idle'); h.superDone=false; } }
  else if(h.st==='hurt'){ h.vx*=.85; h.vy=0; if(h.stT>.3) h.set('idle'); }
  else if(h.st==='fly'){ if(h.z===0&&h.stT>.1){ h.set('down'); h.vx=0; } }
  else if(h.st==='down'){ h.vx*=.8; if(h.stT>.6){ if(h.hp<=0){ h.set('ko'); } else { h.set('idle'); h.inv=1.2; } } }
  else if(h.st==='cheer'){ h.vx=0; h.vy=0; }
  if(h.st==='jump'&&h.airAtk){ attackBox(h,22,13,40,1.2,90,140,true,'air'); }
  h.phys(dt);
  // подбор предметов
  for(const it of G.items){ if(it.dead) continue; if(Math.abs(it.x-h.x)<10&&Math.abs(it.y-h.y)<9&&h.z<8){ pickItem(h,it); } }
}
function hurtHero(dmg,kx,heavy,src){ const h=G.hero; if(h.inv>0||h.st==='down'||h.st==='ko'||h.st==='fly'||h.st==='super') return false;
  if(G.cheat) dmg=0;
  h.hp-=dmg; G.hurtTaken+=dmg; G.combo=0; h.flash=.2; h.sq=.75; G.rage=Math.min(100,G.rage+dmg*7); SFX.hurt(); haptic(heavy?'heavy':'rigid'); shake(heavy?4:2);
  parts(h.x,h.y,24,6,['#fff','#ffb0b0'],60,90,.4);
  if(heavy||h.hp<=0){ h.set('fly'); h.vx=kx; h.vz=150; h.inv=.4; } else { h.set('hurt'); h.vx=kx*.4; h.inv=.35; }
  if(h.weapon&&heavy){ dropWeapon(h); }
  return true; }
function dropWeapon(h){ if(!h.weapon) return; G.items.push({k:h.weapon.k,x:h.x,y:h.y,z:20,vz:120,uses:h.weapon.uses,w:true}); h.weapon=null; }
function pickItem(h,it){
  if(it.w){ if(h.weapon) return; h.weapon={k:it.k,uses:it.uses||WEAPONS[it.k].uses}; it.dead=true; SFX.pick(); pop(WEAPONS[it.k].n,h.x,h.y-60,P.neonCyan,8); haptic('select'); G.stats.weapons=(G.stats.weapons||0)+1; quest('weapon'); return; }
  it.dead=true;
  if(it.k==='coin'){ G.coins++; SFX.coin(); }
  else if(it.k==='pie'){ h.hp=Math.min(h.maxhp,h.hp+3); SFX.pick(); pop('+пирожок',h.x,h.y-60,'#ffb070',8); }
  else if(it.k==='shawa'){ h.hp=h.maxhp; SFX.pick(); pop('ИК!',h.x,h.y-60,'#ffd23f',9); h.hic=2; }
  else if(it.k==='coffee2'){ G.coffeeT=6; SFX.pick(); pop('БОДРОСТЬ!',h.x,h.y-60,'#c08040',9); }
  else if(it.k==='energy'){ G.rage=100; SFX.pick(); pop('ЗЛОСТЬ 100%',h.x,h.y-60,P.red,9); }
}
// предметы: рисунок
function drawItem(it){ const sx=Math.round(it.x-G.cam), sy=Math.round(it.y-(it.z||0)); if(sx<-12||sx>W+12) return; const bob=Math.sin(G.t*5+it.x)>.3?1:0;
  softShadow(sx,Math.round(it.y),5);
  const y=sy-6-bob; const o=(x,yy,w,h,c)=>{ ctx.fillStyle=P.ink; ctx.fillRect(x-1,yy-1,w+2,h+2); ctx.fillStyle=c; ctx.fillRect(x,yy,w,h); };
  switch(it.k){
    case 'coin': o(sx-3,y-2,6,6,'#ffd23f'); ctx.fillStyle='#b08010'; ctx.fillRect(sx-1,y,2,2); break;
    case 'pie': o(sx-5,y-1,10,5,'#e0a050'); ctx.fillStyle='#ffd090'; ctx.fillRect(sx-3,y,6,1); break;
    case 'shawa': o(sx-3,y-6,6,11,'#f0e0c0'); ctx.fillStyle='#a05a2a'; ctx.fillRect(sx-2,y-7,4,2); break;
    case 'coffee2': o(sx-3,y-5,6,8,P.white); ctx.fillStyle='#7a4a2a'; ctx.fillRect(sx-3,y-2,6,3); break;
    case 'energy': o(sx-2,y-7,5,10,'#3a3aff'); ctx.fillStyle=P.neonLime; ctx.fillRect(sx-1,y-4,3,3); break;
    case 'umbrella': o(sx-8,y-2,16,3,'#2a6ad8'); ctx.fillStyle=P.ink; ctx.fillRect(sx,y-6,1,4); ctx.fillStyle='#5af'; ctx.fillRect(sx-6,y+2,1,2); break;
    case 'coffee': o(sx-3,y-6,6,9,P.white); ctx.fillStyle='#7a4a2a'; ctx.fillRect(sx-3,y-6,6,2); break;
    case 'scooter': o(sx-8,y,16,2,'#3ff0ff'); o(sx+6,y-9,2,9,'#888'); ctx.fillStyle=P.ink; ctx.fillRect(sx-8,y+2,3,3); ctx.fillRect(sx+5,y+2,3,3); break;
    case 'baton': o(sx-8,y-1,16,4,'#e0b060'); ctx.fillStyle='#b08040'; for(let i=-6;i<8;i+=4) ctx.fillRect(sx+i,y,2,1); break;
    case 'baul': o(sx-6,y-6,12,9,P.white); ctx.fillStyle='#d83a6f'; for(let i=-6;i<6;i+=3) ctx.fillRect(sx+i,y-6,1,9); break;
    case 'pan': o(sx-5,y-2,10,4,'#444'); o(sx+5,y-1,7,2,'#7a4a2a'); break;
  }
  if(it.w&&Math.floor(G.t*3)%2) { ctx.fillStyle='#fff'; ctx.fillRect(sx-1,y-12,2,2); }
}
