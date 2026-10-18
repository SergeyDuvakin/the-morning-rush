'use strict';
// ================= M4 · ревью: концовки — офисная сцена «камера ближе» (×2, целые пиксели), open-space на фоне, окно с жалюзи и городом, ковролин в перспективе =================
// сцена рисуется в «сценических» пикселях (k=2 игровых), подписи — через E4L (пересчёт в экранные координаты)
const E4C={wall:'#e6dfcf',wallSh:'#d6cebc',ceil:'#cfc8b8',ceilSh:'#bab2a2',base:'#5a5266',carpA:'#5f6c86',carpB:'#58647d',seam:'#4b5670',part:'#7f8ca6',partHi:'#a9b5ca',partSh:'#66728c',wood:'#a8784a',woodHi:'#c8955e',woodSh:'#7a5232',metal:'#4a4a58',sky:'#9fd0f0',skyHi:'#cfeaff',city:'#7186a6',city2:'#8d9fbc',lit:'#ffe9a8'};
let E4=null;
function E4L(s,x,y,sz,col,ol){ const k=E4.k; G.labels.push([s,Math.round(x*k),Math.round(y*k),sz,col,'center',ol===undefined?P.ink:ol]); }
function e4r(c,x,y,w,h){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function e4Pix(rows,x,y,col){ ctx.fillStyle=col; rows.forEach((r,q)=>{ for(let p=0;p<r.length;p++) if(r[p]==='X') ctx.fillRect(x+p,y+q,1,1); }); }
const E4_1C=['.X..XXX','XX.X...','.X.X...','.X.X...','XXX.XXX'];
function e4Begin(opt){ opt=opt||{}; const k=Math.max(1,Math.floor(H/120)), SW=Math.ceil(W/k), SH=Math.ceil(H/k), BY=Math.round(SH*.56), FY=Math.round(SH*.87);
  E4={k,SW,SH,BY,FY,dx:Math.round(SW*.55)}; ctx.save(); ctx.scale(k,k); const g=E4;
  // стена, потолок с панелями-светильниками
  e4r(E4C.wall,0,0,SW,BY); for(let x=24;x<SW;x+=48) e4r(E4C.wallSh,x,10,1,BY-12); e4r(E4C.ceil,0,0,SW,8); e4r(E4C.ceilSh,0,7,SW,1); e4r(P.ink,0,8,SW,1);
  for(let x=18;x<SW;x+=56){ e4r(P.ink,x-1,2,22,5); e4r('#fffaf0',x,3,20,3); e4r('rgba(255,244,214,.10)',x-6,9,32,18); }
  // окно с жалюзи и видом на город
  const wx=8, wy=13, ww=Math.round(SW*.24), wh=BY-24; g.win=[wx,wy,ww,wh];
  e4r(P.ink,wx-2,wy-2,ww+4,wh+4); e4r('#d8d2c4',wx-1,wy-1,ww+2,wh+2); e4r(E4C.sky,wx,wy,ww,wh); e4r(E4C.skyHi,wx,wy,ww,Math.round(wh*.35));
  { let x=wx, i=0; const hs=[20,30,16,26,34,18,24,28,14,22]; while(x<wx+ww){ const bw=7+(i*5)%6, bh=Math.min(wh-4,hs[i%hs.length]); e4r(i%2?E4C.city:E4C.city2,x,wy+wh-bh,Math.min(bw,wx+ww-x),bh); for(let yy=wy+wh-bh+3;yy<wy+wh-2;yy+=4) for(let xx=x+2;xx<Math.min(x+bw-1,wx+ww-1);xx+=3) if(((xx*7+yy*3+i)%5)<2) e4r(E4C.lit,xx,yy,1,1); x+=bw+1; i++; } }
  const bl=Math.round(wh*.55); for(let y=wy;y<wy+bl;y+=4){ e4r('#ece8dc',wx,y,ww,2); e4r('#bdb6a6',wx,y+2,ww,1); } e4r('#a8a090',wx,wy+bl,ww,2); e4r(P.ink,wx+ww-6,wy,1,bl+10); e4r('#c8c0b0',wx+ww-7,wy+bl+10,3,3);
  e4r(P.ink,wx-1,wy+Math.round(wh/2),ww+2,1); e4r(P.ink,wx+Math.round(ww/2),wy+bl,1,wh-bl); e4r('#f2eee4',wx-4,wy+wh+2,ww+8,2); e4r(P.ink,wx-4,wy+wh+4,ww+8,1);
  // часы
  const cx=wx+ww+18, cy=22; g.clock=[cx,cy]; disc(ctx,cx,cy,7,7,P.ink); disc(ctx,cx,cy,6,6,'#fff8e8'); for(let a=0;a<12;a+=3){ const ang=a/12*6.283; e4r('#5a5266',cx+Math.round(Math.sin(ang)*5),cy-Math.round(Math.cos(ang)*5),1,1); }
  { const [hh,mm]=opt.time||[8,59], am=mm/60*6.283, ah=((hh%12)+mm/60)/12*6.283; for(let r=1;r<=4;r++) e4r(opt.late?'#c82a2a':P.ink,cx+Math.round(Math.sin(am)*r),cy-Math.round(Math.cos(am)*r),1,1); for(let r=1;r<=3;r++) e4r(P.ink,cx+Math.round(Math.sin(ah)*r),cy-Math.round(Math.cos(ah)*r),1,1); }
  // маркерная доска + постер «1С»
  const bx=Math.round(SW*.42), bw=Math.round(Math.min(52,SW*.2)); g.board=[bx,14,bw,30]; e4r(P.ink,bx-1,13,bw+2,32); e4r('#9aa2b0',bx,14,bw,30); e4r('#fbfbf6',bx+1,15,bw-2,28);
  { const pts=[[4,22],[10,19],[16,20],[22,14],[28,15],[34,9]]; ctx.fillStyle='#3a6ad8'; for(let i=0;i<pts.length-1;i++){ const [x1,y1]=pts[i],[x2,y2]=pts[i+1]; for(let s=0;s<=6;s++) ctx.fillRect(bx+Math.round(x1+(x2-x1)*s/6),14+Math.round(y1+(y2-y1)*s/6),1,1); } }
  e4r('#c82a2a',bx+bw-16,18,10,1); e4r('#c82a2a',bx+bw-16,22,8,1); e4r('#7a7a88',bx+bw-16,26,11,1); e4r('#7a7a88',bx+bw-16,30,7,1); e4r('#2aa860',bx+bw-16,34,9,1); e4r('#9aa2b0',bx+4,44,bw-8,2); e4r('#d8265e',bx+8,43,4,1); e4r('#3a6ad8',bx+14,43,4,1);
  const px=bx+bw+8, sw2=Math.round(Math.min(64,SW*.22)); let sx=Math.round(Math.max(SW*.83,px+24+sw2/2)); const monTop=FY-66, poster=sx+sw2/2<=SW-3&&!(px<E4.dx+48&&px+18>E4.dx-2&&41>=monTop); if(!poster) sx=Math.round(SW*.83); if(poster){ e4r(P.ink,px-1,15,20,26); e4r('#ffd23f',px,16,18,24); e4r('#c82a2a',px+2,18,14,9); e4Pix(E4_1C,px+3,20,'#ffd23f'); e4r('#c82a2a',px+3,30,12,1); e4r('#c82a2a',px+3,33,9,1); e4r('#5a4a20',px+3,36,11,1); }
  // табличка компании (под кнопкой «ПРОПУСТИТЬ»)
  { e4r(P.ink,sx-sw2/2-1,22,sw2+2,11); e4r('#2a2440',sx-sw2/2,23,sw2,9); e4r('#c9a24a',sx-sw2/2,23,sw2,1); E4L('ООО «ОТЧЁТНОСТЬ»',sx,27.5,6,'#ffe9a8',null); }
  // ковролин в перспективе (плитки в шахматку, швы сходятся к точке схода)
  e4r(E4C.base,0,BY-3,SW,3); e4r(P.ink,0,BY,SW,1); const vx=SW*.5, vy=BY-110, TW=26, N=7;
  for(let y=BY+1;y<SH;y++){ const s=(y-vy)/(SH-vy), u=Math.pow((y-BY)/(SH-BY),.75), row=Math.floor(u*N), tw=TW*s, off=vx-Math.ceil(vx/tw)*tw;
    for(let i=0,x=off;x<SW;i++,x+=tw){ const c=((i+row)%2)?E4C.carpA:E4C.carpB; e4r(c,x,y,tw+1,1); e4r(E4C.seam,x,y,1,1); } }
  for(let r=1;r<N;r++){ const y=Math.round(BY+(SH-BY)*Math.pow(r/N,1/.75)); e4r(E4C.seam,0,y,SW,1); }
  e4r('rgba(10,6,20,.18)',0,BY+1,SW,3);
  // open-space: дальний ряд — сотрудники за перегородками, мониторы, кулер, растение
  const others=HERO_IDS4.filter(i=>i!==heroId), seats=[[.32,0],[.6,1],[.74,2]].filter(q=>!(opt.noBack&&q[1]===opt.noBack));
  for(const [fx,i] of seats){ const x=Math.round(SW*fx); e4r(P.ink,x+9,BY-9,15,11); e4r('#8a92a2',x+10,BY-8,13,9); e4r('#6a7282',x+11,BY-7,11,7); e4r(P.ink,x+15,BY+1,3,3);
    const sp=heroSpec(others[(i*3+(G.day||0))%others.length]); spr(sp,'sit',0,'norm',x,BY+6,i===1,1); }
  { const pts=[[Math.round(SW*.24),Math.round(SW*.44)],[Math.round(SW*.5),Math.round(SW*.84)]]; for(const [a,b] of pts){ e4r(P.ink,a-1,BY+3,b-a+2,10); e4r(E4C.part,a,BY+4,b-a,8); e4r(E4C.partHi,a,BY+4,b-a,2); e4r(E4C.partSh,a,BY+10,b-a,2); for(let x=a+22;x<b-4;x+=24) e4r(E4C.partSh,x,BY+6,1,4); } }
  if(!opt.noCooler){ const x=SW-20, y=BY+12; e4r('rgba(10,6,20,.2)',x-7,y-1,15,3); e4r(P.ink,x-7,y-24,14,24); e4r('#eef0f2',x-6,y-23,12,23); e4r('#c8ccd4',x-6,y-10,12,1); e4r('#d8265e',x-4,y-18,2,2); e4r('#3a6ad8',x+2,y-18,2,2); e4r(P.ink,x-5,y-37,10,14); e4r('#8fc8f0',x-4,y-36,8,12); e4r('#cfeaff',x-3,y-35,2,9); e4r('#5a9ad0',x-4,y-27,8,3); }
  m4Plant(Math.round(SW*.9)-((opt.noCooler)?0:16),BY+12);
  return g; }
function e4End(){ ctx.restore(); }
// стол героя: столешница с толщиной, металлические ножки, тумба, клавиатура, бумаги
function e4Desk(dx,FY){ e4r('rgba(10,6,20,.25)',dx-48,FY-1,98,4); e4r(P.ink,dx-46,FY-25,3,25); e4r(E4C.metal,dx-45,FY-25,1,24); e4r(P.ink,dx+20,FY-25,28,25); e4r(E4C.woodSh,dx+21,FY-24,26,24); for(let i=0;i<3;i++){ e4r(E4C.wood,dx+22,FY-23+i*8,24,6); e4r(P.ink,dx+32,FY-21+i*8,4,1); }
  e4r(P.ink,dx-49,FY-31,99,7); e4r(E4C.woodHi,dx-48,FY-30,97,2); e4r(E4C.wood,dx-48,FY-28,97,2); e4r(E4C.woodSh,dx-48,FY-26,97,1);
  e4r(P.ink,dx-14,FY-33,18,3); e4r('#d8dce6',dx-13,FY-33,16,2); e4r('#fbfbf6',dx+30,FY-34,12,4); e4r('#e6e2d6',dx+31,FY-36,11,2); e4r('#6a7282',dx+31,FY-35,8,1); }
// монитор: режимы off / 1c (экран загрузки 1С) / mail / blue
function e4Mon(dx,FY,mode,p){ const x=dx, y=FY-64; e4r(P.ink,x+20,FY-37,6,6); e4r(P.ink,x+14,FY-32,18,2); e4r(P.ink,x-2,y-2,50,31); e4r('#2a2a36',x-1,y-1,48,29);
  const sx=x+1, sy=y+1, sw=44, sh=25; if(mode==='1c'){ e4r('#ffd23f',sx,sy,sw,sh); e4r('#c82a2a',sx+2,sy+2,10,7); e4Pix(E4_1C,sx+3,sy+3,'#ffd23f'); E4L('1С:Предприятие',sx+sw/2,sy+13.5,5,'#8a1a1a',null); e4r(P.ink,sx+3,sy+18,sw-6,3); e4r('#2aa860',sx+4,sy+19,Math.round((sw-8)*Math.min(1,p)),1); }
  else if(mode==='mail'){ e4r('#3a6a9a',sx,sy,sw,sh); e4r('#2a4a7a',sx,sy,sw,4); for(let i=0;i<4;i++){ e4r('#e8f0ff',sx+3,sy+7+i*4,sw-14,1); e4r('#ffd23f',sx+sw-8,sy+7+i*4,4,1); } }
  else if(mode==='blue') { e4r('#3a6a9a',sx,sy,sw,sh); e4r('#5a8aba',sx+2,sy+2,12,1); }
  else { e4r('#1a2a3a',sx,sy,sw,sh); e4r('#2a3a4a',sx+2,sy+2,6,1); } e4r('#4a4a5a',sx+sw-2,sy+sh+1,1,1); }
// офисное кресло (спинка слева — герой смотрит вправо, на монитор)
function e4Chair(x,FY){ x=Math.round(x); e4r(P.ink,x-11,FY-1,22,2); e4r(P.ink,x-12,FY+1,3,2); e4r(P.ink,x+9,FY+1,3,2); e4r(P.ink,x-1,FY-10,3,9); e4r(P.ink,x-11,FY-14,22,5); e4r('#3a3a4a',x-10,FY-13,20,3); e4r(P.ink,x-13,FY-34,6,22); e4r('#3a3a4a',x-12,FY-33,4,20); e4r('#5a5a6a',x-12,FY-33,1,20); }
// ---- концовки (те же названия/длительности, новая сцена) ----
const E4WALK=(t,t1,x1,SW)=>t>=t1?x1:Math.round(SW*.04+t/t1*(x1-SW*.04));
END[0][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); const sit=t>3, hx=sit?dx-28:E4WALK(t,3,dx-28,g.SW), p=Math.min(1,Math.max(0,(t-3.5)/4));
  e4Mon(dx,FY,t<3.5?'off':'1c',Math.min(p,.97)); e4Chair(dx-28,FY+3); spr(S,sit?'sit':'walk',Math.floor(t*10)%8,t>6?'o':'norm',hx,FY+(sit?-2:2),false,1); e4End();
  sub(t<3?'Аналитик прибыл. Ровно.':t<7?'Запуск 1С… '+Math.round(Math.min(p,.97)*100)+'%':'97%. Можно сходить за кофе. Ещё дважды.'); };
