'use strict';
// ================= АКТЁРЫ, БОЙ, ЭФФЕКТЫ =================
const G={scene:'boot',hero:null,ens:[],items:[],fx:[],parts:[],pops:[],labels:[],cam:0,camLock:null,lv:null,t:0,shake:0,stop:0,score:0,coins:0,combo:0,comboT:0,bestCombo:0,rage:0,msg:null,hurtTaken:0,time:0,stats:{},wave:-1,charge:0};
const GRAV=560;
function say(s,d=2.2,col='#fff'){ G.msg={s,t:d,col}; }
function pop(s,x,y,col='#fff',size=9,life=.8){ G.pops.push({s,x,y,col,size,t:0,life}); }
function parts(x,y,z,n,col,sp=60,up=80,life=.6,sz=1){ for(let i=0;i<n;i++) G.parts.push({x,y,z:z||0,vx:rnd(-sp,sp),vy:rnd(-sp*.3,sp*.3),vz:rnd(up*.4,up),col:Array.isArray(col)?pick(col):col,t:0,life:rnd(life*.6,life),s:sz}); }
function shake(a){ G.shake=Math.max(G.shake,a); }
function hitstop(s){ G.stop=Math.max(G.stop,s); }
const BOOM=['ХРЯСЬ!','БАМС!','ШМЯК!','ПЫЩ!','БДЫЩ!','ХЛОП!','ТЫДЫЩ!'];

