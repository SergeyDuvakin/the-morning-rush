'use strict';
// ================= E3-8 / UX5: принятые экраны аудита (audit_1..4 + обучение в мире) =================
// 1) компактный тост-подсказка (не блокирует) 2) карточка итогов дня поверх кадра концовки 3) выбор героя
// 4) титул с одной кнопкой ИГРАТЬ + иконки 5) обучение внутри мира (тосты-шаги + рука-указатель, без чёрного экрана)
const UX5={toast:null,coach:null,resBg:null,rects:[]};
const UXC={ink:'#120c18',cream:'#fff6e4',pink:'#d8265e',green:'#2aa860',red:'#c8304a',gold:'#ffd23f',dim:'rgba(18,12,24,.55)'};
function ux5Reg(kind,x,y,w,h){ const r={kind,x,y,w,h}; UX5.rects.push(r); return r; }
function ux5Box(x,y,w,h,fill,sh){ x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h); if(sh){ ctx.fillStyle=UXC.ink; ctx.fillRect(x+2,y+2,w+2,h+2); } ctx.fillStyle=UXC.ink; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=fill; ctx.fillRect(x,y,w,h); }
function ux5Fit(s,size,maxW){ if(txtW(s,size)<=maxW) return s; let t=s; while(t.length>2&&txtW(t+'…',size)>maxW) t=t.slice(0,-1); return t+'…'; }
// пиксельные иконки 9×9: '#'=цвет, 'o'=контур, 'w'=блик
const UX5ICO={
 coin:['..ooooo..','.o#####o.','o#wdddd#o','o#d###d#o','o#d#w#d#o','o#d###d#o','o#dddd##o','.o#####o.','..ooooo..'],
 gear:['...o.o...','.oo###oo.','.o#####o.','o##ooo##o','.##o.o##.','o##ooo##o','.o#####o.','.oo###oo.','...o.o...'],
 bolt:['.....ooo.','....o##o.','...o##o..','..o##ooo.','.o######o','.ooo##o..','..o##o...','.o##o....','.ooo.....'],
 help:['..ooooo..','.o#####o.','o##ooo##o','.ooo.o##o','...o##oo.','...o##o..','...oooo..','...o##o..','...oooo..'],
 hand:['...oo.....','..o##o....','..o##o....','..o##ooo..','..o##o##oo','oo.o#####o','o#oo#####o','.o#######o','..o######o','...o####o.','....oooo..']};
function ux5Ico(name,x,y,s,col){ const m=UX5ICO[name]; for(let j=0;j<m.length;j++) for(let i=0;i<m[j].length;i++){ const c=m[j][i]; if(c==='.') continue; ctx.fillStyle=c==='o'?UXC.ink:c==='w'?'#fff':c==='d'?shade(col,-.35):col; ctx.fillRect(Math.round(x+i*s),Math.round(y+j*s),s,s); } }
function ux5IcoBtn(name,x,y,sz,bg,fg,id,cb){ ux5Box(x,y,sz,sz,bg,true); ctx.fillStyle=shade(bg,.25); ctx.fillRect(Math.round(x),Math.round(y),Math.round(sz),2); const s=Math.max(1,Math.floor((sz-6)/9)); ux5Ico(name,Math.round(x+sz/2-4.5*s),Math.round(y+sz/2-4.5*s),s,fg);
  buttons.push({x,y,w:sz,h:sz,id,icon:1,cb:()=>{ SFX.ui&&SFX.ui(); cb(); }}); ux5Reg('ico',x-2,y-2,sz+4,sz+4); }
function ux5K(){ return Math.max(1,Math.round(DPR/SC*2)/2); }   // множитель «экранных» px в игровые

// ---------- 1. ТОСТ-ПОДСКАЗКА ----------
const TUT5={gate:['ТУРНИКЕТЫ','в хвост очереди · зевака → «ВЛЕЗТЬ»'],esc:['ЭСКАЛАТОР','справа стоят · шагни влево ←'],
  passage:['ПЕРЕХОД','иди вправо · встречных обходи'],plat:['ПЛАТФОРМА','у двери · открылась → «ВОЙТИ»'],
  car:['ВАГОН','зелёное — место · «!» — тряхнёт'],exitz:['ВЫХОД','обходи встречных и беги вправо →'],escape:['ПРОБИТЬСЯ','двери открыты 8 с → «ВЫЙТИ»']};
