'use strict';
// ================= ИГРА: сцены, арены, HUD, меню, режим «Выход», катсцены =================
window.APRIL1=(()=>{const d=new Date(); return d.getMonth()===3&&d.getDate()===1;})();
const NIGHT3=()=>{const d=new Date(); return d.getHours()===3;};
let heroId=save.hero||'serega', curLv=null, curIdx=0, paused=false, mapLine=0, mapSel=-1, logoTaps=0;
window.wantsStick=()=>(G.scene==='play'||G.scene==='exit')&&!paused;
window.onBack=()=>{ if(G.scene==='play'||G.scene==='exit'){ paused=!paused; } else if(G.scene==='map') G.scene='title'; };
// ---------- квесты дня ----------
const QUESTS=[['ko',15,'Уложи 15 пассажиров'],['polite',3,'Ответь «Да» трём вежливым'],['weapon',4,'Подбери 4 оружия'],['super',2,'Сделай 2 супера'],['named',1,'Именное комбо'],['boss',1,'Победи босса'],['exit',2,'Выйди на 2 станциях подряд'],['slide',6,'6 подкатов'],['stars',3,'Собери 3 звезды'],['coins',30,'Собери 30 жетонов'],['combo',25,'Комбо 25'],['nohurt',1,'Станция без урона']];
function today(){ const d=new Date(Date.now()+3*3600e3); return d.toISOString().slice(0,10); }
function questsToday(){ const d=today(); if(save.qd!==d){ save.qd=d; let s=[...d].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7); const idx=[]; while(idx.length<3){ s=(s*1103515245+12345)&0x7fffffff; const i=s%QUESTS.length; if(!idx.includes(i)) idx.push(i);} save.q=idx.map(i=>({i,n:0,done:false})); store(); } return save.q; }
function quest(id,n=1){ for(const q of questsToday()){ const Q=QUESTS[q.i]; if(Q[0]===id&&!q.done){ q.n+=n; if(q.n>=Q[1]){ q.done=true; save.coins+=40; say('КВЕСТ: '+Q[2]+' ✓ +40',2.2,P.neonLime); SFX.win(); } } } }
// ---------- старт уровня ----------
function startLevel(idx){ curIdx=idx; const L=LEVELS[idx]; floorBand(); const lv=buildLevel(L); curLv=lv; G.lv=lv;
  Object.assign(G,{ens:[],items:[],fx:[],parts:[],pops:[],cam:0,camLock:null,score:0,coins:0,combo:0,comboT:0,bestCombo:0,rage:0,msg:null,hurtTaken:0,time:0,stats:{},arena:-1,wave:-1,done:false,win:false,lost:false,tilt:0,coffeeT:0,cakeLost:false,moves:new Set(),tut:lv.tutorial?0:-1,doneT:0});
  G.hero=makeHero(heroId,40,(FY0+FY1)/2); G.items=lv.items.map(i=>Object.assign({z:0},i)); G.ens=[...lv.props];
  if(NIGHT3()) G.items.push({k:'pie',x:120,y:FY1-6});
  bgReset(lv); musTheme=L.w; musOn=true; G.scene='play'; paused=false; tgBack(true);
  say('Станция «'+L.name+'»',2.6,'#fff'); setTimeout(()=>{ if(G.lv===lv&&!L.boss) say(L.twistText.split(':')[0].split('—')[0].trim(),3,P.edge); },2700); SFX.ding(); }
