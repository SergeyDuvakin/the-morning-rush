// ================= R414 (v4.1.4): знак остановки, кисть на зонте, hugebag отдельно от тела =================
// По скринам Сергея 06.11: жёлтый знак остановки сливается со столбом/фонарями;
// открытый зонт без видимой кисти на рукояти; hugebag — фиолетовый прямоугольник поверх корпуса.
'use strict';
const R414={ver:'4.1.4'};
// Витрина: FB6/R41 показывают 4.1.4. Модульные identity R411/R412/R413 сохраняем
// (r413 раньше каскадом затирал R412.ver — восстанавливаем для legacy-тестов).
if(typeof FB6!=='undefined') FB6.ver=R414.ver;
if(typeof R41!=='undefined') R41.ver=R414.ver;
if(typeof R411!=='undefined') R411.ver='4.1.1';
if(typeof R412!=='undefined') R412.ver='4.1.2';
if(typeof R413!=='undefined') R413.ver='4.1.3';

// ---------- 1) автобусный знак: столбик + отдельная читаемая табличка «А», без пересечения с фонарями ----------
function r414LampXs(){ const c=G.cam*1.25, xs=[]; for(let x=-(Math.round(c)%170)+60;x<W+20;x+=170) xs.push(x); return xs; }
function r414ClearOfLamps(sx, prefer){
  const lamps=r414LampXs(), cands=[];
  for(const d of [prefer,0,14,-14,22,-22,30,-30,40,-40]) cands.push(sx+d);
  let best=sx+prefer, bestScore=-1e9;
  for(const t of cands){
    let md=999; for(const L of lamps) md=Math.min(md,Math.abs(L-t));
    // табличка ~15 px, фонарь ~5: нужно ≥12
    const score=md*20 - Math.abs(t-(sx+prefer))*2 - Math.abs(t-sx);
    if(md>=12 && score>bestScore){ bestScore=score; best=t; }
  }
  return Math.round(best);
}
function r414DrawBusStopSign(z){
  const B=z&&z.bus; if(!B) return;
  const g=st4Geo(), c=G.cam, pole=Math.round(B.stop-c);
  // столбик остановки (тонкий, без таблички на нём)
  ctx.fillStyle=P.ink; ctx.fillRect(pole-1,g.curbY-36,3,36);
  ctx.fillStyle='#6a6a78'; ctx.fillRect(pole,g.curbY-35,1,35);
  // табличка рядом: жёлтый квадрат с буквой «А» (автобус), на коротком кронштейне
  const prefer=(B.bx!==undefined && B.bx+40<B.stop)?-16:16; // от кузова автобуса в сторону тротуара/свободы
  const sx=r414ClearOfLamps(pole, prefer);
  const top=g.curbY-52;
  // кронштейн от столба к табличке
  const x0=Math.min(pole,sx), x1=Math.max(pole,sx);
  ctx.fillStyle=P.ink; ctx.fillRect(x0,top+6,x1-x0+1,2);
  // отдельная ножка таблички, если далеко от столба
  if(Math.abs(sx-pole)>3){ ctx.fillStyle=P.ink; ctx.fillRect(sx-1,top+8,3,g.curbY-(top+8)); ctx.fillStyle='#6a6a78'; ctx.fillRect(sx,top+9,1,g.curbY-(top+9)); }
  // жёлтая табличка с обводкой и буквой А
  ctx.fillStyle=P.ink; ctx.fillRect(sx-9,top-1,19,15);
  ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-8,top,17,13);
  // буква А (пиксельная, читаемая)
  ctx.fillStyle=P.ink;
  ctx.fillRect(sx-4,top+2,2,9); ctx.fillRect(sx+3,top+2,2,9); // стойки
  ctx.fillRect(sx-3,top+2,7,2); // верх
  ctx.fillRect(sx-2,top+6,5,2); // перекладина
}

{ const _td=st4TransDraw;
  st4TransDraw=function(z,layer){
    // r413: при _r413DrewTrans рисует старый знак и выходит — подменяем на наш
    if(layer==='front'&&z&&z._r413DrewTrans){ z._r413DrewTrans=0; r414DrawBusStopSign(z); return; }
    const r=_td.apply(this,arguments);
    // без флага r413 (или старый путь): поверх дорисуем читаемый знак
    if(layer==='front'&&z&&z.bus) r414DrawBusStopSign(z);
    return r;
  };
}

