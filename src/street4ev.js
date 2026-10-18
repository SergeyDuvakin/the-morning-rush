// M2 события улицы. Каждое: init(z,r) / update(z,dt) / draw(z,layer: ground|back|front|ui) / bot(z) / ctx(z) / goal(z) / tip(z) / title(z)
// ---------- общие ----------
function st4Honk(h,x,y){ G.labels.push(['БИИП!',Math.round(x-G.cam),y,8,'#ffe14a','center',P.ink]); }
function st4Beep(){ try{ tone(880,.12,'square',.14); tone(660,.16,'square',.14,0,.13); }catch(e){} }
// машина анфас (выезд из переулка): 24×18, цвет кузова, фары, стекло с бликом
function st4CarFront(sx,sy,col,lights){ const x=Math.round(sx-12), y=Math.round(sy-18), f=(c,a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(x+a,y+b,w,h); };
  f('rgba(10,6,20,.3)',0,16,24,3); f(P.ink,1,1,22,16); f(col,2,2,20,14); f(shade(col,.2),3,2,18,2); f(P.ink,4,3,16,6); f('#3d4a66',5,4,14,4); f('#8fb0d0',6,4,3,1);
  f(shade(col,-.3),2,11,20,3); f(lights?'#fff6c0':'#e8e0b0',3,10,4,2); f(lights?'#fff6c0':'#e8e0b0',17,10,4,2); f('#e8e4d8',9,12,6,2); f(P.ink,2,16,4,2); f(P.ink,18,16,4,2); }
// ---------- M2-2: светофор + зебра (вариации: обычный / сломанный мигающий / регулировщик) ----------
SEV.light={ title:z=>['ПЕРЕХОД · СВЕТОФОР','СВЕТОФОР СЛОМАН','ПЕРЕХОД · РЕГУЛИРОВЩИК'][z.v||0],
  init(z,r){ const CW=64, cx=Math.round(z.len*(.48+r()*.08)); z.cx=cx; z.cw=CW; z.gaps=[[cx,cx+CW]]; z.lt={ph:r()<.5?'red':'green',t:0,dur:0}; z.lt.dur=z.lt.ph==='red'?6:5; z.vc=[]; z.vcT=.5;
    const L=[8,cx-10], R=[cx+CW+10,z.len-10]; for(const e of z.npcs){ if(e.x>cx-12&&e.x<cx+CW+12) e.x=e.x<cx+CW/2?cx-14-rnd(0,60):cx+CW+14+rnd(0,60); e.lim=e.x<cx?L:R; }
    z.wait=[]; const nw=3+Math.floor(r()*3); for(let i=0;i<nw;i++){ const e=st4VarNpc(cx-12-rnd(0,22),rnd(z.y0+2,z.y1-2),r); e.ctl=1; e.face=1; e.set('idle'); e.waiter=1; z.npcs.push(e); z.wait.push(e); }
    if(z.v===2){ const c=mkNpc('guard',cx+CW/2,z.y0-1); c.ctl=1; c.face=-1; c.cop=1; c.ghost=true; c.noSolid=true; z.cop=c; z.extra=[c]; } },
  phase(z){ return z.v===1?'broken':z.lt.ph; },
  green(z){ return z.v!==1&&z.lt.ph==='green'; },
  left(z){ return Math.max(0,z.lt.dur-z.lt.t); },
  update(z,dt){ const h=G.hero, g=st4Geo(), lt=z.lt, cx=z.cx, CW=z.cw;
    if(z.v!==1){ lt.t+=dt; if(lt.t>=lt.dur){ lt.ph=lt.ph==='red'?'green':'red'; lt.t=0; lt.dur=lt.ph==='red'?6:5; if(lt.ph==='green'){ tev('light_green'); for(const e of z.wait){ e.go=1; } } } }
    // волна пешеходов на зелёный
    for(const e of z.wait){ if(e.go&&this.green(z)){ e.x+=40*dt; e.face=1; e.set('walk'); if(e.x>cx+CW+12){ e.ctl=0; e.waiter=0; e.dir=1; e.spd2=rnd(22,34); e.lim=[cx+CW+10,z.len-10]; } } else if(e.ctl&&e.x>cx-6&&e.x<cx+CW+12){ e.x+=40*dt; e.set('walk'); } else if(e.ctl) e.set('idle'); }
    z.wait=z.wait.filter(e=>e.ctl); if(z.wait.length<2&&lt.ph==='red'&&Math.random()<dt*.5){ const e=st4VarNpc(cx-14-rnd(0,18),rnd(z.y0+2,z.y1-2),Math.random); e.ctl=1; e.face=1; e.waiter=1; z.npcs.push(e); z.wait.push(e); }
    // машины из переулка: на красный (для пешеходов) едут, на зелёный — ждут у стоп-линии
    const stopY=z.y0-9, carsGo=z.v===1?true:!this.green(z), vx=cx+CW/2; z.vcT-=dt;
    if(z.vcT<=0&&z.vc.length<3){ z.vc.push({x:vx,y:g.facadeB-30,v:z.v===1?48:72,col:pick(['#d8343a','#e8e4d8','#ffd23f','#3d6ff0','#4a4a58']),hk:0}); z.vcT=z.v===1?rnd(2.2,4):rnd(1.3,2.0); }
    z.vc.sort((a,b)=>b.y-a.y); for(let i=0;i<z.vc.length;i++){ const q=z.vc[i], ahead=z.vc[i-1]; let lim=1e9; if(!carsGo&&q.y<=stopY+1) lim=stopY; if(ahead) lim=Math.min(lim,ahead.y-22);
      const near=h.x>vx-20&&h.x<vx+20&&h.y>q.y-2&&h.y-q.y<34; if(near&&z.v===1&&q.y<z.y0) lim=Math.min(lim,q.y); // сломанный: машины осторожно притормаживают перед зеброй
      if(near&&!q.hk&&h.y-q.y<26&&h.y>q.y){ q.hk=1.2; st4Beep(); tev('honk'); }
      q.hk=Math.max(0,q.hk-dt); q.y=Math.min(q.y+q.v*dt,lim);
      if(!h.stun&&Math.abs(h.x-vx)<16&&Math.abs(h.y-q.y)<6&&q.y>z.y0-4){ // сбило гудком: откинуло на 40 px, −3 с, нервы −5
        tev('light_hit'); penalize(3,'honk'); TR.nerves=Math.max(0,TR.nerves-5); h.x=Math.min(h.x,cx)-40+20; h.x=Math.max(8,h.x); h.stun=.45; h.set('hurt'); SFX.hurt(); shake(2); haptic('error'); pop('−3 с',h.x,h.y-52,'#ff8a8a',8); say('БИИП! На красный нельзя — откинуло назад',2,'#ffd23f'); } }
    z.vc=z.vc.filter(q=>q.y<g.roadY+18);
    if(z.cop){ z.cop.set('idle'); z.cop.face=this.green(z)?1:-1; } },
  prog(z){ const h=G.hero; return h.x+(h.x>z.cx-40&&h.x<z.cx+4&&!this.green(z)?z.t*8:0); },
  goal(z){ const h=G.hero; if(h.x>z.cx+z.cw) return null; if(z.v===1) return 'Светофор сломан — смотри на машины'; if(z.v===2) return this.green(z)?'Регулировщик пропускает — иди!':'Регулировщик: стой'; return this.green(z)?(this.left(z)<2?'Мигает — успеешь?':'Зелёный — переходи!'):'Красный — жди или рискни'; },
  tip:z=>'жди зелёного человечка у зебры; на мигающем — только если близко',
  drawCars(z,front){ const h=G.hero; for(const q of z.vc){ if((q.y>h.y)!==front) continue; st4CarFront(Math.round(q.x-G.cam),Math.round(q.y),q.col,true); if(q.hk>0) st4Honk(h,q.x,Math.round(q.y-26)); } },
  draw(z,layer){ const g=st4Geo(), cx=z.cx, CW=z.cw, c=G.cam;
    if(layer==='ground'){ st4Alley(z,cx,cx+CW,true); const sx=Math.round(cx-c); ctx.fillStyle='#ece8dc'; ctx.fillRect(sx+4,z.y0-10,CW-8,2); }
    if(layer==='back'){ this.drawCars(z,false); this.drawPole(z); }
    if(layer==='front'){ this.drawCars(z,true); if(z.cop) this.drawCop(z); }
    if(layer==='ui'&&z.v!==1&&G.hero.x<cx+CW){ const left=Math.ceil(this.left(z)); }
  },
  // столб со светофором для пешеходов: цвет дублирован формой (ладонь / человечек), табло-отсчёт 9…0
  drawPole(z){ if(z.v===2) return; const g=st4Geo(), x=Math.round(z.cx-6-G.cam), base=z.y0-3; if(x<-30||x>W+30) return; const ph=this.phase(z), blink=ph==='green'&&this.left(z)<2&&Math.floor(G.t*4)%2;
    ctx.fillStyle=P.ink; ctx.fillRect(x-2,base-56,4,56); ctx.fillStyle='#5a5a68'; ctx.fillRect(x-1,base-56,2,56);
    
    const bx=x-7, by=base-78; ctx.fillStyle=P.ink; ctx.fillRect(bx-1,by-1,16,26); ctx.fillStyle='#2a2a34'; ctx.fillRect(bx,by,14,24);
    if(ph==='broken'){ const on=Math.floor(G.t*2)%2; ctx.fillStyle=on?'#ffb21f':'#4a3a1a'; ctx.fillRect(bx+3,by+8,8,8); G.labels.push(['--',x+16,by+12,7,'#ffb21f','left',P.ink]); return; }
    // ладонь (красная) сверху
    const red=ph==='red'; ctx.fillStyle=red?'#ff3a3a':'#3a1a1a'; ctx.fillRect(bx+4,by+3,6,6); ctx.fillRect(bx+3,by+5,1,3); for(let k=0;k<4;k++) ctx.fillRect(bx+4+k*2-(k>1?1:0),by+1,1,2);
    // человечек (зелёный) снизу
    const gc=(!red&&!blink)?'#3aff7a':'#14361e'; ctx.fillStyle=gc; ctx.fillRect(bx+6,by+13,2,2); ctx.fillRect(bx+5,by+15,4,4); ctx.fillRect(bx+4,by+19,2,3); ctx.fillRect(bx+8,by+19,2,3);
    const n=Math.min(9,Math.ceil(this.left(z))); ctx.fillStyle=P.ink; ctx.fillRect(bx+15,by+4,13,13); ctx.fillStyle='#120c18'; ctx.fillRect(bx+16,by+5,11,11); G.labels.push([String(n),bx+21,by+11,8,red?'#ff6a5a':blink?'#ffe14a':'#3aff7a','center',null,undefined,base]); },
  // регулировщик: жезл (вверх — стоять, вбок — идти) + значок над головой (ладонь/человечек)
  drawCop(z){ const c=z.cop, x=Math.round(c.x-G.cam), y=Math.round(c.y-c.z), gr=this.green(z); ctx.fillStyle=P.ink;
    if(gr){ ctx.fillRect(x+4,y-28,15,4); for(let k=0;k<4;k++){ ctx.fillStyle=k%2?'#fff':'#e8303a'; ctx.fillRect(x+5+k*3.5|0,y-27,3,2); } }
    else { ctx.fillRect(x+5,y-50,4,22); for(let k=0;k<5;k++){ ctx.fillStyle=k%2?'#fff':'#e8303a'; ctx.fillRect(x+6,y-49+k*4,2,3); } }
    const bx=x-7, by=y-66; ctx.fillStyle=P.ink; ctx.fillRect(bx-1,by-1,16,13); ctx.fillStyle='#fff'; ctx.fillRect(bx,by,14,11); ctx.fillRect(bx+5,by+11,4,2);
    ctx.fillStyle=gr?'#1aa84a':'#e8303a'; if(gr){ ctx.fillRect(bx+6,by+1,2,2); ctx.fillRect(bx+5,by+3,4,4); ctx.fillRect(bx+4,by+7,2,3); ctx.fillRect(bx+8,by+7,2,3); } else { ctx.fillRect(bx+4,by+4,6,5); ctx.fillRect(bx+3,by+6,1,2); for(let k=0;k<4;k++) ctx.fillRect(bx+4+k*2-(k>1?1:0),by+2,1,2); } },
  bot(z){ const h=G.hero, cx=z.cx, CW=z.cw, mid=(z.y0+z.y1)/2; if(h.x>cx+CW+6) return null;
    if(h.x<cx-16) return {x:cx-10,y:mid}; // цель за порогом ветки (иначе в снегу бот замирал в 3 px от порога)
    const vx=cx+CW/2; const danger=z.vc.some(q=>q.y<h.y&&h.y-q.y<44&&q.y>z.y0-30); const go=z.v===1?!danger:this.green(z)&&(this.left(z)>2.2||h.x>cx+8);
    if(h.x<cx+2&&!go) return {x:cx-14,y:mid};
    return {x:cx+CW+24,y:mid}; } };