// куда показывает рука в первой поездке (обучение в мире)
const TUT5P={gate:'stick',esc:'left',plat:'A',escape:'A'};
function ux5ToastShow(title,text,opt){ UX5.toast=Object.assign({title,text,t:0,life:5},opt||{}); }
// tutCheck/drawTut из ui31 остаются как источник «первой встречи», но карточка → тост, игра не замирает
tutCheck=function(){ const z=TR.z; if(!z||TR.mode==='learn') return; save.tut=save.tut||{}; if(UX5.toast&&UX5.toast.k&&UX5.toast.k!==z.k&&UX5.toast.zone!==TR.zi) UX5.toast=null;
  if(!save.tut[z.k]&&TUT5[z.k]&&!window.__noTut){ save.tut[z.k]=1; store(); const d=TUT5[z.k]; ux5ToastShow(d[0],d[1],{k:z.k,zone:TR.zi,point:save.learned?null:TUT5P[z.k]}); } };
drawTut=function(){};
{ const _tu=tripUpdate; tripUpdate=function(dt){ if(TR.tut) TR.tut=null; const r=_tu(dt); if(!paused){ if(UX5.toast){ UX5.toast.t+=dt; if(UX5.toast.t>UX5.toast.life) UX5.toast=null; } if(UX5.coach) UX5.coach.t+=dt; } return r; }; }
function ux5ToastRect(){ const T=SA.t+3, w=Math.round(Math.min(Math.max(196,W*.4),300,W-SA.l-SA.r-200)), h=Math.round(Math.max(30,34*ux5K())); const pb=buttons.find(b=>b.id==='pause'), y=Math.max(T+50,pb?Math.round(pb.y+pb.h+6):0), xr=W-SA.r-12; return {x:xr-w,y,w,h}; }
function ux5DrawToast(c,stepTag){ if(!c) return; const a=Math.min(1,c.t*6, c.life?Math.max(0,(c.life-c.t)*3):1); if(a<=0) return; const r=ux5ToastRect(), slide=Math.round((1-Math.min(1,c.t*6))*12);
  const x=r.x+slide, y=r.y, w=r.w, h=r.h; UX5.hudHit=[]; G.labels=G.labels.filter((l,li)=>{ if(typeof l[0]!=='string') return true; const lw=txtW(l[0],l[3]), al=l[5]||'center', lx=al==='center'?l[1]-lw/2:al==='right'?l[1]-lw:l[1], lh=Math.max(l[3],MINPX())*.7; const hit=lx<x+w+4&&lx+lw>x-4&&l[2]-lh<y+h+4&&l[2]+lh>y-4; if(hit&&UX5.hud0!==undefined&&li>=UX5.hud0) UX5.hudHit.push(l[0]); return !hit; }); ctx.globalAlpha=a; ux5Box(x,y,w,h,UXC.cream,true); ctx.fillStyle=UXC.pink; ctx.fillRect(x+1,y+1,3,h-2);
  const bs=Math.min(h-12,16), bx=x+w-bs-6, by=y+5; ctx.fillStyle=UXC.ink; ctx.fillRect(bx,by,bs,bs); ctx.fillStyle='#efe4cc'; ctx.fillRect(bx+1,by+1,bs-2,bs-2); ctx.globalAlpha=1;
  const f1=7, f2=7, tw=w-bs-18; G.labels.push([ux5Fit((stepTag?stepTag+' · ':'')+c.title,f1,tw),x+9,y+h*.3,f1,UXC.pink,'left',null]); G.labels.push([ux5Fit(c.text,f2,tw),x+9,y+h*.7,f2,'#1a1020','left',null]); G.labels.push(['×',bx+bs/2,by+bs/2,9,'#1a1020','center',null]);
  buttons.push({x:bx-4,y:by-4,w:bs+8,h:bs+8,id:c.skipId||'tutx',icon:1,cb:()=>{ if(c.onX) c.onX(); else UX5.toast=null; }}); ux5Reg('toast',x-1,y-1,w+4,h+4); }
// рука-указатель (обучение в мире): у джойстика / у кнопки действия / стрелка «влево»
function ux5Point(kind,t){ const k=Math.max(1,Math.floor(ux5K())), bob=Math.round(Math.sin(t*6)*2*k); let x,y;
  if(kind==='stick'){ const B=STICK_BASE(); x=B.x+B.r*.4; y=B.y-B.r*.1+bob; ux5Ring(B.x,B.y,B.r+3+Math.round((t*1.5%1)*4),'#ffd23f'); }
  else if(kind==='A'||kind==='B'){ const hr=hudRects().find(q=>q.id===kind); if(!hr) return; x=hr.x+hr.w*.5; y=hr.y+hr.h*.45+bob; ux5RectPulse(hr,t); }
  else if(kind==='left'||kind==='right'){ const h=G.hero; if(!h) return; const hx=Math.round(h.x-G.cam), hy=Math.round(h.y-56); const d=kind==='left'?-1:1, ox=Math.round(Math.sin(t*6)*3)*d; ctx.fillStyle=UXC.ink; for(let i=0;i<5;i++){ ctx.fillRect(hx+d*(4+i)+ox-(d<0?0:0),hy-i-1,2,2*i+3); } ctx.fillStyle=UXC.gold; for(let i=0;i<4;i++){ ctx.fillRect(hx+d*(4+i)+ox,hy-i,1,2*i+1); } ctx.fillRect(hx+ox-d*6-(d<0?0:4),hy-1,10,2); return; }
  else if(kind==='hero'){ const h=G.hero; if(!h) return; ux5Ring(Math.round(h.x-G.cam),Math.round(h.y-20),26+Math.round((t*1.5%1)*4),'#ffd23f'); return; }
  else return; ux5Ico('hand',Math.round(x),Math.round(y),k,'#fff'); }
