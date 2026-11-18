/* ---- v0.57 : collisions drag, swipe paquets ---- */
const _tick33=tick;
tick=function(dt){
  _tick33.apply(this,arguments);
  try{ const D=RC&&RC.dbon; if(!D||RC.kind!=='race'||RC.clock<0||RC.done) return; const P=RC.P; RC.cbT=(RC.cbT||0)-dt;
    RC.Os.forEach(o=>{ if(o.fin!=null||P.fin!=null) return; const dl=Math.abs(P.lane-o.lane); if(dl>1.7) return; const g=o.x-P.x;
      if(g>0&&g<4.4){ if(P.v>o.v*.97){ P.v=o.v*.95; P.x=Math.min(P.x,o.x-4.4); if(RC.cbT<=0){ RC.cbT=.9; flash('Collision ! change de voie','#FF4D6D',.9); try{navigator.vibrate&&navigator.vibrate([40,30,40]);}catch(e){} } } }
      else if(g<0&&g>-4.4){ if(o.v>P.v*.97){ o.v=P.v*.95; o.x=Math.min(o.x,P.x-4.4); } } });
  }catch(e){ console.error(e); }
};
let SW=null;
document.addEventListener('pointerdown',e=>{ const st=e.target.closest&&e.target.closest('.ostage'); SW=st&&sheet&&sheet.t==='open'?{x:e.clientX,y:e.clientY,t:Date.now()}:null; },true);
document.addEventListener('pointerup',e=>{ if(!SW) return; const dx=e.clientX-SW.x, dy=e.clientY-SW.y, s=SW; SW=null;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3&&Date.now()-s.t<900){ window.__swT=Date.now(); const st=document.querySelector('.ostage'); if(st){ st.style.transition='transform .18s,opacity .18s'; st.style.transform='translateX('+(dx<0?-60:60)+'px)'; st.style.opacity='.2'; } ACT.reveal(); } },true);
document.addEventListener('click',e=>{ if(window.__swT&&Date.now()-window.__swT<400&&e.target.closest&&e.target.closest('.ostage')){ e.stopPropagation(); e.preventDefault(); } },true);
