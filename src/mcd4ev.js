'use strict';
// M3-8…M3-13: «ЗАЙЦЕМ», контролёры (предупреждение 6–8 с, с одного/двух концов, 18 px/с к центру), 7 укрытий §K, пойман (штраф/долг/объяснительная),
// достижение «заяц» (уши), заяц в метро (створка «ПРОХОДИТЕ!» + контролёр на выходе 15%), карточки-обучение, тема МЦД (банджо-square 100 BPM).
{ const _gt=goalText; goalText=function(z){ if(z&&(z.k==='mgate'||z.k==='mexit'||z.k==='mplat'||z.k==='mtrain')){ if(TR.m3tut) return '★ '+M3TUT[TR.m3tut.k][2]; return z.hint||''; } return _gt(z); }; }
const M3HIDE={ wc:{b:'В ТУАЛЕТ',n:'туалет',rule:'Спрячься в туалете! Бывает занят'},
  fat:{b:'СПРЯТАТЬСЯ ЗА',n:'толстяк',rule:'Встань за толстяком и замри!'},
  tb:{b:'В ТАМБУР',n:'тамбур',rule:'Пережди в тамбуре — могут заглянуть'},
  news:{b:'ЗА ГАЗЕТУ',n:'газета',rule:'Закройся газетой и не шевелись!'},
  blend:{b:'СЛИТЬСЯ',n:'толпа',rule:'Затеряйся в толпе — только не толкайся!'},
  out:{b:'ВЫЙТИ',n:'выйти',rule:'Выйди на остановке — надёжно, но долго'},
  sleep:{b:'СПЛЮ',n:'спящий',rule:'Притворись спящим — вдруг пронесёт'} };
// ---------- контролёры в поезде ----------
function m3CtlInit(z){ const d=z.ctl; z.C=d?{both:!!d.both,at:d.at,ph:'idle',es:[],side:(z.seed>>3)%2?'R':'L'}:null; }
function m3HeroHidden(){ const s=TR.m3hide; return !!s&&s.k!=='news'&&s.k!=='blend'&&s.k!=='sleep'; }
function m3CtlTick(z,dt){ const C=z.C; if(!C) return; const h=G.hero;
  if(C.ph==='idle'&&z.T>=C.at&&!z.arrive){ C.ph='warn'; C.wt=rnd(6,8); C.sides=C.both?['L','R']:[C.side]; tev('m3_ctl_warn'); tev(C.both?'m3_ctl_both':'m3_ctl_one'); say('«Уважаемые пассажиры! Проверка билетов!»',2.4,'#ffb84a'); SFX.squeak&&SFX.squeak();
    if(TR.hare&&!z.stopAt.some(t=>t>z.T+1&&t<z.T+C.wt-1.5)){ z.stopAt.push(Math.round(z.T+C.wt*.45)); z.stopAt.sort((a,b)=>a-b); z.si=z.stopAt.filter(t=>t<z.T).length; tev('m3_ctl_stop'); } if(typeof m3TutCheck==='function') m3TutCheck(z,'ctl'); }
  else if(C.ph==='warn'){ C.wt-=dt; if(C.wt<=0){ const car=m3CarAt(z,h.x+1); C.car=car; C.ph='walk'; C.cx=Math.round((car.s0+car.s1)/2); tev('m3_ctl_in');
      for(const sd of C.sides){ const e=mkNpc('polite',sd==='L'?car.tb0+6:car.s1+30,z.y0+20+(sd==='L'?6:-2)); e.atl=sd==='L'?'ctrlM':'ctrlF'; e.ctl=1; e.ghost=true; e.m=6; e.face=sd==='L'?1:-1; e.side=sd; e.tgt=C.both?C.cx+(sd==='L'?-7:7):(sd==='L'?car.s1+28:car.tb0+8); z.npcs.push(e); C.es.push(e); bubble(e,'Билетики!',1.4,'#ffb84a'); } } }
  else if(C.ph==='walk'){ C.wk=(C.wk||0)+dt; const car=C.car; if(!m3HeroHidden()||TR.m3hide.k==='fat') h.x=clamp(h.x,car.s0-24,car.s1+24); let all=true;
    for(const e of C.es){ const d=e.tgt-e.x; if(Math.abs(d)>1){ all=false; e.x+=Math.sign(d)*Math.min(Math.abs(d),18*dt); e.vx=Math.sign(d)*18; e.face=Math.sign(d); e.set('walk'); } else { e.vx=0; e.set('idle'); }
      for(const o of z.npcs){ if(o===e||o.ctl||o.chk) continue; if(Math.abs(o.x-e.x)<8){ o.chk=1; if(Math.random()<.35&&(C.wk||0)>1.8) bubble(o,pick(['Вот…','Проездной!','Да есть, есть']),1); } }
      m3CtlMeet(z,e); }
    if(all){ C.ph='leave'; C.lt=2.5; tev('m3_ctl_passed'); m3HideResolve(z,'end'); } }
  else if(C.ph==='leave'){ C.lt-=dt; for(const e of C.es){ e.x+=(e.side==='L'?18:-18)*dt*(C.both?-1:1); e.set('walk'); e.face=Math.sign((e.side==='L'?1:-1)*(C.both?-1:1)); } if(C.lt<=0){ for(const e of C.es) e.gone=true; C.es=[]; C.ph='done'; if(TR.m3hide) m3HideEnd(z,true); } }
  if(C.chkT>0){ C.chkT-=dt; z.lockHero=true; if(C.chkT<=0){ z.lockHero=false; if(C.chkE) bubble(C.chkE,'Спасибо, хорошей дороги',1.2); } }
  // укрытия: «газета» — QTE не двигаться; «толстяк» — чих/поворот; «слиться» — толчок раскрывает (см. tripPress)
  const S=TR.m3hide; if(S&&C.ph==='walk'){ const near=C.es.some(e=>Math.abs(e.x-h.x)<44);
    if(S.k==='news'&&near){ const s=stickVec(); if(Math.hypot(s.x,s.y)>.3){ tev('m3_news_moved'); m3Caught('газета'); return; } }
    if(S.k==='fat'){ const f=S.f; if(S.st===undefined) S.st=TR.m3force===1?1e9:rnd(2,9); if(TR.m3force===0&&near&&!S.warn&&S.st<1e8) S.st=0; S.st-=dt; if(S.st<=0&&!S.warn){ S.warn=1; S.wt=1; bubble(f,'А-А-АПЧХИ!',1.2); f.atlSt='surprised'; tev('m3_fat_sneeze'); } if(S.warn){ S.wt-=dt; if(S.wt<=0){ S.warn=0; S.st=1e9; f.atlSt=null; if(near){ m3Caught('толстяк'); return; } } } const s=stickVec(); if(Math.hypot(s.x,s.y)>.5){ m3HideEnd(z,false); } } } }
