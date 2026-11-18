/* ===== v0.56 : doublons caméra, capot cockpit, voie en accélérant, intro dans les réglages ===== */
setInterval(()=>{ try{ const l=document.querySelectorAll('#bCam'); for(let i=1;i<l.length;i++) l[i].remove(); }catch(e){} },400);
ptWheel=function(on){
  const el=$('rslot'); if(!el||!el.parentNode) return; const w=el.parentNode; let d=w.querySelector('#ptwh');
  if(!on){ if(d) d.remove(); return; }
  if(d) return;
  const m=(RC&&RC.P&&(RC.P.m||(RC.P.r&&RC.P.r.m)))||{}, c=m.col||'#555';
  d=document.createElement('div'); d.id='ptwh';
  d.innerHTML=`<svg viewBox="0 0 100 12" preserveAspectRatio="none"><defs><linearGradient id="hdg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="#05060a"/></linearGradient></defs><path d="M0 12V8.6Q50 3.2 100 8.6V12Z" fill="url(#hdg)"/><path d="M0 8.6Q50 3.2 100 8.6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".4"/></svg>`;
  w.appendChild(d);
};
/* changer de voie en gardant le doigt sur l'accélérateur : on réagit au toucher (pas au clic, que le multi-touch supprime) */
document.addEventListener('pointerdown',e=>{
  const b=e.target&&e.target.closest&&e.target.closest('#laneBtn,#mkIt'); if(!b) return;
  e.preventDefault(); b.dataset.pd=String(Date.now());
  try{ if(b.id==='laneBtn') ACT.lane(); else ACT.mkuse(); }catch(_){}
},true);
document.addEventListener('click',e=>{
  const b=e.target&&e.target.closest&&e.target.closest('#laneBtn,#mkIt'); if(b&&Date.now()-(+b.dataset.pd||0)<900){ e.stopPropagation(); e.preventDefault(); }
},true);