// ---------- M2-3: стройка — яма с досками (баланс 2–3 с) или обход по грязи ×0.6; забор «ВЕДУТСЯ РАБОТЫ» ----------
SEV.works={ title:z=>'РЕМОНТ ТРОТУАРА',
  init(z,r){ const PW=104, px=Math.round(z.len*(.46+r()*.1)); z.px=px; z.pw=PW; z.noSign=[[px-30,px+PW+30]]; z.fy=z.y0+9; z.my=z.y1-9; z.by=Math.round((z.fy+z.my)/2); z.lean=0; z.drift=0; z.onB=0; z.botMud=r()<.35; z.mudFx=[];
    for(const e of z.npcs){ if(e.x>px-14&&e.x<px+PW+14) e.x=e.x<px+PW/2?px-20-rnd(0,40):px+PW+20+rnd(0,40); e.lim=e.x<px?[8,px-12]:[px+PW+12,z.len-10]; } },
  inPit(z,x){ return x>z.px&&x<z.px+z.pw; },
  update(z,dt){ const h=G.hero, s=stickVec(); z.slow=1; h.dirty=Math.max(0,(h.dirty||0)-dt);
    const was=z.onB; z.onB=0;
    if(this.inPit(z,h.x)&&!h.stun){
      if(h.y<z.fy) h.y=z.fy; // забор
      if(h.y>=z.my-1){ z.slow=.6; if(Math.hypot(h.vx,h.vy)>6&&Math.random()<dt*10) z.mudFx.push({x:h.x+rnd(-4,4),y:h.y,t:.4}); if(!z.mudTip){ z.mudTip=1; tev('works_mud'); say('Грязь — медленно, но надёжно',1.6,'#ffd23f'); } }
      else if(Math.abs(h.y-z.by)<=4){ // на доске: держим равновесие стиком ↑/↓
        z.onB=1; h.y=z.by; z.slow=.55; if(!was){ z.lean=(Math.random()<.5?-1:1)*.15; tev('works_board'); }
        z.drift+=(Math.random()-.5)*dt*3; z.drift=clamp(z.drift,-.6,.6);
        z.lean+=(z.drift+Math.sign(z.lean)*(.35+Math.abs(z.lean)*.9)+s.y*2.2)*dt;
        if(Math.abs(z.lean)>=1) this.fall(z);
      } else { // в яму с края не войти: конусы/бровка
        h.y=h.y<z.by?Math.min(h.y,z.by-5)*0+(z.by+(h.y<z.by?-5:5)):h.y; if(h.x<z.px+8) h.x=z.px; else if(h.x>z.px+z.pw-8) h.x=z.px+z.pw; else h.y=Math.abs(h.y-z.by)<Math.abs(h.y-z.my)?z.by:z.my; }
    }
    if(!z.onB) z.lean*=Math.max(0,1-dt*6);
    for(const f of z.mudFx) f.t-=dt; z.mudFx=z.mudFx.filter(f=>f.t>0); },
  fall(z){ const h=G.hero; tev('works_fall'); penalize(8,'pit'); h.dirty=10; h.stun=.9; h.set('hurt'); SFX.heavy(); shake(3); haptic('error'); pop('ПЛЮХ!',h.x,h.y-48,'#c8a070',9); say('Упал в яму! −8 с, ноги в грязи',2,'#ff8a8a'); z.lean=0; z.drift=0; h.x=z.px-6; h.y=z.by; },
  prog(z){ return G.hero.x+(z.onB?z.t*4:0); },
  unstick(z){ const h=G.hero; if(this.inPit(z,h.x)||Math.abs(h.x-z.px)<20){ h.x=z.px+z.pw+12; h.y=z.by; return true; } },
  goal(z){ const h=G.hero; if(h.x>z.px+z.pw) return null; if(z.onB) return 'Держи равновесие: ↑ / ↓'; return h.x>z.px-90?'Яма: по доске (баланс) или по грязи (медленно)':null; },
  tip:z=>'на доске держи равновесие стиком вверх/вниз; грязь медленнее, зато без риска',
  draw(z,layer){ const sx=Math.round(z.px-G.cam), PW=z.pw; if(sx>W+40||sx+PW<-40) return;
    if(layer==='ground'){ const y0=z.y0+1, y1=z.my-2;
      ctx.fillStyle=P.ink; ctx.fillRect(sx-1,y0-1,PW+2,y1-y0+2); ctx.fillStyle='#4a3424'; ctx.fillRect(sx,y0,PW,y1-y0); ctx.fillStyle='#2e2018'; ctx.fillRect(sx+3,y0+3,PW-6,y1-y0-4); ctx.fillStyle='#5e4430'; for(let i=0;i<PW;i+=7) ctx.fillRect(sx+i+2,y0,3,1);
      ctx.fillStyle='#7a5a3a'; ctx.fillRect(sx,z.my-2,PW,z.y1-z.my+6); ctx.fillStyle='#5a4028'; for(let i=0;i<PW;i+=9) ctx.fillRect(sx+i+(i%2?3:0),z.my+2+(i%3),5,1); ctx.fillStyle='#9a8a6a'; for(let i=4;i<PW;i+=23) ctx.fillRect(sx+i,z.my+5,3,1);
      // доска
      const tilt=z.onB?Math.round(z.lean*2):0, by=z.by+1; ctx.fillStyle=P.ink; ctx.fillRect(sx-4,by-3,PW+8,6); ctx.fillStyle='#b08850'; ctx.fillRect(sx-3,by-2,PW+6,4); ctx.fillStyle='#d0a868'; ctx.fillRect(sx-3,by-2+(tilt>0?1:0),PW+6,1); ctx.fillStyle='#7a5a30'; for(let i=18;i<PW;i+=26){ ctx.fillRect(sx+i,by-2,1,4); } ctx.fillStyle='#3a3a44'; ctx.fillRect(sx,by-1,1,1); ctx.fillRect(sx+PW-1,by-1,1,1);
      for(const f of z.mudFx){ ctx.fillStyle='#5a4028'; ctx.fillRect(Math.round(f.x-G.cam),Math.round(f.y-6*(.4-f.t)*4),2,1); } }
    if(layer==='back'){ // забор с плакатом
      const fy=z.y0-1; for(let i=0;i<PW;i+=16){ ctx.fillStyle=P.ink; ctx.fillRect(sx+i,fy-22,15,23); ctx.fillStyle='#e8e4d8'; ctx.fillRect(sx+i+1,fy-21,13,21); ctx.fillStyle='#e8303a'; for(let k=0;k<3;k++) ctx.fillRect(sx+i+1,fy-20+k*7,13,3); ctx.fillStyle='#5a5a68'; ctx.fillRect(sx+i+6,fy,3,2); }
      const tw=Math.ceil(txtW('ВЕДУТСЯ РАБОТЫ',7))+10; ctx.fillStyle=P.ink; ctx.fillRect(sx+PW/2-tw/2-1|0,fy-38,tw+2,14); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx+PW/2-tw/2|0,fy-37,tw,12); G.labels.push(['ВЕДУТСЯ РАБОТЫ',sx+PW/2|0,fy-31,7,P.ink,'center',null,undefined,fy]);
      for(const [cx,cy] of [[sx-6,z.fy+1],[sx-6,z.my-6],[sx+PW+1,z.fy+1],[sx+PW+1,z.my-6]]) atlDraw(ctx,'pr','cone',cx,cy-6,false,1.6); }
    if(layer==='ui'&&z.onB){ const h=G.hero, hx=Math.round(h.x-G.cam), hy=Math.round(h.y+7); ctx.fillStyle=P.ink; ctx.fillRect(hx-17,hy-1,34,6); ctx.fillStyle='#2a2440'; ctx.fillRect(hx-16,hy,32,4); ctx.fillStyle='#3aff7a'; ctx.fillRect(hx-6,hy,12,4); const nx=hx+Math.round(clamp(z.lean,-1,1)*15); ctx.fillStyle=Math.abs(z.lean)>.6?'#ff3a3a':'#fff'; ctx.fillRect(nx-1,hy-2,2,8);
      if(Math.abs(z.lean)>.35) G.labels.push([z.lean>0?'↑':'↓',hx+22,hy+2,9,'#ffe14a','center',P.ink]); } },
  bot(z){ const h=G.hero; if(h.x>z.px+z.pw+4) return null; if(z.botMud) return h.x<z.px-2&&h.y<z.y1-3?{x:z.px-12,y:z.y1-1}:{x:z.px+z.pw+20,y:z.y1-1};
    if(h.x<z.px-2&&Math.abs(h.y-z.by)>2) return {x:z.px-12,y:z.by}; if(z.onB) return {stick:{x:.9,y:clamp(-z.lean*2.2,-1,1)}}; return {x:z.px+z.pw+20,y:z.by}; } };
// лужа: тёмная вода с отражением неба и кругами от капель
function st4Puddle(x,y,w,h){ ctx.fillStyle='#2a3448'; ctx.fillRect(x+3,y,w-6,h); ctx.fillRect(x,y+1,w,h-2); ctx.fillStyle='#4a5e80'; ctx.fillRect(x+4,y+1,w-8,h-2); ctx.fillStyle='#8fb0d8'; ctx.fillRect(x+6,y+1,Math.round(w*.3),1); ctx.fillRect(x+Math.round(w*.55),y+h-3,Math.round(w*.2),1);
  const k=Math.floor(G.t*3+x)%3; ctx.fillStyle='#b8d4f0'; const rx=x+6+((x*7+Math.floor(G.t*3)*13)%Math.max(1,w-14)); if(k===0) ctx.fillRect(rx,y+2,1,1); else { ctx.fillRect(rx-k,y+2,1,1); ctx.fillRect(rx+k,y+2,1,1); } }
