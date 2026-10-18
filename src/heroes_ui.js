// M1-20: экран выбора героя (§Q4) — оверлей на карте. ≤2 подписанные кнопки (основная по состоянию + НАЗАД), карточки — тап-области.
const HS={open:false,sel:null,off:0,lockUntil:0,conf:[],rects:[]};
const HERO_SHORT={serega:'Серёга',baba:'Зинаида',varya:'Варя',rustam:'Рустам',lena:'Лена',gena:'Гена',kostya:'Костя',tima:'Тимоха'};
// открытия по прогрессу пересчитываются из ST_THR при загрузке и после поездки (идемпотентно); Зинаида — как v3 (после станции 7); Тимоха — выходной
function heroUnlockSync(){ heroesFix(); const pts=tripPts(), o=save.heroes.owned, add=[]; for(const id of HERO_IDS4){ const h=HERO4[id]; if(o.includes(id)) continue;
    if(id==='baba'?save.unlockedBaba:id==='tima'?save.weekendDone:(h.st>0&&pts>=ST_THR[h.st])){ o.push(id); add.push(id); } } if(add.length) store(); return add; }
function heroState(id){ const h=HERO4[id], own=save.heroes.owned.includes(id); if(own) return {own:true};
  if(h.weekend) return {own:false,why:'weekend'}; if(h.price>0) return {own:false,price:h.price,can:wallet().coins>=h.price,st:h.st}; return {own:false,st:h.st}; }
function heroBuy(id){ const now=performance.now(); if(now<HS.lockUntil) return false; HS.lockUntil=now+500; const s=heroState(id); if(s.own||!s.price||!s.can) return false;
  wallet().coins-=s.price; save.heroes.owned.push(id); store(); tev&&TR&&0; HS.boom=1.6; HS.conf=[]; for(let i=0;i<40;i++) HS.conf.push({x:rnd(-20,20),y:rnd(-10,0),vx:rnd(-60,60),vy:rnd(-110,-40),c:pick(['#ffd23f','#ff4fa0','#3ff0ff','#b6ff3f','#fff'])});
  SFX.win&&SFX.win(); haptic('success'); heroVoice(id,'Ура, поехали!'); return true; }
