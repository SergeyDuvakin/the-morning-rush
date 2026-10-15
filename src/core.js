'use strict';
// ================= CORE: Telegram, viewport, рендер-канвасы, ввод, звук, вибро, сейв =================
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const tcv=document.getElementById('t'), tctx=tcv.getContext('2d');
const tg=(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.initData!==undefined)?window.Telegram.WebApp:null;
const inTG=!!(tg&&tg.initData);
const LH=216; // внутренняя высота мира (пиксели арта)
let W=384,H=216,SC=1,DPR=1,lastWH=null,portrait=false;
const SA={l:0,r:0,t:0,b:0}; // safe-area во внутренних пикселях
const tgv=v=>{try{return tg&&tg.isVersionAtLeast&&tg.isVersionAtLeast(v)}catch(e){return false}};
function tgInit(){ if(!tg) return;
  try{tg.ready();}catch(e){} try{tg.expand();}catch(e){}
  try{ if(tgv('8.0')&&tg.requestFullscreen&&!tg.isFullscreen) tg.requestFullscreen(); }catch(e){}
  try{ if(tgv('7.7')) tg.disableVerticalSwipes(); }catch(e){}
  try{ if(tgv('6.1')){tg.setHeaderColor('#1b1426');tg.setBackgroundColor('#1b1426');} }catch(e){}
  try{ if(tgv('6.1')) tg.BackButton.onClick(()=>window.onBack&&window.onBack()); }catch(e){}
}
function tgBack(show){ if(!inTG) return; try{ if(tgv('6.1')) show?tg.BackButton.show():tg.BackButton.hide(); }catch(e){} }
function sensorLandscape(){
  const o=window.orientation;
  if(o===90||o===-90) return true;
  if(o===0||o===180) return false;
  try{ const t=(screen.orientation&&screen.orientation.type)||''; if(t.indexOf('landscape')>=0) return true; if(t.indexOf('portrait')>=0) return false; }catch(e){}
  return null;
}
function layoutLandscape(){ return window.innerWidth>window.innerHeight*1.05; }
function viewH(){ const c=[window.innerHeight]; if(tg){ c.push(tg.viewportHeight, tg.viewportStableHeight); }
  const good=c.filter(v=>v&&isFinite(v)&&v>0); if(!good.length) return window.innerHeight||0;
  if(layoutLandscape()){ const fit=good.filter(v=>v<window.innerWidth); if(fit.length) return Math.max(...fit); }
  return Math.max(...good); }
let orientLock=null;
function syncOrientLock(){ if(!tg||!tgv('8.0')) return; const land=layoutLandscape(), want=land?'land':'open'; if(orientLock===want) return;
  try{ if(land){ if(tg.lockOrientation) tg.lockOrientation(); if(tg.requestFullscreen&&!tg.isFullscreen) tg.requestFullscreen(); }
    else if(tg.unlockOrientation) tg.unlockOrientation(); orientLock=want; }catch(e){ orientLock=null; } }
function cssInsets(){ const e=document.getElementById('sa'); if(!e) return {l:0,r:0,t:0,b:0}; const r=e.getBoundingClientRect();
  return {l:r.left,t:r.top,r:window.innerWidth-r.right,b:window.innerHeight-r.bottom}; }
function tgInsets(){ const o={l:0,r:0,t:0,b:0}; if(!tg) return o; const a=tg.safeAreaInset||{}, b=tg.contentSafeAreaInset||{};
  o.l=(a.left||0)+(b.left||0); o.r=(a.right||0)+(b.right||0); o.t=(a.top||0)+(b.top||0); o.b=(a.bottom||0)+(b.bottom||0); return o; }
function resize(){ const d0=window.devicePixelRatio||1, vw=window.innerWidth, vh=viewH();
  const ci=cssInsets(), ti=tgInsets(); const ins={l:Math.max(ci.l,ti.l),r:Math.max(ci.r,ti.r),t:Math.max(ci.t,ti.t),b:Math.max(ci.b,ti.b)};
  const sens=sensorLandscape();
  const key=vw+'x'+vh+'@'+d0+'|'+ins.l+','+ins.r+','+ins.t+','+ins.b+'|'+sens+'|'+window.innerWidth+'x'+window.innerHeight;
  const wasPortrait=portrait;
  portrait=!layoutLandscape();
  if(inTG&&sens===true) portrait=false;
  if(key===lastWH&&portrait===wasPortrait) return false; lastWH=key; DPR=d0;
  const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR);
  SC=Math.max(1,Math.floor(dh/LH)); // целочисленный масштаб, ширина добирается фоном
  if(portrait) SC=Math.max(1,Math.floor(dw/LH));
  W=Math.ceil(dw/SC); H=Math.ceil(dh/SC); cv.width=W; cv.height=H;
  cv.style.width=(W*SC/DPR)+'px'; cv.style.height=(H*SC/DPR)+'px';
  tcv.width=dw; tcv.height=dh; tcv.style.width=vw+'px'; tcv.style.height=vh+'px';
  const k=DPR/SC; SA.l=Math.ceil(ins.l*k); SA.r=Math.ceil(ins.r*k); SA.t=Math.ceil(ins.t*k); SA.b=Math.ceil(ins.b*k);
  ctx.imageSmoothingEnabled=false; syncOrientLock(); return true; }
