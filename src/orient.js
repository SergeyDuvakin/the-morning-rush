'use strict';
// ================= ORIENT (M6): ориентация в TG Mini App — поверх core.js (core.js не трогаем) =================
// Причина бага: core.tgInit() вызывает tg.lockOrientation() сразу при старте. Если телефон в этот момент в портрете, TG фиксирует ПОРТРЕТ,
// и поворот телефона больше ничего не делает. А в портрете игра показывала только блокирующий экран «Поверни телефон» (drawRotate).
// Что делаем:
//  1) в портрете снимаем блокировку ориентации (unlockOrientation); фиксируем ориентацию только когда вьюпорт стал ландшафтным;
//  2) rescale на fullscreenChanged/viewportChanged/safeArea*/orientationchange/screen.orientation/visualViewport/resize (+50/300/800 мс);
//  3) запасной режим: вьюпорт остался портретным → рисуем игру повёрнутой на 90° (CSS-transform обоих канвасов), касания пересчитываем;
//     одноразовая подсказка «Поверни телефон боком» с тапом для продолжения вместо блокирующего экрана.
// Высота по-прежнему из core.viewH() = max(innerHeight, viewportHeight, viewportStableHeight) без нулей; resize() возвращает bool.
const ORI={rot:false,pw:0,hint:false,locked:null,log:[]};
const ORI_KEY='davka_rot_hint1';
function oriHintSeen(){ try{ return localStorage.getItem(ORI_KEY)==='1'; }catch(e){ return !!ORI.seen; } }
function oriHintDone(){ ORI.hint=false; ORI.seen=true; try{ localStorage.setItem(ORI_KEY,'1'); }catch(e){} }
function oriPortraitVP(){ const vw=window.innerWidth, vh=viewH(); return vh>vw*1.05; }
function oriTG(){ if(!tg) return; const land=!oriPortraitVP();
  try{ if(tgv('8.0')){ if(land&&tg.lockOrientation&&ORI.locked!=='land'){ tg.lockOrientation(); ORI.locked='land'; ORI.log.push('lock'); }
    else if(!land&&tg.unlockOrientation&&ORI.locked!=='free'){ tg.unlockOrientation(); ORI.locked='free'; ORI.log.push('unlock'); } } }catch(e){} }
function oriCanvasT(t){ for(const c of [cv,tcv]){ c.style.transformOrigin='0 0'; c.style.transform=t; } }
// Защита от «старой» портретной высоты TG сразу после поворота: в ландшафте (innerWidth > innerHeight·1.05) высоты TG > 0.75·ширины (и тем более > ширины) игнорируем (старая портретная высота обычно ≈ новой ширине или чуть меньше).
// innerHeight всегда в списке; остальное — прежнее правило max(innerHeight, viewportHeight, viewportStableHeight) без нулей (core.viewH). В портрете — исходный viewH.
const _viewH0=viewH;
viewH=function(){ const iw=window.innerWidth, ih=window.innerHeight; if(!(tg&&iw>ih*1.05)) return _viewH0();
  const c=[ih]; for(const v of [tg.viewportHeight,tg.viewportStableHeight]) if(v&&isFinite(v)&&v>0){ if(v<=iw*0.75) c.push(v); else ORI.stale=(ORI.stale||0)+1; /* ландшафт выше 4:3 не бывает (планшет 4:3 = 0.75·ширины проходит) — бо́льшая высота TG осталась от портрета */ }
  return Math.max(...c.filter(v=>v&&isFinite(v)&&v>0)); };
const _resize0=resize;
resize=function(){ const pv=oriPortraitVP();
  if(!pv){ if(ORI.rot){ ORI.rot=false; ORI.hint=false; oriCanvasT(''); lastWH=null; } return _resize0(); }   // нормальный ландшафт — исходный путь core
  // повёрнутый режим: игра в ландшафте vh×vw внутри портретного вьюпорта
  const d0=window.devicePixelRatio||1, pw=window.innerWidth, ph=viewH(); const vw=ph, vh=pw;
  const ci=cssInsets(), ti=tgInsets(); const p={l:Math.max(ci.l,ti.l),r:Math.max(ci.r,ti.r),t:Math.max(ci.t,ti.t),b:Math.max(ci.b,ti.b)};
  const ins={l:p.t,r:p.b,t:p.r,b:p.l}; // поворот на 90° по часовой: верх игры у правого края экрана
  const key='R'+pw+'x'+ph+'@'+d0+'|'+ins.l+','+ins.r+','+ins.t+','+ins.b; if(!ORI.rot){ ORI.rot=true; ORI.hint=!oriHintSeen(); }
  if(key===lastWH) return false; lastWH=key; DPR=d0; portrait=false; ORI.pw=pw;
  const dw=Math.round(vw*DPR), dh=Math.round(vh*DPR); SC=Math.max(1,Math.floor(dh/LH));
  W=Math.ceil(dw/SC); H=Math.ceil(dh/SC); cv.width=W; cv.height=H; cv.style.width=(W*SC/DPR)+'px'; cv.style.height=(H*SC/DPR)+'px';
  tcv.width=dw; tcv.height=dh; tcv.style.width=vw+'px'; tcv.style.height=vh+'px'; oriCanvasT('translate('+pw+'px,0) rotate(90deg)');
  const k=DPR/SC; SA.l=Math.ceil(ins.l*k); SA.r=Math.ceil(ins.r*k); SA.t=Math.ceil(ins.t*k); SA.b=Math.ceil(ins.b*k);
  ctx.imageSmoothingEnabled=false; return true; };