function ux5Ring(cx,cy,r,col){ ctx.fillStyle=col; for(let a=0;a<48;a++){ const an=a/48*Math.PI*2; ctx.fillRect(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),2,2); } }
function ux5RectPulse(r,t){ const p=Math.round((t*1.5%1)*3); ctx.fillStyle='#ffd23f'; ctx.fillRect(r.x-2-p,r.y-2-p,r.w+4+2*p,1); ctx.fillRect(r.x-2-p,r.y+r.h+1+p,r.w+4+2*p,1); ctx.fillRect(r.x-2-p,r.y-2-p,1,r.h+4+2*p); ctx.fillRect(r.x+r.w+1+p,r.y-2-p,1,r.h+4+2*p); }
{ const _h=tripHUD; tripHUD=function(){ UX5.rects=[]; UX5.hud0=G.labels.length; _h.apply(this,arguments); if(paused||TR.done) return;
  if(TR.mode==='learn'&&UX5.coach){ G.labels=G.labels.filter(l=>!/^ОБУЧЕНИЕ \d/.test(l[0])); ux5DrawCoach(); } else if(UX5.toast){ ux5DrawToast(UX5.toast); if(UX5.toast&&UX5.toast.point&&UX5.toast.t<UX5.toast.life) ux5Point(UX5.toast.point,UX5.toast.t); } }; }
{ const _st=startTrip; startTrip=function(){ UX5.toast=null; UX5.coach=null; return _st.apply(this,arguments); }; if(window.__trip) __trip.startTrip=startTrip; }

// ---------- 5. ОБУЧЕНИЕ В МИРЕ: шаги learn.js без модальной карточки ----------
const LSTEP5=[['подвигай героя джойстиком','stick'],['нажми ТОЛКНУТЬ — кнопка справа','A'],['жетона нет — касса слева ←','left'],['встань в хвост очереди','hero'],['зевака с телефоном → «ВЛЕЗТЬ»','B'],['проходи турникет и иди вправо →','right'],
  ['шагни влево — пешком быстрее','left'],['встань у двери · открылась → «ВОЙТИ»','A'],['сядь на зелёное или держись','hero'],['мигает «!» — сейчас тряхнёт','hero'],['твоя станция — к двери и выходи','A'],['обходи встречных и беги вправо →','right']];
{ const _tl=tripUpdate; tripUpdate=function(dt){ if(TR.mode==='learn'&&!TR.done&&TR.lcard){ TR.lcard=null; UX5.coach={i:TR.ls,t:0}; } if(TR.mode==='learn'&&UX5.coach&&UX5.coach.i!==TR.ls&&!TR.lshown) UX5.coach=null; return _tl(dt); }; }
drawLearnCard=function(){};
function ux5DrawCoach(){ const c=UX5.coach, st=learnStep(); if(!st||!c) return; const d=LSTEP5[TR.ls]||[st[3],'hero'];
  // мир остаётся видимым: лёгкое затемнение краёв (≈40% по краям, центр чистый) — вместо чёрного экрана
  if(c.t<1.2){ const a=.4*Math.max(0,1-c.t/1.2); ctx.fillStyle='rgba(18,12,24,'+a.toFixed(3)+')'; ctx.fillRect(0,0,W,H); }
  ux5DrawToast({title:st[1],text:d[0],t:c.t,life:0,skipId:'learnskip',onX:()=>learnQuit()},'ШАГ '+(TR.ls+1)+'/'+LSTEPS.length); ux5Point(d[1],c.t); }

