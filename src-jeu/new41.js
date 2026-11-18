/* ---- v0.64c : swipe gauche/droite entre fiches véhicule, avec animation ---- */
(function(){ let st=null;
  const sh=()=>document.getElementById('sheet');
  document.addEventListener('touchstart',e=>{ st=null; if(!sheet||sheet.t!=='car'||S.cars.length<2) return; const el=sh(); if(!el||!el.contains(e.target)||e.target.closest('canvas,input,select,textarea,.chips')) return; const t=e.touches[0]; st={x:t.clientX,y:t.clientY,t:Date.now()}; },{passive:true});
  document.addEventListener('touchend',e=>{ if(!st) return; const t=e.changedTouches[0], dx=t.clientX-st.x, dy=t.clientY-st.y, s0=st; st=null;
    if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5||Date.now()-s0.t>900) return; swipeCar(dx<0?1:-1); },{passive:true});
  window.swipeCar=function(dir){ const el=sh(); if(!el||!sheet||sheet.t!=='car') return;
    el.style.transition='transform .14s ease-in,opacity .14s'; el.style.transform='translateX('+(-dir*60)+'px)'; el.style.opacity='0';
    setTimeout(()=>{ carNav(dir); const e2=sh(); if(!e2) return; e2.style.transition='none'; e2.style.transform='translateX('+(dir*60)+'px)'; e2.style.opacity='0'; void e2.offsetWidth; e2.style.transition='transform .2s ease-out,opacity .2s'; e2.style.transform=''; e2.style.opacity=''; setTimeout(()=>{ e2.style.transition=''; },240); },140); };
})();
