'use strict';
// ================= ВРАГИ =================
const EN={
  polite:{n:'«Можно пройти?»',hp:3,spd:42,dmg:1,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'cap',hair:'#3a4a6a',top:'#8a9aaa',pants:'#3a3a4a',face:{eyeL:2,eyeR:2,mouth:'o',seed:ri(0,9)}}),polite:true},
  bag:{n:'Человек с огромной сумкой',hp:5,spd:30,dmg:1.5,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'bald',top:'#6a8a4a',pants:'#4a3a2a',headR:6,bodyW:8,bodyH:9,legH:7,acc:['hugebag'],face:{eyeL:3,eyeR:3,seed:ri(0,9),stubble:1}}),shield:true},
  aunt:{n:'Тётка с баулами',hp:5,spd:34,dmg:1.5,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'scarf',hair:'#d84a3a',top:'#3a6a3a',belly:'#4a8a4a',pants:'#3a2a4a',bodyW:14,bodyH:12,legH:7,acc:['bauls'],face:{eyeL:2,eyeR:3,seed:ri(0,9),mouth:'smug',blush:1}}),spinner:true,drop:'baul'},
  musician:{n:'Уличный музыкант',hp:4,spd:20,dmg:1,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'spiky',hair:'#d8a03a',top:'#2a2a2a',pants:'#3a5aa8',acc:['guitar'],face:{eyeL:2,eyeR:2,seed:ri(0,9),mouth:'o'}}),ranged:'note',drop:'coin'},
  courier:{n:'Курьер-злодей',hp:4,spd:50,dmg:1.5,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'helmet',hair:'#ffd23f',top:'#2a8a5a',pants:'#2a2a3a',acc:['box'],face:{eyeL:3,eyeR:2,seed:ri(0,9),tooth:1}}),charger:true},
  sleeper:{n:'Спящий работяга',hp:5,spd:36,dmg:2,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'short',hair:'#5a4a3a',top:'#5a6a7a',pants:'#3a3a4a',bodyW:12,face:{eyeL:1,eyeR:1,seed:ri(0,9),stubble:1}}),sleeper:true},
  kid:{n:'Школота с телефоном',hp:3,spd:38,dmg:.5,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'hood',hair:'#ff7a3a',top:'#ff7a3a',pants:'#2a3a6a',headR:7,bodyH:9,legH:8,acc:['phone','headphones'],face:{eyeL:2,eyeR:2,seed:ri(0,9),look:1}}),walker:true},
  seeds:{n:'Бабушка с семечками',hp:3,spd:24,dmg:.5,spec:()=>mkSpec({skin:'#f2c49a',hairStyle:'scarf',hair:'#5a7ad8',top:'#7a5a3a',belly:'#8a6a4a',pants:'#3a2a2a',bodyW:12,legH:6,acc:['seeds'],face:{eyeL:2,eyeR:2,seed:ri(0,9),mouth:'smug'}}),ranged:'husk'},
  trainee:{n:'Контролёр-стажёр',hp:4,spd:52,dmg:1,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'short',hair:'#2a2a2a',top:'#3a3a5a',pants:'#2a2a3a',acc:['whistle'],face:{eyeL:3,eyeR:3,seed:ri(0,9),mouth:'o'}}),whistle:true},
  mom:{n:'Мама с коляской',hp:99,spd:22,dmg:0,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'bun',hair:'#a05a2a',top:'#e8a0c8',pants:'#5a5a8a',acc:['stroller'],face:{eyeL:2,eyeR:2,seed:ri(0,9),blush:1}}),peaceful:true},
  student:{n:'Студент с тортом',hp:99,spd:20,dmg:0,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'short',hair:'#8a5a2a',top:'#3a4a6a',pants:'#2a2a3a',acc:['gradcap'],face:{eyeL:2,eyeR:2,seed:ri(0,9),blush:1}}),peaceful:true},
  cat:{n:'Кот',hp:1,spd:30,dmg:.5,cat:true},
  dancer:{n:'Кривляка-повторюша',hp:4,spd:44,dmg:1,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'spiky',hair:'#ff4fa3',top:'#ff4fa3',pants:'#2a2a2a',acc:['headphones'],face:{eyeL:3,eyeR:2,seed:ri(0,9),tooth:1}}),mimic:true},
  statue:{n:'Ожившая скульптура',hp:9,spd:18,dmg:2.5,spec:()=>mkSpec({skin:'#c8a868',hair:'#a88848',hairStyle:'cap',top:'#b89858',pants:'#a88848',shoes:'#987838',bodyW:13,bodyH:12,face:{eyeL:2,eyeR:2,seed:ri(0,9)}}),stone:true},
  tourist:{n:'Турист с чемоданом',hp:3,spd:40,dmg:1,spec:()=>mkSpec({skin:pick(P.skin),hairStyle:'cap',hair:'#ff7a1a',top:'#ffef5a',pants:'#3a8ad8',face:{eyeL:3,eyeR:3,seed:ri(0,9),mouth:'o',blush:1}})},
};
const KO_GAG={polite:'«Извините…»',bag:'застрял в сумке',aunt:'капуста!',musician:'блямм…',courier:'заказ отменён',sleeper:'zzz…',kid:'НЕЕЕТ, ТЕЛЕФОН',seeds:'тьфу',trainee:'ик-свисть',dancer:'лунная походка',statue:'в музей',tourist:'где выход?'};
function makeEnemy(type,x,y,o={}){ const T=EN[type]; const e=new Actor(x,y,T.spec?T.spec():null); Object.assign(e,{type,T,hp:T.hp,maxhp:T.hp,spd:T.spd*rnd(.9,1.1),dmg:T.dmg,cd:rnd(.6,1.6),tele:0,atkWind:T.charger?.6:.35},o);
  if(T.sleeper) e.set('sleep'); if(T.stone) e.stone=true; if(T.peaceful) e.noHit=false;
  e.onLand=v=>{ if(e.st==='fly'){ e.set('down'); e.vx*=.3; parts(e.x,e.y,0,6,'#ccc',50,30,.4); e.sq=1.4; shake(1); } };
  if(T.shield) e.onHit=(d,kx,heavy,kind)=>{ if(!heavy&&kind!=='slide'&&kind!=='super'&&kind!=='spin'&&Math.sign(kx)===-Math.sign(e.face)&&e.st!=='hurt'){ pop('ДЗЫНЬ',e.x,e.y-40,'#ccc',7); SFX.whiff(); e.vx=kx*.2; e.flash=.05; return false; } };
  if(T.peaceful) e.free=true;
  if(T.peaceful) e.onHit=()=>{ G.score=Math.max(0,G.score-100); pop(type==='mom'?'Совсем уже?! −100':'Э, торт! −100',e.x,e.y-50,'#ff8a8a',8); SFX.hurt(); G.stats.rude=(G.stats.rude||0)+1; return false; };
  if(T.sleeper) e.onHit=()=>{ if(e.st==='sleep'){ e.angry=true; e.dmg*=2; e.spd*=1.3; pop('ЧЁ?!',e.x,e.y-50,P.red,10); } };
  return e; }