let onRescale=null;
function rescale(){ const ch=resize(); if(ch&&onRescale) onRescale(); if(!layoutLandscape()) armTurn(); return ch; }
let kickQueued=false;
function kick(){ rescale(); if(kickQueued) return; kickQueued=true; for(const ms of [50,300,800]) setTimeout(rescale,ms); setTimeout(()=>{kickQueued=false;},800); }
let turnTimer=0;
function armTurn(){ if(turnTimer) return; turnTimer=setInterval(()=>{ rescale(); if(layoutLandscape()){ clearInterval(turnTimer); turnTimer=0; kick(); } },200); }
tgInit(); rescale();
try{ if(tg&&tg.onEvent){ for(const ev of ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged']) tg.onEvent(ev,kick); } }catch(e){}
window.addEventListener('resize',kick); window.addEventListener('orientationchange',kick);
try{ if(screen.orientation&&screen.orientation.addEventListener) screen.orientation.addEventListener('change',kick); }catch(e){}
try{ if(window.visualViewport) visualViewport.addEventListener('resize',kick); }catch(e){}
try{ const mq=window.matchMedia&&matchMedia('(orientation: landscape)'); if(mq&&mq.addEventListener) mq.addEventListener('change',kick); }catch(e){}
for(const ms of [50,300,800]) setTimeout(rescale,ms);

// ---------- текст: отдельный слой в реальном разрешении экрана (чётко) ----------
const FONT='"Trebuchet MS","Segoe UI",system-ui,sans-serif';
// кэш отрисованных надписей: обводка strokeText дорогая, а надписи почти не меняются от кадра к кадру
const TXTC=new Map();
function txt(s,x,y,size=8,col='#fff',align='left',outline='#1b1426',weight=900,deco=false){ // x,y,size во внутренних px
  const k=SC; if(!deco) size=Math.max(size,MINPX()); s=String(s); const fpx=Math.round(size*k); const key=s+'|'+fpx+'|'+col+'|'+outline+'|'+weight;
  let c=TXTC.get(key);
  if(!c){ if(TXTC.size>600) TXTC.clear(); const font=weight+' '+fpx+'px '+FONT; tctx.font=font; const lw=outline?Math.max(2,Math.round(size*k*.22)):0; const w=Math.ceil(tctx.measureText(s).width)+lw*2+4, h=Math.ceil(fpx*1.5)+lw*2;
    const cv=document.createElement('canvas'); cv.width=Math.max(1,w); cv.height=Math.max(1,h); const x2=cv.getContext('2d'); x2.font=font; x2.textAlign='left'; x2.textBaseline='middle';
    if(outline){ x2.lineJoin='round'; x2.lineWidth=lw; x2.strokeStyle=outline; x2.strokeText(s,lw+2,h/2); } x2.fillStyle=col; x2.fillText(s,lw+2,h/2); c={cv,w,h,pad:lw+2}; TXTC.set(key,c); }
  const px=Math.round(x*k), py=Math.round(y*k); const ox=align==='center'?Math.round((c.w-c.pad*2)/2)+c.pad:align==='right'?c.w-c.pad+2:c.pad;
  tctx.drawImage(c.cv,px-ox,Math.round(py-c.h/2)); }
const MINPX=()=>11*DPR/SC; // минимум 11 CSS px — никакой мелочи
function txtW(s,size=8,weight=900){ size=Math.max(size,MINPX()); tctx.font=weight+' '+Math.round(size*SC)+'px '+FONT; return tctx.measureText(s).width/SC; }
function clearText(){ tctx.setTransform(1,0,0,1,0,0); tctx.clearRect(0,0,tcv.width,tcv.height); }

// ---------- ввод: плавающий стик слева, жесты справа, кнопки ----------
const input={stick:null,keys:{},events:[],hold:null,holdT:0};
let buttons=[]; // {x,y,w,h,id,cb}
function addBtn(x,y,w,h,id,cb){ buttons.push({x,y,w,h,id,cb}); }
const toIn=(cx,cy)=>[cx*DPR/SC, cy*DPR/SC];
const gest={}; // pointerId -> {x0,y0,t0,done}
window.addEventListener('pointerdown',e=>{ e.preventDefault(); audioInit(); const [x,y]=toIn(e.clientX,e.clientY);
  for(let i=buttons.length-1;i>=0;i--){ const b=buttons[i]; const pad=2; if(x>=b.x-pad&&x<=b.x+b.w+pad&&y>=b.y-pad&&y<=b.y+b.h+pad){ b.cb&&b.cb(); input.events.push({t:'btn',id:b.id}); return; } }
  if(window.wantsStick&&window.wantsStick()&&x<W*0.45&&!input.stick){ input.stick={id:e.pointerId,x0:x,y0:y,x,y}; return; }
  gest[e.pointerId]={x0:x,y0:y,x,y,t0:performance.now(),done:false};
  input.events.push({t:'down',x,y});
},{passive:false});
window.addEventListener('pointermove',e=>{ const [x,y]=toIn(e.clientX,e.clientY);
  if(input.stick&&input.stick.id===e.pointerId){ input.stick.x=x; input.stick.y=y; return; }
  const g=gest[e.pointerId]; if(!g||g.done) return; g.x=x; g.y=y; const dx=x-g.x0, dy=y-g.y0;
  if(Math.hypot(dx,dy)*SC/DPR>26){ g.done=true; const ax=Math.abs(dx),ay=Math.abs(dy);
    input.events.push({t:'swipe',dir: ay>ax*0.9 ? (dy<0?'up':'down') : (dx>0?'right':'left'),x:g.x0,y:g.y0}); }
});
function endPtr(e){ if(input.stick&&input.stick.id===e.pointerId){ input.stick=null; return; }
  const g=gest[e.pointerId]; if(!g) return; delete gest[e.pointerId]; if(g.done) return;
  const [x,y]=toIn(e.clientX,e.clientY); const d=performance.now()-g.t0;
  input.events.push(d>380?{t:'release',x,y,dur:d}:{t:'tap',x,y}); }
window.addEventListener('pointerup',endPtr); window.addEventListener('pointercancel',endPtr);
function holdingGesture(){ const n=performance.now(); for(const k in gest){ const g=gest[k]; if(!g.done&&n-g.t0>380) return n-g.t0; } return 0; }
window.addEventListener('keydown',e=>{ audioInit(); if(!input.keys[e.code]) input.events.push({t:'key',code:e.code}); input.keys[e.code]=true; });
window.addEventListener('keyup',e=>{ input.keys[e.code]=false; if(e.code==='KeyJ'&&input.jHold) {} });
window.addEventListener('contextmenu',e=>e.preventDefault());
function stickVec(){ if(window.__botStick) return window.__botStick; let x=0,y=0; const k=input.keys;
  if(k.ArrowLeft||k.KeyA)x-=1; if(k.ArrowRight||k.KeyD)x+=1; if(k.ArrowUp||k.KeyW)y-=1; if(k.ArrowDown||k.KeyS)y+=1;
  if(input.stick){ const s=input.stick; let dx=s.x-s.x0, dy=s.y-s.y0; const R=18; const l=Math.hypot(dx,dy);
    if(l>R){ s.x0+= (dx/l)*(l-R); s.y0+=(dy/l)*(l-R); dx=s.x-s.x0; dy=s.y-s.y0; } // стик «едет» за пальцем
    if(l>2){ x=dx/R; y=dy/R; } }
  const l=Math.hypot(x,y); if(l>1){x/=l;y/=l;} return {x,y}; }

// ---------- звук: маленький чиптюн-синт ----------
let AC=null,master=null,mus=null,musOn=false;
function audioInit(){ if(AC){ if(AC.state==='suspended')AC.resume(); return; }
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=AC.createGain(); master.gain.value=save.mute?0:.45; master.connect(AC.destination);
  mus=AC.createGain(); mus.gain.value=.09; mus.connect(master); }
function tone(f,d,type='square',v=.25,slide=0,delay=0,dst){ if(!AC) return; const t=AC.currentTime+delay;
  const o=AC.createOscillator(),g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
  g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g); g.connect(dst||master); o.start(t); o.stop(t+d+.02); }
function noise(d,v=.3,hp=800,delay=0){ if(!AC) return; const t=AC.currentTime+delay; const n=AC.sampleRate*d|0, b=AC.createBuffer(1,n,AC.sampleRate), a=b.getChannelData(0);
  for(let i=0;i<n;i++) a[i]=(Math.random()*2-1)*(1-i/n); const s=AC.createBufferSource(); s.buffer=b; const f=AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp;
  const g=AC.createGain(); g.gain.value=v; s.connect(f); f.connect(g); g.connect(master); s.start(t); }
const SFX={
  hit:()=>{noise(.08,.35,600); tone(180,.08,'square',.18,-90);},
  heavy:()=>{noise(.16,.5,200); tone(110,.18,'square',.25,-70);},
  whiff:()=>noise(.06,.12,2500),
  jump:()=>tone(300,.14,'square',.12,300),
  land:()=>noise(.05,.15,300),
  ko:()=>{tone(500,.4,'triangle',.2,-420); noise(.2,.2,400,.05);},
  pick:()=>{tone(660,.06,'square',.15); tone(990,.09,'square',.15,0,.06);},
  coin:()=>{tone(988,.05,'square',.12); tone(1318,.12,'square',.12,0,.05);},
  hurt:()=>{tone(220,.2,'sawtooth',.2,-120); noise(.1,.25,500);},
  doors:()=>{tone(740,.25,'sine',.18); tone(587,.35,'sine',.18,0,.28);},
  ding:()=>{tone(880,.4,'sine',.15); tone(660,.5,'sine',.15,0,.35);},
  super:()=>{for(let i=0;i<6;i++) tone(300+i*120,.1,'square',.14,0,i*.04); noise(.4,.3,300,.2);},
  ui:()=>tone(520,.05,'square',.12),
  squeak:()=>tone(1200,.12,'sine',.12,600),
  train:()=>{noise(1.4,.12,120); tone(90,1.2,'sawtooth',.05);},
  alarm:()=>{for(let i=0;i<8;i++) tone(1400,.06,'square',.12,0,i*.12);},
  boss:()=>{tone(110,.5,'sawtooth',.25,-40); tone(82,.7,'sawtooth',.22,0,.4);},
  win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.18,'square',.15,0,i*.12)),
};
// фоновая мелодия: простой секвенсор
let musStep=0,musNext=0,musTheme=0;
const THEMES=[ // [бас, мелодия] по 16 шагов
  [[45,0,45,0,52,0,45,0,43,0,43,0,50,0,48,0],[69,0,72,0,76,0,74,72,0,69,67,0,69,0,0,0]],
  [[41,0,41,48,0,41,0,46,43,0,43,50,0,43,0,48],[72,74,0,77,0,74,72,0,70,72,0,74,0,0,70,0]],
  [[38,0,45,0,38,0,45,0,36,0,43,0,36,0,43,0],[74,0,0,77,0,81,0,79,77,0,74,0,72,0,74,0]],
  [[33,33,0,33,40,0,33,0,31,31,0,31,38,0,36,0],[69,0,68,69,0,72,0,0,76,0,75,76,0,79,0,0]],
];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function musicTick(){ if(!AC||!musOn||save.mute) return; const sp=.13; while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02;
  const T=THEMES[musTheme%THEMES.length], i=musStep%16, b=T[0][i], m=T[1][i], d=musNext-AC.currentTime;
  if(b) tone(mtof(b),sp*1.6,'triangle',.5,0,d,mus); if(m) tone(mtof(m),sp*.9,'square',.22,0,d,mus); if(i%4===0) { /* хэт */ }
  musStep++; musNext+=sp; } }