function arenaUpdate(dt){ const lv=G.lv, h=G.hero;
  if(G.camLock){ const A=lv.arenas[G.arena];
    if(liveEnemies().length===0&&!G.spawning&&!G.ens.some(e=>e.boss&&!e.dead)){ G.wave++; if(G.wave<A.waves.length) spawnWave(A.waves[G.wave],A); else { // арена пройдена
        G.camLock=null; SFX.doors(); say('Осторожно, двери закрываются! →',1.8,P.edge); haptic('success');
        if(lv.stage){ const n=G.moves.size; G.score+=n*100; pop('АПЛОДИСМЕНТЫ ×'+n+' +'+n*100,h.x,h.y-70,'#ffd23f',9,1.6); SFX.win(); G.moves=new Set(); }
        if(G.arena===lv.arenas.length-1) finishLevel(true); } } }
  else if(!G.done){ const nA=G.arena+1; if(nA<lv.arenas.length&&h.x>lv.arenas[nA].x0+(lv.boss?0:Math.min(W,lv.AW)*.35)){ G.arena=nA; G.wave=-1; G.camLock=[lv.arenas[nA].x0,lv.arenas[nA].x0+Math.min(W,lv.AW)]; lv.arenas[nA].x1=G.camLock[1]; lv.stageT=G.t; lv.peelsAt=0; }
    if(G.arena===lv.arenas.length-1&&!G.camLock&&h.x>lv.len-30) finishLevel(true); }
}
function spawnWave(list,A){ const lv=G.lv; for(const [i,t] of list.entries()){
  if(t.startsWith('boss:')){ const k=t.slice(5); const b=makeBoss(k,(G.camLock[0]+G.camLock[1])/2+60,(FY0+FY1)/2); G.ens.push(b); startCut('boss_'+k); continue; }
  const side=i%2?-1:1; let x=side>0?G.camLock[1]+10+i*8:G.camLock[0]-10-i*8, y=rnd(FY0+6,FY1-2), z=0;
  if(A.fromCols){ const cols=G.ens.filter(c=>c.kind==='column'&&!c.broken&&c.x>G.camLock[0]&&c.x<G.camLock[1]); if(cols.length){ const c=pick(cols); x=c.x+rnd(-4,4); y=FY0+4; } }
  if(lv.dropIn){ x=rnd(G.camLock[0]+30,G.camLock[1]-30); z=150+i*30; }
  const e=makeEnemy(t,x,y); e.z=z; if(z) { e.set('fly'); e.down=false; e.vz=-10; e.hp=e.maxhp; e.onLand=v=>{ e.set('idle'); e.sq=1.4; parts(e.x,e.y,0,8,'#ccc',50,40,.4); shake(1); SFX.land(); pop('ПОСАДКА',e.x,e.y-40,'#fff',6); }; }
  { const d=lv.w*7+lv.i; const k=d<3?.85:1+d*.008; e.dmg*=k; e.maxhp=e.hp=Math.round(e.hp*(1+d*.01)*10)/10; e.spd*=1+d*.012; e.diffK=k; }
  if(t==='walker'||EN[t].walker) e.dir=side>0?-1:1;
  G.ens.push(e); }
  if(lv.sofa&&!G.ens.some(e=>e.kind==='sofa'&&!e.dead)) G.ens.push(Object.assign(makeProp('sofa',G.camLock[0]+30,(FY0+FY1)/2),{dir:1}));
  if(G.lv.w===0&&Math.random()<.25&&!lv.boss) { const m=makeEnemy('mom',G.camLock[0]-20,FY1-3); m.dir=1; G.ens.push(m); }
}
function finishLevel(win){ if(G.done) return; G.done=true; G.win=win; G.doneT=0; const lv=G.lv, h=G.hero;
  if(win){ h.set('cheer'); SFX.win(); musOn=false;
    const st=1+(G.hurtTaken<h.maxhp*.5?1:0)+(G.time<lv.par?1:0); G.stars=st; const k=lv.w+'.'+lv.i; save.stars[k]=Math.max(save.stars[k]||0,st); save.best[k]=Math.max(save.best[k]||0,G.score); save.coins+=G.coins; quest('stars',st); quest('coins',G.coins); if(G.hurtTaken===0) quest('nohurt'); if(G.bestCombo>=25) quest('combo',25);
    if(lv.escort&&!G.cakeLost&&!save.eggs.grad){ save.eggs.grad=true; setTimeout(()=>say('Шмякс защитил диплом! Шапка-магистерка твоя 🎓',3,P.neonLime),400); }
    if(lv.boss==='babatank'&&!save.unlockedBaba){ save.unlockedBaba=true; G.unlockBaba=true; }
    store(); }
  else { musOn=false; } }
// ---------- обновление ----------
let last=performance.now();
function update(dt){ G.t+=dt; musicTick(); input.events=input.events||[];
  if(portrait){ input.events.length=0; return; }
  if(G.scene==='cut') return cutUpdate(dt);
  if(G.scene==='play') playUpdate(dt);
  else if(G.scene==='exit') exitUpdate(dt);
  else { for(const ev of input.events){} }
  input.events.length=0; }
