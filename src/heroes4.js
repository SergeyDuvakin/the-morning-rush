// M1-19: герои v4. HERO_STATS (SPD/SQZ/PUSH/TAP/NRV/SCN) + точечные хуки; адаптер спрайтов → атлас v4_heroes (трип и v3-катсцены).
// NPC-бабушка и «начальница» остаются на v3-спеке HERO_SPECS.baba — герои берут heroSpec(id).
const HERO4={ // имя, префикс атласа, цена (🪙), станция открытия (индекс), перк/минус для карточки
  serega:{n:'Серёга',pfx:'serega',job:'аналитик',perk:'эталон — без перков',minus:'без минусов',st:0,price:0},
  baba:{n:'Бабка Зинаида',pfx:'zina',job:'пенсионерка',perk:'«А МНЕ ВЫХОДИТЬ!»: втиснуться легче, толпа уступает',minus:'медленная',st:7,price:0},
  varya:{n:'Варя',pfx:'varya',job:'студентка',perk:'«Наушники»: нервы тратятся вдвое меньше',minus:'не слышит объявлений: двери видно за 2 с, а не за 3',st:4,price:60},
  rustam:{n:'Рустам',pfx:'rustam',job:'курьер «ПОКАТ»',perk:'«Ледокол»: быстрый, толчок дальше и сильнее',minus:'«Короб»: втиснуться труднее, турникет дольше',st:9,price:90},
  lena:{n:'Лена',pfx:'lena',job:'офис',perk:'«Кофе с собой»: рывок 6 с в начале поездки',minus:'«Каблуки»: лестница и мокрый пол медленнее, может облить',st:11,price:90},
  gena:{n:'Гена',pfx:'gena',job:'качок',perk:'«Плечи»: толкает сильнее, качка нипочём',minus:'«Скандалист»: скандал ×1.5, широкий в давке',st:13,price:120},
  kostya:{n:'Костя',pfx:'kostya',job:'айтишник',perk:'«Чуйка»: видит место за 3 с до того, как встанут',minus:'«Ноутбук»: толчок слабый, нервничает в давке',st:15,price:120},
  tima:{n:'Тимоха',pfx:'tima',job:'школьник',perk:'«Мелкий»: протискивается легко',minus:'толкаться почти не может; роняет сменку',st:-1,price:0,weekend:true} };
const STATS_BASE={SPD:72,SQZ:.35,PUSH:[24,16],TAP:.26,NRV:1,SCN:1,YIELD:0,doorHintLead:3,seatHintLead:0,stairsMul:1,startBoost:0,swayImmune:false,gateDelay:0,nrvDen:null,spill:0,shoeGag:false};
const HERO_STATS={
  serega:{}, baba:{SPD:60,TAP:.38,YIELD:.3}, varya:{SPD:76,NRV:.5,doorHintLead:2}, rustam:{SPD:84,PUSH:[27,17],TAP:.20,gateDelay:.6},
  lena:{SPD:70,startBoost:6,stairsMul:.85,spill:.25}, gena:{SPD:66,PUSH:[10,32],swayImmune:true,SCN:1.5,SQZ:.36}, kostya:{SPD:72,seatHintLead:3,PUSH:[20,12],nrvDen:[.6,1.2]},
  tima:{SPD:78,SQZ:.2,TAP:.34,PUSH:[22,8],shoeGag:true} };
