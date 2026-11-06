// ================= R415 (v4.1.5): soft PassFloor — без плотной упаковки headon =================
// 4.1.4 r414PassFloor каждый кадр загонял всех NPC в ny0..ny1 → denser corridor → days_m3 wd_passage.
// Здесь только правка тех, кто вне пола (±10) или в solid. r414.js shipped без изменений.
'use strict';
const R415={ver:'4.1.5'};
if(typeof FB6!=='undefined') FB6.ver=R415.ver;
if(typeof R41!=='undefined') R41.ver=R415.ver;
// module identities
if(typeof R411!=='undefined') R411.ver='4.1.1';
if(typeof R412!=='undefined') R412.ver='4.1.2';
if(typeof R413!=='undefined') R413.ver='4.1.3';
if(typeof R414!=='undefined') R414.ver='4.1.4';

function r414PassFloor(z){
  if(!z||z.k!=='passage'||z.y0==null||z.y1==null) return;
  // Только NPC (не hero). Не пакуем всех в ny каждый кадр.
  const headon=z.flow==='headon'&&z.ny0!=null&&z.ny1!=null&&z.hx0!=null;
  const inSolid=e=>{ for(const s of (z.solids||[])){ if(e.x>s[0]+2&&e.x<s[2]-2&&e.y>s[1]+1&&e.y<s[3]-1) return true; } return false; };
  for(const e of (z.npcs||[])){
    if(!e||e.ghost||e.seat||e.hide||(e.z>0)) continue;
    const off=e.y<z.y0-10||e.y>z.y1+10;
    if(!off&&!inSolid(e)) continue;
    let lo=z.y0, hi=z.y1;
    if(headon&&e.x>z.hx0){ lo=z.ny0; hi=z.ny1; }
    if(e.y<lo) e.y=lo; else if(e.y>hi) e.y=hi;
    if(inSolid(e)&&headon&&e.x>z.hx0) e.y=(z.ny0+z.ny1)*.5;
    if(e.hy!=null) e.hy=e.y;
  }
}
try{ if(window.__r414) __r414.passFloor=r414PassFloor; }catch(e){}
window.__r415={ver:R415.ver, passFloor:r414PassFloor};