function playUpdate(dt){ const h=G.hero, lv=G.lv; if(window.__botTick&&!paused) window.__botTick(dt); if(lv.cheer>0) lv.cheer-=dt;
  for(const ev of input.events){ if(paused) continue;
    if(ev.t==='tap'){ if(G.done){ continue; } heroAct(h,'tap'); addMove('tap'); tutDo('tap'); }
    else if(ev.t==='swipe'){ const m={up:'up',down:'down',left:'left',right:'right'}[ev.dir]; heroAct(h,m); addMove(m==='left'?'right':m); tutDo(m==='left'?'right':m); }
    else if(ev.t==='release'){ heroAct(h,'release'); addMove('spin'); tutDo('release'); }
    else if(ev.t==='key'){ const c=ev.code; if(c==='KeyJ'||c==='Space') heroAct(h,'tap'); else if(c==='KeyK') heroAct(h,'up'); else if(c==='KeyL') heroAct(h,h.face>0?'right':'left'); else if(c==='KeyI') heroAct(h,'down'); else if(c==='KeyU') heroAct(h,'release'); else if(c==='KeyO') heroAct(h,'super'); else if(c==='Escape') paused=!paused; } }
  if(paused) return;
  if(G.stop>0){ G.stop-=dt; return; }
  G.time+=dt; G.coffeeT=Math.max(0,(G.coffeeT||0)-dt); G.comboT-=dt; if(G.comboT<=0) G.combo=0;
  if(G.msg){ G.msg.t-=dt; if(G.msg.t<=0) G.msg=null; }
  heroUpdate(h,dt); if(h.hic>0){ h.hic-=dt; if(Math.random()<dt*2){ pop('ик',h.x,h.y-50,'#fff',6); h.sq=.85; } }
  // вежливые: кнопка «ДА»
  for(const e of G.ens) enemyUpdate(e,dt);
  G.ens=G.ens.filter(e=>!e.dead);
  for(const it of G.items){ if(it.vz!==undefined&&(it.z>0||it.vz>0)){ it.vz-=GRAV*dt; it.z+=it.vz*dt; if(it.z<0){it.z=0; it.vz=0;} } }
  G.items=G.items.filter(i=>!i.dead);
  updProj(dt); updFX(dt); twistUpdate(lv,dt); bgUpdate(dt,G.cam); arenaUpdate(dt);
  // камера
  let tx=h.x-W*.4+h.face*18; if(G.camLock) tx=clamp(tx,G.camLock[0],G.camLock[1]-W); tx=clamp(tx,0,Math.max(0,lv.len-W)); G.cam+=(tx-G.cam)*Math.min(1,dt*6); if(G.camLock) G.cam=clamp(G.cam,G.camLock[0],Math.max(G.camLock[0],G.camLock[1]-W));
  G.shake=Math.max(0,G.shake-dt*14);
  if(h.st==='ko'&&!G.done){ finishLevel(false); }
  if(G.done){ G.doneT+=dt; if(G.doneT>1.4&&!G.cutDone){ G.cutDone=true; startCut(G.win?'win':'lose'); } }
}
function addMove(m){ const lv=G.lv; if(lv&&lv.stage){ if(!G.moves.has(m)){ G.score+=50; pop('БРАВО!',G.hero.x,G.hero.y-64,'#ffd23f',9); lv.cheer=1.2; SFX.ding(); } lv.rep=(lv.lastM===m)?(lv.rep||0)+1:0; lv.lastM=m; if(lv.rep===7){ pop('ФУУУ! однообразно',G.hero.x,G.hero.y-64,'#ff8a8a',8); G.score=Math.max(0,G.score-50); for(let i=0;i<3;i++) G.fx.push({k:'husk',x:G.cam+rnd(0,W),y:G.hero.y,z:80,vx:0,vz:-60,t:0,own:'deco'}); } } G.moves.add(m); }
// ---------- обучение ----------
const TUT=[['move','Левая половина: веди пальцем — идёшь'],['tap','Тап справа — удар (тапай 3 раза — серия)'],['up','Свайп вверх — прыжок'],['down','Свайп вниз — подкат'],['right','Свайп вбок — рывок-локоть'],['release','Зажми справа и отпусти — рюкзак-вертушка']];
function tutDo(m){ if(G.tut>=0&&G.tut<TUT.length&&TUT[G.tut][0]===m){ G.tut++; SFX.ui(); haptic('select'); } }
// ---------- рендер игры ----------
function drawPlay(){ const lv=G.lv, h=G.hero; G.labels=[]; G.occ=[]; G.bgLabN=0; buttons=[];
  const shx=G.shake>0?Math.round(rnd(-G.shake,G.shake)):0, shy=G.shake>0?Math.round(rnd(-G.shake,G.shake)*.6):0;
  ctx.save(); ctx.translate(shx,shy); if(G.tilt) { ctx.translate(W/2,H/2); ctx.rotate(G.tilt*Math.PI/180); ctx.translate(-W/2,-H/2); }
  drawBG(G.cam); twistDraw(lv,'back');
  if(NIGHT3()){ ctx.fillStyle='#c87a2a88'; ctx.fillRect(Math.round(200-G.cam),FY1-14,60,8); G.labels.push(['липтон-потоп',230-G.cam,FY1-20,5,'#ffd0a0','center',0,1]); }
  G.bgLabN=G.labels.length;
  for(const it of G.items) drawItem(it);
  drawPigeons(G.cam);
  const list=[h,...G.ens].sort((a,b)=>a.y-b.y);
  for(const a of list){ if(a.isProp||!a.spec&&!a.boss){ if(a.type==='cat'){ a.kind='cat'; } drawProp(a); continue; }
    if(a.boss==='turnstile'){ drawBossExtra(a); continue; }
    drawActor(a,(sx,sy)=>{ if(a.boss) drawBossExtra(a);
      if(a===h&&h.weapon){ const w=WEAPONS[h.weapon.k]; ctx.fillStyle=P.ink; ctx.fillRect(sx-7,sy-58,14,4); ctx.fillStyle=w.col; ctx.fillRect(sx-6,sy-57,12*h.weapon.uses/w.uses,2); }
      if(a.T&&a.T.polite&&a.bubble>0){ const bx=sx, by=sy-62; ctx.fillStyle=P.ink; ctx.fillRect(bx-26,by-8,52,14); ctx.fillStyle='#fff'; ctx.fillRect(bx-25,by-7,50,12); G.labels.push(['Можно пройти?',bx,by-1,6,'#1a1020','center',null]);
        const bw=Math.max(26,30*DPR/SC*1.2), b={x:bx-bw/2,y:by-14-bw*.7,w:bw,h:bw*.7}; ctx.fillStyle=P.ink; ctx.fillRect(b.x-1,b.y-1,b.w+2,b.h+2); ctx.fillStyle=P.neonLime; ctx.fillRect(b.x,b.y,b.w,b.h); G.labels.push(['ДА',bx,b.y+b.h/2,9,'#1a1020','center',null]); addBtn(b.x,b.y,b.w,b.h,'yes',()=>{a.politeYes=true;}); }
      if(a.shmyaks) G.labels.push(['Шмякс',sx,sy-58,6,'#b6ff3f']);
    }); }
  for(const p of G.fx) drawProj(p);
  drawParts(); drawForeground(G.cam); vignette(); twistDraw(lv,'front'); drawPops();
  ctx.restore();
  if(!G.noHud) drawHUD();
}
function drawHUD(){ const h=G.hero, lv=G.lv, L=SA.l+4, R=W-SA.r-4, T=SA.t+3;
  // сердечки
  const n=Math.ceil(h.maxhp/2); for(let i=0;i<n;i++){ const hp=h.hp-i*2, x=L+2+i*11, y=T+2; heart(x,y,hp>=2?1:hp>=1?.5:0); }
  // табло станции (бегущая строка)
  const nxt=LEVELS[curIdx+1]; const tick=(G.msg?G.msg.s:('«'+lv.name+'» → '+(nxt&&nxt.w===lv.w?'«'+nxt.name+'»':'конечная'))); const bw=Math.min(W-SA.l-SA.r-150,Math.max(120,txtW(tick,7)+16)), bx=Math.round(W/2-bw/2); ctx.fillStyle=P.ink; ctx.fillRect(bx-2,T,bw+4,13); ctx.fillStyle='#120c18'; ctx.fillRect(bx,T+1,bw,11);
  G.labels.push([tick,W/2,T+7,7,G.msg?G.msg.col:'#ffb84a']);
  // счёт
  G.labels.push([String(G.score),R-34,T+7,8,'#fff','right']); G.labels.push(['🪙'+G.coins,R-34,T+18,7,'#ffd23f','right']);
  if(G.combo>=3) G.labels.push(['КОМБО ×'+G.combo,R-34,T+30,8+Math.min(4,G.combo/10),G.combo>=25?P.neonPink:'#fff','right']);
  // пауза 
  const pb=Math.max(22,44*DPR/SC); buttons.push({x:R-pb,y:T,w:pb,h:pb,id:'pause',cb:()=>{paused=!paused; SFX.ui();}}); ctx.fillStyle='#0008'; ctx.fillRect(R-pb,T,pb,pb); ctx.fillStyle='#fff'; ctx.fillRect(R-pb*.62,T+pb*.28,pb*.1,pb*.44); ctx.fillRect(R-pb*.42,T+pb*.28,pb*.1,pb*.44);
  // супер
  const sb=Math.max(34,64*DPR/SC), sx=R-sb/2-2, sy=H-SA.b-sb/2-4, full=G.rage>=100;
  ctx.globalAlpha=full?1:.55; ctx.fillStyle=P.ink; disc(ctx,sx,sy,sb/2+1,sb/2+1,P.ink); disc(ctx,sx,sy,sb/2-2,sb/2-2,full?(Math.floor(G.t*6)%2?P.red:'#ff7a1a'):'#4a3a5a');
  // дуга злости
  ctx.strokeStyle=P.edge; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(sx,sy,sb/2-1,-Math.PI/2,-Math.PI/2+Math.PI*2*G.rage/100); ctx.stroke(); ctx.globalAlpha=1;
  G.labels.push(['СУПЕР',sx,sy,7,full?'#fff':'#ccc']);
  buttons.push({x:sx-sb/2,y:sy-sb/2,w:sb,h:sb,id:'super',cb:()=>heroAct(G.hero,'super')});
  // стик
  if(input.stick){ const s=input.stick; ctx.globalAlpha=.35; disc(ctx,s.x0,s.y0,18,18,'#fff'); ctx.globalAlpha=.7; disc(ctx,s.x,s.y,8,8,'#fff'); ctx.globalAlpha=1; }
  else if(G.time<6||G.tut>=0&&G.tut<1){ ctx.globalAlpha=.25+.1*Math.sin(G.t*4); disc(ctx,SA.l+40,H-SA.b-40,18,18,'#fff'); ctx.globalAlpha=1; }
  // заряд
  const hold=holdingGesture(); if(hold&&G.scene==='play'){ const k=Math.min(1,(hold-380)/300); const hx=Math.round(h.x-G.cam), hy=Math.round(h.y-50); ctx.strokeStyle=P.edge; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(hx,hy+20,14,-Math.PI/2,-Math.PI/2+Math.PI*2*k); ctx.stroke(); }
  // босс
  const b=G.ens.find(e=>e.boss&&!e.dead); if(b) drawBossBar(b);
  // обучение
  if(G.tut>=0&&G.tut<TUT.length){ if(TUT[G.tut][0]==='move'&&input.stick) tutDo('move'); G.labels.push([TUT[G.tut][1],W/2,T+34,9,'#fff']); }
  if(G.tut===TUT.length){ G.tut=-1; say('Ты готов. Вперёд, опаздываешь!',2,P.neonLime); }
  // уровень «стрелка вперёд»
  if(!G.camLock&&!G.done&&G.arena>=0&&Math.floor(G.t*3)%2){ G.labels.push(['ВПЕРЁД →',R-60,H/2-20,10,P.edge]); }
  if(paused) drawPause();
}
function heart(x,y,f){ ctx.fillStyle=P.ink; ctx.fillRect(x-1,y,11,8); ctx.fillRect(x,y-1,4,2); ctx.fillRect(x+5,y-1,4,2); ctx.fillRect(x+1,y+8,7,2); ctx.fillRect(x+3,y+10,3,1);
  ctx.fillStyle='#4a2a3a'; ctx.fillRect(x,y,9,7); ctx.fillRect(x+2,y+7,5,2); if(f>0){ ctx.fillStyle=P.red; ctx.fillRect(x,y,f<1?5:9,7); ctx.fillRect(x+2,y+7,f<1?3:5,2); ctx.fillStyle='#ffb0b0'; ctx.fillRect(x+1,y+1,2,2);} }