// ---------- M2-4: лужи + машина обрызгивает (только дождь): тень/звук/«!» за 1.2 с; уйти вглубь, иначе −5 с и мокрый ----------
SEV.puddle={ title:z=>'ЛУЖИ У БОРДЮРА',
  init(z,r){ z.pd=[]; let x=Math.round(z.len*.22); while(x<z.len-160){ const n=1+Math.floor(r()*2); z.pd.push({x,w:28*n}); x+=Math.round(150+r()*170); } z.splT=2.5; z.warn=null; z.fxS=[]; },
  update(z,dt){ const h=G.hero; h.wetT=Math.max(0,(h.wetT||0)-dt); const kerbY=z.y1-13;
    // наступил в лужу — «хлюп», без штрафа
    for(const p of z.pd){ if(Math.abs(h.x-p.x-p.w/2)<p.w/2&&h.y>z.y1-6){ if(!p.step){ p.step=1; tev('puddle_step'); pop('ХЛЮП',h.x,h.y-44,'#9ad0ff',7); h.wetT=Math.max(h.wetT,1.5); } } else p.step=0; }
    if(!z.warn){ z.splT-=dt; const tp=z.pd.find(p=>{ const d=p.x+p.w/2-h.x; return d>-p.w/2&&d<90; }); if(z.splT<=0&&tp&&h.x<z.len-140){ const dir=Math.random()<.55?1:-1; z.tp=tp; z.warn={dir,t:1.2}; try{ tone(140,.5,'sawtooth',.08); }catch(e){} tev('puddle_warn');
        const sx=dir>0?G.cam-70:G.cam+W+10, dist=Math.abs(tp.x+tp.w/2-sx), v=Math.max(220,dist/1.2); z.cars.push({spr:pick(['taxi','car_sedan','car_hatch']),dir,x:dir>0?sx-60:sx,v,w:60,spl:1,done:[]}); } }
    else { z.warn.t-=dt; if(z.warn.t<-1.2){ if(!z.warn.hit) z.tutW=(z.tutW||0)+1; z.warn=null; z.splT=rnd(3.2,5); } }
    for(const q of z.cars){ if(!q.spl) continue; const fx=q.dir>0?q.x+q.w:q.x; for(let i=0;i<z.pd.length;i++){ const p=z.pd[i]; if(q.done.includes(i)) continue; const pc=p.x+p.w/2; if((q.dir>0&&fx>=pc)||(q.dir<0&&fx<=pc)){ q.done.push(i); if(pc<G.cam-40||pc>G.cam+W+40) continue;
          for(let k=0;k<14;k++) z.fxS.push({x:pc+rnd(-p.w/2,p.w/2),y:z.y1+2,vx:rnd(-20,20)+q.dir*30,vy:-rnd(60,120),t:.7}); try{ SFX.whiff(); }catch(e){}
          if(Math.abs(h.x-pc)<p.w/2+16&&h.y>kerbY&&!h.stun){ if(z.warn) z.warn.hit=1; tev('puddle_splash'); penalize(5,'splash'); h.wetT=60; TR.nerves=Math.max(0,TR.nerves-4); h.stun=.4; h.set('hurt'); haptic('error'); pop('ПЛЮХ! −5 с',h.x,h.y-50,'#9ad0ff',8); say('Обрызгали! Держись дальше от бордюра',2,'#9ad0ff'); } } } }
    for(const f of z.fxS){ f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy+=300*dt; f.t-=dt; } z.fxS=z.fxS.filter(f=>f.t>0); },
  goal(z){ return z.warn&&z.warn.t>0?'Машина! Отойди от бордюра ↑':null; },
  tip:z=>'на «!» уходи вглубь тротуара — от бордюра; в лужу наступать можно',
  draw(z,layer){ const c=G.cam;
    if(layer==='ground'){ for(const p of z.pd){ const sx=Math.round(p.x-c); if(sx>W+60||sx+p.w<-60) continue; st4Puddle(sx,z.y1-4,p.w,7); st4Puddle(sx+8,z.y1+4,p.w-12,5); }
      if(z.warn&&z.warn.t>0){ const g=st4Geo(); ctx.fillStyle='rgba(255,246,192,'+(.25+.15*Math.sin(G.t*20))+')'; const bx=z.warn.dir>0?0:W-90; ctx.fillRect(bx,g.roadY+2,90,14); } }
    if(layer==='ui'){ for(const f of z.fxS){ ctx.fillStyle=f.t>.35?'#9ad0ff':'#5a90d0'; ctx.fillRect(Math.round(f.x-c),Math.round(f.y),2,2); }
      if(z.warn&&z.warn.t>0){ ctx.globalAlpha=.8+.2*Math.abs(Math.sin(G.t*9)); const x=z.warn.dir>0?SA.l+24:W-SA.r-24, y=z.y0-14; ctx.fillStyle='#e8303a'; ctx.fillRect(x-10,y-11,20,22); ctx.fillStyle=P.ink; ctx.fillRect(x-8,y-9,16,18); ctx.fillStyle='#ffd23f'; ctx.fillRect(x-7,y-8,14,16); ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-6,2,8); ctx.fillRect(x-1,y+4,2,2); ctx.globalAlpha=1; } } },
  bot(z){ const h=G.hero; const mid=(z.y0+z.y1)/2; if(z.warn&&z.warn.t>-0.6) return {x:h.x+20,y:z.y0+3}; return {x:z.len,y:mid}; } };
// ---------- M2-5: гололёд (только снег): инерция ~0.6 с, резкая смена направления → падение −4 с; посыпанные песком полосы безопасны ----------
SEV.ice={ title:z=>'ГОЛОЛЁД',
  init(z,r){ z.ic=[]; let x=Math.round(z.len*.2); while(x<z.len-180){ const w=Math.round(120+r()*110), lane=Math.floor(r()*3), sy=Math.round(z.y0+4+lane*(z.y1-z.y0-8)/2); z.ic.push({x,w,sy}); x+=w+Math.round(110+r()*140); } z.fallCd=0; },
  on(z){ const h=G.hero; return z.ic.find(p=>h.x>p.x&&h.x<p.x+p.w); },
  sand(p,y){ return Math.abs(y-p.sy)<=5; },
  update(z,dt){ const h=G.hero, s=stickVec(), p=this.on(z); z.fallCd-=dt; const slick=p&&!this.sand(p,h.y)&&!h.stun; z.wet=!!slick;
    if(slick){ if(!z.tipd){ z.tipd=1; tev('ice_on'); say('Скользко! Не дёргайся — или иди по песку',1.8,'#bfe6ff'); }
      const v=Math.hypot(h.vx,h.vy), sm=Math.hypot(s.x,s.y); if(v>34&&sm>.5&&z.fallCd<=0){ const dot=(h.vx*s.x+h.vy*s.y)/(v*sm); if(dot<-.2) this.fall(z); } }
    if(h.stun<=0&&z.fell){ z.fell=0; } },
  fall(z){ const h=G.hero; tev('ice_fall'); penalize(4,'ice'); h.stun=1; h.vx=0; h.vy=0; h.set('hurt'); SFX.land(); shake(2); haptic('error'); pop('ОЙ! −4 с',h.x,h.y-50,'#bfe6ff',8); say('Поскользнулся! Плавнее — или по песку',1.8,'#bfe6ff'); z.fallCd=1.6; z.fell=1; },
  goal(z){ const p=this.on(z); return p&&!this.sand(p,G.hero.y)?'Лёд: плавно, без резких разворотов':null; },
  tip:z=>'на льду не меняй направление резко; полоса песка — безопасна',
  draw(z,layer){ const c=G.cam; if(layer!=='ground') return; for(const p of z.ic){ const sx=Math.round(p.x-c); if(sx>W+20||sx+p.w<-20) continue; const y0=z.y0-3, y1=z.y1+4;
      ctx.fillStyle='rgba(200,230,255,.55)'; ctx.fillRect(sx,y0,p.w,y1-y0); for(let x=0;x<p.w;x+=16) for(let y=y0;y<y1-6;y+=10) atlDraw(ctx,'pr','ice',sx+x,y+((x/16)%2?4:0));
      ctx.fillStyle='rgba(255,255,255,.7)'; for(let i=6;i<p.w;i+=29){ ctx.fillRect(sx+i,y0+3+(i%7),6,1); }
      ctx.fillStyle='#8a6a48'; ctx.fillRect(sx,p.sy-5,p.w,10); ctx.fillStyle='#b08a5a'; for(let i=0;i<p.w;i+=3) ctx.fillRect(sx+i,p.sy-5+((i*7)%9),1,1); ctx.fillStyle='#6a4e34'; for(let i=1;i<p.w;i+=5) ctx.fillRect(sx+i,p.sy-4+((i*5)%8),1,1); } },
  bot(z){ const h=G.hero; const nx=z.ic.find(p=>p.x+p.w>h.x-2); if(!nx) return null; if(h.x<nx.x-40) return null; return {x:h.x+30,y:nx.sy}; } };
// ---------- M2-6: промоутер-ловушка (не в ливень): модалка 3 реплики «НЕТ»/«БЕРУ ЛИСТОВКУ»; обход по дуге; шаурма/опрос/петиция ----------
const PROMO_V=[{sign:'ШАУРМА −20%',col:'#e8a020',t:'ШАУРМА',l:['Эй, привет! Шаурма −20%, только сегодня, только до девяти!','Ну хоть листовочку возьми! Там купон на соус!','Ладно-ладно… приятного дня!']},
  {sign:'ОПРОС',col:'#3d6ff0',t:'ОПРОС',l:['Добрый день! Небольшой опрос — всего одна минутка!','Ну пожалуйста, всего три вопроса! Возьмите хоть анкету!','Эх… хорошего дня!']},
  {sign:'ПЕТИЦИЯ',col:'#1aa84a',t:'ПЕТИЦИЯ',l:['Подпишите петицию за новый пешеходный переход!','Это же для всех! Возьмите хотя бы листовку!','Ну и ладно. Удачи вам!']}];
SEV.promo={ title:z=>'ПРОМОУТЕР · '+PROMO_V[z.v||0].t,
  init(z,r){ const px=Math.round(z.len*(.5+r()*.1)); const e=mkNpc('polite',px,(z.y0+z.y1)/2); e.ctl=1; e.face=-1; e.promo=1; e.noSolid=true; if(!(z.v||0)) e.atl='promo'; z.npcs.push(e); z.pm=e; z.pmNo=0; z.pmDone=0;
    for(const q of z.npcs){ if(q!==e&&Math.abs(q.x-px)<30) q.x=px+(q.x<px?-40:40); } },
  update(z,dt){ const h=G.hero, e=z.pm; if(z.pmDone){ if(e.leave){ e.x-=30*dt; e.y=Math.max(z.y0,e.y-12*dt); e.face=-1; e.set('walk'); } return; }
    const dx=e.x-h.x, mid=(z.y0+z.y1)/2; if(dx>-6&&dx<110){ const vy=clamp(h.y-e.y,-1,1)*14; e.y=clamp(e.y+vy*dt,mid-6,mid+6); e.face=-1; e.set(Math.abs(h.y-e.y)>2?'walk':'idle'); if(dx<60&&!e.sh){ e.sh=1; bubble(e,'Минутку!',1.2,'#ffd23f'); } }
    else e.set('idle');
    if(Math.abs(dx)<16&&Math.abs(h.y-e.y)<7&&!h.stun) this.talk(z); },
  talk(z){ const V=PROMO_V[z.v||0], self=this; tev('promo_catch'); const bye=()=>{ tev('promo_no2'); st4Modal({id:'promo_bye',title:V.t,text:V.l[2],spr:(z.v||0)?null:'promo_idle_0',auto:1.1,clock:1,onAuto:()=>self.leave(z)}); };
    const ask=()=>st4Modal({id:'promo',title:V.t,text:V.l[z.pmNo],spr:(z.v||0)?null:'promo_idle_0',clock:1,auto:6,onAuto:bye,opts:[['НЕТ','#a8264e',()=>{ z.pmNo++; if(z.pmNo>=2) bye(); else ask(); }],['БЕРУ ЛИСТОВКУ','#2aa860',()=>{ tev('promo_take'); TR.score+=2; penalize(2,'flyer'); pop('+2 очка',G.hero.x,G.hero.y-60,'#ffd23f',8); self.leave(z); }]]}); ask(); },
  leave(z){ z.pmDone=1; z.pm.leave=1; z.pm.ghost=true; G.hero.x+=4; },
  prog(z){ return G.hero.x+(TR.smod?z.t*10:0); },
  goal(z){ const h=G.hero, e=z.pm; return !z.pmDone&&e.x-h.x>0&&e.x-h.x<160?'Промоутер! Обойди по дуге — или говори «НЕТ»':null; },
  tip:z=>'обходи промоутера по дальнему краю тротуара; поймал — «НЕТ» дважды, и он отстанет',
  draw(z,layer){ const e=z.pm, V=PROMO_V[z.v||0]; if(layer==='front'&&(z.v||0)&&!z.pmDone){ const x=Math.round(e.x-G.cam)+(e.face<0?-12:6), y=Math.round(e.y)-26; ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,8,11); ctx.fillStyle='#c8a070'; ctx.fillRect(x,y,6,9); ctx.fillStyle='#fff'; ctx.fillRect(x+1,y+2,4,6); ctx.fillStyle='#5a5a68'; ctx.fillRect(x+2,y,2,2); ctx.fillStyle=V.col; ctx.fillRect(x+1,y+3,3,1); ctx.fillRect(x+1,y+5,4,1); }
    if(layer==='back'&&!z.pmDone){ const sx=Math.round(e.x+18-G.cam), by=z.y0-2; if(sx<-40||sx>W+40) return; // штендер
      const tw=Math.ceil(txtW(V.sign,6))+8; ctx.fillStyle=P.ink; ctx.fillRect(sx-1,by-25,tw+2,22); ctx.fillStyle='#fff8e8'; ctx.fillRect(sx,by-24,tw,20); ctx.fillStyle=V.col; ctx.fillRect(sx,by-24,tw,4); ctx.fillStyle=P.ink; ctx.fillRect(sx+2,by-3,2,4); ctx.fillRect(sx+tw-4,by-3,2,4); G.labels.push([V.sign,sx+tw/2,by-12,6,P.ink,'center',null,undefined,by]); } },
  front(z){},
  bot(z){ const h=G.hero, e=z.pm; if(z.pmDone||e.x<h.x-10) return null; if(TR.smod) return {x:h.x,y:h.y,a:1}; if(z.botFar===undefined) z.botFar=h.y>(z.y0+z.y1)/2?z.y1:z.y0; const blk=z.npcs.some(q=>q!==e&&!q.ctl&&q.x-h.x>-2&&q.x-h.x<26&&Math.abs(q.y-h.y)<8); if(blk) z.botSide=1.2; else if(z.botSide>0) z.botSide-=1/60; return {x:e.x+40,y:z.botSide>0?z.botFar+(z.botFar===z.y1?-15:15):z.botFar}; } };