// встреча контролёра с героем
function m3CtlMeet(z,e){ const C=z.C, h=G.hero; if(Math.abs(e.x-h.x)>10||TR.caughtNow) return; const S=TR.m3hide;
  if(!TR.hare){ if(!C.checked){ C.checked=1; C.chkT=2; C.chkE=e; tev('m3_ctl_ticket'); bubble(e,'Ваш билет?',1.2,'#ffb84a'); pop('БИЛЕТ ✓ −2 с',h.x,h.y-56,'#9cf',8); } return; }
  if(!S){ m3Caught('контролёр'); return; }
  if(!S.res) m3HideResolve(z,'meet'); }
// разрешить укрытие (когда контролёр дошёл до героя или проверка закончилась)
function m3HideResolve(z,why){ const S=TR.m3hide, C=z.C; if(!S||S.res||TR.caughtNow) return; const day=TR.day||{}, mon=day.weekday===0; let ok=true;
  if(S.k==='wc') ok=!(mon&&Math.random()<.15);
  else if(S.k==='tb') ok=Math.random()>=(C&&C.both?.7:.4);
  else if(S.k==='blend'){ const n=m3Neighbors(z); ok=Math.random()<Math.min(.9,.6+.08*Math.max(0,n-4)); }
  else if(S.k==='sleep'){ ok=Math.random()<.25; if(!ok) TR.scandal+=5; }
  else if(S.k==='news'||S.k==='fat'){ ok=true; }
  if(TR.m3force!==undefined) ok=!!TR.m3force;
  S.res=ok?'ok':'bad'; if(!ok){ m3Caught(M3HIDE[S.k].n); return; } tev('m3_hide_ok_'+S.k); if(why==='meet'&&S.k!=='wc'&&S.k!=='tb') pop('ПРОНЕСЛО!',G.hero.x,G.hero.y-58,P.neonLime,8); }
function m3Neighbors(z){ const h=G.hero; return z.npcs.filter(e=>!e.ctl&&!e.sit&&Math.abs(e.x-h.x)<30&&Math.abs(e.y-h.y)<16).length; }
function m3HideStart(z,k,extra){ const h=G.hero; TR.m3hid[k]=1; TR.m3hide=Object.assign({k,t:0},extra||{}); tev('m3_hide_'+k); if(!TR.m3rules[k]){ TR.m3rules[k]=1; } SFX.pick(); haptic('light');
  if(k==='wc'){ h.hide=true; z.lockHero=true; h.pin=true; } else if(k==='tb'){ z.lockHero=true; h.x=TR.m3hide.tb.x0+46; h.y=z.y0+8; h.face=-1; if(z.smk&&z.smk.on&&z.smk.tb===TR.m3hide.tb){ const s=penalize(2,'smoke'); pop('КХЕ-КХЕ! −'+s+' с',h.x,h.y-52,'#bbb',8); tev('m3_smoke'); } }
  else if(k==='fat'){ const f=TR.m3hide.f; h.x=f.x-2; h.y=f.y-5; h.face=f.face; } else if(k==='blend'){ h.blend=1; } else if(k==='sleep'){ h.zzz=1; } else if(k==='news'){ z.newsUsed=1; } }
