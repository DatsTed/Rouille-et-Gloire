/* ---- v0.64b : vues x1/x3 (garage), x1/x3/x5 (modules), boutiques aléatoire / ciblée ---- */
gBar=function(){ let h=_gBar39(); const n=gCols()>=3?3:1;
  const b='<div class="gview" role="group" aria-label="Affichage">'+[1,3].map(v=>'<button data-a="gcols" data-id="'+v+'" class="'+(n===v?'on':'')+'" aria-label="'+v+' par ligne">'+(v===1?'▬':'▦')+' x'+v+'</button>').join('')+'</div>';
  return h.replace('<div class="gcount">',b+'<div class="gcount">'); };
const _gGrid40=gGrid; gGrid=function(){ if(gCols()>=3) return _gGrid40(); const l=gFiltered(); return _gGrid39.apply(this,arguments); };
function decor39(){ try{ const g=document.getElementById('ggrid'); if(g){ const n=gCols()>=3?3:1; g.style.gridTemplateColumns='repeat('+n+',minmax(0,1fr))'; g.className='grid gc'+n; }
  const m=document.querySelector('#view .mods:not(.open)'); if(m&&cTab==='inv'){ const k=S.mcols||1; m.style.gridTemplateColumns='repeat('+k+',minmax(0,1fr))'; m.classList.remove('mc1','mc3','mc5'); m.classList.add('mc'+k); } }catch(e){} }
/* modules : sélecteur x1 / x3 / x5 */
ACT.mcols=d=>{ S.mcols=+d.id; try{ save(); }catch(e){} render(); };
const _vC40=vCartes; vCartes=function(){ let h=_vC40.apply(this,arguments);
  if(cTab==='inv'){ const k=S.mcols||1; const b='<div class="gview" role="group" aria-label="Affichage des modules">'+[1,3,5].map(v=>'<button data-a="mcols" data-id="'+v+'" class="'+(k===v?'on':'')+'">'+(v===1?'▬':v===3?'▦':'▩')+' x'+v+'</button>').join('')+'</div>';
    h=h.replace('<div class="mods">',b+'<div class="mods">'); }
  return h; };
/* boutiques : aléatoire en haut (carrousel), ciblée en dessous */
const FPACKS=PACKS.filter(p=>p.slots); FPACKS.forEach(p=>{ const i=PACKS.indexOf(p); if(i>=0) PACKS.splice(i,1); });
['find','findIndex'].forEach(fn=>{ PACKS[fn]=function(f){ const r=Array.prototype[fn].call(this,f); if(fn==='find') return r||FPACKS.find(f); return r; }; });
const _pk40=packsHTML; packsHTML=function(){ const rows=FPACKS.map(p=>{ const t=PKT[p.id]||{}; const okC=S.cr>=p.cr, okT=S.tok>=p.tok;
  return '<div class="fpk" style="--c1:'+t.c1+';--c2:'+t.c2+'"><span class="fe">'+(t.emb||'🎯')+'</span><span class="fi"><b>'+p.nom+'</b><small>'+p.d+'</small></span><span class="fb"><button class="btn sm" data-a="pack" data-id="'+p.id+'" data-k="cr" '+(okC?'':'disabled')+'>💰 '+fmt(p.cr)+'</button><button class="btn alt sm" data-a="pack" data-id="'+p.id+'" data-k="tok" '+(okT?'':'disabled')+'>🎟 '+p.tok+'</button></span></div>'; }).join('');
  return '<h3 class="pkh">🎲 Paquets aléatoires</h3><p class="note" style="margin-top:0">Tous les emplacements, tu prends ce qui tombe.</p>'+_pk40.apply(this,arguments)+'<h3 class="pkh">🎯 Paquets ciblés</h3><p class="note" style="margin-top:0">Tu choisis la catégorie de pièces à chasser.</p><div class="fpks">'+rows+'</div>'; };