// ---------- 4. ТИТУЛ: одна ИГРАТЬ + иконки в углу ----------
{ const _dt=drawTitle; drawTitle=function(){ if(G.lpick||G.settings) return _dt.apply(this,arguments); UX5.rects=[]; G.labels=[]; buttons=[]; drawBG(G.t*20); G.labels=[]; ctx.fillStyle='rgba(18,12,24,.5)'; ctx.fillRect(0,0,W,H);
  const by=FY1; for(const c of TITLE.crowd){ const x=((c.x*W*1.4+G.t*24*c.sp)%(W*1.4))-W*.2; const img=personSprite(c.spec,'walk',Math.floor(G.t*10*c.sp+c.ph)%8,'norm',Math.floor(G.t*10)); ctx.globalAlpha=.6; ctx.drawImage(img,Math.round(x-32),Math.round(by-4-(c.ph%3)*5-60)); ctx.globalAlpha=1; }
  const op=()=>!(window.__econ&&__econ.isOpen()), L=SA.l+8, T=SA.t+8, ib=Math.round(Math.max(24,36*DPR/SC)), gap=Math.round(ib*.3);
  ux5IcoBtn('coin',L,T,ib,'#3a2a48',UXC.gold,'econ',()=>{ if(op()) __econ.open(); });
  ux5IcoBtn('gear',L+ib+gap,T,ib,'#3a2a48','#b8c4d8','settings',()=>{ if(op()) G.settings=true; });
  ux5IcoBtn('bolt',L+2*(ib+gap),T,ib,'#2a3a78',UXC.gold,'exit',()=>{ if(op()) startExit(); });
  ux5IcoBtn('help',L+3*(ib+gap),T,ib,'#1f6a46','#fff','learn',()=>{ if(op()){ if(save.learned&&typeof startLearnStreet==='function'&&typeof unl4==='function'&&unl4('street1')) G.lpick=1; else startLearn(); } });
  // логотип на тёмной плашке
  const ly=Math.round(Math.max(T+ib+18,H*.24)), wob=Math.round(Math.sin(G.t*3)); const lw=Math.min(W-2*(SA.l+SA.r)-40,Math.max(txtW('ДАВКА ДО РАБОТЫ',22)+40,200)), lh=46;
  ctx.fillStyle='rgba(18,12,24,.72)'; ctx.fillRect(Math.round(W/2-lw/2),ly-16,Math.round(lw),lh); ux5Reg('logo',W/2-lw/2,ly-16,lw,lh);
  G.labels.push(['ДАВКА ДО РАБОТЫ',W/2,ly+wob,22,P.edge,'center',UXC.ink]); G.labels.push(['успей к 09:00',W/2,ly+20,9,'#fff']);
  buttons.push({x:W/2-lw/2,y:ly-16,w:lw,h:lh,id:'logo',icon:1,cb:()=>{ logoTaps++; SFX.squeak(); if(logoTaps>=7&&!save.eggs.metrofan){ save.eggs.metrofan=true; store(); say('Кот Метрофан вышел из туннеля!',3,P.neonLime); } }});
  const bw=Math.round(Math.min(W*.4,220)), bh=Math.round(Math.max(40,62*DPR/SC)), bx=Math.round(W/2-bw/2), y0=Math.round(ly+lh+Math.max(10,H*.05));
  bigBtn('ИГРАТЬ ▶',bx,y0,bw,bh,'#d8265e',()=>{ if(!op()) return; if(!save.cut.intro31){ save.cut.intro31=1; save.cut.intro=1; store(); startCut('intro',()=>startCut('metro',()=>toMap())); } else toMap(); },'play',16); ux5Reg('play',bx-2,y0-2,bw+4,bh+4);
  if(!save.learned){ const s='впервые? → короткое обучение внутри первой поездки'; ctx.fillStyle='rgba(18,12,24,.72)'; ctx.fillRect(Math.round(W/2-txtW(s,7)/2-8),y0+bh+5,Math.round(txtW(s,7)+16),14); G.labels.push([s,W/2,y0+bh+12,7,'#d8f0c0']); ux5Reg('hint',W/2-txtW(s,7)/2,y0+bh+6,txtW(s,7),12); }
  else if(save.escBest){ const s='рекорд прорыва ⚡ '+save.escBest.toFixed(1)+' с'; ctx.fillStyle='rgba(18,12,24,.72)'; ctx.fillRect(Math.round(W/2-txtW(s,7)/2-8),y0+bh+5,Math.round(txtW(s,7)+16),14); G.labels.push([s,W/2,y0+bh+12,7,'#aaa']); ux5Reg('hint',W/2-txtW(s,7)/2,y0+bh+6,txtW(s,7),12); }
  if(G.msg){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else G.labels.push([G.msg.s,W/2,H-SA.b-14,9,G.msg.col]); }
  if(window.__econ&&__econ.isOpen()) drawEcon(); }; }