function m3HideEnd(z,ok){ const h=G.hero, S=TR.m3hide; if(!S) return; TR.m3hide=null; h.hide=false; h.blend=0; h.zzz=0; if(S.k==='wc'||S.k==='tb'){ z.lockHero=false; h.pin=!!h.seat; } if(S.k==='wc'){ h.x=S.x; h.y=z.y0+12; }
  if(ok&&S.res!=='bad'&&TR.hare) tev('m3_hide_done_'+S.k); }
// «выйти на станции» (§K): двери на остановке — всегда безопасно, −25 с
function m3HideExit(z){ const h=G.hero; if(!z.C||z.C.ph==='idle'||z.C.ph==='done'){ return; } TR.m3hid.out=1; tev('m3_hide_out'); const s=penalize(25,'wait'); say('Вышел и ждёшь следующую… −'+s+' с',2.2,'#ccc'); pop('−'+s+' с',h.x,h.y-56,'#ff9a3a',9);
  for(const e of z.C.es) e.gone=true; z.C.es=[]; z.C.ph='done'; if(TR.m3hide) m3HideEnd(z,true); TR.fade=.6; z.stopT=0; tev('m3_hide_ok_out'); }
// пойман (M3-11): ШТРАФ 30 / ДОЛГ −15 с / ОБЪЯСНИТЕЛЬНАЯ −20 с; скандал +20; никогда не game over
function m3Caught(src){ if(TR.caughtNow) return; const w=wallet(), h=G.hero, z=TR.z; TR.caughtNow=1; TR.caught=(TR.caught||0)+1; TR.hare=0; TR.scandal+=20; tev('m3_caught'); tev('m3_caught_'+(src||'x').replace(/\s/g,'_'));
  if(z&&TR.m3hide) m3HideEnd(z,false); h.hide=false; if(z&&z.C&&z.C.ph==='walk'){ z.C.ph='leave'; z.C.lt=2.5; }
  const learn=TR.mode==='learn3'; let title, text;
  if(learn){ title='ПОЙМАЛИ (УЧЕБНО)'; text='В жизни был бы штраф 30 монет или долг −15 с. Попробуй другое укрытие!'; }
  else if(w.coins>=30){ w.coins-=30; title='ШТРАФ 30 МОН.'; text='«Безбилетный проезд, гражданин!» Штраф 30 монет. Скандал +20.'; tev('m3_fine30'); }
  else if(save.debtDay!==mskDay()){ const s=penalize(15,'ctl'); save.debtDay=mskDay(); title='ДОЛГ (−'+s+' с)'; text='Монет нет — оформляют долг. Пока пишут бумажку, проходит '+s+' с. Скандал +20.'; tev('m3_debt'); }
  else { const s=penalize(20,'ctl'); title='ОБЪЯСНИТЕЛЬНАЯ'; text='Пишешь объяснительную: «Я не заяц. Я просто очень быстро опаздываю». −'+s+' с.'; tev('m3_explain'); }
  st4Modal({id:'m3caught',title,text,spr:'ctrlM_angry',auto:3.2,onAuto:()=>{ TR.caughtNow=0; },opts:[['ЯСНО','#d8265e',()=>{ TR.caughtNow=0; }]]}); SFX.hurt(); shake(2); haptic('heavy'); }
