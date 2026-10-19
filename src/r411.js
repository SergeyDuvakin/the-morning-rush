// ================= R411 (v4.1.1): непрозрачный транспорт, повторные попытки, обход препятствий, зонты, падение на льду, карточки без таймера =================
const R411={ver:'4.1.1'}; if(typeof FB6!=='undefined') FB6.ver=R411.ver; if(typeof R41!=='undefined') R41.ver=R411.ver;
// ---------- 1) транспорт всегда непрозрачный; если герой за машиной — «рентген» героя поверх (полупрозрачный герой, а не машина) ----------
let VEH411=[];
function veh411(x,y,w,h){ VEH411.push({x,y,w,h}); }
function vehHeroXray411(){ const h=G.hero; if(!h||h.hide||!VEH411.length) return; const sx=Math.round(h.x-G.cam), sy=Math.round(h.y-(h.z||0)), hb={x:sx-8,y:sy-40,w:16,h:40};
  if(VEH411.some(v=>hb.x<v.x+v.w&&hb.x+hb.w>v.x&&hb.y<v.y+v.h&&hb.y+hb.h>v.y)){ ctx.save(); ctx.globalAlpha=.5; const r0=window.__ring; window.__ring=1; try{ drawActor(h); } finally{ window.__ring=r0; } ctx.restore(); R411.xray=(R411.xray|0)+1; } }
{ const S=ZONES.street, d0=S.draw; S.draw=function(z){ VEH411=[]; const r=d0.apply(this,arguments); try{ vehHeroXray411(); }catch(e){} return r; }; }
// ---------- 7) лёд: падение (поза «лежит» 0.6 с → встаёт 0.3 с), −2 с, затем 0.6 с неуязвимости: штрафы не начисляются ----------
{ const _pz=penalize; penalize=function(sec,src){ const h=G.hero; if(h&&h.inv411>0&&src!=='ice') { tev('pen_inv'); return; } return _pz.apply(this,arguments); }; }
// ---------- 5) карточки «НОВОЕ · …» и объяснения: без таймера и без значка часов — ждут кнопку; игра и таймер поездки стоят (TR.smod) ----------
const NOAUTO411=new Set(['tut','btut','m3caught']);
{ const _m=st4Modal; st4Modal=function(m){ if(m&&(NOAUTO411.has(m.id)||/^НОВОЕ/.test(m.title||''))&&m.opts){ m=Object.assign({},m); delete m.auto; delete m.onAuto; m.clock=0; m.noAuto411=1; } return _m(m); }; }
// бот (только тесты): на карточке-объяснении через 0.6 с жмёт первую кнопку, как раньше делал авто-таймер
{ const _tu=tripUpdate; tripUpdate=function(dt){ const m=TR.smod; if(m&&m.noAuto411&&window.__botTick&&!paused&&m.t>.6){ const o=m.opts[0]; TR.smod=null; o&&o[2](); } return _tu(dt); }; }
// ---------- 4) NPC не шагают на месте: впереди препятствие → обход по вертикали в пределах тротуара/зала; не вышло 3 раза → разворот или ждать (idle) ----------
function npcSolidAhead411(z,e,dir){ const S=z.solids||[]; for(const s of S){ if(e.y>s[1]-7&&e.y<s[3]+7){ if(dir>0&&s[0]-e.x>-4&&s[0]-e.x<16) return s; if(dir<0&&e.x-s[2]>-4&&e.x-s[2]<16) return s; } } return null; }
function npcUnstick411(z,dt){ const L=[...(z.npcs||[]),...(z.extra||[])], nY=z.y0===undefined, y0=nY?-1e4:z.y0, y1=nY?1e4:z.y1;
  for(const e of L){ if(e===G.hero||e.hide||e.sit||e.pin&&!e.free) continue; const p=e.p411||(e.p411={ax:e.x,ay:e.y,t:0,stk:0}); if(p.z!==z){ p.z=z; p.ax=e.x; p.ay=e.y; p.t=0; p.stk=0; e.side411=0; }
    const mover=!nY&&(e.free||e.street||e.wander); 
    // предвидение: свободный пешеход упирается в препятствие — заранее шаг вбок
    if(mover&&e.st==='walk'&&!(e.side411>0)&&e.dir){ const s=npcSolidAhead411(z,e,e.dir); if(s){ const up=s[1]-8, dn=s[3]+8, cu=up>=y0, cd=dn<=y1; if(cu||cd){ e.sdir411=(cu&&(!cd||e.y-up<dn-e.y))?-1:1; e.side411=.7; } else { e.dir*=-1; e.face=e.dir; } } }
    if(e.side411>0){ if(p.sx===undefined) p.sx=e.x; e.side411-=dt; e.y=clamp(e.y+e.sdir411*48*dt,y0,y1);
      // упёрся в край тротуара или вбок не помогает (x не сдвинулся) — стоп, пауза и разворот, без «качания» на месте
      if(e.y<=y0+.01||e.y>=y1-.01||(e.side411<.25&&Math.abs(e.x-p.sx)<2)){ e.side411=0; e.wait411=.8; p.tries=0; if(e.dir){ e.dir*=-1; e.face=e.dir; } }
      if(!(e.side411>0)) p.sx=undefined; }
    // чистое смещение от «якоря»: дрожание туда-обратно тоже считается топтанием на месте
    p.T=(p.T||0)+dt; const H=p.h||(p.h=[]); if(e.st!=='walk'){ H.length=0; p.stk=0; } else { H.push([p.T,e.x,e.y]); while(H.length&&p.T-H[0][0]>.95) H.shift();
      // смещение за последние ~0,45 и ~0,9 с: топтание и дрожание «туда-обратно» тоже ловим
      const near=(age)=>{ let q=null; for(const r of H){ if(p.T-r[0]<=age){ q=r; break; } } return q&&p.T-q[0]>=age-.06?Math.hypot(e.x-q[1],e.y-q[2]):99; };
      const s45=near(.45), s90=near(.9); p.stk=(s45<3||s90<3)?Math.max(p.stk,.45)+(s90<3?.5:0):0; }
    if(e.side411>0&&e.side411<.35&&p.stk>=.45){ e.side411=0; e.wait411=.8; p.stk=0; H.length=0; p.tries=0; if(e.street&&e.dir){ e.dir*=-1; e.face=e.dir; } }
    else if(!(e.side411>0)&&p.stk>=.45){ p.stk=0; H.length=0; p.tries=(p.tries||0)+1; R411.unstuck=(R411.unstuck|0)+1;
      if(e.street&&p.tries<3){ e.sdir411=e.y-y0<y1-e.y?1:-1; if(p.tries===2) e.sdir411*=-1; e.side411=.6; }
      else { e.wait411=.8; p.tries=0; if(mover&&e.dir){ e.dir*=-1; e.face=e.dir; } } }
    if(e.wait411>0){ e.wait411-=dt; if(e.st==='walk') e.set('idle'); } }
}
{ const _tu=tripUpdate; tripUpdate=function(dt){ const r=_tu(dt); try{ if(G.scene==='trip'&&TR.z&&!TR.smod&&!TR.legCard&&!paused) npcUnstick411(TR.z,dt); }catch(e){ console.error(e); } return r; }; }
// ---------- 4.1.1 #6: зонт — в руке НАД головой, стержень сбоку от лица (не через лицо), кулак у ручки; у персонажей атласа (ch) зонтов нет ----------
// габарит головы по реальному спрайту (верхние 9 строк непрозрачных пикселей), кешируется на спрайте
function umbHeadBox411(e){ try{ if(!e.spec||typeof personSprite!=='function') return null; const img=personSprite(e.spec,'idle',0,'norm',0); if(!img) return null; if(img.__hb411!==undefined) return img.__hb411;
  const c=img.getContext?img:null; let res=null; if(c){ const d=c.getContext('2d').getImageData(0,0,img.width,img.height).data, Wd=img.width; let top=-1; for(let y=0;y<img.height&&top<0;y++) for(let x=0;x<Wd;x++) if(d[(y*Wd+x)*4+3]>200){ top=y; break; }
    if(top>=0){ let mn=99,mx=-1; for(let y=top;y<Math.min(img.height,top+9);y++) for(let x=0;x<Wd;x++) if(d[(y*Wd+x)*4+3]>200){ mn=Math.min(mn,x); mx=Math.max(mx,x); } res={top:top*64/img.height,minx:mn*64/Wd,maxx:(mx+1)*64/Wd}; } }
  img.__hb411=res; return res; }catch(_){ return null; } }
{ const _ur=umbRect; umbRect=function(e,sx,sy){ const u=e.umb4; if(!u||u.st==='closed') return _ur(e,sx,sy);
    const dk=dS(depthK(e.rx!==undefined?e.ry:e.y)), fn=umbFrame(u), r=ATL4.umb.f[fn]; if(!r) return null; const f=e.face<0?-1:1;
    const hr=((e.spec&&e.spec.headR)||7), hb=fn.startsWith('wet_')?24:(r[3]===26?24:23), shaftX=fn.startsWith('openA_')?(r[2]===9?4:7):13;
    const m=umbHeadBox411(e), headTop=m?sy-64*dk+4+m.top*dk:sy-umbHeadH(e)*dk, fwd=Math.min((hr+4)*dk,m?(m.maxx-32)*dk:(hr+1)*dk);
    const hy=Math.round(Math.min(headTop+hr*dk*1.3,headTop+hb-11-3)), /* низ купола (строка 11) всегда ≥3 px над макушкой */ hx=Math.round(sx+f*(fwd+3)); // кулак: на уровне виска, на 3 px впереди самой выступающей точки головы (козырёк, чёлка)
    const y=hy-hb, x=hx-(f<0?r[2]-1-shaftX:shaftX);
    return {fn,x,y,w:r[2],h:r[3],flip:f<0,canopyBottom:y+11,headTop:Math.round(headTop),hx,hy}; };
  const _du=drawUmb; drawUmb=function(e,sx,sy){ if(e.atl&&atlOk('ch')&&G.scene==='trip') return;
    if(e.umb4&&e.umb4.st==='closed'&&atlOk('umb')){ // закрытый зонт — висит в опущенной руке сбоку, от кисти до земли (раньше 24 px «палка» доставала до лица)
      const dk=dS(depthK(e.rx!==undefined?e.ry:e.y)), fn=umbFrame(e.umb4), r=ATL4.umb.f[fn]; if(!r) return; const f=e.face<0?-1:1, sp=e.spec||{}, sc=Math.max(.5,Math.min(1,18*dk/r[3])), w=Math.round(r[2]*sc), hh=Math.round(r[3]*sc);
      const x=Math.round(sx+f*Math.round(((sp.bodyW||12)/2+4)*dk)-w/2), y=Math.round(sy+1-hh); atlDraw(ctx,'umb',fn,x,y,f<0,sc); e.umbR={fn,x,y,w,h:hh,flip:f<0};
      if(e.umb4.wet&&Math.floor(G.t*3+e.anT*7)%4===0){ ctx.fillStyle='#8fc8ff'; ctx.fillRect(x+(f<0?w-2:1),y+hh+Math.floor(G.t*12)%3,1,1); } return; }
    _du(e,sx,sy); const q=e.umbR; if(q&&q.hx!==undefined&&e.umb4&&e.umb4.st!=='closed'){ const sp=e.spec||{}, dk=dS(depthK(e.rx!==undefined?e.ry:e.y)), f=e.face<0?-1:1, hr=sp.headR||7;
      // рука: от плеча к кулаку у ручки (рукав цвета куртки, контур), затем кулак
      const shx=Math.round(sx+f*Math.round(((sp.bodyW||12)/2-1)*dk)), shy=Math.round(q.headTop+(2*hr+2)*dk), n=Math.max(1,Math.round(Math.hypot(q.hx-shx,q.hy-shy)));
      // рука проходит ЗА головой: пиксели внутри габарита головы не рисуем (лицо всегда открыто)
      const m=umbHeadBox411(e), a0=m?(m.minx-32)*dk:-hr*dk, a1=m?(m.maxx-32)*dk:hr*dk, X0=Math.round(f>0?sx+a0:sx-a1), X1=Math.round(f>0?sx+a1:sx-a0), Y0=q.headTop, Y1=Math.round(q.headTop+(2*hr+1)*dk);
      const inHead=(x,y)=>x>=X0-1&&x<=X1+1&&y>=Y0-1&&y<=Y1;
      ctx.fillStyle=P.ink; for(let i=0;i<=n;i++){ const x=Math.round(shx+(q.hx-shx)*i/n), y=Math.round(shy+(q.hy-shy)*i/n); if(!inHead(x,y)) ctx.fillRect(x-1,y-1,3,3); }
      ctx.fillStyle=sp.top||'#4a5a7a'; for(let i=0;i<=n;i++){ const x=Math.round(shx+(q.hx-shx)*i/n), y=Math.round(shy+(q.hy-shy)*i/n); if(!inHead(x,y)) ctx.fillRect(x,y,1,1); }
      ctx.fillStyle=P.ink; ctx.fillRect(q.hx-2,q.hy-1,4,4); ctx.fillStyle=sp.skin||'#e8b48a'; ctx.fillRect(q.hx-1,q.hy,2,2); } };
  const _ug=umbGive; umbGive=function(e,st){ if(e.atl) return; return _ug(e,st); }; }