// ---------- вибро ----------
function haptic(k){ if(save.noHaptic) return; try{ if(inTG&&tgv('6.1')){ const H=tg.HapticFeedback;
  if(k==='light'||k==='medium'||k==='heavy'||k==='rigid'||k==='soft') H.impactOccurred(k); else if(k==='select') H.selectionChanged(); else H.notificationOccurred(k); return; } }catch(e){}
  try{ if(navigator.vibrate) navigator.vibrate({light:8,medium:16,heavy:30,warning:[20,40,20],success:[10,30,10,30,30],error:60}[k]||10); }catch(e){} }
// ---------- сейв (localStorage + CloudStorage) ----------
const SAVE_KEY='davka_v1';
let save={v:1,stars:{},best:{},coins:0,cut:{},mute:false,noHaptic:false,exitBest:0,unlockedBaba:false,eggs:{}};
try{ const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(s&&s.v===1) save=Object.assign(save,s); }catch(e){}
function store(){ const s=JSON.stringify(save); try{localStorage.setItem(SAVE_KEY,s);}catch(e){}
  try{ if(inTG&&tgv('6.9')) tg.CloudStorage.setItem(SAVE_KEY,s,()=>{}); }catch(e){} }
try{ if(inTG&&tgv('6.9')) tg.CloudStorage.getItem(SAVE_KEY,(err,v)=>{ try{ const s=JSON.parse(v||'null'); if(s&&s.v===1){ // берём сейв, где больше звёзд
  const n=o=>Object.values(o.stars||{}).reduce((a,b)=>a+b,0); if(n(s)>n(save)){ save=Object.assign(save,s); try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){} } } }catch(e){} }); }catch(e){}
// ---------- утилиты ----------
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
function mkc(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return [c,x]; }