function bigBtn(label,x,y,w,h,col,cb,id,fs=10){ ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,h+4); ctx.fillStyle=shade(col,-.35); ctx.fillRect(x,y+h-3,w,3); ctx.fillStyle=col; ctx.fillRect(x,y,w,h-3); ctx.fillStyle=shade(col,.3); ctx.fillRect(x,y,w,2);
  G.labels.push([label,x+w/2,y+h/2-1,fs,'#fff']); buttons.push({x,y,w,h,id,cb:()=>{SFX.ui(); haptic('select'); cb();}}); }
function drawPause(){ G.labels.length=0; ctx.fillStyle='#120c18d0'; ctx.fillRect(0,0,W,H); G.labels.push(['ПАУЗА',W/2,H*.2,16,P.edge]);
  const bh=Math.max(26,48*DPR/SC), bw=150; let y=H*.32; bigBtn('ПРОДОЛЖИТЬ',W/2-bw/2,y,bw,bh,'#2aa860',()=>paused=false,'resume'); y+=bh+8;
  bigBtn('ЗАНОВО',W/2-bw/2,y,bw,bh,'#3a6ad8',()=>{paused=false; startLevel(curIdx);},'restart'); y+=bh+8;
  bigBtn('НА КАРТУ',W/2-bw/2,y,bw,bh,'#8a3ad8',()=>{paused=false; toMap();},'map');
  bigBtn(save.mute?'🔇':'🔊',SA.l+8,H-SA.b-bh-8,bh,bh,'#4a3a5a',()=>{save.mute=!save.mute; if(master) master.gain.value=save.mute?0:.45; store();},'mute',12);
  bigBtn(save.noHaptic?'📴':'📳',SA.l+bh+16,H-SA.b-bh-8,bh,bh,'#4a3a5a',()=>{save.noHaptic=!save.noHaptic; store();},'hapt',12); }