// успешный «заяц» на выходе из транспорта → счётчик и косметика «уши»
function m3HareDone(){ if(!TR.hare) return; if(TR.mode!=='trip'){ TR.hare=0; tev('m3_hare_learn'); return; } TR.hare=0; tev('m3_hare_ok'); save.hareOk=(save.hareOk|0)+1; const h=G.hero; pop('ПРОСКОЧИЛ ЗАЙЦЕМ!',h.x,h.y-58,'#ff9a3a',8,1.4);
  const cs=save.cosmetics||(save.cosmetics={owned:[],on:{}}); if(save.hareOk>=5&&!cs.owned.includes('ears')){ cs.owned.push('ears'); cs.on.ears=true; tev('m3_ears'); say('Достижение «Заяц»: заячьи уши на шапку!',2.6,'#ff9a3a'); } try{ store(); }catch(e){} }
{ const _zd=zoneDone; zoneDone=function(){ const z=TR.z; if(z&&!z.done&&(z.k==='mexit'||(z.k==='exitz'&&TR.hareSeg==='metro'))) m3HareDone(); return _zd(); }; }
// толчок при «слиться» — раскрыт
{ const _tp=tripPress; tripPress=function(k){ if(k==='A'&&TR.m3hide&&TR.m3hide.k==='blend'&&!TR.smod){ tev('m3_blend_shove'); m3Caught('толпа'); return; } if(k==='A'&&TR.m3hide&&(TR.m3hide.k==='wc'||TR.m3hide.k==='tb'||TR.m3hide.k==='fat')) return; return _tp(k); }; __trip.press=k=>tripPress(k); }
// ---------- контекст укрытий (кнопка B = действие) ----------
function m3HideOpts(z){ const C=z.C, h=G.hero; if(!C||!TR.hare||TR.m3hide||TR.caughtNow||!(C.ph==='warn'||C.ph==='walk')) return []; const o=[];
  if(h.seat){ if(h.seat.news&&!z.newsUsed&&!TR.m3hid.news) o.push({k:'news',x:h.x}); if(!TR.m3hid.sleep) o.push({k:'sleep',x:h.x}); return o; }
  for(const c of z.cars) if(c.wcX!=null&&!TR.m3hid.wc&&Math.abs(h.x-c.wcX)<18&&h.y<z.y0+20) o.push({k:'wc',x:c.wcX});
  for(const f of z.fats||[]) if(!TR.m3hid.fat&&Math.abs(h.x-f.x)<16&&Math.abs(h.y-f.y)<14) o.push({k:'fat',x:f.x,f});
  const tb=z.tbs.find(t=>h.x>t.x0-10&&h.x<t.x1+10); if(tb&&!TR.m3hid.tb&&(C.ph==='warn'||!C.es.some(e=>Math.abs(e.x-h.x)<20))) o.push({k:'tb',x:tb.x0+28,tb});
  if(m3Neighbors(z)>=4) o.push({k:'blend',x:h.x});
  const pr={wc:0,fat:1,blend:2,tb:3}; o.sort((a,b)=>pr[a.k]-pr[b.k]); return o; }
function m3HideCtx(z){ const o=m3HideOpts(z)[0]; if(!o) return null; const H0=M3HIDE[o.k]; if(!TR.m3rules[o.k]){ TR.m3rules[o.k]=1; say(H0.rule,3,'#ffe14a'); tev('m3_rule_'+o.k); }
  return {b:{label:H0.b,col:'#e0a010',fn:()=>{ const h=G.hero; if(o.k==='wc'){ if(z.wcBusyRoll===undefined) z.wcBusyRoll=TR.m3force===undefined?Math.random()<.3:!TR.m3force; if(z.wcBusyRoll){ TR.m3hid.wc=1; z.wcRattle=1.2; tev('m3_wc_busy'); pop('ЗАНЯТО!',o.x,z.y0-52,P.red,9); SFX.hit&&SFX.hit(); return; } m3HideStart(z,'wc',{x:h.x}); }
    else if(o.k==='fat') m3HideStart(z,'fat',{f:o.f}); else if(o.k==='tb') m3HideStart(z,'tb',{tb:o.tb}); else m3HideStart(z,o.k); }}}; }
function m3HideBot(z){ const C=z.C, h=G.hero; if(!C||!TR.hare||!(C.ph==='warn'||C.ph==='walk')) return null; if(TR.m3hide) return {x:h.x,y:h.y,stick:{x:0,y:0}};
  const pref=TR.m3botHide; if(z.atExit&&(!pref||pref==='out')) return {x:h.x,y:h.y,b:1};
  const o=m3HideOpts(z); const want=o.find(q=>!pref||q.k===pref); if(want) return {x:h.x,y:h.y,b:1,stick:{x:0,y:0}};
  if(pref==='wc'){ const c=z.cars.find(c=>c.wcX!=null); return {x:c.wcX,y:z.y0+8}; } if(pref==='fat'&&z.fats[0]){ return {x:z.fats[0].x,y:z.fats[0].y-4}; } if(pref==='out'){ if(h.seat) return {x:h.x,y:h.y,stick:{x:0,y:1}}; const t=z.tbs.reduce((a,b)=>Math.abs(b.door-h.x)<Math.abs(a.door-h.x)?b:a); return {x:t.door,y:z.y0+6}; } if(pref==='tb'){ const t=z.tbs.reduce((a,b)=>Math.abs(b.x0+28-h.x)<Math.abs(a.x0+28-h.x)?b:a); return {x:t.x0+28,y:z.y0+10}; }
  return null; }