for(const k in HERO_STATS) HERO_STATS[k]=Object.assign({},STATS_BASE,HERO_STATS[k]);
function heroStats(id){ return HERO_STATS[id||heroId]||HERO_STATS.serega; }
// ---------- спеки v4 и адаптер ----------
const HERO_SPECS4={}; for(const id of HERO_IDS4){ HERO_SPECS4[id]={id:'h4_'+id,v4:true,hid:id,pfx:HERO4[id].pfx,face:{seed:id.length*3+1},headR:7,bodyH:id==='tima'?8:11,legH:id==='tima'?7:9,hairStyle:'short',acc:[]}; }
function heroSpec(id){ return HERO_SPECS4[id]||HERO_SPECS4.serega; }
const V3FALL={serega:()=>HERO_SPECS.serega,baba:()=>HERO_SPECS.baba,rustam:()=>HERO_SPECS.rustam||HERO_SPECS.serega,varya:()=>HERO_SPECS.varya||HERO_SPECS.serega,gena:()=>HERO_SPECS.gena||HERO_SPECS.serega};
function v4Frame(spec,pose,fr,mood,t){ const P=spec.pfx, blink=(t*7+spec.face.seed*13)%37<1;
  const emo=mood==='angry'?'angry':mood==='hurt'||mood==='o'?'surprised':mood==='ko'?'sleepy':mood==='happy'?'happy':null;
  switch(pose){
    case 'walk': return P+'_walk_'+(Math.floor(fr/2)%4);
    case 'run': case 'dash': case 'jump': return P+'_run_'+(pose==='jump'?1:pose==='dash'?2:Math.floor(fr/2)%4);
    case 'p1': case 'p2': case 'p3': case 'atk': case 'kick': case 'spin': case 'grab': return P+'_push_'+(pose==='p1'||pose==='grab'?(fr?1:0):1);
    case 'squeeze': return P+'_squeeze_'+(fr%2);
    case 'cheer': case 'super': return P+'_cheer_'+((fr%4)<2?0:1);
    case 'sit': case 'sleep': return P+'_sit_0';
    case 'hurt': return P+'_surprised';
    case 'down': case 'slide': return P+'_sleepy';
    default: if(emo) return P+'_'+emo; return P+'_idle_'+(blink?2:(fr%6)<3?0:1); } }
{ const _ps=personSprite; personSprite=function(spec,poseName,fr,mood,t){ if(!spec||!spec.v4) return _ps(spec,poseName,fr,mood,t);
  if(!atlOk('heroes')){ const f=V3FALL[spec.hid]; return _ps(f?f():HERO_SPECS.serega,['run','squeeze'].includes(poseName)?(poseName==='run'?'walk':'p1'):poseName,fr,mood,t); }
  const name=v4Frame(spec,poseName,fr,mood,t), key=spec.id+'|'+name+'|'+(poseName==='down'||poseName==='slide'?'flat':''); let c=SPRC.get(key); if(c) return c;
  const [cc,x]=mkc(64,64); const r=ATL4.heroes.f[name]||ATL4.heroes.f[spec.pfx+'_idle_0'];
  if(poseName==='down'||poseName==='slide'){ x.save(); x.translate(32,60); x.rotate(-Math.PI/2); x.drawImage(ATL4.heroes.img,r[0],r[1],r[2],r[3],2,-23,r[2],r[3]); x.restore(); }
  else x.drawImage(ATL4.heroes.img,r[0],r[1],r[2],r[3],16,16,r[2],r[3]); SPRC.set(key,cc); return cc; }; }
// портрет 24×24 (голова из idle_0)
const PORT4={}; function heroPortrait(id){ if(PORT4[id]) return PORT4[id]; if(!atlOk('heroes')) return null; const r=ATL4.heroes.f[HERO4[id].pfx+'_idle_0']; const [cc,x]=mkc(24,24);
  const top={tima:11,varya:3,kostya:5,gena:7}[id]||6; x.drawImage(ATL4.heroes.img,r[0]+4,r[1]+Math.max(0,top),24,24,0,0,24,24); return PORT4[id]=cc; }
// бег и протиск — кадры v4 у героя
{ const _da=drawActor; drawActor=function(a,ex){ const s=a.spec; if(s&&s.v4&&!a.poseOv&&G.scene==='trip'){ const fr=Math.floor(a.anT*10); let ov=null;
    if(a.st==='walk'){ const sp=Math.hypot(a.vx||0,a.vy||0); if(a.den>2.4&&sp>4) ov=['squeeze',Math.floor(a.anT*6)%2]; else if(sp>64||TR.boost>0) ov=['run',fr%8]; }
    if(a===G.hero&&TR.z&&TR.z.sqT>0) ov=['squeeze',Math.floor(G.t*8)%2];
    if(ov){ a.poseOv=ov; try{ return _da(a,ex); } finally{ a.poseOv=null; } } }
  return _da(a,ex); }; }
// HEROES (бой v3 и имена) для всех 8
for(const id of HERO_IDS4){ const old=HEROES[id]||HEROES.serega; HEROES[id]=Object.assign({},old,{name:HERO4[id].n,spec:()=>heroSpec(id),spd:HERO_STATS[id].SPD}); }
// ---------- нервы: множитель потерь (NRV, Костя в давке ×1.2), «кофе» Лены — 15 нервов щитом ----------
{ let nv=100; Object.defineProperty(TR,'nerves',{configurable:true,enumerable:true,get(){ return nv; },set(v){ let d=v-nv; if(d<0&&G.scene==='trip'){ const S=heroStats(); d*=S.NRV; if(S.nrvDen&&G.hero&&(G.hero.den||0)/5>S.nrvDen[0]) d*=S.nrvDen[1];
  if(TR.nervShield>0){ const a=Math.min(TR.nervShield,-d); TR.nervShield-=a; d+=a; } } nv=Math.max(0,Math.min(100,nv+d)); }}); }