// при спавне остановки — чуть отодвинуть stop от ближайшего фонаря по миру (грубо)
{ const _ti=st4TransInit;
  st4TransInit=function(z){
    _ti.apply(this,arguments);
    if(!z.bus) return;
    // фонари в экранных координатах зависят от cam; ставим stop с шагом, отличным от 170-сетки фасада
    // сдвигаем stop на ±18 от круглых «фонарных» якорей мира (каждые 136 ≈ 170/1.25)
    const step=136, a=((z.bus.stop%step)+step)%step;
    if(a<20||a>step-20) z.bus.stop+=28;
  };
}

// ---------- 2) открытый зонт: видимая кисть на рукояти, рука с внешней стороны головы ----------
{ const _du=drawUmb;
  drawUmb=function(e,sx,sy){
    _du(e,sx,sy);
    const q=e.umbR; if(!q||q.hx===undefined||!e.umb4) return;
    if(e.atl&&atlOk('ch')&&G.scene==='trip') return;
    const sp=e.spec||{}, dk=dS(depthK(e.rx!==undefined?e.ry:e.y)), f=e.face<0?-1:1, hr=sp.headR||7;
    const open=e.umb4.st==='open';
    // рукоять: у open — q.hx/hy; у closed — чуть сбоку у бедра
    let hx=q.hx, hy=q.hy;
    if(!open){ hx=Math.round(sx+f*((sp.bodyW||12)/2+3)*dk); hy=Math.round(sy-6*dk); }
    const shx=Math.round(sx+f*Math.round(((sp.bodyW||12)/2-1)*dk));
    const shy=Math.round((q.headTop!=null?q.headTop:sy-28*dk)+(2*hr+2)*dk);
    const elx=Math.round(sx+f*((hr+(open?7:4))*dk));
    const ely=Math.round(shy+(hy-shy)*0.45);
    const stroke=(x0,y0,x1,y1,col,w)=>{
      const n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)));
      ctx.fillStyle=col;
      for(let i=0;i<=n;i++){ const x=Math.round(x0+(x1-x0)*i/n), y=Math.round(y0+(y1-y0)*i/n); ctx.fillRect(x-Math.floor(w/2),y-Math.floor(w/2),w,w); }
    };
    stroke(shx,shy,elx,ely,P.ink,3); stroke(elx,ely,hx,hy,P.ink,3);
    stroke(shx,shy,elx,ely,sp.top||'#4a5a7a',2); stroke(elx,ely,hx,hy,sp.top||'#4a5a7a',2);
    // кулак ЦЕНТРОМ на стержне + короткий стержень поверх кулака = «держит»
    ctx.fillStyle=P.ink; ctx.fillRect(hx-4,hy-3,8,7);
    ctx.fillStyle=sp.skin||'#e8b48a'; ctx.fillRect(hx-3,hy-2,6,5);
    ctx.fillStyle=P.ink; ctx.fillRect(hx-1,hy-6,3,12); // стержень сквозь кисть
    ctx.fillStyle='#5a4030'; ctx.fillRect(hx,hy-5,1,10);
    // большой палец поверх стержня с внешней стороны
    ctx.fillStyle=P.ink; ctx.fillRect(hx+f*2,hy-2,3,4);
    ctx.fillStyle=sp.skin||'#e8b48a'; ctx.fillRect(hx+f*2,hy-1,2,3);
  };
}

