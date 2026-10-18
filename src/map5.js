// map5.js — карта дня v5 «ТАБЛО В ВАГОНЕ» (E3, выбор Сергея 18.10). Спека: map_concepts/round2/E3_SPEC.md.
// Экран = стена вагона: LED-табло (часы/погода, бегущая строка новостей, тип дня), табличка маршрута дня с лампочками,
// выдвижная схема линии (выбор станции), карточка станции с портретом героя, дверь-переход и кнопка ПОЕХАЛИ.
// Данные/логика — из map40/day/route (map4Go, map4Idx, dayPlan…), map40.drawMap перекрыт. core.js и viewport не трогаем.
// LED5_FONT: 8-строчный пропорциональный шрифт табло (растеризован из Press Start 2P), столбцы — битовые маски строк
const LED5_FONT={"А": "7c7e1311137e7c", "Б": "7f7f4949497930", "В": "7f7f4949497f36", "Г": "7f7f01010103", "Д": "c0f07f41417fffc0", "Е": "7f7f4949494941", "Ё": "7c7d5554555544", "Ж": "6377087f087763", "З": "22634949497f36", "И": "7f7f30180c7f7f", "Й": "7c7d6131197d7c", "К": "7f7f080c3a7341", "Л": "60703f01017f7f", "М": "7f7f061c067f7f", "Н": "7f7f0808087f7f", "О": "3e7f4141417f3e", "П": "7f7f0101017f7f", "Р": "7f7f1111111f0e", "С": "1c3e6341416322", "Т": "01017f7f0101", "У": "276f4848487f3f", "Ф": "1c3e227f223e1c", "Х": "63771c081c7763", "Ц": "7f7f40407fffc0", "Ч": "070f0808087f7f", "Ш": "7f7f407f407f7f", "Щ": "7f7f407f407fffc0", "Ъ": "017f7f44447c38", "Ы": "7f7f447c007f7f", "Ь": "7f7f4444447c38", "Э": "226b49496b3e1c", "Ю": "7f083e7f417f3e", "Я": "4e6f7911117f7f", "A": "7c7e1311137e7c", "B": "7f7f4949497f36", "C": "1c3e6341416322", "D": "7f7f4141633e1c", "E": "7f7f4949494941", "F": "7f7f0909090901", "G": "1c3e6341497979", "H": "7f7f0808087f7f", "I": "41417f7f4141", "J": "20604040407f3f", "K": "7f7f183c766341", "L": "7f7f40404040", "M": "7f7f061c067f7f", "N": "7f7f060c187f7f", "O": "3e7f4141417f3e", "P": "7f7f1111111f0e", "Q": "3e7f4151713f5e", "R": "7f7f1131796f4e", "S": "266f4949497b32", "T": "01017f7f0101", "U": "3f7f4040407f3f", "V": "0f1f3870381f0f", "W": "3f7f301f307f3f", "X": "63771c081c7763", "Y": "070f78780f07", "Z": "6171795d4f4743", "0": "1c3e6141433e1c", "1": "40427f7f4040", "2": "627379595d4f46", "3": "2061494d4f7b31", "4": "181c16137f7f10", "5": "27674545457d38", "6": "3c7e4b49497930", "7": "030371790d0703", "8": "364f4d59597630", "9": "064f4949693f1e", ".": "6060", ",": "80e060", ":": "3636", ";": "407636", "!": "5f5f07", "?": "060753535b0f06", "-": "080808080808", "+": "08083e3e0808", "°": "020502", "·": "1818", "«": "081c362a1c3622", "»": "22361c2a361c08", "/": "40201008040201", "%": "46251308645231", "(": "1c3e6341", ")": "41633e1c", "'": "0707", "\"": "0707000707", "№": "7f017e004e514e", "→": "1c1c1c1c7f3e1c08", "←": "081c3e7f1c1c1c1c", "▶": "7f3e3e1c1c0808", "—": "0808080808080808", "…": "60000060000060"};
const MAP5={rects:[],labs:[],sheet:false,flip:0,flipTo:null,door:0,doorOn:false,intro:0,introT:1.2,flick:0,lastIdx:-1,msg:null,closeT:0,openSeen:null,lay:null,
  MCK:['Омлетный Ряд','Компотнарка','Лужнички','Шелепихуево','Зорге-Морге','Бутерброд-Сити'],MCD:['Ласточкино','Пародия-Сити','Сетунь-Шутка','Кутузовка','Тестовская','Одинцовка']};
function map5K(){ return Math.max(1,Math.floor(Math.min(W/320,H/180))); }
function m5Calm(){ return !!save.calm; }
// ---------- LED ----------
const LED5C={};
function led5Cols(s){ const o=[]; for(const ch of String(s).toUpperCase()){ if(ch===' '){ o.push(0,0,0); continue; } const g=LED5_FONT[ch]||LED5_FONT['?']; for(let i=0;i<g.length;i+=2) o.push(parseInt(g.substr(i,2),16)); o.push(0); } if(o.length) o.pop(); return o; }
function led5Img(s,col,p,k){ const key=s+'|'+col+'|'+p+'|'+k; if(LED5C[key]) return LED5C[key]; const c=led5Cols(s), cv=document.createElement('canvas'); cv.width=Math.max(1,c.length*p+1); cv.height=8*p+1; const x=cv.getContext('2d');
  x.globalAlpha=.22; x.fillStyle=col; for(let i=0;i<c.length;i++) for(let r=0;r<8;r++) if(c[i]>>r&1) x.fillRect(i*p,r*p,p+1,p+1); x.globalAlpha=1;
  for(let i=0;i<c.length;i++) for(let r=0;r<8;r++) if(c[i]>>r&1){ x.fillStyle=col; x.fillRect(i*p,r*p,k,k); if(k>1){ x.fillStyle=shade(col,.45); x.fillRect(i*p,r*p,1,1); } }
  const o={cv,w:c.length*p,n:c.length}; if(Object.keys(LED5C).length>80) for(const kk in LED5C) delete LED5C[kk]; LED5C[key]=o; return o; }
function led5Grid(w,h,p,k){ const key='g|'+w+'|'+h+'|'+p+'|'+k; if(LED5C[key]) return LED5C[key]; const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d');
  x.fillStyle='#100a0e'; x.fillRect(0,0,w,h); x.fillStyle='#2a171c'; for(let yy=k;yy<h-k;yy+=p) for(let xx=k;xx<w-k;xx+=p) x.fillRect(xx,yy,k,k);
  const o={cv}; LED5C[key]=o; return o; }
function led5Panel(x,y,w,h,k,p){ ctx.fillStyle=P.ink; ctx.fillRect(x-k,y-k,w+2*k,h+2*k); ctx.fillStyle='#3a3442'; ctx.fillRect(x-k,y+h,w+2*k,k); ctx.drawImage(led5Grid(w,h,p,k).cv,x,y);
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(x,y,w,Math.max(1,k)); }
// текст в окне [x0,x0+w): по центру, если влезает; иначе бегущая строка (calm — статично, обрезка по символам с «…»)
function led5Line(s,col,x0,y,w,k,p,scroll,align){ let im=led5Img(s,col,p,k); const pad=p*2;
  if(im.w<=w-pad*2){ const x=align==='left'?x0+pad:Math.round(x0+(w-im.w)/2); ctx.drawImage(im.cv,x,y); return {fit:true,s}; }
  if(!scroll){ let t=s; while(t.length>2&&led5Img(t+'…',col,p,k).w>w-pad*2) t=t.slice(0,-1); im=led5Img(t+'…',col,p,k); ctx.drawImage(im.cv,x0+pad,y); return {fit:false,s:t+'…'}; }
  const per=im.n+14, off=Math.floor(G.t*24)%per; ctx.save(); ctx.beginPath(); ctx.rect(x0+k,y-k,w-2*k,8*p+2*k); ctx.clip(); ctx.drawImage(im.cv,x0+w-pad-off*p,y); ctx.drawImage(im.cv,x0+w-pad-off*p+per*p,y); ctx.restore(); return {fit:false,s,scroll:true}; }
// пиктограмма погоды на LED (8×8 точек)
const LED5_WX={clear:['..#..#..','#..##..#','..####..','.######.','.######.','..####..','#..##..#','..#..#..'],rain:['..###...','.#####..','########','.######.','........','.o..o..o','o..o..o.','........'],
  snow:['..###...','.#####..','########','.######.','........','.*..*..*','...*..*.','.*......'],fog:['........','########','........','.######.','........','########','........','.######.']};
function led5Wx(kind,x,y,k,p){ const R=LED5_WX[kind]||LED5_WX.clear; for(let j=0;j<8;j++) for(let i=0;i<8;i++){ const ch=R[j][i]; if(ch==='.') continue; const col=ch==='#'?(kind==='clear'?'#ffd23f':'#dcdcec'):(ch==='o'?'#5aa0ff':'#ffffff');
  ctx.globalAlpha=.22; ctx.fillStyle=col; ctx.fillRect(x+i*p,y+j*p,p+1,p+1); ctx.globalAlpha=1; ctx.fillRect(x+i*p,y+j*p,k,k); } }
function m5Temp(day,wx){ const r=((day.seed>>>5)%9); return wx==='snow'?-3-r:wx==='rain'?5+r:wx==='fog'?2+(r%6):9+r*1.5|0; }
// ---------- раскладка ----------
function m5Reg(kind,x,y,w,h){ const r={kind,x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)}; MAP5.rects.push(r); if(kind==='lab') MAP5.labs.push(r); return r; }
function m5Lab(s,x,y,size,col,align,kind){ const w=txtW(s,size), h=Math.max(size,MINPX())*1.15, x0=align==='center'?x-w/2:align==='right'?x-w:x; G.labels.push([s,x,y,size,col,align||'left',null]); return m5Reg(kind||'lab',x0,y-h/2,w,h); }
function m5Box(x,y,w,h,c,k){ ctx.fillStyle=P.ink; ctx.fillRect(x-k,y-k,w+2*k,h+2*k); ctx.fillStyle=c; ctx.fillRect(x,y,w,h); }
// ---------- маршрут дня → узлы/промежутки ----------
// маршрут дня = как в игре: посадка на ВЫБРАННОЙ станции (турникет «idx»), вагон едет car.stops остановок вперёд по линии
// (как в HUD поездки: «станция» → «следующая»), при пересадке — переход и ещё 1 остановка на соседней линии, затем выход в город.
function m5MetroStops(idx,plan){ const zs=(plan.zones||[]).filter(z=>(z.seg||'metro')==='metro'), car=zs.find(z=>z.k==='car'), stops=car?car.stops|0:2, xf=zs.some(z=>z.k==='passage'&&/ДРУГУЮ/.test(z.title||''));
  const w=Math.floor(idx/8), i8=idx%8, dir=1, out=[idx]; for(let j=1;j<=stops;j++){ const ii=i8+dir*j; if(ii<0||ii>7) break; out.push(w*8+ii); }
  let x2=null; if(xf){ const w2=(w+1)%3, last=out[out.length-1]%8, nb=last<7?last+1:last-1; x2=w2*8+nb; } return {list:out,xf,x2,dir}; }
function m5Route(idx,day,plan){ const segs=plan.segs, sg=id=>segs.find(s=>s.id===id), wk=!!plan.wk, tf=tfSet();
  const N=[], G2=[]; const node=o=>{ N.push(o); return o; }, gap=(t,w,seg)=>G2.push({t,w,seg,a:N.length-1,b:N.length});
  const s1=sg('street1'); node({t:'home',seg:'home',skip:!(s1&&s1.play)}); gap('walk',wk?1:1.3,s1||{id:'street1',locked:true});
  const M=wk?{list:[idx],xf:false,x2:null}:m5MetroStops(idx,plan); const one=M.list.length===1&&!M.xf;
  M.list.forEach((i,j)=>{ if(j) gap('metro',1,sg('metro')); node({t:'st',i,seg:'metro',name:LEVELS[i].name,tf:tf.has(i)||(M.xf&&j===M.list.length-1),sel:i===idx,board:j===0,exit:!M.xf&&j===M.list.length-1&&!wk&&!one}); });
  if(M.xf){ gap('metro2',1,sg('metro')); node({t:'st',i:M.x2,seg:'metro',name:LEVELS[M.x2].name,line2:Math.floor(M.x2/8),exit:true}); }
  const x=segs.find(s=>(s.id==='mck'||s.id==='mcd')&&!s.locked);
  if(wk){ gap('wk',.75,{id:'wk'}); node({t:'wk',seg:'wk',pair:typeof wk5Pair==='function'?wk5Pair(day):['mega','nastya']}); return {N,G:G2,M,x:null,wk:true}; }
  if(x){ const nm=MAP5[x.id==='mck'?'MCK':'MCD'], o=(day.seed>>>7)%nm.length; gap('fork',1.1,x); node({t:'x',seg:x.id,kind:x.id,name:nm[o]}); gap('xm',1,x); node({t:'x',seg:x.id,kind:x.id,name:nm[(o+1)%nm.length]}); }
  const s2=sg('street2'), bc=sg('bc'); gap(x?'forkup':'walk',1.3,s2||{id:'street2',locked:true}); if(x) G2[G2.length-1].walk=1;
  node({t:'bc',seg:'bc',lock:!!(bc&&bc.locked)}); gap('in',.7,bc||{id:'bc'}); node({t:'office',seg:'office'});
  return {N,G:G2,M,x,wk:false}; }
const M5_ORD=['home','street1','metro','mck','mcd','street2','bc','office','wk'];
function m5Start(plan){ if(!segResumable()) return null; const ss=save.segSave, z=plan.zones[ss.zi|0]; return z&&z.seg||ss.seg||null; }
// ---------- значки риска (E6), кружок 9u ----------
const M5_RISK={light:['#e8343a','light'],puddles:['#5aa0ff','drop'],rain:['#5aa0ff','drop'],promoter:['#ff4fa3','flyer'],pigeons:['#8e94aa','pigeon'],construction:['#ff7a1f','cone'],repairs:['#ff7a1f','cone'],accident:['#e8343a','car'],ice:['#8fd8ff','snow'],
  controllers:['#c8f03a','vest'],scooters:['#3fd06a','scooter'],couriers:['#c49a5c','box'],coffee:['#2aa860','cup'],vend:['#2aa860','cup'],vendp:['#2aa860','cup'],lift:['#9a9aa8','lift'],stairs14:['#9a9aa8','stairs'],stairs:['#9a9aa8','stairs'],stairs2:['#9a9aa8','stairs'],
  colleague:['#9b4dff','talk'],short:['#e8343a','car2'],detector:['#9a9aa8','gate'],kiosk:['#ff7a1f','kiosk'],kioskp:['#ff7a1f','kiosk'],musician:['#ffc81f','note'],transfer:['#3d6ff0','xfer'],headon:['#e8343a','xfer'],walkway:['#3d6ff0','xfer'],
  terminal:['#e8343a','stop'],gangway:['#8f98a8','car2'],cols:['#8f98a8','gate'],lost:['#c49a5c','box'],service:['#8f98a8','gate']};
