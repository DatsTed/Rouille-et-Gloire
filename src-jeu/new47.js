/* ---- v1.1 : navigation à 5 onglets, labo en page, croisement guidé, tout planter, fusion en masse, paquets ciblés, tri des épreuves, drag arcade ---- */

/* 1. barre du bas : Garage, Épreuves, Atelier, Marché, Missions (Cartes dans Marché ; Labo, Base, Équipe dans Atelier) */
(()=>{ TABS.length=0; [['garage', '🚗', 'Garage'],['epreuves', '🏁', 'Épreuves'],['atelier', '🛠️', 'Atelier'],['marche', '🛒', 'Marché'],['missions', '📜', 'Missions']].forEach(t=>TABS.push(t)); })();
const GRP_AT=['atelier','equipe','base'], GRP_MK=['marche','cartes'];
const labOpen47=()=>!!(sheet&&sheet.t==='ranch');
function swHTML(k,lab){
  const L=(typeof labLv==='function'?labLv():0)>=LAB_LVL;
  const b=(a,id,t,on)=>'<button data-a="'+a+'"'+(id?' data-id="'+id+'"':'')+(on?' aria-current="true"':'')+'>'+t+'</button>';
  if(k==='at') return '<div class="subtabs topsw">'+b('tab','atelier','🔨 Fabrication',view==='atelier'&&!lab)+b('tab','equipe','👥 Équipe',view==='equipe'&&!lab)+(S.age18===true?b('labopen',null,L?'🌿 Labo':'🔒 Labo',!!lab):'')+b('tab','base','🏗️ Base',view==='base'&&!lab)+'</div>';
  return '<div class="subtabs topsw">'+b('tab','marche','🛒 Boutique',view==='marche')+b('tab','cartes','🃏 Cartes',view==='cartes')+'</div>'; }
function labPage47(){
  const on=labOpen47()&&!document.body.classList.contains('hubmode'); document.body.classList.toggle('labpage',on);
  if(on){ const m=document.querySelector('main'), n=document.getElementById('nav'); if(m&&n){ const r=document.documentElement.style; r.setProperty('--topb',Math.round(m.getBoundingClientRect().top)+'px'); r.setProperty('--navb',Math.round(innerHeight-n.getBoundingClientRect().top)+'px'); } } }
function canCross47(){ try{ const F=farm(); const ks=STR.filter(s=>(F.seeds[s.id]||0)>0); return {n:ks.length,tot:ks.reduce((a,s)=>a+F.seeds[s.id],0),can:ks.length>=2||ks.reduce((a,s)=>a+F.seeds[s.id],0)>=2}; }catch(e){ return {n:0,tot:0,can:false}; } }
function emptySlots47(){ try{ const F=farm(), R=F.rooms[RY.tab]; return R?R.slots.map((s,i)=>s?-1:i).filter(i=>i>=0):[]; }catch(e){ return []; } }
function decorLab47(){
  const el=document.getElementById('sheet'); if(!el) return;
  if(!labOpen47()){ el.querySelectorAll('.topsw,.labtools').forEach(e=>e.remove()); return; }
  const grow=(RY.tab==='atelier'||RY.tab==='ranch')&&RY.slot==null, em=grow?emptySlots47().length:0;
  const key=(em>0?'p':'-')+(grow?'g':'-');
  let t=el.querySelector('.labtools');
  if(t&&t.dataset.k!==key){ t.remove(); t=null; el.querySelectorAll('.topsw').forEach(e=>e.remove()); }
  if(!el.querySelector('.topsw')) el.insertAdjacentHTML('afterbegin',swHTML('at',true)+'<div class="labtools" data-k="'+key+'"><button class="btn alt sm" data-a="crossopen">🧬 Croiser</button><button class="btn alt sm" data-a="strainopen">📖 Variétés</button>'+(em>0?'<button class="btn alt sm" data-a="rplantopen">🌱 Tout planter</button>':'')+'</div>'); }
function decorCross47(){
  if(!(sheet&&sheet.t==='cross')) return; const el=document.getElementById('sheet'); if(!el||el.querySelector('.crhow')) return;
  const c=canCross47(), n=el.querySelector('.note'); if(!n) return;
  n.insertAdjacentHTML('afterend','<div class="crhow"><b>Comment croiser ?</b><ol><li class="'+(c.can?'ok':'')+'">Aie des graines : 1 de deux variétés différentes (ou 2 de la même). Tu en as <b>'+c.tot+'</b>.</li><li>Choisis le <b>Parent A</b> et le <b>Parent B</b> ci-dessous.</li><li>Appuie sur <b>Croiser</b> (600 cr) : tu reçois 2 graines d’un hybride inédit, à planter dans le labo.</li></ol>'+(c.can?'':'<button class="btn wide" data-a="crossshop">🛒 Acheter des graines à la boutique du labo</button>')+'</div>'); }
