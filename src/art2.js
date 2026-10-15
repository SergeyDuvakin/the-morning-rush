'use strict';
// ================= ART 2: новые герои, все 10 боссов, существа (кот, слизень, турникет, эскалатор, голубь, ДЕДЛАЙН) =================
Object.assign(ACC,{
  scooterFeet:{draw:(x,o)=>{ const y=o.footY; box(x,o.cx-14,y-1,26,2,'#3ff0ff'); box(x,o.cx+10,y-16,2,15,'#9aa0b0'); box(x,o.cx+8,y-17,6,2,P.ink2); disc(x,o.cx-12,y+1,2,2,P.ink2); disc(x,o.cx+10,y+1,2,2,P.ink2); }},
  thermo:{draw:(x,o)=>{ box(x,o.cx-o.bw/2-12,o.shY+1+o.p.hy,12,13,'#1fc8b8'); box(x,o.cx-o.bw/2-12,o.shY+5+o.p.hy,12,2,'#0a8a7a'); box(x,o.cx-o.bw/2-9,o.shY+2+o.p.hy,5,2,'#fff'); }},
  capBack:{draw:(x,o)=>{ disc(x,o.hx,o.hy-o.hr+3,o.hr,3,'#ff6a1a'); box(x,o.hx-o.hr-5,o.hy-o.hr+3,6,2,'#ff6a1a'); }},
  tube:{draw:(x,o)=>{ line(x,o.cx-o.bw/2-4,o.hipY+2,o.cx-o.bw/2-10,o.shY-10+o.p.hy,'#3a3a3a',4); box(x,o.cx-o.bw/2-12,o.shY-13+o.p.hy,4,3,'#ff4fa3'); }},
  bigphones:{draw:(x,o)=>{ line(x,o.hx-o.hr-1,o.hy-3,o.hx-2,o.hy-o.hr-3,'#3a2a5a',2); line(x,o.hx-2,o.hy-o.hr-3,o.hx+o.hr+1,o.hy-3,'#3a2a5a',2); disc(x,o.hx-o.hr,o.hy,3,4,P.neonCyan); disc(x,o.hx+o.hr+1,o.hy,3,4,P.neonCyan);} },
  shaker:{hand:(x,o)=>{ box(x,o.hand[0]-2,o.hand[1]-8,5,9,'#ff4a8a'); box(x,o.hand[0]-2,o.hand[1]-9,5,2,'#fff'); }},
  stache:{draw:(x,o)=>{ box(x,o.hx-2,o.hy+o.hr*.5-1,10,2,'#3a2a1a'); box(x,o.hx-3,o.hy+o.hr*.5,2,2,'#3a2a1a'); box(x,o.hx+7,o.hy+o.hr*.5,2,2,'#3a2a1a'); }},
  horns:{draw:(x,o)=>{ line(x,o.hx-o.hr+1,o.hy-o.hr+2,o.hx-o.hr-3,o.hy-o.hr-6,'#ff3a1a',2); line(x,o.hx+o.hr-1,o.hy-o.hr+2,o.hx+o.hr+3,o.hy-o.hr-6,'#ff3a1a',2); box(x,o.hx-o.hr,o.hy-o.hr+1,o.hr*2+2,3,'#1a1a2a'); box(x,o.hx-2,o.hy-o.hr-1,7,2,'#ffd23f'); }},
  steam:{draw:(x,o)=>{ for(let i=0;i<4;i++) disc(x,o.hx-o.hr-6-i*2,o.hy-o.hr-4-i*4,2+(i%2),2,'#cfc8d8'); }},
  crown:{draw:(x,o)=>{ box(x,o.hx-o.hr+1,o.hy-o.hr-2,o.hr*2,4,'#ffd23f'); for(let i=0;i<3;i++) box(x,o.hx-o.hr+1+i*o.hr*.9,o.hy-o.hr-5,2,3,'#ffd23f'); box(x,o.hx-1,o.hy-o.hr-1,2,2,P.red); }},
  baulRobe:{draw:(x,o)=>{ const bx=o.cx-o.bw/2-1,by=o.shY+1,w=o.bw+2,h=o.bh+2; for(let i=0;i<w;i+=3) box(x,bx+i,by,1,h,'#d83a6f'); for(let j=0;j<h;j+=3) box(x,bx,by+j,w,1,'#3a6fd8'); }},
  baulPile:{draw:(x,o)=>{ const c=['#d83a6f','#3a6fd8','#3ab86f']; for(let k=0;k<3;k++){ const bx=o.cx-24+k*2,by=o.footY-10-k*9; box(x,bx,by,10,9,P.white); for(let i=0;i<10;i+=3) box(x,bx+i,by,1,9,c[k]); } }},
  mohawk:{draw:(x,o)=>{ for(let i=-4;i<=4;i+=2) box(x,o.hx+i,o.hy-o.hr-6+Math.abs(i)/2,2,6,P.neonPink); }},
  amp:{draw:(x,o)=>{ box(x,o.cx-26,o.footY-14,11,14,'#2a2a2a'); disc(x,o.cx-21,o.footY-7,3,3,'#5a5a5a'); box(x,o.cx+14,o.footY-8,10,8,'#d83a3a'); disc(x,o.cx+19,o.footY-9,5,2,'#e8e0d0'); }},
  queue:{draw:(x,o)=>{ for(let k=0;k<3;k++){ const qx=o.cx-14-k*7, qy=o.footY; box(x,qx-3,qy-22+k,7,20-k,shade('#8a6ab8',-.15*k)); disc(x,qx,qy-25+k,3,3,shade('#ffd0a8',-.1*k)); box(x,qx-1,qy-26+k,1,1,P.ink); box(x,qx+1,qy-26+k,1,1,P.ink); } }},
  longcoat:{draw:(x,o)=>{ box(x,o.cx-o.bw/2,o.hipY-2,o.bw,o.footY-o.hipY-2,'#8a6ab8'); }},
  cart:{draw:(x,o)=>{ const bx=o.cx+9,by=o.footY-17; box(x,bx,by,15,14,P.white); for(let i=0;i<15;i+=3) box(x,bx+i,by,1,14,'#d83a6f'); for(let j=0;j<14;j+=4) box(x,bx,by+j,15,1,'#d83a6f'); disc(x,bx+3,o.footY-1,2,2,P.ink2); disc(x,bx+12,o.footY-1,2,2,P.ink2); }},
  tie:{draw:(x,o)=>{ box(x,o.cx,o.shY+1+o.p.hy,2,8,P.red); }},
  vest:{draw:(x,o)=>{ box(x,o.cx-o.bw/2+1,o.shY+2+o.p.hy,o.bw-2,3,'#ffd23f'); }},
});
Object.assign(HERO_SPECS,{
  rustam:mkSpec({skin:'#d89668',hair:'#2a1a10',hairStyle:'bald',top:'#ff6a1a',belly:'#ff8a3a',pants:'#2a3a5a',shoes:'#1a1a22',headR:7,bodyW:10,acc:['capBack','thermo','scooterFeet'],face:{eyeL:3,eyeR:3,seed:3,tooth:1,stubble:1}}),
  varya:mkSpec({skin:'#ffd8b8',hair:'#8a3ad8',hairStyle:'hood',top:'#ffe03a',belly:'#fff07a',pants:'#3a3a6a',shoes:'#ff4fa3',headR:8,bodyW:9,bodyH:10,acc:['tube','bigphones'],face:{eyeL:4,eyeR:3,seed:4,blush:1,mouth:'smug'}}),
  gena:mkSpec({skin:'#f2b48a',hair:'#3a2a1a',hairStyle:'short',top:'#f8f8f0',belly:'#f2b48a',pants:'#d83a3a',shoes:'#fff',headR:6,bodyW:18,bodyH:14,legH:8,acc:['stache','shaker'],face:{eyeL:2,eyeR:2,seed:5,tooth:1}}),
});
Object.assign(BOSSES,{
  machinist:{n:'МАШИНИСТ-ДЕМОН',sub:'Следующая — ваша',hp:55,spec:()=>mkSpec({skin:'#e85a4a',hair:'#1a1a2a',hairStyle:'short',top:'#2a2a3a',belly:'#3a3a4a',pants:'#1a1a2a',shoes:'#000',headR:9,bodyW:16,bodyH:14,acc:['horns','vest'],face:{eyeL:4,eyeR:4,seed:6,mouth:'smug',stubble:1}})},
  escalator:{n:'ЭСКАЛАТОР-ПОЖИРАТЕЛЬ',sub:'Стойте справа. Внутри',hp:60,creature:'escalator'},
  baulking:{n:'КОРОЛЬ БАУЛОВ',sub:'Всё своё ношу собой',hp:60,spec:()=>mkSpec({skin:'#d89668',hair:'#5a3a1a',hairStyle:'short',top:'#ffffff',belly:'#ffffff',pants:'#3a2a3a',headR:9,bodyW:18,bodyH:15,acc:['baulRobe','crown','baulPile'],face:{eyeL:3,eyeR:2,seed:7,mouth:'smug',stubble:1}})},
  pigeon:{n:'ГОЛУБИНЫЙ ГЕНЕРАЛ',sub:'Курлык. В атаку',hp:55,creature:'pigeon'},
  orchestra:{n:'УЛИЧНЫЙ РОК-ОРКЕСТР',sub:'Последняя песня. Опять',hp:60,spec:()=>mkSpec({skin:'#ffd0a8',hair:'#ff4fa3',hairStyle:'bald',top:'#1a1a1a',belly:'#2a2a2a',pants:'#3a5aa8',shoes:'#fff',headR:8,bodyW:12,acc:['mohawk','amp','guitar'],face:{eyeL:3,eyeR:4,seed:8,tooth:1}})},
  queen:{n:'КОРОЛЕВА ОЧЕРЕДИ',sub:'Вас тут не стояло',hp:60,spec:()=>mkSpec({skin:'#ffd8b8',hair:'#c83a8a',hairStyle:'bun',top:'#8a6ab8',belly:'#a88ad8',pants:'#8a6ab8',shoes:'#3a2a4a',headR:8,bodyW:13,bodyH:13,legH:8,acc:['longcoat','queue','crown'],face:{eyeL:2,eyeR:3,seed:9,mouth:'smug',blush:1}})},
  deadline:{n:'ДЕДЛАЙН',sub:'09:00:00',hp:80,creature:'deadline'},
});
const BOSS_ORDER=['babatank','turnstile','controller','machinist','escalator','baulking','pigeon','orchestra','queen','deadline'];
// ---- существа: свой рисунок, тот же контур ----
const CRC=new Map();
function creatureSprite(kind,pose,fr){ const key=kind+pose+fr; let c=CRC.get(key); if(c) return c;
  const S={cat:[64,64],cat2:[64,64],slug:[64,64],turnstile:[96,96],escalator:[96,96],pigeon:[96,96],deadline:[96,96]}[kind]; const [w,h]=S; const [cc,x]=mkc(w,h);
  const at=pose==='attack', hu=pose==='hurt'||pose==='ko', ko=pose==='ko', wk=pose==='walk'?fr%2:0;
  const eyes=(cx,cy,r1,r2,dx)=>{ if(ko){ line(x,cx-r1,cy-r1,cx+r1,cy+r1,P.ink,1); line(x,cx-r1,cy+r1,cx+r1,cy-r1,P.ink,1); line(x,cx+dx-r2,cy-r2,cx+dx+r2,cy+r2,P.ink,1); line(x,cx+dx-r2,cy+r2,cx+dx+r2,cy-r2,P.ink,1); return; } disc(x,cx,cy,r1,r1,P.white); disc(x,cx+dx,cy+1,r2,r2,P.white); box(x,cx+(hu?-1:1),cy+(at?-1:0),2,2,P.ink); box(x,cx+dx+(hu?1:0),cy+1,2,2,P.ink); };
  if(kind==='cat'||kind==='cat2'){ const C1=kind==='cat2'?'#e8862a':'#3a3a44', C2=kind==='cat2'?'#ffb060':'#5a5a66'; const by=h-8, bx=30; const st=pose==='attack'?-3:0;
    disc(x,bx,by-8+st,13,8,C1); disc(x,bx+3,by-6+st,8,5,C2); // тело
    for(const [lx,o] of [[bx-9,wk],[bx-3,-wk],[bx+5,wk],[bx+10,-wk]]) box(x,lx,by-2+o,3,4,C1);
    line(x,bx-12,by-10,bx-20,by-22-(fr%2)*2,C1,3); // хвост
    const hx=bx+12+(at?4:0), hy=by-19+st; disc(x,hx,hy,9,8,C1); box(x,hx-8,hy-12,4,6,C1); box(x,hx+4,hy-12,4,6,C1); box(x,hx-7,hy-10,2,3,'#ff9ac0'); box(x,hx+5,hy-10,2,3,'#ff9ac0');
    if(kind==='cat'){ box(x,hx-7,hy-11,14,3,'#2a3a8a'); box(x,hx-2,hy-13,5,2,'#2a3a8a'); } else { for(let k=0;k<3;k++) box(x,bx-6+k*5,by-14,2,5,'#b85a10'); } // фуражка / полоски
    if(!ko){ disc(x,hx-3,hy,3,3,'#ffd23f'); disc(x,hx+4,hy+1,2,2,'#ffd23f'); box(x,hx-3,hy-1,1,3,P.ink); box(x,hx+4,hy,1,2,P.ink);} else eyes(hx-3,hy,2,2,7);
    box(x,hx,hy+4,2,1,'#ff9ac0'); line(x,hx+6,hy+3,hx+12,hy+2,'#ddd',1); line(x,hx-6,hy+3,hx-12,hy+2,'#ddd',1); if(at){ for(let i=0;i<3;i++) line(x,hx+10,hy-4+i*3,hx+16,hy-6+i*3,'#fff',1);} }
  else if(kind==='slug'){ const by=h-6, sq=pose==='attack'?1.25:pose==='walk'?(fr%2?1.1:.95):1, bx=30;
    disc(x,bx,by-7,Math.round(15*sq),Math.round(8/sq),'#7ad84a'); disc(x,bx+6,by-14,Math.round(9*sq),Math.round(9/sq),'#8ae05a'); disc(x,bx-4,by-5,10,4,'#b6f07a');
    for(const [dx,len,r] of [[2,9,4],[10,7,3]]){ line(x,bx+dx,by-20,bx+dx+(hu?-3:1),by-20-len,'#7ad84a',2); }
    if(ko){ eyes(bx+3,by-30,3,2,8); } else { disc(x,bx+3,by-30,4,4,P.white); disc(x,bx+11,by-28,3,3,P.white); box(x,bx+4,by-30,2,2,P.ink); box(x,bx+11,by-28,2,2,P.ink); }
    box(x,bx+4,by-12,6,2,'#2a5a1a'); box(x,bx+6,by-11,2,2,P.white); box(x,bx-8,by-20,14,2,P.ink2); box(x,bx-2,by-18,3,2,P.ink2); box(x,bx+6,by-20,1,5,P.edge); }
  else if(kind==='turnstile'){ const cx=48, by=h-6, sh=hu?2:0; box(x,cx-20+sh,by-62,40,62,'#9aa0b0'); box(x,cx-16+sh,by-58,32,16,'#2a2a3a');
    if(ko){ eyes(cx-6,by-50,3,3,12);} else { box(x,cx-10,by-54,6,6,at?P.red:P.neonLime); box(x,cx+5,by-53,4,4,at?P.red:P.neonLime); }
    box(x,cx-18,by-38,36,8,'#c0c6d0'); for(let i=-16;i<16;i+=4) box(x,cx+i,by-37,2,6,P.ink); // зубы-прорезь
    const a=at?-14:wk?4:0; box(x,cx-44,by-30+a,26,6,'#c0c6d0'); box(x,cx+18,by-30-a,26,6,'#c0c6d0'); box(x,cx-16,by-8,8,8,'#6a6a7a'); box(x,cx+8,by-8,8,8,'#6a6a7a'); box(x,cx-4,by-20,8,4,'#ff4fa3'); }
  else if(kind==='escalator'){ const by=h-4; for(let i=0;i<7;i++){ const sx=8+i*11, sy=by-10-i*9+((fr+i)%2); box(x,sx,sy,13,10,'#6a6a7a'); box(x,sx,sy,13,2,'#9aa0b0'); if(i>1&&i<6) { box(x,sx+2,sy+9,3,4,P.white); box(x,sx+8,sy+9,3,4,P.white);} }
    line(x,6,by-20,84,by-86,'#2a2a2a',4); // поручень
    const mx=60,my=by-50; disc(x,mx,my,at?14:9,at?11:6,'#3a0a14'); for(let i=-10;i<12;i+=4){ box(x,mx+i,my-(at?9:5),2,4,P.white); box(x,mx+i+1,my+(at?6:3),2,3,P.white);} 
    if(!ko){ disc(x,mx-14,my-22,6,6,P.white); disc(x,mx+6,my-26,4,4,P.white); box(x,mx-13+(hu?-2:0),my-22,3,3,P.ink); box(x,mx+6,my-26,2,2,P.ink); line(x,mx-20,my-30,mx-8,my-27,P.ink,2);} else eyes(mx-14,my-22,5,4,20); }
  else if(kind==='pigeon'){ const cx=46, by=h-6, bob=wk?2:0;
    disc(x,cx,by-26+bob,26,20,'#8a8aa8'); disc(x,cx+4,by-20+bob,18,12,'#a8a8c8'); disc(x,cx+14,by-48+bob,12,11,'#6a6a88'); box(x,cx+8,by-42+bob,14,4,'#5ac8a0'); box(x,cx+8,by-38+bob,14,3,'#a05ac8');
    box(x,cx+24,by-50+bob,8,3,'#ff9a3a'); box(x,cx+24,by-47+bob,5,2,'#e07a1a');
    if(ko) eyes(cx+12,by-52,3,2,6); else { disc(x,cx+12,by-52+bob,4,4,'#ff6a1a'); box(x,cx+12,by-52+bob,2,2,P.ink); }
    box(x,cx+2,by-64+bob,26,5,'#3a5a2a'); box(x,cx+6,by-68+bob,16,4,'#3a5a2a'); box(x,cx+2,by-60+bob,30,2,P.ink); box(x,cx+12,by-67+bob,4,3,P.edge); // фуражка генерала
    for(let i=0;i<3;i++) disc(x,cx-6+i*6,by-30+bob,2,2,[P.edge,P.red,P.edge][i]); // медали
    const wg=at?-16:hu?6:0; disc(x,cx-16,by-28+wg+bob,14,7,'#6a6a88'); for(let i=0;i<4;i++) box(x,cx-28+i*5,by-24+wg+bob,3,5,'#5a5a78');
    box(x,cx-6,by-6,3,6,'#ff9a3a'); box(x,cx+6,by-6,3,6,'#ff9a3a'); box(x,cx-9,by-1,8,2,'#ff9a3a'); box(x,cx+4,by-1,8,2,'#ff9a3a'); }
  else if(kind==='deadline'){ const cx=48, cy=40+(wk?1:0); box(x,cx-26,cy+22,52,30,'#2a2a3a'); box(x,cx-2,cy+24,4,18,P.red); // пиджак+галстук
    disc(x,cx,cy,28,28,'#ffd23f'); disc(x,cx,cy,24,24,'#fffaf0'); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; box(x,Math.round(cx+Math.sin(a)*21),Math.round(cy-Math.cos(a)*21),2,2,P.ink); }
    line(x,cx,cy,cx,cy-18,P.ink,3); line(x,cx,cy,cx+(at?14:1),cy-(at?-6:13),P.red,2);
    if(ko) eyes(cx-9,cy-6,4,3,18); else { disc(x,cx-9,cy-6,5,4,P.white); disc(x,cx+9,cy-5,3,3,P.white); box(x,cx-9,cy-6,2,2,P.ink); box(x,cx+9,cy-5,2,2,P.ink); line(x,cx-15,cy-14,cx-4,cy-10,P.ink,2); line(x,cx+14,cy-12,cx+5,cy-10,P.ink,2); }
    box(x,cx-8,cy+10,16,(at?6:3),'#5a1020'); for(let i=-6;i<8;i+=4) box(x,cx+i,cy+10,2,2,P.white);
    const ar=at?-14:0; line(x,cx-26,cy+26,cx-40,cy+10+ar,'#2a2a3a',5); line(x,cx+26,cy+26,cx+42,cy+10+ar,'#2a2a3a',5); disc(x,cx-41,cy+8+ar,4,4,'#ffd0a8'); disc(x,cx+43,cy+8+ar,4,4,'#ffd0a8');
    box(x,cx-14,h-8,6,8,'#1a1a2a'); box(x,cx+8,h-8,6,8,'#1a1a2a'); box(x,cx-17,h-3,10,3,P.ink2); box(x,cx+6,h-3,10,3,P.ink2); }
  c=outline(cc,w,h,1); CRC.set(key,c); return c; }
