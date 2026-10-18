'use strict';
// ================= FB6 (v4.0.2): правки по фидбеку Сергея =================
// 1–3: спокойный звук (музыка тише/мягче/медленнее, бормотание тише и ниже, шаги мягче), 4: заставка дня по дням недели,
// 7: ролик «в чём смысл», 8: титул с подписанными «БЫСТРЫЙ МАТЧ»/«ОБУЧЕНИЕ». Подключается после ux5.js, до boot.js.
const FB6={ver:'4.0.2', mus:.55, voice:.5, sfx:.72, lpMus:1500, lpVoice:1700, cvGap:1.4, hvGap:1.2, uiGap:.09, introOff:!!navigator.webdriver };
// ---------- 1. музыка: общий множитель, лоупасс, без пищалок, медленнее ----------
audApply=function(){ if(!AC||!AUD.bus.sfx) return; const t=AC.currentTime, on=t<AUD.duckUntil-.005, tc=on?DUCK5.att/3:DUCK5.rel/3, bus=AUD.musBus||mus;
  const mv=.09*volOf('music')/60*FB6.mus*(on?DUCK5.m:1), sv=volOf('sfx')/80*FB6.sfx*(on?DUCK5.s:1), vv=volOf('voice')/80*FB6.voice*(save.calm?.5:1);
  bus.gain.setTargetAtTime(mv,t,tc); AUD.bus.sfx.gain.setTargetAtTime(sv,t,tc); AUD.bus.voice.gain.setTargetAtTime(vv,t,.02); master.gain.setTargetAtTime(save.mute?0:.4,t,.02);
  AUD.duckNow={on,m:on?DUCK5.m:1,s:on?DUCK5.s:1,tc}; AUD.fb6={music:mv,sfx:sv,voice:vv,master:save.mute?0:.4}; };
function fb6Filters(){ if(!AC||AUD.fb6f||!AUD.musBus||!AUD.bus.voice) return; try{
  const lm=AC.createBiquadFilter(); lm.type='lowpass'; lm.frequency.value=FB6.lpMus; lm.Q.value=.5; AUD.musBus.disconnect(); AUD.musBus.connect(lm); lm.connect(master);
  const lv=AC.createBiquadFilter(); lv.type='lowpass'; lv.frequency.value=FB6.lpVoice; lv.Q.value=.4; AUD.bus.voice.disconnect(); AUD.bus.voice.connect(lv); lv.connect(master);
  AUD.fb6f={lm,lv}; audApply(); }catch(e){} }
{ const _ab=audBuild; audBuild=function(){ _ab(); fb6Filters(); }; }
function fb6IsMus(d){ return !!d&&(d===mus||d===AUD.mA||d===AUD.mB||d===AUD.musBus); }
{ const _t=tone; tone=function(f,d,type,v,slide,delay,dst){ if(fb6IsMus(dst)){ if(type==='square'||type==='sawtooth'||!type) type='triangle'; while(f>1100) f/=2; v=(v==null?.25:v)*.8; AUD.fb6soft=(AUD.fb6soft||0)+1; } return _t(f,d,type,v,slide,delay,dst); }; }
for(const T of [MET5,typeof ST4_THEME!=='undefined'?ST4_THEME:null,typeof M3_THEME!=='undefined'?M3_THEME:null,typeof BC_THEME!=='undefined'?BC_THEME:null,WALTZ5,WALTZ5_SUN]) if(T){ T.bpm0=Math.round((T.bpm0||T.bpm)*.85); T.bpm=T.bpm0; }
// ---------- 2. бормотание: мягкие волны, ниже, реже ----------
for(const k in VOICE4){ const V=VOICE4[k]; if(V.w==='sawtooth'||V.w==='square'||V.w[0]==='p') V.w='triangle'; V.f=Math.round(V.f*.85); V.r=Math.max(7,V.r*.8); V.s*=.7; V.lp=Math.min(V.lp||1800,1800); V.crush=0; }
for(const k in VOX5){ const V=VOX5[k]; if(V.w==='sawtooth'||V.w[0]==='p') V.w='triangle'; V.f=Math.round(V.f*.85); V.s*=.7; V.lp=Math.min(V.lp||1700,1700); }
for(const k in EMO5){ const E=EMO5[k]; E.k=1+(E.k-1)*.5; }
{ const _cv=crowdVoice; crowdVoice=function(tb,text,emo,slot,layer){ if(typeof AC==='undefined'||!AC) return false; const now=AC.currentTime; slot=slot||'other';
  if(layer>=2){ AUD.dropped++; return false; } const key='cv_'+slot; if(!layer&&now<(AUD[key]||0)){ AUD.dropped++; return false; }
  const r=_cv(tb,text,emo,slot,layer); if(r&&!layer) AUD[key]=now+(slot==='scandal'?FB6.cvGap*1.4:FB6.cvGap); return r; }; }
{ const _hv=heroVoice; heroVoice=function(id,text){ if(typeof AC==='undefined'||!AC) return false; const now=AC.currentTime; const r=_hv(id,text); if(r) AUD.voiceUntil=Math.max(AUD.voiceUntil,now+FB6.hvGap); return r; }; }
// ---------- 3. кнопки/шаги: мягкий щелчок, не чаще 11 раз в секунду ----------
SFX.ui=function(){ if(!AC) return; if(G.scene==='trip'&&TR&&TR.z&&TR.z.k==='esc') return; /* на эскалаторе шаг уже звучит */ const n=AC.currentTime; if(n<(AUD.uiNext||0)) return; AUD.uiNext=n+FB6.uiGap; tone(440,.035,'triangle',.06); };
// ---------- 4. ЗАСТАВКА ДНЯ: 7 вариантов по дням недели × 4 погоды, ~4 с, тап = пропустить, ЗАНОВО того же дня — без неё ----------
const DAY6=[
  {n:'ПОНЕДЕЛЬНИК',s:'Будильник победил. Опять.',wall:'#2a2442',str:'#30294a',pose:'hurt',mood:'ko',prop:'alarm'},
  {n:'ВТОРНИК',s:'Как понедельник, только без оправданий.',wall:'#33304e',str:'#3a3656',pose:'idle',mood:'norm',prop:'mug'},
  {n:'СРЕДА',s:'Экватор недели — держись!',wall:'#36345a',str:'#3e3b62',pose:'idle',mood:'norm',prop:'hump'},
  {n:'ЧЕТВЕРГ',s:'Почти пятница. Почти.',wall:'#3c3660',str:'#443e6a',pose:'walk',mood:'norm',prop:'cal'},
  {n:'ПЯТНИЦА',s:'Доехать — и свобода!',wall:'#4a3466',str:'#553c72',pose:'jump',mood:'norm',prop:'party'},
  {n:'СУББОТА',s:'Выходной! Спешить некуда… почти.',wall:'#4e4a6a',str:'#565274',pose:'walk',mood:'norm',prop:'pack'},
  {n:'ВОСКРЕСЕНЬЕ',s:'Дача, рассада и бабушка.',wall:'#4a5068',str:'#525a72',pose:'idle',mood:'norm',prop:'sprout'}];
