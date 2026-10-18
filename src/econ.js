// ---------- v3.1: понятная экономика — полоска кошелька, карточки кассы, страница «КОШЕЛЁК» ----------
const PRICE={token:5,pass:40,unlim:25};
function icoCoin(x,y){ disc(ctx,x,y,6,6,P.ink); disc(ctx,x,y,5,5,'#ffd23f'); ctx.fillStyle='#fff6a8'; ctx.fillRect(x-3,y-3,2,2); ctx.fillStyle='#b88a10'; ctx.fillRect(x-1,y-3,2,6); }
function icoToken(x,y){ disc(ctx,x,y,6,6,P.ink); disc(ctx,x,y,5,5,'#c8783a'); ctx.fillStyle='#ffd8a0'; ctx.fillRect(x-3,y-2,1,5); ctx.fillRect(x+2,y-2,1,5); ctx.fillRect(x-2,y-2,1,2); ctx.fillRect(x+1,y-2,1,2); ctx.fillRect(x-1,y,2,1); }
function icoCard(x,y,col){ ctx.fillStyle=P.ink; ctx.fillRect(x-8,y-6,16,12); ctx.fillStyle=col||'#3d6ff0'; ctx.fillRect(x-7,y-5,14,10); ctx.fillStyle='#fff'; ctx.fillRect(x-5,y-3,6,2); ctx.fillStyle='#ffd23f'; ctx.fillRect(x+2,y+1,3,2); }
function icoDebt(x,y){ ctx.fillStyle=P.ink; ctx.fillRect(x-6,y-7,12,14); ctx.fillStyle='#fff'; ctx.fillRect(x-5,y-6,10,12); ctx.fillStyle='#d8265e'; ctx.fillRect(x-3,y-4,6,1); ctx.fillRect(x-3,y-1,6,1); ctx.fillRect(x-3,y+2,4,1); }
function passShort(){ const w=wallet(); if(hasUnlim()) return ['БЕЗЛИМИТ до 24:00','#2ed3c4']; if(w.rides>0) return ['ПРОЕЗДНОЙ: '+w.rides+' поезд.','#8fe03a']; return null; }
// аккуратная полоска сверху: монеты · жетоны · проездной
function walletStrip(cx,y){ const w=wallet(), ps=passShort(); const parts=[[icoCoin,String(w.coins),'#ffd23f'],[icoToken,String(w.tokens),'#ffb87a']]; if(ps) parts.push([(x,yy)=>icoCard(x,yy,ps[1]),ps[0],ps[1]]); else if(!w.tokens) parts.push([(x,yy)=>icoCard(x,yy,'#777'),'нет проезда','#ff8a8a']);
  const gap=14, ws=parts.map(p=>16+txtW(p[1],9)); const tot=ws.reduce((a,b)=>a+b,0)+gap*(parts.length-1)+20; let x=Math.round(cx-tot/2)+10;
  ctx.fillStyle='#120c18d0'; ctx.fillRect(Math.round(cx-tot/2),y,Math.round(tot),22); ctx.fillStyle='#ffffff22'; ctx.fillRect(Math.round(cx-tot/2),y,Math.round(tot),1);
  parts.forEach((p,i)=>{ p[0](x+6,y+11); G.labels.push([p[1],x+16,y+11,9,p[2],'left']); x+=ws[i]+gap; }); return tot; }
// HUD: полоска только у кассы/турникетов, без лишней строки текста
const _hudE=tripHUD; tripHUD=function(){ const z=TR.z; const show=z&&z.k==='gate'&&!z.passed; const keep=G.labels.length; _hudE();
  if(show){ // убрать старую текстовую строку кошелька
    for(let i=G.labels.length-1;i>=keep;i--){ const l=G.labels[i]; if(typeof l[0]==='string'&&/ мон\. · /.test(l[0])) G.labels.splice(i,1); }
    if(!z.kpanel) walletStrip(W/2,SA.t+28+(TR.scandal>12?8:0)); }
  if(z&&z.kpanel) drawKassa(z); };
