const SOCK_Y=45;
'use strict';
// ================= КАТСЦЕНЫ: движковые (спрайты + таймлайн), 5–15 с, «Пропустить», тап = ×2 =================
let CUT=null;
function startCut(id,done,arg){ CUT={id,t:0,done,arg,len:(CUTS[id]||{}).len||5,prev:G.scene}; if(id.startsWith('boss_')) CUT.len=CUTS.boss.len; G.scene='cut'; tgBack(false); if(CUTS[id]&&CUTS[id].start) CUTS[id].start(CUT); else if(id.startsWith('boss_')) CUTS.boss.start(CUT); }
function endCut(){ const c=CUT; CUT=null; if(c.id.startsWith('boss_')){ G.scene='play'; SFX.boss(); return; }
  if(c.id==='win'){ if(G.unlockBaba){ G.unlockBaba=false; startCut('unlock',()=>showResult()); return; } return showResult(); }
  if(c.id==='lose') return showResult();
  if(c.done) c.done(); else toMap(); }
function cutUpdate(dt){ let sp=1; for(const ev of input.events){ if(ev.t==='tap'||ev.t==='key') sp=2; } input.events.length=0; if(input.stick||Object.keys(gest).length) sp=2;
  CUT.t+=dt*sp; if(CUT.t>=CUT.len) endCut(); }
function drawCut(){ G.labels=[]; buttons=[]; const c=CUT; const id=c.id.startsWith('boss_')?'boss':c.id; CUTS[id].draw(c.t,c);
  // кнопка «Пропустить»
  if(c.t>.5){ const b=Math.max(26,44*DPR/SC); const x=W-SA.r-b*2.6-4, y=SA.t+4; ctx.fillStyle='#000a'; ctx.fillRect(x,y,b*2.6,b); G.labels.push(['Пропустить ⏭',x+b*1.3,y+b/2,8,'#fff']); buttons.push({x,y,w:b*2.6,h:b,id:'skip',cb:()=>{ SFX.ui(); endCut(); }}); }
  // киношные полосы
  ctx.fillStyle='#000'; ctx.fillRect(0,0,W,Math.max(4,SA.t)); ctx.fillRect(0,H-6,W,6); }