function decor47(){ try{
  const nav=document.getElementById('nav');
  if(nav){ let g=view; if(GRP_AT.includes(view)||labOpen47()) g='atelier'; else if(GRP_MK.includes(view)) g='marche'; else if(view==='prep'||view==='result'||view==='race') g='epreuves';
    nav.querySelectorAll('button').forEach(b=>{ if(b.dataset.id===g) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }); }
  const v=document.getElementById('view');
  if(v){ v.querySelectorAll('.topsw').forEach(e=>e.remove()); const h=GRP_AT.includes(view)?swHTML('at',false):GRP_MK.includes(view)?swHTML('mk',false):''; if(h) v.insertAdjacentHTML('afterbegin',h); }
  decorLab47(); decorCross47(); decorFus47(); decorEq47(); labPage47(); if(view==='cartes'&&typeof pkFit==='function') pkFit(); }catch(e){ console.error('decor47',e); } }
const _rn47=render; render=function(){ const r=_rn47.apply(this,arguments); decor47(); return r; };
const _rsh47=renderSheet; renderSheet=function(){ const r=_rsh47.apply(this,arguments); try{ decorLab47(); decorCross47(); decorEq47(); labPage47(); }catch(e){ console.error('decor47s',e); } return r; };
setInterval(()=>{ try{ if(labOpen47()){ decorLab47(); labPage47(); } else if(document.body.classList.contains('labpage')) labPage47(); }catch(e){} },1000);
window.addEventListener('resize',()=>{ try{ labPage47(); }catch(e){} });
const _closeSheet47=closeSheet; closeSheet=function(){ const r=_closeSheet47.apply(this,arguments); try{ document.body.classList.remove('labpage'); }catch(e){} return r; };
const _tab47=ACT.tab;
ACT.tab=function(d){ const id=d&&d.id;
  if(id==='cross'){ ACT.crossopen(); return; }
  if(id==='crossshop'){ ACT.crossshop(); return; }
  if(labOpen47()&&id!=='labo'&&id!=='labstock'&&id!=='labnet'){ try{ closeSheet(); }catch(e){} }
  return _tab47.apply(this,arguments); };

/* 2. croisement : plus clair, et accessible depuis le labo */
ACT.crossshop=function(){ try{ ACT.labopen(); }catch(e){} if(!labOpen47()) return; RY.tab='shop'; RY.shop='seeds'; RY.slot=null; renderSheet(); try{ toast('Achète 1 graine de 2 variétés, puis reviens sur 🧬 Croiser'); }catch(e){} };
const _gn47=goalNext; goalNext=function(){ const r=_gn47.apply(this,arguments);
  if(r&&/^Croise deux/.test(r[1])){ const c=canCross47(); return c.can?['🧬','Croise 2 variétés : ouvre le croisement, choisis 2 parents puis touche « Croiser »','cross','Croiser ›']:['🧬','Pour croiser, il te faut des graines de 2 variétés : achète-les à la boutique du labo','crossshop','Boutique ›']; }
  return r; };

/* 3. labo : tout planter d'un coup */
const _rsv47=rSlotView;
rSlotView=function(room,i){ let h=_rsv47.apply(this,arguments);
  try{ const F=farm(), R=F.rooms[room], P=RY.pick||{}; if(!R||R.slots[i]||!/data-a="rplant"/.test(h)) return h;
    const em=R.slots.filter(s=>!s).length, seeds=P.sid?(F.seeds[P.sid]||0):0, mp=P.med&&MED[P.med]?MED[P.med].px:0, byCr=mp>0?Math.floor(S.cr/mp):99, n=Math.min(em,seeds,byCr);
    if(em<2) return h;
    const btn='<button class="btn wide alt" style="margin-top:8px" data-a="rplantall" '+((P.sid&&P.med&&(ROOMS[room].out||P.lamp))?'':'disabled')+'>🌱 Planter tous les pots vides'+(P.sid&&P.med?' ('+n+' sur '+em+')':' ('+em+')')+'</button>';
    return h.replace(/(<button class="btn wide" data-a="rplant"[^>]*>[^<]*<\/button>)/,'$1'+btn); }catch(e){ return h; } };
