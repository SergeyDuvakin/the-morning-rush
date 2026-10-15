'use strict';
// ================= ART: процедурный «всратый» пиксель-арт (стиль ШМЯКОДРОМА, своя метро-палитра) =================
const P={ink:'#1a1020',ink2:'#2a1d33',tile:'#e9dfc4',tile2:'#d7caa8',grout:'#b5a585',lamp:'#ffcc5c',lampHot:'#fff1b8',
  floor:'#6c6274',floor2:'#5a5163',edge:'#ffd23f',rail:'#3a3142',dark:'#1b1426',neonPink:'#ff4fa3',neonCyan:'#3ff0ff',neonLime:'#b6ff3f',
  skin:['#ffd0a8','#f2b48a','#d89668','#a8714a'],white:'#fffaf0',red:'#ff4a4a',blood:'#ff6a3a'};
// оттенок ветки
const LINE_COL=['#d8265e','#19b874','#3d6ff0','#ff8a1f','#9b4dff','#ffc81f','#8f98a8','#8fe03a','#2ed3c4','#9a5a2e'];
function shade(hex,k){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255; const f=v=>clamp(Math.round(k>0?v+(255-v)*k:v*(1+k)),0,255);
  return '#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1); }
// --- примитивы на маленьком канвасе ---
function disc(x,cx,cy,rx,ry,col){ x.fillStyle=col; ry=ry||rx; for(let yy=-ry;yy<=ry;yy++){ const w=Math.round(rx*Math.sqrt(Math.max(0,1-(yy*yy)/((ry+.35)*(ry+.35))))); x.fillRect(Math.round(cx-w),Math.round(cy+yy),w*2+1,1);} }
function box(x,a,b,w,h,col){ x.fillStyle=col; x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h)); }
function line(x,x0,y0,x1,y1,col,th=2){ x.fillStyle=col; const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0))); for(let i=0;i<=n;i++){ const t=i/n; x.fillRect(Math.round(x0+(x1-x0)*t-th/2),Math.round(y0+(y1-y0)*t-th/2),th,th);} }
// жирный тёмный контур вокруг силуэта (2px снаружи для читаемости, как у слизней)
function outline(src,w,h,th=1){ const [c,x]=mkc(w,h); const d=src.getContext('2d').getImageData(0,0,w,h).data; const o=x.createImageData(w,h); const od=o.data;
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){ const k=(y*w+i)*4; if(d[k+3]>0){ od[k]=d[k];od[k+1]=d[k+1];od[k+2]=d[k+2];od[k+3]=255; continue; }
    let near=false; for(let dy=-th;dy<=th&&!near;dy++)for(let dx=-th;dx<=th;dx++){ if(Math.abs(dx)+Math.abs(dy)>th+ (th>1?0:0)) continue; const xx=i+dx,yy=y+dy; if(xx<0||yy<0||xx>=w||yy>=h) continue; if(d[(yy*w+xx)*4+3]>0){near=true;break;} }
    if(near){ od[k]=26;od[k+1]=16;od[k+2]=32;od[k+3]=255; } }
  x.putImageData(o,0,0); return c; }