// ---------- рисование: контролёры, «?» у укрытий, жилеты у краёв ----------
function m3CtlActors(z,vis){ const h=G.hero; if(h.hide){ const i=vis.indexOf(h); if(i>=0) vis.splice(i,1); } }
function m3CtlDraw(z,layer){ const C=z.C, c=G.cam, h=G.hero, fk=Math.floor(G.t*4)%2;
  if(layer==='front'){
    if(h.blend){ const x=Math.round(h.x-c), y=Math.round(h.y); ctx.globalAlpha=.5; ctx.fillStyle='#8a8a96'; ctx.fillRect(x-7,y-38,14,36); ctx.globalAlpha=1; }
    if(h.zzz){ G.labels.push(['Z z z',Math.round(h.x-c)+12,Math.round(h.y)-56,8,'#9cf']); }
    if(TR.m3hide&&TR.m3hide.k==='news'){ const x=Math.round(h.x-c), y=Math.round(h.y), f=(a,b,w,hh,col)=>{ ctx.fillStyle=col; ctx.fillRect(x+a,y+b,w,hh); };
      f(-27,-50,54,38,P.ink); f(-26,-49,52,36,'#f4f0e4'); f(0,-49,1,36,'#c8c4b8'); f(-26,-49,52,9,'#e8e2d0'); f(-24,-38,48,1,'#1a1020');
      f(-23,-35,12,9,'#9aa0b0'); f(-21,-33,6,4,'#5a5a66'); f(-16,-35,3,2,'#5a5a66'); // голубь на фото
      f(-23,-24,22,1,'#5a5a66'); f(-23,-21,20,1,'#5a5a66'); f(-23,-18,22,1,'#5a5a66'); f(-9,-34,7,1,'#5a5a66'); f(-9,-31,7,1,'#5a5a66'); f(-9,-28,6,1,'#5a5a66');
      for(let k=0;k<7;k++){ f(3,-35+k*3,21,1,'#5a5a66'); } f(-28,-36,3,6,'#e8b088'); f(25,-36,3,6,'#e8b088'); // пальцы по краям
      G.labels.push(['ВЕСТИ ПРО ГОЛУБЕЙ',x,y-45,5,'#1a1020','center',null]); if(C&&C.es.some(e=>Math.abs(e.x-h.x)<44)) G.labels.push(['…не двигайся…',x,y-50,7,'#ffe14a']); }
    if(TR.m3hide&&TR.m3hide.k==='fat'&&TR.m3hide.warn){ const f=TR.m3hide.f; G.labels.push(['!',Math.round(f.x-c),Math.round(f.y)-60,12,P.red]); }
    if(TR.m3hide&&TR.m3hide.k==='tb'){ const t=TR.m3hide.tb, a=Math.round(t.x0-c); ctx.globalAlpha=.35; ctx.fillStyle='#8fd8ff'; ctx.fillRect(a+38,FY0-56,14,58); ctx.globalAlpha=1; }
    // жёлтые «?» у доступных укрытий
    if(C&&TR.hare&&(C.ph==='warn'||C.ph==='walk')&&!TR.m3hide){ const marks=[];
      for(const cr of z.cars) if(cr.wcX!=null&&!TR.m3hid.wc) marks.push([cr.wcX,FY0-74,'wc']);
      for(const f of z.fats||[]) if(!TR.m3hid.fat) marks.push([f.x,f.y-58,'fat']);
      if(!TR.m3hid.tb) for(const t of z.tbs) marks.push([t.x0+28,FY0-74,'tb']);
      if(z.newsSlot&&!z.newsUsed&&!TR.m3hid.news) marks.push([z.newsSlot.x,FY0-46,'news']);
      if(z.stopT>0&&!TR.m3hid.out) for(const t of z.tbs) marks.push([t.door,FY0-66,'out']);
      for(const m of marks){ const sx=Math.round(m[0]-c); if(sx<SA.l+8||sx>W-SA.r-8) continue; const near=Math.abs(m[0]-h.x)<40, y=Math.round(m[1])+(fk&&near?-1:0); const tx={wc:'ТУАЛЕТ',fat:'ЗА НИМ',tb:'ТАМБУР',news:'ГАЗЕТА',out:'ВЫХОД'}[m[2]]||'?', tw=Math.ceil(txtW(tx,6))+8; if(sx-tw/2<SA.l+4||sx+tw/2>W-SA.r-4) continue; const bx=Math.round(sx-tw/2); ctx.fillStyle=P.ink; ctx.fillRect(bx-1,y-6,tw+2,12); ctx.fillRect(sx-3,y+6,7,2); ctx.fillRect(sx-1,y+8,3,2); ctx.fillStyle=near?'#ffe14a':'#e0b83a'; ctx.fillRect(bx,y-5,tw,10); ctx.fillRect(sx-2,y+5,5,2); G.labels.push([tx,sx,y,6,P.ink,'center',null]); }
      if(m3Neighbors(z)>=3){ const n=z.npcs.filter(e=>!e.ctl&&!e.sit&&Math.abs(e.x-h.x)<30&&Math.abs(e.y-h.y)<16); if(n.length){ const xs=n.map(e=>e.x).concat([h.x]), x0=Math.round(Math.min(...xs)-c)-10, x1=Math.round(Math.max(...xs)-c)+10, y=Math.round(h.y)+3; ctx.fillStyle=n.length>=4?'#ffe14a':'#8a8a96'; for(let x=x0;x<x1;x+=4) ctx.fillRect(x,y,2,1); } } } }
  if(layer==='front'&&C&&C.ph==='warn'){ // жилеты у краёв экрана со стороны прихода
    for(const sd of C.sides){ const L=sd==='L', bw=64, x=L?SA.l+10:W-SA.r-10-bw, y=SA.t+58; ctx.fillStyle=P.ink; ctx.fillRect(x,y,bw,20); ctx.fillStyle=fk?'#3a2a50':'#2a1e3c'; ctx.fillRect(x+1,y+1,bw-2,18); m3CtlFace(L?x+4:x+bw-18,y+3); G.labels.push([(L?'← ':'')+Math.ceil(C.wt)+' с'+(L?'':' →'),L?x+40:x+24,y+10,7,'#ffb84a','center',null]); }
    G.labels.push(['ПРОВЕРКА БИЛЕТОВ'+(C.both?' · С ДВУХ КОНЦОВ':''),W/2,Math.max(SA.t+60,FY0-110),8,'#ffb84a','center',P.ink]); } }
