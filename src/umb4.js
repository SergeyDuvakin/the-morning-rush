// V33-3: зонты v4 (лист M0-3, купол 24 px). Под землёй — закрытые (с каплями), на выходе в город — раскрываются через 0.5 с после двери (3 кадра).
const UMB={ share:.38, cols:[['black',40],['navy',15],['bordo',15],['check',12],['leo',8],['dome',10]] };
function umbPick(e){ if(e.type==='kid') return 'kid'; let r=Math.random()*100; for(const [c,w] of UMB.cols){ if((r-=w)<0) return c; } return 'black'; }
// квота: ровно ⌊n·share⌋ случайных NPC (≤40% по O1)
function umbQuota(arr,share){ const a=[...arr].sort(()=>Math.random()-.5); return a.slice(0,Math.floor(arr.length*share)); }
function umbGive(e,st){ if(e.umb4||e.boss||e.type==='babatank'||e.type==='controller'||e.type==='guard'||e.type==='statue') return; e.umb4={c:umbPick(e),st:st||'closed',t:0}; }
// высота макушки над ногами (в px спрайта 64×64) — по габаритам спека v3
function umbHeadH(e){ const s=e.spec||{}; const hr=s.headR||7; return (s.legH||9)+(s.bodyH||11)+2*hr+(s.hairStyle&&s.hairStyle!=='bald'?1:0); }
function umbFrame(u){ const c=u.c;
  if(u.st==='closed') return 'closed_'+(c==='dome'?'black':c);
  if(u.st==='opening'||u.st==='closing'){ const k=Math.min(2,Math.floor((u.st==='opening'?u.t:.36-u.t)/.12)); return k>=2?'open_'+c:'openA_'+Math.max(0,k); }
  if(c==='black'&&u.wet) return 'wet_'+(Math.floor(G.t*6)%3);
  return 'open_'+c; }
// геометрия раскрытого: низ купола (строка 11) на 3 px выше макушки; ручка — строка 24
function umbRect(e,sx,sy){ const u=e.umb4, dk=dS(depthK(e.rx!==undefined?e.ry:e.y)), fn=umbFrame(u), r=ATL4.umb.f[fn]; if(!r) return null; const f=e.face<0?-1:1;
  if(u.st==='closed'){ const top=Math.round(sy-23*dk); return {fn,x:Math.round(sx+f*6*dk-r[2]/2),y:top,w:r[2],h:r[3],flip:f<0}; }
  const headTop=sy-umbHeadH(e)*dk, hb=r[3]===26?24:23, shaftX=fn.startsWith('openA_')?(r[2]===9?4:7):13;
  const hr=((e.spec&&e.spec.headR)||7), y=Math.round(headTop+10-hb), x=Math.round(sx+f*Math.round((hr+2)*dk)-(f<0?r[2]-1-shaftX:shaftX)); // стержень — перед лицом, не поверх
  return {fn,x,y,w:r[2],h:r[3],flip:f<0,canopyBottom:y+11,headTop:Math.round(headTop)}; }
function drawUmb(e,sx,sy){ if(!atlOk('umb')) return; const q=umbRect(e,sx,sy); if(!q) return; atlDraw(ctx,'umb',q.fn,q.x,q.y,q.flip); e.umbR=q;
  if(e.umb4.st==='closed'&&e.umb4.wet&&Math.floor(G.t*3+e.anT*7)%4===0){ ctx.fillStyle='#8fc8ff'; ctx.fillRect(q.x+(q.flip?q.w-4:3),q.y+q.h+1+Math.floor(G.t*12)%4,1,1); } }
// подключаемся к отрисовке актёров (ex-колбэк уже рисуется после спрайта — тот же слой глубины)
{ const _dA=drawActor; drawActor=function(a,ex){ return _dA(a,a.umb4?(sx,sy)=>{ if(!(a.sit||a.st==='sleep'||a.hide)) drawUmb(a,sx,sy); ex&&ex(sx,sy); }:ex); }; }
// логика состояния: у выхода (дверь z.len-60) — раскрыть через .5 с после двери; входящие — закрыть через .5 с после двери
function umbExitTick(z,dt){ const door=z.len-60;
  for(const e of z.npcs){ const u=e.umb4; if(!u) continue; u.t+=dt; const out=e.x>door;
    if(e.dir>0){ if(!out){ if(u.st!=='closed'){ u.st='closed'; u.t=0; u.door=0; } } else { u.door=(u.door||0)+dt; if(u.st==='closed'&&u.door>=.5){ u.st='opening'; u.t=0; } } }
    else { if(out){ if(u.st!=='open'){ u.st='open'; u.t=0; } u.wet=1; u.door=0; } else { u.door=(u.door||0)+dt; if(u.st==='open'){ u.st='closing'; u.t=0; } /* закрывает сразу за дверью: 0.36 с анимации — внутри помещения раскрытых нет */ } }
    if(u.st==='opening'&&u.t>=.36){ u.st='open'; u.t=0; } if(u.st==='closing'&&u.t>=.36){ u.st='closed'; u.t=0; u.wet=1; } } }
{ const X=ZONES.exitz, i0=X.init, u0=X.update;
  X.init=function(z){ i0.call(this,z); if(!z.rain) return; const door=z.len-60; for(const e of z.npcs) delete e.umb; for(const e of umbQuota(z.npcs,UMB.share)){ umbGive(e,e.x>door?'open':'closed'); if(e.umb4) e.umb4.wet=1; } };
  X.update=function(z,dt){ const r=u0.call(this,z,dt); if(z.rain) umbExitTick(z,dt); return r; }; }
// дождливый день: под землёй у части NPC закрытый мокрый зонт
for(const k of ['gate','esc','passage','plat','car']){ const Z=ZONES[k]; if(!Z) continue; const i0=Z.init; Z.init=function(z){ i0.call(this,z); if(!TR.rain) return; for(const e of umbQuota((z.npcs||[]).filter(e=>!e.sit),.25)){ umbGive(e,'closed'); if(e.umb4) e.umb4.wet=1; } }; }