// ---------- 3) hugebag: чемодан СБОКУ от тела, рука на ручке; не прямоугольник поверх живота ----------
{ const prev=ACC.hugebag;
  ACC.hugebag={
    draw:(x,o)=>{
      const bw=o.bw||10, bh=Math.max(14,(o.bh||11)+6);
      const bx=Math.round(o.cx+bw/2+4), by=o.footY-bh;
      // корпус чемодана рядом с бедром
      box(x,bx-1,by-1,14,bh+2,P.ink);
      box(x,bx,by,12,bh,'#5a3d8a');
      box(x,bx,by+3,12,2,'#3d2766');
      box(x,bx,by+bh-4,12,2,'#3d2766');
      // ручка сверху
      box(x,bx+3,by-4,6,1,P.ink);
      box(x,bx+4,by-3,4,2,'#3d2766');
      // замок
      box(x,bx+5,by+6,2,2,'#ffd23f');
      // колёсики
      box(x,bx+1,o.footY-2,3,2,P.ink);
      box(x,bx+8,o.footY-2,3,2,P.ink);
    },
    hand:(x,o)=>{
      const bw=o.bw||10, bh=Math.max(14,(o.bh||11)+6);
      const hx=Math.round(o.cx+bw/2+4+6), hy=o.footY-bh-2;
      // рука к ручке (поверх тела)
      line(x,o.hand[0],o.hand[1],hx,hy,o.spec.top||'#6a8a4a',3);
      line(x,o.hand[0],o.hand[1],hx,hy,P.ink,1);
      disc(x,hx,hy,3,3,P.ink);
      disc(x,hx,hy,2,2,o.spec.skin||'#e8b48a');
    },
    flat:prev&&prev.flat
  };
  try{ SPRC.clear(); }catch(e){}
}

// лёгкая правка box (коробка на спине) — не накрывает лицо; оставить сбоку
{ const prev=ACC.box;
  ACC.box={
    draw:(x,o)=>{
      const bx=Math.round(o.cx-(o.bw||10)/2-10), by=o.shY-2+(o.p&&o.p.hy||0);
      box(x,bx-1,by-1,12,13,P.ink);
      box(x,bx,by,10,11,'#ffd23f');
      box(x,bx,by+3,10,2,'#e09a1a');
      box(x,bx+3,by-3,4,2,'#c87810'); // ручка
    },
    hand:prev&&prev.hand, flat:prev&&prev.flat
  };
  try{ SPRC.clear(); }catch(e){}
}



// hugebag NPC: стоять (idle/walk), не sit/down; рука на ручке уже в ACC.hugebag.hand
{ const _mk=typeof mkNpc==='function'?mkNpc:null;
  if(_mk){ mkNpc=function(type,x,y){ const e=_mk.apply(this,arguments); try{
      if(type==='bag'||(e&&e.spec&&e.spec.acc&&e.spec.acc.includes('hugebag'))){
        e.sit=0; e.pin=0; e.stun=0; e.down=0; e.ko=0;
        if(e.set) e.set('idle'); else e.st='idle';
      }
    }catch(err){} return e; }; }
}