const WX6={clear:'ясно',rain:'дождь — лужи и зонты',snow:'снег — скользко',fog:'туман — не потеряйся'};
function fb6DayVariant(day){ day=day||save.day||{}; const wd=clamp(day.weekday|0,0,6), wx=(typeof dayWeather==='function'?dayWeather(day):day.weather)||'clear'; return {wd,wx,key:wd+':'+wx,D:DAY6[wd],type:(DAYTYPE4[day.type]||DAYTYPE4.normal).n}; }
function fb6Win(x,y,w,h,wx,wd,t){ const R=(a,b,c,d,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(a),Math.round(b),Math.round(c),Math.round(d)); };
  const sky=wx==='rain'?['#4e5c78','#6a7894']:wx==='snow'?['#9aa6bc','#c4ccdc']:wx==='fog'?['#a8a8b8','#c8c8d4']:wd>=4?['#ffb36b','#ffe2a0']:wd===0?['#5a5a7a','#8a7a8a']:['#e89a7a','#ffd09a'];
  R(x-3,y-3,w+6,h+6,P.ink); R(x,y,w,h,sky[0]); R(x,y,w,h*.45,sky[1]);
  if(wx==='clear'){ const sx=x+w*.72, sy=y+h*.32-Math.min(1,t/2)*h*.08; disc(ctx,sx,sy,9,9,'#fff3b0'); disc(ctx,sx,sy,7,7,'#ffe066'); }
  ctx.fillStyle=wx==='fog'?'#8a8a9c':'#2a2440'; for(let i=0;i<6;i++){ const bw=w/6, bh=h*(.25+((i*37)%5)/12); ctx.fillRect(Math.round(x+i*bw),Math.round(y+h-bh),Math.ceil(bw-2),Math.round(bh)); }
  ctx.fillStyle='#ffd86a'; for(let i=0;i<6;i++) if((i+wd)%2===0) ctx.fillRect(Math.round(x+i*w/6+4),Math.round(y+h-h*.18),2,2);
  if(wx==='rain'){ ctx.fillStyle='rgba(210,230,255,.85)'; for(let j=0;j<16;j++){ const xx=x+((j*29)%w), yy=y+((j*41+t*160)%h); ctx.fillRect(Math.round(xx),Math.round(yy),1,4); } }
  if(wx==='snow'){ ctx.fillStyle='#fff'; for(let j=0;j<18;j++){ const xx=x+((j*31+Math.sin(t*2+j)*4+w)%w), yy=y+((j*23+t*22)%h); ctx.fillRect(Math.round(xx),Math.round(yy),2,2); } }
  if(wx==='fog'){ ctx.fillStyle='rgba(230,230,240,.5)'; for(let j=0;j<3;j++) ctx.fillRect(x,Math.round(y+h*(.35+j*.2)+Math.sin(t+j)*2),w,Math.round(h*.12)); }
  R(x+w/2-1,y,3,h,P.ink); R(x,y+h/2-1,w,3,P.ink); R(x-6,y+h+3,w+12,4,'#8a6a4a'); R(x-6,y+h+7,w+12,1,P.ink); }