ACT.rplantopen=function(){ const em=emptySlots47(); if(!em.length) return toast('Aucun pot vide'); const F=farm(); if(!STR.some(s=>(F.seeds[s.id]||0)>0)) return toast('Tu n’as aucune graine : achète-en à la boutique'); ACT.rslot({id:String(em[0])}); try{ toast('Choisis variété, substrat et lampe, puis « Planter tous les pots vides »'); }catch(e){} };
ACT.rplantall=function(){
  const F=farm(), room=RY.tab, R=F.rooms[room]; if(!R) return; const P=Object.assign({},RY.pick||{});
  if(!P.sid||!P.med) return toast('Choisis d’abord une variété et un substrat');
  const idx=R.slots.map((s,i)=>s?-1:i).filter(i=>i>=0); let n=0, why='';
  for(const i of idx){
    if((F.seeds[P.sid]||0)<1){ why='plus de graines'; break; }
    const mp=MED[P.med].px; if(S.cr<mp){ why='pas assez de crédits'; break; }
    if(!ROOMS[room].out&&(F.lamps[P.lamp]||0)<1){ why='pas de lampe'; break; }
    RY.pick=Object.assign({},P); ACT.rplant({id:String(i)});
    if(!R.slots[i]){ why='substrat ou parcelle verrouillé(e)'; break; }
    n++; }
  RY.pick=null; RY.slot=null; try{ save(); }catch(e){} renderSheet();
  toast(n?(n+' pot'+(n>1?'s':'')+' planté'+(n>1?'s':'')+(idx.length>n?' · '+(idx.length-n)+' vide'+(idx.length-n>1?'s':'')+' ('+why+')':'')):('Rien planté : '+why)); };

/* 4. atelier : fusion en masse par rareté */
function fusPlan47(){ const free=atFree(); return RAR.slice(0,6).map((x,r)=>({r,n:free.filter(m=>m.r===r).length,k:Math.floor(free.filter(m=>m.r===r).length/5)})); }
function decorFus47(){
  if(view!=='atelier'||AT.tab!=='fus') return; const v=document.getElementById('view'); if(!v||v.querySelector('.fusall')) return;
  const plan=fusPlan47(), tot=plan.reduce((a,p)=>a+p.k,0), rows=v.querySelectorAll('.x-row.fu');
  rows.forEach((row,i)=>{ const p=plan[i]; if(!p||p.k<2) return; const b=row.querySelector('[data-a="fuse"]'); if(b) b.insertAdjacentHTML('afterend','<button class="btn sm alt" data-a="fuseall" data-id="'+p.r+'">Tout ×'+p.k+'</button>'); });
  const note=v.querySelector('.note'); const html='<button class="btn wide fusall" data-a="fuseall" data-id="all" '+(tot?'':'disabled')+'>✨ Tout fusionner'+(tot?' ('+tot+' fusion'+(tot>1?'s':'')+', '+plan.reduce((a,p)=>a+p.k*5,0)+' modules)':'')+'</button>';
  if(note) note.insertAdjacentHTML('beforebegin',html); else v.insertAdjacentHTML('beforeend',html); }
ACT.fuseall=function(d){
  const rs=d.id==='all'?[0,1,2,3,4,5]:[+d.id], made=[]; let used=0, per=[];
  for(const r of rs){ if(!(r>=0&&r<6)) continue; const pool=atFree().filter(m=>m.r===r&&!made.includes(m)).sort((a,b)=>a.q-b.q), k=Math.floor(pool.length/5); if(!k) continue;
    const take=pool.slice(0,k*5); S.mods=S.mods.filter(m=>!take.includes(m)); for(let j=0;j<k;j++){ const m=newMod(r+1,null,true); S.mods.push(m); made.push(m); } used+=k*5; per.push(k+' '+RAR[r+1].n); }
  if(!made.length) return toast('Pas assez de modules libres (5 de même rareté)');
  try{ bump('fuseN',made.length); }catch(e){} save(); render();
  toast(used+' modules fusionnés → '+per.join(', ')); openSheet({t:'open',cards:made.map(m=>m.u),i:0,pk:'p1'}); };