function m3CtlFace(x,y){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(0,0,14,14,P.ink); f(1,1,12,4,'#2a3a7a'); f(1,4,12,1,'#ffd23f'); f(2,5,10,8,'#f0c090'); f(4,7,2,2,P.ink); f(8,7,2,2,P.ink); f(5,11,4,1,'#a04030'); f(-1,4,16,1,P.ink); }
function m3Vest(x,y,fk){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); }; f(-1,-1,16,20,P.ink); f(0,0,14,18,fk?'#ff8a1f':'#ffa23f'); f(5,0,4,6,P.ink); f(0,8,14,2,'#fff6c0'); f(0,13,14,2,'#fff6c0'); f(6,6,2,12,'#c85a10'); }
// ---------- зайцы в метро: створка «ПРОХОДИТЕ!» у турникетов; контролёр на выходе (15%) ----------
{ const Gz=ZONES.gate, u0=Gz.update, c0=Gz.ctx, d0=Gz.draw;
  Gz.update=function(z,dt){ u0.call(this,z,dt); if(z.passed||m3NoHare()||TR.mode!=='trip') return; const H0=z.m3h||(z.m3h={t:rnd(3,6),on:0}); H0.t-=dt;
    if(!H0.on&&H0.t<=0){ H0.on=1; H0.t=3.6; tev('m3_metro_hold'); } else if(H0.on&&H0.t<=0){ H0.on=0; H0.t=rnd(6,9); } };
  Gz.ctx=function(z){ const h=G.hero, H0=z.m3h; if(H0&&H0.on&&!z.passed&&!z.inQ&&z.inK<0&&!h.passing&&Math.abs(h.x-(z.TX-12))<16&&Math.abs(h.y-(z.y1-4))<12) return {b:{label:'ЗАЙЦЕМ',col:'#ff8a1f',fn:()=>{ TR.hare=1; TR.hareSeg='metro'; tev('m3_hare_metro'); h.passing=.6; h.pass=.6; h.noSolid=true; h.y=z.y1-4; pop('ЗАЙЦЕМ!',h.x,h.y-50,'#ff9a3a',9); SFX.whiff(); }}}; return c0.call(this,z); };
  Gz.draw=function(z){ d0.call(this,z); const H0=z.m3h; if(H0&&H0.on&&!z.passed){ const tx=Math.round(z.TX-G.cam), y=Math.round(z.y1-2); ctx.fillStyle=P.ink; ctx.fillRect(tx-1,y-22,14,3); ctx.fillStyle='#bfe0ff'; ctx.fillRect(tx,y-21,12,1); G.labels.push(['ПРОХОДИТЕ!',tx+8,y-34,7,'#ffe14a']); if(Math.abs(G.hero.x-z.TX)<120) goalArrow(z.TX-12,y-44,'#ff9a3a'); } }; }
{ const X=ZONES.exitz, i0=X.init, u0=X.update, d0=X.draw;
  X.init=function(z){ i0.apply(this,arguments); z.m3c=null; if(TR.hare&&TR.hareSeg==='metro'){ const p=m3CtlP('metro',TR.day?TR.day.weekday:-1); if((TR.m3force!==undefined?!TR.m3force:Math.random()<p)){ const e=mkNpc('polite',z.len-80,(z.y0+z.y1)/2); e.atl='ctrlM'; e.ctl=1; e.pin=true; e.m=6; e.face=-1; e.dir=0; e.spd2=0; z.npcs.push(e); z.m3c=e; tev('m3_metro_ctl'); } } };
  X.update=function(z,dt){ u0.call(this,z,dt); const e=z.m3c, h=G.hero; if(e&&TR.hare&&!TR.caughtNow){ if(Math.abs(h.x-e.x)<150&&!z.m3w){ z.m3w=1; bubble(e,'Проверка на выходе!',1.6,'#ffb84a'); } if(Math.abs(h.x-e.x)<16) m3Caught('выход метро'); } }; }