const M5_HEAVY=['controllers','accident','construction','repairs','short','detector','terminal','headon','stairs14','stairs','transfer','ice'];
function m5Risk(kind,cx,cy,k){ const d=M5_RISK[kind]||['#8f98a8','x'], c=d[0], g=d[1], f=(a,b,w,h,col)=>{ ctx.fillStyle=col; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); }, wh='#fffaf0';
  disc(ctx,cx,cy,5*k,5*k,P.ink); disc(ctx,cx,cy,4*k,4*k,c); ctx.fillStyle=shade(c,.3); ctx.fillRect(cx-2*k,cy-3*k,2*k,k);
  switch(g){ case 'light': f(-1,-3,3,7,P.ink); f(0,-2,1,1,'#ff6a6a'); f(0,0,1,1,'#ffd23f'); f(0,2,1,1,'#3fd06a'); break; case 'drop': f(0,-3,1,1,wh); f(-1,-2,3,2,wh); f(-2,0,5,2,wh); f(-1,2,3,1,wh); break;
    case 'flyer': f(-2,-2,4,5,wh); f(-1,-1,2,1,'#ff4fa3'); break; case 'pigeon': f(-2,-1,4,3,wh); f(1,-3,2,2,wh); f(3,-2,1,1,'#ff8a1f'); break; case 'cone': f(-1,-3,2,2,wh); f(-2,-1,4,1,'#ffd0a0'); f(-2,0,4,2,wh); f(-3,2,6,1,P.ink); break;
    case 'car': f(-3,-1,6,3,wh); f(-2,-2,3,1,wh); f(-3,2,2,1,P.ink); f(1,2,2,1,P.ink); break; case 'car2': f(-3,-2,6,4,wh); f(-2,-1,1,1,c); f(1,-1,1,1,c); break; case 'snow': f(0,-3,1,7,wh); f(-3,0,7,1,wh); f(-2,-2,1,1,wh); f(2,2,1,1,wh); break;
    case 'vest': f(-2,-2,5,5,'#3a3442'); f(-1,-2,3,2,c); f(-2,1,5,1,'#ff7a1f'); break; case 'scooter': f(-1,-3,1,5,wh); f(-1,1,4,1,wh); f(-3,2,2,1,P.ink); f(2,2,2,1,P.ink); break; case 'box': f(-2,-2,5,4,wh); f(0,-2,1,4,shade(c,-.4)); break;
    case 'cup': f(-2,-2,3,5,wh); f(1,-1,1,2,wh); f(-2,-2,3,1,'#7a5232'); break; case 'lift': f(-2,-3,4,7,wh); f(-1,-2,2,1,c); f(-1,1,2,1,c); break; case 'stairs': f(-3,2,6,1,wh); f(-1,0,4,1,wh); f(1,-2,2,1,wh); break;
    case 'talk': f(-3,-2,6,4,wh); f(-2,2,1,1,wh); f(-2,-1,1,1,c); f(0,-1,1,1,c); f(2,-1,1,1,c); break; case 'gate': f(-3,-2,1,5,wh); f(2,-2,1,5,wh); f(-2,0,4,1,'#ff6a6a'); break; case 'kiosk': f(-2,-3,5,2,'#ff4a4a'); f(-2,-1,5,4,wh); break;
    case 'note': f(-1,1,2,2,wh); f(0,-3,1,4,wh); f(1,-3,2,1,wh); break; case 'xfer': f(-3,-1,6,1,wh); f(2,-2,1,3,wh); f(-3,1,6,1,wh); f(-3,0,1,3,wh); break; case 'stop': f(-2,-2,5,5,wh); f(-1,-1,3,3,c); break; default: f(0,-2,1,3,wh); f(0,2,1,1,wh); } }
// ---------- лампочки ----------
// ---------- фон: стена вагона ----------
// заклёпка 2×2u
// ---------- значки ДОМ/БЦ/ОФИС (над лампой) ----------
function m5House(x,y,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a*k,y+b*k,w*k,h*k); }; f(3,-17,3,5,P.ink); f(4,-16,1,3,'#7a5232');
  for(let i=0;i<8;i++){ f(-1-i,-18+i,2+2*i,1,P.ink); if(i>0) f(-i,-18+i,2*i,1,i>5?'#8a3a2a':'#b0573f'); } f(-8,-10,16,1,P.ink);
  f(-7,-9,14,10,P.ink); f(-6,-9,12,9,'#c49a5c'); f(-6,-9,12,1,'#d8b47a'); f(5,-9,1,9,'#a07a44'); f(-4,-6,3,3,'#ffd23f'); f(-4,-6,3,1,'#ffe98a'); f(1,-6,3,6,'#7a5232'); f(1,-6,1,6,'#9a7252'); }
function m5Office(x,y,k,h){ h=h||16; const f=(a,b,w,hh,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a*k,y+b*k,w*k,hh*k); }; f(-6,-h-1,12,h+1,P.ink); f(-5,-h,10,h,'#3a3a5a'); f(-5,-h,1,h,'#5a5a7a');
  for(let r=-h+2;r<-2;r+=3) for(const c of [-3,1]) f(c,r,2,2,((r*7+c*3)&7)>2?'#ffe9a8':'#22223a'); f(-1,-h-4,1,3,'#8f98a8'); f(-1,-h-5,1,1,'#e8343a'); }
function m5Bc(x,y,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(x+a*k,y+b*k,w*k,h*k); }; f(-7,-12,14,12,P.ink); f(-6,-11,12,11,'#9a9aa8'); f(-6,-11,12,1,'#c8c8d4'); f(-4,-9,3,8,'#4a4752'); f(1,-9,3,8,'#4a4752'); f(-4,-6,3,1,'#3fd06a'); f(1,-6,3,1,'#e8343a'); }
const m5fs=(n,k)=>n*k/2;
// ---------- табличка маршрута дня ----------
// ---------- выходной: вилка на 2 мини-карточки ----------
// ---------- схема линии (выбор станции) ----------
function m5LineBadgeMini(cx,cy,k,w,on){ const c=lineOpen(w)?LINE_COL[w]:'#8a8898'; if(on){ disc(ctx,cx,cy,8*k,8*k,'#ffd23f'); } disc(ctx,cx,cy,6*k+k,6*k+k,P.ink); disc(ctx,cx,cy,6*k,6*k,c);
  if(lineOpen(w)) G.labels.push([String(w+1),cx,cy+.5,m5fs(11,k),'#fff','center',P.ink]); else lock4(cx-3,cy-3); }
function m5Sheet(on){ if(MAP5.sheet===on&&!MAP5.flipTo) return; if(m5Calm()){ MAP5.sheet=on; MAP5.flip=0; MAP5.flipTo=null; return; } MAP5.flipTo=on; MAP5.flip=.001; }
// ---------- карточка станции ----------
function m5CanBuy(){ try{ return HERO_IDS4.some(id=>{ const st=heroState(id); return !st.own&&st.price&&st.can; }); }catch(e){ return false; } }
function m5Fit(s,w,f){ if(txtW(s,f)<=w) return s; while(s.length>4&&txtW(s+'…',f)>w) s=s.slice(0,-1); return s+'…'; }
// ---------- дверь ----------
// наклейка «не прислоняться» (пиктограмма, поцарапана)
function m5Sticker(cx,cy,k){ disc(ctx,cx,cy,7*k,7*k,P.ink); disc(ctx,cx,cy,6*k,6*k,'#fffaf0'); disc(ctx,cx,cy,6*k,6*k,'#fffaf0');
  ctx.fillStyle='#4a4752'; ctx.fillRect(cx-k,cy-4*k,2*k,7*k); ctx.fillRect(cx-3*k,cy-2*k,2*k,3*k); ctx.fillRect(cx+k,cy-2*k,2*k,3*k);
  ctx.fillStyle='#e8343a'; for(let i=-4;i<=4;i++) ctx.fillRect(cx+i*k,cy+i*k,2*k,2*k); for(let a=0;a<24;a++){ const an=a/24*Math.PI*2; ctx.fillRect(Math.round(cx+Math.cos(an)*5.5*k),Math.round(cy+Math.sin(an)*5.5*k),k,k); }
  ctx.fillStyle='#c8c4d0'; ctx.fillRect(cx+2*k,cy-6*k,k,k); ctx.fillRect(cx+3*k,cy-5*k,k,k); ctx.fillRect(cx+4*k,cy-4*k,k,k); ctx.fillStyle='#18162a'; ctx.fillRect(cx+5*k,cy+3*k,2*k,2*k); }
// ---------- LED-ряд ----------
function m5Tip(){ return !(save.cut&&save.cut.map5tip)&&tripPts()===0; }
function m5GoBtn(Y){ const {k,R,by,bh,dx1}=Y, x0=dx1+6*k, aw=R-x0, bw=Math.min(aw-10*k,110*k), tip0=m5Tip(), calm=m5Calm();
  // FB6: «задача дня» над кнопкой — одна строка, что делать сейчас
  const RT=MAP5.rt, res0=segResumable(), cw=Math.min(aw-6*k,150*k), lines=MAP5.sheet?[]:RT&&RT.wk?['ВЫХОДНОЙ','погуляй без спешки']:RT&&RT.endName?(typeof m5GoalTxt==='function'&&m5GoalTxt(RT,res0))||[res0?'ПРОДОЛЖИ ПОЕЗДКУ':'ЗАДАЧА ДНЯ',(RT.endT==='office'?'доедь до ОФИСА':'доедь до «'+RT.endName+'»')+' к 09:00']:[];
  const two=bh>=58*k, calH=!lines.length?0:two?25*k:13*k, bhh=Math.min(30*k,bh-12*k-calH), bx=Math.round(x0+(aw-bw)/2), byy=Math.round(calH?by+bh-bhh-4*k:tip0?by+bh-bhh-3*k:by+(bh-bhh)/2);
  const tip=tip0&&byy-by-calH>=20*k;
  if(calH){ const cx=Math.round(x0+aw/2), cy=Math.round(by+Math.max(3*k,(byy-by-calH-(tip?17*k:6*k))/2)), cxL=cx-Math.round(cw/2);
    ctx.fillStyle=P.ink; ctx.fillRect(cxL-k,cy-k,cw+2*k,calH+2*k); ctx.fillStyle='#241a34'; ctx.fillRect(cxL,cy,cw,calH); ctx.fillStyle='#3cdc64'; ctx.fillRect(cxL,cy,2*k,calH);
    const fitS=(t,f,mw)=>{ while(txtW(t,f)>mw&&f>6.5) f-=.5; while(txtW(t,f)>mw&&t.length>6) t=t.replace(/(.)…?»/,'…»').replace(/^(.*)(.)…»/,'$1…»'); return [t,f]; };
    if(two){ const [t1,f1]=fitS(lines[0],Math.max(7,6.5*k),cw-10*k), [t2,f2]=fitS(lines[1],Math.max(8,7.5*k),cw-10*k); const gk=tip0&&!tip?'tip':'goal'; m5Lab(t1,cxL+6*k,cy+7*k,f1,'#ffd23f','left',gk); m5Lab(t2,cxL+6*k,cy+17*k,f2,'#fff','left',gk); }
    else { const [t2,f2]=fitS(lines[1],Math.max(7.5,7*k),cw-10*k); m5Lab(t2,cxL+6*k,cy+calH/2,f2,'#fff','left',tip0&&!tip?'tip':'goal'); }
    MAP5.goal={x:cxL-k,y:cy-k,w:cw+2*k,h:calH+2*k,lines}; } else MAP5.goal=null;
  const res=segResumable(), lab=res?'ПРОДОЛЖИТЬ ▶':'ПОЕХАЛИ ▶'; let f=Math.max(9,8.5*k); while(txtW(lab,f)>bw-8*k&&f>7) f-=.5;
  const a=calm?.28:.2+.16*Math.sin(G.t*4); ctx.fillStyle='rgba(110,255,140,'+a.toFixed(3)+')'; ctx.fillRect(bx-5*k,byy-5*k,bw+10*k,bhh+10*k); ctx.fillStyle='rgba(110,255,140,'+(a*.6).toFixed(3)+')'; ctx.fillRect(bx-8*k,byy-3*k,bw+16*k,bhh+6*k);
  bigBtn(lab,bx,byy,bw,bhh,'#2aa860',()=>m5Go(),'go',f); m5Reg('go',bx-2,byy-2,bw+4,bhh+4);
  if(tip){ const cx=bx+Math.round(bw/2), bob=calm?0:Math.round(Math.abs(Math.sin(G.t*5))*3*k), ty=byy-4*k-bob; // стрелка вниз: ствол + наконечник
    ctx.fillStyle=P.ink; ctx.fillRect(cx-3*k,ty-14*k,6*k,8*k); for(let r=0;r<7;r++) ctx.fillRect(cx-(7-r)*k,ty-7*k+r*k,(14-2*r)*k,k); ctx.fillRect(cx-k,ty,2*k,k);
    ctx.fillStyle='#ffd23f'; ctx.fillRect(cx-2*k,ty-13*k,4*k,7*k); for(let r=0;r<6;r++) ctx.fillRect(cx-(5-r)*k,ty-6*k+r*k,(10-2*r)*k,k); ctx.fillStyle='#fff3a0'; ctx.fillRect(cx-2*k,ty-13*k,k,7*k);
    m5Reg('tip',cx-7*k,ty-14*k,14*k,15*k); } }
function m5Go(){ if(MAP5.doorOn) return; save.cut=save.cut||{}; if(!save.cut.map5tip){ save.cut.map5tip=1; store(); }
  if(m5Calm()){ map4Go(); return; } MAP5.doorOn=true; MAP5.door=0; try{ tone(1800,.35,'sawtooth',.03,-1200); tone(300,.25,'square',.02,0,.05); }catch(e){} try{ haptic&&haptic('select'); }catch(e){} }
// ---------- кадр ----------
// ---------- LED (v2): точки рисуются в разрешении экрана поверх кадра (tctx), тонко и с мягким свечением ----------
function led5D(k){ const dp=Math.max(2,Math.round(8*k*SC/8)), dp2=Math.max(2,Math.round(dp*.68)); return {dp,ds:dp-1,dp2,ds2:Math.max(1,dp2-1)}; }
function led5ImgD(s,col,dp,ds){ const key='D|'+s+'|'+col+'|'+dp+'|'+ds; if(LED5C[key]) return LED5C[key]; const c=led5Cols(s), cv=document.createElement('canvas'); cv.width=Math.max(1,c.length*dp+2); cv.height=8*dp+2; const x=cv.getContext('2d');
  x.globalAlpha=.20; x.fillStyle=col; for(let i=0;i<c.length;i++) for(let r=0;r<8;r++) if(c[i]>>r&1) x.fillRect(i*dp-1+1,r*dp-1+1,ds+2,ds+2); x.globalAlpha=1;
  for(let i=0;i<c.length;i++) for(let r=0;r<8;r++) if(c[i]>>r&1){ x.fillStyle=col; x.fillRect(i*dp+1,r*dp+1,ds,ds); if(ds>2){ x.fillStyle=shade(col,.5); x.fillRect(i*dp+1,r*dp+1,1,1); } }
  const o={cv,w:c.length*dp,n:c.length}; if(Object.keys(LED5C).length>120) for(const kk in LED5C) delete LED5C[kk]; LED5C[key]=o; return o; }
