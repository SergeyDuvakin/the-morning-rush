// M5-5…M5-8: голоса толпы (3 тембра), хор скандала, ducking (−8/−4 dB, атака 50 мс, отпуск 600 мс), темы по зонам + метро 110 BPM + вальс выходного + тревога 08:55, кроссфейд 0.8 с. Всё процедурно, 0 КБ файлов.
// ---------- тембры толпы ----------
const VOX5={ male:{w:'sawtooth',f:125,s:.12,lp:1300}, female:{w:'p25',f:245,s:.15,lp:2600}, granny:{w:'triangle',f:290,s:.22,vib:7} };
const EMO5={ calm:{k:1,r:1}, angry:{k:1.22,r:1.25}, scared:{k:1.32,r:1.35}, sad:{k:.86,r:.8,slide:-.12}, happy:{k:1.12,r:1.1,slide:.08} };
const VSLOT={scandal:0,other:0}; AUD.crowdV=0; AUD.dropped=0; AUD.choirMax=0; AUD.xfades=0;
function timbreOf(e){ if(!e) return 'male'; const t=e.type||''; if(t==='granny'||e.atl==='baba'||t==='seeds'&&e.ded&&TR&&TR.wk&&TR.wk.sun) return 'granny'; if(/mom|aunt|student|nastya|trainee|colleague/.test(t)||e.nastya) return 'female'; return 'male'; }
function emoOfCol(col){ col=String(col||'').toLowerCase(); if(/ff4|ff5a5a|ff6a6a|ff9a9a|red|#e/.test(col)&&!/fff/.test(col)) return 'angry'; if(/ff8ab0/.test(col)) return 'sad'; return 'calm'; }
// один голос — слоги 60–140 мс, огибающая 5/30 мс; слот: 1 скандал + 1 прочий; лишние отбрасываются
function crowdVoice(tb,text,emo,slot,layer){ slot=slot||'other'; if(typeof AC==='undefined'||!AC||!AUD.bus.voice||save.mute||volOf('voice')<=0) return false; const now=AC.currentTime;
  if(!layer&&now<VSLOT[slot]){ AUD.dropped++; return false; } const V=VOX5[tb]||VOX5.male, E=EMO5[emo]||EMO5.calm, n=Math.max(1,Math.min(6,syllables(text)));
  let t=now+(layer||0)*.03; const t0=t; for(let i=0;i<n;i++){ const d=(.06+Math.random()*.08)/E.r; if(!audSlot(t-now+d)) break; let f=V.f*E.k*(1+(Math.random()*2-1)*V.s)*(layer?1+layer*.07:1);
    const o=AC.createOscillator(), g=AC.createGain(); if(V.w[0]==='p') o.setPeriodicWave(pulseWave(.25)); else o.type=V.w; o.frequency.setValueAtTime(f,t); if(V.vib){ o.frequency.linearRampToValueAtTime(f*1.05,t+d/2); o.frequency.linearRampToValueAtTime(f*.96,t+d); } else if(E.slide) o.frequency.linearRampToValueAtTime(f*(1+E.slide),t+d);
    const pk=(slot==='scandal'?.12:.18)/(layer?1.6:1); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(pk,t+.005); g.gain.setValueAtTime(pk,t+Math.max(.006,d-.03)); g.gain.linearRampToValueAtTime(0,t+d);
    let out=g; if(V.lp){ const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=V.lp; g.connect(lp); out=lp; } o.connect(g); out.connect(AUD.bus.voice); o.start(t); o.stop(t+d+.01); t+=d+.012; }
  const dur=Math.max(t-t0,n*.1); if(!layer){ VSLOT[slot]=now+dur; if(slot==='other') VSLOT.otherBy='crowd'; } /* слот занят на всю реплику, даже если узлов не хватило (транспорт M5-12) */ AUD.crowdV++; duck5(dur); return true; }
// ---------- ducking: голос → музыка −8 dB, эмбиент/эффекты −4 dB; атака 50 мс, отпуск 600 мс ----------
const DUCK5={m:Math.pow(10,-8/20),s:Math.pow(10,-4/20),att:.05,rel:.6};
function duck5(dur){ if(!AC) return; AUD.duckUntil=Math.max(AUD.duckUntil,AC.currentTime+dur); audApply(); clearTimeout(AUD.duckTm); AUD.duckTm=setTimeout(audApply,dur*1000+30); }
audApply=function(){ if(!AC||!AUD.bus.sfx) return; const t=AC.currentTime, on=t<AUD.duckUntil-.005, tc=on?DUCK5.att/3:DUCK5.rel/3, bus=AUD.musBus||mus;
  const mv=.09*volOf('music')/60*(on?DUCK5.m:1), sv=volOf('sfx')/80*(on?DUCK5.s:1); bus.gain.setTargetAtTime(mv,t,tc); AUD.bus.sfx.gain.setTargetAtTime(sv,t,tc); AUD.bus.voice.gain.setTargetAtTime(volOf('voice')/80*(save.calm?.5:1),t,.02);
  master.gain.setTargetAtTime(save.mute?0:.45,t,.02); AUD.duckNow={on,m:on?DUCK5.m:1,s:on?DUCK5.s:1,tc}; };
// голос героя занимает «прочий» слот
{ const _hv=heroVoice; heroVoice=function(id,text){ if(typeof AC!=='undefined'&&AC&&AC.currentTime<VSLOT.other&&VSLOT.otherBy!=='hero'){ AUD.dropped++; return false; } const r=_hv(id,text); if(r){ VSLOT.other=AUD.voiceUntil; VSLOT.otherBy='hero'; duck5(AUD.voiceUntil-AC.currentTime); } return r; }; }
// реплики NPC (пузыри) → бормотание их тембром; пузырь — визуальный дубль звука
{ const _b=bubble; bubble=function(e,s,t,col){ _b.apply(this,arguments); try{ if(G.scene!=='trip'||!e||e===G.hero||e._choir) return; const sx=e.x-G.cam; if(sx<-20||sx>W+20) return; if(e._vS===s&&G.t-(e._vT||0)<2) return; e._vS=s; e._vT=G.t; crowdVoice(timbreOf(e),s,e._shout?'angry':emoOfCol(col),e._shout?'scandal':'other'); }catch(err){} }; }
// ТОЛКНУТЬ → выкрик толкнутого: «Э!», «Куда!», «Молодой человек!»
const SHOUT5=['Э!','Куда!','Молодой человек!','Ай!','Осторожнее!'];
{ const _tp=tripPress; tripPress=function(k){ const s0=(TR.ev&&TR.ev.shove)||0; const r=_tp(k); try{ const s1=(TR.ev&&TR.ev.shove)||0; if(s1>s0&&TR.z){ const h=G.hero; let best=null, bd=40; for(const e of TR.z.npcs){ if(e.ghost&&!e.flow) continue; const dx=(e.x-h.x)*h.face; if(dx>-4&&dx<bd&&Math.abs(e.y-h.y)<12){ bd=dx; best=e; } } if(best){ TR.shoutN=(TR.shoutN||0)+1; best._shout=1; bubble(best,SHOUT5[(TR.shoutN-1)%SHOUT5.length],1.1,'#ff9a9a'); best._shout=0; tev('shout'); } } }catch(e){} return r; }; __trip.press=k=>tripPress(k); }
// ---------- M5-6: хор скандала >50%: 1→2→3 голоса нарастают (один слот «скандал») ----------
{ const _tu=tripUpdate; tripUpdate=function(dt){ _tu(dt); try{ if(G.scene!=='trip'||TR.done||!TR.z||TR.smod) return; const s=TR.scandal||0; if(s<=50){ TR.choirT=0; return; } TR.choirT=(TR.choirT||0)-dt; if(TR.choirT>0) return;
    const n=s>88?3:s>70?2:1; TR.choirT=Math.max(.7,1.8-s/100); AUD.choirMax=Math.max(AUD.choirMax,n); TR.choirN=n; tev('choir'+n); const h=G.hero, near=TR.z.npcs.filter(e=>Math.abs(e.x-h.x)<90&&!e.bub&&e!==TR.z.nas).slice(0,n);
    const words=['Бу-бу-бу!','Ну и молодёжь…','Хам!','Безобразие!','Куда прёшь!']; near.forEach((e,i)=>{ e._choir=1; bubble(e,words[(i+Math.floor(G.t))%words.length],1,'#ff9a9a'); e._choir=0; });
    if(typeof AC!=='undefined'&&AC){ if(AC.currentTime>=VSLOT.scandal){ const tb=['male','female','granny']; for(let i=0;i<n;i++) crowdVoice(near[i]?timbreOf(near[i]):tb[i],'бу-бу-бу-бу','angry','scandal',i); VSLOT.scandal=AC.currentTime+.5; } else AUD.dropped++; } }catch(e){} }; }
// ---------- M5-8: темы по зонам ----------
const MET5={bpm:110,bpm0:110, bass:[45,0,45,0,52,0,45,0,43,0,43,0,50,0,43,0, 41,0,41,0,48,0,41,0,40,0,40,0,47,0,44,0],
  mel:[69,0,72,0,76,0,74,72,0,71,0,69,0,0,67,0, 69,0,72,0,77,0,76,74,0,72,0,71,69,0,0,0]};
const WALTZ5={bpm:150,bpm0:150, bass:[43,48,50,43,47,48], ch:[[59,62,67],[60,64,67],[62,66,69],[59,62,67],[59,62,65],[60,64,67]],
  mel:[71,0,0,72,74,0, 76,0,74,72,0,0, 74,0,0,72,71,0, 69,0,0,0,0,0, 71,0,0,72,74,0, 76,0,79,76,0,0, 74,0,72,71,0,69, 67,0,0,0,0,0]};
const WALTZ5_SUN={bpm:120,bpm0:120, bass:[40,45,47,40,43,45], ch:[[55,59,64],[57,60,64],[59,62,66],[55,59,64],[55,59,62],[57,60,64]],
  mel:[67,0,0,69,71,0, 72,0,71,69,0,0, 71,0,0,69,67,0, 64,0,0,0,0,0, 67,0,0,69,71,0, 72,0,74,72,0,0, 71,0,69,67,0,66, 64,0,0,0,0,0]};
for(const T of [typeof ST4_THEME!=='undefined'?ST4_THEME:null,typeof M3_THEME!=='undefined'?M3_THEME:null,typeof BC_THEME!=='undefined'?BC_THEME:null]) if(T) T.bpm0=T.bpm;
const METRO_ZK={gate:1,esc:1,passage:1,plat:1,car:1,xfer:1,exitz:1,lobby:1,kassa:1};
function musArea(){ if(G.scene!=='trip'||!TR||!TR.z) return 'menu'; const z=TR.z; if(TR.wkClock||z.k==='wpick'||z.k==='mega'||z.nastya||z.dacha) return TR.wk&&TR.wk.sun||z.sun?'wksun':'wk';
  if(z.k==='street') return 'street'; if(/^m(gate|exit|plat|train)$/.test(z.k)) return 'mcd'; if(/^bc/.test(z.k)) return 'bc'; if(METRO_ZK[z.k]) return 'metro'; return 'other'; }
function musAlarm(){ return G.scene==='trip'&&TR&&!TR.soft&&!TR.done&&TR.tTotal>0&&TR.tLeft/TR.tTotal<.15&&TR.mode==='trip'; }
function musXfade(key){ if(!AC||!AUD.musBus) return; const t=AC.currentTime, old=mus, nw=old===AUD.mA?AUD.mB:AUD.mA; try{ old.gain.cancelScheduledValues(t); old.gain.setValueAtTime(old.gain.value,t); old.gain.linearRampToValueAtTime(0,t+.8); nw.gain.cancelScheduledValues(t); nw.gain.setValueAtTime(0,t); nw.gain.linearRampToValueAtTime(1,t+.8); }catch(e){} mus=nw; AUD.mkey=key; AUD.xfades++; AUD.xfadeT=.8; }
function aud5Mus(){ if(typeof AC==='undefined'||!AC||!AUD.bus.sfx||AUD.musBus||!mus) return; try{ AUD.musBus=mus; AUD.mA=AC.createGain(); AUD.mB=AC.createGain(); AUD.mA.gain.value=1; AUD.mB.gain.value=0; AUD.mA.connect(AUD.musBus); AUD.mB.connect(AUD.musBus); AUD.bus.music=AUD.musBus; mus=AUD.mA; audApply(); }catch(e){} }
{ const _ab=audBuild; audBuild=function(){ _ab(); aud5Mus(); }; }
{ const _mt=musicTick; musicTick=function(){ if(typeof AC==='undefined'||!AC||!musOn||save.mute) return _mt(); if(!AUD.bus.sfx) audBuild(); aud5Mus(); const key=musArea(); if(AUD.mA&&key!==AUD.mkey){ if(AUD.mkey!==undefined) musXfade(key); else AUD.mkey=key; }
    const al=musAlarm(), k=al?1.15:1; AUD.alarm=al; AUD.tempoK=k; const TS=[MET5,WALTZ5,WALTZ5_SUN,typeof ST4_THEME!=='undefined'?ST4_THEME:null,typeof M3_THEME!=='undefined'?M3_THEME:null,typeof BC_THEME!=='undefined'?BC_THEME:null].filter(Boolean); for(const T of TS) T.bpm=T.bpm0*k;
    try{ if(key==='metro') musMetro5(); else if(key==='wk'||key==='wksun') musWaltz5(key==='wksun'?WALTZ5_SUN:WALTZ5); else _mt(); } finally { for(const T of TS) T.bpm=T.bpm0; }
    if(al){ const t=AC.currentTime; if(!(AUD.alNext>t-.05)) AUD.alNext=t+.05; while(AUD.alNext<t+.2){ const d=AUD.alNext-t; tone(1960,.05,'square',.07,0,d,mus); tone(1960,.05,'square',.07,0,d+.1,mus); AUD.alNext+=60/(110*k)*2; AUD.alBeeps=(AUD.alBeeps||0)+1; } } }; }
function musMetro5(){ const sp=60/MET5.bpm/4; AUD.met=1; while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02; const i=musStep%32, b=MET5.bass[i], m=MET5.mel[i], d=musNext-AC.currentTime;
    if(b) tone(mtof(b),sp*1.6,'triangle',.5,0,d,mus); if(m) tone(mtof(m),sp*.9,'square',.17,0,d,mus); if(i%8===4) noise(.04,.05,3000,d); musStep++; musNext+=sp; } }
function musWaltz5(T){ const sp=60/T.bpm/4; AUD.waltz=(AUD.waltz||0)+1; while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02; const i=musStep%48, bar=Math.floor(i/12)%T.bass.length, s=i%12, d=musNext-AC.currentTime;
    // раз-два-три: бас на 1, аккорд на 2 и 3 (шаги 0/4/8 из 12 шестнадцатых)
    const bb=T.bass[(Math.floor(musStep/12))%T.bass.length], C=T.ch[(Math.floor(musStep/12))%T.ch.length]; if(s===0) tone(mtof(bb),sp*3.4,'triangle',.45,0,d,mus); if(s===4||s===8) for(const n of C) tone(mtof(n),sp*1.8,'square',.035,0,d,mus);
    const m=T.mel[musStep%T.mel.length]; if(m) tone(mtof(m),sp*2.6,'triangle',.22,0,d,mus); musStep++; musNext+=sp; } }
