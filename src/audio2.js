// M1-15/16/21: аудио-шины МУЗЫКА / ГОЛОСА / ЭФФЕКТЫ+ЭМБИЕНТ, лимитер на master, ≤12 одновременных нод; iOS/TG: suspend при сворачивании, resume по тапу;
// голоса-бормотание героев (§Q3) с ducking −6 dB. Без AudioContext всё молча и без ошибок.
const AUD={bus:{},active:[],max:12,voiceUntil:0,duckUntil:0,waves:{},nodes:0};
function volOf(k){ const v=(save.vol&&save.vol[k]); return Number.isFinite(v)?v:VOL_DEF[k]; }
function audApply(){ if(!AC||!AUD.bus.sfx) return; const t=AC.currentTime, duck=AC.currentTime<AUD.duckUntil?.5:1; // −6 dB
  mus.gain.setTargetAtTime(.09*volOf('music')/60*duck,t,.03); AUD.bus.sfx.gain.setTargetAtTime(volOf('sfx')/80,t,.02); AUD.bus.voice.gain.setTargetAtTime(volOf('voice')/80*(save.calm?.5:1),t,.02);
  master.gain.setTargetAtTime(save.mute?0:.45,t,.02); }
function audBuild(){ if(!AC||AUD.bus.sfx) return; try{
  const lim=AC.createDynamicsCompressor(); lim.threshold.value=-6; lim.knee.value=0; lim.ratio.value=20; lim.attack.value=.003; lim.release.value=.12;
  master.disconnect(); master.connect(lim); lim.connect(AC.destination); AUD.lim=lim;
  AUD.bus.sfx=AC.createGain(); AUD.bus.sfx.connect(master); AUD.bus.voice=AC.createGain(); AUD.bus.voice.connect(master); AUD.bus.music=mus; audApply(); }catch(e){} }
// учёт одновременных источников (≤12): лишние запросы отбрасываются
function audSlot(dur){ const n=AC.currentTime; AUD.active=AUD.active.filter(t=>t>n); if(AUD.active.length>=AUD.max) return false; AUD.active.push(n+dur); AUD.nodes=Math.max(AUD.nodes,AUD.active.length); return true; }
{ const _ai=audioInit; audioInit=function(){ _ai(); if(AC){ audBuild(); if(AC.state==='suspended'&&!document.hidden){ try{ AC.resume(); }catch(e){} } } }; }
{ const _tone=tone; tone=function(f,d,type,v,slide,delay,dst){ if(!AC) return; if(!AUD.bus.sfx) audBuild(); if(!audSlot((delay||0)+d+.02)) return; return _tone(f,d,type,v,slide,delay,dst||AUD.bus.sfx||master); }; }
noise=function(d,v=.3,hp=800,delay=0){ if(!AC) return; if(!AUD.bus.sfx) audBuild(); if(!audSlot(delay+d)) return; const t=AC.currentTime+delay; const n=AC.sampleRate*d|0, b=AC.createBuffer(1,Math.max(1,n),AC.sampleRate), a=b.getChannelData(0);
  for(let i=0;i<n;i++) a[i]=(Math.random()*2-1)*(1-i/n); const s=AC.createBufferSource(); s.buffer=b; const f=AC.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp;
  const g=AC.createGain(); g.gain.value=v; s.connect(f); f.connect(g); g.connect(AUD.bus.sfx||master); s.start(t); };
// iOS/TG: свернули — suspend, вернулись — resume только по тапу (audioInit)
document.addEventListener('visibilitychange',()=>{ try{ if(document.hidden&&AC&&AC.state==='running') AC.suspend(); }catch(e){} });
// ---------- голоса (§Q3) ----------
const VOICE4={ serega:{w:'p25',f:180,s:.15,r:11}, baba:{w:'triangle',f:300,s:.25,r:8,vib:6}, varya:{w:'sine',f:340,s:.2,r:13,lp:2000}, rustam:{w:'sawtooth',f:150,s:.1,r:14,lp:1500},
  lena:{w:'p12',f:280,s:.12,r:12}, gena:{w:'sawtooth',f:95,s:.08,r:8,sub:1}, kostya:{w:'square',f:200,s:.1,r:10,crush:1}, tima:{w:'triangle',f:420,s:.3,r:15} };