function fb6Prop(kind,x,y,t){ const R=(a,b,c,d,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(x+a),Math.round(y+b),c,d); };
  if(kind==='alarm'){ const j=Math.floor(t*14)%2?1:-1; R(-14,-2,30,14,P.ink); R(-13,-1,28,12,'#a06a3a'); disc(ctx,x+1+j,y-10,8,8,P.ink); disc(ctx,x+1+j,y-10,7,7,P.red); disc(ctx,x+1+j,y-10,5,5,'#fff'); R(1+j,-14,1,4,P.ink); R(1+j,-10,3,1,P.ink); if(Math.floor(t*6)%2) G.labels.push(['ДЗЫНЬ!',x+2,y-28,9,P.edge]); }
  else if(kind==='mug'){ R(-8,-12,14,13,P.ink); R(-7,-11,12,11,'#e8e0f0'); R(5,-9,4,7,P.ink); R(-7,-11,12,2,'#6a3a1a'); for(let i=0;i<3;i++){ const yy=-18-((t*12+i*5)%12); R(-5+i*4+Math.round(Math.sin(t*3+i)),yy,2,3,'rgba(255,255,255,.55)'); } }
  else if(kind==='hump'){ R(-22,-40,44,34,P.ink); R(-21,-39,42,32,'#f4ecd8'); R(-21,-39,42,6,'#d84a4a'); ctx.fillStyle='#5a4a6a'; for(let i=0;i<5;i++){ const h=[3,8,13,8,3][i]; ctx.fillRect(Math.round(x-17+i*8),Math.round(y-9-h),6,h); } ctx.fillStyle=P.red; ctx.fillRect(Math.round(x-1),Math.round(y-24),6,2); G.labels.push(['СР',x,y-36,6,'#fff']); }
  else if(kind==='cal'){ R(-20,-40,40,34,P.ink); R(-19,-39,38,32,'#f4ecd8'); R(-19,-39,38,6,'#3a6ad8'); G.labels.push(['ЧТ → ПТ',x,y-24,8,'#3a2a48']); G.labels.push(['скоро',x,y-14,6,'#7a6a9a']); }
  else if(kind==='party'){ for(let i=0;i<14;i++){ const xx=((i*53+t*40)%120)-60, yy=((i*31+t*90)%110)-110; R(xx,yy,3,2,['#ff7ab8','#3ff0ff','#ffd23f','#5aff8a'][i%4]); } }
  else if(kind==='pack'){ R(-9,-18,18,18,P.ink); R(-8,-17,16,16,'#3a8a5a'); R(-8,-17,16,3,'#5ab87a'); R(-3,-21,6,4,P.ink); R(-5,-10,10,5,'#2a6a4a'); }
  else if(kind==='sprout'){ for(let i=0;i<3;i++){ const px=-18+i*14; R(px,-8,10,8,P.ink); R(px+1,-7,8,6,'#a8643a'); R(px+4,-15,2,7,'#2a6a2a'); R(px+1,-16-(i%2),4,2,'#5ac85a'); R(px+5,-18+(i%2),4,2,'#5ac85a'); } } }
// R41: рамка непрозрачных пикселей спрайта (для «лёг/встал на поверхность») + герой, лежащий НА матрасе под одеялом
const SPRBB=new WeakMap();
function sprBBox(img){ if(SPRBB.has(img)) return SPRBB.get(img); let r=null; try{ const w=img.width,h=img.height,d=img.getContext('2d').getImageData(0,0,w,h).data; let x0=w,y0=h,x1=-1,y1=-1; for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(d[(y*w+x)*4+3]>40){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } if(x1>=0) r={x0,y0,x1,y1}; }catch(e){} SPRBB.set(img,r); return r; }
function fb6Lie(spec,x0,surf,sc,blk,bx0,bw){ const img=personSprite(spec,'down',0,'ko',0), b=sprBBox(img)||{x0:9,y0:40,x1:57,y1:58};
  const x=Math.round(x0-(b.x0-32)*sc), y=Math.round(surf+3-(b.y1+1-60)*sc), top=y+(b.y0-60)*sc, bot=y+(b.y1+1-60)*sc, len=(b.x1-b.x0+1)*sc, th=bot-top;
  spr(spec,'down',0,'ko',x,y,false,sc);
  const cx0=Math.round(x0+len*.4), cy=Math.round(top+th*.12), cw=Math.round(bx0+bw-cx0); ctx.fillStyle=P.ink; ctx.fillRect(cx0-1,cy-1,cw+1,Math.round(surf+18-cy)+1); ctx.fillStyle=blk; ctx.fillRect(cx0,cy,cw,Math.round(surf+18-cy));
  ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(cx0,cy,cw,2); ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(Math.round(x0+len*.95),cy+2,2,Math.round(surf-cy+14)); ctx.fillRect(cx0,Math.round(surf+12),cw,2);
  return {hx:x0+len*.12,top,bot,surf,x0,len}; }