// ---------- M2-7: ДТП — кольцо зевак; объезд дворами (арка, мусорки, кот, код-ворота 30% закрыты → соседняя арка) или ТОЛКНУТЬ сквозь ----------
function st4Arch(sx,yb,w,h,lit){ ctx.fillStyle=P.ink; ctx.fillRect(sx-2,yb-h-2,w+4,h+2); ctx.fillStyle='#8a7a6a'; ctx.fillRect(sx-1,yb-h-1,w+2,h+1); ctx.fillStyle='#1a1420'; ctx.fillRect(sx+2,yb-h+4,w-4,h-4); ctx.fillRect(sx+5,yb-h+1,w-10,3);
  ctx.fillStyle='#2e2636'; ctx.fillRect(sx+6,yb-h+8,w-12,h-8); ctx.fillStyle=lit||'#5a7a4a'; ctx.fillRect(sx+10,yb-h+12,w-20,h-12); ctx.fillStyle='#3a2a44'; ctx.fillRect(sx+2,yb-2,w-4,2); }
function st4Cat(x,y,st,face){ x=Math.round(x); y=Math.round(y); const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(face<0?x-a-w:x+a,y+b,w,h); };
  f(-6,-6,12,6,P.ink); f(-5,-5,10,4,'#e8902a'); f(3,-9,6,6,P.ink); f(4,-8,4,4,'#e8902a'); f(4,-10,1,2,P.ink); f(7,-10,1,2,P.ink); f(6,-7,1,1,P.ink); f(-9,st==='run'?-7:-9,4,st==='run'?2:5,P.ink); f(-8,st==='run'?-7:-8,2,st==='run'?1:3,'#e8902a');
  f(-4,-4,6,1,'#f0b060'); if(st==='run'){ f(-5,0,2,1,P.ink); f(3,0,2,1,P.ink); } else { f(-5,0,2,1,P.ink); f(1,0,2,1,P.ink); f(3,0,2,1,P.ink); } }
