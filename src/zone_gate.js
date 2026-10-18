'use strict';
// ================= ЗОНА: ВХОД / ТУРНИКЕТЫ / КАССА / АВТОМАТ / РАМКА =================
const PASS_T={tourist:3.2,granny:2.6,mom:2.2,aunt:1.8,bag:2,kid:.6,student:.9,courier:.7};
function qType(d){ return pick(['polite','student','aunt','bag','tourist','granny','mom','kid','courier','seeds','trainee'].slice(0,5+Math.min(6,Math.floor(d/2)))); }
ZONES.gate={ title:z=>z.turnboss?'ТУРНИКЕТ-МУТАНТ':'ВХОД · ТУРНИКЕТЫ',
  tip:z=>!canPass()?'нет проезда — иди в КАССУ налево':'встань в очередь; «ВЛЕЗТЬ» рядом с зевакой',
  init(z){ const W2=Math.max(W,470); z.len=W2; z.TX=Math.max(190,Math.min(W2-(z.detector?250:190),Math.round(W*.75)-(z.detector?190:140))); z.KX=70; z.inQ=null; z.inK=-1; z.passed=false; z.need=false; z.adv=0; z.cutBan=0; z.inviteT=6; z.invite=null; z.vendUsed=false; z.vendAte=false; z.passing=null; z.tbT=0; z.sepR=0;
    const n=z.lanes; z.L=[]; for(let i=0;i<n;i++){ const y=z.y0+16+(z.y1-z.y0-18)*(n===1?.5:i/(n-1)); z.L.push({y,q:[],gT:0,slow:1}); }
    for(let i=0;i<n-1;i++){ const ym=(z.L[i].y+z.L[i+1].y)/2; z.solids.push([z.TX-8,ym-2,z.TX+16,ym+2]); }
    // очереди
    for(const l of z.L){ const k=ri(z.qmin,z.qmax); for(let j=0;j<k;j++) this.addQ(z,l,mkNpc(qType(z.d),z.TX-14-j*14,l.y)); }
    // самая длинная очередь — у ближней дорожки (обман глаз)
    if(z.kassa){ z.K=[]; const k=ri(1,Math.min(4,1+Math.floor(z.d/5))); for(let j=0;j<k;j++){ const e=mkNpc(pick(['granny','aunt','polite','tourist']),z.KX+16+j*14,z.y0+1); z.K.push(e); z.npcs.push(e); } z.kT=2.2; }
    if(z.vend){ z.VX=z.TX-70; z.solids.push([z.VX-9,z.y0-12,z.VX+9,z.y0+1]); }
    if(z.detector){ z.FX=z.TX+58; const ym=(z.y0+z.y1)/2; z.solids.push([z.FX-3,z.y0-10,z.FX+3,ym-9],[z.FX-3,ym+9,z.FX+3,z.y1+10]); z.guard=mkNpc('guard',z.FX+16,z.y0+2); z.guard.pin=true; z.guard.m=50; z.npcs.push(z.guard); z.gst='watch'; z.gT=3; z.beeped=false; }
    // прохожие
    for(let i=0;i<2+Math.min(5,z.d>>2);i++){ const e=mkNpc(qType(z.d),rnd(60,z.TX-40),rnd(z.y0,z.y1)); e.wander=true; z.npcs.push(e); }
    z.spawnT=rnd(2,4); },
  addQ(z,l,e){ e.lane=l; e.pass=(PASS_T[e.type]||rnd(.8,1.5))*(z.turnboss?1.2:1); e.zev=Math.random()<.28; l.q.push(e); if(!z.npcs.includes(e)) z.npcs.push(e); },
  slotX(z,j){ return z.TX-14-j*14; },
  kslotX(z,j){ return z.KX+16+j*14; },
  update(z,dt){ const h=G.hero; z.cutBan-=dt; if(z.inQ&&z.inQ.q.indexOf(h)<0&&!h.passing&&!z.passed){ z.inQ=null; z.lockHero=false; h.pin=false; tev("q_orphan"); }
    // мутант: зелёный/красный
    if(z.turnboss){ z.tbT+=dt; z.green=(z.tbT%2.6)<1.2; }
    // дорожки
    for(const l of z.L){ l.gT-=dt;
      l.q=l.q.filter(e=>!e.gone);
      l.q.forEach((e,j)=>{ if(e===h) return; if(e.passingT>0) return; walkTo(e,this.slotX(z,j),l.y,38,dt); e.pin=Math.abs(e.x-this.slotX(z,j))<2; e.face=1; e.mark=null; e.phone=e.zev; });
      const f=l.q[0];
      if(f&&f!==h&&l.gT<=0&&Math.abs(f.x-this.slotX(z,0))<3&&(!z.turnboss||z.green)){ f.passingT=f.pass; l.gT=f.pass+.2; f.pin=false; f.ghost=true; f.noSolid=true; l.q.shift(); z.adv++; f.bub=0; }
    }
    // v4 фикс: стоящий в очереди ПОЗАДИ героя (по порядку), но физически перед ним — пропускает насквозь (иначе герой упирается в «пиннутого» и ждёт сторожа)
    if(z.inQ&&!z.passed){ const l=z.inQ, hi=l.q.indexOf(h); for(let j=0;j<l.q.length;j++){ const e=l.q[j]; if(e===h) continue; const blk=hi>=0&&j>hi&&e.x>h.x-4&&e.x<h.x+16&&Math.abs(e.y-h.y)<10; if(blk){ e.ghost=true; e.qGhost=true; } else if(e.qGhost){ e.ghost=false; e.qGhost=false; } } }
    for(const e of z.npcs){ if(e.passingT>0){ e.passingT-=dt; e.x+=(26/e.pass)*dt; e.set('walk'); e.face=1; if(e.passingT<=0){ e.after=true; } } else if(e.after){ if(walkTo(e,z.len+20,e.y,50,dt)||e.x>z.len-6){ e.gone=true; } }
      else if(e.joinL){ } else if(e.wander){ if(e.tx==null||walkTo(e,e.tx,e.ty,30,dt)) { e.tx=rnd(40,z.TX-30); e.ty=rnd(z.y0,z.y1); } } }
    z.npcs=z.npcs.filter(e=>!e.gone);
    // новые пассажиры встают в хвосты
    z.spawnT-=dt; if(z.spawnT<=0){ z.spawnT=rnd(2.5,5)-Math.min(1.5,z.d*.05); const l=z.L.reduce((a,b)=>a.q.length<=b.q.length?a:b); if(l.q.length<z.qmax+2&&z.npcs.filter(e=>e.joinL).length<2){ const e=mkNpc(qType(z.d),8,rnd(z.y0,z.y1)); e.joinL=l; z.npcs.push(e); } }
    for(const e of z.npcs){ if(!e.joinL) continue; const l=e.joinL, tx=this.slotX(z,l.q.length); if(walkTo(e,tx,l.y,44,dt)||Math.hypot(e.x-tx,e.y-l.y)<5){ if(G.hero.x<tx+10&&Math.abs(G.hero.y-l.y)<9&&!z.inQ&&Math.abs(G.hero.x-tx)<14){ bubble(e,'Вы последний?',1); } else { e.joinL=null; this.addQ(z,l,e); } } }
    // касса
    if(z.K){ z.K=z.K.filter(e=>!e.gone); z.K.forEach((e,j)=>{ if(e===h) return; if(!e.after) { walkTo(e,this.kslotX(z,j),z.y0+1,36,dt); e.face=-1; } }); z.kT-=dt;
      if(z.K[0]&&z.K[0]!==h&&z.kT<=0){ const e=z.K.shift(); e.after=true; e.ghost=false; e.wander=false; bubble(e,pick(['Мне жетон и сдачу!','Без сдачи!','А где тут выход?']),1.2); z.kT=2.4; } }
    // герой в очереди — держим на месте
    if(z.inQ){ const l=z.inQ, j=l.q.indexOf(h); if(j<0){ z.inQ=null; }
      else { const s=stickVec(); if(s.x<-.6||Math.abs(s.y)>.8){ l.q.splice(j,1); z.inQ=null; h.pin=false; z.lockHero=false; pop('вышел из очереди',h.x,h.y-50,'#ccc',7); }
        else { z.lockHero=!h.passing; if(!h.passing){ walkTo(h,this.slotX(z,j),l.y,50,dt); h.pin=false; }
          // «Проходите!»
          z.inviteT-=dt; if(j>=2&&z.inviteT<=0){ z.inviteT=rnd(6,10); const e=l.q[j-1]; if(Math.random()<.4+(TR.polite?0:.15)){ z.invite={e,t:2.6}; bubble(e,'Проходите, я не спешу!',2.6,P.neonLime); } }
          // проход
          if(j===0&&!h.passing&&l.gT<=0&&Math.abs(h.x-this.slotX(z,0))<3){
            if(z.turnboss&&!z.green){ if(!z.slam){ tev('tb_slam'); z.slam=1; h.stun=.9; shake(3); pop('ХРЯСЬ! КРАСНЫЙ',h.x,h.y-52,P.red,8); SFX.hurt(); haptic('heavy'); } }
            else if(!canPass()){ l.q.splice(0,1); z.inQ=null; z.lockHero=false; h.pin=false; h.x-=26; tev('nopass'); z.need=true; say('НЕТ ПРОЕЗДНОГО! Иди в кассу ←',2.4,P.red); SFX.hurt(); haptic('error'); }
            else { const t=usePass(); tev(t<1?'pass_card':'pass_token'); store(); const gd=heroStats().gateDelay; if(gd) tev('gate_delay'); h.passing=t+gd; h.pass=t+gd; h.noSolid=true; l.q.shift(); l.gT=t+.2; z.adv++; pop(t<1?'ПИК!':'ЖЕТОН!',h.x+14,h.y-46,P.neonLime,8); SFX.coin(); } }
          if(!(z.turnboss&&!z.green)) z.slam=0; } } }
    if(z.invite){ z.invite.t-=dt; if(z.invite.t<=0||!z.inQ) z.invite=null; }
    if(h.passing){ z.lockHero=true; h.pin=false; h.x+=26/h.pass*dt; h.set('walk'); h.face=1; h.passing-=dt; if(h.passing<=0){ h.passing=0; z.passed=true; z.lockHero=false; z.inQ=null; } }
    if(h.noSolid&&!h.passing&&h.x>z.TX+20) h.noSolid=false;
    // вступить в хвост
    if(!z.inQ&&!z.passed&&!h.passing&&z.inK<0){ for(const l of z.L){ const ex=this.slotX(z,l.q.length); if(Math.abs(h.x-ex)<9&&Math.abs(h.y-l.y)<7&&stickVec().x>=-.3){ tev('queue'); l.q.push(h); z.inQ=l; pop('в очереди',h.x,h.y-50,'#fff',7); break; } } }
    // касса: вступить / купить
    if(z.K&&!z.passed){ if(z.inK<0&&!z.inQ){ const ex=this.kslotX(z,z.K.length); if(Math.abs(h.x-ex)<10&&Math.abs(h.y-(z.y0+1))<8){ z.K.push(h); z.inK=1; } }
      if(z.inK>0){ const j=z.K.indexOf(h); if(j<0) z.inK=-1; else { const s=stickVec(); if(s.y>.7||s.x>.7&&j>0){ z.K.splice(j,1); z.inK=-1; h.pin=false; z.lockHero=false; } else { z.lockHero=true; h.pin=true; walkTo(h,this.kslotX(z,j),z.y0+1,50,dt); h.face=-1; } } } }
    // рамка
    if(z.detector){ z.gT-=dt; if(z.gT<=0){ z.gst=z.gst==='watch'?'chat':'watch'; z.gT=z.gst==='watch'?rnd(2.6,3.6):rnd(1.8,2.6); bubble(z.guard,z.gst==='watch'?'Так-так…':'…а я ему и говорю…',z.gT,z.gst==='watch'?P.red:'#ccc'); }
      if(!z.beeped&&h.x>z.FX-1&&h.x<z.FX+6){ z.beeped=true; if(z.gst==='watch'&&Math.random()<.6){ h.x=z.FX-16; h.stun=2.2; shake(2); say('БИИИП! «Ключи, телефон, батон — в лоток!»',2.2,P.red); SFX.hurt(); haptic('error'); z.rebeep=1; tev('det_beep'); } else { tev('det_pass'); pop('проскочил!',h.x,h.y-50,P.neonLime,8); } }
      if(z.rebeep&&h.stun<=0&&h.x<z.FX-8){ z.rebeep=0; z.beeped=false; } }
    if(z.passed&&h.x>z.len-26) zoneDone();
    z.hint=z.passed?'вперёд →':z.need&&!canPass()?'КАССА ← купи проезд':z.inQ?(z.turnboss?'жди ЗЕЛЁНЫЙ':'стой… или ВЛЕЗЬ к зеваке'):'встань в очередь к турникету';
  },
  near(z){ const h=G.hero; let best=null, bd=1e9; for(const l of z.L) l.q.forEach((e,j)=>{ if(e===h) return; const d=Math.hypot(e.x-h.x,(e.y-h.y)*2); if(d<22&&d<bd&&j<l.q.length){ bd=d; best={e,l,j}; } }); return best; },
  ctx(z){ const h=G.hero, w=wallet(); const r={};
    if(z.invite&&z.inQ) r.b={label:'ДА, СПАСИБО!',col:'#2aa860',fn:()=>{ const l=z.inQ, j=l.q.indexOf(h), e=z.invite.e, k=l.q.indexOf(e); if(j>0&&k>=0){ l.q.splice(j,1); l.q.splice(Math.max(1,k),0,h); TR.polite++; tev('invite'); pop('ВЕЖЛИВОСТЬ +20',h.x,h.y-56,P.neonLime,8); bubble(e,'Пожалуйста!',1); } z.invite=null; }};
    else if(z.inK>0&&z.K[0]===h){ r.b={label:w.coins>=5?'ЖЕТОН · 5 мон.':'В ДОЛГ (−15 с)',col:'#d8a020',fn:()=>{ if(w.coins>=5){ tev('buy_token'); w.coins-=5; w.tokens++; } else { tev('buy_debt'); w.tokens++; pop('−'+penalize(15,'debt')+' с',h.x,h.y-56,P.red,9); } this.leaveK(z,'Жетон куплен!'); }};
      if(w.coins>=40) r.a={label:'ПРОЕЗДНОЙ×10 · 40',col:'#2aa860',fn:()=>{ tev('buy_pass'); w.coins-=40; w.rides+=10; this.leaveK(z,'Проездной на 10 поездок!'); }};
      else if(w.coins>=25) r.a={label:'БЕЗЛИМИТ ДЕНЬ · 25',col:'#2aa860',fn:()=>{ tev('buy_unlim'); w.coins-=25; w.unlim=mskDay(); this.leaveK(z,'Безлимит до полуночи!'); }}; }
    else if(z.vend&&!z.vendUsed&&Math.abs(h.x-z.VX)<16&&h.y<z.y0+14&&!z.inQ){ if(z.vendAte) r.b={label:'ПНУТЬ АВТОМАТ',col:'#d8265e',fn:()=>{ tev('vend_kick'); shake(3); SFX.hit(); if(Math.random()<.5){ this.coffee(z); } else { pop('…',z.VX,z.y0-30,'#fff',9); z.vendUsed=true; say('Автомат победил. Монета не вернулась.',1.6,'#ccc'); } }};
      else if(w.coins>=3) r.b={label:'КОФЕ · 3 мон.',col:'#8a5a2e',fn:()=>{ w.coins-=3; store(); if(Math.random()<.22){ tev('vend_ate'); z.vendAte=true; say('АВТОМАТ СЪЕЛ МОНЕТУ!',1.6,P.red); } else this.coffee(z); }}; }
    else if(!z.inQ&&!z.passed&&z.inK<0&&z.cutBan<=0){ const n=this.near(z); if(n&&n.j>0) r.b={label:'ВЛЕЗТЬ',col:'#d87a20',fn:()=>this.cut(z,n)}; }
    return r; },
  coffee(z){ tev('coffee'); z.vendUsed=true; TR.boost=14; TR.nerves=Math.min(100,TR.nerves+20); pop('КОФЕ! +СКОРОСТЬ',G.hero.x,G.hero.y-56,'#ffb84a',8); SFX.coin(); },
  leaveK(z,s){ const h=G.hero; const j=z.K.indexOf(h); if(j>=0) z.K.splice(j,1); z.inK=-1; h.pin=false; z.lockHero=false; h.y=z.y0+16; h.x+=4; z.need=false; store(); say(s,1.6,P.neonLime); SFX.coin(); },
  cut(z,n){ const h=G.hero, {e,l,j}=n; const ok=Math.random()<(e.zev?.88:.3); if(ok){ tev('cut_ok'); l.q.splice(j,0,h); z.inQ=l; TR.scandal+=e.zev?6:18; bubble(e,e.zev?'…а? ну ладно':'Э, тут очередь!',1.4); pop('ВЛЕЗ!',h.x,h.y-52,'#ffb84a',8); }
    else { tev('cut_fail'); TR.scandal+=30; z.cutBan=3; h.x-=24; h.stun=.9; bubble(e,'ВЫ ТУТ НЕ СТОЯЛИ!',1.8,P.red); shake(2); SFX.hurt(); haptic('error'); if(TR.scandal>=100){ TR.scandal=40; TR.scandals++; h.stun=2.2; say('СКАНДАЛ! Вся очередь против тебя',2,P.red); } } },
  prog(z){ const h=G.hero; if(z.passed||h.passing) return 2000+h.x; let p=h.x*.5; if(z.inQ) p+=300-z.inQ.q.indexOf(h)*20+z.adv*6; if(z.inK>0) p+=200-z.K.indexOf(h)*20; if(z.need) p+=0; return p; },
  unstick(z){ const h=G.hero; if(z.inQ){ const j=z.inQ.q.indexOf(h); z.inQ.q.splice(j,1); z.inQ.q.unshift(h); z.inQ.gT=0; z.green=true; z.tbT=0; h.stun=0; h.x=this.slotX(z,0); h.y=z.inQ.y; for(const e of z.npcs) if(Math.abs(e.x-h.x)<14&&Math.abs(e.y-h.y)<8){ e.x-=18; } }
    else if(z.need&&!canPass()){ tev('wd_token'); wallet().tokens++; z.need=false; say('Кассир крикнул: «Держи жетон, потом занесёшь!»',2,'#ccc'); }
    else if(z.passed){ h.x=Math.min(z.len-20,h.x+40); } else { const l=z.L[0]; l.q.unshift(h); z.inQ=l; l.gT=0; } },
  bot(z){ const h=G.hero, r={x:h.x,y:h.y};
    if(z.passed||h.passing) { r.x=z.len; r.y=(z.y0+z.y1)/2; if(z.detector&&h.x<z.FX&&h.x>z.FX-30&&z.gst==='watch'){ r.x=h.x; r.y=h.y; } return r; }
    if(z.invite&&z.inQ){ r.b=1; return r; }
    if(z.inK>0){ if(z.K[0]===h){ const c=wallet().coins; if(z.ctxA&&(c>=40||c>=25&&Math.random()<.5)) r.a=1; else r.b=1; } return r; }
    if(z.inQ) return r;
    if(!canPass()&&(z.need||!window.__botNaive)){ const ex=this.kslotX(z,z.K.length); r.x=ex; r.y=z.y0+1; return r; }
    if(z.vend&&!z.vendUsed&&wallet().coins>=8&&z.botVend!==false){ if(z.botVend===undefined) z.botVend=Math.random()<.5; if(z.botVend){ r.x=z.VX; r.y=z.y0+4; if(Math.abs(h.x-z.VX)<12&&h.y<z.y0+14) r.b=1; return r; } }
    if(z.botCut===undefined) z.botCut=Math.random()<.5; const n=this.near(z); if(z.botCut&&n&&n.j>0&&n.e.zev&&z.cutBan<=0){ r.b=1; return r; }
    const l=z.L.reduce((a,b)=>a.q.reduce((s,e)=>s+(e.pass||1),0)<=b.q.reduce((s,e)=>s+(e.pass||1),0)?a:b); z.botL=z.botL||l; const L=z.botL; r.x=this.slotX(z,L.q.length); r.y=L.y; return r; },
  draw(z){ const lc=LINE_COL[TR.line%10]; hallBG(z,{wall:'#e2d6b8'}); const c=G.cam, wb=FY0-4;
    wallSign(z.len/2-40,SIGN_Y(),80,14,'ВХОД',lc,'#fff',9);
    // касса — окошко в стене
    if(z.K){ const kx=Math.round(z.KX-c); ctx.fillStyle=P.ink; ctx.fillRect(kx-20,wb-60,40,52); ctx.fillStyle='#8a6a4a'; ctx.fillRect(kx-19,wb-59,38,50); ctx.fillStyle='#bfe0ff'; ctx.fillRect(kx-14,wb-50,28,22); ctx.fillStyle='#ffd0a8'; ctx.fillRect(kx-5,wb-44,10,10); ctx.fillStyle='#c84a8a'; ctx.fillRect(kx-6,wb-46,12,4); ctx.fillStyle=P.ink; ctx.fillRect(kx-3,wb-40,2,1); ctx.fillRect(kx+1,wb-40,2,1); ctx.fillStyle='#5a3a2a'; ctx.fillRect(kx-16,wb-26,32,6);
      G.labels.push(['КАССА',kx,wb-66,7,P.edge]); if(z.need&&!canPass()) goalArrow(this.kslotX(z,z.K.length),z.y0-50,P.edge); }
    // автомат
    if(z.vend){ const vx=Math.round(z.VX-c); ctx.fillStyle=P.ink; ctx.fillRect(vx-10,wb-46,20,48); ctx.fillStyle='#8a2a2a'; ctx.fillRect(vx-9,wb-45,18,46); ctx.fillStyle='#ffe9a8'; ctx.fillRect(vx-6,wb-40,12,14); ctx.fillStyle='#2a1a1a'; ctx.fillRect(vx-5,wb-20,10,6); ctx.fillStyle=z.vendAte?P.red:P.neonLime; ctx.fillRect(vx+4,wb-24,2,2); G.labels.push(['КОФЕ',vx,wb-52,6,'#ffb84a']); }
    hallLight();
    // турникеты
    const tx=Math.round(z.TX-c); for(const l of z.L){ const y=Math.round(l.y); ctx.fillStyle=P.ink; ctx.fillRect(tx-2,y-26,12,26); ctx.fillStyle='#9aa0b0'; ctx.fillRect(tx-1,y-25,10,24); ctx.fillStyle='#5a6070'; ctx.fillRect(tx-1,y-6,10,5);
      const g=z.turnboss?z.green:l.gT<=0; ctx.fillStyle=g?'#3aff6a':'#ff3a3a'; ctx.fillRect(tx+2,y-22,4,3); if(z.turnboss){ ctx.fillStyle='#ff4fa3'; ctx.fillRect(tx-1,y-29,10,3); } }
    for(const s of z.solids.slice(0,z.L.length-1)){ ctx.fillStyle=P.ink; ctx.fillRect(Math.round(s[0]-c),Math.round(s[1])-14,s[2]-s[0],3); ctx.fillStyle='#c8ccd8'; ctx.fillRect(Math.round(s[0]-c),Math.round(s[1])-13,s[2]-s[0],1); }
    if(z.turnboss) G.labels.push([z.green?'ЗЕЛЁНЫЙ — ЖМИ':'КРАСНЫЙ — ЖДИ',tx+4,z.y0-30,8,z.green?'#3aff6a':P.red]);
    // рамка
    if(z.detector){ const fx=Math.round(z.FX-c), ym=(z.y0+z.y1)/2; ctx.fillStyle=P.ink; ctx.fillRect(fx-12,ym-50,4,50); ctx.fillRect(fx+8,ym-50,4,50); ctx.fillRect(fx-12,ym-54,24,5); ctx.fillStyle='#b0b6c4'; ctx.fillRect(fx-11,ym-49,2,48); ctx.fillRect(fx+9,ym-49,2,48); ctx.fillStyle=z.gst==='watch'?P.red:'#3aff6a'; ctx.fillRect(fx-2,ym-53,4,3);
      G.labels.push([z.gst==='watch'?'ОХРАНА СМОТРИТ':'ОХРАНА БОЛТАЕТ',fx,z.y0-58,7,z.gst==='watch'?P.red:'#3aff6a']); }
    G.hero.mark=null; drawTripActors([G.hero,...z.npcs]);
    { const h=G.hero; let nz=null, nd=60; for(const e of z.npcs){ if(e.phone){ const sx=Math.round(e.x-c), sy=Math.round(e.y-e.z)-52; ctx.fillStyle=P.ink; ctx.fillRect(sx+4,sy-1,6,9); ctx.fillStyle='#3ff0ff'; ctx.fillRect(sx+5,sy,4,7); const d=Math.abs(e.x-h.x)+Math.abs(e.y-h.y); if(d<nd&&!z.inQ&&!z.passed){ nd=d; nz=e; } } }
      if(nz) G.labels.push(['зевака в телефоне',Math.round(nz.x-c),Math.round(nz.y)-66,7,'#9cf']); }
    if(!z.passed&&!z.inQ&&z.inK<0&&canPass()&&!h_near(z)) { const l=z.botL||z.L[0]; goalArrow(this.slotX(z,l.q.length),l.y-58); }
    if(z.passed) goalArrow(z.len-30,(z.y0+z.y1)/2-58);
  } };
function h_near(z){ return false; }