CUTS.day={len:4.2,start:c=>{ c.v=fb6DayVariant(c.arg&&c.arg.day); FB6.lastIntro=c.v.key; FB6.introN=(FB6.introN||0)+1; },draw:(t,c)=>{ const v=c.v||fb6DayVariant(), D=v.D, by=Math.round(H*.74), a=Math.min(1,t/.35)*Math.min(1,Math.max(0,(c.len-t)/.35));
  ctx.fillStyle=D.wall; ctx.fillRect(0,0,W,H); ctx.fillStyle=D.str; for(let x=0;x<W;x+=26) ctx.fillRect(x,0,13,by); ctx.fillStyle='#2a2238'; ctx.fillRect(0,by,W,H-by); ctx.fillStyle='#1a1424'; for(let x=0;x<W;x+=22) ctx.fillRect(x,by,1,H-by); ctx.fillStyle=P.ink; ctx.fillRect(0,by,W,2);
  const ww=Math.round(Math.min(W*.3,200)), wh=Math.round(Math.min(H*.36,130)), wx0=Math.round(Math.max(SA.l+18,W*.1)), wy0=Math.round(Math.max(SA.t+30,H*.16)); fb6Win(wx0,wy0,ww,wh,v.wx,v.wd,t);
  // мебель: кровать справа, тумбочка между окном и кроватью, коврик
  const bx0=Math.round(W*.55), bw=Math.round(Math.min(W*.3,230)), nx=Math.round((wx0+ww+bx0)/2), R=(a1,b1,c1,d1,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(a1),Math.round(b1),Math.round(c1),Math.round(d1)); };
  const blk=v.wd>=5?'#5a9a6a':v.wd===4?'#d8467e':'#6a5ad8', lie0=v.wd===0&&t<2.6, pw0=Math.round(bw*.2);
  R(bx0-2,by-30,bw+4,32,P.ink); R(bx0,by-28,bw,26,'#e8e0f0'); R(bx0,by-10,bw,8,'#c8c0d8'); if(!lie0){ R(bx0+bw*.28,by-29,bw*.72,1,P.ink); R(bx0+bw*.28,by-28,bw*.72,20,blk); } R(bx0+3,by-36,pw0+2,10,P.ink); R(bx0+4,by-35,pw0,8,'#fff'); R(bx0+4,by-29,pw0,2,'#d8d0e8'); R(bx0-6,by-44,6,46,P.ink); R(bx0-5,by-43,4,44,'#8a5a3a'); R(bx0+bw,by-34,5,36,P.ink); R(bx0+bw+1,by-33,3,34,'#8a5a3a');
  R(nx-16,by-26,32,28,P.ink); R(nx-15,by-25,30,27,'#a06a3a'); R(nx-15,by-25,30,3,'#c08a5a'); R(nx-2,by-14,4,2,P.ink);
  ctx.fillStyle='#3a2a48'; ctx.fillRect(Math.round(W*.42),by+10,Math.round(W*.3),Math.round((H-by)*.32)); ctx.fillStyle='#4a3658'; for(let x=Math.round(W*.42)+4;x<W*.72-4;x+=8) ctx.fillRect(x,by+12,4,2);
  const px=D.prop==='hump'||D.prop==='cal'?nx:D.prop==='sprout'?wx0+ww/2:D.prop==='party'?W*.62:nx, py=D.prop==='hump'||D.prop==='cal'?by-58:D.prop==='sprout'?wy0+wh+3:D.prop==='party'?by-30:by-26; fb6Prop(D.prop,px,py,t);
  const lying=v.wd===0&&t<2.6, hx=Math.round(lying?bx0+bw*.55:W*.66+(D.pose==='walk'?Math.sin(t*1.5)*12:0)), hop=D.pose==='jump'?Math.round(Math.abs(Math.sin(t*5))*-16):0;
  if(lying) FB6.lie=fb6Lie(heroSpec(heroId),bx0+6,by-28,1.6,blk,bx0,bw); else spr(heroSpec(heroId),D.pose==='jump'&&hop>-4?'cheer':D.pose,Math.floor(t*10)%8,v.wd===0?'hurt':D.mood,hx,by+8+hop,false,1.6);
  if(lying&&FB6.lie) G.labels.push(['z z z',FB6.lie.hx+14,FB6.lie.top-10-Math.sin(t*3)*3,10,'#aaf']);
  // заголовок дня — справа сверху, ниже кнопки «ПРОПУСТИТЬ»
  const k=Math.min(1,t/.5), tx=Math.round(W*.66+(1-k)*30), ty=Math.round(Math.max(SA.t+60,H*.27)); ctx.globalAlpha=a;
  const sub2=v.type+' · '+WX6[v.wx], tw=Math.max(txtW(D.n,22),txtW(sub2,8),7*24)+28; ctx.fillStyle='rgba(18,12,24,.78)'; ctx.fillRect(Math.round(tx-tw/2),ty-18,Math.round(tw),62); ctx.fillStyle=WD4_COL[v.wd]; ctx.fillRect(Math.round(tx-tw/2),ty-18,Math.round(tw),2); ctx.globalAlpha=1;
  for(let i=0;i<7;i++){ const cxp=Math.round(tx+(i-3)*24), on=i===v.wd; ctx.fillStyle=on?WD4_COL[i]:'#3a3050'; ctx.fillRect(cxp-10,ty+31,20,10); G.labels.push([WD4[i],cxp,ty+36,6,on?'#fff':'#9a8ab8']); }
  G.labels.push([D.n,tx,ty,22,WD4_COL[v.wd],'center',P.ink]); G.labels.push([sub2,tx,ty+19,8,'#e8e0f0']); FB6.titleRect={x:tx-tw/2,y:ty-18,w:tw,h:62};
  { const sw=txtW(D.s,11)+24; ctx.fillStyle='rgba(18,12,24,.7)'; ctx.fillRect(Math.round(W/2-sw/2),H-SA.b-34,Math.round(sw),22); G.labels.push([D.s,W/2,H-SA.b-23,11,v.wd===4?'#5aff8a':v.wd===0?'#ffb0a0':'#fff']); FB6.subRect={x:W/2-sw/2,y:H-SA.b-34,w:sw,h:22}; } if(t>2.2) G.labels.push(['тапни — и в путь',W/2,H-SA.b-6,7,'#b8a8d8']);
  if(v.wd===4){ drawParts(); } } };
{ const _cu=cutUpdate; cutUpdate=function(dt){ if(CUT&&CUT.id==='day'&&CUT.t>.25&&input.events.some(e=>e.t==='tap'||e.t==='key')){ input.events.length=0; FB6.introSkipped=(FB6.introSkipped||0)+1; return endCut(); } return _cu(dt); }; }
{ const _sd=startDay; startDay=function(idx,opts){ opts=opts||{}; const plan=_sd(idx,opts); try{ const d=TR.day, on=window.__dayIntro===true||(!FB6.introOff&&window.__dayIntro!==false);
    if(on&&d&&TR.mode==='trip'&&!opts.resume&&save.introSeed!==d.seed&&!save.calmIntro){ save.introSeed=d.seed; store(); startCut('day',()=>{ G.scene='trip'; tgBack(true); },{day:d}); } }catch(e){ G.scene='trip'; } return plan; }; }
