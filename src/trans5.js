'use strict';
// M5-12: интерьеры автобуса/трамвая (§P4–P5) в выходных, такси (§P6) — счётчик/ёлочка/ремни + поворотник; звук транспорта (§P8) с визуальными дублями (R12)
// ---------- звук транспорта (шина ЭФФЕКТЫ через tone/noise; ≤12 узлов — audSlot)
const TSFX5={
  pshh:()=>{ noise(.32,.16,2600); tone(320,.12,'sine',.05,-120,.05); },                 // двери метро «пшш»
  metroDoors:()=>{ TSFX5.pshh(); tone(740,.2,'sine',.12,0,.36); tone(587,.28,'sine',.12,0,.58); },
  hum:(up)=>{ noise(1.2,.08,110); tone(up?70:110,1.1,'sawtooth',.035,up?50:-50); },    // гул нарастание/спад
  joint:()=>{ noise(.05,.14,180); noise(.05,.11,180,.13); },                             // стык «тук-тук»
  lastBeep:()=>{ tone(1320,.08,'sine',.08); tone(1320,.08,'sine',.08,0,.16); },            // Ласточка — тише, «бип»
  horn:()=>{ tone(311,.55,'sawtooth',.09); tone(392,.55,'sawtooth',.06); },               // МЦД — гудок
  busDoor:()=>{ noise(.42,.2,3200); noise(.16,.1,900,.36); },                             // пневмо-шипение дверей
  busEngine:()=>{ tone(48,1.4,'sawtooth',.06,6); tone(96,1.4,'square',.02,10); },         // двигатель низкий
  bell:()=>{ tone(1760,.07,'square',.1); tone(1760,.07,'square',.1,0,.12); },             // трамвай — «дзынь»
  tick:(on)=>tone(on?1900:1500,.025,'square',.07),                                        // такси — поворотник
};
AUD.trans5=AUD.trans5||{n:0,last:''}; function tsfx5(k,a){ try{ AUD.trans5.n++; AUD.trans5.last=k; TSFX5[k](a); }catch(e){} }
// двери метро: «пшш» + сигнал вместо одного сигнала (визуальный дубль уже есть: «Осторожно, двери…»)
{ const _d=SFX.doors; SFX.doors=function(){ const z=G.scene==='trip'&&TR.z; if(z&&(z.k==='mtrain'||z.k==='mplat')){ if(z.kind==='mck') return tsfx5('lastBeep'); return tsfx5('horn'); } if(z&&(z.k==='car'||z.k==='plat')) return tsfx5('metroDoors'); return _d(); }; }
// вагон: стыки 2/с на перегоне, гул при отправлении/торможении
{ const _tu=tripUpdate; tripUpdate=function(dt){ const r=_tu(dt); try{ const z=TR.z; if(G.scene==='trip'&&z&&(z.k==='car'||z.k==='mtrain')&&!TR.done&&!TR.smod){ const mv=!(z.stopT>0)&&!z.arrive; if(mv!==z.mv5){ if(z.mv5!==undefined) tsfx5('hum',mv); z.mv5=mv; } if(mv){ z.jT5=(z.jT5||0)-dt; if(z.jT5<=0){ z.jT5=z.k==='mtrain'?.8:.5; tsfx5('joint'); } } }
    if(G.scene==='trip'&&z&&z.k==='street'&&z.bus){ const st=z.bus.st; if(st!==z.bus.st5){ if(st==='wait') tsfx5('busDoor'); if(st==='leave') tsfx5('busEngine'); z.bus.st5=st; } } }catch(e){} return r; }; }