// ---------- титул ----------
const TITLE={crowd:[]};
function toTitle(){ G.scene='title'; tgBack(false); musTheme=3; musOn=true; floorBand(); TITLE.crowd=[]; const specs=[HERO_SPECS.serega,...['polite','aunt','musician','kid','bag','courier','seeds'].map(t=>EN[t].spec())]; for(let i=0;i<10;i++) TITLE.crowd.push({spec:specs[i%specs.length],x:i/10,ph:rnd(0,9),sp:rnd(.6,1.2)}); BG.lv={name:'Давка',line:0,bg:'station',len:9999}; bgReset(BG.lv); }
function drawTitle(){ G.labels=[]; buttons=[]; BG.t+=0; drawBG(G.t*20); vignette();
  // толпа бежит
  const by=FY1; for(const c of TITLE.crowd.sort((a,b)=>a.ph-b.ph)){ const x=((c.x*W*1.4+G.t*24*c.sp)%(W*1.4))-W*.2; const img=personSprite(c.spec,'walk',Math.floor(G.t*10*c.sp+c.ph)%8,'norm',Math.floor(G.t*10)); const y=by-4-(c.ph%3)*5; ctx.drawImage(img,Math.round(x-32),Math.round(y-60)); }
  ctx.fillStyle='#120c18a0'; ctx.fillRect(0,SA.t+8,W,64);
  const lx=W/2, ly=SA.t+30; const wob=Math.sin(G.t*3)*1.5;
  G.labels.push(['ДАВКА',lx-60,ly+wob,26,P.edge,'center',P.ink]); G.labels.push(['ДО РАБОТЫ',lx+56,ly-wob+2,20,P.neonPink,'center']);
  G.labels.push(['опоздай красиво',lx,ly+24,8,'#fff']);
  buttons.push({x:lx-120,y:SA.t+8,w:240,h:50,id:'logo',cb:()=>{ logoTaps++; SFX.squeak(); if(logoTaps>=7&&!save.eggs.metrofan){ save.eggs.metrofan=true; store(); say('Кот Метрофан вышел из туннеля! 🐈',3,P.neonLime); G.catRun=G.t; } }});
  if(G.catRun&&G.t-G.catRun<4){ const cx=(G.t-G.catRun)/4*(W+40)-20; drawProp({kind:'cat',x:cx+G.cam,y:FY0+20,z:0,face:1,col:'#4a4a4a'}); }
  const bh=Math.max(28,52*DPR/SC);
  bigBtn('▶ ИГРАТЬ',W/2-80,H*.52,160,bh,'#d8265e',()=>{ if(!save.cut.intro){ startCut('intro',()=>{ save.cut.intro=1; store(); startCut('metro',()=>toMap()); }); } else toMap(); },'play',12);
  bigBtn('🚪 ПРОБИТЬСЯ К ВЫХОДУ',W/2-80,H*.52+bh+8,160,bh,'#3d6ff0',()=>startExit(),'exit',9);
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,H-SA.b-16,9,G.msg.col]); }
}
// ---------- карта ----------
function toMap(){ G.scene='map'; tgBack(true); musTheme=3; musOn=true; mapSel=-1; }
function starsTotal(){ return Object.values(save.stars).reduce((a,b)=>a+b,0); }
function lineOpen(w){ return w===0||!!save.stars[(w-1)+'.7']; }
function lvOpen(w,i){ if(G.cheat) return true; if(!lineOpen(w)) return false; return i===0||!!save.stars[w+'.'+(i-1)]; }
function drawMap(){ G.labels=[]; buttons=[]; const L=SA.l+6, R=W-SA.r-6, T=SA.t+4;
  ctx.fillStyle='#f1e8d4'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#e2d6bc'; for(let x=0;x<W;x+=16) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=16) ctx.fillRect(0,y,W,1);
  const lc=LINE_COL[mapLine];
  // шапка
  const bh=Math.max(24,44*DPR/SC);
  bigBtn('◀',L,T,bh,bh,'#4a3a5a',()=>{ mapLine=(mapLine+2)%3; mapSel=-1; },'prev',12);
  bigBtn('▶',R-bh,T,bh,bh,'#4a3a5a',()=>{ mapLine=(mapLine+1)%3; mapSel=-1; },'next',12);
  G.labels.push([LINE_NAMES[mapLine]+' ветка',W/2,T+bh/2-4,12,lc,'center','#fff']); G.labels.push(['★ '+starsTotal()+'   🪙 '+save.coins,W/2,T+bh/2+9,8,'#1a1020','center','#fff']);
  // линия
  const y0=Math.round(H*.48), x0=L+20, x1=R-20, open=lineOpen(mapLine);
  ctx.fillStyle=P.ink; ctx.fillRect(x0-2,y0-4,x1-x0+4,9); ctx.fillStyle=open?lc:'#aaa'; ctx.fillRect(x0,y0-2,x1-x0,5);
  const st=LEVELS.filter(l=>l.w===mapLine);
  st.forEach((s,i)=>{ const x=Math.round(x0+(x1-x0)*i/7), op=lvOpen(mapLine,i), k=mapLine+'.'+i, stars=save.stars[k]||0, sel=mapSel===i;
    const r=s.boss?8:6; disc(ctx,x,y0,r+1,r+1,P.ink); disc(ctx,x,y0,r,r,op?'#fff':'#bbb'); if(stars) disc(ctx,x,y0,r-3,r-3,lc); if(sel){ ctx.strokeStyle=P.neonPink; ctx.lineWidth=2; ctx.strokeRect(x-r-3,y0-r-3,r*2+6,r*2+6);} 
    if(s.boss) G.labels.push(['☠',x,y0,7,P.ink,'center',null]);
    const up=i%2===0, ty=up?y0-18:y0+18; const words=wrap(s.name,62); words.forEach((w,j)=>G.labels.push([w,x,ty+(up?-(words.length-1-j)*10:j*10),7,op?'#1a1020':'#9a9090','center','#fff']));
    G.labels.push(['★'.repeat(stars)+'☆'.repeat(3-stars),x,up?y0+13:y0-13,6,P.edge,'center',P.ink]);
    const hb=Math.max(28,44*DPR/SC); buttons.push({x:x-hb/2,y:y0-hb/2,w:hb,h:hb,id:'st'+i,cb:()=>{ if(op){ mapSel=i; SFX.ui(); } else { say('Сначала пройди предыдущую станцию',1.6,P.red); SFX.hurt(); } }}); });
  if(!open) G.labels.push(['🔒 Пройди конечную прошлой ветки',W/2,y0+40,9,'#8a3a3a','center','#fff']);
  // панель станции
  if(mapSel>=0){ const s=st[mapSel]; const ph=Math.max(30,50*DPR/SC), py=H-SA.b-ph-8; ctx.fillStyle=P.ink; ctx.fillRect(L,py-2,R-L,ph+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(L+2,py,R-L-4,ph);
    G.labels.push(['«'+s.name+'»',L+10,py+ph*.3,9,lc,'left',null]); G.labels.push([s.twistText.length>70?s.twistText.slice(0,68)+'…':s.twistText,L+10,py+ph*.72,7,'#1a1020','left',null]);
    bigBtn('ПОЕХАЛИ',R-100,py+4,92,ph-8,'#2aa860',()=>{ const idx=lvIndex(mapLine,mapSel); if(LEVELS[idx].boss&&!save.cut['boss']) {} if(mapSel===0&&mapLine>0&&!save.cut['line'+mapLine]){ save.cut['line'+mapLine]=1; store(); startCut('line',()=>startLevel(idx),mapLine); } else startLevel(idx); },'go',10); }
  else { // квесты дня + герой
    const qy=H-SA.b-8; questsToday().forEach((q,j)=>{ const Q=QUESTS[q.i]; G.labels.push([(q.done?'✅ ':'▫️ ')+Q[2]+(q.done?'':' ('+Math.min(q.n,Q[1])+'/'+Q[1]+')'),L+4,qy-10-(2-j)*12,7,'#1a1020','left','#fff']); });
    G.labels.push(['КВЕСТЫ ДНЯ',L+4,qy-48,8,P.neonPink,'left','#fff']);
    const hb=Math.max(30,50*DPR/SC); const hx=R-hb*2-10, hy=H-SA.b-hb-8;
    for(const [j,id] of ['serega','baba'].entries()){ const x=hx+j*(hb+6), ok=id==='serega'||save.unlockedBaba; ctx.fillStyle=P.ink; ctx.fillRect(x-2,hy-2,hb+4,hb+4); ctx.fillStyle=heroId===id?'#ffd23f':'#d8ccb4'; ctx.fillRect(x,hy,hb,hb);
      const img=personSprite(HERO_SPECS[id],'idle',Math.floor(G.t*6)%6,'norm',Math.floor(G.t*10)); ctx.globalAlpha=ok?1:.25; ctx.drawImage(img,Math.round(x+hb/2-32),Math.round(hy+hb-62)); ctx.globalAlpha=1; if(!ok) G.labels.push(['🔒',x+hb/2,hy+hb/2,10,'#fff']);
      buttons.push({x,y:hy,w:hb,h:hb,id:'hero_'+id,cb:()=>{ if(ok){ heroId=id; save.hero=id; store(); SFX.squeak(); } else say('Бабка откроется после Бабушки-танка',2,P.red); }}); }
    G.labels.push([HEROES[heroId].name,hx+hb,hy-8,7,'#1a1020','center','#fff']); }
  bigBtn('⌂',L,H-SA.b-bh-8-(mapSel>=0?Math.max(30,50*DPR/SC)+8:0)-60,bh,bh,'#4a3a5a',()=>toTitle(),'home',12);
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,T+bh+14,9,G.msg.col,'center','#fff']); }
}
function wrap(s,maxW){ const words=s.split(' '); const out=[]; let cur=''; for(const w of words){ const t=cur?cur+' '+w:w; if(txtW(t,7)>maxW&&cur){ out.push(cur); cur=w; } else cur=t; } if(cur) out.push(cur); return out; }
// ---------- рендер ----------
function render(){ clearText(); ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled=false; floorBand();
  if(portrait) return drawRotate();
  if(G.scene==='play') drawPlay(); else if(G.scene==='title') drawTitle(); else if(G.scene==='map') drawMap(); else if(G.scene==='cut') drawCut(); else if(G.scene==='exit') drawExit(); else if(G.scene==='result') drawResult();
  const BR=G.scene==='play'&&G.lv&&G.lv.board&&G.lv.boardRect; const OC=G.scene==='play'&&G.occ&&G.occ.length?G.occ:null; for(let li=0;li<G.labels.length;li++){ const l=G.labels[li]; if(OC&&li<G.bgLabN){ const hw=txtW(l[0],l[3])/2; if(OC.some(o=>Math.min(l[1]+hw,o[1])-Math.max(l[1]-hw,o[0])>Math.max(8,hw*.6))) continue; } if(BR&&l[8]!=='board'&&l[1]>BR[0]&&l[1]<BR[2]&&l[2]>BR[1]&&l[2]<BR[3]) continue; const o=(l[6]===undefined||l[6]===0)?'#1a1020':l[6]; txt(l[0],l[1],l[2],l[3],l[4],l[5]||'center',o,900,l[7]); } }