class Actor{
  constructor(x,y,spec){ this.x=x; this.y=y; this.z=0; this.vx=0; this.vy=0; this.vz=0; this.face=1; this.spec=spec; this.st='idle'; this.stT=0; this.anT=0; this.hp=10; this.maxhp=10; this.sq=1; this.inv=0; this.flash=0; this.mood='norm'; this.dead=false; this.r=7; this.T={}; }
  set(s){ if(this.st!==s){ this.st=s; this.stT=0; } }
  phys(dt){ if(this.z>0||this.vz>0){ this.vz-=GRAV*dt; this.z+=this.vz*dt; if(this.z<=0){ this.z=0; const v=this.vz; this.vz=0; this.onLand&&this.onLand(v); } }
    this.x+=this.vx*dt; this.y+=this.vy*dt; this.y=clamp(this.y,FY0+3,FY1); 
    if(G.lv){ const lo=G.camLock?G.camLock[0]+6:6, hi=G.camLock?G.camLock[1]-6:G.lv.len-6; if(this===G.hero||(!this.free&&this.st!=='fly'&&this.st!=='pass')) this.x=clamp(this.x,lo,hi); }
    this.sq+=(1-this.sq)*Math.min(1,dt*12); this.inv=Math.max(0,this.inv-dt); this.flash=Math.max(0,this.flash-dt); this.stT+=dt; this.anT+=dt; }
}
function softShadow(x,y,r){ ctx.fillStyle='rgba(10,6,20,.22)'; ctx.beginPath(); ctx.ellipse(x,y,r*1.25,r*.38,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(10,6,20,.30)'; ctx.beginPath(); ctx.ellipse(x,y,r*.85,r*.24,0,0,Math.PI*2); ctx.fill(); }
function drawActor(a,ex){ const fr=Math.floor(a.anT*10);
  let pn='idle',f=0;
  const s=a.st;
  if(a.poseOv){ pn=a.poseOv[0]; f=a.poseOv[1]; }
  else if(s==='walk'||s==='chase'||s==='run') { pn='walk'; f=fr%8; }
  else if(s==='atk'){ pn=a.atkPose||'p1'; f=a.stT>a.atkWind?1:0; }
  else if(s==='jump'||s==='fly'&&a.hp>0&&!a.down) pn=s==='fly'?'hurt':(a.airAtk?'kick':'jump');
  else if(s==='fly') pn='hurt';
  else if(s==='slide') pn='slide';
  else if(s==='dash') pn='dash';
  else if(s==='spin') { pn='spin'; }
  else if(s==='hurt') pn='hurt';
  else if(s==='down'||s==='ko'||s==='rail') pn='down';
  else if(s==='super') { pn='super'; f=fr%4; }
  else if(s==='cheer') { pn='cheer'; f=fr%4; }
  else if(s==='sleep') { pn='sit'; }
  else f=fr%6;
  const mood=(s==='ko'||s==='rail'||(s==='down'&&a.hp<=0))?'ko':(s==='hurt'||s==='fly'||s==='down')?'hurt':(a.angry||s==='atk'&&a!==G.hero)?'angry':a.mood;
  const img=personSprite(a.spec,pn,f,mood,Math.floor(G.t*10));
  const sx=Math.round(a.x-G.cam), sy=Math.round(a.y-a.z);
  // тень
  const dk=dS(depthK(a.y)); softShadow(sx,Math.round(a.y),(a.boss?16:10)*dk*Math.max(.5,1-a.z/90));
  if(sx<-40||sx>W+40) return;
  if(a.ko&&a.koT>1.2&&Math.floor(G.t*12)%2) return; // мигает перед исчезновением
  const flip=a.face<0, sq=a.sq, w=64*(2-sq)*(a.scale||1)*dk, h=64*sq*(a.scale||1)*dk;
  ctx.save(); ctx.translate(sx,sy); if(flip) ctx.scale(-1,1); if(a.rot) ctx.rotate(a.rot);
  if(a.flash>0&&Math.floor(G.t*30)%2){ ctx.filter='brightness(3)'; }
  if(a.stone) ctx.filter='grayscale(1) brightness(1.1)';
  ctx.drawImage(img,Math.round(-w/2),Math.round(-h+4*sq),Math.round(w),Math.round(h)); ctx.filter='none'; ctx.restore();
  if(a.tele>0&&!(a.dead)){ // телеграф атаки: «!» над головой
    ctx.fillStyle=P.ink; ctx.fillRect(sx-3,sy-56,7,11); ctx.fillStyle=P.red; ctx.fillRect(sx-2,sy-55,5,9); G.labels.push(['!',sx+.5,sy-50,8,'#fff']); }
  ex&&ex(sx,sy);
}
// ---------- удар ----------
function hitTest(a,reach,depth,zr,cb){ let n=0; for(const e of G.ens){ if(e.dead||e.st==='ko'||e.st==='rail'||e.inv>0||e.noHit) continue; const dx=(e.x-a.x)*a.face;
  if(dx>-6&&dx<reach+(e.boss?12:0)&&Math.abs(e.y-a.y)<depth&&Math.abs(e.z-a.z)<zr){ cb(e); n++; } } return n; }
function dmgEnemy(e,d,kx,kz,heavy,kind){ const H=G.hero; if(e.koed||e.st==="ko"||e.dead) return;
  if(e.onHit&&e.onHit(d,kx,heavy,kind)===false) return;
  e.hp-=d; e.flash=.12; e.sq=.7; G.score+=10*d*Math.max(1,comboMul()); addCombo(); G.rage=Math.min(100,G.rage+d*3.5);
  const px=e.x, py=e.y; parts(px,py,e.z+22,heavy?10:5,['#fff','#ffe066','#ff9a3a'],heavy?90:60,90,.4);
  if(heavy||e.hp<=0){ e.set('fly'); e.vx=kx; e.vz=Math.max(kz,90); e.vy=rnd(-20,20); e.down=true; SFX.heavy(); hitstop(.08); shake(3); haptic('medium'); pop(pick(BOOM),px,py-e.z-36,pick(['#fff','#ffd23f','#ff7ab8','#3ff0ff']),heavy?10:8); }
  else { e.set('hurt'); e.vx=kx*.35; e.tele=0; SFX.hit(); hitstop(.045); shake(1); haptic('light'); }
}
function comboMul(){ return G.combo>=50?4:G.combo>=25?3:G.combo>=10?2:1; }
function addCombo(){ G.combo++; G.comboT=2.2; G.bestCombo=Math.max(G.bestCombo,G.combo);
  const m={10:'НЕПЛОХО!',25:'ДАВКА!',50:'ЗАКРЫВАЙ ДВЕРИ!',100:'КОНЕЧНАЯ!!!'}[G.combo]; if(m){ pop(m,G.hero.x,G.hero.y-70,P.edge,14,1.4); hitstop(.08); SFX.ding(); haptic('success'); } }
function namedCombo(name,bonus){ G.score+=bonus; pop(name+' +'+bonus,G.hero.x,G.hero.y-80,P.neonCyan,10,1.6); SFX.win(); G.stats.named=(G.stats.named||0)+1; quest('named'); }
// ---------- эффекты рендер ----------
function updFX(dt){ for(const p of G.parts){ p.t+=dt; p.vz-=GRAV*.7*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; if(p.z<0){ p.z=0; p.vz*=-.3; p.vx*=.6; } }
  G.parts=G.parts.filter(p=>p.t<p.life); for(const q of G.pops) q.t+=dt; G.pops=G.pops.filter(q=>q.t<q.life); }
function drawParts(){ for(const p of G.parts){ ctx.fillStyle=p.col; ctx.fillRect(Math.round(p.x-G.cam),Math.round(p.y-p.z),p.s,p.s); } }
function drawPops(){ for(const q of G.pops){ const k=q.t/q.life, s=q.size*(k<.15?(.6+k/.15*.6):1.2-k*.2); G.labels.push([q.s,q.x-G.cam,q.y-k*14,s,q.col,'center',.0]); } }