function led5GridD(w,h,dp,ds,col){ const key='GD|'+w+'|'+h+'|'+dp+'|'+ds+'|'+col; if(LED5C[key]) return LED5C[key]; const cv=document.createElement('canvas'); cv.width=Math.max(1,w); cv.height=Math.max(1,h); const x=cv.getContext('2d');
  x.fillStyle=col; for(let yy=1;yy+ds<=h;yy+=dp) for(let xx=1;xx+ds<=w;xx+=dp) x.fillRect(xx,yy,ds,ds); const o={cv}; LED5C[key]=o; return o; }
// одна строка табло (device px): fit → по центру/слева; иначе бесшовная бегущая строка; calm — статично с «…»
function led5RowD(s,col,X,Yd,Wd,dp,ds,mode,align){ const sep='   ·   '; let im=led5ImgD(s,col,dp,ds); const pad=dp*2;
  const sn=x=>X+1+Math.round((x-X-1)/dp)*dp; if(im.w<=Wd-pad*2){ const x=sn(align==='left'?X+pad:Math.round(X+(Wd-im.w)/2)); MAP5.ledQ.push(()=>tctx.drawImage(im.cv,x,Yd)); return {fit:true,s}; }
  if(mode!=='scroll'){ let t=s; while(t.length>2&&led5ImgD(t+'…',col,dp,ds).w>Wd-pad*2) t=t.slice(0,-1); im=led5ImgD(t+'…',col,dp,ds); const x=sn(X+pad); MAP5.ledQ.push(()=>tctx.drawImage(im.cv,x,Yd)); return {fit:false,s:t+'…'}; }
  im=led5ImgD(s+sep,col,dp,ds); const per=im.n, off=Math.floor(G.t*22)%per;
  MAP5.ledQ.push(()=>{ tctx.save(); tctx.beginPath(); tctx.rect(X+dp,Yd-1,Wd-2*dp,8*dp+3); tctx.clip(); for(let x=X+1+pad-off*dp;x<X+Wd;x+=per*dp) tctx.drawImage(im.cv,x,Yd); tctx.restore(); }); return {fit:false,s,scroll:true}; }
// корпус панели (игровые px) + сетка непогашенных точек (device px)
function led5BoxD(x,y,w,h,k,rows){ ctx.fillStyle=P.ink; ctx.fillRect(x-k,y-k,w+2*k,h+2*k); ctx.fillStyle='#0e0a0e'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#3a3442'; ctx.fillRect(x-k,y+h,w+2*k,k); ctx.fillStyle='#241c26'; ctx.fillRect(x,y,w,k);
  const X=Math.round(x*SC), Y0=Math.round(y*SC), Wd=Math.round(w*SC); for(const r of rows){ const g=led5GridD(Wd-2,8*r.dp+2,r.dp,r.ds,r.unlit); MAP5.ledQ.push(()=>tctx.drawImage(g.cv,X+1,Y0+r.y)); }
  MAP5.ledQ.push(()=>{ tctx.fillStyle='rgba(255,255,255,.05)'; tctx.fillRect(X,Y0,Wd,Math.max(1,Math.round(h*SC*.35))); }); return {X,Y0,Wd}; }
function led5WxD(kind,X,Yd,dp,ds){ const R=LED5_WX[kind]||LED5_WX.clear; MAP5.ledQ.push(()=>{ for(let j=0;j<8;j++) for(let i=0;i<8;i++){ const ch=R[j][i]; if(ch==='.') continue; const col=ch==='#'?(kind==='clear'?'#e8b84a':'#a8a8bc'):(ch==='o'?'#4a8ad8':'#d8d8e8');
  tctx.globalAlpha=.2; tctx.fillStyle=col; tctx.fillRect(X+i*dp,Yd+j*dp,ds+2,ds+2); tctx.globalAlpha=1; tctx.fillRect(X+i*dp+1,Yd+j*dp+1,ds,ds); } }); }
// ---------- раскладка v2 ----------
function m5Layout(kind){ const k=map5K(), L=SA.l+4*k, R=W-SA.r-4*k, T=SA.t+3*k, B=H-SA.b-3*k, D=led5D(k);
  const ledHD=D.dp*10+D.dp2*8+D.dp*2, ledH=Math.ceil(ledHD/SC), ms=Math.max(ledH,Math.ceil(28*DPR/SC));
  const cw=Math.ceil(((led5Cols('88:88').length+3)*D.dp)/SC), gw=8*k, gx=L+cw+3*k, nx=gx+gw+3*k, nw=R-ms-4*k-nx;
  const py=T+ledH+5*k, rem=B-py, hs=11*k, blk=kind==='fork'?{xl:98,big:84,cmp:74}:kind==='wk'?{xl:64,big:58,cmp:50}:{xl:62,big:54,cmp:47};
  let lv='cmp'; for(const l of ['xl','big']){ if(rem-(hs+(blk[l]+6)*k)-6*k>=(l==='xl'?54:46)*k){ lv=l; break; } } const big=lv!=='cmp', ex=(kind!=='sheet'&&typeof R41!=='undefined'&&R41.layEx)||0, need=hs+(blk[lv]+6+ex)*k;
  let bh=clamp(rem-need-6*k,44*k,80*k), ph=rem-bh-6*k;
  const by=py+ph+6*k, narrow=(R-L)/k<360, dw=(narrow?30:40)*k, dx0=Math.round((L+R)/2-dw+ (narrow?6*k:10*k)), dx1=dx0+2*dw;
  return {k,p:k+1,L,R,T,B,D,ledH,ms,cw,gx,gw,nx,nw,py,ph,bh,by,dw,dx0,dx1,narrow,hs,big,lv}; }
// ---------- LED-ряд v2: часы | динамик | табло (1 бегущая янтарная строка + тихая строка дня) ----------
const M5_ANN=['ОСТОРОЖНО, ДВЕРИ ЗАКРЫВАЮТСЯ','УСТУПАЙТЕ МЕСТА ПАССАЖИРАМ С КОФЕ','НЕ ПРИСЛОНЯТЬСЯ — ЭТО ПРО ТЕБЯ','НЕ ЗАБЫВАЙТЕ СВОИ ВЕЩИ И НЕРВЫ'];
function m5LedText(day,plan,idx){ const tip=m5Tip();
  if(MAP5.msg) return {s:MAP5.msg.s,c:'#7cff9a',m:'fix'}; if(G.msg) return {s:String(G.msg.s).toUpperCase(),c:'#ffc44a',m:'fix'};
  if(tip) return {s:'ЖМИ «ПОЕХАЛИ»!',c:'#7cff9a',m:'fix'}; if(plan.wk){ const q=(day.weekday===6?'ВОСКРЕСЕНЬЕ':'СУББОТА')+'! КУДА ПОЕДЕМ?'; const n=unl4('news')&&typeof dayNews5==='function'?dayNews5(day):null; return n?{s:q+'   ·   НОВОСТИ: '+n.t,c:'#ffb43a',m:'scroll'}:{s:q,c:'#ffb43a',m:'fix'}; }
  const ML=m5MetroStops(idx,plan).list, nxt=ML.length>1?'СЛЕДУЮЩАЯ — '+LEVELS[ML[1]].name.toUpperCase():'КОНЕЧНАЯ — '+LEVELS[idx].name.toUpperCase();
  if(unl4('news')){ const n=typeof dayNews5==='function'?dayNews5(day):null; return {s:'НОВОСТИ: '+(n?n.t:NEWS4[(day.news|0)%NEWS4.length])+'   ·   '+nxt,c:'#ffb43a',m:'scroll'}; }
  return {s:nxt+'   ·   '+M5_ANN[(day.seed>>>4)%M5_ANN.length],c:'#ffb43a',m:'scroll'}; }
function m5Led(Y,day,plan,idx){ const {k,L,T,ledH,cw,gx,gw,nx,nw,D}=Y, calm=m5Calm(), wx=dayWeather(day), r1=D.dp, r2y=D.dp*10;
  // часы + температура
  const cb=led5BoxD(L,T,cw,ledH,k,[{y:r1,dp:D.dp,ds:D.ds,unlit:'#24161a'},{y:r2y,dp:D.dp2,ds:D.ds2,unlit:'#161420'}]);
  const d=new Date(), hh=String(d.getHours()).padStart(2,'0'), mi=String(d.getMinutes()).padStart(2,'0'), colon=calm||Math.floor(G.t*2)%2===0;
  led5RowD(hh+(colon?':':' ')+mi,'#ffb43a',cb.X,cb.Y0+r1,cb.Wd,D.dp,D.ds,'fix');
  const tp=m5Temp(day,wx), ts=(tp>0?'+':'')+tp+'°', ti=led5ImgD(ts,'#7ab8e8',D.dp2,D.ds2), tw=ti.w+3*D.dp2+8*D.dp2, tx=cb.X+1+Math.round((cb.Wd-tw)/2/D.dp2)*D.dp2; MAP5.ledQ.push(()=>tctx.drawImage(ti.cv,tx,cb.Y0+r2y)); led5WxD(wx,tx+ti.w+3*D.dp2,cb.Y0+r2y,D.dp2,D.ds2);
  m5Reg('led',L-k,T-k,cw+2*k,ledH+2*k);
  // динамик
  m5Box(gx,T,gw,ledH,'#4a4452',k); ctx.fillStyle='#2a2430'; for(let yy=T+2*k;yy<T+ledH-2*k;yy+=2*k) ctx.fillRect(gx+2*k,yy,gw-4*k,k); ctx.fillStyle='#6a6474'; ctx.fillRect(gx,T,gw,k); m5Reg('grille',gx-k,T-k,gw+2*k,ledH+2*k);
  // табло
  const nb=led5BoxD(nx,T,nw,ledH,k,[{y:r1,dp:D.dp,ds:D.ds,unlit:'#24161a'},{y:r2y,dp:D.dp2,ds:D.ds2,unlit:'#161420'}]); m5Reg('led',nx-k,T-k,nw+2*k,ledH+2*k);
  const t=m5LedText(day,plan,idx), mode=calm&&t.m==='scroll'?'cut':t.m; let rr;
  if(t.m==='fix'&&led5ImgD(t.s,t.c,D.dp,D.ds).w>nb.Wd-4*D.dp) rr=led5RowD(t.s,t.c,nb.X,nb.Y0+r1,nb.Wd,D.dp,D.ds,calm?'cut':'scroll');
  else { const blinkOff=t.m==='fix'&&MAP5.msg&&!calm&&Math.floor(G.t*3)%2===1; rr=blinkOff?{fit:true,s:t.s}:led5RowD(t.s,t.c,nb.X,nb.Y0+r1,nb.Wd,D.dp,D.ds,mode); }
  MAP5.news={s:t.s,w:nw,fit:rr.fit}; MAP4.news={s:t.s,w:nw};
  const wd=day.weekday, ty=(DAYTYPE4[day.type]||{n:''}).n.toUpperCase(), lg=day.type==='long', c2=wd>=5?'#3aa860':'#b8402e';
  let s2=WD4_N[wd].toUpperCase()+' · '+ty; const room=nb.Wd-(lg?10:4)*D.dp2; if(led5ImgD(s2,c2,D.dp2,D.ds2).w>room) s2=WD4[wd]+' · '+ty; if(led5ImgD(s2,c2,D.dp2,D.ds2).w>room) s2=WD4[wd]+' · '+ty.split(' ')[0];
  const im2=led5ImgD(s2,c2,D.dp2,D.ds2), x2=nb.X+1+Math.round((nb.Wd-im2.w-(lg?6*D.dp2:0))/2/D.dp2)*D.dp2; MAP5.ledQ.push(()=>tctx.drawImage(im2.cv,x2,nb.Y0+r2y));
  if(lg&&(calm||Math.floor(G.t*2.5)%2===0)){ const im=led5ImgD('!','#ffd23f',D.dp2,D.ds2); MAP5.ledQ.push(()=>tctx.drawImage(im.cv,x2+im2.w+3*D.dp2,nb.Y0+r2y)); } }
function m5Menu(Y){ const {k,R,T,ledH,ms}=Y, x=R-ms, y=T; m5Box(x,y,ms,Math.max(ms,ledH),'#4a3a5a',k); const hh=Math.max(ms,ledH); ctx.fillStyle='#6a5a7a'; ctx.fillRect(x,y,ms,k); ctx.fillStyle=shade('#4a3a5a',-.35); ctx.fillRect(x,y+hh-2*k,ms,2*k);
  const bw=Math.round(ms*.5), bx=Math.round(x+(ms-bw)/2), bhh=Math.max(2,Math.round(ms/10)); ctx.fillStyle='#fffaf0'; for(const f of [.32,.5,.68]) ctx.fillRect(bx,Math.round(y+hh*f-bhh/2),bw,bhh);
  m5Reg('menu',x-k,y-k,ms+2*k,hh+2*k); buttons.push({x,y,w:ms,h:hh,id:'home',cb:()=>{ SFX.ui(); toTitle(); }}); }
// стена вагона v2: панели, швы, световая полоса
function m5Wall(Y){ const {k}=Y, wall='#d8c49a'; ctx.fillStyle=wall; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=shade(wall,-.08); ctx.fillRect(0,Y.by-3*k,W,H); ctx.fillStyle=shade(wall,-.16); ctx.fillRect(0,Y.by-3*k,W,k);
  ctx.fillStyle=shade(wall,-.12); for(let x=Math.round(W*.25);x<W;x+=Math.round(W*.25)) ctx.fillRect(x,Y.T+Y.ledH+2*k,k,Y.by-Y.T-Y.ledH-5*k);
  ctx.fillStyle='#ffe9a8'; ctx.fillRect(0,0,W,Math.max(2,2*k)); ctx.fillStyle=shade(wall,-.25); ctx.fillRect(0,Math.max(2,2*k),W,k); }
// ---------- табличка маршрута v2 ----------
function m5Pad(k){ return 4*k+4; }
function m5Plate(Y,sy,lc,head){ const {k,L,R,py,ph,hs}=Y, x=L, y=py+sy, w=R-L, h=ph;
  ctx.fillStyle='rgba(60,40,20,.35)'; ctx.fillRect(x+2*k,y+2*k,w,h);
  m5Box(x,y,w,h,'#b8b0c0',k); ctx.fillStyle='#d4ccdc'; ctx.fillRect(x,y,w,k); ctx.fillStyle='#8a8296'; ctx.fillRect(x,y+h-k,w,k); // рамка
  const ix=x+3*k, iy=y+3*k, iw=w-6*k, ih=h-6*k; ctx.fillStyle=P.ink; ctx.fillRect(ix-k,iy-k,iw+2*k,ih+2*k); ctx.fillStyle='#fffaf0'; ctx.fillRect(ix,iy,iw,ih);
  if(head){ ctx.fillStyle='#f1e8d4'; ctx.fillRect(ix,iy,iw,hs-3*k); ctx.fillStyle=lc; ctx.fillRect(ix,iy+hs-3*k,iw,2*k); ctx.fillStyle=shade(lc,-.35); ctx.fillRect(ix,iy+hs-k,iw,k); }
  // блик на пластике
  ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip(); const gx=ix+Math.round(iw*.70); ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.moveTo(gx,iy); ctx.lineTo(gx+9*k,iy); ctx.lineTo(gx-ih*.45+9*k,iy+ih); ctx.lineTo(gx-ih*.45,iy+ih); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(gx+13*k,iy); ctx.lineTo(gx+16*k,iy); ctx.lineTo(gx-ih*.45+16*k,iy+ih); ctx.lineTo(gx-ih*.45+13*k,iy+ih); ctx.fill(); ctx.fillStyle='rgba(120,100,80,.10)'; ctx.fillRect(ix,iy+ih-2*k,iw,2*k); ctx.restore();
  for(const [rx,ry] of [[x+k,y+k],[x+w-2*k,y+k],[x+k,y+h-2*k],[x+w-2*k,y+h-2*k]]) m5Rivet(rx-k/2|0,ry-k/2|0,k);
  return {ix,iy,iw,ih}; }