/* 5. paquets ciblés : de vrais paquets de cartes, rangés par rôle */
const FORD47=['f1','f2','f3','f4','f6','f5'];
const _pk47=packsHTML;
packsHTML=function(){ const h=_pk47.apply(this,arguments).replace('<p class="note" style="margin-top:0">Tous les emplacements, tu prends ce qui tombe.</p>',''); const i=h.lastIndexOf('<div class="fpks">'); if(i<0) return h;
  const list=FORD47.map(id=>FPACKS.find(p=>p.id===id)).filter(Boolean).concat(FPACKS.filter(p=>!FORD47.includes(p.id)));
  const cells=list.map(p=>{ const okC=S.cr>=p.cr, okT=S.tok>=p.tok, ic=(p.slots||[]).map(s=>{ const x=SLOTS.find(q=>q[0]===s); return x?'<i title="'+x[1]+'">'+x[2]+'</i>':''; }).join('');
    return '<div class="fcell">'+pack3d(p,-1).replace('class="pk"','class="pk st"')+'<div class="fsl">'+ic+'</div><small class="fd">'+p.d.replace(/^4 modules de /,'')+'</small><div class="fbt"><button class="btn sm" data-a="pack" data-id="'+p.id+'" data-k="cr" '+(okC?'':'disabled')+'>💰 '+fmt(p.cr)+'</button><button class="btn alt sm" data-a="pack" data-id="'+p.id+'" data-k="tok" '+(okT?'':'disabled')+'>🎟 '+p.tok+'</button></div></div>'; }).join('');
  return h.slice(0,i)+'<div class="fgrid">'+cells+'</div>'; };

/* 6. équiper les meilleures pièces : listes en 2 colonnes */
function decorEq47(){ try{ if(!sheet||(sheet.t!=='eqcar'&&sheet.t!=='eqmod')) return; const el=document.getElementById('sheet'); if(!el||el.querySelector('.eqg')) return;
  const rows=[...el.querySelectorAll(':scope>button.row')]; if(!rows.length) return; const g=document.createElement('div'); g.className='eqg'; rows[0].before(g); rows.forEach(r=>g.appendChild(r)); }catch(e){} }

/* 7. épreuves : tri par niveau puis par gain (sans toucher à l'ordre interne, qui sert à la difficulté) */
const _vEp47=vEpreuves;
vEpreuves=function(){ const f=EVENTS.filter; EVENTS.filter=function(fn){ return f.call(this,fn).sort((a,b)=>(a.lvl-b.lvl)||(a.gain-b.gain)); };
  try{ return _vEp47.apply(this,arguments); } finally{ delete EVENTS.filter; } };

/* 8. drag arcade (boules de boost) : un seul adversaire, couloirs cohérents, pas de changement de voie sur une voiture */
const _sm47=startManche;
startManche=function(i){ try{ const mn=R&&R.ev&&R.ev.manches[i]; if(mn&&mn.bon&&R.opps&&R.opps[i]&&R.opps[i].length>1){ R.opps[i]=R.opps[i].slice().sort((a,b)=>indice(b,mn)-indice(a,mn)).slice(0,1); } }catch(e){ console.error(e); }
  return _sm47.apply(this,arguments); };
const _ln47=ACT.lane;
ACT.lane=function(){ if(!RC||!RC.dbon||RC.done) return;
  if(RC.clock<0){ try{ flash('Attends le feu vert','#FF4D6D',.7); }catch(e){} return; }
  const P=RC.P, tl=-RC.laneT;
  const busy=RC.Os.some(o=>o.fin==null&&Math.abs(o.lane-tl)<1.7&&Math.abs(o.x-P.x)<7+Math.abs((o.v||0)-(P.v||0))*.5);
  if(busy){ try{ flash('Voie occupée','#FF4D6D',.7); navigator.vibrate&&navigator.vibrate(20); }catch(e){} return; }
  return _ln47.apply(this,arguments); };

/* 9. pastille du labo : sur l'onglet Atelier (Base et Labo n'ont plus de bouton dans la barre) */
function labAlert(){ try{ const s=labStat(); const nav=document.getElementById('nav'); if(!nav) return; const b=nav.querySelector('button[data-id="atelier"]'); if(!b) return; let d=b.querySelector('.dot.lab'); const need=s&&(s.ready||s.thirst||s.sick);
  if(need&&!d){ b.insertAdjacentHTML('beforeend','<i class="dot lab"></i>'); } else if(!need&&d) d.remove(); }catch(_){} }