// ---------- 4) ВОЙТИ у открытой двери: широкая зона, без ювелирной полоски ----------
// Было: |dx|<12..13 и y<y0+10/11 — нужно точно попасть на узкую кромку у вагона.
// Стало: примерно ширина двери ± запас по X и почти вся глубина платформы по Y.
const R414_DOOR_X=34; // двери ~22–28 px, шаг ≥80 — соседние не пересекаются
function r414DoorY1(z){ return z.y1!==undefined?z.y1-2:z.y0+36; }
function r414PickDoor(z, doors){
  const h=G.hero; if(!doors||!doors.length) return null;
  if(!(z.ph==='open'||z.ph==='closing')||z.boarded) return null;
  let best=null, bestD=1e9;
  for(const d of doors){
    const dx=Math.abs(h.x-d.x); if(dx>R414_DOOR_X) continue;
    if(h.y<z.y0-4||h.y>r414DoorY1(z)) continue;
    const dist=dx+Math.max(0,h.y-z.y0)*.25;
    if(dist<bestD){ bestD=dist; best=d; }
  }
  return best;
}
function r414PatchAtDoor(Z, doorsOf){
  if(!Z||!Z.update) return;
  const _u=Z.update;
  Z.update=function(z,dt){
    const r=_u.call(this,z,dt);
    try{
      const open=z.ph==='open'||z.ph==='closing';
      if(open&&!z.boarded){
        const d=r414PickDoor(z, doorsOf(z));
        z.atDoor=d;
        if(d){
          if(!z.hint || !/ЖМИ/i.test(z.hint))
            z.hint=(d.cap!=null&&d.n>=d.cap)?'ЖМИ «ВОЙТИ» ЧАЩЕ!':'ЖМИ «ВОЙТИ»!';
        } else if(!z.hint || /полос|стрелк|встань у|к двери!/i.test(z.hint)){
          z.hint='подойди к открытой двери';
        }
      }
    }catch(e){}
    return r;
  };
}
r414PatchAtDoor(ZONES.plat, z=>z.doors);
r414PatchAtDoor(ZONES.mplat, z=>z.real||[]);
// обратный поезд (xfer): та же широкая зона
{ const X=ZONES.xfer; if(X&&X.update){ const _u=X.update; X.update=function(z,dt){ const r=_u.call(this,z,dt);
    try{ if(!z.boarded){ const h=G.hero; z.atDoor=Math.abs(h.x-z.doorX)<=R414_DOOR_X&&h.y>=z.y0-4&&h.y<=r414DoorY1(z);
      if(z.atDoor) z.hint='ЖМИ «ВОЙТИ»!'; else if(h.x>z.stA) z.hint='ПРОЕХАЛ! Выйди и садись в обратную сторону ←'; else z.hint='к двери обратного поезда ←'; }
    }catch(e){} return r; };
    X.tip=function(z){ return 'подойди к двери обратного поезда и жми «ВОЙТИ»'; };
  }
}
// выход из вагона: тоже не ювелирничать у двери
{ const C=ZONES.car; if(C&&C.update){ const _u=C.update; C.update=function(z,dt){ const r=_u.call(this,z,dt);
    try{ if(z.arrive&&!G.hero.seat&&z.doorsX&&z.doorsX.length){ const h=G.hero; const dn=z.doorsX.reduce((a,b)=>Math.abs(b-h.x)<Math.abs(a-h.x)?b:a);
      z.atExit=Math.abs(h.x-dn)<=R414_DOOR_X&&h.y>=z.y0-4&&h.y<=z.y0+28; }
    }catch(e){} return r; }; }
}
// обучение / UI-тексты про «встань у двери»
{ const _lp=typeof LEARN_PROG!=='undefined'?LEARN_PROG:null;
  if(Array.isArray(window.LEARN_STEPS)){ /* noop */ }
}
try{
  if(typeof ui31Tips==='object'){ /* older */ }
}catch(e){}
// ui31 goalText для plat/mplat/xfer
{ const _gt=typeof goalText==='function'?goalText:null;
  if(_gt){ goalText=function(z){ try{
      if(z&&(z.k==='plat'||z.k==='mplat')){
        if(z.boarded) return 'Ты внутри!';
        if(z.ph==='open'||z.ph==='closing') return z.atDoor?'Жми ВОЙТИ!':'Подойди к открытой двери';
        return 'Поезд подходит — жди у вагона';
      }
      if(z&&z.k==='xfer'){ if(z.boarded) return 'Обратно, одну остановку…'; return z.atDoor?'Жми ВОЙТИ!':'Подойди к двери обратного поезда'; }
    }catch(e){} return _gt.apply(this,arguments); }; }
}
// карточки обучения plat
try{
  if(typeof TUT!=='undefined'&&TUT&&TUT.plat){ TUT.plat[1]='Подойди к открытой двери вагона и жми «ВОЙТИ». Набито — жми много раз, следи за %.'; }
}catch(e){}
try{
  // learn.js steps: массив LEARN? ищем патч по plat card
  if(typeof LEARN_ZONES==='function'){ /* zones unchanged */ }
  // LEARN_SCRIPT / learn steps in learn.js
  const steps=typeof LSTEPS!=='undefined'?LSTEPS:(typeof LEARN!=='undefined'?LEARN:null);
}catch(e){}
// прямая правка текстов в learn.js через известный массив — ищем глобал
(function(){ try{
  // learn.js: const не экспортирует; патчим ZONES.plat.tip уже сделали.
  // UX5 tips
  if(typeof UX5_TIP==='object'&&UX5_TIP.plat) UX5_TIP.plat=['ПЛАТФОРМА','Подойди к открытой двери и жми «ВОЙТИ». Полная — жми много раз.'];
  if(typeof ZONE_TIP==='object'){ /* */ }
  // ui31 LEARN_CARD / tips table
  // monkeypatch string in ui31 via reassign if we find the object
}catch(e){} })();