// ---------- 7. РОЛИК «В ЧЁМ СМЫСЛ»: 6 сцен по ~4 с, тап = следующая сцена, ПРОПУСТИТЬ = выйти, в конце ИГРАТЬ ----------
const EXPL6=[ {t:0,s:'Каждое утро одна задача: успеть на работу к 09:00'}, {t:4,s:'Сначала просто едешь: толпа, турникет, эскалатор, вагон'},
  {t:8,s:'Успел — получи очки. Быстрее и вежливее — больше очков'}, {t:12,s:'Очки или дни открывают новые маршруты: автобус, МЦК, МЦД, бизнес-центр'},
  {t:16,s:'Дни разные: понедельник тяжёлый, пятница весёлая, погода, выходные'}, {t:20,s:'Готов? Поехали!'} ];
function fb6ExplScene(t){ let i=0; for(let j=0;j<EXPL6.length;j++) if(t>=EXPL6[j].t) i=j; return i; }
function fb6Strip(cx,cy,w,k,t,unlockK,hx){ const R=(a,b,c,d,col)=>{ ctx.fillStyle=col; ctx.fillRect(Math.round(a),Math.round(b),Math.round(c),Math.round(d)); };
  const xs=[0,.25,.5,.75,1].map(f=>Math.round(cx-w/2+f*w)); R(xs[0],cy-2*k,w,4*k,P.ink); R(xs[0],cy-k,w,2*k,'#8a8898'); R(xs[1],cy-2*k,xs[3]-xs[1],4*k,P.ink); R(xs[1],cy-1.5*k,xs[3]-xs[1],3*k,'#d8265e');
  m5House(xs[0],cy-6*k,k); m5MSign(xs[1],cy-12*k,k); m5ExitSign(xs[3],cy-12*k,k); m5Office(xs[4],cy-6*k,k,16); if(unlockK!=null) m5Bc(xs[2]+Math.round((xs[3]-xs[2])/2),cy+22*k,k);
  const locks=[[(xs[0]+xs[1])/2,cy,'улица'],[(xs[3]+xs[4])/2,cy,'улица-2'],[xs[2],cy+12*k,'МЦК/МЦД']]; if(unlockK!=null){ locks.forEach((L,i)=>{ const op=unlockK>i; R(L[0]-7*k,L[1]-7*k,14*k,14*k,op?'#bfe6b0':'#fffaf0'); if(op){ m5Steps(L[0],L[1],k,'#2a6a3a'); } else m5LockIco(L[0],L[1]+2*k,k,'#8a8898'); G.labels.push([op?'открыто!':L[2],L[0],L[1]+12*k,8,op?'#1f8a4a':'#5a4a6a','center',null]); }); }
  if(hx!=null) spr(heroSpec(heroId),'walk',Math.floor(t*12)%8,'norm',Math.round(cx-w/2+hx*w),cy+4*k,false,1); return xs; }
// R41: пол/платформа под персонажами ролика (раньше стояли в пустоте кремовой панели)
function fb6Ground(x0,x1,y,yb,kind){ x0=Math.round(x0); x1=Math.round(x1); y=Math.round(y); yb=Math.round(yb); if(yb<=y) return; const col={plat:['#b8b0a0','#e8c020'],floor:['#c8bca8','#a89c88'],street:['#a8a8b0','#e8e8f0']}[kind]||['#c8bca8','#a89c88'];
  ctx.fillStyle=col[0]; ctx.fillRect(x0,y,x1-x0,yb-y); ctx.fillStyle=P.ink; ctx.fillRect(x0,y,x1-x0,1); ctx.fillStyle=col[1]; if(kind==='plat') ctx.fillRect(x0,y+2,x1-x0,2); else for(let x=x0+6;x<x1;x+=28) ctx.fillRect(x,y+Math.round((yb-y)/2),14,1);
  (FB6.grounds=FB6.grounds||[]).push({y,yb,kind}); }