SEV.crash={ title:z=>z.yard?'ДВОР':'ДТП · ЗЕВАКИ',
  init(z,r){ const ax=Math.round(z.len*(.5+r()*.08)), CW=84; z.ax=ax; z.cw=CW; z.noSign=[[ax-30,ax+CW+30]]; z.archX=ax-118; z.arch2X=ax+CW+44; z.ring=[]; z.botYard=r()<.5; z.codeClosed=r()<.3; z.yrng=r;
    for(const e of z.npcs){ if(e.x>z.archX-20&&e.x<z.arch2X+60) e.x=e.x<ax?z.archX-30-rnd(0,60):z.arch2X+70+rnd(0,60); e.lim=e.x<ax?[8,ax-14]:[ax+CW+14,z.len-10]; }
    const LOOK=['smoker','polite','fat','tourist','nastya','musician','colleague','student','seed','trainee','courier','kid','baba','seeds','polite','bag'], ATLC=['smoker','fat','nastya','colleague','seed','courier','baba']; for(let i=LOOK.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [LOOK[i],LOOK[j]]=[LOOK[j],LOOK[i]]; }
    for(let c=0;c<4;c++) for(let k=0;k<4;k++){ const lk=LOOK[c*4+k], isA=ATLC.includes(lk)&&atlOk('ch'); const e=mkNpc(isA?'polite':lk,ax+8+c*22+(k%2)*7,z.y0+2+k*((z.y1-z.y0-4)/3)); if(isA){ e.atl=lk; if(r()<.4) e.atlSt='surprised'; } e.anT=r()*3; e.ctl=1; e.pin=true; e.m=3; e.face=c<2?1:-1; e.onlook=1; e.free=1; z.npcs.push(e); z.ring.push(e); }
    z.carsOff=1; z.cars2=[{spr:'car_sedan',x:ax+6,flip:false},{spr:'car_hatch',x:ax+CW-50,flip:true}]; z.smk=[]; },
  update(z,dt){ const h=G.hero; if(z.yard) return this.yUpd(z,dt);
    for(const e of z.ring){ e.set('idle'); e.face=e.x<z.ax+z.cw/2?1:-1; } z.bubT=(z.bubT===undefined?1:z.bubT)-dt; if(z.bubT<=0){ z.bubT=2.4; const e=pick(z.ring); bubble(e,pick(['Ого…','Снимаю!','Кто виноват?','Страховая едет','Я всё видел!']),1.6,'#fff'); }
    if(Math.random()<dt*6) z.smk.push({x:z.ax+z.cw/2+rnd(-14,14),y:st4Geo().carY-18,t:1.4}); for(const s of z.smk){ s.t-=dt; s.y-=10*dt; s.x+=4*dt; } z.smk=z.smk.filter(s=>s.t>0);
    if(h.x>z.ax-30&&h.x<z.ax+z.cw&&!z.tipd){ z.tipd=1; say('Зеваки! ТОЛКАЙ сквозь — или во двор через арку ←',2.2,'#ffd23f'); }
    if(h.x>z.ax+z.cw+4&&!z.through){ z.through=1; tev('crash_through'); } },
  ctx(z){ const h=G.hero; if(!z.yard&&Math.abs(h.x-(z.archX+20))<20&&h.y<z.y0+10) return {b:{label:'ВО ДВОР',col:'#3a6ad8',fn:()=>this.enterYard(z)}};
    if(z.yard&&z.codeClosed&&Math.abs(h.x-(z.yd.a2+20))<22&&h.y<z.y0+10) return {b:{label:'В АРКУ',col:'#3a6ad8',fn:()=>this.exitYard(z,1)}}; return null; },
  enterYard(z){ const h=G.hero, L=Math.round(Math.max(W,420)*1.25); tev('yard_in'); z.st={len:z.len,npcs:z.npcs,cars:z.cars}; z.yard=1; z.block=1; z.len=L; z.cars=[]; z.yd={L,gate:Math.round(L*.72),a2:Math.round(L*.5),cat:{x:L*.3,y:z.y0+6,st:'sit',f:-1},bins:[[Math.round(L*.18),z.y0],[Math.round(L*.18)+18,z.y0]]};
    const g=z.yd.gate, ym=(z.y0+z.y1)/2; z.solids=[[z.yd.bins[0][0]-7,z.y0-4,z.yd.bins[1][0]+9,z.y0+7]]; for(let y=z.y0-6;y<=z.y1+6;y+=3){ if(!z.codeClosed&&Math.abs(y-ym)<9) continue; const x=g+(y-z.y0)*.8; z.solids.push([x-2,y-2,x+3,y+2]); }
    z.npcs=[]; const gr=mkNpc('granny',L*.42,z.y0+2); gr.ctl=1; gr.face=1; gr.ghost=true; z.npcs.push(gr); h.x=26; h.y=ym; G.cam=-Math.round(W*.2); TR.fade=.45; say(z.codeClosed?'Двор. Ворота на код? Глянем…':'Двор: через ворота — к метро',1.6,'#bfe6ff'); },
  exitYard(z,viaArch){ const h=G.hero; tev(viaArch?'yard_arch2':'yard_gate'); z.len=z.st.len; z.npcs=z.st.npcs; z.cars=z.st.cars||[]; z.solids=[]; z.yard=0; z.block=0; z.yardDone=1; h.x=z.arch2X+20+(viaArch?40:0); h.y=z.y0+3; G.cam=clamp(h.x-W*.42,-Math.round(W*.25),Math.max(0,z.len-W)); TR.fade=.45; if(viaArch) say('Через соседнюю арку — на улицу',1.4,'#bfe6ff'); },
  yUpd(z,dt){ const h=G.hero, Y=z.yd, c=Y.cat, g=Y.gate;
    const d=Math.hypot(h.x-c.x,(h.y-c.y)*2); if(c.st!=='run'&&d<34){ c.st='run'; c.f=h.x<c.x?1:-1; pop('МЯУ!',c.x,c.y-16,'#ffd23f',7); tev('yard_cat'); try{ tone(1200,.08,'triangle',.1); tone(900,.12,'triangle',.1,0,.08); }catch(e){} }
    if(c.st==='run'){ c.x+=c.f*90*dt; c.y=Math.max(z.y0-2,c.y-20*dt); }
    if(z.codeClosed&&h.x>g-14&&!z.lockTip){ z.lockTip=1; tev('yard_locked'); say('Ворота на коде! Соседняя арка ← в стене',2,'#ffd23f'); }
    if(!z.codeClosed&&h.x>Y.L-24) this.exitYard(z,0); },
  prog(z){ return (z.yard?z.ax+G.hero.x*.3:G.hero.x)+(z.yardDone?400:0); },
  unstick(z){ const h=G.hero; if(z.yard){ this.exitYard(z,z.codeClosed); return true; } if(h.x>z.ax-30&&h.x<z.ax+z.cw+10){ h.x=z.ax+z.cw+20; return true; } },
  goal(z){ const h=G.hero; if(z.yard) return z.codeClosed?(h.x>z.yd.a2+60?'Ворота на коде — вернись к арке ←':'Иди к арке в стене'):'Через двор к воротам →'; if(h.x<z.ax+z.cw&&h.x>z.archX-160&&!z.yardDone) return 'ДТП! Толкай сквозь зевак — или арка во двор ←'; return null; },
  tip:z=>'зеваки стоят стеной: ТОЛКНУТЬ (скандал растёт) или через арку во двор — дольше, но спокойно',
  draw(z,layer){ if(z.yard) return this.yDraw(z,layer); const g=st4Geo(), c=G.cam;
    if(layer==='ground'){ st4Arch(Math.round(z.archX-c),z.y0-6,40,34); st4Arch(Math.round(z.arch2X-c),z.y0-6,40,34); }
    if(layer==='front'){ for(const q of z.cars2){ const r=ATL4.tr&&ATL4.tr.f[q.spr]; const sx=Math.round(q.x-c), y=g.carY-(r?r[3]:24); atlDraw(ctx,'tr',q.spr,sx,y,q.flip); }
      const bl=Math.floor(G.t*3)%2; if(bl){ ctx.fillStyle='#ffb21f'; for(const q of z.cars2){ const sx=Math.round(q.x-c); ctx.fillRect(sx+2,g.carY-12,2,2); ctx.fillRect(sx+48,g.carY-12,2,2); } }
      const tx=Math.round(z.ax-28-c), ty=g.carY-2; ctx.fillStyle=P.ink; ctx.fillRect(tx-5,ty-8,11,9); ctx.fillStyle='#e8303a'; ctx.fillRect(tx-4,ty-7,9,7); ctx.fillStyle='#fff'; ctx.fillRect(tx-2,ty-4,5,3); ctx.fillStyle='#e8303a'; ctx.fillRect(tx-1,ty-3,3,1);
      ctx.fillStyle='#cfe8ff'; for(let i=0;i<9;i++) ctx.fillRect(Math.round(z.ax+z.cw/2-14+i*4-c),g.carY-1-(i%3),1,1);
      for(const s of z.smk){ ctx.globalAlpha=Math.min(.6,s.t*.5); ctx.fillStyle='#bdbdc8'; const r=Math.round(3+(1.4-s.t)*5); ctx.fillRect(Math.round(s.x-c-r/2),Math.round(s.y-r/2),r,r); ctx.globalAlpha=1; } } },
  yDraw(z,layer){ const Y=z.yd, c=G.cam, g=st4Geo();
    if(layer==='ground'){ // заменить улицу двором поверх
      ctx.fillStyle='#9ab0c8'; ctx.fillRect(0,0,W,g.facadeB); ctx.fillStyle='#c8bca8'; ctx.fillRect(0,0,W,z.y0-6); 
      for(let x=-((c*1)%48)-48;x<W+48;x+=48){ ctx.fillStyle='#b8ac98'; ctx.fillRect(Math.round(x),0,2,z.y0-6); for(let r=0;r<5;r++){ const wy=z.y0-26-r*30; if(wy<4) continue; ctx.fillStyle=P.ink; ctx.fillRect(Math.round(x)+14,wy-14,18,16); ctx.fillStyle=((Math.round((x+c)/48)+r)%3)?'#3d4a66':'#ffe39a'; ctx.fillRect(Math.round(x)+15,wy-13,16,14); ctx.fillStyle='#b8ac98'; ctx.fillRect(Math.round(x)+22,wy-13,2,14); } }
      for(let i=0;i<3;i++){ const px=Math.round(Y.L*(.12+i*.3)-c); ctx.fillStyle=P.ink; ctx.fillRect(px-1,z.y0-30,22,24); ctx.fillStyle='#6a4a3a'; ctx.fillRect(px,z.y0-29,20,23); ctx.fillStyle='#3a3a44'; ctx.fillRect(px+4,z.y0-34,12,4); ctx.fillStyle='#ffd23f'; ctx.fillRect(px+15,z.y0-18,2,2); }
      st4Arch(Math.round(Y.a2-c),z.y0-6,40,34,'#7a8aa8'); 
      ctx.fillStyle='#6a6a72'; ctx.fillRect(0,z.y0-6,W,H-z.y0+6); ctx.fillStyle='#5e5e66'; for(let x=-(c%37);x<W;x+=37) ctx.fillRect(Math.round(x),z.y0+((x|0)%11)+4,9,1);
      ctx.fillStyle='#4a7a3a'; ctx.fillRect(0,z.y1+6,W,H-z.y1); ctx.fillStyle='#5a9a4a'; for(let x=-(c%13);x<W;x+=13) ctx.fillRect(Math.round(x),z.y1+6,2,2);
      ctx.fillStyle='#3a3a44'; ctx.fillRect(0,z.y0-7,W,2); }
    if(layer==='back'){ for(const [bx,by] of Y.bins){ const sx=Math.round(bx-c); ctx.fillStyle=P.ink; ctx.fillRect(sx-7,by-14,16,15); ctx.fillStyle='#2a7a4a'; ctx.fillRect(sx-6,by-13,14,13); ctx.fillStyle='#1a5a34'; ctx.fillRect(sx-6,by-13,14,3); ctx.fillStyle='#e8e4d8'; ctx.fillRect(sx-2,by-8,6,2); }
      const gx=Math.round(Y.gate-c), ym=(z.y0+z.y1)/2, sk=y=>Math.round(gx+(y-z.y0)*.8); // забор уходит вглубь: перекос по глубине
      for(let y=z.y0-6;y<=z.y1+6;y+=3){ const open=!z.codeClosed&&Math.abs(y-ym)<9; if(open) continue; const x=sk(y); ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-27,4,28); ctx.fillStyle=(y%2)?'#7a7a8a':'#8a8a9a'; ctx.fillRect(x,y-26,2,26); ctx.fillStyle='#a8a8b8'; ctx.fillRect(x,y-26,1,2); }
      for(const ry of [-26,-14,-3]){ for(let y=z.y0-6;y<=z.y1+6;y++){ if(!z.codeClosed&&Math.abs(y-ym)<9) continue; ctx.fillStyle=P.ink; ctx.fillRect(sk(y)-1,y+ry,4,3); ctx.fillStyle='#5a5a6a'; ctx.fillRect(sk(y),y+ry+1,2,1); } }
      const px=sk(z.y0-7); ctx.fillStyle=P.ink; ctx.fillRect(px-2,z.y0-40,5,34); ctx.fillStyle='#6a6a78'; ctx.fillRect(px-1,z.y0-39,3,33);
      if(!z.codeClosed){ const lx=sk(ym-9); ctx.fillStyle='#5a5a6a'; ctx.fillRect(lx-12,ym-35,12,2); ctx.fillRect(lx-12,ym-12,12,2); for(let k=0;k<12;k+=3) ctx.fillRect(lx-12+k,ym-35,1,25); ctx.fillStyle='#1aa84a'; ctx.fillRect(px+4,z.y0-34,4,4); }
      else { ctx.fillStyle=P.ink; ctx.fillRect(px+3,z.y0-36,9,12); ctx.fillStyle='#5a5a68'; ctx.fillRect(px+4,z.y0-35,7,10); ctx.fillStyle='#e8303a'; ctx.fillRect(px+6,z.y0-34,3,2); ctx.fillStyle='#ccc'; for(let k=0;k<6;k++) ctx.fillRect(px+5+(k%3)*2,z.y0-31+Math.floor(k/3)*2,1,1); G.labels.push(['КОД',px+8,z.y0-44,6,'#ff8a8a','center',P.ink,undefined,z.y0-7]);
        const ax=Math.round(Y.a2+20-c); G.labels.push(['← НА УЛИЦУ',ax,z.y0-48,6,'#bfe6ff','center',P.ink,undefined,z.y0-7]); }
      const ct=Y.cat; if(ct.x>c-20&&ct.x<c+W+20) st4Cat(ct.x-c,ct.y,ct.st,ct.f);
      const bx=Math.round(Y.L*.42-c)-14; ctx.fillStyle=P.ink; ctx.fillRect(bx,z.y0-8,30,3); ctx.fillRect(bx+2,z.y0-5,2,4); ctx.fillRect(bx+26,z.y0-5,2,4); ctx.fillStyle='#a8743a'; ctx.fillRect(bx+1,z.y0-7,28,1); } },
  bot(z){ const h=G.hero; if(z.yard){ const Y=z.yd; if(z.codeClosed&&h.x>Y.gate-30) z.botBack=1; if(z.codeClosed&&(z.botBack||h.x>Y.a2+10)){ z.botBack=1; return Math.abs(h.x-(Y.a2+20))<14&&h.y<z.y0+8?{x:h.x,y:z.y0,b:1}:{x:Y.a2+20,y:z.y0}; } if(z.codeClosed&&!z.botSeen) return {x:Y.gate-20,y:(z.y0+z.y1)/2}; return {x:Y.L,y:(z.y0+z.y1)/2}; }
    if(z.yardDone||h.x>z.ax+z.cw+6) return null;
    if(z.botYard){ return Math.abs(h.x-(z.archX+20))<14&&h.y<z.y0+8?{x:h.x,y:z.y0,b:1}:{x:z.archX+20,y:z.y0}; }
    if(h.x>(z.botBX||0)+3){ z.botBX=h.x; z.botBT=0; } else if((z.botBT=(z.botBT||0)+1/60)>3) z.botYard=1; // застрял у зевак — во двор
    const near=z.ring.some(e=>e.x-h.x<20&&e.x-h.x>-4&&Math.abs(e.y-h.y)<10); return {x:z.ax+z.cw+30,y:(z.y0+z.y1)/2,a:near}; } };
// ---------- M2-8: голуби + бабушка кормит (не в дождь/снег): пробежал сквозь — взлёт, перья, скандал +6, −1 с; шагом по краю — расходятся ----------
SEV.pigeons={ title:z=>'ГОЛУБИ',
  init(z,r){ const cx=Math.round(z.len*(.5+r()*.08)); z.pcx=cx; const n=8+Math.floor(r()*7); z.pg=[]; z.pfx=[]; const ym=(z.y0+z.y1)/2;
    for(let i=0;i<n;i++) z.pg.push({x:cx+rnd(-34,34),y:clamp(ym+rnd(-9,9),z.y0+2,z.y1-2),st:'peck',t:rnd(0,2),f:Math.random()<.5?1:-1,z:0,vx:0,vy:0});
    const g=mkNpc('granny',cx,z.y0); g.ctl=1; g.face=1; g.atl='baba'; g.ghost=true; g.noSolid=true; z.npcs.push(g); z.gran=g; z.crT=0; z.crumbs=[];
    for(const e of z.npcs){ if(e!==g&&Math.abs(e.x-cx)<60) e.x=cx+(e.x<cx?-70:70); if(e!==g) e.lim=e.x<cx?[8,cx-50]:[cx+50,z.len-10]; } },
  update(z,dt){ const h=G.hero, sp=Math.hypot(h.vx||0,h.vy||0); z.crT-=dt;
    if(z.crT<=0&&!z.scared){ z.crT=rnd(.6,1.2); for(let k=0;k<4;k++) z.crumbs.push({x:z.gran.x+6,y:z.gran.y-20,vx:rnd(10,40)*(Math.random()<.5?-1:1),vy:-rnd(10,30),gy:z.gran.y+rnd(2,14),t:3}); }
    for(const c of z.crumbs){ if(c.y<c.gy){ c.x+=c.vx*dt; c.y+=c.vy*dt; c.vy+=160*dt; } c.t-=dt; } z.crumbs=z.crumbs.filter(c=>c.t>0);
    for(const p of z.pg){ p.t+=dt;
      if(p.st==='fly'){ p.x+=p.vx*dt; p.z+=p.vy*dt; p.vy=Math.min(90,p.vy+40*dt); continue; }
      const d=Math.hypot(h.x-p.x,(h.y-p.y)*1.5);
      if(d<16&&sp>42&&!h.stun){ this.scare(z); break; }
      if(d<20){ p.st='walk'; const a=Math.atan2(p.y-h.y,p.x-h.x); p.x+=Math.cos(a)*30*dt; p.y=clamp(p.y+Math.sin(a)*18*dt,z.y0,z.y1); p.f=Math.cos(a)>0?1:-1; }
      else if(p.t%3<.02) p.st=Math.random()<.6?'peck':'walk';
      if(p.st==='walk'&&d>=20){ p.x+=p.f*6*dt; if(Math.abs(p.x-z.pcx)>40) p.f=p.x>z.pcx?-1:1; } }
    z.pg=z.pg.filter(p=>p.z<260); for(const f of z.pfx){ f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy=Math.min(14,f.vy+20*dt); f.t-=dt; } z.pfx=z.pfx.filter(f=>f.t>0);
    if(!z.tipd&&Math.abs(h.x-z.pcx)<130&&h.x<z.pcx){ z.tipd=1; say('Голуби! Медленно по краю — не спугни',1.8,'#ffd23f'); } },
  scare(z){ const h=G.hero; if(z.scared) return; z.scared=1; tev('pigeons_scare'); TR.scandal+=6; penalize(1,'pigeons'); try{ SFX.whiff(); tone(300,.3,'sawtooth',.06); }catch(e){}
    for(const p of z.pg){ p.st='fly'; p.vx=(p.x<h.x?-1:1)*rnd(50,110); p.vy=rnd(30,60); p.f=p.vx>0?1:-1; for(let k=0;k<2;k++) z.pfx.push({x:p.x,y:p.y-6,vx:rnd(-12,12),vy:-rnd(4,14),t:rnd(1,1.8)}); }
    z.gran.angry=1; bubble(z.gran,pick(['Хулиган!','Ну куда ты бежишь?!','Голубей распугал!']),1.8,P.red); pop('ФРРР! −1 с',h.x,h.y-50,'#fff',8); },
  prog(z){ return G.hero.x; },
  goal(z){ const h=G.hero; return !z.scared&&Math.abs(h.x-z.pcx)<110?'Голуби: шагом и по краю (джойстик чуть-чуть)':null; },
  tip:z=>'не беги сквозь стаю — отклони джойстик слегка и обойди по краю',
  draw(z,layer){ const c=G.cam; if(layer==='back'){ ctx.fillStyle='#e8d8a0'; for(const k of z.crumbs) ctx.fillRect(Math.round(k.x-c),Math.round(k.y),1,1);
      for(const p of z.pg){ if(p.st==='fly') continue; const fr=p.st==='peck'?'pigeon_peck_'+(Math.floor(p.t*3)%2):p.st==='walk'?'pigeon_walk_'+(Math.floor(p.t*8)%4):'pigeon_stand_0'; ctx.fillStyle='rgba(10,6,20,.25)'; ctx.fillRect(Math.round(p.x-c)-4,Math.round(p.y)-1,8,2); atlDraw(ctx,'pg',fr,Math.round(p.x-c)-6,Math.round(p.y)-10,p.f<0); } }
    if(layer==='air'||layer==='ui'){ if(layer==='ui') for(const p of z.pg){ if(p.st!=='fly') continue; const fr=p.z<14?'pigeon_takeoff_'+Math.min(2,Math.floor(p.z/5)):'pigeon_fly_'+(Math.floor(G.t*10)%2); atlDraw(ctx,'pg',fr,Math.round(p.x-c)-6,Math.round(p.y-p.z)-10,p.f<0); }
      if(layer==='ui'){ ctx.fillStyle='#e8e4f0'; for(const f of z.pfx){ ctx.fillRect(Math.round(f.x-c),Math.round(f.y),2,1); ctx.fillStyle='#9a9ab0'; ctx.fillRect(Math.round(f.x-c)+1,Math.round(f.y)+1,1,1); ctx.fillStyle='#e8e4f0'; } } } },
  bot(z){ const h=G.hero; if(z.scared||h.x>z.pcx+60) return null; if(h.x<z.pcx-80) return null; const edge=z.y1; if(Math.abs(h.y-edge)>2) return {stick:{x:.25,y:.8}}; return {stick:{x:.5,y:0}}; } };