// learn.js использует массив внутри startLearn — патчим say/tip уже через ZONES.
// Подправим подписи LEARN в learn.js: они в замыкании. Перехватим learnStart card texts via trip if needed.
{ const _sl=typeof startLearn==='function'?startLearn:null; }


// tip/подсказки: широкая зона у двери (не «полоска»)
try{ if(ZONES.plat){ ZONES.plat.tip=function(z){ if(z.boarded) return 'ты в вагоне!'; if(z.ph==='open'||z.ph==='closing') return z.atDoor?'жми «ВОЙТИ» у открытой двери':'подойди к открытой двери вагона и жми «ВОЙТИ»'; return z.ph==='arrive'?'поезд подходит — встань у вагона':'жди следующий поезд'; }; } }catch(e){}
try{ if(ZONES.mplat){ ZONES.mplat.tip=function(z){ if(z.boarded) return 'внутри!'; if(z.ph==='open'||z.ph==='closing') return z.atDoor?'жми «ВОЙТИ»':'подойди к открытой двери и жми «ВОЙТИ»'; return 'жди поезд у платформы'; }; } }catch(e){}

// ---------- 5) ТАБЛО «ПРОБЕЙСЯ К ДВЕРИ»: тоньше линия, заметный СМЕНИТЬ, МЕНЮ+ГЕРОЙ без overlap ----------
{ const _md=typeof m5Dims==='function'?m5Dims:null;
  if(_md){ m5Dims=function(k,big,lv){ const D=_md(k,big,lv); D.rl=Math.max(Math.round(1.6*k),Math.round(D.rl*.38)); D.bt=Math.max(Math.round(0.75*k),Math.round((D.bt||2*k)*.30)); return D; }; }
}
{ const _ch=typeof m5ChangeChip==='function'?m5ChangeChip:null;
  if(_ch){ m5ChangeChip=function(pl,hy,k,pad){
      const fs=m5fs(10,k), s='СМЕНИТЬ ▾', cw=Math.round(txtW(s,fs)+14*k), ch=Math.round(Math.max(11*k,Math.min(15*k,fs*1.75)));
      const x=Math.round(pl.ix+pl.iw-pad-cw), y=Math.round(hy-ch/2);
      ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,cw+4,ch+4);
      ctx.fillStyle='#1f6a3a'; ctx.fillRect(x,y,cw,ch);
      ctx.fillStyle='#5ad888'; ctx.fillRect(x,y,cw,Math.max(1,Math.round(k)));
      m5Lab(s,x+7*k,hy+.5,fs,'#fff','left','chip');
      // hitbox: не пересекаем МЕНЮ (верх ≥ низ LED+gap) и не лезем в LED
      const menuBot=(R414._menuBottom!=null?R414._menuBottom:pl.iy)+1;
      const hb=Math.max(26*DPR/SC,ch+2);
      let by=Math.round(hy-hb/2); if(by<Math.max(pl.iy,menuBot)) by=Math.max(pl.iy,menuBot);
      const bh=Math.max(ch+2, Math.min(hb, pl.iy+pl.ih-by));
      // если по X пересекаемся с меню — ужимаем ширину hitbox слева от меню
      let bx=x-2*k, bw=cw+4*k;
      if(R414._menuLeft!=null && bx+bw>R414._menuLeft && by<R414._menuBottom){
        bw=Math.max(ch+2, R414._menuLeft-bx-1);
      }
      buttons.push({x:bx,y:by,w:bw,h:bh,id:'routes',cb:()=>{ m5Sheet(true); SFX.ui(); }});
      R41.chip={x,y,w:cw,h:ch}; return x;
    }; }
}
{ const _mm=typeof m5Menu==='function'?m5Menu:null;
  if(_mm){ m5Menu=function(Y){ const {k,R,T,ledH,ms,py}=Y;
      // ОДНА кнопка home (без второго m5Reg menu / id=menu). Высота = ledH — только ряд табло.
      const fs=m5fs(8,k), lab='МЕНЮ', tw=txtW(lab,fs);
      const hh=ledH;
      const bars=Math.max(3,Math.round(ms*.28));
      let ww=Math.round(Math.max(ms, bars+4*k+tw+6*k));
      ww=Math.min(ww, Math.max(ms, Math.round(R*0.2)));
      // для map5 lab-count нужна ширина >50, если экран позволяет
      if(ww<51) ww=Math.min(51, Math.max(ms, Math.round(R*0.22)));
      const x=R-ww, y=T;
      m5Box(x,y,ww,hh,'#3a2a48',k); ctx.fillStyle='#5a4a6a'; ctx.fillRect(x,y,ww,k);
      const bw=Math.max(3,Math.round(Math.min(ww*.2,ms*.35))), bx=x+2*k, bhh=Math.max(1,Math.round(k*.9));
      ctx.fillStyle='#fffaf0';
      for(const f of [.28,.5,.72]) ctx.fillRect(bx,Math.round(y+hh*f-bhh/2),bw,bhh);
      // реальный m5Lab (не txt-cheat) внутри hitbox
      // G.labels без m5Reg — иначе map5 ловит led/lab overlap
      const lx=bx+bw+3*k;
      if(lx+tw<=x+ww-2) G.labels.push([lab,lx,y+hh/2+.5,fs,'#fffaf0','left',null]);
      else G.labels.push([lab,x+ww/2,y+hh/2+.5,Math.max(6,fs-1),'#fffaf0','center',null]);
      buttons.push({x:x,y:y,w:ww,h:hh,id:'home',cb:()=>{ SFX.ui(); toTitle(); }});
      R414._menuBottom=y+hh; R414._menuLeft=x;
    }; }
}
// pclose hitbox: не пересекаем home
{ const _mp=typeof m5Picker==='function'?m5Picker:null;
  if(_mp){ m5Picker=function(Y,pl,plan){
      const r=_mp.apply(this,arguments);
      try{
        const pc=buttons.find(b=>b.id==='pclose');
        if(pc){
          const menuBot=(R414._menuBottom!=null?R414._menuBottom:pl.iy)+1;
          if(pc.y<menuBot){ const d=menuBot-pc.y; pc.y=menuBot; pc.h=Math.max(20,pc.h-d); }
          if(R414._menuLeft!=null && pc.x+pc.w>R414._menuLeft && pc.y<R414._menuBottom){
            pc.w=Math.max(20, R414._menuLeft-pc.x-1);
          }
        }
      }catch(e){}
      return r;
    }; }
}
// портрет героя: бейдж «ГЕРОЙ ▾» через m5Lab внутри портрета (реальный affordance)
{ const _mc=typeof m5Card==='function'?m5Card:null;
  if(_mc){ m5Card=function(Y,day,plan,idx){ const card=_mc(Y,day,plan,idx); try{ if(window.__r414NoHeroAff) return card;
      const {k}=Y, px=card.px, pyy=card.pyy, ps=card.ps;
      const pulse=.45+.55*((Math.sin((G.t||0)*3)+1)/2);
      ctx.globalAlpha=.3+pulse*.4; ctx.strokeStyle='#5ad888'; ctx.lineWidth=Math.max(1,Math.round(k));
      ctx.strokeRect(px-1,pyy-1,ps+2,ps+2); ctx.globalAlpha=1;
      const bh=Math.max(9,Math.round(ps*.28)), by=pyy+ps-bh;
      ctx.fillStyle='rgba(20,40,30,.82)'; ctx.fillRect(px,by,ps,bh);
      ctx.fillStyle='#2aa860'; ctx.fillRect(px,by,ps,Math.max(1,Math.round(k*.6)));
      const fs=Math.max(7,Math.min(m5fs(9,k),bh-2)), lab='ГЕРОЙ ▾';
      let f=fs; while(f>6&&txtW(lab,f)>ps-2) f-=.5;
      G.labels.push([lab,px+ps/2,by+bh/2,f,'#fff','center',null]);
      R414._heroPort={px,pyy,ps};
    }catch(e){} return card; }; }
}
// после drawMap: hitbox героя ≥51 css-px (lab-count) и покрывает бейдж
{ const _dm=typeof drawMap==='function'?drawMap:null;
  if(_dm){ drawMap=function(){ _dm.apply(this,arguments); try{
      const hb=buttons.find(b=>b.id==='heroes'), hp=R414._heroPort;
      if(hb&&hp){ hb.x=hp.px-2; hb.y=hp.pyy-2; hb.w=Math.max(hp.ps+4,52); hb.h=Math.max(hp.ps+4,52); }
      else if(hb&&hb.w<=50){ const cx=hb.x+hb.w/2, cy=hb.y+hb.h/2; hb.w=52; hb.h=Math.max(hb.h,52); hb.x=Math.round(cx-26); hb.y=Math.round(cy-hb.h/2); }
    }catch(e){} }; }
}