function m5Rivet(x,y,k){ ctx.fillStyle='#5a5466'; ctx.fillRect(x,y,2*k,2*k); ctx.fillStyle='#f4f0f8'; ctx.fillRect(x,y,k,k); }
function m5LockIco(cx,cy,k,col){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); }; f(-2,-5,5,4,P.ink); f(-1,-4,3,3,'#fffaf0'); f(-1,-4,3,1,col||'#8a8898'); f(-1,-4,1,3,col||'#8a8898'); f(1,-4,1,3,col||'#8a8898');
  f(-3,-2,7,6,P.ink); f(-2,-1,5,4,col||'#8a8898'); f(-2,-1,5,1,shade(col||'#8a8898',.35)); f(0,0,1,2,P.ink); }
function m5LineBadge(cx,cy,k,w,r){ const c=lineOpen(w)?LINE_COL[w]:'#8a8898'; r=r||5*k; disc(ctx,cx,cy,r+k,r+k,P.ink); disc(ctx,cx,cy,r,r,c); disc(ctx,cx-Math.round(r*.35),cy-Math.round(r*.35),Math.max(1,Math.round(r*.3)),Math.max(1,Math.round(r*.3)),shade(c,.35));
  G.labels.push([String(w+1),cx,cy+.5,Math.max(m5fs(10,k),r*1.25),'#fff','center',P.ink]); }
function m5Lamp(x,y,k,shape,st,lit,r){ r=r||4*k; const calm=m5Calm(), blink=!calm&&st==='cur'&&Math.floor(G.t*3.2)%2===1, fl=MAP5.flick>0&&!calm&&Math.floor(MAP5.flick*20)%2===0;
  let c=st==='done'?'#a29eac':st==='cur'?'#3cdc64':st==='lock'?'#a8a4b4':st==='skip'?'#d8d2dc':'#ffc04a', hi=st==='done'?'#cac6d2':st==='cur'?'#d8ffe0':st==='lock'?'#d0ccd8':st==='skip'?'#ece8f0':'#fff0c0';
  if((!lit||fl)&&st!=='done'){ c='#4a4652'; hi='#5c5864'; } if(blink){ c='#24a048'; hi='#7cf09a'; }
  if(st==='cur'&&lit){ disc(ctx,x,y,r+5*k,r+5*k,'rgba(110,255,140,.16)'); disc(ctx,x,y,r+3*k,r+3*k,'rgba(110,255,140,.24)'); }
  if(st==='next'&&lit&&!fl){ disc(ctx,x,y,r+2*k,r+2*k,'rgba(255,192,74,.18)'); }
  if(shape==='sq'){ const a=r-k; m5Box(x-a,y-a,2*a+k,2*a+k,c,k); ctx.fillStyle=hi; ctx.fillRect(x-a+k,y-a+k,2*k,2*k); }
  else if(shape==='tri'){ const n=Math.round(r/k)*2+1; ctx.fillStyle=P.ink; for(let j=0;j<n+1;j++){ const hw=Math.floor(j/2)+1; ctx.fillRect(x-hw*k,y+(j-Math.ceil(n/2)-1)*k,(2*hw+1)*k,k); } ctx.fillStyle=c; for(let j=1;j<n;j++){ const hw=Math.floor(j/2); ctx.fillRect(x-hw*k,y+(j-Math.ceil(n/2)-1)*k,(2*hw+1)*k,k); } ctx.fillStyle=hi; ctx.fillRect(x,y-2*k,k,k); }
  else { disc(ctx,x,y,r+k,r+k,P.ink); disc(ctx,x,y,r,r,c); disc(ctx,x-Math.round(r*.35),y-Math.round(r*.35),Math.max(k,Math.round(r*.35)),Math.max(k,Math.round(r*.35)),hi); if(r>=5*k){ ctx.fillStyle=shade(c,-.25); ctx.fillRect(x-Math.round(r*.5),y+r-2*k,Math.round(r),k); } }
  if(st==='lock'&&lit) m5LockIco(x,y+k,Math.max(1,Math.round(k*.75)),'#6a6478');
  if(st==='done'&&shape!=='tri'){ const q=Math.max(1,Math.round(r/6)), pts=[[-2,0],[-1,1],[0,2],[1,1],[2,0],[3,-1]]; ctx.fillStyle='#5a5664'; for(const [dx,dy] of pts) ctx.fillRect(x+dx*q-Math.floor(q/2),y+dy*q-Math.floor(q/2)+q,q,q); ctx.fillStyle='#fff'; for(const [dx,dy] of pts) ctx.fillRect(x+dx*q-Math.floor(q/2),y+dy*q-Math.floor(q/2),q,q); } }
function m5Dims(k,big,lv){ if(lv==='xl') return {rl:7*k,bt:4*k,fs:m5fs(17,k),gy:20*k,fsS:m5fs(13,k)}; return big?{rl:6*k,bt:3*k,fs:m5fs(15,k),gy:17*k,fsS:m5fs(12,k)}:{rl:5*k,bt:2*k,fs:m5fs(13,k),gy:15*k,fsS:m5fs(11,k)}; }
// состояния ламп: прохождение (resume) → пройденные тёмные; иначе выбранная станция — текущая (зелёная), остальное — впереди (янтарь)
function m5States(N,plan){ const ss=m5Start(plan), ord=s=>M5_ORD.indexOf(s); let curI=-1;
  if(ss){ if(ss==='street1') curI=0; else if(ss==='street2'){ N.forEach((n,i)=>{ if(ord(n.seg)<ord('street2')) curI=i; }); } else curI=N.findIndex(n=>n.seg===ss); if(curI<0) curI=0;
    return N.map((n,i)=>n.t==='bc'&&n.lock?'lock':i<curI?'done':i===curI?'cur':'next'); }
  const st0=N[0].skip?N.findIndex(n=>n.board):0; return N.map((n,i)=>n.t==='bc'&&n.lock?'lock':n.skip?'skip':i===st0?'cur':'next'); }