// ключи событий маршрута (EV4) → реализации
SEV.puddles=SEV.puddle; SEV.promoter=SEV.promo; SEV.construction=SEV.works; SEV.accident=SEV.crash;
// ---------- M2-9: погода улицы — дождь (косые капли 2 слоя, тёмное небо, мокрый блеск), снег (хлопья, белый тротуар, сугробы — узкие проходы), туман (дымка поверх дальних слоёв и людей вдали) ----------
function st4WeatherInit(z){ const w=z.weather; z.wp=[]; const n=w==='rain'?90:w==='snow'?70:0; for(let i=0;i<n;i++) z.wp.push({x:Math.random()*W,y:Math.random()*H,l:Math.random()<.5?1:0,s:Math.random()});
  z.drifts=[]; if(w==='snow'&&!z.yard){ const r=st4Rng(z); let x=Math.round(z.len*.15); const busy=[[z.cx,z.cw],[z.px,z.pw],[z.ax-130,260],[z.pcx-60,120],[z.kx-110,240]].filter(q=>q[0]!==undefined&&!isNaN(q[0]));
    while(x<z.len-120){ const w2=Math.round(26+r()*22), top=r()<.5; if(!busy.some(q=>x+w2>q[0]-20&&x<q[0]+q[1]+20)&&!(z.ic||[]).some(p=>x+w2>p.x-10&&x<p.x+p.w+10)){ const h2=Math.round((z.y1-z.y0)*.55); z.drifts.push({x,w:w2,top,y0:top?z.y0-6:z.y1-h2,y1:top?z.y0+h2-6:z.y1+6}); } x+=w2+Math.round(90+r()*140); }
    for(const d of z.drifts) z.solids.push([d.x+3,d.top?z.y0-8:d.y0+3,d.x+d.w-3,d.top?d.y1-3:z.y1+8]); } }
function st4WeatherTick(z,dt){ const w=z.weather; if(!z.wp) return; const vx=w==='rain'?-60:(Math.sin(G.t*.7)*14-6), vy=w==='rain'?340:30;
  for(const p of z.wp){ p.x+=vx*dt*(p.l?1:.6); p.y+=vy*dt*(p.l?1:.6)*(w==='snow'?(.6+p.s*.8):1); if(p.y>H){ p.y=-4; p.x=Math.random()*(W+40); } if(p.x<-10) p.x+=W+20; if(p.x>W+10) p.x-=W+20; } }
function st4WeatherDraw(z,layer){ const w=z.weather, g=st4Geo(), c=G.cam;
  if(layer==='ground'){
    if(w==='rain'&&!z.yard){ ctx.fillStyle='rgba(40,60,100,.16)'; ctx.fillRect(0,g.y0-6,W,H-g.y0+6); ctx.fillStyle='rgba(200,220,255,.22)'; for(let x=-(Math.round(c)%23);x<W;x+=23) ctx.fillRect(x,g.y1+(x*7&7)-2,6,1); }
    if(w==='snow'){ ctx.fillStyle='rgba(240,246,255,.55)'; ctx.fillRect(0,z.y0-6,W,z.y1-z.y0+12); ctx.fillStyle='rgba(255,255,255,.8)'; for(let x=-(Math.round(c)%17);x<W;x+=17) ctx.fillRect(x,z.y0-6+((x*13)&15)%(z.y1-z.y0+10),3,1);
      ctx.fillStyle='rgba(255,255,255,.7)'; ctx.fillRect(0,g.curbY-1,W,2);
      for(const d of z.drifts||[]){ if(!d.top) continue; const sx=Math.round(d.x-c); if(sx>W+40||sx+d.w<-40) continue; this_drift(sx,d); } } }
  if(layer==='drift'&&w==='snow'){ for(const d of z.drifts||[]){ if(d.top) continue; const sx=Math.round(d.x-c); if(sx>W+40||sx+d.w<-40) continue; this_drift(sx,d); } } // сугробы у бордюра: поверх людей, но ПОД машинами (дорога ближе)
  if(layer==='air'){
    if(w==='rain'){ ctx.fillStyle='rgba(30,40,70,.10)'; ctx.fillRect(0,0,W,H); for(const p of z.wp){ ctx.fillStyle=p.l?'rgba(190,215,255,.75)':'rgba(170,195,235,.45)'; const L=p.l?6:4; ctx.fillRect(Math.round(p.x),Math.round(p.y),1,L); ctx.fillRect(Math.round(p.x)-1,Math.round(p.y)+L,1,1); } }
    if(w==='snow'){ for(const p of z.wp){ ctx.fillStyle=p.l?'#fff':'rgba(255,255,255,.7)'; const s=p.l?2:1; ctx.fillRect(Math.round(p.x),Math.round(p.y),s,s); } }
    if(w==='fog'){ ctx.fillStyle='rgba(225,228,232,.16)'; ctx.fillRect(0,0,W,H); const gr=ctx.createLinearGradient(0,0,0,g.y0); gr.addColorStop(0,'rgba(225,228,232,.35)'); gr.addColorStop(1,'rgba(225,228,232,0)'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,g.y0); } } }
// сугроб-холм: купол по строкам, обводка, блик сверху, тень снизу; высота «вверх» = 14 px над основанием полосы
function this_drift(sx,d){ const w=d.w, base=d.y1, hh=Math.round(Math.min(d.y1-d.y0+8,w*.62)), cx=sx+w/2;
  for(let pass=0;pass<2;pass++) for(let r=0;r<hh;r++){ const t=1-r/hh, hw=Math.round((w/2)*Math.sqrt(Math.max(0,1-t*t*.9))*(r<2?.6:1)); const y=base-hh+r; if(pass===0){ ctx.fillStyle=P.ink; ctx.fillRect(Math.round(cx-hw-1),y-1,hw*2+2,3); } else { ctx.fillStyle=r<3?'#ffffff':r>hh-4?'#b8c8e0':((r+Math.round(sx))%5?'#e8f0fa':'#dce8f6'); ctx.fillRect(Math.round(cx-hw),y,hw*2,1); } }
  ctx.fillStyle='#ffffff'; ctx.fillRect(Math.round(cx-w*.2),base-hh+3,Math.round(w*.25),1); }
// ---------- M2-10: зонты на улице полностью (O1): ≤40% NPC с открытыми мокрыми зонтами, капли с купола, зацеп «Ай!» (−50% скорости 0.6 с), ТОЛКНУТЬ выбивает зонт (лежит на тротуаре), слой владельца ----------
function st4UmbInit(z){ if(z.weather!=='rain') return; const pool=z.npcs.filter(e=>!e.atl&&!e.cop&&!e.promo&&!e.onlook&&e.type!=='granny'); for(const e of umbQuota(pool,UMB.share)){ umbGive(e,'open'); if(e.umb4) e.umb4.wet=1; } z.umbDrops=[]; }
function st4UmbTick(z,dt){ if(z.weather!=='rain') return; const h=G.hero; h.umbSlowT=Math.max(0,(h.umbSlowT||0)-dt);
  for(const e of z.npcs){ const u=e.umb4; if(!u) continue; u.t+=dt; if(u.st==='opening'&&u.t>=.36){ u.st='open'; u.t=0; } e.umbCd=Math.max(0,(e.umbCd||0)-dt);
    if(u.st==='open'&&!e.umbCd&&Math.abs(e.x-h.x)<14&&Math.abs(e.y-h.y)<7&&!h.stun){ e.umbCd=1.6; h.umbSlowT=.6; tev('umb_snag'); bubble(e,'Ай!',1,'#ff8a8a'); pop('зацепил зонт',h.x,h.y-56,'#9ad0ff',6); try{ tone(520,.06,'square',.08); }catch(_){} } }
  for(const d of z.umbDrops) d.t+=dt; }
{ const _hm=heroMove; heroMove=function(h,dt,z){ if(h.umbSlowT>0&&z){ const s0=z.slow; z.slow=(s0||1)*.5; _hm(h,dt,z); z.slow=s0; return; } return _hm(h,dt,z); }; }
{ const _tp=tripPress; tripPress=function(k){ const z=TR.z, h=G.hero; const cd0=h&&h.shoveCd; const cand=(z&&z.k==='street'&&k==='A'&&!z.ctxA&&!TR.smod)?z.npcs.filter(e=>e.umb4&&e.umb4.st==='open'&&(e.x-h.x)*h.face>-4&&(e.x-h.x)*h.face<26&&Math.abs(e.y-h.y)<10):[];
  const r=_tp(k); if(cand.length&&h.shoveCd!==cd0){ for(const e of cand){ const u=e.umb4; e.umb4=null; z.umbDrops=z.umbDrops||[]; z.umbDrops.push({x:e.x+h.face*14,y:e.y+2,c:u.c,t:0}); bubble(e,pick(['Мой зонт!','Эй! Зонт!','Ну ты даёшь!']),1.4,P.red); e.angry=true; TR.scandal+=8; tev('umb_knock'); } SFX.heavy(); } return r; }; __trip.press=k=>tripPress(k); }
