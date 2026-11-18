/* ---- v0.63b : affichage de la collection 1 / 3 / 5 colonnes ---- */
const gCols=()=>(S&&S.gcols)||0;
const _gGrid39=gGrid;
gGrid=function(){ const n=gCols(); if(n<3) return _gGrid39(); const l=gFiltered(); return l.length?l.map(c=>cardHTML(c,{cls:'cmini',attr:'data-a="car" data-id="'+c.uid+'"'})).join(''):'<p class="note" style="grid-column:1/-1">Aucune voiture ne correspond. Modifie ou efface les filtres.</p>'; };
const _gBar39=gBar;
gBar=function(){ let h=_gBar39(); const n=gCols(); const b='<div class="gview" role="group" aria-label="Affichage">'+[[0,'▭','Auto'],[1,'▬','1 par ligne'],[3,'▦','3 colonnes'],[5,'▩','5 colonnes']].map(([v,i,t])=>'<button data-a="gcols" data-id="'+v+'" class="'+(n===v?'on':'')+'" title="'+t+'" aria-label="'+t+'">'+i+(v?'<small>'+v+'</small>':'')+'</button>').join('')+'</div>';
  return h.replace('<div class="gcount">',b+'<div class="gcount">'); };
ACT.gcols=d=>{ S.gcols=+d.id; try{ save(); }catch(e){} render(); };
function decor39(){ try{ const g=document.getElementById('ggrid'); if(!g) return; const n=gCols(); g.style.gridTemplateColumns=n?'repeat('+n+',minmax(0,1fr))':''; g.className='grid'+(n?' gc'+n:''); }catch(e){} }
const _rd39=render; render=function(){ const r=_rd39.apply(this,arguments); decor39(); return r; };