function m5DrawRoute(Y,sy,day,plan,idx,RT,pl){ const {k,L,R,py,ph,hs}=Y, y0=py+sy, N=RT.N, wl=Math.floor(idx/8), lc=LINE_COL[wl], pts=tripPts(), D=m5Dims(k,Y.big,Y.lv), pad=m5Pad(k);
  // шапка: бейдж линии (тап — схема), заголовок, легенда
  const hy=pl.iy+Math.round((hs-3*k)/2), R41r=m5R41(plan); if(R41r) m5RouteBadge(pl.ix+pad+3*k,hy,k,R41r.id,Math.round(3.5*k)); else m5LineBadge(pl.ix+pad+3*k,hy,k,wl,Math.round(3.5*k)); m5Reg('badge',pl.ix+pad-2*k,hy-5*k,11*k,10*k);
  ctx.fillStyle=P.ink; const chx=pl.ix+pad+10*k; ctx.fillRect(chx,hy-k,3*k,k); ctx.fillRect(chx+k,hy,k,k); // ▾
  const hb=Math.max(28*DPR/SC,hs); buttons.push({x:pl.ix,y:y0,w:Math.min(48,Math.max(hb,16*k)),h:Math.max(hb,hs+2*k),id:'line',cb:()=>{ if(plan.wk){ MAP5.msg={s:'ВЫХОДНОЙ: МАРШРУТ ВЫБИРАЕШЬ В ПУТИ',t:3}; SFX.ui(); return; } m5Sheet(true); SFX.ui(); }});
  const tfs=m5fs(11,k); let title=plan.wk?'ВЫХОДНОЙ МАРШРУТ':'МАРШРУТ ДНЯ'; if(R41r){ const chip=m5ChangeChip(pl,hy,k,pad); { const ww=chip-(chx+6*k)-6*k; title=['МАРШРУТ '+R41r.id+' · '+R41r.n,R41r.id+' · '+R41r.n,R41r.n].find(q=>txtW(q,tfs)<=ww)||m5Fit(R41r.n,ww,tfs); } } m5Lab(title,chx+6*k,hy,tfs,R41r?'#3a2a48':'#5a4a6a','left','hdr');
  if(!R41r){ const items=[['c','метро']]; if(RT.x) items.push([RT.x.id==='mck'?'sq':'tri',RT.x.id==='mck'?'МЦК':'МЦД']); if(!RT.wk&&(N.some(n=>n.t==='bc'&&n.lock)||RT.G.some(g=>g.seg&&g.seg.locked))) items.push(['lock',(pl.iw/k>330?'закрыто — открой очками':'закрыто')]);
    let x=pl.ix+pl.iw-pad; const lim=chx+6*k+txtW(title,tfs)+8*k; for(let i=items.length-1;i>=0;i--){ const [sh,s]=items[i], w=txtW(s,tfs); if(x-w-9*k<lim) break; m5Lab(s,x-w,hy,tfs,'#6a6478','left','legend'); x-=w+3*k;
      if(sh==='lock') m5LockIco(x-3*k,hy,Math.max(1,Math.round(k*.75)),'#8a8898'); else m5Lamp(x-3*k,hy,k,sh,'next',true,3*k); m5Reg('legend',x-7*k,hy-4*k,8*k,8*k); x-=10*k; } }
  // геометрия по вертикали: блок по центру тела таблички
  const bodyT=pl.iy+hs, bodyB=pl.iy+pl.ih-2*k-(R41r?Math.round(11*k):0);
  if(Y.lv==='xl'){ const t0=D.rl+22*k, u0=D.gy+D.fs*.65, b0=RT.x?D.gy+D.fs*.65+D.rl+4*k+u0:u0, f=clamp((bodyB-bodyT-8*k)/(t0+b0),1,1.45); if(f>1.05){ D.rl=Math.round(D.rl*Math.min(f,1.35)); D.bt=Math.round(D.bt*Math.min(f,1.15)); D.fs=Math.round(D.fs*Math.min(f,1.25)*2)/2; D.fsS=Math.round(D.fsS*Math.min(f,1.25)*2)/2; D.gy=Math.round(D.gy*f); } }
  if(R41r){ for(let it=0;it<6;it++){ const t0=D.rl+22*k, u0=D.gy+D.fs*.65, b0=RT.x?D.gy+D.fs*.65+D.rl+4*k+u0:u0; if(t0+b0+(RT.x?8*k:0)<=bodyB-bodyT) break; if(D.rl>Math.round(4*k)) D.rl=Math.max(Math.round(4*k),Math.round(D.rl*.82)); else if(RT.x) D.gy=Math.max(Math.round(D.fs*1.45),Math.round(D.gy*.9)); } }
  const top=D.rl+22*k, up=D.gy+D.fs*.65;
  const y2off=D.gy+D.fs*.65+D.rl+4*k, bot=RT.x?y2off+up:RT.wk?Math.max(up,20*k):up;
  const axY=Math.round(bodyT+Math.max(0,(bodyB-bodyT-(top+bot))/2)+top), y2=Math.round(axY+y2off);
  const wkW=RT.wk?Math.min(132*k,Math.round(pl.iw*.44)):0, axL=pl.ix+pad+9*k, axR=pl.ix+pl.iw-pad-7*k-wkW;
  let tot=0; for(const g of RT.G) tot+=g.w; let acc=0; N[0].x=axL; RT.G.forEach(g=>{ acc+=g.w; N[g.b].x=Math.round(axL+(axR-axL)*acc/tot); }); for(const n of N) n.y=n.t==='x'?y2:axY;
  const sts=m5States(N,plan); N.forEach((n,i)=>n.st=sts[i]);
  // FB6: «сегодняшняя поездка» = от текущей лампы до первого замка; всё остальное бледнее
  { let c0=N.findIndex(n=>n.st==='cur'); if(c0<0) c0=0; N.forEach(n=>n.reach=false); N[c0].reach=true; for(const g of RT.G){ if(N[g.a].reach&&!(g.seg&&g.seg.locked)&&N[g.b].st!=='lock') N[g.b].reach=true; }
    if(!RT.wk){ const rn=N.filter(n=>n.reach), x0=Math.min(...rn.map(n=>n.x))-D.rl-5*k, x1=Math.max(...rn.map(n=>n.x))+D.rl+5*k, yb=rn.some(n=>n.t==='x')?y2:axY;
      ctx.fillStyle='#bfe6b0'; ctx.fillRect(x0-k,axY-D.rl-5*k,x1-x0+2*k,yb-axY+2*D.rl+10*k); ctx.fillStyle='#e6f6dc'; ctx.fillRect(x0,axY-D.rl-4*k,x1-x0,yb-axY+2*D.rl+8*k);
      RT.span={x0,x1,y0:axY-D.rl-5*k,y1:yb+D.rl+5*k}; const en=rn[rn.length-1]; RT.endName=en.t==='office'?'ОФИС':en.t==='bc'?'БЦ':en.name||null; RT.endT=en.t; } else { RT.span=null; RT.endName=null; } }
  // промежутки
  const dots=(xa,xb,yy,col)=>{ ctx.fillStyle=col; for(let xx=xa;xx<=xb-2*k;xx+=4*k) ctx.fillRect(xx,yy-k,2*k,2*k); };
  const band=(xa,xb,yy,c,c2)=>{ const t=D.bt; ctx.fillStyle=P.ink; ctx.fillRect(xa,yy-t-k,xb-xa,2*t+2*k+k); ctx.fillStyle=c; ctx.fillRect(xa,yy-t,xb-xa,2*t+k); ctx.fillStyle=shade(c,.3); ctx.fillRect(xa,yy-t,xb-xa,k); ctx.fillStyle=shade(c,-.3); ctx.fillRect(xa,yy+t,xb-xa,k);
    if(c2){ ctx.fillStyle=c2; for(let xx=xa+2*k;xx<xb-3*k;xx+=6*k) ctx.fillRect(xx,yy,3*k,k); } };
  const vband=(xx,ya,yb,c)=>{ const t=D.bt, a=Math.min(ya,yb), b=Math.max(ya,yb); ctx.fillStyle=P.ink; ctx.fillRect(xx-t-k,a-t-k,2*t+3*k,b-a+2*t+3*k); ctx.fillStyle=c; ctx.fillRect(xx-t,a-t,2*t+k,b-a+2*t+k); ctx.fillStyle=shade(c,.3); ctx.fillRect(xx-t,a-t,k,b-a+2*t+k); };
  const XC={mck:['#e8354a','#ffffff'],mcd:['#ff8a1f','#3d6ff0']}; const prices=[], locks=[];
  const gapMark=(mx,locked,seg,av)=>{ ctx.fillStyle='#fffaf0'; ctx.fillRect(mx-7*k,axY-5*k,14*k,10*k); if(locked&&RT.wk){ m5Steps(mx,axY,k,'#b8b4c4'); m5Reg('lockg',mx-5*k,axY-4*k,10*k,8*k); } else if(locked){ m5LockIco(mx,axY,k,'#8a8898'); m5Reg('lockg',mx-4*k,axY-6*k,8*k,11*k); const th=unlockThr(SEG4[seg]&&SEG4[seg].unlock||seg); prices.push({x:mx,p:Math.max(0,th-pts)}); locks.push({x:mx,p:Math.max(0,th-pts),av:av||40*k}); } else if(seg==='street1'&&RT.plan&&RT.plan.route&&typeof rt41==='function'&&rt41(RT.plan.route).bus){ m5MiniIco('bus',mx,axY,k); m5Reg('lockg',mx-5*k,axY-4*k,10*k,8*k); } else { m5Steps(mx,axY,k,'#5a5a6a'); m5Reg('lockg',mx-5*k,axY-4*k,10*k,8*k); } };
  for(const g of RT.G){ const a=N[g.a], b=N[g.b], locked=!!(g.seg&&g.seg.locked), xa=a.x+D.rl+2*k, xb=b.x-D.rl-2*k;
    if(g.t==='walk'){ dots(xa,xb,axY,locked?'#c8c4d0':'#7e8494'); gapMark(Math.round((a.x+b.x)/2),locked,g.seg.id,b.x-a.x-2*D.rl-4*k); }
    else if(g.t==='in'){ ctx.fillStyle=locked?'#c8c4d0':'#8a8898'; ctx.fillRect(xa,axY-k,xb-xa,2*k); }
    else if(g.t==='metro') band(a.x,b.x,axY,lc);
    else if(g.t==='metro2') band(a.x,b.x,axY,LINE_COL[b.line2]||lc,'#ffffff');
    else if(g.t==='fork'){ const xf=Math.round(a.x+(b.x-a.x)*.38), c=XC[g.seg.id]; band(a.x,xf+D.bt,axY,c[0],c[1]); vband(xf,axY,y2,c[0]); band(xf-D.bt,b.x,y2,c[0],c[1]); m5Reg('line',xf-D.bt-k,axY+D.rl,2*D.bt+3*k,y2-axY-2*D.rl); }
    else if(g.t==='xm'){ const c=XC[g.seg.id]; band(a.x,b.x,y2,c[0],c[1]); }
    else if(g.t==='forkup'){ const xu=Math.round(b.x-(b.x-a.x)*.58), c=XC[RT.x.id]; band(a.x,xu+D.bt,y2,c[0],c[1]); vband(xu,y2,axY,c[0]); m5Reg('line',xu-D.bt-k,axY+D.rl,2*D.bt+3*k,y2-axY-2*D.rl); dots(xu+D.bt+3*k,xb,axY,locked?'#c8c4d0':'#7e8494'); { const ga=xu+D.bt+3*k, gb=b.x-D.rl-2*k; if(gb-ga>=16*k||locked) gapMark(Math.round((ga+gb)/2),locked,'street2',gb-ga); } }
    else if(g.t==='wk'){ ctx.fillStyle='#8a8898'; ctx.fillRect(xa,axY-k,xb-xa,2*k); const mx=Math.round((a.x+b.x)/2); if(xb-xa>=18*k){ ctx.fillStyle='#fffaf0'; ctx.fillRect(mx-7*k,axY-6*k,14*k,12*k); m5Escal(mx,axY,k); m5Reg('lockg',mx-7*k,axY-6*k,14*k,12*k); } } }
  // лампы + значки
  const lit=i=>MAP5.intro<=0||(1-MAP5.intro/MAP5.introT)*(N.length+1)>i;
  N.forEach((n,i)=>{ const shape=n.t==='x'?(n.kind==='mck'?'sq':'tri'):'c', r=n.t==='x'?D.rl-k:D.rl;
    if(n.t==='home'){ if(n.skip) ctx.globalAlpha=.4; m5House(n.x,axY-D.rl-3*k,k); ctx.globalAlpha=1; m5Reg('ico',n.x-8*k,axY-D.rl-22*k,17*k,19*k); }
    if(n.board&&!RT.wk||n.board&&RT.wk){ m5MSign(n.x,axY-D.rl-9*k,k); m5Reg('ico',n.x-6*k,axY-D.rl-14*k,13*k,11*k); }
    if(n.exit){ m5ExitSign(n.x,axY-D.rl-9*k,k); m5Reg('ico',n.x-6*k,axY-D.rl-14*k,13*k,11*k); }
    if(n.t==='office'){ m5Office(n.x,axY-D.rl-3*k,k,16); m5Reg('ico',n.x-6*k,axY-D.rl-24*k,13*k,21*k); }
    if(n.t==='bc'){ m5Bc(n.x,axY-D.rl-3*k,k); m5Reg('ico',n.x-7*k,axY-D.rl-15*k,15*k,12*k); }
    if(n.t==='wk'){ m5WkSigns(n,Y,axY,k,D,pl,wkW); return; }
    if(n.tf){ const a=r+2*k; ctx.fillStyle=P.ink; ctx.fillRect(n.x-a-k,n.y-a-k,2*a+3*k,2*a+3*k); ctx.fillStyle='#fffaf0'; ctx.fillRect(n.x-a,n.y-a,2*a+k,2*a+k); }
    m5Lamp(n.x,n.y,k,shape,n.st,lit(i),r); m5Reg('lamp',n.x-r-k,n.y-r-k,2*r+3*k,2*r+3*k); });
  if(RT.span){ const fy0=pl.iy+hs+k, fy1=pl.iy+pl.ih-2*k; ctx.fillStyle='rgba(255,250,240,.58)'; if(RT.span.x0-k>pl.ix) ctx.fillRect(pl.ix,fy0,RT.span.x0-k-pl.ix,fy1-fy0); if(RT.span.x1+k<pl.ix+pl.iw) ctx.fillRect(RT.span.x1+k,fy0,pl.ix+pl.iw-RT.span.x1-k,fy1-fy0); }
  // FB6: цена прямо у каждого замка («🔒 ещё N очк.»), без «висящей» строки
  if(!RT.wk){ const xL=pl.ix+pad, xR=pl.ix+pl.iw-pad, fz=D.fsS; for(const q of locks){ const n=q.p, cand=n>0?['ещё '+n+' очк.',n+' очк.',String(n),(n/1000).toFixed(1)+'k']:['скоро!'];
      const ty=axY+7*k, th=Math.round(Math.max(fz,MINPX())*1.2)+2*k, bad=r0=>MAP5.rects.some(r=>['line','lamp','ico','price','lockg'].includes(r.kind)&&!(r.kind==='lockg'&&Math.abs(r.x+r.w/2-q.x)<6*k&&r.y<ty)&&r0.x<r.x+r.w&&r.x<r0.x+r0.w&&r0.y<r.y+r.h&&r.y<r0.y+r0.h);
      let pick=null; for(const c of cand){ const w=txtW(c,fz); if(w+6*k>q.av&&c!==cand[cand.length-1]) continue; for(const dx of [0,1,-1,2,-2]){ const bw=w+8*k, bx=clamp(Math.round(q.x-bw/2+dx*bw/3),xL+k,xR-bw-k), box={x:bx,y:ty-k,w:bw,h:th+2*k}; if(!bad(box)){ pick={s:c,w,box}; break; } } if(pick) break; }
      if(!pick) continue; const {s,w,box}=pick, tx=box.x+k;
      ctx.fillStyle='#c8a050'; ctx.fillRect(box.x,box.y,box.w,box.h); ctx.fillStyle='#fff0c8'; ctx.fillRect(tx,ty,w+6*k,th); ctx.fillStyle='#c8a050'; ctx.fillRect(Math.round(q.x),ty-3*k,k,2*k);
      G.labels.push([s,tx+3*k,ty+th/2,fz,'#7a5a1a','left',null]); m5Reg('price',box.x,box.y,box.w,box.h); q.tag={x:box.x,y:box.y,w:box.w,h:box.h,s}; } RT.locks=locks; }
  m5RouteLabels(RT,N,Y,axY,y2,k,lc,D,pl,[]);
  // линейка времени по отрезкам (если в табличке есть свободная высота)
  if(R41r){ const lowL=Math.max(...MAP5.rects.filter(r=>r.y>axY-2*k&&r.y<pl.iy+pl.ih).map(r=>r.y+r.h),axY); m5Strip3(RT,N,plan,k,lowL,pl,axL,axR,D); }
  else if(!RT.wk){ const lowL=Math.max(...MAP5.rects.filter(r=>r.y>axY-2*k&&r.y<pl.iy+pl.ih).map(r=>r.y+r.h),axY), spare=pl.iy+pl.ih-6*k-lowL;
    if(spare>=16*k){ const ry=Math.round(lowL+Math.min(spare/2,12*k)), fz=D.fsS, grp=[]; for(const g of RT.G){ const id=g.seg&&g.seg.id; const last=grp[grp.length-1]; if(last&&last.id===id) last.b=N[g.b].x; else grp.push({id,seg:g.seg,a:N[g.a].x,b:N[g.b].x}); }
      const nT=grp.filter(q=>{ const sg=(plan.segs||[]).find(z=>z.id===q.id); return sg&&!sg.locked&&sg.budget; }).length; if(nT>=2){ ctx.fillStyle='#d8ccb4'; ctx.fillRect(axL,ry,axR-axL,k); for(const q of grp){ ctx.fillStyle='#c8bca4'; ctx.fillRect(q.a,ry-k,k,3*k); const sg=(plan.segs||[]).find(z=>z.id===q.id);
        const t=sg&&!sg.locked&&sg.budget?('≈'+Math.floor(sg.budget/60)+':'+String(sg.budget%60).padStart(2,'0')):null; if(!t) continue; const w=txtW(t,fz); if(w+4*k>q.b-q.a) continue; ctx.fillStyle='#fffaf0'; ctx.fillRect(Math.round((q.a+q.b)/2-w/2-2*k),ry-2*k,Math.round(w+4*k),5*k); m5Lab(t,(q.a+q.b)/2-w/2,ry+.5,fz,'#9a8a6a','left','ruler'); }
      ctx.fillStyle='#c8bca4'; ctx.fillRect(axR,ry-k,k,3*k); } } }
  // полоса цвета линии по низу (если есть место)
  { const sb=pl.iy+pl.ih-4*k, low=Math.max(...MAP5.rects.filter(r=>r.y>axY-2*k&&r.y<pl.iy+pl.ih).map(r=>r.y+r.h),axY); if(sb-low>=3*k){ ctx.fillStyle=lc; ctx.fillRect(pl.ix+pad,sb,pl.iw-2*pad,2*k); ctx.fillStyle=shade(lc,-.35); ctx.fillRect(pl.ix+pad,sb+2*k,pl.iw-2*pad,k); } }
  return RT; }
function m5MSign(cx,cy,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); }; f(-6,-5,13,11,P.ink); f(-5,-4,11,9,'#fffaf0'); const r='#e8343a';
  f(-4,-3,2,7,r); f(3,-3,2,7,r); f(-2,-2,1,2,r); f(2,-2,1,2,r); f(-1,0,1,2,r); f(1,0,1,2,r); f(0,1,1,2,r); }
function m5ExitSign(cx,cy,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); }; f(-6,-5,13,11,P.ink); f(-5,-4,11,9,'#2aa860'); f(-5,-4,11,1,'#5ad888');
  f(-3,-3,2,2,'#fff'); f(-4,-1,3,2,'#fff'); f(-3,1,1,2,'#fff'); f(-2,1,1,1,'#fff'); f(-1,2,1,1,'#fff'); f(1,-1,3,1,'#fff'); f(3,-2,1,3,'#fff'); f(2,-3,1,1,'#fff'); f(2,1,1,1,'#fff'); f(0,-3,1,6,'#fff'); }
