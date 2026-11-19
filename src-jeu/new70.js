/* ===== v2.7 : le défilement du labo ne saute plus après un clic ; la fiche d'une plante n'a plus l'en-tête du labo ===== */
/* Cause du saut : la fiche était réécrite puis complétée par plusieurs couches (barre de niveau, boutons de floraison, minuteries…).
   Le défilement était remis avant ces ajouts, et l'ancrage automatique du navigateur le déplaçait. On remet maintenant la position
   une fois tout dessiné, sans ancrage ; un changement d'onglet / de boutique / de plante repart en haut. */
{ let K=''; const _rs=renderSheet;
  renderSheet=function(){ const el=document.getElementById('sheet'), isR=!!(sheet&&sheet.t==='ranch'), sc=el?el.scrollTop:0, key=isR?[RY.tab,RY.slot,RY.shop].join('|'):'';
    const r=_rs.apply(this,arguments);
    try{ const e2=document.getElementById('sheet'); if(e2){
      if(isR){ const to=key===K?sc:0; K=key; e2.style.overflowAnchor='none'; e2.classList.toggle('plantv',RY.slot!=null&&(RY.tab==='atelier'||RY.tab==='ranch'));
        e2.scrollTop=to; requestAnimationFrame(()=>{ try{ if(sheet&&sheet.t==='ranch'&&Math.abs(e2.scrollTop-to)>2&&!e2.matches(':active')) e2.scrollTop=to; }catch(_){} }); }
      else{ K=''; e2.classList.remove('plantv'); e2.style.overflowAnchor=''; } } }catch(e){ console.warn('scroll70',e); }
    return r; }; }