function liveEnemies(){ return G.ens.filter(e=>!e.dead&&e.st!=='ko'&&e.st!=='rail'&&e.st!=='pass'&&!e.T.peaceful&&!e.T.cat&&!e.boss&&!e.isProp); }
function enemyUpdate(e,dt){ const h=G.hero, T=e.T, lv=G.lv;
  if(e.boss) return bossUpdate(e,dt);
  if(e.isProp) return propUpdate(e,dt);
  const dx=h.x-e.x, dy=h.y-e.y, adx=Math.abs(dx);
  if(e.slip>0){ e.slip-=dt; }
  if(e.koed&&e.st!=='ko'&&e.st!=='rail'){ e.set('ko'); e.ko=true; e.koT=0; e.z=0; e.vz=0; }
  if(e.hp<=0&&!e.koed&&!e.boss){ e.deadT=(e.deadT||0)+dt; if(e.deadT>1.6){ e.z=0; e.vz=0; koEnemy(e); return; } }
  if(lv.freezeEnemies&&lv.freezeEnemies(e)&&e.st!=='fly'&&e.st!=='down'&&e.st!=='ko'){ e.vx=0;e.vy=0;e.tele=0; e.poseOv=['cheer',Math.floor(G.t*6)%4]; e.phys(dt); return; } else e.poseOv=null;
  switch(e.st){
    case 'sleep': e.vx=0; e.vy=0; if(Math.random()<dt*.8) pop('z',e.x+6,e.y-46,'#aaf',6,1.2); if(e.wake){ e.wake=false; e.set('idle'); e.angry=true; pop('ЧЁ?!',e.x,e.y-50,P.red,9); } break;
    case 'idle': case 'walk': {
      if(T.peaceful){ e.face=e.dir||1; e.vx=e.face*e.spd; e.vy=0; e.set('walk'); if(!e.escort&&(e.x>G.cam+W+40||e.x>lv.len+30)) e.dead=true; break; }
      if(T.cat){ e.vx=Math.sin(G.t*2+e.x)*25; e.vy=Math.cos(G.t*1.7+e.x)*15; e.face=e.vx>0?1:-1; if(adx<8&&Math.abs(dy)<6&&h.z===0&&h.st==='walk'&&e.cd<=0){ e.cd=2; pop('ШШШ!',e.x,e.y-20,'#fff',8); SFX.squeak(); hurtHero(.5,-h.face*60,false); } e.cd-=dt; break; }
      if(T.walker){ e.face=e.dir||-1; e.vx=e.face*e.spd; e.vy=0; e.set('walk'); if(adx<12&&Math.abs(dy)<8&&e.cd<=0){ e.cd=1.5; hurtHero(e.dmg,e.face*80,false); pop('ой',e.x,e.y-50,'#fff',7);} e.cd-=dt; if((G.camLock&&(e.x<=G.camLock[0]+7||e.x>=G.camLock[1]-7))||e.x<G.cam-60||e.x>G.cam+W+60) { e.face*=-1; e.dir=e.face; e.x+=e.face*4; } break; }
      e.cd-=dt; e.face=dx>0?1:-1;
      const want=T.ranged?70:16; let tx=h.x-Math.sign(dx||1)*want, ty=h.y;
      // ограничение: не больше двух атакуют одновременно
      const close=G.ens.filter(o=>o!==e&&!o.dead&&o.st==='atk').length;
      if(close>=2&&!T.ranged) { tx=h.x-Math.sign(dx||1)*44; ty=h.y+(e.x%2?14:-14); }
      const ddx=tx-e.x, ddy=ty-e.y; const sp=e.spd*(e.angry?1.2:1)*(lv.rocking?1:1);
      if(Math.abs(ddx)>3||Math.abs(ddy)>2){ e.vx=clamp(ddx*3,-sp,sp); e.vy=clamp(ddy*3,-sp*.6,sp*.6); e.set('walk'); } else { e.vx=0; e.vy=0; e.set('idle'); }
      if(e.cd<=0&&((T.ranged&&adx<150&&Math.abs(dy)<10)||(!T.ranged&&adx<26&&Math.abs(dy)<8)||(T.charger&&adx<140&&Math.abs(dy)<8))){ e.set('atk'); e.tele=e.atkWind; e.vx=0; e.vy=0; e.hitDone=false;
        e.atkPose=T.spinner?'spin':T.charger?'dash':pick(['p1','p2']); if(T.polite) { e.bubble=1.1; e.tele=0; e.atkWind=1.1; } }
      break; }
    case 'atk': { e.tele=Math.max(0,e.tele-dt);
      if(T.polite&&e.bubble>0){ e.bubble-=dt; e.vx=0; if(e.politeYes){ e.politeYes=false; e.bubble=0; e.set('pass'); G.score+=50; pop('Вежливость +50',e.x,e.y-56,P.neonLime,8); G.stats.polite=(G.stats.polite||0)+1; quest('polite'); if(G.stats.polite%3===0) namedCombo('ВЕЖЛИВЫЙ',300); break; } }
      if(!e.hitDone&&e.stT>=e.atkWind){ e.hitDone=true;
        if(T.ranged){ G.fx.push({k:T.ranged,x:e.x+e.face*10,y:e.y,z:T.ranged==='note'?26:22,vx:e.face*(T.ranged==='note'?90:140),t:0,own:'en',dmg:e.dmg}); SFX.whiff(); }
        else if(T.charger){ e.vx=e.face*230; e.chT=.55; }
        else if(T.spinner){ if(Math.abs(h.x-e.x)<30&&Math.abs(h.y-e.y)<12&&h.z<20) hurtHero(e.dmg,(h.x>e.x?1:-1)*120,true); }
        else if(T.whistle){ pop('ФЬЮТЬ!',e.x,e.y-50,'#fff',9); SFX.squeak(); for(const o of G.ens) if(!o.dead&&o.st==='sleep') o.wake=true; if(Math.abs(h.x-e.x)<26&&Math.abs(h.y-e.y)<9) hurtHero(e.dmg,e.face*60,false); }
        else if(Math.abs(h.x-e.x)<26&&Math.abs(h.y-e.y)<9&&h.z<22) hurtHero(e.dmg,e.face*80,T.polite); }
      if(T.charger&&e.chT>0){ e.chT-=dt; if(Math.abs(h.x-e.x)<12&&Math.abs(h.y-e.y)<9&&h.z<15) hurtHero(e.dmg,e.face*150,true); if(e.chT<=0){ e.vx=0; } }
      else if(!T.charger) e.vx*=.8;
      if(e.stT>e.atkWind+.35+(T.charger?.5:0)){ e.set('idle'); e.cd=rnd(1,2.2)/Math.sqrt(e.diffK||1); }
      break; }
    case 'pass': e.noHit=true; e.vy=(e.y<(FY0+FY1)/2?20:-20); e.vx=e.face*55; e.poseOv=['walk',Math.floor(G.t*10)%8]; if(e.x<G.cam-40||e.x>G.cam+W+40) e.dead=true; break;
    case 'hurt': e.vx*=.85; e.vy=0; if(e.stT>.28) { e.set('idle'); if(e.T.sleeper) e.angry=true; } break;
    case 'fly': if(e.z<=0&&e.vz<=0&&e.stT>.12&&e.st==='fly'){ e.onLand(0); } if(G.camLock&&(e.x<G.camLock[0]-30||e.x>G.camLock[1]+30)){ e.x=clamp(e.x,G.camLock[0]+8,G.camLock[1]-8); } if(lv.bg==='station'&&e.y<FY0+7&&e.vy<5&&e.z<10&&e.stT>.15){ e.set('rail'); e.vz=60; G.score+=150; pop('УЕХАЛ НА РЕЛЬСЫ +150',e.x,e.y-50,P.edge,8); } break;
    case 'down': e.vx*=.85; e.vy=0; if(e.stT>.75){ if(e.hp<=0) koEnemy(e); else { e.set('idle'); e.inv=.4; e.cd=rnd(.6,1.2);} } break;
    case 'ko': e.koT=(e.koT||0)+dt; if(e.koT>1.7) e.dead=true; break;
    case 'rail': e.y-=dt*30; e.z=Math.max(0,e.z); if(e.stT>1){ e.dead=true; koEnemy(e,true);} break;
  }
  if(e.slip>0&&e.st!=='fly'){ e.vx*=1.02; e.rot=Math.sin(G.t*20)*.1; } else e.rot=0;
  e.phys(dt);
}
function koEnemy(e,quiet){ if(e.koed) return; e.koed=true; if(!quiet){ e.set('ko'); e.koT=0; e.ko=true; } SFX.ko(); G.score+=100; G.stats.kos=(G.stats.kos||0)+1; quest('ko');
  const g=KO_GAG[e.type]; if(g&&!quiet) pop(g,e.x,e.y-30,'#ffe0f0',7,1.4);
  // дроп
  const T=e.T; if(T.drop==='baul') G.items.push({k:'baul',w:true,x:e.x,y:e.y,z:20,vz:100});
  if(T.drop==='coin'||Math.random()<.5) for(let i=0;i<(T.drop==='coin'?5:ri(1,2));i++) G.items.push({k:'coin',x:e.x+rnd(-12,12),y:clamp(e.y+rnd(-6,6),FY0+3,FY1),z:10,vz:rnd(60,120)});
  const hh=G.hero, pity=hh&&hh.hp<hh.maxhp*.4&&!G.items.some(i=>!i.dead&&i.k==='pie'); if(pity&&Math.random()<.35) G.items.push({k:'pie',x:e.x,y:e.y,z:10,vz:80}); else if(Math.random()<.12) G.items.push({k:pick(['pie','pie','coffee2','energy']),x:e.x,y:e.y,z:10,vz:80});
  if(e.type==='aunt') parts(e.x,e.y,10,12,['#7ad84a','#5ab83a','#c8f0a0'],80,120,.9,2);
  if(e.elbow&&G.lv.bg==='car'&&G.lv.doorOpenNear&&G.lv.doorOpenNear(e.x)) namedCombo('ЛОКОТЬ → РЮКЗАК → ДВЕРИ',500);
}
// снаряды
function updProj(dt){ const h=G.hero;
  for(const p of G.fx){ p.t+=dt; p.x+=p.vx*dt; if(p.vz!==undefined){ p.vz-=GRAV*dt; p.z+=p.vz*dt; }
    if(p.own==='deco'){ p.vz=(p.vz||0); if(p.z<=0) p.dead=true; }
    else if(p.own==='en'){ if(Math.abs(p.x-h.x)<8&&Math.abs(p.y-h.y)<9&&Math.abs(p.z-(h.z+20))<20){ p.dead=true; if(p.k==='note'){ if(!h.stunNote) { hurtHero(p.dmg*.5,Math.sign(p.vx)*40,false); pop('♪ ОГЛУШЁН ♪',h.x,h.y-60,'#fff',7); } } else hurtHero(p.dmg,Math.sign(p.vx)*40,false); } }
    else if(p.k==='spit'){ hitTest({x:p.x-Math.sign(p.vx)*4,y:p.y,z:0,face:Math.sign(p.vx)},10,10,40,e=>{ if(p.dead) return; p.dead=true; dmgEnemy(e,1.2,Math.sign(p.vx)*80,60,false,'spit'); e.slip=1.5; parts(p.x,p.y,20,8,['#7a4a2a','#a0703a'],60,60,.5); }); }
    else if(p.k==='thrown'){ hitTest({x:p.x-Math.sign(p.vx)*6,y:p.y,z:0,face:Math.sign(p.vx)},14,12,60,e=>{ if(p.hit.has(e)) return; p.hit.add(e); dmgEnemy(e,3,Math.sign(p.vx)*180,170,true,'throw'); if(p.hit.size>=3) namedCombo('КЕГЛИ! СТРАЙК',300); }); if(p.z<=0){ p.dead=true; parts(p.x,p.y,4,14,['#7ad84a','#5ab83a','#fff'],90,120,.8,2); SFX.heavy(); } }
    else if(p.k==='jar'){ p.y=p.ty; if(p.z<=0){ p.dead=true; parts(p.x,p.y,4,16,['#8ad86a','#5ab83a','#e8e0c0','#fff'],90,110,.8,2); SFX.heavy(); shake(2); pop('ХРУСЬ',p.x,p.y-20,'#8ad86a',8); if(Math.abs(h.x-p.x)<16&&Math.abs(h.y-p.y)<9&&h.z<10) hurtHero(1.5,Math.sign(h.x-p.x||1)*120,true); } }
    if(p.t>2.5||p.x<G.cam-30||p.x>G.cam+W+30) p.dead=true; }
  G.fx=G.fx.filter(p=>!p.dead); }