function m5Escal(x,y,k){ ctx.fillStyle=P.ink; for(let i=0;i<5;i++) ctx.fillRect(x+(-5+2*i)*k,y+(3-2*i)*k,3*k,2*k); ctx.fillStyle='#8a8898'; for(let i=0;i<5;i++) ctx.fillRect(x+(-5+2*i)*k,y+(3-2*i)*k,2*k,k); ctx.fillStyle='#3a3442'; ctx.fillRect(x-6*k,y+4*k,13*k,k); }
function m5Steps(x,y,k,c){ const f=(a,b,w,h)=>ctx.fillRect(x+a*k,y+b*k,w*k,h*k); ctx.fillStyle=c; f(0,-5,2,2); f(-1,-3,3,3); f(2,-2,1,1); f(-2,-2,1,1); f(-1,0,1,2); f(1,0,1,2); f(-2,2,1,1); f(2,2,1,1); }
// подписи v2: шахматка, цена у замка, отступы ≥8 px от края таблички, сжатие → скрытие середины → «…»
function m5RouteLabels(RT,N,Y,axY,y2,k,lc,D,pl,prices){ const named=N.filter(n=>n.t==='st'||n.t==='x'), met=N.filter(n=>n.t==='st'), fork=!!RT.x, pad=m5Pad(k), xL=pl.ix+pad, xR=pl.ix+pl.iw-pad;
  met.forEach((n,j)=>{ n.band=(met.length-1-j)%2===0?'dn':'up'; }); if(RT.wk) met.forEach(n=>n.band='dn');
  N.filter(n=>n.t==='x').forEach(n=>n.band='x2');
  const yOf=b=>b==='up'?axY-D.gy:b==='dn'?axY+D.gy:y2+D.gy;
  const fixedOf=fs=>{ const o=[]; for(const n of N){ const s=n.t==='home'?'ДОМ':n.t==='bc'?'БЦ':n.t==='office'?'ОФИС':null; if(!s) continue; const w=txtW(s,fs); o.push({s,x:clamp(n.x-w/2,xL,xR-w),w,y:axY+D.gy,fix:1,col:RT.span&&!n.reach&&n.st!=='done'?'#b4a88e':'#6a5a3a'}); } return o; };
  const H_=fs=>Math.max(fs,MINPX())*1.25;
  const hits=(a,arr,fs)=>{ const h=H_(fs); if(a.x<xL-.5||a.x+a.w>xR+.5) return true; for(const b of arr){ if(b===a) continue; if(Math.abs(a.y-b.y)<h&&a.x<b.x+b.w+6*k&&b.x<a.x+a.w+6*k) return true; }
    for(const r of MAP5.rects) if(['ico','line','lamp','lockg','legend','price'].includes(r.kind)&&a.x<r.x+r.w&&r.x<a.x+a.w&&a.y-h/2<r.y+r.h&&r.y<a.y+h/2) return true; return false; };
  const plan=(fs,hideMid,ell)=>{ const out=fixedOf(D.fsS); for(const n of named){ if(hideMid&&n.t==='st'&&met.length>2&&n!==met[0]&&n!==met[met.length-1]&&!n.sel&&!n.exit) continue; let s=n.name, w=txtW(s,fs);
      out.push({n,s,w,x:clamp(n.x-w/2,xL,xR-w),y:yOf(n.band),col:RT.span&&!n.reach?'#a89cb0':n.sel?shade(lc,-.35):n.t==='x'?'#3a3442':'#1a1020',fs}); }
    // МЦК/МЦД: гарантированный зазор между подписями нижнего ряда — иначе вторая ниже (шахматка), иначе мельче/«…»
    const xs=out.filter(q=>q.n&&q.n.t==='x'); if(xs.length===2){ const [a,b]=xs, gapMin=Math.max(6*k,10), lh=Math.max(fs,MINPX())*1.25, y3=y2+D.gy+lh, room=pl.iy+pl.ih-3*k-lh/2;
      const sep=()=>b.x-(a.x+a.w); if(sep()<gapMin){ const yU=y2-D.gy, tryU=[b,a].find(q=>{ const o=q.y; q.y=yU; const bad=hits(q,out,q.fs||fs); if(bad) q.y=o; return !bad; }); if(tryU){} else if((()=>{ const ax=a.x,bx=b.x; a.x=clamp(a.n.x+D.rl-a.w,xL,xR-a.w); b.x=clamp(b.n.x-D.rl,xL,xR-b.w); if(sep()>=gapMin&&!hits(a,out,a.fs||fs)&&!hits(b,out,b.fs||fs)) return true; a.x=ax; b.x=bx; return false; })()){} else if(y3<=room){ b.y=y3; b.band='x3'; } else { let f2=fs; while(sep()<gapMin&&f2>D.fsS-k){ f2-=.5; for(const q of xs){ q.fs=f2; q.w=txtW(q.s,f2); q.x=clamp(q.n.x-q.w/2,xL,xR-q.w); } }
        while(sep()<gapMin&&(a.s.length>4||b.s.length>4)){ for(const q of xs){ if(q.s.length>4){ q.s=q.s.replace(/…$/,'').slice(0,-1)+'…'; q.w=txtW(q.s,q.fs); q.x=clamp(q.n.x-q.w/2,xL,xR-q.w); } } } } } }
    for(const p of prices){ const s=p.p>0?'ещё '+p.p+' очк.':'откроется!', w=txtW(s,D.fsS); let q={s,w,x:clamp(p.x-w/2,xL,xR-w),y:axY+D.gy,col:'#8a6a2a',price:1,fs:D.fsS}; if(hits(q,out,D.fsS)) q={...q,y:axY-D.gy}; out.push(q); }
    for(const q of out){ if(!q.n||!hits(q,out,q.fs||D.fsS)) continue; const x0=q.x, y0=q.y, ys=q.n.t==='x'?[y0,y2-D.gy]:[y0,q.band==='up'?axY+D.gy:axY-D.gy]; let done=false;
      for(const yy of ys){ for(const nx of [q.n.x-q.w/2,q.n.x+D.rl-q.w,q.n.x-D.rl,q.n.x-q.w*.75,q.n.x-q.w*.25,...[1,2,3,5,6,7,8,9,10,11,13,14,15].map(t=>q.n.x-q.w*t/16)]){ q.x=clamp(nx,xL,xR-q.w); q.y=yy; if(!hits(q,out,q.fs||D.fsS)){ done=true; break; } } if(done) break; } if(!done&&ell){ let s0=q.n.name; const f=q.fs||D.fsS; while(!done&&s0.length>5){ s0=s0.slice(0,-1); q.s=s0+'…'; q.w=txtW(q.s,f); for(const yy of ys){ for(const t of [8,4,12,2,6,10,14,0,16]){ q.x=clamp(q.n.x-q.w*t/16,xL,xR-q.w); q.y=yy; if(!hits(q,out,f)){ done=true; break; } } if(done) break; } } }
      if(!done){ q.x=x0; q.y=y0; } }
    return out; };
  const ok=arr=>arr.every(a=>!hits(a,arr,a.fs||D.fsS));
  let best=null; for(const [fs,hm,el] of [[D.fs,false],[D.fs-k*.5,false],[D.fs-k,false],[D.fsS,false],[D.fs,true],[D.fs-k,true],[D.fsS,true],[D.fsS,true,true]]){ const a=plan(fs,hm,el); if(ok(a)){ best=a; break; } }
  if(!best){ best=plan(D.fsS,true,true); const keep=[]; for(const a of best){ if(a.n&&(a.n.sel||a.n.exit)&&hits(a,keep,a.fs||D.fsS)){ const f=a.fs||D.fsS; { a.s=a.n.name; a.w=txtW(a.s,f); const ys=[a.y,a.y===axY-D.gy?axY+D.gy:axY-D.gy], soft=b=>b.n&&b.n.t==='st'&&!b.n.sel&&!b.n.exit; let got=false; for(const pass of [0,1]){ for(const yy of ys){ for(const t of [8,4,12,2,6,10,14,0,16,1,3,5,7,9,11,13,15,-2,-3,-4,-6]){ a.y=yy; a.x=clamp(a.n.x-a.w*t/16,xL,xR-a.w); const kk=pass?keep.filter(b=>!soft(b)):keep; if(!hits(a,kk,f)){ got=true; if(pass){ for(let i=keep.length-1;i>=0;i--) if(soft(keep[i])&&hits(a,[keep[i]],f)) keep.splice(i,1); } break; } } if(got) break; } if(got) break; } if(got){ keep.push(a); continue; } } for(const yy of [a.y,a.y===axY-D.gy?axY+D.gy:axY-D.gy]){ a.y=yy; let s0=a.n.name; while(s0.length>5){ a.s=s0===a.n.name?s0:s0+'…'; a.w=txtW(a.s,f); let okx=false; for(const nx of [a.n.x-a.w/2,a.n.x-D.rl,a.n.x+D.rl-a.w]){ a.x=clamp(nx,xL,xR-a.w); if(!hits(a,keep,f)){ okx=true; break; } } if(okx) break; s0=s0.slice(0,-1); } if(!hits(a,keep,f)) break; } }
    if(!hits(a,keep,a.fs||D.fsS)||a.n&&a.n.sel) keep.push(a); } best=keep; }
  for(const q of best){ m5Lab(q.s,q.x,q.y,q.fs||D.fsS,q.col,'left',q.price?'price':'lab'); } }
// ---------- выходной: указатели-таблички на столбе (информация, выбор — в игре) ----------
function m5MiniIco(kind,cx,cy,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); };
  if(kind==='cart'){ f(-4,-3,1,1,P.ink); f(-3,-3,8,1,P.ink); f(-3,-2,7,4,P.ink); f(-2,-2,5,3,'#e8e8f0'); f(-2,3,2,2,P.ink); f(2,3,2,2,P.ink); }
  else if(kind==='sprout'){ f(-3,1,7,4,P.ink); f(-2,2,5,2,'#a8643a'); f(0,-3,1,4,'#2a6a2a'); f(-3,-4,3,2,'#5ac85a'); f(1,-5,3,2,'#5ac85a'); }
  else if(kind==='heart'){ f(-3,-3,3,2,'#fff'); f(1,-3,3,2,'#fff'); f(-4,-2,9,2,'#fff'); f(-3,0,7,1,'#fff'); f(-2,1,5,1,'#fff'); f(-1,2,3,1,'#fff'); f(0,3,1,1,'#fff'); }
  else if(kind==='bus'){ f(-5,-3,11,7,P.ink); f(-4,-2,9,4,'#ffd23f'); f(-3,-2,2,2,'#bfe6ff'); f(0,-2,2,2,'#bfe6ff'); f(3,-2,1,2,'#bfe6ff'); f(-3,3,2,2,P.ink); f(2,3,2,2,P.ink); }
  else if(kind==='tram'){ f(-1,-6,3,1,P.ink); f(0,-5,1,2,P.ink); f(-5,-3,11,7,P.ink); f(-4,-2,9,4,'#e8343a'); f(-3,-2,2,2,'#bfe6ff'); f(0,-2,2,2,'#bfe6ff'); f(3,-2,1,2,'#bfe6ff'); f(-3,3,2,2,P.ink); f(2,3,2,2,P.ink); }
  else if(kind==='train'){ f(-5,-3,11,7,P.ink); f(-4,-2,9,4,'#ff8a1f'); f(-3,-2,2,2,'#bfe6ff'); f(0,-2,2,2,'#bfe6ff'); f(-4,1,9,1,'#3d6ff0'); f(-3,3,2,2,P.ink); f(2,3,2,2,P.ink); } }
function m5Sil(kk,cx,by,k,c){ const f=(a,b,w,h)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,by+b*k,w*k,h*k); };
  if(kk==='mega'){ f(-6,-8,12,7); f(-4,-10,8,2); ctx.fillStyle='#ffe9a8'; for(const xx of [-4,-1,2]) ctx.fillRect(cx+xx*k,by-6*k,2*k,k); }
  else if(kk==='dacha'){ for(let i=0;i<5;i++) f(-1-i,-11+i,2+2*i,1); f(-5,-6,10,5); f(3,-10,1,3); ctx.fillStyle='#ffe9a8'; ctx.fillRect(cx-3*k,by-5*k,2*k,2*k); }
  else { f(-1,-5,2,4); f(-4,-11,8,4); f(-5,-9,10,3); f(-3,-12,6,1); } }
const M5_WKV={mega:'bus',dacha:'train',nastya:'tram'};
function m5WkSigns(n,Y,axY,k,D,pl,wkW){ const pair=n.pair||[], x0=n.x, pad=m5Pad(k), sx=x0+D.rl+11*k, sw=Math.min(wkW+D.rl,pl.ix+pl.iw-pad-sx), sh=15*k;
  // развилка «?»: выбор — в игре
  disc(ctx,x0,axY,D.rl+k,D.rl+k,P.ink); disc(ctx,x0,axY,D.rl,D.rl,'#ffd23f'); disc(ctx,x0-2*k,axY-2*k,k,k,'#fff6c0'); G.labels.push(['?',x0,axY+.5,m5fs(12,k),'#1a1020','center',null]); m5Reg('lamp',x0-D.rl-k,axY-D.rl-k,2*D.rl+3*k,2*D.rl+3*k);
  // столб
  const px=sx-4*k, ya=axY-11*k-sh/2, yb=axY+11*k+sh/2; ctx.fillStyle=P.ink; ctx.fillRect(px-k,ya-2*k,4*k,yb-ya+4*k); ctx.fillStyle='#8a8898'; ctx.fillRect(px,ya-k,2*k,yb-ya+2*k); ctx.fillStyle='#c8c4d0'; ctx.fillRect(px,ya-k,k,yb-ya+2*k);
  ctx.fillStyle='#8a8898'; ctx.fillRect(x0+D.rl+2*k,axY-k,px-x0-D.rl-3*k,2*k); m5Reg('line',px-k,ya-2*k,4*k,yb-ya+4*k);
  pair.forEach((kk,j)=>{ const d=(typeof WK5!=='undefined'&&WK5[kk])||{t:kk,col:'#888'}, cy=Math.round(axY+(j?1:-1)*11*k), y=cy-sh/2, x=sx, w=sw-6*k, c=shade(d.col,-.05);
    // табличка-стрелка (плоская, без «кнопочного» объёма)
    const tip=Math.round(sh/2/k)*k; ctx.fillStyle=P.ink; ctx.fillRect(x-k,y-k,w+k,sh+2*k); for(let r=0;r<=tip;r+=k){ ctx.fillRect(x+w,y-k+r,r+k,k); ctx.fillRect(x+w,y+sh-r,r+k,k); } ctx.fillRect(x+w,y+tip-k,tip+2*k,sh-2*tip+2*k);
    ctx.fillStyle=c; ctx.fillRect(x,y,w,sh); for(let r=k;r<tip;r+=k){ ctx.fillRect(x+w,y+r,r-k,k); ctx.fillRect(x+w,y+sh-r-k,r-k,k); } ctx.fillRect(x+w,y+tip,tip-k,Math.max(0,sh-2*tip));
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(x+k,y+k,w-2*k,k); ctx.fillStyle='#fffaf0'; ctx.fillRect(x+2*k,y+2*k,k,k); ctx.fillRect(x+2*k,y+sh-3*k,k,k);
    m5MiniIco(M5_WKV[kk]||'bus',x+10*k,cy,k); m5Sil(kk,x+w-7*k,y+sh,k,shade(d.col,-.45));
    const fs=m5fs(11,k), tw=w-30*k; m5Lab(m5Fit(d.t,tw,fs),x+18*k,cy,fs,'#fff','left','wkc'); G.labels[G.labels.length-1][6]=shade(d.col,-.5); }); }
// ---------- схема линии v2 (отступы ≥8 px, длинные имена — в 2 строки) ----------
function m5Wrap(s,lim,fs){ if(txtW(s,fs)<=lim) return [s]; const sp=[...s.matchAll(/ /g)].map(m=>m.index); if(!sp.length) return [m5Fit(s,lim,fs)]; let best=sp[0], bd=1e9; for(const i of sp){ const d=Math.abs(txtW(s.slice(0,i),fs)-txtW(s.slice(i+1),fs)); if(d<bd){ bd=d; best=i; } }
  return [m5Fit(s.slice(0,best),lim,fs),m5Fit(s.slice(best+1),lim,fs)]; }