function e4Machine(mx,FY,t){ e4r('rgba(10,6,20,.25)',mx-14,FY-1,28,3); e4r(P.ink,mx-13,FY-50,26,50); e4r('#3a3a48',mx-12,FY-49,24,48); e4r('#4a4a5a',mx-12,FY-49,24,2); e4r('#1a2a3a',mx-8,FY-44,16,7); e4r('#8fd8ff',mx-7,FY-43,6,1); e4r('#ff4a4a',mx+6,FY-34,3,3); e4r('#2aa860',mx+6,FY-29,3,3);
  e4r(P.ink,mx-8,FY-26,16,16); e4r('#22222c',mx-7,FY-25,14,14); e4r('#8a8a9a',mx-2,FY-25,4,3); e4r('#5a5a68',mx-8,FY-10,16,2); e4r('#c9a24a',mx-9,FY-48,18,1); e4r('#f4ead8',mx-11,FY-34,5,6); e4r('#6a4428',mx-11,FY-34,5,1); e4r(P.ink,mx-6,FY-32,1,2); }
END[1][2]=(t,S)=>{ const g=e4Begin({noCooler:1}), {dx,FY}=g; e4Desk(Math.round(g.SW*.34),FY); e4Mon(Math.round(g.SW*.34),FY,'off'); const mx=Math.round(g.SW*.7); e4Machine(mx,FY,t); const hx=E4WALK(t,2.5,mx-24,g.SW);
  if(t>3){ const f=Math.min(1,(t-3)/2), cx=mx-4; e4r('#5a3a1a',cx+3,FY-22,2,Math.round(8*f)); m4BigCup(cx,FY-21+7,f>=1); }
  spr(S,t<2.5?'walk':t<6?'idle':'cheer',Math.floor(t*10)%8,'norm',hx,FY+2,false,1); e4End(); sub(t<3?'Первым делом — кофе.':t<6?'Автомат думает. Ты тоже.':'Кофе! День спасён (на 15 минут).'); };
