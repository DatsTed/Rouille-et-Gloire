/* ---- v0.58b : podiums plus simples ---- */
const podOpen=i=>S.lvl>=POD_LVL[i];
const podVal=c=>M[c.mid].t*(.5+.5*c.etat/100)*(1+(st(c).sp.inc||0))*(c.sh?1.5:1);
Object.assign(ACT,{
  podcar(){ if(!sheet||sheet.t!=='car') return; const u=sheet.uid, c=car(u); if(!c) return; const at=S.pod.slots.indexOf(u);
    if(at>=0){ S.pod.slots[at]=null; toast('Retirée du podium'); }
    else{ let i=S.pod.slots.findIndex((x,k)=>podOpen(k)&&!x);
      if(i<0){ let w=-1,wv=1e9; S.pod.slots.forEach((x,k)=>{ if(!podOpen(k)) return; const cc=x&&car(x); const v=cc?podVal(cc):0; if(v<wv){wv=v;w=k;} }); i=w; }
      if(i<0) return toast('Aucun podium ouvert');
      S.pod.slots[i]=u; toast('Placée sur le podium '+(i+1)); }
    save(); render(); renderSheet(); },
  podauto(){ const open=POD_LVL.map((l,i)=>podOpen(i)?i:-1).filter(i=>i>=0); const best=S.cars.slice().sort((a,b)=>podVal(b)-podVal(a)).slice(0,open.length);
    S.pod.slots=S.pod.slots.map(()=>null); best.forEach((c,k)=>{ S.pod.slots[open[k]]=c.uid; }); toast(best.length+' voiture'+(best.length>1?'s':'')+' placée'+(best.length>1?'s':'')+' sur tes podiums'); save(); render(); }
});
const _rs34=renderSheet;
renderSheet=function(){ const r=_rs34.apply(this,arguments);
  try{ if(sheet&&sheet.t==='car'){ const c=car(sheet.uid), h=document.querySelector('#sheet .thhero'); if(c&&h&&!document.getElementById('podBtn')){ const on=S.pod.slots.includes(c.uid); h.insertAdjacentHTML('afterend','<button id="podBtn" class="btn wide" style="margin-top:8px" data-a="podcar">'+(on?'🏛️ Retirer du podium':'🏛️ Placer sur un podium')+'</button>'); } } }catch(e){}
  return r; };
const _rd34=render;
render=function(){ const r=_rd34.apply(this,arguments);
  try{ const b=document.getElementById('pCollect'); if(b&&!document.getElementById('podAuto')){ const row=b.closest('.row'); if(row) row.insertAdjacentHTML('afterend','<div class="row" id="podAuto"><span class="ico">⭐</span><span class="grow"><span class="ttl">Placement auto</span><br><span class="sub">Place tes meilleures voitures sur les podiums ouverts.</span></span><button class="btn sm" data-a="podauto">Meilleures</button></div><div class="rchips" id="podChips">'+POD_LVL.map((l,i)=>{const u=S.pod.slots[i], c=u&&podOpen(i)&&car(u); return '<button data-a="slot3" data-id="'+i+'" class="'+(c?'on':'')+'">'+(podOpen(i)?'🏛️ '+(i+1)+(c?' · '+M[c.mid].nom:' · libre'):'🔒 niv. '+l)+'</button>';}).join('')+'</div>'); } }catch(e){}
  return r; };
/* sélection 3D plus tolérante : podium le plus proche du doigt à l'écran */
garagePick=function(e,c){
  const r=c.getBoundingClientRect(); const nx=(e.clientX-r.left)/r.width*2-1, ny=-((e.clientY-r.top)/r.height*2-1);
  GG.ray.setFromCamera({x:nx,y:ny},GG.cam); const h=GG.ray.intersectObjects(GG.hit,false);
  if(h.length){ openSheet({t:'slot',i:h[0].object.userData.slot}); return; }
  let bi=-1,bd=.28; GG.hit.forEach(m=>{ const v=new THREE.Vector3(); m.getWorldPosition(v); v.y=1; v.project(GG.cam); const d=Math.hypot((v.x-nx)*r.width/r.height*.6,v.y-ny); if(d<bd){bd=d;bi=m.userData.slot;} });
  if(bi>=0) openSheet({t:'slot',i:bi});
};