function st4UmbDraw(z,layer){ if(z.weather!=='rain'||!atlOk('umb')) return; const c=G.cam;
  if(layer==='ground') for(const d of z.umbDrops||[]){ const fn='closed_'+(d.c==='dome'?'black':d.c), r=ATL4.umb.f[fn]; if(!r) continue; const sx=Math.round(d.x-c); if(sx<-30||sx>W+30) continue; ctx.save(); ctx.translate(sx,Math.round(d.y)); ctx.rotate(-Math.PI/2); ctx.drawImage(ATL4.umb.img,r[0],r[1],r[2],r[3],-r[2]/2|0,-r[3]+2,r[2],r[3]); ctx.restore(); }
  if(layer==='air') for(const e of z.npcs){ const q=e.umbR; if(!e.umb4||e.umb4.st!=='open'||!q) continue; const ph=(G.t*2+e.x*.13)%1; ctx.fillStyle='rgba(170,210,255,.8)'; ctx.fillRect(q.x+1+((q.flip?1:0)),q.canopyBottom+Math.round(ph*12),1,2); ctx.fillRect(q.x+q.w-2,q.canopyBottom+Math.round(((ph+.5)%1)*12),1,2); } }
// ---------- M2-13: обучение улицы — карточка при первой встрече (ПОПРОБОВАТЬ / ПРОПУСТИТЬ) → ждём действие (★ в HUD) → «ГОТОВО ✓»; глава «УЛИЦА» в ОБУЧЕНИИ ----------
TUT31.street=['УЛИЦА','Иди вправо по тротуару, обходи прохожих. Дальше от бордюра — безопаснее. События улицы покажем по ходу.'];
const STUT={ light:['СВЕТОФОР','Жди зелёного человечка у зебры — цифры показывают, сколько осталось. На красный — гудок, откинет назад и −3 с.','Перейди на зелёный',z=>G.hero.x>z.cx+z.cw],
  works:['ДОСКА ЧЕРЕЗ ЯМУ','На доске держи равновесие: стик ↑/↓ против крена (шкала под ногами). Или иди по грязи внизу — медленно, но без риска.','Перейди яму',z=>G.hero.x>z.px+z.pw],
  puddle:['ЛУЖИ','Увидел «!» у края экрана — уйди вглубь тротуара, подальше от бордюра. Иначе машина обрызгает: −5 с.','Увернись от брызг',z=>z.tutW>=1],
  ice:['ГОЛОЛЁД','На льду не дёргайся: резкий разворот — падение и −4 с. Коричневая полоса песка — безопасна.','Пройди лёд',z=>z.ic&&z.ic[0]&&G.hero.x>z.ic[0].x+z.ic[0].w],
  promo:['ПРОМОУТЕР','Обойди его по дальнему краю тротуара. Поймал — дважды «НЕТ», и он отстанет. Листовка: +2 очка, но −2 с.','Пройди промоутера',z=>z.pmDone||G.hero.x>z.pm.x+20],
  pigeons:['ГОЛУБИ','Не беги сквозь стаю: отклони джойстик чуть-чуть и пройди шагом по краю.','Пройди голубей шагом',z=>G.hero.x>z.pcx+50],
  crash:['ДТП','Зеваки стоят стеной. ТОЛКНУТЬ сквозь — быстро, но скандал. Или арка во двор — дольше, но спокойно.','Обойди ДТП',z=>z.yardDone||G.hero.x>z.ax+z.cw]};
STUT.puddles=STUT.puddle; STUT.promoter=STUT.promo; STUT.construction=STUT.works; STUT.accident=STUT.crash;
function st4TutCheck(z){ const k=z.ev; if(!k||!STUT[k]||TR.smod||TR.stut) return; const L2=TR.mode==='learn2'; if(!L2&&(window.__noTut||TR.mode==='learn')) return; save.tut=save.tut||{}; const key='st_'+k.replace(/s$/,'');
  if(!L2&&save.tut[key]) return; if(z.tutDone) return; z.tutDone=1; save.tut[key]=1; try{ store(); }catch(e){} const d=STUT[k];
  st4Modal({id:'tut',title:'НОВОЕ · '+d[0],text:d[1],auto:9,onAuto:()=>{ TR.stut={k,z,t:0}; },opts:[['ПОПРОБОВАТЬ','#2aa860',()=>{ TR.stut={k,z,t:0}; tev('stut_try'); }],['ПРОПУСТИТЬ','#5a4a7a',()=>{ tev('stut_skip'); }]]}); }
function st4TutTick(z,dt){ const s=TR.stut; if(!s) return; if(s.z!==z){ TR.stut=null; return; } s.t+=dt; if(STUT[s.k][3](z)){ TR.stut=null; tev('stut_ok'); pop('ГОТОВО ✓',G.hero.x,G.hero.y-56,P.neonLime,9); SFX.coin(); } }
{ const _gt=goalText; goalText=function(z){ if(z&&z.k==='street'&&TR.stut&&TR.stut.z===z) return '★ '+STUT[TR.stut.k][2]; return _gt(z); }; }
{ const S=ZONES.street, u0=S.update; S.update=function(z,dt){ if(!z.fork||TR.forkAsked) st4TutCheck(z); if(TR.smod) return; st4TutTick(z,dt); return u0.call(this,z,dt); }; }
// глава «УЛИЦА»: учебные зоны, без провала по времени
function startLearnStreet(){ startTrip(0,{mode:'learn2',budget:999,zones:[{k:'street',seg:'street1',ev:'light',v:0,weather:'clear',d:0,seed:11},{k:'street',seg:'street1',ev:'works',v:0,weather:'clear',d:0,seed:12},{k:'street',seg:'street1',ev:'puddle',v:0,weather:'rain',d:0,seed:13},{k:'street',seg:'street1',ev:'ice',v:0,weather:'snow',d:0,seed:14},{k:'street',seg:'street1',ev:'promo',v:0,weather:'clear',d:0,seed:15,last:true}]}); TR.name='Учебная улица'; tev('learn2_start'); }
{ const _tu=tripUpdate; tripUpdate=function(dt){ if(TR.mode==='learn2'&&!TR.done) TR.tLeft=TR.tTotal; return _tu(dt); };
  const _tf=tripFinish; tripFinish=function(win,reason){ if(TR.mode!=='learn2') return _tf(win,reason); if(TR.done) return; TR.done=true; TR.win=true; G.done=true; G.win=true; G.doneT=0; musOn=false; save.learned2=1; try{ store(); }catch(e){} SFX.win(); };
  const _sr=showResult; showResult=function(){ if(TR.mode==='learn2'){ TR.mode='learned'; toTitle(); say('Улица пройдена! Удачи по дороге на работу',3,P.neonLime); return; } return _sr(); }; }
window.__learn2={start:startLearnStreet,steps:STUT};
// выбор главы ОБУЧЕНИЯ на титуле (2 кнопки): МЕТРО / УЛИЦА
{ const _dt=drawTitle; drawTitle=function(){ _dt(); if(!G.lpick) return; buttons.length=0; G.labels=G.labels.filter(()=>false); ctx.fillStyle='rgba(10,6,20,.6)'; ctx.fillRect(0,0,W,H);
  const w=Math.min(W-60,300), hh=96, x=Math.round(W/2-w/2), y=Math.round(H/2-hh/2); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,w+4,hh+4); ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,hh);
  G.labels.push(['ОБУЧЕНИЕ · ГЛАВА',W/2,y+14,11,'#d8265e','center',null]); G.labels.push([save.learned3?'улица и МЦД пройдены ✓':save.learned2?'новое: МЦД — табло, контролёры, укрытия':'новое: светофор, доска, лужи, лёд, промоутер',W/2,y+32,7,'#5a4a6a','center',null]);
  const bw=Math.round((w-40)/3); bigBtn('МЕТРО',x+10,y+hh-40,bw,30,'#3d5ab0',()=>{ G.lpick=0; startLearn(); },'lp0',9); bigBtn('УЛИЦА',x+20+bw,y+hh-40,bw,30,'#2aa860',()=>{ G.lpick=0; startLearnStreet(); },'lp1',9); bigBtn('МЦД',x+30+2*bw,y+hh-40,bw,30,'#d8501f',()=>{ G.lpick=0; startLearnMcd(); },'lp2',9);
  buttons.unshift({x:0,y:0,w:W,h:H,id:'lpx',cb:()=>{ G.lpick=0; }}); }; }
// ---------- M2-14: звук улицы — тема 128 BPM (бас+мелодия+хэт/бочка шумом) и процедурный эмбиент (машины, птицы/голуби, дождь по зонтам, стройка) ----------
const ST4_THEME={bpm:128, bass:[40,0,40,47,0,40,0,45,43,0,43,50,0,43,47,0, 36,0,36,43,0,36,0,40,38,0,38,45,0,38,42,0],
  mel:[0,76,0,79,81,0,79,76,0,74,0,76,0,0,72,0, 0,76,0,79,83,0,81,79,0,76,0,74,72,0,0,0]};
{ const _mt=musicTick; musicTick=function(){ const z=TR&&TR.z; if(!(G.scene==='trip'&&z&&z.k==='street')) return _mt(); if(!AC||!musOn||save.mute) return; const sp=60/ST4_THEME.bpm/4; AUD.st4=1;
  while(musNext<AC.currentTime+.2){ if(musNext<AC.currentTime) musNext=AC.currentTime+.02; const i=musStep%32, b=ST4_THEME.bass[i], m=ST4_THEME.mel[i], d=musNext-AC.currentTime;
    if(b) tone(mtof(b),sp*1.7,'triangle',.5,0,d,mus); if(m&&!(z.yard&&i%2)) tone(mtof(m),sp*.9,'square',.18,0,d,mus); if(i%4===0) tone(55,.09,'sine',.5,-30,d,mus); if(i%4===2) noise(.03,.06,6000,d);
    musStep++; musNext+=sp; } }; }
function st4AmbTick(z,dt){ if(typeof AC==='undefined'||!AC||save.mute) return; z.amb=z.amb||{car:1,bird:2,rain:.3,work:.5}; const A=z.amb, h=G.hero;
  A.car-=dt; if(A.car<=0){ const near=(z.cars||[]).find(q=>Math.abs((q.x+q.w/2)-h.x)<W*.6); if(near){ noise(.6,.05,300); tone(90,.5,'sawtooth',.03,-20); } A.car=rnd(1.4,3); }
  A.bird-=dt; if(A.bird<=0){ if(z.weather==='clear'&&!z.yard){ const f=rnd(2200,3200); tone(f,.06,'sine',.05,600); tone(f*1.1,.05,'sine',.04,-400,.09); } else if(z.yard){ tone(1500,.05,'sine',.04,300); } A.bird=rnd(2.5,6); }
  if(z.pg&&!z.scared&&Math.abs(h.x-z.pcx)<W*.5){ A.coo=(A.coo||0)-dt; if(A.coo<=0){ tone(380,.18,'sine',.06,-60); tone(340,.22,'sine',.05,-40,.2); A.coo=rnd(1.6,3); } }
  if(z.weather==='rain'){ A.rain-=dt; if(A.rain<=0){ noise(.25,.035,2500); const u=(z.npcs||[]).some(e=>e.umb4&&e.umb4.st==='open'&&Math.abs(e.x-h.x)<60); if(u) for(let k=0;k<3;k++) tone(rnd(1800,2600),.02,'square',.03,0,k*.05); A.rain=.22; } }
  if(z.px!==undefined&&Math.abs(h.x-z.px)<W*.6){ A.work-=dt; if(A.work<=0){ noise(.05,.12,1200); tone(160,.05,'square',.08,-60); A.work=rnd(.45,.9); } } }
{ const S=ZONES.street, u0=S.update; S.update=function(z,dt){ const r=u0.call(this,z,dt); try{ st4AmbTick(z,dt); }catch(e){} return r; }; }
// ---------- M2-15: транспорт улицы (§P4–P7) — 2 полосы глубины (дальняя → вправо, ближняя ← влево), брызги из-под колёс в дождь, автобус на остановке (гэг «уехал»), прокатные самокаты у фасада, такси «ВЗЯТЬ ТАКСИ?» с катсценой салона ----------
st4CarsDraw=function(z){ if(!atlOk('tr')) return; const g=st4Geo(), h=G.hero, hx=h.x-G.cam; const arr=[...(z.cars||[])].sort((a,b)=>(b.dir>0?1:0)-(a.dir>0?1:0));
  for(const q of arr){ const r=ATL4.tr.f[q.spr]; if(!r) continue; const far=q.dir>0||q.spl, base=far?g.farY:g.carY, sx=Math.round(q.x-G.cam), y=base-r[3]+Math.round(Math.sin(G.t*9+q.x*.1)*.5);
    if(sx<-r[2]-4||sx>W+4) continue; ctx.fillStyle='rgba(10,6,20,.3)'; ctx.fillRect(sx+3,base-2,r[2]-6,3); const ghost=hx>sx-6&&hx<sx+r[2]+6&&far; if(ghost) ctx.globalAlpha=.6; atlDraw(ctx,'tr',q.spr,sx,y,q.dir<0); ctx.globalAlpha=1;
    if(z.weather==='rain'){ ctx.fillStyle='rgba(170,210,255,.8)'; const wx=q.dir>0?sx+6:sx+r[2]-6; for(let k=0;k<4;k++){ const ph=(G.t*6+k*.25+q.x*.01)%1; ctx.fillRect(Math.round(wx-q.dir*ph*12),Math.round(base-2-Math.sin(ph*3.14)*6),1,1); } }
    if(q.brake){ ctx.fillStyle='#ff3a3a'; ctx.fillRect(q.dir>0?sx:sx+r[2]-2,y+r[3]-12,2,2); } } };