END[2][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'mail'); E4L('ПИСЕМ: 148',dx+23,FY-58,6,'#ffffff',null); e4Chair(dx-28,FY+3); const sit=t>2.5, hx=sit?dx-28:E4WALK(t,2.5,dx-28,g.SW);
  const bang=sit&&t>3.5?Math.max(0,Math.sin((t-3.5)*5)):0; spr(S,sit?'sit':'walk',Math.floor(t*10)%8,bang>.8?'hurt':'norm',hx+bang*8,FY+(sit?-2:2),false,1,bang*.6); if(bang>.95){ E4L('БУМ',dx-6,FY-46,12,P.red); shake(1); } e4End(); sub(t<3?'Сел. Открыл почту.':'Утренняя медитация.'); };
END[3][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'blue'); const roll=t>3?Math.min(g.SW*.45,(t-3)*(t-3)*18):0; e4Chair(dx-28-roll,FY+3); const sit=t>2.6, hx=sit?dx-28-roll:E4WALK(t,2.6,dx-28,g.SW);
  spr(S,sit?(t>5.5?'hurt':'sit'):'walk',Math.floor(t*10)%8,t>3?'o':'norm',hx,FY+(sit?-2:2),false,1,t>5.5?-.5:0); e4End(); sub(t<3?'Наконец-то сесть…':t<5.5?'Кресло на колёсиках имеет своё мнение.':'Доброе утро, отдел продаж!'); };