function openHeroes(){ heroUnlockSync(); HS.open=true; HS.sel=save.hero||'serega'; HS.off=0; const i=HERO_IDS4.indexOf(HS.sel); HS.focus=i; }
function closeHeroes(){ HS.open=false; }
function heroPick(id){ if(!save.heroes.owned.includes(id)) return false; save.hero=id; heroId=id; if(!save.heroes.seen.includes(id)) save.heroes.seen.push(id); store(); return true; }
function drawHeroes(){ G.labels=[]; buttons=[]; HS.rects=[]; const L=SA.l+6, R=W-SA.r-6, T=SA.t+4, B=H-SA.b-6, sel=HS.sel||'serega', H4=HERO4[sel], st=heroState(sel);
  ctx.fillStyle='#141428'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#1c1c38'; for(let x=0;x<W;x+=8) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=8) ctx.fillRect(0,y,W,1);
  const rect=(x,y,w,h,id)=>{ HS.rects.push({x,y,w,h,id}); };
  G.labels.push(['ГЕРОИ',L,T+8,11,P.edge,'left']); rect(L,T,txtW('ГЕРОИ',11),16,'title');
  const wt='кошелёк: '+wallet().coins+' мон.', ww=txtW(wt,8); G.labels.push([wt,R,T+8,8,'#ffd23f','right']); rect(R-ww,T+1,ww,14,'wallet');
  // кнопки
  const bh=Math.max(28,44*DPR/SC), by=B-bh, bw=Math.min(180,Math.round((R-L)*.42)), bw2=Math.min(110,Math.round((R-L)*.26));
  bigBtn('НАЗАД',L,by,bw2,bh,'#4a3a5a',()=>closeHeroes(),'hback',9);
  let lab, col='#2aa860', cb;
  if(st.own){ lab='ИГРАТЬ'; cb=()=>{ heroPick(sel); closeHeroes(); if(typeof map4Go==='function') map4Go(); }; }
  else if(st.price&&st.can){ lab='КУПИТЬ · '+st.price+' мон.'; col='#d8a020'; cb=()=>{ heroBuy(sel); }; }
  else if(st.price){ lab='КУПИТЬ · '+st.price+' мон.'; col='#6a5a3a'; cb=()=>{ say('Не хватает монет: нужно '+st.price+', у тебя '+wallet().coins+(st.st>0&&LEVELS[st.st]?' · или открой станцию «'+LEVELS[st.st].name+'»':''),2.4,'#ffd23f'); SFX.hurt&&SFX.hurt(); }; }
  else if(st.why==='weekend'){ lab='ОТКРОЕТСЯ В ВЫХОДНОЙ'; col='#5a5468'; cb=()=>{ say('Тимоха приходит, когда выпадет выходной — пройди его!',2.4,'#ffd23f'); }; }
  else { lab='ОТКРОЕТСЯ НА СТ. '+(st.st+1); col='#5a5468'; cb=()=>{ say(st.price?'Не хватает монет: нужно '+st.price+' мон.':'Откроется на станции «'+LEVELS[st.st].name+'»',2.2,'#ffd23f'); }; }
  bigBtn(lab,R-bw,by,bw,bh,col,cb,'hmain',lab.length>16?8:10); if(!st.own&&!(st.price&&st.can)) buttons[buttons.length-1].dis=true;
  // карточки
  const cw=40, chh=56, gap=4, cy=by-8-chh, avail=R-L, fit=Math.floor((avail+gap)/(cw+gap)), n=HERO_IDS4.length, scroll=fit<n, vis=scroll?Math.floor((avail-2*16+gap)/(cw+gap)):n;
  HS.off=Math.max(0,Math.min(n-vis,HS.off)); const x0=scroll?L+16:Math.round((L+R)/2-(n*(cw+gap)-gap)/2);
  if(scroll){ const ar=(x,d,id)=>{ ctx.fillStyle=P.ink; ctx.fillRect(x,cy,14,chh); ctx.fillStyle='#3a3050'; ctx.fillRect(x+1,cy+1,12,chh-2); ctx.fillStyle='#fff'; for(let i=0;i<4;i++){ const xx=d<0?x+4+i:x+9-i; ctx.fillRect(xx,cy+chh/2-i,1,i*2+1); } buttons.push({x,y:cy,w:14,h:chh,id,icon:1,cb:()=>{ HS.off+=d; SFX.ui(); }}); rect(x,cy,14,chh,id); };
    if(HS.off>0) ar(L,-1,'hl'); if(HS.off<n-vis) ar(R-14,1,'hr'); }
  for(let k=0;k<vis;k++){ const i=k+HS.off, id=HERO_IDS4[i], x=x0+k*(cw+gap), s=heroState(id), on=id===sel;
    ctx.fillStyle=on?'#ffd23f':P.ink; ctx.fillRect(x-1,cy-1,cw+2,chh+2); ctx.fillStyle=s.own?'#2a2048':'#1a1428'; ctx.fillRect(x,cy,cw,chh);
    const pr=heroPortrait(id); if(pr){ ctx.globalAlpha=s.own?1:.45; ctx.drawImage(pr,x+8,cy+3); ctx.globalAlpha=1; }
    G.labels.push([HERO_SHORT[id],x+cw/2,cy+35,7,s.own?'#fff':'#9a90b0']);
    if(!s.own){ lock4(x+cw/2-3,cy+42); G.labels.push([s.why==='weekend'?'СБ·ВС':s.price?String(s.price):'СТ.'+(s.st+1),x+cw/2+4,cy+50,7,s.can?'#ffd23f':'#c8b8e8','left']); }
    else if(!save.heroes.seen.includes(id)&&id!=='serega') G.labels.push(['НОВЫЙ!',x+cw/2,cy+50,7,P.neonLime]);
    else if(id===(save.hero||'serega')) G.labels.push(['✓',x+cw/2,cy+50,8,P.neonLime]);
    buttons.push({x,y:cy,w:cw,h:chh,id:'hc_'+id,card:1,cb:()=>{ if(HS.sel!==id){ HS.sel=id; SFX.ui(); heroVoice(id,'Привет'); } if(save.heroes.owned.includes(id)&&!save.heroes.seen.includes(id)){ save.heroes.seen.push(id); store(); } }}); rect(x,cy,cw,chh,'hc_'+id); }
  // большая фигура ×2 и бейджи
  const top=T+20, ah=cy-6-top, sc=ah>=94?2:ah>=70?1.5:1, fw=Math.round(32*sc), fh=Math.round(46*sc), fx=L+8, fy=Math.round(top+(ah-fh)/2);
  ctx.fillStyle='#0006'; ctx.fillRect(fx+Math.round(6*sc),fy+fh-Math.round(3*sc),fw-Math.round(12*sc),Math.round(3*sc));
  const img=personSprite(heroSpec(sel),Math.floor(G.t*1.2)%5===4?'cheer':'idle',Math.floor(G.t*6)%6,'norm',Math.floor(G.t*10)); ctx.globalAlpha=st.own?1:.6; ctx.drawImage(img,16,14,32,46,fx,fy,fw,fh); ctx.globalAlpha=1; rect(fx,fy,fw,fh,'fig');
  const tx=fx+fw+12, tw=R-tx; let y=top+6; G.labels.push([H4.n,tx,y,10,'#fff','left']); rect(tx,y-7,txtW(H4.n,10),14,'name'); y+=14; G.labels.push([H4.job+' · скорость '+HERO_STATS[sel].SPD,tx,y,7,'#a89cc8','left']); rect(tx,y-5,txtW(H4.job+' · скорость '+HERO_STATS[sel].SPD,7),10,'job'); y+=12;
  const badge=(text,c,sign)=>{ const lines=wrap(text,tw-18).slice(0,2), lh=11, bhh=lines.length*lh+4; if(y+bhh>cy-4) return; ctx.fillStyle=P.ink; ctx.fillRect(tx-1,y-1,tw+2,bhh+2); ctx.fillStyle=shade(c,-.55); ctx.fillRect(tx,y,tw,bhh); ctx.fillStyle=c; ctx.fillRect(tx,y,10,bhh);
    G.labels.push([sign,tx+5,y+bhh/2,8,'#fff']); lines.forEach((l,i)=>G.labels.push([l,tx+14,y+2+lh/2+i*lh,7,'#fff','left'])); rect(tx,y,tw,bhh,'badge'+sign); y+=bhh+5; };
  badge(H4.perk,'#2aa860','+'); badge(H4.minus,'#d8265e','−');
  if(!st.own&&st.st>0&&LEVELS[st.st]&&y+10<cy-4){ const t2=(st.price?'или за '+st.price+' мон. · ':'')+'станция «'+LEVELS[st.st].name+'»: ещё '+Math.max(0,ST_THR[st.st]-tripPts())+' очк.'; G.labels.push([t2,tx,y+4,7,'#ffd23f','left']); rect(tx,y-1,Math.min(tw,txtW(t2,7)),10,'hint'); }
  // конфетти «ГЕРОЙ ОТКРЫТ!»
  if(HS.boom>0){ HS.boom-=1/60; const cx=fx+fw/2, cy2=fy+20; for(const c of HS.conf){ c.vy+=180/60; c.x+=c.vx/60; c.y+=c.vy/60; ctx.fillStyle=c.c; ctx.fillRect(Math.round(cx+c.x),Math.round(cy2+c.y),2,2); } G.labels.push(['ГЕРОЙ ОТКРЫТ!',tx+tw/2,Math.max(top+4,fy+fh-12),11,P.neonLime]); }
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,cy-10,8,G.msg.col,'center','#000']); } }
function lock4(x,y){ ctx.fillStyle=P.ink; ctx.fillRect(x,y,7,7); ctx.fillStyle='#c8c0d8'; ctx.fillRect(x+1,y+3,5,3); ctx.fillStyle=P.ink; ctx.fillRect(x+3,y+4,1,1); ctx.fillStyle='#c8c0d8'; ctx.fillRect(x+2,y+1,1,2); ctx.fillRect(x+4,y+1,1,2); ctx.fillRect(x+2,y+1,3,1); }
{ const _dm=drawMap; drawMap=function(){ if(HS.open) return drawHeroes(); return _dm.apply(this,arguments); }; }
{ const _ob=window.onBack; window.onBack=()=>{ if(G.scene==='map'&&HS.open){ closeHeroes(); return; } return _ob&&_ob(); }; }
{ const _tm=toMap; toMap=function(){ HS.open=false; return _tm.apply(this,arguments); }; }
heroUnlockSync();
{ const _tf=tripFinish; tripFinish=function(win,reason){ const was=TR.done; _tf(win,reason); if(was||!win||TR.mode!=='trip') return; for(const id of heroUnlockSync()) if(id!=='baba'&&id!=='tima') (TR.newUnlocks=TR.newUnlocks||[]).push('герой: '+HERO4[id].n); }; }