function pulseWave(duty){ const k='p'+duty; if(AUD.waves[k]) return AUD.waves[k]; const N=32, re=new Float32Array(N), im=new Float32Array(N); for(let n=1;n<N;n++){ re[n]=0; im[n]=2/(n*Math.PI)*Math.sin(n*Math.PI*duty); } return AUD.waves[k]=AC.createPeriodicWave(re,im); }
function syllables(text){ const m=String(text||'').match(/[аеёиоуыэюяaeiouАЕЁИОУЫЭЮЯ]/g); return Math.max(1,Math.min(8,m?m.length:1)); }
function heroVoice(id,text){ if(!AC||!AUD.bus.voice||save.mute||volOf('voice')<=0) return false; const V=VOICE4[id]||VOICE4.serega, now=AC.currentTime; if(now<AUD.voiceUntil) return false; // ≤1 голос
  const n=syllables(text), dur=n/V.r+.08; AUD.voiceUntil=now+dur; AUD.duckUntil=now+dur; audApply(); setTimeout(audApply,dur*1000+40); AUD.voices=(AUD.voices||0)+1;
  for(let i=0;i<n;i++){ const t=now+i/V.r, d=.04+Math.random()*.03; if(!audSlot(i/V.r+d+(V.sub?.02:0))) break; let f=V.f*(1+(Math.random()*2-1)*V.s); if(V.crush) f=Math.round(f/25)*25;
    const o=AC.createOscillator(), g=AC.createGain(); if(V.w[0]==='p') o.setPeriodicWave(pulseWave(V.w==='p25'?.25:.125)); else o.type=V.w; o.frequency.setValueAtTime(f,t);
    if(V.vib){ o.frequency.setValueAtTime(f,t); o.frequency.linearRampToValueAtTime(f*1.04,t+d/2); o.frequency.linearRampToValueAtTime(f*.97,t+d); }
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.005); g.gain.setValueAtTime(.22,t+Math.max(.006,d-.03)); g.gain.linearRampToValueAtTime(0,t+d);
    let out=g; if(V.lp){ const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=V.lp; g.connect(lp); out=lp; } o.connect(g); out.connect(AUD.bus.voice); o.start(t); o.stop(t+d+.01);
    if(V.sub){ const o2=AC.createOscillator(), g2=AC.createGain(); o2.type='sine'; o2.frequency.value=f/2; g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(.16,t+.005); g2.gain.linearRampToValueAtTime(0,t+d); o2.connect(g2); g2.connect(AUD.bus.voice); o2.start(t); o2.stop(t+d+.01); } }
  return true; }
// реплики героя в поездке: всплывашки над героем → бормотание
{ const _pop=pop; pop=function(text,x,y){ const r=_pop.apply(this,arguments); try{ if(G.scene==='trip'&&G.hero&&Math.abs(x-G.hero.x)<3&&/[А-ЯЁA-Z]/.test(String(text))) heroVoice(heroId,text); }catch(e){} return r; }; }
// ---------- ползунки громкости (пауза и меню) ----------
const SLD={list:[],drag:null};
function slider(k,label,x,y,w,h){ const v=volOf(k), tx=x+52, tw=Math.max(40,w-52-26), ty=Math.round(y+h/2);
  G.labels.push([label,x,ty,7,'#fff','left']); ctx.fillStyle=P.ink; ctx.fillRect(tx-1,ty-3,tw+2,6); ctx.fillStyle='#3a3048'; ctx.fillRect(tx,ty-2,tw,4); ctx.fillStyle=k==='music'?'#9b4dff':k==='voice'?'#ffd23f':'#2aa860'; ctx.fillRect(tx,ty-2,Math.round(tw*v/100),4);
  const kx=Math.round(tx+tw*v/100); ctx.fillStyle=P.ink; ctx.fillRect(kx-4,ty-6,9,12); ctx.fillStyle='#fff'; ctx.fillRect(kx-3,ty-5,7,10); G.labels.push([String(v),x+w,ty,7,'#ffd23f','right']);
  SLD.list.push({k,x:tx-6,y:y,w:tw+12,h,tx,tw}); }