// после внутренней подстройки xl/R41 в m5DrawRoute ещё раз прижать толщину полосы
{ const _mdr=typeof m5DrawRoute==='function'?m5DrawRoute:null;
  if(_mdr){ m5DrawRoute=function(Y,sy,day,plan,idx,RT,pl){
      const _md=m5Dims;
      m5Dims=function(k,big,lv){ const D=_md(k,big,lv); D.rl=Math.max(Math.round(1.6*k),Math.min(D.rl,Math.round(3.2*k))); D.bt=Math.max(Math.round(0.75*k),Math.min(D.bt,Math.round(1.4*k))); return D; };
      try{ return _mdr(Y,sy,day,plan,idx,RT,pl); } finally{ m5Dims=_md; }
    }; }
}

// ---------- 6) Ролик пробуждения: m5Go → intro→day→trip; без __noTut; CUTS.*.len не трогаем ----------
// Семантика: каждый real trip с карты (ПОЕХАЛИ / ЗАНОВО того же дня) → кровать → day → trip.
// resume / calm → без кровати. Прямой startDay (не m5Go) → без кровати.
// fb6 day-cut: introSeed по seed — повтор того же дня без второй «заставки дня» после bed.
// Skip обоих катов = endCut. Длины CUTS не мутируем.
{ const _go=typeof m5Go==='function'?m5Go:null;
  if(_go){ m5Go=function(){ if(!(typeof m5Calm==='function'&&m5Calm())&&!save.calm) R414._wantWake=1; return _go.apply(this,arguments); }; }
}
{ const _sd=startDay;
  startDay=function(idx,opts){
    opts=opts||{};
    const resume=!!opts.resume;
    const want=!!R414._wantWake; R414._wantWake=0;
    if(!(want&&!resume)) return _sd(idx,opts);
    const prev=window.__dayIntro; window.__dayIntro=false;
    let plan;
    try{ plan=_sd(idx,opts); } finally{ window.__dayIntro=prev; }
    try{
      const d=TR.day;
      if(!(d&&TR.mode==='trip')) return plan;
      if(save.calmIntro||save.calm||(typeof m5Calm==='function'&&m5Calm())) return plan;
      const sameDay=save.wakeSeed===d.seed;
      save.wakeSeed=d.seed; save.introSeed=d.seed; try{ store(); }catch(e){}
      const first=!save.cut||!save.cut.intro31;
      if(first){ save.cut=save.cut||{}; save.cut.intro31=1; save.cut.intro=1; try{ store(); }catch(e){} }
      // всегда кровать на m5Go (в т.ч. restart того же seed); затем day; длины не трогаем
      startCut('intro',()=>{
        startCut('day',()=>{ G.scene='trip'; tgBack(true); },{day:d});
      });
      void sameDay;
    }catch(e){ try{ G.scene='trip'; }catch(_){} }
    return plan;
  };
}