// ---------- интерьеры (база 100×46 px, рисуются в масштабе sc; контур #120c18)
const T5INK='#120c18'; let T5P=null; function t5Specs(){ if(!T5P){ const o={}; for(const k of ['aunt','kid','student','polite','seeds','tourist']) try{ o[k]=EN[k].spec(); }catch(e){} T5P=o; } return T5P; }
function t5Box(x,y,sc){ return (c,bx,by,bw,bh)=>{ ctx.fillStyle=c; ctx.fillRect(Math.round(x+bx*sc),Math.round(y+by*sc),Math.round(bw*sc),Math.round(bh*sc)); }; }
function t5Windows(R,t,x0,x1,wy,wh,step,ww,kind){ // окна с видом улицы, параллакс 2 слоя
  for(let wx=x0;wx+ww<=x1;wx+=step){ R(T5INK,wx-1,wy-1,ww+2,wh+2); R('#9ad8ff',wx,wy,ww,wh); R('#c8ecff',wx,wy,ww,3);
    for(let i=0;i<4;i++){ const fx=((i*13+wx*0.7-t*6)%(ww+12)+ww+12)%(ww+12)-6; const bh=5+(i*7)%5; const lx=Math.max(wx,Math.min(wx+ww,wx+fx)), rx=Math.max(wx,Math.min(wx+ww,wx+fx+8)); if(rx>lx) R(kind==='tram'?'#b0a4c8':'#a8b4c8',lx,wy+wh-bh,rx-lx,bh); }
    for(let i=0;i<2;i++){ const fx=((i*17+wx*1.3-t*22)%(ww+10)+ww+10)%(ww+10)-4; const lx=Math.max(wx,Math.min(wx+ww,wx+fx)), rx=Math.max(wx,Math.min(wx+ww,wx+fx+3)); if(rx>lx){ R('#3a8a4a',lx,wy+wh-7,rx-lx,5); R('#6a4a2a',Math.min(rx-1,lx+1),wy+wh-2,1,2); } }
    R('#ffffff66',wx+2,wy+2,1,wh-4); }
}
function drawBusInt5(x,y,sc,t){ const R=t5Box(x,y,sc); R(T5INK,-1,-1,102,48); R('#e8e4d8',0,0,100,46); R('#c8c4b8',0,0,100,5); R('#d8d4c8',0,22,100,1);
  t5Windows(R,t,4,100,7,14,24,20,'bus'); // большие окна
  R('#4a4a56',0,40,100,6); for(let i=2;i<100;i+=6) R('#3a3a46',i,41,3,1); R(T5INK,0,39,100,1); // пол рифлёный
  R('#5a5a68',36,6,15,34); R('#8fd8ff55',37,7,6,32); R('#8fd8ff55',44,7,6,32); R(T5INK,43,6,1,34); // двери-ширмы
  R('#d82626',52,24,2,2); R('#fff',52,24,1,1); // кнопка «СТОП» у дверей
  for(const [sx,c] of [[6,'#d84a4a'],[17,'#3a5ad8'],[66,'#3a5ad8'],[79,'#d84a4a']]){ R(T5INK,sx-1,25,10,15); R(c,sx,26,8,8); R('#ffffff44',sx+1,27,1,6); R(c,sx-1,33,10,3); R('#2a2a34',sx+3,36,2,4); } // сиденья поштучные
  for(const px of [29,57,92]){ R('#e8c020',px,5,1,35); R('#fff09a',px,5,1,2); } // поручни жёлтые вертикальные
  R(T5INK,58,22,6,9); R('#e8e8f0',59,23,4,7); R('#3ac84a',59,24,4,2); // валидатор на стойке
  R('#1a1424',62,1,26,4); }
function drawTramInt5(x,y,sc,t){ const R=t5Box(x,y,sc); R(T5INK,-1,-1,102,48); R('#e4e8f0',0,0,100,46); R('#b8c0d0',0,0,100,5);
  t5Windows(R,t,3,80,7,13,19,16,'tram');
  R('#4a4a56',0,40,100,6); R(T5INK,0,39,100,1);
  R('#3a5ab0',2,30,78,4); R('#2a4a90',2,33,78,2); R(T5INK,2,29,78,1); for(let i=4;i<80;i+=10) R('#2a2a34',i,35,2,5); // продольные сиденья
  for(let i=8;i<80;i+=12){ R('#c0c0c8',i,5,1,4); R(T5INK,i-1,9,3,3); R('#e8e8f0',i,10,1,1); } // ручки-петли
  R('#8a8aa0',81,4,2,36); R('#8fd8ff4d',83,5,16,34); R('#ffffff99',85,7,1,10); R('#3a3a48',88,24,10,15); R('#2a2a34',91,15,6,9); R('#ffd8b0',92,16,4,4); R('#2a3a6a',91,14,6,2); R(T5INK,86,22,4,4); R('#5a5a68',87,23,2,2); // кабина водителя за стеклом
  R('#1a1424',22,1,40,4); }