function sldSet(s,x){ const v=Math.round(Math.max(0,Math.min(1,(x-s.tx)/s.tw))*100/5)*5; save.vol[s.k]=v; audApply(); if(s.k==='voice'&&!SLD.vt||Date.now()-(SLD.vt||0)>400){ SLD.vt=Date.now(); if(s.k==='voice') heroVoice(heroId,'Ага, слышно'); else if(s.k==='sfx') SFX.ui&&SFX.ui(); } }
window.addEventListener('pointerdown',e=>{ const [x,y]=toIn(e.clientX,e.clientY); for(const s of SLD.list){ if(x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h){ SLD.drag={s,id:e.pointerId}; sldSet(s,x); return; } } });
window.addEventListener('pointermove',e=>{ if(!SLD.drag||SLD.drag.id!==e.pointerId) return; const [x]=toIn(e.clientX,e.clientY); sldSet(SLD.drag.s,x); });
const sldEnd=()=>{ if(SLD.drag){ SLD.drag=null; store(); } }; window.addEventListener('pointerup',sldEnd); window.addEventListener('pointercancel',sldEnd);
function volSliders(x,y,w,rh){ slider('music','МУЗЫКА',x,y,w,rh); slider('voice','ГОЛОСА',x,y+rh,w,rh); slider('sfx','ЭФФЕКТЫ',x,y+rh*2,w,rh); }
// пауза: слева 3 кнопки, справа 3 ползунка; снизу звук/вибро (как в v3.2)
drawPause=function(){ G.labels.length=0; SLD.list=[]; ctx.fillStyle='#120c18d0'; ctx.fillRect(0,0,W,H); G.labels.push(['ПАУЗА',W/2,SA.t+Math.max(14,H*.1),16,P.edge]);
  const bh=Math.max(26,48*DPR/SC), bw=Math.min(150,W*.32), cx=SA.l+Math.max(bw/2+10,(W-SA.l-SA.r)*.28); let y=Math.round(SA.t+Math.max(30,H*.24));
  bigBtn('ПРОДОЛЖИТЬ',cx-bw/2,y,bw,bh,'#2aa860',()=>paused=false,'resume'); bigBtn('ЗАНОВО',cx-bw/2,y+bh+8,bw,bh,'#3a6ad8',()=>{paused=false; startLevel(curIdx);},'restart');
  bigBtn('НА КАРТУ',cx-bw/2,y+2*(bh+8),bw,bh,'#8a3ad8',()=>{paused=false; toMap();},'map');
  const rx=cx+bw/2+24, rw=Math.min(220,W-SA.r-12-rx), rh=Math.max(20,Math.round(30*DPR/SC)); ctx.fillStyle='#ffffff10'; ctx.fillRect(rx-8,y-6,rw+16,rh*3+12); volSliders(rx,y,rw,rh);
  { const tw=Math.max(110,W*.3), th=Math.max(22,40*DPR/SC), ty=H-SA.b-th-8;
    bigBtn(save.mute?'ЗВУК: ВЫКЛ':'ЗВУК: ВКЛ',SA.l+8,ty,tw,th,save.mute?'#5a4a5a':'#3a7a5a',()=>{save.mute=!save.mute; if(master) audApply(); store();},'mute',8);
    bigBtn(save.noHaptic?'ВИБРО: ВЫКЛ':'ВИБРО: ВКЛ',SA.l+16+tw,ty,tw,th,save.noHaptic?'#5a4a5a':'#3a7a5a',()=>{save.noHaptic=!save.noHaptic; store(); haptic('select');},'hapt',8); } };
// не держим «мёртвые» ползунки на других экранах
{ const _r=render; render=function(){ SLD.list=[]; return _r.apply(this,arguments); }; }
// меню: «НАСТРОЙКИ» (текст-кнопка рядом с КОШЕЛЁК/ЗАСТАВКА) → карточка: 3 ползунка + спокойный режим + ГОТОВО (2 подписанные кнопки)
{ const _dt=drawTitle; drawTitle=function(){ _dt.apply(this,arguments);
  const lab=G.labels.find(l=>l[0]==='КОШЕЛЁК'), lab2=G.labels.find(l=>l[0]==='ЗАСТАВКА'); if(lab&&lab2){ const ty=lab[2]; lab[1]=W/2-95; lab2[1]=W/2; const b1=buttons.find(b=>b.id==='econ'), b2=buttons.find(b=>b.id==='introbtn'); if(b1) b1.x=W/2-95-43; if(b2) b2.x=W/2-43; if(b1) b1.w=86; if(b2) b2.w=86;
    G.labels.push(['НАСТРОЙКИ',W/2+95,ty,8,'#9cf']); buttons.push({x:W/2+95-43,y:ty-12,w:86,h:24,id:'settings',cb:()=>{ if(!(window.__econ&&__econ.isOpen())){ G.settings=true; SFX.ui(); } }}); }
  if(!G.settings) return; buttons=[]; G.labels=G.labels.filter(l=>l[0]==='ДАВКА ДО РАБОТЫ'); SLD.list=[];
  ctx.fillStyle='rgba(10,6,20,.78)'; ctx.fillRect(0,0,W,H); const pw=Math.min(300,W-SA.l-SA.r-24), rh=Math.max(20,Math.round(30*DPR/SC)), bh=Math.max(26,44*DPR/SC), ph=24+rh*3+10+bh*2+22, px=Math.round(W/2-pw/2), py=Math.round(Math.max(SA.t+44,(H-ph)/2));
  G.labels=G.labels.filter(l=>l[2]+12<py); ctx.fillStyle=P.ink; ctx.fillRect(px-2,py-2,pw+4,ph+4); ctx.fillStyle='#241a34'; ctx.fillRect(px,py,pw,ph); G.labels.push(['НАСТРОЙКИ',W/2,py+11,10,P.edge]);
  volSliders(px+12,py+22,pw-24,rh); const yb=py+24+rh*3+8;
  bigBtn(save.calm?'СПОКОЙНЫЙ РЕЖИМ: ВКЛ':'СПОКОЙНЫЙ РЕЖИМ: ВЫКЛ',px+12,yb,pw-24,bh,save.calm?'#3a7a5a':'#5a4a5a',()=>{ save.calm=!save.calm; audApply(); store(); },'calm',8);
  bigBtn('ГОТОВО',px+12,yb+bh+10,pw-24,bh,'#2aa860',()=>{ G.settings=false; store(); },'setok',10); }; }
function audTargets(){ return {music:+(.09*volOf('music')/60).toFixed(4),sfx:+(volOf('sfx')/80).toFixed(3),voice:+(volOf('voice')/80*(save.calm?.5:1)).toFixed(3),master:save.mute?0:.45}; }
