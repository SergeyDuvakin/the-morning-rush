'use strict';
// ================= ПРОПСЫ (катящиеся чемоданы, колонны, утки, диван, торт, кошки, шкурки…) =================
function makeProp(kind,x,y,o={}){ const e=new Actor(x,y,null); Object.assign(e,{isProp:true,kind,hp:3,maxhp:3,noHit:true},o);
  e.onLand=()=>{}; return e; }
function propUpdate(e,dt){ const h=G.hero;
  switch(e.kind){
    case 'roll': { e.vx=e.dir*e.spd; e.rot=(e.rot||0)+e.dir*dt*10; e.anT+=dt;
      if(!e.hero&&Math.abs(h.x-e.x)<(e.big?14:10)&&Math.abs(h.y-e.y)<(e.big?9:7)&&h.z<(e.big?14:10)){ hurtHero(1,e.dir*120,true); e.dir*=-1; }
      if(e.hero){ for(const o of liveEnemies()){ if(Math.abs(o.x-e.x)<12&&Math.abs(o.y-e.y)<8&&!e.hitSet.has(o)){ e.hitSet.add(o); dmgEnemy(o,2.5,e.dir*160,150,true,'roll'); if(e.hitSet.size>=3) namedCombo('КЕГЛИ! СТРАЙК',300); } } }
      if(e.x<G.cam-60||e.x>G.cam+W+60) e.dead=true; break; }
    case 'column': if(e.hp<=0&&!e.broken){ e.broken=true; e.noHit=true; parts(e.x,e.y,30,30,['#e9dfc4','#b5a585','#fff'],90,160,1,2); shake(4); SFX.heavy(); pop('КОЛОННА ВСЁ',e.x,e.y-60,'#fff',9); G.score+=200; } break;
    case 'duck': { e.anT+=dt; const tgt=G.items.find(i=>!i.dead&&i.w);
      if(e.carry){ e.vx=-60; e.vy=0; if(e.x<G.cam-30){ e.dead=true; } }
      else if(tgt){ const dx=tgt.x-e.x,dy=tgt.y-e.y; const l=Math.hypot(dx,dy)||1; e.vx=dx/l*45; e.vy=dy/l*30; if(l<6){ tgt.dead=true; e.carry=tgt.k; pop('КРЯ! (спёр)',e.x,e.y-20,'#fff',7); SFX.squeak(); } }
      else { e.vx=Math.sin(G.t+e.x)*20; e.vy=Math.cos(G.t*1.3)*10; }
      e.face=e.vx>0?1:-1; break; }
    case 'sofa': if(!G.camLock){ e.vx=e.dir*60; if(e.x<G.cam-60||e.x>G.cam+W+60) e.dead=true; break; } e.vx=e.dir*38; if(e.x>G.camLock[1]-30) e.dir=-1; if(e.x<G.camLock[0]+30) e.dir=1;
      for(const o of [h,...liveEnemies()]){ if(Math.abs(o.x-e.x)<22&&Math.abs(o.y-e.y)<8&&o.z<12&&(o.sofaCd||0)<G.t){ o.sofaCd=G.t+1; if(o===h) hurtHero(1,e.dir*130,true); else dmgEnemy(o,2,e.dir*150,140,true,'sofa'); } } break;
    case 'cake': { // торт несут студенты; враги пытаются его съесть
      e.vx=e.go?14:0; e.vy=0; if(e.hp<=0&&!e.lost){ e.lost=true; pop('ТОРТ ВСЁ… 😭',e.x,e.y-60,'#ff8a8a',10); parts(e.x,e.y,20,30,['#fff','#ff7ab8','#ffd23f'],90,120,1,2); G.cakeLost=true; }
      break; }
    case 'peel': if(!e.used){ for(const o of [h,...liveEnemies()]){ if(Math.abs(o.x-e.x)<6&&Math.abs(o.y-e.y)<5&&o.z<2&&(o.st==='walk'||o.st==='chase'||o.st==='idle'||o.st==='dash')){ e.used=true; if(o===h){ hurtHero(.5,o.face*90,true); pop('ВЖУХ',o.x,o.y-40,P.edge,8); } else { dmgEnemy(o,2,o.face*120,170,true,'peel'); G.peelKO=(G.peelKO||0)+1; if(G.peelKO%3===0) namedCombo('БАНАНОВЫЙ ДОМИНО',250); } break; } } } else { e.useT=(e.useT||0)+dt; if(e.useT>3){ e.used=false; e.useT=0; e.x=G.camLock?rnd(G.camLock[0]+20,G.camLock[1]-20):e.x; e.y=rnd(FY0+6,FY1-2); } } break;
    case 'food': if(e.eaten) e.dead=true; break;
    case 'poet': e.read=(G.t%6)<3.2; e.poseOv=e.read?['cheer',Math.floor(G.t*4)%4]:['idle',0]; if(e.read&&Math.random()<dt*2) pop(pick(['…и вот вагон…','…о, давка!…','…я опоздал…','…ты двери…']),e.x,e.y-56,'#fff',6,1.2); break;
    case 'smell': e.anT+=dt; if(e.anT>e.every){ e.anT=0; const s=G.ens.find(o=>!o.dead&&o.st==='sleep'); if(s){ s.wake=true; pop('*нюх-нюх*',s.x,s.y-56,'#ffd23f',7); } } break;
  }
  e.phys(dt);
  if(e.kind==='roll'||e.kind==='duck'||e.kind==='sofa') e.x=e.x; // без зажима арены
}
function drawProp(e){ const sx=Math.round(e.x-G.cam), sy=Math.round(e.y-e.z); if(sx<-50||sx>W+50) return; const o=(x,y,w,h,c)=>{ ctx.fillStyle=P.ink; ctx.fillRect(x-1,y-1,w+2,h+2); ctx.fillStyle=c; ctx.fillRect(x,y,w,h); };
  softShadow(sx,Math.round(e.y),e.kind==='sofa'?24:e.kind==='column'?10:7);
  switch(e.kind){
    case 'roll': if(e.sub==='token'){ const r=Math.floor(G.t*12)%4; o(sx-10,sy-22,20,20,'#ffd23f'); ctx.fillStyle='#b08010'; ctx.fillRect(sx-6+r,sy-14,6,4); G.labels.push(['ШТРАФ',sx,sy-12,5,'#6a4a00']); } else if(e.sub==='coco'){ const r=Math.floor(e.anT*8)%4; disc(ctx,sx,sy-6,6,6,P.ink); disc(ctx,sx,sy-6,5,5,'#8a5a2a'); ctx.fillStyle='#4a2a10'; const a=[[-2,-9],[2,-8],[0,-4],[-3,-5]]; for(let k=0;k<3;k++){ const q=a[(k+r)%4]; ctx.fillRect(sx+q[0],sy+q[1],2,2);} ctx.fillStyle='#c08a5a'; ctx.fillRect(sx-3,sy-10,2,1);} else { o(sx-8,sy-14,16,12,e.col||'#d83a3a'); ctx.fillStyle=shade(e.col||'#d83a3a',-.3); ctx.fillRect(sx-8,sy-9,16,2); ctx.fillStyle=P.ink; ctx.fillRect(sx-6,sy-2,3,2); ctx.fillRect(sx+3,sy-2,3,2); ctx.fillRect(sx-2,sy-17,4,3); } break;
    case 'column': if(!e.broken){ o(sx-7,sy-110,14,110,'#e9dfc4'); ctx.fillStyle='#d7caa8'; ctx.fillRect(sx+3,sy-110,3,110); ctx.fillStyle=LINE_COL[G.lv.line]; ctx.fillRect(sx-7,sy-70,14,4); for(let i=0;i<3-e.hp;i++){ ctx.fillStyle=P.ink; ctx.fillRect(sx-5+i*3,sy-50+i*9,4,1); ctx.fillRect(sx-3+i*3,sy-49+i*9,1,4);} } else { o(sx-9,sy-8,18,8,'#d7caa8'); o(sx-4,sy-14,7,6,'#e9dfc4'); } break;
    case 'duck': { const b=Math.floor(e.anT*6)%2; o(sx-5,sy-7-b,10,6,'#fff6d0'); o(sx+(e.face>0?3:-6),sy-11-b,4,4,'#fff6d0'); ctx.fillStyle='#ff9a1a'; ctx.fillRect(sx+(e.face>0?7:-8),sy-10-b,2,1); ctx.fillStyle=P.ink; ctx.fillRect(sx+(e.face>0?5:-5),sy-10-b,1,1); if(e.carry){ ctx.fillStyle=WEAPONS[e.carry].col; ctx.fillRect(sx-4,sy-14-b,8,2);} break; }
    case 'sofa': o(sx-22,sy-18,44,12,'#c84a3a'); o(sx-24,sy-22,6,16,'#a83a2a'); o(sx+18,sy-22,6,16,'#a83a2a'); o(sx-22,sy-26,44,8,'#d85a4a'); ctx.fillStyle=P.ink; ctx.fillRect(sx-20,sy-6,3,4); ctx.fillRect(sx+17,sy-6,3,4);
      for(let i=0;i<3;i++){ const px=sx-14+i*14, b=Math.floor(G.t*4+i)%2; ctx.fillStyle=P.ink; ctx.fillRect(px-4,sy-37-b,9,12); ctx.fillStyle=pick(['#ffd0a8']); ctx.fillRect(px-3,sy-36-b,7,6); ctx.fillStyle=['#3a6ad8','#d8a03a','#5ad83a'][i]; ctx.fillRect(px-3,sy-30-b,7,5); ctx.fillStyle=P.ink; ctx.fillRect(px-1,sy-34-b,1,1); ctx.fillRect(px+2,sy-34-b,1,1); } break;
    case 'cake': if(!e.lost){ o(sx-14,sy-34,28,14,'#fff0f8'); o(sx-10,sy-44,20,10,'#ff9ac8'); ctx.fillStyle='#ff4fa3'; for(let i=-12;i<14;i+=5) ctx.fillRect(sx+i,sy-26,3,2); ctx.fillStyle=P.edge; ctx.fillRect(sx-1,sy-50,2,6); if(Math.floor(G.t*8)%2) { ctx.fillStyle='#ff7a1a'; ctx.fillRect(sx-1,sy-53,2,3);} 
      const w=24*e.hp/e.maxhp; ctx.fillStyle=P.ink; ctx.fillRect(sx-13,sy-60,26,4); ctx.fillStyle='#ff7ab8'; ctx.fillRect(sx-12,sy-59,w,2); } break;
    case 'peel': if(!e.used){ o(sx-4,sy-2,8,2,'#ffe03a'); ctx.fillStyle='#ffe03a'; ctx.fillRect(sx-6,sy-3,2,2); ctx.fillRect(sx+4,sy-3,2,2); ctx.fillStyle='#6a5a1a'; ctx.fillRect(sx-1,sy-2,2,1);} break;
    case 'food': o(sx-8,sy-3,16,4,'#e8e0f8'); ctx.fillStyle='#ff5a3a'; ctx.fillRect(sx-6,sy-5,4,3); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx,sy-5,5,3); break;
    case 'poet': { const po=e.poseOv||['idle',0]; const img=personSprite(e.spec,po[0],po[1],'norm',Math.floor(G.t*10)); ctx.drawImage(img,sx-32,sy-60); o(sx-12,sy-2,24,3,'#7a4a2a'); break; }
    case 'smell': for(let i=0;i<4;i++){ const yy=sy-10-((G.t*20+i*10)%40); ctx.fillStyle='#ffe08088'; ctx.fillRect(sx+Math.sin(G.t*3+i)*5,yy,3,2);} o(sx-5,sy-4,10,4,'#fff'); ctx.fillStyle='#ffd23f'; ctx.fillRect(sx-3,sy-5,6,2); break;
    case 'cat': { const b=Math.floor(G.t*8+e.x)%2; const c=e.col||'#ff9a3a'; o(sx-6,sy-6-b,12,5,c); o(sx+(e.face>0?4:-8),sy-10-b,5,5,c); ctx.fillStyle=c; ctx.fillRect(sx+(e.face>0?4:-8),sy-12-b,1,2); ctx.fillRect(sx+(e.face>0?8:-4),sy-12-b,1,2); ctx.fillRect(sx+(e.face>0?-8:6),sy-9+b,2,4); ctx.fillStyle=P.ink; ctx.fillRect(sx+(e.face>0?6:-6),sy-8-b,1,1); break; }
  }
}