// ---------- хуки ----------
function heroOnShove(n,h){ const S=heroStats(); if(!n) return; if(S.spill&&Math.random()<S.spill){ TR.scandal+=8*S.SCN; tev('spill'); pop('ОБЛИЛА!',h.x,h.y-50,'#c88a4a',8); }
  heroVoice(heroId,heroId==='gena'?'Ыы':pick(['Подвинься','Пропустите','Извините','Можно?'])); }
function heroTripStart(){ const S=heroStats(); TR.nervShield=0; if(S.startBoost&&TR.mode==='trip'){ TR.boost=S.startBoost; TR.nervShield=15; tev('start_boost'); setTimeout(()=>{ if(G.scene==='trip'&&G.hero) pop('КОФЕ С СОБОЙ!',G.hero.x,G.hero.y-52,'#ffb84a',8); },300); } TR.drops=[]; }
{ const _st=startTrip; startTrip=function(idx,opts){ const r=_st(idx,opts); heroTripStart(); return r; }; window.__trip.startTrip=startTrip; }
// Тимоха: на бегу иногда роняет сменку (1 с, без штрафа)
{ const _tu=tripUpdate; tripUpdate=function(dt){ _tu(dt); const S=heroStats(), h=G.hero; if(!h||TR.done||paused) return; if(TR.z&&TR.z.sqT>0) TR.z.sqT-=dt;
  if(S.shoeGag&&Math.hypot(h.vx||0,h.vy||0)>60&&Math.random()<dt/14){ TR.drops.push({x:h.x-h.face*8,y:h.y,t:1}); tev('shoe_drop'); pop('СМЕНКА!',h.x,h.y-46,'#9cf',7); }
  for(const d of TR.drops||[]) d.t-=dt; if(TR.drops) TR.drops=TR.drops.filter(d=>d.t>0); }; }
function drawDrops(){ for(const d of TR.drops||[]){ const sx=Math.round(d.x-G.cam), sy=Math.round(d.y); ctx.fillStyle=P.ink; ctx.fillRect(sx-4,sy-6,8,6); ctx.fillStyle='#e8e0d0'; ctx.fillRect(sx-3,sy-5,6,4); ctx.fillStyle='#3d6ff0'; ctx.fillRect(sx-1,sy-7,2,2); } }
{ const _dta=drawTripActors; drawTripActors=function(list){ if(TR.drops&&TR.drops.length) drawDrops(); return _dta(list); }; }
// Костя: подсказка места до остановки (заранее выбираем, кто встанет)
{ const C=ZONES.car, u0=C.update; C.update=function(z,dt){ const S=heroStats(); if(S.seatHintLead>0&&!z.arrive&&z.si<z.stopAt.length&&z.T>=z.stopAt[z.si]-S.seatHintLead&&!z.pre){
    const occ=z.slots.filter(s=>s.occ&&s.occ!=='hero'); const n=Math.min(occ.length,ri(1,2)); z.pre=[]; while(z.pre.length<n){ const s=pick(occ); if(!z.pre.includes(s)) z.pre.push(s); } if(z.pre.length) tev('seat_hint'); }
  return u0.call(this,z,dt); }; }
// M6: короткий поезд — фирменное поведение у двери (только z.short, только трип): Гена идёт плечом (толпа меньше тормозит, «ВОЙТИ» давит сильнее), у Тимохи рывок срезан, пока двери открыты/закрываются, и в забитую дверь его выдавливают.
const SHORT_DOOR6={gena:{SQZ:.22,TAP:.6,SPD:74,TAPSC:14,TAPW:'ПЛЕЧОМ!'},tima:{SPD:66,TAP:.22}};
{ const _hs=heroStats; heroStats=function(id){ const s=_hs(id); if(id) return s; const z=typeof TR!=='undefined'&&TR&&TR.z; const m=z&&z.k==='plat'&&z.short&&!z.boarded&&SHORT_DOOR6[heroId]; if(!m) return s; const o=Object.assign({},s,m); if(heroId==='tima'&&!(z.ph==='open'||z.ph==='closing')) o.SPD=s.SPD; return o; }; }
{ const _pu=ZONES.plat.update; ZONES.plat.update=function(z,dt){ _pu.call(this,z,dt); const h=G.hero; if(z.short&&!z.boarded&&heroId==='gena'&&(z.ph==='open'||z.ph==='closing')&&h.den>1&&Math.hypot(h.vx||0,h.vy||0)>10){ TR.scandal+=GENA_SHOULDER6*h.den*dt; if(!z.shSaid){ z.shSaid=1; const e=z.npcs.find(n=>!n.inside&&Math.abs(n.x-h.x)<40); if(e) bubble(e,'Э, плечо убери!',1.2,P.red); } } }; } /* M6: Гена идёт плечом — толпа злится (скандалы как у Серёги) */
var GENA_SHOULDER6=1;