// цель — коротко и по делу
const _gtE=goalText; goalText=function(z){ if(z&&z.k==='gate'&&!z.passed&&z.inK<0&&!canPass()&&!z.inQ) return 'Нет проезда? Касса слева ←'; if(z&&z.k==='gate'&&z.inK>0&&z.K&&z.K[0]===G.hero) return 'Твоя очередь в кассе — жми КАССА'; return _gtE(z); };
// касса: одна кнопка «КАССА» → панель с карточками
(function(){ const G0=ZONES.gate, ctx0=G0.ctx.bind(G0), bot0=G0.bot.bind(G0);
  G0.ctx=function(z){ const h=G.hero; if(z.inK>0&&z.K[0]===h&&!z.invite){ return {b:{label:'КАССА',col:'#d8a020',fn:()=>{ z.kpanel=1; z.kpT=0; tev('kassa_open'); }}}; } return ctx0(z); };
  G0.offers=function(){ const w=wallet(), c=w.coins; return [
    {id:'token',ico:icoToken,name:'ЖЕТОН',price:PRICE.token+' мон.',say:'1 проход через турникет',ok:c>=PRICE.token,why:'нужно '+PRICE.token+' мон.'},
    {id:'pass',ico:(x,y)=>icoCard(x,y,'#8fe03a'),name:'ПРОЕЗДНОЙ ×10',price:PRICE.pass+' мон.',say:'10 проходов, быстрее жетона',ok:c>=PRICE.pass,why:'нужно '+PRICE.pass+' мон.'},
    {id:'unlim',ico:(x,y)=>icoCard(x,y,'#2ed3c4'),name:'БЕЗЛИМИТ',price:PRICE.unlim+' мон.',say:'сколько угодно до полуночи',ok:c>=PRICE.unlim&&!hasUnlim(),why:hasUnlim()?'уже есть':'нужно '+PRICE.unlim+' мон.'},
    {id:'debt',ico:icoDebt,name:'В ДОЛГ',price:'−15 сек',say:'жетон бесплатно, но кассир тянет время',ok:c<PRICE.token,why:'есть монеты — купи жетон'}]; };
  G0.buy=function(z,id){ const w=wallet(), h=G.hero; z.kpanel=0;
    if(id==='token'){ tev('buy_token'); w.coins-=PRICE.token; w.tokens++; this.leaveK(z,'Жетон куплен!'); }
    else if(id==='pass'){ tev('buy_pass'); w.coins-=PRICE.pass; w.rides+=10; this.leaveK(z,'Проездной на 10 поездок!'); }
    else if(id==='unlim'){ tev('buy_unlim'); w.coins-=PRICE.unlim; w.unlim=mskDay(); this.leaveK(z,'Безлимит до полуночи!'); }
    else if(id==='debt'){ tev('buy_debt'); w.tokens++; pop('−'+penalize(15,'debt')+' с',h.x,h.y-56,P.red,9); this.leaveK(z,'Жетон в долг. Кассир вздыхает.'); } };
  G0.bot=function(z){ if(z.kpanel){ const o=this.offers(), c=wallet().coins; const pick1=c>=40?'pass':c>=25&&Math.random()<.5&&o[2].ok?'unlim':c>=5?'token':'debt'; this.buy(z,pick1); return {x:G.hero.x,y:G.hero.y}; } return bot0(z); };
})();
function drawKassa(z){ const offs=ZONES.gate.offers(); G.labels.length=0; ctx.fillStyle='rgba(10,6,20,.66)'; ctx.fillRect(0,0,W,H); buttons.length=0;
  const L=SA.l+10, R=W-SA.r-10, top=SA.t+8; G.labels.push(['КАССА',W/2,top+10,14,'#ffd23f','center',P.ink]); walletStrip(W/2,top+24);
  const gap=10, n=4, cw=Math.min(150,Math.floor((R-L-gap*(n-1))/n)), ch=Math.min(H-SA.b-top-96,128), x0=Math.round(W/2-(cw*n+gap*(n-1))/2), y=top+56;
  offs.forEach((o,i)=>{ const x=x0+i*(cw+gap); ctx.fillStyle=P.ink; ctx.fillRect(x-2,y-2,cw+4,ch+4); ctx.fillStyle=o.ok?'#fff8e8':'#a8a0a8'; ctx.fillRect(x,y,cw,ch); ctx.fillStyle=o.ok?'#ffe8a8':'#8a828a'; ctx.fillRect(x,y,cw,26);
    ctx.save(); ctx.translate(x+cw/2,y+13); ctx.scale(1.6,1.6); o.ico(0,0); ctx.restore();
    G.labels.push([o.name,x+cw/2,y+38,9,o.ok?'#1a1020':'#4a424a','center',null]);
    const ln=wrapW(o.say,cw-12,7); ln.slice(0,3).forEach((s,j)=>G.labels.push([s,x+cw/2,y+54+j*11,7,o.ok?'#4a3a5a':'#3a343a','center',null]));
    G.labels.push([o.ok?o.price:o.why,x+cw/2,y+ch-12,o.ok?10:7,o.ok?(o.id==='debt'?'#d8265e':'#1a7a40'):'#5a1a1a','center',null]);
    buttons.push({x,y,w:cw,h:ch,id:'buy_'+o.id,cb:()=>{ if(!o.ok){ say('Нельзя: '+o.why,1.6,P.red); SFX.hurt(); return; } ZONES.gate.buy(z,o.id); SFX.coin(); }}); });
  const iy=y+ch+8; G.labels.push(['Монеты: за поездки (звёзды и находки) и ежедневный бонус соседки',W/2,iy+6,7,'#ccc','center']);
  const bw=110, bh=28; bigBtn('НАЗАД',Math.round(W/2-bw/2),Math.min(H-SA.b-bh-4,iy+16),bw,bh,'#5a4a7a',()=>{ z.kpanel=0; },'kclose',8);
  if(G.msg) G.labels.push([G.msg.s,W/2,top+48,8,G.msg.col,'center',P.ink]); }