function st4TransInit(z){ if(z.yard||z.carsOff) return; const r=st4Rng(z); r(); r(); const busy=x=>[[z.cx,z.cw],[z.px,z.pw],[z.ax-140,280],[z.pcx-60,120]].some(q=>q[0]!==undefined&&!isNaN(q[0])&&x>q[0]-90&&x<q[0]+q[1]+90);
  // прокатные самокаты у фасада (препятствие)
  z.scoots=[]; for(let i=0;i<1+Math.floor(r()*3);i++){ const x=Math.round(z.len*(.15+r()*.7)); if(busy(x)) continue; z.scoots.push({x,f:r()<.5}); z.solids.push([x-6,z.y0-4,x+8,z.y0+3]); }
  // остановка + автобус (гэг «уехал»)
  if(r()<.55){ let x=Math.round(z.len*(.3+r()*.4)); if(!busy(x)) z.bus={stop:x,st:'wait',bx:x-60,t:0}; }
  // такси у бордюра
  if(typeof unl4==='function'&&unl4('taxi')&&z.seg&&TR.mode!=='learn2'&&r()<.6){ const x=Math.round(z.len*(.12+r()*.2)); if(!busy(x)&&!(z.bus&&Math.abs(z.bus.stop-x)<W*1.1)) z.taxi={x}; } }
function st4TransTick(z,dt){ const h=G.hero, B=z.bus; if(B){ B.t+=dt;
    if(B.st==='wait'&&(Math.abs(h.x-B.stop)<70||B.t>16)){ B.st='leave'; B.v=0; tev('bus_gag'); if(Math.abs(h.x-B.stop)<90){ pop('УЕХАЛ!',h.x,h.y-56,'#ffb84a',9); say(pick(['Автобус уехал прямо перед носом…','Ну конечно. Уехал.','Двери закрылись. Как всегда.']),1.6,'#ffb84a'); TR.nerves=Math.max(0,TR.nerves-2); } SFX.doors(); }
    if(B.st==='leave'){ B.v=Math.min(160,B.v+60*dt); B.bx+=B.v*dt; if(B.bx>G.cam+W+40) z.bus=null; } } }
function st4TransDraw(z,layer){ const g=st4Geo(), c=G.cam, h=G.hero;
  if(layer==='back') for(const s of z.scoots||[]) atlDraw(ctx,'tr','scooter_share_'+(s.f?1:0),Math.round(s.x-c)-8,z.y0-15,s.f);
  if(layer==='front'){ const B=z.bus; if(B){ const sx=Math.round(B.stop-c);
      ctx.fillStyle=P.ink; ctx.fillRect(sx-1,g.curbY-40,3,40); ctx.fillStyle='#5a5a68'; ctx.fillRect(sx,g.curbY-39,1,39); ctx.fillStyle=P.ink; ctx.fillRect(sx-7,g.curbY-50,15,12); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-6,g.curbY-49,13,10); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,g.curbY-47,9,5); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-3,g.curbY-46,2,2); ctx.fillRect(sx+2,g.curbY-46,2,2); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,g.curbY-42,2,1); ctx.fillRect(sx+3,g.curbY-42,2,1);
      const r=ATL4.tr&&ATL4.tr.f.bus_ext; if(r){ const bx=Math.round(B.bx-c), by=g.farY-r[3]; const ghost=B.st!=='ride'&&(h.x-c)>bx-6&&(h.x-c)<bx+r[2]+6; const nm=B.st==='wait'?'bus_ext_open':'bus_ext', cy=g.y1+1; ctx.save(); ctx.beginPath(); ctx.rect(bx-2,cy,r[2]+4,H-cy); ctx.clip(); if(ghost) ctx.globalAlpha=.55; atlDraw(ctx,'tr',nm,bx,by,false); ctx.restore(); ctx.save(); ctx.beginPath(); ctx.rect(bx-2,by-2,r[2]+4,cy-by+2); ctx.clip(); ctx.globalAlpha=B.st==='ride'?.9:ghost?.3:.42; atlDraw(ctx,'tr',nm,bx,by,false); ctx.restore(); ctx.globalAlpha=1; } }
    if(z.taxi){ const r=ATL4.tr&&ATL4.tr.f.taxi; const sx=Math.round(z.taxi.x-c); if(r){ const ghost=(h.x-c)>sx-6&&(h.x-c)<sx+r[2]+6; if(ghost) ctx.globalAlpha=.6; atlDraw(ctx,'tr','taxi',sx,g.farY-r[3],true); ctx.globalAlpha=1; } if(Math.floor(G.t*2)%2){ ctx.fillStyle='#3aff7a'; ctx.fillRect(sx+28,g.carY-6-(r?r[3]:26)-2,3,2); } } } }
// такси: кнопка у машины → модалка «ВЗЯТЬ ТАКСИ?» → катсцена салона (atlas taxi_int) → пропуск остатка сегмента улицы
const TAXI_COST=8;
function st4TaxiCtx(z){ const h=G.hero; if(!z.taxi||z.yard||Math.abs(h.x-(z.taxi.x+30))>34||h.y<z.y1-12) return null; const ok=wallet().coins>=TAXI_COST;
  return {b:{label:ok?'ТАКСИ · '+TAXI_COST+' мон.':'ТАКСИ · нет '+TAXI_COST+' мон.',col:ok?'#e8a020':'#6a6a78',fn:()=>{ if(!ok){ say('Не хватает монет на такси',1.4,'#ff8a8a'); return; } st4Modal({id:'taxi',title:'ВЗЯТЬ ТАКСИ?',text:'«Довезу до '+(z.seg==='street2'?'офиса':'метро')+' за '+TAXI_COST+' мон. Быстрее пешком не выйдет — но в пробке тоже стоим».',opts:[['ПОЕХАЛИ','#e8a020',()=>st4TaxiGo(z)],['ПЕШКОМ','#5a4a7a',()=>{ tev('taxi_no'); }]]}); }}}; }
function st4TaxiGo(z){ const w=wallet(); w.coins-=TAXI_COST; try{ store(); }catch(e){} tev('taxi_ride'); const rest=TR.zones.slice(TR.zi).filter(q=>q.k==='street'&&q.seg===z.seg); let px=(z.len-G.hero.x); for(const q of rest) if(q!==z) px+=Math.max(W,420)*2;
  const ride=Math.round(px/62*.45); TR.tLeft-=ride; for(const q of rest) if(q!==z) q.skipTaxi=1; st4Modal({id:'taxi_ride',scene:'taxi',title:'ТАКСИ',text:'',auto:2.6,onAuto:()=>{ G.hero.x=z.len; zoneDone(); pop('−'+ride+' с в пробке',G.hero.x,G.hero.y-56,'#ffd23f',8); }}); }
{ const _nz=nextZone; nextZone=function(){ while(TR.zones[TR.zi+1]&&TR.zones[TR.zi+1].skipTaxi) TR.zi++; return _nz(); }; }
{ const _dm=st4DrawModal; st4DrawModal=function(m){ if(m.scene!=='taxi') return _dm(m); G.labels.length=0; buttons.length=0; ctx.fillStyle='#120c18'; ctx.fillRect(0,0,W,H);
  const r=ATL4.tr&&ATL4.tr.f.taxi_int, sc=Math.max(2,Math.floor(Math.min((W-40)/100,(H-80)/46))), w=100*sc, hh=46*sc, x=Math.round(W/2-w/2), y=Math.round(H/2-hh/2);
  for(let i=0;i<6;i++){ const lx=((i*W/5)-m.t*W*1.4)%(W+60); ctx.fillStyle='rgba(255,220,140,.5)'; ctx.fillRect(Math.round(lx<0?lx+W+60:lx),y+8*sc,20,2*sc); }
  if(r) atlDraw(ctx,'tr','taxi_int',x,y+Math.round(Math.sin(m.t*20)*1),false,sc); G.labels.push(['ПОЕХАЛИ!',W/2,y-14,11,'#ffe14a','center',P.ink]); }; }
{ const S=ZONES.street, i0=S.init, u0=S.update, d0=S.draw, c0=S.ctx; S.init=function(z){ i0.call(this,z); try{ st4TransInit(z); }catch(e){} };
  S.update=function(z,dt){ const r=u0.call(this,z,dt); if(!TR.smod) st4TransTick(z,dt); return r; };
  S.ctx=function(z){ const t=st4TaxiCtx(z); if(t) return t; return c0.call(this,z); }; }
// автосейв на границе сегментов дня (улица-1 → метро → улица-2) и продолжение с начала сегмента
{ const _nz=nextZone; nextZone=function(){ const prev=TR.z&&TR.z.seg; const r=_nz(); try{ const z=TR.z; if(TR.mode==='trip'&&TR.day&&z&&!TR.done&&z.seg&&prev&&z.seg!==prev&&save.segSave&&save.segSave.seed===TR.day.seed){ save.segSave.zi=TR.zi; save.segSave.seg=z.seg; save.segSave.tLeft=TR.tLeft; save.segSave.ts=Date.now(); store(); tev('seg_save'); } }catch(e){} return r; }; }
{ const _sd=startDay; startDay=function(idx,opts){ const ss=save.segSave&&Object.assign({},save.segSave); const plan=_sd(idx,opts); try{ if(opts&&opts.resume&&ss&&ss.idx===idx&&ss.zi>0&&ss.zi<TR.zones.length&&ss.seed===TR.day.seed){ TR.zi=ss.zi-1; TR.z=null; nextZone(); TR.tLeft=Math.min(TR.tTotal,ss.tLeft); save.segSave=Object.assign(save.segSave||{},ss); store(); tev('resume_seg'); } }catch(e){} return plan; }; }

// разнообразные прохожие для толп событий (зеваки, ожидающие у зебры): атлас-персонажи из листов M0 + разные типы, без клонов подряд
const ST4_LOOKS=['smoker','polite','fat','tourist','nastya','musician','colleague','student','seed','trainee','courier','kid','baba','seeds','bag'], ST4_ATLC=['smoker','fat','nastya','colleague','seed','courier','baba']; let st4LastLook='';
function st4VarNpc(x,y,rr){ let lk; do{ lk=ST4_LOOKS[Math.floor(rr()*ST4_LOOKS.length)]; } while(lk===st4LastLook); st4LastLook=lk; const isA=ST4_ATLC.includes(lk)&&atlOk('ch'); const e=mkNpc(isA?'polite':lk,x,y); if(isA) e.atl=lk; e.anT=rr()*3; return e; }