// ---------- уши «заяц» на шапке героя ----------
{ const _da=drawActor; drawActor=function(a,ex){ _da(a,ex); if(a===G.hero&&G.scene==='trip'&&save.cosmetics&&save.cosmetics.on&&save.cosmetics.on.ears&&!a.hide){ const x=Math.round(a.x-G.cam), y=Math.round(a.y-(a.z||0))-44; for(const dx of [-5,2]){ ctx.fillStyle=P.ink; ctx.fillRect(x+dx-1,y-9,5,11); ctx.fillStyle='#f4f0ea'; ctx.fillRect(x+dx,y-8,3,9); ctx.fillStyle='#ffb0c0'; ctx.fillRect(x+dx+1,y-6,1,6); } } }; }
// ---------- M3-12: обучение — карточки при первой встрече + глава «МЦД» ----------
const M3TUT={ board:['ТАБЛО ВРЁТ','Табло пишет «ВАГОН 3», но поезд встаёт как хочет. За 1.5 с до остановки у настоящих дверей загораются жёлтые полосы — беги туда и будешь первым.','Встань у жёлтой полосы',z=>z.boarded||(z.lit&&Math.abs(G.hero.x-ZONES.mplat.nearDoor(z).x)<14)],
  ctl:['КОНТРОЛЁРЫ','Есть билет — проверка 2 с. Едешь зайцем — прячься: у укрытий жёлтый «?», кнопка покажет действие. Каждое укрытие — 1 раз за поездку (кроме «слиться»).','Спрячься или жди',z=>!z.C||z.C.ph==='leave'||z.C.ph==='done'||!!TR.m3hide],
  sleep:['НЕ СПИ','Длинный перегон убаюкивает. Жми «ПРОСНУТЬСЯ» в такт жёлтому кружку (в спокойном режиме — просто держи). Проспишь — −20 с.','Не усни',z=>z.sleep<.15] };
function m3TutCheck(z,k){ if(TR.smod||TR.m3tut) return; const L3=TR.mode==='learn3'; if(!L3&&(window.__noTut||TR.mode!=='trip')) return; save.tut=save.tut||{}; const key='m3_'+k; if(!L3&&save.tut[key]) return; if((z.tutK||{})[k]) return; (z.tutK=z.tutK||{})[k]=1; save.tut[key]=1; try{ store(); }catch(e){}
  const d=M3TUT[k]; st4Modal({id:'tut',title:'НОВОЕ · '+d[0],text:d[1],auto:9,onAuto:()=>{ TR.m3tut={k,z}; },opts:[['ПОНЯЛ','#2aa860',()=>{ TR.m3tut={k,z}; tev('m3tut_ok'); }],['ПРОПУСТИТЬ','#5a4a7a',()=>{ tev('m3tut_skip'); }]]}); }
{ const P0=ZONES.mplat, u0=P0.update; P0.update=function(z,dt){ if(z.t>.6) m3TutCheck(z,'board'); if(TR.smod) return; if(TR.m3tut&&TR.m3tut.z===z&&M3TUT[TR.m3tut.k][3](z)){ TR.m3tut=null; pop('ГОТОВО ✓',G.hero.x,G.hero.y-56,P.neonLime,9); } return u0.call(this,z,dt); };
  const T0=ZONES.mtrain, t0=T0.update; T0.update=function(z,dt){ if(z.sleep>.3) m3TutCheck(z,'sleep'); if(TR.smod) return; const s=TR.m3tut; if(s&&s.z===z&&M3TUT[s.k][3](z)){ TR.m3tut=null; } if(s&&s.z!==z) TR.m3tut=null; return t0.call(this,z,dt); }; }