function drawProj(p){ const sx=Math.round(p.x-G.cam), sy=Math.round(p.y-p.z);
  if(p.k==='note'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-2,sy-2,5,5); ctx.fillStyle='#fff'; ctx.fillRect(sx-1,sy-1,3,3); ctx.fillRect(sx+1,sy-6,1,5); G.labels.push(['♪',sx,sy-8,7,pick(['#fff','#ffd23f','#ff7ab8'])]); }
  else if(p.k==='husk'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-1,sy-1,4,3); ctx.fillStyle='#e8e0c0'; ctx.fillRect(sx,sy,2,1); }
  else if(p.k==='spit'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-4,sy-3,8,6); ctx.fillStyle='#8a5a2a'; ctx.fillRect(sx-3,sy-2,6,4); ctx.fillStyle='#c09060'; ctx.fillRect(sx-2,sy-2,2,1); }
  else if(p.k==='thrown'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-6,sy-6,12,11); ctx.fillStyle=P.white; ctx.fillRect(sx-5,sy-5,10,9); ctx.fillStyle=p.col; for(let i=-5;i<5;i+=3) ctx.fillRect(sx+i,sy-5,1,9); }
  else if(p.k==='jar'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-4,sy-6,9,11); ctx.fillStyle='#8ad86a'; ctx.fillRect(sx-3,sy-5,7,9); ctx.fillStyle='#e8e0c0'; ctx.fillRect(sx-3,sy-6,7,2); }
  else if(p.k==='card'){ ctx.fillStyle=P.ink; ctx.fillRect(sx-5,sy-3,10,7); ctx.fillStyle='#ff4fa3'; ctx.fillRect(sx-4,sy-2,8,5); ctx.fillStyle='#fff'; ctx.fillRect(sx-2,sy-1,4,1); }
}