function oriRescale(){ oriTG(); return rescale(); }
function oriBurst(){ oriRescale(); for(const ms of [50,300,800]) setTimeout(oriRescale,ms); }
// касания: в повёрнутом режиме переводим экранные координаты в координаты игры и пересылаем событие обработчикам core
const ORI_SYN=new WeakSet();
for(const type of ['pointerdown','pointermove','pointerup','pointercancel']) window.addEventListener(type,e=>{
  if(ORI_SYN.has(e)) return;
  if(type==='pointerdown'&&tg&&!ORI.fsTry){ ORI.fsTry=1; try{ if(tgv('8.0')&&tg.requestFullscreen&&!tg.isFullscreen) tg.requestFullscreen(); }catch(err){} }
  if(ORI.hint){ e.preventDefault(); e.stopImmediatePropagation(); if(type==='pointerdown'){ ORI.tapT=performance.now(); } if(type==='pointerup'&&ORI.tapT&&performance.now()-ORI.tapT<1500){ oriHintDone(); try{ SFX.ui(); }catch(err){} } return; }
  if(!ORI.rot) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const s=new PointerEvent(type,{clientX:e.clientY,clientY:ORI.pw-e.clientX,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary,pressure:e.pressure,width:e.width,height:e.height,buttons:e.buttons,button:e.button,bubbles:true,cancelable:true});
  ORI_SYN.add(s); window.dispatchEvent(s); },{capture:true,passive:false});
// события ориентации/вьюпорта (core уже слушает resize/orientationchange/viewportChanged/fullscreenChanged/safeArea*; добавляем остальное и «очередь» 50/300/800)
window.addEventListener('resize',oriBurst); window.addEventListener('orientationchange',oriBurst);
try{ if(screen.orientation&&screen.orientation.addEventListener) screen.orientation.addEventListener('change',oriBurst); }catch(e){}
try{ if(window.visualViewport) visualViewport.addEventListener('resize',oriBurst); }catch(e){}
try{ if(tg&&tg.onEvent){ for(const ev of ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged']) tg.onEvent(ev,oriBurst); tg.onEvent('fullscreenFailed',x=>{ ORI.log.push('fsFail:'+(x&&x.error)); oriBurst(); }); } }catch(e){}
lastWH=null; oriBurst();
// подсказка поверх игры (рисуется в повёрнутом канвасе, т.е. по-правильному при телефоне боком); пока висит — игра на паузе
window.addEventListener('DOMContentLoaded',()=>{
  const _u=update; update=function(dt){ if(ORI.hint){ G.t+=dt; input.events.length=0; return; } return _u(dt); };
  const _r=render; render=function(){ _r(); if(!ORI.hint) return; G.labels=[]; buttons=[]; clearText(); /* надписи игры живут на текстовом слое — убираем, чтобы подсказка не накладывалась */
    ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='rgba(18,12,24,.78)'; ctx.fillRect(0,0,W,H);
    const cx=Math.round(W/2), cy=Math.round(H*.40), a=Math.max(-1.5708,Math.min(0,Math.sin(G.t*2)*1.2-.4)); ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
    ctx.fillStyle='#120c18'; ctx.fillRect(-18,-30,36,60); ctx.fillStyle='#4a6a8a'; ctx.fillRect(-16,-28,32,56); ctx.fillStyle='#ffe9a8'; ctx.fillRect(-12,-22,24,40); ctx.fillStyle='#120c18'; ctx.fillRect(-3,22,6,3); ctx.restore();
    txt('Поверни телефон боком',W/2,H*.68,14,P.edge,'center'); txt('нажми, чтобы продолжить',W/2,H*.68+20,9,'#fff','center'); };
});
window.__orient=ORI;