const spr=(spec,pose,fr,mood,x,y,flip,sc=1,rot=0)=>{ const img=personSprite(spec,pose,fr,mood,Math.floor(G.t*10)); ctx.save(); ctx.translate(Math.round(x),Math.round(y)); if(flip) ctx.scale(-1,1); if(rot) ctx.rotate(rot); ctx.drawImage(img,Math.round(-32*sc),Math.round(-60*sc),Math.round(64*sc),Math.round(64*sc)); ctx.restore(); };
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t);
function sub(s,col='#fff'){ G.labels.push([s,W/2,H-SA.b-22,10,col]); }
function room(dark){ ctx.fillStyle=dark?'#1a1530':'#3a3058'; ctx.fillRect(0,0,W,H); ctx.fillStyle=dark?'#241d40':'#4a3d70'; for(let x=0;x<W;x+=24) ctx.fillRect(x,0,12,H*.7); ctx.fillStyle='#2a2238'; ctx.fillRect(0,H*.7,W,H*.3); ctx.fillStyle='#1a1424'; for(let x=0;x<W;x+=20) ctx.fillRect(x,H*.7,1,H*.3); }
const CUTS={
  intro:{len:13,draw:(t)=>{ const S=HERO_SPECS.serega; room(t<4); const bx=W*.62, by=H*.7;
    // кровать
    ctx.fillStyle=P.ink; ctx.fillRect(W*.2-2,by-22,W*.36+4,26); ctx.fillStyle='#e8e0f0'; ctx.fillRect(W*.2,by-20,W*.36,20); ctx.fillStyle='#7a5ad8'; ctx.fillRect(W*.28,by-20,W*.28,14);
    // тумбочка + будильник
    ctx.fillStyle=P.ink; ctx.fillRect(bx-2,by-26,30,28); ctx.fillStyle='#a06a3a'; ctx.fillRect(bx,by-24,26,26);
    const ring=t>1&&t<6, fall=t>2.6&&t<6; const ax=bx+13+(ring?rnd(-2,2):0)+(fall?(t-2.6)*12:0), ay=by-34+(fall?Math.min(26,(t-2.6)*40):0)+(ring&&!fall?rnd(-1,1):0);
    disc(ctx,ax,ay,8,8,P.ink); disc(ctx,ax,ay,7,7,P.red); disc(ctx,ax,ay,5,5,'#fff'); ctx.fillStyle=P.ink; ctx.fillRect(ax,ay-4,1,4); ctx.fillRect(ax,ay,3,1);
    G.labels.push([t<4.6?'08:47':'08:52',ax,ay-16,8,t<4.6?P.red:'#ff3a3a']); if(ring&&Math.floor(t*8)%2) G.labels.push(['ДЗЫНЬ!',ax+20,ay-24,10,P.edge]);
    if(t>1&&t<1.05) SFX.alarm();
    if(t<4.5){ spr(S,'down',0,t>3.2&&t<4.5?'hurt':'ko',W*.36,by-14,false); if(t>3.3&&t<3.9) G.labels.push(['*шлёп*',W*.42,by-40,8,'#fff']); if(t<3) G.labels.push(['z z z',W*.3,by-40-Math.sin(t*3)*3,9,'#aaf']); sub(t<3?'Понедельник. Будильник 08:47…':'…бьёт будильник. Будильник бьёт сильнее.'); }
    else if(t<6.5){ const k=ease((t-4.5)/.4); ctx.fillStyle='#0008'; ctx.fillRect(0,0,W,H); disc(ctx,W/2,H/2,40*k,30*k,P.white); disc(ctx,W/2+6,H/2+3,10*k,10*k,P.ink); sub('08:52?!','#ff4a4a'); if(t<4.6) SFX.hurt(); }
    else if(t<10){ const k=(t-6.5)/3.5; const poses=['hurt','jump','p3','dash','super','jump']; const p=poses[Math.floor(k*12)%poses.length]; spr(S,p,Math.floor(t*8)%2,'angry',W*.5+Math.sin(t*20)*14,by-2,Math.floor(t*6)%2===0,1.2);
      if(k>.3){ const hx2=W*.5+Math.sin(t*20)*14; const sy=by-SOCK_Y; ctx.fillStyle=P.ink; ctx.fillRect(hx2-7,sy-1,14,7); ctx.fillRect(hx2+5,sy-5,6,8); ctx.fillStyle='#fff'; ctx.fillRect(hx2-6,sy,12,5); ctx.fillRect(hx2+6,sy-4,4,7); ctx.fillStyle=P.red; ctx.fillRect(hx2-6,sy+3,12,1); ctx.fillRect(hx2+6,sy-4,4,1); G.labels.push(['носок на голове',W*.5,sy-12,7,'#fff']); }
      sub('Одеться за 3 секунды. Почти.'); for(let i=0;i<2;i++) parts(W*.5+G.cam,by-2,20,1,['#fff','#ff7ab8','#3ff0ff'],120,100,.6,2); }
    else { const k=(t-10)/3; const x=W*.5+k*W*.8; spr(S,'walk',Math.floor(t*14)%8,'angry',x,by-2,false,1.2); ctx.fillStyle=P.ink; ctx.fillRect(W*.86,by-80,26,82); ctx.fillStyle='#8a5a3a'; ctx.fillRect(W*.86+2,by-78,22,78);
      drawProp({kind:'cat',x:W*.2+G.cam,y:by,z:0,face:1,col:'#4a4a4a'}); G.labels.push(['мяу (удачи)',W*.2,by-24,7,'#fff']); 
      G.labels.push(['ДАВКА',W/2-50,H*.3,24*ease(k*2),P.edge]); G.labels.push(['ДО РАБОТЫ',W/2+52,H*.3+4,18*ease(k*2-.2),P.neonPink]); }
    drawParts(); G.parts.forEach(p=>{}); updFX(1/60);
  }},
  metro:{len:8,draw:(t)=>{ const S=HERO_SPECS.serega; ctx.fillStyle='#efe2c8'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#c9b48e'; for(let y=6;y<H*.72;y+=8) ctx.fillRect(0,y,W,1); ctx.fillStyle='#6c6274'; ctx.fillRect(0,H*.72,W,H*.28);
    const tx=W*.55, ty=H*.86; ctx.fillStyle=P.ink; ctx.fillRect(tx-10,ty-40,20,40); ctx.fillStyle='#9aa0b0'; ctx.fillRect(tx-9,ty-39,18,38); ctx.fillStyle=P.ink; ctx.fillRect(tx-6,ty-34,12,6);
    const ok=t>4.2; ctx.fillStyle=ok?P.neonLime:P.red; ctx.fillRect(tx-5,ty-33,10,4); const arm=ok?-1:0; ctx.fillStyle='#c0c6d0'; ctx.fillRect(tx+9,ty-26+arm*10,26,4);
    const hx=t<2.2?W*.1+t*W*.17:t<4.8?tx-24:tx-24+(t-4.8)*70; spr(S,t<2.2||t>4.8?'walk':t<3.6?'grab':'idle',Math.floor(t*10)%8,t>3.6&&t<4.2?'o':'norm',hx,ty,false,1.1);
    if(t>2.2&&t<4.2){ ctx.fillStyle=P.ink; ctx.fillRect(hx+8,ty-38,12,6); ctx.fillStyle='#e0b060'; ctx.fillRect(hx+9,ty-37,10,4); sub('Карта? Где карта?! …бутерброд сойдёт.'); }
    if(t>3.6&&t<4.4) G.labels.push(['НЯМ',tx,ty-50,12,P.edge]); if(t>4.2) sub('Турникет взял бутерброд. Добро пожаловать в метро.');
    // толпа стеной сзади
    for(let i=0;i<8;i++){ const sp=[EN.polite,EN.aunt,EN.bag,EN.kid,EN.tourist,EN.seeds,EN.courier,EN.musician][i]; if(!sp._s) sp._s=sp.spec(); spr(sp._s,'walk',Math.floor(t*10+i)%8,'angry',-60+i*16+t*30,ty+(i%2)*4,false); }
  }},
  boss:{len:7,start:c=>{ c.k=c.id.slice(5); SFX.boss(); },draw:(t,c)=>{ const B=BOSSES[c.k]; G.noHud=true; drawPlay(); G.noHud=false; G.labels.length=0; buttons=[];
    const fl=t<1.2&&Math.floor(t*10)%2; ctx.fillStyle=fl?'#000c':'#0006'; ctx.fillRect(0,0,W,H);
    if(t<2) { G.labels.push(['ПОЕЗД ДАЛЬШЕ НЕ ИДЁТ',W/2,H*.3,12,'#ff6a3a']); }
    const k=ease((t-1.8)/.6); if(t>1.8){ ctx.fillStyle=P.ink; ctx.fillRect(0,H*.3,W*k,52); ctx.fillStyle=P.red; ctx.fillRect(0,H*.3+3,W*k,46); G.labels.push([B.n,W/2,H*.3+20,18*k,'#fff']); G.labels.push([B.sub,W/2,H*.3+40,9,P.edge]); }
    const b=G.ens.find(e=>e.boss); if(b&&t>1.2){ b.sq=1+Math.sin(t*12)*.12; } }},
  line:{len:7,draw:(t,c)=>{ const w=c.arg, lc=LINE_COL[w]; ctx.fillStyle='#d9d2c0'; ctx.fillRect(0,0,W,H); const k=(t/7);
    // коридор-переход, цвет меняется
    ctx.fillStyle=shade(LINE_COL[w-1],.5); ctx.fillRect(0,0,W*(1-k),H*.7); ctx.fillStyle=shade(lc,.5); ctx.fillRect(W*(1-k),0,W*k,H*.7); ctx.fillStyle='#6c6274'; ctx.fillRect(0,H*.7,W,H*.3);
    ctx.fillStyle=P.ink; ctx.fillRect(W*.25,H*.12,W*.5,22); ctx.fillStyle=lc; ctx.fillRect(W*.25+2,H*.12+2,W*.5-4,18); G.labels.push(['Переход на '+LINE_NAMES[w]+' ветку →',W/2,H*.12+11,9,'#fff']);
    const gag=[null,'мозаика-торт подмигивает','за окном метель… в метро?'][w]; if(gag&&t>2) sub(gag);
    spr(HERO_SPECS[heroId],'walk',Math.floor(t*12)%8,'norm',W*.1+k*W*.9,H*.88,false,1.1);
    if(t>3&&t<3.1) say('Следующая ветка — '+LINE_NAMES[w],2,'#fff'); }},
  win:{len:4,start:c=>{ c.g=Math.floor(Math.random()*4); },draw:(t,c)=>{ drawPlay(); G.labels.length=0; buttons=[]; ctx.fillStyle='#0004'; ctx.fillRect(0,0,W,H); const h=G.hero, sx=h.x-G.cam, sy=h.y;
    const gags=['Место освободилось. Сел. Счастье.','Двери хлопнули ровно за спиной.','Голубь принёс жетон. Уважение.','Диктор: «Выход на правую сторону». ТЫ — правая сторона.'];
    if(c.g===2){ drawProp({kind:'cat',x:h.x+30-t*8,y:h.y,z:0,face:-1,col:'#8a8aa8'}); }
    G.labels.push(['СТАНЦИЯ ПРОЙДЕНА!',W/2,H*.25,16*ease(t*2),P.edge]); sub(gags[c.g]); }},
  lose:{len:4,start:c=>{ c.g=Math.floor(Math.random()*3); SFX.ko(); },draw:(t,c)=>{ drawPlay(); G.labels.length=0; buttons=[]; ctx.fillStyle='#000a'; ctx.fillRect(0,0,W,H);
    const gags=['Тебя увезли в депо. Там тепло, но далеко от офиса.','Толпа вынесла тебя на поверхность. Не той станции.','Ты уснул и уехал по кольцу. Дважды.'];
    G.labels.push(['ОПОЗДАЛ…',W/2,H*.3,18,'#ff6a6a']); sub(gags[c.g]); spr(HERO_SPECS[heroId],'down',0,'ko',W/2,H*.62,false,1.3); G.labels.push(['ну и ладно',W/2,H*.62-30,9,'#fff']); }},
  unlock:{len:6,draw:t=>{ ctx.fillStyle='#2a1d33'; ctx.fillRect(0,0,W,H); const k=ease(t/1.2); ctx.fillStyle='#d9d2c0'; ctx.fillRect(W/2-60,H*.2,120*k,H*.55);
    spr(HERO_SPECS.baba,t<2?'walk':'cheer',Math.floor(t*8)%8,'norm',W/2-40+Math.min(40,t*30),H*.78,false,1.5);
    if(t>2){ G.labels.push(['НОВЫЙ ГЕРОЙ!',W/2,H*.15,14,P.edge]); G.labels.push(['БАБКА ЗИНАИДА',W/2,H*.86,12,P.neonPink]); sub('«Сынок, я сама пройду. Через тебя.»'); } }},
};
// ---------- результат ----------
function showResult(){ G.scene='result'; tgBack(true); musOn=true; musTheme=3; }
drawResult=function(){ G.labels=[]; buttons=[]; ctx.fillStyle='#2a1d33'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#3a2a48'; for(let x=0;x<W;x+=24) ctx.fillRect(x,0,12,H);
  const lv=G.lv, w=G.win; G.labels.push([w?'«'+lv.name+'» — пройдено!':'Опоздал на «'+lv.name+'»',W/2,SA.t+20,12,w?P.edge:'#ff8a8a']);
  if(w){ for(let i=0;i<3;i++){ const on=i<G.stars, x=W/2+(i-1)*34, y=SA.t+52, sc=on?1+Math.max(0,.4-Math.abs((G.t*2%3)-i)*.2):1; G.labels.push(['★',x,y,22*sc,on?P.edge:'#5a4a6a']); }
    G.labels.push(['★ пройти · ★ потерял < половины здоровья · ★ быстрее '+lv.par+' с',W/2,SA.t+76,7,'#bbb']); }
  const rows=[['Очки',G.score],['Жетоны',G.coins],['Лучшее комбо',G.bestCombo],['Время',Math.round(G.time)+' с']]; rows.forEach((r,i)=>{ G.labels.push([r[0],W/2-10,SA.t+96+i*14,9,'#ddd','right']); G.labels.push([String(r[1]),W/2+10,SA.t+96+i*14,9,'#fff','left']); });
  const bh=Math.max(28,48*DPR/SC), y=H-SA.b-bh-8, bw=Math.min(130,(W-SA.l-SA.r-40)/3);
  bigBtn('КАРТА',W/2-bw*1.5-10,y,bw,bh,'#8a3ad8',()=>{ mapLine=lv.w; toMap(); },'rmap');
  bigBtn('ЕЩЁ РАЗ',W/2-bw/2,y,bw,bh,'#3a6ad8',()=>startLevel(curIdx),'retry');
  const nx=curIdx+1; if(w&&nx<LEVELS.length) bigBtn('ДАЛЬШЕ ▶',W/2+bw/2+10,y,bw,bh,'#2aa860',()=>{ const L=LEVELS[nx]; if(L.i===0&&!save.cut['line'+L.w]){ save.cut['line'+L.w]=1; store(); startCut('line',()=>startLevel(nx),L.w); } else startLevel(nx); },'next');
};
