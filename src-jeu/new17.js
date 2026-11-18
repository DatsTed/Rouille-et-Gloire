/* ===== v0.30 : ouverture de paquet plein écran, tracé au doigt (style TCG) ===== */
let OV=null;
function pkArt(p){ const th=PKT[p.id]||PKT.p1, pips=[0,1,2].map(k=>RAR[Math.min(6,p.min+k)]).map(r=>`<i style="background:${r.c}"></i>`).join('');
  return `<div class="crimp t"></div><div class="crimp b"></div><div class="ct"><span class="tag">${th.tag}</span><span class="emb">${th.emb}</span><div><div class="nm">${p.nom.replace('Paquet ','')}</div><div class="sb">${p.n} modules</div></div><span class="pips">${pips}</span></div>`; }
function pkOverlay(id,k){
  const p=PACKS.find(x=>x.id===id); if(!p||OV) return; const th=PKT[p.id]||PKT.p1;
  const d=document.createElement('div'); d.id='pkov';
  d.innerHTML=`<button class="pkx" aria-label="Annuler">×</button><div class="pkov-t">${p.nom}</div>
   <div class="pkst"><div class="pk big" style="--c1:${th.c1};--c2:${th.c2};--c3:${th.c3}"><div class="lay fr bp-body">${pkArt(p)}</div><div class="lay fr bp-top">${pkArt(p)}</div>
     <svg class="bp-trace" viewBox="0 0 100 100" preserveAspectRatio="none"><path class="tr0" d="M6 17 L94 17" pathLength="100"/><path class="tr1" d="M6 17 L94 17" pathLength="100"/></svg><div class="bp-h"></div><div class="bp-sp"></div></div><div class="bp-light"></div></div>
   <div class="pkov-h">Suis la ligne lumineuse du doigt <b>→</b></div><button class="pkov-s">Ouvrir sans déchirer</button>`;
  document.body.appendChild(d); requestAnimationFrame(()=>d.classList.add('on'));
  const pk=d.querySelector('.pk.big'), st=d.querySelector('.pkst'), h=d.querySelector('.bp-h'), sp=d.querySelector('.bp-sp'), tr1=d.querySelector('.tr1'), top=d.querySelector('.bp-top'), body=d.querySelector('.bp-body');
  OV={id,k,prog:0,dp:0,act:false,done:false,fx:0,fy:0,raf:0};
  const close=()=>{ if(!OV) return; cancelAnimationFrame(OV.raf); const e=d; e.classList.remove('on'); setTimeout(()=>e.remove(),260); OV=null; PK.arm=null; };
  const finish=(skip)=>{ if(!OV||OV.done) return; OV.done=true; OV.prog=OV.dp=1; auTry(()=>auRip(PACKS.findIndex(x=>x.id===id))); try{ navigator.vibrate&&navigator.vibrate([12,30,18]); }catch(_){}
    d.classList.add('torn'); const a=OV; setTimeout(()=>{ d.classList.add('fade'); },520); setTimeout(()=>{ cancelAnimationFrame(a.raf); d.remove(); OV=null; PK.arm=null; openPack(a.id,a.k); },820); };
  const lineY=()=>{ const r=pk.getBoundingClientRect(); return {top:r.top+r.height*.17,left:r.left,w:r.width,h:r.height}; };
  const tick=()=>{ if(!OV) return; const o=OV; if(!o.done){ if(!o.act) o.prog=Math.max(0,o.prog-.05); o.dp+=(o.prog-o.dp)*.4; if(Math.abs(o.prog-o.dp)<.001) o.dp=o.prog; }
    const q=o.dp; tr1.style.strokeDashoffset=String(100-q*88/88*100*.88+0); tr1.style.strokeDasharray='100'; tr1.style.strokeDashoffset=String(100-q*100);
    h.style.left=(6+q*88)+'%'; h.style.opacity=o.done?0:1;
    if(!o.done){ pk.style.transform=`rotateZ(${(q*1.6).toFixed(2)}deg) translateY(${(-q*6).toFixed(1)}px) scale(${(1+q*.03).toFixed(3)})`; top.style.transform=`rotate(${(q*3).toFixed(2)}deg) translateY(${(-q*5).toFixed(1)}px)`; top.style.transformOrigin='100% 100%'; }
    o.raf=requestAnimationFrame(tick); };
  OV.raf=requestAnimationFrame(tick);
  const pos=e=>{ const L=lineY(), x=(e.clientX-L.left)/L.w, dy=Math.abs(e.clientY-L.top); return {x,dy,L}; };
  st.addEventListener('pointerdown',e=>{ if(!OV||OV.done) return; const q=pos(e); if(q.dy>80) return; OV.act=true; OV.prog=Math.max(OV.prog,0); try{ st.setPointerCapture(e.pointerId); }catch(_){} try{ navigator.vibrate&&navigator.vibrate(6); }catch(_){} });
  st.addEventListener('pointermove',e=>{ if(!OV||!OV.act||OV.done) return; const q=pos(e); sp.style.opacity=1; sp.style.left=(e.clientX-q.L.left)+'px'; sp.style.top=(e.clientY-q.L.top+q.L.h*.17)+'px';
    if(q.dy<110){ const x=clamp((q.x-.06)/.88,0,1); if(x>OV.prog-.04) OV.prog=Math.max(OV.prog,Math.min(x,OV.prog+.3)); if(OV.prog>=.9) finish(); } });
  const up=()=>{ if(!OV) return; OV.act=false; sp.style.opacity=0; };
  st.addEventListener('pointerup',up); st.addEventListener('pointercancel',up);
  d.querySelector('.pkx').onclick=close; d.querySelector('.pkov-s').onclick=()=>finish(true);
  d.addEventListener('pointerdown',e=>{ if(e.target===d) close(); });
}
ACT.pack=function(dd){ const pk=PACKS.find(p=>p.id===dd.id); if(!pk) return; const ok=(dd.k==='tok'?S.tok>=pk.tok:S.cr>=pk.cr);
  if(!ok) return toast('Pas assez pour ce paquet'); if(S.mods.length+pk.n>invMax()) return toast('Inventaire plein : recycle ou fusionne des modules');
  if(sheet) closeSheet(); pkOverlay(dd.id,dd.k); };