// ---------- 4.1.1 #6/#8: косметика героя (панама, колпак, очки, шарф, значки, сумка/термос/морковка, уши) рисовалась в масштабе 1:1 от a.x —
// на улице герой уменьшен глубиной (dk≈0.82) и стоит в a.rx, поэтому шляпа/очки «висели» над головой. Теперь — тот же масштаб и точка, что у спрайта;
// в позе лёжа (падение на льду, нокаут) косметика не рисуется, чтобы не висеть в воздухе.
{ const _da=drawActor; drawActor=function(a,ex){ const cs=save.cosmetics; if(a!==G.hero||!cs||!cs.on||!(G.scene==='trip'||G.scene==='cut')) return _da(a,ex);
    const pr=G.scene==='trip'&&a.rx!==undefined, ax=pr?a.rx:a.x, ay=pr?a.ry:a.y, dk=dS(depthK(ay)), cam=G.scene==='trip'?G.cam:0;
    const lying=a.st==='down'||a.st==='ko'||a.st==='rail'||a.st==='sleep'||a.sit; const on0=cs.on; let tf=0;
    if(lying) cs.on={};
    try{ return _da(a,(sx,sy)=>{ ex&&ex(sx,sy); if(!tf&&!lying){ tf=1; const xi=Math.round(a.x-cam), yi=Math.round(a.y-(a.z||0)), xr=Math.round(ax-cam), yr=Math.round(ay-(a.z||0)); const k=dk*(a.scale||1)/dS(1), sq=a.sq||1, kx=k*(2-sq), ky=k*sq; /* смещения косметики подобраны под передний план (dk=dS(1)) */
      // масштабируем координаты вручную и округляем — пиксели остаются чёткими (без сглаживания дробных fillRect)
      const fr=ctx.fillRect; tf=fr; ctx.fillRect=function(x,y,w,h){ const X0=Math.round(xr+(x-xi)*kx), Y0=Math.round(yr+(y-yi)*ky), X1=Math.round(xr+(x+w-xi)*kx), Y1=Math.round(yr+(y+h-yi)*ky); return fr.call(this,X0,Y0,Math.max(1,X1-X0),Math.max(1,Y1-Y0)); }; } }); }
    finally{ if(tf) delete ctx.fillRect; if(tf&&ctx.fillRect!==tf) ctx.fillRect=tf; cs.on=on0; } }; }