// касса открыта — время стоит, ввод джойстика не нужен
const _tuE=tripUpdate; tripUpdate=function(dt){ const z=TR.z; if(z&&z.kpanel&&!TR.done){ if(window.__botTick){ z.kpT=(z.kpT||0)+dt; if(z.kpT>.4){ const b=ZONES.gate.bot(z); } } input.events.length=0; return; } _tuE(dt); };
// страница «КОШЕЛЁК» (из меню и обучения)
let econOpen=false;
function drawEcon(){ G.labels.length=0; ctx.fillStyle='rgba(10,6,20,.82)'; ctx.fillRect(0,0,W,H); buttons.length=0; const T=SA.t+8, w=Math.min(W-40,440), x=Math.round(W/2-w/2);
  G.labels.push(['КОШЕЛЁК',W/2,T+10,14,'#ffd23f','center',P.ink]); walletStrip(W/2,T+24);
  const rows=[[icoToken,'Жетон — 5 мон.','1 проход. Медленный: турникет жуёт его секунду.'],[(a,b)=>icoCard(a,b,'#8fe03a'),'Проездной ×10 — 40 мон.','10 проходов, пикает быстро. Выгоднее жетонов.'],[(a,b)=>icoCard(a,b,'#2ed3c4'),'Безлимит — 25 мон.','Проходишь без счёта до полуночи.'],[icoDebt,'В долг — бесплатно','Если монет нет: жетон дадут, но потеряешь 15 секунд.'],[icoCoin,'Откуда монеты','Звёзды за поездку (до 3 × 3 мон.), находки в пути, соседка: +1 жетон и +10 мон. каждый день.']];
  const rh=Math.min(40,Math.floor((H-SA.b-T-110)/rows.length)); let y=T+56;
  for(const r of rows){ ctx.fillStyle='#fff8e8'; ctx.fillRect(x,y,w,rh-6); ctx.save(); ctx.translate(x+18,y+(rh-6)/2); ctx.scale(1.5,1.5); r[0](0,0); ctx.restore();
    const cy=y+(rh-6)/2; G.labels.push([r[1],x+36,cy,8,'#1a1020','left',null]); const dl=wrapW(r[2],w-200,7); dl.slice(0,2).forEach((s,j)=>G.labels.push([s,x+190,cy+(j-(dl.length>1?.5:0))*10,7,'#5a4a6a','left',null])); y+=rh; }
  bigBtn('ПОНЯТНО',Math.round(W/2-60),Math.min(H-SA.b-34,y+6),120,30,'#2aa860',()=>{ econOpen=false; SFX.ui(); },'econok',9); }
const _dtE=drawTitle; drawTitle=function(){ _dtE(); if(econOpen) drawEcon(); };
window.__econ={walletStrip,PRICE,open:()=>{econOpen=true;},isOpen:()=>econOpen};