CUTS.explain={len:24,start:c=>{ FB6.explN=(FB6.explN||0)+1; },draw:(t,c)=>{ FB6.grounds=[]; const i=fb6ExplScene(t), lt=t-EXPL6[i].t, k=Math.max(2,Math.round(Math.min(W/400,H/180))), cx=W/2, cy=Math.round(H*.46);
  ctx.fillStyle='#1b1426'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#231a33'; for(let x=0;x<W;x+=30) ctx.fillRect(x,0,15,H); c.scene=i;
  const pw=Math.round(Math.min(W-SA.l-SA.r-40,560)), ph=Math.round(H*.5); ctx.fillStyle=P.ink; ctx.fillRect(Math.round(cx-pw/2)-2,Math.round(cy-ph/2)-2,pw+4,ph+4); ctx.fillStyle=i===4?'#2a2240':'#fffaf0'; ctx.fillRect(Math.round(cx-pw/2),Math.round(cy-ph/2),pw,ph);
  const sw=pw-60;
  if(i===0){ const p=Math.min(1,lt/3.5); fb6Strip(cx,cy,sw,k,t,null,p); const mm=40+Math.floor(p*19); G.labels.push(['08:'+String(mm).padStart(2,'0'),cx,cy-ph/2+16,14,mm>55?'#d83a3a':'#1a1020','center',null]); G.labels.push(['ДОМ',cx-sw/2,cy+16*k,8,'#6a5a3a','center',null]); G.labels.push(['ОФИС',cx+sw/2,cy+16*k,8,'#6a5a3a','center',null]); }
  else if(i===1){ const by=cy+ph*.3, n=9; fb6Ground(cx-pw/2,cx+pw/2,by-8,cy+ph/2,'plat'); for(let j=0;j<n;j++){ const sp=[EN.polite,EN.aunt,EN.bag,EN.kid,EN.tourist,EN.seeds,EN.courier,EN.musician,EN.granny||EN.aunt][j]; if(!sp._s) sp._s=sp.spec(); const x=cx-sw/2+30+j*(sw-60)/(n-1); spr(sp._s,'idle',0,'angry',x,by+(j%2)*6,j%2===0,1.1); }
    const hx=cx-sw/2+20+((lt*60)%(sw-40)); spr(heroSpec(heroId),Math.floor(lt*3)%2?'p2':'walk',Math.floor(t*10)%8,'angry',hx,by+10,false,1.2); G.labels.push(['ТОЛКНУТЬ · ВЛЕЗТЬ · ВОЙТИ',cx,cy-ph/2+16,10,'#3a2a48','center',null]); }
  else if(i===2){ fb6Ground(cx-pw/2,cx+pw/2,cy+ph*.35-8,cy+ph/2,'floor'); const pts=Math.floor(Math.min(1,lt/3)*1240); G.labels.push(['УСПЕЛ! 08:57',cx,cy-ph/2+18,14,'#1f8a4a','center',null]); G.labels.push([pts+' очк.',cx,cy+4,24,'#c88a1a','center',P.ink]); for(let j=0;j<3;j++) G.labels.push(['★',cx+(j-1)*28,cy+34,18,lt>.8+j*.6?'#ffc21f':'#c8bcd8','center',P.ink]); spr(heroSpec(heroId),'cheer',Math.floor(t*8)%2,'norm',cx-sw/2+50,cy+ph*.35,false,1.3); }
  else if(i===3){ if(typeof fb6Routes==='function') fb6Routes(cx,cy,pw,ph,k,lt); else fb6Strip(cx,cy-8*k,sw,k,t,Math.floor(lt/1.1),null); }
  else if(i===4){ for(let j=0;j<7;j++){ const x=Math.round(cx+(j-3)*Math.min(64,sw/7)), on=Math.floor(lt*2.2)%7===j; ctx.fillStyle=on?WD4_COL[j]:'#3a3050'; ctx.fillRect(x-24,cy-30,48,26); G.labels.push([WD4[j],x,cy-17,10,on?'#1a1020':'#c8b8e8']); }
    const wx=['ясно','дождь','снег','туман'], wc=['#ffd23f','#7ab0ff','#fff','#b8b8c8']; for(let j=0;j<4;j++) G.labels.push([wx[j],cx+(j-1.5)*Math.min(110,sw/4),cy+18,9,wc[j]]); G.labels.push(['СБ и ВС — дача или прогулка с Настей',cx,cy+44,9,'#ffd23f']); }
  else { const b=Math.round(Math.max(40,56*DPR/SC)), bw=Math.min(220,pw*.5); fb6Ground(cx-pw/2,cx+pw/2,cy+b/2+12,cy+ph/2,'street'); spr(heroSpec(heroId),'walk',Math.floor(t*12)%8,'norm',cx-bw/2-40,cy+b/2+20,false,1.4); G.labels.push(['ДАВКА ДО РАБОТЫ',cx,cy-ph/2+22,18,P.edge,'center',P.ink]);
    bigBtn('ИГРАТЬ ▶',Math.round(cx-bw/2),Math.round(cy-b/2+6),Math.round(bw),b,'#d8265e',()=>{ SFX.ui(); endCut(); },'explplay',14); }
  // подпись сцены + точки прогресса
  const s=EXPL6[i].s, f=W<720?10:11, sw2=Math.min(W-SA.l-SA.r-24,txtW(s,f)+24); ctx.fillStyle='rgba(18,12,24,.85)'; ctx.fillRect(Math.round(cx-sw2/2),Math.round(cy+ph/2+8),Math.round(sw2),24); G.labels.push([s,cx,cy+ph/2+20,f,'#fff']); FB6.explSub={x:cx-sw2/2,y:cy+ph/2+8,w:sw2,h:24,s};
  for(let j=0;j<EXPL6.length;j++){ ctx.fillStyle=j===i?'#ffd23f':'#4a3a60'; ctx.fillRect(Math.round(cx+(j-2.5)*14-4),Math.round(cy-ph/2-14),8,4); } } };
{ const _cu=cutUpdate; cutUpdate=function(dt){ if(CUT&&CUT.id==='explain'){ const tap=input.events.some(e=>e.t==='tap'||e.t==='key'); input.events.length=0; if(tap&&CUT.t>.4){ const i=fb6ExplScene(CUT.t); if(i<EXPL6.length-1){ CUT.t=EXPL6[i+1].t; return; } }
    CUT.t+=Math.min(dt,.1); if(CUT.t>=CUT.len) endCut(); return; } return _cu(dt); }; }