// ---------- 4.1.1 #7: поза «лежит» (падение на льду и т.п.) — спрайт касается земли (раньше висел на ~8 px над своей тенью) ----------
function downOff411(a){ try{ const img=personSprite(a.spec,'down',0,'hurt',0); if(!img) return 0; if(img.__do411!==undefined) return img.__do411; const d=img.getContext('2d').getImageData(0,0,img.width,img.height).data, Wd=img.width; let bot=-1;
    for(let y=img.height-1;y>=0&&bot<0;y--) for(let x=0;x<Wd;x++) if(d[(y*Wd+x)*4+3]>200){ bot=y; break; }
    const st=personSprite(a.spec,'idle',0,'norm',0), d2=st.getContext('2d').getImageData(0,0,st.width,st.height).data; let b2=-1; for(let y=st.height-1;y>=0&&b2<0;y--) for(let x=0;x<st.width;x++) if(d2[(y*st.width+x)*4+3]>200){ b2=y; break; }
    img.__do411=bot>=0&&b2>=0?Math.max(0,(b2-bot)*64/img.height):0; return img.__do411; }catch(_){ return 0; } }
{ const _da=drawActor; drawActor=function(a,ex){ if(G.scene==='trip'&&a&&a.spec&&a.st==='down'&&!a.poseOv&&!(a.z>0)&&!a.atl){ const pr=a.rx!==undefined, dk=dS(depthK(pr?a.ry:a.y)), off=Math.round(downOff411(a)*dk*(a.scale||1)); if(off>0){ const z0=a.z||0; a.z=z0-off; try{ return _da(a,ex); } finally{ a.z=z0; } } } return _da(a,ex); }; }