function m5DrawLine(Y,sy,pl){ const {k,L,R,py,ph,hs}=Y, y0=py+sy, w=mapLine, op=lineOpen(w), lc=op?LINE_COL[w]:'#8a8898', pts=tripPts(), idx=map4Idx(), hb=Math.max(28,44*DPR/SC), pad=m5Pad(k), xL=pl.ix+pad, xR=pl.ix+pl.iw-pad;
  // шапка
  const hh=hs-3*k, hy=pl.iy+Math.round(hh/2); ctx.fillStyle=lc; ctx.fillRect(pl.ix,pl.iy,pl.iw,hh); ctx.fillStyle=shade(lc,.25); ctx.fillRect(pl.ix,pl.iy,pl.iw,k); ctx.fillStyle=shade(lc,-.35); ctx.fillRect(pl.ix,pl.iy+hh,pl.iw,2*k);
  const st=Math.max(18*k,Math.ceil(hb*.62)), cxs=[0,1,2,3,4].map(j=>xR-5*k-(4-j)*st), cy=hy, hbw=Math.min(hb,st-k), hbh=Math.max(hb,hh);
  m5Lab(m5Fit((w+1)+' · '+LINE_NAMES[w].toUpperCase()+' ВЕТКА',cxs[0]-8*k-xL,m5fs(12,k)),xL,hy,m5fs(12,k),'#fff','left','hdr'); G.labels[G.labels.length-1][6]=P.ink;
  for(let j=0;j<3;j++){ const cx=cxs[j+1]; m5LineBadgeMini(cx,cy,k,j,j===w); m5Reg('chip',cx-7*k,cy-7*k,14*k,14*k); buttons.push({x:cx-hbw/2,y:y0,w:hbw,h:hbh,id:'line'+j,cb:()=>{ mapLine=j; SFX.ui(); }}); }
  const arrow=(cx,dir,id,cb)=>{ ctx.fillStyle=P.ink; for(let r=0;r<6;r++){ const hgt=(r*2+1)*k+2*k, xx=dir>0?cx+2*k-r*k:cx-3*k+r*k; ctx.fillRect(xx-k,cy-r*k-k-k/2|0,k*3,hgt); } ctx.fillStyle='#fffaf0'; for(let r=0;r<5;r++){ const hgt=(r*2+1)*k, xx=dir>0?cx+2*k-r*k:cx-3*k+r*k; ctx.fillRect(xx,cy-r*k-k/2|0,k,hgt); }
    m5Reg('arrow',cx-5*k,cy-6*k,10*k,12*k); buttons.push({x:cx-hbw/2,y:y0,w:hbw,h:hbh,id,cb}); };
  arrow(cxs[0],-1,'prev',()=>{ mapLine=(mapLine+2)%3; SFX.ui(); }); arrow(cxs[4],1,'next',()=>{ mapLine=(mapLine+1)%3; SFX.ui(); });
  // 8 станций: ось по центру тела
  const D=m5Dims(k,false), fs=m5fs(12,k), fsS=m5fs(10,k), lh=Math.max(fs,MINPX())*1.15, bodyT=pl.iy+hs, bodyB=pl.iy+pl.ih;
  const axY=Math.round((bodyT+bodyB)/2+k), ax0=xL+22*k, ax1=xR-22*k, xs=[...Array(8)].map((_,i)=>Math.round(ax0+(ax1-ax0)*i/7)), tf=tfSet(), gap=xs[1]-xs[0];
  ctx.fillStyle=P.ink; ctx.fillRect(xs[0],axY-D.bt-k,xs[7]-xs[0],2*D.bt+3*k); ctx.fillStyle=lc; ctx.fillRect(xs[0],axY-D.bt,xs[7]-xs[0],2*D.bt+k); ctx.fillStyle=shade(lc,.3); ctx.fillRect(xs[0],axY-D.bt,xs[7]-xs[0],k);
  const nxt=[...Array(8)].findIndex((_,i)=>!lvOpen(w,i));
  for(let i=0;i<8;i++){ const ii=w*8+i, o=lvOpen(w,i), done=!!(save.tbest&&save.tbest[ii]), sel=ii===idx, x=xs[i]; const stt=!o?'lock':sel?'cur':done?'done':'next';
    if(tf.has(ii)){ const a=D.rl+2*k; ctx.fillStyle=P.ink; ctx.fillRect(x-a-k,axY-a-k,2*a+3*k,2*a+3*k); ctx.fillStyle='#fffaf0'; ctx.fillRect(x-a,axY-a,2*a+k,2*a+k); }
    m5Lamp(x,axY,k,'c',stt,true,D.rl); m5Reg('lamp',x-D.rl-k,axY-D.rl-k,2*D.rl+3*k,2*D.rl+3*k);
    const up=i%2===1, lim=gap*2-8*k, lines=m5Wrap(LEVELS[ii].name,lim,fs), col=!o?'#8a8898':sel?shade(lc,-.35):'#1a1020';
    lines.forEach((s,li)=>{ const lw=txtW(s,fs), lx=clamp(x-lw/2,xL,xR-lw), n=lines.length, ly=up?axY-D.gy-(n-1-li)*lh:axY+D.gy+li*lh; m5Lab(s,lx,ly,fs,col,'left'); });
    if(done){ const stc=save.stars[w+'.'+i]||0, syy=up?axY+D.rl+3*k:axY-D.rl-5*k; for(let q=0;q<3;q++){ ctx.fillStyle=P.ink; ctx.fillRect(x-5*k+q*4*k-k,syy-k,4*k,4*k); ctx.fillStyle=q<stc?'#ffb400':'#d8d0c0'; ctx.fillRect(x-5*k+q*4*k,syy,2*k,2*k); } m5Reg('stars',x-6*k,syy-k,13*k,4*k); }
    if(i===nxt&&op){ const str='ещё '+Math.max(0,ST_THR[ii]-pts)+' очк.', pw=txtW(str,fsS), n=lines.length, pyy=up?axY-D.gy-n*lh:axY+D.gy+n*lh; m5Lab(str,clamp(x-pw/2,xL,xR-pw),pyy,fsS,'#8a6a2a','left','price'); }
    const bw=Math.min(hb,gap-2); buttons.push({x:x-bw/2,y:axY-hb/2,w:bw,h:hb,id:'st'+i,cb:()=>{ if(o){ mapSel=i; MAP5.flick=.45; SFX.ui(); MAP5.closeT=.4; } else { say(lineOpen(w)?'Откроется при '+ST_THR[ii]+' очк. (у тебя '+pts+')':'Сначала пройди ветку '+w,2.5,'#ff8a6a'); } }}); }
  if(!op){ const s='ВЕТКА ЗАКРЫТА', fz=m5fs(12,k); m5Lab(s,(xL+xR)/2-txtW(s,fz)/2,bodyT+6*k,fz,'#6a6478','left','hdr2'); } }
// ---------- карточка станции v2: иерархия + полоса цели + строка погоды/рисков ----------
function m5DayRisks(plan){ const out=[]; const add=e=>{ if(e&&!out.includes(e)&&M5_RISK[e]) out.push(e); }; for(const s of plan.segs||[]) if(!s.locked&&s.events) s.events.forEach(e=>add(e.k)); (plan.events||[]).forEach(add);
  return out.sort((a,b)=>(M5_HEAVY.includes(b)?1:0)-(M5_HEAVY.includes(a)?1:0)); }
function m5Card(Y,day,plan,idx){ const {k,L,by,bh,dx0}=Y, x=L, y=by+2*k, w=dx0-9*k-L, h=bh-4*k, wl=Math.floor(idx/8), lc=LINE_COL[wl], s=LEVELS[idx], R41r=m5R41(plan), st=R41r?(save.routes.stars[R41r.id]|0):save.stars[wl+'.'+(idx%8)]||0, pad=m5Pad(k);
  ctx.fillStyle='rgba(60,40,20,.3)'; ctx.fillRect(x+2*k,y+2*k,w,h); m5Box(x,y,w,h,'#f4ead0',k); ctx.fillStyle='#fffaf0'; ctx.fillRect(x,y,w,k); ctx.fillStyle='#d8ccae'; ctx.fillRect(x,y+h-k,w,k);
  ctx.fillStyle=P.ink; ctx.fillRect(x,y,5*k,h); ctx.fillStyle=lc; ctx.fillRect(x,y,4*k,h); ctx.fillStyle=shade(lc,.3); ctx.fillRect(x,y,k,h); ctx.fillStyle=shade(lc,-.3); ctx.fillRect(x+3*k,y,k,h);
  for(const [rx,ry] of [[x+w-3*k,y+2*k],[x+w-3*k,y+h-4*k]]) m5Rivet(rx,ry,k);
  // окошко кабины с портретом (тап — герои)
  const ps=Math.min(26*k,Math.round(h*.52)), px=x+w-ps-6*k, pyy=y+4*k; m5Box(px,pyy,ps,ps,'#2e3448',k); ctx.fillStyle='#4a5a7a'; ctx.fillRect(px,pyy,ps,Math.round(ps*.45)); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(px+2*k,pyy,2*k,ps);
  const por=typeof heroPortrait==='function'?heroPortrait(save.hero||'serega'):null; if(por){ const sc=Math.max(1,Math.round(ps/22)); ctx.save(); ctx.beginPath(); ctx.rect(px,pyy,ps,ps); ctx.clip(); ctx.drawImage(por,Math.round(px+ps/2-12*sc),Math.round(pyy+ps-24*sc),24*sc,24*sc); ctx.restore(); }
  ctx.fillStyle='#8a8494'; ctx.fillRect(px,pyy+ps-2*k,ps,2*k);
  if(m5CanBuy()){ m5Box(px+ps-6*k,pyy-2*k,8*k,8*k,'#ffd23f',k); ctx.fillStyle=P.ink; ctx.fillRect(px+ps-3*k,pyy-k,2*k,6*k); ctx.fillRect(px+ps-5*k,pyy+k,6*k,2*k); }
  m5Reg('hero',px-k,pyy-3*k,ps+3*k,ps+4*k);
  const tx=x+10*k, tw=px-5*k-tx, big=h>=58*k, fsB=m5fs(big?17:15,k), fsS=m5fs(big?12.5:11,k), lhS=Math.max(fsS,MINPX())*1.2; let f=fsB, nm=R41r?R41r.n:s.name.toUpperCase(); while(txtW(nm,f)>tw&&f>m5fs(11,k)) f-=.5; nm=m5Fit(nm,tw,f);
  const lhB=Math.max(f,MINPX())*1.2, botH=Math.max(12*k,lhS+4*k), botY=y+h-botH; let cy=y+4*k+lhB/2;
  m5Lab(nm,tx,cy,f,'#1a1020','left','card'); cy+=lhB/2+lhS/2+k;
  const mm=Math.floor(plan.total/60), ss=String(Math.round(plan.total%60)).padStart(2,'0'), nst=MAP5.rt?MAP5.rt.N.filter(n=>n.t==='st'||n.t==='x').length-1:0;
  const nev=(plan.segs||[]).reduce((a,g)=>a+(g.id==='metro'?0:g.events.length),0), info=R41r?('3 экрана · ≈ '+mm+':'+ss+(nev?' · событий '+nev:'')):(plan.wk?'выходной':Math.max(1,nst)+' ост.')+' · ≈ '+mm+':'+ss; const roomGoal=cy+lhS*1.5+k+2*k<botY; if(!roomGoal&&!plan.wk&&cy+lhS/2<botY-k){ const sp=Math.round(plan.total*.2); let pk=null; for(const c of ['★ вовремя · ★★ запас '+sp+' с · ★★★ + место','★ вовремя ★★ +'+sp+' с ★★★ +место','★ вовремя ★★ +'+sp+'с ★★★ место','★ успеть ★★ +'+sp+'с ★★★ место','★успеть ★★+'+sp+'с ★★★место','★★ запас '+sp+' с']){ for(let f=fsS;f>=m5fs(9,k)-.01&&!pk;f-=.5) if(txtW(c,f)<=tw) pk=[c,f]; if(pk) break; } if(pk){ m5Lab(pk[0],tx,cy,pk[1],'#5a4a6a','left','card'); MAP5.goalLines=[pk[0]]; cy=1e9; } }
  if(cy+lhS/2<botY-k){ { const inf=[info,info.replace(' · событий ',' · соб. '),info.split(' · событий')[0],'≈ '+mm+':'+ss].find(q=>txtW(q,fsS)<=tw)||info; m5Lab(m5Fit(inf,tw,fsS),tx,cy,fsS,'#5a4a6a','left','card'); } cy+=lhS; }
  // цель/рекорд + полоса (ширина — до края карточки, если ниже портрета)
  const rec=save.tbest&&save.tbest[idx]||0, gy=cy+k, bwFull=(gy>pyy+ps+2*k?x+w-6*k:px-5*k)-tx;
  if(gy+lhS/2+2*k<botY){ const sp=Math.round(plan.total*.2), two=gy+lhS*1.5+2*k<botY; let G2=null;
    if(plan.wk) G2=[[(day.weekday===6?'воскресенье':'суббота')+' — без цели'],['выходной — без цели']];
    else G2=(two?[['★ вовремя · ★★ запас '+sp+' с','★★★ + угол или место в вагоне'],['★ вовремя · ★★ запас '+sp+' с','★★★ + угол/место'],['★ к 09:00 ★★ +'+sp+' с','★★★ + угол/место']]:[])
      .concat([['★ вовремя · ★★ запас '+sp+' с · ★★★ + место'],['★ вовремя ★★ +'+sp+' с ★★★ +место'],['★ вовремя · ★★ запас '+sp+' с'],['★★ запас '+sp+' с']]);
    let pick=null; for(const c of G2){ for(let f=fsS;f>=m5fs(9,k)-.01&&!pick;f-=.5) if(c.every(q=>txtW(q,f)<=bwFull)) pick={c,f}; if(pick) break; }
    if(pick){ pick.c.forEach((q,j)=>m5Lab(q,tx,gy+j*lhS,pick.f,j?'#7a5a2a':'#5a4a6a','left','card')); MAP5.goalLines=pick.c; }
    const yb=1e9; if(false){ const bw=bwFull, r=Math.min(1,rec/Math.max(1,plan.target)); const bt=big?3*k:2*k; m5Box(tx,yb,bw,bt,'#d8ccae',k); ctx.fillStyle=r>=1?'#3cb860':'#ffb43a'; ctx.fillRect(tx,yb,Math.round(bw*r),bt); ctx.fillStyle='rgba(255,255,255,.5)'; ctx.fillRect(tx,yb,Math.round(bw*r),k); m5Reg('bar',tx-k,yb-k,bw+2*k,4*k); } }
  if(plan.wk&&MAP5.rt&&MAP5.rt.wk){ const pr=(MAP5.rt.N.find(n=>n.t==='wk')||{}).pair||[]; let yy=Math.round(gy+lhS*1.2); for(const kk of pr){ const d=WK5[kk]; if(!d||yy+lhS/2>botY-2*k) break; m5MiniIco(M5_WKV[kk]||'bus',tx+5*k,yy,k); { const sub=(day.weekday===6?d.sun:d.sub), cands=[d.t.toLowerCase()+': '+sub,sub,d.t.toLowerCase()], ww=bwFull-14*k; let pk=null; for(const c of cands){ for(let f=fsS;f>=m5fs(9,k)-.01&&!pk;f-=.5) if(txtW(c,f)<=ww) pk=[c,f]; if(pk) break; } if(!pk) pk=[m5Fit(d.t.toLowerCase(),ww,m5fs(9,k)),m5fs(9,k)]; m5Lab(pk[0],tx+13*k,yy,pk[1],shade(d.col,-.25),'left','card'); } m5Reg('wkico',tx-k,yy-5*k,12*k,10*k); yy+=Math.max(lhS,11*k); } }
  // нижняя строка: погода · риски дня · звёзды
  ctx.fillStyle='#d8ccae'; for(let xx=x+7*k;xx<x+w-3*k;xx+=4*k) ctx.fillRect(xx,botY,2*k,k);
  const ry=Math.round(botY+botH/2+k/2), wx=dayWeather(day), tp=m5Temp(day,wx); let rx=tx; m5WxIco(wx,rx+4*k,ry,k); rx+=10*k; const ts=(tp>0?'+':'')+tp+'°'; m5Lab(ts,rx,ry,fsS,'#3a5a8a','left','card'); rx+=txtW(ts,fsS)+5*k;
  const starW=3*12, rk=Math.max(1,Math.round(k*.8)), lim=x+w-6*k-starW-6*k; const rs=m5DayRisks(plan); let shown=0; for(const e of rs){ if(rx+12*rk>lim) break; m5Risk(e,rx+5*rk,ry,rk); m5Reg('risk',rx,ry-5*rk,11*rk,11*rk); rx+=12*rk; shown++; }
  if(rs.length>shown&&rx+txtW('+'+(rs.length-shown),fsS)<lim){ m5Lab('+'+(rs.length-shown),rx,ry,fsS,'#5a5068','left','card'); }
  for(let q=0;q<3;q++) starPx(x+w-6*k-starW+6+q*12,ry,q<st); m5Reg('stars',x+w-6*k-starW,ry-6,starW,12);
  return {x,y,w,h,px,pyy,ps}; }