function drawRotate(){ G.labels=[]; ctx.fillStyle='#1b1426'; ctx.fillRect(0,0,W,H); const a=Math.sin(G.t*2)*.8-.4; ctx.save(); ctx.translate(W/2,H*.42); ctx.rotate(a); ctx.fillStyle=P.ink; ctx.fillRect(-42,-17,84,34); ctx.fillStyle='#4a6a8a'; ctx.fillRect(-40,-15,80,30); ctx.fillStyle='#ffe9a8'; for(let i=-34;i<34;i+=17) ctx.fillRect(i,-10,12,10); ctx.fillStyle=LINE_COL[0]; ctx.fillRect(-40,5,80,3); ctx.restore();
  txt('Поверни телефон',W/2,H*.68,14,P.edge,'center'); txt('вагон не влезает 🙃',W/2,H*.68+20,9,'#fff','center'); }
// ---------- результаты ----------
function drawResult(){ }
// ---------- цикл ----------
function loop(t){ let dt=Math.min(.05,(t-last)/1000); last=t; try{ const n=window.__ts||1; for(let i=0;i<n;i++) update(dt); render(); }catch(e){ console.error(e); (window.__errs=window.__errs||[]).push(String(e.stack).slice(0,200)); } requestAnimationFrame(loop); }
onRescale=()=>{ floorBand(); };