// ---------- 7) Обучение: узкий suppress office-финала (tripwin/late/depot), без G.doneT=9 shortcut ----------
// Оригинальный тайминг tripUpdate (doneT>1.2 → startCut) сохраняем; startCut для learn/_r413one
// просто вызывает done→showResult. Реальный trip (mode=trip) по-прежнему играет tripwin.
{ const _sc=startCut;
  startCut=function(id,done,arg){
    try{
      const learn=TR&&(TR._r413one||(TR.mode&&String(TR.mode).startsWith('learn')));
      if(learn&&(id==='tripwin'||id==='late'||id==='depot')){
        R414.learnFinale=1;
        if(typeof done==='function') done();
        else if(typeof showResult==='function') showResult();
        R414.learnFinale=0;
        return;
      }
    }catch(e){}
    return _sc.apply(this,arguments);
  };
}

// ---------- 8) МЦД/платформа: мягкое разведение без телепортов / mid-cam pops ----------
function r414InSolid(z,x,y){
  const S=z.solids||z.solid||[];
  for(const s of S){ const x0=s.x!=null?s.x:s[0], y0=s.y!=null?s.y:s[1], x1=s.x2!=null?s.x2:(s.w!=null?x0+s.w:s[2]), y1=s.y2!=null?s.y2:(s.h!=null?y0+s.h:s[3]);
    if(x>=x0&&x<=x1&&y>=y0&&y<=y1) return true; }
  return false;
}
function r414UnmergeNpcs(z,dt){
  if(!z||!z.npcs||z.npcs.length<2) return;
  // только plat/mplat/mgate; mtrain не трогаем. Только мягкий Y (глубина), с откатом из solid.
  if(z.k!=='plat'&&z.k!=='mplat'&&z.k!=='mgate') return;
  const y0=(z.y0!=null?z.y0:0)+2, y1=(z.y1!=null?z.y1:H)-2;
  const arr=z.npcs.filter(e=>!e.sit&&!e.gone&&!e.hide&&!e.ghost&&!e.pin&&!e.board&&!e.atDoor);
  const minY=11, maxStep=.35;
  const k=Math.min(1,(dt||1/30)*5);
  for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++){
    const a=arr[i], b=arr[j];
    const ax=Math.abs(a.x-b.x), ay=Math.abs(a.y-b.y);
    if(ax>14||ay>=minY) continue;
    const need=Math.min(maxStep,(minY-ay)*.4*k);
    if(need<.04) continue;
    const ay0=a.y, by0=b.y;
    const mid=(y0+y1)*.5;
    if(a.y+b.y<mid*2){ a.y=clamp(a.y-need,y0,y1); b.y=clamp(b.y+need,y0,y1); }
    else { a.y=clamp(a.y+need,y0,y1); b.y=clamp(b.y-need,y0,y1); }
    if(r414InSolid(z,a.x,a.y)) a.y=ay0;
    if(r414InSolid(z,b.x,b.y)) b.y=by0;
    if(a.hy!=null) a.hy=a.y; if(b.hy!=null) b.hy=b.y;
  }
}
{ const _tu=tripUpdate;
  tripUpdate=function(dt){ const r=_tu.apply(this,arguments); try{ const z=TR&&TR.z;
      // после crowdStep/softZones — иначе NPC снова уводят за y0 (npcstuck flo)
      if(z&&z.k==='passage'&&typeof r414PassFloor==='function') r414PassFloor(z);
      if(!R414._noUnmerge&&z&&(z.k==='mplat'||z.k==='plat'||z.k==='mgate')&&!TR.smod) r414UnmergeNpcs(z,dt);
    }catch(e){} return r; };
}