function startLearnMcd(){ startTrip(0,{mode:'learn3',budget:999,zones:[{k:'mgate',kind:'mcd',seg:'mcd',d:0,seed:21},{k:'mplat',kind:'mcd',seg:'mcd',d:0,seed:21,board:3,shift:1},{k:'mtrain',kind:'mcd',seg:'mcd',d:0,seed:22,ride:44,stops:1,crowd:10,ctl:{both:true,at:9},smoker:true,wcEnd:9,news:true,fat:2},{k:'mexit',kind:'mcd',seg:'mcd',d:0,seed:23,exit:1,last:true}]}); TR.name='Учебная электричка'; TR.lw3={coins:99,tokens:9,rides:0,unlim:false}; TR.hare=1; TR.hareSeg='mcd'; tev('learn3_start'); }
{ const _wl=wallet; wallet=function(){ return TR.mode==='learn3'&&TR.lw3&&!TR.done?TR.lw3:_wl(); };
  const _tu=tripUpdate; tripUpdate=function(dt){ if(TR.mode==='learn3'&&!TR.done) TR.tLeft=TR.tTotal; return _tu(dt); };
  const _tf=tripFinish; tripFinish=function(win,reason){ if(TR.mode!=='learn3') return _tf(win,reason); if(TR.done) return; TR.done=true; TR.win=true; G.done=true; G.win=true; G.doneT=0; musOn=false; save.learned3=1; try{ store(); }catch(e){} SFX.win(); };
  const _sr=showResult; showResult=function(){ if(TR.mode==='learn3'){ TR.mode='learned'; toTitle(); say('Электричка пройдена! Табло врёт, контролёры не дремлют',3,P.neonLime); return; } return _sr(); }; }
{ const _st=startTrip; startTrip=function(...a){ TR.m3tut=null; TR.m3hide=null; TR.caughtNow=0; TR.m3force=undefined; TR.m3botHide=null; return _st(...a); }; __trip.startTrip=startTrip; }
// ---------- M3-13: тема МЦД — банджо (square, быстрый спад, роллы) 100 BPM + «бум-чик» бас ----------
const M3_THEME={bpm:100, bass:[43,0,0,0,50,0,0,0,43,0,0,0,50,0,47,0, 48,0,0,0,55,0,0,0,50,0,0,0,57,0,55,0],
  roll:[67,71,74,79,74,71,67,71, 67,71,74,79,76,74,71,67, 72,76,79,84,79,76,72,76, 74,78,81,86,81,78,74,71]};
{ const _mt=musicTick; musicTick=function(){ const z=TR&&TR.z; if(!(G.scene==='trip'&&z&&(z.k==='mgate'||z.k==='mexit'||z.k==='mplat'||z.k==='mtrain'))) return _mt(); if(typeof AC==='undefined'||!AC||!musOn||save.mute) return; const sp=60/M3_THEME.bpm/4; AUD.m3=1;
  while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02; const i=musStep%32, b=M3_THEME.bass[i], m=M3_THEME.roll[i], d=musNext-AC.currentTime;
    if(b) tone(mtof(b),sp*1.6,'triangle',.45,0,d,mus); if(i%4===2) tone(mtof(b||M3_THEME.bass[i-2]||43)*2,sp*.5,'square',.08,0,d,mus); if(m&&!(z.sleep>.5&&i%2)) { tone(mtof(m),sp*.55,'square',.13,-m*.6,d,mus); tone(mtof(m)*2,sp*.25,'square',.03,0,d,mus); } if(i%8===4) noise(.02,.05,5000,d);
    musStep++; musNext+=sp; } }; }
window.__m3={m3Fare,m3CtlP,m3Caught,m3HideStart,m3HideResolve,m3HideOpts,M3HIDE,startLearnMcd,THEME:M3_THEME};
// M3-5: телефон 100% (розетка в электричке) → подсказки навигатора на улице-2
{ const S=ZONES.street; if(S){ const i0=S.init; S.init=function(z){ i0.apply(this,arguments); if(z.seg==='street2'&&TR.phone100&&TR.mode==='trip'){ z.nav=1; tev('m3_phone_nav'); const k=String(z.ev||'').replace(/s$/,''); const t=(typeof STUT!=='undefined'&&(STUT[z.ev]||STUT[k]))?STUT[z.ev]||STUT[k]:null; say('Телефон 100%: навигатор — '+(t?t[2].toLowerCase():'держись правее, там свободнее'),2.6,'#9cf'); } }; } }
{ const _gt=goalText; goalText=function(z){ const g=_gt(z); return z&&z.nav&&g?'НАВИГАТОР: '+g:g; }; }
