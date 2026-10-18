// M1-8: схема сейва v2 поверх core.js (core принимает только v===1 — поэтому save.v остаётся 1, схема — save.sv=2).
// Идемпотентно: migrate4(migrate4(s)) ≡ migrate4(s). mute → все громкости 0. unlockedBaba → герой baba. Мусорный save.hero → serega.
const HERO_IDS4=['serega','baba','varya','rustam','lena','gena','kostya','tima'];
const VOL_DEF={music:60,voice:80,sfx:80};
function migrate4(s){ if(!s||typeof s!=='object') s={v:1};
  if(s.v!==1) s.v=1;
  const obj=(k,d)=>{ if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k])) s[k]=d; return s[k]; };
  if(s.sv!==2){ // первый проход: громкость из старого mute
    s.vol=s.mute?{music:0,voice:0,sfx:0}:Object.assign({},VOL_DEF,s.vol&&typeof s.vol==='object'?s.vol:{}); }
  const v=obj('vol',Object.assign({},VOL_DEF)); for(const k in VOL_DEF){ const x=+v[k]; v[k]=Number.isFinite(x)?Math.max(0,Math.min(100,Math.round(x))):VOL_DEF[k]; }
  if(s.day!==null&&(typeof s.day!=='object'||Array.isArray(s.day)||typeof (s.day||{}).seed!=='number')) s.day=null; if(s.day===undefined) s.day=null;
  obj('route',{pref:null}); if(!('pref' in s.route)) s.route.pref=null;
  s.mcdValidated=!!s.mcdValidated;
  if(!Array.isArray(s.unlocks4)) s.unlocks4=[]; s.unlocks4=[...new Set(s.unlocks4.filter(x=>typeof x==='string'))];
  if(s.segSave&&(typeof s.segSave!=='object'||typeof s.segSave.idx!=='number')) s.segSave=null; if(s.segSave===undefined) s.segSave=null;
  const cs=obj('cosmetics',{owned:[],on:{}}); if(!Array.isArray(cs.owned)) cs.owned=[]; if(!cs.on||typeof cs.on!=='object') cs.on={};
  const st=obj('streak',{n:0,best:0}); st.n=Math.max(0,st.n|0); st.best=Math.max(st.best|0,st.n);
  s.dayN=Math.max(0,s.dayN|0); s.calm=!!s.calm; s.weekendDone=!!s.weekendDone; obj('evLast',{}); if(!Array.isArray(s.newEvDays)) s.newEvDays=[];
  // герои (§Q5)
  const h=obj('heroes',{owned:['serega'],seen:[]}); if(!Array.isArray(h.owned)) h.owned=['serega']; if(!Array.isArray(h.seen)) h.seen=[];
  h.owned=[...new Set(['serega',...h.owned.filter(x=>HERO_IDS4.includes(x))])]; h.seen=[...new Set(h.seen.filter(x=>HERO_IDS4.includes(x)))];
  if(s.unlockedBaba&&!h.owned.includes('baba')) h.owned.push('baba');
  if(s.weekendDone&&!h.owned.includes('tima')) h.owned.push('tima');
  if(!HERO_IDS4.includes(s.hero)||!h.owned.includes(s.hero)) s.hero='serega';
  s.sv=2; return s; }
// мерж облака (§Q5): owned — объединение, монеты кошелька — максимум
function mergeCloud4(a,b){ a=migrate4(a); if(!b||typeof b!=='object') return a; b=migrate4(JSON.parse(JSON.stringify(b)));
  a.heroes.owned=[...new Set([...a.heroes.owned,...b.heroes.owned])]; a.heroes.seen=[...new Set([...a.heroes.seen,...b.heroes.seen])];
  if(a.wallet||b.wallet){ a.wallet=a.wallet||{}; a.wallet.coins=Math.max(a.wallet.coins|0,(b.wallet&&b.wallet.coins)|0); }
  if(b.weekendDone) a.weekendDone=true; a.unlocks4=[...new Set([...a.unlocks4,...b.unlocks4])]; if((b.streak.best|0)>a.streak.best) a.streak.best=b.streak.best;
  return migrate4(a); }
const LOCAL_OWNED4=(()=>{ try{ return migrate4(JSON.parse(JSON.stringify(save))).heroes.owned.slice(); }catch(e){ return ['serega']; } })();
function heroesFix(){ migrate4(save); for(const x of LOCAL_OWNED4) if(!save.heroes.owned.includes(x)) save.heroes.owned.push(x); return save.heroes; }
{ const before=JSON.stringify(save); migrate4(save); if(JSON.stringify(save)!==before) store(); }
try{ if(inTG&&tgv('6.9')) tg.CloudStorage.getItem(SAVE_KEY,(err,v)=>{ setTimeout(()=>{ try{ const c=JSON.parse(v||'null'); if(c&&c.v===1){ mergeCloud4(save,c); heroesFix(); store(); } }catch(e){} },0); }); }catch(e){}