END[4][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'blue'); e4Chair(dx-28,FY+3); const px=dx-26, py=FY-12;
  e4r(P.ink,px-8,py-10,16,11); e4r('#8a8aa8',px-7,py-9,14,9); e4r('#6a6a88',px-7,py-4,9,2); e4r(P.ink,px+5,py-13,6,6); e4r('#9a9ab8',px+6,py-12,4,4); e4r('#3a8a6a',px+6,py-8,4,1); e4r(P.ink,px+8,py-11,1,1); e4r('#ffb84a',px+10,py-10,3,2); e4r('#ffb84a',px-3,py+1,1,2); e4r('#ffb84a',px+2,py+1,1,2);
  const hx=Math.min(dx-66,E4WALK(t,2.5,dx-66,g.SW)); spr(S,t<2.5?'walk':'idle',Math.floor(t*10)%8,t>3?'o':'norm',hx,FY+2,false,1); if(t>3) E4L('КУРЛЫ.',px+4,py-27,9,'#fff'); e4End();
  sub(t<3?'Твоё место…':t<6?'…уже занято. Голубь с Курского.':'Он тоже хотел успеть к девяти.'); };
END[5][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); const sit=t>3, hx=sit?dx-28:E4WALK(t,3,dx-28,g.SW), p=Math.min(1,Math.max(0,(t-3.5)/4));
  e4Mon(dx,FY,t<3.5?'off':'1c',p); e4Chair(dx-28,FY+3); spr(S,sit?'sit':'walk',Math.floor(t*10)%8,t>6?'o':'norm',hx,FY+(sit?-2:2),false,1);
  const sip=t>5.2&&t<6.4; if(!sit) m4BigCup(hx+8,FY-24,true); else if(sip) m4BigCup(hx+5,FY-38,false); else m4BigCup(dx-20,FY-44,true);
  if(t>6.6) E4L('+БОДРОСТЬ',dx-26,FY-60,8,'#ffd98a'); e4End(); sub(t<3?'С кофе в руке. Как в рекламе.':t<6.4?'Глоток. 1С грузится… '+Math.round(p*100)+'%':'Ты бодр. 1С — нет. Но это не твои проблемы.'); };