// ---------- 2. КАРТОЧКА ИТОГОВ поверх кадра концовки ----------
{ const _sr=showResult; showResult=function(){ try{ const c=ctx.canvas; if(c&&c.width){ const s=UX5.resBg&&UX5.resBg.width===c.width&&UX5.resBg.height===c.height?UX5.resBg:document.createElement('canvas'); s.width=c.width; s.height=c.height; s.getContext('2d').drawImage(c,0,0); UX5.resBg=s; } }catch(e){ UX5.resBg=null; } return _sr.apply(this,arguments); }; }
function ux5ResBg(){ const b=UX5.resBg; if(b&&b.width===ctx.canvas.width&&b.height===ctx.canvas.height){ ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(b,0,0); ctx.restore(); } else { ctx.fillStyle='#2a1d33'; ctx.fillRect(0,0,W,H); } ctx.fillStyle='rgba(18,12,24,.62)'; ctx.fillRect(0,0,W,H); }
function ux5Arrive(){ const mm=Math.max(0,Math.min(59,59-Math.ceil(TR.tLeft/TR.tTotal*20))); return '08:'+String(mm).padStart(2,'0'); }
drawResult=function(){ G.labels=[]; buttons=[]; UX5.rects=[]; ux5ResBg(); const w=TR.win, esc=TR.mode==='escape';
  const bh=Math.round(Math.max(28,46*DPR/SC)), cw=Math.round(Math.min(W-SA.l-SA.r-24,340)), cx=Math.round(W/2-cw/2), rh=11, pad=10;
  let head, hcol, rows=[], lines=[], stars=w&&!esc;
  if(esc){ head=w?'ВЫРВАЛСЯ за '+TR.escT.toFixed(1)+' с':'НЕ УСПЕЛ ВЫЙТИ'; hcol=w?UXC.green:UXC.red; rows=[['Рекорд',save.escBest?save.escBest.toFixed(1)+' с':'—'],['Монеты',w?'+2':'0']]; if(w&&TR.escNew) lines.push(['НОВЫЙ РЕКОРД!',P.neonLime]); }
  else { head=w&&TR.wk?(TR.wk.sun?'ВОСКРЕСЕНЬЕ':'СУББОТА')+' — ВЫХОДНОЙ!':w?'УСПЕЛ! '+ux5Arrive():TR.reason==='depot'?'УЕХАЛ В ДЕПО':'ОПОЗДАЛ · 09:00'; hcol=w?UXC.green:UXC.red;
    rows=w?(typeof dayStats5==='function'?dayStats5():[['Очки',TR.score],['Запас',Math.round(TR.tLeft)+' с'],['В вагоне',TR.spotName],['Скандалы',TR.scandals],['Монеты','+'+TR.coinsGot]]):[['Где застрял',ZONES[TR.z.k].title(TR.z)],['Скандалы',TR.scandals],['Монеты','+'+(TR.coinsGot|0)]];
    const pts=tripPts(), nu=[...(TR.newSt||[]).map(s=>'станция «'+s+'»'),...(TR.newUnlocks||[])];
    if(w&&nu.length) lines.push(['ОТКРЫТО: '+nu.slice(0,3).join(', ')+(nu.length>3?'…':''),'#1f8a4a']); else { if(typeof rt41NextLine==='function'){ if(TR.mode==='trip') lines.push([rt41NextLine(),'#5a4a6a']); } else { const n=ST_THR.findIndex(t=>t>pts); if(n>0) lines.push(['до станции «'+LEVELS[n].name+'»: ещё '+(ST_THR[n]-pts)+' очк.','#5a4a6a']); } }
    if(TR.day){ const d=TR.day, tk=TR.task; lines.push([WD4[d.weekday]+' · '+DAYTYPE4[d.type].n+(tk?' · '+tk.n+(w?(TR.taskOk?' ✔ +'+(TR.taskCoins||TASK_COINS):' ✘'):''):''),w&&TR.taskOk?'#1f8a4a':'#5a4a6a']); }
    if(w&&TR.day&&typeof collLine5==='function') lines.push([collLine5(),TR.collNew?'#1f8a4a':'#7a6a9a']); }
  const two=rows.length>3, nr=two?Math.ceil(rows.length/2):rows.length, hh=22, sh=stars?24:0;
  let ch=hh+pad+nr*rh+(sh?sh+4:0)+(lines.length?8:0)+lines.length*rh+pad; const avail=H-SA.t-SA.b-12-bh-10; while(ch>avail&&lines.length){ lines.pop(); ch-=rh+(lines.length?0:8); }
  const cy=Math.round(Math.max(SA.t+6,(H-SA.b-SA.t-ch-bh-10)/2+SA.t));
  ux5Box(cx,cy,cw,ch,UXC.cream,true); ctx.fillStyle=hcol; ctx.fillRect(cx,cy,cw,hh); ctx.fillStyle=shade(hcol,-.3); ctx.fillRect(cx,cy+hh-2,cw,2); ux5Reg('card',cx-1,cy-1,cw+4,ch+4);
  G.labels.push([ux5Fit(head,12,cw-16),W/2,cy+hh/2,12,'#fff','center',UXC.ink]);
  const colW=two?(cw-3*pad)/2:cw-2*pad; let y=cy+hh+pad+rh/2;
  rows.forEach((r,i)=>{ const col=two?i%2:0, row=two?i>>1:i, x0=cx+pad+col*(colW+pad), yy=y+row*rh, lab=String(r[0]), lw=txtW(lab,7)+6; G.labels.push([lab,x0,yy,7,'#3a2a48','left',null]); G.labels.push([ux5Fit(String(r[1]),7,colW-lw),x0+colW,yy,7,'#1a1020','right',null]); });
  y+=nr*rh; if(stars){ const sy=Math.round(y+8); for(let i=0;i<3;i++){ G.labels.push(['★',W/2+(i-1)*24,sy,18,i<TR.stars?'#ffc21f':'#c8bcd8','center',UXC.ink]); } y+=sh+4; }
  if(lines.length){ ctx.fillStyle='#e0d2b8'; ctx.fillRect(cx+pad,Math.round(y-rh/2+2),cw-2*pad,1); y+=8; }
  for(const [s,c] of lines){ G.labels.push([ux5Fit(s,7,cw-2*pad),W/2,y,7,c,'center',null]); y+=rh; }
  // кнопки под карточкой: карта-иконка + ЗАНОВО + ДАЛЬШЕ/НОВЫЙ ДЕНЬ (≤2 подписанные)
  const by=Math.round(cy+ch+10), bw2=Math.round(Math.min(150,(cw-bh-24)/2));
  if(esc){ const x0=Math.round(W/2-bw2-6); bigBtn('МЕНЮ',x0,by,bw2,bh,'#8a3ad8',()=>toTitle(),'rmenu'); bigBtn('ЕЩЁ РАЗ',x0+bw2+12,by,bw2,bh,'#3a6ad8',()=>startEscape(),'retry'); ux5Reg('btns',x0-2,by-2,2*bw2+16,bh+4); return; }
  const tot=bh+12+bw2+12+bw2, x0=Math.round(W/2-tot/2);
  mapIconBtn(x0,by,bh,()=>{ mapLine=TR.line; toMap(); },'rmap');
  bigBtn('ЗАНОВО',x0+bh+12,by,bw2,bh,'#3a6ad8',()=>{ if(TR.day) startDay(TR.idx,{day:TR.day}); else startTrip(TR.idx); },'retry');
  const nx=TR.idx+1, nOpen=w&&nx<LEVELS.length&&lvOpen(Math.floor(nx/8),nx%8), go=i=>()=>{ if(TR.day||!TR.mode||TR.mode==='trip') newDay(); const L=LEVELS[i]; if(L.i===0&&L.w>0&&!save.cut['line'+L.w]){ save.cut['line'+L.w]=1; store(); startCut('line',()=>startDay(i),L.w); } else startDay(i); };
  const x2=x0+bh+12+bw2+12; if(nOpen) bigBtn('ДАЛЬШЕ ▶',x2,by,bw2,bh,UXC.green,go(nx),'next'); else bigBtn(w?'НОВЫЙ ДЕНЬ ▶':'НОВЫЙ ДЕНЬ',x2,by,bw2,bh,UXC.green,go(TR.idx),'newday');
  ux5Reg('btns',x0-2,by-2,tot+4,bh+4); };