// белый контур героя без ctx.filter (filter после отрисовки салона v4 стоил ~9 мс/кадр): кэш силуэтов спрайтов
{ const SIL=new WeakMap(), RING=new WeakMap(), _ps=personSprite; personSprite=function(){ const img=_ps.apply(this,arguments); if(!(window.__silh||window.__ring)||!img||!img.width) return img; if(window.__ring){ let q=RING.get(img); if(!q){ q=heroRingCanvas(img); RING.set(img,q); } return q; } let s=SIL.get(img); if(s) return s;
  const [cv,c]=(()=>{ const cv=document.createElement('canvas'); cv.width=img.width; cv.height=img.height; return [cv,cv.getContext('2d')]; })(); c.drawImage(img,0,0); c.globalCompositeOperation='source-in'; c.fillStyle='#fff'; c.fillRect(0,0,cv.width,cv.height); SIL.set(img,cv); return cv; }; }

// глубина 2.5D: все актёры строго по y ног (герой тоже). Если героя перекрывает кто-то ближе к камере — поверх рисуется
// «рентген»-контур героя (1 px жёлтый, 55%), а не сам герой.
function heroRingCanvas(img){ const w=img.width, h=img.height, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const c=cv.getContext('2d');
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) c.drawImage(img,dx,dy); c.globalCompositeOperation='destination-out'; c.drawImage(img,0,0); c.globalCompositeOperation='source-in'; c.fillStyle='#ffe14a'; c.fillRect(0,0,w,h); return cv; }
{ const _ss=softShadow; softShadow=function(){ if(window.__silh||window.__ring) return; return _ss.apply(this,arguments); }; }
function heroOccluded(list){ const h=G.hero; if(!h||!list.includes(h)||h.hide) return false; const hx=h.rx!==undefined?h.rx:h.x, hy=h.ry!==undefined?h.ry:h.y;
  for(const a of list){ if(a===h||a.hide) continue; const ax=a.rx!==undefined?a.rx:a.x, ay=a.ry!==undefined?a.ry:a.y; if(ay>hy&&ay-hy<44&&Math.abs(ax-hx)<16) return true; } return false; }
{ const _dta=drawTripActors; drawTripActors=function(list){ const r=_dta(list); if(heroOccluded(list)){ ctx.save(); ctx.globalAlpha=.55; window.__ring=1; try{ drawActor(G.hero); } finally{ window.__ring=0; ctx.restore(); } tev&&0; } return r; }; }