END[6][2]=(t,S)=>{ const g=e4Begin(), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'blue'); e4Chair(dx-28,FY+3); const sit=t>3.4, hx=sit?dx-28:E4WALK(t,3.4,dx-28,g.SW);
  { const [cx]=g.clock, x=cx-11, y=34; e4r(P.ink,x-1,y-1,24,18); e4r('#fbfbf6',x,y,22,16); e4r('#2a4a8a',x,y,22,2); E4L('14',x+11,y+7,10,'#2a4a8a',null); E4L('ЭТАЖ',x+11,y+13,5,'#5a4a6a',null); }
  spr(S,sit?'sit':'walk',Math.floor(t*(sit?4:6))%8,sit?'o':'hurt',hx,FY+(sit?-2:2)+(sit?Math.round(Math.sin(t*6)):0),false,1);
  if(Math.floor(t*3)%2) E4L('ХХХ… ХХХ…',hx-2,FY-48,7,'#9ad0ff'); e4End(); sub(t<3.4?'Четырнадцать этажей пешком.':t<6?'Ноги — вата. Зато успел.':'Лифт починят завтра. Говорят.'); };
CUTS.late.draw=(t,c)=>{ const m=Math.min(9,Math.floor(t)), g=e4Begin({time:[9,m],late:1,noBack:1}), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'off'); e4Chair(dx-28,FY+3); const bx=Math.round(g.SW*.78);
  spr(HERO_SPECS.baba,'idle',0,'angry',bx,FY+2,true,1); const hx=t<4?E4WALK(t,4,bx-44,g.SW):bx-44; spr(heroSpec(heroId),t<4?'walk':'hurt',Math.floor(t*6)%8,'o',hx,FY+2,false,1);
  if(TR&&TR.coffee) m4BigCup(hx+8,FY-24,t<4);
  if(t<4) E4L('на цыпочках…',hx,FY-46,7,'#fff'); if(t>4.5){ e4r(P.ink,bx-25,FY-27,14,18); e4r('#fff',bx-24,FY-26,12,16); for(let i=0;i<4;i++) e4r(P.ink,bx-22,FY-23+i*3,8,1); E4L('ОБЪЯСНИТЕЛЬНАЯ',bx-20,FY-52,7,P.red); if(TR&&TR.coffee) E4L('…зато с кофе',hx-16,FY-43,7,'#ffd98a'); }
  e4End(); G.labels.push(['09:0'+m,W/2,SA.t+18,14,'#ff6a6a']); sub(t<4?'Опоздал. Может, никто не заметит?':'Начальница заметила. Бланк уже распечатан.'); };