function m5WxIco(wx,cx,cy,k){ const f=(a,b,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(cx+a*k,cy+b*k,w*k,h*k); };
  if(wx==='clear'){ disc(ctx,cx,cy,4*k,4*k,P.ink); disc(ctx,cx,cy,3*k,3*k,'#ffd23f'); f(-1,-3,1,1,'#fff6c0'); return; }
  f(-4,-2,8,4,P.ink); f(-2,-4,5,2,P.ink); f(-3,-1,6,2,'#dcdcec'); f(-1,-3,3,2,'#dcdcec');
  if(wx==='rain'){ f(-3,3,1,2,'#3a7ad8'); f(0,3,1,2,'#3a7ad8'); f(3,3,1,2,'#3a7ad8'); } else if(wx==='snow'){ f(-3,3,1,1,'#7a9ac8'); f(0,4,1,1,'#7a9ac8'); f(3,3,1,1,'#7a9ac8'); } else { f(-4,3,8,1,'#a8a8bc'); } }
// ---------- дверь v2 ----------
function m5Door(Y,sy,wx){ const {k,by,dw,dx0,dx1}=Y, top=by+sy, bot=H, calm=m5Calm(), t=G.t, o=MAP5.door, fh=7*k;
  // рама + лампа статуса
  ctx.fillStyle=P.ink; ctx.fillRect(dx0-6*k,top-2*k,dx1-dx0+12*k,bot-top+2*k); ctx.fillStyle='#5a5662'; ctx.fillRect(dx0-5*k,top-k,dx1-dx0+10*k,bot-top+k); ctx.fillStyle='#7a7684'; ctx.fillRect(dx0-5*k,top-k,dx1-dx0+10*k,k); ctx.fillRect(dx0-5*k,top-k,k,bot-top);
  ctx.fillStyle='#3a3642'; ctx.fillRect(dx0-k,top+fh-k,dx1-dx0+2*k,k);
  const lx=Math.round((dx0+dx1)/2), ly=top+Math.round(fh/2), on=MAP5.doorOn?(calm||Math.floor(t*8)%2===0):false; disc(ctx,lx,ly,3*k,3*k,P.ink); disc(ctx,lx,ly,2*k,2*k,on?'#5cff7a':MAP5.doorOn?'#2a6a3a':'#c83a3a'); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.fillRect(lx-k,ly-k,k,k);
  if(!MAP5.doorOn){ disc(ctx,lx,ly,4*k,4*k,'rgba(255,80,60,.12)'); } else if(on) disc(ctx,lx,ly,5*k,5*k,'rgba(90,255,120,.2)');
  for(const xx of [dx0-3*k,dx1+2*k]){ ctx.fillStyle='#8a8692'; ctx.fillRect(xx,ly-k,k,2*k); }
  m5Reg('dlamp',lx-4*k,ly-4*k,8*k,8*k);
  const y0=top+fh; ctx.fillStyle='#0c0a14'; ctx.fillRect(dx0,y0,dx1-dx0,bot-y0);
  if(o>0){ ctx.fillStyle='#2a2638'; ctx.fillRect(dx0,bot-14*k,dx1-dx0,14*k); ctx.fillStyle='#ffcc5c'; for(let j=0;j<3;j++){ const yy=y0+8*k+j*10*k, xx=dx0+((j*53*k+t*500*k)%(dx1-dx0)); ctx.fillRect(Math.round(xx),yy,8*k,k); } }
  const off=Math.round(o*o*dw*.96); ctx.save(); ctx.beginPath(); ctx.rect(dx0,y0,dx1-dx0,bot-y0); ctx.clip();
  const view=wx==='clear'?'tunnel':'city', winH=Math.max(14*k,Math.min(Math.round((bot-y0)*.55),bot-y0-SA.b-14*k));
  for(const side of [0,1]){ const lw=dw, x=side?dx0+dw+off:dx0-off, lead=side?x:x+lw; // ведущая кромка — к центру
    ctx.fillStyle=P.ink; ctx.fillRect(x,y0,lw,bot-y0); ctx.fillStyle='#b4b4c2'; ctx.fillRect(x+(side?3*k:k),y0,lw-4*k,bot-y0); ctx.fillStyle='#d0d0dc'; ctx.fillRect(x+(side?3*k:k),y0,k,bot-y0);
    // жёлтая кромка + резиновый уплотнитель
    const sx=side?x+k:x+lw-3*k; ctx.fillStyle='#ffd23f'; ctx.fillRect(sx,y0,2*k,bot-y0); ctx.fillStyle=shade('#ffd23f',-.3); ctx.fillRect(side?sx+k:sx,y0,k,bot-y0);
    ctx.fillStyle='#16141c'; ctx.fillRect(side?x:x+lw-k,y0,k,bot-y0); ctx.fillStyle='#3a3842'; ctx.fillRect(side?x:x+lw-k,y0,k,k*0+Math.max(1,k)); for(let yy=y0+3*k;yy<bot;yy+=6*k){ ctx.fillStyle='#4a4852'; ctx.fillRect(side?x:x+lw-k,yy,k,k); }
    // окно
    const wx0=x+(side?7*k:5*k), wy0=y0+5*k, ww=lw-12*k, wh=winH; m5Box(wx0,wy0,ww,wh,'#18162a',k); ctx.fillStyle='#8a8a98'; ctx.fillRect(wx0-k,wy0-k,ww+2*k,k);
    ctx.save(); ctx.beginPath(); ctx.rect(wx0,wy0,ww,wh); ctx.clip(); m5View(view,wx,wx0,wy0,ww,wh,k,calm?0:t,side); ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(wx0+ww*.55,wy0); ctx.lineTo(wx0+ww*.75,wy0); ctx.lineTo(wx0+ww*.35,wy0+wh); ctx.lineTo(wx0+ww*.15,wy0+wh); ctx.fill();
    ctx.fillStyle=P.ink; ctx.fillRect(wx0,wy0,k,k); ctx.fillRect(wx0+ww-k,wy0,k,k); ctx.fillRect(wx0,wy0+wh-k,k,k); ctx.fillRect(wx0+ww-k,wy0+wh-k,k,k);
    // наклейка + поручень-ниша
    const below=wy0+wh+3*k; if(!side&&below+14*k<bot-SA.b) m5Sticker(wx0+Math.round(ww/2),below+7*k,k);
    if(side&&below+12*k<bot-SA.b){ m5Box(wx0+Math.round(ww/2)-4*k,below+3*k,8*k,3*k,'#8a8a98',k); ctx.fillStyle='#d0d0dc'; ctx.fillRect(wx0+Math.round(ww/2)-4*k,below+3*k,8*k,k); } }
  ctx.restore(); }
function m5View(view,wx,x,y,w,h,k,t,side){ const sp=t*60*k;
  if(view==='tunnel'){ ctx.fillStyle='#24223a'; ctx.fillRect(x,y,w,h); ctx.fillStyle='#34324c'; for(let i=0;i<4;i++){ const xx=x+((i*23*k-sp*2+side*11*k)%(w+20*k)+w+20*k)%(w+20*k)-10*k; ctx.fillRect(Math.round(xx),y,3*k,h); }
    ctx.fillStyle='#55506e'; ctx.fillRect(x,y+Math.round(h*.3),w,k); ctx.fillRect(x,y+Math.round(h*.38),w,k); ctx.fillStyle='#ffcc5c'; const lx=x+((-sp*3+side*20*k)%(w+40*k)+w+40*k)%(w+40*k)-20*k; ctx.fillRect(Math.round(lx),y+Math.round(h*.7),6*k,k); return; }
  const sky=wx==='rain'?['#6a7890','#8a98ae']:wx==='snow'?['#a8b4c8','#c8d0de']:['#9a9aa8','#b8b8c4']; ctx.fillStyle=sky[0]; ctx.fillRect(x,y,w,h); ctx.fillStyle=sky[1]; ctx.fillRect(x,y,w,Math.round(h*.35));
  const gy=y+Math.round(h*.72); ctx.fillStyle=shade(sky[0],-.35); for(let i=0;i<8;i++){ const bw=(6+(i*5)%7)*k, bh=(8+(i*7)%13)*k, xx=x+((i*14*k-sp*.6+side*9*k)%(w+30*k)+w+30*k)%(w+30*k)-15*k; ctx.fillRect(Math.round(xx),gy-bh,bw,bh); ctx.fillStyle='#ffe9a8'; if(i%2===0) ctx.fillRect(Math.round(xx)+2*k,gy-bh+3*k,k,k); ctx.fillStyle=shade(sky[0],-.35); }
  ctx.fillStyle=shade(sky[0],-.5); ctx.fillRect(x,gy,w,y+h-gy);
  if(wx==='rain'){ ctx.fillStyle='rgba(200,225,255,.8)'; for(let j=0;j<10;j++){ const xx=x+((j*29+side*13)*k)%w, yy=y+((j*41*k+t*90*k)%h); ctx.fillRect(xx,Math.round(yy),k,3*k); } }
  if(wx==='snow'){ ctx.fillStyle='#fff'; for(let j=0;j<12;j++){ const xx=x+((j*31+side*7)*k+Math.round(Math.sin(t*2+j)*2*k)+w)%w, yy=y+((j*23*k+t*14*k)%h); ctx.fillRect(xx,Math.round(yy),k,k); } }
  if(wx==='fog'){ ctx.fillStyle='rgba(220,220,232,.45)'; ctx.fillRect(x,y,w,h); } }
// ---------- кадр v2 ----------
drawMap=function(){ if(typeof HS!=='undefined'&&HS.open) return drawHeroes();
  G.labels=[]; buttons=[]; MAP5.rects=[]; MAP5.labs=[]; MAP5.ledQ=[]; const calm=m5Calm();
  const day=ensureDay(), idx=map4Idx(), plan=dayPlan(idx,day), wx=dayWeather(day), RT=m5Route(idx,day,plan), Y=m5Layout(MAP5.sheet?'sheet':RT.x?'fork':RT.wk?'wk':'n'); MAP5.lay=Y; MAP5.rt=RT;
  if(idx!==MAP5.lastIdx){ if(MAP5.lastIdx>=0&&!calm) MAP5.flick=.45; MAP5.lastIdx=idx; }
  const sway=(!calm&&(G.t%3.1)>2.9)?1:0, lc=LINE_COL[Math.floor(idx/8)];
  m5Wall(Y); m5Led(Y,day,plan,idx); m5Menu(Y);
  const rp=MAP5.sheet&&typeof m5Picker==='function'&&!plan.wk; MAP5.rp=rp; const pl=m5Plate(rp?Object.assign({},Y,{ph:Y.B-Y.py}):Y,sway,rp?'#2aa860':MAP5.sheet?(lineOpen(mapLine)?LINE_COL[mapLine]:'#8a8898'):lc,true); MAP5.pl=pl; const nb0=buttons.length; if(rp) m5Picker(Y,pl,plan); else if(MAP5.sheet) m5DrawLine(Y,sway,pl); else m5DrawRoute(Y,sway,day,plan,idx,RT,pl);
  if(MAP5.flipTo!=null){ const f=MAP5.flip, cov=Math.round((f<.5?f*2:(1-f)*2)*pl.ih); ctx.fillStyle='#ece4d0'; ctx.fillRect(pl.ix,pl.iy,pl.iw,cov); ctx.fillStyle='#cfc4aa'; for(let yy=pl.iy+4*Y.k;yy<pl.iy+cov;yy+=5*Y.k) ctx.fillRect(pl.ix,yy,pl.iw,Y.k); ctx.fillStyle=P.ink; ctx.fillRect(pl.ix,pl.iy+cov,pl.iw,Y.k);
    G.labels=G.labels.filter(l=>!(l[2]>pl.iy&&l[2]<pl.iy+cov+4)); buttons.length=nb0; }
  if(!rp){ const card=m5Card(Y,day,plan,idx); buttons.push({x:card.px-2*Y.k,y:card.pyy-3*Y.k,w:card.ps+4*Y.k,h:card.ps+6*Y.k,id:'heroes',cb:()=>{ SFX.ui(); openHeroes(); }});
  m5Door(Y,sway,wx); m5GoBtn(Y); }
  MAP4.rects=MAP5.rects; MAP4.labs=MAP5.labs; MAP4.seg=[]; MAP4.intro=MAP5.intro; };
{ const _r=render; render=function(){ MAP5.ledQ=[]; _r.apply(this,arguments); if(G.scene==='map'&&!(typeof HS!=='undefined'&&HS.open)&&MAP5.ledQ.length){ tctx.setTransform(1,0,0,1,0,0); for(const f of MAP5.ledQ) f(); } MAP5.ledQ=[]; }; }
{ const _tm=toMap; toMap=function(){ const r=_tm.apply(this,arguments); const calm=m5Calm(); MAP5.intro=calm?0:MAP5.introT; MAP5.sheet=false; MAP5.flipTo=null; MAP5.flip=0; MAP5.door=0; MAP5.doorOn=false; MAP5.closeT=0;
    const d=map4Def(); if(mapSel<0) mapLine=Math.floor(d/8);
    try{ const open=[]; for(let i=0;i<24;i++) if(lvOpen(Math.floor(i/8),i%8)) open.push(i); if(MAP5.openSeen){ const nw=open.filter(i=>!MAP5.openSeen.includes(i)); if(nw.length) MAP5.msg={s:'ОТКРЫТА: '+LEVELS[nw[nw.length-1]].name.toUpperCase(),t:5}; } MAP5.openSeen=open; }catch(e){}
    return r; }; }
addEventListener('pointerdown',()=>{ if(G.scene==='map') MAP5.intro=0; },true);
{ const _ob=window.onBack; window.onBack=()=>{ if(G.scene==='map'&&!(typeof HS!=='undefined'&&HS.open)&&(MAP5.sheet||MAP5.flipTo)){ m5Sheet(false); return; } return _ob&&_ob(); }; }
function m5Tick(dt){ if(typeof HS!=='undefined'&&HS.open) return;
  if(MAP5.intro>0) MAP5.intro=Math.max(0,MAP5.intro-dt); if(MAP5.flick>0) MAP5.flick=Math.max(0,MAP5.flick-dt); if(MAP5.msg){ MAP5.msg.t-=dt; if(MAP5.msg.t<=0) MAP5.msg=null; }
  if(MAP5.closeT>0){ MAP5.closeT-=dt; if(MAP5.closeT<=0){ MAP5.closeT=0; m5Sheet(false); } }
  if(MAP5.flipTo!=null){ MAP5.flip+=dt/.3; if(MAP5.flip>=.5&&MAP5.sheet!==MAP5.flipTo) MAP5.sheet=MAP5.flipTo; if(MAP5.flip>=1){ MAP5.flip=0; MAP5.flipTo=null; } }
  if(MAP5.doorOn){ MAP5.door=Math.min(1,MAP5.door+dt/.55); if(MAP5.door>=1){ MAP5.doorOn=false; map4Go(); } }
}
{ const _up=update; update=function(dt){ _up(dt); if(G.scene==='map') m5Tick(dt); }; }