function fb6Explain(done){ save.cut=save.cut||{}; save.cut.explain=1; save.cut.intro31=1; save.cut.intro=1; store(); startCut('explain',done||(()=>toMap())); }
// ---------- 8. ТИТУЛ: ИГРАТЬ + две подписанные плашки «БЫСТРЫЙ МАТЧ» и «ОБУЧЕНИЕ»; в углу кошелёк, настройки, «?» = ролик ----------
{ const _dt=drawTitle; drawTitle=function(){ _dt.apply(this,arguments); if(G.lpick||G.settings||G.scene!=='title') return; const op=()=>!(window.__econ&&__econ.isOpen());
  const pb=buttons.find(b=>b.id==='play'); if(!pb) return; { const cb0=pb.cb; pb.cb=()=>{ if(op()&&save.cut&&!save.cut.explain&&(!FB6.introOff||window.__dayIntro===true)){ SFX.ui(); fb6Explain(()=>toMap()); } else cb0(); }; } const ex=buttons.find(b=>b.id==='exit'), le=buttons.find(b=>b.id==='learn');
  // переносим ⚡ и ? из угла: старые иконки закрываем фоном угла и убираем их кнопки
  const ib=Math.round(Math.max(24,36*DPR/SC)), L=SA.l+8, T=SA.t+8, gap=Math.round(ib*.3); if(ex){ buttons=buttons.filter(b=>b!==ex&&b!==le); }
  ctx.save(); ctx.beginPath(); ctx.rect(L+2*(ib+gap)-2,T-2,2*(ib+gap)+4,ib+6); ctx.clip(); { const nL=G.labels.length; drawBG(G.t*20); G.labels.length=nL; } ctx.fillStyle='rgba(18,12,24,.5)'; ctx.fillRect(0,0,W,H); ctx.restore();
  if(typeof UX5!=='undefined') UX5.rects=(UX5.rects||[]).filter(r=>!(r.kind==='ico'&&r.x>=L+2*(ib+gap)-3));
  ux5IcoBtn('help',L+2*(ib+gap),T,ib,'#4a3a78','#fff','explain',()=>{ if(op()) fb6Explain(()=>toTitle()); });
  // подсказку под ИГРАТЬ убираем — её роль играют подписи плашек
  G.labels=G.labels.filter(l=>!/^впервые\?|^рекорд прорыва/.test(l[0])); if(typeof UX5!=='undefined') UX5.rects=(UX5.rects||[]).filter(r=>r.id!=='hint');
  const ch=Math.round(Math.max(26,36*DPR/SC)), cw=Math.round(Math.max(118,Math.min(170,(W-SA.l-SA.r)*.2))), g2=14, y=Math.round(pb.y+pb.h+12), x1=Math.round(W/2-cw-g2/2), x2=Math.round(W/2+g2/2);
  const pulse=!save.learned?.5+.5*Math.sin(G.t*4):0; if(pulse){ ctx.fillStyle='rgba(90,255,140,'+(.15+.2*pulse).toFixed(3)+')'; ctx.fillRect(x2-4,y-4,cw+8,ch+8); }
  bigBtn('БЫСТРЫЙ МАТЧ',x1,y,cw,ch,'#2a3a78',()=>{ if(op()) startExit(); },'exit',9); bigBtn('ОБУЧЕНИЕ',x2,y,cw,ch,'#1f6a46',()=>{ if(op()){ if(save.learned&&typeof startLearnStreet==='function'&&typeof unl4==='function'&&unl4('street1')) G.lpick=1; else startLearn(); } },'learn',9);
  const cy=y+ch+9; G.labels.push([save.escBest?'⚡ рекорд '+save.escBest.toFixed(1)+' с':'⚡ вырвись из вагона',x1+cw/2,cy,7,'#c8c0e8']); G.labels.push([save.learned?'все приёмы ещё раз':'впервые? начни тут',x2+cw/2,cy,7,save.learned?'#c8c0e8':'#b8ffc8']);
  G.labels.push(['v'+FB6.ver,W-SA.r-8,H-SA.b-8,6,'#8a7aa8','right']);
  FB6.chips=[{id:'exit',x:x1,y,w:cw,h:ch},{id:'learn',x:x2,y,w:cw,h:ch},{id:'play',x:pb.x,y:pb.y,w:pb.w,h:pb.h}];
  if(window.__econ&&__econ.isOpen()) drawEcon(); }; }