// --- лица: кривые глаза разного размера, зрачки в разные стороны ---
function face(x,cx,cy,s,f,mood,t){ // s: радиус головы
  const eL=f.eyeL||3, eR=f.eyeR||2, ex=Math.max(2,Math.round(s*.42));
  const blink=mood!=='ko'&&((t*7+f.seed*13)%37)<1;
  const eye=(px,py,r,pdx,pdy)=>{ if(blink){ box(x,px-r,py,r*2+1,1,P.ink); return; } disc(x,px,py,r,r,P.white); box(x,px+pdx,py+pdy,r>2?2:1,r>2?2:1,P.ink); };
  if(mood==='ko'){ // крестики
    for(const [px,r] of [[cx-ex+1,eL],[cx+ex,eR]]){ line(x,px-r,cy-r-1,px+r,cy+r-1,P.ink,1); line(x,px-r,cy+r-1,px+r,cy-r-1,P.ink,1);} 
  } else { eye(cx-ex+1,cy-2,eL,mood==='hurt'?-1:(f.look||0),mood==='angry'?-1:0); eye(cx+ex,cy-1+(f.cross||0),eR,mood==='hurt'?1:1,mood==='angry'?-1:1); }
  if(mood==='angry'){ line(x,cx-ex-2,cy-eL-3,cx-1,cy-eL-1,P.ink,1); line(x,cx+ex+eR,cy-eR-3,cx+2,cy-eR-1,P.ink,1); }
  if(f.brows){ line(x,cx-ex-1,cy-eL-3,cx-ex+3,cy-eL-4,f.hairCol||P.ink,1); }
  // рот
  const my=cy+Math.round(s*.5);
  if(mood==='hurt'||mood==='ko'){ disc(x,cx+1,my,2,2,'#5a1020'); box(x,cx,my-1,2,1,'#ff8aa0'); }
  else if(mood==='angry'){ box(x,cx-2,my,6,2,'#5a1020'); box(x,cx-1,my,1,1,P.white); box(x,cx+2,my,1,1,P.white); }
  else if(f.mouth==='o'){ disc(x,cx+1,my,1,2,'#5a1020'); }
  else if(f.mouth==='smug'){ line(x,cx-2,my+1,cx+3,my-1,P.ink,1); }
  else { box(x,cx-2,my,5,1,P.ink); box(x,cx+3,my-1,1,1,P.ink); if(f.tooth) box(x,cx,my+1,2,2,P.white); }
  if(window.APRIL1){ box(x,cx-4,my-2,9,2,'#3a2a1a'); box(x,cx-5,my-1,2,1,'#3a2a1a'); box(x,cx+4,my-1,2,1,'#3a2a1a'); }
  if(f.blush){ box(x,cx-ex-2,cy+2,2,1,'#ff8a8a'); box(x,cx+ex+1,cy+2,2,1,'#ff8a8a'); }
  if(f.stubble){ for(let i=0;i<5;i++) box(x,cx-3+i*2,my+2+(i%2),1,1,shade(f.skin,-.35)); }
}
// --- поза: смещения частей тела ---
function pose(name,fr){ // fr: номер кадра
  const p={lean:0,hy:0,legL:0,legR:0,armF:[6,10],armB:[-5,9],sq:1,flat:false,kick:0,arms:'down'};
  const s=Math.sin(fr/8*Math.PI*2);
  switch(name){
    case 'idle': p.hy=fr%6<3?0:1; p.armF=[5,10+(fr%6<3?0:1)]; break;
    case 'walk': p.legL=Math.round(s*4); p.legR=-p.legL; p.hy=Math.abs(s)>.7?-1:0; p.armF=[4-p.legL,10]; p.armB=[-4+p.legL,10]; p.lean=1; break;
    case 'p1': p.armF=fr<1?[2,4]:[14,2]; p.lean=fr<1?-1:2; break;
    case 'p2': p.armB=fr<1?[-6,3]:[13,0]; p.armF=[2,8]; p.lean=fr<1?-2:3; break;
    case 'p3': p.armF=fr<1?[-4,-6]:[15,-6]; p.armB=fr<1?[-8,-6]:[10,-2]; p.lean=fr<1?-3:4; p.hy=fr<1?1:-1; p.legL=3; p.legR=-2; break;
    case 'spin': p.armF=[12,2]; p.armB=[-12,2]; p.lean=0; p.legL=2;p.legR=-2; break;
    case 'jump': p.legL=-3; p.legR=2; p.armF=[6,-4]; p.armB=[-6,-3]; p.hy=-1; break;
    case 'kick': p.kick=1; p.armF=[4,0]; p.armB=[-6,-2]; p.lean=-1; break;
    case 'slide': p.flat=true; break;
    case 'dash': p.lean=4; p.armF=[13,5]; p.armB=[9,8]; p.legL=4; p.legR=-4; break;
    case 'hurt': p.lean=-3; p.armF=[6,-3]; p.armB=[-7,-4]; p.hy=1; break;
    case 'down': p.flat=true; break;
    case 'super': p.armF=[8,-8]; p.armB=[-8,-8]; p.hy=fr%2?-1:0; break;
    case 'grab': p.armF=[12,6]; p.armB=[11,9]; p.lean=2; break;
    case 'cheer': p.armF=[5,-10]; p.armB=[-5,-10]; p.hy=fr%4<2?-2:0; break;
    case 'sit': p.legL=-4; p.legR=-4; p.hy=6; break;
  }
  return p;
}
// --- человек ---
// spec: {skin,hair,hairStyle,top,pants,shoes,headR,bodyW,bodyH,legH,face:{},acc:[]}
const SPRC=new Map();
function personSprite(spec,poseName,fr,mood,t){
  const key=spec.id+'|'+poseName+'|'+fr+'|'+mood+'|'+((t*7+spec.face.seed*13)%37<1?1:0);
  let c=SPRC.get(key); if(c) return c;
  const Wc=64,Hc=64; const [cc,x]=mkc(Wc,Hc); const p=pose(poseName,fr);
  const hr=spec.headR||7, bw=spec.bodyW||10, bh=spec.bodyH||11, lh=spec.legH||9;
  const footY=Hc-4, hipY=footY-lh, shY=hipY-bh, cx=32+p.lean;
  if(p.flat){ // лежит: просто горизонтальная куча
    const y0=Hc-8; box(x,14,y0-3,bh+lh,6,spec.top); box(x,14+bh,y0-3,lh,6,spec.pants); disc(x,12,y0-3,hr,hr-1,spec.skin);
    face(x,12,y0-4,hr,{...spec.face,skin:spec.skin},mood==='ko'?'ko':'hurt',t); if(spec.hairStyle!=='bald') box(x,4,y0-9,6,10,spec.hair);
    for(const a of spec.acc) ACC[a]&&ACC[a].flat&&ACC[a].flat(x,12,y0,spec);
    c=outline(cc,Wc,Hc,1); SPRC.set(key,c); return c; }
  // задняя рука
  line(x,cx-2,shY+3,cx+p.armB[0]-2,shY+p.armB[1]+2,shade(spec.top,-.25),3);
  disc(x,cx+p.armB[0]-2,shY+p.armB[1]+2,2,2,shade(spec.skin,-.15));
  // ноги
  const leg=(lx,off,col)=>{ box(x,lx,hipY,4,lh-2,col); box(x,lx+off-1,footY-3,6,3,spec.shoes); };
  if(p.kick){ leg(cx-4,0,shade(spec.pants,-.2)); line(x,cx+1,hipY+2,cx+12,hipY-1,spec.pants,4); box(x,cx+11,hipY-3,4,5,spec.shoes); }
  else { leg(cx-5+p.legR,p.legR>0?1:0,shade(spec.pants,-.2)); leg(cx+1+p.legL,p.legL>0?1:0,spec.pants); }
  // тело (пузико — овал)
  disc(x,cx,shY+bh/2+1+p.hy,Math.ceil(bw/2),Math.ceil(bh/2)+1,spec.top);
  if(spec.belly) disc(x,cx+2,shY+bh/2+3+p.hy,Math.ceil(bw/2)-2,Math.ceil(bh/2)-1,spec.belly);
  box(x,cx-bw/2+1,hipY-2,bw-2,3,spec.pants);
  // голова (большая, чуть кривая)
  const hx=cx+1, hy=shY-hr+2+p.hy;
  disc(x,hx,hy,hr+ (spec.headW||0),hr,spec.skin);
  if(spec.hairStyle==='cap'){ disc(x,hx,hy-hr+3,hr,3,spec.hair); box(x,hx,hy-hr+3,hr+5,2,spec.hair); }
  else if(spec.hairStyle==='scarf'){ disc(x,hx,hy-2,hr+1,hr,spec.hair); disc(x,hx+1,hy+1,hr-2,hr-2,spec.skin); box(x,hx-2,hy+hr-1,5,3,spec.hair); }
  else if(spec.hairStyle==='beret'){ disc(x,hx-1,hy-hr+2,hr+1,3,spec.hair); box(x,hx-1,hy-hr-2,2,2,spec.hair); box(x,hx-hr-1,hy-3,2,6,'#ddd'); }
  else if(spec.hairStyle==='spiky'){ for(let i=-hr;i<=hr;i+=3) line(x,hx+i,hy-hr+3,hx+i+1,hy-hr-3,spec.hair,2); box(x,hx-hr,hy-hr+1,hr*2,3,spec.hair); }
  else if(spec.hairStyle==='bun'){ disc(x,hx,hy-hr+2,hr,3,spec.hair); disc(x,hx-1,hy-hr-2,3,3,spec.hair); }
  else if(spec.hairStyle==='hood'){ disc(x,hx-1,hy,hr+2,hr+1,spec.hair); disc(x,hx+2,hy+1,hr-1,hr-1,spec.skin); }
  else if(spec.hairStyle==='helmet'){ disc(x,hx,hy-3,hr+1,hr-2,spec.hair); box(x,hx-hr,hy-2,hr*2+2,1,shade(spec.hair,-.3)); }
  else if(spec.hairStyle!=='bald'){ disc(x,hx-1,hy-hr+2,hr,3,spec.hair); box(x,hx-hr,hy-hr+2,3,6,spec.hair); }
  face(x,hx+2,hy+1,hr,{...spec.face,skin:spec.skin},mood,t);
  // аксессуары за/перед телом
  for(const a of spec.acc) ACC[a]&&ACC[a].draw&&ACC[a].draw(x,{cx,hx,hy,hr,shY,hipY,bw,bh,footY,p,spec});
  // передняя рука
  line(x,cx+1,shY+3+p.hy,cx+p.armF[0],shY+p.armF[1]+1,spec.top,3);
  disc(x,cx+p.armF[0],shY+p.armF[1]+1,2,2,spec.skin);
  for(const a of spec.acc) ACC[a]&&ACC[a].hand&&ACC[a].hand(x,{cx,hx,hy,hr,shY,hipY,p,spec,hand:[cx+p.armF[0],shY+p.armF[1]+1]});
  c=outline(cc,Wc,Hc,1); if(SPRC.size>4000) SPRC.clear(); SPRC.set(key,c); return c;
}
// аксессуары
const ACC={
  backpack:{draw:(x,o)=>{ box(x,o.cx-o.bw/2-5,o.shY+1+o.p.hy,6,o.bh-1,'#3a8fd8'); box(x,o.cx-o.bw/2-5,o.shY+5+o.p.hy,6,2,'#2a6aa8'); box(x,o.cx-o.bw/2-4,o.shY+8+o.p.hy,2,2,P.edge);} },
  mug:{hand:(x,o)=>{ box(x,o.hand[0]-1,o.hand[1]-4,4,5,P.white); box(x,o.hand[0]+3,o.hand[1]-3,1,2,P.white); box(x,o.hand[0]-1,o.hand[1]-4,4,1,'#6b3b1a'); }},
  hugebag:{draw:(x,o)=>{ box(x,o.cx+2,o.shY-2,18,o.bh+8,'#5a3d8a'); box(x,o.cx+2,o.shY+2,18,2,'#3d2766'); box(x,o.cx+8,o.shY-5,6,3,'#3d2766'); }},
  bauls:{hand:(x,o)=>{ for(const [dx,c] of [[0,'#3a6fd8'],[-15,'#d83a6f']]){ const bx=o.hand[0]+dx-3,by=o.hand[1]; box(x,bx,by,10,9,P.white); for(let i=0;i<10;i+=3){box(x,bx+i,by,1,9,c);} for(let j=0;j<9;j+=3) box(x,bx,by+j,10,1,c);} }},
  guitar:{hand:(x,o)=>{ disc(x,o.hand[0]+1,o.hand[1]+3,5,4,'#c86a2a'); disc(x,o.hand[0]+1,o.hand[1]+3,1,1,P.ink); line(x,o.hand[0]+4,o.hand[1]+1,o.hand[0]+12,o.hand[1]-7,'#6b3b1a',2);} , draw:(x,o)=>{box(x,o.cx-14,o.footY-3,8,3,'#4a3a2a'); box(x,o.cx-13,o.footY-4,2,1,P.edge);} },
  box:{draw:(x,o)=>{ box(x,o.cx-o.bw/2-9,o.shY-3+o.p.hy,11,12,'#ffd23f'); box(x,o.cx-o.bw/2-9,o.shY+1+o.p.hy,11,2,'#e09a1a'); }},
  phone:{hand:(x,o)=>{ box(x,o.hand[0]-1,o.hand[1]-5,3,5,'#222'); box(x,o.hand[0],o.hand[1]-4,1,3,P.neonCyan);} },
  whistle:{draw:(x,o)=>{ box(x,o.cx-o.bw/2+1,o.shY+1,o.bw-2,o.bh-3,'#ff7a1a'); box(x,o.cx-o.bw/2+1,o.shY+4,o.bw-2,1,'#ffe066'); }},
  seeds:{hand:(x,o)=>{ disc(x,o.hand[0],o.hand[1]+1,3,3,'#e6d6a8'); }},
  stroller:{draw:(x,o)=>{ const bx=o.cx+8,by=o.hipY-4; disc(x,bx+8,by,9,6,'#ff7ab8'); box(x,bx,by,17,5,'#ff7ab8'); disc(x,bx+3,o.footY-2,2,2,P.ink2); disc(x,bx+13,o.footY-2,2,2,P.ink2); line(x,bx,by-2,o.cx+6,o.shY+8,'#888',1); disc(x,bx+7,by-4,2,2,'#ffb070');}},
  umbrellaHand:{hand:(x,o)=>{ line(x,o.hand[0],o.hand[1],o.hand[0]+12,o.hand[1]-2,'#2a2a3a',1); disc(x,o.hand[0]+12,o.hand[1]-2,1,1,'#2a2a3a'); }},
  cane:{hand:(x,o)=>{ line(x,o.hand[0],o.hand[1],o.hand[0]+2,o.hand[1]+14,'#7a4a2a',2); box(x,o.hand[0]-2,o.hand[1]-1,4,2,'#7a4a2a'); }},
  avoska:{draw:(x,o)=>{ for(let i=0;i<4;i++) box(x,o.cx-10+i*2,o.hipY-1+(i%2),1,7,'#3a8a3a'); disc(x,o.cx-7,o.hipY+5,3,3,'#ff5a3a'); }},
  zzz:{},
  bigcap:{draw:(x,o)=>{ box(x,o.hx-o.hr-1,o.hy-o.hr-1,o.hr*2+4,3,'#2a3a8a'); box(x,o.hx-2,o.hy-o.hr-4,o.hr+6,3,'#2a3a8a'); }},
  headphones:{draw:(x,o)=>{ line(x,o.hx-o.hr,o.hy-2,o.hx,o.hy-o.hr-1,'#222',1); line(x,o.hx,o.hy-o.hr-1,o.hx+o.hr,o.hy-2,'#222',1); box(x,o.hx-o.hr-1,o.hy-2,3,4,P.neonPink); box(x,o.hx+o.hr-1,o.hy-2,3,4,P.neonPink);} },
  gradcap:{draw:(x,o)=>{ box(x,o.hx-o.hr-1,o.hy-o.hr-2,o.hr*2+3,2,P.ink2); box(x,o.hx-2,o.hy-o.hr,5,2,P.ink2); box(x,o.hx+o.hr+1,o.hy-o.hr,1,5,P.edge);} },
  stone:{},
};
// --- персонажи ---
let SPEC_ID=0;
function mkSpec(o){ return Object.assign({id:'s'+(SPEC_ID++),skin:P.skin[0],hair:'#3a2a1a',hairStyle:'short',top:'#4a7ad8',pants:'#2a2f4a',shoes:'#1a1a22',headR:7,bodyW:10,bodyH:11,legH:9,acc:[],face:{seed:Math.random()*9|0}},o); }
const HERO_SPECS={
  serega:mkSpec({skin:'#ffd0a8',hair:'#5a3a22',hairStyle:'hood',top:'#7a3fd8',pants:'#2f3550',shoes:'#ff4a4a',headR:8,bodyW:11,acc:['backpack'],face:{eyeL:3,eyeR:2,seed:1,tooth:1,stubble:1,blush:0}}),
  baba:mkSpec({skin:'#f2c49a',hair:'#a3245a',hairStyle:'beret',top:'#c84a8a',belly:'#e86aa8',pants:'#5a3a6a',shoes:'#4a2a1a',headR:7,bodyW:13,bodyH:12,legH:7,acc:['avoska','cane'],face:{eyeL:2,eyeR:3,seed:2,mouth:'smug',blush:1}}),
};
// --- стикер-плашки («ХРЯСЬ» и т.п.) рисуются текстом на оверлее ---