// модалки-сцены: «bus» / «tram»; такси — добавки к атласному салону
function t5Scene(m,kind){ G.labels.length=0; buttons.length=0; ctx.fillStyle=T5INK; ctx.fillRect(0,0,W,H);
  const sc=Math.max(2,Math.floor(Math.min((W-40)/100,(H-80)/46))), w=100*sc, hh=46*sc, x=Math.round(W/2-w/2), y=Math.round(H/2-hh/2)+6, sh=Math.round(Math.sin(m.t*(kind==='tram'?9:14))*.6*sc/3);
  (kind==='tram'?drawTramInt5:drawBusInt5)(x,y+sh,sc,m.t); const S=t5Specs(), ps=sc*.62, fy=y+sh+40*sc;
  if(kind==='bus'){ if(S.aunt) spr(S.aunt,'sit',0,'norm',x+10*sc,y+sh+36*sc,false,ps); if(S.kid) spr(S.kid,'sit',0,'o',x+66*sc,y+sh+36*sc,true,ps); spr(heroSpec(heroId),'idle',Math.floor(m.t*4)%2,'norm',x+27*sc,fy,false,ps); }
  else { if(S.seeds) spr(S.seeds,'sit',0,'norm',x+12*sc,y+sh+34*sc,false,ps); spr(heroSpec(heroId),'sit',0,'happy',x+42*sc,y+sh+35*sc,false,ps); if(typeof NASTYA!=='undefined') spr(NASTYA,'sit',0,'happy',x+52*sc,y+sh+34*sc,true,ps); if(S.student) spr(S.student,'idle',0,'norm',x+70*sc,fy,true,ps); }
  const bd=kind==='tram'?{x:x+42*sc,y:y+sh+3*sc,s:'ПАРК ▸ ФОНТАН',c:'#ffb42a'}:{x:x+75*sc,y:y+sh+3*sc,s:'№ 33 МЕГА',c:'#ffb42a'}; G.labels.push([bd.s,bd.x,bd.y,11,bd.c,'center',null]);
  G.labels.push([m.title||'',W/2,Math.max(SA.t+10,y-14),11,'#ffe14a','center',P.ink]);
  const cue=kind==='tram'?(Math.floor(m.t*2)%3===0?'ДЗЫНЬ!':''):(m.t<.7?'ПШШ':''); if(cue) G.labels.push([cue,x+(kind==='tram'?90:43)*sc,y+hh+12,11,'#bfe8ff','center',P.ink]); }
{ const _dm=st4DrawModal; st4DrawModal=function(m){ if(m.scene==='bus'||m.scene==='tram') return t5Scene(m,m.scene); const r=_dm(m);
    if(m.scene==='taxi'){ try{ const sc=Math.max(2,Math.floor(Math.min((W-40)/100,(H-80)/46))), w=100*sc, hh=46*sc, x=Math.round(W/2-w/2), y=Math.round(H/2-hh/2), R=t5Box(x,y+Math.round(Math.sin(m.t*20)*1),sc);
      for(let i=0;i<9;i++) R('#4a4a58',40-Math.round(i*.55),10+i,1,1); // ремень через плечо (ёлочка и счётчик — в атласе)
      const ly=y+hh+14; G.labels.push(['СЧЁТЧИК ₽ ↑ '+(120+Math.floor(m.t*37)),W/2-sc*16,ly,11,'#7aff8a','center',P.ink]); if(Math.floor(m.t*3)%2===0) G.labels.push(['◂ ТИК-ТАК',W/2+sc*18,ly,11,'#ffb42a','center',P.ink]); }catch(e){} }
    return r; }; }
// поворотник такси и звуки сцен (тикают в апдейте модалки)
{ const _tu=tripUpdate; tripUpdate=function(dt){ const m=TR.smod; const r=_tu(dt); try{ if(m&&m.scene){ const k=m.scene; m.s5=m.s5||{}; const tt=m.t||0;
    if(k==='taxi'){ const n=Math.floor(tt*3); if(n!==m.s5.n){ m.s5.n=n; tsfx5('tick',n%2===0); } }
    if(k==='bus'&&!m.s5.a){ m.s5.a=1; tsfx5('busDoor'); setTimeout(()=>tsfx5('busEngine'),450); }
    if(k==='tram'&&!m.s5.a){ m.s5.a=1; tsfx5('bell'); } } }catch(e){} return r; }; }
// выходные: МЕГА — на автобусе, Настя — на трамвае в парк (катсцены салона перед зоной; время не идёт — модалка)
function t5Ride(kind,title){ st4Modal({id:'ride5_'+kind,scene:kind,title,text:'',auto:2.4}); tev('ride5_'+kind); }
{ const _u=ZONES.mega.update; ZONES.mega.update=function(z,dt){ if(!z.ride5&&TR.mode==='trip'&&TR.wk&&!TR.smod){ z.ride5=1; t5Ride('bus',z.sun?'НА АВТОБУСЕ — СДАВАТЬ ПОКУПКИ':'НА АВТОБУСЕ ДО МЕГИ'); } return _u.call(this,z,dt); }; }
{ const ZS=ZONES.street, _u=ZS.update; ZS.update=function(z,dt){ if(z.nastya&&z.ev==='pigeons'&&!z.ride5&&TR.mode==='trip'&&TR.wk&&!TR.smod){ z.ride5=1; t5Ride('tram','НА ТРАМВАЕ В ПАРК'); } return _u.call(this,z,dt); }; }