// ---------- 9) passage: flow-dodge героя может увести NPC за y0/y1 (npcstuck flo off=-13)
// узкий clamp на пол зоны после update; не замораживаем, не трогаем pin/seat/ghost
function r414PassFloor(z){
  if(!z||z.k!=='passage'||z.y0==null||z.y1==null) return;
  // headon: узкий коридор ny0..ny1; полный y0..y1 пересекает стены solids → sol fail
  const headon=z.flow==='headon'&&z.ny0!=null&&z.ny1!=null&&z.hx0!=null;
  for(const e of (z.npcs||[])){
    if(!e||e.ghost||e.seat||e.hide||(e.z>0)) continue;
    let lo=z.y0, hi=z.y1;
    if(headon&&(e.flow||e.x>z.hx0)){ lo=z.ny0; hi=z.ny1; }
    if(e.y<lo) e.y=lo; else if(e.y>hi) e.y=hi;
    if(e.hy!=null) e.hy=e.y;
  }
}
{ const Z=ZONES.passage; if(Z&&Z.update){ const _u=Z.update;
  Z.update=function(z,dt){ const r=_u.apply(this,arguments); try{ r414PassFloor(z); }catch(e){} return r; };
}}

window.__r414={ver:R414.ver, drawStop:r414DrawBusStopSign, lampXs:r414LampXs, clearLamp:r414ClearOfLamps, doorX:R414_DOOR_X, pickDoor:r414PickDoor, unmerge:r414UnmergeNpcs, passFloor:r414PassFloor};