// ---------- 3. ВЫБОР ГЕРОЯ: большой портрет слева, ПЛЮС/МИНУС + 3 шкалы справа, плитки с замком и ценой ----------
function ux5Stat(id){ const s=HERO_STATS[id]||HERO_STATS.serega, push=(s.PUSH&&s.PUSH[0])||24; return [['Скорость',(s.SPD-50)/40],['Толчок',push/34],['Нервы',Math.min(1,.35+.5*(s.NRV||1)-(s.SCN>1?.2:0))]]; }
drawHeroes=function(){ G.labels=[]; buttons=[]; HS.rects=[]; const L=SA.l+8, R=W-SA.r-8, T=SA.t+6, B=H-SA.b-6, sel=HS.sel||'serega', H4=HERO4[sel], st=heroState(sel);
  ctx.fillStyle='#141428'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#1c1c38'; for(let x=0;x<W;x+=8) ctx.fillRect(x,0,1,H); for(let y=0;y<H;y+=8) ctx.fillRect(0,y,W,1);
  const rect=(x,y,w,h,id)=>{ HS.rects.push({x,y,w,h,id}); };
  const bh=Math.round(Math.max(28,44*DPR/SC)), by=B-bh, bwM=Math.round(Math.min(200,(R-L)*.4)), bwB=Math.round(Math.min(120,(R-L)*.24));
  bigBtn('НАЗАД',L,by,bwB,bh,'#4a3a5a',()=>closeHeroes(),'hback',9);
  let lab, col=UXC.green, cb;
  if(st.own){ lab='ИГРАТЬ ▶'; cb=()=>{ heroPick(sel); closeHeroes(); if(typeof map4Go==='function') map4Go(); }; }
  else if(st.price&&st.can){ lab='КУПИТЬ · '+st.price+' ◎'; col='#d8a020'; cb=()=>{ heroBuy(sel); }; }
  else if(st.price){ lab='КУПИТЬ · '+st.price+' ◎'; col='#6a5a3a'; cb=()=>{ say('Не хватает монет: нужно '+st.price+', у тебя '+wallet().coins+(st.st>0&&ST_THR[st.st]?' · или набери '+ST_THR[st.st]+' очк. за поездки (у тебя '+tripPts()+')':''),2.4,'#ffd23f'); SFX.hurt&&SFX.hurt(); }; }
  else if(st.why==='weekend'){ lab='ОТКРОЕТСЯ В ВЫХОДНОЙ'; col='#5a5468'; cb=()=>{ say('Тимоха приходит, когда выпадет выходной — пройди его!',2.4,'#ffd23f'); }; }
  else { lab='ЗА '+ST_THR[st.st]+' ОЧК.'; col='#5a5468'; cb=()=>{ say('Откроется, когда наберёшь '+ST_THR[st.st]+' очк. за поездки · у тебя '+tripPts(),2.2,'#ffd23f'); }; }
  bigBtn(lab,R-bwM,by,bwM,bh,col,cb,'hmain',lab.length>16?8:10); if(!st.own&&!(st.price&&st.can)) buttons[buttons.length-1].dis=true;
  // кошелёк — в промежутке между кнопками
  const wt=wallet().coins+' ◎', wtw=txtW(wt,9); if(R-bwM-L-bwB>wtw+24){ G.labels.push([wt,(L+bwB+R-bwM)/2,by+bh/2,9,'#ffd23f','center']); rect((L+bwB+R-bwM)/2-wtw/2,by+bh/2-7,wtw,14,'wallet'); }
  // портрет слева
  const top=T, ph=by-10-top, pw=Math.round(Math.min(ph*.86,(R-L)*.36)), px=L, py=top;
  ctx.fillStyle=UXC.ink; ctx.fillRect(px-2,py-2,pw+4,ph+4); ctx.fillStyle='#232048'; ctx.fillRect(px,py,pw,ph); ctx.fillStyle='#2b2858'; for(let x=px+6;x<px+pw-4;x+=10) ctx.fillRect(x,py+4,1,ph-26);
  const capH=16, sc=Math.max(1,Math.floor(Math.min((ph-capH-8)/46,(pw-8)/32))), fw=32*sc, fh=46*sc, fx=Math.round(px+pw/2-fw/2), fy=Math.round(py+ph-capH-fh-2);
  ctx.fillStyle='#0008'; ctx.fillRect(fx+6*sc,fy+fh-3*sc,fw-12*sc,3*sc);
  const img=personSprite(heroSpec(sel),Math.floor(G.t*1.2)%5===4?'cheer':'idle',Math.floor(G.t*6)%6,'norm',Math.floor(G.t*10)); ctx.imageSmoothingEnabled=false; ctx.globalAlpha=st.own?1:.55; ctx.drawImage(img,16,14,32,46,fx,fy,fw,fh); ctx.globalAlpha=1;
  rect(px,py,pw,ph,'portrait'); const cap=ux5Fit(H4.n+' · '+H4.job,8,pw-8); G.labels.push([cap,px+pw/2,py+ph-capH/2,8,'#ffd23f','center']);
  if(!st.own){ lock4(px+pw-14,py+6); }
  // справа: ПЛЮС/МИНУС, шкалы, плитки
  const tx=px+pw+14, tw=R-tx; let y=top+6;
  const tileS=Math.round(Math.max(30,Math.min(44,(tw-7*4)/8))), tg=4, n=HERO_IDS4.length, fit=Math.max(1,Math.floor((tw+tg)/(tileS+tg))), scroll=fit<n, vis=scroll?Math.max(1,Math.floor((tw-2*16+tg)/(tileS+tg))):n;
  const tilesY=by-10-tileS-10;
  const para=(title,c,text)=>{ G.labels.push([title,tx,y,7,c,'left']); rect(tx,y-5,txtW(title,7),10,'t'+title); y+=12; const ln=wrapW(text,tw,8).slice(0,2); for(const l of ln){ G.labels.push([l,tx,y,8,'#fff','left']); rect(tx,y-6,Math.min(tw,txtW(l,8)),12,'p'+title+l); y+=12; } y+=4; };
  para('ПЛЮС',P.neonLime,H4.perk); para('МИНУС','#ff6a8a',H4.minus);
  const st3=ux5Stat(sel), lw=Math.max(...st3.map(s=>txtW(s[0],7)))+10, barH=6, rowH=13;
  if(y+3*rowH<=tilesY-4){ for(const [nm,v] of st3){ G.labels.push([nm,tx,y+3,7,'#c8c0e0','left']); const bx=tx+lw, bw=tw-lw; ctx.fillStyle=UXC.ink; ctx.fillRect(bx-1,y-1,bw+2,barH+2); ctx.fillStyle='#2a2448'; ctx.fillRect(bx,y,bw,barH); ctx.fillStyle='#ffc21f'; ctx.fillRect(bx,y,Math.round(bw*clamp(v,.08,1)),barH-1); rect(tx,y-3,tw,barH+4,'bar'+nm); y+=rowH; } }
  else if(!st.own&&st.st>0&&LEVELS[st.st]){ }
  if(!st.own&&st.st>0&&LEVELS[st.st]&&y+10<tilesY-2){ const t2=ux5Fit((st.price?'или ':'')+'за очки поездок: ещё '+Math.max(0,ST_THR[st.st]-tripPts())+' очк.',7,tw); G.labels.push([t2,tx,y+4,7,'#ffd23f','left']); rect(tx,y-1,txtW(t2,7),10,'hint'); }
  HS.off=Math.max(0,Math.min(n-vis,HS.off)); const x0=scroll?tx+16:tx;
  if(scroll){ const ar=(x,d,id)=>{ ctx.fillStyle=UXC.ink; ctx.fillRect(x,tilesY,14,tileS); ctx.fillStyle='#3a3050'; ctx.fillRect(x+1,tilesY+1,12,tileS-2); ctx.fillStyle='#fff'; for(let i=0;i<4;i++){ const xx=d<0?x+4+i:x+9-i; ctx.fillRect(xx,tilesY+tileS/2-i,1,i*2+1); } buttons.push({x,y:tilesY,w:14,h:tileS,id,icon:1,cb:()=>{ HS.off+=d; SFX.ui(); }}); rect(x,tilesY,14,tileS,id); };
    if(HS.off>0) ar(tx,-1,'hl'); if(HS.off<n-vis) ar(R-14,1,'hr'); }
  for(let k=0;k<vis;k++){ const i=k+HS.off, id=HERO_IDS4[i]; if(!id) break; const x=x0+k*(tileS+tg), s=heroState(id), on=id===sel;
    ctx.fillStyle=on?'#ffd23f':UXC.ink; ctx.fillRect(x-2,tilesY-2,tileS+4,tileS+4); ctx.fillStyle=s.own?'#2a2048':'#18142a'; ctx.fillRect(x,tilesY,tileS,tileS);
    const pr=heroPortrait(id); if(pr){ const ps=Math.max(1,Math.floor((tileS-4)/24)); ctx.globalAlpha=s.own?1:.35; ctx.drawImage(pr,Math.round(x+tileS/2-12*ps),Math.round(tilesY+(s.own?tileS/2-12*ps:2)),24*ps,24*ps); ctx.globalAlpha=1; }
    if(!s.own){ const tag=s.why==='weekend'?'СБ·ВС':s.price?s.price+' ◎':'СТ.'+(s.st+1); G.labels.push([tag,x+tileS/2,tilesY+tileS-6,7,s.price&&s.can?'#ffd23f':'#d8d0e8','center']); lock4(x+tileS-9,tilesY+2); }
    else if(!save.heroes.seen.includes(id)&&id!=='serega'){ ctx.fillStyle=P.neonLime; ctx.fillRect(x+tileS-6,tilesY+2,4,4); }
    else if(id===(save.hero||'serega')){ ctx.fillStyle=P.neonLime; ctx.fillRect(x+2,tilesY+tileS-4,tileS-4,2); }
    buttons.push({x,y:tilesY,w:tileS,h:tileS,id:'hc_'+id,card:1,cb:()=>{ if(HS.sel!==id){ HS.sel=id; SFX.ui(); heroVoice(id,'Привет'); } if(save.heroes.owned.includes(id)&&!save.heroes.seen.includes(id)){ save.heroes.seen.push(id); store(); } }}); rect(x,tilesY,tileS,tileS,'hc_'+id); }
  if(HS.boom>0){ HS.boom-=1/60; const cx=fx+fw/2, cy2=fy+20; for(const c of HS.conf){ c.vy+=180/60; c.x+=c.vx/60; c.y+=c.vy/60; ctx.fillStyle=c.c; ctx.fillRect(Math.round(cx+c.x),Math.round(cy2+c.y),2,2); } G.labels.push(['ГЕРОЙ ОТКРЫТ!',px+pw/2,py+14,11,P.neonLime]); }
  if(G.msg&&G.msg!==HS.msg0){ G.msg.t-=1/60; if(G.msg.t<=0) G.msg=null; else { const s=ux5Fit(G.msg.s,8,tw-12), mw=txtW(s,8)+12, my=tilesY-14; ctx.fillStyle='rgba(18,12,24,.85)'; ctx.fillRect(Math.round(tx),my-7,Math.round(mw),14); G.labels.push([s,tx+6,my,8,G.msg.col,'left']); } } };
{ const _oh=openHeroes; openHeroes=function(){ const r=_oh.apply(this,arguments); HS.msg0=G.msg; return r; }; }
window.__ux5=UX5;