// первый запуск: ИГРАТЬ → ролик → карта (вместо старых заставок intro+metro)
{ const _sc=startCut; startCut=function(id,done,arg){ if(id==='intro'&&G.scene==='title'&&save.cut&&!save.cut.explain&&!FB6.introOff){ return fb6Explain(()=>toMap()); } return _sc(id,done,arg); }; }
// ---------- FB6-9: начальница в «опоздал» — взрослая офисная начальница (35–45): тёмный каре, очки, синий пиджак, юбка-карандаш, руки скрещены / стучит по часам ----------
const BOSS6={c:{}};
function bossSprite(fr){ const key=fr; if(BOSS6.c[key]) return BOSS6.c[key]; const [cc,x]=mkc(64,64); const R=(a,b,w,h,col)=>{ x.fillStyle=col; x.fillRect(a,b,w,h); };
  const skin='#f0c49c', skinD='#d8a47c', hair='#3a2216', hairL='#5a3a26', jac='#2a3c72', jacL='#3e56a0', jacD='#1c2a54', skirt='#34343e', shirt='#f4f2fa';
  const tap=fr==='cross1'?1:0;
  // ноги в капроне + туфли на каблуке
  R(28,50,3,8,skinD); R(33,50,3,8-tap,skinD); R(27,57,5,3,'#14121a'); R(27,59,1,1,'#14121a'); R(33,57-tap,5,3,'#14121a'); R(37,59-tap,1,1,'#14121a');
  // юбка-карандаш
  R(26,40,12,11,skirt); R(26,40,12,1,'#4a4a56'); R(31,46,1,5,'#24242c');
  // пиджак
  R(25,23,14,19,jac); R(25,23,1,19,jacL); R(38,23,1,19,jacD); R(24,24,2,6,jac); R(38,24,2,6,jac);
  R(30,23,4,8,shirt); R(29,23,1,7,jacL); R(34,23,1,7,jacL); R(31,31,1,1,'#c8a040'); R(31,35,1,1,'#c8a040'); R(26,38,12,1,jacD);
  // шея + голова
  R(30,20,4,4,skinD); R(27,9,11,13,skin); R(28,8,9,1,skin); R(37,12,1,7,skin);
  // каре: шапочка + задняя прядь до подбородка + чёлка набок
  R(26,6,12,4,hair); R(25,8,3,13,hair); R(28,9,3,3,hair); R(31,9,6,2,hair); R(36,10,2,2,hair); R(27,6,7,1,hairL); R(25,19,4,2,hair);
  // лицо: строгие брови, очки, сжатые губы, серёжка
  R(31,12,3,1,'#2a1810'); R(35,12,2,1,'#2a1810'); R(33,13,1,1,'#2a1810');
  R(30,14,4,1,'#1a1420'); R(30,16,4,1,'#1a1420'); R(30,14,1,3,'#1a1420'); R(33,14,1,3,'#1a1420'); R(31,15,2,1,'#e6eef8'); R(32,15,1,1,'#2a1810'); R(34,15,1,1,'#1a1420'); R(35,14,3,1,'#1a1420'); R(35,16,3,1,'#1a1420'); R(37,14,1,3,'#1a1420'); R(36,15,1,1,'#2a1810');
  R(37,17,1,2,skinD); R(33,19,3,1,'#a04858'); R(29,17,1,2,'#e0a888'); R(28,18,1,1,'#e8c050');
  // руки
  if(fr==='watch'||fr==='watch1'){ const u=fr==='watch1'?1:0; R(25,25,3,10,jac); R(26,33,9,3,jac); R(35,33,3,3,skin); R(33,33,2,2,'#e8c050'); R(37,24,3,6-u,jac); R(36,28-u,2,2,jac); R(33,30-u,3,2,skin); }
  else if(fr==='hold'){ R(25,25,3,12,jac); R(26,36,2,2,skin); R(37,26,8,3,jac); R(45,26,3,3,skin); }
  else { R(24,30,16,4,jac); R(24,30,16,1,jacL); R(24,33,16,1,jacD); R(38,30,3,3,skin); R(23,31,2,2,skin); }
  const o=outline(cc,64,64,1); BOSS6.c[key]=o; return o; }
function drawBoss6(x,y,flip,sc,t,mode){ const fr=mode==='hold'?'hold':mode==='watch'?(Math.floor(t*5)%2?'watch1':'watch'):(Math.floor(t*4)%2?'cross1':'cross'); const img=bossSprite(fr); ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); ctx.drawImage(img,Math.round(-32*sc),Math.round(-60*sc),Math.round(64*sc),Math.round(64*sc)); ctx.restore(); FB6.bossDrawn=(FB6.bossDrawn||0)+1; FB6.bossFr=fr; }
CUTS.late.draw=(t,c)=>{ const m=Math.min(9,Math.floor(t)), g=e4Begin({time:[9,m],late:1,noBack:1}), {dx,FY}=g; e4Desk(dx,FY); e4Mon(dx,FY,'off'); e4Chair(dx-28,FY+3); const bx=Math.round(g.SW*.78);
  drawBoss6(bx,FY+2,true,1,t,t>4.5?'hold':t>2.6?'watch':'cross'); const hx=t<4?E4WALK(t,4,bx-44,g.SW):bx-44; spr(heroSpec(heroId),t<4?'walk':'hurt',Math.floor(t*6)%8,'o',hx,FY+2,false,1);
  if(TR&&TR.coffee) m4BigCup(hx+8,FY-24,t<4);
  if(t<4) E4L('на цыпочках…',hx,FY-46,7,'#fff'); if(t>2.6&&t<4.5) E4L('тук-тук по часам',bx,FY-58,6,'#ffd98a');
  if(t>4.5){ e4r(P.ink,bx-25,FY-36,14,18); e4r('#fff',bx-24,FY-35,12,16); for(let i=0;i<4;i++) e4r(P.ink,bx-22,FY-32+i*3,8,1); E4L('ОБЪЯСНИТЕЛЬНАЯ',bx-20,FY-60,7,P.red); if(TR&&TR.coffee) E4L('…зато с кофе',hx-16,FY-43,7,'#ffd98a'); }
  e4End(); G.labels.push(['09:0'+m,W/2,SA.t+18,14,'#ff6a6a']); sub(t<4?'Опоздал. Может, никто не заметит?':'Начальница заметила. Бланк уже распечатан.'); };
